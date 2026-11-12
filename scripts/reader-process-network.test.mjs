import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { assertProcessNetworkAccepted, assertProcessNetworkHeadingHistory, assertProcessNetworkProseAccepted, processNetworkRoute as route, processNetworkHeadingEntries, remapProcessNetworkCitations, validateProcessNetworkCoverage, validateRenderedProcessNetwork } from './reader-process-network.mjs';
import { currentEditionKeys, publishedHeadingEntries, remapBookCitations } from './reader-edition.mjs';
import { cleanerProductionHeadingEntries, remapCleanerProductionCitations } from './reader-cleaner-production.mjs';
import { functionalReferenceHeadingEntries, remapFunctionalReferenceCitations } from './reader-functional-reference.mjs';
import { createLegacyCitationEntries, createCanonicalCitationEntries, citationHref } from './reader-citations.mjs';
import { chapterAnchorPrefix, printUnitAnchor, splitReferenceTail, createChapterNotePlan } from './reader-book.mjs';
import { readCitationSurface, validateHistoricalScope, validateReaderOutput } from './reader-surface.mjs';
const json = async name => JSON.parse(await readFile(new URL(`../config/${name}.json`, import.meta.url), 'utf8'));
const [accepted, captured, edition, baseline, placements, history, framework, frameworkHeadings, cleaner, cleanerHeadings, functional, functionalHeadings] = await Promise.all(['process-network-accepted','process-network-heading-history','book-edition','citation-baseline','citation-placements','citation-history','framework-accepted','framework-heading-history','cleaner-production-accepted','cleaner-production-heading-history','functional-reference-accepted','functional-reference-heading-history'].map(json));
const ids = accepted.sections.flatMap(section => section.claimIds), old = accepted.source.claimIds;
const raw = `---\ntitle: 过程网络\n---\n${accepted.sections.map(section => `## ${section.id}\n<Prose ids="${section.claimIds.join(' ')}" />`).join('\n')}`;
const sources = text => new Map([[route, text ?? raw]]);
const available = edition.units.flatMap(unit => [unit.source, ...unit.coverage ?? []]);
function historical() {
  const all = [...createLegacyCitationEntries(baseline, placements, history.pages), ...createCanonicalCitationEntries(history, placements, [...baseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route),...placements.frontMatter,...placements.printAdditions.map(unit=>unit.route)]), ...publishedHeadingEntries(frameworkHeadings), ...cleanerProductionHeadingEntries(cleanerHeadings), ...functionalReferenceHeadingEntries(functionalHeadings), ...processNetworkHeadingEntries(captured)];
  return remapFunctionalReferenceCitations(remapCleanerProductionCitations(remapBookCitations(all,edition,framework,placements),cleaner,cleanerHeadings),functional,functionalHeadings);
}

test('B07 independently pins original-eight/two-addition map and four actual captured printed names', () => {
  assertProcessNetworkAccepted(accepted); assertProcessNetworkHeadingHistory(captured);
  assert.equal(accepted.sourceCommit,'79af66d9fb6788e2b9e4e3478f3410e4c190d0b7');
  assert.deepEqual(accepted.source.legacyNumericBaseline,{sourceCommit:'dd715663c3438aa730eef0da1696dc376a7715f1',printOrdinal:17});
  assert.equal(old.length,8); assert.deepEqual(accepted.sections.map(section=>section.claimIds.length),[3,3,4]);
  assert.deepEqual(ids.filter(id=>!old.includes(id)), accepted.additions);
  assert.equal(captured.files['docs/book/inventory-calculation/index.html'].sha256,'f498647a2b79893ca2f5cbf4f4f94b009ef181eb198c952e6dd48338f0643a3c');
  assert.equal(captured.files['print/index.html'].sha256,'b416b89f058b020c1a106018654f913442a8fc5ddfa1ed2f8573dfef71ec8ad9');
  assert.equal(captured.canonicalPrintedHeadings.length,4);
  for (const mutate of [copy=>copy.source.claimIds.pop(),copy=>copy.sections[0].claimIds.reverse(),copy=>copy.sourceHeadings[2].target='需求平衡',copy=>copy.additions.pop()]) { const copy=structuredClone(accepted);mutate(copy);assert.throws(()=>assertProcessNetworkAccepted(copy),/inventory differs/); }
  for (const mutate of [copy=>copy.canonicalPrintedHeadings.pop(),copy=>copy.files['print/index.html'].sha256='0'.repeat(64),copy=>copy.sourceCommit='0'.repeat(40)]) {const copy=structuredClone(captured);mutate(copy);assert.throws(()=>assertProcessNetworkHeadingHistory(copy),/four-heading history/);}
  assert.throws(()=>assertProcessNetworkProseAccepted(null),/independently reviewed/);
});

