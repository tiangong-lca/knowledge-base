// Closed author-designed disjoint-record example. No Suh coefficients or raw
// source tables enter this module. This is not a general Appendix A7 engine.
const reviewed = {
  caseId: 'CASE-HYBRID-OVERLAP', version: '1.0.0', model: 'synthetic-disjoint-record-residualization-v1',
  createdAt: '2026-11-05', status: 'author-invented-inventory-only-teaching-model',
  numericProvenanceDefault: 'AUTHOR-INVENTED: every annual flow, price, emission and technology coefficient in this generator network',
  linkedService: {
    caseId: 'CASE-WALL-CONNECT', version: '1.0.0', inputFile: 'wall-coating-v1.json',
    inputSha256: 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285',
    scenario: 'smooth', alternative: 'paintA', area: '100', areaUnit: 'm2', intervalYears: '[0,10)',
    treatmentTimesYears: ['0', '5'], kgPerM2PerTreatment: '0.05', paintKg: '10',
    electricityKWhPerKgPaint: '2', fixedElectricityDeliveryKWh: '20',
    scope: 'electricity-subinventory-only', oldAggregatedElectricityBurdensAdded: false,
    paintNonElectricBurdensAdded: false, wallClimateScoreCalculated: false, alternativesCompared: false,
  },
  annualBasis: {
    periodYears: '1', region: 'fictional-region', priceYear: 'fictional-year', currencyUnit: 'CU',
    priceBasis: 'producer', electricityPriceCUPerKWh: '1', transactionUnit: 'CU/year',
    emissionUnit: 'kg CO2/year', stationaryOverLinkedService: true, repeatedSteadyTechnology: true,
    marginsIncluded: false, taxesIncluded: false, importsIncluded: false, capitalIncluded: false,
    lossesIncluded: false, coProductsIncluded: false,
  },
  suppliers: {
    F: { output: '100', outputUnit: 'kWh/year', outputValueCU: '100', directCO2Kg: '40', commodity: 'E', industry: 'E' },
    G: { output: '100', outputUnit: 'kWh/year', outputValueCU: '100', directCO2Kg: '120', commodity: 'E', industry: 'E' },
    S: { output: '100', outputUnit: 'CU/year', outputValueCU: '100', directCO2Kg: '30', commodity: 'S', industry: 'S' },
  },
  transactions: {
    rowSupplierOrder: ['F', 'G', 'S'], columnConsumerOrder: ['F', 'G', 'S'],
    identified: { description: 'F and G each supply 10 CU of power to S', annualCU: [['0', '0', '10'], ['0', '0', '10'], ['20', '30', '20']] },
    sameAggregateCounterworld: { description: 'G supplies all 20 CU of power to S; F supplies none', annualCU: [['0', '0', '0'], ['0', '0', '20'], ['20', '30', '20']] },
  },
  residualization: {
    foregroundSupplier: 'F', removeForegroundMakeAndDirectEmissions: true,
    removeIdentifiedForegroundPurchases: true, removeIdentifiedForegroundSales: true,
    removalRule: 'each identified annual transaction incident to F is removed once from raw use; its original direction determines the bridge',
    normalization: 'remaining use columns divided by remaining commodity output values; remaining emissions divided by those same outputs',
    commodityOrder: ['E', 'S'], foregroundActivityUnit: 'kWh', residualActivityUnits: ['CU', 'CU'],
    directInventoryUnit: 'kg CO2', upstreamUnit: 'CU/kWh', downstreamUnit: 'kWh/CU',
  },
  controls: {
    finalDemand: ['20', '0', '0'], finalDemandCoordinates: ['F kWh', 'E CU', 'S CU'],
    processOnly: 'F direct emissions for fixed 20 kWh; both bridges omitted',
    naive: 'same identified explicit bridges plus unadjusted raw IO coefficients and raw IO emissions',
    corrected: 'both bridges plus remaining accounts after exact record removal and renormalization',
    counterworld: 'same raw aggregates, prices, outputs, emissions and final demand; only the supplier identity of power sold to S changes',
    misidentification: 'apply the identified-world 10 CU F-to-S invoice removal and bridge to the counterworld, where that invoice is actually G-to-S',
  },
  interpretation: {
    authorDesignedSpecialCase: true, informedBySuhConceptually: true, sourceCoefficientsReused: false,
    literalGeneralAppendixA7Implementation: false, sourceResidualizationReconstructed: false,
    empiricalCalibration: false, scientificValidation: false, realSupplierData: false,
    characterizationFactors: null, climateImpactScore: false, wholeWallLifeCycle: false,
    equalAggregatesIdentifySupplierOverlap: false, uncertaintyPropagated: false,
  },
};
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const freeze = value => {
  if (value !== null && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const shapeOf = value => Array.isArray(value) ? [shapeOf(value[0])]
  : object(value) ? Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)])) : null;
