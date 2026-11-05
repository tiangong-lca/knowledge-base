import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { caseInputSha256 } from './case-publication.mjs';
import { hybridOverlapInputShape, validateHybridOverlapCase, validateHybridOverlapServiceLink, evaluateHybridOverlapCase } from './hybrid-overlap.mjs';
const input = () => JSON.parse(readFileSync(new URL('../knowledge/cases/hybrid-overlap-v1.json', import.meta.url), 'utf8'));
const wall = () => JSON.parse(readFileSync(new URL('../knowledge/cases/wall-coating-v1.json', import.meta.url), 'utf8'));
const exact = rows => rows.map(row => row.exact);
const exactMatrix = rows => rows.map(exact);
// Deliberately independent unreduced fractions for conservation assertions.
const fraction = row => [BigInt(row.numerator), BigInt(row.denominator)];
const plus = ([n, d], [m, e]) => [n * e + m * d, d * e];
const times = ([n, d], [m, e]) => [n * m, d * e];
const sum = rows => rows.reduce(plus, [0n, 1n]);
function assertFraction(actual, n, d = 1n) {
  assert.equal(actual[0] * d, n * actual[1]);
}
function assertConserved(system) {
  for (let i = 0; i < 3; i++) {
    const actual = sum(system.balanceMatrix[i].map((v, j) => times(fraction(v), fraction(system.activities[j]))));
    const expected = fraction(system.finalDemand[i]);
    assertFraction(actual, ...expected);
  }
  for (const a of system.activities) assert(BigInt(a.numerator) >= 0n);
  assert.deepEqual(exact(system.balanceResiduals), ['0', '0', '0']);
  assertFraction(sum(system.directCO2ByActivityKg.map(fraction)), ...fraction(system.totalCO2Kg));
}

