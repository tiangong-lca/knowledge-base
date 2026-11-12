import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import original from '../config/pm-selection-original.json' with { type: 'json' };
import pending from '../config/pm-selection-accepted.json' with { type: 'json' };
import pedigreeAccepted from '../config/readable-pedigree-accepted.json' with { type: 'json' };
import edition from '../config/book-edition.json' with { type: 'json' };
import rawCatalog from '../knowledge/catalog.json' with { type: 'json' };
import { getClaimEvidence, publicCatalog } from './knowledge.mjs';
import { publicResearch } from './research.mjs';
import { printReadingEntryAnchor } from './reader-numbering.mjs';
import { createChapterAnnotationPlan, createChapterNotePlan, createChapterReferenceIndex, printUnitAnchor } from './reader-book.mjs';
import { citationHref, citationSourceHref } from './reader-citations.mjs';
import {
  assertPmSelectionAccepted, assertPmSelectionOriginal, inspectPmSelectionSource, pmSelectionAcceptedDigest,
  pmSelectionAppendix, pmSelectionBookHref, pmSelectionCasePaths, pmSelectionCitationLabel, pmSelectionDigest,
  pmSelectionHeadingEntries, pmSelectionOriginalDigest, pmSelectionRoute, remapPmSelectionCitations,
  validatePmSelectionCaseBytes, validatePmSelectionCoverage, validateRenderedPmSelection,
} from './reader-pm-selection.mjs';

const read = file => readFile(new URL('../' + file, import.meta.url));
const chapters = edition.units.filter(unit => [pmSelectionRoute, pmSelectionAppendix].includes(unit.key));
const newClaims = Array.from({ length: 6 }, (_, index) => ({
  id: `cl-pm-test-${index}`, text: `测试段落 ${index}。`, kind: 'synthesis', scope: '测试范围。',
  evidenceIds: [], premiseIds: [original.orderedClaimIds[0]], conceptIds: [], mappingIds: [], caveats: ['测试限制。'],
  reasoning: '测试前提。', status: 'reviewed', reviewedAt: '2026-11-10', reviewKind: 'agent-source-check',
}));
const amended = original.claims.map((row, index) => index === 0 ? { ...row, text: '测试替代命题。', reviewedAt: '2026-11-10' } : row);
const records = [...amended.slice(0, 31), ...newClaims, ...amended.slice(31)];
const sources = new Map(chapters.map((unit, index) => {
  const title = index ? '颗粒物因子的连接与复算' : '颗粒物健康';
  const other = chapters[1 - index];
  const intro = index ? `回到[颗粒物健康](${other.key})。\n\n` : '';
  const rows = index ? records.slice(37) : records.slice(0, 37);
  const chunks = index ? [5, 3, 4, 5] : [11, 9, 8, 9];
  let start = 0;
  const blocks = unit.sections.map((section, at) => {
    const ids = rows.slice(start, start + chunks[at]).map(row => row.id).join(' ');
    start += chunks[at];
    const nextSection = other.sections[at];
    return `## ${section.title}\n\n<Prose ids="${ids}" />\n\n参见[${nextSection.title}](${other.key}#${nextSection.id})。`;
  });
  return [unit.key, `---\ntitle: ${title}\ndescription: 测试章节说明。\n---\n\n${intro}${blocks.join('\n\n')}\n`];
}));
const units = [...sources].map(([route, raw]) => inspectPmSelectionSource(route, raw));
const research = {
  readings: original.readingClosure.readings, literature: original.readingClosure.literature,
  gaps: [], revisions: [{ id: 'rev-kb90-test-fixture' }], queries: [{ id: 'q-kb90-test-fixture' }],
};
const context = {
  readings: { readings: research.readings, gaps: research.gaps, revisions: research.revisions },
  literature: { records: research.literature, protocol: { queries: research.queries } },
};
// Synthetic acceptance and independent pin are local to the test process.
const accepted = {
  schemaVersion: 1, status: 'reviewed', originalDigest: pmSelectionOriginalDigest, units, claims: records,
  scientificClosure: { claims: [], evidence: original.scientificClosure.evidence, sources: original.scientificClosure.sources,
    concepts: original.conceptUses.concepts, mappings: original.conceptUses.mappings },
  research,
  reviewEvidence: ['fixture-source', 'fixture-reader', 'fixture-engineering'].map(kind => ({ kind, reportSha256: 'a'.repeat(64), receiptSha256: 'b'.repeat(64) })),
};
const pin = pmSelectionDigest(accepted);
const fixedClaims = new Set(records.map(row => row.id));
const fixtureEvidence = new Map(original.scientificClosure.evidence.map(row => [row.id, row]));
const catalog = {
  ...rawCatalog,
  claims: [...rawCatalog.claims.filter(row => !row.id.startsWith('cl-pm-')), ...records],
  evidence: rawCatalog.evidence.map(row => fixtureEvidence.get(row.id) ?? row),
};
const published = publicCatalog(catalog);
const oldEntries = [...original.publication.history.existingAffectedEntries, ...pmSelectionHeadingEntries()];
const remapped = remapPmSelectionCitations(oldEntries, accepted, pin);

