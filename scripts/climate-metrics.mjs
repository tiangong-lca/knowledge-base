import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { add, decimal, divide, fixed, multiply, rational, result, subtract } from './exact-rational.mjs';
import { evaluateTeachingCase } from './teaching-case.mjs';

const fields = (...names) => Object.fromEntries(names.map(name => [name, null]));
const keyed = (names, shape) => Object.fromEntries(names.map(name => [name, shape]));
const list = [null];
const sourceIds = [
  'src-kb54-joos2013', 'src-kb54-ipcc-ar6-ch7-pdf', 'src-kb54-ipcc-ar6-errata-2025-10-07-pdf',
  'src-kb54-ipcc-ar6-ch7-sm-pdf', 'src-kb54-cain-2019-gwp-star',
];
const factKeys = [
  'a0', 'a1', 'a2', 'a3', 'tau1', 'tau2', 'tau3', 'joosIntegral20', 'joosIntegral100', 'joosIntegral500',
  'joosRadiativeEfficiency', 'joosAgwp100', 'oldFossilGwp20', 'oldFossilGwp100', 'newFossilGwp20',
  'newFossilGwp100', 'newFossilGtp100', 'newNonfossilGwp100', 'referenceOne', 'newFossilGwp100Width',
  'oldSmCh4Gwp100', 'newSmCh4Gwp100', 'oldSmCo2Agwp100', 'newSmCo2Agwp100', 'newSmCh4Agwp100',
  'rateR', 'rateS', 'rateGwp100', 'rateHorizon', 'rateLookback',
];
const numericFields = ['value', 'unit', 'quantity', 'subject', 'basis'];
const nativeResponseShape = fields('rf', 'agwp', 'agtp');
const nativeRatioShape = fields('direct', 'carbonCycleFeedbackIncrement', 'total');
const roundedHistoricalShape = fields('abs_tol', 'expected');
const nativeSummaryShape = {
  ...fields('kind', 'recordedAt'),
  engine: {
    ...fields('name', 'sourceCommit', 'sourceVersion', 'pythonVersion', 'pythonExecutableSha256', 'numpyVersion',
      'scipyVersion', 'fairVersion', 'fairWheelSha256', 'operatingSystem', 'architecture'),
    notebookZeroBasedCells: list, authorFunctions: list, pythonFlags: list,
  },
  ...fields('sourceArtifactId', 'sourceReadingId'),
  loadedAuthorFiles: [fields('repoRelativeFile', 'sha256')],
  generatorNotebookSha256: null,
  frozenInputs: {
    ...fields('frozenAtUtc', 'specificationSha256', 'canonicalParametersSha256', 'privateLauncherSha256',
      'privateReferenceGeneratorSha256'),
    parameters: {
      ...fields('atmosphere_mass_kg', 'ch4_lifetime_yr', 'ch4_ozone_w_m2_ppb', 'ch4_rapid_adjustment',
        'ch4_water_w_m2_ppb', 'co2_rapid_adjustment', 'feedback_gamma_kg_c_per_yr_per_k'),
      baseline: fields('ch4_ppb', 'co2_ppm', 'n2o_ppb'),
      co2_airborne_fractions: list, co2_taus_yr_author_permanent_sentinel_zero: list, d_yr: list,
      feedback_times_yr: list, feedback_weights: list, q_k_per_w_m2: list,
      molar_masses_kg_per_mol: fields('air', 'c', 'ch4', 'co2'),
    },
    checkTolerances: fields('exact_grid_absolute_yr', 'nonzero_relative', 'zero_absolute'),
    comparison: null,
  },
  units: fields('horizon', 'rf', 'agwp', 'agtp', 'iagtp', 'gwp', 'gtp',
    'feedbackRelativeDifferencePercent', 'pulseMassBasis'),
  observations: [{
    ...fields('id', 'startedAtUtc', 'finishedAtUtc', 'outputCsvSha256', 'receiptSha256', 'stdoutSha256',
      'expectedComparisons', 'passedComparisons'),
    timeAxis: fields('startYr', 'endYr', 'stepYr', 'pointCount', 'encoding', 'sha256'),
    observations: [{
      horizonYr: null, ch4DirectResponse: { ...nativeResponseShape, iagtp: null },
      ch4FeedbackIncrement: nativeResponseShape, gwp: nativeRatioShape, gtp: nativeRatioShape,
      co2Response: nativeResponseShape,
    }],
  }],
  zeroTimeControl: fields('horizonYr', 'co2Rf', 'ch4Rf', 'integratedForcingAndTemperatureOutputsExactlyZero',
    'feedbackOutputsExactlyZero', 'gwp', 'gtp', 'ratioInterpretation'),
  sourceGridHistoricalRoundedReference: {
    20: { gwp: roundedHistoricalShape }, 50: { gtp: roundedHistoricalShape },
    100: { gtp: roundedHistoricalShape, gwp: roundedHistoricalShape },
  },
  gridSensitivity: {
    differenceDirection: null,
    differences: [{
      ...fields('horizonYr', 'directResponsesIdentical', 'gwpDifference', 'gtpDifference'),
      feedbackAbsoluteDifference: nativeResponseShape, feedbackRelativeDifferencePercent: nativeResponseShape,
    }],
    basis: null,
  },
  boundaries: list,
};