test('fixed service joins the actual registered Paint A smooth input without importing its electricity burdens or climate score', () => {
  const spec = input(), original = wall();
  assert.deepEqual(validateHybridOverlapServiceLink(spec, original, caseInputSha256(original)), []);
  assert.equal(caseInputSha256(original), 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285');
  const s = evaluateHybridOverlapCase(spec).linkedService;
  assert.equal(s.areaM2, '100'); assert.equal(s.intervalYears, '[0,10)');
  assert.equal(s.treatmentCount.exact, '2'); assert.equal(s.paintKgPerTreatment.exact, '5');
  assert.equal(s.totalPaintKg.exact, '10'); assert.equal(s.fixedElectricityDeliveryKWh.exact, '20');
  assert.equal(s.scope, 'electricity-subinventory-only');
  assert.equal(s.oldAggregatedElectricityBurdensAdded, false); assert.equal(s.wallClimateScoreCalculated, false);
  for (const mutate of [w => { w.version = '2.0.0'; }, w => { w.service.areaUnit = 'ft2'; },
    w => { w.service.paintA.treatmentTimesYears = ['0']; }, w => { w.service.paintA.requiredKg = '5'; },
    w => { w.technosphere.matrix[3][0] = '-3'; }, w => { w.scenarios.smooth.demands.paintA[0] = '5'; }]) {
    const w = wall(); mutate(w); assert(validateHybridOverlapServiceLink(spec, w, spec.linkedService.inputSha256).length);
  }
  assert(validateHybridOverlapServiceLink(spec, original, '0'.repeat(64)).length);
});

test('two original supplier ledgers conserve annual outputs, intermediate uses and final sales before aggregation', () => {
  const e = evaluateHybridOverlapCase(input());
  const expectedSales = { identified: ['90', '90', '30'], sameAggregateCounterworld: ['100', '80', '30'] };
  for (const key of Object.keys(expectedSales)) {
    const l = e[key].annualLedger;
    assert.deepEqual(exact(l.outputCU), ['100', '100', '100']);
    assert.deepEqual(exact(l.directCO2Kg), ['40', '120', '30']);
    assert.deepEqual(exact(l.finalUsersSalesCU), expectedSales[key]);
    assert.deepEqual(exact(l.valueAddedCU), ['80', '70', '60']);
    assert.deepEqual(exact(l.annualSupplierBalanceResiduals), ['0', '0', '0']);
    for (let i = 0; i < 3; i++) {
      assertFraction(sum([...l.transactionsCU[i].map(fraction), fraction(l.finalUsersSalesCU[i])]), 100n);
      assertFraction(sum([...l.transactionsCU.map(row => fraction(row[i])), fraction(l.valueAddedCU[i])]), 100n);
      assert(BigInt(l.finalUsersSalesCU[i].numerator) >= 0n);
    }
    assertFraction(sum(l.finalUsersSalesCU.map(fraction)), 210n);
    assertFraction(sum(l.valueAddedCU.map(fraction)), 210n);
  }
  assert.notDeepEqual(e.identified.annualLedger.transactionsCU, e.sameAggregateCounterworld.annualLedger.transactionsCU);
});

test('aggregation preserves the same make, use and emission totals in distinct supplier worlds', () => {
  const e = evaluateHybridOverlapCase(input()), raw = e.identified.rawAccounts;
  assert.deepEqual(raw, e.sameAggregateCounterworld.rawAccounts);
  assert.deepEqual(exact(raw.makeOutputCUPerYear), ['200', '100']);
  assert.deepEqual(exactMatrix(raw.useCUPerYear), [['0', '20'], ['50', '20']]);
  assert.deepEqual(exact(raw.directCO2KgPerYear), ['160', '30']);
  assert.deepEqual(exactMatrix(raw.AInputCUPerOutputCU), [['0', '0.2'], ['0.25', '0.2']]);
  assert.deepEqual(exact(raw.BKgCO2PerCU), ['0.8', '0.3']);
  assert.equal(e.ambiguity.rawAggregatesExactlyEqual, true);
});

test('disjoint records remove F output and emissions, S-to-F purchases and F-to-S sales separately, then renormalize', () => {
  const e = evaluateHybridOverlapCase(input());
  for (const key of ['identified', 'sameAggregateCounterworld']) {
    const w = e[key], removed = w.removedRecords, remaining = w.remainingAccounts, raw = w.rawAccounts;
    assert.deepEqual(exact(removed.makeOutputCUPerYear), ['100', '0']);
    assert.deepEqual(exact(removed.directCO2KgPerYear), ['40', '0']);
    assert.deepEqual(exact(remaining.makeOutputCUPerYear), ['100', '100']);
    assert.deepEqual(exact(remaining.directCO2KgPerYear), ['120', '30']);
    assert.deepEqual(exact(remaining.BKgCO2PerCU), ['1.2', '0.3']);
    assert.equal(removed.foregroundPurchases.annualCU.exact, '20');
    assert.deepEqual(exact(w.bridges.CuCUPerKWh), ['0', '0.2']);
    assert.equal(w.bridges.BFkgCO2PerKWh.exact, '0.4');
    for (let i = 0; i < 2; i++) {
      for (const [rawName, removedName] of [['makeOutputCUPerYear', 'makeOutputCUPerYear'], ['directCO2KgPerYear', 'directCO2KgPerYear']])
        assertFraction(plus(fraction(remaining[rawName][i]), fraction(removed[removedName][i])), ...fraction(raw[rawName][i]));
      for (let j = 0; j < 2; j++) {
        assertFraction(plus(fraction(remaining.useCUPerYear[i][j]), fraction(removed.useCUPerYear[i][j])), ...fraction(raw.useCUPerYear[i][j]));
        assertFraction(times(fraction(remaining.AInputCUPerOutputCU[i][j]), fraction(remaining.makeOutputCUPerYear[j])), ...fraction(remaining.useCUPerYear[i][j]));
      }
      assertFraction(times(fraction(remaining.BKgCO2PerCU[i]), fraction(remaining.makeOutputCUPerYear[i])), ...fraction(remaining.directCO2KgPerYear[i]));
    }
  }
  assert.deepEqual(exactMatrix(e.identified.removedRecords.useCUPerYear), [['0', '10'], ['20', '0']]);
  assert.deepEqual(exactMatrix(e.identified.remainingAccounts.useCUPerYear), [['0', '10'], ['30', '20']]);
  assert.deepEqual(exactMatrix(e.identified.remainingAccounts.AInputCUPerOutputCU), [['0', '0.1'], ['0.3', '0.2']]);
  assert.deepEqual(exact(e.identified.bridges.CdKWhPerCU), ['0', '0.1']);
  assert.deepEqual(exactMatrix(e.sameAggregateCounterworld.removedRecords.useCUPerYear), [['0', '0'], ['20', '0']]);
  assert.deepEqual(exactMatrix(e.sameAggregateCounterworld.remainingAccounts.AInputCUPerOutputCU), [['0', '0.2'], ['0.3', '0.2']]);
  assert.deepEqual(exact(e.sameAggregateCounterworld.bridges.CdKWhPerCU), ['0', '0']);
});

test('corrected hybrid activities close the disaggregated physical network with positive quantities and exact emission sums', () => {
  const e = evaluateHybridOverlapCase(input());
  assert.equal(e.processOnly.totalCO2Kg.exact, '8');
  const expected = { identified: { activity: ['308/15', '8/15', '16/3'], total: '784/75' },
    sameAggregateCounterworld: { activity: ['20', '40/37', '200/37'], total: '404/37' } };
  for (const [key, wanted] of Object.entries(expected)) {
    const w = e[key], c = w.corrected;
    assert.deepEqual(exact(c.activities), wanted.activity); assert.equal(c.totalCO2Kg.exact, wanted.total);
    assert.deepEqual(c.activities, w.supplierReference.activities); assert.deepEqual(c.totalCO2Kg, w.supplierReference.totalCO2Kg);
    assert.deepEqual(c.balanceMatrix, w.supplierReference.balanceMatrix);
    assertConserved(c);
    assert.equal(c.backgroundAccountsExcludeF, true); assert.equal(c.residualPowerSupplier, 'G');
    // Independent network identities: 100*F-10*S=2000 in world1;
    // 100*F=2000 in world2, and the common S balance 8*S=2*F+3*G.
    const [f, g, s] = c.activities.map(fraction);
    assertFraction(plus(times([8n, 1n], s), times([-2n, 1n], f)), ...times([3n, 1n], g));
    const foregroundNet = plus(f, times(key === 'identified' ? [-1n, 10n] : [0n, 1n], s));
    assertFraction(foregroundNet, 20n);
  }
});

test('the naive control retains both bridges and raw aggregates, balancing algebra but duplicating ten CU of power per hundred CU service', () => {
  const e = evaluateHybridOverlapCase(input()), n = e.naive;
  assert.deepEqual(exact(n.activities), ['1500/73', '80/73', '400/73']);
  assert.equal(n.totalCO2Kg.exact, '784/73'); assertConserved(n);
  assert.equal(n.balanceMatrix[0][2].exact, e.identified.corrected.balanceMatrix[0][2].exact);
  assert.equal(n.balanceMatrix[2][0].exact, e.identified.corrected.balanceMatrix[2][0].exact);
  assert.equal(n.balanceMatrix[1][2].exact, '-0.2'); assert.equal(n.balanceMatrix[2][1].exact, '-0.25');
  assert.equal(n.servicePowerPurchasePer100CU.exact, '30');
  assert.equal(n.actualLedgerPowerPurchasePer100CU.exact, '20');
  assert.equal(n.duplicatedPowerPurchasePer100CU.exact, '10');
  assert.equal(n.excessOverCorrectedCO2Kg.exact, '1568/5475');
  assert.equal(n.zeroAlgebraicResidualDoesNotEstablishDisjointRecords, true);
});

test('same-valued wrong supplier identification predicts the old answer and fails the actual supplier balances', () => {
  const e = evaluateHybridOverlapCase(input()), a = e.ambiguity, m = a.misidentifiedInvoice;
  assert.equal(a.outputPricesAndDirectEmissionsHeldFixed, true); assert.equal(a.finalDemandHeldFixed, true);
  assert.equal(a.rawAggregatesIdentifyCorrectedCO2, false);
  assert.equal(m.assumedAnnualCU.exact, '10'); assert.equal(m.assumedSupplier, 'F'); assert.equal(m.actualSupplier, 'G');
  assert.equal(m.wrongPredictedCO2Kg.exact, '784/75'); assert.equal(m.trueCounterworldCO2Kg.exact, '404/37');
  assert.equal(m.underpredictionKg.exact, '1292/2775');
  assert.deepEqual(exact(m.actualSupplierBalanceResiduals), ['8/15', '-8/15', '0']);
  assert.equal(m.actualSupplierBalancesClose, false);
  assert.notDeepEqual(e.identified.corrected.totalCO2Kg, e.sameAggregateCounterworld.corrected.totalCO2Kg);
});

test('closed public v1 rejects every changed leaf, malformed ledger, ambiguous unit or scope expansion', () => {
  assert.deepEqual(validateHybridOverlapCase(input()), []);
  const paths = [];
  const leaves = (value, path = []) => {
    for (const [key, nested] of Object.entries(value)) {
      if (nested !== null && typeof nested === 'object') leaves(nested, [...path, key]); else paths.push([...path, key]);
    }
  };
  leaves(input());
  for (const path of paths) {
    const s = input(); let parent = s;
    for (const key of path.slice(0, -1)) parent = parent[key];
    const key = path.at(-1); parent[key] = typeof parent[key] === 'boolean' ? !parent[key] : 'changed';
    assert(validateHybridOverlapCase(s).length, path.join('.'));
    assert.throws(() => evaluateHybridOverlapCase(s), /Invalid hybrid-overlap case/);
  }
  const mutate = [s => { s.privatePath = '/tmp/private'; }, s => { s.transactions.identified.annualCU[0].push('0'); },
    s => { s.transactions.identified.annualCU.pop(); }, s => { s.suppliers.F.output = -100; },
    s => { s.suppliers.S.outputUnit = 'kWh/year'; }, s => { s.annualBasis.priceBasis = 'consumer'; },
    s => { s.annualBasis.electricityPriceCUPerKWh = '2'; }, s => { s.linkedService.fixedElectricityDeliveryKWh = '10'; },
    s => { s.transactions.identified.annualCU[0][2] = '1e1'; }, s => { s.transactions.identified.annualCU[0][2] = NaN; },
    s => { s.controls.finalDemand.extra = 'private'; }, s => { s[Symbol('private')] = 'private'; }];
  for (const change of mutate) { const s = input(); change(s); assert(validateHybridOverlapCase(s).length); }
  for (const s of [null, [], true, {}, new Date()]) assert(validateHybridOverlapCase(s).length);
  assert(Object.isFrozen(hybridOverlapInputShape.transactions.identified.annualCU));
  assert(Object.isFrozen(hybridOverlapInputShape.linkedService));
});

test('evaluation preserves its input and explicit teaching limits rather than claiming empirical calibration or source reproduction', () => {
  const s = input(), before = JSON.stringify(s), e = evaluateHybridOverlapCase(s);
  assert.equal(JSON.stringify(s), before);
  assert.equal(e.interpretation.authorDesignedSpecialCase, true);
  assert.equal(e.interpretation.sourceCoefficientsReused, false);
  assert.equal(e.interpretation.literalGeneralAppendixA7Implementation, false);
  assert.equal(e.interpretation.sourceResidualizationReconstructed, false);
  assert.equal(e.interpretation.empiricalCalibration, false); assert.equal(e.interpretation.scientificValidation, false);
  assert.equal(e.interpretation.characterizationFactors, null); assert.equal(e.interpretation.climateImpactScore, false);
  assert.equal(e.interpretation.wholeWallLifeCycle, false);
});
