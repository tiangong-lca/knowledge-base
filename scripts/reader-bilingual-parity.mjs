import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * Structural parity guard for the Chinese (`content/docs`) and English
 * (`content-en/docs`) editions.
 *
 * The two editions correspond at the meaning level, not word for word, so this
 * guard deliberately ignores wording, sentence order and paragraph length. It
 * only checks the skeleton a reader relies on to move between editions: the
 * same pages in the same order, the same sections, the same claim paragraphs in
 * the same sequence, the same tables and worked cases, the same reading-guide
 * entries, and a published English counterpart for every claim shown in Chinese.
 *
 * Known, justified differences must be listed in
 * `config/editions/en/parity-exceptions.json`; an exception that no longer
 * matches any difference is itself an error, so the list cannot go stale.
 */

export const PARITY_EXCEPTIONS_PATH = 'config/editions/en/parity-exceptions.json';
const ZH_DOCS = 'content/docs';
const EN_DOCS = 'content-en/docs';
const SEPARATOR = /^---.*---$/;

function walk(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, base));
    else if (name.endsWith('.mdx') || name === 'meta.json') out.push(relative(base, full).split(sep).join('/'));
  }
  return out;
}

function stripFrontmatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

export function readFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const fields = {};
  if (!match) return fields;
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z]+):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return fields;
}

