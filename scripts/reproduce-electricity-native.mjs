import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { compileFunction } from "node:vm";

const tag = "4ae6eeb064d48246c62d3d1e8b3640ad9d4291a5";
const originalPreregistrationSha256 = "59adeb51904626221ec4ad51ac46a5ab3709d9b98de5ffe6c3e441bd48836f01";
// Fixed against the recorded native run. The original-artifact directory supplies bytes only.
const sourcePins = {
  "LICENSE": {
    "gitBlob": "1625c1793607996fcfc46420e8aa2f3d2b7efd1e",
    "sha256": "6d489af6292662d9e36d34ce49423784984a5f6e41d7b58f49b01264df59fa03",
    "bytes": 7047
  },
  "server/package.json": {
    "gitBlob": "e094a8e7a7a14af9760d45b4e9e5ba0ca44f113a",
    "sha256": "abe3584d72b03bc5175877b3fb37946960f2386c6db4c05df61e03f7ce2516e4",
    "bytes": 844
  },
  "server/app/config.js": {
    "gitBlob": "8d0ff1e1ef6e3367a73e41a4da90bae3bfff4921",
    "sha256": "d8ce138b74e574909b0bec605c329861c8ffceb0df69982ac8882616de86ce82",
    "bytes": 2052
  },
  "server/app/controllers.js": {
    "gitBlob": "09ada748d5db4f783e56c0ea9d18f6e74ee41e25",
    "sha256": "2da7ea9572a1c1be15895c317022010d561df9181920e692ed755ba620f3eaa3",
    "bytes": 2148
  },
  "server/app/calculations.js": {
    "gitBlob": "d38494e97bc7bd7447ee0dda9779b0e201b8873c",
    "sha256": "d6580ce91d0df1b6cc0dbee187aa961e71d41300ff3d4e44e3c9de882acb8691",
    "bytes": 11562
  },
  "client/package.json": {
    "gitBlob": "450cd81a9bdeb475141ab9c1f185bccc22fa60b6",
    "sha256": "84818b88b80b86050c0cf18c9b82b99efad8e61a0e73ece7c0f8e2fefe52938f",
    "bytes": 2146
  },
  "client/package-lock.json": {
    "gitBlob": "d1f8be437b79546e91dd23d0a45d86df973a0fb9",
    "sha256": "9f6d52d0cf7427af4e29a331de0233ac4d2e2c36601748639dc76742b9828887",
    "bytes": 452567
  },
  "client/src/redux/reducers/results.ts": {
    "gitBlob": "266840a820b9d705c98ab0244ca9d6730e7d1fef",
    "sha256": "158c711351aebe7e03697014f6937d21724a4f4e285091021be5496330a2a3e7",
    "bytes": 8747
  },
  "client/src/components/PowerEmissionsTable.tsx": {
    "gitBlob": "77290611efaf882922d25890908155a70ea033d0",
    "sha256": "839de15cbcdbad8a50b34a58250c4364cebee9ba7cf490b9c28610468934ee24",
    "bytes": 22499
  },
  "client/src/config.ts": {
    "gitBlob": "be4f1ab41edb7056e388d30a0b088a61e8237cf9",
    "sha256": "f0cfb9ed0b4e503be2d818232d52697352597cca06a97e4dac0ff8c25eab5e68",
    "bytes": 18079
  },
  "client/src/calculations/impacts.ts": {
    "gitBlob": "c853eb8be968f84267b930c5d618e3b8479ef9e3",
    "sha256": "2c06cfc47da58030ad24103135a227d9b7b4a5c5ab2548a42f34f70e6ae4ca4e",
    "bytes": 26157
  },
  "client/src/data/region-ev-hourly-limits.json": {
    "gitBlob": "e476075561481b9cd2056a5b27577813299db41a",
    "sha256": "1cfb12be64f3bc35e9830d06e35568cbe4efb04c73383f05cd090b583cbc6bac",
    "bytes": 223
  },
  "client/src/calculations/emissions.ts": {
    "gitBlob": "8897badd1c10ced0c948e7ad195225cfc548238b",
    "sha256": "41eeda807a5536bf2c5883097aebfda0a95345ddf307a1afde6a2d2d3df8f6bd",
    "bytes": 25383
  },
  "client/src/utilities.ts": {
    "gitBlob": "fb380b22fee660ddf57676c22c7553aec789cf43",
    "sha256": "d3761a9f3880b55a7f0d1a71cd2e48636689ee0607d97e4443f094bf7f4690df",
    "bytes": 711
  },
  "server/app/data/rdf_TE_2023.json": {
    "gitBlob": "768fd512c3a15f82b27c87ac3c70df963ea00566",
    "sha256": "5c6aad182b7ae4f7043b05675f859076d758e027d406c730ef023162b6552c85",
    "bytes": 4241433
  },
  "server/app/data/annual-emission-factors.json": {
    "gitBlob": "66a48a419665b2bc524acb26191bc7360416e8ef",
    "sha256": "eb7cd9b02bf9e97b6a1f55effd471d8dcd63feb13b1023c8eae63d422cca6d0d",
    "bytes": 9443932
  }
};
const dependencyPins = {
  "typescript": {
    "version": "5.4.3",
    "archiveSha256": "c1fe425dd986563370ea040a173022216ac93dc4d5e977e6f6d47539302f1090",
    "integrity": "sha512-KrPd3PKaCLr78MalgiwJnA25Nm8HAmdwN3mYUYZgG/wizIo9EainNVQI9/yDavtVFRN2h3k8uf3GLHuhDMgEHg==",
    "license": "Apache-2.0",
    "entry": "lib/typescript.js",
    "files": {
      "package.json": "4a63f421619738f89867599fa5cfa5e2a200ecd5e2d4f668e69a0b7561b38394",
      "lib/typescript.js": "d11c5c5a6f68774af19d1fc9d2c9aa3bb179d0bb2a78458a1ccf16638614443e"
    },
    "licenseFiles": [
      "LICENSE.txt",
      "ThirdPartyNoticeText.txt"
    ]
  },
  "stats-lite": {
    "version": "2.2.0",
    "archiveSha256": "8ed81c90ca1d45f1450314bf5fbcfd6568acbf6f17a1bab65fd4b80198a26787",
    "integrity": "sha512-/Kz55rgUIv2KP2MKphwYT/NCuSfAlbbMRv2ZWw7wyXayu230zdtzhxxuXXcvsc6EmmhS8bSJl3uS1wmMHFumbA==",
    "license": "MIT",
    "entry": "stats.js",
    "files": {
      "package.json": "4b242cf6b3e277ced8443643e73615c2011b670828cb2f30f1e90d9192635356",
      "stats.js": "e7568a31e38204267740e15c033a48fec6717fda2c9273772d89845885604c1c"
    },
    "licenseFiles": [
      "LICENSE"
    ]
  },
  "isnumber": {
    "version": "1.0.0",
    "archiveSha256": "94f1beac29b06672d9320a7411426c4f460291659c08133ae7584fc6f99b4b3d",
    "integrity": "sha1-Dj+XWbWB2Z3YUIbw7Cp0kJz63QE=",
    "license": "MIT",
    "entry": "index.js",
    "files": {
      "package.json": "ede7207135ff6be13d81fa8e8c1f623148460a53a42731e13e6ff5a7c41b35ef",
      "index.js": "272e2fc067c372f5a0968e92f287360117e38acdbeb1055d89e69abdb42938c2"
    },
    "licenseFiles": [
      "LICENSE"
    ]
  }
};

