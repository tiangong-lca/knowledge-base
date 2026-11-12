import { citationHref, citationSourceHref } from './reader-citations.mjs';

export function readerParagraphText(node, marker) {
  if (node === marker) return '';
  if (node.nodeType === 3) return node.text;
  return node.nodeType === 1 ? node.childNodes.map(child => readerParagraphText(child, marker)).join('') : '';
}

const qualifiedCurrentHistory = new WeakMap();
const identity = row => `${row.path}#${row.id}`;

/** Bind amended history to the independently parsed output document. */
export function qualifyCurrentHistoricalDocument(document, entries, migrations) {
  if (!migrations?.length) return;
  const amended = new Set(migrations.map(row => row.address));
  const byAddress = new Map(entries.filter(entry => amended.has(identity(entry))).map(entry => [identity(entry), entry]));
  qualifiedCurrentHistory.set(document, byAddress);
  for (const article of document.querySelectorAll('article[data-reader-route]')) qualifiedCurrentHistory.set(article, byAddress);
}

export function applyCurrentHistoricalEntries(document, entries) {
  const current = qualifiedCurrentHistory.get(document);
  return current ? entries.map(entry => current.get(identity(entry)) ?? entry) : entries;
}

/** Exact allowed historical text, rather than a blanket exemption for notices. */
export function validateReaderHistoricalText(unit, entries, path, label) {
  const checked = new Set(), errors = [], compact = value => value.replace(/\s+/g, '');
  const byId = new Map(entries.filter(entry => entry.path === path).map(entry => [entry.id, entry]));
  const current = qualifiedCurrentHistory.get(unit);
  for (const entry of current?.values() ?? []) {
    if (entry.path === path) byId.set(entry.id, entry);
  }
  const versionText = edition => `此链接按 ${edition.sourceDate} 留存文本定位。其他历史版本的引用需核对各自源文件。查看这一版本的源文件`;
  for (const node of unit.querySelectorAll('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')) {
    const scopeId = node.getAttribute('data-legacy-scope'), entry = byId.get(scopeId ?? node.id);
    const alias = node.hasAttribute('data-legacy-for'), notice = node.hasAttribute('data-legacy-notice');
    const valid = entry && (alias ? entry.mode === 'alias' && node.getAttribute('data-legacy-for') === entry.targets[0].id : notice ? entry.mode === 'notice' : entry.mode === 'retained' && entry.scope);
    const targets = entry ? alias ? [] : scopeId ? entry.scope?.targets ?? [] : entry.targets : [];
    const explanation = entry ? alias ? '' : entry.scope?.text ?? '可从下列链接查阅这一留存版本对应的内容。' : '';
    const expected = entry ? versionText(entry.edition) + explanation + targets.map(target => target.label ?? label(target)).join('') : '';
    const hrefs = entry ? [citationSourceHref(entry.edition.sourceCommit), ...targets.map(target => citationHref(target, path))] : [];
    if (!valid || compact(node.text) !== compact(expected) || JSON.stringify(node.querySelectorAll('a').map(link => link.getAttribute('href'))) !== JSON.stringify(hrefs))
      errors.push(`${path}: historical output context has unexpected content or identity`);
    else checked.add(node);
  }
  return { checked, errors };
}
