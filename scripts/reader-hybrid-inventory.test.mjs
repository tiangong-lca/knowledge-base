import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdtemp, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { publicCatalog, getClaimEvidence } from './knowledge.mjs';
import { publicResearch } from './research.mjs';
import { assertHybridInventoryAccepted, assertHybridInventoryHeadingHistory, assertHybridInventoryRegistration, assertHybridInventoryProseAccepted, hybridInventoryRoute as route, hybridInventoryHeadingEntries, remapHybridInventoryCitations, validateHybridInventoryCoverage, validateRenderedHybridInventory } from './reader-hybrid-inventory.mjs';
import { createLegacyCitationEntries, createCanonicalCitationEntries, citationHref } from './reader-citations.mjs';
import { currentEditionKeys, publishedHeadingEntries, remapBookCitations } from './reader-edition.mjs';
import { cleanerProductionHeadingEntries, remapCleanerProductionCitations } from './reader-cleaner-production.mjs';
import { functionalReferenceHeadingEntries, remapFunctionalReferenceCitations } from './reader-functional-reference.mjs';
import { processNetworkHeadingEntries, remapProcessNetworkCitations } from './reader-process-network.mjs';
import { exchangeSemanticsHeadingEntries, remapExchangeSemanticsCitations, validateExchangeAnnotationOutput } from './reader-exchange-semantics.mjs';
import { chapterAnchorPrefix, printUnitAnchor, splitReferenceTail, createChapterNotePlan, createChapterReferenceIndex, createChapterAnnotationPlan } from './reader-book.mjs';
import { readCitationSurface, validateHistoricalScope, validateReaderOutput } from './reader-surface.mjs';
const json = async name => JSON.parse(await readFile(new URL(`../config/${name}.json`, import.meta.url), 'utf8'));
const [accepted,captured,currentEdition,baseline,placements,history,framework,frameworkHeadings,cleaner,cleanerHeadings,functional,functionalHeadings,processAccepted,processHeadings] = await Promise.all(['hybrid-inventory-accepted','hybrid-inventory-heading-history','book-edition','citation-baseline','citation-placements','citation-history','framework-accepted','framework-heading-history','cleaner-production-accepted','cleaner-production-heading-history','functional-reference-accepted','functional-reference-heading-history','process-network-accepted','process-network-heading-history'].map(json));
const ids = accepted.sections.flatMap(section => section.claimIds), old = accepted.source.claimIds;
// This is a structural fixture, not an accepted manuscript or a public receipt.
const raw = `---\ntitle: 混合清单\n---\n${accepted.sections.map(section=>`## ${section.id}\n<Prose ids="${section.claimIds.join(' ')}" />`).join('\n')}`;
const edition = structuredClone(currentEdition), fixtureUnit = edition.units.find(unit=>unit.key===route);
fixtureUnit.part='可比世界';fixtureUnit.sections=accepted.sections.map(({id,title})=>({id,title}));
const sources = text => new Map([[route,text??raw]]), digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rawCatalog = JSON.parse(await readFile(new URL('../knowledge/catalog.json',import.meta.url),'utf8'));
const catalog = publicCatalog(rawCatalog);
// A caller-supplied fixture digest tests the acceptance API only. It is never
// exported as a B09 acceptance; actual integration must pin its reviewed draft.
const fixtureProse = { status:'reviewed', claims:ids.map(id=>rawCatalog.claims.find(claim=>claim.id===id)), sources:[{route,mdxSha256:createHash('sha256').update(raw).digest('hex')}] };
const fixtureDigest=digest(fixtureProse);
function historical(){
  const all=[...createLegacyCitationEntries(baseline,placements,history.pages),...createCanonicalCitationEntries(history,placements,[...baseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route),...placements.frontMatter,...placements.printAdditions.map(unit=>unit.route)]),...publishedHeadingEntries(frameworkHeadings),...cleanerProductionHeadingEntries(cleanerHeadings),...functionalReferenceHeadingEntries(functionalHeadings),...processNetworkHeadingEntries(processHeadings),...exchangeSemanticsHeadingEntries(),...hybridInventoryHeadingEntries(captured)];
  return remapExchangeSemanticsCitations(remapProcessNetworkCitations(remapFunctionalReferenceCitations(remapCleanerProductionCitations(remapBookCitations(all,edition,framework,placements),cleaner,cleanerHeadings),functional,functionalHeadings),processAccepted,processHeadings));
}

