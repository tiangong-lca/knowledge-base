import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
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
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (typeof value.id === 'string') ids.add(value.id);
    if (typeof value.caseId === 'string') ids.add(value.caseId);
    Object.values(value).forEach(visit);
  }
  records.forEach(visit);
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

export async function validateReaderOutput(root, { knownIds = new Set() } = {}) {
  const errors = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name), label = relative(root, path).replaceAll('\\', '/');
      if (entry.name === '_docs') { errors.push(`${label}: development Markdown must remain outside public output`); continue; }
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith('.html')) errors.push(...validateReaderHtml(await readFile(path, 'utf8'), { label, knownIds, allowAIStatement: label === 'changes/index.html' || label === 'print/index.html' }));
      else if (entry.isFile() && entry.name === 'llms.txt') errors.push(...validateReaderIndex(await readFile(path, 'utf8')));
      else if (!entry.isFile()) errors.push(`${label}: unexpected public output entry`);
    }
  }
  await visit(root);
  return [...new Set(errors)];
}
