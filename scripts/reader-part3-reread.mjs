import capture from '../config/reader-part3-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimIds, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { substitutionRulesHistoryControls } from './reader-substitution-rules.mjs';
import { part4RereadHistoryControls } from './reader-part4-reread.mjs';
import { part5RereadHistoryControls } from './reader-part5-reread.mjs';
import { part6RereadHistoryControls } from './reader-part6-reread.mjs';
import { part7RereadHistoryControls } from './reader-part7-reread.mjs';
import { marketResponseComparisonHistoryControls } from './reader-market-response-comparison.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  projectScientificOrdinaryTargets, qualifyScientificHistory, restoreScientificRecords,
  sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const part3RereadId = 'part3-reread-171';
export const part3RereadCheckDate = '2026-11-20';
export const part3RereadBookRoute = '/docs/book';
export const part3RereadB10Route = 'book-joint-production';
export const part3RereadB11Route = '/docs/book/market-boundaries-and-response';
export const part3RereadB13Route = '/docs/book/recycling-chains-and-accounting';
export const part3RereadM02Route = '/docs/allocation';
export const part3RereadRoutes = Object.freeze([
  part3RereadBookRoute,
  part3RereadB10Route,
  part3RereadB11Route,
  part3RereadB13Route,
  part3RereadM02Route,
]);
/** @type {string|null} */
export const part3RereadUnitPin = 'c593cf40b39588037babee5be8215fabf587f7004efc9567e131d0a31c9969a1';
/** @type {string|null} */
export const part3RereadCapturePin = 'e326a5b2db0aa56533c8b03bef79f4c8e03cbe668dae0ed0751395ec41d74f27';
export const part3RereadSource = Object.freeze({
  commit: 'f6d1eca5190bb2afaade08549c59405b48e026cc',
  tree: 'cf8bd3f1ccc6e2a688cf964a47789a6359e58060',
  manifest: '7ad1496989597501df45e528a3336260e279648da02128ae18068debf6722915',
  date: '2026-11-20',
});
export const part3RereadPredecessorPin = 'b8a2024458f64ff6339ed178f75bd165a8d45fb125389bc4c83e58c410bfc3f4';
/** @type {string|null} */
const addressPin = '815ac9d80116beba1f54614bee264608224a76a83bdf6578e7cafc8d827abf9e';
const previousPrintPart3Sha = 'c6fd6223e0fe2418cc48d0d9165215089e245d1a9c03804e8ab990f213d30084';

const expectedPart3Intro =
  '一次生产同时产出多种产品时，既可以问已有排放该怎样按物理或经济依据分担，也可以问改换供给在何种条件下会引发哪些供应者增产、减产或退出。本部依次沿共同生产、市场响应、供电系统与材料循环展开这两种判断：先辨析共产品份额、参照残余与规则边界；再对照国际参考生命周期数据系统（ILCD）、ecoinvent 第三版后果模型、欧盟产品环境足迹（PEF）与温室气体核算体系（GHG Protocol）在决策尺度、合同追踪与受约束供给上的条件与分歧；继而沿输配网段、电量账户与短长期边际响应检验电力尺度；最后在瓦楞纸回收链中辨明负担交接、质量折算与循环足迹公式（CFF）的外部替代边界。查清活动和排放怎样变化之后，下一部将进一步追查这些排放与资源开采会沿着怎样的环境路径转化为中点与终点指标。';

export const allowedPart3OrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-3`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-3`,
]));

const scopeMarketClosing = '前版末段仅收束瑞士电量账与两种新增需求算例，未并入前轮增补的 ILCD、ecoinvent 第三版后果模型、欧盟 PEF 与 GHG Protocol 四体系跨体系比较结论。本版补充跨体系比较收束句并接入跨体系实证与治理局限前提。';
const scopeCycleToPart4 = '前版末段收束于材料循环与循环足迹公式边界，缺少向第四部（中点与终点）的连续过渡。本版补充承接第四部环境路径的收束过渡句。';

