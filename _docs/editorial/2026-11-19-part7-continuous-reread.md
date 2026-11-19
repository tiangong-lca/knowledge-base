---
title: Part VII Whole-Part Continuous Reread Prewriting Protocol
docType: editorial-protocol
scope: knowledge-base
status: active
authoritative: false
owner: knowledge-base
language: zh
lastReviewedAt: 2026-11-19
lastReviewedCommit: a55c9fb3909130cdc0165cc1e417f2412523c72c
---

# 第七部《比较与判断》整部连续回读写前协议（Unit 25）

- **所属任务**：[tiangong-lca/knowledge-base#165](https://github.com/tiangong-lca/knowledge-base/issues/165)（总协调 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)）
- **合格基线**：`a55c9fb3909130cdc0165cc1e417f2412523c72c`（tree `6d8aa2f3302daaba2ba718b57f9324d706883477`；公开托管 manifest `7b210c6f9d3c6b3a05ae5b3ba94aa949d63adbafcc9a72364a1827f884ff0976`）
- **守恒约束**：
  - 100% 守恒全部 `1,099` 条既有论述身份（零新增、零删除）；
  - 严格保持 `W1 ∪ W2 = B32`（`W1 ∩ W2 = ∅`，10 + 19 = 29）、`40/40` 份案例下载、`106` 条末章历史引文义务、全部冻结节标题及编译 CSS 零漂移（`be180e5d...`）；
  - 全部改动均配具名更正说明（`part7RereadCorrections`）与部首历史披露（`print-part-7`）。

## 本次整部回读修订清单

1. **全书导论（`content/docs/book/index.mdx`，`F02`）与第七部导言（`config/reader-numbering.json` `parts[6].introduction`）同步**：
   - 修复 `F02` L22 漏字 `[未来技术情景]` → `[未来技术与情景]`；
   - 更新 `F02` L32 第七部概览与 L36 末章概览，使之准确涵盖 `B29`（ILCD / PEF / GHG Protocol 比较断言与成对不确定性）、`B30`（英国环境署 2011 与丹麦环保署 2018 对照、ILCD / PEF 热点与关键性审查）、`B31`（前瞻性／事前／动态 LCA、工艺放大、超结构情景耦合与动态时间边界）及 `B32`／`W1`+`W2`（全书综合与 5×7 修订路由表）；
   - 同步升级 `config/reader-numbering.json` `parts[6].introduction`（第七部《比较与判断》部首导言）。
2. **章间过渡补齐（`B31 -> B32`）**：
   - 在 `content/docs/book/future-technology-and-context.mdx`（`B31`）表末补入 1 段简洁过渡句，自然承接末章《可修订的判断》（网页双篇《服务、系统与时间》《判断依据与修订》）。
3. **跨章术语、章号与书名统一（`B30`、`B31`、`W2`、`B32`、`knowledge/catalog.json`）**：
   - 统一 `B31` 既有论述中阿拉伯章号：`cl-future-incumbent` `第 29 章` → `第二十九章`，`cl-future-impact-limits` `第 15 章` → `第十五章`；
   - 修正 `B32` & `W2` 5×7 修订路由表第 6 行误引书名：`变异与不确定度` → `变异与不确定性`；
   - 统一第七部新增论述与对照表术语：`特征化*` → `表征*`、`比较性断言` → `比较断言`、`敏感度` → `灵敏度`（覆盖 `cl-fut161-*`、`cl-rev163-*` 及 `B31`/`W2`/`B32` 对照表）；
   - 统一 `B30` 对照表第 4 行欧盟建议书全称：`欧盟委员会建议书 (EU) 2021/2279（产品环境足迹 PEF，公报 OJ L 144 附件一第 6—8 节）`。
4. **第七部前提依赖图升序规范化**：
   - 将 `B30`、`B31`、`B32` 中 22 条论述的 `premiseIds` 严格按全书出现顺序升序排列，并在 `scripts/reader-part7-reread.mjs` 内强制执行 `assertPart7PremiseDagAndAscending`（零前向引用、零自环、零逆序前提）及三项第七部因子守卫回归校验。

## 验收与审查边界

- 独立三路审查（一手与前提依赖图审计、零上下文第七部整部通读审稿、对抗性出版工程审计）须全部达到无条件 `PASS`（`0 BLOCKER / 0 MAJOR / 0 MINOR`）；
- 本单元完成第七部整部回读，不等于全书完成；全书连续回读及 `Programme #9` 全部 8 项全局验收继续保持未勾选。
