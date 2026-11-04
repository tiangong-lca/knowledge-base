import { readFileSync, existsSync } from 'node:fs';
import { affectedClaims } from './knowledge.mjs';
const changed = process.argv.slice(2);
if (!changed.length) throw new Error('Usage: node scripts/impact.mjs <changed-source/evidence/claim/concept/mapping/reading/passage-id> [...]');
const catalog = JSON.parse(readFileSync('knowledge/catalog.json','utf8'));
const known = new Set(['sources','evidence','claims','concepts','mappings'].flatMap(k => catalog[k].map(x=>x.id)));
if (existsSync('knowledge/research/readings.json')) {
  const ledger = JSON.parse(readFileSync('knowledge/research/readings.json', 'utf8'));
  for (const reading of ledger.readings) { known.add(reading.id); for (const passage of reading.passages) known.add(passage.id); }
}
for (const id of changed) if (!known.has(id)) throw new Error(`Unknown changed identity: ${id}`);
console.log(JSON.stringify({changed, requiresReview: affectedClaims(catalog, changed), note:'Impact analysis is advisory. Update review status and check dependent prose before publication.'},null,2));
