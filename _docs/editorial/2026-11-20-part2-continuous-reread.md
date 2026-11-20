---
title: 第二部《服务与清单》整部连续回读前置写作协议
docType: editorial-plan
scope: book
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - 在执行第二部《服务与清单》（B06–B09）整部连续回读与跨章衔接修订前核对范围、守恒与防线
whenToUpdate:
  - 仅在本单元范围或修订清单发生实质调整时更新
lastReviewedAt: 2026-11-20
lastReviewedCommit: 3034503fadf4353e3e58b01f32c74886bfbe6c92
---

# 第二部《服务与清单》整部连续回读前置写作协议（Unit 30 / Issue #177）

## 1. 单元目标与基线

- **源基线**：`knowledge-base` `main` `3034503fadf4353e3e58b01f32c74886bfbe6c92`（`1,118` 条论述，`120` 个正章 H2，`40/40` 案例下载）。
- **覆盖范围**：第二部《服务与清单》（`B06`《功能参照》、`B07`《过程网络》、`B08`《流、交换与边界》、`B09`《混合清单》）以及 `config/reader-numbering.json` 的 `parts[1].introduction` 与 `content/docs/book/index.mdx`（`F02`）第 16 行第二部概述段。
- **核心任务**：收口第二部四章的跨章衔接、术语一致、非 `caseBinding` 前提 DAG 严格升序与部级导语更新，使第二部整体形成连续、自然、可独立成部的中文学术论述。

## 2. 精确修订清单

1. **部级导语（`config/reader-numbering.json` `parts[1].introduction`）**：更新第二部导语，完整覆盖四章主线（功能参照与四体系规则比较、线性过程网络配平与反例、流与交换边界及零/缺项分辨、过程截断与混合清单五体系对照）并自然引入第三部《负担分配与供给变化》。
2. **全书目录总览（`content/docs/book/index.mdx` 第 16 行，`part4-133-ordinary-3`）**：原段内更新第二部概述，补齐全部四章链接（`功能参照`、`过程网络`、`流、交换与边界`、`混合清单`）与跨体系比较深度；**严禁拆段**，确保 `part4-133-ordinary-0..9` 索引零偏移。
3. **非 `caseBinding` 论述、术语与过渡修订（`knowledge/catalog.json`）**：
   - `B06`：`cl-book-service-contract`（`caveats[0]`）与 `cl-book-comparison-more`（`scope`）中 `比较性断言` → `比较断言`；`cl-book-three-comparisons`（注 17）末句平滑衔接至注 18（`cl-fr173-shared-core`）；`cl-fr173-epistemic-limits`（注 23）末尾补充通向 `B07`《过程网络》的过渡句。
   - `B08`：`cl-flow-type`（注 8）与 `cl-native-opening`（注 15 `evidenceLinks[2].rationale`）中 `基础流` → `基本流`（保留注 2 `cl-flow99-elementary` 对不可变 `caseBinding` 注 37 的称呼说明）；`cl-flow99-zero-placeholder`（注 67）纯英文 `scope` 本地化为中文并保留原标识；`cl-native-service-meaning`（注 77）移除位于注 78 之前的过早 `下一章` 过渡句。
   - `B09`：`cl-inv-judgement`（注 39）中提前出现的 `下一部……` 替换为衔接注 40–45 跨体系比较的过渡句，并将通向第三部《负担分配与供给变化》的部级过渡移至注 45（`cl-hyb175-epistemic-limits`）末尾。
4. **第二部 15 条非 `caseBinding` 论述的前提 DAG 清理（`knowledge/catalog.json`）**：移除前向引用与跨章前向引用并按书内先后严格升序排列（覆盖 `B06` 3 条、`B07` 4 条、`B08` 7 条、`B09` 1 条），全部 50 条第二部 `caseBinding` 论述 100% 保持字节不变。

## 3. 硬边界与守恒约束

- `0` 新增 H2（全书正章 H2 保持 `120` 上限），`0` 新增或删除论述（全书保持 `1,118` 条论述）。
- `0` 处 `caseBinding` 修改，`40/40` 案例下载不变，全部历史旧注提示零漂移。
- 严格执行 Goal §2.15 洁净公开交付（`/docs/book/**` 与 `/print/` 零开发过程控件，全部具名更正与部级导语更新自动聚合于 `/changes/`，编译 CSS 保持零漂移 `7f71d0b6...`，并直接核验 `qualifyScientificHistory`）。
- 明确非范围：第一部比较单元与整部回读、全书终读、`Programme #9` 八项全局勾选及 `package.json` / `pnpm-lock.yaml`。
