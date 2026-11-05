package evidence;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.zip.ZipFile;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import org.openlca.core.database.Derby;
import org.openlca.core.database.IDatabase;
import org.openlca.core.io.ImportLog;
import org.openlca.core.model.AllocationMethod;
import org.openlca.core.model.Callback;
import org.openlca.core.model.Direction;
import org.openlca.core.model.Flow;
import org.openlca.core.model.FlowType;
import org.openlca.core.model.ImpactCategory;
import org.openlca.core.model.ImpactMethod;
import org.openlca.core.model.ModelType;
import org.openlca.core.model.Process;
import org.openlca.core.model.ProcessLink;
import org.openlca.core.model.ProductSystem;
import org.openlca.core.model.ProviderType;
import org.openlca.core.model.Version;
import org.openlca.io.ilcd.input.Import;
import org.openlca.io.ilcd.output.Export;
import org.openlca.jsonld.input.JsonImport;
import org.openlca.jsonld.output.JsonExport;

public final class Probe {
  private static final String ARCHIVE_SHA =
      "a0890da2c89377d3edfa6a6505fa6ab7ad7eaf1bd628404821e3df5b32a7314b";
  private static final String GATE_SHA =
      "eaab71d29808d40c527f60057839177ed74f4b5f98942ea18827d15f604f8a91";
  private static final String MATERIAL = "8204f08f-f026-4ba8-a816-fe843517dd82";
  private static final String USAGE = "70ad1a92-18cd-4134-b1ee-d27de1b97b50";
  private static final String TREATMENT = "4b6417c7-3291-4c3b-8e55-36da2cae3353";
  private static final String WASTE = "3f93f187-dcb2-4149-9413-9ad7ca7d8d12";
  private static final String CML = "effb055a-ad78-39bd-8dc0-341411db4ae7";
  private static final String CO2 = "7ae371aa-8532-11e0-9d78-0800200c9a66";
  private static final Set<String> SELECTED_FLOWS = Set.of(WASTE, CO2,
      "a9d521d5-fe73-4726-830a-9d9aa0356b92", "a6ad3fc7-c019-454f-a899-43be7913a598",
      "cc6a1abb-b123-4ca6-8f16-38209df609be");

