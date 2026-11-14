import { historyPrintPointerTitleLayout } from './reader-copyedit.mjs';
import { currentPrintReadingHref, getHeadingNumbering, getUnitNumbering } from './reader-numbering.mjs';
import { currentBookLayout, currentBookMdxMatches, currentBookRecordMatches, currentFlowBoundary } from './reader-current-expectations.mjs';
import readingRegister from '../knowledge/research/readings.json' with { type: 'json' };
import { getClaimEvidence } from './knowledge.mjs';
import { frameworkBookHref } from './reader-edition.mjs';
import { createHash } from 'node:crypto';
import original from '../config/exchange-semantics-original.json' with { type: 'json' };
import headingCapture from '../config/exchange-semantics-heading-history.json' with { type: 'json' };
import citationSources from '../config/exchange-semantics-citation-sources.json' with { type: 'json' };
import partialHistory from '../config/exchange-semantics-partial-history.json' with { type: 'json' };
import { readSourceHeading, chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
export const exchangeSemanticsRoute = '/docs/book/exchange-semantics-and-conversion';
export const historyRoute = '/docs/history';
export const exchangeSemanticsTitles = ['对象与交换', '计算活动', '转换边界', '表征状态'];
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = value => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])) : value;
const sameRecord = (a,b) => same(sorted(a),sorted(b));
export const exchangeDigest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textDigest = raw => createHash('sha256').update(raw.replaceAll('\r\n','\n')).digest('hex');
const normalize = text => text.replace(/\s+/g,' ').trim();
const plain = text => text.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`]/g,'');
const pins = { original: '1af492800f070330a2ae934caf688820f0af37cc6edd6884e8b627f73b8610ca', headings: '093950df9e024286b977af6eb5a1e2731c5a43531ada56fe70feb8eb291395e3', citations: 'ed2238ab49a55ace60ba25c7d6c29e774e10ab3a4cd3479980f85ed1562186f0', partial: '07b14f45b8783e6f4cde8d78da2204bc1832fa49ac9e346ddc19a4aee245c5a4' };
function assertPin(value,key,label) { if (exchangeDigest(value)!==pins[key]) throw new Error(`B08 ${label} differs from independently frozen original evidence`); }
export function assertExchangeSemanticsOriginal(value=original) { assertPin(value,'original','60-occurrence/56-claim/14-ordinary/33-template inventory'); }
export function assertExchangeSemanticsHeadingHistory(value=headingCapture) { assertPin(value,'headings','nineteen actual captured printed headings'); }
export function assertExchangeSemanticsCitationSources(value=citationSources) { assertPin(value,'citations','original historical address meanings'); }
export function assertExchangeSemanticsPartialHistory(value=partialHistory) { assertPin(value,'partial','partial S01 source plan'); }
export function assertExchangeSemanticsRegistration(edition) {
  const unit=edition?.units?.find(unit=>unit.key===exchangeSemanticsRoute);
  if (!unit || unit.source!==exchangeSemanticsRoute || unit.kind!=='chapter' || unit.part!==currentBookLayout('book:part-title:2', '可比世界') || !same(unit.sections,currentBookLayout('B08:headings',exchangeSemanticsTitles.map(title=>({id:title,title})))) || !same(unit.coverage,['/docs/flows','/docs/characterization'])) throw new Error('Missing or changed shared B08 four-section / exclusive S02/S05 registration');
  const history=edition.units.find(unit=>unit.key===historyRoute);
  if (!history || history.source!==historyRoute || history.kind!==currentBookLayout('S01:print-kind', 'topic') || history.coverage?.length || edition.units.some(unit=>unit.coverage?.includes(historyRoute))) throw new Error('S01 must remain a complete registered source with separately bounded print projection');
}

// Filled only after the main agent's actual source and reader review. Original-map
// conservation is deliberately insufficient to grant manuscript acceptance.
const finalProsePin = 'c04229c6d5fc236df9d2a60b7cba4fd3859a03c98969d45abc545616e3aabc6f';
export function assertExchangeSemanticsProseAccepted(prose) {
  if (!finalProsePin || !prose || prose.status!=='reviewed' || !Array.isArray(prose.claims) || !Array.isArray(prose.sections) || !Array.isArray(prose.sources) || !Array.isArray(prose.ordinaryDispositions) || !prose.sourceReview || !prose.readerReview || !prose.partialSourceReview || !/^[a-f0-9]{64}$/.test(prose.readerDraftSha256??'') || exchangeDigest(prose)!==finalProsePin) throw new Error('B08 requires its separately reviewed final canonical manuscript, navigation and partial-source receipt; acceptance is missing or differs');
}

function currentHistoryPrintPointers(partial) {
  const oldPointers = currentBookLayout(historyPrintPointerTitleLayout, partial.projection);
  const title = currentFlowBoundary?.numbering.titles.find(row=>row.route===exchangeSemanticsRoute);
  const pointers = !title ? oldPointers : oldPointers.map(row=>{
    if(row.route!==exchangeSemanticsRoute)return row;
    const before=`见《${title.from}》的相应论述与注释。`;
    if(!row.text.endsWith(before))throw new Error('S01 B08 pointer does not match its qualified predecessor');
    return {...row,text:row.text.slice(0,-before.length)+`见《${title.to}》的相应论述与注释。`};
  });
  if (pointers !== partial.projection && pointers.some(row => {
    const current = getUnitNumbering('book', row.route)?.title;
    return !current || !row.text.endsWith(`见《${current}》的相应论述与注释。`);
  })) throw new Error('S01 printed pointer title differs from the actual current book title');
  return pointers;
}

/** One route-limited projection drives raw occurrence planning and actual rendering. */
export function historyPrintCrossReference(route,id,print=true,partial=partialHistory) {
  assertExchangeSemanticsPartialHistory(partial);
  return print && route===historyRoute ? currentHistoryPrintPointers(partial).find(item=>item.claimId===id) ?? null : null;
}
export function projectExchangeSemanticsRaw(route,raw,print=true,partial=partialHistory) {
  assertExchangeSemanticsPartialHistory(partial);
  if (!print || route!==historyRoute) return raw;
  const omitted=new Set(partial.projection.map(item=>item.claimId));
  // Literal syntax is checked by collectChapterClaimOccurrences before projection.
  collectChapterClaimOccurrences(raw);
  return raw.replace(/<Prose\s+ids\s*=\s*(["'])([^"']*)\1\s*\/?>|<Claim\s+id\s*=\s*(["'])([^"']+)\3\s*\/?>/g,(tag,q,ids,q2,id)=>{
    const kept=(ids??id).trim().split(/\s+/).filter(id=>!omitted.has(id));
    return kept.length ? `<Prose ids="${kept.join(' ')}" />` : '';
  });
}
const destination = (route,kind,section,id,path='/print') => { const prefix=path==='/print'?printUnitAnchor(route):chapterAnchorPrefix(route);return {route,path,id:kind==='note'?`${prefix}-claim-${id}`:kind==='chapter'?prefix:kind==='note-group'?`${prefix}-annotations`:`${path==='/print'?`${prefix}-`:''}${section}`,kind,...(id?{claimId:id}:{})}; };
export function historyPrintDestination(item) { return destination(item.route,'note',null,item.claimId); }
function sectionOccurrences(raw) {
  const split = raw.split(/^## (.+)\s*$/m), headings = [], occurrences = [];
  for (let i = 1; i < split.length; i += 2) {
    const heading = readSourceHeading(split[i]);
    headings.push(heading);
    occurrences.push(...collectChapterClaimOccurrences(split[i + 1]).map(id => ({ id, section: heading.id })));
  }
  return { headings, occurrences };
}
function sourceRouteForKey(key,edition) { return edition.units.find(unit=>unit.key===key)?.source??key; }

/** Immutable source-map conservation and final manuscript acceptance are separate gates.
 * @param {any} edition
 * @param {Map<string,string>} sources
 * @param {any} accepted
 * @param {any} catalog
 * @param {any} prose
 * @param {any} partial
 */
export function validateExchangeSemanticsCoverage(edition,sources,accepted=original,catalog=null,prose=null,partial=partialHistory) {
  assertExchangeSemanticsOriginal(accepted);assertExchangeSemanticsPartialHistory(partial);assertExchangeSemanticsRegistration(edition);
  const errors=[],raw=sources.get(exchangeSemanticsRoute);
  if (raw===undefined) return ['Missing shared B08 manuscript'];
  const title=/^title:\s*(.+?)\s*$/m.exec(raw)?.[1]?.replace(/^(['"])(.*)\1$/,'$2');
  if(title!==currentBookLayout('B08:title',accepted.title))errors.push('B08 shared source has the wrong adopted title');
  const {headings,occurrences}=sectionOccurrences(raw);
  if (!same(headings,currentBookLayout('B08:headings',exchangeSemanticsTitles.map(title=>({id:title,title})))) || occurrences.length!==collectChapterClaimOccurrences(raw).length) errors.push('B08 requires four actual formal sections with all canonical occurrences inside them');
  const scientificSections = currentFlowBoundary?.chapterSections;
  const all=collectChapterClaimOccurrences(raw), originalIds=new Set(accepted.sections.flatMap(section=>section.claimIds));
  for(const section of (scientificSections ? [{ id: null, claimIds: [...originalIds] }] : accepted.sections)) for(const id of section.claimIds) {const found=occurrences.filter(item=>item.id===id);if(found.length!==1||(!scientificSections && found[0]?.section!==section.id))errors.push(`B08 original proposition missing, duplicated or misplaced: ${id}`);}
  for(const id of new Set(all))if(all.filter(value=>value===id).length!==1)errors.push(`B08 duplicate canonical occurrence: ${id}`);
  for(const source of accepted.sources.filter(source=>source.route!==exchangeSemanticsRoute)) {
    const actual=sources.get(source.route);if(actual===undefined||!same(collectChapterClaimOccurrences(actual),currentFlowBoundary?.occurrences.find(row=>row.key===`content${source.route}.mdx`)?.to??source.claimIds))errors.push(`B08 retained website source occurrence order differs: ${source.route}`);
  }
  const history=sources.get(historyRoute);
  if(history===undefined || !currentBookMdxMatches(partial.sourceRoute, partial.websiteSourceSha256, textDigest(history)) || !same(collectChapterClaimOccurrences(history),partial.claimIds))errors.push('S01 complete website source, nine claims or six ordinary blocks changed');
  else if(!same(collectChapterClaimOccurrences(projectExchangeSemanticsRaw(historyRoute,history,true,partial)),partial.retainedClaimIds))errors.push('S01 projected occurrence / note plan differs from retained APOS');
  for(const item of currentHistoryPrintPointers(partial)) {
    const actual=sources.get(sourceRouteForKey(item.route,edition));
    if(actual===undefined || collectChapterClaimOccurrences(actual).filter(id=>id===item.claimId).length!==1)errors.push(`S01 partial destination missing or duplicated: ${item.claimId}`);
    if(item.section && actual!==undefined && !sectionOccurrences(actual).occurrences.some(row=>row.id===item.claimId&&row.section===item.section))errors.push(`S01 partial destination has wrong actual section: ${item.claimId}`);
  }
  if(catalog) {
    assertExchangeSemanticsProseAccepted(prose);
    if(!same(prose.sections.map(({id,title})=>({id,title})),exchangeSemanticsTitles.map(title=>({id:title,title}))) || !same(occurrences,(scientificSections??prose.sections).flatMap(section=>section.claimIds.map(id=>({id,section:section.id})))))errors.push('B08 actual occurrence order differs from reviewed manuscript');
    if(!scientificSections && !same(prose.claims.map(claim=>claim.id),all))errors.push('B08 reviewed full canonical records do not match actual occurrence order');
    for(const claim of prose.claims) {
      const actual=catalog.claims.find(row=>row.id===claim.id);
      if(!actual || actual.status!=='reviewed' || !currentBookRecordMatches('claims', claim, actual))errors.push(`B08 canonical record differs from reviewed manuscript: ${claim.id}`);
      if(!originalIds.has(claim.id) && !claim.evidenceIds?.length && !claim.premiseIds?.length)errors.push(`B08 explicit addition lacks evidence or premises: ${claim.id}`);
    }
    if(scientificSections) for(const id of all.filter(id=>!originalIds.has(id))) {
      const actual=catalog.claims.find(claim=>claim.id===id);
      if(!actual || actual.status!=='reviewed' || !currentBookRecordMatches('claims',null,actual)
          || !actual.evidenceIds?.length && !actual.evidenceLinks?.length && !actual.premiseIds?.length)
        errors.push(`B08 successor addition lacks an exact independently accepted record and supporting closure: ${id}`);
    }
    const partialReview=prose.partialSourceReview;
    if (partialReview.sourceSha256!==partial.websiteSourceSha256 || partialReview.ordinaryAction!=='retain-all-six' || !same(partialReview.destinations?.map(({claimId,route,section})=>({claimId,route,...(section?{section}:{})})),partial.projection.map(({claimId,route,section})=>({claimId,route,...(section?{section}:{})})))) errors.push('S01 final partial-source receipt does not bind all eight exact destinations and all retained ordinary content');
    for(const item of partialReview.destinations??[]) {
      const actual=catalog.claims.find(claim=>claim.id===item.claimId);
      if(!actual || actual.status!=='reviewed' || !currentBookRecordMatches('claims', item.claim, actual))errors.push(`S01 partial destination full record differs from reviewed meaning: ${item.claimId}`);
    }
    if(!same(prose.sources.map(source=>source.route),[exchangeSemanticsRoute,'/docs/flows','/docs/characterization',historyRoute]))errors.push('B08 reviewed source set must bind shared source, both fine sources and unchanged S01');
    for(const source of prose.sources)if(!sources.has(source.route)||!currentBookMdxMatches(source.route, source.mdxSha256, textDigest(sources.get(source.route))))errors.push(`B08 source differs from reviewed MDX: ${source.route}`);
    if(!same(prose.ordinaryDispositions.map(row=>`${row.oldUnit}:${row.block}`),accepted.ordinary.map(row=>`${row.oldUnit}:${row.block}`)))errors.push('B08 reviewed ordinary-content disposition must cover all fourteen original blocks in frozen order');
    for(const row of currentBookLayout('B08:ordinary-dispositions', prose.ordinaryDispositions)) {
      const obligation=accepted.ordinary.find(item=>item.oldUnit===row.oldUnit&&item.block===row.block);
      if(!obligation || (!currentFlowBoundary?.chapterOrdinary && row.section!==obligation.section) || !headings.some(heading=>heading.id===row.section) || !row.reviewRationale?.trim() || !(row.claimIds?.length||row.navigation?.length)) {errors.push(`B08 ordinary obligation lacks reviewed substantive destination: ${row.oldUnit}:${row.block}`);continue;}
      const destinations = row.claimDestinations ?? (row.claimIds ?? []).map(id => ({ id, section: row.section }));
      for(const { id, section } of destinations) {
        if(!occurrences.some(item=>item.id===id&&item.section===section))
          errors.push(`B08 ordinary canonical destination missing or misplaced: ${id}`);
      }
      for(const link of row.navigation??[])if(!link.text?.trim()||!link.href?.trim()||!raw.includes(`[${link.text}](${link.href})`))errors.push(`B08 reviewed navigation missing: ${row.oldUnit}:${row.block}`);
    }
  }
  return errors;
}

export function exchangeSemanticsHeadingEntries(history=headingCapture) {
  assertExchangeSemanticsHeadingHistory(history);
  return history.canonicalPrintedHeadings.map(heading=>({route:heading.route,path:'/print',id:heading.id,targets:[{route:heading.route,path:'/print',id:heading.id,kind:'heading'}],mode:'retained',edition:{sourceCommit:history.sourceCommit,sourceDate:history.sourceDate}}));
}

/** Exact old address meaning is checked before remapping; affected entry deletion fails. */
export function remapExchangeSemanticsCitations(entries,accepted=original,history=headingCapture,partial=partialHistory,frozen=citationSources) {
  assertExchangeSemanticsOriginal(accepted);assertExchangeSemanticsHeadingHistory(history);assertExchangeSemanticsPartialHistory(partial);assertExchangeSemanticsCitationSources(frozen);
  const expected=[...frozen.entries,...exchangeSemanticsHeadingEntries(history)];
  for(const old of expected) {const found=entries.filter(entry=>entry.path===old.path&&entry.id===old.id);if(found.length!==1 || !sameRecord(found[0],old))throw new Error(`B08 missing, repeated or changed original historical address: ${old.path}#${old.id}`);}
  const relevant=new Map(expected.map(entry=>[`${entry.path}#${entry.id}`,entry]));
  const sources=new Map(accepted.sources.map(source=>[source.route,source]));
  const claimSections=new Map(accepted.sections.flatMap(section=>section.claimIds.map(id=>[id,section.id])));
  const unique=targets=>[...new Map(targets.map(item=>[`${item.path}#${item.id}`,item])).values()];
  function claimTarget(route,id,path) {
    if(path==='/print'&&route===historyRoute){const moved=partial.projection.find(item=>item.claimId===id);if(moved)return destination(moved.route,'note',null,id);}
    if((path==='/print'&&sources.has(route))||route===exchangeSemanticsRoute)return destination(exchangeSemanticsRoute,'note',null,id,path);
    return destination(route,'note',null,id,path);
  }
  return entries.map(entry=>{
    if(!relevant.has(`${entry.path}#${entry.id}`))return entry;
    const path=entry.path,kind=entry.targets[0].kind,originalRoute=entry.targets[0].route;
    // Three preface notices already target S02 despite retaining their /docs origin.
    if(entry.route==='/docs')return {...entry,targets:entry.targets.map(target=>destination(exchangeSemanticsRoute,'note',null,target.claimId,exchangeSemanticsRoute))};
    const route=entry.route,source=sources.get(route),isHistory=route===historyRoute;
    if(path!=='/print'&&route!==exchangeSemanticsRoute)return entry;
    if(kind==='note') {const targets=entry.targets.map(target=>claimTarget(originalRoute,target.claimId,path));return {...entry,route:targets[0].route,targets,mode:targets[0].id===entry.id?'retained':'alias'};}
    if(kind==='heading') {
      if(isHistory)return entry; // Actual ordinary-method headings remain semantically present.
      const heading=accepted.sourceHeadings.find(heading=>heading.route===route&&(entry.targets[0].id===heading.id||entry.targets[0].id.endsWith(`-${heading.id}`)));
      if(!heading)throw new Error(`B08 unmapped original heading: ${entry.id}`);
      const target=destination(exchangeSemanticsRoute,'heading',heading.target,null,path);
      return {...entry,route:exchangeSemanticsRoute,targets:[target],mode:'alias'};
    }
    const claimIds=isHistory?partial.claimIds:source?.claimIds;
    if(!claimIds)throw new Error(`B08 unknown original source scope: ${route}`);
    const noteTargets=claimIds.map(id=>claimTarget(route,id,path));
    const headingTargets=isHistory?partial.printedHeadings.map(heading=>({route,path:'/print',id:heading.id,kind:'heading'})):unique(accepted.sourceHeadings.filter(heading=>heading.route===route).map(heading=>destination(exchangeSemanticsRoute,'heading',heading.target,null,path)));
    const targets=kind==='note-group'?noteTargets:[...headingTargets,...noteTargets];
    const title=isHistory?'LCA怎样形成：问题、框架与版本':source.title;
    const text=`原《${title}》${kind==='note-group'?'注释组':'篇章'}的范围由下列原有${claimIds.length}则注释${kind==='note-group'?'':'与具名内容位置'}界定；各链接保留原命题，现行章节另有其他内容。${isHistory?'本篇仍保留史料对象、因果判断和APOS版本回顾的解释。':''}`;
    const nativeRoute=isHistory?historyRoute:exchangeSemanticsRoute,native=destination(nativeRoute,kind,null,null,path);
    if(entry.id===native.id)return {...entry,route:nativeRoute,targets:[native],mode:'retained',scope:{text,targets}};
    return {...entry,route:nativeRoute,targets,mode:'notice',scope:{text,targets}};
  });
}

