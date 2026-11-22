import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { currentCheckpoint, currentRetirements, currentRevisions, effectivePlanDigestOf, readableBookCheckpointPin, revisionsIndexPin, selectCheckpoint } from './reader-checkpoint.mjs';
import { checkpointInput } from './reader-checkpoint-input.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition, matchesAcceptedRecord } from './reader-current-edition.mjs';
import { baseCheckpointPlan, currentBookPlan } from './reader-current-expectations.mjs';
import { publicCatalog } from './knowledge.mjs';
import { applyClaimRetirementsToCitations, applyRevisionsInverse, applyRevisionsToPlan, applyRevisionsToPlanStatic, loadRevisions, projectRevisionNumbering, validateRevisionSchema } from './reader-revisions.mjs';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

test('checkpoint config and revisions index match their independent pins', () => {
  assert.equal(currentCheckpoint.id, 'checkpoint-2026-11-21');
  assert.equal(editionDigest(currentCheckpoint), readableBookCheckpointPin);
  assert.equal(effectivePlanDigestOf(baseCheckpointPlan), currentCheckpoint.effectivePlanDigest);
  assert.ok(Array.isArray(currentRevisions));
  assert.ok(Array.isArray(currentRetirements));
  assert.throws(() => selectCheckpoint({ ...currentCheckpoint, stateDigest: '0'.repeat(64) }), /pinned digest/);
});

