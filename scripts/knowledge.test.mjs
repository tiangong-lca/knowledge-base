import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog, publicCatalog, buildDependencies, affectedClaims, getClaimEvidence } from './knowledge.mjs';
import { validateClaimReferences } from './validate.mjs';

function fixture() {
  return {
    schemaVersion: 1,
    sources: [{ id: 'source', title: 'Source', url: 'https://example.org/source', version: '1', publisher: 'Publisher', accessedAt: '2026-11-03', accessStatus: 'public-html-inspected', rights: 'Original metadata and analysis only', preservation: 'Mutable URL; no archived original' }],
    evidence: [{ id: 'evidence', sourceId: 'source', locator: 'section 1', summary: 'Inspected source assertion', relation: 'supports' }],
    claims: [
      { id: 'claim', text: 'A bounded source assertion', kind: 'source-statement', scope: 'version 1 only', evidenceIds: ['evidence'], premiseIds: [], conceptIds: ['concept'], status: 'reviewed', reviewedAt: '2026-11-03', reviewKind: 'agent-source-check', caveats: [] },
      { id: 'derived', text: 'A consequence of the assertion', kind: 'synthesis', reasoning: 'The identified premise entails this limited consequence under the stated scope.', scope: 'version 1 only', evidenceIds: [], premiseIds: ['claim'], conceptIds: ['other-concept'], status: 'reviewed', reviewedAt: '2026-11-03', reviewKind: 'agent-source-check', caveats: [] },
    ],
    concepts: [
      { id: 'concept', label: 'Concept', english: 'Concept', definitionClaimIds: ['claim'], aliases: [] },
      { id: 'other-concept', label: 'Other concept', english: 'Other concept', definitionClaimIds: ['derived'], aliases: [] },
    ],
    mappings: [{ id: 'mapping', from: 'concept', to: 'other-concept', relation: 'related', conditions: ['Within this example only'], claimIds: ['derived'] }],
    coverage: [{ id: 'coverage', title: 'Example', status: 'sampled', notes: 'Only this example is covered' }],
  };
}

const hasError = (data, pattern) => assert.ok(validateCatalog(data).some(e => pattern.test(e)), validateCatalog(data).join('\n'));

test('bounded fixture is structurally valid without claiming entailment approval', () => {
  assert.deepEqual(validateCatalog(fixture()), []);
});

test('rejects dangling references and globally duplicate stable IDs', () => {
  const data = fixture(); data.evidence[0].sourceId = 'missing';
  hasError(data, /unknown source missing/);
  data.sources[0].id = 'claim';
  hasError(data, /duplicate ID claim/);
});

test('rejects impossible dates, missing locators, and unsupported access claims', () => {
  const data = fixture(); data.sources[0].accessedAt = '2026-02-30'; data.evidence[0].locator = '';
  hasError(data, /accessedAt/); hasError(data, /locator/);
  data.sources[0].accessStatus = 'metadata-only';
  hasError(data, /was not inspected/);
});

test('context evidence cannot establish a reviewed source assertion', () => {
  const data = fixture(); data.evidence[0].relation = 'context';
  hasError(data, /needs supporting evidence/);
});

test('claim-specific roles override legacy roles in both directions', () => {
  const data = fixture();
  assert.deepEqual(getClaimEvidence(data, data.claims[0]), [{ evidence: data.evidence[0], relation: 'supports', rationale: null, legacy: true }]);
  data.claims[0].evidenceLinks = [{ evidenceId: 'evidence', relation: 'qualifies', rationale: 'This passage limits this claim rather than supporting it.' }];
  hasError(data, /needs supporting evidence/);
  assert.equal(getClaimEvidence(data, data.claims[0])[0].relation, 'qualifies');
  data.evidence[0].relation = 'context';
  data.claims[0].evidenceLinks[0].relation = 'supports';
  assert.deepEqual(validateCatalog(data), []);
  assert.deepEqual(getClaimEvidence(data, data.claims[0])[0], { evidence: data.evidence[0], relation: 'supports', rationale: data.claims[0].evidenceLinks[0].rationale, legacy: false });
  data.sources[0].accessStatus = 'metadata-only';
  hasError(data, /was not inspected/);
});

