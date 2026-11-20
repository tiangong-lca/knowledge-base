---
title: B06《功能参照》跨体系比较：功能单位、参考流与可比性边界
docType: note
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - 当审读或修订 B06《功能参照》（content/docs/book/service-and-reference.mdx）的跨体系比较内容、原始 PDF 页码登记、前提链与 Goal §2.15 干净公开发布边界时
whenToUpdate:
  - 当 B06 跨体系比较的原始文献登记、比较论述、对照表或可逆守卫发生修订时
checkPaths:
  - _docs/editorial/2026-11-20-functional-reference-comparison.md
  - knowledge/research/readings.json
  - knowledge/catalog.json
  - content/docs/book/service-and-reference.mdx
  - config/reader-functional-reference-comparison.json
  - config/reader-functional-reference-comparison-capture.json
  - scripts/reader-functional-reference-comparison.mjs
  - scripts/reader-functional-reference-comparison.test.mjs
lastReviewedAt: 2026-11-20
lastReviewedCommit: d4a7e98f2ef64d0af4e02e5e18c1f542a7620219
lastReviewedNote: "Issue #173 prewriting protocol for B06 functional reference cross-system comparison from qualified main baseline d4a7e98f2ef64d0af4e02e5e18c1f542a7620219."
related:
  - _docs/editorial-protocol.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
  - _docs/publication-contract.md
  - _docs/reader-publication-contract.md
---

# B06《功能参照》跨体系比较（Unit 28 / Issue #173）

## 1. 基线与范围

- **源基线**：`tiangong-lca/knowledge-base` `main` `d4a7e98f2ef64d0af4e02e5e18c1f542a7620219`（已完成第三至第七部全部比较单元与五部整部连续回读，全书 1,106 条论述、120 节正式章二级标题）。
- **目标章**：`B06`《功能参照》（`content/docs/book/service-and-reference.mdx`），保持原 3 节二级标题（`服务要求`、`参考对象`、`比较条件`）与全部 17 条既有论述（以及全书全部 1,106 条既有论述、40/40 案例文件）逐字节不变。
- **插入位置**：在第三节`## 比较条件 [#比较条件]`内，紧接 `cl-book-comparison-more` 之后、`cl-book-three-comparisons` 之前，增补 6 条比较 `synthesis` 论述（`1,106` → `1,112`）与 1 张 4 行跨体系对照表（置于第 5、6 条新论述之间）。

## 2. 原始文献精读登记（4 份已校验 SHA-256 的公开官方 PDF）

1. **ILCD Handbook 2010（`rd-ilcd-2010`）**：`§6.4.1–6.4.7` 与 `Provisions 6.4`（`pdfIndices` 78–88，印页 59–69）——四要素（what / how much / how well / how long）、必备属性与定位属性区分、表 4 室外墙漆参考流换算（漆 A `6.5 l` 含 5 年重涂与注 39 旧漆清除条件，漆 B `3.8 l`）、非特定用途材料的声明单位（`1 kg` 钢卷，明确声明“非功能单位”），以及技术圈直接产品属性影响与生态圈干预的区分。
2. **欧盟 PEF 建议书 `(EU) 2021/2279` OJ L 471（`rd-kb44-ec2021`）**：`Annex I §3.2.1`（`pdfIndices` [27]，`L 471/225`）与 `§1.2`（`pdfIndices` [22]，`L 471/220`）——四项强制维度、寿命期内产品数量的**向上取整规则**（除非有正当理由）、未纳入功能单位的主观/非量化属性强制披露与论证、装饰漆示例（`1 m²`、`50 年`、`≥ 98%` 遮盖力）、中间产品声明单位，以及比较断言须依托 PEFCR 的门槛。
3. **GHG Protocol 产品标准 2011（`rd-pfr151-ghgp-2011`）**：`Ch. 6 §§6.1–6.3.4`（`pdfIndices` 28–32，印页 `[27]–[31]`）、`§7.3.7`（`pdfIndices` [45, 46]）与 `Appendix A Tables A.1–A.2`（`pdfIndices` [116, 117]）——上位概念**分析单位（`unit of analysis`）**、最终产品以功能单位为分析单位而中间产品直接以参考流为分析单位（不使用“声明单位”一词）、摇篮到大门边界披露，以及明确声明本标准“按现状不支持 ISO 14044 比较断言”。
4. **ecoinvent v3 数据质量导则 2013（`rd-dapp147-ecoinvent-v3-2013`）**：`Ch. 3`（`pdfIndices` [15]）、`§4.1.2`（`pdfIndices` [18, 19, 20]）、`§14.1–14.3`（`pdfIndices` [117, 118, 119]）与 `Glossary`（`pdfIndices` [160]）——活动层的**参考产品（`reference product` = 决定性产品 `determining product`）**界定、废物处理活动的负参考产品表示法，以及数据库活动层与研究层功能单位的分工边界。

## 3. 概念主线与核心分歧

1. **共同核心**：四大体系均承认比较不同产品方案必须先固定可核对的服务基准与交付量，并区分“服务要求”与“实现服务所需的物理产品量”。
2. **三项真实分歧**：
   - **参照层级分工**：ILCD、PEF 与 GHG Protocol 在研究层定义功能单位与参考流；ecoinvent v3 则在单元过程活动层定义决定性参考产品（含处理服务的负参考产品），将服务等价判断留给下游研究。
   - **中间产品命名与边界**：ILCD（`§6.4.6` / `Provisions VII.a`）与 PEF（`Annex I §3.2.1`）对用途未定的中间产品使用“声明单位”（且 ILCD 明言其不是功能单位），而 GHG Protocol（`§6.2`）直接以“参考流”充当分析单位并允许摇篮到大门披露。
   - **换算规则、非功能属性与比较断言门槛**：PEF 强制寿命产品数向上取整、强制披露未涵盖属性并要求比较断言依托 PEFCR；ILCD 以必备/定位属性与寿命重涂表 4（`6.5 l` vs `3.8 l`）分离服务要求与市场定位；GHG Protocol 则明确按现状仅支持同产品纵向绩效追踪、不支持 ISO 14044 跨产品比较断言。
3. **证据与认识边界**：现有公开标准文本无法代替具体产品的实测服役寿命、用户行为与替代等效证据；付费 ISO 14040/14044 原文条款不作逐句转引。

## 4. 守恒与验证计划

- 守恒全部 `1,106` 条既有论述、`3` 节 `B06` 二级标题（全书 `120` 节）、`0` `caseBinding` 改动、`40/40` 案例下载包、`content/docs/functional-unit.mdx`、`package.json` 与 `pnpm-lock.yaml`。
- 安装可逆守卫 `scripts/reader-functional-reference-comparison.mjs` & `.test.mjs`（固定基线 `d4a7e98f2ef64d0af4e02e5e18c1f542a7620219`），通过 Goal §2.15 干净公开发布门禁（`/changes/` 自动聚合 36 轮迭代）、三路独立审查（`0 BLOCKER / 0 MAJOR`）、Playwright QA、全量单测、Docpact 严审、干净构建、PR/CI/合并、线上 468 文件核验与根集成闭环。
