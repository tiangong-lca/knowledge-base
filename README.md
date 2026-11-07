---
docType: reference
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when development commands or public entry points change
whenToUpdate:
  - when development commands or public entry points change
checkPaths:
  - "README.md"
  - "package.json"
  - "app/**"
  - "scripts/**"
lastReviewedAt: 2026-11-08
lastReviewedCommit: 3f0fe0cda7b4687d3e0b6dfd6127efbe7a14a605
---

# LCA Living Knowledge Base and Review

中文 LCA 动态知识库与研究评论：从问题起源、概念含义、方法选择到数据与软件表达，沿可核查的证据链阅读。已从四个语义样板专题进入全书研究和正文扩充；文献地图与选段阅读台账明确保留全球历史、标准与文献覆盖缺口。

## Read and contribute

`content/docs/` contains the fine website narrative; `content/monograph/` contains independently authored book assemblies over the same canonical claims. `knowledge/catalog.json` is the canonical source, evidence, claim, concept and conditional-mapping registry. Public pages and machine exports share one reviewed-record projection. Source checks performed by agents are labeled explicitly and do not claim human expert or scientific approval.

Read [publication contract](_docs/publication-contract.md), [editorial protocol](_docs/editorial-protocol.md), [architecture](_docs/architecture.md) and [edition workflow](releases/README.md). Private research, restricted originals and meeting transcripts are not part of this repository.

## Develop

Use Node 24.18.0 from `.nvmrc` and pnpm 12.16.1, matching the compatible Node range and exact package-manager pin in package.json. macOS Apple Silicon, Linux x64 and Windows x64 are supported; macOS Intel is retired.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

The static site is exported to `out/`. Search works without an external service or credentials. EdgeOne Makers project `makers-w8wl4xjmt2mj` imports this repository's `main` branch; the production hostname is `prism.tiangong.earth`. Hosting qualification is tracked in [knowledge-base #3](https://github.com/tiangong-lca/knowledge-base/issues/3). A successful local build does not establish live deployment, domain activation or HTTPS availability. Do not copy another site's identity, search index or credentials.

`edgeone.json` and `.nvmrc` both select the platform-preinstalled Node 24.18.0. The pnpm `packageManager` pin remains 12.16.1; a supported preinstalled pnpm switches to that declared version automatically. Check the actual hosted install log and keep the frozen lockfile. Do not run `corepack enable` against platform-owned Node shims. The lockfile includes the verified pnpm 12.16.1 executable wrapper used by hosted version selection. `tsconfig.json` deliberately matches the hosted builder's compact serialization and function-directory exclusions so a build preserves source identity; `/.edgeone/` is generated deployment output.

```sh
node scripts/impact.mjs <changed-id>
node scripts/snapshot.mjs <edition-id> <new-absolute-directory>
```

Impact analysis reports claims needing review without granting approval or automatically changing editorial decisions. Freeze editions only after a clean committed build. Use `/print/` for the complete narrative with evidence and references.

## Delivery

