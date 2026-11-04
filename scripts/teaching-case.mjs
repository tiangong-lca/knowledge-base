// A bounded, acyclic four-process teaching model, not a general LCA solver.
// Rational arithmetic stays internal; the public result contains only exact strings.
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
function q(n, d = 1n) {
  if (!d) throw new TypeError('zero denominator');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d); return [n / g, d / g];
}
const zero = q(0n), one = q(1n);
const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const neg = a => q(-a[0], a[1]);
const sub = (a, b) => add(a, neg(b));
const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => q(a[0] * b[1], a[1] * b[0]);
const cmp = (a, b) => { const n = a[0] * b[1] - b[0] * a[1]; return n < 0n ? -1 : n > 0n ? 1 : 0; };
const sum = xs => xs.reduce(add, zero);
const abs = x => x[0] < 0n ? neg(x) : x;
const min = (a, b) => cmp(a, b) <= 0 ? a : b;
const max = (a, b) => cmp(a, b) >= 0 ? a : b;
function decimal(value) {
  if (typeof value !== 'string' || !/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) || value.length > 200)
    throw new TypeError('must be a finite decimal string (at most 200 characters)');
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.');
  return q(BigInt((whole || '0') + fraction) * (negative ? -1n : 1n), 10n ** BigInt(fraction.length));
}
function exact(a) {
  if (a[1] === 1n) return String(a[0]);
  let remainder = a[1], twos = 0, fives = 0;
  while (remainder % 2n === 0n) { remainder /= 2n; twos++; }
  while (remainder % 5n === 0n) { remainder /= 5n; fives++; }
  if (remainder !== 1n) return `${a[0]}/${a[1]}`;
  const places = Math.max(twos, fives);
  const numerator = (a[0] < 0n ? -a[0] : a[0]) * 2n ** BigInt(places - twos) * 5n ** BigInt(places - fives);
  const digits = String(numerator).padStart(places + 1, '0');
  return `${a[0] < 0n ? '-' : ''}${digits.slice(0, -places)}.${digits.slice(-places)}`;
}
const mv = (matrix, vector) => matrix.map(row => sum(row.map((x, i) => mul(x, vector[i]))));
const strings = xs => xs.map(exact);
const alternatives = ['paintA', 'paintB'];
const rowNames = ['Paint A, kg', 'Paint B, kg', 'preparation service, m2', 'electricity, kWh'];
const columnNames = ['P-A: one operation supplies 1 kg ready-to-apply Paint A', 'P-B: one operation supplies 1 kg ready-to-apply Paint B', 'P-P: one operation prepares 1 m2 substrate', 'P-E: one operation supplies 1 kWh electricity'];
const flowNames = ['CO2, fossil-origin emission to air, kg', 'CH4, fossil-origin emission to air, kg'];
const factorUnits = ['kg CO2-eq/kg CO2', 'kg CO2-eq/kg fossil CH4'];
const sharedRelation = 'Exactly the same theta applies to both alternatives and both substrate scenarios; it is not two independent unknowns';
const outputUnit = 'kg CO2-eq per specified 100 m2 / ten-year service';
const toleranceUnit = 'kg CO2-eq per 100 m2 / ten-year service';
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);

function interval(service) {
  const match = /^\[0,(\d+(?:\.\d+)?)\)$/.exec(service.intervalYears);
  if (!match) throw new TypeError('service.intervalYears: supported interval is [0,positive-end), with year end excluded');
  const end = decimal(match[1]);
  if (cmp(end, zero) <= 0) throw new TypeError('service.intervalYears: end must be positive');
  return end;
}
function serviceFor(spec, alt) {
  const service = spec.service, data = service[alt], end = interval(service);
  const life = decimal(data.stipulatedLifeYearsPerTreatment);
  const dose = decimal(data.kgPerM2PerTreatment);
  const schedule = data.treatmentTimesYears.map(t => ({ start: decimal(t), end: add(decimal(t), life) }));
  return { area: decimal(service.area), dose, end, schedule,
    requiredKg: mul(mul(decimal(service.area), dose), q(BigInt(schedule.length))) };
}
function demands(spec, scenario, alt) {
  const mass = serviceFor(spec, alt).requiredKg;
  return [alt === 'paintA' ? mass : zero, alt === 'paintB' ? mass : zero,
    scenario === 'rough' && alt === 'paintB' ? decimal(spec.service.area) : zero, zero];
}

