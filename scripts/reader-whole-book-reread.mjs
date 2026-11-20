import capture from '../config/reader-whole-book-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimIds, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { part1RereadHistoryControls } from './reader-part1-reread.mjs';
import { part2RereadHistoryControls } from './reader-part2-reread.mjs';
import { part3RereadHistoryControls } from './reader-part3-reread.mjs';
import { part4RereadHistoryControls } from './reader-part4-reread.mjs';
import { part5RereadHistoryControls } from './reader-part5-reread.mjs';
import { part6RereadHistoryControls } from './reader-part6-reread.mjs';
import { part7RereadHistoryControls } from './reader-part7-reread.mjs';
import { frameworkComparisonHistoryControls } from './reader-framework-comparison.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const wholeBookRereadId = 'whole-book-reread-183';
export const wholeBookRereadCheckDate = '2026-11-20';
export const wholeBookRereadBookRoute = '/docs/book';
export const wholeBookRereadB04Web1Route = '/docs/book/framework-history';
export const wholeBookRereadB04MonoRoute = 'book-framework-responsibilities';
export const wholeBookRereadB23Route = '/docs/book/social-assessment-objects-and-meaning';
export const wholeBookRereadB24Route = '/docs/book/cost-perspectives-and-sustainability-combination';
export const wholeBookRereadB25Web2Route = '/docs/book/review-support-and-version-boundaries';
export const wholeBookRereadB25MonoRoute = 'book-data-applicability';
export const wholeBookRereadB26Route = '/docs/book/uncertainty-and-variability';
export const wholeBookRereadB27Route = '/docs/book/product-footprint-rules-and-practice';

export const wholeBookRereadRoutes = Object.freeze([
  wholeBookRereadBookRoute,
  wholeBookRereadB04Web1Route,
  wholeBookRereadB26Route,
  wholeBookRereadB27Route,
]);

/** @type {string|null} */
export const wholeBookRereadUnitPin = '9bb83a6b2efc2875b0278c16786d85b9aacb0f8c5a99573aeb79a181624ed5b4';
/** @type {string|null} */
export const wholeBookRereadCapturePin = '1c27606d5f42bf755622aa0c89c8bee4df41e6cdceebfb523d09d132a284e02f';
export const wholeBookRereadPredecessorPin = '533f12cbaf79de6f15515c69b70ee77596e627f1d4446b58223748034adf13ec';

export const wholeBookRereadSource = Object.freeze({
  commit: '4b9c3958f316693f85e0bab789400a8215b19ca9',
  date: '2026-11-20',
});

/** @type {string|null} */
const addressPin = '6aabcaca645bbf3859ae633a34993c37bb3d8b920b775fbbd969c75055f3fc19';
const previousPrintPart4Sha = '23126203d56cce9cf1896a37adbc3eb69d34efef22d5ece109da469d009f244a';

const expectedPart4Intro =
  '清单给出了资源采掘、土地利用、取耗水和污染物排放等数量。要知道这些活动可能带来什么后果，还要沿着环境机制追查：本部从中点与终点的因果截点出发，依次考察土地恢复与矿产、化石资源，气候响应、排放时间与生物碳，酸化、富营养化、光化学臭氧、平流层臭氧与电离辐射，以及颗粒物健康损害、耗水缺水与多介质化学毒性；并跨体系对照 ReCiPe 2016、欧盟环境足迹（EF 3.1）、全球生命周期影响评价指南（GLAM）、政府间气候变化专门委员会第六次评估报告（IPCC AR6）、剩余可用水模型（AWARE）与 USEtox 在空间背景、时间窗口、暴露路径与不确定性边界上的真实分歧，为第五部《尺度与取舍》讨论跨类别权衡打下基础。';

export const allowedWholeBookOrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-4`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-4`,
  `/docs/book/framework-history#${chapterAnchorPrefix('/docs/book/framework-history')}-fw-179-ordinary-table`,
  `/print#${printUnitAnchor('book-framework-responsibilities')}-fw-179-ordinary-table`,
  `/docs/book/uncertainty-and-variability#${chapterAnchorPrefix('/docs/book/uncertainty-and-variability')}-part6-155-ordinary-table-1`,
  `/print#${printUnitAnchor('/docs/book/uncertainty-and-variability')}-part6-155-ordinary-table-1`,
  `/docs/book/uncertainty-and-variability#${chapterAnchorPrefix('/docs/book/uncertainty-and-variability')}-part6-155-ordinary-table-2`,
  `/print#${printUnitAnchor('/docs/book/uncertainty-and-variability')}-part6-155-ordinary-table-2`,
]));

