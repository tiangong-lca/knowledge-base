import { currentBookFileMatches, currentBookLayout, currentBookMdxMatches, currentBookRecordMatches } from './reader-current-expectations.mjs';
import { frameworkBookHref } from './reader-edition.mjs';
import { closingSynthesisKey, closingSynthesisRoutes } from './reader-closing-synthesis.mjs';
import { isVerifiedReaderPagination, prepareNumberedCaseElement } from './reader-numbering-output.mjs';
import { createHash } from 'node:crypto';
import original from '../config/joint-production-original.json' with { type: 'json' };
import captured from '../config/joint-production-heading-history.json' with { type: 'json' };
import { readSourceHeading, chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { validateExchangeAnnotationOutput, unaccountedReaderText } from './reader-exchange-semantics.mjs';
import { applyCurrentHistoricalEntries, readerParagraphText, validateReaderHistoricalText } from './reader-publication-text.mjs';

export const jointProductionKey = 'book-joint-production';
export const jointProductionManuscript = '/monograph/joint-production';
export const jointProductionRoutes = original.sources.map(source => source.route);
export const jointProductionTitles = ['信息目的', '负担份额', '参照供给', '规则边界'];
// Main owns this one independent pin, set only after actual source/reader acceptance.
/** @type {string | null} */
export const jointProductionProseDigest = 'f8aee2d4039e553a771c5adeb72361216a7ca336b7a190580759094bf19aa8cf';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
const sameRecord = (a, b) => same(ordered(a), ordered(b));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rawDigest = raw => createHash('sha256').update(raw.replaceAll('\r\n', '\n')).digest('hex');
const compact = text => text.replace(/\s+/g, '');

export function assertJointProductionOriginal(value = original) {
  if (digest(value) !== 'd8554a67b76ad2053d0d9cb307d74c52cbbad48c1a17254d631384cfc978342f') throw new Error('B10 original36,29/7 scopes and exact180 historical mappings differ from qualified cf50f01');
}
export function assertJointProductionHeadingHistory(value = captured) {
  if (digest(value) !== '4e74ebc11ba64f2aa052656afa0310bfacf9b377130ce25dca3fbe0ff531112c') throw new Error('B10 fourteen actual hosted address capture differs from qualified cf50f01');
}
export function assertJointProductionRegistration(edition) {
  const unit = edition?.units?.find(unit => unit.key === jointProductionKey);
  if (!unit || unit.source !== jointProductionManuscript || unit.kind !== 'chapter' || unit.part !== original.part
    || !same(unit.coverage, jointProductionRoutes) || !same(unit.sections, currentBookLayout('B10:registered-sections', original.sections)) || edition.units.some(unit => jointProductionRoutes.includes(unit.key)))
    throw new Error('Missing or changed B10 book assembly/exact two-source coverage/four-section registration');
}

/** Final records and source/order are a separate reviewed artifact, never a conservation upgrade. */
export function assertJointProductionProseAccepted(prose, independentDigest = jointProductionProseDigest) {
  if (!prose || prose.status !== 'reviewed' || prose.title !== original.title || !Array.isArray(prose.claims) || !Array.isArray(prose.sources)
    || !Array.isArray(prose.sections) || !Array.isArray(prose.website) || !/^[a-f0-9]{64}$/.test(independentDigest ?? ''))
    throw new Error('B10 requires its actual independently reviewed final manuscript and separately pinned prose acceptance; acceptance is incomplete');
  if (digest(prose) !== independentDigest) throw new Error('B10 final prose receipt differs from its independent reviewed acceptance pin');
  const ids = prose.sections.flatMap(section => section.claimIds ?? []), old = original.sources.flatMap(source => source.claimIds);
  if (!same(prose.sections.map(({id,title}) => ({id,title})), original.sections) || new Set(ids).size !== ids.length
    || !same(prose.claims.map(claim => claim.id), ids) || old.some(id => !ids.includes(id))
    || !same(prose.website.map(page => page.route), jointProductionRoutes)) throw new Error('B10 final receipt loses original identity, formal sections or exact occurrence order');
  for (const source of original.sources) {
    const web = prose.website.find(page => page.route === source.route);
    if (!Array.isArray(web?.occurrences) || !same(web.occurrences.map(row=>row.id),web.claimIds) || web.occurrences.some(row=>typeof row.section!=='string'||!row.section) || !Array.isArray(web?.claimIds) || new Set(web.claimIds).size !== web.claimIds.length || source.claimIds.some(id => web.claimIds.filter(found => found === id).length !== 1)
      || web.claimIds.some(id => !ids.includes(id))) throw new Error('B10 final website receipt loses or repeats an original source occurrence');
  }
  const websiteIds = prose.website.flatMap(page => page.claimIds);
  if (websiteIds.length !== ids.length || ids.some(id => websiteIds.filter(found => found === id).length !== 1)) throw new Error('B10 website/book canonical closure differs');
  const changes = original.occurrences.flatMap(occurrence => {
    const current = prose.sections.find(section => section.claimIds.includes(occurrence.claimId))?.id;
    return current === occurrence.section ? [] : [{claimId:occurrence.claimId,from:occurrence.section,to:current}];
  });
  const reviewedChanges = prose.mappingChanges ?? [];
  if (!same(reviewedChanges.map(({claimId,from,to}) => ({claimId,from,to})), changes) || reviewedChanges.some(change => typeof change.rationale !== 'string' || !change.rationale.trim()))
    throw new Error('B10 changed original section mappings require exact explicit reviewed dispositions');
  const expectedSources = [...jointProductionRoutes, jointProductionManuscript, '/docs/allocation'];
  if (prose.sources.find(source=>source.route===jointProductionManuscript)?.title !== original.title || !same(prose.sources.map(source => source.route), expectedSources) || prose.sources.some(source => !/^[a-f0-9]{64}$/.test(source.mdxSha256) || typeof source.title !== 'string' || typeof source.description !== 'string' || !Array.isArray(source.ordinary)))
    throw new Error('B10 final receipt must bind all three actual MDX sources and exact ordinary allocation navigation');
  assertJointProductionCaseSelection(prose);
}

const caseNavigation = print => print ? [
  {text:'负担份额',href:`#${printUnitAnchor(jointProductionKey)}-负担份额`},
  {text:'参照供给',href:`#${printUnitAnchor(jointProductionKey)}-参照供给`},
] : [
  {text:'同一批产品，先问份额归给谁',href:'#同一批产品先问份额归给谁'},
  {text:'先保留两项服务，再看替代减项',href:'#先保留两项服务再看替代减项'},
  {text:'部分利用时，重新交代活动与去向',href:'#部分利用时重新交代活动与去向'},
];
function currentCaseNavigation(print) {
  const previous = caseNavigation(print);
  const current = currentBookLayout(`B10:case-navigation:${print ? 'book' : 'web'}`, previous);
  if (!same(current.map(link => link.href), previous.map(link => link.href))
      || current.some(link => typeof link.text !== 'string' || !link.text.trim()))
    throw new Error('B10 reviewed case navigation must preserve the exact native destination identities');
  return current;
}
/** This bounded disposition validates editorial execution, not scientific entailment. */
export function assertJointProductionCaseSelection(prose) {
  const selection=prose?.caseSelection, spec=original.case;
  if (!selection || selection.schemaVersion!==1 || selection.status!=='reviewed'
    || selection.originalCaseDigest!==digest(spec) || selection.inputSha256!==spec.inputSha256
    || !/^[a-f0-9]{64}$/.test(selection.componentSha256??'')) throw new Error('B10 requires independently reviewed caseSelection and original/input/component qualification');
  const actions=['retain','retain','retain','compress','move','compress','retain','move','move','move','move','move','move','compress','move','retain'];
  const paragraphs=selection.paragraphDispositions, headings=selection.headingDispositions;
  if (!Array.isArray(paragraphs) || paragraphs.length!==16 || !Array.isArray(headings) || headings.length!==5
    || paragraphs.some((row,index)=>row.id!==`P${index+1}`||row.action!==actions[index])
    || headings.some((row,index)=>row.index!==index||row.action!==(index<3?'retain':'move')))
    throw new Error('B10 caseSelection needs complete ordered sixteen-paragraph/five-heading reviewed dispositions');
  const webIds=prose.website?.find(page=>page.route===jointProductionRoutes[0])?.claimIds??[],bookIds=prose.sections?.flatMap(section=>section.claimIds)??[];
  for (const row of [...paragraphs,...headings]) if (typeof row.rationale!=='string'||!row.rationale.trim()
    || !Array.isArray(row.targetClaimIds)||new Set(row.targetClaimIds).size!==row.targetClaimIds.length
    || (row.action!=='retain'&&!row.targetClaimIds.length)
    || row.targetClaimIds.some(id=>!webIds.includes(id)||!bookIds.includes(id)))
    throw new Error('B10 caseSelection disposition requires rationale and available exact web/book canonical targets');
  if (!Array.isArray(selection.assumptions)||selection.assumptions.length!==11||selection.assumptions.some(text=>typeof text!=='string'||!text.trim())
    || `计算前提与适用范围${selection.assumptions.join('')}`!==spec.details[0])
    throw new Error('B10 caseSelection must retain all eleven original assumptions exactly and in order');
  for (const print of [false,true]) {
    const view=selection.currentPresentation?.[print?'book':'web'];
    const expectedHeadings=spec.headings.slice(0,3).map(heading=>({...heading,tag:print?`H${Number(heading.tag.slice(1))+1}`:heading.tag}));
    if (typeof view?.text!=='string'||!view.text||!same(view.headings,expectedHeadings)
      || !same(view.links,[...caseNavigation(print),...spec.links]))
      throw new Error('B10 caseSelection current presentation needs exact three original headings and qualified native navigation/downloads');
  }
}

/** CLI-only byte inputs keep filesystem access out of the bundled reader module. */
export function validateJointProductionArtifactBytes(prose, { component, input }) {
  assertJointProductionCaseSelection(prose);
  const errors = [];
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  if (!currentBookFileMatches('components/joint-production-case.tsx', prose.caseSelection.componentSha256, hash(component)))
    errors.push('B10 reviewed case component bytes differ');
  if (hash(input) !== original.case.inputSha256) errors.push('B10 reviewed case input bytes differ');
  return errors;
}

function sections(raw) {
  const split = raw.split(/^## (.+)\s*$/m), headings = [], occurrences = [];
  for (let i = 1; i < split.length; i += 2) {
    const heading = readSourceHeading(split[i]); headings.push(heading);
    occurrences.push(...collectChapterClaimOccurrences(split[i + 1]).map(id => ({ id, section: heading.id })));
  }
  return { headings, occurrences };
}
/** @param {any} edition @param {Map<string,string>} sources @param {typeof original} value @param {any} catalog @param {any} prose @param {string|null} independentDigest */
export function validateJointProductionCoverage(edition, sources, value = original, catalog = null, prose = null, independentDigest = jointProductionProseDigest) {
  assertJointProductionOriginal(value); assertJointProductionRegistration(edition);
  assertJointProductionProseAccepted(prose, independentDigest);
  const errors = [];
  for (const source of prose.sources) if (!sources.has(source.route) || !currentBookMdxMatches(source.route, source.mdxSha256, rawDigest(sources.get(source.route)))) errors.push(`B10 source differs from independently reviewed MDX: ${source.route}`);
  const raw = sources.get(jointProductionManuscript);
  if (raw === undefined) return [...errors, 'Missing actual B10 book manuscript'];
  for (const route of [jointProductionManuscript,...jointProductionRoutes]) {
    const metadata = currentBookLayout(`B10:${route}:source`, sourceMetadata(prose, route)), text = sources.get(route) ?? '';
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
    if (/^title:\s*(.+)$/m.exec(front)?.[1]?.replace(/^(['"])(.*)\1$/, '$2') !== metadata.title || /^description:\s*(.+)$/m.exec(front)?.[1]?.replace(/^(['"])(.*)\1$/, '$2') !== metadata.description) errors.push(`B10 reviewed source metadata differs: ${route}`);
  }
  const actual = sections(raw), expected = prose.sections.flatMap(section => section.claimIds.map(id => ({id,section:section.id})));
  if (!same(actual.headings, currentBookLayout('B10:headings',jointProductionTitles.map(title=>({id:title,title})))) || !same(actual.occurrences, expected) || collectChapterClaimOccurrences(raw).length !== expected.length) errors.push('B10 book claims missing, duplicated, reordered, outside formal sections or misplaced');
  for (const page of prose.website) {
    const raw = sources.get(page.route), headings = prose.sources.find(source=>source.route===page.route)?.headings ?? value.sourceHeadings.filter(heading=>heading.route===page.route).map(heading=>({id:heading.id,text:heading.title}));
    const occurrences = raw === undefined ? [] : sections(raw).occurrences.map(row=>({...row,section:headings.find(heading=>heading.id===row.section || heading.text===row.section)?.id}));
    if (raw === undefined || !same(collectChapterClaimOccurrences(raw),page.claimIds) || !same(occurrences,page.occurrences)) errors.push(`B10 fine website occurrences differ: ${page.route}`);
  }
  const caseLiteral = /<TeachingCase\s+id="CASE-JOINT-BATCH"\s+version="1\.0\.0"\s*\/>/g;
  for (const route of [jointProductionRoutes[0], jointProductionManuscript]) if ([...(sources.get(route) ?? '').matchAll(caseLiteral)].length !== 1) errors.push(`B10 source must retain exactly one real joint case: ${route}`);
  if (catalog) for (const fixed of prose.claims) {
    const claim = catalog.claims.find(claim => claim.id === fixed.id);
    if (!claim || claim.status !== 'reviewed' || !currentBookRecordMatches('claims', fixed, claim)) errors.push(`B10 canonical record differs from independently reviewed prose: ${fixed.id}`);
  }
  return errors;
}

export function jointProductionHeadingEntries(history = captured) {
  assertJointProductionHeadingHistory(history);
  return history.addresses.map(row => ({route:row.route,path:row.path,id:row.id,targets:[{route:row.route,path:row.path,id:row.id,kind:'heading'}],mode:'retained',edition:{sourceCommit:history.sourceCommit,sourceDate:history.sourceDate}}));
}
const location = (route, path) => path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route);
const target = (route,path,kind,id,claimId) => ({route,path,id,kind,...(claimId?{claimId}:{})});

/** Old scopes remain exact original subsets; actual book notes use one continuous plan. */
/** @param {any} prose JSON data is admitted by the independently pinned runtime contract. */
export function remapJointProductionCitations(entries, value = original, history = captured, prose = null, independentDigest = jointProductionProseDigest) {
  assertJointProductionOriginal(value); assertJointProductionHeadingHistory(history);
  if (prose !== null) assertJointProductionProseAccepted(prose,independentDigest);
  const acceptedSection = id => prose ? prose.sections.find(section=>section.claimIds.includes(id))?.id : value.occurrences.find(row=>row.claimId===id)?.section;
  const frozen = [...value.originalHistoricalEntries, ...jointProductionHeadingEntries(history)], byAddress = new Map(frozen.map(entry => [`${entry.path}#${entry.id}`, entry]));
  if (frozen.length !== 194 || byAddress.size !== 194) throw new Error('B10 requires all180 original plus14 actual captured addresses');
  for (const [address, fixed] of byAddress) {
    const found = entries.filter(entry => `${entry.path}#${entry.id}` === address);
    if (found.length !== 1 || !sameRecord(found[0], fixed)) throw new Error(`B10 historical address missing, repeated or changed: ${address}`);
  }
  for (const entry of entries) if (jointProductionRoutes.includes(entry.route) && !byAddress.has(`${entry.path}#${entry.id}`)) throw new Error(`B10 unexpected original historical scope: ${entry.id}`);
  return entries.map(entry => {
    if (!byAddress.has(`${entry.path}#${entry.id}`)) return entry;
    const source = value.sources.find(source => source.route === entry.route), path = entry.path, print = path === '/print', route = print ? jointProductionKey : source.route, prefix = location(route,path), first = entry.targets[0];
    const note = id => target(route,path,'note',`${prefix}-claim-${id}`,id);
    if (first.kind === 'note') {
      const targets = entry.targets.map(item => note(item.claimId));
      return {...entry,route,targets,mode:entry.id === targets[0].id?'retained':'alias'};
    }
    if (first.kind === 'heading') {
      if (entry.id === value.case.headingId) return {...entry,route,targets:[target(route,path,'heading',value.case.headingId)],mode:'retained'};
      if (!print) return entry;
      const old = value.sourceHeadings.find(heading => heading.route === source.route && (first.id === heading.id || first.id === `${printUnitAnchor(source.route)}-${heading.id}`));
      if (!old) throw new Error(`B10 unmapped original heading: ${entry.id}`);
      const names = [...new Set(old.claimIds.map(acceptedSection))];
      if (!names.length) names.push(old.target); // The original widget-only formal heading.
      if (names.some(name=>!jointProductionTitles.includes(name))) throw new Error(`B10 historical heading has unknown current placement: ${entry.id}`);
      const destinations = names.map(name=>target(route,path,'heading',`${prefix}-${name}`));
      if (destinations.length===1) return {...entry,route,targets:destinations,mode:'alias'};
      const targets=[...destinations,...old.claimIds.map(note)];
      const text=`原《${source.title}》“${old.title}”所含原命题分列于下列具名位置；这些链接保留原段落范围，现行书章另有其他内容。`;
      return {...entry,route,targets,mode:'notice',scope:{text,targets}};
    }
    const notes = source.claimIds.map(note), group = first.kind === 'note-group', native = group ? `${prefix}-annotations` : prefix;
    const headings = print ? [...new Set(source.claimIds.map(acceptedSection))].map(section=>target(route,path,'heading',`${prefix}-${section}`)) : value.sourceHeadings.filter(heading=>heading.route===source.route).map(heading=>target(route,path,'heading',heading.id));
    const targets = group ? notes : [...headings,...notes];
    const text = `原《${source.title}》${group?'注释组':'篇章'}的范围由下列原有${source.claimIds.length}则注释${group?'':'与具名内容位置'}界定；各链接保留原命题及原顺序，现行书章另有其他内容。`;
    if (entry.id === native) return {...entry,route,targets:[target(route,path,first.kind,native)],mode:'retained',scope:{text,targets}};
    return {...entry,route,targets,mode:'notice',scope:{text,targets}};
  });
}

/** Only the qualified ordinary chapter link is converted; unknown fragments keep their fine-page meaning. */
export function jointProductionBookHref(href) {
  if (typeof href === 'string' && href.replace(/\/$/,'') === jointProductionRoutes[0]) return `#${printUnitAnchor(jointProductionKey)}`;
  return href;
}

/** Original numeric qualification and separately accepted current selection remain distinct. */
export function validateJointProductionCaseOutput(unit, {print = false, section = null, prose = null, independentDigest = jointProductionProseDigest} = {}) {
  assertJointProductionOriginal(); assertJointProductionProseAccepted(prose,independentDigest);
  const errors = [], nodes = unit.querySelectorAll('[data-case-id]'), spec = original.case;
  const selection=prose.caseSelection,presentation=selection.currentPresentation[print?'book':'web'];
  if (nodes.length !== 1 || nodes[0].getAttribute('data-case-id') !== spec.caseId || nodes[0].getAttribute('data-case-version') !== spec.version) return ['B10 actual joint case missing, repeated or changed'];
  // Keep the original containing ancestry: numbered semantic preparation clones
  // the case and deliberately detaches it from wrappers in the reading unit.
  const visibilityNodes=[nodes[0],...nodes[0].querySelectorAll('*')];
  for(let parent=nodes[0].parentNode;parent?.nodeType===1;parent=parent.parentNode){visibilityNodes.push(parent);if(parent===unit)break;}
  const concealed=visibilityNodes.some(item=>item.tagName==='DETAILS'||item.hasAttribute('hidden')||item.getAttribute('aria-hidden')?.toLowerCase()==='true'||item.hasAttribute('style')
    || /(?:^|\s)(?:hidden|sr-only|print-only|screen-only)(?:\s|$)/.test(item.getAttribute('class')??''));
  let node = nodes[0];
  if(node.querySelector('[data-reader-number],[data-reader-heading-title]')){const prepared=prepareNumberedCaseElement(node,print?'book':'web',print?jointProductionKey:jointProductionRoutes[0]);if(prepared.errors.length)return prepared.errors.map(error=>`B10 actual numbered case: ${error}`);node=prepared.element;}
  const heading = node.querySelector(`[id="${spec.headingId}"]`);
  if (!heading || heading.tagName !== (print?'H4':'H3') || heading.text !== spec.headingText || node.getAttribute('aria-labelledby') !== spec.headingId || unit.querySelectorAll(`[id="${spec.headingId}"]`).length !== 1) errors.push('B10 actual case heading/accessible identity differs');
  if (section !== null && section !== (print?spec.section:spec.websiteSection)) errors.push('B10 actual case is outside its adopted section');
  const navigation = currentCaseNavigation(print);
  const oldNavigation = caseNavigation(print);
  const expectedText = oldNavigation.reduce((text, old, index) => text.replace(old.text, navigation[index].text), presentation.text);
  if (node.text !== expectedText) errors.push('B10 actual case text differs from independently reviewed selection');
  const tables = node.querySelectorAll('table');
  if (tables.length !== spec.tables.length || tables.some((table,index) => !same(table.querySelectorAll('tr').map(row=>row.querySelectorAll('th,td').map(cell=>compact(cell.text))),spec.tables[index].rows.map(row=>row.map(compact))))) errors.push('B10 actual case tables differ');
  if (!same(node.querySelectorAll('a').map(link=>({text:link.text,href:link.getAttribute('href')})),[...navigation, ...presentation.links.slice(oldNavigation.length)])) errors.push('B10 actual case native navigation/downloads differ');
  if (!same(node.querySelectorAll('h1,h2,h3,h4,h5,h6').map(heading=>({tag:heading.tagName,id:heading.id??'',text:heading.text})),presentation.headings)) errors.push('B10 actual case heading roster/hierarchy differs');
  const conditions=node.querySelectorAll('.teaching-case-conditions'),items=node.querySelectorAll('li');
  if (conditions.length!==1||conditions[0].querySelector('strong')?.text!=='计算前提与适用范围'
    || !same(items.map(item=>item.text),selection.assumptions)||items.some(item=>!item.closest('.teaching-case-conditions'))
    || concealed)
    errors.push('B10 actual case eleven original assumptions must remain visible and exact');
  if (tables.some((table,index) => table.querySelector('caption')?.text !== spec.tables[index]?.caption
    || !same(table.querySelectorAll('tr').map(row=>row.querySelectorAll('th,td').map(cell=>({tag:cell.tagName,scope:cell.getAttribute('scope')??null}))),spec.tables[index]?.cellSemantics))) errors.push('B10 actual case caption/header semantics differ');
  return errors;
}

function sourceMetadata(prose, route) { return prose.sources.find(source => source.route === route); }
function targetLabel(destination, prose) {
  const print = destination.path === '/print', page = print ? {title:original.title,claimIds:prose.sections.flatMap(section=>section.claimIds)} : {...sourceMetadata(prose,destination.route),claimIds:prose.website.find(page=>page.route===destination.route)?.claimIds};
  if (destination.kind === 'note') return `《${page.title}》注 ${page.claimIds.indexOf(destination.claimId)+1}`;
  const section = print ? jointProductionTitles.find(title=>destination.id.endsWith(`-${title}`)) : null;
  return `《${page.title}》${section?`·${section}`:destination.kind==='note-group'?'注释':''}`;
}
function validateOrdinary(unit, rows, print, checked, route = jointProductionKey) {
  const errors=[];
  for (const row of rows) {
    const found=unit.querySelectorAll('p').filter(node=>!node.closest('.chapter-notes,[data-legacy-for],[data-legacy-notice],[data-legacy-scope],.teaching-case,.docs-pagination')&&!node.querySelector('a[role="doc-noteref"]')&&compact(node.text)===compact(row.text));
    if (found.length!==1) {errors.push('B10 reviewed ordinary paragraph missing, repeated or changed');continue;}
    const node=found[0],links=node.querySelectorAll('a'),wanted=(row.navigation??[]).map(link=>({...link,href:print?frameworkBookHref(link.href,route):link.href}));
    if (!same(links.map(link=>({text:link.text,href:decodeURI(link.getAttribute('href')??'')})),wanted.map(link=>({...link,href:decodeURI(link.href)}))))errors.push('B10 reviewed ordinary navigation differs');
    else {
      if (row.section) {
        const tag = print ? 'H3' : 'H2', sequence = unit.querySelectorAll('h2,h3,p').filter(item => item === node || (item.tagName === tag && !item.closest('.teaching-case,.chapter-notes,[data-legacy-notice],[data-legacy-scope]'))), previous = sequence.slice(0,sequence.indexOf(node)).at(-1);
        const sectionId = print ? `${printUnitAnchor(route)}-${row.section}` : row.section;
        if (previous?.id !== sectionId) errors.push('B10 reviewed ordinary paragraph has wrong section');
      }
      checked.add(node);
    }
  }
  return errors;
}

/** Source hashes, real body, complete annotations and ordinary/widget output are independent gates. */
export function validateRenderedJointProduction(document,path,value = original,catalog = null,prose = null,independentDigest = jointProductionProseDigest) {
  const consumerErrors = validateJointProductionConsumerOutput(document,path,catalog);
  if (![...jointProductionRoutes,'/print','/docs/allocation'].includes(path)) return consumerErrors;
  assertJointProductionOriginal(value);assertJointProductionProseAccepted(prose,independentDigest);
  const print=path==='/print',route=print?jointProductionKey:path,units=print?document.querySelectorAll(`article[data-reader-route="${route}"]`):document.querySelectorAll('article');
  if (units.length!==1)return [`${path}: B10 actual reading unit missing or repeated`];
  const unit=units[0],errors=[...consumerErrors],checked=new Set();
  if (path==='/docs/allocation') return validateOrdinary(unit,currentBookLayout('B10:/docs/allocation:source', sourceMetadata(prose,path)).ordinary,false,checked);
  const sourceRoute = print ? jointProductionManuscript : route;
  const metadata=currentBookLayout(`B10:${sourceRoute}:source`, sourceMetadata(prose, sourceRoute)),expected=print?prose.sections.flatMap(section=>section.claimIds.map(id=>({id,section:section.id}))):prose.website.find(page=>page.route===route).occurrences,prefix=location(route,path),claims=new Map((catalog?.claims??[]).map(claim=>[claim.id,claim]));
  const children=unit.childNodes.filter(node=>node.nodeType===1),title=children.find(node=>node.tagName===(print?'H2':'H1'));
  if (!title || title.text!==metadata.title || (print&&unit.getAttribute('data-reader-title')!==metadata.title))errors.push(`${path}: B10 actual title differs`);else checked.add(title);
  const description=title&&children[children.indexOf(title)+1];
  if (description?.tagName!=='P'||description.text!==metadata.description)errors.push(`${path}: B10 actual description differs`);else checked.add(description);
  if(!print){for(const n of children.filter(node=>node.tagName==='DIV'&&node.text==='生命周期评价的前世今生'))checked.add(n);
    const pagination=unit.querySelectorAll('.docs-pagination'),nav=metadata.navigation??[];
    if(pagination.length===1&&isVerifiedReaderPagination(pagination[0]))checked.add(pagination[0]);
    else if(pagination.length!==1||!same(pagination[0].querySelectorAll('a').map(link=>({href:link.getAttribute('href'),text:compact(link.text)})),nav.map(link=>({href:link.href,text:compact(link.title+link.description)}))))errors.push(`${path}: B10 website pagination differs`);else checked.add(pagination[0]);}
  const expectedHeadings = print ? currentBookLayout('B10:headings',jointProductionTitles.map(title=>({id:title,title}))).map(({id,title})=>({id,text:title})) : metadata.headings ?? value.sourceHeadings.filter(heading=>heading.route===route).map(heading=>({id:heading.id,text:heading.title}));
  const actual=[],headings=[];let section=null;
  for(const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"],.teaching-case')){
    if(node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]'))continue;
    if(node.classList?.contains('teaching-case')){const caseErrors=validateJointProductionCaseOutput(unit,{print,section,prose,independentDigest});errors.push(...caseErrors);if(!caseErrors.length)checked.add(node);
      for(const link of currentCaseNavigation(print)){const id=link.href.slice(1),found=unit.querySelectorAll(`[id="${id}"]`);if(found.length!==1||found[0].tagName!==(print?'H3':'H2')||found[0].text.replace(/复制章节链接$/,'')!==link.text)errors.push(`${path}: B10 case navigation lacks its exact native body section`);}continue;}
    if(node.closest('.teaching-case'))continue;
    if(node.getAttribute('role')==='doc-noteref'){
      const id=node.getAttribute('data-reader-reference'),paragraph=node.closest('p'),claim=claims.get(id);actual.push({id,section});
      if(!paragraph||!claim||readerParagraphText(paragraph,node)!==claim.text)errors.push(`${path}: B10 actual canonical paragraph differs: ${id}`);else checked.add(paragraph);
      if(!currentBookRecordMatches('claims', prose.claims.find(fixed=>fixed.id===id), claim))errors.push(`${path}: B10 actual canonical record differs: ${id}`);
    }else if(node.closest('.chapter-notes')){section=null;if(node.id===`${prefix}-annotations`&&node.text==='注释'&&node.tagName===(print?'H3':'H2'))checked.add(node);else errors.push(`${path}: B10 unexpected annotation heading`);}
    else if(node!==title){const local=print?node.id.slice(prefix.length+1):node.id;headings.push(local);section=local;
      if(node.tagName!==(print?'H3':'H2')||!expectedHeadings.some(heading=>heading.id===local&&heading.text===node.text.replace(/复制章节链接$/,'')))errors.push(`${path}: B10 actual formal heading differs`);else checked.add(node);}
  }
  if(!print) {
    const actualHeadings = unit.querySelectorAll('h1,h2,h3,h4,h5,h6').filter(node=>node!==title&&!node.closest('.chapter-notes,.teaching-case,[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')).map(node=>({id:node.id,text:node.text.replace(/复制章节链接$/,''),tag:node.tagName}));
    if(!same(actualHeadings,expectedHeadings.map(heading=>({...heading,tag:'H2'}))))errors.push(`${path}: B10 fine-page actual headings differ`);
  }
  if(!same(actual,expected)|| (print&&!same(headings,expectedHeadings.map(row=>row.id))))errors.push(`${path}: B10 actual body order/section/identity differs`);
  const ids=expected.map(row=>row.id),groups=unit.querySelectorAll('.chapter-notes');
  if(groups.length!==1||!same(unit.querySelectorAll('[data-reader-claim]').map(node=>node.getAttribute('data-reader-claim')),ids))errors.push(`${path}: B10 actual continuous note plan differs`);
  if(groups.length===1&&groups[0].querySelectorAll('h1,h2,h3,h4,h5,h6').length!==1)errors.push(`${path}: B10 annotation heading is missing or repeated`);
  const annotationErrors=validateExchangeAnnotationOutput(document,unit,route,catalog,{print});errors.push(...annotationErrors);
  if(!annotationErrors.length)for(const note of unit.querySelectorAll('[data-reader-claim]'))for(const annotation of note.querySelectorAll('.claim-annotation'))checked.add(annotation);
  if((print||route===jointProductionRoutes[0])&&unit.querySelectorAll('.teaching-case').length!==1)errors.push(`${path}: B10 actual case is missing`);
  if(!print&&route===jointProductionRoutes[1]&&unit.querySelectorAll('.teaching-case').length)errors.push(`${path}: B10 case duplicated in fine C10`);
  errors.push(...validateOrdinary(unit,metadata.ordinary,print,checked));
  const entries=applyCurrentHistoricalEntries(document, remapJointProductionCitations([...value.originalHistoricalEntries,...jointProductionHeadingEntries()],value,captured,prose,independentDigest));
  for(const entry of entries.filter(entry=>entry.path===path&&entry.route===route)) {
    if(entry.mode==='notice'&&unit.querySelectorAll(`[id="${entry.id}"][data-legacy-notice]`).length!==1)errors.push(`${path}: B10 original native migration notice missing or repeated: ${entry.id}`);
    if(entry.mode==='retained'&&entry.scope) {
      const contexts=unit.querySelectorAll(`[data-legacy-scope="${entry.id}"]`),context=contexts[0];
      if(contexts.length!==1||!((context.parentNode===unit&&unit.id===entry.id)||(context.previousElementSibling?.id===entry.id&&context.parentNode===context.previousElementSibling.parentNode)))errors.push(`${path}: B10 original retained scope missing, repeated or detached: ${entry.id}`);
    }
  }
  const contexts=validateReaderHistoricalText(unit,entries,path,target=>targetLabel(target,prose));errors.push(...contexts.errors);for(const node of contexts.checked)checked.add(node);
  if(unaccountedReaderText(unit,checked).length)errors.push(`${path}: B10 actual output contains unexpected unreviewed text`);
  if(print){const allocation=document.querySelector('article[data-reader-route="/docs/allocation"]');if(!allocation)errors.push('/print: missing ordinary allocation navigation consumer');else errors.push(...validateOrdinary(allocation,currentBookLayout('B10:/docs/allocation:source', sourceMetadata(prose,'/docs/allocation')).ordinary,true,new Set(),'/docs/allocation'));}
  return errors;
}


export function validateJointProductionConsumerOutput(document,path,catalog) {
  if(!catalog)return [];
  const expected = [
    {route:'/docs/book/market-boundaries-and-response',ids:['cl-market-question','cl-market-closing']},
    {route:'/docs/book/connecting-objects-references-and-time',ids:['cl-connect-prospective-two-questions']},
    {route:'/docs/book/from-connected-results-to-conditional-judgment',ids:['cl-connect-values-stay-specific','cl-connect-next-evidence-at-link']},
  ], errors=[];
  for(const consumer of expected) {
    if(path!=='/print'&&path!==consumer.route)continue;
    const actualRoute=path==='/print'&&closingSynthesisRoutes.includes(consumer.route)?closingSynthesisKey:consumer.route;
    const units=path==='/print'?document.querySelectorAll(`article[data-reader-route="${actualRoute}"]`):document.querySelectorAll('article');
    if(units.length!==1){errors.push(`${path}: B10 outside premise consumer missing or repeated: ${consumer.route}`);continue;}
    for(const id of consumer.ids)if(units[0].querySelectorAll(`[data-reader-claim="${id}"]`).length!==1)errors.push(`${path}: B10 outside actual premise annotation missing: ${id}`);
    errors.push(...validateExchangeAnnotationOutput(document,units[0],actualRoute,catalog,{print:path==='/print',claimIds:consumer.ids}));
  }
  return errors;
}