export const climateMetricsInputShape = {
  ...fields('caseId', 'version', 'model', 'createdAt', 'status'),
  sources: keyed(sourceIds, fields('sourceId', 'workId', 'readingId', 'artifactId', 'sha256', 'pageCount')),
  facts: keyed(factKeys, fields('source', 'evidenceId', 'passageId', 'factId', 'pdfIndex', ...numericFields)),
  responseReconstruction: {
    ...fields('kind', 'coefficientsTreatedAsDisplayed', 'originalEnsembleReexecuted',
      'radiativeEfficiencyPrecisionRecovered'),
    horizonsYears: list, fitWindowYears: list,
  },
  fixedPulsePair: fields('kind', 'timeYears', 'co2Kg', 'fossilCh4Kg', 'co2Reference',
    'samePhysicalServiceEstablished', 'purpose'),
  wallParent: {
    ...fields('caseId', 'version', 'inputFile', 'inputSha256', 'scenario', 'theta', 'areaM2', 'serviceYears'),
    gasRows: list, paintAInventoryKg: list, paintBInventoryKg: list,
    ...fields('sameHypotheticalService', 'originalPublishedCaseChanged', 'characterizationPurpose'),
  },
  timingExample: {
    ...fields('kind', 'massKg', 'earlyEmissionYear', 'lateEmissionYear', 'calendarEndpointYear',
      'fixedPostPulseWindowYears', 'gas', 'responseRun'),
    nativeElapsedHorizonsYears: list,
    ...fields('allOtherEmissionsExcluded', 'negativeEmissionOrStorageCredit', 'purpose'),
  },
  rateExample: {
    ...fields('kind', 'gas', 'rateUnit', 'outputRateUnit', 'outputCumulativeUnit'),
    historicalYears: list, futureYears: list, historicalRates: fields('A', 'B', 'C'), futureRateEach: null,
    checkYears: list, sumIntervals: [list],
    ...fields('boundaryUnchanged', 'missingHistoryAssumedZero', 'temperatureOrOffsetAuthorization', 'formulaVersion', 'purpose'),
  },
  native: { summary: nativeSummaryShape, summarySha256: null },
  scope: fields('allSourceOriginalsPublished', 'climateEmpiricallyValidated', 'humanExpertApproval',
    'factorUncertaintyPropagated', 'correctedAr6GeneratorReproduced', 'historicalSelectedNativeFunctionsExecuted',
    'nativeReexecutedByStaticBuild', 'fossilOxidationGeneratorExecuted', 'historicalFullNotebookExecuted',
    'newProductOrSectorFootprint', 'finiteDifferenceSignIsGlobalCooling'),
};

// Independent of the claim manifest and of whitespace and object key order.
// The numeric joins below still require the actual reviewed catalog and reading register.
const reviewedV1Digest = 'd522844ff393f7c0c23235380647dd7b97668f5295ec8ed37acb6fe10afcaccc';
function sortedKeys(_key, value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]))
    : value;
}

const sortedDigest = value => createHash('sha256').update(JSON.stringify(value, sortedKeys), 'utf8').digest('hex');
export function validateClimateMetricsCase(spec) {
  const error = ['climate metrics: exact reviewed climate-metrics v1 input and native summary required'];
  try {
    return sortedDigest(spec) === reviewedV1Digest && sortedDigest(spec.native.summary) === spec.native.summarySha256
      ? [] : error;
  }
  catch { return error; }
}