test('B09 conservation independently fixes38 original IDs,172 exact original addresses and7 observed heading identities',()=>{
  assertHybridInventoryAccepted(accepted);assertHybridInventoryHeadingHistory(captured);
  assert.equal(old.length,38);assert.equal(new Set(old).size,38);assert.equal(ids.length,39);assert.deepEqual(ids.filter(id=>old.includes(id)),old);assert.deepEqual(ids.filter(id=>!old.includes(id)),accepted.additions);assert.deepEqual(accepted.additions,['cl-hyb-downstream-zero']);assert.equal(ids[ids.indexOf('cl-hyb-downstream-test')+1],'cl-hyb-downstream-zero');
  assert.deepEqual(accepted.sections.map(section=>section.claimIds.length),[8,21,10]);
  assert.equal(accepted.originalHistoricalEntries.length,172);assert.equal(captured.canonicalPrintedHeadings.length,7);
  assert.equal(captured.sourceCommit,'0aed5f6cbb337c268d257a4821a6d236418c5f30');
  assert.equal(captured.files['print/index.html'].sha256,'587ea1ec9b931a96c3d5a92f6492794c3ce3664b64dce24c8e6e16c56f8544f5');
  assert.deepEqual(accepted.sourceHeadings.map(heading=>heading.target),['过程经济边界','过程经济边界','双向账户','双向账户','双向账户','误差来源','误差来源']);
  for(const change of [value=>value.source.claimIds.pop(),value=>value.originalHistoricalEntries.pop(),value=>value.sourceHeadings[2].target='误差来源']){const value=structuredClone(accepted);change(value);assert.throws(()=>assertHybridInventoryAccepted(value),/inventory differs/);}
  for(const change of [value=>value.canonicalPrintedHeadings.pop(),value=>value.manifestSha256='0'.repeat(64)]){const value=structuredClone(captured);change(value);assert.throws(()=>assertHybridInventoryHeadingHistory(value),/seven-heading history/);}
});

test('the one explicit interpretation has its new S1 evidence and does not enter the original38-note scope',()=>{
  const claim=rawCatalog.claims.find(claim=>claim.id==='cl-hyb-downstream-zero');assert.equal(claim.kind,'interpretation');assert.deepEqual(claim.evidenceIds,['ev-hyb-agez-downstream-omission']);assert.equal(claim.reviewKind,'agent-source-check');
  const evidence=rawCatalog.evidence.find(evidence=>evidence.id===claim.evidenceIds[0]);assert.equal(evidence.sourceId,'src-hyb-agez-2019-2020');assert.equal(evidence.passageId,'psg-b09-hyb-agez-s1-scope');
  const plan=createChapterNotePlan(raw,chapterAnchorPrefix(route));assert.equal(plan.notes.length,39);assert.equal(plan.byClaimId.get(claim.id).number,16);assert.equal(old.length,38);assert(!old.includes(claim.id));
  assert(validateHybridInventoryCoverage(edition,sources(raw.replace(claim.id,'')),accepted).some(error=>/propositions/.test(error)));
});

test('B09 registration and actual source reject omitted, repeated, replaced, reordered and misplaced responsibilities',()=>{
  assertHybridInventoryRegistration(edition);assert.deepEqual(validateHybridInventoryCoverage(edition,sources(),accepted),[]);
  for(const change of [value=>value.units=value.units.filter(unit=>unit.key!==route),value=>value.units.find(unit=>unit.key===route).sections.reverse(),value=>value.units.find(unit=>unit.key===route).coverage=['/docs/history'],value=>value.units.find(unit=>unit.key===route).source='/monograph/wrong']){const value=structuredClone(edition);change(value);assert.throws(()=>assertHybridInventoryRegistration(value),/B09/);}
  for(const id of ids)for(const changed of [raw.replace(id,''),raw.replace(id,`${id} ${id}`),raw.replace(id,'cl-other')])assert(validateHybridInventoryCoverage(edition,sources(changed),accepted).some(error=>/propositions/.test(error)));
  for(const changed of [raw.replace('## 双向账户','## 别的标题'),raw.replace('title: 混合清单','title: 旧章'),raw.replace('## 过程经济边界','<Prose ids="cl-extra" />\n## 过程经济边界')])assert(validateHybridInventoryCoverage(edition,sources(changed),accepted).length);
  assert(validateHybridInventoryCoverage(edition,new Map(),accepted).some(error=>/Missing/.test(error)));
});

