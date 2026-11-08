import { getUnitHeadingPlan } from './reader-numbering.mjs';
import { prepareNumberedCaseElement } from './reader-numbering-output.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { publicCatalog,getClaimEvidence } from './knowledge.mjs';
import { publicResearch } from './research.mjs';
import { createChapterNotePlan,createChapterReferenceIndex,createChapterAnnotationPlan,printUnitAnchor,chapterAnchorPrefix,splitReferenceTail } from './reader-book.mjs';
import { citationHref,citationSourceHref } from './reader-citations.mjs';
import { currentEditionKeys,frameworkBookHref } from './reader-edition.mjs';
import { readCitationSurface,validateHistoricalScope,validateReaderOutput } from './reader-surface.mjs';
import { assertJointProductionOriginal,assertJointProductionHeadingHistory,assertJointProductionProseAccepted,assertJointProductionRegistration,assertJointProductionCaseSelection,validateJointProductionArtifactBytes,jointProductionKey as key,jointProductionManuscript as manuscript,jointProductionRoutes as routes,jointProductionTitles as titles,jointProductionHeadingEntries,remapJointProductionCitations,validateJointProductionCoverage,validateJointProductionCaseOutput,validateRenderedJointProduction,jointProductionBookHref,validateJointProductionConsumerOutput } from './reader-joint-production.mjs';
const json=async name=>JSON.parse(await readFile(new URL(`../config/${name}.json`,import.meta.url),'utf8'));
const [original,history,edition,baseline,placements,rawCatalog]=await Promise.all(['joint-production-original','joint-production-heading-history','book-edition','citation-baseline','citation-placements'].map(json).concat(readFile(new URL('../knowledge/catalog.json',import.meta.url),'utf8').then(JSON.parse)));
const catalog=publicCatalog(rawCatalog),byId=new Map(catalog.claims.map(claim=>[claim.id,claim])),hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex'),body=ids=>`<Prose ids="${ids.join(' ')}" />`,header=title=>`---\ntitle: ${title}\ndescription: fixture\n---\n`;
const fixtureSections=original.sections.map(section=>({...section,claimIds:original.occurrences.filter(row=>row.section===section.id).map(row=>row.claimId)}));
const rawSources=new Map(original.sources.map(source=>[source.route,header(source.title)+original.sourceHeadings.filter(heading=>heading.route===source.route).map(heading=>`## ${heading.title}\n${source.occurrences.filter(row=>row.section===heading.id).length?body(source.occurrences.filter(row=>row.section===heading.id).map(row=>row.id)):''}\n${heading.id===original.case.websiteSection?'<TeachingCase id="CASE-JOINT-BATCH" version="1.0.0" />':''}`).join('\n')]));
rawSources.set(manuscript,header(original.title)+fixtureSections.map(section=>`## ${section.id}\n${body(section.claimIds)}\n${section.id===original.case.section?'<TeachingCase id="CASE-JOINT-BATCH" version="1.0.0" />':''}`).join('\n'));
const ordinary={section:null,text:'共同生产的详细论证进一步比较选择所依据的问题与理由。',navigation:[{text:'共同生产的详细论证',href:routes[0]+'/'}]};
rawSources.set('/docs/allocation',header('分配专题')+`[共同生产的详细论证](${routes[0]}/)进一步比较选择所依据的问题与理由。`);
// Explicit fixture digest only tests API behavior; this is never production acceptance.
const fixture={status:'reviewed',title:original.title,claims:fixtureSections.flatMap(section=>section.claimIds).map(id=>rawCatalog.claims.find(claim=>claim.id===id)),sections:fixtureSections,website:original.sources.map(source=>({route:source.route,claimIds:source.claimIds,occurrences:source.occurrences})),sources:[...original.sources.map(source=>({route:source.route,title:source.title,description:'fixture',mdxSha256:hash(rawSources.get(source.route)),ordinary:[],navigation:[{href:'/docs/book/',title:'相邻章',description:'导语'}]})),{route:manuscript,title:original.title,description:'fixture',mdxSha256:hash(rawSources.get(manuscript)),ordinary:[]},{route:'/docs/allocation',title:'分配专题',description:'fixture',mdxSha256:hash(rawSources.get('/docs/allocation')),ordinary:[ordinary]}]};
let fixturePin;
const frozen=[...original.originalHistoricalEntries,...jointProductionHeadingEntries()],entries=remapJointProductionCitations(frozen);
const compact=text=>text.replace(/\s+/g,''),esc=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

const require=createRequire(import.meta.url),mdxRequire=createRequire(require.resolve('fumadocs-mdx'));
async function actualComponent(file,bindings){const component={exports:{}},code=mdxRequire('esbuild').transformSync(await readFile(new URL(`../components/${file}`,import.meta.url),'utf8'),{loader:'tsx',jsx:'automatic',format:'cjs',sourcefile:file}).code;new Function('require','module','exports',code)(name=>name==='server-only'?{}:name in bindings?bindings[name]:require(name),component,component.exports);return component.exports;}
const actualNumberedHeading=await actualComponent('numbered-heading.tsx',{});
const {JointProductionCase:RealJointProductionCase}=await actualComponent('joint-production-case.tsx',{'./numbered-heading':actualNumberedHeading});
function JointProductionCase({print=false}){return createElement(RealJointProductionCase,{print,numbering:getUnitHeadingPlan(print?'book':'web',print?key:routes[0]).filter(row=>row.type==='case')});}

