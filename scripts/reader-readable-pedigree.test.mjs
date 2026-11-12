import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import original from '../config/readable-pedigree-original.json' with { type: 'json' };
import captured from '../config/readable-pedigree-heading-history.json' with { type: 'json' };
import researchOriginal from '../config/readable-pedigree-research-original.json' with { type: 'json' };
import accepted from '../config/readable-pedigree-accepted.json' with { type: 'json' };
import edition from '../config/book-edition.json' with { type: 'json' };
import closingProse from '../config/closing-synthesis-prose-accepted.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import toxicityAccepted from '../config/toxicity-pathways-accepted.json' with { type: 'json' };
import { getClaimEvidence, publicCatalog, validateCatalog } from './knowledge.mjs';
import { validateCasePublication } from './case-publication.mjs';
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import { publicResearch } from './research.mjs';
import { createChapterAnnotationPlan, createChapterNotePlan, createChapterReferenceIndex, printUnitAnchor } from './reader-book.mjs';
import { citationHref, citationSourceHref } from './reader-citations.mjs';
import { printReadingEntryAnchor } from './reader-numbering.mjs';
import { validateClosingSynthesisCoverage } from './reader-closing-synthesis.mjs';
import {
  assertReadablePedigreeAccepted, assertReadablePedigreeHeadingHistory, assertReadablePedigreeOriginal, assertReadablePedigreeResearchOriginal,
  readablePedigreeCaseExpectation, readablePedigreeCitationLabel, readablePedigreeClosingRecords, readablePedigreeDigest, readablePedigreeHeadingEntries,
  readablePedigreeOriginalEntries, readablePedigreeRoute, remapReadablePedigreeCitations,
  inspectReadablePedigreeSource, validateReadablePedigreeCaseBytes, validateReadablePedigreeCoverage,
  validateReadablePedigreeResearch, validateReadablePedigreeStudyTable, validateRenderedReadablePedigree,
} from './reader-readable-pedigree.mjs';

const read = path => readFile(new URL(`../${path}`, import.meta.url));
const bytes = await read(original.sourceFile);
const sources = new Map([[readablePedigreeRoute, bytes.toString()]]);
const inputFile = 'knowledge/cases/pedigree-calibration-v1.json';
const publicationFile = 'knowledge/cases/pedigree-calibration-v1.publication.json';
const [input, publication] = await Promise.all([read(inputFile), read(publicationFile)]);
const fixture = {
  ...structuredClone(accepted),
  status: 'reviewed',
  closingConsumer: { ...accepted.closingConsumer, rationale: 'Test-only consumer disposition' },
  reviewEvidence: [{ kind: 'fixture', reportSha256: 'a'.repeat(64), receiptSha256: 'b'.repeat(64) }],
};
const pin = readablePedigreeDigest(fixture);

test('readable pedigree requires an independent digest and retains the original and hosted history', () => {
  assertReadablePedigreeOriginal();
  assertReadablePedigreeHeadingHistory();
  const changed = structuredClone(original);
  changed.claims[0].text += ' changed';
  assert.throws(() => assertReadablePedigreeOriginal(changed), /immutable before-rewrite/);
  const missing = structuredClone(captured);
  missing.views[1].headings.pop();
  assert.throws(() => assertReadablePedigreeHeadingHistory(missing), /hosted heading capture/);
  assert.throws(() => assertReadablePedigreeAccepted({ ...fixture, status: 'pending' }, pin), /independently pinned/);
  assert.throws(() => assertReadablePedigreeAccepted(fixture, null), /independently pinned/);
  assertReadablePedigreeAccepted(fixture, pin);

  const changedMetadata = structuredClone(fixture);
  changedMetadata.claims[0].scope += ' changed';
  assert.throws(() => assertReadablePedigreeAccepted(changedMetadata, readablePedigreeDigest(changedMetadata)), /scientific metadata/);
});

