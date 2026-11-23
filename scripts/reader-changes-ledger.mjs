import numbering from '../config/reader-numbering.json' with { type: 'json' };
import { currentRetirements, currentRevisions, currentRouteChanges } from './reader-checkpoint.mjs';
import { printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import {
  currentAcidEquivalents,
  currentBiogenicCarbon,
  currentCircularFootprint,
  currentCopyedit,
  currentCostSustainability,
  currentDataApplicabilityComparison,
  currentDataQualityComparison,
  currentEutrophicationPathways,
  currentFlowBoundary,
  currentFossilResources,
  currentFutureScenarios,
  currentInterpretationBags,
  currentLandRecovery,
  currentLoadShift,
  currentLocalizationComparison,
  currentMineralResources,
  currentOzoneRadiation,
  currentPart4Reread,
  currentPart5Reread,
  currentPart6Reread,
  currentFunctionalReferenceComparison,
  currentHybridInventoryComparison,
  currentPart2Reread,
  currentFrameworkComparison,
  currentPart1Reread,
  currentWholeBookReread,
  currentMarketResponseComparison,
  currentPart3Reread,
  currentPart7Reread,
  currentParticulateComparison,
  currentPhotochemicalOzone,
  currentProductFootprintComparison,
  currentRevisableJudgment,
  currentServiceConstraints,
  currentSocialComparison,
  currentSubstitutionRules,
  currentToxicityComparison,
  currentUncertaintyComparison,
  currentWallServiceComparison,
  currentWaterScarcity,
  currentWeightingValuation,
} from './reader-current-expectations.mjs';
import { readerCopyeditSource } from './reader-copyedit-pins.mjs';
import { mineralResourcesChapter, mineralResourcesCorrection, mineralResourcesSource } from './reader-mineral-resources.mjs';
import { fossilResourcesChapter, fossilResourcesCorrection, fossilResourcesSource } from './reader-fossil-resources.mjs';
import { ozoneRadiationChapter, ozoneRadiationCorrections, ozoneRadiationSource } from './reader-ozone-radiation.mjs';
import { part4RereadCorrections, part4RereadSource } from './reader-part4-reread.mjs';
import { weightingValuationCorrections, weightingValuationSource } from './reader-weighting-valuation.mjs';
import { localizationComparisonCorrections, localizationComparisonSource } from './reader-localization-comparison.mjs';
import { socialComparisonCorrections, socialComparisonSource } from './reader-social-comparison.mjs';
import { costSustainabilityCorrections, costSustainabilitySource } from './reader-cost-sustainability.mjs';
import { part5RereadCorrections, part5RereadSource } from './reader-part5-reread.mjs';
import { dataApplicabilityComparisonCorrections, dataApplicabilityComparisonSource } from './reader-data-applicability-comparison.mjs';
import { uncertaintyComparisonCorrections, uncertaintyComparisonSource } from './reader-uncertainty-comparison.mjs';
import { part6RereadCorrections, part6RereadSource } from './reader-part6-reread.mjs';
import { part7RereadCorrections, part7RereadSource } from './reader-part7-reread.mjs';
import { part3RereadCorrections, part3RereadSource } from './reader-part3-reread.mjs';
import { part2RereadCorrections, part2RereadSource } from './reader-part2-reread.mjs';
import { part1RereadCorrections, part1RereadSource } from './reader-part1-reread.mjs';
import { wholeBookRereadCorrections, wholeBookRereadSource } from './reader-whole-book-reread.mjs';

function buildTitleResolver(numberingManifest) {
  const map = new Map();
  for (const entry of [...(numberingManifest.web ?? []), ...(numberingManifest.book ?? [])]) {
    if (entry?.source && entry?.title) map.set(entry.source, entry.title);
    if (entry?.key && entry?.title) map.set(entry.key, entry.title);
  }
  return route => map.get(route) ?? route;
}

const defaultRouteTitle = buildTitleResolver(numbering);
let activeRouteTitle = defaultRouteTitle;

function routeTitle(route) {
  return activeRouteTitle(route);
}

function sanitizeReaderSummary(text) {
  if (!text) return '';
  return String(text)
    .replace(/\b(?:cl|ev|src|cn|rd)-[a-z0-9-]+\b/gi, '相关条目')
    .replace(/(?:相关条目[、，,／/\s]+)+相关条目/g, '相关条目')
    .replace(/\bCASE-[A-Z0-9-]+\b/g, '贯穿案例')
    .replace(/\bpack-study-v\d+\b/gi, '购物袋对照算例')
    .replace(/(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/gi, '已钉扎版本')
    .replace(/\bMain8148\b/g, '初版书稿')
    .replace(/\b0496e14\b/g, '初版基线')
    .replace(/\bReaderSection\b/g, '分节锚点')
    .replace(/\bBigInt\b/g, '精确整数')
    .replace(/经\s*SHA-256\s*核验/g, '经原件核验')
    .replace(/\bSHA-256\b/g, '校验指纹')
    .replace(/\bV\d+-[A-Z]\b/g, '既定修订项')
    .replace(/\b(?:[BWX]\d{1,2}(?:\[\d+\])?)(?:[—–→/∪∩、，,\s]+(?:[BWX]\d{1,2}(?:\[\d+\])?|∅|=))*\b/g, '')
    .replace(/（\s*）/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/纯英文\s*scope/g, '英文修订说明')
    .replace(/\bscope\b/gi, '修订说明')
    .replace(/前提\s*DAG\s*升序清理/g, '前提依赖顺序规整')
    .replace(/\bDAG\b/g, '前提依赖图')
    .replace(/\bH2\b/g, '二级标题')
    .replace(/逐字节保留/g, '完整保留')
    .replace(/逐字节不变/g, '保持不变')
    .replace(/冻结节标题/g, '既有节标题')
    .replace(/零改动/g, '保持不变')
    .replace(/本\s*轮/g, '本次')
    .replace(/本次\s*核读/g, '本次审读')
    .replace(/首版\s*建设/g, '初版整理')
    .replace(/主任务/g, '总协调项')
    .replace(/源码\s*提交/g, '源码版本')
    .replace(/待\s*交付/g, '待完成')
    .replace(/研究\s*进行中/g, '持续研究中')
    .replace(/核查\s*日志/g, '核查记录')
    .replace(/检索\s*日志/g, '检索记录')
    .replace(/构建\s*状态/g, '出版状态')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function summarizeUnit(unit, fallbackSource = null) {
  if (!unit) return null;
  const source = unit.source ?? fallbackSource;
  const commit = source?.commit ?? source?.sourceCommit ?? null;
  const date = source?.date ?? source?.capturedAt ?? source?.sourceDate ?? '';
  const routes = Array.isArray(unit.routes) ? unit.routes : [];
  return {
    id: unit.id,
    date,
    rationale: sanitizeReaderSummary(unit.rationale ?? ''),
    routeLabels: [...new Set(routes.map(routeTitle))],
    changesCount: Array.isArray(unit.changes) ? unit.changes.length : 0,
    sourceHref: commit ? citationSourceHref(commit) : null,
  };
}

/**
 * Automatically aggregates every reviewed publication iteration, every named
 * claim correction, and every Part introduction update for /changes/.
 */
export function buildPublicChangesLedger(numberingManifest = numbering) {
  const prevResolver = activeRouteTitle;
  activeRouteTitle = numberingManifest === numbering ? defaultRouteTitle : buildTitleResolver(numberingManifest);
  try {
    return buildPublicChangesLedgerWith(numberingManifest);
  } finally {
    activeRouteTitle = prevResolver;
  }
}

function buildPublicChangesLedgerWith(numberingManifest) {
  const orderedUnits = [
    summarizeUnit(currentWholeBookReread, wholeBookRereadSource),
    summarizeUnit(currentPart1Reread, part1RereadSource),
    summarizeUnit(currentFrameworkComparison),
    summarizeUnit(currentPart2Reread),
    summarizeUnit(currentHybridInventoryComparison),
    summarizeUnit(currentFunctionalReferenceComparison),
    summarizeUnit(currentPart3Reread),
    summarizeUnit(currentMarketResponseComparison),
    summarizeUnit(currentPart7Reread),
    summarizeUnit(currentRevisableJudgment),
    summarizeUnit(currentFutureScenarios),
    summarizeUnit(currentInterpretationBags),
    summarizeUnit(currentWallServiceComparison),
    summarizeUnit(currentPart6Reread),
    summarizeUnit(currentDataQualityComparison),
    summarizeUnit(currentProductFootprintComparison),
    summarizeUnit(currentUncertaintyComparison),
    summarizeUnit(currentDataApplicabilityComparison),
    summarizeUnit(currentPart5Reread),
    summarizeUnit(currentCostSustainability),
    summarizeUnit(currentSocialComparison),
    summarizeUnit(currentLocalizationComparison),
    summarizeUnit(currentWeightingValuation),
    summarizeUnit(currentPart4Reread),
    summarizeUnit(currentParticulateComparison),
    summarizeUnit(currentEutrophicationPathways),
    summarizeUnit(currentBiogenicCarbon),
    summarizeUnit(currentWaterScarcity),
    summarizeUnit(currentToxicityComparison),
    summarizeUnit(currentOzoneRadiation),
    summarizeUnit(currentPhotochemicalOzone),
    summarizeUnit(currentFossilResources),
    summarizeUnit(currentMineralResources),
    summarizeUnit(currentAcidEquivalents),
    summarizeUnit(currentLandRecovery),
    summarizeUnit(currentCircularFootprint),
    summarizeUnit(currentLoadShift),
    summarizeUnit(currentSubstitutionRules),
    summarizeUnit(currentServiceConstraints),
    summarizeUnit(currentFlowBoundary),
    summarizeUnit(currentCopyedit, { commit: readerCopyeditSource.commit, date: readerCopyeditSource.capturedAt }),
  ].filter(Boolean);

  const rawCorrections = [];
  if (currentMineralResources?.correction) {
    rawCorrections.push({
      unitId: currentMineralResources.id,
      date: mineralResourcesSource.date,
      chapter: mineralResourcesChapter,
      chapterTitle: routeTitle(mineralResourcesChapter),
      claimId: mineralResourcesCorrection.claimId,
      scope: sanitizeReaderSummary(mineralResourcesCorrection.scope),
      sourceHref: citationSourceHref(mineralResourcesSource.commit),
    });
  }
  if (currentFossilResources?.correction) {
    rawCorrections.push({
      unitId: currentFossilResources.id,
      date: fossilResourcesSource.date,
      chapter: fossilResourcesChapter,
      chapterTitle: routeTitle(fossilResourcesChapter),
      claimId: fossilResourcesCorrection.claimId,
      scope: sanitizeReaderSummary(fossilResourcesCorrection.scope),
      sourceHref: citationSourceHref(fossilResourcesSource.commit),
    });
  }
  const correctionSets = [
    [currentOzoneRadiation?.corrections, currentOzoneRadiation?.id, ozoneRadiationSource, ozoneRadiationCorrections.map(r => ({ ...r, chapter: ozoneRadiationChapter }))],
    [currentPart4Reread, currentPart4Reread?.id, part4RereadSource, part4RereadCorrections],
    [currentWeightingValuation?.corrections, currentWeightingValuation?.id, weightingValuationSource, weightingValuationCorrections],
    [currentLocalizationComparison?.corrections, currentLocalizationComparison?.id, localizationComparisonSource, localizationComparisonCorrections],
    [currentSocialComparison?.corrections, currentSocialComparison?.id, socialComparisonSource, socialComparisonCorrections],
    [currentCostSustainability?.corrections, currentCostSustainability?.id, costSustainabilitySource, costSustainabilityCorrections],
    [currentPart5Reread, currentPart5Reread?.id, part5RereadSource, part5RereadCorrections],
    [currentDataApplicabilityComparison?.corrections, currentDataApplicabilityComparison?.id, dataApplicabilityComparisonSource, dataApplicabilityComparisonCorrections],
    [currentUncertaintyComparison?.corrections, currentUncertaintyComparison?.id, uncertaintyComparisonSource, uncertaintyComparisonCorrections],
    [currentPart6Reread, currentPart6Reread?.id, part6RereadSource, part6RereadCorrections],
    [currentPart7Reread, currentPart7Reread?.id, part7RereadSource, part7RereadCorrections],
    [currentPart3Reread, currentPart3Reread?.id, part3RereadSource, part3RereadCorrections],
    [currentPart2Reread, currentPart2Reread?.id, part2RereadSource, part2RereadCorrections],
    [currentPart1Reread, currentPart1Reread?.id, part1RereadSource, part1RereadCorrections],
    [currentWholeBookReread, currentWholeBookReread?.id, wholeBookRereadSource, wholeBookRereadCorrections],
  ];
  const seenCorr = new Set();
  for (const [active, unitId, source, rows] of correctionSets) {
    if (!active) continue;
    for (const row of rows) {
      const dedupKey = `${unitId}|${row.claimId}|${row.scope}`;
      if (seenCorr.has(dedupKey)) continue;
      seenCorr.add(dedupKey);
      rawCorrections.push({
        unitId,
        date: source.date,
        chapter: row.chapter,
        chapterTitle: routeTitle(row.chapter),
        claimId: row.claimId,
        scope: sanitizeReaderSummary(row.scope),
        sourceHref: citationSourceHref(source.commit),
      });
    }
  }
  const corrections = rawCorrections.reverse();

  const partIntroductions = [
    currentWholeBookReread && {
      part: 4,
      title: numberingManifest.parts?.[3]?.title ?? '环境后果',
      unitId: currentWholeBookReread.id,
      date: wholeBookRereadSource.date,
      from: currentWholeBookReread.partIntroduction.from,
      to: currentWholeBookReread.partIntroduction.to,
      sourceHref: citationSourceHref(wholeBookRereadSource.commit),
    },
    currentPart1Reread && {
      part: 1,
      title: numberingManifest.parts?.[0]?.title ?? '问题的来源',
      unitId: currentPart1Reread.id,
      date: part1RereadSource.date,
      from: currentPart1Reread.partIntroduction.from,
      to: currentPart1Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part1RereadSource.commit),
    },
    currentPart2Reread && {
      part: 2,
      title: numberingManifest.parts?.[1]?.title ?? '第二部',
      unitId: currentPart2Reread.id,
      date: part2RereadSource.date,
      from: currentPart2Reread.partIntroduction.from,
      to: currentPart2Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part2RereadSource.commit),
    },
    currentPart3Reread && {
      part: 3,
      title: numberingManifest.parts?.[2]?.title ?? '第三部',
      unitId: currentPart3Reread.id,
      date: part3RereadSource.date,
      from: currentPart3Reread.partIntroduction.from,
      to: currentPart3Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part3RereadSource.commit),
    },
    currentPart7Reread && {
      part: 7,
      title: numberingManifest.parts?.[6]?.title ?? '第七部',
      unitId: currentPart7Reread.id,
      date: part7RereadSource.date,
      from: currentPart7Reread.partIntroduction.from,
      to: currentPart7Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part7RereadSource.commit),
    },
    currentPart6Reread && {
      part: 6,
      title: numberingManifest.parts?.[5]?.title ?? '第六部',
      unitId: currentPart6Reread.id,
      date: part6RereadSource.date,
      from: currentPart6Reread.partIntroduction.from,
      to: currentPart6Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part6RereadSource.commit),
    },
    currentPart5Reread && {
      part: 5,
      title: numberingManifest.parts?.[4]?.title ?? '第五部',
      unitId: currentPart5Reread.id,
      date: part5RereadSource.date,
      from: currentPart5Reread.partIntroduction.from,
      to: currentPart5Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part5RereadSource.commit),
    },
    currentPart4Reread && {
      part: 4,
      title: numberingManifest.parts?.[3]?.title ?? '第四部',
      unitId: currentPart4Reread.id,
      date: part4RereadSource.date,
      from: currentPart4Reread.partIntroduction.from,
      to: currentPart4Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part4RereadSource.commit),
    },
  ].filter(Boolean);

  const revisions = [...currentRevisions].reverse().map(rev => ({
    id: rev.id,
    date: rev.date,
    title: rev.title,
    rationale: rev.rationale,
    routes: rev.routes,
    routeLabels: rev.routes.map(routeTitle),
    sourceHref: rev.sourceCommit ? citationSourceHref(rev.sourceCommit) : null,
  }));

  const retirements = currentRetirements.map(ret => ({
    id: ret.id,
    successor: ret.successor,
    rationale: ret.rationale,
    revisionId: ret.revisionId,
    date: ret.date,
    routeLabels: (ret.routes ?? []).map(routeTitle),
    sourceHref: ret.sourceCommit ? citationSourceHref(ret.sourceCommit) : null,
  }));

  for (const rev of currentRevisions) {
    for (const corr of rev.corrections ?? []) {
      corrections.unshift({
        unitId: rev.id,
        date: rev.date,
        chapter: corr.chapter,
        chapterTitle: routeTitle(corr.chapter),
        claimId: corr.claimId,
        scope: corr.scope,
        sourceHref: rev.sourceCommit ? citationSourceHref(rev.sourceCommit) : '',
      });
    }
  }

  const merges = (currentRouteChanges?.merges ?? []).map(m => ({
    revisionId: m.revisionId,
    date: m.date,
    from: m.from,
    fromLabels: m.from.map(routeTitle),
    to: m.to,
    toLabel: routeTitle(m.to),
    rationale: sanitizeReaderSummary(m.rationale),
    sourceHref: m.sourceCommit ? citationSourceHref(m.sourceCommit) : null,
  }));

  return { iterations: orderedUnits, corrections, partIntroductions, revisions, retirements, merges };
}
