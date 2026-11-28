import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { homePath, languageAlternates, localizedPageAlternates, siteOrigin } from '../lib/seo-policy.mjs';

test('localizedPageAlternates produces self-referencing canonicals and full bilingual hreflang alternates', () => {
  assert.deepEqual(localizedPageAlternates('', 'zh', ['zh', 'en']), {
    canonical: '/',
    languages: { 'x-default': '/', 'zh-CN': '/', en: '/en/' },
  });
  assert.deepEqual(localizedPageAlternates('/', 'zh', ['zh', 'en']), {
    canonical: '/',
    languages: { 'x-default': '/', 'zh-CN': '/', en: '/en/' },
  });
  assert.deepEqual(localizedPageAlternates('', 'en', ['zh', 'en']), {
    canonical: '/en/',
    languages: { 'x-default': '/', 'zh-CN': '/', en: '/en/' },
  });
  assert.deepEqual(localizedPageAlternates('/coverage', 'zh', ['zh', 'en']), {
    canonical: '/zh/coverage/',
    languages: { 'x-default': '/zh/coverage/', 'zh-CN': '/zh/coverage/', en: '/en/coverage/' },
  });
  assert.deepEqual(localizedPageAlternates('/claims/', 'en', ['en', 'zh']), {
    canonical: '/en/claims/',
    languages: { 'x-default': '/zh/claims/', en: '/en/claims/', 'zh-CN': '/zh/claims/' },
  });
  // Fail-closed default and EN_PUBLIC_ENABLED=false single-locale fallback
  assert.deepEqual(localizedPageAlternates('/coverage', 'zh'), {
    canonical: '/zh/coverage/',
    languages: { 'x-default': '/zh/coverage/', 'zh-CN': '/zh/coverage/' },
  });
  assert.deepEqual(localizedPageAlternates('/coverage', 'fr', ['zh']), {
    canonical: '/zh/coverage/',
    languages: { 'x-default': '/zh/coverage/', 'zh-CN': '/zh/coverage/' },
  });
  assert.equal(homePath('zh'), '/');
  assert.equal(homePath('en'), '/en/');
  assert.deepEqual(languageAlternates('/print', ['zh', 'en']), {
    'x-default': '/zh/print/',
    'zh-CN': '/zh/print/',
    en: '/en/print/',
  });
});

