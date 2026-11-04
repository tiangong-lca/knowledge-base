---
docType: reference
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when development commands or public entry points change
whenToUpdate:
  - when development commands or public entry points change
checkPaths:
  - "README.md"
  - "package.json"
  - "app/**"
  - "scripts/**"
lastReviewedAt: 2026-11-04
lastReviewedCommit: edcc3f5ff973644610dd588056e831940049454d
---

# LCA Living Knowledge Base and Review

中文 LCA 动态知识库与研究评论：从问题起源、概念含义、方法选择到数据与软件表达，沿可核查的证据链阅读。已从四个语义样板专题进入全书研究和正文扩充；文献地图与选段阅读台账明确保留全球历史、标准与文献覆盖缺口。

## Read and contribute

`content/docs/` contains the narrative. `knowledge/catalog.json` is the canonical source, evidence, claim, concept and conditional-mapping registry. Public pages and machine exports share one reviewed-record projection. Source checks performed by agents are labeled explicitly and do not claim human expert or scientific approval.

Read [publication contract](_docs/publication-contract.md), [editorial protocol](_docs/editorial-protocol.md), [architecture](_docs/architecture.md) and [edition workflow](releases/README.md). Private research, restricted originals and meeting transcripts are not part of this repository.

## Develop

Use Node 24.18.0 from `.nvmrc` and pnpm 12.16.1, matching the compatible Node range and exact package-manager pin in package.json. macOS Apple Silicon, Linux x64 and Windows x64 are supported; macOS Intel is retired.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

The static site is exported to `out/`. Search works without an external service or credentials. EdgeOne Makers project `makers-w8wl4xjmt2mj` imports this repository's `main` branch; the production hostname is `prism.tiangong.earth`. Hosting qualification is tracked in [knowledge-base #3](https://github.com/tiangong-lca/knowledge-base/issues/3). A successful local build does not establish live deployment, domain activation or HTTPS availability. Do not copy another site's identity, search index or credentials.

`edgeone.json` and `.nvmrc` both select the platform-preinstalled Node 24.18.0. The pnpm `packageManager` pin remains 12.16.1; a supported preinstalled pnpm switches to that declared version automatically. Check the actual hosted install log and keep the frozen lockfile. Do not run `corepack enable` against platform-owned Node shims. The lockfile includes the verified pnpm 12.16.1 executable wrapper used by hosted version selection. `tsconfig.json` deliberately matches the hosted builder's compact serialization and function-directory exclusions so a build preserves source identity; `/.edgeone/` is generated deployment output.

```sh
node scripts/impact.mjs <changed-id>
node scripts/snapshot.mjs <edition-id> <new-absolute-directory>
```

Impact analysis reports claims needing review without granting approval or automatically changing editorial decisions. Freeze editions only after a clean committed build. Use `/print/` for the complete narrative with evidence and references.

## Delivery

This is an M1 main repository. The approved book programme is coordinated in [knowledge-base #9](https://github.com/tiangong-lca/knowledge-base/issues/9); the first research/manuscript wave [#10](https://github.com/tiangong-lca/knowledge-base/issues/10) is integrated, the methods/models expansion is [#12](https://github.com/tiangong-lca/knowledge-base/issues/12), and subsequent wave identities and progress are maintained in [the execution ledger](_docs/book-execution.md). Initial onboarding #1/workspace #2172 remains historical evidence. Use the workspace lifecycle controller for delivery records. A merged child PR requires separate exact workspace integration.

## License

Code is licensed under [MIT](LICENSE). Original narrative and knowledge records in `content/` and `knowledge/` are licensed under [CC BY-NC-SA 4.0](LICENSE-content), attributed to TianGong LCA Knowledge Base contributors. Commercial use of original knowledge content requires separate authorization from the relevant rights holders. Third-party sources retain their own licenses and applicable authorization conditions; a citation does not relicense the source or authorize full-text redistribution. See source-specific rights and preservation notes.

## Approved book programme

The [LCA treatise design and AI goal](_docs/lca-book-goal.md) was approved on 2026-11-04 at baseline a9ae501. [Execution record](_docs/book-execution.md) preserves the authority to research, revise arguments from evidence and expand prose without repeated outline approval. The prologue, eight-volume mission and appendices remain the scope; a wave is not the completed book.

Read `/docs/book/` for developing chapters and `/research/` for discovery queries, selected-passage readings, artifact hashes, gaps and evidence-driven revisions. Public research registers live in `knowledge/research/`; downloaded originals remain outside Git. Discovery records do not claim whole-work reading. `/downloads/research.json` exports only explicitly selected public fields.

The developing chapter `/docs/book/wall-service-to-comparison/` contains a reproducible hypothetical wall-coating case. Versioned input and evaluated receipt are under `/downloads/cases/`; claim details expose their binding. `node scripts/impact.mjs CASE-WALL-CONNECT` finds dependent prose. The interactive controls and fixed print tables use the same evaluator. Source-derived factors and author-invented model values are explicitly distinguished; no actual paint ranking is claimed.
