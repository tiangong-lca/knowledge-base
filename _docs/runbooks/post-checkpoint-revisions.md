---
title: Post-checkpoint revisions and claim retirement runbook
docType: runbook
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: en
whenToUse:
  - when authoring a post-checkpoint chapter revision, claim rewrite, merge or retirement
  - when verifying historical chain integrity against the 2026-11-21 checkpoint
whenToUpdate:
  - when the post-checkpoint revision schema or checkpoint pin changes
checkPaths:
  - config/revisions/**
  - config/readable-book-checkpoint.json
  - scripts/reader-checkpoint.mjs
  - scripts/reader-revisions.mjs
  - scripts/verify-checkpoint-history.mjs
lastReviewedAt: 2026-11-21
lastReviewedCommit: d139cbc7e35b43c882d60208172b9c71ff73c022
related:
  - ../publication-contract.md
  - ../reader-publication-contract.md
  - ../editorial-protocol.md
  - ../lca-book-goal.md
---

# Post-checkpoint revisions and claim retirement

## 1. Two-tier verification model

- **HEAD validation (`pnpm validate`, `next build`, `node scripts/export.mjs`)** runs `qualifyCheckpointSources` (`scripts/reader-checkpoint.mjs`). It reverses all declared revisions in `config/revisions/index.json` against HEAD and asserts that the recovered source state equals `checkpoint.stateDigest` (`4ca4fcd1...`). Any undeclared edit to `knowledge/catalog.json`, `content/**`, `config/reader-numbering.json`, or any other governed file fails closed.
- **Historical verification (`node scripts/verify-checkpoint-history.mjs`)** materializes the byte-pinned snapshot (`scripts/fixtures/checkpoint-2026-11-21/`), cross-checks every file against git commit `fff371413af1436a9e7802831c349a583bfa41b6` when history is present, and replays the full 41-unit `qualifyHistoricalReaderSources` chain plus `/changes/` ledger digest check. CI runs this on every PR and push to `main`.

## 2. Authoring a post-checkpoint revision

A typical integrated chapter rewrite touches only:
1. `knowledge/catalog.json` (rewritten, added, or retired claims/records; update any `premiseIds` that pointed to a retired claim);
2. the chapter MDX file(s) (and `config/reader-numbering.json` only if titles/part intros change);
3. `_docs/editorial/<date>-<unit>.md` and `_docs/editorial/review-evidence/<id>/` (independent source, reader and output evidence);
4. one declarative revision file `config/revisions/<id>.json`;
5. `config/revisions/index.json` (append `{ id, file, sha256 }`) and `revisionsIndexPin` in `scripts/reader-checkpoint.mjs`.

No edits to the 36 historical `scripts/reader-*.test.mjs` files are required; they read their starting state from `checkpointInput()`.

### Revision JSON fields

- `schemaVersion`: `1`
- `id`, `date`, `title`, `rationale` (reader-facing summary rendered on `/changes/`), `routes`, `sourceCommit`
- `claims` (and optionally `concepts`, `evidence`, `sources`, `mappings`):
  - `{ id, op: "modify", from: <full previous record>, rationale }`
  - `{ id, op: "add", from: null, rationale }`
  - `{ id, op: "retire", from: <full previous record>, index: <previous array index>, successor: <successor claim id or null>, rationale }`
- `files`: `{ path, fromSha256, toSha256, previous: <utf8 previous content> }`
- `corrections`: `{ chapter, claimId, scope }` (rendered on `/changes/`)
- `reviewEvidence`: `{ kind, date, file, sha256 }` (must be regular files under `_docs/editorial/review-evidence/`)

### Claim retirement behavior

- When `successor` is a claim id, all historical web and `/print` note anchors for the retired claim are retargeted to `mode: "alias"` landing on the successor's note (`<li>`), rendered via invisible `LegacyCitationAliases`.
- When `successor` is `null`, historical anchors emit an explicit chapter-level `mode: "notice"` with `rationale`.
- Both `lib/reader-book.ts` and `scripts/reader-surface.mjs` run the shared `applyClaimRetirementsToCitations` helper, and `/changes/` automatically lists every post-checkpoint revision and retirement (`data-changes-revision`, `data-changes-retirement`).

## 3. Required local checks

```bash
pnpm validate
pnpm test
node scripts/verify-checkpoint-history.mjs
pnpm typecheck
pnpm build
```
