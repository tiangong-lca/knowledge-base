import { createHash } from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { assertFunctionalReferenceAccepted, assertFunctionalReferenceHeadingHistory, assertFunctionalReferenceProseAccepted, functionalReferenceHeadingEntries, functionalReferenceRoute as route, functionalReferenceSupplement as supplement, remapFunctionalReferenceCitations, validateFunctionalReferenceCoverage, validateRenderedFunctionalReference } from './reader-functional-reference.mjs';
import { currentEditionKeys, publishedHeadingEntries, remapBookCitations } from './reader-edition.mjs';
import { cleanerProductionHeadingEntries, remapCleanerProductionCitations } from './reader-cleaner-production.mjs';
import { createLegacyCitationEntries, createCanonicalCitationEntries } from './reader-citations.mjs';
import { chapterAnchorPrefix, printUnitAnchor, splitReferenceTail, createChapterNotePlan } from './reader-book.mjs';
import { validateReaderOutput, readCitationSurface, validateHistoricalScope } from './reader-surface.mjs';
const json = async name => JSON.parse(await readFile(new URL(`../config/${name}.json`, import.meta.url), 'utf8'));
const [accepted, captured, edition, baseline, placements, history, framework, frameworkHeadings, cleaner, cleanerHeadings] = await Promise.all([
  'functional-reference-accepted','functional-reference-heading-history','book-edition','citation-baseline','citation-placements','citation-history','framework-accepted','framework-heading-history','cleaner-production-accepted','cleaner-production-heading-history',
].map(json));
const body = ids => `<Prose ids="${ids.join(' ')}" />`;
const links = '<SourceRef id="src-ilcd-process" />\n[墙面服务](/docs/book/wall-service-to-comparison/)\n<ConceptRef id="cn-fu" />与<ConceptRef id="cn-reference-flow" />';
const raw = `---\ntitle: 功能参照\n---\n${accepted.sections.map(section => `## ${section.title}\n${body(section.claimIds)}`).join('\n')}\n${links}`;
const fineIds = [...accepted.sources[1].claimIds, ...accepted.additions];
const fine = `---\ntitle: 功能单位与参考流\n---\n${body(fineIds)}\n${links}`;
const sources = () => new Map([[route, raw], [supplement, fine]]);
const available = edition.units.flatMap(unit => [unit.source, ...unit.coverage ?? []]);
const historical = () => remapCleanerProductionCitations(remapBookCitations([
  ...createLegacyCitationEntries(baseline, placements, history.pages),
  ...createCanonicalCitationEntries(history, placements, [...baseline.pages.map(page => page.route), ...placements.printAdditions.map(unit => unit.route)]),
  ...publishedHeadingEntries(frameworkHeadings), ...cleanerProductionHeadingEntries(cleanerHeadings), ...functionalReferenceHeadingEntries(captured),
], edition, framework, placements), cleaner, cleanerHeadings);

test('B06 source and actual eight-heading capture are independently pinned', () => {
  assertFunctionalReferenceAccepted(accepted); assertFunctionalReferenceHeadingHistory(captured);
  assert.equal(accepted.sources.flatMap(source => source.claimIds).length, 15);
  assert.equal(accepted.sections.flatMap(section => section.claimIds).length, 17);
  assert.equal(captured.canonicalPrintedHeadings.length, 8);
  assert.equal(captured.sourceCommit, '87f6a52203a45269507fccfb8eddb39cf2668e92');
  for (const mutate of [copy => copy.sources.pop(), copy => copy.sections[0].claimIds.pop(), copy => copy.ordinaryBlocks[0].target = 'B06-S03']) {
    const copy = structuredClone(accepted); mutate(copy); assert.throws(() => assertFunctionalReferenceAccepted(copy), /inventory differs/);
  }
  for (const mutate of [copy => copy.canonicalPrintedHeadings.pop(), copy => copy.files['print/index.html'].sha256 = '0'.repeat(64), copy => copy.sourceCommit = '0'.repeat(40)]) {
    const copy = structuredClone(captured); mutate(copy); assert.throws(() => assertFunctionalReferenceHeadingHistory(copy), /eight-heading history/);
  }
  assert.throws(() => assertFunctionalReferenceProseAccepted(null), /independently reviewed/);
});