const scopeTerm = '全书连续回读将无意漂移的“特征化”统一规范为全书主术语“表征”（保留第二十一章国标与中英文术语对照说明）。';

export const wholeBookRereadCorrections = Object.freeze([
  Object.freeze({ chapter: wholeBookRereadB04Web1Route, claimId: 'cl-fw179-impact-weighting', noteIndex: 23, scope: scopeTerm }),
  Object.freeze({ chapter: wholeBookRereadB04MonoRoute, claimId: 'cl-fw179-impact-weighting', noteIndex: 57, scope: scopeTerm }),
  Object.freeze({ chapter: wholeBookRereadB23Route, claimId: 'cl-soc139-cross-pillar-overlap-audit', noteIndex: 15, scope: scopeTerm }),
  Object.freeze({ chapter: wholeBookRereadB24Route, claimId: 'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation', noteIndex: 3, scope: scopeTerm }),
  Object.freeze({ chapter: wholeBookRereadB25Web2Route, claimId: 'cl-dapp147-package-migration-inheritance-and-surveillance', noteIndex: 8, scope: scopeTerm }),
  Object.freeze({ chapter: wholeBookRereadB25MonoRoute, claimId: 'cl-dapp147-package-migration-inheritance-and-surveillance', noteIndex: 19, scope: scopeTerm }),
  Object.freeze({ chapter: wholeBookRereadB26Route, claimId: 'cl-unc149-gsa-outliers-nonlinearity', noteIndex: 11, scope: scopeTerm }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': 'ee2cd9419aa98d4eeb1ba5b124affa733241c26c3d070e09cb4e0a52ddd72c11',
  'content/docs/book/index.mdx': '3013ba681b2c9e3b752a3a258c3472f6a8645cafc381a65adae1645551c208ad',
  'content/docs/book/framework-history.mdx': '3ad8c4af3e34272ae4b3acb848046bcee707767240bd0783456b3095d4995986',
  'content/monograph/framework-responsibilities.mdx': '1aa62d4bcd843511a37a76f1d88862aa8352ad462f152452402cc9e20fb1676c',
  'content/docs/book/product-footprint-rules-and-practice.mdx': '8336c743915161e884210991a8519539042c19308ba7091bc495d597c9e12b66',
  'content/docs/book/uncertainty-and-variability.mdx': '9a5e3da2a6f0930db6a35a413ec77f5efca7b41ab935ab757e36c455253ce03b',
});
const managedPaths = Object.keys(oldFileShas);

const modifiedClaimIds = new Set([
  'cl-acid113-chemistry-control',
  'cl-acid113-glam-relation',
  'cl-acid113-nh3-control',
  'cl-acid113-so2-rows',
  'cl-bio127-feedback-perspective-asymmetry',
  'cl-bio127-package-and-report-discrepancies',
  'cl-climate-calendar-sum',
  'cl-climate-comparison-criteria',
  'cl-climate-debate',
  'cl-cml-screening-range-limit',
  'cl-dapp147-package-migration-inheritance-and-surveillance',
  'cl-eutro129-nitrogen-soil-prohibition',
  'cl-eutro129-phosphorus-soil-water-interface',
  'cl-fossil117-uranium-boundary',
  'cl-fw179-impact-weighting',
  'cl-hist-what-closed',
  'cl-land111-aggregation',
  'cl-land111-horizon',
  'cl-land111-integral',
  'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
  'cl-mineral115-cost-proxy',
  'cl-ozone119-multipath-accounting',
  'cl-ozone119-titration-sign',
  'cl-ozrad121-ir-horizons',
  'cl-ozrad121-odp-horizons',
  'cl-path-pdf',
  'cl-pm-compatible-population',
  'cl-pm-conclusion',
  'cl-pm-effect-definition',
  'cl-pm-exposure-compatible',
  'cl-pm-population-meaning',
  'cl-pm-regional-summary',
  'cl-pm-uncovered-pathways',
  'cl-soc139-cross-pillar-overlap-audit',
  'cl-tox123-cross-system-synthesis',
  'cl-tox123-midpoint-families',
  'cl-tox123-perspective-switches',
  'cl-unc149-gsa-outliers-nonlinearity',
  'cl-usetox-conclusion',
  'cl-water-background-inventory',
  'cl-water-marginal-contexts',
  'cl-water-version-and-boundary',
  'cl-water125-country-rank-reversals',
  'cl-water125-diagnostic-synthesis',
  'cl-water125-package-report-discrepancies',
]);

const modifiedEvidenceIds = new Set([
  'ev-cml-1992-part1-identity',
  'ev-kb52-cml1992-backgrounds-identity',
]);

const plainObject = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const exactKeys = (value, allowed) => plainObject(value)
  && Object.keys(value).length === allowed.size
  && Object.keys(value).every(key => allowed.has(key));
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedPreviewUnitKeys = new Set([
  'id', 'scope', 'rationale', 'routes', 'state', 'partIntroduction', 'printPart4',
  'changes', 'consumers', 'previousFiles', 'rawRecords', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedPartIntroKeys = new Set(['part', 'from', 'to']);
const allowedPrintPartKeys = new Set(['id', 'from', 'to']);
const allowedHistoryKeys = new Set(['previousAddresses', 'currentAddresses', 'ordinaryTargets', 'ordinaryOverrides', 'history']);
const allowedOrdinaryTargetKeys = new Set(['route', 'sha256', 'tag']);
const allowedOrdinaryOverrideKeys = new Set(['from', 'to', 'rationale']);
const allowedHistoryRowKeys = new Set(['address', 'from', 'ordinary', 'rationale']);
const allowedOrdinaryBlockKeys = new Set(['from', 'to', 'address', 'targetId', 'rationale']);
const allowedOutputKeys = new Set(['path', 'route', 'from', 'sha256', 'rationale']);
const allowedPublicArtifactKeys = new Set(['path', 'from', 'sha256', 'rationale']);
const allowedOutputCaptureKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256', 'normalizedProofSha256']);
const allowedReviewEvidenceKeys = new Set(['kind', 'date', 'artifactFile', 'artifactSha256', 'reportFile', 'reportSha256']);
const allowedCaptureKeys = new Set(['schemaVersion', 'identity', 'manifestPaths', 'files', 'normalization']);
const allowedCaptureIdentityKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256']);
const allowedCaptureFileKeys = new Set(['path', 'sha256', 'bytes']);
const allowedCaptureNormKeys = new Set(['articles', 'publicHtml']);

function validOrdinaryOverridesShape(overrides, requireNonEmpty) {
  if (!plainObject(overrides)) return false;
  const keys = Object.keys(overrides);
  if (requireNonEmpty && keys.length !== allowedWholeBookOrdinaryOverrideKeys.size) return false;
  if (!requireNonEmpty && keys.length !== 0 && keys.length !== allowedWholeBookOrdinaryOverrideKeys.size) return false;
  return keys.every(key => allowedWholeBookOrdinaryOverrideKeys.has(key)
    && exactKeys(overrides[key], allowedOrdinaryOverrideKeys)
    && scienceDigest(overrides[key].from) && scienceDigest(overrides[key].to)
    && overrides[key].from !== overrides[key].to && scienceText(overrides[key].rationale));
}

function assertUnitEnvelopeKeys(unit, reviewed, previewPass1) {
  if (!exactKeys(unit, reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys)
      || !exactKeys(unit.state, allowedStateKeys)
      || !exactKeys(unit.partIntroduction, allowedPartIntroKeys)
      || (unit.printPart4 !== null && !exactKeys(unit.printPart4, allowedPrintPartKeys))
      || (reviewed && !exactKeys(unit.printPart4, allowedPrintPartKeys))
      || !plainObject(unit.previousFiles)
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
    throw new Error('Whole-book continuous reread unit has invalid or extra keys');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(r => exactKeys(r, allowedReviewEvidenceKeys))) {
      throw new Error('Whole-book continuous reread reviewEvidence has invalid or extra keys');
    }
  }
}

export function selectWholeBookReread(config, pin = wholeBookRereadUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid whole-book continuous reread configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive whole-book continuous reread requires null pin and null unit');
    }
    return null;
  }
  const { unit } = config;
  if (!plainObject(unit) || unit.id !== wholeBookRereadId || !scienceText(unit.rationale)
      || !Array.isArray(unit.routes) || !sameScienceValue(unit.routes, wholeBookRereadRoutes)) {
    throw new Error('Invalid whole-book continuous reread candidate metadata');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Whole-book continuous reread is not independently accepted');
    assertUnitEnvelopeKeys(unit, false, unit.outputCapture === null);
    return unit;
  }
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Whole-book continuous reread acceptance pin does not match');
  }
  assertUnitEnvelopeKeys(unit, true, false);
  return unit;
}

