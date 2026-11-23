---
docType: contract
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when publication authority, licensing or eligibility changes
whenToUpdate:
  - when publication authority, licensing or eligibility changes
checkPaths:
  - "AGENTS.md"
  - "LICENSE*"
  - "knowledge/**"
  - "content/**"
  - "scripts/**"
  - "releases/**"
lastReviewedAt: 2026-11-23
lastReviewedCommit: 8de0f4722dbcbf8415e97a86136230e57ff05677
---

# Publication contract

## Source checks at build and export boundaries

Cold production Next configuration validates the actual current source. Public
export independently rechecks source joins and publication eligibility, then
validates the rendered output. Those checks remain separate; an earlier success
does not authorize changed inputs or a later export.

Since 2026-11-21 (`#192`), HEAD source qualification (`scripts/reader-checkpoint.mjs`)
verifies the pinned checkpoint (`config/readable-book-checkpoint.json`) and
reverses all declared post-checkpoint revisions (`config/revisions/index.json`)
to reproduce the exact checkpoint state digest (`4ca4fcd1...`); any undeclared
change fails closed. The full 41-unit pre-checkpoint rollback chain remains
intact in `qualifyHistoricalReaderSources` and is verified independently against
the byte-pinned checkpoint snapshot (`scripts/fixtures/checkpoint-2026-11-21/`)
by `node scripts/verify-checkpoint-history.mjs` in CI. Post-checkpoint claim
retirements are enforced symmetrically in runtime rendering (`lib/reader-book.ts`)
and export output checks (`scripts/reader-surface.mjs`), and rendered on `/changes/`.

For the exact audited package scripts without build/validation lifecycle hooks,
ordinary CI calls that guarded Next build followed by the original exporter,
without adding the normal package build command's identical upfront source
check. Any changed script or added lifecycle hook restores the full package
build automatically. The normal `pnpm build` and standalone `pnpm validate`
commands remain unchanged. CI tests, typechecking, governed-change checks, artifacts, fixed
dependencies and hosting Git publisher keep their existing owners. No reusable
validation token, skip variable or new source-admission cache is introduced.


## Scoped scientific successors

The Part VI `B28` product-footprint-rules comparison unit #151 compares
non-binding EU PEF Recommendation `(EU) 2021/2279` & Dairy PEFCR, single-issue
`GHG Protocol Product Life Cycle Accounting and Reporting Standard (2011)`,
binding directly-applicable EU Batteries Regulation `(EU) 2023/1542` (Arts. 7,
17, 96 & Annexes II, VIII), and binding cross-product EU ESPR `(EU) 2024/1781`
(Arts. 1–13, 79–80 & Annex I) across `B28`
(`content/docs/book/product-footprint-rules-and-practice.mdx`, `34` -> `42`
claims + `2` comparison tables, bringing the public catalog to `1,068` claims)
while conserving `100%` of all `34` original `cl-rule-*` identities, all `4`
pinned headings, all `5` case-bound `dairy-rules-v1.json` locators, `1,026`
untouched prior claims, and all `40` case downloads against
`3c6844be00ad3d39be3199ffbb257324a5daab79`. It binds `9` `1-to-1`
single-artifact `ev-pfr151-*` / `psg-pfr151-*` pairs, `22` `BigInt` rational
`numericFacts`, normalizes `22` non-case `ev-kb44-*` locators, and explicitly
records paywalled full-text boundaries (`ISO 14067:2018`, `ISO 14025:2006`,
`EN 15804+A2`, `GB/T 24067-2024`) without fabricating uninspected clause numbers
or claiming whole-book completion.

The Part VI `B26` uncertainty-and-variability comparison unit #149 compares
`Huijbregts (1998/2001)`, `Heijungs & Suh (2002)`, `EC-JRC ILCD General Guide
(2010, EUR 24708 EN §9.3.3 & §9.4)`, `EU Recommendation (EU) 2021/2279 (Annex I
§6.2–6.4)`, `Groen et al. (2017)` (*IJLCA* 22:1125–1137, CC BY 4.0), and
`Heijungs (2020)` (*IJLCA* 25:394–402, CC BY 4.0) across `B26`
(`content/docs/book/uncertainty-and-variability.mdx`, `9` -> `17` claims + `2`
6-column comparison tables, bringing the public catalog to `1,060` claims) while
conserving `100%` of all `9` original `B26` claim identities, all `3` pinned
headings, `1,043` untouched prior claims, and all `40` case downloads against
`4bb508394ef2f6c671b1468d41a2b67c51296be6`. It binds `10` `1-to-1`
single-artifact `ev-unc149-*` / `psg-unc149-*` pairs, `42` `BigInt` rational
`numericFacts` (covering intrinsic variability vs epistemic uncertainty vs
methodological choices, `ILCD §9.3.3/§9.4` advisory vs mandatory boundaries,
`EU 2021/2279` zero `Monte Carlo` occurrences across 384 pages, `Groen et al.
2017` Table 4 p. 1133 `KIA` Taylor vs sampling at `cv = 5%` vs `cv = 30%`, `SRC`,
`SCC`, `Sobol'`, and `RBD`, and `Heijungs 2020` `1/sqrt(n)` convergence vs
`n = 16` sample bias, `p = 0.67 -> 10^-16` synthetic-run significance distortion,
and pedigree-matrix sample-size limits), normalizes `7` prior `ev-unc-*`
locators, and publishes `2` `style="display:block"` dated correction notices
(`cl-unc-sd-sem`, `cl-book-unc-bridge`) without claiming whole-book completion.

The Part VI opening data-applicability comparison unit #147 compares
`UNEP/SETAC (2011)`, `EC-JRC ILCD General Guide (2010, EUR 24708 EN)` &
`ILCD Data Network Compliance & Entry-Level Rules v1.1 (2012, EUR 24380 EN)`,
`EU Recommendation (EU) 2021/2279` & `EF Data Guide v2.0` / `EF 3.1 Addendum` /
`JRC130796` / `EC May 2026 Transition Guidance`, `Weidema et al. (2013)`
`ecoinvent Report 1(v3)`, and `@tiangong-lca/tidas-spec v0.3.0` across `B25`
(`content/monograph/data-applicability.mdx`, `14` -> `22` claims + `2` 6-column
tables) and its two synchronized website companions (`《过程数据的用途》` `7` -> `11`
+ Table 1; `《数据审查与版本》` `7` -> `11` + Table 2, bringing the public catalog
to `1,052` claims) while conserving `100%` of all `14` original `cl-db2011-*`
identities, `1,030` untouched prior claims, and all `40` case downloads against
`c5b90b0352abaeaf0eec6706685076c8825d8925`. It binds `18` `1-to-1` single-artifact
`ev-dapp147-*` / `psg-dapp147-*` pairs, `63` `BigInt` rational `numericFacts`
(proving `ILCD` Formula 3 `26/10 = 2.60` vs `33/10 = 3.30` flipping against `EU`
Eq. 19 `2.50` vs `2.25`, provider `3.0` single-criterion cap rejection on
`1.75`-mean Dataset C, provider `1.0` -> context `3.75` disqualification &
Situation 2 / Option 2 `-30%` `GeR` `3.125 -> 2.90`, `80%` rescaling
`37.5%`/`62.5%` + `10%` `ILCD-EL` masking, `ecoinvent` score-5 pedigree variance
sum `0.21`, and `JRC130796` `2,752`-dataset `6%`/`10%`/`13%` top-3 shifts plus
`3`-year `>10.0%`/`>5.0%` surveillance triggers), normalizes `16` prior locators,
and publishes `12` `style="display:block"` dated correction notices without
claiming whole-book completion.

