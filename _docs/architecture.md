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
lastReviewedAt: 2026-11-26
lastReviewedCommit: c5efe31edad6c6fd746a4b3d04acefc44130a6e4
---

# Publication architecture

## Checkpoint collapse and post-checkpoint revisions (`#192`)

Per the user's 2026-11-21 decision (option C), HEAD validation (`validateReadableBookCurrent` in `scripts/reader-current-edition-files.mjs`) delegates to `qualifyCheckpointSources` (`scripts/reader-checkpoint.mjs`). Instead of replaying the 41-unit historical rollback chain on every `validate`, `next build` and `export` invocation, HEAD reverses only declared post-checkpoint revisions (`config/revisions/index.json` + `scripts/reader-revisions.mjs`) and asserts that the recovered source state matches the digest-pinned checkpoint (`config/readable-book-checkpoint.json`, commit `fff371413af1436a9e7802831c349a583bfa41b6`, state digest `4ca4fcd1...`).

The complete 41-unit pre-checkpoint chain remains intact in `qualifyHistoricalReaderSources` and is verified independently against the byte-pinned snapshot (`scripts/fixtures/checkpoint-2026-11-21/`) via `node scripts/verify-checkpoint-history.mjs` (enforced as a dedicated step in `.github/workflows/validate.yml`). The 36 historical unit test suites read their starting state from `checkpointInput()` (`scripts/reader-checkpoint-input.mjs`) rather than HEAD so future chapter rewrites do not require editing historical tests.

Declarative claim retirement (`op: "retire"` in `config/revisions/*.json`) restores retired records on inverse rollback, retargets historical web and `/print` note anchors symmetrically in `lib/reader-book.ts` and `scripts/reader-surface.mjs` via `applyClaimRetirementsToCitations`, and surfaces post-checkpoint revisions and retirements on `/changes/`. See `_docs/runbooks/post-checkpoint-revisions.md`.

## Ordinary CI source-validation entrypoints

When the package build/validation scripts exactly match the audited composition
and have no pre/post lifecycle hooks, the ordinary CI build step invokes
`pnpm exec next build` and then the original
`node scripts/export.mjs`. Next's production configuration still validates the
actual source on a cold configuration load. The exporter independently validates
the current source again before checking the rendered/public artifact. A failed
Next command stops the step before export. Any changed script or added lifecycle
hook falls back to the complete `pnpm build`, so future preparation is retained.

The normal `pnpm build` command retains its existing standalone preparation and
remains the hosting/developer entrypoint. CI does not prepend that command's
additional identical `pnpm validate` invocation to its already guarded Next
build. No source-validation result is cached or transferred as admission, and no
new environment bypass is introduced. Existing preview output isolation and
the exporter's preview/editorial-history refusals remain unchanged.


## Product-footprint-comparison successor

The #151 Part VI `B28` product-footprint-rules comparison successor
(`scripts/reader-product-footprint-comparison.mjs` and
`scripts/reader-product-footprint-comparison-factors.mjs`) updates `1` managed
`B28` MDX file (`content/docs/book/product-footprint-rules-and-practice.mdx`)
while preserving all `4` pinned headings (`#规则与规定服务`, `#活动量与报表`,
`#模型与审查范围`, `#算法响应与比较` in `config/reader-numbering.json`) and
all `34` original `cl-rule-*` claims byte-for-byte, extends the public catalog
from `1,060` to `1,068` claims (`8` new `cl-pfr151-*` claims, `9` `1-to-1`
single-artifact `ev-pfr151-*` / `psg-pfr151-*` pairs, `22` `BigInt`-verified
`nf-pfr151-*` `numericFacts`, `3` new official PDF works/sources/readings, `22`
normalized non-case `ev-kb44-*` locators while keeping all `5` case-bound
`dairy-rules-v1.json` locators untouched, and `1` explicit paywalled-standard
research gap), and embeds `2` responsive comparison tables (Table 1 six columns,
Table 2 five columns) while keeping all `40` case download files byte-identical.
`prepareProductFootprintComparisonSource` enforces closed `exactKeys`
sub-envelopes, `pin === null` fail-closed inactive/preview guards, exact
`allowsRaw` allowlists, `oldFileShas` + exact deterministic `boundedMdxTransform`,
and exact rollback to `3c6844be00ad3d39be3199ffbb257324a5daab79`
(`productFootprintComparisonPredecessorPin` `67e55709...`,
`productFootprintComparisonUnitPin` `2193f0fd...`,
`productFootprintComparisonCapturePin` `f1c7d9ac...`), while
`qualifyProductFootprintComparisonHistory` validates `addressPin` (`cf715091...`),
`14` dated history controls, and `2` ordinary lead targets, maintaining compiled
CSS zero-drift (`be180e5d...`).

## Uncertainty-comparison successor

The #149 Part VI `B26` uncertainty-and-variability comparison successor
(`scripts/reader-uncertainty-comparison.mjs` and
`scripts/reader-uncertainty-comparison-factors.mjs`) updates `1` managed `B26`
MDX file (`content/docs/book/uncertainty-and-variability.mdx`) while preserving
all `3` pinned headings (`#估计对象`, `#不确定性来源`, `#数值可靠性` in
`config/reader-numbering.json`), extends the public catalog from `1,052` to
`1,060` claims (`8` new `cl-unc149-*` claims, `10` `1-to-1` single-artifact
`ev-unc149-*` / `psg-unc149-*` pairs, `42` `BigInt`-verified `nf-unc149-*`
`numericFacts`, `2` new CC BY 4.0 works/sources/readings, `2` appended prior
carriers, `7` normalized prior `ev-unc-*` locators, and `2` bounded
synchronizations on `cl-unc-sd-sem` and `cl-book-unc-bridge`), embeds `2`
responsive 6-column Markdown comparison tables, and wires gated
`readerCitationSourceTitle` (`§2.1 -> Ch. 2.1`) display mapping in
`scripts/reader-exchange-semantics.mjs` and `components/evidence.tsx` while
keeping all `40` case download files byte-identical.
`prepareUncertaintyComparisonSource` enforces closed `exactKeys` sub-envelopes,
exact `allowsRaw` allowlists, `oldFileShas` + `boundedMdxTransform`, locked
field deltas on `cl-unc-sd-sem` and `cl-book-unc-bridge`, and exact rollback to
`4bb508394ef2f6c671b1468d41a2b67c51296be6` (`uncertaintyComparisonPredecessorPin`
`7db50e1d...`, `uncertaintyComparisonUnitPin` `61a21b40...`,
`uncertaintyComparisonCapturePin` `636656bd...`), while
`qualifyUncertaintyComparisonHistory` validates `addressPin` (`06f9729b...`),
`12` dated history controls, and `2` `noteIndex`-pinned `style="display:block"`
public correction notices (`data-uncertainty-comparison-correction`) on both
`/docs/book/uncertainty-and-variability` and `/print` before `reader-surface.mjs`
strips them for downstream legacy predicates, maintaining compiled CSS
zero-drift (`be180e5d...`).

## Data-applicability-comparison successor

The #147 Part VI opening data-applicability comparison successor
(`scripts/reader-data-applicability-comparison.mjs` and
`scripts/reader-data-applicability-comparison-factors.mjs`) updates `3` managed
`B25` MDX files (`content/monograph/data-applicability.mdx`,
`content/docs/book/database-fitness-and-documentation.mdx`, and
`content/docs/book/review-support-and-version-boundaries.mdx`), extends the
public catalog from `1,044` to `1,052` claims (`8` new `cl-dapp147-*` claims,
`18` `1-to-1` single-artifact `ev-dapp147-*` / `psg-dapp147-*` pairs, `63`
`BigInt`-verified `nf-dapp147-*` `numericFacts`, `3` new works/sources/readings,
`4` appended prior carriers, `16` normalized prior evidence locators, and `14`
bounded `cl-db2011-*` synchronizations), and embeds `2` responsive 6-column
Markdown comparison tables while keeping `config/data-applicability-original.json`,
`config/data-applicability-heading-original.json`, `config/data-applicability-accepted.json`,
and all `40` case download files byte-identical. `scripts/reader-data-applicability.mjs`
adds backward-compatible Markdown/DOM table verification (`>= 2` columns, non-empty
pure text cells, no `rowspan`/`colspan` or HTML tags) and dynamic `destRoute`
note-ordinal resolution so the isolated `f650600` historical fixture passes
unchanged. `prepareDataApplicabilityComparisonSource` enforces closed `exactKeys`
sub-envelopes, `oldFileShas` + `boundedMdxTransform`, and exact rollback to
`c5b90b0352abaeaf0eec6706685076c8825d8925` (`dataApplicabilityComparisonPredecessorPin`
`68aed4ba...`, `dataApplicabilityComparisonUnitPin` `728d8436...`,
`dataApplicabilityComparisonCapturePin` `a7d7ab2f...`), while
`qualifyDataApplicabilityComparisonHistory` validates `addressPin` (`3fe18985...`),
`19` dated history controls, `5` ordinary targets, and `12` `noteIndex`-pinned
`style="display:block"` public correction notices (`data-data-applicability-comparison-correction`)
before `reader-surface.mjs` strips them for downstream legacy predicates,
maintaining compiled CSS zero-drift (`be180e5d...`).

## Part-5-reread successor

The #145 Part V whole-part continuous-reread successor
(`scripts/reader-part5-reread.mjs`) updates `4` managed physical files
(`config/reader-numbering.json`, `content/docs/book/index.mdx`,
`content/docs/book/lime-preferences-and-damage-weights.mdx`, and
`content/docs/book/social-assessment-objects-and-meaning.mdx`) and `106` raw
records (`57` non-case `catalog.claims` entries, `48` `catalog.evidence`
`.locator` entries [`37` Part-V-exclusive + `11` shared with `B05`, `B14`, and
`B32`], and `rev-part5-reread-145-continuity-and-locators`), conserving `100%`
of all `1,044` claim IDs, sequence, `numericFacts`, `16` Part V case-bound
claims, and `40` case download files byte-for-byte. Before `#143` runs its own
rollback and receipt checks, `preparePart5RereadSource` enforces closed
`exactKeys` cardinality allowlists across `config`, `unit`, `source`, `state`,
`changes[]`, `consumers[]`, `partIntroduction`, `printPart5`, `previousFiles`,
`rawRecords[]`, `rawFields`, `outputs[]`, `publicArtifacts[]`, `history`,
`previousAddresses`/`currentAddresses`, `ordinaryTargets`, `ordinaryOverrides`,
`history.history[]`, `ordinary[]`, `outputCapture`, `reviewEvidence[]`, and
`capture`, restores the exact `915af29592cee16d42772ba76080ed913d630e6b` bytes
(`oldFileShas`) and raw records, verifies `part5RereadPredecessorPin`
(`f18e0af6...`), bidirectional per-field allowlists (`17` prose, `15` scope,
`10` caveat, `21` premise), programmatic backward-only and strict ascending
`(printOrder, note)` `premiseIds` across all `127` non-case Part V claims,
multi-page `PDF`/ID-prefix hygiene, and all `112` transitions across `94`
dependent consumers (`part5RereadUnitPin` `9b006731...`, `part5RereadCapturePin`
`a8481bc0...`).