const allowsRaw = (family, id, from) => (
  (family === 'claims' && from !== null && modifiedClaimIds.has(id))
  || (family === 'evidence' && from !== null && modifiedEvidenceIds.has(id))
);

function validateWholeBookPremiseOrder(catalog, files) {
  const numbering = JSON.parse(files.get('config/reader-numbering.json').toString('utf8'));
  const order = new Map();
  let pos = 0;
  for (const row of numbering.book ?? []) {
    if ((row.kind !== 'chapter' && row.kind !== 'appendix') || !row.source) continue;
    const rel = `content${row.source}.mdx`;
    const raw = files.get(rel)?.toString('utf8');
    if (!raw) throw new Error(`Whole-book continuous reread missing expected book file: ${rel}`);
    for (const id of collectChapterClaimIds(raw)) {
      if (!order.has(id)) order.set(id, { pos: ++pos, kind: row.kind });
    }
  }
  for (const c of catalog.claims ?? []) {
    if (c.caseBinding || !c.premiseIds?.length) continue;
    const mine = order.get(c.id);
    if (!mine || mine.kind !== 'chapter') continue;
    let prev = 0;
    for (const pid of c.premiseIds) {
      const p = order.get(pid);
      if (!p) continue;
      if (p.kind === 'chapter' && p.pos >= mine.pos) {
        throw new Error(`Whole-book continuous reread forward premise on ${c.id}: ${pid}`);
      }
      if (p.pos <= prev) {
        throw new Error(`Whole-book continuous reread non-ascending premiseIds on ${c.id}: ${pid}`);
      }
      prev = p.pos;
    }
  }
}

