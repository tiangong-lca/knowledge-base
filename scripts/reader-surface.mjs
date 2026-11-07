import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { assertCitationBaseline, assertPrintFrontMatter } from './reader-citation-baseline.mjs';
import { citationHref, citationSourceHref, createLegacyCitationEntries } from './reader-citations.mjs';
// Use the parser already bundled by the exact Next dependency (16.4.4).
// This internal bundle is intentionally version-coupled and covered by tests;
// there is no additional parser dependency or hand-written HTML stripping.
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';

const processPatterns = [
  /本\s*轮/g, /本次\s*核读/g, /首版\s*建设/g, /主任务/g, /源码\s*提交/g,
  /待\s*交付/g, /研究\s*进行中/g, /核查\s*日志/g, /检索\s*日志/g, /构建\s*状态/g,
  /当前为\s*AI\s*辅助来源核查稿/gi,
];
const aiExecution = /AI\s*辅助(?:来源)?核查(?:稿)?|来源核查由\s*AI\s*辅助完成/gi;
const machineKeys = new Set(['inputSha256', 'sourceCommit', 'reviewedAt', 'reviewKind', 'caseBinding', 'schemaVersion', 'artifactKind', 'scientificApproval', 'captureMethod', 'readingStatus', 'accessStatus', 'agent-source-check', 'selected-passages', 'not-close-read', 'working-preview']);
const rawHash = /(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/gi;
const caseId = /\bCASE-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g;
const localDeveloperPath = value => /^\/(?:_docs)(?:\/|$)/.test(value);

/** Actual project identities, not a blanket ban on scientific words. */
export function readerInternalIds(...records) {
  const ids = new Set();
  function visit(value, omitLocalScenarioId = false) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(item => visit(item)); return; }
    if (!omitLocalScenarioId && typeof value.id === 'string') ids.add(value.id);
    if (typeof value.caseId === 'string') ids.add(value.caseId);
    for (const [key, child] of Object.entries(value)) {
      // Native execution scenario names (e.g. "zero") identify run-local input
      // profiles, not publication records. Do not ban the same scientific word
      // across unrelated chapters. Nested record/case identities still count.
      if (value.kind === 'author-derived-native-model-execution' && key === 'scenarios' && Array.isArray(child))
        child.forEach(scenario => visit(scenario, true));
      else visit(child);
    }
  }
  records.forEach(record => visit(record));
  return ids;
}

export function validateReaderText(text, { label = 'Reader prose', knownIds = new Set(), allowAIStatement = false } = {}) {
  const errors = [], prose = String(text).normalize('NFKC');
  for (const pattern of processPatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(prose);
    if (match) errors.push(`${label}: project-process prose “${match[0]}” belongs in development Markdown`);
  }
  aiExecution.lastIndex = 0;
  if (!allowAIStatement && aiExecution.test(prose)) errors.push(`${label}: general AI review identity belongs once in the edition or print writing statement`);
  const tokens = prose.match(/[A-Za-z][A-Za-z0-9._:-]*/g) ?? [];
  const exposed = new Set();
  for (const token of tokens) {
    const candidates = [token, token.replace(/[.:]+$/, '')];
    for (const candidate of candidates) if (knownIds.has(candidate) || machineKeys.has(candidate)) exposed.add(candidate);
  }
  for (const identity of exposed) errors.push(`${label}: visible internal identifier/key “${identity}” is not a reader label`);
  rawHash.lastIndex = 0; caseId.lastIndex = 0;
  if (rawHash.test(prose)) errors.push(`${label}: a raw SHA-256 is visible as reader prose`);
  if (caseId.test(prose)) errors.push(`${label}: a raw case identifier is visible as reader prose`);
  return errors;
}

/** Rendered claim fields only; acquisition appraisals/records remain internal. */
export function validateReaderClaims(published, knownIds = readerInternalIds(published)) {
  const errors = [];
  for (const claim of published.claims) {
    for (const field of ['text', 'scope']) errors.push(...validateReaderText(claim[field], { label: `claims.${claim.id}.${field}`, knownIds }));
    for (const [index, caveat] of claim.caveats.entries()) errors.push(...validateReaderText(caveat, { label: `claims.${claim.id}.caveats.${index}`, knownIds }));
  }
  return errors;
}

function proseOutsideCode(raw) {
  const blank = text => text.replace(/[^\n]/g, ' ');
  let fence = null;
  let text = raw.split(/(?<=\n)/).map(line => {
    const marker = /^(?: {0,3}>[ \t]?)* {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n)?$/.exec(line);
    if (fence) { if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) fence = null; return blank(line); }
    if (marker && (marker[1][0] !== '`' || !marker[2].includes('`'))) { fence = { char: marker[1][0], length: marker[1].length }; return blank(line); }
    return line;
  }).join('');
  text = text.replace(/(`+)([\s\S]*?)\1(?!`)/g, blank).replace(/<!--[\s\S]*?-->|\{\s*\/\*[\s\S]*?\*\/\s*\}/g, blank);
  return text;
}
export function validateReaderMdx(raw, label, knownIds = new Set()) {
  const text = proseOutsideCode(raw), errors = [];
  for (const match of text.matchAll(/\]\(\s*(\/[^\s)]*)/g)) if (localDeveloperPath(match[1])) errors.push(`${label}: development Markdown must not be a public reading route`);
  const prose = text.replace(/<[^>]*>/g, '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
  return [...errors, ...validateReaderText(prose, { label, knownIds })];
}

