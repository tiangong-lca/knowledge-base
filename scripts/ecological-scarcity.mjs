import { rational, decimal, add, subtract, multiply, divide, result, exactResult } from './exact-rational.mjs';

// Closed v1 authority lives independently of the downloadable input. Source
// arithmetic and the author-stipulated service/sensitivity remain distinct.
const reviewed = {
  "caseId": "CASE-ECOLOGICAL-SCARCITY",
  "version": "1.0.0",
  "model": "swiss-2013-selected-ecofactors-and-author-service-v1",
  "createdAt": "2026-11-05",
  "status": "selected-source-arithmetic-and-author-illustration",
  "source": {
    "sourceId": "src-es-swiss-2013",
    "readingId": "rd-es-swiss-2013",
    "artifactId": "art-es-swiss-2013",
    "sha256": "af60472d4aa2ff66bcd6fc5929f37824595e0a4437dd1869a9c62ca5975cff20"
  },
  "facts": {
    "nmvocNormalization": {
      "value": "89025",
      "unit": "t NMVOC/a",
      "quantity": "normalization-flow",
      "subject": "switzerland-2013-air-nmvoc",
      "basis": "Switzerland; 2013 edition; Table 14; air emissions; displayed source values; NMVOC excluding methane and CFCs",
      "evidenceId": "ev-es-nmvoc",
      "factId": "nf-es-nmvoc-normalization",
      "passageId": "psg-es-nmvoc"
    },
    "nmvocCurrent": {
      "value": "89025",
      "unit": "t NMVOC/a",
      "quantity": "current-flow",
      "subject": "switzerland-2013-air-nmvoc",
      "basis": "Switzerland; 2013 edition; Table 14; air emissions; displayed source values; NMVOC excluding methane and CFCs",
      "evidenceId": "ev-es-nmvoc",
      "factId": "nf-es-nmvoc-current",
      "passageId": "psg-es-nmvoc"
    },
    "nmvocCritical": {
      "value": "81000",
      "unit": "t NMVOC/a",
      "quantity": "critical-flow",
      "subject": "switzerland-2013-air-nmvoc",
      "basis": "Switzerland; 2013 edition; Table 14; air emissions; displayed source values; NMVOC excluding methane and CFCs",
      "evidenceId": "ev-es-nmvoc",
      "factId": "nf-es-nmvoc-critical",
      "passageId": "psg-es-nmvoc"
    },
    "nmvocPublishedFactor": {
      "value": "14",
      "unit": "UBP/g NMVOC",
      "quantity": "published-rounded-ecofactor",
      "subject": "switzerland-2013-air-nmvoc",
      "basis": "Switzerland; 2013 edition; Table 14; air emissions; displayed source values; NMVOC excluding methane and CFCs",
      "evidenceId": "ev-es-nmvoc",
      "factId": "nf-es-nmvoc-factor",
      "passageId": "psg-es-nmvoc"
    },
    "noxNormalization": {
      "value": "78704",
      "unit": "t NOx as NO2/a",
      "quantity": "normalization-flow",
      "subject": "switzerland-2013-air-nox",
      "basis": "Switzerland; 2013 edition; Table 15; air emissions; displayed source values; NOx as NO2",
      "evidenceId": "ev-es-nox",
      "factId": "nf-es-nox-normalization",
      "passageId": "psg-es-nox"
    },
    "noxCurrent": {
      "value": "78704",
      "unit": "t NOx as NO2/a",
      "quantity": "current-flow",
      "subject": "switzerland-2013-air-nox",
      "basis": "Switzerland; 2013 edition; Table 15; air emissions; displayed source values; NOx as NO2",
      "evidenceId": "ev-es-nox",
      "factId": "nf-es-nox-current",
      "passageId": "psg-es-nox"
    },
    "noxCritical": {
      "value": "45000",
      "unit": "t NOx as NO2/a",
      "quantity": "critical-flow",
      "subject": "switzerland-2013-air-nox",
      "basis": "Switzerland; 2013 edition; Table 15; air emissions; displayed source values; NOx as NO2",
      "evidenceId": "ev-es-nox",
      "factId": "nf-es-nox-critical",
      "passageId": "psg-es-nox"
    },
    "noxPublishedFactor": {
      "value": "39",
      "unit": "UBP/g NOx as NO2",
      "quantity": "published-rounded-ecofactor",
      "subject": "switzerland-2013-air-nox",
      "basis": "Switzerland; 2013 edition; Table 15; air emissions; displayed source values; NOx as NO2",
      "evidenceId": "ev-es-nox",
      "factId": "nf-es-nox-factor",
      "passageId": "psg-es-nox"
    },
    "scalingConstant": {
      "value": "1000000000000",
      "unit": "1/a",
      "quantity": "ecofactor-scaling-constant",
      "subject": "ecological-scarcity-equation-4",
      "basis": "Switzerland; 2013 edition; Equation 4; c=10^12/a",
      "evidenceId": "ev-es-equation",
      "factId": "nf-es-scaling-constant",
      "passageId": "psg-es-equation"
    }
  },
  "reconstruction": {
    "equation": "UBP/Fn * (F/Fk)^2 * c",
    "gramsPerTonne": "1000000",
    "massConversionIsUnitDefinition": true,
    "differentialCharacterizationApplied": false,
    "normalizationRegion": "Switzerland",
    "referenceRegion": "Switzerland",
    "factorOutputUnit": "UBP/g of identified air emission",
    "unreportedPrecisionRecovered": false,
    "publishedRoundedFactorsUsedForScores": true
  },
  "service": {
    "amount": "1",
    "unit": "m2",
    "activity": "coat the same substrate in Switzerland",
    "performance": "identical coverage, durability and quality",
    "equivalence": "author-stipulated",
    "onlyDifferingInventories": "NMVOC excluding methane and CFCs and NOx as NO2 emitted to air",
    "allOtherActivitiesAndFlowsHeldEqual": true,
    "empiricalProductComparison": false,
    "wholeLifeCycleCoverage": false
  },
  "illustration": {
    "inventoryUnit": "g per stipulated service",
    "nmvocIdentity": "NMVOC excluding methane and CFCs; air emission",
    "noxIdentity": "NOx as NO2; air emission",
    "A": {
      "nmvoc": "4",
      "nox": "1"
    },
    "B": {
      "nmvoc": "2",
      "nox": "2"
    },
    "scoreUnit": "UBP per stipulated service",
    "commonFactorMultiplier": "10",
    "sensitivity": {
      "parameter": "x",
      "kind": "author-educational-multiplier-on-rounded-NOx-factor-only",
      "displayPoint": "0.5",
      "nmvocFactorHeldFixed": true,
      "inventoryHeldFixed": true,
      "normalizationAndCriticalFlowsHeldFixed": true,
      "modeledPolicyUpdate": false,
      "probabilityAssigned": false
    }
  },
  "interpretation": {
    "sourceEdition": "2013",
    "currentPolicyOrFactorRecommendation": false,
    "criticalFlowsAreEcologicalSafetyThresholds": false,
    "indicatorIsDamageMeasure": false,
    "scientificValidation": false,
    "humanExpertApproval": false,
    "allEnvironmentalCategoriesCovered": false
  }
};
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function shapeOf(value) {
  if (!object(value)) return null;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)]),
  );
}

