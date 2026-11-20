---
title: B04 Cross-System Evaluation Framework Comparison Prewriting Protocol
docType: editorial-plan
scope: knowledge-base
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or reviewing Unit 31 (B04 cross-system evaluation framework comparison, #179)
whenToUpdate:
  - when Unit 31 scope, primary-source passages, or comparison boundaries change
checkPaths:
  - _docs/editorial/2026-11-20-b04-framework-comparison.md
  - knowledge/catalog.json
  - knowledge/research/readings.json
  - content/monograph/framework-responsibilities.mdx
  - content/docs/book/framework-history.mdx
lastReviewedAt: 2026-11-20
lastReviewedCommit: d4c9993b2ec2e395bba7a86ac6cb7213feccb183
related:
  - AGENTS.md
  - _docs/book-execution.md
  - _docs/publication-contract.md
  - _docs/reader-publication-contract.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
  - _docs/editorial/2026-11-15-comparative-continuation.md
---

# Unit 31 前置撰写方案：`B04`《评价框架与分析步骤》跨体系框架对照（`#179`）

## 1. 范围与基线

- **源基线提交**：`d4c9993b2ec2e395bba7a86ac6cb7213feccb183`（Unit 30 第二部全部分回读合并后 `main`）。
- **核心问题**：既有 `B04`《评价框架与分析步骤》（网页拆分 `framework-history.mdx` 与 `cml-computation-judgment-and-improvement.mdx`）系统梳理了 1990–2006 年间 EPA、UNEP 与 CML 指南的框架形成史，但尚未对照当代主流操作性框架——**CML 2001/2002**、**ILCD 2010**、**EU PEF 2021（`2021/2279` 附件一）** 与 **GHG Protocol 产品标准 2011**——在阶段组织、决策情景与比较断言门槛、影响类别与加权规则、以及解释与审验治理上的共同核心与真实分歧。
- **结构守恒约束**：
  - **0 新增 H2**：正式章 `B01`–`B32` 维持严格 `120` 节上限；新增 6 条综合论述（`1,118` → `1,124`）与 1 张 4 体系结构化对照表对称放置于 `content/monograph/framework-responsibilities.mdx`（`## 改进与解释` 末尾、`cl-framework-reader-work-product` 之后）与 `content/docs/book/framework-history.mdx`（`## 分析任务的变化` 末尾、`cl-framework-reader-work-product` 之后）。
  - **0 `caseBinding` 改动**：`B04` 既有 6 条 `caseBinding` 论述（`cl-cml-toy-records`、`cl-cml-toy-balance`、`cl-cml-toy-waste`、`cl-cml-toy-dominance`、`cl-cml-solvent-bins`、`cl-cml-methane-counter`）及全书 242 条 `caseBinding` 与 40/40 案例下载保持逐字节不变。
  - **Goal §2.15 干净公开发布**：正文与 `/print/` 零内联过程控件，全部迭代信息自动汇聚于 `/changes/`，编译 CSS 零漂移（`7f71d0b6...`）。

## 2. 已核验一手公开 PDF 载体与精确 0-based `pdfIndices`

1. **CML 2001/2002 操作指南（`rd-cml-2001-part2a`，`cml01-operation.pdf`，SHA-256 `caf3c98f...`）**
   - `idx=2, 3`（pp. 3–4）：沿 ISO 框架划分为 4 个阶段（目标与范围定义、清单分析、影响评价、解释）并增设项目程序管理章（共 5 章），区分简化级、详细基线级与可选扩展级。
   - `idx=47, 48, 74, 76, 77, 79`（pp. 48–49, 75, 77–78, 80）：中点问题导向基线；归一化强推荐、分组与加权为可选且无基线法；转述 ISO 14042 不允许对公开披露的比较断言使用加权；解释阶段围绕完备性、敏感性与一致性检查形成结论。
2. **ILCD 2010 详细指南（`rd-ilcd-2010`，`ilcd-2010.pdf`，SHA-256 `7de4b912...`）**
   - `idx=22`（§1，p. 3）与 `idx=44`（§4 Figure 4，p. 25）：四阶段迭代回路（由完备性、敏感性与一致性检查驱动多轮精化），并按决策情景划分为 **Situation A**（微观决策支持，无结构性产能变化）、**Situation B**（中/宏观决策支持，引发结构性产能变化）与 **Situation C**（纯描述性核算，含 **C1** 计入既有外部收益与 **C2** 不计入外部收益）。
   - `idx=340, 341`（§11，pp. 321–322）：审验（critical review）核查方法与 ILCD/ISO 14040–14044 一致性、科学技术有效性、数据适宜性与局限性披露；细则文档当时尚在编制中，在此之前以 ISO 14040/14044 要求为最低底线。
3. **EU PEF 2021（`rd-kb44-ec2021`，`eu-2021-2279-pef.pdf`，OJ L 471，SHA-256 `af28de08...`）**
   - `idx=12, 22`（定义与 §2）：区分一般比较（comparison）与比较断言（comparative assertion），规定比较与比较断言仅在遵循对应 **PEFCR** 时允许。
   - `idx=28, 29, 30, 84, 85`（§3.2 Table 2，§5.1–5.2）：强制采用全部 **16** 项 EF 影响类别（不得排除），并在分类与表征后强制执行归一化与加权（可汇总为单一总分并报告含/不含使用阶段结果）。
   - `idx=93`（§8.1）：凡用于任何形式对外沟通的 PEF 研究，均强制执行独立核查与验证（verification and validation）。
4. **GHG Protocol 产品标准 2011（`rd-pfr151-ghgp-2011`，`ghg-protocol-product-2011.pdf`，SHA-256 `fdc21b79...`）**
   - `idx=7, 14, 24, 94, 116`（§1.5、§3.1 Figure 3.1、§5.3.2、§12.1–12.2、Appendix A）：面向企业单一气候（GHG）核算与纵向减排追踪的流程（商业目标、原则、范围、边界、数据采集与质量、分配、不确定性、结果计算、鉴证、报告与减排目标）；明确不支持 ISO 14044 意义上的跨产品整体环境优劣比较断言（产品对比需额外产品规则）；公开发布要求第一方或第三方鉴证（first or third party assurance）。

## 3. 付费原文与未获取史料边界

- **ISO 14040:2006 / ISO 14044:2006**：仓库仅核验公开预览范围与定义页，未获取付费全文条款；本章跨体系对照严格限于上述 4 份已核验公开原文，涉及 ISO 处仅限公开定义或明确标明经由上述公开指南转述，不得补造付费内部条款。
- **SETAC 1991/1993 原始会议文本**：仍属未获取史料边界，不在本单元补造。

## 4. 计划新增论述（6 条 `synthesis` 论述 + 1 张对照表）

1. `cl-fw179-shared-phases`：共同框架核心（四阶段/迭代回路与从目标定义反推清单与解释边界的共同逻辑）。
2. `cl-fw179-decision-gates`：决策情景与比较断言门槛分歧（ILCD Situation A/B/C1/C2 vs. EU PEF 强制 PEFCR 门槛 vs. GHG Protocol 明确不支持比较断言）。
3. `cl-fw179-impact-weighting`：影响类别与加权规则分歧（CML 2001/ILCD 多类别、加权可选且对公开比较断言受限 vs. EU PEF 强制 16 项 EF 类别并强制归一化与加权 vs. GHG Protocol 单一 GHG 核算）。
4. `cl-fw179-review-assurance`：解释检查、审验与鉴证治理分歧（CML/ILCD 内部三项检查与审验底线 vs. EU PEF 对外沟通强制独立核查验证 vs. GHG Protocol 第一方或第三方鉴证）。
5. `cl-fw179-method-choice-effects`：框架选择如何实质改变结论与可比性（同一产品在不同框架下能否作跨产品声明、是否必须输出单一加权总分及数据/审验成本差异）。
6. `cl-fw179-epistemic-limits`：证据边界与未知（ISO 14040/14044 付费全文边界、SETAC 原始文本边界、以及框架合规本身不能替代真实排放数据与因果验证）。
