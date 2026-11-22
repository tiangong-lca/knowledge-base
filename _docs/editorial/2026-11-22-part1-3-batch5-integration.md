# 第一至三部（Batch 5：B04、B06、B09、B11）整合改写记录

- **跟踪任务**：`tiangong-lca/knowledge-base#215`（总纲 `#9`）
- **修订批次**：`part1-3-batch5-215`
- **基线提交**：`3941dfee2f79f86dfb8d66d9b4f6ced142b3a3a9`（`knowledge-base` `main`）
- **覆盖章节**：
  - `content/docs/book/framework-history.mdx`（B04《评价框架的形成》）
  - `content/monograph/framework-responsibilities.mdx`（B04 专论《评价框架与分析步骤》）
  - `content/docs/book/service-and-reference.mdx`（B06《功能参照》）
  - `content/docs/book/inventory-boundary-and-hybrid.mdx`（B09《混合清单》）
  - `content/docs/book/market-boundaries-and-response.mdx`（B11《市场响应》）

## 改写原则与边界

1. 按 `goal §2.16` 完成最后 4 章的整合改写，将 11 段超过 420 字的追加比较长段压实至 440 字以内，清除注释中的草稿章号残留并改为正式篇名，为五处既有对照表补齐表题。
2. 保留全部 25 条 `caseBinding: true` 教学案例绑定命题、`knowledge/cases/*` 原始案例文件与 `package.json` 零改动。
3. 保留全部既有 H2 标题与锚点、文献引用连续性、前置命题拓扑顺序及既有方法学口径边界。
4. 全部修订痕迹通过 `config/revisions/part1-3-batch5-215.json` 登记，公开变更日志不暴露内部命题编号。
