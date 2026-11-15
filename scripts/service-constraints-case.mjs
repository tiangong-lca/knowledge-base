import { isDeepStrictEqual } from 'node:util';
import { add, decimal, divide, exactResult, multiply, subtract } from './exact-rational.mjs';

const reviewed = {
  caseId: 'CASE-SERVICE-CONSTRAINTS',
  version: '1.0.0',
  model: 'hsg-chair-and-author-constraint-controls-v1',
  createdAt: '2026-11-15',
  status: 'published-hypothetical-inputs-and-author-derived-controls',
  source: {
    sourceId: 'src-hsg2013-lca-lcc',
    readingId: 'rd-service102-hsg-selected',
    doi: '10.1007/s11367-012-0461-4',
    pdfArtifactId: 'art-service102-hsg-bath-vor',
    pdfSha256: '7c86b8c184e44989c0be6d43b413b7da32cdbf80ed47050d3b907360f42112b3',
    model: { evidenceId: 'ev-service102-hsg-model', passageId: 'psg-service102-hsg-model' },
    price: { evidenceId: 'ev-service102-hsg-price', passageId: 'psg-service102-hsg-price' },
    conflict: { evidenceId: 'ev-service102-hsg-conflict', passageId: 'psg-service102-hsg-conflict' },
  },
  naturalUnits: {
    provenance: 'HSG 2013, pp. 1725–1727, Fig. 1, Tables 1–3 and equations (5)–(8)',
    rows: [
      { flow: 'electricity', unit: 'MJ', priceUnit: 'EUR/MJ' },
      { flow: 'wood', unit: 'kg', priceUnit: 'EUR/kg' },
      { flow: 'chair', unit: 'piece', priceUnit: 'EUR/piece' },
      { flow: 'broken-chair', unit: 'piece', priceUnit: 'EUR/piece' },
      { flow: 'sitting', unit: 'year', priceUnit: 'EUR/year' },
    ],
    columns: [
      { process: 'electricity-production', activityBasis: 'produce 1 MJ of electricity' },
      { process: 'wood-production', activityBasis: 'produce 1 kg of wood' },
      { process: 'chair-production', activityBasis: 'produce 1 chair' },
      { process: 'chair-use', activityBasis: 'consume 5 chairs, supply 10 years of sitting and discharge 5 broken chairs' },
      { process: 'broken-chair-disposal', activityBasis: 'accept 1 piece of broken chair for disposal' },
    ],
    coefficientBasis: 'quantity in the row unit per one standard activity in the column',
    quantitySign: 'outputs positive; inputs negative',
    matrix: [
      ['1', '0', '-2', '0', '0'],
      ['0', '1', '-5', '0', '0'],
      ['0', '0', '1', '-5', '0'],
      ['0', '0', '0', '5', '-1'],
      ['0', '0', '0', '10', '0'],
    ],
    demand: ['0', '0', '0', '0', '1'],
    publishedActivities: ['1', '2.5', '0.5', '0.1', '0.5'],
  },
  printed: {
    provenance: 'HSG 2013, p. 1728, equation (10), literal entries',
    coefficientBasis: 'EUR per one standard activity in the column',
    matrix: [
      ['5', '0', '-10', '0', '0'],
      ['0', '1', '-5', '0', '0'],
      ['0', '0', '25', '-125', '0'],
      ['0', '0', '0', '-10', '20'],
      ['0', '0', '0', '0', '0'],
    ],
    scaledComparison: { provenance: 'HSG 2013, pp. 1727–1728, Table 3 and equation (12)', disposalReceiptEUR: '1' },
    proseComparison: {
      provenance: 'HSG 2013, p. 1726, paragraph introducing Table 4 versus Table 3',
      proseElectricityCostEUR: '2.5',
      proseWoodCostEUR: '5',
    },
  },
  declaredRelationship: {
    provenance: 'HSG 2013, equations (9)–(11), §3.5 and Table 6; derived from declared row pricing',
    priceVector: ['5', '1', '25', '-2', '0'],
    relationship: 'Am = diag(alpha) Ap and fm = diag(alpha) fp',
    currency: 'EUR',
    transactionSign: 'receipts positive; payments negative',
    derivedDisposalEntryEURPerActivity: '2',
  },
  authorControls: {
    provenance: 'Author-derived algebraic checks for the fixed case',
    zeroActivities: ['0', '0', '0', '0', '0'],
    restoration: 'Keep the priced balances and impose the original natural-unit sitting row and demand.',
    redundant: {
      assumption: 'One activity x supplies one unit of a quantity. The second row records twice the same balance in the same unit.',
      rowUnit: 'arbitrary quantity unit',
      matrix: [['1'], ['2']],
      demand: ['1', '2'],
      rowMap: [['1', '0'], ['0', '0']],
      sampleActivities: [['0'], ['1'], ['2']],
    },
  },
};