test('exact C08+S03 consumption conserves all other sources in the current 39-unit mixed roster', () => {
  assert.equal(currentEditionKeys(edition, available, baseline, placements).length, 40);
  for (const mutate of [
    copy => copy.units = copy.units.filter(unit => unit.key !== route),
    copy => copy.units.find(unit => unit.key === route).coverage = [],
    copy => copy.units.find(unit => unit.key === route).coverage.push('/docs/history'),
    copy => copy.units.find(unit => unit.key === route).sections.reverse(),
    copy => copy.units.find(unit => unit.key === route).source = '/monograph/empty-b06',
    copy => copy.units.push({ key: supplement, source: supplement, kind: 'topic' }),
  ]) {
    const copy = structuredClone(edition); mutate(copy);
    assert.throws(() => currentEditionKeys(copy, available.filter(source => source !== route), baseline, placements), /B06/);
  }
  for (const missing of [route, supplement]) assert.throws(() => currentEditionKeys(edition, available.filter(source => source !== missing), baseline, placements), /Missing book source|Missing or repeated consumed source/);
  const unrelated = structuredClone(edition); [unrelated.units[8], unrelated.units[9]] = [unrelated.units[9], unrelated.units[8]];
  assert.throws(() => currentEditionKeys(unrelated, available, baseline, placements), /explicit current seven-part numbered order/);
});

test('B06 actual sources guard original/additional occurrences and retained noncanonical links', () => {
  assert.deepEqual(validateFunctionalReferenceCoverage(edition, sources(), accepted), []);
  for (const id of accepted.sections.flatMap(section => section.claimIds)) {
    for (const changed of [raw.replace(id, 'cl-other'), raw.replace(id, `${id} ${id}`)]) {
      const input = sources(); input.set(route, changed);
      assert(validateFunctionalReferenceCoverage(edition, input, accepted).some(error => /propositions/.test(error)));
    }
  }
  for (const mutate of [input => input.delete(supplement), input => input.set(supplement, fine.replace('cl-fu-example', '')), input => input.set(route, raw.replace('## 参考对象', '## 另一节')), input => input.set(supplement, fine.replace('cn-fu', 'cn-other')), input => input.set(route, raw.replace('/docs/book/wall-service-to-comparison/', '/docs/other/'))]) {
    const input = sources(); mutate(input); assert(validateFunctionalReferenceCoverage(edition, input, accepted).length);
  }
  assert.deepEqual(createChapterNotePlan(raw, printUnitAnchor(route)).notes.map(note => note.number), Array.from({ length: 17 }, (_, i) => i + 1));
});

test('all 4072 addresses retain exact original note meanings and source-subset scope', () => {
  const before = historical(), after = remapFunctionalReferenceCitations(before, accepted, captured);
  assert.equal(after.length, 4072); assert.equal(new Set(after.map(entry => `${entry.path}#${entry.id}`)).size, 4072);
  for (const source of accepted.sources) {
    for (const path of [source.route, '/print']) {
      const prefix = path === '/print' ? printUnitAnchor(source.route) : chapterAnchorPrefix(source.route);
      for (const claimId of source.claimIds) {
        const entry = after.find(entry => entry.path === path && entry.id === `${prefix}-claim-${claimId}`);
        assert.equal(entry.targets[0].claimId, claimId);
        assert.equal(entry.targets[0].route, path === supplement ? supplement : route);
      }
      const group = after.find(entry => entry.path === path && entry.id === `${prefix}-annotations`);
      if (path === supplement) assert.equal(group.mode, 'retained');
      assert.deepEqual(group.scope.targets.map(target => target.claimId), source.claimIds);
      assert.equal(group.mode, path === '/print' && source.route === supplement ? 'notice' : 'retained');
      assert(group.scope.text.includes(source.title));
    }
  }
  for (const heading of captured.canonicalPrintedHeadings) assert.equal(after.find(entry => entry.path === '/print' && entry.id === heading.id).mode, 'alias');
  const unrelated = before.filter(entry => !accepted.sources.some(source => source.route === entry.route));
  for (const original of unrelated) assert.deepEqual(after.find(entry => entry.id === original.id && entry.path === original.path), original);
  const corrupted = structuredClone(before), note = corrupted.find(entry => entry.path === '/print' && entry.id.endsWith('-claim-cl-book-service'));
  note.targets[0].claimId = 'cl-book-geometry';
  assert.throws(() => remapFunctionalReferenceCitations(corrupted, accepted, captured), /Changed historical B06 note/);
  const wrongScope = structuredClone(before); wrongScope.find(entry => entry.path === '/print' && entry.id === `${printUnitAnchor(route)}-annotations`).targets[0].kind = 'chapter';
  assert.throws(() => remapFunctionalReferenceCitations(wrongScope,accepted,captured), /Changed historical B06 source meaning/);
  for (const wanted of before.filter(entry => accepted.sources.some(source => source.route === entry.route))) assert.throws(() => remapFunctionalReferenceCitations(before.filter(entry => entry !== wanted), accepted, captured), /Missing or repeated historical B06 source address/);
});

