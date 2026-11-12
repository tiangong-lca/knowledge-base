import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {publicCatalog,getClaimEvidence} from './knowledge.mjs';
import {publicResearch} from './research.mjs';
import {citationHref,citationSourceHref} from './reader-citations.mjs';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import original from '../config/wall-selection-original.json' with {type:'json'};
import history from '../config/wall-selection-heading-history.json' with {type:'json'};
import {assertWallSelectionOriginal,assertWallSelectionHeadingHistory,assertWallSelectionAccepted,wallSelectionAcceptedDigest,wallSelectionRoute,wallSelectionCaseHeadingId,wallSelectionConditionIds,wallSelectionHeadingEntries,remapWallSelectionCitations,validateWallSelectionCoverage,validateWallSelectionCaseOutput,validateWallSelectionArtifactBytes,validateRenderedWallSelection} from './reader-wall-selection.mjs';
import {chapterAnchorPrefix,printUnitAnchor,createChapterNotePlan,createChapterReferenceIndex,createChapterAnnotationPlan} from './reader-book.mjs';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex'),hash=x=>createHash('sha256').update(x).digest('hex'),copy=x=>structuredClone(x);
const escape=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function tableHtml(table){return `<table><caption>${escape(table.caption)}</caption>${table.rows.map((row,i)=>`<tr>${row.map((cell,j)=>{const semantics=table.cellSemantics[i][j],tag=semantics.tag.toLowerCase();return `<${tag}${semantics.scope?` scope="${semantics.scope}"`:''}>${escape(cell)}</${tag}>`;}).join('')}</tr>`).join('')}</table>`;}
const extraTable=alternative=>{
  const values=alternative===0?['(10, 0, 0, 0)ᵀ','(10, 0, 0, 20)ᵀ；各次操作的基准见矩阵列标题。','2 × 10 + 5 × 0 + 0.2 × 0 + 0 = 20','20 + 0 + 0 + 6 = 26 kg','0.05 + 0 + 0 + 0.02 = 0.07 kg','1 × 26 + 28.1 × 0.07 = 26 + 1.967 = 27.967 kg CO2-eq / 规定服务']:['(0, 6, 0, 0)ᵀ','(0, 6, 0, 30)ᵀ；各次操作的基准见矩阵列标题。','2 × 0 + 5 × 6 + 0.2 × 0 + 0 = 30','0 + 18 + 0 + 9 = 27 kg','0 + 0.06 + 0 + 0.03 = 0.09 kg','1 × 27 + 28.1 × 0.09 = 27 + 2.529 = 29.529 kg CO2-eq / 规定服务'];
  return {caption:alternative===0?'A trace':'B trace',rows:[['quantity','value'],...values.map((value,index)=>['f/s/energy/CO2/CH4/I'.split('/')[index],value])],cellSemantics:[[{tag:'TH',scope:'col'},{tag:'TH',scope:'col'}],...values.map(()=>[{tag:'TH',scope:'row'},{tag:'TD',scope:null}])]};
};
/** Explicit local fixtures exercise guards; none is a reader/scientific acceptance. */
export function wallSelectionFixture(){
  const component='fixture-component',conditions=wallSelectionConditionIds.map(id=>({id,text:`Reviewed fixture condition ${id}.`}));
  const accepted={schemaVersion:1,status:'reviewed',title:'墙面服务比较',description:'Fixture for acceptance refusal and structural mutation checks.',mdxSha256:'',componentSha256:hash(component),sections:copy(original.sections),claims:copy(original.claims),ordinary:{},caseSelection:{originalCaseDigest:digest(original.case),inputSha256:original.case.inputSha256,paragraphDispositions:original.case.views.web.paragraphs.map(row=>({id:row.id,action:'compress',rationale:'Fixture only; original meaning remains in specified canonical target.',targetClaimIds:['cl-wall-question']})),headingDispositions:original.case.views.web.headings.map(row=>({key:row.key,action:'retain',rationale:'Fixture heading disposition only.',targetClaimIds:['cl-wall-question']})),conditions,currentPresentation:{}}};
  const html={};
  for(const view of ['web','book']){
    const print=view==='book',id=wallSelectionCaseHeadingId(print),headings=original.case.views[view].headings.map((h,i)=>({tag:print?`H${Number(h.tag.slice(1))-1}`:h.tag,id:i?'':id,text:i===0?'计算表与参数':i===4?'固定结果与全域判断':h.text}));
    const tables=[...copy(original.case.views[view].tables).slice(0,3),extraTable(0),extraTable(1),...copy(original.case.views[view].tables).slice(3)];
    const links=[...copy(original.case.views[view].links),...['功能实现','清单形成','指标含义','配对判断'].map(id=>({text:id,href:`#${print?printUnitAnchor(wallSelectionRoute)+'-':''}${id}`}))];
    html[view]=`<section class="teaching-case" data-case-id="CASE-WALL-CONNECT" data-case-version="1.0.0" aria-labelledby="${id}">${headings.map(h=>`<${h.tag.toLowerCase()}${h.id?` id="${h.id}"`:''}>${escape(h.text)}</${h.tag.toLowerCase()}>`).join('')}${conditions.map(c=>`<p>${c.text}</p>`).join('')}<label for="${view}-scenario">场景</label><select id="${view}-scenario"><option value="smooth">smooth</option><option value="rough">rough</option></select><label for="${view}-theta">共同θ</label><input type="range" id="${view}-theta" min="0.1" max="0.5" step="0.01" value="0.3" aria-describedby="${view}-theta-note"/><p id="${view}-theta-note">同一个共同参数</p><figure><svg role="img" aria-labelledby="${view}-plot-title ${view}-plot-description"><title id="${view}-plot-title">paired plot</title><desc id="${view}-plot-description">fixed shared parameter</desc><rect/><circle/><line stroke-width="2"/><line stroke-width="2" stroke-dasharray="7 5"/><line/><line/><line/><line/><line/></svg><figcaption>fixture plot</figcaption></figure>${tables.map(tableHtml).join('')}<ul class="teaching-case-predicates"><li>ordering</li><li>all inside</li><li>all outside</li></ul>${links.map(a=>`<a href="${a.href}"${a.href.startsWith('/downloads/')?' download':''}>${a.text}</a>`).join('')}</section>`;
    accepted.caseSelection.currentPresentation[view]={text:htmlParser.parse(html[view]).firstChild.text,headings,links,tables};
    accepted.ordinary[view]=[{text:'完整矩阵和轨迹见计算表与参数。',section:'清单形成',navigation:[{text:'计算表与参数',href:`#${id}`}]}];
  }
  const raw=`---\ntitle: ${accepted.title}\ndescription: ${accepted.description}\n---\n\n${original.sections.map(section=>`## ${section.title}\n\n${section.claimIds.map(id=>`<Prose ids="${id}" />${id===original.case.placementAfter?'\n\n<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />':''}${id==='cl-wall-coordinates'?'\n\n完整矩阵和轨迹见[计算表与参数](#wall-case-reference)。':''}`).join('\n\n')}`).join('\n\n')}\n`;
  accepted.mdxSha256=hash(raw);
  return {accepted,pin:digest(accepted),raw,html,component,catalog:{claims:[...copy(original.claims),...copy(original.scientificClosure.premises)],evidence:copy(original.scientificClosure.evidence),sources:copy(original.scientificClosure.sources)},edition:{units:[{key:wallSelectionRoute,source:wallSelectionRoute,kind:'chapter'}]}};
}
const allEntries=()=>[...copy(original.originalHistoricalEntries),...wallSelectionHeadingEntries()];

