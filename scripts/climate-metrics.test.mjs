import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  canonicalCaseInput, caseEvaluationReceipt, caseInputSha256, caseTemplateContext, materializeCaseClaims,
  publicTeachingCase, validateCasePublication, validateCasePublications,
} from './case-publication.mjs';
import { validateClimateMetricsFacts, validateClimateMetricsWallLink } from './climate-metrics.mjs';
import { publicCatalog } from './knowledge.mjs';

const read = file => JSON.parse(readFileSync(new URL(`../knowledge/${file}`, import.meta.url), 'utf8'));
const spec = read('cases/climate-metrics-v1.json');
const wall = read('cases/wall-coating-v1.json');
const actualCatalog = read('catalog.json');
const actualReadingRegister = read('research/readings.json');
const inputHash = '0491866fc3fd0de3e59db3be3c28ff80c27e4c247601cbcad85dfab27b434c74';
const wallHash = 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285';
const nativeCodeEvidenceIds = [
  'ev-kb54-ipcc-ch7-snapshot-notebook335-methane', 'ev-kb54-ipcc-ch7-snapshot-co2-response',
  'ev-kb54-ipcc-ch7-snapshot-ch4-response', 'ev-kb54-ipcc-ch7-snapshot-feedback',
];
const requiredEvidence = new Set([
  ...Object.values(spec.facts).map(fact => fact.evidenceId), ...nativeCodeEvidenceIds, ...wall.characterization.factorEvidenceIds,
]);

function fixture() {
  const catalog = { schemaVersion: 1, claims: [], concepts: [], mappings: [], coverage: [] };
  catalog.evidence = actualCatalog.evidence.filter(evidence => requiredEvidence.has(evidence.id));
  const sourceIds = new Set(catalog.evidence.map(evidence => evidence.sourceId));
  catalog.sources = actualCatalog.sources.filter(source => sourceIds.has(source.id));
  const entry = (caseSpec, inputFile, id, textTemplate, evidenceIds) => ({
    spec: structuredClone(caseSpec), inputFile,
    publication: {
      schemaVersion: 1, caseId: caseSpec.caseId, version: caseSpec.version, inputFile,
      approvedInputSha256: caseInputSha256(caseSpec), reviewedAt: '2026-11-06', reviewKind: 'agent-source-check',
      claims: [{
        id, textTemplate, kind: 'interpretation', scope: 'Local validation fixture only', evidenceIds,
        evidenceLinks: evidenceIds.map(evidenceId => ({ evidenceId, relation: 'context', rationale: 'Fixture context' })),
        premiseIds: [], conceptIds: [], mappingIds: [],
        caveats: ['Fixture establishes structural validation only.'], reasoning: 'Materialize pinned case fields.',
      }],
    },
  });
  const sourceEvidenceIds = [...requiredEvidence].filter(id => !wall.characterization.factorEvidenceIds.includes(id));
  const climateEntry = entry(spec, 'climate-metrics-v1.json', 'cl-fixture-climate',
    'The reconstructed integral is {{evaluated.response.h100.integratedYears.fixed3}} years.', sourceEvidenceIds);
  const wallEntry = entry(wall, 'wall-coating-v1.json', 'cl-fixture-wall',
    'The fixed scenario inventory is {{smooth.display.alternatives.paintA.inventory.0}} kg CO2.',
    wall.characterization.factorEvidenceIds);
  const entries = [climateEntry, wallEntry];
  for (const e of entries) catalog.claims.push(...structuredClone(materializeCaseClaims(e.spec, e.publication)));
  return { entries, climateEntry, wallEntry, catalog: structuredClone(catalog), readingRegister: structuredClone(actualReadingRegister) };
}
const evaluated = caseTemplateContext(spec).evaluated;
function close(value, expected, absTolerance) {
  assert(Math.abs(value - expected) <= absTolerance, `${value} differs from ${expected} by more than ${absTolerance}`);
}

