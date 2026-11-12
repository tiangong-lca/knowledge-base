import { validateReadablePedigreeCoverage, validateReadablePedigreeCaseBytes } from './reader-readable-pedigree.mjs';
import { pmSelectionCasePaths, validatePmSelectionCaseBytes, validatePmSelectionCoverage } from './reader-pm-selection.mjs';
import { validateToxicityPathwaysCoverage } from './reader-toxicity-pathways.mjs';
import { assertDataApplicabilityOriginal, assertDataApplicabilityHeadingOriginal, validateDataApplicabilityCoverage } from './reader-data-applicability.mjs';
import { assertClimateAssemblyOriginal, assertClimateAssemblyHeadingOriginal, validateClimateAssemblyArtifactBytes, validateClimateAssemblyCoverage } from './reader-climate-assembly.mjs';
import { assertClosingSynthesisOriginal, assertClosingSynthesisHeadingHistory, validateClosingSynthesisCoverage } from './reader-closing-synthesis.mjs';
import { validateReaderNumberingSources } from './reader-numbering-output.mjs';
import { assertJointProductionOriginal, assertJointProductionHeadingHistory, validateJointProductionCoverage, validateJointProductionArtifactBytes } from './reader-joint-production.mjs';
import { assertWallSelectionOriginal, assertWallSelectionHeadingHistory, validateWallSelectionCoverage, validateWallSelectionArtifactBytes } from './reader-wall-selection.mjs';
import { assertHybridInventoryAccepted, assertHybridInventoryHeadingHistory, validateHybridInventoryCoverage } from './reader-hybrid-inventory.mjs';
import { validateExchangeSemanticsCoverage, assertExchangeSemanticsOriginal, assertExchangeSemanticsHeadingHistory, assertExchangeSemanticsCitationSources, assertExchangeSemanticsPartialHistory } from './reader-exchange-semantics.mjs';
import { assertProcessNetworkHeadingHistory, validateProcessNetworkCoverage } from './reader-process-network.mjs';
import { assertFunctionalReferenceHeadingHistory, validateFunctionalReferenceCoverage } from './reader-functional-reference.mjs';
import { assertCleanerProductionHeadingHistory, validateCleanerProductionCoverage } from './reader-cleaner-production.mjs';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicCatalog, validateCatalog } from './knowledge.mjs';
import { validateResearch } from './research.mjs';
import { loadCasePublications, validateCasePublications } from './case-publication.mjs';
import { validateReadableBookCurrent } from './reader-current-edition-files.mjs';
import { currentEditionKeys, validateFrameworkCoverage, assertFrameworkHeadingHistory } from './reader-edition.mjs';
import { readerInternalIds, validateReaderClaims, validateReaderMdx } from './reader-surface.mjs';

