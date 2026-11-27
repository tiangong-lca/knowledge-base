import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { publicCatalog } from './knowledge.mjs';
import * as expectations from './reader-current-expectations.mjs';
import { buildPublicChangesLedger } from './reader-changes-ledger.mjs';
import { showEditorialHistoryInProse } from './reader-editorial-mode.mjs';
import { readerInternalIds, validateCleanDeliveryOutput, validateReaderText } from './reader-surface.mjs';

test('Clean Public Delivery mode defaults to false and enables only on READER_EDITORIAL_HISTORY=1', () => {
  assert.equal(showEditorialHistoryInProse({}), false);
  assert.equal(showEditorialHistoryInProse({ READER_EDITORIAL_HISTORY: '0' }), false);
  assert.equal(showEditorialHistoryInProse({ READER_EDITORIAL_HISTORY: 'true' }), false);
  assert.equal(showEditorialHistoryInProse({ READER_EDITORIAL_HISTORY: '1' }), true);
});

test('Public /changes/ ledger aggregates all reviewed iterations, corrections, and part introductions cleanly without internal ID leaks', async () => {
  const [catalog, literature, readings] = await Promise.all([
    fs.readFile('knowledge/catalog.json', 'utf8').then(JSON.parse),
    fs.readFile('knowledge/research/literature-map.json', 'utf8').then(JSON.parse),
    fs.readFile('knowledge/research/readings.json', 'utf8').then(JSON.parse),
  ]);
  const knownIds = readerInternalIds(publicCatalog(catalog), literature, readings);
  const ledger = buildPublicChangesLedger();
  const ledgerIds = new Set(ledger.iterations.map(i => i.id));
  for (const [name, value] of Object.entries(expectations)) {
    if (!name.startsWith('current') || name === 'currentBookPlan' || typeof value === 'function' || !value?.id) continue;
    assert(ledgerIds.has(value.id), `Missing reviewed unit ${name} (${value.id}) in buildPublicChangesLedger()`);
  }
  assert(ledger.iterations.length >= 30, `Expected >= 30 reviewed iterations, got ${ledger.iterations.length}`);
  assert(ledger.corrections.length >= 50, `Expected >= 50 deduplicated named corrections, got ${ledger.corrections.length}`);
  assert(ledger.partIntroductions.length >= 3, `Expected >= 3 part introductions, got ${ledger.partIntroductions.length}`);

  const visibleProse = [
    ...ledger.iterations.map(i => `${i.date} ${i.routeLabels.join('、')} ${i.rationale}`),
    ...ledger.corrections.map(c => `${c.date} ${c.chapterTitle} ${c.scope}`),
    ...ledger.partIntroductions.map(p => `${p.date} ${p.title} ${p.from}`),
  ].join('\n');
  const textErrors = validateReaderText(visibleProse, { label: 'changes/index.html', knownIds, allowAIStatement: true });
  assert.deepEqual(textErrors, []);
});

test('Clean-Delivery Gate passes clean prose + bilingual /changes/ ledger and fails closed on forbidden controls', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'kb-clean-delivery-'));
  try {
    const publicLedger = {
      revisions: [{ id: 'pub-1' }],
      errata: [{ id: 'err-1' }],
    };
    await fs.mkdir(path.join(tmp, 'changes'), { recursive: true });
    await fs.mkdir(path.join(tmp, 'en', 'changes'), { recursive: true });
    const goodChanges = `<!doctype html><html><body><main id="main-content"><section data-reader-changes-ledger="zh">
      <li data-public-revision="pub-1"></li>
      <li data-public-erratum="err-1"></li>
    </section></main></body></html>`;
    await fs.writeFile(path.join(tmp, 'changes/index.html'), goodChanges);
    await fs.writeFile(path.join(tmp, 'en/changes/index.html'), goodChanges);

    const cleanDoc = htmlParser.parse('<article data-reader-route="/docs/book/test"><h1>正文标题</h1><p>干净正文。</p></article>');
    assert.deepEqual(await validateCleanDeliveryOutput(tmp, new Map([['/docs/book/test', cleanDoc]]), publicLedger), []);

    const badCases = [
      '<article data-reader-route="/docs/book/test"><details data-copyedit-history="h1"><summary>旧题</summary></details></article>',
      '<article data-reader-route="/docs/book/test"><details data-revisable-judgment-history="s1"><summary>范围</summary></details></article>',
      '<section class="print-part"><details data-part6-reread-part="6"><summary>导言</summary></details></section>',
      '<article data-reader-route="/docs/book/test"><p data-part6-reread-correction="cl-1">修订</p></article>',
      '<article data-reader-route="/docs/book/test"><div data-legacy-scope="s1">旧范围</div></article>',
      '<article data-reader-route="/docs/book/test"><p class="legacy-citation-context">裸露历史框</p></article>',
      '<article data-reader-route="/docs/book/test"><p>此处在 2026-11-12 版题为“旧题”。</p></article>',
      '<article data-reader-route="/docs/book/test"><p>2026-11-19 版「判断依据与修订」的引用范围</p></article>',
      '<article data-reader-route="/docs/book/test"><p>2026-11-19 修订：前版如此。</p></article>',
      '<article data-reader-route="/docs/book/test"><p><a href="/x">查看前版源文件</a></p></article>',
    ];
    for (const html of badCases) {
      const errs = await validateCleanDeliveryOutput(tmp, new Map([['/docs/book/test', htmlParser.parse(html)]]), publicLedger);
      assert(errs.length > 0, `Expected clean-delivery violation for: ${html}`);
    }

    await fs.writeFile(
      path.join(tmp, 'changes/index.html'),
      '<main id="main-content"><section data-reader-changes-ledger="zh"><li data-changes-iteration="unit-1"></li></section></main>',
    );
    const leakedBatchErrs = await validateCleanDeliveryOutput(tmp, new Map([['/docs/book/test', cleanDoc]]), publicLedger);
    assert(leakedBatchErrs.some(e => e.includes('internal batch/iteration ledger')));
    assert(leakedBatchErrs.some(e => e.includes('missing public revision entry pub-1')));
    assert(leakedBatchErrs.some(e => e.includes('missing public erratum entry err-1')));
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
});
