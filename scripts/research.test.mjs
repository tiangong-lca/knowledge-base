import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateResearch, publicResearch } from './research.mjs';
import { validateRepository } from './validate.mjs';

function fixture() {
  const date = '2026-11-04';
  const pdf = { id: 'art-pdf', mediaType: 'application/pdf', sha256: 'a'.repeat(64), resolvedUrl: 'https://example.org/original.pdf', pageCount: 3 };
  const html = { id: 'art-html', mediaType: 'text/html', sha256: 'b'.repeat(64), resolvedUrl: 'https://example.org/sections', blockCount: 4 };
  const passage = { id: 'psg-pdf', artifactId: pdf.id, locator: 'Section 2', topics: ['scope'], limits: ['Selected paragraphs only.'], pdfIndices: [0, 2] };
  const reading = { id: 'rd-one', workId: 'work-alias', title: 'Original report, part I', version: '2001 report, not 2002 book', url: pdf.resolvedUrl,
    accessedAt: date, readAt: date, readingStatus: 'selected-passages', question: 'What scope is stated?', argumentSummary: 'Bounded source interpretation.',
    artifacts: [pdf, html], passages: [passage, { id: 'psg-html', artifactId: html.id, locator: 'Original sections', topics: ['limits'], limits: [], nepisBlocks: [3] }],
    appraisal: { basis: 'Original selected passages', methodologicalScope: 'Historical guide only', independence: 'Two carriers of one report', limitations: ['Not a full read'], reviewKind: 'agent-source-check', checkedAt: date },
    rights: 'Third-party rights retained.', unread: ['Remaining chapters.'] };
  const work = { id: 'lit-one', workId: 'work-alias', title: 'Original report', contributors: 'Institution', year: '2001', kind: 'report', goalSeedIds: ['B01'],
    urls: [{ url: pdf.resolvedUrl, role: 'original institutional report' }], identifiers: {}, volumes: ['V2'], topics: ['scope'], languages: ['en'], regions: ['international'], traditions: ['institutional guide'],
    discovery: { queryIds: ['q-one'], reason: 'Original identified from a reference.', citationParents: [] }, identityStatus: 'verified', accessStatus: 'public-fulltext-available',
    readingStatus: 'not-close-read', accessedAt: date, lastCheckedAt: date, rights: 'No source redistribution.', limitations: ['Discovery only.'], catalogSourceIds: ['src-one'] };
  const literature = { schemaVersion: 1, updatedAt: date, protocol: { id: 'protocol', questions: ['Which original?'], sourcesPolicy: 'Official originals only.', queries: [{ id: 'q-one', query: 'exact original title', date, channel: 'public-web-search' }], limitations: ['Bounded search.'] }, records: [work], gaps: [] };
  const readings = { schemaVersion: 1, updatedAt: date, readings: [reading], revisions: [{ id: 'rev-one', triggerPassageIds: [passage.id], before: 'Earlier framing', after: 'Bounded framing', reasoning: 'The selected text requires a qualification.', affectedUnits: ['V2'], status: 'proposed' }], gaps: [] };
  const { id: artifactId, ...snapshot } = pdf;
  const catalog = { sources: [{ id: 'src-one', url: pdf.resolvedUrl, accessedAt: date, accessStatus: 'public-passages-inspected', artifact: snapshot, reading: { status: 'selected-passages', scope: 'Section 2', checkedAt: date, readingId: reading.id } }], evidence: [{ id: 'ev-one', sourceId: 'src-one', readingId: reading.id, passageId: passage.id }] };
  return { literature, readings, catalog };
}
const errors = f => validateResearch(f.literature, f.readings, f.catalog);
function rejects(change, pattern) {
  const f = fixture(); change(f); const result = errors(f);
  assert(result.some(error => pattern.test(error)), `Expected ${pattern}; got:\n${result.join('\n')}`);
}

test('valid selected passages preserve discovery state, work alias and separate HTML/PDF carriers', () => {
  const f = fixture(); f.catalog.evidence[0].passageId = 'psg-html';
  assert.deepEqual(errors(f), []);
  f.literature.records[0].catalogSourceIds = [];
  assert.deepEqual(errors(f), []); // An unpopulated optional join is legitimate.
});

test('legacy catalogs need no research bindings or new register files', () => {
  assert.deepEqual(validateResearch(undefined, undefined, { sources: [{ id: 'legacy-source' }], evidence: [] }), []);
  rejects(f => { f.literature = undefined; f.readings = undefined; }, /research records or bindings/);
});