const [originalDirectory, dependencyDirectory, outputDirectory, batch] = process.argv.slice(2);
const usage = "Usage: node reproduce-electricity-native.mjs ORIGINAL_ARTIFACT_DIR PINNED_DEPENDENCY_DIR NEW_OUTPUT_DIR primary|secondary";
assert(
  process.argv.length === 6 && originalDirectory && dependencyDirectory &&
    outputDirectory && ["primary", "secondary"].includes(batch),
  usage,
);
assert.equal(process.version, "v20.20.2", "Replay requires the pinned Node v20.20.2 runtime");
assert(
  process.platform !== "darwin" || process.arch !== "x64",
  "macOS x64 is outside the workspace runtime targets",
);

const root = realpathSync(originalDirectory);
const dependencies = realpathSync(dependencyDirectory);
assert(statSync(root).isDirectory(), "Original artifacts must be a directory");
assert(statSync(dependencies).isDirectory(), "Pinned dependencies must be a directory");

const requestedOutput = path.resolve(outputDirectory);
assert(!lstatSync(requestedOutput, { throwIfNoEntry: false }), "Output directory must not exist");
const outputPath = path.join(realpathSync(path.dirname(requestedOutput)), path.basename(requestedOutput));
for (const inputDirectory of [root, dependencies]) {
  const relative = path.relative(inputDirectory, outputPath);
  assert(
    relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative),
    "Output directory must be outside the original artifact and dependency directories",
  );
}