The Part V continuous-reread unit #145 synchronizes cross-chapter framing,
dual-view entry links, institution/method/currency terminology, cross-chapter
numeric anchors, premise-DAG ordering, and note locators across `F02`
(`content/docs/book/index.mdx:18,22`), the Part V introduction
(`config/reader-numbering.json`), and `B20`–`B24` (`4` managed files, `57`
modified non-case claims, and `48` normalized Part V `ev-*.locator` records =
`37` Part-V-exclusive + `11` shared with `B05`, `B14`, and `B32`) while
conserving `100%` of all `1,044` claim IDs, sequence, `numericFacts`, `16` Part V
case-bound claims, and `40` case downloads against
`915af29592cee16d42772ba76080ed913d630e6b`. It harmonizes `AWARE`, `UNEP GLAM`,
`CML`, `RIVM`, `UBP`, `PROMETHEE`, and `CTUe`, removes the unverified `2020` year
label on `src-acid113-glam-scoping`, supplies `LIME2`, `PSILCA v3`, `PEF/OEF`,
`PEFCR`, `TCO`, `USD`/`USD2012`/`€` expansions plus `~211×` styrene CF and `ReCiPe
2016` Chapter `13` Table `13.2` (`0.457`) vs Summary Table `1.5` (`0.46`)
anchors, restores `B21 [17]` cross-jurisdiction `E/G` comparability and `B21 [27]`
`UNEP GLAM 2024/2026` three-derivation vs unweighted regional-mean caveats,
attaches direct `B20 -> B21`, `B20 -> B23`, and `B22 -> B24` premise links with
strict topological ascending order across all `127` non-case Part V claims,
replaces generic `官方文档` / `原始 PDF 字节` excerpt wording with neutral
`原载文献` wording when active, and publishes `8` `style="display:block"` dated
correction notices without altering underlying quantitative evidence or claiming
whole-book completion.

The Part V closing cost-and-sustainability unit #143 compares Conventional `LCC`
(`1933` US `GAO` / corporate `TCO`), `SETAC` Environmental `LCC` (`Swarr et al.
2011`; `Hunkeler et al. 2008` via `Heijungs, Settanni and Guinée 2013`), Societal
`LCC` (`UNEP/SETAC 2011 Fig. 5`), `LCIA` monetary damage valuation (`LIME2` /
`ISO 14008:2019`), `ReCiPe 2016 USD2013` resource surplus cost, `LCST` & `LCSD`
(`Finkbeiner et al. 2010`), compensatory vs non-compensatory `MCDA` (`UNEP GLAM
Phase 3`: `ELECTRE`/`PROMETHEE`/`MAUT`/`TOPSIS`/`SMAA`), adjacent site and
territorial tools (`CML 2001 Part 3 Appendix B Table B1`, `ILCD 2010`, `EU
2021/2279`, `Suh 2004`), single-issue vs multi-indicator `PCA` (`Steinmann et
al. 2016`), financial rebound (`Hellweg and Milà i Canals 2014`), and
Planetary-Boundary `AESA` / strong sustainability (`GLAM Phase 3 Table 3`;
`O’Neill and Creutzig 2026`) across `B24` (`9` -> `17` claims plus two 6-column
comparison tables, bringing the public catalog to `1,044` claims) while
conserving `100%` of `1,029` untouched prior claims, all `6` shared
`ev-sustainability-*` records, and all `40` case downloads against
`8d5f1037a2ab30b29c197fe89a422a5c69f81a93`. It binds `21` topic-focused
single-artifact `ev-lcc143-*` records (`1-to-1` with `21` `psg-lcc143-*`
passages across `12` binary PDF carriers) and `82` `BigInt`-verified
`numericFacts` to establish value-added price cancellation (`50,000 €` vs
`56,000 €`, `13.5 + 10 = 23.5 €`, negative cradle-to-gate `LCC`); prove 4-year
workwear split incentives, `116 €` transfer cancellation, and `3%` vs `10%` `NPV`
rank reversal (`r* ≈ 6.49%`, `129.71 €`) alongside German `CNG`/diesel bus
(`+11.26%` investment vs `-4.03%` `NPV`); separate five non-commensurable
monetary quantities and prove `40 kg CO₂` (`2.00 + 6.00 = 8.00 €` vs `4.00 €`)
fiscal and cross-pillar double counting; contrast lubricant-vs-R&D cut-off
asymmetry and `8 €` rebound; demarcate `LCA` from site `RA`/`EIA` and
territorial `MFA`/`SFA`/`IOA`; quantify `15.7%` unseen toxicity ranking variance
behind 4 resource footprints (`84.3%` vs `92.3%`); prove `LCSD` `0–1,000` `IIA`
rank reversal (`722.22 > 583.33` -> `800.00 < 816.67` under strictly dominated
bid `丁`) vs `ELECTRE` `50 h` veto blocking forced-labor bid `戊`; and show how
expenditure-share (`0.833 vs 1.333`) vs equal-service (`1.111 vs 0.889`)
downscaling flips `AESA` compliance. Uninspected full `Hunkeler 2008` / `Swarr
2011` 98-page booklet and paid `ISO 14008/14007/15686-5/14067/14046` texts
remain explicitly bounded in
`gap-lcc143-hunkeler2008-swarr-booklet-and-iso-valuation-texts`, and `Steinmann
2016`, `Hellweg 2014`, and `O’Neill 2026` use neutral `passages-inspected` /
`access-context-unresolved` metadata without raw-text redistribution or
whole-book completion claims.

The Part V social-comparison unit #139 compares `UNEP 2020 S-LCA / SO-LCA` (with
`2021 Methodological Sheets`), EU `(EU) 2021/2279 Annex III OEF` (with `OEFSR
Guidance v6.3`), `Heijungs, Settanni and Guinée 2013`, `PSILCA v3`, `SHDB 2012`,
`UNEP GLAM V1.0.2024.10 Work Environment Impacts` & `Fantke et al. 2026` (with
`CML 2001 Part 3`, `ILCD 2010`, and `GLAM 2019/2021`), and `Meemken et al. 2021`
across `B23` (`9` -> `17` claims plus two 6-column comparison tables, bringing
the public catalog to `1,036` claims) while conserving `100%` of `1,021`
untouched prior claims, all `6` shared `ev-sustainability-slca-*` records, and
all `40` case downloads against `79c8ea9cf1c79eb0b773a2109188095037f9873a`. It
binds `14` single-artifact `ev-soc139-*` records (`1-to-1` with `14`
`psg-soc139-*` passages across `14` primary artifacts / `13` sources) and `90`
`BigInt`-verified `numericFacts` to contrast product functional units against
organizational portfolio references (`SO-LCA` public-comparison ban & `1/60,000`
rights-dilution paradox vs `OEF` `NACE 14` `17,000 kg` portfolio with `0.69 kg`
weekly wash slip); establish `B_soc` matrix linearity limits vs `PSILCA v3`
`openLCA` pseudo-elementary flows and diagonal monetary normalization; expose
fair-wage (`2.0×`) & craft-labor (`4.0×`) paradoxes alongside `GLAM 2024`
workbook's uniform `$43,746 / W_c` scaling across `411` non-zero sectors × `52`
countries (`TUR/CHE = 28.76×`, omitting `IND`/`BGD`/`VNM`) contradicting `Fantke
et al. 2026 §3.5.4`; balance `SHDB`/`PSILCA` cutoff losses (`-43.96%` & `-76.96%`
child-labor drop) against voluntary certification 5-level selection bias and
`50%`/`79%` uninspected farmers; trace Type II occupational `DALY` pathways
(`~70,000,000 DALY`, `0.72 DALY`/injury, `33.3 YLL` vs `23.6 DALY`/death) vs
irreducible fundamental rights; prove `SHDB` linear `0/1/2/3` (`100`-capped) vs
`PSILCA v3` geometric `10×` `15.77×` rank reversal; separate three meanings of
zero (`No data = 0.1` -> `9.0` med risk h on `90 h`); and establish a four-cell
`E-LCA`/`S-LCA`/`LCC` deduplication audit (`EF 3.1` indoor styrene toxicity CFs
`~211×` outdoor). Commercial `PSILCA`/`SHDB` raw tables and paid `ISO 14075:2024`
remain explicitly bounded in `gap-soc139-proprietary-slca-matrices-and-iso14075`
and `Meemken et al. 2021` uses neutral `passages-inspected` /
`access-context-unresolved` metadata without raw-text redistribution or
whole-book completion claims.

