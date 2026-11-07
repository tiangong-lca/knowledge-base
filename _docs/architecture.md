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
lastReviewedAt: 2026-11-07
lastReviewedCommit: dd715663c3438aa730eef0da1696dc376a7715f1
---

# Publication architecture

## Original CML examples

`scripts/cml-framework-examples.mjs` registers the prose-only
CASE-CML-FRAMEWORK-EXAMPLES v1. It uses the shared exact-rational arithmetic for
a four-activity source hypothetical and a separate selected factor/bin comparison.
An independently fixed canonical input digest and nested allowlist bind source
identities, original PDF hashes/pages, exact numeric tuples and interpretation
flags. The source/reading/passage join is checked in the actual public closure.
The five numeric passages also pin their literal locator, printed-page label
and complete PDF index set, so coherent citation-label substitution fails.
The versioned publication manifest binds ten numerical paragraphs to that input.

The first result preserves positive process activities, service balances and
solid-waste contributions, while separating the derivative, relative response
and finite perturbation. The second preserves actual reported score identity
versus recalculated base bins and detects range overlap with unassigned gaps.
No native program, site modifier, score aggregation or observed environmental
change is inferred. The original disagreement is data, never silently repaired.


## Native exchange reproduction and static observations

`scripts/native-exchange.mjs` registers the prose-only CASE-NATIVE-EXCHANGE v1.
Its nested projection and independently fixed input digest bind 19 original
numeric facts, 29 selected native observations, exact source/readings/passages,
and the original and portable run identities. Static evaluation computes only
declared decimal arithmetic and display strings. It does not load a database,
reconstruct the native matrices or run Java. The JRC fossil-gas mismatch,
independent-target reset and aggregate direction-label differences remain
explicit data, separate from successful signed numerical comparisons.

The optional `scripts/native-exchange/run.py` accepts two caller-provided exact
archives and extracted JDK/Maven installations. It creates a new work directory
outside Git, resolves dependencies through Maven Central to a private cache,
verifies 69 runtime JARs and calls the original openLCA 2.7.0 modules. The three
authored Java adapters perform inspection, calculation and controlled native
round trips; they do not replace the numerical solver. Closed database-tree
digests bind calculation copies to inspection receipts. Explicit zero and absent
factor rows use a separate author diagnostic method with no environmental claim.

The actual replay is qualified on macOS arm64. Windows admission requires
CPython 3.13+ for mode-0700 directory access control; macOS/Linux retain Python
3.9+. Windows/Linux execution and actual Windows ACL behavior remain unqualified.
The launcher keeps inherited HOME unchanged and isolates Java user.home, temporary
files, Maven settings and caches through explicit task paths. Originals, complete
exports, databases and raw output vectors remain in caller-owned private storage.
The website dependencies and all previous case policies/hashes are unchanged.

## Electricity reproduction boundary

`scripts/electricity-service.mjs` is the closed CASE-POWER v1 static adapter. Its
nested allowlist binds 48 source tuples to their actual work, edition, reading,
passage and original carrier. The Cambium annual ZIP and CSV member remain
separate identities. Four AVERT outputs are embedded as author-derived native
execution records with their original/portable receipts and code/data identities.
The static evaluator computes units, ratios and balance residuals using exact
decimal-input arithmetic; it never launches the native model. Reader rounding
retains the exact arithmetic and is not a precision claim. Existing case hashes
and numeric-source policies remain unchanged.

The separately invoked `scripts/reproduce-electricity-native.mjs` verifies and
executes pinned EPA AVERT Web v4.3.0 numerical functions with caller-provided
originals and dependencies in private directories. Its historical Node20.20.2
and TypeScript5.4.3 requirements do not alter the site's Node/pnpm dependencies.
The acquisition manifest, recorded summary and instructions live in
`_docs/reproduction/electricity/`; their actual file identities are checked
against the case. Raw originals, dependency archives and generator-level outputs
are excluded from Git and the website. The replay is tested on macOS arm64;
Linux x64 and Windows x64 replay results are unqualified. No app server, GUI,
macro, hosted operation or package-install lifecycle is part of the driver.

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

The server `TeachingCase` component projects the repository specification before passing it to the client. Raw JSON and Node publication helpers must not enter the client graph. MDX references use literal registered id/version pairs. The client runs the same evaluator and presents scenario/parameter controls, a difference plot, matrices and numeric traces; fixed tables remain available to print and without interaction. `TeachingCase` explicitly dispatches CASE-WALL-CONNECT v1.0.0 to the existing interactive client and CASE-JOINT-BATCH v1.0.0 to a static server renderer. New cases used through `TeachingCase` require a reviewed widget renderer binding as well as registration. Prose-only numerical examples instead use reviewed canonical `Prose` and the chapter input links; they retain the same projection, input-hash, source-fact and evaluated-export checks.

