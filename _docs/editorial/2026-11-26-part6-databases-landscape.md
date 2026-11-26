---
title: Part VI Background Databases & Interoperability — Chapter 26 Pre-Writing Protocol
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or auditing Part VI Chapter 26 (Background Database Landscape and History) and the 7-to-8 Part expansion
whenToUpdate:
  - when Chapter 26 scope, primary-source registry, or 8-Part structural boundaries change
checkPaths:
  - content/docs/book/lca-database-landscape-and-history.mdx
  - content-en/docs/book/lca-database-landscape-and-history.mdx
  - config/reader-numbering.json
  - config/book-edition.json
  - _docs/editorial/2026-11-26-part6-databases-landscape.md
lastReviewedAt: 2026-11-26
lastReviewedCommit: 6bfc063d13460e623d049866078ad9dd23a0ec7f
related:
  - ../reader-publication-contract.md
  - concept-led-comparison.md
  - readable-writing-and-teaching.md
  - en/readable-writing-and-teaching.md
---

# 第六部《背景数据库与互操作》架构扩编与第 26 章《背景数据库的发展历程与全谱系版图》写前协议

## 1. 授权与结构决策（方案 A）

依据用户 2026-11-26 在 Programme `#9` 下的明确授权（方案 A：“所有的数据库都要仔细写清楚”），全书由七部 32 章扩编为**八部**：

- 第一部至第五部（第 1–25 章）保持原有逻辑与地址不变；
- 新增**第六部《背景数据库与互操作》**（`Part VI · Background Databases and Interoperability`），规划五章（第 26–30 章），本单元率先交付架构扩编与首章第 26 章《背景数据库的发展历程与全谱系版图》（`/docs/book/lca-database-landscape-and-history`，全书先由 32 章增至 33 章，随后续四章逐章递进至 37 章）；
- 原第六部《数据与证据》顺延为**第七部《数据与证据》**，原第七部《比较与判断》顺延为**第八部《比较与判断》**；既有全部网址（`/zh/docs/book/**`、`/en/docs/book/**`）、旧注释锚点、242 条案例绑定论述与 40 份案例文件逐字节不变。

## 2. 概念依赖位置

读者在前五部已依次掌握过程网络、基本流与交换（第二部）、共产品分配与后果系统模型（第三部）、环境影响路径与空间/时间/区室要求（第四部）、本地化与多准则/社会/成本边界（第五部）。由此进入第六部剖析背景数据库的演进脉络、底层方法分歧、基本流与过程流为何无法无损映射及交换格式治理，再自然衔接第七部《数据与证据》的数据适用性、不确定性与产品足迹法规，全书概念依赖单调递增。

## 3. 第 26 章内容结构（4 节 + 1 张全景对照表）

1. **从手工清单表到链接数据库** (`#从手工清单表到链接数据库`)：梳理 1970 年代 MRI/Franklin/Boustead 手工清单、1990 年代 BUWAL 132/250 与 ETH-ESU 96、2000 年代 ecoinvent v1–v2 / GaBi / ELCD / USLCI / IDEA / CLCD、2010 年代 ecoinvent v3 链接架构 / EF 2.0–3.1 / 农业食品专库与 MRIO、以及 2020 年代 GLAD / Federal LCA Commons / BONSAI / 天工 TIDAS 等互操作与开放规范演进。
2. **综合通用商业与半公开数据库** (`#综合通用商业与半公开数据库`)：深度对比 ecoinvent（v1–v3.11 透明单元过程与多系统模型）、Sphera Managed LCA Content（原 GaBi，工程建模与 DEKRA 第三方核查、闭源许可边界）、欧盟 EF 3.0/3.1 参考包与次级数据（PEF/OEF 制度绑定）及已停更的 ELCD（2018 年 6 月 29 日停服）。
3. **国家与区域公共生命周期清单库** (`#国家与区域公共生命周期清单库`)：逐一厘清美国 USLCI 与 Federal LCA Commons、日本 IDEA（AIST 混合过程—投入产出框架）、中国 CLCD（亿科/四川大学）与天工公开数据规范（TIDAS）、法国 Agribalyse（ADEME/INRAE 从农场到餐桌）、澳大利亚 AusLCI（ALCAS）、巴西 SICV（IBICT）及马来西亚 MY-LCID（SIRIM）的制度定位、开放程度与背景依赖。
4. **行业专属、农业食品、投入产出与社会数据库** (`#行业专属农业食品投入产出与社会数据库`)：系统对比行业协会清单（PlasticsEurope Eco-profiles、worldsteel LCI、国际铝业协会 IAI）、农业食品与化工专库（Agri-footprint、World Food LCA Database、Carbon Minds `cm.chemicals`）、多区域投入产出库（EXIOBASE 3、USEEIO v2.0、Eora、GLORIA）及社会 LCA 库（PSILCA、SHDB），并给出覆盖全部 16 类主要代表数据库的全景对照表，明确区分公开文献已核对事实与闭源/付费库内部未直接检视边界。

## 4. 认识论与公开交付边界

- 所有新增论述严格区分：开放获取期刊论文与官方公开文档已核对的架构事实 vs. 商业闭源数据库（Sphera MLC、Agri-footprint、Carbon Minds、CLCD、IDEA 商业发行版）受许可限制未直接逐行检视的内部过程表。
- 严格遵守 Goal §2.15 洁净公开交付与 §2.16 整合修订规则，中英文双语同步交付（`enStatus: "published"`，零未翻译汉字泄漏，零过程元语言），并通过 `config/revisions/` 声明式修订与三路独立审稿。
