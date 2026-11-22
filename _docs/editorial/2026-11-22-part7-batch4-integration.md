# 第七部（Batch 4：B29–B32）整合改写记录

- **跟踪任务**：`tiangong-lca/knowledge-base#214`（总纲 `#9`）
- **修订批次**：`part7-batch4-214`
- **基线提交**：`e50170fc47b1a7ae82ae9997d61dd9a04c2bfff1`（`knowledge-base` `main`）
- **覆盖章节**：
  - `content/docs/book/wall-service-to-comparison.mdx`（B29《墙面服务比较》）
  - `content/docs/book/interpretation-and-limits.mdx`（B30《购物袋研究》）
  - `content/docs/book/future-technology-and-context.mdx`（B31《未来技术与情景》）
  - `content/docs/book/connecting-objects-references-and-time.mdx`（B32a《服务、系统与时间》）
  - `content/docs/book/from-connected-results-to-conditional-judgment.mdx`（B32b《判断依据与修订》）
  - `content/monograph/revisable-judgment.mdx`（B32 专论《可修订的判断》）

## 改写原则与边界

1. 按 `goal §2.16` 将 12 段超过 420 字的追加比较长段压实至 440 字以内，清除正文与注释中的草稿章号残留并统一改为正式篇名，为既有比较表补齐清晰表题。
2. 保留全部 32 条 `caseBinding: true` 教学案例绑定命题、`knowledge/cases/*` 原始案例文件与 `package.json` 零改动。
3. 保留全部既有 H2 标题与锚点、文献引用连续性、前置命题拓扑顺序及既有方法学口径边界。
4. 全部修订痕迹通过 `config/revisions/part7-batch4-214.json` 登记，公开变更日志不暴露内部命题编号。