const recheck = value => assertPmSelectionAccepted(value, pmSelectionDigest(value));

test('exact immutable original and independently pinned production acceptance remain separate', () => {
  assertPmSelectionOriginal();
  const corrupt = structuredClone(original);
  corrupt.publication.history.additionalActualPrintHeadings.pop();
  assert.throws(() => assertPmSelectionOriginal(corrupt), /immutable bb12/);
  if (pending.status === 'pending') {
    assert.equal(pmSelectionAcceptedDigest, null);
    assert.throws(() => assertPmSelectionAccepted(pending), /acceptance is incomplete/);
  }
  assert.throws(() => assertPmSelectionAccepted(accepted), /acceptance is incomplete/);
  assert.doesNotThrow(() => assertPmSelectionAccepted(accepted, pin));
  for (const [mutate, message] of [
    [value => { value.claims.pop(); }, /48 conserved/],
    [value => { value.claims.find(row => row.id === 'cl-pm-intake-unit').text += '改变。'; }, /protected case/],
    [value => { value.claims.find(row => row.id === 'cl-pm-indoor-matrix').reviewedAt = '2026-11-10'; }, /protected case/],
    [value => { value.claims[0].reviewedAt = original.claims[0].reviewedAt; }, /metadata\/review/],
    [value => { value.claims[0].reviewedAt = '2026-02-31'; }, /48 conserved/],
    [value => { value.scientificClosure.evidence[0].locator += '改变。'; }, /original evidence identity/],
    [value => { value.research.readings[0].readAt = '2026-11-10'; }, /original reading/],
    [value => { value.reviewEvidence.pop(); }, /separate source, reader and engineering/],
  ]) {
    const value = structuredClone(accepted);
    mutate(value);
    assert.throws(() => recheck(value), message);
  }
});

test('bounded Gronlund appraisal successor preserves the original locator, carrier and remaining conditions', () => {
  const value = structuredClone(accepted);
  const row = value.scientificClosure.evidence.find(row => row.id === 'ev-kb46-gronlund2015-burden-comparison');
  row.appraisal.limitations[0] = '测试限定。';
  row.appraisal.checkedAt = '2026-11-10';
  assert.doesNotThrow(() => recheck(value));
  row.passageId = 'psg-wrong';
  assert.throws(() => recheck(value), /original evidence identity/);
});