  public static void main(String[] args) throws Exception {
    if (args.length != 3 || !args[1].matches("[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}")
        || !args[2].matches("[0-9a-f]{64}")) {
      throw new IllegalArgumentException("Expected canonical inspection path, new run name and reviewed protocol SHA-256");
    }
    requirePlatform();
    var inspectionRun = Path.of(args[0]).toAbsolutePath().normalize();
    var runs = inspectionRun.getParent();
    if (!inspectionRun.equals(inspectionRun.toRealPath())
        || !inspectionRun.getFileName().toString().equals("bottle-inspect-04")
        || !runs.getFileName().toString().equals("runs")) {
      throw new IOException("Expected canonical harness/runs/bottle-inspect-04");
    }
    verifyHash(runs.getParent().resolve("README-probe.md"), args[2]);
    verifyHash(runs.resolve("../../../numerical-gate.md").normalize(), GATE_SHA);
    var inspection = inspectionRun.resolve("native/inspection.json");
    requireFile(inspection);
    var receipt = JsonParser.parseString(Files.readString(inspection)).getAsJsonObject();
    var source = inspectionRun.resolve("native/derby");
    if (!receipt.get("completed").getAsBoolean() || !receipt.get("stagedInputPreserved").getAsBoolean()
        || !receipt.get("mode").getAsString().equals("inspect-backup")
        || !receipt.get("inputSha256").getAsString().equals(ARCHIVE_SHA)
        || !source.equals(source.toRealPath()) || !Derby.isDerbyFolder(source.toFile())) {
      throw new IOException("The inspected source did not pass its input gate");
    }
    requireClosed(source);
    var treeHash = receipt.get("closedDatabaseTreeSha256").getAsString();
    if (!treeHash.equals(treeDigest(source, null))) {
      throw new IOException("Inspection database differs from its closed tree receipt");
    }
    verifyJar(receipt, "openLcaCore", Derby.class);
    verifyJar(receipt, "openLcaIo", Import.class);
    verifyJar(receipt, "olcaIlcd", org.openlca.ilcd.io.ZipStore.class);

    var output = Files.createDirectory(runs.resolve(args[1]));
    var clone = Files.createDirectory(output.resolve("source-derby"));
    System.setProperty("derby.stream.error.file", output.resolve("derby.log").toString());
    System.setProperty("jdk.xml.dtd.support", "deny");
    System.setProperty("javax.xml.accessExternalDTD", "");
    System.setProperty("javax.xml.accessExternalSchema", "");
    var cases = new ArrayList<Map<String, Object>>();
    var roundTrips = new ArrayList<Map<String, Object>>();
    var report = record("completed", false, "originalArchiveSha256", ARCHIVE_SHA,
        "numericalGateSha256", GATE_SHA, "probeProtocolSha256", args[2],
        "inspectionReceiptSha256", sha256(inspection), "inspectionDatabaseTreeSha256", treeHash,
        "runtime", Runtime.version().toString(), "os", System.getProperty("os.name"),
        "architecture", System.getProperty("os.arch"), "openLcaCore", receipt.get("openLcaCore"),
        "openLcaIo", receipt.get("openLcaIo"), "olcaIlcd", receipt.get("olcaIlcd"),
        "cases", cases, "roundTrips", roundTrips);
    try {
      if (!treeHash.equals(treeDigest(source, clone)) || !treeHash.equals(treeDigest(clone, null))
          || !Derby.isDerbyFolder(clone.toFile())) {
        throw new IOException("Fresh source database copy differs from the inspected tree");
      }
      requireClosed(source);
      try (var db = new Derby(clone.toFile())) {
        if (db.getVersion() != IDatabase.CURRENT_VERSION) {
          throw new IOException("Unexpected source schema");
        }
        var system = db.get(ProductSystem.class, MATERIAL);
        var method = db.get(ImpactMethod.class, CML);
        if (system == null || method == null || system.referenceExchange == null
            || system.referenceExchange.amount != 0.065 || system.targetAmount != 0.065
            || system.targetUnit == null || !"kg".equals(system.targetUnit.name)
            || !system.parameterSets.isEmpty() || system.processLinks.size() != 9) {
          throw new IllegalStateException("The qualified bottle settings changed");
        }
        report.put("sourceSystem", systemSnapshot(db, system));
        calculate(db, cases, "source-0.065", system, method);
        removeLink(db, cases, report, system, method);
        probeFactors(db, cases, system);
        roundTrip(db, output, cases, roundTrips, "original-target", system, method, true);
        roundTrip(db, output, cases, roundTrips, "original-target", system, method, false);
        var doubled = copyForControl(system);
        doubled.targetAmount = 0.13;
        calculate(db, cases, "source-0.13", doubled, method);
        roundTrip(db, output, cases, roundTrips, "doubled-target", doubled, method, true);
        roundTrip(db, output, cases, roundTrips, "doubled-target", doubled, method, false);
      }
      report.put("completed", cases.stream().allMatch(c -> Boolean.TRUE.equals(c.get("completed")))
          && roundTrips.stream().allMatch(t -> Boolean.TRUE.equals(t.get("completed"))));
    } catch (Exception e) {
      report.put("error", e.toString());
      throw e;
    } finally {
      var preserved = treeHash.equals(treeDigest(source, null));
      report.put("inspectionDatabasePreserved", preserved);
      Files.writeString(output.resolve("probe.json"), new GsonBuilder().setPrettyPrinting().serializeNulls()
          .create().toJson(report) + "\n", StandardOpenOption.CREATE_NEW);
      if (!preserved) {
        throw new IOException("Inspection database changed");
      }
    }
    if (!Boolean.TRUE.equals(report.get("completed"))) {
      throw new IllegalStateException("At least one control or native round trip failed");
    }
  }

  private static void removeLink(IDatabase db, List<Map<String, Object>> cases,
      Map<String, Object> report, ProductSystem system, ImpactMethod method) {
    var usage = db.get(Process.class, USAGE);
    var treatment = db.get(Process.class, TREATMENT);
    var waste = db.get(Flow.class, WASTE);
    if (usage == null || treatment == null || waste == null || waste.flowType != FlowType.WASTE_FLOW) {
      throw new IllegalStateException("Missing the qualified waste treatment records");
    }
    var exchange = usage.getExchange(4);
    if (exchange == null || exchange.isInput || exchange.flow == null
        || exchange.flow.id != waste.id || exchange.amount != 0.065) {
      throw new IllegalStateException("The qualified waste output exchange changed");
    }
    var reduced = copyForControl(system);
    var candidates = reduced.processLinks.stream().filter(link -> link.processId == usage.id
        && link.providerId == treatment.id && link.flowId == waste.id && link.exchangeId == exchange.id).toList();
    if (candidates.size() != 1) {
      throw new IllegalStateException("Expected exactly one saved link to remove");
    }
    var removed = candidates.getFirst();
    report.put("linkRemoval", record("removedLink", linkSnapshot(db, removed),
        "beforeLinkCount", reduced.processLinks.size(), "processDefaultProviderIdHeld", exchange.defaultProviderId));
    reduced.processLinks.remove(removed);
    calculate(db, cases, "removed-saved-waste-link", reduced, method);
  }

