import capture from '../config/reader-wall-service-comparison-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput,
} from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';
import { validateWallServiceComparisonFactors } from './reader-wall-service-comparison-factors.mjs';

export const wallServiceComparisonId = 'wall-service-comparison-157';
export const wallServiceComparisonCheckDate = '2026-11-19';
export const wallServiceComparisonRoute = '/docs/book/wall-service-to-comparison';
export const wallServiceComparisonRoutes = Object.freeze([wallServiceComparisonRoute]);
/** @type {string|null} */
export const wallServiceComparisonUnitPin = '752a8c3bb1ac560f93d25e2f50e9549faa4030f53184505486ff5eb243ba8580';
/** @type {string|null} */
export const wallServiceComparisonCapturePin = '6e02e7ed056188100c90d49d8ee0f6e1e373379a81aa5fee1bdb19b5e6cc6262';
export const wallServiceComparisonSource = Object.freeze({
  commit: '8d498f48baf96865ef5e953d8b6a19136cd36ab9',
  tree: 'a7021ebd43dd029a93d94a43df41864ee8f07ef8',
  manifest: 'f522858a1b9e26710824824098a12b98ab2f4d5552261d4e1a1346c302d97301',
  date: '2026-11-19',
});
export const wallServiceComparisonPredecessorPin = '0005f400da7e597217453aad22b2aedbc8c7841323cbc61abf4166a27dca8632';
const addressPin = 'd04743df7dcf47fc8e905d7e69b6f4c4724ee95ac03fef3ca795c06041b26226';

const mdxPath = 'content/docs/book/wall-service-to-comparison.mdx';
const oldMdxSha = '312faf614488fab832e0aeee6bee44e867cc7208bf9c4a31f1dd9877aafb6b0a';

const addedClaimIds = Object.freeze([
  'cl-wsc157-equivalence-and-pairing',
  'cl-wsc157-paired-vs-mc-fallacy',
  'cl-wsc157-ilcd-comparative-assertion',
  'cl-wsc157-pef-pefcr-and-classes',
  'cl-wsc157-ghgp-and-paywalled-iso',
  'cl-wsc157-comparison-synthesis-bridge',
]);
const addedEvidenceIds = Object.freeze([
  'ev-wsc157-ilcd-equivalence-scenarios',
  'ev-wsc157-ilcd-weighting-panel',
  'ev-wsc157-ghgp-comparison-uncertainty',
  'ev-wsc157-heijungs-mc-false-sig',
  'ev-wsc157-pef-pefcr-classes-verification',
  'ev-wsc157-ghgp-no-comparative-assertion',
]);
const addedSourceIds = Object.freeze([
  'src-wsc157-ilcd-2010',
  'src-wsc157-eu-2021-2279-pef',
  'src-wsc157-ghgp-2011',
  'src-wsc157-heijungs-2020',
]);
const addedReadingIds = Object.freeze([
  'rd-wsc157-ilcd-2010',
  'rd-wsc157-eu-2021-2279-pef',
  'rd-wsc157-ghgp-2011',
  'rd-wsc157-heijungs-2020',
]);
const modifiedLiteratureIds = new Set([
  'lit-n03',
  'lit-n04',
  'work-pfr151-ghgp-2011',
  'work-unc149-heijungs-2020',
]);
const addedGapId = 'lit-gap-wsc157-paywalled-iso14044-comparative-assertion';

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'previousFiles',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedRawRecordKeys = new Set(['path', 'id', 'from']);
const allowedRawFieldKeys = new Set(['path', 'from', 'to']);
const allowedChangeKeys = new Set(['kind', 'key', 'from', 'to', 'rationale']);
const allowedConsumerKeys = new Set(['id', 'rationale']);
const allowedHistoryKeys = new Set(['previousAddresses', 'currentAddresses', 'ordinaryTargets', 'history']);
const allowedOrdinaryTargetKeys = new Set(['route', 'sha256', 'tag']);
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

