import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { historicalFactKeys, validateHistoricalContainerCase, evaluateHistoricalContainerCase } from './historical-container.mjs';

const fixture = () => JSON.parse(readFileSync(new URL('../knowledge/cases/historical-glass-v1.json', import.meta.url), 'utf8'));
const evaluate = () => evaluateHistoricalContainerCase(fixture());
function invalid(change, pattern) {
  const spec = fixture(); change(spec);
  assert(validateHistoricalContainerCase(spec).some(error => pattern.test(error)), `Expected diagnostic matching ${pattern}`);
  assert.throws(() => evaluateHistoricalContainerCase(spec), TypeError);
}

test('reviewed historical input validates without mutation and produces JSON-safe deterministic results', () => {
  const spec = fixture(), before = JSON.stringify(spec);
  assert.deepEqual(validateHistoricalContainerCase(spec), []);
  const result = evaluateHistoricalContainerCase(spec);
  assert.equal(JSON.stringify(spec), before);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  assert.deepEqual(evaluateHistoricalContainerCase(spec), result);
  assert.equal(result.caseId, 'CASE-HISTORICAL-GLASS');
  assert.equal(result.version, '1.0.0');
  assert.equal(historicalFactKeys.length, 53);
  assert.equal(new Set(historicalFactKeys).size, 53);
  assert(Object.isFrozen(historicalFactKeys));
  assert.throws(() => historicalFactKeys.push('unsupported'), TypeError);
});

test('million-fill service counts initial filling and retains full returnable filling activity', () => {
  assert.deepEqual(evaluate().demand, {
    cohortLitres: '354840', returnableManufactureTon: '30.5', returnableFillingTon: '305',
    returnableReturnedTon: '274.5', oneWayManufactureTon: '205', newReturnableBottles: '100000',
    fiveTripManufactureTon: '61',
  });
  // The source's coarse Table6 display of30 tons cannot replace305/10.
  invalid(spec => { spec.facts.returnablePounds.value = '0.60'; }, /returnablePounds.value/);
  invalid(spec => { spec.facts.uses.value = '11'; }, /uses.value/);
});

test('Table22 fuel inputs with total fuel factors reproduce the Table14 fabrication total at three decimals', () => {
  const actual = evaluate().fabrication;
  assert.deepEqual(actual.terms, {
    distillate: '0.19068', residual: '0.93445', gas: '11.6202', gasoline: '0.0033327', electricity: '2.9193',
  });
  assert.equal(actual.total, '15.6679627');
  assert.equal(actual.reported, '15.668');
  assert.equal(actual.rounded3, '15.668');
  assert.equal(actual.difference, '-0.0000373');
  // Combustion-only diesel and final-energy electricity are different models.
  invalid(spec => { spec.facts.fuelFactorDistillate.value = '139.0'; }, /fuelFactorDistillate.value/);
  invalid(spec => { spec.facts.electricityFactor.value = '3.413'; }, /electricityFactor.value/);
});

test('upstream glass branch closes the five-trip component without treating it as a whole-system total', () => {
  assert.deepEqual(evaluate().glassBranch, {
    factor: '18.523', ret: '564.9515', owg: '3797.215', fiveTrip: '1129.903',
    fiveTripRounded: '1130', reportedFiveTrip: '1130',
  });
  assert.notEqual(evaluate().glassBranch.ret, evaluate().summary.retPartsTotal);
});

test('reported summary arithmetic and printed conversion remain separate from lower-level assembly', () => {
  assert.deepEqual(evaluate().summary, {
    retPartsTotal: '2026', owgPartsTotal: '6036', retGJ: '6.023298', owgGJ: '17.945028',
    retRounded2: '6.02', owgRounded1: '17.9',
  });
  assert.notEqual(evaluate().summary.owgPartsTotal, evaluate().assembly.owg);
  invalid(spec => { spec.facts.energyConversion.value = '0.0029731'; }, /energyConversion.value/);
});

test('Table8 assembly retains its gap and only the fixed-mass coefficient rounding bound', () => {
  assert.deepEqual(evaluate().assembly, {
    factor: '29.102', owg: '5965.91', owgFixed3: '5965.910', gap: '70.09',
    coefficientOnlyBound: '1.3325', boundExceeded: true, fullClosure: false,
  });
  invalid(spec => { spec.coefficientRounding.halfWidth = '0.0006'; }, /coefficientRounding.halfWidth/);
  invalid(spec => { spec.coefficientRounding.massHeldAtPrintedValue = false; }, /massHeldAtPrintedValue/);
  invalid(spec => { spec.coefficientRounding.massPrecisionIncluded = true; }, /massPrecisionIncluded/);
  invalid(spec => { spec.coefficientRounding.probabilityAssigned = true; }, /probabilityAssigned/);
  invalid(spec => { spec.coefficientRounding.kind = 'empirical-confidence-interval'; }, /coefficientRounding.kind/);
});

