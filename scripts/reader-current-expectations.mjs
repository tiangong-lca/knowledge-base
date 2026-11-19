import revConfig from '../config/reader-revisable-judgment.json' with { type: 'json' };
import { selectRevisableJudgment, effectiveRevisableJudgment, revisableJudgmentLayout } from './reader-revisable-judgment.mjs';
import futConfig from '../config/reader-future-scenarios.json' with { type: 'json' };
import { selectFutureScenarios, effectiveFutureScenarios, futureScenariosLayout } from './reader-future-scenarios.mjs';
import intConfig from '../config/reader-interpretation-bags.json' with { type: 'json' };
import { selectInterpretationBags, effectiveInterpretationBags, interpretationBagsLayout } from './reader-interpretation-bags.mjs';
import wscConfig from '../config/reader-wall-service-comparison.json' with { type: 'json' };
import { selectWallServiceComparison, effectiveWallServiceComparison, wallServiceComparisonLayout } from './reader-wall-service-comparison.mjs';
import part6Config from '../config/reader-part6-reread.json' with { type: 'json' };
import { selectPart6Reread, effectivePart6Reread, part6RereadLayout } from './reader-part6-reread.mjs';
import dqpConfig from '../config/reader-data-quality-comparison.json' with { type: 'json' };
import { selectDataQualityComparison, effectiveDataQualityComparison, dataQualityComparisonLayout } from './reader-data-quality-comparison.mjs';
import pfrConfig from '../config/reader-product-footprint-comparison.json' with { type: 'json' };
import { selectProductFootprintComparison, effectiveProductFootprintComparison } from './reader-product-footprint-comparison.mjs';
import uncConfig from '../config/reader-uncertainty-comparison.json' with { type: 'json' };
import { selectUncertaintyComparison, effectiveUncertaintyComparison } from './reader-uncertainty-comparison.mjs';
import dappConfig from '../config/reader-data-applicability-comparison.json' with { type: 'json' };
import { selectDataApplicabilityComparison, effectiveDataApplicabilityComparison, dataApplicabilityComparisonLayout } from './reader-data-applicability-comparison.mjs';
import part5Config from '../config/reader-part5-reread.json' with { type: 'json' };
import { selectPart5Reread, effectivePart5Reread } from './reader-part5-reread.mjs';
import costConfig from '../config/reader-cost-sustainability.json' with { type: 'json' };
import { selectCostSustainability, effectiveCostSustainability } from './reader-cost-sustainability.mjs';
import socialConfig from '../config/reader-social-comparison.json' with { type: 'json' };
import { selectSocialComparison, effectiveSocialComparison } from './reader-social-comparison.mjs';
import localizationConfig from '../config/reader-localization-comparison.json' with { type: 'json' };
import { selectLocalizationComparison, effectiveLocalizationComparison } from './reader-localization-comparison.mjs';
import weightingConfig from '../config/reader-weighting-valuation.json' with { type: 'json' };
import { selectWeightingValuation, effectiveWeightingValuation } from './reader-weighting-valuation.mjs';
import part4Config from '../config/reader-part4-reread.json' with { type: 'json' };
import { selectPart4Reread, effectivePart4Reread, part4RereadLayout } from './reader-part4-reread.mjs';
import particulateConfig from '../config/reader-particulate-comparison.json' with { type: 'json' };
import { selectParticulateComparison, effectiveParticulateComparison, particulateComparisonLayout } from './reader-particulate-comparison.mjs';
import eutroConfig from '../config/reader-eutrophication-pathways.json' with { type: 'json' };
import { selectEutrophicationPathways, effectiveEutrophicationPathways } from './reader-eutrophication-pathways.mjs';
import biogenicConfig from '../config/reader-biogenic-carbon.json' with { type: 'json' };
import { selectBiogenicCarbon, effectiveBiogenicCarbon, biogenicCarbonLayout } from './reader-biogenic-carbon.mjs';
import waterConfig from '../config/reader-water-scarcity.json' with { type: 'json' };
import { selectWaterScarcity, effectiveWaterScarcity } from './reader-water-scarcity.mjs';
import toxConfig from '../config/reader-toxicity-comparison.json' with { type: 'json' };
import { selectToxicityComparison, effectiveToxicityComparison, toxicityComparisonLayout } from './reader-toxicity-comparison.mjs';
import ozradConfig from '../config/reader-ozone-radiation.json' with { type: 'json' };
import { selectOzoneRadiation, effectiveOzoneRadiation } from './reader-ozone-radiation.mjs';
import ozoneConfig from '../config/reader-photochemical-ozone.json' with { type: 'json' };
import { selectPhotochemicalOzone, effectivePhotochemicalOzone } from './reader-photochemical-ozone.mjs';
import fossilConfig from '../config/reader-fossil-resources.json' with { type: 'json' };
import { selectFossilResources, effectiveFossilResources } from './reader-fossil-resources.mjs';
import mineralConfig from '../config/reader-mineral-resources.json' with { type: 'json' };
import { selectMineralResources, effectiveMineralResources } from './reader-mineral-resources.mjs';
import acidConfig from '../config/reader-acid-equivalents.json' with { type: 'json' };
import { selectAcidEquivalents, effectiveAcidEquivalents } from './reader-acid-equivalents.mjs';
import landConfig from '../config/reader-land-recovery.json' with { type: 'json' };
import { selectLandRecovery, effectiveLandRecovery } from './reader-land-recovery.mjs';
import circularConfig from '../config/reader-circular-footprint.json' with { type: 'json' };
import { selectCircularFootprint, effectiveCircularFootprint } from './reader-circular-footprint.mjs';
import loadShiftConfig from '../config/reader-load-shift.json' with { type: 'json' };
import { selectLoadShift, effectiveLoadShift } from './reader-load-shift.mjs';
import substitutionConfig from '../config/reader-substitution-rules.json' with { type: 'json' };
import { selectSubstitutionRules, effectiveSubstitutionRules, substitutionRulesLayout } from './reader-substitution-rules.mjs';
import serviceConstraintsConfig from '../config/reader-service-constraints.json' with { type: 'json' };
import { selectServiceConstraints, effectiveServiceConstraints, serviceConstraintsLayout } from './reader-service-constraints.mjs';
import flowBoundaryConfig from '../config/reader-flow-boundary.json' with { type: 'json' };
import { flowBoundaryUnitPin } from './reader-flow-boundary-pins.mjs';
import { selectFlowBoundary, flowBoundarySections, flowBoundaryOrdinaryDispositions, flowBoundaryTitle, flowBoundaryChapter, effectiveFlowBoundary } from './reader-flow-boundary.mjs';
import acceptance from '../config/readable-book-current.json' with { type: 'json' };
import copyeditConfig from '../config/reader-copyedit-current.json' with { type: 'json' };
import { readableBookAcceptancePins, readableBookBaselineDigest } from './reader-current-edition-pins.mjs';
import { readerCopyeditUnitPin } from './reader-copyedit-pins.mjs';
import { copyeditLayout, effectiveReaderCopyedit, selectReaderCopyedit } from './reader-copyedit.mjs';
import { editionDigest, matchesAcceptedFile, matchesAcceptedRecord, pinnedReadableBookUnits, readableBookReviewPlan } from './reader-current-edition.mjs';

