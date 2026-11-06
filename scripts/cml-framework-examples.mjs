import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { add, decimal, divide, fixed, multiply, rational, result, subtract } from './exact-rational.mjs';

const fields = names => Object.fromEntries(names.map(name => [name, null]));
const numericFields = ['value', 'unit', 'quantity', 'subject', 'basis'];
const sourceShape = fields(['sourceId', 'workId', 'readingId', 'artifactId', 'sha256', 'pageCount']);
const factShape = fields(['source', 'evidenceId', 'passageId', 'factId', 'pdfIndex', ...numericFields]);
const substances = ['acetone', 'toluene', 'methane'];
const scores = [9, 7, 5, 3, 1];
const processFacts = [
  'electricityOutput', 'electricityInputAluminium', 'electricityInputFoil',
  'aluminiumInputElectricity', 'aluminiumOutput', 'aluminiumInputFoil',
  'foilOutput', 'foilInputUse', 'bagOutput', 'bagDemand',
  'wasteElectricity', 'wasteAluminium', 'wasteFoil', 'wasteUse',
  'reportedSecondDeterminant', 'reportedAluminiumActivity',
  'reportedAluminiumOutputElasticity', 'reportedWasteDecreasePercent',
];
const screeningFacts = [
  ...substances.flatMap(name => ['Central', 'Low', 'High', 'ReportedScore'].map(suffix => name + suffix)),
  ...scores.slice(1).map(score => `score${score}Lower`),
  ...scores.slice(0, -1).map(score => `score${score}Upper`),
];

export const cmlFrameworkExamplesInputShape = {
  ...fields(['caseId', 'version', 'model', 'createdAt', 'status']),
  sources: { guide: sourceShape, epa: sourceShape },
  facts: Object.fromEntries([...processFacts, ...screeningFacts].map(key => [key, factShape])),
  processScenario: fields(['kind', 'changedCoefficient', 'increasePercent', 'fixedOtherCoefficients', 'fixedDemand']),
  screeningRule: fields([
    'kind', 'endpointConvention', 'gapConvention', 'rangeMeaning', 'facilityScoreModifierApplied', 'criteriaScoresAggregated',
  ]),
  scope: fields([
    'processExampleImaginary', 'processInventoryMetric', 'unlistedBalanceCoefficients', 'historicalSoftwareExecuted',
    'physicalFeasibilityEstablished', 'empiricalValidation', 'screeningExampleIsSeparate', 'rangeIsProbabilityInterval',
  ]),
};

// Independent of the downloadable file and publication manifest. Object key
// order and whitespace do not change the closed input's identity.
const reviewedV1Digest = 'fa1d536ac126c3bad2c31a6ff6da7c424dee4730a091b8a1d447a8caedae1a55';
// Pin the complete citation coordinates independently of the mutable ledger.
const reviewedPassages = Object.freeze(Object.fromEntries([
  ['psg-cml-1992-part1-sandwich-inventory',
    '§2.4 Example、Table 2.3 和 Eqs. 2.3–2.6，印刷 pp38–39', '38–39', 42, 43],
  ['psg-cml-1992-part1-sandwich-sensitivity',
    '§5.2 Example 和 Eq. 5.2，含小幅改动条件，印刷 pp60–61', '60–61', 63, 64],
  ['psg-kb52-cml1992-guide-pocp-factors',
    '附录B §B.2.5 Table B.7 印刷pp83、85指定物质行', '83；85', 85, 87],
  ['psg-kb52-epa1994-p2-pocp-scores',
    'Table 5，印刷p20，acetone与toluene两行的POCP分数栏', '20', 27],
  ['psg-kb52-epa1994-p2-pocp-bins',
    'Table 2 续，印刷p11，POCP分档、示例和场地修正', '11', 18],
].map(([id, locator, printedPages, ...pdfIndices]) => [
  id, Object.freeze({ locator, printedPages, pdfIndices: Object.freeze(pdfIndices) }),
])));
function sortJsonKeys(_key, value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
  }
  return value;
}