/** Inspect decoded DOM text, not embedded RSC/JSON scripts or attribute values. */
export function validateReaderHtml(html, { label = 'HTML', knownIds = new Set(), allowAIStatement = false } = {}) {
  const document = htmlParser.parse(html), errors = [], ids = new Set();
  for (const node of document.querySelectorAll('script,style')) node.remove();
  for (const node of document.querySelectorAll('[id]')) {
    const id = node.getAttribute('id');
    if (ids.has(id)) errors.push(`${label}: duplicate DOM id “${id}” (including print chapter anchors)`);
    ids.add(id);
  }
  // Preserve block boundaries without separating inline spans: textContent alone
  // would concatenate an exposed ID with the next paragraph's first word.
  const prose = document.structuredText;
  errors.push(...validateReaderText(prose, { label, knownIds, allowAIStatement }));
  const aiStatements = prose.match(aiExecution) ?? [];
  if (allowAIStatement && aiStatements.length > 1) errors.push(`${label}: general AI writing identity must appear only once`);
  for (const node of document.querySelectorAll('[aria-label]')) errors.push(...validateReaderText(node.getAttribute('aria-label'), { label: `${label} aria-label`, knownIds }));
  for (const node of document.querySelectorAll('[href],[src]')) {
    const href = node.getAttribute('href') ?? node.getAttribute('src');
    if (localDeveloperPath(href)) errors.push(`${label}: development Markdown must not be served or indexed as a reader route`);
  }
  return errors;
}

export function validateReaderIndex(text) {
  const errors = validateReaderText(text, { label: 'llms.txt' });
  if (/Research register|Literature map|Coverage and gaps|研究工作台|检索协议|\/downloads\/research\.json/i.test(text)) errors.push('llms.txt: advertise the reader bibliography, not the former research workbench/legacy register endpoint');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) if (localDeveloperPath(match[1])) errors.push('llms.txt: development Markdown must not enter the public AI reading index');
  return errors;
}

/** An alias must be inside its destination or immediately before it, so the native fragment scrolls there. */
function aliasDestination(node) {
  const target = node.getAttribute('data-legacy-for');
  if (!target) return null;
  if (node.parentNode?.id === target) return target;
  let sibling = node.nextElementSibling;
  while (sibling?.getAttribute('data-legacy-for') === target) sibling = sibling.nextElementSibling;
  return sibling?.id === target ? target : null;
}

function readCitationSurface(document, path) {
  const ids = new Map();
  const errors = [];
  const noteNumbers = new Map();
  for (const section of document.querySelectorAll('.chapter-notes')) {
    const route = path === '/print' ? section.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    if (!route) {
      errors.push(`${path}: notes have no printed unit`);
      continue;
    }
    const prefix = path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route);
    const list = section.querySelector('ol');
    for (const [index, note] of (list?.childNodes.filter(node => node.tagName === 'LI') ?? []).entries()) {
      const claimId = note.getAttribute('data-reader-claim');
      if (!claimId || note.id !== chapterNoteAnchor(prefix, claimId)) errors.push(`${path}: note ${note.id} lacks a stable claim identity`);
      noteNumbers.set(note.id, index + 1);
    }
  }
  const cited = new Set();
  for (const marker of document.querySelectorAll('a[role="doc-noteref"]')) {
    const href = marker.getAttribute('href') ?? '';
    const claimId = marker.getAttribute('data-reader-reference');
    const route = path === '/print' ? marker.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    const prefix = route && (path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route));
    const number = href.startsWith('#') ? noteNumbers.get(href.slice(1)) : null;
    if (!prefix || !claimId || href !== `#${chapterNoteAnchor(prefix, claimId)}` || !number
      || marker.text !== `[${number}]` || marker.getAttribute('aria-label') !== `注 ${number}`)
      errors.push(`${path}: note marker does not match its local endnote ${href}`);
    else cited.add(href.slice(1));
  }
  for (const id of noteNumbers.keys()) if (!cited.has(id)) errors.push(`${path}: unreferenced chapter note ${id}`);

  for (const node of document.querySelectorAll('[id]')) {
    const claimId = node.getAttribute('data-reader-claim');
    const route = path === '/print' ? node.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    const notice = node.hasAttribute('data-legacy-notice');
    const alias = aliasDestination(node);
    const context = notice || alias ? node.querySelector('.legacy-citation-context') : null;
    const edition = context?.querySelector('a')?.getAttribute('href');
    const date = context?.querySelector('time');
    const editionDate = date && date.text === date.getAttribute('datetime') ? date.text : null;
    const links = notice ? node.querySelectorAll('a[data-legacy-destination]').map(link => link.getAttribute('href')) : [];
    const section = /^H[1-6]$/.test(node.tagName) || node.getAttribute('data-reader-section') === node.id;
    if (ids.has(node.id)) errors.push(`${path}: duplicate citation surface ID ${node.id}`);
    ids.set(node.id, { route, claimId, section, tag: node.tagName, notice, alias, edition, editionDate, links, number: noteNumbers.get(node.id) });
  }
  const printOrder = path === '/print' ? document.querySelectorAll('article[data-reader-route]').map(article => article.getAttribute('data-reader-route')) : [];
  return { ids, errors, printOrder };
}

