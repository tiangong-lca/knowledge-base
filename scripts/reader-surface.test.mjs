import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readerInternalIds, validateLegacyCitationOutput, validateReaderClaims, validateReaderHtml, validateReaderIndex, validateReaderMdx, validateReaderOutput, validateReaderText } from './reader-surface.mjs';
import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { assertCitationBaseline, assertPrintFrontMatter } from './reader-citation-baseline.mjs';
import { citationSourceHref } from './reader-citations.mjs';

const knownIds = readerInternalIds({ claims: [{ id: 'cl-reader-known' }], evidence: [{ id: 'ev-reader-known' }], readings: [{ id: 'rd-reader-known' }] });

test('strong project-process phrases reproduce the rejected draft/workbench wording', () => {
  for (const text of ['本轮完成章节', '本次核读了原文', '当前为 AI 辅助来源核查稿', '首版建设', '主任务已完成', '源码提交：abc', '待交付', '研究进行中']) assert(validateReaderText(text).length, text);
});

test('scientific uncertainty, authorial positions and historical research plans remain legitimate prose', () => {
  assert.deepEqual(validateReaderText('作者1993年的研究计划尚未实施。当前方法不能据此确定排序。原始 PDF 无法取得，引用限于所列文字；表征因子不确定性尚未传播。'), []);
  assert.deepEqual(validateReaderText('作者虚构了投入量，负残差是参照相减，不表示物理移除。'), []);
});

test('only rendered claim fields are checked; backend acquisition appraisal text is not reader prose', () => {
  const data = { claims: [{ id: 'cl-ok', text: '潜在影响不是观测损害。', scope: '选定模型与服务', caveats: ['不确定性未传播。'] }], sources: [{ preservation: '本次核读' }], evidence: [{ appraisal: { basis: '主任务' } }] };
  assert.deepEqual(validateReaderClaims(data), []);
  data.claims[0].scope = '本轮研究';
  assert(validateReaderClaims(data).some(error => error.includes('claims.cl-ok.scope')));
});

test('actual internal identities and raw machine labels are rejected without banning ordinary unknown scientific identifiers', () => {
  for (const text of ['cl-reader-known', 'ev-reader-known。', 'rd-reader-known.', 'inputSha256', 'CASE-WALL-CONNECT', 'a'.repeat(64)]) assert(validateReaderText(text, { knownIds }).length, text);
  assert.deepEqual(validateReaderText('cl-other-study is not a registered project identity.', { knownIds }), []);
});

test('native run-local scenario names do not forbid ordinary words while publication identities remain protected', () => {
  const knownIds = readerInternalIds({
    claims: [{id:'cl-real-publication'}],
    native: {kind:'author-derived-native-model-execution', scenarios:[
      {id:'zero', source:{id:'ev-real-source'}, caseId:'CASE-POWER'},
    ]},
  });
  assert.deepEqual(validateReaderText('The zero burden is conditional.', {knownIds}), []);
  for (const text of ['cl-real-publication','ev-real-source','CASE-POWER'])
    assert(validateReaderText(text, {knownIds}).length, text);
  assert(readerInternalIds({claims:[{id:'zero'}]}).has('zero'));
  assert(readerInternalIds({scenarios:[{id:'other-local-record'}]}).has('other-local-record'));
});

test('MDX ignores component attributes, links and code examples, but checks actual prose and local developer routes', () => {
  const mdx = '<Prose ids="cl-reader-known" />\n[注释](/claims/#cl-reader-known)\n```mdx\n本轮 cl-reader-known\n```\n`源码提交`\n当前方法尚未确定排序。';
  assert.deepEqual(validateReaderMdx(mdx, 'chapter', knownIds), []);
  assert(validateReaderMdx('本轮完成。', 'chapter', knownIds).length);
  assert(validateReaderMdx('[开发记录](/_docs/task.md)', 'chapter', knownIds).some(error => /development Markdown/.test(error)));
  assert.deepEqual(validateReaderMdx('[项目开发文档](https://github.com/tiangong-lca/knowledge-base/tree/main/_docs)', 'changes', knownIds), []);
});

test('HTML parsing excludes scripts/styles/attributes while decoding visible entities and aria labels', () => {
  const good = `<main id="cl-reader-known" data-case-id="CASE-WALL-CONNECT"><a href="/claims/#cl-reader-known">注释1</a><p>原始 PDF 无法取得；不确定性未传播。</p><script>本轮 cl-reader-known ${'a'.repeat(64)}</script><style>.x{content:'主任务'}</style></main>`;
  assert.deepEqual(validateReaderHtml(good, { knownIds }), []);
  assert(validateReaderHtml('<p>cl&#45;reader-known</p>', { knownIds }).some(error => /internal identifier/.test(error)));
  assert(validateReaderHtml('<p>cl-reader-known</p><p>Next section</p>', { knownIds }).some(error => /internal identifier/.test(error)));
  assert(validateReaderHtml('<p><span>本</span><strong>轮</strong>完成</p>').length);
  assert(validateReaderHtml('<button aria-label="cl-reader-known">注释</button>', { knownIds }).some(error => /aria-label/.test(error)));
  assert(validateReaderHtml('<code>inputSha256</code>').length);
});

