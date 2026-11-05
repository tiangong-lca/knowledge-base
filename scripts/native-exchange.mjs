import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { decimal, divide, exactResult, fixed, multiply, subtract } from './exact-rational.mjs';

const fields = names => Object.fromEntries(names.map(name => [name, null]));
const factFields = ['value', 'unit', 'quantity', 'subject', 'basis'];
const nativeSummaryShape = {
  ...fields(['kind', 'recordedAt']),
  engine: fields([
    'name', 'version', 'sourceCommit', 'javaVersion', 'os', 'architecture', 'backend',
    'originalBottleSchema', 'calculationBottleSchema',
  ]),
  loadedComponents: [fields(['name', 'jar', 'sha256'])],
  workflows: [fields([
    'id', 'receiptSha256', 'inputArchiveSha256', 'inspectionReceiptSha256',
    'closedInspectedTreeSha256', 'protocolSha256', 'scope',
  ])],
  observations: [fields(['id', 'value', 'unit', 'run', 'case', 'quantity', 'basis'])],
  factorStates: [fields(['state', 'storedFactorRows', 'numericCCell', 'diagnosticScore'])],
  roundTrips: [fields([
    'id', 'sourceTargetKg', 'importedTargetKg', 'nativeDemandRatio', 'storedGraphMatches',
    'signedInventoryMatchesAtActualDemand', 'environmentalInputFlagsAllMatch', 'originalCmlCompared',
  ])],
  environmentalIndexException: fields([
    'flowUuid', 'run', 'case', 'sourceInput', 'importInput', 'signedInventoryAtRestoredTargetKg',
    'sourceExchangeDirectionsChanged', 'attributedToTargetChange', 'meaning',
  ]),
  baselineComparison: fields([
    'bottleTechnologyCoordinates', 'bottleInventoryCoordinates', 'bottleImpactCategories',
    'bottleAAndBAndCExactlyMatchAfterDeclaredCoordinateMap', 'bottleTotalsMatchWithinTolerance',
    'jrcOriginalGasTotalsReproduced', 'jrcOriginalHydroReproduced', 'jrcMachineTreatmentInTechIndex',
  ]),
  portableReplay: {
    ...fields([
      'runSummarySha256', 'launcherSha256', 'dependencyLockSha256', 'bottleReceiptSha256',
      'jrcReceiptSha256', 'probeReceiptSha256', 'sourceArchivesAndRuntimeJarsMatched',
      'baselineNumericComparisonsMatched', 'fullJrcOriginalGasTotalsReproduced',
      'independentTargetResetObserved', 'jsonProcessRecordsMatchApartFromMigrationLastChange',
    ]),
    directionLabelVariations: [fields(['case', 'flowUuid', 'sourceInput', 'importInput'])],
    interpretation: null,
  },
};

export const nativeExchangeInputShape = {
  ...fields(['caseId', 'version', 'model', 'createdAt', 'status']),
  sources: [fields([
    'sourceId', 'sourceVersion', 'accessStatus', 'readingId', 'readingVersion',
    'workId', 'readingStatus', 'defaultArtifactId',
  ])],
  carriers: [fields([
    'artifactId', 'readingId', 'mediaType', 'sha256', 'resolvedUrl', 'kind', 'pageCount', 'blockCount',
  ])],
  passages: [{
    ...fields(['evidenceId', 'sourceId', 'readingId', 'passageId', 'artifactId', 'locator']),
    pdfIndices: [null], nepisBlocks: [null], printedPages: null,
  }],
  facts: [fields(['key', 'evidenceId', 'factId', ...factFields])],
  native: { summarySha256: null, summary: nativeSummaryShape },
  controls: fields([
    'diagnosticCoefficient', 'diagnosticEnvironmentalMeaning', 'sourceTargetKg', 'doubledTargetKg',
    'allocationForRepresentationComparison', 'regionalized', 'automaticLinkRebuilding',
    'jsonExportIncludesOriginalCml', 'eilcdExportIncludesOriginalCml', 'eilcdOpenLcaExtensionsRetained',
  ]),
  scope: fields([
    'nativeReexecutedDuringStaticBuild', 'historicalDesktopReproduced', 'empiricalEnvironmentalValidation',
    'fullJrcSourceModelReproduced', 'foreignImporterTested', 'sourceOriginalsOrCompleteExportsPublished',
    'sourceSettingsAndDerivedObservationsDistinct',
  ]),
};

const digest = text => createHash('sha256').update(text, 'utf8').digest('hex');
// This pin is independent of the input and publication manifest. Object key
// order may change without changing content, but array order and literals may not.
const reviewedV1Digest = '1f917ed00a815c61b658ac39eb672e5a5c12e9a3ae9ac4fcd63aa036ad7d7a19';
function sortedJsonValue(_key, value) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value))
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
  return value;
}