// Scoped fixture acceptance deliberately uses a caller-supplied test digest only.
const fixtureCases=Object.fromEntries([false,true].map(print=>{
 const node=htmlParser.parse(renderToStaticMarkup(createElement(JointProductionCase,{print}))).firstChild;
 const prepared=prepareNumberedCaseElement(node,print?'book':'web',print?key:routes[0]);assert.deepEqual(prepared.errors,[]);
 return [print?'book':'web',prepared.element];
}));
const dispositionTargets=[[],['cl-joint-question'],['cl-joint-typed-inventory','cl-joint-partial-inventory'],['cl-joint-mass-partition','cl-joint-sales-partition'],['cl-joint-what-additivity-proves','cl-joint-rival-criteria'],['cl-joint-fixed-basket','cl-joint-positive-routes'],['cl-joint-partial-use'],['cl-joint-partial-balances'],['cl-joint-partial-balances'],['cl-joint-partial-inventory'],['cl-joint-cancellation'],['cl-joint-negative-meaning'],['cl-joint-double-credit'],['cl-joint-double-credit'],['cl-joint-answer'],[]];
fixture.caseSelection={schemaVersion:1,status:'reviewed',originalCaseDigest:hash(original.case),inputSha256:original.case.inputSha256,componentSha256:hash(await readFile(new URL('../components/joint-production-case.tsx',import.meta.url),'utf8')),paragraphDispositions:['retain','retain','retain','compress','move','compress','retain','move','move','move','move','move','move','compress','move','retain'].map((action,index)=>({id:`P${index+1}`,action,targetClaimIds:dispositionTargets[index],rationale:'Test fixture for bounded editorial disposition enforcement.'})),headingDispositions:original.case.headings.map((heading,index)=>({index,action:index<3?'retain':'move',targetClaimIds:index<3?[]:index===3?['cl-joint-partial-balances','cl-joint-partial-inventory','cl-joint-cancellation']:['cl-joint-double-credit'],rationale:'Test fixture for explicit retained and moved headings.'})),assumptions:fixtureCases.web.querySelectorAll('li').map(item=>item.text),currentPresentation:Object.fromEntries(Object.entries(fixtureCases).map(([view,node])=>[view,{text:node.text,links:node.querySelectorAll('a').map(link=>({text:link.text,href:link.getAttribute('href')})),headings:node.querySelectorAll('h1,h2,h3,h4,h5,h6').map(heading=>({tag:heading.tagName,id:heading.id??'',text:heading.text}))}]))};
fixturePin=hash(fixture);
const [literature,readingLedger]=await Promise.all(['literature-map','readings'].map(name=>readFile(new URL(`../knowledge/research/${name}.json`,import.meta.url),'utf8').then(JSON.parse)));
const {ClaimAnnotation}=await actualComponent('evidence.tsx',{'@/lib/catalog':{__esModule:true,default:catalog,getClaimEvidence,isKnownClaim:id=>byId.has(id)},'@/knowledge/research/literature-map.json':literature,'@/knowledge/research/readings.json':readingLedger,'@/scripts/research.mjs':{publicResearch}});
process.env.__NEXT_TRAILING_SLASH='true';
const bookIds=fixtureSections.flatMap(section=>section.claimIds),webPages=original.sources.map(source=>({url:source.route,title:source.title,raw:rawSources.get(source.route)})),bookPages=[{url:key,title:original.title,raw:rawSources.get(manuscript),printOrder:0}];
function annotationHtml(route,ids,print){const prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),plan=createChapterNotePlan(body(ids),prefix),options=createChapterAnnotationPlan(plan,catalog.claims,createChapterReferenceIndex(print?bookPages:webPages,{print}),{print});return ids.map(id=>`<li id="${prefix}-claim-${id}" data-reader-claim="${id}">${renderToStaticMarkup(createElement(ClaimAnnotation,{id,...options.get(id)}))}</li>`).join('');}
function paragraph(id,route,ids,print){const {body:text,tail}=splitReferenceTail(byId.get(id).text),prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),number=ids.indexOf(id)+1;return `<p>${esc(text)}<span>${esc(tail)}<sup><a role="doc-noteref" aria-label="注 ${number}" data-reader-reference="${id}" href="#${prefix}-claim-${id}">[${number}]</a></sup></span></p>`;}
const label=(target,print)=>{const src=original.sources.find(source=>source.route===target.route),title=print?original.title:src.title,ids=print?bookIds:src.claimIds;if(target.kind==='note')return `《${title}》注 ${ids.indexOf(target.claimId)+1}`;const section=print?titles.find(title=>target.id.endsWith('-'+title)):null;return `《${title}》${section?'·'+section:target.kind==='note-group'?'注释':''}`;};
function context(entry,print,scope=false){const targets=scope?entry.scope.targets:entry.targets;return `<div ${scope?`data-legacy-scope="${entry.id}"`:`id="${entry.id}" data-legacy-notice=""`} class="${scope?'legacy-citation-context':'legacy-citation-target'}"><div class="${scope?'':'legacy-citation-context'}"><p>此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a></p><p>${entry.scope?.text??'可从下列链接查阅这一留存版本对应的内容。'}</p><ul>${targets.map(target=>`<li><a ${scope?'data-legacy-scope-destination':'data-legacy-destination'} href="${citationHref(target,entry.path)}">${label(target,print)}</a></li>`).join('')}</ul></div></div>`;}
function rendered(print=true,webRoute=routes[0]){const route=print?key:webRoute,prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),source=original.sources.find(source=>source.route===route),ids=print?bookIds:source.claimIds,title=print?original.title:source.title,unitEntries=entries.filter(entry=>entry.path===(print?'/print':route)&&entry.route===route),sectionRows=print?fixtureSections:original.sourceHeadings.filter(heading=>heading.route===route).map(heading=>({id:heading.id,title:heading.title,claimIds:source.occurrences.filter(row=>row.section===heading.id).map(row=>row.id)}));
 const markup=`<article ${print?`id="${prefix}"`:''} data-reader-route="${route}" data-reader-title="${title}">${print?'':'<div>生命周期评价的前世今生</div>'}<h${print?2:1}>${title}</h${print?2:1}><p>fixture</p>${sectionRows.map(section=>`<h${print?3:2} id="${print?prefix+'-':''}${section.id}">${section.title??section.id}</h${print?3:2}>${section.claimIds.map(id=>paragraph(id,route,ids,print)).join('')}${section.id===(print?original.case.section:original.case.websiteSection)?renderToStaticMarkup(createElement(JointProductionCase,{print})):''}`).join('')}<section class="chapter-notes"><h${print?3:2} id="${prefix}-annotations">注释</h${print?3:2}>${unitEntries.filter(entry=>entry.mode==='retained'&&entry.scope&&entry.id===prefix+'-annotations').map(entry=>context(entry,print,true)).join('')}<ol>${annotationHtml(route,ids,print)}</ol></section>${unitEntries.filter(entry=>entry.mode==='notice').map(entry=>context(entry,print)).join('')}${print?'':'<div class="docs-pagination"><a href="/docs/book/">相邻章导语</a></div>'}</article>`;
 return markup+(print?`<article data-reader-route="/docs/allocation"><p><a href="#${printUnitAnchor(key)}">共同生产的详细论证</a>进一步比较选择所依据的问题与理由。</p></article>`:'');}