test('wall original22 and seven actual hosted headings are independently immutable; old inventories remain qualified',()=>{
  assert.doesNotThrow(()=>assertWallSelectionOriginal());assert.doesNotThrow(()=>assertWallSelectionHeadingHistory());
  assert.equal(original.claims.length,22);assert.equal(original.publication.claims.length,22);assert.equal(original.originalHistoricalEntries.length,104);assert.equal(history.addresses.length,7);
  assert.equal(history.manifestSha256,'209a12a59cdd90e8d9c76019100ae9af710bd08abe0d6c62a9a754f487642863');
  assert.equal(history.outputs[0].sha256,'47a25c54f62c8d8794c1a9143c9d9ec41ab4c418aeee27b094c79fb42c95e25d');
  assert.equal(history.outputs[1].sha256,'b0ec0c2e21eff34b9a936f1eab795d29810c0b32e126b0d83d1713427c08f614');
  for(const mutate of [x=>x.claims.pop(),x=>x.originalHistoricalEntries.pop(),x=>x.case.views.web.paragraphs.pop(),x=>x.publication.claims[0].textTemplate+='changed']){const x=copy(original);mutate(x);assert.throws(()=>assertWallSelectionOriginal(x),/qualified638/);}
  const changed=copy(history);changed.addresses[0].id='invented';assert.throws(()=>assertWallSelectionHeadingHistory(changed),/seven actual/);
});

