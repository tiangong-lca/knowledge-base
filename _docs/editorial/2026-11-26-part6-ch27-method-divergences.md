---
title: Part VI Chapter 27 — Methodological Divergences Across Major LCA Databases Pre-Writing Protocol
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or auditing Part VI Chapter 27 (Methodological Divergences Across Major LCA Databases)
whenToUpdate:
  - when Chapter 27 scope, primary-source registry, or comparative tables change
checkPaths:
  - content/docs/book/database-methodological-divergences.mdx
  - content-en/docs/book/database-methodological-divergences.mdx
  - _docs/editorial/2026-11-26-part6-ch27-method-divergences.md
lastReviewedAt: 2026-11-26
lastReviewedCommit: 59762211466772985238978d6febab48f94a8c66
related:
  - 2026-11-26-part6-databases-landscape.md
  - ../reader-publication-contract.md
  - concept-led-comparison.md
---

# 第六部第 27 章《主流数据库的方法论底层分歧》写前协议

## 1. 核心研究问题

为什么针对同一产品（如 1 kg 钢材、1 kWh 电力或 1 kg 塑料包装），采用 ecoinvent、Sphera MLC（原 GaBi）、欧盟 EF 3.1、USLCI、IDEA、CLCD 与 EEIO/MRIO（EXIOBASE/USEEIO）等不同背景数据库，即便套用相同的特征化因子，往往也会算出系统性不同的清单与影响结果？本章不泛泛罗列数据库简介，而是拆解四大底层方法论分叉：

1. **系统模型与多功能性处理分叉**（`#系统模型与多功能性处理分叉`）：ecoinvent v3 四套官方系统模型（Cut-off、Cut-off EN15804、APOS、Consequential；其中 Cut-off 与 APOS 的唯一结构差异在于废物与可回收物归属）对比欧盟 EF 3.1 强制循环足迹公式（CFF）、Sphera MLC 工程分配、USLCI/IDEA/CLCD 归因规则以及 EEIO 行业／商品技术假设。
2. **单元过程与聚合过程：透明矩阵与黑箱边界**（`#单元过程与聚合过程透明矩阵与黑箱边界`）：剖析透明单元过程（UPR）与纵向／横向聚合清单（aggregated LCI / 部分终止系统）在供应链可审计性、电网替换能力、蒙特卡洛不确定性传播与商业保密之间的结构权衡。
3. **地理聚合、残差市场与电力运输建模**（`#地理聚合残差市场与电力运输建模`）：拆解 ecoinvent 严格非重叠地理规则（如瑞士与 `RER` 拆分出 `Europe without Switzerland`）、大国分区域电网（美、巴、中、印）、`GLO` 与 `RoW` 残差动态减法及市场活动内置平均运输与损耗，对比国别生产／消费组合及显式外加运输模式。
4. **资本品、截断准则与时间基准差**（`#资本品截断准则与时间基准差`）：解析资本品与基础设施纳入与否对可再生能源（风电、光伏、水电）对比化石燃料的结构性偏置，对照欧盟 PEF 累计低于 3.0% 截断、过程库截断与 EEIO 零截断，以及基准年滞后带来的系统差异。

## 2. 一手来源与认识论边界

- 直接核读的公开一手来源：`Steubing et al. (2016)`（Int J LCA 21:1269–1281）、`ecoinvent System Models` 官方知识库页、`ecoinvent Geographies` 官方知识库页，以及本库已登记的 `Wernet et al. (2016)`、`Weidema et al. (2013)`、`ILCD 2010`、`(EU) 2021/2279`、`USEEIO v2.0 (2022)`。
- 商业闭源库（Sphera MLC、CLCD、IDEA 商业版、行业协会申请制数据集）与未直接获取全文的对比文献（Herrmann & Moltesen 2015、Pauer et al. 2020、Frischknecht et al. 2007）严格标注 `metadata-only` 或 `context` 边界，绝不补造未经直接核读的具体数值。