const consumers=[
 {route:'/docs/book/market-boundaries-and-response',title:'市场响应测试',ids:['cl-market-question','cl-market-closing']},
 {route:'/docs/book/connecting-objects-references-and-time',title:'对象连接测试',ids:['cl-connect-prospective-two-questions']},
 {route:'/docs/book/from-connected-results-to-conditional-judgment',title:'条件判断测试',ids:['cl-connect-values-stay-specific','cl-connect-next-evidence-at-link']},
];
const extraPremises=[...new Set(consumers.flatMap(consumer=>consumer.ids.flatMap(id=>byId.get(id).premiseIds)))].filter(id=>!bookIds.includes(id));
const extraRoute='/docs/book/fixture-other-premises';
bookPages.push(...consumers.map(consumer=>({url:consumer.route,title:consumer.title,raw:body(consumer.ids)})),{url:extraRoute,title:'其他前提测试',raw:body(extraPremises)});
function consumerMarkup(){return consumers.map(consumer=>`<article data-reader-route="${consumer.route}" data-reader-title="${consumer.title}"><section class="chapter-notes"><ol>${annotationHtml(consumer.route,consumer.ids,true)}</ol></section></article>`).join('')+`<article data-reader-route="${extraRoute}" data-reader-title="其他前提测试">${extraPremises.map(id=>`<li id="${printUnitAnchor(extraRoute)}-claim-${id}" data-reader-claim="${id}">测试定位</li>`).join('')}</article>`;}

