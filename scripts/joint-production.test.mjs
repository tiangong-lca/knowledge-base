import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateJointProductionCase, validateJointProductionCase } from './joint-production.mjs';

const fixture = () => JSON.parse(readFileSync(new URL('../knowledge/cases/joint-batch-v1.json', import.meta.url), 'utf8'));
const evaluate = (spec = fixture()) => evaluateJointProductionCase(spec);
function invalid(change, pattern) {
  const spec = fixture(); change(spec);
  assert(validateJointProductionCase(spec).some(error => pattern.test(error)), `Expected ${pattern}`);
  assert.throws(() => evaluate(spec), TypeError);
}

test('joint inventory model validates, preserves inputs and returns only JSON-friendly exact values', () => {
  const spec = fixture(), before = JSON.stringify(spec);
  assert.deepEqual(validateJointProductionCase(spec), []);
  const result = evaluate(spec);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  assert.equal(JSON.stringify(spec), before);
  assert.equal(result.caseId, 'CASE-JOINT-BATCH');
  assert.deepEqual(result.inventoryRows, ['fossil CO2 emitted to air, kg', 'SO2 emitted to air, g']);
  assert.equal(result.metadata.qProbability, null);
  assert.match(result.metadata.assessment, /no LCIA or total environmental ranking/);
});

test('both full-use partitions conserve each flow but produce different product labels', () => {
  const result = evaluate();
  assert.deepEqual(result.partitions, {
    mass: { shareX: '2/5', shareY: '3/5', Xbatch: ['4', '8'], Ybatch: ['6', '12'], XperKg: ['1', '2'], YperKg: ['1', '2'], sum: ['10', '20'] },
    grossSales: { shareX: '2/3', shareY: '1/3', Xbatch: ['20/3', '40/3'], Ybatch: ['10/3', '20/3'], XperKg: ['5/3', '10/3'], YperKg: ['5/9', '10/9'], sum: ['10', '20'] },
  });
  assert.deepEqual(result.batchRevenueCU, { X: '12', Y: '6', total: '18' });
});

test('a price change alters revenue attribution without changing physical routes or mass labels', () => {
  const spec = fixture(); spec.pricePerKgCU.X = '6';
  const changed = evaluate(spec), baseline = evaluate();
  assert.equal(changed.partitions.grossSales.shareX, '4/5');
  assert.deepEqual(changed.partitions.grossSales.Xbatch, ['8', '16']);
  assert.deepEqual(changed.partitions.mass, baseline.partitions.mass);
  assert.deepEqual(changed.scenarios, baseline.scenarios);
  assert.deepEqual(changed.referenceBasket, baseline.referenceBasket);
});

test('full utilization compares two positive routes before constructing a negative reference residual', () => {
  const result = evaluate(), full = result.scenarios.full;
  assert.deepEqual(result.referenceActivities, { joint: '0', standaloneX: '4', standaloneY: '6', wasteY: '0' });
  assert.deepEqual(result.referenceBasket, ['38', '28']);
  assert.deepEqual(full.activities, { joint: '1', standaloneX: '0', standaloneY: '0', wasteY: '0' });
  assert.deepEqual(full.jointRoute, ['10', '20']);
  assert.deepEqual(full.changeJointMinusReference, ['-28', '-8']);
  assert.deepEqual(full.Xresidual, ['-8', '-4']);
  assert.deepEqual(full.XresidualPerKg, ['-2', '-1']);
  assert.deepEqual(full.XresidualReconstructedChange, full.changeJointMinusReference);
});

test('half-use retains top-up and waste in the physical route and independently balances both Y destinations', () => {
  const half = evaluate().scenarios.half;
  assert.equal(half.q, '1/2');
  assert.deepEqual([half.jointYusedKg, half.jointYwastedKg, half.standaloneYtopUpKg], ['3', '3', '3']);
  assert.deepEqual(half.activities, { joint: '1', standaloneX: '0', standaloneY: '3', wasteY: '3' });
  assert.deepEqual(half.contributions, { joint: ['10', '20'], topUp: ['9', '12'], waste: ['3/2', '3/5'] });
  assert.deepEqual(half.jointRoute, ['41/2', '163/5']);
  assert.deepEqual(half.changeJointMinusReference, ['-35/2', '23/5']);
  assert.deepEqual(half.Xresidual, ['5/2', '43/5']);
  assert.deepEqual(half.XresidualPerKg, ['5/8', '43/20']);
  assert.deepEqual(half.XresidualReconstructedChange, half.changeJointMinusReference);
  assert.deepEqual(half.balances, { XserviceSuppliedKg: '4', YserviceSuppliedKg: '6', jointYDispositionKg: '6',
    requiredXKg: '4', requiredYKg: '6', jointYProducedKg: '6', serviceDemandSatisfied: true, jointYDispositionBalanced: true, residualReconstructionMatches: true });
});