export function validateCmlFrameworkExamplesCase(spec) {
  const invalid = ['CML framework examples: exact reviewed cml-framework-examples v1 input required'];
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return invalid;
  try {
    const hash = createHash('sha256').update(JSON.stringify(spec, sortJsonKeys)).digest('hex');
    return hash === reviewedV1Digest ? [] : invalid;
  } catch {
    return invalid;
  }
}

const zero = rational(0n);
const one = rational(1n);
const hundred = rational(100n);
const negate = value => subtract(zero, value);
const addAll = values => values.reduce(add, zero);
const percent = value => multiply(hundred, value);
const display = value => ({ ...result(value), fixed3: fixed(value, 3) });

function processDiagnosis(facts, input) {
  // First close the two downstream balances. Electricity and aluminium have
  // mutual inputs, so solve their remaining two balances simultaneously.
  const use = divide(facts.bagDemand, facts.bagOutput);
  const foil = divide(negate(multiply(facts.foilInputUse, use)), facts.foilOutput);
  const electricityDemand = negate(multiply(facts.electricityInputFoil, foil));
  const aluminiumDemand = negate(multiply(facts.aluminiumInputFoil, foil));
  const electricityOutput = facts.electricityOutput;
  const electricityInput = facts.electricityInputAluminium;
  const aluminiumInput = facts.aluminiumInputElectricity;
  const aluminiumNumerator = subtract(
    multiply(electricityOutput, aluminiumDemand), multiply(aluminiumInput, electricityDemand),
  );
  const downstreamDiagonal = multiply(facts.foilOutput, facts.bagOutput);

  function solve(aluminiumOutput) {
    const determinant = subtract(
      multiply(electricityOutput, aluminiumOutput), multiply(electricityInput, aluminiumInput),
    );
    const electricity = divide(subtract(
      multiply(aluminiumOutput, electricityDemand), multiply(electricityInput, aluminiumDemand),
    ), determinant);
    const aluminium = divide(aluminiumNumerator, determinant);
    const waste = {
      electricity: multiply(facts.wasteElectricity, electricity),
      aluminium: multiply(facts.wasteAluminium, aluminium),
      foil: multiply(facts.wasteFoil, foil),
      use: multiply(facts.wasteUse, use),
    };
    const netFlows = {
      electricityMJ: addAll([
        multiply(electricityOutput, electricity), multiply(electricityInput, aluminium),
        multiply(facts.electricityInputFoil, foil),
      ]),
      aluminiumKg: addAll([
        multiply(aluminiumInput, electricity), multiply(aluminiumOutput, aluminium),
        multiply(facts.aluminiumInputFoil, foil),
      ]),
      foilKg: add(multiply(facts.foilOutput, foil), multiply(facts.foilInputUse, use)),
      hundredBags: multiply(facts.bagOutput, use),
    };
    return {
      determinant, activities: { electricity, aluminium, foil, use }, netFlows,
      waste, totalWaste: addAll(Object.values(waste)),
    };
  }

  const aluminiumOutput = facts.aluminiumOutput;
  const baseline = solve(aluminiumOutput);
  const electricityUsedByAluminium = negate(multiply(electricityInput, baseline.activities.aluminium));
  const electricityProduced = multiply(electricityOutput, baseline.activities.electricity);

  // Differentiate the two coupled balances at the baseline. The derivative
  // system has RHS [0, -baseline aluminium activity] and the same determinant.
  const electricityDerivative = divide(
    multiply(electricityInput, baseline.activities.aluminium), baseline.determinant,
  );
  const aluminiumDerivative = divide(
    negate(multiply(electricityOutput, baseline.activities.aluminium)), baseline.determinant,
  );
  const wasteDerivative = add(
    multiply(facts.wasteElectricity, electricityDerivative), multiply(facts.wasteAluminium, aluminiumDerivative),
  );
  const elasticity = divide(multiply(wasteDerivative, aluminiumOutput), baseline.totalWaste);
  const increasePercent = decimal(input.processScenario.increasePercent);
  const changedOutput = multiply(aluminiumOutput, add(one, divide(increasePercent, hundred)));
  const changed = solve(changedOutput);
  const present = record => Object.fromEntries(Object.entries(record).map(([key, value]) => [key, result(value)]));

  return {
    serviceBags: result(multiply(hundred, facts.bagDemand)),
    baseline: {
      activities: present(baseline.activities),
      netFlows: present(baseline.netFlows),
      wasteByProcessKg: present(baseline.waste),
      totalWasteKg: result(baseline.totalWaste),
      electricityWasteShare: result(divide(baseline.waste.electricity, baseline.totalWaste)),
      electricityWastePercent: display(percent(divide(baseline.waste.electricity, baseline.totalWaste))),
      electricityUsedByAluminiumMJ: result(electricityUsedByAluminium),
      aluminiumShareOfElectricity: result(divide(electricityUsedByAluminium, electricityProduced)),
      aluminiumPercentOfElectricity: display(percent(divide(electricityUsedByAluminium, electricityProduced))),
    },
    determinants: {
      baseline: result(multiply(baseline.determinant, downstreamDiagonal)),
      secondColumnReplacement: result(multiply(aluminiumNumerator, downstreamDiagonal)),
      printedSecondColumnReplacement: input.facts.reportedSecondDeterminant.value,
      printedAluminiumActivity: input.facts.reportedAluminiumActivity.value,
      impliedByPrintedSecondAndComputedBaseline: result(divide(
        facts.reportedSecondDeterminant, multiply(baseline.determinant, downstreamDiagonal),
      )),
    },
    sensitivity: {
      baselineAluminiumOutput: result(aluminiumOutput),
      changedAluminiumOutput: result(changedOutput),
      changeInCoefficientPercent: result(increasePercent),
      wasteDerivativeKgPerCoefficientUnit: result(wasteDerivative),
      aluminiumOutputElasticity: display(elasticity),
      localWasteChangePercent: display(multiply(elasticity, increasePercent)),
      finiteWasteChangePercent: display(percent(divide(subtract(changed.totalWaste, baseline.totalWaste), baseline.totalWaste))),
      finiteWasteKg: display(changed.totalWaste),
      finiteActivities: present(changed.activities),
      finiteNetFlows: present(changed.netFlows),
      printedAluminiumOutputElasticity: input.facts.reportedAluminiumOutputElasticity.value,
      printedApproximateWasteDecreasePercent: input.facts.reportedWasteDecreasePercent.value,
    },
  };
}