test('only the exact reviewed poststratification caveat may replace the historical caveat', () => {
  const id = 'cl-ped-poststratification';
  const oldCaveats = original.claims.find(row => row.id === id).caveats;
  const newCaveats = fixture.claims.find(row => row.id === id).caveats;
  assert.deepEqual(oldCaveats, ['方差降低比例由已舍入的汇总数计算，不是从观察值重新估计的设计效应，也不证明任何后分层都会降低误差。']);
  assert.deepEqual(newCaveats, ['方差降低比例由原文列出的两个方差估计值计算，不是从观察值重新估计的设计效应，也不证明任何后分层都会降低误差。']);
  assertReadablePedigreeAccepted(fixture, pin);

  for (const [claimId, caveats] of [
    [id, oldCaveats],
    [id, [newCaveats[0] + '额外解释。']],
    [id, [...newCaveats, '额外限定。']],
    ['cl-ped-cluster-arithmetic', newCaveats],
  ]) {
    const changed = structuredClone(fixture);
    changed.claims.find(row => row.id === claimId).caveats = caveats;
    assert.throws(() => assertReadablePedigreeAccepted(changed, readablePedigreeDigest(changed)), /changes scientific metadata/);
  }
});

test('readable pedigree binds the actual shared source, 37 propositions and exact scientific closure', () => {
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, catalog, fixture, pin, 'raw', readings), []);
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, publicCatalog(catalog), fixture, pin, 'public', readings), []);
  assert.match(validateReadablePedigreeCoverage(edition, new Map([[readablePedigreeRoute, bytes.toString() + '\n']]), catalog, fixture, pin, 'raw', readings).join(), /actual MDX/);
  const modified = structuredClone(catalog);
  modified.claims.find(row => row.id === fixture.claims[0].id).text += ' unreviewed';
  modified.evidence.find(row => row.id === original.evidence[0].id).locator += ' unreviewed';
  modified.sources.find(row => row.id === original.sources[0].id).title += ' unreviewed';
  modified.claims.find(row => row.id === fixture.closingConsumer.record.id).text += ' unreviewed';
  modified.claims.find(row => row.id === 'cl-unc-types').premiseIds = [fixture.claims[0].id];
  const errors = validateReadablePedigreeCoverage(edition, sources, modified, fixture, pin, 'raw', readings);
  for (const id of [fixture.claims[0].id, original.evidence[0].id, original.sources[0].id, fixture.closingConsumer.record.id, 'cl-unc-types'])
    assert(errors.some(error => error.includes(id)), id);
  assert(errors.some(error => error.includes('external consumer set')));
});

test('readable pedigree checks the exact source-bound carrier and passage while allowing unrelated growth', () => {
  assertReadablePedigreeResearchOriginal();
  assert.deepEqual(validateReadablePedigreeResearch(readings), []);
  const changedReceipt = structuredClone(researchOriginal);
  changedReceipt.readings[0].passages.pop();
  assert.throws(() => assertReadablePedigreeResearchOriginal(changedReceipt), /immutable selected research receipt/);

  const changed = structuredClone(readings);
  const reading = changed.readings.find(row => row.id === 'rd-edelen-ingwersen-2018-data-quality');
  const supplement = reading.artifacts.find(row => row.id === 'art-edelen-ingwersen2018-esm1');
  supplement.resolvedUrl = reading.artifacts.find(row => row.id === 'art-edelen-ingwersen-2018-pmc-html').resolvedUrl;
  reading.passages.find(row => row.id === 'psg-ped-ei2018-test-results').pdfIndices = [0];
  const expected = [
    'Readable pedigree selected research passage differs: psg-ped-ei2018-test-results',
    'Readable pedigree selected research artifact differs: art-edelen-ingwersen2018-esm1',
  ];
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, catalog, fixture, pin, 'raw', changed), expected);
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, publicCatalog(catalog), fixture, pin, 'public', changed), expected);
  assert.deepEqual(validateReadablePedigreeResearch(null), ['Readable pedigree missing actual reading register']);

  const grown = structuredClone(readings);
  const grownReading = grown.readings.find(row => row.id === reading.id);
  const unused = grownReading.passages.find(row => row.id === 'psg-ei2018-identity-fitness');
  grownReading.passages.push({ ...unused, id: 'psg-pedigree-fixture-unused' });
  const other = grown.readings.find(row => !researchOriginal.readings.some(fixed => fixed.id === row.id));
  grown.readings.push({ ...other, id: 'rd-pedigree-fixture-other' });
  grown.revisions.push({ ...grown.revisions[0], id: 'rev-pedigree-fixture-growth' });
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, catalog, fixture, pin, 'raw', grown), []);
});

