import { showEditorialHistoryInProse, withCleanDeliveryValidation, FORBIDDEN_PROSE_ATTR_PATTERNS, FORBIDDEN_PROSE_TEXT_PATTERNS } from './reader-editorial-mode.mjs';
import { buildPublicRevisionsAndErrata } from './reader-public-revisions.mjs';
import { currentRetirements, currentRevisions } from './reader-checkpoint.mjs';
import { applyClaimRetirementsToCitations, applyRouteChangesToCitations, extractRouteChanges, isRouteRevised } from './reader-revisions.mjs';
import { functionalReferenceComparisonPreviousSurface, qualifyFunctionalReferenceComparisonHistory } from './reader-functional-reference-comparison.mjs';
import { hybridInventoryComparisonPreviousSurface, qualifyHybridInventoryComparisonHistory } from './reader-hybrid-inventory-comparison.mjs';
import { part2RereadPreviousSurface, projectPart2RereadPrintParts, qualifyPart2RereadHistory } from './reader-part2-reread.mjs';
import { frameworkComparisonPreviousSurface, qualifyFrameworkComparisonHistory, validateFrameworkComparisonTables } from './reader-framework-comparison.mjs';
import { part1RereadPreviousSurface, projectPart1RereadPrintParts, qualifyPart1RereadHistory } from './reader-part1-reread.mjs';
import { wholeBookRereadPreviousSurface, projectWholeBookRereadPrintParts, qualifyWholeBookRereadHistory } from './reader-whole-book-reread.mjs';
import { part3RereadPreviousSurface, projectPart3RereadPrintParts, qualifyPart3RereadHistory } from './reader-part3-reread.mjs';
import { marketResponseComparisonPreviousSurface, qualifyMarketResponseComparisonHistory } from './reader-market-response-comparison.mjs';
import { part7RereadPreviousSurface, projectPart7RereadPrintParts, qualifyPart7RereadHistory } from './reader-part7-reread.mjs';
import { revisableJudgmentPreviousSurface, qualifyRevisableJudgmentHistory } from './reader-revisable-judgment.mjs';
import { futureScenariosPreviousSurface, qualifyFutureScenariosHistory } from './reader-future-scenarios.mjs';
import { interpretationBagsPreviousSurface, qualifyInterpretationBagsHistory } from './reader-interpretation-bags.mjs';
import { wallServiceComparisonPreviousSurface, qualifyWallServiceComparisonHistory } from './reader-wall-service-comparison.mjs';
import { part6RereadPreviousSurface, projectPart6RereadPrintParts, qualifyPart6RereadHistory } from './reader-part6-reread.mjs';
import { dataQualityComparisonPreviousSurface, qualifyDataQualityComparisonHistory } from './reader-data-quality-comparison.mjs';
import { productFootprintComparisonPreviousSurface, qualifyProductFootprintComparisonHistory } from './reader-product-footprint-comparison.mjs';
import { uncertaintyComparisonPreviousSurface, qualifyUncertaintyComparisonHistory } from './reader-uncertainty-comparison.mjs';
import { dataApplicabilityComparisonPreviousSurface, qualifyDataApplicabilityComparisonHistory } from './reader-data-applicability-comparison.mjs';
import { part5RereadPreviousSurface, projectPart5RereadPrintParts, qualifyPart5RereadHistory } from './reader-part5-reread.mjs';
import { costSustainabilityPreviousSurface, qualifyCostSustainabilityHistory } from './reader-cost-sustainability.mjs';
import { socialComparisonPreviousSurface, qualifySocialComparisonHistory } from './reader-social-comparison.mjs';
import { localizationComparisonPreviousSurface, qualifyLocalizationComparisonHistory } from './reader-localization-comparison.mjs';
import { weightingValuationPreviousSurface, qualifyWeightingValuationHistory } from './reader-weighting-valuation.mjs';
import { part4RereadPreviousSurface, projectPart4RereadPrintParts, qualifyPart4RereadHistory } from './reader-part4-reread.mjs';
import { particulateComparisonPreviousSurface, qualifyParticulateComparisonHistory } from './reader-particulate-comparison.mjs';
import { eutrophicationPathwaysPreviousSurface, qualifyEutrophicationPathwaysHistory } from './reader-eutrophication-pathways.mjs';
import { biogenicCarbonPreviousSurface, qualifyBiogenicCarbonHistory } from './reader-biogenic-carbon.mjs';
import { waterScarcityPreviousSurface, qualifyWaterScarcityHistory } from './reader-water-scarcity.mjs';
import { toxicityComparisonPreviousSurface, qualifyToxicityComparisonHistory } from './reader-toxicity-comparison.mjs';
import { ozoneRadiationPreviousSurface, qualifyOzoneRadiationHistory } from './reader-ozone-radiation.mjs';
import { photochemicalOzonePreviousSurface, qualifyPhotochemicalOzoneHistory } from './reader-photochemical-ozone.mjs';
import { fossilResourcesPreviousSurface, qualifyFossilResourcesHistory } from './reader-fossil-resources.mjs';
import { mineralResourcesPreviousSurface, qualifyMineralResourcesHistory } from './reader-mineral-resources.mjs';
import { acidEquivalentsPreviousSurface, qualifyAcidEquivalentsHistory } from './reader-acid-equivalents.mjs';
import { landRecoveryPreviousSurface, qualifyLandRecoveryHistory } from './reader-land-recovery.mjs';
import { circularFootprintPreviousSurface, qualifyCircularFootprintHistory } from './reader-circular-footprint.mjs';
import { loadShiftPreviousSurface, observeLoadShiftCaseOutputs, qualifyLoadShiftHistory } from './reader-load-shift.mjs';
import { qualifySubstitutionRulesHistory, substitutionRulesPreviousSurface } from './reader-substitution-rules.mjs';
import { loadCasePublications } from './case-publication.mjs';
import { qualifyServiceConstraintsHistory, observeServiceConstraintsOrdinaryTargets, observeServiceConstraintsCaseOutputs, validateServiceConstraintsHistoryOutput, serviceConstraintsPreviousSurface } from './reader-service-constraints.mjs';
import { projectFlowBoundaryHistory, validateFlowBoundaryHistoryOutput, flowBoundaryPreviousSurface, flowBoundaryCitationEntries, relabelHistoricalTargets } from './reader-flow-boundary.mjs';
import { copyeditHistoryEntries, copyeditHistoryPlan, validateCopyeditHistory } from './reader-copyedit-history.mjs';
import { observeCopyeditHistory } from './reader-copyedit-observation.mjs';
import { readerNumberingManifest } from './reader-numbering.mjs';
import { editionDigest } from './reader-current-edition.mjs';
import { assertReadablePedigreeAccepted, readablePedigreeHeadingEntries, remapReadablePedigreeCitations, validateReadablePedigreeCaseBytes, validateReadablePedigreeCoverage, validateRenderedReadablePedigree } from './reader-readable-pedigree.mjs';
import { assertPmSelectionAccepted, pmSelectionAppendix, pmSelectionCasePaths, pmSelectionHeadingEntries, remapPmSelectionCitations, validatePmSelectionCaseBytes, validatePmSelectionCoverage, validateRenderedPmSelection } from './reader-pm-selection.mjs';
import { assertToxicityPathwaysAccepted, remapToxicityPathwaysCitations, toxicityPathwaysHeadingEntries, validateToxicityPathwaysCoverage, validateRenderedToxicityPathways } from './reader-toxicity-pathways.mjs';
import { assertDataApplicabilityOriginal, assertDataApplicabilityHeadingOriginal, assertDataApplicabilityAccepted, dataApplicabilityHeadingEntries, remapDataApplicabilityCitations, validateDataApplicabilityCoverage, validateRenderedDataApplicability } from './reader-data-applicability.mjs';
import { assertClimateAssemblyOriginal, assertClimateAssemblyHeadingOriginal, assertClimateAssemblyAccepted, validateClimateAssemblyArtifactBytes, climateAssemblyHeadingEntries, remapClimateAssemblyCitations, validateClimateAssemblyCoverage, validateRenderedClimateAssembly } from './reader-climate-assembly.mjs';
import { assertClosingSynthesisOriginal, assertClosingSynthesisHeadingHistory, assertClosingSynthesisProseAccepted, closingSynthesisHeadingEntries, remapClosingSynthesisCitations, validateClosingSynthesisCoverage, validateRenderedClosingSynthesis } from './reader-closing-synthesis.mjs';
import { assertWallSelectionOriginal, assertWallSelectionHeadingHistory, assertWallSelectionAccepted, wallSelectionHeadingEntries, remapWallSelectionCitations, validateWallSelectionCoverage, validateRenderedWallSelection } from './reader-wall-selection.mjs';
import { validateReaderNumberingOutput } from './reader-numbering-output.mjs';
import { assertReaderNumbering } from './reader-numbering.mjs';
import { validateReadableBookCurrent, validateServiceConstraintsReviewSources, validateSubstitutionRulesReviewSources, validateLoadShiftReviewSources, validateCircularFootprintReviewSources, validateLandRecoveryReviewSources, validateAcidEquivalentsReviewSources, validateMineralResourcesReviewSources, validateFossilResourcesReviewSources, validatePhotochemicalOzoneReviewSources, validateOzoneRadiationReviewSources, validateToxicityComparisonReviewSources, validateWaterScarcityReviewSources, validateBiogenicCarbonReviewSources, validateEutrophicationPathwaysReviewSources, validateParticulateComparisonReviewSources, validatePart4RereadReviewSources, validateWeightingValuationReviewSources, validateLocalizationComparisonReviewSources, validateSocialComparisonReviewSources, validateCostSustainabilityReviewSources, validatePart5RereadReviewSources, validateDataApplicabilityComparisonReviewSources, validateUncertaintyComparisonReviewSources, validateProductFootprintComparisonReviewSources, validateDataQualityComparisonReviewSources, validatePart6RereadReviewSources, validateWallServiceComparisonReviewSources, validateInterpretationBagsReviewSources, validateFutureScenariosReviewSources, validateRevisableJudgmentReviewSources, validatePart7RereadReviewSources, validateMarketResponseComparisonReviewSources, validatePart3RereadReviewSources, validateFunctionalReferenceComparisonReviewSources, validateHybridInventoryComparisonReviewSources, validatePart2RereadReviewSources, validateFrameworkComparisonReviewSources, validatePart1RereadReviewSources, validateWholeBookRereadReviewSources } from './reader-current-edition-files.mjs';
import { qualifyReadableBookCitations } from './reader-current-citations.mjs';
import { validateReadableBookPublicArtifacts, validateReadableBookReviewedOutput } from './reader-current-output.mjs';
import { qualifyCurrentHistoricalDocument, validateCurrentHistoricalContexts } from './reader-publication-text.mjs';
import { assertJointProductionOriginal, assertJointProductionHeadingHistory, assertJointProductionProseAccepted, jointProductionHeadingEntries, remapJointProductionCitations, validateJointProductionCoverage, validateRenderedJointProduction } from './reader-joint-production.mjs';
import { assertHybridInventoryAccepted, assertHybridInventoryHeadingHistory, assertHybridInventoryProseAccepted, hybridInventoryHeadingEntries, remapHybridInventoryCitations, validateHybridInventoryCoverage, validateRenderedHybridInventory } from './reader-hybrid-inventory.mjs';
import { assertExchangeSemanticsOriginal, assertExchangeSemanticsHeadingHistory, assertExchangeSemanticsCitationSources, assertExchangeSemanticsPartialHistory, assertExchangeSemanticsProseAccepted, exchangeSemanticsHeadingEntries, remapExchangeSemanticsCitations, validateExchangeSemanticsCoverage, validateRenderedExchangeSemantics } from './reader-exchange-semantics.mjs';
import { assertProcessNetworkProseAccepted, processNetworkHeadingEntries, remapProcessNetworkCitations, validateProcessNetworkCoverage, validateRenderedProcessNetwork } from './reader-process-network.mjs';
import { assertFunctionalReferenceProseAccepted, functionalReferenceHeadingEntries, remapFunctionalReferenceCitations, validateFunctionalReferenceCoverage, validateRenderedFunctionalReference } from './reader-functional-reference.mjs';
import { cleanerProductionHeadingEntries, remapCleanerProductionCitations, validateCleanerProductionCoverage, validateRenderedCleanerProduction } from './reader-cleaner-production.mjs';
import { existsSync } from 'node:fs';
import { access, readdir, readFile } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { assertCitationHistory } from './reader-citation-history.mjs';
import { assertCitationBaseline, assertPrintFrontMatter } from './reader-citation-baseline.mjs';
import { citationHref, citationSourceHref, createCurrentPrintRoutes, createLegacyCitationEntries, createCanonicalCitationEntries } from './reader-citations.mjs';
// Use the parser already bundled by the exact Next dependency (16.4.6).
// This internal bundle is intentionally version-coupled and covered by tests;
// there is no additional parser dependency or hand-written HTML stripping.
import { currentEditionKeys, validateFrameworkCoverage, remapBookCitations, publishedHeadingEntries, validateRenderedFrameworkCoverage } from './reader-edition.mjs';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';

