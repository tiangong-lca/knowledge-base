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
lastReviewedAt: 2026-11-08
lastReviewedCommit: f78be1e086fc99a008242066d5947d3eff107996
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

`JointProductionCase` renders static, horizontally scrollable lookup tables after projecting raw input on the server. The canonical chapter supplies the full derivation once; the component retains four unchanged tables, a concise input/reference legend, eleven visible assumptions and exact native links to the appropriate website/book sections. It sends no raw-case client data prop. The fixed question, operation basis, separate units, full-basket comparison, residual interpretation and hypothetical assumptions remain visible in the narrative and static/no-script/print view. This is a second bounded adapter, not a general allocation or market-response solver.

## Reader shell and scholarly apparatus

The standard Fumadocs DocsLayout owns document navigation, sidebar, TOC, search/theme controls and mobile menu. HomeLayout supplies the other public routes. Theme/brand tokens follow the owning docs site; homepage72rem sizing does not constrain the document grid. No extra42rem prose cap or second document header/mobile index is added. Chinese translations and the existing local knowledge search corpus are retained without adding an external search service.

Current implementation: `lib/reader-book.ts` keeps canonical source enumeration separate from the cloned, numbered website tree and reads the explicit current print roster in `config/book-edition.json`. Shared front matter precedes seven parts of actual chapters; independently authored B04 and B10 replace their respective pairs of fine website units, and X02 follows X01 under appendices. `scripts/reader-book.mjs` creates one note plan per complete MDX source, ignoring code/comment examples. `ChapterContent` injects paragraph components with one local reference marker, then appends reader annotations. `ClaimAnnotation` supplies source locations, scope and material caveats without execution logs or visible database keys. Print reuses the renderer with unique prefixes and demoted section headings. Reader appendix pages expose bibliography, citations and conceptual navigation; technical build/research histories stay in `_docs/`.

Remaining full monograph migration (user requirement, 2026-11-06; bounded B04/B10 assemblies and the numbered current order are implemented): the website may keep fine navigation while a separately curated book structure supplies parts, chapters, formal sections and print order. Both must reference shared canonical prose/claims/evidence/cases rather than fork their scientific content. The full old-to-new map must preserve all 37 chapters and five supplements and stable citation identities. Note plans must follow assembled book chapter boundaries, not merely concatenate per-MDX note sequences. Validate actual ordering, unique anchors, numbering, links, search behavior, old editions and print hierarchy when implementing. The goal and reader contract define editorial requirements; this paragraph does not claim a new runtime or schema already exists.

`reader-bibliography.mjs` exports schemaVersion2 / reader-bibliography: bibliographic sources, cited evidence and exact cited passage/carrier identity. Both `/downloads/bibliography.json` and the retained `/downloads/research.json` URL return identical curated bytes; the latter no longer exposes the schema1 research workbench. Queries, gaps, editorial revisions and workflow states remain in repository research/development records. Public catalog provenance remains separately available, with its actual review kind unchanged. The AI reading index links the book and bibliography, not execution records.

`reader-surface.mjs` checks authored reader fields and the generated HTML/aria text, while allowing internal anchors and structured data. It catches strong project-process wording, visible internal labels and duplicate DOM IDs; semantic review still decides whether a condition is scientifically necessary. The HTML parser is bundled with pinned Next16.4.4, without a new dependency; its use is covered by compatibility fixtures.

`SidebarKeyboard` completes Escape dismissal for the installed standard mobile drawer through the exported sidebar hook. It is active only for an open drawer, returns focus to its external trigger and leaves Escape inside nested search/menu/listbox controls to that control. Desktop collapsed state and page navigation remain owned by Fumadocs.

Chapter annotations resolve premises to the same local or named-chapter note sequence instead of inserting complete dependent paragraphs into print. The print page and reference index share `getPrintPages`; a printed destination is preferred when a premise also occurs on an unprinted navigation page. React's server `cache` shares this derived index within a render request. Exact case/version/hash/file input links appear once per chapter; all canonical scope, caveats and dependency records remain intact, and standalone claim pages retain their complete context. The joint-case table block has an authored MDX heading so it appears in the actual generated TOC.

The water-locality and phosphorus-boundary v1 adapters are closed static illustrations. Exact rational evaluation preserves their reviewed tuples and rejects changed units, return assumptions, applicability or numerical symbolic-CF substitution. Water ratios remain synthetic with a fixed external reference; phosphorus binds the conditional inventory-estimation coefficient to the inspected source numericFact. Their templates bind the numerical prose and output receipts without adding an interactive calculator. Legacy wall/joint input hashes and source policies remain unchanged.

