import capture from '../config/reader-part1-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimIds, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { part2RereadHistoryControls } from './reader-part2-reread.mjs';
import { part3RereadHistoryControls } from './reader-part3-reread.mjs';
import { part4RereadHistoryControls } from './reader-part4-reread.mjs';
import { part5RereadHistoryControls } from './reader-part5-reread.mjs';
import { part6RereadHistoryControls } from './reader-part6-reread.mjs';
import { part7RereadHistoryControls } from './reader-part7-reread.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  projectScientificOrdinaryTargets, qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const part1RereadId = 'part1-reread-181';
export const part1RereadCheckDate = '2026-11-20';
export const part1RereadBookRoute = '/docs/book';
export const part1RereadB04Web2Route = '/docs/book/cml-computation-judgment-and-improvement';
export const part1RereadB05Route = '/docs/book/cleaner-production-purpose-and-prospects';
export const part1RereadRoutes = Object.freeze([part1RereadBookRoute]);

/** @type {string|null} */
export const part1RereadUnitPin = '5084177af42d321385c3d95e312d1a1dcb1601200c49ce2469fc83009a4d3e00';
/** @type {string|null} */
export const part1RereadCapturePin = '4eb8df2c797836cca3f720a20fe86065e4c6dd7f36f9711253cd75216a3c3698';
export const part1RereadSource = Object.freeze({
  commit: '50e045f012090813d3b90f543b65fbb2c24b1d8f',
  tree: '1e525e987a4ed9144a03fa1d9963fd24c141f0df',
  manifest: '02e05175a7bf0da710bd6c1e69383cda5ee6c971d37518402e2a3c2f0cbf7eb4',
  date: '2026-11-20',
});
export const part1RereadPredecessorPin = '7eaeed679ad47a1417aa30841c4bf5ef11d90b20a2cc262a504639264c772ef9';
/** @type {string|null} */
const addressPin = 'bb0b9559f859cf48bb2de60b684017d93a195a62d6d3ad5e2011b5ce5c0f1350';
const previousPrintPart1Sha = '84e3549ade04ff4456f89bfab3e2fad43e988314229f9c78d2391347fddeefbc';

const expectedPart1Intro =
  '比较一件产品的环境表现，为什么不能只盯住单个环节，而必须沿生产、使用与处置展开？本部先从生命周期视角界定比较的起点、系统简化与迭代逻辑，再回到早期饮料容器账本与政策分析，辨析能源核算、周转假设与政府干预理由各自依赖的证据；随后通过《评价框架与分析步骤》梳理历史指南并对照 CML 2001/2002、国际参考生命周期数据系统（ILCD）2010、欧盟产品环境足迹（PEF）2021 与温室气体核算体系（GHG Protocol）产品标准（2011）在阶段迭代、决策情景与比较断言门槛、影响类别与加权以及审验鉴证上的共同核心与真实分歧；最后考察清洁生产中的生命周期评价用途与本地应用条件，引出第二部的问题：不同方案须满足哪些共同的功能参照与清单边界，才能建立可比账本。';

export const allowedPart1OrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-2`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-2`,
]));

const part1RereadB04MonographRoute = 'book-framework-responsibilities';

