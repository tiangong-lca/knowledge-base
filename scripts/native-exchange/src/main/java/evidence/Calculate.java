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
import java.util.Objects;
import java.util.Set;
import org.openlca.core.database.Derby;
import org.openlca.core.database.IDatabase;
import org.openlca.core.math.SystemCalculator;
import org.openlca.core.matrix.index.EnviFlow;
import org.openlca.core.matrix.index.LongPair;
import org.openlca.core.matrix.index.TechFlow;
import org.openlca.core.matrix.index.TechIndex;
import org.openlca.core.matrix.solvers.JavaSolver;
import org.openlca.core.model.AllocationMethod;
import org.openlca.core.model.CalculationSetup;
import org.openlca.core.model.ImpactMethod;
import org.openlca.core.model.ParameterRedef;
import org.openlca.core.model.ParameterRedefSet;
import org.openlca.core.model.Process;
import org.openlca.core.model.ProcessLink;
import org.openlca.core.model.ProductSystem;
import org.openlca.core.model.Project;
import org.openlca.core.model.Version;
import org.openlca.core.model.descriptors.Descriptor;
import org.openlca.core.results.LcaResult;
import org.openlca.ilcd.io.ZipStore;
import org.openlca.io.ilcd.input.Import;

public final class Calculate {
  private static final String BOTTLE_SHA =
      "a0890da2c89377d3edfa6a6505fa6ab7ad7eaf1bd628404821e3df5b32a7314b";
  private static final String JRC_SHA =
      "590882f8bda2ec4f0fb3d0ad757001f0d9ac2ccef5a2f4e46cad2d8184c464d0";
  private static final String MATERIAL = "8204f08f-f026-4ba8-a816-fe843517dd82";
  private static final String OPPOSITE = "e6f91c97-21d9-44f7-8cf4-a9282cbd9500";
  private static final String BOTTLE_PROJECT = "44fe2047-a72c-44ad-9a6f-58d55428a40a";
  private static final String GATE_SHA =
      "eaab71d29808d40c527f60057839177ed74f4b5f98942ea18827d15f604f8a91";
  private static final String CML = "effb055a-ad78-39bd-8dc0-341411db4ae7";
  private static final String JRC = "10062015-184a-41b8-8fa6-49e999cbd101";
  private static final String MOULDING = "ecf3ceb8-1907-482e-8550-efd5c1f970e9";
  private static final Set<String> BOTTLE_FLOWS = Set.of(
      "a9d521d5-fe73-4726-830a-9d9aa0356b92", // freshwater Acenaphthene
      "a6ad3fc7-c019-454f-a899-43be7913a598", // ocean Acenaphthene
      "7ae371aa-8532-11e0-9d78-0800200c9a66", // air emission of carbon dioxide
      "cc6a1abb-b123-4ca6-8f16-38209df609be"  // carbon dioxide resource in air
  );
  private static final Set<String> JRC_FLOWS = Set.of(
      "0123d60d-1c78-4a38-9fa0-90b1b6c9491e", // process water
      "08a91e70-3ddc-11dd-924e-0050c2490048", // fossil CO
      "04202047-6556-11dd-ad8b-0800200c9a66", // hydro energy
      "4f1a3f41-7b3b-11dd-ad8b-0800200c9a66", // untreated wastewater
      "08a91e70-3ddc-11dd-923d-0050c2490048", // fossil CO2
      "4f197bf2-7b3b-11dd-ad8b-0800200c9a66", // tap water
      "9f8f445c-e172-49f6-8881-bcf2a9824588", // open washing waste
      "a1ff365a-b063-4993-9ddc-6c68dd45ff81"  // end-of-life machine flow
  );