function epaScreening(facts, input) {
  const bands = scores.map(score => ({
    score, lower: facts[`score${score}Lower`], upper: facts[`score${score}Upper`],
  }));
  const less = (left, right) => subtract(left, right)[0] < 0n;
  const classify = value => bands.find(({ lower, upper }) =>
    (!lower || !less(value, lower)) && (!upper || !less(upper, value)),
  )?.score ?? null;
  const selected = Object.fromEntries(substances.map(name => {
    const central = facts[`${name}Central`], low = facts[`${name}Low`], high = facts[`${name}High`];
    const recomputedCentralScore = classify(central);
    const printedScore = Number(input.facts[`${name}ReportedScore`].value);
    const intersectedScores = bands.filter(({ lower, upper }) =>
      (!lower || !less(high, lower)) && (!upper || !less(upper, low)),
    ).map(band => band.score);
    const rangeOverlapsUnassignedGap = bands.slice(1).some(({ lower }, index) => {
      const previousUpper = bands[index].upper;
      return less(previousUpper, lower) && less(previousUpper, high) && less(low, lower);
    });
    return [name, {
      centralFactor: input.facts[`${name}Central`].value,
      rangeLowFactor: input.facts[`${name}Low`].value,
      rangeHighFactor: input.facts[`${name}High`].value,
      printedScore,
      printedScoreContext: name === 'methane' ? 'EPA Table 2 category example' : 'EPA Table 5 material assignment',
      recomputedCentralScore,
      recomputedLowScore: classify(low),
      recomputedHighScore: classify(high),
      intersectedScores,
      rangeOverlapsUnassignedGap,
      printedScoreMatchesCentral: printedScore === recomputedCentralScore,
    }];
  }));
  return { selected };
}

