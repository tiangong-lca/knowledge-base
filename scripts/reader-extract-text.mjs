#!/usr/bin/env node
/**
 * Extract clean visible reader prose, tables, and footnotes from rendered Next.js static HTML
 * for zero-context reader audits (Node-only replacement for Python scripts).
 *
 * Usage:
 *   node scripts/reader-extract-text.mjs --out-dir <dir> <label:relRoute> [...]
 * Example:
 *   node scripts/reader-extract-text.mjs --out-dir /tmp/review b29:docs/book/wall-service-to-comparison
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const defaultRepoRoot = resolve(__dirname, '..');

function cleanText(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

export function extractRenderedArticleText(html) {
  const root = htmlParser.parse(html);
  const article = root.querySelector('article[data-reader-route]') ?? root.querySelector('main#main-content') ?? root;
  const lines = [];

  function walk(node) {
    if (!node || node.nodeType !== 1) return;
    const tag = (node.tagName || '').toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'nav' || node.getAttribute('aria-hidden') === 'true') return;

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      const txt = cleanText(node.text);
      if (txt) lines.push(`${'#'.repeat(level)} ${txt}`);
      return;
    }

    if (tag === 'p') {
      const txt = cleanText(node.text);
      if (txt) lines.push(txt);
      return;
    }

    if (tag === 'table') {
      const rows = node.querySelectorAll('tr');
      for (const tr of rows) {
        const cells = tr.querySelectorAll('th, td').map(cell => cleanText(cell.text));
        if (cells.length) lines.push(`| ${cells.join(' | ')} |`);
      }
      return;
    }

    if (tag === 'li') {
      const txt = cleanText(node.text);
      if (txt) lines.push(`- ${txt}`);
      return;
    }

    for (const child of node.childNodes ?? []) {
      walk(child);
    }
  }

  walk(article);
  return lines.join('\n\n') + '\n';
}

async function main() {
  const args = process.argv.slice(2);
  let outDir = null;
  let repo = defaultRepoRoot;
  const pairs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out-dir') outDir = resolve(args[++i]);
    else if (args[i] === '--repo') repo = resolve(args[++i]);
    else pairs.push(args[i]);
  }

  if (!pairs.length) {
    console.error('Usage: node scripts/reader-extract-text.mjs [--out-dir <dir>] <label:relRoute> [...]');
    process.exit(2);
  }

  if (outDir) await mkdir(outDir, { recursive: true });

  for (const spec of pairs) {
    const [label, rel] = spec.includes(':') ? spec.split(':', 2) : [spec.replace(/\//g, '-'), spec];
    const cleanRel = rel.replace(/^\/+|\/+$/g, '');
    const htmlPath = join(repo, 'out', cleanRel, 'index.html');
    const html = await readFile(htmlPath, 'utf8');
    const text = extractRenderedArticleText(html);
    if (outDir) {
      const target = join(outDir, `${label}-rendered.txt`);
      await writeFile(target, text, 'utf8');
      console.log(`${label}: ${text.length} chars -> ${target}`);
    } else {
      console.log(`=== ${label} (${text.length} chars) ===\n${text}`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
