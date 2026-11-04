---
docType: contract
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when site architecture, dependencies or publication tooling change
whenToUpdate:
  - when site architecture, dependencies or publication tooling change
checkPaths:
  - "app/**"
  - "components/**"
  - "lib/**"
  - "scripts/**"
  - "package.json"
  - ".github/**"
lastReviewedAt: 2026-11-04
lastReviewedCommit: fc1b1167d1849e276a3f0a8d9fad004240375de0
---

# Publication architecture

Next.js App Router, Fumadocs MDX/UI, React, TypeScript and Tailwind produce a static site. Chinese is the initial publication language; English labels preserve terminology. Exact compatible dependencies and the pnpm lockfile are authoritative. The architecture follows the workspace docs site; its product routes, four-locale editorial policy and hosted search identity are not imported.

MDX carries authored prose and renders canonical claims by stable IDs. knowledge/catalog.json owns source/evidence/claim/concept/mapping records and coverage. lib/catalog.ts applies the same public projection used by scripts/export.mjs. Reviewed status records editorial source checking, not expert certification. Draft, needs-review and withdrawn claims do not enter public claim statements. Unresolved topics remain visible in coverage and explicit caveats.

scripts/knowledge.mjs validates references and required semantics, derives reverse dependencies, and selects publication records. scripts/validate.mjs checks the actual catalog and MDX references. Tests include deliberate invalid records; passing them establishes structural integrity only. scripts/impact.mjs traverses changed source/evidence/claim/concept/mapping dependencies to identify review work. It does not silently approve or rewrite content.

Build runs validation, static generation and export verification. out/downloads contains public catalog, dependencies and source identity. Dirty builds are visibly working previews. Export has no access to private research or licensed originals. Public metadata/reading registers in knowledge/research are separately validated and projected. Search is client-side over the public corpus, without a backend service. llms.txt points to the same public evidence and coverage.

scripts/snapshot.mjs freezes the entire static artifact and file hashes from a clean committed revision into a new destination; it refuses overwrites and mismatched source identity. The print route renders all chapters and evidence. PDF is a separately checked print artifact, not an assumed framework export capability. Historical hosting retention and downloadable PDF publication remain operator responsibilities under releases/README.md.

CI checks tests, types, static build, strict Docpact configuration and scoped governance lint. Actions have immutable pins. A build proves neither source entailment nor scientific approval. Repository CI does not configure external production hosting, search services or archival DOI. The new repository does not depend on private workspace source at build time.

## Git hosting and domain qualification

EdgeOne Makers project `makers-w8wl4xjmt2mj` imports `tiangong-lca/knowledge-base`, branch `main`, with the repository root as its build root. `edgeone.json` owns `pnpm install --frozen-lockfile`, `pnpm build`, and the static output directory `out`. The production hostname selected by the user is `prism.tiangong.earth`; domain and HTTPS qualification are tracked in knowledge-base #3. These configured identities do not establish that deployment or DNS activation has succeeded.

Both `edgeone.json` and `.nvmrc` pin Node 24.18.0, which is preinstalled by EdgeOne and satisfies the package's `>=24.18.0 <25` range. The first hosted attempt on Node 24.19.0 failed while switching runtime, before dependency installation. An exact preinstalled runtime avoids downloading an unsupported version or inheriting a moving major-only selector. See the [EdgeOne build guide](https://pages.edgeone.ai/zh/document/build-guide).

The exact pnpm 12.16.1 package-manager pin and frozen lockfile remain authoritative. Official pnpm 11+ behavior downloads and runs the declared package-manager version by default (`pmOnFail: download`); the hosted install log must confirm the selected version rather than assuming the platform's preinstalled pnpm version. No additional package manager owns dependencies, and `corepack enable` must not mutate platform-owned shims. See [pnpm package-manager version behavior](https://github.com/pnpm/pnpm.io/blob/main/docs/settings/cli.md).

Hosted Git builds must retain `.git` metadata: build identity and export read the actual commit and worktree state. Production qualification checks `/downloads/manifest.json` against the selected merged commit and verifies `dirty: false`, then checks nested document routes, static assets, search and HTTPS on the custom hostname. Platform-generated files must not silently turn a production build into a claimed clean source edition. Static export retains trailing slashes and unoptimized images; deploy at the hostname root so root-relative document and asset links resolve correctly.

## Hosted build configuration stability

EdgeOne preview `dps7r5fo61hd` exposed two tracked configuration rewrites and one generated artifact directory. Its pnpm launcher added the exact `@pnpm/exe` 12.16.1 package-manager record and platform snapshots; the lockfile now preserves that registry-verified executable identity alongside the existing pnpm 12.16.1 record. No runtime dependency version changes are required. `pnpm install --frozen-lockfile` must preserve the committed lockfile in local and hosted builds.

The hosted builder serializes `tsconfig.json` with `JSON.stringify` and excludes its function-source directories (`cloud-functions`, `node-functions`, `edge-functions`, `agents`, `functions`) from the static site's type program. The committed file uses that same compact serialization and explicit exclusions, with compiler options and include paths unchanged. Formatting the file differently would recreate the host-only tracked diff. A future function implementation requires its own reviewed type-checking scope.