test('print duplicate anchors are rejected while unique prefixed notes and external bibliography links pass', () => {
  assert(validateReaderHtml('<article><li id="note-1">注释</li></article><article><li id="note-1">注释</li></article>').some(error => /duplicate DOM id/.test(error)));
  assert.deepEqual(validateReaderHtml('<li id="print-a-note-1">注释</li><li id="print-b-note-1"><a href="https://example.org/original">文献</a></li>'), []);
  assert.deepEqual(validateReaderHtml('<a href="https://github.com/tiangong-lca/knowledge-base/tree/main/_docs">项目开发文档</a>'), []);
});

test('one honest AI writing statement is allowed only in the changes-page context', () => {
  const statement = '<p>来源核查由 AI 辅助完成，不能视为独立领域专家评审。</p>';
  assert(validateReaderHtml(statement).length);
  assert.deepEqual(validateReaderHtml(statement, { allowAIStatement: true }), []);
  assert(validateReaderHtml(statement + statement, { allowAIStatement: true }).some(error => /only once/.test(error)));
});

test('AI reader index advertises the book and bibliography instead of progress/workbench endpoints', () => {
  assert(validateReaderIndex('# Book\n[Research register](/downloads/research.json)\n[Coverage and gaps](/coverage/)').length);
  assert(validateReaderIndex('[开发](/_docs/task.md)').length);
  assert.deepEqual(validateReaderIndex('# 生命周期评价的前世今生\n[正文](/docs/book/)\n[参考文献](/research/)\n[书目](/downloads/bibliography.json)'), []);
});