function assertUnitEnvelopeKeys(unit, reviewed) {
  const expectedUnitKeys = reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys;
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles) : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, k => k)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !prevKeys || prevKeys.length !== 1 || prevKeys[0] !== mdxPath || typeof unit.previousFiles[mdxPath] !== 'string'
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
      || !Array.isArray(unit.outputs)
      || !unit.outputs.every(row => exactKeys(row, allowedOutputKeys)
        && scienceText(row.path) && scienceText(row.route) && scienceDigest(row.from) && scienceDigest(row.sha256) && scienceText(row.rationale))
      || !Array.isArray(unit.publicArtifacts)
      || !unit.publicArtifacts.every(row => exactKeys(row, allowedPublicArtifactKeys)
        && scienceText(row.path) && scienceDigest(row.from) && scienceDigest(row.sha256) && scienceText(row.rationale))
      || !plainObject(unit.history.previousAddresses) || !plainObject(unit.history.currentAddresses)
      || !plainObject(unit.history.ordinaryTargets)
      || !Object.values(unit.history.ordinaryTargets).every(row => exactKeys(row, allowedOrdinaryTargetKeys)
        && row.route === wallServiceComparisonRoute && scienceDigest(row.sha256) && ['P', 'TABLE'].includes(row.tag))
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
    throw new Error('Wall service comparison unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectWallServiceComparison(config, pin = wallServiceComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid Wall service comparison configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive Wall service comparison requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== wallServiceComparisonId || !scienceText(unit.rationale)) {
    throw new Error('Invalid Wall service comparison unit identity');
  }
  if (!sameScienceValue(unit.source, wallServiceComparisonSource) || !sameScienceValue(unit.routes, wallServiceComparisonRoutes)) {
    throw new Error('Wall service comparison source or routes mismatch');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Wall service comparison is not independently accepted');
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  assertUnitEnvelopeKeys(unit, true);
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Wall service comparison unit pin mismatch');
  }
  return unit;
}

const allowsRaw = (family, id, from) => (
  (family === 'claims' && from === null && addedClaimIds.includes(id))
  || (family === 'evidence' && from === null && addedEvidenceIds.includes(id))
  || (family === 'sources' && from === null && addedSourceIds.includes(id))
  || (family === 'readings' && from === null && addedReadingIds.includes(id))
  || (family === 'literature' && from !== null && modifiedLiteratureIds.has(id))
  || (family === 'literatureGaps' && from === null && id === addedGapId)
);

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Wall service comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Wall service comparison inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Wall service comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

export function prepareWallServiceComparisonSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Wall service comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && row.key === mdxPath && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Wall service comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== 1) {
    throw new Error('Wall service comparison must bind only the single B29 MDX and declared record changes');
  }
  const prevMdx = unit.previousFiles[mdxPath];
  if (fileChanges.get(mdxPath)?.from !== oldMdxSha || sha256(prevMdx ?? '') !== oldMdxSha) {
    throw new Error('Wall service comparison lacks preserved predecessor bytes for B29 MDX');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1080) throw new Error('Wall service comparison must hold exact 1,080 claims');
  validateWallServiceComparisonFactors(catalog, readings);

  const previousRecords = restoreScientificRecords(
    { catalog, readings, literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  files.set(mdxPath, Buffer.from(prevMdx));
  const previous = inspectReadableBookEdition({ ...previousRecords, files });
  const priorStructure = copyeditSourceStructure({ ...previousRecords, files });

  if (unit.state.before !== wallServiceComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== wallServiceComparisonPredecessorPin
      || unit.state.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Wall service comparison did not recover the independently observed raw 8d498f48 state');
  }

  validateSourceTransitions('file', fileChanges, previous.files, actual.files);
  validateSourceTransitions('record', recordChanges, previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const affectedClaimIds = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!sameScienceValue(unit.consumers.map(row => row.id), affectedClaimIds)) {
    throw new Error('Wall service comparison consumer review set differs from actual dependent claims');
  }
  return { files, previousRecords, previous, structure: priorStructure, affectedClaimIds };
}

export function effectiveWallServiceComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    wallServiceComparison: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function wallServiceComparisonLayout(unit, key, previous) {
  if (!unit) return previous;
  if (key === 'B27:external-consumers') {
    return [
      ...previous,
      'cl-wsc157-paired-vs-mc-fallacy',
      'cl-wsc157-pef-pefcr-and-classes',
      'cl-wsc157-ghgp-and-paywalled-iso',
      'cl-wsc157-comparison-synthesis-bridge',
    ];
  }
  if (key === 'B29:reader-source') {
    const sections = previous.sections.map(sec => (
      sec.id === '配对判断'
        ? { ...sec, claimIds: [...sec.claimIds, ...addedClaimIds] }
        : sec
    ));
    return {
      ...previous,
      sections,
      comparisonTable: {
        section: '配对判断',
        intro: '下表把三套公开国际规范在产品比较对象、不确定性配对、加权禁限、性能分级与外部审查上的核心条款放在同一口径下对照，方便区分“算术配对成立”与“公开比较断言合法”这两层不同资格。',
        headers: ['规范体系与一手来源', '比较适用条件与对象', '不确定性与配对要求', '加权与性能分级立场', '强制外部审查与关键边界'],
        rows: [
          [
            '欧盟国际参考生命周期数据系统指南（ILCD 2010，第 5.2.5、5.3、6.10—6.11、8.4 节）',
            '情景 A 微观决策支持涵盖产品比较与基准对照；非断言并排比较亦须遵守公开比较断言规则，禁止仅凭清单（LCI）比较',
            '同口径建界，仅完全相同部件可省去，部分相关部件须保留并分析相关性；强制做合理最佳／最差情景与不确定度计算',
            '公开比较断言严格禁止使用加权（价值选择不可替代分项影响剖面）',
            '背景与前景数据须经比较断言预审，否则升格为外部评审组审查；会计类情景 C 不得用于优劣采购或政策决策',
          ],
          [
            '欧盟委员会建议书 (EU) 2021/2279（产品环境足迹 PEF，公报 OJ L 144 第 23—24、88、95—102、149 页；原刊 OJ L 471 第 220、291—298、345 页）',
            '仅当遵循有效产品环境足迹类别规则（PEFCR）时允许比较与比较断言；无有效 PEFCR 时仅限内部应用与非比较类对外传播',
            '须按统一类别规则（PEFCR）对齐模型与代表产品基准（BM），并结合灵敏度分析确定理论最佳与最差总分',
            '强制对 16 项环境足迹类别做归一化与加权合成单一总分，按基准中点与 0.30／0.85 系数划分 A—E 五档性能等级',
            '凡对外传播均须第三方验证与确认（重大差错阈值大于 5%，核查员资质至少 6 分，有效期最长 3 年）',
          ],
          [
            '温室气体核算体系（GHG Protocol）产品标准（2011，第 1.5、5.3.2、10.3.4、13.2 节与附录 A）',
            '按原样仅支持同一产品跨期减排追踪；明确不支持产品间总体环境优劣比较断言，跨产品比较须另依产品规则',
            '明确禁止直接并排比较方案 A 与 B 各自的边缘不确定性区间，要求评估比较量本身（如 A/B）的参数与情景不确定性',
            '仅核算单一温室气体指标，不设多类别加权或跨产品性能等级',
            '跨产品比较须对齐分析单元、系统与时间边界、分配方法并完成第三方鉴证；多类别公开比较须满足对应国际标准',
          ],
        ],
      },
    };
  }
  return previous;
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!exactKeys(capture, allowedCaptureKeys) || capture.schemaVersion !== 1
      || !exactKeys(capture.identity, allowedCaptureIdentityKeys)
      || !scienceText(capture.identity.sourceCommit) || typeof capture.identity.dirty !== 'boolean'
      || !scienceText(capture.identity.status) || !scienceDigest(capture.identity.manifestSha256)
      || capture.manifestPaths !== 468
      || !Array.isArray(capture.files) || !capture.files.length
      || !capture.files.every(f => exactKeys(f, allowedCaptureFileKeys) && scienceText(f.path) && scienceDigest(f.sha256) && Number.isSafeInteger(f.bytes) && f.bytes >= 0)
      || !exactKeys(capture.normalization, allowedCaptureNormKeys)
      || !Array.isArray(capture.normalization.articles) || !Array.isArray(capture.normalization.publicHtml)
      || !scienceDigest(wallServiceComparisonCapturePin) || editionDigest(capture) !== wallServiceComparisonCapturePin) {
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

export function verifyWallServiceComparisonReceipts(unit, artifacts, publicDownloads) {
  try {
    assertUnitEnvelopeKeys(unit, true);
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
    const base = `_docs/editorial/review-evidence/${wallServiceComparisonId}/${row.kind}`;
    if (row.date < wallServiceComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function wallServiceComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== wallServiceComparisonRoute) return undefined;
  const slot = index === 0 ? 0 : index === 1 ? 1 : index === 2 ? 2 : index === 3 ? 3 : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-wsc-157-ordinary-${slot}`;
}

export function wallServiceComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-wsc-157-ordinary-(?:[0-3]|table)$/;

export function observeWallServiceComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyWallServiceComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const targets = observeWallServiceComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Wall service comparison', routes: wallServiceComparisonRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: wallServiceComparisonHistoryControls(unit),
      source: wallServiceComparisonSource,
      attribute: 'wall-service-comparison',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Wall service comparison',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Wall service comparison actual versioned ordinary or table targets differ');
  }
  return { prior, errors };
}

export function wallServiceComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreWallServiceComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