const zero = rational(0n);
const sum = values => values.reduce(add, zero);
const exactDisplay = value => ({ ...result(value), fixed3: fixed(value, 3) });
const fixedDisplay = value => ({ value, fixed3: value.toFixed(3), fixed6: value.toFixed(6) });
const superscript = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
function scientificDisplay(value, unit) {
  const scientific3 = value.toExponential(3);
  const [coefficient, exponent] = scientific3.split('e');
  const scientificText3 = `${coefficient}×10${Array.from(String(Number(exponent)), digit => superscript[digit]).join('')}`;
  return { value, unit, scientific3, scientificText3, scientific6: value.toExponential(6) };
}
const exactTuple = (...values) => values.map(decimal);
const annualYears = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

function reconstructResponse(spec) {
  const value = name => Number(spec.facts[name].value);
  const coefficients = [1, 2, 3].map(index => [value(`a${index}`), value(`tau${index}`)]);
  const a0 = value('a0');
  const response = horizon => a0 + coefficients.reduce((total, [a, tau]) => total + a * Math.exp(-horizon / tau), 0);
  const integral = horizon => a0 * horizon
    + coefficients.reduce((total, [a, tau]) => total - a * tau * Math.expm1(-horizon / tau), 0);
  const points = Object.fromEntries(spec.responseReconstruction.horizonsYears.map(printed => {
    const horizonYears = Number(printed), reportedIntegralYears = spec.facts[`joosIntegral${printed}`].value;
    const integratedYears = integral(horizonYears);
    const roundingHalfUnit = Number(halfLastDigit(reportedIntegralYears).value);
    return [`h${printed}`, {
      horizonYears, remainingFraction: fixedDisplay(response(horizonYears)), integratedYears: fixedDisplay(integratedYears),
      reportedIntegralYears, roundingHalfUnit, roundsToReportedIntegral: Math.abs(integratedYears - Number(reportedIntegralYears)) <= roundingHalfUnit,
    }];
  }));
  // The reported AGWP uses a 10^-15 scale. The source efficiency is printed,
  // so the calculation cannot recover the precision behind the source value.
  const reconstructed = points.h100.integratedYears.value * value('joosRadiativeEfficiency') * 1e15;
  const reported = spec.facts.joosAgwp100.value;
  return {
    ...points,
    initialRemainingFraction: fixedDisplay(response(0)),
    agwp100: {
      reconstructed: fixedDisplay(reconstructed), reported, delta: fixedDisplay(reconstructed - Number(reported)),
      unit: spec.facts.joosAgwp100.unit, originalEnsembleReexecuted: false,
    },
  };
}

const factorSets = {
  oldGwp100: { factor: 'oldFossilGwp100', metric: 'GWP', horizonYears: 100, edition: 'AR6 as published', unit: 'kg CO2-e' },
  newGwp100: { factor: 'newFossilGwp100', metric: 'GWP', horizonYears: 100, edition: 'AR6 errata 7 October 2025', unit: 'kg CO2-e' },
  newGwp20: { factor: 'newFossilGwp20', metric: 'GWP', horizonYears: 20, edition: 'AR6 errata 7 October 2025', unit: 'kg CO2-e' },
  newGtp100: { factor: 'newFossilGtp100', metric: 'GTP', horizonYears: 100, edition: 'AR6 errata 7 October 2025', unit: 'kg CO2-e (GTP basis)' },
};

function comparePulseAndWall(spec, facts) {
  const pulsePair = {}, wall = {};
  const co2Mass = decimal(spec.fixedPulsePair.co2Kg), ch4Mass = decimal(spec.fixedPulsePair.fossilCh4Kg);
  const wallA = exactTuple(...spec.wallParent.paintAInventoryKg), wallB = exactTuple(...spec.wallParent.paintBInventoryKg);
  for (const [key, { factor, ...metadata }] of Object.entries(factorSets)) {
    const reference = facts.referenceOne;
    const methaneFactor = facts[factor];
    const characterization = {
      ...metadata, co2Factor: spec.facts.referenceOne.value, fossilCh4Factor: spec.facts[factor].value,
    };
    const co2 = multiply(co2Mass, reference), fossilCh4 = multiply(ch4Mass, methaneFactor);
    const characterizeWall = ([carbonDioxide, methane]) =>
      add(multiply(carbonDioxide, reference), multiply(methane, methaneFactor));
    const paintA = characterizeWall(wallA), paintB = characterizeWall(wallB);
    pulsePair[key] = {
      ...characterization, co2: exactDisplay(co2), fossilCh4: exactDisplay(fossilCh4),
      delta: exactDisplay(subtract(fossilCh4, co2)), deltaDirection: 'fossil CH4 minus CO2',
    };
    wall[key] = {
      ...characterization, paintA: exactDisplay(paintA), paintB: exactDisplay(paintB),
      delta: exactDisplay(subtract(paintB, paintA)), deltaDirection: 'Paint B minus Paint A',
    };
  }
  return { pulsePair, wall };
}