The Part V localization-comparison unit #137 compares early Chinese/Hong Kong
localization schemes (`Yang et al. 2001`, 10th Five-Year Plan & `Lin, Zhang and
Chen 2005`, `HKHA C1169 2005`, `GB/T 24040–24044`, and `Xie et al. 2022`) against
EU `EF 3.1`, `CML 2001`, `ILCD 2010/2011`, `ReCiPe 2016`, `LC-IMPACT 2020`, and
`UNEP GLAM 2019/2021/2024` across `B21` (`28` -> `36` claims plus two 6-column
comparison tables, bringing the public catalog to `1,028` claims) while
conserving `100%` of `1,005` untouched prior claims, all `1,044`
non-B21-exclusive prior evidence records, and all `40` case downloads against
`0518e6b529789b8dde9ffebf36d2eeb716a94390`. It binds `17` single-artifact
`ev-loc137-*` records (`1-to-1` with `17` `psg-loc137-*` passages) and `93`
`BigInt`-verified `numericFacts` to separate `EF 3.1` water (`209` codes),
European-allowlist acidification (`36` codes truncating non-European countries to
default `1.31`/`0.74`), and constant-value ozone/PM `<location>` rows (`0`
primary `PM₂.₅` country rows); expose `96.81%` EU (`/0.0384` + `*14.12`) and
`11.62%`/`4.24%` China upscaling inside `EF 3.1`'s `1,803`-row `"global"`
normalisation workbook; prove `CML 2001`'s dirty-denominator dilution paradox vs
`B/G` cancellation, Two Control Zones tightening (`1.250` vs `1.108`), and
open-economy territorial denominator rank reversal (`5,922.49` vs `7,553.08`,
break-even `150`); contrast biophysical units (`CN-HK-MO` merged vs Taiwan
`4.86×`, Xi Jiang vs Yangzi `3.31×`, `LC-IMPACT` `56`/`11,000`/`804`/`449` units
& `VS`) and double rank reversals across `GLAM 2024` concave marginal vs urban
average `PM₂.₅` and `ReCiPe` `KR`/`CH-LI`/`DE` `PM₂.₅` & `NOx` `HOFP`/`EOFP`;
and contrast `GB/T` procedural adoption against `EF 3.1` Addendum `ISO
14040/14044` `"Not defined"` reference-package lock-in. `RIVM 2016-0104` `Table
S3.2`'s post-`Botswana` missing-country/extra-zero row shift, uninspected 1998
workshop parameter tables, `ECER 2011` primary text, and `CADIS`/`CLCD`
inventories remain explicitly bounded alongside `15` inline `display:block`
correction notices without silent repair, raw-source redistribution, or
whole-book completion claims.

The Part V weighting-and-valuation unit #135 compares Swiss Ecological Scarcity
(`UBP 2013/2021` policy distance-to-target), EU `EF 3.1` (`Sala et al. 2018`
`50:50` public/expert importance × `0.17`–`0.87` scientific robustness + global
per-capita annual `NF`), `ReCiPe 2016` (`3`-AoP halt across `DALY`,
`species·yr`, and `USD2013` under `I`/`H`/`E` cultural perspectives without a
default cross-AoP single score), and Japan `LIME1`/`LIME2` (conjoint household
marginal `WTP`) across `B20` (`26` -> `32` claims) and `B22` (`35` -> `41`
claims plus a 6-column × 4-row comparison table, bringing the public catalog to
`1,020` claims) while conserving `100%` of `1,003` untouched prior claims, all
`1,034` prior evidence records, and all `40` case downloads against
`65aafe25a19865d61bd5a251584ce8cc39dc1941`. It binds `18` single-artifact
`ev-weight135-*` records (`1-to-1` with `18` `psg-weight135-*` passages) and `83`
`BigInt`-verified `numericFacts` to resolve coating `甲` vs `乙` across single
`POF` midpoint, 16-category outdoor air, indoor generic `NMVOC` (where omitted
indoor `POF` rows in `b5c610fe.xml` offset the `144×` `HTNC` jump so `甲 < 乙`
persists), and indoor `styrene` (where `HTC + HTNC` surge `146×` and reverse to
`乙 < 甲`), `PEFCR v6.3` Column `A` (`sum 100.03`) vs robustness discount
reversal on `丙`/`丁` and `JRC130796` `NF`/`CF` shift across `2,752` datasets,
`ISO 14042/14044` / `CML 2001` / `ILCD 2010` bans on public comparative weighting
vs `EU 2021/2279` mandatory `PEF/OEF` weighting, `ReCiPe` `160.5×` `I/H/E`
climate-health reversal vs `EF 3.1` stack-height reversal (`戊 = 0.02883 pt`)
and `LIME` 2003/2004/2012 biodiversity re-reversal, incommensurability of
household `WTP`, resource surplus cost, and enterprise `LCC`, and `UNEP GLAM
Phase 3` reporting discipline, alongside `5` inline `display:block` public
correction notices on synchronized prior non-case claims without claiming
whole-book completion.

The Part IV continuous-reread unit #133 synchronizes cross-chapter framing,
dual-view references, first-appearance terminology, and note scopes across `F02`
(`content/docs/book/index.mdx:18`), the Part IV introduction
(`config/reader-numbering.json:23`), `B14`–`B19`, companion climate articles, and
`X03`–`X04` (`61` modified claims and `8` managed files) while conserving `100%`
of all `1,008` claim IDs, sequence, `1,034` evidence records, `numericFacts`, and
`40` case downloads against `2ba0bfe2f39d28bfa42e61f5e2b70585770bcb73`. It clears
all `46` remaining `#90` mechanical placeholder scopes across `B17` (`31`) and
`X04` (`15`), distinguishes `UNEP/SETAC` (2016 guidance) from `UNEP GLAM`
(`Fantke et al. 2026` consensus method), binds `#131` synthesis premises on
`cl-pm-population-meaning` and `cl-pm-conclusion`, replaces workflow meta-language
in two `B14` caveats with academic scope boundaries, eliminates book/web
section-number and chapter-number collisions across `B15`, `B17`, and `B18`, and
publishes four inline `display:block` dated correction notices (`cl-pm-evidence-levels`
`Gronlund 2015` year, `cl-pm-population-meaning`, `cl-pm-conclusion`, and
`cl-water125-value-choices-and-denominator-paradox` Chapter `15` climate
attribution) without altering any underlying scientific evidence or claiming
whole-book completion.

The particulate-comparison unit #131 compares ILCD 2011 (`RiskPoll`/`Greco 2007`
Level I `kg PM₂.₅-eq/kg` midpoint + Level I primary / Level II secondary `DALY`
endpoint), ReCiPe 2016 (`56`-region `TM5-FASST` `20%` perturbation `kg PM₂.₅-eq/kg`
midpoint × global constant `6.29×10⁻⁴ DALY/kg PM₂.₅-eq` or regional `WHO 2012`
endpoint `Annex S1.2`) and LC-IMPACT (`0` midpoints, regional `≥30`-yr
cardiopulmonary and lung-cancer `DALY/kg`, global primary `PM₂.₅ = 6.29×10⁻⁴`),
against EU EF 2.0–3.1 (`Level I` `Disease incidences` midpoint = pure text
rename of `UNEP 2016` premature `Deaths` per `JRC109369` p. 6 n. 5 without
non-fatal morbidity, `NF` `5.9536682112547822×10⁻⁴/person`, `WF` `8.96%` second
largest in `EF 3.1`). It resolves `EF 3.1` `PM₁₀ = 0.23 × PM₂.₅` scaling (dual
reporting adds `23%` of total `PM₁₀` mass, doubling fine impact at `23%` share),
zero CFs on official coarse `particles (PM2.5 - PM10)` flows, and `unspecified
air = urban ground` (`2.38497×10⁻⁴`, `20.96×` / `79.04×` / `146.36×` non-urban
ground/high/very-high stack); inspects close-read `Cohen et al. 2017`
(`PMC5439030` JATS XML, `GBD 2015`: `4,241.1k` deaths / `103,066.2k DALY` across
5 causes, `<5`-yr `LRI = 202.6k` deaths & `17,431.1k DALY = 16.9%` vs `0` in
ReCiPe/LC-IMPACT `≥30`-yr truncation, demographic ageing reversal, mass
equitoxicity, smoking high-dose extrapolation, and lack of prospective
abatement trials); and proves precursor switch & spatial reversals (`1 kg` rural
`NH₃` vs `2 kg` high-stack `SO₂`: `0` vs `0.58` in ReCiPe `H`, `0.24` vs `0.58`
in ReCiPe `E`, `2.1×10⁻⁵` vs `1.98×10⁻⁶ = 10.61×` reversal in `EF 3.1`;
Europe/East Asia vs India `NH₃`/`SO₂` reversal; New Zealand `11.7×` & Pacific
Islands `9.1×` `SO₂ > primary PM₂.₅`; South Korea `2.15/700` vs Romania
`1.30/1700` `2.43×` midpoint-to-endpoint rank reversal). Source-internal
discrepancies (`JRC109369` Table 1/§4.4 vs Table 2 p. 8 `PM2.5 eq` `kg`,
`b5c602c6.xml` `v02.00.011` `900` constant `<location>` rows vs `58 = 48 + 10`
unlocated flows, `'Emission Response Function (ERF)'`, `completeness/inventoryItems
= 50`, `72ce3013` URI, `2.1×10⁻⁷` upper-air `NOx` = `599.69` incidences, `G229`
`52.0803%` urban-ground `NH₃` share, `Cohen 2017` p. 1909 missing exponent minus
sign, `RIVM` p. 50 `Em_NOx,i` typo & Table 5.3 omitted `6.29×`, Table S1.2 vs
LC-IMPACT Table 6.2 `NH₃`/`NOx` gap, and `JRC130796` `0.003%` reduction vs Table
10 positive `0.0034%` & Table 13 `608/608`) remain explicitly disclosed without
silent repair or raw-source redistribution.

