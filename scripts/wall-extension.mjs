// Closed author-designed companion teaching extension bound to CASE-WALL-CONNECT v1.0.0.
// Every wall-service parameter (marginal electricity intensities, NMVOC, blue water,
// watershed multipliers, unit costs, discount rate, basic GSD) is AUTHOR-INVENTED;
// only the explicitly bound EF 3.1 and Ciroth (2012) factors come from primary sources.
const reviewed = {
  caseId: 'CASE-WALL-EXT',
  version: '1.0.0',
  model: 'wall-service-cross-part-extension-v1',
  createdAt: '2026-11-28',
  status: 'author-invented-companion-teaching-model; arithmetic and primary-factor bindings reviewed; not an empirical comparative LCA',
  numericProvenanceDefault: 'AUTHOR-INVENTED: every newly added wall-service electricity marginal intensity, NMVOC emission, blue-water volume, watershed scarcity multiplier, currency unit cost, discount rate and basic GSD; only the explicitly bound EF 3.1 and Ciroth (2012) factors and inherited IPCC AR6 GWP100 factors are primary-sourced exceptions',
  wallParent: {
    caseId: 'CASE-WALL-CONNECT',
    version: '1.0.0',
    inputFile: 'wall-coating-v1.json',
    inputSha256: 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285',
    areaM2: '100',
    intervalYears: '[0,10)',
    paintAKg: '10',
    paintBKg: '6',
    paintAElectricityKWh: '20',
    paintBSmoothElectricityKWh: '30',
    paintBRoughElectricityKWh: '50',
    toleranceKgCO2eq: '4',
    baseGwp100CO2: '1',
    baseGwp100FossilCH4: '28.1',
  },
  facts: {
    ef31PofNmvocOutdoor: {
      value: '1.0',
      unit: 'kg NMVOC eq./kg',
      subject: 'nmvoc-air-outdoor-subcompartments',
      sourceId: 'src-weight135-ef31-selected-members',
      evidenceId: 'ev-weight135-ef31-pof-equal-cf',
      factId: 'nf-weight135-ef31-pof-nmvoc-outdoor',
    },
    ef31PofVocIndoor: {
      value: '0',
      unit: 'kg NMVOC eq./kg',
      subject: 'nmvoc-and-styrene-air-indoor',
      sourceId: 'src-weight135-ef31-selected-members',
      evidenceId: 'ev-weight135-ef31-pof-equal-cf',
      factId: 'nf-weight135-ef31-pof-voc-indoor',
    },
    ef31NfClimate: {
      value: '7553.0831628511733',
      unit: 'kg CO2 eq./(person·yr)',
      subject: 'climate-change',
      sourceId: 'src-weight135-ef31-selected-members',
      evidenceId: 'ev-weight135-ef31-nf-wf-workbook',
      factId: 'nf-weight135-ef31-nf-cc',
    },
    ef31NfPof: {
      value: '40.859197734777169',
      unit: 'kg NMVOC eq./(person·yr)',
      subject: 'photochemical-ozone-formation',
      sourceId: 'src-weight135-ef31-selected-members',
      evidenceId: 'ev-weight135-ef31-nf-wf-workbook',
      factId: 'nf-weight135-ef31-nf-pof',
    },
    ef31WfClimate: {
      value: '0.2106',
      unit: 'dimensionless',
      subject: 'climate-change',
      sourceId: 'src-weight135-ef31-selected-members',
      evidenceId: 'ev-weight135-ef31-nf-wf-workbook',
      factId: 'nf-weight135-ef31-wf-cc',
    },
    ef31WfPof: {
      value: '0.0478',
      unit: 'dimensionless',
      subject: 'photochemical-ozone-formation',
      sourceId: 'src-weight135-ef31-selected-members',
      evidenceId: 'ev-weight135-ef31-nf-wf-workbook',
      factId: 'nf-weight135-ef31-wf-pof',
    },
    pedigreeCompletenessScore2: {
      value: '1.03',
      unit: 'GSD',
      subject: 'pedigree-roundedScoreTwo',
      sourceId: 'src-book-ciroth-2012-pedigree-refinement',
      evidenceId: 'ev-ped-completeness-factors',
      factId: 'nf-ped-roundedScoreTwo',
    },
    pedigreeCompletenessScore4: {
      value: '1.08',
      unit: 'GSD',
      subject: 'pedigree-roundedScoreFour',
      sourceId: 'src-book-ciroth-2012-pedigree-refinement',
      evidenceId: 'ev-ped-completeness-factors',
      factId: 'nf-ped-roundedScoreFour',
    },
  },
  electricityGrid: {
    unit: 'kg CO2/kWh',
    averageTheta: '0.30',
    fossilMarginalTheta: '0.65',
    cleanMarginalTheta: '0.08',
    basePaintANonThetaKgCO2eq: '21.967',
    basePaintBSmoothNonThetaKgCO2eq: '20.529',
    basePaintBRoughNonThetaKgCO2eq: '26.091',
    note: 'AUTHOR-INVENTED attributional average vs. consequential marginal electricity CO2 intensities applied to the exact CASE-WALL-CONNECT v1 electricity demands (20, 30, 50 kWh); P-E fossil CH4 (0.001 kg/kWh) remains unchanged inside the base non-theta intercept.',
  },
  photochemicalOzone: {
    unit: 'kg NMVOC',
    paintAKgPerKg: '0.02',
    paintBKgPerKg: '0.25',
    prepKgPerM2: '0.005',
    electricityKgPerKWh: '0',
    note: 'AUTHOR-INVENTED illustrative water-borne (low-VOC Paint A) vs. solvent-borne (high-VOC Paint B) NMVOC emissions; P-E NMVOC omitted (stipulated zero in this module, not asserted zero in reality).',
  },
  waterScarcity: {
    volumeUnit: 'm3',
    factorUnit: 'm3 world-eq/m3',
    paintAM3PerKg: '0.002',
    paintBM3PerKg: '0.0005',
    prepM3PerM2: '0.00005',
    electricityM3PerKWh: '0',
    humidMultiplier: '2',
    aridMultiplier: '80',
    note: 'AUTHOR-INVENTED illustrative blue-water consumption and AWARE-style scarcity multipliers inside the conceptual [0.1, 100] m3 world-eq/m3 range; not actual watershed extractions.',
  },
  normalizationWeighting: {
    referenceThetaClean: '0.10',
    referenceThetaDisplay: '0.30',
    milliPointScale: '1000',
    fullSixteenCategoryScore: false,
    note: 'Two-category partial EF 3.1 per-capita normalization and Sala et al. (2018) weighting illustration (Climate Change + Photochemical Ozone Formation only; the remaining 14 EF categories are omitted).',
  },
  lifeCycleCosting: {
    currencyUnit: 'CU',
    paintACUPerKg: '30',
    paintBCUPerKg: '60',
    applicationLaborCUPerTreatment: '400',
    prepCUPerM2: '3.5',
    repaintYear: '5',
    discountRateAnnual: '0.05',
    perspective: 'building-owner-financial-lcc',
    note: 'AUTHOR-INVENTED user-perspective financial costs in fictional Currency Units (CU); omits environmental externalities, taxes, disposal and inflation.',
  },
  pedigreeUncertainty: {
    targetProcess: 'P-B non-electric fossil CO2 over 6 kg Paint B',
    medianKgCO2: '18',
    basicGsd: '1.2',
    scoreLowKey: 'pedigreeCompletenessScore2',
    scoreHighKey: 'pedigreeCompletenessScore4',
    logIntervalHalfWidthSd: '2',
    note: 'AUTHOR-INVENTED basic GSD combined with Ciroth et al. (2012) Table 7 rounded completeness GSD factors (scores 2 and 4) under independent lognormal components; other four pedigree indicators fixed at score 1 (GSD = 1).',
  },
  interpretation: {
    authorInventedExtension: true,
    modifiesWallV1: false,
    empiricalPaintValidation: false,
    scientificApproval: false,
    fullSixteenCategoryEfScore: false,
    realSupplierOrWatershedData: false,
    realMarketPrices: false,
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
export const wallExtensionInputShape = freeze(shapeOf(reviewed));
freeze(reviewed);

export function validateWallExtensionCase(spec) {
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

export function validateWallExtensionParentLink(spec, wall, canonicalWallSha256) {
  const errors = validateWallExtensionCase(spec);
  if (errors.length) return errors;
  const p = spec.wallParent;
  if (wall?.caseId !== p.caseId || wall?.version !== p.version || canonicalWallSha256 !== p.inputSha256)
    errors.push('wallParent: registered wall identity or canonical public input hash differs');
  if (wall?.service?.area !== p.areaM2 || wall?.service?.intervalYears !== p.intervalYears
      || wall?.service?.paintA?.requiredKg !== p.paintAKg || wall?.service?.paintB?.requiredKg !== p.paintBKg
      || wall?.comparison?.tolerance !== p.toleranceKgCO2eq
      || wall?.characterization?.factorVector?.[0] !== p.baseGwp100CO2
      || wall?.characterization?.factorVector?.[1] !== p.baseGwp100FossilCH4
      || wall?.technosphere?.matrix?.[3]?.[0] !== '-2'
      || wall?.technosphere?.matrix?.[3]?.[1] !== '-5'
      || wall?.technosphere?.matrix?.[3]?.[2] !== '-0.2')
    errors.push('wallParent: registered CASE-WALL-CONNECT v1 service, matrix, GWP100 or tolerance differs');
  return errors;
}

export function validateWallExtensionFacts(spec, published) {
  const errors = validateWallExtensionCase(spec);
  if (errors.length) return errors;
  const sources = new Map();
  for (const s of published?.sources ?? []) {
    if (sources.has(s.id)) errors.push(`wallExtension.facts: duplicate public source ${s.id}`);
    sources.set(s.id, s);
  }
  const evidenceById = new Map();
  for (const e of published?.evidence ?? []) {
    if (evidenceById.has(e.id)) errors.push(`wallExtension.facts: duplicate public evidence ${e.id}`);
    evidenceById.set(e.id, e);
  }
  for (const [key, input] of Object.entries(spec.facts)) {
    const source = sources.get(input.sourceId);
    if (!source || !['public-html-inspected', 'public-passages-inspected', 'public-full-text-inspected', 'licensed-full-text-inspected'].includes(source.accessStatus)) {
      errors.push(`wallExtension.facts.${key}: source ${input.sourceId} is missing or uninspected`);
    }
    const evidence = evidenceById.get(input.evidenceId);
    const facts = Array.isArray(evidence?.numericFacts) ? evidence.numericFacts : [];
    const matches = facts.filter(f => f?.id === input.factId);
    if (!evidence || evidence.sourceId !== input.sourceId || matches.length !== 1
        || new Set(facts.map(f => f?.id)).size !== facts.length
        || matches[0].value !== input.value || matches[0].unit !== input.unit || matches[0].subject !== input.subject) {
      errors.push(`wallExtension.facts.${key}: missing or mismatched public source numericFact value/unit/subject`);
    }
  }
  return errors;
}

// Exact BigInt rational arithmetic for Modules 1-5
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
const q = (n, d = 1n) => {
  if (!d) throw new TypeError('zero denominator');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d); return [n / g, d / g];
};
const decimal = value => {
  if (!/^-?\d+(\.\d+)?$/.test(value)) throw new TypeError(`expected finite decimal string, got ${value}`);
  const neg = value.startsWith('-');
  const [whole, fraction = ''] = (neg ? value.slice(1) : value).split('.');
  return q(BigInt(whole + fraction) * (neg ? -1n : 1n), 10n ** BigInt(fraction.length));
};
const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const sub = (a, b) => add(a, [-b[0], b[1]]);
const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => q(a[0] * b[1], a[1] * b[0]);
const pow = (a, n) => {
  let out = q(1n);
  for (let i = 0; i < n; i++) out = mul(out, a);
  return out;
};
const abs = a => a[0] < 0n ? [-a[0], a[1]] : a;
const cmp = (a, b) => { const n = a[0] * b[1] - b[0] * a[1]; return n < 0n ? -1 : n > 0n ? 1 : 0; };

function fixed(a, places) {
  const scale = 10n ** BigInt(places), mag = a[0] < 0n ? -a[0] : a[0];
  let n = mag * scale / a[1];
  if ((mag * scale % a[1]) * 2n >= a[1]) n++;
  const sign = a[0] < 0n && n ? '-' : '', digits = String(n).padStart(places + 1, '0');
  return places ? `${sign}${digits.slice(0, -places)}.${digits.slice(-places)}` : `${sign}${digits}`;
}
function result(a) {
  let d = a[1], twos = 0, fives = 0;
  while (d % 2n === 0n) { d /= 2n; twos++; }
  while (d % 5n === 0n) { d /= 5n; fives++; }
  const terminating = d === 1n, places = Math.max(twos, fives);
  const exact = terminating ? (places ? fixed(a, places).replace(/0+$/, '').replace(/\.$/, '') : String(a[0])) : `${a[0]}/${a[1]}`;
  return { exact, fixed2: fixed(a, 2), fixed3: fixed(a, 3), fixed4: fixed(a, 4), fixed6: fixed(a, 6) };
}

export function evaluateWallExtensionCase(spec) {
  const errors = validateWallExtensionCase(spec);
  if (errors.length) throw new TypeError(`Invalid wall-extension case:\n${errors.join('\n')}`);

  const p = spec.wallParent;
  const area = decimal(p.areaM2), mA = decimal(p.paintAKg), mB = decimal(p.paintBKg);
  const eA = decimal(p.paintAElectricityKWh), eBS0 = decimal(p.paintBSmoothElectricityKWh), eBS1 = decimal(p.paintBRoughElectricityKWh);
  const tol = decimal(p.toleranceKgCO2eq);

  // Module 1: Average vs. Marginal Electricity Supply
  const g = spec.electricityGrid;
  const baseA = decimal(g.basePaintANonThetaKgCO2eq);
  const baseBS0 = decimal(g.basePaintBSmoothNonThetaKgCO2eq);
  const baseBS1 = decimal(g.basePaintBRoughNonThetaKgCO2eq);
  const evalGrid = thetaStr => {
    const t = decimal(thetaStr);
    const iA = add(baseA, mul(eA, t));
    const iBS0 = add(baseBS0, mul(eBS0, t));
    const iBS1 = add(baseBS1, mul(eBS1, t));
    const dS0 = sub(iBS0, iA);
    const dS1 = sub(iBS1, iA);
    return {
      theta: thetaStr,
      paintAKgCO2eq: result(iA),
      smoothPaintBKgCO2eq: result(iBS0),
      smoothDeltaBMinusAKgCO2eq: result(dS0),
      smoothWithinTolerance: cmp(abs(dS0), tol) <= 0,
      smoothLower: cmp(dS0, q(0n)) < 0 ? 'paintB' : cmp(dS0, q(0n)) > 0 ? 'paintA' : 'tie',
      roughPaintBKgCO2eq: result(iBS1),
      roughDeltaBMinusAKgCO2eq: result(dS1),
      roughWithinTolerance: cmp(abs(dS1), tol) <= 0,
      roughLower: cmp(dS1, q(0n)) < 0 ? 'paintB' : cmp(dS1, q(0n)) > 0 ? 'paintA' : 'tie',
    };
  };
  const electricityGrid = {
    average: evalGrid(g.averageTheta),
    fossilMarginal: evalGrid(g.fossilMarginalTheta),
    cleanMarginal: evalGrid(g.cleanMarginalTheta),
    smoothCrossoverTheta: result(div(sub(baseA, baseBS0), sub(eBS0, eA))),
    roughPrepClimateSwingAtAverageKgCO2eq: result(sub(add(baseBS1, mul(eBS1, decimal(g.averageTheta))), add(baseBS0, mul(eBS0, decimal(g.averageTheta))))),
    cleanToFossilSmoothDeltaSwingKgCO2eq: result(mul(sub(eBS0, eA), sub(decimal(g.fossilMarginalTheta), decimal(g.cleanMarginalTheta)))),
  };

  // Module 2: NMVOC Photochemical Ozone Formation & Indoor/Outdoor Compartment Gap
  const pof = spec.photochemicalOzone;
  const cfOut = decimal(spec.facts.ef31PofNmvocOutdoor.value);
  const cfIn = decimal(spec.facts.ef31PofVocIndoor.value);
  const nmvocA = mul(mA, decimal(pof.paintAKgPerKg));
  const nmvocBS0 = mul(mB, decimal(pof.paintBKgPerKg));
  const nmvocPrep = mul(area, decimal(pof.prepKgPerM2));
  const nmvocBS1 = add(nmvocBS0, nmvocPrep);
  const pofOutA = mul(nmvocA, cfOut), pofOutBS0 = mul(nmvocBS0, cfOut), pofOutBS1 = mul(nmvocBS1, cfOut);
  const pofInA = mul(nmvocA, cfIn), pofInBS0 = mul(nmvocBS0, cfIn), pofInBS1 = mul(nmvocBS1, cfIn);
  const photochemicalOzone = {
    inventoryKgNmvoc: {
      paintA: result(nmvocA),
      paintBSmooth: result(nmvocBS0),
      prepOnly: result(nmvocPrep),
      paintBRough: result(nmvocBS1),
    },
    outdoorEf31KgNmvocEq: {
      paintA: result(pofOutA),
      paintBSmooth: result(pofOutBS0),
      smoothDeltaBMinusA: result(sub(pofOutBS0, pofOutA)),
      smoothRatioBToA: result(div(pofOutBS0, pofOutA)),
      paintBRough: result(pofOutBS1),
      roughDeltaBMinusA: result(sub(pofOutBS1, pofOutA)),
      roughRatioBToA: result(div(pofOutBS1, pofOutA)),
    },
    indoorEf31KgNmvocEq: {
      paintA: result(pofInA),
      paintBSmooth: result(pofInBS0),
      paintBRough: result(pofInBS1),
      omittedCompartmentErasesSignal: cmp(pofInBS0, q(0n)) === 0 && cmp(pofInBS1, q(0n)) === 0,
    },
  };

  // Module 3: Blue-Water Consumption & AWARE-Style Regional Scarcity
  const w = spec.waterScarcity;
  const watA = mul(mA, decimal(w.paintAM3PerKg));
  const watBS0 = mul(mB, decimal(w.paintBM3PerKg));
  const watPrep = mul(area, decimal(w.prepM3PerM2));
  const watBS1 = add(watBS0, watPrep);
  const cfHumid = decimal(w.humidMultiplier), cfArid = decimal(w.aridMultiplier);
  const wHumidA = mul(watA, cfHumid), wHumidBS0 = mul(watBS0, cfHumid), wHumidBS1 = mul(watBS1, cfHumid);
  const wAridA = mul(watA, cfArid);
  const waterScarcity = {
    consumptionM3: {
      paintA: result(watA),
      paintBSmooth: result(watBS0),
      prepOnly: result(watPrep),
      paintBRough: result(watBS1),
      smoothRatioAToB: result(div(watA, watBS0)),
      roughRatioAToB: result(div(watA, watBS1)),
    },
    uniformHumidM3WorldEq: {
      paintA: result(wHumidA),
      paintBSmooth: result(wHumidBS0),
      smoothDeltaBMinusA: result(sub(wHumidBS0, wHumidA)),
      paintBRough: result(wHumidBS1),
      roughDeltaBMinusA: result(sub(wHumidBS1, wHumidA)),
    },
    paintAAridPaintBHumidM3WorldEq: {
      paintA: result(wAridA),
      paintBSmooth: result(wHumidBS0),
      smoothDeltaBMinusA: result(sub(wHumidBS0, wAridA)),
      smoothRatioAToB: result(div(wAridA, wHumidBS0)),
      paintAFactorJump: result(div(wAridA, wHumidA)),
      paintBRough: result(wHumidBS1),
      roughRatioAToB: result(div(wAridA, wHumidBS1)),
    },
  };

  // Module 4: Two-Category Partial EF 3.1 Normalization & Weighting (CC + POF)
  const nw = spec.normalizationWeighting;
  const nfCc = decimal(spec.facts.ef31NfClimate.value);
  const nfPof = decimal(spec.facts.ef31NfPof.value);
  const wfCc = decimal(spec.facts.ef31WfClimate.value);
  const wfPof = decimal(spec.facts.ef31WfPof.value);
  const mPt = decimal(nw.milliPointScale);
  const evalPartialNw = thetaStr => {
    const t = decimal(thetaStr);
    const ccA = add(baseA, mul(eA, t)), ccB = add(baseBS0, mul(eBS0, t));
    const normCcA = div(ccA, nfCc), normCcB = div(ccB, nfCc);
    const normPofA = div(pofOutA, nfPof), normPofB = div(pofOutBS0, nfPof);
    const wCcA = mul(mul(normCcA, wfCc), mPt), wCcB = mul(mul(normCcB, wfCc), mPt);
    const wPofA = mul(mul(normPofA, wfPof), mPt), wPofB = mul(mul(normPofB, wfPof), mPt);
    const totOutA = add(wCcA, wPofA), totOutB = add(wCcB, wPofB);
    return {
      theta: thetaStr,
      climateKgCO2eq: { paintA: result(ccA), paintB: result(ccB), deltaBMinusA: result(sub(ccB, ccA)) },
      normalizedPersonEq: {
        paintAClimate: result(normCcA), paintBClimate: result(normCcB),
        paintAPofOutdoor: result(normPofA), paintBPofOutdoor: result(normPofB),
      },
      weightedMilliPtOutdoor: {
        paintAClimate: result(wCcA), paintBClimate: result(wCcB),
        paintAPof: result(wPofA), paintBPof: result(wPofB),
        paintATotal: result(totOutA), paintBTotal: result(totOutB),
        deltaBMinusA: result(sub(totOutB, totOutA)),
        ratioBToA: result(div(totOutB, totOutA)),
        lowerWithOutdoorPof: cmp(totOutB, totOutA) > 0 ? 'paintA' : cmp(totOutB, totOutA) < 0 ? 'paintB' : 'tie',
      },
      weightedMilliPtIndoorOmitted: {
        paintATotal: result(wCcA), paintBTotal: result(wCcB),
        deltaBMinusA: result(sub(wCcB, wCcA)),
        lowerWhenIndoorPofOmitted: cmp(wCcB, wCcA) < 0 ? 'paintB' : cmp(wCcB, wCcA) > 0 ? 'paintA' : 'tie',
      },
    };
  };
  const normalizationWeighting = {
    cleanGridSmooth: evalPartialNw(nw.referenceThetaClean),
    displayGridSmooth: evalPartialNw(nw.referenceThetaDisplay),
  };

  // Module 5: Financial Life Cycle Costing (LCC) & 5% Discounting
  const lcc = spec.lifeCycleCosting;
  const priceA = decimal(lcc.paintACUPerKg), priceB = decimal(lcc.paintBCUPerKg);
  const labor = decimal(lcc.applicationLaborCUPerTreatment);
  const prepCost = mul(area, decimal(lcc.prepCUPerM2));
  const paintAFirst = add(mul(div(mA, q(2n)), priceA), labor);
  const paintARepaint = add(mul(div(mA, q(2n)), priceA), labor);
  const paintBS0Cost = add(mul(mB, priceB), labor);
  const paintBS1Cost = add(paintBS0Cost, prepCost);
  const discFactor = div(q(1n), pow(add(q(1n), decimal(lcc.discountRateAnnual)), Number(lcc.repaintYear)));
  const paintAUndisc = add(paintAFirst, paintARepaint);
  const paintADisc = add(paintAFirst, mul(paintARepaint, discFactor));
  const lifeCycleCosting = {
    paintAMaterialTotalCU: result(mul(mA, priceA)),
    paintBMaterialTotalCU: result(mul(mB, priceB)),
    paintAPerTreatmentCU: result(paintAFirst),
    prepTotalCU: result(prepCost),
    discountFactorYear5At5Pct: result(discFactor),
    undiscounted: {
      paintACU: result(paintAUndisc),
      paintBSmoothCU: result(paintBS0Cost),
      smoothDeltaBMinusACU: result(sub(paintBS0Cost, paintAUndisc)),
      smoothPaintBSavingsCU: result(sub(paintAUndisc, paintBS0Cost)),
      paintBRoughCU: result(paintBS1Cost),
      roughDeltaBMinusACU: result(sub(paintBS1Cost, paintAUndisc)),
    },
    discounted5Pct: {
      paintACU: result(paintADisc),
      paintARepaintPvCU: result(mul(paintARepaint, discFactor)),
      paintBSmoothCU: result(paintBS0Cost),
      smoothDeltaBMinusACU: result(sub(paintBS0Cost, paintADisc)),
      smoothPaintBSavingsCU: result(sub(paintADisc, paintBS0Cost)),
      paintBRoughCU: result(paintBS1Cost),
      roughDeltaBMinusACU: result(sub(paintBS1Cost, paintADisc)),
    },
  };

  // Module 6: Pedigree-Matrix Completeness Variance on Paint B Non-Electric CO2
  const ped = spec.pedigreeUncertainty;
  const median = Number(ped.medianKgCO2);
  const gBasic = Number(ped.basicGsd);
  const halfWidth = Number(ped.logIntervalHalfWidthSd);
  const evalPedigree = gAddStr => {
    const gAdd = Number(gAddStr);
    const sigmaTotal = Math.hypot(Math.log(gBasic), Math.log(gAdd));
    const gsdTotal = Math.exp(sigmaTotal);
    const factor95 = Math.exp(halfWidth * sigmaTotal);
    const low95 = median / factor95;
    const high95 = median * factor95;
    const width95 = high95 - low95;
    return {
      _width95: width95,
      public: {
        completenessGsd: gAddStr,
        sigmaLnTotal: sigmaTotal.toFixed(6),
        gsdTotal: gsdTotal.toFixed(4),
        gsdSquared95Factor: factor95.toFixed(4),
        low95KgCO2: low95.toFixed(2),
        high95KgCO2: high95.toFixed(2),
        width95KgCO2: width95.toFixed(2),
      },
    };
  };
  const score2 = evalPedigree(spec.facts[ped.scoreLowKey].value);
  const score4 = evalPedigree(spec.facts[ped.scoreHighKey].value);
  const widthDelta = score4._width95 - score2._width95;
  const widthPct = (widthDelta / score2._width95) * 100;
  const pedigreeUncertainty = {
    medianKgCO2: ped.medianKgCO2,
    basicGsd: ped.basicGsd,
    score2: score2.public,
    score4: score4.public,
    widthIncreaseKgCO2: widthDelta.toFixed(2),
    widthIncreasePct: widthPct.toFixed(1),
  };

  return {
    caseId: spec.caseId,
    version: spec.version,
    model: spec.model,
    electricityGrid,
    photochemicalOzone,
    waterScarcity,
    normalizationWeighting,
    lifeCycleCosting,
    pedigreeUncertainty,
    interpretation: { ...spec.interpretation },
  };
}