test('readable pedigree rejects transitive consumers without widening the impact to shared evidence', () => {
  const changed = structuredClone(catalog);
  const consumer = fixture.closingConsumer.record;
  const unrelated = { ...structuredClone(consumer), id: 'cl-pedigree-fixture-unrelated', premiseIds: ['cl-unc-choices'] };
  changed.claims.push(unrelated);
  assert.deepEqual(validateCatalog(changed), []);
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, changed, fixture, pin, 'raw', readings), []);
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, publicCatalog(changed), fixture, pin, 'public', readings), []);

  changed.claims.push({ ...unrelated, id: 'cl-pedigree-fixture-transitive', premiseIds: [consumer.id] });
  assert.deepEqual(validateCatalog(changed), []);
  const expected = ['Readable pedigree exact external consumer set differs'];
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, changed, fixture, pin, 'raw', readings), expected);
  assert.deepEqual(validateReadablePedigreeCoverage(edition, sources, publicCatalog(changed), fixture, pin, 'public', readings), expected);
});

test('only the exact registered case template receives a new byte acceptance', () => {
  assert.deepEqual(validateCasePublication(JSON.parse(input), JSON.parse(publication), catalog, { readingRegister: readings }), []);
  assert.deepEqual(validateReadablePedigreeCaseBytes(fixture, { input, publication }, pin), []);
  assert.deepEqual(validateReadablePedigreeCaseBytes(fixture, { input: 'bad', publication: 'bad' }, pin), [
    'Readable pedigree input bytes differ', 'Readable pedigree publication bytes differ',
  ]);
  assert.equal(readablePedigreeCaseExpectation(inputFile, original.caseInputSha256, fixture, null), original.caseInputSha256);
  assert.equal(readablePedigreeCaseExpectation('knowledge/cases/other.publication.json', 'untouched', fixture, null), 'untouched');
  assert.equal(readablePedigreeCaseExpectation(publicationFile, original.casePublicationSha256, fixture, pin), fixture.casePublicationSha256);
  assert.throws(() => readablePedigreeCaseExpectation(publicationFile, fixture.casePublicationSha256, fixture, pin), /historical case publication hash/);
});

test('historical headings resolve to exact old material in the current chapter', () => {
  const old = readablePedigreeOriginalEntries();
  assert.equal(old.length, 178);
  assert.equal(readablePedigreeHeadingEntries().length, 8);
  assert.equal(new Set(old.map(entry => `${entry.path}#${entry.id}`)).size, old.length);
  const mapped = remapReadablePedigreeCitations(old, fixture, pin);
  for (const [index, entry] of old.entries()) {
    const remapped = mapped[index];
    assert.equal(remapped.id, entry.id);
    assert.deepEqual(remapped.edition, entry.edition);
    if (entry.targets[0].kind === 'note') {
      assert.deepEqual(remapped, entry);
      continue;
    }
    const view = captured.views.find(row => row.path === entry.path);
    const section = view.headings.find(row => row.id === entry.targets[0].id);
    assert.deepEqual(remapped.scope.targets.filter(row => row.kind === 'note').map(row => row.claimId), section?.claimIds ?? original.chapterIds);
    assert(remapped.scope.text.includes(view.title));
    if (section) {
      assert.equal(remapped.mode, 'notice');
      assert(remapped.scope.text.includes(section.title));
    }
  }
  const split = mapped.find(entry => entry.path === readablePedigreeRoute && entry.id === '把比值写成概率模型还需要什么');
  assert.deepEqual(split.targets.filter(row => row.kind === 'heading').map(row => row.id), ['概率模型与参数', '评分的检验与适用']);
  assert.match(split.scope.text, /把比值写成概率模型，还需要什么/);
  assert.throws(() => remapReadablePedigreeCitations(old.slice(1), fixture, pin), /address missing/);
  assert.throws(() => remapReadablePedigreeCitations([...old, old[0]], fixture, pin), /unknown or changed old address/);
  const unrelated = { ...old[0], route: '/unrelated', targets: old[0].targets.map(target => ({ ...target, route: '/unrelated' })) };
  assert.equal(remapReadablePedigreeCitations([unrelated, ...old], fixture, pin)[0], unrelated);
});