export const part1RereadCorrections = Object.freeze([
  Object.freeze({
    chapter: part1RereadB04Web2Route,
    claimId: 'cl-cml-edition',
    noteIndex: 1,
    scope: '将“本文”统一为“本章”，并将两处异体词“题叶”规范为“题页”。',
  }),
  Object.freeze({
    chapter: part1RereadB04MonographRoute,
    claimId: 'cl-cml-edition',
    noteIndex: 9,
    scope: '将“本文”统一为“本章”，并将两处异体词“题叶”规范为“题页”。',
  }),
  Object.freeze({
    chapter: part1RereadB05Route,
    claimId: 'cl-regional-sun-development-agenda',
    noteIndex: 5,
    scope: '收紧第一部末段向第二部《服务与清单》的衔接，明确引出功能单位、声明单位、参考流与可比性门槛的跨体系辨析。',
  }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': 'fbe860f73508d0a62dcc369385f2b1b030244f79813b3758fadd821e053aa357',
  'content/docs/book/index.mdx': '92b233f24363a3a72daf86bf4d5e8c43d294782f7feb069d466b9dbe11e9646d',
});
const managedPaths = Object.keys(oldFileShas);

const modifiedClaimIds = new Set([
  'cl-book-integrative-function',
  'cl-hist-two-reuse-choices',
  'cl-framework-work-before-boxes',
  'cl-book-framework-records',
  'cl-book-framework-method',
  'cl-cml-edition',
  'cl-cml-response-scale',
  'cl-framework-design-sideeffects',
  'cl-cml-decision-procedure',
  'cl-framework-reader-work-product',
  'cl-regional-sun-development-agenda',
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'partIntroduction', 'printPart1', 'previousFiles',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedPartIntroKeys = new Set(['part', 'from', 'to', 'rationale']);
const allowedPrintPart1Keys = new Set(['id', 'from', 'to']);
const allowedRawRecordKeys = new Set(['path', 'id', 'from']);
const allowedRawFieldKeys = new Set(['path', 'from', 'to']);
const allowedChangeKeys = new Set(['kind', 'key', 'from', 'to', 'rationale']);
const allowedConsumerKeys = new Set(['id', 'rationale']);
const allowedHistoryKeys = new Set(['previousAddresses', 'currentAddresses', 'ordinaryTargets', 'ordinaryOverrides', 'history']);
const allowedOrdinaryTargetKeys = new Set(['route', 'sha256', 'tag']);
const allowedOrdinaryOverrideKeys = new Set(['from', 'to', 'rationale']);
const allowedHistoryRowKeys = new Set(['address', 'from', 'ordinary', 'rationale']);
const allowedOrdinaryBlockKeys = new Set(['address', 'targetId', 'from', 'to', 'rationale']);
const allowedOutputKeys = new Set(['path', 'route', 'from', 'sha256', 'rationale']);
const allowedPublicArtifactKeys = new Set(['path', 'from', 'sha256', 'rationale']);
const allowedOutputCaptureKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256', 'normalizedProofSha256']);
const allowedReviewEvidenceKeys = new Set(['kind', 'date', 'artifactFile', 'artifactSha256', 'reportFile', 'reportSha256']);
const allowedCaptureKeys = new Set(['schemaVersion', 'identity', 'manifestPaths', 'files', 'normalization']);
const allowedCaptureIdentityKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256']);
const allowedCaptureFileKeys = new Set(['path', 'sha256', 'bytes']);
const allowedCaptureNormKeys = new Set(['articles', 'publicHtml']);

function validOrdinaryOverridesShape(overrides, requireExact) {
  if (!plainObject(overrides)) return false;
  const keys = Object.keys(overrides);
  if (requireExact && keys.length !== allowedPart1OrdinaryOverrideKeys.size) return false;
  return keys.every(k => allowedPart1OrdinaryOverrideKeys.has(k)
    && exactKeys(overrides[k], allowedOrdinaryOverrideKeys)
    && scienceDigest(overrides[k].from) && scienceDigest(overrides[k].to)
    && overrides[k].from !== overrides[k].to && scienceText(overrides[k].rationale));
}

function assertUnitEnvelopeKeys(unit, reviewed, previewPass1 = false) {
  const expectedUnitKeys = reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys;
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles).sort() : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !exactKeys(unit.state, allowedStateKeys)
      || !exactKeys(unit.partIntroduction, allowedPartIntroKeys)
      || (reviewed ? !exactKeys(unit.printPart1, allowedPrintPart1Keys)
        : (unit.printPart1 !== null && !exactKeys(unit.printPart1, allowedPrintPart1Keys)))
      || !prevKeys || !sameScienceValue(prevKeys, [...managedPaths].sort())
      || !managedPaths.every(p => scienceText(unit.previousFiles[p]))
      || !Array.isArray(unit.rawRecords) || !unit.rawRecords.every(r => exactKeys(r, allowedRawRecordKeys))
      || !Array.isArray(unit.rawFields) || !unit.rawFields.every(r => exactKeys(r, allowedRawFieldKeys))
      || !Array.isArray(unit.changes) || !unit.changes.every(r => exactKeys(r, allowedChangeKeys))
      || !Array.isArray(unit.consumers) || !unit.consumers.every(r => exactKeys(r, allowedConsumerKeys))
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !plainObject(unit.history.previousAddresses) || !plainObject(unit.history.currentAddresses)
      || !plainObject(unit.history.ordinaryTargets)
      || !Object.values(unit.history.ordinaryTargets).every(t => exactKeys(t, allowedOrdinaryTargetKeys))
      || !validOrdinaryOverridesShape(unit.history.ordinaryOverrides, !previewPass1)
      || !Array.isArray(unit.history.history)
      || !unit.history.history.every(h => exactKeys(h, allowedHistoryRowKeys) && Array.isArray(h.ordinary)
        && h.ordinary.every(b => exactKeys(b, allowedOrdinaryBlockKeys)))
      || !Array.isArray(unit.outputs) || !unit.outputs.every(r => exactKeys(r, allowedOutputKeys))
      || !Array.isArray(unit.publicArtifacts) || !unit.publicArtifacts.every(r => exactKeys(r, allowedPublicArtifactKeys))
      || (reviewed ? !exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
        : (unit.outputCapture !== null && !exactKeys(unit.outputCapture, allowedOutputCaptureKeys)))) {
    throw new Error('Part I continuous reread unit has invalid or extra keys');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(r => exactKeys(r, allowedReviewEvidenceKeys))) {
      throw new Error('Part I continuous reread reviewEvidence has invalid or extra keys');
    }
  }
}