The publication shell fills its available width with a zero minimum so intrinsic teaching tables remain locally scrollable in the mobile continuous reader. Print media applies the light paper palette at the Fumadocs token level, independent of the selected screen theme; typography, headings, annotations and tables must remain legible against the white paper background. Screen theme selection is not changed by printing. The print color-scheme rule overrides the theme provider's inline root style so the browser's page canvas and margins also stay light when background printing is enabled.

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

Legacy context appears when an old fragment is targeted, with the preserved source date and immutable GitHub tree. It cannot infer another historical unversioned edition and does not claim hosted archives. The current 41 print articles comprise two front-matter units, 35 chapters (including B04/B10 assemblies and shared B06/B08), two retained topics and two appendices. Full 32-chapter migration remains future work; each actual assembly has its own continuous book note plan.


Current appendix registration is deliberately separate from the immutable citation baseline. `createCurrentPrintRoutes` validates allowed appendix additions, uniqueness and registered source existence, then compares the resulting roster against actual source pages. Runtime uses `source.getPages()`; export independently discovers MD/MDX files under `content/docs`. Thus deleting both a registration and its exported article cannot silently omit an existing source. The folder's navigation index is excluded, while its article descendants remain mandatory. Print presents appendices separately from the two retained topics, and stable note/premise anchors remain scoped to actual source occurrences. This original appendix registration remains part of the current mixed-edition conservation checks; the bounded B04 assembly below adds a separate manuscript source without claiming the complete32chapter edition.


## Published canonical citation history

`config/citation-history.json` separately records the canonical note generation actually emitted by published Main `a36597d72f8cd89beb285d5d5b439b4aa10e89a3`. It reconstructs 44 historical source pages and print units with that commit's own reader code, catalog and MDX hashes: 830 ordered claim occurrences produce 1,660 web/print note names, 84 nonempty annotation headings and 44 printed unit IDs. The record explicitly identifies immutable-source reconstruction, not a captured historical HTML artifact.

The Node-only `reader-citation-history.mjs` pins the entire parsed snapshot independently before runtime or export planning. The original 2,254-address baseline and its guard remain unchanged. Both generations together require 4,042 distinct historical addresses. Canonical moves use explicit existing route/claim placements only for occurrences actually present in their historical source; retained names must also resolve to the same claim. Aliases and notices carry each entry's own source commit/date, so a later canonical address cannot inherit the earlier positional generation's provenance. Real book output requires all history/config inputs, including when expected output has also been removed.

The correction restores six C02 canonical web notices and six route-scoped print aliases at their matching X01 notes. It does not alter current note numbering, the ten existing moves, 45-unit print order, manuscript, catalog, case files or releases. A later book assembly must separately capture/map existing route-scoped printed MDX heading names before changing their scope; old numeric heading aliases verify current destinations but are not themselves a history of those newer names. Future published generations require explicit evidence and migration coverage, never regeneration or replacement of these frozen historical snapshots.


## Bounded independent framework book chapter

`lib/monograph-source.ts` uses the installed Fumadocs MDX macro for a separate `content/monograph` collection. It stays outside website routing and search. The authored B04 manuscript interleaves canonical catalog claims under five sections; the two website pages retain their finer organization. No scientific text is copied into a second editable store. `ChapterContent` renders either complete source through the same paragraph and annotation machinery. Actual website and print bodies build separate reference indices, so each displayed number and premise link belongs to its destination surface.

`book-edition.json` explicitly binds stable book keys, source coverage, kind, order and B04 section/part metadata. `framework-accepted.json` independently fixes all65original identities,61/4allocation, original heading scopes and source hashes. Runtime and export compare discovered website/manuscript sources with the roster, then verify actual source and rendered body occurrences. The fixed mixed-roster projection prevents co-deleting registration and source from silently removing a required unit. It does not implement or claim all planned32chapters.

`framework-heading-history.json` binds19actual a0fee0a hosted printed heading addresses, with capture and file identities, independently of the unchanged2254positional and1788canonical histories. Migration targets derive from pinned original heading claim scopes and accepted section assignments. Split chapter, heading and annotation-group meanings use native multi-destination notices with their own source context. Same-claim note destinations use their actual book title/number, and external premises resolve through the actual book index. B04/X02 contextual links remain native within print; internal collection URLs cannot enter reader links or indices.