test('no-use treats all joint Y, independently supplies its full service, and still supplies X', () => {
  const none = evaluate().scenarios.none;
  assert.deepEqual(none.activities, { joint: '1', standaloneX: '0', standaloneY: '6', wasteY: '6' });
  assert.deepEqual(none.jointRoute, ['31', '226/5']);
  assert.deepEqual(none.changeJointMinusReference, ['-7', '86/5']);
  assert.deepEqual(none.Xresidual, ['13', '106/5']);
  assert.deepEqual(none.XresidualPerKg, ['13/4', '53/10']);
  assert.deepEqual(none.XresidualReconstructedChange, none.changeJointMinusReference);
  for (const name of ['full', 'half', 'none']) {
    const scenario = evaluate().scenarios[name];
    assert(scenario.balances.serviceDemandSatisfied && scenario.balances.jointYDispositionBalanced && scenario.balances.residualReconstructionMatches);
  }
});

test('separately anchored residuals deliberately fail additive product-inventory conservation', () => {
  const trap = evaluate().doNotCombineSeparateResiduals;
  assert.deepEqual(trap.XresidualAtFullUse, ['-8', '-4']);
  assert.deepEqual(trap.YresidualFromDifferentAnchoring, ['-10', '16']);
  assert.deepEqual(trap.wrongSum, ['-18', '12']);
  assert.deepEqual(trap.physicalJointInventory, ['10', '20']);
  assert.deepEqual(trap.doubleClaimedJointSaving, ['28', '8']);
  assert.match(trap.interpretation, /not a physical inventory/);
  assert.deepEqual(evaluate().residualZeroCrossingsQ, { CO2: '13/21', SO2: '53/63' });
});

test('changed treatment coefficients are reconstructed and cannot silently retain reference constants', () => {
  const spec = fixture(); spec.inventoryPerOperation.wasteY[0] = '1';
  const result = evaluate(spec);
  assert.deepEqual(result.scenarios.full.jointRoute, ['10', '20']);
  assert.deepEqual(result.scenarios.half.jointRoute, ['22', '163/5']);
  assert.deepEqual(result.scenarios.half.Xresidual, ['4', '43/5']);
  assert.deepEqual(result.scenarios.half.changeJointMinusReference, ['-16', '23/5']);
  assert.deepEqual(result.scenarios.none.jointRoute, ['34', '226/5']);
  assert.equal(result.residualZeroCrossingsQ.CO2, '2/3');
});

test('malformed structures report diagnostics instead of throwing during validation', () => {
  for (const spec of [null, [], {}, { caseId: 'CASE-JOINT-BATCH', inventoryPerOperation: null }]) assert.doesNotThrow(() => validateJointProductionCase(spec));
  invalid(spec => { spec.inventoryPerOperation = null; }, /inventoryPerOperation.*object/);
  invalid(spec => { spec.systemActivities.jointRoute = []; }, /systemActivities.jointRoute.*object/);
  invalid(spec => { spec.inventoryPerOperation.wasteY = null; }, /both identified inventory/);
});

test('model, units, operating basis, service demands, and declared activities fail closed', () => {
  invalid(spec => { spec.caseId = 'UNKNOWN'; }, /caseId/);
  invalid(spec => { spec.version = '2.0.0'; }, /version/);
  invalid(spec => { spec.model = 'generic-solver'; }, /model/);
  invalid(spec => { spec.inventoryRows[1] = 'SO2 emitted to air, kg'; }, /inventoryRows/);
  invalid(spec => { spec.activityBasis.wasteY = 'one operation treats one unspecified batch'; }, /activityBasis.wasteY/);
  invalid(spec => { spec.outputKgPerJointBatch.X = '5'; }, /outputKgPerJointBatch.X/);
  invalid(spec => { spec.functionalDemandKg.Y = '3'; }, /functionalDemandKg.Y/);
  invalid(spec => { spec.systemActivities.jointRoute.standaloneY = '0'; }, /jointRoute.standaloneY/);
  invalid(spec => { spec.systemActivities.jointRoute.wasteY = 'q'; }, /jointRoute.wasteY/);
  invalid(spec => { spec.systemActivities.reference.standaloneX = '0'; }, /reference.standaloneX/);
});

test('probability, LCIA, missing coordinates and executable numeric expressions cannot enter this model', () => {
  invalid(spec => { spec.qProbability = [0.2, 0.5, 0.3]; }, /qProbability/);
  invalid(spec => { spec.qScenarios = ['0', '0.5', '1']; }, /qScenarios/);
  invalid(spec => { spec.assessment.characterizationFactors = ['1', '2']; }, /characterizationFactors/);
  invalid(spec => { spec.assessment.crossFlowAggregation = true; }, /crossFlowAggregation/);
  invalid(spec => { spec.inventoryPerOperation.joint.pop(); }, /both identified inventory/);
  for (const value of ['1/2', '1e3', 'NaN', 'Infinity', '6*(1-q)', 0.5, null, {}]) invalid(spec => { spec.inventoryPerOperation.wasteY[0] = value; }, /finite decimal string/);
  invalid(spec => { spec.inventoryPerOperation.joint[0] = '-1'; }, /nonnegative/);
  invalid(spec => { spec.pricePerKgCU.X = '0'; }, /positive/);
  invalid(spec => { spec.premises = []; }, /premises/);
});