function paragraphText(node,marker) {if(node===marker)return '';if(node.nodeType===3)return node.text;return node.nodeType===1?node.childNodes.map(child=>paragraphText(child,marker)).join(''):'';}
const annotationKinds = { 'source-statement': '文献陈述', interpretation: '解释', synthesis: '综合论证', calculation: '计算', proposal: '分析建议' };
const annotationRelations = { supports: '依据', qualifies: '适用条件', contradicts: '相反证据', context: '相关讨论' };
const compact = text => text.replace(/\s+/g,'');
function withoutCarrierText(node) {
  if(node.nodeType===3)return node.text;
  if(node.nodeType!==1 || node.classList?.contains('source-reading'))return '';
  return node.childNodes.map(withoutCarrierText).join('');
}
function expectedPassageArtifact(catalog,evidence,readings) {
  if(!evidence.readingId || !evidence.passageId)return null;
  const reading=readings.readings.find(row=>row.id===evidence.readingId),passage=reading?.passages.find(row=>row.id===evidence.passageId),artifact=reading?.artifacts.find(row=>row.id===passage?.artifactId);
  if(!passage || !artifact)throw new Error(`B08 unresolved actual annotation passage: ${evidence.id}`);
  const sourceArtifact=catalog.sources.find(source=>source.id===evidence.sourceId)?.artifact;
  return artifact.kind!=='derived-text'&&sourceArtifact&&sourceArtifact.kind!=='derived-text'&&artifact.sha256===sourceArtifact.sha256&&artifact.resolvedUrl===sourceArtifact.resolvedUrl?null:artifact;
}
/** Derive print premise destinations from the actual complete print note plan. */
function printedReferenceIndex(document) {
  const index=new Map();
  for(const unit of document.querySelectorAll('article[data-reader-route]'))for(const [number,note]of unit.querySelectorAll('[data-reader-claim]').entries()) {
    const id=note.getAttribute('data-reader-claim'),locations=index.get(id)??[];
    locations.push({href:`#${note.id}`,label:`《${unit.getAttribute('data-reader-title')}》注 ${number+1}`});index.set(id,locations);
  }
  return index;
}
/** Return substantive text not owned by an explicitly checked rendered node.
 * This walks all element kinds, including unwrapped text; a new container or
 * familiar class name cannot make an unreviewed assertion disappear.
 */