Derived text artifacts retain original URL/media type and explicit absence of original bytes; their text hash is visibly distinct from an original-document hash. Catalog/research validation checks the same qualification fields and their joins; public exports retain them while excluding raw captures and private metadata.

## Bounded joint-product model

`scripts/joint-production.mjs` evaluates a fixed-ratio batch and three declared utilization scenarios with exact reduced rational outputs. It checks separate inventory coordinates, additive mass/sales shares, both service requirements, joint-Y disposition, positive physical routes and algebraic comparison-residual reconstruction. Negative residuals and the deliberately invalid sum of separately anchored comparisons are distinct from physical emissions. No LCIA factors or cross-flow sum exists in this model.

The closed registry in `case-publication.mjs` selects each known case's nested public projection, validator, evaluation context and numerical-source policy together. The joint input is explicitly inventory-only; an input flag cannot disable the wall case's factor/evidence checks. Wall projection order and downloadable hash are preserved by regression. Joint templates use `input` and `evaluated` paths; the existing export pipeline writes both models' canonical inputs, evaluated receipts and manifest hashes.

`JointProductionCase` renders static, horizontally scrollable tables and reconstruction text after projecting raw input on the server. It sends no raw-case client data prop. The fixed question, operation basis, separate units, full-basket comparison, residual interpretation and hypothetical assumptions remain visible in the narrative and static/no-script/print view. This is a second bounded adapter, not a general allocation or market-response solver.

## Reader shell and scholarly apparatus

The standard Fumadocs DocsLayout owns document navigation, sidebar, TOC, search/theme controls and mobile menu. HomeLayout supplies the other public routes. Theme/brand tokens follow the owning docs site; homepage72rem sizing does not constrain the document grid. No extra42rem prose cap or second document header/mobile index is added. Chinese translations and the existing local knowledge search corpus are retained without adding an external search service.

Current implementation: `lib/reader-book.ts` keeps website order from the page tree and derives the bounded print roster from the fixed original 42-unit citation baseline, preceded by shared preface and guide prose, with explicitly registered current appendix additions after the original units. `scripts/reader-book.mjs` creates one note plan per complete MDX source, ignoring code/comment examples. `ChapterContent` injects paragraph components with one local reference marker, then appends reader annotations. `ClaimAnnotation` supplies source locations, scope and material caveats without execution logs or visible database keys. Print reuses the renderer with unique prefixes and demoted section headings. Reader appendix pages expose bibliography, citations and conceptual navigation; technical build/research histories stay in `_docs/`.

Planned monograph migration (user requirement, 2026-11-06; not implemented here): the website may keep fine navigation while a separately curated book structure supplies parts, chapters, formal sections and print order. Both must reference shared canonical prose/claims/evidence/cases rather than fork their scientific content. The full old-to-new map must preserve all 37 chapters and five supplements and stable citation identities. Note plans must follow assembled book chapter boundaries, not merely concatenate per-MDX note sequences. Validate actual ordering, unique anchors, numbering, links, search behavior, old editions and print hierarchy when implementing. The goal and reader contract define editorial requirements; this paragraph does not claim a new runtime or schema already exists.

`reader-bibliography.mjs` exports schemaVersion2 / reader-bibliography: bibliographic sources, cited evidence and exact cited passage/carrier identity. Both `/downloads/bibliography.json` and the retained `/downloads/research.json` URL return identical curated bytes; the latter no longer exposes the schema1 research workbench. Queries, gaps, editorial revisions and workflow states remain in repository research/development records. Public catalog provenance remains separately available, with its actual review kind unchanged. The AI reading index links the book and bibliography, not execution records.

`reader-surface.mjs` checks authored reader fields and the generated HTML/aria text, while allowing internal anchors and structured data. It catches strong project-process wording, visible internal labels and duplicate DOM IDs; semantic review still decides whether a condition is scientifically necessary. The HTML parser is bundled with pinned Next16.4.4, without a new dependency; its use is covered by compatibility fixtures.

`SidebarKeyboard` completes Escape dismissal for the installed standard mobile drawer through the exported sidebar hook. It is active only for an open drawer, returns focus to its external trigger and leaves Escape inside nested search/menu/listbox controls to that control. Desktop collapsed state and page navigation remain owned by Fumadocs.

