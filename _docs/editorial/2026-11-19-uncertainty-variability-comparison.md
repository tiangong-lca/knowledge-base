---
lastReviewedAt: 2026-11-19
lastReviewedCommit: 4bb508394ef2f6c671b1468d41a2b67c51296be6
title: 变异与不确定性分类、传播方法、全局灵敏度与比较推断的跨体系比较协议
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when researching, writing or reviewing Part VI uncertainty and variability comparative unit 149 in B26
whenToUpdate:
  - when original-source, released-data, manuscript or independent review evidence changes
checkPaths:
  - _docs/editorial/2026-11-19-uncertainty-variability-comparison.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-15-comparative-continuation.md
  - 2026-11-19-data-applicability-comparison.md
---

# 变异与不确定性分类、传播方法、全局灵敏度与比较推断的跨体系比较协议

2026-11-19，[任务 149](https://github.com/tiangong-lca/knowledge-base/issues/149)。继续既有比较修订 GOAL 与 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)，源码基线为第六部开篇单元 `B25`《数据适用性》及两篇配套网页 [PR #148](https://github.com/tiangong-lca/knowledge-base/pull/148) 合入 `main` 的精确提交 `4bb508394ef2f6c671b1468d41a2b67c51296be6`（Git 树 `325faeef973b6d5e14dbe7423a4f39f124c889a4` 与受审头 `00725e87b268c41030d0db4e2f3db5b3f5d07797` 一致，已完成 `https://prism.tiangong.earth` 线上全部 468 项文件 / 356,263,674 字节审计 `4802c6b7ceabd6586399564136112751d1830a91e6c9062abb94b22632f0f937`、精确源码归档 `validateReaderOutput` 校验、线上 `@media print` 12/12 处更正说明核验及根集成 [workspace#2471](https://github.com/tiangong-lca/workspace/issues/2471) / [PR #2472](https://github.com/tiangong-lca/workspace/pull/2472) `f8bacff27775d41a62879107e80ac941f0754b0c`）。本前置协议在修改任何 `knowledge/`、`content/` 或 `config/` 文件之前先行提交并推送。

## 一、核心比较问题与第六部章节分工

第六部《数据与证据》第二章《变异与不确定性》（`B26`，`content/docs/book/uncertainty-and-variability.mdx`，全书唯一单源章面，原含三节 `9` 条论述）此前仅围绕 `Huijbregts (1998/2001)` 与 `Heijungs & Suh (2002)` 两份早期文本展开，尚未系统比较：

1. **固有变异、认识不确定性与方法选择**在 `Huijbregts (1998/2001)`、`Groen et al. (2017)`、`Heijungs (2020)` 与两大欧盟指南（`ILCD 2010`、`EU 2021/2279 PEF`）中的分类口径与制度处理分工；
2. **一阶解析传播（泰勒展开 / 关键议题分析 `KIA`）与随机抽样全局灵敏度分析（`SRC`、`SCC`、`Sobol' SME/STE`、`RBD`）**在低变异系数（`cv = 5%`）与高变异系数（`cv = 30%`）对数正态输入下的数值一致性与失效边界；
3. **蒙特卡洛模拟次数（`N_run`）与原始样本量（`n`）的混淆**：为何增大 `N_run` 只压缩模拟收敛误差而不消除估计偏差，从而把可见的不精确变成不可见的不准确，并在双方案比较中把原本不显著的检验压垮至虚假显著（`p = 0.67 -> p ≈ 10^{-16}`）；
4. **比较性 LCA 中的差值／协方差抽样与谱系矩阵边界**：`ILCD 2010` 第 9.4 节为何要求对两系统之差做考虑共享过程协方差的不确定性分析并同时禁止“过度解读局部不确定性”与“把无显著差异当成相等”，以及 `Heijungs (2020)` 为何指出缺少真实样本量的谱系矩阵分布与大规模蒙特卡洛显著性检验存在根本冲突，从而自然过渡到第 27 章《质量评分与概率》的实地抽样设计与实证校准。

章节分工严格清晰：`B25` 负责计算前的数据适用性、DQR 算式、审查强度与换版补缺；`B26` 负责变异与不确定性分类、传播方法、全局灵敏度、比较推断与求解稳定性；`B27`（已含 `37` 条论述）负责柏林酸奶杯实地抽样、Ciroth 谱系实证校准、对数正态 `U = g²` 合成与评分者间重复性检验。

## 二、经本地字节校验的一手载体清单

1. **既有已登记载体（规范化全部 `7` 条现有 `ev-unc-*` 定位符）**：
   - `Huijbregts (1998/2001)`（`src-book-huijbregts-1998-framework-uva`，`rd-huijbregts-1998-framework-uva`）；
   - `Heijungs & Suh (2002)` 公开样章（`src-book-heijungs-suh-2002-author-sample`，`rd-heijungs-suh-2002-author-sample`）。
2. **既有已登记载体新增经核验段落**：
   - 欧盟联合研究中心 `ILCD Handbook (2010)`（`EUR 24708 EN`，`src-book-ilcd-2010`，SHA-256 `7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f`，第 9.3.3 节印第 295—299 页与第 9.4 节印第 300—305 页）；
   - 欧盟委员会建议书 `(EU) 2021/2279` 勘误本（`OJ L 144`，`src-kb44-ec2021`，SHA-256 `42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7`，术语表 `L 144/20—21`、准确度原则 `L 144/25`、附件一第 4.6.5.1 节 `L 144/81` 与第 6.2—6.4 节 `L 144/88—94`；全文 384 页零次出现 `Monte Carlo`）。
3. **新增 CC BY 4.0 开放获取一手 PDF 载体**：
   - `Heijungs (2020)`《论比较概率生命周期评价中的蒙特卡洛运行次数》（*Int J Life Cycle Assess* 25:394–402，DOI `10.1007/s11367-019-01698-4`，9 页 PDF，SHA-256 `422cb7f6665f1fcdc689d8a65cbd58838508d849bed2d415de8b010763d4f299`）；
   - `Groen, Bokkers, Heijungs & de Boer (2017)`《生命周期评价中的全局灵敏度分析方法》（*Int J Life Cycle Assess* 22:1125–1137，DOI `10.1007/s11367-016-1217-3`，13 页 PDF，SHA-256 `98cef6d82e07fdfeca8d13e73a3409969b8fbb98fefa24e93c818cf72cae7d4b`）。

## 三、四节结构、新增命题与两张 6 列综合对照表

保留既有全部 `9` 条论述身份及三处既有节锚（`#估计对象`、`#不确定性来源`、`#数值可靠性`），新增 `#传播与灵敏度` 节，扩展至 `17` 条论述（公开目录 `1,052 -> 1,060` 条）并配两张 6 列响应式对照表：

1. `## 分布与估计对象 [#估计对象]`（`3 -> 4` 条）：`cl-unc-types`、`cl-unc-target`、`cl-unc-sd-sem` + 新增 `cl-unc149-variability-vs-epistemic`（固有变异不可经抽样消除 vs 认识不确定性可经补充测量缩减 vs 方法选择须保留情景）。
2. `## 参数、模型、选择与制度框架 [#不确定性来源]`（`4 -> 5` 条 + 表 1）：`cl-unc-parameters`、`cl-unc-model`、`cl-unc-choices`、`cl-book-unc-separate` + 新增 `cl-unc149-framework-comparison`（`ILCD 2010` 情景+随机+高影响高不确定性优先矩阵 vs `EU 2021/2279` 零蒙特卡洛强制条款、`§6.2` 稳健性检验、`§6.3` `80%`/`50%`/`≥3` 热点阈值与 `§6.3.5` 负值绝对值规则）+ **表 1**：不确定性与变异类型及跨体系处理方式对照。
3. `## 传播方法与全局灵敏度分析 [#传播与灵敏度]`（新增 `4` 条）：
   - `cl-unc149-local-vs-global-sa`（局部 OAT 偏导数 vs 全局方差分解）；
   - `cl-unc149-taylor-vs-sampling`（`Groen et al. 2017` `KIA` 一阶泰勒解析 vs 随机抽样在 `cv = 5%` 一致、`cv = 30%` 均值漏偏与方差低估 ~33% / ~20% 的数值对比）；
   - `cl-unc149-gsa-outliers-nonlinearity`（高离散度与离群值下 `SRC` 退化、`SCC` 与 `Sobol' SME/STE` 胜出，及无相关输入假设与非线性影响路径两项明确限制）；
   - `cl-unc149-mc-runs-precision-vs-accuracy`（`Heijungs 2020` 单系统 `n = 16` 可见不精确 `[9.819, 10.799]` vs `N_run = 100,000` 不可见不准确 `[10.305, 10.318]` 及耗时缩放）。
4. `## 比较推断与求解的数值可靠性 [#数值可靠性]`（`2 -> 4` 条 + 表 2）：
   - `cl-unc149-comparative-paired-and-pvalue`（`ILCD 2010 §9.4` 差值与共享过程协方差、双反误用禁令 + `Heijungs 2020` 双同源总体 `p = 0.67 -> p ≈ 10^{-16}` 与最弱样本量上限 `N_run ≤ n`）；
   - `cl-unc149-pedigree-mc-boundary`（`Heijungs 2020` 谱系矩阵缺乏真实样本量而不宜直接做大规模蒙特卡洛显著性检验，自然衔接第 27 章实地抽样与实证校准）；
   - `cl-unc-numerical` + **表 2**（传播、灵敏度与比较推断方法对照）+ `cl-book-unc-bridge`（更新末段收束，衔接第 27 章）。

## 四、停止条件、可逆守卫与独立审查要求

- 全部 `7` 条既有 `ev-unc-*` 定位符同步规范化为干净中文印刷页码引文（同时修复 `revisable-judgment.mdx` 复用的 3 处引用）。
- 在精确基线 `4bb508394ef2f6c671b1468d41a2b67c51296be6` 上安装可逆 `reader-uncertainty-comparison` 出版守卫，保持 `40/40` 案例文件零改动与编译 CSS 零漂移（`be180e5d...`）。
- 须经三路独立审查（一手出处与数值、零上下文整章读者、对抗性出版工程）全部无条件 `PASS`（`0 BLOCKER / 0 MAJOR / 0 MINOR`），通过 `pnpm validate`、`pnpm typecheck`、`pnpm test`、Playwright 响应式/无脚本/`@media print` 检查、干净生产构建、严格 Docpact 校验、PR/CI/合并、线上 `https://prism.tiangong.earth` 核验与根集成终态核销。
- 本单元交付不代表全书完成，[Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9) 八项全局条件保持未勾选。