Across rendered DOM and citation projection, `components/evidence.tsx` and
`scripts/reader-exchange-semantics.mjs` gate `ArtifactReading` (`原载文献`) and
`readerCitationSourceTitle` on `Boolean(currentPart5Reread)` (with `@/scripts/*`
aliases registered in `scripts/fixtures/historical-reader-fixture.mjs` so
archived `f650600` suites remain unchanged), `ReaderTable` assigns stable
`-part5-145-ordinary-table-*` IDs on `B22` and `B23`, and `qualifyPart5RereadHistory`
verifies `4` `allowedOrdinaryOverrideKeys` on `/docs/book` & `/print`, `49`
ordinary targets, `22` history dispositions, `1` `<details data-part5-reread-part="5">`
disclosure on `/print#print-part-5`, and `8` `noteIndex`-pinned
`style="display:block"` public correction notices (`data-part5-reread-correction`)
across `27` changed articles and `7` changed public artifacts with zero compiled
CSS drift (`be180e5d...`).

## Cost-and-sustainability successor

The #143 Part V closing cost-and-sustainability successor
(`scripts/reader-cost-sustainability.mjs` and
`scripts/reader-cost-sustainability-factors.mjs`) updates `B24`
(`content/docs/book/cost-perspectives-and-sustainability-combination.mdx`, `9`
-> `17` claims plus two responsive 6-column Markdown synthesis tables across §§1
and 3), brings the public catalog from `1,036` to `1,044` claims (`8` new
`cl-lcc143-*` claims, `21` topic-focused single-source/single-artifact
`ev-lcc143-*` records bound `1-to-1` to `21` `psg-lcc143-*` passages across `12`
SHA-256-verified binary PDF carriers, and `82` `BigInt`-verified `nf-lcc143-*`
`numericFacts`), normalizes `2` `B24`-exclusive prior evidence locators
(`ev-sustainability-lcsa-social-reference`,
`ev-sustainability-lcsa-weighting-conditions`), and applies `7` bounded `B24`
prior-claim synchronizations, conserving `100%` of `1,029` untouched prior
claims, all `6` shared `ev-sustainability-*` records, both
`src-book-finkbeiner-2010-lcsa-framework` / `src-book-unep-2020-slca-guidelines`,
and all `40` case JSON files byte-for-byte. Before `#139` runs its own rollback
and receipt checks, `prepareCostSustainabilitySource` enforces recursive
`exactKeys` closed allowlists across `config`, `unit`, `changes[]`,
`consumers[]`, `corrections[]`, `rawRecords[]`, `rawFields[]`, `outputs[]`,
`publicArtifacts[]`, `history`, `ordinaryTargets`, `history.history[]`,
`ordinary[]`, `outputCapture`, `reviewEvidence[]`, and `capture`
(`manifestPaths === 468`, rejecting `layouts`, `partIntroduction`, `migrations`,
and `history.ordinaryOverrides`), restores the exact
`8d5f1037a2ab30b29c197fe89a422a5c69f81a93` `B24` MDX (`9363218b...`) and raw
records, and verifies `costSustainabilityPredecessorPin` (`9dbf6777...`),
`assertCleanCostSustainabilityProse` hygiene, direct `BigInt`-to-prose/caveat
bindings (including exact `6.48%`/`6.49%` rational NPV sign-change bracketing),
and all `87` transitions across `416` dependent consumers
(`costSustainabilityUnitPin` `761971a8...`, `costSustainabilityCapturePin`
`f9416064...`).

Across rendered DOM and navigation, `lib/reader-book.ts` extends
`relabelHistoricalTargets` and `getCitationLabel` route coverage to
`currentCostSustainability`, `ReaderTable` in `components/chapter-content.tsx`
admits both `B24` 6-column comparison tables (`index === 1 || index === 2`,
forbidding explicit `id` attributes), and `qualifyCostSustainabilityHistory`
verifies `2` ordinary targets (`-lcc-143-ordinary-0` web & print), `12` history
dispositions (`5` web + `5` print `<details data-cost-sustainability-history>`
article-scoped controls plus `2` wrapper controls stacked cleanly after `#95`
copyedit history), and `7` inline `style={{ display: 'block' }}` print-visible
correction notices on `data-cost-sustainability-correction` with zero compiled
CSS drift (`be180e5d...`).

## Static-export indexing and worker memoization

Issue #141 eliminates the `O(|E|^2 |C|)` and per-page full-book revalidation
bottlenecks that caused EdgeOne Standard static-export workers to exceed
Next.js's default `60 s` page-generation budget once the public catalog reached
`1,036` claims and `1,083` evidence records (`1a9301c2...`, deployment
`dpjl7fpd94l4`):

- `scripts/knowledge.mjs` (`getClaimEvidence`) caches `byId(records(catalog,
  'evidence'))` in a `WeakMap` keyed on `catalog.evidence`, validating element
  references and `id` strings before reuse so in-place array or ID mutations in
  tests immediately invalidate the cached `Map`.
- `app/sources/page.tsx`, `app/research/page.tsx`, `app/concepts/page.tsx`,
  `components/evidence.tsx`, and `lib/catalog.ts` (`isKnownClaim`) pre-index
  catalog and reading lookups (`Map` / `Set`) in deterministic record order
  instead of nested linear `.filter(...)` / `.find(...)` scans, preserving exact
  DOM element and link ordering.
- `lib/reader-book.ts` (`getChapterReferenceIndex`) adds worker-lifetime
  `Promise` memoization under `NODE_ENV === 'production'` alongside React
  per-request `cache(...)` (evicting rejected promises on failure while keeping
  development hot-reload uncached), and `next.config.ts` sets
  `staticPageGenerationTimeout: 180` for throttled container CPUs.
