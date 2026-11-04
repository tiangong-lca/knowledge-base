// Closed v1 authority: these reviewed tuples and conditions are independent of
// the downloadable input. This is summary arithmetic and conditional teaching,
// not recovery of observations, empirical calibration or database execution.
const reviewedFacts = [
  ["clusterMean", "5.6589", "g", "pedigree-clusterMean", "sampling2008", "ev-ped-sampling-results", "nf-ped-clusterMean", "psg-ped2008-results"],
  ["clusterVariance", "0.0072", "g²", "pedigree-clusterVariance", "sampling2008", "ev-ped-sampling-results", "nf-ped-clusterVariance", "psg-ped2008-results"],
  ["postMean", "5.7245", "g", "pedigree-postMean", "sampling2008", "ev-ped-sampling-results", "nf-ped-postMean", "psg-ped2008-results"],
  ["postVariance", "0.0014", "g²", "pedigree-postVariance", "sampling2008", "ev-ped-sampling-results", "nf-ped-postVariance", "psg-ped2008-results"],
  ["stratifiedMean", "5.6474", "g", "pedigree-stratifiedMean", "sampling2008", "ev-ped-sampling-results", "nf-ped-stratifiedMean", "psg-ped2008-results"],
  ["stratifiedVariance", "0.0034", "g²", "pedigree-stratifiedVariance", "sampling2008", "ev-ped-sampling-results", "nf-ped-stratifiedVariance", "psg-ped2008-results"],
  ["populationVariance", "0.72", "g²", "pedigree-populationVariance", "sampling2008", "ev-ped-sampling-results", "nf-ped-populationVariance", "psg-ped2008-results"],
  ["conflictingStratifiedCv", "0.07", "%", "pedigree-conflictingStratifiedCv", "sampling2008", "ev-ped-sampling-conflict", "nf-ped-conflictingStratifiedCv", "psg-ped2008-discussion"],
  ["preciseScoreTwo", "1.032982251", "GSD", "pedigree-preciseScoreTwo", "report2012", "ev-ped-completeness-factors", "nf-ped-preciseScoreTwo", "psg-ped2012-completeness-factors"],
  ["preciseScoreThree", "1.041623865", "GSD", "pedigree-preciseScoreThree", "report2012", "ev-ped-completeness-factors", "nf-ped-preciseScoreThree", "psg-ped2012-completeness-factors"],
  ["preciseScoreFour", "1.084355355", "GSD", "pedigree-preciseScoreFour", "report2012", "ev-ped-completeness-factors", "nf-ped-preciseScoreFour", "psg-ped2012-completeness-factors"],
  ["roundedScoreTwo", "1.03", "GSD", "pedigree-roundedScoreTwo", "report2012", "ev-ped-completeness-factors", "nf-ped-roundedScoreTwo", "psg-ped2012-completeness-factors"],
  ["roundedScoreThree", "1.04", "GSD", "pedigree-roundedScoreThree", "report2012", "ev-ped-completeness-factors", "nf-ped-roundedScoreThree", "psg-ped2012-completeness-factors"],
  ["roundedScoreFour", "1.08", "GSD", "pedigree-roundedScoreFour", "report2012", "ev-ped-completeness-factors", "nf-ped-roundedScoreFour", "psg-ped2012-completeness-factors"],
  ["journalScoreTwo", "1.03", "GSD", "pedigree-journalScoreTwo", "journal2016", "ev-ped-journal-summary", "nf-ped-journalScoreTwo", "psg-ped2016-summary"],
  ["idealGsd", "1.3", "GSD", "pedigree-idealGsd", "journal2016", "ev-ped-ratio-example", "nf-ped-idealGsd", "psg-ped2016-ratio-example"],
  ["otherGsd", "3.2", "GSD", "pedigree-otherGsd", "journal2016", "ev-ped-ratio-example", "nf-ped-otherGsd", "psg-ped2016-ratio-example"],
  ["reliabilityCandidateGsd", "43.55207485", "GSD", "pedigree-reliabilityCandidateGsd", "report2012", "ev-ped-reliability-cv-trace", "nf-ped-reliabilityCandidateGsd", "psg-ped2012-reliability-cv-trace"],
  ["reliabilityReportedCv", "1237.93", "CV ratio", "pedigree-reliabilityReportedCv", "report2012", "ev-ped-reliability-cv-trace", "nf-ped-reliabilityReportedCv", "psg-ped2012-reliability-cv-trace"],
];
const factFields = ["value", "unit", "subject", "sourceKey", "evidenceId", "factId", "passageId"];
export const pedigreeFactKeys = Object.freeze(reviewedFacts.map(([key]) => key));
const reviewedIdentity = {
  "caseId": "CASE-PEDIGREE-CALIBRATION",
  "version": "1.0.0",
  "model": "selected-summary-and-conditional-lognormal-v1",
  "createdAt": "2026-11-05",
  "status": "source-summary-arithmetic-and-author-illustrations"
};
const reviewedSources = {
  "sampling2008": {
    "sourceId": "src-book-ciroth-srocka-2008-sampling",
    "readingId": "rd-ciroth-srocka-2008-sampling",
    "artifactId": "art-ciroth-srocka-2008-pdf",
    "sha256": "eb0f22d9be1b085fa4af12a53d132b6db5bd9486d05ff12089368e7e35e0b834"
  },
  "report2012": {
    "sourceId": "src-book-ciroth-2012-pedigree-refinement",
    "readingId": "rd-ciroth-2012-pedigree-refinement",
    "artifactId": "art-ciroth-2012-pedigree-report",
    "sha256": "91278d5d2384565aec224a092c74eac5dbce2a684925a6c15e3bfd7c6e17507c"
  },
  "journal2016": {
    "sourceId": "src-book-ciroth-2016-pedigree-factors",
    "readingId": "rd-ciroth-2016-pedigree-factors",
    "artifactId": "art-ciroth-2016-pedigree-pdf",
    "sha256": "645ed4cb76c4c1773276bd1a52e2299592bb3f33971adab6db99e1e02bf3226f"
  }
};
const reviewedInterpretation = {
  "rawObservationsReconstructed": false,
  "empiricalCalibrationReproduced": false,
  "currentDatabaseSoftwareExecuted": false,
  "unreportedPrecisionRecovered": false,
  "scientificValidation": false,
  "sourceReportedDiscrepanciesRepaired": false,
  "summaryArithmeticFromDisplayedValues": true,
  "ratioResidualIsAuthorConditional": true
};
const reviewedIllustration = {
  "kind": "author-stipulated-independent-lognormal-inventory-parameter",
  "median": "10",
  "unit": "kg material / stipulated product item",
  "basicGsd": "1.2",
  "selectedCompletenessScore": "2",
  "factorFactKey": "roundedScoreTwo",
  "otherAdditionalFactors": "1",
  "logComponentsIndependent": true,
  "distribution": "lognormal",
  "center": "median-not-arithmetic-mean",
  "logIntervalHalfWidthSd": "2",
  "wholeLifeCycleModel": false,
  "actualCupMeanConfidenceInterval": false,
  "realProductRecommendation": false
};