test('actual chapter, appendix and catalog must match exact reviewed source in raw and public projections', () => {
  const check = (input, data, options = context) => validatePmSelectionCoverage(edition, input, data, accepted, pin, options);
  assert.deepEqual(check(sources, catalog), []);
  assert.deepEqual(check(sources, published, { ...context, projection: 'public' }), []);
  const draft = new Map(sources);
  draft.set(pmSelectionAppendix, draft.get(pmSelectionAppendix).replace('区室与活动时间', '其他小节'));
  assert(check(draft, catalog).some(error => error.includes('actual title, description, heading, prose or navigation')));
  draft.set('/docs/example', '<Prose ids="cl-pm-opening" />');
  assert(check(draft, catalog).some(error => error.includes('canonical occurrence outside')));
  const changed = structuredClone(catalog);
  changed.claims.find(row => row.id === records[0].id).reviewKind = 'changed';
  changed.evidence.find(row => row.id === accepted.scientificClosure.evidence[0].id).locator += '改动';
  assert.equal(check(sources, changed).filter(error => error.includes('reviewed')).length, 2);
  const ledger = structuredClone(context);
  ledger.readings.revisions.push({ id: 'rev-kb90-not-reviewed' });
  assert(check(sources, catalog, ledger).some(error => error.includes('reviewed research revisions')));
});

test('new published reverse premise, evidence and concept consumers require a reviewed disposition', () => {
  const outsider = 'cl-system-model';
  for (const [field, reference, kind] of [
    ['premiseIds', records[0].id, 'premise'],
    ['evidenceIds', 'ev-kb46-humbert2011-intake-table', 'evidence'],
    ['conceptIds', 'cn-pm-response-slopes', 'concept'],
  ]) {
    const changed = structuredClone(catalog), row = changed.claims.find(row => row.id === outsider);
    assert(row && !row[field].includes(reference));
    row[field].push(reference);
    if (field === 'evidenceIds') row.evidenceLinks = row.evidenceIds.map(evidenceId => ({
      evidenceId, relation: evidenceId === reference ? 'context' : 'supports', rationale: '测试已有及新增的外部使用。',
    }));
    for (const [data, projection] of [[changed, 'raw'], [publicCatalog(changed), 'public']])
      assert(validatePmSelectionCoverage(edition, sources, data, accepted, pin, { ...context, projection })
        .some(error => error.includes(`external ${kind} consumer roster`)));
    // An unpublished draft does not silently become a published consumer.
    row.status = 'needs-review';
    assert(!validatePmSelectionCoverage(edition, sources, changed, accepted, pin, context)
      .some(error => error.includes(`external ${kind} consumer roster`)));
  }
});

test('historical splits preserve every address and exact ordered original scope across both carriers', () => {
  assert.equal(oldEntries.length, 225);
  assert.equal(pmSelectionHeadingEntries().length, 9);
  const unrelated = { route: '/docs/other', path: '/print', id: 'unrelated', targets: [{ route: '/docs/other' }] };
  assert.equal(remapPmSelectionCitations([unrelated, ...oldEntries], accepted, pin)[0], unrelated);
  assert.throws(() => remapPmSelectionCitations(oldEntries.slice(1), accepted, pin), /missing original historical entries/);
  assert.throws(() => remapPmSelectionCitations([...oldEntries, oldEntries[0]], accepted, pin), /repeated or changed/);
  for (const [index, entry] of remapped.entries()) {
    const former = oldEntries[index];
    assert.equal(entry.id, former.id);
    assert.deepEqual(entry.edition, former.edition);
    const target = former.targets[0];
    if (target.kind === 'note') {
      assert.equal(entry.targets[0].claimId, target.claimId);
      assert.equal(entry.targets[0].route, units.find(unit => unit.blocks.some(block => block.ids?.includes(target.claimId))).route);
      if (entry.path === pmSelectionRoute && entry.targets[0].route === pmSelectionAppendix) assert.equal(entry.mode, 'notice');
      continue;
    }
    const priorSection = original.publication.actualHostedCapture.views.find(view => view.path === entry.path).sections.find(section => section.id === target.id);
    assert.deepEqual(entry.scope.targets.filter(row => row.kind === 'note').map(row => row.claimId), priorSection?.claimIds ?? original.orderedClaimIds);
  }
  const heading = chapters[1].sections[0].id;
  assert.equal(pmSelectionBookHref(`${pmSelectionAppendix}#${encodeURIComponent(heading)}`, pmSelectionRoute), `#${printUnitAnchor(pmSelectionAppendix)}-${heading}`);
  assert.equal(pmSelectionBookHref(`${pmSelectionAppendix}#${heading}`, '/docs/other'), `${pmSelectionAppendix}#${heading}`);
  assert.equal(pmSelectionBookHref(pmSelectionRoute, pmSelectionAppendix), `#${printReadingEntryAnchor(pmSelectionRoute)}`);
  assert.equal(pmSelectionBookHref(pmSelectionAppendix+'/', pmSelectionRoute), `#${printReadingEntryAnchor(pmSelectionAppendix)}`);
  const explicitOld=`/print/#${printUnitAnchor(pmSelectionRoute)}`;
  assert.equal(pmSelectionBookHref(explicitOld,pmSelectionAppendix),explicitOld);
});

