import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { validateReaderText } from './reader-surface.mjs';

const controversies = JSON.parse(
  readFileSync(new URL('../config/editions/controversies.json', import.meta.url), 'utf8'),
);

test('config/editions/controversies.json maintains bilingual parity and Clean Public Delivery prose', () => {
  assert.equal(controversies.schemaVersion, 1);
  assert.equal(controversies.blindSpots.length, 8);
  assert.equal(controversies.valueChoices.length, 10);
  assert.equal(controversies.revisionTriggers.length, 7);
  assert.equal(controversies.accessBoundaries.length, 3);

  const cjkRe = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
  for (const [section, items] of Object.entries(controversies)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      assert.ok(item.id, `${section} item missing id`);
      for (const locale of ['zh', 'en']) {
        assert.ok(item[locale] && typeof item[locale] === 'object', `${section}.${item.id} missing ${locale}`);
        for (const [field, val] of Object.entries(item[locale])) {
          assert.equal(typeof val, 'string');
          assert.ok(val.trim().length > 0, `${section}.${item.id}.${locale}.${field} empty`);
          const errs = validateReaderText(val, {
            label: `${section}.${item.id}.${locale}.${field}`,
            strictFinalDelivery: true,
          });
          assert.deepEqual(errs, [], `Clean Public Delivery violation: ${errs.join('; ')}`);
          if (locale === 'en') {
            assert.equal(cjkRe.test(val), false, `CJK leak in EN field ${section}.${item.id}.${field}`);
          }
        }
      }
    }
  }
});

test('rendered /zh/controversies/ and /en/controversies/ surfaces, switcher paths, redirect, sitemap, llms, and search indexes are complete', () => {
  const outRoot = join(process.cwd(), 'out');
  const zhFile = join(outRoot, 'zh', 'controversies', 'index.html');
  const enFile = join(outRoot, 'en', 'controversies', 'index.html');
  if (!existsSync(zhFile) || !existsSync(enFile)) return;

  for (const [lang, file] of [['zh', zhFile], ['en', enFile]]) {
    const html = readFileSync(file, 'utf8');
    const doc = htmlParser.parse(html);
    for (const id of ['blind-spots', 'value-choices', 'revision-triggers', 'part-boundaries', 'access-boundaries', 'gaps-companion']) {
      assert.ok(doc.querySelector(`#${id}`), `missing #${id} on /${lang}/controversies/`);
    }
    for (let part = 1; part <= 8; part++) {
      assert.ok(doc.querySelector(`#gaps-part-${part}`), `missing #gaps-part-${part} on /${lang}/controversies/`);
    }
    assert.equal(doc.querySelectorAll('#blind-spots tbody tr').length, 8, `expected 8 blind spots on /${lang}/controversies/`);
    assert.equal(doc.querySelectorAll('#value-choices tbody tr').length, 10, `expected 10 value choices on /${lang}/controversies/`);
    assert.equal(doc.querySelectorAll('#revision-triggers tbody tr').length, 7, `expected 7 revision triggers on /${lang}/controversies/`);
    assert.equal(doc.querySelectorAll('#access-boundaries section.editorial-note').length, 3, `expected 3 access boundary cards on /${lang}/controversies/`);

    // Ensure no raw internal schema relation enum leaks in rendered visible text
    const visibleText = doc.querySelector('main#main-content')?.structuredText ?? '';
    assert.equal(/（qualifies）|\(qualifies\)/i.test(visibleText), false, `leaked raw schema enum token on /${lang}/controversies/`);

    // Ensure interactive header language switcher hydration includes both /zh/controversies/ and /en/controversies/
    assert.ok(html.includes('/zh/controversies/'), `missing /zh/controversies/ in publishedPaths/HTML on /${lang}/controversies/`);
    assert.ok(html.includes('/en/controversies/'), `missing /en/controversies/ in publishedPaths/HTML on /${lang}/controversies/`);

    // Verify exact rendered list item counts across all parts + companion (135 qualified + 745 caveated = 880 list items)
    const noteItems = doc.querySelectorAll('#part-boundaries details ul li');
    assert.equal(noteItems.length, 880, `expected 880 total qualified+caveated items on /${lang}/controversies/, got ${noteItems.length}`);
  }

  // Legacy redirect, sitemap, llms.txt, and search indices
  const legacyRedirect = join(outRoot, 'controversies', 'index.html');
  assert.ok(existsSync(legacyRedirect), 'missing legacy /controversies/index.html redirect');
  assert.match(readFileSync(legacyRedirect, 'utf8'), /\/zh\/controversies\//);

  const sitemapXml = readFileSync(join(outRoot, 'sitemap.xml'), 'utf8');
  assert.ok(sitemapXml.includes('/zh/controversies/'), 'sitemap.xml missing /zh/controversies/');
  assert.ok(sitemapXml.includes('/en/controversies/'), 'sitemap.xml missing /en/controversies/');

  const llmsTxt = readFileSync(join(outRoot, 'llms.txt'), 'utf8');
  assert.ok(llmsTxt.includes('/zh/controversies/'), 'llms.txt missing /zh/controversies/');
  assert.ok(llmsTxt.includes('/en/controversies/'), 'llms.txt missing /en/controversies/');

  const zhSearch = JSON.parse(readFileSync(join(outRoot, 'downloads', 'search-index-zh.json'), 'utf8'));
  const enSearch = JSON.parse(readFileSync(join(outRoot, 'downloads', 'search-index-en.json'), 'utf8'));
  assert.ok(zhSearch.some((row) => row.url === '/zh/controversies/'), 'search-index-zh.json missing /zh/controversies/');
  assert.ok(enSearch.some((row) => row.url === '/en/controversies/'), 'search-index-en.json missing /en/controversies/');
});
