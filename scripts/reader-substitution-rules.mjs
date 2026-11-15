import capturedExport from '../config/reader-substitution-rules-capture.json' with { type: 'json' };
import { editionDigest, inspectReadableBookEdition, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';

export const substitutionRulesId = 'substitution-rules-105';
/** @type {string|null} */
export const substitutionRulesUnitPin = null;
export const substitutionRulesSource = Object.freeze({
  commit: 'f8751d57989bfca5f53b6beeab74895d54b594b2', tree: '0dd3ed9524b8fe8085f71afc962960ae309a62ce',
  manifest: 'e5827ae9f67c232cee88e714d7ddc957687a1c2d534535cb144c78d548698f7e', date: '2026-11-15',
});
export const substitutionRulesPredecessorPin = '40319e429ee4aa78c6eeefcdbbd1f751746253538862fb0cffb6c767a1696b88';
export const substitutionRulesAddressPin = 'c8a07217e93a0c42a5f8111f31820053fcbb25b3d2274894347bd3eb1e16339a';
// Independent pin derived by rehashing the retained ordinary exporter output.
const actualExportCapturePin = 'e8d6a6ef05637b5156f838b6ba6c6ca42c31870ef71c7da8d33302df041f4772';
export const substitutionRulesSources = ['/monograph/joint-production', '/docs/book/allocation-judgment-and-corrections'];
export const substitutionRulesRoutes = ['book-joint-production', substitutionRulesSources[1]];
const managed = new Set(substitutionRulesSources.map(route => `content${route}.mdx`));
const publishedReadings = new Set(['rd-ilcd-2010', 'rd-kb44-ec2021']);
const publishedSources = new Set(['src-book-ilcd-2010', 'src-kb44-ec2021']);
const layouts = new Set(substitutionRulesSources.flatMap(route => [`B10:${route}:occurrences`, `B10:${route}:source`]));
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

const allowsRaw = (family, id, previous) => {
  if (family === 'claims') return previous === null && id.startsWith('cl-sub105-');
  if (family === 'evidence') return previous === null && id.startsWith('ev-sub105-');
  if (family === 'readings') return publishedReadings.has(id) || previous === null && id.startsWith('rd-sub105-');
  if (family === 'sources') return publishedSources.has(id) || previous === null && id.startsWith('src-sub105-');
  return ['queries', 'revisions', 'gaps', 'literature', 'literatureGaps'].includes(family) && previous === null;
};

export function selectSubstitutionRules(config, pin = substitutionRulesUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Substitution rules requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== substitutionRulesId || !sameScienceValue(unit.source, substitutionRulesSource)
      || !sameScienceValue(unit.routes, substitutionRulesRoutes) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.layouts) || !unique(unit.layouts, row => row.key) || unit.layouts.some(row => !layouts.has(row.key))
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Substitution rules requires the exact precursor and bounded B10 review plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Substitution rules is not independently accepted');
  return unit;
}

/** Recreate the original raw #102 records before recomputing its receipts. */
export function prepareSubstitutionRulesSource(unit, input, actual, structure, predecessorPin = substitutionRulesPredecessorPin) {
  const scope = new Set(unit.scope), file = new Map(), record = new Map();
  for (const row of unit.changes) {
    const table = row.kind === 'file' ? file : row.kind === 'record' ? record : null;
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!table || table.has(row.key) || !scope.has(row.key) || !scienceText(row.rationale)
      || row.to == null || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Substitution rules lacks an exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && (!managed.has(row.key) || !scienceDigest(row.from)))
      throw new Error(`Substitution rules cannot modify an unrelated or protected file: ${row.key}`);
    table.set(row.key, row);
  }
  if (file.size !== managed.size || scope.size !== unit.changes.length)
    throw new Error('Substitution rules must bind both actual B10 sources and only declared changes');
  const raw = { catalog: input.catalog, readings: input.readings, literature: input.literature };
  const previousRecords = restoreScientificRecords(raw, unit.rawRecords, unit.rawFields, record, allowsRaw);
  const previous = inspectReadableBookEdition({ ...previousRecords, files: input.files });
  const priorStructure = copyeditSourceStructure({ ...previousRecords, files: input.files });
  const occurrences = unit.previousOccurrences ?? {};
  if (Object.keys(occurrences).length !== managed.size)
    throw new Error('Substitution rules lacks original canonical occurrences');
  for (const [path, row] of file) {
    if (!Array.isArray(occurrences[path]) || !sameScienceValue(
      actual.sourceOccurrences[path].filter(id => occurrences[path].includes(id)), occurrences[path]))
      throw new Error(`Substitution rules changed a prior passage identity or relative order: ${path}`);
    previous.files[path] = row.from;
    previous.sourceOccurrences[path] = occurrences[path];
  }
  const verifyCurrentState = () => {
    if (unit.state?.before !== predecessorPin || editionDigest({ ...previous, structure: priorStructure }) !== predecessorPin)
      throw new Error('Substitution rules did not reconstruct the independently observed raw f8751d5 state');
    if (unit.state?.after !== editionDigest({ ...actual, structure }))
      throw new Error('Substitution rules actual source state differs from the reviewed candidate');
  };
  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger','researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Substitution rules requires exact consumer review across both states');
  const affectedClaimIds = [...new Set([...consumers, ...seeds.filter(row => row.key.startsWith('claims:')).map(row => row.key.slice(7))])];
  return { previous, previousRecords, structure: priorStructure, affectedClaimIds, verifyCurrentState };
}