const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const catalog = { claims: accepted.sections.flatMap(section => section.claimIds).map(id => ({ id, status: 'reviewed', text: `保留 ${id} 的完整前提与限定。` })) };
function paragraph(id, print) {
  const prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route), text = catalog.claims.find(claim => claim.id === id).text, { body, tail } = splitReferenceTail(text);
  return `<p>${escape(body)}<span>${escape(tail)}<a role="doc-noteref" data-reader-reference="${id}" href="#${prefix}-claim-${id}">注</a></span></p>`;
}
function rendered(print) {
  const prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route), headingPrefix = print ? `${prefix}-` : '';
  return `<article data-reader-route="${route}" data-reader-title="功能参照"><h${print ? 2 : 1}>功能参照</h${print ? 2 : 1}>${accepted.sections.map(section => `<h${print ? 3 : 2} id="${headingPrefix}${section.id}">${section.title}</h${print ? 3 : 2}>${section.claimIds.map(id => paragraph(id,print)).join('')}`).join('')}<section class="chapter-notes"><h${print ? 3 : 2} id="${prefix}-annotations">注释</h${print ? 3 : 2}></section><a href="/sources/#src-ilcd-process">ILCD字段说明</a><a href="/concepts/#cn-fu">功能单位</a><a href="/concepts/#cn-reference-flow">参考流</a><a href="/docs/book/wall-service-to-comparison/">墙面服务</a></article>`;
}
test('actual canonical body text, occurrence placement and formal headings survive independently of markers', () => {
  for (const print of [false,true]) {
    const path = print ? '/print' : route, html = rendered(print), id = accepted.sections[0].claimIds[0], p = paragraph(id,print);
    const check = text => validateRenderedFunctionalReference(htmlParser.parse(text),path,accepted,catalog);
    assert.deepEqual(check(html), []);
    for (const text of [html.replace(p,''), html.replace(p,p+p), html.replace('的完整前提与限定','的结论'), html.replace('>参考对象<','>错误标题<'), html.replace('/concepts/#cn-fu','/concepts/#cn-other'), html.replace('<a href="/sources/#src-ilcd-process">ILCD字段说明</a>', '')]) assert(check(text).length);
    assert(check(html.replace('<a href="/sources/#src-ilcd-process">ILCD字段说明</a>', '').replace('<section class="chapter-notes">','<section class="chapter-notes"><a href="/sources/#src-ilcd-process">只剩注释链接</a>')).some(error => /authored source/.test(error)));
    if (print) assert(check(html+`<article data-reader-route="${supplement}"></article>`).some(error=>/not printed separately/.test(error)));
  }
});

test('co-deleting B06 acceptance/capture/prose configs cannot bypass book export admission', async () => {
  const root = await mkdtemp(join(tmpdir(),'reader-b06-admission-'));
  try {
    const out = join(root,'out'), config = join(root,'config'); await mkdir(out); await mkdir(config);
    for (const name of ['book-edition','framework-accepted','framework-heading-history','citation-baseline','citation-placements','citation-history','cleaner-production-accepted','cleaner-production-heading-history']) await writeFile(join(config,`${name}.json`),JSON.stringify(await json(name)));
    await assert.rejects(validateReaderOutput(out), /requires its accepted proposition and published heading inventories/);
    for (const name of ['functional-reference-accepted','functional-reference-heading-history']) {
      await writeFile(join(config,`${name}.json`),JSON.stringify(await json(name)));
      await assert.rejects(validateReaderOutput(out), /requires its accepted proposition and published heading inventories/);
    }
  } finally { await rm(root,{recursive:true,force:true}); }
});


