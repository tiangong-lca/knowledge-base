import pmAccepted from '@/config/pm-selection-accepted.json';
import { pmSelectionAppendix, pmSelectionCitationLabel, pmSelectionHeadingEntries, pmSelectionRoute, remapPmSelectionCitations, validatePmSelectionCoverage } from '@/scripts/reader-pm-selection.mjs';
import toxicityAccepted from '@/config/toxicity-pathways-accepted.json';
import readings from '@/knowledge/research/readings.json';
import literature from '@/knowledge/research/literature-map.json';
import { remapToxicityPathwaysCitations, toxicityPathwaysCitationLabel, toxicityPathwaysHeadingEntries, toxicityPathwaysRoute, validateToxicityPathwaysCoverage } from '@/scripts/reader-toxicity-pathways.mjs';
import dataAccepted from '@/config/data-applicability-accepted.json';
import { dataApplicabilityKey, dataApplicabilityRoutes, dataApplicabilityHeadingEntries, remapDataApplicabilityCitations, validateDataApplicabilityCoverage } from '@/scripts/reader-data-applicability.mjs';
import climateAccepted from '@/config/climate-assembly-accepted.json';
import { climateAssemblyKey, climateAssemblyRoutes, climateAssemblyAppendix, climateAssemblyHeadingEntries, remapClimateAssemblyCitations, validateClimateAssemblyCoverage } from '@/scripts/reader-climate-assembly.mjs';
import closingHistory from '@/config/closing-synthesis-heading-history.json';
import closingProse from '@/config/closing-synthesis-prose-accepted.json';
import { closingSynthesisHeadingEntries, remapClosingSynthesisCitations, validateClosingSynthesisCoverage } from '@/scripts/reader-closing-synthesis.mjs';
import { getPresentationUnits } from '@/scripts/reader-numbering.mjs';
import jointOriginal from '@/config/joint-production-original.json';
import wallOriginal from '@/config/wall-selection-original.json';
import wallHeadings from '@/config/wall-selection-heading-history.json';
import wallAccepted from '@/config/wall-selection-accepted.json';
import { wallSelectionRoute, wallSelectionTitles, wallSelectionCaseHeadingId, wallSelectionHeadingEntries, remapWallSelectionCitations, validateWallSelectionCoverage } from '@/scripts/reader-wall-selection.mjs';
import jointHeadings from '@/config/joint-production-heading-history.json';
import jointProse from '@/config/joint-production-prose-accepted.json';
import { jointProductionHeadingEntries, remapJointProductionCitations, validateJointProductionCoverage } from '@/scripts/reader-joint-production.mjs';
import hybridAccepted from '@/config/hybrid-inventory-accepted.json';
import hybridHeadings from '@/config/hybrid-inventory-heading-history.json';
import hybridProse from '@/config/hybrid-inventory-prose-accepted.json';
import { hybridInventoryHeadingEntries, remapHybridInventoryCitations, validateHybridInventoryCoverage } from '@/scripts/reader-hybrid-inventory.mjs';
import exchangeProse from '@/config/exchange-semantics-prose-accepted.json';
import { exchangeSemanticsHeadingEntries, remapExchangeSemanticsCitations, projectExchangeSemanticsRaw, validateExchangeSemanticsCoverage } from '@/scripts/reader-exchange-semantics.mjs';
import processProse from '@/config/process-network-prose-accepted.json';
import processAccepted from '@/config/process-network-accepted.json';
import processHeadings from '@/config/process-network-heading-history.json';
import { processNetworkHeadingEntries, remapProcessNetworkCitations, validateProcessNetworkCoverage } from '@/scripts/reader-process-network.mjs';
import functionalProse from '@/config/functional-reference-prose-accepted.json';
import functionalAccepted from '@/config/functional-reference-accepted.json';
import functionalHeadings from '@/config/functional-reference-heading-history.json';
import { functionalReferenceHeadingEntries, remapFunctionalReferenceCitations, validateFunctionalReferenceCoverage } from '@/scripts/reader-functional-reference.mjs';
import catalog from '@/lib/catalog';
import { source } from '@/lib/source';
import { monographSource } from '@/lib/monograph-source';
import { cache } from 'react';
import baseline from '@/config/citation-baseline.json';
import placements from '@/config/citation-placements.json';
import history from '@/config/citation-history.json';
import edition from '@/config/book-edition.json';
import accepted from '@/config/framework-accepted.json';
import headingHistory from '@/config/framework-heading-history.json';
import cleanerAccepted from '@/config/cleaner-production-accepted.json';
import cleanerHeadingHistory from '@/config/cleaner-production-heading-history.json';
import { cleanerProductionHeadingEntries, remapCleanerProductionCitations, validateCleanerProductionCoverage } from '@/scripts/reader-cleaner-production.mjs';
import { assertCitationHistory } from '@/scripts/reader-citation-history.mjs';
import { bookChapters, createChapterReferenceIndex, orderPages, printUnitAnchor } from '@/scripts/reader-book.mjs';
import { assertCitationBaseline, assertPrintFrontMatter } from '@/scripts/reader-citation-baseline.mjs';
import { currentEditionKeys, validateFrameworkCoverage, assertFrameworkHeadingHistory, remapBookCitations } from '@/scripts/reader-edition.mjs';
import { createLegacyCitationEntries, createCanonicalCitationEntries, type Destination, type LegacyEntry } from '@/scripts/reader-citations.mjs';

