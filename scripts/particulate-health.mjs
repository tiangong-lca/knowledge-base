import { createHash } from 'node:crypto';
import { add, decimal, divide, fixed, multiply, rational, result } from './exact-rational.mjs';

const historicalFactors = {
  primaryUrban: ['primaryUrbanGround', 'reportedPrimaryUrban'],
  primaryRural: ['primaryRuralGround', 'reportedPrimaryRural'],
  primaryRemote: ['primaryRemoteGround', 'reportedPrimaryRemote'],
  so2Urban: ['so2Urban', 'reportedSo2Urban'],
  noxUrban: ['noxUrban', 'reportedNoxUrban'],
  nh3Urban: ['nh3Urban', 'reportedNh3Urban'],
};
const glamFactors = {
  urbanMarginal: 'glamUrbanMarginal',
  urbanAverage: 'glamUrbanAverage',
  ruralMarginal: 'glamRuralMarginal',
  ruralAverage: 'glamRuralAverage',
};
const heights = ['High', 'Low', 'Ground'];
const numericFields = ['value', 'unit', 'quantity', 'subject', 'basis'];
const scalarFields = keys => Object.fromEntries(keys.map(key => [key, null]));
const factShape = scalarFields(['source', 'evidenceId', 'factId', 'passageId', 'locator', ...numericFields, 'pdfIndex']);
const sourceIdentity = scalarFields(['sourceId', 'readingId', 'workId', 'version', 'artifactId']);
const carrier = scalarFields(['mediaType', 'sha256', 'resolvedUrl']);

export const particulateHealthInputShape = {
  ...scalarFields(['caseId', 'version', 'model', 'createdAt', 'status']),
  sources: {
    humbert2011: { ...sourceIdentity, ...carrier, pageCount: null },
    gronlund2015: { ...sourceIdentity, ...scalarFields(['sha256', 'resolvedUrl', 'mediaType', 'pageCount']) },
    'glam-pm2024': { ...sourceIdentity, ...carrier },
  },
  container: {
    ...scalarFields(['source', 'artifactId']), ...carrier,
    ...scalarFields(['archiveMember', 'evidenceId', 'passageId', 'locator']),
  },
  facts: Object.fromEntries([
    'primaryUrbanHigh', 'primaryUrbanLow', 'primaryUrbanGround', 'primaryRuralGround', 'primaryRemoteGround',
    'coarseUrbanHigh', 'coarseUrbanLow', 'coarseUrbanGround', 'primaryUrbanReportedAverage', 'coarseUrbanReportedAverage',
    'so2Urban', 'noxUrban', 'nh3Urban',
    ...['fine', 'coarse'].flatMap(size => heights.map(height => `${size}${height}Share`)),
    'effect', ...Object.values(historicalFactors).map(([, reported]) => reported), ...Object.values(glamFactors),
  ].map(key => [key, factShape])),
  scope: scalarFields([
    'historicalModel', 'unitEmissionBasis', 'mixtureBasis', 'modernContrast',
    'nativeAtmosphericModelReproduced', 'epidemiologyReproduced', 'modelValidityEstablished',
    'individualHealthPrediction', 'interventionBenefitMeasured', 'historicalAndModernInterchangeable',
    'glamFactorGenerationReproduced', 'sourceMixtureValidated', 'uncertaintyPropagated',
  ]),
  rounding: {
    ...scalarFields(['ratioPlaces', 'fineMixturePlaces', 'coarseMixturePlaces']),
    sourceCfDecimalPlaces: scalarFields(Object.keys(historicalFactors)),
  },
};

// Independent of the downloadable file and publication manifest. Object key
// order and JSON formatting do not change the reviewed values.
const reviewedV1Digest = '0ecc984c40c2f891f2845a728a432440679d908150f50dbc961aa02e52ed7fa9';
function sortedJsonValue(_key, value) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value))
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
  return value;
}

export function validateParticulateHealthCase(spec) {
  const invalid = ['particulate health: exact reviewed particulate-health v1 input required'];
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return invalid;
  try {
    return createHash('sha256').update(JSON.stringify(spec, sortedJsonValue)).digest('hex') === reviewedV1Digest ? [] : invalid;
  } catch {
    return invalid;
  }
}

