import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  computeZhClaimDigest,
  detectEnglishDraftChapterNumbers,
  detectEnglishProcessProse,
  detectLeakedHan,
  extractNumericTokens,
  lintEnglishTermbase,
  validateBilingualEditions,
  validateSameLocaleLinks,
} from './reader-bilingual.mjs';
import {
  entryDestination,
  languageDestination,
  languagePreferenceKey,
  saveManualLanguage,
} from '../lib/locale-preference.mjs';
import { homePath, languageAlternates } from '../lib/seo-policy.mjs';
import { extractRouteChanges, validateRevisionSchema } from './reader-revisions.mjs';

test('locale preference matches docs policy: manual wins, non-zh defaults to /en/ when enabled, never writes automatically', () => {
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };

  // Disabled during P1 rollout
  assert.equal(entryDestination('https://prism.tiangong.earth/', { getStorage: () => storage, languages: ['en-US'] }, { enPublicEnabled: false }), undefined);
  // Enabled in P3: English browser redirects to /en/
  assert.equal(entryDestination('https://prism.tiangong.earth/', { getStorage: () => storage, languages: ['en-US'] }, { enPublicEnabled: true }), '/en/');
  assert.equal(store.size, 0, 'automatic detection must never write storage');
  // Chinese browser stays on /
  assert.equal(entryDestination('https://prism.tiangong.earth/', { getStorage: () => storage, languages: ['zh-CN', 'en'] }, { enPublicEnabled: true }), undefined);
  // Manual choice overrides browser
  saveManualLanguage(() => storage, 'zh');
  assert.equal(store.get(languagePreferenceKey), 'zh');
  assert.equal(entryDestination('https://prism.tiangong.earth/', { getStorage: () => storage, languages: ['en-US'] }, { enPublicEnabled: true }), undefined);
  // Non-root paths never negotiate
  assert.equal(entryDestination('https://prism.tiangong.earth/zh/docs/', { getStorage: () => storage, languages: ['en-US'] }, { enPublicEnabled: true }), undefined);
});

test('languageDestination preserves route, maps anchors, and falls back to guide when unpublished', () => {
  const published = new Set(['/en/docs/book/joint-production/', '/zh/docs/book/joint-production/']);
  assert.equal(
    languageDestination('https://prism.tiangong.earth/zh/docs/book/joint-production/#%E8%B4%9F%E6%8B%85%E4%BB%BD%E9%A2%9D', 'en', {
      publishedPaths: published,
      anchorMap: { '负担份额': 'burden-shares' },
    }),
    '/en/docs/book/joint-production/#burden-shares',
  );
  assert.equal(
    languageDestination('https://prism.tiangong.earth/zh/docs/book/unpublished-chapter/', 'en', { publishedPaths: published }),
    '/en/coverage/#in-prep-docs-book-unpublished-chapter',
  );
});

test('seo-policy emits hreflang only for published counterparts and never /zh/ for home', () => {
  assert.equal(homePath('zh'), '/');
  assert.equal(homePath('en'), '/en/');
  assert.deepEqual(languageAlternates('', ['zh', 'en']), {
    'x-default': '/',
    'zh-CN': '/',
    en: '/en/',
  });
  assert.deepEqual(languageAlternates('/docs/book/joint-production', ['zh']), {
    'x-default': '/zh/docs/book/joint-production/',
    'zh-CN': '/zh/docs/book/joint-production/',
  });
});

test('bilingual parity guards catch drift, draft chapter numbers, process prose, Han leaks, and cross-locale links', () => {
  assert.deepEqual(extractNumericTokens('1,048 respondents; 40.28% avoided 6.1 g.'), ['1048', '40.28%', '6.1']);
  assert.equal(detectEnglishProcessProse('See WP8 and cl-wall-question in PR #244.').length, 2);
  assert.equal(detectEnglishProcessProse('The ILCD Handbook (2010) specifies critical review.').length, 0);

  assert.equal(detectEnglishDraftChapterNumbers('As shown in Chapter 29, the coating model uses four processes.').length, 1);
  assert.equal(detectEnglishDraftChapterNumbers('IPCC AR6 WGI Chapter 7 defines GWP100, and ecoinvent v3 Chapter 10 models pedigree variance.').length, 0);

  assert.equal(detectLeakedHan('The standard GB/T 24067 (温室气体) defines boundaries.', ['温室气体']).length, 0);
  assert.equal(detectLeakedHan('This leaks 未翻译文本 into English prose.', []).length, 1);

  assert.equal(validateSameLocaleLinks('en', ['/en/docs/book/', '/zh/docs/book/']).length, 1);
  assert.equal(validateSameLocaleLinks('en', ['/en/docs/book/', '/zh/docs/book/'], { allowedCrossLocale: new Set(['/zh/docs/book/']) }).length, 0);

  const termbase = { terms: [{ zh: '功能单位', en: 'functional unit', avoid: ['function unit'] }] };
  assert.equal(lintEnglishTermbase('Define the function unit first.', termbase).length, 1);
  assert.equal(lintEnglishTermbase('Define the functional unit first.', termbase).length, 0);
});

test('validateBilingualEditions enforces zhDigest staleness and pendingSync', () => {
  const dir = mkdtempSync(join(tmpdir(), 'kb-bilingual-'));
  try {
    mkdirSync(join(dir, 'knowledge/editions/en'), { recursive: true });
    const zhClaim = { id: 'cl-1', text: '中文原文', scope: '范围', caveats: ['边界'] };
    const catalog = { claims: [zhClaim], evidence: [{ id: 'ev-1' }] };
    const goodDigest = computeZhClaimDigest(zhClaim);

    writeFileSync(join(dir, 'knowledge/editions/alignment.json'), JSON.stringify({
      schemaVersion: 1,
      units: { '/docs/book/sample': { enStatus: 'published', slots: [{ kind: 'shared', id: 'cl-1' }] } },
    }));
    writeFileSync(join(dir, 'knowledge/editions/en/claims.json'), JSON.stringify({
      schemaVersion: 1,
      claims: [{ id: 'cl-1', status: 'published', zhDigest: 'stale-digest', text: 'English prose.' }],
    }));
    const staleRes = validateBilingualEditions(dir, catalog);
    assert.ok(staleRes.errors.some((e) => e.includes('Stale English claim cl-1')));

    writeFileSync(join(dir, 'knowledge/editions/en/claims.json'), JSON.stringify({
      schemaVersion: 1,
      claims: [{ id: 'cl-1', status: 'published', zhDigest: goodDigest, text: 'English prose.' }],
    }));
    const okRes = validateBilingualEditions(dir, catalog);
    assert.deepEqual(okRes.errors, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('reader-revisions supports op: relocate-prefix for /zh locale prefix migration', () => {
  const rev = {
    schemaVersion: 1,
    id: 'p1-locale-prefix-migration',
    date: '2026-11-23',
    task: '#248',
    title: 'Migrate Chinese routes under /zh/ prefix',
    rationale: 'Adopt full /zh/ and /en/ locale prefixes aligned with docs/tidas while preserving 301 redirects.',
    routes: ['/docs/book'],
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
    routeChanges: [
      { op: 'relocate-prefix', fromPrefix: '', toPrefix: '/zh', rationale: 'Relocate Chinese public routes under /zh/.' },
    ],
  };
  assert.doesNotThrow(() => validateRevisionSchema(rev, 'test-relocate'));
  const extracted = extractRouteChanges([rev]);
  assert.equal(extracted.activePrefix, '/zh');
  assert.equal(extracted.prefixRelocations.length, 1);
});
