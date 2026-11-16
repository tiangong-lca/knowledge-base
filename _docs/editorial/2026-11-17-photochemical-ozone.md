---
title: 对流层光化学臭氧受体、区域滴定与多路径前体归属
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when researching or reviewing photochemical-ozone and multi-pathway precursor unit 119
whenToUpdate:
  - when original-source, released-data, manuscript or review evidence changes
checkPaths:
  - _docs/editorial/2026-11-17-photochemical-ozone.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-15-comparative-continuation.md
---

# 对流层光化学臭氧受体、区域滴定与多路径前体归属

2026-11-17，[任务 119](https://github.com/tiangong-lca/knowledge-base/issues/119)。继续既有比较修订 GOAL，源码基线为化石能源与能量载体单元 `PR #118` 合入 `main` 的精确提交 `13064f9729f12e30c5206a6d18a065b6f78a410c`（Git 树 `0baab908d8fed4bcea7cf3f45a5b9099e845283f` 与已审头 `58c357309b11d827658ab50f0a9678626581a702` 一致，且已完成 `https://prism.tiangong.earth` 线上 468 项字节与出版守卫核验及根集成 `workspace#2412` / `PR #2413` `5aa9ccf1d483907b0e2e47f8dfd474275625b2ba`）。本协议在修改任何 `knowledge/` 或 `content/` 文件之前提交并推送；前期候选源文献检索与本地 PDF／官方 ZIP 成员抽检已经发生，不宣称盲法或发现前预注册。

## 一、核心比较问题与实质增量

第四部第 16 章（`B16`《酸化与营养富集》，`content/docs/book/acidification-and-nutrient-pathways.mdx`）目前含 23 条规范论述（原 15 条加任务 113 的 8 条酸化当量比较），保留四节结构与磷净入淡水边界算例。其第四节末尾小节《同一排放不同的环境问题》目前仅由一段定性收束（`cl-path-multiple-paths`）承担：指出氨可同时进入陆地酸化与水体／陆地营养富集而不必先把清单排放拆成几份，并由此过渡到第 17 章（`B17`《颗粒物排放与健康损害》）。与此同时，第四部持续责任表（`2026-11-15-comparative-continuation.md`）明确留下两项直接相连的未闭合义务：`V5-D` 对流层光化学臭氧形成的原始比较，以及同一空气前体跨多条环境路径的归属与不可直接相加边界。

本单元在同一固定空气排放输入（特别是氮氧化物 `NOx`/`NO2`、非甲烷挥发性有机物 `NMVOC`、甲烷 `CH4` 与一氯甲烷 `chloromethane`）下，集中回答四个递进问题：

1. **为什么对流层光化学臭氧中点会从单一挥发性有机物反应活性（`POCP`）走向人体与植被拆分的双受体指标？**
   臭氧并非直接排放物，而是 `NOx` 与 `NMVOC`、`CO`、`CH4` 在光照下经非线性光化学反应生成的次生污染物。`CML 2002`（`Derwent et al. 1998`）以乙烯（`C2H4`）为参照给单一有机物计算光化学臭氧生成潜势（`POCP`，`kg C2H4 eq`），但不提供 `NOx` 因子且不含受体暴露；`ILCD 2011`（`§3.6`）与 `EF 2.0/3.0/3.1`（`JRC109369` `§4.6`、`JRC130796` `Table 1` 与 `§3.2`）采纳 `ReCiPe 2008` 的欧洲 `LOTOS-EUROS` 源—受体模型（`Van Zelm et al. 2008`），以单一 `kg NMVOC eq` 报告人体健康方向臭氧形成；`ReCiPe 2016`（`RIVM 2016-0104` 第 6 章，`Van Zelm et al. 2016` `TM5-FASST`）则因“NMVOC 是混合物”改以 `NOx` 为参照（`kg NOx-eq`），并拆成人体健康臭氧形成潜势（`HOFP`，按人口呼吸摄入分数 `iF` 与 `≥ 30` 岁呼吸死亡效应建模）和陆地生态系统臭氧形成潜势（`EOFP`，按森林／草地生长期日间 `> 40 ppb` 累积暴露 `AOT40` 建模）两项中点。
2. **改变参照物质并拆分保护对象后，前体之间的替代比与方案排序如何反转？**
   在 `EF 3.1` 官方方法 `b5c610fe`（`Photochemical ozone formation - human health`）中，`non-methane volatile organic compounds`、`Nitrogen oxides`、`nitrogen dioxide` 与 `nitrogen monoxide` 均为 `1.0 kg NMVOC eq/kg`（`1 : 1` 等权；`ethylene = 1.69`，`methane = 0.0101`，泛指 `volatile organic compound = 0.235`，由 2004 年欧洲 `14.0 Mt NMVOC` 与 `47.8 Mt CH4` 排放加权得出）。而在 `ReCiPe 2016` 世界加权平均表（`Table 6.1`、`Table 6.2`）中，`NOx = 1`，`NMVOC` 在 `HOFP` 下为 `0.18 kg NOx-eq/kg`，在 `EOFP` 下为 `0.29 kg NOx-eq/kg`（且 `NO`、`NO2`、`NO3` 按摩尔质量折算为 `1.53`、`1`、`0.74`）。因此，比较方案甲（`1 kg NOx`）与方案乙（`2 kg NMVOC`）时，`EF 3.1` 判甲小于乙（`1.0 < 2.0 kg NMVOC eq`），`ReCiPe 2016` 两项中点均反转为甲大于乙（`HOFP`：`1.0 > 0.36`；`EOFP`：`1.0 > 0.58 kg NOx-eq`）；即便在 `ReCiPe 2016` 内部，比较方案丙（`0.25 kg NOx`）与方案丁（`1 kg NMVOC`）也会在人体健康（`0.25 > 0.18`）与陆地植被（`0.25 < 0.29`）之间反转次序。不存在单一正常数能在三者之间自由换算。
3. **区域高 `NOx` 背景下的臭氧滴定（titration）如何令同一排放对两类受体出现一负一正，以及为何 `EF 3.1` 方法 XML 中的国家标签不等于区域化光化学建模？**
   在 `RIVM 2016-0104` 附表 `Table S2.1` 中，`Belgium, Luxemburg, Netherlands`（及 `Great Britain, Ireland`）因高密度城市群处于高 `NOx` 饱和区，边际新增 `NOx` 通过滴定反应降低局地人口吸入臭氧，使 `HOFP_NOx` 为负值 `-0.48 kg NOx-eq/kg`（英国／爱尔兰为 `-0.20`），而下风向森林与草地生长期 `AOT40` 仍上升，使同一地区 `EOFP_NOx` 为正值 `+0.16 kg NOx-eq/kg`（英国／爱尔兰为 `+0.44`），同时 `NMVOC` 跃升至 `+0.69` 与 `+1.10`（英国／爱尔兰 `+0.60` 与 `+1.15`）。反观 `EF 3.1` 的 `b5c610fe.xml`，虽包含 36 个欧洲国家／地区代码的 `720` 条带 `<location>` 因子记录（覆盖 `nitrogen dioxide`、`Nitrogen oxides`、`sulfur dioxide`、`sulfur oxides` 共 20 个空气流），但每个国家代码下的数值全部恒等于通用值 `1.0` 或 `0.0811`。这些 `<location>` 条目是为了承接酸化与陆地富营养化区域化清单流而不致漏算（对比 `b5c611c6` 酸化中 `NL = 0.892`、`BE = 0.837`、`GB = 0.729` 与通用 `0.74`），并非对流层臭氧的区域化命运计算。
4. **同一千克前体排放为何按全量进入多条影响路径而不拆分质量，以及什么情况下才会发生真正的重复计算？**
   在 `EF 3.1` 同一套参考包中，同一基本流 `Nitrogen oxides (Mass, kg, Emissions to air, unspecified)`（`f79d0f8f-2b0e-49cb-bed0-b1ea0fbd8625`）排入空气 1 kg，同时获得光化学臭氧 `1.0 kg NMVOC eq`、酸化 `0.74 mol H+ eq`、陆地富营养化 `4.26 mol N eq`、海洋富营养化 `0.389 kg N eq` 以及颗粒物健康损害 `1.6×10⁻⁶ disease incidence`；`methane (fossil)`（`08a91e70-3ddc-11dd-9610-0050c2490048`）同时获得气候变化 `29.8 kg CO2 eq` 与光化学臭氧 `0.0101 kg NMVOC eq`；`chloromethane`（`08a91e70-3ddc-11dd-9677-0050c2490048`）同时获得平流层臭氧耗竭 `0.015 kg CFC-11 eq`、气候变化 `5.54 kg CO2 eq` 与光化学臭氧 `0.00845 kg NMVOC eq`。全量表征之所以不是重复计算，是因为同一团排入大气的分子可以在对流层先参与光化学循环、随后以硝酸盐气溶胶被吸入或沉降到土壤与近海，各中点刻画的是不同机制或不同受体环节；这也解释了为何不能把比荷卢 `HOFP_NOx = -0.48` 单独解读为“多排 `NOx` 有益环境或健康”。相反，真正的错误与重复计算边界在于：第一，不同单位的中点当量绝不能直接相加；第二，当把臭氧呼吸死亡与细颗粒物（`PM2.5`）死亡一并折算到同一人体健康终点（如 `DALY`）时，必须核查流行病学浓度—响应函数是否做过双污染物控制，而不能单凭清单未拆分就宣称终点加总天然无重叠。

## 二、原始材料、载体哈希与权利边界

本单元严格区分公开导则／报告 PDF、官方 `EF-v3.1.zip` 内经中央目录与 HTTP `206` 范围请求及 CRC32 校验提取的 XML 成员，以及二轮转引文献：

| 原件与标识 | 本地核验载体 SHA-256 | 本单元拟使用的确切命题与定位 | 明确不作越界推断 |
| --- | --- | --- | --- |
| `ILCD 2011` LCIA 推荐导则（`JRC61049`） | `1adbcb9218443922f8c403a16b9d32b71df27c43c789925fc2afb606e8a0835f` | `§3.6`（pp. 47–55，`Table 14`）：`CML 2002` `POCP`（`Derwent et al. 1998`，乙烯参照，不含 `NOx`）、`TRACI` `MIR`、`EDIP 2003` 对照，以及推荐 `ReCiPe 2008` `LOTOS-EUROS`（`Van Zelm et al. 2008`，Level II，未纳植被端点损害） | 不将 `ILCD` 摘要当作已重跑 `LOTOS-EUROS` 或已直接核读 `Derwent 1998` 全文实验数据 |
| `EF 2.0/3.0` 方法报告（`Fazio et al. 2018`，`JRC109369`） | `06094aa57b49c754be6b846882f70ef1d803cf57617fc37de9341ea2d93f2421` | `§4.6`（p. 18）：泛指 `VOC` 因子由 `NMVOC` 与 `CH4` 按 2004 年欧洲排放（`14.0 Mt` 与 `47.8 Mt`，`Vestreng et al. 2006`）加权构造；表内将指标写作 `Photochemical ozone creation potential (POCP)`；`§4.7–§4.8`（pp. 19–20）`NOx` 跨酸化／富营养化说明 | 不抹平其指标名 `POCP` 与 `JRC130796` `Table 1` 指标名之间的差异 |
| `EF 3.1` 更新报告（`Andreasi Bassi et al. 2023`，`JRC130796`） | `938d7272de6769e8d484bcfc10f8c9be3688caa4a718d298790e8df7b3a65c58` | 摘要（p. 1）、`§1`（p. 3）、`§2 Table 1`（p. 6）、`§3 Table 2`（p. 8）与 `§3.2`（pp. 8–9）：`POF` 列入六项更新类别之一（仅把 `HCFC-140` 与 `dichloromethane` 的因子同步赋给同义流 `Methyl chloroform` 与 `Methylene chloride`），但 `Table 1` 漏标 `*` | 不替原报告补星号，也不宣称已重算 49 个代表性产品结果 |
| `EF-v3.1.zip` 官方 XML 成员（中央目录 `f0242b3d...` + HTTP `206` + CRC32 校验） | `b5c610fe`：`273c43df66bfd12f7884e1c3e19d23daade5af5b96bd1d7c68802d87f7755f4a` 等（共 7 个方法 XML 与 13 个基本流 XML） | 精确校验 `b5c610fe`（`1401` 条因子，含 `720` 条恒值 `<location>` 记录）与 `b5c611c6`、`b5c614d2`、`b5c619fa`、`b5c602c6`、`6209b35f`、`b5c629d6` 中同一流 UUID 的跨类别因子及 `HCFC-140`／`Methyl chloroform`／`1,1,1-trichloroethane` 流表分裂 | 原始 XML 仅留存私有任务证据目录，不随仓库或静态站点分发；不把单个成员校验冒充整包导入求解 |
| `ReCiPe 2016` 报告（`RIVM 2016-0104`）与论文（`Huijbregts et al. 2017`） | `RIVM`：`56f3124beba99cb3b2bd2d48bd9dc6a7d96a18275568e9575ea600052ec60597`；`2017`：`f6d1909e9b11c37c89303130037403fb5de724a099982498af5b29dd9c4ef543` | `Ch. 6`（pp. 51–56：`Table 6.1`、`6.2`、`6.5`、`6.6`）与 `§17 S2`（p. 127：`Table S2.1` 区域 `HOFP`/`EOFP`），以及 `2017`（pp. 139–142）双受体拆分说明 | 不自行改动跳号表序或 `Table 5.6` 原文笔误；不把 `TM5-FASST` 线性灵敏度矩阵外推为局地重污染时段预报 |

## 三、源内异文与边界保留清单

1. **`JRC130796` 的星号与指标名称异文**：报告摘要、`§1`、`Table 2`（标 `POF**`）与 `§3.2` 均明确记录 `Photochemical ozone formation, human health` 在 `EF 3.1` 做了同义词因子修补，但 `Table 1`（p. 6）该行未标 `*`；同时 `JRC109369` `§4.6`（p. 18）把该类别指标写作 `Photochemical ozone creation potential (POCP)`，而 `JRC130796` `Table 1` 与 `b5c610fe.xml` 写作 `Tropospheric ozone concentration increase`（`kg NMVOC equivalents`）。两处均按原件如实保留。
2. **`EF 3.1` 同义卤代烃的跨类别流表不对称**：`JRC130796` `§3.2` 将 `HCFC-140`（`d86cafdf-6555-11dd-ad8b-0800200c9a66`，`CAS 71-55-6`）与 `Methyl chloroform`（`9ae44d44-e251-11e6-bf01-fe55135034f3`，无 `CAS`）在 `POF` 中同步设为 `0.0152`（在 `Climate change` `6209b35f` 中同为 `161.0`），但平流层臭氧方法 `b5c629d6` 并未收录这两个流 UUID，而是收录 `1,1,1-trichloroethane`（`08a91e70-3ddc-11dd-9304-0050c2490048`，因子 `0.14`，且该流 XML 内 `CASNumber` 填作 `79-00-5`）；真正以同一流 UUID 同时出现在 `POF`、`Climate change` 与 `Ozone depletion` 三类未指定空气排放中的是 `chloromethane`（`08a91e70-3ddc-11dd-9677-0050c2490048`，`CAS 74-87-3`：`0.00845`、`5.54`、`0.015`）。正文与证据严格按实测 UUID 绑定，不凭化学俗名强行混同。
3. **`RIVM 2016-0104` 第 6 章表号跳跃与交叉引用笔误**：第 6 章正文在 `Table 6.1`（p. 53）与 `Table 6.2`（p. 54）之后直接出现 `Table 6.5`（p. 55）与 `Table 6.6`（p. 56），未出现 `Table 6.3`、`6.4`；且 p. 56 正文将紧随其后的 `Table 6.6` 写作 `"Table 5.6"`。原样记录，不臆测缺失表内容。

## 四、成文结构、下游核查与验收门禁

- **章节位置与体例守恒**：全部新增规范段落（预计 7 段 `cl-ozone119-*`）置于 `B16` 第四节《清单与类别指标》下的既有阅读小节 `<ReaderSection id="同一排放不同的环境问题" />` 中，排在既有收束段 `cl-path-multiple-paths` 之前。全书 32 章、120 个正式节、全部 953 条既有规范论述（含 `B14` Note 1 与 Note 33 的行内打印修正、`B16` 前 22 条注释编号及第 18 章对 `B16` 注 17 的两处引用）及 40 个案例下载文件保持不变。
- **跨章接口核对**：逐一核对 `B08`（基本流 UUID 与 `<location>` 匹配语义）、`B14`（情景与区域化承诺）、`B15`（甲烷与卤代烃 `GWP100`）、`B17`（一次与二次 `PM2.5` 呼吸健康损害及双污染物流行病学边界）和 `B20`（归一化与加权不可替代物理当量）。
- **三重独立审读与工程守卫**：
  1. 独立只读原件与数值复核子代理：逐条核查新增 `sources`、`ev-ozone119-*`、载体 SHA-256、XML 因子及全部结构化 `numericFact`；
  2. 独立全新上下文 `B16` 整章读者审读子代理：按序通读扩充后的 `B16` 全章（`30` 段），独立回答五道理解与迁移检验题；
  3. 可逆后继出版守卫（`scripts/reader-photochemical-ozone*.mjs` 与 `config/reader-photochemical-ozone*.json`）与独立出版工程安全审计：覆盖 `BigInt` 精确数值／比值守卫、`B14` 三代历史链与 `B16` 两代历史链（`acid-equivalents` -> `photochemical-ozone`）逆时序 DOM 守卫、Playwright 响应式／无脚本键盘激活／物理打印（`@media print`）检查、`pnpm validate`、全量 `pnpm test`、`pnpm typecheck`、干净 `pnpm build`、Docpact 门禁，随后完成 `Main` 合入、EdgeOne 线上 468 项字节与守卫核验及根仓库子模块精确集成。
- **停止与重开条件**：当上述四项问题在公开原件与官方 XML 证据下闭合、且反例与缺口显式留存时停止本单元扩写；平流层臭氧（`V5-B`）、电离辐射（`V5-L`）、第四部导语及 `content/docs/book/index.mdx:18` 链接标签回读、以及 `Programme #9` 全部八项全局验收门槛继续保持开放。