function freeze(value) {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function shapeOf(value) {
  if (Array.isArray(value)) return [shapeOf(value[0])];
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)]));
  }
  return null;
}

export const serviceConstraintsInputShape = freeze(shapeOf(reviewed));
freeze(reviewed);

export function validateServiceConstraintsCase(spec) {
  if (spec === null || typeof spec !== 'object' || Array.isArray(spec)) {
    return ['service constraints: must be a case object'];
  }
  const errors = Object.entries(reviewed).flatMap(([key, expected]) => isDeepStrictEqual(spec[key], expected)
    ? [] : [`service constraints.${key}: must match the reviewed v1 inputs`]);
  if (Reflect.ownKeys(spec).some(key => !Object.hasOwn(reviewed, key))) {
    errors.push('service constraints: unrecognized input field');
  }
  return errors;
}

const [electricity, wood, chair, brokenChair, sitting] = [0, 1, 2, 3, 4];
const [generate, harvest, produce, use, dispose] = [0, 1, 2, 3, 4];
const zero = decimal('0');
const sum = values => values.reduce(add, zero);
const dot = (row, vector) => sum(row.map((value, j) => multiply(value, vector[j])));
const residual = (matrix, activity, demand) => matrix.map((row, i) => subtract(dot(row, activity), demand[i]));
const parseMatrix = matrix => matrix.map(row => row.map(decimal));
const exactVector = vector => vector.map(exactResult);
const exactMatrix = matrix => matrix.map(exactVector);
const isZero = values => values.every(([numerator]) => numerator === 0n);
const scaleRows = (matrix, factor) => matrix.map((row, i) => row.map(value => multiply(value, factor[i])));
const scaleColumns = (matrix, factor) => matrix.map(row => row.map((value, j) => multiply(value, factor[j])));

// The four priced chair balances contain these links only. The sitting equation
// supplies the missing use activity. Repeating these substitutions with the
// printed matrix isolates the amount of disposal implied by its literal entry.
function chairActivitiesAtUse(matrix, useActivity) {
  const chairActivity = divide(multiply(subtract(zero, matrix[chair][use]), useActivity), matrix[chair][produce]);
  const disposalActivity = divide(multiply(subtract(zero, matrix[brokenChair][use]), useActivity), matrix[brokenChair][dispose]);
  const electricityActivity = divide(multiply(subtract(zero, matrix[electricity][produce]), chairActivity), matrix[electricity][generate]);
  const woodActivity = divide(multiply(subtract(zero, matrix[wood][produce]), chairActivity), matrix[wood][harvest]);
  return [electricityActivity, woodActivity, chairActivity, useActivity, disposalActivity];
}

function evaluateRedundantControl(control) {
  const matrix = parseMatrix(control.matrix);
  const demand = control.demand.map(decimal);
  const rowMap = parseMatrix(control.rowMap);
  const firstSlope = matrix[0][0];
  const keptSolution = divide(demand[0], firstSlope);
  const multiplier = divide(matrix[1][0], firstSlope);
  const redundantForEveryActivity = isZero([subtract(demand[1], multiply(multiplier, demand[0]))]);
  return {
    activity: exactResult(keptSolution),
    secondResidualMultiplier: exactResult(multiplier),
    redundantForEveryActivity,
    samples: control.sampleActivities.map(sample => {
      const naturalResidual = residual(matrix, sample.map(decimal), demand);
      const mappedResidual = rowMap.map(row => dot(row, naturalResidual));
      return { activities: sample, naturalResidual: exactVector(naturalResidual), mappedResidual: exactVector(mappedResidual) };
    }),
  };
}