test('duplicate IDs and alias collisions cannot hide distinct works or carriers', () => {
  rejects(f => f.literature.records.push(structuredClone(f.literature.records[0])), /duplicate ID/);
  rejects(f => f.readings.readings.push(structuredClone(f.readings.readings[0])), /duplicate ID/);
  rejects(f => f.readings.readings[0].artifacts.push(structuredClone(f.readings.readings[0].artifacts[0])), /duplicate ID art-pdf/);
  rejects(f => f.readings.readings[0].passages.push(structuredClone(f.readings.readings[0].passages[0])), /duplicate ID psg-pdf/);
  rejects(f => f.literature.records.push({ ...structuredClone(f.literature.records[0]), id: 'lit-two', goalSeedIds: [], workId: 'work-alias' }), /work alias collision/);
  rejects(f => f.literature.records[0].workId = 'q-one', /unknown literature-map work/);
  rejects(f => f.literature.records.push({ ...structuredClone(f.literature.records[0]), id: 'lit-two', workId: 'lit-one', goalSeedIds: [] }), /work alias collision/);
});

test('unknown query, citation, seed reuse and work references are rejected', () => {
  rejects(f => f.literature.records[0].discovery.queryIds = ['missing'], /unknown reference missing/);
  rejects(f => f.literature.records[0].discovery.citationParents = ['missing'], /unknown reference missing/);
  rejects(f => f.literature.records[0].discovery.citationParents = ['lit-one'], /must not cite itself/);
  rejects(f => f.readings.readings[0].workId = 'missing-work', /unknown literature-map work/);
  rejects(f => f.literature.records.push({ ...structuredClone(f.literature.records[0]), id: 'lit-two', workId: 'other-alias' }), /seed B01 occurs in more than one record/);
});

test('calendar dates and chronology cannot inflate access or review recency', () => {
  rejects(f => f.literature.records[0].accessedAt = '2026-02-30', /valid YYYY-MM-DD/);
  rejects(f => f.literature.records[0].lastCheckedAt = '2026-11-05', /must not follow/);
  rejects(f => f.readings.readings[0].readAt = '2026-11-03', /must not precede access/);
  rejects(f => f.readings.readings[0].appraisal.checkedAt = '2026-11-03', /must not precede reading/);
  rejects(f => f.literature.protocol.queries[0].date = '2026-11-05', /must not follow/);
});

test('unsupported close-read upgrades and metadata-only passage evidence fail closed', () => {
  rejects(f => f.literature.records[0].readingStatus = 'full-book-read', /discovery records must remain not-close-read/);
  rejects(f => f.readings.readings[0].readingStatus = 'full-text-inspected', /unsupported reading upgrade/);
  rejects(f => f.readings.readings[0].readingStatus = 'metadata-only', /cannot contain inspected passages/);
  rejects(f => f.readings.readings[0].passages = [], /selected reading needs actual located passages/);
  rejects(f => f.catalog.sources[0].accessStatus = 'metadata-only', /cannot bind inspected reading/);
  rejects(f => f.catalog.sources[0].accessStatus = 'public-full-text-inspected', /does not establish full-text inspection/);
});

test('SHA and source snapshot mismatches cannot silently rebind source content', () => {
  rejects(f => f.readings.readings[0].artifacts[0].sha256 = 'not-a-digest', /SHA-256 hex digest/);
  rejects(f => f.catalog.sources[0].artifact.sha256 = 'c'.repeat(64), /does not match any artifact/);
  rejects(f => f.catalog.sources[0].artifact.pageCount = 99, /must match the same bound artifact identity/);
  rejects(f => f.catalog.sources[0].artifact.resolvedUrl = 'https://example.org/other.pdf', /must match the same bound artifact identity/);
  rejects(f => delete f.catalog.sources[0].artifact, /needs its artifact snapshot/);
});

