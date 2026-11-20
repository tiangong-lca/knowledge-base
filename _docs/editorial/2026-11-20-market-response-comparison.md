---
title: B11 Market Response Cross-System Comparison Protocol (#169)
docType: editorial-record
scope: knowledge-base
status: active
authoritative: false
owner: knowledge-base
language: zh
whenToUse:
  - when implementing, reviewing, or verifying Unit 26 (B11《市场响应》跨体系比较单元, #169)
whenToUpdate:
  - when scope, primary-source passages, or review dispositions for #169 change
checkPaths:
  - _docs/editorial/2026-11-20-market-response-comparison.md
  - content/docs/book/market-boundaries-and-response.mdx
  - config/reader-market-response-comparison.json
  - scripts/reader-market-response-comparison.mjs
lastReviewedAt: 2026-11-20
lastReviewedCommit: 8949778f8a2cc9a78c3bff879c6686026c6e1857
related:
  - _docs/lca-book-goal.md
  - _docs/book-execution.md
  - _docs/reader-publication-contract.md
  - _docs/editorial/concept-led-comparison.md
  - _docs/editorial/readable-writing-and-teaching.md
---

# Unit 26 Prewriting Protocol: `B11`《市场响应》跨体系比较单元（`#169`）

- **Issue**: `https://github.com/tiangong-lca/knowledge-base/issues/169`
- **Baseline (`main`)**: `8949778f8a2cc9a78c3bff879c6686026c6e1857` (post-`#165` Part VII continuous reread & `#166` Goal §2.15 Clean Public Delivery)
- **Branch**: `codex/market-response-169`
- **Target Chapter**: `B11`《市场响应》（`content/docs/book/market-boundaries-and-response.mdx`）

## 1. 共同比较问题与结构约束

`B11` 现有 4 个二级节（`## 响应对象`、`## 市场边界`、`## 平均组合`、`## 条件供给`）与 32 条规范论述（`cl-market-*`），全书正式章内节数为 `120`（恰达 Goal §2.9 `<= 120` 上限）。本单元严格遵守以下边界：

1. **零新增二级节**：完整保留 `B11` 原有 4 个 H2 节标题，全书正式章内节数维持 `120`。
2. **零改动旧论述与案例**：完整守恒全部 `1,099` 条既有规范论述（含 `B11` 既有 32 条 `cl-market-*`）与 `40/40` 公开案例下载文件。
3. **新增 7 条规范比较段落 + 1 张五体系对照表**：置于 `B11` 第四节《条件供给》末尾、`<ReaderSection id="从条件演算回到市场证据" />` 之后的 `cl-market-closing` 之前（`B11` 从 `32` → `39` 条，全书目录从 `1,099` → `1,106` 条），围绕同一组核心概念问题——**干预尺度、市场约束判别、边际/平均/合同电力与供应组合、需求变化下的共产品替代**——系统比较五大体系的共同点、条件对应、真实分歧、排序翻转条件与未知边界。
4. **遵循 Goal §2.15 清洁交付（`#166`）**：默认生产构建在 `/docs/book/**` 与 `/print/` 零开发过程控件；本单元元数据与历史记录自动聚合至 `/changes/` 公开账本。

## 2. 四份官方公开 PDF 定点细读清单（SHA-256 与 `readings.json` 逐字节一致）

| 体系与阅读记录 | 官方 PDF 载体与 SHA-256 | 本轮新增定点细读定位 | 核验核心条款与数字 |
| --- | --- | --- | --- |
| **ILCD Handbook 2010** (`rd-ilcd-2010`) | `art-ilcd-2010-pdf` (`7de4b912...`, 417 pp., `printed = pdfIdx - 19`) | `§5.3` (`Table 2`, pp. 36–41, `pdfIdx 55–60`), `§6.5.4.3–.4` & `Provisions I.b–I.c` (`fn 64`, pp. 85–87, 92–93, `pdfIdx 104–106, 111–112`), `§7.2.4` (`Fig. 21`, pp. 165–166, `pdfIdx 184–185`) | 区分决策支持/核算与小尺度/大尺度结构后果三类情境（`A / B / C1 / C2`）；`fn 15` 明确“时间（过去/未来）”不是归因与后果的分界轴；`fn 64` 以年新增需求/供给是否超过受影响过程年正常设备更新容量划定“大变化”门槛；`Situation B` 仅对大变化过程用长期边际组合并配 90% 合理最差/最好情景与“无行动”零方案；`C1/C2` 不得直接用于比较决策。 |
| **ecoinvent v3 Data Quality Guideline (Weidema et al. 2013)** (`rd-dapp147-ecoinvent-v3-2013`) | `art-dapp147-ecoinvent-v3-2013-pdf` (`88fcc151...`, 169 pp., `printed = pdfIdx - 7`) | `§14.3` / `§14.5–14.6.1` (pp. 112, 124–126, `pdfIdx 119, 131–133`), `§15.1` (pp. 137–138, `pdfIdx 144–145`) | `Substitution, consequential, long-term` 面向小尺度长期决策（引 Mattsson et al. 2001，甚至 `1 TWh` 年电变动仍呈线性边际），明确挑战 ILCD `Situation A` 的微尺度平均简化（每次短期购买累积驱动长期资本投资）；默认资本寿命 `30` 年对应 `3.33%/年` 更新率，产量年降 `> 3.33%` 链接 `Old`/`Outdated`，否则链接 `Modern`/`New`（缺省回退 `Current`）；仅建模绝对约束（条件交换 `-H`），不采用经验弹性；副产品恒为受限且必须替代；`§15.1` 明确归因模型（`Allocation, ecoinvent default`）适用于社会层热点筛查、环境税负公平分配与追溯追责/嘉奖。 |
| **EU PEF — Commission Recommendation (EU) 2021/2279** (`rd-kb44-ec2021`) | `art-kb44-ec2021-r01-en-pdf` (`OJ L 471`, `af28de08...`, 396 pp.) | `Annex I §4.4.2` (`Table 5`, `OJ L 471/238–L 471/241`, `pdfIdx 40–43`) | 严格四级归因合同电力层级：(a) 满足 100% 追踪或三项最低准则（传递属性、唯一声明/单证与 AIB 核验、时间邻近；未追踪比例 `> 95%` 强制退回残余组合）的供应商特定电力产品 → (b) 供应商总组合 → (c) 国家**残余消费电网组合**（剥离已声明绿电防双重计算）→ (d) 欧盟+EFTA/区域残余组合；使用阶段（`§4.4.2.6`）改用消费电网组合。 |
| **GHG Protocol Product Standard (2011)** (`rd-pfr151-ghgp-2011`) | `art-pfr151-ghgp-2011-pdf` (`fdc21b79...`, 148 pp., `printed = pdfIdx - 1`) | `§5.1–5.2` & `Box 5.1` (pp. 21–22, `pdfIdx 22–23`), `§9.1–9.3.2` (`Tables 9.1–9.2`, `Fig. 9.2`, pp. 61–67, `pdfIdx 62–68`), `§11.3.2` (p. 91, `pdfIdx 92`) | 强制遵循归因路径（`§5.2`），`Box 5.1` 将后果路径明确定位于减排项目评估与公共政策而非本产品标准；`§9.3.2` 仅在企业直接掌握副产品最终去向且使用供应商或**平均**排放因子时允许归因式系统扩展（浆厂黑液发电例：`1000 - 50 = 950 kg`），并指出引入边际数据即转为后果建模；`§9.2` 要求闭环近似替代因子与分阶段占比分列以防生命末期负值；`§11.3.2` 严禁将间接市场响应产生的“避免排放”从清单总计扣减，若单独披露须同时披露间接增排（如 iLUC）。 |

## 3. 新增 7 条论述与对照表设计（`cl-mkt169-1` 至 `cl-mkt169-7`）

1. `cl-mkt169-shared-questions`：四套制度框架面对的共同四问（干预尺度、市场约束、电力/供应组合归属、需求变化下的共产品替代）。
2. `cl-mkt169-conditional-convergence`：条件共识（目标依赖、防双重计算、替代举证责任）及各自成立条件。
3. `cl-mkt169-context-and-scale`：核心分歧一——决策情境分类与尺度门槛（ILCD `A/B/C1/C2` 与 `fn 64` 门槛 vs ecoinvent v3 小尺度长期累积投资逻辑与 `30年/3.33%` 规则 vs PEF/GHGP 强制归因与项目边界隔离）。
4. `cl-mkt169-electricity-mix-regimes`：核心分歧二——电力与市场组合规则（PSI `M1–M4` 物理贸易平衡与 Frischknecht `fn 14` 分歧 vs PEF `§4.4.2` 合同追踪与残余消费组合 vs ecoinvent v3 长期无约束边际与 Treyer 2016 / Vandepaer 2019 收缩市场局限）。
5. `cl-mkt169-coproduct-substitution`：核心分歧三——共产品与多功能的处理边界（ecoinvent v3 副产品受限必替代 vs ILCD `A` 市场吸收条件与平均替代 vs PEF `§4.5` 双重实证门槛与固定参数 CFF vs GHGP `§9.3.2` 归因平均扩展与 `§11.3.2` 禁止避免排放扣减总计）。
6. `cl-mkt169-ranking-inversions`：框架选择如何真实改变结论与排序（直接承接本章 `8.0 kg` vs `0.2 kg` 40 倍差、瑞士 M3 `65.98% / 34.02%` 与 Ekvall et al. 2005 Thorskog 城堡水电酒店例，说明受限电源合同归因与长期边际后果如何翻转排序，及短期负荷转移/收缩市场误用长期边际的反向失真）。
7. `cl-mkt169-epistemic-limits`：未知与证据边界（现实响应机制的实证缺口、ILCD `A/B` 实践阈值无统一共识、ecoinvent 后果实现缺陷与 IEA 情景敏感性、`gap-market-empirical-response` 及尚未在本库细读的二级综述边界）。
8. 五体系紧缩对照表（Markdown 表格，5 行 × 5 列，紧接 `cl-mkt169-epistemic-limits` 之后、`cl-market-closing` 之前）。

## 4. 核验计划

- 三路独立审查：`source/DAG`（含 4 份 PDF 逐页引文与 30/3.33%/95%/1000-50=950 等数值校验）、零上下文整章 `B11` 读者审读、对抗性出版工程与 Goal §2.15 清洁交付审计，均须 `0 BLOCKER / 0 MAJOR PASS`。
- 自动化校验：`pnpm validate`、`tsc --noEmit`、全量单元测试（含新增 `scripts/reader-market-response-comparison.test.mjs`）、Playwright 响应式/清洁交付/`@media print` QA、干净生产构建（`dirty: false`、CSS 零漂移 `be180e5d...`）、Docpact 严格 lint（`0` 发现）、PR CI、线上 `https://prism.tiangong.earth` 468 文件字节审计与归档源码守卫、以及精确根集成。
