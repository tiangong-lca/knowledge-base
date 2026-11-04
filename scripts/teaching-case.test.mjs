import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateTeachingCase, evaluateTeachingCase } from './teaching-case.mjs';

const fixture = () => JSON.parse(readFileSync(new URL('../knowledge/cases/wall-coating-v1.json', import.meta.url), 'utf8'));
const evaluate = (scenario = 'smooth', theta = '0.3', spec = fixture()) => evaluateTeachingCase(spec, { scenario, theta });
function invalid(change, pattern) {
  const spec = fixture(); change(spec);
  const errors = validateTeachingCase(spec);
  assert.ok(errors.some(e => pattern.test(e)), errors.join('\n'));
  assert.throws(() => evaluate('smooth', '0.3', spec), TypeError);
}

test('canonical case is structurally valid and result is JSON-friendly without mutating inputs', () => {
  const spec = fixture(), before = JSON.stringify(spec);
  assert.deepEqual(validateTeachingCase(spec), []);
  const result = evaluateTeachingCase(spec);
  assert.equal(result.theta, '0.3');
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  assert.equal(JSON.stringify(spec), before);
  assert.equal(result.metadata.sourceId, spec.characterization.sourceId);
  assert.equal(result.metadata.sourceStatus, spec.characterization.sourceStatus);
  assert.match(result.metadata.limitations.join(' '), /not establish.*scientific validity/);
});

test('service inputs reconstruct different quantities for identical service over the half-open interval', () => {
  const r = evaluate();
  assert.deepEqual(r.service.alternatives.paintA, {
    kgPerM2PerTreatment: '0.05', requiredKg: '10', treatmentCount: 2,
    schedule: [{ start: '0', end: '5' }, { start: '5', end: '10' }],
  });
  assert.deepEqual(r.service.alternatives.paintB, {
    kgPerM2PerTreatment: '0.06', requiredKg: '6', treatmentCount: 1,
    schedule: [{ start: '0', end: '10' }],
  });
  assert.deepEqual(r.model.coordinateUnits, ['kg', 'kg', 'm2', 'kWh']);
});

test('smooth service traces inputs to typed f, activities s, balanced As, g and indicator I', () => {
  const r = evaluate();
  assert.deepEqual(r.alternatives.paintA, {
    demand: ['10', '0', '0', '0'], activities: ['10', '0', '0', '20'], balance: ['10', '0', '0', '0'],
    inventory: ['26', '0.07'], inventoryContributions: [['20', '0', '0', '6'], ['0.05', '0', '0', '0.02']],
    characterizedContributions: ['26', '1.967'], processIndicatorContributions: ['21.405', '0', '0', '6.562'], indicator: '27.967',
  });
  assert.deepEqual(r.alternatives.paintB.demand, ['0', '6', '0', '0']);
  assert.deepEqual(r.alternatives.paintB.activities, ['0', '6', '0', '30']);
  assert.deepEqual(r.alternatives.paintB.balance, ['0', '6', '0', '0']);
  assert.deepEqual(r.alternatives.paintB.inventory, ['27', '0.09']);
  assert.equal(r.alternatives.paintB.indicator, '29.529');
  assert.equal(r.comparison.difference, '1.562');
});

test('rough substrate activates preparation and upstream electricity, preserving the final service', () => {
  const smooth = evaluate(), rough = evaluate('rough');
  assert.deepEqual(rough.service, smooth.service);
  assert.deepEqual(rough.alternatives.paintA, smooth.alternatives.paintA);
  assert.deepEqual(rough.alternatives.paintB.demand, ['0', '6', '100', '0']);
  assert.deepEqual(rough.alternatives.paintB.activities, ['0', '6', '100', '50']);
  assert.deepEqual(rough.alternatives.paintB.balance, ['0', '6', '100', '0']);
  assert.deepEqual(rough.alternatives.paintB.inventory, ['38', '0.11']);
  assert.equal(rough.alternatives.paintB.indicator, '41.091');
  assert.equal(rough.comparison.difference, '13.124');
});

test('all reference endpoints reproduce independently authored arithmetic expectations', () => {
  const expected = {
    smooth: { '0.1': ['23.967', '23.529', '-0.438'], '0.5': ['31.967', '35.529', '3.562'] },
    rough: { '0.1': ['23.967', '31.091', '7.124'], '0.5': ['31.967', '51.091', '19.124'] },
  };
  for (const [scenario, points] of Object.entries(expected)) for (const [theta, values] of Object.entries(points)) {
    const r = evaluate(scenario, theta);
    assert.deepEqual([r.alternatives.paintA.indicator, r.alternatives.paintB.indicator, r.comparison.difference], values);
  }
});

