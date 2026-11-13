import capture from '../config/reader-copyedit-8148-capture.json' with { type: 'json' };
import { editionDigest } from './reader-current-edition.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { readerCopyeditCaptureDigest, readerCopyeditSource } from './reader-copyedit-pins.mjs';

const addressOf = target => `${target.path}#${target.id}`;
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const text = value => typeof value === 'string' && Boolean(value.trim());
const same = (a, b) => editionDigest(a ?? null) === editionDigest(b ?? null);

export function readerCopyeditTitleText(row) {
  return `此处在 ${readerCopyeditSource.capturedAt} 版题为“${row.from}”。查看该版源文件`;
}

/** The frozen capture remains independent of both current content and acceptance. */
export function copyeditHistoryPlan(unit, observed = capture, pin = readerCopyeditCaptureDigest) {
  if (!unit) return null;
  if (observed.qualification !== 'actual-hosted-html-capture' || !same(observed.source, readerCopyeditSource)
      || unit.captureDigest !== pin || editionDigest(observed) !== pin)
    throw new Error('Reader copyedit requires the independently pinned 8148 capture');

  const titles = new Map(), ordinary = new Map(), chapterTitles = new Map();
  const scope = new Set(unit.scope ?? []);
  for (const row of unit.titles) {
    const actual = observed.addresses[row.address];
    if (!actual || !['chapter', 'heading', 'reading-title', 'part'].includes(actual.kind)
        || !text(row.from) || !text(row.to) || row.from === row.to || !text(row.rationale)
        || actual.title !== row.from || titles.has(row.address) || !scope.has(row.address))
      throw new Error(`Reader copyedit title differs from the actual 8148 title: ${row.address}`);
    titles.set(row.address, row);
    if (actual.kind === 'chapter') chapterTitles.set(`${row.address.split('#')[0]}:${actual.route}`, row);
  }
  for (const row of unit.ordinary) {
    const actual = observed.addresses[row.address];
    const key = `${row.address}:${row.index}`;
    if (!actual || !Number.isInteger(row.index) || !hash(row.from) || !hash(row.to)
        || actual.ordinary[row.index] !== row.from || row.from === row.to || !text(row.rationale)
        || ordinary.has(key) || !scope.has(row.address))
      throw new Error(`Reader copyedit ordinary block differs from its 8148 position: ${key}`);
    ordinary.set(key, row);
  }
  return { titles, ordinary, chapterTitles, observed };
}

export function copyeditHistoryEntries(entries, plan) {
  if (!plan) return entries;
  function targetLabel(target) {
    if (!target.label) return target;
    const address = addressOf(target), captured = plan.observed.addresses[address];
    if (!captured) return target;
    const chapter = plan.chapterTitles.get(`${target.path}:${target.route}`);
    const title = plan.titles.get(address);
    if (!chapter && !title) return target;
    // Derive the new link label from the actual target. Dated notices retain
    // their own edition and explanatory text.
    const { label, ...rest } = target;
    return rest;
  }
  return entries.map(entry => {
    const oldTargets = entry.scope?.targets ?? entry.targets;
    const capturedScope = entry.capturedScope;
    const retained = !entry.scope && capturedScope && oldTargets.length === 1;
    const native = retained ? plan.observed.addresses[addressOf(oldTargets[0])] : null;
    const targets = entry.targets.map(targetLabel);
    const scope = entry.scope ? { ...entry.scope, targets: entry.scope.targets.map(targetLabel) } : undefined;
    const ordinaryDispositions = entry.ordinaryDispositions?.map(row => ({
      ...row, destinations: row.destinations.map(destination => {
        if (!destination.currentSha256) return destination;
        const { address, currentSha256 } = destination;
        const old = plan.observed.addresses[address]?.ordinary ?? [];
        const positions = old.flatMap((value, index) => value === currentSha256 ? [index] : []);
        const candidates = new Set(positions.map(index => plan.ordinary.get(`${address}:${index}`)?.to ?? currentSha256));
        if (candidates.size > 1) throw new Error(`Reader copyedit repeats an ambiguous historical ordinary block: ${address}`);
        return candidates.size ? { ...destination, currentSha256: candidates.values().next().value } : destination;
      }),
    }));
    let currentScope = capturedScope;
    // Untouched native old scopes already coincide with the actual 8148
    // title/block inventory. Rebind the expectation without opening a notice
    // for same-place wording. The frozen old captured scope is retained above.
    if (native && same(native.claimIds, capturedScope.claimIds) && same(native.ordinary, capturedScope.ordinaryHashes)) {
      const address = addressOf(oldTargets[0]);
      const chapter = plan.chapterTitles.get(`${oldTargets[0].path}:${oldTargets[0].route}`);
      const title = plan.titles.get(address) ?? (native.kind === 'note-group' ? chapter : undefined);
      currentScope = { ...capturedScope, title: title?.to ?? capturedScope.title,
        ordinaryHashes: native.ordinary.map((digest, index) => plan.ordinary.get(`${address}:${index}`)?.to ?? digest) };
    }
    return { ...entry, targets, ...(scope && { scope }), ...(ordinaryDispositions && { ordinaryDispositions }),
      ...(currentScope !== capturedScope && { currentCapturedScope: currentScope }) };
  });
}

