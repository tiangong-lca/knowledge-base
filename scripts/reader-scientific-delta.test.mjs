import assert from 'node:assert/strict';
import test from 'node:test';
import { editionDigest, readableBookReviewSubject, sha256 } from './reader-current-edition.mjs';
import { exactPublicJsonReceipt, restoreScientificRecords, observeScientificRawChanges,
  mergeScientificFileAndRecordChanges } from './reader-scientific-delta.mjs';

function records() {
  return {
    catalog: { claims: [], evidence: [], sources: [], concepts: [], mappings: [], coverage: [] },
    readings: { updatedAt: '2026-11-14', readings: [], gaps: [], revisions: [] },
    literature: { updatedAt: '2026-11-14', protocol: { queries: [] }, records: [], gaps: [] },
  };
}

const fingerprint = row => row === null ? null : { raw: editionDigest(row) };
const transition = (from, to) => ({ from: fingerprint(from), to: fingerprint(to) });

test('sparse scientific rollback reconstructs old raw catalog, ledger and bibliography exactly', () => {
  const old = records();
  const reading = { id: 'old-reading', workId: 'original-work', readAt: '2026-11-14',
    artifacts: [{ id: 'artifact-1' }], passages: [{ id: 'passage-1', pages: [7] }] };
  old.readings.readings.push(reading);
  const actual = structuredClone(old);
  actual.readings.readings[0].passages.push({ id: 'passage-2', pages: [10] });
  actual.catalog.claims.push({ id: 'new-claim', text: 'New scientific explanation' });
  actual.literature.protocol.queries.push({ id: 'new-query', text: 'Bounded discovery' });
  actual.literature.updatedAt = '2026-11-15';
  const { rawRecords, rawFields } = observeScientificRawChanges(old, actual);
  const changes = new Map([
    ['readings:old-reading', transition(reading, actual.readings.readings[0])],
    ['claims:new-claim', transition(null, actual.catalog.claims[0])],
    ['queries:new-query', transition(null, actual.literature.protocol.queries[0])],
  ]);
  assert.deepEqual(restoreScientificRecords(actual, rawRecords, rawFields, changes, () => true), old);
  assert.throws(() => restoreScientificRecords(actual, rawRecords.slice(1), rawFields, changes, () => true), /lacks the exact raw record/);

  actual.readings.readings[0].passages[0].pages = [8];
  changes.set('readings:old-reading', transition(reading, actual.readings.readings[0]));
  assert.throws(() => restoreScientificRecords(actual, rawRecords, rawFields, changes, () => true), /changed a previous passages entry/);
  actual.readings.readings[0].passages[0].pages = [7];
  actual.readings.readings[0].artifacts[0].id = 'substituted-carrier';
  changes.set('readings:old-reading', transition(reading, actual.readings.readings[0]));
  assert.throws(() => restoreScientificRecords(actual, rawRecords, rawFields, changes, () => true), /changed a previous artifacts entry/);
});

test('public JSON receipt preserves exact current bytes independently of content digest', () => {
  const bytes = '{"output":"结果"}\n', sha = sha256(bytes);
  const receipt = { sha256: sha, contentSha256: sha, bytes: Buffer.byteLength(bytes) };
  assert(exactPublicJsonReceipt(receipt, bytes));
  assert(!exactPublicJsonReceipt({ ...receipt, bytes: bytes.length }, bytes));
  assert(!exactPublicJsonReceipt({ ...receipt, sha256: '0'.repeat(64) }, bytes));
  assert(!exactPublicJsonReceipt(receipt, '{"output":"结果不同"}\n'));
});

test('chained file and record expectations retain every original predecessor', () => {
  const file = new Map([['shared', { from: 'original', intermediate: 'prior', to: 'accepted' }]]);
  const plan = { changes: { file, record: new Map() } };
  const candidate = { changes: [{ kind: 'file', key: 'shared', from: 'accepted', to: 'current' }] };
  assert.deepEqual(mergeScientificFileAndRecordChanges(plan, candidate).file.get('shared').predecessors,
    ['original', 'prior', 'accepted']);
  candidate.changes[0].from = 'incorrect';
  assert.throws(() => mergeScientificFileAndRecordChanges(plan, candidate), /does not continue the accepted state/);
});

test('preserved export provenance binds only the output review subject', () => {
  const unit = { id: 'scientific-example', scope: ['manuscript'], outputs: [], publicArtifacts: [] };
  const before = { ...unit, outputCapture: { sourceCommit: '1'.repeat(40), dirty: true } };
  const after = { ...unit, outputCapture: { ...before.outputCapture, dirty: false } };
  for (const kind of ['reader', 'source']) {
    assert.equal(readableBookReviewSubject(before, kind), readableBookReviewSubject(unit, kind));
    assert.equal(readableBookReviewSubject(after, kind), readableBookReviewSubject(unit, kind));
  }
  assert.notEqual(readableBookReviewSubject(before, 'output'), readableBookReviewSubject(after, 'output'));
});
