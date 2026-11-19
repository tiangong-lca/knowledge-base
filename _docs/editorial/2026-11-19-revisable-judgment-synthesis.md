---
title: Part VII Unit 4 (B32 Revisable Judgment + W1/W2 Closing Synthesis) Prewriting Protocol
docType: editorial-protocol
scope: knowledge-base
status: active
authoritative: false
owner: knowledge-base
language: zh
lastReviewedAt: 2026-11-19
lastReviewedCommit: cb2584d4354f6d8a5111155d658d3edafd80ec8a
---

# 第七部第四单元（第三十二章 `B32`《可修订的判断》+ `W1`《服务、系统与时间》+ `W2`《判断依据与修订》）写作前协议

- **所属任务**：[tiangong-lca/knowledge-base#163](https://github.com/tiangong-lca/knowledge-base/issues/163)（总协调 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)）
- **合格基线**：`cb2584d4354f6d8a5111155d658d3edafd80ec8a`（tree `1d3f6fab8829a1fb55ffbd9f50d3114c8dc7f3e4`；公开托管 manifest `665d76cb8107d24c47a0ecfac292156b764454ff9183955d2efa009b764c798e`）
- **目标文件**：
  - `content/docs/book/connecting-objects-references-and-time.mdx`（`W1`，2 个冻结节）
  - `content/docs/book/from-connected-results-to-conditional-judgment.mdx`（`W2`，3 个冻结节）
  - `content/monograph/revisable-judgment.mdx`（`B32`，4 个冻结节）
  - `knowledge/catalog.json`（新增 7 条综合与修订路由论述：`1,092 -> 1,099`）
- **冻结与守恒约束**：
  1. 既有 **22** 条 `B32`／`W1`／`W2` 论述逐字节不变；
  2. 严格保持网页双篇与书籍末章的不相交并集对等：**`W1 ∪ W2 = B32` 且 `W1 ∩ W2 = ∅`**（`W1` 8 → 10 条，`W2` 14 → 19 条，`B32` 22 → 29 条）；
  3. 保持 `W1`（2 节）、`W2`（3 节）、`B32`（4 节）全部冻结标题、106 条历史引文义务、40/40 份案例下载及编译 CSS（`be180e5d...`）零漂移；
  4. 仅引用库中已经过 SHA-256 与一手核验的既有证据与前提（覆盖第三至七部 `B13`—`B31`），不编造任何付费标准条款或新增未核来源。

## 新增 7 条综合与修订路由论述及全书 5 列修订路由表

1. `cl-rev163-lcia-pathway-and-packet-drift`（`W1` 第一节末 / `B32` 第二节中段）：综合第四部（`B14`—`B19`）矿产、化石、生物碳、酸化、富营养化、颗粒物、水资源、臭氧／辐射与毒性比较，把“前景物理变化”与“影响评价模型边界、空间区室、时间窗及官方 XML／工作簿数据包勘误”严格拆分。
2. `cl-rev163-circular-and-prospective-coupling`（`W1` 第二节末 / `B32` 第一节末）：衔接 `B13` 循环足迹公式（CFF）`A` 因子分账方向与 `B31` 前瞻性／事前／动态 LCA 术语双轴、三步工艺放大、综合评估模型超结构耦合及三类时间范围边界。
3. `cl-rev163-pedigree-dqr-and-sampling-limits`（`W2` 第一节末 / `B32` 第二节末）：综合 `B25`—`B27` 数据适用性（ecoinvent v3 市场与剩余地区漂移、TIDAS 与 PEF 二手数据阶梯）、谱系矩阵与蒙特卡洛不可混淆（Heijungs 2020）及四大框架 DQR／不确定度分界。
4. `cl-rev163-valuation-denominator-and-veto-limits`（`W2` 第二节末前段 / `B32` 第三节中段）：综合第五部（`B20`—`B24`）归一化分母与权重耦合、四层本地化核查、货币估值与现金流生命周期成本不可通约、多准则决策补偿与非补偿社会底线否决，以及地球边界分配原则反转。
5. `cl-rev163-comparative-assertion-three-regimes`（`W2` 第二节末 / `B32` 第三节末）：综合 `B28`—`B30` 计算可比性与制度合法性之分，并列对照 ILCD 2010、欧盟 PEF（(EU) 2021/2279、电池法规、ESPR）与 GHG Protocol 三大体制对比较性断言、性能分级与外部审查的边界，明示 ISO 14044／14067／14071 付费原文边界。
6. `cl-rev163-targeted-revision-routing`（`W2` 第三节末前段 / `B32` 第四节末前段）：衔接既有 `cl-closing-historical-return` 尾句，建立全书 7 部“新增证据 → 受影响环节与章节 → 应修订命题 → 保持不变依据 → 不得直接推论”的定向修订纪律，并引出全书 5 列 7 行修订路由对照表（`W2` 第三节与 `B32` 第四节内容一致）。
7. `cl-rev163-monograph-closing-boundary`（`W2` 第三节末 / `B32` 第四节末）：全书三十二章最终收束——把饮料容器、墙面涂层与购物袋三个贯通案例与全书七部方法边界合拢，说明可修订的生命周期评价能够负责任地交付什么，以及永远不能替代什么。

## 验收与审查边界

- 须通过独立三路审查（一手前提与依赖图审计、零上下文 `B32`+`W1`+`W2` 完整通读审稿、对抗性出版工程与表/对等守卫审计）全部无条件 `PASS`（`0 BLOCKER / 0 MAJOR / 0 MINOR`）；
- 本单元交付不等于第七部全篇回读或全书完成；第七部整部回读（单元 25）、全书连续回读及 `Programme #9` 全部 8 项全局验收继续保持未勾选。
