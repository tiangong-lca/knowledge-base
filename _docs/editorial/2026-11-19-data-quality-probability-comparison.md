---
title: Part VI B27 Data Quality Scores, Ordinal DQR Gating, and Probability Conversion — Comparative Protocol
docType: reference
scope: repository
status: active
authoritative: false
owner: knowledge-base
language: en
whenToUse:
  - when authoring, auditing, or reviewing Unit 19 (Part VI B27 data quality scores and probability)
  - when verifying primary-source provenance, numeric facts, and non-case locator hygiene for B27
whenToUpdate:
  - when B27 comparative claims, primary-source passages, or review acceptance pins change
checkPaths:
  - content/docs/book/data-quality-and-probability.mdx
  - knowledge/catalog.json
  - knowledge/research/readings.json
  - knowledge/research/literature-map.json
  - config/reader-numbering.json
  - _docs/editorial/2026-11-19-data-quality-probability-comparison.md
lastReviewedAt: 2026-11-19
lastReviewedCommit: def232fadb9e0dd30da4418241d0a78a48f5674d
lastReviewedNote: "Prewriting comparative protocol for Issue #153 (Part VI B27 Data Quality Scores and Probability) anchored to qualified Main def232fadb9e0dd30da4418241d0a78a48f5674d."
related:
  - _docs/book-execution.md
  - _docs/publication-contract.md
  - _docs/reader-publication-contract.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
  - _docs/editorial/2026-11-15-comparative-continuation.md
---

# Part VI B27 Data Quality Scores, Ordinal DQR Gating, and Probability Conversion — Comparative Protocol

- **Tracked Issue**: https://github.com/tiangong-lca/knowledge-base/issues/153
- **Parent Coordination**: https://github.com/tiangong-lca/knowledge-base/issues/9
- **Qualified Baseline (`main`)**: `def232fadb9e0dd30da4418241d0a78a48f5674d`
- **Target Chapter**: `B27`《质量评分与概率》 (`content/docs/book/data-quality-and-probability.mdx`, `/docs/book/data-quality-and-probability`)

## 1. Core Concept-Led Comparative Question

Why do major LCA systems evaluate nearly the same 4–5 qualitative data-quality dimensions (reliability, completeness, temporal, geographical, and technological representativeness), yet map them into **four non-interchangeable mathematical and governance objects**?

1. **Expert-judgment pedigree variance (`Weidema et al. 2013`, ecoinvent Report 1(v3), Ch. 10.1–10.4, pp. 74–78)**: Reformulates ecoinvent v2's squared geometric standard deviation ($\mathrm{SD}_{g95}^2$) into underlying lognormal normal-space variance $\sigma^2$ (`Table 10.4–10.5`, 5 indicators × scores `1–5`), summed linearly with basic uncertainty $\sigma_1^2$ under zero-mean and independence ($\operatorname{cov}=0$) assumptions — while noting that Table 10.5 in 2013 was still expert-judgment-based with an explicit `Outlook` pointing to ongoing empirical work, and `10.3–10.4` explicitly exclude model uncertainty/human error and flag the geometric-mean vs Monte Carlo arithmetic-mean gap.
2. **Empirically calibrated pedigree factors (`Ciroth et al. 2012/2016`, already anchored in `B27`)**: Replaces expert-judgment factors with empirical completeness/reliability ratio calibration, while retaining lognormal independence and zero-bias assumptions.
3. **Ordinal composite DQR & acceptance gating (`Commission Recommendation (EU) 2021/2279`, Annex I `4.6.5`, Tables 20–22 & 25, Eqs. 19–20, `OJ L 471/274–281`)**: Treats `Completeness` and methodological consistency as non-scored prerequisites, averages 4 scored criteria `(TeR + GeR + TiR + P) / 4` (scale `1 = Excellent` to `5 = Poor`) into a 5-tier ordinal `DQR` (`≤ 1.5` Excellent to `> 4.0` Poor), and enforces hard Data Needs Matrix acceptance thresholds (`DQR ≤ 1.5` company-specific with `P ≤ 3` and `TeR/GeR/TiR ≤ 2`; `DQR ≤ 3.0` secondary; `≤ 10%` proxy cap) with **zero** conversion into lognormal variance or Monte Carlo distributions (`0` occurrences across all 396 pages).
4. **Qualitative DQI disclosure & flow–process separation (`GHG Protocol Product Standard 2011`, Ch. 8.3.7–8.3.9 & Ch. 10.2–10.3, pp. 48, 55–57, 79–83; `Edelen & Ingwersen 2018`)**: Adapts the 5 Weidema & Wesnæs indicators into a 4-tier qualitative scale (`Very good / Good / Fair / Poor`) with no numeric composite DQR, mandating descriptive data-quality and qualitative uncertainty statements while keeping quantitative propagation optional.