  private static ProductSystem copyForControl(ProductSystem source) {
    var copy = source.copy();
    // Preserve portable identity for comparison. The altered objects remain in memory.
    copy.refId = source.refId;
    return copy;
  }

  private static void probeFactors(IDatabase db, List<Map<String, Object>> cases, ProductSystem system) {
    var treatment = db.get(Process.class, TREATMENT);
    var matches = treatment.exchanges.stream().filter(e -> !e.isInput && e.flow != null
        && CO2.equals(e.flow.refId)).toList();
    if (matches.size() != 1 || matches.getFirst().unit == null || matches.getFirst().flowPropertyFactor == null) {
      throw new IllegalStateException("Expected one qualified treatment air-output CO2 exchange");
    }
    var exchange = matches.getFirst();
    var category = ImpactCategory.of("Author diagnostic, factor row presence", "diagnostic unit");
    category.direction = Direction.OUTPUT;
    category = db.insert(category);
    var method = db.insert(ImpactMethod.of("Author diagnostic, no environmental interpretation").add(category));
    for (var state : List.of("positive", "explicit-zero", "absent")) {
      category.impactFactors.clear();
      Double value = switch (state) {
        case "positive" -> 2.0;
        case "explicit-zero" -> 0.0;
        default -> null;
      };
      if (value != null) {
        var row = category.factor(exchange.flow, value);
        row.unit = exchange.unit;
        row.flowPropertyFactor = exchange.flowPropertyFactor;
      }
      category = db.update(category);
      var stored = db.get(ImpactCategory.class, category.refId);
      if (stored == null || stored.impactFactors.size() != (value == null ? 0 : 1)
          || value != null && stored.impactFactors.getFirst().value != value) {
        throw new IllegalStateException("The diagnostic factor row did not persist in state " + state);
      }
      method.impactCategories.set(0, stored);
      calculate(db, cases, "diagnostic-factor-" + state, system, method);
      cases.getLast().put("authorDiagnosticFactorValue", value);
      cases.getLast().put("authorDiagnosticFactorRowCount", stored.impactFactors.size());
    }
  }

  private static void calculate(IDatabase db, List<Map<String, Object>> cases, String label,
      ProductSystem system, ImpactMethod method) {
    System.err.println("PROBE calculate " + label);
    Calculate.runCase(db, cases, label, system, method, AllocationMethod.NONE,
        List.of(), null, SELECTED_FLOWS);
  }

  private static void roundTrip(IDatabase sourceDb, Path output, List<Map<String, Object>> cases,
      List<Map<String, Object>> trips, String variation, ProductSystem system, ImpactMethod method,
      boolean json) {
    var format = json ? "jsonld" : "eilcd";
    var label = format + "-" + variation;
    var trip = record("label", label, "completed", false,
        "format", json ? "native openLCA JSON-LD" : "native openLCA eILCD self-roundtrip",
        "exportScope", json ? "system plus original CML and references" : "system and references, LCI only",
        "source", systemSnapshot(sourceDb, system));
    trips.add(trip);
    try {
      var folder = Files.createDirectory(output.resolve(label));
      var archive = folder.resolve("export.zip");
      System.err.println("PROBE export " + label);
      if (json) {
        exportJson(sourceDb, archive, system, method, trip);
      } else {
        try (var store = new org.openlca.ilcd.io.ZipStore(archive.toFile())) {
          new Export(sourceDb, store).write(system);
        }
      }
      trip.put("archive", archiveManifest(archive, !json));
      System.err.println("PROBE import " + label);
      try (var target = new Derby(folder.resolve("import-derby").toFile())) {
        trip.put("importDatabaseSchema", target.getVersion());
        if (target.getVersion() != IDatabase.CURRENT_VERSION) {
          throw new IllegalStateException("Unexpected schema in the clean import database");
        }
        trip.put("initialProcessCount", target.getDescriptors(Process.class).size());
        trip.put("initialSystemCount", target.getDescriptors(ProductSystem.class).size());
        if (json) {
          importJson(target, archive, trip);
        } else {
          importEilcd(target, archive, trip);
        }
        var imported = target.get(ProductSystem.class, system.refId);
        trip.put("imported", systemSnapshot(target, imported));
        trip.put("finalProcessCount", target.getDescriptors(Process.class).size());
        trip.put("finalSystemCount", target.getDescriptors(ProductSystem.class).size());
        trip.put("finalFlowCount", target.getDescriptors(Flow.class).size());
        trip.put("finalImpactMethodCount", target.getDescriptors(ImpactMethod.class).size());
        var importedMethod = target.get(ImpactMethod.class, method.refId);
        trip.put("originalMethodInImport", methodSnapshot(importedMethod));
        if (imported == null || imported.referenceExchange == null
            || imported.referenceProcess == null || imported.targetUnit == null
            || imported.targetFlowPropertyFactor == null) {
          throw new IllegalStateException("Reimport lacks a usable saved reference");
        }
        if (json && importedMethod == null) {
          throw new IllegalStateException("JSON-LD reimport lacks the exported original CML method");
        }
        calculate(target, cases, label, imported, json ? importedMethod : null);
        trip.put("completed", cases.getLast().get("completed"));
      }
    } catch (Exception e) {
      trip.put("error", e.toString());
      e.printStackTrace(System.err);
    }
  }