/** Printed part wrappers contain whole chapters. Bind only the part header,
 * introduction, and its optional historical disclosure. */
export function fingerprintCopyeditPrintParts(document) {
  if (!document) throw new Error('Reader copyedit requires the actual printed parts');
  const sections = document.querySelectorAll('[data-reader-part-group]');
  if (sections.length !== 7) throw new Error('Reader copyedit requires seven actual printed parts');
  return sections.map((section, index) => {
    const id = `print-part-${index + 1}`;
    const children = section.childNodes.filter(node => node.nodeType === 1);
    const heading = children.find(node => node.id === id);
    const intro = children.filter(node => classes(node).includes('print-part-introduction'));
    const history = children.filter(node => node.getAttribute('data-copyedit-history') === id);
    if (!heading || intro.length !== 1 || history.length > 1)
      throw new Error(`Reader copyedit lacks the actual printed part header: ${id}`);
    const header = children.filter(node => node === heading || node === intro[0] || history.includes(node));
    return { id, sha256: editionDigest({ wrapper: section.attributes, header: header.map(node => node.outerHTML) }) };
  });
}

const classes = node => (node.getAttribute('class') ?? '').split(/\s+/);

function historyControlVisible(node) {
  for (let current = node; current?.nodeType === 1; current = current.parentNode) {
    if (current.hasAttribute('hidden') || current.hasAttribute('inert') || current.getAttribute('aria-hidden')?.toLowerCase() === 'true'
        || /(?:^|[;\s])(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|opacity\s*:\s*0(?:[;\s]|$)|content-visibility\s*:\s*hidden)/i.test(current.getAttribute('style') ?? '')
        || classes(current).some(name => /^(?:hidden|invisible|collapse|sr-only|opacity-0|pointer-events-none)$/.test(name))
        || (current !== node && current.tagName === 'DETAILS' && !current.hasAttribute('open')
          && node.closest('summary') !== current.querySelector('summary'))) return false;
  }
  return true;
}

const attrs = (node, ...keys) => same(Object.keys(node.attributes).map(key => key.toLowerCase()).sort(), keys.sort());

