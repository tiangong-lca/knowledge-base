import capture from '../config/reader-part2-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimIds, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { part3RereadHistoryControls } from './reader-part3-reread.mjs';
import { part4RereadHistoryControls } from './reader-part4-reread.mjs';
import { part5RereadHistoryControls } from './reader-part5-reread.mjs';
import { part6RereadHistoryControls } from './reader-part6-reread.mjs';
import { part7RereadHistoryControls } from './reader-part7-reread.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const part2RereadId = 'part2-reread-177';
export const part2RereadCheckDate = '2026-11-20';
export const part2RereadBookRoute = '/docs/book';
export const part2RereadB06Route = '/docs/book/service-and-reference';
export const part2RereadB07Route = '/docs/book/inventory-calculation';
export const part2RereadB08Route = '/docs/book/exchange-semantics-and-conversion';
export const part2RereadB09Route = '/docs/book/inventory-boundary-and-hybrid';
export const part2RereadRoutes = Object.freeze([part2RereadBookRoute]);

/** @type {string|null} */
export const part2RereadUnitPin = '4405fad794c6f98dc8d0373b7ee35a9cc073724d8e25e77aa5633dca4ee55b09';
/** @type {string|null} */
export const part2RereadCapturePin = '3c00ef5fd15c3a85176b0667b967f879f0e8dc67a16625158bfcbad9c820a6ee';
export const part2RereadSource = Object.freeze({
  commit: '3034503fadf4353e3e58b01f32c74886bfbe6c92',
  tree: '6b806e5c85a9f2d651be47cc0b915ea6bece360e',
  manifest: '85335204e1e11c09aa712bfe5645c25aab84eec8104d7958b447414d670c2256',
  date: '2026-11-20',
});
export const part2RereadPredecessorPin = '1f0a68fa2de7d8050980e131f7e36458492b869e1a2092545cd147c1c219e2e5';
/** @type {string|null} */
const addressPin = 'de86e918f2081a7c9d0940640d50e6390f3a97882b952e663e9da58a717b1a6c';
const previousPrintPart2Sha = '8a02618281996925fb46aef048ce67dc4df03c97715980e0b6b569c1300fbc79';

const expectedPart2Intro =
  '要比较两种方案，先要固定它们共同交付的功能参照，并看清国际参考生命周期数据系统（ILCD）、欧盟产品环境足迹（PEF）、温室气体核算体系（GHG Protocol）与 ecoinvent 第三版在功能单位、声明单位、参考产品与可比性门槛上的分工。确定产品需求之后，再通过线性过程网络求解各项供给活动，并辨认配平方程背后的截断、零价与多余约束边界。进入软件与数据交换层面，还须分清技术界面与环境界面、基本流与产品/废物流以及零值与缺因子的区别。最后，当过程网络存在截断而借助经济投入产出数据闭合上游时，要对照主流过程标准与混合清单架构在截断阈值、资本品边界、重复计算扣除、价格与分母口径上的真实差异；厘清清单如何建立与闭合以后，第三部将进一步转向共产品分配与供给变化。';

export const allowedPart2OrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-3`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-3`,
]));

