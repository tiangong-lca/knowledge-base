import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { publicCatalog, getClaimEvidence } from './knowledge.mjs';
import { publicResearch } from './research.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { assertExchangeSemanticsOriginal, assertExchangeSemanticsHeadingHistory, assertExchangeSemanticsCitationSources, assertExchangeSemanticsPartialHistory, assertExchangeSemanticsProseAccepted, exchangeSemanticsRoute as route, historyRoute, exchangeSemanticsHeadingEntries, remapExchangeSemanticsCitations, validateExchangeSemanticsCoverage, validateRenderedExchangeSemantics, projectExchangeSemanticsRaw, historyPrintCrossReference, historyPrintDestination, validateExchangeAnnotationOutput, validateExchangeOrdinaryNavigation } from './reader-exchange-semantics.mjs';
import { currentEditionKeys, publishedHeadingEntries, remapBookCitations, frameworkBookHref } from './reader-edition.mjs';
import { cleanerProductionHeadingEntries, remapCleanerProductionCitations } from './reader-cleaner-production.mjs';
import { functionalReferenceHeadingEntries, remapFunctionalReferenceCitations } from './reader-functional-reference.mjs';
import { processNetworkHeadingEntries, remapProcessNetworkCitations } from './reader-process-network.mjs';
import { createLegacyCitationEntries, createCanonicalCitationEntries, citationHref } from './reader-citations.mjs';
import { collectChapterClaimOccurrences, chapterAnchorPrefix, printUnitAnchor, splitReferenceTail, createChapterNotePlan, createChapterReferenceIndex, createChapterAnnotationPlan } from './reader-book.mjs';
import { validateHistoricalScope, readCitationSurface, validateReaderOutput } from './reader-surface.mjs';
const json=async name=>JSON.parse(await readFile(new URL(`../config/${name}.json`,import.meta.url),'utf8'));
const [original,captured,partial,frozen,edition,baseline,placements,history,framework,frameworkHeadings,cleaner,cleanerHeadings,functional,functionalHeadings,process,processHeadings]=await Promise.all(['exchange-semantics-original','exchange-semantics-heading-history','exchange-semantics-partial-history','exchange-semantics-citation-sources','book-edition','citation-baseline','citation-placements','citation-history','framework-accepted','framework-heading-history','cleaner-production-accepted','cleaner-production-heading-history','functional-reference-accepted','functional-reference-heading-history','process-network-accepted','process-network-heading-history'].map(json));
const ids=original.sections.flatMap(section=>section.claimIds),raw=`---\ntitle: 交换语义\n---\n${original.sections.map(section=>`## ${section.id}\n<Prose ids="${section.claimIds.join(' ')}" />`).join('\n')}`;
const historyRaw=await readFile(new URL('../content/docs/history.mdx',import.meta.url),'utf8');
const sources=new Map([[route,raw],[historyRoute,historyRaw],...await Promise.all(original.sources.filter(source=>source.route!==route).map(async source=>[source.route,await readFile(new URL(`../${source.path}`,import.meta.url),'utf8')])),...partial.projection.filter(item=>item.route!==route).map(item=>[edition.units.find(unit=>unit.key===item.route)?.source??item.route,`<Prose ids="${partial.projection.filter(row=>row.route===item.route).map(row=>row.claimId).join(' ')}" />`])]);
// The accepted B04 destination's formal scope is part of the partial-source contract.
sources.set('/monograph/framework-responsibilities',`## 史料与职责\n<Prose ids="${partial.projection.filter(item=>item.route==='book-framework-responsibilities').map(item=>item.claimId).join(' ')}" />`);
function historical(){const all=[...createLegacyCitationEntries(baseline,placements,history.pages),...createCanonicalCitationEntries(history,placements,[...baseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route),...placements.frontMatter,...placements.printAdditions.map(unit=>unit.route)]),...publishedHeadingEntries(frameworkHeadings),...cleanerProductionHeadingEntries(cleanerHeadings),...functionalReferenceHeadingEntries(functionalHeadings),...processNetworkHeadingEntries(processHeadings),...exchangeSemanticsHeadingEntries(captured)];return remapProcessNetworkCitations(remapFunctionalReferenceCitations(remapCleanerProductionCitations(remapBookCitations(all,edition,framework,placements),cleaner,cleanerHeadings),functional,functionalHeadings),process,processHeadings);}