function halfLastDigit(printed) {
  const digits = (printed.split('.')[1] ?? '').length;
  return { exact: rational(1n, 2n * 10n ** BigInt(digits)), value: 0.5 * 10 ** -digits };
}

function correctedSmQuotient(spec, facts) {
  const bounds = key => {
    const half = halfLastDigit(spec.facts[key].value).exact;
    return [subtract(facts[key], half), add(facts[key], half)];
  };
  const [numeratorLow, numeratorHigh] = bounds('newSmCh4Agwp100');
  const [denominatorLow, denominatorHigh] = bounds('newSmCo2Agwp100');
  const quotientLow = divide(numeratorLow, denominatorHigh), quotientHigh = divide(numeratorHigh, denominatorLow);
  const [reportedLow, reportedHigh] = bounds('newSmCh4Gwp100');
  const quotient = divide(facts.newSmCh4Agwp100, facts.newSmCo2Agwp100);
  return {
    quotient: exactDisplay(quotient), reported: spec.facts.newSmCh4Gwp100.value,
    numerator: spec.facts.newSmCh4Agwp100.value, denominator: spec.facts.newSmCo2Agwp100.value,
    absoluteMetricUnit: spec.facts.newSmCh4Agwp100.unit, unit: '1',
    subject: spec.facts.newSmCh4Gwp100.subject,
    differenceFromReported: exactDisplay(subtract(quotient, facts.newSmCh4Gwp100)),
    quotientRoundingInterval: [quotientLow, quotientHigh].map(exactDisplay),
    reportedRoundingInterval: [reportedLow, reportedHigh].map(exactDisplay),
    roundingIntervalsOverlap: subtract(quotientHigh, reportedLow)[0] >= 0n && subtract(reportedHigh, quotientLow)[0] >= 0n,
    roundingIntervalIsPhysicalUncertainty: false,
  };
}

function nativeRun(summary, id) {
  const run = summary.observations.find(candidate => candidate.id === id);
  if (!run) throw new TypeError(`climate metrics: native run ${id} missing`);
  return run;
}

function nativeAt(run, years) {
  const observation = run.observations.find(candidate => candidate.horizonYr === years);
  if (!observation) throw new TypeError(`climate metrics: native horizon ${years} missing`);
  return observation;
}

function timingExample(spec) {
  const input = spec.timingExample, summary = spec.native.summary;
  const run = nativeRun(summary, input.responseRun);
  const massKg = Number(input.massKg);
  const metric = (raw, unit) => ({ ...scientificDisplay(Number(raw) * massKg, unit), responsePerKg: raw });
  function pulse(emissionYear, endpointYear) {
    const elapsedYears = endpointYear - emissionYear;
    const { rf, agwp, agtp } = nativeAt(run, elapsedYears).co2Response;
    return {
      emissionYear, endpointYear, elapsedYears,
      rf: metric(rf, 'W m^-2'), agwp: metric(agwp, 'W m^-2 yr'), agtp: metric(agtp, 'K'),
      agwpScaled1e15: fixedDisplay(Number(agwp) * massKg * 1e15),
      agtpScaled1e16: fixedDisplay(Number(agtp) * massKg * 1e16),
    };
  }
  const early = Number(input.earlyEmissionYear), late = Number(input.lateEmissionYear);
  const endpoint = Number(input.calendarEndpointYear), window = Number(input.fixedPostPulseWindowYears);
  return {
    massKg: input.massKg, responseRun: input.responseRun, nativeReceiptSha256: run.receiptSha256,
    commonEndpoint: { early: pulse(early, endpoint), late: pulse(late, endpoint) },
    fixedPostPulseWindow: { early: pulse(early, early + window), late: pulse(late, late + window) },
    negativeEmissionOrStorageCredit: false,
  };
}

