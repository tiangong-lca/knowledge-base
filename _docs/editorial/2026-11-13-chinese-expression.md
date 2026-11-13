---
title: Chinese expression copyedit and research inventory
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: en
whenToUse:
  - when reviewing the Chinese expression revision and its research inventory
whenToUpdate:
  - when the revised sample, full manuscript or inventory receives actual review
checkPaths:
  - content/**
  - knowledge/**
  - config/**
  - scripts/reader-current-edition*
  - _docs/editorial/readable-writing-and-teaching.md
related:
  - readable-writing-and-teaching.md
  - ../reader-publication-contract.md
  - ../book-execution.md
---

# Chinese expression copyedit

[Issue95](https://github.com/tiangong-lca/knowledge-base/issues/95) implements the
user's 2026-11-13 instruction: extend the writing guide, fully revise Part I,
independently review that sample with DeepSeek Harness, then copyedit the whole
manuscript. Literature gaps and three retained candidate materials are inventoried
in parallel. The earlier diagnostic findings are recorded in
[programme9](https://github.com/tiangong-lca/knowledge-base/issues/9#issuecomment-6827317910).

## Frozen baseline and scope

The source is eligible Main `8148f71d1b57ea06ee2ef44c6fe3477ed8f253ac`, freshly
verified before the new branch. Its complete tracked-source archive is retained
privately with SHA-256 `8c4c7aabfececb17be96139bd15ebe92d1db1a73726904a3576b2e39832002c4`;
all 395 archived files have individual hashes. Prior source/reader/output
acceptance, original source identities, versioned inputs and historical citation
records remain immutable. Source PR94 and root PR2342 are completed deliveries,
not open obligations of this new task.

Part I comprises five book chapters and six website pages. The sample must
include shared canonical text, ordinary prose, titles, descriptions, the part
introduction and transitions in their actual contexts. The first two selected
names are “问题的来源” and “生命周期视角”; other titles are judged against their
content rather than through a global word replacement. The whole-book extension
covers all 53 manuscript sources, 40 book units and 48 web units, with separate
attention to front matter, notes, method notes, four appendices and transitions.

The question is whether readers can identify the actual subject, action,
relationship and qualification without decoding drafting language. Preserve
scientific terms, necessary repetition, meaningful metaphors and different
chapter styles. Exact values, mathematical roles, hypothetical assumptions,
attribution, counterevidence and uncertainty cannot be altered to make a sentence
sound smoother. No change count or prohibited-word list defines success.

## Review order

1. Add actionable language requirements to the existing guide, keeping its dated
   historical reviews separate from current rules.
2. Read and revise the complete first-part sample. Retain the exact before/after
   prose and decisions to revise or retain it. Independently check meaning,
   templates and affected consumers.
3. Submit the actual revised sample and the applicable writing requirements in
   a fresh DeepSeek session. Verify the working directory, requested model,
   thinking effort and permissions. Do not supply the author's preferred
   conclusion or other reviewers' findings. Record actual coverage, adjudicate
   concrete findings, and recheck changes that affect them.
4. Apply the reviewed approach to every remaining unit. Each completed part
   receives a continuous reading; the final book receives cross-part terminology,
   comparison, note and transition review. A sample pass does not approve the
   remaining text.
5. Bind the actual new source, reader and output evidence separately. Preserve
   earlier accepted generations and exact old citation ranges; a matching URL
   or digest does not establish semantic preservation. Requalify actual current
   output, required CI, hosting and the exact root integration before completion.

## Parallel research inventory

The inventory checks existing literature, reading, gap and coverage records
against the eight research domains and twelve appendix responsibilities. It
distinguishes discovery, partial reading, actual evidence gaps and optional
extensions rather than equating record counts with coverage.

The three candidate materials are the course subtitles, associated HTML and
Guinée Handbook material. Identify actual available carriers, versions,
locations, rights and reading status before recommending their use. Related
course carriers are not independent evidence, and the 2002 Handbook is not an
independent methodological tradition merely because the 2001 CML volumes have a
different publication identity. Private classroom content and source originals
remain outside Git and public exports.

The output is an evidence-backed inventory and ordered next work, not full new
research or automatic inclusion of the three proposed connections. Ask for user
resources only when a specific necessary gap is established. Programme9's wider
research, formal-edition and human-review duties remain open unless separately
completed with their own evidence.

## Current state

The writing requirements are committed and pushed as `77c2d54`. A complete first
part candidate has independent before/after meaning review and actual web/book
output. DeepSeek has read all five book chapters and six website pages; its
source questions and language findings are being resolved against actual primary
passages and revised text. The whole-book extension has not yet begun.

The same-member language-successor mechanism has independent production-path and
mutation checks. It keeps its production state inactive, with no new acceptance
pin. Original scientific inputs and old accepted artifacts remain unchanged.
Research and candidate inventory reports are prepared for the tracked handoff;
they do not change canonical reading status or complete the wider programme.
New source/reader/output acceptance, source/main/hosting and exact root delivery
remain pending. Issue95 records current progress and remaining criteria.
