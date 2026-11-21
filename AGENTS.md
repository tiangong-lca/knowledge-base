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
lastReviewedAt: 2026-11-21
lastReviewedCommit: fff371413af1436a9e7802831c349a583bfa41b6
---

# Knowledge Base contributor contract

This public repository owns LCA Living Knowledge Base and Review publication, curated public concepts/claims/evidence mappings, website and versioned publication artifacts. Workspace governance applies. Read `_docs/publication-contract.md` before editing content or implementation. Private research protocols, restricted originals and experiments remain in research. Public TIDAS specification and executable adoption remain with their existing owners.

Use workspace delivery controller for Issue/PR/state writes. M1: branch from main and PR to main; root integrates an exact reviewed main commit separately. Active book programme: knowledge-base#9; completed foundational wave: knowledge-base#10; current wave identity and progress are maintained in _docs/book-execution.md. Approval and autonomous in-scope research/writing authority are recorded in _docs/book-execution.md; do not reinstate the historical design-only gate. Read the latest pause or resume state and chapter scope in the execution ledger before acting. The 2026-11-06 resumption began with the editorial deliverable in goal §2.12. Normal reviewed delivery and pending integration proceed separately. Do not commit or push delegated work; the primary agent coordinates Git.

Read `_docs/reader-publication-contract.md` before any public writing or presentation change. The user requires finished book prose and docs.tiangong.earth layout parity. Research/development/process narration, execution logs and TODOs belong in development Markdown, not delivered pages. Preserve substantive evidence/assumption limits in reader notes; do not merely remove caution or rename draft status. Review source entailment, reader understanding and rendered layout separately. The 2026-11-06 monograph requirements in `_docs/lca-book-goal.md` §§2.7–2.12 govern the whole book: preserve research coverage and the complete old-to-new chapter map; build a continuous argument and authored prose; use distinct website/book organization over shared canonical content. Heading changes or hidden TOC levels alone do not satisfy this goal.

The user resumed again on2026-11-08, prioritizing whole-book argument, material selection and consensus/disagreement presentation before further prose. Apply goal§2.13 and `_docs/editorial/2026-11-08-argument-and-selection.md`. Source support is necessary for assertions but is not sufficient for inclusion. Preserve coverage, counterevidence and citation identity without requiring every old paragraph to remain in the main text; actual migrations require reviewed dispositions and output checks.

The 2026-11-14 user clarification makes concept/principle-led comparison of standards, guidance, scholarly methods, data and software the book's central research purpose. Apply [concept-led comparative writing](_docs/editorial/concept-led-comparison.md) for source selection, chapter design and acceptance. State the common question and actual comparative result; a completed language edit or publication check does not fill missing research. Historical/source-specific topics may retain named titles when their role and scope are explicit.

For Chinese manuscript drafting, revision and reader review, apply [the writing and teaching guide](_docs/editorial/readable-writing-and-teaching.md) adopted on 2026-11-11. Follow the reader publication contract for independent review.

On 2026-11-15 the user endorsed the completed flow pilot and explicitly authorized
an active continuing GOAL to apply its retrospective corrections to every later
revision and addition. Use the comparative contract, writing guide and current
execution ledger for that work; do not restart the completed pilot or require
repeated outline approval. A bounded pilot's conserved paragraphs/numbers are
not a universal freeze: justified corrections and selection need their own
evidence, historical disposition and affected-consumer review. Chapter delivery
does not complete the remaining whole-book programme.

On 2026-11-20 the user established the mandatory Clean Public Delivery & Editorial History Separation rule (`_docs/lca-book-goal.md` §2.15, `_docs/reader-publication-contract.md`, task `#166`): keep 100% of iteration provenance, predecessor hashes, review evidence and rationales in `config/reader-*.json`, `_docs/editorial/` and Git history to support ongoing authoring and auditing, and auto-aggregate the full public revision/errata ledger on `/changes/`; default production builds (`READER_EDITORIAL_HISTORY !== '1'`) MUST render ONLY the clean finished monograph on `/docs/book/**` and `/print/` with ZERO inline development-process disclosures (`[data-copyedit-history]`, `[data-*-history]`, `[data-part*-reread-part]`, `[data-legacy-scope]`, `[data-*-correction]`), enforced by the Clean-Delivery Gate in `scripts/reader-surface.mjs`. Use `READER_EDITORIAL_HISTORY=1` only for local editorial-comparison previews.

On 2026-11-21 the user adopted integrated revision over appending (`_docs/lca-book-goal.md` §2.16, task `#189`). Place new comparisons, evidence and corrections where the reader's question arises, and rewrite the existing paragraphs they affect. Do not append standalone summary paragraphs at section or chapter ends. Existing claims may be rewritten, merged, split, moved to notes or tables, or deleted, provided each change records its old-to-new destination, its reason, the affected premises and consumers, and a `/changes/` entry readers can follow, and old anchors stay reachable. Claim counts, unchanged old text and premise tidiness are not acceptance evidence. The structural limits (3–5 sections per chapter, ≤120 sections book-wide) and case numeric identity remain. A fresh-context reader must read each whole chapter continuously before delivery. Part and whole-book rereads must read and revise the actual text; metadata or terminology fixes alone are not a continuous reread. The B14 integration pilot goes to the user for review before the rule is rolled out to other chapters. Human expert review, real reader trials, paid-standard purchases and the three historical candidate materials are deferred by the user and do not block autonomous work. The current guards cannot yet retire or merge claim ids and replay an approximately 35-unit rollback chain for every change. Per the user's 2026-11-21 decision, first build claim retirement (old anchors retarget to successors, `/changes/` entries, restorable rollback), then collapse the existing chain into a reviewed checkpoint. Historical units, evidence and `/changes/` stay preserved and independently verifiable. Later revisions are recorded and rolled back only against the checkpoint. The B14 pilot waits for this infrastructure.

Never publish private conversation/meeting text or licensed source originals. Source existence is not evidence of claim entailment. Distinguish source statements, synthesis, calculation, interpretation and proposal; retain uncertainty, negative evidence and conflicting views. Software tests do not establish scientific or human expert approval.

Use Context7 then official version-matched documentation for library APIs. Verify compatible stable dependencies before adding them. Use pnpm and an exact lockfile, no parallel package manager. Support macOS arm64, Linux x64 and Windows x64; macOS Intel is retired.

Route changed paths through the workspace scripts/docpact wrapper with this repository as absolute --root. Run validation, build and scoped Docpact checks. Record actual evidence and remaining limits. Restricted material and local caches stay outside Git and public export.