const processPatterns = [
  /本\s*轮/g, /本次\s*核读/g, /首版\s*建设/g, /主任务/g, /源码\s*提交/g,
  /待\s*交付/g, /研究\s*进行中/g, /核查\s*日志/g, /检索\s*日志/g, /构建\s*状态/g,
  /当前为\s*AI\s*辅助来源核查稿/gi,
  // Retired ZH UI & process-prose phrases (Phase 1F final-delivery guard)
  /网页细读目录/g, /书籍目录与连续阅读/g, /核读记录/g, /书目与核读/g,
  /待核说明/g, /暂标为待核/g, /已核对一手来源/g, /尚待正式购买授权/g,
  /\bpdfIndices\b/g,
  /规范论述清单/g, /已发布迭代修订清单/g, /具名论述更正清单/g,
  // Retired EN UI & process-prose phrases (Phase 1F final-delivery guard)
  /\bWeb Reading Contents\b/g, /\bChangelog & Errata\b/g,
  /For international readers:/gi, /English edition reader note/gi,
  /meaning-equivalent English edition/gi, /meaning-equivalent monograph/gi,
  /cryptographically aligned/gi, /\bthis library\b/gi,
  /\b0-based\s+index(?:es)?\b/gi, /\bzero-based\b/gi,
  /pending licensed full-text/gi, /Primary source verified/gi,
  /Chinese Editions & Errata ledger/gi,
];
const finalDeliveryOnlyPatterns = [
  /本库/g, /私有缓存/g, /私人任务缓存/g, /私有临时研究目录/g,
  /零基(?:索引|分页块|单元|\s*PDF)/g,
  /整合改写试点/g, /整部连续回读/g, /全书连续回读/g, /统稿/g,
  /SHA-256\s*(?:回执|verified)/gi,
];
const enScriptLeakRe = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const aiExecution = /AI\s*辅助(?:来源)?核查(?:稿)?|来源核查由\s*AI\s*辅助完成|Source verification was assisted by AI/gi;
const machineKeys = new Set(['inputSha256', 'sourceCommit', 'reviewedAt', 'reviewKind', 'caseBinding', 'schemaVersion', 'artifactKind', 'scientificApproval', 'captureMethod', 'readingStatus', 'accessStatus', 'agent-source-check', 'selected-passages', 'not-close-read', 'working-preview']);
const rawHash = /(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/gi;
const caseId = /\bCASE-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g;
const localDeveloperPath = value => /^\/(?:_docs|monograph)(?:\/|$)/.test(value);

/** Actual project identities, not a blanket ban on scientific words. */
export function readerInternalIds(...records) {
  const ids = new Set();
  function visit(value, omitLocalScenarioId = false) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(item => visit(item)); return; }
    if (!omitLocalScenarioId && typeof value.id === 'string') ids.add(value.id);
    if (typeof value.caseId === 'string') ids.add(value.caseId);
    for (const [key, child] of Object.entries(value)) {
      // Native execution scenario names (e.g. "zero") identify run-local input
      // profiles, not publication records. Do not ban the same scientific word
      // across unrelated chapters. Nested record/case identities still count.
      if (value.kind === 'author-derived-native-model-execution' && key === 'scenarios' && Array.isArray(child))
        child.forEach(scenario => visit(scenario, true));
      else visit(child);
    }
  }
  records.forEach(record => visit(record));
  return ids;
}

export function validateReaderText(text, { label = 'Reader prose', knownIds = new Set(), allowAIStatement = false, strictFinalDelivery = false } = {}) {
  const errors = [], prose = String(text).normalize('NFKC');
  const activePatterns = strictFinalDelivery ? [...processPatterns, ...finalDeliveryOnlyPatterns] : processPatterns;
  for (const pattern of activePatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(prose);
    if (match) errors.push(`${label}: project-process prose “${match[0]}” belongs in development Markdown`);
  }
  aiExecution.lastIndex = 0;
  if (!allowAIStatement && aiExecution.test(prose)) errors.push(`${label}: general AI review identity belongs once in the edition or print writing statement`);
  const tokens = prose.match(/[A-Za-z][A-Za-z0-9._:-]*/g) ?? [];
  const exposed = new Set();
  for (const token of tokens) {
    const candidates = [token, token.replace(/[.:]+$/, '')];
    for (const candidate of candidates) if (knownIds.has(candidate) || machineKeys.has(candidate)) exposed.add(candidate);
  }
  for (const identity of exposed) errors.push(`${label}: visible internal identifier/key “${identity}” is not a reader label`);
  rawHash.lastIndex = 0; caseId.lastIndex = 0;
  if (rawHash.test(prose)) errors.push(`${label}: a raw SHA-256 is visible as reader prose`);
  if (caseId.test(prose)) errors.push(`${label}: a raw case identifier is visible as reader prose`);
  return errors;
}

/** Rendered claim fields only; acquisition appraisals/records remain internal. */
export function validateReaderClaims(published, knownIds = readerInternalIds(published)) {
  const errors = [];
  for (const claim of published.claims) {
    for (const field of ['text', 'scope']) errors.push(...validateReaderText(claim[field], { label: `claims.${claim.id}.${field}`, knownIds }));
    for (const [index, caveat] of claim.caveats.entries()) errors.push(...validateReaderText(caveat, { label: `claims.${claim.id}.caveats.${index}`, knownIds }));
  }
  return errors;
}

function proseOutsideCode(raw) {
  const blank = text => text.replace(/[^\n]/g, ' ');
  let fence = null;
  let text = raw.split(/(?<=\n)/).map(line => {
    const marker = /^(?: {0,3}>[ \t]?)* {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n)?$/.exec(line);
    if (fence) { if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) fence = null; return blank(line); }
    if (marker && (marker[1][0] !== '`' || !marker[2].includes('`'))) { fence = { char: marker[1][0], length: marker[1].length }; return blank(line); }
    return line;
  }).join('');
  text = text.replace(/(`+)([\s\S]*?)\1(?!`)/g, blank).replace(/<!--[\s\S]*?-->|\{\s*\/\*[\s\S]*?\*\/\s*\}/g, blank);
  return text;
}
export function validateReaderMdx(raw, label, knownIds = new Set()) {
  const text = proseOutsideCode(raw), errors = [];
  for (const match of text.matchAll(/\]\(\s*(\/[^\s)]*)/g)) if (localDeveloperPath(match[1])) errors.push(`${label}: development Markdown must not be a public reading route`);
  const prose = text.replace(/<[^>]*>/g, '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
  return [...errors, ...validateReaderText(prose, { label, knownIds })];
}

/** Inspect decoded DOM text and head metadata, not embedded RSC/JSON scripts or attribute values. */
export function validateReaderHtml(html, { label = 'HTML', knownIds = new Set(), allowAIStatement = false, locale = null } = {}) {
  const document = htmlParser.parse(html), errors = [], ids = new Set();
  const isEnPage = locale === 'en' || (locale === null && /^en(?:\/|$)/.test(label));

  // Inspect <title> and public description metadata before stripping <head> noise.
  const titleNode = document.querySelector('title');
  const titleText = titleNode?.text ?? '';
  if (titleText) {
    errors.push(...validateReaderText(titleText, { label: `${label} <title>`, knownIds, strictFinalDelivery: true }));
    if (isEnPage && enScriptLeakRe.test(titleText)) {
      errors.push(`${label} <title>: leaked non-English CJK characters on English page: “${titleText}”`);
    }
  }
  const metaSelector = 'meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]';
  for (const meta of document.querySelectorAll(metaSelector)) {
    const content = meta.getAttribute('content') ?? '';
    if (!content) continue;
    const metaName = meta.getAttribute('name') ?? meta.getAttribute('property') ?? 'meta';
    errors.push(...validateReaderText(content, { label: `${label} <meta ${metaName}>`, knownIds, strictFinalDelivery: true }));
    if (isEnPage && enScriptLeakRe.test(content)) {
      errors.push(`${label} <meta ${metaName}>: leaked non-English CJK characters on English page: “${content}”`);
    }
  }

  for (const node of document.querySelectorAll('script,style')) node.remove();
  for (const node of document.querySelectorAll('[id]')) {
    const id = node.getAttribute('id');
    if (ids.has(id)) errors.push(`${label}: duplicate DOM id “${id}” (including print chapter anchors)`);
    ids.add(id);
  }
  // Preserve block boundaries without separating inline spans: textContent alone
  // would concatenate an exposed ID with the next paragraph's first word.
  const prose = document.structuredText;
  errors.push(...validateReaderText(prose, { label, knownIds, allowAIStatement, strictFinalDelivery: true }));
  const aiStatements = prose.match(aiExecution) ?? [];
  if (allowAIStatement && aiStatements.length > 1) errors.push(`${label}: general AI writing identity must appear only once`);
  for (const node of document.querySelectorAll('[aria-label]')) {
    const aria = node.getAttribute('aria-label') ?? '';
    errors.push(...validateReaderText(aria, { label: `${label} aria-label`, knownIds, strictFinalDelivery: true }));
  }
  for (const node of document.querySelectorAll('[href],[src]')) {
    const href = node.getAttribute('href') ?? node.getAttribute('src');
    if (localDeveloperPath(href)) errors.push(`${label}: development Markdown must not be served or indexed as a reader route`);
  }

  // Enforce zero non-whitelisted Han/Hiragana/Katakana characters on English public HTML pages.
  if (isEnPage) {
    const bodyDoc = htmlParser.parse(html);
    for (const node of bodyDoc.querySelectorAll('script,style,head,.english-term')) node.remove();
    for (const link of bodyDoc.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href') ?? '';
      if (href === '/zh/' || href.startsWith('/zh/') || (href === '/' && /中文/.test(link.text))) {
        link.remove();
      }
    }
    const enVisible = bodyDoc.structuredText;
    const leaks = enVisible.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu);
    if (leaks) {
      errors.push(`${label}: leaked non-English CJK characters on English page: “${[...new Set(leaks)].slice(0, 6).join('、')}”`);
    }
  }
  return errors;
}

export function validateReaderIndex(text) {
  const errors = validateReaderText(text, { label: 'llms.txt', strictFinalDelivery: true });
  if (/Research register|Literature map|Coverage and gaps|研究工作台|检索协议|\/downloads\/research\.json/i.test(text)) errors.push('llms.txt: advertise the reader bibliography, not the former research workbench/legacy register endpoint');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) if (localDeveloperPath(match[1])) errors.push('llms.txt: development Markdown must not enter the public AI reading index');
  return errors;
}