test('Joos displayed fit reproduces independent quadrature at each selected horizon', () => {
  // Independent high-precision quadrature and selected source displays recorded
  // before this evaluator existed, in the research response reconstruction.
  const cases = [
    ['h20', 0.5962381267190024, 14.241679936997457, '14.2'],
    ['h100', 0.40942767199397434, 52.35538856915011, '52.4'],
    ['h500', 0.28034839989069876, 183.63751758885633, '184'],
  ];
  for (const [key, fraction, years, reported] of cases) {
    const point = evaluated.response[key];
    close(point.remainingFraction.value, fraction, 1e-12);
    close(point.integratedYears.value, years, 1e-10);
    assert.equal(point.reportedIntegralYears, reported);
    assert.equal(point.roundsToReportedIntegral, true);
  }
  close(evaluated.response.initialRemainingFraction.value, 1, 1e-15);
  close(evaluated.response.agwp100.reconstructed.value, 92.66903776739508, 1e-11);
  assert.equal(evaluated.response.agwp100.reported, '92.5');
  assert.equal(evaluated.response.agwp100.delta.fixed3, '0.169');
  assert.equal(evaluated.response.agwp100.originalEnsembleReexecuted, false);
});

test('exact arithmetic preserves factor versions, the gas basis and each difference direction', () => {
  // Hand-calculated from the reviewed original table literals and fixed
  // two-coordinate inventories, with no factor uncertainty propagation.
  const pulse = evaluated.pulsePair, paint = evaluated.wall;
  const keys = ['oldGwp100', 'newGwp100', 'newGwp20', 'newGtp100'];
  assert.deepEqual(keys.map(key => [pulse[key].co2.exact, pulse[key].fossilCh4.exact, pulse[key].delta.exact]), [
    ['28.1', '29.8', '1.7'], ['28.1', '28.1', '0'], ['28.1', '77.4', '49.3'], ['28.1', '7.1', '-21'],
  ]);
  assert.deepEqual(keys.map(key => [paint[key].paintA.exact, paint[key].paintB.exact, paint[key].delta.exact]), [
    ['28.086', '29.682', '1.596'], ['27.967', '29.529', '1.562'],
    ['31.418', '33.966', '2.548'], ['26.497', '27.639', '1.142'],
  ]);
  assert.equal(paint.newGtp100.metric, 'GTP');
  assert.notEqual(paint.newGtp100.unit, paint.newGwp100.unit);
  assert.equal(evaluated.scope.factorUncertaintyPropagated, false);
});

test('corrected SM quotient and display consistency stay separate', () => {
  const sm = evaluated.correctedSmQuotient;
  assert.equal(sm.quotient.exact, '810/31');
  assert.equal(sm.quotient.fixed3, '26.129');
  assert.equal(sm.reported, '26.2');
  assert.equal(sm.differenceFromReported.exact, '-11/155');
  assert.deepEqual(sm.quotientRoundingInterval.map(bound => bound.fixed3), ['25.936', '26.324']);
  assert.deepEqual(sm.reportedRoundingInterval.map(bound => bound.exact), ['26.15', '26.25']);
  assert.equal(sm.roundingIntervalsOverlap, true);
  assert.equal(sm.roundingIntervalIsPhysicalUncertainty, false);
});

test('calendar and post-pulse coordinates produce different comparisons from the stored historical CO2 response', () => {
  const { commonEndpoint, fixedPostPulseWindow } = evaluated.timing;
  const { early, late } = commonEndpoint;
  assert.deepEqual([early.emissionYear, early.endpointYear, early.elapsedYears], [0, 100, 100]);
  assert.deepEqual([late.emissionYear, late.endpointYear, late.elapsedYears], [80, 100, 20]);
  assert.equal(early.agwp.responsePerKg, '8.9465123053613e-14');
  assert.equal(late.agwp.responsePerKg, '2.433624661902381e-14');
  assert.equal(early.agtp.responsePerKg, '3.9459738224952534e-16');
  assert.equal(late.agtp.responsePerKg, '4.953579557142457e-16');
  assert.equal(late.agwp.scientificText3, '2.434×10⁻¹⁴');
  assert.equal(late.agtp.scientificText3, '4.954×10⁻¹⁶');
  assert(late.agwp.value < early.agwp.value);
  assert(late.agtp.value > early.agtp.value);
  assert.deepEqual([fixedPostPulseWindow.late.emissionYear, fixedPostPulseWindow.late.endpointYear,
    fixedPostPulseWindow.late.elapsedYears], [80, 180, 100]);
  assert.deepEqual(fixedPostPulseWindow.early.agwp, fixedPostPulseWindow.late.agwp);
  assert.deepEqual(fixedPostPulseWindow.early.agtp, fixedPostPulseWindow.late.agtp);
  assert.equal(evaluated.timing.negativeEmissionOrStorageCredit, false);
});

