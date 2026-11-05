package evidence;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.TreeSet;
import org.openlca.core.database.Derby;
import org.openlca.core.database.IDatabase;
import org.openlca.core.database.upgrades.Upgrades;
import org.openlca.core.database.upgrades.VersionState;
import org.openlca.core.io.ImportLog;
import org.openlca.core.math.ReferenceAmount;
import org.openlca.core.model.Exchange;
import org.openlca.core.model.Flow;
import org.openlca.core.model.FlowProperty;
import org.openlca.core.model.FlowPropertyFactor;
import org.openlca.core.model.ImpactCategory;
import org.openlca.core.model.ImpactMethod;
import org.openlca.core.model.Location;
import org.openlca.core.model.Parameter;
import org.openlca.core.model.ParameterRedef;
import org.openlca.core.model.ParameterScope;
import org.openlca.core.model.Process;
import org.openlca.core.model.ProcessLink;
import org.openlca.core.model.ProductSystem;
import org.openlca.core.model.Project;
import org.openlca.core.model.ProviderType;
import org.openlca.core.model.RefEntity;
import org.openlca.core.model.Result;
import org.openlca.core.model.RootEntity;
import org.openlca.core.model.Unit;
import org.openlca.core.model.Version;
import org.openlca.core.model.descriptors.RootDescriptor;
import org.openlca.ilcd.io.ZipStore;
import org.openlca.ilcd.models.Model;
import org.openlca.ilcd.util.DataSets;
import org.openlca.ilcd.util.Models;
import org.openlca.io.ilcd.input.Import;

public final class Inspect {
  private static final String BOTTLE_SHA =
      "a0890da2c89377d3edfa6a6505fa6ab7ad7eaf1bd628404821e3df5b32a7314b";
  private static final String JRC_SHA =
      "590882f8bda2ec4f0fb3d0ad757001f0d9ac2ccef5a2f4e46cad2d8184c464d0";
  private static final String[] BOTTLE_SYSTEMS = {
      "9f90af9e-5a4d-49e0-8c37-54bffa1c56cf", "785c1c0b-9c2a-4848-bc2a-6dd4d48458d4",
      "8204f08f-f026-4ba8-a816-fe843517dd82", "e6f91c97-21d9-44f7-8cf4-a9282cbd9500"
  };
  private static final String[] BOTTLE_TREATMENTS = {
      "4b6417c7-3291-4c3b-8e55-36da2cae3353", "62731390-8fbe-49c3-a353-0f2a4a5fc820"
  };
  private static final String CML_METHOD = "effb055a-ad78-39bd-8dc0-341411db4ae7";
  private static final String BOTTLE_PROJECT = "44fe2047-a72c-44ad-9a6f-58d55428a40a";
  private static final String JRC_MODEL = "10062015-184a-41b8-8fa6-49e999cbd101";
  private static final String JRC_RESULT_PROCESS = "a91683fe-3b0b-471c-a007-f9d8b4e29d5a";

