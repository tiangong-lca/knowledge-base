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
export const isReadableBookReviewPreview = oldPreview
  || preview && (copyeditConfig.status === 'preview' || flowBoundaryConfig.status === 'preview' || serviceConstraintsConfig.status === 'preview' || substitutionConfig.status === 'preview');
const previousPlan = readableBookReviewPlan(oldPreview
  ? acceptance.units
  : pinnedReadableBookUnits(acceptance, readableBookBaselineDigest, readableBookAcceptancePins));
const acceptedCopyedit = effectiveReaderCopyedit(previousPlan, currentCopyedit);
const acceptedFlow = effectiveFlowBoundary(acceptedCopyedit, currentFlowBoundary, []);
const acceptedService = effectiveServiceConstraints(acceptedFlow, currentServiceConstraints);
export const currentBookPlan = effectiveSubstitutionRules(acceptedService, currentSubstitutionRules);

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
  return substitutionRulesLayout(currentSubstitutionRules, key, serviceConstraintsLayout(currentServiceConstraints, key, copyedit));
}