export function evaluateParticulateHealthCase(spec) {
  const errors = validateParticulateHealthCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));

  const fact = key => decimal(spec.facts[key].value);
  const effect = fact('effect');
  const million = rational(1_000_000n);
  const { rounding } = spec;
  const intakeInKg = key => divide(fact(key), million);
  const historicalCf = key => multiply(intakeInKg(key), effect);
  const historical = Object.fromEntries(Object.entries(historicalFactors).map(([key, [intake, reported]]) => {
    const calculated = historicalCf(intake);
    const atSourcePrecision = fixed(calculated, rounding.sourceCfDecimalPlaces[key]);
    return [key, {
      intake: result(fact(intake)),
      intakeLiteral: spec.facts[intake].value,
      intakeUnit: spec.facts[intake].unit,
      intakeKgPerKg: result(intakeInKg(intake)),
      calculated: result(calculated),
      reported: result(fact(reported)),
      reportedLiteral: spec.facts[reported].value,
      unit: spec.facts[reported].unit,
      atSourcePrecision,
      matchesSourcePrecision: atSourcePrecision === spec.facts[reported].value,
    }];
  }));
  const urbanRuralRatio = divide(historicalCf('primaryUrbanGround'), historicalCf('primaryRuralGround'));

  // The displayed height-specific factors and shares are a consistency check
  // on printed values. The fine factors use the study's unknown-height anchor.
  const zero = rational(0n);
  const mixture = (size, intakePrefix) => {
    const shares = heights.map(height => fact(`${size}${height}Share`));
    const shareSum = shares.reduce(add, zero);
    const weighted = heights.map((height, index) => multiply(shares[index], fact(`${intakePrefix}Urban${height}`))).reduce(add, zero);
    const reported = `${intakePrefix}UrbanReportedAverage`;
    const atSourcePrecision = fixed(weighted, 0);
    return {
      shares: Object.fromEntries(heights.map((height, index) => [height.toLowerCase(), result(shares[index])])),
      shareSum: result(shareSum),
      sharesSumToOne: shareSum[0] === shareSum[1],
      weighted: result(weighted),
      weightedRounded: fixed(weighted, rounding[`${size}MixturePlaces`]),
      reported: result(fact(reported)),
      reportedLiteral: spec.facts[reported].value,
      unit: spec.facts[reported].unit,
      atSourcePrecision,
      matchesSourcePrecision: atSourcePrecision === spec.facts[reported].value,
    };
  };

  // The workbook factors are complete DALY/kg-emitted outputs already.
  // Scenario labels identify emission-side groups; every factor already sums
  // impacts over its affected receptors.
  const glamRatio = (numerator, denominator) => {
    const value = divide(fact(glamFactors[numerator]), fact(glamFactors[denominator]));
    return { value: result(value), rounded: fixed(value, rounding.ratioPlaces), readerRounded: fixed(value, 3) };
  };
  return {
    historical: {
      effect: result(effect),
      effectUnit: spec.facts.effect.unit,
      factors: historical,
      urbanRuralRatio: result(urbanRuralRatio),
      urbanRuralRatioRounded: fixed(urbanRuralRatio, rounding.ratioPlaces),
      urbanRuralRatioReaderRounded: fixed(urbanRuralRatio, 2),
    },
    heightMixtures: { fine: mixture('fine', 'primary'), coarse: mixture('coarse', 'coarse') },
    glam: {
      factors: Object.fromEntries(Object.entries(glamFactors).map(([key, input]) => {
        const value = fact(input);
        const microDalyPerKg = multiply(value, million);
        return [key, {
          value: result(value), literal: spec.facts[input].value, unit: spec.facts[input].unit,
          microDalyPerKg: result(microDalyPerKg), microDalyPerKgRounded: fixed(microDalyPerKg, 6),
          microDalyPerKgReaderRounded: fixed(microDalyPerKg, 3),
        }];
      })),
      ratios: {
        urbanAverageMarginal: glamRatio('urbanAverage', 'urbanMarginal'),
        ruralAverageMarginal: glamRatio('ruralAverage', 'ruralMarginal'),
        urbanRuralMarginal: glamRatio('urbanMarginal', 'ruralMarginal'),
        urbanRuralAverage: glamRatio('urbanAverage', 'ruralAverage'),
      },
    },
    scope: { ...spec.scope },
  };
}