function freeze(value) {
  if (object(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export const ecologicalScarcityInputShape = freeze(shapeOf(reviewed));
export const ecologicalScarcityFactKeys = Object.freeze(Object.keys(reviewed.facts));

export function validateEcologicalScarcityCase(spec) {
  const errors = [];

  function check(actual, expected, path) {
    if (!object(expected)) {
      if (actual !== expected) {
        errors.push(`${path}: expected reviewed value ${JSON.stringify(expected)}`);
      }
      return;
    }
    if (!object(actual)) {
      errors.push(`${path}: must be an object`);
      return;
    }

    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    const fieldsMatch = actualKeys.length === expectedKeys.length
      && actualKeys.every((key, index) => key === expectedKeys[index]);
    if (!fieldsMatch) {
      errors.push(`${path}: must contain exactly the reviewed fields ${expectedKeys.join(', ')}`);
    }
    for (const key of expectedKeys) {
      check(actual[key], expected[key], `${path}.${key}`);
    }
  }

  check(spec, reviewed, 'case');
  return errors;
}

function reconstructFactor(flow, facts, gramsPerTonne, spec) {
  const normal = multiply(facts[`${flow}Normalization`], gramsPerTonne);
  const current = multiply(facts[`${flow}Current`], gramsPerTonne);
  const critical = multiply(facts[`${flow}Critical`], gramsPerTonne);
  const normalization = divide(rational(1n), normal);
  const scarcityRatio = divide(current, critical);
  const weighting = multiply(scarcityRatio, scarcityRatio);
  const factor = multiply(multiply(normalization, weighting), facts.scalingConstant);
  const published = facts[`${flow}PublishedFactor`];

  return {
    normalizationFlowGramsPerYear: result(normal),
    currentFlowGramsPerYear: result(current),
    criticalFlowGramsPerYear: result(critical),
    // These reciprocals are about 10^-11 a/g. Their exact fractions are the
    // useful representation; a six-decimal display would misleadingly be zero.
    normalizationPerAnnualGram: exactResult(normalization),
    currentToCriticalRatio: result(scarcityRatio),
    squaredWeighting: result(weighting),
    reconstructedFactor: result(factor),
    publishedRoundedFactor: result(published),
    publishedMinusReconstructed: result(subtract(published, factor)),
    factorUnit: spec.facts[`${flow}PublishedFactor`].unit,
    differentialCharacterizationApplied: false,
  };
}

function scoreAlternative(inventory, factors, commonMultiplier, noxMultiplier) {
  const nmvocContribution = multiply(
    multiply(decimal(inventory.nmvoc), factors.nmvoc),
    commonMultiplier,
  );
  const noxContribution = multiply(
    multiply(multiply(decimal(inventory.nox), factors.nox), commonMultiplier),
    noxMultiplier,
  );
  return {
    nmvocContribution,
    noxContribution,
    total: add(nmvocContribution, noxContribution),
  };
}

function publicScore(score) {
  return {
    nmvocContribution: result(score.nmvocContribution),
    noxContribution: result(score.noxContribution),
    total: result(score.total),
  };
}

function compareAlternatives(illustration, factors, commonMultiplier, noxMultiplier) {
  const scoreA = scoreAlternative(illustration.A, factors, commonMultiplier, noxMultiplier);
  const scoreB = scoreAlternative(illustration.B, factors, commonMultiplier, noxMultiplier);
  const difference = subtract(scoreB.total, scoreA.total);
  const lowerScore = difference[0] > 0n ? 'A' : difference[0] < 0n ? 'B' : 'tie';
  return {
    A: publicScore(scoreA),
    B: publicScore(scoreB),
    differenceBMinusA: result(difference),
    lowerScore,
  };
}

export function evaluateEcologicalScarcityCase(spec) {
  const errors = validateEcologicalScarcityCase(spec);
  if (errors.length) {
    throw new TypeError(`Invalid ecological-scarcity case:\n${errors.join('\n')}`);
  }

  const facts = Object.fromEntries(
    ecologicalScarcityFactKeys.map(key => [key, decimal(spec.facts[key].value)]),
  );
  const gramsPerTonne = decimal(spec.reconstruction.gramsPerTonne);
  const reconstructed = Object.fromEntries(
    ['nmvoc', 'nox'].map(flow => [flow, reconstructFactor(flow, facts, gramsPerTonne, spec)]),
  );
  const illustration = spec.illustration;
  const factors = { nmvoc: facts.nmvocPublishedFactor, nox: facts.noxPublishedFactor };
  const unitMultiplier = rational(1n);
  const sensitivityPoint = decimal(illustration.sensitivity.displayPoint);
  const commonMultiplier = decimal(illustration.commonFactorMultiplier);
  const compare = (common, nox) => compareAlternatives(illustration, factors, common, nox);

  // The exact B-minus-A difference is intercept + slope*x. The common
  // multiplier scales both terms together and therefore leaves its root fixed.
  const intercept = multiply(
    subtract(decimal(illustration.B.nmvoc), decimal(illustration.A.nmvoc)),
    factors.nmvoc,
  );
  const slope = multiply(
    subtract(decimal(illustration.B.nox), decimal(illustration.A.nox)),
    factors.nox,
  );
  const negativeIntercept = rational(-intercept[0], intercept[1]);
  const threshold = divide(negativeIntercept, slope);

  return {
    caseId: spec.caseId,
    version: spec.version,
    reconstruction: reconstructed,
    illustration: {
      scoreBasis: 'published-rounded-2013-ecofactors',
      scoreUnit: illustration.scoreUnit,
      baseline: compare(unitMultiplier, unitMultiplier),
      commonScaling: {
        multiplier: illustration.commonFactorMultiplier,
        ...compare(commonMultiplier, unitMultiplier),
      },
      sensitivity: {
        kind: illustration.sensitivity.kind,
        parameter: illustration.sensitivity.parameter,
        displayPoint: illustration.sensitivity.displayPoint,
        noxFactorAtDisplay: result(multiply(factors.nox, sensitivityPoint)),
        display: compare(unitMultiplier, sensitivityPoint),
        differenceIntercept: result(intercept),
        differenceSlope: result(slope),
        tieMultiplier: result(threshold),
        atTie: compare(unitMultiplier, threshold),
        belowTieLowerScore: 'B',
        aboveTieLowerScore: 'A',
        modeledPolicyUpdate: false,
        probabilityAssigned: false,
      },
      serviceEquivalenceIsAuthorStipulated: true,
      empiricalProductComparison: false,
      wholeLifeCycleCoverage: false,
    },
    scientificApproval: false,
  };
}

function indexUniqueRecords(records, label, errors) {
  const indexed = new Map();
  for (const record of records) {
    if (!object(record) || typeof record.id !== 'string' || !record.id || indexed.has(record.id)) {
      errors.push(`ecological scarcity: ambiguous ${label} identity`);
    } else {
      indexed.set(record.id, record);
    }
  }
  return indexed;
}

function indexReadingRegister(register, errors) {
  const readings = new Map();
  const passages = new Map();
  const artifacts = new Map();
  const identities = new Set();
  let malformed = !object(register) || register.schemaVersion !== 1 || !Array.isArray(register.readings);

  function identify(record) {
    const validIdentity = object(record)
      && typeof record.id === 'string'
      && /^[A-Za-z][A-Za-z0-9._:-]*$/.test(record.id)
      && !identities.has(record.id);
    if (!validIdentity) {
      malformed = true;
      return false;
    }
    identities.add(record.id);
    return true;
  }

  if (!malformed) {
    for (const reading of register.readings) {
      if (!identify(reading)) continue;
      readings.set(reading.id, reading);
      if (!Array.isArray(reading.passages) || !Array.isArray(reading.artifacts)) {
        malformed = true;
        continue;
      }
      for (const passage of reading.passages) {
        if (identify(passage)) passages.set(passage.id, { reading, passage });
      }
      for (const artifact of reading.artifacts) {
        if (identify(artifact)) artifacts.set(artifact.id, { reading, artifact });
      }
    }
  }
  if (malformed) {
    errors.push('ecological scarcity: an unambiguous actual reading register is required');
  }
  return { readings, passages, artifacts };
}

function validateSelectedSource(selected, source, reading, errors) {
  // Carrier identity alone cannot prevent a source/reading being relabeled as
  // another edition. Keep this selected edition independent of input flags.
  // The repository research validator resolves the fixed workId in its actual
  // literature map; this gate binds the selected reading to that same work.
  const approvedVersion = 'Umwelt-Wissen Nr. 1330，德文 2013 年版，正文页码与 PDF 物理页相差两页。';
  const editionMatches = source?.version === approvedVersion
    && reading?.version === approvedVersion
    && reading?.workId === 'lit-com-14';
  if (!editionMatches) {
    errors.push('ecological scarcity: source and reading must retain the approved Swiss 2013 edition and selected work identity');
  }

  const sourceCarrierMatches = source?.artifact?.mediaType === 'application/pdf'
    && source.artifact.sha256 === selected.sha256;
  if (!sourceCarrierMatches) {
    errors.push('ecological scarcity: source snapshot must match the approved original Swiss 2013 PDF');
  }

  const inspectedAccess = [
    'passages-inspected',
    'public-passages-inspected',
    'public-full-text-inspected',
    'licensed-full-text-inspected',
  ];
  const selectedReadingMatches = source
    && inspectedAccess.includes(source.accessStatus)
    && source.reading?.readingId === selected.readingId
    && source.reading?.status === 'selected-passages'
    && typeof source.reading?.scope === 'string'
    && source.reading.scope.trim()
    && reading?.readingStatus === 'selected-passages';
  if (!selectedReadingMatches) {
    errors.push('ecological scarcity: source must bind the actual inspected selected reading and scope');
  }
}

function matchesNumericFact(evidence, input, selectedSource) {
  const facts = Array.isArray(evidence?.numericFacts) ? evidence.numericFacts : [];
  const matches = facts.filter(fact => fact?.id === input.factId);
  const uniqueFactIds = new Set(facts.map(fact => fact?.id)).size === facts.length;
  const factFields = ['value', 'unit', 'quantity', 'subject', 'basis'];
  return evidence
    && evidence.sourceId === selectedSource.sourceId
    && evidence.numericFact === undefined
    && matches.length === 1
    && uniqueFactIds
    && factFields.every(field => matches[0]?.[field] === input[field]);
}

function matchesPassageCarrier(evidence, input, selectedSource, reading, passageIndex, artifactIndex) {
  const located = passageIndex.get(input.passageId);
  const carrier = artifactIndex.get(located?.passage.artifactId);
  return reading
    && evidence?.readingId === selectedSource.readingId
    && evidence?.passageId === input.passageId
    && located?.reading === reading
    && carrier?.reading === reading
    && located?.passage.artifactId === selectedSource.artifactId
    && carrier?.artifact.id === selectedSource.artifactId
    && [undefined, 'retrieved'].includes(carrier?.artifact.kind)
    && carrier?.artifact.mediaType === 'application/pdf'
    && carrier?.artifact.sha256 === selectedSource.sha256;
}

/** Publication-policy hook: exact source facts plus actual selected passage and
 * original PDF joins. Identity checks establish consistency, not entailment. */
export function validateEcologicalScarcityFacts(spec, published, context = {}) {
  const errors = validateEcologicalScarcityCase(spec);
  if (errors.length) return errors;
  if (!object(published) || !Array.isArray(published.sources) || !Array.isArray(published.evidence)) {
    return ['ecological scarcity: a public source/evidence closure is required'];
  }

  const sources = indexUniqueRecords(published.sources, 'source', errors);
  const evidence = indexUniqueRecords(published.evidence, 'evidence', errors);
  const { readings, passages, artifacts } = indexReadingRegister(context?.readingRegister, errors);
  const selectedSource = spec.source;
  const source = sources.get(selectedSource.sourceId);
  const reading = readings.get(selectedSource.readingId);
  validateSelectedSource(selectedSource, source, reading, errors);

  for (const [key, input] of Object.entries(spec.facts)) {
    const record = evidence.get(input.evidenceId);
    if (!matchesNumericFact(record, input, selectedSource)) {
      errors.push(`ecological scarcity.facts.${key}: missing or mismatched public source fact identity/value/unit/quantity/subject/basis`);
    }
    if (!matchesPassageCarrier(record, input, selectedSource, reading, passages, artifacts)) {
      errors.push(`ecological scarcity.facts.${key}: missing or mismatched inspected original PDF passage carrier`);
    }
  }
  return errors;
}