export function validateCopyeditHistory(documents, addresses, plan, printParts) {
  if (!plan) return [];
  const errors = [];
  if (printParts && !same(fingerprintCopyeditPrintParts(documents.get('/print')), printParts))
    errors.push('Reader copyedit actual printed part headers differ from their reviewed output');
  const old = plan.observed.addresses;
  for (const [address, fixed] of Object.entries(old)) {
    const actual = addresses[address];
    if (!actual || !same(actual.claimIds, fixed.claimIds) || actual.route !== fixed.route
        || actual.kind !== fixed.kind || !same(actual.members, fixed.members) || actual.chapter !== fixed.chapter) {
      errors.push(`Reader copyedit changed a native 8148 address or its ordered scope: ${address}`);
      continue;
    }
    if (!same(actual.bindings, fixed.bindings))
      errors.push(`Reader copyedit changed protected ordinary link destinations or table data: ${address}`);
    const change = plan.titles.get(address);
    const chapter = fixed.kind === 'note' || fixed.kind === 'note-group'
      ? plan.chapterTitles?.get(`${address.split('#')[0]}:${fixed.route}`) : null;
    if (actual.title !== (change?.to ?? chapter?.to ?? fixed.title))
      errors.push(`Reader copyedit title lacks an exact 8148 disposition: ${address}`);
    const ordinary = fixed.ordinary.map((value, index) => plan.ordinary.get(`${address}:${index}`)?.to ?? value);
    if (!same(ordinary, actual.ordinary)) errors.push(`Reader copyedit ordinary content differs at its 8148 position: ${address}`);
  }
  for (const address of Object.keys(addresses)) {
    if (!Object.hasOwn(old, address)) errors.push(`Reader copyedit introduced a different native address: ${address}`);
  }
  const used = new Set();
  for (const [path, document] of documents) {
    for (const node of document.querySelectorAll('[data-copyedit-history]')) {
      const id = node.getAttribute('data-copyedit-history');
      const address = `${path}#${id}`;
      const row = plan.titles.get(address);
      const summaries = node.querySelectorAll('summary');
      const summary = summaries[0];
      const time = node.querySelectorAll('time');
      const links = node.querySelectorAll('a');
      const target = document.querySelectorAll('[id]').find(candidate => candidate.id === id);
      const native = plan.observed.addresses[address];
      const previous = node.previousElementSibling;
      const articleScope = previous?.getAttribute('data-legacy-scope') === native?.chapter;
      const articleDescription = previous?.tagName === 'P' && previous.previousElementSibling === target;
      const nextToTarget = previous === target || previous?.getAttribute('data-legacy-scope') === id
        || native?.kind === 'reading-title' && node.parentNode === target?.parentNode && (articleScope || articleDescription);
      if (!row || used.has(address) || !target || node.tagName !== 'DETAILS'
          || !attrs(node, 'class', 'data-copyedit-history') || node.getAttribute('class') !== 'legacy-citation-context'
          || summaries.length !== 1 || summary !== node.childNodes.find(child => child.nodeType === 1) || !attrs(summary)
          || !historyControlVisible(summary) || !historyControlVisible(target) || !nextToTarget
          || node.text.replace(/\s+/g, '') !== readerCopyeditTitleText(row).replace(/\s+/g, '')
          || time.length !== 1 || time[0].parentNode !== summary || !attrs(time[0], 'datetime')
          || time[0].getAttribute('datetime') !== readerCopyeditSource.capturedAt
          || time[0].text !== readerCopyeditSource.capturedAt
          || links.length !== 1 || links[0].parentNode !== node || !attrs(links[0], 'href')
          || links[0].getAttribute('href') !== citationSourceHref(readerCopyeditSource.commit))
        errors.push(`Reader copyedit historical title has unexpected text, position or source: ${address}`);
      used.add(address);
    }
  }
  for (const address of plan.titles.keys()) {
    const native = plan.observed.addresses[address];
    if (native.kind !== 'chapter' && !used.has(address)) errors.push(`Reader copyedit is missing the actual 8148 title context: ${address}`);
    if (native.kind === 'chapter') {
      const path = address.split('#')[0], id = address.slice(path.length + 1);
      const title = Object.entries(plan.observed.addresses).find(([key, entry]) =>
        key.startsWith(path + '#') && entry.kind === 'reading-title' && entry.chapter === id)?.[0];
      if (!used.has(title)) errors.push(`Reader copyedit is missing the actual 8148 chapter title context: ${address}`);
    }
  }
  return errors;
}
