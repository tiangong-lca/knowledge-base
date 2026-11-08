import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateReaderOutput } from './reader-surface.mjs';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { assertCleanerProductionAccepted, assertCleanerProductionHeadingHistory, assertCleanerProductionRegistration, cleanerProductionHeadingEntries, cleanerProductionRoute as route, remapCleanerProductionCitations, validateCleanerProductionCoverage, validateRenderedCleanerProduction } from './reader-cleaner-production.mjs';
import { currentEditionKeys, publishedHeadingEntries, remapBookCitations } from './reader-edition.mjs';
import { createCanonicalCitationEntries, createLegacyCitationEntries } from './reader-citations.mjs';
import { chapterAnchorPrefix, createChapterNotePlan, printUnitAnchor, splitReferenceTail } from './reader-book.mjs';

const json = async name => JSON.parse(await readFile(new URL(`../config/${name}.json`, import.meta.url), 'utf8'));
const [accepted, captured, edition, baseline, placements, history, framework, frameworkHeadings] = await Promise.all([
  'cleaner-production-accepted', 'cleaner-production-heading-history', 'book-edition', 'citation-baseline', 'citation-placements', 'citation-history', 'framework-accepted', 'framework-heading-history',
].map(json));
const actualCatalog = JSON.parse(await readFile(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));
const body = ids => `<Prose ids="${ids.join(' ')}" />`;
const raw = `---\ntitle: 清洁生产的期待\n---\n${accepted.sections.map(section => `## ${section.title}\n${body(section.claimIds)}`).join('\n')}`;
const sources = text => new Map([[route, text]]);
const allEntries = () => [
  ...createLegacyCitationEntries(baseline, placements, history.pages),
  ...createCanonicalCitationEntries(history, placements, [...baseline.pages.map(page => page.route), ...placements.printAdditions.map(unit => unit.route)]),
  ...publishedHeadingEntries(frameworkHeadings), ...cleanerProductionHeadingEntries(captured),
];

test('original B05 identity and actual hosted capture are independently fixed', () => {
  assertCleanerProductionAccepted(accepted); assertCleanerProductionHeadingHistory(captured);
  assert.equal(accepted.source.claimIds.length, 5);
  assert.equal(captured.canonicalNotes.length, 10);
  assert.equal(captured.canonicalPrintedHeadings.length, 3);
  for (const change of [copy => copy.source.claimIds.pop(), copy => copy.source.sha256 = '0'.repeat(64), copy => copy.sourceHeadings[0].target = '发展条件']) {
    const copy = structuredClone(accepted); change(copy);
    assert.throws(() => assertCleanerProductionAccepted(copy), /five-proposition/);
  }
  for (const change of [copy => copy.canonicalPrintedHeadings.pop(), copy => copy.canonicalNotes[0].claimId = 'cl-other', copy => copy.sourceCommit = '0'.repeat(40), copy => copy.files['print/index.html'].sha256 = '0'.repeat(64)]) {
    const copy = structuredClone(captured); change(copy);
    assert.throws(() => assertCleanerProductionHeadingHistory(copy), /actual c159b16 capture/);
  }
});

test('B05 stays one shared source with explicit metadata in the current42 mixed roster', () => {
  const available = edition.units.flatMap(unit => [unit.source, ...unit.coverage ?? []]);
  assert.equal(currentEditionKeys(edition, available, baseline, placements).length, 41);
  for (const change of [
    copy => copy.units = copy.units.filter(unit => unit.key !== route),
    copy => copy.units.find(unit => unit.key === route).source = '/monograph/empty-b05',
    copy => delete copy.units.find(unit => unit.key === route).sections,
    copy => copy.units.find(unit => unit.key === route).part = '另部',
    copy => copy.units.find(unit => unit.key === route).sections.reverse(),
  ]) {
    const copy = structuredClone(edition); change(copy);
    assert.throws(() => currentEditionKeys(copy, available.filter(source => source !== route), baseline, placements), /B05/);
  }
  assertCleanerProductionRegistration(edition);
});