test('output scan checks actual HTML and index, excludes machine JSON and refuses published developer directories', async () => {
  const root = await mkdtemp(join(tmpdir(), 'reader-surface-'));
  try {
    await mkdir(join(root, 'changes')); await mkdir(join(root, 'downloads'));
    await writeFile(join(root, 'index.html'), '<main>生命周期评价的前世今生</main>');
    await writeFile(join(root, 'changes/index.html'), '<p>来源核查由 AI 辅助完成。</p>');
    await writeFile(join(root, 'downloads/catalog.json'), JSON.stringify({ process: '本轮', reviewKind: 'agent-source-check', id: 'cl-reader-known' }));
    await writeFile(join(root, 'llms.txt'), '# 生命周期评价的前世今生\n[书目](/downloads/bibliography.json)');
    assert.deepEqual(await validateReaderOutput(root, { knownIds }), []);
    await writeFile(join(root, 'index.html'), '<main>研究进行中</main>');
    assert((await validateReaderOutput(root, { knownIds })).some(error => /index.html.*process prose/.test(error)));
    await mkdir(join(root, '_docs')); await writeFile(join(root, '_docs/task.md'), 'Internal development');
    assert((await validateReaderOutput(root)).some(error => /outside public output/.test(error)));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('static citation validation follows native links to the exact relocated claim and requires the pinned heading', async () => {
  const root = await mkdtemp(join(tmpdir(), 'reader-citations-'));
  const a = '/docs/a', b = '/docs/b', claim = 'cl-moved';
  const baseline = { sourceCommit: 'a'.repeat(40), sourceDate: '2026-11-07', pages: [
    { route: a, noteClaims: [claim], headingIds: ['旧节'], printOrdinal: 1 },
    { route: b, noteClaims: [], headingIds: [], printOrdinal: 2 },
  ] };
  const placements = { frontMatter: [], notes: [{ from: a, claimId: claim, to: b }] };
  const oldPrefix = chapterAnchorPrefix(a), anchor = chapterNoteAnchor(chapterAnchorPrefix(b), claim);
  const edition = `<time datetime="${baseline.sourceDate}">${baseline.sourceDate}</time><a href="${citationSourceHref(baseline.sourceCommit)}">查看源文件</a>`;
  const notice = id => `<div id="${id}" data-legacy-notice><div class="legacy-citation-context">
    ${edition}<a href="${b}/#${anchor}" data-legacy-destination>注 1</a>
    </div></div>`;
  const notes = `<a href="#${anchor}" role="doc-noteref" aria-label="注 1" data-reader-reference="${claim}">[1]</a>
    <section class="chapter-notes"><ol><li id="${anchor}" data-reader-claim="${claim}">适用条件</li></ol></section>`;
  const oldPrintAlias = (id, target) => `<span id="${id}" data-legacy-for="${target}"><span class="legacy-citation-context">${edition}</span></span>`;
  const aPrint = printUnitAnchor(a), bPrint = printUnitAnchor(b), printNote = chapterNoteAnchor(bPrint, claim);
  const movedAliases = oldPrintAlias('print-chapter-1-note-1', printNote) + oldPrintAlias('print-chapter-1-notes', printNote);
  const print = `<section id="writing-note">编写说明</section>
    <article id="${aPrint}" data-reader-route="${a}">${oldPrintAlias('print-chapter-1', aPrint)}
      ${oldPrintAlias('print-chapter-1-旧节', `${aPrint}-旧节`)}<h3 id="${aPrint}-旧节">原节</h3></article>
    <article id="${bPrint}" data-reader-route="${b}">${oldPrintAlias('print-chapter-2', bPrint)}
      ${notes.replaceAll(anchor, printNote).replace('适用条件', `${movedAliases}适用条件`)}</article>
    <section id="print-references">参考文献</section>`;
  const writePage = async (route, html) => {
    const directory = join(root, route.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), `<main id="main-content">${html}</main>`);
  };
  try {
    const notices = notice(`${oldPrefix}-note-1`) + notice(`${oldPrefix}-notes`);
    await writePage(a, `<span id="旧节" data-reader-section="旧节"></span>${notices}`);
    await writePage(b, notes);
    await writePage('/print', print);
    assert.deepEqual(await validateLegacyCitationOutput(root, baseline, placements), []);
    await writePage(a, `<span id="旧节"></span>${notices.replace('>2026-11-07</time>', '>2026-11-06</time>')}`);
    await writePage(b, notes.replace(`data-reader-claim="${claim}"`, 'data-reader-claim="cl-other"'));
    await writePage('/print', print.replace(movedAliases, '').replace('原节</h3>', `原节</h3>${movedAliases}`));
    const errors = await validateLegacyCitationOutput(root, baseline, placements);
    assert(errors.some(error => error.includes('-note-1') && error.includes('missing exact edition context')));
    assert(errors.some(error => error.includes('旧节') && error.includes('wrong or missing heading')));
    assert(errors.some(error => error.includes('-note-1') && error.includes('wrong or missing note')));
    assert(errors.some(error => error.includes('#print-chapter-1-note-1') && error.includes('alias does not land at its destination')));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('real or cached book output cannot bypass citation validation by omitting both source configs', async () => {
  const repository = await mkdtemp(join(tmpdir(), 'reader-config-'));
  const out = join(repository, 'out');
  const print = join(out, 'print');
  const book = join(repository, 'content/docs/book');
  try {
    await mkdir(print, { recursive: true });
    await writeFile(join(print, 'index.html'), '<article class="print-chapter prose"><h2>一章</h2></article>');
    assert((await validateReaderOutput(out)).some(error => error.includes('requires both the reader citation')));
    await writeFile(join(print, 'index.html'), '<html>Fixture</html>');
    await mkdir(book, { recursive: true });
    await writeFile(join(book, 'meta.json'), '{"pages":[]}');
    assert((await validateReaderOutput(out)).some(error => error.includes('requires both the reader citation')));
  } finally { await rm(repository, { recursive: true, force: true }); }
});

test('the export rejects a truncated or changed frozen inventory before using it to check HTML', async () => {
  const capture = await readFile(new URL('../config/citation-baseline.json', import.meta.url), 'utf8');
  const baseline = JSON.parse(capture.replaceAll('\n', '\r\n'));
  assert.doesNotThrow(() => assertCitationBaseline(baseline));
  assert.doesNotThrow(() => assertPrintFrontMatter(['/docs', '/docs/book']));

  const repository = await mkdtemp(join(tmpdir(), 'reader-baseline-'));
  const out = join(repository, 'out');
  const config = join(repository, 'config');
  try {
    await mkdir(join(out, 'docs/book'), { recursive: true });
    await mkdir(join(out, 'print'));
    await mkdir(config);
    await writeFile(join(out, 'docs/book/index.html'), '<main id="main-content"><h1>一份书稿</h1></main>');
    await writeFile(join(out, 'print/index.html'), '<main id="main-content"><section id="writing-note"></section><section id="print-references"></section></main>');
    await writeFile(join(config, 'citation-placements.json'), '{"frontMatter":[],"notes":[]}');

    const mutations = {
      'empty inventory': changed => { changed.pages = []; },
      'missing printed route': changed => { changed.pages = changed.pages.filter(page => page.printOrdinal !== 42); },
      'reordered claims': changed => { changed.pages.find(page => page.noteClaims.length > 1).noteClaims.reverse(); },
      'wrong source commit': changed => { changed.sourceCommit = 'a'.repeat(40); },
      'wrong source date': changed => { changed.sourceDate = '2026-11-06'; },
    };
    for (const [description, mutate] of Object.entries(mutations)) {
      const changed = structuredClone(baseline);
      mutate(changed);
      await writeFile(join(config, 'citation-baseline.json'), JSON.stringify(changed));
      await assert.rejects(validateReaderOutput(out), /baseline differs from the frozen 2026-11-07 edition/, description);
    }
    await writeFile(join(config, 'citation-baseline.json'), capture);
    for (const frontMatter of [[], ['/docs/book', '/docs'], ['/docs', '/docs/book', '/docs/flows']]) {
      await writeFile(join(config, 'citation-placements.json'), JSON.stringify({ frontMatter, notes: [] }));
      await assert.rejects(validateReaderOutput(out), /Printed front matter must contain the preface and guide in their approved order/);
    }
  } finally { await rm(repository, { recursive: true, force: true }); }
});