test('actual captured title IDs differ by view and no IDs are invented for four other case headings',()=>{
  assert.deepEqual(history.addresses.filter(x=>x.kind==='case-heading').map(x=>x.id),['_R_ikklubt4nqlb_-heading','_R_2agvl4lubralb_-heading']);
  assert.equal(history.addresses.filter(x=>x.kind==='section-heading').length,5);
  for(const view of ['web','book']){assert.equal(original.case.views[view].headings.length,5);assert(original.case.views[view].headings.slice(1).every(x=>x.id===''));assert.equal(original.case.views[view].tables.length,5);assert.equal(original.case.views[view].paragraphs.length,23);}
});

test('production acceptance fails closed; explicit independent fixture digest cannot silently approve current state',()=>{
  const f=wallSelectionFixture();assert.throws(()=>assertWallSelectionAccepted(f.accepted),/incomplete|independent accepted pin/);assert.doesNotThrow(()=>assertWallSelectionAccepted(f.accepted,f.pin));
  const changed=copy(f.accepted);changed.description+='unreviewed';assert.throws(()=>assertWallSelectionAccepted(changed,f.pin),/independent accepted pin/);
  assert.throws(()=>validateWallSelectionCoverage(f.edition,new Map([[wallSelectionRoute,f.raw]]),original,f.catalog,f.accepted),/incomplete|independent accepted pin/);
  assert.throws(()=>validateRenderedWallSelection(htmlParser.parse('<article/>'),wallSelectionRoute,original,f.catalog,f.accepted),/incomplete|independent accepted pin/);
});

test('reviewed receipt cannot omit original claims, dispositions, local conditions, tables or native matrix entry',()=>{
  const f=wallSelectionFixture();
  for(const mutate of [a=>a.sections[0].claimIds.pop(),a=>a.claims[0].text+='expanded',a=>a.caseSelection.paragraphDispositions.pop(),a=>a.caseSelection.headingDispositions[0].targetClaimIds=['unknown'],a=>a.caseSelection.conditions.pop(),a=>a.caseSelection.currentPresentation.book.tables[1].rows[1][1]='changed',a=>a.caseSelection.currentPresentation.web.tables.pop(),a=>a.caseSelection.currentPresentation.web.tables[3].rows[3][1]='invented equation',a=>a.ordinary.book[0].navigation[0].href='#wrong',a=>a.caseSelection.currentPresentation.web.headings[1].id='invented']){const a=copy(f.accepted);mutate(a);assert.throws(()=>assertWallSelectionAccepted(a,digest(a)));}
});

test('source gate binds real four sections, original22 materialization and case before exercise',()=>{
  const f=wallSelectionFixture(),check=(raw,catalog=f.catalog)=>validateWallSelectionCoverage(f.edition,new Map([[wallSelectionRoute,raw]]),original,catalog,f.accepted,f.pin);
  assert.deepEqual(check(f.raw),[]);
  for(const raw of [f.raw.replace('## 功能实现','## 假节'),f.raw.replace('cl-wall-demand','cl-wall-unknown'),f.raw.replace('<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />',''),f.raw.replace('<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />','<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />\n<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />'),f.raw.replace('<Prose ids="cl-wall-answer" />','<Prose ids="cl-wall-answer" />\nextra text')])assert(check(raw).length);
  const c=copy(f.catalog);c.claims[0].scope+='widened';assert(check(f.raw,c).some(x=>x.includes('canonical record')));
  const changedEvidence=copy(f.catalog);changedEvidence.evidence[0].locator='silently widened reading';assert(check(f.raw,changedEvidence).some(x=>x.includes('scientific evidence')));
  const changedPremise=copy(f.catalog);changedPremise.claims.at(-1).scope='new premise';assert(check(f.raw,changedPremise).some(x=>x.includes('scientific claims')));
  assert(check(f.raw,null).some(x=>x.includes('catalog')));
  const literal='<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />',misplaced=f.raw.replace(literal,'').replace('<Prose ids="cl-wall-activities" />',literal+'\n<Prose ids="cl-wall-activities" />');
  const a=copy(f.accepted);a.mdxSha256=hash(misplaced);assert(validateWallSelectionCoverage(f.edition,new Map([[wallSelectionRoute,misplaced]]),original,f.catalog,a,digest(a)).some(x=>x.includes('follow rough')));
});

