import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  applyRevisionsInverse,
  applyRouteChangesToCitations,
  extractRouteChanges,
  isRouteRevised,
  validateRevisionSchema,
  validateRouteChangesAgainstOutput,
} from './reader-revisions.mjs';

const sha256 = text => createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');

function makeMergeRevision(overrides = {}) {
  const oldA = '---\ntitle: 评价框架的形成\n---\n## 史料与事件 [#史料]\n<Prose ids="cl-1" />\n';
  const oldB = '---\ntitle: CML指南中的评价与改进\n---\n## 清单计算 [#清单]\n<Prose ids="cl-2" />\n';
  const merged = '---\ntitle: 评价框架与分析步骤\n---\n## 史料与分析任务 [#史料与职责]\n<Prose ids="cl-1" />\n## 清单计算 [#清单计算]\n<Prose ids="cl-2" />\n';

  return {
    oldA,
    oldB,
    merged,
    revision: {
      schemaVersion: 1,
      id: 'merge-ch4-demo',
      date: '2026-11-23',
      title: '合并第 4 章网页与合订本',
      rationale: '将原两页网页正文合并为单一章节，与书籍版保持一一对应。',
      routes: ['/docs/book/framework-responsibilities'],
      routeChanges: [
        {
          op: 'merge',
          from: ['/docs/book/framework-history', '/docs/book/cml-computation-judgment-and-improvement'],
          to: '/docs/book/framework-responsibilities',
          bookUnit: 'book-framework-responsibilities',
          anchors: {
            '/docs/book/framework-history#史料': '#史料与职责',
            '/docs/book/cml-computation-judgment-and-improvement#清单': '#清单计算',
          },
          rationale: '将《评价框架的形成》与《CML指南中的评价与改进》合并为第 4 章《评价框架与分析步骤》。',
        },
      ],
      claims: [],
      concepts: [],
      evidence: [],
      sources: [],
      mappings: [],
      files: [
        {
          op: 'delete',
          path: 'content/docs/book/framework-history.mdx',
          fromSha256: sha256(oldA),
          toSha256: null,
          previous: oldA,
        },
        {
          op: 'delete',
          path: 'content/docs/book/cml-computation-judgment-and-improvement.mdx',
          fromSha256: sha256(oldB),
          toSha256: null,
          previous: oldB,
        },
        {
          op: 'add',
          path: 'content/docs/book/framework-responsibilities.mdx',
          fromSha256: null,
          toSha256: sha256(merged),
          previous: null,
        },
      ],
      outputs: [],
      publicArtifacts: [],
      corrections: [],
      reviewEvidence: [],
      ...overrides,
    },
  };
}

test('validateRevisionSchema accepts valid routeChanges merge and file add/delete ops', () => {
  const { revision } = makeMergeRevision();
  assert.doesNotThrow(() => validateRevisionSchema(revision, 'merge-ch4-demo'));
});

test('validateRevisionSchema rejects malformed routeChanges and Clean-Delivery leaks', () => {
  // <2 routes in from
  assert.throws(
    () => validateRevisionSchema(makeMergeRevision({
      routeChanges: [{ op: 'merge', from: ['/docs/book/a'], to: '/docs/book/b', rationale: '合并说明' }],
    }).revision),
    /at least two/,
  );

  // target route inside from
  assert.throws(
    () => validateRevisionSchema(makeMergeRevision({
      routeChanges: [{ op: 'merge', from: ['/docs/book/a', '/docs/book/b'], to: '/docs/book/a', rationale: '合并说明' }],
    }).revision),
    /distinct/,
  );

  // internal cl- ID leak in rationale
  assert.throws(
    () => validateRevisionSchema(makeMergeRevision({
      routeChanges: [{ op: 'merge', from: ['/docs/book/a', '/docs/book/b'], to: '/docs/book/c', rationale: '合并 cl-foo 段落' }],
    }).revision),
    /without internal claim IDs/,
  );

  // bad anchor mapping (missing #)
  assert.throws(
    () => validateRevisionSchema(makeMergeRevision({
      routeChanges: [{ op: 'merge', from: ['/docs/book/a', '/docs/book/b'], to: '/docs/book/c', anchors: { '/docs/book/a#x': 'y' }, rationale: '合并说明' }],
    }).revision),
    /anchor mapping/,
  );
});

