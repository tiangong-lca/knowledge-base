---
title: 第四部《环境后果》整部连续回读、跨章引用校准与注释范围统稿
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when conducting or reviewing the Part IV whole-part continuous reread across B14-B19, X03, X04, Part IV introduction and index.mdx
whenToUpdate:
  - when Part IV cross-chapter continuity, dual-view references, first-appearance definitions, scope strings or review evidence change
checkPaths:
  - _docs/editorial/2026-11-18-part4-continuous-reread.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-15-comparative-continuation.md
  - 2026-11-15-land-recovery.md
  - 2026-11-15-acid-equivalents.md
  - 2026-11-16-mineral-resources.md
  - 2026-11-16-fossil-resources.md
  - 2026-11-17-photochemical-ozone.md
  - 2026-11-17-ozone-and-radiation.md
  - 2026-11-17-toxicity-comparison.md
  - 2026-11-17-water-scarcity.md
  - 2026-11-17-biogenic-carbon.md
  - 2026-11-17-eutrophication-pathways.md
  - 2026-11-18-particulate-comparison.md
---

# 第四部《环境后果》整部连续回读、跨章引用校准与注释范围统稿

2026-11-18，[任务 133](https://github.com/tiangong-lca/knowledge-base/issues/133)。继续既有比较修订 GOAL 与 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)，源码基线为第 17 章细颗粒物跨体系比较单元 `PR #132` 合入 `main` 的精确提交 `2ba0bfe2f39d28bfa42e61f5e2b70585770bcb73`（Git 树 `ce50f3de57695fc3730caf30e7ae21c9e923b22d` 与已审头 `2be5e07a50ebaa1d9c753c363af90e6d883a1043` 一致，已完成 `https://prism.tiangong.earth` 线上 468 项字节审计、未修改出版守卫核验及根集成 [workspace#2436](https://github.com/tiangong-lca/workspace/issues/2436) / [PR #2437](https://github.com/tiangong-lca/workspace/pull/2437) `2e2353ee37ec5b485a338a63944c063261657383`）。本协议在修改任何 `knowledge/`、`content/` 或 `config/` 文件之前先行提交并推送；事前已完成第四部全卷 247 条独立规范论述与配套导航的只读预审盘点（归档于私有任务证据目录），不宣称无盘点的盲写。

## 一、问题定位、全卷覆盖范围与不制造无效改动的边界

随着任务 `#111`（土地恢复）、`#113`（酸化当量）、`#115`（矿产耗竭与采选费用）、`#117`（化石热值与分燃料终点成本）、`#119`（光化学臭氧与多路径前体）、`#121`（平流层臭氧耗竭与电离辐射）、`#123`（化学毒性方法家族）、`#125`（耗水账本与缺水潜势）、`#127`（生物源／土地碳与气候反馈）及 `#131`（细颗粒物截点、`Cohen 2017` 实读与前体反转）全部端到端交付，第四部《环境后果》内覆盖资源、土地、辐射强迫、酸化／富营养／光化学臭氧、颗粒物健康、流域缺水与多介质毒性的全部单章有界原始对读均已到位。

然而，此前各单元遵循有界增量规则，为保持前驱断言与历史签收稳定，将既有冻结段与跨章导航中的待同步事项逐项登记在交接清单内；同时，单章审查不能代替读者从阅读导论、第四部导语一路连续读完第 14 至 19 章及两篇计算附录（`X03`、`X04`）的整部检验。本次整部连续回读以 **“有据必纠、无病不折腾”** 为准则，围绕以下三组经只读全卷盘点核实的真实问题推进：

1. **第四部导读入口、部级导语与双视图跨章引用错位修复**：
   - **`content/docs/book/index.mdx` 第 18 行**：现文仍将 `/docs/book/midpoint-endpoint-value-choices/` 标为 `#95` 改名前的旧章名 `[影响路径]`（现行第 14 章正式题名为 **`中点与终点`**），且首句仅写“排放清单说明物质、数量和去向”，漏掉了第四部已系统展开的资源采掘、土地占用与恢复、取耗水以及酸化／富营养、水稀缺与化学毒性。
   - **`config/reader-numbering.json` 第四部《环境后果》导语（第 23 行）**：现文仅写“清单给出了排放和耗水等数量……气体怎样改变辐射强迫、污染物怎样到达土壤、水体或人群，以及当地还有多少水可用”，未涵盖第 14 章用半数篇幅论证的土地恢复积分、矿产耗竭与品位曲线、化石热值与分燃料剩余成本以及同一因果链上中点与终点的截点选择。
   - **第 18 章 `B18 [15]`（`cl-water125-value-choices-and-denominator-paradox`）跨章章号笔误**：现文写 `"第 14 章的气候变化、臭氧耗竭、电离辐射以及第 19 章的化学毒性"`——在专著章节序列中，**气候变化位于第 15 章（`B15`《气候当量》）而非第 14 章**，须校准为 `"第 14 章的臭氧耗竭、电离辐射、第 15 章的气候变化以及第 19 章的化学毒性"`。
   - **第 15 章 `B15` 专著与网页双视图引用错位**：（a）`content/monograph/climate-equivalence.mdx:35` 与 `content/docs/book/climate-response-and-metrics.mdx:35` 现写 `[第29章的完整教学例](/docs/book/wall-service-to-comparison/)`，在书籍 32 章视图确为第 29 章，但在网页 37 篇细读视图该页编号为**第 34 篇**，改为不依赖视图序号的篇名链接 `[《墙面服务比较》的完整教学例](/docs/book/wall-service-to-comparison/)` 可在双端同时成立；（b）`B15 [48]`（`cl-bio127-climate-diagnostic-synthesis`）写 `（详见《排放时间与评价》）`，在专著《气候当量》内并无独立章节《排放时间与评价》，对应 8 段即紧邻上一节 **§15.4「排放日历」**，须明确为 `（详见本章“排放日历”一节，网页版单列《排放时间与评价》）`。

2. **第 16、17、18 章及附录 `X04` 遗留冻结段统稿、首现全称补齐与 46 条 `#90` 机械注释清理**：
   - **`B17 [15]`（`cl-pm-evidence-levels.scope`）年份粘连笔误**：`Gronlund2005` 将论文发表年（`2015`）与所分析的美国基准年（`2005`）粘连，更正为 `Gronlund 等 2015 年……`。
   - **全库仅存的 46 条 `#90` 机械拼接 `scope` 字符串彻底清零**：`B17`（`31` 条）与 `X04`（`15` 条）共 `46` 条 `cl-pm-*.scope` 仍保留形如 `"……中的具名方法与证据范围"` 的问句拼接模板（其中多条出现 `"……中形成中的具名方法……"` 双“中”病句），直接暴露在读者可见的 `.claim-annotation` 中。本次逐条改写为自然、贴合各命题对象的范围短语，并同步更新 `knowledge/cases/particulate-health-v1.publication.json` 中对应的 `10` 条案例绑定 `scope`。
   - **专业缩写首现中文全称与跨段记法统稿**：
     - `B17 [6]`（`cl-pm-effect-definition`）：补齐本章首现的 `伤残调整生命年（DALY/死亡）`、`早死寿命损失年（YLL/死亡）` 与 `表征因子（CF）`（将旧译“特征化因子”与全书“表征因子”统一）；
     - `B17 [28]`（`cl-pm-gemm-alternative`）：补齐首现的 `全球暴露死亡率模型（Global Exposure Mortality Model，GEMM）`；
     - `B17 [33]`（`cl-pm-concentration-route`）：补齐首现的 `联合国环境规划署与国际环境毒理学与化学学会全球生命周期影响评价指南（UNEP/SETAC GLAM）`；
     - `B18 [7]`（`cl-water125-method-genealogy`）：在首次提及 `WULCA 共识模型 AWARE` 处补齐 `可用剩余水量共识模型（Available WAter REmaining，AWARE）`；
     - `B17 [2]`（`cl-pm-particle-identity`）：点明 `粒径介于 2.5 至 10 微米的粗颗粒物（Humbert 等记作 PM₁₀–₂.₅）`，消除与 `[13]` 欧盟 `EF 3.1` 流名 `PM₂.₅–₁₀` 之间的下标顺序跳跃；
     - 同章化学式下标统一：`B16 [3]`（`cl-path-acid-indicator`）与 `B16 [14]`（`cl-path-units`）的 `SO2-eq` 统一为 `SO₂-eq`；`B17 [38]`（`cl-pm-matched-scenario`）的 `PM2.5` 统一为 `PM₂.₅`；顺手理顺 `B17 [10]`、`[14]`、`[18]`、`[20]` 四处生硬句式。
   - **`B17` 章末收束与导航悬空指代修复**：将 `B17 [44]`–`[45]`（`cl-pm-population-meaning`、`cl-pm-conclusion`）从原先仅提 `DALY/kg` 扩展为统摄全章已建立的 `kg PM₂.₅ 当量/kg`、`疾病发生例数/kg` 与 `DALY/kg` 三类截点；将 `B17` 第 26 行与 `X04` 第 28 行相隔十段后的裸指代 `"四个发布因子"` 明确为 `"GLAM 澳大利亚城乡四个初级 PM₂.₅ 发布因子"`。

3. **明确保持不动的已核清章节与跨部边界**：
   - `B13` 结尾、`B14` 全章 42 段、`X03` 全篇 8 段、`B19` 全章 20 段及 `B20` 开头经逐段盘点，科学内容、首现定义与部际承接均清晰准确，不制造无实质收益的字面或中西文空格批量刷写；所有 `1,008` 条规范论述的 `id`、`evidenceIds`、`evidenceLinks`、`numericFacts`、`conceptIds`、`mappingIds`、`premiseIds` 与 `caseBinding` 保持 `100%` 守恒。
   - 不同保护对象与终点指标之间的政策目标赋权、本地化分母及货币化偏好取舍归属第五部（`B20`–`B24`），不在第四部回读中越界展开；`Programme #9` 八项全局完成标准继续保持未勾选。

## 二、整部连续审读、可逆门禁与完成标准

1. **三重两轮独立审查**：
   - **独立源义与范围核查（`source`）**：逐条核对本次修订的全部命题文本、`scope`、`particulate-health-v1.publication.json` 同步项、跨章引用与第四部导语，确认无改变任何原始证据含义或数值断言；
   - **零上下文第四部整部连续读者审读（`reader`）**：由全新上下文子代理从 `index.mdx`、第四部导语起连续通读 `B14`、`B15`（含两篇网页源与 `X03`）、`B16`、`B17`（含 `X04`）、`B18`、`B19` 全部 247 条独立论述及过渡段，独立作答跨章综合理解与迁移问题，检验整部教学连贯性；
   - **对抗式出版工程与安全审计（`publication-engineering`）**：检验有界后继门禁 `scripts/reader-part4-reread.mjs` 对 `2ba0bfe2f39d28bfa42e61f5e2b70585770bcb73` 的字节级回退、前驱测试链兼容、`reader-numbering` 与 `#95` `printParts` 导语投影、`/docs/book` 网页 `0..7` 对打印 `1..7` 普通段落索引对齐，以及网页与 `/print` 按日历史控件的完整性。
2. **出版与交付验证**：通过 `pnpm validate`、`pnpm test`、`pnpm typecheck`、干净 `pnpm build`（`dirty: false`）、受影响全页面 Playwright 响应式／无脚本／物理打印核验、严格与分支差异 Docpact（`0` 发现），合并后完成 `https://prism.tiangong.earth` 线上 468 项字节与出版守卫核验及根仓精确子模块集成。
