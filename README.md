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
lastReviewedAt: 2026-11-03
lastReviewedCommit: 3c3b6adbd6cbfb4988879f6e12a3670c445cc048
---

# LCA Living Knowledge Base and Review

中文 LCA 动态知识库与研究评论：从问题起源、概念含义、方法选择到数据与软件表达，沿可核查的证据链阅读。首版是四个语义样板专题和持续维护基础；覆盖清单明确保留全球历史、标准与文献研究的空白。

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

This is an M1 main repository. Current implementation is tracked in [knowledge-base #1](https://github.com/tiangong-lca/knowledge-base/issues/1); workspace onboarding in [workspace #2172](https://github.com/tiangong-lca/workspace/issues/2172). Use the workspace lifecycle controller for delivery records. A merged child PR requires separate exact workspace integration.

## License

Code is licensed under [MIT](LICENSE). Original narrative and knowledge records in `content/` and `knowledge/` are licensed under [CC BY-NC-SA 4.0](LICENSE-content), attributed to TianGong LCA Knowledge Base contributors. Commercial use of original knowledge content requires separate authorization from the relevant rights holders. Third-party sources retain their own licenses and applicable authorization conditions; a citation does not relicense the source or authorize full-text redistribution. See source-specific rights and preservation notes.
