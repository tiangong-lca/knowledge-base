---
title: 化石燃料热值、能量载体边界与燃料费用曲线
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when researching or reviewing fossil and energy-carrier resource comparison unit117
whenToUpdate:
  - when original-source, selected-factor, manuscript or review evidence changes
checkPaths:
  - _docs/editorial/2026-11-16-fossil-resources.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-15-comparative-continuation.md
  - 2026-11-16-mineral-resources.md
---

# 化石燃料热值、能量载体边界与燃料费用曲线

2026-11-16，[任务117](https://github.com/tiangong-lca/knowledge-base/issues/117)
继续既有比较 GOAL 和 Programme9。源码基线为矿产单元 PR116 合入 Main 并完成线上
468项字节审计、未修改出版守卫及精确根集成（[workspace #2409](https://github.com/tiangong-lca/workspace/issues/2409)／
`b7ecaa4b09c6a649739e820236e39070ec453d35`）后的
`ba8a101b1cd8eade0eb2da5e04323dd9dacaa53c`。本协议先于 `knowledge/` 与 `content/`
正文实施；候选原件调查、本地缓存 PDF/OOXML 核读及十个 EF3.1 官方包 XML 成员的范围提取
已经发生，如实记录，不称发现前盲预注册。

## 问题、已有解释与新增认识

B14 原第 3 段（`cl-lcia-mid-end-conversion-limits`）已经提出两条对照线索：
土地利用中点因子已按局地相对物种损失建立，转到终点不再增加新的局地因果步骤；
“化石资源则因完整路径认识不足，没有得到常数的中点到终点因子”。任务111与任务115
先后完成了土地恢复时间窗和原生矿产（ADP、SOP、ReCiPe 统一铜费用率与逐金属 SCP）的
比较，并明确保留化石资源与其余环境路径责任。

若只停留在“化石资源没有常数转换因子”这一句结论，读者仍无法回答三个实际比较问题：

1. 既然 `ILCD 2011` 曾指出纯能量或火用（exergy）即使取走最后 1 t 资源也不会改变单位数值、
   不能反映稀缺，从而在方法推荐中拒绝固有性质指标并把金属与化石燃料合入同一 `kg Sb eq`
   储量基数类别，后续 `EF 3.0/3.1` 与 `ReCiPe 2016` 为何又在中点把化石燃料做成等热值换算
   （`1 MJ/MJ` 或 `kg oil-eq`）？
2. 同以“能量载体可相互替代”为理由时，不同体系的基本流性质（净热值 `LHV` 与高位热值 `HHV`）
   和类别边界是否一致？特别是核能链开采的天然铀，为何在 `EF 3.0/3.1` 中进入名为
   `Resource use, fossils` 的类别并按 `1 MJ/MJ` 计分，而在 `Van Oers 等 2020` 元素 `ADP`
   与 `ReCiPe 2016` `SOP` 中却按质量 `kg` 留在矿产／元素稀缺类别？
3. 在 `ReCiPe 2016` 内部，为什么同为 `1 kg oil-eq` 中点热值的原油、天然气、硬煤和褐煤／泥炭，
   进入终点未来额外开采费用（`SCP`，`USD2013`）后不能乘同一个转换常数，平等主义情景对褐煤和
   泥炭采用硬煤每千克代理值又会造成怎样的比值后果？

本单元围绕上述共同问题展开概念与原理对照，使 B14 的土地、矿产、化石三组例子分别展示
“中点已含效应尺度故可正比例重标”“固定铜代理保序而逐金属拟合改序”“中点按固有热值合并而
终点改按各燃料成本曲线估计，故不存在公共转换常数”三种不同的中点—终点关系。

## 选读原件、载体与证据职责

| 原件与版本 | 实际核查内容与载体身份 | 不可代证的边界 |
| --- | --- | --- |
| EC-JRC 2011，*ILCD Handbook: Recommendations for LCIA in the European context*，`§3.11`（印 pp. 92–102，重点核读 `§3.11.6–§3.11.9` 印 pp. 99–101） | 拒绝第一类火用／固有性质中点的稀缺性理由；推荐第二类 `CML 2002` 储量基数 `ADP`（`kg Sb eq`）合并评价金属与化石燃料；将第四类终点边际开采成本（`ReCiPe 2008`）列为暂不推荐的过渡方案 | 未读 `Van Oers 等 2002` 原报告全文、USGS 历史原始表或 `ReCiPe 2008` 原报告 |
| Fazio 等 2018，`JRC109369`（`EUR 28888 EN`，DOI `10.2760/671368`），未编号封面／未编号版权引用页、印 p. 4 作者栏（第 7 位署 `Edward Diaconu`）与 `§4.10`（印 p. 24）；对照 Andreasi Bassi 等 2023，`JRC130796`（`§1` p. 3、`§2` p. 5 及表 1 pp. 6–7） | `JRC109369`（2018 年 EF 2.0 推荐基准，后为 EF 3.0 与 EF 3.1 沿用）相对 ILCD 的两项改变：矿产改用最终储量 `kg Sb eq/kg`，能量载体单列为 `ADP fossil` 并赋 `1 MJ/MJ`；明确记载原模型中铀按质量 `kg` 给因子，而 ILCD 流表将铀列为以 `MJ` 计量的能量载体，故对铀赋 `CF = 1`；`JRC130796` 确认两资源类别在 EF 3.1 未作方法更新 | 不代证 `CML v4.8 (2016)` 原始软件发行表、核燃料循环热效率或反应堆利用实证 |
| 官方 `EF-v3.1.zip` 指定 XML 成员（经中央目录 `f0242b3d...`、HTTP 206 `Content-Range`、展开长度与 CRC32 验证） | `lciamethods/b2ad6110-c78d-11e6-9d9d-cec0c932ce01.xml`（`Resource use, fossils`，`01.00.010`）全部 6 项输入流（褐煤、原油、硬煤、天然气、泥炭、铀，均为 `1.00E+00`）及模型假设“Full substitution among fossil energy carriers is assumed”；对照 `b2ad6494-c78d-11e6-9d9d-cec0c932ce01.xml`（`Resource use, minerals and metals`，48 条因子）不含铀；核查 `3e4d2966...`（铀流）、`fe0acd60...a6f8...` 等五种化石燃料流、`93a60a56-a3c8-11da-a746-0800200c9a66.xml`（`Net calorific value`／`Lower heating value`）及 `93a60a57...`（`Units of energy`，`MJ`） | 仅验证所取 10 个命名 XML 成员，不声称重算整包 206,912,900 字节或核验外部 LCA 软件导入转换器 |
| Van Oers、Guinée、Heijungs 2020（DOI `10.1007/s11367-019-01683-x`）正文印 pp. 294–295、305–306（末词延至 p. 307 首行）与 `ESM1` 工作簿 | 2002 年将 `ADP` 拆成化石燃料与元素两类的说明；表 3 注 1 与归一化比较指出 PEF／Sala 等将铀移入化石能源／能量载体类别，而作者以铀亦有非能源用途为由将其留在元素耗竭类别；`ESM1` `recommended ADP & norm data!A109:L109`（`I109`）铀缓存全精度 `7.8231761897435744E-3 kg Sb eq/kg` 及 `characterisation model!C10、C12:C13、C15、C30`（`C14` 空白） | 本工作簿明确声明只更新元素 `ADP`，不提供化石燃料 `ADP` 重算表 |
| `RIVM Report 2016-0104`（原 2016 版）第 12 章印 pp. 90, 92、第 13 章印 pp. 95–97、参考文献印 p. 117、`§23.1` 印 pp. 183–184、`§24` 印 p. 187；对照 Huijbregts 等 2017 论文印 pp. 142, 144–145 | 中点 `FFP = HHV_x / HHV_oil`（表 13.1 五种化石燃料及表 S9.1 的 ecoinvent 高位热值）；终点 `SCP`（表 13.2 原油、硬煤、天然气 `USD2013` 值及褐煤、泥炭在 `E` 视角借用硬煤 `0.034 USD2013/kg` 的代理说明）；图 13.1–13.2、印 p. 117 中 `Vieira et al. 2016b` 实为矿产 `SOP` 论文与表 S9.2 回归参数／储量；铀留在第 12 章表 12.2 与表 S8.1 矿产 `SOP`（`3.58E+01`／`2.52E+01 kg Cu-eq/kg`，`§23.1` 记载 `CME` 取 `NEA-IAEA 2014`、`R` 取 `Hall and Coleman 2012`、`URR` 取 `UNEP 2011`） | 未取得未刊稿 `Vieira and Huijbregts (in preparation)`、`IEA 2013` 原始数据表或 `Ponsioen 等 2014` 原文；不重算或修补原报告未闭合参数 |

已核对的本地原件 SHA-256：

- `next-unit-ilcd2011.pdf`：`1adbcb9218443922f8c403a16b9d32b71df27c43c789925fc2afb606e8a0835f`
- `jrc109369.pdf`：`06094aa57b49c754be6b846882f70ef1d803cf57617fc37de9341ea2d93f2421`
- `ef-jrc130796.pdf`：`938d7272de6769e8d484bcfc10f8c9be3688caa4a718d298790e8df7b3a65c58`
- `EF-v3.1` `Resource use, fossils` XML（`b2ad6110-c78d-11e6-9d9d-cec0c932ce01.xml`）：`d9b4f8480a8e916e37b1403fc70e68241edbe71098e26cadc41e5f5caaa9fb93`
- `EF-v3.1` `Resource use, minerals and metals` XML（`b2ad6494-c78d-11e6-9d9d-cec0c932ce01.xml`）：`903dc1764187342f518c5fc00e6519cd0082cfe207569592f77adadb18568b06`
- `adp-2020.pdf`：`d40bf71bd658311fbeb1d926f8aa05b1a1cb0a82d9deab11f1bd447f618eee62`；`van-oers-2020-esm1.xlsx`：`a5e1bcd6e75840dc3d7bd5d78bb3f111048e8c8789cabea439c2919eac83830d`
- `rivm2016-repository.pdf`：`56f3124beba99cb3b2bd2d48bd9dc6a7d96a18275568e9575ea600052ec60597`；`recipe2016-2017.pdf`：`f6d1909e9b11c37c89303130037403fb5de724a099982498af5b29dd9c4ef543`

已有作品、载体与读本沿用既有 ID 并仅追加本次真实选读片段，不改动既有土地、酸化、流边界或矿产段落的定位与取得历史。原始 PDF、XLSX 与提取的 XML 片段留在私有任务证据目录，不进入公开仓库或 `out/`。

## 对齐、控制、替代解释与保留的原件异文

比较围绕两层受控基准展开：

1. **中点热值与能量载体边界对照**：
   - 在五种化石资源（原油、天然气、硬煤、褐煤、泥炭）内部，`ReCiPe 2016` 表 S9.1 采用高位热值 `HHV`（`45.8`、`9.9`、`19.1`、`9.9 MJ-eq/kg` 及天然气 `38.3 MJ-eq/Nm³`），表 13.1 将 `HHV_x / 45.8` 舍入为两位小数（`1`、`0.84`、`0.42`、`0.22`、`0.22 oil-eq/unit`；精确商分别为 `0.83624...`、`0.41703...`、`0.21615...`）。
   - `EF 3.1` 的 `Resource use, fossils` 方法将参考流属性指向 `93a60a56-a3c8-11da-a746-0800200c9a66`（`Net calorific value`，即低位／净热值 `LHV`，参考单位 `MJ`），对所有列入的能量载体输入流一律赋 `1.00E+00 MJ/MJ`。因此，即便不考虑核燃料，两套中点也只有在“先按各自规定的热值属性把实物开采量折算为能量、并忽略两位小数舍入与高低位热值比差异”的条件下才呈比例对应，不能把 `1 kg oil-eq` 无条件写成恒等于 `45.8 MJ` 的 `EF` 净热值。
   - 在类别外延上，`EF 3.1` 的 `Resource use, fossils` 共含 6 项基本流：除上述五种化石燃料外，第 6 项是 `uranium`（`3e4d2966-6556-11dd-ad8b-0800200c9a66`，分类 `Non-renewable energy resources from ground`，因子 `1.00E+00`），且 `Resource use, minerals and metals` 不含铀。相反，`Van Oers 等 2020`（`ESM1` 行 109：`7.8231761897435744E-3 kg Sb eq/kg`，正文表 3 显示 `7.8E-03`）与 `ReCiPe 2016`（表 12.2：`I` 视角 `3.58E+01`、`H/E` 视角 `2.52E+01 kg Cu-eq/kg`，由表 S8.1 品位—吨位参数直接算出而非价格外推星号项）都把铀按元素质量归入矿产／元素耗竭，化石燃料中点不包含铀。比较核电与煤电／气电时，这一边界差异会直接改变铀资源负担落在“化石资源”还是“矿产资源”指标上。

2. **同中点热值下的终点费用分叉控制**：
   - 取 `ReCiPe 2016` 表 13.1 中点同样等于 `1 kg oil-eq` 的四组开采输入：`1 kg` 原油、`(1 / 0.84) Nm³ ≈ 1.190 Nm³` 天然气、`(1 / 0.42) kg ≈ 2.381 kg` 硬煤、`(1 / 0.22) kg ≈ 4.545 kg` 褐煤或泥炭（同时保留按未舍入 `HHV` 比 `45.8 / 38.3`、`45.8 / 19.1`、`45.8 / 9.9` 计算的对照说明，确认不改变数量级与排序结论）。
   - 代入表 13.2 的终点 `SCP` 因子（原油 `0.457 USD2013/kg`、天然气 `0.301 USD2013/Nm³`、硬煤 `0.034 USD2013/kg`；褐煤与泥炭在 `I/H` 未给值，在 `E` 视角借用硬煤 `0.034 USD2013/kg`）：
     - 在 `I` 与 `H` 视角下，相同 `1 kg oil-eq` 中点分别对应原油 `0.457 USD2013`、天然气 `0.301 / 0.84 ≈ 0.358 USD2013`、硬煤 `0.034 / 0.42 ≈ 0.081 USD2013`，而褐煤／泥炭因缺成本与产量资料未计入终点（显示空白）；原油与硬煤相差逾 `5.6` 倍。
     - 在 `E` 视角下，褐煤与泥炭按预防原则直接套用硬煤“每千克资源 `0.034 USD2013/kg`”而非按热值折算，导致相同 `1 kg oil-eq` 下褐煤／泥炭的终点费用变为 `0.034 / 0.22 ≈ 0.155 USD2013`，约为同热值硬煤（`≈ 0.081 USD2013`）的 `1.9` 倍（精确比 `0.42 / 0.22 = 1.90909...`）。
   - 这组演算在已发表因子表内部直接证明：从中点热值到终点额外开采费用不是同一物理量的单位换算，而是从“燃烧热值可替代”切换到“各燃料储量与采出成本曲线不同”；任何单一正常数都无法把相同的 `kg oil-eq` 映射到上述终点结果。

3. **必须保留的原件内部异文与数据缺口**：
   - `RIVM 2016-0104` 印 p. 96 将 ecoinvent 高位热值表误引为 `Table S9.2`（实为印 p. 187 `Table S9.1`），将原油累计成本—产量曲线误引为 `Figure 11.2`（实为印 p. 97 `Figure 13.2`），并将对数线性成本式 `C_x = 1 / (a_x + b_x · ln(CFE_x))` 归引至印 p. 117 所列的 `Vieira et al. 2016b`（18 种矿产的矿石潜势 `SOP` 论文，区别于 `Huijbregts 等 2017` 对 `2016a/b` 的反序标号），而表 13.2／S9.2 实际依据标为未刊稿 `Vieira and Huijbregts, in preparation`。
   - 印 p. 96 定义 `CFE_x` 单位为 `kg` 或 `Nm³`，表 S9.2 亦列原油 `CFE = 1.61E+14 kg`、`a = 40.0`、`b = -4.45`，但直接把 `1.61E+14` 代入 `40.0 - 4.45 · ln(CFE)` 会得到负数（约 `-105.6`）；对照图 13.2 横轴标签 `Crude oil production (billion barrels of oil)` 可见印刷式的横坐标单位与表列 `kg` 并未在同一量纲上闭合，且硬煤 `CFE` 列为 `n.a.`，表 S9.2 `Current cost` 标为 `USD2008` 而表 13.2 `SCP` 标为 `USD2013`。
   - `EF-v3.1` 的 `Resource use, fossils` XML 与六个能量载体流 XML 在引用 `93a60a56-a3c8-11da-a746-0800200c9a66` 时，其内嵌 `<common:shortDescription>` 留有历史误标文字 `"Radioactivity"`（方法文件自身 `referenceQuantity` 写 `"MJ"`，而被引用的流属性文件本体明确为 `"Net calorific value"`／`"Lower heating value"`；原油流 XML 还保留了 `"synonyms were erroneous; removed"` 的苯同义词残留）。这些原包元数据瑕疵只据实记录，不擅自改写原文件或夸大为数值计算错误（数值匹配按 UUID 与 `meanValue = 1.00E+00` 运行）。

## 成文与审查安排

保持 B14 原三节及全部锚点不变，维持全书 32 章、120 个正式节，按实际三节结构增补八段规范论述（`3 + 1 + 4`），使 B14 总段落由 26 段变为 34 段：

- 在第 1 节（`指标的位置`）紧接矿产中点段（`cl-mineral115-sop`）之后增补三段（`cl-fossil117-scarcity-energy`、`cl-fossil117-heating-basis`、`cl-fossil117-uranium-boundary`）：对照 `ILCD 2011` 对纯热值／火用缺稀缺性的批评、`EF`（2018 推荐方法及沿用该模型的 `EF 3.0`、`EF 3.1`）与 `ReCiPe 2016` 基于热值互换的中点定义（区分净热值 `MJ` 与高位热值 `kg oil-eq`），以及天然铀因基本流单位与用途界定不同而在 `EF` 与 `ADP`／`ReCiPe` 之间跨越“化石—矿产”边界的后果。
- 在第 2 节（`情景与地点`）紧接矿产储量时间窗段（`cl-mineral115-reserves`）之后增补一段（`cl-fossil117-scenario-proxy`）：显式对齐个人主义／等级主义／平等主义三种文化视角与前文短期／基准／长期预防情景，说明化石 `SCP` 虽声明无视角差异，但褐煤与泥炭在 `I/H` 留空、在 `E` 借用硬煤 `0.034 USD2013/kg` 的补缺代理仍改变了情景覆盖。
- 在第 3 节（`模型与资料`）紧接土地附表核对段（`cl-land111-printed-record`）之后、矿产排序与公共铜费用倍率段（`cl-mineral115-rank`）之前增补四段（`cl-fossil117-equal-midpoint`、`cl-fossil117-proxy-consequence`、`cl-fossil117-printed-limits`、`cl-fossil117-bridge`）：先用同 `1 kg oil-eq` 输入演示化石资源为何不存在常数中点—终点转换因子、分析 `E` 视角按每千克质量借用硬煤因子的比值反转与原报告未闭合公式／引文界限，再引出下文矿产尝试固定铜费用系数与逐金属曲线的对照。
- 全部 935 条 `#115` 之前的规范论述（含 `cl-lcia-midpoint-pathway` 注 1 具名更正及打印可见内联样式——本轮有意保持 `[01]` 原文与注 1 历史修订锚点冻结，由 `[10]` 首句从金属元素矿产自然引入化石能源开采）与 `#115` 其余 9 条矿产论述保持原文本、ID 与证据不变；仅对收束段 `cl-mineral115-judgment`（现注 33）作一处具名范围同步（将“土地和矿产两个例子都说明”扩为“土地、化石能源与矿产三个例子都说明”，并补绑 `ev-fossil117-rivm-scp-endpoint`），以保留原注身份和打印可见的公开更正说明记录。

受影响相邻单元兼容性核查：

- `B08`（`flows-exchanges-and-boundaries`）：本单元核实的 `93a60a56-a3c8-11da-a746-0800200c9a66`（净热值 `MJ`）与 `uranium` 流分类直接印证 `B08` 关于基本流参考流属性决定方法匹配界面的结论，不改动 `B08` 已审正文。
- `B12`（`electric-power-systems`）与 `B15`（`climate-metrics`）：在 `cl-fossil117-uranium-boundary` 与 `cl-fossil117-proxy-consequence` 中明确区分地下能源资源开采指标、电厂发电转换效率及化石燃烧温室气体排放，避免把燃料热值中点误读为供电排放或气候影响。
- `B20`／`B21`／`B24`：明确 `ReCiPe` 化石 `SCP`（`USD2013`）仅为模型化的未来额外开采成本代理，不替代政策稀缺赋权、本地化资源耗竭指数（`RDI`）或项目当期燃料采购成本（`LCC`）。

首轮独立原件／数值核查与完整 B14 读者审读发现及 `v2` 处置：

- 独立原件／数值核查（对照全部 PDF／OOXML／EF3.1 XML 原件）确认 31 项数值字面量、UUID、CRC32／SHA-256 及 `0.457`、`0.358`、`0.081`、`0.155`、`-105.6` 全部算式无误，并指出五项元数据定位精修点，已在 `v2` 悉数修正：(1) `JRC109369` 印 p. 4 第 7 作者实署 `Edward Diaconu`，封面与版权页为前两页未编号叶，且明确其为 2018 年 EF 2.0 基准并为 EF 3.0／3.1 沿用；(2) `ESM1` `characterisation model` 说明文字位于 `C` 列（`C10、C12:C13、C15、C30`）而非 `A` 列；(3) `RIVM 2016-0104` `§23.1`（印 pp. 183–184）中铀的 `CME` 取 `NEA-IAEA 2014`、`R` 取 `Hall and Coleman 2012`、`URR` 取 `UNEP 2011`；(4) `RIVM 2016-0104` 印 p. 117 中 `Vieira et al. 2016b` 实为矿产 `SOP` 论文而非金属成本论文；(5) `Van Oers 2020` 表 3 注 1 讨论主体在印 pp. 305–306（末词延至 p. 307）。
- 独立新上下文完整 B14 读者审读完成了理解与迁移五问作答，指出四项可读性与过渡改进点，已在 `v2` 悉数修正：(1) `cl-fossil117-scarcity-energy` 将“EF 3.0/3.1（据 2018 年…）”顺畅改为时间正序表述；(2) `cl-fossil117-scenario-proxy` 在首次点名个人主义／等级主义／平等主义时显式对齐前文的短期／基准／长期预防情景；(3) `cl-fossil117-printed-limits` 结合原件印 p. 117 改为“该报告矿产章所引的额外矿石潜势论文（Vieira 等 2016b）”，同时消除提前引用后文金属成本论文的倒置与章内“前节”指代落空；(4) `cl-fossil117-bridge` 末尾明确预告“下文先对照不同矿产中点的排序，再检验这种固定费用倍率能够保留什么、又会掩盖什么”，并对 `cl-mineral115-judgment` 作具名三例同步，同时在 `cl-fossil117-proxy-consequence` 去掉生硬章名书名号而用自然议题呼应后文气候讨论。

独立复核确认后，建立可逆后继守卫 `reader-fossil-resources`（扩展 `validateDatedHistoryOutput` 支持 B14 三代共享节历史控件逆序链，并验证注 1 与注 33 两处公开更正说明在真实打印媒体下均可见），完成独立出版工程审查、公开 JSON 与 468 项静态导出产物校验。

## 检索边界、停止与重开

本轮按 `abiotic resource depletion fossil`、`ADP-fossil`、`Fossil Fuel Potential`、`uranium energy carrier ILCD PEF`、`JRC109369`、`Vieira Huijbregts fossil surplus cost` 等检索词与既有缓存原件交叉核查，登记检索截止与实际核查日期。已能基于一手规范报告、方法论文与 `EF 3.1` 官方包 XML 完整回答上述三项问题时停止本单元扩检。若未来取得 `Vieira & Huijbregts` 化石成本原稿、`IEA 2013` 原始成本曲线、`CML v4.8` 原始表或 `EF` 流表后续修订版，可重开相应未闭合细节。本单元仅完成第四部资源路径中的化石与能量载体比较；平流层臭氧、对流层光化学臭氧、电离辐射、跨路径前体物重叠、阅读导论 `index.mdx:18` 链接文字更新及第四部连续回读仍在后续单元继续推进。
