const CJK_SCRIPT_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const CJK_PUNCT_RE = /[；，、（）：。《》「」『』]/;
const EN_ZERO_INDEX_RE = /零基|0-based|zero-based|pdfIndex|pdfIndices|PDF\s*(?:zero\s*)?(?:indices|indexes|index)\s*\d|scan\s*index(?:es)?\s*\d/i;
const ZH_ZERO_INDEX_RE = /零基|0-based|zero-based|pdfIndex|pdfIndices|PDF\s*(?:zero\s*)?(?:indices|indexes|index)|scan\s*index|NEPIS\s*blocks?\d|block\d/i;

const EMPTY_BIB = { schemaVersion: 1, sources: {}, evidence: {}, passages: {} };
const bumpNums = s => s.replace(/\d+/g, n => String(Number(n) + 1));

/**
 * Formats a canonical Chinese citation locator or printed-page label for reader
 * display, converting all 0-based PDF/NEPIS/notebook indices to 1-based page
 * or unit numbers and cleaning legacy scraper/verification artifacts while
 * leaving the internal verification ledger intact.
 */
const INDEX_SEQ = '[0-9]+(?:[、，,–—\\-]+[0-9]+)*';

function sanitizeReadingAuditLogs(raw, lang = 'zh') {
  if (!raw || typeof raw !== 'string') return raw ?? '';
  let out = raw;
  // Normalize known legacy reinspection & visual-check audit logs into clean bibliographic locators
  out = out.replace(
    /^2026-11-09\s+selected\s+original\s+reinspection;\s*physical\s+PDF\s+pages?\s+([^;]+);\s*source-relevant\s+definitions,\s*methods,\s*selected\s+rows,\s*captions\s+and\s+qualifications\s+only\.\s*Visual\s+checks\s+on\s+physical\s+pages?\s+[^.]+\.?$/i,
    (_, pages) => (lang === 'zh' ? `PDF 第 ${pages.trim()} 页（定义、方法、选定表格与适用限定）` : `PDF pp. ${pages.trim()} (definitions, methods, selected tables, and scope qualifications)`),
  );
  out = out.replace(
    /^2026-11-09\s+same-byte\s+reacquisition\s+from\s+the\s+registered\s+institutional\s+PDF\s+URL;\s*Annex1\s+printed90-101\s*\(physical114-125\),\s*text\s+read\s+throughout\s+this\s+selected\s+range;\s*printed91,95,96\s+rendered\s+and\s+visually\s+inspected\.\s*Equation5\s+annual-interval\s+integral\s+and\s+Equation6\s+elapsed-time\s+combination\s+checked\s+separately\.?$/i,
    () => (lang === 'zh' ? 'Annex 1 印刷 pp. 90–101（PDF 第 114–125 页）；Equation 5 年间隔积分与 Equation 6 历时组合' : 'Annex 1, pp. 90–101 (PDF pp. 114–125); Equation 5 (annual-interval integral) and Equation 6 (elapsed-time combination)'),
  );
  out = out.replace(
    /^2026-11-09\s+same-byte\s+reacquisition\s+and\s+selected\s+reinspection\s+of\s+title\s+page\s+and\s+p\.3\s+imprint\.\s*Visually\s+verified\s+the\s+acquired\s+p\.3\.?$/i,
    () => (lang === 'zh' ? '扉页与第 3 页版权页（title page and p. 3 imprint）' : 'Title page and p. 3 imprint'),
  );
  out = out.replace(
    /^2026-11-09\s+same-byte\s+reacquisition\s+and\s+selected\s+reinspection\.\s*/i,
    '',
  );
  out = out.replace(
    /^2026-11-09\s+same-byte\s+selected\s+reinspection\s+of\s+/i,
    '',
  );
  out = out.replace(
    /^2026-11-09\s+main\s+selected\s+(?:text\s+)?reinspection,\s*/i,
    '',
  );
  out = out.replace(
    /^2026-11-12\s+dated\s+selected\s+reinspection:\s*/i,
    '',
  );
  out = out.replace(/^\d{4}-\d{2}-\d{2}\s*重新选读：/, '');
  out = out.replace(/;\s*sideways\s+scans\s+visually\s+inspected\b/gi, '');
  out = out.replace(/\s*Text\s+read\s+directly\s+from\s+same-byte\s+acquired\s+PDF;\s*image\s+p(\d+)\s+separately\s+confirms\s+the\s+human\s+chain\.\s*Exact\s+intake-pathway\s+to\s+intake-route\s+aggregation\s+on\s+pp29–30\s+read\s+before\s+authoring\.?/i, ' PDF p. $1; pp. 29–30 (intake-pathway to intake-route aggregation).');
  out = out.replace(/\s*All\s+selected\s+text\s+reread[;.]?\s*/gi, ' ');
  out = out.replace(/\bAnnex2\s+complete\s+selected\s+text\s+reread[;.]?\s*/gi, 'Annex 2; ');
  out = out.replace(/;\s*all\s+selected\s+text\s+reread\.?\s*/gi, '. ');
  out = out.replace(/\b[Pp]rinted(\d+)\s+and(\d+)\s+images?\s+inspected,\s*including\s+/g, 'pp. $1 and $2 (including ');
  out = out.replace(/\b[Pp]rinted(\d+(?:[,–-]\d+)*)\s+images?\s+inspected,\s*including\s+/g, 'pp. $1 (including ');
  out = out.replace(/\b[Pp]rinted(\d+)\s+image\s+inspected\.?/g, 'p. $1.');
  out = out.replace(/\(including\s+([^).]+)\./g, '(including $1).');
  out = out.replace(/[;；]\s*visually\s+checked\b/gi, '');
  out = out.replace(/\s*\(visually\s+checked\)/gi, '');
  out = out.replace(/\s*Visually\s+(?:checked|verified)\s+[^.]+\.?/gi, '');
  out = out.replace(/；两页完整文本与页面图像核对/g, '');
  out = out.replace(/；另用p19\/索引30图像交叉核对Lambda；p30完整图像核对Eq2\.64与Eq2\.66/g, '；p19（PDF 第 31 页）Lambda 与 p30 Eq2.64、Eq2.66');
  out = out.replace(/；横置页图像核对/g, '');
  out = out.replace(/；图像核对/g, '');
  out = out.replace(/页面图像核对|图像核对/g, '');
  out = out.replace(/p2151图像核实了该字样，但未回读2001原模型/g, 'p. 2151 载有该字样，未核读 2001 原模型');
  out = out.replace(/；p22图像核查/g, '');
  out = out.replace(/图像核查|图像核实/g, '');
  out = out.replace(/，提取文本去空白比对也相同/g, '');
  out = out.replace(/（视觉核对）/g, '');
  out = out.replace(/；视觉核对(?=）)/g, '');
  out = out.replace(/旋转图像视觉核对\s*/g, '涵盖');
  out = out.replace(/；(?:氧化公式|比较指标表)视觉核对/g, '');
  out = out.replace(/视觉核对/g, '');
  out = out.replace(/；\s*$/, '').replace(/\s{2,}/g, ' ').trim();
  return out;
}

