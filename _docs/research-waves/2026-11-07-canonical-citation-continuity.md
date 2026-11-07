---
title: Canonical citation continuity after paragraph relocation
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: en
whenToUse:
  - when repairing or reviewing published canonical address migrations
whenToUpdate:
  - when historical address provenance, coverage or validation changes
checkPaths:
  - config/citation-*.json
  - scripts/reader-citation*.mjs
  - scripts/reader-surface*.mjs
  - scripts/reader-book.test.mjs
  - lib/reader-book.ts
  - components/chapter-content.tsx
related:
  - ../reader-publication-contract.md
  - ../architecture.md
  - ../publication-contract.md
  - ../book-execution.md
---

# Required corrective unit

[Issue #64](https://github.com/tiangong-lca/knowledge-base/issues/64) repairs a compatibility gap found after container [Issue #62](https://github.com/tiangong-lca/knowledge-base/issues/62) / [PR #63](https://github.com/tiangong-lca/knowledge-base/pull/63) reached Main. The container task's citation criterion is reopened; its source/root terminal handoff must wait for this correction. The full-book Goal remains active. No new manuscript, scientific-source or numerical work is implied by this repair.

## Observed defect and evidence boundary

The older frozen inventory contains 2,254 positional, heading and group addresses from Main `dd715663c3438aa730eef0da1696dc376a7715f1`. The opening delivery at published Main `a36597d72f8cd89beb285d5d5b439b4aa10e89a3` introduced canonical note identities scoped by source route and claim ID. The container migration preserved the first inventory but did not preserve those later canonical names when six paragraphs moved from C02 into X01.

A fresh check of actual hosted Main `ab5f8dfad4e0939f5dc505f1df6169776356fe54` finds all six former website canonical note IDs and all six former print canonical note IDs absent; all twelve corresponding current appendix destinations exist. The hosted manifest was stable and matched the exact clean source. The expected former names are reconstructed from the immutable released anchor code and its actual C02 occurrences, not from an unavailable historical HTML capture. Prior source/Main/hosted qualification establishes that source's published identity; it does not create an archived web edition.

This explains the earlier tests' limit: their 2,254-address success and 68 hosted checks remain valid within their actual generation, but were not sufficient to prove continuity of every later published anchor. The omission is recorded rather than hidden by changing the old inventory.

## Implementation boundary

Keep the original frozen inventory and independent guard byte-identical. Add a separately source-bound canonical occurrence snapshot reconstructed with the historical commit's own reader code and MDX files. It covers the actual historical note occurrences, annotation headings and printed unit IDs; pin the complete parsed snapshot independently in runtime/export validation. Retained addresses require the same claim identity as well as existence. Moved website addresses need native relocation links and moved print notes need correct adjacent aliases. Every entry retains its own generation's date and immutable source context, rather than borrowing the positional baseline's provenance.

The accepted reconstruction contains 44 reader pages, 44 print units and 830 actual claim occurrences: 1,660 website/print note addresses, 84 annotation headings and 44 printed unit IDs, or 1,788 addresses. The preface and guide have no notes in this source and receive none by inference. This is the note/annotation/unit family, not an assertion that every possible MDX-generated anchor was captured.

Current route-scoped print heading names must remain unchanged. A later B04 assembly that changes print scope must additionally freeze and map those existing canonical printed heading names; the older numeric-heading aliases only verify their current destinations and cannot by themselves preserve a former canonical name. That later scope change remains a distinct publication gate. Do not invent historical heading captures or implement the B04 assembler inside this corrective unit.

## Preservation and qualification

Freeze Main `ab5f8df`'s complete content, knowledge and release trees and all 36 case input/publication files before implementation. No scientific prose, source interpretation, case template, numerical input, result or frozen edition may change. Keep the current 45 print units, ten explicit relocations, current note order, premise links and input-download behavior.

Meaningful regression checks cover truncation or co-deletion of expected inventory/output, wrong claim targets, duplicates, source/provenance drift and actual native migrations. Independent engineering review, tests/types/build/governance and real no-JavaScript mobile/desktop and print checks remain separate evidence. Verify exact merged and hosted source identity before root integration and the reopened container task's final handoff. Task-owned temporary resources require cleanup receipts; programme worktrees, dependencies and private evidence remain deliberately retained.


## Actual implementation and independent qualification

The independent guard pins parsed snapshot SHA `ada2f259e872c51187391784f799fbdcea85a31f8bee70cc29cb787df0b29642`. An independent reviewer separately enumerated all 44 immutable MDX sources, ran the historical collector, checked all 830 ordered occurrences and source/code/catalog hashes, and derived the 44 historical print units. It found no supported material defect. Mutation checks cover inventory/output co-deletion, wrong identity/destination, duplicates, provenance substitutions and alias adjacency. Full 287 tests, focused 31 tests, types and working export pass.

Actual Chromium passed 51 checks at 390/1440: all twelve confirmed former canonical addresses resolve to the same claims with a36597d context, while sampled positional aliases retain dd715663 context. Current annotations, input-once and premise links, 45 print units, representative search/navigation and light-paper print behavior remain correct. The CSS and scientific content are unchanged. The final source-context warning's wording-only adjustment was independently rechecked; exact committed and hosted qualification remain subsequent gates. Browser and owned localhost port 3871 server were closed in finally, with cleanup receipts. These results do not certify unobserved historical HTML or future heading-scope migrations.
