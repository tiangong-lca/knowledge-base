import { showEditorialHistoryInProse } from '@/scripts/reader-editorial-mode.mjs';
import { part7RereadCorrections, part7RereadHistoryControls, part7RereadOrdinaryId, part7RereadSource } from '@/scripts/reader-part7-reread.mjs';
import { functionalReferenceComparisonHistoryControls, functionalReferenceComparisonOrdinaryId, functionalReferenceComparisonSource } from '@/scripts/reader-functional-reference-comparison.mjs';
import { hybridInventoryComparisonHistoryControls, hybridInventoryComparisonOrdinaryId, hybridInventoryComparisonRoute, hybridInventoryComparisonSource } from '@/scripts/reader-hybrid-inventory-comparison.mjs';
import { part2RereadCorrections, part2RereadHistoryControls, part2RereadSource } from '@/scripts/reader-part2-reread.mjs';
import { frameworkComparisonHistoryControls, frameworkComparisonOrdinaryId, frameworkComparisonSource } from '@/scripts/reader-framework-comparison.mjs';
import { part3RereadCorrections, part3RereadHistoryControls, part3RereadOrdinaryId, part3RereadSource } from '@/scripts/reader-part3-reread.mjs';
import { marketResponseComparisonHistoryControls, marketResponseComparisonOrdinaryId, marketResponseComparisonSource } from '@/scripts/reader-market-response-comparison.mjs';
import { revisableJudgmentHistoryControls, revisableJudgmentOrdinaryId, revisableJudgmentRoutes, revisableJudgmentSource } from '@/scripts/reader-revisable-judgment.mjs';
import { futureScenariosHistoryControls, futureScenariosOrdinaryId, futureScenariosRoute, futureScenariosSource } from '@/scripts/reader-future-scenarios.mjs';
import { interpretationBagsHistoryControls, interpretationBagsOrdinaryId, interpretationBagsRoute, interpretationBagsSource } from '@/scripts/reader-interpretation-bags.mjs';
import { wallServiceComparisonHistoryControls, wallServiceComparisonOrdinaryId, wallServiceComparisonRoute, wallServiceComparisonSource } from '@/scripts/reader-wall-service-comparison.mjs';
import { part6RereadCorrections, part6RereadHistoryControls, part6RereadOrdinaryId, part6RereadSource } from '@/scripts/reader-part6-reread.mjs';
import { dataQualityComparisonHistoryControls, dataQualityComparisonOrdinaryId, dataQualityComparisonRoute, dataQualityComparisonSource } from '@/scripts/reader-data-quality-comparison.mjs';
import { productFootprintComparisonHistoryControls, productFootprintComparisonOrdinaryId, productFootprintComparisonRoute, productFootprintComparisonSource } from '@/scripts/reader-product-footprint-comparison.mjs';
import { uncertaintyComparisonCorrections, uncertaintyComparisonHistoryControls, uncertaintyComparisonOrdinaryId, uncertaintyComparisonRoute, uncertaintyComparisonSource } from '@/scripts/reader-uncertainty-comparison.mjs';
import { dataApplicabilityComparisonCorrections, dataApplicabilityComparisonHistoryControls, dataApplicabilityComparisonOrdinaryId, dataApplicabilityComparisonRoutes, dataApplicabilityComparisonSource } from '@/scripts/reader-data-applicability-comparison.mjs';
import { part5RereadCorrections, part5RereadHistoryControls, part5RereadOrdinaryId, part5RereadSource } from '@/scripts/reader-part5-reread.mjs';
import { costSustainabilityCorrections, costSustainabilityHistoryControls, costSustainabilityOrdinaryId, costSustainabilityRoute, costSustainabilitySource } from '@/scripts/reader-cost-sustainability.mjs';
import { socialComparisonCorrections, socialComparisonHistoryControls, socialComparisonOrdinaryId, socialComparisonRoute, socialComparisonSource } from '@/scripts/reader-social-comparison.mjs';
import { localizationComparisonCorrections, localizationComparisonHistoryControls, localizationComparisonOrdinaryId, localizationComparisonRoute, localizationComparisonSource } from '@/scripts/reader-localization-comparison.mjs';
import { weightingValuationCorrections, weightingValuationHistoryControls, weightingValuationOrdinaryId, weightingValuationSource } from '@/scripts/reader-weighting-valuation.mjs';
import { part4RereadCorrections, part4RereadHistoryControls, part4RereadOrdinaryId, part4RereadSource } from '@/scripts/reader-part4-reread.mjs';
import { particulateComparisonHistoryControls, particulateComparisonOrdinaryId, particulateComparisonSource } from '@/scripts/reader-particulate-comparison.mjs';
import { eutrophicationPathwaysHistoryControls, eutrophicationPathwaysSource } from '@/scripts/reader-eutrophication-pathways.mjs';
import { biogenicCarbonHistoryControls, biogenicCarbonOrdinaryId, biogenicCarbonSource } from '@/scripts/reader-biogenic-carbon.mjs';
import { waterScarcityHistoryControls, waterScarcityOrdinaryId, waterScarcitySource } from '@/scripts/reader-water-scarcity.mjs';
import { toxicityComparisonHistoryControls, toxicityComparisonOrdinaryId, toxicityComparisonSource } from '@/scripts/reader-toxicity-comparison.mjs';
import { ozoneRadiationChapter, ozoneRadiationCorrections, ozoneRadiationHistoryControls, ozoneRadiationSource } from '@/scripts/reader-ozone-radiation.mjs';
import { photochemicalOzoneHistoryControls, photochemicalOzoneSource } from '@/scripts/reader-photochemical-ozone.mjs';
import { fossilResourcesChapter, fossilResourcesCorrection, fossilResourcesHistoryControls, fossilResourcesSource } from '@/scripts/reader-fossil-resources.mjs';
import { mineralResourcesChapter, mineralResourcesCorrection, mineralResourcesHistoryControls, mineralResourcesSource } from '@/scripts/reader-mineral-resources.mjs';
import { acidEquivalentsHistoryControls, acidEquivalentsOrdinaryId, acidEquivalentsSource } from '@/scripts/reader-acid-equivalents.mjs';
import { landRecoveryHistoryControls, landRecoveryOrdinaryId, landRecoverySource } from '@/scripts/reader-land-recovery.mjs';
import { circularFootprintHistoryControls, circularFootprintOrdinaryId, circularFootprintSource } from '@/scripts/reader-circular-footprint.mjs';
import { loadShiftHistoryControls, loadShiftOrdinaryId, loadShiftSource } from '@/scripts/reader-load-shift.mjs';
import { substitutionRulesHistoryControls, substitutionRulesOrdinaryId, substitutionRulesSource } from '@/scripts/reader-substitution-rules.mjs';
import { currentFlowBoundary, currentServiceConstraints, currentSubstitutionRules, currentLoadShift, currentCircularFootprint, currentLandRecovery, currentAcidEquivalents, currentMineralResources, currentFossilResources, currentPhotochemicalOzone, currentOzoneRadiation, currentToxicityComparison, currentWaterScarcity, currentBiogenicCarbon, currentEutrophicationPathways, currentParticulateComparison, currentPart4Reread, currentWeightingValuation, currentLocalizationComparison, currentSocialComparison, currentCostSustainability, currentPart5Reread, currentDataApplicabilityComparison, currentUncertaintyComparison, currentProductFootprintComparison, currentDataQualityComparison, currentPart6Reread, currentWallServiceComparison, currentInterpretationBags, currentFutureScenarios, currentRevisableJudgment, currentPart7Reread, currentMarketResponseComparison, currentPart3Reread, currentFunctionalReferenceComparison, currentHybridInventoryComparison, currentPart2Reread, currentFrameworkComparison } from '@/scripts/reader-current-expectations.mjs';
import { flowBoundaryHistoryControls, flowBoundaryHistoryTargets, flowBoundaryOrdinaryTargets, flowBoundaryOrdinaryId } from '@/scripts/reader-flow-boundary.mjs';
import { serviceConstraintsHistoryControls, serviceConstraintsOrdinaryId, serviceConstraintsSource } from '@/scripts/reader-service-constraints.mjs';
import { CopyeditHistoricalTitle } from '@/components/copyedit-history';
import { NumberedTitle } from '@/components/numbered-heading';
import { assertNumberingToc, currentPrintReadingHref, printReadingEntryAnchor, getContinuationLink, getHeadingNumbering, getUnitHeadingPlan } from '@/scripts/reader-numbering.mjs';
import { TeachingCase } from '@/components/teaching-case';
import { projectExchangeSemanticsRaw, historyPrintCrossReference, historyPrintDestination } from '@/scripts/reader-exchange-semantics.mjs';
import Link from 'next/link';
import { createElement, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';
import catalog from '@/lib/catalog';
import { getChapterReferenceIndex, getCitationLabel, getLegacyCitations, type ReaderPage } from '@/lib/reader-book';
import { getMDXComponents } from '@/mdx-components';
import { ClaimAnnotation } from '@/components/evidence';
import { chapterAnchorPrefix, createChapterAnnotationPlan, createChapterNotePlan, printUnitAnchor, splitReferenceTail } from '@/scripts/reader-book.mjs';
import { frameworkBookHref } from '@/scripts/reader-edition.mjs';
import { citationHref, citationSourceHref, type LegacyEntry } from '@/scripts/reader-citations.mjs';

function CitationVersion({ edition }: { edition: LegacyEntry['edition'] }) {
  return <>此链接按 <time dateTime={edition.sourceDate}>{edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href={citationSourceHref(edition.sourceCommit)}>查看这一版本的源文件</a></>;
}

/** Keep the fragment itself in the HTML so the notice works without scripting. */
export function LegacyCitationAliases({ ids, target }: { ids?: LegacyEntry[]; target: string }) {
  return ids?.map(entry => <span key={entry.id} id={entry.id} className="legacy-citation-target" data-legacy-for={target} tabIndex={-1}>
    <span className="legacy-citation-context"><CitationVersion edition={entry.edition} /></span>
  </span>);
}

const histories = [
  { controls: flowBoundaryHistoryControls(currentFlowBoundary), edition: currentFlowBoundary?.source, attribute: 'flow-boundary' },
  { controls: serviceConstraintsHistoryControls(currentServiceConstraints), edition: serviceConstraintsSource, attribute: 'service-constraints' },
  { controls: substitutionRulesHistoryControls(currentSubstitutionRules), edition: substitutionRulesSource, attribute: 'substitution-rules' },
  { controls: loadShiftHistoryControls(currentLoadShift), edition: loadShiftSource, attribute: 'load-shift' },
  { controls: circularFootprintHistoryControls(currentCircularFootprint), edition: circularFootprintSource, attribute: 'circular-footprint' },
  { controls: landRecoveryHistoryControls(currentLandRecovery), edition: landRecoverySource, attribute: 'land-recovery' },
  { controls: acidEquivalentsHistoryControls(currentAcidEquivalents), edition: acidEquivalentsSource, attribute: 'acid-equivalents' },
  { controls: mineralResourcesHistoryControls(currentMineralResources), edition: mineralResourcesSource, attribute: 'mineral-resources' },
  { controls: fossilResourcesHistoryControls(currentFossilResources), edition: fossilResourcesSource, attribute: 'fossil-resources' },
  { controls: photochemicalOzoneHistoryControls(currentPhotochemicalOzone), edition: photochemicalOzoneSource, attribute: 'photochemical-ozone' },
  { controls: ozoneRadiationHistoryControls(currentOzoneRadiation), edition: ozoneRadiationSource, attribute: 'ozone-radiation' },
  { controls: toxicityComparisonHistoryControls(currentToxicityComparison), edition: toxicityComparisonSource, attribute: 'toxicity-comparison' },
  { controls: waterScarcityHistoryControls(currentWaterScarcity), edition: waterScarcitySource, attribute: 'water-scarcity' },
  { controls: biogenicCarbonHistoryControls(currentBiogenicCarbon), edition: biogenicCarbonSource, attribute: 'biogenic-carbon' },
  { controls: eutrophicationPathwaysHistoryControls(currentEutrophicationPathways), edition: eutrophicationPathwaysSource, attribute: 'eutrophication-pathways' },
  { controls: particulateComparisonHistoryControls(currentParticulateComparison), edition: particulateComparisonSource, attribute: 'particulate-comparison' },
  { controls: part4RereadHistoryControls(currentPart4Reread), edition: part4RereadSource, attribute: 'part4-reread' },
  { controls: weightingValuationHistoryControls(currentWeightingValuation), edition: weightingValuationSource, attribute: 'weighting-valuation' },
  { controls: localizationComparisonHistoryControls(currentLocalizationComparison), edition: localizationComparisonSource, attribute: 'localization-comparison' },
  { controls: socialComparisonHistoryControls(currentSocialComparison), edition: socialComparisonSource, attribute: 'social-comparison' },
  { controls: costSustainabilityHistoryControls(currentCostSustainability), edition: costSustainabilitySource, attribute: 'cost-sustainability' },
  { controls: part5RereadHistoryControls(currentPart5Reread), edition: part5RereadSource, attribute: 'part5-reread' },
  { controls: dataApplicabilityComparisonHistoryControls(currentDataApplicabilityComparison), edition: dataApplicabilityComparisonSource, attribute: 'data-applicability-comparison' },
  { controls: uncertaintyComparisonHistoryControls(currentUncertaintyComparison), edition: uncertaintyComparisonSource, attribute: 'uncertainty-comparison' },
  { controls: productFootprintComparisonHistoryControls(currentProductFootprintComparison), edition: productFootprintComparisonSource, attribute: 'product-footprint-comparison' },
  { controls: dataQualityComparisonHistoryControls(currentDataQualityComparison), edition: dataQualityComparisonSource, attribute: 'data-quality-comparison' },
  { controls: part6RereadHistoryControls(currentPart6Reread), edition: part6RereadSource, attribute: 'part6-reread' },
  { controls: wallServiceComparisonHistoryControls(currentWallServiceComparison), edition: wallServiceComparisonSource, attribute: 'wall-service-comparison' },
  { controls: interpretationBagsHistoryControls(currentInterpretationBags), edition: interpretationBagsSource, attribute: 'interpretation-bags' },
  { controls: futureScenariosHistoryControls(currentFutureScenarios), edition: futureScenariosSource, attribute: 'future-scenarios' },
  { controls: revisableJudgmentHistoryControls(currentRevisableJudgment), edition: revisableJudgmentSource, attribute: 'revisable-judgment' },
  { controls: part7RereadHistoryControls(currentPart7Reread), edition: part7RereadSource, attribute: 'part7-reread' },
  { controls: marketResponseComparisonHistoryControls(currentMarketResponseComparison), edition: marketResponseComparisonSource, attribute: 'market-response-comparison' },
  { controls: part3RereadHistoryControls(currentPart3Reread), edition: part3RereadSource, attribute: 'part3-reread' },
  { controls: functionalReferenceComparisonHistoryControls(currentFunctionalReferenceComparison), edition: functionalReferenceComparisonSource, attribute: 'functional-reference-comparison' },
  { controls: hybridInventoryComparisonHistoryControls(currentHybridInventoryComparison), edition: hybridInventoryComparisonSource, attribute: 'hybrid-inventory-comparison' },
  { controls: part2RereadHistoryControls(currentPart2Reread), edition: part2RereadSource, attribute: 'part2-reread' },
  { controls: frameworkComparisonHistoryControls(currentFrameworkComparison), edition: frameworkComparisonSource, attribute: 'framework-comparison' },
];

function currentReaderOrdinaryId(route: string, print: boolean, index: number) {
  return (currentFlowBoundary && flowBoundaryOrdinaryId(route, print, index))
    || serviceConstraintsOrdinaryId(currentServiceConstraints, route, print, index)
    || substitutionRulesOrdinaryId(currentSubstitutionRules, route, print, index)
    || loadShiftOrdinaryId(currentLoadShift, route, print, index)
    || circularFootprintOrdinaryId(currentCircularFootprint, route, print, index)
    || landRecoveryOrdinaryId(currentLandRecovery, route, print, index)
    || acidEquivalentsOrdinaryId(currentAcidEquivalents, route, print, index)
    || toxicityComparisonOrdinaryId(currentToxicityComparison, route, print, index)
    || waterScarcityOrdinaryId(currentWaterScarcity, route, print, index)
    || biogenicCarbonOrdinaryId(currentBiogenicCarbon, route, print, index)
    || particulateComparisonOrdinaryId(currentParticulateComparison, route, print, index)
    || part4RereadOrdinaryId(currentPart4Reread, route, print, index)
    || weightingValuationOrdinaryId(currentWeightingValuation, route, print, index)
    || localizationComparisonOrdinaryId(currentLocalizationComparison, route, print, index)
    || socialComparisonOrdinaryId(currentSocialComparison, route, print, index)
    || costSustainabilityOrdinaryId(currentCostSustainability, route, print, index)
    || dataApplicabilityComparisonOrdinaryId(currentDataApplicabilityComparison, route, print, index)
    || uncertaintyComparisonOrdinaryId(currentUncertaintyComparison, route, print, index)
    || productFootprintComparisonOrdinaryId(currentProductFootprintComparison, route, print, index)
    || dataQualityComparisonOrdinaryId(currentDataQualityComparison, route, print, index)
    || part6RereadOrdinaryId(currentPart6Reread, route, print, index)
    || wallServiceComparisonOrdinaryId(currentWallServiceComparison, route, print, index)
    || interpretationBagsOrdinaryId(currentInterpretationBags, route, print, index)
    || part7RereadOrdinaryId(currentPart7Reread, route, print, index)
    || futureScenariosOrdinaryId(currentFutureScenarios, route, print, index)
    || revisableJudgmentOrdinaryId(currentRevisableJudgment, route, print, index)
    || marketResponseComparisonOrdinaryId(currentMarketResponseComparison, route, print, index)
    || part3RereadOrdinaryId(currentPart3Reread, route, print, index)
    || functionalReferenceComparisonOrdinaryId(currentFunctionalReferenceComparison, route, print, index)
    || hybridInventoryComparisonOrdinaryId(currentHybridInventoryComparison, route, print, index)
    || frameworkComparisonOrdinaryId(currentFrameworkComparison, route, print, index);
}

// Leave versioned native fragments below the screen's sticky site header.
const scientificHistoryScroll = { scrollMarginTop: '7rem' };

export function currentReaderOrdinaryAttributes(route: string, print: boolean, index: number) {
  const id = currentReaderOrdinaryId(route, print, index);
  return id && (id === loadShiftOrdinaryId(currentLoadShift, route, print, index)
      || id === circularFootprintOrdinaryId(currentCircularFootprint, route, print, index)
      || id === landRecoveryOrdinaryId(currentLandRecovery, route, print, index)
      || id === acidEquivalentsOrdinaryId(currentAcidEquivalents, route, print, index)
      || id === toxicityComparisonOrdinaryId(currentToxicityComparison, route, print, index)
      || id === waterScarcityOrdinaryId(currentWaterScarcity, route, print, index)
      || id === biogenicCarbonOrdinaryId(currentBiogenicCarbon, route, print, index)
      || id === particulateComparisonOrdinaryId(currentParticulateComparison, route, print, index)
      || id === part4RereadOrdinaryId(currentPart4Reread, route, print, index)
      || id === weightingValuationOrdinaryId(currentWeightingValuation, route, print, index)
      || id === localizationComparisonOrdinaryId(currentLocalizationComparison, route, print, index)
      || id === socialComparisonOrdinaryId(currentSocialComparison, route, print, index)
      || id === costSustainabilityOrdinaryId(currentCostSustainability, route, print, index)
      || id === dataApplicabilityComparisonOrdinaryId(currentDataApplicabilityComparison, route, print, index)
      || id === uncertaintyComparisonOrdinaryId(currentUncertaintyComparison, route, print, index)
      || id === productFootprintComparisonOrdinaryId(currentProductFootprintComparison, route, print, index)
      || id === dataQualityComparisonOrdinaryId(currentDataQualityComparison, route, print, index)
      || id === part6RereadOrdinaryId(currentPart6Reread, route, print, index)
      || id === wallServiceComparisonOrdinaryId(currentWallServiceComparison, route, print, index)
      || id === interpretationBagsOrdinaryId(currentInterpretationBags, route, print, index)
      || id === part7RereadOrdinaryId(currentPart7Reread, route, print, index)
      || id === futureScenariosOrdinaryId(currentFutureScenarios, route, print, index)
      || id === revisableJudgmentOrdinaryId(currentRevisableJudgment, route, print, index)
      || id === marketResponseComparisonOrdinaryId(currentMarketResponseComparison, route, print, index)
      || id === part3RereadOrdinaryId(currentPart3Reread, route, print, index)
      || id === functionalReferenceComparisonOrdinaryId(currentFunctionalReferenceComparison, route, print, index)
      || id === hybridInventoryComparisonOrdinaryId(currentHybridInventoryComparison, route, print, index)
      || id === frameworkComparisonOrdinaryId(currentFrameworkComparison, route, print, index))
    ? { id, style: scientificHistoryScroll }
    : { id };
}

async function HistoricalRange({ path, id, history }: { path: string; id: string; history: typeof histories[number] }) {
  const { controls, edition, attribute } = history;
  const control = controls.get(`${path}#${id}`);
  if (!control || !edition) return null;
  const { row, addresses } = control;
  const notes = await Promise.all(flowBoundaryHistoryTargets(row).map(async (target: LegacyEntry['targets'][number]) => ({
    href: citationHref(target, path), label: await getCitationLabel(target),
  })));
  const ordinary = flowBoundaryOrdinaryTargets(row);
  return <details className="legacy-citation-context" {...{
    [`data-${attribute}-history`]: id,
    [`data-${attribute}-origins`]: addresses.map((address: string) => address.slice(path.length + 1)).join(' '),
  }}>
    <summary><time dateTime={edition.date}>{edition.date}</time> 版「{row.previous.title ?? id.replace(/^print-unit-[a-f0-9]+-/, '')}」的引用范围</summary>
    <p><a href={citationSourceHref(edition.commit)} {...{ [`data-${attribute}-source`]: '' }}>查看该版源文件</a></p>
    {ordinary.length > 0 && <ul>{ordinary.map((target: { path: string; id: string; label: string }) => {
      const href = `${target.path === path ? '' : `${target.path}/`}#${encodeURIComponent(target.id)}`;
      return <li key={target.label}><a href={href} {...{ [`data-${attribute}-ordinary`]: '' }}>{target.label}</a></li>;
    })}</ul>}
    {notes.length > 0 && <ul>{notes.map(note => <li key={note.href}><a href={note.href} {...{ [`data-${attribute}-note`]: '' }}>{note.label}</a></li>)}</ul>}
  </details>;
}

function historyAt(path: string, id: string) {
  if (!showEditorialHistoryInProse()) return null;
  return histories.filter(history => history.controls.has(`${path}#${id}`))
    .map(history => <HistoricalRange key={history.attribute} path={path} id={id} history={history} />);
}

/** One renderer for a website page and its corresponding continuous print unit. */
export async function ChapterContent({ page, print = false }: { page: ReaderPage; print?: boolean }) {
  const view = print ? 'book' : 'web';
  assertNumberingToc(view, page.url, page.data.toc);
  const prefix = print ? printUnitAnchor(page.url) : chapterAnchorPrefix(page.url);
  const plan = createChapterNotePlan(projectExchangeSemanticsRaw(page.url, await page.data.getText('raw'), print), prefix);
  const legacy = getLegacyCitations(page.url, print);
  const historyPath = print ? '/print' : page.url.replace(/\/$/, '');
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  // Check even before rendering: an authored reference must never silently lose
  // its canonical paragraph or note because a record was removed/withdrawn.
  for (const note of plan.notes) if (claims.get(note.id)?.status !== 'reviewed') throw new Error(`Unpublished or unknown chapter claim: ${note.id}`);
  const annotations = createChapterAnnotationPlan(plan, catalog.claims, await getChapterReferenceIndex(print), { print });

  function Paragraph({ id }: { id: string }) {
    const crossReference = historyPrintCrossReference(page.url, id, print);
    if (crossReference) return <p data-reader-partial-claim={id}><a href={`#${historyPrintDestination(crossReference).id}`}>{crossReference.text}</a></p>;
    const note = plan.byClaimId.get(id), claim = claims.get(id);
    if (!note || !claim || claim.status !== 'reviewed') throw new Error(`Chapter claim is absent from its note map: ${id}`);
    const text = splitReferenceTail(claim.text);
    return <p>{text.body}<span className="prose-reference-tail">{text.tail}<sup className="prose-references"><Link href={`#${note.anchor}`} role="doc-noteref" aria-label={`注 ${note.number}`} data-reader-reference={id}>[{note.number}]</Link></sup></span></p>;
  }
  function ChapterProse({ ids }: { ids: string }) {
    return <div className="scholarly-prose">{ids.trim().split(/\s+/).filter(Boolean).map((id, index) => <Paragraph key={`${id}-${index}`} id={id} />)}</div>;
  }
  function ReaderSection({ id: section }: { id: string }) {
    const id = print ? `${prefix}-${section}` : section;
    return <><LegacyCitationAliases ids={legacy.aliases.get(id)} target={id} />
      <span id={id} data-reader-section={id} className="reader-section-target" /><RetainedScope entry={legacy.scopes.get(id)} />{historyAt(historyPath, id)}</>;
  }
  function ChapterTeachingCase(props: Parameters<typeof TeachingCase>[0]) { return <TeachingCase {...props} print={print} numbering={getUnitHeadingPlan(view, page.url).filter(heading=>heading.type==='case')} />; }
  const MDX = page.data.body;
  function ReaderLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const continuation = typeof props.children==='string' ? getContinuationLink(view, page.url, props.href, props.children) : null;
    return <a {...props} href={continuation?.href ?? (print ? frameworkBookHref(props.href, page.url) : currentPrintReadingHref(props.href))}>{continuation?.label ?? props.children}</a>;
  }
  const defaults = getMDXComponents();
  let ordinaryIndex = 0;
  function ReaderParagraph(props: HTMLAttributes<HTMLParagraphElement>) {
    const target = currentReaderOrdinaryAttributes(page.url.replace(/\/$/, ''), print, ++ordinaryIndex);
    return createElement(defaults.p ?? 'p', { ...props, id: target.id,
      ...(target.style && { style: { ...props.style, ...target.style } }) });
  }
  const cleanRoute = page.url.replace(/\/$/, '');
  const tableId = loadShiftOrdinaryId(currentLoadShift, cleanRoute, print, 'table')
    || weightingValuationOrdinaryId(currentWeightingValuation, cleanRoute, print, 'table')
    || dataQualityComparisonOrdinaryId(currentDataQualityComparison, cleanRoute, print, 'table')
    || wallServiceComparisonOrdinaryId(currentWallServiceComparison, cleanRoute, print, 'table')
    || interpretationBagsOrdinaryId(currentInterpretationBags, cleanRoute, print, 'table')
    || futureScenariosOrdinaryId(currentFutureScenarios, cleanRoute, print, 'table')
    || revisableJudgmentOrdinaryId(currentRevisableJudgment, cleanRoute, print, 'table')
    || marketResponseComparisonOrdinaryId(currentMarketResponseComparison, cleanRoute, print, 'table')
    || functionalReferenceComparisonOrdinaryId(currentFunctionalReferenceComparison, cleanRoute, print, 'table')
    || hybridInventoryComparisonOrdinaryId(currentHybridInventoryComparison, cleanRoute, print, 'table')
    || frameworkComparisonOrdinaryId(currentFrameworkComparison, cleanRoute, print, 'table');
  const hasHybridInventoryTables = Boolean(currentHybridInventoryComparison && cleanRoute === hybridInventoryComparisonRoute);
  const hasLocalizationTables = Boolean(currentLocalizationComparison && cleanRoute === localizationComparisonRoute);
  const hasSocialTables = Boolean(currentSocialComparison && cleanRoute === socialComparisonRoute);
  const hasCostTables = Boolean(currentCostSustainability && cleanRoute === costSustainabilityRoute);
  const hasDataApplicabilityTables = Boolean(currentDataApplicabilityComparison && dataApplicabilityComparisonRoutes.includes(cleanRoute));
  const hasUncertaintyTables = Boolean(currentUncertaintyComparison && cleanRoute === uncertaintyComparisonRoute);
  const hasProductFootprintTables = Boolean(currentProductFootprintComparison && cleanRoute === productFootprintComparisonRoute);
  const hasDataQualityTables = Boolean(currentDataQualityComparison && cleanRoute === dataQualityComparisonRoute);
  const hasWallServiceTables = Boolean(currentWallServiceComparison && cleanRoute === wallServiceComparisonRoute);
  const hasInterpretationBagsTables = Boolean(currentInterpretationBags && cleanRoute === interpretationBagsRoute);
  const hasFutureScenariosTables = Boolean(currentFutureScenarios && cleanRoute === futureScenariosRoute);
  const hasRevisableJudgmentTables = Boolean(currentRevisableJudgment && revisableJudgmentRoutes.includes(cleanRoute));
  let tableCount = 0;
  function ReaderTable(props: HTMLAttributes<HTMLTableElement>) {
    if (Object.hasOwn(props, 'id')) {
      throw new Error(`Explicit table id is not allowed on ${page.url}`);
    }
    const index = ++tableCount;
    if (index === 1 && tableId) {
      return createElement(defaults.table ?? 'table', { ...props, id: tableId, style: { ...props.style, ...scientificHistoryScroll } });
    }
    const part5TableId = part5RereadOrdinaryId(currentPart5Reread, cleanRoute, print, `table-${index}`);
    if (part5TableId) {
      return createElement(defaults.table ?? 'table', { ...props, id: part5TableId, style: { ...props.style, ...scientificHistoryScroll } });
    }
    const part6TableId = part6RereadOrdinaryId(currentPart6Reread, cleanRoute, print, `table-${index}`);
    if (part6TableId) {
      return createElement(defaults.table ?? 'table', { ...props, id: part6TableId, style: { ...props.style, ...scientificHistoryScroll } });
    }
    const part7TableId = part7RereadOrdinaryId(currentPart7Reread, cleanRoute, print, `table-${index}`);
    if (part7TableId) {
      return createElement(defaults.table ?? 'table', { ...props, id: part7TableId, style: { ...props.style, ...scientificHistoryScroll } });
    }
    if (index === 2 && cleanRoute === '/docs/book/lime-preferences-and-damage-weights') {
      return createElement(defaults.table ?? 'table', props);
    }
    if ((index === 1 || index === 2) && (hasLocalizationTables || hasSocialTables || hasCostTables || hasUncertaintyTables || hasProductFootprintTables || hasDataQualityTables || hasWallServiceTables || hasInterpretationBagsTables || hasFutureScenariosTables || hasRevisableJudgmentTables || hasHybridInventoryTables)) {
      return createElement(defaults.table ?? 'table', props);
    }
    if (hasDataApplicabilityTables && (index === 1 || (index === 2 && cleanRoute === 'book-data-applicability'))) {
      return createElement(defaults.table ?? 'table', props);
    }
    throw new Error(`Invalid, unauthorized or duplicate ReaderTable on ${page.url}`);
  }
  const figureId = biogenicCarbonOrdinaryId(currentBiogenicCarbon, page.url.replace(/\/$/, ''), print, 'figure');
  let figureCount = 0;
  function ReaderFigure(props: HTMLAttributes<HTMLElement>) {
    if (!figureId || ++figureCount > 1 || Object.hasOwn(props, 'id')) {
      throw new Error(`Invalid, unauthorized or duplicate ReaderFigure on ${page.url}`);
    }
    return createElement(defaults.figure ?? 'figure', {
      ...props,
      id: figureId,
      style: { ...props.style, ...scientificHistoryScroll },
    });
  }
  const headings = Object.fromEntries(([1, 2, 3, 4, 5, 6] as const).map(level => {
    const name = `h${level}` as const;
    return [name, (props: HTMLAttributes<HTMLHeadingElement>) => {
      const id = print && props.id ? `${prefix}-${props.id}` : props.id;
      const numbered = props.id ? getHeadingNumbering(view, page.url, props.id) : null;
      if (!numbered) throw new Error(`Actual content heading has no numbering slot: ${page.url} ${props.id}`);
      const headingProps: HTMLAttributes<HTMLHeadingElement> & {'data-reader-heading-key': string} = { ...props, id, 'data-reader-heading-key': numbered.key };
      if (print && level+2>6) throw new Error(`Book heading exceeds the available HTML hierarchy: ${page.url} ${props.id}`);
      const heading = createElement(print ? `h${level + 2}` : defaults[name] ?? name, headingProps, <NumberedTitle number={numbered.number}>{props.children}</NumberedTitle>);
      return id ? <><LegacyCitationAliases ids={legacy.aliases.get(id)} target={id} />{heading}<RetainedScope entry={legacy.scopes.get(id)} /><CopyeditHistoricalTitle path={print ? '/print' : page.url} id={id} />{historyAt(historyPath, id)}</> : heading;
    }];
  }));
  async function RetainedScope({ entry, readingTitle }: { entry?: LegacyEntry; readingTitle?: string }) {
    if (!showEditorialHistoryInProse()) return null;
    const history = readingTitle ? <CopyeditHistoricalTitle path="/print" id={readingTitle} /> : null;
    if (!entry?.scope) return history;
    const links = await Promise.all(entry.scope.targets.map(async target => ({ href: citationHref(target, entry.path), label: await getCitationLabel(target) })));
    return <><div data-legacy-scope={entry.id} className="legacy-citation-context">
      <p><CitationVersion edition={entry.edition} /></p><p>{entry.scope.text}</p>
      <ul>{links.map(link => <li key={link.href}><a href={link.href} data-legacy-scope-destination="">{link.label}</a></li>)}</ul>
    </div>{history}</>;
  }
  const notices = await Promise.all(legacy.notices.map(async notice => ({
    ...notice,
    links: await Promise.all(notice.targets.map(async target => ({
      href: citationHref(target, notice.path),
      label: await getCitationLabel(target),
    }))),
  })));

  return <>
    <RetainedScope entry={legacy.scopes.get(prefix)} readingTitle={print ? printReadingEntryAnchor(page.url) : undefined} />
    {historyAt(historyPath, print ? prefix : 'nd-page')}
    {historyAt(historyPath, print ? printReadingEntryAnchor(page.url) : 'main-content')}
    <MDX components={getMDXComponents({ Prose: ChapterProse, Claim: Paragraph, ReaderSection, ReaderFigure, TeachingCase: ChapterTeachingCase, a: ReaderLink, ...(currentReaderOrdinaryId(cleanRoute, print, 0) ? { p: ReaderParagraph } : {}), ...((tableId || hasLocalizationTables || hasSocialTables || hasCostTables || hasDataApplicabilityTables || hasUncertaintyTables || hasProductFootprintTables || hasDataQualityTables || hasHybridInventoryTables) ? { table: ReaderTable } : {}), ...headings })} />
    {plan.notes.length > 0 && <section className="chapter-notes not-prose" aria-labelledby={plan.headingId}>
      <LegacyCitationAliases ids={legacy.aliases.get(plan.headingId)} target={plan.headingId} />
      {print ? <h4 id={plan.headingId}>注释</h4> : <h2 id={plan.headingId}>注释</h2>}
      <RetainedScope entry={legacy.scopes.get(plan.headingId)} />
      {historyAt(historyPath, plan.headingId)}
      <ol>{plan.notes.map(note => <li id={note.anchor} data-reader-claim={note.id} key={note.id}>
        <LegacyCitationAliases ids={legacy.aliases.get(note.anchor)} target={note.anchor} />
        <ClaimAnnotation id={note.id} {...annotations.get(note.id)} />
        {showEditorialHistoryInProse() && <>
        {currentMineralResources?.correction && page.url === mineralResourcesChapter && note.id === mineralResourcesCorrection.claimId &&
          <p className="legacy-citation-context" data-mineral-resources-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={mineralResourcesSource.date}>{mineralResourcesSource.date}</time>{' 修订：'}{mineralResourcesCorrection.scope}{' '}
            <a href={citationSourceHref(mineralResourcesSource.commit)}>查看前版源文件</a>
          </p>}
        {currentFossilResources?.correction && page.url === fossilResourcesChapter && note.id === fossilResourcesCorrection.claimId &&
          <p className="legacy-citation-context" data-fossil-resources-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={fossilResourcesSource.date}>{fossilResourcesSource.date}</time>{' 修订：'}{fossilResourcesCorrection.scope}{' '}
            <a href={citationSourceHref(fossilResourcesSource.commit)}>查看前版源文件</a>
          </p>}
        {currentOzoneRadiation?.corrections && page.url === ozoneRadiationChapter && ozoneRadiationCorrections.filter(row => row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-ozone-radiation-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={ozoneRadiationSource.date}>{ozoneRadiationSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(ozoneRadiationSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentPart4Reread && part4RereadCorrections.filter(row => row.chapter === page.url && row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-part4-reread-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={part4RereadSource.date}>{part4RereadSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(part4RereadSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentWeightingValuation?.corrections && weightingValuationCorrections.filter(row => row.chapter === page.url && row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-weighting-valuation-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={weightingValuationSource.date}>{weightingValuationSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(weightingValuationSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentLocalizationComparison?.corrections && localizationComparisonCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-localization-comparison-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={localizationComparisonSource.date}>{localizationComparisonSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(localizationComparisonSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentSocialComparison?.corrections && socialComparisonCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-social-comparison-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={socialComparisonSource.date}>{socialComparisonSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(socialComparisonSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentCostSustainability?.corrections && costSustainabilityCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-cost-sustainability-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={costSustainabilitySource.date}>{costSustainabilitySource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(costSustainabilitySource.commit)}>查看前版源文件</a>
          </p>)}
        {currentPart5Reread && part5RereadCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-part5-reread-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={part5RereadSource.date}>{part5RereadSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(part5RereadSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentDataApplicabilityComparison?.corrections && dataApplicabilityComparisonCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={`${row.chapter}-${row.claimId}`} className="legacy-citation-context" data-data-applicability-comparison-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={dataApplicabilityComparisonSource.date}>{dataApplicabilityComparisonSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(dataApplicabilityComparisonSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentUncertaintyComparison?.corrections && uncertaintyComparisonCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={`${row.chapter}-${row.claimId}`} className="legacy-citation-context" data-uncertainty-comparison-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={uncertaintyComparisonSource.date}>{uncertaintyComparisonSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(uncertaintyComparisonSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentPart6Reread && part6RereadCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={row.claimId} className="legacy-citation-context" data-part6-reread-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={part6RereadSource.date}>{part6RereadSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(part6RereadSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentPart7Reread && part7RereadCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={`${row.chapter}-${row.claimId}`} className="legacy-citation-context" data-part7-reread-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={part7RereadSource.date}>{part7RereadSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(part7RereadSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentPart3Reread && part3RereadCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={`${row.chapter}-${row.claimId}`} className="legacy-citation-context" data-part3-reread-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={part3RereadSource.date}>{part3RereadSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(part3RereadSource.commit)}>查看前版源文件</a>
          </p>)}
        {currentPart2Reread && part2RereadCorrections.filter(row => row.chapter === cleanRoute && row.claimId === note.id).map(row =>
          <p key={`${row.chapter}-${row.claimId}`} className="legacy-citation-context" data-part2-reread-correction={note.id} style={{ display: 'block' }}>
            <time dateTime={part2RereadSource.date}>{part2RereadSource.date}</time>{' 修订：'}{row.scope}{' '}
            <a href={citationSourceHref(part2RereadSource.commit)}>查看前版源文件</a>
          </p>)}
        </>}
      </li>)}</ol>
    </section>}
    {notices.map(notice => <div key={notice.id} id={notice.id} className="legacy-citation-target not-prose" data-legacy-notice="" tabIndex={-1}>
      <div className="legacy-citation-context">
        <p><CitationVersion edition={notice.edition} /></p>
        <p>{notice.scope?.text ?? '可从下列链接查阅这一留存版本对应的内容。'}</p>
        <ul>{notice.links.map(link => <li key={link.href}><a href={link.href} data-legacy-destination="">{link.label}</a></li>)}</ul>
      </div>
    </div>)}
  </>;
}
