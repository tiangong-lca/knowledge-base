import { createHash } from 'node:crypto';
import original from '../config/wall-selection-original.json' with { type: 'json' };
import captured from '../config/wall-selection-heading-history.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { prepareNumberedCaseElement, isVerifiedReaderPagination } from './reader-numbering-output.mjs';
import { validateExchangeAnnotationOutput, unaccountedReaderText } from './reader-exchange-semantics.mjs';
import { readerParagraphText, validateReaderHistoricalText } from './reader-publication-text.mjs';

export const wallSelectionRoute = '/docs/book/wall-service-to-comparison';
export const wallSelectionTitles = ['功能实现', '清单形成', '指标含义', '配对判断'];
// Main alone sets this after reviewing actual final source, reader and output evidence.
/** @type {string | null} */
export const wallSelectionAcceptedDigest = '6ca2888bff2f34a4a8ba94470c4e5796bdac5c793c644d2f3e233fc4df6a9a14';
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rawDigest = value => createHash('sha256').update(value).digest('hex');
const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])])) : value;
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const sameRecord = (a,b) => same(ordered(a),ordered(b));
const hashLike = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const nonempty = value => typeof value === 'string' && !!value.trim();
const compact = text => text.replace(/\s+/g,'');
const prefix = path => path === '/print' ? printUnitAnchor(wallSelectionRoute) : chapterAnchorPrefix(wallSelectionRoute);
const headingId = (path,id) => path === '/print' ? `${printUnitAnchor(wallSelectionRoute)}-${id}` : id;
export const wallSelectionCaseHeadingId = print => headingId(print?'/print':wallSelectionRoute,'wall-case-reference');
export const wallSelectionConditionIds = ['service','fiction','renewal','omissions','accounting','common-parameter','fixed-criterion','factor-scope','no-probability','non-implication'];

export function assertWallSelectionOriginal(value = original) {
  if (digest(value) !== 'e5ce1517b9fc95a0eab5f14c36a5b2839d2d5129932b5dafc4771413cf9fcf20') throw new Error('Wall selection original22/templates/input/source and104 historical scopes differ from qualified638c19d');
}
export function assertWallSelectionHeadingHistory(value = captured) {
  if (digest(value) !== '13150f4a9cc572419bf6bf8303defed49f33ec2ed25d59203bd97946b13d0c82') throw new Error('Wall selection seven actual hosted638c19d native headings differ');
}

/** Independently preserve the old complete trace facts when prose becomes a table. */
function originalTraceValues(alternative) {
  const start=alternative===0?7:12,rows=original.case.views.web.paragraphs.slice(start,start+5).map(row=>row.text),vector=text=>/\([^)]*\)ᵀ/.exec(text)?.[0];
  return [vector(rows[0]),vector(rows[1]),rows[2].replace(/^s_E = /,'').replace(/。$/,''),
    `${/CO2 = (.*?) kg；/.exec(rows[3])?.[1]} kg`,`${/CH4 = (.*?) kg。/.exec(rows[3])?.[1]} kg`,
    rows[4].replace(/^I = cᵀg = /,'').replace(/。$/,'')];
}
function preservesOriginalTraceTables(tables) {
  return tables.length===2&&tables.every((table,alternative)=>{
    const values=originalTraceValues(alternative);
    return table.rows.length===7&&table.rows.every(row=>row.length===2)&&values.every((value,index)=>{
      const actual=table.rows[index+1][1];return index===1?compact(actual).startsWith(`${compact(value)}；`):compact(actual)===compact(value);
    })&&table.cellSemantics.length===7&&table.cellSemantics[0].every(cell=>cell.tag==='TH'&&cell.scope==='col')
      &&table.cellSemantics.slice(1).every(row=>row.length===2&&row[0].tag==='TH'&&row[0].scope==='row'&&row[1].tag==='TD'&&row[1].scope===null);
  });
}

/** Receipt schema is documented by the fixture builder in reader-wall-selection.test.mjs.
 * A supplied test digest qualifies only that explicit fixture; production uses the independent pin.
 */