// Source and remapper tests do not require any invented final production receipt.
test('B10 original36,29/7 scopes and fourteen independently captured addresses are separately pinned',()=>{
 assertJointProductionOriginal(original);assertJointProductionHeadingHistory(history);assert.deepEqual(original.sources.map(source=>source.claimIds.length),[29,7]);assert.equal(original.originalHistoricalEntries.length,180);assert.equal(history.addresses.length,14);assert.equal(original.case.claimIds.length,20);
 for(const change of [copy=>copy.sources[0].claimIds.pop(),copy=>copy.occurrences[0].section='别处',copy=>copy.originalHistoricalEntries[0].edition.sourceDate='1900-01-01']){const copy=structuredClone(original);change(copy);assert.throws(()=>assertJointProductionOriginal(copy),/qualified cf50f01/);}
 for(const change of [copy=>copy.addresses.pop(),copy=>copy.addresses[0].id='other',copy=>copy.manifestSha256='0'.repeat(64)]){const copy=structuredClone(history);change(copy);assert.throws(()=>assertJointProductionHeadingHistory(copy),/fourteen actual/);}
});
test('B10 registered book/source coverage is mandatory independently of coordinated source removal',()=>{
 assertJointProductionRegistration(edition);const available=edition.units.flatMap(unit=>[unit.source,...unit.coverage??[]]);assert.equal(currentEditionKeys(edition,available,baseline,placements).length,41);
 for(const change of [copy=>copy.units=copy.units.filter(unit=>unit.key!==key),copy=>copy.units.find(unit=>unit.key===key).coverage.pop(),copy=>copy.units.find(unit=>unit.key===key).source=routes[0],copy=>copy.units.find(unit=>unit.key===key).sections.reverse()]){const copy=structuredClone(edition);change(copy);assert.throws(()=>currentEditionKeys(copy,available.filter(route=>route!==manuscript),baseline,placements),/B10/);}
 assert.throws(()=>currentEditionKeys(edition,[...available,'/monograph/unknown'],baseline,placements),/no current book registration/);
});
test('B10 remapping preserves194 exact affected meanings, original editions and29/7 source subsets',()=>{
 const untouched={route:'/unrelated',path:'/unrelated',id:'same',targets:[{route:'/unrelated',path:'/unrelated',id:'same',kind:'heading'}],mode:'retained',edition:{sourceCommit:'fixture',sourceDate:'1900-01-01'}};assert.deepEqual(remapJointProductionCitations([...frozen,untouched]).at(-1),untouched);
 assert.equal(entries.length,194);assert.equal(new Set(entries.map(entry=>entry.path+'#'+entry.id)).size,194);
 for(const fixed of frozen){const entry=entries.find(entry=>entry.path===fixed.path&&entry.id===fixed.id);assert.deepEqual(entry.edition,fixed.edition);if(entry.scope){const source=original.sources.find(source=>source.route===fixed.route);assert.deepEqual((entry.mode==='retained'?entry.scope.targets:entry.targets).filter(target=>target.kind==='note').map(target=>target.claimId),source.claimIds);assert(entry.scope.text.includes(source.title));}if(fixed.targets[0].kind==='note')assert.deepEqual(entry.targets.map(target=>target.claimId),fixed.targets.map(target=>target.claimId));}
 for(const entry of frozen)assert.throws(()=>remapJointProductionCitations(frozen.filter(other=>other!==entry)),/missing, repeated or changed/);
 const changed=structuredClone(frozen);changed[0].targets[0].id='wrong';assert.throws(()=>remapJointProductionCitations(changed),/missing, repeated or changed/);
 for(const path of [routes[0],'/print']){const entry=entries.find(entry=>entry.path===path&&entry.id===original.case.headingId);assert.equal(entry.mode,'retained');assert.equal(entry.targets[0].route,path==='/print'?key:routes[0]);}
});
test('B10 final prose acceptance is separately pinned and coordinated record/source/receipt changes cannot pass',()=>{
 assert.throws(()=>assertJointProductionProseAccepted(null),/acceptance is incomplete/);assert.throws(()=>assertJointProductionProseAccepted(fixture),/acceptance is incomplete|independent reviewed/);assertJointProductionProseAccepted(fixture,fixturePin);assert.deepEqual(validateJointProductionCoverage(edition,rawSources,original,rawCatalog,fixture,fixturePin),[]);
 for(const property of ['text','scope','caveats','premiseIds','evidenceIds']){const changed=structuredClone(rawCatalog),record=changed.claims.find(claim=>claim.id===bookIds[0]);record[property]=Array.isArray(record[property])?['changed']:record[property]+'changed';assert(validateJointProductionCoverage(edition,rawSources,original,changed,fixture,fixturePin).length);const forged=structuredClone(fixture);forged.claims[0]=record;assert.throws(()=>assertJointProductionProseAccepted(forged,fixturePin),/independent reviewed/);}
 const changed=new Map(rawSources);changed.set(manuscript,changed.get(manuscript)+body([bookIds[0]]));assert(validateJointProductionCoverage(edition,changed,original,rawCatalog,fixture,fixturePin).length);
});
test('real compiled joint widget rejects ID-only/table/assumption/download preservation failures and print hierarchy errors',()=>{
 for(const print of [false,true]){const html=renderToStaticMarkup(createElement(JointProductionCase,{print})),check=value=>validateJointProductionCaseOutput(htmlParser.parse(`<article>${value}</article>`).querySelector('article'),{print,section:print?original.case.section:original.case.websiteSection,prose:fixture,independentDigest:fixturePin});assert.deepEqual(check(html),[]);const node=htmlParser.parse(html).querySelector('section'),table=node.querySelector('table'),assumption=node.querySelector('.teaching-case-conditions li'),download=node.querySelector('a');for(const changed of [html.replace(table.outerHTML,''),html.replace(assumption.outerHTML,''),html.replace(download.outerHTML,''),html+html,html.replace('data-case-version="1.0.0"','data-case-version="0.0.0"'),html.replace('aria-labelledby="joint-batch-case-heading"','aria-labelledby="missing"')])assert(check(changed).length);}
});
test('ordinary allocation link uses the actual book anchor while unknown fine-page fragments keep meaning',()=>{
 assert.equal(jointProductionBookHref(routes[0]+'/'),`#${printUnitAnchor(key)}`);assert.equal(frameworkBookHref(routes[0]+'/', '/docs/allocation'),`#${printUnitAnchor(key)}`);assert.equal(jointProductionBookHref(routes[0]+'/#ambiguous'),routes[0]+'/#ambiguous');
});

