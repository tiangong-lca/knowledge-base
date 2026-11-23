import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { publicCatalog } from './knowledge.mjs';
import { editionDigest, inspectReadableBookEdition, validReadableBookReviewFile } from './reader-current-edition.mjs';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const isSha = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const VALID_REVISION_FILE_RE = /^[a-z0-9][a-z0-9._-]*\.json$/;

const RECORD_FAMILIES = ['claims', 'concepts', 'evidence', 'sources', 'mappings'];

export function validateRevisionSchema(revision, label = 'revision') {
  if (!revision || typeof revision !== 'object' || revision.schemaVersion !== 1) {
    throw new Error(`${label}: requires schemaVersion 1`);
  }
  for (const field of ['id', 'date', 'title', 'rationale']) {
    if (!nonempty(revision[field])) throw new Error(`${label}: missing non-empty ${field}`);
  }
  if (!Array.isArray(revision.routes) || !revision.routes.every(nonempty)) {
    throw new Error(`${label}: routes must be an array of non-empty strings`);
  }
  for (const family of RECORD_FAMILIES) {
    const rows = revision[family] ?? [];
    if (!Array.isArray(rows)) throw new Error(`${label}: ${family} must be an array`);
    const seen = new Set();
    for (const row of rows) {
      if (!row || !nonempty(row.id) || !['modify', 'add', 'retire'].includes(row.op)) {
        throw new Error(`${label}: invalid ${family} operation`);
      }
      if (seen.has(row.id)) throw new Error(`${label}: duplicate ${family} id ${row.id}`);
      seen.add(row.id);
      if (!nonempty(row.rationale)) throw new Error(`${label}: ${family}:${row.id} requires rationale`);
      if (row.op === 'add' && row.from !== null) {
        throw new Error(`${label}: ${family}:${row.id} add op requires from: null`);
      }
      if (row.op === 'modify' && (!row.from || typeof row.from !== 'object' || row.from.id !== row.id)) {
        throw new Error(`${label}: ${family}:${row.id} modify op requires exact previous record in from`);
      }
      if (row.op === 'retire') {
        if (!row.from || typeof row.from !== 'object' || row.from.id !== row.id) {
          throw new Error(`${label}: ${family}:${row.id} retire op requires exact previous record in from`);
        }
        if (!Number.isInteger(row.index) || row.index < 0) {
          throw new Error(`${label}: ${family}:${row.id} retire op requires non-negative integer index`);
        }
        if (family === 'claims') {
          if (row.successor !== null && (!nonempty(row.successor) || row.successor === row.id)) {
            throw new Error(`${label}: claims:${row.id} retire op requires successor claim id or null`);
          }
          if (row.routes !== undefined && (!Array.isArray(row.routes) || !row.routes.length || !row.routes.every(nonempty))) {
            throw new Error(`${label}: claims:${row.id} retire routes must be a non-empty string array`);
          }
          if (revision.routes.length > 1 && !row.routes) {
            throw new Error(`${label}: claims:${row.id} retire op must specify routes in a multi-route revision`);
          }
          if (row.successorRoute !== undefined && !nonempty(row.successorRoute)) {
            throw new Error(`${label}: claims:${row.id} successorRoute must be a non-empty string`);
          }
        }
      }
    }
  }
  for (const fileRow of revision.files ?? []) {
    const op = fileRow?.op ?? 'modify';
    if (!fileRow || !nonempty(fileRow.path) || !['modify', 'add', 'delete'].includes(op)) {
      throw new Error(`${label}: invalid file transition entry`);
    }
    if (op === 'modify') {
      if (!isSha(fileRow.fromSha256) || !isSha(fileRow.toSha256) || typeof fileRow.previous !== 'string') {
        throw new Error(`${label}: invalid modify file transition entry: ${fileRow.path}`);
      }
    } else if (op === 'add') {
      if (fileRow.fromSha256 !== null || fileRow.previous !== null || !isSha(fileRow.toSha256)) {
        throw new Error(`${label}: invalid add file transition entry: ${fileRow.path}`);
      }
    } else if (op === 'delete') {
      if (!isSha(fileRow.fromSha256) || typeof fileRow.previous !== 'string' || fileRow.toSha256 !== null) {
        throw new Error(`${label}: invalid delete file transition entry: ${fileRow.path}`);
      }
    }
    if (fileRow.path === 'config/reader-numbering.json' && !isSha(fileRow.toDigest)) {
      throw new Error(`${label}: config/reader-numbering.json file transition requires toDigest`);
    }
  }
  if (revision.routeChanges !== undefined) {
    if (!Array.isArray(revision.routeChanges)) {
      throw new Error(`${label}: routeChanges must be an array`);
    }
    for (const rc of revision.routeChanges) {
      if (!rc || rc.op !== 'merge') {
        throw new Error(`${label}: routeChanges entry requires op: 'merge'`);
      }
      if (!Array.isArray(rc.from) || rc.from.length < 2 || !rc.from.every(r => nonempty(r) && r.startsWith('/'))) {
        throw new Error(`${label}: routeChanges merge requires at least two '/' routes in from`);
      }
      if (new Set(rc.from).size !== rc.from.length) {
        throw new Error(`${label}: routeChanges merge contains duplicate route in from`);
      }
      if (!nonempty(rc.to) || !rc.to.startsWith('/') || rc.from.includes(rc.to)) {
        throw new Error(`${label}: routeChanges merge requires distinct '/' route in to`);
      }
      if (rc.bookUnit !== undefined && !nonempty(rc.bookUnit)) {
        throw new Error(`${label}: routeChanges merge bookUnit must be non-empty when present`);
      }
      if (!nonempty(rc.rationale) || /\bcl-[a-z0-9-]+/i.test(rc.rationale)) {
        throw new Error(`${label}: routeChanges merge requires clean reader-facing rationale without internal claim IDs`);
      }
      if (rc.anchors !== undefined) {
        if (!rc.anchors || typeof rc.anchors !== 'object' || Array.isArray(rc.anchors)) {
          throw new Error(`${label}: routeChanges merge anchors must be a plain object`);
        }
        for (const [k, v] of Object.entries(rc.anchors)) {
          if (!nonempty(k) || !nonempty(v) || !v.startsWith('#')) {
            throw new Error(`${label}: routeChanges merge anchor mapping must map non-empty key to '#anchor': ${k} -> ${v}`);
          }
        }
      }
    }
  }
  for (const outRow of revision.outputs ?? []) {
    if (!outRow || !nonempty(outRow.path) || !nonempty(outRow.route) || !isSha(outRow.sha256)) {
      throw new Error(`${label}: invalid outputs entry`);
    }
  }
  for (const artRow of revision.publicArtifacts ?? []) {
    if (!artRow || !nonempty(artRow.path) || !isSha(artRow.sha256)) {
      throw new Error(`${label}: invalid publicArtifacts entry`);
    }
  }
  for (const corr of revision.corrections ?? []) {
    if (!corr || !nonempty(corr.chapter) || !nonempty(corr.claimId) || !nonempty(corr.scope)) {
      throw new Error(`${label}: invalid correction entry`);
    }
  }
  for (const ev of revision.reviewEvidence ?? []) {
    if (!ev || !nonempty(ev.kind) || !nonempty(ev.date) || !nonempty(ev.file) || !isSha(ev.sha256)) {
      throw new Error(`${label}: invalid reviewEvidence entry`);
    }
    if (!validReadableBookReviewFile(ev.file)) {
      throw new Error(`${label}: reviewEvidence file outside allowed directory: ${ev.file}`);
    }
  }
}