  public static void main(String[] args) throws Exception {
    if (args.length != 3 || !args[2].matches("[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}")) {
      throw new IllegalArgumentException(
          "Expected calculate-bottle|calculate-eilcd, canonical inspection path and new run name");
    }
    requirePlatform();
    var bottle = switch (args[0]) {
      case "calculate-bottle" -> true;
      case "calculate-eilcd" -> false;
      default -> throw new IllegalArgumentException("Unknown mode " + args[0]);
    };
    var input = Path.of(args[1]).toAbsolutePath().normalize();
    if (!input.equals(input.toRealPath()) || !input.getParent().getFileName().toString().equals("runs")) {
      throw new IOException("Use the canonical inspection path in harness/runs");
    }
    var source = input.resolve("native/derby");
    var gate = input.getParent().resolve("../../../numerical-gate.md").normalize();
    requireOrdinary(gate);
    if (!GATE_SHA.equals(sha256(gate))) {
      throw new IOException("Numerical gate hash differs from the frozen plan");
    }
    var inspection = input.resolve("native/inspection.json");
    requireOrdinary(inspection);
    var receipt = JsonParser.parseString(Files.readString(inspection)).getAsJsonObject();
    var mode = bottle ? "inspect-backup" : "inspect-eilcd";
    var sourceSha = bottle ? BOTTLE_SHA : JRC_SHA;
    if (!receipt.get("completed").getAsBoolean() || !receipt.get("stagedInputPreserved").getAsBoolean()
        || !mode.equals(receipt.get("mode").getAsString())
        || !sourceSha.equals(receipt.get("inputSha256").getAsString())
        || !source.equals(source.toRealPath()) || !Derby.isDerbyFolder(source.toFile())) {
      throw new IOException("Inspection receipt or Derby folder failed the source gate");
    }
    requireOffline(source);
    var inspectedTree = receipt.get("closedDatabaseTreeSha256");
    if (inspectedTree == null || !inspectedTree.getAsString().equals(digestTree(source, null))) {
      throw new IOException("Database tree no longer matches the closed native inspection receipt");
    }
    verifyJar(receipt, "openLcaCore", Derby.class);
    verifyJar(receipt, "openLcaIo", Import.class);
    verifyJar(receipt, "olcaIlcd", ZipStore.class);

    var output = Files.createDirectory(input.getParent().resolve(args[2]));
    var clone = output.resolve("derby");
    System.setProperty("derby.stream.error.file", output.resolve("derby.log").toString());
    var cases = new ArrayList<Map<String, Object>>();
    var result = record("completed", false, "mode", args[0], "originalArchiveSha256", sourceSha,
        "inspectionRun", input.getFileName().toString(), "inspectionReceiptSha256", sha256(inspection),
        "numericalGateSha256", GATE_SHA, "sourceSchemaVersion", IDatabase.CURRENT_VERSION,
        "runtime", Runtime.version().toString(), "os", System.getProperty("os.name"),
        "architecture", System.getProperty("os.arch"),
        "openLcaCore", receipt.get("openLcaCore"), "openLcaIo", receipt.get("openLcaIo"),
        "olcaIlcd", receipt.get("olcaIlcd"), "cases", cases);
    var originalTree = digestTree(source, null);
    if (!originalTree.equals(inspectedTree.getAsString())) {
      throw new IOException("Inspection database changed before copying");
    }
    result.put("inspectionDbTreeSha256", originalTree);
    try {
      Files.createDirectory(clone);
      var cloneTree = digestTree(source, clone);
      if (!originalTree.equals(cloneTree) || !cloneTree.equals(digestTree(clone, null))
          || !Derby.isDerbyFolder(clone.toFile())) {
        throw new IOException("Fresh Derby clone differs from the inspected database");
      }
      requireOffline(source);
      try (var db = new Derby(clone.toFile())) {
        if (db.getVersion() != IDatabase.CURRENT_VERSION) {
          throw new IllegalStateException("Unexpected schema in the clone");
        }
        if (bottle) {
          bottle(db, cases);
        } else {
          eilcd(db, cases);
        }
      }
      result.put("completed", cases.stream().allMatch(c -> Boolean.TRUE.equals(c.get("completed"))));
    } catch (Exception e) {
      result.put("error", e.toString());
      throw e;
    } finally {
      var unchanged = originalTree.equals(digestTree(source, null));
      result.put("inspectionDbPreserved", unchanged);
      write(output.resolve("calculation.json"), result);
      if (!unchanged) {
        throw new IOException("Inspection database bytes changed");
      }
    }
    if (!Boolean.TRUE.equals(result.get("completed"))) {
      throw new IllegalStateException("One or more native calculation cases failed");
    }
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

  private static void requireOffline(Path source) throws IOException {
    for (var lock : List.of("db.lck", "dbex.lck")) {
      if (Files.exists(source.resolve(lock), LinkOption.NOFOLLOW_LINKS)) {
        throw new IOException("Source Derby database has a lock file");
      }
    }
  }

  private static void requireOrdinary(Path file) throws IOException {
    if (!file.equals(file.toRealPath()) || !Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS)) {
      throw new IOException("Expected an ordinary local file: " + file);
    }
  }