/** An alias must be inside its destination or immediately before it, so the native fragment scrolls there. */
function aliasDestination(node) {
  const target = node.getAttribute('data-legacy-for');
  if (!target) return null;
  if (node.parentNode?.id === target) return target;
  let sibling = node.nextElementSibling;
  while (sibling?.getAttribute('data-legacy-for') === target) sibling = sibling.nextElementSibling;
  return sibling?.id === target ? target : null;
}

const citationScopeExclusions = '.chapter-notes,[data-legacy-for],[data-legacy-notice],[data-legacy-scope],[data-copyedit-history],[data-flow-boundary-history],[data-service-constraints-history],[data-substitution-rules-history],[data-load-shift-history],[data-circular-footprint-history],[data-land-recovery-history],[data-acid-equivalents-history],[data-mineral-resources-history],[data-fossil-resources-history],[data-photochemical-ozone-history],[data-ozone-radiation-history],[data-toxicity-comparison-history],[data-water-scarcity-history],[data-biogenic-carbon-history],[data-eutrophication-pathways-history],[data-particulate-comparison-history],[data-part4-reread-history],[data-part4-reread-part],[data-weighting-valuation-history],[data-localization-comparison-history],[data-social-comparison-history],[data-cost-sustainability-history],[data-part5-reread-history],[data-part5-reread-part],[data-data-applicability-comparison-history],[data-uncertainty-comparison-history],[data-product-footprint-comparison-history],[data-data-quality-comparison-history],[data-part6-reread-history],[data-part6-reread-part],[data-wall-service-comparison-history],[data-interpretation-bags-history],[data-future-scenarios-history],[data-revisable-judgment-history],[data-part7-reread-history],[data-part7-reread-part],[data-market-response-comparison-history],.docs-pagination,.reader-view-label,.teaching-case';
const ordinaryCitationBlocks = 'p,ul,ol,dl,blockquote,pre,table,figure';

function nativeCitationScopes(document) {
  const scopes = new Map();
  for (const article of document.querySelectorAll('article[data-reader-route]')) {
    const stack = [];
    const chapter = { claimIds: new Set(), ordinaryHashes: [] };
    for (const node of article.querySelectorAll(`[data-reader-heading-key],[data-reader-section][id],a[role="doc-noteref"],${ordinaryCitationBlocks}`)) {
      if (node.closest(citationScopeExclusions)) continue;
      const key = node.getAttribute('data-reader-heading-key');
      const marker = node.hasAttribute('data-reader-section');
      if (key === '@unit') continue;
      if (key !== undefined || marker) {
        const depth = marker ? 100 : Number(node.tagName.slice(1));
        if (!Number.isInteger(depth)) continue;
        while (stack.length && stack.at(-1).depth >= depth) stack.pop();
        if (!node.id) continue;
        const scope = { claimIds: new Set(), ordinaryHashes: [] };
        scopes.set(node.id, scope);
        stack.push({ depth, scope });
      } else {
        const active = [chapter, ...stack.map(row => row.scope)];
        const id = node.getAttribute('data-reader-reference');
        if (id) {
          for (const scope of active) scope.claimIds.add(id);
        } else if (!node.querySelector('a[role="doc-noteref"]')
            && !node.parentNode?.closest(ordinaryCitationBlocks)) {
          const links = node.querySelectorAll('a[href]').map(link => [link.text, link.getAttribute('href')]);
          const text = node.text.replace(/\s+/g, ' ').trim();
          if (!text) continue;
          const digest = editionDigest({ tag: node.tagName, text, links });
          for (const scope of active) scope.ordinaryHashes.push(digest);
        }
      }
    }
    if (article.id) scopes.set(article.id, chapter);
    for (const group of article.querySelectorAll('.chapter-notes')) {
      const id = group.getAttribute('aria-labelledby');
      if (id) scopes.set(id, {
        claimIds: new Set(group.querySelectorAll('li[data-reader-claim]').map(note => note.getAttribute('data-reader-claim'))),
        ordinaryHashes: [],
      });
    }
  }
  return scopes;
}

export function readCitationSurface(document, path) {
  const ids = new Map();
  const errors = [];
  const noteNumbers = new Map(), nativeScopes = nativeCitationScopes(document);
  for (const section of document.querySelectorAll('.chapter-notes')) {
    const route = path === '/print' ? section.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    if (!route) {
      errors.push(`${path}: notes have no printed unit`);
      continue;
    }
    const prefix = path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route);
    const list = section.querySelector('ol');
    for (const [index, note] of (list?.childNodes.filter(node => node.tagName === 'LI') ?? []).entries()) {
      const claimId = note.getAttribute('data-reader-claim');
      if (!claimId || note.id !== chapterNoteAnchor(prefix, claimId)) errors.push(`${path}: note ${note.id} lacks a stable claim identity`);
      noteNumbers.set(note.id, index + 1);
    }
  }
  const cited = new Set(), bodyClaims = new Map();
  for (const marker of document.querySelectorAll('a[role="doc-noteref"]')) {
    const href = marker.getAttribute('href') ?? '';
    const claimId = marker.getAttribute('data-reader-reference');
    const route = path === '/print' ? marker.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    const prefix = route && (path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route));
    const occurrences = bodyClaims.get(route) ?? []; occurrences.push(claimId); bodyClaims.set(route,occurrences);
    const number = href.startsWith('#') ? noteNumbers.get(href.slice(1)) : null;
    if (!prefix || !claimId || href !== `#${chapterNoteAnchor(prefix, claimId)}` || !number
      || marker.text !== `[${number}]` || marker.getAttribute('aria-label') !== `注 ${number}`)
      errors.push(`${path}: note marker does not match its local endnote ${href}`);
    else cited.add(href.slice(1));
  }
  for (const id of noteNumbers.keys()) if (!cited.has(id)) errors.push(`${path}: unreferenced chapter note ${id}`);

  const scopedContexts = new Map();
  for (const scope of document.querySelectorAll('[data-legacy-scope]')) {
    const id = scope.getAttribute('data-legacy-scope'), list = scopedContexts.get(id) ?? [];
    list.push(scope); scopedContexts.set(id, list);
  }
  for (const node of document.querySelectorAll('[id]')) {
    const claimId = node.getAttribute('data-reader-claim');
    const route = path === '/print' ? node.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    const notice = node.hasAttribute('data-legacy-notice');
    const alias = aliasDestination(node);
    const context = notice || alias ? node.querySelector('.legacy-citation-context') : null;
    const edition = context?.querySelector('a')?.getAttribute('href');
    const date = context?.querySelector('time');
    const editionDate = date && date.text === date.getAttribute('datetime') ? date.text : null;
    const links = notice ? node.querySelectorAll('a[data-legacy-destination]').map(link => link.getAttribute('href')) : [];
    const section = /^H[1-6]$/.test(node.tagName) || node.getAttribute('data-reader-section') === node.id;
    if (ids.has(node.id)) errors.push(`${path}: duplicate citation surface ID ${node.id}`);
    const title = path === '/print' ? node.closest('article[data-reader-route]')?.getAttribute('data-reader-title') : document.querySelector('h1')?.text;
    const scopeNodes = scopedContexts.get(node.id) ?? [];
    const scope = scopeNodes.length === 1 ? scopeNodes[0] : null;
    const scopeLink = scope?.querySelector('a');
    const scopeDate = scope?.querySelector('time');
    ids.set(node.id, { claimIds: [...(nativeScopes.get(node.id)?.claimIds ?? (claimId ? [claimId] : []))],
      ordinaryHashes: nativeScopes.get(node.id)?.ordinaryHashes ?? [],
      visibleHeading: /^H[1-6]$/.test(node.tagName)
        ? (node.querySelector('[data-reader-heading-title]')?.text ?? node.text.replace(/复制章节链接$/, '')) : null,
      scopeAttached: scope && (node.tagName === 'ARTICLE' ? scope.parentNode === node : scope.previousElementSibling === node && scope.parentNode === node.parentNode), scopeCount: scopeNodes.length, scopeText: scope?.text, scopeEdition: scopeLink?.getAttribute('href'), scopeDate: scopeDate?.text === scopeDate?.getAttribute('datetime') ? scopeDate?.text : null, scopeLinks: scope?.querySelectorAll('a[data-legacy-scope-destination]').map(link=>link.getAttribute('href')), noticeText: context?.text, title, route, claimId, section, tag: node.tagName, notice, alias, edition, editionDate, links, number: noteNumbers.get(node.id) });
  }
  const printOrder = path === '/print' ? document.querySelectorAll('article[data-reader-route]').map(article => article.getAttribute('data-reader-route')) : [];
  const noteLinks = document.querySelectorAll('a[href]').map(link=>({href:link.getAttribute('href'),label:link.text})).filter(link=>/-claim-[A-Za-z0-9]/.test(link.href) && /注\s*\d+/.test(link.label));
  return { ids, errors, printOrder, noteLinks, bodyClaims };
}

/** Verify native source-subset context independently of the target's existence. */
function matchesCapturedScope(source, entry) {
  const captured = entry.currentCapturedScope ?? entry.capturedScope;
  if (!captured || !source) return !captured;
  return JSON.stringify(source.claimIds) === JSON.stringify(captured.claimIds)
    && JSON.stringify(source.ordinaryHashes) === JSON.stringify(captured.ordinaryHashes ?? [])
    && (entry.targets[0]?.kind !== 'heading' || source.visibleHeading === captured.title)
    && (!['chapter', 'note-group'].includes(entry.targets[0]?.kind) || source.title === captured.title);
}

export function validateHistoricalScope(source, entry, address = `${entry.path}/#${entry.id}`) {
  if (!entry.scope) {
    if (entry.mode === 'retained' && entry.capturedScope
        && !matchesCapturedScope(source, entry))
      return [`${address}: old ${entry.capturedScope.title} scope changed without a reviewed migration`];
    return [];
  }
  if (entry.mode === 'retained') {
    if (!source.scopeAttached || source.scopeCount !== 1 || !source.scopeText?.includes(entry.scope.text)
      || source.scopeEdition !== citationSourceHref(entry.edition.sourceCommit) || source.scopeDate !== entry.edition.sourceDate
      || JSON.stringify(source.scopeLinks) !== JSON.stringify(entry.scope.targets.map(target => citationHref(target, entry.path))))
      return [`${address}: missing or changed exact retained source-subset context`];
  } else if (!source.noticeText?.includes(entry.scope.text)) return [`${address}: missing exact relocated source-subset explanation`];
  return [];
}