test('original-map, actual capture, partial source and original address inventories remain independently pinned',()=>{
 assertExchangeSemanticsOriginal(original);assertExchangeSemanticsHeadingHistory(captured);assertExchangeSemanticsCitationSources(frozen);assertExchangeSemanticsPartialHistory(partial);
 assert.equal(original.mappings.length,60);assert.equal(ids.length,56);assert.equal(new Set(ids).size,56);assert.equal(original.ordinary.length,14);assert.equal(original.caseBoundClaimIds.length,33);assert.deepEqual(original.sections.map(section=>section.claimIds.length),[19,19,7,11]);assert.equal(captured.canonicalPrintedHeadings.length,19);assert.equal(partial.projection.length,8);assert.equal(partial.ordinary.length,6);assert.equal(partial.claimIds.length,9);
 for(const [data,check,mutate]of [[original,assertExchangeSemanticsOriginal,x=>x.mappings.pop()],[original,assertExchangeSemanticsOriginal,x=>x.ordinary.pop()],[original,assertExchangeSemanticsOriginal,x=>x.caseBoundClaimIds.pop()],[captured,assertExchangeSemanticsHeadingHistory,x=>x.canonicalPrintedHeadings.pop()],[partial,assertExchangeSemanticsPartialHistory,x=>x.projection.pop()],[partial,assertExchangeSemanticsPartialHistory,x=>x.ordinary.pop()],[frozen,assertExchangeSemanticsCitationSources,x=>x.entries.pop()]]){const changed=structuredClone(data);mutate(changed);assert.throws(()=>check(changed),/independently frozen/);}
 assert.throws(()=>assertExchangeSemanticsProseAccepted(null),/separately reviewed/);
});

test('shared B08 consumes only S02/S05 and registration cannot co-delete whole sources or partial history',()=>{
 const available=edition.units.flatMap(unit=>[unit.source,...unit.coverage??[]]);assert(!edition.units.some(unit=>['/docs/flows','/docs/characterization'].includes(unit.key)));assert(edition.units.some(unit=>unit.key===historyRoute));assert.deepEqual(edition.units.find(unit=>unit.key===route).coverage,['/docs/flows','/docs/characterization']);assert.equal(currentEditionKeys(edition,available,baseline,placements).length,39);
 for(const mutate of [x=>x.units=x.units.filter(unit=>unit.key!==route),x=>x.units.find(unit=>unit.key===route).sections.reverse(),x=>x.units.find(unit=>unit.key===route).coverage.push(historyRoute),x=>x.units=x.units.filter(unit=>unit.key!==historyRoute),x=>x.units.find(unit=>unit.key===route).coverage.pop()]){const changed=structuredClone(edition);mutate(changed);assert.throws(()=>currentEditionKeys(changed,available,baseline,placements),/B08|S01/);}
 for(const missing of [route,historyRoute,'/docs/flows','/docs/characterization'])assert.throws(()=>currentEditionKeys(edition,available.filter(value=>value!==missing),baseline,placements),/Missing/);
});

test('all56 original propositions retain actual section and unique body, with reviewed additions allowed separately',()=>{
 assert.deepEqual(validateExchangeSemanticsCoverage(edition,sources),[]);
 for(const id of ids)for(const altered of [raw.replace(id,''),raw.replace(id,`${id} ${id}`),raw.replace(id,'cl-wrong')]){const changed=new Map(sources);changed.set(route,altered);assert(validateExchangeSemanticsCoverage(edition,changed).some(error=>/proposition|duplicate/.test(error)));}
 for(const section of original.sections){const changed=new Map(sources);changed.set(route,raw.replace(`## ${section.id}`,`## Other`));assert(validateExchangeSemanticsCoverage(edition,changed).length);}
 const added=new Map(sources);added.set(route,raw.replace('## 对象与交换','## 对象与交换\n<Prose ids="cl-explicit-new-record" />'));assert.deepEqual(validateExchangeSemanticsCoverage(edition,added),[]);assert.throws(()=>validateExchangeSemanticsCoverage(edition,added,original,{claims:[]},null),/separately reviewed/);
 const wrongPartial=new Map(sources);wrongPartial.set('/monograph/framework-responsibilities','## 其他职责\n'+sources.get('/monograph/framework-responsibilities').replace('## 史料与职责',''));assert(validateExchangeSemanticsCoverage(edition,wrongPartial).some(error=>/wrong actual section/.test(error)));
});

test('same S01 projection changes body choice, raw occurrences, endnotes and global index while retaining original website',()=>{
 const projected=projectExchangeSemanticsRaw(historyRoute,historyRaw,true);assert.deepEqual(collectChapterClaimOccurrences(projected),['cl-apos-history']);assert.equal(projectExchangeSemanticsRaw(historyRoute,historyRaw,false),historyRaw);assert.equal(projectExchangeSemanticsRaw(route,historyRaw,true),historyRaw);
 for(const item of partial.projection){assert.deepEqual(historyPrintCrossReference(historyRoute,item.claimId,true),item);assert.equal(historyPrintCrossReference(historyRoute,item.claimId,false),null);assert.equal(historyPrintCrossReference(route,item.claimId,true),null);}
 assert.deepEqual(createChapterNotePlan(projected,printUnitAnchor(historyRoute)).notes.map(note=>note.id),['cl-apos-history']);
 const index=createChapterReferenceIndex([{url:historyRoute,title:'历史',raw:projected},{url:route,title:'交换语义',raw}],{print:true});
 assert.equal(index.get('cl-waste-history').length,1);assert.equal(index.get('cl-waste-history')[0].unitKey,route);assert.equal(index.get('cl-apos-history')[0].unitKey,historyRoute);
 for(const block of partial.ordinary)assert(projected.includes(block.text));
 const changed=new Map(sources);changed.set(historyRoute,historyRaw.replace('先后发生也不直接证明影响关系','先后发生证明影响关系'));assert(validateExchangeSemanticsCoverage(edition,changed).some(error=>/S01 complete website/.test(error)));
});