export const part3RereadCorrections = Object.freeze([
  Object.freeze({ chapter: part3RereadB11Route, claimId: 'cl-market-closing', noteIndex: 38, scope: scopeMarketClosing }),
  Object.freeze({ chapter: part3RereadB13Route, claimId: 'cl-cff109-judgment', noteIndex: 41, scope: scopeCycleToPart4 }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': '00f6705b45997052fc6ca6f9675d04711d93e063181beda7195e22ebc1b802d0',
  'content/docs/book/index.mdx': '63ea7364026aed1f9d82193774ab5d15ab0bf35770bf060ca8e1fbc96e914a1a',
  'content/monograph/joint-production.mdx': '652107e87723aaf4f5e033bfdbaf8b63cb5a84fed7e99f5dd8c4345feefcfa7c',
  'content/docs/allocation.mdx': '3f2e69919e1800edab7566d948c733973ed376a08ece8705eed2edf80483ea7f',
});
const managedPaths = Object.keys(oldFileShas);

const modifiedClaimIds = new Set([
  'cl-allocation-cascade-level',
  'cl-allocation-causal-directions',
  'cl-allocation-alternative-supply',
  'cl-allocation-three-responsibilities',
  'cl-allocation-reading-a-rule',
  'cl-allocation-1998-sales-criterion',
  'cl-market-closing',
  'cl-cycle-opening',
  'cl-cycle-substitution-chain',
  'cl-cycle-substitution-point',
  'cl-cycle-performance-question',
  'cl-cycle-conclusion',
  'cl-sub105-ilcd-market',
  'cl-sub105-fallbacks',
  'cl-shift107-complete-action',
  'cl-shift107-comparison-judgment',
  'cl-cff109-question',
  'cl-cff109-control',
  'cl-cff109-judgment',
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'partIntroduction', 'printPart3', 'previousFiles', 'occurrences',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedPartIntroKeys = new Set(['part', 'from', 'to', 'rationale']);
const allowedPrintPart3Keys = new Set(['id', 'from', 'to']);
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
  if (!requireExact && keys.length === 0) return true;
  if (keys.length !== allowedPart3OrdinaryOverrideKeys.size) return false;
  return keys.every(key => allowedPart3OrdinaryOverrideKeys.has(key)
    && exactKeys(overrides[key], allowedOrdinaryOverrideKeys)
    && scienceDigest(overrides[key].from) && scienceDigest(overrides[key].to)
    && overrides[key].from !== overrides[key].to && scienceText(overrides[key].rationale));
}

function assertUnitEnvelopeKeys(unit, reviewed, isSeed = false) {
  const expectedUnitKeys = reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys;
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles) : null;
  const occKeys = plainObject(unit?.occurrences) ? Object.keys(unit.occurrences) : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, k => k)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !exactKeys(unit.partIntroduction, allowedPartIntroKeys)
      || unit.partIntroduction.part !== 3 || !scienceText(unit.partIntroduction.from)
      || unit.partIntroduction.to !== expectedPart3Intro || !scienceText(unit.partIntroduction.rationale)
      || (unit.printPart3 !== null
        && (!exactKeys(unit.printPart3, allowedPrintPart3Keys)
          || unit.printPart3.id !== 'print-part-3'
          || unit.printPart3.from !== previousPrintPart3Sha
          || !scienceDigest(unit.printPart3.to)
          || unit.printPart3.from === unit.printPart3.to))
      || (reviewed && unit.printPart3 === null)
      || !prevKeys || prevKeys.length !== managedPaths.length
      || !prevKeys.every(k => Object.hasOwn(oldFileShas, k) && typeof unit.previousFiles[k] === 'string')
      || !occKeys || !occKeys.every(k => Object.hasOwn(oldFileShas, k) && Array.isArray(unit.occurrences[k]))
      || !Array.isArray(unit.rawRecords)
      || !unit.rawRecords.every(r => exactKeys(r, allowedRawRecordKeys) && scienceText(r.path) && scienceText(r.id))
      || !Array.isArray(unit.rawFields)
      || !unit.rawFields.every(r => exactKeys(r, allowedRawFieldKeys) && scienceText(r.path))
      || !Array.isArray(unit.changes)
      || !unit.changes.every(row => exactKeys(row, allowedChangeKeys)
        && (row.kind === 'file' || row.kind === 'record') && scienceText(row.key) && scienceText(row.rationale))
      || !Array.isArray(unit.consumers)
      || !unit.consumers.every(row => exactKeys(row, allowedConsumerKeys) && scienceText(row.id) && scienceText(row.rationale))
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !validOrdinaryOverridesShape(unit.history.ordinaryOverrides, !isSeed)
      || !Array.isArray(unit.outputs)
      || !unit.outputs.every(row => exactKeys(row, allowedOutputKeys)
        && scienceText(row.path) && scienceText(row.route) && scienceDigest(row.from) && scienceDigest(row.sha256) && scienceText(row.rationale))
      || !Array.isArray(unit.publicArtifacts)
      || !unit.publicArtifacts.every(row => exactKeys(row, allowedPublicArtifactKeys)
        && scienceText(row.path) && scienceDigest(row.from) && scienceDigest(row.sha256) && scienceText(row.rationale))
      || !plainObject(unit.history.previousAddresses) || !plainObject(unit.history.currentAddresses)
      || !plainObject(unit.history.ordinaryTargets)
      || !Object.values(unit.history.ordinaryTargets).every(row => exactKeys(row, allowedOrdinaryTargetKeys)
        && part3RereadRoutes.includes(row.route) && scienceDigest(row.sha256) && ['P', 'TABLE'].includes(row.tag))
      || !Array.isArray(unit.history.history)
      || !unit.history.history.every(row => exactKeys(row, allowedHistoryRowKeys)
        && scienceDigest(row.from) && scienceText(row.rationale) && Array.isArray(row.ordinary)
        && row.ordinary.every(b => exactKeys(b, allowedOrdinaryBlockKeys)
          && scienceDigest(b.from) && scienceDigest(b.to) && scienceText(b.address) && scienceText(b.targetId) && scienceText(b.rationale)))
      || (reviewed
        ? !exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
          || !scienceText(unit.outputCapture.sourceCommit) || typeof unit.outputCapture.dirty !== 'boolean'
          || !scienceText(unit.outputCapture.status) || !scienceDigest(unit.outputCapture.manifestSha256)
          || !scienceDigest(unit.outputCapture.normalizedProofSha256)
          || !Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
          || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys)
            && scienceText(row.kind) && scienceText(row.date) && scienceText(row.artifactFile)
            && scienceDigest(row.artifactSha256) && scienceText(row.reportFile) && scienceDigest(row.reportSha256))
        : unit.outputCapture !== null
          && (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
            || !scienceText(unit.outputCapture.sourceCommit) || typeof unit.outputCapture.dirty !== 'boolean'
            || !scienceText(unit.outputCapture.status)
            || !scienceDigest(unit.outputCapture.manifestSha256)
            || !scienceDigest(unit.outputCapture.normalizedProofSha256)))) {
    throw new Error('Part III continuous reread unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectPart3Reread(config, pin = part3RereadUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid Part III continuous reread configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive Part III continuous reread requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== part3RereadId || !scienceText(unit.rationale)) {
    throw new Error('Invalid Part III continuous reread unit identity');
  }
  if (!sameScienceValue(unit.source, part3RereadSource) || !sameScienceValue(unit.routes, part3RereadRoutes)) {
    throw new Error('Part III continuous reread source or routes mismatch');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Part III continuous reread is not independently accepted');
    assertUnitEnvelopeKeys(unit, false, Object.keys(unit.history?.ordinaryOverrides ?? {}).length === 0);
    return unit;
  }
  assertUnitEnvelopeKeys(unit, true, false);
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Part III continuous reread unit pin mismatch');
  }
  return unit;
}

