import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { editionDigest, readableBookReviewSubject, sha256 } from './reader-current-edition.mjs';
import { effectiveFlowBoundary, flowBoundaryChapter, flowBoundaryGuide, flowBoundaryHistory, flowBoundaryNoteTarget, flowBoundaryOrdinaryId, flowBoundaryNumbering,
  flowBoundaryRoutes, qualifyFlowBoundarySource, selectFlowBoundary, verifyFlowBoundaryReceipts } from './reader-flow-boundary.mjs';
import { flowBoundarySource } from './reader-flow-boundary-pins.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const fingerprints = value => ({ raw: hash(value), public: hash(value), protected: hash(value) });

function fixture() {
  const key = `content${flowBoundaryChapter}.mdx`;
  const before = {
    files: { [key]: hash('before'), 'knowledge/cases/native-exchange-v1.json': hash('input') },
    records: { 'claims:cl-old': fingerprints('old'), 'concepts:cn-fixture': fingerprints('before') },
    sourceOccurrences: { [key]: ['cl-old'] }, bookUnitKeys: [flowBoundaryChapter],
    dependencies: { 'cn-fixture': ['cl-old'] }, publishedClaims: ['cl-old'],
    structure: { files: { [key]: hash('structure') }, claims: hash('old claim structure') },
  };
  const after = structuredClone(before);
  after.files[key] = hash('after');
  after.records['concepts:cn-fixture'] = fingerprints('after');
  after.records['claims:cl-new'] = fingerprints('new');
  after.dependencies['cn-fixture'].push('cl-new');
  after.publishedClaims.push('cl-new');
  after.sourceOccurrences[key].push('cl-new');
  after.structure.claims = hash('new claim structure');
  const changes = [
    { kind: 'file', key, from: before.files[key], to: after.files[key] },
    { kind: 'record', key: 'concepts:cn-fixture', from: before.records['concepts:cn-fixture'], to: after.records['concepts:cn-fixture'] },
    { kind: 'record', key: 'claims:cl-new', from: null, to: after.records['claims:cl-new'] },
  ].map(row => ({ ...row, rationale: 'Exact independent comparison' }));
  const unit = {
    id: 'flow-boundary-99', source: flowBoundarySource, rationale: 'Exact independent review',
    scope: changes.map(row => row.key), changes, consumers: [{ id: 'cl-old', rationale: 'Concept definition changed' }],
    state: {
      before: { digest: editionDigest(before), protectedClaims: before.structure.claims,
        dependencies: before.dependencies, publishedClaims: before.publishedClaims },
      after: { digest: editionDigest(after) },
    },
    chapterSections: [], structure: [], occurrences: [{ key, from: before.sourceOccurrences[key], to: after.sourceOccurrences[key] }],
    outputs: [], publicArtifacts: [],
  };
  return { unit, before, after, key };
}

test('a new science plan requires independent selection in production', () => {
  const { unit } = fixture();
  assert.equal(selectFlowBoundary({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);
  const preview = { schemaVersion: 1, status: 'preview', unit };
  assert.equal(selectFlowBoundary(preview, null, true), unit);
  assert.throws(() => selectFlowBoundary(preview, editionDigest(unit)), /not independently accepted/);
  assert.throws(() => selectFlowBoundary({ ...preview, status: 'reviewed' }, null, true), /not independently accepted/);
});

test('a source successor restores the complete predecessor and observes both consumer graphs', () => {
  const { unit, before, after } = fixture();
  const result = qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before));
  assert.deepEqual(result.previous, before);
  assert.deepEqual(result.affectedClaimIds, ['cl-old', 'cl-new']);
  assert.throws(() => qualifyFlowBoundarySource({ ...unit, consumers: [] }, after, after.structure, editionDigest(before)), /consumers/);
  assert.throws(() => qualifyFlowBoundarySource({ ...unit, occurrences: [] }, after, after.structure, editionDigest(before)), /reconstruct/);
});

test('a coordinated change cannot replace a numerical input or alter an unrelated record', () => {
  const { unit, before, after } = fixture();
  after.files['knowledge/cases/native-exchange-v1.json'] = hash('replacement');
  unit.state.after.digest = editionDigest(after);
  assert.throws(() => qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before)), /reconstruct/);
  const key = 'claims:cl-flow-type';
  unit.scope.push(key);
  unit.changes.push({ kind: 'record', key, from: fingerprints('original'), to: fingerprints('extended'), rationale: 'Bad generalization' });
  assert.throws(() => qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before)), /protected claim/);
});

