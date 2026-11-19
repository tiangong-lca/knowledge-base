---
lastReviewedAt: 2026-11-19
lastReviewedCommit: 3c6844be00ad3d39be3199ffbb257324a5daab79
title: 产品足迹规则法律效力、边界口径、验证制度与比较声明的跨体系比较协议
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when researching, writing or reviewing Part VI product footprint rules comparative unit 151 in B28
whenToUpdate:
  - when original-source, released-data, manuscript or independent review evidence changes
checkPaths:
  - _docs/editorial/2026-11-19-product-footprint-rules-comparison.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-15-comparative-continuation.md
  - 2026-11-19-uncertainty-variability-comparison.md
---

# 产品足迹规则法律效力、边界口径、验证制度与比较声明的跨体系比较协议

2026-11-19，[任务 151](https://github.com/tiangong-lca/knowledge-base/issues/151)。继续既有比较修订 GOAL 与 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)，源码基线为第六部第二章 `B26`《变异与不确定性》[PR #150](https://github.com/tiangong-lca/knowledge-base/pull/150) 合入 `main` 的精确提交 `3c6844be00ad3d39be3199ffbb257324a5daab79`（Git 树 `5aaabed2ad033503ba27b1ba2feae3b22a0f305d` 与受审头 `a6bf911f` 一致，已完成 `https://prism.tiangong.earth` 线上全部 468 项文件 / 360,366,793 字节审计 `30730a85...`、精确源码归档 `validateReaderOutput` 校验、线上 `@media print` 4/4 处更正说明核验及根集成 [workspace#2485](https://github.com/tiangong-lca/workspace/issues/2485) / [PR #2486](https://github.com/tiangong-lca/workspace/pull/2486) `ec58cd82...`）。本前置协议在修改任何 `knowledge/`、`content/` 或 `config/` 文件之前先行提交并推送。

## 一、核心比较问题与第六部收束分工

第六部《数据与证据》第四章《产品足迹规则》（`B28`，`content/docs/book/product-footprint-rules-and-practice.mdx`，原含四节 `34` 条论述）此前完全聚焦于欧盟乳制品 `PEFCR` 单一案例（及其甲烷算法敏感性检验），尚未系统回答以下决定“声明能否合法、有效成立”的跨体系差异：

1. **法律效力层级与自愿建议向强制法规的转化机制**：为何欧盟《运行条约》第 288 条下无约束力的建议书 `(EU) 2021/2279` 不能直接创设市场准入义务，而欧盟《电池法规》`(EU) 2023/1542`（第 7 条、第 96 条、附件二）与《可持续产品生态设计法规》`(EU) 2024/1781`（ESPR，第 1—13 条、附件一、序言第 23 条）如何将产品碳足迹／环境足迹规则转化为在全体成员国直接适用的强制法律与数字产品护照义务；
2. **单一气候指标与多类别环境足迹、功能单位与参考流、系统边界与特殊核算规则的分叉**：`GHG Protocol`《产品生命周期核算与报告标准》（2011 年）明确警告单一温室气体结果不得用于宣称产品整体环境表现（第 1.7 节），规定最终产品须用功能单位并覆盖“摇篮到坟墓”、中间产品用参考流并可取“摇篮到大门”（全文零次使用“声明单位”），把资本品、管理费用、研发、顾客往返与员工通勤划为非归因过程且不设统一百分比截断（须满足数据缺口+无代理+不显著+公开披露三条件），强制分列生物源与 `20` 年／单次收获期直接土地利用变化（排除间接土地利用变化）并在清单总计中禁止延迟排放折算、碳抵消与避免排放；相对照，欧盟《电池法规》附件二以 `1 kWh` 寿命期总供电量为功能单位、明确**排除使用阶段**（与 `GHG Protocol` 最终产品强制摇篮到坟墓及乳制品 `PEFCR` 强制家庭冷藏洗涤形成鲜明对比）、强制按厂按型号采集五大核心部件企业特定活动数据且禁止跨厂抽样，同时同样禁止将碳抵消计入声明值；
3. **鉴证／合格评定制度与企业范围三核算边界**：`GHG Protocol` 允许第一方或第三方独立鉴证并区分为有限保证（消极意见）与合理保证（积极意见），且阐明产品碳足迹之和并不自动等于企业范围一二三总排放（须补入员工通勤、差旅、投资等非归因范围三类别）；而欧盟《电池法规》第 17 条第 2 款与附件八明确排除自我声明（模块 A），强制要求公告机构执行第三方合格评定（批量生产采用模块 D1 质量体系审查加不定期抽查，单件采用模块 G）；
4. **比较声明禁令、产品规则等价门槛与未授权付费全文边界**：`GHG Protocol` 明确不支持 `ISO 14044` 意义上的比较断言（第 1.5 节、附录 A），仅原样支持同一产品跨期追踪，若用于采购比较或标签则须借助产品规则（PCR）统一分析单位、边界、分配、数据质量与第三方鉴证；对照欧盟《电池法规》按厂按型号三阶段递进（声明 → `A`–`G` 性能分级每 3 年复核 → 最高碳足迹限值）与乳制品 `PEFCR` 甲烷模型一致性；同时明确登记 `ISO 14067:2018`、`ISO 14025:2006`、`EN 15804+A2` 与中国 `GB/T 24067-2024` 的付费／未检视全文边界，绝不补造未核验条款号。

## 二、经本地字节校验的一手载体清单

1. **既有已登记载体（规范化全部 `26` 条含裸 `§`/`§§` 的 `ev-kb44-*` 定位符）**：
   - `TFEU Art. 288`、`Recommendation (EU) 2021/2279`、`PEFCR Guidance v6.3`、`2026 EF Transition Guidance`、`Dairy PEFCR 2018/2025`、`Dairy Review Statement 2024`、`Dairy RP/LCI Excel`、`Luke Nordic 2023`、`Niu et al. 2018`、`IPCC 2019 Vol. 4 Ch. 10`。
2. **新增经本地下载与 SHA-256 校验的官方开放获取一手 PDF 载体**：
   - **WRI & WBCSD (2011)** *Product Life Cycle Accounting and Reporting Standard*（2011 年 9 月，ISBN `978-1-56973-773-6`，148 页，SHA-256 `fdc21b798b9c8908f6e55e8caca22e5d8b281ede3601f6950649244d418d3c0c`）；
   - **European Parliament & Council (2023)** *Regulation (EU) 2023/1542 concerning batteries and waste batteries*（EUR-Lex `OJ L 191, 28.7.2023, pp. 1–117`，117 页，SHA-256 `e9745513fabe68c8c15cc9f487c4d13da81d40394712f3e0b4c2588b3238d09a`）；
   - **European Parliament & Council (2024)** *Regulation (EU) 2024/1781 establishing a framework for the setting of ecodesign requirements for sustainable products (ESPR)*（EUR-Lex `OJ L, 2024/1781, 28.6.2024`，89 页，SHA-256 `173b9823d4cb382e764afa05323b2dc80e79951e25182fbfd119976abff9615a`）。

## 三、保留既有四节结构、新增命题与两张 6 列对照表

严格保留 `config/reader-numbering.json` 中既有的 4 处 `B28` 节锚（`#规则与规定服务`、`#活动量与报表`、`#模型与审查范围`、`#算法响应与比较`）与全部 34 条既有 `cl-rule-*` 论述身份，扩展至 `42` 条论述（公开目录 `1,060 -> 1,068` 条）并配两张 6 列响应式对照表：

1. `## 类别规则与默认服务 [#规则与规定服务]`（`7 -> 9` 条 + 表 1）：新增 `cl-pfr151-binding-batteries`（欧盟《电池法规》`2023/1542` 第 7 条与第 96 条直接法律约束力及三阶段递进时间表）与 `cl-pfr151-espr-dpp-conversion`（欧盟 `ESPR 2024/1781` 适用/豁免边界、授权法案将自愿 `PEF` 转化为强制规则及数字产品护照与 2026-07-19 中央注册库）+ **表 1**：四大产品足迹规则体系的法律效力、适用对象与声明门槛对照。
2. `## 使用阶段的活动与结果 [#活动量与报表]`（`11 -> 13` 条）：新增 `cl-pfr151-ghgp-boundary-unit`（`GHG Protocol` 最终产品功能单位/摇篮到坟墓 vs 中间产品参考流/摇篮到大门、非归因过程排除、三条件显著性规则及单指标禁泛化）与 `cl-pfr151-ghgp-vs-battery-accounting`（生物源与 20 年直接土地利用变化分列、禁用延迟折算/抵消/避免排放 vs 欧盟电池法规 `1 kWh`、明确排除使用阶段、五大部件按厂特定数据与禁止跨厂抽样）。
3. `## 模型与审查范围 [#模型与审查范围]`（`5 -> 7` 条）：新增 `cl-pfr151-assurance-vs-notified-body`（`GHG Protocol` 第一/第三方有限与合理保证 vs 欧盟电池法规第 17 条第 2 款禁用模块 A、强制公告机构模块 D1/G）与 `cl-pfr151-product-vs-corporate-scope3`（产品足迹加总不等于企业范围一二三排放的边界与非归因范围三缺口）。
4. `## 甲烷算法与比较条件 [#算法响应与比较]`（`11 -> 13` 条 + 表 2）：新增 `cl-pfr151-comparative-assertion-gates`（`GHG Protocol` 禁用比较断言、产品规则等价条件 vs 欧盟电池性能分级/最高限值）与 `cl-pfr151-paywalled-standard-boundaries`（明确界定 `ISO 14067:2018`、`ISO 14025:2006`、`EN 15804+A2`、`GB/T 24067-2024` 未检视付费全文的公开边界）+ **表 2**：边界口径、特殊碳核算与验证／比较声明条件对照。

## 四、停止条件、可逆守卫与独立审查要求

- 规范化 `B28` 全部 `26` 条含裸 `§`/`§§` 的 `ev-kb44-*` 定位符（同时检查并保持 `2` 条跨章共享引文整洁）。
- 在精确基线 `3c6844be00ad3d39be3199ffbb257324a5daab79` 上安装可逆 `reader-product-footprint-comparison` 出版守卫，保持 `40/40` 案例文件零改动与编译 CSS 零漂移（`be180e5d...`）。
- 须经三路独立审查（一手出处与数值、零上下文整章读者、对抗性出版工程）全部无条件 `PASS`（`0 BLOCKER / 0 MAJOR / 0 MINOR`），通过 `pnpm validate`、`pnpm typecheck`、`pnpm test`、Playwright 响应式/无脚本/`@media print` 检查、干净生产构建、严格 Docpact 校验、PR/CI/合并、线上 `https://prism.tiangong.earth` 核验与根集成终态核销。
- 本单元交付不代表全书完成，[Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9) 八项全局条件保持未勾选。

## 五、实际实施与独立审查验收记录

1. **案例绑定定位符保守守恒与表格口径**：完整保留 `knowledge/cases/dairy-rules-v1.json` 绑定的 `5` 条案例定位符与全部 `34` 条既有 `cl-rule-*` 论述及 `4` 处节锚不变；规范全部 `22` 条非案例 `ev-kb44-*` 定位符（含未引用的 `ev-kb44-dairy2018-comparisons`）；新增 `9` 对一比一单载体 `ev-pfr151-*` / `psg-pfr151-*` 记录、`22` 项有理数 `numericFacts`、`8` 条比较论述（公开目录 `1,060 -> 1,068`）与两张响应式对照表（表 1 六列、表 2 五列）。
2. **三路两轮独立审查全部无条件 `PASS`（`0 BLOCKER / 0 MAJOR / 0 MINOR`）**：
   - 一手出处与数值审计：首轮 `0/4/4 REVISE` 修正附录 A 表 A.2（印第 116 页）、电池法规附件八 B—C 部分 `L 191/96–101`、三处 `pdfIndices`、GHGP 情态动词精确性、第 7 条第 2 款第 5 段依据及独立拆分 `ev-pfr151-ghgp-scope3-boundary` 后，次轮无条件 `0/0/0 PASS`；
   - 零上下文整章读者审读（35,774 字、42 注、2 表）：首轮 `0/2/3 REVISE` 补齐导语、表 1、新增段落与表 2 全部缩写首现中文括注并收窄注 28/29 定位后，次轮无条件 `0/0/0 PASS`；
   - 对抗性出版工程与安全审计：首轮 `1/3/2 REVISE` 修复 `run-qa-151.mjs` 零更正说明断言、加固 `selectProductFootprintComparison` `pin === null` 与 `scope` 校验、收紧精确确定性 `boundedMdxTransform`、清理全部 rationale 文案并扩充负向测试（`8/8` 通过）后，次轮无条件 `0/0/0 PASS`；Playwright 50 组合响应式 + 无脚本 + `@media print` 零错误，编译 CSS 零漂移（`be180e5d...`）。
3. **密码学钉扎**：`productFootprintComparisonPredecessorPin = 67e55709...`，`productFootprintComparisonCapturePin = f1c7d9ac...`（manifest `a719113f...`），`productFootprintComparisonUnitPin = 2193f0fd...`，对应三份审查证据包落盘于 `_docs/editorial/review-evidence/product-footprint-comparison-151/`。