const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
function readPinned(file, expected, label) {
  const bytes = readFileSync(file);
  assert.equal(sha256(bytes), expected, `SHA-256 mismatch for ${label}`);
  return bytes;
}

const originalBytes = new Map();
for (const [relative, pin] of Object.entries(sourcePins)) {
  const bytes = readPinned(path.join(root, relative), pin.sha256, relative);
  assert.equal(bytes.length, pin.bytes, `Byte length mismatch for ${relative}`);
  originalBytes.set(relative, bytes);
}
function originalFile(relative) {
  const bytes = originalBytes.get(relative);
  assert(bytes, `Original artifact is not pinned: ${relative}`);
  return bytes;
}

// Verify the registry archives and the extracted bytes that will actually run.
// All module evaluation below uses these already-verified buffers.
const dependencyHashes = {};
const dependencyCode = {};
const installed = path.join(dependencies, "node_modules");
for (const [name, pin] of Object.entries(dependencyPins)) {
  const archiveName = `${name}-${pin.version}.tgz`;
  const archive = readPinned(
    path.join(dependencies, "archives", archiveName), pin.archiveSha256, archiveName,
  );
  const [algorithm, expectedIntegrity] = pin.integrity.split("-", 2);
  assert.equal(
    createHash(algorithm).update(archive).digest("base64"),
    expectedIntegrity,
    `Lock integrity mismatch for ${name}`,
  );
  const directory = path.join(installed, name);
  const pkg = JSON.parse(readPinned(path.join(directory, "package.json"), pin.files["package.json"], `${name}/package.json`));
  assert.equal(pkg.name, name);
  assert.equal(pkg.version, pin.version);
  assert.equal(pkg.license, pin.license);
  const entryPath = path.join(directory, pin.entry);
  dependencyCode[name] = {
    entryPath,
    source: readPinned(entryPath, pin.files[pin.entry], `${name}/${pin.entry}`).toString("utf8"),
  };
  dependencyHashes[name] = {
    version: pin.version,
    archiveSha256: pin.archiveSha256,
    integrity: pin.integrity,
    license: pin.license,
    executedEntrySha256: pin.files[pin.entry],
  };
}

function loadCommonJs(source, file, loadDependency) {
  const module = { exports: {} };
  const evaluate = compileFunction(
    source, ["exports", "module", "require", "__filename", "__dirname"], { filename: file },
  );
  evaluate(module.exports, module, loadDependency, file, path.dirname(file));
  return module.exports;
}
function denyDependency(specifier) {
  throw new Error(`Unexpected module request: ${specifier}`);
}
const compilerBuiltins = new Set(["buffer", "crypto", "fs", "os", "path", "perf_hooks"]);
const requireBuiltin = createRequire(import.meta.url);
const compiler = dependencyCode.typescript;
const ts = loadCommonJs(compiler.source, compiler.entryPath, specifier =>
  compilerBuiltins.has(specifier) ? requireBuiltin(`node:${specifier}`) : denyDependency(specifier),
);
assert.equal(ts.version, dependencyPins.typescript.version);