export function evaluateCmlFrameworkExamplesCase(spec) {
  const errors = validateCmlFrameworkExamplesCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));
  const facts = Object.fromEntries(Object.entries(spec.facts).map(([key, fact]) => [key, decimal(fact.value)]));
  return {
    processDiagnosis: processDiagnosis(facts, spec),
    epaScreening: epaScreening(facts, spec),
    scope: { ...spec.scope },
  };
}

const records = value => Array.isArray(value) ? value : [];
function uniqueRecord(value, id) {
  const matches = records(value).filter(record => record?.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

function samePdf(artifact, pin) {
  return artifact?.sha256 === pin.sha256 && artifact.mediaType === 'application/pdf'
    && (artifact.kind === undefined || artifact.kind === 'retrieved') && artifact.pageCount === pin.pageCount;
}

/** Require actual selected passages and exact numeric tuples in the public closure. */
export function validateCmlFrameworkExamplesFacts(spec, published, context = {}) {
  const errors = validateCmlFrameworkExamplesCase(spec);
  if (errors.length) return errors;
  if (!Array.isArray(published?.sources) || !Array.isArray(published?.evidence))
    return ['CML framework examples: public source and evidence closure required'];
  const register = context?.readingRegister;
  if (register?.schemaVersion !== 1 || !Array.isArray(register.readings))
    return ['CML framework examples: actual reading register required'];

  const allArtifacts = register.readings.flatMap(reading => records(reading?.artifacts));
  const allPassages = register.readings.flatMap(reading => records(reading?.passages));
  const inspectedReadings = new Map();
  for (const [key, pin] of Object.entries(spec.sources)) {
    const source = uniqueRecord(published.sources, pin.sourceId);
    const reading = uniqueRecord(register.readings, pin.readingId);
    const artifact = uniqueRecord(reading?.artifacts, pin.artifactId);
    if (source?.accessStatus !== 'public-passages-inspected'
        || source.reading?.readingId !== pin.readingId || source.reading.status !== 'selected-passages'
        || typeof source.reading.scope !== 'string' || !source.reading.scope.trim()
        || reading?.workId !== pin.workId || reading.readingStatus !== 'selected-passages'
        || !samePdf(source.artifact, pin) || !samePdf(artifact, pin)
        || uniqueRecord(allArtifacts, pin.artifactId) !== artifact) {
      errors.push(`CML framework examples.sources.${key}: exact inspected source, work, reading and original PDF required`);
      continue;
    }
    inspectedReadings.set(key, reading);
  }

  for (const [key, fact] of Object.entries(spec.facts)) {
    const pin = spec.sources[fact.source];
    const reading = inspectedReadings.get(fact.source);
    const evidence = uniqueRecord(published.evidence, fact.evidenceId);
    const passage = uniqueRecord(reading?.passages, fact.passageId);
    const reviewedPassage = reviewedPassages[fact.passageId];
    if (!reviewedPassage || evidence?.sourceId !== pin.sourceId || evidence.readingId !== pin.readingId
        || evidence.passageId !== fact.passageId || evidence.locator !== reviewedPassage.locator
        || passage?.artifactId !== pin.artifactId || passage.locator !== reviewedPassage.locator
        || passage.printedPages !== reviewedPassage.printedPages
        || uniqueRecord(allPassages, fact.passageId) !== passage
        || !isDeepStrictEqual(passage.pdfIndices, reviewedPassage.pdfIndices)
        || !reviewedPassage.pdfIndices.includes(fact.pdfIndex)) {
      errors.push(`CML framework examples.facts.${key}: exact evidence, selected passage and original PDF page required`);
    }
    const actual = evidence?.numericFact === undefined && uniqueRecord(evidence?.numericFacts, fact.factId);
    if (!numericFields.every(field => actual?.[field] === fact[field]))
      errors.push(`CML framework examples.facts.${key}: exact source fact identity/value/unit/quantity/subject/basis required`);
  }
  return errors;
}