const allowsRaw = (family, id, from) => (
  family === 'claims' && from !== null && modifiedClaimIds.has(id)
);

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Part III continuous reread missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Part III continuous reread inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Part III continuous reread declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

function assertPart3PremiseDagAndAscending(catalog, files) {
  const claimById = new Map(catalog.claims.map(c => [c.id, c]));
  const edition = JSON.parse(files.get('config/book-edition.json').toString());
  const pos = new Map();
  let uOrder = 0;
  for (const u of edition.units) {
    if (u.kind !== 'chapter') continue;
    uOrder += 1;
    const rel = u.source.startsWith('/') ? `content${u.source}.mdx` : `content/monograph/${u.source.replace(/^book-/, '')}.mdx`;
    const buf = files.get(rel);
    if (!buf) continue;
    const ids = collectChapterClaimIds(buf.toString());
    ids.forEach((id, i) => { if (!pos.has(id)) pos.set(id, { uOrder, note: i + 1, route: u.source }); });
  }
  const part3Sources = new Set([
    '/monograph/joint-production',
    part3RereadB11Route,
    '/docs/book/electricity-service-and-response',
    part3RereadB13Route,
  ]);
  for (const [id, p] of pos.entries()) {
    if (!part3Sources.has(p.route)) continue;
    const c = claimById.get(id);
    if (!c || c.caseBinding || !c.premiseIds?.length) continue;
    let prev = null;
    for (const pid of c.premiseIds) {
      const pp = pos.get(pid);
      if (!pp) continue;
      if (pp.uOrder > p.uOrder || (pp.uOrder === p.uOrder && pp.note >= p.note)) {
        throw new Error(`Part III continuous reread forward/self premise violation: ${id} -> ${pid}`);
      }
      if (prev && (prev.uOrder > pp.uOrder || (prev.uOrder === pp.uOrder && prev.note > pp.note))) {
        throw new Error(`Part III continuous reread non-ascending premiseIds on ${id}`);
      }
      prev = pp;
    }
  }
}

