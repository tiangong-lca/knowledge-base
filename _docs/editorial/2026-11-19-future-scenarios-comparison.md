---
title: "Part VII Unit 3 (B31《未来技术与情景》): Prewriting Protocol — Prospective, Ex-Ante, Anticipatory & Dynamic LCA Comparison"
docType: editorial-protocol
scope: book
status: active
owner: knowledge-base
language: zh-CN
unitId: future-scenarios-161
issue: https://github.com/tiangong-lca/knowledge-base/issues/161
baseCommit: ac54b2594efab9d985e8f2aac677d68e97573643
createdAt: 2026-11-19
---

# 第七部第三单元（`B31`《未来技术与情景》）写作前方案与比较契约

## 1. 单元定位与冻结边界

- **跟踪任务**：[`tiangong-lca/knowledge-base#161`](https://github.com/tiangong-lca/knowledge-base/issues/161)（隶属 [`Programme #9`](https://github.com/tiangong-lca/knowledge-base/issues/9)）。
- **精确前序基线**：`ac54b2594efab9d985e8f2aac677d68e97573643`（`B30`《购物袋研究》合并后的已核验 `main` 提交，`1,086` 条公开论述）。
- **不可破坏的冻结契约**：
  1. `B31` 中全部 `9` 条既有论述（`cl-future-definition`、`cl-future-scale-up`、`cl-future-incumbent`、`cl-future-scenarios`、`cl-future-background`、`cl-book-future-scenario-matrix`、`cl-future-impact-limits`、`cl-future-comparison-conditions`、`cl-book-future-decision`）及全部 `40/40` 公开案例下载资产字节级保持不动。
  2. `config/reader-numbering.json` 中 `B31` 的 3 个冻结二级标题（`工艺放大与比较对象`、`情景与供给背景`、`前瞻比较的适用条件`）保持不动。
  3. 在既有 3 节内各新增 2 条论述（共 `6` 条 `cl-fut161-*`，全书公开论述总数 `1,086 -> 1,092`）与 `1` 张 5 列方法体系对照表，不触碰 `package.json`、`pnpm-lock.yaml` 或 `app/globals.css`。

## 2. 经 SHA-256 核验的四篇 CC BY 4.0 一手文献

1. **Arvidsson 等（2024）** *Terminology for future-oriented life cycle assessment: review and recommendations*（*Int J Life Cycle Assess* 29:607–613，7 页开放获取 PDF，SHA-256 `b6dfe18c521a76c97de8ebb6bb5df4895ad0abe4c82acf4bf515708e60f77381`）：
   - 梳理 3 个核心面向未来术语的 7 条典型既有定义，以**时间位置**（前瞻性 prospective vs 回顾性 retrospective）与**技术成熟度**（事前 ex-ante、事后 ex-post、实验室尺度 lab-scale）两维坐标定位 5 类术语（图 2，印第 611 页）；
   - 推荐将“前瞻性 LCA（prospective LCA）”作为面向未来研究的统一总称（涵盖未来时点的归因研究以及在未来背景下评估已成熟技术），区分强调利益相关方参与边界与权重选择的预期式 LCA（anticipatory LCA）以及按时间点解析排放与特征化因子的动态 LCA（dynamic LCA）。
2. **Tsoy 等（2020）** *Upscaling methods used in ex ante life cycle assessment of emerging technologies: a review*（*Int J Life Cycle Assess* 25:1680–1692，13 页开放获取 PDF，SHA-256 `4ad67ba2ac3d3501b6d64bbb4951803666457dc943942663fe8d79ea8ad8abf2`）：
   - 从 184 篇初筛文献中纳入 18 项事前 LCA 放大案例（15/18 为化工与废物处理，11/18 从实验室直接放大至工业规模）；采用 EARTO（2014）技术就绪度（TRL 1—2 概念、TRL 3—5 实验室、TRL 6—8 中试、TRL 9 工业化），但 **0/18** 篇明报 TRL 数值、**0/18** 篇完成投产后实测回验、**15/18** 未说明技术专家参与、**9/18** 未给出完整流程图；
   - 总结“技术情景定义 → 预测流程图 → 清单数据估算”三步放大框架及按准确度排序的四类数据估算方法：流程模拟（6/18，准确度第 1）、手工计算（10/18，第 2）、分子结构模型（1/18，第 3）与近似代理数据（7/18，第 4）。
3. **Steubing & de Koning（2021）** *Making the use of scenarios in LCA easier: the superstructure approach*（*Int J Life Cycle Assess* 26:2248–2262，15 页开放获取 PDF，SHA-256 `29ab442124e0fc703056a1797b5c65e34d4dbb9a3d556acfc0fd44aa9ce5eef8`）：
   - 解决综合评估模型（IAM，如 IMAGE 3.0）与背景数据库（如 ecoinvent 3.7）耦合后产生数十套独立数据库、前景重连易错与重复存储的瓶颈：以“超结构数据库（取各情景过程与交换的并集）＋情景差异文件（SDF）”将 2 种情景（SSP2-base、SSP2-2.6）× 4 个年份（2020—2050）共 8 套数据库压缩为 1 套超结构加 1 份差异表，内存覆写约 135,000 条交换并在 5 秒内完成 16 次电动车算例计算（显示电网脱碳杠杆可超过单车 40% 能效提升）；
   - 明确声明该架构仅是技术实现工具而非情景质量保证，仍存在情景特有“幽灵过程”（对角线置 1）、SDF 尚不支持不确定度传播、情景元数据缺失及 IAM 与 LCI 范式／许可不匹配等局限。
4. **Lueddeckens, Saling & Guenther（2020）** *Temporal issues in life cycle assessment—a systematic review*（*Int J Life Cycle Assess* 25:1385–1401，17 页开放获取 PDF，SHA-256 `9964ef65db15b2a67ad18c2c8906e444377059a16861474ac69e44b58bb1050f`）：
   - 系统综述 1997—2018 年 60 篇时间议题文献（24 篇方法论文 + 36 篇案例研究），梳理 6 项直接时间议题（剔除极少使用的动态加权与动态归一化后余 4 项实用议题）；
   - 区分“评估时间范围”“清单时间范围”与“特征化时间范围”三类时间尺度（指出对第 99 年排放套用静态 GWP100 会隐含 199 年跨度，违背 100 年评估边界），区分半动态（仅动态 LCI）与全动态（动态 LCI ＋ 动态 LCIA），并揭示动态特征化因子覆盖稀疏、供应链时序数据与软件瓶颈、贴现率（约 1% 即可在数十年内大幅边缘化远期影响）以及“假设未来背景减污导致当下行动激励下降”的动态归一化悖论。

## 3. 新增论述与对照表布局

- `## 工艺放大与比较对象` 末尾新增 2 条：`cl-fut161-terminology-axes`、`cl-fut161-upscaling-methods`。
- `## 情景与供给背景` 末尾新增 2 条：`cl-fut161-superstructure-iam`、`cl-fut161-superstructure-limits`。
- `## 前瞻比较的适用条件` 末尾新增 2 条 + 1 张 5 列方法对照表：`cl-fut161-dynamic-time-horizons`、`cl-fut161-temporal-barriers-values` + 1 张覆盖前瞻性、事前、预期式、实验室尺度与动态 LCA 的 5 列对照表。