export function formatZhReaderLocator(raw) {
  if (!raw || typeof raw !== 'string') return raw ?? '';
  let out = raw.includes('`') ? raw.replace(/`([^`]+)`/g, '“$1”') : raw;
  // Clean legacy scraper CSS selectors, internal visual-check/reinspection logs, and missing spaces
  out = out.replace(
    /h2\.subheader\s+Abstract\s+followed\s+by\s+\.rendering_researchoutput_abstractportal\s+\.textblock\s*>\s*p[;；]?/gi,
    '公开摘要正文（Abstract）；',
  );
  out = sanitizeReadingAuditLogs(out, 'zh');
  out = out.replace(/\b(printed|sentences|Tables|Figures|Figure)(\d)/g, '$1 $2');
  out = out.replace(/\bTable(\d+)\s+row([A-Z])\b/g, 'Table $1 row $2');
  out = out.replace(/\bTable(\d+)\s+caption\b/g, 'Table $1 caption');
  out = out.replace(/\b(Eqs?\.)(\d)/g, '$1 $2');
  if (!ZH_ZERO_INDEX_RE.test(out)) return out;
  out = out.replace(/指定\s*(\d+)\s*个扫描页[，,]\s*见\s*pdfIndices/gi, '指定 $1 个扫描页');
  out = out.replace(new RegExp(`（零基索引\\s*${INDEX_SEQ}）`, 'g'), '');
  out = out.replace(new RegExp(`[；;]\\s*零基索引\\s*${INDEX_SEQ}(?=）)`, 'g'), '');
  out = out.replace(new RegExp(`[及、，,]\\s*零基\\s*PDF\\s*索引\\s*${INDEX_SEQ}`, 'g'), '');
  out = out.replace(new RegExp(`零基\\s*PDF\\s*索引\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(new RegExp(`NEPIS\\s*原\\s*HTML\\s*零基分页块\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `NEPIS 原 HTML 第 ${bumpNums(nums)} 块`);
  out = out.replace(/\/block(\d+)/g, (_, n) => `/NEPIS 第 ${Number(n) + 1} 页`);
  out = out.replace(/[；;，,]\s*均为\s*NEPIS\s*零基分页块/g, '');
  out = out.replace(new RegExp(`NEPIS\\s*零基分页块\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `NEPIS 第 ${bumpNums(nums)} 页`);
  out = out.replace(new RegExp(`NEPIS\\s*blocks?\\s*(${INDEX_SEQ})`, 'gi'), (_, nums) => `NEPIS 第 ${bumpNums(nums)} 块`);
  out = out.replace(/封面块\s*(\d+)/g, (_, n) => `封面第 ${Number(n) + 1} 块`);
  out = out.replace(new RegExp(`scan\\s*index(?:es)?\\s*(${INDEX_SEQ})`, 'gi'), (_, nums) => `扫描第 ${bumpNums(nums)} 页`);
  out = out.replace(/\/index(\d+)/g, (_, n) => `/PDF 第 ${Number(n) + 1} 页`);
  out = out.replace(/取索引(\d+)/g, (_, n) => `位于 PDF 第 ${Number(n) + 1} 页`);
  out = out.replace(new RegExp(`PDF\\s*零基索引\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(new RegExp(`PDF\\s*零基\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(new RegExp(`PDF\\s*(?:zero\\s*)?(?:indices|indexes|index)\\s*(${INDEX_SEQ})`, 'gi'), (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(new RegExp(`pdf(?:Indices|Index)\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `PDF 第 ${bumpNums(nums)} 页`);
  out = out.replace(new RegExp(`零基单元\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `第 ${bumpNums(nums)} 单元`);
  out = out.replace(new RegExp(`零基\\s*(${INDEX_SEQ})`, 'g'), (_, nums) => `第 ${bumpNums(nums)} 单元`);
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

function cleanEnDisplayLocator(value) {
  return sanitizeReadingAuditLogs(value, 'en');
}

export function getEnEvidenceLocator(evidence, bib = EMPTY_BIB) {
  return cleanEnDisplayLocator(resolveEnField(bib.evidence?.[evidence.id]?.locator, evidence.locator, `evidence.${evidence.id}.locator`));
}

export function getEnPassageLocator(passage, bib = EMPTY_BIB) {
  return cleanEnDisplayLocator(resolveEnField(bib.passages?.[passage.id]?.locator, passage.locator, `passage.${passage.id}.locator`));
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