export function validateClaimReferences(text, catalog, label = 'MDX') {
  const errors = [];
  const published = new Set(publicCatalog(catalog).claims.map(c => c.id));
  const known = new Set(catalog.claims.map(c => c.id));
  // Code examples are text, while actual MDX components must use literal IDs.
  const source = text.replace(/^\s*(```|~~~)[\s\S]*?^\s*\1[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
  for (const match of source.matchAll(/<Claim\b[^>]*>/g)) {
    const id = match[0].match(/^<Claim\s+id\s*=\s*(["'])([^"']+)\1\s*\/?>$/);
    if (!id) errors.push(`${label}: Claim must use one literal id attribute without dynamic or duplicate attributes`);
    else if (!known.has(id[2])) errors.push(`${label}: unknown Claim ${id[2]}`);
    else if (!published.has(id[2])) errors.push(`${label}: unpublished Claim ${id[2]} cannot enter public MDX`);
  }
  for (const match of source.matchAll(/<Prose\b[^>]*>/g)) {
    const literal = match[0].match(/^<Prose\s+ids\s*=\s*(["'])([^"']*)\1\s*\/?>$/);
    if (!literal) { errors.push(`${label}: Prose must use one literal ids attribute without dynamic or duplicate attributes`); continue; }
    const claimIds = literal[2].trim().split(/\s+/).filter(Boolean);
    if (!claimIds.length) errors.push(`${label}: Prose ids must contain at least one claim ID`);
    if (new Set(claimIds).size !== claimIds.length) errors.push(`${label}: Prose ids must not contain duplicate claim IDs`);
    for (const id of claimIds) {
      if (!known.has(id)) errors.push(`${label}: unknown Prose claim ${id}`);
      else if (!published.has(id)) errors.push(`${label}: unpublished Prose claim ${id} cannot enter public MDX`);
    }
  }
  return errors;
}

export function validateTeachingCaseReferences(text, entries, label = 'MDX') {
  const errors = [];
  const known = new Set(entries.map(({ spec }) => `${spec.caseId}@${spec.version}`));
  const source = text.replace(/^\s*(```|~~~)[\s\S]*?^\s*\1[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
  for (const match of source.matchAll(/<TeachingCase\b[^>]*(?:>|$)/g)) {
    const tag = match[0];
    const attributes = [...tag.matchAll(/\s+(id|version)\s*=\s*(["'])([^"']+)\2/g)];
    const remainder = tag.replace(/^<TeachingCase/, '').replace(/\s+(id|version)\s*=\s*(["'])([^"']+)\2/g, '');
    if (!/^\s*\/\s*>$/.test(remainder) || attributes.length !== 2 || new Set(attributes.map(a => a[1])).size !== 2) {
      errors.push(`${label}: TeachingCase must use one literal id and version attribute in a self-closing tag`);
      continue;
    }
    const values = Object.fromEntries(attributes.map(a => [a[1], a[3]]));
    if (!known.has(`${values.id}@${values.version}`)) errors.push(`${label}: unknown TeachingCase ${values.id}@${values.version}`);
  }
  return errors;
}

async function mdxFiles(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const item = resolve(path, entry.name);
    if (entry.isDirectory()) result.push(...await mdxFiles(item));
    else if (entry.isFile() && /\.mdx?$/.test(entry.name)) result.push(item);
  }
  return result;
}

async function validatePublication(root, requireCurrent) {
  const data = JSON.parse(await readFile(resolve(root, 'knowledge/catalog.json'), 'utf8'));
  const errors = validateCatalog(data);
  const readOptional = async path => {
    try { return JSON.parse(await readFile(resolve(root, path), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return undefined; throw error; }
  };
  const [literature, readings] = await Promise.all([
    readOptional('knowledge/research/literature-map.json'),
    readOptional('knowledge/research/readings.json'),
  ]);
  errors.push(...validateResearch(literature, readings, data));
  let cases = [];
  try { cases = await loadCasePublications(root); errors.push(...validateCasePublications(cases, data, { readingRegister: readings })); }
  catch (error) { errors.push(error.message); }
  if (errors.length) return errors;
  const knownIds = readerInternalIds(data, literature, readings, cases);
  errors.push(...validateReaderClaims(publicCatalog(data), knownIds));
  for (const file of await mdxFiles(resolve(root, 'content'))) {
    const text = await readFile(file, 'utf8'), label = relative(root, file);
    errors.push(...validateClaimReferences(text, data, label), ...validateTeachingCaseReferences(text, cases, label), ...validateReaderMdx(text, label, knownIds));
  }
  const edition = await readOptional('config/book-edition.json');
  const numbering = await readOptional('config/reader-numbering.json');
  if (numbering && !edition) errors.push('Current numbered reader publication requires its explicit book edition');
  if (!edition && await readOptional('content/docs/book/meta.json')) errors.push('Book source requires its current edition and accepted publication inventories');
  if (requireCurrent) {
    if (!edition) errors.push('Current reader publication requires its explicit book edition');
    try {
      const current = await validateReadableBookCurrent(root, data, readings, literature);
      errors.push(...current.errors);
    } catch (error) { errors.push(error.message); }
  }
  if (edition) {
    const [accepted,baseline,placements,headings]=await Promise.all(['framework-accepted','citation-baseline','citation-placements','framework-heading-history'].map(name=>readOptional(`config/${name}.json`)));
    const [functionalAccepted,functionalHeadingHistory,functionalProse]=await Promise.all(['functional-reference-accepted','functional-reference-heading-history','functional-reference-prose-accepted'].map(name=>readOptional(`config/${name}.json`)));
    const [processAccepted,processHeadingHistory,processProse]=await Promise.all(['process-network-accepted','process-network-heading-history','process-network-prose-accepted'].map(name=>readOptional(`config/${name}.json`)));
    const [cleanerAccepted,cleanerHeadingHistory]=await Promise.all(['cleaner-production-accepted','cleaner-production-heading-history'].map(name=>readOptional(`config/${name}.json`)));
    const dataAccepted = await readOptional('config/data-applicability-accepted.json');
    const climateAccepted = await readOptional('config/climate-assembly-accepted.json');
    const toxicityAccepted = await readOptional('config/toxicity-pathways-accepted.json');
    const pedigreeAccepted = await readOptional('config/readable-pedigree-accepted.json');
    const pmAccepted = await readOptional('config/pm-selection-accepted.json');
    const [closingHistory,closingProse] = await Promise.all(['heading-history','prose-accepted'].map(name=>readOptional(`config/closing-synthesis-${name}.json`)));
    const [jointOriginal,jointHeadings,jointProse] = await Promise.all(['original','heading-history','prose-accepted'].map(name=>readOptional(`config/joint-production-${name}.json`)));
    const [wallOriginal,wallHeadings,wallAccepted] = await Promise.all(['original','heading-history','accepted'].map(name=>readOptional(`config/wall-selection-${name}.json`)));
    const [hybridAccepted,hybridHeadings,hybridProse]=await Promise.all(['accepted','heading-history','prose-accepted'].map(name=>readOptional(`config/hybrid-inventory-${name}.json`)));
    const [exchangeOriginal,exchangeHeadings,exchangeCitations,exchangePartial,exchangeProse]=await Promise.all(['original','heading-history','citation-sources','partial-history','prose-accepted'].map(name=>readOptional(`config/exchange-semantics-${name}.json`)));
    const sources=new Map();
    for(const file of await mdxFiles(resolve(root,'content'))) {
      const path=relative(resolve(root,'content'),file).replaceAll('\\','/');
      const route=`/${path.replace(/\.mdx?$/,'').replace(/(?:^|\/)index$/,'')}`;
      sources.set(route,await readFile(file,'utf8'));
    }
    try {
      errors.push(...validatePmSelectionCoverage(edition, sources, data, pmAccepted, undefined, { readings, literature }));
      const pmCaseBytes = Object.fromEntries(await Promise.all(pmSelectionCasePaths.map(async path => [path, await readFile(resolve(root, path))])));
      errors.push(...validatePmSelectionCaseBytes(pmCaseBytes, pedigreeAccepted));
      assertDataApplicabilityOriginal(); assertDataApplicabilityHeadingOriginal();
      errors.push(...validateDataApplicabilityCoverage(edition,sources,data,dataAccepted));
      assertClimateAssemblyOriginal(); assertClimateAssemblyHeadingOriginal();
      errors.push(...validateClimateAssemblyCoverage(edition,sources,data,climateAccepted));
      errors.push(...validateClimateAssemblyArtifactBytes({figure:await readFile(resolve(root,'public/book-figures/climate-response-and-integral.svg')),input:await readFile(resolve(root,'knowledge/cases/climate-metrics-v1.json'))}));
      assertClosingSynthesisOriginal(); assertClosingSynthesisHeadingHistory(closingHistory);
      errors.push(...validateReadablePedigreeCoverage(edition, sources, data, pedigreeAccepted, undefined, 'raw', readings));
      const [pedigreeInput, pedigreePublication] = await Promise.all([
        readFile(resolve(root, 'knowledge/cases/pedigree-calibration-v1.json')),
        readFile(resolve(root, 'knowledge/cases/pedigree-calibration-v1.publication.json')),
      ]);
      errors.push(...validateReadablePedigreeCaseBytes(pedigreeAccepted, { input: pedigreeInput, publication: pedigreePublication }));
      errors.push(...validateClosingSynthesisCoverage(edition,sources,data,closingProse,undefined,'raw',undefined,undefined,toxicityAccepted,undefined,pedigreeAccepted));
      if (!numbering) throw new Error('Current reader publication requires its independently pinned reader-numbering.json');
      errors.push(...validateReaderNumberingSources(numbering,sources,edition));
      const missingWall = [['original',wallOriginal],['heading-history',wallHeadings],['accepted',wallAccepted]].filter(([,value])=>!value).map(([name])=>`wall-selection-${name}.json`);
      if (missingWall.length) throw new Error(`Book edition requires its wall original, captured headings and final selection; missing: ${missingWall.join(', ')}`);
      assertWallSelectionOriginal(wallOriginal); assertWallSelectionHeadingHistory(wallHeadings);
      errors.push(...validateWallSelectionCoverage(edition,sources,wallOriginal,data,wallAccepted));
      const wallBytes = await Promise.all(['components/teaching-case-client.tsx','knowledge/cases/wall-coating-v1.json','knowledge/cases/wall-coating-v1.publication.json','scripts/teaching-case.mjs','lib/teaching-case.ts'].map(path=>readFile(resolve(root,path))));
      errors.push(...validateWallSelectionArtifactBytes(wallAccepted,{component:wallBytes[0],input:wallBytes[1],publication:wallBytes[2],engine:wallBytes[3],clientEngine:wallBytes[4]}));
      const missingHybrid = [['accepted',hybridAccepted],['heading-history',hybridHeadings],['prose-accepted',hybridProse]].filter(([,value])=>!value).map(([name])=>`hybrid-inventory-${name}.json`);
      if (missingHybrid.length) throw new Error(`Book edition requires its independent B09 original, captured-heading and final-prose inventories; missing: ${missingHybrid.join(', ')}`);
      assertHybridInventoryAccepted(hybridAccepted); assertHybridInventoryHeadingHistory(hybridHeadings);
      const missingJoint = [['original',jointOriginal],['heading-history',jointHeadings],['prose-accepted',jointProse]].filter(([,value])=>!value).map(([name])=>`joint-production-${name}.json`);
      if (missingJoint.length) throw new Error(`Book edition requires its independent B10 original, actual capture and final-prose inventories; missing: ${missingJoint.join(', ')}`);
      assertJointProductionOriginal(jointOriginal); assertJointProductionHeadingHistory(jointHeadings);
      errors.push(...validateJointProductionCoverage(edition,sources,jointOriginal,data,jointProse));
      const [component, input] = await Promise.all([
        readFile(resolve(root, 'components/joint-production-case.tsx')),
        readFile(resolve(root, 'knowledge/cases/joint-batch-v1.json')),
      ]);
      errors.push(...validateJointProductionArtifactBytes(jointProse, { component, input }));
      errors.push(...validateHybridInventoryCoverage(edition,sources,hybridAccepted,data,hybridProse));
      if (!exchangeOriginal || !exchangeHeadings || !exchangeCitations || !exchangePartial || !exchangeProse) throw new Error("Book edition requires independent B08 original, captured history, partial-source and manuscript inventories");
      assertExchangeSemanticsOriginal(exchangeOriginal); assertExchangeSemanticsHeadingHistory(exchangeHeadings); assertExchangeSemanticsCitationSources(exchangeCitations); assertExchangeSemanticsPartialHistory(exchangePartial);
      errors.push(...validateExchangeSemanticsCoverage(edition,sources,exchangeOriginal,data,exchangeProse,exchangePartial));
      currentEditionKeys(edition,[...sources.keys()],baseline,placements);
      assertFrameworkHeadingHistory(headings);
      assertCleanerProductionHeadingHistory(cleanerHeadingHistory);
      assertFunctionalReferenceHeadingHistory(functionalHeadingHistory);
      assertProcessNetworkHeadingHistory(processHeadingHistory);
      errors.push(...validateProcessNetworkCoverage(edition,sources,processAccepted,data,processProse));
      errors.push(...validateFunctionalReferenceCoverage(edition,sources,functionalAccepted,data,functionalProse));
      errors.push(...validateCleanerProductionCoverage(edition,sources,cleanerAccepted,data));
      errors.push(...validateFrameworkCoverage(edition,sources,accepted,data));
      errors.push(...validateToxicityPathwaysCoverage(edition,sources,data,toxicityAccepted,undefined,{ readings, literature }));
    } catch(error) { errors.push(error.message); }
  }
  return errors;
}

export const validateRepository = root => validatePublication(root, true);
export const validateRepositoryFixture = root => validatePublication(root, false);

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const errors = await validateRepository(root);
    if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
    else console.log('Catalog, research/case publication integrity and public MDX references passed. This does not establish scientific or human expert review.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
