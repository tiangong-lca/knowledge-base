// A fixed-ratio, two-service inventory illustration, not an allocation solver.
// Inputs are decimal strings. All returned numerical values are exact rationals;
// the two differently typed inventory coordinates are never added to each other.
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
const rational = (n, d = 1n) => {
  if (!d) throw new TypeError('zero denominator');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d); return [n / g, d / g];
};
const zero = rational(0n), one = rational(1n);
const add = (a, b) => rational(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const sub = (a, b) => rational(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => rational(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => rational(a[0] * b[1], a[1] * b[0]);
const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
const exact = a => a[1] === 1n ? String(a[0]) : `${a[0]}/${a[1]}`;
const strings = values => values.map(exact);
function decimal(value) {
  if (typeof value !== 'string' || value.length > 200 || !/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value))
    throw new TypeError('must be a finite decimal string (at most 200 characters)');
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.');
  return rational(BigInt((whole || '0') + fraction) * (negative ? -1n : 1n), 10n ** BigInt(fraction.length));
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const operations = ['joint', 'standaloneX', 'standaloneY', 'wasteY'];
const products = ['X', 'Y'];
const rows = ['fossil CO2 emitted to air, kg', 'SO2 emitted to air, g'];
const activityBasis = {
  joint: 'one indivisible stipulated batch yielding 4 kg X and 6 kg Y in fixed proportions',
  standaloneX: 'one operation supplies 1 kg functionally equivalent X',
  standaloneY: 'one operation supplies 1 kg functionally equivalent Y',
  wasteY: 'one operation treats 1 kg unused joint Y without recovery',
};
const systemActivities = {
  reference: { joint: '0', standaloneX: '4', standaloneY: '6', wasteY: '0' },
  jointRoute: { joint: '1', standaloneX: '0', standaloneY: '6*(1-q)', wasteY: '6*(1-q)' },
};

/** Structural/model consistency only; no empirical, source or normative approval. */
export function validateJointProductionCase(spec) {
  if (!object(spec)) return ['joint case: must be an object'];
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const identity = (value, expected, path) => {
    if (JSON.stringify(value) !== JSON.stringify(expected)) fail(path, `unsupported identity/unit/model shape; expected ${JSON.stringify(expected)}`);
  };
  const text = (value, path) => { if (typeof value !== 'string' || !value.trim()) fail(path, 'must be a nonempty string'); };
  const number = (value, path, positive = false) => {
    try { const v = decimal(value); if (v[0] < 0n || (positive && v[0] === 0n)) fail(path, positive ? 'must be positive' : 'must be nonnegative'); }
    catch (error) { fail(path, error.message); }
  };
  identity(spec.caseId, 'CASE-JOINT-BATCH', 'caseId');
  identity(spec.version, '1.0.0', 'version');
  identity(spec.model, 'fixed-ratio-joint-inventory-v1', 'model');
  for (const field of ['createdAt', 'status', 'numericProvenanceDefault', 'partitionQuestion', 'partitionScope', 'decisionQuestion', 'qMeaning', 'residualInterpretation']) text(spec[field], field);
  identity(spec.inventoryRows, rows, 'inventoryRows');
  for (const field of ['activityBasis', 'outputKgPerJointBatch', 'inventoryPerOperation', 'pricePerKgCU', 'functionalDemandKg', 'systemActivities', 'assessment']) {
    if (!object(spec[field])) fail(field, 'must be an object');
  }
  if (!Array.isArray(spec.premises) || !spec.premises.length || spec.premises.some(value => typeof value !== 'string' || !value.trim())) fail('premises', 'must list the explicit service/response/scope premises');
  identity(spec.qScenarios, ['1', '0.5', '0'], 'qScenarios');
  identity(spec.qProbability, null, 'qProbability');
  if (errors.some(error => /must be an object/.test(error))) return errors;
  for (const operation of operations) {
    identity(spec.activityBasis[operation], activityBasis[operation], `activityBasis.${operation}`);
    const inventory = spec.inventoryPerOperation[operation];
    if (!Array.isArray(inventory) || inventory.length !== 2) fail(`inventoryPerOperation.${operation}`, 'must supply both identified inventory coordinates; missing flows are not zero');
    else inventory.forEach((value, index) => number(value, `inventoryPerOperation.${operation}.${index}`));
  }
  for (const product of products) {
    // These quantities fix one batch and both retained service demands. Other
    // yields or service baskets need a reviewed model extension, not a guess.
    const amount = product === 'X' ? '4' : '6';
    identity(spec.outputKgPerJointBatch[product], amount, `outputKgPerJointBatch.${product}`);
    identity(spec.functionalDemandKg[product], amount, `functionalDemandKg.${product}`);
    number(spec.pricePerKgCU[product], `pricePerKgCU.${product}`, true);
  }
  for (const route of ['reference', 'jointRoute']) {
    if (!object(spec.systemActivities[route])) fail(`systemActivities.${route}`, 'must be an object');
    else for (const operation of operations) identity(spec.systemActivities[route][operation], systemActivities[route][operation], `systemActivities.${route}.${operation}`);
  }
  identity(spec.assessment.kind, 'inventory-only', 'assessment.kind');
  identity(spec.assessment.characterizationFactors, null, 'assessment.characterizationFactors');
  identity(spec.assessment.crossFlowAggregation, false, 'assessment.crossFlowAggregation');
  text(spec.assessment.interpretation, 'assessment.interpretation');
  return errors;
}

/** Evaluate the three declared deterministic delivery scenarios, never probabilities. */
export function evaluateJointProductionCase(spec) {
  const errors = validateJointProductionCase(spec);
  if (errors.length) throw new TypeError(`Invalid joint-production case:\n${errors.join('\n')}`);
  const inventory = Object.fromEntries(operations.map(name => [name, spec.inventoryPerOperation[name].map(decimal)]));
  const amounts = Object.fromEntries(products.map(name => [name, decimal(spec.outputKgPerJointBatch[name])]));
  const revenue = Object.fromEntries(products.map(name => [name, mul(amounts[name], decimal(spec.pricePerKgCU[name]))]));
  const vadd = (a, b) => a.map((value, index) => add(value, b[index]));
  const vsub = (a, b) => a.map((value, index) => sub(value, b[index]));
  const scale = (vector, amount) => vector.map(value => mul(value, amount));
  const same = (a, b) => a.every((value, index) => equal(value, b[index]));
  const requireInvariant = (condition, message) => { if (!condition) throw new Error(`internal joint-case invariant failed: ${message}`); };
  const routeInventory = activities => operations.reduce((total, name) => vadd(total, scale(inventory[name], activities[name])), [zero, zero]);
  const partition = measure => {
    const total = add(measure.X, measure.Y), shareX = div(measure.X, total), shareY = div(measure.Y, total);
    const Xbatch = scale(inventory.joint, shareX), Ybatch = scale(inventory.joint, shareY), sum = vadd(Xbatch, Ybatch);
    requireInvariant(equal(add(shareX, shareY), one) && same(sum, inventory.joint), 'partition conservation');
    return { shareX: exact(shareX), shareY: exact(shareY), Xbatch: strings(Xbatch), Ybatch: strings(Ybatch),
      XperKg: strings(scale(Xbatch, div(one, amounts.X))), YperKg: strings(scale(Ybatch, div(one, amounts.Y))), sum: strings(sum) };
  };
  const referenceActivities = { joint: zero, standaloneX: amounts.X, standaloneY: amounts.Y, wasteY: zero };
  const reference = routeInventory(referenceActivities);
  const Xstandalone = scale(inventory.standaloneX, amounts.X), Ystandalone = scale(inventory.standaloneY, amounts.Y);
  const scenarios = Object.fromEntries(['full', 'half', 'none'].map((name, index) => {
    const q = decimal(spec.qScenarios[index]), used = mul(amounts.Y, q), unused = sub(amounts.Y, used);
    const activities = { joint: one, standaloneX: zero, standaloneY: unused, wasteY: unused };
    const jointRoute = routeInventory(activities), change = vsub(jointRoute, reference);
    // The physical route *contains* the top-up. It disappears only here, by
    // cancellation with the corresponding reference Y supply in this residual.
    const residual = vsub(vadd(inventory.joint, scale(inventory.wasteY, unused)), scale(inventory.standaloneY, used));
    const reconstructed = vsub(residual, Xstandalone);
    const suppliedX = add(mul(activities.joint, amounts.X), activities.standaloneX);
    const suppliedY = add(used, activities.standaloneY), dispositionY = add(used, activities.wasteY);
    const serviceDemandSatisfied = equal(suppliedX, amounts.X) && equal(suppliedY, amounts.Y);
    const jointYDispositionBalanced = equal(dispositionY, amounts.Y), residualReconstructionMatches = same(reconstructed, change);
    requireInvariant(serviceDemandSatisfied && jointYDispositionBalanced && residualReconstructionMatches, 'service, disposition or residual reconstruction');
    return [name, { q: exact(q), jointYusedKg: exact(used), jointYwastedKg: exact(unused), standaloneYtopUpKg: exact(unused),
      activities: Object.fromEntries(operations.map(operation => [operation, exact(activities[operation])])),
      jointRouteContributions: Object.fromEntries(operations.map(operation => [operation, strings(scale(inventory[operation], activities[operation]))])),
      contributions: { joint: strings(inventory.joint), topUp: strings(scale(inventory.standaloneY, activities.standaloneY)), waste: strings(scale(inventory.wasteY, activities.wasteY)) },
      jointRoute: strings(jointRoute), changeJointMinusReference: strings(change), Xresidual: strings(residual),
      XresidualPerKg: strings(scale(residual, div(one, amounts.X))), XresidualReconstructedChange: strings(reconstructed),
      balances: { XserviceSuppliedKg: exact(suppliedX), YserviceSuppliedKg: exact(suppliedY), jointYDispositionKg: exact(dispositionY),
        requiredXKg: exact(amounts.X), requiredYKg: exact(amounts.Y), jointYProducedKg: exact(amounts.Y),
        serviceDemandSatisfied, jointYDispositionBalanced, residualReconstructionMatches } }];
  }));
  const Xresidual = vsub(inventory.joint, Ystandalone), Yresidual = vsub(inventory.joint, Xstandalone);
  const wrongSum = vadd(Xresidual, Yresidual), saving = vsub(reference, inventory.joint);
  requireInvariant(same(vsub(inventory.joint, wrongSum), saving), 'double-credit diagnostic');
  const crossing = index => {
    const intercept = add(inventory.joint[index], mul(amounts.Y, inventory.wasteY[index]));
    const slopeMagnitude = mul(amounts.Y, add(inventory.wasteY[index], inventory.standaloneY[index]));
    return slopeMagnitude[0] === 0n ? null : exact(div(intercept, slopeMagnitude));
  };
  return { caseId: spec.caseId, version: spec.version, inventoryRows: [...rows],
    partitions: { mass: partition(amounts), grossSales: partition(revenue) },
    batchRevenueCU: { X: exact(revenue.X), Y: exact(revenue.Y), total: exact(add(revenue.X, revenue.Y)) },
    referenceActivities: Object.fromEntries(operations.map(name => [name, exact(referenceActivities[name])])), referenceBasket: strings(reference), scenarios,
    doNotCombineSeparateResiduals: { XresidualAtFullUse: strings(Xresidual), YresidualFromDifferentAnchoring: strings(Yresidual),
      wrongSum: strings(wrongSum), physicalJointInventory: strings(inventory.joint), doubleClaimedJointSaving: strings(saving),
      interpretation: 'wrongSum is a deliberately invalid sum of separately anchored comparisons, not a physical inventory or an additive co-product assignment.' },
    residualZeroCrossingsQ: { CO2: crossing(0), SO2: crossing(1) },
    metadata: { assessment: 'inventory-only; coordinates retain separate units; no LCIA or total environmental ranking',
      numericProvenanceDefault: spec.numericProvenanceDefault, residualInterpretation: spec.residualInterpretation,
      qMeaning: spec.qMeaning, qProbability: null, premises: [...spec.premises] } };
}
