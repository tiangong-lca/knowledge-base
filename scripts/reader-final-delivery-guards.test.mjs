import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { readerInternalIds, validateReaderHtml, validateReaderIndex } from './reader-surface.mjs';

const knownIds = readerInternalIds({
  claims: [{ id: 'cl-guard-sample' }],
  evidence: [{ id: 'ev-guard-sample' }],
  sources: [{ id: 'src-guard-sample' }],
  readings: [{ id: 'rd-guard-sample' }],
});

test('Phase 1F final-delivery guard rejects all retired ZH UI and development-process phrases', () => {
  const retiredZh = [
    '网页细读目录',
    '书籍目录与连续阅读',
    '本轮完成修订',
    '核读记录已更新',
    '书目与核读',
    '待核说明见下文',
    '暂标为待核',
    '已核对一手来源',
    '本库仅发布释义',
    '原件留在私有缓存',
    '原件存入私人任务缓存',
    '私有临时研究目录',
    '尚待正式购买授权',
    'PDF 零基索引 3',
    'NEPIS 零基分页块 4',
    '见 pdfIndices 列表',
    '规范论述清单',
    '已发布迭代修订清单',
    '具名论述更正清单',
    '整合改写试点',
    '整部连续回读',
    '全书连续回读',
    '最终统稿记录',
    '载体 SHA-256 回执',
    'cl-guard-sample',
    'ev-guard-sample',
    'src-guard-sample',
    'rd-guard-sample',
    'a'.repeat(64),
  ];
  for (const phrase of retiredZh) {
    const html = `<!doctype html><html lang="zh-CN"><head><title>测试</title></head><body><main><p>${phrase}</p></main></body></html>`;
    const errors = validateReaderHtml(html, { label: 'zh/docs/book/test/index.html', knownIds, locale: 'zh' });
    assert(errors.length > 0, `Expected ZH final-delivery guard to reject: "${phrase}"`);
  }
});

test('Phase 1F final-delivery guard rejects all retired EN UI and development-process phrases', () => {
  const retiredEn = [
    'Web Reading Contents',
    'Changelog & Errata',
    'For international readers: see below',
    'English edition reader note',
    'meaning-equivalent English edition',
    'meaning-equivalent monograph',
    'cryptographically aligned with the Chinese text',
    'this library stores original files privately',
    'PDF 0-based index 4',
    'zero-based page number',
    'pending licensed full-text inspection',
    'Primary source verified',
    'Chinese Editions & Errata ledger',
    'Archive member (SHA-256 verified, accessed 2026-11-10)',
  ];
  for (const phrase of retiredEn) {
    const html = `<!doctype html><html lang="en"><head><title>Test</title></head><body><main><p>${phrase}</p></main></body></html>`;
    const errors = validateReaderHtml(html, { label: 'en/docs/book/test/index.html', knownIds, locale: 'en' });
    assert(errors.length > 0, `Expected EN final-delivery guard to reject: "${phrase}"`);
  }
});

test('Phase 1F final-delivery guard inspects <title> and <meta> description / OpenGraph tags', () => {
  const badTitle = '<!doctype html><html><head><title>参考文献 — 书目与核读</title></head><body><main><p>干净正文。</p></main></body></html>';
  assert(validateReaderHtml(badTitle, { label: 'zh/research/index.html', locale: 'zh' }).some(e => e.includes('<title>')));

  const badMeta = '<!doctype html><html><head><title>References</title><meta name="description" content="Explore this library of primary sources." /></head><body><main><p>Clean body.</p></main></body></html>';
  assert(validateReaderHtml(badMeta, { label: 'en/research/index.html', locale: 'en' }).some(e => e.includes('<meta description>')));

  const badOg = '<!doctype html><html><head><title>Guide</title><meta property="og:description" content="含中文泄漏的英文描述" /></head><body><main><p>Clean body.</p></main></body></html>';
  assert(validateReaderHtml(badOg, { label: 'en/coverage/index.html', locale: 'en' }).some(e => e.includes('CJK')));
});