test('legacy evidence role may be omitted only when every claim use is explicit', () => {
  const data = fixture();
  delete data.evidence[0].relation;
  data.claims[0].evidenceLinks = [{ evidenceId: 'evidence', relation: 'supports', rationale: 'Direct support for this bounded assertion.' }];
  assert.deepEqual(validateCatalog(data), []);
  data.claims[1].evidenceIds = ['evidence'];
  hasError(data, /every claim use/);
  data.claims[1].evidenceLinks = [{ evidenceId: 'evidence', relation: 'contradicts', rationale: 'A competing interpretation must remain visible.' }];
  assert.deepEqual(validateCatalog(data), []);
  assert.equal(getClaimEvidence(data, data.claims[1])[0].relation, 'contradicts');
});

test('explicit evidence links require an exact unique set, valid roles and rationales', () => {
  const data = fixture();
  const link = { evidenceId: 'evidence', relation: 'supports', rationale: 'Directly inspected passage.' };
  data.claims[0].evidenceLinks = [];
  hasError(data, /missing link evidence/);
  // Presence of an explicit collection must never recover the legacy support role.
  assert.equal(getClaimEvidence(data, data.claims[0])[0].relation, undefined);
  data.claims[0].evidenceLinks = [link, { ...link }];
  hasError(data, /duplicate evidence link/);
  data.claims[0].evidenceLinks = [{ ...link, evidenceId: 'other' }];
  hasError(data, /must exactly match evidenceIds/);
  data.claims[0].evidenceLinks = [{ ...link, relation: 'proves', rationale: '' }];
  hasError(data, /evidenceLinks\[0\].relation/); hasError(data, /evidenceLinks\[0\].rationale/);
  data.claims[0].evidenceLinks = [null];
  assert.doesNotThrow(() => validateCatalog(data));
  hasError(data, /evidenceLinks\[0\]: must be an object/);
});

function addReadingMetadata(data) {
  data.sources[0].accessStatus = 'public-passages-inspected';
  data.sources[0].artifact = { sha256: 'a'.repeat(64), pageCount: 100, resolvedUrl: 'https://example.org/source.pdf', mediaType: 'application/pdf' };
  data.sources[0].reading = { status: 'selected-passages', scope: 'Printed pages 10–12 only; the remainder was not read.', checkedAt: '2026-11-04', readingId: 'reading-source-sections' };
  data.evidence[0].appraisal = { basis: 'Selected original passages inspected.', limitations: ['Historical edition; not a current standard.'], independence: 'Shares antecedent guidance with other sources.', methodologicalScope: 'Applies to the identified study design.', reviewKind: 'agent-source-check', checkedAt: '2026-11-04' };
  data.claims[0].evidenceLinks = [{ evidenceId: 'evidence', relation: 'supports', rationale: 'Supports the assertion under its stated scope.' }];
  return data;
}

test('artifact, selected reading and appraisal fields validate and survive the public projection', () => {
  const data = addReadingMetadata(fixture());
  assert.deepEqual(validateCatalog(data), []);
  const output = publicCatalog(data);
  assert.deepEqual(output.sources[0].artifact, data.sources[0].artifact);
  assert.deepEqual(output.sources[0].reading, data.sources[0].reading);
  assert.deepEqual(output.evidence[0].appraisal, data.evidence[0].appraisal);
  assert.deepEqual(output.claims[0].evidenceLinks, data.claims[0].evidenceLinks);
  output.evidence[0].appraisal.limitations.push('Projection edits must not mutate the original.');
  assert.equal(data.evidence[0].appraisal.limitations.length, 1);
});

