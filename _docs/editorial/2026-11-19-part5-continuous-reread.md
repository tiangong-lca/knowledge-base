---
title: 第五部《尺度与取舍》整部连续回读、跨章术语与前提桥接及注释定位统稿
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when conducting or reviewing the Part V whole-part continuous reread across B20-B24, Part V introduction and index.mdx
whenToUpdate:
  - when Part V cross-chapter continuity, entry links, first-appearance definitions, premise bridges, evidence locators or review evidence change
checkPaths:
  - _docs/editorial/2026-11-19-part5-continuous-reread.md
related:
  - ../book-execution.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - 2026-11-15-comparative-continuation.md
  - 2026-11-18-part4-continuous-reread.md
  - 2026-11-18-weighting-and-valuation.md
  - 2026-11-18-localization-comparison.md
  - 2026-11-18-social-comparison.md
  - 2026-11-18-cost-and-sustainability.md
---

# 第五部《尺度与取舍》整部连续回读、跨章术语与前提桥接及注释定位统稿

2026-11-19，[任务 145](https://github.com/tiangong-lca/knowledge-base/issues/145)。继续既有比较修订 GOAL 与 [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9)，源码基线为第五部收束章《生命周期成本与综合评价》`PR #144` 合入 `main` 的精确提交 `915af29592cee16d42772ba76080ed913d630e6b`（Git 树 `d4b04b1f383dd14d80bf3a1d3b75ccc9ef5df25a` 与受审头 `7df8239b79d2c01c0443d05d5e2989f600c6861d` 一致，已通过 `https://prism.tiangong.earth` 线上 468 项字节审计、未修改出版守卫核验、`@media print` 打印核验及根集成 [workspace#2464](https://github.com/tiangong-lca/workspace/issues/2464) / [PR #2465](https://github.com/tiangong-lca/workspace/pull/2465) `5f9af0cc4f71dc0425a1a5b47f7a1d7953c16f4d`）。本协议在修改任何 `knowledge/`、`content/` 或 `config/` 文件之前先行提交并推送；事前已完成第五部全卷 `143` 条规范论述、`161` 条关联证据记录及前后相邻部界（`B19`、`B25`）的只读预审盘点（归档于私有任务证据目录）。

## 一、问题定位、全卷覆盖范围与不制造无效改动的边界

随着任务 `#135`（`B20` 生态稀缺赋权与 `B22` 环境损害估值联合比较）、`#137`（`B21` 影响评价本地化跨体系比较）、`#139`（`B23` 社会表现与影响跨体系比较，配合 `#141` 静态导出索引与工作线程缓存优化）及 `#143`（`B24` 生命周期成本与综合评价跨体系比较）全部四个第五部比较单元端到端交付，第五部《尺度与取舍》五章对政策目标距离、公众—专家重要性乘科学稳健度中点加权、空间表征与归一化分母耦合、保护领域终点截停与陈述偏好货币化、产品／组织社会参照与风险量表、三类生命周期成本主体账本、异质货币消重、多准则补偿／否决规则及地球边界配额分配的有界原始对读均已齐备。

然而，单章比较单元不能替代读者从《阅读导论》（`F02`）、第五部导语一路连续读完 `B20` 至 `B24` 全卷 `143` 条论述与 `7` 张数据／综合对照表的整部检验。经全卷只读盘点与首轮三重独立审读校准，本次整部连续回读秉持 **“有据必纠、无病不折腾”** 原则，严格聚焦以下四组真实跨章连续性、术语首现、前提拓扑与尾注定位问题（共修改 `4` 份受管物理文件、`57` 条非案例论述与 `48` 条第五部引用证据定位符，含 `37` 条第五部专属与 `11` 条同 `B05`、`B14`、`B32` 共享的定位记录），且 **零改动全部 `16` 条案例绑定论述（全仓 `40` 份公开案例下载文件逐字节守恒）及任何原始文献数值断言**：

1. **《阅读导论》第五部入口链接、第五部导语章序与综合对照表术语符号校准（`4` 份受管物理文件）**：
   - **`content/docs/book/index.mdx`（`F02` 第 18、22 行）**：全书其余各部在《阅读导论》中均提供至少一处双视图一致的章节入口链接，唯独第五部仅在第 18 行末尾留存 31 字旧概述且无任何章节链接，第 22 行提及“社会评价与成本分析”亦未同第五部综合取舍衔接。本次在第 18、22 行补齐双视图题名与路径完全一致的 `[生态稀缺赋权](/docs/book/ecological-scarcity-and-targets/)`、`[影响评价本地化](/docs/book/localization-evidence-and-denominators/)`、`[环境损害估值](/docs/book/lime-preferences-and-damage-weights/)`、`[社会表现与影响](/docs/book/social-assessment-objects-and-meaning/)` 与 `[生命周期成本与综合评价](/docs/book/cost-perspectives-and-sustainability-combination/)` 阅读入口，并在 `allowedOrdinaryOverrideKeys` 中显式登记 `/docs/book` 与 `/print` 的 `part4-133-ordinary-4`、`part4-133-ordinary-5` 跨代覆盖摘要。
   - **`config/reader-numbering.json` 第五部《尺度与取舍》导语（`parts[4].introduction`）**：现行导语写于 `#135`—`#143` 之前，次句按“地区和时期的基准（`B21`）→ 政策目标（`B20`）→ 谁为损害赋值（`B22`）”倒置了前两章次序，且未覆盖混合稳健度中点加权、空间表征与归一化分母耦合、保护领域主动截停、社会参照与不可补偿基本权利底线、主体成本贴现翻转与地球边界配额分配。本次严格按 `B20 → B21 → B22 → B23 → B24 → 第六部` 顺序重写单段导语，并在 `/print` 输出 `<details class="legacy-citation-context" data-part5-reread-part="5">` 保留前版导言范围与源文件链接。
   - **`B22` 表 2（`content/docs/book/lime-preferences-and-damage-weights.mdx:38–39`）与 `B23` 表 1、表 2（`content/docs/book/social-assessment-objects-and-meaning.mdx:14–16, 31`）**：将 `B22` 表 2 首行 `生态点数（UBP）` 校准为同 `B20 [2]` 一致的 `环境负担点（UBP，亦称生态点数）`，并在第 2 行补齐 `产品／组织环境足迹（PEF／OEF）` 与 `类别规则（PEFCR）` 中文释义；在 `B23` 表 1 与表 2 中补齐 `1 美元（USD）`、`1 美元（2012 年不变价，USD2012）` 中文货币释义，明确欧盟成衣示例原印件将年度周洗水电误按单套 `0.69 kg` 计算、后节 `40 对 20 美元` 算例、各国年均工资 `W_c` 倒数（`43,746 美元/W_c`）及每十万雇员违规数指标 `y` 的含义。

2. **跨章机构／方法译名统一、跨章数值锚点衔接、章首现全称补齐与表格导引**：
   - **`AWARE`、`PROMETHEE` 与 `CTUe` 跨章译名校准**：将 `B21 [6]`（`cl-loc137-ef31-location-regimes`）误写的 `水资源可用性足迹方法（AWARE）` 核正为同第四部 `B18 [1]` 一致的 `剩余可用水模型（AWARE）`；将 `B22 [40]`（`cl-weight135-glam3-reporting-discipline`）的 `偏好顺序结构评估法（PROMETHEE）` 统一为同 `B24 [15]` 一致的 `偏好排序组织法（PROMETHEE）`；将 `B20 [23]`、`B21 [7]` 与 `B24 [11]` 的 `CTUe` 中文定名统一为 `淡水生态比较毒性单位（CTUe）`。
   - **`UNEP GLAM` 译名与范围报告年份校准（`B21 [25]`、`B22 [40]`）**：统一为同 `B23`、`B24` 一致的 `联合国环境规划署全球生命周期影响评价方法共识项目（UNEP GLAM）`，并删去 `B22 [40]` 正文与范围句中对 `src-acid113-glam-scoping` 未经载体扉页核实的 `2020年` 年份限定。
   - **`CML` 与 `RIVM` 荷兰机构译名统一及跨章数值锚点补足**：将 `B20 [31]` 与 `B22 [39]` 统一为 `荷兰莱顿大学环境科学中心（CML）`，将 `B22 [36]` 统一为 `荷兰国家公共卫生与环境研究院（RIVM）`；在 `B20 [24]`（`cl-weight135-ef-coating-indoor`）补充室内苯乙烯致癌与非致癌两项表征因子均达室外的约 `211` 倍（同 `B23 [16]` 及表 2 呼应，综合加权分值升约 `146` 倍），并在 `B24 [6]`（`cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting`）注清 `ReCiPe 2016` 报告第 13 章表 13.2 原油未贴现均值 `0.457 USD2013/kg` 同前文《环境损害估值》所引该报告总表 1.5 四舍五入 `0.46`（`B22 [36]`）的对应关系。
   - **章内首现缩写、货币括注、表格导引句及正文裸 `§` 清理**：`B21 [13]` 正文 `同页§3.2` 规范为 `同页第3.2节`；`B21 [16]` 正文 `原件使这两种用途得以分开` 规范为 `2001年原刊使这两种用途得以分开`；`B22 [31]` 首现补明 `后来的第二版（LIME2）`；`B23 [5]` 全书首现补齐 `原生产品社会影响生命周期评价数据库（PSILCA v3）`（消除括注后多余空格）并在句末补充引出表 1 及衔接下一节算例的导引句；`B24 [4]` 与 `B24 [5]` 补齐 `全拥有成本（TCO）`、`10,000 €（欧元）` 与 `328,826 USD（美元）`。

3. **跨章与章末收束前提直接衔接及第五部全部非案例论述前提拓扑升序化**：
   - **建立 `B20 → B21`、`B20 → B23` 与 `B22 → B24` 直接跨章前提衔接及章末收束合成前提**：
     - `B21 [1]`（`cl-cn-question`）：首句承接瑞士政策目标赋权，补充 `["cl-es-authority", "cl-weight135-target-vs-hybrid-boundary"]`；
     - `B21 [36]`（`cl-cn-conclusion`）：章末收束补充 `"cl-loc137-four-layer-localization-audit"`；
     - `B22 [41]`（`cl-lime-decision`）：章末收束按正文顺序整理并补充 `"cl-weight135-lime-three-table-rereversal"`、`"cl-weight135-four-paradigm-synthesis"`、`"cl-weight135-glam3-reporting-discipline"`；
     - `B23 [4]`（`cl-soc139-portfolio-reference-and-comparative-assertions`）直接前置引用 `B20 [31]`（`"cl-weight135-comparative-assertion-regimes"`），`B23 [16]`（`cl-soc139-cross-pillar-overlap-audit`）直接前置引用 `B20 [24]`（`"cl-weight135-ef-coating-indoor"`），`B24 [6]`（`cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting`）直接插入引用 `B22 [36]`（`"cl-weight135-recipe-endpoint-stop"`），使跨章前提严格挂接在直接引用该机制或表值的论述上。
   - **第五部全部非案例论述 `premiseIds` 严格升序规范（共 `18` 条重排）**：对 `B20 [30, 32]`、`B21 [13, 23, 24, 25, 26, 29, 32, 34, 35]`、`B22 [7, 21, 22, 32, 37, 38]` 与 `B24 [14]` 统一按“跨章前提在前、同章前提按注号升序在后”排序，并在门禁中对第五部全部非案例论述作程序化逆向无环与严格升序校验。

4. **第五部全部 `48` 条引用证据定位符（`ev-*.locator`）、非案例尾注范围／限定语与引文摘录组件规范化**：
   - **全部 `48` 条第五部引用 `ev-*.locator` 规范化（`37` 条第五部专属＋`11` 条同 `B05`、`B14`、`B32` 共用）**：彻底清除全部 `PDF第…页`、`PDF indices`、`印刷pp`、`印pp`、裸 `§` 及英文 `Chapter`/`Table`/`Boxes` 定位简写，统一为自然中文学术节次与印页表述，使第五部全部 `143` 条论述尾注实现零阅读器页码与零裸节号泄露。
   - **非案例尾注 `scope`/`caveats` 净化与摘录组件学术表述校准**：清除非案例尾注中残留的内部台账／代码表名用语，准确保留 `B21 [17]` 跨区比较限定与 `B21 [27]` `UNEP GLAM 2024/2026` 响应曲线三套推导同未加权区域空间均值的原始边界；同时在激活本单元后将 `ArtifactReading` 的 `derived-text` 说明规范为 `原载文献的公开文字摘录，引用限于所列文字与数值，不包含原刊版面或表格图像的版式核对`，并消除章末注释中 `Organizations2020` 连写与 `— official Bundesblatt carrier` 载体后缀。

## 二、整部连续审读、可逆门禁与完成标准

1. **三重多轮独立无条件 `PASS`（`0 BLOCKER / 0 MAJOR / 0 MINOR`）审查**：
   - **独立源义、定位符与范围核查（`source`）**：逐条核对本次修改的全部 `57` 条非案例论述文本、`scope`、`caveats`、`premiseIds`、`48` 条 `ev-*.locator`、两张微调表格及《阅读导论》／第五部导语，确认零改动任何数值断言、零触碰 `16` 条案例论述；
   - **零上下文第五部整部连续读者审读（`reader`）**：由零上下文审读者从 `index.mdx`、第五部导语起连续通读 `B20`—`B24` 全部 `143` 条论述与 `7` 张表格（含全部 5 章网站细读题要与尾注），检验整部教学连贯性、术语一致性与出版体例；
   - **对抗式出版工程与安全审计（`publication-engineering`）**：检验有界后继门禁 `scripts/reader-part5-reread.mjs` 对 `915af29592cee16d42772ba76080ed913d630e6b` 的字节级回退、嵌套严格键集（`exactKeys`）、多页 `PDF` 范围阻断、全卷非案例前提升序门禁、前驱验证链兼容、网页与 `@media print` 按日历史控件及 `style={{ display: 'block' }}` 更正说明可见性，以及编译 CSS 零漂移（`be180e5d...`）。
2. **出版与交付验证**：通过三重无条件 `PASS`（`0 / 0 / 0`）、`pnpm validate`、`pnpm test`、`pnpm typecheck`、干净提交态 `pnpm build`（`dirty: false`、`468` 项产物、CSS 零漂移）、Playwright 响应式视口／无脚本键盘跳转／`@media print` 物理打印核验、临时克隆清理回执与严格 Docpact 校验（`0` findings），合并后完成 `https://prism.tiangong.earth` 线上 `468` 项字节与出版守卫核验及根仓精确子模块集成。
