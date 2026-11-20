---
title: Whole-Book Continuous Reread Protocol (Unit 33 / #183)
docType: editorial-record
scope: knowledge-base
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when executing or auditing Unit 33 (Whole-Book Continuous Reread across F02, Part IV introduction, global non-caseBinding premiseIds DAG hygiene, and whole-book terminology/typo unification)
whenToUpdate:
  - when Unit 33 scope, verified findings, or final acceptance evidence changes
checkPaths:
  - _docs/editorial/2026-11-20-whole-book-continuous-reread.md
lastReviewedAt: 2026-11-20
lastReviewedCommit: 4b9c3958f316693f85e0bab789400a8215b19ca9
lastReviewedNote: "Prewriting protocol for Unit 33 (#183) anchored to qualified main baseline 4b9c3958f316693f85e0bab789400a8215b19ca9 after completing all seven Parts (Parts I–VII)."
related:
  - _docs/book-execution.md
  - _docs/publication-contract.md
  - _docs/reader-publication-contract.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
  - _docs/editorial/2026-11-15-comparative-continuation.md
  - _docs/editorial/2026-11-19-clean-public-delivery.md
---

# 全书连续回读前置方案（Unit 33 / `#183`）

## 1. 基线与目标

- **受检基线（`main`）**：`4b9c3958f316693f85e0bab789400a8215b19ca9`（Unit 32 第一部整部连续回读完成态，线上 `https://prism.tiangong.earth` 全部 `468` 文件已通过字节审计与归档源码 `validateReaderOutput` 守卫校验，至此全书七部均已完成部级连续回读）。
- **本单元目标**：基于全书只读预审计（`596d5a48`），以最小外科手术式改动完成**全书连续回读**的跨部收口，使导论、七部导言、全局非 `caseBinding` 前提有向无环图（DAG）以及全书核心术语（`表征`、`题页`）达到统一与一致，并完整记录全书现行范围、未解文献边界与人工专家签收门槛（`scientificApproval: false`）。
- **硬性守恒边界**：
  - 论述总数严格守恒为 **`1,124`** 条（`0` 新增、`0` 删除、`0` 重排）；
  - 正式章节二级标题严格守恒为 **`120`** 个（`0` 新增、`0` 删除）；
  - 全部 **`242`** 条 `caseBinding: true` 论述（`0` 改动）与全部 **`40/40`** 公开算例下载（`knowledge/cases/`）字节不变；
  - `content/docs/book/index.mdx`（`F02`）保持 `0` 段落拆分（`part4-133-ordinary-0..9` 索引零偏移）；
  - 严格执行 Goal §2.15 洁净公开交付（`/docs/book/**` 与 `/print/` 零开发过程控件，`/changes/` 自动汇总全部版本迭代、部首导言修订与具名勘误且无内部工程标识符）与编译 CSS 零漂移（`7f71d0b6fbfcf1b52d079c3df0f927ad7ad2ec1252344dd5c871d2b82ddffef5`）。

## 2. 精确改动范围

### 2.1 `F02` 导论与第四部导言对齐

1. **`content/docs/book/index.mdx` 第 18 行（`part4-133-ordinary-5`）**：
   - 原句仅链接了`[中点与终点](/docs/book/midpoint-endpoint-value-choices/)`，其余六章未加链接且使用非精确章名。
   - 本次原位更新（`0` 段落拆分），补齐第四部全部 7 篇网页章节的精确链接与章名：`[中点与终点](/docs/book/midpoint-endpoint-value-choices/)`、`[气候响应与当量](/docs/book/climate-response-and-metrics/)`、`[排放时间与评价](/docs/book/emission-time-and-assessment/)`、`[酸化与营养富集](/docs/book/acidification-and-nutrient-pathways/)`、`[颗粒物排放与健康损害](/docs/book/particulate-emissions-and-health/)`、`[耗水与缺水潜势](/docs/book/water-scarcity-and-reference/)`与`[毒性路径](/docs/book/usetox-pathways-and-boundaries/)`，解决 Programme `#9` 登记的第四部链接对齐遗留项。
2. **`config/reader-numbering.json` `parts[3].introduction`（第四部《环境后果》）**：
   - 原导言早于第四部跨体系扩写，未显式列出第四部已完成的跨方法体系对照轴线。
   - 本次升级为与第一至三、五至七部同等深度的部首导言，明确点出 `ReCiPe 2016`、`EF 3.1`、`GLAM`、`IPCC AR6`、`AWARE` 与 `USEtox` 在中点/终点截点、气候时间尺度与生物碳、土地恢复与矿产/化石资源、酸化/富营养化、光化学臭氧/平流层臭氧/电离辐射、颗粒物健康损害、耗水缺水与多介质毒性上的机制比较与证据边界，并自然引出第五部《尺度与取舍》。

### 2.2 全局非 `caseBinding` 论述 `premiseIds` DAG 规整（`knowledge/catalog.json`）

1. **消除书籍视图剩余 3 处非 `caseBinding` 跨章/章内前向 `premiseIds`**：
   - `cl-pm-effect-definition`（B17）：移除指向后文 `cl-pm-effect-baseline` 的前向前提，改为指向前置颗粒物路径前提 `cl-pm-question`。
   - `cl-climate-comparison-criteria`（B15）：移除指向第七部 `B29` 的跨部前向前提 `cl-wall-tolerance`，保留严格前置的 `cl-power-future-gases`、`cl-power-future-gases-total`。
   - `cl-water125-diagnostic-synthesis`（B18）：移除指向 `B19` 的跨章前向前提 `cl-tox123-speciation-and-proxies`，保留严格前置的 B18 前提并按书籍顺序排列。
2. **规整书籍视图剩余 39 处非 `caseBinding` 非升序 `premiseIds` 数组**：
   - 将第一部 2 条（`cl-hist-what-closed`、`cl-cml-screening-range-limit`）与第四部 37 条非 `caseBinding` 论述的 `premiseIds` 按全书阅读顺序（含附录 `X01`–`X04` 相对顺序）严格升序排列，使全书全部 `882` 条非 `caseBinding` 论述实现书籍视图 **`0` 跨章前向引用、`0` 非升序前提、`0` 环、`0` 悬空**（242 条 `caseBinding: true` 论述保持零改动）。

### 2.3 全书核心术语与残留异体词统一

1. **5 条非 `caseBinding` 论述中无意漂移的 `特征化` → `表征`（均在 `/changes/` 登记为具名修订）**：
   - `cl-fw179-impact-weighting`（B04）：`多类别特征化` → `多类别表征`；
   - `cl-soc139-cross-pillar-overlap-audit`（B23）：`人体毒性特征化因子` → `人体毒性表征因子`；
   - `cl-lcc143-three-lcc-archetypes-and-value-added-consolidation`（B24）：`特征化影响评价阶段` → `表征影响评价阶段`；
   - `cl-dapp147-package-migration-inheritance-and-surveillance`（B25）：`特征化因子` → `表征因子`；
   - `cl-unc149-gsa-outliers-nonlinearity`（B26）：`非线性特征化关系` → `非线性表征关系`。
   - **刻意保留**：`B21` 中 3 条明确作中英文或国家标准术语对照的论述（`cl-regional-localization-not-translation`、`cl-loc137-ef31-location-regimes`、`cl-loc137-institutional-adoption-vs-compliance`）保留“特征化”对照说明。
2. **4 份 MDX 对照表格中 5 处 `特征化` → `表征`**：
   - `content/docs/book/framework-history.mdx:48` 与 `content/monograph/framework-responsibilities.mdx:52`：`匹配特征化与可选归一化/加权` → `匹配表征与可选归一化/加权`；
   - `content/docs/book/product-footprint-rules-and-practice.mdx:14`：`单一气候变化特征化结果` → `单一气候变化表征结果`；
   - `content/docs/book/uncertainty-and-variability.mdx:19, 33`：`特征化与赋权约定` → `表征与赋权约定`、`非线性特征化效应` → `非线性表征效应`。
3. **2 条历史书目证据定位词 `题叶` → `题页`（`knowledge/catalog.json` `evidence` 数组）**：
   - `ev-cml-1992-part1-identity`（2 处）与 `ev-kb52-cml1992-backgrounds-identity`（2 处），使全书正文与章末注均零残留 `题叶`。

## 3. 范围界限与未解边界

- 本单元完成全书 32 章（37 篇网页章节）+ 4 篇附录在现行公开版内的连续回读与工程出版收口，**不**替代人类领域专家同行评议或真实学习效果实证检验（`scientificApproval: false`、`humanExpertApproval: false` 持续生效）。
- 受版权墙或未获取原件限制的历史与方法边界（如 ISO 14040/14044 收费正文、SETAC 原始纸本、Pomponi/Lenzen 2006 Comment/Reply、LIME 微观数据光盘、部分区域实证边际电网与购物袋复用调查数据）在原位置继续如实标明未知与适用边界，不予臆测补全。