function walkHtml(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

test('rendered static HTML emits exact canonicals, hreflang alternates, and resolvable SSR bilingual links across all pages', () => {
  const outRoot = join(process.cwd(), 'out');
  if (!existsSync(join(outRoot, 'zh', 'index.html')) || !existsSync(join(outRoot, 'en', 'index.html'))) {
    return;
  }
  const rootHome = join(outRoot, 'index.html');
  const pages = [
    ...(existsSync(rootHome) ? [rootHome] : []),
    ...walkHtml(join(outRoot, 'zh')),
    ...walkHtml(join(outRoot, 'en')),
  ];
  assert.ok(pages.length >= 120, `expected >= 120 localized HTML pages, got ${pages.length}`);

  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    // Skip static redirect stubs
    if (/http-equiv=["']refresh["']/i.test(html)) continue;

    const doc = htmlParser.parse(html);
    const rel = relative(outRoot, file).replace(/\\/g, '/');
    const isRootHome = rel === 'index.html';
    const isEn = rel.startsWith('en/');
    const route = isRootHome ? '/' : `/${rel.replace(/index\.html$/, '')}`;
    const logical = route.replace(/^\/(zh|en)(?=\/)/, '');

    let expectedCanonical;
    let expectedZhAlt;
    let expectedEnAlt;
    if (route === '/' || route === '/zh/') {
      expectedCanonical = `${siteOrigin}/`;
      expectedZhAlt = `${siteOrigin}/`;
      expectedEnAlt = `${siteOrigin}/en/`;
    } else if (route === '/en/') {
      expectedCanonical = `${siteOrigin}/en/`;
      expectedZhAlt = `${siteOrigin}/`;
      expectedEnAlt = `${siteOrigin}/en/`;
    } else if (route === '/zh/timeline/') {
      expectedCanonical = `${siteOrigin}/zh/docs/appendices/lca-timeline/`;
      expectedZhAlt = `${siteOrigin}/zh/docs/appendices/lca-timeline/`;
      expectedEnAlt = `${siteOrigin}/en/docs/appendices/lca-timeline/`;
    } else if (route === '/en/timeline/') {
      expectedCanonical = `${siteOrigin}/en/docs/appendices/lca-timeline/`;
      expectedZhAlt = `${siteOrigin}/zh/docs/appendices/lca-timeline/`;
      expectedEnAlt = `${siteOrigin}/en/docs/appendices/lca-timeline/`;
    } else {
      expectedCanonical = `${siteOrigin}${route}`;
      expectedZhAlt = `${siteOrigin}/zh${logical}`;
      expectedEnAlt = `${siteOrigin}/en${logical}`;
    }

    // Exactly one <link rel="canonical">
    const canonicalLinks = doc.querySelectorAll('head link[rel="canonical"]');
    assert.equal(canonicalLinks.length, 1, `expected exactly 1 canonical link on ${route}, got ${canonicalLinks.length}`);
    assert.equal(canonicalLinks[0].getAttribute('href'), expectedCanonical, `wrong canonical on ${route}`);

    // Exact head <link rel="alternate" hreflang="..."> tags
    const altLinks = doc.querySelectorAll('head link[rel="alternate"][hreflang]');
    const altByLang = new Map();
    for (const node of altLinks) {
      const hl = node.getAttribute('hreflang');
      assert.ok(!altByLang.has(hl), `duplicate hreflang="${hl}" on ${route}`);
      altByLang.set(hl, node.getAttribute('href'));
    }
    assert.equal(altByLang.get('zh-CN'), expectedZhAlt, `wrong hreflang="zh-CN" on ${route}`);
    assert.equal(altByLang.get('en'), expectedEnAlt, `wrong hreflang="en" on ${route}`);
    assert.equal(altByLang.get('x-default'), expectedZhAlt, `wrong hreflang="x-default" on ${route}`);

    // Parsed DOM static SSR counterpart <a> link must exist and resolve to a non-redirect HTML file
    const expectedCounterpart = (route === '/' || route === '/zh/')
      ? '/en/'
      : route === '/en/'
        ? '/zh/'
        : (isEn ? `/zh${logical}` : `/en${logical}`);
    const bodyAnchors = doc.querySelectorAll('body a[href]');
    const hasCounterpart = bodyAnchors.some((a) => a.getAttribute('href') === expectedCounterpart);
    assert.ok(hasCounterpart, `missing SSR bilingual counterpart <a> "${expectedCounterpart}" on ${route}`);

    const targetDisk = expectedCounterpart === '/'
      ? join(outRoot, 'index.html')
      : join(outRoot, expectedCounterpart.replace(/^\/|\/$/g, ''), 'index.html');
    assert.ok(existsSync(targetDisk), `counterpart link target missing on disk: ${expectedCounterpart}`);
    const targetHtml = readFileSync(targetDisk, 'utf8');
    assert.ok(!/http-equiv=["']refresh["']/i.test(targetHtml), `counterpart link resolves to redirect stub: ${expectedCounterpart}`);
  }

  // Verify sitemap omits non-canonical /timeline/ aliases
  const sitemapPath = join(outRoot, 'sitemap.xml');
  if (existsSync(sitemapPath)) {
    const xml = readFileSync(sitemapPath, 'utf8');
    assert.ok(!xml.includes('/zh/timeline/'), 'sitemap.xml should not list non-canonical /zh/timeline/ alias');
    assert.ok(!xml.includes('/en/timeline/'), 'sitemap.xml should not list non-canonical /en/timeline/ alias');
  }
});