test('zero-based PDF indices require the correct bounded carrier', () => {
  for (const value of [-1, 3, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    rejects(f => f.readings.readings[0].passages[0].pdfIndices = [value], /nonnegative safe integers|outside artifact/);
  }
  rejects(f => f.readings.readings[0].passages[0].pdfIndices = [0, 0], /duplicate index/);
  rejects(f => delete f.readings.readings[0].artifacts[0].pageCount, /PDF page bounds are required/);
  rejects(f => f.readings.readings[0].passages[0].artifactId = 'art-html', /requires a application\/pdf/);
  rejects(f => f.readings.readings[0].passages[0].artifactId = 'missing-artifact', /unknown artifact/);
  rejects(f => f.readings.readings[0].passages[1].nepisBlocks = [4], /outside artifact blockCount/);
  const f = fixture(); delete f.readings.readings[0].artifacts[1].blockCount;
  assert.deepEqual(errors(f), []); // Historical NEPIS block bounds may be unmeasured; never substitute PDF pages.
});

test('revision triggers, source joins and evidence must resolve the same reading', () => {
  rejects(f => f.readings.revisions[0].triggerPassageIds = ['missing'], /unknown reference missing/);
  rejects(f => f.catalog.sources[0].reading.readingId = 'missing', /unknown reading/);
  rejects(f => f.catalog.sources[0].reading.status = 'web-sections', /must match the bound reading/);
  rejects(f => f.literature.records[0].catalogSourceIds = ['missing-source'], /unknown reference missing-source/);
  rejects(f => delete f.catalog.evidence[0].passageId, /must be supplied together/);
  rejects(f => f.catalog.evidence[0].passageId = 'missing', /unknown passage/);
  rejects(f => f.catalog.evidence[0].readingId = 'missing', /unknown reading/);
  rejects(f => delete f.catalog.sources[0].reading.readingId, /source must bind to the same reading/);
});

test('malformed structures report errors without throwing; signed URLs are refused', () => {
  assert.doesNotThrow(() => validateResearch({ records: [null] }, { readings: [null], revisions: [null] }, {}));
  rejects(f => f.readings.readings[0].artifacts[0].resolvedUrl = 'https://example.org/file?X-Amz-Signature=secret', /ephemeral signed credentials/);
  rejects(f => f.literature.records[0].urls[0].url = 'https://name:secret@example.org/file', /without credentials/);
});

test('repository validation discovers registers while retaining legacy repositories', async () => {
  const root = await mkdtemp(join(tmpdir(), 'prism-research-validation-'));
  try {
    await mkdir(join(root, 'knowledge/research'), { recursive: true }); await mkdir(join(root, 'content'));
    const catalog = { schemaVersion: 1, sources: [], evidence: [], claims: [], concepts: [], mappings: [], coverage: [] };
    await writeFile(join(root, 'knowledge/catalog.json'), JSON.stringify(catalog));
    assert.deepEqual(await validateRepository(root), []);
    const f = fixture(); f.literature.records[0].catalogSourceIds = [];
    await writeFile(join(root, 'knowledge/research/literature-map.json'), JSON.stringify(f.literature));
    await writeFile(join(root, 'knowledge/research/readings.json'), JSON.stringify(f.readings));
    assert.deepEqual(await validateRepository(root), []);
    f.readings.readings[0].passages[0].pdfIndices = [3];
    await writeFile(join(root, 'knowledge/research/readings.json'), JSON.stringify(f.readings));
    assert((await validateRepository(root)).some(error => /outside artifact pageCount/.test(error)));
  } finally { await rm(root, { recursive: true, force: true }); }
});


test('public research projection removes unknown/private fields recursively and retains public identity', () => {
  const f = fixture();
  const secret = 'PRIVATE-COLLABORATOR-PAYLOAD';
  f.literature.gaps.push({ id: 'gap-one', description: 'Unresolved', priority: 'high', nextSearch: 'Original archive', volumes: ['V1'] });
  f.readings.gaps.push({ id: 'gap-read', description: 'Unacquired original', affectedUnits: ['V1'], nextAction: 'Library request' });
  const injected = structuredClone(f);
  function inject(value) {
    if (!value || typeof value !== 'object') return;
    if (!Array.isArray(value)) value.privateNotes = secret;
    for (const item of Object.values(value)) if (item !== secret) inject(item);
  }
  inject(injected);
  injected.literature.records[0].identifiers.localPath = '/private/original.pdf';
  injected.literature.records[0].discovery.privateConversation = secret;
  injected.readings.readings[0].artifacts[0].localPath = '/private/original.pdf';
  assert.deepEqual(publicResearch(injected.literature, injected.readings), publicResearch(f.literature, f.readings));
  const projected = publicResearch(injected.literature, injected.readings);
  assert(!JSON.stringify(projected).includes(secret));
  assert(!JSON.stringify(projected).includes('/private/'));
  projected.readingLedger.readings[0].passages[0].pdfIndices.push(999);
  assert.deepEqual(f.readings.readings[0].passages[0].pdfIndices, [0, 2]);
});

test('public allowlisted fields cannot carry hidden nested objects through primitive slots', () => {
  const f = fixture();
  f.literature.records[0].identifiers.doi = { privateNotes: 'secret' };
  f.literature.records[0].volumes.push({ privateNotes: 'secret' });
  f.readings.readings[0].artifacts[0].sha256 = { privateNotes: 'secret' };
  f.readings.readings[0].passages[0].pdfIndices.push({ privateNotes: 'secret' });
  assert(!JSON.stringify(publicResearch(f.literature, f.readings)).includes('secret'));
});

function derivedFixture() {
  const f = fixture();
  const artifact = { id: 'art-derived', kind: 'derived-text', mediaType: 'text/plain', sha256: 'd'.repeat(64), originUrl: 'https://example.org/corrected-table.pdf', captureMethod: 'Official indexed text selected capture', captureScope: 'Selected table rows/header/caption; no PDF visual verification', originalDocumentMediaType: 'application/pdf', originalDocumentBytesAvailable: false };
  const reading = f.readings.readings[0];
  reading.artifacts = [artifact];
  reading.passages = [{ id: 'psg-pdf', artifactId: artifact.id, locator: 'Replacement table 7.15, selected rows', topics: ['metric'], limits: ['Original PDF bytes unavailable; selected text only.'] }];
  const { id, ...snapshot } = artifact;
  f.catalog.sources[0].artifact = snapshot;
  return f;
}

test('derived selected text is a bounded distinct carrier in validation and public research projection', () => {
  const f = derivedFixture();
  assert.deepEqual(errors(f), []);
  f.readings.readings[0].artifacts[0].privatePath = '/private/raw-capture.txt';
  const projected = publicResearch(f.literature, f.readings).readingLedger.readings[0].artifacts[0];
  assert.equal(projected.kind, 'derived-text');
  for (const field of ['originUrl', 'captureMethod', 'captureScope', 'originalDocumentMediaType', 'originalDocumentBytesAvailable']) assert.equal(projected[field], f.catalog.sources[0].artifact[field]);
  assert.equal(projected.pageCount, undefined);
  assert.equal(projected.resolvedUrl, undefined);
  assert(!JSON.stringify(projected).includes('/private/'));
});

test('derived capture metadata and source binding cannot be dropped or silently changed', () => {
  for (const field of ['kind', 'originUrl', 'captureMethod', 'captureScope', 'originalDocumentMediaType', 'originalDocumentBytesAvailable']) {
    const f = derivedFixture(); delete f.catalog.sources[0].artifact[field];
    assert(errors(f).some(error => error.includes(`artifact.${field}`)), errors(f).join('\n'));
  }
  for (const field of ['originUrl', 'captureMethod', 'captureScope', 'originalDocumentMediaType', 'originalDocumentBytesAvailable']) {
    const f = derivedFixture(); delete f.readings.readings[0].artifacts[0][field];
    assert(errors(f).some(error => error.includes(`.${field}`)), errors(f).join('\n'));
  }
  const f = fixture(); f.catalog.sources[0].artifact.kind = 'retrieved';
  assert.deepEqual(errors(f), []); // Explicit retrieved and legacy missing kind identify the same carrier.
});

test('derived text cannot claim PDF indices, original download URLs or page counts', () => {
  for (const mutate of [
    f => f.readings.readings[0].passages[0].pdfIndices = [0],
    f => f.readings.readings[0].passages[0].nepisBlocks = [0],
    f => f.readings.readings[0].artifacts[0].pageCount = 2,
    f => f.readings.readings[0].artifacts[0].resolvedUrl = 'https://example.org/original.pdf',
    f => f.readings.readings[0].artifacts[0].originalDocumentBytesAvailable = true,
    f => f.readings.readings[0].artifacts[0].originUrl = 'https://example.org/origin?signature=secret',
  ]) {
    const f = derivedFixture(); mutate(f); assert(errors(f).length > 0);
  }
  const f = derivedFixture(); f.readings.readings[0].artifacts[0].captureMethod = { privateNotes: 'hidden-private-text' };
  assert(errors(f).some(error => /captureMethod/.test(error)));
  assert(!JSON.stringify(publicResearch(f.literature, f.readings)).includes('hidden-private-text'));
});
