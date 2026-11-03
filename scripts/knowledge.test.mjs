import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog, publicCatalog, buildDependencies, affectedClaims } from './knowledge.mjs';
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