/** Return diagnostic strings; this does not assess empirical or scientific validity. */
export function validateTeachingCase(spec) {
  const errors = [];
  const error = (path, message) => errors.push(`${path}: ${message}`);
  const guard = fn => { try { fn(); } catch (e) { errors.push(e.message); } };
  const number = (value, path, positive = false) => {
    try { const x = decimal(value); if (cmp(x, zero) < (positive ? 1 : 0)) error(path, positive ? 'must be positive' : 'must be nonnegative'); return x; }
    catch (e) { error(path, e.message); return null; }
  };
  const text = (value, path) => { if (typeof value !== 'string' || !value.trim()) error(path, 'must be a nonempty string'); };
  const equal = (value, expected, path) => { if (JSON.stringify(value) !== JSON.stringify(expected)) error(path, `unsupported identity/unit/model shape; expected ${JSON.stringify(expected)}`); };
  if (!object(spec)) return ['case: must be an object'];
  equal(spec.caseId, 'CASE-WALL-CONNECT', 'caseId');
  for (const key of ['version', 'status', 'numericProvenanceDefault']) text(spec[key], key);
  for (const key of ['service', 'technosphere', 'environment', 'characterization', 'uncertainty', 'comparison', 'scenarios', 'countercase']) {
    if (!object(spec[key])) error(key, 'must be an object');
  }
  // Returning here avoids interpreting malformed nested shapes as valid defaults.
  if (errors.some(e => /must be an object/.test(e))) return errors;
  number(spec.countercase.massKg, 'countercase.massKg', true);
  const service = spec.service;
  number(service.area, 'service.area', true); equal(service.areaUnit, 'm2', 'service.areaUnit');
  text(service.performance, 'service.performance');
  if (!Array.isArray(service.assumptions) || !service.assumptions.length || service.assumptions.some(x => typeof x !== 'string' || !x.trim())) error('service.assumptions', 'must list the stipulated assumptions');
  let end; guard(() => { end = interval(service); });
  for (const alt of alternatives) {
    const data = service[alt];
    if (!object(data)) { error(`service.${alt}`, 'must be an object'); continue; }
    const dose = number(data.kgPerM2PerTreatment, `service.${alt}.kgPerM2PerTreatment`, true);
    const life = number(data.stipulatedLifeYearsPerTreatment, `service.${alt}.stipulatedLifeYearsPerTreatment`, true);
    number(data.requiredKg, `service.${alt}.requiredKg`, true);
    if (!Array.isArray(data.treatmentTimesYears) || !data.treatmentTimesYears.length) { error(`service.${alt}.treatmentTimesYears`, 'must be a nonempty schedule'); continue; }
    const times = data.treatmentTimesYears.map((x, i) => number(x, `service.${alt}.treatmentTimesYears[${i}]`));
    if (life && end && times.every(Boolean)) {
      let coveredUntil = zero, previous = null;
      for (const t of times) {
        if (cmp(t, coveredUntil) > 0 || (previous && cmp(t, previous) <= 0) || cmp(t, end) >= 0) error(`service.${alt}.treatmentTimesYears`, 'bad service coverage: treatments must be strictly increasing inside [0,end), without gaps');
        coveredUntil = max(coveredUntil, add(t, life)); previous = t;
      }
      if (cmp(coveredUntil, end) < 0) error(`service.${alt}.treatmentTimesYears`, 'bad service coverage: schedule ends before required interval');
    }
    if (dose && end) guard(() => {
      if (cmp(serviceFor(spec, alt).requiredKg, decimal(data.requiredKg)) !== 0) error(`service.${alt}.requiredKg`, 'does not match area × dose × treatment count');
    });
  }
  // This version has a fixed service denominator, flow identities and operation bases.
  // New products/units/topologies require a versioned engine extension, not guessing.
  equal(service.area, '100', 'service.area'); equal(service.intervalYears, '[0,10)', 'service.intervalYears');
  equal(spec.technosphere.rows, rowNames, 'technosphere.rows');
  equal(spec.technosphere.columns, columnNames, 'technosphere.columns');
  const A = spec.technosphere.matrix;
  if (!Array.isArray(A) || A.length !== 4 || A.some(r => !Array.isArray(r) || r.length !== 4)) error('technosphere.matrix', 'must be 4 × 4');
  else for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    try {
      const x = decimal(A[i][j]);
      if ((i < 3 || j === 3) && cmp(x, i === j ? one : zero) !== 0) error(`technosphere.matrix[${i}][${j}]`, 'unsupported topology: identity outputs with electricity inputs only');
      if (i === 3 && j < 3 && cmp(x, zero) > 0) error(`technosphere.matrix[${i}][${j}]`, 'electricity input must be nonpositive');
    } catch (e) { error(`technosphere.matrix[${i}][${j}]`, e.message); }
  }
  text(spec.technosphere.doubleCountingRule, 'technosphere.doubleCountingRule');
  equal(spec.environment.rows, flowNames, 'environment.rows');
  const B = spec.environment.matrix;
  if (!Array.isArray(B) || B.length !== 2 || B.some(r => !Array.isArray(r) || r.length !== 4)) error('environment.matrix', 'must be 2 × 4');
  else for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) {
    if (i === 0 && j === 3) equal(B[i][j], 'theta', `environment.matrix[${i}][${j}]`);
    else number(B[i][j], `environment.matrix[${i}][${j}]`);
  }
  const cf = spec.characterization;
  if (!Array.isArray(cf.factorVector) || cf.factorVector.length !== 2) error('characterization.factorVector', 'must provide a factor for each identified flow; missing factors are not zero');
  else cf.factorVector.forEach((x, i) => number(x, `characterization.factorVector[${i}]`));
  equal(cf.factorUnits, factorUnits, 'characterization.factorUnits'); equal(cf.outputUnit, outputUnit, 'characterization.outputUnit');
  for (const key of ['name', 'sourceId', 'sourceStatus', 'reportedCH4Uncertainty', 'scope']) text(cf[key], `characterization.${key}`);
  const u = spec.uncertainty;
  equal(u.parameter, 'theta', 'uncertainty.parameter'); equal(u.unit, 'kg CO2/kWh', 'uncertainty.unit');
  equal(u.sharedRelation, sharedRelation, 'uncertainty.sharedRelation'); equal(u.probability, null, 'uncertainty.probability');
  if (!Array.isArray(u.closedRange) || u.closedRange.length !== 2) error('uncertainty.closedRange', 'must be two closed bounds');
  else {
    const [low, high] = u.closedRange.map((x, i) => number(x, `uncertainty.closedRange[${i}]`));
    const point = number(u.displayPoint, 'uncertainty.displayPoint');
    if (low && high && cmp(low, high) > 0) error('uncertainty.closedRange', 'lower bound exceeds upper bound');
    if (point && low && high && (cmp(point, low) < 0 || cmp(point, high) > 0)) error('uncertainty.displayPoint', 'outside closed range');
  }
  number(spec.comparison.tolerance, 'comparison.tolerance'); equal(spec.comparison.toleranceUnit, toleranceUnit, 'comparison.toleranceUnit');
  text(spec.comparison.toleranceStatus, 'comparison.toleranceStatus');
  equal(Object.keys(spec.scenarios).sort(), ['rough', 'smooth'], 'scenarios');
  for (const scenario of ['smooth', 'rough']) {
    const data = spec.scenarios[scenario];
    if (!object(data)) { error(`scenarios.${scenario}`, 'must be an object'); continue; }
    text(data.version, `scenarios.${scenario}.version`); text(data.initialCondition, `scenarios.${scenario}.initialCondition`);
    if (!object(data.demands)) { error(`scenarios.${scenario}.demands`, 'must be an object'); continue; }
    for (const alt of alternatives) {
      const values = data.demands[alt];
      if (!Array.isArray(values) || values.length !== 4) { error(`scenarios.${scenario}.demands.${alt}`, 'must have four typed coordinates'); continue; }
      values.forEach((x, i) => number(x, `scenarios.${scenario}.demands.${alt}[${i}]`));
      guard(() => {
        const expected = demands(spec, scenario, alt);
        if (values.some((x, i) => cmp(decimal(x), expected[i]) !== 0)) error(`scenarios.${scenario}.demands.${alt}`, 'incoherent with reconstructed service quantities and fixed substrate preparation rule');
      });
    }
  }
  return errors;
}