test('numbering can add a concrete subsection and display title while keeping original IDs and other chapters', () => {
  const h = { id: 'old-id', title: 'Old heading', depth: 2, type: 'mdx' };
  const before = { web: [{ key: flowBoundaryChapter, title: 'Old title' }], book: [],
    headings: Object.fromEntries(flowBoundaryRoutes.map(route => [route, [h]])) };
  const current = structuredClone(before);
  current.web[0].title = 'New title';
  current.headings[flowBoundaryChapter].push({ id: 'new-id', title: 'New subsection', depth: 3, type: 'mdx' });
  const unit = { numbering: { before: before.headings, after: current.headings,
    titles: [{ route: flowBoundaryChapter, from: 'Old title', to: 'New title' }] } };
  assert.equal(flowBoundaryNumbering(unit, current, hash(JSON.stringify(before))), hash(JSON.stringify(current)));
  current.headings['/docs/flows'][0].id = 'wrong';
  assert.throws(() => flowBoundaryNumbering(unit, current, hash(JSON.stringify(before))), /lost a native heading/);
});

test('retained addresses bind exact earlier ordered notes and ordinary-text dispositions', () => {
  const route = '/docs/flows';
  const note = flowBoundaryNoteTarget(route, route, 'cl-old');
  const chapterAddress = `${route}#heading`;
  const noteAddress = `${route}#${note.id}`;
  const oldBlock = hash('old paragraph'), newBlock = hash('revised paragraph');
  const chapter = { route, kind: 'heading', title: 'Old title', claimIds: ['cl-old'], ordinary: [oldBlock] };
  const previousAddresses = { [chapterAddress]: chapter,
    [noteAddress]: { route, kind: 'note', title: 'Old title', claimIds: ['cl-old'], ordinary: [] } };
  const currentAddresses = { ...previousAddresses,
    [chapterAddress]: { ...chapter, title: 'Revised title', ordinary: [newBlock] } };
  const targetId = flowBoundaryOrdinaryId(route, false, 1);
  const unit = { previousAddresses, currentAddresses, ordinaryTargets: { [`${route}#${targetId}`]: newBlock }, history: [{ address: chapterAddress,
    from: editionDigest(chapter), rationale: 'Revised prose covers the same question',
    ordinary: [{ address: chapterAddress, targetId, from: oldBlock, to: newBlock, rationale: 'Equivalent ordinary consequence' }],
  }] };
  assert.equal(flowBoundaryHistory(unit, editionDigest(previousAddresses)).size, 1);
  delete currentAddresses[noteAddress];
  assert.throws(() => flowBoundaryHistory(unit, editionDigest(previousAddresses)), /previous note|native citation/);
});

test('an altered artifact cannot advance the accepted article without its old byte identity', () => {
  const { unit } = fixture();
  const key = `${flowBoundaryChapter}#${flowBoundaryChapter}`;
  const predecessor = { changes: { file: new Map(), record: new Map() }, affectedClaimIds: [], outputs: new Map([[key, { sha256: hash('before') }]]), publicArtifacts: new Map() };
  unit.outputs = [{ path: flowBoundaryChapter, route: flowBoundaryChapter, from: hash('wrong'), sha256: hash('after'), rationale: 'Actual article' }];
  assert.throws(() => effectiveFlowBoundary(predecessor, unit, []), /artifact predecessor/);
});

test('even exact successor digests cannot change the page of an original CML passage', () => {
  const { unit, before, after } = fixture();
  const id = 'rd-cml-2001-part2a', key = `readings:${id}`;
  const original = {
    id, workId: 'work-cml-2001', readAt: '2026-11-04',
    artifacts: [{ id: 'art-cml-2001' }],
    passages: [{ id: 'psg-cml-2001-reference-representation', printedPages: [24] }],
    sourceKeys: ['CML2001'],
  };
  const observed = { ...original,
    passages: [...original.passages, { id: 'psg-flow-99-cml-boundary', printedPages: [31] }],
    appraisal: { scope: 'Selected additional passage' },
  };
  const record = value => ({ raw: editionDigest(value), public: null, protected: editionDigest(value) });
  before.records[key] = record(original);
  after.records[key] = record(observed);
  const row = { kind: 'record', key, from: record(original), to: record(observed), rationale: 'Add the independently read passage' };
  unit.changes.push(row);
  unit.scope.push(key);
  unit.previousReadings = [original];
  unit.state.before.digest = editionDigest(before);
  unit.state.after.digest = editionDigest(after);
  assert.doesNotThrow(() => qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before), { readings: { readings: [observed] } }));
  const shifted = structuredClone(observed);
  shifted.passages[0].printedPages = [25];
  row.to = record(shifted);
  after.records[key] = row.to;
  unit.state.after.digest = editionDigest(after);
  assert.throws(() => qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before), { readings: { readings: [shifted] } }), /original reading's passages/);
});

