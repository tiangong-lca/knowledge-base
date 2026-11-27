import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { publicCatalog } from './knowledge.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readerInternalIds, validateReaderOutput } from './reader-surface.mjs';
import { loadCasePublications, validateCasePublications, canonicalCaseInput, caseEvaluationReceipt } from './case-publication.mjs';
import { getPresentationUnits } from './reader-numbering.mjs';
import { getEnSourcePublisher, getEnSourceTitle } from './reader-citation-display.mjs';
import { validateRepository } from './validate.mjs';

export function renderRedirectHtml(entry, origin = 'https://prism.tiangong.earth') {
  const destPath = entry.to.endsWith('/') ? entry.to : `${entry.to}/`;
  const canonical = `${origin.replace(/\/$/, '')}${destPath}`;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const anchorsJson = JSON.stringify(entry.anchors ?? {}).replace(/</g, '\\u003c');
  const isRelocate = entry.kind === 'relocate';
  const isEn = entry.lang === 'en' || String(entry.from ?? '').startsWith('/en/') || destPath.startsWith('/en/');
  const defaultHash = entry.defaultAnchor ? (entry.defaultAnchor.startsWith('#') ? entry.defaultAnchor : `#${entry.defaultAnchor}`) : '';
  const pageTitle = isEn
    ? (isRelocate
      ? `Page Moved: ${esc(entry.title)} — The Past and Present of Life Cycle Assessment`
      : `Chapter Merged: ${esc(entry.title)} — The Past and Present of Life Cycle Assessment`)
    : (isRelocate
      ? `页面已迁至新地址：${esc(entry.title)} — 生命周期评价的前世今生`
      : `章节已合并：${esc(entry.title)} — 生命周期评价的前世今生`);
  const heading = isEn
    ? (isRelocate ? 'Page Moved to a New Address' : `Merged into ${esc(entry.title)}`)
    : (isRelocate ? '页面已迁至新地址' : `本章已合并至《${esc(entry.title)}》`);
  const bodyNote = isEn
    ? (isRelocate
      ? `The page you requested now lives at a new address. Redirecting to ${esc(entry.title)}.`
      : `This chapter has been consolidated into ${esc(entry.title)}. Redirecting to the integrated chapter.`)
    : (isRelocate
      ? `您访问的页面现已位于新网址，正在自动跳转至《${esc(entry.title)}》。`
      : `原篇章内容已整合至《${esc(entry.title)}》，正在自动跳转至合并后的完整章节。`);
  const linkText = isEn ? `Continue to ${esc(entry.title)}` : `立即前往《${esc(entry.title)}》`;
  const initialTarget = `${destPath}${defaultHash ? `#${encodeURIComponent(defaultHash.slice(1))}` : ''}`;
  return `<!doctype html>
<html lang="${isEn ? 'en' : 'zh-CN'}">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta http-equiv="refresh" content="0; url=${esc(initialTarget)}" />
  <title>${pageTitle}</title>
</head>
<body>
  <main style="max-width:40rem;margin:4rem auto;padding:0 1.25rem;font-family:system-ui,-apple-system,sans-serif;line-height:1.7;">
    <h1>${heading}</h1>
    <p>${bodyNote}</p>
    <p><a id="redirect-link" href="${esc(initialTarget)}">${linkText}</a></p>
  </main>
  <script>
    (function () {
      var dest = ${JSON.stringify(destPath)};
      var map = ${anchorsJson};
      var fallbackHash = ${JSON.stringify(defaultHash ? `#${encodeURIComponent(defaultHash.slice(1))}` : '')};
      var rawHash = window.location.hash ? window.location.hash.slice(1) : '';
      var decoded = rawHash;
      try { decoded = decodeURIComponent(rawHash); } catch (e) {}
      var nextHash = decoded ? (map[decoded] ? '#' + encodeURIComponent(map[decoded]) : '#' + encodeURIComponent(decoded)) : fallbackHash;
      var target = dest + nextHash;
      var link = document.getElementById('redirect-link');
      if (link) link.setAttribute('href', target);
      window.location.replace(target);
    })();
  </script>