The eutrophication-pathways unit #129 compares ILCD 2011 and EF 2.0–3.1 (`3`
Level II midpoints — terrestrial `AE` `mol N eq`, freshwater and marine
`EUTREND` `kg P eq` and `kg N eq` summing to `9.47%` of `EF 3.1` single-score
weight — and `0` recommended endpoints), UNEP-SETAC GLAM 2019 (`2` aquatic
categories with local reversible `PDF·m³·yr` endpoints, `0` terrestrial),
ReCiPe 2016 (`1` freshwater `P` category with `85`-day residence time and
constant `6.1×10⁻⁷ species·yr/kg P-eq`, `0` marine and `0` terrestrial), and
LC-IMPACT (`0` midpoints, `2` global irreversible `PDF·yr` endpoints across
`449` freshwater ecoregions / `15,000` fish species and `5,772` basin–`LME`
pairs / `66` `LME`s / `57` hypoxia species / `6` marine taxa). It resolves the
`2 kg` agricultural total-`P` interface across `EF 3.1` soil (`0.05 → 0.10`),
ReCiPe soil (`0.10 → 0.20`), and GLAM Tier 1 (`10% → 0.20 kg P eq`) versus
`10×–20×` double-attenuation (`0.010/0.020`) and direct-water (`2.0`) errors,
`P₂O₅` two-atom stoichiometry (`0.436` vs `RIVM` printed `0.22`), `EU 2021/2279
§4.4.1.5` N-to-soil prohibition (`0` soil `N` rows in `EF 3.1` XMLs, Tier 1
`0.022 N₂O`, `0.12/0.24 NH₃`, `1.33 NO₃⁻` yielding `3.12 kg N eq` and `16.16
mol N eq` on `10 kg` synthetic `N` vs silent `0`), dual aquatic (`1.5 kg N`
river vs `1.0 kg N` coastal: `1.5 > 1.0` in `EF 3.1` vs `1.374×10⁻¹⁵ <
1.95×10⁻¹⁵` in `LC-IMPACT` at `47.0%` river-to-sea ratio) and airborne (`3 kg
NOx` air vs `1 kg NO₃⁻` river: `1.167 > 0.226` vs `0 < 2.07×10⁻¹⁶`) rank
reversals, and `540` constant marine `<location>` copies versus terrestrial
unlocated `NOx = 4.26 > 3.547` (`+20.1%`). Source-internal discrepancies
(`Normalisation_Weighting_Factors_EF_3.1.xlsx` `R1406–1408` `+0.2509 kg P
eq./person = 15.6%` agricultural double counting and `R1283 + R1288` marine `N`
stacking, `RIVM 2016-0104` p. 62 `P₂O₅ = 0.22` and `Table S4.2` `[PDF·L/mg]`
header, `b53ec18f.xml` duplicate freshwater `Phosphorus` UUIDs, `<inventoryItems>
3/7/6` vs `29/590/575`, `'Eutrophication marine'` comma omission, `Struijs 2008`
vs `2009`, `'Accumulated Exceedance (AE) '` trailing space, `27` empty + `8`
omitted `<location>` tags, subcompartment rounding splits, and `JRC130796`
`Table 13` duplicated `4th`/`5th` columns) remain explicitly disclosed without
silent repair or raw-source redistribution.

The biogenic-carbon unit #127 compares ILCD 2011 and EF 2.0–3.1 (`GWP100`
midpoint only, zero recommended endpoints, `EF 3.1` single-score weight `21.06%`
and global `NF` `7,553.08 kg CO₂ eq./person`) against ReCiPe 2016 (`I/H/E`
`GWP20/100/1000` midpoints multiplied by gas-independent `CO₂`-`IAGTP` constants
across malnutrition/malaria/diarrhoea/flooding `DALY`, `Urban 2015` `0.037 PDF/°C`
terrestrial `species·yr`, and `Hanafiah et al. 2011` river-mouth fish `species·yr`)
and LC-IMPACT (`0` midpoints, `100/1000`-yr `certain` `3` HH / `0` aquatic vs
`all` `6` HH / `<42°` aquatic damage factors, `3`-fuel total HH difference up to
factor `4` without rank reversal). It proves ReCiPe 2016's `H`-only non-`CO₂`
climate–carbon feedback asymmetry (`N₂O` `264 → 298 → 78.8` and `3.5 kg CH₄` vs
`1 kg N₂O` reversal), `EF 3.1`'s exact disjoint `1,099 = 1,074 + 13 + 12` XML
partition (native-forest wood/soil `CO₂` in `LULUC` excluding uptake, `LULUC`
`CH₄ = 29.8`, peat and all `6` `N₂O = 273.0` flows in `Fossil`), `0/0` versus
`−1/+1` cradle-to-gate `−44/12` spurious negative-carbon mismatch, `EF 3.0 → 3.1`
methane `36.75 → 29.8` and `CO` `1.57 → 0` removal (`-6.7%` `NF` drop, `-2.9%`
mean and `-58%` to `+302%` swings across `2,752` datasets, and marginal `20 kg CO`
vs `25 kg CO₂` boiler rank flip), and `PEF` `biogenic-100yr = −1` abolition plus
`PAS 2050` `20`-year `dLUC` amortization versus dynamic `T−tₖ` convolution.
Source-internal discrepancies (`EF-v3.1.zip` `Normalisation_Weighting_Factors_EF_3.1.xlsx`
`K1161 = 27.2` `AR6 FGD` draft residual `+3.79 kg CO₂ eq./person` traced to `IPCC AR6 WGI Errata`
p. 25, `CFC-11` `6226`, `HFC-134a` `1526`, merged `(halons)` `3952.72`, `IPCC 2013`
`AR5` metadata lag on `31ac5d13.xml` & converter copy and bundled 2019 `JRC115959`
PDF, `14af9ca7.xml` `5` `LULUC` `CO₂` outputs missing high-altitude subcompartment,
`EU 2021/2279` lingering `CO` clauses, `ILCD 2011` p. 18 `N₂O` `factor 2` direction
error, and `RIVM` `Table 2.2` `"1,2684.1"` typo) remain explicitly disclosed
without silent repair, raw-source redistribution, or paid `ISO 14067` / `PAS 2050`
full-text claims.

The water-scarcity unit #125 compares ILCD 2011 (`Swiss Ecoscarcity` six
regional scarcity levels, zero endpoints) and EF 2.0–3.1 (`AWARE` `[0.1, 100]`
scarcity-weighted midpoint only) against ReCiPe 2016 (unweighted physical
consumption midpoint `WCP = 1 m³/m³`, deferring regional stress `WSI` and
vulnerability to malnutrition, terrestrial plant NPP and river-mouth fish
endpoints) and LC-IMPACT (`0` midpoints, `11,050`-watershed malnutrition
`DALY/m³` and `0.05°×0.05°` wetland global extinction `PDF·yr/m³`). It proves
the `10:1` industrial groundwater accounting split (`EF 3.1` 7 positive / 4
negative elementary flows versus ReCiPe `Table 10.2` ratio `1` refusing
surface-return credit), the `WR_malnutrition` denominator paradox in `Table 10.4`
(`I = 3.10×10⁻⁶ > H/E = 2.22×10⁻⁶ DALY/m³` via `1350 / 1000 = 1.35×`), and
multi-way country rank reversals across `AU`/`BD`, `CL`/`CN`, and pure physical
`WSI` versus `AWARE` in `BE`/`CA` (`6.29×` vs `1:5.40`). Source-internal
discrepancies (`EF 3.1` `b2ad66ce.xml` unlocated global `-42.955` vs `+42.950`
`-0.005` credit asymmetry, `GL = 0.00`, `inventoryItems = 36`, `Volume`
flowproperty reuse vs `JRC109369` `kg world eq. deprived` typo, `RIVM` `Table 9.1/9.3`
misreferences, `1,530` vs `1,350` `WR_malnutrition`, `Table 10.1` High regulation
vs `Table 10.3` `WSI_I = 0.698 > 0.657`, `Table S6.2` corruption from row 53
`Fiji` through `Zimbabwe` after 52 intact `A–E` rows, and `LC-IMPACT` `Table 1`
`Average` vs `§2.3` dual factors) remain explicitly disclosed without silent
repair, raw-source redistribution, or claims of local basin water permitting.

