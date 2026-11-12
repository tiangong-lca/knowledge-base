import { readFile } from 'node:fs/promises';
import { describeReadableBookCitationSources } from './reader-current-citations.mjs';
import { getHistoricalCitationEntries } from './reader-surface.mjs';

const read = async name => JSON.parse(await readFile(new URL(`../config/${name}.json`, import.meta.url), 'utf8'));
const keys = {
  edition: 'book-edition', accepted: 'framework-accepted', headingHistory: 'framework-heading-history',
  cleanerAccepted: 'cleaner-production-accepted', cleanerHeadingHistory: 'cleaner-production-heading-history',
  functionalAccepted: 'functional-reference-accepted', functionalHeadings: 'functional-reference-heading-history',
  processAccepted: 'process-network-accepted', processHeadings: 'process-network-heading-history',
  exchangeOriginal: 'exchange-semantics-original', exchangeHeadings: 'exchange-semantics-heading-history',
  exchangePartial: 'exchange-semantics-partial-history', exchangeCitations: 'exchange-semantics-citation-sources',
  hybridAccepted: 'hybrid-inventory-accepted', hybridHeadings: 'hybrid-inventory-heading-history',
  jointOriginal: 'joint-production-original', jointHeadings: 'joint-production-heading-history', jointProse: 'joint-production-prose-accepted',
  wallOriginal: 'wall-selection-original', wallHeadings: 'wall-selection-heading-history', wallAccepted: 'wall-selection-accepted',
  closingHistory: 'closing-synthesis-heading-history', closingProse: 'closing-synthesis-prose-accepted',
  climateAccepted: 'climate-assembly-accepted', dataAccepted: 'data-applicability-accepted',
  toxicityAccepted: 'toxicity-pathways-accepted', pedigreeAccepted: 'readable-pedigree-accepted', pmAccepted: 'pm-selection-accepted',
};
const [baseline, placements, history, capture, data] = await Promise.all([
  read('citation-baseline'), read('citation-placements'), read('citation-history'), read('readable-book-hosted-history'),
  Promise.all(Object.entries(keys).map(async ([key, name]) => [key, await read(name)])),
]);
const historicPrintRoutes = [...baseline.pages.filter(page => page.printOrdinal !== undefined).map(page => page.route),
  ...placements.frontMatter, ...(placements.printAdditions ?? []).map(unit => unit.route)];
const entries = getHistoricalCitationEntries(baseline, placements, history, historicPrintRoutes, Object.fromEntries(data));
const sources = describeReadableBookCitationSources(entries, capture);
const routes = new Set(process.argv.slice(2));
console.log(JSON.stringify({
  status: 'observed-history', sources: routes.size ? sources.filter(row => routes.has(row.entry.route)) : sources,
}, null, 2));