test('paper-use sensitivity exposes exactly three reported energies with five bottle uses throughout', () => {
  assert.deepEqual(evaluate().sensitivity, [
    { bottleUses: '5', paperPackageUses: '1', reportedGJ: '12' },
    { bottleUses: '5', paperPackageUses: '2', reportedGJ: '9' },
    { bottleUses: '5', paperPackageUses: '3', reportedGJ: '8' },
  ]);
  invalid(spec => { spec.facts.packageEnergyTwo.value = '9.5'; }, /packageEnergyTwo.value/);
  invalid(spec => { spec.sensitivityInterpolation = 'linear'; }, /case.*reviewed fields/);
});

test('each reviewed source tuple is required and every coordinate is independently locked', () => {
  for (const key of historicalFactKeys) {
    invalid(spec => { delete spec.facts[key]; }, /facts.*reviewed fields/);
    for (const field of ['value', 'unit', 'subject', 'evidenceId', 'factId']) {
      invalid(spec => { spec.facts[key][field] = 'changed'; }, new RegExp(`facts\\.${key}\\.${field}`));
    }
  }
  invalid(spec => { spec.facts.fillings.extra = 'not reviewed'; }, /facts.fillings.*reviewed fields/);
  invalid(spec => { spec.facts.invented = structuredClone(spec.facts.fillings); }, /facts.*reviewed fields/);
  invalid(spec => { delete spec.facts.glassInputGas.unit; }, /glassInputGas.*reviewed fields/);
  invalid(spec => { spec.facts.componentFeldspar.value = '0.1'; }, /componentFeldspar.value/);
  // Even source facts used for context rather than arithmetic remain mandatory.
  invalid(spec => { spec.facts.joulesPerBtu.value = '1055.056'; }, /joulesPerBtu.value/);
  invalid(spec => { spec.facts.retMetric.evidenceId = 'ev-hist-summary'; }, /retMetric.evidenceId/);
});

test('malformed numeric inputs and container shapes fail validation without executing or throwing', () => {
  for (const value of [null, undefined, {}, [], 1, 'NaN', 'Infinity', '1e6', '1/2', '1+1'])
    invalid(spec => { spec.facts.fillings.value = value; }, /fillings.value/);
  for (const value of [null, [], {}, { facts: null }, { interpretation: [] }]) {
    assert.doesNotThrow(() => validateHistoricalContainerCase(value));
    assert(validateHistoricalContainerCase(value).length > 0);
    assert.throws(() => evaluateHistoricalContainerCase(value), TypeError);
  }
  invalid(spec => { spec.facts.fillings = null; }, /facts.fillings.*object/);
  invalid(spec => { spec.coefficientRounding = null; }, /coefficientRounding.*object/);
});

test('case identity and historical interpretation cannot be widened by an input flag', () => {
  for (const key of ['caseId', 'version', 'model', 'createdAt', 'status', 'sourceId', 'sourceArtifactSha256'])
    invalid(spec => { spec[key] = 'changed'; }, new RegExp(key));
  invalid(spec => { delete spec.sourceArtifactSha256; }, /sourceArtifactSha256/);
  for (const key of ['usesIncludeInitialFilling', 'printedDecimalsAreExactArithmeticInputs'])
    invalid(spec => { spec.interpretation[key] = false; }, new RegExp(`interpretation.${key}`));
  for (const key of ['reportedTotalsIndependentlyReproduced', 'originalSoftwareExecuted', 'empiricalValidation',
    'currentProductRecommendation', 'unreportedPrecisionRecovered'])
    invalid(spec => { spec.interpretation[key] = true; }, new RegExp(`interpretation.${key}`));
  for (const key of ['sourceYear', 'comparison', 'scope'])
    invalid(spec => { spec.interpretation[key] = 'changed'; }, new RegExp(`interpretation.${key}`));
  invalid(spec => { spec.interpretation.probability = 'uniform'; }, /interpretation.*reviewed fields/);
});

test('object insertion order has no semantic effect while closed tuples remain enforced', () => {
  const spec = fixture();
  spec.facts = Object.fromEntries(Object.entries(spec.facts).reverse().map(([key, fact]) => [key, Object.fromEntries(Object.entries(fact).reverse())]));
  assert.deepEqual(validateHistoricalContainerCase(spec), []);
  assert.deepEqual(evaluateHistoricalContainerCase(spec), evaluate());
});
