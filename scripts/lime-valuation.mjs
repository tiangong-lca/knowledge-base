import { rational, decimal, add, subtract, multiply, divide, fixed, result, exactResult } from './exact-rational.mjs';

// Independent closed authority: edits to the downloaded JSON cannot approve themselves.
const sources = {
  "jp2003": {
    "sourceId": "src-lime-jp2003",
    "readingId": "rd-lime-jp2003",
    "workId": "work-lime-jp2003",
    "version": "2003; 環境科学会誌16(5),357–368; Version of Record; Kobe Kernel institutional carrier with repository cover",
    "artifactId": "art-lime-jp2003",
    "sha256": "24ffddba87aa1efec562a9bc2ba1815f91989990dac67411cb271ebb6c061531"
  },
  "en2004": {
    "sourceId": "src-lime-2004-conjoint",
    "readingId": "rd-lime-2004-conjoint",
    "workId": "work-lime-2004-conjoint",
    "version": "2004; publisher VoR PDF; 9(3):196–205; printed DOI10.1065/lca2003.11.142; metadata DOI10.1007/BF02994194",
    "artifactId": "art-lime-2004-conjoint",
    "sha256": "c376f57ad8c5617ea65a94a19bd3df3e1528d206f55be4cae6432083d5e6d2ea"
  }
};
const factFields = ['sourceKey', 'evidenceId', 'factId', 'passageId', 'value', 'unit', 'quantity', 'subject', 'basis'];
const factRows = [
  ["normalizationHealth", "jp2003", "ev-lime-jp-normalization", "norm-health", "psg-lime-jp2003-normalization", "1430000", "DALY", "annual normalization damage", "human-health", "Table3 normalization row, Japan annual loading basis; displayed rounded total"],
  ["normalizationSocial", "jp2003", "ev-lime-jp-normalization", "norm-social", "psg-lime-jp2003-normalization", "54400", "million JPY", "annual normalization damage", "social-assets", "Table3 normalization row; social assets unit is million yen, not yen"],
  ["normalizationBiodiversity", "jp2003", "ev-lime-jp-normalization", "norm-biodiversity", "psg-lime-jp2003-normalization", ".5", "species", "annual normalization damage", "biodiversity", "Table3 normalization row; stipulated annual vascular-plant extinction proxy, not measured complete ecosystem loss"],
  ["normalizationPrimary", "jp2003", "ev-lime-jp-normalization", "norm-primary", "psg-lime-jp2003-normalization", "15400000000", "dry ton", "annual normalization damage", "primary-production", "Table3 normalization row; net primary production damage, dry-matter mass"],
  ["households", "jp2003", "ev-lime-jp-conversion", "household-count", "psg-lime-jp2003-conversion", "46607000", "households", "national household multiplier", "Japan households", "Section5 prints46607千世帯; year/source not specified in this passage"],
  ["baseSocial", "jp2003", "ev-lime-jp-conversion", "base-social", "psg-lime-jp2003-conversion", "100000000", "JPY", "attribute coding basis", "social-assets", "Section5 prints1億円"],
  ["basePrimary", "jp2003", "ev-lime-jp-conversion", "base-primary", "psg-lime-jp2003-conversion", "100000000", "ton", "attribute coding basis", "primary-production", "Section5 prints1億トン; damage indicator is dry mass"],
  ["baseTax", "jp2003", "ev-lime-jp-conversion", "base-tax", "psg-lime-jp2003-conversion", "1", "JPY", "attribute coding basis", "tax", "Section5 prints円"],
  ["baseHealth", "jp2003", "ev-lime-jp-conversion", "base-health", "psg-lime-jp2003-conversion", "1", "day", "attribute coding basis", "human-health", "Section5 prints1日; prior paragraph describes per-person annual loss"],
  ["baseBiodiversity", "jp2003", "ev-lime-jp-conversion", "base-biodiversity", "psg-lime-jp2003-conversion", "1", "species", "attribute coding basis", "biodiversity", "Section5 prints1種"],
  ["betaHealth", "jp2003", "ev-lime-jp-estimates", "beta-health", "psg-lime-jp2003-estimates", "-.139686", "model-coded attribute basis", "conditional-logit coefficient", "health", "Table6; coding bases stated onp364; preserve displayed precision"],
  ["betaSocial", "jp2003", "ev-lime-jp-estimates", "beta-social", "psg-lime-jp2003-estimates", "-.0008564", "model-coded attribute basis", "conditional-logit coefficient", "social", "Table6; coding bases stated onp364; preserve displayed precision"],
  ["betaPrimary", "jp2003", "ev-lime-jp-estimates", "beta-primary", "psg-lime-jp2003-estimates", "-.0034133", "model-coded attribute basis", "conditional-logit coefficient", "primary", "Table6; coding bases stated onp364; preserve displayed precision"],
  ["betaBiodiversity", "jp2003", "ev-lime-jp-estimates", "beta-biodiversity", "psg-lime-jp2003-estimates", "-1.47314", "model-coded attribute basis", "conditional-logit coefficient", "biodiversity", "Table6; coding bases stated onp364; preserve displayed precision"],
  ["betaTax", "jp2003", "ev-lime-jp-estimates", "beta-tax", "psg-lime-jp2003-estimates", "-.0000891", "model-coded attribute basis", "conditional-logit coefficient", "tax", "Table6; coding bases stated onp364; preserve displayed precision"],
  ["publishedHealth2003", "jp2003", "ev-lime-jp-weights", "wtp-health", "psg-lime-jp2003-wtp", "572000", "JPY/DALY", "reported marginal willingness to pay", "human-health", "Table7;1DALY(year) basis"],
  ["publishedSocial2003", "jp2003", "ev-lime-jp-weights", "wtp-social", "psg-lime-jp2003-wtp", "4460", "JPY/1000-JPY-damage", "reported marginal willingness to pay", "social-assets", "Table7;1000円 basis; printed4.46×10^3"],
  ["publishedPrimary2003", "jp2003", "ev-lime-jp-weights", "wtp-primary", "psg-lime-jp2003-wtp", "17.8", "JPY/dry-ton", "reported marginal willingness to pay", "primary-production", "Table7;1ton basis; damage indicator is dry net-primary-production mass"],
  ["publishedBiodiversity2003", "jp2003", "ev-lime-jp-weights", "wtp-biodiversity", "psg-lime-jp2003-wtp", "768000000000", "JPY/species", "reported marginal willingness to pay", "biodiversity", "Table7;1species basis; vascular-plant extinction proxy"],
  ["annualHealth", "jp2003", "ev-lime-jp-relative-weights", "annual-value-health", "psg-lime-jp2003-relative-weights", "818000000000", "JPY", "reported annual reference damage equivalent", "health", "Table8; Table7 WTP times Table3 normalization damage with unit conversion"],
  ["annualSocial", "jp2003", "ev-lime-jp-relative-weights", "annual-value-social", "psg-lime-jp2003-relative-weights", "243000000000", "JPY", "reported annual reference damage equivalent", "social", "Table8; Table7 WTP times Table3 normalization damage with unit conversion"],
  ["annualPrimary", "jp2003", "ev-lime-jp-relative-weights", "annual-value-primary", "psg-lime-jp2003-relative-weights", "274000000000", "JPY", "reported annual reference damage equivalent", "primary", "Table8; Table7 WTP times Table3 normalization damage with unit conversion"],
  ["annualBiodiversity", "jp2003", "ev-lime-jp-relative-weights", "annual-value-biodiversity", "psg-lime-jp2003-relative-weights", "384000000000", "JPY", "reported annual reference damage equivalent", "biodiversity", "Table8; Table7 WTP times Table3 normalization damage with unit conversion"],
  ["shareHealth", "jp2003", "ev-lime-jp-relative-weights", "share-health", "psg-lime-jp2003-relative-weights", ".48", "dimensionless", "reported relative annual-damage weight", "health", "Table8; rounded share of summed annual reference damage equivalents"],
  ["shareSocial", "jp2003", "ev-lime-jp-relative-weights", "share-social", "psg-lime-jp2003-relative-weights", ".14", "dimensionless", "reported relative annual-damage weight", "social", "Table8; rounded share of summed annual reference damage equivalents"],
  ["sharePrimary", "jp2003", "ev-lime-jp-relative-weights", "share-primary", "psg-lime-jp2003-relative-weights", ".16", "dimensionless", "reported relative annual-damage weight", "primary", "Table8; rounded share of summed annual reference damage equivalents"],
  ["shareBiodiversity", "jp2003", "ev-lime-jp-relative-weights", "share-biodiversity", "psg-lime-jp2003-relative-weights", ".22", "dimensionless", "reported relative annual-damage weight", "biodiversity", "Table8; rounded share of summed annual reference damage equivalents"],
  ["publishedHealth2004", "en2004", "ev-lime-2004-conjoint-health-wf", null, "psg-lime-2004-conjoint-weights", "9700000", "JPY/DALY", "published monetary weighting factor", "human health", "2004 Table7; 1DALY(year)"],
  ["publishedPrimary2004", "en2004", "ev-lime-2004-conjoint-primary-wf", null, "psg-lime-2004-conjoint-weights", "20200", "JPY/dry t", "published monetary weighting factor", "primary production", "2004 Table7 1ton; Table1 defines NPP dry-ton"],
];
const facts = Object.fromEntries(factRows.map(([key, ...values]) => [
  key,
  Object.fromEntries(factFields.map((field, fieldIndex) => [field, values[fieldIndex]])),
]));
const reviewed = {
  caseId: "CASE-LIME-VALUATION",
  version: "1.0.0",
  model: "reported-2003-arithmetic-and-two-published-factor-sets-v1",
  createdAt: "2026-11-05",
  status: "selected-source-arithmetic-and-author-illustration",
  sources,
  facts,
  conversions: {
    "daysPerDALY": "365",
    "daysPerDALYRole": "conditional arithmetic convention; household-to-person national health conversion unresolved",
    "millionJPYInJPY": "1000000",
    "socialDamageBlockJPY": "1000",
    "unreportedPrecisionRecovered": false,
    "publishedDiscrepanciesRepaired": false,
    "roundingEstablishedAsDiscrepancyCause": false
  },
  service: {
    "amount": "1000",
    "unit": "metric tonnes of product",
    "destination": "the same Japanese plant",
    "grade": "the same stipulated grade",
    "deliveryDate": "the same stipulated date",
    "equivalence": "author-stipulated",
    "allOtherActivitiesAndDamagesHeldEqual": true,
    "empiricalProductComparison": false,
    "wholeLifeCycleCoverage": false
  },
  illustration: {
    "kind": "author-stipulated-two-damage-route-comparison",
    "healthUnit": "DALY",
    "primaryProductionUnit": "dry metric tonnes lost",
    "A": {
      "health": "0.001",
      "primaryProduction": "100"
    },
    "B": {
      "health": "0.004",
      "primaryProduction": "10"
    },
    "scoreUnit": "JPY per stipulated delivered service",
    "onlyTwoDamageRowsDiffer": true,
    "factorsArePublishedNotReconstructed": true
  },
  interpretation: {
    "rawChoiceDataReconstructed": false,
    "conditionalLogitReestimated": false,
    "humanHealthNationalConversionClosed": false,
    "observedPreferenceShift": false,
    "timeTrend": false,
    "commonCurrencyPriceYearEstablished": false,
    "crossEditionAbsoluteScoreComparison": false,
    "scientificValidation": false,
    "humanExpertApproval": false,
    "currentFactorRecommendation": false,
    "uncertaintyPropagated": false
  },
};
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function freeze(value) {
  if (object(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function shapeOf(value) {
  if (!object(value)) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)]),
  );
}