export function extractRouteChanges(revisions) {
  const merges = [];
  const fromToMap = new Map();
  const mergedFromSet = new Set();
  const mergedToSet = new Set();

  for (const rev of revisions ?? []) {
    for (const rc of rev.routeChanges ?? []) {
      if (rc.op !== 'merge') continue;
      const record = {
        op: 'merge',
        from: [...rc.from],
        to: rc.to,
        bookUnit: rc.bookUnit ?? null,
        anchors: rc.anchors ? { ...rc.anchors } : {},
        rationale: rc.rationale,
        revisionId: rev.id,
        date: rev.date,
        sourceCommit: rev.sourceCommit ?? rev.id,
      };
      merges.push(record);
      mergedToSet.add(rc.to);
      for (const oldRoute of rc.from) {
        mergedFromSet.add(oldRoute);
        fromToMap.set(oldRoute, record);
      }
    }
  }
  return { merges, fromToMap, mergedFromSet, mergedToSet };
}

export function isRouteRevised(revisions, ...routes) {
  const revised = new Set();
  for (const rev of revisions ?? []) {
    for (const r of rev.routes ?? []) revised.add(r);
    for (const rc of rev.routeChanges ?? []) {
      if (rc.op !== 'merge') continue;
      revised.add(rc.to);
      for (const oldRoute of rc.from ?? []) revised.add(oldRoute);
    }
  }
  return routes.some(r => revised.has(r));
}

