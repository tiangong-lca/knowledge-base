import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  evaluateFiniteLoadShiftAmount,
  evaluateFiniteLoadShiftCase,
  validateFiniteLoadShiftCase,
  validateFiniteLoadShiftFacts,
} from './finite-load-shift-case.mjs';

const inputUrl = new URL('../knowledge/cases/finite-load-shift-v1.json', import.meta.url);
const input = () => JSON.parse(readFileSync(inputUrl, 'utf8'));
const generation = period => period.generators.map(generator => generator.generationMWh.exact);

const independentCases = [
  // Each row follows from its two generator output bounds and the two
  // demand equalities. Expected cost/emissions use both periods' activities.
  { name: 'baseline', q: '0', a: ['5', '5'], b: ['5', '0'], cost: '200', emissions: '5500', aDelta: '0', bDelta: '0', delta: '0', estimate: '0', within: true },
  { name: 'boundary', q: '5', a: ['5', '0'], b: ['10', '0'], cost: '150', emissions: '3500', aDelta: '-3500', bDelta: '1500', delta: '-2000', estimate: '-2000', within: true },
  { name: 'neutral', q: '9', a: ['1', '0'], b: ['10', '4'], cost: '190', emissions: '5500', aDelta: '-3900', bDelta: '3900', delta: '0', estimate: '-3600', within: false },
  { name: 'maximum', q: '10', a: ['0', '0'], b: ['10', '5'], cost: '200', emissions: '6000', aDelta: '-4000', bDelta: '4500', delta: '500', estimate: '-4000', within: false },
];

test('each paired dispatch minimizes cost while meeting both energy balances and equal service', () => {
  const spec = input();
  const { samples } = evaluateFiniteLoadShiftCase(spec);
  for (const { name, q, a, b, cost, emissions } of independentCases) {
    const sample = samples[name];
    const shifted = Number(q);
    assert.equal(sample.shiftMWh.exact, q);
    assert.equal(sample.periods.sending.workUnits.exact, String(10 - shifted));
    assert.equal(sample.periods.receiving.workUnits.exact, q);
    assert.equal(sample.periods.sending.demandMWh.exact, String(10 - shifted));
    assert.equal(sample.periods.receiving.demandMWh.exact, String(5 + shifted));
    assert.equal(sample.periods.sending.demandChangeMWh.exact, String(-shifted));
    assert.equal(sample.periods.receiving.demandChangeMWh.exact, q);
    assert.deepEqual(generation(sample.periods.sending), a);
    assert.deepEqual(generation(sample.periods.receiving), b);
    assert.equal(sample.total.workUnits.exact, '10');
    assert.equal(sample.total.demandMWh.exact, '15');
    assert.equal(sample.total.generationMWh.exact, '15');
    assert.equal(sample.total.costUnits.exact, cost);
    assert.equal(sample.total.directCO2Kg.exact, emissions);

    // Each window is a two-variable LP. Independently enumerate the endpoints
    // after eliminating generator 2 using the demand balance. A linear cost
    // is minimized at one of those endpoints.
    for (const label of ['sending', 'receiving']) {
      const dispatched = sample.periods[label];
      const [first, second] = spec.periods[label].generators;
      const demand = Number(dispatched.demandMWh.exact);
      const lower = Math.max(0, demand - Number(second.capacityMW));
      const upper = Math.min(Number(first.capacityMW), demand);
      const vertexCosts = [lower, upper].map(firstOutput =>
        firstOutput * Number(first.variableCostPerMWh) + (demand - firstOutput) * Number(second.variableCostPerMWh));
      assert.equal(dispatched.costUnits.exact, String(Math.min(...vertexCosts)));
      assert.equal(dispatched.generationMWh.exact, dispatched.demandMWh.exact);
      for (const [index, generator] of dispatched.generators.entries()) {
        const output = Number(generator.averagePowerMW.exact);
        assert.ok(output >= 0 && output <= Number(spec.periods[label].generators[index].capacityMW));
      }
    }
  }
});