const numberModule = dependencyCode.isnumber;
const isnumber = loadCommonJs(numberModule.source, numberModule.entryPath, denyDependency);
const statsModule = dependencyCode["stats-lite"];
const stats = loadCommonJs(statsModule.source, statsModule.entryPath, specifier =>
  specifier === "isnumber" ? isnumber : denyDependency(specifier),
);

const expectedEmittedHashes = {
  "config.ts": "c9e6fad46a740f90f1717b041937a07be571a55a63d5191ce46f7a909a4490dd",
  "calculations/impacts.ts": "2a27d3c5de36cd6970e93989e9f01a50d1f24a28736608f69f43f11d7c2a5944",
  "calculations/emissions.ts": "4b326f6a8785f8ee2ee7f4825c94115281889638124273cd69ae176b52b2b15c",
  "utilities.ts": "e998338aa3c78a04a13f60762aedefd2512601390b099cf3c61b3139870c35ca",
};
const cache = new Map();
const compiled = new Map();
function loadClient(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const file = `client/src/${relative}`;
  const source = originalFile(file).toString("utf8");
  if (relative.endsWith(".json")) {
    const data = JSON.parse(source);
    cache.set(relative, data);
    return data;
  }

  let compileInput = source;
  if (relative === "utilities.ts") {
    // Select the exact numeric helper declaration and omit the unrelated UI CSS initializer.
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true);
    const helpers = ast.statements.filter(statement =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === "sortObjectByKeys",
    );
    assert.equal(helpers.length, 1);
    compileInput = helpers[0].getText(ast);
  }
  const { outputText, diagnostics } = ts.transpileModule(compileInput, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      newLine: ts.NewLineKind.LineFeed,
    },
    reportDiagnostics: true,
  });
  const errors = diagnostics.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, "\n")).join("\n"));
  assert.equal(sha256(outputText), expectedEmittedHashes[relative], `Emitted client JS mismatch for ${relative}`);
  compiled.set(relative, outputText);
  const exports = loadCommonJs(outputText, file, specifier => {
    if (specifier === "stats-lite") return stats;
    if (specifier.startsWith("@/")) {
      const clientPath = specifier.slice(2);
      return loadClient(path.extname(clientPath) ? clientPath : `${clientPath}.ts`);
    }
    return denyDependency(specifier);
  });
  cache.set(relative, exports);
  return exports;
}
function loadServer(relative) {
  return loadCommonJs(originalFile(relative).toString("utf8"), relative, denyDependency);
}
const { regions } = loadClient("config.ts");
const { calculateHourlyImpacts, calculateHourlyChangesValidation } = loadClient("calculations/impacts.ts");
const { calculateAggregatedEmissionsData } = loadClient("calculations/emissions.ts");
const { calculateEmissionsChanges } = loadServer("server/app/calculations.js");
const sc = loadServer("server/app/config.js");
const rdf = JSON.parse(originalFile(`server/app/data/${sc.regions.TE.rdf}`));
const neiData = JSON.parse(originalFile("server/app/data/annual-emission-factors.json"));
const hourlyLimit = loadClient("data/region-ev-hourly-limits.json").TE;
const year = sc.year;
const region = regions.TE;
assert.equal(year,2023);
assert.equal(rdf.run.year,year);
assert.equal(rdf.region.region_abbv,"TE");
assert.equal(rdf.regional_load.length,8760);
assert.equal(region.lineLoss,0.0457913819880058);
assert.equal(Object.keys(region.actualEmissions).length,0);
const regionalLoad = rdf.regional_load;
regionalLoad.forEach((r,i) => {
  assert.equal(r.year,year);
  assert.equal(r.hour_of_year,i+1);
  assert(Number.isFinite(r.regional_load_mw));
});
const fields=["generation","so2","nox","co2","pm25","vocs","nh3"];
const loadMin = rdf.load_bin_edges[0];
const loadMax = rdf.load_bin_edges.at(-1);
assert.equal(hourlyLimit, loadMax);
const eguid = e => `${e.state}_${e.orispl_code}_${e.unit_code}`;
const inputFlags = Object.fromEntries(Object.entries(rdf.data).map(([k,v])=>[k,v.filter(e=>e.infreq_emissions_flag===1).map(eguid)]));
const unitIds = rdf.data.generation.map(eguid);
assert.equal(new Set(unitIds).size, unitIds.length);
for (const [key, series] of Object.entries(rdf.data)) {
  assert.equal(series.length,unitIds.length,key);
  assert(series.every((r,i)=>eguid(r)===unitIds[i]), "RDF data order differs for "+key);
  assert(series.every(r=>r.medians.length===rdf.load_bin_edges.length && r.medians.every(Number.isFinite)),key);
}