export function validateRouteChangesAgainstOutput(revisions, activeRoutes, anchorsByRoute = null) {
  const errors = [];
  const activeSet = new Set(activeRoutes);
  const { merges } = extractRouteChanges(revisions);
  for (const merge of merges) {
    if (!activeSet.has(merge.to)) {
      errors.push(`Route merge target is absent from active routes: ${merge.to} (${merge.revisionId})`);
    }
    for (const oldRoute of merge.from) {
      if (activeSet.has(oldRoute)) {
        errors.push(`Merged legacy route still appears in active routes: ${oldRoute} -> ${merge.to} (${merge.revisionId})`);
      }
    }
    if (anchorsByRoute && merge.anchors) {
      const targetAnchors = anchorsByRoute.get(merge.to);
      for (const [oldKey, newHash] of Object.entries(merge.anchors)) {
        const anchorId = newHash.slice(1);
        if (!targetAnchors || !targetAnchors.has(anchorId)) {
          errors.push(`Route merge anchor mapping points to missing heading on ${merge.to}: ${oldKey} -> ${newHash} (${merge.revisionId})`);
        }
      }
    }
  }
  return errors;
}

export function extractClaimRetirements(revisions) {
  const retirements = [];
  for (const rev of revisions) {
    for (const row of rev.claims ?? []) {
      if (row.op !== 'retire') continue;
      retirements.push({
        id: row.id,
        successor: row.successor,
        successorRoute: row.successorRoute ?? null,
        rationale: row.rationale,
        revisionId: rev.id,
        date: rev.date,
        sourceCommit: rev.sourceCommit ?? rev.id,
        routes: row.routes ?? rev.routes,
      });
    }
  }
  return retirements;
}

export async function loadRevisions(root, index, expectedIndexPin = null) {
  if (!index || index.schemaVersion !== 1 || !nonempty(index.checkpointId) || !Array.isArray(index.revisions)) {
    throw new Error('Invalid post-checkpoint revisions index');
  }
  if (expectedIndexPin && editionDigest(index) !== expectedIndexPin) {
    throw new Error('Post-checkpoint revisions index differs from its pinned digest');
  }
  const revDir = await realpath(join(root, 'config', 'revisions'));
  const revisions = [];
  const seenIds = new Set();
  for (const entry of index.revisions) {
    if (!entry || !nonempty(entry.id) || !nonempty(entry.file) || !VALID_REVISION_FILE_RE.test(entry.file) || !isSha(entry.sha256)) {
      throw new Error('Invalid revision entry in config/revisions/index.json');
    }
    if (seenIds.has(entry.id)) throw new Error(`Duplicate revision id in index: ${entry.id}`);
    seenIds.add(entry.id);
    const full = resolve(revDir, entry.file);
    if (!(await lstat(full)).isFile() || await realpath(full) !== full) {
      throw new Error(`Revision file must be a regular file inside config/revisions/: ${entry.file}`);
    }
    const bytes = await readFile(full);
    if (sha256(bytes) !== entry.sha256) {
      throw new Error(`Revision file digest mismatch: ${entry.file}`);
    }
    const revision = JSON.parse(bytes.toString('utf8'));
    if (revision.id !== entry.id) throw new Error(`Revision id mismatch in ${entry.file}`);
    validateRevisionSchema(revision, entry.file);
    revisions.push(revision);
  }
  return revisions;
}