function annualRates(spec, facts) {
  const input = spec.rateExample;
  const [historyStart, historyEnd] = input.historicalYears.map(Number);
  const [futureStart, futureEnd] = input.futureYears.map(Number);
  const years = annualYears(futureStart, futureEnd), previousYears = annualYears(historyStart, historyEnd);
  const historical = Object.fromEntries(Object.entries(input.historicalRates).map(([id, value]) => [id, decimal(value)]));
  historical.aggregate = sum(Object.values(historical));
  const common = decimal(input.futureRateEach);
  const lookback = Number(spec.facts.rateLookback.value);
  const windowMultiplier = multiply(facts.rateR, divide(facts.rateHorizon, facts.rateLookback));
  const oneYear = rational(1n); // one annual mean-rate bin, integrated for one year

  function record(oldRate, futureRate) {
    const history = new Map([...previousYears.map(year => [year, oldRate]), ...years.map(year => [year, futureRate])]);
    const evaluated = new Map(years.map(year => {
      const current = history.get(year), past = history.get(year - lookback);
      if (!current || !past) throw new TypeError(`climate metrics: missing methane rate history for ${year}`);
      const rateChange = multiply(windowMultiplier, subtract(current, past));
      const slowTerm = multiply(facts.rateS, current);
      return [year, {
        lookbackYear: year - lookback, current, past,
        conventional: multiply(facts.rateGwp100, current),
        revised: multiply(facts.rateGwp100, add(rateChange, slowTerm)),
      }];
    }));
    const checkpoints = Object.fromEntries(input.checkYears.map(check => {
      const point = evaluated.get(Number(check));
      return [`y${check}`, {
        year: Number(check), lookbackYear: point.lookbackYear,
        current: exactDisplay(point.current), past: exactDisplay(point.past),
        conventional: exactDisplay(point.conventional), revised: exactDisplay(point.revised),
        rateUnit: input.outputRateUnit, conventionalUnit: 't CO2-e yr^-1', gasRateUnit: input.rateUnit,
      }];
    }));
    const intervals = Object.fromEntries(input.sumIntervals.map(interval => {
      const window = annualYears(...interval.map(Number));
      const count = window.length;
      const total = key => exactDisplay(sum(window.map(year => multiply(evaluated.get(year)[key], oneYear))));
      return [`sum${count}`, {
        startYear: window[0], endYear: window.at(-1), count,
        revised: total('revised'), conventional: total('conventional'),
        cumulativeUnit: input.outputCumulativeUnit, conventionalUnit: 't CO2-e',
      }];
    }));
    return { ...checkpoints, ...intervals };
  }

  return {
    A: record(historical.A, common), B: record(historical.B, common), C: record(historical.C, common),
    aggregate: record(historical.aggregate, multiply(common, rational(3n))),
    missingHistoryAssumedZero: false, formulaVersion: input.formulaVersion, lookbackYears: lookback,
  };
}

function nativeSelected(spec) {
  const summary = spec.native.summary;
  const historicalRun = nativeRun(summary, spec.timingExample.responseRun);
  const finerRun = nativeRun(summary, 'sensitivity-0.05-year-grid');
  const display = raw => ({ ...fixedDisplay(Number(raw)), storedValue: raw });
  const sensitivity = Object.fromEntries(summary.gridSensitivity.differences.map(point => {
    const historical = nativeAt(historicalRun, point.horizonYr), finer = nativeAt(finerRun, point.horizonYr);
    const historicalRoundedTargets = summary.sourceGridHistoricalRoundedReference[point.horizonYr];
    return [`h${point.horizonYr}`, {
      horizonYears: point.horizonYr, gwp: display(historical.gwp.total), gtp: display(historical.gtp.total),
      finerGwp: display(finer.gwp.total), finerGtp: display(finer.gtp.total),
      gwpDifference: display(point.gwpDifference), gtpDifference: display(point.gtpDifference),
      feedbackAgwpDifference: scientificDisplay(Number(point.feedbackAbsoluteDifference.agwp), summary.units.agwp),
      feedbackAgtpDifference: scientificDisplay(Number(point.feedbackAbsoluteDifference.agtp), summary.units.agtp),
      feedbackAgwpDifferencePercent: display(point.feedbackRelativeDifferencePercent.agwp),
      feedbackAgtpDifferencePercent: display(point.feedbackRelativeDifferencePercent.agtp),
      directResponsesIdentical: point.directResponsesIdentical,
      historicalRoundedTargets: Object.fromEntries(Object.entries(historicalRoundedTargets).map(([metric, target]) =>
        [metric, { expected: target.expected, absoluteTolerance: target.abs_tol,
          agrees: Math.abs(Number(historical[metric].total) - target.expected) <= target.abs_tol }])),
    }];
  }));
  return {
    ...sensitivity, metricUnit: '1',
    historicalStepYears: historicalRun.timeAxis.stepYr, finerStepYears: finerRun.timeAxis.stepYr,
    differenceDirection: summary.gridSensitivity.differenceDirection,
    historicalReceiptSha256: historicalRun.receiptSha256, finerReceiptSha256: finerRun.receiptSha256,
    nativeSummarySha256: spec.native.summarySha256,
    zeroTimeControl: {
      co2Rf: scientificDisplay(Number(summary.zeroTimeControl.co2Rf), summary.units.rf),
      ch4Rf: scientificDisplay(Number(summary.zeroTimeControl.ch4Rf), summary.units.rf),
      gwp: summary.zeroTimeControl.gwp, gtp: summary.zeroTimeControl.gtp,
    },
    oxidationAndUptakeIncluded: false, correctedGeneratorExecuted: false, nativeReexecutedByStaticBuild: false,
  };
}