test('all104 historical scopes plus seven captured addresses survive as exact dated meanings',()=>{
  const other={route:'/unrelated',path:'/unrelated',id:'unchanged',targets:[]},result=remapWallSelectionCitations([...allEntries(),other]);assert.equal(result.length,112);assert.strictEqual(result.at(-1),other);
  assert.equal(new Set(result.map(e=>`${e.path}#${e.id}`)).size,112);
  const notes=original.originalHistoricalEntries.filter(e=>e.targets[0].kind==='note');assert.equal(notes.length,88);for(const old of notes)assert.deepEqual(result.find(e=>e.path===old.path&&e.id===old.id),old);
  const sourceHeading=original.sourceHeadings[4],rough=result.find(e=>e.path===wallSelectionRoute&&e.id===sourceHeading.id);
  assert.equal(rough.mode,'notice');assert.deepEqual(rough.targets.filter(t=>t.kind==='note').map(t=>t.claimId),sourceHeading.claimIds);assert.equal(rough.targets[0].id,'配对判断');assert(rough.scope.text.includes(original.title));assert(rough.scope.text.includes('4则'));
  const group=result.find(e=>e.id===`${chapterAnchorPrefix(wallSelectionRoute)}-annotations`);assert.equal(group.mode,'retained');assert.equal(group.scope.targets.length,22);assert(group.scope.text.includes(original.title));
  for(const captured of history.addresses){const e=result.find(e=>e.path===captured.path&&e.id===captured.id);assert.equal(e.mode,'notice');assert.equal(e.edition.sourceCommit,history.sourceCommit);if(captured.kind==='case-heading')assert.equal(e.targets[0].id,wallSelectionCaseHeadingId(captured.path==='/print'));}
  for(const mutate of [e=>e.pop(),e=>e.push(copy(e[0])),e=>e[0].edition.sourceCommit='changed',e=>e.push({route:wallSelectionRoute,path:wallSelectionRoute,id:'unregistered',targets:[]})]){const e=allEntries();mutate(e);assert.throws(()=>remapWallSelectionCitations(e));}
});

test('three original demand/activity headings retain their embedded calculator as well as four original notes',()=>{
  const before=allEntries(),after=remapWallSelectionCitations(before),id='把用量接到需求与活动';
  const affected=before.filter(entry=>entry.targets[0].kind==='heading'&&[id,`${printUnitAnchor(wallSelectionRoute)}-${id}`].includes(entry.targets[0].id));
  assert.equal(affected.length,3);
  for(const old of affected){
    const entry=after.find(row=>row.path===old.path&&row.id===old.id);
    assert(entry.targets.some(target=>target.kind==='heading'&&target.id===wallSelectionCaseHeadingId(old.path==='/print')));
    assert.deepEqual(entry.targets.filter(target=>target.kind==='note').map(target=>target.claimId),original.sourceHeadings[1].claimIds);
    assert(entry.scope.text.includes('原来嵌入的完整计算器'));
    assert.equal(entry.edition.sourceCommit,old.edition.sourceCommit);
  }
  for(const old of before.filter(entry=>entry.targets[0].kind==='chapter')){
    const entry=after.find(row=>row.path===old.path&&row.id===old.id);
    assert(entry.scope.targets.some(target=>target.id===wallSelectionCaseHeadingId(old.path==='/print')));
  }
  for(const old of before.filter(entry=>entry.targets[0].kind==='note-group')){
    const entry=after.find(row=>row.path===old.path&&row.id===old.id);
    assert.equal(entry.scope.targets.length,22);
    assert(entry.scope.targets.every(target=>target.kind==='note'));
  }
});

