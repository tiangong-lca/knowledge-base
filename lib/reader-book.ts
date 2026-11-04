import { source } from '@/lib/source';
import { bookChapters, orderPages } from '@/scripts/reader-book.mjs';

export type ReaderPage = ReturnType<typeof source.getPages>[number];

/** Follow the same tree used by chapter navigation, not source discovery order. */
export function getOrderedPages(): ReaderPage[] {
  return orderPages(source.getPageTree(), source.getPages());
}

/** The book's chapters, excluding its own navigation-only index page. */
export function getBookPages(): ReaderPage[] {
  return bookChapters(getOrderedPages());
}