Only the observed generated `/.edgeone/` artifact directory is ignored. Source identity still checks all tracked changes and other untracked paths; no post-build reset or manifest exclusion grants a clean-source identity. Qualification requires hosted logs and `/downloads/manifest.json` to agree on the selected source commit with `dirty: false`.

## Research register and continuous prose

`knowledge/research/literature-map.json` preserves work discovery, queries, coverage and gaps; `readings.json` records selected passages, carrier identity, appraisal and structure changes. `scripts/research.mjs` validates joins and page bounds and projects nested public allowlists. `scripts/validate.mjs` validates those registers together with catalog bindings and literal MDX Claim/Prose references. `/research/` now presents a reader bibliography and citation locations; the execution protocol and revision history are retained in development Markdown. Structured research data remains separately available for reproducibility; originals remain outside the repository.

`getClaimEvidence` resolves claim-specific relations and rationale without silently supplementing incomplete explicit links. `lib/catalog.ts` declares optional source artifact/reading and evidence appraisal types. `Prose ids="..."` emits canonical claim paragraphs and small links to claim and evidence anchors; detail views preserve scope, premise, rationale and review limits. Export still includes only the reviewed claim closure, with backward compatibility for original evidence-level roles. No dependency or hosted build configuration change is needed for this extension.

Reading and passage identifiers also participate in reverse dependencies: changing a reading receipt or a referenced passage reaches dependent evidence and claims. Each mixed-carrier evidence detail resolves its own passage artifact/hash, rather than presenting the source's selected snapshot as if it were every cited carrier. Metadata-only reading records have no implied appraisal or reading date in the UI.

## Connected calculation and publication

`scripts/teaching-case.mjs` evaluates the declared four-process teaching model with exact decimal/rational arithmetic. It validates service coverage, coordinate and factor identities, shared parameter assumptions and both substrate scenarios. The paired difference is affine, so endpoint evaluation bounds its full declared interval; ordering and tolerance predicates remain separate. This is a bounded model, not a general LCA solver.

`scripts/case-publication.mjs` projects nested allowlists, computes the downloadable UTF-8 input hash, interpolates primitive-only claim tokens, checks factor/evidence joins and validates canonical claim bindings. Export writes versioned inputs and evaluated receipts under `/downloads/cases/` and covers them with the build manifest. The impact graph accepts a case ID or case ID@version.

The server `TeachingCase` component projects the repository specification before passing it to the client. Raw JSON and Node publication helpers must not enter the client graph. MDX references use literal registered id/version pairs. The client runs the same evaluator and presents scenario/parameter controls, a difference plot, matrices and numeric traces; fixed tables remain available to print and without interaction. A component currently supports CASE-WALL-CONNECT v1.0.0; new cases require a reviewed renderer binding as well as registration.

Derived text artifacts retain original URL/media type and explicit absence of original bytes; their text hash is visibly distinct from an original-document hash. Catalog/research validation checks the same qualification fields and their joins; public exports retain them while excluding raw captures and private metadata.

## Reader shell and scholarly apparatus

The standard Fumadocs DocsLayout owns document navigation, sidebar, TOC, search/theme controls and mobile menu. HomeLayout supplies the other public routes. Theme/brand tokens follow the owning docs site; homepage72rem sizing does not constrain the document grid. No extra42rem prose cap or second document header/mobile index is added. Chinese translations and the existing local knowledge search corpus are retained without adding an external search service.

`lib/reader-book.ts` derives chapter order from the same page tree as the sidebar. `scripts/reader-book.mjs` creates one note plan per complete MDX source, ignoring code/comment examples. `ChapterContent` injects paragraph components with one local reference marker, then appends reader annotations. `ClaimAnnotation` supplies source locations, scope and material caveats without execution logs or visible database keys. Print reuses the renderer with unique prefixes and demoted section headings. Reader appendix pages expose bibliography, citations and conceptual navigation; technical build/research histories stay in `_docs/`.

`reader-bibliography.mjs` exports schemaVersion2 / reader-bibliography: bibliographic sources, cited evidence and exact cited passage/carrier identity. Both `/downloads/bibliography.json` and the retained `/downloads/research.json` URL return identical curated bytes; the latter no longer exposes the schema1 research workbench. Queries, gaps, editorial revisions and workflow states remain in repository research/development records. Public catalog provenance remains separately available, with its actual review kind unchanged. The AI reading index links the book and bibliography, not execution records.

`reader-surface.mjs` checks authored reader fields and the generated HTML/aria text, while allowing internal anchors and structured data. It catches strong project-process wording, visible internal labels and duplicate DOM IDs; semantic review still decides whether a condition is scientifically necessary. The HTML parser is bundled with pinned Next16.4.4, without a new dependency; its use is covered by compatibility fixtures.

`SidebarKeyboard` completes Escape dismissal for the installed standard mobile drawer through the exported sidebar hook. It is active only for an open drawer, returns focus to its external trigger and leaves Escape inside nested search/menu/listbox controls to that control. Desktop collapsed state and page navigation remain owned by Fumadocs.