export function preparePart3RereadSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, Object.keys(unit.history?.ordinaryOverrides ?? {}).length === 0);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Part III continuous reread lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Part III continuous reread cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length) {
    throw new Error('Part III continuous reread must bind all 4 managed files and only declared changes');
  }
  for (const p of managedPaths) {
    const prevText = unit.previousFiles[p];
    if (fileChanges.get(p)?.from !== oldFileShas[p] || sha256(prevText ?? '') !== oldFileShas[p]) {
      throw new Error(`Part III continuous reread lacks preserved predecessor bytes for ${p}`);
    }
  }
  const curNumbering = JSON.parse(files.get('config/reader-numbering.json').toString());
  const prevNumbering = JSON.parse(unit.previousFiles['config/reader-numbering.json']);
  const curPart3 = curNumbering.parts.find(p => p.number === 3);
  const prevPart3 = prevNumbering.parts.find(p => p.number === 3);
  if (curPart3?.introduction !== expectedPart3Intro || prevPart3?.introduction !== unit.partIntroduction.from) {
    throw new Error('Part III continuous reread parts[2].introduction mismatch');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1106) throw new Error('Part III continuous reread must keep claim count fixed at 1106');
  assertPart3PremiseDagAndAscending(catalog, files);

  const previousRecords = restoreScientificRecords(
    { catalog, readings, literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  for (const p of managedPaths) files.set(p, Buffer.from(unit.previousFiles[p]));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== part3RereadPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== part3RereadPredecessorPin) {
    throw new Error('Part III continuous reread did not recover the independently observed raw f6d1eca5 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Part III continuous reread actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Part III continuous reread lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...modifiedClaimIds])],
  };
}

export function effectivePart3Reread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    part3Reread: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function projectPart3RereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 3 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to)) {
    throw new Error('Part III continuous reread has an invalid Part 3 introduction transition');
  }
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 3);
  if (!slot || slot.introduction !== to) {
    throw new Error('Part III continuous reread numbering differs from the reviewed Part 3 introduction');
  }
  slot.introduction = from;
  return projected;
}

