// Closed selected reconstruction of one historical report, not a general LCA solver.
// This reviewed v1 authority is deliberately independent of the downloadable JSON.
// Changing a source tuple or its interpretation requires renewed review and versioning.
const reviewedFacts = [
  ["fillings", "1000000", "fillings", "1974-fillings", "ev-hist-demand", "nf-hist-fillings"],
  ["fluidOuncesPerFilling", "12", "US fl oz/filling", "1974-fluidOuncesPerFilling", "ev-hist-demand", "nf-hist-fluidOuncesPerFilling"],
  ["poundsPerShortTon", "2000", "lb/short ton", "1974-poundsPerShortTon", "ev-hist-demand", "nf-hist-poundsPerShortTon"],
  ["returnablePounds", "0.61", "lb/new returnable bottle", "1974-returnablePounds", "ev-hist-demand", "nf-hist-returnablePounds"],
  ["oneWayPounds", "0.41", "lb/new one-way bottle", "1974-oneWayPounds", "ev-hist-demand", "nf-hist-oneWayPounds"],
  ["uses", "10", "uses/bottle", "1974-uses", "ev-hist-systems", "nf-hist-uses"],
  ["sourceCoarseRetGlass", "30", "short tons/new glass per million fillings", "1974-sourceCoarseRetGlass", "ev-hist-materials", "nf-hist-sourceCoarseRetGlass"],
  ["litresPerFluidOunce", "0.02957", "L/US fl oz", "1974-litresPerFluidOunce", "ev-hist-conversion", "nf-hist-litresPerFluidOunce"],
  ["joulesPerBtu", "1055", "J/Btu", "1974-joulesPerBtu", "ev-hist-conversion", "nf-hist-joulesPerBtu"],
  ["comparisonLitres", "1000", "L delivered beer", "1974-comparisonLitres", "ev-hist-conversion", "nf-hist-comparisonLitres"],
  ["energyConversion", "0.002973", "GJ per1000L per millionBtu per12millionflOz", "1974-energyConversion", "ev-hist-conversion", "nf-hist-energyConversion"],
  ["glassInputDistillate", "1.2", "gal/short ton glass", "1974-glassInputDistillate", "ev-hist-glass-inputs", "nf-hist-glassInputDistillate"],
  ["glassInputResidual", "5.5", "gal/short ton glass", "1974-glassInputResidual", "ev-hist-glass-inputs", "nf-hist-glassInputResidual"],
  ["glassInputGas", "10700", "ft3/short ton glass", "1974-glassInputGas", "ev-hist-glass-inputs", "nf-hist-glassInputGas"],
  ["glassInputGasoline", "0.023", "gal/short ton glass", "1974-glassInputGasoline", "ev-hist-glass-inputs", "nf-hist-glassInputGasoline"],
  ["glassInputElectricity", "263", "kWh/short ton glass", "1974-glassInputElectricity", "ev-hist-glass-inputs", "nf-hist-glassInputElectricity"],
  ["fuelFactorDistillate", "158.9", "million Btu/1000gal", "1974-fuelFactorDistillate", "ev-hist-fuel-factors", "nf-hist-fuelFactorDistillate"],
  ["fuelFactorResidual", "169.9", "million Btu/1000gal", "1974-fuelFactorResidual", "ev-hist-fuel-factors", "nf-hist-fuelFactorResidual"],
  ["fuelFactorGas", "1.086", "million Btu/1000ft3", "1974-fuelFactorGas", "ev-hist-fuel-factors", "nf-hist-fuelFactorGas"],
  ["fuelFactorGasoline", "144.9", "million Btu/1000gal", "1974-fuelFactorGasoline", "ev-hist-fuel-factors", "nf-hist-fuelFactorGasoline"],
  ["electricityFactor", "11.1", "million Btu/1000composite kWh", "1974-electricityFactor", "ev-hist-electricity", "nf-hist-electricityFactor"],
  ["componentFeldspar", "0.100", "million Btu/report short-ton OWG system reference", "1974-componentFeldspar", "ev-hist-component-table", "nf-hist-componentFeldspar"],
  ["componentSand", "0.569", "million Btu/report short-ton OWG system reference", "1974-componentSand", "ev-hist-component-table", "nf-hist-componentSand"],
  ["componentNaturalSodaAsh", "0.040", "million Btu/report short-ton OWG system reference", "1974-componentNaturalSodaAsh", "ev-hist-component-table", "nf-hist-componentNaturalSodaAsh"],
  ["componentSodaAshManufacture", "1.851", "million Btu/report short-ton OWG system reference", "1974-componentSodaAshManufacture", "ev-hist-component-table", "nf-hist-componentSodaAshManufacture"],
  ["componentLime", "0.215", "million Btu/report short-ton OWG system reference", "1974-componentLime", "ev-hist-component-table", "nf-hist-componentLime"],
  ["componentLimestone", "0.031", "million Btu/report short-ton OWG system reference", "1974-componentLimestone", "ev-hist-component-table", "nf-hist-componentLimestone"],
  ["componentSalt", "0.049", "million Btu/report short-ton OWG system reference", "1974-componentSalt", "ev-hist-component-table", "nf-hist-componentSalt"],
  ["componentGlassFabrication", "15.668", "million Btu/report short-ton OWG system reference", "1974-componentGlassFabrication", "ev-hist-component-table", "nf-hist-componentGlassFabrication"],
  ["componentDisposal", "0.139", "million Btu/report short-ton OWG system reference", "1974-componentDisposal", "ev-hist-component-table", "nf-hist-componentDisposal"],
  ["componentClosure", "0.505", "million Btu/report short-ton OWG system reference", "1974-componentClosure", "ev-hist-component-table", "nf-hist-componentClosure"],
  ["componentTransport", "1.500", "million Btu/report short-ton OWG system reference", "1974-componentTransport", "ev-hist-component-table", "nf-hist-componentTransport"],
  ["componentFilling", "0.683", "million Btu/report short-ton OWG system reference", "1974-componentFilling", "ev-hist-component-table", "nf-hist-componentFilling"],
  ["componentPackaging", "7.752", "million Btu/report short-ton OWG system reference", "1974-componentPackaging", "ev-hist-component-table", "nf-hist-componentPackaging"],
  ["glassFabricationReported", "15.668", "million Btu/short ton glass fabrication", "1974-glassFabricationReported", "ev-hist-unit-factor", "nf-hist-glassFabricationReported"],
  ["retProcess", "1717", "million Btu/million12oz fillings", "1974-retProcess", "ev-hist-summary", "nf-hist-retProcess"],
  ["retTransport", "308", "million Btu/million12oz fillings", "1974-retTransport", "ev-hist-summary", "nf-hist-retTransport"],
  ["retMaterialResource", "1", "million Btu/million12oz fillings", "1974-retMaterialResource", "ev-hist-summary", "nf-hist-retMaterialResource"],
  ["retTotal", "2026", "million Btu/million12oz fillings", "1974-retTotal", "ev-hist-summary", "nf-hist-retTotal"],
  ["owgProcess", "5461", "million Btu/million12oz fillings", "1974-owgProcess", "ev-hist-summary", "nf-hist-owgProcess"],
  ["owgTransport", "574", "million Btu/million12oz fillings", "1974-owgTransport", "ev-hist-summary", "nf-hist-owgTransport"],
  ["owgMaterialResource", "1", "million Btu/million12oz fillings", "1974-owgMaterialResource", "ev-hist-summary", "nf-hist-owgMaterialResource"],
  ["owgTotal", "6036", "million Btu/million12oz fillings", "1974-owgTotal", "ev-hist-summary", "nf-hist-owgTotal"],
  ["retMetric", "6.02", "GJ/1000L beer", "1974-retMetric", "ev-hist-systems", "nf-hist-retMetric"],
  ["owgMetric", "17.9", "GJ/1000L beer", "1974-owgMetric", "ev-hist-systems", "nf-hist-owgMetric"],
  ["fiveTripUses", "5", "uses/bottle", "1974-fiveTripUses", "ev-hist-package-sensitivity", "nf-hist-fiveTripUses"],
  ["fiveTripGlassBranch", "1130", "million Btu/million12oz fillings", "1974-fiveTripGlassBranch", "ev-hist-five-trip-branch", "nf-hist-fiveTripGlassBranch"],
  ["packageUsesOne", "1", "uses/paper package", "1974-packageUsesOne", "ev-hist-package-sensitivity", "nf-hist-packageUsesOne"],
  ["packageEnergyOne", "12", "GJ/1000L beer", "1974-packageEnergyOne", "ev-hist-package-sensitivity", "nf-hist-packageEnergyOne"],
  ["packageUsesTwo", "2", "uses/paper package", "1974-packageUsesTwo", "ev-hist-package-sensitivity", "nf-hist-packageUsesTwo"],
  ["packageEnergyTwo", "9.0", "GJ/1000L beer", "1974-packageEnergyTwo", "ev-hist-package-sensitivity", "nf-hist-packageEnergyTwo"],
  ["packageUsesThree", "3", "uses/paper package", "1974-packageUsesThree", "ev-hist-package-sensitivity", "nf-hist-packageUsesThree"],
  ["packageEnergyThree", "8", "GJ/1000L beer", "1974-packageEnergyThree", "ev-hist-package-sensitivity", "nf-hist-packageEnergyThree"],
];
const factFields = ['value', 'unit', 'subject', 'evidenceId', 'factId'];
export const historicalFactKeys = Object.freeze(reviewedFacts.map(([key]) => key));
const identity = {
  "caseId": "CASE-HISTORICAL-GLASS",
  "version": "1.0.0",
  "model": "1974-selected-glass-reconstruction-v1",
  "createdAt": "2026-11-04",
  "status": "historical-source-reconstruction",
  "sourceId": "src-book-epa-1974-nine-beverage",
  "sourceArtifactSha256": "5ff8112421bbea07fa0a881fc867c0a2fef93972518faa381e457a5fde3bef19"
};
const interpretation = {
  "sourceYear": "1974",
  "comparison": "10-RET versus conventional OWG;12oz beer service",
  "scope": "selected fuel and component reconstruction plus reported-summary normalization",
  "usesIncludeInitialFilling": true,
  "printedDecimalsAreExactArithmeticInputs": true,
  "reportedTotalsIndependentlyReproduced": false,
  "originalSoftwareExecuted": false,
  "empiricalValidation": false,
  "currentProductRecommendation": false,
  "unreportedPrecisionRecovered": false
};
const coefficientRounding = {
  "kind": "author-conditional-displayed-coefficient-bound",
  "halfWidth": "0.0005",
  "massHeldAtPrintedValue": true,
  "massPrecisionIncluded": false,
  "probabilityAssigned": false
};

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Closed model/tuple consistency; source entailment and empirical validity are separate. */
export function validateHistoricalContainerCase(spec) {
  if (!object(spec)) return ['historical case: must be an object'];
  const errors = [];
  const same = (actual, expected, path) => {
    if (actual !== expected) errors.push(`${path}: expected reviewed value ${JSON.stringify(expected)}`);
  };
  const fields = (actual, expected, path) => {
    if (!object(actual)) { errors.push(`${path}: must be an object`); return false; }
    const keys = Object.keys(actual).sort(), wanted = [...expected].sort();
    if (keys.length !== wanted.length || keys.some((key, index) => key !== wanted[index]))
      errors.push(`${path}: must contain exactly the reviewed fields ${wanted.join(', ')}`);
    return true;
  };
  fields(spec, [...Object.keys(identity), 'interpretation', 'facts', 'coefficientRounding'], 'case');
  for (const [key, expected] of Object.entries(identity)) same(spec[key], expected, key);
  for (const [key, expected] of [['interpretation', interpretation], ['coefficientRounding', coefficientRounding]]) {
    if (fields(spec[key], Object.keys(expected), key))
      for (const [field, value] of Object.entries(expected)) same(spec[key][field], value, `${key}.${field}`);
  }
  if (fields(spec.facts, historicalFactKeys, 'facts')) {
    for (const [key, ...tuple] of reviewedFacts) {
      if (fields(spec.facts[key], factFields, `facts.${key}`))
        factFields.forEach((field, index) => same(spec.facts[key][field], tuple[index], `facts.${key}.${field}`));
    }
  }
  return errors;
}

