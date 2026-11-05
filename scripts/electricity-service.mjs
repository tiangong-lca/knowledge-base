import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { add, decimal, divide, fixed, multiply, rational, result as exactResult, subtract } from './exact-rational.mjs';

// Reader rounding is presentation only; the exact serialized input arithmetic
// remains available beside it and does not imply measurement precision.
const result = value => ({ ...exactResult(value), fixed2: fixed(value, 2), fixed3: fixed(value, 3), fixed4: fixed(value, 4) });

const scalarFields = keys => Object.fromEntries(keys.map(key => [key, null]));
const factFields = ['value', 'unit', 'quantity', 'subject', 'basis'];
const factKeys = [
  'egridNetGeneration', 'egridCo2Mass', 'egridCo2OutputRate', 'egridGridLosses',
  'egridDisposition', 'egridDirectUse', 'egridPublishedGgl',
  'eiaExportGeneration', 'eiaExportInterchange', 'eiaExportDemand',
  'eiaImportGeneration', 'eiaImportInterchange', 'eiaImportDemand',
  'norwayLocalLossFraction', 'norwayRegionalLossFraction',
  'norwayLocalLossPerDelivered', 'norwayRegionalLossPerDelivered',
  'avertLossFraction', 'avertJuly03FossilLoad', 'avertJuly16FossilLoad',
  'cambiumGeneration', 'cambiumImports', 'cambiumExports', 'cambiumBusbarLoad',
  'cambiumBusbarLoadForEndUse', 'cambiumEndUseLoad', 'cambiumTransmissionLosses',
  'cambiumBatteryCharging', 'cambiumPumpedStorageCharging',
  'cambiumAverageDistributionLoss', 'cambiumMarginalDistributionLoss',
  'cambiumAverageDirectGenerationRate', 'cambiumAverageDirectEndUseRate',
  'cambiumAverageEndUseCo2e', 'cambiumShortRunEndUseCo2e',
  'cambiumLongRunDirectEndUseCo2e', 'cambiumLongRunPrecombEndUseCo2e',
  'cambiumLongRunEndUseCo2e', 'cambiumAlternativeLongRunEndUseCo2e',
  'cambiumDirectCo2', 'cambiumDirectCh4', 'cambiumDirectN2o',
  'cambiumPrecombCo2', 'cambiumPrecombCh4', 'cambiumPrecombN2o',
  'cambiumCo2Gwp', 'cambiumCh4Gwp', 'cambiumN2oGwp',
];
const nativeBatch = scalarFields([
  'originalReceiptSha256', 'portableReceiptSha256', 'byteIdenticalScenarioFiles',
]);
const nativeMetric = scalarFields(['unit', 'baseline', 'scenario', 'delta']);
const nativeScenario = {
  ...scalarFields(['id', 'batch']),
  profile: scalarFields([
    'rdfOneHourIntervals', 'affectedHours', 'constantTerminalReductionMWhPerHour',
    'selectedRdfHourOfYear', 'selectedRdfHour',
  ]),
  ...scalarFields(['terminalReductionMWh', 'requestedModelFossilLoadChangeMWh']),
  modeled: { generation: nativeMetric, co2: nativeMetric, so2: nativeMetric, nox: nativeMetric },
  diagnostics: scalarFields([
    'inRange', 'thresholdFlags', 'missingMonths', 'nonfiniteOutputs', 'replacementFlags',
    'modeledEguCount', 'matchedNeiUnitYears', 'eguCo2Increases', 'eguCo2Decreases',
    'eguCo2UnchangedWithinTolerance', 'eguCo2SignToleranceUSShortTon',
  ]),
  outputs: scalarFields(['inputSHA', 'rawSHA', 'aggregatedSHA']),
};