/** Extract the language-independent skeleton of one MDX page. */
export function extractMdxStructure(text) {
  const body = stripFrontmatter(String(text)).replace(/```[\s\S]*?```/g, '');
  const claimIds = [];
  for (const match of body.matchAll(/<Prose\s+ids="([^"]+)"\s*\/>|<Claim\s+id="([^"]+)"\s*\/>/g)) {
    for (const id of (match[1] ?? match[2] ?? '').trim().split(/\s+/).filter(Boolean)) claimIds.push(id);
  }
  return {
    h2: (body.match(/^## /gm) ?? []).length,
    h3: (body.match(/^### /gm) ?? []).length,
    tables: (body.match(/^\|\s*:?-{3,}/gm) ?? []).length,
    readerSections: (body.match(/<ReaderSection\b/g) ?? []).length,
    teachingCases: [...body.matchAll(/<TeachingCase\s+[^>]*id="([^"]+)"/g)].map(m => m[1]),
    claimIds,
  };
}

/** Compare two page skeletons; returns `{ check, message }` records. */
export function compareMdxStructures(path, zh, en) {
  const diffs = [];
  for (const check of ['h2', 'h3', 'tables', 'readerSections']) {
    if (zh[check] !== en[check]) diffs.push({ check, message: `${path}: ${check} count differs (zh ${zh[check]}, en ${en[check]})` });
  }
  if (JSON.stringify(zh.teachingCases) !== JSON.stringify(en.teachingCases)) {
    diffs.push({ check: 'teachingCases', message: `${path}: worked-case components differ (zh [${zh.teachingCases.join(', ')}], en [${en.teachingCases.join(', ')}])` });
  }
  if (JSON.stringify(zh.claimIds) !== JSON.stringify(en.claimIds)) {
    const at = zh.claimIds.findIndex((id, i) => id !== en.claimIds[i]);
    const index = at === -1 ? Math.min(zh.claimIds.length, en.claimIds.length) : at;
    diffs.push({
      check: 'claimOrder',
      message: `${path}: claim paragraphs differ at position ${index + 1} (zh ${zh.claimIds[index] ?? '—'}, en ${en.claimIds[index] ?? '—'}; zh ${zh.claimIds.length}, en ${en.claimIds.length})`,
    });
  }
  return diffs;
}

/** Compare `meta.json` page order, ignoring language-specific separators. */
export function compareMetaOrder(path, zhMeta, enMeta) {
  const pages = meta => (meta?.pages ?? []).filter(page => !SEPARATOR.test(page));
  const zh = pages(zhMeta);
  const en = pages(enMeta);
  if (JSON.stringify(zh) === JSON.stringify(en)) return [];
  return [{ check: 'metaOrder', message: `${path}: page order differs (zh ${zh.join(' → ')} | en ${en.join(' → ')})` }];
}

/** Compare the Chinese and English reading guides by identity, not wording. */
export function compareReaderGuides(zhGuide, enGuide) {
  const diffs = [];
  const keys = guide => Object.keys(guide?.partQuestions ?? {}).sort();
  if (JSON.stringify(keys(zhGuide)) !== JSON.stringify(keys(enGuide))) {
    diffs.push({ check: 'partQuestions', message: `reader guide: part questions differ (zh ${keys(zhGuide).join(',')}, en ${keys(enGuide).join(',')})` });
  }
  for (const [part, question] of Object.entries(enGuide?.partQuestions ?? {})) {
    if (typeof question !== 'string' || !question.trim()) diffs.push({ check: 'partQuestions', message: `reader guide: English part ${part} question is empty` });
  }
  const ids = list => (list ?? []).map(item => item?.id);
  if (JSON.stringify(ids(zhGuide?.readingModes)) !== JSON.stringify(ids(enGuide?.readingModes))) {
    diffs.push({ check: 'readingModes', message: `reader guide: reading paths differ (zh ${ids(zhGuide?.readingModes).join(',')}, en ${ids(enGuide?.readingModes).join(',')})` });
  }
  if (JSON.stringify(ids(zhGuide?.problemRoutes)) !== JSON.stringify(ids(enGuide?.problemRoutes))) {
    diffs.push({ check: 'problemRoutes', message: `reader guide: practical questions differ (zh ${ids(zhGuide?.problemRoutes).join(',')}, en ${ids(enGuide?.problemRoutes).join(',')})` });
  }
  const enProblems = new Map((enGuide?.problemRoutes ?? []).map(problem => [problem.id, problem]));
  for (const problem of zhGuide?.problemRoutes ?? []) {
    const en = enProblems.get(problem.id);
    if (!en) continue;
    const routes = p => (p.targets ?? []).map(target => target.route);
    if (JSON.stringify(routes(problem)) !== JSON.stringify(routes(en))) {
      diffs.push({ check: 'problemTargets', message: `reader guide: targets for ${problem.id} differ (zh ${routes(problem).join(',')}, en ${routes(en).join(',')})` });
    }
  }
  return diffs;
}

function loadJson(root, path) {
  const full = join(root, path);
  return existsSync(full) ? JSON.parse(readFileSync(full, 'utf8')) : null;
}

/** Validate an exceptions file shape; returns `{ entries, errors }`. */
export function readParityExceptions(raw) {
  const errors = [];
  const entries = [];
  if (!raw) return { entries, errors };
  if (raw.schemaVersion !== 1 || !Array.isArray(raw.exceptions)) {
    return { entries, errors: [`${PARITY_EXCEPTIONS_PATH} requires schemaVersion 1 and an exceptions array`] };
  }
  const seen = new Set();
  for (const entry of raw.exceptions) {
    const key = `${entry?.path}::${entry?.check}`;
    if (typeof entry?.path !== 'string' || typeof entry?.check !== 'string') {
      errors.push(`${PARITY_EXCEPTIONS_PATH}: every exception needs path and check`);
      continue;
    }
    if (typeof entry.rationale !== 'string' || entry.rationale.trim().length < 20) {
      errors.push(`${PARITY_EXCEPTIONS_PATH}: exception ${key} needs a substantive rationale`);
    }
    if (seen.has(key)) errors.push(`${PARITY_EXCEPTIONS_PATH}: duplicate exception ${key}`);
    seen.add(key);
    entries.push({ ...entry, key });
  }
  return { entries, errors };
}

/**
 * Validate structural parity across the repository.
 * @param {string} root repository root
 * @param {{ zhDocs?: string, enDocs?: string, enClaims?: object, exceptions?: object|null, zhGuide?: object|null, enGuide?: object|null }} [overrides]
 */
export function validateBilingualStructuralParity(root, overrides = {}) {
  const zhDocs = join(root, overrides.zhDocs ?? ZH_DOCS);
  const enDocs = join(root, overrides.enDocs ?? EN_DOCS);
  const errors = [];
  const diffs = [];
  if (!existsSync(enDocs)) return { errors, diffs };

  const zhFiles = walk(zhDocs);
  const enFiles = walk(enDocs);
  const enSet = new Set(enFiles);
  const zhSet = new Set(zhFiles);
  for (const file of zhFiles) if (!enSet.has(file)) diffs.push({ path: file, check: 'missingEnglish', message: `${file}: Chinese page has no English counterpart` });
  for (const file of enFiles) if (!zhSet.has(file)) diffs.push({ path: file, check: 'missingChinese', message: `${file}: English page has no Chinese counterpart` });

  const enClaims = overrides.enClaims ?? loadJson(root, 'knowledge/editions/en/claims.json') ?? { claims: [] };
  const enClaimStatus = new Map((enClaims.claims ?? []).map(claim => [claim.id, claim.status]));

  for (const file of zhFiles.filter(f => enSet.has(f))) {
    const zhText = readFileSync(join(zhDocs, file), 'utf8');
    const enText = readFileSync(join(enDocs, file), 'utf8');
    if (file.endsWith('meta.json')) {
      for (const d of compareMetaOrder(file, JSON.parse(zhText), JSON.parse(enText))) diffs.push({ path: file, ...d });
      continue;
    }
    const front = readFrontmatter(enText);
    if (!front.title) diffs.push({ path: file, check: 'frontmatter', message: `${file}: English page needs a title` });
    if (!front.description) diffs.push({ path: file, check: 'frontmatter', message: `${file}: English page needs a description` });
    const zh = extractMdxStructure(zhText);
    const en = extractMdxStructure(enText);
    for (const d of compareMdxStructures(file, zh, en)) diffs.push({ path: file, ...d });
    for (const id of new Set(zh.claimIds)) {
      const status = enClaimStatus.get(id);
      if (status !== 'published') {
        diffs.push({ path: file, check: 'englishClaim', message: `${file}: claim ${id} shown in Chinese has no published English counterpart (status ${status ?? 'missing'})` });
      }
    }
  }

  const zhGuide = 'zhGuide' in overrides ? overrides.zhGuide : loadJson(root, 'config/reader-guide.json');
  const enGuide = 'enGuide' in overrides ? overrides.enGuide : loadJson(root, 'config/editions/en/reader-guide.json');
  if (zhGuide && !enGuide) diffs.push({ path: 'reader-guide', check: 'missingEnglish', message: 'reader guide: config/editions/en/reader-guide.json is missing' });
  if (zhGuide && enGuide) for (const d of compareReaderGuides(zhGuide, enGuide)) diffs.push({ path: 'reader-guide', ...d });

  const rawExceptions = 'exceptions' in overrides ? overrides.exceptions : loadJson(root, PARITY_EXCEPTIONS_PATH);
  const { entries, errors: exceptionErrors } = readParityExceptions(rawExceptions);
  errors.push(...exceptionErrors);
  const allowed = new Map(entries.map(entry => [entry.key, entry]));
  const used = new Set();
  for (const diff of diffs) {
    const key = `${diff.path}::${diff.check}`;
    if (allowed.has(key)) { used.add(key); continue; }
    errors.push(`Bilingual parity: ${diff.message}`);
  }
  for (const entry of entries) {
    if (!used.has(entry.key)) errors.push(`${PARITY_EXCEPTIONS_PATH}: exception ${entry.key} no longer matches a difference; remove it`);
  }
  return { errors, diffs };
}