test('all4102 addresses keep original meaning;179 C19 addresses preserve all38 original annotations and original editions',()=>{
  const before=historical(),after=remapHybridInventoryCitations(before,accepted,captured);
  assert.equal(after.length,4102);assert.equal(new Set(after.map(entry=>`${entry.path}#${entry.id}`)).size,4102);
  const affected=before.filter(entry=>entry.route===route);assert.equal(affected.length,179);
  for(const entry of before.filter(entry=>entry.route!==route))assert.deepEqual(after.find(other=>other.path===entry.path&&other.id===entry.id),entry);
  for(const original of affected){const entry=after.find(other=>other.path===original.path&&other.id===original.id);assert.deepEqual(entry.edition,original.edition);if(original.targets[0].kind==='note')assert.deepEqual(entry,original);}
  for(const path of [route,'/print']){
    const prefix=path==='/print'?printUnitAnchor(route):chapterAnchorPrefix(route),group=after.find(entry=>entry.path===path&&entry.id===`${prefix}-annotations`);
    assert.equal(group.mode,'retained');assert.equal(group.targets[0].id,group.id);assert.deepEqual(group.scope.targets.map(target=>target.claimId),old);assert(group.scope.text.includes(accepted.source.title));assert(group.scope.text.includes('新增论述与注释'));assert(!group.scope.targets.some(target=>target.claimId==='cl-hyb-downstream-zero'));
  }
  for(const entry of affected){assert.throws(()=>remapHybridInventoryCitations(before.filter(other=>other!==entry),accepted,captured),/missing, repeated or changed/);}
  for(const change of [entry=>entry.targets[0].claimId='cl-other',entry=>entry.edition.sourceDate='1900-01-01',entry=>entry.targets[0].kind='heading']){const copy=structuredClone(before);change(copy.find(entry=>entry.route===route&&entry.targets[0].kind==='note'));assert.throws(()=>remapHybridInventoryCitations(copy,accepted,captured),/missing, repeated or changed/);}
});

test('original38-note scopes cannot become empty, broadened, detached or false-edition stubs',()=>{
  const entries=remapHybridInventoryCitations(historical(),accepted,captured);
  for(const entry of entries.filter(entry=>entry.route===route&&entry.mode==='retained'&&entry.scope)){
    const isUnit=entry.targets[0].kind==='chapter',links=entry.scope.targets.map(target=>`<a data-legacy-scope-destination href="${citationHref(target,entry.path)}">位置</a>`).join('');
    const context=`<div data-legacy-scope="${entry.id}"><time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time><a href="https://github.com/tiangong-lca/knowledge-base/tree/${entry.edition.sourceCommit}">原版</a><p>${entry.scope.text}</p>${links}</div>`;
    const html=isUnit?`<article id="${entry.id}" data-reader-route="${route}">${context}</article>`:`<article data-reader-route="${route}"><section class="chapter-notes"><h${entry.path==='/print'?3:2} id="${entry.id}">注释</h${entry.path==='/print'?3:2}>${context}</section></article>`;
    const check=text=>validateHistoricalScope(readCitationSurface(htmlParser.parse(text),entry.path).ids.get(entry.id),entry);
    assert.deepEqual(check(html),[]);
    for(const changed of [html.replace(context,''),html.replace(context,context+context),html.replace(context,'')+context,html.replace(links,links+'<a data-legacy-scope-destination href="#extra">其他</a>'),html.replace(entry.edition.sourceCommit,'0'.repeat(40))])assert(check(changed).length);
  }
});

test('conservation cannot impersonate actual manuscript acceptance or authorize coordinated catalog/source changes',()=>{
  assert.throws(()=>assertHybridInventoryProseAccepted(null),/acceptance is incomplete/);
  assert.throws(()=>assertHybridInventoryProseAccepted(fixtureProse,null),/acceptance is incomplete/);
  assert.throws(()=>validateHybridInventoryCoverage(edition,sources(),accepted,rawCatalog,null),/acceptance is incomplete/);
  assert.deepEqual(validateHybridInventoryCoverage(edition,sources(),accepted,rawCatalog,fixtureProse,fixtureDigest),[]);
  for(const key of ['text','scope','caveats','premiseIds','evidenceIds']){
    const changed=structuredClone(rawCatalog),claim=changed.claims.find(claim=>claim.id===ids[0]);claim[key]=Array.isArray(claim[key])?['changed']:claim[key]+'changed';
    assert(validateHybridInventoryCoverage(edition,sources(),accepted,changed,fixtureProse,fixtureDigest).some(error=>/canonical proposition differs/.test(error)));
    const forged=structuredClone(fixtureProse);forged.claims[0]=claim;assert.throws(()=>assertHybridInventoryProseAccepted(forged,fixtureDigest),/separately pinned/);
  }
  assert(validateHybridInventoryCoverage(edition,sources(raw+'\nUnreviewed prose'),accepted,rawCatalog,fixtureProse,fixtureDigest).some(error=>/reviewed MDX/.test(error)));
});