export const part2RereadCorrections = Object.freeze([
  Object.freeze({
    chapter: part2RereadB06Route,
    claimId: 'cl-book-three-comparisons',
    noteIndex: 16,
    scope: '将原第 17 注末句提前通向下一章的过渡，平滑改写为衔接紧随其后的四体系功能参照比较论述。',
  }),
  Object.freeze({
    chapter: part2RereadB06Route,
    claimId: 'cl-fr173-epistemic-limits',
    noteIndex: 22,
    scope: '在《功能参照》末段补充通向《过程网络》的章节衔接句。',
  }),
  Object.freeze({
    chapter: part2RereadB08Route,
    claimId: 'cl-flow-type',
    noteIndex: 7,
    scope: '将非案例绑定论述中的“基础流”统一为全书规范术语“基本流”（保留第 2 注对案例绑定段原译称呼的说明）。',
  }),
  Object.freeze({
    chapter: part2RereadB08Route,
    claimId: 'cl-native-service-meaning',
    noteIndex: 76,
    scope: '移除位于本章结语段（第 78 注）之前的过早“下一章”过渡句，由结语段统一承接《混合清单》。',
  }),
  Object.freeze({
    chapter: part2RereadB09Route,
    claimId: 'cl-inv-judgement',
    noteIndex: 38,
    scope: '将原第 39 注提前通向第三部的过渡句改为衔接紧随其后的五体系边界与混合清单比较。',
  }),
  Object.freeze({
    chapter: part2RereadB09Route,
    claimId: 'cl-hyb175-epistemic-limits',
    noteIndex: 44,
    scope: '在《混合清单》末段补全通向第三部《负担分配与供给变化》的部级衔接句。',
  }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': '82c1b3f90c811ab255eba74acbdad733c459949651d5db37d30d30479075b1b4',
  'content/docs/book/index.mdx': '4cf17bcf8c07fb5bca77266be86f4aa940bb70890470d368eb73a4161697c330',
});
const managedPaths = Object.keys(oldFileShas);

const modifiedClaimIds = new Set([
  'cl-flow-type',
  'cl-fu-distinction',
  'cl-zero-example',
  'cl-book-service-contract',
  'cl-book-comparison-more',
  'cl-book-three-comparisons',
  'cl-inv-example-inputs',
  'cl-inv-judgement',
  'cl-hyb-downstream-test',
  'cl-native-opening',
  'cl-native-factor-report',
  'cl-native-service-meaning',
  'cl-book-maintenance-condition',
  'cl-book-record-model-limit',
  'cl-inv-service-to-demand',
  'cl-flow99-two-boundaries',
  'cl-flow99-waste-classification',
  'cl-flow99-material-and-service',
  'cl-flow99-zero-placeholder',
  'cl-flow99-zero-reporting',
  'cl-flow99-probe-reference',
  'cl-service102-row-map',
  'cl-service102-service-meaning',
  'cl-fr173-epistemic-limits',
  'cl-hyb175-epistemic-limits',
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'partIntroduction', 'printPart2', 'previousFiles',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedPartIntroKeys = new Set(['part', 'from', 'to', 'rationale']);
const allowedPrintPart2Keys = new Set(['id', 'from', 'to']);
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
  if (requireExact && keys.length !== allowedPart2OrdinaryOverrideKeys.size) return false;
  return keys.every(k => allowedPart2OrdinaryOverrideKeys.has(k)
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
      || (reviewed ? !exactKeys(unit.printPart2, allowedPrintPart2Keys)
        : (unit.printPart2 !== null && !exactKeys(unit.printPart2, allowedPrintPart2Keys)))
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
    throw new Error('Part II continuous reread unit has invalid or extra keys');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(r => exactKeys(r, allowedReviewEvidenceKeys))) {
      throw new Error('Part II continuous reread reviewEvidence has invalid or extra keys');
    }
  }
}

export function selectPart2Reread(config, pin = part2RereadUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid Part II continuous reread configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive Part II continuous reread requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== part2RereadId || !scienceText(unit.rationale)
      || !sameScienceValue(unit.source, part2RereadSource)
      || !sameScienceValue(unit.routes, part2RereadRoutes)) {
    throw new Error('Invalid Part II continuous reread unit identity');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Part II continuous reread is not independently accepted');
    assertUnitEnvelopeKeys(unit, false, unit.outputs.length === 0);
    return unit;
  }
  if (!unit.outputs.length || !unit.publicArtifacts.length) {
    throw new Error('Part II continuous reread reviewed unit requires non-empty outputs and publicArtifacts');
  }
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Part II continuous reread unit pin does not match');
  }
  assertUnitEnvelopeKeys(unit, true, false);
  return unit;
}

const allowsRaw = (family, id, from) => (
  family === 'claims' && from !== null && modifiedClaimIds.has(id)
);

