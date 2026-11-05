import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  canonicalCaseInput, caseInputSha256, caseTemplateContext, materializeCaseClaims, validateCasePublication,
} from './case-publication.mjs';
import {
  evaluateNativeExchangeCase, validateNativeExchangeCase, validateNativeExchangeFacts,
} from './native-exchange.mjs';

const directory = new URL('../knowledge/cases/', import.meta.url);
const inputFile = 'native-exchange-v1.json';
const json = url => JSON.parse(readFileSync(url, 'utf8'));
const input = () => json(new URL(inputFile, directory));
const hash = text => createHash('sha256').update(text, 'utf8').digest('hex');

test('static calculations retain exact quantities and distinguish source literals from observed output', () => {
  const { facts, observed, calculations: calc, native, scope } = evaluateNativeExchangeCase(input());
  assert.equal(facts.displayedAcenaphthene.value, '0.00000000101665');
  assert.equal(observed.treatmentAcenaphthene.exact, '0.0000000000000660819880502834');
  assert.equal(observed.treatmentAcenaphthene.fixed9, '0.000000000');
  assert.equal(observed.treatmentAcenaphthene.scientific, '6.608199e-14');
  assert.equal(calc.treatmentScale.exact, '0.000065');
  assert.equal(calc.displayedAcenDirect.exact, '0.00000000000006608225');
  assert.equal(calc.displayedAcenDirect.scientific, '6.608225e-14');
  assert.equal(calc.jrcSourceMass.exact, '1');
  assert.equal(calc.jrcSourceMass.unit, 'kg');
  assert.equal(calc.jrcOriginalMinusNativeCo2.exact, '0.0000038883076325');
  assert.equal(calc.jrcOriginalMinusNativeCo.exact, '0.000000001448307632');
  assert.equal(calc.absentMachineCo2.exact, '0.000003888307633088792972076908272198');
  assert.equal(Object.hasOwn(facts, 'jrcMachineCo'), false);
  assert.equal(Object.hasOwn(calc, 'absentMachineCo'), false);
  assert.equal(calc.jrcWeightDifferenceCo2.exact, '0.064471481632651');
  assert.equal(calc.jrcWeightDifferenceCo.exact, '0.000060724814965987');
  assert.equal(calc.jrcWeightDifferenceHydro.exact, '0.20799601458659');
  assert.equal(calc.savedGwpResiduals.none.exact, '0.00000000000000011');
  assert.equal(calc.savedGwpResiduals.economic.exact, '0.0000000000000001');
  assert.equal(calc.targetRatio.exact, '2');
  assert.equal(native.kind, 'author-derived-native-execution-summary');
  assert.equal(scope.nativeReexecutedDuringStaticBuild, false);
  assert.equal(scope.fullJrcSourceModelReproduced, false);
});

test('zero and missing factors retain different record states despite equal numeric output', () => {
  const spec = input();
  const { observed, native } = evaluateNativeExchangeCase(spec);
  const explicit = native.factorStates.find(entry => entry.state === 'explicit-zero');
  const absent = native.factorStates.find(entry => entry.state === 'absent');
  assert.equal(explicit.storedFactorRows, 1);
  assert.equal(absent.storedFactorRows, 0);
  assert.equal(explicit.numericCCell, absent.numericCCell);
  assert.equal(observed.diagnosticZero.exact, observed.diagnosticAbsent.exact);
  const exception = native.environmentalIndexException;
  const trip = native.roundTrips.find(entry => entry.id === exception.case);
  assert.equal(trip.sourceTargetKg, '0.13');
  assert.equal(trip.importedTargetKg, '0.065');
  assert.equal(trip.environmentalInputFlagsAllMatch, false);
  assert.equal(exception.sourceInput, true);
  assert.equal(exception.importInput, false);
  assert.equal(exception.sourceExchangeDirectionsChanged, false);
  assert.equal(exception.attributedToTargetChange, false);
  const replay = native.portableReplay;
  assert.equal(replay.baselineNumericComparisonsMatched, true);
  assert.equal(replay.fullJrcOriginalGasTotalsReproduced, false);
  assert.deepEqual(replay.directionLabelVariations.map(row => [row.case, row.sourceInput, row.importInput]), [
    ['jsonld-original-target', true, false],
    ['jsonld-doubled-target', true, false],
    ['eilcd-doubled-target', true, false],
  ]);
});