test('applyRevisionsInverse rolls back file add/delete transitions to exact pre-merge checkpoint files', async () => {
  const { oldA, oldB, merged, revision } = makeMergeRevision();
  const currentFiles = new Map([
    ['content/docs/book/framework-responsibilities.mdx', Buffer.from(merged, 'utf8')],
  ]);
  const input = {
    catalog: { claims: [], concepts: [], evidence: [], sources: [], mappings: [] },
    readings: {},
    literature: {},
    files: currentFiles,
  };

  const { previousInput } = await applyRevisionsInverse(input, [revision]);
  assert.equal(previousInput.files.has('content/docs/book/framework-responsibilities.mdx'), false);
  assert.equal(previousInput.files.get('content/docs/book/framework-history.mdx').toString('utf8'), oldA);
  assert.equal(previousInput.files.get('content/docs/book/cml-computation-judgment-and-improvement.mdx').toString('utf8'), oldB);
});

test('isRouteRevised and extractRouteChanges cover both old merged routes and new target route', () => {
  const { revision } = makeMergeRevision();
  const revs = [revision];
  assert.equal(isRouteRevised(revs, '/docs/book/framework-history'), true);
  assert.equal(isRouteRevised(revs, '/docs/book/cml-computation-judgment-and-improvement'), true);
  assert.equal(isRouteRevised(revs, '/docs/book/framework-responsibilities'), true);
  assert.equal(isRouteRevised(revs, '/docs/book/unrelated'), false);

  const extracted = extractRouteChanges(revs);
  assert.equal(extracted.merges.length, 1);
  assert.equal(extracted.fromToMap.get('/docs/book/framework-history').to, '/docs/book/framework-responsibilities');
});

test('applyRouteChangesToCitations retargets web citations & anchors while preserving /print book anchors', () => {
  const { revision } = makeMergeRevision();
  const entries = [
    {
      route: '/docs/book/framework-history',
      path: '/docs/book/framework-history',
      id: 'old-heading',
      mode: 'alias',
      targets: [{ route: '/docs/book/framework-history', path: '/docs/book/framework-history', id: '史料', kind: 'heading' }],
    },
    {
      route: 'book-framework-responsibilities',
      path: '/print',
      id: 'print-unit-demo',
      mode: 'retained',
      targets: [{ route: 'book-framework-responsibilities', path: '/print', id: 'print-unit-demo', kind: 'chapter' }],
    },
    {
      route: '/docs/book/framework-history',
      path: '/docs/book/framework-history',
      id: 'note-1',
      mode: 'alias',
      targets: [{ route: '/docs/book/framework-history', path: '/docs/book/framework-history', id: 'old-note', kind: 'note', claimId: 'cl-1' }],
    },
  ];

  const remapped = applyRouteChangesToCitations(entries, [revision]);
  assert.equal(remapped[0].targets[0].route, '/docs/book/framework-responsibilities');
  assert.equal(remapped[0].targets[0].path, '/docs/book/framework-responsibilities');
  assert.equal(remapped[0].targets[0].id, '史料与职责');
  // Print anchor stays untouched
  assert.equal(remapped[1].targets[0].path, '/print');
  assert.equal(remapped[1].targets[0].id, 'print-unit-demo');
  // Note anchor updates prefix cleanly
  assert.equal(remapped[2].targets[0].route, '/docs/book/framework-responsibilities');
  assert.match(remapped[2].targets[0].id, /cl-1/);
});

test('validateRouteChangesAgainstOutput catches missing target, lingering legacy route, and broken anchor', () => {
  const { revision } = makeMergeRevision();
  const anchors = new Map([
    ['/docs/book/framework-responsibilities', new Set(['史料与职责', '清单计算'])],
  ]);

  // Valid output
  assert.deepEqual(
    validateRouteChangesAgainstOutput([revision], ['/docs/book/framework-responsibilities'], anchors),
    [],
  );

  // Target route missing
  const missingTarget = validateRouteChangesAgainstOutput([revision], ['/docs/book/other'], anchors);
  assert.equal(missingTarget.length, 1);
  assert.match(missingTarget[0], /absent from active routes/);

  // Legacy route still active
  const legacyStillActive = validateRouteChangesAgainstOutput(
    [revision],
    ['/docs/book/framework-responsibilities', '/docs/book/framework-history'],
    anchors,
  );
  assert.equal(legacyStillActive.length, 1);
  assert.match(legacyStillActive[0], /still appears in active routes/);

  // Anchor missing on target
  const badAnchors = new Map([['/docs/book/framework-responsibilities', new Set(['史料与职责'])]]);
  const missingAnchor = validateRouteChangesAgainstOutput([revision], ['/docs/book/framework-responsibilities'], badAnchors);
  assert.equal(missingAnchor.length, 1);
  assert.match(missingAnchor[0], /missing heading/);
});

