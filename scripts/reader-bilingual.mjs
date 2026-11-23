import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Compute deterministic SHA-256 of the Chinese claim's public projection
 * (text + scope + caveats) used to detect bilingual drift whenever Chinese changes.
 */
export function computeZhClaimDigest(claim) {
  const payload = JSON.stringify({
    text: claim?.text ?? '',
    scope: claim?.scope ?? '',
    caveats: Array.isArray(claim?.caveats) ? claim.caveats : [],
  });
  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Extract normalized numerical tokens for cross-language numeric parity checking.
 * Strips thousands separators (1,048 -> 1048) and normalizes minus signs.
 */
export function extractNumericTokens(text) {
  if (typeof text !== 'string') return [];
  const normalized = text.replace(/(\d),(\d{3})(?!\d)/g, '$1$2').replace(/−/g, '-');
  const matches = normalized.match(/\b\d+(?:\.\d+)?%?/g) ?? [];
  return matches.sort();
}

const ENGLISH_PROCESS_PROSE_PATTERNS = [
  /\b(?:WP\d+|P[0-5]\b|Batch\s+\d+[A-Z]?|B\d{2}\b|cl-[a-z0-9-]+|src-[a-z0-9-]+|en-note-[a-z0-9-]+)\b/,
  /\b(?:TODO|FIXME|TBD|WIP)\b/,
  /\b(?:pull request|PR #\d+|issue #\d+|commit [0-9a-f]{7,40}|git checkpoint)\b/i,
  /\b(?:translated from Chinese|see the Chinese draft|editorial history mode)\b/i,
];

export function detectEnglishProcessProse(text, label = 'text') {
  const errors = [];
  if (typeof text !== 'string') return errors;
  for (const pattern of ENGLISH_PROCESS_PROSE_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      errors.push(`English process-prose/internal-ID leak in ${label}: "${match[0]}"`);
    }
  }
  return errors;
}

const EXTERNAL_EN_CHAPTER_CUE = /(?:IPCC|AR6|ILCD|ecoinvent|CML|ReCiPe|GHG Protocol|UNEP|SETAC|USEtox|RIVM|LC-IMPACT|ISO\s+\d+|Handbook|Guide|Standard|Report|Manual|Volume|Part\s+\d[a-z]?|Figure\s+[\d.]+|Sections?\s+[\d.–-]+|2010|2011|2013|2016|2019|2021)[^.!?;]{0,36}$/i;
const EXTERNAL_EN_CHAPTER_AFTER_CUE = /^\s*(?:,?\s*(?:Table|Section|Figure|§)\s*[\d.]+\s*)?(?:of|in)\s+(?:the\s+)?(?:\d{4}\s+)?(?:RIVM|LC-IMPACT|IPCC|AR6|ILCD|ecoinvent|CML|ReCiPe|GHG Protocol|UNEP|SETAC|USEtox|ISO\s+\d+|PEF|EU\b)/i;

/**
 * Blocking check: detects internal draft "Chapter N" references inside English claim prose
 * while permitting genuine external literature citations (e.g. "IPCC AR6 WGI Chapter 7",
 * "ecoinvent v3 Chapter 10", "ILCD 2010 Chapter 11", "Chapter 8 of LC-IMPACT").
 */
export function detectEnglishDraftChapterNumbers(text, label = 'text') {
  const errors = [];
  if (typeof text !== 'string') return errors;
  for (const match of text.matchAll(/\bChapter\s+\d+\b/gi)) {
    const idx = match.index ?? 0;
    const before = text.slice(Math.max(0, idx - 48), idx);
    const after = text.slice(idx + match[0].length, idx + match[0].length + 48);
    if (EXTERNAL_EN_CHAPTER_CUE.test(before) || EXTERNAL_EN_CHAPTER_AFTER_CUE.test(after)) continue;
    errors.push(`Internal draft English chapter number in ${label}: "${text.slice(Math.max(0, idx - 16), idx + match[0].length + 16)}"`);
  }
  return errors;
}

/**
 * Detects leaked Han characters in English prose outside explicitly whitelisted
 * Chinese original source titles or bilingual terminology glosses.
 */
export function detectLeakedHan(text, whitelist = [], label = 'text') {
  if (typeof text !== 'string') return [];
  let scrubbed = text;
  for (const allowed of whitelist) {
    if (typeof allowed === 'string' && allowed.length > 0) {
      scrubbed = scrubbed.replaceAll(allowed, '');
    }
  }
  const hits = scrubbed.match(/\p{Script=Han}+/gu);
  if (!hits) return [];
  return [`Leaked Han characters in English ${label}: "${hits.slice(0, 5).join(', ')}"`];
}

/**
 * Validates that links inside localized MDX/HTML stay within the same locale,
 * except for explicit language-switcher controls or documented "in-preparation" fallbacks.
 */
export function validateSameLocaleLinks(locale, hrefs, { allowedCrossLocale = new Set() } = {}) {
  const other = locale === 'zh' ? 'en' : 'zh';
  const errors = [];
  for (const href of hrefs) {
    if (typeof href !== 'string' || !href.startsWith('/')) continue;
    if (allowedCrossLocale.has(href)) continue;
    if (href === `/${other}` || href.startsWith(`/${other}/`)) {
      errors.push(`Cross-locale link in ${locale} page: ${href}`);
    }
  }
  return errors;
}

/**
 * Non-blocking advisory (or blocking once cleared): flags avoided English translations
 * registered in knowledge/editions/en/termbase.json.
 */
export function lintEnglishTermbase(text, termbase, label = 'text') {
  const warnings = [];
  if (typeof text !== 'string' || !Array.isArray(termbase?.terms)) return warnings;
  const lower = text.toLocaleLowerCase();
  for (const term of termbase.terms) {
    for (const bad of term.avoid ?? []) {
      if (typeof bad === 'string' && bad.length > 0 && lower.includes(bad.toLocaleLowerCase())) {
        warnings.push(`Avoided translation "${bad}" in ${label}; prefer "${term.en}" (${term.zh})`);
      }
    }
  }
  return warnings;
}

/**
 * Validates the parallel English edition layer against the Chinese canonical catalog
 * and alignment registry. Safe when English has 0 published chapters yet (P1 scaffold).
 */
export function validateBilingualEditions(root, catalog) {
  const errors = [];
  const warnings = [];
  const alignmentPath = join(root, 'knowledge/editions/alignment.json');
  const enClaimsPath = join(root, 'knowledge/editions/en/claims.json');
  const enNotesPath = join(root, 'knowledge/editions/en/notes.json');
  const termbasePath = join(root, 'knowledge/editions/en/termbase.json');

  if (!existsSync(alignmentPath) && !existsSync(enClaimsPath)) {
    return { errors, warnings };
  }

  const zhClaimsById = new Map((catalog?.claims ?? []).map((c) => [c.id, c]));
  const zhEvidenceIds = new Set((catalog?.evidence ?? []).map((e) => e.id));

  const alignment = existsSync(alignmentPath) ? JSON.parse(readFileSync(alignmentPath, 'utf8')) : { schemaVersion: 1, units: {} };
  const enClaimsFile = existsSync(enClaimsPath) ? JSON.parse(readFileSync(enClaimsPath, 'utf8')) : { schemaVersion: 1, claims: [] };
  const enNotesFile = existsSync(enNotesPath) ? JSON.parse(readFileSync(enNotesPath, 'utf8')) : { schemaVersion: 1, notes: [] };
  const termbase = existsSync(termbasePath) ? JSON.parse(readFileSync(termbasePath, 'utf8')) : { schemaVersion: 1, terms: [] };

  const enClaimsById = new Map();
  for (const row of enClaimsFile.claims ?? []) {
    if (!row?.id || typeof row.id !== 'string') {
      errors.push('English claim record missing string id');
      continue;
    }
    if (enClaimsById.has(row.id)) {
      errors.push(`Duplicate English claim id: ${row.id}`);
      continue;
    }
    enClaimsById.set(row.id, row);

    const zh = zhClaimsById.get(row.id);
    if (!zh) {
      errors.push(`Orphan English claim id not present in Chinese catalog: ${row.id}`);
      continue;
    }
    if (!['published', 'draft', 'pendingSync'].includes(row.status)) {
      errors.push(`Invalid English claim status for ${row.id}: ${row.status}`);
    }
    const expectedDigest = computeZhClaimDigest(zh);
    if (row.zhDigest !== expectedDigest && row.status !== 'pendingSync') {
      errors.push(`Stale English claim ${row.id}: zhDigest mismatch (expected ${expectedDigest.slice(0, 12)}, got ${String(row.zhDigest ?? '').slice(0, 12)}); update English or mark status="pendingSync"`);
    }
    if (row.status === 'published') {
      if (typeof row.text !== 'string' || !row.text.trim()) {
        errors.push(`Published English claim ${row.id} must have non-empty text`);
      }
      errors.push(...detectEnglishProcessProse(row.text, row.id));
      errors.push(...detectEnglishDraftChapterNumbers(row.text, row.id));
      errors.push(...detectLeakedHan(row.text, row.hanWhitelist ?? [], row.id));
      warnings.push(...lintEnglishTermbase(row.text, termbase, row.id));
    }
  }

  const enNotesById = new Map();
  for (const note of enNotesFile.notes ?? []) {
    if (!note?.id || !/^en-note-[a-z0-9-]+$/.test(note.id)) {
      errors.push(`Invalid English reader note id: ${note?.id}`);
      continue;
    }
    if (enNotesById.has(note.id)) {
      errors.push(`Duplicate English reader note id: ${note.id}`);
      continue;
    }
    enNotesById.set(note.id, note);
    for (const evId of note.evidenceIds ?? []) {
      if (!zhEvidenceIds.has(evId)) {
        errors.push(`English reader note ${note.id} references unknown evidenceId: ${evId}`);
      }
    }
    if (note.status === 'published') {
      errors.push(...detectEnglishProcessProse(note.text, note.id));
      errors.push(...detectLeakedHan(note.text, note.hanWhitelist ?? [], note.id));
    }
  }

  for (const [unitKey, unit] of Object.entries(alignment.units ?? {})) {
    for (const item of unit.slots ?? []) {
      if (item.kind === 'shared') {
        if (!zhClaimsById.has(item.id)) errors.push(`Alignment ${unitKey} references unknown shared claim ${item.id}`);
        if (unit.enStatus === 'published' && enClaimsById.get(item.id)?.status !== 'published' && enClaimsById.get(item.id)?.status !== 'pendingSync') {
          errors.push(`Published English unit ${unitKey} missing published English claim ${item.id}`);
        }
      } else if (item.kind === 'zh-only') {
        if (!zhClaimsById.has(item.id)) errors.push(`Alignment ${unitKey} references unknown zh-only claim ${item.id}`);
      } else if (item.kind === 'en-only') {
        if (!enNotesById.has(item.id)) errors.push(`Alignment ${unitKey} references unknown en-only note ${item.id}`);
      } else {
        errors.push(`Alignment ${unitKey} has invalid slot kind: ${item.kind}`);
      }
    }
  }

  return { errors, warnings };
}
