import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, sha256 } from './reader-current-edition.mjs';

export const scienceDigest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const scienceText = value => typeof value === 'string' && Boolean(value.trim());
export const sameScienceValue = (a, b) => editionDigest(a ?? null) === editionDigest(b ?? null);

const bindings = new Map([
  ['catalog.sources', 'sources'], ['catalog.evidence', 'evidence'], ['catalog.claims', 'claims'],
  ['catalog.concepts', 'concepts'], ['catalog.mappings', 'mappings'], ['catalog.coverage', 'coverage'],
  ['readings.readings', 'readings'], ['readings.gaps', 'gaps'], ['readings.revisions', 'revisions'],
  ['literature.records', 'literature'], ['literature.gaps', 'literatureGaps'],
  ['literature.protocol.queries', 'queries'],
]);
const metadata = new Set(['readings.updatedAt', 'literature.updatedAt']);
const parentObject = (object, path) => path.slice(0, -1).reduce((row, key) => row[key], object);

function verifyContinuity(family, before, after) {
  if (family === 'sources') {
    const identity = ({ reading, ...source }) => {
      const { checkedAt, scope, ...readingIdentity } = reading ?? {};
      return { source, readingIdentity };
    };
    if (!sameScienceValue(identity(before), identity(after)))
      throw new Error(`Scientific successor changed original source or carrier identity: ${before.id}`);
  }
  if (family === 'readings') {
    const identity = ({ artifacts, passages, sourceKeys, appraisal, unread, checkedAt, ...fields }) => fields;
    if (!sameScienceValue(identity(before), identity(after)))
      throw new Error(`Scientific successor changed original reading identity: ${before.id}`);
    for (const field of ['artifacts', 'passages', 'sourceKeys']) {
      const previous = before[field] ?? [], current = after[field] ?? [];
      if (!Array.isArray(current) || !sameScienceValue(previous, current.slice(0, previous.length)))
        throw new Error(`Scientific successor changed a previous ${field} entry: ${before.id}`);
    }
  }
}

/** Restore the three original raw objects needed to recompute older byte receipts. */
export function restoreScientificRecords(actual, rows, fieldRows, changes, allows) {
  if (!Array.isArray(rows) || !Array.isArray(fieldRows)) throw new Error('Scientific successor requires exact raw rollback rows');
  const previous = structuredClone(actual);
  const seen = new Set();
  for (const { path, id, from } of rows) {
    const family = bindings.get(path), key = `${family}:${id}`, change = changes.get(key);
    if (!family || !change || seen.has(key) || from === undefined || !allows(family, id, from))
      throw new Error(`Scientific successor has an unsupported raw transition: ${path} ${id}`);
    seen.add(key);
    const parts = path.split('.'), name = parts.at(-1), parent = parentObject(previous, parts);
    const index = parent[name].findIndex(record => record.id === id);
    const candidate = parent[name][index];
    if (index < 0 || editionDigest(candidate) !== change.to.raw
        || (from === null ? change.from !== null : change.from?.raw !== editionDigest(from)))
      throw new Error(`Scientific successor raw record differs from its accepted transition: ${key}`);
    if (from === null) parent[name].splice(index, 1);
    else {
      verifyContinuity(family, from, candidate);
      parent[name][index] = from;
    }
  }
  for (const key of changes.keys()) {
    if (!key.startsWith('researchMetadata:') && !seen.has(key))
      throw new Error(`Scientific successor lacks the exact raw record for: ${key}`);
  }
  const fields = new Set();
  for (const { path, from, to } of fieldRows) {
    if (!metadata.has(path) || fields.has(path) || !scienceText(from) || !scienceText(to) || from === to)
      throw new Error(`Scientific successor has an unauthorized metadata transition: ${path}`);
    fields.add(path);
    const parts = path.split('.'), parent = parentObject(previous, parts), key = parts.at(-1);
    if (parent[key] !== to) throw new Error(`Scientific successor metadata differs from actual input: ${path}`);
    parent[key] = from;
  }
  return previous;
}

export function mergeScientificFileAndRecordChanges(previous, unit) {
  const changes = { file: new Map(previous.changes.file), record: new Map(previous.changes.record) };
  for (const row of unit.changes) {
    const table = changes[row.kind], prior = table.get(row.key);
    if (prior && !sameScienceValue(prior.to, row.from))
      throw new Error(`Scientific successor does not continue the accepted state: ${row.key}`);
    const predecessors = prior
      ? [...prior.predecessors ?? [prior.from, prior.intermediate].filter(value => value !== undefined), prior.to]
      : [row.from];
    table.set(row.key, { ...row, from: predecessors[0], intermediate: row.from, predecessors });
  }
  return changes;
}