test('all4076 histories plus19actual captured headings preserve scopes, nine-way S01 destinations and three incoming notices',()=>{
 const before=historical(),after=remapExchangeSemanticsCitations(before);assert.equal(after.length,4095);assert.equal(new Set(after.map(entry=>`${entry.path}#${entry.id}`)).size,4095);
 for(const sourceRoute of [route,'/docs/flows','/docs/characterization',historyRoute]){const prefix=printUnitAnchor(sourceRoute),entry=after.find(entry=>entry.path==='/print'&&entry.id===`${prefix}-annotations`);const wanted=sourceRoute===historyRoute?partial.claimIds:original.sources.find(source=>source.route===sourceRoute).claimIds;assert.deepEqual((entry.scope?.targets??entry.targets).filter(target=>target.kind==='note').map(target=>target.claimId),wanted);assert(entry.scope.text.includes(`原有${wanted.length}则注释`));assert.equal(entry.edition.sourceCommit,'a36597d72f8cd89beb285d5d5b439b4aa10e89a3');}
 const group=after.find(entry=>entry.path==='/print'&&entry.id===`${printUnitAnchor(historyRoute)}-annotations`);assert.deepEqual([...new Set(group.scope.targets.map(target=>target.route))],['/docs/book/early-container-policy-and-systems','/docs/book/early-container-comparisons','book-framework-responsibilities',route,historyRoute]);
 const incoming=after.filter(entry=>entry.path==='/docs'&&frozen.entries.some(old=>old.path===entry.path&&old.id===entry.id));assert.equal(incoming.length,3);assert(incoming.every(entry=>entry.targets.every(target=>target.route===route&&target.path===route)));for(const entry of incoming)assert.equal(entry.edition.sourceCommit,'dd715663c3438aa730eef0da1696dc376a7715f1');
 for(const heading of captured.canonicalPrintedHeadings){const entry=after.find(entry=>entry.path==='/print'&&entry.id===heading.id);assert.equal(entry.mode,'alias');assert.equal(entry.edition.sourceCommit,captured.sourceCommit);}
 for(const old of frozen.entries){assert.throws(()=>remapExchangeSemanticsCitations(before.filter(entry=>entry.path!==old.path||entry.id!==old.id)),/missing, repeated or changed/);}
 const changed=structuredClone(before);changed.find(entry=>entry.path==='/print'&&entry.id===printUnitAnchor(historyRoute)).targets[0].kind='note-group';assert.throws(()=>remapExchangeSemanticsCitations(changed),/missing, repeated or changed/);
});

