import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';

/** @typedef {{ route: string, headingIds: string[], noteClaims: string[], printOrdinal?: number }} BaselinePage */
/** @typedef {{ notes: { from: string, claimId: string, to: string }[], frontMatter: string[], printAdditions?: { route: string, kind: string }[] }} Placements */
/** @typedef {{ route: string, path: string, id: string, kind: 'chapter' | 'heading' | 'note' | 'note-group', claimId?: string }} Destination */
/** @typedef {{ route: string, path: string, id: string, targets: Destination[], mode: 'retained' | 'alias' | 'notice' }} LegacyEntry */

/** @param {string} route @param {boolean} print */
function location(route, print) {
  return { route, path: print ? '/print' : route, prefix: print ? printUnitAnchor(route) : chapterAnchorPrefix(route) };
}

/** @param {Destination} target @param {string} currentPath */
export function citationHref(target, currentPath) {
  return `${target.path === currentPath ? '' : `${target.path}/`}#${encodeURIComponent(target.id)}`;
}

/** @param {string} commit */
export function citationSourceHref(commit) {
  return `https://github.com/tiangong-lca/knowledge-base/tree/${commit}`;
}

/** Explicit additions extend the current edition without changing its frozen addresses.
 * @param {{ pages: BaselinePage[] }} baseline @param {Placements} placements
 */
function currentPrintAdditions(baseline, placements) {
  const original = new Set(baseline.pages.map(page => page.route)), seen = new Set();
  return (placements.printAdditions ?? []).map(addition => {
    if (addition.kind !== 'appendix' || !/^\/docs\/appendices\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(addition.route)
      || original.has(addition.route) || seen.has(addition.route))
      throw new Error(`Invalid or repeated current print addition: ${addition.route}`);
    seen.add(addition.route);
    return addition.route;
  });
}

/** Compare the explicit current roster with independently discovered source pages.
 * A new article cannot disappear merely by deleting its registration and output.
 * @param {{ pages: BaselinePage[] }} baseline @param {Placements} placements @param {string[]} availableRoutes
 */
export function createCurrentPrintRoutes(baseline, placements, availableRoutes) {
  const additions = currentPrintAdditions(baseline, placements);
  const retained = baseline.pages.filter(page => page.printOrdinal !== undefined)
    .sort((a, b) => a.printOrdinal - b.printOrdinal).map(page => page.route);
  const routes = [...placements.frontMatter, ...retained, ...additions];
  if (new Set(routes).size !== routes.length) throw new Error('Current print roster repeats a unit');
  const available = new Set(availableRoutes);
  for (const route of routes) if (!available.has(route)) throw new Error(`Missing printed unit: ${route}`);
  const original = new Set(baseline.pages.map(page => page.route));
  for (const route of available) {
    // The appendix folder index is navigation; every new article needs an explicit place.
    if (route.startsWith('/docs/') && route !== '/docs/appendices' && !original.has(route) && !additions.includes(route))
      throw new Error(`Reader source has no current print registration: ${route}`);
  }
  return routes;
}

/** Freeze earlier meanings independently of the current prose order.
 * @param {{ pages: BaselinePage[] }} baseline @param {Placements} placements
 */
export function createLegacyCitationEntries(baseline, placements) {
  /** @type {LegacyEntry[]} */
  const entries = [];
  const used = new Set();
  const routes = new Set(baseline.pages.map(page => page.route));
  const printRoutes = new Set(baseline.pages.filter(page => page.printOrdinal).map(page => page.route));
  if (routes.size !== baseline.pages.length || printRoutes.size !== new Set(baseline.pages.flatMap(page => page.printOrdinal ? [page.printOrdinal] : [])).size)
    throw new Error('Legacy citation baseline has duplicate routes or print ordinals');

  const noteKey = (/** @type {string} */ route, /** @type {string} */ id) => `${route}#${id}`;
  const moves = new Map(placements.notes.map(move => [noteKey(move.from, move.claimId), move.to]));
  if (moves.size !== placements.notes.length) throw new Error('Duplicate legacy citation placement');
  for (const route of placements.frontMatter) {
    if (!routes.has(route) || printRoutes.has(route)) throw new Error(`Unknown or repeated printed front matter: ${route}`);
    printRoutes.add(route);
  }
  for (const route of currentPrintAdditions(baseline, placements)) { routes.add(route); printRoutes.add(route); }
  const applied = new Set();

  /** @param {string} route @param {string} path @param {string} id @param {Destination[]} targets */
  function add(route, path, id, targets) {
    const key = noteKey(path, id);
    if (used.has(key) || !targets.length) throw new Error(`Duplicate or empty legacy citation: ${key}`);
    used.add(key);
    const mode = targets.length !== 1 || targets[0].path !== path ? 'notice' : targets[0].id === id ? 'retained' : 'alias';
    entries.push({ route, path, id, targets, mode });
  }

  for (const page of baseline.pages) {
    for (const print of page.printOrdinal ? [false, true] : [false]) {
      const { route, path, prefix } = location(page.route, print);
      const oldPrefix = print ? `print-chapter-${page.printOrdinal}` : prefix;
      if (print) add(route, path, oldPrefix, [{ route, path, id: prefix, kind: 'chapter' }]);
      for (const id of page.headingIds) {
        add(route, path, print ? `${oldPrefix}-${id}` : id,
          [{ route, path, id: print ? `${prefix}-${id}` : id, kind: 'heading' }]);
      }
      /** @type {Destination[]} */
      const noteTargets = page.noteClaims.map((claimId, index) => {
        const key = noteKey(route, claimId);
        const destination = moves.get(key) ?? route;
        if (!routes.has(destination)) throw new Error(`Unknown citation target route: ${destination}`);
        if (destination !== route) applied.add(key);
        const target = location(destination, print && printRoutes.has(destination));
        /** @type {Destination} */
        const note = { route: target.route, path: target.path, id: chapterNoteAnchor(target.prefix, claimId), kind: 'note', claimId };
        add(route, path, `${oldPrefix}-note-${index + 1}`, [note]);
        return note;
      });
      if (noteTargets.length) add(route, path, `${oldPrefix}-notes`, noteTargets.every(note => note.route !== route)
        ? noteTargets : [{ route, path, id: `${prefix}-annotations`, kind: 'note-group' }]);
    }
  }
  if (applied.size !== moves.size) throw new Error('Legacy citation placement refers to an unknown earlier address');
  return entries;
}
