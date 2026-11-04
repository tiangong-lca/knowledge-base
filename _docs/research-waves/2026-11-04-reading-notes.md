---
title: 第一轮原始文献选段阅读记录
lang: zh-CN
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when checking what the first book research wave actually read
  - when binding source statements to version-specific passage records
whenToUpdate:
  - when access, passage verification, appraisal or revision disposition changes
checkPaths:
  - knowledge/research/readings.json
  - _docs/research-waves/2026-11-04-reading-notes.md
related:
  - ../book-execution.md
  - ../lca-book-goal.md
  - ../editorial-protocol.md
---

# 第一轮原始文献选段阅读记录

检索、取得与选段核读日期均为 **2026-11-04**。本轮执行任务为 [knowledge-base #10](https://github.com/tiangong-lca/knowledge-base/issues/10)，所属持续著作任务为 [knowledge-base #9](https://github.com/tiangong-lca/knowledge-base/issues/9)。授权和后续边界见[执行记录](../book-execution.md)。这里记录公开出版研究的实际范围；它不是新的私有实验、系统综述完成声明或全书完成证明。

[结构化阅读账本](../../knowledge/research/readings.json)包含八项 `selected-passages` 阅读、六个作品身份、九个取得载体、35 个定位组、十项缺口和八项待处置的修订建议。定位组可交叠，数量不能解释为互相独立的证据数。CML 三个分册属于同一作品；EPA 2006 的 PDF 和 NEPIS HTML 是同一作品的两个载体。

## 问题和资格边界

本轮围绕三个问题选择资料：早期框架和限制在原始机构文献中怎样表述；目的、功能单位、参考流、边界和解释之间怎样连接；哪些经典原书、原始历史资料和独立批评仍未取得。

以原始公开机构文件为主要入口；书目、后继回顾和搜索结果用于发现，不能替代原著。对每个取得载体固定版本、实际 URL、SHA-256、载体类型与可核验页数；对每段记录定位、主题和不能推出的结论。阅读同时检查上下文、脚注、例子的假设、替代解释、同一文献内部的不一致及未取得的旁证。多个协作阅读记录由主任务整合；其来源检查标为 `agent-source-check`，不冒充人类领域专家审查。

收录限于实际核读的段落；未列章节即使已经下载也不算完成阅读。教学例子不作为产品实测数据，机构出版审查不作为具体 LCA 结论的科学认证，软件结构验证也不证明原文蕴含或研究有效性。规范用语必须绑定实际版本；没有把指南转述当成已核验的 ISO 条款。

## 载体、版本和定位

| 阅读记录 | 取得身份 | 本轮限制 |
|---|---|---|
| `rd-cml-2001-part1` | [Part 1 机构 PDF](https://www.universiteitleiden.nl/binaries/content/assets/science/cml/publicaties_pdf/new-dutch-lca-guide/part1.pdf)，19 页；标题 May 2001，前言落款 July 2001 | 前置页和 Part 1 正文；不代表 Part 3 或 1992 原报告 |
| `rd-cml-2001-part2a` | [Part 2a PDF](https://www.universiteitleiden.nl/binaries/content/assets/science/cml/publicaties_pdf/new-dutch-lca-guide/part2a.pdf)，101 页 | 指定目的、功能、边界、数据质量与解释段落；非全册 |
| `rd-cml-2001-part2b` | [Operational annex PDF](https://www.universiteitleiden.nl/binaries/content/assets/science/cml/publicaties_pdf/new-dutch-lca-guide/part2b.pdf)，276 页 | 开头、单位表和数据质量矩阵开头；未核查全部因子表 |
| `rd-unep-1996` | [UN 原始扫描](https://digitallibrary.un.org/record/217945/files/unep_guide_to_lca.pdf)，first edition 1996；87 PDF 页，目录称 91 印刷页 | Part I 选段；扫描完整性尚未完成逐页审计 |
| `rd-epa-1991-draft` | [NEPIS 原始 HTML](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=93000MAW.TXT)；封面 March 1991 draft，目录元数据 issued 1990 | 只核读封面及 p5-55 项目页 |
| `rd-epa-1993` | [NEPIS 原始 HTML](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=30002QCX.TXT)；题名页 February 1993，目录元数据 issued 1992 | Abstract、Introduction 和 Overview 选段；无 PDF 图像核查 |
| `rd-epa-2006` | [NEPIS HTML](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P1000L86.TXT)及[原始 PDF](https://nepis.epa.gov/Exe/ZyPDF.cgi/P1000L86.PDF?Dockey=P1000L86.PDF)，88 页 | 两路选段合并；保留各载体与图像核验范围 |
| `rd-ilcd-2010` | [Detailed guidance PDF](https://eplca.jrc.ec.europa.eu/uploads/ILCD-Handbook-General-guide-for-LCA-DETAILED-GUIDANCE-12March2010-ISBN-fin-v1.0-EN.pdf)，417 页；first edition March 2010 | 指定版本、迭代、功能、边界、比较及解释概述；非全手册 |

`printedPages` 指原作印刷页码；`pdfIndices` 是取得 PDF 的 **零基索引**；`nepisBlocks` 是原始 HTML 中 preformatted 分页块的 **零基索引**，没有被称为 PDF 页。HTML 账本不设置实际 PDF `pageCount`；NEPIS 目录页数在局限中说明。三份 NEPIS HTML 的分页块数量比目录页数多一，末尾为空块，不能据此增算一页。UNEP 扫描的页码偏移不固定，禁止全书套用一个换算偏移。

已核验的页面图像为：CML Part 1 p8；UNEP p3、8、9、12、13、41；EPA 2006 p11；ILCD p25、64。CML Part 2a 截图未返回可检视图像，Part 2b 截图超时；这些失败没有被记作视觉复核。EPA 1991、1993 的弱 OCR 页码或依赖图形的结论，在直接引用或升级结论前仍需页面图像。其他协作交叉核对不扩大本条目所列的原始阅读范围。

## 检索式与发现链

检索工具为公开网页搜索和机构页面/文件访问。以下保留实际英文查询；没有以英语检索代表全球多语种覆盖。CML Part 1 的起点是已列入设计的官方 PDF。

```text
site.setac.org 2022 early books life cycle assessment books
site.unep.org 1996 Life Cycle Assessment what it is and how to do it
site.epa.gov 2006 Life Cycle Assessment Principles and Practice EPA/600/R-06/060
site.setac.org "Technical Framework" "pdf"
site.setac.org "Code of Practice" "pdf"
site.setac.org "Life-Cycle Assessment Data Quality" download
site.setac.org "A Conceptual Framework for Life-Cycle Impact Assessment"
"setac.org" "Technical-Framework"
"setac" "digitized" "life cycle" books
"Technical Framework for Life-Cycle Assessment" filetype:pdf site:setac.org
"SETAC" "LCA books" download
site:setac.org/resource/ "framework" "life" "1993"
site:setac.org/resource/ "Technical Framework for Life"
site:setac.org/resource/ "Life-Cycle Assessment" "Code" "1993"
site:setac.org/resource/ "Data Quality" "1994"
"Life Cycle Assessment Principles and Practice" site:epa.gov filetype:pdf
"A Technical Framework" site:setac.org/resource/
"A Conceptual Framework for Life-Cycle Impact" site:setac.org/resource/
site:universiteitleiden.nl "Environmental life cycle assessment of products" "1992" filetype:pdf
site:setac.org "technical-framework" "1994"
site:setac.org "A Technical Framework" "1994"
"A technical framework for life-cycle assessments" site:gov
"A technical framework for life-cycle assessments" site:edu
"A technical framework" "1990" site:setac.org
site.universiteitleiden.nl CML 2001 guide part 2a life cycle assessment download
site.eplca.jrc.ec.europa.eu ILCD Handbook General guide LCA detailed guidance 2010 pdf
site.epa.gov 2006 life cycle assessment principles and practice pdf
```

三条 SETAC resource 查询因输出截断而重复一次；重复请求不算新增资料覆盖。主要发现链如下。

1. [SETAC 2022 回顾](https://www.setac.org/resource/early-life-cycle-assessment-books-laid-the-foundation-for-modern-day-lca.html)提供四个原书名，再经 SETAC LCA 页面、机构资源库与题名检索定位原书目录。回顾只作发现和追踪对象。
2. UN 目录记录 217945 指向原始扫描。目录页面请求出现 403，但同一机构文件合法下载成功；下载重定向由服务器返回。目录页数和实际载体页数分开记录。
3. [Leiden 项目页](https://www.universiteitleiden.nl/en/research/research-projects/science/cml-new-dutch-lca-guide)链接 Part 2a/2b，说明与 2002 Handbook 的关系和非商业使用条件。没有把报告替换成尚未读到的出版书。
4. [JRC 指南入口](https://eplca.jrc.ec.europa.eu/reportGuidelines.html)与[JRC48157 记录](https://publications.jrc.ec.europa.eu/repository/handle/JRC48157)定位 ILCD 原文件。2011 年仓储记录日期和文件元数据没有被写成新版发行。
5. [EPA HERO 749231](https://hero.epa.gov/reference/749231/)核查 2006 报告身份，NEPIS 提供原文本。某些 PDF 请求返回 403，而另一条协作取得路径获得同 key 的公开 88 页 PDF；失败记录与成功载体同时保留。
6. 针对原框架题名的机构检索继续发现 EPA 1991 项目页和 EPA 1993 指南，分别检查同期项目说明和后继方法说明。未用搜索摘要冒充原文阅读。

## 未取得、排除和权限

[Technical Framework 目录](https://www.setac.org/resource/technical-framework-for-lca-pdf.html)、[LCIA Framework 目录](https://www.setac.org/resource/conceptual-framework-for-life-cycle-impact-assessment.html)、[Code of Practice 目录](https://www.setac.org/resource/guidelines-lca-code-practice-1993.html)和[Data Quality 目录](https://www.setac.org/resource/lca-data-quality.html)当前均要求登录。没有建立账户、使用凭证或绕过访问门槛，也没有取得原书页数、文件 hash 或可冒充精读的内容。2022 回顾中免费数字化的陈述不能代替当前访问和再利用许可。

两个在机构论文参考文献中发现的旧 SETAC CDN 文件链接均返回 403；没有猜测文件名继续获取受限原件。Google Books、零售书页、ResearchGate、百科、学位论文和非机构副本没有被用来证明原书内容或历史优先权。无关的 code-of-practice 搜索结果按主题不符排除。Cornell/NIST/NREL 等后继材料只留下追踪线索；[EPA 1995 LCIA 报告](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=00002TT8.TXT)未在本轮完成选段核读。未发现或未取得不等于不存在。

CML Part 2a/2b 的受保护载体通过机构公开网页文本核读；没有解密、改变权限或本地提取受保护正文。UNEP 版权页保留权利；EPA 机构仓储本身不证明承包作者和全部组成材料都是公有领域；ILCD 的再现许可仍有注明来源条件。原始 PDF、HTML、提取文本和页面图像均不进入本仓或公开导出。公开记录仅含原创释义、元数据、定位、缺口及编辑推理；本项目的内容许可不覆盖原作。

## 阅读后产生的编辑问题

实际原文迫使下一阶段分别处理框架组件、操作步骤、目标范围活动和不同第四阶段名称；这些内容的版本关系不能由通用框图先行决定。具体依据和反证定位见账本的 `rev-framework-version-history`，尚未把后继回顾升级为单一起源证明。

参考流的表达也须保留上下文。主任务交叉核对 CML Part 2a p22/PDF index21 与 ILCD p60/index79 后，新增 `psg-cml-2001-part2a-reference-representation` 和 `psg-ilcd-2010-reference-representation`。它们是既有阅读范围的细定位，不是两项新增独立研究。问题在于功能关联表述、产品导向表述和过程数据各自承担什么作用；没有预设只能用质量数量表示参考流，也没有因例子表述不同而宣布两体系矛盾。

八项修订建议均保留 `proposed` 状态，记录修改前的编辑设想、修改后的方向、触发段落和影响单元。它们包括把服务条件放在物品比较之前、在功能前提之后继续检查边界和数据，以及让解释章节允许不含排序的结论。它们不是对外部标准的修改，也不自动成为已审定正文。涉及指南间解释和科学结论的内容仍需各自范围的复核；最终正文逐条证据绑定由编辑任务另行完成。

Smugglers Notch 的年份问题保留为事件身份缺口：CML 的未具名首次会场事件、SETAC 当前有题名的会场目录和 EPA 同期技术框架项目页没有完全建立同一性。不同事件对象和出版日期不能混作一条“矛盾年份”；需原报告题名页、同期程序或会场材料进一步核验。Coca-Cola 1969、Smith 1963、术语最早出现、个人发明者和地域学派等断言也没有因本轮回顾阅读而获得优先权或因果证明。

## 续接门槛

下一轮由[账本缺口](../../knowledge/research/readings.json)选择明确问题：合法取得 SETAC 原书和 ISO 具体版本，完成关键图像/页码复核，补真实功能比较证据，并扩展原语种、地域和批评文献。先修复会改变当前陈述支持范围的缺口，再增加一般书目数量。后续取得和复核应更新具体阅读、段落与修订处置；原始文件的取得、选段阅读、领域审查和整章证据完成始终是不同状态。
