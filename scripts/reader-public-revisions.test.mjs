import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPublicRevisionsAndErrata, validatePublicRevisions } from './reader-public-revisions.mjs';

test('production public revisions & errata pass bilingual, route-resolution, and clean-prose validation', () => {
  assert.deepEqual(validatePublicRevisions(), []);
  const { revisions, errata, all } = buildPublicRevisionsAndErrata();
  assert.ok(revisions.length >= 4);
  assert.ok(errata.length >= 3);
  assert.equal(all.length, revisions.length + errata.length);
  for (const item of all) {
    assert.ok(item.routes.every(r => r.exists && r.zhHref.startsWith('/zh/') && r.enHref.startsWith('/en/')));
  }
  const dbEntry = revisions.find(r => r.id === 'pub-2026-11-26-background-databases');
  assert.ok(dbEntry, 'expected background databases revision entry');
  assert.match(dbEntry.routes[0].zhLabel, /^第 \d+ 章《/);
  assert.match(dbEntry.routes[0].enLabel, /^Chapter \d+:/);
});

test('validatePublicRevisions rejects dead routes, leaked Han in English, and developer jargon', () => {
  const baseEntry = {
    id: 'test-1',
    date: '2026-11-27',
    kind: 'addition',
    routes: ['/docs/book'],
    title: { zh: '新增章节', en: 'Added chapter' },
    summary: { zh: '补充说明。', en: 'Added explanation.' },
  };
  assert.deepEqual(validatePublicRevisions({ entries: [baseEntry], revisions: [] }), []);

  const deadRoute = validatePublicRevisions({
    entries: [{ ...baseEntry, routes: ['/docs/book/nonexistent-route'] }],
    revisions: [],
  });
  assert.ok(deadRoute.some(e => e.includes('does not exist')));

  const hanLeak = validatePublicRevisions({
    entries: [{ ...baseEntry, summary: { zh: '说明', en: 'Added 中文 text.' } }],
    revisions: [],
  });
  assert.ok(hanLeak.some(e => e.includes('leaked Han')));

  const devJargon = validatePublicRevisions({
    entries: [{ ...baseEntry, title: { zh: '批次 1A 试点回读', en: 'Batch 1A pilot reread' } }],
    revisions: [],
  });
  assert.ok(devJargon.some(e => e.includes('title.zh')));
  assert.ok(devJargon.some(e => e.includes('title.en')));

  const withOptIn = buildPublicRevisionsAndErrata({
    entries: [baseEntry],
    revisions: [
      {
        id: 'rev-optin',
        date: '2026-11-28',
        routes: ['/docs/book'],
        publicSummary: {
          kind: 'structure',
          title: { zh: '调整结构', en: 'Reorganized structure' },
          summary: { zh: '更新章节归属。', en: 'Updated chapter placement.' },
        },
      },
    ],
  });
  assert.equal(withOptIn.revisions[0].id, 'rev-optin');
});