export function prepareWholeBookRereadSource(unit, input, actual, structure) {
  if (!unit) return { previous: actual, structure, previousRecords: input, previousFiles: input.files };
  const previewPass1 = unit.reviewEvidence === undefined && unit.outputCapture === null;
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, previewPass1);
  if (unit.state.before !== wholeBookRereadPredecessorPin) {
    throw new Error('Whole-book continuous reread predecessor pin differs from 4b9c3958');
  }
  if (!sameScienceValue(Object.keys(unit.previousFiles).sort(), [...managedPaths].sort())) {
    throw new Error('Whole-book continuous reread previousFiles keys differ from bounded scope');
  }
  for (const rel of managedPaths) {
    if (typeof unit.previousFiles[rel] !== 'string' || sha256(Buffer.from(unit.previousFiles[rel])) !== oldFileShas[rel]) {
      throw new Error(`Whole-book continuous reread previous file differs from 4b9c3958: ${rel}`);
    }
  }

  const numbering = JSON.parse(input.files.get('config/reader-numbering.json').toString('utf8'));
  const prevNumbering = JSON.parse(unit.previousFiles['config/reader-numbering.json']);
  const part4 = numbering?.parts?.find(row => row.number === 4);
  const prevPart4 = prevNumbering?.parts?.find(row => row.number === 4);
  if (!part4 || !prevPart4 || part4.introduction !== expectedPart4Intro
      || unit.partIntroduction.part !== 4
      || unit.partIntroduction.from !== prevPart4.introduction
      || unit.partIntroduction.to !== part4.introduction) {
    throw new Error('Whole-book continuous reread Part 4 introduction differs from reviewed transition');
  }

  const claimCount = input.catalog?.claims?.length ?? 0;
  if (claimCount !== 1124) {
    throw new Error(`Whole-book continuous reread must conserve 1124 claims (got ${claimCount})`);
  }
  validateWholeBookPremiseOrder(input.catalog, input.files);

  const prevFiles = new Map(input.files);
  for (const rel of managedPaths) {
    prevFiles.set(rel, Buffer.from(unit.previousFiles[rel]));
  }
  const recordChanges = new Map(unit.changes.filter(row => row.kind === 'record').map(row => [row.key, row]));
  const allowedFiles = new Set(managedPaths);
  const allowedRecords = new Set([
    ...[...modifiedClaimIds].map(id => `claims:${id}`),
    ...[...modifiedEvidenceIds].map(id => `evidence:${id}`),
    'researchMetadata:public-projection',
  ]);
  for (const row of unit.changes) {
    if (row.kind === 'file' && !allowedFiles.has(row.key)) {
      throw new Error(`Whole-book continuous reread changed file outside bounded scope: ${row.key}`);
    }
    if (row.kind === 'record' && !allowedRecords.has(row.key)) {
      throw new Error(`Whole-book continuous reread changed record outside bounded scope: ${row.key}`);
    }
  }
  const previousRecords = restoreScientificRecords(
    { catalog: input.catalog, readings: input.readings, literature: input.literature },
    unit.rawRecords,
    [],
    recordChanges,
    allowsRaw,
  );
  const previousInput = { ...previousRecords, files: prevFiles };
  const previous = inspectReadableBookEdition(previousInput);
  const prevStructure = copyeditSourceStructure(previousInput);
  if (editionDigest({ ...previous, structure: prevStructure }) !== wholeBookRereadPredecessorPin) {
    throw new Error('Whole-book continuous reread did not recover the independently observed raw 4b9c3958 state');
  }
  if (editionDigest({ ...actual, structure }) !== unit.state.after) {
    throw new Error('Whole-book continuous reread actual source state differs from reviewed candidate');
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
      if (!row || !scienceText(row.rationale) || !sameScienceValue(from, row.from) || !sameScienceValue(to, row.to)) {
        throw new Error(`Whole-book continuous reread lacks its exact candidate transition: ${kind}:${key}`);
      }
      declared.delete(`${kind}:${key}`);
    }
  }
  if (declared.size) {
    throw new Error(`Whole-book continuous reread declared unchanged transition: ${declared.keys().next().value}`);
  }
  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Whole-book continuous reread lacks exact cross-generation consumer review');
  }
  return {
    previous,
    previousRecords,
    files: prevFiles,
    structure: prevStructure,
    affectedClaimIds: [...new Set([...consumers, ...modifiedClaimIds])],
  };
}