export function loadRevisionsSyncFromDisk(root, index, expectedIndexPin = null) {
  if (!index || index.schemaVersion !== 1 || !nonempty(index.checkpointId) || !Array.isArray(index.revisions)) {
    throw new Error('Invalid post-checkpoint revisions index');
  }
  if (expectedIndexPin && editionDigest(index) !== expectedIndexPin) {
    throw new Error('Post-checkpoint revisions index differs from its pinned digest');
  }
  const revDir = realpathSync(join(root, 'config', 'revisions'));
  const revisions = [];
  const seenIds = new Set();
  for (const entry of index.revisions) {
    if (!entry || !nonempty(entry.id) || !nonempty(entry.file) || !VALID_REVISION_FILE_RE.test(entry.file) || !isSha(entry.sha256)) {
      throw new Error('Invalid revision entry in config/revisions/index.json');
    }
    if (seenIds.has(entry.id)) throw new Error(`Duplicate revision id in index: ${entry.id}`);
    seenIds.add(entry.id);
    const full = resolve(revDir, entry.file);
    if (!lstatSync(full).isFile() || realpathSync(full) !== full) {
      throw new Error(`Revision file must be a regular file inside config/revisions/: ${entry.file}`);
    }
    const bytes = readFileSync(full);
    if (sha256(bytes) !== entry.sha256) {
      throw new Error(`Revision file digest mismatch: ${entry.file}`);
    }
    const revision = JSON.parse(bytes.toString('utf8'));
    if (revision.id !== entry.id) throw new Error(`Revision id mismatch in ${entry.file}`);
    validateRevisionSchema(revision, entry.file);
    revisions.push(revision);
  }
  return revisions;
}

/**
 * Applies post-checkpoint revisions in reverse order to recover the checkpoint input.
 * Also returns all declared claim retirements in chronological order.
 */
export async function applyRevisionsInverse(input, revisions, root = null) {
  const previousCatalog = structuredClone(input.catalog);
  const previousReadings = structuredClone(input.readings);
  const previousLiterature = structuredClone(input.literature);
  const previousFiles = new Map();
  for (const [k, v] of input.files) previousFiles.set(k, Buffer.from(v));

  const realRoot = root ? await realpath(root) : null;

  for (let i = revisions.length - 1; i >= 0; i--) {
    const rev = revisions[i];
    validateRevisionSchema(rev, rev.id);

    if (realRoot && Array.isArray(rev.reviewEvidence)) {
      for (const ev of rev.reviewEvidence) {
        const full = resolve(realRoot, ev.file);
        if (!(await lstat(full)).isFile() || await realpath(full) !== full) {
          throw new Error(`Revision ${rev.id} review evidence must be a regular file: ${ev.file}`);
        }
        const bytes = await readFile(full);
        if (sha256(bytes) !== ev.sha256) {
          throw new Error(`Revision ${rev.id} review evidence digest mismatch: ${ev.file}`);
        }
      }
    }

    for (const fileRow of rev.files ?? []) {
      const op = fileRow.op ?? 'modify';
      if (op === 'add') {
        const currentBytes = previousFiles.get(fileRow.path);
        if (!currentBytes) {
          throw new Error(`Revision ${rev.id} references missing added file: ${fileRow.path}`);
        }
        if (sha256(currentBytes) !== fileRow.toSha256) {
          throw new Error(`Revision ${rev.id} added file digest differs from declared toSha256: ${fileRow.path}`);
        }
        previousFiles.delete(fileRow.path);
      } else if (op === 'delete') {
        if (previousFiles.has(fileRow.path)) {
          throw new Error(`Revision ${rev.id} declared deleted file still present: ${fileRow.path}`);
        }
        const prevBytes = Buffer.from(fileRow.previous, 'utf8');
        if (sha256(prevBytes) !== fileRow.fromSha256) {
          throw new Error(`Revision ${rev.id} deleted file previous text differs from declared fromSha256: ${fileRow.path}`);
        }
        previousFiles.set(fileRow.path, prevBytes);
      } else {
        const currentBytes = previousFiles.get(fileRow.path);
        if (!currentBytes) {
          throw new Error(`Revision ${rev.id} references missing file: ${fileRow.path}`);
        }
        if (sha256(currentBytes) !== fileRow.toSha256) {
          throw new Error(`Revision ${rev.id} file digest differs from declared toSha256: ${fileRow.path}`);
        }
        if (fileRow.path === 'config/reader-numbering.json') {
          const parsedCurrent = JSON.parse(currentBytes.toString('utf8'));
          if (editionDigest(parsedCurrent) !== fileRow.toDigest) {
            throw new Error(`Revision ${rev.id} reader-numbering.json digest differs from declared toDigest`);
          }
        }
        const prevBytes = Buffer.from(fileRow.previous, 'utf8');
        if (sha256(prevBytes) !== fileRow.fromSha256) {
          throw new Error(`Revision ${rev.id} previous file text differs from declared fromSha256: ${fileRow.path}`);
        }
        previousFiles.set(fileRow.path, prevBytes);
      }
    }

    for (const family of RECORD_FAMILIES) {
      const rows = rev[family] ?? [];
      if (!rows.length) continue;
      const list = previousCatalog[family];
      if (!Array.isArray(list)) throw new Error(`Catalog missing family ${family}`);

      for (const row of rows) {
        if (row.op === 'add') {
          const idx = list.findIndex(item => item.id === row.id);
          if (idx < 0) throw new Error(`Revision ${rev.id} declared added ${family}:${row.id} not found`);
          list.splice(idx, 1);
        } else if (row.op === 'modify') {
          const idx = list.findIndex(item => item.id === row.id);
          if (idx < 0) throw new Error(`Revision ${rev.id} declared modified ${family}:${row.id} not found`);
          list[idx] = structuredClone(row.from);
        }
      }

      const retiredRows = rows.filter(row => row.op === 'retire').sort((a, b) => a.index - b.index);
      for (const row of retiredRows) {
        if (list.some(item => item.id === row.id)) {
          throw new Error(`Revision ${rev.id} declared retired ${family}:${row.id} still present in catalog`);
        }
        if (row.index > list.length) {
          throw new Error(`Revision ${rev.id} retired ${family}:${row.id} index ${row.index} out of bounds (${list.length})`);
        }
        list.splice(row.index, 0, structuredClone(row.from));
      }
    }
  }

  return {
    previousInput: {
      catalog: previousCatalog,
      readings: previousReadings,
      literature: previousLiterature,
      files: previousFiles,
    },
    retirements: extractClaimRetirements(revisions),
  };
}

