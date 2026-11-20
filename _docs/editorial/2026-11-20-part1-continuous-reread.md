---
title: Part I Whole-Part Continuous Reread Prewriting Protocol
docType: editorial-plan
scope: knowledge-base
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or reviewing Unit 32 (Part I whole-part continuous reread, #181)
whenToUpdate:
  - when Unit 32 scope, named corrections, or Part I premise-DAG constraints change
checkPaths:
  - _docs/editorial/2026-11-20-part1-continuous-reread.md
  - config/reader-numbering.json
  - content/docs/book/index.mdx
  - knowledge/catalog.json
lastReviewedAt: 2026-11-20
lastReviewedCommit: 50e045f012090813d3b90f543b65fbb2c24b1d8f
related:
  - AGENTS.md
  - _docs/book-execution.md
  - _docs/publication-contract.md
  - _docs/reader-publication-contract.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
  - _docs/editorial/2026-11-15-comparative-continuation.md
---

# Unit 32 前置撰写方案：第一部《问题的来源》整部连续回读（`#181`）

## 1. 基线与守恒约束

- **源基线提交**：`50e045f012090813d3b90f543b65fbb2c24b1d8f`（Unit 31 `B04` 跨体系评价框架对照合并后 `main`）。
- **守恒不变量**：
  - 全书论述总数严格守恒在 **`1,124`** 条（`0` 新增、`0` 删除）；
  - 正式章 `B01`–`B32` 二级标题总数严格守恒在 **`120`** 节（`0` 新增 H2）；
  - 第一部全部 **`13`** 条 `caseBinding` 论述（`B02` 7 条、`B04` 6 条）及全书 **`242`** 条 `caseBinding`、`40/40` 案例下载逐字节不变；
  - `F02`（`content/docs/book/index.mdx`）第 11 行（`part4-133-ordinary-2`）原段内更新，`0` 段落拆分；
  - Goal §2.15 干净公开发布：正文与 `/print/` 零内联过程控件，全部迭代信息、具名更正与部首引言变更自动汇聚于 `/changes/`，编译 CSS 零漂移（`7f71d0b6...`）。

## 2. 本单元具体改动范围

1. **第一部部首引言（`config/reader-numbering.json` `parts[0].introduction`）**：
   - 升级第一部《问题的来源》引言，完整涵盖 `B01`《生命周期视角》、《饮料容器账本》、《容器比较与政策判断》、《评价框架与分析步骤》（含 `CML 2001/2002`、`ILCD 2010`、欧盟 `PEF 2021` 与 `GHG Protocol 2011` 跨体系对照）及《清洁生产中的生命周期评价》，并自然衔接第二部《服务与清单》（功能单位、声明单位、参考流与可比性门槛）。
2. **全书目录总览第一部概述段（`content/docs/book/index.mdx` 第 11 行，`part4-133-ordinary-2`）**：
   - 在原段内补齐第一部全部章节链接（`生命周期视角`、`饮料容器账本`、`容器比较与政策判断`、`评价框架的形成`、`CML指南中的评价与改进`、`清洁生产中的生命周期评价`），同步跨体系评价框架对照深度，保持段落索引零偏移。
3. **非 `caseBinding` 具名更正（`knowledge/catalog.json`，2 条）**：
   - `cl-cml-edition`（`B04`）：将 `本文` 统一为 `本章`，将两处异体词 `题叶` 修正为规范词 `题页`。
   - `cl-regional-sun-development-agenda`（`B05` 尾条）：收紧第一部至第二部的结尾衔接，明确引出第二部《功能参照》中功能单位、声明单位、参考流与可比性门槛的跨体系辨析。
4. **第一部非 `caseBinding` 前提依赖有向无环图清理（`knowledge/catalog.json`，9 条）**：
   - 消除 `cl-book-integrative-function`、`cl-hist-two-reuse-choices`、`cl-framework-work-before-boxes`、`cl-book-framework-records`、`cl-book-framework-method`、`cl-cml-response-scale`、`cl-framework-design-sideeffects`、`cl-framework-reader-work-product` 与 `cl-cml-decision-procedure` 中的全部前向引用、跨章前向引用及乱序前提，确保第一部全部 104 条非 `caseBinding` 论述在合订本（`B01`–`B05`）与网页视图（`B04-web1`/`B04-web2`）下均严格满足单调先序。

## 3. 范围边界

- 本单元仅完成第一部（`B01`–`B05`）整部连续回读，标志全书七部（第一部至第七部）全部完成分部级回读；全书最终整本连续回读（`F01`/`F02`/`X01`–`X04` 与跨部一致性终核）及 `Programme #9` 八项全局完成条件仍保持未勾选（`scientificApproval: false`）。