function validatePart2PremiseOrder(catalog, files) {
  const numbering = JSON.parse(files.get('config/reader-numbering.json').toString('utf8'));
  const bookFiles = (numbering.book ?? [])
    .filter(row => row.kind === 'chapter' && row.source)
    .map(row => row.source.startsWith('/docs/') ? `content${row.source}.mdx` : `content/monograph/${row.source.replace(/^book-/, '')}.mdx`);
  const order = new Map();
  let pos = 0;
  for (const rel of bookFiles) {
    const raw = files.get(rel)?.toString('utf8');
    if (!raw) continue;
    for (const id of collectChapterClaimIds(raw)) {
      if (!order.has(id)) order.set(id, ++pos);
    }
  }
  const part2Files = [
    'content/docs/book/service-and-reference.mdx',
    'content/docs/book/inventory-calculation.mdx',
    'content/docs/book/exchange-semantics-and-conversion.mdx',
    'content/docs/book/inventory-boundary-and-hybrid.mdx',
  ];
  const byId = new Map((catalog.claims ?? []).map(c => [c.id, c]));
  for (const rel of part2Files) {
    const raw = files.get(rel)?.toString('utf8');
    if (!raw) continue;
    for (const id of collectChapterClaimIds(raw)) {
      const c = byId.get(id);
      if (!c || c.caseBinding || !c.premiseIds?.length) continue;
      const myPos = order.get(id);
      let prevPos = 0;
      for (const pid of c.premiseIds) {
        const pPos = order.get(pid);
        if (!pPos || pPos >= myPos) {
          throw new Error(`Part II continuous reread forward or unknown premise on ${id}: ${pid}`);
        }
        if (pPos <= prevPos) {
          throw new Error(`Part II continuous reread non-ascending premiseIds on ${id}: ${pid}`);
        }
        prevPos = pPos;
      }
    }
  }
}

export function preparePart2RereadSource(unit, input, actual, structure) {
  if (!unit) return null;
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, unit.outputs.length === 0);
  if (unit.rawFields.length !== 0) {
    throw new Error('Part II continuous reread forbids rawFields edits');
  }
  const numbering = JSON.parse(input.files.get('config/reader-numbering.json').toString('utf8'));
  const part2 = numbering?.parts?.find(p => p.number === 2);
  if (!part2 || part2.introduction !== expectedPart2Intro || unit.partIntroduction.to !== expectedPart2Intro || unit.partIntroduction.part !== 2) {
    throw new Error('Part II continuous reread Part 2 introduction mismatch');
  }
  validatePart2PremiseOrder(input.catalog, input.files);

  const allowedChanges = new Set([
    ...managedPaths.map(p => `file:${p}`),
    'record:researchMetadata:public-projection',
    ...[...modifiedClaimIds].map(id => `record:claims:${id}`),
  ]);
  const recordChanges = new Map();
  for (const row of unit.changes) {
    if (!allowedChanges.has(`${row.kind}:${row.key}`)) {
      throw new Error(`Part II continuous reread change outside bounded scope: ${row.kind}:${row.key}`);
    }
    if (row.kind === 'record') recordChanges.set(row.key, row);
  }
  const files = new Map(input.files);
  for (const p of managedPaths) {
    const prev = unit.previousFiles[p];
    if (sha256(prev) !== oldFileShas[p]) {
      throw new Error(`Part II continuous reread previous file differs from exact 3034503f bytes: ${p}`);
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
  if (unit.state?.before !== part2RereadPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== part2RereadPredecessorPin) {
    throw new Error('Part II continuous reread did not recover the independently observed raw 3034503f state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Part II continuous reread actual source state differs from the reviewed candidate');
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
        throw new Error(`Part II continuous reread lacks its exact candidate transition: ${kind}:${key}`);
      }
      declared.delete(`${kind}:${key}`);
    }
  }
  if (declared.size) {
    throw new Error(`Part II continuous reread declared unchanged transition: ${declared.keys().next().value}`);
  }
  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Part II continuous reread lacks exact cross-generation consumer review');
  }
  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...modifiedClaimIds])],
  };
}

export function effectivePart2Reread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    part2Reread: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function projectPart2RereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 2 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to)) {
    throw new Error('Part II continuous reread has an invalid Part 2 introduction transition');
  }
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 2);
  if (!slot || slot.introduction !== to) {
    throw new Error('Part II continuous reread numbering differs from the reviewed Part 2 introduction');
  }
  slot.introduction = from;
  return projected;
}

