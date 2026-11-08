---
title: 数据适用性的成文与选材协议
docType: design
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or reviewing the data applicability chapter
whenToUpdate:
  - when source reading, material dispositions or publication acceptance changes
checkPaths:
  - content/monograph/data-applicability.mdx
  - content/docs/book/database-fitness-and-documentation.mdx
  - content/docs/book/review-support-and-version-boundaries.mdx
  - knowledge/catalog.json
  - knowledge/research/readings.json
  - config/**
  - scripts/reader-*.mjs
related:
  - ../lca-book-goal.md
  - ../editorial-protocol.md
  - ../reader-publication-contract.md
  - 2026-11-08-argument-and-selection.md
---

# 数据适用性：已有检查怎样进入一次使用

执行任务为[knowledge-base#86](https://github.com/tiangong-lca/knowledge-base/issues/86)，全书协调仍为[#9](https://github.com/tiangong-lca/knowledge-base/issues/9)。本协议及原始快照先于原文重检与正文修改提交、推送。基线为Main`46b99baf16fadaae7a90ca68d003fc4d3652359f`，前项气候84/PR85和workspace2308/PR2309均已完成正常终态；rootMain`a80183dd3141008321e9245faea706b914d89507`包含该精确子仓提交。复用独立工作树，分支`codex/book-data-applicability`，PR目标main。原workspace与其他物理子仓状态保持。

## G1　问题、前提和拟交付答案

**已取得的数据和既有审查记录，怎样成为本次使用的根据？**

第六部接在评价对象、地区、政策和偏好取舍之后：选择了一个指标，还需要知道资料表示的对象是否适合自己的问题。两篇旧稿分别讨论数据质量和审查，前篇以文档结束，后篇重新从准则起步。B25按同一数据使用链成文，使表示对象、质量信息、已有检查与版本变化共同支持一次有条件选择。合章依据是这项未完成的认识转换，不是把33章压到32章。

拟交付的正面答案是：说明资料所代表的对象与研究所需对象的关系，用文档辨识已知质量和缺口，再根据原审查的具体事项及当前变化，区分已有根据能够支持的使用、需要补查的环节与应另选资料的情形。这里不是为任何真实数据集发证，也不声称一组通用条件足以保证全部用途。向下一章“不确定性”交付的是明确对象和知识状态；分布的含义与校准另有其问题。

初拟四节“表示对象／质量信息／审查范围／版本变化”。最后一节若仅重复第三节，应在实际成稿时合并；不把四节或十二段设为必须填满的格子。网站保留两种查阅入口，书籍独立连续编排，科学文字与证据共用规范记录。新综合如确有独有推理，应有独立身份与前提，不借旧ID承载更强命题。

## G2　原有材料的作用和去向

主代理已完整阅读两份MDX、全部12条规范记录和既有阅读登记；另有独立下一单元评估。此处的材料决定先于新原件重读，尚非新稿接受。

| 原规范身份 | 必需作用与拟去向 | 保留的条件 |
|---|---|---|
| `cl-db2011-user-and-manager` | 正文开篇：把取得、接纳与使用连接为一个问题；缩去可被后文承担的重复告诫 | 管理者、开发者与使用者责任不同；入库一致性不完成具体适用性判断 |
| `cl-db2011-represented-object` | 正文：给技术、时期、地域、边界和用途一个共同的表示对象 | 指南数据集尺度；同名过程不足以建立连接；不冒充ISO原文 |
| `cl-db2011-representativeness-and-precision` | 正文：解释为什么稳定数值也可能不代表所需对象 | 各质量维度不能互相代替；Table4.1为该卷适配表，不是实测质量 |
| `cl-db2011-missing-and-zero` | 正文：说明计算覆盖与信息状态怎样改变可用结论 | 缺失不等于真实零；LCI建议不直接规定LCIA四状态数据模型 |
| `cl-db2011-documenting-number` | 正文：从质量疑问转向可追问的测量、估计、计算和假设 | 保密、透明与工作量的取舍；不要求公开受限原始资料 |
| `cl-db2011-aggregation-information` | 正文：聚合以后用户依靠什么检查关键选择 | 底层资料、链接、分配和流细节；聚合并非必然劣质，也未因此完成复算 |
| `cl-db2011-review-relative-to-criteria` | 正文：说明已有审查可以怎样复用，哪里须补充 | 单数据集与完整研究有别；库之间准则不同；指南引述不替代ISO |
| `cl-db2011-validation-context` | 正文短解释、就近注释给出两个精确语境 | 第2章实际过程表示与第4章脚注的准则检查不强制统一，也不直接判为矛盾 |
| `cl-db2011-review-questions` | 正文：让准则落到实际人员、对象、检查、例外和记录 | 记录完整不保证判断正确；未审内容不得转授批准 |
| `cl-db2011-recommendation-strength` | 正文在首次运用指南身份时交代，细部定位留注释 | 本卷shall为强烈推荐，支持性少数意见可保留；非普遍强制要求或全领域共识 |
| `cl-db2011-review-of-guidance` | 正文一次具名反例，必要细史可就近注释，但保持实质公开可读 | 草稿章评语总体正面与具体批评、0/1/8未受章节同行评审、委员会整体肯定及编者处理说明各有对象 |
| `cl-db2011-versioned-confidence` | 正文结尾：把变更连回上述检查，形成可修订的使用根据 | 更新不使全部旧证据必然失效；没有检查过的部分不因版本新而获证 |

Annex2细史已从B32收束章压缩并回指本单元。这里必须保留充分公开解释，不能再以“删重复”为由只放开发档案。十二项责任可改写、合并表达或转入真实就近注释，任何实际转层须记录准确位置、下游使用和旧引用去向。无需为看起来实用而制造一个真实数据库合格案例，也不新增计算器或数字。

## G3　共同点、差异与未知

主要依据是一份2011指南，章节和同卷评审不是多项独立经验确认。角色、数据集与完整研究、不同validation语境以及推荐支持强度的差别，首先属于问题与范围差异；不编造两派论战，也不宣称整个共同体一致。已有检查可提供有范围、可追踪的依据，这个正面所得与它不能覆盖的事项同时呈现。

未知包括未检查的原始观察、当前真实数据库执行、被引ISO全文及所有使用情景。新版或整体积极评语不能填补这些缺口。若重读暴露现有文字过强，应修正命题及所有受影响消费者，保留原始身份和更正理由；不能只让句子更顺而增强支持程度。

## 原始冻结和受影响关系

`config/data-applicability-original.json`的SHA256为`4dca4a39c5ebae5f9262aec23b551eb33aedd8b54a1cefea3c2d427915479bc3`。它记录两份完整源、12完整命题、12证据、1来源、7外部下游命题、2概念和77文件摘要；12命题的前提全在自身集合，无外部前提。这是原稿守恒，不是新阅读或新稿批准。

九条原命题位于不可变B32科学闭包：user-and-manager、represented-object、representativeness-and-precision、missing-and-zero、documenting-number、review-relative-to-criteria、review-questions、review-of-guidance、versioned-confidence。现行B32接受已有七项时间命题差异和六项消费者判断，必须保留，只增加经实质检查的精确本单元变化；不重写原始B32快照，不让未列记录自由变化。

六个直接消费者为`cl-connect-object-before-unit`、`cl-connect-target-and-distribution`、`cl-connect-reuse-keeps-relation`、`cl-connect-zero-needs-origin`、`cl-connect-review-does-not-transfer`、`cl-connect-next-evidence-at-link`；另有传递消费者`cl-closing-historical-return`。连同`cn-data-fitness`、`cn-review-scope`的定义用途全部复核。原12条身份并不自行授权改写这些下游文字。

历史已有4140项义务全部保留。改变当前两章边界前，另外依据已保存的实际Main46bHTML核准相关后发标题；不把源代码推演称为真实网页捕获。旧6/6注释组、旧单元和旧标题的精确原范围保留，不能扩大为新章全部内容。新书章连续注号与网站各自成员均从实际源确认。18案例输入、17气候模板、22墙面模板及所有无关原生摘要、因子、发行身份不变。

独立盘点与主代理的标准库HTML解析及不可变Git复核确认，已保存Main46b的两网页和打印HTML均匹配原manifest。六个此前未覆盖的打印节标题具有真实唯一ID。`config/data-applicability-heading-original.json`摘要为`115cbe1cf982d762b84119eb55b3c8b14d30de37e7e64f7d9e9eee6058b56a0c`，保留三份实际HTML摘要、六项标题、六份历史源码身份和各节原注范围，不含私有路径，也不冒称新托管访问。

原4140项中72项涉及本单元，两路由各36项；dd715663来源42项，a36597d来源30项。新增六标题后为4146项。通用网页H1焦点ID不计作新增规范节引用，原网页标题和6/6范围仍需保护。概念标记另涉及九条外部邻接命题；它们不是额外前提消费者。若定义实质改变，应检查这些用途，不能从七项前提闭包推定所有概念用途均无影响。

## G4　阅读、成稿和交付门槛

先重检已登记2011原件SHA256`1e466cdcea78b12ac800cc31d4f2413cc08905553f567775bdd5c51ac7c5e0ac`：印刷pp44–46对应PDF indices45–47；54–55对应55–56；61–64对应62–65；85–95对应86–96；145–149对应146–150。重点复看支持语言、Table4.1、两处术语、审查记录与Annex2。选段及表格/脚注需按实际读取方式记载；不把原阅读日期改成今天，新增检查单独追加。若本地原件不可得，沿已登记公开原URL重新取得并核对字节身份，失败或不同版本分别记录，不能假称旧文件仍存在。

这是既有证据重新服务于新连接的有界阅读，不预先启动泛化数据库或标准检索。新增搜索只由不受支持的新连接、关键反例或来源冲突触发，记录问题、渠道、多语言查询与停止条件。当前单来源不能承担现行认证、标准合规或经验适用性结论；这些不在本轮可借用的权威范围。

完成实际稿件后，分别进行来源/语义及全部消费者复核、新上下文连续读者检查、适当工程拒绝性检查。独立读者应读新章、前一成本/组合输入及后一不确定性正文，判断正面答案与过渡是否成立；不假称全第六部或全书通读。软件检查实际正文和注释、条件/来源/前提、旧范围、额外或隐藏未审内容和真实导航，不以空ID通过。

通过测试、类型、目录、严格Docpact、干净构建及导出，再核验实际大小屏、明暗主题、无脚本、打印和精确托管来源。源码PR所需CI与main合并、精确root集成、正常终态和资源收尾分别完成。正式PDF和全书版次不从HTML打印推定。

当本章问题有有条件答案、必要反例有去向、所有受影响使用已复核时，停止本单元研究；新来源矛盾或实际读者暴露的缺失联系可重开。四节合章若成立，预计32章、39阅读单元、160正式节；这是待实际统计的局部结果，仍远未通过≤120节，也未完成八领域、十二附录、42映射、S01/S04、全球经典/地区/行业/经验/原生及正式版次等责任。无正文、新阅读、独立接受或出版完成在本协议阶段被预先宣告。
