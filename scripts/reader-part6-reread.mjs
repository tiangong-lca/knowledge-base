import capture from '../config/reader-part6-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimIds, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { dataQualityComparisonHistoryControls } from './reader-data-quality-comparison.mjs';
import { part4RereadHistoryControls } from './reader-part4-reread.mjs';
import { part5RereadHistoryControls } from './reader-part5-reread.mjs';
import { uncertaintyComparisonHistoryControls } from './reader-uncertainty-comparison.mjs';
import { validateDataApplicabilityComparisonFactors } from './reader-data-applicability-comparison-factors.mjs';
import { validateDataQualityComparisonFactors } from './reader-data-quality-comparison-factors.mjs';
import { validateProductFootprintComparisonFactors } from './reader-product-footprint-comparison-factors.mjs';
import { validateUncertaintyComparisonFactors } from './reader-uncertainty-comparison-factors.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  projectScientificOrdinaryTargets, qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const part6RereadId = 'part6-reread-155';
export const part6RereadCheckDate = '2026-11-19';
export const part6RereadBookRoute = '/docs/book';
export const part6RereadB26Route = '/docs/book/uncertainty-and-variability';
export const part6RereadB27Route = '/docs/book/data-quality-and-probability';
export const part6RereadRoutes = Object.freeze([
  part6RereadBookRoute,
  part6RereadB26Route,
  part6RereadB27Route,
]);
/** @type {string|null} */
export const part6RereadUnitPin = '000fefcb80a895f43f7515630ece42c0b646d240458cdda7f1a964e64630c5dc';
/** @type {string|null} */
export const part6RereadCapturePin = '5c2d6795d38873c021529d79759822b0488bebca3b24306f7043c23cb7da655b';
export const part6RereadSource = Object.freeze({
  commit: 'b1c911ee7aa0c772559d363e83e13abf765bceb4',
  tree: '2fcacfd07a1b5fad90c052ca1c95973475943006',
  manifest: 'a284b99e6caa2eeb6aedaaa781b2c5614a20c9266bde5800c664268745d136a1',
  date: '2026-11-19',
});
export const part6RereadPredecessorPin = '64c2c9e1718ae618c6aead925be79193eb53b4d8ca25e6701397deaf6d58da7d';
const addressPin = '5b4e2312228401bb46da18634b88af82baf37bbfcc6a0fac4ed80175fdce0d5d';
const previousPrintPart6Sha = '7863cb9a4bdb1ce597b8b48fc91c05236fbbda7ce242222304fcce8b429857dd';

const expectedPart6Intro =
  '一个结果即使能够精确复算，所用资料仍未必代表研究所需的过程。本部依次考察数据与证据链条的四重边界：先比较国际参考生命周期数据系统（ILCD）、欧盟产品环境足迹（PEF）、ecoinvent 第三版与天工规范（TIDAS）对背景数据适用性、区域化父子数据集与多角色审查的治理路径；再辨析固有变异、参数认识不确定性、模型结构、方法选择与数值求解五类误差层次，并检验一阶泰勒与随机全局灵敏度及蒙特卡洛运行次数的失效边界；继而从柏林杯重调查出发，对照 ecoinvent 专家与实证谱系方差、欧盟 PEF 序数数据质量评级（DQR）门槛与温室气体核算体系（GHG Protocol）定性披露对同一套质量词项的截然不同用法；最后对照欧盟建议书、GHG Protocol、欧盟电池法规与生态设计法规（ESPR），说明类别规则、活动数据、合格评定与比较断言门槛如何决定足迹结果的合法用途。下一部将把这些数据、模型与规则边界放回完整的产品方案比较与全书收束判断中。';

export const allowedPart6OrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-6`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-6`,
]));