export function selectPart1Reread(config, pin = part1RereadUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid Part I continuous reread configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive Part I continuous reread requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== part1RereadId || !scienceText(unit.rationale)
      || !sameScienceValue(unit.source, part1RereadSource)
      || !sameScienceValue(unit.routes, part1RereadRoutes)) {
    throw new Error('Invalid Part I continuous reread unit identity');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Part I continuous reread is not independently accepted');
    assertUnitEnvelopeKeys(unit, false, unit.outputs.length === 0);
    return unit;
  }
  if (!unit.outputs.length || !unit.publicArtifacts.length) {
    throw new Error('Part I continuous reread reviewed unit requires non-empty outputs and publicArtifacts');
  }
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Part I continuous reread unit pin does not match');
  }
  assertUnitEnvelopeKeys(unit, true, false);
  return unit;
}

const allowsRaw = (family, id, from) => (
  family === 'claims' && from !== null && modifiedClaimIds.has(id)
);

function validatePart1PremiseOrder(catalog, files) {
  const numbering = JSON.parse(files.get('config/reader-numbering.json').toString('utf8'));
  const bookFiles = (numbering.book ?? [])
    .filter(row => row.kind === 'chapter' && row.source)
    .map(row => `content${row.source}.mdx`);
  const order = new Map();
  let pos = 0;
  for (const rel of bookFiles) {
    const raw = files.get(rel)?.toString('utf8');
    if (!raw) throw new Error(`Part I continuous reread missing expected book chapter file: ${rel}`);
    for (const id of collectChapterClaimIds(raw)) {
      if (!order.has(id)) order.set(id, ++pos);
    }
  }
  const part1Files = [
    'content/docs/book/integrative-ambitions.mdx',
    'content/docs/book/early-container-comparisons.mdx',
    'content/docs/book/early-container-policy-and-systems.mdx',
    'content/monograph/framework-responsibilities.mdx',
    'content/docs/book/cleaner-production-purpose-and-prospects.mdx',
  ];
  const byId = new Map((catalog.claims ?? []).map(c => [c.id, c]));
  for (const rel of part1Files) {
    const raw = files.get(rel)?.toString('utf8');
    if (!raw) throw new Error(`Part I continuous reread missing expected Part I chapter file: ${rel}`);
    for (const id of collectChapterClaimIds(raw)) {
      const c = byId.get(id);
      if (!c || c.caseBinding || !c.premiseIds?.length) continue;
      const myPos = order.get(id);
      if (!myPos) throw new Error(`Part I continuous reread missing book order position for ${id}`);
      let prevPos = 0;
      for (const pid of c.premiseIds) {
        const pPos = order.get(pid);
        if (!pPos) continue;
        if (pPos >= myPos) {
          throw new Error(`Part I continuous reread forward premise on ${id}: ${pid}`);
        }
        if (pPos <= prevPos) {
          throw new Error(`Part I continuous reread non-ascending premiseIds on ${id}: ${pid}`);
        }
        prevPos = pPos;
      }
    }
  }
}

