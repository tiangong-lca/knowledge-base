import assert from 'node:assert/strict';
import test from 'node:test';
import { editionDigest, matchesAcceptedFile, matchesAcceptedRecord, qualifyReadableBookEdition, readableBookReviewSubject, sha256 } from './reader-current-edition.mjs';

const key = 'content/docs/book/sample.mdx';
const input = 'knowledge/cases/sample-v1.json';
const previousClaim = { id: 'cl-first', text: '前版内容。' };
const revisedClaim = { id: 'cl-first', text: '修订内容。' };
const fingerprint = row => ({ raw: editionDigest(row), public: editionDigest(row), protected: editionDigest({ id: row.id }) });
const previous = fingerprint(previousClaim);
const revised = fingerprint(revisedClaim);
const baseline = {
  files: { [key]: editionDigest('old'), [input]: editionDigest('fixed') },
  fixedFiles: [input],
  records: { 'claims:cl-first': previous },
  dependencies: { 'cl-first': ['cl-old-consumer'] },
  publishedClaims: ['cl-first', 'cl-old-consumer'],
};
const actual = {
  files: { ...baseline.files, [key]: editionDigest('current') },
  records: { 'claims:cl-first': revised },
  dependencies: { 'cl-first': ['cl-new-consumer'] },
  publishedClaims: ['cl-first', 'cl-new-consumer'],
};
const baselineDigest = editionDigest(baseline);
const unit = {
  id: 'chapter',
  status: 'reviewed',
  scope: [key, 'claims:cl-first'],
  rationale: 'Reader sequence and source check',
  changes: [
    { kind: 'file', key, from: baseline.files[key], to: actual.files[key], rationale: 'Actual manuscript' },
    { kind: 'record', key: 'claims:cl-first', from: previous, to: revised, rationale: 'Selected source checked' },
  ],
  consumers: [{ id: 'cl-old-consumer', rationale: 'Earlier use checked' }, { id: 'cl-new-consumer', rationale: 'New use checked' }],
  outputs: [{ path: '/docs/book/sample', route: '/docs/book/sample', sha256: '3'.repeat(64) }],
};

function attest(candidate) {
  const artifacts = new Map();
  const reviewEvidence = ['source', 'reader', 'output'].map(kind => {
    const date = '2026-11-12', folder = '_docs/editorial/review-evidence/chapter/';
    const artifactFile = folder + kind + '-artifact.json', reportFile = folder + kind + '-report.json';
    const identity = { schemaVersion: 1, kind, unit: candidate.id, subjectSha256: readableBookReviewSubject(candidate, kind), date };
    const artifact = JSON.stringify({ ...identity, scope: candidate.scope, observed: 'Test-only observed artifact' });
    const artifactSha256 = sha256(artifact);
    const report = JSON.stringify({ ...identity, artifactSha256, disposition: 'accepted',
      reviewer: 'Test fixture', provenance: 'Synthetic in-memory test', findings: 'Test-only evidence' });
    artifacts.set(artifactFile, artifact);
    artifacts.set(reportFile, report);
    return { kind, date, artifactFile, reportFile, artifactSha256, reportSha256: sha256(report) };
  });
  return { candidate: { ...candidate, reviewEvidence }, artifacts };
}

const fixed = attest(unit);
const verify = (units = [unit], state = actual, pins, artifactsOverride) => {
  const results = units.map(candidate => candidate.reviewEvidence ? { candidate, artifacts: fixed.artifacts } : attest(candidate));
  const prepared = results.map(row => row.candidate);
  const artifacts = artifactsOverride ?? new Map(results.flatMap(row => [...row.artifacts]));
  return qualifyReadableBookEdition(baseline, baselineDigest,
    { schemaVersion: 1, baselineDigest, status: 'reviewed', units: prepared },
    pins ?? Object.fromEntries(prepared.map(row => [row.id, editionDigest(row)])), state, artifacts);
};

test('approved raw and public record and file expectations resolve only exact successors', () => {
  const current = verify();
  assert.deepEqual(current.errors, []);
  assert(matchesAcceptedRecord(current, 'claims', previousClaim, revisedClaim));
  assert(matchesAcceptedRecord(current, 'claims', previousClaim, revisedClaim, 'public'));
  assert(!matchesAcceptedRecord(current, 'claims', { ...previousClaim, text: 'another predecessor' }, revisedClaim));
  assert(!matchesAcceptedRecord(current, 'claims', previousClaim, { ...revisedClaim, text: 'altered' }));
  assert(matchesAcceptedFile(current, key, baseline.files[key], actual.files[key]));
  assert(!matchesAcceptedFile(current, input, baseline.files[key], actual.files[key]));
});