export function unaccountedReaderText(root, checkedNodes) {
  const unexpected = [];
  function visit(node) {
    if (checkedNodes.has(node)) return;
    if (node.nodeType === 3) { if (compact(node.text)) unexpected.push(node.text); return; }
    if (node.nodeType === 1 || node === root) for (const child of node.childNodes ?? []) visit(child);
  }
  visit(root); return unexpected;
}

/** Match ClaimAnnotation's actual public projection, including per-unit input deduplication. */
export function validateExchangeAnnotationOutput(document,unit,route,catalog,{print=false,claimIds=null,readings=readingRegister}={}) {
  const errors=[],prefix=print?printUnitAnchor(route):chapterAnchorPrefix(route),allNotes=unit.querySelectorAll('[data-reader-claim]'),ids=allNotes.map(note=>note.getAttribute('data-reader-claim'));
  const byId=new Map((catalog?.claims??[]).map(claim=>[claim.id,claim])),references=print?printedReferenceIndex(document):new Map(),seenInputs=new Set();
  for(const note of allNotes) {
    const id=note.getAttribute('data-reader-claim'),claim=byId.get(id),binding=claim?.caseBinding,inputKey=binding?.inputFile?JSON.stringify([binding.caseId,binding.version,binding.inputSha256,binding.inputFile]):null,showInput=inputKey===null||!seenInputs.has(inputKey);
    if(inputKey!==null)seenInputs.add(inputKey);
    if(claimIds&&!claimIds.includes(id))continue;
    const fail=message=>errors.push(`${print?'/print':route}: actual annotation ${message}: ${id}`),annotations=note.querySelectorAll('.claim-annotation');
    if(!claim || claim.status!=='reviewed' || note.id!==`${prefix}-claim-${id}` || annotations.length!==1) {fail('missing canonical record, stable note or annotation body');continue;}
    const annotation=annotations[0],scope=annotation.childNodes.filter(node=>node.tagName==='P')[0];
    if(!scope || compact(scope.text)!==compact(`${annotationKinds[claim.kind]}。 ${claim.scope}`))fail('scope or kind differs');
    const limits=annotation.querySelectorAll('.annotation-limits'),expectedLimits=claim.caveats.map(text=>text.replace(/[。；;\s]+$/,'')).join('；')+'。';
    if(limits.length!==(claim.caveats.length?1:0) || (claim.caveats.length&&compact(limits[0].text)!==compact(expectedLimits)))fail('caveats missing or changed');
    const evidence=getClaimEvidence(catalog,claim),sourceLists=annotation.querySelectorAll('.annotation-sources');
    if(evidence.length!==claim.evidenceIds.length || sourceLists.length!==(evidence.length?1:0))fail('evidence source list missing or changed');
    const sourceItems=sourceLists[0]?.querySelectorAll('li')??[];
    if(sourceItems.length!==evidence.length)fail('evidence source occurrences missing or repeated');
    evidence.forEach(({evidence:item,relation},index)=>{
      const source=catalog.sources.find(source=>source.id===item.sourceId),li=sourceItems[index],link=li?.querySelector('a'),expectedText=source?`${source.title}。${item.locator.replace(/。+$/u,'')}。${relation!=='supports'?`（${annotationRelations[relation]}）`:''}`:'';
      if(!source||!li||link?.getAttribute('href')!==`/sources/#${item.id}`||link.text!==source.title||compact(withoutCarrierText(li))!==compact(expectedText)) {fail(`source, locator or relation missing or changed (${item.id})`);return;}
      const artifact=expectedPassageArtifact(catalog,item,readings),carriers=li.querySelectorAll('.source-reading');
      if(carriers.length!==(artifact?1:0)){fail(`actual carrier context missing or changed (${item.id})`);return;}
      if(artifact){const derived=artifact.kind==='derived-text',carrier=carriers[0],links=carrier.querySelectorAll('a'),expected=derived?'引文依据官方文档的文字摘录，引用限于所列文字与数值。该摘录记录本身不代表原始 PDF 字节或表格图像的核对。':'文献文本查看引用版本';
        if(links.length!==1||links[0].getAttribute('href')!==(derived?artifact.originUrl:artifact.resolvedUrl)||links[0].text!==(derived?'官方文档':'查看引用版本')||compact(carrier.text)!==compact(expected))fail(`actual carrier link or limits missing or changed (${item.id})`);
      }
    });
    const details=annotation.querySelectorAll('details'),premises=claim.premiseIds;
    const summaries=details.flatMap(detail=>detail.querySelectorAll('summary'));
    if(details.length!==(premises.length?1:0)||summaries.length!==(premises.length?1:0)|| (premises.length&&summaries[0]?.text!=='本段依据的前提'))fail('premise section missing or changed');
    const premiseItems=details[0]?.querySelectorAll('li')??[];
    if(premiseItems.length!==premises.length)fail('premise occurrences missing or repeated');
    premises.forEach((premise,index)=>{
      const links=premiseItems[index]?.querySelectorAll('a')??[],link=links[0],href=link?.getAttribute('href'),linked=byId.get(premise),local=ids.indexOf(premise);
      if(!linked||links.length!==1){fail(`premise link missing or changed (${premise})`);return;}
      const exact=local>=0?{href:`#${prefix}-claim-${premise}`,label:`本章注 ${local+1}`}:references.get(premise)?.[0];
      if(exact) {if(href!==exact.href||normalize(link.text)!==normalize(exact.label))fail(`premise destination or label changed (${premise})`);}
      else if(href===`/claims/#${premise}`) {if(link.text!==linked.text)fail(`premise fallback text changed (${premise})`);}
      else {
        // Full-output citation validation separately resolves cross-page labels and
        // actual targets. Here the target must independently encode this approved
        // premise and its own route, rather than merely being any nonempty link.
        const match=/^(\/docs(?:\/[^#]*)?)\/#(chapter-[a-f0-9]+)-claim-(.+)$/.exec(href??''),targetRoute=match?.[1]?.replace(/\/$/,'');
        if(print||!match||match[3]!==premise||match[2]!==chapterAnchorPrefix(targetRoute)||!/^《.+》注 [1-9]\d*$/.test(normalize(link.text)))fail(`premise destination does not identify approved record (${premise})`);
      }
    });
    const inputs=annotation.querySelectorAll('a').filter(link=>link.getAttribute('href')?.startsWith('/downloads/cases/')),expectedInput=showInput&&binding?.inputFile;
    if(inputs.length!==(expectedInput?1:0)||(expectedInput&&(inputs[0].getAttribute('href')!==`/downloads/cases/${binding.inputFile}`||inputs[0].getAttribute('download')!==binding.inputFile||inputs[0].text!==`下载计算输入（版本 ${binding.version}）`)))fail('case-input link missing, changed or incorrectly repeated');
    // Every allowed root above has a separate exact content/identity check.
    // Do not allow the whole source list/details/input paragraph: otherwise new
    // prose next to a valid item/link could impersonate reviewed annotation text.
    const checkedText = new Set([scope, ...sourceItems, ...limits,
      ...(premises.length ? summaries.slice(0,1) : []),
      ...premiseItems.flatMap(item => item.querySelectorAll('a')), ...inputs].filter(Boolean));
    if (unaccountedReaderText(annotation, checkedText).length) fail('contains unexpected unreviewed text');

  }
  if(claimIds)for(const id of claimIds)if(ids.filter(found=>found===id).length!==1)errors.push(`/print: moved S01 actual annotation missing or repeated: ${route} ${id}`);
  return errors;
}

/** Decode only the fragment: path and query retain their exact authored identity. */
function ordinaryHrefMeaning(href) {
  if(typeof href!=='string')return null;
  const index=href.indexOf('#');
  if(index<0)return {resource:href,fragment:null};
  try{return {resource:href.slice(0,index),fragment:decodeURIComponent(href.slice(index+1))};}
  catch{return null;}
}

/** Use the runtime print URL policy for ordinary navigation as well as MDX links. */
export function validateExchangeOrdinaryNavigation(unit,rows,{print=false}={}) {
  const errors=[],path=print?'/print':exchangeSemanticsRoute,prefix=print?`${printUnitAnchor(exchangeSemanticsRoute)}-`:'';
  for(const row of rows)for(const link of row.navigation??[]) {
    const href=print?frameworkBookHref(link.href,exchangeSemanticsRoute):link.href;
    const expectedHref=ordinaryHrefMeaning(href);
    const found=unit.querySelectorAll('p a').filter(node=>expectedHref&&same(ordinaryHrefMeaning(node.getAttribute('href')),expectedHref)&&normalize(node.text)===normalize(link.text)&&!node.closest('h1,h2,h3,h4,h5,h6,[data-legacy-for],[data-legacy-notice],[data-legacy-scope],.chapter-notes'));
    if(found.length!==1)errors.push(`${path}: B08 meaningful ordinary navigation missing or repeated: ${row.oldUnit}:${row.block}`);
    else {const preceding=unit.querySelectorAll(`h${print?3:2},a`).filter(node=>node===found[0]||node.tagName===(print?'H3':'H2'));const index=preceding.indexOf(found[0]),heading=preceding.slice(0,index).at(-1);if(heading?.id!==`${prefix}${row.section}`)errors.push(`${path}: B08 ordinary navigation has wrong actual section`);}
  }
  return errors;
}

/** HTML checks bind actual body, section order, navigation and S01 projection, not merely anchors. */
export function validateRenderedExchangeSemantics(document,path,accepted=original,catalog=null,prose=null,partial=partialHistory) {
  assertExchangeSemanticsOriginal(accepted);assertExchangeSemanticsPartialHistory(partial);
  const errors=[],print=path==='/print';
  if(!print&&path!==exchangeSemanticsRoute&&path!==historyRoute)return errors;
  const claims=new Map((catalog?.claims??[]).map(claim=>[claim.id,claim]));
  if(prose)assertExchangeSemanticsProseAccepted(prose);
  if(print||path===exchangeSemanticsRoute) {
    const units=print?document.querySelectorAll(`article[data-reader-route="${exchangeSemanticsRoute}"]`):document.querySelectorAll('article');
    if(units.length!==1)errors.push(`${path}: missing or repeated actual B08 body`);
    else {
      const unit=units[0],prefix=print?`${printUnitAnchor(exchangeSemanticsRoute)}-`:'',actual=[],headings=[];let section=null;
      const title=print?unit.getAttribute('data-reader-title'):unit.querySelector('h1')?.text;
      const currentHeadings=currentBookLayout('B08:headings',exchangeSemanticsTitles.map(title=>({id:title,title})));
      if(title!==currentBookLayout('B08:title',accepted.title))errors.push(`${path}: wrong actual B08 title`);
      for(const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
        if(node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]'))continue;
        if(node.getAttribute('role')==='doc-noteref') {const id=node.getAttribute('data-reader-reference'),claim=claims.get(id),p=node.closest('p');actual.push({id,section});if(!p||!claim||paragraphText(p,node)!==claim.text)errors.push(`${path}: B08 actual paragraph differs from canonical text: ${id}`);if(prose&&!currentBookRecordMatches('claims', prose.claims.find(row=>row.id===id)??null, claim))errors.push(`${path}: B08 actual record differs from independently reviewed manuscript: ${id}`);}
        else if(node.closest('.chapter-notes'))section=null;
        else if(currentHeadings.some(row=>row.id===node.id.slice(prefix.length))) {section=node.id.slice(prefix.length);headings.push({id:section,title:node.text.replace(/复制章节链接$/,'')});if(node.tagName!==(print?'H3':'H2')||node.text.replace(/复制章节链接$/,'')!==currentHeadings.find(row=>row.id===section)?.title)errors.push(`${path}: wrong actual B08 formal heading`);}
        else if(currentFlowBoundary && node.tagName===(print?'H4':'H3')
          && getHeadingNumbering(print?'book':'web',exchangeSemanticsRoute,node.id.slice(prefix.length))?.type==='mdx')continue;
        else if(node.tagName!==(print?'H2':'H1'))errors.push(`${path}: unexpected actual B08 body heading`);
      }
      if(!same(headings,currentHeadings))errors.push(`${path}: B08 formal sections missing, duplicated or reordered`);
      const scientificSections=currentFlowBoundary?.chapterSections;
      const expected=scientificSections??prose?.sections??accepted.sections;
      for(const section of accepted.sections)for(const id of section.claimIds){const found=actual.filter(item=>item.id===id);if(found.length!==1||(!scientificSections && found[0].section!==section.id))errors.push(`${path}: actual B08 original proposition missing, duplicated or misplaced: ${id}`);}
      if(prose&&!same(actual,expected.flatMap(section=>section.claimIds.map(id=>({id,section:section.id})))))errors.push(`${path}: actual B08 occurrence order differs from reviewed manuscript`);
      const noteIds=unit.querySelectorAll('[data-reader-claim]').map(node=>node.getAttribute('data-reader-claim'));
      if(!same(noteIds,actual.map(item=>item.id)))errors.push(`${path}: B08 actual endnotes differ from body occurrence plan`);
      errors.push(...validateExchangeAnnotationOutput(document,unit,exchangeSemanticsRoute,catalog,{print}));
      errors.push(...validateExchangeOrdinaryNavigation(unit,currentBookLayout('B08:ordinary-dispositions', prose?.ordinaryDispositions??[]),{print}));
    }
  }
  if(print||path===historyRoute) {
    const units=print?document.querySelectorAll(`article[data-reader-route="${historyRoute}"]`):document.querySelectorAll('article');
    if(units.length!==1)errors.push(`${path}: missing or repeated retained S01 unit`);
    else {const unit=units[0],refs=unit.querySelectorAll('a[role="doc-noteref"]').filter(node=>!node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')).map(node=>node.getAttribute('data-reader-reference'));
      if(!same(refs,print?partial.retainedClaimIds:partial.claimIds))errors.push(`${path}: S01 actual canonical body differs from route-specific projection`);
      const notes=unit.querySelectorAll('[data-reader-claim]').map(node=>node.getAttribute('data-reader-claim'));if(!same(notes,refs))errors.push(`${path}: S01 actual notes diverge from projected body`);
      const bodyParagraphs=unit.querySelectorAll('p').filter(node=>!node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope],.chapter-notes'));
      for(const node of unit.querySelectorAll('a[role="doc-noteref"]').filter(node=>!node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope],.chapter-notes'))) {
        const id=node.getAttribute('data-reader-reference'),claim=claims.get(id),p=node.closest('p');
        if(!claim || !p || paragraphText(p,node)!==claim.text)errors.push(`${path}: S01 actual canonical paragraph differs from canonical text: ${id}`);
      }
      const paragraphSections=new Map();let sourceSection=null;
      for(const node of unit.querySelectorAll(`h${print?3:2},p`)) {
        if(node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope],.chapter-notes'))continue;
        if(node.tagName===(print?'H3':'H2'))sourceSection=print?node.id.slice(printUnitAnchor(historyRoute).length+1):node.id;
        else paragraphSections.set(node,sourceSection);
      }
      for(const block of currentBookLayout('S01:ordinary', partial.ordinary)){
        const found=bodyParagraphs.filter(node=>normalize(node.text)===normalize(plain(block.text))),expectedLinks=[...block.text.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)].map(match=>({text:match[1],href:print?frameworkBookHref(match[2],historyRoute):currentPrintReadingHref(match[2])}));
        if(found.length!==1||paragraphSections.get(found[0])!==block.sourceHeading)errors.push(`${path}: S01 retained ordinary content missing, repeated or misplaced: ${block.block}`);
        else if(!same(found[0].querySelectorAll('a').map(node=>({text:node.text,href:node.getAttribute('href')})),expectedLinks))errors.push(`${path}: S01 retained ordinary navigation label or target missing or changed: ${block.block}`);
      }
      errors.push(...validateExchangeAnnotationOutput(document,unit,historyRoute,catalog,{print}));
      if(print) {
        const cross=unit.querySelectorAll('[data-reader-partial-claim]'), pointers=currentHistoryPrintPointers(partial);
        if(!same(cross.map(node=>node.getAttribute('data-reader-partial-claim')),pointers.map(item=>item.claimId)))errors.push('/print: S01 explicit cross-reference occurrences missing, duplicated or reordered');
        for(const item of pointers){const node=cross.find(node=>node.getAttribute('data-reader-partial-claim')===item.claimId);if(!node||paragraphSections.get(node)!==item.sourceHeading||normalize(node.text)!==normalize(item.text)||node.querySelectorAll('a').length!==1||node.querySelector('a')?.getAttribute('href')!==`#${historyPrintDestination(item).id}`)errors.push(`/print: S01 cross-reference lacks exact meaningful native destination: ${item.claimId}`);}
        for(const heading of currentBookLayout('S01:print-headings', partial.printedHeadings)){const node=unit.querySelectorAll('h3').find(node=>node.id===heading.id);if(!node||node.text!==heading.text)errors.push(`/print: S01 ordinary heading meaning changed: ${heading.id}`);}
      }
    }
  }
  if(print)for(const route of new Set(partial.projection.map(item=>item.route).filter(route=>route!==exchangeSemanticsRoute))) {
    const units=document.querySelectorAll(`article[data-reader-route="${route}"]`),ids=partial.projection.filter(item=>item.route===route).map(item=>item.claimId);
    if(units.length!==1)errors.push(`/print: missing or repeated moved S01 annotation destination unit: ${route}`);
    else errors.push(...validateExchangeAnnotationOutput(document,units[0],route,catalog,{print:true,claimIds:ids}));
  }
  return errors;
}