export const hybridOverlapInputShape = freeze(shapeOf(reviewed));
freeze(reviewed);

/** Closed public v1. Neither a flag nor an equal-valued substitute may change its
 * unit basis, supplier records, scope or linked service without a new version. */
export function validateHybridOverlapCase(spec) {
  const errors = [];
  const check = (actual, expected, path) => {
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual)) { errors.push(`${path}: must be an array`); return; }
      if (actual.length !== expected.length || Reflect.ownKeys(actual).length !== expected.length + 1)
        errors.push(`${path}: must contain exactly ${expected.length} reviewed entries`);
      expected.forEach((value, index) => check(actual[index], value, `${path}.${index}`));
    } else if (object(expected)) {
      if (!object(actual)) { errors.push(`${path}: must be a plain object`); return; }
      const keys = Reflect.ownKeys(actual), wanted = Object.keys(expected);
      if (keys.length !== wanted.length || keys.some(key => typeof key !== 'string' || !Object.hasOwn(expected, key)))
        errors.push(`${path}: must contain exactly the reviewed public fields`);
      for (const key of wanted) check(actual[key], expected[key], `${path}.${key}`);
    } else if (actual !== expected) errors.push(`${path}: expected closed v1 value ${JSON.stringify(expected)}`);
  };
  check(spec, reviewed, 'case');
  return errors;
}

/** Extra integration check against the actual registered wall input and its
 * canonical public hash. Raw-file bytes need not have canonical key ordering. */
export function validateHybridOverlapServiceLink(spec, wall, canonicalWallSha256) {
  const errors = validateHybridOverlapCase(spec);
  if (errors.length) return errors;
  const l = spec.linkedService, s = wall?.service, p = s?.paintA;
  if (wall?.caseId !== l.caseId || wall?.version !== l.version || canonicalWallSha256 !== l.inputSha256)
    errors.push('linkedService: registered wall identity or canonical public input hash differs');
  if (s?.area !== l.area || s?.areaUnit !== l.areaUnit || s?.intervalYears !== l.intervalYears
      || p?.requiredKg !== l.paintKg || p?.kgPerM2PerTreatment !== l.kgPerM2PerTreatment
      || JSON.stringify(p?.treatmentTimesYears) !== JSON.stringify(l.treatmentTimesYears)
      || JSON.stringify(wall?.scenarios?.smooth?.demands?.paintA) !== JSON.stringify(['10', '0', '0', '0'])
      || wall?.technosphere?.matrix?.[3]?.[0] !== '-2')
    errors.push('linkedService: registered Paint A smooth service or electricity delivery differs');
  return errors;
}