export const electricityServiceInputShape = {
  ...scalarFields(['caseId', 'version', 'model', 'createdAt', 'status']),
  sources: [scalarFields([
    'sourceId', 'sourceVersion', 'accessStatus', 'readingId', 'readingVersion',
    'workId', 'readingStatus', 'defaultArtifactId',
  ])],
  carriers: [scalarFields([
    'artifactId', 'readingId', 'mediaType', 'sha256', 'resolvedUrl', 'kind', 'pageCount', 'blockCount',
  ])],
  passages: [{
    ...scalarFields(['evidenceId', 'sourceId', 'readingId', 'passageId', 'artifactId', 'locator']),
    pdfIndices: [null], nepisBlocks: [null], printedPages: null,
  }],
  facts: Object.fromEntries(factKeys.map(key => [key, scalarFields(['evidenceId', 'factId', ...factFields])])),
  archive: scalarFields(['evidenceId', 'memberArtifactId', 'memberName']),
  native: {
    summarySha256: null,
    summary: {
      ...scalarFields(['schemaVersion', 'kind', 'method']),
      release: scalarFields(['url', 'commit', 'version', 'rdfYear', 'rdfRegion']),
      testedRuntime: scalarFields(['node', 'v8', 'platform', 'arch']),
      ...scalarFields(['portableDriverSha256', 'acquisitionManifestSha256', 'signConvention', 'aggregation']),
      batches: { primary: nativeBatch, secondary: nativeBatch },
      scenarios: [nativeScenario],
    },
    manifestArtifactBindings: [scalarFields(['artifactId', 'manifestPath', 'sha256', 'resolvedUrl'])],
  },
  scope: scalarFields([
    'commonGridBoundaryEstablished', 'physicalEndServiceEquivalenceEstablished',
    'nativeReexecutedDuringStaticBuild', 'empiricalValidation', 'futureScenarioRunReproduced',
    'alternativeGasBreakdownReproduced', 'fullLifeCycleImpactReproduced',
  ]),
};

// Independent of the input file and the publication manifest. Reordering
// object keys preserves the reviewed contents and every selected decimal string.
const reviewedV1Digest = 'b740380a1a97c0c8fbdaf8ef3ceb8da49bc48478a086e51ffa3f1a54e2a224a5';
function sortedJsonValue(_key, value) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value))
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
  return value;
}

export function validateElectricityServiceCase(spec) {
  const invalid = ['electricity service: exact reviewed electricity-service v1 input required'];
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return invalid;
  try {
    return createHash('sha256').update(JSON.stringify(spec, sortedJsonValue)).digest('hex') === reviewedV1Digest ? [] : invalid;
  } catch {
    return invalid;
  }
}

const zero = rational(0n);
const one = rational(1n);
const hundred = rational(100n);
const thousand = rational(1000n);
const poundsPerShortTon = rational(2000n);
const kilogramsPerShortTon = decimal('907.18474');
const negate = value => subtract(zero, value);
const isZero = value => value[0] === 0n;