export function effectiveWholeBookReread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    wholeBookReread: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function projectWholeBookRereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 4 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to)) {
    throw new Error('Whole-book continuous reread has an invalid Part 4 introduction transition');
  }
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 4);
  if (!slot || slot.introduction !== to) {
    throw new Error('Whole-book continuous reread numbering differs from the reviewed Part 4 introduction');
  }
  slot.introduction = from;
  return projected;
}

export function projectWholeBookRereadPrintParts(unit, printParts) {
  if (!unit || !printParts || !unit.printPart4) return printParts;
  const { id, from, to } = unit.printPart4;
  const slot = printParts[3];
  if (id !== 'print-part-4' || from !== previousPrintPart4Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-4' || slot.sha256 !== from) {
    throw new Error('Whole-book continuous reread printed Part 4 header differs from its accepted 4b9c3958 predecessor');
  }
  return printParts.map(row => row.id === 'print-part-4' ? { id: 'print-part-4', sha256: to } : row);
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
      || !scienceDigest(wholeBookRereadCapturePin) || editionDigest(capture) !== wholeBookRereadCapturePin) {
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

export function verifyWholeBookRereadReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${wholeBookRereadId}/${row.kind}`;
    if (row.date < wholeBookRereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function wholeBookRereadOrdinaryId(unit, route, print, index) {
  if (!unit) return undefined;
  if (route === wholeBookRereadB27Route && (index === 'table-1' || index === 'table-2')) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-whole-book-183-ordinary-${index}`;
  }
  return undefined;
}

export function wholeBookRereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-(?:part4-133-ordinary-\d+|fw-179-ordinary-(?:[0-5]|table)|unc-149-ordinary-0|pfr-151-ordinary-0|part6-155-ordinary-table-[12]|whole-book-183-ordinary-table-[12])$/;

export function observeWholeBookRereadOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
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

