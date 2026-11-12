import { collectChapterClaimOccurrences } from './reader-book.mjs';
import { concealedText } from './reader-data-applicability.mjs';

const proseLine = /^<Prose ids="[^"]+"\s*\/>$/;
const plainText = value => typeof value === 'string' && Boolean(value.trim())
  && !/[<>{}\[\]`*_\\]/.test(value) && !value.includes('\n');
export const removeReviewedProse = body => body.replace(/<Prose ids="[^"]+"\s*\/>/g, '');
export const blocksReaderText = node => concealedText(node) || Boolean(node.closest('details:not([open]),template'));

/** Parse only a bounded Markdown table and its two prose blocks between known claims. */
export function inspectReviewedStaticTable(body, { previousClaim, nextClaim, rowCount }) {
  const blocks = body.trim().split(/\n[ \t]*\n/);
  const start = blocks.findIndex(block => !proseLine.test(block));
  if (start < 1 || start + 3 >= blocks.length || !blocks.slice(start + 3).every(block => proseLine.test(block))
      || collectChapterClaimOccurrences(blocks[start - 1]).at(-1) !== previousClaim
      || collectChapterClaimOccurrences(blocks[start + 3])[0] !== nextClaim
      || !plainText(blocks[start]) || !plainText(blocks[start + 2])) return null;
  const rows = blocks[start + 1].split('\n').map(line => {
    if (!line.startsWith('|') || !line.endsWith('|')) return [];
    return line.slice(1, -1).split('|').map(cell => cell.trim());
  });
  if (rows.length !== rowCount + 2 || rows.some(row => row.length !== 3 || row.some(cell => !plainText(cell)))
      || !rows[1].every(cell => cell === '---')) return null;
  return { introduction: blocks[start], headers: rows[0], rows: rows.slice(2), explanation: blocks[start + 2] };
}

const childElements = node => node?.childNodes.filter(child => child.nodeType === 1) ?? [];
const tableContainer = (node, tag) => node?.tagName === tag
  && node.childNodes.every(child => child.nodeType === 1 || child.nodeType === 3 && !child.text.trim());
const noAlternateLabel = node => !['title', 'aria-label', 'aria-labelledby', 'aria-describedby'].some(attr => node.hasAttribute(attr));
const plainRenderedText = (node, tag, expected) => node?.tagName === tag && node.text === expected
  && node.childNodes.every(child => child.nodeType === 3) && noAlternateLabel(node) && !blocksReaderText(node);

function matchesStudyCells(row, tag, values) {
  const cells = childElements(row);
  return tableContainer(row, 'TR') && cells.length === values.length
    && cells.every((cell, index) => plainRenderedText(cell, tag, values[index])
      && !cell.hasAttribute('rowspan') && !cell.hasAttribute('colspan')
      && (tag === 'TH' ? !cell.hasAttribute('scope') || cell.getAttribute('scope') === 'col' : !cell.hasAttribute('scope')));
}

export function validateReviewedStaticTable(unit, path, expected, { name, section: expectedSection, previousClaim, nextClaim }) {
  const tables = unit.querySelectorAll('table');
  const checked = new Set(), errors = [];
  if (!expected) {
    if (tables.length) errors.push(`${path}: ${name} unreviewed table`);
    return { checked, errors };
  }
  const [table] = tables;
  const [header, body] = childElements(table);
  const headings = childElements(header);
  const rows = childElements(body);
  if (tables.length !== 1 || !tableContainer(table, 'TABLE') || !noAlternateLabel(table)
      || blocksReaderText(table) || childElements(table).length !== 2
      || !tableContainer(header, 'THEAD') || headings.length !== 1
      || !matchesStudyCells(headings[0], 'TH', expected.headers)
      || !tableContainer(body, 'TBODY') || rows.length !== expected.rows.length
      || !rows.every((row, index) => matchesStudyCells(row, 'TD', expected.rows[index]))) {
    errors.push(`${path}: ${name} table headers, cells, structure or visibility differ`);
    return { checked, errors };
  }

  const exclusions = '.chapter-notes,.docs-pagination,[data-legacy-for],[data-legacy-notice],[data-legacy-scope]';
  const sequence = unit.querySelectorAll('[data-reader-heading-key],p,table,a[role="doc-noteref"]')
    .filter(node => !node.closest(exclusions) && (node.tagName !== 'P' || !node.querySelector('a[role="doc-noteref"]')));
  const index = sequence.indexOf(table);
  const intro = sequence[index - 1], explanation = sequence[index + 1];
  const section = sequence.slice(0, index).findLast(node => node.hasAttribute('data-reader-heading-key'));
  if (index < 2 || section?.getAttribute('data-reader-heading-key') !== expectedSection
      || sequence[index - 2]?.getAttribute('data-reader-reference') !== previousClaim
      || sequence[index + 2]?.getAttribute('data-reader-reference') !== nextClaim
      || !plainRenderedText(intro, 'P', expected.introduction)
      || !plainRenderedText(explanation, 'P', expected.explanation)) {
    errors.push(`${path}: ${name} study table or ordinary explanations differ in text, position or visibility`);
    return { checked, errors };
  }
  checked.add(intro).add(table).add(explanation);
  return { checked, errors };
}
