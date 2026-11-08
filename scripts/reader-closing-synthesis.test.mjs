import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { publicCatalog,getClaimEvidence } from './knowledge.mjs';
import { publicResearch } from './research.mjs';
import { createChapterNotePlan,createChapterAnnotationPlan,createChapterReferenceIndex,chapterAnchorPrefix,printUnitAnchor,splitReferenceTail } from './reader-book.mjs';
import { citationHref,citationSourceHref } from './reader-citations.mjs';
import { readCitationSurface,validateHistoricalScope } from './reader-surface.mjs';
import { assertClosingSynthesisOriginal,assertClosingSynthesisHeadingHistory,assertClosingSynthesisRegistration,assertClosingSynthesisProseAccepted,closingSynthesisKey as key,closingSynthesisManuscript as manuscript,closingSynthesisTitle as title,closingSynthesisRoutes as routes,closingSynthesisSections as sectionPlan,closingSynthesisDigest as digest,closingSynthesisHeadingEntries,remapClosingSynthesisCitations,validateClosingSynthesisCoverage,validateRenderedClosingSynthesis,closingSynthesisBookHref,closingHeadingConcealedText } from './reader-closing-synthesis.mjs';
const json=async name=>JSON.parse(await readFile(new URL(`../config/${name}.json`,import.meta.url),'utf8'));
const [original,history,edition,rawCatalog,literature,readings]=await Promise.all(['closing-synthesis-original','closing-synthesis-heading-history','book-edition'].map(json).concat(['catalog','research/literature-map','research/readings'].map(name=>readFile(new URL(`../knowledge/${name}.json`,import.meta.url),'utf8').then(JSON.parse))));
const catalog=publicCatalog(rawCatalog),byId=new Map(catalog.claims.map(claim=>[claim.id,claim])),allIds=sectionPlan.flatMap(section=>section.claimIds),sources=new Map();
const receipt={schemaVersion:1,status:'reviewed',title,bookKey:key,manuscript,sections:sectionPlan,website:[],sources:[],claims:allIds.map(id=>rawCatalog.claims.find(claim=>claim.id===id)),reviewEvidence:['explicit fixture only; no production approval']};
for(const route of [...routes,manuscript]){
 const raw=await readFile(new URL(`../content${route}.mdx`,import.meta.url),'utf8');sources.set(route,raw);
 const split=raw.split(/^## (.+)\s*$/m),headings=[],occurrences=[];
 for(let i=1;i<split.length;i+=2){const explicit=/^(.*?)\s+\[#([^\]]+)\]$/.exec(split[i]),id=explicit?explicit[2]:split[i];headings.push({id,title:explicit?explicit[1]:split[i]});for(const match of split[i+1].matchAll(/<Prose ids="([^"]+)"\s*\/>/g))for(const id2 of match[1].split(/\s+/))occurrences.push({id:id2,section:id});}
 const front=/^---\n([\s\S]*?)\n---/.exec(raw)[1];receipt.sources.push({route,title:/^title: (.+)$/m.exec(front)[1],description:/^description: (.+)$/m.exec(front)[1],mdxSha256:(await import('node:crypto')).createHash('sha256').update(raw).digest('hex'),headings,ordinary:[]});
 if(routes.includes(route))receipt.website.push({route,claimIds:occurrences.map(row=>row.id),occurrences});
}
const pin=digest(receipt),frozen=[...history.originalHistoricalEntries,...closingSynthesisHeadingEntries()],entries=remapClosingSynthesisCitations(frozen,history,receipt,pin),esc=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

test('B32 immutable original and actual/source-qualified histories reject coordinated or missing evidence',()=>{
 assertClosingSynthesisOriginal(original);assertClosingSynthesisHeadingHistory(history);
 const changed=structuredClone(original);changed.claims[0].text+='changed';assert.throws(()=>assertClosingSynthesisOriginal(changed),/immutable original/);
 for(const alter of [h=>h.addresses.pop(),h=>h.originalHistoricalEntries.pop(),h=>h.views[0].claimIds.reverse(),h=>h.immutableSourceHistory[0].title='new title']){const changed=structuredClone(history);alter(changed);assert.throws(()=>assertClosingSynthesisHeadingHistory(changed),/independently qualified/);}
 assert.equal(frozen.length,106);assert.equal(new Set(frozen.map(entry=>entry.path+'#'+entry.id)).size,106);
});
test('B32 registration consumes only the pair and requires its real four sections',()=>{
 assertClosingSynthesisRegistration(edition);
 for(const alter of [d=>d.units=d.units.filter(row=>row.key!==key),d=>d.units.find(row=>row.key===key).coverage.pop(),d=>d.units.find(row=>row.key===key).sections.reverse(),d=>d.units.push({key:routes[0],source:routes[0],kind:'chapter'})]){const changed=structuredClone(edition);alter(changed);assert.throws(()=>assertClosingSynthesisRegistration(changed),/four-section/);}
});
test('final acceptance stays fail-closed and protects exact22 records plus unchanged scientific closure',()=>{
 assert.throws(()=>assertClosingSynthesisProseAccepted(null),/acceptance is incomplete/);
 assert.throws(()=>assertClosingSynthesisProseAccepted(receipt,null),/acceptance is incomplete/);
 assertClosingSynthesisProseAccepted(receipt,pin);assert.deepEqual(validateClosingSynthesisCoverage(edition,sources,rawCatalog,receipt,pin),[]);
 for(const field of ['text','scope','caveats','premiseIds','evidenceIds']){const changed=structuredClone(rawCatalog),claim=changed.claims.find(row=>row.id===allIds[0]);claim[field]=Array.isArray(claim[field])?['changed']:claim[field]+'changed';assert(validateClosingSynthesisCoverage(edition,sources,changed,receipt,pin).some(error=>/canonical record/.test(error)));const forged=structuredClone(receipt);forged.claims[0]=claim;assert.throws(()=>assertClosingSynthesisProseAccepted(forged,pin),/acceptance is incomplete/);}
 for(const [kind,records] of Object.entries(original.scientificClosure)){const changed=structuredClone(rawCatalog);changed[kind].find(row=>row.id===records[0].id).scope='unreviewed change';assert(validateClosingSynthesisCoverage(edition,sources,changed,receipt,pin).some(error=>/scientific/.test(error)));}
 for(const bad of [sources.get(manuscript).replace(allIds[0],''),sources.get(manuscript).replace(allIds[0],allIds[0]+' '+allIds[0]),sources.get(manuscript).replace('## 覆盖状态','## 错误章节'),sources.get(manuscript)+'\nUnreviewed text']){const changed=new Map(sources);changed.set(manuscript,bad);assert(validateClosingSynthesisCoverage(edition,changed,rawCatalog,receipt,pin).length);}
});
test('all106 historical obligations survive with their own8/14 and old8/8 source scopes',()=>{
 assert.equal(entries.length,106);
 for(const originalEntry of history.originalHistoricalEntries){const mapped=entries.find(entry=>entry.path===originalEntry.path&&entry.id===originalEntry.id);assert(mapped);if(originalEntry.path==='/print')assert.equal(mapped.route,key);}
 const bag=entries.filter(entry=>entry.path==='/print'&&/^print-chapter-34-note-3[56]$/.test(entry.id));assert.equal(bag.length,2);for(const entry of bag){assert.equal(entry.targets[0].route,key);assert(entry.targets[0].id.endsWith('-claim-'+entry.targets[0].claimId));assert.equal(entry.mode,'alias');}
 const webBag=entries.filter(entry=>entry.path==='/docs/book/interpretation-and-limits');assert.equal(webBag.length,2);for(const entry of webBag)assert.equal(entry.targets[0].route,routes[1]);
 for(const src of history.immutableSourceHistory){for(const entry of entries.filter(row=>row.route===(row.path==='/print'?key:src.route)&&row.edition.sourceCommit===src.sourceCommit&&row.scope&&history.originalHistoricalEntries.some(old=>old.path===row.path&&old.id===row.id&&old.route===src.route))){const old=history.originalHistoricalEntries.find(old=>old.path===entry.path&&old.id===entry.id);if(old.targets[0].kind==='chapter'||old.targets[0].kind==='note-group'){assert(entry.scope.text.includes(src.title));assert.deepEqual(entry.scope.targets.filter(target=>target.kind==='note').map(target=>target.claimId),src.claimIds);}}}
 const before=structuredClone(frozen);before.find(entry=>entry.path==='/print'&&entry.targets[0].kind==='note').targets[0].claimId='cl-wrong';assert.throws(()=>remapClosingSynthesisCitations(before,history,receipt,pin),/missing, repeated or changed/);
 assert.throws(()=>remapClosingSynthesisCitations(frozen.slice(1),history,receipt,pin),/missing, repeated or changed/);
 assert.equal(closingSynthesisBookHref(routes[0]+'/'),`#${printUnitAnchor(key)}`);assert.equal(closingSynthesisBookHref(routes[1]+'/#unknown'),routes[1]+'/#unknown');
});

// Render the real annotation component, not a hand-written payload-shaped stub.
const require=createRequire(import.meta.url),mdxRequire=createRequire(require.resolve('fumadocs-mdx')),component={exports:{}};
const compiled=mdxRequire('esbuild').transformSync(await readFile(new URL('../components/evidence.tsx',import.meta.url),'utf8'),{loader:'tsx',jsx:'automatic',format:'cjs'});
new Function('require','module','exports',compiled.code)(name=>name==='@/lib/catalog'?{__esModule:true,default:catalog,getClaimEvidence,isKnownClaim:id=>byId.has(id)}:name==='@/knowledge/research/literature-map.json'?literature:name==='@/knowledge/research/readings.json'?readings:name==='@/scripts/research.mjs'?{publicResearch}:require(name),component,component.exports);
const {ClaimAnnotation}=component.exports;
process.env.__NEXT_TRAILING_SLASH='true';
const prefixFor=(route,print)=>print?printUnitAnchor(route):chapterAnchorPrefix(route);
const externalIds=[...new Set(allIds.flatMap(id=>byId.get(id).premiseIds).filter(id=>!allIds.includes(id)))],externalRoute='/docs/book/fixture-closing-premises';
const referencePages=[{url:key,title,raw:sources.get(manuscript)},{url:externalRoute,title:'外部前提',raw:`<Prose ids="${externalIds.join(' ')}" />`}];
function label(target){const ids=target.path==='/print'?allIds:receipt.website.find(row=>row.route===target.route)?.claimIds??[],name=target.path==='/print'?title:receipt.sources.find(row=>row.route===target.route)?.title;return `《${name}》${target.kind==='note'?`注 ${ids.indexOf(target.claimId)+1}`:target.kind==='heading'&&target.path==='/print'?`·${target.id.slice(printUnitAnchor(target.route).length+1)}`:target.kind==='note-group'?'注释':''}`;}
function context(entry,retained=false){const targets=retained?entry.scope.targets:entry.targets;return `<div ${retained?`data-legacy-scope="${entry.id}"`:`id="${entry.id}" data-legacy-notice=""`}><div class="legacy-citation-context"><p>此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a></p><p>${entry.scope?.text??'可从下列链接查阅这一留存版本对应的内容。'}</p><ul>${targets.map(target=>`<li><a ${retained?'data-legacy-scope-destination':'data-legacy-destination'} href="${citationHref(target,entry.path)}">${label(target)}</a></li>`).join('')}</ul></div></div>`;}
function aliases(route,path,id){return entries.filter(entry=>entry.path===path&&entry.route===route&&entry.mode==='alias'&&entry.targets[0].id===id).map(entry=>`<span id="${entry.id}" data-legacy-for="${id}"><span class="legacy-citation-context">此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a></span></span>`).join('');}
function rendered(){const prefix=printUnitAnchor(key),plan=createChapterNotePlan(sources.get(manuscript),prefix),options=createChapterAnnotationPlan(plan,catalog.claims,createChapterReferenceIndex(referencePages,{print:true}),{print:true}),source=receipt.sources.find(row=>row.route===manuscript),unitEntries=entries.filter(entry=>entry.path==='/print'&&entry.route===key);
 const paragraphs=section=>section.claimIds.map(id=>{const split=splitReferenceTail(byId.get(id).text),note=plan.byClaimId.get(id);return `<p>${esc(split.body)}<span>${esc(split.tail)}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${note.anchor}" aria-label="注 ${note.number}">[${note.number}]</a></sup></span></p>`;}).join('');
 return `<article id="${prefix}" data-reader-route="${key}" data-reader-title="${title}"><h2>${title}</h2><p>${source.description}</p>${sectionPlan.map(section=>`<h3 id="${prefix}-${section.id}">${section.title}</h3>${paragraphs(section)}`).join('')}<section class="chapter-notes"><h3 id="${prefix}-annotations">注释</h3><ol>${plan.notes.map(note=>`<li id="${note.anchor}" data-reader-claim="${note.id}">${aliases(key,'/print',note.anchor)}${renderToStaticMarkup(createElement(ClaimAnnotation,{id:note.id,...options.get(note.id)}))}</li>`).join('')}</ol></section>${unitEntries.filter(entry=>entry.mode==='notice').map(entry=>context(entry)).join('')}</article><article data-reader-route="${externalRoute}" data-reader-title="外部前提">${externalIds.map(id=>`<li id="${printUnitAnchor(externalRoute)}-claim-${id}" data-reader-claim="${id}">外部前提</li>`).join('')}</article>`;}

test('actual22 body, four sections and complete real annotations reject marker-preserving content loss',()=>{
 const html=rendered(),check=value=>validateRenderedClosingSynthesis(htmlParser.parse(value),'/print',catalog,receipt,history,pin);
 assert.deepEqual(check(html),[]);
 const document=htmlParser.parse(html),paragraph=document.querySelector('a[role="doc-noteref"]').closest('p'),note=document.querySelector('[data-reader-claim]'),scope=note.querySelector('.claim-annotation > p'),caveat=note.querySelector('.annotation-limits'),premise=note.querySelector('details li'),source=note.querySelector('.annotation-sources li');
 for(const changed of [html.replace(paragraph.outerHTML,''),html.replace(paragraph.outerHTML,paragraph.outerHTML+paragraph.outerHTML),html.replace(paragraph.outerHTML,paragraph.outerHTML.replace('<p>','<p hidden>')),html.replace(paragraph.outerHTML,paragraph.outerHTML.replace('<p>','<p style="display:none">')),html.replace(esc(byId.get(allIds[0]).text).slice(0,20),'未审正文'),html.replace(scope.outerHTML,''),html.replace(caveat.outerHTML,''),html.replace(premise.outerHTML,''),html.replace(source.outerHTML,''),html.replace(caveat.outerHTML,caveat.outerHTML.replace('<p','<p hidden')),html.replace('>覆盖状态</h3>','>其他标题</h3>'),html.replace('</article>','<div>未审新增论断</div></article>')])assert(check(changed).length);
 const notice=document.querySelector('[data-legacy-notice]');assert(check(html.replace(notice.outerHTML,'')).length);assert(check(html.replace(notice.outerHTML,notice.outerHTML+notice.outerHTML)).length);
});
test('native old group scope text cannot be widened to all22 or detached',()=>{
 for(const entry of entries.filter(row=>row.mode==='retained'&&row.scope&&row.path!=='/print')){const nodeHtml=`<article><section class="chapter-notes"><h2 id="${entry.id}">注释</h2>${context(entry,true)}</section></article>`,check=value=>validateHistoricalScope(readCitationSurface(htmlParser.parse(value),entry.path).ids.get(entry.id),entry);assert.deepEqual(check(nodeHtml),[]);assert(check(nodeHtml.replace(entry.scope.text,'原注释为新章全部22注')).length);assert(check(nodeHtml.replace(context(entry,true),'' )+context(entry,true)).length);}
});

test('dd C36 native web heading keeps its four original propositions rather than the current middle four',()=>{
 const entry=entries.find(row=>row.path===routes[1]&&row.id==='让判断审查和后续证据各有边界');
 assert.equal(entry.mode,'retained');assert(entry.scope.text.includes('数值接起来以后，结论还需要什么'));
 assert.deepEqual(entry.scope.targets.map(row=>row.claimId),['cl-connect-values-stay-specific','cl-connect-useful-without-winner','cl-connect-review-does-not-transfer','cl-connect-next-evidence-at-link']);
 assert(!entry.scope.targets.some(row=>row.claimId==='cl-book-conclusion-conditions'));
 const markup=`<article><h2 id="${entry.id}">判断与审查</h2>${context(entry,true)}</article>`,check=value=>validateHistoricalScope(readCitationSurface(htmlParser.parse(value),entry.path).ids.get(entry.id),entry);
 assert.deepEqual(check(markup),[]);assert(check(markup.replace(context(entry,true),'' )+context(entry,true)).length);
 const widened=markup.replace(citationHref(entry.scope.targets[3],entry.path),citationHref({...entry.scope.targets[3],claimId:'cl-book-conclusion-conditions',id:entry.scope.targets[3].id.replace('cl-connect-next-evidence-at-link','cl-book-conclusion-conditions')},entry.path));assert(check(widened).length);
});

test('raw scientific closure stays exact while real allowlisted runtime carrier records use the established public projection',()=>{
 assert.deepEqual(validateClosingSynthesisCoverage(edition,sources,catalog,receipt,pin,'public'),[]);
 const carrier=original.scientificClosure.sources.find(source=>source.artifact?.bytes!==undefined);
 assert(carrier,'regression requires an actual raw-only carrier byte-count field');
 assert.equal(catalog.sources.find(source=>source.id===carrier.id).artifact.bytes,undefined);
 const changedRaw=structuredClone(rawCatalog);changedRaw.sources.find(source=>source.id===carrier.id).artifact.bytes+=1;
 assert(validateClosingSynthesisCoverage(edition,sources,changedRaw,receipt,pin).some(error=>error.includes(`scientific sources closure differs: ${carrier.id}`)),'raw exact comparison rejects acquisition metadata changes');
 assert.deepEqual(validateClosingSynthesisCoverage(edition,sources,publicCatalog(changedRaw),receipt,pin,'public'),[],'the established projector deliberately omits raw-only acquisition byte counts');
 for(const mutate of [source=>source.title+='未审题名',source=>source.reading.scope+='未审范围',source=>source.artifact.resolvedUrl+='?unreviewed=1']){
  const raw=structuredClone(rawCatalog);mutate(raw.sources.find(source=>source.id===carrier.id));
  assert(validateClosingSynthesisCoverage(edition,sources,raw,receipt,pin).some(error=>error.includes('scientific sources closure differs')));
  assert(validateClosingSynthesisCoverage(edition,sources,publicCatalog(raw),receipt,pin,'public').some(error=>error.includes('scientific sources closure differs')),'unreviewed allowlisted metadata cannot pass the runtime projection comparison');
 }
 const changedPublic=structuredClone(catalog);changedPublic.claims.find(claim=>claim.id===allIds[0]).caveats.push('未审限定');assert(validateClosingSynthesisCoverage(edition,sources,changedPublic,receipt,pin,'public').some(error=>error.includes('canonical record differs')));
 assert.throws(()=>validateClosingSynthesisCoverage(edition,sources,catalog,receipt,pin,'guess'),/explicit raw or public/);
});

test('approved title, description, headings and historical contexts cannot hide descendant text or destination links',()=>{
 const html=rendered(),check=value=>validateRenderedClosingSynthesis(htmlParser.parse(value),'/print',catalog,receipt,history,pin),document=htmlParser.parse(html),unit=document.querySelector(`article[data-reader-route="${key}"]`);
 assert.deepEqual(check(html),[]);
 const titleNode=unit.querySelector('h2'),description=titleNode.nextElementSibling,formal=unit.querySelector('h3'),annotationHeading=unit.querySelector('.chapter-notes h3');
 for(const node of [titleNode,description,formal,annotationHeading]){
  for(const hidden of ['hidden','aria-hidden="true"','style="display:none"']){
   const copy=htmlParser.parse(node.outerHTML).firstChild;copy.set_content(`<span ${hidden}>${copy.innerHTML}</span>`);
   assert(check(html.replace(node.outerHTML,copy.outerHTML)).length,`reject concealed descendant of ${node.tagName}:${node.id}`);
  }
 }
 for(const contextNode of unit.querySelectorAll('[data-legacy-notice],[data-legacy-for]')){
  const paragraph=contextNode.querySelector('p'),link=contextNode.querySelector('a');
  if(paragraph)assert(check(html.replace(paragraph.outerHTML,paragraph.outerHTML.replace('<p>','<p hidden>'))).length,'historical explanatory/version paragraph remains visible');
  assert(link,'qualified context must contain its actual version or destination link');
  assert(check(html.replace(link.outerHTML,link.outerHTML.replace('<a ','<a hidden '))).length,'historical link cannot be concealed while retaining href/text');
 }
 const notice=unit.querySelector('[data-legacy-notice]'),legitimate=notice.outerHTML.replace('<div ','<div class="legacy-citation-target" ');
 assert.deepEqual(check(html.replace(notice.outerHTML,legitimate)),[],'intentional fragment-target CSS class is not an unconditional content concealment attribute');
});

test('an outer ancestor cannot conceal the complete accepted reading unit',()=>{
 const html=rendered(),check=value=>validateRenderedClosingSynthesis(htmlParser.parse(value),'/print',catalog,receipt,history,pin);
 assert.deepEqual(check(`<main>${html}</main>`),[]);
 for(const hidden of ['hidden','aria-hidden="true"','style="display:none"','class="hidden"'])assert(check(`<main ${hidden}>${html}</main>`).length,`reject outer ${hidden}`);
});

// Structural fixture taken from the actual Fumadocs16.17.10 web heading:
// the button icon is aria-hidden, while its exact copy label is screen-reader text.
const actualWebCopyButton='<button aria-live="polite" class="inline-flex not-prose opacity-0 transition-opacity group-hover/heading:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54"></path></svg><span class="sr-only">复制章节链接</span></button>';
test('the actual web heading copy accessibility label is qualified without exempting arbitrary hidden heading text',()=>{
 const raw='<h2 id="先保留数值的来历与覆盖" data-reader-heading-key="先保留数值的来历与覆盖"><a data-card="" href="#先保留数值的来历与覆盖"><span data-reader-number="">37.1</span> <span data-reader-heading-title="">来历与覆盖</span></a>'+actualWebCopyButton+'</h2>',heading=htmlParser.parse(raw).firstChild;
 assert.equal(closingHeadingConcealedText(heading,heading),false);
 for(const changed of [raw.replace('<span data-reader-heading-title','<span hidden data-reader-heading-title'),raw.replace('<a data-card','<a hidden data-card'),raw.replace('class="sr-only">复制章节链接','class="sr-only">未审正文'),raw.replace('<span class="sr-only"','<span hidden class="sr-only"'),raw.replace('aria-live="polite"','hidden aria-live="polite"')]){const node=htmlParser.parse(changed).firstChild;assert.equal(closingHeadingConcealedText(node,node),true);}
 const html=rendered(),prefix=printUnitAnchor(key),formal='<h3 id="'+prefix+'-对象连接">对象连接</h3>',withControl=formal.replace('</h3>',actualWebCopyButton+'</h3>'),check=value=>validateRenderedClosingSynthesis(htmlParser.parse(value),'/print',catalog,receipt,history,pin);
 assert.deepEqual(check(html.replace(formal,withControl)),[]);
 assert(check(html.replace(formal,withControl.replace('class="sr-only">复制章节链接','class="sr-only">隐藏的其他正文'))).length);
});