// Reduced BigInt rationals stay internal. No binary floating-point arithmetic is
// used for source quantities, calculations, bounds, or comparison rounding.
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
const q = (n, d = 1n) => {
  if (!d) throw new TypeError('zero denominator');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d); return [n / g, d / g];
};
const decimal = value => {
  const [whole, fraction = ''] = value.split('.');
  return q(BigInt(whole + fraction), 10n ** BigInt(fraction.length));
};
const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const sub = (a, b) => q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => q(a[0] * b[1], a[1] * b[0]);
const sum = values => values.reduce(add, q(0n));
const greater = (a, b) => a[0] * b[1] > b[0] * a[1];
const magnitude = a => q(a[0] < 0n ? -a[0] : a[0], a[1]);
function exact(a) {
  if (a[1] === 1n) return String(a[0]);
  let rest = a[1], twos = 0, fives = 0;
  while (rest % 2n === 0n) { rest /= 2n; twos++; }
  while (rest % 5n === 0n) { rest /= 5n; fives++; }
  if (rest !== 1n) return `${a[0]}/${a[1]}`;
  const places = Math.max(twos, fives);
  const scaled = (a[0] < 0n ? -a[0] : a[0]) * 2n ** BigInt(places - twos) * 5n ** BigInt(places - fives);
  const digits = String(scaled).padStart(places + 1, '0');
  return `${a[0] < 0n ? '-' : ''}${digits.slice(0, -places)}.${digits.slice(-places)}`;
}
// Explicit comparison displays only: nearest decimal, halfway away from zero.
// Fixed-width output preserves a declared display such as 5965.910.
function rounded(a, places) {
  const scale = 10n ** BigInt(places), positive = a[0] < 0n ? -a[0] : a[0];
  let scaled = positive * scale / a[1];
  if ((positive * scale % a[1]) * 2n >= a[1]) scaled++;
  const sign = a[0] < 0n && scaled !== 0n ? '-' : '';
  if (places === 0) return sign + String(scaled);
  const digits = String(scaled).padStart(places + 1, '0');
  return `${sign}${digits.slice(0, -places)}.${digits.slice(-places)}`;
}