  private static void exportJson(IDatabase source, Path archive, ProductSystem system, ImpactMethod method,
      Map<String, Object> trip) throws Exception {
    var events = new ArrayList<Map<String, Object>>();
    trip.put("exportEvents", events);
    Callback callback = (message, entity) -> events.add(record("type", message.type,
        "message", message.text, "error", message.error == null ? null : message.error.toString(),
        "uuid", entity == null ? null : entity.refId));
    try (var store = org.openlca.jsonld.ZipStore.open(archive.toFile())) {
      var export = new JsonExport(source, store).withReferences(true)
          .withDefaultProviders(true).skipExternalFiles(true);
      export.write(system, callback);
      export.write(method, callback);
      trip.put("referencedLibraries", export.getReferencedLibraries().stream().sorted().toList());
    }
  }

  private static void importJson(IDatabase target, Path archive, Map<String, Object> trip) throws Exception {
    var counts = new TreeMap<String, Integer>();
    trip.put("importCallbackCounts", counts);
    try (var store = org.openlca.jsonld.ZipStore.open(archive.toFile())) {
      var imp = new JsonImport(store, target).setCallback(entity -> {
        var type = entity instanceof org.openlca.core.model.RootEntity root ? ModelType.of(root) : null;
        counts.merge(type == null ? "unknown" : type.name(), 1, Integer::sum);
      });
      imp.run();
    }
  }

  private static void importEilcd(IDatabase target, Path archive, Map<String, Object> trip) throws Exception {
    var events = new ArrayList<Map<String, Object>>();
    trip.put("importEvents", events);
    try (var store = new org.openlca.ilcd.io.ZipStore(archive.toFile())) {
      var imp = Import.of(store, target).withAllFlows(true).withGabiGraphSupport(false);
      imp.log().listen(event -> events.add(record("state", event.state(), "message", event.message(),
          "uuid", event.descriptor() == null ? null : event.descriptor().refId)));
      imp.run();
      var counts = new LinkedHashMap<String, Integer>();
      for (var state : ImportLog.State.values()) {
        counts.put(state.name(), imp.log().countOf(state));
      }
      trip.put("importLogCounts", counts);
    }
  }

  private static Map<String, Object> archiveManifest(Path path, boolean xml) throws Exception {
    var memberGroups = new TreeMap<String, Integer>();
    var row = record("file", path.getFileName().toString(), "sha256", sha256(path),
        "bytes", Files.size(path), "memberGroups", memberGroups);
    try (var zip = new ZipFile(path.toFile())) {
      zip.stream().filter(member -> !member.isDirectory()).forEach(member -> {
        var name = member.getName();
        int end = name.lastIndexOf('/');
        memberGroups.merge(end < 0 ? "." : name.substring(0, end), 1, Integer::sum);
      });
      row.put("memberCount", zip.size());
      if (xml) {
        try {
          row.put("xmlNamespaces", xmlNamespaces(zip));
        } catch (Exception e) {
          row.put("xmlNamespaceScanError", e.toString());
        }
      }
    }
    return row;
  }