The toxicity-comparison unit #123 compares ILCD 2011 / EF `USEtox` three
chemical-toxicity midpoints (`CTUh` for cancer and non-cancer human toxicity and
`CTUe` for freshwater ecotoxicity, excluding marine/terrestrial midpoints and
most endpoints) against ReCiPe 2016 `USES-LCA 2.0` five `1,4-DCB`-referenced
midpoints (excluding agricultural-soil ecotoxicity to prevent land-use double
counting) and perspective-invariant endpoint conversion constants. It proves
controlled rank reversals across EF 3.0 -> 3.1 `0.2/HC20` + EU REACH/EFSA metal
recalculations (`Cu` vs `Hg` reversing >4 orders of magnitude versus `20/17`
fallback) and across ReCiPe `I/H/E` five coupled time-horizon and metal
food-chain switches (`1,4-DCB` vs `Nickel` in urban air and seawater), and
documents valence, 2019 EU pesticide-sales and unspecified-water proxy rules
plus normative zeros (`-44%` `HT_nc` normalization drop vs `+4,438%` avoided-
emission credit jump). Source-internal discrepancies (`ILCD/lciamethods` vs
`other/converter` `12`-byte metadata deltas and freshwater `Lactic acid` `1033.8`
vs `0.0` split, `180` duplicate ammonia location rows, `Carbon tetrachloride`
3-sig-fig rounding and missing compartments vs `CFC-10`, `CTUe` flowproperty
metadata conflicts, `JRC130796` Eq. 3 inverted fraction and p. 28 `9.92E+04`
typo, `JRC109369` `Sb(+6)` / `Table 5` long-term conflict, and `RIVM` `3,094` vs
`3,073 + 20 = 3,093` count) remain explicitly disclosed without silent repair,
raw-source redistribution, or claims of site-specific chemical risk assessment.

The ozone-and-radiation unit #121 compares emission midpoints stopping at
stratospheric physicochemical load (`ODP` in `kg CFC-11 eq`) or collective
radiation dose (`IRP` in `kBq U-235 eq` versus `kBq Co-60 to air eq`, sharing
`14:11` scaling only under unchanged `Frischknecht et al. 2000` 100,000-year
assumptions) with the additional UV skin-cancer/cataract or `DDREF` (`10 / 6 / 2`),
cancer-site (`4 / 11 / 13`) and hereditary-disease (`57` vs `61 DALY/case`)
extrapolations required for `DALY` and the absence of accepted ecosystem
endpoints. It proves controlled rank reversals across `ODP` horizons, `N2O`
inclusion and `WMO` 2011/2014 editions and across `IRP` horizons and blank
long-lived uranium-series columns in `ReCiPe 2016` Individualist and default
Hierarchist tables. `RIVM 2016-0104` `(-t-3)·k` `Table 3.2` spreadsheet behavior,
`Huijbregts et al. 2017` infinite-only summary prose, `JRC109369` `Annex 1`
113-row count (two missing upper-air rows restored in `b5c629d6.xml`), `Methyl
bromide` 4-row/empty-CAS defects, and `JRC109369` `Mass U235-equivalents`/
subcompartment prose versus `b5c632be.xml` `Radioactivity`/retained upper-air &
seawater/`Calculated` freshwater entries and flow-XML synonym contamination
remain explicitly disclosed without silent repair, raw-source redistribution, or
claims of site-specific radiological dose compliance.

The photochemical-ozone unit #119 compares single-substance `POCP` (`kg C2H4 eq`),
EF 3.1's single human-health `LOTOS-EUROS` midpoint (`kg NMVOC eq`) and ReCiPe
2016's split `TM5-FASST` human (`HOFP`) and terrestrial-ecosystem (`EOFP`)
`kg NOx-eq` midpoints on shared precursor inputs. It proves precursor ranking
reversals across EF 3.1 and ReCiPe 2016 and between `HOFP` and `EOFP`, explains
regional high-`NOx` titration sign flips (`HOFP < 0 < EOFP` around the 2000
reference working point) versus EF 3.1's 720 constant `<location>` flow-matching
entries, and establishes why full-mass multi-pathway characterization of a
single precursor UUID is distinct from invalid cross-unit addition, unverified
two-pollutant `DALY` summation, or overlapping policy-target scoring. Preserved
source discrepancies (`JRC130796` Table 1 missing `*`, `JRC109369` `POCP` table
label, `0.234` rounded quotient versus XML `0.235`, `1,1,1-trichloroethane` flow
XML `CAS 79-00-5`, and `RIVM 2016-0104` skipped `Table 6.3–6.4` / `"Table 5.6"`
typo) remain explicitly disclosed without redistributing raw originals or
claiming local hourly smog-compliance simulation.

The fossil-resources unit #117 compares scarcity-based resource midpoints against
full-substitution energy-carrier midpoints (`EF 3.0/3.1` `1 MJ/MJ` net calorific
value versus `ReCiPe 2016` `kg oil-eq` higher heating value), explains why natural
uranium crosses the fossil/mineral category boundary between `EF` (`Resource use,
fossils` XML `b2ad6110`) and elemental `ADP` / mineral `SOP`, and proves from
published `ReCiPe 2016` tables why equal `1 kg oil-eq` midpoint extractions map to
divergent fuel-specific `SCP` endpoint values and an egalitarian per-kg hard-coal
proxy inversion for brown coal and peat. Unresolved `RIVM 2016-0104` cross-table/
figure citations, `Vieira et al. 2016b` formula attribution, barrel-versus-kg
abscissa units, currency-year labels, and `EF 3.1` XML `shortDescription` metadata
artifacts remain explicitly disclosed without silent repair or redistribution of
raw originals.

The mineral-resources unit #115 compares selected original ADP, SOP and cost
estimates on explicit elemental extraction and scenario bases. A fixed positive
reference or currency multiplier preserves order; a reported contrary ordering
can exclude that mapping without establishing the true future cost or its cause.
Matching per-metal economic reserves and starting cumulative extraction does not
make fitted curves, samples or estimators identical. Original copper conversion,
URR, integrand and currency/regression discrepancies remain accessible.

This unit also corrects the original B14 opening's overly broad emission framing.
Its stable claim/note identity receives an explicit dated correction linking the
immutable preceding source; the original raw record and its qualification remain
recoverable. The current interpretation distinguishes emission health/ecosystem
paths from extraction/resource scarcity. The other934 historical claims retain
exact records. Source, continuous-reader and actual-output qualification remain
separate, and no factor workbook, original source redistribution, native LCIA run,
functional material substitution or whole-resource assessment follows.


The acid-equivalents unit #113 uses selected released rows to distinguish factor
identity and indicator meaning. Its country comparison rejects chemistry-only
reconstruction of those rows; its two AE-category comparisons reject one scalar
for those locations. Neither establishes an EF-to-GLAM numerical mapping or a
real damage ratio. The conflicting GLAM descriptions, abstract-only original
paper scope and mole-group version discrepancy remain explicit. Official unit
labels, a shared quantity property, exact input mass and actual importer behavior
are distinct evidence. Retained correct values do not waive carrier and citation
identity checks, and no new numeric case or raw-source redistribution follows.

