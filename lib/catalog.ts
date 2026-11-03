import rawCatalog from '../knowledge/catalog.json';
import { publicCatalog } from '../scripts/knowledge.mjs';
// Every public renderer uses the same eligibility projection as machine exports.
export const catalog = publicCatalog(rawCatalog) as typeof rawCatalog;
export default catalog;
