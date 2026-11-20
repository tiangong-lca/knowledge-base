import capture from '../config/reader-part7-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimIds, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { part4RereadHistoryControls } from './reader-part4-reread.mjs';
import { part5RereadHistoryControls } from './reader-part5-reread.mjs';
import { part6RereadHistoryControls } from './reader-part6-reread.mjs';
import { interpretationBagsHistoryControls } from './reader-interpretation-bags.mjs';
import { futureScenariosHistoryControls } from './reader-future-scenarios.mjs';
import { revisableJudgmentHistoryControls } from './reader-revisable-judgment.mjs';
import { validateWallServiceComparisonFactors } from './reader-wall-service-comparison-factors.mjs';
import { validateInterpretationBagsFactors } from './reader-interpretation-bags-factors.mjs';
import { validateFutureScenariosFactors } from './reader-future-scenarios-factors.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const part7RereadId = 'part7-reread-165';
export const part7RereadCheckDate = '2026-11-20';
export const part7RereadBookRoute = '/docs/book';
export const part7RereadB30Route = '/docs/book/interpretation-and-limits';
export const part7RereadB31Route = '/docs/book/future-technology-and-context';
export const part7RereadW1Route = '/docs/book/connecting-objects-references-and-time';
export const part7RereadW2Route = '/docs/book/from-connected-results-to-conditional-judgment';
export const part7RereadB32Route = 'book-revisable-judgment';
export const part7RereadRoutes = Object.freeze([
  part7RereadBookRoute,
  part7RereadB30Route,
  part7RereadB31Route,
  part7RereadW1Route,
  part7RereadW2Route,
  part7RereadB32Route,
]);
/** @type {string|null} */
export const part7RereadUnitPin = 'b7288820c439dedfeef9fe098e116075ba01969c789daadb209aeee254b4819d';
/** @type {string|null} */
export const part7RereadCapturePin = '21d1fc7d712ff181b71dfd421b0f073af8fec7851c43b0043916dfdd85e1002e';
export const part7RereadSource = Object.freeze({
  commit: '29771936c01311172371a4569dc1b1154e205599',
  tree: '730de43fee80674797a93cb325480e1f3c5c3846',
  manifest: '7df27d4e0eeda9fda4ead4ad664319c47dad7eaad7a92182f707d6b65b8a4627',
  date: '2026-11-20',
});
export const part7RereadPredecessorPin = 'bee2fa565bce572fd86fe00e63bdedb4e974a912f70033e781efbd0a041c3b3d';
const addressPin = '82b79b392e1c1525c0f581af9f9f915e960ef970530ecfe3d06ac762942178a6';
const previousPrintPart7Sha = 'c7f4ff96204d892e37b1e38d487bad646f523590a819335fba607e0ff691fed5';

const expectedPart7Intro =
  '比较两个方案的环境负担，不能只看单一指标或单一场景。本部先通过墙面服务比较复算假想条件，辨明功能单位、参考流、系统边界与国际参考生命周期数据系统（ILCD）、欧盟产品环境足迹（PEF）及温室气体核算体系（GHG Protocol）对比较断言与成对不确定性的门槛；再借助英国环境署（2011）与丹麦环保署（2018）购物袋评估，对照 ILCD 与 PEF 的热点阈值、负信用重算及关键性审查体制；继而区分前瞻性、事前、预期式、实验室尺度与动态评价，说明工艺放大、综合评估模型（IAM）超结构情景耦合与动态时间边界如何影响未来比较；最后回到全书开篇的容器研究，结合墙面与购物袋案例收束七类修订路由，辨认哪些结论已有依据、哪些应随新证据定向修订。';

export const allowedPart7OrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-5`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-5`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-7`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-7`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-8`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-8`,
  `${part7RereadB31Route}#${chapterAnchorPrefix(part7RereadB31Route)}-fut-161-ordinary-table`,
  `/print#${printUnitAnchor(part7RereadB31Route)}-fut-161-ordinary-table`,
  `${part7RereadW2Route}#${chapterAnchorPrefix(part7RereadW2Route)}-rev-163-ordinary-table`,
  `/print#${printUnitAnchor(part7RereadB32Route)}-rev-163-ordinary-table`,
]));