const readingMap=JSON.parse(await readFile(new URL('../knowledge/research/literature-map.json',import.meta.url),'utf8')),readingLedger=JSON.parse(await readFile(new URL('../knowledge/research/readings.json',import.meta.url),'utf8'));
const require=createRequire(import.meta.url),mdxRequire=createRequire(require.resolve('fumadocs-mdx')),componentModule={exports:{}};
// Compile the actual annotation component in memory through the installed
// toolchain. A hand-copied note stub cannot make the positive test pass.
const compiled=mdxRequire('esbuild').transformSync(await readFile(new URL('../components/evidence.tsx',import.meta.url),'utf8'),{loader:'tsx',jsx:'automatic',format:'cjs',sourcefile:'evidence.tsx'});
new Function('require','module','exports',compiled.code)(name=>{
  if(name==='@/lib/catalog')return {__esModule:true,default:catalog,getClaimEvidence,isKnownClaim:id=>rawCatalog.claims.some(claim=>claim.id===id)};
  if(name==='@/knowledge/research/literature-map.json')return readingMap;
  if(name==='@/knowledge/research/readings.json')return readingLedger;
  if(name==='@/scripts/research.mjs')return {publicResearch};return require(name);
},componentModule,componentModule.exports);
const {ClaimAnnotation}=componentModule.exports;
process.env.__NEXT_TRAILING_SLASH='true';
const closeRoute='/docs/book/from-connected-results-to-conditional-judgment',closeId='cl-connect-coverage-and-overlap',externalRoute='/docs/book/fixture-premises';
const byId=new Map(catalog.claims.map(claim=>[claim.id,claim])),externalIds=[...new Set([...ids,closeId].flatMap(id=>byId.get(id).premiseIds).filter(id=>!ids.includes(id)))];
const pages=[{url:route,title:'混合清单',raw},{url:externalRoute,title:'测试外部前提',raw:`<Prose ids="${externalIds.join(' ')}" />`},{url:closeRoute,title:'可修订判断',raw:`<Prose ids="${closeId}" />`}];
const esc=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function annotations(key,claimIds,print){const prefix=print?printUnitAnchor(key):chapterAnchorPrefix(key),plan=createChapterNotePlan(`<Prose ids="${claimIds.join(' ')}" />`,prefix),options=createChapterAnnotationPlan(plan,catalog.claims,createChapterReferenceIndex(pages,{print}),{print});return claimIds.map(id=>`<li id="${prefix}-claim-${id}" data-reader-claim="${id}">${renderToStaticMarkup(createElement(ClaimAnnotation,{id,...options.get(id)}))}</li>`).join('');}
function paragraph(id,print){const prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),{body,tail}=splitReferenceTail(byId.get(id).text);return `<p>${esc(body)}<span>${esc(tail)}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${prefix}-claim-${id}">注</a></sup></span></p>`;}
function rendered(print){const prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),html=`<article data-reader-route="${route}" data-reader-title="混合清单"><h${print?2:1}>混合清单</h${print?2:1}>${accepted.sections.map(section=>`<h${print?3:2} id="${print?`${prefix}-`:''}${section.id}">${section.title}</h${print?3:2}>${section.claimIds.map(id=>paragraph(id,print)).join('')}`).join('')}<section class="chapter-notes"><h${print?3:2} id="${prefix}-annotations">注释</h${print?3:2}>${annotations(route,ids,print)}</section></article>`;return html+(print?`<article data-reader-route="${externalRoute}" data-reader-title="测试外部前提">${externalIds.map(id=>`<li id="${printUnitAnchor(externalRoute)}-claim-${id}" data-reader-claim="${id}">外部前提测试定位</li>`).join('')}</article>`:'');}