test('actual widget subheadings, table captions and header roles cannot be replaced while preserving text',()=>{
 for(const print of [false,true]){
  const html=renderToStaticMarkup(createElement(JointProductionCase,{print})),sub=print?'h6':'h4',check=value=>validateJointProductionCaseOutput(htmlParser.parse(`<article>${value}</article>`).querySelector('article'),{print,section:print?original.case.section:original.case.websiteSection,prose:fixture,independentDigest:fixturePin});
  assert.deepEqual(check(html),[]);
  for(const tag of ['p','h2',print?'h4':'h6']){const heading=htmlParser.parse(html).querySelector(sub),changed=heading.outerHTML.replace(new RegExp(`^<${sub}`),`<${tag}`).replace(new RegExp(`</${sub}>$`),`</${tag}>`);assert(check(html.replace(heading.outerHTML,changed)).length,`${print?'print':'web'} subheadings as ${tag}`);}
  assert(check(html.replaceAll('<caption>','<p>').replaceAll('</caption>','</p>')).length);
  assert(check(html.replaceAll('<th ','<td ').replaceAll('</th>','</td>')).length);
 }
});

test('case selection fails closed and requires complete reviewed original-to-current dispositions',()=>{
 for(const mutate of [
  copy=>delete copy.caseSelection,copy=>copy.caseSelection.status='pending',copy=>copy.caseSelection.inputSha256='0'.repeat(64),
  copy=>copy.caseSelection.originalCaseDigest='0'.repeat(64),copy=>copy.caseSelection.componentSha256='pending',
  copy=>copy.caseSelection.paragraphDispositions.pop(),copy=>copy.caseSelection.paragraphDispositions.reverse(),
  copy=>copy.caseSelection.paragraphDispositions[7].action='retain',copy=>copy.caseSelection.paragraphDispositions[7].targetClaimIds=[],
  copy=>copy.caseSelection.paragraphDispositions[7].targetClaimIds=['cl-allocation-reading-a-rule'],
  copy=>copy.caseSelection.headingDispositions.pop(),copy=>copy.caseSelection.headingDispositions[4].rationale='',
  copy=>copy.caseSelection.assumptions.pop(),copy=>copy.caseSelection.assumptions[0]+='变更',
  copy=>copy.caseSelection.currentPresentation.web.headings.push(original.case.headings[3]),
  copy=>copy.caseSelection.currentPresentation.book.links[0].href='#wrong',
 ]){const copy=structuredClone(fixture);mutate(copy);assert.throws(()=>assertJointProductionProseAccepted(copy,hash(copy)),/B10/);}
 const node=htmlParser.parse(`<article>${renderToStaticMarkup(createElement(JointProductionCase))}</article>`).firstChild;
 assert.throws(()=>validateJointProductionCaseOutput(node),/acceptance is incomplete/);
 const missing=structuredClone(fixture);delete missing.caseSelection;
 assert.throws(()=>validateJointProductionCaseOutput(node,{prose:missing,independentDigest:hash(missing)}),/caseSelection/);
 assertJointProductionCaseSelection(fixture);
});

test('selected case rejects hidden conditions, altered context, links, table units and returned duplicate narrative',()=>{
 for(const print of [false,true]){
  const html=renderToStaticMarkup(createElement(JointProductionCase,{print})),doc=htmlParser.parse(html),node=doc.firstChild;
  const check=value=>validateJointProductionCaseOutput(htmlParser.parse(`<article>${value}</article>`).firstChild,{print,section:print?original.case.section:original.case.websiteSection,prose:fixture,independentDigest:fixturePin});
  assert.deepEqual(check(html),[]);
  const conditions=node.querySelector('.teaching-case-conditions');
  for(const item of conditions.querySelectorAll('li'))for(const replacement of ['',item.outerHTML.replace(item.text,item.text+'变更'),`<li hidden>${item.text}</li>`,`<li style="display:none">${item.text}</li>`])assert(check(html.replace(item.outerHTML,replacement)).length);
  for(const replacement of [`<details>${conditions.outerHTML}</details>`,conditions.outerHTML.replace('teaching-case-conditions','teaching-case-conditions sr-only')])assert(check(html.replace(conditions.outerHTML,replacement)).length);
  for(const paragraph of node.querySelectorAll('p'))assert(check(html.replace(paragraph.outerHTML,'')).length,'each retained identity/price/reference/q/scope/navigation/download paragraph is required');
  for(const link of node.querySelectorAll('a'))for(const replacement of ['',link.outerHTML.replace(link.getAttribute('href'),'#wrong'),link.outerHTML.replace(link.text,'错误标签')])assert(check(html.replace(link.outerHTML,replacement)).length);
  for(const table of node.querySelectorAll('table')){
   const cell=table.querySelector('td');assert(check(html.replace(cell.outerHTML,cell.outerHTML.replace(cell.text,cell.text+'0'))).length);
   const caption=table.querySelector('caption');assert(check(html.replace(caption.outerHTML,caption.outerHTML.replace(caption.text,'错误单位'))).length);
   const header=table.querySelector('th');assert(check(html.replace(header.outerHTML,header.outerHTML.replace('scope="col"','scope="row"'))).length);
  }
  const duplicate='半利用时，联合活动与补供活动应重建全部路线，不能再把残余当作物理清单。';
  for(const added of [`<p>${duplicate}</p>`,`<details><summary>计算过程</summary><p>${duplicate}</p></details>`,`<div hidden>${duplicate}</div>`,`<div class="print-only">${duplicate}</div>`])assert(check(html.replace('</section>',added+'</section>')).length);
 }
});