export function evaluateElectricityServiceCase(spec) {
  const errors = validateElectricityServiceCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));
  const fact = key => decimal(spec.facts[key].value);
  const literal = key => spec.facts[key].value;

  const egridCo2OutputRate = divide(multiply(fact('egridCo2Mass'), poundsPerShortTon), fact('egridNetGeneration'));
  const calculatedRateAtDisplay = fixed(egridCo2OutputRate, 3);
  const publishedRateAtDisplay = fixed(fact('egridCo2OutputRate'), 3);
  const egridGglDenominator = subtract(fact('egridDisposition'), fact('egridDirectUse'));
  const egridGgl = divide(fact('egridGridLosses'), egridGglDenominator);
  const egridGglPercent = multiply(egridGgl, hundred);
  const calculatedGglAtDisplay = fixed(egridGglPercent, 1);
  const publishedGglAtDisplay = fixed(multiply(fact('egridPublishedGgl'), hundred), 1);

  const eiaBalance = prefix => {
    const calculated = subtract(fact(`${prefix}Generation`), fact(`${prefix}Interchange`));
    const reported = fact(`${prefix}Demand`);
    const residual = subtract(calculated, reported);
    return {
      calculatedDemandMW: result(calculated), reportedDemandMW: result(reported),
      residualMW: result(residual), closes: isZero(residual),
    };
  };
  const norwayLoss = prefix => {
    const fraction = fact(`${prefix}LossFraction`);
    const loss = divide(multiply(thousand, fraction), subtract(one, fraction));
    const calculatedAtDisplay = fixed(loss, 0);
    const reportedLiteral = literal(`${prefix}LossPerDelivered`);
    return {
      lossKwhPerDeliveredMWh: result(loss), calculatedAtDisplay,
      reportedLiteral, matchesReportedDisplay: calculatedAtDisplay === reportedLiteral,
    };
  };

  const nativeScenarios = ['zero', 'flat', 'july03', 'july16'];
  const sourceLoadFacts = { july03: 'avertJuly03FossilLoad', july16: 'avertJuly16FossilLoad' };
  const native = Object.fromEntries(spec.native.summary.scenarios.map((scenario, index) => {
    const key = nativeScenarios[index];
    const terminalReduction = decimal(scenario.terminalReductionMWh);
    const requestedFossilChange = decimal(scenario.requestedModelFossilLoadChangeMWh);
    const modeledGenerationChange = decimal(scenario.modeled.generation.delta);
    const co2Change = decimal(scenario.modeled.co2.delta);
    const avoidedCo2 = negate(multiply(co2Change, kilogramsPerShortTon));
    return [key, {
      id: scenario.id,
      selectedRdfHour: scenario.profile.selectedRdfHour,
      sourceFossilLoadMW: sourceLoadFacts[key] ? result(fact(sourceLoadFacts[key])) : null,
      terminalReductionMWh: result(terminalReduction),
      requestedFossilLoadChangeMWh: result(requestedFossilChange),
      modeledGenerationChangeMWh: result(modeledGenerationChange),
      modeledMinusRequestedFossilChangeMWh: result(subtract(modeledGenerationChange, requestedFossilChange)),
      modeledDirectCo2ChangeUSShortTon: result(co2Change),
      avoidedDirectCo2Kg: result(avoidedCo2),
      avoidedDirectCo2KgPerTerminalMWh: isZero(terminalReduction)
        ? null : result(divide(avoidedCo2, terminalReduction)),
      avoidedDirectCo2KgPerModeledGenerationMWh: isZero(modeledGenerationChange)
        ? null : result(divide(avoidedCo2, negate(modeledGenerationChange))),
      modeledSo2ChangeLb: result(decimal(scenario.modeled.so2.delta)),
      modeledNoxChangeLb: result(decimal(scenario.modeled.nox.delta)),
      zeroControl: Object.values(scenario.modeled).every(metric => isZero(decimal(metric.delta))),
      diagnostics: { ...scenario.diagnostics },
    }];
  }));

  const busbarLoad = fact('cambiumBusbarLoad');
  const busbarLoadForEndUse = fact('cambiumBusbarLoadForEndUse');
  const cambiumSupply = subtract(add(fact('cambiumGeneration'), fact('cambiumImports')), fact('cambiumExports'));
  const cambiumAllocated = [
    busbarLoadForEndUse, fact('cambiumTransmissionLosses'), fact('cambiumBatteryCharging'),
    fact('cambiumPumpedStorageCharging'),
  ].reduce(add, zero);
  const cambiumDistributionDifference = subtract(busbarLoadForEndUse, fact('cambiumEndUseLoad'));
  const cambiumDistributionShare = divide(cambiumDistributionDifference, busbarLoadForEndUse);

  const characterize = (prefix, reportedKey) => {
    const co2Kg = fact(`${prefix}Co2`);
    const ch4Kg = divide(fact(`${prefix}Ch4`), thousand);
    const n2oKg = divide(fact(`${prefix}N2o`), thousand);
    const subtotal = [
      multiply(co2Kg, fact('cambiumCo2Gwp')),
      multiply(ch4Kg, fact('cambiumCh4Gwp')),
      multiply(n2oKg, fact('cambiumN2oGwp')),
    ].reduce(add, zero);
    const atDisplayPrecision = fixed(subtotal, 1);
    return {
      subtotal,
      evaluated: {
        co2Kg: result(co2Kg), ch4Kg: result(ch4Kg), n2oKg: result(n2oKg),
        subtotalKgCo2ePerEndUseMWh: result(subtotal),
        reportedLiteral: literal(reportedKey), atDisplayPrecision,
        matchesReportedDisplay: atDisplayPrecision === literal(reportedKey),
      },
    };
  };
  const direct = characterize('cambiumDirect', 'cambiumLongRunDirectEndUseCo2e');
  const precombustion = characterize('cambiumPrecomb', 'cambiumLongRunPrecombEndUseCo2e');
  const reconstructedTotal = add(direct.subtotal, precombustion.subtotal);
  const totalAtDisplayPrecision = fixed(reconstructedTotal, 1);
  const longRunMidCase = fact('cambiumLongRunEndUseCo2e');
  const longRunAlternative = fact('cambiumAlternativeLongRunEndUseCo2e');

  return {
    egrid: {
      co2Output: {
        massUSShortTon: result(fact('egridCo2Mass')),
        generationMWh: result(fact('egridNetGeneration')),
        calculatedLbPerGenerationMWh: result(egridCo2OutputRate),
        reportedLiteral: literal('egridCo2OutputRate'),
        calculatedAtDisplay: calculatedRateAtDisplay, publishedAtDisplay: publishedRateAtDisplay,
        matchesPublishedDisplay: calculatedRateAtDisplay === publishedRateAtDisplay,
      },
      ggl: {
        lossesMWh: result(fact('egridGridLosses')),
        dispositionMWh: result(fact('egridDisposition')),
        directUseMWh: result(fact('egridDirectUse')),
        denominatorMWh: result(egridGglDenominator), fraction: result(egridGgl),
        percent: result(egridGglPercent), reportedFractionLiteral: literal('egridPublishedGgl'),
        calculatedAtDisplay: calculatedGglAtDisplay, publishedAtDisplay: publishedGglAtDisplay,
        matchesPublishedDisplay: calculatedGglAtDisplay === publishedGglAtDisplay,
      },
    },
    eia: { exportHour: eiaBalance('eiaExport'), importHour: eiaBalance('eiaImport') },
    norway: { local: norwayLoss('norwayLocal'), regional: norwayLoss('norwayRegional') },
    avertPreprocessing: {
      requestedFossilMWhPerTerminalMWh: result(divide(one, subtract(one, fact('avertLossFraction')))),
    },
    native,
    cambium: {
      balances: {
        publishedBusbarLoadMWh: result(busbarLoad),
        supplyMWh: result(cambiumSupply), supplyResidualMWh: result(subtract(cambiumSupply, busbarLoad)),
        allocatedMWh: result(cambiumAllocated), allocationResidualMWh: result(subtract(cambiumAllocated, busbarLoad)),
      },
      distribution: {
        differenceMWh: result(cambiumDistributionDifference), shareOfBusbarForEndUse: result(cambiumDistributionShare),
        percentOfBusbarForEndUse: result(multiply(cambiumDistributionShare, hundred)),
        publishedAverageFraction: result(fact('cambiumAverageDistributionLoss')),
        publishedMarginalFraction: result(fact('cambiumMarginalDistributionLoss')),
      },
      directCo2Rates: {
        perGenerationMWh: result(fact('cambiumAverageDirectGenerationRate')),
        perEndUseMWh: result(fact('cambiumAverageDirectEndUseRate')),
      },
      terminalCo2eRates: {
        average: result(fact('cambiumAverageEndUseCo2e')),
        shortRunMarginal: result(fact('cambiumShortRunEndUseCo2e')),
        longRunMarginal: result(longRunMidCase),
      },
      gasReconstruction: {
        direct: direct.evaluated, precombustion: precombustion.evaluated,
        totalKgCo2ePerEndUseMWh: result(reconstructedTotal), totalAtDisplayPrecision,
        reportedTotalLiteral: literal('cambiumLongRunEndUseCo2e'),
        matchesReportedDisplay: totalAtDisplayPrecision === literal('cambiumLongRunEndUseCo2e'),
      },
      reportedScenarioComparison: {
        midCase: result(longRunMidCase), alternative: result(longRunAlternative),
        differenceKgCo2ePerEndUseMWh: result(subtract(longRunAlternative, longRunMidCase)),
        alternativeGasBreakdownReproduced: spec.scope.alternativeGasBreakdownReproduced,
      },
    },
    scope: { ...spec.scope },
  };
}

