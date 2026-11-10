import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import nativeMdx from 'fumadocs-ui/mdx';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { chapterAnchorPrefix, createChapterAnnotationPlan, createChapterNotePlan, createChapterReferenceIndex, printUnitAnchor } from './reader-book.mjs';
import { citationHref, citationSourceHref } from './reader-citations.mjs';
import { validateClosingSynthesisCoverage } from './reader-closing-synthesis.mjs';
import { getClaimEvidence, publicCatalog } from './knowledge.mjs';
import { publicResearch } from './research.mjs';
import {
  assertToxicityPathwaysAccepted, assertToxicityPathwaysOriginal, remapToxicityPathwaysCitations,
  toxicityPathwaysCitationLabel, toxicityPathwaysDigest, toxicityPathwaysHeadingEntries,
  toxicityPathwaysOriginalDigest, toxicityPathwaysOriginalEntries, toxicityPathwaysRoute as route,
  validateRenderedToxicityPathways, validateToxicityPathwaysCoverage,
} from './reader-toxicity-pathways.mjs';

const read = file => readFile(new URL('../' + file, import.meta.url));
const json = async file => JSON.parse(await read(file + '.json'));
const sha = value => createHash('sha256').update(value).digest('hex');
const [original, edition, rawCatalog, b32Original, b32Current, b32Prose, readingRegister, literatureMap] = await Promise.all([
  'config/toxicity-pathways-original', 'config/book-edition', 'knowledge/catalog', 'config/closing-synthesis-original',
  'config/closing-synthesis-current-accepted', 'config/closing-synthesis-prose-accepted',
  'knowledge/research/readings', 'knowledge/research/literature-map',
].map(json));
const title = '毒性路径', description = '专用于验证发布约束的章说明。';
const sections = [
  ['排放与受体', ['matched-emissions', 'fate-exposure-effect', 'intake-and-effects', 'indicators-not-observed-cases']],
  ['模型与范围', ['model-comparison', 'comparison-uncertainty', 'boxes-and-time', 'internal-feature-conflict']],
  ['比较的依据', ['missing-data-model-zero', 'factor-flags-and-conditions', 'prioritization', 'conclusion']],
].map(([heading, suffixes]) => ({ id: heading, title: heading, claimIds: suffixes.map(suffix => 'cl-usetox-' + suffix) }));
const ids = sections.flatMap(section => section.claimIds);
const raw = `---\ntitle: ${title}\ndescription: ${description}\n---\n\n${sections.map(section => `## ${section.title}\n\n<Prose ids="${section.claimIds.join(' ')}" />\n`).join('\n')}`;
const claims = ids.map((id, index) => {
  const base = original.claims.find(row => row.id === id);
  return base ? { ...structuredClone(base), text: `保留命题的验证段落 ${index + 1}。` }
    : { id, text: `新命题的验证段落 ${index + 1}。`, kind: 'synthesis', scope: '验证范围。', reasoning: '验证推理。',
      caveats: ['验证限制。'], status: 'reviewed', reviewedAt: '2026-11-09', reviewKind: 'agent-source-check',
      evidenceIds: [], premiseIds: [original.orderedClaimIds[0]], conceptIds: [] };
});
const readings = {
  readings: original.originalReadingRecords,
  gaps: readingRegister.gaps.filter(row => row.id === 'gap-lcia-usetox-internal-scope-conflict'),
  revisions: readingRegister.revisions.filter(row => row.id.startsWith('rev-kb88-')),
};
const literature = {
  records: original.originalLiteratureRecords,
  protocol: { queries: literatureMap.protocol.queries.filter(row => row.id.startsWith('q-kb88-')) },
};
// A standalone fixture pin qualifies only this test data.
const accepted = {
  schemaVersion: 1, status: 'reviewed', originalDigest: toxicityPathwaysOriginalDigest, route, title, sections,
  source: { mdxSha256: sha(raw), description }, claims, scientificClosure: structuredClone(original.scientificClosure),
  research: {
    readings: readings.readings, literature: literature.records,
    gaps: readings.gaps, revisions: readings.revisions, queries: literature.protocol.queries,
  },
  b32Consumers: original.directPremiseConsumers.map(row => ({ id: row.id, rationale: '验证原前提关系。' })),
  reviewEvidence: [{ kind: 'fixture only', reportSha256: 'a'.repeat(64), receiptSha256: 'b'.repeat(64) }],
};
const pin = toxicityPathwaysDigest(accepted), sources = new Map([[route, raw]]);
const catalog = structuredClone(rawCatalog);
for (const [kind, rows] of Object.entries({
  claims: [...claims, ...original.directPremiseConsumers, ...original.conceptUses.adjacentClaims],
  evidence: accepted.scientificClosure.evidence, sources: accepted.scientificClosure.sources,
  concepts: [...original.conceptUses.concepts, ...original.conceptUses.adjacentConcepts], mappings: original.conceptUses.mappings,
})) {
  const fixed = new Set(rows.map(row => row.id));
  catalog[kind] = catalog[kind].filter(row => !fixed.has(row.id)).concat(rows);
}

