import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { readerBibliography } from './reader-bibliography.mjs';

function fixture() {
  const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
  return { catalog: read('../knowledge/catalog.json'), literature: read('../knowledge/research/literature-map.json'), ledger: read('../knowledge/research/readings.json') };
}
const publish = f => readerBibliography(f.catalog, f.literature, f.ledger);

test('reader bibliography replaces the observed workbench view with source/citation metadata only', () => {
  const result = publish(fixture());
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.artifactKind, 'reader-bibliography');
  assert(result.sources.length && result.citations.length);
  const forbidden = new Set(['protocol', 'queries', 'gaps', 'revisions', 'discovery', 'readingStatus', 'reviewKind', 'appraisal', 'captureMethod', 'question', 'argumentSummary', 'unread', 'lastCheckedAt']);
  function inspect(value) { if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) { assert(!forbidden.has(key), key); inspect(item); } }
  inspect(result);
  assert(result.sources.every(source => typeof source.title === 'string' && typeof source.version === 'string'));
  assert(result.citations.every(citation => result.sources.some(source => source.id === citation.sourceId)));
});

test('unknown nested/private fields and draft-only sources never leak into the bibliography', () => {
  const f = fixture();
  for (const source of f.catalog.sources) {
    source.privateCapture = { raw: 'PRIVATE-CAPTURE' };
    if (source.artifact) source.artifact.privateCapture = 'PRIVATE-CAPTURE';
  }
  for (const evidence of f.catalog.evidence) {
    evidence.privatePath = 'PRIVATE-CAPTURE';
    if (evidence.numericFact) evidence.numericFact.privateCapture = 'PRIVATE-CAPTURE';
  }
  const source = { ...structuredClone(f.catalog.sources[0]), id: 'src-reader-draft', title: 'DRAFT ONLY' }; delete source.reading;
  f.catalog.sources.push(source);
  f.catalog.evidence.push({ id: 'ev-reader-draft', sourceId: source.id, locator: 'Unused passage', summary: 'DRAFT ONLY', relation: 'supports' });
  f.catalog.claims.push({ id: 'cl-reader-draft', text: 'DRAFT ONLY', kind: 'source-statement', scope: 'Unpublished', evidenceIds: ['ev-reader-draft'], premiseIds: [], conceptIds: [], caveats: [], status: 'draft', reviewedAt: null, reviewKind: 'not-reviewed' });
  const bytes = JSON.stringify(publish(f));
  assert(!bytes.includes('PRIVATE-CAPTURE'));
  assert(!bytes.includes('DRAFT ONLY'));
  assert(!bytes.includes('src-reader-draft'));
});

test('derived captures retain honest identity and citations retain their exact passage carrier', () => {
  const f = fixture(), result = publish(f);
  const derived = result.sources.find(source => source.artifact?.kind === 'derived-text');
  assert(derived);
  assert.equal(derived.artifact.originalDocumentBytesAvailable, false);
  assert.equal(derived.artifact.mediaType, 'text/plain');
  assert.match(derived.artifact.originUrl, /^https:/);
  assert(derived.artifact.captureScope);
  assert.equal(derived.artifact.captureMethod, undefined);
  const numeric = result.citations.find(citation => citation.numericFact?.subject === 'CH4-fossil');
  assert.equal(numeric.numericFact.value, '28.1');
  const passage = result.passages.find(item => item.id === numeric.passageId);
  const reading = f.ledger.readings.find(item => item.id === numeric.readingId);
  const original = reading.passages.find(item => item.id === numeric.passageId);
  assert.equal(passage.artifactId, original.artifactId);
  assert.equal(passage.artifact.sha256, reading.artifacts.find(item => item.id === original.artifactId).sha256);
  assert(result.passages.every(item => result.citations.some(citation => citation.passageId === item.id)));
});

test('signed routes and broken internal research still fail although workflow fields are not exported', () => {
  const signed = fixture(); signed.catalog.sources[0].url = 'https://example.org/original?access_token=not-public';
  assert.throws(() => publish(signed), /credentials|access tokens/);
  const origin = fixture(); origin.catalog.sources.find(source => source.artifact?.kind === 'derived-text').artifact.originUrl = 'https://example.org/original?X-Amz-Signature=not-public';
  assert.throws(() => publish(origin), /credentials|access tokens/);
  const chronology = fixture(); chronology.ledger.updatedAt = '2026-02-30';
  assert.throws(() => publish(chronology), /valid YYYY-MM-DD/);
});

test('actual export writes identical schema2 bibliography aliases and enforces the rendered HTML guard', async () => {
  const root = await mkdtemp(join(tmpdir(), 'reader-export-'));
  try {
    await mkdir(join(root, 'knowledge/research'), { recursive: true }); await mkdir(join(root, 'content'));
    await writeFile(join(root, 'knowledge/catalog.json'), JSON.stringify({ schemaVersion: 1, sources: [], evidence: [], claims: [], concepts: [], mappings: [], coverage: [] }));
    for (const name of ['literature-map', 'readings']) await writeFile(join(root, `knowledge/research/${name}.json`), 'null');
    for (const route of ['', 'docs', 'sources', 'claims', 'concepts', 'coverage', 'changes', 'print', 'research']) {
      await mkdir(join(root, 'out', route), { recursive: true }); await writeFile(join(root, 'out', route, 'index.html'), '<main>书稿</main>');
    }
    // Disposable identity fixture, matching the existing export tests; never the
    // repository under review and no remotes, branches or delivery operations.
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.org', 'commit', '--allow-empty', '-qm', 'Fixture'], { cwd: root });
    const fixtureRunner = `
      import { exportArtifacts } from ${JSON.stringify(new URL('./export.mjs', import.meta.url).href)};
      import { validateRepositoryFixture } from ${JSON.stringify(new URL('./validate.mjs', import.meta.url).href)};
      import { validateReaderOutputFixture } from ${JSON.stringify(new URL('./reader-surface.mjs', import.meta.url).href)};
      await exportArtifacts(validateRepositoryFixture, validateReaderOutputFixture);
    `;
    const run = () => execFileSync(process.execPath, ['--input-type=module', '-e', fixtureRunner], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    run();
    const current = await readFile(join(root, 'out/downloads/bibliography.json'), 'utf8');
    assert.equal(current, await readFile(join(root, 'out/downloads/research.json'), 'utf8'));
    assert.equal(JSON.parse(current).artifactKind, 'reader-bibliography');
    assert.equal(JSON.parse(current).schemaVersion, 2);
    const index = await readFile(join(root, 'out/llms.txt'), 'utf8');
    assert(index.includes('/docs/book/') && index.includes('/downloads/bibliography.json'));
    assert(!index.includes('/downloads/research.json') && !index.includes('Research register'));
    assert.equal(JSON.parse(await readFile(join(root, 'out/downloads/catalog.json'), 'utf8')).schemaVersion, 1);
    await writeFile(join(root, 'out/index.html'), '<main>研究进行中</main>');
    assert.throws(run, /Reader publication surface failed/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