const reviewedReliabilityTrace = {
  "kind": "author-conditional-display-rounding-comparison",
  "gsdDecimalPlaces": 2,
  "cvDecimalPlaces": 2,
  "originalRoundingProcedureEstablished": false,
  "recommendationStatusResolved": false,
  "cvScale": "standard-deviation/mean ratio, not percent"
};

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Exact v1 identity/conditions; structural integrity is not source entailment. */
export function validatePedigreeCalibrationCase(spec) {
  if (!object(spec)) return ['pedigree case: must be an object'];
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
  fields(spec, [...Object.keys(reviewedIdentity), 'sources', 'facts', 'interpretation', 'illustration', 'reliabilityTrace'], 'case');
  for (const [key, value] of Object.entries(reviewedIdentity)) same(spec[key], value, key);
  for (const [section, expected] of [['interpretation', reviewedInterpretation], ['illustration', reviewedIllustration], ['reliabilityTrace', reviewedReliabilityTrace]]) {
    if (fields(spec[section], Object.keys(expected), section))
      for (const [key, value] of Object.entries(expected)) same(spec[section][key], value, `${section}.${key}`);
  }
  if (fields(spec.sources, Object.keys(reviewedSources), 'sources')) for (const [key, expected] of Object.entries(reviewedSources)) {
    if (fields(spec.sources[key], Object.keys(expected), `sources.${key}`))
      for (const [field, value] of Object.entries(expected)) same(spec.sources[key][field], value, `sources.${key}.${field}`);
  }
  if (fields(spec.facts, pedigreeFactKeys, 'facts')) for (const [key, ...tuple] of reviewedFacts) {
    if (fields(spec.facts[key], factFields, `facts.${key}`))
      factFields.forEach((field, index) => same(spec.facts[key][field], tuple[index], `facts.${key}.${field}`));
  }
  return errors;
}

