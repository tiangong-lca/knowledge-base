import { currentFlowBoundary, currentServiceConstraints, currentSubstitutionRules, currentLoadShift, currentCircularFootprint, currentLandRecovery, currentAcidEquivalents, currentMineralResources, currentFossilResources, currentPhotochemicalOzone, currentOzoneRadiation, currentToxicityComparison, currentWaterScarcity, currentBiogenicCarbon, currentEutrophicationPathways, currentParticulateComparison, currentPart4Reread, currentWeightingValuation, currentLocalizationComparison, currentSocialComparison, currentCostSustainability, currentPart5Reread, currentDataApplicabilityComparison, currentUncertaintyComparison, currentProductFootprintComparison, currentDataQualityComparison, currentPart6Reread, currentWallServiceComparison, currentInterpretationBags, currentFutureScenarios, currentRevisableJudgment, currentPart7Reread, currentMarketResponseComparison, currentPart3Reread, currentFunctionalReferenceComparison, currentHybridInventoryComparison, currentPart2Reread, currentFrameworkComparison, currentPart1Reread, currentWholeBookReread } from '@/scripts/reader-current-expectations.mjs';
import { currentRetirements, currentRevisions } from '@/scripts/reader-checkpoint.mjs';
import { applyClaimRetirementsToCitations, applyRouteChangesToCitations, isRouteRevised } from '@/scripts/reader-revisions.mjs';
import { flowBoundaryRoutes, flowBoundaryCitationEntries, relabelHistoricalTargets } from '@/scripts/reader-flow-boundary.mjs';
import pedigreeAccepted from '@/config/readable-pedigree-accepted.json';
import { readablePedigreeCitationLabel, readablePedigreeHeadingEntries, readablePedigreeRoute, remapReadablePedigreeCitations, validateReadablePedigreeCoverage } from '@/scripts/reader-readable-pedigree.mjs';
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
import { getHeadingNumbering, getPresentationUnits } from '@/scripts/reader-numbering.mjs';
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
import { cache } from 'react';
import baseline from '@/config/citation-baseline.json';
import hostedHistory from '@/config/readable-book-hosted-history.json';
import { qualifyReadableBookCitations } from '@/scripts/reader-current-citations.mjs';
import { copyeditHistoryEntries, copyeditHistoryPlan } from '@/scripts/reader-copyedit-history.mjs';
import { currentBookPlan, currentCopyedit, isReadableBookReviewPreview } from '@/scripts/reader-current-expectations.mjs';
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
export function logicalPageUrl(url: string): string {
  return url.replace(/^\/(zh|en)(?=\/|$)/, '').replace(/\/$/, '') || '/';
}
export function getOrderedPages(): ReaderPage[] {
  const available = new Map(source.getPages().map(page=>[logicalPageUrl(page.url),page]));
  const ordered = getPresentationUnits('web').map(unit=>{ const page=available.get(unit.key); if (!page) throw new Error(`Missing numbered website page: ${unit.key}`); return page; });
  if (ordered.length !== available.size) throw new Error('Numbered website order omits a canonical source page');
  return ordered;
}
export function getBookPages(): ReaderPage[] { return bookChapters(getOrderedPages()); }
export function getPrintPages(): PrintPage[] {
  const pages = new Map(source.getPages().map(page => [logicalPageUrl(page.url), page]));
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
const pedigreeEntries = remapReadablePedigreeCitations([...toxicityEntries, ...readablePedigreeHeadingEntries()], pedigreeAccepted);
const integratedEntries = remapPmSelectionCitations([...pedigreeEntries, ...pmSelectionHeadingEntries()], pmAccepted);
const legacyEntries: LegacyEntry[] = applyRouteChangesToCitations(applyClaimRetirementsToCitations(relabelHistoricalTargets(flowBoundaryCitationEntries(copyeditHistoryEntries(
  qualifyReadableBookCitations(integratedEntries, hostedHistory, currentBookPlan.migrations), copyeditHistoryPlan(currentCopyedit)), currentFlowBoundary), [...currentServiceConstraints?.routes ?? [], ...currentSubstitutionRules?.routes ?? [], ...currentLoadShift?.routes ?? [], ...currentCircularFootprint?.routes ?? [], ...currentLandRecovery?.routes ?? [], ...currentAcidEquivalents?.routes ?? [], ...currentMineralResources?.routes ?? [], ...currentFossilResources?.routes ?? [], ...currentPhotochemicalOzone?.routes ?? [], ...currentOzoneRadiation?.routes ?? [], ...currentToxicityComparison?.routes ?? [], ...currentWaterScarcity?.routes ?? [], ...currentBiogenicCarbon?.routes ?? [], ...currentEutrophicationPathways?.routes ?? [], ...currentParticulateComparison?.routes ?? [], ...currentPart4Reread?.routes ?? [], ...currentWeightingValuation?.routes ?? [], ...currentLocalizationComparison?.routes ?? [], ...currentSocialComparison?.routes ?? [], ...currentCostSustainability?.routes ?? [], ...currentPart5Reread?.routes ?? [], ...currentDataApplicabilityComparison?.routes ?? [], ...currentUncertaintyComparison?.routes ?? [], ...currentProductFootprintComparison?.routes ?? [], ...currentDataQualityComparison?.routes ?? [], ...currentPart6Reread?.routes ?? [], ...currentWallServiceComparison?.routes ?? [], ...currentInterpretationBags?.routes ?? [], ...currentFutureScenarios?.routes ?? [], ...currentRevisableJudgment?.routes ?? [], ...currentPart7Reread?.routes ?? [], ...currentMarketResponseComparison?.routes ?? [], ...currentPart3Reread?.routes ?? [], ...currentFunctionalReferenceComparison?.routes ?? [], ...currentHybridInventoryComparison?.routes ?? [], ...currentPart2Reread?.routes ?? [], ...currentFrameworkComparison?.routes ?? [], ...currentPart1Reread?.routes ?? [], ...currentWholeBookReread?.routes ?? []]), currentRetirements), currentRevisions);
export function getLegacyCitations(route: string, print: boolean) {
  const logical = logicalPageUrl(route);
  const path = print ? '/print' : logical, aliases = new Map<string, LegacyEntry[]>(), notices: LegacyEntry[] = [], scopes = new Map<string, LegacyEntry>();
  for (const entry of legacyEntries) {
    if (entry.path !== path) continue;
    if (entry.mode === 'retained' && entry.scope && entry.route === logical) scopes.set(entry.id, entry);
    const target = entry.targets[0];
    if (entry.mode === 'alias' && target.route === logical) {
      const list = aliases.get(target.id) ?? []; list.push(entry); aliases.set(target.id, list);
    }
    if (entry.mode === 'notice' && entry.route === logical) notices.push(entry);
  }
  return { aliases, notices, scopes };
}
type ChapterReferenceIndex = ReturnType<typeof createChapterReferenceIndex>;
const productionIndexCache = new Map<boolean, Promise<ChapterReferenceIndex>>();
async function buildChapterReferenceIndex(print = false): Promise<ChapterReferenceIndex> {
  const pages = print ? getPrintPages() : getOrderedPages();
  const rawPages = await Promise.all(pages.map(async(page,index)=>({url:logicalPageUrl(page.url),title:page.data.title,raw:await page.data.getText('raw'),printOrder:index})));
  const index = () => createChapterReferenceIndex(rawPages.map(page => ({
    ...page, raw: projectExchangeSemanticsRaw(page.url, page.raw, print),
  })), { print });
  // Draft output is for reading and visual inspection. Public admission below
  // and the independent export never run under this preview control.
  if (isReadableBookReviewPreview) return index();

  const isRevised = (...routes: string[]) => isRouteRevised(currentRevisions, ...routes);

  if (!isRevised('/docs/book/cleaner-production-and-life-cycle-thinking', '/docs/book/cleaner-production-purpose-and-prospects')) {
    const cleanerErrors = validateCleanerProductionCoverage(edition, new Map(rawPages.map(page => [page.url, page.raw])), cleanerAccepted, catalog);
    if (cleanerErrors.length) throw new Error(cleanerErrors.join('\n'));
  }
  const rawSources = new Map(await Promise.all(source.getPages().map(async page=>[logicalPageUrl(page.url),await page.data.getText('raw')] as const)));
  if (!isRevised('/docs/book/particulate-emissions-and-health')) {
    const pmErrors = validatePmSelectionCoverage(edition, rawSources, catalog, pmAccepted, undefined, { projection: 'public', readings, literature });
    if (pmErrors.length) throw new Error(pmErrors.join('\n'));
  }
  if (!isRevised('/docs/book/database-fitness-and-documentation', '/docs/book/review-support-and-version-boundaries', '/docs/monograph/data-applicability')) {
    const dataErrors = validateDataApplicabilityCoverage(edition, rawSources, catalog, dataAccepted, undefined, 'public');
    if (dataErrors.length) throw new Error(dataErrors.join('\n'));
  }
  if (!isRevised('/docs/book/climate-response-and-metrics', '/docs/book/emission-time-and-assessment', '/docs/monograph/climate-equivalence')) {
    const climateErrors = validateClimateAssemblyCoverage(edition, rawSources, catalog, climateAccepted, undefined, 'public');
    if (climateErrors.length) throw new Error(climateErrors.join('\n'));
  }
  if (!isRevised('/docs/book/usetox-pathways-and-boundaries')) {
    const toxicityErrors = validateToxicityPathwaysCoverage(edition, rawSources, catalog, toxicityAccepted, undefined, { projection: 'public', readings, literature });
    if (toxicityErrors.length) throw new Error(toxicityErrors.join('\n'));
  }
  if (!isRevised('/docs/book/data-quality-and-probability')) {
    const pedigreeErrors = validateReadablePedigreeCoverage(edition, rawSources, catalog, pedigreeAccepted, undefined, 'public', readings);
    if (pedigreeErrors.length) throw new Error(pedigreeErrors.join('\n'));
  }
  if (!isRevised('/docs/book/connecting-objects-references-and-time', '/docs/book/from-connected-results-to-conditional-judgment', '/docs/monograph/revisable-judgment')) {
    const closingErrors = validateClosingSynthesisCoverage(edition, rawSources, catalog, closingProse, undefined, 'public', undefined, undefined, toxicityAccepted, undefined, pedigreeAccepted);
    if (closingErrors.length) throw new Error(closingErrors.join('\n'));
  }
  if (!isRevised('/docs/book/joint-production-and-allocation', '/docs/book/allocation-and-substitution', '/docs/book/allocation-judgment-and-corrections', '/docs/monograph/joint-production', '/docs/book/joint-production')) {
    const jointErrors = validateJointProductionCoverage(edition,rawSources,jointOriginal,catalog,jointProse);
    if (jointErrors.length) throw new Error(jointErrors.join("\n"));
  }
  if (!isRevised('/docs/book/wall-service-to-comparison')) {
    const wallErrors = validateWallSelectionCoverage(edition,rawSources,wallOriginal,catalog,wallAccepted);
    if (wallErrors.length) throw new Error(wallErrors.join('\n'));
  }
  if (!isRevised('/docs/book/inventory-boundary-and-hybrid')) {
    const hybridErrors = validateHybridInventoryCoverage(edition,rawSources,hybridAccepted,catalog,hybridProse);
    if (hybridErrors.length) throw new Error(hybridErrors.join('\n'));
  }
  if (!isRevised('/docs/book/process-and-network')) {
    const processErrors = validateProcessNetworkCoverage(edition,rawSources,processAccepted,catalog,processProse);
    if (processErrors.length) throw new Error(processErrors.join('\n'));
  }
  if (!isRevised('/docs/book/service-and-reference')) {
    const functionalErrors = validateFunctionalReferenceCoverage(edition,rawSources,functionalAccepted,catalog,functionalProse);
    if (functionalErrors.length) throw new Error(functionalErrors.join('\n'));
  }
  if (print && !isRevised('/docs/book/framework-history', '/docs/monograph/framework-responsibilities')) {
    const errors = validateFrameworkCoverage(edition,rawSources,accepted);
    if (errors.length) throw new Error(errors.join('\n'));
  }
  if (!isRevised('/docs/book/exchange-and-elementary-flow')) {
    const exchangeErrors = validateExchangeSemanticsCoverage(edition, rawSources, undefined, catalog, exchangeProse);
    if (exchangeErrors.length) throw new Error(exchangeErrors.join("\n"));
  }
  return index();
}
export const getChapterReferenceIndex = cache((print = false): Promise<ChapterReferenceIndex> => {
  if (process.env.NODE_ENV !== 'production') return buildChapterReferenceIndex(print);
  const cached = productionIndexCache.get(print);
  if (cached) return cached;
  const pending = buildChapterReferenceIndex(print).catch(error => {
    productionIndexCache.delete(print);
    throw error;
  });
  productionIndexCache.set(print, pending);
  return pending;
});
export async function getCitationLabel(target: Destination) {
  if (target.label && !isRouteRevised(currentRevisions, target.route)) return target.label;
  const print = target.path === '/print';
  if (target.kind === 'note') {
    const index = await getChapterReferenceIndex(print);
    const note = index.get(target.claimId)?.find((location: { unitKey: string })=>location.unitKey===target.route);
    if (!note) throw new Error(`Missing citation note at ${target.route}: ${target.claimId}`);
    return `《${note.title}》注 ${note.number}`;
  }
  const page = print ? getPrintPages().find(page=>logicalPageUrl(page.url)===target.route) : source.getPages().find(page=>logicalPageUrl(page.url)===target.route);
  if (!page) throw new Error(`Missing citation destination ${target.route}`);
  if (currentBookPlan.migrations.length || currentFlowBoundary && flowBoundaryRoutes.includes(target.route) || currentServiceConstraints?.routes.includes(target.route) || currentSubstitutionRules?.routes.includes(target.route) || currentLoadShift?.routes.includes(target.route) || currentCircularFootprint?.routes.includes(target.route) || currentLandRecovery?.routes.includes(target.route) || currentAcidEquivalents?.routes.includes(target.route) || currentMineralResources?.routes.includes(target.route) || currentFossilResources?.routes.includes(target.route) || currentPhotochemicalOzone?.routes.includes(target.route) || currentOzoneRadiation?.routes.includes(target.route) || currentToxicityComparison?.routes.includes(target.route) || currentWaterScarcity?.routes.includes(target.route) || currentBiogenicCarbon?.routes.includes(target.route) || currentEutrophicationPathways?.routes.includes(target.route) || currentParticulateComparison?.routes.includes(target.route) || currentPart4Reread?.routes.includes(target.route) || currentWeightingValuation?.routes.includes(target.route) || currentLocalizationComparison?.routes.includes(target.route) || currentSocialComparison?.routes.includes(target.route) || currentCostSustainability?.routes.includes(target.route) || currentPart5Reread?.routes.includes(target.route) || currentDataApplicabilityComparison?.routes.includes(target.route) || currentUncertaintyComparison?.routes.includes(target.route) || currentProductFootprintComparison?.routes.includes(target.route) || currentDataQualityComparison?.routes.includes(target.route) || currentPart6Reread?.routes.includes(target.route) || currentWallServiceComparison?.routes.includes(target.route) || currentInterpretationBags?.routes.includes(target.route) || currentFutureScenarios?.routes.includes(target.route) || currentRevisableJudgment?.routes.includes(target.route) || currentPart7Reread?.routes.includes(target.route) || currentMarketResponseComparison?.routes.includes(target.route)) {
    if (target.kind === 'heading') {
      const prefix = `${printUnitAnchor(target.route)}-`;
      const key = print && target.id.startsWith(prefix) ? target.id.slice(prefix.length) : target.id;
      const heading = getHeadingNumbering(print ? 'book' : 'web', target.route, key)?.title
        ?? (key === 'wall-case-reference' ? '计算表与参数'
          : key === 'joint-batch-case-heading' ? '同一批共产品：份额、路线与比较残余' : null);
      return `《${page.data.title}》${heading ? `·${heading}` : ''}`;
    }
    return `《${page.data.title}》${target.kind === 'note-group' ? '注释' : ''}`;
  }

  if ([pmSelectionRoute, pmSelectionAppendix].includes(target.route)) return pmSelectionCitationLabel(target, pmAccepted);
  if (target.kind === 'heading' && target.route === readablePedigreeRoute) return readablePedigreeCitationLabel(target, pedigreeAccepted);
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
