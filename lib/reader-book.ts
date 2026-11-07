import { source } from '@/lib/source';
import { cache } from 'react';
import baseline from '@/config/citation-baseline.json';
import placements from '@/config/citation-placements.json';
import history from '@/config/citation-history.json';
import { assertCitationHistory } from '@/scripts/reader-citation-history.mjs';
import { bookChapters, createChapterReferenceIndex, orderPages, printUnitAnchor } from '@/scripts/reader-book.mjs';
import { assertCitationBaseline, assertPrintFrontMatter } from '@/scripts/reader-citation-baseline.mjs';
import { createCurrentPrintRoutes, createLegacyCitationEntries, createCanonicalCitationEntries, type Destination, type LegacyEntry } from '@/scripts/reader-citations.mjs';

assertCitationBaseline(baseline);
assertCitationHistory(history);
assertPrintFrontMatter(placements.frontMatter);

export type ReaderPage = ReturnType<typeof source.getPages>[number];

/** Follow the same tree used by chapter navigation, not source discovery order. */
export function getOrderedPages(): ReaderPage[] {
  return orderPages(source.getPageTree(), source.getPages());
}

/** The website chapters, excluding its own navigation-only index page. */
export function getBookPages(): ReaderPage[] {
  return bookChapters(getOrderedPages());
}

export function getPrintPages(): ReaderPage[] {
  const pages = new Map(source.getPages().map(page => [page.url, page]));
  return createCurrentPrintRoutes(baseline, placements, [...pages.keys()]).map(route => pages.get(route)!);
}

export const printFrontMatterCount = placements.frontMatter.length;
const legacyEntries = [...createLegacyCitationEntries(baseline, placements, history.pages),
  ...createCanonicalCitationEntries(history, placements, getPrintPages().map(page => page.url))];

export function getLegacyCitations(route: string, print: boolean) {
  const path = print ? '/print' : route;
  const aliases = new Map<string, LegacyEntry[]>();
  const notices: LegacyEntry[] = [];
  for (const entry of legacyEntries) {
    if (entry.path !== path) continue;
    const target = entry.targets[0];
    if (entry.mode === 'alias' && target.route === route) {
      const list = aliases.get(target.id) ?? [];
      list.push(entry);
      aliases.set(target.id, list);
    }
    if (entry.mode === 'notice' && entry.route === route) notices.push(entry);
  }
  return { aliases, notices };
}

export const getChapterReferenceIndex = cache(async () => {
  const printOrder = new Map(getPrintPages().map((page, index) => [page.url, index]));
  return createChapterReferenceIndex(await Promise.all(getOrderedPages().map(async page => ({
    url: page.url, title: page.data.title, raw: await page.data.getText('raw'),
    printAnchorPrefix: printOrder.has(page.url) ? printUnitAnchor(page.url) : null,
    printOrder: printOrder.get(page.url),
  }))));
});

export async function getCitationLabel(target: Destination) {
  const index = await getChapterReferenceIndex();
  const note = index.get(target.claimId)?.find((location: { url: string }) => location.url === target.route);
  if (!note) throw new Error(`Missing citation note at ${target.route}: ${target.claimId}`);
  return `《${note.title}》注 ${note.number}`;
}