test('PM case bytes require the independently accepted pedigree publication and all other original hashes', async () => {
  const files = Object.fromEntries(await Promise.all(pmSelectionCasePaths.map(async path => [path, await read(path)])));
  assert.equal(Object.keys(files).length, 36);
  assert.deepEqual(validatePmSelectionCaseBytes(files, pedigreeAccepted), []);
  assert.throws(() => validatePmSelectionCaseBytes(files, undefined), /requires independently pinned reviewed current content/);
  assert.throws(() => validatePmSelectionCaseBytes(files, { ...pedigreeAccepted, casePublicationSha256: '0'.repeat(64) }), /requires independently pinned reviewed current content/);
  for (const path of [original.particulateCase.publicationFile, 'knowledge/cases/pedigree-calibration-v1.json', 'knowledge/cases/pedigree-calibration-v1.publication.json']) {
    const altered = { ...files, [path]: Buffer.concat([files[path], Buffer.from(' ')]) };
    assert.deepEqual(validatePmSelectionCaseBytes(altered, pedigreeAccepted), [`PM selection case bytes differ: ${path}`]);
  }
});

const require = createRequire(import.meta.url), mdxRequire = createRequire(require.resolve('fumadocs-mdx'));
const compiled = mdxRequire('esbuild').transformSync((await read('components/evidence.tsx')).toString(), { loader: 'tsx', jsx: 'automatic', format: 'cjs' });
const component = { exports: {} };
const bindings = {
  '@/lib/catalog': { __esModule: true, default: published, getClaimEvidence, isKnownClaim: id => fixedClaims.has(id) },
  '@/knowledge/research/literature-map.json': context.literature, '@/knowledge/research/readings.json': context.readings,
  '@/scripts/research.mjs': { publicResearch },
};
new Function('require', 'module', 'exports', compiled.code)(name => bindings[name] ?? require(name), component, component.exports);
const { ClaimAnnotation } = component.exports;
process.env.__NEXT_TRAILING_SLASH = 'true';