test('actual complete case guard rejects lost cells/traces/predicates/conditions/downloads and hidden retention',()=>{
  const f=wallSelectionFixture();
  for(const view of ['web','book']){
    const print=view==='book',check=html=>validateWallSelectionCaseOutput(htmlParser.parse(`<article>${html}</article>`).firstChild,{print,accepted:f.accepted,independentDigest:f.pin});
    assert.deepEqual(check(f.html[view]),[]);
    const node=htmlParser.parse(f.html[view]).firstChild,table=node.querySelectorAll('table')[3],cell=node.querySelectorAll('td')[0],condition=node.querySelector('p'),predicate=node.querySelector('.teaching-case-predicates li'),source=node.querySelector('a');
    for(const changed of [f.html[view].replace(table.outerHTML,''),f.html[view].replace(cell.outerHTML,'<td>changed</td>'),f.html[view].replace(condition.outerHTML,''),f.html[view].replace(predicate.outerHTML,''),f.html[view].replace('<circle/>',''),f.html[view].replace(source.outerHTML,''),f.html[view].replace(' download',''),f.html[view].replace('min="0.1"','min="0"'),f.html[view].replace('aria-describedby="'+view+'-theta-note"','aria-describedby="missing"'),f.html[view].replace(condition.outerHTML,`<details>${condition.outerHTML}</details>`),f.html[view].replace('<section ','<section hidden '),f.html[view]+f.html[view]])assert(check(changed).length,changed.slice(0,80));
  }
});

test('artifact gate binds raw input/publication/exact engine files separately from canonical public-input identity',()=>{
  const f=wallSelectionFixture(),read=p=>readFileSync(new URL(`../${p}`,import.meta.url)),bytes={component:f.component,input:read('knowledge/cases/wall-coating-v1.json'),publication:read('knowledge/cases/wall-coating-v1.publication.json'),engine:read('scripts/teaching-case.mjs'),clientEngine:read('lib/teaching-case.ts')};
  assert.notEqual(original.case.rawInputSha256,original.case.inputSha256);assert.deepEqual(validateWallSelectionArtifactBytes(f.accepted,bytes,f.pin),[]);
  for(const key of Object.keys(bytes)){const changed={...bytes,[key]:'changed'};assert(validateWallSelectionArtifactBytes(f.accepted,changed,f.pin).some(error=>error.includes(key)));}
  assert.throws(()=>validateWallSelectionArtifactBytes(f.accepted,bytes),/incomplete|independent accepted pin/);
});

