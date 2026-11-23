/**
 * Boundary-safe English bibliographic formatter for canonical Chinese-annotated
 * source versions, publishers, evidence locators, printed-page strings, and
 * concept display labels. Never runs bare single-character CJK substitutions
 * inside arbitrary words.
 */

const SAFE_PHRASE_MAP: ReadonlyArray<readonly [RegExp, string]> = [
  // Multi-character bibliographic phrases (longest first)
  [/各段前后四行必要上下文/g, 'with surrounding context'],
  [/引用此报告页码/g, 'citing report pagination'],
  [/标签对应提交/g, 'tag commit'],
  [/模型数据版本/g, 'model data version'],
  [/和引用属性/g, 'and citation attributes'],
  [/版本属性/g, 'version attributes'],
  [/欧盟官方公报/g, 'Official Journal of the European Union'],
  [/官方登记记录/g, 'official registry record'],
  [/开放获取期刊论文/g, 'open-access journal article'],
  [/作者公开样章/g, 'author public sample chapter'],
  [/著作的作者公开样章/g, 'author public sample chapter of the monograph'],
  [/出版商原件/g, 'publisher original'],
  [/期刊出版定稿/g, 'published journal version of record'],
  [/首次在线发表/g, 'first published online'],
  [/首次在线/g, 'first published online'],
  [/在线发表/g, 'published online'],
  [/正式发布/g, 'officially published'],
  [/正式版/g, 'official release'],
  [/正式/g, 'official'],
  [/原始发行所附技术指南/g, 'technical guide accompanying original release'],
  [/学位论文再印载体/g, 'dissertation reprint carrier'],
  [/致谢再印载体/g, 'reprint carrier'],
  [/再印文章发表于/g, 'reprinted article originally published in'],
  [/引文页码采用学位论文/g, 'citing dissertation pagination'],
  [/同一作者载体后接/g, 'followed in the same author carrier by'],
  [/译本实际刊印日期未核实/g, 'translation print date unverified'],
  [/未编号题名页/g, 'unnumbered title page'],
  [/未编号前置页/g, 'unnumbered front matter'],
  [/未编号/g, 'unnumbered '],
  [/版权与免责声明/g, 'Copyright & Disclaimer'],
  [/PDF\s*零基索引/g, 'PDF 0-based index '],
  [/零基分页块/g, '0-based page block '],
  [/零基索引/g, '0-based index '],
  [/视觉核对/g, 'visually verified'],
  [/选读日期/g, 'read date '],
  [/发布日期/g, 'published '],
  [/实施日期/g, 'effective '],
  [/收稿日期/g, 'received '],
  [/报告署期/g, 'report dated '],
  [/报告完成于/g, 'report completed '],
  [/前言落款/g, 'preface dated '],
  [/标准状态/g, 'standard status'],
  [/版本关联/g, 'version relation'],
  [/基础信息/g, 'basic metadata'],
  [/标准号/g, 'standard number'],
  [/原报告目录/g, 'original report contents'],
  [/页面底部/g, 'bottom of page'],
  [/附件一/g, 'Annex I '],
  [/附件二/g, 'Annex II '],
  [/附件三/g, 'Annex III '],
  [/附件/g, 'Annex '],
  [/附录/g, 'Appendix '],
  [/概念框及表/g, 'concept box and Table '],
  [/概念框/g, 'concept box'],
  [/作者稿/g, 'author manuscript '],
  [/原刊/g, 'original journal '],
  [/原文/g, 'original text '],
  [/原作托管副本/g, 'hosted copy of original work'],
  [/存档期刊文本/g, 'archived journal text'],
  [/实际期刊/g, 'actual journal '],
  [/实际文章/g, 'actual article '],
  [/英文译本/g, 'English translation'],
  [/英文序言回顾/g, 'English preface review'],
  [/英文版/g, 'English edition'],
  [/再印本/g, 'reprint'],
  [/重印本/g, 'reprint'],
  [/电子版/g, 'electronic edition'],
  [/公开机构版/g, 'public institutional edition'],
  [/官方版/g, 'official edition'],
  [/学位论文/g, 'dissertation'],
  [/论文再印/g, 'thesis reprint'],
  [/另有勘误/g, 'with erratum'],
  [/另参照/g, 'also referencing '],
  [/更正前数据/g, 'pre-erratum data'],
  [/勘误/g, 'erratum'],
  [/数据年/g, 'data year '],
  [/题叶署/g, 'title leaf dated '],
  [/题名页/g, 'title page'],
  [/封面块/g, 'cover block'],
  [/封面/g, 'cover'],
  [/目录/g, 'table of contents'],
  [/摘要/g, 'abstract'],
  [/结论/g, 'conclusion'],
  [/主文/g, 'main text'],
  [/正文/g, 'main text'],
  [/工作表/g, 'worksheet '],
  [/表头/g, 'table header'],
  [/表注/g, 'table note'],
  [/图注/g, 'figure caption'],
  [/脚注/g, 'footnote'],
  [/行与表注/g, 'rows and table notes'],
  [/汇总行/g, 'summary row'],
  [/最后一段/g, 'final paragraph'],
  [/开头/g, 'opening'],
  [/续页/g, 'ff.'],
  [/选段/g, 'excerpt'],
  [/重点/g, 'key passage'],
  [/元数据/g, 'metadata'],
  [/物理页/g, 'physical p. '],
  [/物理第\s*([0-9–—\-]+)\s*页/g, 'physical p. $1'],
  [/印刷页\s*/g, 'print p. '],
  [/印刷第\s*([0-9–—\-]+)\s*页/g, 'print p. $1'],
  [/印第\s*([0-9–—\-]+)\s*页/g, 'print p. $1'],
  [/印页\s*/g, 'print p. '],
  [/印刷\s*(pp?\.?\s*[0-9])/g, 'print $1'],
  [/印\s*(pp?\.?\s*[0-9])/g, 'print $1'],
  [/第\s*([0-9]+)\s*卷第\s*([0-9]+)\s*期/g, 'Vol. $1, No. $2'],
  [/第\s*([0-9A-Za-z.\-–—]+)\s*章/g, 'Chapter $1'],
  [/第\s*([0-9A-Za-z.\-–—]+)\s*节/g, 'Section $1'],
  [/第\s*([0-9A-Za-z.\-–—]+)\s*条/g, 'Article $1'],
  [/第\s*([0-9A-Za-z.\-–—]+)\s*页/g, 'p. $1'],
  [/第\s*([0-9A-Za-z.\-–—]+)\s*行/g, 'line $1'],
  [/第\s*([0-9A-Za-z.\-–—]+)\s*列/g, 'col. $1'],
  [/第\s*([0-9A-Za-z.\-–—]+)\s*栏/g, 'col. $1'],
  [/([0-9]{4})\s*年版/g, '$1 edition'],
  [/([0-9]{4})\s*年\s*([0-9]{1,2})\s*月/g, '$1-$2'],
  [/([0-9]{4})\s*年/g, '$1'],
  // Only match 表/图/式 when immediately followed by a digit or equation paren (never inside words like 正式/发表)
  [/(?<![\u4e00-\u9fff])表\s*([0-9][0-9A-Za-z.\-–—]*)/g, 'Table $1'],
  [/(?<![\u4e00-\u9fff])图\s*([0-9][0-9A-Za-z.\-–—]*)/g, 'Figure $1'],
  [/(?<![\u4e00-\u9fff])式\s*([\(（]?[0-9][0-9A-Za-z.\-–—]*[\)）]?)/g, 'Eq. $1'],
];