test('allowlisted input retains compact summary bytes and excludes nested private data', () => {
  const spec = input();
  const canonical = readFileSync(new URL(inputFile, directory), 'utf8');
  const approved = caseInputSha256(spec);
  assert.equal(canonicalCaseInput(spec), canonical);
  assert.equal(hash(JSON.stringify(spec.native.summary)), spec.native.summarySha256);
  const reorder = (_, value) => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).reverse()) : value;
  const reordered = JSON.parse(JSON.stringify(spec, reorder));
  assert.deepEqual(validateNativeExchangeCase(reordered), []);
  assert.equal(caseInputSha256(reordered), approved);

  spec.carriers[0].localPath = '/private/tutorial.pdf';
  spec.facts[0].rawRecord = { forbidden: true };
  spec.native.summary.workflows[0].privateReceipt = '/private/receipt.json';
  spec.native.summary.environmentalIndexException.rawExchanges = [{ amount: '1' }];
  spec.native.summary.factorStates[0].unpublishedMethod = { hidden: 'artifact' };
  spec.native.summary.portableReplay.directionLabelVariations[0].privateRecord = { hidden: true };
  assert.equal(canonicalCaseInput(spec), canonical);
  assert.equal(caseInputSha256(spec), approved);
  assert.doesNotMatch(JSON.stringify(caseTemplateContext(spec)), /privateReceipt|rawExchanges|unpublishedMethod|privateRecord|\/private\//);

  // Adding a case does not change the canonical hashes of the registered legacy inputs.
  for (const file of readdirSync(directory).filter(file => file.endsWith('.publication.json'))) {
    const publication = json(new URL(file, directory));
    if (publication.inputFile === inputFile) continue;
    assert.equal(caseInputSha256(json(new URL(publication.inputFile, directory))), publication.approvedInputSha256, file);
  }
});

test('a matching new summary hash cannot authorize changed receipts, quantities or qualification flags', () => {
  for (const mutate of [
    spec => { spec.native.summary.workflows[0].receiptSha256 = '0'.repeat(64); },
    spec => { spec.native.summary.observations.find(entry => entry.id === 'treatmentAcenaphthene').value = '0'; },
    spec => { spec.native.summary.factorStates.find(entry => entry.state === 'explicit-zero').storedFactorRows = 0; },
    spec => { spec.native.summary.roundTrips.find(entry => entry.id === 'eilcd-doubled-target').importedTargetKg = '0.13'; },
    spec => { spec.native.summary.environmentalIndexException.attributedToTargetChange = true; },
    spec => { spec.native.summary.baselineComparison.jrcOriginalGasTotalsReproduced = true; },
    spec => { spec.native.summary.portableReplay.directionLabelVariations.shift(); },
    spec => { spec.native.summary.portableReplay.jsonProcessRecordsMatchApartFromMigrationLastChange = false; },
    spec => { spec.controls.automaticLinkRebuilding = true; },
    spec => { spec.scope.nativeReexecutedDuringStaticBuild = true; },
    spec => { spec.scope.fullJrcSourceModelReproduced = true; },
  ]) {
    const spec = input();
    mutate(spec);
    spec.native.summarySha256 = hash(JSON.stringify(spec.native.summary));
    assert.throws(() => caseInputSha256(spec), /exact reviewed native-exchange v1 input required/);
  }
});

