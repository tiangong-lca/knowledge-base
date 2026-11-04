---
title: 第一波经典与社区文献发现图谱
docType: research
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh
whenToUse:
  - when extending or auditing the first book literature-discovery wave
whenToUpdate:
  - when source identities, access findings or discovery gaps in this wave change
checkPaths:
  - knowledge/research/literature-map.json
  - _docs/research-waves/2026-11-04-community-map.md
related:
  - ../book-execution.md
  - ../lca-book-goal.md
  - ../publication-contract.md
  - ../editorial-protocol.md
---

# 第一波经典与社区文献发现图谱

本轮对应 [执行任务 #10](https://github.com/tiangong-lca/knowledge-base/issues/10)，服务于仍然开放的[全书协调任务 #9](https://github.com/tiangong-lca/knowledge-base/issues/9)。本轮整理作品身份、发现路径、合法获取路线和缺口。它不宣称已穷尽经典、完成社区覆盖或完成全书。具体记录见 [literature-map.json](../../knowledge/research/literature-map.json)。

## 记录单位与去重

目标文件第11节的42个候选入口全部保留原 `goalSeedIds`。2026-11-04发现的25项候选或身份修订中，D-COM-04与B02属于同一本 SETAC Code of Practice，合并到稳定记录 `lit-b02`；其余24项新增。因此图谱现有66条记录。记录类型包括书籍、报告组、论文、方法发行物、标准、回顾和发现门户。这个数目既不是“66本经典”，也不是66项独立研究或任何地区的覆盖分数。

原种子使用 `lit-b01`、`lit-h01` 等稳定ID；新增记录使用 `lit-com-01` 等ID，保留 `identifiers.discoveryRecord` 作为本轮发现编号。没有另建 `lit-com-04`。Nordic作者更正作为原论文的 `correctionDoi` 和更正URL保留；论文集、博士论文及其所收论文不视为独立重复验证。

原种子的实际检查日期为2026-11-03，保留在 `accessedAt` 和 `lastCheckedAt`。本轮确实重开的B02、C01、M01更新 `lastCheckedAt`，同时保留原首次访问日。其余种子没有统一刷新为今天。引用一个种子不代表本轮重新访问了它。

## 有界发现协议

问题是：哪些早期或区域原始作品尚未进入种子登记；能够核验哪些身份及合法获取路线；哪些原始方法争论、更正、反例和原语传统需要进一步阅读。

本轮采用目的性、有界检索，优先出版商、政府、标准机构、学会、作者机构仓储和机构馆藏。检索日期为2026-11-04；未对历史出版年份设置排除范围。关键词聚焦早期SETAC四书、Nordic1995、日文LIME/ILCA、中国机构与标准、瑞士生态稀缺性、美国TRACI，以及分配与后果建模的原始争论。再沿实际可见的参考文献检查具体作品身份。实际保留的主题级检索字符串、日期和渠道在JSON的 `protocol.queries` 中，按Q1—Q7保存；中间重述和URL重试未穷尽重建，不能把它当作完整事务日志；历史42个种子的原检索字符串未保存，使用明确标注的导入描述，未事后补造。

语言入口主要是英文、德文、日文和中文；这不是完整多语种数据库检索。Nordic传统中的英文指南仍记为英文，不因地区归属而标作非英语原文。地区、传统、卷位和主题标签属于本项目编辑导航，不能单独证明思想起源或影响关系。`citationParents` 仅保存实际看到的“该父记录引用此作品”关系，不以门户收录、标题相似、同一作者或主题相邻推断引用或影响。

检索和初筛由Agent完成，未执行独立双人筛选或领域专家评审。停止条件是完成这一轮指定主题的有界发现并记录缺口，未宣称达到理论饱和、达到特定召回率或符合PRISMA/ROSES。

## 新增与修订作品

下表是发现记录索引；具体版本、访问失败、署名限制和权利见JSON。所有记录的 `readingStatus` 保留为 `not-close-read`，原文取得和网页可读不能改写为已完成精读。

| 发现ID | 稳定记录 | 原始作品或身份修订 | 日期身份 | 状态边界 |
|---|---|---|---|---|
| D-COM-01 | `lit-com-01` | A Technical Framework for Life-Cycle Assessment | 1991 first publication; 1994 resource/printing; manifestation unresolved | partial; login-required |
| D-COM-02 | `lit-com-02` | A Conceptual Framework for Life-Cycle Impact Assessment | 1993 publication; February 1992 workshop | verified; login-required |
| D-COM-03 | `lit-com-03` | Life-Cycle Assessment Data Quality: A Conceptual Framework | 1994; exact release day not title-leaf verified | verified; login-required |
| D-COM-04 | `lit-b02` | Guidelines for Life-Cycle Assessment: A “Code of Practice” | 1993; edition 1 | partial; login-required |
| D-COM-05 | `lit-com-05` | Nordic Guidelines on Life-Cycle Assessment | 1995 | partial; unavailable |
| D-COM-06 | `lit-com-06` | On the nordic guidelines for life cycle assessment | 1996; correction online 2021 and issue 2022 | verified; login-required |
| D-COM-07 | `lit-com-07` | ライフサイクル環境影響評価手法 : LIME-LCA, 環境会計, 環境効率のための評価手法・データベース | 2005-09 | verified; metadata-only |
| D-COM-08 | `lit-com-08` | LIMEの特徴と研究開発の現状 / Characteristics and Present Research Status of LIME | 2007; J-STAGE availability 2019-12-15 | verified; public-fulltext-available |
| D-COM-09 | `lit-com-09` | Preface | 2018; published 13 November and issue December | verified; public-fulltext-available |
| D-COM-10 | `lit-com-10` | GB/T 24044—2008 — 环境管理 生命周期评价 要求与指南 | 2008; issued 26 May and implemented 1 November | partial; metadata-only |
| D-COM-11 | `lit-com-11` | 生命周期评价在清洁生产领域的应用前景 / The Application Prospect of Life Cycle Assessment in Cleaner Production | 2002; 15(4):4–6 | verified; public-fulltext-available |
| D-COM-12 | `lit-com-12` | 生命周期评价在国内的研究进展评述 | 2010; 38(5):2553–2555 | verified; abstract-or-excerpt |
| D-COM-13 | `lit-com-13` | Methodik für Ökobilanzen auf der Basis ökologischer Optimierung | 1990 | partial; unavailable |
| D-COM-14 | `lit-com-14` | Ökofaktoren Schweiz 2013 gemäss der Methode der ökologischen Knappheit. Methodische Grundlagen und Anwendung auf die Schweiz | 2013 | verified; public-fulltext-available |
| D-COM-15 | `lit-com-15` | Ökofaktoren Schweiz 2021 gemäss der Methode der ökologischen Knappheit. Methodische Grundlagen und Anwendung auf die Schweiz | 2021 German edition; English announcement 2022-09-01 | partial; unavailable |
| D-COM-16 | `lit-com-16` | TRACI: The Tool for the Reduction and Assessment of Chemical and Other Environmental Impacts | 2002 issue label versus 2003 EPA citation; 2008 platform date separate | unresolved; abstract-or-excerpt |
| D-COM-17 | `lit-com-17` | Tool for the Reduction and Assessment of Chemical and Other Environmental Impacts (TRACI), Version 2.1, User's Guide / User's Manual | 2012; July/August front matter and June approvals retained separately | verified; public-fulltext-available |
| D-COM-18 | `lit-com-18` | Choice of system boundaries in life cycle assessment | 1994; 2(1):21–29 | verified; abstract-or-excerpt |
| D-COM-19 | `lit-com-19` | Open-Loop Recycling: Criteria for Allocation Procedures | 1997; 2(3):155–162 | verified; login-required |
| D-COM-20 | `lit-com-20` | Allocation of environmental burdens in multiple-function systems | 1999; 7(2):101–119 | verified; abstract-or-excerpt |
| D-COM-21 | `lit-com-21` | Avoiding Co-Product Allocation in Life-Cycle Assessment | 2000 issue label; some citations use 2001; platform online 2008 separate | partial; abstract-or-excerpt |
| D-COM-22 | `lit-com-22` | Addendum to the Article “Avoiding Co-Product Allocation in Life-Cycle Assessment” | 2001; standalone page/DOI metadata not verified | partial; public-fulltext-available |
| D-COM-23 | `lit-com-23` | Normative ethics and methodology for life cycle assessment | 2005; 13(13–14):1225–1234; accepted 2004 not publication year | verified; public-fulltext-available |
| D-COM-24 | `lit-com-24` | LIME2 — 意思決定を支援する環境影響評価手法 | 2010-11-30 per institutional newsletter; original title leaf not read | partial; metadata-only |
| D-COM-25 | `lit-com-25` | System Expansion and Allocation in Life Cycle Assessment With Implications for Wastepaper Management | 1999 | verified; public-fulltext-available |

## 必须保留的身份修订与获取限制

- **SETAC原书与当前访问门槛。** [技术框架](https://www.setac.org/resource/technical-framework-for-lca-pdf.html)、[LCIA框架](https://www.setac.org/resource/conceptual-framework-for-life-cycle-impact-assessment.html)、[数据质量](https://www.setac.org/resource/lca-data-quality.html)和[Code of Practice](https://www.setac.org/resource/guidelines-lca-code-practice-1993.html)的当前原始资源页均要求账号登录。2022回顾称已数字化并免费提供，不能代替今天的实际访问状态。技术框架的1991首次出版、1994载体/印次与工作坊日期仍需原书核验；不据网页日期解决冲突。
- **B02与期刊通知不同。** Code of Practice按原书登记，作者角色由当前出版商页补充为编辑；原页存在“Burce Vigon”等排版错误，规范化显示保留其来源限制。[DOI 10.1007/BF02986927](https://pubmed.ncbi.nlm.nih.gov/24234150/)是1994年一页期刊通知，不是1993原书的DOI。
- **Nordic指南尚未取得原始载体。** Nord1995:20由[同期作者论文](https://link.springer.com/article/10.1007/BF02978635)的文献表及官方报告书目建立身份；原指南与TemaNord技术报告保持分开。论文当前原页仍显示作者拼写问题，规范化身份参照[正式更正](https://link.springer.com/article/10.1007/s11367-021-01901-5)。目录或作者论文不能替代指南全文。
- **LIME多种载体不得混用。** [2005日文原书馆藏](https://ci.nii.ac.jp/ncid/BA73348989.amp?l=en)、2010日文LIME2原书、[2007日文解说](https://www.jstage.jst.go.jp/article/lca/3/1/3_39/_article/-char/ja/)和[2018 Preface](https://link.springer.com/article/10.1007/s11367-018-1545-6)分别建记录。最后一个DOI的实际题名只是“Preface”，不是完整LIME3方法手册或系数发行包。原书CD、因子文件和英文通讯摘要也不自动拥有同一种许可。
- **中文文献表的错误必须回到原件。** 孙启宏2002论文由[期刊原始PDF](https://www.hjkxyj.org.cn/cn/article/pdf/preview/20020402.pdf)首页图像确认是《环境科学研究》15(4):4–6，而2010综述的参考文献写作15(2)。该PDF文本编码异常，不能只依赖文本提取。2000年综述的作者姓名和页码在机构书目与后续引文间不一致，本轮保留为后续线索，未纳入已解决的独立记录。
- **中国标准的等同采用关系不等于完成条款阅读。** [GB/T24044—2008官方记录](https://std.samr.gov.cn/search/stdPage?q=GBT24044)给出与ISO14044:2006的IDT关系和发布日期；本轮未取得条款全文，也未检查全部历史版本或修订件。
- **瑞士方法需要原始版本链。** [2013官方德文报告](https://www.bafu.admin.ch/dam/de/sd-web/Goa618goqARL/oekofaktoren_schweiz2013gemaessdermethodederoekologischenknapphe.pdf)的版权页、目录及有关书目局部可核验；其引用的1990原报告尚未取得。2021德文版与2022英文公告日期分开。旧英文文件404、迁移德文文件超时/连接重置，均记为失败，搜索索引可见文字不改写成已取得全文。
- **TRACI原文身份尚有冲突。** [Wiley原文章目](https://onlinelibrary.wiley.com/doi/10.1162/108819802766269539)显示2002卷期及单一作者，而[EPA2.1手册](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P100HN53.TXT)列四作者并引为2003。需要原期刊首页解决；2008平台上线时间不能替代卷期年。2012手册本身的July/August封面与June审批日也分别保留。
- **分配争论必须保留作者更正。** [Weidema2001增补](https://jie.yale.edu/sites/default/files/files/v4n3_LTE_Weidema_359.pdf)明确修改早期规则并要求不再使用原表/例的部分内容。它与原论文一起登记，不能只复述原摘要的普遍性表述。合法取得的论文摘要、机构附件链接与真正取得全文有区别；Manchester所列5.28KB附件尚未打开，未声称是完整18页论文。

## 已排除的替代与未决线索

未使用来历不明的整书镜像、付费墙绕行或访问凭据。ResearchGate检索命中仅作为线索；未将它当作全文取得或权利依据。JIE的中文摘要文件不能充当英语原论文全文。[Nordic检索命中中的2017绿色采购文件](https://norden.diva-portal.org/smash/get/diva2%3A1087097/FULLTEXT01.pdf)也不是1995生命周期评价指南。这些错误替代没有因为标题相近而进入被验证的作品身份。

原始文件留在仓库外的任务缓存。公开图谱只包含书目信息、定位、访问状态和本项目原创说明，不发布原文、图像、付费标准条款或私有研究记录。第三方权利不因本项目知识记录的许可而改变。只有LIME3 Preface在本轮明确观察到CC BY4.0声明；其余记录不猜测开放许可。公开下载也不自动授权再分发或商业使用。

## 下一步的实质缺口

1. 通过SETAC与图书馆合法取得原书，核准扉页、印次和同期工作坊记录；取得Nord1995:20和TemaNord1995:502/503原报告，再比较概括指南与技术附件。
2. 对分配争论建立成对阅读：原始方案、作者增补、独立批评、边界条件和可复现反例。继续追查Huppes/Schneider1994工作坊、Ekvall/Finnveden2001、Tillman2000、Frischknecht1998及Schneider1996法文论文。
3. 补齐瑞士1990及1978/1982前史、各代发行物和因子许可；日本原书、LIME3各类别论文、独立验证和EcoBalance/ILCA形成史；中国早期本土LCIA、教材、标准历史版与存在冲突的原始综述。
4. 美国TRACI以外，继续查加拿大规范、EPA早期清单报告、GREET、BEES和独立区域化验证。方法门户或一份美国工具不证明北美社区已经覆盖。
5. 拉美、非洲、南亚/东南亚、韩国、东欧以及其他原语传统尚未形成相当的作品级检索；德法传统也不能由邻近瑞士/北欧材料代表。先建立当地机构和原语检索，再落实原始作品及反证。
6. 各影响路径、IO/混合方法、质量与不确定性、行业案例及失败、历史软件/数据库、前沿方法和AI评价分别需要专题协议。来源数量不能替代这些实质缺口。

JSON的13项 `gaps` 给出卷位、优先级和下一检索任务。其关闭条件应是取得和评审具体材料，或形成明确、有依据的范围排除；列入队列本身不构成完成。

## 验证范围

本轮结构检查验证66个唯一记录ID、42个原种子各出现一次、25个发现编号均可追踪、B02合并关系、检索/引用ID可解析、日期差异和所有 `not-close-read` 状态。该检查不证明科学真实性、引用关系的完整性、来源永久可用、许可充分或专家认可。内容与全书论证是否成立仍须独立、逐定位的原文阅读和评审。
