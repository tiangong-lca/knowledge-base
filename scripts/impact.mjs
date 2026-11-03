import { readFileSync } from 'node:fs';
import { affectedClaims } from './knowledge.mjs';
const changed = process.argv.slice(2);
if (!changed.length) throw new Error('Usage: node scripts/impact.mjs <changed-source/evidence/claim/concept/mapping-id> [...]');
const catalog = JSON.parse(readFileSync('knowledge/catalog.json','utf8'));
const known = new Set(['sources','evidence','claims','concepts','mappings'].flatMap(k => catalog[k].map(x=>x.id)));
for (const id of changed) if (!known.has(id)) throw new Error(`Unknown changed identity: ${id}`);
console.log(JSON.stringify({changed, requiresReview: affectedClaims(catalog, changed), note:'Impact analysis is advisory. Update review status and check dependent prose before publication.'},null,2));