</body>
</html>
`;
}

export function emitRouteRedirects(outDir = 'out', configPath = 'config/route-redirects.json') {
  const origin = existsSync(configPath)
    ? (JSON.parse(readFileSync(configPath, 'utf8')).canonicalOrigin ?? 'https://prism.tiangong.earth')
    : 'https://prism.tiangong.earth';
  const entries = existsSync(configPath)
    ? [...(JSON.parse(readFileSync(configPath, 'utf8')).redirects ?? [])]
    : [];
  const emitted = new Set();
  let count = 0;

  // When Chinese routes live under /zh/, emit static HTML redirects for every
  // legacy unprefixed Chinese route so bookmarked links and hash fragments work.
  if (existsSync(join(outDir, 'zh', 'docs', 'index.html'))) {
    const legacyRoots = [
      { from: '/docs', to: '/zh/docs', title: '全书正文', kind: 'relocate' },
      { from: '/sources', to: '/zh/sources', title: '参考文献 — 引文定位', kind: 'relocate' },
      { from: '/claims', to: '/zh/claims', title: '注释汇编', kind: 'relocate' },
      { from: '/concepts', to: '/zh/concepts', title: '概念索引', kind: 'relocate' },
      { from: '/coverage', to: '/zh/coverage', title: '全书导览', kind: 'relocate' },
      { from: '/changes', to: '/zh/changes', title: '修订与勘误', kind: 'relocate' },
      { from: '/print', to: '/zh/print', title: '全书连续版', kind: 'relocate' },
      { from: '/research', to: '/zh/research', title: '参考文献', kind: 'relocate' },
      { from: '/timeline', to: '/zh/timeline', title: '发展大事记', kind: 'relocate' },
    ];
    for (const unit of getPresentationUnits('web')) {
      if (unit.key !== '/docs') {
        legacyRoots.push({ from: unit.key, to: `/zh${unit.key}`, title: unit.title, kind: 'relocate' });
      }
    }
    for (const item of legacyRoots) {
      if (!entries.some(e => e.from.replace(/\/$/, '') === item.from.replace(/\/$/, ''))) {
        entries.push(item);
      }
    }
  }

  for (const entry of entries) {
    const destRel = entry.to.replace(/^\//, '').replace(/\/$/, '');
    if (!existsSync(join(outDir, destRel, 'index.html'))) {
      throw new Error(`Route redirect destination missing in build output: ${entry.from} -> ${entry.to}`);
    }
    const fromRel = entry.from.replace(/^\//, '').replace(/\/$/, '');
    if (emitted.has(fromRel)) continue;
    emitted.add(fromRel);
    const targetDir = join(outDir, fromRel);
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, 'index.html'), renderRedirectHtml(entry, origin));
    count++;
  }
  return count;
}

export async function exportArtifacts(validateSource, validateOutput) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW === '1') throw new Error('Reader review preview cannot produce a public export');
  if (process.env.READER_EDITORIAL_HISTORY === '1') throw new Error('Editorial history mode (READER_EDITORIAL_HISTORY=1) cannot produce a public export');
  const literatureMap = JSON.parse(readFileSync('knowledge/research/literature-map.json', 'utf8'));
  const readingLedger = JSON.parse(readFileSync('knowledge/research/readings.json', 'utf8'));
  const catalog = JSON.parse(readFileSync('knowledge/catalog.json', 'utf8'));
  const cases = await loadCasePublications(process.cwd());
  // Revalidate joins and public MDX independently of the preceding build step.
  const errors = [...new Set([...validateCasePublications(cases, catalog, { readingRegister: readingLedger }), ...await validateSource(process.cwd())])];
  if (errors.length) throw new Error(errors.join('\n'));
  const prefix = existsSync('out/zh/docs/index.html') ? 'zh/' : '';
  for (const route of ['', `${prefix}docs`, `${prefix}sources`, `${prefix}claims`, `${prefix}concepts`, `${prefix}coverage`, `${prefix}changes`, `${prefix}print`, `${prefix}research`]) {
    if (!existsSync(`out/${route ? `${route}/` : ''}index.html`)) throw new Error(`Missing static route: ${route}`);
  }
  if (prefix) {
    for (const route of ['zh', 'en', 'en/docs', 'en/coverage']) {
      if (!existsSync(`out/${route}/index.html`)) throw new Error(`Missing bilingual static route: ${route}`);
    }
  }
  const published = publicCatalog(catalog);
  const digest = createHash('sha256').update(JSON.stringify(published)).digest('hex');
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const worktreeStatus = execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { encoding: 'utf8' }).trimEnd();
  const dirty = Boolean(worktreeStatus);
  if (dirty) {
    console.warn(`Git worktree status (paths only, porcelain format):\n${worktreeStatus}`);
  }
  mkdirSync('out/downloads', { recursive: true });
  for (const { inputFile, spec } of cases) {
    mkdirSync('out/downloads/cases', { recursive: true });
    writeFileSync(`out/downloads/cases/${inputFile}`, canonicalCaseInput(spec));
    writeFileSync(`out/downloads/cases/${inputFile.slice(0, -5)}.evaluated.json`, `${JSON.stringify(caseEvaluationReceipt(spec, sourceCommit), null, 2)}\n`);
  }
  for (const [path, bytes] of readerPublicDownloads(catalog, literatureMap, readingLedger, published)) {
    writeFileSync(`out/${path}`, bytes);
  }

  // Emit lazy-loaded static search indices for ZH and EN so per-page HTML/RSC stays compact.
  function readMdxMeta(baseDir, urlPrefix) {
    const rows = [];
    function scan(dir, relPrefix = '') {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) scan(full, `${relPrefix}${entry.name}/`);
        else if (entry.name.endsWith('.mdx')) {
          const raw = readFileSync(full, 'utf8');
          const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
          const title = (fm.match(/^title:\s*(.+)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
          const desc = (fm.match(/^description:\s*(.+)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
          const slug = `${relPrefix}${entry.name.replace(/\.mdx$/, '')}`.replace(/(^|\/)index$/, '');
          const url = slug ? `${urlPrefix}/${slug}/` : `${urlPrefix}/`;
          if (title) rows.push({ title, text: desc, url });
        }
      }
    }
    scan(baseDir);
    return rows;
  }
  const enClaimsDoc = existsSync('knowledge/editions/en/claims.json')
    ? JSON.parse(readFileSync('knowledge/editions/en/claims.json', 'utf8'))
    : { claims: [] };
  const enBibDoc = existsSync('knowledge/editions/en/bibliography.json')
    ? JSON.parse(readFileSync('knowledge/editions/en/bibliography.json', 'utf8'))
    : { schemaVersion: 1, sources: {}, evidence: {}, passages: {} };
  const formatConceptEn = (s) => (s || '').replace(/\bthe1974container\b/g, 'the 1974 container').replace(/\bthe1974REPA\b/g, 'the 1974 REPA');
  const zhSearchIndex = [
    {
      title: '生命周期评价发展大事记（1969–2026）',
      text: '可视化历史时间线：早期资源账本、SETAC 与 CML 框架成型、ISO 标准化、数据库与共识模型、欧盟法规与前瞻动态 LCA。',
      url: '/zh/timeline/',
      kind: '大事记',
    },
    ...readMdxMeta('content/docs', '/zh/docs').map(p => ({ ...p, kind: '章节' })),
    ...published.claims.map(c => ({ title: c.text, text: c.scope, url: `/zh/claims/#${c.id}`, kind: '论述' })),
    ...published.concepts.map(c => ({ title: c.label, text: `${c.english} ${(c.aliases || []).join(' ')}`.trim(), url: `/zh/concepts/#${c.id}`, kind: '概念' })),
    ...published.sources.map(s => ({ title: s.title, text: `${s.publisher} ${s.version}`.trim(), url: `/zh/sources/#${s.id}`, kind: '来源' })),
  ];
  const enSearchIndex = [
    {
      title: 'LCA Historical Timeline (1969–2026)',
      text: 'Visual timeline of key life cycle assessment milestones from early resource inventories to ISO standards, consensus models, and prospective LCA.',
      url: '/en/timeline/',
      kind: 'Timeline',
    },
    ...readMdxMeta('content-en/docs', '/en/docs').map(p => ({ ...p, kind: 'Chapter' })),
    ...(enClaimsDoc.claims || []).map(c => ({ title: c.text, text: c.scope || '', url: `/en/claims/#${c.id}`, kind: 'Note' })),
    ...published.concepts.map(c => ({ title: formatConceptEn(c.english || c.label), text: formatConceptEn(c.english || ''), url: `/en/concepts/#${c.id}`, kind: 'Concept' })),
    ...published.sources.map(s => ({ title: getEnSourceTitle(s, enBibDoc), text: getEnSourcePublisher(s, enBibDoc), url: `/en/sources/#${s.id}`, kind: 'Source' })),
  ];
  writeFileSync('out/downloads/search-index-zh.json', JSON.stringify(zhSearchIndex));
  writeFileSync('out/downloads/search-index-en.json', JSON.stringify(enSearchIndex));

  const routeBase = prefix ? '/zh' : '';
  const enSection = prefix
    ? `\n## English Edition — The Past and Present of Life Cycle Assessment\n\n- [Home](/en/)\n- [Book Guide](/en/coverage/)\n- [Reading Guide](/en/docs/book/)\n- [Timeline](/en/timeline/)\n- [References](/en/research/)\n- [Citation Locators](/en/sources/)\n- [Chapter Notes](/en/claims/)\n- [Concept Index](/en/concepts/)\n- [Full Text & Print](/en/print/)\n- [Revisions & Errata](/en/changes/)\n`
    : '';
  writeFileSync('out/llms.txt', `# 生命周期评价的前世今生\n\n从问题、概念与原始文献到方法含义和条件判断的中英双语书稿。网站：天工 LCA 知识库。\n\n## 中文版\n\n- [全书导览](${routeBase}/coverage/)\n- [阅读导论](${routeBase}/docs/book/)\n- [发展大事记](${routeBase}/timeline/)\n- [参考文献](${routeBase}/research/)\n- [引文定位](${routeBase}/sources/)\n- [注释汇编](${routeBase}/claims/)\n- [概念索引](${routeBase}/concepts/)\n- [全书连续版](${routeBase}/print/)\n- [修订与勘误](${routeBase}/changes/)\n- [书目与引文数据](/downloads/bibliography.json)\n${enSection}`);
  const surfaceErrors = await validateOutput('out', { knownIds: readerInternalIds(catalog, literatureMap, readingLedger, cases), sourceCommit });
  if (surfaceErrors.length) throw new Error(`Reader publication surface failed:\n${surfaceErrors.join('\n')}`);
  if (existsSync('out/en/print/index.html')) {
    const expectedUnits = getPresentationUnits('book').length;
    const enPrintHtml = readFileSync('out/en/print/index.html', 'utf8');
    const enPrintArticles = (enPrintHtml.match(/<article\s+class="print-chapter\b/g) ?? []).length;
    if (enPrintArticles !== expectedUnits) {
      throw new Error(`English print edition rendered ${enPrintArticles} units, expected ${expectedUnits}`);
    }
  }
  emitRouteRedirects('out');
  console.log(`Public export verified: ${published.claims.length} claims; source ${sourceCommit}${dirty ? ' (working preview)' : ''}`);

  const files = {};
  function hashTree(dir, prefix = '') {
    for (const entry of readdirSync(dir, {withFileTypes:true})) {
      const path = `${prefix}${entry.name}`;
      if (path === 'downloads/manifest.json') continue;
      if (entry.isDirectory()) hashTree(join(dir, entry.name), `${path}/`);
      else if (entry.isFile()) files[path] = createHash('sha256').update(readFileSync(join(dir,entry.name))).digest('hex');
      else throw new Error(`Unexpected output entry ${path}`);
    }
  }
  hashTree('out');
  writeFileSync('out/downloads/manifest.json', JSON.stringify({schemaVersion:1, sourceCommit, dirty, catalogSha256:digest, status:dirty?'working-preview':'source-build', scientificApproval:false, files},null,2)+'\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await exportArtifacts(validateRepository, validateReaderOutput);
