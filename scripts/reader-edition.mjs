import { assertHybridInventoryRegistration } from './reader-hybrid-inventory.mjs';
import { assertExchangeSemanticsRegistration, exchangeSemanticsRoute, exchangeSemanticsTitles } from './reader-exchange-semantics.mjs';
import { assertProcessNetworkRegistration } from './reader-process-network.mjs';
import { assertFunctionalReferenceRegistration, functionalReferenceSupplement } from './reader-functional-reference.mjs';
import { createHash } from 'node:crypto';
import { assertCleanerProductionRegistration } from './reader-cleaner-production.mjs';
import { collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';

export const frameworkUnitKey = 'book-framework-responsibilities';
export const frameworkManuscript = '/monograph/framework-responsibilities';
export const frameworkAppendix = '/docs/appendices/cml-framework-calculations';
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function assertFrameworkAccepted(accepted) {
  if (digest(accepted) !== '8aaac8d5395bf5ffc4868bc0207dff1442fe3752745a101bd1d0f7ca69550d0e')
    throw new Error('Accepted framework 65-proposition inventory differs from qualified a0fee0a');
}
export function assertFrameworkHeadingHistory(history) {
  if (digest(history) !== '92abc3e766d8c9e711cfd2a161fc0d5ad2ae1d01df6ead654db8d3e73ae3103b')
    throw new Error('Published framework heading inventory differs from actual a0fee0a capture');
}

/** Actual source discovery is independent of the mutable edition registration. */
export function currentEditionKeys(edition, availableSources, baseline, placements) {
  const units = edition.units;
  if (!Array.isArray(units) || new Set(units.map(unit => unit.key)).size !== units.length)
    throw new Error('Book edition has missing or duplicate units');
  assertCleanerProductionRegistration(edition);
  assertFunctionalReferenceRegistration(edition);
  assertProcessNetworkRegistration(edition);
  assertHybridInventoryRegistration(edition);
  assertExchangeSemanticsRegistration(edition);
  const assembly = units.find(unit => unit.key === frameworkUnitKey);
  if (!assembly || assembly.source !== frameworkManuscript || assembly.kind !== 'chapter') throw new Error('Missing accepted B04 manuscript registration');
  if (!units.some(unit => unit.key === frameworkAppendix && unit.source === frameworkAppendix && unit.kind === 'appendix')) throw new Error('Missing accepted X02 appendix registration');
  const expectedCoverage = ['/docs/book/framework-history', '/docs/book/cml-computation-judgment-and-improvement'];
  if (JSON.stringify(assembly.coverage) !== JSON.stringify(expectedCoverage)) throw new Error('Book framework source coverage differs from accepted pair');
  const available = new Set(availableSources), covered = new Set();
  for (const unit of units) {
    if (!available.has(unit.source)) throw new Error(`Missing book source: ${unit.source}`);
    if (covered.has(unit.source)) throw new Error(`Duplicate book source: ${unit.source}`);
    covered.add(unit.source);
    for (const source of unit.coverage ?? []) {
      if (!available.has(source) || covered.has(source)) throw new Error(`Missing or repeated consumed source: ${source}`);
      covered.add(source);
    }
  }
  const navigation = new Set(['/docs/appendices']);
  for (const source of available) if (!navigation.has(source) && !covered.has(source)) throw new Error(`Reader source has no current book registration: ${source}`);
  const retained = [...placements.frontMatter, ...baseline.pages.filter(page => page.printOrdinal !== undefined).sort((a,b) => a.printOrdinal-b.printOrdinal).map(page => page.route), ...(placements.printAdditions ?? []).map(unit => unit.route)];
  const expected = retained.filter(route => route !== expectedCoverage[1] && route !== functionalReferenceSupplement && route !== '/docs/flows' && route !== '/docs/characterization').map(route => route === expectedCoverage[0] ? frameworkUnitKey : route);
  if (JSON.stringify(units.map(unit => unit.key)) !== JSON.stringify(expected)) throw new Error('Book edition omitted, reordered or misclassified an accepted retained unit');
  for (const unit of units.filter(unit => unit.key !== frameworkUnitKey)) {
    const kind = placements.frontMatter.includes(unit.key) ? 'front-matter' : unit.key.startsWith('/docs/book/') ? 'chapter' : unit.key.startsWith('/docs/appendices/') ? 'appendix' : 'topic';
    if (unit.source !== unit.key || unit.kind !== kind) throw new Error(`Book unit has incorrect source or kind: ${unit.key}`);
  }
  const roster = units.map(({key,source,kind})=>({key,source,kind}));
  if (digest(roster) !== '5f3ff6a7388d9983531aed817a41b1a46dc89611325b5a8f541696fd88eaa490')
    throw new Error('Current mixed reading roster differs from registered B04/B06/B08 edition');
  return units.map(unit => unit.key);
}

/** Preserve every accepted source occurrence exactly once in its assigned section. */
export function validateFrameworkCoverage(edition, sources, accepted, catalog = null) {
  assertFrameworkAccepted(accepted);
  const errors = [];
  const manuscript = sources.get(frameworkManuscript), appendix = sources.get(frameworkAppendix);
  if (manuscript === undefined || appendix === undefined) return ['Missing accepted B04 or X02 source'];
  const units = edition.units;
  const b04 = units.find(unit => unit.key === frameworkUnitKey);
  if (!b04) return ['Missing accepted B04 registration'];
  if (JSON.stringify(b04.sections) !== JSON.stringify(accepted.sections.map(({id,title}) => ({id,title})))) errors.push('B04 formal sections differ from accepted five-section contract');
  const split = manuscript.split(/^## (.+)\s*$/m), headings = [];
  const occurrences = [];
  for (let i = 1; i < split.length; i += 2) {
    const section = split[i].trim(); headings.push(section);
    for (const id of collectChapterClaimOccurrences(split[i+1])) occurrences.push({id,section});
  }
  const all = collectChapterClaimOccurrences(manuscript);
  if (occurrences.length !== all.length) errors.push('B04 has body propositions outside formal sections');
  if (JSON.stringify(headings) !== JSON.stringify(accepted.sections.map(section=>section.id))) errors.push('B04 manuscript must have five actual formal sections');
  const actual = [...occurrences.map(item=>({...item,key:frameworkUnitKey})), ...collectChapterClaimOccurrences(appendix).map(id=>({id,key:frameworkAppendix}))];
  const expected = [...accepted.sections.flatMap(section=>section.claimIds.map(id=>({id,section:section.id,key:frameworkUnitKey}))), ...accepted.appendix.claimIds.map(id=>({id,key:frameworkAppendix}))];
  for (const wanted of expected) {
    const found = actual.filter(item=>item.id===wanted.id);
    if (found.length !== 1 || found[0]?.key !== wanted.key || found[0]?.section !== wanted.section) errors.push(`Framework occurrence missing, duplicated or misplaced: ${wanted.id}`);
  }
  const old = new Set(expected.map(item=>item.id));
  for (const source of accepted.sources) {
    const raw = sources.get(source.route);
    if (raw === undefined) { errors.push(`Missing website source: ${source.route}`); continue; }
    const claims = collectChapterClaimOccurrences(raw);
    const wanted = source.claimIds.filter(id=>!accepted.appendix.claimIds.includes(id));
    for (const id of wanted) if (claims.filter(claim=>claim===id).length !== 1) errors.push(`Website source occurrence missing or duplicated: ${source.route} ${id}`);
    for (const id of accepted.appendix.claimIds) if (claims.includes(id)) errors.push(`Moved appendix proposition duplicated in website source: ${id}`);
  }
  // New authored records are explicit and must already have editorial review.
  if (catalog) for (const occurrence of actual) {
    const record = catalog.claims.find(claim=>claim.id===occurrence.id);
    if (!record || record.status !== 'reviewed') errors.push(`Unreviewed book proposition: ${occurrence.id}`);
    if (!old.has(occurrence.id) && !record?.premiseIds?.length && !record?.evidenceIds?.length) errors.push(`New book proposition has no reviewed premises or evidence: ${occurrence.id}`);
  }
  for (const id of new Set(actual.map(item=>item.id))) if (actual.filter(item=>item.id===id).length!==1) errors.push(`Duplicate framework body proposition: ${id}`);
  return errors;
}

/** Translate source-scoped print histories into the actual book destinations. */
export function remapBookCitations(entries, edition, accepted, placements) {
  assertFrameworkAccepted(accepted);
  const consumed = new Set(accepted.sources.map(source=>source.route));
  const claims = new Map(accepted.sections.flatMap(section=>section.claimIds.map(id=>[id,{key:frameworkUnitKey,section:section.id}])));
  for (const id of accepted.appendix.claimIds) claims.set(id,{key:frameworkAppendix});
  const target = (key,kind,section,claimId) => ({route:key,path:'/print',id:kind==='note' ? `${printUnitAnchor(key)}-claim-${claimId}` : kind==='chapter' ? printUnitAnchor(key) : kind==='note-group' ? `${printUnitAnchor(key)}-annotations` : `${printUnitAnchor(key)}-${section}`,kind,...(claimId?{claimId}:{})});
  const sectionTargets = names => names.map(name=>name==='appendix' ? target(frameworkAppendix,'chapter') : target(frameworkUnitKey,'heading',name));
  const chapterTargets = route => [...new Set(accepted.sources.find(source=>source.route===route).claimIds.map(id=>claims.get(id).key))].map(key=>target(key,'chapter'));
  return entries.map(entry=>{
    if (entry.path !== '/print' || !consumed.has(entry.route)) return entry;
    let targets;
    if (entry.targets[0]?.kind === 'note') targets=entry.targets.map(note=>{const destination=claims.get(note.claimId);if (!destination) throw new Error(`Unknown accepted historical claim ${note.claimId}`);return target(destination.key,'note',null,note.claimId);});
    else if (entry.targets[0]?.kind === 'chapter') targets=chapterTargets(entry.route);
    else if (entry.targets[0]?.kind === 'note-group') targets=chapterTargets(entry.route).map(item=>target(item.route,'note-group'));
    else {
      const heading=entry.id.startsWith('print-chapter-') ? entry.id.replace(/^print-chapter-\d+-/,'') : entry.id.slice(printUnitAnchor(entry.route).length+1);
      const scope=accepted.sourceHeadings.find(item=>item.route===entry.route&&item.id===heading);
      if (!scope) throw new Error(`Unmapped historical printed heading: ${entry.route} ${heading}`);
      const destinations = [...new Set(scope.claimIds.map(id=>claims.get(id)?.section ?? 'appendix'))];
      targets=sectionTargets(destinations);
    }
    const unique=[...new Map(targets.map(item=>[item.id,item])).values()];
    // Split scopes stay native notices even though all destinations share /print.
    return {...entry,route:unique.length===1?unique[0].route:frameworkUnitKey,targets:unique,mode:unique.length===1?'alias':'notice'};
  });
}

export function publishedHeadingEntries(history) {
  assertFrameworkHeadingHistory(history);
  return history.canonicalPrintedHeadings.map(heading=>({route:heading.route,path:'/print',id:heading.id,
    targets:[{route:heading.route,path:'/print',id:heading.id,kind:'heading'}],mode:'retained',
    edition:{sourceCommit:history.sourceCommit,sourceDate:'2026-11-07'}}));
}

/** Qualified links for the bounded assembly; ambiguous old scopes keep their website meaning. */
export function frameworkBookHref(href, currentKey) {
  if (typeof href !== 'string') return href;
  if (href.startsWith('/print/#')) return href.slice('/print/'.length);
  const [path,fragment] = href.split('#');
  const route = path.replace(/\/$/,'');
  if (currentKey === exchangeSemanticsRoute) {
    if (!path && exchangeSemanticsTitles.includes(decodeURIComponent(fragment ?? '')))
      return `#${printUnitAnchor(exchangeSemanticsRoute)}-${decodeURIComponent(fragment)}`;
    if (route === '/docs/allocation' && !fragment)
      return `#${printUnitAnchor('/docs/allocation')}`;
  }
  if (route === frameworkAppendix) return `#${printUnitAnchor(frameworkAppendix)}${fragment ? `-${decodeURIComponent(fragment)}` : ''}`;
  if (currentKey === frameworkAppendix && route === '/docs/book/cml-computation-judgment-and-improvement') {
    const section = {'从活动平衡到废物贡献':'清单计算','另一个研究怎样使用这份指南':'外部采用'}[decodeURIComponent(fragment ?? '')];
    if (section) return `#${printUnitAnchor(frameworkUnitKey)}-${section}`;
  }
  return href;
}

/** Output occurrence check is independent of note deduplication and source registration. */
export function validateRenderedFrameworkCoverage(bodyClaims, accepted) {
  assertFrameworkAccepted(accepted);
  const errors=[];
  for (const [key,ids] of [[frameworkUnitKey,accepted.sections.flatMap(section=>section.claimIds)],[frameworkAppendix,accepted.appendix.claimIds]]) {
    const actual=bodyClaims.get(key)??[];
    for (const id of ids) if (actual.filter(claim=>claim===id).length!==1) errors.push(`Rendered framework body missing or duplicated: ${key} ${id}`);
  }
  return errors;
}