/** Complete print fixture uses the actual source annotation component. It is not a publication receipt. */
function completePrintFixture(crossUnit=false){
  const trailingSlash=process.env.__NEXT_TRAILING_SLASH;process.env.__NEXT_TRAILING_SLASH='true';
  const f=wallSelectionFixture(),read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8')),catalog=publicCatalog(read('knowledge/catalog.json')),byId=new Map(catalog.claims.map(claim=>[claim.id,claim]));
  const require=createRequire(import.meta.url),mdxRequire=createRequire(require.resolve('fumadocs-mdx')),module={exports:{}},code=mdxRequire('esbuild').transformSync(readFileSync(new URL('../components/evidence.tsx',import.meta.url),'utf8'),{loader:'tsx',jsx:'automatic',format:'cjs',sourcefile:'evidence.tsx'}).code;
  const bindings={'@/lib/catalog':{__esModule:true,default:catalog,getClaimEvidence,isKnownClaim:id=>byId.has(id)},'@/knowledge/research/literature-map.json':read('knowledge/research/literature-map.json'),'@/knowledge/research/readings.json':read('knowledge/research/readings.json'),'@/scripts/research.mjs':{publicResearch}};
  new Function('require','module','exports',code)(name=>name==='server-only'?{}:Object.hasOwn(bindings,name)?bindings[name]:require(name),module,module.exports);
  const {ClaimAnnotation}=module.exports,route=wallSelectionRoute,prefix=printUnitAnchor(route),path='/print',plan=createChapterNotePlan(f.raw,prefix),referenceIndex=createChapterReferenceIndex([{url:route,title:f.accepted.title,raw:f.raw,printOrder:0}],{print:true}),annotations=createChapterAnnotationPlan(plan,catalog.claims,referenceIndex,{print:true}),entries=remapWallSelectionCitations(allEntries()).filter(entry=>entry.path===path);
  const label=target=>{if(target.kind==='note')return `《${f.accepted.title}》注 ${original.claimIds.indexOf(target.claimId)+1}`;const local=target.id.slice(prefix.length+1),title=original.sections.find(section=>section.id===local)?.title??(local==='wall-case-reference'?'计算表与参数':null);return `《${f.accepted.title}》${title?'·'+title:target.kind==='note-group'?'注释':''}`;};
  const context=(entry,scope=false)=>`<div ${scope?`data-legacy-scope="${entry.id}"`:`id="${entry.id}" data-legacy-notice=""`}><p>此链接按 ${entry.edition.sourceDate} 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a></p><p>${entry.scope.text}</p><ul>${(scope?entry.scope.targets:entry.targets).map(target=>`<li><a href="${citationHref(target,path)}">${label(target)}</a></li>`).join('')}</ul></div>`;
  const paragraph=id=>`<p>${escape(byId.get(id).text)}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${prefix}-claim-${id}">[${original.claimIds.indexOf(id)+1}]</a></sup></p>`;
  const matrix=f.accepted.ordinary.book[0],matrixHtml=`<p>完整矩阵和轨迹见<a href="${matrix.navigation[0].href}">计算表与参数</a>。</p>`;
  const body=original.sections.map(section=>`<h3 id="${prefix}-${section.id}">${section.title}</h3>${section.claimIds.map(id=>paragraph(id)+(id==='cl-wall-coordinates'?matrixHtml:'')+(id===original.case.placementAfter?f.html.book:'')).join('')}`).join('');
  const notes=`<section class="chapter-notes"><h3 id="${prefix}-annotations">注释</h3>${entries.filter(e=>e.mode==='retained'&&e.scope&&e.id===prefix+'-annotations').map(e=>context(e,true)).join('')}<ol>${original.claimIds.map(id=>`<li id="${prefix}-claim-${id}" data-reader-claim="${id}">${renderToStaticMarkup(createElement(ClaimAnnotation,{id,...annotations.get(id)}))}</li>`).join('')}</ol></section>`;
  if(crossUnit){f.accepted.ordinary.book.push({text:'后文见购物袋比较。',section:'配对判断',navigation:[{text:'购物袋比较',href:'#print-unit-next-fixture'}]});f.pin=digest(f.accepted);}
  const next=crossUnit?'<p>后文见<a href="#print-unit-next-fixture">购物袋比较</a>。</p>':'';
  const html=`<article id="${prefix}" data-reader-route="${route}" data-reader-title="${f.accepted.title}"><h2>${f.accepted.title}</h2><p>${f.accepted.description}</p>${entries.filter(e=>e.mode==='retained'&&e.scope&&e.id===prefix).map(e=>context(e,true)).join('')}${body}${next}${notes}${entries.filter(e=>e.mode==='notice').map(e=>context(e)).join('')}</article>${crossUnit?'<article id="print-unit-next-fixture">下一章测试目标</article>':''}`;
  if(trailingSlash===undefined)delete process.env.__NEXT_TRAILING_SLASH;else process.env.__NEXT_TRAILING_SLASH=trailingSlash;
  return {...f,html:htmlParser.parse(html).toString(),catalog};
}

