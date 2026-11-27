const CJK_SCRIPT_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const CJK_PUNCT_RE = /[；，、（）：。《》「」『』]/;
const EN_ZERO_INDEX_RE = /零基|0-based|zero-based|pdfIndex|pdfIndices|PDF\s*(?:zero\s*)?(?:indices|indexes|index)\s*\d|scan\s*index(?:es)?\s*\d/i;
const ZH_ZERO_INDEX_RE = /零基|0-based|zero-based|pdfIndex|pdfIndices|PDF\s*(?:zero\s*)?(?:indices|indexes|index)|scan\s*index|NEPIS\s*blocks?\d|block\d/i;

const EMPTY_BIB = { schemaVersion: 1, sources: {}, evidence: {}, passages: {} };
const bumpNums = s => s.replace(/\d+/g, n => String(Number(n) + 1));

/**
 * Formats a canonical Chinese citation locator or printed-page label for reader
 * display, converting all 0-based PDF/NEPIS/notebook indices to 1-based page
 * or unit numbers while leaving the internal verification ledger intact.
 */
export function formatZhReaderLocator(raw) {
  if (!raw || typeof raw !== 'string') return raw ?? '';
  let out = raw.includes('`') ? raw.replace(/`([^`]+)`/g, '“$1”') : raw;
  if (!ZH_ZERO_INDEX_RE.test(out)) return out;
  out = out.replace(/指定\s*(\d+)\s*个扫描页[，,]\s*见\s*pdfIndices/gi, '指定 $1 个扫描页');
  out = out.replace(/（零基索引\s*[0-9、，,–—\-]+）/g, '');
  out = out.replace(/[；;]\s*零基索引\s*[0-9、，,–—\-]+(?=）)/g, '');
  out = out.replace(/[及、，,]\s*零基\s*PDF\s*索引\s*[0-9、，,–—\-]+/g, '');
  out = out.replace(/零基\s*PDF\s*索引\s*([0-9、，,–—\-]+)/g, (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(/NEPIS\s*原\s*HTML\s*零基分页块\s*([0-9、，,–—\-]+)/g, (_, nums) => `NEPIS 原 HTML 第 ${bumpNums(nums)} 块`);
  out = out.replace(/\/block(\d+)/g, (_, n) => `/NEPIS 第 ${Number(n) + 1} 页`);
  out = out.replace(/[；;，,]\s*均为\s*NEPIS\s*零基分页块/g, '');
  out = out.replace(/NEPIS\s*零基分页块\s*([0-9、，,–—\-]+)/g, (_, nums) => `NEPIS 第 ${bumpNums(nums)} 页`);
  out = out.replace(/NEPIS\s*blocks?\s*([0-9、，,–—\-]+)/gi, (_, nums) => `NEPIS 第 ${bumpNums(nums)} 块`);
  out = out.replace(/封面块\s*(\d+)/g, (_, n) => `封面第 ${Number(n) + 1} 块`);
  out = out.replace(/scan\s*index(?:es)?\s*([0-9、，,–—\-]+)/gi, (_, nums) => `扫描第 ${bumpNums(nums)} 页`);
  out = out.replace(/\/index(\d+)/g, (_, n) => `/PDF 第 ${Number(n) + 1} 页`);
  out = out.replace(/取索引(\d+)/g, (_, n) => `位于 PDF 第 ${Number(n) + 1} 页`);
  out = out.replace(/PDF\s*零基索引\s*([0-9、，,–—\-]+)/g, (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(/PDF\s*(?:zero\s*)?(?:indices|indexes|index)\s*([0-9、，,–—\-]+)/gi, (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(/pdf(?:Indices|Index)\s*([0-9、，,–—\-]+)/g, (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(/零基单元\s*([0-9、，,–—\-]+)/g, (_, nums) => `第 ${bumpNums(nums)} 单元`);
  out = out.replace(/零基\s*([0-9、，,–—\-]+)/g, (_, nums) => `第 ${bumpNums(nums)} 单元`);
  return out;
}

export function checkEnBibliographicString(value, label) {
  if (typeof value !== 'string') return [];
  const errors = [];
  if (CJK_SCRIPT_RE.test(value)) {
    errors.push(`English bibliography leak (CJK script) in ${label}: "${value}"`);
  }
  if (CJK_PUNCT_RE.test(value)) {
    errors.push(`English bibliography leak (CJK punctuation) in ${label}: "${value}"`);
  }
  if (EN_ZERO_INDEX_RE.test(value)) {
    errors.push(`English bibliography leak (0-based index) in ${label}: "${value}"`);
  }
  return errors;
}

function resolveEnField(authored, fallback, label) {
  const value = authored ?? fallback ?? '';
  const errors = checkEnBibliographicString(value, label);
  if (errors.length) {
    throw new Error(`Missing or invalid English bibliographic entry: ${errors[0]}`);
  }
  return value;
}

export function getEnSourceTitle(source, bib = EMPTY_BIB) {
  return resolveEnField(bib.sources?.[source.id]?.title, source.title, `source.${source.id}.title`);
}

export function getEnSourcePublisher(source, bib = EMPTY_BIB) {
  return resolveEnField(bib.sources?.[source.id]?.publisher, source.publisher, `source.${source.id}.publisher`);
}

export function getEnSourceVersion(source, bib = EMPTY_BIB) {
  return resolveEnField(bib.sources?.[source.id]?.version, source.version, `source.${source.id}.version`);
}

export function getEnEvidenceLocator(evidence, bib = EMPTY_BIB) {
  return resolveEnField(bib.evidence?.[evidence.id]?.locator, evidence.locator, `evidence.${evidence.id}.locator`);
}

export function getEnPassageLocator(passage, bib = EMPTY_BIB) {
  return resolveEnField(bib.passages?.[passage.id]?.locator, passage.locator, `passage.${passage.id}.locator`);
}

export function getEnPassagePrintedPages(passage, bib = EMPTY_BIB) {
  if (!passage.printedPages) return '';
  return resolveEnField(bib.passages?.[passage.id]?.printedPages, passage.printedPages, `passage.${passage.id}.printedPages`);
}

/**
 * Fail-closed validation of knowledge/editions/en/bibliography.json against
 * catalog.json and readings.json. Rejects missing English translations,
 * leaked CJK characters/punctuation, 0-based index strings, and orphan IDs.
 */
export function validateEnBibliography(catalog, readings, bib) {
  const errors = [];
  if (!bib || bib.schemaVersion !== 1) {
    return ['knowledge/editions/en/bibliography.json requires schemaVersion: 1'];
  }
  const sourceIds = new Set((catalog?.sources ?? []).map(s => s.id));
  const evidenceIds = new Set((catalog?.evidence ?? []).map(e => e.id));
  const passageIds = new Set((readings?.readings ?? []).flatMap(r => (r.passages ?? []).map(p => p.id)));

  for (const id of Object.keys(bib.sources ?? {})) {
    if (!sourceIds.has(id)) errors.push(`Orphan source ID in en/bibliography.json: ${id}`);
  }
  for (const id of Object.keys(bib.evidence ?? {})) {
    if (!evidenceIds.has(id)) errors.push(`Orphan evidence ID in en/bibliography.json: ${id}`);
  }
  for (const id of Object.keys(bib.passages ?? {})) {
    if (!passageIds.has(id)) errors.push(`Orphan passage ID in en/bibliography.json: ${id}`);
  }

  for (const source of catalog?.sources ?? []) {
    const entry = bib.sources?.[source.id] ?? {};
    errors.push(...checkEnBibliographicString(entry.title ?? source.title ?? '', `source.${source.id}.title`));
    errors.push(...checkEnBibliographicString(entry.publisher ?? source.publisher ?? '', `source.${source.id}.publisher`));
    errors.push(...checkEnBibliographicString(entry.version ?? source.version ?? '', `source.${source.id}.version`));
  }
  for (const ev of catalog?.evidence ?? []) {
    const entry = bib.evidence?.[ev.id] ?? {};
    errors.push(...checkEnBibliographicString(entry.locator ?? ev.locator ?? '', `evidence.${ev.id}.locator`));
  }
  for (const reading of readings?.readings ?? []) {
    for (const passage of reading.passages ?? []) {
      const entry = bib.passages?.[passage.id] ?? {};
      errors.push(...checkEnBibliographicString(entry.locator ?? passage.locator ?? '', `passage.${passage.id}.locator`));
      if (passage.printedPages) {
        errors.push(...checkEnBibliographicString(entry.printedPages ?? passage.printedPages, `passage.${passage.id}.printedPages`));
      }
    }
  }
  return errors;
}