function calculate(spec, f, theta) {
  const A = spec.technosphere.matrix.map(row => row.map(decimal));
  const B = spec.environment.matrix.map(row => row.map(x => x === 'theta' ? theta : decimal(x)));
  const cf = spec.characterization.factorVector.map(decimal);
  const s = [...f.slice(0, 3), sub(f[3], sum(f.slice(0, 3).map((x, i) => mul(A[3][i], x))))];
  const balance = mv(A, s), g = mv(B, s);
  const contributions = B.map(row => row.map((v, i) => mul(v, s[i])));
  const characterized = g.map((v, i) => mul(v, cf[i]));
  const indicator = sum(characterized);
  const processContributions = s.map((x, j) => mul(x, sum(B.map((row, i) => mul(row[j], cf[i])))));
  if (balance.some((x, i) => cmp(x, f[i]) !== 0) || cmp(sum(processContributions), indicator) !== 0) throw new Error('internal reconstruction invariant failed');
  return { demand: strings(f), activities: strings(s), balance: strings(balance), inventory: strings(g),
    inventoryContributions: contributions.map(strings), characterizedContributions: strings(characterized),
    processIndicatorContributions: strings(processContributions), indicator: exact(indicator), _indicator: indicator };
}
function publicCalculation(result) { const { _indicator, ...out } = result; return out; }