export const part6RereadCorrections = Object.freeze([
  Object.freeze({
    chapter: '/docs/book/uncertainty-and-variability',
    claimId: 'cl-unc-model',
    noteIndex: 5,
    scope: '前版跨章引用的章号采用阿拉伯数字“第 18 章”。本版统一规范为中文“第十八章”。',
  }),
  Object.freeze({
    chapter: '/docs/book/uncertainty-and-variability',
    claimId: 'cl-unc149-framework-comparison',
    noteIndex: 8,
    scope: '前版仅标明欧盟委员会建议书 (EU) 2021/2279 全篇 384 页，未点明系 2022 年更正重刊版公报 OJ L 144。本版补明公报版次并与第二十七章 2021 年原刊版 OJ L 471（396 页）口径衔接。',
  }),
  Object.freeze({
    chapter: '/docs/book/uncertainty-and-variability',
    claimId: 'cl-unc149-taylor-vs-sampling',
    noteIndex: 10,
    scope: '前版变异系数缩写印作小写 cv。本版统一规范为与第二十七章一致的大写变异系数（CV）。',
  }),
  Object.freeze({
    chapter: '/docs/book/uncertainty-and-variability',
    claimId: 'cl-unc149-gsa-outliers-nonlinearity',
    noteIndex: 11,
    scope: '前版变异系数缩写印作小写 cv。本版统一规范为大写 CV。',
  }),
  Object.freeze({
    chapter: '/docs/book/uncertainty-and-variability',
    claimId: 'cl-book-unc-bridge',
    noteIndex: 16,
    scope: '前版章号采用阿拉伯数字并存在一条指向后章的前提引用。本版统一为中文“第二十七章”并移除前向前提，按出现顺序整理全部前提。',
  }),
  Object.freeze({
    chapter: '/docs/book/data-quality-and-probability',
    claimId: 'cl-dqp-pef-ordinal-dqr',
    noteIndex: 30,
    scope: '前版将欧盟委员会建议书、地域代表性、单一总分、ILCD-EL 与精密度（P）译名与前章略有出入，且仅标 2021 年原刊公报 396 页。本版与第二十五、二十六章统一译名，补明原刊 OJ L 471（396 页）与重刊 OJ L 144（384 页）口径并补接第二十五章前提。',
  }),
  Object.freeze({
    chapter: '/docs/book/data-quality-and-probability',
    claimId: 'cl-ped-score-test-design',
    noteIndex: 33,
    scope: '前版首次出现 EPA 时未附中文全称。本版补全为“美国环保署（US EPA）”。',
  }),
  Object.freeze({
    chapter: '/docs/book/data-quality-and-probability',
    claimId: 'cl-unc-alongside',
    noteIndex: 36,
    scope: '前版首次出现 PMC 时未附全称。本版补全为“PubMed Central（PMC）开放存档作者手稿”。',
  }),
  Object.freeze({
    chapter: '/docs/book/data-quality-and-probability',
    claimId: 'cl-dqp-paywalled-iso-boundary',
    noteIndex: 41,
    scope: '前版略作“欧盟委员会建议 (EU) 2021/2279”。本版与全第六部统一规范为“欧盟委员会建议书 (EU) 2021/2279”。',
  }),
  Object.freeze({
    chapter: '/docs/book/product-footprint-rules-and-practice',
    claimId: 'cl-rule-review-identity',
    noteIndex: 26,
    scope: '前版 EU+EFTA 与 EU+EFTA+UK 未附中文全称。本版补全为“欧盟加欧洲自由贸易联盟（EU+EFTA）”及“欧盟、欧洲自由贸易联盟与英国（EU+EFTA+UK）”。',
  }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': '0a116b6c270cad484ca9a72282859cdcd8deac5dec863e696dff503632cd4d43',
  'content/docs/book/index.mdx': 'feed9ae7aab3ac266177568d13d1b2ba3fcf912ab7705765a31b6462442a13b1',
  'content/docs/book/uncertainty-and-variability.mdx': '872545212b1485e7fc692dbcd00db9c0c7c3b4aedb1d38f3d4a4bb8334daa78b',
  'content/docs/book/data-quality-and-probability.mdx': 'f80c493598ef2ecb07109b4855a2cfb9adb0540570fb0cc8d992ec34df69fe13',
});
const managedPaths = Object.keys(oldFileShas);

const modifiedClaimIds = new Set([
  'cl-unc-model',
  'cl-unc149-framework-comparison',
  'cl-unc149-taylor-vs-sampling',
  'cl-unc149-gsa-outliers-nonlinearity',
  'cl-unc149-comparative-paired-and-pvalue',
  'cl-unc149-pedigree-mc-boundary',
  'cl-unc-numerical',
  'cl-book-unc-bridge',
  'cl-ped-population',
  'cl-unc-calibration',
  'cl-ped-score-mapping',
  'cl-unc-calibration-limits',
  'cl-ped-ratio-rule',
  'cl-dqp-ecoinvent-v3-variance',
  'cl-dqp-pef-ordinal-dqr',
  'cl-ped-score-test-design',
  'cl-ped-three-tests',
  'cl-unc-alongside',
  'cl-unc-synthesis',
  'cl-dqp-ghgp-qualitative-dqi',
  'cl-dqp-four-framework-synthesis',
  'cl-dqp-paywalled-iso-boundary',
  'cl-dqp-cross-chapter-bridge',
  'cl-rule-opening',
  'cl-rule-category',
  'cl-rule-rp',
  'cl-rule-version',
  'cl-rule-issuer',
  'cl-rule-validity',
  'cl-rule-use-boundary',
  'cl-rule-default',
  'cl-rule-results-layer',
  'cl-rule-why-chain',
  'cl-rule-review-identity',
  'cl-rule-nordic-design',
  'cl-pfr151-assurance-vs-notified-body',
  'cl-pfr151-comparative-assertion-gates',
  'cl-pfr151-paywalled-standard-boundaries',
  'cl-rule-conclusion',
]);

const modifiedEvidenceIds = new Set([
  'ev-unc149-eu2021-robustness-hotspots',
  'ev-ped-sampling-population',
  'ev-ped-sampling-design',
  'ev-unc-ciroth-scores',
  'ev-unc-ciroth-calibration',
  'ev-unc-ciroth-empirical',
  'ev-ped-completeness-data',
  'ev-ped-gsd-definition',
  'ev-ped-journal-gsd',
  'ev-unc-ciroth-baseline',
  'ev-unc-ciroth-summary',
  'ev-ped-score-test-design',
  'ev-ped-score-test-results',
  'ev-dqp153-ecoinvent-v3-pedigree',
  'ev-dqp153-ecoinvent-v3-limits',
  'ev-dqp153-ghgp-qualitative-dqi',
  'ev-dqp153-ghgp-uncertainty-boundary',
  'ev-kb44-ec2021-identity',
  'ev-kb44-dairy2025-review',
  'ev-kb44-ipcc2019-index',
  'ev-kb44-nordic2023-record',
  'ev-kb44-pef-guidance2018-identity',
  'ev-kb44-nordic2023-country-discrepancy',
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'partIntroduction', 'printPart6', 'previousFiles', 'occurrences',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedPartIntroKeys = new Set(['part', 'from', 'to', 'rationale']);
const allowedPrintPart6Keys = new Set(['id', 'from', 'to']);
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
  if (keys.length !== allowedPart6OrdinaryOverrideKeys.size) return false;
  return keys.every(key => allowedPart6OrdinaryOverrideKeys.has(key)
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
      || unit.partIntroduction.part !== 6 || !scienceText(unit.partIntroduction.from)
      || unit.partIntroduction.to !== expectedPart6Intro || !scienceText(unit.partIntroduction.rationale)
      || (unit.printPart6 !== null
        && (!exactKeys(unit.printPart6, allowedPrintPart6Keys)
          || unit.printPart6.id !== 'print-part-6'
          || unit.printPart6.from !== previousPrintPart6Sha
          || !scienceDigest(unit.printPart6.to)
          || unit.printPart6.from === unit.printPart6.to))
      || (reviewed && unit.printPart6 === null)
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
        && part6RereadRoutes.includes(row.route) && scienceDigest(row.sha256) && ['P', 'TABLE'].includes(row.tag))
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
    throw new Error('Part VI continuous reread unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectPart6Reread(config, pin = part6RereadUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid Part VI continuous reread configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive Part VI continuous reread requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== part6RereadId || !scienceText(unit.rationale)) {
    throw new Error('Invalid Part VI continuous reread unit identity');
  }
  if (!sameScienceValue(unit.source, part6RereadSource) || !sameScienceValue(unit.routes, part6RereadRoutes)) {
    throw new Error('Part VI continuous reread source or routes mismatch');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Part VI continuous reread is not independently accepted');
    assertUnitEnvelopeKeys(unit, false, Object.keys(unit.history?.ordinaryOverrides ?? {}).length === 0);
    return unit;
  }
  assertUnitEnvelopeKeys(unit, true, false);
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Part VI continuous reread unit pin mismatch');
  }
  return unit;
}

const allowsRaw = (family, id, from) => (
  (family === 'claims' && from !== null && modifiedClaimIds.has(id))
  || (family === 'evidence' && from !== null && modifiedEvidenceIds.has(id))
);

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Part VI continuous reread missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Part VI continuous reread inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Part VI continuous reread declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

function assertPart6PremiseDagAndAscending(catalog, files) {
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
  const part6Routes = new Set(['book-data-applicability', part6RereadB26Route, part6RereadB27Route, '/docs/book/product-footprint-rules-and-practice']);
  for (const [id, p] of pos.entries()) {
    if (!part6Routes.has(p.route)) continue;
    const c = claimById.get(id);
    if (!c || c.caseBinding || !c.premiseIds?.length) continue;
    let prev = null;
    for (const pid of c.premiseIds) {
      const pp = pos.get(pid);
      if (!pp) continue;
      if (pp.uOrder > p.uOrder || (pp.uOrder === p.uOrder && pp.note >= p.note)) {
        throw new Error(`Part VI continuous reread forward/self premise violation: ${id} -> ${pid}`);
      }
      if (prev && (prev.uOrder > pp.uOrder || (prev.uOrder === pp.uOrder && prev.note > pp.note))) {
        throw new Error(`Part VI continuous reread non-ascending premiseIds on ${id}`);
      }
      prev = pp;
    }
  }
}

export function preparePart6RereadSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, Object.keys(unit.history?.ordinaryOverrides ?? {}).length === 0);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Part VI continuous reread lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Part VI continuous reread cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length) {
    throw new Error('Part VI continuous reread must bind all 4 managed files and only declared changes');
  }
  for (const p of managedPaths) {
    const prevText = unit.previousFiles[p];
    if (fileChanges.get(p)?.from !== oldFileShas[p] || sha256(prevText ?? '') !== oldFileShas[p]) {
      throw new Error(`Part VI continuous reread lacks preserved predecessor bytes for ${p}`);
    }
  }
  const curNumbering = JSON.parse(files.get('config/reader-numbering.json').toString());
  const prevNumbering = JSON.parse(unit.previousFiles['config/reader-numbering.json']);
  const curPart6 = curNumbering.parts.find(p => p.number === 6);
  const prevPart6 = prevNumbering.parts.find(p => p.number === 6);
  if (curPart6?.introduction !== expectedPart6Intro || prevPart6?.introduction !== unit.partIntroduction.from) {
    throw new Error('Part VI continuous reread parts[5].introduction mismatch');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1074) throw new Error('Part VI continuous reread must keep claim count fixed at 1074');
  assertPart6PremiseDagAndAscending(catalog, files);
  validateDataApplicabilityComparisonFactors(catalog, readings);
  validateUncertaintyComparisonFactors(catalog, readings);
  validateProductFootprintComparisonFactors(catalog, readings);
  validateDataQualityComparisonFactors(catalog, readings);

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
  if (unit.state?.before !== part6RereadPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== part6RereadPredecessorPin) {
    throw new Error('Part VI continuous reread did not recover the independently observed raw b1c911ee state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Part VI continuous reread actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Part VI continuous reread lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...modifiedClaimIds])],
  };
}