export function projectPart3RereadPrintParts(unit, printParts) {
  if (!unit || !printParts || !unit.printPart3) return printParts;
  const { id, from, to } = unit.printPart3;
  const slot = printParts[2];
  if (id !== 'print-part-3' || from !== previousPrintPart3Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-3' || slot.sha256 !== from) {
    throw new Error('Part III continuous reread printed Part 3 header differs from its accepted 8148/95 predecessor');
  }
  return printParts.map(row => row.id === 'print-part-3' ? { id: 'print-part-3', sha256: to } : row);
}

export function part3RereadLayout(unit, key, previous) {
  if (!unit || !previous) return previous;
  if (key === 'B10:/docs/allocation:source' && Array.isArray(previous.ordinary)) {
    return {
      ...previous,
      ordinary: [{
        section: '把格式连接与方法放在一起比较',
        text: '流与交换解释数据怎样表达，功能单位与参考流帮助固定要提供的服务；共产品的分配与替代与分配规则与修订进一步比较共同生产的分担理由与替代边界，市场响应、供电系统与材料循环则依次检验供应响应、电力尺度与回收交接。',
        navigation: [
          { text: '流与交换', href: '/docs/flows/' },
          { text: '功能单位与参考流', href: '/docs/functional-unit/' },
          { text: '共产品的分配与替代', href: '/docs/book/allocation-and-substitution/' },
          { text: '分配规则与修订', href: '/docs/book/allocation-judgment-and-corrections/' },
          { text: '市场响应', href: '/docs/book/market-boundaries-and-response/' },
          { text: '供电系统', href: '/docs/book/electricity-service-and-response/' },
          { text: '材料循环', href: '/docs/book/recycling-chains-and-accounting/' },
        ],
      }],
    };
  }
  return previous;
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
      || !scienceDigest(part3RereadCapturePin) || editionDigest(capture) !== part3RereadCapturePin) {
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

export function verifyPart3RereadReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${part3RereadId}/${row.kind}`;
    if (row.date < part3RereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function part3RereadOrdinaryId(unit, route, print, index) {
  if (!unit) return undefined;
  if (route === part3RereadM02Route && (index === 0 || index === 8)) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-part3-171-ordinary-${index}`;
  }
  return undefined;
}

export function part3RereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /(?:(?:chapter|print-unit)-2f646f63732f626f6f6b-part4-133-ordinary-3|-part3-171-ordinary-(?:0|8))$/;

export function observePart3RereadOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id)
      && part3RereadRoutes.includes(node.closest('article[data-reader-route]')?.getAttribute('data-reader-route')))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

const nonCommentChildren = node => (node?.childNodes ?? []).filter(c => c.nodeType !== 8 && (c.nodeType !== 3 || c.text !== ''));
const singleTextChild = (node, text) => {
  const ch = nonCommentChildren(node);
  return ch.length === 1 && ch[0].nodeType === 3 && ch[0].text === text;
};
const attrs = (node, ...names) => {
  const actual = Object.keys(node?.attributes ?? {}).map(k => k.toLowerCase()).sort();
  return sameScienceValue(actual, names.map(k => k.toLowerCase()).sort());
};

export function validatePart3RereadPartDisclosure(printDoc, unit) {
  if (!unit) return [];
  if (!printDoc) return ['Part III continuous reread missing /print document for Part 3 introduction check'];
  const errors = [];
  const parts = fingerprintCopyeditPrintParts(printDoc);
  if (parts[2]?.id !== 'print-part-3' || parts[2]?.sha256 !== unit.printPart3?.to) {
    errors.push('Part III continuous reread printed Part 3 header fingerprint differs from reviewed output');
  }
  const disclosures = printDoc.querySelectorAll('[data-part3-reread-part]');
  if (disclosures.length !== 1) {
    return [...errors, 'Part III continuous reread requires exactly one printed Part 3 introduction disclosure'];
  }
  const node = disclosures[0];
  const group = printDoc.querySelector('[data-reader-part-group="3"]');
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

  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-part3-reread-part')
      || node.getAttribute('data-part3-reread-part') !== '3'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || node.nextElementSibling?.tagName !== 'ARTICLE'
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part3RereadSource.date
      || !singleTextChild(time, part3RereadSource.date) || summaryTailText !== ' 版第三部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-part3-reread-part-source', 'href')
      || link.getAttribute('data-part3-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(part3RereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node)) {
    errors.push('Part III continuous reread printed Part 3 disclosure has invalid text, position or source link');
  }
  return errors;
}