export function assertWallSelectionAccepted(accepted, independentDigest = wallSelectionAcceptedDigest) {
  assertWallSelectionOriginal();
  if (!accepted || accepted.schemaVersion!==1 || accepted.status!=='reviewed' || !hashLike(independentDigest)) throw new Error('Wall selection requires independent actual final acceptance; acceptance is incomplete');
  if (digest(accepted)!==independentDigest) throw new Error('Wall selection final receipt differs from independent accepted pin');
  if (accepted.title!==original.currentTitle || !nonempty(accepted.description) || !hashLike(accepted.mdxSha256) || !hashLike(accepted.componentSha256)
    || !sameRecord(accepted.sections,original.sections) || !sameRecord(accepted.claims,original.claims)) throw new Error('Wall selection final title/four-section/order/original22 canonical closure differs');
  for (const view of ['web','book']) {
    if (!Array.isArray(accepted.ordinary?.[view]) || !accepted.ordinary[view].length) throw new Error('Wall selection requires reviewed native prose/matrix navigation in both views');
    for (const row of accepted.ordinary[view]) if (!nonempty(row.text) || !wallSelectionTitles.includes(row.section) || !Array.isArray(row.navigation) || !row.navigation.length || row.navigation.some(link=>!nonempty(link.text)||!nonempty(link.href))) throw new Error('Wall selection ordinary paragraph needs exact text, section and native links');
    if (!accepted.ordinary[view].some(row=>row.section==='清单形成'&&row.navigation.some(link=>link.href===`#${wallSelectionCaseHeadingId(view==='book')}`))) throw new Error('Wall selection coordinates require a view-correct native calculation/matrix entry');
  }
  const selection=accepted.caseSelection;
  if (!selection || selection.originalCaseDigest!==digest(original.case) || selection.inputSha256!==original.case.inputSha256) throw new Error('Wall selection must bind its immutable complete original case and input');
  const paragraphs=selection.paragraphDispositions,headings=selection.headingDispositions;
  if (!Array.isArray(paragraphs)||paragraphs.length!==23||paragraphs.some((row,index)=>row.id!==`P${index+1}`)
    ||!Array.isArray(headings)||headings.length!==5||headings.some((row,index)=>row.key!==original.case.views.web.headings[index].key)) throw new Error('Wall selection requires complete ordered23 paragraph/five heading dispositions');
  for (const row of [...paragraphs,...headings]) if (!['retain','compress','move'].includes(row.action)||!nonempty(row.rationale)||!Array.isArray(row.targetClaimIds)||!row.targetClaimIds.length||new Set(row.targetClaimIds).size!==row.targetClaimIds.length||row.targetClaimIds.some(id=>!original.claimIds.includes(id))) throw new Error('Wall selection disposition requires a rationale and exact available canonical targets');
  if (!Array.isArray(selection.conditions)||!same(selection.conditions.map(row=>row.id),wallSelectionConditionIds)||selection.conditions.some(row=>!nonempty(row.text))) throw new Error('Wall selection requires all reviewed local service/science/quantifier conditions');
  for (const view of ['web','book']) {
    const presentation=selection.currentPresentation?.[view],print=view==='book';
    if (!presentation||!nonempty(presentation.text)||!Array.isArray(presentation.headings)||presentation.headings.length!==5||!Array.isArray(presentation.links)||!Array.isArray(presentation.tables)||presentation.tables.length!==7) throw new Error('Wall selection requires exact final five-heading/seven-table complete presentation in both views');
    const expectedHeadings=original.case.views[view].headings.map((heading,index)=>({tag:print?`H${Number(heading.tag.slice(1))-1}`:heading.tag,id:index?'':wallSelectionCaseHeadingId(print),text:index===0?'计算表与参数':index===4?'固定结果与全域判断':heading.text}));
    if (!same(presentation.headings,expectedHeadings)) throw new Error('Wall selection reviewed case heading identity/hierarchy differs');
    if (wallSelectionTitles.some(id=>!presentation.links.some(link=>link.href===`#${headingId(print?'/print':wallSelectionRoute,id)}`))) throw new Error('Wall selection case requires all four exact native prose entries');
    if (!presentation.links.some(link=>link.href===`/downloads/cases/${original.case.inputFile}`)||!presentation.links.some(link=>link.href==='/sources/#src-case-ipcc-ar6-wgi-errata-2025-10-07')) throw new Error('Wall selection must retain exact input and dated factor-source links');
    let previous=-1;
    for (const fixed of original.case.views[view].tables) {
      const matches=presentation.tables.map((table,index)=>sameRecord(table,fixed)?index:-1).filter(index=>index>=0);
      if (matches.length!==1||matches[0]<=previous) throw new Error('Wall selection five original complete tables/captions/cell semantics must survive once in order');
      previous=matches[0];
    }
    const traceTables=presentation.tables.filter(table=>!original.case.views[view].tables.some(fixed=>sameRecord(fixed,table)));
    if (!preservesOriginalTraceTables(traceTables)) throw new Error('Wall selection two new trace tables lose original complete vectors, energy, gas or indicator contributions');
    if (selection.conditions.some(row=>!presentation.text.includes(row.text))) throw new Error('Wall selection final local conditions are missing from reviewed case text');
  }
}