test('post-checkpoint revisions support modify, add, retire (with and without successor) and exact checkpoint rollback', async () => {
  const base = await checkpointInput();
  const baseDigest = editionDigest({
    ...inspectReadableBookEdition(base),
    structure: copyeditSourceStructure(base),
  });
  assert.equal(baseDigest, currentCheckpoint.stateDigest);

  // Construct a synthetic post-checkpoint state simulating a B14 integration rewrite:
  // - modify cl-lcia-midpoint-pathway
  // - retire cl-land111-episode with successor cl-land111-midpoint
  // - retire cl-fossil117-bridge with successor null (deleted with notice)
  // - add cl-b14-synthetic-synthesis
  // - modify content/docs/book/midpoint-endpoint-value-choices.mdx
  const modified = {
    catalog: structuredClone(base.catalog),
    readings: structuredClone(base.readings),
    literature: structuredClone(base.literature),
    files: new Map([...base.files].map(([k, v]) => [k, Buffer.from(v)])),
  };

  const modIdx = modified.catalog.claims.findIndex(c => c.id === 'cl-lcia-midpoint-pathway');
  const modOld = structuredClone(modified.catalog.claims[modIdx]);
  modified.catalog.claims[modIdx].text = '改写后的中点路径示例文本。';

  const ret1Idx = modified.catalog.claims.findIndex(c => c.id === 'cl-land111-episode');
  const ret1Old = structuredClone(modified.catalog.claims[ret1Idx]);
  const ret2Idx = modified.catalog.claims.findIndex(c => c.id === 'cl-fossil117-bridge');
  const ret2Old = structuredClone(modified.catalog.claims[ret2Idx]);

  // Update dependent claims whose premiseIds referenced the retired claims (required by catalog integrity)
  const depMods = [];
  for (const c of modified.catalog.claims) {
    if (c.id === ret1Old.id || c.id === ret2Old.id) continue;
    if (c.premiseIds?.some(p => p === ret1Old.id || p === ret2Old.id)) {
      depMods.push({ id: c.id, op: 'modify', from: structuredClone(c), rationale: '移除已退役前提并改为直接前提。' });
      c.premiseIds = c.premiseIds.filter(p => p !== ret1Old.id && p !== ret2Old.id);
    }
  }

  // Remove in descending index order so indices match original array
  for (const idx of [ret1Idx, ret2Idx].sort((a, b) => b - a)) {
    modified.catalog.claims.splice(idx, 1);
  }

  const addedClaim = {
    ...structuredClone(modOld),
    id: 'cl-b14-synthetic-synthesis',
    text: '新增的整合论述示例。',
    premiseIds: [],
  };
  modified.catalog.claims.push(addedClaim);

  const mdxPath = 'content/docs/book/midpoint-endpoint-value-choices.mdx';
  const oldMdx = base.files.get(mdxPath).toString('utf8');
  const newMdx = oldMdx + '\n{/* synthetic integration test */}\n';
  modified.files.set(mdxPath, Buffer.from(newMdx, 'utf8'));

  const revision = {
    schemaVersion: 1,
    id: 'b14-synthetic-test',
    date: '2026-11-21',
    title: 'B14 整合测试修订',
    rationale: '测试改写、新增与退役回滚。',
    routes: ['/docs/book/midpoint-endpoint-value-choices'],
    sourceCommit: currentCheckpoint.checkpointCommit,
    claims: [
      { id: modOld.id, op: 'modify', from: modOld, rationale: '改写开篇段。' },
      ...depMods,
      { id: ret1Old.id, op: 'retire', from: ret1Old, index: ret1Idx, successor: 'cl-land111-midpoint', rationale: '并入土地中点段。' },
      { id: ret2Old.id, op: 'retire', from: ret2Old, index: ret2Idx, successor: null, rationale: '重复过渡段退役。' },
      { id: addedClaim.id, op: 'add', from: null, rationale: '新增整合收束段。' },
    ],
    files: [
      {
        path: mdxPath,
        fromSha256: sha256(Buffer.from(oldMdx, 'utf8')),
        toSha256: sha256(Buffer.from(newMdx, 'utf8')),
        previous: oldMdx,
      },
    ],
    corrections: [
      { chapter: '/docs/book/midpoint-endpoint-value-choices', claimId: modOld.id, scope: '开篇段整合改写。' },
    ],
    reviewEvidence: [],
  };

  validateRevisionSchema(revision, 'synthetic');
  const { previousInput, retirements } = await applyRevisionsInverse(modified, [revision]);
  const recoveredDigest = editionDigest({
    ...inspectReadableBookEdition(previousInput),
    structure: copyeditSourceStructure(previousInput),
  });
  assert.equal(recoveredDigest, currentCheckpoint.stateDigest);
  assert.equal(retirements.length, 2);
  assert.equal(retirements[0].id, 'cl-land111-episode');
  assert.equal(retirements[0].successor, 'cl-land111-midpoint');
  assert.equal(retirements[1].id, 'cl-fossil117-bridge');
  assert.equal(retirements[1].successor, null);

  // Undeclared change fails recovery digest check
  const tampered = structuredClone(modified.catalog);
  tampered.claims.find(c => c.id === 'cl-lcia-endpoint-units').text += '未声明篡改。';
  const tamperedResult = await applyRevisionsInverse({ ...modified, catalog: tampered }, [revision]);
  const tamperedDigest = editionDigest({
    ...inspectReadableBookEdition(tamperedResult.previousInput),
    structure: copyeditSourceStructure(tamperedResult.previousInput),
  });
  assert.notEqual(tamperedDigest, currentCheckpoint.stateDigest);

  // Plan overlay accepts declared record change (both raw and public projection) and rejects undeclared one
  const overlaidPlan = applyRevisionsToPlan(currentBookPlan, [revision], modified, previousInput);
  assert.equal(matchesAcceptedRecord(overlaidPlan, 'claims', modOld, modified.catalog.claims[modIdx], 'raw'), true);
  assert.equal(matchesAcceptedRecord(overlaidPlan, 'claims', modOld, { ...modified.catalog.claims[modIdx], text: '其他' }, 'raw'), false);

  const staticPlan = applyRevisionsToPlanStatic(currentBookPlan, [revision], modified.catalog);
  const pubOld = publicCatalog(previousInput.catalog).claims.find(c => c.id === modOld.id);
  const pubNew = publicCatalog(modified.catalog).claims.find(c => c.id === modOld.id);
  assert.equal(matchesAcceptedRecord(staticPlan, 'claims', pubOld, pubNew, 'public'), true);
  assert.equal(matchesAcceptedRecord(staticPlan, 'claims', pubOld, { ...pubNew, text: '其他' }, 'public'), false);
});