export function evaluateServiceConstraintsCase(spec) {
  const errors = validateServiceConstraintsCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));

  const natural = parseMatrix(spec.naturalUnits.matrix);
  const demand = spec.naturalUnits.demand.map(decimal);
  const prices = spec.declaredRelationship.priceVector.map(decimal);
  const printed = parseMatrix(spec.printed.matrix);
  const declared = scaleRows(natural, prices);
  const monetaryDemand = prices.map((price, i) => multiply(price, demand[i]));
  const publishedActivities = spec.naturalUnits.publishedActivities.map(decimal);
  const zeroActivities = spec.authorControls.zeroActivities.map(decimal);
  const declaredScaled = scaleColumns(declared, publishedActivities);
  const printedScaled = scaleColumns(printed, publishedActivities);
  const useActivity = divide(demand[sitting], natural[sitting][use]);
  const restored = chairActivitiesAtUse(declared, useActivity);
  const printedRestored = chairActivitiesAtUse(printed, useActivity);
  const declaredValueAdded = publishedActivities.map((_, j) => sum(declaredScaled.map(row => row[j])));
  const electricityCost = subtract(zero, declaredScaled[electricity][produce]);
  const woodCost = subtract(zero, declaredScaled[wood][produce]);
  return {
    residualConvention: 'net supply minus final demand (A s - f)',
    naturalUnits: {
      rowUnits: spec.naturalUnits.rows.map(row => row.unit),
      scaledMatrix: exactMatrix(scaleColumns(natural, publishedActivities)),
      publishedActivities: exactVector(publishedActivities),
      residualAtPublishedActivities: exactVector(residual(natural, publishedActivities, demand)),
      residualAtZeroActivities: exactVector(residual(natural, zeroActivities, demand)),
    },
    printed: {
      currency: spec.declaredRelationship.currency,
      disposalEntry: exactResult(printed[brokenChair][dispose]),
      scaledDisposalReceipt: exactResult(printedScaled[brokenChair][dispose]),
      residualAtPublishedActivities: exactVector(residual(printed, publishedActivities, monetaryDemand)),
      residualAtZeroActivities: exactVector(residual(printed, zeroActivities, monetaryDemand)),
    },
    declaredRelationship: {
      currency: spec.declaredRelationship.currency,
      matrix: exactMatrix(declared),
      demand: exactVector(monetaryDemand),
      disposalEntry: exactResult(declared[brokenChair][dispose]),
      scaledDisposalReceipt: exactResult(declaredScaled[brokenChair][dispose]),
      residualAtPublishedActivities: exactVector(residual(declared, publishedActivities, monetaryDemand)),
      residualAtZeroActivities: exactVector(residual(declared, zeroActivities, monetaryDemand)),
      serviceRowIsZero: isZero(declared[sitting]),
      valueAddedByActivity: exactVector(declaredValueAdded),
      useCost: exactResult(subtract(zero, declaredValueAdded[use])),
      chairProductionInputs: {
        electricityCost: exactResult(electricityCost),
        woodCost: exactResult(woodCost),
        combinedCost: exactResult(add(electricityCost, woodCost)),
        combinedProseCost: exactResult(add(decimal(spec.printed.proseComparison.proseElectricityCostEUR), decimal(spec.printed.proseComparison.proseWoodCostEUR))),
      },
    },
    authorControls: {
      restoration: {
        sittingPerUseActivity: exactResult(natural[sitting][use]),
        requiredSitting: exactResult(demand[sitting]),
        declaredActivities: exactVector(restored),
        declaredNaturalResidual: exactVector(residual(natural, restored, demand)),
        declaredMonetaryResidual: exactVector(residual(declared, restored, monetaryDemand)),
        printedActivities: exactVector(printedRestored),
        printedNaturalResidual: exactVector(residual(natural, printedRestored, demand)),
        printedMonetaryResidual: exactVector(residual(printed, printedRestored, monetaryDemand)),
      },
      redundant: evaluateRedundantControl(spec.authorControls.redundant),
    },
  };
}