test('actual web/book case roots and containing wrappers cannot conceal the accepted case',()=>{
 for(const print of [false,true]){
  const html=renderToStaticMarkup(createElement(JointProductionCase,{print}));
  const check=value=>validateJointProductionCaseOutput(htmlParser.parse(`<article>${value}</article>`).firstChild,{print,section:print?original.case.section:original.case.websiteSection,prose:fixture,independentDigest:fixturePin});
  assert.deepEqual(check(html),[]);
  assert.deepEqual(check(`<div>${html}</div>`),[]);
  for(const attributes of ['hidden','aria-hidden="true"','style="display:none"']){
   assert(check(html.replace('<section ',`<section ${attributes} `)).length,`${print?'book':'web'} root ${attributes}`);
   assert(check(`<div ${attributes}>${html}</div>`).length,`${print?'book':'web'} original ancestor ${attributes}`);
   const unit=htmlParser.parse(`<article ${attributes}>${html}</article>`).firstChild;
   assert(validateJointProductionCaseOutput(unit,{print,prose:fixture,independentDigest:fixturePin}).length,`${print?'book':'web'} unit ${attributes}`);
  }
  // Exercise the already semantic output too; it has no numbering clone step.
  const semantic=fixtureCases[print?'book':'web'].outerHTML;
  assert.deepEqual(check(semantic),[]);
  for(const attributes of ['hidden','aria-hidden="true"','style="display:none"'])assert(check(semantic.replace('<section ',`<section ${attributes} `)).length);
 }
});

test('fine-page and print body headings must be the complete reviewed roster, not extra prose exemptions',()=>{
 for(const print of [false,true])for(const route of print?[routes[0]]:routes){
  const html=rendered(print,route),check=value=>validateRenderedJointProduction(htmlParser.parse(value),print?'/print':route,original,catalog,fixture,fixturePin);
  for(const tag of ['h1','h2','h3','h4','h5','h6']){
   const changed=html.replace('<section class="chapter-notes">',`<${tag} id="unreviewed-extra">未经审阅的新结论</${tag}><section class="chapter-notes">`);
   assert(check(changed).length,`${print?'print':route} extra ${tag}`);
  }
 }
});
test('production B10 output admission rejects each missing receipt even after coordinated registration/source/output deletion',async()=>{
 const root=await mkdtemp(join(tmpdir(),'reader-b10-admission-'));try{const out=join(root,'out'),config=join(root,'config');await mkdir(out);await mkdir(config);const configRoot=new URL('../config/',import.meta.url);for(const file of await readdir(configRoot))if(file.endsWith('.json')&&file!=='joint-production-prose-accepted.json')await copyFile(new URL(file,configRoot),join(config,file));for(const missing of [null,'original','heading-history']){for(const name of ['original','heading-history']){const file=`joint-production-${name}.json`;if(name===missing)await rm(join(config,file),{force:true});else await copyFile(new URL(file,configRoot),join(config,file));}await assert.rejects(validateReaderOutput(out),error=>/independent B10/.test(error.message)&&error.message.includes('joint-production-prose-accepted.json')&&(!missing||error.message.includes(`joint-production-${missing}.json`)));}}finally{await rm(root,{recursive:true,force:true});}
});
// Actual rendered wrapper tests use real ClaimAnnotation and JointProductionCase.
test('actual B10 website body/notes/widget/ordinary text are checked independently of source identity',()=>{
 for(const route of routes){const html=rendered(false,route),check=text=>validateRenderedJointProduction(htmlParser.parse(text),route,original,catalog,fixture,fixturePin);assert.deepEqual(check(html),[]);const id=original.sources.find(source=>source.route===route).claimIds[0],node=htmlParser.parse(html).querySelector('a[role="doc-noteref"]').closest('p');for(const changed of [html.replace(node.outerHTML,''),html.replace(node.outerHTML,node.outerHTML+node.outerHTML),html.replace(esc(byId.get(id).text).slice(0,20),'删掉实际论述'),html.replace('</article>','<p>未审文字</p></article>')])assert(check(changed).length);}
});