test('applyClaimRetirementsToCitations retargets retired claims to successor alias or chapter notice', () => {
  const route = '/docs/book/midpoint-endpoint-value-choices';
  const webPrefix = chapterAnchorPrefix(route);
  const printPrefix = printUnitAnchor(route);
  const oldWebId = chapterNoteAnchor(webPrefix, 'cl-lcia-midpoint-pathway');
  const oldPrintId = chapterNoteAnchor(printPrefix, 'cl-lcia-midpoint-pathway');

  const existingEntries = [
    {
      route,
      path: route,
      id: oldWebId,
      mode: 'retained',
      targets: [{ route, path: route, id: oldWebId, kind: 'note', claimId: 'cl-lcia-midpoint-pathway' }],
      edition: { sourceCommit: 'abc', sourceDate: '2026-11-12' },
    },
    {
      route,
      path: '/print',
      id: oldPrintId,
      mode: 'retained',
      targets: [{ route, path: '/print', id: oldPrintId, kind: 'note', claimId: 'cl-lcia-midpoint-pathway' }],
      edition: { sourceCommit: 'abc', sourceDate: '2026-11-12' },
    },
  ];

  const retirements = [
    {
      id: 'cl-lcia-midpoint-pathway',
      successor: 'cl-lcia-mid-end-conversion-limits',
      rationale: '并入中点终点关系段。',
      revisionId: 'rev-1',
      date: '2026-11-21',
      sourceCommit: 'fff371413af1436a9e7802831c349a583bfa41b6',
      routes: [route],
    },
    {
      id: 'cl-land111-episode',
      successor: 'cl-land111-midpoint',
      rationale: '并入土地中点段。',
      revisionId: 'rev-1',
      date: '2026-11-21',
      sourceCommit: 'fff371413af1436a9e7802831c349a583bfa41b6',
      routes: [route],
    },
    {
      id: 'cl-fossil117-bridge',
      successor: null,
      rationale: '过渡段已删除。',
      revisionId: 'rev-1',
      date: '2026-11-21',
      sourceCommit: 'fff371413af1436a9e7802831c349a583bfa41b6',
      routes: [route],
    },
  ];

  const retargeted = applyClaimRetirementsToCitations(existingEntries, retirements);

  // Existing hosted-history web & print entries retargeted in-place (no duplicates)
  const webAlias = retargeted.find(e => e.path === route && e.id === oldWebId);
  assert.equal(webAlias.mode, 'alias');
  assert.equal(webAlias.targets[0].claimId, 'cl-lcia-mid-end-conversion-limits');
  assert.equal(webAlias.targets[0].id, chapterNoteAnchor(webPrefix, 'cl-lcia-mid-end-conversion-limits'));
  assert.equal(webAlias.retiredFrom.claimId, 'cl-lcia-midpoint-pathway');

  const printAlias = retargeted.find(e => e.path === '/print' && e.id === oldPrintId);
  assert.equal(printAlias.mode, 'alias');
  assert.equal(printAlias.targets[0].id, chapterNoteAnchor(printPrefix, 'cl-lcia-mid-end-conversion-limits'));

  // Post-hostedHistory retired claim with successor gets web & print alias entries
  const landWeb = retargeted.find(e => e.path === route && e.id === chapterNoteAnchor(webPrefix, 'cl-land111-episode'));
  assert.equal(landWeb.mode, 'alias');
  assert.equal(landWeb.targets[0].claimId, 'cl-land111-midpoint');

  // Retired claim without successor gets chapter notice targeting nd-page (<article>)
  const fossilWeb = retargeted.find(e => e.path === route && e.id === chapterNoteAnchor(webPrefix, 'cl-fossil117-bridge'));
  assert.equal(fossilWeb.mode, 'notice');
  assert.equal(fossilWeb.targets[0].kind, 'chapter');
  assert.equal(fossilWeb.targets[0].id, 'nd-page');

  // Cross-route retirement emits notice on web and alias on /print
  const otherRoute = '/docs/book/climate-response-and-metrics';
  const crossRetargeted = applyClaimRetirementsToCitations([], [{
    id: 'cl-old-cross',
    successor: 'cl-new-in-other',
    successorRoute: otherRoute,
    rationale: '迁入气候章。',
    revisionId: 'rev-2',
    date: '2026-11-21',
    sourceCommit: 'fff371413af1436a9e7802831c349a583bfa41b6',
    routes: [route],
  }]);
  const crossWeb = crossRetargeted.find(e => e.path === route);
  assert.equal(crossWeb.mode, 'notice');
  assert.equal(crossWeb.targets[0].route, otherRoute);
  assert.equal(crossWeb.targets[0].path, otherRoute);
  const crossPrint = crossRetargeted.find(e => e.path === '/print');
  assert.equal(crossPrint.mode, 'alias');
  assert.equal(crossPrint.targets[0].route, otherRoute);

  // Multi-target notice preserves non-retired targets while retargeting retired ones
  const multiNotice = applyClaimRetirementsToCitations([{
    route,
    path: route,
    id: 'old-group',
    mode: 'notice',
    targets: [
      { route, path: route, id: oldWebId, kind: 'note', claimId: 'cl-lcia-midpoint-pathway' },
      { route, path: route, id: chapterNoteAnchor(webPrefix, 'cl-lcia-endpoint-units'), kind: 'note', claimId: 'cl-lcia-endpoint-units' },
    ],
    edition: { sourceCommit: 'abc', sourceDate: '2026-11-12' },
  }], [retirements[0]]);
  const updatedMulti = multiNotice.find(e => e.id === 'old-group');
  assert.equal(updatedMulti.targets.length, 2);
  assert.equal(updatedMulti.targets[0].claimId, 'cl-lcia-mid-end-conversion-limits');
  assert.equal(updatedMulti.targets[1].claimId, 'cl-lcia-endpoint-units');

  // Cycle in retirement successors throws
  assert.throws(() => applyClaimRetirementsToCitations(existingEntries, [
    { ...retirements[0], id: 'cl-a', successor: 'cl-b' },
    { ...retirements[0], id: 'cl-b', successor: 'cl-a' },
  ]), /Cycle/);
});

