#!/usr/bin/env node
/**
 * Apply a declarative post-checkpoint revision spec to the repository.
 *
 * Usage:
 *   node scripts/revision-apply.mjs <spec.mjs> [--allow-case-binding] [--repo <dir>]
 *
 * Guarantees:
 * - Reads clean baseline from git HEAD (idempotent across re-runs).
 * - Refuses to modify caseBinding: true claims unless --allow-case-binding is set
 *   AND a matching knowledge/cases/*.publication.json fileTransition is supplied.
 * - Refuses internal cl-... IDs in reader-facing rationale / correctionScope.
 * - Refuses H2 heading count/anchor changes and forward premises on non-caseBinding claims.
 * - Writes config/revisions/<id>.json, review evidence, index.json, and revisionsIndexPin.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { editionDigest } from './reader-current-edition.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const defaultRepoRoot = resolve(__dirname, '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function assertNoInternalIds(label, text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(`Clean-Delivery violation: empty ${label}`);
  }
  if (/\bcl-[a-z0-9-]+/i.test(text)) {
    throw new Error(`Clean-Delivery violation: internal claim ID in ${label}: ${text}`);
  }
}

export function validateMdxInvariants(filePath, origMdx, newMdx, claimMap) {
  const origH2s = [...origMdx.matchAll(/^## .+$/gm)].map(m => m[0]);
  const newH2s = [...newMdx.matchAll(/^## .+$/gm)].map(m => m[0]);
  if (origH2s.length !== newH2s.length) {
    throw new Error(`H2 count changed in ${filePath}: ${origH2s.length} -> ${newH2s.length}`);
  }
  for (let i = 0; i < origH2s.length; i++) {
    const origAnchor = origH2s[i].match(/\[#[^\]]+\]/)?.[0];
    const newAnchor = newH2s[i].match(/\[#[^\]]+\]/)?.[0];
    if (origAnchor !== newAnchor) {
      throw new Error(`H2 anchor changed in ${filePath}: ${origAnchor} -> ${newAnchor}`);
    }
  }

  const mdxOrder = [...newMdx.matchAll(/<Prose\s+ids="([^"]+)"/g)].flatMap(m => m[1].trim().split(/\s+/));
  const posMap = new Map(mdxOrder.map((id, i) => [id, i]));
  for (const id of mdxOrder) {
    const claim = claimMap.get(id);
    if (!claim) throw new Error(`${filePath} references unknown claim ${id}`);
    if (claim.caseBinding) continue;
    for (const premise of claim.premiseIds ?? []) {
      if (posMap.has(premise) && posMap.get(premise) >= posMap.get(id)) {
        throw new Error(`Forward premise in ${filePath}: ${id} (pos ${posMap.get(id)}) -> ${premise} (pos ${posMap.get(premise)})`);
      }
    }
  }
}

export function applyCatalogAndMdxTransform({
  spec,
  origCatalog,
  readBaselineFile,
  allowCaseBinding = false,
}) {
  assertNoInternalIds('revision.rationale', spec.rationale);

  const origById = new Map(origCatalog.claims.map((c, index) => [c.id, { claim: c, index }]));

  function mergeEvidence(idsList) {
    const seen = new Set();
    const evidenceIds = [];
    const evidenceLinks = [];
    for (const cid of idsList) {
      const rec = origById.get(cid);
      if (!rec) throw new Error(`mergeEvidence: unknown claim ${cid}`);
      const c = rec.claim;
      for (const eid of c.evidenceIds ?? []) {
        if (!seen.has(eid)) {
          seen.add(eid);
          evidenceIds.push(eid);
          const link = (c.evidenceLinks ?? []).find(l => l.evidenceId === eid);
          if (link) evidenceLinks.push(structuredClone(link));
        }
      }
    }
    return { evidenceIds, evidenceLinks };
  }

  function mergeCaveats(idsList, extra = []) {
    const seen = new Set();
    const out = [];
    for (const cid of idsList) {
      const rec = origById.get(cid);
      if (!rec) continue;
      for (const cav of rec.claim.caveats ?? []) {
        if (!seen.has(cav)) {
          seen.add(cav);
          out.push(cav);
        }
      }
    }
    for (const cav of extra) {
      if (!seen.has(cav)) {
        seen.add(cav);
        out.push(cav);
      }
    }
    return out;
  }

  const newCatalog = structuredClone(origCatalog);
  const revisionClaims = [];
  const retireSpecs = spec.retireSpecs ?? [];
  const retiredSet = new Set(retireSpecs.map(r => r.id));

  const casePubPaths = (spec.fileTransitions ?? [])
    .map(f => f.path)
    .filter(p => /^knowledge\/cases\/[^/]+\.publication\.json$/.test(p));

  // 1. Apply updates
  for (const [id, u] of Object.entries(spec.updates ?? {})) {
    const idx = newCatalog.claims.findIndex(c => c.id === id);
    if (idx < 0) throw new Error(`Missing claim ${id}`);
    const prev = structuredClone(newCatalog.claims[idx]);
    if (prev.caseBinding) {
      if (!allowCaseBinding || !casePubPaths.length) {
        throw new Error(`FORBIDDEN: attempted to modify caseBinding claim ${id} without --allow-case-binding and a matching publication fileTransition`);
      }
    }
    assertNoInternalIds(`correctionScope(${id})`, u.correctionScope);

    const next = structuredClone(prev);
    next.text = u.text;
    if (u.scope !== undefined) next.scope = u.scope;
    if (u.premiseIds !== undefined) next.premiseIds = u.premiseIds;
    if (!prev.caseBinding) {
      next.reviewedAt = spec.date;
    }
    if (u.mergeFrom) {
      const merged = mergeEvidence(u.mergeFrom);
      next.evidenceIds = merged.evidenceIds;
      next.evidenceLinks = merged.evidenceLinks;
      next.caveats = mergeCaveats(u.mergeFrom, u.extraCaveats ?? []);
    } else if (u.extraCaveats?.length) {
      next.caveats = mergeCaveats([id], u.extraCaveats);
    }
    if (u.replaceCaveats) {
      next.caveats = u.replaceCaveats;
    }
    newCatalog.claims[idx] = next;
    revisionClaims.push({ id, op: 'modify', from: prev, rationale: u.correctionScope });
  }

  // 2. Remove retired claims (descending index order to keep indices exact)
  const retireWithIdx = retireSpecs
    .map(r => {
      const orig = origById.get(r.id);
      if (!orig) throw new Error(`Cannot retire missing claim ${r.id}`);
      if (orig.claim.caseBinding) throw new Error(`FORBIDDEN: cannot retire caseBinding claim ${r.id}`);
      assertNoInternalIds(`retire.rationale(${r.id})`, r.rationale);
      return { ...r, orig };
    })
    .sort((a, b) => b.orig.index - a.orig.index);

  for (const r of retireWithIdx) {
    const curIdx = newCatalog.claims.findIndex(c => c.id === r.id);
    if (curIdx < 0) throw new Error(`Already removed ${r.id}`);
    newCatalog.claims.splice(curIdx, 1);
  }

  for (const r of [...retireWithIdx].reverse()) {
    const rec = {
      id: r.id,
      op: 'retire',
      from: structuredClone(r.orig.claim),
      index: r.orig.index,
      successor: r.successor,
      rationale: r.rationale,
    };
    if ((spec.routes?.length ?? 0) > 1) {
      if (!r.routes?.length) {
        throw new Error(`Multi-route revision requires explicit routes on retired claim ${r.id}`);
      }
      rec.routes = r.routes;
    }
    if (r.successorRoute) rec.successorRoute = r.successorRoute;
    revisionClaims.push(rec);
  }

  // 3. Append new claims
  for (const nc of spec.newClaims ?? []) {
    assertNoInternalIds(`newClaim.reasoning(${nc.id})`, nc.reasoning);
    const { evidenceIds, evidenceLinks } = mergeEvidence(nc.evidenceFrom);
    const caveats = nc.caveats ?? mergeCaveats(nc.caveatsFrom ?? [], nc.extraCaveats ?? []);
    const claimObj = {
      id: nc.id,
      text: nc.text,
      kind: nc.kind ?? 'interpretation',
      scope: nc.scope,
      evidenceIds,
      evidenceLinks,
      premiseIds: nc.premiseIds ?? [],
      conceptIds: nc.conceptIds ?? [],
      caveats,
      status: 'reviewed',
      reviewKind: 'agent-source-check',
      reviewedAt: spec.date,
      reasoning: nc.reasoning,
    };
    newCatalog.claims.push(claimObj);
    revisionClaims.push({ id: nc.id, op: 'add', from: null, rationale: nc.reasoning });
  }

  // 4. Verify zero dangling premiseIds or concept definitionClaimIds
  for (const c of newCatalog.claims) {
    for (const p of c.premiseIds ?? []) {
      if (retiredSet.has(p)) {
        throw new Error(`Dangling retired premise ${p} in ${c.id}`);
      }
    }
  }
  for (const con of newCatalog.concepts ?? []) {
    for (const d of con.definitionClaimIds ?? []) {
      if (retiredSet.has(d)) {
        throw new Error(`Dangling retired concept definitionClaimId ${d} in ${con.id}`);
      }
    }
  }

  // 5. Resolve MDX & non-MDX file transitions and validate MDX invariants
  const claimMap = new Map(newCatalog.claims.map(c => [c.id, c]));
  const resolvedMdxFiles = [...(spec.mdxFiles ?? [])];
  for (const [relPath, edits] of Object.entries(spec.mdxEdits ?? {})) {
    let content = readBaselineFile(relPath);
    for (const edit of edits) {
      if (!content.includes(edit.old)) {
        throw new Error(`mdxEdits target not found in ${relPath}: ${edit.old.slice(0, 60)}`);
      }
      content = content.replace(edit.old, edit.new);
    }
    resolvedMdxFiles.push({ path: relPath, content });
  }

  const filesToWrite = [];
  const revisionFiles = [];
  for (const f of resolvedMdxFiles) {
    const origMdx = readBaselineFile(f.path);
    validateMdxInvariants(f.path, origMdx, f.content, claimMap);
    filesToWrite.push({ path: f.path, content: f.content });
    revisionFiles.push({
      path: f.path,
      fromSha256: sha256(Buffer.from(origMdx, 'utf8')),
      toSha256: sha256(Buffer.from(f.content, 'utf8')),
      previous: origMdx,
    });
  }

  for (const ft of spec.fileTransitions ?? []) {
    const origStr = readBaselineFile(ft.path);
    const nextStr = ft.content;
    const entry = {
      path: ft.path,
      fromSha256: sha256(Buffer.from(origStr, 'utf8')),
      toSha256: sha256(Buffer.from(nextStr, 'utf8')),
      previous: origStr,
    };
    if (ft.toDigest) entry.toDigest = ft.toDigest;
    filesToWrite.push({ path: ft.path, content: nextStr });
    revisionFiles.push(entry);
  }

  for (const fa of spec.fileAdditions ?? []) {
    filesToWrite.push({ path: fa.path, content: fa.content });
    revisionFiles.push({
      path: fa.path,
      op: 'add',
      toSha256: sha256(Buffer.from(fa.content, 'utf8')),
    });
  }

  const filesToDelete = [];
  for (const delPath of spec.fileDeletions ?? []) {
    const origStr = readBaselineFile(delPath);
    filesToDelete.push(delPath);
    revisionFiles.push({
      path: delPath,
      op: 'delete',
      fromSha256: sha256(Buffer.from(origStr, 'utf8')),
      previous: origStr,
    });
  }

  const routeChanges = (spec.routeChanges ?? []).map(rc => {
    assertNoInternalIds(`routeChange.rationale(${rc.to})`, rc.rationale);
    return rc;
  });

  const corrections = [
    ...Object.entries(spec.updates ?? {}).map(([id, u]) => ({
      chapter: u.chapter,
      claimId: id,
      scope: u.correctionScope,
    })),
    ...(spec.newClaims ?? []).map(nc => ({
      chapter: nc.chapter,
      claimId: nc.id,
      scope: nc.reasoning,
    })),
  ];

  return { newCatalog, revisionClaims, revisionFiles, filesToWrite, filesToDelete, routeChanges, corrections };
}

export async function applyRevisionSpec(spec, { repo = defaultRepoRoot, allowCaseBinding = false } = {}) {
  const readGitHead = relPath =>
    execFileSync('git', ['-C', repo, 'show', `HEAD:${relPath}`], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    });

  const headCommit = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const origCatalog = JSON.parse(readGitHead('knowledge/catalog.json'));

  const { newCatalog, revisionClaims, revisionFiles, filesToWrite, filesToDelete, routeChanges, corrections } =
    applyCatalogAndMdxTransform({
      spec,
      origCatalog,
      readBaselineFile: readGitHead,
      allowCaseBinding,
    });

  for (const f of filesToWrite) {
    const fullPath = join(repo, f.path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, f.content);
  }
  for (const delPath of filesToDelete) {
    await unlink(join(repo, delPath)).catch(err => {
      if (err?.code !== 'ENOENT') throw err;
    });
  }
  await writeFile(join(repo, 'knowledge/catalog.json'), JSON.stringify(newCatalog, null, 2) + '\n');

  const evRelPath = `_docs/editorial/review-evidence/${spec.id}/review-record.json`;
  const evDir = join(repo, `_docs/editorial/review-evidence/${spec.id}`);
  await mkdir(evDir, { recursive: true });
  const evObj = {
    schemaVersion: 1,
    revisionId: spec.id,
    task: spec.task,
    date: spec.date,
    baseCommit: headCommit,
    summary: spec.rationale,
    routes: spec.routes,
    updatedClaims: Object.keys(spec.updates ?? {}).length,
    retiredClaims: (spec.retireSpecs ?? []).length,
    addedClaims: (spec.newClaims ?? []).length,
    routeChanges: routeChanges.length,
  };
  const evBytes = Buffer.from(JSON.stringify(evObj, null, 2) + '\n', 'utf8');
  await writeFile(join(repo, evRelPath), evBytes);

  const revision = {
    schemaVersion: 1,
    id: spec.id,
    date: spec.date,
    task: spec.task,
    title: spec.title,
    rationale: spec.rationale,
    routes: spec.routes,
    claims: revisionClaims,
    concepts: [],
    evidence: [],
    sources: [],
    mappings: [],
    files: revisionFiles,
    ...(routeChanges.length ? { routeChanges } : {}),
    outputs: [],
    publicArtifacts: [],
    corrections,
    reviewEvidence: [
      {
        kind: spec.evidenceKind ?? 'editorial-integration',
        date: spec.date,
        file: evRelPath,
        sha256: sha256(evBytes),
      },
    ],
  };

  const revFileName = `${spec.id}.json`;
  const revBytes = Buffer.from(JSON.stringify(revision, null, 2) + '\n', 'utf8');
  await writeFile(join(repo, 'config/revisions', revFileName), revBytes);

  const revIndex = JSON.parse(readGitHead('config/revisions/index.json'));
  const existingIdx = revIndex.revisions.findIndex(r => r.id === spec.id);
  const indexEntry = { id: spec.id, file: revFileName, sha256: sha256(revBytes) };
  if (existingIdx >= 0) revIndex.revisions[existingIdx] = indexEntry;
  else revIndex.revisions.push(indexEntry);
  await writeFile(join(repo, 'config/revisions/index.json'), JSON.stringify(revIndex, null, 2) + '\n');

  const newPin = editionDigest(revIndex);
  const cpSrc = readGitHead('scripts/reader-checkpoint.mjs');
  const updatedCp = cpSrc.replace(
    /export const revisionsIndexPin = '[0-9a-f]{64}';/,
    `export const revisionsIndexPin = '${newPin}';`,
  );
  if (!updatedCp.includes(newPin)) throw new Error('Failed to update revisionsIndexPin');
  await writeFile(join(repo, 'scripts/reader-checkpoint.mjs'), updatedCp);

  return {
    id: spec.id,
    totalBefore: origCatalog.claims.length,
    totalAfter: newCatalog.claims.length,
    updates: Object.keys(spec.updates ?? {}).length,
    retires: (spec.retireSpecs ?? []).length,
    adds: (spec.newClaims ?? []).length,
    newPin,
  };
}

async function main() {
  const args = process.argv.slice(2);
  let specArg = null;
  let allowCaseBinding = false;
  let repo = defaultRepoRoot;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--allow-case-binding') allowCaseBinding = true;
    else if (args[i] === '--repo') repo = resolve(args[++i]);
    else if (!specArg) specArg = args[i];
  }

  if (!specArg) {
    console.error('Usage: node scripts/revision-apply.mjs <spec.mjs> [--allow-case-binding] [--repo <dir>]');
    process.exit(2);
  }

  const specMod = await import(pathToFileURL(resolve(specArg)).href);
  const res = await applyRevisionSpec(specMod.default, { repo, allowCaseBinding });
  console.log(`Applied ${res.id}!`);
  console.log(`Total catalog claims: ${res.totalBefore} -> ${res.totalAfter}`);
  console.log(`Updates: ${res.updates}, Retires: ${res.retires}, Adds: ${res.adds}`);
  console.log(`New revisionsIndexPin: ${res.newPin}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