const esc=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const rawCatalog=JSON.parse(await readFile(new URL('../knowledge/catalog.json',import.meta.url),'utf8'));
const catalog=publicCatalog(rawCatalog),readingMap=JSON.parse(await readFile(new URL('../knowledge/research/literature-map.json',import.meta.url),'utf8')),readingLedger=JSON.parse(await readFile(new URL('../knowledge/research/readings.json',import.meta.url),'utf8'));
const require=createRequire(import.meta.url),mdxRequire=createRequire(require.resolve('fumadocs-mdx'));
// Compile only the actual annotation component in memory, using the already
// installed MDX toolchain. No copied annotation markup can make a stub pass.
const componentModule={exports:{}},compiled=mdxRequire('esbuild').transformSync(await readFile(new URL('../components/evidence.tsx',import.meta.url),'utf8'),{loader:'tsx',jsx:'automatic',format:'cjs',sourcefile:'evidence.tsx'});
new Function('require','module','exports',compiled.code)(name=>{
 if(name==='@/lib/catalog')return {__esModule:true,default:catalog,getClaimEvidence,isKnownClaim:id=>rawCatalog.claims.some(claim=>claim.id===id)};
 if(name==='@/knowledge/research/literature-map.json')return readingMap;
 if(name==='@/knowledge/research/readings.json')return readingLedger;
 if(name==='@/scripts/research.mjs')return {publicResearch};
 return require(name);
},componentModule,componentModule.exports);
const {ClaimAnnotation}=componentModule.exports;
// Match next.config.ts trailingSlash:true in this isolated Node test process.
globalThis.process.env.__NEXT_TRAILING_SLASH='true';
const unitIds=new Map([[route,ids],[historyRoute,partial.retainedClaimIds],...partial.projection.filter(item=>item.route!==route).map(item=>[item.route,partial.projection.filter(row=>row.route===item.route).map(row=>row.claimId)])]);
const unitTitles=new Map([[route,'交换语义'],[historyRoute,'LCA怎样形成：问题、框架与版本'],['/docs/book/early-container-policy-and-systems','政策尺度'],['/docs/book/early-container-comparisons','饮料容器账本'],['book-framework-responsibilities','框架职责']]);
function annotations(key,claimIds,print){
 const prefix=print?printUnitAnchor(key):chapterAnchorPrefix(key),plan=createChapterNotePlan(`<Prose ids="${claimIds.join(' ')}" />`,prefix);
 const pages=[...unitIds].map(([url,ids],printOrder)=>({url,title:unitTitles.get(url),raw:`<Prose ids="${!print&&url===historyRoute?partial.claimIds.join(' '):ids.join(' ')}" />`,printOrder}));
 const annotationPlan=createChapterAnnotationPlan(plan,catalog.claims,createChapterReferenceIndex(pages,{print}),{print});
 return claimIds.map(id=>`<li id="${prefix}-claim-${id}" data-reader-claim="${id}">${renderToStaticMarkup(createElement(ClaimAnnotation,{id,...annotationPlan.get(id)}))}</li>`).join('');
}
function paragraph(id,print,key=route){const prefix=print?printUnitAnchor(key):chapterAnchorPrefix(key),{body,tail}=splitReferenceTail(catalog.claims.find(claim=>claim.id===id).text);return `<p>${esc(body)}<span>${esc(tail)}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${prefix}-claim-${id}">注</a></sup></span></p>`;}
function b08(print){const prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route);return `<article data-reader-route="${route}" data-reader-title="交换语义"><h${print?2:1}>交换语义</h${print?2:1}>${original.sections.map(section=>`<h${print?3:2} id="${print?`${prefix}-`:''}${section.id}">${section.title}</h${print?3:2}>${section.claimIds.map(id=>paragraph(id,print)).join('')}`).join('')}<section class="chapter-notes"><h${print?3:2} id="${prefix}-annotations">注释</h${print?3:2}>${annotations(route,ids,print)}</section></article>`;}
function markdownLinks(block,print){
 let cursor=0,result='';for(const match of block.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)){result+=esc(block.slice(cursor,match.index))+`<a href="${esc(print?frameworkBookHref(match[2],historyRoute):match[2])}">${esc(match[1])}</a>`;cursor=match.index+match[0].length;}return result+esc(block.slice(cursor));
}
function s01(print=true){
 const prefix=print?printUnitAnchor(historyRoute):chapterAnchorPrefix(historyRoute);
 const body=historyRaw.replace(/^---[\s\S]*?---\s*/,'').trim().split(/\n\s*\n/).map(block=>{
   if(block.startsWith('## ')){const title=block.slice(3).trim(),heading=partial.printedHeadings.find(heading=>heading.text===title);return `<h${print?3:2} id="${print?heading.id:heading.id.slice(prefix.replace('chapter-','print-unit-').length+1)}">${title}</h${print?3:2}>`;}
   if(block.startsWith('<Prose'))return collectChapterClaimOccurrences(block).map(id=>{const item=print?partial.projection.find(item=>item.claimId===id):null;return item?`<p data-reader-partial-claim="${id}"><a href="#${historyPrintDestination(item).id}">${item.text}</a></p>`:paragraph(id,print,historyRoute);}).join('');
   return `<p>${markdownLinks(block,print)}</p>`;
 }).join('');
 return `<article data-reader-route="${historyRoute}" data-reader-title="${unitTitles.get(historyRoute)}">${body}<section class="chapter-notes"><h${print?3:2} id="${prefix}-annotations">注释</h${print?3:2}>${annotations(historyRoute,print?partial.retainedClaimIds:partial.claimIds,print)}</section></article>`;
}
function movedDestinations(){return [...unitIds].filter(([key])=>![route,historyRoute].includes(key)).map(([key,ids])=>`<article data-reader-route="${key}" data-reader-title="${unitTitles.get(key)}"><section class="chapter-notes"><h3>注释</h3>${annotations(key,ids,true)}</section></article>`).join('');}

test('actual rendered body rejects omitted/moved/duplicated/changed text and projected history false note plans',()=>{
 for(const print of [false,true]){const path=print?'/print':route,html=b08(print)+(print?s01()+movedDestinations():''),p=paragraph(ids[0],print);const check=text=>validateRenderedExchangeSemantics(htmlParser.parse(text),path,original,catalog);assert.deepEqual(check(html),[]);for(const changed of [html.replace(p,''),html.replace(p,p+p),html.replace(p,p.replace(esc(splitReferenceTail(catalog.claims.find(claim=>claim.id===ids[0]).text).body),'未经审查的无条件结论。')),html.replace('>计算活动<','>别的标题<'),html.replace(p,'').replace('>转换边界<',`>转换边界<${p}`),html.replace(`data-reader-claim="${ids[0]}"`,'data-reader-claim="cl-other"')])assert(check(changed).length);}
 const html=b08(true)+s01()+movedDestinations(),check=text=>validateRenderedExchangeSemantics(htmlParser.parse(text),'/print',original,catalog);
 for(const changed of [html.replace(`<p>${partial.ordinary[0].text}</p>`,'').replace(`<h3 id="${partial.printedHeadings[0].id}">${partial.printedHeadings[0].text}</h3>`,`<h3 id="${partial.printedHeadings[0].id}">${partial.printedHeadings[0].text}</h3><p>${partial.ordinary[0].text}</p>`),html.replace(paragraph('cl-apos-history',true,historyRoute),paragraph('cl-apos-history',true,historyRoute).replace(esc(splitReferenceTail(catalog.claims.find(claim=>claim.id==='cl-apos-history').text).body),'APOS无条件适用')),html.replace(partial.projection[0].text,'见其他章节'),html.replace(`href="#${historyPrintDestination(partial.projection[0]).id}"`,'href="#unrelated"'),html.replace('史料辨识','普通说明'),html.replace(partial.ordinary[0].text,''),html.replace('data-reader-partial-claim="'+partial.projection[0].claimId+'"','data-reader-partial-claim="cl-other"'),html.replace('</article>',`${paragraph(partial.projection[0].claimId,true,historyRoute)}</article>`)]){if(changed!==html)assert(check(changed).length);}
});

