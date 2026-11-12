import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { assertReaderNumbering, bookTopicPresentation, readerNumberingManifest, readerParts, getPresentationUnits, getUnitNumbering, getUnitHeadingPlan, printReadingEntryAnchor, readNumberedHeading, readerContinuationContracts, getContinuationLink } from './reader-numbering.mjs';
import { printUnitAnchor, readSourceHeading } from './reader-book.mjs';

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b), compact=text=>text.replace(/\s+/g,''), hash=text=>createHash('sha256').update(text).digest('hex');
const apparatus='.chapter-notes,[data-legacy-for],[data-legacy-notice],[data-legacy-scope]';
const verifiedPagination=new WeakMap();
/** Qualification cannot be forged with a DOM attribute or retained after mutation. */
export const isVerifiedReaderPagination=node=>verifiedPagination.has(node)&&verifiedPagination.get(node)===hash(node.outerHTML);
const routeHref=(href,route)=>href===route||href===route+'/';
function fragment(href){if(typeof href!=='string'||!href.startsWith('#'))return null;try{return decodeURIComponent(href.slice(1));}catch{return null;}}
function metadata(raw){const front=/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw??'')?.[1]??'';const field=name=>new RegExp(`^${name}:\\s*(.+?)\\s*$`,'m').exec(front)?.[1]?.replace(/^(['"])(.*)\1$/,'$2');return {title:field('title'),description:field('description')??''};}

export async function readReaderNumberingArtifact(configDirectory){
  let value;try{value=JSON.parse(await readFile(join(configDirectory,'reader-numbering.json'),'utf8'));}catch(error){if(error.code==='ENOENT')throw new Error('Current reader publication requires its independently pinned reader-numbering.json');throw error;}
  assertReaderNumbering(value);return value;
}

/** Actual discovered source and edition joins supplement the independent manifest pin. */
export function validateReaderNumberingSources(value,sources,edition){
  assertReaderNumbering(value);const errors=[],units=[...value.book,...value.web];
  if(!edition||!same(edition.units.map(({key,source,kind})=>({key,source,kind})),value.book.map(({key,source,kind})=>({key,source,kind}))))errors.push('Numbered book roster differs from the explicit current edition');
  const known=new Set(units.map(unit=>unit.source));
  for(const route of sources.keys())if(!known.has(route)&&route!=='/docs/appendices')errors.push(`Actual reader source lacks numbered publication identity: ${route}`);
  for(const route of known){const raw=sources.get(route);if(typeof raw!=='string'){errors.push(`Missing actual numbered reader source: ${route}`);continue;}
    const titles=[...new Set(units.filter(unit=>unit.source===route).map(unit=>unit.title))];if(titles.length!==1||metadata(raw).title!==titles[0])errors.push(`Actual source title differs from pinned reader numbering: ${route}`);
    const actual=[];let fence=null;
    for(const line of raw.split(/\r?\n/)){const mark=/^\s*(`{3,}|~{3,})/.exec(line);if(mark){if(!fence)fence=mark[1][0];else if(fence===mark[1][0])fence=null;continue;}if(fence)continue;
      const heading=/^(#{1,6})\s+(.+?)\s*$/.exec(line);if(!heading)continue;const {title,id}=readSourceHeading(heading[2]);actual.push({title,depth:heading[1].length,...(title!==heading[2]?{id}:{})});}
    const expected=value.headings[route]?.filter(heading=>heading.type==='mdx')??[];
    if(actual.length!==expected.length||actual.some((heading,index)=>heading.title!==expected[index].title||heading.depth!==expected[index].depth||(heading.id!==undefined&&heading.id!==expected[index].id)))errors.push(`Actual source heading roster differs from pinned numbered hierarchy: ${route}`);
  }
  return errors;
}

/** Fumadocs UI16.17.10 default Folder renders one Collapsible root whose
 * trigger and ID-addressed content are direct siblings. Bind actual controlled
 * ancestry, including non-part folders, rather than flattened label ordering.
 */
function sidebarFolderErrors(sidebar,units){
  const errors=[],byId=new Map(),folders=[],expectedKinds=[...readerParts.map(part=>`part:${part.number}`),'topic','appendix'];
  for(const node of sidebar.querySelectorAll('[id]')){const found=byId.get(node.id)??[];found.push(node);byId.set(node.id,found);}
  for(const trigger of sidebar.querySelectorAll('button[aria-controls]')){
    const markers=trigger.querySelectorAll('[data-reader-part-name]'),text=trigger.text;
    const part=markers.length===1?readerParts.find(part=>String(part.number)===markers[0].getAttribute('data-reader-part-name')):null;
    const kind=part?`part:${part.number}`:text==='概念与实践专题'?'topic':text==='附录'?'appendix':null;
    const controlled=trigger.getAttribute('aria-controls'),targets=byId.get(controlled)??[],content=targets[0],root=trigger.parentNode;
    // Other sidebar controls (e.g. a dialog trigger) do not own tree content.
    if(!kind&&!targets.length)continue;
    if(!kind||markers.length!==(part?1:0)||text!==(part?`${part.label} ${part.title}`:kind==='topic'?'概念与实践专题':'附录'))errors.push('Actual website sidebar has unknown or changed folder identity');
    if(!controlled||/\s/.test(controlled)||targets.length!==1||root?.tagName!=='DIV'||!root.hasAttribute('data-state')||content?.tagName!=='DIV'||content.parentNode!==root||!['true','false'].includes(trigger.getAttribute('aria-expanded'))){errors.push('Actual website sidebar folder lacks its unique native controlled-content boundary');continue;}
    folders.push({kind,root,content});
  }
  if(!same(folders.map(folder=>folder.kind),expectedKinds))errors.push('Actual website sidebar folder roster/order differs');
  const roots=new Map(folders.map(folder=>[folder.root,folder])),contents=new Map(folders.map(folder=>[folder.content,folder]));
  for(const name of sidebar.querySelectorAll('[data-reader-unit-name]')){
    const record=units.find(unit=>unit.key===name.getAttribute('data-reader-unit-name'));if(!record)continue;
    const rootAncestors=[],contentAncestors=[];let parent=name.parentNode;
    while(parent&&parent!==sidebar){if(roots.has(parent))rootAncestors.push(roots.get(parent));if(contents.has(parent))contentAncestors.push(contents.get(parent));parent=parent.parentNode;}
    const expected=record.kind==='front-matter'?null:record.kind==='chapter'?`part:${record.part}`:record.kind;
    if(expected===null){if(rootAncestors.length||contentAncestors.length)errors.push(`Actual website sidebar front matter must remain outside all folders: ${record.key}`);}
    else if(rootAncestors.length!==1||contentAncestors.length!==1||rootAncestors[0]!==contentAncestors[0]||rootAncestors[0].kind!==expected)errors.push(`Actual website sidebar folder membership differs: ${record.key}`);
  }
  return errors;
}

function validation(document,path,sources){
  const errors=[],pairs=new Map(),normalizedHeadings=[],pagination=[],viewLabels=[],semanticNavigation=[],allNumbers=new Set(),allTitles=new Set(),qualifiedTreeNames=new Set();
  const fail=message=>errors.push(`${path}: ${message}`);
  function plain(node,title,label){if(!node||node.text!==title||node.querySelectorAll('[data-reader-number],[data-reader-heading-title]').length)fail(`${label} must retain its exact unnumbered title`);}
  function numbered(node,expected,label){
    if(!node){fail(`Missing ${label}`);return false;}
    try{readNumberedHeading(node,expected);if(!/^H[1-6]$/.test(node.tagName)&&node.text!==`${expected.number} ${expected.title}`)throw new Error('exact navigation number/title text required');const number=node.querySelector('[data-reader-number]'),title=node.querySelector('[data-reader-heading-title]'),siblings=number.parentNode.childNodes,at=siblings.indexOf(number),gap=siblings[at+1];
      if(number.parentNode!==title.parentNode||gap?.nodeType!==3||gap.rawText!==' '||siblings[at+2]!==title)throw new Error('exact adjacent number-space-title sequence required');
      pairs.set(node,{number,title,gap});allNumbers.add(number);allTitles.add(title);return true;
    }catch(error){fail(`${label}: ${error.message}`);return false;}
  }
  // Inspect authored article headings before verified number/title wrappers are
  // removed. Collapsed navigation/TOC labels are intentionally outside this check.
  function articleHeadingVisibility(heading,label){
    if(!heading)return;
    const spans=heading.querySelectorAll('[data-reader-number],[data-reader-heading-title]');
    const hidden=node=>{for(let current=node;current;current=current.parentNode){if(current.hasAttribute?.('hidden')||current.getAttribute?.('aria-hidden')==='true'||/(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:[;\s]|$))/i.test(current.getAttribute?.('style')??'')||/(?:^|\s)(?:hidden|sr-only|invisible|opacity-0)(?:\s|$)/.test(current.getAttribute?.('class')??''))return true;}return false;};
    for(const span of spans)if(hidden(span)||span.querySelectorAll('*').some(child=>compact(child.text)&&hidden(child)))fail(`Actual article heading number/title is concealed before normalization: ${label}`);
  }
  function unit(node,view,record){
    if(!node){fail(`Missing ${view} reading unit ${record.key}`);return;}
    const print=view==='book',header=node.querySelectorAll('h1,h2,h3,h4,h5,h6').filter(h=>h.getAttribute('data-reader-heading-key')==='@unit');
    if(header.length!==1)fail(`Unit ${record.key} requires exactly one @unit heading`);
    const h=header[0],tag=print?(record.kind==='front-matter'?'H2':'H3'):'H1';
    if(h?.tagName!==tag)fail(`Wrong actual unit heading depth: ${record.key}`);
    articleHeadingVisibility(h,record.key);
    if(record.label){if(numbered(h,{number:record.label,title:record.title,key:'@unit'},`unit ${record.key}`))normalizedHeadings.push({node:h,tag:print?'h2':'h1'});}else plain(h,record.title,`front matter ${record.key}`);
    if(node.getAttribute('data-reader-title')!==record.title||node.getAttribute('data-reader-route')!==record.key)fail(`Wrong native unit title/identity: ${record.key}`);
    if(print&&node.id!==printUnitAnchor(record.key))fail(`Wrong native printed unit anchor: ${record.key}`);
    const readingEntry = printReadingEntryAnchor(record.key);
    if (print && readingEntry !== printUnitAnchor(record.key)) {
      if (h?.id !== readingEntry || h.getAttribute('tabindex') !== '-1' || h.parentNode !== node)
        fail(`Wrong current printed reading heading target: ${record.key}`);
      targetExists(readingEntry, 'Current printed reading heading');
    }
    if(print&&record.part&&node.closest('[data-reader-part-group]')?.getAttribute('data-reader-part-group')!==String(record.part))fail(`Wrong actual part membership: ${record.key}`);
    const content=node.querySelectorAll('h1,h2,h3,h4,h5,h6').filter(heading=>heading!==h&&!heading.closest(apparatus)),plan=getUnitHeadingPlan(view,record.key);
    if(!same(content.map(heading=>heading.getAttribute('data-reader-heading-key')),plan.map(heading=>heading.key)))fail(`Complete content heading order/identity differs: ${record.key}`);
    for(const [index,slot]of plan.entries()){
      const heading=content[index],actualDepth=print?Math.min(slot.depth+2,6):slot.depth;
      if(heading?.tagName!==`H${actualDepth}`)fail(`Wrong actual content heading depth: ${record.key} ${slot.key}`);
      articleHeadingVisibility(heading,`${record.key} ${slot.key}`);
      if(slot.id&&heading?.id!==(print?`${printUnitAnchor(record.key)}-${slot.id}`:slot.id))fail(`Wrong stable MDX heading anchor: ${record.key} ${slot.key}`);
      if(numbered(heading,{...slot,key:slot.key},`heading ${record.key} ${slot.key}`))normalizedHeadings.push({node:heading,tag:`h${print?Math.min(slot.depth+1,6):slot.depth}`});
    }
    for(const contract of readerContinuationContracts.filter(contract=>(print?contract.bookSource??contract.route:contract.route)===record.source)) {
      const wanted=getContinuationLink(view,print?contract.bookSourceKey??contract.route:contract.route,contract.sourceHref,contract.sourceLabel),context=print?contract.bookContext:contract.webContext;
      const candidates=node.querySelectorAll('p a[href]').filter(link=>!link.closest(`${apparatus},.docs-pagination`)&&(link.getAttribute('href')===wanted.href||link.getAttribute('href')===contract.sourceHref||link.text===contract.sourceLabel||link.text===contract.bookLabel));
      if(candidates.length!==1||candidates[0].getAttribute('href')!==wanted.href||candidates[0].text!==wanted.label||candidates[0].closest('p')?.text!==context||candidates[0].closest('p')?.querySelectorAll('a').length!==1)fail(`Qualified ordinary continuation differs: ${contract.key}`);
      if(print)targetExists(printReadingEntryAnchor(contract.bookKey),`Continuation ${contract.key}`);
    }
    for(const notes of node.querySelectorAll('.chapter-notes')){const headings=notes.querySelectorAll('h1,h2,h3,h4,h5,h6');if(headings.length!==1||headings[0].tagName!==(print?'H4':'H2')||headings[0].text!=='注释'||headings[0].querySelector('[data-reader-number],[data-reader-heading-title]')||headings[0].getAttribute('data-reader-heading-key'))fail(`Annotation apparatus may not acquire content numbering: ${record.key}`);else if(print)normalizedHeadings.push({node:headings[0],tag:'h3'});}
  }
  function titleContainer(node,record,label){if(record.label)numbered(node,{number:record.label,title:record.title},label);else plain(node,record.title,label);}
  const idCounts=new Map();for(const node of document.querySelectorAll('[id]'))idCounts.set(node.id,(idCounts.get(node.id)??0)+1);
  function targetExists(id,label){if(idCounts.get(id)!==1)fail(`${label} must resolve to one actual native target: ${id}`);}
  if(path==='/print'){
    const expected=getPresentationUnits('book'),articles=document.querySelectorAll('article');
    if(!same(articles.map(node=>node.getAttribute('data-reader-route')),expected.map(unit=>unit.key)))fail('Actual full book unit order differs from the independent numbered roster');
    expected.forEach((record,index)=>unit(articles[index],'book',record));
    const currentEntries = expected.map(record => printReadingEntryAnchor(record.key)).filter(id => id.startsWith('print-reading-unit-'));
    const actualEntries = document.querySelectorAll('[id^="print-reading-unit-"]').map(node => node.id);
    if (!same(actualEntries, currentEntries)) fail('Current printed reading anchors differ from the selected units');
    const groups=document.querySelectorAll('[data-reader-part-group]'),parts=document.querySelectorAll('[data-reader-part]');
    if(!same(groups.map(node=>node.getAttribute('data-reader-part-group')),readerParts.map(part=>String(part.number)))||!same(parts.map(node=>node.getAttribute('data-reader-part')),readerParts.map(part=>String(part.number))))fail('Actual seven-part body order differs');
    readerParts.forEach((part,index)=>{const heading=parts[index],group=groups[index];if(heading?.tagName!=='H2'||heading.id!==`print-part-${part.number}`||heading.closest('[data-reader-part-group]')!==group)fail(`Wrong actual part heading/target ${part.number}`);numbered(heading,{number:part.label,title:part.title},`part ${part.number}`);const intro=group?.querySelectorAll('.print-part-introduction');if(intro?.length!==1||intro[0].text!==part.introduction)fail(`Part ${part.number} introduction differs`);});
    const navs=document.querySelectorAll('nav[data-reader-contents="book"]');if(navs.length!==1)fail('Exactly one actual book contents is required');
    const noteUnits = expected.filter(unit => unit.kind === 'topic').map(unit => unit.key);
    const noteHeadings = document.querySelectorAll('[data-reader-book-notes-heading]');
    const contentsNotes = noteHeadings.find(node => node.getAttribute('data-reader-book-notes-heading') === 'contents');
    const bodyNotes = noteHeadings.find(node => node.getAttribute('data-reader-book-notes-heading') === 'body');
    if (noteHeadings.length !== 2 || contentsNotes?.tagName !== 'H3' || bodyNotes?.tagName !== 'H2'
        || contentsNotes?.text !== bookTopicPresentation.title || bodyNotes?.text !== bookTopicPresentation.title
        || contentsNotes.closest('nav') !== navs[0]
        || !same(contentsNotes.nextElementSibling?.querySelectorAll('[data-reader-toc-unit]').map(node => node.getAttribute('data-reader-toc-unit')), noteUnits)
        || !same(bodyNotes.parentNode?.querySelectorAll('article[data-reader-route]').map(node => node.getAttribute('data-reader-route')), noteUnits))
      fail('Actual book supplemental note headings or membership differ');
    const nav=navs[0];if(nav){const links=nav.querySelectorAll('[data-reader-toc-unit]');if(!same(links.map(link=>link.getAttribute('data-reader-toc-unit')),expected.map(unit=>unit.key)))fail('Complete book contents unit order differs');expected.forEach((record,index)=>{const link=links[index],id=printReadingEntryAnchor(record.key);if(link?.tagName!=='A'||fragment(link.getAttribute('href'))!==id)fail(`Wrong book contents unit href ${record.key}`);titleContainer(link,record,`contents unit ${record.key}`);if(record.part&&link?.closest('section')?.querySelector('[data-reader-toc-part]')?.getAttribute('data-reader-toc-part')!==String(record.part))fail(`Wrong hierarchical contents part: ${record.key}`);targetExists(id,'Book contents');});
      const wanted=expected.flatMap(record=>getUnitHeadingPlan('book',record.key).filter(slot=>slot.type==='mdx').map(slot=>({record,slot}))),headings=nav.querySelectorAll('[data-reader-toc-heading]');if(headings.length!==wanted.length)fail('Complete book section contents differs');wanted.forEach(({record,slot},index)=>{const link=headings[index],id=`${printUnitAnchor(record.key)}-${slot.id}`;if(link?.tagName!=='A'||link.getAttribute('data-reader-route')!==record.key||link.getAttribute('data-reader-toc-heading')!==slot.key||fragment(link.getAttribute('href'))!==id)fail(`Wrong native section contents target/order ${record.key} ${slot.key}`);numbered(link,{number:slot.number,title:slot.title},`contents heading ${record.key} ${slot.key}`);let owner=link?.parentNode,ownerKey=null;while(owner&&owner!==nav){const parentLink=owner.childNodes?.find(node=>node.tagName==='A'&&node.hasAttribute('data-reader-toc-unit'));if(parentLink){ownerKey=parentLink.getAttribute('data-reader-toc-unit');break;}owner=owner.parentNode;}if(ownerKey!==record.key)fail(`Wrong contents section parent: ${record.key} ${slot.key}`);targetExists(id,'Section contents');});
      const partLinks=nav.querySelectorAll('[data-reader-toc-part]');if(!same(partLinks.map(node=>node.getAttribute('data-reader-toc-part')),readerParts.map(part=>String(part.number))))fail('Book part contents order differs');readerParts.forEach((part,index)=>{const parent=partLinks[index],link=parent?.querySelector('a');if(parent?.tagName!=='H3'||fragment(link?.getAttribute('href'))!==`print-part-${part.number}`)fail(`Wrong part contents target ${part.number}`);numbered(link,{number:part.label,title:part.title},`part contents ${part.number}`);});
    }
  }else if(getUnitNumbering('web',path)){
    const record=getUnitNumbering('web',path),articles=document.querySelectorAll('article');if(articles.length!==1)fail('Exactly one actual website reading unit required');unit(articles[0],'web',record);
    const expected=getUnitHeadingPlan('web',path).filter(slot=>slot.type==='mdx'),tocs=document.querySelectorAll('#nd-toc,[data-toc-popover-content]');if(expected.length&&document.querySelectorAll('#nd-toc').length!==1)fail('Actual website contents missing');
    for(const toc of tocs){const links=toc.querySelectorAll('a[href]').filter(link=>link.getAttribute('href')?.startsWith('#'));if(toc.hasAttribute('data-toc-popover-content')&&!links.length)continue;if(links.length!==expected.length)fail('Actual website local contents roster differs');expected.forEach((slot,index)=>{const link=links[index];if(fragment(link?.getAttribute('href'))!==slot.id)fail(`Wrong website native contents target/order ${slot.key}`);numbered(link,{number:slot.number,title:slot.title},`website contents ${slot.key}`);targetExists(slot.id,'Website contents');});}
    const labels=articles[0]?.querySelectorAll('.reader-view-label')??[],expectedLabel=`网页细读目录${record.partTitle?` · ${record.partLabel} ${record.partTitle}`:''} · 书籍目录与连续阅读`;
    if(labels.length!==1||labels[0].text!==expectedLabel||!same(labels[0].querySelectorAll('a').map(link=>({href:link.getAttribute('href'),text:link.text})),[{href:'/print/',text:'书籍目录与连续阅读'}]))fail('Actual view/edition navigation label differs');else viewLabels.push(labels[0]);
    // Installed Fumadocs16.17.10: default Breadcrumb excludes the page and
    // renders its sole non-index folder as DIV > SPAN > folder name. It has
    // no dedicated data attribute; bind the native classes and header position.
    const elements=node=>node?.childNodes.filter(child=>child.nodeType===1)??[],onlyClass=(node,value)=>node?.getAttribute('class')===value&&same(Object.keys(node.attributes),['class']);
    const breadcrumbClass='flex items-center gap-1.5 text-sm text-fd-muted-foreground',article=articles[0],children=elements(article),breadcrumbs=article?.querySelectorAll('div').filter(node=>node.getAttribute('class')===breadcrumbClass)??[];
    if(record.kind==='front-matter') {if(breadcrumbs.length||children[0]!==labels[0])fail('Front matter must retain its native breadcrumb-free header');}
    else {
      const crumb=children[0],wrapper=elements(crumb)[0],part=readerParts.find(part=>part.number===record.part),names=crumb?.querySelectorAll('[data-reader-part-name]')??[],category=record.kind==='topic'?'概念与实践专题':'附录';
      let valid=breadcrumbs.length===1&&breadcrumbs[0]===crumb&&crumb?.tagName==='DIV'&&onlyClass(crumb,breadcrumbClass)&&elements(crumb).length===1&&wrapper?.tagName==='SPAN'&&onlyClass(wrapper,'truncate text-fd-primary font-medium')&&children[1]===labels[0]&&!crumb.querySelector('a');
      if(part){const name=names[0];valid&&=names.length===1&&elements(wrapper).length===1&&elements(wrapper)[0]===name&&name?.tagName==='SPAN'&&name.getAttribute('data-reader-part-name')===String(part.number)&&same(Object.keys(name.attributes),['data-reader-part-name'])&&crumb.text===`${part.label} ${part.title}`;
        if(valid){qualifiedTreeNames.add(name);numbered(name,{number:part.label,title:part.title},`current path breadcrumb part ${part.number}`);}
      }else valid&&=names.length===0&&elements(wrapper).length===0&&crumb.text===category;
      if(!valid)fail('Actual native breadcrumb folder/path/order differs');else semanticNavigation.push(crumb);
    }
    // The native mobile trigger repeats the current tree page name before any
    // heading becomes active. Bind the unique closed popover, sibling content,
    // exact current route and the two initial title slots; no generic exemption.
    const popovers=document.querySelectorAll('[data-toc-popover]'),triggers=document.querySelectorAll('[data-toc-popover-trigger]'),contents=document.querySelectorAll('[data-toc-popover-content]');
    if(expected.length){
      const root=popovers[0],header=elements(root)[0],trigger=triggers[0],content=contents[0],slots=elements(trigger)[1],slotChildren=elements(slots),name=slotChildren[0]?.querySelector('[data-reader-unit-name]'),layout=document.querySelector('#nd-docs-layout'),main=article?.parentNode;
      const valid=popovers.length===1&&triggers.length===1&&contents.length===1&&document.querySelectorAll('#nd-docs-layout').length===1
        &&root?.tagName==='DIV'&&root.parentNode===layout&&main?.tagName==='MAIN'&&main.parentNode===layout&&elements(layout).indexOf(root)<elements(layout).indexOf(main)
        &&root.getAttribute('data-state')==='closed'&&elements(root).length===1&&header?.tagName==='HEADER'&&elements(header).length===2&&elements(header)[0]===trigger&&elements(header)[1]===content
        &&trigger?.tagName==='BUTTON'&&trigger.getAttribute('type')==='button'&&trigger.getAttribute('aria-expanded')==='false'&&trigger.getAttribute('data-state')==='closed'
        &&content?.tagName==='DIV'&&content.hasAttribute('hidden')&&content.getAttribute('data-state')==='closed'&&content.id&&!/\s/.test(content.id)&&idCounts.get(content.id)===1
        &&elements(trigger).length===3&&elements(trigger)[0].tagName==='SVG'&&elements(trigger)[2].tagName==='SVG'&&slots?.tagName==='SPAN'&&slotChildren.length===2&&slotChildren.every(node=>node.tagName==='SPAN')
        &&onlyClass(slots,'grid flex-1 *:my-auto *:row-start-1 *:col-start-1')&&onlyClass(slotChildren[0],'truncate transition-[opacity,translate,color]')&&onlyClass(slotChildren[1],'truncate transition-[opacity,translate] opacity-0 translate-y-full pointer-events-none')
        &&slotChildren[1].text===''&&elements(slotChildren[1]).length===0&&elements(slotChildren[0]).length===1&&elements(slotChildren[0])[0]===name&&name?.tagName==='SPAN'
        &&same(Object.keys(name.attributes),['data-reader-unit-name'])&&name.getAttribute('data-reader-unit-name')===record.key&&trigger.querySelectorAll('[data-reader-unit-name]').length===1&&!trigger.querySelector('a,[data-reader-part-name]')&&trigger.text===`${record.label} ${record.title}`;
      if(valid){qualifiedTreeNames.add(name);titleContainer(name,record,`current route mobile contents title ${record.key}`);}else fail('Actual native mobile contents current route/title boundary differs');
    }else if(popovers.length||triggers.length||contents.length)fail('Unqualified mobile contents on a page without source headings');
    const sidebars=document.querySelectorAll('#nd-sidebar');
    if(sidebars.length!==1)fail('Actual explicit website sidebar is missing or repeated');
    else {const names=sidebars[0].querySelectorAll('[data-reader-unit-name]'),web=getPresentationUnits('web');if(!same(names.map(node=>node.getAttribute('data-reader-unit-name')),web.map(unit=>unit.key)))fail('Actual website sidebar complete unit order differs');names.forEach((node,index)=>{if(!web[index]||!routeHref(node.closest('a')?.getAttribute('href'),web[index].key))fail('Actual sidebar unit target differs');});if(!same(sidebars[0].querySelectorAll('[data-reader-part-name]').map(node=>node.getAttribute('data-reader-part-name')),readerParts.map(part=>String(part.number))))fail('Actual website sidebar seven-part order differs');for(const error of sidebarFolderErrors(sidebars[0],web))fail(error);}
    const footers=articles[0]?.querySelectorAll('.docs-pagination')??[],units=getPresentationUnits('web'),at=units.findIndex(unit=>unit.key===record.key),neighbors=[units[at-1],units[at+1]].filter(Boolean);
    if(record.key!=='/docs'){
      if(footers.length!==1)fail('Actual numbered website pagination missing or repeated');else{const footer=footers[0],links=footer.querySelectorAll('a');if(links.length!==neighbors.length)fail('Actual website pagination roster differs');neighbors.forEach((neighbor,index)=>{const link=links[index],desc=metadata(sources?.get(neighbor.source)).description,name=link?.querySelector(`[data-reader-unit-name="${neighbor.key}"]`);if(!link||!routeHref(link.getAttribute('href'),neighbor.key)||compact(link.text)!==compact(`${neighbor.label??''} ${neighbor.title}${desc}`))fail(`Actual website pagination content differs: ${neighbor.key}`);if(!name)fail(`Missing qualified pagination title: ${neighbor.key}`);});pagination.push(footer);}
    }else if(footers.length)fail('Front preface must not add an unqualified pagination row');
  }else if(path==='/'){
    const contents=document.querySelectorAll('[data-reader-contents="web"]');if(contents.length!==1)fail('Actual website contents missing or repeated');const container=contents[0];
    if(container){const expected=getPresentationUnits('web').filter(unit=>unit.kind==='chapter'),links=container.querySelectorAll('[data-reader-web-unit]');if(!same(links.map(link=>link.getAttribute('data-reader-web-unit')),expected.map(unit=>unit.key)))fail('Website37 fine-unit contents order differs');expected.forEach((record,index)=>{const link=links[index],heading=link?.querySelector('h4');if(!link||!routeHref(link.getAttribute('href'),record.key))fail(`Wrong fine-unit contents href ${record.key}`);titleContainer(heading,record,`fine-unit contents ${record.key}`);});
      const parts=container.querySelectorAll('[data-reader-web-part]');if(!same(parts.map(node=>node.getAttribute('data-reader-web-part')),readerParts.map(part=>String(part.number))))fail('Website seven-part directory order differs');readerParts.forEach((part,index)=>{numbered(parts[index],{number:part.label,title:part.title},`website part ${part.number}`);const group=parts[index]?.parentNode,actual=group?.querySelectorAll('[data-reader-web-unit]').map(node=>node.getAttribute('data-reader-web-unit'));if(!same(actual,expected.filter(unit=>unit.part===part.number).map(unit=>unit.key)))fail(`Website directory part membership differs: ${part.number}`);});}
    const actualTopics=[];
    for(const heading of document.querySelectorAll('h3')){const link=heading.closest('a[href]'),record=link&&getPresentationUnits('web').find(unit=>unit.kind==='topic'&&routeHref(link.getAttribute('href'),unit.key));if(record){actualTopics.push(record.key);titleContainer(heading,record,`website topic ${record.key}`);}}
    if(!same(actualTopics,getPresentationUnits('web').filter(unit=>unit.kind==='topic').map(unit=>unit.key)))fail('Website topic directory roster differs');
  }
  for(const node of document.querySelectorAll('[data-reader-unit-name]')){if(qualifiedTreeNames.has(node))continue;const record=getUnitNumbering('web',node.getAttribute('data-reader-unit-name'));if(!record||!node.closest('#nd-sidebar,.docs-pagination'))fail('Unknown or misplaced cloned website unit name');else titleContainer(node,record,`cloned unit ${record.key}`);}
  for(const node of document.querySelectorAll('[data-reader-part-name]')){if(qualifiedTreeNames.has(node))continue;const part=readerParts.find(part=>String(part.number)===node.getAttribute('data-reader-part-name'));if(!part||!node.closest('#nd-sidebar'))fail('Unknown or misplaced cloned website part name');else numbered(node,{number:part.label,title:part.title},`cloned part ${part.number}`);}
  for(const node of document.querySelectorAll('[data-reader-number]'))if(!allNumbers.has(node))fail('Unqualified visible number marker outside the exact numbered plan');
  for(const node of document.querySelectorAll('[data-reader-heading-title]'))if(!allTitles.has(node))fail('Unqualified title marker outside the exact numbered plan');
  return {errors,pairs,normalizedHeadings,pagination,viewLabels,semanticNavigation};
}

export function validateReaderNumberingDocument(document,path,{sources=new Map()}={}){assertReaderNumbering();return validation(document,path,sources).errors;}
/** Only a fully verified clone is normalized. Original rendered bytes are never rewritten. */
export function prepareNumberedReaderDocument(document,path,{sources=new Map()}={}){
  assertReaderNumbering();const clone=htmlParser.parse(document.toString()),result=validation(clone,path,sources);if(result.errors.length)return {errors:result.errors,document:null};
  for(const {number,title,gap}of result.pairs.values()){number.remove();gap.remove();title.replaceWith(title.innerHTML);}
  for(const {node,tag}of result.normalizedHeadings){if(node.tagName.toLowerCase()!==tag){const attrs=Object.entries(node.attributes).map(([key,value])=>`${key}="${String(value).replaceAll('&','&amp;').replaceAll('"','&quot;')}"`).join(' '),replacement=htmlParser.parse(`<${tag} ${attrs}>${node.innerHTML}</${tag}>`).firstChild;node.replaceWith(replacement);}}
  for(const node of result.viewLabels)node.remove();
  // Qualified native navigation is not manuscript content. Remove only these
  // exact verified clone nodes after the entire document has passed admission.
  for(const node of result.semanticNavigation)node.remove();
  for(const node of result.pagination)verifiedPagination.set(node,hash(node.outerHTML));
  return {errors:[],document:clone};
}

/** Production entrypoint always reads the artifact next to this actual export. */
export async function validateReaderNumberingOutput(root,{sources,edition}={}){
  const value=await readReaderNumberingArtifact(resolve(root,'..','config')),errors=validateReaderNumberingSources(value,sources??new Map(),edition),documents=new Map();
  for(const path of ['/',...getPresentationUnits('web').map(unit=>unit.key),'/print']){
    const file=join(root,path==='/'?'index.html':`${path.slice(1)}/index.html`);let raw;try{raw=await readFile(file,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;errors.push(`${path}: missing actual numbered publication output`);continue;}
    const result=prepareNumberedReaderDocument(htmlParser.parse(raw),path,{sources});errors.push(...result.errors);if(result.document)documents.set(path,result.document);
  }
  return {errors:[...new Set(errors)],documents};
}


/** A scoped real-widget test/semantic adapter still verifies every actual marker.
 * Production additionally verifies the complete containing unit and edition.
 */
export function prepareNumberedCaseElement(element,view,route){
  assertReaderNumbering();const clone=htmlParser.parse(element.outerHTML).firstChild,plan=getUnitHeadingPlan(view,route).filter(slot=>slot.type==='case'),headings=clone.querySelectorAll('h1,h2,h3,h4,h5,h6'),errors=[],numbers=new Set(),titles=new Set();
  if(!same(headings.map(node=>node.getAttribute('data-reader-heading-key')),plan.map(slot=>slot.key)))errors.push('Actual numbered case full heading roster differs');
  for(const [index,slot]of plan.entries()) {
    const node=headings[index];try {readNumberedHeading(node,slot);const number=node.querySelector('[data-reader-number]'),title=node.querySelector('[data-reader-heading-title]'),siblings=number.parentNode.childNodes,at=siblings.indexOf(number),gap=siblings[at+1];
      if(node.tagName!==`H${view==='book'?Math.min(slot.depth+2,6):slot.depth}`||number.parentNode!==title.parentNode||gap?.nodeType!==3||gap.rawText!==' '||siblings[at+2]!==title)throw new Error('Actual case hierarchy or exact marker sequence differs');numbers.add(number);titles.add(title);
    }catch(error){errors.push(error.message);}
  }
  if(clone.querySelectorAll('[data-reader-number]').some(node=>!numbers.has(node))||clone.querySelectorAll('[data-reader-heading-title]').some(node=>!titles.has(node)))errors.push('Unqualified marker outside actual case heading plan');
  if(errors.length)return {errors,element:null};
  for(const [index,slot]of plan.entries()) {const node=headings[index],number=node.querySelector('[data-reader-number]'),title=node.querySelector('[data-reader-heading-title]'),siblings=number.parentNode.childNodes,gap=siblings[siblings.indexOf(number)+1];number.remove();gap.remove();title.replaceWith(title.innerHTML);
    const tag=`h${view==='book'?Math.min(slot.depth+1,6):slot.depth}`,attrs=Object.entries(node.attributes).map(([key,value])=>`${key}="${String(value).replaceAll('&','&amp;').replaceAll('"','&quot;')}"`).join(' ');if(node.tagName.toLowerCase()!==tag)node.replaceWith(htmlParser.parse(`<${tag} ${attrs}>${node.innerHTML}</${tag}>`).firstChild);
  }
  return {errors:[],element:clone};
}
