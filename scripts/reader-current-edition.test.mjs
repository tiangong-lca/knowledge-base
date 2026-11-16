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
  const { validateReadableBookCurrent, validateServiceConstraintsReviewSources, validateSubstitutionRulesReviewSources, validateLoadShiftReviewSources, validateCircularFootprintReviewSources, validateLandRecoveryReviewSources, validateAcidEquivalentsReviewSources, validateMineralResourcesReviewSources, validateFossilResourcesReviewSources, validatePhotochemicalOzoneReviewSources } = await import('./reader-current-edition-files.mjs');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
  const serviceConstraints = await read('config/reader-service-constraints.json');
  const substitutionRules = await read('config/reader-substitution-rules.json');
  const loadShift = await read('config/reader-load-shift.json');
  const footprint = await read('config/reader-circular-footprint.json');
  const land = await read('config/reader-land-recovery.json');
  const acid = await read('config/reader-acid-equivalents.json');
  const minerals = await read('config/reader-mineral-resources.json');
  const fossils = await read('config/reader-fossil-resources.json');
  const ozone = await read('config/reader-photochemical-ozone.json');
  const privateOzone = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && ozone.status === 'preview';
  const privateFossils = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && fossils.status === 'preview';
  const privateMinerals = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && minerals.status === 'preview';
  const privateAcid = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && acid.status === 'preview';
  const privateLand = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && land.status === 'preview';
  const privateFootprint = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && footprint.status === 'preview';
  const privateLoadShift = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && loadShift.status === 'preview';
  const privateService = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && serviceConstraints.status === 'preview';
  const privateSubstitution = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && substitutionRules.status === 'preview';
  if (privateService || privateSubstitution || privateLoadShift || privateFootprint || privateLand || privateAcid || privateMinerals || privateFossils || privateOzone) {
    const name = privateOzone ? 'Photochemical ozone' : privateFossils ? 'Fossil resources' : privateMinerals ? 'Mineral resources' : privateAcid ? 'Acid equivalents' : privateLand ? 'Land recovery' : privateFootprint ? 'Circular footprint' : privateLoadShift ? 'Load shift' : privateService ? 'Service constraints' : 'Substitution rules';
    assert((await validateRepository(root)).includes(`${name} is not independently accepted`));
  } else assert.deepEqual(await validateRepository(root), []);
  const [acceptance, copyedit, catalog, readings, literature] = await Promise.all([
    read('config/readable-book-current.json'), read('config/reader-copyedit-current.json'), read('knowledge/catalog.json'),
    read('knowledge/research/readings.json'), read('knowledge/research/literature-map.json'),
  ]);
  assert.equal(acceptance.status, 'reviewed');
  const qualify = privateOzone ? validatePhotochemicalOzoneReviewSources : privateFossils ? validateFossilResourcesReviewSources : privateMinerals ? validateMineralResourcesReviewSources : privateAcid ? validateAcidEquivalentsReviewSources : privateLand ? validateLandRecoveryReviewSources : privateFootprint ? validateCircularFootprintReviewSources : privateLoadShift ? validateLoadShiftReviewSources : privateSubstitution ? validateSubstitutionRulesReviewSources
    : privateService ? validateServiceConstraintsReviewSources : validateReadableBookCurrent;
  if (privateService || privateSubstitution || privateLoadShift || privateFootprint || privateLand || privateAcid || privateMinerals || privateFossils || privateOzone) assert.deepEqual((await qualify(root, catalog, readings, literature)).errors, []);
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
  await assert.rejects(qualify(root, catalog, readings, literature), error => {
    if (privateOzone || ozone.status === 'reviewed') {
      return error.message === 'Photochemical ozone did not recover the independently observed raw 13064f9 state';
    }
    if (privateFossils || fossils.status === 'reviewed') {
      return error.message === 'Fossil resources did not recover the independently observed raw ba8a101 state';
    }
    if (privateMinerals || minerals.status === 'reviewed') {
      return error.message === 'Mineral resources did not recover the independently observed raw 607381d state';
    }
    if (privateAcid || acid.status === 'reviewed') {
      return error.message === 'Acid equivalents did not recover the independently observed raw 5c71ee4 state';
    }
    if (privateLand || land.status === 'reviewed') {
      return error.message === 'Land recovery did not recover the independently observed raw 30f934a state';
    }
    if (privateFootprint || footprint.status === 'reviewed') {
      return error.message === 'Circular footprint did not recover the independently observed raw b7d8cd1 state';
    }
    if (privateLoadShift || loadShift.status === 'reviewed') {
      return error.message === 'Load shift did not recover the independently observed raw 11e2978 state';
    }
    if (privateSubstitution || substitutionRules.status === 'reviewed') {
      return error.message === 'Substitution rules did not reconstruct the independently observed raw f8751d5 state';
    }
    if (serviceConstraints.status === 'reviewed') {
      // This one change also invalidates the current reviewed public catalog.
      return error.message === 'Service constraints lacks exact independent source, reader, and output evidence';
    }
    return error.message.includes(rejection) && error.message.includes(changed.key);
  });
});
