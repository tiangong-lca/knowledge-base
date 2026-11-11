import {createElement,Fragment} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FrameworkProvider} from 'fumadocs-core/framework';
import {DocsLayout} from 'fumadocs-ui/layouts/docs';
import {DocsPage} from 'fumadocs-ui/layouts/docs/page';
import {SidebarProvider,SidebarFolder,SidebarFolderTrigger,SidebarFolderContent} from 'fumadocs-ui/components/sidebar/base';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import {readerNumberingManifest as manifest,getPresentationUnits,getUnitHeadingPlan,printReadingEntryAnchor,readerParts,readerContinuationContracts,getContinuationLink} from './reader-numbering.mjs';
import {printUnitAnchor} from './reader-book.mjs';
import {readReaderNumberingArtifact,validateReaderNumberingSources,validateReaderNumberingDocument,prepareNumberedReaderDocument,validateReaderNumberingOutput,isVerifiedReaderPagination} from './reader-numbering-output.mjs';
const esc=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const numbered=(number,title)=>number?`<span data-reader-number="">${esc(number)}</span> <span data-reader-heading-title="">${esc(title)}</span>`:esc(title);
const book=getPresentationUnits('book'),web=getPresentationUnits('web'),sources=new Map([...new Map([...book,...web].map(unit=>[unit.source,unit])).values()].map(unit=>[unit.source,`---\ntitle: ${unit.title}\ndescription: fixture\n---\n${manifest.headings[unit.source].filter(slot=>slot.type==='mdx').map(slot=>'#'.repeat(slot.depth)+' '+slot.title+` [#${slot.id}]`).join('\n')}`]));
const edition={units:manifest.book.map(({key,source,kind})=>({key,source,kind}))};
const heading=(view,unit,slot)=>`<h${view==='book'?Math.min(slot.depth+2,6):slot.depth} ${slot.id?`id="${esc(view==='book'?printUnitAnchor(unit.key)+'-'+slot.id:slot.id)}"`:''} data-reader-heading-key="${esc(slot.key)}">${numbered(slot.number,slot.title)}</h${view==='book'?Math.min(slot.depth+2,6):slot.depth}>`;
function continuation(view,unit){return readerContinuationContracts.filter(row=>(view==='book'?row.bookSource??row.route:row.route)===unit.source).map(row=>{const link=getContinuationLink(view,view==='book'?row.bookSourceKey??row.route:row.route,row.sourceHref,row.sourceLabel),context=view==='book'?row.bookContext:row.webContext;return `<p>${esc(context).replace(esc(link.label),`<a href="${esc(link.href)}">${esc(link.label)}</a>`)}</p>`;}).join('');}
const currentEntryAttributes = (view, record) => view === 'book' && printReadingEntryAnchor(record.key) !== printUnitAnchor(record.key)
  ? ` id="${printReadingEntryAnchor(record.key)}" tabindex="-1"` : '';
const unit=(view,record)=>{const level=view==='book'?(record.kind==='front-matter'?2:3):1,prefix=view==='book'?printUnitAnchor(record.key):'chapter';return `<article ${view==='book'?`id="${prefix}"`:''} data-reader-route="${record.key}" data-reader-title="${esc(record.title)}">${view==='web'?`<p class="reader-view-label">网页细读目录${record.partTitle?` · ${record.partLabel} ${record.partTitle}`:''} · <a href="/print/">书籍目录与连续阅读</a></p>`:''}<h${level}${currentEntryAttributes(view,record)} data-reader-heading-key="@unit">${numbered(record.label,record.title)}</h${level}><p>fixture</p>${getUnitHeadingPlan(view,record.key).map(slot=>heading(view,record,slot)).join('')}${continuation(view,record)}${record.kind==='front-matter'?'':`<section class="chapter-notes"><h${view==='book'?4:2}>注释</h${view==='book'?4:2}></section>`}${view==='web'?footer(record):''}</article>`;};
function tocUnit(record){return `<li><a data-reader-toc-unit="${record.key}" href="#${printReadingEntryAnchor(record.key)}">${numbered(record.label,record.title)}</a><ul>${getUnitHeadingPlan('book',record.key).filter(slot=>slot.type==='mdx').map(slot=>`<li><a data-reader-toc-heading="${esc(slot.key)}" data-reader-route="${record.key}" href="#${esc(printUnitAnchor(record.key)+'-'+slot.id)}">${numbered(slot.number,slot.title)}</a></li>`).join('')}</ul></li>`;}
function bookHtml(){return `<nav data-reader-contents="book"><ul>${book.filter(record=>record.kind==='front-matter').map(tocUnit).join('')}</ul>${readerParts.map(part=>`<section><h3 data-reader-toc-part="${part.number}"><a href="#print-part-${part.number}">${numbered(part.label,part.title)}</a></h3><ul>${book.filter(record=>record.part===part.number).map(tocUnit).join('')}</ul></section>`).join('')}${book.filter(record=>['topic','appendix'].includes(record.kind)).map(tocUnit).join('')}</nav><main>${book.filter(record=>record.kind==='front-matter').map(record=>unit('book',record)).join('')}${readerParts.map(part=>`<section data-reader-part-group="${part.number}"><h2 id="print-part-${part.number}" data-reader-part="${part.number}">${numbered(part.label,part.title)}</h2><p class="print-part-introduction">${esc(part.introduction)}</p>${book.filter(record=>record.part===part.number).map(record=>unit('book',record)).join('')}</section>`).join('')}${book.filter(record=>['topic','appendix'].includes(record.kind)).map(record=>unit('book',record)).join('')}</main>`;}
function footer(record){if(record.key==='/docs')return '';const at=web.findIndex(unit=>unit.key===record.key);return `<div class="docs-pagination">${[web[at-1],web[at+1]].filter(Boolean).map(neighbor=>`<a href="${neighbor.key}/"><span data-reader-unit-name="${neighbor.key}">${numbered(neighbor.label,neighbor.title)}</span><p>fixture</p></a>`).join('')}</div>`;}
// Installed Fumadocs16.17.10: native Collapsible root, trigger and controlled
// content siblings, with the docs slot's inner item container.
function sidebar(){
 const link=record=>`<a href="${record.key}/"><span data-reader-unit-name="${record.key}">${numbered(record.label,record.title)}</span></a>`;
 const folder=(key,name,items)=>`<div data-state="open"><button type="button" aria-expanded="true" aria-controls="fixture-${key}">${name}</button><div data-state="open" id="fixture-${key}"><div class="sidebar-items">${items.map(link).join('')}</div></div></div>`;
 return `<aside id="nd-sidebar">${web.filter(unit=>unit.kind==='front-matter').map(link).join('')}${readerParts.map(part=>folder(`part-${part.number}`,`<span data-reader-part-name="${part.number}">${numbered(part.label,part.title)}</span>`,web.filter(unit=>unit.part===part.number))).join('')}${folder('topics','概念与实践专题',web.filter(unit=>unit.kind==='topic'))}${folder('appendices','附录',web.filter(unit=>unit.kind==='appendix'))}</aside>`;
}
function breadcrumb(record){if(record.kind==='front-matter')return '';const part=readerParts.find(part=>part.number===record.part);return `<div class="flex items-center gap-1.5 text-sm text-fd-muted-foreground"><span class="truncate text-fd-primary font-medium">${part?`<span data-reader-part-name="${part.number}">${numbered(part.label,part.title)}</span>`:record.kind==='topic'?'概念与实践专题':'附录'}</span></div>`;}
function mobileToc(record){if(!getUnitHeadingPlan('web',record.key).some(slot=>slot.type==='mdx'))return '';return `<div data-toc-popover="" data-state="closed"><header><button type="button" data-toc-popover-trigger="" data-state="closed" aria-expanded="false"><svg></svg><span class="grid flex-1 *:my-auto *:row-start-1 *:col-start-1"><span class="truncate transition-[opacity,translate,color]"><span data-reader-unit-name="${record.key}">${numbered(record.label,record.title)}</span></span><span class="truncate transition-[opacity,translate] opacity-0 translate-y-full pointer-events-none"></span></span><svg></svg></button><div id="fixture-mobile-toc" data-state="closed" hidden="" data-toc-popover-content=""></div></header></div>`;}
function webHtml(record){const body=unit('web',record).replace('<p class="reader-view-label">',breadcrumb(record)+'<p class="reader-view-label">');return `<div id="nd-docs-layout">${sidebar()}${mobileToc(record)}<main>${body}</main><aside id="nd-toc">${getUnitHeadingPlan('web',record.key).filter(slot=>slot.type==='mdx').map(slot=>`<a href="#${esc(slot.id)}">${numbered(slot.number,slot.title)}</a>`).join('')}</aside></div>`;}
function homeHtml(){return `<section data-reader-contents="web">${readerParts.map(part=>`<section><h3 data-reader-web-part="${part.number}">${numbered(part.label,part.title)}</h3>${web.filter(record=>record.part===part.number).map(record=>`<a data-reader-web-unit="${record.key}" href="${record.key}/"><h4>${numbered(record.label,record.title)}</h4><p>fixture</p></a>`).join('')}</section>`).join('')}</section>${web.filter(record=>record.kind==='topic').map(record=>`<a href="${record.key}/"><h3>${numbered(record.label,record.title)}</h3></a>`).join('')}`;}
const check=(html,path)=>validateReaderNumberingDocument(htmlParser.parse(html),path,{sources});

test('mandatory pinned manifest joins actual source titles,full headings and current edition independently',()=>{
 assert.deepEqual(validateReaderNumberingSources(manifest,sources,edition),[]);
 const bad=structuredClone(manifest);bad.web.pop();assert.throws(()=>validateReaderNumberingSources(bad,sources,edition),/independently pinned/);
 const missing=new Map(sources);missing.delete(book[2].source);assert(validateReaderNumberingSources(manifest,missing,edition).length);
 const content=new Map(sources);content.set(book[2].source,content.get(book[2].source)+'\n## Extra heading');assert(validateReaderNumberingSources(manifest,content,edition).length);
 const erased=structuredClone(edition);erased.units.pop();assert(validateReaderNumberingSources(manifest,sources,erased).length);
});
test('actual complete39-unit book validates exact7parts,number/title/depth/order/native contents targets',()=>{
 const html=bookHtml();assert.deepEqual(check(html,'/print'),[]);const doc=htmlParser.parse(html),unitHeading=doc.querySelector('[data-reader-heading-key="@unit"]'),content=doc.querySelectorAll('[data-reader-heading-key]').find(node=>node.getAttribute('data-reader-heading-key')!=='@unit'),toc=doc.querySelector('[data-reader-toc-heading]');
 for(const changed of [html.replace(content.outerHTML,''),html.replace(content.outerHTML,content.outerHTML+content.outerHTML),html.replace(content.outerHTML,content.outerHTML.replace('data-reader-number=""','data-reader-number="fake"')),html.replace(content.outerHTML,content.outerHTML.replace('>1.1<','>99.1<')),html.replace(content.outerHTML,content.outerHTML.replace('<h4','<h5').replace('</h4','</h5')),html.replace(toc.outerHTML,toc.outerHTML.replace(toc.getAttribute('href'),'#unrelated')),html.replace('data-reader-part-group="2"','data-reader-part-group="7"')])assert(check(changed,'/print').length);
 const nonFront=doc.querySelectorAll('[data-reader-heading-key="@unit"]').find(node=>node.querySelector('[data-reader-number]'));assert(check(html.replace(nonFront.outerHTML,nonFront.outerHTML.replace(nonFront.querySelector('[data-reader-number]').outerHTML,'')),'/print').length);
});
test('only exact validated marker pairs become semantic plain titles and legacy heading depths',()=>{
 const html=bookHtml(),raw=htmlParser.parse(html),prepared=prepareNumberedReaderDocument(raw,'/print',{sources});assert.deepEqual(prepared.errors,[]);assert(raw.querySelector('[data-reader-number]'));assert.equal(prepared.document.querySelector('[data-reader-number]'),null);
 const record=book.find(unit=>unit.key==='book-joint-production'),article=prepared.document.querySelector(`article[data-reader-route="${record.key}"]`);assert.equal(article.querySelector('[data-reader-heading-key="@unit"]').tagName,'H2');assert.equal(article.querySelector('[data-reader-heading-key="信息目的"]').tagName,'H3');assert.equal(article.querySelector('[data-reader-heading-key="@case:joint:title"]').tagName,'H4');assert.equal(article.querySelector('[data-reader-heading-key="@case:joint:routes"]').tagName,'H5');assert.equal(article.querySelector('.chapter-notes').querySelector('h3').text,'注释');
 const node=raw.querySelector('[data-reader-heading-key="信息目的"]');for(const changed of [node.outerHTML.replace('>10.1<','>11.1<'),node.outerHTML.replace('</span> <span','</span>  <span'),node.outerHTML.replace('data-reader-heading-title=""','data-reader-heading-title="false"')]){const result=prepareNumberedReaderDocument(htmlParser.parse(html.replace(node.outerHTML,changed)),'/print',{sources});assert(result.errors.length);assert.equal(result.document,null);}
});
test('only B27 uses a focusable title for its current print entry and retains its historical article', () => {
  const route = '/docs/book/data-quality-and-probability';
  const html = bookHtml();
  const document = htmlParser.parse(html);
  const article = document.querySelector(`article[data-reader-route="${route}"]`);
  const heading = article.querySelector('[data-reader-heading-key="@unit"]');
  const toc = document.querySelector(`[data-reader-toc-unit="${route}"]`);
  const historical = printUnitAnchor(route);
  const current = printReadingEntryAnchor(route);
  assert.match(current, /^print-reading-unit-/);
  assert.notEqual(current, historical);
  assert.equal(article.id, historical);
  assert.equal(heading.id, current);
  assert.equal(heading.parentNode, article);
  assert.equal(heading.getAttribute('tabindex'), '-1');
  assert.equal(toc.getAttribute('href'), '#' + current);
  assert.deepEqual(check(html, '/print'), []);

  const otherRoutes = book.map(unit => unit.key).filter(key => key !== route);
  assert.equal(otherRoutes.length, 38);
  for (const key of otherRoutes) {
    assert.equal(printReadingEntryAnchor(key), printUnitAnchor(key));
    assert.equal(document.querySelector(`[data-reader-toc-unit="${key}"]`).getAttribute('href'), '#' + printUnitAnchor(key));
  }
  const otherTitle = document.querySelector(`article[data-reader-route="${otherRoutes[0]}"] [data-reader-heading-key="@unit"]`);
  const badHeading = [
    heading.outerHTML.replace(`id="${current}"`, 'id="misnamed"'),
    heading.outerHTML.replace('tabindex="-1"', 'tabindex="0"'),
    `<div>${heading.outerHTML}</div>`,
  ];
  for (const changed of badHeading) {
    assert(check(html.replace(heading.outerHTML, changed), '/print').some(error => error.includes('reading heading target')));
  }
  const duplicated = html + `<div id="${current}"></div>`;
  assert(check(duplicated, '/print').some(error => error.includes('must resolve to one actual native target')));
  const oldHref = html.replace(toc.outerHTML, toc.outerHTML.replace(current, historical));
  assert(check(oldHref, '/print').some(error => error.includes('Wrong book contents unit href')));
  const movedOtherTitle = html.replace(otherTitle.outerHTML, otherTitle.outerHTML.replace(' data-reader-heading-key', ' id="print-reading-unit-other" data-reader-heading-key'));
  assert(check(movedOtherTitle, '/print').some(error => error.includes('reading anchors differ')));

  const normalized = prepareNumberedReaderDocument(document, '/print', { sources });
  assert.deepEqual(normalized.errors, []);
  const articleAfter = normalized.document.querySelector(`article[data-reader-route="${route}"]`);
  assert.equal(articleAfter.id, historical);
  assert.equal(articleAfter.querySelector('[data-reader-heading-key="@unit"]').id, current);
});

test('both website views retain separate numbering,full sidebar and local native heading TOC',()=>{
 for(const route of ['/docs/book/allocation-and-substitution','/docs/book/emission-time-and-assessment','/docs/flows','/docs/appendices/container-energy-check','/docs']){const record=web.find(unit=>unit.key===route),html=webHtml(record);assert.deepEqual(check(html,route),[]);}
 const record=web.find(unit=>unit.key==='/docs/book/allocation-and-substitution'),html=webHtml(record),doc=htmlParser.parse(html),toc=doc.querySelector('#nd-toc a'),header=doc.querySelector('article h1'),sidebarName=doc.querySelector('#nd-sidebar [data-reader-unit-name]');
 for(const changed of [html.replace(header.outerHTML,header.outerHTML.replace(record.label,record.label.replace('篇','章'))),html.replace(toc.outerHTML,''),html.replace(toc.outerHTML,toc.outerHTML.replace(toc.getAttribute('href'),'#other')),html.replace(sidebarName.outerHTML,''),html.replace('data-reader-unit-name="/docs"','data-reader-unit-name="/wrong"')])assert(check(changed,record.key).length);
});
test('native breadcrumb binds exact current folder and header order without accepting arbitrary copied names',()=>{
 const record=web.find(unit=>unit.key==='/docs/book/allocation-and-substitution'),html=webHtml(record),doc=htmlParser.parse(html),crumb=doc.querySelector('article').firstChild,name=crumb.querySelector('[data-reader-part-name]'),label=doc.querySelector('.reader-view-label');
 const mutations=[
  html.replace(crumb.outerHTML,''),html.replace(crumb.outerHTML,crumb.outerHTML.repeat(2)),
  html.replace(crumb.outerHTML,crumb.outerHTML.replace('data-reader-part-name="3"','data-reader-part-name="2"')),
  html.replace(crumb.outerHTML,crumb.outerHTML.replace('第三部','第二部')),
  html.replace(crumb.outerHTML,crumb.outerHTML.replace('归属争论','其他题名')),
  html.replace(crumb.outerHTML,crumb.outerHTML.replace(name.outerHTML,`<a href="${record.key}/">${name.outerHTML}</a>`)),
  html.replace(crumb.outerHTML,crumb.outerHTML.replace(name.outerHTML,name.outerHTML+'额外内容')),
  html.replace(crumb.outerHTML,'').replace(label.outerHTML,label.outerHTML+crumb.outerHTML),
  html.replace(crumb.outerHTML,'')+crumb.outerHTML,
  html+name.outerHTML,
 ];
 for(const changed of mutations){assert(check(changed,record.key).length);assert.equal(prepareNumberedReaderDocument(htmlParser.parse(changed),record.key,{sources}).document,null);}
 for(const [kind,wrong]of [['topic','附录'],['appendix','概念与实践专题']]){const unit=web.find(unit=>unit.kind===kind),base=webHtml(unit);assert.deepEqual(check(base,unit.key),[]);const crumb=htmlParser.parse(base).querySelector('article').firstChild;assert(check(base.replace(crumb.outerHTML,crumb.outerHTML.replace(kind==='topic'?'概念与实践专题':'附录',wrong)),unit.key).length);}
 const front=web.find(unit=>unit.kind==='front-matter');assert(check(webHtml(front).replace('<p class="reader-view-label">',crumb.outerHTML+'<p class="reader-view-label">'),front.key).length);
});
test('only the fully qualified native breadcrumb is removed from the semantic clone; original output and body/history remain',()=>{
 for(const kind of ['chapter','topic','appendix','front-matter']){
  const record=web.find(unit=>unit.kind===kind),retained='<p>正文条件必须保留。</p><div data-legacy-scope="preserved-fixture">历史版本条件必须保留。</div>',html=webHtml(record).replace('<p>fixture</p>','<p>fixture</p>'+retained),raw=htmlParser.parse(html),before=raw.toString(),crumb=kind==='front-matter'?null:raw.querySelector('article').firstChild,result=prepareNumberedReaderDocument(raw,record.key,{sources});
  assert.deepEqual(result.errors,[]);assert.equal(raw.toString(),before);
  if(crumb){assert.equal(raw.querySelector('article').firstChild.outerHTML,crumb.outerHTML);assert.equal(result.document.querySelector('article').querySelector('div[class="flex items-center gap-1.5 text-sm text-fd-muted-foreground"]'),null);}
  const article=result.document.querySelector('article');assert(article.text.includes('正文条件必须保留。'));assert.equal(article.querySelector('[data-legacy-scope="preserved-fixture"]').outerHTML,'<div data-legacy-scope="preserved-fixture">历史版本条件必须保留。</div>');assert(article.querySelector('[data-reader-heading-key="@unit"]'));assert(article.querySelector('p').text==='fixture');
 }
});
test('native mobile contents title requires current route,exact name and unique original trigger/content placement',()=>{
 const record=web.find(unit=>unit.key==='/docs/book/ecological-scarcity-and-targets'),html=webHtml(record),doc=htmlParser.parse(html),root=doc.querySelector('[data-toc-popover]'),trigger=doc.querySelector('[data-toc-popover-trigger]'),content=doc.querySelector('[data-toc-popover-content]'),name=trigger.querySelector('[data-reader-unit-name]');
 const mutations=[
  html.replace(root.outerHTML,''),html.replace(root.outerHTML,root.outerHTML.repeat(2)),
  html.replace(root.outerHTML,root.outerHTML.replace(record.key,'/docs/flows')),
  html.replace(root.outerHTML,root.outerHTML.replace(record.label,'第99篇')),
  html.replace(root.outerHTML,root.outerHTML.replace(record.title,'其他题名')),
  html.replace(root.outerHTML,root.outerHTML.replace(name.outerHTML,`<a href="${record.key}/">${name.outerHTML}</a>`)),
  html.replace(root.outerHTML,root.outerHTML.replace(name.outerHTML,name.outerHTML.repeat(2))),
  html.replace(root.outerHTML,root.outerHTML.replace('data-reader-unit-name=', 'hidden="" data-reader-unit-name=')),
  html.replace(root.outerHTML,root.outerHTML.replace('truncate transition-[opacity,translate,color]', 'hidden truncate transition-[opacity,translate,color]')),
  html.replace(root.outerHTML,root.outerHTML.replace('aria-expanded="false"','aria-expanded="true"')),
  html.replace(root.outerHTML,root.outerHTML.replace(content.outerHTML,'')+content.outerHTML),
  html.replace(root.outerHTML,root.outerHTML.replace(trigger.outerHTML,''))+trigger.outerHTML,
  html.replace(root.outerHTML,'').replace('<p class="reader-view-label">',root.outerHTML+'<p class="reader-view-label">'),
  html.replace(root.outerHTML,'')+root.outerHTML,
  html+name.outerHTML,
 ];
 for(const changed of mutations){assert(check(changed,record.key).length);assert.equal(prepareNumberedReaderDocument(htmlParser.parse(changed),record.key,{sources}).document,null);}
 const normalized=prepareNumberedReaderDocument(doc,record.key,{sources});assert.deepEqual(normalized.errors,[]);assert.equal(normalized.document.querySelector('[data-toc-popover-trigger] [data-reader-number]'),null);
});
test('installed Fumadocs renderer supplies the qualified breadcrumb and mobile title for each native folder kind',()=>{
 const title=(number,text)=>number?createElement(Fragment,null,createElement('span',{'data-reader-number':''},number),' ',createElement('span',{'data-reader-heading-title':''},text)):text;
 for(const kind of ['chapter','topic','appendix','front-matter']){
  const record=web.find(unit=>unit.kind===kind),part=readerParts.find(part=>part.number===record.part),page={type:'page',name:createElement('span',{'data-reader-unit-name':record.key},title(record.label,record.title)),url:record.key},folder=part?createElement('span',{'data-reader-part-name':part.number},title(part.label,part.title)):kind==='topic'?'概念与实践专题':'附录',tree={name:'网页细读目录',children:kind==='front-matter'?[page]:[{type:'folder',name:folder,children:[page]}]},toc=getUnitHeadingPlan('web',record.key).filter(slot=>slot.type==='mdx').map(slot=>({url:'#'+slot.id,depth:slot.depth,title:title(slot.number,slot.title)}));
  const native=htmlParser.parse(renderToStaticMarkup(createElement(FrameworkProvider,{usePathname:()=>record.key,useParams:()=>({}),useRouter:()=>({push(){},refresh(){}})},createElement(DocsLayout,{tree,nav:{enabled:false},sidebar:{enabled:false}},createElement(DocsPage,{toc}))))),fixture=htmlParser.parse(webHtml(record));
  if(kind!=='front-matter'){fixture.querySelector('article').firstChild.replaceWith(native.querySelector('article').firstChild.outerHTML);fixture.querySelector('[data-toc-popover]').replaceWith(native.querySelector('[data-toc-popover]').outerHTML);}
  assert.deepEqual(check(fixture.toString(),record.key),[]);
 }
});
test('verified pagination clone is exact current view metadata and mutation cannot impersonate qualification',()=>{
 const record=web.find(unit=>unit.key==='/docs/book/inventory-boundary-and-hybrid'),html=webHtml(record),prepared=prepareNumberedReaderDocument(htmlParser.parse(html),record.key,{sources});assert.deepEqual(prepared.errors,[]);const footer=prepared.document.querySelector('.docs-pagination');assert(isVerifiedReaderPagination(footer));const forged=htmlParser.parse(footer.outerHTML).firstChild;assert(!isVerifiedReaderPagination(forged));footer.set_content(footer.innerHTML+'unreviewed');assert(!isVerifiedReaderPagination(footer));
 const original=htmlParser.parse(html),number=original.querySelector('.docs-pagination [data-reader-number]');assert(check(html.replace(number.outerHTML,''),record.key).length);
});
test('home directory has37 fine entries in exact7parts and five separate topic numbers',()=>{
 const html=homeHtml();assert.deepEqual(check(html,'/'),[]);const doc=htmlParser.parse(html),link=doc.querySelector('[data-reader-web-unit]');for(const changed of [html.replace(link.outerHTML,''),html.replace(link.outerHTML,link.outerHTML+link.outerHTML),html.replace(link.outerHTML,link.outerHTML.replace(link.getAttribute('href'),'/print/'))])assert(check(changed,'/').length);
});
test('two continuation contracts require each actual paragraph,precise labels and view-specific native targets',()=>{
 for(const contract of readerContinuationContracts)for(const view of ['web','book']){const path=view==='book'?'/print':contract.route,html=view==='book'?bookHtml():webHtml(web.find(unit=>unit.key===contract.route)),doc=htmlParser.parse(html),article=doc.querySelector(`article[data-reader-route="${view==='book'?contract.bookSourceKey??contract.route:contract.route}"]`),wanted=getContinuationLink(view,view==='book'?contract.bookSourceKey??contract.route:contract.route,contract.sourceHref,contract.sourceLabel),link=article.querySelectorAll('p a').find(node=>node.getAttribute('href')===wanted.href);assert(link);assert.deepEqual(check(html,path),[]);for(const changed of [html.replace(link.outerHTML,''),html.replace(link.outerHTML,link.outerHTML.replace(link.text,'其他论证')),html.replace(link.outerHTML,link.outerHTML.replace(link.getAttribute('href'),'#other')),html.replace(link.closest('p').outerHTML,link.outerHTML),html.replace(link.closest('p').outerHTML,link.closest('p').outerHTML.repeat(2))])assert(check(changed,path).length);}
});
test('production artifact cannot be missing,fake,or replaced by a co-edited output fixture',async()=>{
 const root=await mkdtemp(join(tmpdir(),'reader-numbering-output-'));try{const out=join(root,'out'),config=join(root,'config');await mkdir(out);await mkdir(config);await assert.rejects(readReaderNumberingArtifact(config),/requires its independently pinned/);const bad=structuredClone(manifest);bad.book.pop();await writeFile(join(config,'reader-numbering.json'),JSON.stringify(bad));await assert.rejects(readReaderNumberingArtifact(config),/independently pinned/);await writeFile(join(config,'reader-numbering.json'),JSON.stringify(manifest));await writeFile(join(out,'index.html'),homeHtml());for(const record of web){const folder=join(out,record.key.slice(1));await mkdir(folder,{recursive:true});await writeFile(join(folder,'index.html'),webHtml(record));}await mkdir(join(out,'print'));await writeFile(join(out,'print/index.html'),bookHtml());const result=await validateReaderNumberingOutput(out,{sources,edition});assert.deepEqual(result.errors,[]);assert.equal(result.documents.size,49);await rm(join(out,'print/index.html'));assert((await validateReaderNumberingOutput(out,{sources,edition})).errors.some(error=>error.includes('missing actual numbered publication')));}finally{await rm(root,{recursive:true,force:true});}
});


test('sidebar actual controlled-content ancestry rejects wrong-part,outside-folder and cross-kind moves with flat order intact',()=>{
 const record=web.find(unit=>unit.key==='/docs/book/allocation-and-substitution'),html=webHtml(record),original=htmlParser.parse(html),order=doc=>doc.querySelector('#nd-sidebar').querySelectorAll('[data-reader-unit-name]').map(node=>node.getAttribute('data-reader-unit-name'));
 assert.deepEqual(check(html,record.key),[]);
 const movingPart=web.filter(unit=>unit.part===1).at(-1).key,movingFront=web.filter(unit=>unit.kind==='front-matter').at(-1).key,movingTopic=web.filter(unit=>unit.kind==='topic').at(-1).key,movingAppendix=web.find(unit=>unit.kind==='appendix').key;
 const move=(key,destination,position)=>{const doc=htmlParser.parse(html),name=doc.querySelector(`#nd-sidebar [data-reader-unit-name="${key}"]`),link=name.closest('a'),markup=link.outerHTML;link.remove();destination(doc).insertAdjacentHTML(position,markup);assert.deepEqual(order(doc),order(original),'mutation must preserve the complete flattened unit order');assert.deepEqual(doc.querySelectorAll('#nd-sidebar [data-reader-part-name]').map(node=>node.getAttribute('data-reader-part-name')),readerParts.map(part=>String(part.number)),'mutation must preserve flattened part-label order');const result=check(doc.toString(),record.key);assert(result.some(error=>/sidebar (folder membership|front matter)/.test(error)),JSON.stringify(result));const prepared=prepareNumberedReaderDocument(doc,record.key,{sources});assert(prepared.errors.length);assert.equal(prepared.document,null);};
 move(movingPart,doc=>doc.querySelector('#fixture-part-2 .sidebar-items'),'afterbegin');
 move(movingPart,doc=>doc.querySelector('#fixture-part-2').parentNode.querySelector('button'),'afterend');
 move(movingPart,doc=>doc.querySelector('#fixture-part-1').parentNode,'afterend');
 move(movingPart,doc=>doc.querySelector('#fixture-part-1').parentNode,'beforeend');
 move(movingFront,doc=>doc.querySelector('#fixture-part-1 .sidebar-items'),'afterbegin');
 move(movingTopic,doc=>doc.querySelector('#fixture-appendices .sidebar-items'),'afterbegin');
 move(movingAppendix,doc=>doc.querySelector('#fixture-topics .sidebar-items'),'beforeend');
});

test('sidebar ARIA boundary is qualified independently of labels and cannot contain nested substitute folders',()=>{
 const record=web.find(unit=>unit.key==='/docs/book/allocation-and-substitution'),html=webHtml(record);assert.deepEqual(check(html,record.key),[]);
 for(const changed of [html.replace('aria-controls="fixture-part-1"','aria-controls="fixture-part-2"'),html.replace('id="fixture-topics"','id="missing-topics"'),html.replace('aria-expanded="true"','aria-expanded="unknown"'),html.replace('>概念与实践专题</button>','>其他专题</button>')])assert(check(changed,record.key).some(error=>/sidebar folder/.test(error)));
 const doc=htmlParser.parse(html),name=doc.querySelector('#fixture-part-1 [data-reader-unit-name]'),link=name.closest('a'),markup=link.outerHTML;link.replaceWith(`<div data-state="open"><button aria-expanded="true" aria-controls="fixture-nested">其他分类</button><div id="fixture-nested">${markup}</div></div>`);assert(check(doc.toString(),record.key).some(error=>/sidebar.*(identity|roster|membership)/.test(error)));
});


test('sidebar native folder ancestry accepts the installed Fumadocs16.17.10 renderer and rejects the independent move',()=>{
 const title=(number,text)=>number?createElement(Fragment,null,createElement('span',{'data-reader-number':''},number),' ',createElement('span',{'data-reader-heading-title':''},text)):text;
 const link=record=>createElement('a',{key:record.key,href:record.key+'/'},createElement('span',{'data-reader-unit-name':record.key},title(record.label,record.title)));
 const folder=(key,name,items)=>createElement(SidebarFolder,{key,defaultOpen:true},createElement(SidebarFolderTrigger,null,name),createElement(SidebarFolderContent,null,createElement('div',null,items.map(link))));
 const tree=createElement(FrameworkProvider,{usePathname:()=>'/docs/book/allocation-and-substitution',useParams:()=>({}),useRouter:()=>({push(){},refresh(){}})},createElement(SidebarProvider,null,createElement('aside',{id:'nd-sidebar'},...web.filter(unit=>unit.kind==='front-matter').map(link),...readerParts.map(part=>folder(`part-${part.number}`,createElement('span',{'data-reader-part-name':part.number},title(part.label,part.title)),web.filter(unit=>unit.part===part.number))),folder('topics','概念与实践专题',web.filter(unit=>unit.kind==='topic')),folder('appendices','附录',web.filter(unit=>unit.kind==='appendix')))));
 const record=web.find(unit=>unit.key==='/docs/book/allocation-and-substitution'),base=webHtml(record),sidebar=renderToStaticMarkup(tree),html=base.replace(htmlParser.parse(base).querySelector('#nd-sidebar').outerHTML,sidebar);assert.deepEqual(check(html,record.key),[]);
 const doc=htmlParser.parse(html),root=doc.querySelector('#nd-sidebar'),content=part=>{const control=root.querySelector(`[data-reader-part-name="${part}"]`).closest('button').getAttribute('aria-controls');return root.querySelectorAll('[id]').find(node=>node.id===control);},last=content(1).querySelectorAll('a').at(-1),markup=last.outerHTML,flat=root.querySelectorAll('[data-reader-unit-name]').map(node=>node.getAttribute('data-reader-unit-name'));last.remove();content(2).insertAdjacentHTML('afterbegin',markup);assert.deepEqual(root.querySelectorAll('[data-reader-unit-name]').map(node=>node.getAttribute('data-reader-unit-name')),flat);assert(check(doc.toString(),record.key).some(error=>error.includes('sidebar folder membership differs')));
});

test('actual article unit and content title/number spans remain visible before semantic normalization',()=>{
 const html=bookHtml(),document=htmlParser.parse(html),article=document.querySelector('article[data-reader-route="book-revisable-judgment"]'),unitHeading=article.querySelector('[data-reader-heading-key="@unit"]'),contentHeading=article.querySelector('[data-reader-heading-key="对象连接"]');
 assert.deepEqual(prepareNumberedReaderDocument(document,'/print',{sources}).errors,[]);
 const climate=document.querySelector('article[data-reader-route="book-climate-equivalence"]'),appendix=document.querySelector('article[data-reader-route="/docs/appendices/climate-numerical-reconstruction"]');
 for(const heading of [unitHeading,contentHeading,climate.querySelector('[data-reader-heading-key="@unit"]'),climate.querySelector('[data-reader-heading-key="响应与指标"]'),appendix.querySelector('[data-reader-heading-key="@unit"]'),appendix.querySelector('[data-reader-heading-key="参考响应"]')])for(const selector of ['[data-reader-number]','[data-reader-heading-title]']){
  const span=heading.querySelector(selector);
  for(const hidden of ['hidden','aria-hidden="true"','style="display:none"','class="hidden"']){
   const changed=span.outerHTML.replace('<span ',`<span ${hidden} `),result=prepareNumberedReaderDocument(htmlParser.parse(html.replace(heading.outerHTML,heading.outerHTML.replace(span.outerHTML,changed))),'/print',{sources});
   assert(result.errors.some(error=>error.includes('concealed before normalization')));assert.equal(result.document,null);
  }
  const nested=span.outerHTML.replace(span.innerHTML,`<span hidden>${span.innerHTML}</span>`),result=prepareNumberedReaderDocument(htmlParser.parse(html.replace(heading.outerHTML,heading.outerHTML.replace(span.outerHTML,nested))),'/print',{sources});assert(result.errors.some(error=>error.includes('concealed before normalization')));assert.equal(result.document,null);
 }
 // The admission is article-specific; a legitimately closed navigation subtree
 // retains its own existing Fumadocs/sidebar qualification instead of being banned.
 const record=web.find(unit=>unit.key==='/docs/book/from-connected-results-to-conditional-judgment');assert.deepEqual(check(webHtml(record),record.key),[]);
});