test('B32 adds only the three exact premise replacements and retains its one downstream claim', async () => {
  const records = readablePedigreeClosingRecords(fixture, pin);
  assert.deepEqual(records.changes.map(row => row.old.id), ['cl-unc-scores', 'cl-unc-calibration', 'cl-unc-alongside']);
  assert.deepEqual(records.consumer, closingProse.claims.find(row => row.id === 'cl-connect-evidence-to-probability'));
  const closingSources = new Map(await Promise.all(closingProse.sources.map(async ({ route }) => [
    route, (await read(`content${route}.mdx`)).toString(),
  ])));
  const validate = value => validateClosingSynthesisCoverage(edition, closingSources, value, closingProse,
    undefined, 'raw', undefined, undefined, toxicityAccepted, undefined, fixture, pin);
  assert.deepEqual(validate(catalog), []);
  const modified = structuredClone(catalog);
  modified.claims.find(row => row.id === 'cl-unc-scores').text = records.changes[0].old.text;
  assert(validate(modified).some(error => error.includes('cl-unc-scores')));
});

async function renderedPrint() {
  const require = createRequire(import.meta.url);
  const mdxRequire = createRequire(require.resolve('fumadocs-mdx'));
  const compiled = mdxRequire('esbuild').transformSync((await read('components/evidence.tsx')).toString(), {
    loader: 'tsx', jsx: 'automatic', format: 'cjs',
  });
  const component = { exports: {} };
  const published = publicCatalog(catalog);
  const modules = {
    '@/lib/catalog': { __esModule: true, default: published, getClaimEvidence, isKnownClaim: id => published.claims.some(row => row.id === id) },
    '@/knowledge/research/literature-map.json': literature,
    '@/knowledge/research/readings.json': readings,
    '@/scripts/research.mjs': { publicResearch },
  };
  new Function('require', 'module', 'exports', compiled.code)(name => modules[name] ?? require(name), component, component.exports);
  process.env.__NEXT_TRAILING_SLASH = 'true';
  const path = '/print';
  const route = readablePedigreeRoute;
  const prefix = printUnitAnchor(route);
  const raw = bytes.toString();
  const plan = createChapterNotePlan(raw, prefix);
  const index = createChapterReferenceIndex([{ url: route, title: fixture.title, raw }], { print: true });
  const options = createChapterAnnotationPlan(plan, published.claims, index, { print: true });
  const entries = remapReadablePedigreeCitations(readablePedigreeOriginalEntries(), fixture, pin).filter(row => row.path === path);
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const version = row => `此链接按 <time datetime="${row.edition.sourceDate}">${row.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(row.edition.sourceCommit)}">查看这一版本的源文件</a>`;
  function historical(row) {
    const notice = row.mode === 'notice';
    const marker = notice ? 'data-legacy-destination' : 'data-legacy-scope-destination';
    const context = `<p>${version(row)}</p><p>${escape(row.scope.text)}</p><ul>${row.scope.targets.map(target =>
      `<li><a ${marker} href="${escape(citationHref(target, path))}">${escape(readablePedigreeCitationLabel(target, fixture))}</a></li>`).join('')}</ul>`;
    return notice ? `<div id="${row.id}" data-legacy-notice><div class="legacy-citation-context">${context}</div></div>`
      : `<div data-legacy-scope="${row.id}">${context}</div>`;
  }
  const scope = id => historical(entries.find(row => row.id === id));
  const paragraphs = fixture.sections.map(section => `<h3 id="${prefix}-${section.id}" data-reader-heading-key="${section.id}">${section.title}</h3>` +
    section.claimIds.map(id => {
      const note = plan.byClaimId.get(id);
      const claim = fixture.claims.find(row => row.id === id);
      return `<p>${escape(claim.text)}<sup><a role="doc-noteref" data-reader-reference="${id}" aria-label="注 ${note.number}" href="#${note.anchor}">[${note.number}]</a></sup></p>`;
    }).join('')).join('');
  const group = prefix + '-annotations';
  const notes = plan.notes.map(note => {
    const alias = entries.find(row => row.mode === 'alias' && row.targets[0].id === note.anchor);
    const old = `<span id="${alias.id}" data-legacy-for="${note.anchor}">${version(alias)}</span>`;
    const annotation = renderToStaticMarkup(createElement(component.exports.ClaimAnnotation, { id: note.id, ...options.get(note.id) }));
    return `<li id="${note.anchor}" data-reader-claim="${note.id}">${old}${annotation}</li>`;
  }).join('');
  const contexts = entries.filter(row => row.mode === 'notice').map(historical).join('');
  return `<body><article id="${prefix}" data-reader-route="${route}" data-reader-title="${fixture.title}">
    <h2 id="${printReadingEntryAnchor(route)}" tabindex="-1" data-reader-heading-key="@unit">${fixture.title}</h2><p>${fixture.description}</p>
    ${scope(prefix)}${paragraphs}<section class="chapter-notes" aria-labelledby="${group}">
      <h3 id="${group}">注释</h3>${scope(group)}<ol>${notes}</ol></section>${contexts}</article></body>`;
}

