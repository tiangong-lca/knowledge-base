---
title: 第三部整部连续回读：负担分配与供给变化（B10–B13、M02 与 F02）
docType: note
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - 当审读第三部《负担分配与供给变化》（B10–B13、W11–W12、M02 与 F02 第三部概览）的整部连续性、跨章衔接、前提链顺序、术语统一与 Goal §2.15 干净公开发布边界时
whenToUpdate:
  - 当第三部整部连续回读的边界、更正台账、前提链修复或发布守卫发生修订时
checkPaths:
  - _docs/editorial/2026-11-20-part3-continuous-reread.md
  - knowledge/catalog.json
  - content/monograph/joint-production.mdx
  - content/docs/allocation.mdx
  - content/docs/book/index.mdx
  - config/reader-numbering.json
  - config/reader-part3-reread.json
  - config/reader-part3-reread-capture.json
  - scripts/reader-part3-reread.mjs
  - scripts/reader-part3-reread.test.mjs
lastReviewedAt: 2026-11-20
lastReviewedCommit: f6d1eca5190bb2afaade08549c59405b48e026cc
lastReviewedNote: "Issue #171 prewriting protocol for Part III whole-part continuous reread from qualified main baseline f6d1eca5190bb2afaade08549c59405b48e026cc."
related:
  - _docs/editorial-protocol.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
  - _docs/publication-contract.md
  - _docs/reader-publication-contract.md
---

# 第三部整部连续回读（Unit 27 / Issue #171）

## 1. 基线与范围

- **源基线**：`tiangong-lca/knowledge-base` `main` `f6d1eca5190bb2afaade08549c59405b48e026cc`（已完成单元 26 `B11`《市场响应》跨体系比较与线上 `468/468` 文件真实托管核验）。
- **回读范围**：第三部《负担分配与供给变化》全部四章及其双视图与导航表面：
  - `B10`（`content/monograph/joint-production.mdx`）及其网页拆分双页 `W11`（`content/docs/book/allocation-and-substitution.mdx`）与 `W12`（`content/docs/book/allocation-judgment-and-corrections.mdx`）；
  - `B11`（`content/docs/book/market-boundaries-and-response.mdx`）；
  - `B12`（`content/docs/book/electricity-service-and-response.mdx`）；
  - `B13`（`content/docs/book/recycling-chains-and-accounting.mdx`）；
  - `M02`（`content/docs/allocation.mdx`）、`parts[2].introduction`（`config/reader-numbering.json`）及 `F02`（`content/docs/book/index.mdx`）第三部概览。

## 2. 守恒边界与非目标

1. **论述总数守恒**：保持全书 `1,106` 条规范论述不变，不新增、不删除论述。
2. **`caseBinding` 零改动与案例下载包逐字节守恒**：第三部 60 条 `caseBinding` 论述及 `knowledge/cases/` 下 40 份公开案例文件保持逐字节不变（14 条 `caseBinding` 论述的 `premiseIds` 按第六、七部回读先例予以跳过，确保 `case-publication` 深相等校验零漂移）。
3. **二级标题天花板守恒**：全书正式章二级标题保持精确 `120` 节，不新增任何 H2。
4. **Goal §2.15 干净公开发布与 CSS 零漂移**：正文与打印版零过程控件，全部具名更正与部级导言修订自动聚合于 `/changes/`，编译 CSS 保持 `7f71d0b6fbfcf1b52d079c3df0f927ad7ad2ec1252344dd5c871d2b82ddffef5` 零漂移。
5. **非目标**：不改动 `package.json`、`pnpm-lock.yaml`、第一至第二部章节或 Programme #9 八项全局未完成勾选框。

## 3. 具体修订清单

1. **跨章衔接与链接修复**：
   - `B10`（`content/monograph/joint-production.mdx:24`）：将裸打印锚点 `#print-unit-2f646f63732f626f6f6b2f6d61726b65742d626f756e6461726965732d616e642d726573706f6e7365` 修正为规范双视图路径 `/docs/book/market-boundaries-and-response/`。
   - `M02`（`content/docs/allocation.mdx:40`）：补全 `W11` 与 `W12` 拆分双页及 `B11`–`B13` 的完整第三部导览链接。
   - `B11` 末条 `cl-market-closing`（`B11[39]`，非 `caseBinding`）：以具名更正方式并入 `#169` 新增的 ILCD / ecoinvent 第三版后果模型 / 欧盟 PEF / GHG Protocol 跨体系比较收束句，并将 `cl-mkt169-epistemic-limits` 纳入其升序 `premiseIds`。
   - `B13` 末条 `cl-cff109-judgment`（`B13[42]`，非 `caseBinding`）：以具名更正方式补齐向第四部（`B14`《中点与终点》）的连续过渡句。
2. **前提链（`premiseIds`）严格升序修复（15 条非 `caseBinding` 论述）**：
   - 修复 `B10`（5 条：`cl-allocation-alternative-supply`、`cl-allocation-three-responsibilities` 去前向引用、`cl-allocation-1998-sales-criterion`、`cl-sub105-fallbacks`、`cl-allocation-reading-a-rule`）、`B11`（1 条：`cl-market-closing`）、`B12`（2 条：`cl-shift107-complete-action` 去前向引用、`cl-shift107-comparison-judgment` 去前向引用并排序）、`B13`（7 条：`cl-cycle-opening` 去 3 处前向引用、`cl-cycle-substitution-chain` 去前向引用、`cl-cycle-substitution-point`、`cl-cycle-performance-question`、`cl-cff109-question`、`cl-cff109-control`、`cl-cycle-conclusion`），实现第三部全部 137 条非 `caseBinding` 论述 `0` 前向引用、`0` 逆序。
3. **`scope` 汉化与术语统一（非 `caseBinding`）**：
   - `B10[3]` `cl-allocation-causal-directions`：将纯英文 `scope` 汉化为准确中文范围说明。
   - `B10[4]`、`B10[5]`、`B10[37]`：统一 `cascade` → `级联`、`whole-system` → `全系统`、`Situation A` → `情境 A`、`平均消费混合` → `平均消费组合`。
4. **部级导言与全书目录对齐（`parts[2].introduction` 与 `F02`）**：
   - 升级 `config/reader-numbering.json` 中 `parts[2].introduction`，使其与第四至第七部导言具备同等的概念与跨体系精度，按 `共同生产 → 市场响应 → 供电系统 → 材料循环` 顺序展开，并清晰衔接第四部。
   - 在 `content/docs/book/index.mdx`（`F02`）中将第三部从第二部段落独立分节，按章序给出完整链接。

## 4. 审查与验证计划

- 安装可逆守卫 `scripts/reader-part3-reread.mjs` 与 `scripts/reader-part3-reread.test.mjs`（固定基线 `f6d1eca5190bb2afaade08549c59405b48e026cc`），接入主机模块与既有下游测试，并在 `/changes/` 自动汇总（35 轮迭代）。
- 完成三路独立审查（来源/前提链/更正核查、零上下文第三部整部读者回读、对抗性出版工程与 Goal §2.15 门禁审计），要求 `0 BLOCKER / 0 MAJOR`。
- 执行隔离技术导出 + Goal §2.15 门禁 + 浏览器 QA + 密码学签收 + `pnpm validate` + `tsc --noEmit` + 全量单测 + 严格 Docpact + 干净生产构建 + PR/CI/合并 + 线上 468 文件核验 + 根集成闭环。
