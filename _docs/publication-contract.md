---
docType: contract
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when publication authority, licensing or eligibility changes
whenToUpdate:
  - when publication authority, licensing or eligibility changes
checkPaths:
  - "AGENTS.md"
  - "LICENSE*"
  - "knowledge/**"
  - "content/**"
  - "scripts/**"
  - "releases/**"
lastReviewedAt: 2026-11-04
lastReviewedCommit: 4cbc293777b1ff8862f0686b73795d626d2a5438
---

# Publication contract

The initial release established bounded examples. The approved book programme now expands source-grounded chapters while retaining explicit incomplete coverage. Chinese prose retains original English labels. Public content is authored here; private experiments and restricted evidence remain in research. Only reviewed, explicitly publishable records enter public exports.

Canonical knowledge is stored in knowledge/catalog.json; MDX renders claim statements by ID. Source, evidence, claim, concept, mapping and coverage identities are stable. Version changes never silently overwrite a released snapshot. Claims distinguish source-statement, interpretation, synthesis, calculation and proposal. Each evidence record identifies an exact locator. Claim-specific evidenceLinks assign support, qualification, contradiction or context plus rationale; legacy records retain their original evidence-level relation. Explicit links must exactly cover evidenceIds and never silently fall back to a legacy role. Claim scope, premises, caveats, review date and review kind remain explicit. AI review is never labeled human expert approval.

Source retrieval, rights, version and preservation limits are recorded. Unavailable full text does not support a purported full-text verification. No source copying is authorized merely by access. Proposed improvements carry reasoning and alternatives; editorial suggestions are not external normative requirements.

Changed sources, premises, concepts and mappings invalidate dependent review through the derived dependency graph. Search cutoff, evidence review date and substantive modification date remain distinct. New evidence passes screening, extraction, impact review and editorial PR before publication. Historical releases remain immutable with separately discoverable errata.

Initial publication may include explicitly disclosed open questions, but must not present unsupported draft conclusions as established facts. Publication status and epistemic uncertainty are separate. Automated integrity checks verify references and required fields; independent substantive review evaluates entailment and applicability.

## Rights boundary

Code is MIT licensed. Original knowledge prose and records in content/ and knowledge/ are CC BY-NC-SA 4.0; commercial use requires separate authorization. Third-party content retains its original licenses and authorization conditions; no project license overrides them. Contributors must have authority to license their submissions, and separate commercial authorization must come from the relevant rights holders. Publication rights are reviewed independently of evidence support.

## Public research records

`knowledge/research/literature-map.json` records discovery and coverage, not research completion. `readings.json` identifies actual selected passages, work/version/carrier identities, acquisition hashes, methodological appraisal, unread areas and evidence-triggered revisions. Shared works, overlapping passages and repeated institutional lineages do not count as independent confirmation. Catalog sources bind reading IDs and artifact identity; evidence binds a reading and passage, including the exact carrier for mixed PDF/HTML readings. SHA-256 identifies acquired bytes but does not guarantee future availability or redistribute permission.

Reader pages present bibliography and citations; search protocols, execution history and editorial changes live in development Markdown. Machine exports retain nested public allowlists. No raw originals, private paths, credentials or unpublished claim text enter them. A public reading note may report uncertainty or a proposed editorial revision; this is not promotion of an unsupported substantive conclusion. `Prose` renders canonical reviewed text continuously, with accessible claim/evidence links; `Claim` retains the detailed view. General source appraisal and claim-specific entailment are separate.

## Reproducible teaching cases and derived carriers

A `derived-text` artifact identifies the actual captured text bytes, its original-document URL, extraction method/scope and unavailable original bytes. Its hash never represents the original PDF; visual verification and complete-document reading must not be inferred. A narrow editorial acceptance may support selected claims while this gap remains explicit. Raw captures remain outside public exports.

Reviewed numerical evidence can expose a `numericFact` with value, unit, quantity, subject and basis. A teaching case binds each selected characterization factor to the published numerical fact and its source. Hypothetical performance, inventory and decision assumptions remain separate from source-derived factors.

`knowledge/cases/*.publication.json` binds reviewed claim templates to the SHA-256 of the exact allowlisted downloadable input. Explicitly materialized canonical claim text and metadata must match that binding; build validates without approving or rewriting claims. Input or template changes require renewed substantive review and deliberate catalog updates. Versioned input filenames and case bindings preserve each registered version's own identity. This validation establishes consistency, not empirical truth or stakeholder acceptance of a hypothetical tolerance.

## Distinct questions in a shared case

CASE-JOINT-BATCH keeps additive product shares, physical alternative routes and reference-conditioned residuals separate in claim text and output fields. Two differently unitized inventory flows are never aggregated into an environmental score. Its prices, service equivalence, supplier response and utilization scenarios are author stipulations; source discussions motivate the argument but do not provide numerical evidence for them. A model with no characterization uses no factor bindings, through its explicit registered inventory-only policy; the wall model's fact binding remains mandatory.

Reused original works receive precise additional passage/visual-check records where inspected. Added locators do not increment work counts or imply whole-work reading. Dated normative and adequacy criteria retain each author's purpose. A correction record does not substitute for an unread original procedure, and a mathematically similar teaching formula is not automatically that procedure's implementation.

## Reader publication boundary

The user-approved `_docs/reader-publication-contract.md` governs every delivered reading page. Public prose is finished exposition; all research/development process logs and TODOs stay in `_docs/`. Scientific scope, source identity, counterevidence and hypothetical assumptions remain reader-accessible. Stable machine identities and validation receipts do not become visible prose labels. Source/reader review and actual visual verification supplement software checks.