test('historical Cain formula uses explicit history, changes at 2041 and preserves aggregate annual sums', () => {
  const rate = evaluated.rate;
  // Independent hand checks in the rate-sources review, not evaluator output.
  const labels = ['A', 'B', 'C', 'aggregate'];
  const columns = ['y2040', 'y2041', 'sum20', 'sum50'];
  assert.deepEqual(labels.map(label => columns.map(column => rate[label][column].revised.exact)), [
    ['2800', '700', '56000', '77000'], ['700', '700', '14000', '35000'],
    ['-1400', '700', '-28000', '-7000'], ['2100', '2100', '42000', '105000'],
  ]);
  assert.deepEqual(columns.map(column => rate.aggregate[column].conventional.exact), ['8400', '8400', '168000', '420000']);
  assert.deepEqual([rate.C.y2040.lookbackYear, rate.C.y2041.lookbackYear], [2020, 2021]);
  assert.deepEqual([rate.C.y2040.past.exact, rate.C.y2041.past.exact], ['120', '100']);
  assert.equal(rate.C.sum50.cumulativeUnit, 't CO2-we');
  assert.equal(rate.missingHistoryAssumedZero, false);
  const incomplete = structuredClone(spec);
  incomplete.rateExample.historicalYears[0] = '2002';
  assert.throws(() => caseTemplateContext(incomplete), /exact reviewed climate-metrics v1/);
});

test('historical native rounded targets and grid sensitivity retain their distinct provenance', () => {
  const native = evaluated.native;
  assert.equal(native.h20.gwp.fixed3, '81.199');
  assert.equal(native.h50.gtp.fixed3, '11.049');
  assert.equal(native.h100.gwp.fixed3, '27.859');
  assert.equal(native.h100.gtp.fixed3, '5.377');
  assert.equal(native.h100.finerGwp.fixed3, '27.939');
  assert.equal(native.h100.finerGtp.fixed3, '5.477');
  assert.equal(native.h100.feedbackAgwpDifferencePercent.fixed3, '5.348');
  assert.equal(native.h100.feedbackAgtpDifferencePercent.fixed3, '21.103');
  assert.equal(native.h100.gwpDifference.fixed3, '0.080');
  assert.equal(native.h100.gtpDifference.fixed3, '0.100');
  assert.equal(native.h100.directResponsesIdentical, true);
  assert.equal(native.h100.historicalRoundedTargets.gwp.agrees, true);
  assert.equal(native.h100.historicalRoundedTargets.gtp.agrees, true);
  assert.equal(native.h20.historicalRoundedTargets.gwp.agrees, true);
  assert.equal(native.h50.historicalRoundedTargets.gtp.agrees, true);
  assert.equal(native.zeroTimeControl.gwp, null);
  assert.equal(native.zeroTimeControl.gtp, null);
  assert.equal(native.oxidationAndUptakeIncluded, false);
  assert.equal(native.correctedGeneratorExecuted, false);
  assert.equal(native.nativeReexecutedByStaticBuild, false);
});