export function getHistoricalCitationEntries(sourceBaseline, locations, history, historicPrintRoutes, book) {
  let entries = [...createLegacyCitationEntries(sourceBaseline, locations, history?.pages),
    ...(history ? createCanonicalCitationEntries(history, locations, historicPrintRoutes) : [])];
  if (book) entries = remapDataApplicabilityCitations(remapClimateAssemblyCitations(remapClosingSynthesisCitations(remapWallSelectionCitations(remapJointProductionCitations(remapHybridInventoryCitations(remapExchangeSemanticsCitations(remapProcessNetworkCitations(remapFunctionalReferenceCitations(remapCleanerProductionCitations(remapBookCitations(
    [...entries,...publishedHeadingEntries(book.headingHistory),...cleanerProductionHeadingEntries(book.cleanerHeadingHistory),...functionalReferenceHeadingEntries(book.functionalHeadings),...processNetworkHeadingEntries(book.processHeadings),...exchangeSemanticsHeadingEntries(book.exchangeHeadings),...hybridInventoryHeadingEntries(book.hybridHeadings),...jointProductionHeadingEntries(book.jointHeadings),...wallSelectionHeadingEntries(book.wallHeadings),...closingSynthesisHeadingEntries(book.closingHistory),...climateAssemblyHeadingEntries(),...dataApplicabilityHeadingEntries()],book.edition,book.accepted,locations),book.cleanerAccepted,book.cleanerHeadingHistory),book.functionalAccepted,book.functionalHeadings),book.processAccepted,book.processHeadings),book.exchangeOriginal,book.exchangeHeadings,book.exchangePartial,book.exchangeCitations),book.hybridAccepted,book.hybridHeadings),book.jointOriginal,book.jointHeadings,book.jointProse),book.wallOriginal,book.wallHeadings,book.wallAccepted),book.closingHistory,book.closingProse),book.climateAccepted),book.dataAccepted);
  if (book) {
    entries = remapToxicityPathwaysCitations([...entries, ...toxicityPathwaysHeadingEntries()],book.toxicityAccepted);
    entries = remapReadablePedigreeCitations([...entries, ...readablePedigreeHeadingEntries()], book.pedigreeAccepted);
    entries = remapPmSelectionCitations([...entries, ...pmSelectionHeadingEntries()], book.pmAccepted);
    if (book.hostedHistory) entries = qualifyReadableBookCitations(entries, book.hostedHistory, book.current?.migrations);
  }
  return entries;
}

export function validateReadableBookOrdinaryDestinations(pages, entry, address, flowBoundary,
  priorSurface = (key, actual) => flowBoundaryPreviousSurface(key, actual, flowBoundary)) {
  const errors = [];
  for (const row of entry.ordinaryDispositions ?? []) {
    for (const destination of row.destinations) {
      const target = (entry.scope?.targets ?? entry.targets).find(item => `${item.path}#${item.id}` === destination.address);
      const actual = target && pages.get(target.path)?.ids.get(target.id);
      if (!actual || (destination.currentSha256
        ? !actual.ordinaryHashes.includes(destination.currentSha256)
          && !priorSurface(destination.address, actual).ordinaryHashes.includes(destination.currentSha256)
        : !actual.claimIds.includes(destination.claimId))) {
        errors.push(`${address}: actual ordinary-content destination differs: ${destination.address}`);
      }
    }
  }
  return errors;
}