export function projectPart2RereadPrintParts(unit, printParts) {
  if (!unit || !printParts || !unit.printPart2) return printParts;
  const { id, from, to } = unit.printPart2;
  const slot = printParts[1];
  if (id !== 'print-part-2' || from !== previousPrintPart2Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-2' || slot.sha256 !== from) {
    throw new Error('Part II continuous reread printed Part 2 header differs from its accepted 8148/95 predecessor');
  }
  return printParts.map(row => row.id === 'print-part-2' ? { id: 'print-part-2', sha256: to } : row);
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
      || !scienceDigest(part2RereadCapturePin) || editionDigest(capture) !== part2RereadCapturePin) {
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

export function verifyPart2RereadReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${part2RereadId}/${row.kind}`;
    if (row.date < part2RereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function part2RereadOrdinaryId() {
  return undefined;
}

export function part2RereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-part4-133-ordinary-\d+$/;

export function observePart2RereadOrdinaryTargets(documents) {
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

export function validatePart2RereadPartDisclosure(printDoc, unit) {
  if (!unit || !printDoc) return [];
  const errors = [];
  const printParts = fingerprintCopyeditPrintParts(printDoc);
  const actualPart2 = printParts?.[1];
  if (!actualPart2 || actualPart2.id !== 'print-part-2' || actualPart2.sha256 !== unit.printPart2?.to) {
    errors.push('Part II continuous reread /print Part 2 header differs from reviewed candidate');
  }
  const nodes = printDoc.querySelectorAll('[data-part2-reread-part]');
  if (nodes.length !== 1) return [...errors, 'Part II continuous reread /print Part 2 disclosure is missing or duplicated'];
  const node = nodes[0];
  const group = printDoc.querySelector('section.print-part[data-part-number="2"]');
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
  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-part2-reread-part')
      || node.getAttribute('data-part2-reread-part') !== '2'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || node.nextElementSibling?.tagName !== 'ARTICLE'
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part2RereadSource.date
      || !singleTextChild(time, part2RereadSource.date) || summaryTailText !== ' 版第二部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-part2-reread-part-source', 'href')
      || link.getAttribute('data-part2-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(part2RereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node)) {
    errors.push('Part II continuous reread printed Part 2 disclosure has invalid text, position or source link');
  }
  return errors;
}

export function validatePart2RereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-part2-reread-correction]');
  const expectedRows = !unit
    ? []
    : part2RereadCorrections.filter(row => path === '/print' || path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Part II continuous reread correction notices are absent, extra or detached: ${path}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-part2-reread-correction') === claimId);
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
        || !attrs(marker, 'class', 'data-part2-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part2RereadSource.date
        || !singleTextChild(time, part2RereadSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(part2RereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Part II continuous reread correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyPart2RereadHistory(documents, unit, actual, part3Reread, part7Reread, part6Reread, part5Reread, part4Reread) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, false);
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true)) {
    throw new Error('Part II continuous reread ordinaryOverrides violates the 2-key allowlist');
  }
  const targets = observePart2RereadOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Part II continuous reread', routes: part2RereadRoutes, predecessorPin: addressPin,
  });
  const part2Entry = prior['/print#print-part-2'];
  if (!part2Entry || part2Entry.introduction !== unit.partIntroduction.to) {
    throw new Error('Part II continuous reread /print#print-part-2 lacks the reviewed Part 2 introduction');
  }
  prior['/print#print-part-2'] = { ...part2Entry, introduction: unit.partIntroduction.from };

  const historyBlockMap = new Map();
  for (const hRow of unit.history.history ?? []) {
    const pathPart = hRow.address.split('#')[0];
    for (const b of hRow.ordinary ?? []) {
      historyBlockMap.set(`${pathPart}#${b.targetId}`, { from: b.from, to: b.to });
    }
  }
  for (const [key, row] of Object.entries(overrides)) {
    const hBlock = historyBlockMap.get(key);
    const priorSha = part3Reread?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || (priorSha !== undefined && priorSha !== row.from)) {
      throw new Error(`Part II continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
    }
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: part2RereadHistoryControls(unit),
      source: part2RereadSource,
      attribute: 'part2-reread',
      previousHistory: [
        { attribute: 'part3-reread', expected: part3RereadHistoryControls(part3Reread) },
        { attribute: 'part7-reread', expected: part7RereadHistoryControls(part7Reread) },
        { attribute: 'part6-reread', expected: part6RereadHistoryControls(part6Reread) },
        { attribute: 'part5-reread', expected: part5RereadHistoryControls(part5Reread) },
        { attribute: 'part4-reread', expected: part4RereadHistoryControls(part4Reread) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P'],
      label: 'Part II continuous reread',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
    ...validatePart2RereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Part II continuous reread actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-part2-reread-part]').length > 0) {
      errors.push(`Part II continuous reread unexpected Part 2 disclosure marker outside /print: ${path}`);
    }
    errors.push(...validatePart2RereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function part2RereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restorePart2RereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