assertCitationBaseline(baseline);
assertCitationHistory(history);
assertPrintFrontMatter(placements.frontMatter);
assertFrameworkHeadingHistory(headingHistory);
export type ReaderPage = ReturnType<typeof source.getPages>[number];
export type PrintPage = ReaderPage & { kind: string; sections?: { id: string; title: string }[]; part?: string };
export function getOrderedPages(): ReaderPage[] {
  const available = new Map(source.getPages().map(page=>[page.url.replace(/\/$/,''),page]));
  const ordered = getPresentationUnits('web').map(unit=>{ const page=available.get(unit.key); if (!page) throw new Error(`Missing numbered website page: ${unit.key}`); return page; });
  if (ordered.length !== available.size) throw new Error('Numbered website order omits a canonical source page');
  return ordered;
}
export function getBookPages(): ReaderPage[] { return bookChapters(getOrderedPages()); }
export function getPrintPages(): PrintPage[] {
  const pages = new Map([...source.getPages(), ...monographSource.getPages()].map(page => [page.url, page]));
  currentEditionKeys(edition, [...pages.keys()], baseline, placements);
  return edition.units.map(unit => ({ ...pages.get(unit.source)!, url: unit.key, kind: unit.kind,
    sections: 'sections' in unit ? unit.sections : undefined, part: 'part' in unit ? unit.part : undefined }));
}
export const printFrontMatterCount = placements.frontMatter.length;
const oldPrintSources = [...baseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route), ...placements.frontMatter, ...placements.printAdditions.map(page=>page.route)];
const historical = [...createLegacyCitationEntries(baseline, placements, history.pages),
  ...createCanonicalCitationEntries(history, placements, oldPrintSources),
  ...headingHistory.canonicalPrintedHeadings.map(heading=>({route:heading.route,path:'/print',id:heading.id,
    targets:[{route:heading.route,path:'/print',id:heading.id,kind:'heading' as const}],mode:'retained' as const,
    edition:{sourceCommit:headingHistory.sourceCommit,sourceDate:'2026-11-07'}}))];
const earlierEntries: LegacyEntry[] = remapDataApplicabilityCitations(remapClimateAssemblyCitations(remapClosingSynthesisCitations(remapWallSelectionCitations(remapJointProductionCitations(remapHybridInventoryCitations(remapExchangeSemanticsCitations(remapProcessNetworkCitations(remapFunctionalReferenceCitations(remapCleanerProductionCitations(
  remapBookCitations([...historical, ...cleanerProductionHeadingEntries(cleanerHeadingHistory), ...functionalReferenceHeadingEntries(functionalHeadings), ...processNetworkHeadingEntries(processHeadings), ...exchangeSemanticsHeadingEntries(), ...hybridInventoryHeadingEntries(hybridHeadings), ...jointProductionHeadingEntries(jointHeadings), ...wallSelectionHeadingEntries(wallHeadings), ...closingSynthesisHeadingEntries(closingHistory), ...climateAssemblyHeadingEntries(), ...dataApplicabilityHeadingEntries()], edition, accepted, placements), cleanerAccepted, cleanerHeadingHistory), functionalAccepted, functionalHeadings), processAccepted, processHeadings)), hybridAccepted, hybridHeadings), jointOriginal, jointHeadings, jointProse), wallOriginal, wallHeadings, wallAccepted), closingHistory, closingProse), climateAccepted), dataAccepted);
