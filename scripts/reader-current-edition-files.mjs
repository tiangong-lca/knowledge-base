import { selectMarketResponseComparison, prepareMarketResponseComparisonSource, effectiveMarketResponseComparison, verifyMarketResponseComparisonReceipts } from './reader-market-response-comparison.mjs';
import { selectPart3Reread, preparePart3RereadSource, effectivePart3Reread, verifyPart3RereadReceipts } from './reader-part3-reread.mjs';
import { selectPart7Reread, preparePart7RereadSource, effectivePart7Reread, verifyPart7RereadReceipts } from './reader-part7-reread.mjs';
import { selectRevisableJudgment, prepareRevisableJudgmentSource, effectiveRevisableJudgment, verifyRevisableJudgmentReceipts } from './reader-revisable-judgment.mjs';
import { selectFutureScenarios, prepareFutureScenariosSource, effectiveFutureScenarios, verifyFutureScenariosReceipts } from './reader-future-scenarios.mjs';
import { selectInterpretationBags, prepareInterpretationBagsSource, effectiveInterpretationBags, verifyInterpretationBagsReceipts } from './reader-interpretation-bags.mjs';
import { selectWallServiceComparison, prepareWallServiceComparisonSource, effectiveWallServiceComparison, verifyWallServiceComparisonReceipts } from './reader-wall-service-comparison.mjs';
import { selectPart6Reread, preparePart6RereadSource, effectivePart6Reread, verifyPart6RereadReceipts } from './reader-part6-reread.mjs';
import { selectDataQualityComparison, prepareDataQualityComparisonSource, effectiveDataQualityComparison, verifyDataQualityComparisonReceipts } from './reader-data-quality-comparison.mjs';
import { selectProductFootprintComparison, prepareProductFootprintComparisonSource, effectiveProductFootprintComparison, verifyProductFootprintComparisonReceipts } from './reader-product-footprint-comparison.mjs';
import { selectUncertaintyComparison, prepareUncertaintyComparisonSource, effectiveUncertaintyComparison, verifyUncertaintyComparisonReceipts } from './reader-uncertainty-comparison.mjs';
import { selectDataApplicabilityComparison, prepareDataApplicabilityComparisonSource, effectiveDataApplicabilityComparison, verifyDataApplicabilityComparisonReceipts } from './reader-data-applicability-comparison.mjs';
import { selectPart5Reread, preparePart5RereadSource, effectivePart5Reread, verifyPart5RereadReceipts } from './reader-part5-reread.mjs';
import { selectCostSustainability, prepareCostSustainabilitySource, effectiveCostSustainability, verifyCostSustainabilityReceipts } from './reader-cost-sustainability.mjs';
import { selectSocialComparison, prepareSocialComparisonSource, effectiveSocialComparison, verifySocialComparisonReceipts } from './reader-social-comparison.mjs';
import { selectLocalizationComparison, prepareLocalizationComparisonSource, effectiveLocalizationComparison, verifyLocalizationComparisonReceipts } from './reader-localization-comparison.mjs';
import { selectWeightingValuation, prepareWeightingValuationSource, effectiveWeightingValuation, verifyWeightingValuationReceipts } from './reader-weighting-valuation.mjs';
import { selectPart4Reread, preparePart4RereadSource, effectivePart4Reread, verifyPart4RereadReceipts } from './reader-part4-reread.mjs';
import { selectParticulateComparison, prepareParticulateComparisonSource, effectiveParticulateComparison, verifyParticulateComparisonReceipts } from './reader-particulate-comparison.mjs';
import { selectEutrophicationPathways, prepareEutrophicationPathwaysSource, effectiveEutrophicationPathways, verifyEutrophicationPathwaysReceipts } from './reader-eutrophication-pathways.mjs';
import { selectBiogenicCarbon, prepareBiogenicCarbonSource, effectiveBiogenicCarbon, verifyBiogenicCarbonReceipts } from './reader-biogenic-carbon.mjs';
import { selectWaterScarcity, prepareWaterScarcitySource, effectiveWaterScarcity, verifyWaterScarcityReceipts } from './reader-water-scarcity.mjs';
import { selectToxicityComparison, prepareToxicityComparisonSource, effectiveToxicityComparison, verifyToxicityComparisonReceipts } from './reader-toxicity-comparison.mjs';
import { selectOzoneRadiation, prepareOzoneRadiationSource, effectiveOzoneRadiation, verifyOzoneRadiationReceipts } from './reader-ozone-radiation.mjs';
import { selectPhotochemicalOzone, preparePhotochemicalOzoneSource, effectivePhotochemicalOzone, verifyPhotochemicalOzoneReceipts } from './reader-photochemical-ozone.mjs';
import { selectFossilResources, prepareFossilResourcesSource, effectiveFossilResources, verifyFossilResourcesReceipts } from './reader-fossil-resources.mjs';
import { selectMineralResources, prepareMineralResourcesSource, effectiveMineralResources, verifyMineralResourcesReceipts } from './reader-mineral-resources.mjs';
import { selectAcidEquivalents, prepareAcidEquivalentsSource, effectiveAcidEquivalents, verifyAcidEquivalentsReceipts } from './reader-acid-equivalents.mjs';
import { selectLandRecovery, prepareLandRecoverySource, effectiveLandRecovery, verifyLandRecoveryReceipts } from './reader-land-recovery.mjs';
import { selectCircularFootprint, prepareCircularFootprintSource, effectiveCircularFootprint, verifyCircularFootprintReceipts } from './reader-circular-footprint.mjs';
import { selectLoadShift, readLoadShiftCaseFiles, prepareLoadShiftSource, effectiveLoadShift, verifyLoadShiftReceipts } from './reader-load-shift.mjs';
import { selectSubstitutionRules, prepareSubstitutionRulesSource, effectiveSubstitutionRules, verifySubstitutionRulesReceipts } from './reader-substitution-rules.mjs';
import { loadCasePublications } from './case-publication.mjs';
import { selectServiceConstraints, readServiceConstraintsFiles, prepareServiceConstraintsSource, effectiveServiceConstraints, verifyServiceConstraintsReceipts } from './reader-service-constraints.mjs';
import { selectFlowBoundary, prepareFlowBoundarySource, effectiveFlowBoundary, verifyFlowBoundaryReceipts } from './reader-flow-boundary.mjs';
import { flowBoundaryUnitPin, flowBoundaryPredecessorPin } from './reader-flow-boundary-pins.mjs';
import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { editionDigest, inspectReadableBookEdition, qualifyReadableBookEdition, readableBookReviewPlan, pinnedReadableBookUnits, validReadableBookReviewFile, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';

import { copyeditSourceStructure, effectiveReaderCopyedit, qualifyReaderCopyedit, readerCopyeditSupportReferences, selectReaderCopyedit } from './reader-copyedit.mjs';
import { readerCopyeditUnitPin, readerCopyeditCaptureDigest } from './reader-copyedit-pins.mjs';
import { readableBookBaselineDigest, readableBookAcceptancePins } from './reader-current-edition-pins.mjs';

export function isReadableBookMutableFile(path) {
  return /^content\/.+\.(mdx?|json)$/.test(path)
    || /^knowledge\/cases\/[^/]+\.publication\.json$/.test(path)
    || ['config/book-edition.json', 'config/reader-numbering.json', 'components/teaching-case-client.tsx', 'components/joint-production-case.tsx', 'app/global.css'].includes(path);
}

export async function readReadableBookFiles(root, fixedFiles) {
  const result = new Map(await Promise.all(fixedFiles.map(async path => [path, await readFile(join(root, path))])));
  async function discover(directory) {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await discover(path);
      else if (entry.isFile() && isReadableBookMutableFile(path)) result.set(path, await readFile(join(root, path)));
    }
  }
  await Promise.all([discover('content'), discover('knowledge/cases')]);
  for (const path of ['config/book-edition.json', 'config/reader-numbering.json', 'components/teaching-case-client.tsx', 'components/joint-production-case.tsx', 'app/global.css']) result.set(path, await readFile(join(root, path)));
  return result;
}