test('actual paragraphs and real scholarly annotations reject marker-preserving loss and wrong section/title/order',()=>{
  for(const print of [false,true]){
    const path=print?'/print':route,html=rendered(print),check=text=>validateRenderedHybridInventory(htmlParser.parse(text),path,accepted,catalog,fixtureProse,fixtureDigest);
    assert.deepEqual(check(html),[]);
    for(const changed of [html.replace(paragraph(ids[0],print),''),html.replace(paragraph(ids[0],print),paragraph(ids[0],print)+paragraph(ids[0],print)),html.replace('>双向账户<','>错误标题<'),html.replace('data-reader-title="混合清单"','data-reader-title="旧题"').replace('>混合清单<','>旧题<'),html.replace(esc(byId.get(ids[0]).text).slice(0,25),'失去真实论述'),html+html])assert(check(changed).length);
    const document=htmlParser.parse(html),unit=document.querySelector(`article[data-reader-route="${route}"]`);
    for(const note of unit.querySelectorAll('[data-reader-claim]')){
      const annotation=note.querySelector('.claim-annotation'),scope=annotation.childNodes.find(node=>node.tagName==='P'),limits=annotation.querySelector('.annotation-limits'),source=annotation.querySelector('.annotation-sources li'),premise=annotation.querySelector('details li a'),input=annotation.querySelectorAll('a').find(link=>link.getAttribute('href')?.startsWith('/downloads/cases/'));
      const changes=[note.outerHTML.replace(annotation.outerHTML,''),note.outerHTML.replace(scope.outerHTML,'')];
      for(const child of [limits,source,premise,input].filter(Boolean))changes.push(note.outerHTML.replace(child.outerHTML,''));
      for(const changedNote of changes){const changed=html.replace(note.outerHTML,changedNote);assert(changed.includes(`id="${note.id}"`));assert(check(changed).some(error=>/actual annotation/.test(error)));}
    }
  }
});

test('both actual closing-consumer premises retain current hybrid title/numbers and exact canonical destinations',()=>{
  for(const print of [false,true]){
    const closing=`<article data-reader-route="${closeRoute}" data-reader-title="可修订判断">${annotations(closeRoute,[closeId],print)}</article>`,html=rendered(print)+closing,document=htmlParser.parse(html),unit=document.querySelector(`article[data-reader-route="${closeRoute}"]`);
    assert.deepEqual(validateExchangeAnnotationOutput(document,unit,closeRoute,catalog,{print}),[]);
    for(const [id,number]of [['cl-inv-double-counting',6],['cl-inv-hybrid-forms',5]]){
      const prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),href=print?`#${prefix}-claim-${id}`:`${route}/#${prefix}-claim-${id}`,link=unit.querySelectorAll('a').find(link=>link.getAttribute('href')===href);
      assert(link);assert.equal(link.text,`《混合清单》注 ${number}`);
      const bad=html.replace(link.outerHTML,link.outerHTML.replace(`《混合清单》注 ${number}`,'《旧题》注 99'));
      // In web output the generic global citation validator owns cross-route
      // labels; here exact labels are asserted directly. Print derives them from
      // the actual complete note plan and rejects the wrong display itself.
      if(print)assert(validateExchangeAnnotationOutput(htmlParser.parse(bad),htmlParser.parse(bad).querySelector(`article[data-reader-route="${closeRoute}"]`),closeRoute,catalog,{print}).length);
    }
  }
});


test('production roster admission rejects coordinated B09 source and registration deletion without changing its42-unit identity',()=>{
  const available=edition.units.flatMap(unit=>[unit.source,...unit.coverage??[]]);
  assert.equal(currentEditionKeys(edition,available,baseline,placements).length,42);
  const deleted=structuredClone(edition);deleted.units=deleted.units.filter(unit=>unit.key!==route);
  assert.throws(()=>currentEditionKeys(deleted,available.filter(source=>source!==route),baseline,placements),/B09/);
  assert.throws(()=>currentEditionKeys(edition,available.filter(source=>source!==route),baseline,placements),/Missing book source/);
});