/**
 * Overlays post-checkpoint revision record, file, output and publicArtifact transitions onto
 * the static checkpoint plan so currentBookRecordMatches, currentBookFileMatches,
 * validateReadableBookReviewedOutput and validateReadableBookPublicArtifacts accept declared revisions.
 */
export function applyRevisionsToPlan(basePlan, revisions, currentInput, previousInput) {
  if (!revisions.length) return basePlan;
  const currentInspect = inspectReadableBookEdition(currentInput);
  const previousInspect = inspectReadableBookEdition(previousInput);
  const recordMap = new Map(basePlan.changes.record);
  const fileMap = new Map(basePlan.changes.file);
  const outputsMap = new Map(basePlan.outputs);
  const artifactsMap = new Map(basePlan.publicArtifacts);

  for (const rev of revisions) {
    for (const family of RECORD_FAMILIES) {
      for (const row of rev[family] ?? []) {
        const key = `${family}:${row.id}`;
        const existing = recordMap.get(key);
        const prevDigest = previousInspect.records[key] ?? null;
        const currDigest = currentInspect.records[key] ?? null;
        const predecessors = existing
          ? [...(existing.predecessors ?? []), existing.from, existing.to].filter(Boolean)
          : prevDigest ? [prevDigest] : [];
        recordMap.set(key, {
          kind: 'record',
          key,
          from: existing ? existing.from : prevDigest,
          to: currDigest,
          predecessors,
          rationale: row.rationale,
          retired: row.op === 'retire',
        });
      }
    }
    for (const fileRow of rev.files ?? []) {
      const op = fileRow.op ?? 'modify';
      const existing = fileMap.get(fileRow.path);
      const fromHash = op === 'add' ? null : fileRow.fromSha256;
      const toHash = op === 'delete' ? null : fileRow.toSha256;
      fileMap.set(fileRow.path, {
        kind: 'file',
        key: fileRow.path,
        op,
        from: existing ? existing.from : fromHash,
        to: toHash,
        predecessors: existing
          ? [...(existing.predecessors ?? []), existing.from, existing.to].filter(Boolean)
          : fromHash ? [fromHash] : [],
        rationale: rev.rationale,
      });
    }
    for (const outRow of rev.outputs ?? []) {
      outputsMap.set(`${outRow.path}#${outRow.route}`, outRow);
    }
    for (const artRow of rev.publicArtifacts ?? []) {
      artifactsMap.set(artRow.path, artRow);
    }
  }

  return {
    ...basePlan,
    changes: { record: recordMap, file: fileMap },
    outputs: outputsMap,
    publicArtifacts: artifactsMap,
    revisions,
  };
}

