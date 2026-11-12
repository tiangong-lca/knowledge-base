import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertCitationHistory } from './reader-citation-history.mjs';
import { assertCitationBaseline } from './reader-citation-baseline.mjs';
import { citationSourceHref, createCanonicalCitationEntries, createCurrentPrintRoutes, createLegacyCitationEntries } from './reader-citations.mjs';
import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { validateLegacyCitationOutput, validateReaderOutputFixture } from './reader-surface.mjs';

const json = async name => JSON.parse(await readFile(new URL(`../config/${name}.json`, import.meta.url), 'utf8'));

test('the independently frozen canonical family preserves every actual published occurrence and its own provenance', async () => {
  const [baseline, placements, history] = await Promise.all(['citation-baseline', 'citation-placements', 'citation-history'].map(json));
  assertCitationBaseline(baseline);
  assertCitationHistory(history);
  const entries = createCanonicalCitationEntries(history, placements, createCurrentPrintRoutes(baseline, placements,
    [...baseline.pages.map(page => page.route), ...placements.printAdditions.map(page => page.route)]));
  assert.equal(createLegacyCitationEntries(baseline, placements).length, 2254);
  assert.equal(history.pages.length, 44);
  assert.equal(history.pages.reduce((n, page) => n + page.noteClaims.length, 0), 830);
  assert.equal(entries.length, 1788);
  assert.equal(new Set(entries.map(entry => `${entry.path}#${entry.id}`)).size, 1788);
  assert.equal(entries.filter(entry => entry.mode === 'alias').length, 10);
  assert.equal(entries.filter(entry => entry.mode === 'notice').length, 10);
  for (const entry of entries) {
    assert.equal(entry.edition.sourceCommit, 'a36597d72f8cd89beb285d5d5b439b4aa10e89a3');
    for (const target of entry.targets.filter(target => target.kind === 'note'))
      assert(entry.id.endsWith(`-claim-${target.claimId}`));
  }
  // Earlier positional addresses existed here; this generation emitted no notes
  // in the rewritten preface/guide. Do not invent their former canonical names.
  assert(!entries.some(entry => entry.path === '/docs' && entry.targets.some(target => target.kind === 'note')));
  assert.equal(history.evidence.kind, 'immutable-source-reconstruction');
  assert.equal(history.evidence.historicalHtmlCaptured, false);
  assert.equal(history.pages.find(page => page.route.endsWith('early-container-comparisons')).sourceSha256,
    '953c31d3d6a36b863ac603cf7a47913731d70ac44efb7487e991608b04f25b4c');
});