// The separately pinned summary uses compact UTF-8 JSON in publication field
// order. This is only called after the full digest has established the shape.
function inFieldOrder(value, shape) {
  if (shape === null) return value;
  if (Array.isArray(shape)) return value.map(entry => inFieldOrder(entry, shape[0]));
  return Object.fromEntries(Object.keys(shape).map(key => [key, inFieldOrder(value[key], shape[key])]));
}

export function validateNativeExchangeCase(spec) {
  const invalid = ['native exchange: exact reviewed native-exchange v1 input required'];
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return invalid;
  try {
    if (digest(JSON.stringify(spec, sortedJsonValue)) !== reviewedV1Digest) return invalid;
    const summary = inFieldOrder(spec.native.summary, nativeSummaryShape);
    if (digest(JSON.stringify(summary)) !== spec.native.summarySha256)
      return ['native exchange.native: compact UTF-8 summary digest does not match'];
    return [];
  } catch {
    return invalid;
  }
}

// Floating conversion is only for the scientific display string. Exact values
// and all calculated differences use the recorded decimal strings and rationals.
function display(value, exact) {
  return {
    fixed3: fixed(value, 3), fixed6: fixed(value, 6), fixed9: fixed(value, 9),
    scientific: Number(exact).toExponential(6),
  };
}
function quantity(value, unit) {
  const exact = exactResult(value);
  return { ...exact, unit, ...display(value, fixed(value, 40)) };
}

