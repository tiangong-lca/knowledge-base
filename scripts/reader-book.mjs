/** Public document routes only; a trailing slash does not create another page. */
const routeKey = url => typeof url === 'string' && /^\/(?!\/)/.test(url)
  ? url.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/' : null;

/**
 * The navigation tree is the sole order authority. Folder indexes precede their
 * children; separators, external links and pages outside this tree are excluded.
 * @template {{ url: string }} T
 * @param {any} tree
 * @param {T[]} pages
 * @returns {T[]}
 */
export function orderPages(tree, pages) {
  const available = new Map(pages.map(page => [routeKey(page.url), page]));
  const seen = new Set(), ordered = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'page') {
      const key = node.external ? null : routeKey(node.url);
      if (key && available.has(key) && !seen.has(key)) { seen.add(key); ordered.push(available.get(key)); }
      return;
    }
    if (node.type === 'separator') return;
    if (node.type === 'folder') visit(node.index);
    for (const child of Array.isArray(node.children) ? node.children : []) visit(child);
  }
  visit(tree);
  return ordered;
}

/** @template {{ slugs: string[] }} T @param {T[]} pages @returns {T[]} */
export function bookChapters(pages) {
  return pages.filter(page => page.slugs[0] === 'book' && page.slugs.length > 1);
}

const blank = text => text.replace(/[^\n]/g, ' ');
function maskCode(raw) {
  // getText('raw') includes frontmatter, which is metadata rather than prose.
  let source = raw.replace(/^\uFEFF?---[^\S\n]*\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[^\S\n]*(?:\r?\n|$)/, blank);
  let fence = null;
  source = source.split(/(?<=\n)/).map(line => {
    const marker = /^(?: {0,3}>[ \t]?)* {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n)?$/.exec(line);
    if (fence) {
      if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      return blank(line);
    }
    if (marker && (marker[1][0] !== '`' || !marker[2].includes('`'))) {
      fence = { char: marker[1][0], length: marker[1].length };
      return blank(line);
    }
    return line;
  }).join('');
  const escaped = index => { let slashes = 0; while (source[index - slashes - 1] === '\\') slashes++; return slashes % 2 === 1; };
  const runs = /`+/g;
  let opening;
  while ((opening = runs.exec(source))) {
    if (escaped(opening.index)) continue;
    const closingRuns = /`+/g; closingRuns.lastIndex = runs.lastIndex;
    let closing;
    while ((closing = closingRuns.exec(source))) {
      if (closing[0].length !== opening[0].length) continue;
      const end = closing.index + closing[0].length;
      source = source.slice(0, opening.index) + blank(source.slice(opening.index, end)) + source.slice(end);
      runs.lastIndex = end;
      break;
    }
  }
  return source.replace(/<!--[\s\S]*?-->|\{\s*\/\*[\s\S]*?\*\/\s*\}/g, blank);
}

/** Literal Claim/Prose references, in document order and unique first-use order. */
export function collectChapterClaimIds(raw) {
  if (typeof raw !== 'string') throw new TypeError('Chapter content must be raw MDX text');
  const source = maskCode(raw), ids = [], seen = new Set();
  for (const match of source.matchAll(/<(Prose|Claim)\b[^>]*(?:>|$)/g)) {
    let slashes = 0; while (source[match.index - slashes - 1] === '\\') slashes++;
    if (slashes % 2 === 1) continue;
    const literal = match[1] === 'Prose'
      ? /^<Prose\s+ids\s*=\s*(["'])([^"']*)\1\s*\/?>$/.exec(match[0])
      : /^<Claim\s+id\s*=\s*(["'])([^"']+)\1\s*\/?>$/.exec(match[0]);
    if (!literal) throw new TypeError(`${match[1]} requires one literal ${match[1] === 'Prose' ? 'ids' : 'id'} attribute for chapter notes`);
    const references = literal[2].trim().split(/\s+/).filter(Boolean);
    if (!references.length) throw new TypeError('Prose requires at least one claim for chapter notes');
    for (const id of references) {
      if (!/^[A-Za-z][A-Za-z0-9._:-]*$/.test(id)) throw new TypeError('Invalid chapter claim identifier');
      if (!seen.has(id)) { seen.add(id); ids.push(id); }
    }
  }
  return ids;
}

/** Injective route encoding: default note IDs cannot collide between chapters. */
export function chapterAnchorPrefix(url) {
  if (typeof url !== 'string' || !url) throw new TypeError('A chapter URL is required for note anchors');
  return `chapter-${Array.from(new TextEncoder().encode(url), byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

/** One chapter-wide sequence. Repeated paragraphs share a single endnote. */
export function createChapterNotePlan(raw, anchorPrefix) {
  if (typeof anchorPrefix !== 'string' || !/^[A-Za-z][A-Za-z0-9:._-]*$/.test(anchorPrefix)) throw new TypeError('Chapter note prefix must be a safe, unique anchor prefix');
  const notes = collectChapterClaimIds(raw).map((id, index) => ({ id, number: index + 1, anchor: `${anchorPrefix}-note-${index + 1}` }));
  return { notes, byClaimId: new Map(notes.map(note => [note.id, note])), headingId: `${anchorPrefix}-notes` };
}