const CJK_RE = /[\u4e00-\u9fff]/;

function normalizePunctuation(input: string): string {
  return input
    .replace(/；/g, '; ')
    .replace(/，/g, ', ')
    .replace(/、/g, ', ')
    .replace(/：/g, ': ')
    .replace(/（/g, ' (')
    .replace(/）/g, ') ')
    .replace(/。/g, '. ')
    .replace(/\b(pp?|Eqs?|Figs?|Tables?|Secs?)(?=\d)/g, '$1. ')
    .replace(/\s+([,;:.?!)])/g, '$1')
    .replace(/(\()\s+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\s*\.\s*/g, '. ')
    .trim();
}

/**
 * Remove pure-CJK editorial clauses/parentheticals after safe structured tokens
 * have been converted, while preserving a readable fallback if the entire string
 * is a Chinese publication title or publisher.
 */
function stripUntranslatedCjkClauses(text: string): string {
  if (!CJK_RE.test(text)) return text;
  // Drop parentheticals that still contain CJK
  let cleaned = text.replace(/\s*\([^)]*[\u4e00-\u9fff][^)]*\)/g, '');
  // Split on semicolons and keep clauses without residual CJK
  const parts = cleaned
    .split(/;\s*/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !CJK_RE.test(p));
  if (parts.length > 0) {
    return parts.join('; ');
  }
  // Try comma-level filtering if semicolon-level left nothing
  const commaParts = cleaned
    .split(/,\s*/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !CJK_RE.test(p));
  if (commaParts.length > 0) {
    return commaParts.join(', ');
  }
  // Fallback: keep original normalized string (e.g., genuine Chinese journal publisher name)
  return text;
}

export function formatEnBibliographicText(raw: string | undefined | null): string {
  if (!raw) return '';
  let out = raw;
  if (CJK_RE.test(out)) {
    for (const [pattern, replacement] of SAFE_PHRASE_MAP) {
      out = out.replace(pattern, replacement);
    }
  }
  out = normalizePunctuation(out);
  return stripUntranslatedCjkClauses(out);
}

export function formatEnConceptTitle(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw
    .replace(/\bthe1974container\b/g, 'the 1974 container')
    .replace(/\bthe1974REPA\b/g, 'the 1974 REPA')
    .replace(/([a-z])(19\d\d|20\d\d)([A-Za-z])/g, '$1 $2 $3');
}