const scopeIncumbent = '前版跨章引用采用阿拉伯数字“第 29 章”。本版统一规范为中文“第二十九章”。';
const scopeImpactLimits = '前版跨章引用采用阿拉伯数字“第 15 章”。本版统一规范为中文“第十五章”。';
const scopeChar = '前版将表征译作“特征化”。本版与全书统一规范为“表征”。';
const scopeCharAndSens = '前版将表征与灵敏度分别写作“特征化”“敏感度”。本版与全书统一规范为“表征”“灵敏度”。';
const scopeCompAssertion = '前版将比较断言写作“比较性断言”，并将付费标准略作“付费墙保护”。本版统一规范为“比较断言”与“受版权与付费授权保护”。';
const scopeFutureDecision = '前版章中提前出现“下一章回到已完成的几个比较”收束句，与后文动态时间边界和表末过渡重迭。本版移去该提前收束句，由表末过渡段统一承接末章。';
const scopeDynamicHorizons = '前版将表征译作“特征化”，且段首承接前段提前收束句。本版统一规范为“表征”并收紧段首过渡（保留“受体敏感度”）。';
const scopeRefFlow = '前版写作“参照流”。本版与全第七部统一规范为“参考流”。';
const scopeCritReview = '前版写作“关键评审”。本版与全第七部统一规范为“关键性审查”。';

