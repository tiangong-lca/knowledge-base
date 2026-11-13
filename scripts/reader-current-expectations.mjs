import acceptance from '../config/readable-book-current.json' with { type: 'json' };
import copyeditConfig from '../config/reader-copyedit-current.json' with { type: 'json' };
import { readableBookAcceptancePins, readableBookBaselineDigest } from './reader-current-edition-pins.mjs';
import { readerCopyeditUnitPin } from './reader-copyedit-pins.mjs';
import { copyeditChanges, copyeditLayout, selectReaderCopyedit } from './reader-copyedit.mjs';
import { editionDigest, matchesAcceptedFile, matchesAcceptedRecord, pinnedReadableBookUnits, readableBookReviewPlan } from './reader-current-edition.mjs';

// Preview never bypasses the old reviewed pin when rendering a #95 successor.
const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
const oldPreview = preview && acceptance.status === 'preview';
export const currentCopyedit = selectReaderCopyedit(copyeditConfig, readerCopyeditUnitPin, preview);
export const isReadableBookReviewPreview = oldPreview || preview && copyeditConfig.status === 'preview';
const previousPlan = readableBookReviewPlan(oldPreview
  ? acceptance.units
  : pinnedReadableBookUnits(acceptance, readableBookBaselineDigest, readableBookAcceptancePins));
export const currentBookPlan = { ...previousPlan, changes: copyeditChanges(previousPlan.changes, currentCopyedit) };

export function currentBookRecordMatches(kind, previous, current, projection) {
  if (projection !== undefined) return matchesAcceptedRecord(currentBookPlan, kind, previous, current, projection);
  return matchesAcceptedRecord(currentBookPlan, kind, previous, current, 'raw')
    || matchesAcceptedRecord(currentBookPlan, kind, previous, current, 'public');
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
  return copyeditLayout(key, row ? row.to : previous, currentCopyedit);
}