test('source occurrence guard rejects omissions, duplicates, replacements, wrong sections and unreviewed additions', () => {
  assert.deepEqual(validateCleanerProductionCoverage(edition, sources(raw), accepted), []);
  for (const id of accepted.sections.flatMap(section => section.claimIds)) {
    assert(validateCleanerProductionCoverage(edition, sources(raw.replace(id, '').replace(/<Prose ids="\s*" \/>/g, '')), accepted).some(error => /propositions/.test(error)));
    assert(validateCleanerProductionCoverage(edition, sources(raw.replace(id, `${id} ${id}`)), accepted).some(error => /propositions/.test(error)));
  }
  const first = accepted.source.claimIds[0];
  for (const changed of [
    raw.replace(first, 'cl-other-reviewed'),
    raw.replace(first, '').replace('## 应用设想', `## 应用设想\n${body([first])}`),
    `${body([first])}\n${raw.replace(first, '')}`,
    raw.replace('## 预防目的', '## 未登记节'), raw.replace('title: 清洁生产的期待', 'title: 旧标题'),
  ]) assert(validateCleanerProductionCoverage(edition, sources(changed), accepted).length);
  const catalog = { claims: accepted.sections.flatMap(section => section.claimIds).map(id => ({ id, status: 'reviewed', kind: 'source-statement', ...accepted.additions.find(addition => addition.id === id) })) };
  assert.deepEqual(validateCleanerProductionCoverage(edition, sources(raw), accepted, catalog), []);
  const addition = catalog.claims.at(-1);
  for (const field of ['kind','evidenceIds','premiseIds','reviewedAt','reviewKind']) {
    const changed = structuredClone(catalog); changed.claims.at(-1)[field] = field.endsWith('Ids') ? [] : 'wrong';
    assert(validateCleanerProductionCoverage(edition, sources(raw), accepted, changed).some(error => /binding/.test(error)));
  }
  addition.status = 'draft';
  assert(validateCleanerProductionCoverage(edition, sources(raw), accepted, catalog).some(error => /Unreviewed/.test(error)));
});

test('all 4064 unique addresses retain generation context and the same captured historical claim meanings', () => {
  const before = remapBookCitations(allEntries(), edition, framework, placements);
  const after = remapCleanerProductionCitations(before, accepted, captured);
  assert.equal(after.length, 4064);
  assert.equal(new Set(after.map(entry => `${entry.path}#${entry.id}`)).size, 4064);
  const prefix = printUnitAnchor(route);
  for (const old of accepted.sourceHeadings) {
    for (const [path, id, commit] of [
      [route, old.id, baseline.sourceCommit],
      ['/print', `print-chapter-6-${old.id}`, baseline.sourceCommit],
      ['/print', `${prefix}-${old.id}`, captured.sourceCommit],
    ]) {
      const entry = after.find(entry => entry.path === path && entry.id === id);
      assert.equal(entry.mode, 'alias'); assert.equal(entry.edition.sourceCommit, commit);
      assert.equal(entry.targets[0].id, path === '/print' ? `${prefix}-${old.target}` : old.target);
    }
  }
  // Captured canonical names overlap history: never generate another copy or
  // silently reinterpret them merely because every destination ID still exists.
  const bad = structuredClone(before);
  const note = bad.find(entry => entry.path === route && entry.id === captured.canonicalNotes[0].id);
  note.targets[0].claimId = accepted.source.claimIds[1];
  note.targets[0].id = `${chapterAnchorPrefix(route)}-claim-${accepted.source.claimIds[1]}`;
  assert.throws(() => remapCleanerProductionCitations(bad, accepted, captured), /Changed captured B05 citation meaning/);
  const missing = before.filter(entry => entry.id !== captured.printedUnit.id);
  assert.throws(() => remapCleanerProductionCitations(missing, accepted, captured), /Changed captured B05/);
});

const escapeText = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function renderedParagraph(id, print, catalog = actualCatalog, text = catalog.claims.find(claim => claim.id === id).text) {
  const prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route);
  const { body, tail } = splitReferenceTail(text);
  return `<p>${escapeText(body)}<span class="prose-reference-tail">${escapeText(tail)}<sup class="prose-references"><a role="doc-noteref" data-reader-reference="${id}" href="#${prefix}-claim-${id}">注</a></sup></span></p>`;
}
function rendered(print, catalog = actualCatalog) {
  const prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route), headingPrefix = print ? `${prefix}-` : '';
  const headings = accepted.sections.map(section => `<h${print ? 3 : 2} id="${headingPrefix}${section.id}">${section.title}</h${print ? 3 : 2}>${section.claimIds.map(id => renderedParagraph(id, print, catalog)).join('')}`).join('');
  const notes = `<section class="chapter-notes"><h${print ? 3 : 2} id="${prefix}-annotations">注释</h${print ? 3 : 2}><ol>${accepted.sections.flatMap(section => section.claimIds).map(id => `<li id="${prefix}-claim-${id}" data-reader-claim="${id}">仍在的注释</li>`).join('')}</ol></section>`;
  return print ? `<article data-reader-route="${route}" data-reader-title="清洁生产的期待"><h2>5　清洁生产的期待</h2>${headings}${notes}</article>` : `<article><h1>清洁生产的期待</h1>${headings}${notes}</article>`;
}