test('production export admission requires each independent B09 inventory even with no B09 output or source',async()=>{
  const root=await mkdtemp(join(tmpdir(),'reader-b09-admission-'));
  try {
    const out=join(root,'out'),config=join(root,'config');await mkdir(out);await mkdir(config);
    const configRoot=new URL('../config/',import.meta.url);
    // Copy only actual existing reviewed/configuration files. The final B09
    // receipt is deliberately absent; no invented acceptance is manufactured.
    for(const name of await readdir(configRoot))if(name.endsWith('.json')&&name!=='hybrid-inventory-prose-accepted.json')await copyFile(new URL(name,configRoot),join(config,name));
    for(const missing of [null,'accepted','heading-history']) {
      for(const name of ['accepted','heading-history']) {
        const file=`hybrid-inventory-${name}.json`;
        if(missing===name)await rm(join(config,file),{force:true});
        else await copyFile(new URL(file,configRoot),join(config,file));
      }
      await assert.rejects(validateReaderOutput(out),error=>/independent B09/.test(error.message)&&error.message.includes('hybrid-inventory-prose-accepted.json')&&(!missing||error.message.includes(`hybrid-inventory-${missing}.json`)));
    }
    // Source and registration cannot be jointly removed to turn the retained
    // book export into a supposedly unrelated standalone fixture.
    const deleted=structuredClone(edition);deleted.units=deleted.units.filter(unit=>unit.key!==route);
    await writeFile(join(config,'book-edition.json'),JSON.stringify(deleted));
    await assert.rejects(validateReaderOutput(out),/independent B09/);
  } finally {await rm(root,{recursive:true,force:true});}
});

// Actual clean0aed captured shell fragments, not a fresh B09 render or acceptance.
const observedShell={"sourceCommit":"0aed5f6cbb337c268d257a4821a6d236418c5f30","webHtmlSha256":"515519e43c042e98f9c60f4d08b879e3c4cbd275011e695e852aaec20d3250c9","printHtmlSha256":"587ea1ec9b931a96c3d5a92f6492794c3ce3664b64dce24c8e6e16c56f8544f5","oldTitle":"边界之外：混合清单补上了什么","oldDescription":"从烤面包器的双向供需、三家供应者的年度账目和泵的用钢，追踪过程与经济账户的重叠、价格和聚合误差。","breadcrumb":"<div class=\"flex items-center gap-1.5 text-sm text-fd-muted-foreground\"><span class=\"truncate text-fd-primary font-medium\">生命周期评价的前世今生</span></div>","webTitle":"<h1 id=\"main-content\" tabindex=\"-1\" class=\"text-[1.75em] font-semibold\">边界之外：混合清单补上了什么</h1>","webDescription":"<p class=\"mb-8 text-lg text-fd-muted-foreground\">从烤面包器的双向供需、三家供应者的年度账目和泵的用钢，追踪过程与经济账户的重叠、价格和聚合误差。</p>","pagination":"<div class=\"@container grid gap-4 grid-cols-2 docs-pagination\"><a class=\"flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full\" href=\"/docs/book/exchange-semantics-and-conversion/\"><div class=\"inline-flex items-center gap-1.5 font-medium\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-chevron-left -mx-1 size-4 shrink-0 rtl:rotate-180\" aria-hidden=\"true\"><path d=\"m15 18-6-6 6-6\"></path></svg><p>交换语义</p></div><p class=\"text-fd-muted-foreground\">从对象与交换追踪计算活动、文件转换和表征状态，辨明模型保留了什么。</p></a><a class=\"flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full text-end\" href=\"/docs/book/midpoint-endpoint-value-choices/\"><div class=\"inline-flex items-center gap-1.5 font-medium flex-row-reverse\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-chevron-right -mx-1 size-4 shrink-0 rtl:rotate-180\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg><p>从排放到中点和终点：因果路径与价值选择</p></div><p class=\"text-fd-muted-foreground\">沿因果路径、保护对象、单位、情景与区域条件解释中点和终点指标。</p></a></div>","navigation":[{"href":"/docs/book/exchange-semantics-and-conversion/","title":"交换语义","description":"从对象与交换追踪计算活动、文件转换和表征状态，辨明模型保留了什么。"},{"href":"/docs/book/midpoint-endpoint-value-choices/","title":"从排放到中点和终点：因果路径与价值选择","description":"沿因果路径、保护对象、单位、情景与区域条件解释中点和终点指标。"}],"printTitle":"<h2>18　边界之外：混合清单补上了什么</h2>","printDescription":"<p>从烤面包器的双向供需、三家供应者的年度账目和泵的用钢，追踪过程与经济账户的重叠、价格和聚合误差。</p>","webNoteAlias":"<span id=\"chapter-2f646f63732f626f6f6b2f696e76656e746f72792d626f756e646172792d616e642d687962726964-note-1\" class=\"legacy-citation-target\" data-legacy-for=\"chapter-2f646f63732f626f6f6b2f696e76656e746f72792d626f756e646172792d616e642d687962726964-claim-cl-inv-boundary-carrier\" tabindex=\"-1\"><span class=\"legacy-citation-context\">此链接按 <time dateTime=\"2026-11-07\">2026-11-07</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href=\"https://github.com/tiangong-lca/knowledge-base/tree/dd715663c3438aa730eef0da1696dc376a7715f1\">查看这一版本的源文件</a></span></span>"};