test('B07 registration preserves its place in the current39 source roster and rejects source/scope/section changes', () => {
  assert.equal(currentEditionKeys(edition,available,baseline,placements).length,40);
  for (const mutate of [copy=>copy.units=copy.units.filter(unit=>unit.key!==route),copy=>copy.units.find(unit=>unit.key===route).source='/monograph/empty-b07',copy=>copy.units.find(unit=>unit.key===route).coverage=['/docs/history'],copy=>copy.units.find(unit=>unit.key===route).sections.reverse(),copy=>copy.units.find(unit=>unit.key===route).part='问题的来路',copy=>copy.units.find(unit=>unit.key===route).kind='topic']) {const copy=structuredClone(edition);mutate(copy);assert.throws(()=>currentEditionKeys(copy,available,baseline,placements),/B07/);}
  assert.throws(()=>currentEditionKeys(edition,available.filter(source=>source!==route),baseline,placements),/Missing book source/);
  const reordered=structuredClone(edition), index=reordered.units.findIndex(unit=>unit.key===route); [reordered.units[index],reordered.units[index+1]]=[reordered.units[index+1],reordered.units[index]];assert.throws(()=>currentEditionKeys(reordered,available,baseline,placements),/explicit current seven-part numbered order/);
});

test('B07 actual source binds exact ten ordered occurrences across three formal sections', () => {
  assert.deepEqual(validateProcessNetworkCoverage(edition,sources(),accepted),[]);
  for(const id of ids) for(const changed of [raw.replace(id,''),raw.replace(id,`${id} ${id}`),raw.replace(id,'cl-other')]) assert(validateProcessNetworkCoverage(edition,sources(changed),accepted).some(error=>/propositions/.test(error)));
  for(const changed of [raw.replace('title: 过程网络','title: 新标题'),raw.replace('## 数量坐标','## 错误标题'),raw.replace('## 数量坐标','<Prose ids="cl-extra" />\n## 数量坐标')]) assert(validateProcessNetworkCoverage(edition,sources(changed),accepted).length);
  assert.deepEqual(createChapterNotePlan(raw,printUnitAnchor(route)).notes.map(note=>note.number),[1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(old.map(id=>ids.indexOf(id)+1),[2,3,4,6,7,8,9,10]);
});

test('all4076 historical addresses retain exact original meanings and original8-note subset scope', () => {
  const before=historical(), after=remapProcessNetworkCitations(before,accepted,captured);
  assert.equal(after.length,4076);assert.equal(new Set(after.map(entry=>`${entry.path}#${entry.id}`)).size,4076);
  const relevant=before.filter(entry=>entry.route===route);assert.equal(relevant.length,50);
  for(const original of before.filter(entry=>entry.route!==route))assert.deepEqual(after.find(entry=>entry.path===original.path&&entry.id===original.id),original);
  for(const path of [route,'/print']) {
    const prefix=path==='/print'?printUnitAnchor(route):chapterAnchorPrefix(route);
    const group=after.find(entry=>entry.path===path&&entry.id===`${prefix}-annotations`);
    assert.equal(group.mode,'retained');assert.equal(group.targets[0].id,group.id);assert.deepEqual(group.scope.targets.map(target=>target.claimId),old);
    assert(group.scope.text.includes(accepted.source.title)); assert(group.scope.text.includes('其他注释'));
    for(const id of old){const note=after.find(entry=>entry.path===path&&entry.id===`${prefix}-claim-${id}`);assert.equal(note.targets[0].claimId,id);}
  }
  const unit=after.find(entry=>entry.path==='/print'&&entry.id===printUnitAnchor(route));assert.equal(unit.mode,'retained');assert.deepEqual(unit.scope.targets.filter(target=>target.kind==='note').map(target=>target.claimId),old);
  for(const heading of captured.canonicalPrintedHeadings){const entry=after.find(entry=>entry.path==='/print'&&entry.id===heading.id);assert.equal(entry.mode,'alias');assert.equal(entry.edition.sourceCommit,captured.sourceCommit);}
  for(const wanted of relevant)assert.throws(()=>remapProcessNetworkCitations(before.filter(entry=>entry!==wanted),accepted,captured),/Missing or repeated/);
  for(const mutate of [entry=>entry.targets[0].claimId='cl-other',entry=>entry.targets[0].kind='heading',entry=>entry.targets[0].id='unrelated']){const copy=structuredClone(before);mutate(copy.find(entry=>entry.route===route&&entry.targets[0].kind==='note'));assert.throws(()=>remapProcessNetworkCitations(copy,accepted,captured),/Changed historical B07/);}
  const wrongScope=structuredClone(before);wrongScope.find(entry=>entry.path==='/print'&&entry.id===printUnitAnchor(route)).targets[0].kind='note-group';assert.throws(()=>remapProcessNetworkCitations(wrongScope,accepted,captured),/Changed historical B07/);
});

const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const catalog = {claims:ids.map(id=>({id,status:'reviewed',text:`保留 ${id} 的前提、单位和限制。`}))};
function paragraph(id,print,records=catalog){const prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),text=records.claims.find(claim=>claim.id===id).text,{body,tail}=splitReferenceTail(text);return `<p>${escape(body)}<span>${escape(tail)}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${prefix}-claim-${id}">注</a></sup></span></p>`;}
function rendered(print,records=catalog){const prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route);return `<article${print?` id="${prefix}"`:''} data-reader-route="${route}" data-reader-title="过程网络"><h${print?2:1}>过程网络</h${print?2:1}>${accepted.sections.map(section=>`<h${print?3:2} id="${print?`${prefix}-`:''}${section.id}">${section.title}</h${print?3:2}>${section.claimIds.map(id=>paragraph(id,print,records)).join('')}`).join('')}<section class="chapter-notes"><h${print?3:2} id="${prefix}-annotations">注释</h${print?3:2}><ol>${ids.map(id=>`<li id="${prefix}-claim-${id}" data-reader-claim="${id}">注释</li>`).join('')}</ol></section></article>`;}

