import { editionDigest } from './reader-current-edition.mjs';

export const readableBookHostedHistoryDigest = '9f59bd1ca8781a060e5d35031978cb9ef9924e695000c588579481fdc1d21dca';
const address = row => `${row.path}#${row.id}`;
const unique = rows => new Set(rows).size === rows.length;
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

function captureEntry(row, edition) {
  const target = { route: row.route, path: row.path, id: row.id, kind: row.kind };
  if (row.kind === 'note') target.claimId = row.claimIds[0];
  return { route: row.route, path: row.path, id: row.id, targets: [target], mode: 'retained', edition, capturedScope: { title: row.title, claimIds: row.claimIds, ordinaryHashes: row.ordinaryHashes ?? [] } };
}

function addCapture(entries, capture) {
  const byAddress = new Map(entries.map(entry => [address(entry), { entry, claimIds: [] }]));
  if (byAddress.size !== entries.length || !unique(capture.entries.map(address)))
    throw new Error('Readable book historical addresses must be unique');
  const edition = { sourceCommit: capture.sourceCommit, sourceDate: capture.sourceDate };
  for (const row of capture.entries) {
    const existing = byAddress.get(address(row));
    if (!existing) {
      byAddress.set(address(row), { entry: captureEntry(row, edition), claimIds: row.claimIds });
    } else if (existing.entry.edition.sourceCommit === edition.sourceCommit
        || existing.entry.mode === 'retained' && !existing.entry.scope
          && existing.entry.targets.some(target => address(target) === address(row) && target.kind === row.kind)) {
      existing.claimIds = row.claimIds;
      if (!existing.entry.scope) existing.entry = { ...existing.entry, capturedScope: { title: row.title, claimIds: row.claimIds, ordinaryHashes: row.ordinaryHashes ?? [] } };
    }
  }
  const captured = new Map(capture.entries.map(row => [address(row), row]));
  for (const row of byAddress.values()) {
    if (row.claimIds.length || row.entry.scope || row.entry.targets.length !== 1) continue;
    const target = row.entry.targets[0];
    const native = captured.get(address(target));
    if (row.entry.mode === 'alias' && native?.kind === target.kind && native.route === target.route) {
      row.claimIds = native.claimIds;
      row.entry = { ...row.entry, capturedScope: { title: native.title, claimIds: native.claimIds, ordinaryHashes: native.ordinaryHashes ?? [] } };
    }
  }
  return byAddress;
}

function exactClaimScope(entry, capturedClaimIds) {
  const ids = (entry.scope?.targets ?? entry.targets).filter(row => row.kind === 'note').map(row => row.claimId);
  return [...new Set(ids.length ? ids : capturedClaimIds)];
}

export function describeReadableBookCitationSources(entries, capture, independentDigest = readableBookHostedHistoryDigest) {
  if (editionDigest(capture) !== independentDigest || capture.qualification !== 'actual-hosted-html-capture')
    throw new Error('Readable book requires its qualified hosted history');
  return [...addCapture(entries, capture)].map(([address, { entry, claimIds }]) => ({
    address, from: editionDigest(entry), entry, oldClaimIds: exactClaimScope(entry, claimIds),
    oldOrdinaryHashes: entry.capturedScope?.ordinaryHashes ?? [],
  }));
}

/** Legacy remappers qualify their source editions first; current migration can
 * then change exactly a known output address while retaining its attribution. */
export function qualifyReadableBookCitations(entries, capture, migrations = [], independentDigest = readableBookHostedHistoryDigest) {
  if (editionDigest(capture) !== independentDigest || capture.qualification !== 'actual-hosted-html-capture')
    throw new Error('Readable book requires its qualified hosted history');
  const byAddress = addCapture(entries, capture);
  if (!unique(migrations.map(row => row.address))) throw new Error('Readable book migration repeats a historical address');
  for (const row of migrations) {
    const fixed = byAddress.get(row.address);
    if (!fixed || row.from !== editionDigest(fixed.entry) || !nonempty(row.explanation)
        || !Array.isArray(row.targets) || !row.targets.length || !unique(row.targets.map(address))
        || !row.targets.every(target => nonempty(target.route) && nonempty(target.path) && nonempty(target.id)
          && ['chapter', 'heading', 'note-group', 'note'].includes(target.kind)
          && (target.label === undefined || nonempty(target.label))))
      throw new Error(`Readable book migration lacks exact historical identity or destinations: ${row.address}`);
    const expectedClaims = exactClaimScope(fixed.entry, fixed.claimIds);
    const actualClaims = row.targets.filter(target => target.kind === 'note').map(target => target.claimId);
    if (!unique(actualClaims) || expectedClaims.length !== actualClaims.length
        || expectedClaims.some((id, index) => actualClaims[index] !== id))
      throw new Error(`Readable book migration changes historical claim scope: ${row.address}`);
    const oldOrdinary = fixed.entry.capturedScope?.ordinaryHashes ?? [];
    const ordinary = row.ordinaryDispositions ?? [];
    const addresses = new Set(row.targets.map(address));
    if (!Array.isArray(ordinary) || ordinary.length !== oldOrdinary.length
        || ordinary.some((item, index) => item.oldSha256 !== oldOrdinary[index] || !nonempty(item.rationale)
          || !Array.isArray(item.destinations) || !item.destinations.length
          || !unique(item.destinations.map(destination => destination.address))
          || item.destinations.some(destination => !addresses.has(destination.address)
            || (hash(destination.currentSha256) ? destination.claimId !== undefined
              : !nonempty(destination.claimId) || destination.currentSha256 !== undefined))))
      throw new Error(`Readable book migration lacks exact ordinary-text dispositions: ${row.address}`);
    const native = row.targets.find(target => address(target) === row.address);
    if (native && (native.route !== fixed.entry.route || native.kind !== fixed.entry.targets[0]?.kind))
      throw new Error(`Readable book migration native target differs in unit or kind: ${row.address}`);
    const oldTitle = fixed.entry.targets[0]?.kind === 'heading' ? fixed.entry.capturedScope?.title : null;
    const explanation = oldTitle ? `旧节“${oldTitle}”。${row.explanation}` : row.explanation;
    fixed.entry = native
      ? { ...fixed.entry, mode: 'retained', targets: [native], scope: { text: explanation, targets: row.targets }, ordinaryDispositions: ordinary }
      : { ...fixed.entry, mode: 'notice', targets: row.targets, scope: { text: explanation, targets: row.targets }, ordinaryDispositions: ordinary };
  }
  return [...byAddress.values()].map(row => row.entry);
}