Chapter annotations resolve premises to the same local or named-chapter note sequence instead of inserting complete dependent paragraphs into print. The print page and reference index share `getPrintPages`; a printed destination is preferred when a premise also occurs on an unprinted navigation page. React's server `cache` shares this derived index within a render request. Exact case/version/hash/file input links appear once per chapter; all canonical scope, caveats and dependency records remain intact, and standalone claim pages retain their complete context. The joint-case table block has an authored MDX heading so it appears in the actual generated TOC.

The water-locality and phosphorus-boundary v1 adapters are closed static illustrations. Exact rational evaluation preserves their reviewed tuples and rejects changed units, return assumptions, applicability or numerical symbolic-CF substitution. Water ratios remain synthetic with a fixed external reference; phosphorus binds the conditional inventory-estimation coefficient to the inspected source numericFact. Their templates bind the numerical prose and output receipts without adding an interactive calculator. Legacy wall/joint input hashes and source policies remain unchanged.

The publication shell fills its available width with a zero minimum so intrinsic teaching tables remain locally scrollable in the mobile continuous reader. Print media applies the light paper palette at the Fumadocs token level, independent of the selected screen theme; typography, headings, annotations and tables must remain legible against the white paper background. Screen theme selection is not changed by printing.

The historical-container evaluator is another closed static prose adapter. `historical-glass-v1.json` separates source facts, interpretation limits and an author-conditional display-rounding assumption. Pure rational evaluation keeps source totals distinct from reconstructed components; output receipts preserve that distinction and explicitly deny full closure. `case-publication.mjs` projects its nested schema, validates every scoped source fact and fixed original carrier, and binds thirteen canonical paragraphs to the exact downloadable input. No renderer widget or client runtime is added. Legacy case projection order and hashes remain unchanged. Evidence may expose singular `numericFact` or scoped-ID `numericFacts`, never both; each plural fact is explicitly allowlisted in the public projection.

Case publication validation accepts an optional `{ readingRegister }` context; the historical adapter requires it and resolves actual evidence/passage/artifact joins, while legacy adapters retain their existing behavior. Repository validation and export pass the already-loaded canonical register. Missing, ambiguous, cross-reading, non-original or mismatched PDF carriers fail the historical publication gate even when the source snapshot itself still matches. Numeric inputs, materialized prose and legacy hashes are unchanged by this identity guard.

The chapter's single versioned case-input link requests a native same-origin download using its validated basename, matching existing teaching-case download controls. Its visible label states that action; browser-specific save/open policy still applies. It does not navigate through a custom fetch endpoint or create another input representation.

## Sampling summaries and conditional probability illustration

`scripts/pedigree-calibration.mjs` is a closed static prose adapter. It fixes 19
source tuples, three PDF identities and separately stipulated lognormal conditions
independently of the downloadable input. It evaluates published summary
square-roots/CVs, displayed-factor rounding, GSD/squared-GSD conversion and an
author-conditional independent-component comparison. Its inventory illustration
uses a declared median, basic GSD and independence assumption. The log-center
plus/minus-two-standard-deviation range is a distribution range under those
conditions, not an empirical confidence interval for the cup mean.

Transcendental calculations use finite binary64 values with explicit fixed4,
fixed6 and fixed8 display strings; source decimal strings remain unchanged.
Displayed precision does not recover unreported measurement precision. The
registered publication gate requires exact source/evidence/fact/passage tuples
and actual unambiguous reading-register joins to each fixed original PDF. A
default source snapshot cannot replace passage provenance. The existing neutral
`passages-inspected` access state is accepted with actual selected-reading scope;
it grants no entitlement or redistribution permission. Legacy cases retain
their existing source policies and input hashes. No widget, client runtime or
new dependency is introduced.


The candidate also binds the reported reliability GSD and CV to a conditional
round-first conversion trace. The raw-source and author-rounded paths are
both evaluated; agreement at displayed precision does not identify the original
rounding procedure or restore a rejected factor's recommendation status. CV is
an SD/mean ratio, not a percent. New v1 input review applies to the unpublished
candidate; earlier candidate hashes remain in Git/review history and no released
case or legacy artifact is overwritten.

## Average supply and conditional response

`scripts/market-response.mjs` is a closed static prose adapter with its own nested
public shape and exact-rational evaluator. It exposes selected historical M3
country weights and separate positive producer/other-user/generation scenarios,
activity differences and CO2 differences. Its fact gate checks all five semantic
tuple fields plus the actual source/passage/original-PDF join. Eight canonical
paragraphs bind one versioned downloadable input; no calculator widget, client
runtime or dependency is added. Unknown nested fields are stripped before hashing;
missing or changed reviewed leaves fail closed. Legacy case policies/hashes remain
unchanged. Exact arithmetic does not identify empirical market response.