test('actual web/print paragraphs must retain canonical text even when every marker and note survives', () => {
  for (const print of [false, true]) {
    const path = print ? '/print' : route, html = rendered(print), first = accepted.source.claimIds[0];
    const check = value => validateRenderedCleanerProduction(htmlParser.parse(value), path, accepted, actualCatalog);
    assert.deepEqual(check(html), []);
    const paragraph = renderedParagraph(first, print);
    for (const changed of [
      html.replace(paragraph, ''), html.replace(paragraph, paragraph + paragraph),
      html.replace(paragraph, '').replace('<section class="chapter-notes">', `${paragraph}<section class="chapter-notes">`),
      html.replace(`data-reader-reference="${first}"`, 'data-reader-reference="cl-other-reviewed"'),
      html.replace('>预防目的</h', '>发展条件</h'),
    ]) assert(check(changed).length);
    for (const id of accepted.sections.flatMap(section => section.claimIds)) {
      const original = renderedParagraph(id, print);
      for (const altered of ['', actualCatalog.claims.find(claim => claim.id === id).text + '误增']) {
        const changed = html.replace(original, renderedParagraph(id, print, actualCatalog, altered));
        assert.equal(htmlParser.parse(changed).querySelectorAll('a[role="doc-noteref"]').length, 6);
        assert.equal(htmlParser.parse(changed).querySelectorAll('li[data-reader-claim]').length, 6);
        assert(check(changed).some(error => /paragraph body missing or different/.test(error)), id);
      }
    }
    assert(validateRenderedCleanerProduction(htmlParser.parse(html), path, accepted).some(error => /requires the canonical catalog/.test(error)));
    const plan = createChapterNotePlan(raw, print ? printUnitAnchor(route) : chapterAnchorPrefix(route));
    assert.equal(plan.notes.length, 6);
    assert.deepEqual(plan.notes.map(note => note.id), accepted.sections.flatMap(section => section.claimIds));
  }
});

test('decoded entities, exact whitespace and split combining/joined graphemes retain the canonical string', () => {
  const catalog = structuredClone(actualCatalog), first = catalog.claims.find(claim => claim.id === accepted.source.claimIds[0]);
  first.text = 'A&B  <边界> e\u0301\u00a0\n👩‍🔬';
  for (const print of [false, true]) {
    const path = print ? '/print' : route, html = rendered(print, catalog);
    const check = value => validateRenderedCleanerProduction(htmlParser.parse(value), path, accepted, catalog);
    assert.deepEqual(check(html), []);
    assert.deepEqual(check(html.replace('e\u0301', 'e&#x301;').replace('👩‍🔬', '&#x1f469;&#x200d;&#x1f52c;')), []);
    assert(check(html.replace('A&amp;B  ', 'A&amp;B ')).some(error => /paragraph body/.test(error)));
    assert(check(html.normalize('NFC')).some(error => /paragraph body/.test(error)));
  }
});


test('co-deleting B05 accepted/captured configs cannot bypass export admission', async () => {
  const root = await mkdtemp(join(tmpdir(), 'reader-b05-admission-'));
  try {
    const out = join(root, 'out'), config = join(root, 'config');
    await mkdir(out); await mkdir(config);
    for (const name of ['book-edition','framework-accepted','framework-heading-history','citation-baseline','citation-placements','citation-history'])
      await writeFile(join(config, `${name}.json`), JSON.stringify(await json(name)));
    await assert.rejects(validateReaderOutput(out), /requires its accepted proposition and published heading inventories/);
    await writeFile(join(config, 'cleaner-production-accepted.json'), JSON.stringify(accepted));
    await assert.rejects(validateReaderOutput(out), /requires its accepted proposition and published heading inventories/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