- All `468` exported paths, `validateReaderOutput` normalized HTML article and
  reference-page digests, compiled CSS (`be180e5d...`), JS chunks,
  `catalogSha256` (`a1b132e7...`), public JSON projections, and case inputs
  remain identical to `1a9301c2153867cf1b6cdefadc648346bd78b739` (differing in
  raw `manifest.files` only in Next.js's per-build `buildId` and the new
  commit's `sourceCommit`), leaving every scientific successor and capture pin
  unchanged while reducing 58-page static generation from `57.0 s` to `6.7 s` on
  Apple Silicon.

## Social-comparison successor

The #139 Part V cross-system social LCA successor
(`scripts/reader-social-comparison.mjs` and
`scripts/reader-social-comparison-factors.mjs`) updates `B23`
(`content/docs/book/social-assessment-objects-and-meaning.mdx`, `9` -> `17`
claims plus two responsive 6-column Markdown synthesis tables across §§1 and 3),
brings the public catalog from `1,028` to `1,036` claims (`8` new `cl-soc139-*`
claims, `14` single-source/single-artifact `ev-soc139-*` records bound `1-to-1`
to `14` `psg-soc139-*` passages across `14` SHA-256-verified primary artifacts /
`13` sources, and `90` `BigInt`-verified `nf-soc139-*` `numericFacts`), normalizes
`2` B23-exclusive prior evidence locators (`ev-sustainability-slca-activity-variable`,
`ev-sustainability-slca-interpretation`), and applies `7` bounded B23 prior-claim
synchronizations, conserving `100%` of `1,021` untouched prior claims, all `6`
shared `ev-sustainability-slca-*` records, and all `40` case JSON files
byte-for-byte. Before `#137` runs its own rollback and receipt checks,
`prepareSocialComparisonSource` enforces recursive `exactKeys` closed allowlists
across `config`, `unit`, `changes[]`, `consumers[]`, `corrections[]`,
`rawRecords[]`, `rawFields[]`, `outputs[]`, `publicArtifacts[]`, `history`,
`ordinaryTargets`, `history.history[]`, `ordinary[]`, `outputCapture`,
`reviewEvidence[]`, and `capture` (`manifestPaths === 468`, rejecting `layouts`,
`partIntroduction`, `migrations`, and `history.ordinaryOverrides`), restores the
exact `79c8ea9cf1c79eb0b773a2109188095037f9873a` B23 MDX (`6f0d3d9e...`) and raw
records, and verifies `socialComparisonPredecessorPin` (`b1f96c03...`),
`assertCleanSocialProse` hygiene, direct `BigInt`-to-prose/caveat/table bindings,
and all `83` transitions across `442` dependent consumers (`socialComparisonUnitPin`
`431625f3...`, `socialComparisonCapturePin` `47bff7ca...`).

Across rendered DOM and navigation, `lib/reader-book.ts` extends
`relabelHistoricalTargets` and `getCitationLabel` route coverage to
`currentSocialComparison`, `ReaderTable` in `components/chapter-content.tsx`
admits both `B23` 6-column comparison tables (`index === 1 || index === 2`,
forbidding explicit `id` attributes), and `qualifySocialComparisonHistory`
verifies `2` ordinary targets (`-soc-139-ordinary-0` web & print), `12` history
dispositions (`5` web + `5` print `<details data-social-comparison-history>`
article-scoped controls plus `2` wrapper controls stacked cleanly after `#95`
copyedit history), and `7` inline `style={{ display: 'block' }}` print-visible
correction notices on `data-social-comparison-correction` with zero compiled CSS
drift (`be180e5d...`).

## Localization-comparison successor

The #137 Part V cross-system localization successor
(`scripts/reader-localization-comparison.mjs` and
`scripts/reader-localization-comparison-factors.mjs`) updates `B21`
(`content/docs/book/localization-evidence-and-denominators.mdx`, `28` -> `36`
claims plus two responsive 6-column Markdown synthesis tables across §§3–4),
brings the public catalog from `1,020` to `1,028` claims (`8` new `cl-loc137-*`
claims, `17` single-source/single-artifact `ev-loc137-*` records bound `1-to-1`
to `17` `psg-loc137-*` passages across `17` SHA-256-verified primary carriers —
including isolated `src-loc137-lcimpact-ch1` / `rd-loc137-lcimpact-ch1` /
`work-loc137-lcimpact-ch1` so `kb46-lcimpact2020` stays untouched — and `93`
`BigInt`-verified `nf-loc137-*` `numericFacts`), normalizes `8` B21-exclusive
prior evidence locators (`ev-lin-2005-*`, `ev-regional-xie-*`), and applies `15`
bounded B21 prior-claim synchronizations, conserving `100%` of `1,005` untouched
prior claims, all `1,044` non-B21-exclusive prior evidence records, and all `40`
case JSON files byte-for-byte. Before `#135` runs its own rollback and receipt
checks, `prepareLocalizationComparisonSource` enforces 24 recursive `exactKeys`/
`onlyKeys` closed allowlists across `config`, `unit`, `changes[]`, `consumers[]`,
`corrections[]`, `rawRecords[]`, `rawFields[]`, `outputs[]`, `publicArtifacts[]`,
`history`, `ordinaryTargets`, `history.history[]`, `ordinary[]`, `outputCapture`,
`reviewEvidence[]`, and `capture` (rejecting `layouts`, `partIntroduction`,
`migrations`, and `history.ordinaryOverrides`), restores the exact
`0518e6b529789b8dde9ffebf36d2eeb716a94390` B21 MDX (`ca55dfc7...`) and raw
records, and verifies `localizationComparisonPredecessorPin` (`cec53208...`),
`assertCleanLocalizationProse` hygiene, direct `BigInt`-to-prose/caveat/table
bindings, and all `97` transitions across `531` dependent consumers.

Across rendered DOM and navigation, `lib/reader-book.ts` extends
`relabelHistoricalTargets` and `getCitationLabel` route coverage to
`currentLocalizationComparison`, `ReaderTable` in `components/chapter-content.tsx`
admits both `B21` 6-column comparison tables (`index === 1 || index === 2`,
forbidding explicit `id` attributes), and `qualifyLocalizationComparisonHistory`
verifies `2` ordinary targets (`-loc-137-ordinary-0` web & print), `14` history
dispositions (`6` web + `6` print `<details data-localization-comparison-history>`
controls stacked cleanly after `#95` copyedit history), and `15` inline
`style="display:block"` public correction notices
(`data-localization-comparison-correction`). `localizationComparisonCapturePin`
(`1a38bd37...`) and `localizationComparisonUnitPin` (`9b23d4b4...`) bind the `4`
changed articles (`B21` web/print plus `B20`/`B22` cross-chapter citation
note-number sync) and `9` changed public artifacts with zero compiled CSS drift
(`be180e5d...`).

## Weighting-and-valuation successor

The #135 Part V cross-system weighting-and-valuation successor
(`scripts/reader-weighting-valuation.mjs` and
`scripts/reader-weighting-valuation-factors.mjs`) updates `B20`
(`content/docs/book/ecological-scarcity-and-targets.mdx`, `26` -> `32` claims)
and `B22` (`content/docs/book/lime-preferences-and-damage-weights.mdx`, `35` ->
`41` claims plus a 2nd responsive 6-column × 4-row Markdown synthesis table in
§4), brings the public catalog from `1,008` to `1,020` claims (`12` new
`cl-weight135-*` claims, `18` single-source/single-artifact `ev-weight135-*`
records bound `1-to-1` to `18` `psg-weight135-*` passages across `18`
SHA-256-verified primary carriers, and `83` `BigInt`-verified `nf-weight135-*`
`numericFacts`), and applies `5` bounded non-case prior-claim synchronizations
(`cl-es-baselines`, `cl-es-judgment`, `cl-lime-purpose`,
`cl-lime-policy-contrast`, `cl-lime-decision`), conserving `100%` of `1,003`
untouched prior claims (including all `7` `CASE-ECOLOGICAL-SCARCITY` and all `9`
`CASE-LIME-VALUATION` claims), all `1,034` prior evidence records, and all `40`
case JSON files byte-for-byte. Before `#133` runs its own rollback and receipt
checks, `prepareWeightingValuationSource` enforces closed `onlyKeys` envelope
allowlists on `config`, `unit`, and `unit.history` (rejecting `layouts`,
`partIntroduction`, `migrations`, and `history.ordinaryOverrides`), restores the
exact `65aafe25a19865d61bd5a251584ce8cc39dc1941` MDX and raw records, and
verifies `weightingValuationPredecessorPin` (`ff59fb32...`), `assertCleanReaderProse`
hygiene, and all `75` bidirectional transitions across `497` dependent consumers.

Across rendered DOM and navigation, `lib/reader-book.ts` extends
`getCitationLabel` route coverage to `currentWeightingValuation`, `ReaderTable`
in `components/chapter-content.tsx` preserves the historical table ID on `B22`
Table 1 while admitting the 2nd synthesis table (`id: null`) only when
`currentWeightingValuation` is active, and `qualifyWeightingValuationHistory`
verifies `10` ordinary targets (including `-weight-135-ordinary-4` on `B22`'s
new table), `18` history dispositions (`14` `<details data-weighting-135-history>`
controls stacked cleanly with `#71`/`#73`/`#90`), and `5` inline
`style="display:block"` public correction notices (`data-weighting-135-correction`
on `B20` Notes 7/28 and `B22` Notes 1/2/40). `weightingValuationCapturePin`
(`4aa9021a...`) and `weightingValuationUnitPin` (`40999572...`) bind the `7`
changed articles and `9` changed public artifacts with zero compiled CSS drift
(`be180e5d...`).

## Part-4-reread successor

The #133 Part IV continuous-reread successor (`scripts/reader-part4-reread.mjs`)
updates 8 managed files (`config/reader-numbering.json`, `content/docs/book/index.mdx`,
`content/monograph/climate-equivalence.mdx`, `content/docs/book/climate-response-and-metrics.mdx`,
`content/docs/book/particulate-emissions-and-health.mdx`,
`content/docs/appendices/particulate-factor-calculations.mdx`,
`knowledge/cases/particulate-health-v1.publication.json`, and
`knowledge/cases/water-locality-v1.publication.json`) and 62 raw records (`61`
`catalog.claims` entries and `rev-part4-reread-133-continuity-and-scopes`),
conserving `100%` of all `1,008` claim IDs, sequence, `evidenceIds`,
`evidenceLinks`, `numericFacts`, `conceptIds`, `mappingIds`, and case input
`.json` files. Before #131 runs its own rollback and receipt checks,
`preparePart4RereadSource` restores the exact `2ba0bfe2f39d28bfa42e61f5e2b70585770bcb73`
bytes (`oldFileShas`) and raw records, verifying `part4RereadPredecessorPin`
(`ee4ca466...`), exact 19-prose / 2-caveat / 2-premise claim invariants, angle-bracket
and internal-token hygiene, `projectPart4RereadNumbering` + `projectPart4RereadPrintParts`,
four `B15`/`B17`/`X04` layout amendments, and all 72 transitions across 148
dependent consumers.

Across rendered DOM, `qualifyPart4RereadHistory` enforces a frozen 4-key
`allowedOrdinaryOverrideKeys` allowlist (`B17` web/print `-particulate-131-ordinary-3`
and `B15` web/print `-bio-127-ordinary-2` without silent `continue` in
`projectScientificOrdinaryTargets`), 54 versioned ordinary targets, 24 history
dispositions (`16` grouped `<details data-part4-reread-history>` controls stacked
after `#127` and `#131` with front-matter-scoped `@unit` attachment on `/docs/book`),
1 strict `attrs`/`childNodes`-verified `<details data-part4-reread-part="4">`
disclosure on `/print#print-part-4`, and 4 inline `style="display:block"` public
correction notices (`data-part4-reread-correction` on `B17` Notes 15/44/45 and
`B18` Note 15). `part4RereadCapturePin` (`fba421eb...`) and `part4RereadUnitPin`
(`4cd6d951...`) bind the 15 changed articles and 5 changed public artifacts with
zero compiled CSS drift (`be180e5d...`).

## Particulate-comparison successor

The #131 B17 successor updates B17's frontmatter `description` (`-particulate-131-ordinary-0`)
and inserts eight canonical claims (`cl-particulate131-*`) at three bounded sites
across B17's four retained sections (`2` at the end of §1 after `cl-pm-precursor-health`,
`2` in §3 after `cl-pm-gemm-alternative`, and `4` in §4 after `cl-pm-uncovered-pathways`,
bringing B17 from 37 to 45 claims and the catalog from 1,000 to 1,008 claims),
conserving 100% of all 1,000 prior claims (including all 54 `cl-pm-*` records and
17 `X04` calculation claims), `X04` MDX, all three B17 navigation paragraphs
(`ordinary-1..3`), and all 40 case JSON files byte-for-byte with zero prior-claim
corrections. Before #129 runs its own rollback and reconstructed
`readerPublicDownloads(particulateInput)` receipt checks,
`prepareParticulateComparisonSource` restores the exact `c0ffd968` B17 MDX
(`e8ece01c...`) and raw source/reading/literature extensions, verifying
`particulateComparisonPredecessorPin` (`acfe4c53...`) and all 63 bidirectional
transitions across 315 dependent consumers (with narrow fail-closed admission for
`rd-kb46-lcimpact2020`, `work-kb46-lcimpact2020`, and `cl-particulate131-*` in
`reader-pm-selection.mjs`).

`reader-particulate-comparison-factors.mjs` binds all 13 single-source
`ev-particulate131-*` records in 1-to-1 bijection with all 13
`psg-particulate131-*` passages across 10 primary PDF/OOXML/XML carriers
(including `PMC5439030` JATS XML `6ddb8ecf...`), all 17 CRC32-verified official
`EF-v3.1.zip` member hashes (`3` reused + `14` newly registered across
`b5c602c6.xml` `v02.00.011`, `126c78f9` source, `01846770` flow property,
`Normalisation_Weighting_Factors_EF_3.1.xlsx`, and 12 primary/coarse `PM` flows)
on `rd-flow-pilot-ef31` via `sameScienceValue`, all 84 structured `numericFacts`
(`84/84` pinned to `Object.freeze` canonical decimal literals and `100%` consumed
in 40-place sign-aware half-up `BigInt` fixed-point arithmetic and 8-claim prose
bindings), and `validateSupportLinks`. Across B17 web and `/print`,
`qualifyParticulateComparisonHistory` verifies all 4 ordinary targets
(`ordinary-0..3`) and 10 grouped dated history controls (relabeling the 37 prior
B17 claims to `注 1..11, 14..28, 31..39, 44..45`), while `particulateComparisonCapturePin`
(`dd1389bf...`) and `particulateComparisonUnitPin` (`0c04aa80...`) bind the 6
changed articles (B17 web/print plus deterministic cross-reference relabeling on
B16 web, B18 web, and X04 web/print) and 8 changed public artifacts with zero
compiled CSS drift (`be180e5d...`).

## Eutrophication-pathways successor

