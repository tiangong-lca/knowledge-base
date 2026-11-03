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
lastReviewedAt: 2026-11-03
lastReviewedCommit: 50cc3d7
---

# Publication architecture

Next.js App Router, Fumadocs MDX/UI, React, TypeScript and Tailwind produce a static site. Chinese is the initial publication language; English labels preserve terminology. Exact compatible dependencies and the pnpm lockfile are authoritative. The architecture follows the workspace docs site; its product routes, four-locale editorial policy and hosted search identity are not imported.

MDX carries authored prose and renders canonical claims by stable IDs. knowledge/catalog.json owns source/evidence/claim/concept/mapping records and coverage. lib/catalog.ts applies the same public projection used by scripts/export.mjs. Reviewed status records editorial source checking, not expert certification. Draft, needs-review and withdrawn claims do not enter public claim statements. Unresolved topics remain visible in coverage and explicit caveats.

scripts/knowledge.mjs validates references and required semantics, derives reverse dependencies, and selects publication records. scripts/validate.mjs checks the actual catalog and MDX references. Tests include deliberate invalid records; passing them establishes structural integrity only. scripts/impact.mjs traverses changed source/evidence/claim/concept/mapping dependencies to identify review work. It does not silently approve or rewrite content.

Build runs validation, static generation and export verification. out/downloads contains public catalog, dependencies and source identity. Dirty builds are visibly working previews. Export has no access to research or licensed originals. Search is client-side over the public corpus, without a backend service. llms.txt points to the same public evidence and coverage.

scripts/snapshot.mjs freezes the entire static artifact and file hashes from a clean committed revision into a new destination; it refuses overwrites and mismatched source identity. The print route renders all chapters and evidence. PDF is a separately checked print artifact, not an assumed framework export capability. Historical hosting retention and downloadable PDF publication remain operator responsibilities under releases/README.md.

CI checks tests, types, static build, strict Docpact configuration and scoped governance lint. Actions have immutable pins. A build proves neither source entailment nor scientific approval. Repository CI does not configure external production hosting, search services or archival DOI. The new repository does not depend on private workspace source at build time.

## Git hosting and domain qualification

EdgeOne Makers project `makers-w8wl4xjmt2mj` imports `tiangong-lca/knowledge-base`, branch `main`, with the repository root as its build root. `edgeone.json` owns `pnpm install --frozen-lockfile`, `pnpm build`, and the static output directory `out`. The production hostname selected by the user is `prism.tiangong.earth`; domain and HTTPS qualification are tracked in knowledge-base #3. These configured identities do not establish that deployment or DNS activation has succeeded.

Both `edgeone.json` and `.nvmrc` pin Node 24.18.0, which is preinstalled by EdgeOne and satisfies the package's `>=24.18.0 <25` range. The first hosted attempt on Node 24.19.0 failed while switching runtime, before dependency installation. An exact preinstalled runtime avoids downloading an unsupported version or inheriting a moving major-only selector. See the [EdgeOne build guide](https://pages.edgeone.ai/zh/document/build-guide).

The exact pnpm 12.16.1 package-manager pin and frozen lockfile remain authoritative. Official pnpm 11+ behavior downloads and runs the declared package-manager version by default (`pmOnFail: download`); the hosted install log must confirm the selected version rather than assuming the platform's preinstalled pnpm version. No additional package manager owns dependencies, and `corepack enable` must not mutate platform-owned shims. See [pnpm package-manager version behavior](https://github.com/pnpm/pnpm.io/blob/main/docs/settings/cli.md).

Hosted Git builds must retain `.git` metadata: build identity and export read the actual commit and worktree state. Production qualification checks `/downloads/manifest.json` against the selected merged commit and verifies `dirty: false`, then checks nested document routes, static assets, search and HTTPS on the custom hostname. Platform-generated files must not silently turn a production build into a claimed clean source edition. Static export retains trailing slashes and unoptimized images; deploy at the hostname root so root-relative document and asset links resolve correctly.