test('canonical history truncation, substitutions, duplicate occurrences and false capture provenance fail closed before checking output', async () => {
  const [baseline, placements, history] = await Promise.all(['citation-baseline', 'citation-placements', 'citation-history'].map(json));
  const root = await mkdtemp(join(tmpdir(), 'reader-canonical-inventory-'));
  const out = join(root, 'out'), config = join(root, 'config');
  try {
    await mkdir(out); await mkdir(config);
    await writeFile(join(out, 'index.html'), '<main>A fixture without historical outputs</main>');
    await writeFile(join(config, 'citation-baseline.json'), JSON.stringify(baseline));
    await writeFile(join(config, 'citation-placements.json'), JSON.stringify(placements));
    assert((await validateReaderOutputFixture(out)).some(error => error.includes('requires the historical canonical citation inventory')));
    const mutations = [
      changed => { changed.pages = []; },
      changed => { changed.pages.find(page => page.noteClaims.length).noteClaims.pop(); },
      changed => { changed.pages[0].noteClaims.push(...changed.pages[0].noteClaims.slice(0, 1)); },
      changed => { changed.sourceCommit = baseline.sourceCommit; },
      changed => { changed.sourceDate = '2026-11-06'; },
      changed => { changed.pages[0].sourceSha256 = '0'.repeat(64); },
      changed => { changed.evidence.algorithmSources[0].sha256 = '0'.repeat(64); },
      changed => { changed.evidence.claimRecords.sha256 = '0'.repeat(64); },
      changed => { changed.evidence.historicalHtmlCaptured = true; },
    ];
    for (const mutate of mutations) {
      const changed = structuredClone(history); mutate(changed);
      await writeFile(join(config, 'citation-history.json'), JSON.stringify(changed));
      await assert.rejects(validateReaderOutputFixture(out), /canonical citation history differs from the published a36597d reconstruction/);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('published canonical moves retain native same-claim targets, unique IDs and exact generation context', async () => {
  const root = await mkdtemp(join(tmpdir(), 'reader-canonical-output-'));
  const a = '/docs/a', b = '/docs/b', moved = 'cl-moved', stay = 'cl-stay';
  const baseline = { sourceCommit: 'b'.repeat(40), sourceDate: '2026-11-06', pages: [a, b].map((route, i) => ({route, headingIds: [], noteClaims: [], printOrdinal: i + 1})) };
  const history = { sourceCommit: 'a'.repeat(40), sourceDate: '2026-11-07', pages: [
    {route: a, noteClaims: [stay, moved], printOrdinal: 1}, {route: b, noteClaims: [], printOrdinal: 2},
  ] };
  const placements = { frontMatter: [], notes: [{from: a, claimId: moved, to: b}] };
  const aWeb = chapterAnchorPrefix(a), bWeb = chapterAnchorPrefix(b), aPrint = printUnitAnchor(a), bPrint = printUnitAnchor(b);
  const oldWeb = chapterNoteAnchor(aWeb, moved), currentWeb = chapterNoteAnchor(bWeb, moved), oldPrint = chapterNoteAnchor(aPrint, moved), currentPrint = chapterNoteAnchor(bPrint, moved);
  const version = edition => `<time datetime="${edition.sourceDate}">${edition.sourceDate}</time><a href="${citationSourceHref(edition.sourceCommit)}">源文件</a>`;
  const alias = (id, target, edition) => `<span id="${id}" data-legacy-for="${target}"><span class="legacy-citation-context">${version(edition)}</span></span>`;
  const note = (prefix, claim, extra = '') => {
    const anchor = chapterNoteAnchor(prefix, claim);
    return `<a role="doc-noteref" href="#${anchor}" aria-label="注 1" data-reader-reference="${claim}">[1]</a><section class="chapter-notes"><h3 id="${prefix}-annotations">注释</h3><ol><li id="${anchor}" data-reader-claim="${claim}">${extra}条件</li></ol></section>`;
  };
  const notice = `<div id="${oldWeb}" data-legacy-notice><div class="legacy-citation-context">${version(history)}<a data-legacy-destination href="${b}/#${currentWeb}">注1</a></div></div>`;
  const webA = note(aWeb, stay) + notice, webB = note(bWeb, moved);
  const printAlias = alias(oldPrint, currentPrint, history);
  const print = `<section id="writing-note"></section><article id="${aPrint}" data-reader-route="${a}">${alias('print-chapter-1', aPrint, baseline)}${note(aPrint, stay)}</article><article id="${bPrint}" data-reader-route="${b}">${alias('print-chapter-2', bPrint, baseline)}${note(bPrint, moved, printAlias)}</article><section id="print-references"></section>`;
  const write = async (route, html) => { const directory = join(root, route.slice(1)); await mkdir(directory, {recursive:true}); await writeFile(join(directory, 'index.html'), `<main id="main-content">${html}</main>`); };
  const check = () => validateLegacyCitationOutput(root, baseline, placements, null, history);
  try {
    await write(a, webA); await write(b, webB); await write('/print', print);
    assert.deepEqual(await check(), []);
    await write(a, webA.replace(notice, ''));
    assert((await check()).some(error => error.includes(oldWeb) && error.includes('missing old citation target')));
    await write(a, webA.replace(version(history), version(baseline)));
    assert((await check()).some(error => error.includes(oldWeb) && error.includes('missing exact edition context')));
    await write(a, webA + notice);
    assert((await check()).some(error => error.includes(`duplicate citation surface ID ${oldWeb}`)));
    await write(a, webA.replace(`${b}/#${currentWeb}`, `${a}/#${chapterNoteAnchor(aWeb, stay)}`));
    assert((await check()).some(error => error.includes('migration notice has the wrong native links')));
    await write(a, webA.replace('>注1</a>', '>注2</a>'));
    assert((await check()).some(error => error.includes('wrong or missing destination note label')));
    await write(a, webA + `<a href="${b}/#${currentWeb}">《错误标题》注 1</a>`);
    await write(b, `<h1>实际标题</h1>${webB}`);
    assert((await check()).some(error => error.includes('wrong destination note title')));
    await write(a, webA + `<a href="${b}/#${currentWeb}-dead">《实际标题》注 1</a>`);
    assert((await check()).some(error => error.includes('wrong or missing destination note label')));
    await write(a, webA); await write(b, webB.replace(`data-reader-claim="${moved}"`, `data-reader-claim="${stay}"`));
    assert((await check()).some(error => error.includes(oldWeb) && error.includes('wrong or missing note destination')));
    await write(b, webB); await write('/print', print.replace(printAlias, '').replace('</article>', `${printAlias}</article>`));
    assert((await check()).some(error => error.includes(oldPrint) && error.includes('alias does not land at its destination')));
    assert.throws(() => createCanonicalCitationEntries(history, {...placements, notes:[...placements.notes,...placements.notes]}, [a,b]), /Duplicate canonical citation placement/);
    assert.throws(() => createCanonicalCitationEntries({...history, pages:[...history.pages,history.pages[0]]}, placements, [a,b]), /Duplicate canonical history/);
  } finally { await rm(root, {recursive:true,force:true}); }
});
