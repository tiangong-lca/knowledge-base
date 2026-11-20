import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { after } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';

const fixtureCommit = 'f650600e6303352252e8d6fad14607c2061a9f58';
const fixtureDir = dirname(fileURLToPath(import.meta.url));
const repo = join(fixtureDir, '..', '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const pinPath = 'scripts/reader-current-edition-pins.mjs';
const copyeditConfigPath = 'config/reader-copyedit-current.json';
const copyeditPinPath = 'scripts/reader-copyedit-pins.mjs';
const flowConfigPath = 'config/reader-flow-boundary.json';
const serviceConfigPath = 'config/reader-service-constraints.json';
const serviceModulePath = 'scripts/reader-service-constraints.mjs';
const substitutionConfigPath = 'config/reader-substitution-rules.json';
const substitutionModulePath = 'scripts/reader-substitution-rules.mjs';
const shiftConfigPath = 'config/reader-load-shift.json';
const shiftModulePath = 'scripts/reader-load-shift.mjs';
const footprintConfigPath = 'config/reader-circular-footprint.json';
const footprintModulePath = 'scripts/reader-circular-footprint.mjs';
const landConfigPath = 'config/reader-land-recovery.json';
const landModulePath = 'scripts/reader-land-recovery.mjs';
const acidConfigPath = 'config/reader-acid-equivalents.json';
const acidModulePath = 'scripts/reader-acid-equivalents.mjs';
const mineralConfigPath = 'config/reader-mineral-resources.json';
const mineralModulePath = 'scripts/reader-mineral-resources.mjs';
const fossilConfigPath = 'config/reader-fossil-resources.json';
const fossilModulePath = 'scripts/reader-fossil-resources.mjs';
const ozoneConfigPath = 'config/reader-photochemical-ozone.json';
const ozoneModulePath = 'scripts/reader-photochemical-ozone.mjs';
const ozradConfigPath = 'config/reader-ozone-radiation.json';
const ozradModulePath = 'scripts/reader-ozone-radiation.mjs';
const toxConfigPath = 'config/reader-toxicity-comparison.json';
const toxModulePath = 'scripts/reader-toxicity-comparison.mjs';
const waterConfigPath = 'config/reader-water-scarcity.json';
const waterModulePath = 'scripts/reader-water-scarcity.mjs';
const bioConfigPath = 'config/reader-biogenic-carbon.json';
const bioModulePath = 'scripts/reader-biogenic-carbon.mjs';
const eutroConfigPath = 'config/reader-eutrophication-pathways.json';
const eutroModulePath = 'scripts/reader-eutrophication-pathways.mjs';
const particulateConfigPath = 'config/reader-particulate-comparison.json';
const particulateModulePath = 'scripts/reader-particulate-comparison.mjs';
const part4ConfigPath = 'config/reader-part4-reread.json';
const part4ModulePath = 'scripts/reader-part4-reread.mjs';
const weightingConfigPath = 'config/reader-weighting-valuation.json';
const weightingModulePath = 'scripts/reader-weighting-valuation.mjs';
const localizationConfigPath = 'config/reader-localization-comparison.json';
const localizationModulePath = 'scripts/reader-localization-comparison.mjs';
const socialConfigPath = 'config/reader-social-comparison.json';
const socialModulePath = 'scripts/reader-social-comparison.mjs';
const costConfigPath = 'config/reader-cost-sustainability.json';
const costModulePath = 'scripts/reader-cost-sustainability.mjs';
const part5ConfigPath = 'config/reader-part5-reread.json';
const part5ModulePath = 'scripts/reader-part5-reread.mjs';
const dappConfigPath = 'config/reader-data-applicability-comparison.json';
const dappModulePath = 'scripts/reader-data-applicability-comparison.mjs';
const uncConfigPath = 'config/reader-uncertainty-comparison.json';
const uncModulePath = 'scripts/reader-uncertainty-comparison.mjs';
const pfrConfigPath = 'config/reader-product-footprint-comparison.json';
const pfrModulePath = 'scripts/reader-product-footprint-comparison.mjs';
const dqpConfigPath = 'config/reader-data-quality-comparison.json';
const dqpModulePath = 'scripts/reader-data-quality-comparison.mjs';
const part6ConfigPath = 'config/reader-part6-reread.json';
const part6ModulePath = 'scripts/reader-part6-reread.mjs';
const wscConfigPath = 'config/reader-wall-service-comparison.json';
const wscModulePath = 'scripts/reader-wall-service-comparison.mjs';
const intConfigPath = 'config/reader-interpretation-bags.json';
const intModulePath = 'scripts/reader-interpretation-bags.mjs';
const futConfigPath = 'config/reader-future-scenarios.json';
const futModulePath = 'scripts/reader-future-scenarios.mjs';
const revConfigPath = 'config/reader-revisable-judgment.json';
const revModulePath = 'scripts/reader-revisable-judgment.mjs';
const part7ConfigPath = 'config/reader-part7-reread.json';
const part7ModulePath = 'scripts/reader-part7-reread.mjs';
const mktConfigPath = 'config/reader-market-response-comparison.json';
const mktModulePath = 'scripts/reader-market-response-comparison.mjs';
const part3ConfigPath = 'config/reader-part3-reread.json';
const part3ModulePath = 'scripts/reader-part3-reread.mjs';
const frConfigPath = 'config/reader-functional-reference-comparison.json';
const frModulePath = 'scripts/reader-functional-reference-comparison.mjs';
const hybConfigPath = 'config/reader-hybrid-inventory-comparison.json';
const hybModulePath = 'scripts/reader-hybrid-inventory-comparison.mjs';
const part2ConfigPath = 'config/reader-part2-reread.json';
const part2ModulePath = 'scripts/reader-part2-reread.mjs';
const fixtureAliases = new Set(['scripts/reader-current-expectations.mjs', 'scripts/reader-exchange-semantics.mjs', serviceModulePath, substitutionModulePath, shiftModulePath, footprintModulePath, landModulePath, acidModulePath, mineralModulePath, fossilModulePath, ozoneModulePath, ozradModulePath, toxModulePath, waterModulePath, bioModulePath, eutroModulePath, particulateModulePath, part4ModulePath, weightingModulePath, localizationModulePath, socialModulePath, costModulePath, part5ModulePath, dappModulePath, uncModulePath, pfrModulePath, dqpModulePath, part6ModulePath, wscModulePath, intModulePath, futModulePath, revModulePath, part7ModulePath, mktModulePath, part3ModulePath, frModulePath, hybModulePath, part2ModulePath].map(path => `@/${path}`));
const flowPinPath = 'scripts/reader-flow-boundary-pins.mjs';

async function loadArchive() {
  const [compressed, manifestBytes] = await Promise.all([
    readFile(join(fixtureDir, 'reader-f650600.json.gz')),
    readFile(join(fixtureDir, 'reader-f650600.manifest.json')),
  ]);
  const manifest = JSON.parse(manifestBytes);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.sourceCommit, fixtureCommit);
  assert.equal(hash(compressed), manifest.archiveSha256);
  const snapshot = JSON.parse(gunzipSync(compressed));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.sourceCommit, fixtureCommit);
  assert.deepEqual(Object.keys(snapshot.files).sort(), Object.keys(manifest.files).sort());
  for (const [path, text] of Object.entries(snapshot.files)) {
    assert(/^(config|content|knowledge|components|public)\/[A-Za-z0-9._/-]+$/.test(path) || path === pinPath, path);
    assert(path.split('/').every(part => part && part !== '..' && part !== '.'), path);
    assert.equal(typeof text, 'string', path);
    assert.equal(hash(text), manifest.files[path], path);
  }
  const current = JSON.parse(snapshot.files['config/readable-book-current.json']);
  assert.equal(current.status, 'pending');
  assert.deepEqual(current.units, []);
  return snapshot.files;
}