const records = value => Array.isArray(value) ? value : [];
function uniqueRecord(list, id) {
  const matches = records(list).filter(record => record?.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}
const exactOptionalList = (actual, expected) => expected.length === 0 ? actual === undefined : isDeepStrictEqual(actual, expected);
function originalCarrier(artifact, expected) {
  return !!artifact && [undefined, 'retrieved'].includes(artifact.kind) && expected.kind === 'retrieved'
    && artifact.mediaType === expected.mediaType && artifact.sha256 === expected.sha256
    && artifact.resolvedUrl === expected.resolvedUrl
    && artifact.pageCount === (expected.pageCount ?? undefined) && artifact.blockCount === (expected.blockCount ?? undefined);
}

/** Check the reviewed public closure against the actual reading register. */
export function validateElectricityServiceFacts(spec, published, context = {}) {
  const errors = validateElectricityServiceCase(spec);
  if (errors.length) return errors;
  if (!Array.isArray(published?.sources) || !Array.isArray(published?.evidence))
    return ['electricity service: public source and evidence closure required'];
  const register = context?.readingRegister;
  if (register?.schemaVersion !== 1 || !Array.isArray(register.readings))
    return ['electricity service: actual reading register required'];

  const allArtifacts = register.readings.flatMap(reading => records(reading?.artifacts));
  const allPassages = register.readings.flatMap(reading => records(reading?.passages));
  const carrierPins = new Map(spec.carriers.map(carrier => [carrier.artifactId, carrier]));
  const actualCarriers = new Map();
  for (const carrier of spec.carriers) {
    const reading = uniqueRecord(register.readings, carrier.readingId);
    const artifact = uniqueRecord(reading?.artifacts, carrier.artifactId);
    if (!originalCarrier(artifact, carrier) || uniqueRecord(allArtifacts, carrier.artifactId) !== artifact)
      errors.push(`electricity service.carriers.${carrier.artifactId}: exact original artifact in its inspected reading required`);
    else
      actualCarriers.set(carrier.artifactId, artifact);
  }

  const actualReadings = new Map();
  for (const expected of spec.sources) {
    const source = uniqueRecord(published.sources, expected.sourceId);
    const reading = uniqueRecord(register.readings, expected.readingId);
    const defaultCarrier = carrierPins.get(expected.defaultArtifactId);
    if (source?.version !== expected.sourceVersion || source.accessStatus !== expected.accessStatus
        || source.reading?.readingId !== expected.readingId || source.reading.status !== expected.readingStatus
        || typeof source.reading.scope !== 'string' || !source.reading.scope.trim()
        || reading?.version !== expected.readingVersion || reading.workId !== expected.workId
        || reading.readingStatus !== expected.readingStatus
        || !originalCarrier(source.artifact, defaultCarrier) || !actualCarriers.has(expected.defaultArtifactId)) {
      errors.push(`electricity service.sources.${expected.sourceId}: exact public source, inspected work, editions and default carrier required`);
      continue;
    }
    actualReadings.set(expected.sourceId, reading);
  }

  const actualEvidence = new Map();
  for (const expected of spec.passages) {
    const evidence = uniqueRecord(published.evidence, expected.evidenceId);
    const reading = actualReadings.get(expected.sourceId);
    const passage = uniqueRecord(reading?.passages, expected.passageId);
    if (evidence?.sourceId !== expected.sourceId || evidence.readingId !== expected.readingId
        || evidence.passageId !== expected.passageId || evidence.locator !== expected.locator
        || passage?.artifactId !== expected.artifactId || passage.locator !== expected.locator
        || !exactOptionalList(passage.pdfIndices, expected.pdfIndices)
        || !exactOptionalList(passage.nepisBlocks, expected.nepisBlocks)
        || passage.printedPages !== (expected.printedPages ?? undefined)
        || !actualCarriers.has(expected.artifactId) || uniqueRecord(allPassages, expected.passageId) !== passage) {
      errors.push(`electricity service.passages.${expected.evidenceId}: exact public evidence and inspected passage, locator and original carrier required`);
      continue;
    }
    actualEvidence.set(expected.evidenceId, evidence);
  }

  for (const [key, expected] of Object.entries(spec.facts)) {
    const evidence = actualEvidence.get(expected.evidenceId);
    const fact = evidence?.numericFact === undefined && uniqueRecord(evidence?.numericFacts, expected.factId);
    if (!factFields.every(field => fact?.[field] === expected[field]))
      errors.push(`electricity service.facts.${key}: exact public fact identity and value/unit/quantity/subject/basis required`);
  }

  const archive = actualEvidence.get(spec.archive.evidenceId);
  const archivePassage = spec.passages.find(passage => passage.evidenceId === spec.archive.evidenceId);
  const zip = actualCarriers.get(archivePassage.artifactId);
  const member = actualCarriers.get(spec.archive.memberArtifactId);
  if (!archive?.locator.includes(spec.archive.memberName) || zip?.mediaType !== 'application/zip'
      || member?.mediaType !== 'text/csv' || zip.sha256 === member.sha256)
    errors.push('electricity service.archive: exact public Cambium annual ZIP and inspected CSV member required');

  // The closed input fixes the acquisition manifest identity and the selected
  // manifest entries. Each must still match the actual inspected AVERT carrier.
  for (const expected of spec.native.manifestArtifactBindings) {
    const artifact = actualCarriers.get(expected.artifactId);
    if (artifact?.sha256 !== expected.sha256 || artifact.resolvedUrl !== expected.resolvedUrl)
      errors.push(`electricity service.native.${expected.manifestPath}: exact manifest-bound original AVERT artifact required`);
  }
  return errors;
}