The #129 B16 successor inserts eight canonical claims (`cl-eutro129-*`) at a
single bounded site in B16 §4 right after `<Prose ids="cl-path-operation
cl-path-operation-indicator" />` and before `<ReaderSection id="同一排放不同的环境问题" />`
(bringing B16 from 30 to 38 claims and the catalog from 992 to 1,000 claims),
conserving 100% of all 992 prior claims, Notes `1..22` (including `B18`'s
premise links to `B16` Note `17` `cl-path-marginal-average`), `rd-kb46-lcimpact2020`,
`phosphorus-boundary-v1.json`, and B16's frontmatter `description` (`-acid-113-ordinary-0`)
byte-for-byte with zero prior-claim corrections. Before #127 runs its own
rollback and reconstructed `readerPublicDownloads(eutroInput)` receipt checks,
`prepareEutrophicationPathwaysSource` restores the exact `8fcb2485` B16 MDX
(`c356117f...`) and raw source/reading/literature extensions, verifying
`eutrophicationPathwaysPredecessorPin` (`844fa83c...`) and all 65 bidirectional
transitions across 315 dependent consumers (with narrow fail-closed literature
admission for `work-unep-glam-2019-volume2` in `reader-pm-selection.mjs`).

`reader-eutrophication-pathways-factors.mjs` binds all 12 single-source
`ev-eutro129-*` records in 1-to-1 bijection with all 12 `psg-eutro129-*`
passages across 10 primary PDF/OOXML/XML carriers, all 26 CRC32-verified
official `EF-v3.1.zip` member hashes (`6` reused + `20` newly registered across
`b53ec18f`/`b5c619fa`/`b5c614d2` XMLs, `e58cd71d`/`58bc3cfd` sources,
`Normalisation_Weighting_Factors_EF_3.1.xlsx`, and 17 phosphorus/nitrogen water
and soil flows) on `rd-flow-pilot-ef31` via `sameScienceValue`, and all 126
structured `numericFacts` (`126/126` pinned to canonical decimal literals and
verified in 40-place `BigInt` fixed-point arithmetic with zero single-fact
mutation survivors even when row digests are bypassed). Across B16 web and
`/print`, `qualifyEutrophicationPathwaysHistory` stacks three generations of
dated history controls (`acid-equivalents -> photochemical-ozone ->
eutrophication-pathways`, `8` dispositions / `6` grouped controls) with
`[data-eutrophication-pathways-history]` excluded from `citationScopeExclusions`,
`ordinaryExclusions`, and `apparatus`, while `relabelHistoricalTargets` updates
the shifted `#119` ozone note labels to `注 31..38`. `eutrophicationPathwaysCapturePin`
(`e68938ca...`) and `eutrophicationPathwaysUnitPin` (`ec31ab87...`) bind the 2
changed B16 articles and 7 changed public artifacts with zero compiled CSS drift
(`be180e5d...`).

## Biogenic-carbon successor

The #127 B15 successor inserts eight canonical claims (`cl-bio127-*`) across
B15's five retained sections (`1 + (1 + 2) + 2 + 1 + 1`, bringing B15 from 41 to
49 claims, companion `climate-response-and-metrics` from 34 to 41 claims,
companion `emission-time-and-assessment` from 7 to 8 claims, and the catalog
from 984 to 992 claims), anchors the conserved response figure with
`<ReaderFigure>` (`ordinary-figure`), and updates all three B15 frontmatter
`description` fields (`ordinary-0`), keeping 100% of all 984 prior claims,
`rd-kb46-lcimpact2020`, `climate-numerical-reconstruction.mdx`, and
`climate-metrics-v1.json` byte-for-byte unchanged with zero prior-claim
corrections. Before #125 runs its own rollback and reconstructed
`readerPublicDownloads(bioInput)` receipt checks, `prepareBiogenicCarbonSource`
restores the exact `5c982449` MDX files (`b5fceaa2...`, `d3f4b3bd...`,
`30ba85d1...`) and raw source/reading/literature extensions, verifying
`biogenicCarbonPredecessorPin`, all three `B15:*:reader-source` layout locks
(blocking newline and `<`/`>` injection in `description`), and all 67
bidirectional transitions across 340 dependent consumers.

`reader-biogenic-carbon-factors.mjs` binds all 13 single-source `ev-bio127-*`
records in 1-to-1 bijection with all 13 `psg-bio127-*` passages, their 11 primary
PDF/OOXML/XML carriers, all 23 CRC32-verified official `EF-v3.1.zip` member
hashes (`4` reused + `19` newly registered, including 248-page `pef_method.pdf`
`JRC115959`) on `rd-flow-pilot-ef31` via `sameScienceValue`, and all 128
structured `numericFacts` (`128/128` pinned to canonical decimal literals and
verified in sign-aware half-away-from-zero 40-place `BigInt` fixed-point
arithmetic with zero single-fact or coupled-pair mutation survivors even when
row digests are bypassed). `ReaderFigure` fails closed at render time on
missing/duplicate/explicit IDs while `inspectClimateAssemblySource` enforces
backreferenced tag matching `/<(figure|ReaderFigure)>[\s\S]*?<\/\1>/g`. Across
B15 print and both companion web pages, `qualifyBiogenicCarbonHistory` binds all
15 `P` and `FIGURE` ordinary targets and all 104 prior B15 citation addresses
across 19 history dispositions (`6 + 3 + 7` rendered `<details>` controls), while
`relabelHistoricalTargets` updates shifted B15 note labels without altering
historical scope memberships. `biogenicCarbonCapturePin` binds 13 changed
articles and 8 changed public artifacts with zero compiled CSS drift
(`be180e5d...`).

## Water-scarcity successor

The #125 B18 successor inserts eight canonical claims (`cl-water125-*`) across
B18's four retained sections and two `ReaderSection` anchors (`2 + 2 + 0 + (2 + 2)`,
bringing B18 from 20 to 28 claims and the catalog from 976 to 984 claims) and
updates B18's frontmatter `description` (`ordinary-0`), keeping 100% of all 976
prior claims and all 8 `rd-water-*` readings byte-for-byte unchanged with zero
prior-claim corrections. Before #123 runs its own rollback and reconstructed
`readerPublicDownloads(waterInput)` receipt checks, `prepareWaterScarcitySource`
restores the exact `9486bae9` B18 MDX (`8ae52be3...`) and raw source/reading/
literature extensions, verifying `waterScarcityPredecessorPin`, the `B18:reader-source`
layout lock, and all 49 bidirectional transitions across 171 dependent consumers.

`reader-water-scarcity-factors.mjs` binds all 9 single-source `ev-water125-*`
records in 1-to-1 bijection with all 9 `psg-water125-*` passages, their 7 primary
PDF/XML carriers, all 15 CRC32-verified official EF 3.1 XML member hashes on
`rd-flow-pilot-ef31` via `sameScienceValue`, and all 106 structured `numericFacts`
(`106/106` actively verified in 40-place `BigInt` fixed-point arithmetic, 10:1
industrial groundwater split, `1350/1000 = 1.35×` denominator amplification,
`AU`/`BD`, `CL`/`CN` and `BE`/`CA` rank reversals, `-0.005` unlocated global
asymmetry, `Table S6.2` 52-row A–E / row 53 `Fiji` F–Z boundary, reviewed/
conceptIds self-checks, and prose assertions across all 8 claims). At B18 web
and `/print` addresses, `qualifyWaterScarcityHistory` binds `ordinary-0` and all
58 prior B18 citation addresses across 7 web and 7 print dated controls (leaving
unchanged Section 3 unamended), while `reader-flow-boundary.mjs` strictly validates
grouped print `origins` (`print-unit-...` + `print-reading-unit-...`) alongside
`#109` copyedit-history and legacy-scope siblings without single-node attribute
short-circuiting. `waterScarcityCapturePin` binds 6 changed articles (B18 web/print,
neighbor B17/B19 pagination descriptions, and `uncertainty-and-variability`
web/print Note 8,9 -> 10,11 label sync) and 8 changed public artifacts.

## Toxicity-comparison successor

The #123 B19 successor inserts eight canonical claims (`cl-tox123-*`) across
B19's three retained sections (`2 + 3 + (2 + 1)`, bringing B19 from 12 to 20
claims and the catalog from 968 to 976 claims) and updates B19's frontmatter
`description` (`ordinary-0`), keeping 100% of all 968 prior claims (and
`rd-usetox-2-documentation-v11`) byte-for-byte unchanged with zero prior-claim
corrections. Before #121 runs its own rollback and reconstructed
`readerPublicDownloads(ozradInput)` receipt checks, `prepareToxicityComparisonSource`
restores the exact `2eba26c6` B19 MDX and raw source/reading/literature
extensions, verifying `toxicityComparisonPredecessorPin`, both `B19:reader-source`
and `B17:reverse-concept-consumers` (`cn-toxic-pathway`) layout locks, and all
54 bidirectional transitions across 163 dependent consumers.

`reader-toxicity-comparison-factors.mjs` binds all 12 single-source `ev-tox123-*`
records in 1-to-1 bijection with all 12 `psg-tox123-*` passages, their 7 primary
PDF/XML carriers, all 34 CRC32-verified official EF 3.1 XML member hashes on
`rd-flow-pilot-ef31` via `sameScienceValue`, and all 132 structured `numericFacts`
(`132/132` actively verified in 40-place `BigInt` fixed-point arithmetic, 3-sig-fig
table rounding, `20/17` fallback, `Cu`/`Hg` and `1,4-DCB`/`Nickel` rank reversals,
speciation averages, and prose assertions across all 8 claims). At B19 web and
`/print` addresses, `qualifyToxicityComparisonHistory` binds `ordinary-0` and all
36 prior B19 citation addresses while preserving `#88`'s retained legacy scopes.
Because updating B19's `description` refreshes `coverage/index.html` and both
neighboring web chapters' `.docs-pagination` (`B18` and `B20`) while shifting
`cl-usetox-missing-data-model-zero` from Note 9 to Note 14 on B32 web/print,
`toxicityComparisonCapturePin` binds 6 changed articles and 8 changed public
artifacts.

## Ozone-and-radiation successor

The #121 B14 successor inserts eight canonical claims (`cl-ozrad121-*`) across
B14's three retained sections (`2 + 3 + 3`, bringing B14 from 34 to 42 claims
and the catalog from 960 to 968 claims) and records two explicit dated
four-example framing synchronizations on `cl-lcia-midpoint-pathway` (Note 1) and
`cl-mineral115-judgment` (Note 41), keeping all 958 other prior claims
byte-for-byte unchanged. Before #119 runs its own rollback and reconstructed
`readerPublicDownloads(ozoneInput)` receipt checks, `prepareOzoneRadiationSource`
restores the exact `c5e3d886` B14 MDX, raw source/reading/literature extensions,
and both prior claim records, verifying `ozoneRadiationPredecessorPin` and all
49 bidirectional transitions across 153 dependent consumers.