async function write(root, path, bytes) {
  const file = join(root, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes, { flag: 'wx' });
}

async function copyCurrent(root, path) {
  const original = await readFile(join(repo, path));
  await write(root, path, original);
  assert.equal(hash(await readFile(join(root, path))), hash(original), `Current validator or dependency differs: ${path}`);
}

async function materialize(root) {
  const archived = await loadArchive();
  const configs = (await readdir(join(repo, 'config'), { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.json')).map(entry => `config/${entry.name}`);
  const scripts = (await readdir(join(repo, 'scripts'), { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.mjs') && !entry.name.endsWith('.test.mjs'))
    .map(entry => `scripts/${entry.name}`);
  const components = ['components/evidence.tsx', 'components/numbered-heading.tsx', 'components/chapter-content.tsx'];
  const current = [...configs, ...scripts, ...components, 'lib/teaching-case.ts']
    .filter(path => ![copyeditConfigPath, copyeditPinPath, flowConfigPath, flowPinPath, serviceConfigPath, serviceModulePath, substitutionConfigPath, substitutionModulePath, shiftConfigPath, shiftModulePath, footprintConfigPath, footprintModulePath, landConfigPath, landModulePath, acidConfigPath, acidModulePath, mineralConfigPath, mineralModulePath, fossilConfigPath, fossilModulePath, ozoneConfigPath, ozoneModulePath, ozradConfigPath, ozradModulePath, toxConfigPath, toxModulePath, waterConfigPath, waterModulePath, bioConfigPath, bioModulePath, eutroConfigPath, eutroModulePath, particulateConfigPath, particulateModulePath, part4ConfigPath, part4ModulePath, weightingConfigPath, weightingModulePath, localizationConfigPath, localizationModulePath, socialConfigPath, socialModulePath, costConfigPath, costModulePath, part5ConfigPath, part5ModulePath, dappConfigPath, dappModulePath, uncConfigPath, uncModulePath, pfrConfigPath, pfrModulePath, dqpConfigPath, dqpModulePath, part6ConfigPath, part6ModulePath, wscConfigPath, wscModulePath, intConfigPath, intModulePath, futConfigPath, futModulePath, revConfigPath, revModulePath, part7ConfigPath, part7ModulePath, mktConfigPath, mktModulePath, part3ConfigPath, part3ModulePath, frConfigPath, frModulePath, hybConfigPath, hybModulePath, part2ConfigPath, part2ModulePath].includes(path));
  const currentCopyeditPin = await readFile(join(repo, copyeditPinPath), 'utf8');
  const copyeditUnitPin = /^export const readerCopyeditUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentCopyeditPin.matchAll(copyeditUnitPin)].length, 1);
  const currentFlowPin = await readFile(join(repo, flowPinPath), 'utf8');
  const flowUnitPin = /^export const flowBoundaryUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentFlowPin.matchAll(flowUnitPin)].length, 1);
  const currentServiceModule = await readFile(join(repo, serviceModulePath), 'utf8');
  const serviceUnitPin = /^export const serviceConstraintsUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentServiceModule.matchAll(serviceUnitPin)].length, 1);
  const currentSubstitutionModule = await readFile(join(repo, substitutionModulePath), 'utf8');
  const substitutionUnitPin = /^export const substitutionRulesUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentSubstitutionModule.matchAll(substitutionUnitPin)].length, 1);
  const currentShiftModule = await readFile(join(repo, shiftModulePath), 'utf8');
  const shiftUnitPin = /^export const loadShiftUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentShiftModule.matchAll(shiftUnitPin)].length, 1);
  const currentFootprintModule = await readFile(join(repo, footprintModulePath), 'utf8');
  const footprintUnitPin = /^export const circularFootprintUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentFootprintModule.matchAll(footprintUnitPin)].length, 1);
  const currentLandModule = await readFile(join(repo, landModulePath), 'utf8');
  const landUnitPin = /^export const landRecoveryUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentLandModule.matchAll(landUnitPin)].length, 1);
  const currentAcidModule = await readFile(join(repo, acidModulePath), 'utf8');
  const acidUnitPin = /^export const acidEquivalentsUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentAcidModule.matchAll(acidUnitPin)].length, 1);
  const currentMineralModule = await readFile(join(repo, mineralModulePath), 'utf8');
  const mineralUnitPin = /^export const mineralResourcesUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentMineralModule.matchAll(mineralUnitPin)].length, 1);
  const currentFossilModule = await readFile(join(repo, fossilModulePath), 'utf8');
  const fossilUnitPin = /^export const fossilResourcesUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentFossilModule.matchAll(fossilUnitPin)].length, 1);
  const currentOzoneModule = await readFile(join(repo, ozoneModulePath), 'utf8');
  const ozoneUnitPin = /^export const photochemicalOzoneUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentOzoneModule.matchAll(ozoneUnitPin)].length, 1);
  const currentOzradModule = await readFile(join(repo, ozradModulePath), 'utf8');
  const ozradUnitPin = /^export const ozoneRadiationUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentOzradModule.matchAll(ozradUnitPin)].length, 1);
  const currentToxModule = await readFile(join(repo, toxModulePath), 'utf8');
  const toxUnitPin = /^export const toxicityComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentToxModule.matchAll(toxUnitPin)].length, 1);
  const currentWaterModule = await readFile(join(repo, waterModulePath), 'utf8');
  const waterUnitPin = /^export const waterScarcityUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentWaterModule.matchAll(waterUnitPin)].length, 1);
  const currentBioModule = await readFile(join(repo, bioModulePath), 'utf8');
  const bioUnitPin = /^export const biogenicCarbonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentBioModule.matchAll(bioUnitPin)].length, 1);
  const currentEutroModule = await readFile(join(repo, eutroModulePath), 'utf8');
  const eutroUnitPin = /^export const eutrophicationPathwaysUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentEutroModule.matchAll(eutroUnitPin)].length, 1);
  const currentParticulateModule = await readFile(join(repo, particulateModulePath), 'utf8');
  const particulateUnitPin = /^export const particulateComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentParticulateModule.matchAll(particulateUnitPin)].length, 1);
  const currentPart4Module = await readFile(join(repo, part4ModulePath), 'utf8');
  const part4UnitPin = /^export const part4RereadUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentPart4Module.matchAll(part4UnitPin)].length, 1);
  const currentWeightingModule = await readFile(join(repo, weightingModulePath), 'utf8');
  const weightingUnitPin = /^export const weightingValuationUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentWeightingModule.matchAll(weightingUnitPin)].length, 1);
  const currentLocalizationModule = await readFile(join(repo, localizationModulePath), 'utf8');
  const localizationUnitPin = /^export const localizationComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentLocalizationModule.matchAll(localizationUnitPin)].length, 1);
  const currentSocialModule = await readFile(join(repo, socialModulePath), 'utf8');
  const socialUnitPin = /^export const socialComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentSocialModule.matchAll(socialUnitPin)].length, 1);
  const currentCostModule = await readFile(join(repo, costModulePath), 'utf8');
  const costUnitPin = /^export const costSustainabilityUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentCostModule.matchAll(costUnitPin)].length, 1);
  const currentPart5Module = await readFile(join(repo, part5ModulePath), 'utf8');
  const part5UnitPin = /^export const part5RereadUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentPart5Module.matchAll(part5UnitPin)].length, 1);
  const currentDappModule = await readFile(join(repo, dappModulePath), 'utf8');
  const dappUnitPin = /^export const dataApplicabilityComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentDappModule.matchAll(dappUnitPin)].length, 1);
  const currentUncModule = await readFile(join(repo, uncModulePath), 'utf8');
  const uncUnitPin = /^export const uncertaintyComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentUncModule.matchAll(uncUnitPin)].length, 1);
  const currentPfrModule = await readFile(join(repo, pfrModulePath), 'utf8');
  const pfrUnitPin = /^export const productFootprintComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentPfrModule.matchAll(pfrUnitPin)].length, 1);
  const currentDqpModule = await readFile(join(repo, dqpModulePath), 'utf8');
  const dqpUnitPin = /^export const dataQualityComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentDqpModule.matchAll(dqpUnitPin)].length, 1);
  const currentPart6Module = await readFile(join(repo, part6ModulePath), 'utf8');
  const part6UnitPin = /^export const part6RereadUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentPart6Module.matchAll(part6UnitPin)].length, 1);
  const currentWscModule = await readFile(join(repo, wscModulePath), 'utf8');
  const wscUnitPin = /^export const wallServiceComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentWscModule.matchAll(wscUnitPin)].length, 1);
  const currentIntModule = await readFile(join(repo, intModulePath), 'utf8');
  const intUnitPin = /^export const interpretationBagsUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentIntModule.matchAll(intUnitPin)].length, 1);
  const currentFutModule = await readFile(join(repo, futModulePath), 'utf8');
  const futUnitPin = /^export const futureScenariosUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentFutModule.matchAll(futUnitPin)].length, 1);
  const currentRevModule = await readFile(join(repo, revModulePath), 'utf8');
  const revUnitPin = /^export const revisableJudgmentUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentRevModule.matchAll(revUnitPin)].length, 1);
  const currentPart7Module = await readFile(join(repo, part7ModulePath), 'utf8');
  const part7UnitPin = /^export const part7RereadUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentPart7Module.matchAll(part7UnitPin)].length, 1);
  const currentMktModule = await readFile(join(repo, mktModulePath), 'utf8');
  const mktUnitPin = /^export const marketResponseComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentMktModule.matchAll(mktUnitPin)].length, 1);
  const currentPart3Module = await readFile(join(repo, part3ModulePath), 'utf8');
  const part3UnitPin = /^export const part3RereadUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentPart3Module.matchAll(part3UnitPin)].length, 1);
  const currentFrModule = await readFile(join(repo, frModulePath), 'utf8');
  const frUnitPin = /^export const functionalReferenceComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentFrModule.matchAll(frUnitPin)].length, 1);
  const currentHybModule = await readFile(join(repo, hybModulePath), 'utf8');
  const hybUnitPin = /^export const hybridInventoryComparisonUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentHybModule.matchAll(hybUnitPin)].length, 1);
  const currentPart2Module = await readFile(join(repo, part2ModulePath), 'utf8');
  const part2UnitPin = /^export const part2RereadUnitPin = (?:null|'[a-f0-9]{64}');$/gm;
  assert.equal([...currentPart2Module.matchAll(part2UnitPin)].length, 1);
  // The only archived script is the independently selected old edition pin.
  // All validation code, including the expectation resolver, comes from the
  // current worktree and runs under the historical book data in this directory.
  // The later #95, #99, #102, #105, #107, #109, #111, #113, #115, #117, #119, #121, #123, #125, #127, #129, and #131 units are inactive only in this isolated legacy fixture.
  assert.deepEqual(Object.keys(archived).filter(path => path.startsWith('scripts/')), [pinPath]);
  await Promise.all([
    ...current.filter(path => !Object.hasOwn(archived, path)).map(path => copyCurrent(root, path)),
    ...Object.entries(archived).map(([path, text]) => write(root, path, text)),
    write(root, copyeditConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive' })),
    write(root, copyeditPinPath, currentCopyeditPin.replace(copyeditUnitPin, 'export const readerCopyeditUnitPin = null;')),
    write(root, flowConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, flowPinPath, currentFlowPin.replace(flowUnitPin, 'export const flowBoundaryUnitPin = null;')),
    write(root, serviceConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, serviceModulePath, currentServiceModule.replace(serviceUnitPin, 'export const serviceConstraintsUnitPin = null;')),
    write(root, substitutionConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, substitutionModulePath, currentSubstitutionModule.replace(substitutionUnitPin, 'export const substitutionRulesUnitPin = null;')),
    write(root, shiftConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, shiftModulePath, currentShiftModule.replace(shiftUnitPin, 'export const loadShiftUnitPin = null;')),
    write(root, footprintConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, footprintModulePath, currentFootprintModule.replace(footprintUnitPin, 'export const circularFootprintUnitPin = null;')),
    write(root, landConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, landModulePath, currentLandModule.replace(landUnitPin, 'export const landRecoveryUnitPin = null;')),
    write(root, acidConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, acidModulePath, currentAcidModule.replace(acidUnitPin, 'export const acidEquivalentsUnitPin = null;')),
    write(root, mineralConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, mineralModulePath, currentMineralModule.replace(mineralUnitPin, 'export const mineralResourcesUnitPin = null;')),
    write(root, fossilConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, fossilModulePath, currentFossilModule.replace(fossilUnitPin, 'export const fossilResourcesUnitPin = null;')),
    write(root, ozoneConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, ozoneModulePath, currentOzoneModule.replace(ozoneUnitPin, 'export const photochemicalOzoneUnitPin = null;')),
    write(root, ozradConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, ozradModulePath, currentOzradModule.replace(ozradUnitPin, 'export const ozoneRadiationUnitPin = null;')),
    write(root, toxConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, toxModulePath, currentToxModule.replace(toxUnitPin, 'export const toxicityComparisonUnitPin = null;')),
    write(root, waterConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, waterModulePath, currentWaterModule.replace(waterUnitPin, 'export const waterScarcityUnitPin = null;')),
    write(root, bioConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, bioModulePath, currentBioModule.replace(bioUnitPin, 'export const biogenicCarbonUnitPin = null;')),
    write(root, eutroConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, eutroModulePath, currentEutroModule.replace(eutroUnitPin, 'export const eutrophicationPathwaysUnitPin = null;')),
    write(root, particulateConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, particulateModulePath, currentParticulateModule.replace(particulateUnitPin, 'export const particulateComparisonUnitPin = null;')),
    write(root, part4ConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, part4ModulePath, currentPart4Module.replace(part4UnitPin, 'export const part4RereadUnitPin = null;')),
    write(root, weightingConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, weightingModulePath, currentWeightingModule.replace(weightingUnitPin, 'export const weightingValuationUnitPin = null;')),
    write(root, localizationConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, localizationModulePath, currentLocalizationModule.replace(localizationUnitPin, 'export const localizationComparisonUnitPin = null;')),
    write(root, socialConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, socialModulePath, currentSocialModule.replace(socialUnitPin, 'export const socialComparisonUnitPin = null;')),
    write(root, costConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, costModulePath, currentCostModule.replace(costUnitPin, 'export const costSustainabilityUnitPin = null;')),
    write(root, part5ConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, part5ModulePath, currentPart5Module.replace(part5UnitPin, 'export const part5RereadUnitPin = null;')),
    write(root, dappConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, dappModulePath, currentDappModule.replace(dappUnitPin, 'export const dataApplicabilityComparisonUnitPin = null;')),
    write(root, uncConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, uncModulePath, currentUncModule.replace(uncUnitPin, 'export const uncertaintyComparisonUnitPin = null;')),
    write(root, pfrConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, pfrModulePath, currentPfrModule.replace(pfrUnitPin, 'export const productFootprintComparisonUnitPin = null;')),
    write(root, dqpConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, dqpModulePath, currentDqpModule.replace(dqpUnitPin, 'export const dataQualityComparisonUnitPin = null;')),
    write(root, part6ConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, part6ModulePath, currentPart6Module.replace(part6UnitPin, 'export const part6RereadUnitPin = null;')),
    write(root, wscConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, wscModulePath, currentWscModule.replace(wscUnitPin, 'export const wallServiceComparisonUnitPin = null;')),
    write(root, intConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, intModulePath, currentIntModule.replace(intUnitPin, 'export const interpretationBagsUnitPin = null;')),
    write(root, futConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, futModulePath, currentFutModule.replace(futUnitPin, 'export const futureScenariosUnitPin = null;')),
    write(root, revConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, revModulePath, currentRevModule.replace(revUnitPin, 'export const revisableJudgmentUnitPin = null;')),
    write(root, part7ConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, part7ModulePath, currentPart7Module.replace(part7UnitPin, 'export const part7RereadUnitPin = null;')),
    write(root, mktConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, mktModulePath, currentMktModule.replace(mktUnitPin, 'export const marketResponseComparisonUnitPin = null;')),
    write(root, part3ConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, part3ModulePath, currentPart3Module.replace(part3UnitPin, 'export const part3RereadUnitPin = null;')),
    write(root, frConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, frModulePath, currentFrModule.replace(frUnitPin, 'export const functionalReferenceComparisonUnitPin = null;')),
    write(root, hybConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, hybModulePath, currentHybModule.replace(hybUnitPin, 'export const hybridInventoryComparisonUnitPin = null;')),
    write(root, part2ConfigPath, JSON.stringify({ schemaVersion: 1, status: 'inactive', unit: null })),
    write(root, part2ModulePath, currentPart2Module.replace(part2UnitPin, 'export const part2RereadUnitPin = null;')),
    symlink(join(repo, 'node_modules'), join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir'),
  ]);
}

export async function runHistoricalReaderFixture(testUrl) {
  const name = basename(fileURLToPath(testUrl));
  assert(/^reader-[a-z-]+\.test\.mjs$/.test(name), 'Expected a historical reader test entry');
  const originalSuite = await readFile(join(fixtureDir, 'f650600-tests', name.replace('.test.mjs', '.mjs')));
  const root = await mkdtemp(join(tmpdir(), 'reader-f650600-fixture-'));
  let hooks;
  try {
    await materialize(root);
    const suitePath = `scripts/${name}`;
    await write(root, suitePath, originalSuite);
    // The fixture executes the actual TSX through CommonJS, outside Next's
    // alias resolver. Resolve only the declared aliases inside this fixture.
    const fixtureRoot = await realpath(root);
    const fixturePrefix = pathToFileURL(fixtureRoot + '/').href;
    hooks = registerHooks({
      resolve(specifier, context, nextResolve) {
        const isFixtureAlias = fixtureAliases.has(specifier) && context.parentURL?.startsWith(fixturePrefix);
        return nextResolve(isFixtureAlias ? join(fixtureRoot, specifier.slice(2)) : specifier, context);
      },
    });
    // Import in this worker so node:test reports every original case.
    await import(pathToFileURL(join(fixtureRoot, suitePath)).href);
    after(async () => {
      hooks.deregister();
      await rm(root, { recursive: true, force: true });
    });
  } catch (error) {
    hooks?.deregister();
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