export function evaluateClimateMetricsCase(spec) {
  const errors = validateClimateMetricsCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));
  const facts = Object.fromEntries(factKeys.map(key => [key, decimal(spec.facts[key].value)]));
  return {
    response: reconstructResponse(spec), ...comparePulseAndWall(spec, facts),
    correctedSmQuotient: correctedSmQuotient(spec, facts), timing: timingExample(spec),
    rate: annualRates(spec, facts), native: nativeSelected(spec), scope: { ...spec.scope },
  };
}

const records = value => Array.isArray(value) ? value : [];
function uniqueRecord(value, id) {
  const matches = records(value).filter(record => record?.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

// Bind the literal citation coordinates independently of both the mutable
// catalog and reading register so a coherent relocation still fails.
const reviewedPdfPassages = new Map([
  ['psg-kb54-joos-fit', 'Table5，IRFCO2行与表注，印刷p2803', '2803', 10],
  ['psg-kb54-joos-integrals', 'Table4及相关说明，印刷p2802', '2802', 9],
  ['psg-kb54-ipcc-ar6-table-7-15-published',
    '§7.6.1.5、Table 7.15 表头、说明和所选行，印刷页 1017（视觉核对）。', '1017', 94],
  ['psg-kb54-ipcc-ar6-errata-table-7-15',
    '印刷及 PDF 页 3，§7.6.1.1 辐射效率更正及主表 Table 7.15 完整替换的表头、说明和所选行（视觉核对）。', '3', 2],
  ['psg-kb54-ipcc-ar6-sm-table-7-sm-7-published',
    'Table 7.SM.7 首页面，表头、所选行和甲烷脚注 1，印刷及 PDF 页 16（视觉核对）。', '16', 15],
  ['psg-kb54-ipcc-ar6-errata-table-7-sm-7',
    '印刷及 PDF 页 5，Table 7.SM.7 替换首页面；旋转图像视觉核对 CO₂ 参考、甲烷等所选行和脚注。', '5', 4],
  ['psg-kb54-cain-2019-gwp-star-fit-methods', 'Methods → Method to derive r and s，表 1，印刷 p. 6', '6', 5],
].map(([id, locator, printedPages, index]) => [id, { locator, printedPages, index }]));

const reviewedPdfEditions = new Map([
  ['src-kb54-joos2013', 'ACP13,2793–2825；2013-03-08；CC BY3.0'],
  ['src-kb54-ipcc-ar6-ch7-pdf',
    'Forster et al. (2021)，AR6 WGI 正式 Chapter 7，印刷页 923–1054，正式 PDF 仍呈现 Table 7.15 更正前数据。'],
  ['src-kb54-ipcc-ar6-errata-2025-10-07-pdf',
    'Version 7 October 2025。第 2–5 页记载尚未并入出版件的相关更正；第 18、25 页区分已在出版前并入的 FGD 更正。'],
  ['src-kb54-ipcc-ar6-ch7-sm-pdf', 'Smith et al. (2021)，Chapter 7 Supplementary Material，含原表与原方程。2025 勘误单独定位。'],
  ['src-kb54-cain-2019-gwp-star', 'npj Climate and Atmospheric Science 2, 29，2019-09-04 刊行版'],
]);

const nativeSourceId = 'src-kb54-ipcc-ch7-code-snapshot';
const nativeWorkId = 'work-ipcc-ar6-wgi-ch7-author-code';
const nativeNotebook = 'notebooks/335_chapter7_generate_metrics.ipynb';
const nativeFilePins = new Map([
  ['src/ar6/metrics/__init__.py', 'package-init'],
  ['src/ar6/metrics/ch4.py', 'ch4-py'],
  ['src/ar6/metrics/co2.py', 'co2-py'],
  ['src/ar6/metrics/constants.py', 'constants-py'],
  ['src/ar6/metrics/gasser.py', 'gasser-py'],
  ['src/ar6/metrics/halogen_generic.py', 'halogen-py'],
].map(([file, id]) => [file, `art-kb54-ipcc-ch7-snapshot-${id}`]));
const nativePassages = [
  ['notebook335-methane', 'notebook335',
    'notebooks/335_chapter7_generate_metrics.ipynb，零基单元 0、7、9、11–12、14、16–17、25–27。'],
  ['co2-response', 'co2-py', 'src/ar6/metrics/co2.py，第 8–16、46–76 行。'],
  ['ch4-response', 'ch4-py', 'src/ar6/metrics/ch4.py，第 8–15、49–68 行。'],
  ['feedback', 'gasser-py', 'src/ar6/metrics/gasser.py，第 6–14、33–60 行。'],
];
const inspectedSource = (source, readingId, edition) =>
  source?.accessStatus === 'public-passages-inspected' && source.version === edition
  && source.reading?.readingId === readingId && source.reading.status === 'selected-passages'
  && typeof source.reading.scope === 'string' && Boolean(source.reading.scope.trim());
const sameArtifact = (artifact, hash, mediaType) =>
  artifact?.sha256 === hash && artifact.mediaType === mediaType && [undefined, 'retrieved'].includes(artifact.kind);

function validateNativeSources(spec, published, register, allArtifacts, allPassages) {
  const errors = [], summary = spec.native.summary;
  const reading = uniqueRecord(register.readings, summary.sourceReadingId);
  const source = uniqueRecord(published.sources, nativeSourceId);
  const commit = summary.engine.sourceCommit;
  const edition = `GitHub 固定提交 ${commit}（2022-09-27）；指标生成代码于 2021-09-22 加入，甲烷响应分量数据于 2021-11-03 加入，均晚于 Zenodo v.1.0。`;
  const url = path => `https://raw.githubusercontent.com/IPCC-WG1/Chapter-7/${commit}/${path}`;
  const originalCode = (artifact, path, sha256, type) =>
    sameArtifact(artifact, sha256, type) && artifact.resolvedUrl === url(path);
  const artifactMatches = (id, path, sha256, type) => {
    const artifact = uniqueRecord(reading?.artifacts, id);
    return originalCode(artifact, path, sha256, type) && uniqueRecord(allArtifacts, id) === artifact;
  };

  if (!inspectedSource(source, summary.sourceReadingId, edition) || reading?.workId !== nativeWorkId
      || reading?.readingStatus !== 'selected-passages' || reading?.version !== edition
      || !originalCode(source?.artifact, nativeNotebook, summary.generatorNotebookSha256, 'application/json')
      || !artifactMatches(summary.sourceArtifactId, nativeNotebook, summary.generatorNotebookSha256, 'application/json'))
    errors.push('climate metrics.native: exact historical code source, work, inspected reading and generator notebook required');

  for (const file of summary.loadedAuthorFiles) {
    if (!artifactMatches(nativeFilePins.get(file.repoRelativeFile), file.repoRelativeFile, file.sha256, 'text/plain'))
      errors.push(`climate metrics.native.${file.repoRelativeFile}: exact loaded author code artifact required`);
  }
  for (const [suffix, carrier, locator] of nativePassages) {
    const evidence = uniqueRecord(published.evidence, `ev-kb54-ipcc-ch7-snapshot-${suffix}`);
    const id = `psg-kb54-ipcc-ch7-snapshot-${suffix}`;
    const passage = uniqueRecord(reading?.passages, id);
    if (evidence?.sourceId !== nativeSourceId || evidence.readingId !== summary.sourceReadingId
        || evidence.passageId !== id || evidence.locator !== locator || passage?.locator !== locator
        || passage.artifactId !== `art-kb54-ipcc-ch7-snapshot-${carrier}`
        || uniqueRecord(allPassages, id) !== passage)
      errors.push(`climate metrics.native.${suffix}: exact code evidence, locator and inspected passage required`);
  }
  return errors;
}

/** Require source and native code evidence in the actual published closure. */
export function validateClimateMetricsFacts(spec, published, context = {}) {
  const errors = validateClimateMetricsCase(spec);
  if (errors.length) return errors;
  if (!Array.isArray(published?.sources) || !Array.isArray(published?.evidence))
    return ['climate metrics: public source and evidence closure required'];
  const register = context?.readingRegister;
  if (register?.schemaVersion !== 1 || !Array.isArray(register.readings))
    return ['climate metrics: actual reading register required'];

  const allArtifacts = register.readings.flatMap(reading => records(reading?.artifacts));
  const allPassages = register.readings.flatMap(reading => records(reading?.passages));
  const inspectedReadings = new Map();
  for (const pin of Object.values(spec.sources)) {
    const source = uniqueRecord(published.sources, pin.sourceId);
    const reading = uniqueRecord(register.readings, pin.readingId);
    const artifact = uniqueRecord(reading?.artifacts, pin.artifactId);
    const edition = reviewedPdfEditions.get(pin.sourceId);
    const samePdf = candidate => sameArtifact(candidate, pin.sha256, 'application/pdf') && candidate.pageCount === pin.pageCount;
    if (!inspectedSource(source, pin.readingId, edition) || reading?.workId !== pin.workId
        || reading?.readingStatus !== 'selected-passages' || reading?.version !== edition
        || !samePdf(source.artifact) || !samePdf(artifact) || uniqueRecord(allArtifacts, pin.artifactId) !== artifact) {
      errors.push(`climate metrics.sources.${pin.sourceId}: exact inspected source, edition, work, reading and original PDF required`);
    } else {
      inspectedReadings.set(pin.sourceId, reading);
    }
  }

  for (const [key, pin] of Object.entries(spec.facts)) {
    const source = spec.sources[pin.source];
    const reading = inspectedReadings.get(pin.source);
    const evidence = uniqueRecord(published.evidence, pin.evidenceId);
    const passage = uniqueRecord(reading?.passages, pin.passageId);
    const reviewed = reviewedPdfPassages.get(pin.passageId);
    if (!reviewed || pin.pdfIndex !== reviewed.index || evidence?.sourceId !== source.sourceId
        || evidence.readingId !== source.readingId || evidence.passageId !== pin.passageId
        || evidence.locator !== reviewed.locator || passage?.locator !== reviewed.locator
        || passage.artifactId !== source.artifactId || passage.printedPages !== reviewed.printedPages
        || !isDeepStrictEqual(passage.pdfIndices, [reviewed.index]) || uniqueRecord(allPassages, pin.passageId) !== passage)
      errors.push(`climate metrics.facts.${key}: exact public evidence, locator, inspected passage and original PDF page required`);

    const actual = evidence?.numericFact === undefined && uniqueRecord(evidence?.numericFacts, pin.factId);
    if (!numericFields.every(field => actual?.[field] === pin[field]))
      errors.push(`climate metrics.facts.${key}: exact public fact identity/value/unit/quantity/subject/basis required`);
  }
  return [...errors, ...validateNativeSources(spec, published, register, allArtifacts, allPassages)];
}

export function validateClimateMetricsWallLink(spec, wall, canonicalWallSha256) {
  const errors = validateClimateMetricsCase(spec);
  if (errors.length) return errors;
  const pin = spec.wallParent;
  if (wall?.caseId !== pin.caseId || wall?.version !== pin.version || canonicalWallSha256 !== pin.inputSha256)
    errors.push('wallParent: registered wall identity or canonical public input hash differs');
  const evaluated = evaluateTeachingCase(wall, { scenario: pin.scenario, theta: pin.theta });
  if (evaluated.scenario !== pin.scenario || evaluated.theta !== pin.theta
      || evaluated.service.area !== pin.areaM2 || evaluated.service.areaUnit !== 'm2'
      || evaluated.service.intervalYears !== `[0,${pin.serviceYears})`
      || !isDeepStrictEqual(evaluated.model.environmentRows, pin.gasRows)
      || !isDeepStrictEqual(evaluated.alternatives.paintA.inventory, pin.paintAInventoryKg)
      || !isDeepStrictEqual(evaluated.alternatives.paintB.inventory, pin.paintBInventoryKg))
    errors.push('wallParent: evaluated shared service, gas rows or selected inventory differs');
  return errors;
}
