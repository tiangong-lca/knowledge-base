---
title: Programme 9 research and candidate-material inventory
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when prioritizing the remaining programme 9 research and candidate materials
whenToUpdate:
  - when new evidence changes an inventoried gap or candidate qualification
checkPaths:
  - knowledge/research/**
  - _docs/lca-book-goal.md
related:
  - ../lca-book-goal.md
  - ../publication-contract.md
  - ../editorial-protocol.md
  - 2026-11-13-chinese-expression.md
---

# 文献缺口与候选材料盘点

本记录是 [任务95](https://github.com/tiangong-lca/knowledge-base/issues/95) 在2026年11月13日完成的盘点，服务于 [programme9](https://github.com/tiangong-lca/knowledge-base/issues/9) 后续取舍。台账审计以 Main `8148f71d1b57ea06ee2ef44c6fe3477ed8f253ac` 为基线；下文题名沿用这一版，以便追查，并非对新稿目录的命名要求。现有32章、120节的稿件修订与既有源码／root交付已经完成，不将历史待办重新当作未交付。

两项独立盘点分别检查了现有文献／阅读／覆盖台账，以及三份候选材料的身份与可取得载体。主评复算了作品与选读的连接：226个登记作品中，171个有选读记录，55个无对应选读；180条选读不表示180部全文精读。35条发现缺口与93条阅读缺口含重叠和历史记录，不能相加为128个独立未解决问题。

目前可自主推进的下一步，是将实际论证缺口与已有证据对照，按影响和独有增量安排有界核读。课程私有原件未定位，不阻止当前中文审校或使用已有公开证据；只有某项必要论断确需该载体时，才请求用户指明文件、允许范围或合法访问安排。本盘点不改变阅读台账的原状态，不自动将候选纳入正文，也不授予付费、联系他人或再分发原件的权限。

文献地图审计没有重新检验每个原件的在线访问和权利。候选核验确实检查的公开前置页、机构项目记录、分册选段和勘误另列于后半部分，两种范围不混称。

## 库存与判读

- `knowledge/research/literature-map.json` 更新于 11-10，共 226 条作品登记，205 条身份已核、19 条部分核实、2 条未解决。协议有 7 个问题、797 个查询或取得条目，日期为 11-03 至 11-10，含 1 个未保留原检索式的种子导入描述，也有定向下载、载体核验和引文追索。英语标签 198 条，中文 13、德语 9、日语 6、丹麦语 2，另有英语摘要标签。各语言与领域均可重叠。日志记录了实际定向发现和原件检查，无法估算召回、饱和度或全球覆盖。
- `knowledge/research/readings.json` 更新于 11-12，共 180 条选读，152 条 `selected-passages`、28 条 `web-sections`。按 `scripts/research.mjs` 的记录 ID 与 6 个作品别名连接，实际是 **171 个登记作品有阅读，55 个无对应阅读**。选读含仅摘要者，如 `rd-water-aware2026-abstract`、`rd-hyb-response-york-abstract`、`rd-lime-hayashi2012-abstract`。1,028 个选段定位、339 个载体 ID（337 个不同 SHA-256）和 133 项修订各有不同含义。226 个地图条目按设计保留 `not-close-read`，整部精读无此表可证明。共同数据、同一原作不同载体和共同机构谱系不构成独立证据。
- 55 个无对应选读的登记作品中，22 条仅摘要／节录，21 条仅元数据，5 条登记公开全文途径，5 条需登录，2 条未获得。五个公开途径是 `lit-c01`（SETAC 回顾）、`lit-com-09`（前言）、`lit-com-17`（TRACI 手册）、`work-gao-1977-beverage-deposit`（政策接受线索）和 `work-kb46-cohen2017`（IER 上游）。取得原件与否仍须查各条限制。
- 发现表有 35 条缺口（16 高、19 普通），阅读台账有 93 条。两表重复指向同一问题，也保留已部分解决的历史。例如 EU 公开原刊已取得，规范逐条比较仍开放（`gap-wave4-eu-official-carrier`）；IPCC 已从派生文字推进到正式 PDF、补充与具名勘误的选段和视觉核查（`gap-ipcc-case-original-pdf`）。128 是两表行数之和，不能替代实际开放问题数。
- 目录有 234 源、821 证据、857 论述、94 概念、39 映射、12 个主题覆盖条目（11 进行中，1 抽样覆盖）。V1 至 V8 的登记作品数／有选读连接数为 26／9、62／31、42／34、93／68、101／75、62／49、140／114、21／10。重复归类保留。篇数与索引反映台账规模，无法证明研究代表性或论证深度。

**登记未读**指无对应选读。**选读待核**指具体未读页、版本、数据或运行会影响结论。**论证缺口**指现行稿只能回答较窄问题，或原承诺的关键推理尚未成形。**可选扩展**指暂时没有明确论证增量，或现有证据已足以承担。以下顺序按现行论证影响、后续单元依赖及可取得证据的增量排序。

## 优先研究顺序

表中「地图」与「阅读」分别指 `knowledge/research/literature-map.json` 和 `knowledge/research/readings.json`。

| 次序与问题 | 现有结论和记录 | 仍待证实与可先执行的工作 |
| --- | --- | --- |
| 1．原始框架、传播和历史接受（V1/V2/A01/A03/A08） | 《饮料容器账本》《政策尺度》《框架职责》以1972/1974原报告和1992/2001 CML选段比较服务、系统、计算和评价职责，并用1994 EPA印刷案例检验具名接受。阅读 `rd-epa-1972-beverage-problem`、`rd-epa-1974-nine-beverage`、`rd-cml-1992-part1`、`rd-cml-1992-backgrounds`、`rd-cml-2001-part3`、`rd-kb52-epa-1994-lithographic-p2`。 | **登记未读、选读待核、论证缺口。** 优先核对地图 `work-gao-1977-beverage-deposit` 及 `work-ota-1979-municipal-waste-beverage-lead` 的引文、接受关系和独立性。再处理 SETAC四本 `lit-b02`、`lit-com-01`–`lit-com-03`、北欧 `lit-com-05`、`lit-com-06` 及CML荷兰文原版和2002 Handbook `lit-b05`。会议、刊印、回忆日期及正式联系分别取证。查 `gap-original-setac`、`gap-nordic-originals`、`gap-framework-event-identity`、`gap-cml-1992-book-editions`、`gap-priority-and-private-origins`。公开部分可自主先查。 |
| 2．从交换和数据适用到实际组装（V3/V4/V7/A02/A04–A06） | 《功能参照》《过程网络》《交换语义》《混合清单》《数据适用性》分别建立服务、坐标、对象与活动连接。原生 JRC 导入揭示处理活动缺席、目标重置等具体问题。阅读 `rd-cml-2001-part2a`、`rd-ilcd-2010`、`rd-kb50-jrc-sdk`、`rd-kb50-olca-modules270`、`rd-unep-2011-databases`，复现见 `_docs/reproduction/native-exchange/README.md`。 | **选读待核、论证缺口。** 用同一可复算输入分开供应者、地理、默认和份额选择，考察已连接但对象不适用、技术流未连、基本流无表征因子和实际零值各自后果。优先重用具名公开对象与固定环境；查 `gap-reference-flow-contextual-representation`、`gap-kb50-jrc-location-selection`、`gap-kb50-jrc-property-version`、`gap-kb50-native-profile-and-platform`。将 make/use 一般化前须定位 programme9 提及的 Suh 2010 原文。 |
| 3．共同背景误差、差值分布和经验校准（V4/V7/V8/A05/A06） | 《墙面服务比较》已有同一 θ 的确定性配对和区间比较；《变异与不确定性》《质量评分与概率》区分变异、估计误差、模型情景、评分、经验校准和概率。阅读 `rd-huijbregts-1998-framework-uva`、`rd-ciroth-srocka-2008-sampling`、`rd-ciroth-2012-pedigree-refinement`、`rd-ciroth-2016-pedigree-factors`、`rd-edelen-ingwersen-2018-data-quality`。 | **选读待核、论证缺口。** 若有必要，从一个明确联合分布解释协方差和差值分布，保留既有墙面结果与假设。公开资料可先追查2008 CV 异差、2012 子集汇总、GSD–CV 的程序出处与推荐语境，并澄清缺失、截断和代理怎样分别改变数值与判断。查 `gap-ped-raw-calibration-and-error-origin`、`gap-w3-calibration-reconciliation`、`gap-w3-independent-tests`。实际经验重估才需要原始杯重观测和校准代码。 |
| 4．共同生产、混合截断与同题反证（V4/V6/A05/A10） | 《共同生产》区分归属份额、替代比较和条件响应。《混合清单》用调整后原例和作者交易账解释重叠扣减；Agez、Yang、Jakobs 分别约束对象粒度、聚合反例和价格敏感性。阅读 `rd-weidema-2001-addendum`、`rd-suh-2004-functions-thesis-reprint`、`rd-hyb-agez-2019-2020`、`rd-hyb-yang-2017`、`rd-hyb-jakobs-2021`。 | **登记未读、选读待核、论证缺口。** 用相同对象和反事实比较规则，然后补原文/增补/再讨论及 Comment/Reply。地图 `lit-com-21`、`lit-kb78-weidema-schmidt-2010-revisited`、`work-hyb-peters-hertwich-2006-comment`、`work-hyb-suh-2006-reply`；`rd-hyb-response-york-abstract` 仅摘要，`rd-hyb-downstream-precursor` 是2004前稿。公开已读反例可先做固定输入比较。查 `gap-wave2-weidema-original`、`gap-kb78-weidema-revisited-body`、`gap-hyb-downstream-final-versions`、`gap-wave2-independent-hybrid-tests`。历史扣减需原账，经验准确性需独立真值。 |
| 5．土地与生物多样性先补一条影响路径（V5/V7/V8/A07） | 《中点与终点》用 ReCiPe 的土地中点因子说明局地物种损失作为依据与作物等效面积时间作为单位的区别；《气候当量》说明生物源碳的参照和双计风险。阅读 `rd-recipe-2017-primary-article`、`rd-kb54-ipcc-ar6-ch7-pdf`、`rd-unep-glam-2019-pathways`，地图 `lit-m05`、`gap-impact-pathways`。 | **登记未读、选读待核、论证缺口。** 按具名用地问题追原始表征、地域/时间/反事实、恢复和因子版本，连接农业、材料或建筑案例及独立批评。核对气候、水、毒性与生物多样性汇总的重叠。自主先找具名公开原件。平流层臭氧和光化学臭氧各另建问题，以 `lit-com-16`、`lit-com-17` 与 `rd-cml-1992-part1` §B.2.5 作入口。资源与辐射等专题仍开放。 |
| 6．从完整研究到实际决定（V6/V7/A06/A10） | 《购物袋研究》有服务、替代、敏感性、散落指标及审查往返。《供电系统》区分交付、历史平均、边际响应和未来资产，并有固定 AVERT 运行。《材料循环》提供历史纸链和质量折算。阅读 `rd-pack-ea2011`、`rd-pack-wrap2005`、`rd-pack-wales2016`、`rd-kb48-main-egrid2023-rev2`、`rd-kb48-avertweb43`、`rd-kb48-future-cambium2024-report`、`rd-paper-kreplin-putz-2020`。 | **选读待核、论证缺口。** 先用 CASE-PACK 对照 V7-07 八步，指出具体公开行为或审查证据如何改变建议、哪项仅能给出门槛。CASE-CYCLE补具名纤维履历、质量与市场证据，CASE-POWER补同网界 LCI、交付与独立响应，保留交换空缺和网损分母争议。查 `gap-pack-tns2007-monthly-original`、`gap-pack-bag-weighted-reuse`、`gap-paper-comieco-2008-premise`、`gap-market-empirical-response`、`gap-kb48-main-incomplete-interchange`、`gap-kb48-avert-upstream-native`。模拟和经验效果各自取证。 |
| 7．规范、版本和实践采用（V2/V7/A03/A04） | 《框架职责》《产品足迹规则》《影响评价本地化》分别区分指南/标准、EU建议/类别规则、代表产品/实际活动、评审/评审对象、国标登记/模型采纳。阅读 `rd-kb44-ec2021`、`rd-kb44-dairy2018`、`rd-kb44-dairy2025`、`rd-kb44-dairy-review2024`、`rd-kb44-dairy-rp`、`rd-cn-yang-wang-liu-2001`、`rd-hkha-2005-c1169-normalization`。 | **登记未读、选读待核、论证缺口。** 先整理公开版本身份、历史与现行日期，核查一个能改变实践判断的条款或采用关系。地图 `lit-n01`、`lit-n02`、`lit-n05`、`lit-com-10`、`work-cn-yang-nielsen-1998-ecobalance`；阅读 `gap-iso-authorized-text`、`gap-cn-standard-originals-and-1998-initiation`、`gap-kb44-reviewed-packet`。需作条文判断时取得相应版本授权全文，评审工作簿和被审模型字节分别取证。 |
| 8．地区与行业代表性（V1/V2/V5/V7/V8/A08/A09） | 中国方法与政策、日本 LIME、瑞士生态稀缺及欧美若干案例已形成具证据的对照。阅读 `rd-cn-yang-wang-liu-2001`、`rd-lime-jp2003`、`rd-lime-2004-conjoint`、`rd-es-lewerenz-2024`。 | **登记未读、选读待核、论证缺口。** 依 `gap-global-language-regions`、`gap-german-french-traditions`、`gap-north-american-originals`、`gap-japan-original-methods` 选一条有明确本地制度/数据和产业问题的非英语证据链。优先与土地农业、实际服务研究联动，交通另作具名主题。LIME 原书/CD（`lit-com-07`、`lit-com-24`）、原始选择数据按实际复算需求和合法权限取得。 |
| 9．相邻方法和 AI 的验证（V8/A09/A10/A12） | 《社会表现与影响》《生命周期成本与综合评价》《未来技术与情景》《可修订的判断》区分社会表现与影响、成本承担、维度重叠、前瞻和修订条件。阅读 `rd-unep-2020-slca-guidelines`、`rd-finkbeiner-2010-lcsa-framework`、`rd-arvidsson-2018-prospective`、`rd-levasseur-2010-time-thesis-annex`。 | **登记未读、选读待核、论证缺口。** 相邻方法分别明确对象、连接条件和反例。AI 先选一个真实、可度量、有独立人工参照的任务，例如来源定位或交换映射，记录误判。地图 `lit-b13`、`gap-frontier-boundaries`；阅读 `gap-sustainability-lcc-primary-details`、`gap-sustainability-cross-pillar-overlap`、`gap-sustainability-social-native-case`、`gap-w4-future-validation`。是否达到能力、教学效果或科学效度分别取证。 |

## 八领域的当前承担与剩余责任

| 范围 | 正文已做到 | 具体尚缺与入口 |
| --- | --- | --- |
| 序篇 P | 前言、导论及《生命周期视野》建立局部改善与系统比较、覆盖与简化、结果和行动之间的读者问题。墙面服务、容器与购物袋各有不同用途。 | 现有教学例不提供真实功能等效证据；保持案例间责任。查 `gap-example-equivalence`。 |
| V1 历史与起源（01–06） | 《生命周期视野》《饮料容器账本》《政策尺度》《史料辨读》分别承担系统问题、服务/资源量、政策对象、史料身份。1972报告有1963产业结构的 IO 实例，1974报告有玻璃支路复算。 | 早期累计能源、资源核算、原始 IO／系统分析思想、影响与传播链仍缺。1974总量无法用公开明细完全闭合，私人产业输入和回用寿命无实证；1977 GAO、1979 OTA 只作线索。查 `lit-m02`、`gap-priority-and-private-origins`、`gap-hist-total-reconciliation`、`gap-hist-trippage-empirical`、`lit-gap-historical-container-ref48`、`lit-gap-historical-container-private-ref68`。 |
| V2 方法、共同体和制度（01–06） | 《框架职责》解释组件、活动和修订，同一1992作品的两分册分别核读。清洁生产、本地化和产品规则说明方法用途与制度边界。 | SETAC、Nordic、荷兰原文／出版书、授权 ISO、会议身份、数据基础设施形成及英语网络外的相互影响仍开放。受限标准优先为具名版本职责服务。查 `gap-setac-originals-access`、`gap-wave3-setac-framework`、`gap-nordic-originals`、`gap-cml-1992-book-editions`、`gap-iso-authorized-text`、`gap-global-and-critical-coverage`。 |
| V3 对象、含义和表示（01–06） | 《功能参照》《过程网络》《交换语义》分开服务、参考、现实活动、过程／系统、坐标与记录。固定瓶子和 JRC 模型能说明具体格式映射损失；目录有具名正反例。 | 跨体系/发行版本的对象与属性不宜升格为通用定义。验证真实服务等效、对方读取器、原生历史版本、地区与单位/属性版本对照，扩展非英语原语及不可对应反例。查 `gap-reference-flow-contextual-representation`、`gap-kb50-jrc-location-selection`、`gap-kb50-jrc-property-version`、`gap-kb50-olca-historical-equivalence`、`gap-example-equivalence`。 |
| V4 数据、网络和计算（01–06） | 《过程网络》《混合清单》《数据适用性》《变异与不确定性》《质量评分与概率》已覆盖坐标、求解、混合连接、代表性、模型选择与校准，另有固定输入的墙面对读。 | 具体实测/代理选择、供应默认、共同误差、截断核查、数值条件/稳定性、独立验证和原始数据仍缺。原计算书为样章与勘误，Suh 原刊及原账与导出后账户有别。查 `lit-m09`、`gap-wave2-full-computational-book`、`gap-w3-numerical-precision`、`gap-w3-original-pedigree1996`、`gap-ped-raw-calibration-and-error-origin`、`gap-wave2-suh-publisher-version`。 |
| V5 影响路径和指标（01–06，03A–M） | A气候有指标/版本/时序算例；C颗粒物有路径、队列、工作点与发布复算；E/F酸化与淡水/海洋/陆地营养路径有接收环境；G/H人体/淡水生态毒性有 USEtox 限定；I耗水稀缺有流域、月份和参照。中点/终点、瑞士目标、日本偏好和中国分母确立用途不同。 | **A** 补生物源/土地碳和不确定性传播；**B、D** 平流层臭氧与光化学臭氧仍缺各自原始路径、发行和案例；**C** 先查 IER 预测样本、模型与发行差异；**E、F** 补具体 AE 单位、独立原生因子包和底层文献；**G、H** 补手册室内/作物残留冲突、实际工作簿、化学/生态域与独立验证；**I** 补底层水文/因子、2018截止公式与文字异差、2026全文/权利及水质/生态路径；**J、M** 土地恢复与多路径生物多样性仍缺独立论证；**K** 资源的不同目标已有片段，原始方法对照、因子和案例未成专题；**L** 辐射和具边界其他议题仍缺方法与实践证据。查 `gap-kb46-health-gbd2015-draws`、`gap-kb46-health-fantke-model-summary`、`gap-terrestrial-AE-unit`、`gap-pathway-CF-packages`、`gap-lcia-usetox-internal-scope-conflict`、`gap-lcia-factor-release-and-native-reproduction`、`gap-water-2018-cutoff-source`、`gap-water-2026-access-method`、`gap-impact-pathways`。 |
| V6 分歧、分配、响应和循环（01–06） | 《共同生产》《市场响应》《供电系统》《材料循环》以不同问题辨认份额、替代、响应与循环质量。两种处理模式的例子显示给定条件的后果；纸链留下历史勘误及额外残差。 | 以相同功能、反事实、边界和输出形成对比；争论终版、不同传统及独立实际边际识别仍缺。历史纸链补完整 UMIP、扩展火用残差、纤维质量和市场；核对跨方案连接时哪一步有不可逆损失。查 `gap-wave2-formal-comparison`、`gap-debate-diversity`、`gap-kb78-weidema-revisited-body`、`gap-paper-comieco-2008-premise`、`gap-market-empirical-response`。 |
| V7 现实实践（01–07，05A–H） | 具名 PEF 乳品规则与评审、openLCA 2.7.0/ILCD 交换、地区本地化、袋研究提供制度/模型/使用的具体材料。**A** 供电有交付、响应和前瞻；**B** 材料有纸链与金属/电力关联；**C** 建筑有墙面教学与香港参照；**D** 食品有乳品；**F** 消费品有历史容器、购物袋。 | **A**完整 CASE-POWER、实地响应；**B**完整 CASE-CYCLE 与其他具名材料/化工；**C**真实性能、维护与退役，产品到建筑尺度；**D**土地/生物过程、食品功能与数据验证；**E**交通出行、使用率与背景情景尚薄；**F**独立复用实证、其他包装与纺织；**G**电子/数字服务及分摊；**H**公共/医疗、组织和采购证据。跨行业不沿用虚构输入充当实证。01–04 另缺规则精确适用、ecoinvent/Sphera/GREET等原法/发行、外部软件/格式历史和更广地区；06–07 需真实使用、失败和对 CASE-PACK 的八步映射。查 `gap-practice-history`、`gap-kb44-native-dairy`、`gap-kb44-methane-validity`、`gap-kb50-native-profile-and-platform`、`gap-pack-bag-weighted-reuse`。 |
| V8 认识边界、相邻方法和未来（01–06，03A–G） | 《可修订的判断》用容器、墙面和购物袋形成有边界的综合，讨论多目标与补证。**A** LCC、**B** S-LCA、**C** LCSA 已有实质切口；前瞻章、动态气候和电力情景分别说明未来技术与时序。 | **A**原书与成本口径；**B**原生与效度；**C**重叠、聚合和竞争方案；**D**风险/环境评价需同对象实际对读；**E**MFA/IO需原始材料及独立目的/对象；**F**足迹虽有碳、水及PEF实例，规范对照仍欠；**G**绝对可持续性需界限、尺度、责任与公平及实质反例。补前瞻/动态的独立验证、AI真实任务错误、持续研究议程及跨卷依赖。查 `lit-b13`、`lit-m02`、`gap-sustainability-lcc-primary-details`、`gap-sustainability-social-native-case`、`gap-sustainability-cross-pillar-overlap`、`gap-w4-future-validation`、`gap-frontier-boundaries`。 |

## 十二附录的实际承载和差距

现行四篇计算附录是《容器能源复核》《指南算例复核》《气候数值的重建》《颗粒物因子的复算》。以下编号沿目标 §4，同一附录可由计算附录、方法附记、索引或受治理的证据台账承担。

| 责任 | 当前承载 | 未完成交付 |
| --- | --- | --- |
| A01 历史年表与史料目录 | 《史料辨读》《框架职责》及两篇早期容器正文有可查事件，`cov-history`、`cov-cml-framework-responsibilities` 有状态。 | 按发生/发表/回忆日期给事件、人物、机构及影响关系定位；补 SETAC/Nordic/多语线，保留同一性、资料和反证。 |
| A02 概念与原语索引 | `app/concepts/`、目录94概念/39映射、《功能参照》《交换语义》提供现有入口。 | 为定义绑定原语、体系和版本，加入同名异义、无法映射及反例；建立全书可用的完整主题/概念/缩略语索引。 |
| A03 标准与制度版本谱系 | 《框架职责》《产品足迹规则》《影响评价本地化》及 `cov-standards` 提供具体版本、采用与规则例。 | 按原版/修订/译版/采用版/废止记录条款差异、适用范围与查核日期；补授权 ISO/GB 原文及制度采纳证据。 |
| A04 方法、数据库、软件、格式档案 | 《系统模型辨读》、交换/电力复现、`cov-native-format-preservation` 区分方法与文件、具名原生和历史。 | 补精确发行、默认、许可证、历史平台、外部读取器及跨库同题比较，单列运行与声明。 |
| A05 数学、符号与推导 | 四个计算附录与《过程网络》《共同生产》《混合清单》承担已入书部分；原式和假设可查。 | 建立全书符号、单位、矩阵方向、推导假设和容差；续查 CV、源内公式差额、病态网络和受限原方法。 |
| A06 参考算例与复现 | `knowledge/cases/` 18套输入及发布绑定，四附录、`_docs/reproduction/` 有具名数值和运行证据。 | 每个参考例注明假想/实测/文献复算，固定预期值和版本环境；把失败、误差、原始参考和不可重复原因纳入同一入口。PACK、CYCLE、POWER分别补实际证据。 |
| A07 LCIA方法和因子版本 | 气候与PM附录、水/营养/毒性章、目录和源绑定提供特定单位、因子、表及修订。 | 按类别建立路径、单位、介质、地域/时间、未匹配、因子版本与运行关系。优先补土地、臭氧、毒性和水等实际因子包缺口。 |
| A08 总目录和主题书目 | `app/research/page.tsx` 展示规范源、载体/选段，目录及两研究台账区分作品、版本、读态。 | 补主题、人物与机构检索和跨章引文关系；说明经典依据、继承与共享证据，继续扩展主要原作和多语层。 |
| A09 检索、纳排和覆盖审计 | 发现表协议、阅读台账、具名波次，现行 `app/coverage/page.tsx` 是全书阅读导览。 | 按问题/语言/地区/传统和来源层次补筛选、排除、访问失败及未检索格；说明源查询日志和结果集的限制，保留独立遗漏审计。 |
| A10 争议、反证与缺口 | 《共同生产》《混合清单》《市场响应》《可修订的判断》，两台账 `gaps` 与正文限制。 | 对每个同题争议连原文、反证、回应、版本和暂定裁断；合并重复问题并保留历史，不把不同对象强行组成对立。 |
| A11 修订、勘误与出版史 | `app/changes/page.tsx` 有版本与勘误入口，`config/citation-history.json` 和选读修订保留实际迁移；现行接受有精确版本。 | 整理读者可查的影响、撤回和新旧去向；正式版次的独立资格、图表/书目定位、正式版PDF及版本引用说明仍属后续。 |
| A12 研究、审查、角色及许可 | 目标、出版/读者契约、研究波次及 `_docs/editorial/review-evidence/complete-readable-book-20261112/` 记录实际角色与范围。 | 按实际活动说明检索、审读、工程核验、独立科学/教学研究和权利，补完整读者说明及最终版审查。人类参与须由真实记录证明。 |

## 可选扩展与参与条件

- 现阶段可延后 `lit-c01` SETAC 回顾的重复总结、`lit-com-09` 前言、宽泛新教材章和同一证据的再印载体，除非它们能解决特定身份、异议或读者问题。相较之下，55项中的GAO、Cohen或TRACI手册分别可能补实际接受、IER证据或北美方法，不受当前「未读」标签的同等处置。更多假想案例、已查表的更多小数、同一案例换行业名，均无已证的新增论证贡献。
- programme9 保留三条候选连接。已具现行正文和台账的组装/适用、配对差值和缺失/截断/代理，可先按上述第2–3项核对有无必要增量。字幕、配套HTML和Handbook的版本、取得权限、原页及各自实读范围由候选材料盘点负责。未据用户材料新增阅读或引文；课程及HTML的共同谱系、Handbook与2001 CML机构报告的共同谱系仍保留。相应原件若仅重述当前证据，可记录无增量。
- 已登记的公开源、可合法使用的现有输入、可复算的源内比较、现行论述到证据的映射，以及题项/语言/地区/传统分层的有界检索，都有自主进展空间。当前盘点和中文修订没有等待用户提供资料的前置条件。
- 真正需要用户协助的情况应随具体断言提出。① 若要核准 SETAC 原书、Nord 1995:20、CML 2002或具名 ISO 历史/现行版的页或条文，公开路径失败后请用户提供允许项目与 AI 处理的授权载体、馆藏安排或授权人员的准确核对结果。② 若要重估评分/概率、LIME行为或真实包装/电力/纸链响应，需要分别取得受限原始观测、选择数据、跨主体账、原生模型与使用许可。只校现有公开结论时可以保留边界。③ 若要证明可教性、独立领域有效性、真实采纳或正式版次的人类评审，分别需要实际学习者、相应领域评审者、实践方/原始记录及明确参与授权。涉及付费、外部联络、原件上传或再分发时按具体资源单独授权。
- 对后续交接，优先记录已有论证是否会改变、选定的源/版本/页段、计划取证及停止点。若没有获得新材料，保留原限制与历史状态。公开开发记录可采用本报告的 repo 相对路径、公开 ID 和结果摘要。原件、本机绝对路径和私人课堂内容留在私有证据目录。

## 身份、载体和本轮读取

| 候选 | 已定位和已读 | 尚待核对 |
| --- | --- | --- |
| 用户转交的课程字幕 | Programme #9 的 2026-11-08 转交记录称，侧会话读完所提供的 1481 条字幕。记录明确原件在用户本地私有位置，并将字幕与 HTML 视为相关教学材料。 | 本轮未定位原件或完整侧报告，未重读字幕。课程名、节次、制作方、语种、扩展名、导出／修订日期、线索编号与时间码、字节数、SHA256、课程访问条款、AI 处理及公开引用范围均待核。1481 是侧报告对所给文件的计数。 |
| 相关课程 HTML | 同一转交记录称，侧会话看过 HTML 正文和关键代码，未执行其中指令。本轮找到的项目 HTML 都有独立的书稿预览或出版用途，未有证据能绑定其中某份至课程。 | 未定位课程 HTML、快照配套资产或完整侧报告。题名、课程版次、源 URL／捕获日期、本地文件名、字节数、SHA256、具体节和代码行、授权范围均待核。与字幕对同一问题、同一版本是否相符，须按两份实际载体对照。 |
| Guinée 等 2002 手册的侧报告和原载体 | 书目可锁定至 *Handbook on Life Cycle Assessment: Operational Guide to the ISO Standards*（DOI 10.1007/0-306-48055-7，`lit-b05`）。本轮实际取得 Springer 公开前置页两次，均为 492,778 字节、10 个 PDF 页，SHA256 `d2c86b0993682285262d8f8471a1e6a38f04085c1e0e3392b19ed415807b9978`。1 基 PDF pp3–6 已检查页像和文本，pp8–9 选读序文项目史与分部说明。 | 未定位侧报告所据本地载体及三页图像，也未定位报告正文；687 的计数口径及局部页序异常未证。手册实体分析仍按侧报告转述为选段和三页图像，因子表、精确定位及原件 SHA256 待核。公开前置页的 SHA256 只标识该前置页 PDF。 |

查询范围是知识库 `_docs`、`knowledge` 及直接相关内容页，已有私有工作证据目录 的相关书稿目录名、候选关键词与源文件扩展名，以及 programme #9 的 96 条评论和针对 2026-11-08 原转交评论的回读。未从这些证据找到三份私有文件、完整侧报告的可用路径或附件身份。原转交评论明确用户授权交接分析，并指明原件位于用户本地。 [原始交接](https://github.com/tiangong-lca/knowledge-base/issues/9#issuecomment-6720445449) · [现行 programme 摘录](https://github.com/tiangong-lca/knowledge-base/issues/9) · [出版契约](../publication-contract.md#L25)

### 手册与 2001 CML 分册

- Springer 提供第 1 版书目，印本发行 2002-05-31，精装 ISBN 978-1-4020-0228-1，平装 ISBN 978-1-4020-0557-2，页数 XII、692。平台将电子 ISBN 978-0-306-48055-3 的发行日列为 2006-04-11。所取前置页的扉页署 Jeroen B. Guinée 为 final editor，Kluwer Academic Publishers；版权页列印本 ©2002、电子版 ©2004。把版权年与平台电子版发行日分别记录。目录见该 PDF pp5–6，书页标记显示 Part 1、2a、2b、3 分别起于 1、15、121、395 页，Part 3 阅读指引起于 401 页，Appendix C 起于 675 页。687、692、XII 和 PDF 页序不能直接换算。 [出版社书目](https://link.springer.com/book/10.1007/0-306-48055-7) · [出版社公开前置页](https://link.springer.com/content/pdf/bfm:978-0-306-48055-3/1)
- 序文把项目执行时间置于 1997 年 6 月至 2001 年 5 月。Leiden 现行项目页列出 2001 年 5 月英文四分册，说明它们与出版版高度相近，允许非商业使用并请求引用 2002 年书版。Part 3 的印刷 p3 阅读指引核准其对指南方法选择提供论证及替代选项的职责。仅以两个同谱系载体进行位置交叉确认，各自保留分册印页、书印页及 PDF 页序。早期已登记的 `src-kb52-cml-2001-part3` 为 314 页，SHA256 `b77c333e6b199103e35da962568922f3342f0daf119b2ae20eac937adf19f206`。本轮 web PDF 查看器提供 314 页及选段。两次命令行直取均返回 HTML，所以没有复算该文件的登记 SHA256。 [Leiden 项目及使用条件](https://www.universiteitleiden.nl/en/research/research-projects/science/cml-new-dutch-lca-guide) · [Leiden Part 3](https://www.universiteitleiden.nl/binaries/content/assets/science/cml/publicaties_pdf/new-dutch-lca-guide/part3.pdf) · [已登记选读](../../knowledge/research/readings.json#L24445)
- Leiden 所连 2002-07-03 勘误为 29,184 字节旧式 Word 文件，SHA256 `1d82195cedf2949d56c2c058c51185f7ae4e6563fbf7fa86149b13e9fbb0bf4b`。本轮用本地文本转换器只读检查。勘误包含若干毒性／生态毒性指标单位和参考排放介质更正，未检出对侧报告所称页序异常的指认。若相关内容将来入稿，核对勘误与实际版次、表题、行列、单位、介质、空间和时间范围。2016 年 CML-IA 数据库也有独立版本身份。 [Leiden 勘误](https://www.leidenuniv.nl/cml/ssp/projects/lca2/errata_handbook.doc) · [CML-IA 版本说明](https://www.universiteitleiden.nl/en/research/research-output/science/cml-ia-characterisation-factors)
- Springer 页面把书的访问标为订阅预览。公开前置页有保留权利声明。现有 `lit-b05` 仍是 `metadata-only/not-close-read`，本轮已核准扉页书目并作局部前置页检查，若需录入应追加实际载体和范围。课程许可、用户能否授权 AI 处理、公开释义及引用权限分别待证，侧报告交接只证明交接范围。候选原件、课堂对话、课程代码、原书图页及因子表均未随盘点保存或发布。 [出版商访问和书目](https://link.springer.com/book/10.1007/0-306-48055-7) · [现行文献登记](../../knowledge/research/literature-map.json#L5185)

## 三条连接的复核顺序

优先级按当前可用证据及潜在正文增量排序，尚无收录决定。

1. **缺失、截断和代理。** 先核 CML 2001 Part 3 的 §3.8、§§4.3.17–18、§5.3。此次已用公开文本查看这些位置的局部内容。印刷 pp109–110 将截断问题联系到缺乏现成数据并警惕通过拆分规避百分比门槛；p240 讨论有清单干预却缺表征因子的处理，p241 讨论未追至系统边界的经济流，p255 提及比较对象完整程度不同时应估计其影响。下一步把两条检查写成独立的可问问题。技术流从谁取得、上下游有哪些干预未进入清单。基本流已在清单中，在哪个方法、版本、类别、介质和时空坐标下欠缺有效因子。再根据研究用途评估潜在影响、比较是否翻转及哪处值得先补。检验一项低质量占比却主导相关影响的反例、拆分后每项都低于阈值的反例、无因子与已知零的反例；每个比例须交代分子、分母、覆盖范围和版本。现有混合清单、交换语义和数据适用章可能已足以支撑该连接的基础。历史技术指引、现行标准和数据库规则分别核对，必要时优先保留短跨章连接或附记。 [Leiden Part 3](https://www.universiteitleiden.nl/binaries/content/assets/science/cml/publicaties_pdf/new-dutch-lca-guide/part3.pdf) · [现有数据适用选择](2026-11-09-data-applicability.md#L44)
2. **共同背景、配对和差值。** 墙面已有确定的共同参数、精确配对范围和独立极端外包络。只有实际阅读发现概率意义的缺口，再检验差值方差等于两侧方差之和减两倍协方差所要求的有限二阶矩、同一次抽取共享什么、边际分布与联合分布如何绑定。正协方差降低该差值的方差，零协方差、负协方差、共同参数加独立残差、排序跨零分别作反例；方差变化也不能独自确定胜率或排名。逐个检查截断变量、拒绝／变换采样后的联合分布与 Sobol 估计所需输入假设，禁止把相关或截断后不再独立的输入直接当作独立输入。侧报告只提供复核线索。CML 2001 §5.6 的标题及印刷 p257 选段提供历史的敏感性／不确定性区分，不能直接支持配对和 Sobol 结论。现有墙面算例保持原职责，短释义或方法附记由读者证据决定。 [墙面选材与原边界](2026-11-08-wall-selection.md#L95) · [Leiden Part 3](https://www.universiteitleiden.nl/binaries/content/assets/science/cml/publicaties_pdf/new-dutch-lca-guide/part3.pdf)
3. **组装、供应者和默认。** 现有交换语义的缺连接算例、混合清单的部门聚合与供应者替换、数据适用的对象检查先并读。只在能新增实质推理时，连起交换行、需求、候选供应者、地域／时期、实际或假定份额、默认回退及最后进入的矩阵项。按对应时间码和静态 HTML 节／代码行核对例中数字、单位、符号、矩阵 R/I/E 的定义和角色，再用独立算术复核维度、列缩放、自连接、求解残差、非负可行性及适用条件。可构造同一确定配置复算一致但供应者不合研究地域的反例，以及有代数解却存在负活动量且与模型约束冲突的反例。先辨别有无允许的回收、替代、净信用等负值语义。课程例子若无可核权限或无独有增量，可保留现有案例。分配中 make/use 对应另有 Suh 等 2010 原文门槛。已定位 Wiley 书目信息和摘要，未据此认定一般等同。 [交换语义](../../content/docs/book/exchange-semantics-and-conversion.mdx) · [混合清单](../../content/docs/book/inventory-boundary-and-hybrid.mdx) · [Suh 等 2010](https://doi.org/10.1111/j.1530-9290.2010.00235.x)

## G1–G4 的下一步

- [ ] **G1 问题。** 为每条连接写一问和一项有条件的拟答，指定当前章节及其前后文。列出目前哪项读者判断需要它，已有例子能承担的范围，以及完成的停止条件。任何写稿执行单元先按 workspace 规则创建并启动跟踪。
- [ ] **G2 选材。** 优先使用现有证据及可合法取得的原件。对于候选，只定位足以改变判断的字幕和 HTML 对应处、书版扉页和相应正文／图页。分别登记课程标题、来源、日期、版本、文件格式、SHA256、时间码／代码行，或书印页与 PDF 页。核对局部异常前后页和官方勘误。每项标明实际支持、已有重合、独有增量及正文／替换弱例／附记／不新增的处置。
- [ ] **G3 比较。** 明确同一命题与先决条件，分开同一课程的转述差异、CML 同谱系载体差异、不同对象与方法条件、真实冲突及未知。保留数字／定义／条件无法对齐的反例，不从课程、历史因子表或文献数量推出当下共识。按每条连接的反例复核算术和语义。
- [ ] **G4 闭合。** 审查原文与新论断的关系、受影响消费者及历史引用，独立读实际连续成稿和必要上下文，并对网页、书版及打印的实际去向逐项核对。若处置为不新增，记录所读证据、已有章节如何回答问题及触发重开的事实。分别记录范围、权利和完成状态。 [全书选材规则](../lca-book-goal.md#L231) · [有界 G4 实例](2026-11-09-data-applicability.md#L83)

## 需要用户参与的最小事项

当前盘点和三条连接的公开证据筛查可继续，用户无需重传文件或购买手册。若后续 G2 确认有一处独有贡献确需核对私有载体，而现有会话仍无法定位，只需指明既有文件或原侧会话的位置及允许读取的范围。课程若拟成为公开出处，另需提供适用条款或权利方可核许可，涵盖拟采用的 AI 处理及引用／释义形式。手册如确需其书版正文，先由原侧报告提供实际页段／图号，再指明合法已有副本及该范围的可访问方式。若权限或证据仍不能闭合，使用现有独立证据或保留开放问题。

公开交付可报告可核书目、公开前置页／机构报告的实际范围、三条优先方向与待核边界。此盘点无仓库、Git 或 GitHub 写入，临时 PDF、Word 及页像均已释放。