const requiredFacts = [
  {
    evidence: 'model',
    id: 'service-per-use',
    value: reviewed.naturalUnits.matrix[sitting][use],
    unit: 'year/use activity',
    subject: 'sitting supplied by chair use',
    quantity: 'technosphere output coefficient',
    basis: 'Equation (5), sitting row and chair-use column; baseline use activity consumes 5 chairs and supplies 10 years of sitting',
  },
  {
    evidence: 'model',
    id: 'service-demand',
    value: reviewed.naturalUnits.demand[sitting],
    unit: 'year',
    subject: 'sitting final demand',
    quantity: 'final demand',
    basis: 'Equation (6), sitting coordinate of the one-year sitting reference flow',
  },
  {
    evidence: 'price',
    id: 'sitting-price',
    value: reviewed.declaredRelationship.priceVector[sitting],
    unit: 'EUR/year',
    subject: 'sitting market price',
    quantity: 'market price per unit',
    basis: 'Equation (9) and Table 1; sitting is not exchanged on a market in this example',
  },
  {
    evidence: 'price',
    id: 'broken-chair-price',
    value: reviewed.declaredRelationship.priceVector[brokenChair],
    unit: 'EUR/piece',
    subject: 'broken chair market price',
    quantity: 'market price per unit',
    basis: 'Equation (9) and Table 1; this price labels the unwanted broken chair flow',
  },
  {
    evidence: 'conflict',
    id: 'printed-disposal',
    value: reviewed.printed.matrix[brokenChair][dispose],
    unit: 'EUR/disposal activity',
    subject: 'broken chair disposal entry in printed equation (10)',
    quantity: 'unscaled monetary coefficient as printed',
    basis: 'Equation (10), broken-chair row and disposal column; literal printed value before activity scaling',
  },
  {
    evidence: 'conflict',
    id: 'scaled-disposal',
    value: reviewed.printed.scaledComparison.disposalReceiptEUR,
    unit: 'EUR',
    subject: 'broken chair disposal entry in equation (12) and Table 3',
    quantity: 'scaled transaction',
    basis: 'Equation (12) and Table 3; disposal receipt for the one-year sitting reference flow',
  },
];

function uniqueRecord(records, id) {
  if (typeof id !== 'string' || !Array.isArray(records)) return undefined;
  const matches = records.filter(record => record?.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

export function validateServiceConstraintsFacts(spec, published, context) {
  const errors = validateServiceConstraintsCase(spec);
  if (errors.length) return errors;
  const source = uniqueRecord(published?.sources, spec.source.sourceId);
  const register = context?.readingRegister;
  const reading = register?.schemaVersion === 1 && uniqueRecord(register.readings, spec.source.readingId);
  if (source?.accessStatus !== 'public-passages-inspected' || source?.reading?.readingId !== spec.source.readingId
      || source.reading.status !== 'selected-passages' || reading?.readingStatus !== 'selected-passages') {
    errors.push('service constraints: numerical source must bind the inspected selected reading');
  }
  if (source?.artifact?.mediaType !== 'application/pdf' || source.artifact.sha256 !== spec.source.pdfSha256) {
    errors.push('service constraints: numerical source must bind the inspected version of record');
  }
  const carrier = uniqueRecord(reading?.artifacts, spec.source.pdfArtifactId);
  for (const { evidence: evidenceKey, ...expected } of requiredFacts) {
    const binding = spec.source[evidenceKey];
    const evidence = uniqueRecord(published?.evidence, binding.evidenceId);
    const actual = uniqueRecord(evidence?.numericFacts, expected.id);
    if (evidence?.sourceId !== spec.source.sourceId || evidence?.numericFact !== undefined
        || !actual || !Object.entries(expected).every(([key, value]) => actual[key] === value)) {
      errors.push(`service constraints.${expected.id}: missing or mismatched public source fact identity/value/unit/subject/quantity/basis`);
    }
    const passage = uniqueRecord(reading?.passages, binding.passageId);
    if (evidence?.readingId !== spec.source.readingId || evidence.passageId !== binding.passageId
        || passage?.artifactId !== spec.source.pdfArtifactId || ![undefined, 'retrieved'].includes(carrier?.kind)
        || carrier?.mediaType !== 'application/pdf' || carrier?.sha256 !== spec.source.pdfSha256) {
      errors.push(`service constraints.${expected.id}: missing or mismatched inspected PDF passage carrier`);
    }
  }
  return errors;
}
