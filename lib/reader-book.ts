import { source } from '@/lib/source';
import { cache } from 'react';
import { bookChapters, createChapterReferenceIndex, orderPages } from '@/scripts/reader-book.mjs';

export type ReaderPage = ReturnType<typeof source.getPages>[number];

/** Follow the same tree used by chapter navigation, not source discovery order. */
export function getOrderedPages(): ReaderPage[] {
  return orderPages(source.getPageTree(), source.getPages());
}

/** The book's chapters, excluding its own navigation-only index page. */
export function getBookPages(): ReaderPage[] {
  return bookChapters(getOrderedPages());
}

export function getPrintPages(): ReaderPage[] {
  const ordered = getOrderedPages();
  return [...bookChapters(ordered), ...ordered.filter(page => page.slugs.length === 1 && page.slugs[0] !== 'book')];
}

export const getChapterReferenceIndex = cache(async () => {
  const printed = getPrintPages();
  return createChapterReferenceIndex(await Promise.all(getOrderedPages().map(async page => {
    const printIndex = printed.findIndex(candidate => candidate.url === page.url);
    return { url: page.url, title: page.data.title, raw: await page.data.getText('raw'),
      printAnchorPrefix: printIndex < 0 ? null : `print-chapter-${printIndex + 1}` };
  })));
});