test('paired uncertainty respects common theta and does not substitute marginal subtraction', () => {
  const c = evaluate().comparison;
  assert.deepEqual(c.affine, { intercept: '-1.438', slope: '10' });
  assert.deepEqual(c.range, ['-0.438', '3.562']);
  assert.deepEqual(c.marginalRanges, { paintA: ['23.967', '31.967'], paintB: ['23.529', '35.529'] });
  assert.deepEqual(c.independentExtremesRange, ['-8.438', '11.562']);
  assert.equal(c.strictOrdering, 'unresolved');
  assert.equal(c.strictOrderResolved, false);
  assert.equal(c.robustWithinTolerance, true);
  assert.equal(c.crossoverTheta, '0.1438');
  assert.equal(c.crossoverInDomain, true);
  assert.equal(evaluate('smooth', '0.1438').comparison.difference, '0');
});

test('rough paired interval supports ordering and is wholly beyond declared tolerance', () => {
  const c = evaluate('rough').comparison;
  assert.deepEqual(c.affine, { intercept: '4.124', slope: '30' });
  assert.deepEqual(c.range, ['7.124', '19.124']);
  assert.equal(c.strictOrdering, 'A-lower');
  assert.equal(c.robustWithinTolerance, false);
  assert.equal(c.allOutsideTolerance, true);
  assert.equal(c.crossoverTheta, '-1031/7500');
  assert.equal(c.crossoverInDomain, false);
});

test('same mass countercase exposes unequal service and the pointwise ranking reversal', () => {
  const r = evaluate('smooth', '0.1'), counter = r.sameMass.alternatives;
  assert.equal(r.sameMass.massKg, '6');
  assert.equal(counter.paintA.serviceArea, '60');
  assert.equal(counter.paintA.serviceFraction, '0.6');
  assert.equal(counter.paintA.fulfillsSpecifiedService, false);
  assert.equal(counter.paintA.indicator, '14.3802');
  assert.equal(counter.paintB.serviceArea, '100');
  assert.equal(counter.paintB.fulfillsSpecifiedService, true);
  assert.equal(counter.paintB.indicator, '23.529');
  assert.equal(r.alternatives.paintA.indicator, '23.967');
  const spec = fixture(); spec.countercase.massKg = '3';
  assert.equal(evaluate('smooth', '0.1', spec).sameMass.alternatives.paintA.serviceArea, '30');
});

test('tolerance equality is inclusive; failing universal tolerance does not prove universal exclusion', () => {
  const spec = fixture(); spec.comparison.tolerance = '3.562';
  assert.equal(evaluate('smooth', '0.3', spec).comparison.robustWithinTolerance, true);
  spec.comparison.tolerance = '3.561999999999999999999999';
  const c = evaluate('smooth', '0.3', spec).comparison;
  assert.equal(c.robustWithinTolerance, false);
  assert.equal(c.allOutsideTolerance, false);
});

test('strict ordering excludes a zero endpoint and exact decimal comparisons do not round ties', () => {
  const spec = fixture(); spec.uncertainty.closedRange = ['0.1438', '0.5'];
  assert.equal(evaluate('smooth', '0.3', spec).comparison.strictOrdering, 'unresolved');
  spec.uncertainty.closedRange[0] = '0.14380000000000000000000000000000001';
  assert.equal(evaluate('smooth', '0.3', spec).comparison.strictOrdering, 'A-lower');
  spec.uncertainty.closedRange = ['0.1', '0.14379999999999999999999999999']; spec.uncertainty.displayPoint = '0.1';
  assert.equal(evaluate('smooth', '0.1', spec).comparison.strictOrdering, 'B-lower');
});

test('a degenerate shared domain is valid and zero delta meets zero tolerance without strict ordering', () => {
  const spec = fixture(); spec.uncertainty.closedRange = ['0.1438', '0.1438']; spec.uncertainty.displayPoint = '0.1438'; spec.comparison.tolerance = '0';
  const c = evaluateTeachingCase(spec).comparison;
  assert.deepEqual(c.range, ['0', '0']);
  assert.equal(c.strictOrdering, 'unresolved');
  assert.equal(c.robustWithinTolerance, true);
});

test('coefficients are reconstructed rather than replacing results with reference constants', () => {
  const spec = fixture(); spec.technosphere.matrix[3][1] = '-1';
  const r = evaluate('smooth', '0.3', spec);
  assert.deepEqual(r.alternatives.paintB.activities, ['0', '6', '0', '6']);
  assert.deepEqual(r.alternatives.paintB.inventory, ['19.8', '0.066']);
  assert.equal(r.alternatives.paintB.indicator, '21.6546');
  assert.deepEqual(r.comparison.affine, { intercept: '-2.1124', slope: '-14' });
  assert.deepEqual(r.comparison.range, ['-9.1124', '-3.5124']);
});

