import { assertFunctionalReferenceHeadingHistory, validateFunctionalReferenceCoverage } from './reader-functional-reference.mjs';
import { assertCleanerProductionHeadingHistory, validateCleanerProductionCoverage } from './reader-cleaner-production.mjs';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicCatalog, validateCatalog } from './knowledge.mjs';
import { validateResearch } from './research.mjs';
import { loadCasePublications, validateCasePublications } from './case-publication.mjs';
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

export async function validateRepository(root) {
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
  if (!edition && await readOptional('content/docs/book/meta.json')) errors.push('Book source requires its current edition and accepted publication inventories');
  if (edition) {
    const [accepted,baseline,placements,headings]=await Promise.all(['framework-accepted','citation-baseline','citation-placements','framework-heading-history'].map(name=>readOptional(`config/${name}.json`)));
    const [functionalAccepted,functionalHeadingHistory,functionalProse]=await Promise.all(['functional-reference-accepted','functional-reference-heading-history','functional-reference-prose-accepted'].map(name=>readOptional(`config/${name}.json`)));
    const [cleanerAccepted,cleanerHeadingHistory]=await Promise.all(['cleaner-production-accepted','cleaner-production-heading-history'].map(name=>readOptional(`config/${name}.json`)));
    const sources=new Map();
    for(const file of await mdxFiles(resolve(root,'content'))) {
      const path=relative(resolve(root,'content'),file).replaceAll('\\','/');
      const route=`/${path.replace(/\.mdx?$/,'').replace(/(?:^|\/)index$/,'')}`;
      sources.set(route,await readFile(file,'utf8'));
    }
    try {
      currentEditionKeys(edition,[...sources.keys()],baseline,placements);
      assertFrameworkHeadingHistory(headings);
      assertCleanerProductionHeadingHistory(cleanerHeadingHistory);
      assertFunctionalReferenceHeadingHistory(functionalHeadingHistory);
      errors.push(...validateFunctionalReferenceCoverage(edition,sources,functionalAccepted,data,functionalProse));
      errors.push(...validateCleanerProductionCoverage(edition,sources,cleanerAccepted,data));
      errors.push(...validateFrameworkCoverage(edition,sources,accepted,data));
    } catch(error) { errors.push(error.message); }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const errors = await validateRepository(root);
    if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
    else console.log('Catalog, research/case publication integrity and public MDX references passed. This does not establish scientific or human expert review.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