## Supplier records and the hybrid inventory example

`scripts/hybrid-overlap.mjs` derives the raw economic accounts, residual economic
accounts, two inter-system requirements and direct intensities from complete
synthetic annual transactions. Fraction arithmetic gives exact activity balances
and CO2 totals for two disjoint supplier ledgers and their shared aggregate. The
naive construction retains the explicit links while using the original economic
accounts. The evaluated download also reports the discrepancy obtained by testing
an assumed supplier allocation against the other ledger.

The closed publication entry binds the wall case ID, version, input filename and
canonical hash to the actual entries discovered by the existing loader. The
service link uses the original treatment plan and electricity requirement. Both
normal repository validation and the exporter check parent uniqueness and
compatibility. The example uses the existing canonical paragraphs, local notes
and versioned input download surface.

## Swiss ecological-scarcity factor reconstruction

The static ecological-scarcity case reconstructs two factors with exact fractions from the annual reference, current and critical loads in the 2013 Swiss report. Its scoring step uses the rounded factors published in the same tables. The case separates the stipulated service and inventories, common positive scaling and one relative factor sensitivity. The public case adapter verifies nine full numeric facts against the source, edition, reading, selected passages and original PDF. The two nonzero normalization reciprocals retain exact fractions. The input is available from chapter annotations and the existing static download surface.

## Japanese preference valuation

The closed LIME case operates on two identified primary studies and one stipulated pair of damage vectors. It separately evaluates coefficients in their questionnaire units, the conditional monetary reconstruction, reported monetary factors, annual reference amounts, relative shares and the threshold for the two routes. The static registry checks 29 complete source tuples, including the distinction between named numerical facts and singular evidence-specific quantities. Both cases that need the same rational arithmetic call the shared exact-rational module. The input download and paragraph templates use the established publication interface.

## Reported carrier-bag results

The closed pack-study case calculates from 57 disclosed quantities in one original report. It distinguishes observed survey-count ratios, adopted rounded capacities and published reference flows; an output interpolation and original-model reproduction; strict integer thresholds and reported counts; and nine separate indicator results. Every source quantity binds the actual edition, work, selected passage and original PDF. Required numerical page indices must be covered by the bound passage, allowing a broader truthful explanatory reading scope. The evaluator and public templates use the existing rational and case-publication interfaces.

## Recovered-paper source reconstruction

The closed CASE-CYCLE adapter uses exact fractions to replay the Danish reports' annual routing, grade outputs, source-defined substitution ratios and heat/electricity compensation. Its45 selected quantities bind complete semantic tuples, actual work/edition, unique reading/passage and the original numeric page. Annual commercial paper mass, unit processing output, modeled virgin activity and avoided gas remain separate result groups. The heat-only reported values are retained alongside an explicitly conditional calculation, with reproduction flags false. Nine canonical paragraphs use the versioned input through the existing static publication registry, downloads and note renderer. No new widget, dependency or legacy input change is introduced.

## Dated dairy rule trace

`scripts/dairy-rules.mjs` registers a prose-only static case through the existing
publication adapter. Its independent normalized-input digest fixes the selected
37 tuples and their source scope. The source policy binds seven actual source
identities, including an XLSX carrier without fictitious PDF page bounds, exact
passage/worksheet/diagram locators, editions and numeric metadata. Build uses the
curated JSON; it neither loads third-party workbooks nor executes source macros.

Exact arithmetic separates default activities, reported characterized outputs
and two conditional model branches. Capital, storage and quantity-column
inconsistencies remain unclosed; fields cannot turn those checks into a native
reproduction, compliance verdict or measured effect. Input, templates and
canonical prose share the existing hash/materialization/public-closure checks.
The previous cases and their inputs remain unchanged; no new widget or runtime
dependency is added.

Mixed retrieved carriers now expose the exact cited artifact link in annotations and evidence details when it differs from the source-level default. This preserves HTML metadata and revision-index locators alongside their primary PDF rather than routing every citation to that PDF. Derived-text disclosure remains unchanged.

## Particulate-health reconstruction

The static `particulate-health` adapter registers 30 fixed source tuples through
the existing case publication interface and exact-rational evaluator. It
separates the explicitly joined Humbert/Gronlund historical factors, a rounded
height-weighting consistency check and a dated GLAM factor-table contrast. The
input contains no live atmospheric or epidemiological model and cannot set the
false native, empirical, causal or uncertainty-validation flags to true.

