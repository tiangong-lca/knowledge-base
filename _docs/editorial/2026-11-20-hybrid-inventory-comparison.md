---
title: B09《混合清单》跨体系比较前置写作协议
docType: editorial-plan
scope: book
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - 在修订 B09《混合清单》增加清单完备性、截断规则与混合边界跨体系比较之前核对范围、原件与防线
whenToUpdate:
  - 仅在本单元范围、原件清单或边界约束发生实质调整时更新
lastReviewedAt: 2026-11-20
lastReviewedCommit: 744b371af100522b0d0f51e41adaa82eb8943d30
---

# B09《混合清单》跨体系比较前置写作协议（Unit 29 / Issue #175）

## 1. 单元目标与基线

- **源基线**：`knowledge-base` `main` `744b371af100522b0d0f51e41adaa82eb8943d30`（`1,112` 条论述，`120` 个正章 H2，`40/40` 案例下载）。
- **目标章节**：`B09`《混合清单》（`content/docs/book/inventory-boundary-and-hybrid.mdx`，路由 `/docs/book/inventory-boundary-and-hybrid`）。
- **核心问题**：围绕**完备性（100% 总量不可知）、截断阈值、资本品与采购服务边界、EEIO/混合补缺准入、重复计算防控以及价格/部门聚合/分母换算误差**，跨体系比较四套主流过程标准/数据库与正式混合清单方法：
  1. **ILCD Handbook（2010）** `§6.6.2–6.6.3` 与 `Provisions 6.6`（`rd-ilcd-2010`，`pdfIndices` `[121, 122, 123, 124, 125]`）；
  2. **欧盟 PEF（(EU) 2021/2279 OJ L 471）** 附件一 `§4.1`、`§4.4.4`、`§4.6.3–4.6.4`（`rd-kb44-ec2021`，`art-kb44-ec2021-original-pdf`，`pdfIndices` `[33, 47, 76]`）；
  3. **GHG Protocol 产品标准（2011）** `第 7 章` 与 `§8.3.4 / 框 8.2`（`rd-pfr151-ghgp-2011`，`pdfIndices` `[35, 36, 37, 52, 53]`）；
  4. **ecoinvent v3 数据质量导则（2013）** `§4.11`、`§5.10`、`§6.1–6.4`（`rd-dapp147-ecoinvent-v3-2013`，`pdfIndices` `[33, 50, 51, 52, 53, 54]`）；
  5. **正式混合清单框架**（沿用本章已精读登记的 `Suh 2004`、`Agez et al. 2019/2020`、`Yang et al. 2017`、`Pomponi & Lenzen 2018`、`Jakobs et al. 2021` 与 `CASE-HYBRID-OVERLAP`）。

## 2. 硬边界与守恒约束

1. **零新增 H2**：`B09` 保持原 3 个 H2（`#过程经济边界`、`#双向账户`、`#误差来源`），全书正章 H2 保持 `120` 上限。
2. **既有内容与旧注 100% 守恒**：不修改全书既有 `1,112` 条论述、`0` 处 `caseBinding` 修改、`40/40` 案例下载不变；新论述与 5 行对照表严格追加在 `## 误差来源 [#误差来源]` 末尾 `cl-inv-judgement`（注 39）之后（注 40–45），确保 `config/readable-book-current.json` 中全部 23 项指向 `B09` 注 1–39 的旧注提示零漂移。
3. **新增论述结构（6 条 `synthesis` + 1 张 5 行对照表）**：
   - `cl-hyb175-shared-completeness-dilemma`（注 40）：跨体系共同面对的“100% 不可知”完备性困境；
   - `cl-hyb175-process-standards-cutoff-and-capital`（注 41）：四套过程标准/数据库在截断阈值、资本品与采购服务边界上的分工；
   - `cl-hyb175-eeio-admission-and-hybrid-architectures`（注 42）：EEIO 准入边界与三类混合架构的制度落差；
   - `cl-hyb175-double-counting-governance`（注 43）：重复计算防控在规则声明与算法扣除之间的差异；
   - `cl-hyb175-price-aggregation-and-denominator-comparability`（注 44）：价格换算、部门聚合与分母口径对跨体系可比性的门槛；
   - 5 行×5 列紧凑对照表（紧接注 44 之后）；
   - `cl-hyb175-epistemic-limits`（注 45，置于对照表后）：跨体系比较的认识论边界与未知声明。
4. **洁净公开交付（Goal §2.15）**：默认构建 `/docs/book/**` 与 `/print/` 零开发过程控件，所有迭代与元数据自动聚合于 `/changes/`，编译 CSS 保持零漂移（`7f71d0b6...`），同时直接核验 `qualifyScientificHistory`。
5. **明确非范围**：`cl-hyb-service` 的跨章前提排序清理、注 39 过渡句润色均留待后续“第二部整部连续回读”统一处理；本单元不修改 `package.json`、`pnpm-lock.yaml` 或 `Programme #9` 全局勾选。