/** Evaluate only the reviewed calculations and three source-reported scenarios. */
export function evaluateHistoricalContainerCase(spec) {
  const errors = validateHistoricalContainerCase(spec);
  if (errors.length) throw new TypeError(`Invalid historical-container case:\n${errors.join('\n')}`);
  const f = Object.fromEntries(historicalFactKeys.map(key => [key, decimal(spec.facts[key].value)]));
  const thousand = q(1000n);
  const fillingTon = div(mul(f.fillings, f.returnablePounds), f.poundsPerShortTon);
  const retTon = div(fillingTon, f.uses), owgTon = div(mul(f.fillings, f.oneWayPounds), f.poundsPerShortTon);
  const fiveTripTon = div(fillingTon, f.fiveTripUses);
  const terms = {
    distillate: div(mul(f.glassInputDistillate, f.fuelFactorDistillate), thousand),
    residual: div(mul(f.glassInputResidual, f.fuelFactorResidual), thousand),
    gas: div(mul(f.glassInputGas, f.fuelFactorGas), thousand),
    gasoline: div(mul(f.glassInputGasoline, f.fuelFactorGasoline), thousand),
    electricity: div(mul(f.glassInputElectricity, f.electricityFactor), thousand),
  };
  const fabrication = sum(Object.values(terms));
  const glassKeys = ['componentFeldspar', 'componentSand', 'componentNaturalSodaAsh', 'componentSodaAshManufacture',
    'componentLime', 'componentLimestone', 'componentSalt', 'componentGlassFabrication'];
  const componentKeys = [...glassKeys, 'componentDisposal', 'componentClosure', 'componentTransport', 'componentFilling', 'componentPackaging'];
  const glassFactor = sum(glassKeys.map(key => f[key])), fiveTrip = mul(glassFactor, fiveTripTon);
  const allFactor = sum(componentKeys.map(key => f[key])), owgAssembly = mul(allFactor, owgTon);
  const gap = sub(f.owgTotal, owgAssembly);
  // This is an author-conditional coefficient bound at the displayed mass. It
  // excludes mass precision and is neither an empirical interval nor a probability.
  const coefficientOnlyBound = mul(mul(q(BigInt(componentKeys.length)), decimal(spec.coefficientRounding.halfWidth)), owgTon);
  const retGJ = mul(f.retTotal, f.energyConversion), owgGJ = mul(f.owgTotal, f.energyConversion);
  return {
    caseId: spec.caseId, version: spec.version,
    demand: {
      cohortLitres: exact(mul(mul(f.fillings, f.fluidOuncesPerFilling), f.litresPerFluidOunce)),
      returnableManufactureTon: exact(retTon), returnableFillingTon: exact(fillingTon),
      returnableReturnedTon: exact(sub(fillingTon, retTon)), oneWayManufactureTon: exact(owgTon),
      newReturnableBottles: exact(div(f.fillings, f.uses)), fiveTripManufactureTon: exact(fiveTripTon),
    },
    fabrication: {
      terms: Object.fromEntries(Object.entries(terms).map(([key, value]) => [key, exact(value)])),
      total: exact(fabrication), rounded3: rounded(fabrication, 3), reported: exact(f.glassFabricationReported),
      difference: exact(sub(fabrication, f.glassFabricationReported)),
    },
    glassBranch: {
      factor: exact(glassFactor), ret: exact(mul(glassFactor, retTon)), owg: exact(mul(glassFactor, owgTon)),
      fiveTrip: exact(fiveTrip), fiveTripRounded: rounded(fiveTrip, 0), reportedFiveTrip: exact(f.fiveTripGlassBranch),
    },
    summary: {
      retPartsTotal: exact(sum([f.retProcess, f.retTransport, f.retMaterialResource])),
      owgPartsTotal: exact(sum([f.owgProcess, f.owgTransport, f.owgMaterialResource])),
      retGJ: exact(retGJ), owgGJ: exact(owgGJ), retRounded2: rounded(retGJ, 2), owgRounded1: rounded(owgGJ, 1),
    },
    assembly: {
      factor: exact(allFactor), owg: exact(owgAssembly), owgFixed3: rounded(owgAssembly, 3), gap: exact(gap),
      coefficientOnlyBound: exact(coefficientOnlyBound), boundExceeded: greater(magnitude(gap), coefficientOnlyBound), fullClosure: false,
    },
    // Exact transcription of the three reported (approximately expressed)
    // energies. No interpolation or new trippage/transport scenario is implied.
    sensitivity: ['One', 'Two', 'Three'].map(suffix => ({
      bottleUses: exact(f.fiveTripUses), paperPackageUses: exact(f[`packageUses${suffix}`]),
      reportedGJ: exact(f[`packageEnergy${suffix}`]),
    })),
  };
}