The numeric-source policy binds each tuple to its actual reading, carrier,
passage and PDF page or worksheet location, including a singular health effect
fact and plural source-table facts. The GLAM original XLSX member and the
release ZIP retain separate hashes and inspected passages. The download and
claim templates use the same public input identity; no new widget, dependency,
source-original export or changes to prior case inputs are introduced.

The reader-ID collector distinguishes publication record identities from the
four run-local scenario names in an explicitly typed native execution summary.
It omits only each scenario's own `id`, while retaining nested record IDs and case
identities. This avoids forbidding ordinary scientific uses of “zero” in older
chapters without weakening checks for actual public record keys. The shared
edition/print writing note defines annotation kinds; premise disclosures name
the direction of dependency as “本段依据的前提”.

Citation rendering adds one sentence stop after a locator, collapsing existing
trailing Chinese stops in the displayed text only. Canonical locator identities
and all numerical bindings retain their original strings.


## Climate response and metric comparison

`scripts/climate-metrics.mjs` registers CASE-CLIMATE-METRICS v1. Its nested public
projection and independently fixed input digest bind thirty numeric facts to the
actual source, work, reading, PDF and complete passage coordinates. Joos response
and integral evaluation use binary64 exponentials with declared display precision;
fixed pulse/wall comparisons, source rounding intervals and annual-history
arithmetic use the shared exact-rational module. A selected wall-parent identity
is checked against the unique discovered input/manifest and its actual solved gas
vectors. The old wall input and all earlier case versions remain unchanged.

The native summary is separately identified by sorted compact JavaScript JSON.
Validation binds its observed code, notebook, parameters, axes and receipt identities
to actual source-reading records. Static builds do not execute Python or reconstruct
unprovided original model outputs. The downloadable evaluated receipt separates
historical native values, author reconstructions, corrected-table factors, and
synthetic time/rate examples. Undefined time-zero ratios remain undefined in the
native source; displayed uncertainty widths never become automatic probabilities.

The opt-in `scripts/reproduce-climate-native.py` follows its dedicated runbook.
It verifies a separately pinned native semantic summary, exact source bytes and
runtime versions before calling selected unchanged author modules. It does not
install dependencies, execute notebooks, or make network calls during the numerical
run. Acquisition cache and new output directory are explicit private caller-owned
resources. The site dependencies remain unchanged. The retained replay qualification
is macOS arm64 only; Linux x64 and Windows x64 execution remain unverified.

The authored SVG in `public/book-figures/` plots the same Joos parameters and
separates dimensionless remaining fraction from its time integral. Its source is
an original plot from the selected public facts, not an exported third-party
figure. Standard static export carries the asset; the chapter and print route
share its MDX placement and the canonical paragraph-note sequence.

## Stable reader citation identity

`config/citation-baseline.json` freezes the exact old route/heading/note meanings from Main dd715663 and its emitted HTML. `config/citation-placements.json` supplies ten explicit moved-note destinations (four earlier moves and six container calculation moves), the two front-matter routes and an ordered current appendix registration. `scripts/reader-citations.mjs` plans native aliases and cross-page relocation notices; `scripts/reader-book.mjs` assigns consecutive visible numbers independently of stable claim-occurrence anchors. `ReaderSection` emits explicit front-matter positions without adding TOC headings and scopes them uniquely in print.

The Node-only `scripts/reader-citation-baseline.mjs` independently pins the parsed complete baseline digest, including source identity, and exact preface/guide order. Both server roster derivation and export validation call it before deriving expectations. The public frozen inventory has2254addresses; its body content is not duplicated. `scripts/reader-surface.mjs` checks emitted target claim identity, native link destination, alias adjacency, uniqueness, date/source context, note numbers and original print order. A real book source or output requires both configs; generic non-book fixtures retain their separate scope. Deliberate truncation and front-matter mutation tests guard against circular self-validation.

Legacy context appears when an old fragment is targeted, with the preserved source date and immutable GitHub tree. It cannot infer another historical unversioned edition and does not claim hosted archives. The current45print articles (two front-matter,42original and one container appendix) are a bounded continuity step; the planned32chapter assembly with shared canonical blocks and per-assembled-chapter notes remains future work.


Current appendix registration is deliberately separate from the immutable citation baseline. `createCurrentPrintRoutes` validates allowed appendix additions, uniqueness and registered source existence, then compares the resulting roster against actual source pages. Runtime uses `source.getPages()`; export independently discovers MD/MDX files under `content/docs`. Thus deleting both a registration and its exported article cannot silently omit an existing source. The folder's navigation index is excluded, while its article descendants remain mandatory. Print presents appendices separately from the five existing topics, and stable note/premise anchors remain scoped to actual source occurrences. This narrow addition does not implement the later assembled32chapter schema.