/** Evaluate one common theta and the analytic paired range over the full closed domain. */
export function evaluateTeachingCase(spec, { scenario = 'smooth', theta = spec?.uncertainty?.displayPoint } = {}) {
  const errors = validateTeachingCase(spec);
  if (errors.length) throw new TypeError(`Invalid teaching case:\n${errors.join('\n')}`);
  if (!['smooth', 'rough'].includes(scenario)) throw new TypeError('scenario: must be smooth or rough');
  let t; try { t = decimal(theta); } catch (e) { throw new TypeError(`theta: ${e.message}`); }
  const [low, high] = spec.uncertainty.closedRange.map(decimal);
  if (cmp(t, low) < 0 || cmp(t, high) > 0) throw new RangeError('theta: outside the closed shared domain');
  const f = Object.fromEntries(alternatives.map(alt => [alt, demands(spec, scenario, alt)]));
  const at = point => Object.fromEntries(alternatives.map(alt => [alt, calculate(spec, f[alt], point)]));
  const selected = at(t), endpoints = [at(low), at(high)];
  // The only parameter occupies one fixed B cell; A/f/CF do not depend on it.
  // Therefore each indicator and paired difference are affine, so extrema are endpoints.
  const differenceAt = point => { const result = at(point); return sub(result.paintB._indicator, result.paintA._indicator); };
  const intercept = differenceAt(zero), slope = sub(differenceAt(one), intercept);
  const d = sub(selected.paintB._indicator, selected.paintA._indicator);
  const ds = endpoints.map(r => sub(r.paintB._indicator, r.paintA._indicator));
  const range = [min(...ds), max(...ds)];
  const marginal = Object.fromEntries(alternatives.map(alt => { const xs = endpoints.map(r => r[alt]._indicator); return [alt, [min(...xs), max(...xs)]]; }));
  const strictOrdering = cmp(range[0], zero) > 0 ? 'A-lower' : cmp(range[1], zero) < 0 ? 'B-lower' : 'unresolved';
  const tolerance = decimal(spec.comparison.tolerance);
  const root = slope[0] ? div(neg(intercept), slope) : null;
  const mass = decimal(spec.countercase.massKg);
  const sameMass = Object.fromEntries(alternatives.map(alt => {
    const service = serviceFor(spec, alt);
    const area = div(mass, mul(service.dose, q(BigInt(service.schedule.length))));
    const ratio = div(area, service.area);
    const massDemand = f[alt].map(x => mul(x, ratio));
    return [alt, { serviceArea: exact(area), serviceFraction: exact(ratio), fulfillsSpecifiedService: cmp(area, service.area) >= 0,
      ...publicCalculation(calculate(spec, massDemand, t)) }];
  }));
  return {
    caseId: spec.caseId, version: spec.version, scenario, scenarioVersion: spec.scenarios[scenario].version, theta: exact(t),
    service: { area: spec.service.area, areaUnit: 'm2', intervalYears: spec.service.intervalYears, performance: spec.service.performance,
      alternatives: Object.fromEntries(alternatives.map(alt => { const data = serviceFor(spec, alt); return [alt, {
        kgPerM2PerTreatment: exact(data.dose), requiredKg: exact(data.requiredKg), treatmentCount: data.schedule.length,
        schedule: data.schedule.map(x => ({ start: exact(x.start), end: exact(x.end) })) }]; })) },
    model: { processes: [...spec.technosphere.columns], rows: [...spec.technosphere.rows], environmentRows: [...spec.environment.rows],
      technosphere: spec.technosphere.matrix.map(row => [...row]), environment: spec.environment.matrix.map(row => row.map(x => x === 'theta' ? exact(t) : exact(decimal(x)))),
      factors: [...spec.characterization.factorVector], factorUnits: [...spec.characterization.factorUnits], outputUnit: spec.characterization.outputUnit,
      coordinateUnits: ['kg', 'kg', 'm2', 'kWh'], inventoryUnits: ['kg CO2', 'kg fossil CH4'], activityUnit: 'count of stated process operations' },
    alternatives: Object.fromEntries(alternatives.map(alt => [alt, publicCalculation(selected[alt])])),
    comparison: { difference: exact(d), direction: 'B-minus-A', affine: { intercept: exact(intercept), slope: exact(slope) }, range: strings(range),
      marginalRanges: Object.fromEntries(alternatives.map(alt => [alt, strings(marginal[alt])])),
      independentExtremesRange: strings([sub(marginal.paintB[0], marginal.paintA[1]), sub(marginal.paintB[1], marginal.paintA[0])]),
      strictOrdering, strictOrderResolved: strictOrdering !== 'unresolved', tolerance: exact(tolerance),
      robustWithinTolerance: range.every(x => cmp(abs(x), tolerance) <= 0), crossoverTheta: root ? exact(root) : null,
      allOutsideTolerance: cmp(range[0], tolerance) > 0 || cmp(range[1], neg(tolerance)) < 0,
      crossoverInDomain: root ? cmp(root, low) >= 0 && cmp(root, high) <= 0 : false,
      sharedRange: strings([low, high]), sharedRelation: spec.uncertainty.sharedRelation,
      rangeMethod: 'Exact affine endpoint extrema under one shared theta; independent extremes are a counterexample, not the admitted paired range.' },
    sameMass: { massKg: exact(mass), scenario, theta: exact(t), alternatives: sameMass },
    metadata: { status: spec.status, numericProvenanceDefault: spec.numericProvenanceDefault,
      sourceId: spec.characterization.sourceId, sourceStatus: spec.characterization.sourceStatus, factorName: spec.characterization.name,
      reportedCH4Uncertainty: spec.characterization.reportedCH4Uncertainty, factorScope: spec.characterization.scope,
      assumptions: [...spec.service.assumptions], doubleCountingRule: spec.technosphere.doubleCountingRule,
      toleranceStatus: spec.comparison.toleranceStatus,
      preparationRule: 'smooth: no preparation; rough: Paint B requires one preparation operation per m2, Paint A none; author-stipulated, not inferred from the matrix.',
      limitations: ['Hypothetical performance and inventory, not empirical paint validation.', 'Only two elementary flows and one selected climate indicator; missing life-cycle activities, flows and categories are not zero.', 'Fixed selected central characterization factors; their reported uncertainty is not propagated.', 'Bounded shared epistemic parameter, not a probability distribution, confidence interval or statistical test.', 'Arithmetic validation does not establish source fidelity, scientific validity, expert approval or whole-product equivalence.'] },
  };
}