This is an M1 main repository. The approved book programme is coordinated in [knowledge-base #9](https://github.com/tiangong-lca/knowledge-base/issues/9); the first research/manuscript wave [#10](https://github.com/tiangong-lca/knowledge-base/issues/10) is integrated, the methods/models expansion is [#12](https://github.com/tiangong-lca/knowledge-base/issues/12), and subsequent wave identities and progress are maintained in [the execution ledger](_docs/book-execution.md). Initial onboarding #1/workspace #2172 remains historical evidence. Use the workspace lifecycle controller for delivery records. A merged child PR requires separate exact workspace integration.

## License

Code is licensed under [MIT](LICENSE). Original narrative and knowledge records in `content/` and `knowledge/`, and original figures in `public/book-figures/`, are licensed under [CC BY-NC-SA 4.0](LICENSE-content), attributed to TianGong LCA Knowledge Base contributors. Commercial use of original knowledge content requires separate authorization from the relevant rights holders. Third-party sources retain their own licenses and applicable authorization conditions; a citation does not relicense the source or authorize full-text redistribution. See source-specific rights and preservation notes.

## Approved book programme

The [LCA treatise design and AI goal](_docs/lca-book-goal.md) was approved on 2026-11-04 at baseline a9ae501. [Execution record](_docs/book-execution.md) preserves the authority to research, revise arguments from evidence and expand prose without repeated outline approval. The prologue, eight research domains and twelve appendix responsibilities remain the scope; a wave is not the completed book. The 2026-11-06 amendment prioritizes an authored monograph with one argument across the book, single-volume parts, complete content-preserving reorganization and independent website/book structures. After the earlier pause and bounded amendment, the user explicitly resumed execution on 2026-11-06. The first editorial deliverable is the whole-book argument, proposed TOC, alternatives, migration map, risks and self-checks, followed by actual prose and publication restructuring.

Read `/docs/book/` for published chapters and `/research/` for the reader bibliography and citation locations. Discovery queries, selected-passage readings, artifact hashes, gaps and evidence-driven revisions remain in `knowledge/research/` and development Markdown; downloaded originals remain outside Git. Discovery records do not claim whole-work reading. `/downloads/bibliography.json` exports the reader bibliography. The retained `/downloads/research.json` URL now returns the same schema2 bibliography, not the former research-workbench schema; execution records are retained in development Markdown.

The chapter `/docs/book/wall-service-to-comparison/` contains a reproducible hypothetical wall-coating case. Versioned input and evaluated receipt are under `/downloads/cases/`; claim details expose their binding. `node scripts/impact.mjs CASE-WALL-CONNECT` finds dependent prose. The interactive controls and fixed print tables use the same evaluator. Source-derived factors and author-invented model values are explicitly distinguished; no actual paint ranking is claimed.

The expanded `/docs/book/allocation-and-substitution/` also contains CASE-JOINT-BATCH: fixed tables reconstruct product shares, a matched-service comparison and a partial-use continuation. Its two inventory flows retain separate units; negative comparison residuals are not physical removal. Versioned inputs/results are under `/downloads/cases/joint-batch-v1.*`; use `node scripts/impact.mjs CASE-JOINT-BATCH` for dependent review. The original wall case and its public input bytes remain unchanged.

## Reader delivery policy

Read [_docs/reader-publication-contract.md](_docs/reader-publication-contract.md). Published pages are finished book prose with scholarly notes; research/development logs and TODOs stay in development Markdown. Layout matches the owning docs site. Current rendering shares canonical prose between website and book while generating notes for each actual surface unit. The explicit mixed42-unit roster contains shared front matter, retained sources, the independently authored B04 assembly and two calculation appendices. B05 uses one genuine shared MDX chapter with three adopted sections and six notes; B06 consumes two original sources in one shared seventeen-note chapter. B08 integrates the exchange/flow/characterization sources in one four-section chapter; the fine website entrances remain. S01 keeps its historical-method prose and APOS paragraph, with eight explicit print cross-references to their actual chapter notes. The complete32-chapter monograph organization remains separate work, with conservation and generation-specific historical references required at each migration. The public `/research/` route is a bibliography. Preserve actual source/assumption limitations, and assess reader/layout quality independently from source and code validation.

The water-locality and phosphorus-boundary examples publish versioned inputs and exact evaluated receipts under `/downloads/cases/`, linked from their chapter notes. They are static explanatory examples: water values are synthetic; the phosphorus default is source-bound and conditional, with characterization left symbolic. Use their registered case identities with `scripts/impact.mjs` for affected-claim review.

The expanded historical-container chapter reconstructs selected 1974 service, glass-energy and summary-normalization steps. `historical-glass-v1` inputs and evaluated receipts retain every required source-fact identity and the original PDF hash. Whole-system assembly is explicitly not fully reproduced; the displayed coefficient-rounding check is conditional, not empirical uncertainty. Use `node scripts/impact.mjs CASE-HISTORICAL-GLASS` for affected numerical prose.

The data-quality/probability chapter traces a published cup-weight sampling study,
its later completeness-factor proposal and an explicitly hypothetical lognormal
inventory parameter. `pedigree-calibration-v1` inputs/results preserve source
summary arithmetic, GSD conventions and the separate author conditions. They do
not reproduce missing raw observations or the complete empirical calibration.
Use `node scripts/impact.mjs CASE-PEDIGREE-CALIBRATION` for dependent prose.

The product-footprint rules chapter traces a dated dairy category rule into
published activity and result artifacts. Its static `dairy-rules-v1` case keeps
conditional arithmetic, stored LCIA outputs and model-response scenarios separate,
with exact PDF/XLSX source bindings and unresolved reconstruction limits. Use
`node scripts/impact.mjs CASE-DAIRY-RULES` for dependent prose. Mixed-carrier
citations link the actual cited version alongside the work-level source entry.

The chapter `/docs/book/particulate-emissions-and-health/` traces primary and
precursor emissions through population intake and modeled health damage. Its
static `particulate-health-v1` case reconstructs a named historical factor join,
checks printed height weights and compares four factors from one dated GLAM
release. Exact source/reading identities include separate archive and workbook
hashes. These checks do not establish native atmospheric reproduction, causal
health effects or model validity. Use `node scripts/impact.mjs CASE-PARTICULATE-HEALTH` to locate the dependent numerical prose.

The electricity chapter traces grid delivery, annual and hourly accounts, and
historical versus prospective response models. `electricity-service-v1` fixes
source facts and a separate author-derived AVERT execution summary. Static builds
evaluate its arithmetic without executing AVERT. The optional [offline replay
instructions](_docs/reproduction/electricity/README-electricity-native.md) use
pinned historical code and dependencies in private directories, with no change
to the site's runtime. Use `node scripts/impact.mjs CASE-POWER` for dependent prose.


The climate chapter `/docs/book/climate-response-and-metrics/` distinguishes
pulse response, reference metrics, corrected factor versions, dated inventories
and historical emission-rate inputs. `climate-metrics-v1` binds thirty original
PDF facts, an unchanged wall-case parent and selected native observations to its
public input. Static builds perform only the disclosed reconstruction and
arithmetic. The optional [historical native replay](
_docs/runbooks/reproduce-climate-native.md) is a separate Python entrypoint and
does not reproduce the 2025 correction or establish empirical climate validity.


The [2026-11-06 monograph organization](_docs/editorial/2026-11-06-monograph-structure.md) records the adopted working argument, complete proposed TOC and content-preserving migration map. It is an editorial baseline under Issue58; actual prose rewriting, independent website/book organization and full-book research/qualification remain separate work. Its source branch now includes the accepted goal amendment from Issue56/PR57 at Main2bc7f4f. The revised full-book Goal is active as of2026-11-07; source and exact integration qualification remain separate gates.

The opening and final synthesis use stable claim-occurrence note anchors with consecutive visible numbers. Old2026-11-07baseline addresses remain native aliases or explicit relocation links, including the two moved carrier-bag conclusions. `config/citation-baseline.json` is frozen and independently checked; do not regenerate it from current MDX. Six container calculation notes now relocate to `/docs/appendices/container-energy-check/`, with an explicit current print position and independent source-coverage checks. The current mixed42article print view includes the independently authored B04 assembly, shared B06/B08 chapters and two appendices; the full32chapter book assembly remains separate.


[Container monograph Issue62](https://github.com/tiangong-lca/knowledge-base/issues/62) implements the two historical chapters and their energy appendix under the [source and publication protocol](_docs/research-waves/2026-11-07-container-monograph.md). All36original claims and historical numerical input identities remain; a separate local-path synthesis supports continuous main-text reading. Current implementation and local validation do not substitute for independent reader assessment, exact source/Main/hosted qualification or workspace integration.


[Canonical citation repair #64](https://github.com/tiangong-lca/knowledge-base/issues/64) preserves the later published note family that the original positional inventory predates. `config/citation-history.json` is a separately pinned reconstruction from immutable Main a36597d, with explicit source/code/catalog/page hashes and no historical-HTML-capture claim. Runtime/export now check 4,042 historical addresses across the two generations and render each migration's own source context. The [repair protocol](_docs/research-waves/2026-11-07-canonical-citation-continuity.md) records the defect, unchanged scientific content and the separate future printed-heading scope gate. Container62 and corrective64 subsequently completed their reviewed Main and exact root handoffs; current programme state is recorded in the execution ledger.


[Framework monograph #66](https://github.com/tiangong-lca/knowledge-base/issues/66) implements the first separate book chapter with its own actual note plan. The explicit mixed roster, accepted65-proposition map and19captured printed-heading identities guard B04/X02 alongside the unchanged4,042historical addresses. The [unit protocol](_docs/editorial/2026-11-07-framework-monograph.md) records source reinspection, numerical conservation, reader/engineering checks and delivery boundaries. This bounded chapter does not certify the full32chapter edition or complete historical research.


[Cleaner-production monograph #68](https://github.com/tiangong-lca/knowledge-base/issues/68) keeps the C06 route and book identity while authoring three sections in one shared source. The original five propositions and historical notes remain; one explicitly reviewed interpretation records the source’s proposed development agenda. Separate accepted-content and actual-hosted heading inventories preserve three additional printed heading names alongside all4,061earlier expectations. The [protocol](_docs/editorial/2026-11-07-cleaner-production-monograph.md) distinguishes original-source review, continuous reading, actual body-text/section validation and publication qualification.

[Functional-reference monograph #70](https://github.com/tiangong-lca/knowledge-base/issues/70) consumes C08 and S03 in one three-section chapter with 17 canonical paragraphs and one continuous note sequence. The website keeps the field-oriented S03 projection. Separate source/map, reviewed-prose and actual-heading inventories protect original content, substantive navigation and 4,072 historical addresses, including each old source group's narrower scope. The [protocol](_docs/editorial/2026-11-07-functional-reference-monograph.md) records selected-source checks and the separate reader, render, hosting and integration gates. The current 44-unit mixed roster is not the completed 32-chapter edition.

[Process-network monograph #72](https://github.com/tiangong-lca/knowledge-base/issues/72) authors the retained C17 route under three sections with ten shared canonical paragraphs. Its [protocol](_docs/editorial/2026-11-08-process-network-monograph.md) separates selected original reading, conditional arithmetic, continuous-reader review and publication qualification. The original eight propositions and note scope remain; two explicit additions clarify the service-to-demand connection and the reference basis of multipliers. Four actual captured printed headings extend the protected history to4,076, while the44-unit mixed roster and all earlier case inputs remain unchanged. Source/Main, hosted and exact-workspace completion remain separate gates in its tracked delivery records.


[Exchange-semantics monograph #74](https://github.com/tiangong-lca/knowledge-base/issues/74) preserves all56original propositions and14ordinary-content responsibilities in four sections. The [protocol](_docs/editorial/2026-11-08-exchange-semantics-monograph.md) separates selected originals, retained native observations, actual manuscript and reader review from publication qualification. Separate original-map, final-prose, partial-S01 and captured-heading receipts protect4,095historical addresses, including old43/9/7/9-note subsets. Render checks compare actual annotation conditions, provenance, premises and retained navigation, rather than accepting empty stable anchors. Source/Main, hosted and exact-root completion remain separate delivery gates.