test('Phase 1F EN script-leak guard blocks leaked Han/Kana while permitting .english-term and /zh/ language switchers', () => {
  const validEn = `<!doctype html><html lang="en"><head><title>Concept Index</title><meta name="description" content="Core LCA concepts." /></head>
    <body>
      <header><a href="/zh/concepts/">中文</a></header>
      <main><h2>Functional Unit<span class="english-term">功能单位</span></h2><p>Clean English explanation.</p></main>
    </body></html>`;
  assert.deepEqual(validateReaderHtml(validEn, { label: 'en/concepts/index.html', locale: 'en' }), []);

  const leakedHan = '<!doctype html><html lang="en"><head><title>Sources</title></head><body><main><p>Section 3 第 12 页</p></main></body></html>';
  assert(validateReaderHtml(leakedHan, { label: 'en/sources/index.html', locale: 'en' }).some(e => e.includes('CJK')));

  const leakedKana = '<!doctype html><html lang="en"><head><title>Timeline</title></head><body><main><p>環境影響評価手法 LIME の解説</p></main></body></html>';
  assert(validateReaderHtml(leakedKana, { label: 'en/timeline/index.html', locale: 'en' }).some(e => e.includes('CJK')));
});

test('Phase 1F AI disclosure guard allows single disclosure on ZH/EN print & changes and blocks elsewhere', () => {
  const enDisclosure = '<!doctype html><html lang="en"><head><title>Print</title></head><body><main><p>Source verification was assisted by AI.</p></main></body></html>';
  assert.deepEqual(validateReaderHtml(enDisclosure, { label: 'en/print/index.html', allowAIStatement: true, locale: 'en' }), []);
  assert(validateReaderHtml(enDisclosure, { label: 'en/docs/book/test/index.html', allowAIStatement: false, locale: 'en' }).length > 0);
  const dup = enDisclosure.replace('</main>', '<p>Source verification was assisted by AI.</p></main>');
  assert(validateReaderHtml(dup, { label: 'en/print/index.html', allowAIStatement: true, locale: 'en' }).some(e => e.includes('only once')));

  assert.deepEqual(validateReaderIndex('# Title\n- [Home](/en/)\n- [Revisions & Errata](/en/changes/)'), []);
  assert(validateReaderIndex('# Title\n- [Changelog & Errata](/en/changes/)').length > 0);
});

test('Phase 1F anti-hardcoded-count guard ensures Home, Book Guide, Print, Timeline, SEO and Search derive counts dynamically', () => {
  const files = [
    'components/zh-home-page.tsx',
    'components/en-home-page.tsx',
    'app/(locale)/[lang]/coverage/page.tsx',
    'app/(locale)/[lang]/print/page.tsx',
    'app/(locale)/[lang]/timeline/page.tsx',
    'app/(entry)/layout.tsx',
    'app/(locale)/[lang]/layout.tsx',
    'lib/seo-policy.mjs',
    'lib/search-entries.ts',
    'config/reader-guide.json',
    'config/editions/en/reader-guide.json',
  ];
  const forbiddenCounts = [
    { label: 'hardcoded 37/32 chapters (ZH)', re: /(?:37|32)\s*章/ },
    { label: 'hardcoded 37/32 chapters (EN)', re: /\b(?:37|32)[-\s]+chapters?\b/i },
    { label: 'hardcoded 7/8 parts (ZH)', re: /(?<!第)(?:[七八78])\s*部/ },
    { label: 'hardcoded 7/8 parts (EN)', re: /\b(?:seven|eight|7|8)[-\s]+parts?\b/i },
    { label: 'hardcoded 27 milestones', re: /\b27\s*(?:key\s+)?milestones?\b|27\s*个(?:关键)?节点/i },
    { label: 'hardcoded Appendix E (timeline/home/guide)', re: /附录\s*E《生命周期评价发展大事记》|Appendix\s+E:\s*Historical\s+Timeline/i },
  ];
  for (const rel of files) {
    const content = fs.readFileSync(path.resolve(rel), 'utf8');
    for (const rule of forbiddenCounts) {
      assert.equal(
        rule.re.test(content),
        false,
        `${rel} must not contain ${rule.label} (matched: ${content.match(rule.re)?.[0]})`,
      );
    }
  }
});