async function qualifyCurrentReaderSources(root, catalog, readings, literature, preview = null) {
  const readConfig = async name => JSON.parse(await readFile(join(root, 'config', name), 'utf8'));
  const baseline = await readConfig('readable-book-baseline.json');
  const acceptance = await readConfig('readable-book-current.json');
  if (editionDigest(baseline) !== readableBookBaselineDigest) throw new Error('Readable book integration baseline differs');
  const files = await readReadableBookFiles(root, baseline.fixedFiles);
  const serviceConfig = await readConfig('reader-service-constraints.json');
  const serviceConstraints = selectServiceConstraints(serviceConfig, undefined, preview === 'service');
  const substitutionConfig = await readConfig('reader-substitution-rules.json');
  const substitutionRules = selectSubstitutionRules(substitutionConfig, undefined, preview === 'substitution');
  const part7Config = await readConfig('reader-part7-reread.json');
  const part7Reread = selectPart7Reread(part7Config, undefined, preview === 'part7-reread');
  const mktConfig = await readConfig('reader-market-response-comparison.json');
  const marketResponseComparison = selectMarketResponseComparison(mktConfig, undefined, preview === 'market-response-comparison');
  if (preview === 'market-response-comparison' && mktConfig.status !== 'preview') throw new Error('Market response comparison review requires a private preview state');
  const part3Config = await readConfig('reader-part3-reread.json');
  const part3Reread = selectPart3Reread(part3Config, undefined, preview === 'part3-reread');
  if (preview === 'part3-reread' && part3Config.status !== 'preview') throw new Error('Part III continuous reread review requires a private preview state');
  const revConfig = await readConfig('reader-revisable-judgment.json');
  const revisableJudgment = selectRevisableJudgment(revConfig, undefined, preview === 'revisable-judgment');
  if (preview === 'part7-reread' && part7Config.status !== 'preview') throw new Error('Part VII continuous reread review requires a private preview state');
  if (preview === 'revisable-judgment' && revConfig.status !== 'preview') throw new Error('Revisable judgment synthesis review requires a private preview state');
  const futConfig = await readConfig('reader-future-scenarios.json');
  const futureScenarios = selectFutureScenarios(futConfig, undefined, preview === 'future-scenarios');
  if (preview === 'future-scenarios' && futConfig.status !== 'preview') throw new Error('Future technology & scenarios comparison review requires a private preview state');
  const intConfig = await readConfig('reader-interpretation-bags.json');
  const interpretationBags = selectInterpretationBags(intConfig, undefined, preview === 'interpretation-bags');
  if (preview === 'interpretation-bags' && intConfig.status !== 'preview') throw new Error('Interpretation & shopping-bag comparison review requires a private preview state');
  const wscConfig = await readConfig('reader-wall-service-comparison.json');
  const wallServiceComparison = selectWallServiceComparison(wscConfig, undefined, preview === 'wall-service-comparison');
  if (preview === 'wall-service-comparison' && wscConfig.status !== 'preview') throw new Error('Wall service comparison review requires a private preview state');
  const part6Config = await readConfig('reader-part6-reread.json');
  const part6Reread = selectPart6Reread(part6Config, undefined, preview === 'part6-reread');
  if (preview === 'part6-reread' && part6Config.status !== 'preview') throw new Error('Part VI continuous reread review requires a private preview state');
  const dqpConfig = await readConfig('reader-data-quality-comparison.json');
  const dataQualityComparison = selectDataQualityComparison(dqpConfig, undefined, preview === 'data-quality-comparison');
  if (preview === 'data-quality-comparison' && dqpConfig.status !== 'preview') throw new Error('Data quality comparison review requires a private preview state');
  const pfrConfig = await readConfig('reader-product-footprint-comparison.json');
  const productFootprintComparison = selectProductFootprintComparison(pfrConfig, undefined, preview === 'product-footprint-comparison');
  if (preview === 'product-footprint-comparison' && pfrConfig.status !== 'preview') throw new Error('Product footprint comparison review requires a private preview state');
  const uncConfig = await readConfig('reader-uncertainty-comparison.json');
  const uncertaintyComparison = selectUncertaintyComparison(uncConfig, undefined, preview === 'uncertainty-comparison');
  if (preview === 'uncertainty-comparison' && uncConfig.status !== 'preview') throw new Error('Uncertainty comparison review requires a private preview state');
  const dappConfig = await readConfig('reader-data-applicability-comparison.json');
  const dataApplicabilityComparison = selectDataApplicabilityComparison(dappConfig, undefined, preview === 'data-applicability-comparison');
  if (preview === 'data-applicability-comparison' && dappConfig.status !== 'preview') throw new Error('Data applicability comparison review requires a private preview state');
  const part5Config = await readConfig('reader-part5-reread.json');
  const part5Reread = selectPart5Reread(part5Config, undefined, preview === 'part5-reread');
  if (preview === 'part5-reread' && part5Config.status !== 'preview') throw new Error('Part V continuous reread review requires a private preview state');
  const costConfig = await readConfig('reader-cost-sustainability.json');
  const costSustainability = selectCostSustainability(costConfig, undefined, preview === 'cost-sustainability');
  if (preview === 'cost-sustainability' && costConfig.status !== 'preview') throw new Error('Cost and sustainability review requires a private preview state');
  const socialConfig = await readConfig('reader-social-comparison.json');
  const socialComparison = selectSocialComparison(socialConfig, undefined, preview === 'social-comparison');
  if (preview === 'social-comparison' && socialConfig.status !== 'preview') throw new Error('Social comparison review requires a private preview state');
  const localizationConfig = await readConfig('reader-localization-comparison.json');
  const localizationComparison = selectLocalizationComparison(localizationConfig, undefined, preview === 'localization-comparison');
  if (preview === 'localization-comparison' && localizationConfig.status !== 'preview') throw new Error('Localization comparison review requires a private preview state');
  const weightingConfig = await readConfig('reader-weighting-valuation.json');
  const weightingValuation = selectWeightingValuation(weightingConfig, undefined, preview === 'weighting-valuation');
  if (preview === 'weighting-valuation' && weightingConfig.status !== 'preview') throw new Error('Weighting and valuation review requires a private preview state');
  const part4Config = await readConfig('reader-part4-reread.json');
  const part4Reread = selectPart4Reread(part4Config, undefined, preview === 'part4-reread');
  if (preview === 'part4-reread' && part4Config.status !== 'preview') throw new Error('Part IV continuous reread review requires a private preview state');
  const particulateConfig = await readConfig('reader-particulate-comparison.json');
  const particulateComparison = selectParticulateComparison(particulateConfig, undefined, preview === 'particulate-comparison');
  if (preview === 'particulate-comparison' && particulateConfig.status !== 'preview') throw new Error('Particulate comparison review requires a private preview state');
  const eutroConfig = await readConfig('reader-eutrophication-pathways.json');
  const eutrophicationPathways = selectEutrophicationPathways(eutroConfig, undefined, preview === 'eutrophication-pathways');
  if (preview === 'eutrophication-pathways' && eutroConfig.status !== 'preview') throw new Error('Eutrophication pathways review requires a private preview state');
  const bioConfig = await readConfig('reader-biogenic-carbon.json');
  const biogenicCarbon = selectBiogenicCarbon(bioConfig, undefined, preview === 'biogenic-carbon');
  if (preview === 'biogenic-carbon' && bioConfig.status !== 'preview') throw new Error('Biogenic carbon review requires a private preview state');
  const waterConfig = await readConfig('reader-water-scarcity.json');
  const waterScarcity = selectWaterScarcity(waterConfig, undefined, preview === 'water-scarcity');
  if (preview === 'water-scarcity' && waterConfig.status !== 'preview') throw new Error('Water scarcity review requires a private preview state');
  const toxConfig = await readConfig('reader-toxicity-comparison.json');
  const toxicityComparison = selectToxicityComparison(toxConfig, undefined, preview === 'toxicity-comparison');
  if (preview === 'toxicity-comparison' && toxConfig.status !== 'preview') throw new Error('Toxicity comparison review requires a private preview state');
  const ozradConfig = await readConfig('reader-ozone-radiation.json');
  const ozoneRadiation = selectOzoneRadiation(ozradConfig, undefined, preview === 'ozone-radiation');
  if (preview === 'ozone-radiation' && ozradConfig.status !== 'preview') throw new Error('Ozone and radiation review requires a private preview state');
  const ozoneConfig = await readConfig('reader-photochemical-ozone.json');
  const photochemicalOzone = selectPhotochemicalOzone(ozoneConfig, undefined, preview === 'photochemical-ozone');
  if (preview === 'photochemical-ozone' && ozoneConfig.status !== 'preview') throw new Error('Photochemical ozone review requires a private preview state');
  const fossilConfig = await readConfig('reader-fossil-resources.json');
  const fossilResources = selectFossilResources(fossilConfig, undefined, preview === 'fossil-resources');
  if (preview === 'fossil-resources' && fossilConfig.status !== 'preview') throw new Error('Fossil resources review requires a private preview state');
  const mineralConfig = await readConfig('reader-mineral-resources.json');
  const mineralResources = selectMineralResources(mineralConfig, undefined, preview === 'mineral-resources');
  if (preview === 'mineral-resources' && mineralConfig.status !== 'preview') throw new Error('Mineral resources review requires a private preview state');
  const acidConfig = await readConfig('reader-acid-equivalents.json');
  const acidEquivalents = selectAcidEquivalents(acidConfig, undefined, preview === 'acid-equivalents');
  if (preview === 'acid-equivalents' && acidConfig.status !== 'preview') throw new Error('Acid equivalents review requires a private preview state');
  const landConfig = await readConfig('reader-land-recovery.json');
  const landRecovery = selectLandRecovery(landConfig, undefined, preview === 'land-recovery');
  if (preview === 'land-recovery' && landConfig.status !== 'preview') throw new Error('Land recovery review requires a private preview state');
  const circularConfig = await readConfig('reader-circular-footprint.json');
  const circularFootprint = selectCircularFootprint(circularConfig, undefined, preview === 'circular-footprint');
  if (preview === 'circular-footprint' && circularConfig.status !== 'preview') throw new Error('Circular footprint review requires a private preview state');
  const loadShiftConfig = await readConfig('reader-load-shift.json');
  const loadShift = selectLoadShift(loadShiftConfig, undefined, preview === 'load-shift');
  if (preview === 'load-shift' && loadShiftConfig.status !== 'preview') throw new Error('Load shift review requires a private preview state');
  if (preview === 'substitution' && substitutionConfig.status !== 'preview')
    throw new Error('Substitution rules review requires a private preview state');
  if (preview === 'service' && serviceConfig.status !== 'preview') throw new Error('Service constraints review requires a private preview state');
  const config = await readConfig('reader-copyedit-current.json');
  const unit = selectReaderCopyedit(config, readerCopyeditUnitPin);
  const flowBoundary = selectFlowBoundary(await readConfig('reader-flow-boundary.json'), flowBoundaryUnitPin);
  if (flowBoundary && !unit) throw new Error('Flow boundary requires the accepted #95 language generation');
  if (serviceConstraints && !flowBoundary) throw new Error('Service constraints requires the accepted #99 generation');
  if (substitutionRules && !serviceConstraints) throw new Error('Substitution rules requires the accepted #102 generation');
  if (loadShift && !substitutionRules) throw new Error('Load shift requires the accepted #105 generation');
  if (circularFootprint && !loadShift) throw new Error('Circular footprint requires the accepted #107 generation');
  if (landRecovery && !circularFootprint) throw new Error('Land recovery requires the accepted #109 generation');
  if (part3Reread && !marketResponseComparison) throw new Error('Part III continuous reread requires the accepted #169 generation');
  if (marketResponseComparison && !part7Reread) throw new Error('Market response comparison requires the accepted #165 generation');
  if (part7Reread && !revisableJudgment) throw new Error('Part VII continuous reread requires the accepted #163 generation');
  if (revisableJudgment && !futureScenarios) throw new Error('Revisable judgment synthesis requires the accepted #161 generation');
  if (futureScenarios && !interpretationBags) throw new Error('Future technology & scenarios comparison requires the accepted #159 generation');
  if (interpretationBags && !wallServiceComparison) throw new Error('Interpretation & shopping-bag comparison requires the accepted #157 generation');
  if (wallServiceComparison && !part6Reread) throw new Error('Wall service comparison requires the accepted #155 generation');
  if (part6Reread && !dataQualityComparison) throw new Error('Part VI continuous reread requires the accepted #153 generation');
  if (dataQualityComparison && !productFootprintComparison) throw new Error('Data quality comparison requires the accepted #151 generation');
  if (productFootprintComparison && !uncertaintyComparison) throw new Error('Product footprint comparison requires the accepted #149 generation');
  if (uncertaintyComparison && !dataApplicabilityComparison) throw new Error('Uncertainty comparison requires the accepted #147 generation');
  if (dataApplicabilityComparison && !part5Reread) throw new Error('Data applicability comparison requires the accepted #145 generation');
  if (part5Reread && !costSustainability) throw new Error('Part V continuous reread requires the accepted #143 generation');
  if (costSustainability && !socialComparison) throw new Error('Cost and sustainability requires the accepted #139 generation');
  if (socialComparison && !localizationComparison) throw new Error('Social comparison requires the accepted #137 generation');
  if (localizationComparison && !weightingValuation) throw new Error('Localization comparison requires the accepted #135 generation');
  if (weightingValuation && !part4Reread) throw new Error('Weighting and valuation requires the accepted #133 generation');
  if (part4Reread && !particulateComparison) throw new Error('Part IV continuous reread requires the accepted #131 generation');
  if (particulateComparison && !eutrophicationPathways) throw new Error('Particulate comparison requires the accepted #129 generation');
  if (eutrophicationPathways && !biogenicCarbon) throw new Error('Eutrophication pathways requires the accepted #127 generation');
  if (biogenicCarbon && !waterScarcity) throw new Error('Biogenic carbon requires the accepted #125 generation');
  if (waterScarcity && !toxicityComparison) throw new Error('Water scarcity requires the accepted #123 generation');
  if (toxicityComparison && !ozoneRadiation) throw new Error('Toxicity comparison requires the accepted #121 generation');
  if (ozoneRadiation && !photochemicalOzone) throw new Error('Ozone and radiation requires the accepted #119 generation');
  if (photochemicalOzone && !fossilResources) throw new Error('Photochemical ozone requires the accepted #117 generation');
  if (fossilResources && !mineralResources) throw new Error('Fossil resources requires the accepted #115 generation');
  if (mineralResources && !acidEquivalents) throw new Error('Mineral resources requires the accepted #113 generation');
  if (acidEquivalents && !landRecovery) throw new Error('Acid equivalents requires the accepted #111 generation');
  for (const [path, bytes] of await readLoadShiftCaseFiles(root, loadShift)) files.set(path, bytes);
  for (const [path, bytes] of await readServiceConstraintsFiles(root, serviceConstraints)) files.set(path, bytes);
  const reviewUnits = [...acceptance.units, ...[unit, flowBoundary, serviceConstraints, substitutionRules, loadShift, circularFootprint, landRecovery, acidEquivalents, mineralResources, fossilResources, photochemicalOzone, ozoneRadiation, toxicityComparison, waterScarcity, biogenicCarbon, eutrophicationPathways, particulateComparison, part4Reread, weightingValuation, localizationComparison, socialComparison, costSustainability, part5Reread, dataApplicabilityComparison, uncertaintyComparison, productFootprintComparison, dataQualityComparison, part6Reread, wallServiceComparison, interpretationBags, futureScenarios, revisableJudgment, part7Reread, marketResponseComparison, part3Reread].filter(Boolean)];
  const realRoot = await realpath(root);
  const reviewFiles = new Set((reviewUnits ?? []).flatMap(unit =>
    (unit.reviewEvidence ?? []).flatMap(row => [row.reportFile, row.artifactFile])));
  const artifacts = new Map();
  for (const name of reviewFiles) {
    if (!validReadableBookReviewFile(name)) throw new Error(`Invalid readable book review evidence path: ${name}`);
    const path = resolve(realRoot, name);
    if (!(await lstat(path)).isFile() || await realpath(path) !== path) throw new Error(`Readable book review evidence must be a regular file: ${name}`);
    artifacts.set(name, await readFile(path));
  }

  const input = { catalog, readings, literature, files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const part3 = part3Reread && preparePart3RereadSource(part3Reread, input, actual, structure);
  const part3Input = part3 ? { ...part3.previousRecords, files: part3.files } : input;
  const mkt = marketResponseComparison && prepareMarketResponseComparisonSource(marketResponseComparison, part3Input, part3?.previous ?? actual, part3?.structure ?? structure);
  const mktInput = mkt ? { ...mkt.previousRecords, files: mkt.files } : part3Input;
  const part7 = part7Reread && preparePart7RereadSource(part7Reread, mktInput, mkt?.previous ?? actual, mkt?.structure ?? structure);
  const part7Input = part7 ? { ...part7.previousRecords, files: part7.files } : mktInput;
  const rev = revisableJudgment && prepareRevisableJudgmentSource(revisableJudgment, part7Input, part7?.previous ?? actual, part7?.structure ?? structure);
  const revInput = rev ? { ...rev.previousRecords, files: rev.files } : part7Input;
  const fut = futureScenarios && prepareFutureScenariosSource(futureScenarios, revInput,
    rev?.previous ?? actual, rev?.structure ?? structure);
  const futInput = fut ? { ...fut.previousRecords, files: fut.files } : revInput;
  const intBags = interpretationBags && prepareInterpretationBagsSource(interpretationBags, futInput,
    fut?.previous ?? actual, fut?.structure ?? structure);
  const intInput = intBags ? { ...intBags.previousRecords, files: intBags.files } : futInput;
  const wsc = wallServiceComparison && prepareWallServiceComparisonSource(wallServiceComparison, intInput,
    intBags?.previous ?? actual, intBags?.structure ?? structure);
  const wscInput = wsc ? { ...wsc.previousRecords, files: wsc.files } : intInput;
  const part6 = part6Reread && preparePart6RereadSource(part6Reread, wscInput,
    wsc?.previous ?? actual, wsc?.structure ?? structure);
  const part6Input = part6 ? { ...part6.previousRecords, files: part6.files } : wscInput;
  const dqp = dataQualityComparison && prepareDataQualityComparisonSource(dataQualityComparison, part6Input,
    part6?.previous ?? actual, part6?.structure ?? structure);
  const dqpInput = dqp ? { ...dqp.previousRecords, files: dqp.files } : part6Input;
  const pfr = productFootprintComparison && prepareProductFootprintComparisonSource(productFootprintComparison, dqpInput,
    dqp?.previous ?? actual, dqp?.structure ?? structure);
  const pfrInput = pfr ? { ...pfr.previousRecords, files: pfr.files } : dqpInput;
  const unc = uncertaintyComparison && prepareUncertaintyComparisonSource(uncertaintyComparison, pfrInput,
    pfr?.previous ?? actual, pfr?.structure ?? structure);
  const uncInput = unc ? { ...unc.previousRecords, files: unc.files } : pfrInput;
  const dapp = dataApplicabilityComparison && prepareDataApplicabilityComparisonSource(dataApplicabilityComparison, uncInput,
    unc?.previous ?? actual, unc?.structure ?? structure);
  const dappInput = dapp ? { ...dapp.previousRecords, files: dapp.files } : uncInput;
  const part5 = part5Reread && preparePart5RereadSource(part5Reread, dappInput,
    dapp?.previous ?? actual, dapp?.structure ?? structure);
  const part5Input = part5 ? { ...part5.previousRecords, files: part5.files } : dappInput;
  const cost = costSustainability && prepareCostSustainabilitySource(costSustainability, part5Input,
    part5?.previous ?? actual, part5?.structure ?? structure);
  const costInput = cost ? { ...cost.previousRecords, files: cost.files } : part5Input;
  const social = socialComparison && prepareSocialComparisonSource(socialComparison, costInput,
    cost?.previous ?? actual, cost?.structure ?? structure);
  const socialInput = social ? { ...social.previousRecords, files: social.files } : costInput;
  const localization = localizationComparison && prepareLocalizationComparisonSource(localizationComparison, socialInput,
    social?.previous ?? actual, social?.structure ?? structure);
  const localizationInput = localization ? { ...localization.previousRecords, files: localization.files } : socialInput;
  const weighting = weightingValuation && prepareWeightingValuationSource(weightingValuation, localizationInput,
    localization?.previous ?? actual, localization?.structure ?? structure);
  const weightingInput = weighting ? { ...weighting.previousRecords, files: weighting.files } : input;
  const part4 = part4Reread && preparePart4RereadSource(part4Reread, weightingInput,
    weighting?.previous ?? actual, weighting?.structure ?? structure);
  const part4Input = part4 ? { ...part4.previousRecords, files: part4.files } : weightingInput;
  const particulate = particulateComparison && prepareParticulateComparisonSource(particulateComparison, part4Input,
    part4?.previous ?? actual, part4?.structure ?? structure);
  const particulateInput = particulate ? { ...particulate.previousRecords, files: particulate.files } : part4Input;
  const eutro = eutrophicationPathways && prepareEutrophicationPathwaysSource(eutrophicationPathways, particulateInput,
    particulate?.previous ?? actual, particulate?.structure ?? structure);
  const eutroInput = eutro ? { ...eutro.previousRecords, files: eutro.files } : particulateInput;
  const bio = biogenicCarbon && prepareBiogenicCarbonSource(biogenicCarbon, eutroInput,
    eutro?.previous ?? actual, eutro?.structure ?? structure);
  const bioInput = bio ? { ...bio.previousRecords, files: bio.files } : eutroInput;
  const water = waterScarcity && prepareWaterScarcitySource(waterScarcity, bioInput,
    bio?.previous ?? actual, bio?.structure ?? structure);
  const waterInput = water ? { ...water.previousRecords, files: water.files } : bioInput;
  const tox = toxicityComparison && prepareToxicityComparisonSource(toxicityComparison, waterInput,
    water?.previous ?? actual, water?.structure ?? structure);
  const ozradInput = tox ? { ...tox.previousRecords, files: tox.files } : waterInput;
  const ozrad = ozoneRadiation && prepareOzoneRadiationSource(ozoneRadiation, ozradInput,
    tox?.previous ?? actual, tox?.structure ?? structure);
  const ozoneInput = ozrad ? { ...ozrad.previousRecords, files: ozrad.files } : ozradInput;
  const ozone = photochemicalOzone && preparePhotochemicalOzoneSource(photochemicalOzone, ozoneInput,
    ozrad?.previous ?? actual, ozrad?.structure ?? structure);
  const fossilInput = ozone ? { ...ozone.previousRecords, files: ozone.files } : ozoneInput;
  const fossils = fossilResources && prepareFossilResourcesSource(fossilResources, fossilInput,
    ozone?.previous ?? actual, ozone?.structure ?? structure);
  const mineralInput = fossils ? { ...fossils.previousRecords, files: fossils.files } : input;
  const minerals = mineralResources && prepareMineralResourcesSource(mineralResources, mineralInput,
    fossils?.previous ?? actual, fossils?.structure ?? structure);
  const acidInput = minerals ? { ...minerals.previousRecords, files: minerals.files } : input;
  const acid = acidEquivalents && prepareAcidEquivalentsSource(acidEquivalents, acidInput,
    minerals?.previous ?? actual, minerals?.structure ?? structure);
  const landInput = acid ? { ...acid.previousRecords, files: acid.files } : input;
  const land = landRecovery && prepareLandRecoverySource(landRecovery, landInput, acid?.previous ?? actual, acid?.structure ?? structure);
  const footprintInput = land ? { ...land.previousRecords, files: land.files } : input;
  const footprint = circularFootprint && prepareCircularFootprintSource(circularFootprint, footprintInput,
    land?.previous ?? actual, land?.structure ?? structure);
  const shiftInput = footprint ? { ...footprint.previousRecords, files: footprint.files } : input;
  const shift = loadShift && prepareLoadShiftSource(loadShift, shiftInput, footprint?.previous ?? actual, footprint?.structure ?? structure);
  shift?.verifyCurrentState();
  const substitutionInput = shift ? { ...shift.previousRecords, files: shift.files } : input;
  const substitution = substitutionRules && prepareSubstitutionRulesSource(substitutionRules, substitutionInput,
    shift?.previous ?? actual, shift?.structure ?? structure);
  substitution?.verifyCurrentState();
  const previousRecords = substitution?.previousRecords ?? substitutionInput;
  if (flowBoundary && !verifyFlowBoundaryReceipts(flowBoundary, artifacts))
    throw new Error('Flow boundary lacks exact independent source, reader, and output evidence');
  if (serviceConstraints && preview !== 'service') {
    const [cases, { readerPublicDownloads }] = await Promise.all([
      loadCasePublications(root), import('./reader-current-output.mjs'),
    ]);
    if (!verifyServiceConstraintsReceipts(serviceConstraints, artifacts, cases, readerPublicDownloads(previousRecords.catalog, previousRecords.literature, previousRecords.readings)))
      throw new Error('Service constraints lacks exact independent source, reader, and output evidence');
  }
  if (substitutionRules && preview !== 'substitution') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifySubstitutionRulesReceipts(substitutionRules, artifacts, readerPublicDownloads(substitutionInput.catalog, substitutionInput.literature, substitutionInput.readings)))
      throw new Error('Substitution rules lacks exact independent source, reader, and output evidence');
  }
  if (loadShift && preview !== 'load-shift') {
    const [cases, { readerPublicDownloads }] = await Promise.all([loadCasePublications(root), import('./reader-current-output.mjs')]);
    if (!verifyLoadShiftReceipts(loadShift, artifacts, readerPublicDownloads(shiftInput.catalog, shiftInput.literature, shiftInput.readings), cases))
      throw new Error('Load shift lacks exact independent source, reader, and output evidence');
  }
  if (circularFootprint && preview !== 'circular-footprint') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyCircularFootprintReceipts(circularFootprint, artifacts, readerPublicDownloads(footprintInput.catalog, footprintInput.literature, footprintInput.readings)))
      throw new Error('Circular footprint lacks exact independent source, reader, and output evidence');
  }
  if (landRecovery && preview !== 'land-recovery') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyLandRecoveryReceipts(landRecovery, artifacts, readerPublicDownloads(landInput.catalog, landInput.literature, landInput.readings)))
      throw new Error('Land recovery lacks exact independent source, reader, and output evidence');
  }
  if (acidEquivalents && preview !== 'acid-equivalents') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyAcidEquivalentsReceipts(acidEquivalents, artifacts, readerPublicDownloads(acidInput.catalog, acidInput.literature, acidInput.readings)))
      throw new Error('Acid equivalents lacks exact independent source, reader, and output evidence');
  }
  if (mineralResources && preview !== 'mineral-resources') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyMineralResourcesReceipts(mineralResources, artifacts, readerPublicDownloads(mineralInput.catalog, mineralInput.literature, mineralInput.readings)))
      throw new Error('Mineral resources lacks exact independent source, reader, and output evidence');
  }
  if (fossilResources && preview !== 'fossil-resources') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyFossilResourcesReceipts(fossilResources, artifacts, readerPublicDownloads(fossilInput.catalog, fossilInput.literature, fossilInput.readings)))
      throw new Error('Fossil resources lacks exact independent source, reader, and output evidence');
  }
  if (photochemicalOzone && preview !== 'photochemical-ozone') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyPhotochemicalOzoneReceipts(photochemicalOzone, artifacts, readerPublicDownloads(ozoneInput.catalog, ozoneInput.literature, ozoneInput.readings)))
      throw new Error('Photochemical ozone lacks exact independent source, reader, and output evidence');
  }
  if (ozoneRadiation && preview !== 'ozone-radiation') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyOzoneRadiationReceipts(ozoneRadiation, artifacts, readerPublicDownloads(ozradInput.catalog, ozradInput.literature, ozradInput.readings)))
      throw new Error('Ozone and radiation lacks exact independent source, reader, and output evidence');
  }
  if (toxicityComparison && preview !== 'toxicity-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyToxicityComparisonReceipts(toxicityComparison, artifacts, readerPublicDownloads(waterInput.catalog, waterInput.literature, waterInput.readings)))
      throw new Error('Toxicity comparison lacks exact independent source, reader, and output evidence');
  }
  if (waterScarcity && preview !== 'water-scarcity') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyWaterScarcityReceipts(waterScarcity, artifacts, readerPublicDownloads(bioInput.catalog, bioInput.literature, bioInput.readings)))
      throw new Error('Water scarcity lacks exact independent source, reader, and output evidence');
  }
  if (biogenicCarbon && preview !== 'biogenic-carbon') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyBiogenicCarbonReceipts(biogenicCarbon, artifacts, readerPublicDownloads(eutroInput.catalog, eutroInput.literature, eutroInput.readings)))
      throw new Error('Biogenic carbon lacks exact independent source, reader, and output evidence');
  }
  if (eutrophicationPathways && preview !== 'eutrophication-pathways') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyEutrophicationPathwaysReceipts(eutrophicationPathways, artifacts, readerPublicDownloads(particulateInput.catalog, particulateInput.literature, particulateInput.readings)))
      throw new Error('Eutrophication pathways lacks exact independent source, reader, and output evidence');
  }
  if (particulateComparison && preview !== 'particulate-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyParticulateComparisonReceipts(particulateComparison, artifacts, readerPublicDownloads(part4Input.catalog, part4Input.literature, part4Input.readings)))
      throw new Error('Particulate comparison lacks exact independent source, reader, and output evidence');
  }
  if (part4Reread && preview !== 'part4-reread') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyPart4RereadReceipts(part4Reread, artifacts, readerPublicDownloads(weightingInput.catalog, weightingInput.literature, weightingInput.readings)))
      throw new Error('Part IV continuous reread lacks exact independent source, reader, and output evidence');
  }
  if (weightingValuation && preview !== 'weighting-valuation') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyWeightingValuationReceipts(weightingValuation, artifacts, readerPublicDownloads(localizationInput.catalog, localizationInput.literature, localizationInput.readings)))
      throw new Error('Weighting and valuation lacks exact independent source, reader, and output evidence');
  }
  if (localizationComparison && preview !== 'localization-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyLocalizationComparisonReceipts(localizationComparison, artifacts, readerPublicDownloads(socialInput.catalog, socialInput.literature, socialInput.readings)))
      throw new Error('Localization comparison lacks exact independent source, reader, and output evidence');
  }
  if (socialComparison && preview !== 'social-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifySocialComparisonReceipts(socialComparison, artifacts, readerPublicDownloads(costInput.catalog, costInput.literature, costInput.readings)))
      throw new Error('Social comparison lacks exact independent source, reader, and output evidence');
  }
  if (costSustainability && preview !== 'cost-sustainability') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyCostSustainabilityReceipts(costSustainability, artifacts, readerPublicDownloads(part5Input.catalog, part5Input.literature, part5Input.readings)))
      throw new Error('Cost and sustainability lacks exact independent source, reader, and output evidence');
  }
  if (part5Reread && preview !== 'part5-reread') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyPart5RereadReceipts(part5Reread, artifacts, readerPublicDownloads(dappInput.catalog, dappInput.literature, dappInput.readings)))
      throw new Error('Part V continuous reread lacks exact independent source, reader, and output evidence');
  }
  if (dataApplicabilityComparison && preview !== 'data-applicability-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyDataApplicabilityComparisonReceipts(dataApplicabilityComparison, artifacts, readerPublicDownloads(uncInput.catalog, uncInput.literature, uncInput.readings)))
      throw new Error('Data applicability comparison lacks exact independent source, reader, and output evidence');
  }
  if (uncertaintyComparison && preview !== 'uncertainty-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyUncertaintyComparisonReceipts(uncertaintyComparison, artifacts, readerPublicDownloads(pfrInput.catalog, pfrInput.literature, pfrInput.readings)))
      throw new Error('Uncertainty comparison lacks exact independent source, reader, and output evidence');
  }
  if (productFootprintComparison && preview !== 'product-footprint-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyProductFootprintComparisonReceipts(productFootprintComparison, artifacts, readerPublicDownloads(dqpInput.catalog, dqpInput.literature, dqpInput.readings)))
      throw new Error('Product footprint comparison lacks exact independent source, reader, and output evidence');
  }
  if (dataQualityComparison && preview !== 'data-quality-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyDataQualityComparisonReceipts(dataQualityComparison, artifacts, readerPublicDownloads(part6Input.catalog, part6Input.literature, part6Input.readings)))
      throw new Error('Data quality comparison lacks exact independent source, reader, and output evidence');
  }
  if (part6Reread && preview !== 'part6-reread') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyPart6RereadReceipts(part6Reread, artifacts, readerPublicDownloads(wscInput.catalog, wscInput.literature, wscInput.readings)))
      throw new Error('Part VI continuous reread lacks exact independent source, reader, and output evidence');
  }
  if (wallServiceComparison && preview !== 'wall-service-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyWallServiceComparisonReceipts(wallServiceComparison, artifacts, readerPublicDownloads(intInput.catalog, intInput.literature, intInput.readings)))
      throw new Error('Wall service comparison lacks exact independent source, reader, and output evidence');
  }
  if (interpretationBags && preview !== 'interpretation-bags') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyInterpretationBagsReceipts(interpretationBags, artifacts, readerPublicDownloads(futInput.catalog, futInput.literature, futInput.readings)))
      throw new Error('Interpretation & shopping-bag comparison lacks exact independent source, reader, and output evidence');
  }
  if (futureScenarios && preview !== 'future-scenarios') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyFutureScenariosReceipts(futureScenarios, artifacts, readerPublicDownloads(revInput.catalog, revInput.literature, revInput.readings)))
      throw new Error('Future technology & scenarios comparison lacks exact independent source, reader, and output evidence');
  }
  if (part3Reread && preview !== 'part3-reread') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyPart3RereadReceipts(part3Reread, artifacts, readerPublicDownloads(catalog, literature, readings)))
      throw new Error('Part III continuous reread lacks exact independent source, reader, and output evidence');
  }
  if (marketResponseComparison && preview !== 'market-response-comparison') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyMarketResponseComparisonReceipts(marketResponseComparison, artifacts, readerPublicDownloads(part3Input.catalog, part3Input.literature, part3Input.readings)))
      throw new Error('Market response comparison lacks exact independent source, reader, and output evidence');
  }
  if (part7Reread && preview !== 'part7-reread') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyPart7RereadReceipts(part7Reread, artifacts, readerPublicDownloads(mktInput.catalog, mktInput.literature, mktInput.readings)))
      throw new Error('Part VII continuous reread lacks exact independent source, reader, and output evidence');
  }
  if (revisableJudgment && preview !== 'revisable-judgment') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyRevisableJudgmentReceipts(revisableJudgment, artifacts, readerPublicDownloads(part7Input.catalog, part7Input.literature, part7Input.readings)))
      throw new Error('Revisable judgment synthesis lacks exact independent source, reader, and output evidence');
  }
  const service = serviceConstraints && prepareServiceConstraintsSource(serviceConstraints, substitution?.previous ?? actual,
    substitution?.structure ?? structure, { ...previousRecords, files: substitutionInput.files });
  const flow = flowBoundary && prepareFlowBoundarySource(flowBoundary, service?.previous ?? actual,
    service?.previous.structure ?? structure, flowBoundaryPredecessorPin, service?.previousRecords ?? { readings, catalog });
  if (!unit) return qualifyReadableBookEdition(baseline, readableBookBaselineDigest, acceptance, readableBookAcceptancePins, actual, artifacts);

  if (!verifyReadableBookReviewReceipts(unit, artifacts)) throw new Error('Reader copyedit requires exact primary review evidence');
  for (const { file } of readerCopyeditSupportReferences(unit, artifacts)) {
    const path = resolve(realRoot, file);
    if (!(await lstat(path)).isFile() || await realpath(path) !== path)
      throw new Error(`Reader copyedit supporting evidence must be a regular file in its review directory: ${file}`);
    artifacts.set(file, await readFile(path));
  }
  const capture = await readConfig('reader-copyedit-8148-capture.json');
  if (editionDigest(capture) !== readerCopyeditCaptureDigest) throw new Error('Reader copyedit differs from its independently pinned 8148 capture');
  const previousUnits = pinnedReadableBookUnits(acceptance, readableBookBaselineDigest, readableBookAcceptancePins);
  const previous = readableBookReviewPlan(previousUnits);
  const { previousState } = qualifyReaderCopyedit({ unit, actual: flow?.previous ?? actual, previous, capture, artifacts,
    sourceStructure: flow?.previous.structure ?? structure });
  const qualified = qualifyReadableBookEdition(baseline, readableBookBaselineDigest, acceptance, readableBookAcceptancePins, previousState, artifacts);
  flow?.verifyCurrentState();
  service?.verifyCurrentState();
  const qualifiedFlow = effectiveFlowBoundary(effectiveReaderCopyedit(qualified, unit), flowBoundary, flow?.affectedClaimIds ?? []);
  const qualifiedService = effectiveServiceConstraints(qualifiedFlow, serviceConstraints, service?.affectedClaimIds);
  const qualifiedSubstitution = effectiveSubstitutionRules(qualifiedService, substitutionRules, substitution?.affectedClaimIds);
  const qualifiedShift = effectiveLoadShift(qualifiedSubstitution, loadShift, shift?.affectedClaimIds);
  const qualifiedFootprint = effectiveCircularFootprint(qualifiedShift, circularFootprint, footprint?.affectedClaimIds);
  const qualifiedLand = effectiveLandRecovery(qualifiedFootprint, landRecovery, land?.affectedClaimIds);
  const qualifiedAcid = effectiveAcidEquivalents(qualifiedLand, acidEquivalents, acid?.affectedClaimIds);
  const qualifiedMineral = effectiveMineralResources(qualifiedAcid, mineralResources, minerals?.affectedClaimIds);
  const qualifiedFossil = effectiveFossilResources(qualifiedMineral, fossilResources, fossils?.affectedClaimIds);
  const qualifiedOzone = effectivePhotochemicalOzone(qualifiedFossil, photochemicalOzone, ozone?.affectedClaimIds);
  const qualifiedOzrad = effectiveOzoneRadiation(qualifiedOzone, ozoneRadiation, ozrad?.affectedClaimIds);
  const qualifiedTox = effectiveToxicityComparison(qualifiedOzrad, toxicityComparison, tox?.affectedClaimIds);
  const qualifiedWater = effectiveWaterScarcity(qualifiedTox, waterScarcity, water?.affectedClaimIds);
  const qualifiedBio = effectiveBiogenicCarbon(qualifiedWater, biogenicCarbon, bio?.affectedClaimIds);
  const qualifiedEutro = effectiveEutrophicationPathways(qualifiedBio, eutrophicationPathways, eutro?.affectedClaimIds);
  const qualifiedParticulate = effectiveParticulateComparison(qualifiedEutro, particulateComparison, particulate?.affectedClaimIds);
  const qualifiedPart4 = effectivePart4Reread(qualifiedParticulate, part4Reread, part4?.affectedClaimIds);
  const qualifiedWeighting = effectiveWeightingValuation(qualifiedPart4, weightingValuation, weighting?.affectedClaimIds);
  const qualifiedLocalization = effectiveLocalizationComparison(qualifiedWeighting, localizationComparison, localization?.affectedClaimIds);
  const qualifiedSocial = effectiveSocialComparison(qualifiedLocalization, socialComparison, social?.affectedClaimIds);
  const qualifiedCost = effectiveCostSustainability(qualifiedSocial, costSustainability, cost?.affectedClaimIds);
  const qualifiedPart5 = effectivePart5Reread(qualifiedCost, part5Reread, part5?.affectedClaimIds);
  const qualifiedDapp = effectiveDataApplicabilityComparison(qualifiedPart5, dataApplicabilityComparison, dapp?.affectedClaimIds);
  const qualifiedUnc = effectiveUncertaintyComparison(qualifiedDapp, uncertaintyComparison, unc?.affectedClaimIds);
  const qualifiedPfr = effectiveProductFootprintComparison(qualifiedUnc, productFootprintComparison, pfr?.affectedClaimIds);
  const qualifiedDqp = effectiveDataQualityComparison(qualifiedPfr, dataQualityComparison, dqp?.affectedClaimIds);
  const qualifiedPart6 = effectivePart6Reread(qualifiedDqp, part6Reread, part6?.affectedClaimIds);
  const qualifiedWsc = effectiveWallServiceComparison(qualifiedPart6, wallServiceComparison, wsc?.affectedClaimIds);
  const qualifiedInt = effectiveInterpretationBags(qualifiedWsc, interpretationBags, intBags?.affectedClaimIds);
  const qualifiedFut = effectiveFutureScenarios(qualifiedInt, futureScenarios, fut?.affectedClaimIds);
  const qualifiedRev = effectiveRevisableJudgment(qualifiedFut, revisableJudgment, rev?.affectedClaimIds);
  const qualifiedPart7 = effectivePart7Reread(qualifiedRev, part7Reread, part7?.affectedClaimIds);
  const qualifiedMkt = effectiveMarketResponseComparison(qualifiedPart7, marketResponseComparison, mkt?.affectedClaimIds);
  return effectivePart3Reread(qualifiedMkt, part3Reread, part3?.affectedClaimIds);
}