export function evaluateNativeExchangeCase(spec) {
  const errors = validateNativeExchangeCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));
  const { summary, summarySha256 } = spec.native;
  const facts = Object.fromEntries(spec.facts.map(fact => [fact.key, { ...fact }]));
  const observed = Object.fromEntries(summary.observations.map(entry => [entry.id, {
    ...entry, exact: entry.value, ...display(decimal(entry.value), entry.value),
  }]));
  const fact = key => decimal(facts[key].value);
  const observation = id => decimal(observed[id].value);
  const treatmentScale = divide(fact('disposedReference'), fact('materialReference'));
  const openMachine = observation('jrcOpenMachine');
  const machineCo2PerReference = divide(fact('jrcMachineCo2'), fact('jrcMachineReference'));
  const difference = (baseline, control) => subtract(observation(baseline), observation(control));

  return {
    facts,
    observed,
    calculations: {
      treatmentScale: quantity(treatmentScale, '1'),
      displayedAcenDirect: quantity(multiply(fact('displayedAcenaphthene'), treatmentScale), 'kg'),
      jrcSourceMass: quantity(multiply(fact('jrcPartWeight'), fact('jrcScale')), 'kg'),
      absentMachineCo2: quantity(multiply(openMachine, machineCo2PerReference), 'kg'),
      jrcOriginalMinusNativeCo2: quantity(subtract(fact('jrcResultCo2'), observation('jrcBaselineCo2')), 'kg'),
      jrcOriginalMinusNativeCo: quantity(subtract(fact('jrcResultCo'), observation('jrcBaselineCo')), 'kg'),
      jrcWeightDifferenceCo2: quantity(difference('jrcBaselineCo2', 'jrcWeightOneCo2'), 'kg'),
      jrcWeightDifferenceCo: quantity(difference('jrcBaselineCo', 'jrcWeightOneCo'), 'kg'),
      jrcWeightDifferenceHydro: quantity(difference('jrcBaselineHydro', 'jrcWeightOneHydro'), 'MJ'),
      savedGwpResiduals: {
        none: quantity(subtract(fact('savedGwpNone'), observation('materialGwp')), 'kg CO2 eq'),
        economic: quantity(subtract(fact('savedGwpEconomic'), observation('economicGwp')), 'kg CO2 eq'),
      },
      targetRatio: quantity(divide(decimal(spec.controls.doubledTargetKg), decimal(spec.controls.sourceTargetKg)), '1'),
    },
    native: {
      kind: summary.kind,
      summarySha256,
      factorStates: summary.factorStates.map(entry => ({ ...entry })),
      roundTrips: summary.roundTrips.map(entry => ({ ...entry })),
      environmentalIndexException: { ...summary.environmentalIndexException },
      baselineComparison: { ...summary.baselineComparison },
      portableReplay: {
        ...summary.portableReplay,
        directionLabelVariations: summary.portableReplay.directionLabelVariations.map(entry => ({ ...entry })),
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
function originalCarrier(artifact, pin) {
  return !!artifact && !!pin && [undefined, 'retrieved'].includes(artifact.kind) && pin.kind === 'retrieved'
    && artifact.mediaType === pin.mediaType && artifact.sha256 === pin.sha256
    && artifact.resolvedUrl === pin.resolvedUrl
    && artifact.pageCount === (pin.pageCount ?? undefined) && artifact.blockCount === (pin.blockCount ?? undefined);
}
const exactOptionalList = (actual, expected) => expected.length === 0
  ? actual === undefined : isDeepStrictEqual(actual, expected);

/** Bind source facts to the public closure and each passage's actual carrier. */
export function validateNativeExchangeFacts(spec, published, context = {}) {
  const errors = validateNativeExchangeCase(spec);
  if (errors.length) return errors;
  if (!Array.isArray(published?.sources) || !Array.isArray(published?.evidence))
    return ['native exchange: public source and evidence closure required'];
  const register = context?.readingRegister;
  if (register?.schemaVersion !== 1 || !Array.isArray(register.readings))
    return ['native exchange: actual reading register required'];

  const allArtifacts = register.readings.flatMap(reading => records(reading?.artifacts));
  const allPassages = register.readings.flatMap(reading => records(reading?.passages));
  const carrierPins = new Map(spec.carriers.map(carrier => [carrier.artifactId, carrier]));
  const actualCarriers = new Map();
  for (const pin of spec.carriers) {
    const reading = uniqueRecord(register.readings, pin.readingId);
    const artifact = uniqueRecord(reading?.artifacts, pin.artifactId);
    if (!originalCarrier(artifact, pin) || uniqueRecord(allArtifacts, pin.artifactId) !== artifact)
      errors.push(`native exchange.carriers.${pin.artifactId}: exact original artifact in its inspected reading required`);
    else
      actualCarriers.set(pin.artifactId, artifact);
  }

  const actualReadings = new Map();
  for (const pin of spec.sources) {
    const source = uniqueRecord(published.sources, pin.sourceId);
    const reading = uniqueRecord(register.readings, pin.readingId);
    const carrier = carrierPins.get(pin.defaultArtifactId);
    if (source?.version !== pin.sourceVersion || source.accessStatus !== pin.accessStatus
        || source.reading?.readingId !== pin.readingId || source.reading.status !== pin.readingStatus
        || typeof source.reading.scope !== 'string' || !source.reading.scope.trim()
        || reading?.version !== pin.readingVersion || reading.workId !== pin.workId
        || reading.readingStatus !== pin.readingStatus || carrier?.readingId !== pin.readingId
        || !originalCarrier(source.artifact, carrier) || !actualCarriers.has(pin.defaultArtifactId)) {
      errors.push(`native exchange.sources.${pin.sourceId}: exact public source, edition, work, reading and default carrier required`);
      continue;
    }
    actualReadings.set(pin.sourceId, reading);
  }

  const actualEvidence = new Map();
  for (const pin of spec.passages) {
    const evidence = uniqueRecord(published.evidence, pin.evidenceId);
    const reading = actualReadings.get(pin.sourceId);
    const passage = uniqueRecord(reading?.passages, pin.passageId);
    const carrier = carrierPins.get(pin.artifactId);
    if (evidence?.sourceId !== pin.sourceId || evidence.readingId !== pin.readingId
        || evidence.passageId !== pin.passageId || evidence.locator !== pin.locator
        || passage?.artifactId !== pin.artifactId || passage.locator !== pin.locator
        || !exactOptionalList(passage.pdfIndices, pin.pdfIndices)
        || !exactOptionalList(passage.nepisBlocks, pin.nepisBlocks)
        || passage.printedPages !== (pin.printedPages ?? undefined) || carrier?.readingId !== pin.readingId
        || !actualCarriers.has(pin.artifactId) || uniqueRecord(allPassages, pin.passageId) !== passage) {
      errors.push(`native exchange.passages.${pin.evidenceId}: exact public evidence, inspected passage, locator and original carrier required`);
      continue;
    }
    actualEvidence.set(pin.evidenceId, evidence);
  }

  for (const pin of spec.facts) {
    const evidence = actualEvidence.get(pin.evidenceId);
    const fact = evidence?.numericFact === undefined && uniqueRecord(evidence?.numericFacts, pin.factId);
    if (!factFields.every(field => fact?.[field] === pin[field]))
      errors.push(`native exchange.facts.${pin.key}: exact public fact identity and value/unit/quantity/subject/basis required`);
  }

  // A native workflow's input archive is bound to the public original carrier.
  const workflowArchives = new Map([
    ['bottle-calc-02', 'art-kb50-bottle-backup'],
    ['jrc-calc-02', 'art-kb50-jrc-sdk'],
    ['bottle-probes-01', 'art-kb50-bottle-backup'],
  ]);
  for (const workflow of spec.native.summary.workflows) {
    const archive = actualCarriers.get(workflowArchives.get(workflow.id));
    if (archive?.mediaType !== 'application/zip' || archive.sha256 !== workflow.inputArchiveSha256)
      errors.push(`native exchange.native.${workflow.id}: exact inspected workflow input archive required`);
  }
  return errors;
}