export function validatePart3RereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-part3-reread-correction]');
  const expectedRows = !unit
    ? []
    : part3RereadCorrections.filter(row => path === '/print' || path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Part III continuous reread correction notices are absent, extra or detached: ${path}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-part3-reread-correction') === claimId);
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
        || !attrs(marker, 'class', 'data-part3-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part3RereadSource.date
        || !singleTextChild(time, part3RereadSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(part3RereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Part III continuous reread correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyPart3RereadHistory(documents, unit, actual, marketResponseComparison, part7Reread, part6Reread, part5Reread, part4Reread, substitutionRules, part2Reread = null) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, false);
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true)) {
    throw new Error('Part III continuous reread ordinaryOverrides violates the 2-key allowlist');
  }
  let successorOverrides = null;
  if (part2Reread) {
    const raw = part2Reread.history?.ordinaryOverrides;
    if (!validOrdinaryOverridesShape(raw, true)) {
      throw new Error('Part III continuous reread successor ordinaryOverrides violates the 2-key Part II allowlist');
    }
    successorOverrides = Object.fromEntries([...allowedPart3OrdinaryOverrideKeys].map(key => [key, { from: raw[key].from, to: raw[key].to }]));
  }
  const targets = projectScientificOrdinaryTargets(
    successorOverrides,
    observePart3RereadOrdinaryTargets(documents),
    'Part III continuous reread',
    allowedPart3OrdinaryOverrideKeys,
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Part III continuous reread', routes: part3RereadRoutes, predecessorPin: addressPin,
  });
  const part3Entry = prior['/print#print-part-3'];
  if (!part3Entry || part3Entry.introduction !== unit.partIntroduction.to) {
    throw new Error('Part III continuous reread /print#print-part-3 lacks the reviewed Part 3 introduction');
  }
  prior['/print#print-part-3'] = { ...part3Entry, introduction: unit.partIntroduction.from };

  const historyBlockMap = new Map();
  for (const hRow of unit.history.history ?? []) {
    const pathPart = hRow.address.split('#')[0];
    for (const b of hRow.ordinary ?? []) {
      historyBlockMap.set(`${pathPart}#${b.targetId}`, { from: b.from, to: b.to });
    }
  }
  for (const [key, row] of Object.entries(overrides)) {
    const hBlock = historyBlockMap.get(key);
    const priorSha =
      part4Reread?.history?.ordinaryTargets?.[key]?.sha256
      ?? substitutionRules?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || (priorSha !== undefined && priorSha !== row.from)) {
      throw new Error(`Part III continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
    }
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: part3RereadHistoryControls(unit),
      source: part3RereadSource,
      attribute: 'part3-reread',
      previousHistory: [
        { attribute: 'market-response-comparison', expected: marketResponseComparisonHistoryControls(marketResponseComparison) },
        { attribute: 'part7-reread', expected: part7RereadHistoryControls(part7Reread) },
        { attribute: 'part6-reread', expected: part6RereadHistoryControls(part6Reread) },
        { attribute: 'part5-reread', expected: part5RereadHistoryControls(part5Reread) },
        { attribute: 'part4-reread', expected: part4RereadHistoryControls(part4Reread) },
        { attribute: 'substitution-rules', expected: substitutionRulesHistoryControls(substitutionRules) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Part III continuous reread',
      ordinaryOverrides: successorOverrides,
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
    ...validatePart3RereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Part III continuous reread actual versioned ordinary or table targets differ');
  }
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-part3-reread-part]').length > 0) {
      errors.push(`Part III continuous reread unexpected Part 3 disclosure marker outside /print: ${path}`);
    }
    errors.push(...validatePart3RereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function part3RereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restorePart3RereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