// Preview never bypasses the old reviewed pin when rendering a #95 successor.
const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
const oldPreview = preview && acceptance.status === 'preview';
export const currentCopyedit = selectReaderCopyedit(copyeditConfig, readerCopyeditUnitPin, preview);
export const currentFlowBoundary = selectFlowBoundary(flowBoundaryConfig, flowBoundaryUnitPin, preview);
export const currentServiceConstraints = selectServiceConstraints(serviceConstraintsConfig, undefined, preview);
export const currentSubstitutionRules = selectSubstitutionRules(substitutionConfig, undefined, preview);
export const currentLoadShift = selectLoadShift(loadShiftConfig, undefined, preview);
export const currentCircularFootprint = selectCircularFootprint(circularConfig, undefined, preview);
export const currentLandRecovery = selectLandRecovery(landConfig, undefined, preview);
export const currentAcidEquivalents = selectAcidEquivalents(acidConfig, undefined, preview);
export const currentMineralResources = selectMineralResources(mineralConfig, undefined, preview);
export const currentFossilResources = selectFossilResources(fossilConfig, undefined, preview);
export const currentPhotochemicalOzone = selectPhotochemicalOzone(ozoneConfig, undefined, preview);
export const currentOzoneRadiation = selectOzoneRadiation(ozradConfig, undefined, preview);
export const currentToxicityComparison = selectToxicityComparison(toxConfig, undefined, preview);
export const currentWaterScarcity = selectWaterScarcity(waterConfig, undefined, preview);
export const currentBiogenicCarbon = selectBiogenicCarbon(biogenicConfig, undefined, preview);
export const currentEutrophicationPathways = selectEutrophicationPathways(eutroConfig, undefined, preview);
export const currentParticulateComparison = selectParticulateComparison(particulateConfig, undefined, preview);
export const currentPart4Reread = selectPart4Reread(part4Config, undefined, preview);
export const currentWeightingValuation = selectWeightingValuation(weightingConfig, undefined, preview);
export const currentLocalizationComparison = selectLocalizationComparison(localizationConfig, undefined, preview);
export const currentSocialComparison = selectSocialComparison(socialConfig, undefined, preview);
export const currentCostSustainability = selectCostSustainability(costConfig, undefined, preview);
export const currentPart5Reread = selectPart5Reread(part5Config, undefined, preview);
export const currentDataApplicabilityComparison = selectDataApplicabilityComparison(dappConfig, undefined, preview);
export const currentUncertaintyComparison = selectUncertaintyComparison(uncConfig, undefined, preview);
export const currentProductFootprintComparison = selectProductFootprintComparison(pfrConfig, undefined, preview);
export const currentDataQualityComparison = selectDataQualityComparison(dqpConfig, undefined, preview);
export const currentPart6Reread = selectPart6Reread(part6Config, undefined, preview);
export const currentWallServiceComparison = selectWallServiceComparison(wscConfig, undefined, preview);
export const currentInterpretationBags = selectInterpretationBags(intConfig, undefined, preview);
export const currentFutureScenarios = selectFutureScenarios(futConfig, undefined, preview);
export const currentRevisableJudgment = selectRevisableJudgment(revConfig, undefined, preview);
export const isReadableBookReviewPreview = oldPreview
  || preview && (copyeditConfig.status === 'preview' || flowBoundaryConfig.status === 'preview' || serviceConstraintsConfig.status === 'preview' || substitutionConfig.status === 'preview' || loadShiftConfig.status === 'preview' || circularConfig.status === 'preview' || landConfig.status === 'preview' || acidConfig.status === 'preview' || mineralConfig.status === 'preview' || fossilConfig.status === 'preview' || ozoneConfig.status === 'preview' || ozradConfig.status === 'preview' || toxConfig.status === 'preview' || waterConfig.status === 'preview' || biogenicConfig.status === 'preview' || eutroConfig.status === 'preview' || particulateConfig.status === 'preview' || part4Config.status === 'preview' || weightingConfig.status === 'preview' || localizationConfig.status === 'preview' || socialConfig.status === 'preview' || costConfig.status === 'preview' || part5Config.status === 'preview' || dappConfig.status === 'preview' || uncConfig.status === 'preview' || pfrConfig.status === 'preview' || dqpConfig.status === 'preview' || part6Config.status === 'preview' || wscConfig.status === 'preview' || intConfig.status === 'preview' || futConfig.status === 'preview' || revConfig.status === 'preview');
