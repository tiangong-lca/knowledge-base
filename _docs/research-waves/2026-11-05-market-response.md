# 从假定替代到受影响的市场

执行任务：knowledge-base #30；起点为 Main 242a70c0beab695e9ea3907d88b364e54b17a046。前一单元 #28/PR #29 已经通过 root #2220/PR #2221 集成至 Main 8739e89ad485a91e889d79681305d5fc2d25e8cd，并完成源码、线上和终态交接。本文是开发与研究记录，不进入读者页面。

## 问题与现有论证的位置

既有联合批次章已经逐项计算匹配服务篮子、负残余和部分利用，但明确把独立供应减少作为假定。cl-joint-fixed-basket、cl-joint-negative-meaning、cl-joint-answer 都把实际供应反应留给进一步证据。下一步需要解释：需求改变后，研究怎样辨认受影响的产品市场与供电活动；何时记录的平均供给、采购对象和变化响应可以相连，何时不能相互代替？

这落实 V6-03/V6-05 的原始争论与因果边界要求，并开始 CASE-POWER 与 V7-05A 的问题。它不完成全部电压、输配损失、时空、当前电网、行业经验或未来情景覆盖。章节是否从现有分配/替代章分出，须由实际论证和阅读顺序决定，不能以新增短章或来源数量充当完成。

## 预先记录的原件与检索路线

先检查已有作品身份和缓存，再取得实际原件。优先原出版商、作者机构、正式项目档案和合法机构仓储。按题名、作者、页码、版本、来源URL和原文件哈希分别固定身份；公共托管不等于开放再分发许可。

- Weidema、Frees、Nielsen 1999，Marginal production technologies for life cycle inventories，DOI 10.1007/BF02979395。作者机构与出版商入口已被独立编辑评估定位；作者次序以实际扉页核准，摘要和后续答复不替代原始论文。
- Nordheim 的 Comment 与 Weidema 的 Reply，IJLCA 4(6):308–310。作者机构的三页载体 https://www.lca-net.com/files/lca_4_308_310.pdf 是实际获取入口；逐页确认两篇贡献的边界和归属，同一载体不意味着独立实证确认或相同立场。
- Ekvall、Weidema 2004，System boundaries and input data in consequential life cycle inventory analysis，IJLCA 9:161–171。核对现有 M01 作品记录；原页 DOI 10.1065/lca2004.03.148 与当前出版商 10.1007/BF02994190 须明确绑定，不能按两个DOI重复计作品。项目托管原件入口为 https://lcafood.dk/Material/Ekvall%20and%20Weidema_2004.pdf 。

计划渠道为出版商/作者机构原页、Crossref身份元数据、上述正式项目原件及有界公开检索。计划查询包括英文精确题名或DOI配合 comment、reply、electricity、aluminium、market boundary、correction、erratum；中文“后果型 生命周期清单 边际电力 铝 市场边界”；德文“marginale Stromproduktion Ökobilanz Aluminium”。不设发文年下限，优先同期论证及明确回应/修订。实际字符串、执行日期、命中、排除和失败另记；计划不冒充已经执行的检索，未找到不证明不存在。

只在一个实质命题确需核查时追踪所引的原包装研究、PSI资料或其他来源。不得扩大为无边界的当代全球发电因子搜集。检索摘要曾出现的Hawkes相关路线与实际打开载体身份不一致，未核准前不能登记为已取得的独立原作。已有缓存中的相近作者/年份作品也不能代替本次目标。

## 原文与方法检查

分别重建各方最强的实际论证：干预/需求是什么，商品与地域市场如何划分，时间跨度怎样影响调度、产能和约束，贸易或电力连接承担什么假定，批评指出哪一步不足，答复承认、保留或改变什么。区分作者主张、被引历史统计、未出版产业资料与可独立核查的证据。不能用观点数量投票，也不预设平均或边际一方普遍正确。

共享作者、时间先后或方法相似，不能单独证明因果影响；1999与2004之间的关系须由实际引用与表述支持。全球铝市场不自动构成全球无约束电力市场，买到某供应者的电也不自动识别受影响的发电活动。短期调度、长期产能、采购归属和变化响应分别说明。

原始论文若不可得，保留获取失败与未读状态，不从摘要、批评或答复拼造原论证。原件只作合法取得范围内的选段/完整页面核对；不付款、联系作者、修改账户或绕过访问控制。原件、扫描图、受限产业数据与捕获缓存不进入公开仓库或下载物。

## 正向演算与写作门槛

原文读取之后再固定可辩护的案例问题。从同一干预与服务出发，逐项写出受影响市场、可用或受限响应、改变的活动量及清单差值。实证数量需要实际来源；作者设定的材料/电力双市场例子须把所有假定逐项标清，不能冒充历史市场复现。比较时控制干预与服务，说明改动哪个市场条件及它如何传到活动与结果。

结论要指出什么观察能区分竞争响应模型，例如市场边界、贸易/输电限制、产能/调度与时间信息；资料不足时保留条件情景，不提供无证据的默认技术。教学模型说明假定的后果，不替真实供应反应作实证验证。保持既有案例版本/输入及其含义，新论述所需数值绑定另行审查。

