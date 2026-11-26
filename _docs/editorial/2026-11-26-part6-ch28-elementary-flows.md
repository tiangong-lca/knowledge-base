---
title: Part VI Chapter 28 — Elementary Flows and Underlying LCIA Coupling Pre-Writing Protocol
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or auditing Part VI Chapter 28 (Elementary Flows and Underlying LCIA Coupling)
whenToUpdate:
  - when Chapter 28 scope, primary-source registry, or comparative tables change
checkPaths:
  - content/docs/book/elementary-flows-and-lcia-coupling.mdx
  - content-en/docs/book/elementary-flows-and-lcia-coupling.mdx
  - _docs/editorial/2026-11-26-part6-ch28-elementary-flows.md
lastReviewedAt: 2026-11-26
lastReviewedCommit: 2bae77b7ac55e8d646e073465d242337f9f80cc4
related:
  - 2026-11-26-part6-ch27-method-divergences.md
  - ../reader-publication-contract.md
---

# 第六部第 28 章《基本流与底层 LCIA 耦合：为何 Flows 无法无损映射》写前协议

## 1. 核心研究问题

为什么不能做一张“全球通用基本流对照表”，把 ecoinvent、欧盟 EF 3.1、Sphera MLC、USLCI (`fedelemflowlist`)、IDEA 与 SimaPro 的基本流一键无损转换？本章直指根本机制：**基本流列表并非中性的化学元素表，而是由底层 LCIA 影响评价模型的区室、空间标签、价态与归趋需求反向塑造的**。

## 2. 四节结构与对照表

1. **基本流分类树由底层 LCIA 反向塑造** (`#基本流分类树由底层LCIA反向塑造`)
2. **水、碳、土地与金属：四大高频失配重灾区** (`#水碳土地与金属四大高频失配重灾区`)
3. **一对多、多对一与参照物／单位陷阱** (`#一对多多对一与参照物单位陷阱`)
4. **静默丢流与表征归零：跨库计算最隐蔽的错误** (`#静默丢流与表征归零跨库计算最隐蔽的错误`) + 表 1（五大基本流映射失效类型、机制、LCIA 后果与核查防线对照表）。

## 3. 一手来源绑定

- 新增核验来源：`fedelemflowlist` 官方仓 README（`3806e94e...`）、UNEP GLAD Elementary Flow Resources 官方仓 README（`9df695c1...`）、`olca-schema` 官方规范（`d8681fa0...`）。
- 复用本库已逐文件核验的一手来源：`src-water125-ef31-selected-members`、`src-bio127-ef31-selected-members`、`src-tox123-ef31-selected-members`、`src-eutro129-ef31-selected-members`、`src-particulate131-ef31-selected-members`、`src-book-ilcd-2010`（§8.2 缺因子规则）、`src-olca-flows`。
