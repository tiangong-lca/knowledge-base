---
lastReviewedAt: 2026-11-19
lastReviewedCommit: c5b90b0352abaeaf0eec6706685076c8825d8925
title: 过程表示角色、质量聚合算式、审查合规矩阵与换版补缺规则的跨体系比较协议
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when researching, writing or reviewing Part VI data applicability comparative unit 147 in B25 and its two website companions
whenToUpdate:
  - when original-source, released-data, manuscript or independent review evidence changes
checkPaths:
  - _docs/editorial/2026-11-19-data-applicability-comparison.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-09-data-applicability.md
  - 2026-11-15-comparative-continuation.md
  - 2026-11-19-part5-continuous-reread.md
---

# 过程表示角色、质量聚合算式、审查合规矩阵与换版补缺规则的跨体系比较协议

2026-11-19，[任务 147](https://github.com/tiangong-lca/knowledge-base/issues/147)。继续既有比较修订 GOAL 与 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)，源码基线为第五部整部连续回读单元 [PR #146](https://github.com/tiangong-lca/knowledge-base/pull/146) 合入 `main` 的精确提交 `c5b90b0352abaeaf0eec6706685076c8825d8925`（Git 树 `a999fbc6b1ef2345a48f8634e88cb81a332e66ca` 与受审头 `8dcc224d223a46d31f6bc745d517dace229156fc` 一致，已完成 `https://prism.tiangong.earth` 线上全部 468 项文件字节审计 `4e0d5f1d6e55f7539a05cbccf849df22d677798dfc1ba17ceecf50e844fc17c4`、精确源码归档 `validateReaderOutput` 校验及根集成 [workspace#2466](https://github.com/tiangong-lca/workspace/issues/2466) / [PR #2467](https://github.com/tiangong-lca/workspace/pull/2467) `dca8b38132248b9e8cb90811f9c5b91b54456d08`）。本前置协议在修改任何 `knowledge/`、`content/` 或 `config/` 文件之前先行提交并推送。

## 一、核心比较问题与书网双面同步结构

对照持续比较责任表（`_docs/editorial/2026-11-15-comparative-continuation.md` 第 86 行与第 123—124 行），第六部《数据与证据》首章《数据适用性》（`B25`，`content/monograph/data-applicability.mdx`，原含四节 `14` 条论述）及其同步网站细篇《过程数据的用途》（`content/docs/book/database-fitness-and-documentation.mdx`，原含三节 `7` 条论述）与《数据审查与版本》（`content/docs/book/review-support-and-version-boundaries.mdx`，原含三节 `7` 条论述）此前仅围绕联合国环境规划署与国际环境毒理学与化学学会数据库全球指导原则（`UNEP/SETAC 2011`）单一文献展开。作为全书进入数据与证据部分的枢纽入口，本单元围绕一个核心比较问题系统重构三份文稿：**面对同一份已取得的过程数据集与附带审查记录，不同国际指南、制度方法包、商业／公共数据库与公开数据规范，究竟在什么条件下对“数据代表的对象与系统衔接边界、固有代表性与研究语境适配、多维质量打分与聚合门槛、程序校验与同行评审强度、五维合规声明与参考包换版重审、缺口补齐层级与截断规则”给出一致要求，又在哪些算式、单指标上限、单分截断、评审人数或版本迁移环节产生真实结论翻转？**

在完整保留既有 `14` 条 `cl-db2011-*` 命题身份、四节书章结构（`#表示对象`、`#质量信息`、`#审查范围`、`#版本变化`）、两篇网站细篇各自三节结构及末尾续读链接（`cl-db2011-conditional-use` 紧接 `继续阅读：变异与不确定性`）的前提下，本单元置入九份经本地字节校验的一手载体：

1. `UNEP/SETAC (2011)`《生命周期评价数据库全球指导原则》（已登记 `src-book-unep-2011-databases`，SHA-256 `1e466cdcea78b12ac800cc31d4f2413cc08905553f567775bdd5c51ac7c5e0ac`）；
2. 欧盟联合研究中心 `ILCD Handbook — General guide for LCA — Detailed guidance`（`2010`，`EUR 24708 EN`，已登记 `src-book-ilcd-2010`，SHA-256 `7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f`，第 11 章与第 12 章附件 A）；
3. 欧盟联合研究中心 `ILCD Data Network — Compliance rules and entry-level requirements, Version 1.1`（`2012`，`EUR 24380 EN`，SHA-256 `059d7bdebb6f3ac2a94e2db37dfac7d05f3e6a6cf05702ea245232de85d2c2c0`）；
4. 欧盟委员会建议书 `(EU) 2021/2279` 勘误本（`OJ L 144`，已登记 `src-kb44-ec2021`，SHA-256 `42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7`，附件一第 4.6.3—4.6.5.8 节与第 8.1—8.5.3 节）；
5. `Fazio et al. (2020)`《欧盟环境足迹合规数据集指南 2.0 版》（`JRC120340`，已登记 `src-loc137-ef-guide-2020`，SHA-256 `c5dbc3b11c0379f59927be52aadf6eb146b6067aed8f9357d24bd800c986296a`）；
6. `Valente et al. (2022)`《欧盟环境足迹合规数据集指南 3.1 版增补说明》（已登记 `src-tox123-ef31-addendum`，SHA-256 `76a921ca994964f158a5baf4962be2cb1cdeb73583835f7c047eed2087a952b7`）；
7. `Andreasi Bassi et al. (2023)`《环境足迹 3.1 参考包更新报告》（`JRC130796`，已登记 `src-flow-pilot-ef31-update`，SHA-256 `938d7272de6769e8d484bcfc10f8c9be3688caa4a718d298790e8df7b3a65c58`）；
8. 欧盟委员会环境足迹过渡期指导文件（`2026`，已登记 `src-kb44-ec-transition2026`，SHA-256 `27196dfbe2205cf7a6b9df648086aa24d2037830691fdfe3d5005cc5ed760d67`）；
9. `Weidema et al. (2013)`《`ecoinvent` 数据库第 3 版数据质量指南》（`ecoinvent Report 1(v3)`，SHA-256 `88fcc1512a8efe25c26af6254e0fff42b17d15e904bab36136b56e92eaf7fd9c`）；
10. 天工公开规范 `@tiangong-lca/tidas-spec`（`v0.3.0`，`packageFilesSha256 = 6ae4ba22f3d82ac80da041d33528380ea8e87f5abb113f3471399c4554ecc4a2`；严格遵循主工作区 `AGENTS.md` 边界：仅比较公开模式结构、受控词表与已审公开规则定义，执行端门禁与阻断策略归各消费方所有）。

## 二、八条新增比较命题与两张六列综合对照表设计

本单元在书章四节依次新增 `8` 条比较命题（全章 `14` → `22` 注，分布为 `[5, 6, 7, 4]`）与 `2` 张六列响应式对照表，并按议题精确同步至两篇网站细篇（《过程数据的用途》新增前 `4` 条与表 1，`7` → `11` 注；《数据审查与版本》新增后 `4` 条与表 2，`7` → `11` 注，且表 2 与新增命题均置于末段 `cl-db2011-conditional-use` 之前）：

1. **数据集结构角色与上下游衔接禁区**（书章第 1 节／第一细篇第 1 节）：对比 `UNEP/SETAC 2011` 单元过程与聚合过程、`ILCD 2010` 单元过程／清单结果／部分终止系统及情景 A/B/C1/C2、`ecoinvent v3` 转换活动（`transforming activity`）与消费组合市场活动（`market activity`）加上强制全球父过程（`GLO`）向世界其余地区残差（`RoW`）自动扣减（含 `v3.0` 未同步更新 `GLO` 时产生负交换并置零或回拷 `GLO` 的发布记录）、`EF Data Guide 2.0` 第 5.4.2 节禁止脱离主系统单独复用的非主要支撑子数据集（`UUID 2f8a3ebd-befc-4ea9-a6de-34bb6d426d2f`），以及 `TIDAS` 公开规则 `tidas.process.name.qualifiers.structured`（电网输送或 `1:1` 变压节点不把生产组合变成消费组合，绿证不改变物理发电技术），衔接第 7—9 章与第 12 章。
2. **数据集固有代表性与研究语境适配重评反转**（书章第 1 节／第一细篇第 1 节）：辨析 `ILCD 2010` 第 12.2 节固有代表性（相对数据集自身定量参考）与外部适配度（相对当前研究特定供应对象）的区分，对读 `EF Data Guide 2.0` 供应端出厂评级与欧盟建议书 `(EU) 2021/2279` 数据需求矩阵（`DNM`）三类控制情境及研究语境重评规则（保持精度 `P` 不变、重评技术／地域／时间代表性，以及情境 2 选项 2 拆分电力与运输后地域分扣减 `30%` 优惠），证明一份供应端 `DQR = 1.00`（“极优”）的已审燃煤发电数据集在异地异代流化床语境下重评为 `3.75 > 3.0` 而失去合规资格，在企业自营过程（情境 1）中即便语境得分为 `2.00` 亦因必须采集现场初级数据（`DQR ≤ 1.5`）而被否决。
3. **质量指标体系架构、前置条件拆分与谱系方差分流**（书章第 2 节／第一细篇第 2 节）：对照 `UNEP/SETAC 2011` 表 `4.1` 定性维度、`ILCD 2010` 六项 `1—5` 分制指标（技术、地域、时间代表性加完整性 `C`、精度 `P`、方法学适配性 `M`，未评估记 `5` 分、不适用记 `0` 分并剔除分母）、欧盟 `(EU) 2021/2279` 与 `EF Data Guide 2.0` 将完整性与方法学移出算式作为二元准入前提并在 XML 中标为“不适用”而仅对四项指标打分，以及 `ecoinvent v3` 第 10 章将基本不确定度与五项谱系评分映射为对数正态方差而非标量准入总分（将概率校准移交第 27 章）。
4. **最弱项五倍惩罚、算术均值补偿与单分截断盲区**（书章第 2 节／第一细篇第 3 节，配表 1）：在同一组满足前置条件的次级候选数据上验算三套规则的结构反转——平衡中等适配数据甲与高精度但地域严重失配数据乙在 `ILCD` 式 3 最弱项五倍权重下得 `2.60 ≤ 3.0`（基本质量达标）胜过 `3.10 > 3.0`（降为粗略估计），而在 `(EU) 2021/2279` 式 19 四维算术均值与情境 3 无单维上限规则下反转为乙 `2.25 <` 甲 `2.50`；供应端 `EF Data Guide 2.0` 单维加权均分上限 `≤ 3.0` 又会将算术均值仅 `1.75` 的单维失配向量 `(1,4,1,1)` 拒之门外；同时揭示 `EF` 供应端仅对占环境足迹单一总分前 `80%` 的子过程加权计算 `DQR`，以及研究端允许占单一总分 `10%` 以内的 `ILCD` 入门级代理数据免于重算 `DQR`，如何掩盖微量重金属缺失导致的淡水生态毒性低估。
5. **自动平衡校验、交叉编辑审查与独立外部评审门槛**（书章第 3 节／第二细篇第 1 节）：对比 `ecoinvent v3` 第 12 章 `ecoEditor` 自动物质／元素平衡警告与退回机制及活动编辑加四类横向编辑并行审查（含 `v3.0` 公开披露部分合理性检查尚未上线及三名专家目标尚未全库覆盖）、`ILCD` 入门级规则（允许 `1` 名无独立审查报告的外部评审员，或 `1` 名附独立报告的内部评审员）、`EF Data Guide 2.0` 第 8.2 节积分资格制与刚性评审类型（拒绝单人外部评审类型 4，强制要求至少 `2` 名含外部专家的独立评审并签署唯一共识报告及 `Look@LCI` 偏差核查）、欧盟 `(EU) 2021/2279` 第 8.4 节初级数据现场核查要求，以及 `TIDAS` 公开模式（`ProcessReview` 允许单条或数组历史并包含 `"Not reviewed"` 枚举及可选报告引用，将模式合法性与消费端准入门禁严格分离）。
6. **五维合规块声明与“未定义”字段的真实制度语义**（书章第 3 节／第二细篇第 2 节）：剖析 `ILCD 2010` 第 12.4 节与 `ILCD-EL v1.1` 五维合规体系（方法、质量、命名、审查、文档），以及 `EF 3.1 Addendum` 第 5.2.15 节表 1 强制并列声明的 `6` 组 `UUID` 合规块——解释为何一份完全合规的官方 `EF 3.1` 数据集会在 XML 中同时标出 `ILCD-EL` 质量“未定义”、`ISO 14044` 命名／审查／质量“未定义”以及 `EF 3.1` 词表 `UUID` 仅命名一项“完全合规”，并记录该增补文件第 5 页将第 `5.4.2` 节支撑子数据集误印为 `5.4.1` 的原件编号瑕疵。
7. **参考包换版漂移、区域残差重算与三年有效期内强制重审触发**（书章第 4 节／第二细篇第 3 节）：贯通 `UNEP/SETAC 2011` 变更披露要求、`ecoinvent v3` 新增局部数据集对 `RoW` 残差的联动改写、`EF 3.0` 至 `EF 3.1` 参考包升级（`JRC130796` 实证显示底层清单流未变时，`2,752` 份官方数据集中有 `6%`、`10%`、`13%` 发生归一化与加权主导影响类别洗牌，且未重算数据集按 `(EU) 2021/2279` 降格为代理数据）、`TIDAS` 版本号单调递增公开规则，以及 `(EU) 2021/2279` 第 8.5.3 节验证声明 `3` 年有效期与任一披露影响类别恶化超 `10.0%` 或单一总分恶化超 `5.0%` 强制更新重审的定量阈值。
8. **缺口补齐四级优先序、累计 `3.0%` 截断边界与第六部分工衔接**（书章第 4 节／第二细篇第 3 节，配表 2，置于末段 `cl-db2011-conditional-use` 之前）：对读 `UNEP/SETAC 2011` 表 `2.1` 末位条件补缺、欧盟 `(EU) 2021/2279` 第 4.6.3—4.6.4 节四级次级数据阶梯及质量／能量／环境影响三项均不超过 `3.0%` 的累计截断上线与 `2026` 过渡期次级代理安排，收束本章条件使用判断，并把随机与模型不确定性传播交予第 26 章、谱系对数正态校准交予第 27 章、产品类别规则审计实务交予第 28 章。

## 三、既有守卫兼容、注释定位统稿与验证门槛

- **既有守卫无损扩展**：保留 `config/data-applicability-original.json` 与 `config/data-applicability-heading-original.json` 字节不变，保留全部 `40` 份案例下载文件不变，保留 `78` 项历史引用义务；对 `scripts/reader-data-applicability.mjs` 作最小向后兼容扩展以支持受审静态表格校验与动态注号解析（确保历史快照测试 `scripts/fixtures/f650600-tests/reader-data-applicability.mjs` 原样通过），并增设可逆后继守卫 `scripts/reader-data-applicability-comparison.mjs`。
- **全章注释零内部标记残留**：在新增证据选段一比一绑定与精确有理数事实全量消费的同时，一并规范既有 `14` 条 `ev-db2011-*.locator`（含与第 32 章共享的 `8` 条定位字段）及 `5` 条旧命题 `scope`/`caveats` 的中英排版与章节表述，彻底消除 `PDF indexes` 与裸 `§` 符号，并把受影响的第 32 章输出纳入精确捕获校验。
- **独立三方审查与端到端交付**：完成独立来源与数值核查、零上下文书章及双细篇连续读者审读、对抗性出版工程与打印样式审计三项无条件 `PASS`（`0 BLOCKER / 0 MAJOR / 0 MINOR`），通过全量测试、干净生产构建（编译样式指纹零漂移）、多视口及打印样式实测、线上 `468` 项文件核验与根仓集成；不勾选 `Programme #9` 任何全局完成项。