  private static String digestTree(Path root, Path copyTo) throws Exception {
    var tree = MessageDigest.getInstance("SHA-256");
    try (var paths = Files.walk(root)) {
      for (var path : paths.sorted(Comparator.comparing(p -> root.relativize(p).toString())).toList()) {
        if (path.equals(root)) {
          continue;
        }
        var relative = root.relativize(path);
        var target = copyTo == null ? null : copyTo.resolve(relative);
        if (Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS)) {
          if (target != null) {
            Files.createDirectory(target);
          }
          tree.update(("directory\0" + relative + "\0").getBytes(StandardCharsets.UTF_8));
        } else {
          requireOrdinary(path);
          if (target != null) {
            Files.copy(path, target, LinkOption.NOFOLLOW_LINKS);
          }
          tree.update(("file\0" + relative + "\0" + sha256(path) + "\0")
              .getBytes(StandardCharsets.UTF_8));
        }
      }
    }
    return HexFormat.of().formatHex(tree.digest());
  }

  private static String sha256(Path file) throws Exception {
    var sha = MessageDigest.getInstance("SHA-256");
    try (var input = new DigestInputStream(Files.newInputStream(file), sha)) {
      input.transferTo(OutputStream.nullOutputStream());
    }
    return HexFormat.of().formatHex(sha.digest());
  }

  private static void verifyJar(JsonObject receipt, String key, Class<?> type) throws Exception {
    var file = Path.of(type.getProtectionDomain().getCodeSource().getLocation().toURI());
    requireOrdinary(file);
    var expected = receipt.getAsJsonObject(key);
    if (!file.getFileName().toString().equals(expected.get("jar").getAsString())
        || !sha256(file).equals(expected.get("sha256").getAsString())) {
      throw new IOException("Loaded JAR differs from the inspection run: " + key);
    }
  }

  private static void bottle(IDatabase db, List<Map<String, Object>> cases) {
    var method = db.get(ImpactMethod.class, CML);
    if (method == null || method.impactCategories.isEmpty()) {
      throw new IllegalStateException("Missing the pinned CML method or categories");
    }
    var material = requireSystem(db, MATERIAL);
    var opposite = requireSystem(db, OPPOSITE);
    for (var system : List.of(material, opposite)) {
      if (system.targetAmount != 0.065 || !"kg".equals(system.targetUnit.name)
          || system.targetUnit.conversionFactor != 1.0
          || system.targetFlowPropertyFactor.conversionFactor != 1.0
          || !"83923145-9075-4eb3-aef4-54d1dc7b36c4".equals(system.referenceExchange.flow.refId)
          || system.referenceExchange.amount != 0.065 || system.referenceExchange.isInput) {
        throw new IllegalStateException("Bottle target differs from the frozen numerical gate");
      }
    }
    if (!material.parameterSets.isEmpty() || !opposite.parameterSets.isEmpty()) {
      throw new IllegalStateException("Unexpected saved parameter set on a bottle system");
    }
    var project = requireBottleProject(db, material, method);
    runCase(db, cases, "material-none", material, method,
        AllocationMethod.NONE, List.of(), null, BOTTLE_FLOWS);
    cases.getLast().put("matchingArchivedProjectUuid", project.refId);
    runCase(db, cases, "opposite-none", opposite, method,
        AllocationMethod.NONE, List.of(), null, BOTTLE_FLOWS);
    runCase(db, cases, "material-economic", material, method,
        AllocationMethod.ECONOMIC, List.of(), null, BOTTLE_FLOWS);
    cases.getLast().put("matchingArchivedProjectUuid", project.refId);
  }

  private static Project requireBottleProject(IDatabase db, ProductSystem material, ImpactMethod method) {
    var project = db.get(Project.class, BOTTLE_PROJECT);
    if (project == null || project.impactMethod == null || project.impactMethod.id != method.id
        || project.nwSet != null || project.isWithCosts || project.isWithRegionalization
        || project.variants.size() != 2) {
      throw new IllegalStateException("Archived Project settings no longer match the numerical gate");
    }
    for (var allocation : List.of(AllocationMethod.NONE, AllocationMethod.ECONOMIC)) {
      var matches = project.variants.stream().filter(v -> !v.isDisabled
          && v.allocationMethod == allocation && v.productSystem != null
          && v.productSystem.id == material.id && v.amount == material.targetAmount
          && v.unit != null && Objects.equals(v.unit.refId, material.targetUnit.refId)
          && v.flowPropertyFactor != null
          && v.flowPropertyFactor.id == material.targetFlowPropertyFactor.id
          && v.parameterRedefs.isEmpty()).count();
      if (matches != 1) {
        throw new IllegalStateException("Archived Project variant differs for " + allocation);
      }
    }
    return project;
  }

  private static void eilcd(IDatabase db, List<Map<String, Object>> cases) {
    var system = requireSystem(db, JRC);
    if (system.targetAmount != 1.0 || !"kg".equals(system.targetUnit.name)
        || system.targetUnit.conversionFactor != 1.0
        || system.targetFlowPropertyFactor.conversionFactor != 1.0
        || !"336b1168-c3ea-4b5c-9955-beb577f3c005".equals(system.referenceExchange.flow.refId)
        || system.referenceExchange.isInput
        || !"weight * 1.0".equals(system.referenceExchange.formula)) {
      throw new IllegalStateException("JRC target differs from the frozen numerical gate");
    }
    var baseline = baselineOf(system);
    if (baseline == null || !MOULDING.equals(system.referenceProcess.refId)
        || !baseline.parameters.stream().map(p -> p.name).sorted().toList()
            .equals(List.of("distance", "utilisation", "weight"))) {
      throw new IllegalStateException("Expected the imported JRC baseline parameters");
    }
    for (var parameter : baseline.parameters) {
      var expectedValue = switch (parameter.name) {
        case "distance" -> 200.0;
        case "utilisation" -> 0.6;
        case "weight" -> 0.2;
        default -> throw new IllegalStateException("Unexpected baseline parameter");
      };
      var expectedContext = parameter.name.equals("weight") ? MOULDING : "24b22ed7-6187-4bea-b8b1-eccbfc267cb9";
      var context = parameter.contextId == null ? null : db.getDescriptor(Process.class, parameter.contextId);
      if (parameter.value != expectedValue || parameter.contextType != org.openlca.core.model.ModelType.PROCESS
          || context == null || !expectedContext.equals(context.refId)) {
        throw new IllegalStateException("JRC override differs from frozen gate: " + parameter.name);
      }
    }
    var weight = baseline.parameters.stream().filter(p -> p.name.equals("weight")).findFirst().orElseThrow();
    if (weight.contextId == null || weight.contextId != system.referenceProcess.id) {
      throw new IllegalStateException("The weight override belongs to a different process");
    }
    var weightOne = weight.copy();
    weightOne.value = 1.0;
    var controlled = baseline.parameters.stream().map(p -> p == weight ? weightOne : p).toList();
    runCase(db, cases, "imported-baseline", system, null,
        AllocationMethod.NONE, baseline.parameters, baseline.name, JRC_FLOWS);
    runCase(db, cases, "omit-all-overrides", system, null,
        AllocationMethod.NONE, List.of(), null, JRC_FLOWS);
    runCase(db, cases, "weight-one-control", system, null,
        AllocationMethod.NONE, controlled, "Baseline with weight=1", JRC_FLOWS);
  }

  private static ProductSystem requireSystem(IDatabase db, String uuid) {
    var system = db.get(ProductSystem.class, uuid);
    if (system == null || system.referenceProcess == null
        || system.referenceExchange == null || system.referenceExchange.flow == null
        || system.targetUnit == null || system.targetFlowPropertyFactor == null
        || !Double.isFinite(system.targetAmount) || system.targetAmount == 0) {
      throw new IllegalStateException("Missing or unusable saved system reference: " + uuid);
    }
    return system;
  }

  private static ParameterRedefSet baselineOf(ProductSystem system) {
    var matches = system.parameterSets.stream().filter(set -> set.isBaseline).toList();
    if (matches.size() > 1) {
      throw new IllegalStateException("Multiple baseline parameter sets");
    }
    return matches.isEmpty() ? null : matches.getFirst();
  }

  static void runCase(IDatabase db, List<Map<String, Object>> cases, String label,
      ProductSystem system, ImpactMethod method, AllocationMethod allocation,
      List<ParameterRedef> parameters, String setName, Set<String> selectedFlows) {
    var setup = CalculationSetup.of(system)
        .withAllocation(allocation)
        .withRegionalization(false)
        .withCosts(false)
        .withImpactMethod(method)
        .withParameters(parameters)
        .withParameterSetName(setName);
    var row = record("label", label, "completed", false, "systemUuid", system.refId,
        "systemVersion", Version.asString(system.version), "systemName", system.name,
        "allocation", allocation, "regionalization", false, "costs", false, "normalizationWeighting", null,
        "impactMethodUuid", method == null ? null : method.refId,
        "impactMethodVersion", method == null ? null : Version.asString(method.version),
        "impactMethodName", method == null ? null : method.name,
        "targetAmount", setup.amount(), "targetUnit", setup.unit().name,
        "targetUnitUuid", setup.unit().refId, "targetUnitConversion", setup.unit().conversionFactor,
        "targetPropertyUuid", setup.flowPropertyFactor().flowProperty.refId,
        "targetPropertyFactor", setup.flowPropertyFactor().conversionFactor,
        "referenceExchangeInternalId", system.referenceExchange.internalId,
        "referenceProcessUuid", system.referenceProcess.refId, "referenceFlowUuid", setup.flow().refId,
        "parameterSet", setName, "parameterOverrides", parameters.stream()
            .map(p -> parameter(db, p)).toList());
    cases.add(row);
    try {
      var index = TechIndex.of(db, setup);
      row.put("preSolveTechDimension", index.size());
      row.put("storedLinks", links(db, system, index));
      row.put("storedNodeLocalIds", system.processes.stream().sorted().toList());
      row.put("sourceFactorRows", sourceFactors(method, selectedFlows));
      if (index.size() == 0 || index.size() > 100
          || index.stream().anyMatch(f -> !f.isProcess() || f.isFromLibrary())
          || system.processLinks.size() != index.getLinkedExchanges().size()) {
        throw new IllegalStateException("Unexpected tech graph size, providers, or unresolved link");
      }
      var solver = new JavaSolver();
      row.put("solver", solver.getClass().getName());
      var result = new SystemCalculator(db).withSolver(solver).calculate(setup);
      try {
        capture(row, result, selectedFlows, index.size());
        row.put("completed", true);
      } finally {
        result.dispose();
      }
    } catch (Exception e) {
      row.put("error", e.toString());
      e.printStackTrace(System.err);
    }
  }

  private static List<Map<String, Object>> links(
      IDatabase db, ProductSystem system, TechIndex index) {
    var output = new ArrayList<Map<String, Object>>();
    var ordered = system.processLinks.stream()
        .sorted(Comparator.comparingLong((ProcessLink link) -> link.processId)
            .thenComparingLong(link -> link.exchangeId))
        .toList();
    for (var link : ordered) {
      var process = db.get(Process.class, link.processId);
      var exchange = process == null ? null : process.exchanges.stream()
          .filter(e -> e.id == link.exchangeId).findFirst().orElse(null);
      var provider = index.getLinkedProvider(LongPair.of(link.processId, link.exchangeId));
      if (exchange == null || exchange.flow == null || exchange.flow.id != link.flowId
          || provider == null || provider.providerId() != link.providerId
          || provider.flowId() != link.flowId) {
        throw new IllegalStateException("Unresolved saved process link " + link.exchangeId);
      }
      output.add(record("process", descriptor(Descriptor.of(process)),
          "exchangeInternalId", exchange.internalId, "exchangeLocalId", exchange.id,
          "input", exchange.isInput, "avoided", exchange.isAvoided, "amount", exchange.amount,
          "formula", exchange.formula, "unit", exchange.unit == null ? null : exchange.unit.name,
          "defaultProviderLocalId", exchange.defaultProviderId, "provider", tech(provider),
          "providerTechIndex", index.of(provider)));
    }
    return output;
  }

  private static Map<String, Object> parameter(IDatabase db, ParameterRedef p) {
    var context = p.contextId != null && p.contextType != null
        && p.contextType == org.openlca.core.model.ModelType.PROCESS
        ? db.getDescriptor(Process.class, p.contextId) : null;
    return record("name", p.name, "value", p.value, "contextType", p.contextType,
        "contextLocalId", p.contextId, "context", descriptor(context));
  }

  private static List<Map<String, Object>> sourceFactors(ImpactMethod method, Set<String> selected) {
    if (method == null) {
      return List.of();
    }
    return method.impactCategories.stream().map(c -> record("category", descriptor(Descriptor.of(c)),
        "direction", c.direction, "referenceUnit", c.referenceUnit,
        "matches", c.impactFactors.stream()
            .filter(f -> f.flow != null && selected.contains(f.flow.refId))
            .map(f -> record("flowUuid", f.flow.refId, "locationUuid",
                f.location == null ? null : f.location.refId,
                "value", f.value, "formula", f.formula, "unitUuid", f.unit == null ? null : f.unit.refId,
                "unit", f.unit == null ? null : f.unit.name,
                "unitFactor", f.unit == null ? null : f.unit.conversionFactor,
                "propertyUuid", f.flowPropertyFactor == null || f.flowPropertyFactor.flowProperty == null
                    ? null : f.flowPropertyFactor.flowProperty.refId,
                "propertyFactor", f.flowPropertyFactor == null
                    ? null : f.flowPropertyFactor.conversionFactor))
            .toList()))
        .toList();
  }

  static void capture(Map<String, Object> row, LcaResult result,
      Set<String> selected, int expectedTechSize) {
    var p = result.provider();
    var tech = p.techIndex();
    var envi = p.enviIndex();
    var impact = p.impactIndex();
    int n = tech.size();
    int m = envi == null ? 0 : envi.size();
    int k = impact == null ? 0 : impact.size();
    if (n != expectedTechSize || m > 20_000 || k > 100 || (long) (n + k) * m > 1_000_000L) {
      throw new IllegalStateException("Unexpected native result dimensions");
    }
    row.put("providerClass", p.getClass().getName());
    row.put("dimensions", record("technology", n, "environmental", m, "impact", k));
    row.put("demand", record("techIndex", tech.of(p.demand().techFlow()),
        "techFlow", tech(p.demand().techFlow()), "signedAmount", finite(p.demand().value())));

    var techRows = new ArrayList<Map<String, Object>>(n);
    tech.each((i, t) -> techRows.add(record("index", i, "coordinate", tech(t),
        "activity", finite(p.scalingFactorOf(i)),
        "signedTotalRequirement", finite(p.totalRequirementsOf(i)))));
    row.put("technologyIndex", techRows);
    var enviRows = new ArrayList<Map<String, Object>>(m);
    if (envi != null) {
      envi.each((i, e) -> enviRows.add(record("index", i, "coordinate", envi(e))));
    }
    row.put("environmentalIndex", enviRows);
    var impactRows = new ArrayList<Map<String, Object>>(k);
    if (impact != null) {
      impact.each((i, c) -> impactRows.add(record("index", i, "category", descriptor(c),
          "referenceUnit", c.referenceUnit, "direction", c.direction)));
    }
    row.put("impactIndex", impactRows);

    row.put("matrixA", matrix(n, n, p::techValueOf));
    row.put("matrixB", matrix(m, n, p::unscaledFlowOf));
    row.put("matrixC", matrix(k, m, p::impactFactorOf));
    row.put("signedScalingVector", vector(p.scalingVector(), n));
    row.put("signedTotalInventory", vector(p.totalFlows(), m));
    row.put("totalImpacts", vector(p.totalImpacts(), k));
    row.put("selectedFlows", selected.stream().sorted().map(uuid ->
        selectedFlow(result, uuid)).toList());
  }

  private static Map<String, Object> selectedFlow(LcaResult result, String uuid) {
    var p = result.provider();
    var matches = new ArrayList<Map<String, Object>>();
    var index = p.enviIndex();
    if (index != null) {
      index.each((i, e) -> {
        if (uuid.equals(e.flow().refId)) {
          matches.add(selectedCoordinate(result, i, e));
        }
      });
    }
    return record("flowUuid", uuid, "coordinates", matches);
  }

  private static Map<String, Object> selectedCoordinate(LcaResult result, int row, EnviFlow e) {
    var p = result.provider();
    var byProcess = new ArrayList<Map<String, Object>>();
    var byImpact = new ArrayList<Map<String, Object>>();
    var impacts = p.impactIndex();
    if (impacts != null) {
      impacts.each((k, c) -> byImpact.add(record("impactIndex", k, "categoryUuid", c.refId,
          "signedFactor", finite(p.impactFactorOf(k, row)),
          "flowTotalContribution", finite(p.flowImpactOf(k, row)))));
    }
    p.techIndex().each((j, t) -> {
      double direct = finite(p.directFlowOf(row, j));
      var characterizedDirect = new ArrayList<Map<String, Object>>();
      if (impacts != null) {
        impacts.each((k, c) -> characterizedDirect.add(record("impactIndex", k, "categoryUuid", c.refId,
            "directFlowTimesFactor", finite(direct * p.impactFactorOf(k, row)))));
      }
      byProcess.add(record("techIndex", j, "coordinate", tech(t),
          "signedUnscaledIntervention", finite(p.unscaledFlowOf(row, j)),
          "signedDirectInventory", direct, "viewDirectInventory", finite(result.getDirectFlowOf(e, t)),
          "signedLoopAdjustedSupplyChainInventory", finite(p.totalFlowOf(row, j)),
          "directCharacterizedContribution", characterizedDirect));
    });
    return record("environmentalIndex", row, "coordinate", envi(e),
        "signedTotalInventory", finite(p.totalFlows()[row]),
        "viewTotalInventory", finite(result.getTotalFlowValueOf(e)),
        "byProcess", byProcess, "byImpact", byImpact);
  }

  private static Map<String, Object> tech(TechFlow t) {
    return record("provider", descriptor(t.provider()), "flow", descriptor(t.flow()),
        "flowType", t.flow().flowType, "providerType", t.providerType());
  }

  private static Map<String, Object> envi(EnviFlow f) {
    return record("flow", descriptor(f.flow()), "flowType", f.flow().flowType,
        "input", f.isInput(), "location", descriptor(f.location()),
        "locationCode", f.location() == null ? null : f.location().code,
        "virtual", f.isVirtual(), "wrapped", descriptor(f.wrapped()));
  }

  private static Map<String, Object> descriptor(Descriptor d) {
    return d == null ? null : record("uuid", d.refId, "name", d.name, "localId", d.id,
        "version", Version.asString(d.version), "type", d.type, "library", d.library);
  }

  private static double[][] matrix(int rows, int columns, Cell cell) {
    var values = new double[rows][columns];
    for (int i = 0; i < rows; i++) {
      for (int j = 0; j < columns; j++) {
        values[i][j] = finite(cell.get(i, j));
      }
    }
    return values;
  }

  private static double[] vector(double[] values, int length) {
    if (length == 0 && (values == null || values.length == 0)) {
      return new double[0];
    }
    if (values == null || values.length != length) {
      throw new IllegalStateException("Unexpected native vector length");
    }
    for (var value : values) {
      finite(value);
    }
    return values.clone();
  }

  private static double finite(double value) {
    if (!Double.isFinite(value)) {
      throw new IllegalStateException("Non-finite native value: " + value);
    }
    return value;
  }

  @FunctionalInterface
  private interface Cell {
    double get(int row, int column);
  }

  private static void write(Path file, Map<String, Object> receipt) throws IOException {
    Files.writeString(file, new GsonBuilder().serializeNulls().setPrettyPrinting().create()
        .toJson(receipt) + "\n", StandardOpenOption.CREATE_NEW);
  }

  private static Map<String, Object> record(Object... pairs) {
    var row = new LinkedHashMap<String, Object>();
    for (int i = 0; i < pairs.length; i += 2) {
      row.put((String) pairs[i], pairs[i + 1]);
    }
    return row;
  }
}
