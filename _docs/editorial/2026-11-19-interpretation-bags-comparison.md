---
title: "Part VII Unit 2 (B30《购物袋研究》): Prewriting Protocol — Interpretation, Sensitivity, Hotspot Thresholds & Critical Review Governance"
docType: editorial-protocol
scope: book
status: active
owner: knowledge-base
language: zh-CN
unitId: interpretation-bags-159
issue: https://github.com/tiangong-lca/knowledge-base/issues/159
baseCommit: c5a257a04e38eb64aeb68c8f3fe7162c5c3f7e48
createdAt: 2026-11-19
---

# 第七部第二单元（`B30`《购物袋研究》）写作前方案与比较契约

## 1. 单元定位与冻结边界

- **跟踪任务**：[`tiangong-lca/knowledge-base#159`](https://github.com/tiangong-lca/knowledge-base/issues/159)（隶属 [`Programme #9`](https://github.com/tiangong-lca/knowledge-base/issues/9)）。
- **精确前序基线**：`c5a257a04e38eb64aeb68c8f3fe7162c5c3f7e48`（`B29`《墙面服务比较》合并后的已核验 `main` 提交，`1,080` 条公开论述）。
- **不可破坏的冻结契约**：
  1. `B30` 中全部 `10` 条绑定至 `knowledge/cases/pack-study-v1.json` 的案例论述（`cl-pack-service`、`cl-pack-capacity`、`cl-pack-count`、`cl-pack-mapping`、`cl-pack-baseline`、`cl-pack-uses`、`cl-pack-shift`、`cl-pack-three`、`cl-pack-rounding`、`cl-pack-categories`）、现有 4 行 HDPE/LDPE 场景表及全部 `40/40` 公开案例 JSON 资产字节级保持不动。
  2. `config/reader-numbering.json` 中 `B30` 的 4 个冻结二级标题（`购物运输服务`、`替代与复用门槛`、`多指标与研究边界`、`审查与实际建议`）保持不动。
  3. 仅在既有 `B30` 章节内新增 `6` 条非案例论述（`cl-int159-*`，全书公开论述总数 `1,080 -> 1,086`）与 `1` 张 5 列跨规范对照表，不修改任何前序已有论述 ID，不触碰 `package.json`、`pnpm-lock.yaml` 或 `app/globals.css`。

## 2. 经 SHA-256 核验的一手文献与精确边界

1. **丹麦环保署（Miljøstyrelsen, 2018）** *Life Cycle Assessment of grocery carrier bags*（Environmental Project no. 1985，Bisinella et al., DTU Environment，2018 年 2 月，144 页公开 PDF，SHA-256 `dff1f846fdfc2c5ce494ccb218b986dc0835b43d773b9d4c92dd3b7a63b41df8`）：
   - 功能单位与参照流取整：单次丹麦超市购物携带平均 **22 升**、**12 千克**商品（印第 14、32 页；PDF idx 13、31），按整数袋数取整时有机棉袋（`COTorg`）等 6 类须计 **2** 只，基准袋为欧盟生产并在丹麦作为垃圾袋二次使用后焚烧的普通 LDPE 袋（`LDPEavg, EOL3`）。
   - 单一气候变化指标 vs 全 15 项环境指标复用门槛分化（表 24，印第 79 页；建议节印第 18—19、92—93 页；PDF idx 17—18、78、91—92）：
     - 普通棉袋（`COT`）：仅看气候变化需复用 **52** 次，全指标需 **7,100** 次（剔除臭氧消耗后为 **50—1,400** 次）；
     - 有机棉袋（`COTorg`）：仅看气候变化需 **149** 次，全指标需 **20,000** 次（剔除臭氧消耗后为 **150—3,800** 次）；
     - 未漂白纸袋（`PAP`）：仅看气候变化为 **0** 次（`EOL3` 原始值 `-1.3`），全指标需 **43** 次；漂白纸袋（`PAPb`）：气候变化 **1** 次，全指标 **43** 次；
     - 基准袋若本身也被重复用于购物，上述门槛按比例放大；且门槛仅为环境盈亏平衡下限，不等同于现实使用寿命。
   - 明确边界与审查披露：丹麦国内乱丢弃（littering）效应因被视为可忽略而未建模（印第 13、46 页）；外部同行评审由 COWI A/S 两名评审人于 2018 年 1 月执行，并非覆盖全过程的利益相关方评审组，因此报告明文声明“不严格符合 ISO 14044 公开比较断言程序”，定位为丹麦环保署内部决策支持（印第 19—20、31、47 页）。
2. **欧盟联合研究中心 ILCD 详细指南（2010）**（417 页 PDF，SHA-256 `7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f`）：
   - 第 9 章生命周期解释（印第 285—305 页；PDF idx 304—324）：第 9.2 节重大议题识别，第 9.3.2—9.3.4 节完整性、灵敏度与一致性三项核查，第 9.4 节结论、局限与建议（非量化范围外效应须明示且不得与 LCA 得分暗中排序；规定条款 II.d 明禁将“未检出显著差异”等同于“两方案等效”；关键局限必须写入核心结论与执行摘要）。
   - 第 6.11—6.12 节与第 11 章关键性审查（印第 148—150、321—322 页；PDF idx 167—169、340—341）：独立内部审查、独立外部审查、外部评审组审查与同步交互审查；第 11 章给出 5 项审查保证准绳，具体细则转交另行发布的审查方案分册；机密数据可单独编入仅供评审人审阅的补充报告。
3. **欧盟委员会建议书 `(EU) 2021/2279`（产品环境足迹 PEF）**（2022 年更正重刊版公报 OJ L 144，384 页 PDF，SHA-256 `42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7`；交叉对照 2021 年原刊公报 OJ L 471，396 页 PDF，SHA-256 `af28de0896bfcfd8d627e758c97c83fd7d4bab94f2005ce5ea2079df42da39e3`）：
   - 附件一第 6.1—6.4 节（OJ L 144 第 88—94 页；OJ L 471 第 284—289 页）：稳健性评估三工具（完整性、灵敏度、一致性）及定量热点规则（表 27）：最相关影响类别须累计占加权单一总分 **≥ 80%** 且至少 **3** 类；最相关阶段与过程须累计占 **> 80%**（若使用阶段占比 **> 50%** 则须剔除使用阶段重算并一并报告）；最相关基本流累计 **≥ 80%**；第 6.3.5 节规定过程与基本流出现负值抵扣（如回收或垃圾袋信用）时须取绝对值重算 100% 占比（不适用于生命周期阶段）。
   - 附件一第 7.1—7.1.6 节与第 8.1 节（OJ L 144 第 94—95 页；OJ L 471 第 290—291 页）：PEF 报告六大组成（独立摘要、聚合 EF 合规数据集且公开数据集须连带公开底层 PEF 报告、主报告、验证声明、技术附件含评审报告、仅供核查员审阅的可选机密报告），以及重大差错阈值（任一影响类别变动 **> 5%** 或改变最相关类别/阶段/过程清单）。
4. **明确登记的付费标准边界（`lit-gap-*`）**：
   - 本单元未获取付费标准 `ISO 14044:2006`（生命周期解释与关键性审查条款原文）及 `ISO/TS 14071:2014`（关键性审查流程与评审人能力要求）全文，登记为 `lit-gap-int159-paywalled-iso14044-14071-interpretation-review`，绝不编造未核验条款号或逐字规定。

## 3. 新增论述与对照表布局

在既有 `B30` 四个冻结节内精准落位（不改动任何前序 34 条论述与 10 条案例论述）：
- 在 `## 多指标与研究边界` 末尾新增 2 条论述：
  1. `cl-int159-danish-epa-fu-and-multi-indicator`：对比英国环境署（2011）月度件数功能单位与丹麦环保署（2018）22 升 / 12 千克单次购物功能单位、整数袋取整、`EOL3` 垃圾袋动态基准，以及气候变化单指标 vs 全 15 项指标复用门槛的量级分化（棉袋 52 vs 7,100；有机棉袋 149 vs 20,000；纸袋 0/1 vs 43）。
  2. `cl-int159-ilcd-pef-interpretation-hotspots`：梳理 ILCD 2010 第 9 章（重大议题 + 完整性/灵敏度/一致性三查 + 范围外效应隔离 + 非等效原则）与欧盟 PEF 附件一第 6 节（≥80% / ≥3 类、>80% 阶段过程、>50% 使用阶段重算、第 6.3.5 节负信用绝对值规则）的共性与定量差异。
- 在 `## 审查与实际建议` 末尾（`cl-pack-iterate` 之后）新增 4 条论述 + 1 张 5 列跨规范对照表：
  3. `cl-int159-critical-review-governance`：对比 ILCD 2010 第 6.11 节与第 11 章（5 项保证准绳与三类审查/同步审查）、英国环境署 2011 三人评审组、丹麦环保署 2018 坦诚披露 COWI 两人外部评审不满足公开比较断言评审组程序，以及欧盟 PEF 附件一第 7—8 节报告公开、机密附件隔离与 >5% 重大差错门槛。
  4. `cl-int159-limitations-and-paywalled-iso`：说明 ILCD 第 9.4 节规定条款 II.a–II.d（局限必须随核心结论与执行摘要传播、无显著差异不等于等效）与欧盟 PEF 第 6.4 节的局限约束，并显式交代付费 `ISO 14044:2006` 解释/审查原文与 `ISO/TS 14071:2014` 尚未在公开原文中逐条核验的边界。
  5. `cl-int159-interpretation-synthesis-bridge`：总结“计算阈值—稳健性三查—外部审查与局限随行”三层解释纪律，自然过渡至下一章（未来技术与情景）。
  6. 紧接 1 张 5 列跨体系对照表（英国环境署 2011、丹麦环保署 2018、ILCD 2010、欧盟 PEF `(EU) 2021/2279` 在“功能单位/参照口径”“热点与稳健性规则”“负信用与范围外效应”“审查机制与保密边界”“结论与局限披露”五维对照）。
  *(注：共新增 5 条论述 + 1 张 5 列对照表，全书公开论述总数 `1,080 -> 1,085`；若将丹麦环保署功能单位/基准与单指标vs多指标拆为两条，则为 6 条论述 `1,080 -> 1,086`。本方案采用 **6 条论述 `1,080 -> 1,086`**：将丹麦环保署拆为 `cl-int159-danish-epa-fu-eol`（功能单位 22 L / 12 kg、整数取整与 `EOL3` 基准）与 `cl-int159-danish-epa-multi-indicator`（单指标 vs 全指标复用门槛分化与乱丢弃边界），每段聚焦单一核心命题，可读性更佳！)*

## 4. 验收与验证清单

- `scripts/reader-interpretation-bags-factors.mjs`：通过精确 `BigInt` 有理数校验全部新增数值事实（22 L、12 kg、2 袋、52、7100、149、20000、43、80%、3 类、50%、5% 等）与 3 份 SHA-256 PDF 绑定。
- `scripts/reader-interpretation-bags.mjs` 与 `scripts/reader-interpretation-bags.test.mjs`：fail-closed 预览守卫、精确回滚恢复 `c5a257a0` 前序 pin、全量 `B30` 布局与 5 列对照表 DOM 校验。
- 三路独立复审（一手文献与数值审计、零上下文 `B30` 全章读者复核、对抗式出版工程审计）全部达到无条件 `PASS (0 BLOCKER / 0 MAJOR / 0 MINOR)`。
- Playwright 响应式 QA、`validate.mjs`、`tsc --noEmit`、全量单元测试、CSS 零漂移（`be180e5d...`）、Docpact 严格 lint（0 告警）、干净生产构建（`dirty: false`）、PR/CI/合并、`https://prism.tiangong.earth` 468 文件字节审计与未修改守卫核验、以及根仓精确集成。