test('unreviewed body and annotation additions fail for paragraphs, divs, lists and unwrapped text on both surfaces',()=>{
  const assertion='所有未记录的下游交换都已证实为零。';
  const additions=[assertion,`<p>${assertion}</p>`,`<div>${assertion}</div>`,`<ul><li>${assertion}</li></ul>`,`<span>${assertion}</span>`,`<section data-legacy-scope="unknown">${assertion}</section>`];
  for(const print of [false,true]){
    const path=print?'/print':route,html=rendered(print),document=htmlParser.parse(html),unit=document.querySelector(`article[data-reader-route="${route}"]`),heading=unit.querySelector(print?'h3':'h2'),note=unit.querySelector('[data-reader-claim]'),annotation=note.querySelector('.claim-annotation');
    const check=text=>validateRenderedHybridInventory(htmlParser.parse(text),path,accepted,catalog,fixtureProse,fixtureDigest);
    assert.deepEqual(check(html),[]);
    for(const added of additions){
      const body=html.replace(heading.outerHTML,heading.outerHTML+added);
      assert(check(body).some(error=>/unexpected unreviewed body text/.test(error)),`body insertion escaped: ${path} ${added}`);
      const inner=annotation.outerHTML.replace(/<\/div>$/,added+'</div>'),withAnnotation=html.replace(annotation.outerHTML,inner);
      assert(check(withAnnotation).some(error=>/annotation contains unexpected unreviewed text/.test(error)),`annotation insertion escaped: ${path} ${added}`);
      const after=html.replace(annotation.outerHTML,annotation.outerHTML+added);
      assert(check(after).some(error=>/unexpected unreviewed body text/.test(error)),`note-adjacent insertion escaped: ${path} ${added}`);
    }
    const disguised = html.replace(heading.outerHTML,heading.outerHTML+`<div class="claim-annotation">${assertion}</div>`);
    assert(check(disguised).some(error=>/unexpected unreviewed body text/.test(error)),`${path} annotation class cannot authorize body text`);
    const premiseDetails=unit.querySelector('.claim-annotation details');
    assert(premiseDetails);
    const extraSummary=premiseDetails.outerHTML.replace('</details>',`<summary>${assertion}</summary></details>`);
    assert(check(html.replace(premiseDetails.outerHTML,extraSummary)).some(error=>/premise section missing or changed/.test(error)),`${path} a second summary cannot authorize extra annotation text`);
    for(const selector of ['.annotation-sources','details','details li','p:has(a[download])']){
      // Query only selectors supported by the existing HTML parser.
      const inside=selector.startsWith('p:')?unit.querySelector('a[download]')?.closest('p'):unit.querySelector(selector);
      if(!inside)continue;
      const end=inside.outerHTML.lastIndexOf('</'),changed=inside.outerHTML.slice(0,end)+assertion+inside.outerHTML.slice(end);
      assert(check(html.replace(inside.outerHTML,changed)).some(error=>/actual annotation/.test(error)),`${path} nested ${selector} addition escaped`);
    }
  }
});