test('B07 rendered validation checks full paragraphs, title, section meaning, endnote list and actual unit count', () => {
  for(const print of [false,true]){const path=print?'/print':route,html=rendered(print),p=paragraph(ids[0],print);const check=text=>validateRenderedProcessNetwork(htmlParser.parse(text),path,accepted,catalog);assert.deepEqual(check(html),[]);
    for(const changed of [html.replace(p,''),html.replace(p,p+p),html.replace('的前提、单位和限制','的结论'),html.replace('>需求平衡<','>错误标题<'),html.replace('data-reader-title="过程网络"','data-reader-title="旧题"').replace('>过程网络<','>旧题<'),html.replace('data-reader-claim="'+ids[0]+'"','data-reader-claim="cl-other"'),html.replace('<section class="chapter-notes">','<section class="chapter-notes"></section><section class="chapter-notes">'),html+html])assert(check(changed).length);
  }
});

test('native B07 group/unit scopes reject missing, broadened, displaced, duplicate and false-edition context', () => {
  const entries=remapProcessNetworkCitations(historical(),accepted,captured);
  for(const entry of entries.filter(entry=>entry.route===route&&entry.mode==='retained'&&entry.scope)){
    const isUnit=entry.targets[0].kind==='chapter';
    const edition=`<time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time><a href="https://github.com/tiangong-lca/knowledge-base/tree/${entry.edition.sourceCommit}">原版</a>`;
    const links=entry.scope.targets.map(target=>`<a data-legacy-scope-destination href="${citationHref(target,entry.path)}">位置</a>`).join('');
    const context=`<div data-legacy-scope="${entry.id}">${edition}<p>${entry.scope.text}</p>${links}</div>`;
    const html=isUnit?`<article id="${entry.id}" data-reader-route="${route}">${context}</article>`:`<article data-reader-route="${route}"><section class="chapter-notes"><h${entry.path==='/print'?3:2} id="${entry.id}">注释</h${entry.path==='/print'?3:2}>${context}</section></article>`;
    const check=text=>validateHistoricalScope(readCitationSurface(htmlParser.parse(text),entry.path).ids.get(entry.id),entry);assert.deepEqual(check(html),[]);
    for(const changed of [html.replace(context,''),html.replace(context,context+context),html.replace(context,'')+context,html.replace(links,links+'<a data-legacy-scope-destination href="#extra">其他</a>'),html.replace(entry.scope.text,'原有注释'),html.replace(entry.edition.sourceCommit,'0'.repeat(40))])assert(check(changed).length);
  }
});