The land-recovery unit #111 compares operations within specified models: counting
a post-abandonment interval and converting an already-characterized land score
by a fixed positive model coefficient. An unweighted regional factor is distinct
from a globally aggregated PDF indicator. The authored integral and controls have
declared dimensions, time origin and sign conditions; they are not observed
restoration or new official factors. The original2016 report, later article,
updated report and named technical chapter retain separate identities. A printed
table/formula discrepancy or conflicting shorthand remains visible evidence,
not an invented official correction or a claim about an uninspected workbook.

The circular-footprint unit #109 distinguishes product-account shares from a
complete service-matched route comparison. Historical 2018 guidance, the 2022
corrected PEF carrier and a 2021 hypothetical figure keep separate identities.
The figure also changes the material-quality reference; it cannot alone establish
the effect of changing only allocation weights. The book's fixed-reference
positive-benefit derivation is explicitly authored and is not a new numerical
case, compliant product study or empirical intervention. Selected source reading,
continuous Part III manuscript assessment and actual publication evidence have
different scopes. A parameter proposal does not qualify a category value or a
physical supply response.

The finite load-shift unit #107 separates an observational wind-potential proxy,
a published model-basis condition and the book's own two-period dispatch example.
The closed versioned input has stipulated service, energy, cost and emissions
parameters. Its finite difference is not an empirical outcome or a source-native
run. The second paper's retained text captures are derived carriers, not raw PDF
bytes. Same units, a low signal group or an affine relation alone do not establish
the required common response for a specific paired intervention. Earlier numerical
and citation identities remain qualified independently of this new unit.

The service-constraint unit #102 adds a source hypothetical and authored algebraic
controls to B07. Original printed coefficients, values reconstructed from stated
relationships and author examples remain distinguishable. A valid result for one
matrix cannot silently qualify another printed matrix. Zero service price,
consumer expenditure and service adequacy are separate quantities and judgments.
Preserving solutions inside a fixed model does not prove real service performance,
original-software behavior or the suitability of a monetary research question.
The new static case and scientific successor retain earlier numerical inputs and
acceptance identities, with independently reviewed current source/reader/output.


The user endorsed the pilot method on2026-11-15 for every later modification and
addition. Each task declares whether it changes scientific meaning, material
selection, language or publication behavior and reviews the corresponding impact.
The pilot's frozen paragraph and numeric inventories are scoped to that accepted
generation. Record an explicit historical disposition for a correction, and use
a new version where the changed claim or case requires it. Preserving old
evidence does not authorize continued publication of a known error as the
current conclusion.
Conversely, a fresh digest or a self-consistent successor receipt cannot erase
an old passage, carrier, meaning or unresolved source limitation. Apply the
existing comparison/writing rules and actual source/reader/output gates in
proportion to the change, without treating the pilot's test count as a template.

The flow/boundary pilot99 adds separately identified comparisons and selected
original-source readings to the accepted #95 generation. Its exact source delta,
reader judgment and actual-export evidence belong to an independently pinned
successor; a copyedit acceptance cannot authorize new scientific meaning.
Earlier claims, native inputs/templates, source identities, released receipts and
historical citation scopes retain their original qualification.

When this pilot extends an existing reading, its old artifacts and passages,
their order, work identity and original access/reading events remain intact.
New selected positions are appended. Precisely reviewed appraisal updates and
dated unread-scope clarifications do not permit moving an old quotation locator
or relabeling an old carrier. A genuine correction of such evidence requires its
own explicit scientific disposition rather than a fresh whole-record hash.

Source and method records identify their actual layers: a publicly accessible
standard preview is not a complete amended standard; an original package member
is not the entire archive; a stored zero is not its scientific explanation; an
author-derived algebraic result is not a native run or environmental observation.
The pilot's comparison and reader reviews are agent assessments, not human expert
certification or empirical reader learning evidence.

The initial release established bounded examples. The approved book programme now expands source-grounded chapters while retaining explicit incomplete coverage. Chinese prose retains original English labels. Public content is authored here; private experiments and restricted evidence remain in research. Only reviewed, explicitly publishable records enter public exports.

Canonical knowledge is stored in knowledge/catalog.json; MDX renders claim statements by ID. Source, evidence, claim, concept, mapping and coverage identities are stable. Version changes never silently overwrite a released snapshot. Claims distinguish source-statement, interpretation, synthesis, calculation and proposal. Each evidence record identifies an exact locator. Claim-specific evidenceLinks assign support, qualification, contradiction or context plus rationale; legacy records retain their original evidence-level relation. Explicit links must exactly cover evidenceIds and never silently fall back to a legacy role. Claim scope, premises, caveats, review date and review kind remain explicit. AI review is never labeled human expert approval.

Source retrieval, rights, version and preservation limits are recorded. Unavailable full text does not support a purported full-text verification. No source copying is authorized merely by access. Proposed improvements carry reasoning and alternatives; editorial suggestions are not external normative requirements.

When a carrier's access circumstances are unresolved, `passages-inspected` records only actual selected inspection without asserting public or licensed access. It requires an explicit selected-reading scope and reading-ID binding, whose carrier and passages are verified by the research validator. Its literature entry may use `access-context-unresolved`; rights and limitations state the observed context separately. An institutional-access banner or a captured article body does not establish entitlement, an open license or redistribution permission. Abstract-only substantive reading must not be misreported as proof that fuller text was unavailable. These states do not permit a full-work reading upgrade or weaken passage/evidence bindings.

Changed sources, premises, concepts and mappings invalidate dependent review through the derived dependency graph. Search cutoff, evidence review date and substantive modification date remain distinct. New evidence passes screening, extraction, impact review and editorial PR before publication. Historical releases remain immutable with separately discoverable errata.

Initial publication may include explicitly disclosed open questions, but must not present unsupported draft conclusions as established facts. Publication status and epistemic uncertainty are separate. Automated integrity checks verify references and required fields; independent substantive review evaluates entailment and applicability.

## Rights boundary

Code is MIT licensed. Original knowledge prose and records in content/ and knowledge/, and original book figures in public/book-figures/, are CC BY-NC-SA 4.0; commercial use requires separate authorization. Third-party content retains its original licenses and authorization conditions; no project license overrides them. Contributors must have authority to license their submissions, and separate commercial authorization must come from the relevant rights holders. Publication rights are reviewed independently of evidence support.

## Public research records

`knowledge/research/literature-map.json` records discovery and coverage, not research completion. `readings.json` identifies actual selected passages, work/version/carrier identities, acquisition hashes, methodological appraisal, unread areas and evidence-triggered revisions. Shared works, overlapping passages and repeated institutional lineages do not count as independent confirmation. Catalog sources bind reading IDs and artifact identity; evidence binds a reading and passage, including the exact carrier for mixed PDF/HTML readings. SHA-256 identifies acquired bytes but does not guarantee future availability or redistribute permission.

Reader pages present bibliography and citations; search protocols, execution history and editorial changes live in development Markdown. Machine exports retain nested public allowlists. No raw originals, private paths, credentials or unpublished claim text enter them. A public reading note may report uncertainty or a proposed editorial revision; this is not promotion of an unsupported substantive conclusion. `Prose` renders canonical reviewed text continuously, with accessible claim/evidence links; `Claim` retains the detailed view. General source appraisal and claim-specific entailment are separate.

## Reproducible teaching cases and derived carriers

A `derived-text` artifact identifies the actual captured text bytes, its original-document URL, extraction method/scope and unavailable original bytes. Its hash never represents the original PDF; visual verification and complete-document reading must not be inferred. A narrow editorial acceptance may support selected claims while this gap remains explicit. Raw captures remain outside public exports.

Reviewed numerical evidence can expose a `numericFact` with value, unit, quantity, subject and basis. A teaching case binds each selected characterization factor to the published numerical fact and its source. Hypothetical performance, inventory and decision assumptions remain separate from source-derived factors.

`knowledge/cases/*.publication.json` binds reviewed claim templates to the SHA-256 of the exact allowlisted downloadable input. Explicitly materialized canonical claim text and metadata must match that binding; build validates without approving or rewriting claims. Input or template changes require renewed substantive review and deliberate catalog updates. Versioned input filenames and case bindings preserve each registered version's own identity. This validation establishes consistency, not empirical truth or stakeholder acceptance of a hypothetical tolerance.

## Distinct questions in a shared case