  private static Map<String, Object> xmlNamespaces(ZipFile zip) throws Exception {
    var namespaces = new TreeMap<String, Integer>();
    var openLcaNames = new TreeMap<String, Integer>();
    var schemaVersions = new TreeMap<String, Integer>();
    var factory = XMLInputFactory.newFactory();
    factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
    factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
    for (var member : zip.stream().filter(e -> !e.isDirectory() && e.getName().endsWith(".xml")).toList()) {
      try (var input = zip.getInputStream(member)) {
        var reader = factory.createXMLStreamReader(input);
        boolean root = true;
        try {
          while (reader.hasNext()) {
            if (reader.next() != XMLStreamConstants.START_ELEMENT) {
              continue;
            }
            if (root) {
              var version = reader.getAttributeValue(null, "version");
              if (version != null) {
                schemaVersions.merge(version, 1, Integer::sum);
              }
              root = false;
            }
            countXmlName(reader.getNamespaceURI(), reader.getLocalName(), namespaces, openLcaNames);
            for (int i = 0; i < reader.getAttributeCount(); i++) {
              countXmlName(reader.getAttributeNamespace(i), "@" + reader.getAttributeLocalName(i),
                  namespaces, openLcaNames);
            }
          }
        } finally {
          reader.close();
        }
      }
    }
    return record("usedNamespaces", namespaces, "openLcaExtensionNames", openLcaNames,
        "rootSchemaVersions", schemaVersions);
  }

  private static void countXmlName(String namespace, String name,
      Map<String, Integer> namespaces, Map<String, Integer> openLcaNames) {
    if (namespace == null || namespace.isBlank()) {
      return;
    }
    namespaces.merge(namespace, 1, Integer::sum);
    if (namespace.toLowerCase(Locale.ROOT).contains("openlca")) {
      openLcaNames.merge("{" + namespace + "}" + name, 1, Integer::sum);
    }
  }

  private static Map<String, Object> systemSnapshot(IDatabase db, ProductSystem system) {
    if (system == null) {
      return null;
    }
    var reference = system.referenceExchange;
    var unit = system.targetUnit;
    var factor = system.targetFlowPropertyFactor;
    var refProcess = system.referenceProcess;
    return record("uuid", system.refId, "version", Version.asString(system.version), "name", system.name,
        "targetAmount", system.targetAmount, "targetUnit", unit == null ? null : unit.name,
        "targetUnitUuid", unit == null ? null : unit.refId,
        "targetUnitConversion", unit == null ? null : unit.conversionFactor,
        "targetPropertyUuid", factor == null || factor.flowProperty == null ? null : factor.flowProperty.refId,
        "targetPropertyFactor", factor == null ? null : factor.conversionFactor,
        "referenceProcessUuid", refProcess == null ? null : refProcess.refId,
        "referenceProcessVersion", refProcess == null ? null : Version.asString(refProcess.version),
        "referenceExchangeInternalId", reference == null ? null : reference.internalId,
        "referenceExchangeAmount", reference == null ? null : reference.amount,
        "referenceFlowUuid", reference == null || reference.flow == null ? null : reference.flow.refId,
        "referenceExchangeInput", reference == null ? null : reference.isInput,
        "parameterSetCount", system.parameterSets.size(), "processCount", system.processes.size(),
        "linkCount", system.processLinks.size(),
        "processes", system.processes.stream().sorted().map(id -> {
          var p = db.getDescriptor(Process.class, id);
          return p == null ? record("localId", id, "missingProcess", true)
              : record("uuid", p.refId, "version", Version.asString(p.version), "name", p.name,
                  "processType", p.type, "localId", id);
        }).toList(),
        "links", system.processLinks.stream().map(link -> linkSnapshot(db, link)).toList());
  }

  private static Map<String, Object> linkSnapshot(IDatabase db, ProcessLink link) {
    var process = db.get(Process.class, link.processId);
    var provider = db.getDescriptor(ProviderType.toModelClass(link.providerType), link.providerId);
    var flow = db.getDescriptor(Flow.class, link.flowId);
    var exchange = process == null ? null : process.exchanges.stream()
        .filter(e -> e.id == link.exchangeId).findFirst().orElse(null);
    return record("processUuid", process == null ? null : process.refId, "providerUuid",
        provider == null ? null : provider.refId, "providerType", ProviderType.toModelType(link.providerType),
        "flowUuid", flow == null ? null : flow.refId,
        "flowVersion", flow == null ? null : Version.asString(flow.version),
        "exchangeInternalId", exchange == null ? null : exchange.internalId,
        "exchangeFlowUuid", exchange == null || exchange.flow == null ? null : exchange.flow.refId,
        "exchangeAmount", exchange == null ? null : exchange.amount,
        "exchangeInput", exchange == null ? null : exchange.isInput,
        "exchangeUnitUuid", exchange == null || exchange.unit == null ? null : exchange.unit.refId,
        "defaultProviderLocalId", exchange == null ? null : exchange.defaultProviderId,
        "defaultProviderUuid", exchange == null || exchange.defaultProviderId == 0 ? null
            : defaultProviderUuid(db, exchange.defaultProviderId, exchange.defaultProviderType));
  }

