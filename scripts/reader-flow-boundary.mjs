import { createHash } from 'node:crypto';
import { editionDigest, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { flowBoundarySource, flowBoundaryPredecessorPin, flowBoundaryAddressPin, flowBoundaryGuidePin } from './reader-flow-boundary-pins.mjs';
import partialHistory from '../config/exchange-semantics-partial-history.json' with { type: 'json' };
import { printUnitAnchor, chapterAnchorPrefix, chapterNoteAnchor } from './reader-book.mjs';

export const flowBoundaryGuide = 'coverage/index.html';
export const flowBoundaryChapter = '/docs/book/exchange-semantics-and-conversion';
export const flowBoundaryRoutes = [flowBoundaryChapter, '/docs/flows', '/docs/characterization'];
const managedFiles = new Set([
  ...flowBoundaryRoutes.map(route => `content${route}.mdx`),
  'config/book-edition.json', 'config/reader-numbering.json',
]);
const families = /^(claims|evidence|sources|concepts|mappings|coverage|readings|literature|queries|revisions|gaps|literatureGaps):[a-z0-9][a-z0-9-]+$/;
const derivedRecords = /^(researchMetadata:order:(claims|evidence|sources|concepts|mappings|coverage|readings|literature|queries|revisions|gaps|literatureGaps)|researchMetadata:public-projection)$/;
const aggregateRecords = new Set(['researchMetadata:reading-ledger', 'researchMetadata:literature-map']);
const recordOrder = /^(researchMetadata:order:|researchMetadata:public-projection$)/;
const digest = value => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
const text = value => typeof value === 'string' && Boolean(value.trim());
const same = (a, b) => editionDigest(a ?? null) === editionDigest(b ?? null);
// Article review receipts cover actual bodies, including changes to earlier
// chapters caused solely by a current note number or destination label.
const outputKey = row => `${row.path}#${row.route}`;
const numberedDigest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function unique(rows, identity) {
  return new Set(rows.map(identity)).size === rows.length;
}

/** Runtime preview is opt-in and production has no fallback for a rejected unit. */
export function selectFlowBoundary(config, pin, preview = false) {
  if (!config || config.schemaVersion !== 1) throw new Error('Flow boundary requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const unit = config.unit;
  if (unit?.id !== 'flow-boundary-99' || !same(unit.source, flowBoundarySource)
      || !text(unit.rationale) || !Array.isArray(unit.scope) || !unit.scope.length
      || !unit.scope.every(text) || !unique(unit.scope, id => id)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts) || !Array.isArray(unit.chapterSections))
    throw new Error('Flow boundary requires its exact predecessor and change plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !digest(pin) || editionDigest(unit) !== pin)
    throw new Error('Flow boundary is not independently accepted');
  return unit;
}

function flowBoundaryChanges(unit) {
  const declared = new Set(unit.scope);
  const changes = { file: new Map(), record: new Map() };
  for (const row of unit.changes) {
    const table = changes[row.kind];
    if (!table || !declared.has(row.key) || !text(row.rationale) || table.has(row.key)
        || same(row.from, row.to) || row.to === null || row.to === undefined)
      throw new Error(`Flow boundary has an invalid or repeated change: ${row.key}`);
    if (row.kind === 'file' ? !managedFiles.has(row.key) || !digest(row.from) || !digest(row.to)
      : !families.test(row.key) && !derivedRecords.test(row.key) && !aggregateRecords.has(row.key))
      throw new Error(`Flow boundary change is outside the publication scope: ${row.key}`);
    if (row.kind === 'record' && [row.to, ...(row.from === null ? [] : [row.from])].some(value =>
      !digest(value?.raw) || !digest(value?.protected) || value.public !== null && !digest(value.public)))
      throw new Error(`Flow boundary lacks exact raw and public record fingerprints: ${row.key}`);
    if (row.kind === 'record' && row.from !== null && /^(claims|evidence):/.test(row.key))
      throw new Error(`Flow boundary cannot alter a protected claim or evidence record: ${row.key}`);
    table.set(row.key, row);
  }
  return changes;
}

function affectedRows(before, after, changes) {
  const seeds = [...changes.keys()].filter(key => !recordOrder.test(key) && !aggregateRecords.has(key)).map(key => key.slice(key.indexOf(':') + 1));
  const owned = new Set([...changes.keys()].filter(key => key.startsWith('claims:')).map(key => key.slice(7)));
  const seen = new Set(seeds);
  for (const id of seen) {
    for (const next of [...(before.dependencies[id] ?? []), ...(after.dependencies[id] ?? [])]) seen.add(next);
  }
  const required = [...new Set([...before.publishedClaims, ...after.publishedClaims])].filter(id => seen.has(id));
  return { required: required.filter(id => !owned.has(id)), all: required };
}

export function observeFlowBoundaryChanges(before, after, changes) {
  return affectedRows(before, after, new Map(changes.filter(row => row.kind === 'record').map(row => [row.key, row]))).required;
}

/** Reverse only exact admitted differences. The complete old fingerprints are
 * additionally qualified by the original #95 and #93 predicates. */
export function prepareFlowBoundarySource(unit, actual, structure, pin = flowBoundaryPredecessorPin, { readings, catalog } = {}) {
  const byKind = flowBoundaryChanges(unit);
  validateRetainedRecords('sources', byKind.record, unit.previousSources ?? [], catalog?.sources, (before, after) => {
    const metadata = ({ reading, ...identity }) => {
      const { scope, checkedAt, ...readingIdentity } = reading ?? {};
      return { ...identity, reading: readingIdentity };
    };
    if (!same(metadata(before), metadata(after)))
      throw new Error(`Flow boundary changed an original source's bibliographic or carrier identity: ${before.id}`);
  });
  validateFlowBoundaryReadingContinuity(unit, byKind.record, readings);
  const { before, after } = unit.state ?? {};
  const actualState = { ...actual, structure };
  if (!digest(pin) || before?.digest !== pin)
    throw new Error('Flow boundary requires the independently observed predecessor source state');
  const previous = { ...actualState, files: { ...actual.files }, records: { ...actual.records },
    structure: { ...structure, files: { ...structure.files } }, sourceOccurrences: { ...actual.sourceOccurrences } };
  for (const [kind, field] of [['file', 'files'], ['record', 'records']]) {
    for (const row of byKind[kind].values()) {
      if (!same(actual[field][row.key], row.to)) throw new Error(`Flow boundary successor differs from actual source: ${row.key}`);
      if (row.from === null) delete previous[field][row.key];
      else previous[field][row.key] = row.from;
    }
  }

  if (!Array.isArray(unit.structure) || !unique(unit.structure, row => row.key)
      || !Array.isArray(unit.occurrences) || !unique(unit.occurrences, row => row.key))
    throw new Error('Flow boundary repeats or lacks an exact source structure or occurrence inventory');
  for (const { key, from, to } of unit.structure) {
    if (!managedFiles.has(key) || !byKind.file.has(key) || !digest(from) || !digest(to)
        || previous.structure.files[key] !== to || from === to)
      throw new Error(`Flow boundary altered an unlisted protected source shape: ${key}`);
    previous.structure.files[key] = from;
  }
  for (const { key, from, to } of unit.occurrences) {
    if (!managedFiles.has(key) || !byKind.file.has(key) || !same(actual.sourceOccurrences[key], to)
        || !Array.isArray(from) || !Array.isArray(to) || !unique(to, id => id)
        || from.some(id => !to.includes(id)))
      throw new Error(`Flow boundary loses or repeats a predecessor subsection claim: ${key}`);
    previous.sourceOccurrences[key] = from;
  }
  previous.structure.claims = before.protectedClaims;
  previous.dependencies = before.dependencies;
  previous.publishedClaims = before.publishedClaims;
  const { required, all } = affectedRows(previous, actual, byKind.record);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== required.length
      || unit.consumers.some(row => !required.includes(row.id) || !text(row.rationale)))
    throw new Error('Flow boundary lacks exact reviewed before/after dependent consumers');
  function verifyCurrentState() {
    if (editionDigest(previous) !== pin) throw new Error('Flow boundary cannot reconstruct the independently observed predecessor');
    if (!same(after?.digest, editionDigest(actualState)))
      throw new Error('Flow boundary requires an exact observed successor source state');
  }
  return { previous, affectedClaimIds: all, verifyCurrentState };
}



export function qualifyFlowBoundarySource(unit, actual, structure, pin, records) {
  const { verifyCurrentState, ...result } = prepareFlowBoundarySource(unit, actual, structure, pin, records);
  verifyCurrentState();
  return result;
}

function validateRetainedRecords(kind, changes, retained, observed, verify) {
  const prefix = `${kind}:`;
  const existing = [...changes.values()].filter(row => row.from !== null && row.key.startsWith(prefix));
  if (!Array.isArray(retained) || !unique(retained, row => row.id) || retained.length !== existing.length)
    throw new Error(`Flow boundary needs exact previous records for every extended original ${kind} entry`);
  for (const row of existing) {
    const id = row.key.slice(prefix.length);
    const before = retained.find(record => record.id === id);
    const after = observed?.find(record => record.id === id);
    if (!before || editionDigest(before) !== row.from.raw || !after || editionDigest(after) !== row.to.raw)
      throw new Error(`Flow boundary ${kind} entry is not bound to both exact records: ${id}`);
    verify(before, after);
  }
}

function validateFlowBoundaryReadingContinuity(unit, changes, readings) {
  validateRetainedRecords('readings', changes, unit.previousReadings ?? [], readings?.readings, (before, after) => {
    const readingMetadata = ({ artifacts, passages, sourceKeys, appraisal, unread, checkedAt, ...identity }) => identity;
    if (!same(readingMetadata(before), readingMetadata(after)))
      throw new Error(`Flow boundary changed an original reading's work, acquisition, or reading identity: ${before.id}`);
    for (const field of ['artifacts', 'passages', 'sourceKeys']) {
      const old = before[field] ?? [], current = after[field] ?? [];
      if (!same(old, current.slice(0, old.length)))
        throw new Error(`Flow boundary changed an original reading's ${field} instead of appending: ${before.id}`);
    }
  });
}

/** Change only reviewed titles and heading slots on the three reader routes. */
export function flowBoundaryNumbering(unit, actual, predecessorDigest) {
  if (!unit) return predecessorDigest;
  const { before, after, titles } = unit.numbering ?? {};
  if (!before || !after || !Array.isArray(titles) || !unique(titles, row => row.route))
    throw new Error('Flow boundary lacks exact before/after numbering');
  const projected = structuredClone(actual);
  for (const route of flowBoundaryRoutes) {
    if (!same(actual.headings[route], after[route]) || !Array.isArray(before[route])
        || !before[route].every(old => after[route].some(row => row.id === old.id && row.depth === old.depth && row.type === old.type)))
      throw new Error(`Reader numbering differs from the independently pinned flow boundary hierarchy or lost a native heading: ${route}`);
    projected.headings[route] = before[route];
  }
  for (const { route, from, to } of titles) {
    if (!flowBoundaryRoutes.includes(route) || !text(from) || !text(to) || from === to)
      throw new Error(`Flow boundary has an invalid title transition: ${route}`);
    const units = [...projected.web, ...projected.book].filter(row => row.key === route);
    if (!units.length || units.some(unit => unit.title !== to)) throw new Error(`Reader numbering differs from the independently pinned flow boundary title between reading surfaces: ${route}`);
    for (const row of units) row.title = from;
  }
  if (numberedDigest(projected) !== predecessorDigest)
    throw new Error('Reader numbering differs from the independently pinned inventory outside the reviewed flow boundary headings');
  return numberedDigest(actual);
}

export function flowBoundaryTitle(unit, route, predecessor) {
  const title = unit?.numbering.titles.find(row => row.route === route);
  if (!title) return predecessor;
  if (title.from !== predecessor) throw new Error(`Flow boundary has a stale predecessor title: ${route}`);
  return title.to;
}

export function flowBoundarySections(unit, predecessor) {
  if (!unit) return predecessor;
  const headings = unit.numbering?.after?.[flowBoundaryChapter]?.filter(row => row.type === 'mdx' && row.depth === 2)
    .map(({ id, title }) => ({ id, title }));
  if (!headings || !same(headings.map(row => row.id), predecessor.map(row => row.id)))
    throw new Error('Flow boundary lacks the original four formal B08 section identities');
  return headings;
}

export function effectiveFlowBoundary(predecessor, unit, affectedClaimIds) {
  if (!unit) return predecessor;
  const declared = flowBoundaryChanges(unit);
  const changes = { file: new Map(predecessor.changes.file), record: new Map(predecessor.changes.record) };
  for (const [kind, table] of Object.entries(declared)) for (const row of table.values()) {
    const original = changes[kind].get(row.key);
    if (original && !same(original.to, row.from)) throw new Error(`Flow boundary change has a stale accepted predecessor: ${row.key}`);
    changes[kind].set(row.key, { ...row, from: original ? original.from : row.from, intermediate: row.from });
  }
  function outputs(previous, rows, identity) {
    const result = new Map(previous);
    if (!unique(rows, identity)) throw new Error('Flow boundary repeats an actual output identity');
    for (const row of rows) {
      const key = identity(row);
      const before = result.get(key)?.sha256 ?? (key === flowBoundaryGuide ? flowBoundaryGuidePin : null);
      if (before !== row.from || !digest(row.sha256) || !text(row.rationale) || row.sha256 === row.from)
        throw new Error(`Flow boundary differs from the accepted artifact predecessor: ${key}`);
      result.set(key, row);
    }
    return result;
  }
  return {
    ...predecessor, changes, flowBoundary: unit,
    affectedClaimIds: [...new Set([...predecessor.affectedClaimIds ?? [], ...affectedClaimIds])],
    researchChanged: true,
    outputs: outputs(predecessor.outputs, unit.outputs, outputKey),
    publicArtifacts: outputs(predecessor.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function verifyFlowBoundaryReceipts(unit, artifacts) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: flowBoundaryRoutes, history: unit.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.currentAddresses },
  };
  if (!unit.outputs.length || !unit.publicArtifacts.some(row => row.path === flowBoundaryGuide)
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  return unit.reviewEvidence.every(row => {
    const evidenceRoot = '_docs/editorial/review-evidence/flow-boundary-99';
    if (row.date < flowBoundarySource.date
        || row.reportFile !== `${evidenceRoot}/${row.kind}-report.json`
        || row.artifactFile !== `${evidenceRoot}/${row.kind}-artifact.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations: observation } = artifact;
    if (row.kind === 'output' && (!actualPublicArtifactEvidence(unit, observation)
      || ['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key)))) return false;
    return observation && Object.entries(expected[row.kind]).every(([key, value]) => same(observation[key], value));
  });
}

function actualPublicArtifactEvidence(unit, observation) {
  if (!observation || observation.source !== 'actual-export'
      || ['previewDownloads', 'forecast'].some(key => Object.hasOwn(observation, key))
      || !Array.isArray(observation.artifactFiles)) return false;
  const urls = unit.publicArtifacts.map(row => row.path);
  if (!unique(observation.artifactFiles, row => row.path)
      || !same(observation.artifactFiles.map(row => row.path), urls)) return false;
  return observation.artifactFiles.every((row, index) =>
    row.sha256 === unit.publicArtifacts[index].sha256 && Number.isSafeInteger(row.bytes) && row.bytes > 0);
}

export function flowBoundaryNoteTarget(path, route, claimId) {
  const prefix = path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route);
  return { path, route, id: chapterNoteAnchor(prefix, claimId), kind: 'note', claimId };
}

/** Bind every pre-existing native address before considering any migration. */
export function flowBoundaryHistory(unit, pin = flowBoundaryAddressPin) {
  if (!unit) return new Map();
  const { previousAddresses, currentAddresses, history, ordinaryTargets } = unit;
  if (!digest(pin) || editionDigest(previousAddresses) !== pin || !currentAddresses || !Array.isArray(history)
      || !unique(history, row => row.address) || !ordinaryTargets)
    throw new Error('Flow boundary requires the independently captured predecessor citation ranges');
  const rows = new Map(history.map(row => [row.address, row]));
  for (const [address, previous] of Object.entries(previousAddresses)) {
    const current = currentAddresses[address];
    const row = rows.get(address);
    if (!current || current.kind !== previous.kind || current.route !== previous.route
        || current.chapter !== previous.chapter || previous.kind === 'note' && !same(previous.claimIds, current.claimIds))
      throw new Error(`Flow boundary lost or changed a native citation identity: ${address}`);
    if (previous.kind === 'note' || same(previous, current)) {
      if (row) throw new Error(`Flow boundary has an unnecessary history amendment: ${address}`);
      continue;
    }
    if (!row || !text(row.rationale) || !same(row.from, editionDigest(previous))
        || !Array.isArray(row.ordinary) || row.ordinary.length !== previous.ordinary.length)
      throw new Error(`Flow boundary has no reviewed disposition for its exact previous range: ${address}`);
    for (const [index, block] of row.ordinary.entries()) {
      const destination = currentAddresses[block.address];
      const path = block.address?.split('#')[0], route = destination?.route;
      const noteId = path && route && block.claimId ? flowBoundaryNoteTarget(path, route, block.claimId).id : null;
      const ordinaryPrefix = path && route && flowBoundaryOrdinaryId(route, path === '/print', '');
      if (previous.ordinary[index] !== block.from || !text(block.rationale)
          || (!digest(block.to) || !destination?.ordinary.includes(block.to)
            || !ordinaryPrefix || !block.targetId?.startsWith(ordinaryPrefix) || !/^\d+$/.test(block.targetId.slice(ordinaryPrefix.length))
            || ordinaryTargets[`${path}#${block.targetId}`] !== block.to)
            && (!text(block.claimId) || !destination?.claimIds.includes(block.claimId) || block.targetId !== noteId)
          || Boolean(block.to) === Boolean(block.claimId))
        throw new Error(`Flow boundary has an unresolved previous ordinary explanation: ${address}`);
    }
    for (const claimId of previous.claimIds) {
      const path = address.split('#')[0];
      const target = flowBoundaryNoteTarget(path, previous.route, claimId);
      if (!same(currentAddresses[`${target.path}#${target.id}`]?.claimIds, [claimId]))
        throw new Error(`Flow boundary has lost the exact previous note destination: ${target.id}`);
    }
    rows.set(address, { ...row, previous, current });
  }
  if ([...rows.keys()].some(address => !Object.hasOwn(previousAddresses, address)))
    throw new Error('Flow boundary contains an unknown previous address');
  return rows;
}

/** Keep #95 validators on their independently observed predecessor, after
 * the current output has verified its new addresses and dated notices. */
export function projectFlowBoundaryHistory(addresses, unit) {
  if (!unit) return addresses;
  flowBoundaryHistory(unit);
  const result = { ...addresses };
  const managed = new Set(flowBoundaryRoutes);
  const actual = Object.fromEntries(Object.entries(addresses).filter(([, row]) => managed.has(row.route)));
  if (!same(actual, unit.currentAddresses))
    throw new Error('Flow boundary observed native history differs from the reviewed current output');
  for (const key of Object.keys(actual)) delete result[key];
  for (const [address, row] of Object.entries(result)) {
    const oldOrdinary = flowBoundaryPreviousPointerOrdinary(address, row.ordinary, unit);
    if (oldOrdinary !== row.ordinary) result[address] = { ...row, ordinary: oldOrdinary };
  }
  return { ...result, ...unit.previousAddresses };
}

export function flowBoundaryHistoryControls(unit) {
  const ranges = flowBoundaryHistory(unit);
  const controls = new Map();
  for (const [address, row] of ranges) {
    const pair = ['chapter', 'reading-title'].includes(row.previous.kind)
      && [...controls.values()].find(control => {
        const earlier = control.row;
        return ['chapter', 'reading-title'].includes(earlier.previous.kind)
          && earlier.address.split('#')[0] === address.split('#')[0]
          && earlier.previous.route === row.previous.route
          && earlier.previous.title === row.previous.title
          && same(earlier.previous.claimIds, row.previous.claimIds)
          && same(earlier.previous.ordinary, row.previous.ordinary)
          && same(flowBoundaryOrdinaryTargets(earlier), flowBoundaryOrdinaryTargets(row));
      });
    if (pair) pair.addresses.push(address);
    else controls.set(address, { row, addresses: [address] });
  }
  return controls;
}

export function flowBoundaryHistoryTargets(row) {
  const path = row.address.split('#')[0];
  return row.previous.claimIds.map(id => flowBoundaryNoteTarget(path, row.previous.route, id));
}

export function flowBoundaryOrdinaryId(route, print, index) {
  if (!flowBoundaryRoutes.includes(route)) return undefined;
  const prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route);
  return `${prefix}-flow-99-ordinary-${index}`;
}

export function flowBoundaryOrdinaryTargets(row) {
  return row.ordinary.map((block, index) => {
    const separator = block.address.indexOf('#');
    const path = block.address.slice(0, separator);
    return { path, id: block.targetId, label: `原说明 ${index + 1} 的现行位置`, digest: block.to, claimId: block.claimId };
  });
}

export function flowBoundaryOrdinaryDigest(node) {
  const links = node.querySelectorAll('a[href]').map(link => [link.text, link.getAttribute('href')]);
  return editionDigest({ tag: node.tagName, text: node.text.replace(/\s+/g, ' ').trim(), links });
}

function visibleHistoryControl(node, expandable = null) {
  for (let current = node; current?.nodeType === 1; current = current.parentNode) {
    if (current.hasAttribute('hidden') || current.hasAttribute('inert') || current.getAttribute('aria-hidden')?.toLowerCase() === 'true'
        || /(?:^|[;\s])(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|opacity\s*:\s*0(?:[;\s]|$)|content-visibility\s*:\s*hidden)/i.test(current.getAttribute('style') ?? '')
        || (current.getAttribute('class') ?? '').split(/\s+/).some(name => /^(?:hidden|invisible|collapse|sr-only|opacity-0|pointer-events-none)$/.test(name))
        || (current !== node && current !== expandable && current.tagName === 'DETAILS' && !current.hasAttribute('open')
          && node.closest('summary') !== current.querySelector('summary'))) return false;
  }
  return Boolean(node);
}

export function validateFlowBoundaryHistoryOutput(documents, unit) {
  if (!unit) return [];
  const expected = flowBoundaryHistoryControls(unit);
  const observed = new Set(), ordinary = {};
  const errors = [];
  for (const [path, document] of documents) {
    for (const block of document.querySelectorAll('p[id]').filter(node => /-flow-99-ordinary-\d+$/.test(node.id))) {
      ordinary[`${path}#${block.id}`] = flowBoundaryOrdinaryDigest(block);
    }
    const native = new Map(document.querySelectorAll('[id]').map(node => [node.id, node]));
    for (const notice of document.querySelectorAll('[data-flow-boundary-history]')) {
      const id = notice.getAttribute('data-flow-boundary-history');
      const key = `${path}#${id}`;
      const control = expected.get(key), row = control?.row, target = native.get(id);
      const time = notice.querySelector('time');
      const sourceLinks = notice.querySelectorAll('a[data-flow-boundary-source]');
      const notes = notice.querySelectorAll('a[data-flow-boundary-note]');
      const links = notes.map(link => link.getAttribute('href'));
      const summary = notice.querySelector('summary');
      const ordinaryLinks = notice.querySelectorAll('a[data-flow-boundary-ordinary]');
      const ordinaryTargets = row ? flowBoundaryOrdinaryTargets(row) : [];

      let previous = notice.previousElementSibling;
      while (previous?.getAttribute('data-copyedit-history') === id || previous?.getAttribute('data-legacy-scope') === id) {
        previous = previous.previousElementSibling;
      }
      const attached = target && (target === notice.parentNode || target === previous
        || ['chapter', 'reading-title'].includes(row?.previous.kind) && target.closest('article') === notice.closest('article'));
      const origins = control?.addresses.map(address => address.slice(path.length + 1));
      if (!row || observed.has(key) || !attached || notice.tagName !== 'DETAILS'
          || notice.getAttribute('data-flow-boundary-origins') !== origins.join(' ')
          || origins.some(origin => {
            const node = native.get(origin);
            return !visibleHistoryControl(node) || node.closest('article') !== notice.closest('article');
          })
          || summary?.text !== `${flowBoundarySource.date} 版「${row.previous.title}」的引用范围`
          || time?.text !== flowBoundarySource.date || time.getAttribute('datetime') !== flowBoundarySource.date
          || sourceLinks.length !== 1 || sourceLinks[0].getAttribute('href')
            !== `https://github.com/tiangong-lca/knowledge-base/tree/${flowBoundarySource.commit}`
          || [...sourceLinks, ...notes, ...ordinaryLinks].some(link => !visibleHistoryControl(link, notice))
          || !same(links, flowBoundaryHistoryTargets(row).map(item => `#${encodeURIComponent(item.id)}`))
          || !same(ordinaryLinks.map(link => link.getAttribute('href')), ordinaryTargets.map(item =>
            `${item.path === path ? '' : `${item.path}/`}#${encodeURIComponent(item.id)}`))
          || ordinaryTargets.some(item => {
            const targets = documents.get(item.path)?.querySelectorAll('[id]').filter(node => node.id === item.id) ?? [];
            const node = targets[0];
            return targets.length !== 1 || !visibleHistoryControl(node) || (item.claimId
              ? node.getAttribute('data-reader-claim') !== item.claimId
              : node.tagName !== 'P' || flowBoundaryOrdinaryDigest(node) !== item.digest);
          })
          || !same(ordinaryLinks.map(link => link.text), ordinaryTargets.map(item => item.label))
          || !visibleHistoryControl(summary) || !visibleHistoryControl(target))
        errors.push(`Flow boundary has a missing or invalid dated scope control: ${key}`);
      observed.add(key);
    }
  }
  if (!same(ordinary, unit.ordinaryTargets))
    errors.push('Flow boundary actual versioned ordinary targets differ from the reviewed inventory');
  for (const key of expected.keys()) if (!observed.has(key)) errors.push(`Flow boundary historical range was not rendered: ${key}`);
  return errors;
}

/** Earlier passage validation still uses the captured old text scope; current
 * identities and independent old-scope controls were checked before this view. */
export function flowBoundaryPreviousSurface(address, actual, unit) {
  const previous = unit?.previousAddresses[address];
  if (!actual) return actual;
  if (!previous) {
    const ordinary = flowBoundaryPreviousPointerOrdinary(address, actual.ordinaryHashes, unit);
    return ordinary === actual.ordinaryHashes ? actual : { ...actual, ordinaryHashes: ordinary };
  }
  return { ...actual, claimIds: previous.claimIds, ordinaryHashes: previous.ordinary,
    ...(previous.kind === 'chapter' || previous.kind === 'note-group' ? { title: previous.title } : {}),
    ...(previous.kind === 'heading' ? { visibleHeading: previous.title } : {}) };
}

export function flowBoundaryOrdinaryDispositions(unit, previous) {
  if (!unit?.chapterOrdinary) return previous;
  const { from, to } = unit.chapterOrdinary;
  if (from !== editionDigest(previous) || !Array.isArray(to) || to.length !== previous.length
      || previous.some((row, index) => row.oldUnit !== to[index].oldUnit || row.block !== to[index].block
        || !text(to[index].reviewRationale) || !(to[index].claimIds?.length || to[index].navigation?.length)
        || !same(row.claimIds, to[index].claimIds)
        || !same(row.navigation?.map(link => link.href), to[index].navigation?.map(link => link.href))
        || (to[index].claimDestinations !== undefined && (!same(to[index].claimDestinations.map(value => value.id), row.claimIds)
          || to[index].claimDestinations.some(value => !text(value.section))))))
    throw new Error('Flow boundary lacks exact dispositions for all fourteen original B08 explanations');
  return to;
}

/** Dated text and native destinations are retained; labels describe the
 * current headings and note numbers on the actual destination surface. */
export function flowBoundaryCitationEntries(entries, unit) {
  if (!unit) return entries;
  function currentLabel(target) {
    if (!target.label || !flowBoundaryRoutes.includes(target.route)) return target;
    const { label, ...destination } = target;
    return destination;
  }
  return entries.map(entry => ({
    ...entry,
    targets: entry.targets.map(currentLabel),
    ...(entry.scope && { scope: { ...entry.scope, targets: entry.scope.targets.map(currentLabel) } }),
  }));
}

/** One adjacent S01 print paragraph displays B08's exact current title.
 * Project only that fixed pointer back when running the old scope checks. */
function flowBoundaryPreviousPointerOrdinary(address, hashes, unit) {
  const route = '/docs/history';
  const anchor = printUnitAnchor(route);
  const pointer = partialHistory.projection.find(row => row.claimId === 'cl-waste-history' && row.route === flowBoundaryChapter);
  const title = unit?.numbering?.titles.find(row => row.route === flowBoundaryChapter);
  const previousAddresses = [`/print#${anchor}`, `/print#${anchor.replace(/^print-unit-/, 'print-reading-unit-')}`,
    `/print#${anchor}-${pointer.sourceHeading}`];
  if (!title || !hashes || !previousAddresses.includes(address)) return hashes;
  const previousText = pointer.text;
  if (!previousText.endsWith(`见《${title.from}》的相应论述与注释。`))
    throw new Error('Flow boundary S01 pointer has the wrong historical title');
  const newText = previousText.replace(`见《${title.from}》`, `见《${title.to}》`);
  const target = flowBoundaryNoteTarget('/print', flowBoundaryChapter, pointer.claimId);
  const fingerprint = text => editionDigest({ tag: 'P', text, links: [[text, `#${target.id}`]] });
  const currentHash = fingerprint(newText);
  if (hashes.filter(value => value === currentHash).length !== 1)
    throw new Error(`Flow boundary S01 pointer lacks its exact current title and destination: ${address}`);
  return hashes.map(value => value === currentHash ? fingerprint(previousText) : value);
}