// Exact reduced fractions; no binary floating-point arithmetic enters balances.
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
const q = (n, d = 1n) => {
  if (!d) throw new TypeError('zero denominator');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d); return [n / g, d / g];
};
const decimal = value => {
  if (!/^-?\d+(\.\d+)?$/.test(value)) throw new TypeError('expected finite decimal string');
  const [whole, fraction = ''] = value.split('.'); return q(BigInt(whole + fraction), 10n ** BigInt(fraction.length));
};
const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const neg = a => [-a[0], a[1]];
const sub = (a, b) => add(a, neg(b));
const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => q(a[0] * b[1], a[1] * b[0]);
const zero = () => q(0n), sum = values => values.reduce(add, zero());
const dot = (a, b) => sum(a.map((v, j) => mul(v, b[j])));
const mat = rows => rows.map(row => row.map(decimal));
const mv = (a, b) => a.map(row => dot(row, b));
const matrix = (n, m) => Array.from({ length: n }, () => Array.from({ length: m }, zero));
const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
function fixed(a, places) {
  const scale = 10n ** BigInt(places), abs = a[0] < 0n ? -a[0] : a[0];
  let n = abs * scale / a[1];
  if (abs * scale % a[1] * 2n >= a[1]) n++;
  const sign = a[0] < 0n && n ? '-' : '', digits = String(n).padStart(places + 1, '0');
  return places ? `${sign}${digits.slice(0, -places)}.${digits.slice(-places)}` : `${sign}${digits}`;
}
function result(a) {
  let d = a[1], twos = 0, fives = 0;
  while (d % 2n === 0n) { d /= 2n; twos++; }
  while (d % 5n === 0n) { d /= 5n; fives++; }
  const terminating = d === 1n, places = Math.max(twos, fives);
  const exact = terminating ? (places ? fixed(a, places).replace(/0+$/, '').replace(/\.$/, '') : String(a[0])) : `${a[0]}/${a[1]}`;
  return { exact, numerator: String(a[0]), denominator: String(a[1]), fixed6: fixed(a, 6) };
}
const vectorResult = v => v.map(result), matrixResult = m => m.map(vectorResult);
function solve(a, y) {
  const m = a.map((row, i) => [...row, y[i]]), n = a.length;
  for (let j = 0; j < n; j++) {
    const k = m.findIndex((row, index) => index >= j && row[j][0] !== 0n);
    if (k < 0) throw new TypeError('singular synthetic model');
    [m[j], m[k]] = [m[k], m[j]];
    const pivot = m[j][j]; m[j] = m[j].map(value => div(value, pivot));
    for (let i = 0; i < n; i++) if (i !== j) {
      const factor = m[i][j]; m[i] = m[i].map((value, k2) => sub(value, mul(factor, m[j][k2])));
    }
  }
  return m.map(row => row[n]);
}
function system(cu, cd, a) {
  return [[q(1n), ...cd.map(neg)], ...a.map((row, i) => [neg(cu[i]), ...row.map((v, j) => sub(q(BigInt(i === j)), v))])];
}