CASE-JOINT-BATCH keeps additive product shares, physical alternative routes and reference-conditioned residuals separate in claim text and output fields. Two differently unitized inventory flows are never aggregated into an environmental score. Its prices, service equivalence, supplier response and utilization scenarios are author stipulations; source discussions motivate the argument but do not provide numerical evidence for them. A model with no characterization uses no factor bindings, through its explicit registered inventory-only policy; the wall model's fact binding remains mandatory.

Reused original works receive precise additional passage/visual-check records where inspected. Added locators do not increment work counts or imply whole-work reading. Dated normative and adequacy criteria retain each author's purpose. A correction record does not substitute for an unread original procedure, and a mathematically similar teaching formula is not automatically that procedure's implementation.

## Editorial selection and historical continuity

The2026-11-08 whole-book selection decision in `editorial/2026-11-08-argument-and-selection.md` separates evidence eligibility from main-text inclusion. Faithful source support does not require publication of every inspected detail. Preserve coverage obligations, reader-essential conditions, counterevidence and immutable source/release identity while permitting explicitly reviewed mergers, notes, appendices, useful website topics and corrections. A current paragraph's removal from the main text requires a documented semantic destination or correction, dependent-use review and actual historical-link qualification; retaining an empty anchor or changing a baseline hash is insufficient. Existing code guards remain binding until those bounded dispositions are implemented and reviewed. Editorial agreement is not scientific consensus or human expert approval.

The [concept-led comparison contract](editorial/concept-led-comparison.md)
separates a claim's faithful source support from adequate comparative coverage.
Future claims of a completed cross-system comparison require aligned questions,
objects, conditions and versions, actual evidence for the relationship and its
consequences, and an explicit statement of unexamined scope. The existing source,
reader and output gates remain necessary; their software success does not supply
this research judgment. Earlier receipts retain their original bounded scope.

## Reader publication boundary

Complete-manuscript acceptance binds the actual before/after source, ordered
public and research records, and both dependency graphs. Unchanged URLs do not
waive old title, note-subset or ordinary-content obligations. Migrations require
exact, accessible destinations and separately reviewed semantic dispositions.
Source, reader and actual-output reports must be real preserved artifacts bound
to the same unit; a review hash alone is insufficient. Production inputs and
public indexes/downloads must belong to the qualified current generation.

Private preview artifacts are an editorial aid, not a publication acceptance.
The production build and export gates cannot be disabled by package metadata or
the preview flag. These integrity conditions do not turn an agent judgment into
human expert approval or empirical model validation.

The user-approved `_docs/reader-publication-contract.md` governs every delivered reading page. Public prose is finished exposition; all research/development process logs and TODOs stay in `_docs/`. Scientific scope, source identity, counterevidence and hypothetical assumptions remain reader-accessible. Stable machine identities and validation receipts do not become visible prose labels. Source/reader review and actual visual verification supplement software checks.

Static prose examples retain versioned public inputs and exact materialized claims even when they do not use a calculator widget. Water-locality numbers are synthetic; the phosphorus example binds a source-derived inventory-estimation coefficient and leaves its LCIA factor symbolic. The registered adapter fixes each numerical-source policy; an input flag cannot suppress required source evidence. Changed v1 tuples require renewed model/version and complete affected-prose review.

## Source-table fact sets and historical reconstruction

An evidence record may publish either its legacy singular `numericFact` or a nonempty `numericFacts` list. Each plural item has a unique identity within that evidence and the same decimal value, unit, quantity, subject and basis contract; singular/plural coexistence is rejected. Nested publication projection excludes unknown fields. Fact identity alone does not establish source entailment or scientific validity.

The historical-glass adapter requires every selected fact in the reviewed public closure with matching evidence/source identity, fact ID, value, unit and subject, and binds the exact inspected original PDF hash. Its closed v1 records selected component arithmetic and source-reported summary normalization, retaining unclosed whole-system assembly, unreported precision and empirical limits. The author-conditional coefficient-rounding bound holds displayed mass fixed and is not a probability or empirical uncertainty interval. Neither input flags nor a matching aggregate permit bypassing source facts or declaring complete original-software reproduction.

Historical numerical publication also requires the actual reading register. Each fact's evidence must resolve through an inspected same-source reading and an unambiguous passage to its original-PDF artifact with the fixed hash. A source's default snapshot cannot substitute for a missing or different passage carrier. Generic mixed-carrier readings remain valid for other evidence; carrier identity checks still do not establish that a passage entails its claimed quantity.

The pedigree-calibration case separates source-summary arithmetic from a
deliberately stipulated probability model. Its three numerical sources bind
exact reading, passage, fact and original-PDF identities. The neutral
`passages-inspected` state retains unresolved access context while recording
actual selected inspection; it is not an open-license or entitlement claim.
Reported internal discrepancies remain unrepaired. Published GSD factors,
squared-GSD parameters, log standard deviations, estimator precision and
individual spread retain separate meanings. No case flag can promote the
summary calculation into reproduction of raw observations, empirical calibration
or current database software.

The market-response case keeps historical average-supply arithmetic separate
from author-stipulated demand-response scenarios. Its nine displayed source facts
bind value, unit, quantity, subject and basis as well as exact evidence, reading,
passage and original-PDF identity. The loss-inclusive M3 denominator is not a
final-meter delivery unit. Fictional material response, electricity activities and
CO2 coefficients are explicit conditions; capacity availability, procurement
identity and actual output response remain distinct. The input cannot declare
empirical response validation or convert the modeled CO2 inventory into a full
material footprint or impact score. Older registered inputs remain unchanged.

The hybrid-inventory example binds the particular published wall service that
supplies its external electricity demand. Repository validation and export require
one matching wall input and manifest, their registered filename, the canonical
public hash and the service fields used by the calculation. The new annual
transactions, prices and direct emissions are author stipulations. Separate
ledgers preserve supplier identity through aggregation, subtraction, normalization
and solution. A balance residual can check a proposed system of equations while
the actual trading partners still require evidence. Source-reported numerical
examples and the new supplier records have distinct provenance.

For the Swiss 2013 weighting case, the original edition, work, carrier, passage and numerical tuple all qualify the factor used. The reconstruction from reported inputs and the application of rounded published values are distinct calculations. A synthetic change to one relative factor establishes a conditional ranking threshold. Historical policy change requires separate dated evidence.

For survey-based damage values, bind the estimate to its actual study, questionnaire basis, sign and units. A reprinted sample table cannot authorize substitution of another publication’s coefficients. Explicitly conditional arithmetic such as the health-day conversion, unpublished precision and unresolved cross-table discrepancies retain their own status. The LIME teaching comparison uses reported factor sets separately on the same stipulated service and damage quantities.

For CASE-PACK, a reuse threshold specifies a comparator, service and impact measure. Published model outputs can establish arithmetic relationships while confidential inputs still limit native reproduction. Respondent incidence and bag-weighted substitution remain distinct quantities in numerical metadata as well as prose. The publication's count and division templates reference evaluated values; explicit reapproval of prose still requires source and reader judgement.

The recovered-paper case binds each grade's published substitution ratio to its own reference process. A direct source ratio remains a model assumption, and a derived product vector is not a complete native activity matrix. Distinguish annual routing, marginal treatment service, finished-paper output, fibre balance and end-product performance. Reported heat-only credits may be retained without claiming that disclosed parameters reproduce them; exact tuple checks must not erase that scientific limit.

A dated rule can support a technical conformance condition without establishing
its legal application to a specific company or the empirical validity of a model.
For the dairy rule trace, bind numerical evidence to the actual PDF or XLSX
carrier and its inspected page, worksheet/cell or embedded diagram location.
Workbook results, formulas that retrieve stored outputs, and native model inputs
are distinct evidence layers. Do not silently repair disagreements between dated
public artifacts or publish a reconstructed footprint from an unclosed activity
chain. Rule-review statements and study-level verification retain their exact
objects; a shared statement in two carriers is not independent corroboration.

A selected literal fraction in a separate source workbook must retain that
workbook's original identity and the inspected cells, including the literal's
numerator, denominator and units. Agreement with a similar default in another
source cannot waive this binding. Equal labels on separate model connections
establish numerical agreement only; the exchange semantics and any unresolved
native relationship remain explicit.

For particulate-health teaching, distinguish emitted primary particles or
precursor mass, inhaled particle mass, population/age definitions, health
outcomes and already characterized damage. A published historical intake/effect
join does not authorize replacing either factor with a later model. A weighted
reconstruction from source factors that themselves use the same weights is a
consistency check, not independent validation. Keep source groups separate from
receptor populations and preserve unquantified uncertainty.

