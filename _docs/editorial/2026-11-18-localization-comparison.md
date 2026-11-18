---
title: 空间表征尺度、归一化分母同构与制度采纳边界的本地化比较协议
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when researching, writing or reviewing Part V localization comparative unit 137 in B21
whenToUpdate:
  - when original-source, released-data, manuscript or independent review evidence changes
checkPaths:
  - _docs/editorial/2026-11-18-localization-comparison.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-15-comparative-continuation.md
  - 2026-11-18-weighting-and-valuation.md
---

# 空间表征尺度、归一化分母同构与制度采纳边界的本地化比较协议

2026-11-18，[任务 137](https://github.com/tiangong-lca/knowledge-base/issues/137)。继续既有比较修订 GOAL 与 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)，源码基线为第五部双章赋权与估值比较单元 [PR #136](https://github.com/tiangong-lca/knowledge-base/pull/136) 合入 `main` 的精确提交 `0518e6b529789b8dde9ffebf36d2eeb716a94390`（Git 树 `0c486874ebf427f60cc75391b72ee7c6df0d676e` 与已审头 `5f56b5b05c072ea578310351ac7d4bdf68bdd1d5` 一致，已完成 `https://prism.tiangong.earth` 线上全部 468 项字节审计、未修改出版守卫核验及根集成 [workspace#2442](https://github.com/tiangong-lca/workspace/issues/2442) / [PR #2443](https://github.com/tiangong-lca/workspace/pull/2443) `f93287bff3a03c070cff40fa5f21feb891676c48`）。本前置协议在修改任何 `knowledge/`、`content/` 或 `config/` 文件之前先行提交并推送。

## 一、核心比较问题与章节衔接设计

对照持续比较责任表（`_docs/editorial/2026-11-15-comparative-continuation.md` 第 82 行与第 172 行）及前章《生态稀缺赋权》在任务 135 中对本章的交接问题，第五部《尺度与取舍》中的《影响评价本地化》（`content/docs/book/localization-evidence-and-denominators.mdx`，现含 28 条规范论述，无案例文件绑定）围绕一个核心问题展开系统比较：**当评价者把一套方法的地理标签换成中国、香港、欧洲或“全球”时，究竟是改变了环境迁移暴露模型、替换了人均归一化参照分母、重设了政策或偏好权重，还是仅仅在相同数字上贴了地区名称或援引了程序标准？**

现有 28 条论述梳理了杨建新等（2001）的人均参照与目标比值权重、林逢春等（2005）与官方统计及“十五”计划的二氧化硫链条、香港房屋委员会建材项目（2005）的分步借用、国家标准登记事件以及谢明辉等（2022）的文献计量分母，但尚未与国际主流区域化表征方法、全球／区域归一化工作簿及制度采纳规则正面交锋。本单元在不重复前章（瑞士平方超标率、欧盟公众—专家乘稳健度权重、2,752 个数据集更新漂移、公开比较主张加权禁令）的前提下，把中港历史文献放入跨体系比较坐标：

1. **流位置标签、制度白名单与生物物理区域化的三重分离**：对比欧盟环境足迹 `EF 3.1` 数据集合规指南（`Fazio et al. 2020` 第 5.2.6 节与附录 1 表 6—7）及四份官方 `ILCD` 方法文件——水资源使用（`209` 个国家／地区位置码加未指定默认值，西班牙 `77.7`、中国 `42.4`、德国 `1.36`、瑞士 `1.34`、日本 `0.897 m³ world eq/m³` 相差 `86.6` 倍）、酸化（仅容许 `36` 个欧洲国家／地区位置码，德国 `SO₂` `2.281`、瑞士 `0.494`、西班牙 `0.108 mol H⁺-eq/kg` 相差 `21.1` 倍，而中国、美国、日本被排除在白名单外统一落回未指定默认值 `1.31`）以及光化学臭氧与颗粒物前体（虽列出 `36` 个欧洲国家位置码，但 `NOx = 1.0 kg NMVOC-eq/kg`、`SO₂ = 8.0×10⁻⁶ disease incidences/kg` 在全部 `36` 个位置完全持平，初级 `PM₂.₅` 甚至不设国别位置码），并与 `ILCD 2011` 第 2.4 节明确声明其推荐因子仅针对欧洲情境相对照。
2. **“全球”归一化分母背后的区域外推与清单完备度偏倚**：直接核查 `Normalisation_Weighting_Factors_EF_3.1.xlsx` 的 `NFs EF3.1_calculation` 明细表（`1,803` 条流记录，全球人口 `6,895,889,018`）：酸化、颗粒物、陆地富营养化 `100%` 取自全球 `EDGAR v4.3.1` 排放清单（欧盟／中国简单比例外推占 `0%`），而淡水生态毒性人均基准（`56,716.59 CTUe/人`）中竟有 `69.25%` 来自欧盟农田排放除以欧盟耕地全球占比 `0.0384`（放大约 `26.04` 倍）、`27.56%` 来自欧盟工业排放乘全球生产总值放大系数 `14.12`，合计 **`96.81%` 由欧盟区域数据外推**；人体非致癌与致癌毒性中另有 `11` 条重金属流（占总量 `11.62%` 与 `4.24%`）按中国排放放大为全球值。结合 `PEF Method`（`JRC115959`）与 `LC-IMPACT`（`Verones et al. 2020` 第 4.2 节），阐明从区域分母改称“全球分母”为何不能消除底数覆盖不对称。
3. **归一化分母与权重的双尺度同构定律及开放经济体错配**：对照 `CML 2001` 第 3 分册第 4.6 节、`ILCD 2010` 第 6.7.6 节与 `UNEP GLAM` 第三阶段范围界定报告（第 5 节及表 3）与本章杨建新等（2001）、“十五”计划两控区及香港 `C1169` 报告：单做区域人均归一化或配固定工作坊权重时，现状人均污染越高的地区分母越大、单位排放的归一化得分反而越低（“重污染稀释悖论”），而在服务型城市或小型开放经济体用领土内人均排放（如香港 2000 年人均温室气体 `5,922.49 kg CO₂-eq/(人·年)`，低于欧盟 `EF 3.1` 全球基准 `7,553.08` 约 `21.6%`）去除全球供应链清单又会放大进口制造负担；唯有像杨建新等（2001）以同口径同人口政策目标构造 `WF = B/G` 使现状分母 `B` 相消，或像“十五”计划对两控区同步收紧削减率（`-20%` 即 `WF = 1.25`，高于全国 `-10%` 即 `1.111`），才能避免现状高排放自动压低权重。
4. **自然生物物理单元与行政国界的错位及次国家聚合偏差**：核查 `LC-IMPACT`（`Verones et al. 2020` 及总体报告表 1.4—1.6：`56` 个大气源区、`11,000` 余流域、`804` 个陆地生态区与 `449` 个淡水生态区）与 `ReCiPe 2016`（`RIVM 2016-0104` 附表 S1.1—S1.2、S6.3—S6.4）：在大气传输网格中，`ReCiPe 2016` 把香港、澳门与中国大陆合并为同一个源区（初级 `PM₂.₅` 中点 `2.90 kg PM₂.₅-eq/kg`、终点 `1.7×10⁻³ DALY/kg`），而一水之隔的台湾单独成区（`0.75` 与 `3.5×10⁻⁴ DALY/kg`，相差 `4.86` 倍）；在淡水生态耗水中，中国全国均值（`3.91×10⁻¹² species·yr/m³`）掩盖了珠江／西江流域（`1.67×10⁻¹²`，供水华南与香港）与黄河（`4.84×10⁻¹²`）、长江（`5.52×10⁻¹²`）之间 `3.31` 倍的南北反转。
5. **跨模型空间排序翻转与中点—终点／局地—全球生态脆弱度分化**：对比同一千克近地面初级 `PM₂.₅` 在中国、瑞士与德国之间的跨国排序——`ReCiPe 2016` 线性暴露响应下中国大陆及港澳（`1.7×10⁻³ DALY/kg`）高于瑞士（`1.5×10⁻³`）与德国（`1.3×10⁻³`），而在 `UNEP GLAM 2024` 凹形非线性剂量响应的未指定城乡边际因子下，因高背景浓度压平边际斜率且农村排放权重高，排序彻底反转为瑞士（`6.45×10⁻⁴`）与德国（`6.31×10⁻⁴`）远高于中国（`2.15×10⁻⁴`，相差 `3.00` 倍；中国农村边际 `2.10×10⁻⁴` 对城市边际 `5.57×10⁻⁴`），若改用城市平均因子则再次反转为中国（`1.20×10⁻³`）高于德国（`8.54×10⁻⁴`）与瑞士（`6.99×10⁻⁴`）。同时核实 `ReCiPe 2016` 中点到终点的国别反转（中国 `1 kg SO₂` 陆地酸化中点 `1.55` 高于全球均值 `1` 达 `55%`，终点 `1.40×10⁻⁷ species·yr/kg` 却低于全球均值 `2.12×10⁻⁷` 达 `34%`；`NOx` 臭氧人体健康 `2.07` 对生态 `0.07` 与西葡 `1.18` 对 `3.41` 的跨受体反转）以及 `LC-IMPACT` 区分区域物种消失与全球不可逆灭绝的脆弱度系数 `VS`。
6. **“本地化”四重主张的制度与实证拆解**：综合中国 `GB/T 24040—2008`／`24044—2008` 程序采标、欧盟 `EF 3.1` 增补件表 1（强制锁定因子包却将 `ISO 14044` 命名、评审与数据质量合规标为 `"Not defined"`）、香港 `C1169` 模块化部件拼装、谢明辉等（2022）`186/243`（`77%`）文献来源占比，以及 `UNEP GLAM` 第 2 卷第 2 章与第 7.6 节大米案例（中国、印度、瑞士／美国三地情景），建立可复用的四层核查准则与两张响应式对照表。

## 二、已核本地一手载体与 SHA-256 清单

1. `Normalisation_Weighting_Factors_EF_3.1.xlsx`：SHA-256 `8a5ceda370b2c312d085032fb9c154ce56f45e46c4d1dbba4e56cd9aedaab554`（`462,081` 字节，核 `NFs EF3.1` 与 `NFs EF3.1_calculation` 共 `1,803` 条流明细）。
2. `Guide for EF compliant data sets (Version 2.0)`（`Fazio et al. 2020`，`KJ-NA-30175-EN-N`）：SHA-256 `c5dbc3b11c0379f59927be52aadf6eb146b6067aed8f9357d24bd800c986296a`（`1,845,235` 字节，49 页，核第 5.2.6 节 `pdfIndex 20`、第 5.4 节 `pdfIndex 30`、附录 1 表 6—7 `pdfIndex 46`）。
3. `Updates on “Guide for EF compliant data sets (Version 2.0)” for EF 3.1`（`EC-JRC 2022`）：SHA-256 `76a921ca994964f158a5baf4962be2cb1cdeb73583835f7c047eed2087a952b7`（`362,145` 字节，5 页，核第 2—5 页 `pdfIndices 1, 3, 4` 酸化修正与表 1 六类合规声明）。
4. `Suggestions for updating the Product Environmental Footprint (PEF) method`（`Zampori & Pant 2019`，`JRC115959`）：SHA-256 `6f2a27bf7fc1d1104ecaf9e77b208cc4e65b20e567b200975a67671133e1fab9`（`4,288,498` 字节，248 页，核全球 2010 人均归一化基准替代欧盟 27 国基准的方法规定）。
5. 欧盟 `EF 3.1` 四份官方 `ILCD` 方法 XML：水资源 `b2ad66ce-c78d-11e6-9d9d-cec0c932ce01.xml`（`f06fec854a386ecd9c2d6b2de3d735b341b9f5ac68990764a3e1fd84e91268d2`）、酸化 `b5c611c6-def3-11e6-bf01-fe55135034f3.xml`（`1a09e9e8533cc6f1027f260c2672ca6f8dd231618fe81939ed1fc22d5e066f8f`）、光化学臭氧 `b5c610fe-def3-11e6-bf01-fe55135034f3.xml`（`273c43df66bfd12f7884e1c3e19d23daade5af5b96bd1d7c68802d87f7755f4a`）、颗粒物 `b5c602c6-def3-11e6-bf01-fe55135034f3.xml`（`bbde0609351a78fe774c39d3c2a90b8cc463cf3f57d62ffbd4c4f9cb6cb5b721`）。
6. `CML 2001 Part 3: Scientific background`（`Guinée et al. 2002`）：SHA-256 `b77c333e6b199103e35da962568922f3342f0daf119b2ae20eac937adf19f206`（`1,228,762` 字节，314 页，核第 4.6 节 `pdfIndices 243–245` 区域归一化分母偏倚警示）。
7. `ILCD Handbook: General guide`（`2010`）与 `Recommendations for LCIA in the European context`（`2011`）：SHA-256 `7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f`（417 页，核 `pdfIndices 133–134`）与 `1adbcb9218443922f8c403a16b9d32b71df27c43c789925fc2afb606e8a0835f`（159 页，核第 2.4 节 `pdfIndex 25` 欧洲适用域限制）。
8. `RIVM Report 2016-0104`（`ReCiPe 2016 v1.1`）：SHA-256 `56f3124beba99cb3b2bd2d48bd9dc6a7d96a18275568e9575ea600052ec60597`（`3,280,796` 字节，194 页，核 `pdfIndices 122–127, 141, 144–146, 171, 178`）。
9. `LC-IMPACT` 期刊论文（`Verones et al. 2020`）与总体报告 v1.0：SHA-256 `42fa6a40f98d884135c7d4771179b0b4dfdc1f83220ea6926ee27632b4ece92e`（19 页，核 `pdfIndices 3, 5, 6, 14`）与 `6e3e3cb7f2e93dd9e8a770fd11a960d0273e91f82611c536a6268db6a1f04ea4`（184 页，核 `pdfIndices 6, 7, 15–17`）。
10. `UNEP GLAM` 第 2 卷（`2019`）、第三阶段范围报告（`2020/2021`）与 `V1.0.2024.10` 颗粒物因子工作簿：SHA-256 `25a581923bca994a7258c7e5748ea91f36d0f735d8ad2eaefdfb465b71702ca1`（202 页，核 `pdfIndices 46, 52–53, 154–155, 181`）、`6e9d7c23357801cf650432bcd0ea3c8d18699e985674320be033d65f83cd6d45`（166 页，核 `pdfIndices 136–140`）与 `86ff3e060ac78b0c6ed57f0d1d07328dae937fd8362789079a41b62fdfc3c99b`（核 `lciamethods_CF` 第 `4466–4564, 4754–4852, 6482–6580` 行）。

## 三、既有论述守恒、有界同步与守卫边界

- **逐条守恒**：保留全部 `1,020` 条既有论述 ID、全部 `1,052` 条既有证据记录及全部 `40` 份案例下载文件逐字节不变；不伪造未核读的 1998 年会议表、`ECER` 2011 原文、`CADIS` 或 `CLCD` 参数。
- **有界首现与双视图同步（具名 `display:block` 公开更正说明）**：仅对 `B21` 既有论述中缺失首现中文全称、前向前提倒置或硬编码“下一章”的条目做最小文字与顺序同步（补足 `EDIP`、`RDI`、`WP`、`LCIA`、`ECER`、`LCA`、`LCC`、`CML`、`GB/T`、`ISO`、`CNKI` 首现中文说明，将 `cl-regional-localization-not-translation` 置于依赖它的 `cl-regional-benchmarks-and-policy-goals` 之前或解耦前向依赖，并将 `cl-cn-conclusion` 结尾统一为书／网双视图一致的“后文《环境损害估值》”），原证据绑定与科学限制完全不变。
- **可逆守卫与三轮独立审查**：通过 `scripts/reader-localization-comparison.mjs` 与 `scripts/reader-localization-comparison-factors.mjs` 强制执行封闭键集合校验、单载体 `1-to-1` SHA-256 核验、`BigInt` 有理数零残差闭合与向 `0518e6b529789b8dde9ffebf36d2eeb716a94390` 的逐字节回滚，经两轮独立原始文献审计、零上下文全章读者审读与出版工程安全审计无条件通过后方可进入生产构建与交付。