Meaningful tests reject omitted/duplicated/misplaced propositions, co-deleted B04/X02 registration, undiscovered manuscript coverage, changed history inventories, wrong note labels/titles and dead destinations. Exact input deduplication supplies one versioned case link per actual unit. Existing scientific inputs and releases are unchanged; four case-template antecedents receive separate substantive reapproval. Source, reader, engineering and actual-output validation remain separate from these structural guards.

Actual A4pagination is checked separately from screen print-media styles. Print omits each chapter's screen end padding/border and keeps the short canonical paragraphs together. The common renderer wraps the final complete grapheme and its note marker; `splitReferenceTail` uses the pinned Node runtime's built-in `Intl.Segmenter` and preserves the exact concatenated canonical string, including combining marks and joined emoji. Its nowrap rule is print-only. Stable IDs, reference plans and scientific records are unchanged by this presentation step. Private sample rendering does not establish formal archival-PDF or all-destination interoperability.


## Shared cleaner-production chapter

B05 retains the existing website source and stable print unit rather than adding a separate assembly. Its explicit part/three-section metadata does not alter the mixed45-unit identity digest. `cleaner-production-accepted.json` independently binds the original five claims, their source/heading scopes, the target2/2/2ordering and one explicitly reviewed addition with evidence/premise/type/review identity. `reader-cleaner-production.mjs` admits the real source in repository validation and the runtime book index; export independently loads the actual catalog and source and checks emitted heading levels, section assignment, body occurrence order and exact decoded paragraph text. Keeping note markers while dropping or altering scientific text therefore fails. Text comparison excludes only the note-marker subtree and preserves whitespace and grapheme content.

`cleaner-production-heading-history.json` binds the actual clean c159hosted capture, including its three canonical printed headings and the unit/group/five-original-note meanings already shared with earlier canonical history. Only the three new names enter the historical stream, giving4,064unique expectations; the2,254positional,1,788canonical and19framework inventories remain unchanged. Existing alias rendering maps each old title to its actual corresponding new section, with its own edition source/date, while the original five note identities retain the same claims. The new sixth claim has its own current identity. Omission, duplicate/section replacement, co-deletion, source/capture corruption and marker-preserving body-loss tests supplement source/reader judgment and actual browser checks.


## Shared functional-reference chapter

B06 consumes C08 and S03 once in the explicit 44-unit roster, using the rewritten C08 source for both website and book. S03 remains a fine website projection of the same canonical records. The source/map receipt retains 15 original IDs, eight ordinary-block destinations and two reviewed additions in 7/6/4 section order. A separate reviewed-prose receipt binds 17 full canonical records, both LF-normalized MDX sources and the authored wall-case navigation meaning/placement. Repository and actual decoded-HTML checks reject missing, duplicate, moved or changed substantive content even when markers and links remain. SourceRef and concept/case navigation are checked separately.

Eight actual clean 87f printed-heading captures extend the unchanged 2,254 positional, 1,788 canonical, 19 framework and 3 cleaner expectations to 4,072. Original C08/S03 source groups retain their exact 10/5-note subsets; this also covers S03's now-seven-note website. A retained native unit/group carries fragment-targeted source context inside its actual target, avoiding duplicate IDs. Relocated unit/group notices explain the broader chapter and provide exact current destinations with the original edition. Tests verify source scope, attachment, text, date, source link and current note identities. HTML qualification does not qualify a separately generated PDF's destination interoperability.

## Shared process-network chapter

B07 retains the C17 route/key/source in the same 44-unit mixed roster. Its three sections share ten canonical paragraphs between website and print. `process-network-accepted.json` independently pins the original eight identities, source/heading map and two explicit additions; its nested legacy numeric baseline identifies dd715663 and ordinal17 separately from the current 79af source snapshot. The four actually captured native printed headings in `process-network-heading-history.json` extend the prior4,072 historical obligations to4,076 without replacing any earlier inventory or its edition context.

`reader-process-network.mjs` validates exact source registration, section/occurrence order and actual decoded paragraph/endnote text. A separately pinned reviewed-prose receipt binds all ten full canonical records and the LF-normalized shared MDX. Mutating both catalog and HTML does not authorize changing the reviewed scientific content. Original eight-note groups and the native printed unit retain their original title, edition and exact current subset2,3,4,6,7,8,9,10 through the existing retained-scope mechanism; no same-ID notice or new stylesheet is needed. Non-native scopes use no-script notices, and old headings point to their precise new section. Source admission and actual export checks require all receipt layers even when an altered output omits the chapter.