const previousPlan = readableBookReviewPlan(oldPreview
  ? acceptance.units
  : pinnedReadableBookUnits(acceptance, readableBookBaselineDigest, readableBookAcceptancePins));
const acceptedCopyedit = effectiveReaderCopyedit(previousPlan, currentCopyedit);
const acceptedFlow = effectiveFlowBoundary(acceptedCopyedit, currentFlowBoundary, []);
const acceptedService = effectiveServiceConstraints(acceptedFlow, currentServiceConstraints);
const acceptedSubstitution = effectiveSubstitutionRules(acceptedService, currentSubstitutionRules);
const acceptedShift = effectiveLoadShift(acceptedSubstitution, currentLoadShift);
const acceptedFootprint = effectiveCircularFootprint(acceptedShift, currentCircularFootprint);
const acceptedLand = effectiveLandRecovery(acceptedFootprint, currentLandRecovery);
const acceptedAcid = effectiveAcidEquivalents(acceptedLand, currentAcidEquivalents);
const acceptedMineral = effectiveMineralResources(acceptedAcid, currentMineralResources);
const acceptedFossil = effectiveFossilResources(acceptedMineral, currentFossilResources);
const acceptedOzone = effectivePhotochemicalOzone(acceptedFossil, currentPhotochemicalOzone);
const acceptedOzrad = effectiveOzoneRadiation(acceptedOzone, currentOzoneRadiation);
const acceptedTox = effectiveToxicityComparison(acceptedOzrad, currentToxicityComparison);
const acceptedWater = effectiveWaterScarcity(acceptedTox, currentWaterScarcity);
const acceptedBio = effectiveBiogenicCarbon(acceptedWater, currentBiogenicCarbon);
const acceptedEutro = effectiveEutrophicationPathways(acceptedBio, currentEutrophicationPathways);
const acceptedParticulate = effectiveParticulateComparison(acceptedEutro, currentParticulateComparison);
const acceptedPart4 = effectivePart4Reread(acceptedParticulate, currentPart4Reread);
const acceptedWeighting = effectiveWeightingValuation(acceptedPart4, currentWeightingValuation);
const acceptedLocalization = effectiveLocalizationComparison(acceptedWeighting, currentLocalizationComparison);
const acceptedSocial = effectiveSocialComparison(acceptedLocalization, currentSocialComparison);
const acceptedCost = effectiveCostSustainability(acceptedSocial, currentCostSustainability);
const acceptedPart5 = effectivePart5Reread(acceptedCost, currentPart5Reread);
const acceptedDapp = effectiveDataApplicabilityComparison(acceptedPart5, currentDataApplicabilityComparison);
const acceptedUnc = effectiveUncertaintyComparison(acceptedDapp, currentUncertaintyComparison);
const acceptedPfr = effectiveProductFootprintComparison(acceptedUnc, currentProductFootprintComparison);
const acceptedDqp = effectiveDataQualityComparison(acceptedPfr, currentDataQualityComparison);
const acceptedPart6 = effectivePart6Reread(acceptedDqp, currentPart6Reread);
const acceptedWsc = effectiveWallServiceComparison(acceptedPart6, currentWallServiceComparison);
const acceptedInt = effectiveInterpretationBags(acceptedWsc, currentInterpretationBags);
const acceptedFut = effectiveFutureScenarios(acceptedInt, currentFutureScenarios);
export const currentBookPlan = effectiveRevisableJudgment(acceptedFut, currentRevisableJudgment);