`reader-ozone-radiation-factors.mjs` binds all 10 single-source `ev-ozrad121-*`
records in 1-to-1 bijection with all 10 `psg-ozrad121-*` passages, their 6
primary PDF/XML carriers, all 26 CRC32-verified official EF 3.1 XML member
hashes on `rd-flow-pilot-ef31` via `sameScienceValue`, and all 91 structured
`numericFacts` (`91/91` actively verified in `BigInt` fixed-point arithmetic,
`14:11` Frischknecht scaling, and RIVM `Table 3.2` `1 - exp((-t - 3) / tau)` vs
`1 - exp(-(t - 3) / tau)` recomputations). At shared B14 chapter and section
addresses, `qualifyOzoneRadiationHistory` enforces four-generation DOM sibling
ordering (`#111` `land-recovery` → `#115` `mineral-resources` → `#117`
`fossil-resources` → `#121` `ozone-radiation`), while `chapter-content.tsx` and
`validateOzoneRadiationCorrectionOutput` require inline `display:block` and
terminal intra-note ordering on all four Note 1 and Note 41 revision callouts
across web and `@media print`. Because synchronizing `cl-lcia-midpoint-pathway`
updates `cn-midpoint`, `concepts/index.html` joins the 8 changed public
artifacts and 6 affected web/print articles bound by `ozoneRadiationCapturePin`.

## Photochemical-ozone successor

The #119 B16 successor inserts seven canonical claims (`cl-ozone119-*`) inside
`<ReaderSection id="同一排放不同的环境问题" />` immediately before
`cl-path-multiple-paths` (bringing B16 from 23 to 30 claims and the catalog from
953 to 960 claims while keeping all 953 baseline claims byte-for-byte unchanged
and `correction: null`). Before #117 runs its own rollback and receipt checks,
`preparePhotochemicalOzoneSource` restores the exact `13064f9` B16 MDX and raw
source/reading/literature extensions, verifying exact predecessor state pins and
cross-generation consumer closures.