test('service changes require matching declared quantities and scenario demands', () => {
  const spec = fixture(); spec.service.paintA.kgPerM2PerTreatment = '0.04'; spec.service.paintA.requiredKg = '8';
  spec.scenarios.smooth.demands.paintA[0] = '8'; spec.scenarios.rough.demands.paintA[0] = '8';
  assert.deepEqual(validateTeachingCase(spec), []);
  assert.equal(evaluate('smooth', '0.1', spec).alternatives.paintA.indicator, '19.1736');
});

test('malformed records produce diagnostics rather than throwing during validation', () => {
  for (const value of [null, [], {}, { service: null }, fixture()]) assert.doesNotThrow(() => validateTeachingCase(value));
  invalid(s => { s.service.paintA = null; }, /service.paintA.*object/);
  invalid(s => { s.scenarios.rough.demands = null; }, /demands.*object/);
  invalid(s => { s.environment.matrix[0] = null; }, /environment.matrix.*2 × 4/);
});

test('missing factors, NaN, Infinity, numeric JS values and executable expressions cannot become zero', () => {
  invalid(s => { s.characterization.factorVector.pop(); }, /factor.*each identified flow/);
  for (const bad of ['NaN', 'Infinity', '1e309', 'theta+1', '1/2', 28.1, null]) {
    invalid(s => { s.characterization.factorVector[1] = bad; }, /factorVector\[1\].*finite decimal string/);
  }
  invalid(s => { s.environment.matrix[1][2] = '-0.1'; }, /must be nonnegative/);
});

test('flow identities, origin, units, parameter location and topology cannot silently change', () => {
  invalid(s => { s.environment.rows[1] = 'CH4, biogenic-origin emission to air, kg'; }, /environment.rows.*identity/);
  invalid(s => { s.characterization.factorUnits[1] = 'kg CO2-eq/kg unspecified CH4'; }, /factorUnits.*unit/);
  invalid(s => { s.technosphere.rows[0] = 'Paint A, litre'; }, /technosphere.rows.*unit/);
  invalid(s => { s.service.areaUnit = 'ft2'; }, /areaUnit.*unit/);
  invalid(s => { s.uncertainty.unit = 'g CO2/kWh'; }, /uncertainty.unit.*unit/);
  invalid(s => { s.environment.matrix[0][3] = '0.3'; }, /expected "theta"/);
  invalid(s => { s.environment.matrix[0][0] = 'theta'; }, /finite decimal string/);
  invalid(s => { s.technosphere.matrix[0][1] = '-1'; }, /unsupported topology/);
});

test('incoherent declared required mass and demands are detected before evaluation', () => {
  invalid(s => { s.service.paintA.requiredKg = '6'; }, /requiredKg.*does not match/);
  invalid(s => { s.scenarios.rough.demands.paintB[2] = '0'; }, /rough.demands.paintB.*incoherent/);
  invalid(s => { s.scenarios.smooth.demands.paintA[3] = '20'; }, /smooth.demands.paintA.*incoherent/);
  invalid(s => { s.scenarios.extra = s.scenarios.smooth; }, /scenarios.*model shape/);
});

test('gaps, duplicated treatments, omitted initial treatment, and treatment at excluded year 10 fail service coverage', () => {
  for (const times of [['1', '5'], ['0', '6'], ['0'], ['0', '0', '5'], ['0', '5', '10']]) {
    invalid(s => { s.service.paintA.treatmentTimesYears = times; }, /bad service coverage/);
  }
  invalid(s => { s.service.paintA.stipulatedLifeYearsPerTreatment = '0'; }, /must be positive/);
});

test('shared relation and bounded epistemic domain must remain explicit', () => {
  invalid(s => { s.uncertainty.sharedRelation = 'Independent theta for A and B'; }, /sharedRelation.*unsupported/);
  invalid(s => { s.uncertainty.probability = 'uniform'; }, /probability.*unsupported/);
  invalid(s => { s.uncertainty.closedRange = ['0.5', '0.1']; }, /lower bound exceeds/);
  invalid(s => { s.uncertainty.displayPoint = '0.9'; }, /outside closed range/);
  assert.throws(() => evaluate('smooth', '0.099999999999999999999999'), /outside the closed shared domain/);
  assert.throws(() => evaluate('smooth', '0.500000000000000000000001'), /outside the closed shared domain/);
  assert.throws(() => evaluate('smooth', 0.3), /finite decimal string/);
  assert.throws(() => evaluate('other', '0.3'), /must be smooth or rough/);
});
