import { citationHref, citationSourceHref } from './reader-citations.mjs';

export function readerParagraphText(node, marker) {
  if (node === marker) return '';
  if (node.nodeType === 3) return node.text;
  return node.nodeType === 1 ? node.childNodes.map(child => readerParagraphText(child, marker)).join('') : '';
}

const qualifiedCurrentHistory = new WeakMap();
const identity = row => `${row.path}#${row.id}`;

/** Bind amended history to the independently parsed output document. */
export function qualifyCurrentHistoricalDocument(document, entries, migrations, surfaces) {
  if (!migrations?.length) return;
  const byAddress = new Map(entries.map(entry => [identity(entry), entry]));
  const currentLabel = target => {
    const actual = surfaces.get(target.path)?.ids.get(target.id);
    if (!actual || actual.route !== target.route) return null;
    if (target.kind === 'note') return actual.claimId === target.claimId && actual.number
      ? `《${actual.title}》注 ${actual.number}` : null;
    if (target.kind === 'heading') return actual.section
      ? `《${actual.title}》${actual.visibleHeading ? `·${actual.visibleHeading}` : ''}` : null;
    return `《${actual.title}》${target.kind === 'note-group' ? '注释' : ''}`;
  };
  const context = { byAddress, currentLabel };
  qualifiedCurrentHistory.set(document, context);
  for (const article of document.querySelectorAll('article[data-reader-route]')) qualifiedCurrentHistory.set(article, context);
}

export function applyCurrentHistoricalEntries(document, entries) {
  const current = qualifiedCurrentHistory.get(document);
  return current ? entries.map(entry => current.byAddress.get(identity(entry)) ?? entry) : entries;
}

/**
 * Check the whole numbered document, including units without a specialized
 * chapter guard. Structural attachment and all destinations are also checked
 * by the citation surface verifier.
 */
export function validateCurrentHistoricalContexts(document, entries, path) {
  const context = qualifiedCurrentHistory.get(document);
  if (!context) throw new Error('Historical output requires independently qualified destination surfaces');
  const errors = validateReaderHistoricalText(document, entries, path, context.currentLabel).errors;
  for (const node of document.querySelectorAll('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')) {
    const id = node.getAttribute('data-legacy-scope') ?? node.id;
    const entry = context.byAddress.get(`${path}#${id}`);
    if (!entry) continue; // The exact text verifier rejects unknown contexts.
    const expectedOwner = entry.mode === 'alias' ? entry.targets[0].route : entry.route;
    const owner = node.closest('article[data-reader-route]')?.getAttribute('data-reader-route');
    if (owner !== expectedOwner || (entry.mode === 'notice' && node.closest('.chapter-notes')))
      errors.push(`${path}: historical output context has the wrong reading unit: ${id}`);
  }
  return errors;
}

/** Exact allowed historical text, rather than a blanket exemption for notices. */
export function validateReaderHistoricalText(unit, entries, path, label) {
  const checked = new Set(), errors = [], compact = value => value.replace(/\s+/g, '');
  const byId = new Map(entries.filter(entry => entry.path === path).map(entry => [entry.id, entry]));
  const current = qualifiedCurrentHistory.get(unit);
  for (const entry of current?.byAddress.values() ?? []) {
    if (entry.path === path) byId.set(entry.id, entry);
  }
  const versionText = edition => `此链接按 ${edition.sourceDate} 留存文本定位。其他历史版本的引用需核对各自源文件。查看这一版本的源文件`;
  for (const node of unit.querySelectorAll('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')) {
    const scopeId = node.getAttribute('data-legacy-scope'), entry = byId.get(scopeId ?? node.id);
    const alias = node.hasAttribute('data-legacy-for'), notice = node.hasAttribute('data-legacy-notice');
    const valid = entry && (alias ? entry.mode === 'alias' && node.getAttribute('data-legacy-for') === entry.targets[0].id : notice ? entry.mode === 'notice' : entry.mode === 'retained' && entry.scope);
    const targets = entry ? alias ? [] : scopeId ? entry.scope?.targets ?? [] : entry.targets : [];
    const explanation = entry ? alias ? '' : entry.scope?.text ?? '可从下列链接查阅这一留存版本对应的内容。' : '';
    const labels = targets.map(target => target.label ?? (current ? current.currentLabel(target) : label(target)));
    const expected = entry ? versionText(entry.edition) + explanation + labels.join('') : '';
    const hrefs = entry ? [citationSourceHref(entry.edition.sourceCommit), ...targets.map(target => citationHref(target, path))] : [];
    if (!valid || labels.some(value => value === null) || compact(node.text) !== compact(expected) || JSON.stringify(node.querySelectorAll('a').map(link => link.getAttribute('href'))) !== JSON.stringify(hrefs))
      errors.push(`${path}: historical output context has unexpected content or identity: ${scopeId ?? node.id}`);
    else checked.add(node);
  }
  return { checked, errors };
}
