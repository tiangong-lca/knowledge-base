// Closed v1: selected historical M3 balance and a separate author-stipulated
// response illustration. Neither reconstructs empirical marginal supply.
const basis = 'Swiss1995 physical electricity balance; displayed GWh; exports use positive magnitude';
const tuples = [
  ['production', '60277', 'production', 'switzerland-1995-production'],
  ['imports', '18113', 'imports', 'switzerland-1995-imports'],
  ['exports', '25143', 'exports', 'switzerland-1995-exports-positive-magnitude'],
  ['finalConsumption', '51567', 'final-consumption', 'switzerland-1995-final-consumption'],
  ['losses', '1680', 'losses', 'switzerland-1995-reported-losses'],
  ['de', '7014', 'de', 'germany-to-switzerland-1995-imports'],
  ['fr', '9116', 'fr', 'france-to-switzerland-1995-imports'],
  ['at', '1973', 'at', 'austria-to-switzerland-1995-imports'],
  ['it', '10', 'it', 'italy-to-switzerland-1995-imports'],
];
export const marketResponseFactKeys = Object.freeze(tuples.map(([key]) => key));
const reviewed = {
  caseId: 'CASE-MARKET-RESPONSE', version: '1.0.0', model: 'historical-average-and-stipulated-response-v1',
  createdAt: '2026-11-05', status: 'selected-historical-arithmetic-and-author-illustration',
  source: { sourceId: 'src-menard-dones-gantner-1998', readingId: 'rd-menard-dones-gantner-1998-market',
    artifactId: 'pdf-psi-1998', sha256: 'e0ccffc801eff82d5b0b96c4bc862031941a34db61c878c02d9ac72aacded0e8' },
  facts: Object.fromEntries(tuples.map(([key, value, suffix, subject]) => [key, {
    value, unit: 'GWh', quantity: 'annual-electricity-flow', subject, basis,
    evidenceId: 'ev-market-psi-m3', factId: `nf-market-psi-${suffix}`, passageId: 'ps-market-psi-m3',
  }])),
  interpretation: { historicalModel: 'M3-only', referenceYear: '1995', balanceIncludesReportedLosses: true,
    exportMixEqualsDomesticProductionMix: true, allImportsAssignedToDomesticConsumption: true,
    historicalEmissionTotalsReconstructed: false, originalSoftwareExecuted: false, unreportedPrecisionRecovered: false,
    empiricalResponseValidated: false, scientificValidation: false },
  illustration: { kind: 'author-stipulated-two-supply-activity-response', materialLabel: 'hypothetical-material',
    additionalMaterialKg: '1', electricityKWhPerKg: '10', otherUsersDemandKWh: '100',
    baselineHGenerationKWh: '40', baselineGGenerationKWh: '60', constrainedHGenerationKWh: '40',
    expandableHGenerationKWh: '50', producerTakesOnlyH: true, hCO2KgPerKWh: '0.02', gCO2KgPerKWh: '0.8',
    coefficientUnit: 'kg CO2/kWh', activityUnit: 'kWh', sameAdditionalMaterialService: true, fixedOtherUsersDemand: true,
    importsExportsAndLossesIncluded: false, coProductsIncluded: false, otherMaterialFeedbackIncluded: false,
    realTechnologyOrAluminiumModel: false, coefficientsAreAuthorStipulated: true, wholeLifeCycleModel: false,
    uncertaintyPropagated: false, additionalDemandEqualsSelectedProducerOutput: true,
    responseFrame: 'static-before-after-same-abstract-period', hAndGInterchangeableWithinMarket: true,
    internalTransmissionConstraint: false, capacityOrDispatchMechanismIdentified: false, actualOutputChangesStipulated: true },
};
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const shapeOf = value => object(value) ? Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)])) : null;
const freeze = value => { if (object(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
// Every projected leaf is primitive; no private/capture metadata is exported.
export const marketResponseInputShape = freeze(shapeOf(reviewed));
export function validateMarketResponseCase(spec) {
  const errors = [];
  const check = (actual, expected, path) => {
    if (object(expected)) {
      if (!object(actual)) { errors.push(`${path}: must be an object`); return; }
      const keys = Object.keys(actual).sort(), wanted = Object.keys(expected).sort();
      if (keys.length !== wanted.length || keys.some((key, index) => key !== wanted[index]))
        errors.push(`${path}: must contain exactly the reviewed fields ${wanted.join(', ')}`);
      for (const key of wanted) check(actual[key], expected[key], `${path}.${key}`);
    } else if (actual !== expected) errors.push(`${path}: expected reviewed value ${JSON.stringify(expected)}`);
  };
  check(spec, reviewed, 'case');
  return errors;
}

// Reduced rational arithmetic preserves source integers and synthetic decimal
// assumptions exactly. Displays round halfway away from zero; no recovered
// measurement precision or uncertainty is implied by extra display decimals.
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
const q = (n, d = 1n) => { if (!d) throw new TypeError('zero denominator'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const decimal = value => { const [whole, fraction = ''] = value.split('.'); return q(BigInt(whole + fraction), 10n ** BigInt(fraction.length)); };
const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const sub = (a, b) => q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => q(a[0] * b[1], a[1] * b[0]);
function fixed(a, places) {
  const scale = 10n ** BigInt(places), positive = a[0] < 0n ? -a[0] : a[0];
  let n = positive * scale / a[1];
  if (positive * scale % a[1] * 2n >= a[1]) n++;
  const sign = a[0] < 0n && n !== 0n ? '-' : '', digits = String(n).padStart(places + 1, '0');
  return places ? `${sign}${digits.slice(0, -places)}.${digits.slice(-places)}` : `${sign}${digits}`;
}
function result(a) {
  let rest = a[1]; while (rest % 2n === 0n) rest /= 2n; while (rest % 5n === 0n) rest /= 5n;
  // All terminating values in this closed model need at most two decimals.
  const exact = a[1] === 1n ? String(a[0]) : rest === 1n ? fixed(a, 2).replace(/0+$/, '').replace(/\.$/, '') : `${a[0]}/${a[1]}`;
  return { exact, numerator: String(a[0]), denominator: String(a[1]), fixed6: fixed(a, 6) };
}
export function evaluateMarketResponseCase(spec) {
  const errors = validateMarketResponseCase(spec);
  if (errors.length) throw new TypeError(`Invalid market-response case:\n${errors.join('\n')}`);
  const f = Object.fromEntries(marketResponseFactKeys.map(key => [key, decimal(spec.facts[key].value)]));
  const denominator = sub(add(f.production, f.imports), f.exports), domestic = sub(f.production, f.exports);
  const origins = Object.fromEntries([['CH', domestic], ['DE', f.de], ['FR', f.fr], ['AT', f.at], ['IT', f.it]].map(([country, amount]) => {
    const fraction = div(amount, denominator);
    return [country, { amountGWh: result(amount), fraction: result(fraction), percentFixed4: fixed(mul(fraction, q(100n)), 4), percentFixed1: fixed(mul(fraction, q(100n)), 1) }];
  }));
  const i = spec.illustration, producerDemand = mul(decimal(i.additionalMaterialKg), decimal(i.electricityKWhPerKg));
  const otherDemand = decimal(i.otherUsersDemandKWh), baselineH = decimal(i.baselineHGenerationKWh), baselineG = decimal(i.baselineGGenerationKWh);
  const hFactor = decimal(i.hCO2KgPerKWh), gFactor = decimal(i.gCO2KgPerKWh), zero = q(0n);
  const co2 = (h, g) => add(mul(h, hFactor), mul(g, gFactor));
  const baselineCO2 = co2(baselineH, baselineG);
  const totalCO2ForHOutput = h => co2(h, sub(add(otherDemand, producerDemand), h));
  const constrainedH = decimal(i.constrainedHGenerationKWh), expandableH = decimal(i.expandableHGenerationKWh);
  const activities = (h, g) => ({ H: result(h), G: result(g), total: result(add(h, g)) });
  const scenario = totalH => {
    const totalG = sub(add(otherDemand, producerDemand), totalH), otherH = sub(totalH, producerDemand);
    const totalCO2 = totalCO2ForHOutput(totalH), producerCO2 = co2(producerDemand, zero), otherCO2 = co2(otherH, totalG);
    return { producer: activities(producerDemand, zero), otherUsers: activities(otherH, totalG), generation: activities(totalH, totalG),
      changeFromBaseline: activities(sub(totalH, baselineH), sub(totalG, baselineG)),
      producerChangeFromBaseline: activities(producerDemand, zero),
      otherUsersChangeFromBaseline: activities(sub(otherH, baselineH), sub(totalG, baselineG)), totalCO2Kg: result(totalCO2),
      producerAssignedCO2Kg: result(producerCO2), otherUsersCO2Kg: result(otherCO2),
      otherUsersCO2ChangeKg: result(sub(otherCO2, baselineCO2)), totalCO2ChangeKg: result(sub(totalCO2, baselineCO2)),
      producerAssignmentMinusTotalChangeKg: result(sub(producerCO2, sub(totalCO2, baselineCO2))) };
  };
  return {
    historical: { model: 'M3', referenceYear: '1995', flowUnit: 'GWh', denominatorGWh: result(denominator),
      domesticAfterExportGWh: result(domestic), consumptionPlusLossesGWh: result(add(f.finalConsumption, f.losses)), origins,
      denominatorMeaning: 'mixed supply including reported losses; not a verified voltage-specific final-meter unit',
      emissionTotalsReconstructed: false, empiricalModelValidityEstablished: false },
    illustration: { kind: i.kind, activityUnit: i.activityUnit, emissionUnit: 'kg CO2', additionalMaterialKg: i.additionalMaterialKg,
      producerDemandKWh: result(producerDemand), otherUsersDemandKWh: result(otherDemand),
      baseline: { producer: activities(zero, zero), otherUsers: activities(baselineH, baselineG), generation: activities(baselineH, baselineG), totalCO2Kg: result(baselineCO2) },
      constrained: scenario(constrainedH), expandable: scenario(expandableH),
      differenceBetweenScenarioIncrementsKg: result(sub(totalCO2ForHOutput(constrainedH), totalCO2ForHOutput(expandableH))),
      coefficientsAreAuthorStipulated: true, realTechnologyFactors: false, empiricalResponseValidated: false, wholeLifeCycleModel: false },
  };
}

/** Publication-policy hook: exact source facts plus actual selected passage and
 * original PDF joins. Identity checks establish consistency, not entailment. */
export function validateMarketResponseFacts(spec, published, context = {}) {
  const errors = validateMarketResponseCase(spec);
  if (errors.length) return errors;
  if (!object(published) || !Array.isArray(published.sources) || !Array.isArray(published.evidence))
    return ['market response: a public source/evidence closure is required'];
  const unique = (records, label) => {
    const map = new Map();
    for (const record of records) {
      if (!object(record) || typeof record.id !== 'string' || !record.id || map.has(record.id)) errors.push(`market response: ambiguous ${label} identity`);
      else map.set(record.id, record);
    }
    return map;
  };
  const sources = unique(published.sources, 'source'), evidence = unique(published.evidence, 'evidence');
  const readings = new Map(), passages = new Map(), artifacts = new Map(), ids = new Set();
  const register = context?.readingRegister;
  let malformed = !object(register) || register.schemaVersion !== 1 || !Array.isArray(register.readings);
  const identify = record => {
    if (!object(record) || typeof record.id !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(record.id) || ids.has(record.id)) { malformed = true; return false; }
    ids.add(record.id); return true;
  };
  if (!malformed) for (const reading of register.readings) {
    if (!identify(reading)) continue;
    readings.set(reading.id, reading);
    if (!Array.isArray(reading.passages) || !Array.isArray(reading.artifacts)) { malformed = true; continue; }
    for (const passage of reading.passages) if (identify(passage)) passages.set(passage.id, { reading, passage });
    for (const artifact of reading.artifacts) if (identify(artifact)) artifacts.set(artifact.id, { reading, artifact });
  }
  if (malformed) errors.push('market response: an unambiguous actual reading register is required');
  const selected = spec.source, source = sources.get(selected.sourceId), reading = readings.get(selected.readingId);
  if (!source || !['passages-inspected', 'public-passages-inspected', 'public-full-text-inspected', 'licensed-full-text-inspected'].includes(source.accessStatus)
      || source.reading?.readingId !== selected.readingId || source.reading?.status !== 'selected-passages'
      || typeof source.reading?.scope !== 'string' || !source.reading.scope.trim() || reading?.readingStatus !== 'selected-passages')
    errors.push('market response: source must bind the actual inspected selected reading and scope');
  for (const [key, input] of Object.entries(spec.facts)) {
    const record = evidence.get(input.evidenceId), facts = Array.isArray(record?.numericFacts) ? record.numericFacts : [];
    const matches = facts.filter(fact => fact?.id === input.factId);
    if (!record || record.sourceId !== selected.sourceId || record.numericFact !== undefined || matches.length !== 1
        || new Set(facts.map(fact => fact?.id)).size !== facts.length
        || ['value', 'unit', 'quantity', 'subject', 'basis'].some(field => matches[0]?.[field] !== input[field]))
      errors.push(`market response.facts.${key}: missing or mismatched public source fact identity/value/unit/quantity/subject/basis`);
    const located = passages.get(input.passageId), carrier = artifacts.get(located?.passage.artifactId);
    if (!reading || record?.readingId !== selected.readingId || record?.passageId !== input.passageId
        || located?.reading !== reading || carrier?.reading !== reading || located?.passage.artifactId !== selected.artifactId
        || carrier?.artifact.id !== selected.artifactId || ![undefined, 'retrieved'].includes(carrier?.artifact.kind)
        || carrier?.artifact.mediaType !== 'application/pdf' || carrier?.artifact.sha256 !== selected.sha256)
      errors.push(`market response.facts.${key}: missing or mismatched inspected original PDF passage carrier`);
  }
  return errors;
}
