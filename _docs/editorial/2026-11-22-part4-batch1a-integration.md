---
title: Batch 1A Integrated Revision Protocol (B16, B18, B19)
docType: note
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh
---

# Batch 1A 整合改写记录（B16、B18、B19）

- **关联任务**：`tiangong-lca/knowledge-base#200`（隶属全书总计划 `tiangong-lca/knowledge-base#9`）
- **修订标识**：`part4-batch1a-200`
- **修订日期**：2026-11-22
- **适用原则**：`_docs/lca-book-goal.md` 第 2.15 节（清洁公开发布）与第 2.16 节（整合改写优先于追加）

## 1. 章节范围与硬约束

| 章节 | 文件路径 | 原段落数 | 修订后段落数 | 新增对照表 | 受保护 `caseBinding` 段落（零修改） |
| --- | --- | --- | --- | --- | --- |
| B16《酸化与营养富集》 | `content/docs/book/acidification-and-nutrient-pathways.mdx` | 38 | 37（改写 14、退役 1） | 3 张 | `cl-path-operation`、`cl-path-operation-indicator` |
| B18《耗水与缺水潜势》 | `content/docs/book/water-scarcity-and-reference.mdx` | 28 | 28（改写 8） | 3 张 | `cl-water-opening`、`cl-water-case-input`、`cl-water-case-factors`、`cl-water-case-result`、`cl-water-case-locality`、`cl-water-case-averaging`、`cl-water-case-weighted-factor`、`cl-water-conclusion` |
| B19《毒性路径》 | `content/docs/book/usetox-pathways-and-boundaries.mdx` | 20 | 20（改写 8） | 3 张 | 无 |

## 2. 关键整合处置

- **B16**：保留既有 4 个 H2 与锚点及 2 个算例绑定段落；将原 800–1200 字的富营养化与光化学臭氧追加长段压缩为 320–420 字连贯论述，引入 3 张结构对照表（富营养化体系架构、农田 2 kg 总磷界面对照、光化学臭氧体系与前体权重），将 XML 细目与源内排版异文收入对应注释限定；退役重复收束段 `cl-eutro129-operational-synthesis`，其五步核查要点并入章末 `cl-path-multiple-paths`。
- **B18**：保留全部 8 个算例绑定段落与 7 个跨章/概念引用段落；将原 860–1874 字的耗水跨体系与附表损坏长段压缩为 370–420 字，引入 3 张对照表（水资源影响架构、ReCiPe 2016 终点参数与门槛、代表性国家 1 m³ 耗水排序对照），保留 RIVM 2016-0104 附表 S6.2 F–Z 区段排版损坏警示，并将五组源内异文完整细目收入注释限定。
- **B19**：保留全部 3 个跨章/概念引用段落；将原 758–1540 字的毒性体系、金属重排、视角开关与压缩包双目录差异长段压缩为 340–410 字，引入 3 张对照表（毒性体系架构、EF 3.0/3.1 淡水金属重排、1,4-二氯苯与镍非致癌对照），保留 EF 3.1 压缩包双目录差异与制度性零值警示，并将全部四组源内异文细目收入注释限定。