test('retained original source scopes reject broadened or context-free annotations',()=>{
 for(const entry of remapExchangeSemanticsCitations(historical()).filter(entry=>entry.mode==='retained'&&entry.scope&&[route,historyRoute].includes(entry.route))){const unit=entry.targets[0].kind==='chapter';const context=`<div data-legacy-scope="${entry.id}"><time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time><a href="https://github.com/tiangong-lca/knowledge-base/tree/${entry.edition.sourceCommit}">版本</a><p>${entry.scope.text}</p>${entry.scope.targets.map(target=>`<a data-legacy-scope-destination href="${citationHref(target,entry.path)}">位置</a>`).join('')}</div>`;const html=unit?`<article id="${entry.id}" data-reader-route="${entry.route}">${context}</article>`:`<article data-reader-route="${entry.route}"><section class="chapter-notes"><h${entry.path==='/print'?3:2} id="${entry.id}">注释</h${entry.path==='/print'?3:2}>${context}</section></article>`;const check=text=>validateHistoricalScope(readCitationSurface(htmlParser.parse(text),entry.path).ids.get(entry.id),entry);assert.deepEqual(check(html),[]);for(const changed of [html.replace(context,''),html.replace(context,context+context),html.replace(entry.scope.text,'原有全部内容'),html.replace(entry.edition.sourceCommit,'0'.repeat(40))])assert(check(changed).length);}
});

test('export admission rejects co-deleted B08 originals, capture, partial ledger or unreviewed manuscript',async()=>{
 const root=await mkdtemp(join(tmpdir(),'reader-b08-admission-'));try{await mkdir(join(root,'out'));await mkdir(join(root,'config'));const all=['book-edition','framework-accepted','framework-heading-history','citation-baseline','citation-placements','citation-history','cleaner-production-accepted','cleaner-production-heading-history','functional-reference-accepted','functional-reference-heading-history','functional-reference-prose-accepted','process-network-accepted','process-network-heading-history','process-network-prose-accepted',...['original','heading-history','citation-sources','partial-history','prose-accepted'].map(name=>`exchange-semantics-${name}`)];for(const name of all)await writeFile(join(root,'config',`${name}.json`),JSON.stringify(await json(name)));for(const name of all.filter(name=>name.startsWith('exchange-'))){const file=join(root,'config',`${name}.json`);await rm(file);await assert.rejects(validateReaderOutput(join(root,'out')),/requires its accepted proposition and published heading inventories/);await writeFile(file,JSON.stringify(await json(name)));}}finally{await rm(root,{recursive:true,force:true});}
});

test('co-deleting every book inventory cannot downgrade a cached actual book to a standalone legacy fixture',async()=>{
 const root=await mkdtemp(join(tmpdir(),'reader-b08-cached-admission-'));
 try{const config=join(root,'config'),out=join(root,'out');await mkdir(config);await mkdir(join(out,'docs','book','exchange'),{recursive:true});
 for(const name of ['citation-baseline','citation-placements','citation-history'])await writeFile(join(config,`${name}.json`),JSON.stringify(await json(name)));
 await writeFile(join(out,'docs','book','exchange','index.html'),'<article>保留的书章</article>');
 await assert.rejects(validateReaderOutput(out),/requires its accepted proposition and published heading inventories/);
 }finally{await rm(root,{recursive:true,force:true});}
});

