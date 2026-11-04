import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateWaterLocalityCase, validateWaterLocalityCase, evaluatePhosphorusBoundaryCase, validatePhosphorusBoundaryCase } from './impact-examples.mjs';
const input = name => JSON.parse(readFileSync(new URL(`../knowledge/cases/${name}-v1.json`, import.meta.url)));

test('water oracle keeps consumed volume, characterized results and nonlinear aggregation distinct', () => {
  const spec = input('water-locality'), before = JSON.stringify(spec), result = evaluateWaterLocalityCase(spec);
  // Independently hand-derived: (10-8)*2 + (4-3)*8 = 12;
  // changing just the first factor gives (10-8)*8 + (4-3)*8 = 24.
  assert.equal(result.totalConsumed, '3');
  assert.deepEqual(result.contributions.map(row => [row.consumed, row.factor, row.score, row.weight]), [['2', '2', '4', '2/3'], ['1', '8', '8', '1/3']]);
  assert.equal(result.baselineScore, '12'); assert.equal(result.counterfactualScore, '24');
  // (2/3)*(r/2)+(1/3)*(r/8)=3r/8. Its reciprocal factor is
  // 8/3; multiplying volume3 yields8, while the mean of CFs is4.
  assert.equal(result.weightedAMDRelativeToR, '3/8');
  assert.equal(result.weightedAMDExpression, '3r/8');
  assert.equal(result.factorAtMeanAMD, '8/3'); assert.equal(result.scoreAtMeanAMD, '8');
  assert.equal(result.consumptionWeightedMeanCF, '4'); assert.equal(result.scoreFromMeanCF, '12');
  assert.equal(JSON.stringify(spec), before);
});

test('water rejects nonpositive/out-of-interior ratios, inconsistent balances and incompatible reference or units', () => {
  for (const ratio of ['0', '-0.5', '0.01', '10', '100', 'NaN', '1/2', 0.5]) {
    const spec = input('water-locality'); spec.contributions[0].amdRelativeToR = ratio;
    assert(validateWaterLocalityCase(spec).length, String(ratio));
    assert.throws(() => evaluateWaterLocalityCase(spec));
  }
  for (const mutate of [s => { s.contributions[0].return = '11'; }, s => { s.contributions[0].consumed = '3'; }, s => { s.contributions[0].returnBasinLabel = 'Y'; }, s => { s.contributions[0].returnPeriodLabel = 'N'; }, s => { s.waterUnit = 'kg'; }, s => { s.productReference.amount = '2'; }, s => { s.reference.positive = false; }, s => { s.reference.estimatedFromProductRows = true; }, s => { s.counterfactual.inventoryHeldFixed = false; }, s => { s.premises.nonOverlapping = false; }, s => { s.premises.fixedBackground = false; }, s => { s.premises.completeSupplyChain = true; }, s => { s.premises.uncertaintyPropagated = true; }]) {
    const spec = input('water-locality'); mutate(spec); assert(validateWaterLocalityCase(spec).length); assert.throws(() => evaluateWaterLocalityCase(spec));
  }
  // v1 is deliberately static: even a mathematically coherent changed tuple
  // requires review of prose ordering, expressions and all declared premises.
  const spec = input('water-locality'); spec.contributions[0].withdrawal = '12'; spec.contributions[0].consumed = '4';
  assert.throws(() => evaluateWaterLocalityCase(spec), /reviewed static v1/);
});

test('phosphorus oracle is an inventory estimate followed by symbolic characterization', () => {
  const spec = input('phosphorus-boundary'), before = JSON.stringify(spec), result = evaluatePhosphorusBoundaryCase(spec);
  assert.equal(result.appliedTotalP, '2'); assert.equal(result.lossFraction, '1/10'); assert.equal(result.lossPercent, '10');
  assert.equal(result.netFreshwaterP, '1/5'); assert.equal(result.netFreshwaterPDecimal, '0.2');
  assert.equal(result.indicatorExpression, '0.2 kg P×c_FW'); assert.equal(result.indicatorUnit, 'kg P-eq');
  assert.equal(spec.loss.role, 'inventory-estimation-coefficient');
  assert.equal(spec.characterization.value, null); assert.equal(result.characterizationSymbol, 'c_FW');
  assert.equal(JSON.stringify(spec), before);
});

test('phosphorus rejects pre-existing emissions, wrong conditions/species/units and numerical CF substitution', () => {
  for (const mutate of [s => { s.conditions.agriculture = 'foreground'; }, s => { s.conditions.inputKind = 'net-emission'; }, s => { s.conditions.preExistingNetEmission = true; }, s => { s.conditions.totalPApplicationDataSupplied = false; }, s => { s.conditions.specificLossDataAvailable = true; }, s => { s.application.speciesBasis = 'phosphate'; }, s => { s.application.unit = 'kg phosphate'; }, s => { s.emission.compartment = 'marine'; }, s => { s.loss.fraction = '10'; }, s => { s.loss.role = 'LCIA-factor'; }, s => { s.loss.sourceId = 'another'; }, s => { s.characterization.value = '1'; }, s => { s.characterization.numericFactorAdopted = true; }, s => { s.characterization.unit = 'kg P-eq/kg phosphate'; }]) {
    const spec = input('phosphorus-boundary'); mutate(spec);
    assert(validatePhosphorusBoundaryCase(spec).length); assert.throws(() => evaluatePhosphorusBoundaryCase(spec));
  }
});