test('acceptance fails closed and exact source, research and catalog changes are independently bound', () => {
  assertToxicityPathwaysOriginal(original);
  const changedOriginal = structuredClone(original);
  changedOriginal.publication.history.additionalActualPrintHeadings.pop();
  assert.throws(() => assertToxicityPathwaysOriginal(changedOriginal), /immutable c919/);
  assert.throws(() => assertToxicityPathwaysAccepted({ ...accepted, status: 'pending' }, pin), /incomplete/);
  assert.throws(() => assertToxicityPathwaysAccepted(accepted), /incomplete/);
  for (const alter of [
    copy => copy.claims.pop(),
    copy => copy.scientificClosure.evidence[0].locator += '改动',
    copy => copy.research.readings[0].artifacts[0].sha256 = 'c'.repeat(64),
    copy => copy.research.queries.pop(),
    copy => copy.b32Consumers.pop(),
    copy => copy.claims.find(row => row.id === original.orderedClaimIds[0]).premiseIds.push(ids.at(-1)),
  ]) {
    const copy = structuredClone(accepted);
    alter(copy);
    assert.throws(() => assertToxicityPathwaysAccepted(copy, toxicityPathwaysDigest(copy)), /exact shared source|changes an original|research audit|consumer judgments|closure differs|B32 premise/);
  }
  const check = (book, mdx, records, projection = 'raw') =>
    validateToxicityPathwaysCoverage(book, mdx, records, accepted, pin, { projection, readings, literature });
  assert.deepEqual(check(edition, sources, catalog), []);
  assert.deepEqual(check(edition, sources, publicCatalog(catalog), 'public'), []);
  for (const change of [
    value => value.replace(ids[0], ids[1]),
    value => value.replace('## 模型与范围', '## 另一个标题'),
    value => value + '\n未经审阅的句子。\n',
  ]) assert(check(edition, new Map([[route, change(raw)]]), catalog).some(error => /actual MDX/.test(error)));
  const altered = structuredClone(catalog);
  altered.evidence.find(row => row.id === original.scientificClosure.evidence[0].id).locator += '改动';
  assert(check(edition, sources, altered).some(error => /reviewed evidence record differs/.test(error)));
});

test('both catalog projections require each scoped audit row and allow unrelated research additions', () => {
  const audit = { gaps: readings.gaps, revisions: readings.revisions, queries: literature.protocol.queries };
  assert.deepEqual(Object.values(audit).map(rows => rows.length), [1, 3, 3]);
  for (const [kind, rows] of Object.entries(audit)) for (const row of rows) {
    for (const altered of [rows.filter(entry => entry !== row), [...rows, row]]) {
      const changed = { ...accepted, research: { ...accepted.research, [kind]: altered } };
      assert.throws(() => assertToxicityPathwaysAccepted(changed, toxicityPathwaysDigest(changed)), /exact seven research audit records/);
    }
    const changed = { ...accepted, research: { ...accepted.research, [kind]: [...rows, { id: 'unrelated' }] } };
    assert.throws(() => assertToxicityPathwaysAccepted(changed, toxicityPathwaysDigest(changed)), /exact seven research audit records/);
  }
  for (const [projection, records] of [['raw', catalog], ['public', publicCatalog(catalog)]]) {
    const check = ({ gaps, revisions, queries }) => validateToxicityPathwaysCoverage(edition, sources, records, accepted, pin,
      { projection, readings: { ...readings, gaps, revisions }, literature: { ...literature, protocol: { queries } } });
    for (const [kind, rows] of Object.entries(audit)) {
      assert.deepEqual(check({ ...audit, [kind]: [...rows, { id: 'unrelated' }] }), []);
      for (const row of rows) {
        const field = { gaps: 'description', revisions: 'reasoning', queries: 'query' }[kind];
        for (const altered of [rows.filter(entry => entry !== row), [...rows, row],
          rows.map(entry => entry === row ? { ...row, [field]: `${row[field]} changed` } : entry)]) {
          assert.deepEqual(check({ ...audit, [kind]: altered }), ['Toxicity pathways reviewed research record differs: ' + row.id]);
        }
      }
    }
  }
});

