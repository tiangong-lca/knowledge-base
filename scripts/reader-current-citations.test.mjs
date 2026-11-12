import assert from 'node:assert/strict';
import test from 'node:test';
import { editionDigest } from './reader-current-edition.mjs';
import { readCitationSurface, validateHistoricalScope, validateReadableBookOrdinaryDestinations } from './reader-surface.mjs';
import parser from 'next/dist/compiled/node-html-parser/index.js';
import { qualifyReadableBookCitations } from './reader-current-citations.mjs';

const path = '/print';
const route = '/docs/book/example';
const kind = 'heading';
const edition = { sourceCommit: 'source', sourceDate: '2026-11-11' };
const capture = {
  qualification: 'actual-hosted-html-capture',
  ...edition,
  entries: [{ path, route, id: 'old-heading', kind, title: '原节题', claimIds: ['cl-original'] }],
};
const digest = editionDigest(capture);
const previous = qualifyReadableBookCitations([], capture, [], digest)[0];
const migration = {
  address: '/print#old-heading', from: editionDigest(previous), explanation: '原节的论断及复算去向。',
  targets: [
    { path, route, id: 'revised-heading', kind },
    { path, route, id: 'claim-note', kind: 'note', claimId: 'cl-original' },
  ],
};

test('captured current headings get a dated address and an exact explicit relocation', () => {
  const [changed] = qualifyReadableBookCitations([], capture, [migration], digest);
  assert.equal(changed.id, previous.id);
  assert.deepEqual(changed.edition, edition);
  assert.equal(changed.mode, 'notice');
  assert.deepEqual(changed.targets, migration.targets);
  assert.deepEqual(changed.scope, { text: '旧节“原节题”。' + migration.explanation, targets: migration.targets });
});

test('historical migrations reject invented captures, addresses and scope', () => {
  assert.throws(() => qualifyReadableBookCitations([], capture, [], 'bad'), /qualified hosted history/);
  assert.throws(() => qualifyReadableBookCitations([], capture, [{ ...migration, from: 'different' }], digest), /exact historical identity/);
  assert.throws(() => qualifyReadableBookCitations([], capture, [{ ...migration, targets: migration.targets.slice(0, 1) }], digest), /historical claim scope/);
  assert.throws(() => qualifyReadableBookCitations([], capture, [migration, migration], digest), /repeats a historical address/);
});

test('a reused native heading retains all original claim notes across several new sections', () => {
  const fullCapture = {
    ...capture,
    entries: [{ ...capture.entries[0], claimIds: ['cl-original', 'cl-second'] }],
  };
  const target = { path, route, id: 'old-heading', kind };
  const [source] = qualifyReadableBookCitations([], fullCapture, [], editionDigest(fullCapture));
  const split = {
    ...migration, from: editionDigest(source),
    targets: [
      target,
      { path, route, id: 'revised-heading', kind },
      { path, route, id: 'claim-note', kind: 'note', claimId: 'cl-original' },
      { path, route, id: 'second-note', kind: 'note', claimId: 'cl-second' },
    ],
  };
  const [retained] = qualifyReadableBookCitations([], fullCapture, [split], editionDigest(fullCapture));
  assert.equal(retained.mode, 'retained');
  assert.deepEqual(retained.targets, [target]);
  assert.deepEqual(retained.scope.targets, split.targets);
  assert.throws(() => qualifyReadableBookCitations([], fullCapture, [{ ...split, targets: split.targets.slice(0, 3) }], editionDigest(fullCapture)),
    /historical claim scope/);
});

test('a captured native range rejects a changed scope without a migration', () => {
  assert.equal(previous.capturedScope.title, '原节题');
  const original = parser.parse(`<article data-reader-route="${route}"><h3 id="old-heading" data-reader-heading-key="old">原节题</h3><p><a role="doc-noteref" data-reader-reference="cl-original">1</a></p></article>`);
  assert.deepEqual(validateHistoricalScope(readCitationSurface(original, path).ids.get('old-heading'), previous), []);
  const changed = parser.parse(original.toString().replace('</article>', '<p><a role="doc-noteref" data-reader-reference="cl-inserted">2</a></p></article>'));
  assert.match(validateHistoricalScope(readCitationSurface(changed, path).ids.get('old-heading'), previous)[0], /scope changed/);
});