export function effectivePart6Reread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    part6Reread: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function projectPart6RereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 6 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to)) {
    throw new Error('Part VI continuous reread has an invalid Part 6 introduction transition');
  }
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 6);
  if (!slot || slot.introduction !== to) {
    throw new Error('Part VI continuous reread numbering differs from the reviewed Part 6 introduction');
  }
  slot.introduction = from;
  return projected;
}

export function projectPart6RereadPrintParts(unit, printParts) {
  if (!unit || !printParts || !unit.printPart6) return printParts;
  const { id, from, to } = unit.printPart6;
  const slot = printParts[5];
  if (id !== 'print-part-6' || from !== previousPrintPart6Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-6' || slot.sha256 !== from) {
    throw new Error('Part VI continuous reread printed Part 6 header differs from its accepted 8148/95 predecessor');
  }
  return printParts.map(row => row.id === 'print-part-6' ? { id: 'print-part-6', sha256: to } : row);
}

export function part6RereadLayout(unit, key, previous) {
  if (!unit) return previous;
  if (key === 'B27:external-consumers') {
    const [first, ...rest] = previous.filter(id => id !== 'cl-book-unc-bridge');
    return [
      first,
      'cl-rule-conclusion',
      'cl-pfr151-assurance-vs-notified-body',
      'cl-pfr151-product-vs-corporate-scope3',
      'cl-pfr151-comparative-assertion-gates',
      'cl-pfr151-paywalled-standard-boundaries',
      ...rest,
    ];
  }
  if (key !== 'B27:reader-source' || !previous?.comparisonTable) return previous;
  return {
    ...previous,
    comparisonTable: {
      ...previous.comparisonTable,
      rows: previous.comparisonTable.rows.map((r, i) => {
        if (i === 2) {
          return [
            '欧盟 PEF 序数评级（建议书 (EU) 2021/2279 附件一第 4.6.5 节）',
            r[1],
            '四项等权算术平均得 DQR（式 19–20），划 5 档序数等级；2021 年原刊公报 OJ L 471 全文 396 页（2022 年更正重刊版 OJ L 144 全文 384 页）均未设置概率转换',
            ...r.slice(3),
          ];
        }
        if (i === 3) {
          return [
            '温室气体核算体系（GHG Protocol）产品标准（2011，第 8.3 节与第 10 章）及美国环保署框架',
            '5 项（技术、时间、地域、完整性、可靠性）；4 档定性（很好/良好/尚可/差）',
            ...r.slice(2),
          ];
        }
        return r;
      }),
    },
  };
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
      || !scienceDigest(part6RereadCapturePin) || editionDigest(capture) !== part6RereadCapturePin) {
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

export function verifyPart6RereadReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${part6RereadId}/${row.kind}`;
    if (row.date < part6RereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function part6RereadOrdinaryId(unit, route, print, index) {
  if (!unit) return undefined;
  if (route === part6RereadB26Route && (index === 'table-1' || index === 'table-2')) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-part6-155-ordinary-${index}`;
  }
  if (route === part6RereadB27Route && (index === 3 || index === 'table-2')) {
    const slot = index === 3 ? 'p-3' : 'table-2';
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-part6-155-ordinary-${slot}`;
  }
  return undefined;
}

export function part6RereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /(?:(?:chapter|print-unit)-2f646f63732f626f6f6b-part4-133-ordinary-\d+|-unc-149-ordinary-0|-dqp-153-ordinary-[0-3]|-part6-155-ordinary-(?:p-3|table-[12]))$/;

export function observePart6RereadOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id)
      && part6RereadRoutes.includes(node.closest('article[data-reader-route]')?.getAttribute('data-reader-route')))
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

export function validatePart6RereadPartDisclosure(printDoc, unit) {
  if (!unit) return [];
  if (!printDoc) return ['Part VI continuous reread missing /print document for Part 6 introduction check'];
  const errors = [];
  const parts = fingerprintCopyeditPrintParts(printDoc);
  if (parts[5]?.id !== 'print-part-6' || parts[5]?.sha256 !== unit.printPart6?.to) {
    errors.push('Part VI continuous reread printed Part 6 header fingerprint differs from reviewed output');
  }
  const disclosures = printDoc.querySelectorAll('[data-part6-reread-part]');
  if (disclosures.length !== 1) {
    return [...errors, 'Part VI continuous reread requires exactly one printed Part 6 introduction disclosure'];
  }
  const node = disclosures[0];
  const group = printDoc.querySelector('[data-reader-part-group="6"]');
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

  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-part6-reread-part')
      || node.getAttribute('data-part6-reread-part') !== '6'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || node.nextElementSibling?.tagName !== 'ARTICLE'
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part6RereadSource.date
      || !singleTextChild(time, part6RereadSource.date) || summaryTailText !== ' 版第六部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-part6-reread-part-source', 'href')
      || link.getAttribute('data-part6-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(part6RereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node)) {
    errors.push('Part VI continuous reread printed Part 6 disclosure has invalid text, position or source link');
  }
  return errors;
}

export function validatePart6RereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-part6-reread-correction]');
  const expectedRows = unit
    ? part6RereadCorrections.filter(row => path === '/print' || path === row.chapter)
    : [];
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Part VI continuous reread correction notices are absent, extra or detached: ${path}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-part6-reread-correction') === claimId);
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
        || !attrs(marker, 'class', 'data-part6-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part6RereadSource.date
        || !singleTextChild(time, part6RereadSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(part6RereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Part VI continuous reread correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

const part7SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-5`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-5`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-7`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-7`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-8`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-8`,
]));

const part3SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-3`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-3`,
]));

const part1SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-2`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-2`,
]));

export function qualifyPart6RereadHistory(documents, unit, actual, part5Reread, part4Reread, uncertaintyComparison, dataQualityComparison, part7Reread = null, part3Reread = null, part2Reread = null, part1Reread = null) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, false);
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true)) {
    throw new Error('Part VI continuous reread ordinaryOverrides violates the 2-key allowlist');
  }
  let successorOverrides = null;
  const allowedSuccessorKeys = new Set();
  if (part7Reread) {
    const raw = part7Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part7SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part VI continuous reread successor ordinaryOverrides violates the 6-key Part VII allowlist');
    successorOverrides = Object.fromEntries([...part7SuccessorOverrideKeys].map(key => [key, { from: raw[key].from, to: raw[key].to }]));
    for (const k of part7SuccessorOverrideKeys) allowedSuccessorKeys.add(k);
  }
  if (part3Reread) {
    const raw = part3Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part3SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part VI continuous reread successor ordinaryOverrides violates the 2-key Part III allowlist');
    successorOverrides = { ...(successorOverrides ?? {}) };
    for (const key of part3SuccessorOverrideKeys) {
      successorOverrides[key] = { from: raw[key].from, to: raw[key].to };
      allowedSuccessorKeys.add(key);
    }
  }
  if (part2Reread) {
    const raw = part2Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part3SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part VI continuous reread successor ordinaryOverrides violates the 2-key Part II allowlist');
    successorOverrides = { ...(successorOverrides ?? {}) };
    for (const key of part3SuccessorOverrideKeys) {
      if (successorOverrides[key]) {
        if (successorOverrides[key].to !== raw[key].from)
          throw new Error(`Part VI continuous reread chained successor ordinaryOverrides broken at ${key}`);
        successorOverrides[key] = { from: successorOverrides[key].from, to: raw[key].to };
      } else {
        successorOverrides[key] = { from: raw[key].from, to: raw[key].to };
      }
      allowedSuccessorKeys.add(key);
    }
  }
  if (part1Reread) {
    const raw = part1Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part1SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part VI continuous reread successor ordinaryOverrides violates the 2-key Part I allowlist');
    successorOverrides = { ...(successorOverrides ?? {}) };
    for (const key of part1SuccessorOverrideKeys) {
      successorOverrides[key] = { from: raw[key].from, to: raw[key].to };
      allowedSuccessorKeys.add(key);
    }
  }
  const targets = projectScientificOrdinaryTargets(
    successorOverrides,
    observePart6RereadOrdinaryTargets(documents),
    'Part VI continuous reread',
    allowedSuccessorKeys.size ? allowedSuccessorKeys : part7SuccessorOverrideKeys,
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Part VI continuous reread', routes: part6RereadRoutes, predecessorPin: addressPin,
  });
  const part6Entry = prior['/print#print-part-6'];
  if (!part6Entry || part6Entry.introduction !== unit.partIntroduction.to) {
    throw new Error('Part VI continuous reread /print#print-part-6 lacks the reviewed Part 6 introduction');
  }
  prior['/print#print-part-6'] = { ...part6Entry, introduction: unit.partIntroduction.from };

  const historyBlockMap = new Map();
  for (const hRow of unit.history.history ?? []) {
    const pathPart = hRow.address.split('#')[0];
    for (const b of hRow.ordinary ?? []) {
      historyBlockMap.set(`${pathPart}#${b.targetId}`, { from: b.from, to: b.to });
    }
  }
  for (const [key, row] of Object.entries(overrides)) {
    const hBlock = historyBlockMap.get(key);
    const priorSha = part5Reread?.history?.ordinaryTargets?.[key]?.sha256 ?? part4Reread?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || (priorSha !== undefined && priorSha !== row.from)) {
      throw new Error(`Part VI continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
    }
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: part6RereadHistoryControls(unit),
      source: part6RereadSource,
      attribute: 'part6-reread',
      previousHistory: [
        { attribute: 'data-quality-comparison', expected: dataQualityComparisonHistoryControls(dataQualityComparison) },
        { attribute: 'uncertainty-comparison', expected: uncertaintyComparisonHistoryControls(uncertaintyComparison) },
        { attribute: 'part5-reread', expected: part5RereadHistoryControls(part5Reread) },
        { attribute: 'part4-reread', expected: part4RereadHistoryControls(part4Reread) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Part VI continuous reread',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
      ordinaryOverrides: successorOverrides,
    }),
    ...validatePart6RereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Part VI continuous reread actual versioned ordinary or table targets differ');
  }
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-part6-reread-part]').length > 0) {
      errors.push(`Part VI continuous reread unexpected Part 6 disclosure marker outside /print: ${path}`);
    }
    errors.push(...validatePart6RereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function part6RereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restorePart6RereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