export const part7RereadCorrections = Object.freeze([
  Object.freeze({ chapter: '/docs/book/wall-service-to-comparison', claimId: 'cl-wsc157-ghgp-and-paywalled-iso', noteIndex: 26, scope: scopeCritReview }),
  Object.freeze({ chapter: part7RereadB30Route, claimId: 'cl-int159-danish-epa-fu-eol', noteIndex: 23, scope: scopeRefFlow }),
  Object.freeze({ chapter: part7RereadB31Route, claimId: 'cl-future-incumbent', noteIndex: 2, scope: scopeIncumbent }),
  Object.freeze({ chapter: part7RereadB31Route, claimId: 'cl-fut161-terminology-axes', noteIndex: 3, scope: scopeChar }),
  Object.freeze({ chapter: part7RereadB31Route, claimId: 'cl-future-impact-limits', noteIndex: 10, scope: scopeImpactLimits }),
  Object.freeze({ chapter: part7RereadB31Route, claimId: 'cl-book-future-decision', noteIndex: 12, scope: scopeFutureDecision }),
  Object.freeze({ chapter: part7RereadB31Route, claimId: 'cl-fut161-dynamic-time-horizons', noteIndex: 13, scope: scopeDynamicHorizons }),
  Object.freeze({ chapter: part7RereadB31Route, claimId: 'cl-fut161-temporal-barriers-values', noteIndex: 14, scope: scopeCharAndSens }),
  Object.freeze({ chapter: part7RereadW1Route, claimId: 'cl-rev163-lcia-pathway-and-packet-drift', noteIndex: 4, scope: scopeChar }),
  Object.freeze({ chapter: part7RereadW1Route, claimId: 'cl-rev163-circular-and-prospective-coupling', noteIndex: 9, scope: scopeChar }),
  Object.freeze({ chapter: part7RereadW2Route, claimId: 'cl-rev163-comparative-assertion-three-regimes', noteIndex: 10, scope: scopeCompAssertion }),
  Object.freeze({ chapter: part7RereadW2Route, claimId: 'cl-rev163-targeted-revision-routing', noteIndex: 17, scope: scopeChar }),
  Object.freeze({ chapter: part7RereadB32Route, claimId: 'cl-rev163-circular-and-prospective-coupling', noteIndex: 6, scope: scopeChar }),
  Object.freeze({ chapter: part7RereadB32Route, claimId: 'cl-rev163-lcia-pathway-and-packet-drift', noteIndex: 14, scope: scopeChar }),
  Object.freeze({ chapter: part7RereadB32Route, claimId: 'cl-rev163-comparative-assertion-three-regimes', noteIndex: 22, scope: scopeCompAssertion }),
  Object.freeze({ chapter: part7RereadB32Route, claimId: 'cl-rev163-targeted-revision-routing', noteIndex: 27, scope: scopeChar }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': '29c1bc18e1b8022dddb7bfd93d58822f7feb8ea09a6a4e076e70d7f1bb64bb03',
  'content/docs/book/index.mdx': 'e45f967925b30571a1f1f46a48ab36363e409488d452941a7bdb1e336d3ac50a',
  'content/docs/book/interpretation-and-limits.mdx': 'a2c0c0c2e9d15af32a37f3c7ae9c29101930d6c24b06315127ca700f5574e200',
  'content/docs/book/future-technology-and-context.mdx': '37be3b07a787d4235667488dd34aacb39531fa714b2da79fbd244cd8ec180095',
  'content/docs/book/from-connected-results-to-conditional-judgment.mdx': '015a7bda1ab0ff8d890fb92964323dfa7b818a4ac0eab71127cb8954b3d8a690',
  'content/monograph/revisable-judgment.mdx': 'ab54da53f21966ed44d158c3fdbf26a92e48be30ec6485577aa475864272d743',
});
const managedPaths = Object.keys(oldFileShas);

const modifiedClaimIds = new Set([
  'cl-wsc157-ghgp-and-paywalled-iso',
  'cl-int159-danish-epa-fu-eol',
  'cl-int159-danish-epa-multi-indicator',
  'cl-future-incumbent',
  'cl-fut161-terminology-axes',
  'cl-book-future-scenario-matrix',
  'cl-fut161-superstructure-iam',
  'cl-future-impact-limits',
  'cl-fut161-dynamic-time-horizons',
  'cl-fut161-temporal-barriers-values',
  'cl-rev163-circular-and-prospective-coupling',
  'cl-rev163-lcia-pathway-and-packet-drift',
  'cl-rev163-comparative-assertion-three-regimes',
  'cl-rev163-targeted-revision-routing',
  'cl-pack-acceptance',
  'cl-pack-recommendation',
  'cl-pack-iterate',
  'cl-book-future-decision',
  'cl-connect-object-before-unit',
  'cl-connect-three-scalings',
  'cl-connect-time-relations',
  'cl-connect-reuse-keeps-relation',
  'cl-connect-zero-needs-origin',
  'cl-connect-proxy-and-outcome',
  'cl-connect-evidence-to-probability',
  'cl-connect-coverage-and-overlap',
  'cl-rev163-pedigree-dqr-and-sampling-limits',
  'cl-connect-values-stay-specific',
  'cl-connect-useful-without-winner',
  'cl-pack-limits',
  'cl-connect-next-evidence-at-link',
  'cl-closing-historical-return',
  'cl-rev163-monograph-closing-boundary',
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'partIntroduction', 'printPart7', 'previousFiles', 'occurrences',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedPartIntroKeys = new Set(['part', 'from', 'to', 'rationale']);
const allowedPrintPart7Keys = new Set(['id', 'from', 'to']);
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
  if (keys.length !== allowedPart7OrdinaryOverrideKeys.size) return false;
  return keys.every(key => allowedPart7OrdinaryOverrideKeys.has(key)
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
      || unit.partIntroduction.part !== 7 || !scienceText(unit.partIntroduction.from)
      || unit.partIntroduction.to !== expectedPart7Intro || !scienceText(unit.partIntroduction.rationale)
      || (unit.printPart7 !== null
        && (!exactKeys(unit.printPart7, allowedPrintPart7Keys)
          || unit.printPart7.id !== 'print-part-7'
          || unit.printPart7.from !== previousPrintPart7Sha
          || !scienceDigest(unit.printPart7.to)
          || unit.printPart7.from === unit.printPart7.to))
      || (reviewed && unit.printPart7 === null)
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
        && part7RereadRoutes.includes(row.route) && scienceDigest(row.sha256) && ['P', 'TABLE'].includes(row.tag))
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
    throw new Error('Part VII continuous reread unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectPart7Reread(config, pin = part7RereadUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid Part VII continuous reread configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive Part VII continuous reread requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== part7RereadId || !scienceText(unit.rationale)) {
    throw new Error('Invalid Part VII continuous reread unit identity');
  }
  if (!sameScienceValue(unit.source, part7RereadSource) || !sameScienceValue(unit.routes, part7RereadRoutes)) {
    throw new Error('Part VII continuous reread source or routes mismatch');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Part VII continuous reread is not independently accepted');
    assertUnitEnvelopeKeys(unit, false, Object.keys(unit.history?.ordinaryOverrides ?? {}).length === 0);
    return unit;
  }
  assertUnitEnvelopeKeys(unit, true, false);
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Part VII continuous reread unit pin mismatch');
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
    if (!row) throw new Error(`Part VII continuous reread missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Part VII continuous reread inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Part VII continuous reread declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

function assertPart7PremiseDagAndAscending(catalog, files) {
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
  const part7Sources = new Set([
    '/docs/book/wall-service-to-comparison',
    part7RereadB30Route,
    part7RereadB31Route,
    '/monograph/revisable-judgment',
  ]);
  for (const [id, p] of pos.entries()) {
    if (!part7Sources.has(p.route)) continue;
    const c = claimById.get(id);
    if (!c || c.caseBinding || !c.premiseIds?.length) continue;
    let prev = null;
    for (const pid of c.premiseIds) {
      const pp = pos.get(pid);
      if (!pp) continue;
      if (pp.uOrder > p.uOrder || (pp.uOrder === p.uOrder && pp.note >= p.note)) {
        throw new Error(`Part VII continuous reread forward/self premise violation: ${id} -> ${pid}`);
      }
      if (prev && (prev.uOrder > pp.uOrder || (prev.uOrder === pp.uOrder && prev.note > pp.note))) {
        throw new Error(`Part VII continuous reread non-ascending premiseIds on ${id}`);
      }
      prev = pp;
    }
  }
}

export function preparePart7RereadSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, Object.keys(unit.history?.ordinaryOverrides ?? {}).length === 0);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Part VII continuous reread lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Part VII continuous reread cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length) {
    throw new Error('Part VII continuous reread must bind all 6 managed files and only declared changes');
  }
  for (const p of managedPaths) {
    const prevText = unit.previousFiles[p];
    if (fileChanges.get(p)?.from !== oldFileShas[p] || sha256(prevText ?? '') !== oldFileShas[p]) {
      throw new Error(`Part VII continuous reread lacks preserved predecessor bytes for ${p}`);
    }
  }
  const curNumbering = JSON.parse(files.get('config/reader-numbering.json').toString());
  const prevNumbering = JSON.parse(unit.previousFiles['config/reader-numbering.json']);
  const curPart7 = curNumbering.parts.find(p => p.number === 7);
  const prevPart7 = prevNumbering.parts.find(p => p.number === 7);
  if (curPart7?.introduction !== expectedPart7Intro || prevPart7?.introduction !== unit.partIntroduction.from) {
    throw new Error('Part VII continuous reread parts[6].introduction mismatch');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1099) throw new Error('Part VII continuous reread must keep claim count fixed at 1099');
  assertPart7PremiseDagAndAscending(catalog, files);
  validateWallServiceComparisonFactors(catalog, readings);
  validateInterpretationBagsFactors(catalog, readings);
  validateFutureScenariosFactors(catalog, readings);

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
  if (unit.state?.before !== part7RereadPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== part7RereadPredecessorPin) {
    throw new Error('Part VII continuous reread did not recover the independently observed raw a55c9fb3 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Part VII continuous reread actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Part VII continuous reread lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...modifiedClaimIds])],
  };
}

export function effectivePart7Reread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    part7Reread: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function projectPart7RereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 7 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to)) {
    throw new Error('Part VII continuous reread has an invalid Part 7 introduction transition');
  }
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 7);
  if (!slot || slot.introduction !== to) {
    throw new Error('Part VII continuous reread numbering differs from the reviewed Part 7 introduction');
  }
  slot.introduction = from;
  return projected;
}

export function projectPart7RereadPrintParts(unit, printParts) {
  if (!unit || !printParts || !unit.printPart7) return printParts;
  const { id, from, to } = unit.printPart7;
  const slot = printParts[6];
  if (id !== 'print-part-7' || from !== previousPrintPart7Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-7' || slot.sha256 !== from) {
    throw new Error('Part VII continuous reread printed Part 7 header differs from its accepted 8148/95 predecessor');
  }
  return printParts.map(row => row.id === 'print-part-7' ? { id: 'print-part-7', sha256: to } : row);
}

export function part7RereadLayout(unit, key, previous) {
  if (!unit || !previous) return previous;
  if ((key === 'B32:/docs/book/from-connected-results-to-conditional-judgment:reader-source'
      || key === 'B32:/monograph/revisable-judgment:reader-source')
      && previous.source?.tables?.[0]?.rows) {
    const tables = previous.source.tables.map((t, ti) => ti !== 0 ? t : {
      ...t,
      rows: t.rows.map(r => r.map(cell => cell
        .replaceAll('特征化模型与影响路径', '表征模型与影响路径')
        .replaceAll('变异与不确定度', '变异与不确定性')
        .replaceAll('比较性断言资格', '比较断言资格')
        .replaceAll('敏感度结构', '灵敏度结构'))),
    });
    return { ...previous, source: { ...previous.source, tables } };
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
      || !scienceDigest(part7RereadCapturePin) || editionDigest(capture) !== part7RereadCapturePin) {
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

export function verifyPart7RereadReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${part7RereadId}/${row.kind}`;
    if (row.date < part7RereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function part7RereadOrdinaryId(unit, route, print, index) {
  if (!unit) return undefined;
  if (route === part7RereadB30Route && index === 'table-2') {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-part7-165-ordinary-table-2`;
  }
  if (route === part7RereadB31Route && index === 2) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-part7-165-ordinary-2`;
  }
  return undefined;
}

export function part7RereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /(?:(?:chapter|print-unit)-2f646f63732f626f6f6b-part4-133-ordinary-\d+|-int-159-ordinary-(?:[0-4]|table)|-fut-161-ordinary-(?:[0-1]|table)|-rev-163-ordinary-(?:[0-2]|table)|-part7-165-ordinary-(?:2|table-2))$/;

export function observePart7RereadOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id)
      && part7RereadRoutes.includes(node.closest('article[data-reader-route]')?.getAttribute('data-reader-route')))
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

export function validatePart7RereadPartDisclosure(printDoc, unit) {
  if (!unit) return [];
  if (!printDoc) return ['Part VII continuous reread missing /print document for Part 7 introduction check'];
  const errors = [];
  const parts = fingerprintCopyeditPrintParts(printDoc);
  if (parts[6]?.id !== 'print-part-7' || parts[6]?.sha256 !== unit.printPart7?.to) {
    errors.push('Part VII continuous reread printed Part 7 header fingerprint differs from reviewed output');
  }
  const disclosures = printDoc.querySelectorAll('[data-part7-reread-part]');
  if (disclosures.length !== 1) {
    return [...errors, 'Part VII continuous reread requires exactly one printed Part 7 introduction disclosure'];
  }
  const node = disclosures[0];
  const group = printDoc.querySelector('[data-reader-part-group="7"]');
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

  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-part7-reread-part')
      || node.getAttribute('data-part7-reread-part') !== '7'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || node.nextElementSibling?.tagName !== 'ARTICLE'
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part7RereadSource.date
      || !singleTextChild(time, part7RereadSource.date) || summaryTailText !== ' 版第七部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-part7-reread-part-source', 'href')
      || link.getAttribute('data-part7-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(part7RereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node)) {
    errors.push('Part VII continuous reread printed Part 7 disclosure has invalid text, position or source link');
  }
  return errors;
}

export function validatePart7RereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-part7-reread-correction]');
  const expectedRows = !unit
    ? []
    : part7RereadCorrections.filter(row =>
        path === '/print'
          ? (row.chapter !== part7RereadW1Route && row.chapter !== part7RereadW2Route)
          : path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Part VII continuous reread correction notices are absent, extra or detached: ${path}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-part7-reread-correction') === claimId);
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
        || !attrs(marker, 'class', 'data-part7-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part7RereadSource.date
        || !singleTextChild(time, part7RereadSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(part7RereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Part VII continuous reread correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyPart7RereadHistory(documents, unit, actual, revisableJudgment, futureScenarios, interpretationBags, part6Reread, part5Reread, part4Reread) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, false);
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true)) {
    throw new Error('Part VII continuous reread ordinaryOverrides violates the 10-key allowlist');
  }
  const targets = observePart7RereadOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Part VII continuous reread', routes: part7RereadRoutes, predecessorPin: addressPin,
  });
  const part7Entry = prior['/print#print-part-7'];
  if (!part7Entry || part7Entry.introduction !== unit.partIntroduction.to) {
    throw new Error('Part VII continuous reread /print#print-part-7 lacks the reviewed Part 7 introduction');
  }
  prior['/print#print-part-7'] = { ...part7Entry, introduction: unit.partIntroduction.from };

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
      revisableJudgment?.history?.ordinaryTargets?.[key]?.sha256
      ?? futureScenarios?.history?.ordinaryTargets?.[key]?.sha256
      ?? part6Reread?.history?.ordinaryTargets?.[key]?.sha256
      ?? part5Reread?.history?.ordinaryTargets?.[key]?.sha256
      ?? part4Reread?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || (priorSha !== undefined && priorSha !== row.from)) {
      throw new Error(`Part VII continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
    }
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: part7RereadHistoryControls(unit),
      source: part7RereadSource,
      attribute: 'part7-reread',
      previousHistory: [
        { attribute: 'revisable-judgment', expected: revisableJudgmentHistoryControls(revisableJudgment) },
        { attribute: 'future-scenarios', expected: futureScenariosHistoryControls(futureScenarios) },
        { attribute: 'interpretation-bags', expected: interpretationBagsHistoryControls(interpretationBags) },
        { attribute: 'part6-reread', expected: part6RereadHistoryControls(part6Reread) },
        { attribute: 'part5-reread', expected: part5RereadHistoryControls(part5Reread) },
        { attribute: 'part4-reread', expected: part4RereadHistoryControls(part4Reread) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Part VII continuous reread',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
    ...validatePart7RereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Part VII continuous reread actual versioned ordinary or table targets differ');
  }
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-part7-reread-part]').length > 0) {
      errors.push(`Part VII continuous reread unexpected Part 7 disclosure marker outside /print: ${path}`);
    }
    errors.push(...validatePart7RereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function part7RereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restorePart7RereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