test('retained titles and ordinary blocks both require explicit migration', () => {
  const page = parser.parse(`<article data-reader-route="${route}"><h3 id="old-heading" data-reader-heading-key="old">原节题</h3><p>原普通解释。</p></article>`);
  const old = readCitationSurface(page, path).ids.get('old-heading');
  const scope = { ...capture, entries: [{ ...capture.entries[0], claimIds: [], ordinaryHashes: old.ordinaryHashes }] };
  const [entry] = qualifyReadableBookCitations([], scope, [], editionDigest(scope));
  assert.deepEqual(validateHistoricalScope(old, entry), []);
  for (const changed of [page.toString().replace('原节题', '另一节'), page.toString().replace('原普通解释。', '替换解释。')]) {
    const source = readCitationSurface(parser.parse(changed), path).ids.get('old-heading');
    assert.match(validateHistoricalScope(source, entry)[0], /scope changed/);
  }
  const moved = { ...migration, from: editionDigest(entry), targets: migration.targets.slice(0, 1) };
  assert.throws(() => qualifyReadableBookCitations([], scope, [moved], editionDigest(scope)), /ordinary-text dispositions/);
  const accepted = { ...moved, ordinaryDispositions: [{ oldSha256: old.ordinaryHashes[0], destinations: [{ address: '/print#revised-heading', claimId: 'cl-current' }], rationale: 'Test-only actual paragraph position' }] };
  const [migrated] = qualifyReadableBookCitations([], scope, [accepted], editionDigest(scope));
  const target = claimIds => new Map([['/print', { ids: new Map([['revised-heading', { claimIds, ordinaryHashes: [] }]]) }]]);
  assert.match(validateReadableBookOrdinaryDestinations(target(['cl-unrelated']), migrated, migration.address)[0], /actual ordinary-content destination/);
  assert.deepEqual(validateReadableBookOrdinaryDestinations(target(['cl-current']), migrated, migration.address), []);
});

test('current historical context uses the actual destination title and ordinal without excusing extra copy', async () => {
  const { qualifyCurrentHistoricalDocument, validateReaderHistoricalText } = await import('./reader-publication-text.mjs');
  const { citationSourceHref } = await import('./reader-citations.mjs');
  const target = { path, route, id: 'present-note', kind: 'note', claimId: 'cl-current' };
  const entry = { path, route, id: 'historic-note', mode: 'notice', edition, targets: [target], scope: { text: '旧注的公开去向。', targets: [target] } };
  const locations = new Map([[path, { ids: new Map([[target.id, { route, claimId: 'cl-current', number: 7, title: '现行题名' }]]) }]]);
  const render = label => parser.parse(
    `<article data-reader-route="${route}"><div id="historic-note" data-legacy-notice="">
      <p>此链接按 <time>${edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(edition.sourceCommit)}">查看这一版本的源文件</a></p>
      <p>旧注的公开去向。</p><a href="#present-note">${label}</a></div></article>`,
  );
  for (const [label, passes] of [['《现行题名》注 7', true], ['《现行题名》注 8', false], ['《现行题名》注 7 补写', false]]) {
    const document = render(label);
    qualifyCurrentHistoricalDocument(document, [entry], [{ address: '/print#historic-note' }], locations);
    const result = validateReaderHistoricalText(document.querySelector('article'), [], path, () => '旧签收题名');
    assert.equal(result.errors.length === 0, passes);
    assert.equal(result.checked.size, passes ? 1 : 0);
  }
});

test('the whole document rejects unreviewed prose on a generic container-history anchor', async () => {
  const { qualifyCurrentHistoricalDocument, validateCurrentHistoricalContexts } = await import('./reader-publication-text.mjs');
  const { citationSourceHref } = await import('./reader-citations.mjs');
  const path = '/docs/book/early-container-comparisons';
  const id = '过程和能源在原报告中的含义';
  const target = { path, route: path, id, kind: 'heading', label: '《饮料容器账本》·过程和能源' };
  const scope = { text: '此处保留旧节所说明的内容。', targets: [target] };
  const entry = { path, route: path, id, mode: 'retained', edition, targets: [target], scope };
  const render = (extra = '', owner = path) => parser.parse(
    `<article data-reader-route="${owner}"><span id="${id}" data-reader-section="${id}"></span>
      <div data-legacy-scope="${id}"><p>此链接按 <time datetime="${edition.sourceDate}">${edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(edition.sourceCommit)}">查看这一版本的源文件</a></p>
      <p>${scope.text}${extra}</p><ul><li><a href="#${encodeURIComponent(id)}" data-legacy-scope-destination="">${target.label}</a></li></ul></div></article>`,
  );
  for (const [document, error] of [
    [render(), null],
    [render('据此可以证明所有容器的全生命周期排序恒定。'), /unexpected content/],
    [render('', '/docs/book/another-unit'), /wrong reading unit/],
  ]) {
    const surface = readCitationSurface(document, path);
    // The exploit retains the date, original text and all destinations.
    assert.deepEqual(validateHistoricalScope(surface.ids.get(id), entry), []);
    qualifyCurrentHistoricalDocument(document, [entry], [{ address: `${path}#${id}` }], new Map([[path, surface]]));
    const result = validateCurrentHistoricalContexts(document, [entry], path);
    if (error) assert.match(result.join('\n'), error);
    else assert.deepEqual(result, []);
  }
});