/**
 * Synchronous lightweight overlay for runtime expectations (reader-current-expectations.mjs)
 * so currentBookRecordMatches / currentBookFileMatches / currentBookMdxMatches accept declared
 * post-checkpoint revisions during static validation and Next.js rendering.
 */
export function applyRevisionsToPlanStatic(basePlan, revisions, currentCatalog) {
  if (!revisions.length) return basePlan;
  const recordMap = new Map(basePlan.changes.record);
  const fileMap = new Map(basePlan.changes.file);
  const outputsMap = new Map(basePlan.outputs);
  const artifactsMap = new Map(basePlan.publicArtifacts);

  // Reconstruct previous catalog synchronously to compute exact public-projection digests
  const previousCatalog = structuredClone(currentCatalog);
  for (let i = revisions.length - 1; i >= 0; i--) {
    const rev = revisions[i];
    for (const family of RECORD_FAMILIES) {
      const rows = rev[family] ?? [];
      if (!rows.length) continue;
      const list = previousCatalog[family];
      for (const row of rows) {
        if (row.op === 'add') {
          const idx = list.findIndex(item => item.id === row.id);
          if (idx >= 0) list.splice(idx, 1);
        } else if (row.op === 'modify') {
          const idx = list.findIndex(item => item.id === row.id);
          if (idx >= 0) list[idx] = structuredClone(row.from);
        }
      }
      for (const row of rows.filter(r => r.op === 'retire').sort((a, b) => a.index - b.index)) {
        list.splice(row.index, 0, structuredClone(row.from));
      }
    }
  }
  const currPublic = publicCatalog(currentCatalog);
  const prevPublic = publicCatalog(previousCatalog);

  for (const rev of revisions) {
    for (const family of RECORD_FAMILIES) {
      const rawList = currentCatalog?.[family] ?? [];
      const pubList = currPublic?.[family] ?? [];
      const prevPubList = prevPublic?.[family] ?? [];
      for (const row of rev[family] ?? []) {
        const key = `${family}:${row.id}`;
        const existing = recordMap.get(key);
        const currRecord = rawList.find(item => item.id === row.id) ?? null;
        const currPub = pubList.find(item => item.id === row.id) ?? null;
        const prevPub = prevPubList.find(item => item.id === row.id) ?? null;
        const fromDigest = row.from ? { raw: editionDigest(row.from), public: prevPub ? editionDigest(prevPub) : null } : null;
        const toDigest = currRecord ? { raw: editionDigest(currRecord), public: currPub ? editionDigest(currPub) : null } : null;
        const predecessors = existing
          ? [...(existing.predecessors ?? []), existing.from, existing.to].filter(Boolean)
          : fromDigest ? [fromDigest] : [];
        recordMap.set(key, {
          kind: 'record',
          key,
          from: existing ? existing.from : fromDigest,
          to: toDigest,
          predecessors,
          rationale: row.rationale,
          retired: row.op === 'retire',
        });
      }
    }
    for (const fileRow of rev.files ?? []) {
      const op = fileRow.op ?? 'modify';
      const existing = fileMap.get(fileRow.path);
      const fromHash = op === 'add' ? null : fileRow.fromSha256;
      const toHash = op === 'delete' ? null : fileRow.toSha256;
      fileMap.set(fileRow.path, {
        kind: 'file',
        key: fileRow.path,
        op,
        from: existing ? existing.from : fromHash,
        to: toHash,
        predecessors: existing
          ? [...(existing.predecessors ?? []), existing.from, existing.to].filter(Boolean)
          : fromHash ? [fromHash] : [],
        rationale: rev.rationale,
      });
    }
    for (const outRow of rev.outputs ?? []) {
      outputsMap.set(`${outRow.path}#${outRow.route}`, outRow);
    }
    for (const artRow of rev.publicArtifacts ?? []) {
      artifactsMap.set(artRow.path, artRow);
    }
  }

  return {
    ...basePlan,
    changes: { record: recordMap, file: fileMap },
    outputs: outputsMap,
    publicArtifacts: artifactsMap,
    revisions,
  };
}

/**
 * Projects config/reader-numbering.json back to its checkpoint state if any post-checkpoint
 * revision modified it, verifying the current value matches the declared toDigest before rolling back.
 */