export function currentBookRecordMatches(kind, previous, current, projection) {
  if (projection !== undefined) return matchesAcceptedRecord(currentBookPlan, kind, previous, current, projection);
  return matchesAcceptedRecord(currentBookPlan, kind, previous, current, 'raw')
    || matchesAcceptedRecord(currentBookPlan, kind, previous, current, 'public');
}

export function currentFlowBoundaryRecordMatches(kind, key, actual) {
  const change = currentFlowBoundary?.changes.find(row => row.kind === 'record' && row.key === `${kind}:${key}`);
  if (change?.from == null) return false;
  const currentRaw = editionDigest(actual);
  if (change.to.raw === currentRaw) return true;
  const successor = currentBookPlan.changes.record.get(`${kind}:${key}`);
  return successor?.to.raw === currentRaw && successor.predecessors?.some(row => row?.raw === change.to.raw);
}

export function currentBookFileMatches(path, previousDigest, currentDigest) {
  return matchesAcceptedFile(currentBookPlan, path, previousDigest, currentDigest);
}

export function currentBookMdxMatches(route, previousDigest, currentDigest) {
  const stem = route === '/docs' || route === '/docs/book' || route === '/docs/appendices' ? route + '/index' : route;
  return currentBookFileMatches(`content${stem}.mdx`, previousDigest, currentDigest);
}

/** A reviewed predicate amendment keeps its own old input and semantic scope. */
export function currentBookLayout(key, previous) {
  const row = previousPlan.layouts.get(key);
  if (row && row.from !== editionDigest(previous)) throw new Error(`Readable book layout has stale predecessor: ${key}`);
  const copyedit = copyeditLayout(key, row ? row.to : previous, currentCopyedit);
  if (key === 'B08:title') return flowBoundaryTitle(currentFlowBoundary, flowBoundaryChapter, copyedit);
  if (key === 'B08:headings') return flowBoundarySections(currentFlowBoundary, copyedit);
  if (key === 'B08:ordinary-dispositions') return flowBoundaryOrdinaryDispositions(currentFlowBoundary, copyedit);
  return revisableJudgmentLayout(currentRevisableJudgment, key,
    futureScenariosLayout(currentFutureScenarios, key,
    interpretationBagsLayout(currentInterpretationBags, key,
    wallServiceComparisonLayout(currentWallServiceComparison, key,
    part6RereadLayout(currentPart6Reread, key,
    dataQualityComparisonLayout(currentDataQualityComparison, key,
    dataApplicabilityComparisonLayout(currentDataApplicabilityComparison, key,
    part4RereadLayout(currentPart4Reread, key,
    particulateComparisonLayout(currentParticulateComparison, key,
      biogenicCarbonLayout(currentBiogenicCarbon, key,
        toxicityComparisonLayout(currentToxicityComparison, key,
          substitutionRulesLayout(currentSubstitutionRules, key, serviceConstraintsLayout(currentServiceConstraints, key, copyedit)))))))))))));
}