test('registry materializes reviewed input, canonical text and closed publication with the actual wall parent', () => {
  const f = fixture();
  assert.deepEqual(validateCasePublications(f.entries, f.catalog, f), []);
  assert.equal(f.catalog.claims[0].text, 'The reconstructed integral is 52.355 years.');
  assert.equal(caseInputSha256(spec), inputHash);
  assert.equal(caseInputSha256(wall), wallHash);
  const receipt = caseEvaluationReceipt(spec, 'a'.repeat(40));
  assert.equal(receipt.scientificApproval, false);
  assert.equal(receipt.inputSha256, inputHash);
  assert.equal(receipt.evaluations.evaluated.timing.fixedPostPulseWindow.late.endpointYear, 180);
});

test('actual public closure rejects missing and coherently changed source, reading, passage and fact joins', () => {
  const f = fixture();
  const closure = publicCatalog(f.catalog);
  const original = spec.facts.newFossilGwp100;
  const sourcePin = spec.sources[original.source];
  const validate = (publication, context = f) => validateClimateMetricsFacts(publicTeachingCase(spec), publication, context);
  assert.deepEqual(validate(closure), []);
  assert.match(validate(closure, {}).join('\n'), /actual reading register/);
  for (const field of ['id', 'value', 'unit', 'quantity', 'subject', 'basis']) {
    const changed = structuredClone(closure);
    changed.evidence.find(e => e.id === original.evidenceId).numericFacts.find(fact => fact.id === original.factId)[field] = 'changed';
    assert.match(validate(changed).join('\n'), /facts\.newFossilGwp100: exact public fact identity\/value\/unit\/quantity\/subject\/basis/);
  }
  const missing = structuredClone(closure);
  missing.evidence = missing.evidence.filter(e => e.id !== original.evidenceId);
  assert.match(validate(missing).join('\n'), /facts\.newFossilGwp100: exact public evidence/);

  const mutableBindings = () => {
    const published = structuredClone(closure), context = { readingRegister: structuredClone(f.readingRegister) };
    const reading = context.readingRegister.readings.find(record => record.id === sourcePin.readingId);
    const source = published.sources.find(record => record.id === sourcePin.sourceId);
    const evidence = published.evidence.find(record => record.id === original.evidenceId);
    return { published, context, reading, source, evidence };
  };
  const relocated = mutableBindings();
  const changedPassage = relocated.reading.passages.find(p => p.id === original.passageId);
  changedPassage.locator = 'Replacement caption on nearby page';
  changedPassage.printedPages = '4';
  changedPassage.pdfIndices = [3];
  relocated.evidence.locator = changedPassage.locator;
  assert.match(validate(relocated.published, relocated.context).join('\n'), /facts\.newFossilGwp100: exact public evidence, locator/);

  const newArtifact = mutableBindings();
  const replacementHash = 'b'.repeat(64);
  const artifact = newArtifact.reading.artifacts.find(a => a.id === sourcePin.artifactId);
  artifact.sha256 = replacementHash;
  newArtifact.source.artifact.sha256 = replacementHash;
  assert.match(validate(newArtifact.published, newArtifact.context).join('\n'), /exact inspected source, edition, work, reading and original PDF/);

  const wrongCarrier = mutableBindings();
  const publishedChapterUrl = 'https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Chapter07.pdf';
  wrongCarrier.source.artifact.resolvedUrl = publishedChapterUrl;
  wrongCarrier.reading.artifacts.find(a => a.id === sourcePin.artifactId).resolvedUrl = publishedChapterUrl;
  assert.match(validate(wrongCarrier.published, wrongCarrier.context).join('\n'), /exact inspected source, edition, work, reading and original PDF/);

  const newReading = mutableBindings();
  const replacementReadingId = 'rd-fixture-other-edition';
  newReading.reading.id = replacementReadingId;
  newReading.source.reading.readingId = replacementReadingId;
  for (const evidence of newReading.published.evidence.filter(record => record.sourceId === sourcePin.sourceId))
    evidence.readingId = replacementReadingId;
  assert.match(validate(newReading.published, newReading.context).join('\n'), /sources\.src-kb54-ipcc-ar6-errata-2025-10-07-pdf/);
});