export function projectRevisionNumbering(revisions, value) {
  let current = value;
  for (let i = revisions.length - 1; i >= 0; i--) {
    const fileRow = (revisions[i].files ?? []).find(row => row.path === 'config/reader-numbering.json');
    if (fileRow) {
      if (editionDigest(current) !== fileRow.toDigest) {
        throw new Error(`Reader numbering differs from revision ${revisions[i].id} declared toDigest`);
      }
      current = JSON.parse(fileRow.previous);
    }
  }
  return current;
}

/**
 * Shared citation-address retargeting for retired claims.
 * Called identically in both lib/reader-book.ts and scripts/reader-surface.mjs.
 */
export function applyClaimRetirementsToCitations(entries, retirements) {
  if (!retirements || !retirements.length) return entries;

  const byId = new Map();
  for (const ret of retirements) byId.set(ret.id, ret);

  const resolveSuccessor = id => {
    const visited = new Set([id]);
    let cur = byId.get(id)?.successor ?? null;
    let route = byId.get(id)?.successorRoute ?? null;
    while (cur && byId.has(cur)) {
      if (visited.has(cur)) throw new Error(`Cycle in claim retirement successors involving ${id}`);
      visited.add(cur);
      const next = byId.get(cur);
      cur = next.successor;
      route = next.successorRoute ?? route;
    }
    return { claimId: cur, route };
  };

  const makeAnchor = (path, route, claimId) => {
    const prefix = path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route);
    return chapterNoteAnchor(prefix, claimId);
  };

  const chapterTargetFor = (path, route) => ({
    route,
    path,
    id: path === '/print' ? printUnitAnchor(route) : 'nd-page',
    kind: 'chapter',
  });

  const retargetTarget = (target, entryPath) => {
    if (target.kind !== 'note' || !byId.has(target.claimId)) return { target, retired: null };
    const ret = byId.get(target.claimId);
    const resolved = resolveSuccessor(target.claimId);
    if (!resolved.claimId) {
      return { target: chapterTargetFor(entryPath, target.route), retired: ret, crossRoute: false, noSuccessor: true };
    }
    const destRoute = resolved.route ?? target.route;
    const destPath = entryPath === '/print' ? '/print' : destRoute;
    const destId = makeAnchor(destPath, destRoute, resolved.claimId);
    return {
      target: { route: destRoute, path: destPath, id: destId, kind: 'note', claimId: resolved.claimId },
      retired: ret,
      crossRoute: entryPath !== '/print' && destRoute !== target.route,
      noSuccessor: false,
    };
  };

  const seenAddresses = new Set();
  const result = entries.map(entry => {
    seenAddresses.add(`${entry.path}#${entry.id}`);

    // Single-target note entry retired
    if (entry.targets?.length === 1 && entry.targets[0].kind === 'note' && byId.has(entry.targets[0].claimId)) {
      const { target: nextTarget, retired: ret, crossRoute, noSuccessor } = retargetTarget(entry.targets[0], entry.path);
      const edition = { sourceCommit: ret.sourceCommit, sourceDate: ret.date };
      const retiredFrom = { claimId: entry.targets[0].claimId, revisionId: ret.revisionId, rationale: ret.rationale };
      if (noSuccessor || crossRoute) {
        return {
          ...entry,
          mode: 'notice',
          targets: [nextTarget],
          scope: { text: ret.rationale, targets: [nextTarget] },
          edition,
          retiredFrom,
        };
      }
      return {
        ...entry,
        mode: 'alias',
        targets: [nextTarget],
        scope: undefined,
        edition,
        retiredFrom,
      };
    }

    // Multi-target entry where one or more targets are retired notes
    let modified = false;
    let nextTargets = entry.targets;
    let lastRet = null;
    if (entry.targets?.some(t => t.kind === 'note' && byId.has(t.claimId))) {
      modified = true;
      const mapped = [];
      const seenKeys = new Set();
      for (const t of entry.targets) {
        const res = retargetTarget(t, entry.path);
        if (res.retired) lastRet = res.retired;
        const key = `${res.target.path}#${res.target.id}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          mapped.push(res.target);
        }
      }
      nextTargets = mapped;
    }

    // Retained or notice entry whose scope.targets references a retired claim
    let nextScope = entry.scope;
    if (entry.scope?.targets?.some(t => t.kind === 'note' && byId.has(t.claimId))) {
      modified = true;
      const updatedTargets = [];
      const seenTargetKeys = new Set();
      for (const t of entry.scope.targets) {
        const res = retargetTarget(t, t.path);
        if (res.retired) lastRet = res.retired;
        if (res.noSuccessor) continue;
        const key = `${res.target.path}#${res.target.id}`;
        if (!seenTargetKeys.has(key)) {
          seenTargetKeys.add(key);
          updatedTargets.push(res.target);
        }
      }
      nextScope = { ...entry.scope, targets: updatedTargets };
    }

    if (modified) {
      return {
        ...entry,
        targets: nextTargets,
        scope: nextScope,
        retiredFrom: entry.retiredFrom ?? { revisionId: lastRet?.revisionId ?? retirements[retirements.length - 1].revisionId },
      };
    }

    return entry;
  });

  // Synthesize alias/notice entries for post-hostedHistory retired claims on their own declared routes + /print
  for (const ret of retirements) {
    const resolved = resolveSuccessor(ret.id);
    const edition = { sourceCommit: ret.sourceCommit, sourceDate: ret.date };
    const retiredFrom = { claimId: ret.id, revisionId: ret.revisionId, rationale: ret.rationale };
    for (const route of ret.routes ?? []) {
      for (const path of [route, '/print']) {
        const oldId = makeAnchor(path, route, ret.id);
        const addr = `${path}#${oldId}`;
        if (seenAddresses.has(addr)) continue;
        seenAddresses.add(addr);
        if (resolved.claimId) {
          const destRoute = resolved.route ?? route;
          const destPath = path === '/print' ? '/print' : destRoute;
          const targetId = makeAnchor(destPath, destRoute, resolved.claimId);
          const target = { route: destRoute, path: destPath, id: targetId, kind: 'note', claimId: resolved.claimId };
          const crossRoute = path !== '/print' && destRoute !== route;
          result.push(crossRoute
            ? { route, path, id: oldId, mode: 'notice', targets: [target], scope: { text: ret.rationale, targets: [target] }, edition, retiredFrom }
            : { route, path, id: oldId, mode: 'alias', targets: [target], edition, retiredFrom });
        } else {
          const chapterTarget = chapterTargetFor(path, route);
          result.push({
            route,
            path,
            id: oldId,
            mode: 'notice',
            targets: [chapterTarget],
            scope: { text: ret.rationale, targets: [chapterTarget] },
            edition,
            retiredFrom,
          });
        }
      }
    }
  }

  return result;
}