test('native retained source scopes reject missing, broadened, displaced, duplicated and false-edition context', () => {
  const entry = remapFunctionalReferenceCitations(historical(), accepted, captured).find(entry => entry.path === '/print' && entry.id === `${printUnitAnchor(route)}-annotations`);
  const edition = `<time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time><a href="https://github.com/tiangong-lca/knowledge-base/tree/${entry.edition.sourceCommit}">原版</a>`;
  const links = entry.scope.targets.map(target => `<a data-legacy-scope-destination href="#${target.id}">注释</a>`).join('');
  const context = `<div data-legacy-scope="${entry.id}">${edition}<p>${entry.scope.text}</p>${links}</div>`;
  const html = `<section class="chapter-notes"><h3 id="${entry.id}">注释</h3>${context}</section>`;
  const check = text => validateHistoricalScope(readCitationSurface(htmlParser.parse(text),'/print').ids.get(entry.id),entry);
  assert.deepEqual(check(html), []);
  for (const changed of [html.replace(context,''), html.replace(context,context+context), html.replace(links,links+'<a data-legacy-scope-destination href="#unrelated">其他注释</a>'), html.replace(context,'')+context, html.replace(entry.scope.text,'原有注释'), html.replace('datetime="2026-11-07"','datetime="2026-11-06"'), html.replace(entry.edition.sourceCommit,'0'.repeat(40))]) assert(check(changed).length);
});


test('co-deleting the current edition itself cannot turn book source into an ungoverned fixture', async () => {
  const { validateRepository } = await import('./validate.mjs');
  const root = await mkdtemp(join(tmpdir(),'reader-b06-edition-required-'));
  try {
    await mkdir(join(root,'knowledge'),{recursive:true}); await mkdir(join(root,'content/docs/book'),{recursive:true});
    await writeFile(join(root,'knowledge/catalog.json'),JSON.stringify({schemaVersion:1,sources:[],evidence:[],claims:[],concepts:[],mappings:[],coverage:[]}));
    await writeFile(join(root,'content/docs/book/meta.json'),'{}');
    assert((await validateRepository(root)).some(error=>/requires its current edition/.test(error)));
  } finally { await rm(root,{recursive:true,force:true}); }
});


const reviewed = await json('functional-reference-prose-accepted');
const actualSources = new Map(await Promise.all(accepted.sources.map(async source => [source.route, await readFile(new URL(`../${source.path}`,import.meta.url),'utf8')])));
const reviewedCatalog = { claims: reviewed.claims };
function reviewedHtml(print, fine = false, records = reviewedCatalog) {
  const unitRoute = fine ? supplement : route, prefix = print ? printUnitAnchor(unitRoute) : chapterAnchorPrefix(unitRoute);
  const sections = fine ? [
    { id: accepted.sourceHeadings[4].id, title: accepted.sourceHeadings[4].title, claimIds: fineIds.slice(0,3) },
    { id: accepted.sourceHeadings[5].id, title: accepted.sourceHeadings[5].title, claimIds: fineIds.slice(3,5) },
    { id: accepted.sourceHeadings[6].id, title: accepted.sourceHeadings[6].title, claimIds: [fineIds[5]] },
    { id: accepted.sourceHeadings[7].id, title: accepted.sourceHeadings[7].title, claimIds: [fineIds[6]] },
  ] : accepted.sections;
  const nav = reviewed.navigation.find(nav => nav.route === unitRoute);
  const navParagraph = `<p>${escape(nav.text).replace(escape(nav.linkText),`<a href="${nav.href}">${escape(nav.linkText)}</a>`)}</p>`;
  const paragraphs = ids => ids.map(id => {
    const text = records.claims.find(claim => claim.id === id).text, { body, tail } = splitReferenceTail(text);
    const paragraph = `<p>${escape(body)}<span>${escape(tail)}<a role="doc-noteref" data-reader-reference="${id}" href="#${prefix}-claim-${id}">注</a></span></p>`;
    return paragraph + (id === 'cl-book-maintenance-condition' ? navParagraph : '');
  }).join('');
  return `<article data-reader-route="${unitRoute}" data-reader-title="${fine ? '功能单位与参考流' : accepted.title}"><h${print ? 2 : 1}>${fine ? '功能单位与参考流' : accepted.title}</h${print ? 2 : 1}>${sections.map(section => `<h${print ? 3 : 2} id="${print ? `${prefix}-` : ''}${section.id}">${section.title}</h${print ? 3 : 2}>${paragraphs(section.claimIds)}`).join('')}<a href="/sources/#src-ilcd-process">字段说明</a><a href="/concepts/#cn-fu">功能单位</a><a href="/concepts/#cn-reference-flow">参考流</a></article>`;
}