## 2. Primary-Source Artifacts & Boundaries

| Source ID | Document | Verified Local SHA-256 | Verified Pages / `pdfIndex` |
| --- | --- | --- | --- |
| `src-kb44-ec2021` | Commission Recommendation (EU) 2021/2279 (`OJ L 471, 30.12.2021`, 396 pp.) | `af28de0896bfcfd8d627e758c97c83fd7d4bab94f2005ce5ea2079df42da39e3` | `OJ L 471/274–281`, `361` (`pdfIndex 76–83`, `163`) |
| `src-dapp147-ecoinvent-v3-2013` | Weidema et al. (2013), *ecoinvent Report 1(v3)* (169 pp.) | `88fcc1512a8efe25c26af6254e0fff42b17d15e904bab36136b56e92eaf7fd9c` | `pp. 74–78` (`pdfIndex 81–85`) |
| `src-pfr151-ghgp-2011` | WRI/WBCSD (2011), *GHG Protocol Product Standard* (148 pp.) | `fdc21b798b9c8908f6e55e8caca22e5d8b281ede3601f6950649244d418d3c0c` | `pp. 48, 55–57, 79–83` (`pdfIndex 49, 56–58, 80–84`) |

- **Paywalled boundary (`lit-gap-dqp153-paywalled-iso14044-dqr`)**: `ISO 14044:2006` data-quality requirement clauses are behind a paywall and not quoted clause-by-clause; all comparative statements rest strictly on the verified open-access primary PDFs above plus the existing verified `B27` literature (`Ciroth & Srocka 2008`, `Ciroth et al. 2012/2016`, `Edelen & Ingwersen 2018`).

## 3. Scope, Invariants & Non-Case Locator Hygiene

- **Preserved invariants**: All `5` pinned headings (`#杯重调查与估计`, `#散布与估计精度`, `#完整性评分的校准`, `#概率模型与参数`, `#评分的检验与适用`), all `37` existing `B27` claims, the existing Berlin cup-weight table, all `11` case-bound `pedigree-calibration-v1.json` evidence locators, and all `40/40` case download files remain byte-identical.
- **Planned additions**: `+6` comparative claims (`37 -> 43` in `B27`, `1,068 -> 1,074` public claims overall) + `1` responsive 5-column cross-system comparison table under `#评分的检验与适用`, backed by `1-to-1` single-artifact `ev-dqp153-*` ↔ `psg-dqp153-*` pairs and `100%`-consumed `BigInt`-verified `numericFacts`.
- **Non-case locator cleanup**: Normalize all `15` non-case `B27` locators (`ev-ped-sampling-population`, `ev-ped-sampling-design`, `ev-unc-ciroth-scores`, `ev-unc-ciroth-calibration`, `ev-unc-ciroth-empirical`, `ev-ped-completeness-data`, `ev-ped-gsd-definition`, `ev-ped-journal-gsd`, `ev-unc-ciroth-baseline`, `ev-unc-ciroth-summary`, `ev-ped-score-test-design`, `ev-ped-score-test-results`, `ev-unc-ei-alongside`, `ev-unc-ei-metadata`, `ev-unc-ei-reuse`) to clean Chinese print citations (`0` raw `PDF零基索引`, `0` bare `§`/`§§`).
- **Verification & rollback**: Reversible `reader-data-quality-comparison` guard pinned to `def232fadb9e0dd30da4418241d0a78a48f5674d` (`dataQualityComparisonPredecessorPin = cfd0c1c0cc5f0a7bd73f8489c65d534713364c270ad5ce4768da349bd6a36490`, `dataQualityComparisonCapturePin = f2996fd3c5d5fcb0dc9db40aca4b354807558e795b30fa9dbc51fec40578aaac`, `dataQualityComparisonUnitPin = 969421bb00ee2b24740ab381d299b11b839dcc7f0eb756e6a3b7e4e829fcc0a4`); two-round unconditional `0 BLOCKER / 0 MAJOR / 0 MINOR` independent `source` (`8a23915a`), zero-context `B27` `reader` (`3152c3f3`), and `publication-engineering` (`898c00a8`) reviews; 50-combo Playwright responsive / no-JS / `@media print` QA (`0` errors, `b27Tables: 2`, `b27Notes: 43`, compiled CSS zero-drift `be180e5d...`); `717/717` tests; strict/diff Docpact (`0` findings); live `https://prism.tiangong.earth` 468-file qualification; and root `tiangong-lca/workspace` integration.
