# 第六部（Batch 3：B25–B28）整合改写记录

- **跟踪任务**：`tiangong-lca/knowledge-base#211`（总纲 `#9`）
- **修订批次**：`part6-batch3-211`
- **基线提交**：`8add4bd9397971bc0138bcf2bd210cee419e6c62`（`knowledge-base` `main`）
- **覆盖章节**：
  - `content/docs/book/database-fitness-and-documentation.mdx`（B25a）
  - `content/docs/book/review-support-and-version-boundaries.mdx`（B25b）
  - `content/monograph/data-applicability.mdx`（B25 合订本）
  - `content/docs/book/uncertainty-and-variability.mdx`（B26）
  - `content/docs/book/data-quality-and-probability.mdx`（B27）
  - `content/docs/book/product-footprint-rules-and-practice.mdx`（B28）

## 改写原则与边界

1. 按 `goal §2.16` 将 2026-11-16 至 20 期间追加的跨体系方法比较长段落压紧重构，消除超长段墙与过渡接缝，并为既有比较表格补齐清晰表题。
2. 保留全部 24 条 `caseBinding: true` 教学案例绑定命题、`knowledge/cases/*` 原始案例文件与 `package.json` 零改动。
3. 保留全部既有 H2 标题与锚点、文献引用连续性、前置命题拓扑顺序及既有方法学口径边界。
4. 全部修订痕迹通过 `config/revisions/part6-batch3-211.json` 登记，公开变更日志不暴露内部命题编号。