export async function validateLegacyCitationOutput(root, sourceBaseline, locations) {
  const entries = createLegacyCitationEntries(sourceBaseline, locations);
  const pages = new Map();
  const errors = [];
  for (const path of new Set([...sourceBaseline.pages.map(page => page.route), '/print'])) {
    const html = await readFile(join(root, path.slice(1), 'index.html'), 'utf8').catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (html === null) {
      errors.push(`${path}: missing legacy reader route`);
      continue;
    }
    const surface = readCitationSurface(htmlParser.parse(html), path);
    if (!surface.ids.has('main-content')) errors.push(`${path}: missing main-content fragment`);
    pages.set(path, surface);
    errors.push(...surface.errors);
  }
  const print = pages.get('/print');
  if (print) {
    const retainedRoutes = sourceBaseline.pages.filter(page => page.printOrdinal).sort((a, b) => a.printOrdinal - b.printOrdinal).map(page => page.route);
    if (JSON.stringify(print.printOrder) !== JSON.stringify([...locations.frontMatter, ...retainedRoutes])) errors.push('/print: printed unit order differs from the retained reading edition');
    for (const id of ['writing-note', 'print-references']) if (!print.ids.has(id)) errors.push(`/print: missing ${id} fragment`);
  }

  for (const entry of entries) {
    const address = `${entry.path}/#${entry.id}`;
    const page = pages.get(entry.path);
    if (!page) continue;
    const source = page.ids.get(entry.id);
    if (!source) {
      errors.push(`${address}: missing old citation target`);
      continue;
    }
    if (entry.mode !== 'retained' && (source.edition !== citationSourceHref(sourceBaseline.sourceCommit) || source.editionDate !== sourceBaseline.sourceDate))
      errors.push(`${address}: missing exact edition context`);
    if (entry.mode === 'alias' && source.alias !== entry.targets[0].id) errors.push(`${address}: alias does not land at its destination`);
    if (entry.mode === 'notice') {
      const expected = entry.targets.map(target => citationHref(target, entry.path));
      if (!source.notice || JSON.stringify(source.links) !== JSON.stringify(expected)) errors.push(`${address}: migration notice has the wrong native links`);
    }
    for (const target of entry.targets) {
      const actual = pages.get(target.path)?.ids.get(target.id);
      const semanticMatch = actual?.route === target.route && (
        target.kind === 'note' ? actual.tag === 'LI' && actual.claimId === target.claimId && actual.number :
        target.kind === 'chapter' ? actual.tag === 'ARTICLE' :
        target.kind === 'note-group' ? /^H[23]$/.test(actual.tag) : actual.section);
      if (!semanticMatch) errors.push(`${address}: wrong or missing ${target.kind} destination ${target.path}/#${target.id}`);
    }
  }
  return errors;
}

export async function validateReaderOutput(root, { knownIds = new Set() } = {}) {
  const errors = [];
  let bookOutput = false;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name), label = relative(root, path).replaceAll('\\', '/');
      if (entry.name === '_docs') { errors.push(`${label}: development Markdown must remain outside public output`); continue; }
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const html = await readFile(path, 'utf8');
        if (label.startsWith('docs/book/') || (label === 'print/index.html' && /<article[^>]+class="print-chapter\b/.test(html))) bookOutput = true;
        errors.push(...validateReaderHtml(html, { label, knownIds, allowAIStatement: label === 'changes/index.html' || label === 'print/index.html' }));
      }
      else if (entry.isFile() && entry.name === 'llms.txt') errors.push(...validateReaderIndex(await readFile(path, 'utf8')));
      else if (!entry.isFile()) errors.push(`${label}: unexpected public output entry`);
    }
  }
  await visit(root);
  // A standalone exporter fixture may have no book. A partial or cached book export still needs both files.
  const config = resolve(root, '..', 'config');
  const bookSource = await access(resolve(root, '..', 'content', 'docs', 'book', 'meta.json')).then(() => true, error => {
    if (error.code !== 'ENOENT') throw error;
    return false;
  });
  const [baseline, placements] = await Promise.all(['citation-baseline.json', 'citation-placements.json'].map(async file => {
    const raw = await readFile(join(config, file), 'utf8').catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    return raw === null ? null : JSON.parse(raw);
  }));
  if (baseline && placements) {
    assertCitationBaseline(baseline);
    assertPrintFrontMatter(placements.frontMatter);
    errors.push(...await validateLegacyCitationOutput(root, baseline, placements));
  } else if (baseline || placements || bookSource || bookOutput) errors.push('The book export requires both the reader citation baseline and placement files');
  return [...new Set(errors)];
}