const toxicityEntries = remapToxicityPathwaysCitations([...earlierEntries, ...toxicityPathwaysHeadingEntries()], toxicityAccepted);
const legacyEntries = remapPmSelectionCitations([...toxicityEntries, ...pmSelectionHeadingEntries()], pmAccepted);
export function getLegacyCitations(route: string, print: boolean) {
  const path = print ? '/print' : route, aliases = new Map<string, LegacyEntry[]>(), notices: LegacyEntry[] = [], scopes = new Map<string, LegacyEntry>();
  for (const entry of legacyEntries) {
    if (entry.path !== path) continue;
    if (entry.mode === 'retained' && entry.scope && entry.route === route) scopes.set(entry.id, entry);
    const target = entry.targets[0];
    if (entry.mode === 'alias' && target.route === route) {
      const list = aliases.get(target.id) ?? []; list.push(entry); aliases.set(target.id, list);
    }
    if (entry.mode === 'notice' && entry.route === route) notices.push(entry);
  }
  return { aliases, notices, scopes };
}
export const getChapterReferenceIndex = cache(async (print = false) => {
  const pages = print ? getPrintPages() : getOrderedPages();
  const rawPages = await Promise.all(pages.map(async(page,index)=>({url:page.url,title:page.data.title,raw:await page.data.getText('raw'),printOrder:index})));
  const cleanerErrors = validateCleanerProductionCoverage(edition, new Map(rawPages.map(page => [page.url, page.raw])), cleanerAccepted, catalog);
  if (cleanerErrors.length) throw new Error(cleanerErrors.join('\n'));
  const rawSources = new Map(await Promise.all([...source.getPages(),...monographSource.getPages()].map(async page=>[page.url,await page.data.getText('raw')] as const)));
  const pmErrors = validatePmSelectionCoverage(edition, rawSources, catalog, pmAccepted, undefined, { projection: 'public', readings, literature });
  if (pmErrors.length) throw new Error(pmErrors.join('\n'));
  const dataErrors = validateDataApplicabilityCoverage(edition, rawSources, catalog, dataAccepted, undefined, 'public');
  if (dataErrors.length) throw new Error(dataErrors.join('\n'));
  const climateErrors = validateClimateAssemblyCoverage(edition, rawSources, catalog, climateAccepted, undefined, 'public');
  if (climateErrors.length) throw new Error(climateErrors.join('\n'));
  const toxicityErrors = validateToxicityPathwaysCoverage(edition, rawSources, catalog, toxicityAccepted, undefined, { projection: 'public', readings, literature });
  if (toxicityErrors.length) throw new Error(toxicityErrors.join('\n'));
  const closingErrors = validateClosingSynthesisCoverage(edition, rawSources, catalog, closingProse, undefined, 'public', undefined, undefined, toxicityAccepted);
  if (closingErrors.length) throw new Error(closingErrors.join('\n'));
  const jointErrors = validateJointProductionCoverage(edition,rawSources,jointOriginal,catalog,jointProse);
  const wallErrors = validateWallSelectionCoverage(edition,rawSources,wallOriginal,catalog,wallAccepted);
  if (wallErrors.length) throw new Error(wallErrors.join('\n'));
  if (jointErrors.length) throw new Error(jointErrors.join("\n"));
  const hybridErrors = validateHybridInventoryCoverage(edition,rawSources,hybridAccepted,catalog,hybridProse);
  if (hybridErrors.length) throw new Error(hybridErrors.join('\n'));
  const processErrors = validateProcessNetworkCoverage(edition,rawSources,processAccepted,catalog,processProse);
  if (processErrors.length) throw new Error(processErrors.join('\n'));
  const functionalErrors = validateFunctionalReferenceCoverage(edition,rawSources,functionalAccepted,catalog,functionalProse);
  if (functionalErrors.length) throw new Error(functionalErrors.join('\n'));
  if (print) {
    const errors = validateFrameworkCoverage(edition,rawSources,accepted);
    if (errors.length) throw new Error(errors.join('\n'));
  }
  const exchangeErrors = validateExchangeSemanticsCoverage(edition, rawSources, undefined, catalog, exchangeProse);
  if (exchangeErrors.length) throw new Error(exchangeErrors.join("\n"));
  return createChapterReferenceIndex(rawPages.map(page => ({ ...page, raw: projectExchangeSemanticsRaw(page.url, page.raw, print) })), {print});
});
export async function getCitationLabel(target: Destination) {
  if ([pmSelectionRoute, pmSelectionAppendix].includes(target.route)) return pmSelectionCitationLabel(target, pmAccepted);
  const print = target.path === '/print';
  if (target.kind === 'note') {
    const index = await getChapterReferenceIndex(print);
    const note = index.get(target.claimId)?.find((location: { unitKey: string })=>location.unitKey===target.route);
    if (!note) throw new Error(`Missing citation note at ${target.route}: ${target.claimId}`);
    return `《${note.title}》注 ${note.number}`;
  }
  const page = print ? getPrintPages().find(page=>page.url===target.route) : source.getPages().find(page=>page.url===target.route);
  if (!page) throw new Error(`Missing citation destination ${target.route}`);
  if (target.kind === 'heading' && target.route === toxicityPathwaysRoute) return toxicityPathwaysCitationLabel(target, toxicityAccepted);
  if (target.kind === 'heading' && [dataApplicabilityKey, ...dataApplicabilityRoutes, climateAssemblyKey, ...climateAssemblyRoutes, climateAssemblyAppendix].includes(target.route)) {
    const section = print ? target.id.slice(printUnitAnchor(target.route).length + 1) : target.id;
    return `《${page.data.title}》·${section}`;
  }
  if (target.route === wallSelectionRoute && target.kind === 'heading') {
    const section = wallSelectionTitles.find(id => target.id === (print ? `${printUnitAnchor(wallSelectionRoute)}-${id}` : id));
    const title = section ?? (target.id === wallSelectionCaseHeadingId(print) ? '计算表与参数' : null);
    if (title) return `《${page.data.title}》·${title}`;
  }
  const sections = print ? (page as PrintPage).sections : undefined;
  const section = sections?.find(section=>target.id.endsWith(`-${section.id}`));
  return `《${page.data.title}》${section ? `·${section.title}` : target.kind==='note-group' ? '注释' : ''}`;
}
