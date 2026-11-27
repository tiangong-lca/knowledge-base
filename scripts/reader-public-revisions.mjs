import { existsSync, readFileSync } from 'node:fs';
import { currentRevisions } from './reader-checkpoint.mjs';
import { getPresentationUnits } from './reader-numbering.mjs';
import { extractRouteChanges } from './reader-revisions.mjs';

function readOptionalJson(relPath, fallback) {
  const url = new URL(relPath, import.meta.url);
  if (!existsSync(url)) return fallback;
  return JSON.parse(readFileSync(url, 'utf8'));
}

const publicRevisionsFile = readOptionalJson('../config/public-revisions.json', { schemaVersion: 1, entries: [] });
const alignmentFile = readOptionalJson('../knowledge/editions/alignment.json', { schemaVersion: 1, units: {} });

const VALID_KINDS = new Set(['addition', 'structure', 'edition', 'erratum']);
const HAN_RE = /\p{Script=Han}/u;
const FORBIDDEN_ZH_PUBLIC_CHANGES = /本轮|试点|批次\s*\d|回读|统稿|核读记录|待核|cl-[a-z0-9-]+|ev-[a-z0-9-]+|src-[a-z0-9-]+|B\d{2}\b|WP\d+\b|READER_EDITORIAL_HISTORY/i;
const FORBIDDEN_EN_PUBLIC_CHANGES = /\b(?:batch\s+\d|pilot|reread|copyedit pass|PR #\d+|issue #\d+|cl-[a-z0-9-]+|ev-[a-z0-9-]+|src-[a-z0-9-]+|B\d{2}\b|WP\d+\b|READER_EDITORIAL_HISTORY)\b/i;

function buildRouteResolver(units = getPresentationUnits('web'), revisions = currentRevisions ?? []) {
  const byKey = new Map();
  const appendixOrder = units.filter(u => u.kind === 'appendix');
  const topicOrder = units.filter(u => u.kind === 'topic');
  for (const unit of units) {
    byKey.set(unit.key, unit);
  }
  const enMeta = alignmentFile?.units ?? {};
  const { fromToMap } = extractRouteChanges(revisions);

  const followRedirect = route => {
    let cur = route.replace(/\/$/, '');
    const seen = new Set([cur]);
    while (!byKey.has(cur) && fromToMap.has(cur)) {
      const next = (fromToMap.get(cur)?.to ?? '').replace(/\/$/, '');
      if (!next || seen.has(next)) break;
      seen.add(next);
      cur = next;
    }
    return cur;
  };

  return route => {
    const clean = followRedirect(route);
    const unit = byKey.get(clean);
    const enTitle = enMeta[clean]?.enTitle ?? unit?.title ?? clean;
    if (!unit) {
      return {
        route: clean,
        zhHref: `/zh${clean}/`,
        enHref: `/en${clean}/`,
        zhLabel: clean,
        enLabel: enTitle,
        exists: false,
      };
    }
    let zhLabel = `《${unit.title}》`;
    let enLabel = enTitle;
    if (unit.kind === 'chapter' && unit.ordinal) {
      zhLabel = `第 ${unit.ordinal} 章《${unit.title}》`;
      enLabel = `Chapter ${unit.ordinal}: ${enTitle}`;
    } else if (unit.kind === 'appendix') {
      const idx = appendixOrder.findIndex(a => a.key === unit.key);
      const letter = idx >= 0 ? String.fromCharCode(65 + idx) : '';
      zhLabel = letter ? `附录 ${letter}《${unit.title}》` : `附录《${unit.title}》`;
      enLabel = letter ? `Appendix ${letter}: ${enTitle}` : `Appendix: ${enTitle}`;
    } else if (unit.kind === 'topic') {
      const idx = topicOrder.findIndex(t => t.key === unit.key);
      zhLabel = idx >= 0 ? `专题 ${idx + 1}《${unit.title}》` : `专题《${unit.title}》`;
      enLabel = idx >= 0 ? `Topic ${idx + 1}: ${enTitle}` : enTitle;
    }
    return {
      route: clean,
      zhHref: `/zh${clean}/`,
      enHref: `/en${clean}/`,
      zhLabel,
      enLabel,
      exists: true,
    };
  };
}

/**
 * Aggregates curated reader-facing revisions and errata from
 * config/public-revisions.json plus any post-checkpoint revision in
 * config/revisions/ that opts in with a bilingual `publicSummary`.
 * Routes are resolved dynamically to current chapter numbers and titles.
 */
export function buildPublicRevisionsAndErrata({
  entries = publicRevisionsFile?.entries ?? [],
  revisions = currentRevisions ?? [],
  units = getPresentationUnits('web'),
} = {}) {
  const resolveRoute = buildRouteResolver(units, revisions);
  const dedupeRoutes = list => {
    const seen = new Set();
    const out = [];
    for (const r of list.map(resolveRoute)) {
      if (seen.has(r.route)) continue;
      seen.add(r.route);
      out.push(r);
    }
    return out;
  };
  const combined = [];
  const seenIds = new Set();

  // Newest opt-in post-checkpoint revisions first
  for (const rev of [...revisions].reverse()) {
    const pub = rev?.publicSummary;
    if (!pub) continue;
    const id = pub.id ?? rev.id;
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    combined.push({
      id,
      date: pub.date ?? rev.date,
      kind: pub.kind,
      title: pub.title,
      summary: pub.summary,
      routes: dedupeRoutes(pub.routes ?? rev.routes ?? []),
    });
  }

  for (const entry of entries) {
    if (!entry || seenIds.has(entry.id)) continue;
    seenIds.add(entry.id);
    combined.push({
      id: entry.id,
      date: entry.date,
      kind: entry.kind,
      title: entry.title,
      summary: entry.summary,
      routes: dedupeRoutes(entry.routes ?? []),
    });
  }

  combined.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return {
    all: combined,
    revisions: combined.filter(item => item.kind !== 'erratum'),
    errata: combined.filter(item => item.kind === 'erratum'),
  };
}

export function validatePublicRevisions({
  entries = publicRevisionsFile?.entries ?? [],
  revisions = currentRevisions ?? [],
  units = getPresentationUnits('web'),
} = {}) {
  const errors = [];
  const data = buildPublicRevisionsAndErrata({ entries, revisions, units });
  if (!data.all.length) {
    errors.push('config/public-revisions.json must contain at least one reader-facing revision or erratum');
    return errors;
  }
  const seen = new Set();
  for (const item of data.all) {
    if (!item.id || typeof item.id !== 'string') {
      errors.push('public-revisions entry missing string id');
      continue;
    }
    if (seen.has(item.id)) errors.push(`Duplicate public-revisions entry id: ${item.id}`);
    seen.add(item.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date ?? '')) {
      errors.push(`public-revisions ${item.id}: invalid YYYY-MM-DD date "${item.date}"`);
    }
    if (!VALID_KINDS.has(item.kind)) {
      errors.push(`public-revisions ${item.id}: invalid kind "${item.kind}"`);
    }
    for (const field of ['title', 'summary']) {
      const zh = item[field]?.zh;
      const en = item[field]?.en;
      if (typeof zh !== 'string' || !zh.trim()) errors.push(`public-revisions ${item.id}: missing ${field}.zh`);
      if (typeof en !== 'string' || !en.trim()) errors.push(`public-revisions ${item.id}: missing ${field}.en`);
      if (zh && FORBIDDEN_ZH_PUBLIC_CHANGES.test(zh)) {
        errors.push(`public-revisions ${item.id}: ${field}.zh contains internal process jargon`);
      }
      if (en && FORBIDDEN_EN_PUBLIC_CHANGES.test(en)) {
        errors.push(`public-revisions ${item.id}: ${field}.en contains internal process jargon`);
      }
      if (en && HAN_RE.test(en)) {
        errors.push(`public-revisions ${item.id}: ${field}.en contains leaked Han characters`);
      }
    }
    for (const r of item.routes) {
      if (!r.exists) {
        errors.push(`public-revisions ${item.id}: route "${r.route}" does not exist in active reader-numbering.json`);
      }
    }
  }
  return errors;
}