test('loadRevisions rejects tampered sha256 or path traversal and projectRevisionNumbering verifies toDigest', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kb-rev-test-'));
  try {
    await mkdir(join(dir, 'config', 'revisions'), { recursive: true });
    const revBody = JSON.stringify({
      schemaVersion: 1,
      id: 'rev-bad',
      date: '2026-11-21',
      title: 'Test',
      rationale: 'Test',
      routes: ['/docs/book/midpoint-endpoint-value-choices'],
      claims: [],
      files: [],
    });
    await writeFile(join(dir, 'config', 'revisions', 'rev-bad.json'), revBody);
    const index = {
      schemaVersion: 1,
      checkpointId: 'checkpoint-2026-11-21',
      revisions: [{ id: 'rev-bad', file: 'rev-bad.json', sha256: '0'.repeat(64) }],
    };
    await assert.rejects(() => loadRevisions(dir, index), /digest mismatch/);
    await assert.rejects(() => loadRevisions(dir, {
      ...index,
      revisions: [{ id: 'rev-bad', file: '../rev-bad.json', sha256: sha256(Buffer.from(revBody)) }],
    }), /Invalid revision entry/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }

  const prevNumbering = { parts: [{ number: 1, title: '旧标题' }] };
  const currNumbering = { parts: [{ number: 1, title: '新标题' }] };
  const revWithNumbering = {
    id: 'rev-num',
    files: [{
      path: 'config/reader-numbering.json',
      toDigest: editionDigest(currNumbering),
      previous: JSON.stringify(prevNumbering),
    }],
  };
  const projected = projectRevisionNumbering([revWithNumbering], currNumbering);
  assert.deepEqual(projected, prevNumbering);
  assert.throws(
    () => projectRevisionNumbering([revWithNumbering], { parts: [{ number: 1, title: '篡改标题' }] }),
    /declared toDigest/,
  );
});