export function preparePart1RereadSource(unit, input, actual, structure) {
  if (!unit) return null;
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, unit.outputs.length === 0);
  if (unit.rawFields.length !== 0) {
    throw new Error('Part I continuous reread forbids rawFields edits');
  }
  const numbering = JSON.parse(input.files.get('config/reader-numbering.json').toString('utf8'));
  const part1 = numbering?.parts?.find(p => p.number === 1);
  if (!part1 || part1.introduction !== expectedPart1Intro || unit.partIntroduction.to !== expectedPart1Intro || unit.partIntroduction.part !== 1) {
    throw new Error('Part I continuous reread Part 1 introduction mismatch');
  }
  validatePart1PremiseOrder(input.catalog, input.files);

  const allowedChanges = new Set([
    ...managedPaths.map(p => `file:${p}`),
    'record:researchMetadata:public-projection',
    ...[...modifiedClaimIds].map(id => `record:claims:${id}`),
  ]);
  const recordChanges = new Map();
  for (const row of unit.changes) {
    if (!allowedChanges.has(`${row.kind}:${row.key}`)) {
      throw new Error(`Part I continuous reread change outside bounded scope: ${row.kind}:${row.key}`);
    }
    if (row.kind === 'record') recordChanges.set(row.key, row);
  }
  const files = new Map(input.files);
  for (const p of managedPaths) {
    const prev = unit.previousFiles[p];
    if (sha256(prev) !== oldFileShas[p]) {
      throw new Error(`Part I continuous reread previous file differs from exact 50e045f0 bytes: ${p}`);
    }
    files.set(p, Buffer.from(prev));
  }
  const previousRecords = restoreScientificRecords(
    { catalog: input.catalog, readings: input.readings, literature: input.literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  const previousInput = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(previousInput);
  const priorStructure = copyeditSourceStructure(previousInput);
  if (unit.state?.before !== part1RereadPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== part1RereadPredecessorPin) {
    throw new Error('Part I continuous reread did not recover the independently observed raw 50e045f0 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Part I continuous reread actual source state differs from the reviewed candidate');
  }
  const declared = new Map(unit.changes.map(row => [`${row.kind}:${row.key}`, row]));
  for (const kind of ['file', 'record']) {
    const beforeMap = kind === 'file' ? previous.files : previous.records;
    const afterMap = kind === 'file' ? actual.files : actual.records;
    for (const key of new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)])) {
      const from = beforeMap[key] ?? null;
      const to = afterMap[key] ?? null;
      if (sameScienceValue(from, to)) continue;
      const row = declared.get(`${kind}:${key}`);
      if (!row || !sameScienceValue(from, row.from) || !sameScienceValue(to, row.to)) {
        throw new Error(`Part I continuous reread lacks its exact candidate transition: ${kind}:${key}`);
      }
      declared.delete(`${kind}:${key}`);
    }
  }
  if (declared.size) {
    throw new Error(`Part I continuous reread declared unchanged transition: ${declared.keys().next().value}`);
  }
  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Part I continuous reread lacks exact cross-generation consumer review');
  }
  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...modifiedClaimIds])],
  };
}

