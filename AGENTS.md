---
docType: contract
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when contributor authority or repository ownership changes
whenToUpdate:
  - when contributor authority or repository ownership changes
checkPaths:
  - "AGENTS.md"
  - ".docpact/config.yaml"
  - "_docs/**"
lastReviewedAt: 2026-11-05
lastReviewedCommit: 0dc23e80f1e06bdf235c55bf2d299a8b4d3cbf2c
---

# Knowledge Base contributor contract

This public repository owns LCA Living Knowledge Base and Review publication, curated public concepts/claims/evidence mappings, website and versioned publication artifacts. Workspace governance applies. Read `_docs/publication-contract.md` before editing content or implementation. Private research protocols, restricted originals and experiments remain in research. Public TIDAS specification and executable adoption remain with their existing owners.

Use workspace delivery controller for Issue/PR/state writes. M1: branch from main and PR to main; root integrates an exact reviewed main commit separately. Active book programme: knowledge-base#9; completed foundational wave: knowledge-base#10; current wave identity and progress are maintained in _docs/book-execution.md. Approval and autonomous in-scope research/writing authority are recorded in _docs/book-execution.md; do not reinstate the historical design-only gate. Do not commit or push delegated work; the primary agent coordinates Git.

Read `_docs/reader-publication-contract.md` before any public writing or presentation change. The user requires finished book prose and docs.tiangong.earth layout parity. Research/development/process narration, execution logs and TODOs belong in development Markdown, not delivered pages. Preserve substantive evidence/assumption limits in reader notes; do not merely remove caution or rename draft status. Review source entailment, reader understanding and rendered layout separately.

Never publish private conversation/meeting text or licensed source originals. Source existence is not evidence of claim entailment. Distinguish source statements, synthesis, calculation, interpretation and proposal; retain uncertainty, negative evidence and conflicting views. Software tests do not establish scientific or human expert approval.

Use Context7 then official version-matched documentation for library APIs. Verify compatible stable dependencies before adding them. Use pnpm and an exact lockfile, no parallel package manager. Support macOS arm64, Linux x64 and Windows x64; macOS Intel is retired.

Route changed paths through the workspace scripts/docpact wrapper with this repository as absolute --root. Run validation, build and scoped Docpact checks. Record actual evidence and remaining limits. Restricted material and local caches stay outside Git and public export.