export function substitutionRulesLayout(unit, key, accepted) {
  const row = unit?.layouts.find(item => item.key === key);
  if (!row) return accepted;
  if (key.endsWith(':source')) {
    const approved = { ...accepted, description: row.to?.description };
    const intro = accepted.ordinary?.[0], current = row.to?.ordinary?.[0];
    if (key === `B10:${substitutionRulesSources[1]}:source` && intro && !intro.section
        && !intro.navigation?.length && scienceText(current?.text)) {
      approved.ordinary = [{ ...intro, text: current.text }, ...accepted.ordinary.slice(1)];
    }
    if (row.from !== editionDigest(accepted) || !scienceText(row.rationale) || !scienceText(row.to?.description)
        || sameScienceValue(row.to, accepted) || !sameScienceValue(row.to, approved))
      throw new Error(`Substitution rules can change only its reviewed B10 description or fine-page introduction: ${key}`);
    return row.to;
  }
  const before = new Set(accepted.map(item => item.id));
  if (row.from !== editionDigest(accepted) || !scienceText(row.rationale) || !Array.isArray(row.to)
      || !unique(row.to, item => item.id) || !sameScienceValue(row.to.filter(item => before.has(item.id)), accepted)
      || row.to.some(item => !before.has(item.id) && !item.id.startsWith('cl-sub105-')))
    throw new Error(`Substitution rules changed an original B10 position or lacks exact new occurrence scope: ${key}`);
  return row.to;
}

export function effectiveSubstitutionRules(previous, unit, affectedClaimIds = []) {
  if (!unit) return previous;
  return {
    ...previous, substitutionRules: unit, changes: mergeScientificFileAndRecordChanges(previous, unit), researchChanged: true,
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affectedClaimIds])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function verifySubstitutionRulesReceipts(unit, artifacts, publicDownloads) {
  if (editionDigest(capturedExport) !== actualExportCapturePin
      || !sameScienceValue(unit.outputCapture, capturedExport.identity)
      || !verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile,row.reportFile]), path => path)) return false;
  const rawFiles = new Map(capturedExport.files.map(file => [file.path, file]));
  const articlePaths = [...new Set(unit.outputs.map(row => `${row.path.slice(1)}/index.html`))];
  const articleFiles = articlePaths.map(path => rawFiles.get(path));
  if (articleFiles.some(file => !file)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses,
      capture: capturedExport.identity, articleFiles },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${substitutionRulesId}/${row.kind}`;
    if (row.date < substitutionRulesSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    if (row.kind !== 'output') return true;
    const files = observations.artifactFiles;
    return observations.source === 'actual-export' && observations.sourceCommit === capturedExport.identity.sourceCommit
      && !['previewDownloads','forecast'].some(key => Object.hasOwn(artifact,key) || Object.hasOwn(observations,key))
      && Array.isArray(files) && unique(files, row => row.path)
      && sameScienceValue(files.map(row => [row.path, row.contentSha256 ?? row.sha256]), unit.publicArtifacts.map(row => [row.path,row.sha256]))
      && files.every(file => {
        const captured = rawFiles.get(file.path);
        return captured && file.sha256 === captured.sha256 && file.bytes === captured.bytes
          && (!file.path.endsWith('.json') || exactPublicJsonReceipt(file, publicDownloads.get(file.path)));
      });
  });
}

export function substitutionRulesOrdinaryId(unit, route, print, index) {
  if (!unit || !substitutionRulesRoutes.includes(route)) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-sub-105-ordinary-${index}`;
}

export function substitutionRulesHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-sub-105-ordinary-\d+$/;
export function qualifySubstitutionRulesHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'), sha256: flowBoundaryOrdinaryDigest(node),
    }])));
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Substitution rules', routes: substitutionRulesRoutes, predecessorPin: substitutionRulesAddressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: substitutionRulesHistoryControls(unit), source: substitutionRulesSource, attribute: 'substitution-rules',
    ordinaryPattern, label: 'Substitution rules', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key,row.sha256])),
  });
  return { prior, errors };
}

export function substitutionRulesPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary,
    ...(['chapter', 'note-group'].includes(old.kind) && { title: old.title }),
    ...(old.kind === 'heading' && { visibleHeading: old.title }),
  };
}