async function validateCitationOutput(root, sourceBaseline, locations, availableRoutes, history, book, validateArtifacts) {
  const numbered = book ? await validateReaderNumberingOutput(root,{sources:book.sources,edition:book.edition}) : null;
  if (numbered?.errors.length) return numbered.errors;
  const sourceRoutes = availableRoutes ?? [...sourceBaseline.pages.map(page => page.route), ...(locations.printAdditions ?? []).map(page => page.route)];
  const printRoutes = book ? currentEditionKeys(book.edition, sourceRoutes, sourceBaseline, locations) : createCurrentPrintRoutes(sourceBaseline, locations, sourceRoutes);
  const historicPrintRoutes = book ? [...sourceBaseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route),...locations.frontMatter,...(locations.printAdditions??[]).map(unit=>unit.route)] : printRoutes;
  const copyedit = copyeditHistoryPlan(book?.current?.copyedit);
  const serviceConstraints = book?.current?.serviceConstraints;
  const substitutionRules = book?.current?.substitutionRules;
  const loadShift = book?.current?.loadShift;
  const footprint = book?.current?.circularFootprint;
  const land = book?.current?.landRecovery;
  const acid = book?.current?.acidEquivalents;
  const minerals = book?.current?.mineralResources;
  const fossils = book?.current?.fossilResources;
  const photochemicalOzone = book?.current?.photochemicalOzone;
  const ozoneRadiation = book?.current?.ozoneRadiation;
  const toxicityComparison = book?.current?.toxicityComparison;
  const waterScarcity = book?.current?.waterScarcity;
  const biogenicCarbon = book?.current?.biogenicCarbon;
  const eutrophicationPathways = book?.current?.eutrophicationPathways;
  const particulateComparison = book?.current?.particulateComparison;
  const part4Reread = book?.current?.part4Reread;
  const weightingValuation = book?.current?.weightingValuation;
  const localizationComparison = book?.current?.localizationComparison;
  const socialComparison = book?.current?.socialComparison;
  const costSustainability = book?.current?.costSustainability;
  const part5Reread = book?.current?.part5Reread;
  const dataApplicabilityComparison = book?.current?.dataApplicabilityComparison;
  const uncertaintyComparison = book?.current?.uncertaintyComparison;
  const productFootprintComparison = book?.current?.productFootprintComparison;
  const dataQualityComparison = book?.current?.dataQualityComparison;
  const part6Reread = book?.current?.part6Reread;
  const wallServiceComparison = book?.current?.wallServiceComparison;
  const interpretationBags = book?.current?.interpretationBags;
  const futureScenarios = book?.current?.futureScenarios;
  const marketResponseComparison = book?.current?.marketResponseComparison;
  const part3Reread = book?.current?.part3Reread;
  const functionalReferenceComparison = book?.current?.functionalReferenceComparison;
  const hybridInventoryComparison = book?.current?.hybridInventoryComparison;
  const part2Reread = book?.current?.part2Reread;
  const frameworkComparison = book?.current?.frameworkComparison;
  const part1Reread = book?.current?.part1Reread;
  const wholeBookReread = book?.current?.wholeBookReread;
  const part7Reread = book?.current?.part7Reread;
  const revisableJudgment = book?.current?.revisableJudgment;
  const activeRevisions = book ? (book.current?.revisions ?? currentRevisions) : [];
  const entries = applyRouteChangesToCitations(applyClaimRetirementsToCitations(relabelHistoricalTargets(flowBoundaryCitationEntries(
    copyeditHistoryEntries(getHistoricalCitationEntries(sourceBaseline, locations, history, historicPrintRoutes, book), copyedit),
    book?.current?.flowBoundary), [...serviceConstraints?.routes ?? [], ...substitutionRules?.routes ?? [], ...loadShift?.routes ?? [], ...footprint?.routes ?? [], ...land?.routes ?? [], ...acid?.routes ?? [], ...minerals?.routes ?? [], ...fossils?.routes ?? [], ...photochemicalOzone?.routes ?? [], ...ozoneRadiation?.routes ?? [], ...toxicityComparison?.routes ?? [], ...waterScarcity?.routes ?? [], ...biogenicCarbon?.routes ?? [], ...eutrophicationPathways?.routes ?? [], ...particulateComparison?.routes ?? [], ...part4Reread?.routes ?? [], ...weightingValuation?.routes ?? [], ...localizationComparison?.routes ?? [], ...socialComparison?.routes ?? [], ...costSustainability?.routes ?? [], ...part5Reread?.routes ?? [], ...dataApplicabilityComparison?.routes ?? [], ...uncertaintyComparison?.routes ?? [], ...productFootprintComparison?.routes ?? [], ...dataQualityComparison?.routes ?? [], ...part6Reread?.routes ?? [], ...wallServiceComparison?.routes ?? [], ...interpretationBags?.routes ?? [], ...futureScenarios?.routes ?? [], ...revisableJudgment?.routes ?? [], ...part7Reread?.routes ?? [], ...marketResponseComparison?.routes ?? [], ...part3Reread?.routes ?? [], ...functionalReferenceComparison?.routes ?? [], ...hybridInventoryComparison?.routes ?? [], ...part2Reread?.routes ?? [], ...frameworkComparison?.routes ?? [], ...part1Reread?.routes ?? [], ...wholeBookReread?.routes ?? []]), book ? (book.current?.retirements ?? currentRetirements) : []), activeRevisions);
  const addresses = new Set();
  for (const entry of entries) {
    const address = `${entry.path}#${entry.id}`;
    if (addresses.has(address)) throw new Error(`Duplicate historical citation address: ${address}`);
    addresses.add(address);
  }
  const pages = new Map(), documents = new Map();
  const errors = book ? [
    ...validateReadableBookReviewedOutput(book.current, numbered?.documents, book.sources, book.edition, book.catalog, book.readings),
    ...await validateArtifacts(root, book.current, book),
  ] : [];
  const { mergedFromSet, removedRouteSet, activePrefix } = extractRouteChanges(activeRevisions);
  const prefixDir = activePrefix ? activePrefix.replace(/^\//, '') : '';
  for (const path of new Set([...sourceBaseline.pages.map(page => page.route), ...(history?.pages ?? []).map(page => page.route), ...(locations.printAdditions ?? []).map(page => page.route), ...(book ? [...numbered.documents.keys(), pmSelectionAppendix, ...entries.flatMap(entry => [entry.path, ...entry.targets.map(target => target.path), ...entry.scope?.targets?.map(target => target.path) ?? []])] : []), '/print'])) {
    if (mergedFromSet.has(path) || removedRouteSet.has(path)) continue;
    const htmlFile = path === '/' ? join(root, 'index.html') : join(root, prefixDir, path.slice(1), 'index.html');
    const html = await readFile(htmlFile, 'utf8').catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (html === null) {
      errors.push(`${path}: missing legacy reader route`);
      continue;
    }
    const document = numbered ? numbered.documents.get(path) : htmlParser.parse(html);
    if (!document) { errors.push(`${path}: missing independently verified numbered semantic document`); continue; }
    documents.set(path, document);
    const surface = readCitationSurface(document, path);
    if (!surface.ids.has('main-content')) errors.push(`${path}: missing main-content fragment`);
    pages.set(path, surface);
    errors.push(...surface.errors);
  }
  const editorialHistory = showEditorialHistoryInProse();
  if (editorialHistory) {
    errors.push(...validateFlowBoundaryHistoryOutput(documents, book?.current?.flowBoundary));
    errors.push(...validateServiceConstraintsHistoryOutput(documents, serviceConstraints));
  } else if (book) {
    errors.push(...await validateCleanDeliveryOutput(root, documents));
    if (frameworkComparison && !isRouteRevised(activeRevisions, '/docs/book/framework-responsibilities')) errors.push(...validateFrameworkComparisonTables(documents));
  }
  const previousSurface = (address, actual) => flowBoundaryPreviousSurface(address,
    serviceConstraintsPreviousSurface(address, substitutionRulesPreviousSurface(address, loadShiftPreviousSurface(address, circularFootprintPreviousSurface(address, landRecoveryPreviousSurface(address, acidEquivalentsPreviousSurface(address, mineralResourcesPreviousSurface(address, fossilResourcesPreviousSurface(address, photochemicalOzonePreviousSurface(address, ozoneRadiationPreviousSurface(address, toxicityComparisonPreviousSurface(address, waterScarcityPreviousSurface(address, biogenicCarbonPreviousSurface(address, eutrophicationPathwaysPreviousSurface(address, particulateComparisonPreviousSurface(address, part4RereadPreviousSurface(address, weightingValuationPreviousSurface(address, localizationComparisonPreviousSurface(address, socialComparisonPreviousSurface(address, costSustainabilityPreviousSurface(address, part5RereadPreviousSurface(address, dataApplicabilityComparisonPreviousSurface(address, uncertaintyComparisonPreviousSurface(address, productFootprintComparisonPreviousSurface(address, dataQualityComparisonPreviousSurface(address, part6RereadPreviousSurface(address, wallServiceComparisonPreviousSurface(address, interpretationBagsPreviousSurface(address, futureScenariosPreviousSurface(address, revisableJudgmentPreviousSurface(address, part7RereadPreviousSurface(address, marketResponseComparisonPreviousSurface(address, part3RereadPreviousSurface(address, functionalReferenceComparisonPreviousSurface(address, hybridInventoryComparisonPreviousSurface(address, part2RereadPreviousSurface(address, frameworkComparisonPreviousSurface(address, part1RereadPreviousSurface(address, wholeBookRereadPreviousSurface(address, actual, wholeBookReread), part1Reread), frameworkComparison), part2Reread), hybridInventoryComparison), functionalReferenceComparison), part3Reread), marketResponseComparison), part7Reread), revisableJudgment), futureScenarios), interpretationBags), wallServiceComparison), part6Reread), dataQualityComparison), productFootprintComparison), uncertaintyComparison), dataApplicabilityComparison), part5Reread), costSustainability), socialComparison), localizationComparison), weightingValuation), part4Reread), particulateComparison), eutrophicationPathways), biogenicCarbon), waterScarcity), toxicityComparison), ozoneRadiation), photochemicalOzone), fossils), minerals), acid), land), footprint), loadShift), substitutionRules), serviceConstraints), book?.current?.flowBoundary);
  if ((serviceConstraints || loadShift) && book?.sourceRoot) {
    const cases = await loadCasePublications(book.sourceRoot);
    if (serviceConstraints) await observeServiceConstraintsCaseOutputs(root, serviceConstraints, cases, book.sourceCommit);
    if (loadShift) await observeLoadShiftCaseOutputs(root, loadShift, cases, book.sourceCommit);
  }
  if (copyedit && editorialHistory) {
    const currentAddresses = observeCopyeditHistory(documents, readerNumberingManifest, readCitationSurface);
    const wholeBookHistory = qualifyWholeBookRereadHistory(documents, wholeBookReread, currentAddresses, part1Reread, frameworkComparison, part2Reread, part3Reread, part7Reread, part6Reread, part5Reread, part4Reread);
    errors.push(...wholeBookHistory.errors);
    const part1History = qualifyPart1RereadHistory(documents, part1Reread, wholeBookHistory.prior, part2Reread, part3Reread, part7Reread, part6Reread, part5Reread, part4Reread, wholeBookReread);
    errors.push(...part1History.errors);
    const fwHistory = qualifyFrameworkComparisonHistory(documents, frameworkComparison, part1History.prior, wholeBookReread);
    errors.push(...fwHistory.errors);
    const part2History = qualifyPart2RereadHistory(documents, part2Reread, fwHistory.prior, part3Reread, part7Reread, part6Reread, part5Reread, part4Reread, part1Reread, wholeBookReread);
    errors.push(...part2History.errors);
    const hybHistory = qualifyHybridInventoryComparisonHistory(documents, hybridInventoryComparison, part2History.prior);
    errors.push(...hybHistory.errors);
    const frHistory = qualifyFunctionalReferenceComparisonHistory(documents, functionalReferenceComparison, hybHistory.prior);
    errors.push(...frHistory.errors);
    const part3History = qualifyPart3RereadHistory(documents, part3Reread, frHistory.prior, marketResponseComparison, part7Reread, part6Reread, part5Reread, part4Reread, substitutionRules, part2Reread);
    errors.push(...part3History.errors);
    const mktHistory = qualifyMarketResponseComparisonHistory(documents, marketResponseComparison, part3History.prior);
    errors.push(...mktHistory.errors);
    const part7History = qualifyPart7RereadHistory(documents, part7Reread, mktHistory.prior, revisableJudgment, futureScenarios, interpretationBags, part6Reread, part5Reread, part4Reread, part3Reread, part2Reread, part1Reread, wholeBookReread);
    errors.push(...part7History.errors);
    const revHistory = qualifyRevisableJudgmentHistory(documents, revisableJudgment, part7History.prior, part7Reread);
    errors.push(...revHistory.errors);
    const futHistory = qualifyFutureScenariosHistory(documents, futureScenarios, revHistory.prior, part7Reread);
    errors.push(...futHistory.errors);
    const intHistory = qualifyInterpretationBagsHistory(documents, interpretationBags, futHistory.prior);
    errors.push(...intHistory.errors);
    const wscHistory = qualifyWallServiceComparisonHistory(documents, wallServiceComparison, intHistory.prior);
    errors.push(...wscHistory.errors);
    const part6History = qualifyPart6RereadHistory(documents, part6Reread, wscHistory.prior, part5Reread, part4Reread, uncertaintyComparison, dataQualityComparison, part7Reread, part3Reread, part2Reread, part1Reread, wholeBookReread);
    errors.push(...part6History.errors);
    const dqpHistory = qualifyDataQualityComparisonHistory(documents, dataQualityComparison, part6History.prior);
    errors.push(...dqpHistory.errors);
    const pfrHistory = qualifyProductFootprintComparisonHistory(documents, productFootprintComparison, dqpHistory.prior);
    errors.push(...pfrHistory.errors);
    const uncHistory = qualifyUncertaintyComparisonHistory(documents, uncertaintyComparison, pfrHistory.prior, part6Reread);
    errors.push(...uncHistory.errors);
    const dappHistory = qualifyDataApplicabilityComparisonHistory(documents, dataApplicabilityComparison, uncHistory.prior);
    errors.push(...dappHistory.errors);
    const part5History = qualifyPart5RereadHistory(documents, part5Reread, dappHistory.prior, part4Reread, weightingValuation, socialComparison, part6Reread, part7Reread, part3Reread, part2Reread, part1Reread, wholeBookReread);
    errors.push(...part5History.errors);
    const costHistory = qualifyCostSustainabilityHistory(documents, costSustainability, part5History.prior);
    errors.push(...costHistory.errors);
    const socialHistory = qualifySocialComparisonHistory(documents, socialComparison, costHistory.prior);
    errors.push(...socialHistory.errors);
    const localizationHistory = qualifyLocalizationComparisonHistory(documents, localizationComparison, socialHistory.prior, part5Reread);
    errors.push(...localizationHistory.errors);
    const weightingHistory = qualifyWeightingValuationHistory(documents, weightingValuation, localizationHistory.prior, part5Reread);
    errors.push(...weightingHistory.errors);
    const part4History = qualifyPart4RereadHistory(documents, part4Reread, weightingHistory.prior, particulateComparison, biogenicCarbon, part5Reread, part6Reread, part7Reread, part3Reread, part2Reread, part1Reread, wholeBookReread);
    errors.push(...part4History.errors);
    const particulateHistory = qualifyParticulateComparisonHistory(documents, particulateComparison, part4History.prior, part4Reread);
    errors.push(...particulateHistory.errors);
    const eutroHistory = qualifyEutrophicationPathwaysHistory(documents, eutrophicationPathways, particulateHistory.prior, photochemicalOzone, acid);
    errors.push(...eutroHistory.errors);
    const bioHistory = qualifyBiogenicCarbonHistory(documents, biogenicCarbon, eutroHistory.prior, part4Reread);
    errors.push(...bioHistory.errors);
    const waterHistory = qualifyWaterScarcityHistory(documents, waterScarcity, bioHistory.prior);
    errors.push(...waterHistory.errors);
    const toxHistory = qualifyToxicityComparisonHistory(documents, toxicityComparison, waterHistory.prior);
    errors.push(...toxHistory.errors);
    const ozradHistory = qualifyOzoneRadiationHistory(documents, ozoneRadiation, toxHistory.prior, fossils, minerals, land);
    errors.push(...ozradHistory.errors);
    const ozoneHistory = qualifyPhotochemicalOzoneHistory(documents, photochemicalOzone, ozradHistory.prior, acid);
    errors.push(...ozoneHistory.errors);
    const fossilHistory = qualifyFossilResourcesHistory(documents, fossils, ozoneHistory.prior, minerals, land);
    errors.push(...fossilHistory.errors);
    const mineralHistory = qualifyMineralResourcesHistory(documents, minerals, fossilHistory.prior, land);
    errors.push(...mineralHistory.errors);
    const acidHistory = qualifyAcidEquivalentsHistory(documents, acid, mineralHistory.prior);
    errors.push(...acidHistory.errors);
    const landHistory = qualifyLandRecoveryHistory(documents, land, acidHistory.prior);
    errors.push(...landHistory.errors);
    const footprintHistory = qualifyCircularFootprintHistory(documents, footprint, landHistory.prior);
    errors.push(...footprintHistory.errors);
    const shiftHistory = qualifyLoadShiftHistory(documents, loadShift, footprintHistory.prior);
    errors.push(...shiftHistory.errors);
    const substitutionHistory = qualifySubstitutionRulesHistory(documents, substitutionRules, shiftHistory.prior);
    errors.push(...substitutionHistory.errors);
    const priorAddresses = serviceConstraints
      ? qualifyServiceConstraintsHistory(serviceConstraints, substitutionHistory.prior, observeServiceConstraintsOrdinaryTargets(documents))
      : substitutionHistory.prior;
    const copyeditErrors = validateCopyeditHistory(documents,
      projectFlowBoundaryHistory(priorAddresses, book.current.flowBoundary),
      copyedit, projectWholeBookRereadPrintParts(wholeBookReread, projectPart4RereadPrintParts(part4Reread, projectPart5RereadPrintParts(part5Reread, projectPart6RereadPrintParts(part6Reread, projectPart7RereadPrintParts(part7Reread, projectPart3RereadPrintParts(part3Reread, projectPart2RereadPrintParts(part2Reread, projectPart1RereadPrintParts(part1Reread, book.current.copyedit.printParts)))))))));
    errors.push(...copyeditErrors);
    // Article fingerprints already checked the complete normalized output.
    // Earlier chapter predicates inspect a prose projection after the new
    // historical apparatus has independently passed its exact DOM checks.
    if (!copyeditErrors.length && !substitutionHistory.errors.length && !shiftHistory.errors.length && !footprintHistory.errors.length && !landHistory.errors.length && !acidHistory.errors.length && !mineralHistory.errors.length && !fossilHistory.errors.length && !ozoneHistory.errors.length && !ozradHistory.errors.length && !toxHistory.errors.length && !waterHistory.errors.length && !bioHistory.errors.length && !eutroHistory.errors.length && !particulateHistory.errors.length && !part4History.errors.length && !weightingHistory.errors.length && !localizationHistory.errors.length && !socialHistory.errors.length && !costHistory.errors.length && !part5History.errors.length && !dappHistory.errors.length && !uncHistory.errors.length && !pfrHistory.errors.length && !dqpHistory.errors.length && !part6History.errors.length && !wscHistory.errors.length && !intHistory.errors.length && !futHistory.errors.length && !revHistory.errors.length && !part7History.errors.length && !mktHistory.errors.length && !part3History.errors.length && !frHistory.errors.length && !hybHistory.errors.length && !part2History.errors.length && !fwHistory.errors.length && !part1History.errors.length && !wholeBookHistory.errors.length) for (const document of documents.values()) {
      for (const notice of document.querySelectorAll('[data-copyedit-history],[data-flow-boundary-history],[data-service-constraints-history],[data-substitution-rules-history],[data-load-shift-history],[data-circular-footprint-history],[data-land-recovery-history],[data-acid-equivalents-history],[data-mineral-resources-history],[data-fossil-resources-history],[data-photochemical-ozone-history],[data-ozone-radiation-history],[data-toxicity-comparison-history],[data-water-scarcity-history],[data-biogenic-carbon-history],[data-eutrophication-pathways-history],[data-particulate-comparison-history],[data-part4-reread-history],[data-part4-reread-part],[data-part4-reread-correction],[data-weighting-valuation-history],[data-weighting-valuation-correction],[data-localization-comparison-history],[data-localization-comparison-correction],[data-social-comparison-history],[data-social-comparison-correction],[data-cost-sustainability-history],[data-cost-sustainability-correction],[data-part5-reread-history],[data-part5-reread-part],[data-part5-reread-correction],[data-data-applicability-comparison-history],[data-data-applicability-comparison-correction],[data-uncertainty-comparison-history],[data-uncertainty-comparison-correction],[data-product-footprint-comparison-history],[data-data-quality-comparison-history],[data-part6-reread-history],[data-part6-reread-part],[data-part6-reread-correction],[data-wall-service-comparison-history],[data-interpretation-bags-history],[data-future-scenarios-history],[data-revisable-judgment-history],[data-part7-reread-history],[data-part7-reread-part],[data-part7-reread-correction],[data-market-response-comparison-history],[data-part3-reread-history],[data-part3-reread-part],[data-part3-reread-correction],[data-functional-reference-comparison-history],[data-hybrid-inventory-comparison-history],[data-part2-reread-history],[data-part2-reread-part],[data-part2-reread-correction],[data-framework-comparison-history],[data-part1-reread-history],[data-part1-reread-part],[data-part1-reread-correction],[data-whole-book-reread-history],[data-whole-book-reread-part],[data-whole-book-reread-correction]')) notice.remove();
    }
  }
  const isRevised = (...routes) => isRouteRevised(activeRevisions, ...routes);
  for (const [path, document] of documents) {
    qualifyCurrentHistoricalDocument(document, entries, book?.current?.migrations, pages);
    if (book?.current?.migrations?.length)
      errors.push(...validateCurrentHistoricalContexts(document, entries, path));
    if (book) withCleanDeliveryValidation(!editorialHistory, () => {
      if (!isRevised('/docs/book/database-fitness-and-documentation', '/docs/book/review-support-and-version-boundaries', '/docs/monograph/data-applicability'))
        errors.push(...validateRenderedDataApplicability(document,path,book.catalog,book.dataAccepted,undefined,"raw"));
      if (!isRevised('/docs/book/climate-response-and-metrics', '/docs/book/emission-time-and-assessment', '/docs/monograph/climate-equivalence'))
        errors.push(...validateRenderedClimateAssembly(document,path,book.catalog,book.climateAccepted));
      if (!isRevised('/docs/book/connecting-objects-references-and-time', '/docs/book/from-connected-results-to-conditional-judgment', '/docs/monograph/revisable-judgment'))
        errors.push(...validateRenderedClosingSynthesis(document,path,book.catalog,book.closingProse,book.closingHistory));
      if (!isRevised('/docs/book/wall-service-to-comparison'))
        errors.push(...validateRenderedWallSelection(document,path,book.wallOriginal,book.catalog,book.wallAccepted));
      if (!isRevised('/docs/book/joint-production-and-allocation', '/docs/book/allocation-and-substitution', '/docs/book/allocation-judgment-and-corrections', '/docs/monograph/joint-production', '/docs/book/joint-production'))
        errors.push(...validateRenderedJointProduction(document,path,book.jointOriginal,book.catalog,book.jointProse));
      if (!isRevised('/docs/book/cleaner-production-and-life-cycle-thinking'))
        errors.push(...validateRenderedCleanerProduction(document,path,book.cleanerAccepted,book.catalog));
      if (!isRevised('/docs/book/service-and-reference'))
        errors.push(...validateRenderedFunctionalReference(document,path,book.functionalAccepted,book.catalog,book.functionalProse));
      if (!isRevised('/docs/book/process-and-network'))
        errors.push(...validateRenderedProcessNetwork(document,path,book.processAccepted,book.catalog,book.processProse));
      if (!isRevised('/docs/book/exchange-and-elementary-flow'))
        errors.push(...validateRenderedExchangeSemantics(document,path,book.exchangeOriginal,book.catalog,book.exchangeProse,book.exchangePartial));
      if (!isRevised('/docs/book/inventory-boundary-and-hybrid'))
        errors.push(...validateRenderedHybridInventory(document,path,book.hybridAccepted,book.catalog,book.hybridProse));
      if (!isRevised('/docs/book/usetox-pathways-and-boundaries'))
        errors.push(...validateRenderedToxicityPathways(document,path,book.catalog,book.toxicityAccepted));
      if (!isRevised('/docs/book/data-quality-and-probability'))
        errors.push(...validateRenderedReadablePedigree(document, path, book.catalog, book.pedigreeAccepted, undefined, book.readings));
      if (!isRevised('/docs/book/particulate-emissions-and-health'))
        errors.push(...validateRenderedPmSelection(document, path, book.catalog, book.pmAccepted));
    });
  }
  const print = pages.get('/print');
  if (print) {
    if (JSON.stringify(print.printOrder) !== JSON.stringify(printRoutes)) errors.push('/print: printed unit order differs from the explicit current reading edition');
    for (const id of ['writing-note', 'print-references']) if (!print.ids.has(id)) errors.push(`/print: missing ${id} fragment`);
  }

  for (const entry of entries) {
    const address = `${entry.path}/#${entry.id}`;
    const page = pages.get(entry.path);
    if (!page) continue;
    const source = page.ids.get(entry.id);
    if (!source) {
      errors.push(`${address}: missing old citation target`);
      continue;
    }
    if (entry.mode !== 'retained' && (source.edition !== citationSourceHref(entry.edition.sourceCommit) || source.editionDate !== entry.edition.sourceDate))
      errors.push(`${address}: missing exact edition context`);
    if (entry.mode === 'alias' && source.alias !== entry.targets[0].id) errors.push(`${address}: alias does not land at its destination`);
    if (entry.mode === 'notice') {
      const expected = entry.targets.map(target => citationHref(target, entry.path));
      if (!source.notice || JSON.stringify(source.links) !== JSON.stringify(expected)) errors.push(`${address}: migration notice has the wrong native links`);
    }
    if (editorialHistory) {
      errors.push(...validateHistoricalScope(
        previousSurface(`${entry.path}#${entry.id}`, source), entry, address));
      errors.push(...validateReadableBookOrdinaryDestinations(pages, entry, address, book?.current?.flowBoundary, previousSurface));
    }
    for (const target of [...entry.targets, ...(entry.scope?.targets ?? [])]) {
      const actual = pages.get(target.path)?.ids.get(target.id);
      const semanticMatch = actual?.route === target.route && (
        target.kind === 'note' ? actual.tag === 'LI' && actual.claimId === target.claimId && actual.number :
        target.kind === 'chapter' ? actual.tag === 'ARTICLE' :
        target.kind === 'note-group' ? /^H[23]$/.test(actual.tag) : actual.section);
      if (!semanticMatch) errors.push(`${address}: wrong or missing ${target.kind} destination ${target.path}/#${target.id}`);
      if (entry.mode === 'alias' && !entry.scope && !entry.retiredFrom && entry.capturedScope
          && !matchesCapturedScope(previousSurface(`${target.path}#${target.id}`, actual), entry))
        errors.push(`${address}: old ${entry.capturedScope.title} aliased scope changed without a reviewed migration`);

    }
  }
  // Every displayed cross-unit note label must use the actual destination plan.
  for (const [path, surface] of pages) for (const link of surface.noteLinks) {
    const match = /^(?:([^#]+?)\/?)?#(.+)$/.exec(link.href);
    if (!match) continue;
    const destinationPath = match[1]?.replace(/\/$/,'') || path;
    const actual = pages.get(destinationPath)?.ids.get(decodeURIComponent(match[2]));
    const number = /注\s*(\d+)/.exec(link.label)?.[1];
    if (!actual?.number || Number(number)!==actual.number) errors.push(`${path}: wrong or missing destination note label ${link.href}`);
    const title = /^《(.+?)》注/.exec(link.label)?.[1];
    if (title && actual?.title && title !== actual.title) errors.push(`${path}: wrong destination note title ${link.href}`);
  }
  if (book?.sources) {
    if (!isRevised('/docs/book/particulate-emissions-and-health'))
      errors.push(...validatePmSelectionCoverage(book.edition, book.sources, book.catalog, book.pmAccepted, undefined, { readings: book.readings, literature: book.literature }));
    if (!isRevised('/docs/book/usetox-pathways-and-boundaries'))
      errors.push(...validateToxicityPathwaysCoverage(book.edition,book.sources,book.catalog,book.toxicityAccepted,undefined,{ readings:book.readings, literature:book.literature }));
    if (!isRevised('/docs/book/database-fitness-and-documentation', '/docs/book/review-support-and-version-boundaries', '/docs/monograph/data-applicability'))
      errors.push(...validateDataApplicabilityCoverage(book.edition,book.sources,book.catalog,book.dataAccepted));
    if (!isRevised('/docs/book/climate-response-and-metrics', '/docs/book/emission-time-and-assessment', '/docs/monograph/climate-equivalence'))
      errors.push(...validateClimateAssemblyCoverage(book.edition,book.sources,book.catalog,book.climateAccepted));
    if (!isRevised('/docs/book/data-quality-and-probability'))
      errors.push(...validateReadablePedigreeCoverage(book.edition, book.sources, book.catalog, book.pedigreeAccepted, undefined, 'raw', book.readings));
    if (!isRevised('/docs/book/connecting-objects-references-and-time', '/docs/book/from-connected-results-to-conditional-judgment', '/docs/monograph/revisable-judgment'))
      errors.push(...validateClosingSynthesisCoverage(book.edition,book.sources,book.catalog,book.closingProse,undefined,'raw',undefined,undefined,book.toxicityAccepted,undefined,book.pedigreeAccepted));
    if (!isRevised('/docs/book/wall-service-to-comparison'))
      errors.push(...validateWallSelectionCoverage(book.edition,book.sources,book.wallOriginal,book.catalog,book.wallAccepted));
    if (!isRevised('/docs/book/joint-production-and-allocation', '/docs/book/allocation-and-substitution', '/docs/book/allocation-judgment-and-corrections', '/docs/monograph/joint-production', '/docs/book/joint-production'))
      errors.push(...validateJointProductionCoverage(book.edition,book.sources,book.jointOriginal,book.catalog,book.jointProse));
    if (!isRevised('/docs/book/framework-history', '/docs/monograph/framework-responsibilities'))
      errors.push(...validateFrameworkCoverage(book.edition,book.sources,book.accepted));
    if (!isRevised('/docs/book/cleaner-production-and-life-cycle-thinking'))
      errors.push(...validateCleanerProductionCoverage(book.edition,book.sources,book.cleanerAccepted,book.catalog));
    if (!isRevised('/docs/book/service-and-reference'))
      errors.push(...validateFunctionalReferenceCoverage(book.edition,book.sources,book.functionalAccepted,book.catalog,book.functionalProse));
    if (!isRevised('/docs/book/inventory-boundary-and-hybrid'))
      errors.push(...validateHybridInventoryCoverage(book.edition,book.sources,book.hybridAccepted,book.catalog,book.hybridProse));
    if (!isRevised('/docs/book/process-and-network'))
      errors.push(...validateProcessNetworkCoverage(book.edition,book.sources,book.processAccepted,book.catalog,book.processProse));
    if (!isRevised('/docs/book/exchange-and-elementary-flow'))
      errors.push(...validateExchangeSemanticsCoverage(book.edition,book.sources,book.exchangeOriginal,book.catalog,book.exchangeProse,book.exchangePartial));
  }
  if (book && print && !isRevised('/docs/book/framework-history', '/docs/monograph/framework-responsibilities')) errors.push(...validateRenderedFrameworkCoverage(print.bodyClaims,book.accepted));
  return errors;
}

export async function validateCleanDeliveryOutput(root, documents, publicLedger = buildPublicRevisionsAndErrata()) {
  const errors = [];
  for (const [path, document] of documents) {
    const nodes = document.querySelectorAll('*');
    for (const node of nodes) {
      for (const attr of Object.keys(node.attributes ?? {})) {
        if (FORBIDDEN_PROSE_ATTR_PATTERNS.some(re => re.test(attr))) {
          errors.push(`${path}: clean-delivery violation — development-process control [${attr}] must not render in public prose or /print`);
        }
      }
    }
    for (const node of document.querySelectorAll('.legacy-citation-context')) {
      if (!node.closest('.legacy-citation-target')) {
        errors.push(`${path}: clean-delivery violation — visible .legacy-citation-context outside .legacy-citation-target`);
      }
    }
    const visibleRoots = document.querySelectorAll('article[data-reader-route], section.print-part');
    for (const container of visibleRoots) {
      const text = container.text;
      for (const pattern of FORBIDDEN_PROSE_TEXT_PATTERNS) {
        if (pattern.test(text)) {
          errors.push(`${path}: clean-delivery violation — development-process disclosure text matched ${pattern}`);
        }
      }
    }
  }
  const { activePrefix: cleanPrefix } = extractRouteChanges(currentRevisions);
  const prefixedChanges = cleanPrefix ? join(root, cleanPrefix.replace(/^\//, ''), 'changes/index.html') : null;
  const zhChangesFile = prefixedChanges && existsSync(prefixedChanges) ? prefixedChanges : join(root, 'changes/index.html');
  const enChangesFile = join(root, 'en', 'changes/index.html');
  const pagesToCheck = [{ file: zhChangesFile, label: 'changes/index.html', required: true }];
  if (existsSync(enChangesFile)) {
    pagesToCheck.push({ file: enChangesFile, label: 'en/changes/index.html', required: true });
  }
  for (const target of pagesToCheck) {
    const changesHtml = await readFile(target.file, 'utf8').catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (changesHtml === null) {
      if (target.required) errors.push(`${target.label}: clean-delivery requires the public /changes/ revisions & errata page`);
      continue;
    }
    const changesDoc = htmlParser.parse(changesHtml);
    const ledgerEl = changesDoc.querySelector('[data-reader-changes-ledger]');
    if (!ledgerEl) {
      errors.push(`${target.label}: missing [data-reader-changes-ledger] container`);
      continue;
    }
    if (ledgerEl.querySelector('[data-changes-iteration], [data-changes-correction], [data-changes-part-intro], [data-changes-retirement]')) {
      errors.push(`${target.label}: internal batch/iteration ledger controls must not render on the public Revisions & Errata page`);
    }
    const renderedRevisions = new Set(ledgerEl.querySelectorAll('[data-public-revision]').map(n => n.getAttribute('data-public-revision')));
    for (const item of publicLedger.revisions ?? []) {
      if (!renderedRevisions.has(item.id)) errors.push(`${target.label}: missing public revision entry ${item.id}`);
    }
    const renderedErrata = new Set(ledgerEl.querySelectorAll('[data-public-erratum]').map(n => n.getAttribute('data-public-erratum')));
    for (const item of publicLedger.errata ?? []) {
      if (!renderedErrata.has(item.id)) errors.push(`${target.label}: missing public erratum entry ${item.id}`);
    }
  }
  return errors;
}

export function validateLegacyCitationOutput(root, sourceBaseline, locations, availableRoutes = null, history = null, book = null) {
  return validateCitationOutput(root, sourceBaseline, locations, availableRoutes, history, book, validateReadableBookPublicArtifacts);
}

export function validateCopyeditPreviewOutput(root, sourceBaseline, locations, availableRoutes, history, book) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output' || !book.current?.copyedit)
    throw new Error('Expected isolated reader copyedit preview output');
  return validateCitationOutput(root, sourceBaseline, locations, availableRoutes, history, book, () => []);
}

async function validatePublicationOutput(root, { knownIds = new Set(), sourceCommit }, requireCurrent, preview = null) {
  const errors = [];
  let bookOutput = false;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name), label = relative(root, path).replaceAll('\\', '/');
      if (entry.name === '_docs') { errors.push(`${label}: development Markdown must remain outside public output`); continue; }
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const html = await readFile(path, 'utf8');
        if (label.startsWith('docs/book/') || label.startsWith('zh/docs/book/') || ((label === 'print/index.html' || label === 'zh/print/index.html') && /<article[^>]+class="print-chapter\b/.test(html))) bookOutput = true;
        const allowAIStatement = label === 'changes/index.html'
          || label === 'print/index.html'
          || label === 'zh/changes/index.html'
          || label === 'zh/print/index.html'
          || label === 'en/changes/index.html'
          || label === 'en/print/index.html';
        errors.push(...validateReaderHtml(html, { label, knownIds, allowAIStatement, locale: label.startsWith('en/') ? 'en' : 'zh' }));
      }
      else if (entry.isFile() && entry.name === 'llms.txt') errors.push(...validateReaderIndex(await readFile(path, 'utf8')));
      else if (!entry.isFile()) errors.push(`${label}: unexpected public output entry`);
    }
  }
  await visit(root);
  // A standalone exporter fixture may have no book. A partial or cached book export still needs both files.
  const config = resolve(root, '..', 'config');
  const bookSource = await access(resolve(root, '..', 'content', 'docs', 'book', 'meta.json')).then(() => true, error => {
    if (error.code !== 'ENOENT') throw error;
    return false;
  });
  const [baseline, placements, history] = await Promise.all(['citation-baseline.json', 'citation-placements.json', 'citation-history.json'].map(async file => {
    const raw = await readFile(join(config, file), 'utf8').catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    return raw === null ? null : JSON.parse(raw);
  }));
  const numberingArtifact = await readFile(join(config,'reader-numbering.json'),'utf8').then(JSON.parse,error=>{if(error.code==='ENOENT')return null;throw error;});
  if (numberingArtifact) assertReaderNumbering(numberingArtifact);
  if (baseline && placements) {
    assertCitationBaseline(baseline);
    assertPrintFrontMatter(placements.frontMatter);
    if (history) assertCitationHistory(history);
    const sourceDirectory = resolve(root, '..', 'content', 'docs');
    const sourceRoutes = [];
    async function discover(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await discover(path);
        else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
          const slug = relative(sourceDirectory, path).replaceAll('\\', '/').replace(/\.mdx?$/, '').replace(/(?:^|\/)index$/, '');
          sourceRoutes.push(`/docs${slug ? `/${slug}` : ''}`);
        }
      }
    }
    const hasReaderSource = await access(sourceDirectory).then(() => true, error => {
      if (error.code !== 'ENOENT') throw error;
      return false;
    });
    if (hasReaderSource) await discover(sourceDirectory);
    const readConfig = async file => readFile(join(config,file),'utf8').then(JSON.parse,error=>{if(error.code==='ENOENT')return null;throw error;});
    const [edition,accepted,headingHistory,cleanerAccepted,cleanerHeadingHistory,functionalAccepted,functionalHeadings,functionalProse,processAccepted,processHeadings,processProse] = await Promise.all(['book-edition.json','framework-accepted.json','framework-heading-history.json','cleaner-production-accepted.json','cleaner-production-heading-history.json','functional-reference-accepted.json','functional-reference-heading-history.json','functional-reference-prose-accepted.json','process-network-accepted.json','process-network-heading-history.json','process-network-prose-accepted.json'].map(readConfig));
    const dataAccepted = await readConfig('data-applicability-accepted.json');
    const climateAccepted = await readConfig('climate-assembly-accepted.json');
    const toxicityAccepted = await readConfig('toxicity-pathways-accepted.json');
    const pedigreeAccepted = await readConfig('readable-pedigree-accepted.json');
    const pmAccepted = await readConfig('pm-selection-accepted.json');
    const [closingHistory,closingProse] = await Promise.all(['heading-history','prose-accepted'].map(name=>readConfig(`closing-synthesis-${name}.json`)));
    const [jointOriginal,jointHeadings,jointProse] = await Promise.all(['original','heading-history','prose-accepted'].map(name=>readConfig(`joint-production-${name}.json`)));
    const [wallOriginal,wallHeadings,wallAccepted] = await Promise.all(['original','heading-history','accepted'].map(name=>readConfig(`wall-selection-${name}.json`)));
    const [hybridAccepted,hybridHeadings,hybridProse] = await Promise.all(['accepted','heading-history','prose-accepted'].map(name=>readConfig(`hybrid-inventory-${name}.json`)));
    const [exchangeOriginal,exchangeHeadings,exchangeCitations,exchangePartial,exchangeProse] = await Promise.all(["original","heading-history","citation-sources","partial-history","prose-accepted"].map(name=>readConfig(`exchange-semantics-${name}.json`)));
    let book = null;
    if (edition || accepted || headingHistory || cleanerAccepted || cleanerHeadingHistory || bookOutput || numberingArtifact) {
      if (!edition || !accepted || !headingHistory || !cleanerAccepted || !cleanerHeadingHistory || !functionalAccepted || !functionalHeadings || !functionalProse || !processAccepted || !processHeadings || !processProse || !exchangeOriginal || !exchangeHeadings || !exchangeCitations || !exchangePartial || !exchangeProse) throw new Error('Book edition requires its accepted proposition and published heading inventories');
      const missingHybrid = [['accepted',hybridAccepted],['heading-history',hybridHeadings],['prose-accepted',hybridProse]].filter(([,value])=>!value).map(([name])=>`hybrid-inventory-${name}.json`);
      if (missingHybrid.length) throw new Error(`Book edition requires its independent B09 original, captured-heading and final-prose inventories; missing: ${missingHybrid.join(', ')}`);
      assertHybridInventoryAccepted(hybridAccepted); assertHybridInventoryHeadingHistory(hybridHeadings); assertHybridInventoryProseAccepted(hybridProse);
      const missingJoint = [['original',jointOriginal],['heading-history',jointHeadings],['prose-accepted',jointProse]].filter(([,value])=>!value).map(([name])=>`joint-production-${name}.json`);
      if (missingJoint.length) throw new Error(`Book edition requires its independent B10 original, actual capture and final-prose inventories; missing: ${missingJoint.join(', ')}`);
      assertJointProductionOriginal(jointOriginal); assertJointProductionHeadingHistory(jointHeadings); assertJointProductionProseAccepted(jointProse);
      const missingWall = [['original',wallOriginal],['heading-history',wallHeadings],['accepted',wallAccepted]].filter(([,value])=>!value).map(([name])=>`wall-selection-${name}.json`);
      if (missingWall.length) throw new Error(`Book edition requires its wall original, captured headings and final selection; missing: ${missingWall.join(', ')}`);
      assertWallSelectionOriginal(wallOriginal); assertWallSelectionHeadingHistory(wallHeadings); assertWallSelectionAccepted(wallAccepted);
      assertDataApplicabilityOriginal(); assertDataApplicabilityHeadingOriginal(); assertDataApplicabilityAccepted(dataAccepted);
      assertClimateAssemblyOriginal(); assertClimateAssemblyHeadingOriginal(); assertClimateAssemblyAccepted(climateAccepted);
      errors.push(...validateClimateAssemblyArtifactBytes({figure:await readFile(join(root,'book-figures/climate-response-and-integral.svg')),input:await readFile(resolve(root,'..','knowledge/cases/climate-metrics-v1.json'))}));
      assertClosingSynthesisOriginal(); assertClosingSynthesisHeadingHistory(closingHistory); assertClosingSynthesisProseAccepted(closingProse);
      const sources = new Map();
      async function discoverRaw(directory,prefix) {
        for (const entry of await readdir(directory,{withFileTypes:true})) {
          const path=join(directory,entry.name);
          if(entry.isDirectory())await discoverRaw(path,`${prefix}/${entry.name}`);
          else if(entry.isFile()&&/\.mdx?$/.test(entry.name)) {
            const route=`${prefix}/${entry.name.replace(/\.mdx?$/,'')}`.replace(/\/index$/,'');
            sources.set(route,await readFile(path,'utf8'));
          }
        }
      }
      await discoverRaw(sourceDirectory,'/docs');
      const manuscriptDirectory=resolve(root,'..','content','monograph');
      await access(manuscriptDirectory).then(() => discoverRaw(manuscriptDirectory,'/monograph'), () => {});
      const catalog = JSON.parse(await readFile(resolve(root,'..','knowledge','catalog.json'),'utf8'));
      assertFunctionalReferenceProseAccepted(functionalProse);
      assertProcessNetworkProseAccepted(processProse);
      assertExchangeSemanticsOriginal(exchangeOriginal); assertExchangeSemanticsHeadingHistory(exchangeHeadings); assertExchangeSemanticsCitationSources(exchangeCitations); assertExchangeSemanticsPartialHistory(exchangePartial); assertExchangeSemanticsProseAccepted(exchangeProse);
      assertToxicityPathwaysAccepted(toxicityAccepted);
      assertPmSelectionAccepted(pmAccepted);
      const pmCaseBytes = Object.fromEntries(await Promise.all(pmSelectionCasePaths.map(async path => [path, await readFile(resolve(root, '..', path))])));
      errors.push(...validatePmSelectionCaseBytes(pmCaseBytes, pedigreeAccepted));
      assertReadablePedigreeAccepted(pedigreeAccepted);
      const [pedigreeInput, pedigreePublication] = await Promise.all([
        readFile(resolve(root, '..', 'knowledge/cases/pedigree-calibration-v1.json')),
        readFile(resolve(root, '..', 'knowledge/cases/pedigree-calibration-v1.publication.json')),
      ]);
      errors.push(...validateReadablePedigreeCaseBytes(pedigreeAccepted, { input: pedigreeInput, publication: pedigreePublication }));
      const [readings,literature]=await Promise.all(['readings','literature-map'].map(async name=>JSON.parse(await readFile(resolve(root,'..','knowledge','research',name+'.json'),'utf8'))));
      const sourceRoot = resolve(root, '..');
      let current, hostedHistory;
      if (requireCurrent) {
        const qualify = preview === 'whole-book-reread' ? validateWholeBookRereadReviewSources
          : preview === 'part1-reread' ? validatePart1RereadReviewSources
          : preview === 'framework-comparison' ? validateFrameworkComparisonReviewSources
          : preview === 'part2-reread' ? validatePart2RereadReviewSources
          : preview === 'hybrid-inventory-comparison' ? validateHybridInventoryComparisonReviewSources
          : preview === 'functional-reference-comparison' ? validateFunctionalReferenceComparisonReviewSources
          : preview === 'part3-reread' ? validatePart3RereadReviewSources
          : preview === 'market-response-comparison' ? validateMarketResponseComparisonReviewSources
          : preview === 'part7-reread' ? validatePart7RereadReviewSources
          : preview === 'revisable-judgment' ? validateRevisableJudgmentReviewSources
          : preview === 'future-scenarios' ? validateFutureScenariosReviewSources
          : preview === 'interpretation-bags' ? validateInterpretationBagsReviewSources
          : preview === 'wall-service-comparison' ? validateWallServiceComparisonReviewSources
          : preview === 'part6-reread' ? validatePart6RereadReviewSources
          : preview === 'data-quality-comparison' ? validateDataQualityComparisonReviewSources
          : preview === 'product-footprint-comparison' ? validateProductFootprintComparisonReviewSources
          : preview === 'uncertainty-comparison' ? validateUncertaintyComparisonReviewSources
          : preview === 'data-applicability-comparison' ? validateDataApplicabilityComparisonReviewSources
          : preview === 'part5-reread' ? validatePart5RereadReviewSources
          : preview === 'cost-sustainability' ? validateCostSustainabilityReviewSources
          : preview === 'social-comparison' ? validateSocialComparisonReviewSources
          : preview === 'localization-comparison' ? validateLocalizationComparisonReviewSources
          : preview === 'weighting-valuation' ? validateWeightingValuationReviewSources
          : preview === 'part4-reread' ? validatePart4RereadReviewSources
          : preview === 'particulate-comparison' ? validateParticulateComparisonReviewSources
          : preview === 'eutrophication-pathways' ? validateEutrophicationPathwaysReviewSources
          : preview === 'biogenic-carbon' ? validateBiogenicCarbonReviewSources
          : preview === 'water-scarcity' ? validateWaterScarcityReviewSources
          : preview === 'toxicity-comparison' ? validateToxicityComparisonReviewSources
          : preview === 'ozone-radiation' ? validateOzoneRadiationReviewSources
          : preview === 'photochemical-ozone' ? validatePhotochemicalOzoneReviewSources
          : preview === 'fossil-resources' ? validateFossilResourcesReviewSources
          : preview === 'mineral-resources' ? validateMineralResourcesReviewSources
          : preview === 'acid-equivalents' ? validateAcidEquivalentsReviewSources
          : preview === 'land-recovery' ? validateLandRecoveryReviewSources
          : preview === 'circular-footprint' ? validateCircularFootprintReviewSources
          : preview === 'load-shift' ? validateLoadShiftReviewSources
          : preview === 'substitution' ? validateSubstitutionRulesReviewSources
          : preview === 'service' ? validateServiceConstraintsReviewSources : validateReadableBookCurrent;
        current = await qualify(sourceRoot, catalog, readings, literature);
        hostedHistory = await readConfig('readable-book-hosted-history.json');
        if (!hostedHistory) throw new Error('Current reader publication requires its verified hosted history');
        errors.push(...current.errors);
      }
      book={current,hostedHistory,sourceCommit,sourceRoot,pmAccepted,toxicityAccepted,pedigreeAccepted,readings,literature,dataAccepted,climateAccepted,closingHistory,closingProse,wallOriginal,wallHeadings,wallAccepted,jointOriginal,jointHeadings,jointProse,hybridAccepted,hybridHeadings,hybridProse,edition,accepted,headingHistory,cleanerAccepted,cleanerHeadingHistory,functionalAccepted,functionalHeadings,functionalProse,processAccepted,processHeadings,processProse,exchangeOriginal,exchangeHeadings,exchangeCitations,exchangePartial,exchangeProse,sources,catalog};
      sourceRoutes.splice(0,sourceRoutes.length,...sources.keys());
    }
    errors.push(...await validateLegacyCitationOutput(root, baseline, placements, hasReaderSource ? sourceRoutes : null, history,book));
    if (!history) errors.push('The book export requires the historical canonical citation inventory');
  } else if (baseline || placements || history || bookSource || bookOutput || numberingArtifact) errors.push('The book export requires both the reader citation baseline and placement files');
  if (requireCurrent && (!bookOutput || !baseline || !placements || !history || !numberingArtifact)) errors.push('Current reader publication requires its actual numbered book output');
  return [...new Set(errors)];
}