test('nested public allowlists exclude unknown private metadata and link properties', () => {
  const data = addReadingMetadata(fixture());
  for (const record of [data.sources[0].artifact, data.sources[0].reading, data.evidence[0].appraisal, data.claims[0].evidenceLinks[0]]) record.privateNotes = { secret: 'PRIVATE nested note' };
  assert.equal(JSON.stringify(publicCatalog(data)).includes('PRIVATE'), false);
});

test('invalid artifacts and incomplete appraisals cannot enter public exports', () => {
  const data = addReadingMetadata(fixture());
  data.sources[0].artifact = { sha256: 'not-a-hash', pageCount: 0, resolvedUrl: 'file:///private/source.pdf', mediaType: 'pdf' };
  data.evidence[0].appraisal.limitations = 'none';
  data.evidence[0].appraisal.checkedAt = '2026-02-30';
  delete data.evidence[0].appraisal.independence;
  for (const field of ['sha256', 'pageCount', 'resolvedUrl', 'mediaType', 'limitations', 'checkedAt', 'independence']) hasError(data, new RegExp(field));
  assert.throws(() => publicCatalog(data), /Cannot publish invalid catalog/);
});

test('reading metadata cannot upgrade metadata checks or partial reading to full-text inspection', () => {
  const data = addReadingMetadata(fixture());
  data.sources[0].accessStatus = 'public-full-text-inspected';
  hasError(data, /do not establish full-text inspection/);
  data.sources[0].reading.status = 'metadata-only';
  hasError(data, /metadata-only reading cannot claim inspected/);
  data.sources[0].accessStatus = 'metadata-only';
  hasError(data, /was not inspected/);
  data.claims[0].status = 'draft'; data.claims[1].status = 'draft';
  assert.deepEqual(validateCatalog(data), []);
  assert.deepEqual(publicCatalog(data).sources, []);
  data.sources[0].reading.status = 'web-sections';
  hasError(data, /conflict with uninspected access/);
  data.sources[0].accessStatus = 'public-html-inspected';
  assert.deepEqual(validateCatalog(data), []);
  data.sources[0].reading.status = 'full-book';
  hasError(data, /reading.status: must be one of/);
});

test('inspected passages can retain unresolved access context without asserting public or licensed access', () => {
  const data = addReadingMetadata(fixture());
  data.sources[0].accessStatus = 'passages-inspected';
  data.sources[0].rights = 'Publisher access context and entitlement are unresolved; no original redistribution.';
  assert.deepEqual(validateCatalog(data), []);
  const output = publicCatalog(data);
  assert.equal(output.sources[0].accessStatus, 'passages-inspected');
  assert.equal(output.sources[0].rights, data.sources[0].rights);
  delete data.sources[0].reading.readingId;
  hasError(data, /neutral passage inspection requires/);
  data.sources[0].reading.readingId = 'reading-source-sections';
  data.sources[0].reading.status = 'metadata-only';
  hasError(data, /metadata-only reading cannot claim inspected/);
  delete data.sources[0].reading;
  hasError(data, /neutral passage inspection requires/);
});

test('derived claims require a reviewable argument and actual premises', () => {
  const data = fixture(); delete data.claims[1].reasoning; data.claims[1].premiseIds = [];
  hasError(data, /explicit reasoning/); hasError(data, /identified premises/);
});

test('detects premise cycles independently of semantic dependency cycles', () => {
  const data = fixture(); data.claims[0].premiseIds = ['derived'];
  hasError(data, /premise cycle/);
});

test('malformed collections and entries yield errors rather than throwing', () => {
  const data = fixture(); data.sources = [null, { id: 'bad' }]; data.claims[0].caveats = 4;
  assert.doesNotThrow(() => validateCatalog(data));
  assert.ok(validateCatalog(data).length > 0);
  assert.deepEqual(validateCatalog(null), ['catalog: must be an object']);
});

test('mapping requires real endpoints, conditions and supporting claims', () => {
  const data = fixture(); data.mappings[0].from = 'missing'; data.mappings[0].conditions = []; data.mappings[0].claimIds = [];
  hasError(data, /unknown concept/); hasError(data, /conditions: must not be empty/); hasError(data, /claimIds: must not be empty/);
});