The two-process numerical example remains author-stipulated prose with its existing exact arithmetic, not a new empirical dataset or general solver. The new scaling explanation has its own selected-source evidence. One wall-case template/canonical paragraph gains a named chapter reference; case inputs, factors and versions stay unchanged. These representation checks do not establish source entailment, continuous reading, real-world model validity or full-book/PDF qualification; those retain their separate acceptance evidence.


## Shared exchange-semantics chapter and partial historical source

B08 consumes C18, S02 and S05 in one four-section shared MDX source while preserving the fine website pages. `exchange-semantics-original.json` separately binds60original occurrences/56identities,14ordinary blocks and33case-bound responsibilities. The final-prose receipt binds full canonical records, actual section order, four source hashes and each ordinary block's reviewed explanation or navigation. Original conservation does not grant manuscript acceptance.

S01 remains a registered whole source. A separately pinned partial plan replaces eight print-only canonical occurrences with meaningful native cross-references to accepted B02/B03/B04/B08 notes; APOS and all six ordinary paragraphs remain. The same projection drives body rendering, note planning and the global reference index. The final receipt binds all eight full destination records and the unchanged complete S01 website bytes. M01/M02 responsibilities and the transitional APOS repetition remain explicit development obligations, not hidden whole-source completion.

The original347affected historical records, including three incoming front-matter links, are checked exactly before remapping. Nineteen actual c0hosted print headings extend4,076prior obligations to4,095. Old43/9/7/9-note groups retain their own title, edition and exact subset destinations; S01's method headings remain where its ordinary explanations still live. No earlier frozen acceptance or citation inventory is regenerated.

Actual output checks compare canonical paragraphs, section order and annotation kinds/scopes/caveats, ordered evidence/locators/relations, alternate-carrier links, premise destinations and per-unit case-input deduplication. They cover B08, S01's retained note and its eight moved note destinations. Retained ordinary content also binds link labels, actual print-transformed targets and section placement. Positive tests render the real annotation component; destructive output mutations keep the note IDs while removing scholarly content. Source and output checks reject the changed artifacts independently, without treating these guards as scientific or reader acceptance.

The existing native-exchange input, factor edition and execution summary remain fixed. Changed33publication templates receive source/reader reapproval against the same public input identity. Six newly captured manual pages become two work/readings with six carriers; old reading/passage anchors and earlier acquisition events remain. Static publication still does not rerun the native engine or establish historical-desktop, foreign-reader, empirical or full-book/PDF qualification.

## Hybrid inventory shared chapter

At its bounded delivery, B09 kept the existing C19 route and the then-current 42-unit roster. The later B10 assembly and numbered current order retain B09 itself unchanged. Its three explicit
sections contain the original38 canonical paragraphs and one separately bound
Agez S1 interpretation. `hybrid-inventory-accepted.json` preserves the original
occurrences and all172 prior C19 address meanings; its seven-heading companion
records actual clean0aed HTML capture. The additive history contains4102 entries,
without regenerating earlier frozen files. Old source/annotation targets retain
exactly their original38-note scope and disclose the new paragraph.

`reader-hybrid-inventory.mjs` separates conservation, captured headings and final
prose acceptance. A code-pinned receipt must match all39 complete canonical
records and the shared MDX bytes; a missing receipt/pin refuses admission. Runtime,
repository validation and output export all require these inputs. Real output
checks paragraph text, section/heading level, note order and the shared annotation
validator's conditions, locators, cited carriers, premises and case-input links.
An existing address without its scholarly content is insufficient. The two
closing-synthesis premise links resolve through the current title and note plan.

The11 hybrid case templates retain the same registered input and wall-parent
identity. New selected readings and supplement carriers do not run historical
software or change case coefficients. Source, arithmetic, continuous-reader,
engineering, browser, hosting and exact-integration evidence remain separate;
formal PDF qualification is not inferred from a successful HTML print check.

B09 output admission also accounts for every readable body/annotation text node,
including unwrapped text and added elements. Exact header descriptions and neighbor
metadata are bound in the accepted source record; known historical contexts keep
independent edition/link checks. The shared annotation check requires one validated
premise summary and does not whitelist additional summary or wrapper text. These
checks reject added assertions as well as missing canonical paragraphs; they do not
replace actual browser geometry, interaction or source-entailment review.

Native annotation-group headings share the existing seven-rem reference scroll
margin. Without that margin, a mobile saved group URL placed its heading and the
first version-context line beneath the fixed document header and TOC. Both web
H2 and continuous-print H3 group targets retain readable arrival positions.