export const validateReaderOutput = (root, options = {}) => validatePublicationOutput(root, options, true);
export const validateReaderOutputFixture = (root, options = {}) => validatePublicationOutput(root, options, false);

/** Inspect a private compiled manuscript. The exporter has no preview mode. */
export function validateServiceConstraintsPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated service constraints preview directory');
  return validatePublicationOutput(root, options, true, 'service');
}

export function validateSubstitutionRulesPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated substitution rules preview directory');
  return validatePublicationOutput(root, options, true, 'substitution');
}

export function validateLoadShiftPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated load shift preview directory');
  return validatePublicationOutput(root, options, true, 'load-shift');
}

export function validateCircularFootprintPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated circular footprint preview directory');
  return validatePublicationOutput(root, options, true, 'circular-footprint');
}

export function validateLandRecoveryPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated land recovery preview directory');
  return validatePublicationOutput(root, options, true, 'land-recovery');
}

export function validateAcidEquivalentsPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated acid equivalents preview directory');
  return validatePublicationOutput(root, options, true, 'acid-equivalents');
}

export function validateMineralResourcesPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated mineral resources preview directory');
  return validatePublicationOutput(root, options, true, 'mineral-resources');
}

export function validateFossilResourcesPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated fossil resources preview directory');
  return validatePublicationOutput(root, options, true, 'fossil-resources');
}

export function validatePhotochemicalOzonePreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated photochemical ozone preview directory');
  return validatePublicationOutput(root, options, true, 'photochemical-ozone');
}

export function validateOzoneRadiationPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated ozone and radiation preview directory');
  return validatePublicationOutput(root, options, true, 'ozone-radiation');
}

export function validateToxicityComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated toxicity comparison preview directory');
  return validatePublicationOutput(root, options, true, 'toxicity-comparison');
}

export function validateWaterScarcityPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated water scarcity preview directory');
  return validatePublicationOutput(root, options, true, 'water-scarcity');
}

export function validateBiogenicCarbonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated biogenic carbon preview directory');
  return validatePublicationOutput(root, options, true, 'biogenic-carbon');
}

export function validateEutrophicationPathwaysPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated eutrophication pathways preview directory');
  return validatePublicationOutput(root, options, true, 'eutrophication-pathways');
}

export function validateParticulateComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated particulate comparison preview directory');
  return validatePublicationOutput(root, options, true, 'particulate-comparison');
}

export function validatePart4RereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Part IV continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'part4-reread');
}

export function validateWeightingValuationPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated weighting and valuation preview directory');
  return validatePublicationOutput(root, options, true, 'weighting-valuation');
}

export function validateLocalizationComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated localization comparison preview directory');
  return validatePublicationOutput(root, options, true, 'localization-comparison');
}