`reader-photochemical-ozone-factors.mjs` binds all 9 `ev-ozone119-*` evidence
records, their 6 primary PDF/XML carriers, all 17 newly registered CRC32-verified
official EF 3.1 XML member hashes, and 43 structured numeric facts, plus `BigInt`
fixed-point verification of the `0.23435` (`0.234` at 3 sig figs versus XML
`0.235`) generic `VOC` relation, cross-system and cross-receptor precursor
order reversals, regional `Table S2.1` `NOx` titration sign flips, EF 3.1's 720
constant `<location>` rows versus country-resolved Acidification and Terrestrial
eutrophication rows, and same-UUID multi-pathway precursor factors. At shared
B16 addresses, `qualifyPhotochemicalOzoneHistory` enforces strict two-generation
ordering (`#113` `acid-equivalents` before `#119` `photochemical-ozone`) and
titles the `#同一排放不同的环境问题` section marker without shifting B16 Notes
`1..22` (preserving B18's downstream links to B16 Note 17).

## Fossil-resources successor

The #117 B14 successor inserts eight canonical claims across B14's three
existing sections (`3 + 1 + 4`, bringing B14 from 26 to 34 claims) and records
one explicit three-example closing sync on `cl-mineral115-judgment`. Before #115
runs its own rollback and receipt checks, `prepareFossilResourcesSource` restores
the exact `ba8a101` B14 MDX, raw source/reading/literature extensions, and the
prior `cl-mineral115-judgment` record, verifying exact state pins and cross-state
dependency closures.

`reader-fossil-resources-factors.mjs` binds all 14 `ev-fossil117-*` evidence
records, their 7 primary PDF/OOXML/HTML/XML carriers, all 10 CRC32-verified
official EF 3.1 XML member hashes, and 31 structured numeric facts (including
full-precision OOXML uranium `ADP`, EF 3.1 `1 MJ/MJ` energy-carrier factors,
ecoinvent `HHV` and rounded `FFP` values, endpoint `SCP` values and unclosed
`Table S9.2` parameters), plus `BigInt` fixed-point verification of the equal
`1 kg oil-eq` endpoint divergence and egalitarian proxy ratio.

At shared B14 section and chapter addresses, `validateDatedHistoryOutput` now
qualifies an ordered reverse-chronological chain of preceding controls (`#115`
then `#111`) without relaxing attachment checks. Both Note 1's `#115` opening
correction and Note 33's `#117` closing sync render inline `display:block`
notices verified under actual print media. Because no concept-defining claim
changes in #117, `concepts/index.html` retains its #115 fingerprint while the
7 changed catalog/research HTML and JSON artifacts and 6 affected web/print
articles bind to actual compiler/exporter bytes.

## Mineral-resources successor

The #115 B14 successor inserts ten claims in three existing sections and makes
one explicit historical opening correction. It restores the exact prior B14
MDX, raw source/reading/literature extensions and the one old claim before #113
checks its own reconstructed downloads and continues to #111. Complete raw
transitions and the dependency closure are derived from both states; current
self-consistent fingerprints alone do not waive predecessor qualification.

The factor guard binds seventeen selected decimal facts to their actual workbook
or PDF carriers, row/scenario/cell/locator/unit and explicit claim support roles.
The matched-reserve argument additionally joins RIVM S8.1, SCP supplementary S2
and the journal Table1 for distinct R and CME responsibilities. Original OOXML
cached lexical values retain their full decimal fidelity, separate from prose
rounding and the book's multiplication of printed values.

B14 preserves both the original #111 six-note history and the later #115
sixteen-note history at shared native addresses. Only an exact independently
expected preceding #111 same-address control may sit between #115 and its
native target; both controls must qualify in order. The canonical first note
also discloses its explicit emission-framing correction and old immutable source.
That one essential correction has an inline display override so the general
legacy-context print-hiding rule cannot erase it. Global and compiled CSS remain
unchanged; the actual print-media check and rebuilt capture verify the effect.
Apparatus filtering follows these checks, rather than bypassing them. Ordinary
production remains closed while source, reader or output acceptance is pending;
an isolated technical preview is not a production or hosted qualification.

The corrected opening also changes the public concept projection. Actual capture
therefore includes the observed concepts page as well as claims, sources and
research pages and four public JSON artifacts. Those bytes and the affected
article pairs are measured from actual compiler/export output, with the dirty
preview producer identity preserved separately from later clean Main hosting.

## Acid-equivalents successor

The #113 qualifier preserves the exact prior B16 file by admitting only two Prose
insertions, then restores the three prior raw knowledge objects before #111 and
the earlier chain. It retains the complete-change and exact-predecessor checks.
Five old reading extensions and one EF work pointer addition have narrow bounds.
The old PM check may accept only the exact raw successor of its GLAM reading and
only while #113 is active; other PM records and old locators retain their checks.

The six selected factor tuples bind values, method/flow versions, direction,
country and declared equivalents. Separate checks bind their Mass/kg evidence,
passages and original carriers, and require explicit supports-links from the
comparison claims. This closes a pre-acceptance carrier-substitution gap found
independently; the actual source values and capture were already correct.
The validation-only hardening requalified the retained capture without rebuilding
or relabeling it. Two water articles change only note9 to17 on the same fragment.
Raw and normalized evidence, original scopes and current outputs remain separate.

## Land-recovery successor

The #111 B14 qualifier restores the exact preceding MDX by removing only three
bounded `Prose` insertions. It restores the raw catalog, readings and literature
before #109 verifies its own public JSON and the older chain runs. The acquired
RIVM work retains its original identity, discovery and ordered entries; access,
rights and selected-reading additions have narrow permissions. The old journal
reading permits only its declared appended historical-access clarification.

Both state identity and the complete transition declaration are checked. For the
union of preceding and current file/record fingerprints, every real difference
must have its exact old value and declared change; omitted or unchanged declared
keys are rejected. This guard was added after independent negative probes showed
that correct state reconstruction alone did not prove a complete declaration.

Original B14 chapter/annotation six-note scopes and section scopes of 3/2/1 remain
distinct from the current 16 and 6/8/2. Four downstream article changes only update
the visible note label to 16 while retaining the same canonical fragment. The
capture binds six route-qualified article digests, three public HTML digests and
four source-derived JSON payloads to eleven physical files. Validation hardening
did not change the retained technical capture; fixed-source and actual-output
checks requalified it before the independent primary acceptance.

## Circular-footprint successor

The #109 B13 unit admits one bounded qualitative addition and selected-reading
extensions to two existing PEF sources. It restores actual preceding B13 bytes
and all three raw knowledge objects before #107 checks its own source and public
JSON receipts. Existing carrier identities, passage prefixes and older scientific
contracts retain their independent qualification. No case or registry changes
are needed for the symbolic comparison.

The original B13 chapter and six-note market marker keep their exact historical
claim lists even though the last original claim follows seven new paragraphs.
Current marker membership and former citation membership are distinct. Both
views preserve unique native notes and a precise description target with the
same scoped scroll margin used for #107. The actual capture binds nine physical
files to the two B13 article digests, three public HTML digests and four public
JSON artifacts. A private technical admission remains separate from the formal
source, continuous-reader and actual-output judgments and the later clean build.

## Finite load-shift successor

The #107 B12 unit extends the bounded successor chain with one closed authored
dispatch case. It restores actual prior file bytes before #105 and #102 run:
the exact original B12 MDX, the registry with only the two declared additions
removed, and the absence of the three new case assets. Restoring fingerprints
without restoring the raw file map is insufficient. The preceding three raw
knowledge objects and all older case contracts retain their own qualification.

Current input and evaluated-result downloads are checked against the exact case
version and actual producer commit. The #107-active check also verifies the
retained B12 power case's canonical input and evaluated bytes. This is a bounded
additional guard, not a claim of new universal producer-header enforcement for
all older case files. The actual exporter still generates all registered cases.

The independent capture binds raw file digests and lengths to normalized public
HTML and per-path/per-route article digests measured from those same physical
files. Two print articles cannot trade fingerprints merely because they share a
file path. Capture identity includes the normalization-proof digest and remains
part of the output-review subject. Re-signing candidate summaries cannot attach
uncaptured normalized text to an older raw HTML capture.

B12's preserved ordinary table has an exact native target, with unchanged cells
and separately checked visibility. The scoped history renderer admits that table
alongside this unit's paragraphs; older guards keep their original tag policies.
The #107 versioned ordinary targets receive scroll margin below sticky headers;
the later #109 description targets use the same bounded behavior.
Actual no-script keyboard checks supplement DOM visibility with viewport bounds
and first-cell hit tests. Private technical admissions and fixture receipts do
not provide the separate editorial source, reader or output acceptance.

## Bounded comparative successor

`reader-substitution-rules.mjs` admits the separately reviewed #105 B10 unit
after #102. The small shared `reader-scientific-delta.mjs` helpers restore exact
raw catalog, reading and literature objects from reviewed sparse transitions,
preserve old source/carrier/passage identity and order, and check the independently
pinned f8751d5 state. #102 public JSON receipts are recomputed from those restored
raw objects before the existing #102 → #99 → #95 → #93 chain runs. Hash projections
alone cannot substitute for raw reconstruction. The new profile permits the two
actual B10 sources, their approved occurrences and limited ordinary-text changes;
all original joint-production cases and older scope guards continue unchanged.

Output review binds a separately pinned capture made from retained actual exporter
bytes: source commit, dirty/status, manifest digest, raw article files and public
artifacts. Current public JSON also has independent source projection checks.
Capture identity participates only in the output-review subject; existing source
and reader subjects keep their original semantics. This rejects internally
consistent receipts that invent a commit, clean status or raw HTML byte facts.
The actual technical capture is explicitly a dirty working preview, not the later
clean production or hosted Main. Its temporary fixture approval is not editorial
acceptance. The primary review and subsequent ordinary production checks remain
separate obligations.

## Service-constraint successor

`reader-service-constraints.mjs` admits the separately reviewed #102 unit after
#99. It verifies the exact 10dc686 source state and captured B07 native scopes,
then projects its bounded additions back through the original #99/#95/#93 gates.
Current raw case input, publication binding, evaluator and exact registry addition
join the observed source set. Ordered predecessor fingerprints retain legitimate
intermediate generations; they do not authorize an arbitrary earlier value.
The shared B07 keeps its three section IDs and original ten claims while adding
nine independently reviewed explanations. Its earlier eight-note and captured
ten-note scopes retain their distinct native destinations.

The static CASE-SERVICE-CONSTRAINTS keeps the original printed monetary matrix,
the matrix derived from the paper's stated relation and author controls separate.
Its closed exact-rational evaluator does not run the author's software. Full
numeric facts include quantity and basis and bind the actual selected PDF passage.
Both views provide versioned input and evaluated-result links for this case;
actual DOM qualification checks the precise pair, version and visible targets.
Existing cases retain their own input and rendering contracts.

Each dated historical note is checked at its unique visible native claim node,
in addition to checking its link and disclosure. Re-capturing an article digest
cannot make a hidden historical target valid. Source, reader and actual-output
reports have separate subject bindings. Ordinary public JSON is reconstructed
from current records to check both its raw digest and UTF-8 byte length. New case
results are reconstructed using the recorded capture commit: their complete raw
bytes differ from the scientific content digest that excludes only sourceCommit.
HTML raw capture digests are retained as observed evidence, while normalized
article fingerprints and current DOM semantics are validated independently.
A technical export is an actual artifact but its temporary test acceptance is
never a scientific or reader approval. Ordinary production still rejects preview.


## Flow and boundary scientific successor

`reader-flow-boundary.mjs` admits only the separately reviewed `flow-boundary-99`
unit. It compares independently observed current file/record/order/dependency
and reader structures with the qualified0496e14 predecessor, then reconstructs
the predecessor observations for the unchanged #95/#93 qualification. That reverse
projection establishes the earlier generation only; actual candidate prose,
annotations, source records, navigation and exported artifacts have their own
current checks. Inactive and private-preview states never authorize production.

The scoped source plan protects every earlier canonical claim and the33 native
case templates/input. An extended old reading additionally preserves its original
artifact/passage records and order, work and original reading/acquisition identity;
matching whole-record successor hashes cannot waive this nested conservation.
Appraisal and historically dated unread-scope clarifications are explicit deltas.
The older pedigree reading qualification remains independently enforced, with
only the exact admitted successor projected through its original metadata checks.

Current B08 and its two fine pages use the same canonical records and numbering.
The four retained formal section IDs may have newly accepted titles and members;
new subordinate headings carry their actual numbered depth. Qualified former
titles and note subsets remain accessible, including S01's precise reference to
the retained waste-history claim. Each changed ordinary paragraph has its own
actual target, content and link fingerprint; merely pointing several former blocks
to an existing chapter address does not establish a semantic destination. The
new dated paragraph IDs are publication identities whose future migration needs
the same treatment. Closed history disclosures are permitted, hidden or inert
controls, links and targets are not.

Three real artifact/report pairs bind source, reader and output subjects. A
formal output artifact names `actual-export` and the ordered real public files
with byte sizes and hashes; forecast or `previewDownloads` observations are
ineligible. A controlled isolated technical production run may supply actual
bytes before final review, but its temporary test receipt is not a public or
scientific acceptance. After substantive review the primary agent sets the
separate unit pin and verifies ordinary production/export against the actual
observations. Historical fixtures explicitly exercise their own generation;
their archived inputs and negative cases are not rewritten for the new unit.

## Chinese expression successor

The #95 copyedit keeps the accepted complete-readable-book generation intact.
`reader-copyedit-8148-capture.json` is separately pinned to the actual 50 saved
HTML documents, 2,401 native addresses, source tree and hosted manifest of Main
`8148f71`. The reviewed `chinese-expression-95` unit is admitted by its independent
pin and ten real source/reader/output evidence files. An inactive or private
preview overlay still carries no production acceptance; the production source
gate and exporter refuse a preview. Production and hosted output are checked
separately against the admitted manuscript.

The successor compares exact 8148 file and record fingerprints with actual new
values, then verifies the old accepted generation through its original
fingerprints. Ordered claim occurrences, research and scientific metadata,
claim/template scope and caveats, numerical inputs, template slots and protected
component structure remain fixed. Layout changes use explicit reader-text keys
and preserve their field shapes, members, native IDs and destinations. A language
unit cannot override scientific, consumer-membership or interaction-mode keys.

Ordinary links retain their actual destinations in each original block, including
empty positions; preserving an article-wide link list is insufficient. Handwritten
table bodies retain their data, units and positions. Table-header wording still
needs independent review of each column's meaning. A changed title retains its
native address and a bounded, accessible statement of the 8148 title and source;
unchanged wording does not add a reader notice. The actual seven print-part
headers include their titles, introductions and history disclosure in the output
fingerprints. Reader controls and their ancestors must remain available in the
intended screen/fragment context; ordinary print-media hiding is separate.

The #95 container cross-references have one explicit layout amendment,
`B02:appendix-print-links`. It applies to the exact B02-to-appendix A and
appendix A-to-B02 source and fragment pairs in `frameworkBookHref`. Each local
print ID combines the target's existing `printUnitAnchor` and section ID. The
history validator checks the captured web and print section titles, ordered
claim scopes and ordinary-block counts, then verifies the actual current
native targets and the two links in their original paragraph positions. The
private preview or reviewed successor must carry this amendment. Inactive
builds retain the 8148 destinations, and the website and historical citation
renderers continue to use their original routes.

Three new artifact/report pairs bind source, reader and output subjects after
the predecessor's date. Their supporting files are the four fixed, real JSON
summaries under `_docs/editorial/review-evidence/chinese-expression-95/`:
`before-after`, `source-meaning-review`, `reader-review` and `actual-output-review`.
The loader checks bytes, role, unit, subject, date and regular-file identity;
missing files, symlinks, duplicate roles and arbitrary paths fail. Source evidence
binds changes and affected consumers. Reader evidence accounts for every actual
book/web article, including reasoned retention. Output evidence covers all 88
articles, nine public artifacts and seven print parts, with unchanged outputs
explicitly retained. These checks identify the reviewed objects; the main
reviewer remains responsible for the reports' substantive truth.

## Complete-manuscript current edition

`readable-book-original.json` retains the c8 Main inventory;
`readable-book-baseline.json` separately freezes the exact 07e4 PM/Main join.
`reader-current-edition.mjs` compares actual files, raw and public records,
ordered record families, research metadata and the dependency graph. The graph
includes work, source, reading, passage, evidence and claim relationships.
Original numerical inputs and chapter-specific scientific predicates remain
independent obligations. Current acceptance cannot silently replace them.

Each accepted unit names its exact changes, layout amendments, historical
migrations, current reading entries and affected consumers. Three actual JSON
artifact/report pairs under `_docs/editorial/review-evidence/` bind source,
reader and output judgments to that unit's precise subject. The output subject
also includes actual article and public-artifact fingerprints. Independent pins
in `reader-current-edition-pins.mjs` are recorded only after substantive review;
neither a copied digest nor a changed review date grants acceptance.

`readable-book-hosted-history.json` is a separately qualified capture of c8
hosting. Old titles, ordered note subsets and ordinary-content ranges are
compared with actual output even when a native address survives. A changed
ordinary block needs its old digest and a reviewed destination containing the
specified current block digest or canonical claim. Source and consumer meaning
remain human/agent review questions; these checks establish the exact objects
on which those judgments were made.

Actual output checks include all affected book/web articles, compiled CSS when
changed, the public source/claim/concept/research views and their corresponding
downloads. Public HTML is checked against current record fields in addition to
its accepted bytes, so mixed generations cannot pass merely by listing their
hashes. `changes` verifies real Git identity separately from manuscript content.

The Next production configuration invokes the source gate directly. Explicit
private review uses a preview plan and `.reader-review-output`; the production
validator/exporter refuses preview state. Generic test fixtures have a separate
entry point and cannot be enabled by renaming the real package. The chapter
sections below retain their original generation-specific obligations; current
amendments must pass the complete-edition checks in addition to those duties.

Authored full-unit `/print/#...` links resolve through the declared current
reading entries. The transformation matches only an exact registered unit
fragment; note, section, external and unknown fragments remain unchanged.
Historical references use their own renderer and keep the original scoped
destination. The website and book ordinary-navigation guards apply the same
bounded transformation before comparing actual labels and targets.

The B09 invoice comparison and B27 cup-study summary may each include one
explicitly reviewed static table with two accompanying paragraphs. Their source
parsers bind the exact section, adjacent canonical claims and table dimensions;
actual output verifies every cell, header role, row order, ordinary paragraph,
position and visibility. Unregistered tables and extra text remain errors. The
shared helper does not relax either chapter's original source, case-input,
canonical-note, research or historical-scope checks.

Historical regression suites carry an explicit, content-hashed f650600 data
fixture and execute the current validator code in an isolated temporary
directory. The original individual negative tests remain registered. The fixture
is available without Git history or network access; production has no switch to
select it. Current numbering and source-admission tests run against the actual
reviewed edition, including rejection of a changed accepted paragraph.

The generated `.reader-review-output/` directory is ignored alongside normal
build output. Tailwind source detection must not scan a prior compiled preview.
Clean production and isolated preview compilation are compared by actual CSS
bytes; a differing collection requires a reviewed output amendment, never an
automatic refresh of the acceptance hash.

## Toxicity pathway publication

`scripts/reader-toxicity-pathways.mjs` binds the single shared C27/B19 source to
its reviewed twelve-paragraph, three-section manuscript. The immutable c919
inventory retains the original six propositions, seven evidence records, manual
identity, eighteen numerical inputs and original citation scopes. A separately
pinned acceptance binds current records and selected research additions, including
the exact gap, three revision events and three search queries. Unrelated register
growth remains possible; B25 protects its relevant work instead of freezing the
entire literature inventory.

Three actual captured print headings supplement the 4,146 earlier obligations.
Old six-note groups and two-note sections keep their dated source identity and
exact destinations. Runtime, export and actual-output checks share the qualified
map while separately checking text, annotation meaning, numbers and native
controls. Output admission rejects altered ordered-list ordinals, duplicate note
lists, missing copy controls and wrong heading self-links. The three changed B32
premises require a separate toxicity acceptance and two explicit consumer
judgments; earlier climate/data acceptance and original closures remain unchanged.
An engineering fixture cannot admit a pending production record or supply source,
reader, empirical or hosted-publication approval.

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

The Next.js 16.4.6 security maintenance in #186 preserves actual source hashing
through `readReadableBookFiles` and `inspectReadableBookEdition`. Editorial
predecessor validation explicitly uses `readReadableBookHistoryFiles`, which
verifies the complete authorized manifest SHA-256
`49fc65f45e5908fa0ad7d86c19cdf8266709d754af3754665f545c0af47b500a`
before reconstructing the original Next.js 16.4.4 manifest bytes for historical
replay. Other manifest changes retain their real bytes and encounter the existing
history guards. The original scientific baselines and reviewed receipts retain
their identities. Builds execute the actual installed patched framework, and
exported source identity continues to describe the actual Git state.

Next.js App Router, Fumadocs MDX/UI, React, TypeScript and Tailwind produce a static site. Chinese was the initial publication language; on 2026-11-23 (`#246`) the user authorized a meaning-equivalent English edition adopting the workspace `docs`/`tidas` bilingual routing pattern (`/zh/**` and `/en/**` full prefixes, `/` as Chinese `x-default` home, `/zh/` canonical to `/`, client-side language negotiation on `/` using `tiangong.manual-language`, hreflang restricted to published counterparts, and no edge language redirects), while retaining client-side per-language static search (no external hosted search service) and keeping `/downloads/manifest.json` intact for EdgeOne verification. Exact compatible dependencies and the pnpm lockfile are authoritative.

### Bilingual parallel layer and prefix migration (`#246`)

- **Checkpoint isolation**: Chinese canonical records (`knowledge/catalog.json`, `content/docs/**`, `knowledge/cases/*.publication.json`, `config/reader-numbering.json`, `config/book-edition.json`, `components/teaching-case-client.tsx`, `components/joint-production-case.tsx`) remain inside the checkpoint/revision integrity boundary. English prose, case templates (`approvedInputSha256`-bound), reference apparatus, termbase, edition-specific notes and alignment live outside that boundary under `knowledge/editions/en/**`, `knowledge/editions/alignment.json`, `content-en/docs/**` and `config/editions/en/**`.
- **Stable internal keys vs public paths**: Internal unit keys (e.g. `/docs/book/joint-production`) and print anchors remain stable; public URLs prepend the locale prefix (`/zh/...`, `/en/...`). Legacy unprefixed Chinese URLs keep 301 redirects in `edgeone.json` plus static HTML redirect pages with anchor maps in `scripts/export.mjs`.
- **Drift & parity guards**: English claims record `zhDigest` (SHA-256 of the Chinese public projection) and fail validation on drift unless explicitly marked `pendingSync` (rendered publicly as an update notice). Separate parity validators verify coverage, structure, numeric/unit multisets, evidence sets, `Unverified` parity for `待核` items, Han-character leakage, English process-prose/draft-chapter leaks, same-locale links, and hreflang accuracy.

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

The wall selection keeps its single source route and22original canonical/template
records under four sections. The widget now follows the rough comparison and
precedes the exercise. Two trace tables preserve each full f/s/electricity/g/I
reconstruction; five original tables, plot, controls and independent predicates
remain. The coordinate paragraph links natively to the complete matrix/reference
surface. Its title uses a deterministic view-specific ID; `useId` remains only for
control and chart accessibility. The two actual old React-generated title IDs are
historical notices, not promises about future component-tree positions.

`wall-selection-original.json` freezes the source, public scientific closure,
original104wall histories, component representations and numerical identities.
`wall-selection-heading-history.json` binds seven additional actual638c19d hosted
heading addresses. Their independent pins supplement existing history pins.
`reader-wall-selection.mjs` remaps the old five-section and case scopes to dated
native notices with precise original note subsets, and preserves original22-note
group/title context. The old section that contained the complete calculator names
its current calculation reference as well as its four original notes. Shared
runtime labels identify the actual new section or calculation title. Generic
history checks and the wall-specific scope checks both apply; a surviving empty
ID is insufficient.

The separately approved `wall-selection-accepted.json` binds complete current
source and semantic presentations, all23old paragraph/five heading dispositions,
ten local condition roles, seven tables and exact native links. A null independent
pin or pending receipt refuses publication. Source validation reads actual
component/input/publication/evaluator bytes; runtime coverage validates the exact
canonical/source/evidence/premise records and four-section22-paragraph order.
Output checks run after full numbering admission and verify actual text, matrix
and contribution data, controls, visible conditions, annotations, original scopes,
position and destinations. Five original tables remain independently required
alongside the complete new trace quantities. These gates do not establish a
fresh original-source reading, empirical validity or final browser qualification.

Derived text artifacts retain original URL/media type and explicit absence of original bytes; their text hash is visibly distinct from an original-document hash. Catalog/research validation checks the same qualification fields and their joins; public exports retain them while excluding raw captures and private metadata.

## Bounded joint-product model

`scripts/joint-production.mjs` evaluates a fixed-ratio batch and three declared utilization scenarios with exact reduced rational outputs. It checks separate inventory coordinates, additive mass/sales shares, both service requirements, joint-Y disposition, positive physical routes and algebraic comparison-residual reconstruction. Negative residuals and the deliberately invalid sum of separately anchored comparisons are distinct from physical emissions. No LCIA factors or cross-flow sum exists in this model.

The closed registry in `case-publication.mjs` selects each known case's nested public projection, validator, evaluation context and numerical-source policy together. The joint input is explicitly inventory-only; an input flag cannot disable the wall case's factor/evidence checks. Wall projection order and downloadable hash are preserved by regression. Joint templates use `input` and `evaluated` paths; the existing export pipeline writes both models' canonical inputs, evaluated receipts and manifest hashes.

`JointProductionCase` renders static, horizontally scrollable lookup tables after projecting raw input on the server. The canonical chapter supplies the full derivation once; the component retains four unchanged tables, a concise input/reference legend, eleven visible assumptions and exact native links to the appropriate website/book sections. It sends no raw-case client data prop. The fixed question, operation basis, separate units, full-basket comparison, residual interpretation and hypothetical assumptions remain visible in the narrative and static/no-script/print view. This is a second bounded adapter, not a general allocation or market-response solver.

## Reader shell and scholarly apparatus

The standard Fumadocs DocsLayout owns document navigation, sidebar, TOC, search/theme controls and mobile menu. HomeLayout supplies the other public routes. Theme/brand tokens follow the owning docs site; homepage72rem sizing does not constrain the document grid. No extra42rem prose cap or second document header/mobile index is added. Chinese translations and the existing local knowledge search corpus are retained without adding an external search service.

Current implementation: `lib/reader-book.ts` keeps canonical source enumeration separate from the cloned, numbered website tree and reads the explicit current print roster in `config/book-edition.json`. Shared front matter precedes seven parts of actual chapters; independently authored B04 and B10 replace their respective pairs of fine website units, and X02 follows X01 under appendices. `scripts/reader-book.mjs` creates one note plan per complete MDX source, ignoring code/comment examples. `ChapterContent` injects paragraph components with one local reference marker, then appends reader annotations. `ClaimAnnotation` supplies source locations, scope and material caveats without execution logs or visible database keys. Print reuses the renderer with unique prefixes and demoted section headings. Reader appendix pages expose bibliography, citations and conceptual navigation; technical build/research histories stay in `_docs/`.

Remaining full monograph migration (user requirement, 2026-11-06; bounded B04/B10/B15/B25/B32 assemblies and the numbered current order are implemented): the website may keep fine navigation while a separately curated book structure supplies parts, chapters, formal sections and print order. Both must reference shared canonical prose/claims/evidence/cases rather than fork their scientific content. The full old-to-new map must preserve all 37 chapters and five supplements and stable citation identities. Note plans must follow assembled book chapter boundaries, not merely concatenate per-MDX note sequences. Validate actual ordering, unique anchors, numbering, links, search behavior, old editions and print hierarchy when implementing. The goal and reader contract define editorial requirements; this paragraph does not claim a new runtime or schema already exists.

`reader-bibliography.mjs` exports schemaVersion2 / reader-bibliography: bibliographic sources, cited evidence and exact cited passage/carrier identity. Both `/downloads/bibliography.json` and the retained `/downloads/research.json` URL return identical curated bytes; the latter no longer exposes the schema1 research workbench. Queries, gaps, editorial revisions and workflow states remain in repository research/development records. Public catalog provenance remains separately available, with its actual review kind unchanged. The AI reading index links the book and bibliography, not execution records.

`reader-surface.mjs` checks authored reader fields and the generated HTML/aria text, while allowing internal anchors and structured data. It catches strong project-process wording, visible internal labels and duplicate DOM IDs; semantic review still decides whether a condition is scientifically necessary. The HTML parser is bundled with pinned Next.js 16.4.6, without a new dependency; its use is covered by compatibility fixtures.

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

`config/pm-selection-original.json` records the clean bb12 manuscript, its
scientific and reading closure, case-file identities and retained captured
citation scopes before Issue90 authoring. The separately pinned
`pm-selection-accepted.json` admits37chapter and17appendix records, exact MDX
block order, current scientific records and bounded research additions. The
original48records,18case input/publication pairs and earlier acceptance files
remain immutable. The Gronlund evidence successor is limited to the reviewed
county-health qualification and check date; the new DTU carrier has its own
identity and never replaces its earlier reading event.

`reader-pm-selection.mjs` protects the shared chapter and fourth real appendix
in runtime, source validation and actual output. The9captured bb12print headings
extend4149prior obligations to4158. Original48-note groups and each old section
retain ordered exact subsets, with native aliases or no-script destinations.
The saved particulate candidate registered 40 book units, 48 website units,
32 chapters and 155 formal chapter sections. With the separately reviewed
quality-score chapter, the combined edition has 152 formal chapter sections.
The 120-section goal and full-book publication remain incomplete.

The PM original inventory retains all 36 historical case file digests.
The source and export gates resolve the single pedigree publication successor
through its independently accepted record and compare the other 35 files to
PM's original digests. All 18 numerical inputs keep their original bytes.

The current catalog gate compares both exact frozen external consumers and the
published reverse premise/evidence/concept rosters. Unpublished drafts do not
gain publication qualification, and a new published use requires an explicit
reviewed disposition. Exact ordered-list and note attributes prevent `start`,
`reversed`, `value` or list-style changes from silently changing visible note
numbers while links still point to the correct records. Body, notes, native
heading/copy controls and ordinary appendix links have separate output checks.
These guards cannot establish source entailment, reader comprehension, actual
hosting or empirical validity; those rely on their separately bound evidence.

For the two PM units, `printReadingEntryAnchor` in the numbering module gives
the existing printed title a separate `print-reading-unit-` identity and
`tabIndex=-1`. Current TOC entries and whole-unit prose links use this title;
the article keeps its historical `print-unit-` identity and dated `:target`
scope. Section, note and explicit historical print links retain their meaning.
Numbering and PM output gates require the unique focusable title to be owned
by the correct article. The combined edition uses separate title entries for
the two PM units and the quality-score chapter. This keeps the old 48-note PM
scope available from its historical fragment and collapsed during current
reading.

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

Legacy context appears when an old fragment is targeted, with the preserved source date and immutable GitHub tree. It cannot infer another historical unversioned edition and does not claim hosted archives. The current 40 print articles comprise two front-matter units,32 chapters (including B04/B10/B15/B25/B32 assemblies and shared B06/B08), two method notes and four appendices. Each assembly has its own continuous book note plan. The complete revision has 120 actual formal chapter sections, separately qualified by source, reader and output evidence.


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

S01 remains a registered whole source. A separately pinned partial plan replaces eight print-only canonical occurrences with meaningful native cross-references to accepted B02/B03/B04/B08 notes; APOS and all six ordinary paragraphs remain. The same projection drives body rendering, note planning and the global reference index. The #95 `S01:current-print-pointer-titles` amendment can update the chapter titles displayed by six of the eight current print pointers. It checks the complete original and revised rows and compares the labels with the actual book numbering. The eight paragraph positions, canonical claim identities, native note destinations and earlier citation titles remain bound to the existing partial plan. The final receipt binds all eight full destination records and the unchanged complete S01 website bytes. M01/M02 responsibilities and the transitional APOS repetition remain explicit development obligations, not hidden whole-source completion.

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
editorial 32-chapter plan made executable by inference. The current 40-unit book
contains 32 chapters, two front units, two method notes and four appendices, with 120 actual formal chapter sections.
B25 combines C14/C15 under four sections with 14 continuous notes. The website
keeps 37 fine chapters in 48 reading units.

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
Same-document book contents use native anchors for parts, units, sections and
references. A router-managed hash update was observed to scroll correctly while
leaving CSS `:target` unset, so it could not activate target-bound historical
scope context. Native anchors preserve both the fragment state and that context;
cross-page application links retain their existing routing behavior.
The same arrival margin also applies to native numbered case titles on website
pages. A direct saved `joint-batch-case-heading` URL on a390px no-script page
otherwise placed the entire title under the96px combined navigation/TOC header;
checking only the enclosing MDX section did not cover that distinct address.

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


## Authored closing synthesis and dated native heading scopes

B32 is an independently authored manuscript over22shared canonical records in
four sections. Its book key/source consume C35/C36 once, while two fine website
sources retain their8/14membership. Its initial registration bound the40-unit/34-chapter roster; the later B15
assembly retains B32 unchanged in the40-unit/33-chapter roster. Earlier plans
and frozen histories remain unchanged.

`closing-synthesis-original.json` records the original22and scientific dependency
closure; its hash is independent of final prose acceptance. The separate final
receipt binds all22complete records, three MDX sources, exact section/order and
actual source metadata. The output guard compares full decoded body and scholarly
notes, rejects omitted/duplicate/hidden/unreviewed content, and verifies actual
native note and premise targets. Runtime and export use the same bounded remap;
B10's three external closing consumers now target B32 only in print.

The independently qualified heading-history artifact retains100earlier affected
entries plus six actual Main862 heading captures. Captured HTML and earlier
source-reconstructed scopes stay distinct. Original8/8, later8/14 and inherited
bag references are translated by exact claim identity, including entries whose
historical source route is still the bag page. Native retained heading scopes
render immediately after their actual heading, using the existing dated context
and exact destination list; displaced scopes use no-script notices. A chapter or
heading ID without its original subset does not satisfy publication continuity.

The original68-file snapshot is task conservation evidence, not a permanent
B32-owned lock over unrelated future accepted manuscripts. Ongoing admission
binds B32's actual scientific closure and immutable source/history identities;
a later affected-source change needs renewed dependent review. These checks do
not establish scientific truth, full-book completion, browser qualification or
formal PDF publication.

Runtime B32 validation explicitly uses the existing public-catalog projection;
raw CLI/export admission keeps complete record comparison. The projected expected
records are restored from frozen scientific inputs and accepted prose before
passing through the same allowlist. Article number/title visibility is checked
before normalization removes those wrappers; collapsed navigation is outside
that article check. Formal heading validation recognizes only the exact Fumadocs
copy-button accessibility label, without exempting hidden authored content.
Retained heading scope is displayed when that native heading is targeted, and
uses the existing print treatment.


## Climate chapter, real appendix and current dependency acceptance

`reader-climate-assembly.mjs` registers the independent B15 manuscript and actual
third appendix. The current acceptance binds49 complete records, four source
files, actual5/3 section plans,41/8 book note plans and34/7 fine-page memberships.
It also binds ordinary navigation and the original response/integral SVG identity
and explanatory placement. The immutable original records48 responsibilities,
23 external premises,70 evidence records and26 sources separately from current
prose. Input and SVG bytes remain exact; static rendering does not run a climate
model or establish physical validity.

The additive11-heading capture is based on saved actual clean Main838 HTML,
not a new visit or source-code reconstruction. Together with4,129 earlier
obligations it protects4,140 identities. Original41/7 groups and exact section
subsets retain their dated scope, including the response figure. Older climate
source hashes are matched to the frozen complete MDX before its figure-bearing
section is used for explicit historical scope; unrelated timing-source ordinary
text is not assumed identical. Real moved note targets can be in the appendix
while their original figure remains in the main chapter.

`closing-synthesis-current-accepted.json` adds an independently pinned current
acceptance for exactly seven reauthored timing records and six unchanged affected
consumers with renewed use judgments. Its old records must match the immutable
B32 closure; new records retain their exact identities and dependency edges.
All unlisted scientific records still compare against the original, including
raw metadata; runtime uses the established public projection. Neither an updated
review date nor a new hash automatically grants source approval.

Source admission, full paragraph/annotation output, exact ordinary links and
visual content checks run separately from original-source and continuous-reader
review. Number/title visibility must be qualified before normalization. Actual
export and browser qualification, sourceCI/merge, hosting and exact workspace
integration remain independent delivery evidence. The new33-chapter roster does
not satisfy the final32-chapter/120-section goal or formal PDF publication.

## Data applicability and explicit new evidence

B25 consumes the two original data/review units in one four-section14-note book
source; fine website routes retain7/7members. The immutable original binds12prior
propositions, their scientific closure and original6/6scopes. Six actual saved
Main46b printed headings extend4140historical obligations to4146. Old titles,
editions and exact note subsets remain at real native or no-script destinations.

The separately pinned current acceptance binds three source files,14complete
claims,14evidence and one source record. Its two newly introduced evidence records
are not covered by the older12-evidence snapshot: their full records must receive
explicit current acceptance. Original evidence/source records remain exact. Raw
repository and projected runtime checks retain that distinction; output inspection
first checks actual scientific records, then full body, annotations, historical
scope and the exact uncertainty continuation after the final proposition.

The actual body admits no scientific image or unreviewed extra text. Visibility,
heading order and native note identities remain separate from source receipts.
The B32 current dependency acceptance adds nine exact data-premise changes and
seven unchanged consumers while preserving earlier seven timing changes and six
climate consumers. Unlisted original records still compare exactly. These guards
do not grant original-source, reader, empirical or whole-book approval; actual
browser, hosted source identity and tracked delivery retain their own evidence.

The final continuation follows the real `ChapterProse` wrapper, not necessarily
the canonical paragraph's immediate sibling. Admission recognizes only the exact
direct `scholarly-prose` wrapper under the established article body, with direct
paragraph children and the final canonical paragraph last; its immediate next
body element must be the reviewed continuation. Extra nesting, attributes,
substantive intervening content or relocation fail. Actual-component fixtures
supplement generated-output checks, preventing an artificial direct-paragraph
fixture from defining the production renderer's structure.


## Readable-writing pilot

[Issue91](https://github.com/tiangong-lca/knowledge-base/issues/91) adopts the writing/teaching guide and revises chapter27 under a frozen source and numerical-input identity. The dated guide assessment is not current scientific approval. See [the standard](editorial/readable-writing-and-teaching.md) and [unit protocol](editorial/2026-11-11-readable-pedigree.md). The pre-edit inventory lives in `config/readable-pedigree-original.json`; it does not grant acceptance of a later manuscript.


The quality-score pilot uses `scripts/reader-readable-pedigree.mjs` to bind the
shared five-section manuscript,37canonical records and14publication templates.
The original source/scientific closure, actual Main heading capture and scoped
research receipts are separate immutable inputs. Selected6readings/28passages/
7artifacts are verified from the actual runtime/export reading register;
unrelated reading and revision growth remains possible. The transitive claim
graph must retain its one external consumer. A narrow reviewed correction
changes only one variance-display caveat, preserving its original in the snapshot.

Historical output admission checks each178source node's identity, location,
visibility and precise scope, not just the destinations. Closed wrappers cannot
hide body prose; legitimate annotation details remain usable. CurrentB27
print navigation targets its uniquely focusable title while the historical
article target still selects the dated 37-note scope. The combined edition also
uses separate title entries for the PM chapter and its calculation appendix.
The complete-edition qualification subsequently gives all40reading units their own current title entry; every old article target retains its edition-specific meaning.