// The tuple names the page with the number; the passage may include separate
// pages for the definition, equation or confirmation of the authors' default.
const pdfPassages = {
  'psg-kb46-humbert2011-intake-table': { indices: [2], printed: '4810' },
  'psg-kb46-humbert2011-height-weights': { indices: [13, 6], printed: 'SI第5页；4814' },
  'psg-kb46-gronlund2015-effect-default': { indices: [6, 24], printed: '作者稿7,25' },
  'psg-kb46-gronlund2015-characterization-table': { indices: [25], printed: '作者稿26' },
};
const records = value => Array.isArray(value) ? value : [];
function uniqueRecord(list, id) {
  const matches = records(list).filter(record => record?.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

function originalCarrier(artifact, expected) {
  return [undefined, 'retrieved'].includes(artifact?.kind)
    && artifact?.mediaType === expected.mediaType
    && artifact.sha256 === expected.sha256
    && artifact.resolvedUrl === expected.resolvedUrl
    && artifact.pageCount === expected.pageCount;
}

function correctBounds(passage, source, input) {
  if (passage.nepisBlocks !== undefined) return false;
  if (source.mediaType !== 'application/pdf')
    return input.pdfIndex === null && passage.pdfIndices === undefined && passage.printedPages === undefined;
  const { indices, printed } = pdfPassages[input.passageId];
  return passage.printedPages === printed && Array.isArray(passage.pdfIndices)
    && passage.pdfIndices.length === indices.length
    && indices.includes(input.pdfIndex)
    && indices.every(index => index >= 0 && index < source.pageCount && passage.pdfIndices.includes(index));
}

function boundPassage(evidence, passage, source, expected, artifactId, passages) {
  return evidence?.sourceId === source.sourceId && evidence.readingId === source.readingId
    && evidence.passageId === expected.passageId && evidence.locator === expected.locator
    && passage?.locator === expected.locator && passage.artifactId === artifactId
    && uniqueRecord(passages, expected.passageId) === passage;
}

/** Require exact tuples in the reviewed public closure and actual inspected carriers. */
export function validateParticulateHealthFacts(spec, published, context = {}) {
  const errors = validateParticulateHealthCase(spec);
  if (errors.length) return errors;
  if (!Array.isArray(published?.sources) || !Array.isArray(published?.evidence))
    return ['particulate health: public source and evidence closure required'];
  const register = context?.readingRegister;
  if (register?.schemaVersion !== 1 || !Array.isArray(register.readings))
    return ['particulate health: actual reading register required'];

  const artifacts = register.readings.flatMap(reading => records(reading?.artifacts));
  const passages = register.readings.flatMap(reading => records(reading?.passages));
  const actualReadings = new Map();
  for (const [key, expected] of Object.entries(spec.sources)) {
    const source = uniqueRecord(published.sources, expected.sourceId);
    const reading = uniqueRecord(register.readings, expected.readingId);
    const artifact = uniqueRecord(reading?.artifacts, expected.artifactId);
    if (source?.version !== expected.version || reading?.version !== expected.version
        || reading.workId !== expected.workId || reading.readingStatus !== 'selected-passages'
        || source.accessStatus !== 'public-passages-inspected'
        || source.reading?.readingId !== expected.readingId || source.reading.status !== 'selected-passages'
        || typeof source.reading.scope !== 'string' || !source.reading.scope.trim()
        || !originalCarrier(source.artifact, expected) || !originalCarrier(artifact, expected)
        || uniqueRecord(artifacts, expected.artifactId) !== artifact) {
      errors.push(`particulate health.sources.${key}: exact inspected work, edition, reading and original carrier required`);
      continue;
    }
    actualReadings.set(key, reading);
  }

  for (const [key, input] of Object.entries(spec.facts)) {
    const source = spec.sources[input.source];
    const evidence = uniqueRecord(published.evidence, input.evidenceId);
    const fact = input.factId === null
      ? evidence?.numericFacts === undefined && evidence?.numericFact
      : evidence?.numericFact === undefined && uniqueRecord(evidence?.numericFacts, input.factId);
    if (!numericFields.every(field => fact?.[field] === input[field]))
      errors.push(`particulate health.facts.${key}: exact public fact identity and value/unit/quantity/subject/basis required`);
    const reading = actualReadings.get(input.source);
    const passage = uniqueRecord(reading?.passages, input.passageId);
    if (!boundPassage(evidence, passage, source, input, source.artifactId, passages) || !correctBounds(passage, source, input))
      errors.push(`particulate health.facts.${key}: exact inspected passage, original carrier and locator required`);
  }

  // The XLSX and ZIP share a download URL. Bind the ZIP's member locator in
  // the same reading, separately from the XLSX used for the numeric facts.
  const container = spec.container;
  const source = spec.sources[container.source];
  const reading = actualReadings.get(container.source);
  const artifact = uniqueRecord(reading?.artifacts, container.artifactId);
  const evidence = uniqueRecord(published.evidence, container.evidenceId);
  const passage = uniqueRecord(reading?.passages, container.passageId);
  if (!originalCarrier(artifact, container) || uniqueRecord(artifacts, container.artifactId) !== artifact
      || !boundPassage(evidence, passage, source, container, container.artifactId, passages)
      || !passage.locator.includes(container.archiveMember)
      || !correctBounds(passage, container, { pdfIndex: null }))
    errors.push('particulate health.container: exact public GLAM ZIP archive member evidence, inspected passage and carrier required');
  return errors;
}