export function validateSocialComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated social comparison preview directory');
  return validatePublicationOutput(root, options, true, 'social-comparison');
}

export function validateCostSustainabilityPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated cost and sustainability preview directory');
  return validatePublicationOutput(root, options, true, 'cost-sustainability');
}

export function validatePart5RereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Part V continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'part5-reread');
}

export function validateDataApplicabilityComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Data applicability comparison preview directory');
  return validatePublicationOutput(root, options, true, 'data-applicability-comparison');
}

export function validateUncertaintyComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Uncertainty comparison preview directory');
  return validatePublicationOutput(root, options, true, 'uncertainty-comparison');
}

export function validateProductFootprintComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Product footprint comparison preview directory');
  return validatePublicationOutput(root, options, true, 'product-footprint-comparison');
}

export function validateDataQualityComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Data quality comparison preview directory');
  return validatePublicationOutput(root, options, true, 'data-quality-comparison');
}

export function validatePart6RereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Part VI continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'part6-reread');
}

export function validateWallServiceComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Wall service comparison preview directory');
  return validatePublicationOutput(root, options, true, 'wall-service-comparison');
}

export function validateInterpretationBagsPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Interpretation & shopping-bag comparison preview directory');
  return validatePublicationOutput(root, options, true, 'interpretation-bags');
}

export function validateFutureScenariosPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Future technology & scenarios comparison preview directory');
  return validatePublicationOutput(root, options, true, 'future-scenarios');
}

export function validateRevisableJudgmentPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Revisable judgment synthesis preview directory');
  return validatePublicationOutput(root, options, true, 'revisable-judgment');
}

export function validatePart7RereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Part VII continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'part7-reread');
}

export function validateMarketResponseComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated market response comparison preview directory');
  return validatePublicationOutput(root, options, true, 'market-response-comparison');
}

export function validatePart3RereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Part III continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'part3-reread');
}

export function validateFunctionalReferenceComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Functional reference comparison preview directory');
  return validatePublicationOutput(root, options, true, 'functional-reference-comparison');
}

export function validateHybridInventoryComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Hybrid inventory comparison preview directory');
  return validatePublicationOutput(root, options, true, 'hybrid-inventory-comparison');
}

export function validatePart2RereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Part II continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'part2-reread');
}

export function validateFrameworkComparisonPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Framework comparison preview directory');
  return validatePublicationOutput(root, options, true, 'framework-comparison');
}

export function validatePart1RereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Part I continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'part1-reread');
}

export function validateWholeBookRereadPreviewOutput(root, options = {}) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output')
    throw new Error('Expected an isolated Whole-book continuous reread preview directory');
  return validatePublicationOutput(root, options, true, 'whole-book-reread');
}