/**
 * Shared citation-address retargeting for merged routes (post-checkpoint routeChanges).
 * Remaps targets pointing at merged legacy routes to their merged destination route and anchor,
 * while preserving /print book-unit anchors unchanged.
 */
export function applyRouteChangesToCitations(entries, revisions) {
  const { fromToMap } = extractRouteChanges(revisions);
  if (!fromToMap.size) return entries;

  const remapAnchorId = (oldRoute, oldId, merge, kind, claimId) => {
    if (kind === 'note' && claimId) {
      return chapterNoteAnchor(chapterAnchorPrefix(merge.to), claimId);
    }
    const explicit = merge.anchors[`${oldRoute}#${oldId}`] ?? merge.anchors[`#${oldId}`];
    if (explicit) return explicit.slice(1);
    return oldId;
  };

  const remapTarget = target => {
    if (!target || target.path === '/print') return target;
    const merge = fromToMap.get(target.route) ?? fromToMap.get(target.path);
    if (!merge) return target;
    return {
      ...target,
      route: merge.to,
      path: merge.to,
      id: remapAnchorId(target.route, target.id, merge, target.kind, target.claimId),
    };
  };

  return entries.map(entry => {
    let changed = false;
    const nextTargets = entry.targets?.map(t => {
      const remapped = remapTarget(t);
      if (remapped !== t) changed = true;
      return remapped;
    });
    let nextScope = entry.scope;
    if (entry.scope?.targets) {
      const remappedScopeTargets = entry.scope.targets.map(t => {
        const remapped = remapTarget(t);
        if (remapped !== t) changed = true;
        return remapped;
      });
      if (changed) nextScope = { ...entry.scope, targets: remappedScopeTargets };
    }
    if (!changed) return entry;
    return {
      ...entry,
      targets: nextTargets,
      scope: nextScope,
    };
  });
}