test('draft-only evidence, source metadata and extra private fields do not leak', () => {
  const data = fixture();
  data.sources.push({ ...data.sources[0], id: 'private-source', title: 'Draft source' });
  data.evidence.push({ ...data.evidence[0], id: 'private-evidence', sourceId: 'private-source' });
  data.claims.push({ ...data.claims[0], id: 'draft', status: 'draft', reviewedAt: null, reviewKind: 'not-reviewed', evidenceIds: ['private-evidence'], conceptIds: [] });
  data.internalNotes = 'PRIVATE TOP NOTE'; data.claims[0].internalNotes = 'PRIVATE CLAIM NOTE';
  const output = publicCatalog(data);
  assert.equal(output.claims.some(c => c.id === 'draft'), false);
  assert.equal(output.evidence.some(e => e.id === 'private-evidence'), false);
  assert.equal(output.sources.some(s => s.id === 'private-source'), false);
  assert.equal(JSON.stringify(output).includes('PRIVATE'), false);
  assert.deepEqual(output.claims.map(c => c.id), ['claim', 'derived']);
});

test('reviewed claims cannot publish a draft premise, and draft mappings are filtered', () => {
  const data = fixture(); data.claims[1].status = 'draft';
  assert.deepEqual(publicCatalog(data).mappings, []);
  data.claims[0].premiseIds = ['derived'];
  hasError(data, /unpublished premise/);
  assert.throws(() => publicCatalog(data), /Cannot publish invalid catalog/);
});

test('public MDX rejects unknown, draft and dynamic Claim references', () => {
  const data = fixture(); data.claims[1].status = 'draft';
  assert.deepEqual(validateClaimReferences('<Claim id="claim" />', data), []);
  assert.match(validateClaimReferences('<Claim id="derived" />', data).join(), /unpublished Claim/);
  assert.match(validateClaimReferences('<Claim id="missing" />', data).join(), /unknown Claim/);
  assert.match(validateClaimReferences('<Claim id={selected} />', data).join(), /literal id/);
  assert.match(validateClaimReferences('<Claim id="claim" {...props} />', data).join(), /literal id/);
  assert.match(validateClaimReferences('<Claim id="claim" id="derived" />', data).join(), /literal id/);
  assert.deepEqual(validateClaimReferences('```mdx\n<Claim id="missing" />\n```\n`<Claim id="missing" />`', data), []);
});

test('Prose references use literal unique published claim IDs and reject dynamic attributes', () => {
  const data = fixture();
  assert.deepEqual(validateClaimReferences('<Prose ids="claim derived">Authored prose.</Prose>', data), []);
  assert.deepEqual(validateClaimReferences("<Prose ids='claim\nderived' />", data), []);
  assert.match(validateClaimReferences('<Prose ids="claim missing" />', data).join(), /unknown Prose claim missing/);
  data.claims[1].status = 'draft';
  assert.match(validateClaimReferences('<Prose ids="claim derived" />', data).join(), /unpublished Prose claim derived/);
  for (const tag of ['<Prose ids={selected} />', '<Prose ids="claim" {...props} />', '<Prose ids="claim" ids="derived" />', '<Prose ids="claim" hidden />']) assert.match(validateClaimReferences(tag, data).join(), /literal ids/);
  assert.match(validateClaimReferences('<Prose ids="" />', data).join(), /at least one claim ID/);
  assert.match(validateClaimReferences('<Prose ids="claim claim" />', data).join(), /duplicate claim IDs/);
  assert.deepEqual(validateClaimReferences('```mdx\n<Prose ids="missing" />\n```\n`<Prose ids="missing" />`', data), []);
});

