---
title: Part VII B29 Wall Service Comparison — Prewriting Protocol
docType: editorial-note
scope: book
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
lastReviewedAt: 2026-11-19
lastReviewedCommit: 8d498f48baf96865ef5e953d8b6a19136cd36ab9
---

# 第七部第二十九章《墙面服务比较》写作前方案（#157）

## 1. 基线与不可变边界

- 精确前序基线：`tiangong-lca/knowledge-base` `main` `8d498f48baf96865ef5e953d8b6a19136cd36ab9`（Git tree `a7021ebd43dd029a93d94a43df41864ee8f07ef8`，第六部整部连续回读 `#155` 完成态）。
- 严格冻结对象：
  - `content/docs/book/wall-service-to-comparison.mdx` 第 1—28 行、`22` 条既有 `CASE-WALL-CONNECT` 案例绑定论述（`cl-wall-*`）及 `<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />` 逐字节不变；
  - `knowledge/cases/wall-coating-v1.json` 及全仓 `40/40` 份公开案例下载文件逐字节不变；
  - 既有 `1,074` 条论述标识与全部前序章节不变；
  - `package.json`、`pnpm-lock.yaml` 与 `app/globals.css`（编译 CSS 零漂移 `be180e5d...`）不变；
  - [Programme #9](https://github.com/tiangong-lca/knowledge-base/issues/9) 全部 8 项全局未完成条件保持未勾选。

## 2. 核心科学问题与跨体系对照设计

既有第二十九章通过 `CASE-WALL-CONNECT` 完整演示了“相同涂覆质量反序 vs 相同十年墙面服务”“共享电网因子 $\theta$ 配对抵消”与“非负容差下粗糙基底反序”的算术机制，但尚未从单一教学案例上升到跨国际规范的比较断言与不确定性比较制度对照。本单元在保留原 22 条案例论述的基础上，于第 28 行与第 30 行末段过渡之间新增 `## 比较断言的规范边界 [#比较断言的规范边界]` 节、`6` 条非案例规范论述（`cl-wsc157-*`，全书 `1,074 -> 1,080` 条）及 `1` 张 5 列跨体系对照表：

1. **相同问题下的三条比较前提（`cl-wsc157-equivalence-and-pairing`）**：
   - 将 `CASE-WALL-CONNECT` 的“服务等价与共享背景 $\theta$ 配对”提升为跨体系共性规则：对照 **ILCD 2010**（§5.3 表 2 情景 A/B/C、§§6.10.3–6.10.7 边界对称与部分相关组件不得删去、合理最佳/最差情景与不确定度计算）与 **GHG Protocol 产品标准（2011）**（§10.3.4 印第 82 页禁止直接并排比较 $A$ 与 $B$ 的边缘不确定性区间，要求评估比较量本身如 $A/B$ 的分布）。
2. **配对抵消与过度蒙特卡洛伪显著性的双侧边界（`cl-wsc157-paired-vs-mc-fallacy`）**：
   - 承接第二十六章 `Heijungs (2020)`（§§2.8–4 印第 399–401 页）：未配对边缘区间重叠可能掩盖真实差异，而反过来在输入样本量仅 $n = 16$ 时强行运行 $N_{\text{run}} = 100{,}000$ 次蒙特卡洛抽样会把无显著差异的样本（$p = 0.67$）压成伪显著（$p \approx 10^{-16}$）；模拟次数须受最弱实证样本量约束（如 $n = 9$ 时 $N_{\text{run}} \le 9$），谱系分布不具备样本量 $n$。
3. **ILCD 2010 的公开比较断言禁权与非断言防绕过规则（`cl-wsc157-ilcd-comparative-assertion`）**：
   - 核验 **ILCD 2010** §5.2.5、§6.10.1–6.10.2 规定条款 I/VI、§8.4 规定条款 III 及 §6.11（印第 34–35、140–141、145–148、283–284 页）：对公众公开的比较断言不得仅凭清单（LCI）作出、**禁止使用加权**、且不得通过只发布并排图表而不写“更优”措辞来绕过规则（非断言比较研究同等适用）；背景数据须经比较断言预审或升格为外部评审组审查。
4. **欧盟 PEF（建议书 (EU) 2021/2279）的类别规则专属许可与 A—E 性能分级（`cl-wsc157-pef-pefcr-and-classes`）**：
   - 核验 **欧盟委员会建议书 (EU) 2021/2279**（明确并行标注 2022 年更正重刊版公报 OJ L 144 第 23–24、88、95–102、149 页与 2021 年原刊公报 OJ L 471 第 220、291–298、345 页）：仅当遵循有效品类类别规则（PEFCR）时方允许公开比较与比较断言；与 ILCD 禁止加权形成鲜明制度分歧，PEF 强制采用 16 项环境足迹类别的单一总分划分 A—E 五档性能等级（以代表产品基准 `BM` 为 C 档中点，按 `0.30` 与 `0.85` 线性插值划定 A/B 与 D/E 边界），并对全部对外传播强制实施第三方验证与确认（重大差错阈值 `> 5%`、核查员资质 `≥ 6` 分、有效期最长 `3` 年）。
5. **GHG Protocol 产品标准（2011）的不支持比较断言边界与付费 ISO 14044 缺口（`cl-wsc157-ghgp-and-paywalled-iso`）**：
   - 核验 **GHG Protocol 产品标准（2011）** §1.5、§5.3.2、§13.2 及附录 A 表 A.1–A.2（印第 6、23–24、101、115–116 页）：本标准“按原样”仅支持同一产品跨期减排追踪，**明确不支持产品间总体环境优劣比较断言**，跨产品比较须另依产品规则并满足等同分析单元、边界、分配与第三方鉴证要求；同时声明 `ISO 14044:2006` 付费全文未持有，不臆造其内部条款编号，登记为开放缺口 `lit-gap-wsc157-paywalled-iso14044-comparative-assertion`。
6. **从墙面算例到全书比较判断的方法收束与向第三十章过渡（`cl-wsc157-comparison-synthesis-bridge`）**：
   - 综合前五条说明“算术配对成立”与“公开比较合法”属于两层不同资格，衔接第三十章《购物袋研究》对真实已发表研究与评审边界的检验。

## 3. 一手文献与数值核验清单（全部已 SHA-256 核验）

| 标识 | 一手来源 | SHA-256 | 关键定位与核验数值 |
| --- | --- | --- | --- |
| `src-wsc157-ilcd-2010` | ILCD Handbook (2010, EUR 24708 EN, 417 pp.) | `7de4b912...` | §5.2.5、§5.3 表 2、§§6.10.1–6.11、§8.4 规定条款 III（印第 34–35、38–39、140–148、283–284 页） |
| `src-wsc157-eu-2021-2279-pef` | Commission Recommendation (EU) 2021/2279 (OJ L 144 384 pp. / OJ L 471 396 pp.) | `42445138...` / `af28de08...` | 附件一第 1、1.1、5.2.1–5.2.2、8.1–8.5 节与附件二表 NN-9（`16` 类别、`5` 等级、`0.30`、`0.85`、`5%`、`6` 分、`3` 年） |
| `src-wsc157-ghgp-2011` | GHG Protocol Product Standard (WRI/WBCSD, 2011, 148 pp.) | `fdc21b79...` | §1.5、§5.3.2、§10.3.4、§13.2、附录 A 表 A.1–A.2（印第 6、23–24、82、101、115–116 页） |
| `src-wsc157-heijungs-2020` | Heijungs (2020), *IJLCA* 25:394–402 (9 pp.) | `422cb7f6...` | §§2.8–4、图 2（印第 399–401 页：`n = 16`、`p = 0.67`、`N_run = 100,000`、`n = 9`） |
| `lit-gap-wsc157-paywalled-iso14044-comparative-assertion` | ISO 14044:2006 付费全文缺口 | — | 显式声明付费版权边界，不臆造条款号 |

## 4. 质量与验证门禁

- 安装可逆继任守卫 `scripts/reader-wall-service-comparison.mjs` 与 `scripts/reader-wall-service-comparison-factors.mjs`（`BigInt` 精确核验全部定量阈值），精确回滚至 `8d498f48baf96865ef5e953d8b6a19136cd36ab9`。
- 通过三路独立审查（一手来源与数值、零上下文全章 `B29` 读者审读、出版工程与安全审计）无条件 `0 BLOCKER / 0 MAJOR / 0 MINOR — PASS`，Playwright 响应式/打印 QA、全量测试、CSS 零漂移、干净生产构建、严格 Docpact、线上 468 文件核验与根集成。
