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
export const isReadableBookReviewPreview = oldPreview
  || preview && (copyeditConfig.status === 'preview' || flowBoundaryConfig.status === 'preview' || serviceConstraintsConfig.status === 'preview' || substitutionConfig.status === 'preview' || loadShiftConfig.status === 'preview' || circularConfig.status === 'preview' || landConfig.status === 'preview' || acidConfig.status === 'preview' || mineralConfig.status === 'preview' || fossilConfig.status === 'preview' || ozoneConfig.status === 'preview' || ozradConfig.status === 'preview' || toxConfig.status === 'preview' || waterConfig.status === 'preview');
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
export const currentBookPlan = effectiveWaterScarcity(acceptedTox, currentWaterScarcity);

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
  return toxicityComparisonLayout(currentToxicityComparison, key,
    substitutionRulesLayout(currentSubstitutionRules, key, serviceConstraintsLayout(currentServiceConstraints, key, copyedit)));
}