test('actual B10 print has one book plan, exact legacy subsets and seven current outside premise links',()=>{
 const html=rendered()+consumerMarkup(),check=text=>validateRenderedJointProduction(htmlParser.parse(text),'/print',original,catalog,fixture,fixturePin);
 assert.deepEqual(check(html),[]);
 const parsed=htmlParser.parse(html),unit=parsed.querySelector(`article[data-reader-route="${key}"]`);
 for(const entry of entries.filter(entry=>entry.path==='/print'&&entry.scope)) {
   const notice=unit.querySelector(`[id="${entry.id}"]`);assert(notice);
   const link=notice.querySelector('a[data-legacy-destination]');
   for(const changed of [html.replace(notice.outerHTML,''),html.replace(link.outerHTML,''),html.replace(notice.outerHTML,notice.outerHTML.replace(entry.scope.text,'扩大后的全章注释')),html.replace(notice.outerHTML,notice.outerHTML.replace(entry.edition.sourceCommit,'0'.repeat(40)))])assert(check(changed).length);
 }
 const links=parsed.querySelectorAll('article[data-reader-route]').filter(article=>consumers.some(consumer=>consumer.route===article.getAttribute('data-reader-route'))).flatMap(article=>article.querySelectorAll('a').filter(link=>link.getAttribute('href')?.startsWith(`#${printUnitAnchor(key)}-claim-`)));
 assert.equal(links.length,7);
 for(const link of links)for(const changed of [link.outerHTML.replace(link.text,'《旧章》注 999'),link.outerHTML.replace(link.getAttribute('href'),`#${printUnitAnchor(key)}-claim-wrong`)])assert(check(html.replace(link.outerHTML,changed)).length);
 const navigation=parsed.querySelector('article[data-reader-route="/docs/allocation"] a');
 for(const changed of [html.replace(navigation.outerHTML,''),html.replace(navigation.outerHTML,navigation.outerHTML.replace(navigation.getAttribute('href'),routes[0]+'/')),html.replace(navigation.outerHTML,navigation.outerHTML.replace(navigation.text,'旧题'))])assert(check(changed).length);
 const caseNode=unit.querySelector('.teaching-case');assert(check(html.replace(caseNode.outerHTML,'')).length);
});

test('actual B10 scholarly notes reject marker-preserving loss of scope,caveat,source,carrier,premise and input',()=>{
 for(const route of routes){const html=rendered(false,route),check=text=>validateRenderedJointProduction(htmlParser.parse(text),route,original,catalog,fixture,fixturePin),doc=htmlParser.parse(html);
  for(const note of doc.querySelectorAll('[data-reader-claim]')) {
   const annotation=note.querySelector('.claim-annotation'),scope=annotation.childNodes.find(node=>node.tagName==='P'),nodes=[annotation,scope,annotation.querySelector('.annotation-limits'),annotation.querySelector('.annotation-sources li'),annotation.querySelector('.source-reading'),annotation.querySelector('details li a'),...annotation.querySelectorAll('a').filter(link=>link.getAttribute('href')?.startsWith('/downloads/cases/'))].filter(Boolean);
   for(const node of nodes){const changed=html.replace(node.outerHTML,'');assert(changed.includes(`id="${note.id}"`));assert(check(changed).length);}
  }
 }
});

test('reviewed section redistribution preserves frozen originals and uses multi-target native heading notices',()=>{
 const changed=structuredClone(fixture),moving=changed.sections[0].claimIds.shift();changed.sections[1].claimIds.unshift(moving);changed.claims=changed.sections.flatMap(section=>section.claimIds).map(id=>rawCatalog.claims.find(claim=>claim.id===id));changed.mappingChanges=[{claimId:moving,from:titles[0],to:titles[1],rationale:'Fixture tests explicit reviewed redistribution, not publication acceptance.'}];
 const changes=original.occurrences.flatMap(row=>{const to=changed.sections.find(section=>section.claimIds.includes(row.claimId)).id;return to===row.section?[]:[{claimId:row.claimId,from:row.section,to,rationale:'Fixture tests explicit reviewed redistribution, not publication acceptance.'}];});changed.mappingChanges=changes;
 assertJointProductionProseAccepted(changed,hash(changed));
 const remapped=remapJointProductionCitations(frozen,original,history,changed,hash(changed)),source=original.sourceHeadings.find(heading=>heading.claimIds.includes(moving)),entry=remapped.find(entry=>entry.path==='/print'&&entry.id===`${printUnitAnchor(source.route)}-${source.id}`);
 assert.equal(entry.mode,'notice');assert.deepEqual(entry.targets.filter(target=>target.kind==='note').map(target=>target.claimId),source.claimIds);assert.equal(entry.targets.filter(target=>target.kind==='heading').length,2);
 const missing=structuredClone(changed);missing.mappingChanges=[];assert.throws(()=>assertJointProductionProseAccepted(missing,hash(missing)),/explicit reviewed dispositions/);
});

