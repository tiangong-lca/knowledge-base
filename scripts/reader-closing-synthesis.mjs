import { publicCatalog } from './knowledge.mjs';
import { createHash } from 'node:crypto';
import original from '../config/closing-synthesis-original.json' with { type: 'json' };
import captured from '../config/closing-synthesis-heading-history.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { validateExchangeAnnotationOutput, unaccountedReaderText } from './reader-exchange-semantics.mjs';
import { isVerifiedReaderPagination } from './reader-numbering-output.mjs';
import { readerParagraphText, validateReaderHistoricalText } from './reader-publication-text.mjs';

export const closingSynthesisKey = 'book-revisable-judgment';
export const closingSynthesisManuscript = '/monograph/revisable-judgment';
export const closingSynthesisTitle = '可修订的判断';
export const closingSynthesisRoutes = ['/docs/book/connecting-objects-references-and-time','/docs/book/from-connected-results-to-conditional-judgment'];
export const closingSynthesisSections = [
  {id:'对象连接',title:'对象连接',claimIds:['cl-connect-object-before-unit','cl-connect-service-changes-system','cl-connect-money-has-roles','cl-connect-three-scalings','cl-connect-time-relations','cl-connect-prospective-two-questions','cl-connect-reuse-keeps-relation']},
  {id:'覆盖状态',title:'覆盖状态',claimIds:['cl-connect-target-and-distribution','cl-connect-zero-needs-origin','cl-connect-proxy-and-outcome','cl-connect-evidence-to-probability','cl-connect-coverage-and-overlap']},
  {id:'判断理由',title:'判断理由',claimIds:['cl-connect-values-stay-specific','cl-connect-useful-without-winner','cl-connect-review-does-not-transfer','cl-book-conclusion-conditions']},
  {id:'历史与修订',title:'历史与修订',claimIds:['cl-closing-container-comparison-and-policy','cl-closing-wall-substrate','cl-closing-pack-threshold-and-review','cl-pack-limits','cl-connect-next-evidence-at-link','cl-closing-historical-return']},
];
// Qualified after independent semantic/continuous reader review and main acceptance.
// A test may qualify only its explicit fixture by supplying a separate digest.
export const closingSynthesisProseDigest = '55d62ac04b9c4ceec33cc6fec8b50dd0bce85232c88ddb7093ffeb1c8069a1f3';
export const closingSynthesisHeadingDigest = '73c45aaf40001377b9ca10dcb09e7bd698724508174a2a323211cd63a052e074';
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value==='object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])])) : value;
const sameRecord = (a,b) => same(ordered(a),ordered(b));
export const closingSynthesisDigest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rawDigest = value => createHash('sha256').update(value.replaceAll('\r\n','\n')).digest('hex');
const compact = text => text.replace(/\s+/g,'');
const nonempty = value => typeof value==='string' && !!value.trim();
const allIds = closingSynthesisSections.flatMap(section=>section.claimIds);
const metadata = raw => Object.fromEntries([...(/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1]??'').matchAll(/^(title|description):\s*(.+)$/gm)].map(match=>[match[1],match[2].replace(/^(['"])(.*)\1$/,'$2')]));
function sections(raw) {
  const pieces=raw.split(/^## (.+)\s*$/m),headings=[],occurrences=[];
  for(let i=1;i<pieces.length;i+=2){const explicit=/^(.*?)\s+\[#([^\]]+)\]$/.exec(pieces[i]),title=explicit?explicit[1]:pieces[i],id=explicit?explicit[2]:title;headings.push({id,title});occurrences.push(...collectChapterClaimOccurrences(pieces[i+1]).map(claim=>({id:claim,section:id})));}
  return {headings,occurrences};
}
/** @param {any} value */
export function assertClosingSynthesisOriginal(value=original) {
  if(closingSynthesisDigest(value)!=='febb6e039e8c1af69ea31bf88325785fa73b957b6f50183a87f3139089bc9325')throw new Error('B32 immutable original22/scientific closure differs from qualified 862e2fe');
}
/** @param {any} value @param {string|null} independentDigest */
export function assertClosingSynthesisHeadingHistory(value=captured,independentDigest=closingSynthesisHeadingDigest) {
  if(!/^[a-f0-9]{64}$/.test(independentDigest??'') || closingSynthesisDigest(value)!==independentDigest)throw new Error('B32 requires independently qualified actual heading/scope history; acceptance is incomplete');
  if(value.sourceCommit!==original.baseCommit||value.originalHistoricalEntries?.length!==100||value.addresses?.length!==6||value.views?.length!==4||value.immutableSourceHistory?.length!==4)throw new Error('B32 actual/source-qualified scope families are incomplete');
}
/** @param {any} edition */
export function assertClosingSynthesisRegistration(edition) {
  const units=edition?.units??[],found=units.filter(unit=>unit.key===closingSynthesisKey),unit=found[0];
  if(found.length!==1||unit.source!==closingSynthesisManuscript||unit.kind!=='chapter'||unit.part!=='判断边界'||!same(unit.coverage,closingSynthesisRoutes)||!same(unit.sections,closingSynthesisSections.map(({id,title})=>({id,title})))||units.some(unit=>closingSynthesisRoutes.includes(unit.key)))throw new Error('B32 requires its actual four-section book assembly and exact two-source coverage');
}
/** @param {any} prose @param {string|null} independentDigest */
export function assertClosingSynthesisProseAccepted(prose,independentDigest=closingSynthesisProseDigest) {
  assertClosingSynthesisOriginal();
  if(!prose||prose.schemaVersion!==1||prose.status!=='reviewed'||prose.bookKey!==closingSynthesisKey||prose.manuscript!==closingSynthesisManuscript||prose.title!==closingSynthesisTitle||!/^[a-f0-9]{64}$/.test(independentDigest??'')||closingSynthesisDigest(prose)!==independentDigest)throw new Error('B32 requires independently reviewed final prose and separately pinned acceptance; acceptance is incomplete');
  if(!same(prose.sections,closingSynthesisSections)||!same(prose.claims?.map(row=>row.id),allIds)||!same(prose.website?.map(row=>row.route),closingSynthesisRoutes)||!same(prose.sources?.map(row=>row.route),[...closingSynthesisRoutes,closingSynthesisManuscript]))throw new Error('B32 accepted22/order/website/shared canonical source closure differs');
  for(const page of prose.website){const raw=original.sourceFiles[`content${page.route}.mdx`]?.text,expected=raw&&sections(raw);if(!expected||!same(page.claimIds,collectChapterClaimOccurrences(raw))||!same(page.occurrences,expected.occurrences))throw new Error('B32 fine-page8/14 membership and original heading placement must remain exact');}
  if(prose.sources.some(source=>!nonempty(source.title)||!nonempty(source.description)||!/^[a-f0-9]{64}$/.test(source.mdxSha256)||!Array.isArray(source.headings)||!Array.isArray(source.ordinary)||source.ordinary.length))throw new Error('B32 final source metadata/hash/ordinary prose receipt is incomplete');
}
/** @param {any} edition @param {Map<string,string>} sources @param {any} catalog @param {any} prose @param {string|null} independentDigest @param {'raw'|'public'} catalogProjection */
export function validateClosingSynthesisCoverage(edition,sources,catalog,prose,independentDigest=closingSynthesisProseDigest,catalogProjection='raw') {
  assertClosingSynthesisOriginal();assertClosingSynthesisRegistration(edition);assertClosingSynthesisProseAccepted(prose,independentDigest);
  const errors=[];
  for(const source of prose.sources){const raw=sources.get(source.route);if(typeof raw!=='string'||rawDigest(raw)!==source.mdxSha256){errors.push(`B32 source differs from independently reviewed MDX: ${source.route}`);continue;}const actual=sections(raw);if(!sameRecord(metadata(raw),{title:source.title,description:source.description})||!same(actual.headings,source.headings))errors.push(`B32 actual source metadata/headings differ: ${source.route}`);const expected=source.route===closingSynthesisManuscript?closingSynthesisSections.flatMap(section=>section.claimIds.map(id=>({id,section:section.id}))):prose.website.find(page=>page.route===source.route)?.occurrences;if(!same(actual.occurrences,expected)||collectChapterClaimOccurrences(raw).length!==expected?.length)errors.push(`B32 body missing, duplicated, reordered, outside sections or misplaced: ${source.route}`);}
  if(!['raw','public'].includes(catalogProjection))throw new Error('B32 catalog comparison requires an explicit raw or public projection');
  // Runtime receives lib/catalog's allowlisted projection. Reconstruct only the
  // frozen/accepted records and run the established projector over that complete
  // catalog context; never invent a second allowlist or weaken the CLI raw check.
  let expectedPublic=null;
  if(catalogProjection==='public'){
    const reference=structuredClone(catalog);
    for(const [kind,records] of [['claims',prose.claims],...Object.entries(original.scientificClosure)]){
      const fixed=new Map(records.map(record=>[record.id,record]));
      reference[kind]=[...(reference[kind]??[]).filter(record=>!fixed.has(record.id)),...records];
    }
    expectedPublic=publicCatalog(reference);
  }
  const expected=(kind,fixed)=>expectedPublic?expectedPublic[kind].find(record=>record.id===fixed.id):fixed;
  for(const fixed of prose.claims){const found=catalog?.claims?.filter(row=>row.id===fixed.id)??[];if(found.length!==1||found[0].status!=='reviewed'||!sameRecord(found[0],expected('claims',fixed)))errors.push(`B32 canonical record differs from independently reviewed manuscript: ${fixed.id}`);}
  // Original direct22 may be reauthored; the unchanged external scientific closure may not.
  for(const [kind,records] of Object.entries(original.scientificClosure))for(const fixed of records){const found=catalog?.[kind]?.filter(row=>row.id===fixed.id)??[];if(found.length!==1||!sameRecord(found[0],expected(kind,fixed)))errors.push(`B32 original scientific ${kind} closure differs: ${fixed.id}`);}
  return errors;
}
/** @param {any} history @param {string|null} headingDigest @returns {any[]} */
export function closingSynthesisHeadingEntries(history=captured,headingDigest=closingSynthesisHeadingDigest) {
  assertClosingSynthesisHeadingHistory(history,headingDigest);
  return history.addresses.map(row=>({route:row.route,path:row.path,id:row.id,targets:[{route:row.route,path:row.path,id:row.id,kind:'heading'}],mode:'retained',edition:{sourceCommit:history.sourceCommit,sourceDate:history.sourceDate}}));
}
const location=(route,path)=>path==='/print'?printUnitAnchor(route):chapterAnchorPrefix(route);
const target=(route,path,kind,id,claimId)=>({route,path,id,kind,...(claimId?{claimId}:{})});
function historicalSource(entry,history) {
  const source=history.immutableSourceHistory.find(row=>row.sourceCommit===entry.edition.sourceCommit&&row.route===entry.route);
  if(source)return source;
  const view=history.views.find(row=>row.route===entry.route&&row.path===entry.path);
  if(entry.edition.sourceCommit===history.sourceCommit&&view)return {title:view.title,claimIds:view.claimIds,sections:view.sectionScopes};
  throw new Error(`B32 missing exact historical source scope: ${entry.route} ${entry.edition.sourceCommit}`);
}
/** Preserve native fine pages and their exact historical subsets; only print consumes them. */
/** @param {any[]} entries @param {any} history @param {any} prose @param {string|null} independentDigest @param {string|null} headingDigest @returns {any[]} */
export function remapClosingSynthesisCitations(entries,history=captured,prose=null,independentDigest=closingSynthesisProseDigest,headingDigest=closingSynthesisHeadingDigest) {
  assertClosingSynthesisOriginal();assertClosingSynthesisHeadingHistory(history,headingDigest);
  if(prose!==null)assertClosingSynthesisProseAccepted(prose,independentDigest);
  const frozen=[...history.originalHistoricalEntries,...closingSynthesisHeadingEntries(history,headingDigest)],byAddress=new Map(frozen.map(entry=>[`${entry.path}#${entry.id}`,entry]));
  if(byAddress.size!==106)throw new Error('B32 requires100 earlier and6 actually captured historical obligations');
  for(const [address,fixed] of byAddress){const found=entries.filter(entry=>`${entry.path}#${entry.id}`===address);if(found.length!==1||!sameRecord(found[0],fixed))throw new Error(`B32 historical entry missing, repeated or changed: ${address}`);}
  for(const entry of entries)if(closingSynthesisRoutes.includes(entry.route)&&!byAddress.has(`${entry.path}#${entry.id}`))throw new Error(`B32 unexpected historical scope: ${entry.id}`);
  const section=id=>closingSynthesisSections.find(row=>row.claimIds.includes(id))?.id;
  return entries.map(entry=>{
    if(!byAddress.has(`${entry.path}#${entry.id}`))return entry;
    const print=entry.path==='/print',first=entry.targets[0];
    // The four inherited bag entries have bag entry.route. Select target identity.
    if(!closingSynthesisRoutes.includes(entry.route)){
      if(!print)return entry;
      const targets=entry.targets.map(item=>closingSynthesisRoutes.includes(item.route)&&item.kind==='note'?target(closingSynthesisKey,'/print','note',`${printUnitAnchor(closingSynthesisKey)}-claim-${item.claimId}`,item.claimId):item);
      return {...entry,route:closingSynthesisKey,targets,mode:'alias'};
    }
    const route=print?closingSynthesisKey:entry.route,prefix=location(route,entry.path),note=id=>target(route,entry.path,'note',`${prefix}-claim-${id}`,id),source=historicalSource(entry,history);
    if(first.kind==='note'){const targets=entry.targets.map(item=>note(item.claimId));return {...entry,route,targets,mode:entry.id===targets[0].id?'retained':'alias'};}
    if(first.kind==='heading'){
      const scope=source.sections.find(row=>entry.id===row.id||first.id===row.id||entry.id.endsWith(`-${row.id}`));if(!scope)throw new Error(`B32 unmapped exact historical heading: ${entry.id}`);
      if(!print){const targets=scope.claimIds.map(note),text=`原《${source.title}》“${scope.title}”的范围由下列原有${scope.claimIds.length}则注释界定；这些链接保留原命题及原顺序，现行篇章另有其他内容。`;return {...entry,scope:{text,targets}};}
      const names=[...new Set(scope.claimIds.map(section))];if(names.some(name=>!name))throw new Error(`B32 historical heading has unknown proposition: ${entry.id}`);
      // Even a single current section may contain more than the old heading scope.
      const targets=[...names.map(name=>target(route,entry.path,'heading',`${prefix}-${name}`)),...scope.claimIds.map(note)];
      const text=`原《${source.title}》“${scope.title}”的范围由下列原有${scope.claimIds.length}则注释与具名位置界定；现行书章另有其他内容。`;
      return {...entry,route,targets,mode:'notice',scope:{text,targets}};
    }
    const group=first.kind==='note-group',native=group?`${prefix}-annotations`:prefix,notes=source.claimIds.map(note),headings=print?[...new Set(source.claimIds.map(section))].map(name=>target(route,entry.path,'heading',`${prefix}-${name}`)):source.sections.map(row=>target(route,entry.path,'heading',row.id));
    const targets=group?notes:[...headings,...notes],text=`原《${source.title}》${group?'注释组':'篇章'}的范围由下列原有${source.claimIds.length}则注释${group?'':'与具名内容位置'}界定；各链接保留原命题及原顺序，现行书章另有其他内容。`;
    return entry.id===native?{...entry,route,targets:[target(route,entry.path,first.kind,native)],mode:'retained',scope:{text,targets}}:{...entry,route,targets,mode:'notice',scope:{text,targets}};
  });
}
export function closingSynthesisBookHref(href) {
  if(typeof href==='string'&&closingSynthesisRoutes.includes(href.replace(/\/$/,'')))return `#${printUnitAnchor(closingSynthesisKey)}`;
  return href;
}
// Fumadocs' one copy button has a screen-reader label. Admit that exact
// accessibility control only; hidden authored title/number text remains invalid.
function copyLabel(node,unit){
  const button=node?.parentNode,children=button?.childNodes?.filter(child=>child.nodeType===1)??[];
  return node?.tagName==='SPAN'&&same(Object.keys(node.attributes??{}),['class'])&&node.getAttribute('class')==='sr-only'&&node.text==='复制章节链接'&&node.childNodes.length===1&&node.childNodes[0].nodeType===3
    &&button?.tagName==='BUTTON'&&button.getAttribute('aria-live')==='polite'&&button.text==='复制章节链接'&&children.length===2&&children[0].tagName==='SVG'&&children[0].getAttribute('aria-hidden')==='true'&&children[1]===node&&!concealed(button,unit);
}
export function closingHeadingConcealedText(node,unit){return concealed(node,unit)||(node?.querySelectorAll('*')??[]).some(child=>compact(child.text)&&concealed(child,unit)&&!copyLabel(child,unit));}
function concealedText(node,unit){return concealed(node,unit)||(node?.querySelectorAll('*')??[]).some(child=>compact(child.text)&&concealed(child,unit));}
function concealed(node,unit){for(let current=node;current;current=current.parentNode){if(current.hasAttribute?.('hidden')||current.getAttribute?.('aria-hidden')==='true'||/(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:[;\s]|$))/i.test(current.getAttribute?.('style')??'')||/(?:^|\s)(?:hidden|sr-only|invisible)(?:\s|$)/.test(current.getAttribute?.('class')??''))return true;}return false;}
/** Actual complete body, annotation payload and all historical text are separate gates. */
/** @param {any} document @param {string} path @param {any} catalog @param {any} prose @param {any} history @param {string|null} independentDigest @param {string|null} headingDigest */
export function validateRenderedClosingSynthesis(document,path,catalog,prose,history=captured,independentDigest=closingSynthesisProseDigest,headingDigest=closingSynthesisHeadingDigest) {
  if(![...closingSynthesisRoutes,'/print'].includes(path))return [];
  assertClosingSynthesisProseAccepted(prose,independentDigest);assertClosingSynthesisHeadingHistory(history,headingDigest);
  const print=path==='/print',route=print?closingSynthesisKey:path,units=print?document.querySelectorAll(`article[data-reader-route="${route}"]`):document.querySelectorAll('article');
  if(units.length!==1)return [`${path}: B32 actual reading unit missing or repeated`];
  const unit=units[0],errors=[],checked=new Set(),source=prose.sources.find(row=>row.route===(print?closingSynthesisManuscript:route)),expected=print?closingSynthesisSections.flatMap(section=>section.claimIds.map(id=>({id,section:section.id}))):prose.website.find(row=>row.route===route).occurrences,prefix=location(route,path),claims=new Map((catalog?.claims??[]).map(row=>[row.id,row]));
  const children=unit.childNodes.filter(node=>node.nodeType===1),title=children.find(node=>node.tagName===(print?'H2':'H1'));
  if(!title||title.text!==source.title||(print&&unit.getAttribute('data-reader-title')!==source.title)||concealedText(title,unit))errors.push(`${path}: B32 actual title differs or is hidden`);else checked.add(title);
  const description=title&&children[children.indexOf(title)+1];if(description?.tagName!=='P'||description.text!==source.description||concealedText(description,unit))errors.push(`${path}: B32 actual description differs or is hidden`);else checked.add(description);
  if(!print){for(const node of children.filter(node=>node.tagName==='DIV'&&node.text==='生命周期评价的前世今生'))checked.add(node);const pagination=unit.querySelectorAll('.docs-pagination');if(pagination.length!==1||!isVerifiedReaderPagination(pagination[0]))errors.push(`${path}: B32 website pagination must be independently verified`);else checked.add(pagination[0]);}
  const actual=[],headings=[];let section=null;
  for(const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')){
    if(node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]'))continue;
    if(node.getAttribute('role')==='doc-noteref'){const id=node.getAttribute('data-reader-reference'),paragraph=node.closest('p'),claim=claims.get(id);actual.push({id,section});if(!paragraph||!claim||readerParagraphText(paragraph,node)!==claim.text||!sameRecord(claim,prose.claims.find(row=>row.id===id))||concealedText(paragraph,unit)||concealed(node,unit))errors.push(`${path}: B32 canonical body missing, changed or hidden: ${id}`);else checked.add(paragraph);}
    else if(node.closest('.chapter-notes')){section=null;if(node.id===`${prefix}-annotations`&&node.text==='注释'&&node.tagName===(print?'H3':'H2')&&!concealedText(node,unit))checked.add(node);else errors.push(`${path}: B32 annotation heading differs`);}
    else if(node!==title){const id=print?node.id.slice(prefix.length+1):node.id;section=id;headings.push({id,title:node.text.replace(/复制章节链接$/,'')});if(node.tagName!==(print?'H3':'H2')||closingHeadingConcealedText(node,unit))errors.push(`${path}: B32 actual formal heading differs or is hidden`);else checked.add(node);}
  }
  if(!same(actual,expected)||!same(headings,source.headings))errors.push(`${path}: B32 actual body order/sections/identity differ`);
  const groups=unit.querySelectorAll('.chapter-notes'),notes=unit.querySelectorAll('[data-reader-claim]');if(groups.length!==1||!same(notes.map(node=>node.getAttribute('data-reader-claim')),expected.map(row=>row.id)))errors.push(`${path}: B32 exact continuous note plan differs`);
  const annotationErrors=validateExchangeAnnotationOutput(document,unit,route,catalog,{print});errors.push(...annotationErrors);if(!annotationErrors.length)for(const note of notes){const annotation=note.querySelector('.claim-annotation');if(concealed(note,unit)||concealedText(annotation,unit))errors.push(`${path}: B32 annotation is hidden`);else checked.add(annotation);}
  const entries=remapClosingSynthesisCitations([...history.originalHistoricalEntries,...closingSynthesisHeadingEntries(history,headingDigest)],history,prose,independentDigest,headingDigest),unitEntries=entries.filter(entry=>entry.path===path&&entry.route===route);
  const label=destination=>{const ids=destination.path==='/print'?allIds:prose.website.find(row=>row.route===destination.route)?.claimIds??[],name=destination.path==='/print'?closingSynthesisTitle:prose.sources.find(row=>row.route===destination.route)?.title;return `《${name}》${destination.kind==='note'?`注 ${ids.indexOf(destination.claimId)+1}`:destination.kind==='heading'&&destination.path==='/print'?`·${destination.id.slice(printUnitAnchor(destination.route).length+1)}`:destination.kind==='note-group'?'注释':''}`;};
  for(const entry of unitEntries){if(entry.mode==='notice'&&unit.querySelectorAll(`[id="${entry.id}"][data-legacy-notice]`).length!==1)errors.push(`${path}: B32 exact historical notice missing or repeated: ${entry.id}`);if(entry.mode==='retained'&&entry.scope){const contexts=unit.querySelectorAll(`[data-legacy-scope="${entry.id}"]`),context=contexts[0];if(contexts.length!==1||!((context.parentNode===unit&&unit.id===entry.id)||(context.previousElementSibling?.id===entry.id&&context.parentNode===context.previousElementSibling.parentNode)))errors.push(`${path}: B32 exact retained subset scope missing or detached: ${entry.id}`);}}
  const historical=validateReaderHistoricalText(unit,unitEntries,path,label);errors.push(...historical.errors);for(const node of historical.checked){if(concealedText(node,unit))errors.push(`${path}: B32 historical context is hidden`);else checked.add(node);}
  if(unaccountedReaderText(unit,checked).length)errors.push(`${path}: B32 actual output contains unexpected unreviewed text`);
  return errors;
}
