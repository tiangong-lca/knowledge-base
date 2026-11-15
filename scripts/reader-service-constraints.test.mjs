import assert from 'node:assert/strict';
import test from 'node:test';
import { editionDigest, sha256, matchesAcceptedFile } from './reader-current-edition.mjs';
import {
  effectiveServiceConstraints, prepareServiceConstraintsSource, selectServiceConstraints,
  serviceConstraintsChapter, serviceConstraintsId, serviceConstraintsLayout, serviceConstraintsSource,
} from './reader-service-constraints.mjs';

const chapterFile = `content${serviceConstraintsChapter}.mdx`;
const sampleState = before => ({ files: { [chapterFile]: sha256(before ? 'before' : 'after') },
  records: {}, sourceOccurrences: { [chapterFile]: ['cl-original'] }, bookUnitKeys: [serviceConstraintsChapter],
  publishedClaims: ['cl-original'], dependencies: {} });

function fixture() {
  const before = sampleState(true), actual = sampleState(false);
  const structure = { claims: sha256('original protected claims'), files: {} };
  const pin = editionDigest({ ...before, structure });
  const changes = [{ kind: 'file', key: chapterFile, from: before.files[chapterFile], to: actual.files[chapterFile],
    rationale: 'An exact fixture replacement' }];
  const unit = { id: serviceConstraintsId, source: serviceConstraintsSource, routes: [serviceConstraintsChapter],
    rationale: 'A bounded fixture', scope: [chapterFile], changes, consumers: [], layouts: [], outputs: [],
    publicArtifacts: [], structure: [], occurrences: [], state: {
      before: { digest: pin, protectedClaims: structure.claims, dependencies: {}, publishedClaims: ['cl-original'] },
      after: { digest: editionDigest({ ...actual, structure }) },
    } };
  return { before, actual, structure, pin, unit };
}

test('service constraints activates only an explicit private preview before signing', () => {
  const { unit } = fixture();
  const config = { schemaVersion: 1, status: 'preview', unit };
  assert.equal(selectServiceConstraints({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);
  assert.equal(selectServiceConstraints(config, null, true), unit);
  assert.throws(() => selectServiceConstraints(config), /not independently accepted/);
});

test('new state independently projects to the original state and protects old knowledge', () => {
  const { before, actual, structure, pin, unit } = fixture();
  const records = { catalog: { sources: [] }, readings: { readings: [] } };
  let result = prepareServiceConstraintsSource(unit, actual, structure, records, pin);
  assert.deepEqual(result.previous, { ...before, structure });
  result.verifyCurrentState();

  actual.records['claims:cl-other'] = { raw: sha256('unknown record') };
  result = prepareServiceConstraintsSource(unit, actual, structure, records, pin);
  assert.throws(result.verifyCurrentState, /independently observed predecessor/);

  const key = 'evidence:ev-original';
  unit.scope.push(key);
  unit.changes.push({ kind: 'record', key, from: { raw: sha256('old') }, to: { raw: sha256('new') }, rationale: 'Attempt to rewrite a protected locator' });
  assert.throws(() => prepareServiceConstraintsSource(unit, actual, structure, records, pin), /cannot rewrite a prior claim or evidence/);
});

test('approved matching keeps earlier exact predecessor fingerprints and rejects gaps', () => {
  const { unit } = fixture();
  const first = sha256('first'), second = sha256('second');
  const previous = { changes: { record: new Map(), file: new Map([[chapterFile,
    { from: first, intermediate: second, to: unit.changes[0].from }]]) },
    outputs: new Map(), publicArtifacts: new Map() };
  const current = effectiveServiceConstraints(previous, unit);
  for (const past of [first, second, unit.changes[0].from])
    assert(matchesAcceptedFile(current, chapterFile, past, unit.changes[0].to));
  assert(!matchesAcceptedFile(current, chapterFile, sha256('unrecognized'), unit.changes[0].to));
  unit.changes[0].from = sha256('gap');
  assert.throws(() => effectiveServiceConstraints(previous, unit), /stale admitted predecessor/);
});

test('formal B07 sections may retain revised titles but cannot exchange anchor identities', () => {
  const { unit } = fixture();
  const key = 'B07:headings', old = [{ id: '需求平衡', title: '需求平衡' }];
  const row = { key, from: editionDigest(old), to: [{ id: '需求平衡', title: '对齐服务约束' }], rationale: 'Actual issue scope' };
  unit.layouts = [row];
  assert.deepEqual(serviceConstraintsLayout(unit, key, old), row.to);
  row.to[0].id = 'different';
  assert.throws(() => serviceConstraintsLayout(unit, key, old), /retain its formal B07 section identities/);
});