export function effectivePart1Reread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    part1Reread: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function projectPart1RereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 1 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to)) {
    throw new Error('Part I continuous reread has an invalid Part 1 introduction transition');
  }
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 1);
  if (!slot || slot.introduction !== to) {
    throw new Error('Part I continuous reread numbering differs from the reviewed Part 1 introduction');
  }
  slot.introduction = from;
  return projected;
}

export function projectPart1RereadPrintParts(unit, printParts) {
  if (!unit || !printParts || !unit.printPart1) return printParts;
  const { id, from, to } = unit.printPart1;
  const slot = printParts[0];
  if (id !== 'print-part-1' || from !== previousPrintPart1Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-1' || slot.sha256 !== from) {
    throw new Error('Part I continuous reread printed Part 1 header differs from its accepted 8148/95 predecessor');
  }
  return printParts.map(row => row.id === 'print-part-1' ? { id: 'print-part-1', sha256: to } : row);
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!exactKeys(capture, allowedCaptureKeys) || capture.schemaVersion !== 1
      || !exactKeys(capture.identity, allowedCaptureIdentityKeys)
      || !/^[a-f0-9]{40}$/.test(capture.identity.sourceCommit ?? '') || typeof capture.identity.dirty !== 'boolean'
      || !scienceText(capture.identity.status) || !scienceDigest(capture.identity.manifestSha256)
      || capture.manifestPaths !== 468
      || !Array.isArray(capture.files) || !capture.files.length
      || !unique(capture.files, f => f.path)
      || !capture.files.every(f => exactKeys(f, allowedCaptureFileKeys) && scienceText(f.path) && scienceDigest(f.sha256) && Number.isSafeInteger(f.bytes) && f.bytes >= 0)
      || !exactKeys(capture.normalization, allowedCaptureNormKeys)
      || !Array.isArray(capture.normalization.articles) || !Array.isArray(capture.normalization.publicHtml)
      || !scienceDigest(part1RereadCapturePin) || editionDigest(capture) !== part1RereadCapturePin) {
    return false;
  }
  const identity = { ...capture.identity, normalizedProofSha256: editionDigest(capture.normalization) };
  if (!sameScienceValue(unit.outputCapture, identity) || !sameScienceValue(observations.capture, identity)
      || observations.sourceCommit !== identity.sourceCommit) return false;
  const articles = unit.outputs.map(({ path, route, sha256: digest }) => ({ path, route, sha256: digest }));
  const html = unit.publicArtifacts.filter(row => row.path.endsWith('.html')).map(({ path, sha256: digest }) => ({ path, sha256: digest }));
  if (!sameScienceValue(articles, capture.normalization.articles) || !sameScienceValue(html, capture.normalization.publicHtml)) return false;

  const raw = new Map(capture.files.map(file => [file.path, file]));
  const articleFiles = [...new Set(articles.map(row => `${row.path.slice(1)}/index.html`))].map(path => raw.get(path));
  const artifacts = observations.artifactFiles;
  return !articleFiles.some(file => !file) && sameScienceValue(articleFiles, observations.articleFiles)
    && Array.isArray(artifacts) && unique(artifacts, file => file.path)
    && sameScienceValue(artifacts.map(file => [file.path, file.contentSha256 ?? file.sha256]), unit.publicArtifacts.map(row => [row.path, row.sha256]))
    && artifacts.every(file => file.sha256 === raw.get(file.path)?.sha256 && file.bytes === raw.get(file.path)?.bytes
       && (!file.path.endsWith('.json') || exactPublicJsonReceipt(file, publicDownloads.get(file.path))));
}