test('source and evidence changes propagate to transitive dependent claims', () => {
  const data = fixture();
  assert.deepEqual(affectedClaims(data, ['source']), ['claim', 'derived']);
  assert.deepEqual(affectedClaims(data, ['evidence']), ['claim', 'derived']);
  assert.deepEqual(affectedClaims(data, ['claim']), ['claim', 'derived']);
  assert.deepEqual(affectedClaims(data, ['unknown']), []);
  const graph = buildDependencies(data);
  assert.ok(graph.source.includes('evidence'));
  assert.ok(graph.evidence.includes('claim'));
  assert.ok(graph.claim.includes('derived'));
  assert.doesNotThrow(() => JSON.stringify(graph));
});

test('concept and mapping edits trigger associated claims and terminate semantic cycles', () => {
  const data = fixture();
  assert.deepEqual(affectedClaims(data, ['concept']), ['claim', 'derived']);
  assert.deepEqual(affectedClaims(data, ['mapping']), ['derived']);
  data.claims[0].mappingIds = ['mapping'];
  assert.deepEqual(affectedClaims(data, ['mapping']), ['claim', 'derived']);
});


test('reading and passage corrections reach all dependent claims', () => {
  const data = fixture();
  data.sources[0].reading = { readingId: 'reading-record' };
  data.evidence[0].readingId = 'reading-record';
  data.evidence[0].passageId = 'exact-passage';
  assert.deepEqual(affectedClaims(data, ['reading-record']), ['claim', 'derived']);
  assert.deepEqual(affectedClaims(data, ['exact-passage']), ['claim', 'derived']);
  assert.deepEqual(affectedClaims(data, ['unrelated-passage']), []);
});

