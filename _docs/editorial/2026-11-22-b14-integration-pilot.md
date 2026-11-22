---
title: B14 整合改写试点（任务 #191）
docType: editorial-record
scope: knowledge-base
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when executing, reviewing or extending the B14 integration pilot
  - when applying goal §2.16 to another chapter after the pilot
whenToUpdate:
  - when the B14 rewrite scope, dispositions or review results change
checkPaths:
  - _docs/editorial/2026-11-22-b14-integration-pilot.md
lastReviewedAt: 2026-11-22
lastReviewedCommit: bb6ab1a0dc38fc70155714793381bbed46890af4
related:
  - ../lca-book-goal.md
  - readable-writing-and-teaching.md
  - concept-led-comparison.md
  - 2026-11-15-comparative-continuation.md
  - ../runbooks/post-checkpoint-revisions.md
---

# B14《中点与终点》整合改写试点

## 1. 为什么从这一章开始

2026-11-15 至 11-17，四个单元先后把用地（`#111`）、矿产（`#115`）、化石能源（`#117`）、平流层臭氧与电离辐射（`#121`）的比较写进本章。每个单元都把材料切成三片，分别接在三节的末尾。于是全章 42 段读起来像四篇小文交替出现：话题之间靠“回到矿产”“下文继续沿着同一准则转向……”之类的过渡硬接；8 段超过 800 字，主要是因子与表号清单；两段话题总结（`cl-ozrad121-emission-bridge`、`cl-fossil117-bridge`）只收束各自话题，没有回到本章的核心问题。

本章的研究材料与出处已较充分，缺的是成文整合。作为目标第 2.16 节与 `#192` 检查点／退役机制落成后的首个试点，本章改写完成后先交用户审阅，再推广到其余 26 个被追加内容的章节文件。

## 2. 本章的问题与拟交付的判断

**核心问题：** 一个影响指标停在因果路径的哪里？向后多算一层，是加入了新的模型关系、按模型约定线性缩放已有估计，还是换了一个问题？

**拟交付的判断：** 四种清单起点给出四种不同情形：

1. **排入平流层和环境的物质（臭氧耗竭与电离辐射）**：中点停在物理化学负荷或集体剂量，算到健康终点须新增疾病关系与低剂量外推；ILCD 2011 因此不正式推荐两者的健康终点，EF 3.1 与 ReCiPe 2016 均未设生态终点。
2. **土地使用**：恢复期已在中点计入；ReCiPe 2016 转到终点只乘一个固定正常数，同类别内次序不变。
3. **矿产开采**：从地质存量耗竭（ADP）转向未来矿石需求（SOP），再到逐金属拟合的未来额外采选费用，换指标即换问题，同质量输入也会给出不同排序；公共费用倍率只传递 SOP 次序。
4. **化石能源开采**：中点本身就在稀缺（ADP）与等热量（EF、ReCiPe）之间分叉，类别边界（天然铀归属）也不同；终点则按各燃料独立拟合费用曲线与缺资料代理，等中点不再对应等终点。

时间窗、资源上限、排放去向与地点决定结果的覆盖范围；方法文字、印出的公式与机读数据包须分开核对。

## 3. 结构

保留三节及其锚点：`#指标停在因果路径的哪里`、`#时间证据和地点怎样进入结果`、`#模型输入数据与因子发行包`。不新增二级标题，全书仍为 120 节。新增 3 张对照表（表 1 能量载体与铀口径对照、表 2 臭氧耗竭中点因子、表 3 电离辐射中点因子），避免在表号中写死章次（兼顾 32 章书稿第 14 章与 37 篇网站第 16 篇）。

## 4. 论述处置表（原 42 条 → 现 36 条：33 保留/改写，9 退役并入，3 新增）

