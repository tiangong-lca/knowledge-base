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
import { bookChapters, createChapterReferenceIndex, orderPages } from '@/scripts/reader-book.mjs';
import { assertCitationBaseline, assertPrintFrontMatter } from '@/scripts/reader-citation-baseline.mjs';
import { currentEditionKeys, validateFrameworkCoverage, assertFrameworkHeadingHistory, remapBookCitations } from '@/scripts/reader-edition.mjs';
import { createLegacyCitationEntries, createCanonicalCitationEntries, type Destination, type LegacyEntry } from '@/scripts/reader-citations.mjs';

assertCitationBaseline(baseline);
assertCitationHistory(history);
assertPrintFrontMatter(placements.frontMatter);
assertFrameworkHeadingHistory(headingHistory);
export type ReaderPage = ReturnType<typeof source.getPages>[number];
export type PrintPage = ReaderPage & { kind: string; sections?: { id: string; title: string }[]; part?: string };
export function getOrderedPages(): ReaderPage[] { return orderPages(source.getPageTree(), source.getPages()); }
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
const legacyEntries: LegacyEntry[] = remapFunctionalReferenceCitations(remapCleanerProductionCitations(
  remapBookCitations([...historical, ...cleanerProductionHeadingEntries(cleanerHeadingHistory), ...functionalReferenceHeadingEntries(functionalHeadings)], edition, accepted, placements), cleanerAccepted, cleanerHeadingHistory), functionalAccepted, functionalHeadings);
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
  const functionalErrors = validateFunctionalReferenceCoverage(edition,rawSources,functionalAccepted,catalog,functionalProse);
  if (functionalErrors.length) throw new Error(functionalErrors.join('\n'));
  if (print) {
    const errors = validateFrameworkCoverage(edition,rawSources,accepted);
    if (errors.length) throw new Error(errors.join('\n'));
  }
  return createChapterReferenceIndex(rawPages, {print});
});
export async function getCitationLabel(target: Destination) {
  const print = target.path === '/print';
  if (target.kind === 'note') {
    const index = await getChapterReferenceIndex(print);
    const note = index.get(target.claimId)?.find((location: { unitKey: string })=>location.unitKey===target.route);
    if (!note) throw new Error(`Missing citation note at ${target.route}: ${target.claimId}`);
    return `《${note.title}》注 ${note.number}`;
  }
  const page = print ? getPrintPages().find(page=>page.url===target.route) : source.getPages().find(page=>page.url===target.route);
  if (!page) throw new Error(`Missing citation destination ${target.route}`);
  const sections = print ? (page as PrintPage).sections : undefined;
  const section = sections?.find(section=>target.id.endsWith(`-${section.id}`));
  return `《${page.data.title}》${section ? `·${section.title}` : target.kind==='note-group' ? '注释' : ''}`;
}