test('observed web/print shells retain exactly reviewed descriptions, neighbor metadata and legitimate note aliases',async()=>{
  const actualRaw=await readFile(new URL('../content/docs/book/inventory-boundary-and-hybrid.mdx',import.meta.url),'utf8'),description=/^description:\s*(.+)$/m.exec(actualRaw)[1];
  const metadataProse=structuredClone(fixtureProse);Object.assign(metadataProse.sources[0],{description,navigation:observedShell.navigation});
  const metadataDigest=digest(metadataProse);
  for(const print of [false,true]){
    const path=print?'/print':route,base=htmlParser.parse(rendered(print)),unit=base.querySelector(`article[data-reader-route="${route}"]`),title=unit.querySelector(print?'h2':'h1');
    const body=unit.innerHTML.replace(title.outerHTML,'');
    const titleHtml=(print?observedShell.printTitle:observedShell.webTitle).replace(observedShell.oldTitle,accepted.title);
    const descriptionHtml=(print?observedShell.printDescription:observedShell.webDescription).replace(observedShell.oldDescription,description);
    const own=`<article data-reader-route="${route}" data-reader-title="混合清单">${print?'':observedShell.breadcrumb}${titleHtml}${descriptionHtml}<div class="${print?'print-body':'prose flex-1'}">${body}</div>${print?'':observedShell.pagination}</article>`;
    const html=own+(print?base.querySelector(`article[data-reader-route="${externalRoute}"]`).outerHTML:'');
    const check=text=>validateRenderedHybridInventory(htmlParser.parse(text),path,accepted,catalog,metadataProse,metadataDigest);
    assert.deepEqual(check(html),[]);
    for(const added of ['额外断言。','<div>额外断言。</div>','<p>额外断言。</p>','<ol><li>额外断言。</li></ol>']){
      assert(check(html.replace(descriptionHtml,descriptionHtml+added)).length);
      assert(check(html.replace('</div>',added+'</div>')).length);
    }
    assert(check(html.replace(description,description+'未经审查的描述。')).some(error=>/description requires/.test(error)));
    assert(check(html.replace(descriptionHtml,'')).some(error=>/reviewed description is missing/.test(error)));
    if(!print){
      assert(check(html.replace(observedShell.pagination,observedShell.pagination.replace('</a>','额外断言。</a>'))).some(error=>/pagination requires/.test(error)));
      assert(check(html.replace(observedShell.pagination,'')).some(error=>/reviewed pagination is missing/.test(error)));
      const missingMetadata=structuredClone(metadataProse);delete missingMetadata.sources[0].navigation;
      assert(validateRenderedHybridInventory(htmlParser.parse(html),path,accepted,catalog,missingMetadata,digest(missingMetadata)).some(error=>/pagination requires/.test(error)));
      const alias=observedShell.webNoteAlias,first=htmlParser.parse(html).querySelector('.claim-annotation');
      const withAlias=html.replace(first.outerHTML,alias+first.outerHTML);assert.deepEqual(check(withAlias),[]);
      assert(check(withAlias.replace(alias,alias.replace('</span>','额外断言。</span>'))).some(error=>/historical output context/.test(error)));
    }
  }
});

test('exact legitimate historical group/unit/notice text remains accounted for while additive claims cannot hide inside it',()=>{
  const entries=remapHybridInventoryCitations(historical(),accepted,captured);
  const version=entry=>`此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="https://github.com/tiangong-lca/knowledge-base/tree/${entry.edition.sourceCommit}">查看这一版本的源文件</a>`;
  for(const print of [false,true]){
    const path=print?'/print':route,prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),html=rendered(print);
    const label=target=>target.kind==='note'?`《混合清单》注 ${ids.indexOf(target.claimId)+1}`:`《混合清单》${print&&target.kind==='heading'?`·${target.id.slice(prefix.length+1)}`:target.kind==='note-group'?'注释':''}`;
    const chosen=entries.filter(entry=>entry.path===path&&entry.route===route&&(entry.mode==='retained'&&entry.scope||entry.mode==='notice'&&entry.targets[0].kind==='note'));
    for(const entry of chosen){
      const targets=entry.scope?.targets??entry.targets,links=targets.map(target=>`<a ${entry.mode==='retained'?'data-legacy-scope-destination':'data-legacy-destination'} href="${citationHref(target,path)}">${label(target)}</a>`).join('');
      const context=`<div ${entry.mode==='retained'?`data-legacy-scope="${entry.id}"`:`id="${entry.id}" data-legacy-notice=""`}><p>${version(entry)}</p><p>${entry.scope.text}</p>${links}</div>`;
      const changed=html.replace('<section class="chapter-notes">',context+'<section class="chapter-notes">'),check=text=>validateRenderedHybridInventory(htmlParser.parse(text),path,accepted,catalog,fixtureProse,fixtureDigest);
      assert.deepEqual(check(changed),[]);
      for(const added of ['额外断言。','<div>额外断言。</div>','<ul><li>额外断言。</li></ul>'])assert(check(changed.replace(context,context.replace(/<\/div>$/,added+'</div>'))).some(error=>/historical output context/.test(error)));
    }
    assert(chosen.length>=2);
  }
});