When a numerical original is a member of a public release archive, bind the
exact member bytes and its named archive path separately from the archive's
identity. The particulate case requires both the original XLSX and the ZIP
passage in the reviewed public closure. A matching archive hash cannot substitute
for the workbook hash, or conversely. Neither a source's publication date nor a
software-matched sheet supplies the coverage of the full original method.

For electricity, preserve source-defined generation, delivery, loss, trade and
time coordinates. An identical region name or unit cannot authorize cross-source
division. A native model result is an author-derived execution record, distinct
from a source-table literal. CASE-POWER fixes both the selected source tuples and
its separately labeled native summary, including exact code/input and receipt
identities. Static publication evaluates arithmetic from those reviewed records;
it does not rerun or certify the original model. Archive and member identities,
mixed-carrier readings and original access limitations remain independently
bound. A source documentation discrepancy does not establish implementation
behavior without the executable evidence.

Native exchange comparisons distinguish source-data facts from author-derived
execution observations. A source artifact or selected code passage cannot stand
in for a run receipt. Preserve archive/member identity, schema migration,
explicit settings, loaded-library identity and the closed inspected database
digest through calculation. Public summaries may expose reviewed selected
observations and receipt hashes without redistributing the original database,
complete factor tables or native model exports. A numerical match never grants
redistribution permission or establishes physical applicability.

The CML framework examples keep an original hypothetical process model separate
from a later external screening transformation. The reviewed input binds every
selected coefficient, original reported literal, factor range and scoring limit
to its actual Guide or EPA passage and PDF. Closed exact arithmetic distinguishes
source statements from reconstruction; the printed determinant and methane-score
mismatches remain explicit. Source ranges carry no probability assignment, and
undefined gaps between displayed scoring bins receive no invented rule. The
static case does not execute historical software, apply facility score modifiers,
aggregate screening criteria or establish empirical/engineering validity.


Climate comparisons bind gas identity, carbon-content accounting, metric,
time horizon or calendar endpoint, reference and factor edition separately.
A generic methane row excluding its carbon-content budget may still include
warming-driven carbon feedback. A native historical routine, a supplied response
series and a corrected factor table have different provenance. The climate case
preserves those layers and an unchanged parent inventory. Its source-rounding
interval is distinct from physical uncertainty; an annual history metric is not
a product-unit factor or an authorization for offsets. Current original-carrier
readings can extend a work while preserving earlier derived-text captures and
immutable case inputs as dated evidence.

Stable reader addresses are tied to their actual claim occurrence and preserved edition context. A moving display number cannot silently reassign an older address. The opening migration retains one canonical editable claim, with native old aliases or explicit relocation destinations and an immutable-source link for its dated baseline. This does not create a second editable scientific edition or imply every earlier unversioned URL had the same meaning. New authored synthesis and source-scope corrections require their own actual evidence review before promotion.


An editorial move of historical calculation paragraphs can retain the same registered input version only while its exact source facts, quantity semantics, assumptions and arithmetic remain unchanged. Reworded cross-page antecedents are explicitly revised in the publication templates and canonical materialization under a renewed substantive review date; the changed publication-manifest bytes have their own new content hash. Preserve all unaffected case/release bytes. An added nonnumerical synthesis must bind the actual local reconstruction premises and cannot promote reported totals into independently reproduced whole-system outputs.


Published canonical reference names are publication surfaces in their own right, even when an older positional inventory predates them. A source-bound reconstruction can establish names generated by immutable released code and actual historical occurrences, but must identify that evidence honestly rather than assert a captured or retained hosted edition. Record the corresponding source for each address generation. Independent inventory pins and actual same-claim destination checks guard against co-deleting expected history and output. An interface-only repair may preserve all scientific records unchanged; it still needs actual browser/reference qualification and exact source delivery.


Combining sources into one authored chapter must preserve the narrower meaning of their published unit and annotation-group addresses as well as individual claim references. Native scope context identifies the original title/edition and exact original note subset; a broader current note group cannot silently replace that meaning. Reviewed manuscript acceptance binds both canonical scientific records and any substantive authored navigation. Shared website/book projections do not create separately editable copies of scientific explanation.


Native retained headings, as well as chapter and note-group targets, may carry
narrower historical content scopes than their present section. Qualify each
scope against its own immutable source or actual captured edition, preserve the
original claim subset and expose its dated context at the native heading.
Inherited citations are remapped by their actual destination identity; the source
route alone cannot determine where a subsequently moved note belongs.


The particulate chapter and its calculation appendix share canonical records.
The complete original48propositions and10numerical templates remain present,
with current six explanatory additions separately accepted. Exact old chapter,
section and note scopes remain readable across the new destinations. The
specific original/matched AUS comparison qualifies the stated rows and labels,
not the mapping algorithm, a current package other than the named release, or
software execution. A final source/reader/engineering acceptance binds the
current scientific records and audit additions; real output, hosting and
delivery still require their own evidence.

## Readable-writing adoption

The user-adopted [writing and teaching standard](editorial/readable-writing-and-teaching.md) governs Chinese manuscript revision. Reader-essential conditions stay with their claims; source fidelity and comprehension remain independent checks. Its dated assessment and illustrative edits do not acquire scientific approval through adoption. A prose-only revision of a numerical case may retain its immutable input while renewing the exact publication templates, canonical materialization and affected-consumer acceptance. Original snapshots and all unrelated input/publication identities remain protected.

The #95 language successor starts from the actual published Main8148 generation,
not from a rewritten original inventory. The previous accepted unit and its
receipts remain immutable. Current source/reader/output acceptance names the real
before/after text, affected consumers and preserved scientific meaning. Supporting
summaries must exist as independently bound public files; private source originals
and full classroom material are not substitutes and remain outside the repository.
Hashes, dates and complete output coverage cannot themselves prove that a language
change preserves a source's meaning. The review must check subjects, quantities,
comparison pairs, conditions, attribution, negation and each table column. A
newly found source question returns to its actual evidence before publication.

A #95 print-only container cross-reference amendment must bind each exact
authored origin and fragment to its corresponding native printed section. The
actual 8148 web and print captures establish the preserved destination scope;
current output verifies the source paragraph and native target. The amendment
changes the reading view of two links while preserving scientific records,
authored web links and earlier citation scopes.

## Bilingual meaning-equivalent edition (2026-11-23, `#246`)

The user-authorized English edition is authored at the **meaning level** rather than by sentence-by-sentence translation, sharing the canonical evidence, premise, concept, mapping and numerical case-input skeleton with the Chinese edition while storing English text in parallel layers (`knowledge/editions/en/**`, `content-en/docs/**`, `config/editions/en/**`) aligned through `knowledge/editions/alignment.json`.

- **Semantic invariants**: Every shared claim paragraph must preserve the same eight semantic invariants established in `#95` (subjects/objects, quantities/units, comparison pairs, validity conditions/boundaries, source attribution, negation/modal strength, `待核`/`Unverified` epistemic status, and table column semantics). Where primary sources are originally in English (ISO, ILCD, PEF, GHG Protocol, IPCC, etc.), English prose verifies and cites original wording directly rather than back-translating Chinese paraphrase.
- **Edition-specific reader notes**: Both editions may introduce labeled audience-context notes (`zh-only` registered via canonical Chinese revision; `en-only` in `knowledge/editions/en/notes.json`), registered in `knowledge/editions/alignment.json`. Factual statements in edition-specific notes must carry shared evidence IDs and must not introduce substantive conclusions absent from the other edition.
- **Mutual refinement & drift control**: Chinese ambiguities or errors uncovered during English authoring are corrected in the Chinese canonical layer via the post-checkpoint revision tooling (permitted in the same PR using a structured 3-commit layout). Every English claim pins `zhDigest`; drift fails validation unless explicitly marked `pendingSync` with a visible reader notice.
- **Terminology & Chinese sources**: `knowledge/editions/en/termbase.json` records every canonical English term with `basis: official` (citing authoritative standards/glossaries) or `basis: contextual` (rationale within the monograph). Chinese standards and policy sources use official English titles where published, or contextual translations retaining the original Chinese title.
- **Epistemic status**: Passing bilingual parity, build and zero-context reader checks does not establish scientific or human expert approval. Both editions retain `scientificApproval: false` until separately certified.