export function validateWholeBookRereadPartDisclosure(printDoc, unit) {
  if (!unit || !printDoc) return [];
  const errors = [];
  const printParts = fingerprintCopyeditPrintParts(printDoc);
  const actualPart4 = printParts?.[3];
  if (!actualPart4 || actualPart4.id !== 'print-part-4' || actualPart4.sha256 !== unit.printPart4?.to) {
    errors.push('Whole-book continuous reread /print Part 4 header differs from reviewed candidate');
  }
  const nodes = printDoc.querySelectorAll('[data-whole-book-reread-part]');
  if (nodes.length !== 1) return [...errors, 'Whole-book continuous reread /print Part 4 disclosure is missing or duplicated'];
  const node = nodes[0];
  const group = printDoc.querySelector('[data-reader-part-group="4"]');
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
  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-whole-book-reread-part')
      || node.getAttribute('data-whole-book-reread-part') !== '4'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== wholeBookRereadSource.date
      || !singleTextChild(time, wholeBookRereadSource.date) || summaryTailText !== ' 版第四部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-whole-book-reread-part-source', 'href')
      || link.getAttribute('data-whole-book-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(wholeBookRereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node)) {
    errors.push('Whole-book continuous reread printed Part 4 disclosure has invalid text, position or source link');
  }
  return errors;
}

export function validateWholeBookRereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-whole-book-reread-correction]');
  const expectedRows = !unit
    ? []
    : wholeBookRereadCorrections.filter(row =>
        path === '/print'
          ? (row.chapter !== wholeBookRereadB04Web1Route && row.chapter !== wholeBookRereadB25Web2Route)
          : path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Whole-book continuous reread correction notices are absent, extra or detached: ${path}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-whole-book-reread-correction') === claimId);
    const marker = matching[0];
    const markerChildren = nonCommentChildren(marker);
    const time = markerChildren[0];
    const link = markerChildren[markerChildren.length - 1];
    const midNodes = markerChildren.slice(1, -1);
    const midText = midNodes.length && midNodes.every(c => c.nodeType === 3) ? midNodes.map(c => c.text).join('') : null;
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
        || !attrs(marker, 'class', 'data-whole-book-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== wholeBookRereadSource.date
        || !singleTextChild(time, wholeBookRereadSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(wholeBookRereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Whole-book continuous reread correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyWholeBookRereadHistory(documents, unit, actual, part1Reread, frameworkComparison, part2Reread, part3Reread, part7Reread, part6Reread, part5Reread, part4Reread) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined, false);
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true)) {
    throw new Error('Whole-book continuous reread ordinaryOverrides violates the 8-key allowlist');
  }
  const targets = observeWholeBookRereadOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Whole-book continuous reread', routes: wholeBookRereadRoutes, predecessorPin: addressPin,
  });
  const part4Entry = prior['/print#print-part-4'];
  if (!part4Entry || part4Entry.introduction !== unit.partIntroduction.to) {
    throw new Error('Whole-book continuous reread /print#print-part-4 lacks the reviewed Part 4 introduction');
  }
  prior['/print#print-part-4'] = { ...part4Entry, introduction: unit.partIntroduction.from };

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
      part1Reread?.history?.ordinaryTargets?.[key]?.sha256
      ?? frameworkComparison?.history?.ordinaryTargets?.[key]?.sha256
      ?? part6Reread?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || priorSha !== row.from) {
      throw new Error(`Whole-book continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
    }
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: wholeBookRereadHistoryControls(unit),
      source: wholeBookRereadSource,
      attribute: 'whole-book-reread',
      previousHistory: [
        { attribute: 'part1-reread', expected: part1RereadHistoryControls(part1Reread) },
        { attribute: 'framework-comparison', expected: frameworkComparisonHistoryControls(frameworkComparison) },
        { attribute: 'part2-reread', expected: part2RereadHistoryControls(part2Reread) },
        { attribute: 'part3-reread', expected: part3RereadHistoryControls(part3Reread) },
        { attribute: 'part7-reread', expected: part7RereadHistoryControls(part7Reread) },
        { attribute: 'part6-reread', expected: part6RereadHistoryControls(part6Reread) },
        { attribute: 'part5-reread', expected: part5RereadHistoryControls(part5Reread) },
        { attribute: 'part4-reread', expected: part4RereadHistoryControls(part4Reread) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Whole-book continuous reread',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
    ...validateWholeBookRereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Whole-book continuous reread actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-whole-book-reread-part],[data-whole-book-reread-part-source]').length > 0) {
      errors.push(`Whole-book continuous reread unexpected Part 4 disclosure marker outside /print: ${path}`);
    }
    errors.push(...validateWholeBookRereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function wholeBookRereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreWholeBookRereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