export function validateReadableBookCurrent(root, catalog, readings, literature) {
  return qualifyCurrentReaderSources(root, catalog, readings, literature);
}

export function validateServiceConstraintsReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Service constraints review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'service');
}

export function validateSubstitutionRulesReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Substitution rules review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'substitution');
}

export function validateLoadShiftReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1') throw new Error('Load shift review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'load-shift');
}

export function validateCircularFootprintReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Circular footprint review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'circular-footprint');
}

export function validateLandRecoveryReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Land recovery review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'land-recovery');
}

export function validateAcidEquivalentsReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Acid equivalents review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'acid-equivalents');
}

export function validateMineralResourcesReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Mineral resources review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'mineral-resources');
}

export function validateFossilResourcesReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Fossil resources review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'fossil-resources');
}

export function validatePhotochemicalOzoneReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Photochemical ozone review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'photochemical-ozone');
}

export function validateOzoneRadiationReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Ozone and radiation review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'ozone-radiation');
}

export function validateToxicityComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Toxicity comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'toxicity-comparison');
}

export function validateWaterScarcityReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Water scarcity review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'water-scarcity');
}

export function validateBiogenicCarbonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Biogenic carbon review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'biogenic-carbon');
}

export function validateEutrophicationPathwaysReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Eutrophication pathways review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'eutrophication-pathways');
}