function printFixture() {
  const path = '/print', entries = remapped.filter(row => row.path === path);
  const index = createChapterReferenceIndex(units.map(unit => ({ url: unit.route, title: unit.title, raw: sources.get(unit.route) })), { print: true });
  const version = entry => `此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a>`;
  const alias = id => entries.filter(row => row.mode === 'alias' && row.targets[0].id === id).map(row =>
    `<span id="${row.id}" data-legacy-for="${id}"><span class="legacy-citation-context">${version(row)}</span></span>`).join('');
  const renderScope = row => {
    const retained = row.mode === 'retained';
    const links = (retained ? row.scope.targets : row.targets).map(target => `<li><a href="${citationHref(target, path)}">${pmSelectionCitationLabel(target, accepted)}</a></li>`).join('');
    return `<div ${retained ? 'data-legacy-scope' : 'data-legacy-notice id'}="${row.id}"><p>${version(row)}</p><p>${row.scope?.text ?? '可从下列链接查阅这一留存版本对应的内容。'}</p><ul>${links}</ul></div>`;
  };
  const scope = id => entries.filter(row => row.mode === 'retained' && row.scope && row.id === id).map(renderScope).join('');
  return units.map(unit => {
    const prefix = printUnitAnchor(unit.route), plan = createChapterNotePlan(sources.get(unit.route), prefix);
    const annotations = createChapterAnnotationPlan(plan, published.claims, index, { print: true });
    const content = unit.blocks.map(block => {
      if (block.kind === 'section') return `<h3 data-reader-heading-key="${block.id}" id="${prefix}-${block.id}">${block.title}</h3>`;
      if (block.kind === 'claims') return `<div class="scholarly-prose">${block.ids.map(id => {
        const { number, anchor } = plan.byClaimId.get(id);
        return `<p>${records.find(row => row.id === id).text}<a role="doc-noteref" data-reader-reference="${id}" href="#${anchor}" aria-label="注 ${number}">[${number}]</a></p>`;
      }).join('')}</div>`;
      let text = block.text;
      for (const link of block.links) text = text.replace(link.label, `<a href="${pmSelectionBookHref(link.href, unit.route)}">${link.label}</a>`);
      return `<p>${text}</p>`;
    }).join('');
    const notes = plan.notes.map(note => `<li id="${note.anchor}" data-reader-claim="${note.id}">${alias(note.anchor)}${renderToStaticMarkup(createElement(ClaimAnnotation, { id: note.id, ...annotations.get(note.id) }))}</li>`).join('');
    const notices = entries.filter(row => row.route === unit.route && row.mode === 'notice').map(renderScope).join('');
    const group = `${prefix}-annotations`;
    return `<article id="${prefix}" data-reader-route="${unit.route}" data-reader-title="${unit.title}"><h2 id="${printReadingEntryAnchor(unit.route)}" tabindex="-1" data-reader-heading-key="@unit">${unit.title}</h2><p>${unit.description}</p>${scope(prefix)}${content}<section class="chapter-notes" aria-labelledby="${group}"><h3 id="${group}">注释</h3>${scope(group)}<ol>${notes}</ol></section>${notices}</article>`;
  }).join('');
}

test('actual print paragraphs, headings, notes, historical scope and ordinary local links are checked', () => {
  const html = printFixture(), check = input => validateRenderedPmSelection(htmlParser.parse(input), '/print', published, accepted, pin);
  assert.deepEqual(check(html), []);
  const actual = htmlParser.parse(html), heading = actual.querySelector('h3[data-reader-heading-key]');
  const currentTitle = actual.querySelector('[data-reader-heading-key="@unit"]');
  const paragraph = actual.querySelector('[role="doc-noteref"]').closest('p');
  const historical = actual.querySelector('[data-legacy-scope]');
  const ordinary = actual.querySelector('.scholarly-prose').nextElementSibling.querySelector('a');
  for (const [changed, wanted] of [
    [html.replace(heading.outerHTML, heading.outerHTML.replace('<h3', '<h3 style="display:none"')), 'formal heading'],
    [html.replace(paragraph.outerHTML, paragraph.outerHTML.replace('[1]', '[5]')), 'canonical paragraph or note marker'],
    [html.replace(historical.outerHTML, ''), 'historical source scope'],
    [html.replace(ordinary.outerHTML, ordinary.outerHTML.replace(/href="[^"]+"/, 'href="#wrong"')), 'ordinary navigation paragraph'],
    [html.replace('测试替代命题。', '改动正文。'), 'canonical paragraph or note marker'],
    [html.replace(currentTitle.outerHTML, currentTitle.outerHTML.replace(' tabindex="-1"', '')), 'actual title or unit identity'],
    [html.replace(currentTitle.outerHTML, currentTitle.outerHTML.replace(/ id="[^"]+"/, '')), 'actual title or unit identity'],
    [html.replace(currentTitle.outerHTML, `<span id="${currentTitle.id}"></span>` + currentTitle.outerHTML), 'actual title or unit identity'],
    [html.replace('<ol>', '<ol start="88">'), 'continuous note group'],
    [html.replace('<ol>', '<ol reversed>'), 'continuous note group'],
    [html.replace('<ol>', '<ol type="A">'), 'continuous note group'],
    [html.replace('<ol>', '<ol style="list-style-type:upper-roman">'), 'continuous note group'],
    [html.replace('<li id=', '<li value="88" id='), 'continuous note group'],
  ]) {
    assert.notEqual(changed, html);
    assert(check(changed).some(error => error.includes(wanted)));
  }
});