test('pending, absent, altered or co-deleted acceptance cannot admit changed actual content', () => {
  assert.throws(() => verify([{ ...unit, status: 'pending' }]), /not independently accepted/);
  assert.throws(() => verify([unit], actual, {}), /not independently accepted/);
  assert.throws(() => verify([{ ...unit, rationale: 'replaced' }], actual, { chapter: editionDigest(fixed.candidate) }), /not independently accepted/);
  assert(verify([], actual).errors.some(error => error.includes('unaccepted file')));
  assert.throws(() => verify([], actual, { chapter: editionDigest(fixed.candidate) }), /missing pinned unit/);
  assert(verify([], { ...baseline, files: {} }).errors.some(error => error.includes(input)));
});

test('both dependency graphs, reviewed artifacts and the immutable input are independently required', () => {
  assert.throws(() => verify([{ ...unit, consumers: unit.consumers.slice(1) }]), /missing or extraneous/);
  assert.throws(() => verify([{ ...unit, reviewEvidence: fixed.candidate.reviewEvidence.slice(1) }]), /review evidence/);
  const wrong = { ...unit, scope: [...unit.scope, input], changes: [
    ...unit.changes, { kind: 'file', key: input, from: baseline.files[input], to: 'changed', rationale: 'alteration' },
  ] };
  assert.throws(() => verify([wrong]), /immutable change/);
  const forgedPredecessor = { ...unit, changes: unit.changes.map(row => ({ ...row, from: null })) };
  assert.throws(() => verify([forgedPredecessor]), /stale predecessor/);
});

test('review evidence cannot replay stale subjects or claim nonexistent content', () => {
  assert.throws(() => verify([fixed.candidate], actual, undefined, new Map()), /review evidence/);
  assert.throws(() => verify([{ ...fixed.candidate, rationale: 'Another exact subject' }]), /review evidence/);
  const changed = new Map(fixed.artifacts);
  const file = fixed.candidate.reviewEvidence[0].artifactFile;
  changed.set(file, changed.get(file).replace('observed artifact', 'changed artifact'));
  assert.throws(() => verify([fixed.candidate], actual, undefined, changed), /review evidence/);
  assert.throws(() => verify([{ ...unit, readingEntries: [key] }]), /unscoped current reading entry/);
  assert.throws(() => verify([{ ...unit, layouts: [{ key, from: editionDigest(false), to: true }] }]), /invalid layout amendments/);
});

test('research-only changes bind their linked publications and actual public artifacts', async () => {
  const { readFile } = await import('node:fs/promises');
  const { inspectReadableBookEdition } = await import('./reader-current-edition.mjs');
  const { validateReadableBookReviewedOutput, validateReadableBookPublicArtifacts } = await import('./reader-current-output.mjs');
  const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
  const [catalog, readings, literature] = await Promise.all([
    read('knowledge/catalog.json'), read('knowledge/research/readings.json'), read('knowledge/research/literature-map.json'),
  ]);
  const inspect = value => inspectReadableBookEdition({ catalog, readings, literature: value, files: new Map() });
  const old = inspect(literature), modified = structuredClone(literature);
  const record = modified.records.find(row => row.id === 'lit-b01');
  record.contributors = [...record.contributors, 'Unreviewed insertion'];
  modified.gaps.pop();
  modified.protocol.limitations = [...modified.protocol.limitations, 'Unreviewed protocol change'];
  const changed = inspect(modified);
  assert.notDeepEqual(old.records['literature:lit-b01'], changed.records['literature:lit-b01']);
  assert.notDeepEqual(old.records['researchMetadata:literature-protocol'], changed.records['researchMetadata:literature-protocol']);
  assert.equal(Object.keys(old.records).length, Object.keys(changed.records).length + 1);
  assert(record.catalogSourceIds.every(id => changed.dependencies['lit-b01'].includes(id)));
  const current = {
    changes: { file: new Map(), record: new Map([['literature:lit-b01', {}]]) },
    outputs: new Map(), publicArtifacts: new Map(), researchChanged: true,
  };
  assert.match(validateReadableBookReviewedOutput(current, new Map(), new Map(), { units: [] }, catalog)[0], /actual output documents/);
  const errors = await validateReadableBookPublicArtifacts('/unused', current);
  for (const path of ['research/index.html', 'downloads/bibliography.json', 'downloads/research.json']) {
    assert(errors.some(error => error.includes(path)));
  }
});