test('actual pedigree output requires each old source in its chapter and leaves annotation details usable', async () => {
  const html = await renderedPrint();
  const check = source => validateRenderedReadablePedigree(htmlParser.parse(source), '/print', catalog, fixture, pin, readings);
  const document = htmlParser.parse(html);
  const nativePrint = `[data-legacy-notice][id^="${printUnitAnchor(readablePedigreeRoute)}-"]`;
  const notice = document.querySelector(nativePrint);
  assert(notice.querySelectorAll('[data-legacy-destination]').length > 0);
  assert(document.querySelector('.claim-annotation details:not([open])'));
  assert.deepEqual(check(html), []);

  const noticeMarkup = notice.outerHTML;
  notice.remove();
  document.querySelector('body').insertAdjacentHTML('beforeend', `<div hidden>${noticeMarkup}</div>`);
  assert(check(document.toString()).some(error => error.includes('historical source') && error.includes(notice.id)));

  const paragraph = htmlParser.parse(html).querySelector('[role="doc-noteref"]').closest('p').outerHTML;
  assert(check(html.replace(paragraph, `<details><summary>正文</summary>${paragraph}</details>`))
    .some(error => error.includes('paragraph or note marker')));
  assert(check(html.replace(paragraph, `<template>${paragraph}</template>`))
    .some(error => error.includes('paragraph or note marker')));
});