test('both signed ends explain exactness, departure from the estimate and reversal', () => {
  const { domain, baselineShiftDirection, segments, samples } = evaluateFiniteLoadShiftCase(input());
  assert.deepEqual([domain.minimumShiftMWh.exact, domain.maximumShiftMWh.exact], ['0', '10']);
  assert.equal(baselineShiftDirection.certifiedThroughShiftMWh.exact, '5');
  assert.deepEqual(segments.map(segment => [
    segment.fromShiftMWh.exact, segment.toShiftMWh.exact, segment.sendingWithdrawalRateKgCO2PerMWh.exact,
    segment.receivingAdditionRateKgCO2PerMWh.exact, segment.netRateKgCO2PerMWhMoved.exact,
  ]), [['0', '5', '700', '300', '-400'], ['5', '10', '100', '600', '500']]);
  for (const { name, aDelta, bDelta, delta, estimate, within } of independentCases) {
    const sample = samples[name];
    assert.equal(sample.periods.sending.directCO2ChangeKg.exact, aDelta);
    assert.equal(sample.periods.receiving.directCO2ChangeKg.exact, bDelta);
    assert.equal(sample.directCO2ChangeKg.exact, delta);
    assert.equal(sample.baselineRateEstimateKgCO2.exact, estimate);
    assert.equal(sample.withinBaselineBasisRange, within);
  }
  assert.equal(samples.maximum.differenceFromBaselineEstimateKgCO2.exact, '4500');
});

test('fractional shifts across the dispatch boundary retain exact arithmetic and service', () => {
  const spec = input();
  const before = evaluateFiniteLoadShiftAmount(spec, '4.875');
  const after = evaluateFiniteLoadShiftAmount(spec, '5.125');
  assert.equal(before.directCO2ChangeKg.exact, '-1950');
  assert.equal(after.directCO2ChangeKg.exact, '-1937.5');
  assert.equal(after.baselineRateEstimateKgCO2.exact, '-2050');
  assert.equal(after.differenceFromBaselineEstimateKgCO2.exact, '112.5');
  assert.equal(after.total.workUnits.exact, '10');
  assert.equal(after.total.generationMWh.exact, '15');
  assert.deepEqual(evaluateFiniteLoadShiftAmount(spec, '9'), evaluateFiniteLoadShiftCase(spec).samples.neutral);
});

test('equal receiving rates preserve that endpoint slope through a dispatch change', () => {
  const { samples, equalReceivingRatesControl } = evaluateFiniteLoadShiftCase(input());
  const { segments, samplesAtPrimaryShiftAmounts } = equalReceivingRatesControl;
  const { boundary, primaryNeutral, maximum } = samplesAtPrimaryShiftAmounts;
  assert.deepEqual(segments.map(segment => segment.receivingAdditionRateKgCO2PerMWh.exact), ['300', '300']);
  assert.deepEqual(segments.map(segment => segment.netRateKgCO2PerMWhMoved.exact), ['-400', '200']);
  assert.deepEqual(generation(boundary.periods.receiving), ['10', '0']);
  assert.deepEqual(generation(maximum.periods.receiving), ['10', '5']);
  assert.deepEqual(generation(maximum.periods.receiving), generation(samples.maximum.periods.receiving));
  assert.equal(maximum.total.costUnits.exact, samples.maximum.total.costUnits.exact);
  assert.equal(maximum.periods.sending.directCO2ChangeKg.exact, '-4000');
  assert.equal(maximum.periods.receiving.directCO2ChangeKg.exact, '3000');
  assert.equal(maximum.directCO2ChangeKg.exact, '-1000');
  assert.equal(primaryNeutral.shiftMWh.exact, '9');
  assert.equal(primaryNeutral.directCO2ChangeKg.exact, '-1200');
  assert.equal(maximum.withinBaselineBasisRange, false);
});

test('invalid shift amounts and changed fixed case inputs are rejected', () => {
  const spec = input();
  assert.deepEqual(validateFiniteLoadShiftCase(spec), []);
  assert.deepEqual(validateFiniteLoadShiftFacts(spec), []);
  for (const value of ['-0.001', '10.001']) {
    assert.throws(() => evaluateFiniteLoadShiftAmount(spec, value), RangeError);
  }
  for (const value of [undefined, 5, '5e0', '', ' 5', '1/2', 'NaN', '5'.repeat(201)]) {
    assert.throws(() => evaluateFiniteLoadShiftAmount(spec, value), TypeError);
  }
  const changed = structuredClone(spec);
  changed.periods.receiving.generators[1].directCO2KgPerMWh = '300';
  assert.throws(() => evaluateFiniteLoadShiftCase(changed), /\.periods/);
  assert.match(validateFiniteLoadShiftFacts(changed).join('\n'), /\.periods/);
  assert.match(validateFiniteLoadShiftCase({ ...spec, sourceFact: {} }).join('\n'), /unrecognized input field/);
  assert.match(validateFiniteLoadShiftCase({ ...spec, status: 'empirically-validated' }).join('\n'), /\.status/);
});