const manuscriptReceipt=await json('exchange-semantics-prose-accepted');
test('pending manuscript cannot impersonate acceptance; an actual final receipt binds full records and source bytes',async()=>{
 if(manuscriptReceipt.status!=='reviewed'){
   assert.throws(()=>assertExchangeSemanticsProseAccepted(manuscriptReceipt),/separately reviewed/);
   const forged={...manuscriptReceipt,status:'reviewed',sourceReview:'invented',readerReview:'invented',partialSourceReview:'invented'};
   assert.throws(()=>assertExchangeSemanticsProseAccepted(forged),/separately reviewed/);
   return;
 }
 assertExchangeSemanticsProseAccepted(manuscriptReceipt);
 const actualCatalog=JSON.parse(await readFile(new URL('../knowledge/catalog.json',import.meta.url),'utf8'));
 const required=new Set([...manuscriptReceipt.sources.map(source=>source.route),...partial.projection.map(item=>edition.units.find(unit=>unit.key===item.route)?.source??item.route)]);
 const actualSources=new Map(await Promise.all([...required].map(async route=>[route,await readFile(new URL(`../content${route}.mdx`,import.meta.url),'utf8')])));
 assert.deepEqual(validateExchangeSemanticsCoverage(edition,actualSources,original,actualCatalog,manuscriptReceipt),[]);
 for(const row of manuscriptReceipt.claims)for(const mutate of [claim=>claim.text+='无条件适用于所有情况。',claim=>claim.scope='全部系统',claim=>claim.caveats=[],claim=>claim.evidenceIds=['ev-unreviewed'],claim=>claim.premiseIds=['cl-unreviewed']]){
   const changed=structuredClone(actualCatalog),record=changed.claims.find(claim=>claim.id===row.id),before=JSON.stringify(record);mutate(record);if(JSON.stringify(record)===before)continue;
   assert(validateExchangeSemanticsCoverage(edition,actualSources,original,changed,manuscriptReceipt).some(error=>/canonical record differs/.test(error)));
   const forged=structuredClone(manuscriptReceipt);forged.claims[forged.claims.findIndex(claim=>claim.id===record.id)]=record;assert.throws(()=>assertExchangeSemanticsProseAccepted(forged),/separately reviewed/);
 }
 for(const source of manuscriptReceipt.sources){const changed=new Map(actualSources);changed.set(source.route,changed.get(source.route)+'\n附加未审内容。\n');assert(validateExchangeSemanticsCoverage(edition,changed,original,actualCatalog,manuscriptReceipt).length);}
 for(const item of manuscriptReceipt.partialSourceReview.destinations){const changed=structuredClone(actualCatalog);changed.claims.find(claim=>claim.id===item.claimId).text+='这足以证明首次与因果。';assert(validateExchangeSemanticsCoverage(edition,actualSources,original,changed,manuscriptReceipt).some(error=>/full record differs/.test(error)));}
 const forged=structuredClone(manuscriptReceipt);forged.readerDraftSha256='0'.repeat(64);assert.throws(()=>assertExchangeSemanticsProseAccepted(forged),/separately reviewed/);
});