export const limeValuationInputShape = freeze(shapeOf(reviewed));
export const limeValuationFactKeys = Object.freeze(Object.keys(facts));

export function validateLimeValuationCase(spec) {
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

const damageRows = ['Health', 'Social', 'Primary', 'Biodiversity'];
const negate = value => rational(-value[0], value[1]);

function reconstructWeights(numericFacts, conversions) {
  return Object.fromEntries(damageRows.map(row => {
    // The ratio permits positive household tax for avoiding one whole coded
    // damage increment. The iso-utility tax slope for added damage is negative.
    const householdWtpPerCodedIncrement = multiply(
      divide(numericFacts[`beta${row}`], numericFacts.betaTax),
      numericFacts.baseTax,
    );
    const householdWtpPerPhysicalDamageUnit = divide(
      householdWtpPerCodedIncrement,
      numericFacts[`base${row}`],
    );

    // The health path is only a conditional arithmetic coincidence. The other
    // rows apply the reported household multiplier to their physical damage unit.
    const scaledMagnitude = row === 'Health'
      ? multiply(householdWtpPerPhysicalDamageUnit, decimal(conversions.daysPerDALY))
      : multiply(householdWtpPerPhysicalDamageUnit, numericFacts.households);
    const reconstructedMagnitude = row === 'Social'
      ? multiply(scaledMagnitude, decimal(conversions.socialDamageBlockJPY))
      : scaledMagnitude;
    const publishedFactor = numericFacts[`published${row}2003`];

    return [row.toLowerCase(), {
      isoUtilityTaxSlope: result(negate(householdWtpPerCodedIncrement)),
      positiveAvoidedDamageWtpPerCodedUnit: result(householdWtpPerCodedIncrement),
      codedAttributeBasisAmount: reviewed.facts[`base${row}`].value,
      codedAttributeBasisUnit: reviewed.facts[`base${row}`].unit,
      slopeAndWtpUnit: 'JPY per household per coded damage attribute increment',
      householdWtpPerOneDamageUnit: exactResult(householdWtpPerPhysicalDamageUnit),
      reconstructedMagnitude: result(reconstructedMagnitude),
      publishedFactor: result(publishedFactor),
      publishedMinusReconstructed: result(subtract(publishedFactor, reconstructedMagnitude)),
      outputUnit: reviewed.facts[`published${row}2003`].unit,
      reconstructionStatus: row === 'Health'
        ? 'conditional ratio-times-365 arithmetic coincidence; national household-to-person conversion unresolved'
        : 'reported coefficient ratio times household multiplier divided by coding basis; displayed precision only',
      roundingEstablishedAsDiscrepancyCause: false,
      publishedValueRepaired: false,
    }];
  }));
}

function annualReference(numericFacts, conversions) {
  const socialNormalizationJPY = multiply(
    numericFacts.normalizationSocial,
    decimal(conversions.millionJPYInJPY),
  );
  const damagesInFactorUnits = {
    Health: numericFacts.normalizationHealth,
    Social: divide(socialNormalizationJPY, decimal(conversions.socialDamageBlockJPY)),
    Primary: numericFacts.normalizationPrimary,
    Biodiversity: numericFacts.normalizationBiodiversity,
  };
  const annualAmounts = Object.fromEntries(damageRows.map(row => [
    row,
    multiply(numericFacts[`published${row}2003`], damagesInFactorUnits[row]),
  ]));
  const totalAnnualAmount = Object.values(annualAmounts).reduce(add, rational(0n));
  const rows = Object.fromEntries(damageRows.map(row => {
    const shareOfUnroundedAmounts = divide(annualAmounts[row], totalAnnualAmount);
    return [row.toLowerCase(), {
      damageInFactorUnits: result(damagesInFactorUnits[row]),
      factorUnit: reviewed.facts[`published${row}2003`].unit,
      calculatedAmountJPY: result(annualAmounts[row]),
      publishedTable8AmountJPY: result(numericFacts[`annual${row}`]),
      publishedMinusCalculatedAmountJPY: result(subtract(numericFacts[`annual${row}`], annualAmounts[row])),
      shareOfUnroundedAmounts: result(shareOfUnroundedAmounts),
      shareRounded2: fixed(shareOfUnroundedAmounts, 2),
      publishedTable8Share: result(numericFacts[`share${row}`]),
      publishedMinusCalculatedShare: result(subtract(numericFacts[`share${row}`], shareOfUnroundedAmounts)),
    }];
  }));

  return {
    socialNormalizationJPY: result(socialNormalizationJPY),
    socialNormalization1000JPYBlocks: result(damagesInFactorUnits.Social),
    rows,
    totalJPY: result(totalAnnualAmount),
    amountUnit: 'JPY on the published annual reference-damage basis',
    sharesUseUnroundedCalculatedAmounts: true,
    sourceRoundingProcedureReconstructed: false,
  };
}

function routeComparison(illustration, numericFacts, year) {
  const healthFactor = numericFacts[`publishedHealth${year}`];
  const primaryProductionFactor = numericFacts[`publishedPrimary${year}`];

  function score(route) {
    const healthContribution = multiply(decimal(route.health), healthFactor);
    const primaryProductionContribution = multiply(
      decimal(route.primaryProduction),
      primaryProductionFactor,
    );
    return {
      healthContribution,
      primaryProductionContribution,
      total: add(healthContribution, primaryProductionContribution),
    };
  }

  function publicScore(routeScore) {
    return Object.fromEntries(
      Object.entries(routeScore).map(([key, value]) => [key, result(value)]),
    );
  }

  const routeA = score(illustration.A);
  const routeB = score(illustration.B);
  const differenceBMinusA = subtract(routeB.total, routeA.total);
  let lowerScore = 'tie';
  if (differenceBMinusA[0] > 0n) {
    lowerScore = 'A';
  } else if (differenceBMinusA[0] < 0n) {
    lowerScore = 'B';
  }

  return {
    factorBasis: `${year} published factors; two complete relevant damage rows`,
    healthFactor: result(healthFactor),
    primaryProductionFactor: result(primaryProductionFactor),
    healthToPrimaryFactorRatio: result(divide(healthFactor, primaryProductionFactor)),
    factorRatioUnit: 'dry t/DALY',
    A: publicScore(routeA),
    B: publicScore(routeB),
    differenceBMinusA: result(differenceBMinusA),
    lowerScore,
  };
}

export function evaluateLimeValuationCase(spec) {
  const errors = validateLimeValuationCase(spec);
  if (errors.length) {
    throw new TypeError(`Invalid lime-valuation case:\n${errors.join('\n')}`);
  }

  const numericFacts = Object.fromEntries(
    limeValuationFactKeys.map(key => [key, decimal(spec.facts[key].value)]),
  );
  const illustration = spec.illustration;
  const differenceHealth = subtract(decimal(illustration.B.health), decimal(illustration.A.health));
  const differencePrimaryProduction = subtract(
    decimal(illustration.B.primaryProduction),
    decimal(illustration.A.primaryProduction),
  );
  const tieFactorRatio = divide(negate(differencePrimaryProduction), differenceHealth);

  return {
    caseId: spec.caseId,
    version: spec.version,
    reconstruction: reconstructWeights(numericFacts, spec.conversions),
    annualReference: annualReference(numericFacts, spec.conversions),
    illustration: {
      scoreUnit: illustration.scoreUnit,
      published2003: routeComparison(illustration, numericFacts, '2003'),
      published2004: routeComparison(illustration, numericFacts, '2004'),
      differenceBMinusAHealthDALY: result(differenceHealth),
      differenceBMinusAPrimaryDryTonnes: result(differencePrimaryProduction),
      tieHealthToPrimaryFactorRatio: result(tieFactorRatio),
      thresholdUnit: 'dry t/DALY',
      aboveThresholdLowerScore: 'A',
      belowThresholdLowerScore: 'B',
      atThresholdLowerScore: 'tie',
      sameStipulatedService: true,
      allOtherDamagesHeldEqual: true,
      observedPreferenceShift: false,
      timeTrend: false,
      crossEditionAbsoluteComparison: false,
    },
    scientificApproval: false,
    humanExpertApproval: false,
  };
}

function indexRecords(records, label, errors, identities = new Set()) {
  const index = new Map();
  for (const record of records) {
    if (!object(record) || typeof record.id !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(record.id)
        || identities.has(record.id)) {
      errors.push(`lime valuation: ambiguous or malformed ${label} identity`);
      continue;
    }
    identities.add(record.id);
    index.set(record.id, record);
  }
  return index;
}

/** Exact identity/type/edition/PDF joins establish consistency, not entailment. */
export function validateLimeValuationFacts(spec, published, context = {}) {
  const errors = validateLimeValuationCase(spec);
  if (errors.length) {
    return errors;
  }
  if (!object(published) || !Array.isArray(published.sources) || !Array.isArray(published.evidence)) {
    return ['lime valuation: public source/evidence closure is required'];
  }

  const sourceIndex = indexRecords(published.sources, 'source', errors);
  const evidenceIndex = indexRecords(published.evidence, 'evidence', errors);
  const register = context?.readingRegister;
  if (!object(register) || register.schemaVersion !== 1 || !Array.isArray(register.readings)) {
    return [...errors, 'lime valuation: actual reading register is required'];
  }

  const identities = new Set();
  const readings = indexRecords(register.readings, 'reading', errors, identities);
  const passages = new Map();
  const artifacts = new Map();
  for (const reading of readings.values()) {
    if (!Array.isArray(reading.passages) || !Array.isArray(reading.artifacts)) {
      errors.push('lime valuation: actual passage and artifact arrays are required');
      continue;
    }
    for (const [id, passage] of indexRecords(reading.passages, 'passage', errors, identities)) {
      passages.set(id, { reading, passage });
    }
    for (const [id, artifact] of indexRecords(reading.artifacts, 'artifact', errors, identities)) {
      artifacts.set(id, { reading, artifact });
    }
  }

  for (const [key, selected] of Object.entries(spec.sources)) {
    const source = sourceIndex.get(selected.sourceId);
    const reading = readings.get(selected.readingId);
    if (source?.version !== selected.version || reading?.version !== selected.version || reading?.workId !== selected.workId) {
      errors.push(`lime valuation.sources.${key}: approved edition and work identity required`);
    }
    if (!source || !['passages-inspected', 'public-passages-inspected', 'public-full-text-inspected', 'licensed-full-text-inspected'].includes(source.accessStatus)
        || source.reading?.readingId !== selected.readingId || source.reading?.status !== 'selected-passages'
        || typeof source.reading?.scope !== 'string' || !source.reading.scope.trim() || reading?.readingStatus !== 'selected-passages') {
      errors.push(`lime valuation.sources.${key}: actual inspected selected reading and scope required`);
    }
    if (source?.artifact?.mediaType !== 'application/pdf' || source.artifact.sha256 !== selected.sha256) {
      errors.push(`lime valuation.sources.${key}: fixed original PDF source snapshot required`);
    }
  }

  for (const [key, input] of Object.entries(spec.facts)) {
    const selected = spec.sources[input.sourceKey];
    const evidence = evidenceIndex.get(input.evidenceId);
    // 2003 uses named plural facts; the 2004 source publishes singular facts.
    // Preserve that distinction rather than fabricating a singular fact ID.
    let fact;
    if (input.factId === null) {
      if (evidence?.numericFacts === undefined && object(evidence?.numericFact)) {
        fact = evidence.numericFact;
      }
    } else if (evidence?.numericFact === undefined && Array.isArray(evidence?.numericFacts)) {
      const factIds = evidence.numericFacts.map(item => item?.id);
      const matchingFacts = evidence.numericFacts.filter(item => item?.id === input.factId);
      if (factIds.every(id => typeof id === 'string' && id)
          && new Set(factIds).size === factIds.length && matchingFacts.length === 1) {
        fact = matchingFacts[0];
      }
    }
    if (!evidence || evidence.sourceId !== selected.sourceId || !fact
        || !['value', 'unit', 'quantity', 'subject', 'basis'].every(field => fact[field] === input[field])) {
      errors.push(`lime valuation.facts.${key}: exact public numeric fact identity/value/unit/quantity/subject/basis required`);
    }

    const reading = readings.get(selected.readingId);
    const located = passages.get(input.passageId);
    const carrier = artifacts.get(located?.passage.artifactId);
    if (!reading || evidence?.readingId !== selected.readingId || evidence?.passageId !== input.passageId
        || located?.reading !== reading || carrier?.reading !== reading || located?.passage.artifactId !== selected.artifactId
        || carrier?.artifact.id !== selected.artifactId || ![undefined, 'retrieved'].includes(carrier?.artifact.kind)
        || carrier?.artifact.mediaType !== 'application/pdf' || carrier?.artifact.sha256 !== selected.sha256) {
      errors.push(`lime valuation.facts.${key}: exact inspected reading/passage/original PDF carrier required`);
    }
  }
  return errors;
}