Plain bibliography version paragraphs use the same anywhere-wrapping policy as
their links. This keeps long archive-member filenames within narrow continuous
print pages without clipping, truncating or changing the cited source identity.

## Numbered current reading structures

`config/reader-numbering.json` binds the actual current source titles, heading
identities, seven parts and separate book/website orders. Its independent code
pin supplements discovered-source and edition-coverage checks; it is not the
editorial 32-chapter plan made executable by inference. The current 41-unit book
contains 35 real chapters, two front units, two retained topics and two appendices.
Three still-unmerged pairs remain separate. The website keeps 37 fine pages.

`reader-numbering.mjs` derives edition/view labels and complete heading plans,
including actual case subheadings. `NumberedTitle` and `NumberedHeading` render a
real number span and a separate canonical title span; URLs and heading IDs remain
unchanged. A cloned Fumadocs tree and explicit pagination use the website plan,
while print presents part boundaries and complete actual section lists. Case
input and evaluation stay unchanged; separately reviewed editorial selection may
remove duplicate component exposition without altering the canonical derivation.
Print heading levels reflect the
book part/section hierarchy. Front matter and scholarly apparatus remain distinct.

`reader-numbering-output.mjs` admits actual numbered output only after validating
the pinned local artifact, discovered sources, exact unit/part/heading roster,
number/title/depth, native contents destinations and website sidebar/pagination.
The installed MDX compiler emits plain TOC labels as React Fragments; the source
check admits only exact static text/array/Fragment trees and rejects unsupported
markup instead of coercing objects. Native breadcrumbs and mobile TOC triggers
reuse tree labels, so their current route, part/category, hierarchy and position
are separately qualified before their number/title markers enter the accepted set.
It then creates a separately qualified semantic clone for existing content and
citation checks, removing only verified format spans, exact qualified view-label
and breadcrumb navigation nodes, and restoring prior semantic heading levels.
An unknown, misplaced or altered breadcrumb blocks the clone; ordinary body and
historical content cannot enter this removal list. It never rewrites emitted files. Pagination qualification
is held outside mutable DOM attributes and bound to the verified node bytes.
Scoped widget checks independently validate the complete current case roster,
captions/header roles and exact accepted presentation. The joint lookup uses three
headings after a reviewed five-to-three disposition; the wall case retains five.
The original joint five-heading capture remains immutable.

Continuous-book native part, unit and numbered-heading targets use the same7rem
arrival margin as retained note/group targets. Actual clicks at the first clean
candidate otherwise placed a chapter title partly, and a section title entirely,
under the56px fixed header. This changes scroll arrival only, not content,
numbering identity or printed page layout. Browser qualification checks the
visible target against the actual header boundary, including no-script links.

The two exact C03/C28 reading continuations have explicit source/view contracts;
unknown fragments are not silently reinterpreted. Production still needs the
accepted B10 prose receipt and independently fixed digest. Numbers and a correct
directory do not establish scientific acceptance, continuous authorship, browser
quality or formal PDF pagination.


## B10 component selection without changing its scientific input

The next `joint-production-prose-accepted.json` receipt includes a separately
reviewed `caseSelection`, bound by the whole receipt's independent code digest.
It identifies the original case digest, unchanged raw input hash, actual reviewed
component hash, sixteen original paragraph dispositions, five original heading
dispositions and eleven exact assumptions. Both website and book presentations
bind their complete semantic text, three actual headings and precise native
navigation plus the two original downloads. The four tables, captions and cell
roles are still checked against `joint-production-original.json`; its digest and
the fourteen captured address records are never replaced by this selection.

A removed second explanation must have an actual canonical target available in
both current carriers. Complete manuscript order and exact canonical record
checks remain independent. Missing or pending selection fails; no current-output
fallback silently adopts the original widget. Root, descendant and original
ancestor visibility is checked before the numbered semantic clone can detach the
case, and the actual body navigation targets must exist uniquely. Reintroducing
the removed narrative as normal, folded, hidden or print-only text fails the
accepted full-text check.

CLI `validate.mjs` reads the actual component and raw input bytes and passes them
to the pure `validateJointProductionArtifactBytes` check. The bundled reader guard
performs no filesystem reads and does not assume the source layout around its
compiled module. Recording the source hash alone does not replace this byte check
or actual output inspection. The precise current receipt is set only after the
new full reader artifact has actually been reviewed; an old prose receipt cannot
certify a later presentation merely because its37canonical paragraphs are stable.