test('routeChanges supports combined merge, split, move, and retire-unit operations with anchor and chain validation', () => {
  const baseRev = {
    schemaVersion: 1,
    id: 'rev-1-add-temp',
    date: '2026-11-26',
    title: '新增背景数据库两章',
    rationale: '补充背景数据库章节。',
    routes: ['/docs/book/db-a', '/docs/book/db-b'],
    routeChanges: [
      { op: 'add-unit', route: '/docs/book/db-a', kind: 'chapter', rationale: '新增数据库格局一章。' },
      { op: 'add-unit', route: '/docs/book/db-b', kind: 'chapter', rationale: '新增数据库分歧一章。' },
    ],
    claims: [],
    concepts: [],
    evidence: [],
    sources: [],
    mappings: [],
    files: [],
    outputs: [],
    publicArtifacts: [],
    corrections: [],
    reviewEvidence: [],
  };

  const reorgRev = {
    schemaVersion: 1,
    id: 'rev-2-reorg-combined',
    date: '2026-11-27',
    title: '全书结构整合与拆分',
    rationale: '按内容体量重组部分章节并保持旧链接可追踪。',
    routes: [
      '/docs/book/db-merged',
      '/docs/book/impact-structure',
      '/docs/book/ozone-and-radiation',
      '/docs/book/resources-land-biodiversity',
      '/docs/book/temporal-and-future',
      '/docs/book/cleaner-origin',
    ],
    routeChanges: [
      {
        op: 'merge',
        from: ['/docs/book/db-a', '/docs/book/db-b'],
        to: '/docs/book/db-merged',
        anchors: { '/docs/book/db-a#s1': '#s1-merged' },
        rationale: '合并两章背景数据库内容。',
      },
      {
        op: 'split',
        from: '/docs/book/midpoint-and-endpoint',
        to: ['/docs/book/impact-structure', '/docs/book/ozone-and-radiation', '/docs/book/resources-land-biodiversity'],
        primaryTo: '/docs/book/impact-structure',
        anchors: {
          '/docs/book/midpoint-and-endpoint#structure': '/docs/book/impact-structure#structure',
          '/docs/book/midpoint-and-endpoint#ozone': '/docs/book/ozone-and-radiation#ozone',
          '/docs/book/midpoint-and-endpoint#resources': '/docs/book/resources-land-biodiversity#resources',
        },
        rationale: '将原单章按主题拆分为三章。',
      },
      {
        op: 'move',
        from: '/docs/book/future-technology-and-context',
        to: '/docs/book/temporal-and-future',
        fromPart: 8,
        toPart: 5,
        anchors: { '/docs/book/future-technology-and-context#scenarios': '#future-scenarios' },
        rationale: '将未来技术与情景移入时间尺度部并更新路径。',
      },
      {
        op: 'move',
        from: '/docs/book/product-footprint-rules',
        to: '/docs/book/product-footprint-rules',
        fromPart: 7,
        toPart: 8,
        rationale: '调整产品足迹规则所属分部。',
      },
      {
        op: 'retire-unit',
        route: '/docs/book/cleaner-production-old',
        successor: '/docs/book/cleaner-origin',
        successorAnchor: '#cleaner-section',
        rationale: '并入第一部对应小节。',
      },
    ],
    claims: [],
    concepts: [],
    evidence: [],
    sources: [],
    mappings: [],
    files: [],
    outputs: [],
    publicArtifacts: [],
    corrections: [],
    reviewEvidence: [],
  };

  assert.doesNotThrow(() => validateRevisionSchema(baseRev, 'baseRev'));
  assert.doesNotThrow(() => validateRevisionSchema(reorgRev, 'reorgRev'));

  // Reject malformed split/move/retire-unit schemas
  assert.throws(
    () => validateRevisionSchema({ ...reorgRev, routeChanges: [{ op: 'split', from: '/docs/a', to: ['/docs/b'], rationale: '拆分' }] }),
    /at least two/,
  );
  assert.throws(
    () => validateRevisionSchema({ ...reorgRev, routeChanges: [{ op: 'move', from: '/docs/a', to: '/docs/a', rationale: '移动' }] }),
    /distinct fromPart and toPart/,
  );
  assert.throws(
    () => validateRevisionSchema({ ...reorgRev, routeChanges: [{ op: 'retire-unit', route: '/docs/a', successor: null, successorAnchor: '#x', rationale: '退役' }] }),
    /successorAnchor requires a non-null successor/,
  );
  assert.throws(
    () => validateRevisionSchema({ ...reorgRev, routeChanges: [{ op: 'retire-unit', route: '/docs/a', successor: '/docs/b', rationale: '退役 cl-123' }] }),
    /without internal claim IDs/,
  );

  const revs = [baseRev, reorgRev];
  const extracted = extractRouteChanges(revs);
  assert.equal(extracted.splits.length, 1);
  assert.equal(extracted.moves.length, 2);
  assert.equal(extracted.retiredUnits.length, 1);
  assert.equal(extracted.removedRouteSet.has('/docs/book/db-a'), true);
  assert.equal(extracted.removedRouteSet.has('/docs/book/midpoint-and-endpoint'), true);
  assert.equal(extracted.removedRouteSet.has('/docs/book/future-technology-and-context'), true);
  assert.equal(extracted.removedRouteSet.has('/docs/book/cleaner-production-old'), true);
  assert.equal(extracted.removedRouteSet.has('/docs/book/product-footprint-rules'), false);

  assert.equal(isRouteRevised(revs, '/docs/book/midpoint-and-endpoint'), true);
  assert.equal(isRouteRevised(revs, '/docs/book/ozone-and-radiation'), true);
  assert.equal(isRouteRevised(revs, '/docs/book/future-technology-and-context'), true);
  assert.equal(isRouteRevised(revs, '/docs/book/cleaner-production-old'), true);

  const activeRoutes = [
    '/docs/book/db-merged',
    '/docs/book/impact-structure',
    '/docs/book/ozone-and-radiation',
    '/docs/book/resources-land-biodiversity',
    '/docs/book/temporal-and-future',
    '/docs/book/product-footprint-rules',
    '/docs/book/cleaner-origin',
  ];
  const anchors = new Map([
    ['/docs/book/db-merged', new Set(['s1-merged'])],
    ['/docs/book/impact-structure', new Set(['structure'])],
    ['/docs/book/ozone-and-radiation', new Set(['ozone'])],
    ['/docs/book/resources-land-biodiversity', new Set(['resources'])],
    ['/docs/book/temporal-and-future', new Set(['future-scenarios'])],
    ['/docs/book/cleaner-origin', new Set(['cleaner-section'])],
  ]);

  // Earlier add-unit routes superseded by later merge do NOT falsely fail active-route checks
  assert.deepEqual(validateRouteChangesAgainstOutput(revs, activeRoutes, anchors), []);

  // Stale retired / split / moved route still active is caught
  const staleErrs = validateRouteChangesAgainstOutput(revs, [...activeRoutes, '/docs/book/cleaner-production-old'], anchors);
  assert.ok(staleErrs.some(e => e.includes('Retired unit route still appears')));

  // Missing split heading anchor is caught
  const badSplitAnchors = new Map(anchors);
  badSplitAnchors.set('/docs/book/ozone-and-radiation', new Set());
  const anchorErrs = validateRouteChangesAgainstOutput(revs, activeRoutes, badSplitAnchors);
  assert.ok(anchorErrs.some(e => e.includes('missing heading') && e.includes('ozone')));

  // Citation retargeting across split, move, and retire-unit
  const remapped = applyRouteChangesToCitations([
    {
      route: '/docs/book/midpoint-and-endpoint',
      path: '/docs/book/midpoint-and-endpoint',
      id: 'old-ozone',
      mode: 'alias',
      targets: [{ route: '/docs/book/midpoint-and-endpoint', path: '/docs/book/midpoint-and-endpoint', id: 'ozone', kind: 'heading' }],
    },
    {
      route: '/docs/book/future-technology-and-context',
      path: '/docs/book/future-technology-and-context',
      id: 'old-future',
      mode: 'alias',
      targets: [{ route: '/docs/book/future-technology-and-context', path: '/docs/book/future-technology-and-context', id: 'scenarios', kind: 'heading' }],
    },
    {
      route: '/docs/book/cleaner-production-old',
      path: '/docs/book/cleaner-production-old',
      id: 'old-cleaner',
      mode: 'alias',
      targets: [{ route: '/docs/book/cleaner-production-old', path: '/docs/book/cleaner-production-old', id: 'intro', kind: 'heading' }],
    },
  ], revs);
  assert.equal(remapped[0].targets[0].route, '/docs/book/ozone-and-radiation');
  assert.equal(remapped[0].targets[0].id, 'ozone');
  assert.equal(remapped[1].targets[0].route, '/docs/book/temporal-and-future');
  assert.equal(remapped[1].targets[0].id, 'future-scenarios');
  assert.equal(remapped[2].targets[0].route, '/docs/book/cleaner-origin');
  assert.equal(remapped[2].targets[0].id, 'cleaner-section');
});