test('reordering the source register changes the frozen ordered and public projections', async () => {
  const { readFile } = await import('node:fs/promises');
  const { inspectReadableBookEdition } = await import('./reader-current-edition.mjs');
  const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
  const [catalog, readings, literature] = await Promise.all([
    read('knowledge/catalog.json'), read('knowledge/research/readings.json'), read('knowledge/research/literature-map.json'),
  ]);
  const inspect = value => inspectReadableBookEdition({ catalog: value, readings, literature, files: new Map() });
  const previous = { ...inspect(catalog), fixedFiles: [] }, nextCatalog = structuredClone(catalog);
  [nextCatalog.sources[0], nextCatalog.sources[1]] = [nextCatalog.sources[1], nextCatalog.sources[0]];
  const next = inspect(nextCatalog), baselineDigest = editionDigest(previous);
  const pending = { schemaVersion: 1, baselineDigest, status: 'pending', units: [] };
  const { errors } = qualifyReadableBookEdition(previous, baselineDigest, pending, {}, next);
  assert(errors.some(error => error.includes('researchMetadata:order:sources')));
  assert(errors.some(error => error.includes('researchMetadata:public-projection')));
});

test('a pinned old research page still fails current passage projection', async () => {
  const { default: parser } = await import('next/dist/compiled/node-html-parser/index.js');
  const { validateReadableBookResearchOutput } = await import('./reader-current-output.mjs');
  const html = '<main id="main-content"><article class="source-record" id="src-fixture"><span id="lit-fixture"></span><span id="rd-fixture"></span><h2><a href="/source">书目</a></h2><p>出版者。版本。</p><details><ul><li id="psg-fixture">原页码</li></ul></details></article></main>';
  const published = { sources: [{ id: 'src-fixture', title: '书目', publisher: '出版者', version: '版本', url: '/source', reading: { readingId: 'rd-fixture' } }] };
  const literature = { records: [{ id: 'lit-fixture' }] };
  const ledger = { readings: [{ id: 'rd-fixture', workId: 'lit-fixture', passages: [{ id: 'psg-fixture', locator: '原页码' }] }] };
  const document = parser.parse(html);
  assert.deepEqual(validateReadableBookResearchOutput(document, published, literature, ledger), []);
  ledger.readings[0].passages[0].locator = '新页码';
  assert.match(validateReadableBookResearchOutput(document, published, literature, ledger)[0], /current locators/);
});

test('the actual adopted source is independently qualified and a changed reviewed paragraph is refused', async () => {
  const { fileURLToPath } = await import('node:url');
  const { readFile } = await import('node:fs/promises');
  const { validateRepository } = await import('./validate.mjs');
  const { validateReadableBookCurrent } = await import('./reader-current-edition-files.mjs');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
  assert.deepEqual(await validateRepository(root), []);
  const [acceptance, copyedit, catalog, readings, literature] = await Promise.all([
    read('config/readable-book-current.json'), read('config/reader-copyedit-current.json'), read('knowledge/catalog.json'),
    read('knowledge/research/readings.json'), read('knowledge/research/literature-map.json'),
  ]);
  assert.equal(acceptance.status, 'reviewed');
  const currentChanges = copyedit.status === 'reviewed' ? copyedit.unit.changes : acceptance.units.flatMap(unit => unit.changes);
  const changed = currentChanges
    .find(row => row.kind === 'record' && row.key.startsWith('claims:') && row.from !== null);
  assert(changed, 'the actual edition contains a reviewed change to an existing paragraph');
  const id = changed.key.slice('claims:'.length);
  const claim = catalog.claims.find(row => row.id === id);
  assert(claim);
  claim.text += '未受审的补充。';
  const rejection = copyedit.status === 'reviewed'
    ? 'Reader copyedit successor differs from actual source'
    : 'stale predecessor, missing successor or mismatched result';
  await assert.rejects(validateReadableBookCurrent(root, catalog, readings, literature), error =>
    error.message.includes(rejection) && error.message.includes(changed.key));
});