export function verifyPart1RereadReceipts(unit, artifacts, publicDownloads) {
  try {
    assertUnitEnvelopeKeys(unit, true, false);
  } catch {
    return false;
  }
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${part1RereadId}/${row.kind}`;
    if (row.date < part1RereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function part1RereadOrdinaryId() {
  return undefined;
}

export function part1RereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-part4-133-ordinary-\d+$/;

export function observePart1RereadOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

const nonCommentChildren = node => (node?.childNodes ?? []).filter(c => c.nodeType === 1 || (c.nodeType === 3 && c.text.length > 0));
const singleTextChild = (node, expected) => node?.childNodes?.length === 1 && node.childNodes[0].nodeType === 3 && node.childNodes[0].text === expected;
const attrs = (node, ...names) => {
  const keys = Object.keys(node?.attributes ?? {}).sort();
  return keys.length === names.length && keys.every((k, i) => k === [...names].sort()[i]);
};

export function validatePart1RereadPartDisclosure(printDoc, unit) {
  if (!unit || !printDoc) return [];
  const errors = [];
  const printParts = fingerprintCopyeditPrintParts(printDoc);
  const actualPart1 = printParts?.[0];
  if (!actualPart1 || actualPart1.id !== 'print-part-1' || actualPart1.sha256 !== unit.printPart1?.to) {
    errors.push('Part I continuous reread /print Part 1 header differs from reviewed candidate');
  }
  const nodes = printDoc.querySelectorAll('[data-part1-reread-part]');
  if (nodes.length !== 1) return [...errors, 'Part I continuous reread /print Part 1 disclosure is missing or duplicated'];
  const node = nodes[0];
  const group = printDoc.querySelector('[data-reader-part-group="1"]');
  const intro = group?.querySelector('.print-part-introduction');
  const detailsChildren = nonCommentChildren(node);
  const summary = detailsChildren[0];
  const para = detailsChildren[1];
  const summaryChildren = nonCommentChildren(summary);
  const time = summaryChildren[0];
  const paraChildren = nonCommentChildren(para);
  const link = paraChildren[paraChildren.length - 1];
  const paraLeadText = paraChildren.slice(0, -1).every(c => c.nodeType === 3)
    ? paraChildren.slice(0, -1).map(c => c.text).join('') : null;
  const summaryTailText = summaryChildren.slice(1).every(c => c.nodeType === 3)
    ? summaryChildren.slice(1).map(c => c.text).join('') : null;
  const allLinks = node.querySelectorAll('a');
  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-part1-reread-part')
      || node.getAttribute('data-part1-reread-part') !== '1'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || node.nextElementSibling?.tagName !== 'ARTICLE'
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part1RereadSource.date
      || !singleTextChild(time, part1RereadSource.date) || summaryTailText !== ' 版第一部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-part1-reread-part-source', 'href')
      || link.getAttribute('data-part1-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(part1RereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node)) {
    errors.push('Part I continuous reread printed Part 1 disclosure has invalid text, position or source link');
  }
  return errors;
}

export function validatePart1RereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-part1-reread-correction]');
  const expectedRows = !unit
    ? []
    : part1RereadCorrections.filter(row =>
        path === '/print'
          ? row.chapter !== part1RereadB04Web2Route
          : path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Part I continuous reread correction notices are absent, extra or detached: ${path}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-part1-reread-correction') === claimId);
    const marker = matching[0];
    const markerChildren = nonCommentChildren(marker);
    const time = markerChildren[0];
    const link = markerChildren[markerChildren.length - 1];
    const midNodes = markerChildren.slice(1, -1);
    const midText = midNodes.length && midNodes.every(c => c.nodeType === 3)
      ? midNodes.map(c => c.text).join('') : null;
    const allLinks = marker?.querySelectorAll('a') ?? [];
    const article = note?.closest('article[data-reader-route]');
    const sections = article?.querySelectorAll('.chapter-notes') ?? [];
    const list = sections[0]?.querySelector('ol');
    const noteItems = list?.childNodes.filter(child => child.tagName === 'LI') ?? [];
    if (matching.length !== 1 || nativeNotes.length !== 1 || note.tagName !== 'LI'
        || note.getAttribute('data-reader-claim') !== claimId
        || article?.getAttribute('data-reader-route') !== chapter || sections.length !== 1
        || note.parentNode !== list || noteItems[noteIndex] !== note
        || marker.tagName !== 'P' || marker.parentNode !== note || marker.nextElementSibling !== null
        || !attrs(marker, 'class', 'data-part1-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part1RereadSource.date
        || !singleTextChild(time, part1RereadSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(part1RereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Part I continuous reread correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

const wholeBookSuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-4`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-4`,
]));

export function qualifyPart1RereadHistory(documents, unit, actual, part2Reread, part3Reread, part7Reread, part6Reread, part5Reread, part4Reread, wholeBookReread = null) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, false);
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true)) {
    throw new Error('Part I continuous reread ordinaryOverrides violates the 2-key allowlist');
  }
  let successorOverrides = null;
  if (wholeBookReread) {
    const raw = wholeBookReread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...wholeBookSuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to)) {
      throw new Error('Part I continuous reread successor ordinaryOverrides violates the 2-key Whole-book allowlist');
    }
    successorOverrides = Object.fromEntries([...wholeBookSuccessorOverrideKeys].map(key => [key, { from: raw[key].from, to: raw[key].to }]));
  }
  const targets = projectScientificOrdinaryTargets(
    successorOverrides,
    observePart1RereadOrdinaryTargets(documents),
    'Part I continuous reread',
    wholeBookSuccessorOverrideKeys,
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Part I continuous reread', routes: part1RereadRoutes, predecessorPin: addressPin,
  });
  const part1Entry = prior['/print#print-part-1'];
  if (!part1Entry || part1Entry.introduction !== unit.partIntroduction.to) {
    throw new Error('Part I continuous reread /print#print-part-1 lacks the reviewed Part 1 introduction');
  }
  prior['/print#print-part-1'] = { ...part1Entry, introduction: unit.partIntroduction.from };

  const historyBlockMap = new Map();
  for (const hRow of unit.history.history ?? []) {
    const pathPart = hRow.address.split('#')[0];
    for (const b of hRow.ordinary ?? []) {
      historyBlockMap.set(`${pathPart}#${b.targetId}`, { from: b.from, to: b.to });
    }
  }
  for (const [key, row] of Object.entries(overrides)) {
    const hBlock = historyBlockMap.get(key);
    const priorSha = part4Reread?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || (priorSha !== undefined && priorSha !== row.from)) {
      throw new Error(`Part I continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
    }
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: part1RereadHistoryControls(unit),
      source: part1RereadSource,
      attribute: 'part1-reread',
      previousHistory: [
        { attribute: 'part2-reread', expected: part2RereadHistoryControls(part2Reread) },
        { attribute: 'part3-reread', expected: part3RereadHistoryControls(part3Reread) },
        { attribute: 'part7-reread', expected: part7RereadHistoryControls(part7Reread) },
        { attribute: 'part6-reread', expected: part6RereadHistoryControls(part6Reread) },
        { attribute: 'part5-reread', expected: part5RereadHistoryControls(part5Reread) },
        { attribute: 'part4-reread', expected: part4RereadHistoryControls(part4Reread) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P'],
      label: 'Part I continuous reread',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
      ordinaryOverrides: successorOverrides,
    }),
    ...validatePart1RereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Part I continuous reread actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-part1-reread-part]').length > 0) {
      errors.push(`Part I continuous reread unexpected Part 1 disclosure marker outside /print: ${path}`);
    }
    errors.push(...validatePart1RereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function part1RereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restorePart1RereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