const regionalNEI = neiData.regions.find(x=>x.name===rdf.region.region_name)?.egus;
assert(Array.isArray(regionalNEI));
const neiDiagnostics={inputs:regionalNEI.length, exactKeyAndYearMatches:0, noMatch:[], missingByPollutant:{pm25:[],vocs:[],nh3:[]}};
for (const egu of rdf.data.heat) {
  const match = regionalNEI.find(n=>n.orispl_code===egu.orispl_code && n.unit_code===egu.unit_code);
  const rec = match?.annual_data.find(d=>d.year===year);
  if (!rec) neiDiagnostics.noMatch.push(eguid(egu));
  else neiDiagnostics.exactKeyAndYearMatches++;
  for (const f of Object.keys(neiDiagnostics.missingByPollutant)) {
    if (!Number.isFinite(rec?.[f])) neiDiagnostics.missingByPollutant[f].push(eguid(egu));
  }
}
mkdirSync(outputPath);
const write = (name, x) => {
  const b = JSON.stringify(x,null,2)+"\n";
  writeFileSync(path.join(outputPath,name),b,{flag:"wx"});
  return sha256(b);
};
const prepHashes = Object.fromEntries([...compiled.entries()].map(([key, val])=>[key,sha256(val)]));
const scenarios = batch === "primary" ? [
  {id:"zero",constantMwh:0},
  {id:"flat-one-mwh-per-hour",constantMwh:1},
] : [
  {id:"july1-03h-100mwh",constantMwh:0,selectedHour:4348, selectedEndUseMwh:100},
  {id:"july1-16h-100mwh",constantMwh:0,selectedHour:4361, selectedEndUseMwh:100},
];
const observed = [];