test('complete actual annotation/body/case/history output requires exact meaningful text, carrier and source subsets',()=>{
  const f=completePrintFixture(),check=html=>validateRenderedWallSelection(htmlParser.parse(html),'/print',original,f.catalog,f.accepted,f.pin);
  assert.deepEqual(check(f.html),[]);
  const dom=htmlParser.parse(f.html),canonical=dom.querySelector('a[role="doc-noteref"]').closest('p'),widget=dom.querySelector('.teaching-case'),scope=dom.querySelector('[data-legacy-scope]'),notice=dom.querySelector('[data-legacy-notice]'),annotation=dom.querySelector('.claim-annotation'),source=dom.querySelector('.annotation-sources li'),carrier=dom.querySelector('.source-reading'),premise=dom.querySelector('details li a'),download=dom.querySelector('.claim-annotation a[download]'),ordinary=dom.querySelectorAll('p').find(p=>p.text===f.accepted.ordinary.book[0].text);
  for(const node of [canonical,widget,scope,notice,annotation,source,carrier,premise,download,ordinary]){assert(node);assert(check(f.html.replace(node.outerHTML,'')).length,node.outerHTML.slice(0,200));}
  for(const node of [scope,notice,canonical])for(const attribute of ['hidden','aria-hidden="true"','style="display:none"'])assert(check(f.html.replace(node.outerHTML,node.outerHTML.replace(/^<([a-z0-9]+)/,`<$1 ${attribute}`))).length);
  assert(check(f.html.replace(notice.outerHTML,notice.outerHTML.replace(notice.querySelectorAll('a')[0].getAttribute('href'),'https://example.org/wrong-edition'))).length);
  assert(check(f.html.replace(scope.outerHTML,scope.outerHTML.replace('原有22则','扩大后的全章'))).length);
  assert(check(f.html.replace('</article>','<p>未审新命题</p></article>')).length);
  assert(check(f.html.replace(canonical.outerHTML,canonical.outerHTML+canonical.outerHTML)).length);
  const after=f.html.replace(ordinary.outerHTML,'').replace(widget.outerHTML,ordinary.outerHTML+widget.outerHTML);assert(check(after).some(error=>error.includes('matrix entry')));
});

test('reviewed print continuation resolves its exact unique native target across the complete document',()=>{
  const f=completePrintFixture(true),check=html=>validateRenderedWallSelection(htmlParser.parse(html),'/print',original,f.catalog,f.accepted,f.pin);
  assert.deepEqual(check(f.html),[]);
  const target=htmlParser.parse(f.html).querySelector('#print-unit-next-fixture');
  assert(check(f.html.replace(target.outerHTML,'')).some(error=>error.includes('native ordinary target')));
  assert(check(f.html+target.outerHTML).some(error=>error.includes('native ordinary target')));
  assert(check(f.html.replace('href="#print-unit-next-fixture"','href="#different"')).some(error=>error.includes('ordinary navigation')));
});

test('complete4123-address composition preserves all4116 original source identities and seven new captures',async()=>{
  const {createLegacyCitationEntries,createCanonicalCitationEntries}=await import('./reader-citations.mjs'),read=name=>JSON.parse(readFileSync(new URL(`../config/${name}.json`,import.meta.url),'utf8'));
  const baseline=read('citation-baseline'),history=read('citation-history'),placements=read('citation-placements'),printRoutes=[...baseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route),...placements.frontMatter,...placements.printAdditions.map(page=>page.route)];
  const before=[...createLegacyCitationEntries(baseline,placements,history.pages),...createCanonicalCitationEntries(history,placements,printRoutes)];
  for(const [file,fn,config] of [['reader-edition','publishedHeadingEntries','framework-heading-history'],['reader-cleaner-production','cleanerProductionHeadingEntries','cleaner-production-heading-history'],['reader-functional-reference','functionalReferenceHeadingEntries','functional-reference-heading-history'],['reader-process-network','processNetworkHeadingEntries','process-network-heading-history'],['reader-exchange-semantics','exchangeSemanticsHeadingEntries','exchange-semantics-heading-history'],['reader-hybrid-inventory','hybridInventoryHeadingEntries','hybrid-inventory-heading-history'],['reader-joint-production','jointProductionHeadingEntries','joint-production-heading-history']])before.push(...(await import(`./${file}.mjs`))[fn](read(config)));
  assert.equal(before.length,4116);
  const after=remapWallSelectionCitations([...before,...wallSelectionHeadingEntries()]);assert.equal(after.length,4123);assert.equal(new Set(after.map(entry=>`${entry.path}#${entry.id}`)).size,4123);
  for(const entry of before){const found=after.find(row=>row.path===entry.path&&row.id===entry.id);assert(found);if(entry.route!==wallSelectionRoute)assert.strictEqual(found,entry);else assert.deepEqual(found.edition,entry.edition);}
});