function fixture() {
  const spec = input();
  const actual = json(new URL('../knowledge/catalog.json', import.meta.url));
  const readingRegister = json(new URL('../knowledge/research/readings.json', import.meta.url));
  const evidenceIds = spec.passages.map(row => row.evidenceId);
  const sourceIds = spec.sources.map(row => row.sourceId);
  const publication = {
    schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile,
    approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-06', reviewKind: 'agent-source-check',
    claims: [{
      id: 'test-native-exchange-closure', kind: 'interpretation', scope: 'Fixture for the registered validator.',
      textTemplate: '{{evaluated.facts.disposedReference.value}} kg; {{evaluated.calculations.displayedAcenDirect.scientific}} kg.',
      evidenceIds, premiseIds: [], conceptIds: [], caveats: [],
    }],
  };
  const catalog = {
    schemaVersion: 1, sources: actual.sources.filter(row => sourceIds.includes(row.id)),
    evidence: actual.evidence.filter(row => evidenceIds.includes(row.id)),
    claims: materializeCaseClaims(spec, publication), concepts: [], mappings: [], coverage: [],
  };
  return { spec, publication, catalog, context: { readingRegister } };
}

const errors = f => validateCasePublication(f.spec, f.publication, f.catalog, f.context).join('\n');
const evidence = (f, id) => f.catalog.evidence.find(row => row.id === id);
const reading = (f, id) => f.context.readingRegister.readings.find(row => row.id === id);
const source = (f, id) => f.catalog.sources.find(row => row.id === id);

test('registered publication requires actual public evidence and exact artifact, version and passage identity', () => {
  const original = fixture();
  assert.equal(original.catalog.claims[0].text, '0.06500 kg; 6.608225e-14 kg.');
  assert.equal(errors(original), '');
  assert.match(validateNativeExchangeFacts(original.spec, original.catalog).join('\n'), /actual reading register required/);

  const outside = fixture();
  const claim = outside.publication.claims[0];
  const archiveEvidence = 'ev-kb50-jrc-archive';
  claim.evidenceIds = claim.evidenceIds.filter(id => id !== archiveEvidence);
  outside.catalog.claims = materializeCaseClaims(outside.spec, outside.publication);
  assert.ok(evidence(outside, archiveEvidence));
  assert.match(errors(outside), /passages\.ev-kb50-jrc-archive:/);

  const edition = fixture();
  source(edition, 'src-kb50-jrc-model').version = 'A different source edition';
  assert.match(errors(edition), /sources\.src-kb50-jrc-model:/);

  const report = fixture();
  const backupReading = reading(report, 'rd-kb50-bottle-backup');
  const reportPassage = backupReading.passages.find(row => row.id === 'psg-kb50-bottle-backup-report');
  reportPassage.artifactId = 'art-kb50-bottle-backup';
  assert.match(errors(report), /passages\.ev-kb50-bottle-backup-report:/);

  const pdf = fixture();
  reading(pdf, 'rd-kb50-bottle-tutorial').passages
    .find(row => row.id === 'psg-kb50-bottle-acenaphthene').pdfIndices = [39];
  assert.match(errors(pdf), /passages\.ev-kb50-bottle-acenaphthene:/);

  const archive = fixture();
  const carrier = reading(archive, 'rd-kb50-jrc-sdk').artifacts.find(row => row.id === 'art-kb50-jrc-sdk');
  carrier.sha256 = '0'.repeat(64);
  assert.match(errors(archive), /native\.jrc-calc-02: exact inspected workflow input archive required/);

  const duplicate = fixture();
  const sdkReading = reading(duplicate, 'rd-kb50-jrc-sdk');
  sdkReading.artifacts.push(structuredClone(sdkReading.artifacts.find(row => row.id === 'art-kb50-jrc-model')));
  assert.match(errors(duplicate), /carriers\.art-kb50-jrc-model:/);
});

test('a source fact must keep its entire tuple and stable identity in the public closure', () => {
  for (const field of ['id', 'value', 'unit', 'quantity', 'subject', 'basis']) {
    const f = fixture();
    const row = evidence(f, 'ev-kb50-jrc-process-machine').numericFacts
      .find(row => row.id === 'machine-fossil-co2');
    row[field] = field === 'value' ? '0.972076908272199' : 'different-value';
    assert.match(errors(f), /facts\.jrcMachineCo2: exact public fact/, field);
  }
});