test('the optional study table has exact source blocks and a fixed place in the 37-note chapter', () => {
  const markdown = [
    '试验说明。',
    '| 所问 | 显示量 | 复算 |\n| --- | --- | --- |\n| 均值 | 1 | 2 |\n| 散布 | 3 | 4 |\n| 后分层 | 5 | 6 |\n| 分层 | 7 | 8 |',
    '试验限度。',
  ].join('\n\n');
  const raw = [
    '---', `title: ${fixture.title}`, `description: ${fixture.description}`, '---', '',
    ...fixture.sections.map(section => `## ${section.id}\n\n<Prose ids="${section.claimIds.join(' ')}" />\n`),
  ].join('\n');
  const nextClaim = ' cl-ped-estimate-boundary" />';
  assert(raw.includes(nextClaim));
  const withStudy = raw.replace(nextClaim, '" />\n\n' + markdown + '\n\n<Prose ids="cl-ped-estimate-boundary" />');
  const oldLayout = inspectReadablePedigreeSource(raw);
  const { studyTable, ...existing } = inspectReadablePedigreeSource(withStudy);
  assert.deepEqual(existing, oldLayout);
  assert.deepEqual(studyTable.headers, ['所问', '显示量', '复算']);
  assert.deepEqual(studyTable.rows[3], ['分层', '7', '8']);
  assert.equal(studyTable.introduction, '试验说明。');
  assert.equal(studyTable.explanation, '试验限度。');
  for (const changed of [
    withStudy.replace('试验说明。', '试验说明。\n\n额外段落。'),
    withStudy.replace('| 均值 | 1 | 2 |', '| 均值 | 1 |'),
    withStudy.replace('试验限度。', '<span>试验限度。</span>'),
    raw.replace('## 杯重调查与估计', markdown + '\n\n## 杯重调查与估计'),
  ]) assert.equal(inspectReadablePedigreeSource(changed), null);
});

test('an admitted study table checks every rendered cell, label, placement and both visible explanations', () => {
  const study = {
    introduction: '试验说明。', headers: ['所问', '显示量', '复算'],
    rows: [['均值', '1', '2'], ['散布', '3', '4'], ['后分层', '5', '6'], ['分层', '7', '8']],
    explanation: '试验限度。',
  };
  const table = '<table><thead><tr>' + study.headers.map(cell => '<th scope="col">' + cell + '</th>').join('')
    + '</tr></thead><tbody>' + study.rows.map(row => '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('')
    + '</tbody></table>';
  const mark = id => '<p>规范段落<sup><a role="doc-noteref" data-reader-reference="' + id + '">[注]</a></sup></p>';
  const html = '<article><h3 data-reader-heading-key="散布与估计精度">散布与估计精度</h3>'
    + mark('cl-ped-stratified-conflict') + '<p>试验说明。</p><div>' + table + '</div><p>试验限度。</p>'
    + mark('cl-ped-estimate-boundary') + '</article>';
  const verify = (value, expected = study) =>
    validateReadablePedigreeStudyTable(htmlParser.parse(value).querySelector('article'), '/print', expected);
  assert.deepEqual(verify(html).errors, []);
  assert.equal(verify(html).checked.size, 3);
  const unapproved = validateReadablePedigreeStudyTable(htmlParser.parse(html).querySelector('article'), '/print', null);
  assert.match(unapproved.errors.join(), /unreviewed table/);
  for (const changed of [
    html.replace('<td>8</td>', '<td>9</td>'),
    html.replace('<th scope="col">所问</th>', '<td>所问</td>'),
    html.replace('<th scope="col">所问</th>', '<th scope="col" aria-label="另一个量">所问</th>'),
    html.replace('<td>1</td>', '<td rowspan="2">1</td>'),
    html.replace('<thead>', '未审文字<thead>'),
    html.replace('<td>散布</td>', '<td aria-hidden="true">散布</td>'),
    html.replace('<div><table>', '<div hidden><table>'),
    html.replace('</table>', '</table><table></table>'),
    html.replace('cl-ped-stratified-conflict', 'cl-ped-population-spread'),
    html.replace('<p>试验限度。</p>', '<p hidden>试验限度。</p>'),
    html.replace('<p>试验说明。</p>', '<p>未审段落。</p><p>试验说明。</p>'),
    html.replace('data-reader-heading-key="散布与估计精度"', 'data-reader-heading-key="其他章节"'),
  ]) assert(verify(changed).errors.length);
});