  public static void main(String[] args) throws Exception {
    if (args.length != 2) {
      throw new IllegalArgumentException("Expected inspect-backup|inspect-eilcd and one prepared run path");
    }
    requireSupportedPlatform();
    var mode = args[0];
    var expected = switch (mode) {
      case "inspect-backup" -> BOTTLE_SHA;
      case "inspect-eilcd" -> JRC_SHA;
      default -> throw new IllegalArgumentException("Unknown mode " + mode);
    };
    var run = Path.of(args[1]).toAbsolutePath().normalize();
    if (!run.toRealPath().equals(run) || !Files.isDirectory(run, LinkOption.NOFOLLOW_LINKS)) {
      throw new IOException("Use the canonical run path printed by prepare.py");
    }
    requireOrdinaryFile(run.resolve("preflight.json"));
    var preflight = JsonParser.parseString(Files.readString(run.resolve("preflight.json"))).getAsJsonObject();
    if (!mode.equals(preflight.get("mode").getAsString())
        || !expected.equals(preflight.get("sha256").getAsString())
        || !preflight.get("allMemberCrcsVerified").getAsBoolean()) {
      throw new IOException("Preflight does not match this mode and input");
    }
    var input = run.resolve("input.zip");
    requireOrdinaryFile(input);
    if (!expected.equals(sha256(input))) {
      throw new IOException("Staged input differs from the pinned archive");
    }
    // Creating this directory is the run lock and rejects any repeat or preexisting path.
    var output = Files.createDirectory(run.resolve("native"));
    System.setProperty("derby.stream.error.file", output.resolve("derby.log").toString());
    var report = record("mode", mode, "inputSha256", expected, "completed", false,
        "javaVersion", Runtime.version().toString(),
        "os", System.getProperty("os.name"), "architecture", System.getProperty("os.arch"),
        "openLcaCore", codeSource(Derby.class),
        "openLcaIo", codeSource(Import.class), "olcaIlcd", codeSource(ZipStore.class));
    try {
      if (mode.equals("inspect-backup")) {
        inspectBackup(input, output.resolve("derby"), report);
      } else {
        inspectEilcd(input, output.resolve("derby"), report);
      }
      report.put("completed", true);
    } catch (Exception e) {
      report.put("error", e.toString());
      throw e;
    } finally {
      var preserved = expected.equals(sha256(input));
      report.put("stagedInputPreserved", preserved);
      var closedDatabase = output.resolve("derby");
      if (Derby.isDerbyFolder(closedDatabase.toFile())) {
        report.put("closedDatabaseTreeSha256", closedTreeDigest(closedDatabase));
      }
      Files.writeString(output.resolve("inspection.json"),
          new GsonBuilder().serializeNulls().setPrettyPrinting().create().toJson(report) + "\n",
          java.nio.file.StandardOpenOption.CREATE_NEW);
      if (!preserved) {
        throw new IOException("Staged input changed during native inspection");
      }
    }
  }

  private static void requireSupportedPlatform() {
    var os = System.getProperty("os.name").toLowerCase(Locale.ROOT);
    var arch = System.getProperty("os.arch").toLowerCase(Locale.ROOT);
    var arm64 = arch.equals("aarch64") || arch.equals("arm64");
    var x64 = arch.equals("amd64") || arch.equals("x86_64");
    if (Runtime.version().feature() != 25
        || !((os.startsWith("mac") && arm64)
            || ((os.startsWith("linux") || os.startsWith("windows")) && x64))) {
      throw new IllegalStateException("This inspection uses Java 25 on macOS arm64, Linux x64 or Windows x64");
    }
  }