成稿应连续解释这条因果与建模链，接回联合批次章的供应反应前提。论断、概念、映射、来源选段、方法评价、反证和证据触发修订同时维护。独立来源/方法/算术与读者检查、适用完整性/构建/页面/Docpact/CI，以及源码Main、精确root和线上交付分开核验。代理审阅不是人类领域或科学批准。完整序篇、八卷、附录及其未完成覆盖仍由 programme #9 保持开放。

## Actual reading and evidence-led revision, 2026-11-05

Four original PDF carriers support five separately identified contributions: the
1999 article; Nordheim's p308 Comment and Weidema's pp309–310 Reply in one
three-page carrier; existing M01/2004; and PSI98-17. The2004 printed/currentDOIs
identify one bibliographic work without a verified registrar-alias claim. Shared
Comment/Reply bytes do not establish independent empirical replication. Readings
remain selected passages with exact hashes/locators. Originals, extractions and
images stay outside Git/public exports. Ordinary publisher access for1999 displayed
an institutional banner; individual entitlement and access context remain unresolved.
Neutral inspected-passages status does not assert open access or redistribution.
Other public institutional/author/project carriers also retain third-party rights.

The original procedure distinguishes direct processes/markets, output/capital
adjustment, replacement-relative trends, constraints and actor preferences. The
Comment challenges geography, mixed capacity responses, transmission and delivery
attribution. The Reply acknowledges geographic inadequacy and revises its European
aluminium premise while retaining globalmaterial/multipleregionalpower reasoning.
Unpublished industry forecasts and underlyingIPAIstatistics remain unacquired.
The2004source explicitly attributes its procedure to1999, but does not explicitly
cite this exchange; no causal influence or settlement is inferred.

PSI changed the positive example design: its average import/export construction
does not identify an isolated demand response. Only nine displayedM3facts enter
the public case. Swiss1995 P60277+I18113−E25143=53247GWh includes51567final
consumption+1680losses; domestic35134+DE7014+FR9116+AT1973+IT10 closes the same
denominator. Private checking also examinedM2/M4/SBB; those reconstructions do not
enter the public model. T5absolute emissions lack the separately cited inventory
chain. M4sparse samples/internaltable/weighting differences remain unreconciled.
PSI's average-first/scenario-sensitivity view, responsibility judgment and the
Frischknecht dissent remain visible.

The separate fictional model fixes extra1kg output at a selected producer,
10kWh/kg, otherusers100kWh and a commonabstractstaticperiod. FixedH40 requires
stipulatedG70 versus baselineH40/G60; actualexpandingH50 retainsG60. InventedCO2
coefficients0.02/0.8kg/kWh give8/0.2kg increments while producerassignment stays0.2.
Both intervention worlds supply the same extra service; the baseline lacks it.
Availability alone does not establish actual response. This is conditional
electricityCO2 arithmetic, not empirical supplier selection, a complete materialLCI,
CO2-equivalent score, propagated uncertainty or present-grid default.

The continuous chapter follows both allocation chapters: joint-batch premise →
originalprocedure → critique/concession → averageconstruction → latersegmentation →
positiveactivities → discriminatingobservations and the unfilled regional symbolic
chain. Structure follows the explanatory problem, not a chapter/source quota.
Three concepts and one relatedness mapping introduce no universal equivalence.

## Actual bounded queries and exclusions

Author/publisher/project/PSIdirectroutes and exact-title/identifier/correction
queries are recorded in the reading packages/literature register. Main also ran
these public-web queries on2026-11-05, including a repeat source confirmation:

- `"Marginal Production Technologies" "Nordheim" reply correction erratum`
- `"后果型" "边际电力" "铝" 市场边界`
- `"marginale Stromproduktion" Ökobilanz Aluminium Weidema Nordheim`

Results rediscovered the original exchange/PSI and later citations; no correction
was verified. Chinese hits mostly concerned current industrial markets and did not
support this historical method proposition. Secondary mirrors, building/railway
citations, general news and price pages were excluded as original evidence. The
Danish official *Market information in life cycle assessments* report and publisher
record *Uncertainties related to the identification of the marginal energy
technology in consequential life cycle assessments* remain discovery leads,
not acquired/read support in this unit. Search silence proves neither correction
absence nor non-English scholarship absence; no systematic coverage is claimed.

## Initial review and remaining publication gates

Independent source readings preceded synthesis. Method review required explicit
material response, equalextra service across interventionworlds and actual rather
than merelyavailableHexpansion. Review of the32-paragraph artifact restored the
exclusiveidentified-process stoppingcondition; clarified exportsigns/units,
PSIcomparability and responsibility; and corrected actualPSIp35support and the
exact2004§6title. Focused integrated recheck closed these findings. All22evidence
joins/fivecontributioncarrierhashes and eightmaterializedclaims matched.

The closed static adapter binds nine source tuples through the actual reading,
passage and originalPDF. Eightcaseparagraphs bind inputSHA256
`a58663c4648adee29c1c8236907d436ad42304ff3728aae8d3c133ba23e6a81e`.
Independent code review found no material issue in45scopedtests, source-image
checks, exactarithmetic,14nestedprivate-field projections,120required-leafomissions,
stalemetadata/textrejection and sixunchangedlegacyhashes. Main integrity and175tests
pass. These establish consistency, not empirical validity or human approval.
Nativeindependentreader assessment is in progress; actualrendered/build/CI/Main,
exactroot/livequalification remain separate required gates.
