// Two closed numerical illustrations. These are not a basin model, inventory
// estimator API or LCIA calculator. v1 fixes the reviewed tuple because prose
// also asserts ordering and exact expressions, beyond the arithmetic itself.
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a < 0n ? -a : a; };
const rat = (n, d = 1n) => { if (!d) throw new TypeError('zero denominator'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const add = (a, b) => rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const sub = (a, b) => rat(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => rat(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => rat(a[0] * b[1], a[1] * b[0]);
const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
const exact = a => a[1] === 1n ? String(a[0]) : `${a[0]}/${a[1]}`;
// Only terminating rationals are rendered as decimals; never round a result.
function terminatingDecimal([numerator, denominator]) {
  let remaining = denominator;
  for (const prime of [2n, 5n]) while (remaining % prime === 0n) remaining /= prime;
  if (remaining !== 1n) throw new TypeError('nonterminating decimal');
  let scale = 1n, places = 0;
  while (scale % denominator !== 0n) { scale *= 10n; places++; }
  const digits = String(numerator * (scale / denominator)).padStart(places + 1, '0');
  return places ? `${digits.slice(0, -places)}.${digits.slice(-places)}` : digits;
}
const one = rat(1n);
function decimal(value) {
  if (typeof value !== 'string' || value.length > 100 || !/^-?\d+(?:\.\d+)?$/.test(value)) throw new TypeError('must be a finite decimal string of at most 100 characters');
  const [whole, fraction = ''] = value.replace('-', '').split('.');
  return rat(BigInt(whole + fraction) * (value.startsWith('-') ? -1n : 1n), 10n ** BigInt(fraction.length));
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function checker(spec) {
  const errors = [];
  const identity = (value, expected, path) => { if (JSON.stringify(value) !== JSON.stringify(expected)) errors.push(`${path}: outside the reviewed static v1 model; expected ${JSON.stringify(expected)}`); };
  const numeric = (value, path, positive = false) => {
    try { const number = decimal(value); if (number[0] < 0n || (positive && !number[0])) errors.push(`${path}: must be ${positive ? 'positive' : 'nonnegative'}`); return number; }
    catch (error) { errors.push(`${path}: ${error.message}`); return null; }
  };
  const header = (id, model) => {
    identity(spec.caseId, id, 'caseId'); identity(spec.version, '1.0.0', 'version'); identity(spec.model, model, 'model');
    identity(spec.createdAt, '2026-11-04', 'createdAt'); identity(spec.status, 'hypothetical-illustration', 'status');
  };
  return { errors, identity, numeric, header };
}
export const waterPremises = Object.freeze({
  synthetic: true, nonOverlapping: true, sameProductReference: true,
  sameBasinSamePeriodReturns: true, noTransfersOrStorageChange: true,
  fixedBackground: true, marginalIllustration: true, completeSupplyChain: false,
  actualBasinOrFactorFile: false, hydrologicalModel: false, uncertaintyPropagated: false,
});
export const phosphorusConditions = Object.freeze({
  agriculture: 'background', inputKind: 'total-P-application-to-agricultural-soil',
  totalPApplicationDataSupplied: true, preExistingNetEmission: false,
  specificLossDataAvailable: false, measuredUniversalLoss: false,
});

export function validateWaterLocalityCase(spec) {
  if (!object(spec)) return ['water case: must be an object'];
  const { errors, identity, numeric, header } = checker(spec);
  header('CASE-WATER-LOCALITY', 'static-water-locality-v1');
  identity(spec.productReference, { amount: '1', unit: 'kg', meaning: 'hypothetical same specified product' }, 'productReference');
  identity(spec.waterUnit, 'm3/kg product', 'waterUnit');
  identity(spec.indicatorUnit, 'm3 world-eq./kg product', 'indicatorUnit');
  identity(spec.factorUnit, 'm3 world-eq./m3', 'factorUnit');
  identity(spec.reference, { symbol: 'r', positive: true, origin: 'external-fixed', estimatedFromProductRows: false }, 'reference');
  for (const [key, expected] of Object.entries(waterPremises)) identity(spec.premises?.[key], expected, `premises.${key}`);
  if (!Array.isArray(spec.contributions) || spec.contributions.length !== 2) errors.push('contributions: exactly two non-overlapping contributions required');
  else spec.contributions.forEach((row, index) => {
    if (!object(row)) { errors.push(`contributions.${index}: must be an object`); return; }
    const prefix = `contributions.${index}`;
    const expected = index === 0 ? ['water-example-foreground', 'X', 'M', '10', '8', '2', '0.5', '2'] : ['water-example-upstream', 'Y', 'N', '4', '3', '1', '0.125', '8'];
    ['id', 'basinLabel', 'periodLabel', 'withdrawal', 'return', 'consumed', 'amdRelativeToR', 'factor'].forEach((key, i) => identity(row[key], expected[i], `${prefix}.${key}`));
    identity(row.returnBasinLabel, row.basinLabel, `${prefix}.returnBasinLabel`);
    identity(row.returnPeriodLabel, row.periodLabel, `${prefix}.returnPeriodLabel`);
    const values = Object.fromEntries(['withdrawal', 'return', 'consumed', 'amdRelativeToR', 'factor'].map(key => [key, numeric(row[key], `${prefix}.${key}`, key !== 'return')]));
    if (values.withdrawal && values.return && values.consumed && !equal(sub(values.withdrawal, values.return), values.consumed)) errors.push(`${prefix}: incoherent withdrawal/return/consumed balance`);
    if (values.amdRelativeToR && values.factor && values.amdRelativeToR[0] > 0n) {
      const factor = div(one, values.amdRelativeToR);
      if (!equal(factor, values.factor)) errors.push(`${prefix}: factor must be the reciprocal of AMD/r`);
      if (factor[0] * 10n <= factor[1] || factor[0] >= 100n * factor[1]) errors.push(`${prefix}: ratio must lie strictly inside the positive untruncated factor interval (0.1,100)`);
    }
  });
  identity(spec.counterfactual, { changed: 'foreground-factor-only', foregroundFactor: '8', inventoryHeldFixed: true, referenceHeldFixed: true, backgroundHeldFixed: true }, 'counterfactual');
  return errors;
}
export function evaluateWaterLocalityCase(spec) {
  const errors = validateWaterLocalityCase(spec); if (errors.length) throw new TypeError(errors.join('\n'));
  const rows = spec.contributions.map(row => ({ consumed: sub(decimal(row.withdrawal), decimal(row.return)), amd: decimal(row.amdRelativeToR), cf: div(one, decimal(row.amdRelativeToR)) }));
  const total = rows.reduce((sum, row) => add(sum, row.consumed), rat(0n));
  const scores = rows.map(row => mul(row.consumed, row.cf));
  const weights = rows.map(row => div(row.consumed, total));
  const weightedAMD = rows.reduce((sum, row, i) => add(sum, mul(weights[i], row.amd)), rat(0n));
  const factorAtMean = div(one, weightedAMD);
  const weightedCF = rows.reduce((sum, row, i) => add(sum, mul(weights[i], row.cf)), rat(0n));
  const baseline = scores.reduce(add, rat(0n));
  const counterfactual = add(mul(rows[0].consumed, decimal(spec.counterfactual.foregroundFactor)), scores[1]);
  return { contributions: rows.map((row, i) => ({ consumed: exact(row.consumed), factor: exact(row.cf), score: exact(scores[i]), weight: exact(weights[i]),
    // v1 fixes integer divisors; changed tuples require a reviewed extension.
    amdExpression: `r/${exact(row.cf)}` })), totalConsumed: exact(total), baselineScore: exact(baseline), counterfactualScore: exact(counterfactual),
    weightedAMDRelativeToR: exact(weightedAMD), weightedAMDExpression: `${weightedAMD[0]}r/${weightedAMD[1]}`,
    factorAtMeanAMD: exact(factorAtMean), scoreAtMeanAMD: exact(mul(total, factorAtMean)), consumptionWeightedMeanCF: exact(weightedCF), scoreFromMeanCF: exact(mul(total, weightedCF)) };
}

export function validatePhosphorusBoundaryCase(spec) {
  if (!object(spec)) return ['phosphorus case: must be an object'];
  const { errors, identity, numeric, header } = checker(spec);
  header('CASE-PHOSPHORUS-BOUNDARY', 'static-background-phosphorus-boundary-v1');
  for (const [key, expected] of Object.entries(phosphorusConditions)) identity(spec.conditions?.[key], expected, `conditions.${key}`);
  identity(spec.application, { amount: '2', unit: 'kg total P applied', speciesBasis: 'P', hypothetical: true }, 'application');
  identity(spec.loss, { fraction: '0.1', unit: 'kg P to freshwater/kg total P applied', subject: 'total-P-applied-to-agricultural-soil', role: 'inventory-estimation-coefficient', sourceId: 'src-book-unep-glam-2019-volume2', evidenceId: 'ev-path-boundary' }, 'loss');
  identity(spec.emission, { unit: 'kg P to freshwater', speciesBasis: 'P', compartment: 'freshwater', kind: 'estimated-net-emission' }, 'emission');
  identity(spec.characterization, { symbol: 'c_FW', value: null, unit: 'kg P-eq/kg P', matchedEmissionSpeciesBasis: 'P', matchedCompartment: 'freshwater', numericFactorAdopted: false }, 'characterization');
  numeric(spec.application?.amount, 'application.amount', true);
  const fraction = numeric(spec.loss?.fraction, 'loss.fraction', true);
  if (fraction && fraction[0] > fraction[1]) errors.push('loss.fraction: cannot exceed one');
  return errors;
}
export function evaluatePhosphorusBoundaryCase(spec) {
  const errors = validatePhosphorusBoundaryCase(spec); if (errors.length) throw new TypeError(errors.join('\n'));
  const applied = decimal(spec.application.amount), fraction = decimal(spec.loss.fraction), emission = mul(applied, fraction);
  // Public prose uses decimal spellings only where their exact rational identity
  // is fixed by this static version; no floating-point formatting is involved.
  return { appliedTotalP: exact(applied), lossFraction: exact(fraction), lossFractionDecimal: spec.loss.fraction,
    lossFractionTwoDecimals: `${spec.loss.fraction}0`, lossPercent: exact(mul(fraction, rat(100n))),
    netFreshwaterP: exact(emission), netFreshwaterPDecimal: terminatingDecimal(emission), characterizationSymbol: spec.characterization.symbol,
    indicatorExpression: `${terminatingDecimal(emission)} kg P×${spec.characterization.symbol}`, indicatorUnit: 'kg P-eq' };
}