test('impact CLI accepts registered reading and passage identities and rejects unknown IDs', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const root = mkdtempSync(join(tmpdir(), 'lca-impact-'));
  try {
    mkdirSync(join(root, 'knowledge/research'), { recursive: true });
    const data = fixture();
    data.sources[0].reading = { readingId: 'rd-example' };
    data.evidence[0].readingId = 'rd-example';
    data.evidence[0].passageId = 'psg-example';
    writeFileSync(join(root, 'knowledge/catalog.json'), JSON.stringify(data));
    writeFileSync(join(root, 'knowledge/research/readings.json'), JSON.stringify({ readings: [{ id: 'rd-example', passages: [{ id: 'psg-example' }, { id: 'psg-unused' }] }] }));
    const run = id => JSON.parse(execFileSync(process.execPath, [fileURLToPath(new URL('./impact.mjs', import.meta.url)), id], { cwd: root, encoding: 'utf8', stdio: 'pipe' }));
    assert.deepEqual(run('rd-example').requiresReview, ['claim', 'derived']);
    assert.deepEqual(run('psg-example').requiresReview, ['claim', 'derived']);
    assert.deepEqual(run('psg-unused').requiresReview, []);
    assert.throws(() => run('invented-id'), /Unknown changed identity/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});


test('legacy source and unbound artifact URLs cannot publish signed access or credentials', () => {
  for (const url of ['https://name:secret@example.org/source', 'https://example.org/source?X-Amz-Signature=secret', 'https://example.org/source?access_token=secret']) {
    const data = fixture();
    data.sources[0].artifact = { sha256: 'a'.repeat(64), resolvedUrl: url, mediaType: 'text/html' };
    hasError(data, /credentials/);
    assert.throws(() => publicCatalog(data), /Cannot publish invalid catalog/);
    delete data.sources[0].artifact;
    data.sources[0].url = url;
    hasError(data, /credentials/);
  }
});

function derivedArtifact() {
  return { kind: 'derived-text', mediaType: 'text/plain', sha256: 'd'.repeat(64), originUrl: 'https://example.org/corrected-table.pdf', captureMethod: 'Official indexed text, exact selected capture', captureScope: 'Table header, selected rows and caption only; no visual inspection', originalDocumentMediaType: 'application/pdf', originalDocumentBytesAvailable: false };
}

test('derived text snapshot retains discriminant and capture limitations without leaking private data', () => {
  const data = fixture();
  data.sources[0].artifact = { ...derivedArtifact(), privatePath: '/private/raw-capture.txt', rawCapture: { secret: 'private text' } };
  assert.deepEqual(validateCatalog(data), []);
  const artifact = publicCatalog(data).sources[0].artifact;
  assert.deepEqual(artifact, derivedArtifact());
  assert.equal(artifact.originalDocumentBytesAvailable, false);
  assert.equal(artifact.resolvedUrl, undefined);
  assert(!JSON.stringify(artifact).includes('/private/'));
});

test('derived snapshot metadata is mandatory and cannot masquerade as retrieved PDF bytes', () => {
  for (const field of ['originUrl', 'captureMethod', 'captureScope', 'originalDocumentMediaType', 'originalDocumentBytesAvailable']) {
    const data = fixture(); data.sources[0].artifact = derivedArtifact(); delete data.sources[0].artifact[field];
    hasError(data, new RegExp(field));
    assert.throws(() => publicCatalog(data), /Cannot publish invalid catalog/);
  }
  for (const extra of [{ mediaType: 'application/pdf' }, { originalDocumentBytesAvailable: true }, { resolvedUrl: 'https://example.org/original.pdf' }, { pageCount: 100 }, { pdfIndices: [0] }, { kind: 'unknown' }, { captureMethod: { privateNotes: 'secret' } }]) {
    const data = fixture(); data.sources[0].artifact = { ...derivedArtifact(), ...extra };
    assert(validateCatalog(data).length > 0);
  }
  const data = fixture(); data.sources[0].artifact = derivedArtifact(); delete data.sources[0].artifact.kind;
  hasError(data, /capture metadata requires kind derived-text/);
});

test('derived origin routes use the same credential and signed URL guards', () => {
  for (const originUrl of ['file:///private/capture.txt', 'https://name:secret@example.org/source', 'https://example.org/source?X-Amz-Credential=secret', 'https://example.org/source?access_token=secret']) {
    const data = fixture(); data.sources[0].artifact = { ...derivedArtifact(), originUrl };
    assert(validateCatalog(data).some(error => error.includes('originUrl')));
  }
});

test('numeric source facts and case bindings retain only explicit public fields', () => {
  const data = fixture();
  data.evidence[0].numericFact = { value: '28.1', unit: 'ratio', quantity: 'GWP100', subject: 'CH4-fossil', basis: 'specified corrected table', privatePath: 'PRIVATE' };
  data.claims[0].caseBinding = { caseId: 'CASE-WALL-CONNECT', version: '1.0.0', inputSha256: 'a'.repeat(64), privatePath: 'PRIVATE' };
  assert.deepEqual(validateCatalog(data), []);
  const out = publicCatalog(data);
  assert.equal(out.evidence[0].numericFact.value, '28.1');
  assert.equal(out.claims[0].caseBinding.inputSha256, 'a'.repeat(64));
  assert.equal(JSON.stringify(out).includes('PRIVATE'), false);
  assert.deepEqual(affectedClaims(data, ['CASE-WALL-CONNECT@1.0.0']), ['claim', 'derived']);
  assert.deepEqual(affectedClaims(data, ['CASE-WALL-CONNECT']), ['claim', 'derived']);
});

test('malformed numeric facts and unbound case identities cannot publish', () => {
  const data = fixture();
  data.evidence[0].numericFact = { value: 'NaN', unit: 'ratio', quantity: 'GWP100', subject: 'CH4-fossil', basis: 'specified corrected table' };
  hasError(data, /numericFact.value.*finite decimal/);
  data.evidence[0].numericFact.value = '28.1'; delete data.evidence[0].numericFact.basis;
  hasError(data, /numericFact.basis/);
  delete data.evidence[0].numericFact;
  data.claims[0].caseBinding = { caseId: '../secret', version: 'latest', inputSha256: null };
  hasError(data, /caseBinding.caseId/); hasError(data, /caseBinding.version/); hasError(data, /caseBinding.inputSha256/);
});