test('complete4116-address composition preserves all4102 earlier histories and fourteen actual current native addresses',async()=>{
 const {createLegacyCitationEntries,createCanonicalCitationEntries}=await import('./reader-citations.mjs');
 const {publishedHeadingEntries,remapBookCitations}=await import('./reader-edition.mjs');
 const {cleanerProductionHeadingEntries,remapCleanerProductionCitations}=await import('./reader-cleaner-production.mjs');
 const {functionalReferenceHeadingEntries,remapFunctionalReferenceCitations}=await import('./reader-functional-reference.mjs');
 const {processNetworkHeadingEntries,remapProcessNetworkCitations}=await import('./reader-process-network.mjs');
 const {exchangeSemanticsHeadingEntries,remapExchangeSemanticsCitations}=await import('./reader-exchange-semantics.mjs');
 const {hybridInventoryHeadingEntries,remapHybridInventoryCitations}=await import('./reader-hybrid-inventory.mjs');
 const configs=Object.fromEntries(await Promise.all(['citation-history','framework-accepted','framework-heading-history','cleaner-production-accepted','cleaner-production-heading-history','functional-reference-accepted','functional-reference-heading-history','process-network-accepted','process-network-heading-history','hybrid-inventory-accepted','hybrid-inventory-heading-history'].map(async name=>[name,await json(name)]))),get=name=>configs[name];
 const historicRoutes=[...baseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route),...placements.frontMatter,...placements.printAdditions.map(unit=>unit.route)],history=get('citation-history');
 const raw=[...createLegacyCitationEntries(baseline,placements,history.pages),...createCanonicalCitationEntries(history,placements,historicRoutes),...publishedHeadingEntries(get('framework-heading-history')),...cleanerProductionHeadingEntries(get('cleaner-production-heading-history')),...functionalReferenceHeadingEntries(get('functional-reference-heading-history')),...processNetworkHeadingEntries(get('process-network-heading-history')),...exchangeSemanticsHeadingEntries(),...hybridInventoryHeadingEntries(get('hybrid-inventory-heading-history'))];
 const before=remapHybridInventoryCitations(remapExchangeSemanticsCitations(remapProcessNetworkCitations(remapFunctionalReferenceCitations(remapCleanerProductionCitations(remapBookCitations(raw,edition,get('framework-accepted'),placements),get('cleaner-production-accepted'),get('cleaner-production-heading-history')),get('functional-reference-accepted'),get('functional-reference-heading-history')),get('process-network-accepted'),get('process-network-heading-history'))),get('hybrid-inventory-accepted'),get('hybrid-inventory-heading-history'));
 assert.equal(before.length,4102);const after=remapJointProductionCitations([...before,...jointProductionHeadingEntries()]);assert.equal(after.length,4116);assert.equal(new Set(after.map(entry=>entry.path+'#'+entry.id)).size,4116);
 for(const unchanged of before.filter(entry=>!routes.includes(entry.route)))assert.deepEqual(after.find(entry=>entry.path===unchanged.path&&entry.id===unchanged.id),unchanged);
});

test('the ordinary allocation cross-reference remains in its reviewed own section on both surfaces',()=>{
 const section='把格式连接与方法放在一起比较',changed=structuredClone(fixture);changed.sources.find(source=>source.route==='/docs/allocation').ordinary[0].section=section;const pin=hash(changed);
 for(const print of [false,true]){
  const prefix=print?printUnitAnchor('/docs/allocation')+'-':'',tag=print?'h3':'h2';
  const paragraph=`<p><a href="${print?'#'+printUnitAnchor(key):routes[0]+'/'}">共同生产的详细论证</a>进一步比较选择所依据的问题与理由。</p>`;
  const allocation=`<article data-reader-route="/docs/allocation"><${tag} id="${prefix}${section}">${section}</${tag}>${paragraph}</article>`;
  const html=print?rendered().replace(/<article data-reader-route="\/docs\/allocation">[\s\S]*?<\/article>$/,allocation)+consumerMarkup():allocation;
  const check=value=>validateRenderedJointProduction(htmlParser.parse(value),print?'/print':'/docs/allocation',original,catalog,changed,pin);
  assert.deepEqual(check(html),[]);
  const moved=html.replace(paragraph,`<${tag} id="${prefix}another-section">其他一节</${tag}>${paragraph}`);
  assert(check(moved).some(error=>error.includes('ordinary paragraph has wrong section')));
 }
});


test('CLI case-byte qualification binds the reviewed component and unchanged raw input', async () => {
  const [component,input] = await Promise.all([
    readFile(new URL('../components/joint-production-case.tsx',import.meta.url)),
    readFile(new URL('../knowledge/cases/joint-batch-v1.json',import.meta.url)),
  ]);
  assert.deepEqual(validateJointProductionArtifactBytes(fixture,{component,input}),[]);
  assert.deepEqual(validateJointProductionArtifactBytes(fixture,{component:Buffer.concat([component,Buffer.from('\n// changed')]),input}),['B10 reviewed case component bytes differ']);
  assert.deepEqual(validateJointProductionArtifactBytes(fixture,{component,input:Buffer.concat([input,Buffer.from(' ')])}),['B10 reviewed case input bytes differ']);
});