test('the actually reviewed v3 receipt binds both MDX sources and canonical meaning against coherent edits', () => {
  assertFunctionalReferenceProseAccepted(reviewed);
  assert.deepEqual(validateFunctionalReferenceCoverage(edition,actualSources,accepted,reviewedCatalog,reviewed), []);
  const crlf = new Map([...actualSources].map(([route,raw]) => [route,raw.replaceAll('\n','\r\n')]));
  assert.deepEqual(validateFunctionalReferenceCoverage(edition,crlf,accepted,reviewedCatalog,reviewed), []);
  for (const id of [accepted.sources[0].claimIds[0], 'cl-book-maintenance-condition', 'cl-book-record-model-limit']) {
    const changed = structuredClone(reviewedCatalog); changed.claims.find(claim => claim.id === id).text = '删去了原有的条件和解释。';
    assert(validateFunctionalReferenceCoverage(edition,actualSources,accepted,changed,reviewed).some(error => /independently reviewed draft/.test(error)));
    assert(validateRenderedFunctionalReference(htmlParser.parse(reviewedHtml(false,false,changed)),route,accepted,changed,reviewed).some(error => /independently reviewed B06 draft/.test(error)));
  }
  const removed = { claims: reviewedCatalog.claims.filter(claim => claim.id !== 'cl-book-record-model-limit') };
  assert(validateFunctionalReferenceCoverage(edition,actualSources,accepted,removed,reviewed).some(error => /independently reviewed/.test(error)));
  const coDeletedSources = new Map([...actualSources].map(([route,raw]) => [route,raw.replaceAll('cl-book-record-model-limit','').replace(/<Prose ids="\s*" \/>/g,'')]));
  assert(validateFunctionalReferenceCoverage(edition,coDeletedSources,accepted,removed,reviewed).some(error => /propositions|independently reviewed/.test(error)));
  const coDeletedReceipt = structuredClone(reviewed); coDeletedReceipt.claims = coDeletedReceipt.claims.filter(claim => claim.id !== 'cl-book-record-model-limit');
  assert.throws(() => validateFunctionalReferenceCoverage(edition,coDeletedSources,accepted,removed,coDeletedReceipt), /independently reviewed/);
  for (const mutate of [copy => copy.claims.pop(), copy => copy.claims[0].text = '不同结论。', copy => copy.sources[0].mdxSha256 = '0'.repeat(64), copy => copy.navigation[0].text = '只留下链接。']) {
    const copy = structuredClone(reviewed); mutate(copy); assert.throws(() => assertFunctionalReferenceProseAccepted(copy), /reviewed/);
  }
  const changedSources = new Map(actualSources);
  changedSources.set(route,actualSources.get(route).replace('该案例另设100 m²、十年的墙面服务，将面积、性能、寿命和维护计划连接到过程需求与指标；它与这里10 m²的简例各有自己的假设。',''));
  assert(validateFunctionalReferenceCoverage(edition,changedSources,accepted,reviewedCatalog,reviewed).some(error => /independently reviewed MDX/.test(error)));
  const coherentReceipt = structuredClone(reviewed);
  coherentReceipt.sources[0].mdxSha256 = createHash('sha256').update(changedSources.get(route)).digest('hex');
  assert.throws(() => validateFunctionalReferenceCoverage(edition,changedSources,accepted,reviewedCatalog,coherentReceipt), /independently reviewed v3/);
  assert.throws(() => validateFunctionalReferenceCoverage(edition,actualSources,accepted,reviewedCatalog,null), /requires its independently reviewed/);
});

test('actual reviewed navigation rejects lost meaning or wrong placement even with its original href retained', () => {
  for (const [print,fine,path] of [[false,false,route],[true,false,'/print'],[false,true,supplement]]) {
    const html = reviewedHtml(print,fine), check = text => validateRenderedFunctionalReference(htmlParser.parse(text),path,accepted,reviewedCatalog,reviewed);
    assert.deepEqual(check(html), []);
    const nav = reviewed.navigation.find(nav => nav.route === (fine ? supplement : route));
    const paragraph = `<p>${escape(nav.text).replace(escape(nav.linkText),`<a href="${nav.href}">${escape(nav.linkText)}</a>`)}</p>`;
    for (const changed of [html.replace(paragraph,''), html.replace(paragraph,paragraph+paragraph), html.replace(paragraph,'')+paragraph, html.replace(paragraph,`<p>只看<a href="${nav.href}">${escape(nav.linkText)}</a>。</p>`)]) assert(check(changed).some(error => /navigation/.test(error)));
    if (!fine) assert(check(html.replace('100 m²','10 m²')).some(error => /navigation/.test(error)));
  }
});