test('native receipt, code bytes and citation are independent gates', () => {
  const f = fixture();
  const closure = publicCatalog(f.catalog);
  const context = { readingRegister: structuredClone(f.readingRegister) };
  const reading = context.readingRegister.readings.find(record => record.id === spec.native.summary.sourceReadingId);
  reading.artifacts.find(record => record.id === 'art-kb54-ipcc-ch7-snapshot-co2-py').sha256 = 'c'.repeat(64);
  assert.match(validateClimateMetricsFacts(publicTeachingCase(spec), closure, context).join('\n'),
    /native\.src\/ar6\/metrics\/co2\.py: exact loaded author code artifact/);
  closure.evidence = closure.evidence.filter(e => e.id !== nativeCodeEvidenceIds[0]);
  assert.match(validateClimateMetricsFacts(publicTeachingCase(spec), closure, f).join('\n'),
    /native\.notebook335-methane: exact code evidence/);
  const relabeled = structuredClone(spec);
  relabeled.native.summary.observations[0].receiptSha256 = 'd'.repeat(64);
  const sortKeys = (_, value) => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0))
    : value;
  relabeled.native.summarySha256 = createHash('sha256').update(JSON.stringify(relabeled.native.summary, sortKeys)).digest('hex');
  assert.throws(() => caseInputSha256(relabeled), /exact reviewed climate-metrics v1/);
});

test('parent is unique and valid even if a changed parent is coherently reapproved', () => {
  const errors = f => validateCasePublications(f.entries, f.catalog, f).filter(error => error.startsWith('climate metrics parent:'));
  const missing = fixture(); missing.entries.pop();
  assert.match(errors(missing).join('\n'), /exactly one registered wall/);
  const duplicate = fixture(); duplicate.entries.push(structuredClone(duplicate.wallEntry));
  assert.match(errors(duplicate).join('\n'), /exactly one registered wall/);
  const wrongName = fixture(); wrongName.wallEntry.inputFile = 'wall-copy.json';
  assert.match(errors(wrongName).join('\n'), /registered wall input filename/);
  const changed = fixture();
  changed.wallEntry.spec.environment.matrix[0][0] = '2.01';
  changed.wallEntry.publication.approvedInputSha256 = caseInputSha256(changed.wallEntry.spec);
  changed.catalog.claims[1] = structuredClone(materializeCaseClaims(changed.wallEntry.spec, changed.wallEntry.publication)[0]);
  assert.deepEqual(validateCasePublication(changed.wallEntry.spec, changed.wallEntry.publication, changed.catalog, changed), []);
  assert.match(errors(changed).join('\n'), /approved wall publication input hash differs/);
  // Even with a supplied expected hash, the model's actual changed inventory fails.
  assert.deepEqual(validateClimateMetricsWallLink(publicTeachingCase(spec), changed.wallEntry.spec, wallHash),
    ['wallParent: evaluated shared service, gas rows or selected inventory differs']);
});

test('downloadable projection excludes unknown nested metadata and rejects changes to approved public input', () => {
  const changed = structuredClone(spec);
  const decorate = value => {
    if (!value || typeof value !== 'object') return;
    for (const child of Object.values(value)) decorate(child);
    value.privateCapture = { secret: 'PRIVATE' };
  };
  decorate(changed);
  assert.equal(canonicalCaseInput(changed), canonicalCaseInput(spec));
  assert(!JSON.stringify(caseEvaluationReceipt(changed, 'a'.repeat(40))).includes('PRIVATE'));
  const reordered = value => {
    if (Array.isArray(value)) return value.map(reordered);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).reverse().map(([key, child]) => [key, reordered(child)]));
  };
  assert.equal(canonicalCaseInput(reordered(spec)), canonicalCaseInput(spec));
  const changedFactor = structuredClone(spec);
  changedFactor.facts.newFossilGwp100.value = '30';
  assert.throws(() => caseInputSha256(changedFactor), /exact reviewed climate-metrics v1/);
  const objectInScalar = structuredClone(spec);
  objectInScalar.native.summary.observations[0].observations[0].co2Response.rf = { secret: 'PRIVATE' };
  assert.throws(() => caseInputSha256(objectInScalar), /public scalar cannot contain an object/);
});
