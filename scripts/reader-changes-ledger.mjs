import numbering from '../config/reader-numbering.json' with { type: 'json' };
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

const titleByRoute = new Map();
for (const entry of [...(numbering.web ?? []), ...(numbering.book ?? [])]) {
  if (entry?.source && entry?.title) titleByRoute.set(entry.source, entry.title);
  if (entry?.key && entry?.title) titleByRoute.set(entry.key, entry.title);
}

function routeTitle(route) {
  return titleByRoute.get(route) ?? route;
}

function sanitizeReaderSummary(text) {
  if (!text) return '';
  return String(text)
    .replace(/\b(?:cl|ev|src|cn|rd)-[a-z0-9-]+\b/gi, '相关条目')
    .replace(/(?:相关条目[、，,／/\s]+)+相关条目/g, '相关条目')
    .replace(/\bCASE-[A-Z0-9-]+\b/g, '贯穿案例')
    .replace(/(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/gi, '已钉扎版本')
    .replace(/本\s*轮/g, '本次')
    .replace(/本次\s*核读/g, '本次审读')
    .replace(/首版\s*建设/g, '初版整理')
    .replace(/主任务/g, '总协调项')
    .replace(/源码\s*提交/g, '源码版本')
    .replace(/待\s*交付/g, '待完成')
    .replace(/研究\s*进行中/g, '持续研究中')
    .replace(/核查\s*日志/g, '核查记录')
    .replace(/检索\s*日志/g, '检索记录')
    .replace(/构建\s*状态/g, '出版状态');
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
export function buildPublicChangesLedger() {
  const orderedUnits = [
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
    currentPart6Reread && {
      part: 6,
      title: numbering.parts?.[5]?.title ?? '第六部',
      unitId: currentPart6Reread.id,
      date: part6RereadSource.date,
      from: currentPart6Reread.partIntroduction.from,
      to: currentPart6Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part6RereadSource.commit),
    },
    currentPart5Reread && {
      part: 5,
      title: numbering.parts?.[4]?.title ?? '第五部',
      unitId: currentPart5Reread.id,
      date: part5RereadSource.date,
      from: currentPart5Reread.partIntroduction.from,
      to: currentPart5Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part5RereadSource.commit),
    },
    currentPart4Reread && {
      part: 4,
      title: numbering.parts?.[3]?.title ?? '第四部',
      unitId: currentPart4Reread.id,
      date: part4RereadSource.date,
      from: currentPart4Reread.partIntroduction.from,
      to: currentPart4Reread.partIntroduction.to,
      sourceHref: citationSourceHref(part4RereadSource.commit),
    },
  ].filter(Boolean);

  return { iterations: orderedUnits, corrections, partIntroductions };
}