/** @param {any} accepted
 * @param {{component?:string|Buffer,input?:string|Buffer,publication?:string|Buffer,engine?:string|Buffer,clientEngine?:string|Buffer}} bytes
 * @param {string|null} independentDigest */
export function validateWallSelectionArtifactBytes(accepted, {component,input,publication,engine,clientEngine} = {}, independentDigest = wallSelectionAcceptedDigest) {
  assertWallSelectionAccepted(accepted,independentDigest);
  const sources=new Map(original.sourceFiles.map(file=>[file.path,file.sha256])),errors=[];
  for (const [label,bytes,expected] of [
    ['component',component,accepted.componentSha256],['input',input,original.case.rawInputSha256],
    ['publication',publication,sources.get('knowledge/cases/wall-coating-v1.publication.json')],
    ['engine',engine,sources.get('scripts/teaching-case.mjs')],['clientEngine',clientEngine,sources.get('lib/teaching-case.ts')],
  ]) if ((typeof bytes!=='string'&&!Buffer.isBuffer(bytes))||rawDigest(bytes)!==expected) errors.push(`Wall selection reviewed ${label} bytes differ or are missing`);
  return errors;
}

function sections(raw) {
  const split=raw.split(/^## (.+)\s*$/m),headings=[],occurrences=[];
  for(let i=1;i<split.length;i+=2){const title=split[i].trim(),explicit=/^(.*?)\s+\[#([^\]]+)\]$/.exec(title),id=explicit?explicit[2]:title;headings.push({id,title:explicit?explicit[1]:title});occurrences.push(...collectChapterClaimOccurrences(split[i+1]).map(id=>({id,section:explicit?explicit[2]:title})));}
  return {headings,occurrences};
}
/** JSON inputs are admitted only by the exact runtime contracts above.
 * @param {any} edition @param {Map<string,string>} sources
 * @param {typeof original} value @param {any} catalog @param {any} accepted
 * @param {string|null} independentDigest */
export function validateWallSelectionCoverage(edition,sources,value=original,catalog=null,accepted=null,independentDigest=wallSelectionAcceptedDigest) {
  assertWallSelectionOriginal(value);assertWallSelectionAccepted(accepted,independentDigest);
  const errors=[],units=edition?.units?.filter(unit=>unit.key===wallSelectionRoute)??[];
  if(units.length!==1||units[0].source!==wallSelectionRoute||units[0].kind!=='chapter')errors.push('Wall selection needs its original single source/book identity');
  const raw=sources.get(wallSelectionRoute);
  if(typeof raw!=='string')return [...errors,'Wall selection actual MDX missing'];
  if(rawDigest(raw.replaceAll('\r\n','\n'))!==accepted.mdxSha256)errors.push('Wall selection MDX differs from independently reviewed source');
  const front=/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1]??'';
  for(const field of ['title','description'])if(new RegExp(`^${field}:\\s*(.+)$`,'m').exec(front)?.[1]?.replace(/^(['"])(.*)\1$/,'$2')!==accepted[field])errors.push(`Wall selection actual ${field} differs`);
  const actual=sections(raw),expected=original.sections.flatMap(section=>section.claimIds.map(id=>({id,section:section.id})));
  if(!same(actual.headings,original.sections.map(({id,title})=>({id,title})))||!same(actual.occurrences,expected)||!same(collectChapterClaimOccurrences(raw),original.claimIds))errors.push('Wall selection actual four sections/original22 order/placement differs');
  const literals=[...raw.matchAll(/<TeachingCase\s+id="CASE-WALL-CONNECT"\s+version="1\.0\.0"\s*\/>/g)],after=raw.indexOf(original.case.placementAfter),before=raw.indexOf(original.case.placementBefore);
  if(literals.length!==1||literals[0].index<after||literals[0].index>before||after<0||before<0)errors.push('Wall selection case must follow rough comparison and precede exercise/answer exactly once');
  if(!catalog)errors.push('Wall selection reviewed canonical catalog is required');
  else for(const fixed of original.claims){const found=catalog.claims.filter(claim=>claim.id===fixed.id);if(found.length!==1||!sameRecord(found[0],fixed))errors.push(`Wall selection original canonical record differs: ${fixed.id}`);}
  if(catalog)for(const [kind,records] of [['claims',original.scientificClosure.premises],['evidence',original.scientificClosure.evidence],['sources',original.scientificClosure.sources]])for(const fixed of records){const found=(catalog[kind]??[]).filter(row=>row.id===fixed.id);if(found.length!==1||!sameRecord(found[0],fixed))errors.push(`Wall selection original scientific ${kind} closure differs: ${fixed.id}`);}
  return errors;
}

export function wallSelectionHeadingEntries(history=captured) {
  assertWallSelectionHeadingHistory(history);
  return history.addresses.map(row=>({route:row.route,path:row.path,id:row.id,targets:[{route:row.route,path:row.path,id:row.id,kind:'heading'}],mode:'retained',edition:{sourceCommit:history.sourceCommit,sourceDate:history.sourceDate}}));
}
const target=(path,kind,id,claimId)=>({route:wallSelectionRoute,path,id,kind,...(claimId?{claimId}:{})});
/** Remapping is an independently frozen disposition, never final prose approval.
 * @param {any[]} entries @param {typeof original} value @param {typeof captured} history
 * @param {any} accepted @param {string|null} independentDigest */
export function remapWallSelectionCitations(entries,value=original,history=captured,accepted=null,independentDigest=wallSelectionAcceptedDigest) {
  assertWallSelectionOriginal(value);assertWallSelectionHeadingHistory(history);
  if(accepted!==null)assertWallSelectionAccepted(accepted,independentDigest);
  const frozen=[...value.originalHistoricalEntries,...wallSelectionHeadingEntries(history)],byAddress=new Map(frozen.map(entry=>[`${entry.path}#${entry.id}`,entry]));
  if(frozen.length!==111||byAddress.size!==111)throw new Error('Wall selection requires104 original and seven actual captured addresses');
  for(const [address,fixed] of byAddress){const found=entries.filter(entry=>`${entry.path}#${entry.id}`===address);if(found.length!==1||!sameRecord(found[0],fixed))throw new Error(`Wall selection historical source missing, repeated or changed: ${address}`);}
  for(const entry of entries)if(entry.route===wallSelectionRoute&&!byAddress.has(`${entry.path}#${entry.id}`))throw new Error(`Wall selection unknown historical scope: ${entry.id}`);
  return entries.map(entry=>{
    if(!byAddress.has(`${entry.path}#${entry.id}`))return entry;
    const path=entry.path,p=prefix(path),first=entry.targets[0],note=id=>target(path,'note',`${p}-claim-${id}`,id);
    if(first.kind==='note')return entry;
    const capture=history.addresses.find(row=>row.path===path&&row.id===entry.id);
    if(first.kind==='heading'){
      const old=value.sourceHeadings.find(row=>first.id===row.id||first.id===headingId(path,row.id));
      const ids=capture?.claimIds??old?.claimIds;
      if(!ids)throw new Error(`Wall selection original heading meaning missing: ${entry.id}`);
      const caseHeading=capture?.kind==='case-heading',names=[...new Set(ids.map(id=>value.sections.find(section=>section.claimIds.includes(id))?.id))];
      if(names.some(name=>!wallSelectionTitles.includes(name)))throw new Error('Wall selection unknown exact section disposition');
      const headings=caseHeading?[target(path,'heading',wallSelectionCaseHeadingId(path==='/print'))]:names.map(name=>target(path,'heading',headingId(path,name)));
      // This original section also contained the complete interactive case,
      // beyond its four annotated paragraphs. Moving the widget must not narrow
      // that published heading's scope to only the former note subset.
      const containedCase=old?.id==='把用量接到需求与活动';
      if(containedCase)headings.push(target(path,'heading',wallSelectionCaseHeadingId(path==='/print')));
      const targets=[...headings,...ids.map(note)],title=capture?.title??old.title;
      const text=`原《${value.title}》“${title}”的内容范围由下列${ids.length}则原注释及具名位置界定${containedCase?'，并包括原来嵌入的完整计算器；其表格、控件与推演现由“计算表与参数”及其中具名的正文入口保留':''}；现行“${value.currentTitle}”另有重新编排的内容。`;
      return {...entry,targets,mode:'notice',scope:{text,targets}};
    }
    const group=first.kind==='note-group',native=group?`${p}-annotations`:p,notes=value.claimIds.map(note),headings=value.sections.map(section=>target(path,'heading',headingId(path,section.id))),targets=group?notes:[...headings,target(path,'heading',wallSelectionCaseHeadingId(path==='/print')),...notes];
    const text=`原《${value.title}》${group?'注释组':'篇章'}的范围由下列原有22则注释${group?'':'、具名位置及原嵌入计算器的现行入口'}界定；原顺序与原命题保留，现行题名为《${value.currentTitle}》。`;
    return entry.id===native?{...entry,targets:[target(path,first.kind,native)],mode:'retained',scope:{text,targets}}:{...entry,targets,mode:'notice',scope:{text,targets}};
  });
}

const tableData = table => ({caption:table.querySelector('caption')?.text,rows:table.querySelectorAll('tr').map(row=>row.querySelectorAll('th,td').map(cell=>cell.text)),cellSemantics:table.querySelectorAll('tr').map(row=>row.querySelectorAll('th,td').map(cell=>({tag:cell.tagName,scope:cell.getAttribute('scope')??null})))});
function concealed(node,stop){for(let n=node;n&&n.nodeType===1;n=n.parentNode){if(n.tagName==='DETAILS'||n.hasAttribute('hidden')||n.getAttribute('aria-hidden')?.toLowerCase()==='true'||n.hasAttribute('style')||/(?:^|\s)(?:hidden|sr-only|screen-only|print-only)(?:\s|$)/.test(n.getAttribute('class')??''))return true;if(n===stop)break;}return false;}
/** @param {any} unit
 * @param {{print?:boolean,accepted?:any,independentDigest?:string|null}} options */
export function validateWallSelectionCaseOutput(unit,{print=false,accepted=null,independentDigest=wallSelectionAcceptedDigest}={}) {
  assertWallSelectionAccepted(accepted,independentDigest);
  const errors=[],nodes=unit.querySelectorAll('[data-case-id]'),presentation=accepted.caseSelection.currentPresentation[print?'book':'web'];
  if(nodes.length!==1||nodes[0].getAttribute('data-case-id')!==original.case.caseId||nodes[0].getAttribute('data-case-version')!==original.case.version)return ['Wall selection actual case missing, repeated or changed'];
  let node=nodes[0];
  if([node,...node.querySelectorAll('*')].some(n=>concealed(n,unit)))errors.push('Wall selection actual case/conditions must remain visible');
  if(node.querySelector('[data-reader-number],[data-reader-heading-title]')){const prepared=prepareNumberedCaseElement(node,print?'book':'web',wallSelectionRoute);if(prepared.errors.length)return prepared.errors.map(error=>`Wall selection numbered case: ${error}`);node=prepared.element;}
  const heading=node.querySelector(`[id="${wallSelectionCaseHeadingId(print)}"]`);
  if(!heading||node.getAttribute('aria-labelledby')!==heading.id||unit.querySelectorAll(`[id="${heading.id}"]`).length!==1)errors.push('Wall selection actual accessible deterministic case title differs');
  if(node.text!==presentation.text||!same(node.querySelectorAll('h1,h2,h3,h4,h5,h6').map(h=>({tag:h.tagName,id:h.id??'',text:h.text})),presentation.headings))errors.push('Wall selection actual complete case text/headings differ');
  if(!sameRecord(node.querySelectorAll('table').map(tableData),presentation.tables))errors.push('Wall selection actual seven complete tables/captions/cell semantics differ');
  if(!same(node.querySelectorAll('a').map(a=>({text:a.text,href:a.getAttribute('href')})),presentation.links))errors.push('Wall selection actual native case links differ');
  const visible=node.querySelectorAll('p,li,figcaption');
  for(const condition of accepted.caseSelection.conditions)if(!visible.some(n=>n.text.includes(condition.text)&&!concealed(n,node)))errors.push(`Wall selection actual local condition missing: ${condition.id}`);
  const selects=node.querySelectorAll('select'),ranges=node.querySelectorAll('input[type="range"]');
  if(selects.length!==1||!same(selects[0].querySelectorAll('option').map(n=>n.getAttribute('value')),['smooth','rough'])||ranges.length!==1||ranges[0].getAttribute('min')!=='0.1'||ranges[0].getAttribute('max')!=='0.5'||ranges[0].getAttribute('step')!=='0.01'||ranges[0].getAttribute('value')!=='0.3')errors.push('Wall selection actual fixed scenario/shared parameter controls differ');
  const ids=new Map();for(const n of unit.querySelectorAll('[id]'))ids.set(n.id,(ids.get(n.id)??0)+1);
  for(const control of [...selects,...ranges])if(!control.id||ids.get(control.id)!==1||node.querySelectorAll('label').filter(n=>n.getAttribute('for')===control.id).length!==1)errors.push('Wall selection actual control accessible label differs');
  for(const n of node.querySelectorAll('[aria-labelledby],[aria-describedby]'))for(const id of (n.getAttribute('aria-labelledby')??n.getAttribute('aria-describedby')).split(/\s+/))if(ids.get(id)!==1)errors.push('Wall selection actual accessible reference missing or duplicate');
  const plots=node.querySelectorAll('svg[role="img"]'),plot=plots[0];
  if(plots.length!==1||plot.querySelectorAll('title').length!==1||plot.querySelectorAll('desc').length!==1||plot.querySelectorAll('rect').length!==1||plot.querySelectorAll('circle').length!==1||plot.querySelectorAll('line').length!==7||plot.querySelectorAll('line[stroke-width="2"]').length!==2||plot.querySelectorAll('line[stroke-dasharray="7 5"]').length!==1||node.querySelectorAll('.teaching-case-predicates li').length!==3)errors.push('Wall selection actual full paired plot or three independent predicates missing');
  const input=node.querySelectorAll('a').filter(a=>a.getAttribute('href')===`/downloads/cases/${original.case.inputFile}`);if(input.length!==1||!input[0].hasAttribute('download'))errors.push('Wall selection actual immutable input download missing');
  return errors;
}
function targetLabel(destination){if(destination.kind==='note')return `《${original.currentTitle}》注 ${original.claimIds.indexOf(destination.claimId)+1}`;const local=destination.path==='/print'?destination.id.slice(printUnitAnchor(wallSelectionRoute).length+1):destination.id;const title=wallSelectionTitles.includes(local)?local:local==='wall-case-reference'?'计算表与参数':null;return `《${original.currentTitle}》${title?`·${title}`:destination.kind==='note-group'?'注释':''}`;}

/** Input is the exact-numbering-verified semantic document used by existing reader guards.
 * @param {any} document @param {string} path @param {typeof original} value
 * @param {any} catalog @param {any} accepted @param {string|null} independentDigest */
export function validateRenderedWallSelection(document,path,value=original,catalog=null,accepted=null,independentDigest=wallSelectionAcceptedDigest) {
  if(path!==wallSelectionRoute&&path!=='/print')return [];
  assertWallSelectionOriginal(value);assertWallSelectionAccepted(accepted,independentDigest);
  const print=path==='/print',units=print?document.querySelectorAll(`article[data-reader-route="${wallSelectionRoute}"]`):document.querySelectorAll('article');
  if(units.length!==1)return [`${path}: Wall selection actual unit missing or repeated`];
  const unit=units[0],errors=[],checked=new Set(),claims=new Map((catalog?.claims??[]).map(claim=>[claim.id,claim])),expected=original.sections.flatMap(section=>section.claimIds.map(id=>({id,section:section.id}))),actual=[],headings=[];
  const children=unit.childNodes.filter(n=>n.nodeType===1),title=children.find(n=>n.tagName===(print?'H2':'H1'));
  if(!title||title.text!==accepted.title||unit.getAttribute('data-reader-title')!==accepted.title||concealed(title,unit))errors.push(`${path}: Wall selection actual title differs`);else checked.add(title);
  const description=title&&children[children.indexOf(title)+1];if(description?.tagName!=='P'||description.text!==accepted.description||concealed(description,unit))errors.push(`${path}: Wall selection actual description differs`);else checked.add(description);
  let section=null,lastClaim=null,caseSeen=false;
  for(const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"],.teaching-case')){
    if(node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]'))continue;
    if(node.classList?.contains('teaching-case')){if(section!=='配对判断'||lastClaim!==original.case.placementAfter||caseSeen)errors.push(`${path}: Wall selection case must occur after rough comparison in 配对判断`);caseSeen=true;const found=validateWallSelectionCaseOutput(unit,{print,accepted,independentDigest});errors.push(...found);if(!found.length)checked.add(node);continue;}
    if(node.closest('.teaching-case'))continue;
    if(node.getAttribute('role')==='doc-noteref'){
      const id=node.getAttribute('data-reader-reference'),p=node.closest('p'),claim=claims.get(id);actual.push({id,section});if(caseSeen&&lastClaim===original.case.placementAfter&&id!==original.case.placementBefore)errors.push(`${path}: Wall selection exercise must immediately follow case`);lastClaim=id;
      if(!p||!claim||readerParagraphText(p,node)!==claim.text||!sameRecord(claim,original.claims.find(f=>f.id===id))||concealed(p,unit))errors.push(`${path}: Wall selection actual canonical paragraph missing/changed/hidden: ${id}`);else checked.add(p);
    }else if(node.closest('.chapter-notes')){section=null;if(node.id===`${prefix(path)}-annotations`&&node.text==='注释'&&node.tagName===(print?'H3':'H2'))checked.add(node);else errors.push(`${path}: Wall selection annotation heading differs`);}
    else if(node!==title){const local=print?node.id.slice(prefix(path).length+1):node.id;headings.push(local);section=local;if(node.tagName!==(print?'H3':'H2')||node.text.replace(/复制章节链接$/,'')!==local||!wallSelectionTitles.includes(local)||concealed(node,unit))errors.push(`${path}: Wall selection formal heading differs`);else checked.add(node);}
  }
  if(!same(actual,expected)||!same(headings,wallSelectionTitles)||!caseSeen)errors.push(`${path}: Wall selection actual22/order/four-section/case closure differs`);
  for(const row of accepted.ordinary[print?'book':'web']){
    const found=unit.querySelectorAll('p').filter(n=>!n.closest('.teaching-case,.chapter-notes,[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')&&!n.querySelector('a[role="doc-noteref"]')&&n.text===row.text);
    if(found.length!==1){errors.push(`${path}: Wall selection reviewed ordinary prose missing or repeated`);continue;}const p=found[0];
    if(concealed(p,unit)||!same(p.querySelectorAll('a').map(a=>({text:a.text,href:decodeURI(a.getAttribute('href')??'')})),row.navigation.map(a=>({...a,href:decodeURI(a.href)}))))errors.push(`${path}: Wall selection native ordinary navigation differs`);
    const sequence=unit.querySelectorAll(`h${print?3:2},p`).filter(n=>n===p||(n.tagName===`H${print?3:2}`&&!n.closest('.teaching-case,.chapter-notes,[data-legacy-notice],[data-legacy-scope]'))),previous=sequence.slice(0,sequence.indexOf(p)).at(-1);
    if(previous?.id!==headingId(path,row.section))errors.push(`${path}: Wall selection ordinary prose section differs`);
    if(row.navigation.some(link=>link.href===`#${wallSelectionCaseHeadingId(print)}`)){const sequence=unit.querySelectorAll('a[role="doc-noteref"],p').filter(n=>n===p||(n.getAttribute('role')==='doc-noteref'&&!n.closest('.teaching-case,.chapter-notes'))),prior=sequence.slice(0,sequence.indexOf(p)).at(-1);if(prior?.getAttribute('data-reader-reference')!=='cl-wall-coordinates')errors.push(`${path}: Wall selection matrix entry must immediately follow coordinates`);}
    for(const link of row.navigation)if(link.href.startsWith('#')&&(link.href===`#${wallSelectionCaseHeadingId(print)}`?unit:document).querySelectorAll(`[id="${decodeURIComponent(link.href.slice(1))}"]`).length!==1)errors.push(`${path}: Wall selection native ordinary target missing`);checked.add(p);
  }
  const groups=unit.querySelectorAll('.chapter-notes');if(groups.length!==1||groups.some(n=>concealed(n,unit))||unit.querySelectorAll('.claim-annotation').some(n=>concealed(n,unit))||!same(unit.querySelectorAll('[data-reader-claim]').map(n=>n.getAttribute('data-reader-claim')),original.claimIds))errors.push(`${path}: Wall selection original22 note plan differs`);
  const annotations=validateExchangeAnnotationOutput(document,unit,wallSelectionRoute,catalog,{print});errors.push(...annotations);if(!annotations.length)for(const n of unit.querySelectorAll('.claim-annotation'))checked.add(n);
  const entries=remapWallSelectionCitations([...original.originalHistoricalEntries,...wallSelectionHeadingEntries()],value,captured);
  for(const entry of entries.filter(e=>e.path===path)){
    if(entry.mode==='notice'&&(unit.querySelectorAll(`[id="${entry.id}"][data-legacy-notice]`).length!==1||concealed(unit.querySelector(`[id="${entry.id}"][data-legacy-notice]`),unit)))errors.push(`${path}: Wall selection actual old-scope notice missing/repeated: ${entry.id}`);
    if(entry.mode==='retained'&&entry.scope){const contexts=unit.querySelectorAll(`[data-legacy-scope="${entry.id}"]`),context=contexts[0];if(contexts.length!==1||concealed(context,unit)||!((context.parentNode===unit&&unit.id===entry.id)||(context.previousElementSibling?.id===entry.id&&context.parentNode===context.previousElementSibling.parentNode)))errors.push(`${path}: Wall selection original22 retained context missing/detached`);}
  }
  const context=validateReaderHistoricalText(unit,entries,path,targetLabel);errors.push(...context.errors);for(const n of context.checked)checked.add(n);
  if(!print){for(const n of children.filter(n=>n.tagName==='DIV'&&n.text==='生命周期评价的前世今生'))checked.add(n);const pagination=unit.querySelectorAll('.docs-pagination');if(pagination.length===1&&isVerifiedReaderPagination(pagination[0]))checked.add(pagination[0]);else errors.push(`${path}: Wall selection actual pagination unverified`);}
  if(unaccountedReaderText(unit,checked).length)errors.push(`${path}: Wall selection actual unreviewed text remains`);
  return errors;
}