test('formal output evidence requires actual artifact files rather than preview projections', () => {
  const { unit } = fixture();
  unit.history = [];
  unit.currentAddresses = {};
  unit.outputs = [{ path: '/docs/flows', route: '/docs/flows', sha256: hash('article') }];
  unit.publicArtifacts = [{ path: 'downloads/catalog.json', sha256: hash('catalog') }, { path: flowBoundaryGuide, sha256: hash('guide') }];
  function receipts(outputEvidence) {
    const observations = {
      source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
      reader: { routes: flowBoundaryRoutes, history: [] },
      output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: {}, ...outputEvidence },
    };
    const artifacts = new Map();
    unit.reviewEvidence = Object.entries(observations).map(([kind, rows]) => {
      const root = '_docs/editorial/review-evidence/flow-boundary-99';
      const artifactFile = `${root}/${kind}-artifact.json`, reportFile = `${root}/${kind}-report.json`;
      const identity = { schemaVersion: 1, kind, unit: unit.id, subjectSha256: readableBookReviewSubject(unit, kind), date: flowBoundarySource.date };
      const artifact = JSON.stringify({ ...identity, scope: unit.scope, observed: 'Exact fixture', observations: rows });
      const artifactSha256 = sha256(artifact);
      const report = JSON.stringify({ ...identity, artifactSha256, disposition: 'accepted',
        findings: 'Exact fixture', reviewer: 'fixture user', provenance: 'Technical verification fixture' });
      artifacts.set(artifactFile, artifact);
      artifacts.set(reportFile, report);
      return { kind, date: identity.date, artifactFile, artifactSha256, reportFile, reportSha256: sha256(report) };
    });
    return artifacts;
  }
  const physical = { source: 'actual-export', artifactFiles: unit.publicArtifacts.map(row => ({ ...row, bytes: 100 })) };
  assert(verifyFlowBoundaryReceipts(unit, receipts(physical)));
  assert(!verifyFlowBoundaryReceipts(unit, receipts({ ...physical, previewDownloads: ['downloads/catalog.json'] })));
  assert(!verifyFlowBoundaryReceipts(unit, receipts({ ...physical, artifactFiles: [] })));
});

test('the science successor cannot rewrite an existing evidence locator or an original source carrier', () => {
  const { unit, before, after } = fixture();
  const key = 'evidence:ev-original-passage';
  unit.scope.push(key);
  unit.changes.push({ kind: 'record', key, from: fingerprints('p. 24'), to: fingerprints('p. 25'), rationale: 'Coordinated mutation' });
  assert.throws(() => qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before)), /protected claim or evidence/);
  unit.scope.pop();
  unit.changes.pop();

  const id = 'src-fixture', sourceKey = `sources:${id}`;
  const prior = { id, title: 'Original work', artifact: { sha256: hash('original bytes') }, reading: { readingId: 'rd-fixture', scope: 'Original scope' } };
  const next = { ...prior, reading: { ...prior.reading, scope: 'Additional inspected passage', checkedAt: '2026-11-14' } };
  const record = value => ({ raw: editionDigest(value), public: null, protected: editionDigest(value) });
  before.records[sourceKey] = record(prior);
  after.records[sourceKey] = record(next);
  const row = { kind: 'record', key: sourceKey, from: record(prior), to: record(next), rationale: 'Exact reading scope expansion' };
  unit.changes.push(row);
  unit.scope.push(sourceKey);
  unit.previousSources = [prior];
  unit.state.before.digest = editionDigest(before);
  unit.state.after.digest = editionDigest(after);
  assert.doesNotThrow(() => qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before), { catalog: { sources: [next] } }));
  next.artifact = { sha256: hash('other bytes') };
  row.to = record(next);
  after.records[sourceKey] = row.to;
  unit.state.after.digest = editionDigest(after);
  assert.throws(() => qualifyFlowBoundarySource(unit, after, after.structure, editionDigest(before), { catalog: { sources: [next] } }), /carrier identity/);
});
