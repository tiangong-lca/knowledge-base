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

/** A printed unit keeps its identity when its displayed chapter number changes. */
export function printUnitAnchor(url) {
  return chapterAnchorPrefix(url).replace(/^chapter-/, 'print-unit-');
}

/** @param {string} prefix @param {string} claimId */
export function chapterNoteAnchor(prefix, claimId) {
  return `${prefix}-claim-${claimId}`;
}

/** One chapter-wide sequence. Repeated paragraphs share a single endnote. */
export function createChapterNotePlan(raw, anchorPrefix) {
  if (typeof anchorPrefix !== 'string' || !/^[A-Za-z][A-Za-z0-9:._-]*$/.test(anchorPrefix)) throw new TypeError('Chapter note prefix must be a safe, unique anchor prefix');
  const notes = collectChapterClaimIds(raw).map((id, index) => ({ id, number: index + 1, anchor: chapterNoteAnchor(anchorPrefix, id) }));
  return { notes, byClaimId: new Map(notes.map(note => [note.id, note])), headingId: `${anchorPrefix}-annotations` };
}

/** Locate premises in the actual reading/print order without copying their prose. */
export function createChapterReferenceIndex(pages) {
  const index = new Map();
  for (const page of pages) {
    const plan = createChapterNotePlan(page.raw, chapterAnchorPrefix(page.url));
    for (const note of plan.notes) {
      const locations = index.get(note.id) ?? [];
      locations.push({ title: page.title, url: page.url, number: note.number,
        anchor: note.anchor, printAnchor: page.printAnchorPrefix ? chapterNoteAnchor(page.printAnchorPrefix, note.id) : null,
        printOrder: page.printOrder ?? Number.MAX_SAFE_INTEGER });
      index.set(note.id, locations);
    }
  }
  return index;
}

/** Scope/caveats stay with each claim; only repeated input links and premise text are condensed. */
export function createChapterAnnotationPlan(notePlan, claims, referenceIndex, { print = false } = {}) {
  const byId = new Map(claims.map(claim => [claim.id, claim])), seenInputs = new Set(), result = new Map();
  for (const note of notePlan.notes) {
    const claim = byId.get(note.id);
    if (!claim) throw new Error(`Unknown chapter claim: ${note.id}`);
    const binding = claim.caseBinding;
    const inputKey = binding?.inputFile ? JSON.stringify([binding.caseId, binding.version, binding.inputSha256, binding.inputFile]) : null;
    const showCaseInput = inputKey === null || !seenInputs.has(inputKey);
    if (inputKey !== null) seenInputs.add(inputKey);
    const premiseReferences = new Map();
    for (const id of claim.premiseIds ?? []) {
      const local = notePlan.byClaimId.get(id);
      if (local) premiseReferences.set(id, { href: `#${local.anchor}`, label: `本章注 ${local.number}` });
      else {
        const locations = referenceIndex.get(id) ?? [];
        const location = (print ? locations.filter(item => item.printAnchor).sort((a, b) => a.printOrder - b.printOrder)[0] : null) ?? locations[0];
        if (location) premiseReferences.set(id, {
          href: print && location.printAnchor ? `#${location.printAnchor}` : `${location.url}/#${location.anchor}`,
          label: `《${location.title}》注 ${location.number}`,
        });
      }
    }
    result.set(note.id, { showCaseInput, premiseReferences });
  }
  return result;
}