export function mergeScientificOutput(previous, rows, key) {
  if (!Array.isArray(rows) || new Set(rows.map(key)).size !== rows.length)
    throw new Error('Scientific successor repeats an actual output identity');
  const result = new Map(previous);
  for (const row of rows) {
    const id = key(row);
    if (!scienceText(row.rationale) || !scienceDigest(row.sha256) || result.get(id)?.sha256 !== row.from || row.sha256 === row.from)
      throw new Error(`Scientific successor has a stale actual output predecessor: ${id}`);
    result.set(id, row);
  }
  return result;
}

export function exactPublicJsonReceipt(file, bytes) {
  return typeof bytes === 'string' && file.sha256 === (file.contentSha256 ?? file.sha256)
    && file.sha256 === sha256(bytes) && file.bytes === Buffer.byteLength(bytes);
}

/** The extractor supplies independently parsed native addresses and exact ordinary destinations. */
export function qualifyScientificHistory(observed, actual, ordinaryTargets, { label, routes, predecessorPin }) {
  const { previousAddresses, currentAddresses, history } = observed ?? {};
  if (!previousAddresses || !currentAddresses || !Array.isArray(history) || new Set(history.map(row => row.address)).size !== history.length)
    throw new Error(`${label} requires its actual predecessor citation scopes`);
  if (editionDigest(previousAddresses) !== predecessorPin)
    throw new Error(`${label} predecessor citation inventory differs from the deployed capture`);
  const selected = Object.fromEntries(Object.entries(actual).filter(([, row]) => routes.includes(row.route)));
  if (!sameScienceValue(selected, currentAddresses)) throw new Error(`${label} native HTML citations differ from the actual output acceptance`);
  const dispositions = new Map(history.map(row => [row.address, row]));
  for (const [address, old] of Object.entries(previousAddresses)) {
    const current = selected[address];
    if (!current || old.kind !== current.kind || old.route !== current.route || old.chapter !== current.chapter
        || old.kind === 'note' && !sameScienceValue(old.claimIds, current.claimIds))
      throw new Error(`${label} lost or changed a preceding citation identity: ${address}`);
    const row = dispositions.get(address);
    if (old.kind === 'note' || sameScienceValue(old, current)) {
      if (row) throw new Error(`${label} has an unnecessary previous-range disposition: ${address}`);
      continue;
    }
    if (!row || row.from !== editionDigest(old) || !scienceText(row.rationale)
        || !Array.isArray(row.ordinary) || !sameScienceValue(row.ordinary.map(block => block.from), old.ordinary))
      throw new Error(`${label} needs the exact previous range disposition: ${address}`);
    const path = address.split('#')[0];
    const prefix = path === '/print' ? printUnitAnchor(old.route) : chapterAnchorPrefix(old.route);
    for (const claim of old.claimIds) {
      const note = selected[`${path}#${chapterNoteAnchor(prefix, claim)}`];
      if (note?.kind !== 'note' || !sameScienceValue(note.claimIds, [claim]))
        throw new Error(`${label} lost an exact previous note target: ${claim}`);
    }
    for (const block of row.ordinary) {
      const target = selected[block.address];
      const targetPath = block.address?.split('#')[0];
      const blockKey = `${targetPath}#${block.targetId}`;
      const note = selected[blockKey];
      const paragraph = ordinaryTargets?.[blockKey];
      const correctParagraph = scienceDigest(block.to) && target?.ordinary.includes(block.to) && paragraph?.sha256 === block.to
        && paragraph.route === target.route;
      const correctClaim = scienceText(block.claimId) && target?.claimIds.includes(block.claimId) && note?.kind === 'note'
        && note.route === target.route && sameScienceValue(note.claimIds, [block.claimId]);
      if (!scienceText(block.rationale) || !correctParagraph && !correctClaim || Boolean(block.to) === Boolean(block.claimId))
        throw new Error(`${label} lacks the exact ordinary explanation destination: ${address}`);
    }
    dispositions.delete(address);
  }
  if (dispositions.size) throw new Error(`${label} includes unknown ranges in its history plan`);
  return { ...Object.fromEntries(Object.entries(actual).filter(([, row]) => !routes.includes(row.route))), ...previousAddresses };
}


export function observeScientificRawChanges(before, actual) {
  const at = (object, path) => path.split('.').reduce((value, key) => value[key], object);
  const rawRecords = [];
  for (const path of bindings.keys()) {
    const old = new Map(at(before, path).map(row => [row.id, row]));
    const current = new Map(at(actual, path).map(row => [row.id, row]));
    for (const id of new Set([...old.keys(), ...current.keys()])) {
      const from = old.get(id) ?? null, to = current.get(id) ?? null;
      if (sameScienceValue(from, to)) continue;
      if (to === null) throw new Error(`Scientific successor removed protected raw record: ${path} ${id}`);
      rawRecords.push({ path, id, from });
    }
  }
  const rawFields = [...metadata].map(path => ({ path, from: at(before, path), to: at(actual, path) }))
    .filter(row => !sameScienceValue(row.from, row.to));
  return { rawRecords, rawFields };
}