test('actual annotation rendering preserves approved scope, caveats, source/locator/carrier, premise and case-input links with stable IDs',()=>{
 const printHtml=b08(true)+s01()+movedDestinations();
 for(const [path,html]of [[route,b08(false)],[historyRoute,s01(false)],['/print',printHtml]]) {
   const check=text=>validateRenderedExchangeSemantics(htmlParser.parse(text),path,original,catalog);
   assert.deepEqual(check(html),[]);
   const document=htmlParser.parse(html),notes=document.querySelectorAll('[data-reader-claim]');
   for(const note of notes){
     const annotation=note.querySelector('.claim-annotation'),scope=annotation.childNodes.filter(node=>node.tagName==='P')[0],limits=annotation.querySelector('.annotation-limits'),source=annotation.querySelector('.annotation-sources li'),premise=annotation.querySelector('details li a'),input=annotation.querySelectorAll('a').find(node=>node.getAttribute('href')?.startsWith('/downloads/cases/')),carrier=annotation.querySelector('.source-reading a');
     const alterations=[note.outerHTML.replace(annotation.outerHTML,''),note.outerHTML.replace(scope.outerHTML,'')];
     if(limits)alterations.push(note.outerHTML.replace(limits.outerHTML,''));
     if(source){const link=source.querySelector('a');alterations.push(note.outerHTML.replace(link.outerHTML,esc(link.text)),note.outerHTML.replace(source.outerHTML,`<li>${link.outerHTML}。被误改的定位。</li>`));}
     if(premise)alterations.push(note.outerHTML.replace(premise.outerHTML,premise.outerHTML.replace(/href="[^"]*"/,'href="#unrelated"')));
     if(input)alterations.push(note.outerHTML.replace(input.outerHTML,''),note.outerHTML.replace(input.outerHTML,input.outerHTML.replace(/download="[^"]*"/,'download="wrong.json"')));
     if(carrier)alterations.push(note.outerHTML.replace(carrier.outerHTML,esc(carrier.text)));
     for(const changedNote of alterations){const changed=html.replace(note.outerHTML,changedNote);assert(changed.includes(`id="${note.id}"`));assert(check(changed).some(error=>/actual annotation/.test(error)),`${path} ${note.getAttribute('data-reader-claim')} annotation mutation escaped`);}
   }
 }
 // A repeated input is suppressed only within its actual unit, not across units.
 const document=htmlParser.parse(printHtml),unit=document.querySelector(`article[data-reader-route="${route}"]`),notes=unit.querySelectorAll('[data-reader-claim]'),first=notes.find(note=>note.querySelector('a[download]')),firstLink=first.querySelector('a[download]'),sameInput=notes.find(note=>note!==first&&catalog.claims.find(claim=>claim.id===note.getAttribute('data-reader-claim')).caseBinding?.inputFile===firstLink.getAttribute('download'));
 const changedNote=sameInput.outerHTML.replace('</div>',`<p>${firstLink.outerHTML}</p></div>`);
 assert(validateRenderedExchangeSemantics(htmlParser.parse(printHtml.replace(sameInput.outerHTML,changedNote)),'/print',original,catalog).some(error=>/case-input/.test(error)));
});

test('retained S01 ordinary navigation preserves actual link labels and transformed hrefs as well as paragraph section',()=>{
 for(const print of [false,true]) {
   const path=print?'/print':historyRoute,html=print?b08(true)+s01()+movedDestinations():s01(false),check=text=>validateRenderedExchangeSemantics(htmlParser.parse(text),path,original,catalog);
   assert.deepEqual(check(html),[]);
   const unit=htmlParser.parse(html).querySelector(`article[data-reader-route="${historyRoute}"]`);
   for(const block of partial.ordinary)for(const match of block.text.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)) {
     const href=print?frameworkBookHref(match[2],historyRoute):match[2],paragraph=unit.querySelectorAll('p').find(node=>node.querySelectorAll('a').some(link=>link.text===match[1]&&link.getAttribute('href')===href)&&!node.closest('.chapter-notes'));
     assert(paragraph,`Missing real retained S01 ordinary link ${match[1]}`);
     const link=paragraph.querySelectorAll('a').find(node=>node.text===match[1]&&node.getAttribute('href')===href);
     for(const alteredLink of [esc(link.text),link.outerHTML.replace(/href="[^"]*"/,'href="/docs/unrelated/"'),link.outerHTML.replace(esc(link.text),'无关入口')]){
       const changed=html.replace(paragraph.outerHTML,paragraph.outerHTML.replace(link.outerHTML,alteredLink));assert(check(changed).some(error=>/S01 retained ordinary/.test(error)));
     }
   }
 }
});

test('S01 navigation summaries retain named historical subjects and reader notices contain reader meaning',()=>{
 assert(partial.projection[0].text.startsWith('RTI《饮料容器问题：分析与建议》'));
 assert(partial.projection[7].text.includes('沿物质流向的废物表达在1.7版引入'));
 for(const [index,subject]of [[1,'1974年EPA容器报告'],[2,'SETAC工作坊'],[3,'EPA1993年'],[4,'UNEP1996年'],[5,'CML等2001年'],[6,'EPA2006年'],[7,'openLCA官方手册']])assert(partial.projection[index].text.includes(subject));
 for(const entry of remapExchangeSemanticsCitations(historical()).filter(entry=>entry.route===historyRoute&&entry.scope)){
   assert(!entry.scope.text.includes('责任尚未完成'));assert(entry.scope.text.includes('本篇仍保留史料对象、因果判断和APOS版本回顾的解释。'));
 }
});

test('B08 ordinary navigation uses actual runtime print href transformation and retains meaningful section placement',()=>{
 const prefix=printUnitAnchor(route),local=['计算活动','转换边界','表征状态'];
 const navigation=[...local.map(section=>({text:`参见${section}`,href:`#${section}`})),{text:'分配与回收',href:'/docs/allocation/'},{text:'连续阅读的表征状态',href:`/print/#${prefix}-表征状态`}];
 const rows=[{oldUnit:'S02',block:16,section:'对象与交换',navigation}];
 assert.equal(frameworkBookHref('#计算活动',historyRoute),'#计算活动');
 assert.equal(frameworkBookHref('/docs/allocation/',historyRoute),'/docs/allocation/');
 assert.equal(frameworkBookHref('#其他语境',route),'#其他语境');
 assert.equal(frameworkBookHref('/docs/allocation/#具名范围',route),'/docs/allocation/#具名范围');
 for(const print of [false,true]) {
   const linkHtml=navigation.map(link=>renderToStaticMarkup(createElement('a',{href:print?frameworkBookHref(link.href,route):link.href},link.text))).join('');
   const html=`<article>${original.sections.map((section,index)=>`<h${print?3:2} id="${print?`${prefix}-`:''}${section.id}">${section.title}</h${print?3:2}>${index===0?`<p>${linkHtml}</p>`:''}`).join('')}</article>`;
   const check=text=>validateExchangeOrdinaryNavigation(htmlParser.parse(text).querySelector('article'),rows,{print});assert.deepEqual(check(html),[]);
   for(const link of navigation){const actual=renderToStaticMarkup(createElement('a',{href:print?frameworkBookHref(link.href,route):link.href},link.text));for(const wrong of [actual.replace(/href="[^"]*"/,'href="#unrelated"'),esc(link.text),actual.replace(esc(link.text),'无关入口')])assert(check(html.replace(actual,wrong)).length);}
   const moved=html.replace(`<p>${linkHtml}</p>`,'').replace(`>计算活动</h${print?3:2}>`,`>计算活动</h${print?3:2}><p>${linkHtml}</p>`);assert(check(moved).some(error=>/wrong actual section/.test(error)));
   if(print){
     for(const section of original.sections)assert.equal(frameworkBookHref(`#${section.id}`,route),`#${prefix}-${section.id}`);
     assert.equal(frameworkBookHref('/docs/allocation/',route),`#${printUnitAnchor('/docs/allocation')}`);
     const rendered=htmlParser.parse(html+`<article id="${printUnitAnchor('/docs/allocation')}">分配与回收</article>`);
     for(const link of navigation){const href=frameworkBookHref(link.href,route);assert.equal(rendered.querySelectorAll('[id]').filter(node=>`#${node.id}`===href).length,1,`Printed ordinary link must have an actual unique destination: ${link.href}`);}
     assert.equal(frameworkBookHref(navigation.at(-1).href,route),`#${prefix}-表征状态`);assert(check(html.replace(`href="#${prefix}-表征状态"`, `href="/print/#${prefix}-表征状态"`)).length);}
 }
});

test('compiled MDX encoded paragraph fragments match meaning while raw heading permalinks cannot satisfy ordinary navigation',()=>{
 const navigation=['计算活动','转换边界','表征状态'].map(text=>({text,href:`#${text}`}));
 navigation.push({text:'分配与回收',href:'/docs/allocation/'});
 const rows=[{oldUnit:'S02',block:15,section:'对象与交换',navigation}];
 // Actual failed-export shape: MDX encodes body fragments; Fumadocs keeps the
 // heading's own permalink raw. The latter must never substitute for body text.
 const paragraph=`<p>瓶子实例从本节展开；${navigation.map(link=>`<a href="${link.href.startsWith('#')?`#${encodeURIComponent(link.href.slice(1))}`:link.href}">${link.text}</a>`).join('，')}。</p>`;
 const headings=original.sections.map(section=>`<h2 id="${section.id}" class="group/heading"><a data-card="" href="#${section.id}">${section.title}</a><button aria-live="polite">复制章节链接</button></h2>`);
 const html=`<article>${headings[0]}${paragraph}${headings.slice(1).join('')}</article>`,check=text=>validateExchangeOrdinaryNavigation(htmlParser.parse(text).querySelector('article'),rows);
 assert.deepEqual(check(html),[]);
 assert.deepEqual(check(html.replaceAll('#%E8%AE%A1%E7%AE%97%E6%B4%BB%E5%8A%A8','#计算活动')),[]);
 const bodyLink=`<a href="#${encodeURIComponent('计算活动')}">计算活动</a>`;
 for(const replacement of ['计算活动',bodyLink.replace(encodeURIComponent('计算活动'),encodeURIComponent('转换边界')),bodyLink.replace('href="','href="/different?x=1')])assert(check(html.replace(bodyLink,replacement)).some(error=>/ordinary navigation missing/.test(error)));
 assert(check(html.replace(paragraph,'').replace(headings[1],headings[1]+paragraph)).some(error=>/wrong actual section/.test(error)));
 assert(check(html.replace(bodyLink,bodyLink+bodyLink)).some(error=>/missing or repeated/.test(error)));
 // Only fragment encodings are equivalent; path/query changes remain defects.
 const scoped=[{oldUnit:'S02',block:15,section:'对象与交换',navigation:[{text:'具名入口',href:'/docs/example/?mode=one#计算活动'}]}];
 const withQuery=`<article><h2 id="对象与交换">对象与交换</h2><p><a href="/docs/example/?mode=one#${encodeURIComponent('计算活动')}">具名入口</a></p></article>`;
 const checkQuery=text=>validateExchangeOrdinaryNavigation(htmlParser.parse(text).querySelector('article'),scoped);
 assert.deepEqual(checkQuery(withQuery),[]);
 for(const wrong of [withQuery.replace('mode=one','mode=two'),withQuery.replace('/docs/example/','/docs/other/'),withQuery.replace(encodeURIComponent('计算活动'),'%ZZ')])assert(checkQuery(wrong).length);
});

test('shared annotation guard rejects additive unwrapped, paragraph, div and list assertions beside valid scholarly fields',()=>{
 const assertion='未经来源支持的新增断言。';
 for(const [path,html]of [[route,b08(false)],['/print',b08(true)+s01()+movedDestinations()]]){
   const check=text=>validateRenderedExchangeSemantics(htmlParser.parse(text),path,original,catalog);
   assert.deepEqual(check(html),[]);
   const document=htmlParser.parse(html),annotation=document.querySelector('.claim-annotation');
   for(const added of [assertion,`<p>${assertion}</p>`,`<div>${assertion}</div>`,`<ul><li>${assertion}</li></ul>`]){
     const changed=html.replace(annotation.outerHTML,annotation.outerHTML.replace(/<\/div>$/,added+'</div>'));
     assert(check(changed).some(error=>/annotation contains unexpected unreviewed text/.test(error)),`${path} additive annotation text escaped`);
   }
   for(const selector of ['.annotation-sources','details','details li']){
     const item=document.querySelector(selector);if(!item)continue;
     const at=item.outerHTML.lastIndexOf('</'),changedItem=item.outerHTML.slice(0,at)+assertion+item.outerHTML.slice(at);
     assert(check(html.replace(item.outerHTML,changedItem)).some(error=>/actual annotation/.test(error)),`${path} nested annotation text escaped`);
   }
 }
});