export function validateParticulateComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Particulate comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'particulate-comparison');
}

export function validatePart4RereadReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Part IV continuous reread review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'part4-reread');
}

export function validateWeightingValuationReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Weighting and valuation review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'weighting-valuation');
}

export function validateLocalizationComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Localization comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'localization-comparison');
}

export function validateSocialComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Social comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'social-comparison');
}

export function validateCostSustainabilityReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Cost and sustainability review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'cost-sustainability');
}

export function validatePart5RereadReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Part V continuous reread review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'part5-reread');
}

export function validateDataApplicabilityComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Data applicability comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'data-applicability-comparison');
}

export function validateUncertaintyComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Uncertainty comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'uncertainty-comparison');
}

export function validateProductFootprintComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Product footprint comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'product-footprint-comparison');
}

export function validateDataQualityComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Data quality comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'data-quality-comparison');
}

export function validatePart6RereadReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Part VI continuous reread review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'part6-reread');
}

export function validateWallServiceComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Wall service comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'wall-service-comparison');
}

export function validateInterpretationBagsReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Interpretation & shopping-bag comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'interpretation-bags');
}

export function validateFutureScenariosReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Future technology & scenarios comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'future-scenarios');
}

export function validateRevisableJudgmentReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Revisable judgment synthesis review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'revisable-judgment');
}

export function validatePart7RereadReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Part VII continuous reread review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'part7-reread');
}

export function validateMarketResponseComparisonReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Market response comparison review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'market-response-comparison');
}

export function validatePart3RereadReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Part III continuous reread review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'part3-reread');
}