test('the c919 addition preserves all 36 prior addresses and exact original heading and group subsets', () => {
  const oldEntries = original.publication.history.existingAffectedEntries;
  const headings = toxicityPathwaysHeadingEntries(), frozen = toxicityPathwaysOriginalEntries();
  assert.equal(oldEntries.length, 36);
  assert.equal(headings.length, 3);
  assert(headings.every(row => row.path === '/print' && row.edition.sourceCommit === original.baseCommit));
  const unrelated = { ...oldEntries[0], route: '/docs/unrelated', path: '/docs/unrelated', id: 'sentinel',
    targets: [{ route: '/docs/unrelated', path: '/docs/unrelated', id: 'sentinel', kind: 'heading' }] };
  const mapped = remapToxicityPathwaysCitations([...frozen, unrelated], accepted, pin);
  assert.equal(mapped.at(-1), unrelated);
  assert.equal(new Set(mapped.map(row => row.path + '#' + row.id)).size, 40);
  for (const [index, previous] of frozen.entries()) {
    const entry = mapped[index], oldTarget = previous.targets[0];
    assert.equal(entry.id, previous.id);
    assert.deepEqual(entry.edition, previous.edition);
    if (oldTarget.kind === 'note') assert.deepEqual(entry, previous);
    else {
      const actual = entry.scope.targets.filter(row => row.kind === 'note').map(row => row.claimId);
      const view = original.publication.actualHostedCapture.views.find(row => row.path === previous.path);
      assert.deepEqual(actual, oldTarget.kind === 'heading' ? view.sections.find(row => row.id === oldTarget.id).claimIds : original.orderedClaimIds);
    }
  }
  for (const bad of [[], frozen.slice(1), [...frozen, frozen[0]],
    [{ ...frozen[0], edition: { ...frozen[0].edition, sourceCommit: 'a'.repeat(40) } }, ...frozen.slice(1)]])
    assert.throws(() => remapToxicityPathwaysCitations(bad, accepted, pin), /missing|repeated or changed/);
});

test('B32 accepts the three reviewed toxicity replacements and preserves older scientific and consumer checks', async () => {
  const fixture = structuredClone(catalog);
  const approved = [...b32Prose.claims, ...b32Original.scientificClosure.claims];
  const approvedIds = new Set(approved.map(row => row.id));
  fixture.claims = fixture.claims.filter(row => !approvedIds.has(row.id)).concat(approved);
  for (const [kind, rows] of [['evidence', b32Original.scientificClosure.evidence], ['sources', b32Original.scientificClosure.sources]]) {
    const existing = new Set(rows.map(row => row.id));
    fixture[kind] = fixture[kind].filter(row => !existing.has(row.id)).concat(rows);
  }
  for (const current of [...b32Current.changes.map(row => row.current), ...claims.filter(row => original.b32AffectedOriginalIds.claims.includes(row.id))])
    fixture.claims = fixture.claims.filter(row => row.id !== current.id).concat(current);
  const closingSources = new Map(await Promise.all(b32Prose.sources.map(async row => [row.route, (await read('content' + row.route + '.mdx')).toString()])));
  const check = (records, projection, approval = accepted) =>
    validateClosingSynthesisCoverage(edition, closingSources, records, b32Prose, undefined, projection, undefined, undefined, approval, pin);
  assert.deepEqual(check(fixture, 'raw'), []);
  assert.deepEqual(check(publicCatalog(fixture), 'public'), []);
  assert(check(fixture, 'raw', null).some(error => /scientific claims closure differs/.test(error)));
  const bad = structuredClone(fixture);
  bad.evidence.find(row => row.id === original.b32AffectedOriginalIds.evidence[0]).locator += '改动';
  assert(check(bad, 'raw').some(error => /scientific evidence closure differs/.test(error)));
});