/**
 * All computed quantities are finite IEEE-754 binary64 values. Public displays
 * use Number.toFixed(4/6/8); raw numeric values remain alongside them for checking.
 * Display decimals are not recovered source precision or exact transcendental
 * values. Source decimal strings are retained separately without reformatting.
 */
const result = value => {
  if (!Number.isFinite(value)) throw new TypeError('Nonfinite pedigree calculation');
  return { value, fixed4: value.toFixed(4), fixed6: value.toFixed(6), fixed8: value.toFixed(8) };
};
export function evaluatePedigreeCalibrationCase(spec) {
  const errors = validatePedigreeCalibrationCase(spec);
  if (errors.length) throw new TypeError(`Invalid pedigree-calibration case:\n${errors.join('\n')}`);
  const facts = Object.fromEntries(pedigreeFactKeys.map(key => [key, Number(spec.facts[key].value)]));
  const summary = (mean, variance, meaning) => ({
    mean: result(mean), variance: result(variance), standardDeviation: result(Math.sqrt(variance)),
    cvPercent: result(100 * Math.sqrt(variance) / mean), meaning,
  });
  const sourceRatio = facts.otherGsd / facts.idealGsd;
  // Additional author condition: independent multiplicative lognormal components
  // whose total GSD is required to equal 3.2 from the baseline 1.3. This residual
  // is not a proposed replacement generic factor or an empirical calibration.
  const residual = Math.exp(Math.sqrt(Math.log(facts.otherGsd) ** 2 - Math.log(facts.idealGsd) ** 2));
  const combine = additional => Math.exp(Math.hypot(Math.log(facts.idealGsd), Math.log(additional)));
  const median = Number(spec.illustration.median), basic = Number(spec.illustration.basicGsd);
  const additional = facts[spec.illustration.factorFactKey];
  const logSigma = Math.hypot(Math.log(basic), Math.log(additional), Math.log(Number(spec.illustration.otherAdditionalFactors)));
  const totalGsd = Math.exp(logSigma), squaredGsd = totalGsd ** 2;
  // Eq 8-5 is used here only for the lognormal GSD-to-CV relationship.
  // Rounding the displayed candidate GSD first is our explicitly stipulated
  // comparison; a matching display does not identify the source's procedure
  // or reinstate a candidate omitted from its recommendation table.
  const authorRoundedGsd = facts.reliabilityCandidateGsd.toFixed(spec.reliabilityTrace.gsdDecimalPlaces);
  const cvFromGsd = gsd => Math.sqrt(Math.expm1(Math.log(gsd) ** 2));
  const cvFromUnrounded = cvFromGsd(facts.reliabilityCandidateGsd);
  const cvFromRounded = cvFromGsd(Number(authorRoundedGsd));
  const cvFromRoundedToTwoDecimals = cvFromRounded.toFixed(spec.reliabilityTrace.cvDecimalPlaces);
  return {
    caseId: spec.caseId, version: spec.version,
    numericPolicy: 'IEEE-754 binary64 raw value; fixed4/fixed6/fixed8 are Number.toFixed(4/6/8); not source precision',
    reliabilityTrace: {
      kind: spec.reliabilityTrace.kind,
      candidateSourceGsd: spec.facts.reliabilityCandidateGsd.value,
      authorRoundedGsd, cvFromUnrounded: result(cvFromUnrounded), cvFromRounded: result(cvFromRounded),
      cvFromRoundedToTwoDecimals, reportedCv: spec.facts.reliabilityReportedCv.value,
      displayMatch: cvFromRoundedToTwoDecimals === spec.facts.reliabilityReportedCv.value,
      cvScale: spec.reliabilityTrace.cvScale,
      originalRoundingProcedureEstablished: false, recommendationStatusResolved: false,
      empiricalCalibrationReproduced: false,
    },
    sampling: {
      cluster: summary(facts.clusterMean, facts.clusterVariance, 'precision-of-estimated-mean'),
      poststratified: summary(facts.postMean, facts.postVariance, 'precision-of-estimated-mean'),
      stratified: summary(facts.stratifiedMean, facts.stratifiedVariance, 'precision-of-estimated-mean'),
      population: summary(facts.stratifiedMean, facts.populationVariance, 'individual-cup-spread-relative-to-reported-stratified-mean'),
      poststratifiedVarianceReductionPercent: result(100 * (1 - facts.postVariance / facts.clusterVariance)),
      sourceDiscrepancy: {
        reportedStratifiedCvPercent: spec.facts.conflictingStratifiedCv.value,
        fromDisplayedMeanVarianceCvPercent: result(100 * Math.sqrt(facts.stratifiedVariance) / facts.stratifiedMean),
        repaired: false,
      },
      observationsReconstructed: false,
    },
    completeness: {
      scores: ['Two', 'Three', 'Four'].map((name, index) => ({ score: String(index + 2),
        preciseSourceGsd: spec.facts[`preciseScore${name}`].value,
        roundedToTwoDecimals: facts[`preciseScore${name}`].toFixed(2),
        roundedSourceGsd: spec.facts[`roundedScore${name}`].value,
      })),
      journalScoreTwoGsd: spec.facts.journalScoreTwo.value,
      chosenGsd: spec.facts.roundedScoreTwo.value,
      chosenSquaredGsd: result(additional ** 2),
      scoreFiveAvailable: false, empiricalCalibrationReproduced: false,
    },
    ratioIllustration: {
      sourceGenericRatio: result(sourceRatio),
      authorConditionalIndependentResidualGsd: result(residual),
      baselineCombinedWithSourceRatioGsd: result(combine(sourceRatio)),
      baselineCombinedWithResidualGsd: result(combine(residual)),
      requiredTotalGsd: spec.facts.otherGsd.value,
      residualIsAuthorConditional: true, replacementGenericFactorProposed: false,
    },
    illustration: {
      median: spec.illustration.median, unit: spec.illustration.unit,
      basicGsd: spec.illustration.basicGsd, additionalGsd: spec.facts.roundedScoreTwo.value,
      logSigma: result(logSigma), totalGsd: result(totalGsd), squaredGsd: result(squaredGsd),
      logCenterTwoSigmaLower: result(median / squaredGsd), logCenterTwoSigmaUpper: result(median * squaredGsd),
      arithmeticMean: result(median * Math.exp(logSigma ** 2 / 2)),
      center: spec.illustration.center, intervalMeaning: 'distribution-log-center-plus-or-minus-two-log-standard-deviations',
      cupMeanConfidenceInterval: false, wholeLifeCycleModel: false, realProductRecommendation: false,
    },
  };
}