  private static String defaultProviderUuid(IDatabase db, long id, byte type) {
    var provider = db.getDescriptor(ProviderType.toModelClass(type), id);
    return provider == null ? null : provider.refId;
  }

  private static Map<String, Object> methodSnapshot(ImpactMethod method) {
    return method == null ? null : record("uuid", method.refId, "name", method.name,
        "version", Version.asString(method.version), "categoryCount", method.impactCategories.size(),
        "categories", method.impactCategories.stream().map(c -> record("uuid", c.refId,
            "version", Version.asString(c.version), "factorRowCount", c.impactFactors.size())).toList());
  }

  private static void requirePlatform() {
    var os = System.getProperty("os.name").toLowerCase(Locale.ROOT);
    var arch = System.getProperty("os.arch").toLowerCase(Locale.ROOT);
    var armMac = os.startsWith("mac") && (arch.equals("arm64") || arch.equals("aarch64"));
    var x64 = (os.startsWith("linux") || os.startsWith("windows"))
        && (arch.equals("x86_64") || arch.equals("amd64"));
    if (Runtime.version().feature() != 25 || !(armMac || x64)) {
      throw new IllegalStateException("Use Java 25 on macOS arm64, Linux x64 or Windows x64");
    }
  }

  private static void requireClosed(Path folder) throws IOException {
    for (var name : List.of("db.lck", "dbex.lck")) {
      if (Files.exists(folder.resolve(name), LinkOption.NOFOLLOW_LINKS)) {
        throw new IOException("The inspected Derby database is still open");
      }
    }
  }

  private static void requireFile(Path path) throws IOException {
    if (!path.equals(path.toRealPath()) || !Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)) {
      throw new IOException("Expected a canonical ordinary file: " + path);
    }
  }

  private static void verifyHash(Path path, String expected) throws Exception {
    requireFile(path);
    if (!expected.equals(sha256(path))) {
      throw new IOException("SHA-256 mismatch: " + path.getFileName());
    }
  }

  private static void verifyJar(JsonObject receipt, String key, Class<?> type) throws Exception {
    var file = Path.of(type.getProtectionDomain().getCodeSource().getLocation().toURI());
    var expected = receipt.getAsJsonObject(key);
    if (!file.getFileName().toString().equals(expected.get("jar").getAsString())) {
      throw new IOException("Different loaded jar: " + key);
    }
    verifyHash(file, expected.get("sha256").getAsString());
  }

  private static String treeDigest(Path root, Path copy) throws Exception {
    var digest = MessageDigest.getInstance("SHA-256");
    try (var paths = Files.walk(root)) {
      for (var path : paths.sorted(Comparator.comparing(p -> root.relativize(p).toString())).toList()) {
        if (path.equals(root)) {
          continue;
        }
        var relative = root.relativize(path);
        var destination = copy == null ? null : copy.resolve(relative);
        if (Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS)) {
          if (destination != null) {
            Files.createDirectory(destination);
          }
          digest.update(("directory\0" + relative + "\0").getBytes(StandardCharsets.UTF_8));
        } else {
          requireFile(path);
          if (destination != null) {
            Files.copy(path, destination, LinkOption.NOFOLLOW_LINKS);
          }
          digest.update(("file\0" + relative + "\0" + sha256(path) + "\0").getBytes(StandardCharsets.UTF_8));
        }
      }
    }
    return HexFormat.of().formatHex(digest.digest());
  }

  private static String sha256(Path path) throws Exception {
    var digest = MessageDigest.getInstance("SHA-256");
    try (var input = new DigestInputStream(Files.newInputStream(path), digest)) {
      input.transferTo(OutputStream.nullOutputStream());
    }
    return HexFormat.of().formatHex(digest.digest());
  }

  private static Map<String, Object> record(Object... pairs) {
    var row = new LinkedHashMap<String, Object>();
    for (int i = 0; i < pairs.length; i += 2) {
      row.put((String) pairs[i], pairs[i + 1]);
    }
    return row;
  }
}
