import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluatePedigreeCalibrationCase, validatePedigreeCalibrationCase } from './pedigree-calibration.mjs';

const input = () => JSON.parse(readFileSync(new URL('../knowledge/cases/pedigree-calibration-v1.json', import.meta.url), 'utf8'));
const close = (actual, expected, tolerance = 1e-12) => assert(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('selected displayed sampling summaries retain estimator versus individual-spread meanings and the unresolved source conflict', () => {
  const spec = input(), before = JSON.stringify(spec), output = evaluatePedigreeCalibrationCase(spec);
  // Independently computed Python standard-library square roots/divisions;
  // regression constants are deliberately distinct from the evaluator formula.
  const expected = {
    cluster: ['0.08485281', '1.49945773'], poststratified: ['0.03741657', '0.65362169'],
    stratified: ['0.05830952', '1.03250202'], population: ['0.84852814', '15.02511133'],
  };
  for (const [design, [sd, cv]] of Object.entries(expected)) {
    assert.equal(output.sampling[design].standardDeviation.fixed8, sd);
    assert.equal(output.sampling[design].cvPercent.fixed8, cv);
  }
  assert.equal(output.sampling.population.mean.value, 5.6474);
  assert.equal(output.sampling.cluster.meaning, 'precision-of-estimated-mean');
  assert.equal(output.sampling.population.meaning, 'individual-cup-spread-relative-to-reported-stratified-mean');
  assert.equal(output.sampling.poststratifiedVarianceReductionPercent.fixed8, '80.55555556');
  assert.equal(output.sampling.sourceDiscrepancy.reportedStratifiedCvPercent, '0.07');
  assert.equal(output.sampling.sourceDiscrepancy.fromDisplayedMeanVarianceCvPercent.fixed8, '1.03250202');
  assert.equal(output.sampling.sourceDiscrepancy.repaired, false);
  assert.equal(output.sampling.observationsReconstructed, false);
  assert.equal(JSON.stringify(spec), before);
});

test('published completeness decimals round without inventing score five or reproducing empirical calibration', () => {
  const output = evaluatePedigreeCalibrationCase(input()).completeness;
  assert.deepEqual(output.scores.map(row => [row.preciseSourceGsd, row.roundedToTwoDecimals, row.roundedSourceGsd]), [
    ['1.032982251', '1.03', '1.03'], ['1.041623865', '1.04', '1.04'], ['1.084355355', '1.08', '1.08'],
  ]);
  assert.equal(output.chosenGsd, '1.03');
  assert.equal(output.chosenSquaredGsd.fixed8, '1.06090000');
  assert.equal(output.journalScoreTwoGsd, '1.03');
  assert.equal(output.scoreFiveAvailable, false);
  assert.equal(output.empiricalCalibrationReproduced, false);
});

test('source illustrative GSD ratio and author-conditional independent residual answer distinct questions', () => {
  const output = evaluatePedigreeCalibrationCase(input()).ratioIllustration;
  assert.equal(output.sourceGenericRatio.fixed8, '2.46153846');
  assert.equal(output.authorConditionalIndependentResidualGsd.fixed8, '3.10549976');
  assert.equal(output.baselineCombinedWithSourceRatioGsd.fixed8, '2.55542140');
  assert.equal(output.baselineCombinedWithResidualGsd.fixed8, '3.20000000');
  close(output.sourceGenericRatio.value * 1.3, 3.2);
  assert(output.baselineCombinedWithSourceRatioGsd.value < 3.2);
  assert.equal(output.residualIsAuthorConditional, true);
  assert.equal(output.replacementGenericFactorProposed, false);
});

test('invented inventory has a median, log-center two-sigma distribution interval and distinct arithmetic mean', () => {
  const output = evaluatePedigreeCalibrationCase(input()).illustration;
  const expected = { logSigma: '0.18470212', totalGsd: '1.20286008', squaredGsd: '1.44687237',
    logCenterTwoSigmaLower: '6.91145966', logCenterTwoSigmaUpper: '14.46872367', arithmeticMean: '10.17203745' };
  for (const [key, value] of Object.entries(expected)) assert.equal(output[key].fixed8, value);
  // Distribution invariants, independently of how the evaluator obtains sigma.
  close(output.logCenterTwoSigmaLower.value * output.logCenterTwoSigmaUpper.value, 100);
  close(Math.sqrt(output.logCenterTwoSigmaUpper.value / output.logCenterTwoSigmaLower.value), output.squaredGsd.value);
  assert(output.arithmeticMean.value > Number(output.median));
  assert.equal(output.median, '10');
  assert.equal(output.center, 'median-not-arithmetic-mean');
  assert.equal(output.intervalMeaning, 'distribution-log-center-plus-or-minus-two-log-standard-deviations');
  assert.equal(output.cupMeanConfidenceInterval, false);
  assert.equal(output.wholeLifeCycleModel, false);
  assert.equal(output.realProductRecommendation, false);
});

test('closed v1 rejects any changed source tuple, source identity, numeric type or author condition', () => {
  assert.deepEqual(validatePedigreeCalibrationCase(input()), []);
  for (const [key, fact] of Object.entries(input().facts)) for (const field of Object.keys(fact)) {
    const spec = input(); spec.facts[key][field] = 'changed';
    assert(validatePedigreeCalibrationCase(spec).some(error => error.includes(`facts.${key}.${field}`)));
    assert.throws(() => evaluatePedigreeCalibrationCase(spec), /Invalid pedigree/);
  }
  for (const section of ['sources', 'interpretation', 'illustration']) {
    for (const key of Object.keys(input()[section])) {
      const spec = input(); delete spec[section][key];
      assert(validatePedigreeCalibrationCase(spec).length > 0);
    }
  }
  for (const value of [null, [], true, 'invalid']) assert(validatePedigreeCalibrationCase(value).length > 0);
  const numeric = input(); numeric.facts.clusterMean.value = 5.6589;
  assert(validatePedigreeCalibrationCase(numeric).length > 0);
  const condition = input(); condition.illustration.logIntervalHalfWidthSd = '1.96';
  assert(validatePedigreeCalibrationCase(condition).length > 0);
});

test('reliability CV trace separates unrounded input from the author rounding comparison and keeps CV in ratio units', () => {
  const trace = evaluatePedigreeCalibrationCase(input()).reliabilityTrace;
  // Independent Python standard-library calculation of the two fixed paths.
  assert.equal(trace.candidateSourceGsd, '43.55207485');
  assert.equal(trace.authorRoundedGsd, '43.55');
  assert.equal(trace.cvFromUnrounded.fixed8, '1238.15382107');
  assert.equal(trace.cvFromRounded.fixed8, '1237.93122459');
  assert.equal(trace.cvFromUnrounded.value.toFixed(2), '1238.15');
  assert.equal(trace.cvFromRoundedToTwoDecimals, '1237.93');
  assert.equal(trace.reportedCv, '1237.93');
  assert.equal(trace.displayMatch, true);
  assert(trace.cvFromUnrounded.value > trace.cvFromRounded.value);
  assert.equal(trace.cvScale, 'standard-deviation/mean ratio, not percent');
  // The inverse lognormal relation recovers GSD from CV as a ratio; using a
  // percent-scaled CV here would violate this distribution identity.
  const recoveredGsd = Math.exp(Math.sqrt(Math.log1p(trace.cvFromRounded.value ** 2)));
  close(recoveredGsd, 43.55);
  assert.equal(trace.kind, 'author-conditional-display-rounding-comparison');
  assert.equal(trace.originalRoundingProcedureEstablished, false);
  assert.equal(trace.recommendationStatusResolved, false);
  assert.equal(trace.empiricalCalibrationReproduced, false);
});

test('reliability trace assumptions cannot change rounding, scale or establish an original source procedure', () => {
  const original = input();
  for (const [field, value] of Object.entries(original.reliabilityTrace)) {
    const spec = input(); spec.reliabilityTrace[field] = typeof value === 'boolean' ? true : typeof value === 'number' ? value + 1 : 'changed';
    assert(validatePedigreeCalibrationCase(spec).some(error => error.includes(`reliabilityTrace.${field}`)));
    assert.throws(() => evaluatePedigreeCalibrationCase(spec), /Invalid pedigree/);
  }
  const missing = input(); delete missing.reliabilityTrace;
  assert(validatePedigreeCalibrationCase(missing).length > 0);
});
