import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTERNAL_CHAPTER_PRECEDING_CUE = /(?:指南|报告|标准|导则|手册|规范|论文|著作|卷|IPCC|AR6|RIVM|LC-IMPACT|ecoinvent|ILCD|GHG Protocol|CML|ReCiPe|UNEP|SETAC|USEtox|Part\s*\d[a-z]?|2011\s*年|2010|2013|2016|2019|2021)[^。！？；]{0,28}$/i;
const EXTERNAL_CHAPTER_FOLLOWING_CUE = /^\s*(?:图\s*\d|表\s*\d|第\s*\d+\s*节)/;
const RETIRED_SPLIT_CHAPTER_TITLES = [
  '评价框架的形成',
  '四个分析步骤',
  '副产与共同生产',
  '分配与替代',
  '气候等效与指标',
  '排放时间与评价',
  '过程数据的用途',
  '数据审查与版本',
  '判断依据与修订',
  '修订与可更新判断',
];

/**
 * Blocking check: detects internal draft chapter-number leaks (e.g. "沿用第29章完整墙面例")
 * and retired pre-merge split chapter titles inside catalog claims while permitting genuine
 * external literature chapter citations (e.g. "ecoinvent v3 第 10 章", "ILCD 2010 第 11 章").
 */
export function detectInternalDraftChapterNumbers(catalog) {
  const errors = [];
  for (const claim of catalog?.claims ?? []) {
    const text = claim?.text ?? '';
    for (const match of text.matchAll(/第\s*\d+\s*章/g)) {
      const idx = match.index ?? 0;
      const before = text.slice(Math.max(0, idx - 36), idx);
      const after = text.slice(idx + match[0].length, idx + match[0].length + 18);
      if (EXTERNAL_CHAPTER_PRECEDING_CUE.test(before) || EXTERNAL_CHAPTER_FOLLOWING_CUE.test(after)) {
        continue;
      }
      errors.push(`Internal draft chapter number leak in ${claim.id}: "${text.slice(Math.max(0, idx - 12), idx + match[0].length + 12)}"`);
    }
    for (const retiredTitle of RETIRED_SPLIT_CHAPTER_TITLES) {
      if (text.includes(`《${retiredTitle}》`)) {
        errors.push(`Retired pre-merge chapter title in ${claim.id}: "《${retiredTitle}》"`);
      }
    }
  }
  return errors;
}

const TRACKED_ACRONYMS = ['PEFCR', 'DQR', 'HDPE', 'LDPE', 'CTUe', 'CTUh', 'DALY', 'FaIR', 'IAM', 'SDF'];

/**
 * Non-blocking advisory checks for editorial readability reviews:
 * - Unexpanded rare acronyms within a claim/chapter
 * - Dense paragraphs exceeding maxLength characters (default 500)
 */
export function lintReadabilityAdvisories(catalog, { maxParagraphLength = 500 } = {}) {
  const warnings = [];
  for (const claim of catalog?.claims ?? []) {
    const text = claim?.text ?? '';
    if (text.length > maxParagraphLength) {
      warnings.push({ kind: 'long-paragraph', claimId: claim.id, length: text.length });
    }
    for (const ac of TRACKED_ACRONYMS) {
      const rx = new RegExp(`\\b${ac}\\b`);
      if (rx.test(text) && !text.includes(`（${ac}）`) && !text.includes(`(${ac})`)) {
        warnings.push({ kind: 'unexpanded-acronym', claimId: claim.id, acronym: ac });
      }
    }
  }
  return warnings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));
  const blocking = detectInternalDraftChapterNumbers(catalog);
  const warnings = lintReadabilityAdvisories(catalog);
  const longCount = warnings.filter(w => w.kind === 'long-paragraph').length;
  const acronymCount = warnings.filter(w => w.kind === 'unexpanded-acronym').length;
  console.log(`Quality lint: ${blocking.length} blocking errors; ${longCount} long-paragraph advisories (>500 chars); ${acronymCount} unexpanded-acronym advisories.`);
  if (blocking.length) {
    console.error(blocking.join('\n'));
    process.exit(1);
  }
}