test('co-deleting B07 acceptance, actual capture or final prose receipt cannot bypass export admission', async () => {
  const root=await mkdtemp(join(tmpdir(),'reader-b07-admission-'));
  try{const out=join(root,'out'),config=join(root,'config');await mkdir(out);await mkdir(config);
    for(const name of ['book-edition','framework-accepted','framework-heading-history','citation-baseline','citation-placements','citation-history','cleaner-production-accepted','cleaner-production-heading-history','functional-reference-accepted','functional-reference-heading-history','functional-reference-prose-accepted'])await writeFile(join(config,`${name}.json`),JSON.stringify(await json(name)));
    const files=['process-network-accepted','process-network-heading-history','process-network-prose-accepted'];
    for(const missing of [null,...files]){for(const name of files){const file=join(config,`${name}.json`);if(missing===null||missing===name)await rm(file,{force:true});else await writeFile(file,JSON.stringify(name==='process-network-accepted'?accepted:name==='process-network-heading-history'?captured:reviewed));}await assert.rejects(validateReaderOutput(out),/requires its accepted proposition and published heading inventories/);}
  }finally{await rm(root,{recursive:true,force:true});}
});

const reviewed = await json('process-network-prose-accepted');
const actualRaw = await readFile(new URL('../content/docs/book/inventory-calculation.mdx',import.meta.url),'utf8');
const actualCatalog = JSON.parse(await readFile(new URL('../knowledge/catalog.json',import.meta.url),'utf8'));

test('actual accepted v2 pins full canonical meaning and source against coordinated catalog/HTML/receipt changes', () => {
  assertProcessNetworkProseAccepted(reviewed);
  assert.equal(reviewed.readerDraftSha256,'eaa31c91f5e72236b083f2680bc5d5d418d44d1f42d64a8ddc39c06d92ec6416');
  assert.equal(reviewed.sources[0].mdxSha256,'8d46bb3572f9fca9d01619c428ef3e92764e84804f5db17cd5c5288338f342ac');
  assert.deepEqual(validateProcessNetworkCoverage(edition,sources(actualRaw),accepted,actualCatalog,reviewed),[]);
  assert.deepEqual(validateProcessNetworkCoverage(edition,sources(actualRaw.replaceAll('\n','\r\n')),accepted,actualCatalog,reviewed),[]);
  for(const print of [false,true])assert.deepEqual(validateRenderedProcessNetwork(htmlParser.parse(rendered(print,actualCatalog)),print?'/print':route,accepted,actualCatalog,reviewed),[]);
  for(const id of ids){
    for(const mutate of [claim=>claim.text+='模型已经实证验证。',claim=>claim.scope='普遍适用且没有条件',claim=>claim.caveats=['全部条件均可忽略。'],claim=>claim.evidenceIds=['ev-other'],claim=>claim.premiseIds=['cl-other']]){
      const changed=structuredClone(actualCatalog),record=changed.claims.find(claim=>claim.id===id);mutate(record);
      assert(validateProcessNetworkCoverage(edition,sources(actualRaw),accepted,changed,reviewed).some(error=>/canonical proposition differs/.test(error)));
      // A matching rendered body and catalog must still be rejected by accepted meaning.
      for(const print of [false,true])assert(validateRenderedProcessNetwork(htmlParser.parse(rendered(print,changed)),print?'/print':route,accepted,changed,reviewed).some(error=>/independently reviewed/.test(error)));
      const forged=structuredClone(reviewed);forged.claims[ids.indexOf(id)]=record;
      assert.throws(()=>assertProcessNetworkProseAccepted(forged),/independently reviewed final v2/);
    }
  }
  assert.throws(()=>validateProcessNetworkCoverage(edition,sources(actualRaw),accepted,actualCatalog,null),/independently reviewed/);
});

test('coordinated current-source and receipt edits cannot impersonate the final accepted manuscript', () => {
  for(const changed of [actualRaw+'\n新的未审文字。\n',actualRaw.replace('cl-inv-service-to-demand cl-inv-computation-start','cl-inv-computation-start cl-inv-service-to-demand'),actualRaw.replace('## 反馈边界','## 其他边界')]){
    assert(validateProcessNetworkCoverage(edition,sources(changed),accepted,actualCatalog,reviewed).length);
    const forged=structuredClone(reviewed);forged.sources[0].mdxSha256='0'.repeat(64);assert.throws(()=>validateProcessNetworkCoverage(edition,sources(changed),accepted,actualCatalog,forged),/independently reviewed final v2/);
  }
  for(const mutate of [copy=>copy.claims.pop(),copy=>copy.sources.pop(),copy=>copy.readerDraftSha256='0'.repeat(64),copy=>copy.reviewScope='A different review']){const changed=structuredClone(reviewed);mutate(changed);assert.throws(()=>assertProcessNetworkProseAccepted(changed),/independently reviewed/);}
});