for (const scenario of scenarios) {
  const top = Array(regionalLoad.length).fill(0);
  if(scenario.selectedHour!==undefined) top[scenario.selectedHour-1]=-scenario.selectedEndUseMwh;
  const hourlyImpacts=calculateHourlyImpacts({
    lineLoss:region.lineLoss, regionalLoad,
    hourlyRenewableEnergyProfiles:[], hourlyEnergyStorageData:[], hourlyEVLoad:[],
    hourlyTopPercentReduction:top,annualGwh:0,constantMwh:scenario.constantMwh,
  });
  const impacts = Object.values(hourlyImpacts);
  assert.equal(impacts.length,8760);
  const hourlyChanges=impacts.map(x=>x.impactsLoad);
  const totalRequestedEndUse = -impacts.reduce((v,r)=>v+r.finalRooftop,0);
  const totalRequestedChange = hourlyChanges.reduce((a,b)=>a+b,0);
  const affected = regionalLoad.filter((_,i)=>hourlyChanges[i]!==0);
  const displayValidation=calculateHourlyChangesValidation({
    regions,
    regionalHourlyImpacts:{TE:{regionalLoad,hourlyImpacts}},
  });
  assert.deepEqual(Object.values(displayValidation), [null,null,null]);
  const boundary={minimum:loadMin,maximum:loadMax,clientUpperLimit:hourlyLimit,skippedRdfRows:[],exactUpperEdge:[],nonfinite:[]};
  for(const [i,r] of regionalLoad.entries()) {
    const adjusted=r.regional_load_mw+hourlyChanges[i];
    if (!Number.isFinite(adjusted)) boundary.nonfinite.push(r.hour_of_year);
    if(r.regional_load_mw<loadMin || r.regional_load_mw>loadMax || adjusted<loadMin || adjusted>loadMax)
      boundary.skippedRdfRows.push(r.hour_of_year);
    if(r.regional_load_mw===loadMax || adjusted===loadMax)
      boundary.exactUpperEdge.push(r.hour_of_year);
  }
  assert.equal(boundary.skippedRdfRows.length,0);
  assert.equal(boundary.nonfinite.length,0);
  assert.equal(boundary.exactUpperEdge.length,0);
  const inputSHA=write(`${scenario.id}-input.json`,{
    year,region:"TE",regionScaling:1,constantMwh:scenario.constantMwh,
    annualGwh:0,noOtherResources:true,lineLoss:region.lineLoss,
    syntheticTopPercentArrayUsedAsSingleHourProfile:scenario.selectedHour!==undefined,
    hourlyChanges,affectedRdfRows:affected.length===1?affected:null,
  });
  const originalEGUs = calculateEmissionsChanges({year,rdf,neiData,hourlyChanges});
  assert.equal(Object.keys(originalEGUs).length,unitIds.length);
  const rawNonfinite=[], replacementFlags=[], missingMonths=[];
  for (const [k,v] of Object.entries(originalEGUs)) {
    if(v.emissionsFlags.length!==0) replacementFlags.push([k,v.emissionsFlags]);
    for (const f of fields) {
      for(let m=1;m<=12;m++) {
        const row=v.data[f][m];
        if(!row) missingMonths.push([k,f,m]);
        else if(!Number.isFinite(row.original)||!Number.isFinite(row.postEere)) rawNonfinite.push([k,f,m]);
        else if(scenario.id==="zero") assert.equal(row.original,row.postEere, k+" "+f+" "+m);
      }
    }
  }
  assert.equal(rawNonfinite.length,0);
  assert.equal(missingMonths.length,0);
  assert.equal(replacementFlags.length,0);
  const rawSHA=write(`${scenario.id}-native-egu.json`,originalEGUs);
  const aggregated=calculateAggregatedEmissionsData(originalEGUs);
  const units={generation:"MWh",so2:"lb",nox:"lb",co2:"US-short-ton",pm25:"lb",vocs:"lb",nh3:"lb"};
  const regional={};
  for(const f of fields) {
    const pow=aggregated.regions.TE[f].power;
    const {original,postEere}=pow.annual;
    const sumOfMonthlyDeltas=Object.values(pow.monthly).reduce((a,r)=>a+(r.postEere-r.original),0);
    const sumOfEguMonthlyDeltas=Object.values(originalEGUs).reduce((v,e)=>v+Object.values(e.data[f]).reduce((a,r)=>a+(r.postEere-r.original),0),0);
    regional[f]={units:units[f],original,postEere,deltaByAnnualSubtraction:postEere-original,
      deltaByOriginalWebUiMonthlyPath:sumOfMonthlyDeltas,sumOfEguMonthlyDeltas,
    };
  }
  if (scenario.id==="zero") for(const r of Object.values(regional)) {
    assert.equal(r.deltaByAnnualSubtraction,0);
    assert.equal(r.deltaByOriginalWebUiMonthlyPath,0);
    assert.equal(r.sumOfEguMonthlyDeltas,0);
  }

  const annualEguCo2={strictPositive:0,strictNegative:0,exactZero:0,aboveTolerance:0,belowNegativeTolerance:0,withinTolerance:0,toleranceShortTons:1e-9, largestPositive:null, largestNegative:null};
  for (const [k, egu] of Object.entries(originalEGUs)) {
    const d = Object.values(egu.data.co2).reduce((a,r)=>a+(r.postEere-r.original),0);
    annualEguCo2[d>0?"strictPositive":d<0?"strictNegative":"exactZero"]++;
    annualEguCo2[d>1e-9?"aboveTolerance":d < -1e-9?"belowNegativeTolerance":"withinTolerance"]++;
    if(d>0 && (!annualEguCo2.largestPositive || d>annualEguCo2.largestPositive.deltaShortTons)) annualEguCo2.largestPositive={egu:k,deltaShortTons:d};
    if(d<0 && (!annualEguCo2.largestNegative || d<annualEguCo2.largestNegative.deltaShortTons)) annualEguCo2.largestNegative={egu:k,deltaShortTons:d};
  }
  const exampleEgu=originalEGUs.TE_TX_298_LIM1;
  const firstEguJanuary={egu:"TE_TX_298_LIM1",generationMWh:exampleEgu.data.generation[1],co2ShortTons:exampleEgu.data.co2[1]};
  const aggregatedSHA=write(`${scenario.id}-native-aggregation.json`,aggregated);
  const result={
    ...scenario,totalRequestedEndUseReductionMWh:totalRequestedEndUse,
    totalRequestedFossilLoadChangeMWh:totalRequestedChange,
    firstHourlyRequestedFossilLoadChangeMWh:hourlyChanges[0],
    affectedHours:affected.length,
    selectedRow:affected.length===1?affected[0]:null,
    boundDiagnostics:boundary, originalClientValidation:displayValidation,
    mostNegativeFraction:Math.min(...impacts.map(r=>r.percentChange))/100,
    modeledEguCount:Object.keys(originalEGUs).length, rawNonfinite, missingMonths,replacementFlags,
    noEmissionReplacementApplied:true,
    regional,annualEguCo2,firstEguJanuary,sourceProcessing:{
      clientFunctions:["regions.TE","calculateHourlyImpacts","calculateHourlyChangesValidation","calculateAggregatedEmissionsData"],
      serverFunction:"calculateEmissionsChanges",
      denominatorNative:"modeled generation difference for marginal fossil rate",
      denominatorTerminalScenario:"author-stipulated end-use change for separate end-use ratio",
      signs:"scenario minus baseline; negative = avoided; change in modeled EGU generation need not equal requested fossil-load change",
    },
    outputs:{inputSHA,rawSHA,aggregatedSHA},
  };
  write(`${scenario.id}-summary.json`,result);
  observed.push(result);
  console.log(JSON.stringify({scenario:scenario.id, totalRequestedEndUse, totalRequestedChange, affected:affected.length,regional}));
}
const receipt = {
  release:{tag:"v4.3.0", commit:tag, year, region:rdf.region, node:process.version, v8:process.versions.v8,
    platform:process.platform,arch:process.arch,lineLoss:region.lineLoss,regionHourlyLimit:hourlyLimit,
    route:"offline original release server core and transpiled original client functions; no app process/network/GUI",
  },
  execution:{batch,argvProfile:{annualGwh:0, scaling:1, noOtherResources:true},
    preregistrationSHA:originalPreregistrationSha256,
    runnerSHA:sha256(readFileSync(new URL(import.meta.url))), dependencyHashes,
    transpile:{compiler:ts.version,module:"CommonJS",target:"ES2022",interop:true, emittedSha256:prepHashes, utilityScope:"Exact sortObjectByKeys function declaration extracted from verified utilities.ts, not the unrelated Emotion CSS initializer; unused by calculateAggregatedEmissionsData."},
  },
  originalArtifacts:sourcePins,
  inputRDF:{rows:regionalLoad.length, EGU:unitIds.length, inputFlags, neiDiagnostics},
  runScenarios:observed,
  retainedResourceDisposition:"Retain original artifacts, dependency archives, and raw results in the caller’s private replay directories.",
};
console.log("receipt",write("receipt.json",receipt));