const published = publicCatalog(catalog), require = createRequire(import.meta.url), mdxRequire = createRequire(require.resolve('fumadocs-mdx'));
const compiled = mdxRequire('esbuild').transformSync((await read('components/evidence.tsx')).toString(), { loader: 'tsx', jsx: 'automatic', format: 'cjs' });
const component = { exports: {} };
const bindings = {
  '@/lib/catalog': { __esModule: true, default: published, getClaimEvidence, isKnownClaim: id => ids.includes(id) },
  '@/knowledge/research/literature-map.json': literature, '@/knowledge/research/readings.json': readings,
  '@/scripts/research.mjs': { publicResearch },
};
new Function('require', 'module', 'exports', compiled.code)(name => bindings[name] ?? require(name), component, component.exports);
const { ClaimAnnotation } = component.exports;
process.env.__NEXT_TRAILING_SLASH = 'true';

function renderChapter(print = true) {
  const path = print ? '/print' : route, prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route);
  const plan = createChapterNotePlan(raw, prefix);
  const index = createChapterReferenceIndex([{ url: route, title, raw }], { print });
  const annotationPlan = createChapterAnnotationPlan(plan, published.claims, index, { print });
  const entries = remapToxicityPathwaysCitations(toxicityPathwaysOriginalEntries(), accepted, pin).filter(row => row.path === path);
  const source = entry => `此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a>`;
  const aliases = id => entries.filter(row => row.mode === 'alias' && row.targets[0].id === id).map(row =>
    `<span id="${row.id}" data-legacy-for="${id}"><span class="legacy-citation-context">${source(row)}</span></span>`).join('');
  const context = row => {
    const isScope = row.mode === 'retained', marker = isScope ? 'data-legacy-scope' : 'id';
    const linkMarker = isScope ? 'data-legacy-scope-destination' : 'data-legacy-destination';
    const links = row.scope.targets.map(item => `<li><a ${linkMarker} href="${citationHref(item, path)}">${toxicityPathwaysCitationLabel(item, accepted)}</a></li>`).join('');
    return `<div ${marker}="${row.id}" ${isScope ? '' : 'data-legacy-notice'} class="legacy-citation-context"><p>${source(row)}</p><p>${row.scope.text}</p><ul>${links}</ul></div>`;
  };
  const scope = id => context(entries.find(row => row.id === id));
  const heading = section => print ? `<h3 id="${prefix}-${section.id}">${section.title}</h3>`
    : renderToStaticMarkup(createElement(nativeMdx.h2, { id: section.id }, section.title)).replace('Copy Anchor Link', '复制章节链接');
  const body = sections.map(section => `${heading(section)}<div class="scholarly-prose">${section.claimIds.map(id => {
    const note = plan.byClaimId.get(id), claim = claims.find(row => row.id === id);
    return `<p>${claim.text}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${note.anchor}" aria-label="注 ${note.number}">[${note.number}]</a></sup></p>`;
  }).join('')}</div>`).join('');
  const groupId = prefix + '-annotations';
  const notes = plan.notes.map(note => `<li id="${note.anchor}" data-reader-claim="${note.id}">${aliases(note.anchor)}${renderToStaticMarkup(createElement(ClaimAnnotation, { id: note.id, ...annotationPlan.get(note.id) }))}</li>`).join('');
  const groupTag = print ? 'h3' : 'h2';
  const group = `<section class="chapter-notes" aria-labelledby="${groupId}"><${groupTag} id="${groupId}">注释</${groupTag}>${scope(groupId)}<ol>${notes}</ol></section>`;
  const notices = entries.filter(row => row.mode === 'notice').map(context).join('');
  const contents = print ? `<h2>${title}</h2><p>${description}</p>${scope(prefix)}${body}${group}${notices}`
    : `<h1>${title}</h1><p>${description}</p><div class="prose flex-1">${body}${group}${notices}</div>`;
  return `<article ${print ? `id="${prefix}"` : ''} data-reader-route="${route}" data-reader-title="${title}">${contents}</article>`;
}

test('rendered print rejects changed body, source annotations, note order and historical scopes', () => {
  const html = renderChapter(), document = htmlParser.parse(html);
  const check = input => validateRenderedToxicityPathways(htmlParser.parse(input), '/print', published, accepted, pin, 'public');
  assert.deepEqual(check(html), []);
  const paragraph = document.querySelector('[role="doc-noteref"]').closest('p');
  const sourceList = document.querySelector('.annotation-sources');
  const historical = document.querySelector('[data-legacy-scope]');
  for (const altered of [
    html.replace(paragraph.outerHTML, paragraph.outerHTML.replace('新命题', '错命题')),
    html.replace(paragraph.outerHTML, paragraph.outerHTML.replace('<p>', '<p style="opacity:0.0">')),
    html.replace(paragraph.outerHTML, paragraph.outerHTML.replace('[1]', '[12]')),
    html.replace(sourceList.outerHTML, ''),
    html.replace(historical.outerHTML, ''),
    html.replace('</article>', '<figure><img src="/wrong.svg"></figure></article>'),
  ]) assert(check(altered).length);
});

test('rendered notes require one direct decimal list starting at one, with no item overrides', () => {
  for (const path of ['/print', route]) {
    const html = renderChapter(path === '/print');
    const list = htmlParser.parse(html).querySelector('.chapter-notes > ol').outerHTML;
    const check = input => validateRenderedToxicityPathways(htmlParser.parse(input), path, published, accepted, pin, 'public');
    assert(!check(html).some(error => error.includes('exact continuous note group differs')));
    for (const altered of [
      list.replace('<ol>', '<ol start="40">'),
      list.replace('<ol>', '<ol reversed>'),
      list.replace('<ol>', '<ol TYPE="a">'),
      list.replace('<ol>', '<ol style="list-style:none">'),
      list.replace('<ol>', '<ol style="list-style-type:upper-roman">'),
      list.replace('<ol>', '<ol class="list-none">'),
      list.replace('<li ', '<li value="40" '),
      list.replace('<li ', '<li style="list-style-type:upper-roman" '),
      list.replace('<li ', '<li class="list-none" '),
      `<div>${list}</div>`,
      `${list}<ol></ol>`,
      `${list}<div><ol></ol></div>`,
    ]) {
      assert.notEqual(altered, list);
      assert(check(html.replace(list, altered)).some(error => error.includes('exact continuous note group differs')));
    }
  }
});

test('rendered web headings require the native self-link and exactly one qualified copy control', () => {
  const html = renderChapter(false), document = htmlParser.parse(html);
  const check = input => validateRenderedToxicityPathways(htmlParser.parse(input), route, published, accepted, pin, 'public');
  // This chapter fixture omits the site-wide pagination fixture.
  assert.deepEqual(check(html), [`${route}: Toxicity pathways website pagination lacks independent qualification`]);
  for (const { id } of sections) {
    const heading = document.getElementById(id).outerHTML;
    const button = document.getElementById(id).querySelector('button').outerHTML;
    for (const altered of [
      heading.replace(button, ''),
      heading.replace(button, button + button),
      heading.replace(button, button.replace('aria-live="polite"', 'aria-live="off"')),
      heading.replace(`href="#${id}"`, 'href="#wrong-heading"'),
      heading.replace(`href="#${id}"`, ''),
    ]) {
      assert.notEqual(altered, heading);
      assert(check(html.replace(heading, altered)).includes(`${route}: Toxicity pathways formal heading differs or is hidden`));
    }
  }
});

test('18 case inputs and all ten existing B32, climate and data artifact files retain their frozen bytes', async () => {
  assert.equal(original.caseInputHashes.length, 18);
  const cases = original.caseInputHashes.flatMap(row => [[row.file, row.sha256], [row.publicationFile, row.publicationSha256]]);
  const boundaries = Object.entries(original.acceptedBoundaryArtifactHashes).map(([file, row]) => [file, row.sha256]);
  for (const [file, expected] of [...cases, ...boundaries]) assert.equal(sha(await read(file)), expected, file);
});