| 原 ID | 处置 | 去向与理由 |
| --- | --- | --- |
| `cl-lcia-midpoint-pathway` | 改写 | 专注排放路径的中点与终点含义，移除末尾的预告式过渡 |
| `cl-lcia-endpoint-units` | 保留 | — |
| `cl-lcia-mid-end-conversion-limits` | 改写 | 对齐化石无常数因子的原因（各燃料独立费用曲线且完整路径认识不足），引出四类清单起点 |
| `cl-ozrad121-emission-midpoint` | 改写 | 首次展开 ILCD 2011 与 EF 3.1，保留 Dreicer 等 1995、ODP 定义、ILCD 推荐等级、健康终点未推荐与生态终点缺口 |
| `cl-land111-episode` | 退役 → `cl-land111-midpoint` | 同述一次使用—恢复的量义与中点处理，合为一段；保留“可以已经”与清单编码核对限定 |
| `cl-land111-midpoint` | 改写 | 承接 `cl-land111-episode` 并入内容 |
| `cl-land111-conversion` | 改写 | 明确线性缩放而非物理单位换算，消除同段张力 |
| `cl-mineral115-input` | 退役 → `cl-mineral115-adp` | 等质量脉冲设定合入 ADP 段开头 |
| `cl-mineral115-adp` | 改写 | 承接 `cl-mineral115-input` 并入内容，保留英文全称与给定存量/开采记录限定 |
| `cl-mineral115-sop` | 改写 | 保留英文全称与模型换题要点 |
| `cl-mineral115-rank` | 改写，前移至第一节 | 紧接 ADP/SOP 定义展示排序反转；加简短括号说明最终可采资源情景，前提仅依赖第一节前置论述（0 前向前提） |
| `cl-fossil117-scarcity-energy` | 改写 | 理顺 ILCD 稀缺路线与 Van Oers 2002 / EF 拆分路线，保留储量基 ADP 单位与指标名对照 |
| `cl-fossil117-heating-basis` | 改写 | 热值明细移入表 1，正文突出高低位口径与舍入条件 |
| `cl-fossil117-uranium-boundary` | 改写 | 保留 JRC 关于原 ADP 按 kg 给铀因子的记载及 Van Oers 2020 铀累计 ADP（7.8×10⁻³ 舍入注记） |
| `cl-lcia-scenarios-are-choices` | 改写 | 一次性交代个人主义（短期）、等级主义（默认基准）、平等主义（长期预防）三视角与情景的对应关系 |
| `cl-lcia-global-is-not-site-specific` | 保留 | — |
| `cl-ozrad121-odp-horizons` | 改写，拆分 | 卤代烃时间窗与次序反转留在本 ID，因子汇总为表 2 |
| `cl-ozrad121-n2o-scope` | 新增 | 承接原 `cl-ozrad121-reference-scope` 氧化亚氮段落与 `cl-ozrad121-odp-horizons` 后半（WMO 版本与甲/乙对照、Halon-1301/2402 反转） |
| `cl-ozrad121-reference-scope` | 改写，移至第二节 | 明确 14/11 仅在共享 Frischknecht 2000 且未重算迁移暴露的条目上成立，说明排放去向差异（含 ReCiPe 铯-137 三介质值写入注释限定） |
| `cl-ozrad121-ir-horizons` | 改写 | 因子汇总为表 3（纯 kBq U-235 当量列，不混单位），保留碳-14/铯-137 反转、碘-129 折算对照、表 4.2 脚注 a 覆盖缺口与 EF 3.1 水体锶-90 1.93×10⁻⁴ |
| `cl-ozrad121-endpoint-choices` | 改写，拆分 | 保留 DALY 系数、ILCD 2011 第 3.2.7 节批评 ReCiPe 2008、0.05/0.12/0.01 例/man·Sv 与 57/61 DALY |
| `cl-ozrad121-endpoint-limits` | 新增 | 承接原 `cl-ozrad121-endpoint-choices` 后半（跨视角比较与空间限制） |
| `cl-land111-pathway` | 退役 → `cl-land111-horizon` | LC-IMPACT 指标身份与百年窗口合为一段，保留 PDF·yr 不预测已灭绝物种重现 |
| `cl-land111-horizon` | 改写 | 承接 `cl-land111-pathway`，保留不截短占用清单与 100 年内全含限定 |
| `cl-land111-factor-scale` | 退役 → `cl-land111-integral` | 分层设定合入积分与反算检查段 |
| `cl-land111-countercheck` | 退役 → `cl-land111-integral` | T = 2H 反算检查合入积分段 |
| `cl-land111-integral` | 改写 | 承接 `cl-land111-factor-scale` 与 `cl-land111-countercheck`，保留不推出任意 H 官方因子与 c=0 边界限定 |
| `cl-land111-aggregation` | 改写 | 明确“放宽 c ≥ 0 假定”消除与上段冲突，加 LC-IMPACT 文档表 11.1 前缀 |
| `cl-mineral115-reserves` | 改写 | 删去“回到矿产”过渡，明确个人主义经济储量与另两视角最终可采资源量 |
| `cl-fossil117-scenario-proxy` | 改写 | 统一加“ReCiPe 原报告”前缀 |
| `cl-lcia-model-data-factor-separation` | 改写，移为第三节首段 | 作为模型—资料—因子三层框架开篇，移除章末过渡 |
| `cl-fossil117-equal-midpoint` | 改写 | 保留完整数值与单位，加 ReCiPe 原报告表 13.1/13.2 前缀 |
| `cl-fossil117-proxy-consequence` | 改写 | 保留“未来额外开采成本代理”与气候章节交叉说明 |
| `cl-mineral115-cost-proxy` | 改写 | 回指第一节固定倍率结论，保留 USD2013 币值年与模型选择说明 |
| `cl-mineral115-metal-cost` | 改写 | 小幅压缩，保留 Vieira 2016 完整数值与多因共变限定 |
| `cl-mineral115-calibration` | 改写 | 去掉自辩口吻，统一“经济储量情景（个人主义）”名称 |
| `cl-mineral115-assumptions` | 保留 | — |
| `cl-land111-printed-record` | 退役 → `cl-ozrad121-formula-table` | 同属原报告印表与公式不合，合入统一段落 |
| `cl-fossil117-printed-limits` | 退役 → `cl-ozrad121-formula-table` | 同上；保留“在未取得未刊原稿前不能猜定换算系数”限定，细部误引移入注释限定 |
| `cl-ozrad121-formula-table` | 改写 | 承接三例印表与公式不合（明确 S7.3 两行互换至显示精度、明确印式吻合范围仅限全部卤代烃），其余版式异文与复算明细写入注释限定 |
| `cl-ozrad121-package-discrepancies` | 改写 | 修正甲基溴为“漏掉 1 个子区室（平流层下部与对流层上部）”，保留报告内部不一致，UUID/CAS/归一化基准 `5.36×10⁻²→5.23×10⁻²` /同义词细节写入注释限定 |
| `cl-mineral115-judgment` | 改写 | 保留“矿产质量变化”原词与“模型与适用条件”限定，聚焦学界真实分歧 |
| `cl-ozrad121-emission-bridge` | 退役 → `cl-b14-reading-checks` | 与化石总结整合为全章四项核对收束段 |
| `cl-fossil117-bridge` | 退役 → `cl-b14-reading-checks` | 同上 |
| `cl-b14-reading-checks` | 新增 | 收束全章四项核对（含 N₂O 结构断层与一氯甲烷跨类计分），承接下一章气候响应 |

## 5. 不变边界与审查要求

- 外部消费者引用的 `cl-lcia-endpoint-units`、`cl-lcia-model-data-factor-separation` 以及概念定义论述 `cl-lcia-midpoint-pathway`、`cl-lcia-mid-end-conversion-limits` 均保留原 ID。
- 本章无 `caseBinding: true` 论述，全仓 40 份案例下载零改动。
- 所有 9 条退役论述通过 `config/revisions/b14-integration-191.json` 登记精确 `index`、`from` 与 `successor`，旧网页与 `/print` 注释锚点自动改指继任注释并在 `/changes/` 公开列出。
- 完成后由新上下文独立读者重读整章、独立来源审计复核，通过全部工程校验后提交 PR 交用户审阅。