export function evaluateHybridOverlapCase(spec) {
  const errors = validateHybridOverlapCase(spec);
  if (errors.length) throw new TypeError(`Invalid hybrid-overlap case:\n${errors.join('\n')}`);
  const ids = ['F', 'G', 'S'], suppliers = ids.map(id => spec.suppliers[id]);
  const outputCU = suppliers.map(row => decimal(row.outputValueCU)), output = suppliers.map(row => decimal(row.output));
  const emissions = suppliers.map(row => decimal(row.directCO2Kg)), group = [0, 0, 1];
  const demand = spec.controls.finalDemand.map(decimal), bf = div(emissions[0], output[0]);
  const normalize = (use, make, co2) => ({ a: use.map(row => row.map((v, j) => div(v, make[j]))), b: co2.map((v, i) => div(v, make[i])) });
  const aggregate = (flows, includeF) => {
    const make = [zero(), zero()], co2 = [zero(), zero()], use = matrix(2, 2);
    for (let i = includeF ? 0 : 1; i < 3; i++) {
      make[group[i]] = add(make[group[i]], outputCU[i]); co2[group[i]] = add(co2[group[i]], emissions[i]);
      for (let j = includeF ? 0 : 1; j < 3; j++) use[group[i]][group[j]] = add(use[group[i]][group[j]], flows[i][j]);
    }
    return { make, co2, use, ...normalize(use, make, co2) };
  };
  const accountResult = account => ({ commodityOrder: ['E', 'S'], makeOutputCUPerYear: vectorResult(account.make),
    useCUPerYear: matrixResult(account.use), directCO2KgPerYear: vectorResult(account.co2),
    AInputCUPerOutputCU: matrixResult(account.a), BKgCO2PerCU: vectorResult(account.b) });
  const evaluateSystem = (cu, cd, a, b) => {
    const h = system(cu, cd, a), activity = solve(h, demand), residual = mv(h, activity).map((v, i) => sub(v, demand[i]));
    const byActivity = activity.map((v, i) => mul(v, [bf, ...b][i]));
    if (activity.some(v => v[0] < 0n) || residual.some(v => v[0] !== 0n)) throw new TypeError('nonphysical or unbalanced synthetic solution');
    return { activity, h, total: sum(byActivity), public: {
      activityOrder: ['F', 'E', 'S'], activityUnits: ['kWh', 'CU', 'CU'], activities: vectorResult(activity),
      balanceMatrix: matrixResult(h), finalDemand: vectorResult(demand), balanceResiduals: vectorResult(residual),
      directCO2ByActivityKg: vectorResult(byActivity), totalCO2Kg: result(sum(byActivity)),
      foregroundDirectCO2Kg: result(byActivity[0]), backgroundDirectCO2Kg: result(sum(byActivity.slice(1))),
      allActivitiesNonnegative: true, allBalancesExactlyZero: true,
    } };
  };
  const world = key => {
    const flows = mat(spec.transactions[key].annualCU), raw = aggregate(flows, true), residual = aggregate(flows, false);
    const cu = [zero(), div(flows[2][0], output[0])], cd = [zero(), div(div(flows[0][2], decimal(spec.annualBasis.electricityPriceCUPerKWh)), residual.make[1])];
    const removedUse = raw.use.map((row, i) => row.map((v, j) => sub(v, residual.use[i][j])));
    const finalSales = flows.map((row, i) => sub(outputCU[i], sum(row)));
    const valueAdded = outputCU.map((v, j) => sub(v, sum(flows.map(row => row[j]))));
    // Independent supplier-level physical reference; G dollars equal kWh only
    // because the closed input fixes exactly 1 CU/kWh with no margins or losses.
    const physicalRequirements = flows.map(row => row.map((v, j) => div(v, output[j])));
    const physicalH = physicalRequirements.map((row, i) => row.map((v, j) => sub(q(BigInt(i === j)), v)));
    const supplierActivities = solve(physicalH, demand), corrected = evaluateSystem(cu, cd, residual.a, residual.b);
    const annualBalance = mv(physicalH, output).map((v, i) => sub(v, finalSales[i]));
    if (!supplierActivities.every((v, i) => equal(v, corrected.activity[i])) || annualBalance.some(v => v[0] !== 0n)
        || [...finalSales, ...valueAdded].some(v => v[0] < 0n)) throw new TypeError('supplier ledger does not conserve output or match corrected system');
    return { raw, residual, cu, cd, corrected, physicalH, public: {
      annualLedger: { supplierOrder: ids, consumerOrder: ids, transactionsCU: matrixResult(flows),
        outputCU: vectorResult(outputCU), directCO2Kg: vectorResult(emissions), finalUsersSalesCU: vectorResult(finalSales),
        valueAddedCU: vectorResult(valueAdded), annualSupplierBalanceResiduals: vectorResult(annualBalance),
        allFinalSalesAndValueAddedNonnegative: true },
      rawAccounts: accountResult(raw),
      removedRecords: {
        makeOutputCUPerYear: vectorResult(raw.make.map((v, i) => sub(v, residual.make[i]))),
        directCO2KgPerYear: vectorResult(raw.co2.map((v, i) => sub(v, residual.co2[i]))), useCUPerYear: matrixResult(removedUse),
        foregroundPurchases: { supplier: 'S', consumer: 'F', annualCU: result(flows[2][0]) },
        foregroundSales: { supplier: 'F', consumer: 'S', annualCU: result(flows[0][2]) },
        disjointTransactionsCountedOnce: true,
      },
      remainingAccounts: accountResult(residual),
      bridges: { CuOrder: ['E', 'S'], CuCUPerKWh: vectorResult(cu), CdOrder: ['E', 'S'], CdKWhPerCU: vectorResult(cd), BFkgCO2PerKWh: result(bf) },
      corrected: { ...corrected.public, residualPowerSupplier: 'G', backgroundAccountsExcludeF: true },
      supplierReference: { activityOrder: ids, activityUnits: ['kWh', 'kWh', 'CU'], balanceMatrix: matrixResult(physicalH),
        activities: vectorResult(supplierActivities), totalCO2Kg: result(dot(supplierActivities, emissions.map((v, i) => div(v, output[i])))),
        equalsCorrectedDisaggregatedActivities: true },
    } };
  };
  const identified = world('identified'), counter = world('sameAggregateCounterworld');
  const naive = evaluateSystem(identified.cu, identified.cd, identified.raw.a, identified.raw.b);
  const process = mul(bf, demand[0]);
  const naivePowerPer100 = mul(add(identified.cd[1], identified.raw.a[0][1]), output[2]);
  const correctedPowerPer100 = mul(add(identified.cd[1], identified.residual.a[0][1]), output[2]);
  const trueWorldResidual = mv(counter.physicalH, identified.corrected.activity).map((v, i) => sub(v, demand[i]));
  return {
    caseId: spec.caseId, version: spec.version, model: spec.model,
    linkedService: { areaM2: spec.linkedService.area, intervalYears: spec.linkedService.intervalYears,
      treatmentCount: result(q(BigInt(spec.linkedService.treatmentTimesYears.length))),
      paintKgPerTreatment: result(mul(decimal(spec.linkedService.area), decimal(spec.linkedService.kgPerM2PerTreatment))),
      totalPaintKg: result(decimal(spec.linkedService.paintKg)), fixedElectricityDeliveryKWh: result(demand[0]),
      scope: spec.linkedService.scope, oldAggregatedElectricityBurdensAdded: false, wallClimateScoreCalculated: false },
    processOnly: { foregroundActivityKWh: result(demand[0]), totalCO2Kg: result(process), upstreamCoverageIncluded: false },
    identified: identified.public,
    naive: { ...naive.public, accountMeaning: 'E still includes F; explicit foreground and both bridges also retained',
      servicePowerPurchasePer100CU: result(naivePowerPer100), actualLedgerPowerPurchasePer100CU: result(correctedPowerPer100),
      duplicatedPowerPurchasePer100CU: result(sub(naivePowerPer100, correctedPowerPer100)),
      excessOverCorrectedCO2Kg: result(sub(naive.total, identified.corrected.total)),
      zeroAlgebraicResidualDoesNotEstablishDisjointRecords: true },
    sameAggregateCounterworld: counter.public,
    ambiguity: { rawAggregatesExactlyEqual: ['make', 'co2'].every(key => identified.raw[key].every((v, i) => equal(v, counter.raw[key][i])))
        && identified.raw.use.every((row, i) => row.every((v, j) => equal(v, counter.raw.use[i][j]))),
      outputPricesAndDirectEmissionsHeldFixed: true, finalDemandHeldFixed: true,
      trueCounterworldCO2MinusIdentifiedWorldKg: result(sub(counter.corrected.total, identified.corrected.total)),
      rawAggregatesIdentifyCorrectedCO2: false,
      misidentifiedInvoice: { assumedSupplier: 'F', actualSupplier: 'G', assumedAnnualCU: result(decimal('10')),
        wrongPredictedCO2Kg: result(identified.corrected.total), trueCounterworldCO2Kg: result(counter.corrected.total),
        underpredictionKg: result(sub(counter.corrected.total, identified.corrected.total)),
        actualSupplierBalanceResiduals: vectorResult(trueWorldResidual), actualSupplierBalancesClose: false },
    },
    interpretation: { ...spec.interpretation },
  };
}
