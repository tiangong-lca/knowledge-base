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
lastReviewedAt: 2026-11-03
lastReviewedCommit: 753a9513e821b7804452114b1ac805f8a928f1bc
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

The research page and machine export use nested public allowlists. No raw originals, private paths, credentials or unpublished claim text enter them. A public reading note may report uncertainty or a proposed editorial revision; this is not promotion of an unsupported substantive conclusion. `Prose` renders canonical reviewed text continuously, with accessible claim/evidence links; `Claim` retains the detailed view. General source appraisal and claim-specific entailment are separate.
