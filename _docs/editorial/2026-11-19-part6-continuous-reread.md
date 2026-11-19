---
title: Part VI Whole-Part Continuous Reread Protocol (Data & Evidence, B25–B28)
docType: reference
scope: repository
status: active
authoritative: false
owner: knowledge-base
language: en
whenToUse:
  - when executing, auditing, or reviewing Unit 20 (Part VI whole-part continuous reread across F02, parts[5], B25, B26, B27, B28)
  - when verifying Part VI premise DAG topology, cross-chapter terminology alignment, and non-case locator hygiene
whenToUpdate:
  - when Part VI reread scope, cross-chapter premise bridges, or review acceptance pins change
checkPaths:
  - content/docs/book/index.mdx
  - config/reader-numbering.json
  - content/docs/book/uncertainty-and-variability.mdx
  - content/docs/book/data-quality-and-probability.mdx
  - knowledge/catalog.json
  - _docs/editorial/2026-11-19-part6-continuous-reread.md
lastReviewedAt: 2026-11-19
lastReviewedCommit: b1c911ee7aa0c772559d363e83e13abf765bceb4
lastReviewedNote: "Prewriting protocol for Issue #155 (Part VI Whole-Part Continuous Reread) anchored to qualified Main b1c911ee7aa0c772559d363e83e13abf765bceb4."
related:
  - _docs/book-execution.md
  - _docs/publication-contract.md
  - _docs/reader-publication-contract.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
  - _docs/editorial/2026-11-15-comparative-continuation.md
---

# Part VI Whole-Part Continuous Reread Protocol (Data & Evidence, B25–B28)

- **Tracked Issue**: https://github.com/tiangong-lca/knowledge-base/issues/155
- **Parent Coordination**: https://github.com/tiangong-lca/knowledge-base/issues/9
- **Qualified Baseline (`main`)**: `b1c911ee7aa0c772559d363e83e13abf765bceb4`
- **Scope**: Whole-part continuous reread across Part VI (`第六部：数据与证据`): `F02` (`/docs/book`), `config/reader-numbering.json` (`parts[5]`), `B25`《数据适用性》(+ 2 web companions), `B26`《变异与不确定性》, `B27`《质量评分与概率》, and `B28`《产品足迹规则》.

## 1. Guiding Principle (“有据必纠、无病不折腾”)

All four Part VI chapters (`B25` `#147`, `B26` `#149`, `B27` `#153`, `B28` `#151`) have already completed primary-source comparative authoring, multi-round independent reviews, live hosting qualification, and root integration. This unit performs a surgical whole-part continuous reread modeled on Part IV (`#133`) and Part V (`#145`):

- **Zero new sources or claims**: Public claim count remains fixed at `1,074` (`124` unique claims in Part VI).
- **Zero mutations to case-bound invariants**: All `24` case-bound Part VI claims, all `19` case-bound Part VI evidence locators (`pedigree-calibration-v1.json`, `dairy-rules-v1.json`), all `40/40` public case download files, and all primary numerical assertions remain byte-for-byte untouched.

## 2. Targeted Part VI Corrections

1. **Navigation & Part VI Introduction (`content/docs/book/index.mdx`, `config/reader-numbering.json`)**:
   - Upgrade `F02` Part VI overview paragraph to reflect the four completed cross-system chapters and link all Part VI entry routes (`过程数据的用途`, `数据审查与版本`, `变异与不确定性`, `质量评分与概率`, `产品足迹规则`).
   - Upgrade `parts[5].introduction` in exact `B25 → B26 → B27 → B28 → Part VII` sequence (preserving the historical introduction via `<details class="legacy-citation-context">` in `/print`, matching `#145`).
2. **Cross-Chapter Terminology & First-Appearance Gloss Alignment (non-case claims & tables)**:
   - `B26` (`content/docs/book/uncertainty-and-variability.mdx` Table 2 + `B26[11]`, `B26[12]`, `B26[17]`): Standardize `cv` → `CV`, align chapter numeral style (`第 27 章` → `第二十七章`).
   - `B27` (`content/docs/book/data-quality-and-probability.mdx` Table 2 + `B27[31]`, `B27[34]`, `B27[37]`): Restore `国际参考生命周期数据系统入门级（ILCD-EL）` matching `B25[11]`, harmonize `精密度（P）`, gloss `美国环保署（US EPA）` at `B27[34]`, gloss `PubMed Central（PMC）` at `B27[37]`, and add full Chinese name `温室气体核算体系（GHG Protocol）` in `B27` Table 2.
   - `B28[27]` (`cl-rule-review-identity`): Gloss `欧盟加欧洲自由贸易联盟（EU+EFTA）` and `欧盟、欧洲自由贸易联盟与英国（EU+EFTA+UK）`.
3. **Premise DAG Repair & Strict Topological Ascending Gate (non-case claims only)**:
   - Remove the 1 forward-reference violation (`B26[17]` `cl-book-unc-bridge` referencing `B27[10]` `cl-ped-estimate-boundary`).
   - Wire direct cross-chapter premise bridges across `B25 → B26`, `B25 → B27`, `B25/B27 → B28`, and `B28[42]` (`cl-rule-conclusion`) incorporating `#151` comparative gates.
   - Sort `premiseIds` strictly ascending `(unitOrder, noteNumber)` across all `14` out-of-order non-case claims in `B26`, `B27`, and `B28`, enforced programmatically in `scripts/reader-part6-reread.mjs`.
4. **Non-Case Locator & `scope`/`caveats` Cleanup**:
   - Normalize `16` remaining non-case locators (`14` in `B27`, `2` in `B28`) to clean Chinese print citations, and clean `7` non-case `scope`/`caveats` strings (`B27[2, 12, 19, 20, 37]`, `B28[4, 6]`) removing bare `§`/`§§`/`p273`/`pp27–31`/`Annex II §A.2.3`.

## 3. Verification & Rollback

- Reversible `scripts/reader-part6-reread.mjs` guard pinned to `b1c911ee7aa0c772559d363e83e13abf765bceb4` with fail-closed envelope/pin validation, topological DAG + ascending `premiseIds` gate, and byte-exact rollback.
- Unconditional `0 BLOCKER / 0 MAJOR / 0 MINOR` independent `source`, zero-context whole-Part-VI `reader`, and `publication-engineering` reviews, Playwright responsive / no-JS / `@media print` QA (compiled CSS zero-drift `be180e5d...`), `validate`, `typecheck`, `test`, clean production build (`dirty: false`), strict/diff Docpact (`0` findings), live `https://prism.tiangong.earth` 468-file qualification, and root `tiangong-lca/workspace` integration.
