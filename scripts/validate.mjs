import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicCatalog, validateCatalog } from './knowledge.mjs';
import { validateResearch } from './research.mjs';

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
  if (errors.length) return errors;
  for (const file of await mdxFiles(resolve(root, 'content'))) errors.push(...validateClaimReferences(await readFile(file, 'utf8'), data, relative(root, file)));
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const errors = await validateRepository(root);
    if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
    else console.log('Catalog, research-register integrity and public MDX references passed. This does not establish scientific or human expert review.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