  private static void requireOrdinaryFile(Path path) throws IOException {
    if (!Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)) {
      throw new IOException("Expected ordinary file: " + path);
    }
  }

  private static String sha256(Path file) throws Exception {
    var digest = MessageDigest.getInstance("SHA-256");
    try (var input = new DigestInputStream(Files.newInputStream(file), digest)) {
      input.transferTo(java.io.OutputStream.nullOutputStream());
    }
    return HexFormat.of().formatHex(digest.digest());
  }

  private static String closedTreeDigest(Path root) throws Exception {
    for (var lock : List.of("db.lck", "dbex.lck")) {
      if (Files.exists(root.resolve(lock), LinkOption.NOFOLLOW_LINKS)) {
        throw new IOException("Inspection database is not closed");
      }
    }
    var digest = MessageDigest.getInstance("SHA-256");
    try (var paths = Files.walk(root)) {
      for (var path : paths.sorted(Comparator.comparing(p -> root.relativize(p).toString())).toList()) {
        if (path.equals(root)) continue;
        var relative = root.relativize(path);
        if (Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS)) {
          digest.update(("directory\0" + relative + "\0").getBytes(StandardCharsets.UTF_8));
        } else {
          requireOrdinaryFile(path);
          digest.update(("file\0" + relative + "\0" + sha256(path) + "\0")
              .getBytes(StandardCharsets.UTF_8));
        }
      }
    }
    return HexFormat.of().formatHex(digest.digest());
  }

  private static Map<String, Object> codeSource(Class<?> type) throws Exception {
    var file = Path.of(type.getProtectionDomain().getCodeSource().getLocation().toURI());
    requireOrdinaryFile(file);
    return record("jar", file.getFileName().toString(), "sha256", sha256(file));
  }

  private static void inspectBackup(Path source, Path folder, Map<String, Object> report) {
    Derby.unzip(folder.toFile(), source.toFile());
    if (!Derby.isDerbyFolder(folder.toFile())) {
      throw new IllegalStateException("Restored directory is missing Derby's structure");
    }
    try (var db = new Derby(folder.toFile())) {
      var before = db.getVersion();
      var state = VersionState.get(db);
      var migration = record("initialSchemaVersion", before, "initialState", state,
          "expectedCurrentSchemaVersion", IDatabase.CURRENT_VERSION,
          "upgradeAttempted", state == VersionState.NEEDS_UPGRADE);
      report.put("migration", migration);
      switch (state) {
        case NEEDS_UPGRADE -> Upgrades.on(db);
        case UP_TO_DATE -> { }
        default -> throw new IllegalStateException("Unexpected Derby schema state " + state);
      }
      migration.put("actualFinalSchemaVersion", db.getVersion());
      if (db.getVersion() != IDatabase.CURRENT_VERSION) {
        throw new IllegalStateException("Schema upgrade did not reach the current version");
      }

      var selected = new TreeSet<Long>();
      report.put("allProductSystemDescriptors", db.getDescriptors(ProductSystem.class)
          .stream().map(Inspect::descriptor).toList());
      var systems = new ArrayList<Map<String, Object>>();
      report.put("productSystems", systems);
      for (var id : BOTTLE_SYSTEMS) {
        var system = db.get(ProductSystem.class, id);
        systems.add(system != null ? system(db, system) : record("uuid", id, "missing", true));
        if (system != null && system.referenceProcess != null) {
          selected.add(system.referenceProcess.id);
        }
      }
      for (var id : BOTTLE_TREATMENTS) {
        var process = db.get(Process.class, id);
        if (process != null) {
          selected.add(process.id);
        } else {
          throw new IllegalStateException("Missing selected treatment process " + id);
        }
      }
      var processes = selected.stream().map(id -> db.get(Process.class, id)).filter(Objects::nonNull).toList();
      report.put("processes", processes.stream().map(p -> process(db, p)).toList());
      report.put("globalParameters", globalParameters(db));
      report.put("project", project(db, db.get(Project.class, BOTTLE_PROJECT)));
      var cml = db.get(ImpactMethod.class, CML_METHOD);
      report.put("method", method(cml, processes));
      if (cml == null) {
        throw new IllegalStateException("Selected CML method is absent");
      }
      if (systems.subList(2, 4).stream().anyMatch(system -> Boolean.TRUE.equals(system.get("missing")))) {
        throw new IllegalStateException("One or more source-selected Usage systems are absent");
      }
    }
  }

  private static void inspectEilcd(Path input, Path folder, Map<String, Object> report) throws Exception {
    System.setProperty("jdk.xml.dtd.support", "deny");
    System.setProperty("javax.xml.accessExternalDTD", "");
    System.setProperty("javax.xml.accessExternalSchema", "");
    try (var store = new ZipStore(input.toFile()); var db = new Derby(folder.toFile())) {
      report.put("databaseSchemaVersion", db.getVersion());
      if (db.getVersion() != IDatabase.CURRENT_VERSION) {
        throw new IllegalStateException("Unexpected schema version for clean database");
      }
      var sourceModels = new ArrayList<Map<String, Object>>();
      report.put("sourceXmlModels", sourceModels);
      for (var model : store.iter(Model.class)) {
        sourceModels.add(model != null ? sourceModel(model) : record("decodeFailed", true));
      }
      var sourceProcesses = new ArrayList<Map<String, Object>>();
      report.put("sourceXmlProcesses", sourceProcesses);
      for (var process : store.iter(org.openlca.ilcd.processes.Process.class)) {
        sourceProcesses.add(process != null
            ? record("uuid", DataSets.getUUID(process), "datasetVersion", DataSets.getVersion(process),
                "schemaVersion", process.getSchemaVersion())
            : record("decodeFailed", true));
      }

      var events = new ArrayList<Map<String, Object>>();
      var imp = Import.of(store, db).withAllFlows(true).withGabiGraphSupport(false);
      imp.log().listen(event -> events.add(record("state", event.state(),
          "message", event.message(), "dataset", descriptor(event.descriptor()))));
      report.put("importEvents", events);
      report.put("importConfig", record("allFlows", true, "gabiGraphs", false, "flowMapping", false));
      imp.run();
      var counts = new LinkedHashMap<String, Integer>();
      for (var state : ImportLog.State.values()) {
        counts.put(state.name(), imp.log().countOf(state));
      }
      report.put("importLogCounts", counts);
      var model = db.get(ProductSystem.class, JRC_MODEL);
      report.put("productSystem", model != null ? system(db, model) : null);
      report.put("importedProcesses", db.getAll(Process.class).stream().map(p -> process(db, p)).toList());
      report.put("referencedResultProcess", entity(db.get(Process.class, JRC_RESULT_PROCESS)));
      report.put("importedResultCount", db.getDescriptors(Result.class).size());
      report.put("importedImpactMethodCount", db.getDescriptors(ImpactMethod.class).size());
      report.put("globalParameters", globalParameters(db));
      if (model == null || model.referenceExchange == null || model.referenceProcess == null) {
        throw new IllegalStateException("Imported model lacks its required system or quantitative reference");
      }
    }
  }

  private static Map<String, Object> sourceModel(Model model) {
    var ref = Models.getQuantitativeReference(model);
    return record("uuid", Models.getUUID(model), "datasetVersion", Models.getVersion(model),
        "schemaVersion", model.getSchemaVersion(), "origin", Models.getOrigin(model),
        "referenceInstance", ref != null ? ref.getRefProcess() : null,
        "instances", Models.getProcesses(model).stream().map(pi -> {
          var p = pi.getProcess();
          return record("instanceId", pi.getId(), "processUuid", p != null ? p.getUUID() : null,
              "processDatasetVersion", p != null ? p.getVersion() : null,
              "multiplicationFactor", pi.getMultiplicationFactor(), "scalingFactor", pi.getScalingFactor(),
              "parameters", pi.getParameters().stream()
                  .map(param -> record("name", param.getName(), "value", param.getValue())).toList(),
              "connections", pi.getConnections().stream().flatMap(connection -> connection.getDownstreamLinks()
                  .stream().map(link -> record("outputFlow", connection.getOutputFlow(),
                      "downstreamInstance", link.getProcess(), "downstreamFlow", link.getInputFlow(),
                      "downstreamLocation", link.getLocation(), "dominant", link.getDominant(),
                      "linkedExchange", link.getLinkedExchange()))).toList());
        }).toList());
  }

  private static Map<String, Object> system(IDatabase db, ProductSystem system) {
    var row = entity(system);
    row.put("referenceProcess", entity(system.referenceProcess));
    row.put("referenceExchange", exchange(db, system.referenceExchange));
    row.put("target", quantity(system.targetAmount, system.targetUnit, system.targetFlowPropertyFactor));
    row.put("cutoff", system.cutoff);
    row.put("processes", system.processes.stream().sorted().map(id -> node(db, id)).toList());
    row.put("links", system.processLinks.stream().sorted(
        Comparator.comparingLong((ProcessLink link) -> link.processId)
            .thenComparingLong(link -> link.exchangeId).thenComparingLong(link -> link.providerId))
        .map(link -> link(db, link)).toList());
    row.put("parameterSets", system.parameterSets.stream().map(set -> record("name", set.name,
        "baseline", set.isBaseline, "parameters", set.parameters.stream().map(p -> redefine(db, p)).toList()))
        .toList());
    return row;
  }

  private static Map<String, Object> link(IDatabase db, ProcessLink link) {
    var recipient = db.get(Process.class, link.processId);
    var provider = db.getDescriptor(ProviderType.toModelClass(link.providerType), link.providerId);
    var flow = db.getDescriptor(Flow.class, link.flowId);
    var linkedExchange = recipient == null ? null : recipient.exchanges.stream()
        .filter(e -> e.id == link.exchangeId).findFirst().orElse(null);
    return record("process", entity(recipient), "processLocalId", link.processId,
        "provider", descriptor(provider), "providerLocalId", link.providerId,
        "providerType", ProviderType.toModelType(link.providerType),
        "flow", descriptor(flow), "flowLocalId", link.flowId, "exchangeLocalId", link.exchangeId,
        "exchange", exchange(db, linkedExchange),
        "resolved", recipient != null && provider != null && flow != null && linkedExchange != null,
        "exchangeFlowMatchesLink", linkedExchange != null && linkedExchange.flow != null
            && linkedExchange.flow.id == link.flowId);
  }

  private static Map<String, Object> node(IDatabase db, long id) {
    var process = db.getDescriptor(Process.class, id);
    if (process != null) {
      return descriptor(process);
    }
    var system = db.getDescriptor(ProductSystem.class, id);
    if (system != null) {
      return descriptor(system);
    }
    var result = db.getDescriptor(Result.class, id);
    return result != null ? descriptor(result) : record("localId", id, "missing", true);
  }

  private static Map<String, Object> process(IDatabase db, Process p) {
    var row = entity(p);
    row.put("processType", p.processType);
    row.put("location", location(p.location));
    row.put("defaultAllocationMethod", p.defaultAllocationMethod);
    row.put("referenceExchange", exchange(db, p.quantitativeReference));
    row.put("exchanges", p.exchanges.stream().sorted(Comparator.comparingInt(e -> e.internalId))
        .map(e -> exchange(db, e)).toList());
    row.put("parameters", p.parameters.stream().map(Inspect::parameter).toList());
    row.put("allocationFactors", p.allocationFactors.stream().map(f -> record("method", f.method,
        "value", number(f.value), "formula", f.formula,
        "product", descriptor(db.getDescriptor(Flow.class, f.productId)),
        "exchangeInternalId", f.exchange != null ? f.exchange.internalId : null)).toList());
    return row;
  }

  private static Map<String, Object> exchange(IDatabase db, Exchange exchange) {
    if (exchange == null) {
      return null;
    }
    var provider = exchange.defaultProviderId == 0 ? null : db.getDescriptor(
        ProviderType.toModelClass(exchange.defaultProviderType), exchange.defaultProviderId);
    return record("localId", exchange.id, "internalId", exchange.internalId, "input", exchange.isInput,
        "avoided", exchange.isAvoided, "flow", flow(exchange.flow),
        "quantity", quantity(exchange.amount, exchange.unit, exchange.flowPropertyFactor),
        "formula", exchange.formula, "location", location(exchange.location),
        "defaultProviderLocalId", exchange.defaultProviderId, "defaultProvider", descriptor(provider),
        "defaultProviderType", ProviderType.toModelType(exchange.defaultProviderType));
  }

  private static Map<String, Object> flow(Flow flow) {
    if (flow == null) {
      return null;
    }
    var row = entity(flow);
    row.put("flowType", flow.flowType);
    row.put("cas", flow.casNumber);
    row.put("referenceProperty", property(flow.referenceFlowProperty));
    row.put("referenceUnit", unit(flow.getReferenceUnit()));
    return row;
  }

  private static Map<String, Object> property(FlowProperty property) {
    if (property == null) {
      return null;
    }
    var row = entity(property);
    row.put("unitGroup", entity(property.unitGroup));
    row.put("groupReferenceUnit", unit(property.getReferenceUnit()));
    return row;
  }

  private static Map<String, Object> quantity(double amount, Unit unit, FlowPropertyFactor factor) {
    return record("amount", number(amount), "unit", unit(unit),
        "property", property(factor != null ? factor.flowProperty : null),
        "propertyFactor", factor != null ? number(factor.conversionFactor) : null,
        "referenceAmountFromStoredValue", number(ReferenceAmount.get(amount, unit, factor)));
  }

  private static Map<String, Object> unit(Unit unit) {
    return unit == null ? null : record("uuid", unit.refId, "name", unit.name,
        "conversionFactor", number(unit.conversionFactor));
  }

  private static Map<String, Object> location(Location location) {
    if (location == null) {
      return null;
    }
    var row = entity(location);
    row.put("code", location.code);
    return row;
  }

  private static List<Map<String, Object>> globalParameters(IDatabase db) {
    return db.getAll(Parameter.class).stream().filter(p -> p.scope == ParameterScope.GLOBAL)
        .map(Inspect::parameter).toList();
  }

  private static Map<String, Object> parameter(Parameter p) {
    var row = entity(p);
    row.put("input", p.isInputParameter);
    row.put("value", number(p.value));
    row.put("formula", p.formula);
    row.put("scope", p.scope);
    return row;
  }

  private static Map<String, Object> redefine(IDatabase db, ParameterRedef p) {
    RootDescriptor context = null;
    if (p.contextId != null && p.contextType != null) {
      context = switch (p.contextType) {
        case PROCESS -> db.getDescriptor(Process.class, p.contextId);
        case IMPACT_CATEGORY -> db.getDescriptor(ImpactCategory.class, p.contextId);
        default -> null;
      };
    }
    return record("name", p.name, "value", number(p.value), "contextType", p.contextType,
        "contextLocalId", p.contextId, "context", descriptor(context));
  }

  private static Map<String, Object> project(IDatabase db, Project project) {
    if (project == null) {
      return record("uuid", BOTTLE_PROJECT, "missing", true);
    }
    var row = entity(project);
    row.put("impactMethod", entity(project.impactMethod));
    row.put("normalizationWeighting", entity(project.nwSet));
    row.put("regionalized", project.isWithRegionalization);
    row.put("withCosts", project.isWithCosts);
    row.put("variants", project.variants.stream().map(v -> record("name", v.name, "disabled", v.isDisabled,
        "productSystem", entity(v.productSystem), "allocation", v.allocationMethod,
        "target", quantity(v.amount, v.unit, v.flowPropertyFactor),
        "parameters", v.parameterRedefs.stream().map(p -> redefine(db, p)).toList())).toList());
    return row;
  }

  private static Map<String, Object> method(ImpactMethod method, List<Process> processes) {
    if (method == null) {
      return record("uuid", CML_METHOD, "missing", true);
    }
    var row = entity(method);
    row.put("code", method.code);
    var relevantFlows = new LinkedHashMap<String, Flow>();
    for (var process : processes) {
      for (var exchange : process.exchanges) {
        var flow = exchange.flow;
        if (flow == null || flow.name == null || flow.refId == null) {
          continue;
        }
        var name = flow.name.toLowerCase(Locale.ROOT);
        if (name.contains("acenaphthene") || name.contains("carbon dioxide")) {
          relevantFlows.putIfAbsent(flow.refId, flow);
        }
      }
    }
    row.put("selectedCandidateFlows", relevantFlows.values().stream().map(Inspect::flow).toList());
    row.put("categories", method.impactCategories.stream().map(c -> {
      var cat = entity(c);
      cat.put("referenceUnit", c.referenceUnit);
      cat.put("direction", c.direction);
      cat.put("sourceFactorRowCount", c.impactFactors.size());
      cat.put("parameters", c.parameters.stream().map(Inspect::parameter).toList());
      cat.put("candidateFactorRows", c.impactFactors.stream()
          .filter(f -> f.flow != null && relevantFlows.containsKey(f.flow.refId))
          .map(f -> record("flow", flow(f.flow), "location", location(f.location),
              "value", number(f.value), "formula", f.formula, "unit", unit(f.unit),
              "property", property(f.flowPropertyFactor != null ? f.flowPropertyFactor.flowProperty : null),
              "propertyFactor", f.flowPropertyFactor != null ? number(f.flowPropertyFactor.conversionFactor) : null))
          .toList());
      return cat;
    }).toList());
    return row;
  }

  private static Map<String, Object> entity(RefEntity e) {
    if (e == null) {
      return null;
    }
    var row = record("uuid", e.refId, "name", e.name, "localId", e.id);
    if (e instanceof RootEntity root) {
      row.put("version", Version.asString(root.version));
      row.put("category", root.category != null ? root.category.toPath() : null);
      row.put("library", root.library);
    }
    return row;
  }

  private static Map<String, Object> descriptor(RootDescriptor d) {
    return d == null ? null : record("uuid", d.refId, "name", d.name, "localId", d.id,
        "version", Version.asString(d.version), "type", d.type, "library", d.library);
  }

  private static Object number(double value) {
    return Double.isFinite(value) ? value : Double.toString(value);
  }

  private static Map<String, Object> record(Object... pairs) {
    var row = new LinkedHashMap<String, Object>();
    for (int i = 0; i < pairs.length; i += 2) {
      row.put((String) pairs[i], pairs[i + 1]);
    }
    return row;
  }
}
