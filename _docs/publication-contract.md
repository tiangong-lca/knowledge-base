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
lastReviewedAt: 2026-11-12
lastReviewedCommit: 07e4de733f37171a59be2fc93082e182c8dac67c
---

# Publication contract

The initial release established bounded examples. The approved book programme now expands source-grounded chapters while retaining explicit incomplete coverage. Chinese prose retains original English labels. Public content is authored here; private experiments and restricted evidence remain in research. Only reviewed, explicitly publishable records enter public exports.

Canonical knowledge is stored in knowledge/catalog.json; MDX renders claim statements by ID. Source, evidence, claim, concept, mapping and coverage identities are stable. Version changes never silently overwrite a released snapshot. Claims distinguish source-statement, interpretation, synthesis, calculation and proposal. Each evidence record identifies an exact locator. Claim-specific evidenceLinks assign support, qualification, contradiction or context plus rationale; legacy records retain their original evidence-level relation. Explicit links must exactly cover evidenceIds and never silently fall back to a legacy role. Claim scope, premises, caveats, review date and review kind remain explicit. AI review is never labeled human expert approval.

Source retrieval, rights, version and preservation limits are recorded. Unavailable full text does not support a purported full-text verification. No source copying is authorized merely by access. Proposed improvements carry reasoning and alternatives; editorial suggestions are not external normative requirements.

When a carrier's access circumstances are unresolved, `passages-inspected` records only actual selected inspection without asserting public or licensed access. It requires an explicit selected-reading scope and reading-ID binding, whose carrier and passages are verified by the research validator. Its literature entry may use `access-context-unresolved`; rights and limitations state the observed context separately. An institutional-access banner or a captured article body does not establish entitlement, an open license or redistribution permission. Abstract-only substantive reading must not be misreported as proof that fuller text was unavailable. These states do not permit a full-work reading upgrade or weaken passage/evidence bindings.

Changed sources, premises, concepts and mappings invalidate dependent review through the derived dependency graph. Search cutoff, evidence review date and substantive modification date remain distinct. New evidence passes screening, extraction, impact review and editorial PR before publication. Historical releases remain immutable with separately discoverable errata.

Initial publication may include explicitly disclosed open questions, but must not present unsupported draft conclusions as established facts. Publication status and epistemic uncertainty are separate. Automated integrity checks verify references and required fields; independent substantive review evaluates entailment and applicability.

## Rights boundary

Code is MIT licensed. Original knowledge prose and records in content/ and knowledge/, and original book figures in public/book-figures/, are CC BY-NC-SA 4.0; commercial use requires separate authorization. Third-party content retains its original licenses and authorization conditions; no project license overrides them. Contributors must have authority to license their submissions, and separate commercial authorization must come from the relevant rights holders. Publication rights are reviewed independently of evidence support.

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

## Editorial selection and historical continuity

The2026-11-08 whole-book selection decision in `editorial/2026-11-08-argument-and-selection.md` separates evidence eligibility from main-text inclusion. Faithful source support does not require publication of every inspected detail. Preserve coverage obligations, reader-essential conditions, counterevidence and immutable source/release identity while permitting explicitly reviewed mergers, notes, appendices, useful website topics and corrections. A current paragraph's removal from the main text requires a documented semantic destination or correction, dependent-use review and actual historical-link qualification; retaining an empty anchor or changing a baseline hash is insufficient. Existing code guards remain binding until those bounded dispositions are implemented and reviewed. Editorial agreement is not scientific consensus or human expert approval.

## Reader publication boundary

Complete-manuscript acceptance binds the actual before/after source, ordered
public and research records, and both dependency graphs. Unchanged URLs do not
waive old title, note-subset or ordinary-content obligations. Migrations require
exact, accessible destinations and separately reviewed semantic dispositions.
Source, reader and actual-output reports must be real preserved artifacts bound
to the same unit; a review hash alone is insufficient. Production inputs and
public indexes/downloads must belong to the qualified current generation.

Private preview artifacts are an editorial aid, not a publication acceptance.
The production build and export gates cannot be disabled by package metadata or
the preview flag. These integrity conditions do not turn an agent judgment into
human expert approval or empirical model validation.

The user-approved `_docs/reader-publication-contract.md` governs every delivered reading page. Public prose is finished exposition; all research/development process logs and TODOs stay in `_docs/`. Scientific scope, source identity, counterevidence and hypothetical assumptions remain reader-accessible. Stable machine identities and validation receipts do not become visible prose labels. Source/reader review and actual visual verification supplement software checks.

Static prose examples retain versioned public inputs and exact materialized claims even when they do not use a calculator widget. Water-locality numbers are synthetic; the phosphorus example binds a source-derived inventory-estimation coefficient and leaves its LCIA factor symbolic. The registered adapter fixes each numerical-source policy; an input flag cannot suppress required source evidence. Changed v1 tuples require renewed model/version and complete affected-prose review.

## Source-table fact sets and historical reconstruction

An evidence record may publish either its legacy singular `numericFact` or a nonempty `numericFacts` list. Each plural item has a unique identity within that evidence and the same decimal value, unit, quantity, subject and basis contract; singular/plural coexistence is rejected. Nested publication projection excludes unknown fields. Fact identity alone does not establish source entailment or scientific validity.

The historical-glass adapter requires every selected fact in the reviewed public closure with matching evidence/source identity, fact ID, value, unit and subject, and binds the exact inspected original PDF hash. Its closed v1 records selected component arithmetic and source-reported summary normalization, retaining unclosed whole-system assembly, unreported precision and empirical limits. The author-conditional coefficient-rounding bound holds displayed mass fixed and is not a probability or empirical uncertainty interval. Neither input flags nor a matching aggregate permit bypassing source facts or declaring complete original-software reproduction.

Historical numerical publication also requires the actual reading register. Each fact's evidence must resolve through an inspected same-source reading and an unambiguous passage to its original-PDF artifact with the fixed hash. A source's default snapshot cannot substitute for a missing or different passage carrier. Generic mixed-carrier readings remain valid for other evidence; carrier identity checks still do not establish that a passage entails its claimed quantity.

The pedigree-calibration case separates source-summary arithmetic from a
deliberately stipulated probability model. Its three numerical sources bind
exact reading, passage, fact and original-PDF identities. The neutral
`passages-inspected` state retains unresolved access context while recording
actual selected inspection; it is not an open-license or entitlement claim.
Reported internal discrepancies remain unrepaired. Published GSD factors,
squared-GSD parameters, log standard deviations, estimator precision and
individual spread retain separate meanings. No case flag can promote the
summary calculation into reproduction of raw observations, empirical calibration
or current database software.

The market-response case keeps historical average-supply arithmetic separate
from author-stipulated demand-response scenarios. Its nine displayed source facts
bind value, unit, quantity, subject and basis as well as exact evidence, reading,
passage and original-PDF identity. The loss-inclusive M3 denominator is not a
final-meter delivery unit. Fictional material response, electricity activities and
CO2 coefficients are explicit conditions; capacity availability, procurement
identity and actual output response remain distinct. The input cannot declare
empirical response validation or convert the modeled CO2 inventory into a full
material footprint or impact score. Older registered inputs remain unchanged.

The hybrid-inventory example binds the particular published wall service that
supplies its external electricity demand. Repository validation and export require
one matching wall input and manifest, their registered filename, the canonical
public hash and the service fields used by the calculation. The new annual
transactions, prices and direct emissions are author stipulations. Separate
ledgers preserve supplier identity through aggregation, subtraction, normalization
and solution. A balance residual can check a proposed system of equations while
the actual trading partners still require evidence. Source-reported numerical
examples and the new supplier records have distinct provenance.

For the Swiss 2013 weighting case, the original edition, work, carrier, passage and numerical tuple all qualify the factor used. The reconstruction from reported inputs and the application of rounded published values are distinct calculations. A synthetic change to one relative factor establishes a conditional ranking threshold. Historical policy change requires separate dated evidence.

For survey-based damage values, bind the estimate to its actual study, questionnaire basis, sign and units. A reprinted sample table cannot authorize substitution of another publication’s coefficients. Explicitly conditional arithmetic such as the health-day conversion, unpublished precision and unresolved cross-table discrepancies retain their own status. The LIME teaching comparison uses reported factor sets separately on the same stipulated service and damage quantities.

For CASE-PACK, a reuse threshold specifies a comparator, service and impact measure. Published model outputs can establish arithmetic relationships while confidential inputs still limit native reproduction. Respondent incidence and bag-weighted substitution remain distinct quantities in numerical metadata as well as prose. The publication's count and division templates reference evaluated values; explicit reapproval of prose still requires source and reader judgement.

The recovered-paper case binds each grade's published substitution ratio to its own reference process. A direct source ratio remains a model assumption, and a derived product vector is not a complete native activity matrix. Distinguish annual routing, marginal treatment service, finished-paper output, fibre balance and end-product performance. Reported heat-only credits may be retained without claiming that disclosed parameters reproduce them; exact tuple checks must not erase that scientific limit.

A dated rule can support a technical conformance condition without establishing
its legal application to a specific company or the empirical validity of a model.
For the dairy rule trace, bind numerical evidence to the actual PDF or XLSX
carrier and its inspected page, worksheet/cell or embedded diagram location.
Workbook results, formulas that retrieve stored outputs, and native model inputs
are distinct evidence layers. Do not silently repair disagreements between dated
public artifacts or publish a reconstructed footprint from an unclosed activity
chain. Rule-review statements and study-level verification retain their exact
objects; a shared statement in two carriers is not independent corroboration.

A selected literal fraction in a separate source workbook must retain that
workbook's original identity and the inspected cells, including the literal's
numerator, denominator and units. Agreement with a similar default in another
source cannot waive this binding. Equal labels on separate model connections
establish numerical agreement only; the exchange semantics and any unresolved
native relationship remain explicit.

For particulate-health teaching, distinguish emitted primary particles or
precursor mass, inhaled particle mass, population/age definitions, health
outcomes and already characterized damage. A published historical intake/effect
join does not authorize replacing either factor with a later model. A weighted
reconstruction from source factors that themselves use the same weights is a
consistency check, not independent validation. Keep source groups separate from
receptor populations and preserve unquantified uncertainty.

When a numerical original is a member of a public release archive, bind the
exact member bytes and its named archive path separately from the archive's
identity. The particulate case requires both the original XLSX and the ZIP
passage in the reviewed public closure. A matching archive hash cannot substitute
for the workbook hash, or conversely. Neither a source's publication date nor a
software-matched sheet supplies the coverage of the full original method.

For electricity, preserve source-defined generation, delivery, loss, trade and
time coordinates. An identical region name or unit cannot authorize cross-source
division. A native model result is an author-derived execution record, distinct
from a source-table literal. CASE-POWER fixes both the selected source tuples and
its separately labeled native summary, including exact code/input and receipt
identities. Static publication evaluates arithmetic from those reviewed records;
it does not rerun or certify the original model. Archive and member identities,
mixed-carrier readings and original access limitations remain independently
bound. A source documentation discrepancy does not establish implementation
behavior without the executable evidence.

Native exchange comparisons distinguish source-data facts from author-derived
execution observations. A source artifact or selected code passage cannot stand
in for a run receipt. Preserve archive/member identity, schema migration,
explicit settings, loaded-library identity and the closed inspected database
digest through calculation. Public summaries may expose reviewed selected
observations and receipt hashes without redistributing the original database,
complete factor tables or native model exports. A numerical match never grants
redistribution permission or establishes physical applicability.

The CML framework examples keep an original hypothetical process model separate
from a later external screening transformation. The reviewed input binds every
selected coefficient, original reported literal, factor range and scoring limit
to its actual Guide or EPA passage and PDF. Closed exact arithmetic distinguishes
source statements from reconstruction; the printed determinant and methane-score
mismatches remain explicit. Source ranges carry no probability assignment, and
undefined gaps between displayed scoring bins receive no invented rule. The
static case does not execute historical software, apply facility score modifiers,
aggregate screening criteria or establish empirical/engineering validity.


Climate comparisons bind gas identity, carbon-content accounting, metric,
time horizon or calendar endpoint, reference and factor edition separately.
A generic methane row excluding its carbon-content budget may still include
warming-driven carbon feedback. A native historical routine, a supplied response
series and a corrected factor table have different provenance. The climate case
preserves those layers and an unchanged parent inventory. Its source-rounding
interval is distinct from physical uncertainty; an annual history metric is not
a product-unit factor or an authorization for offsets. Current original-carrier
readings can extend a work while preserving earlier derived-text captures and
immutable case inputs as dated evidence.

Stable reader addresses are tied to their actual claim occurrence and preserved edition context. A moving display number cannot silently reassign an older address. The opening migration retains one canonical editable claim, with native old aliases or explicit relocation destinations and an immutable-source link for its dated baseline. This does not create a second editable scientific edition or imply every earlier unversioned URL had the same meaning. New authored synthesis and source-scope corrections require their own actual evidence review before promotion.


An editorial move of historical calculation paragraphs can retain the same registered input version only while its exact source facts, quantity semantics, assumptions and arithmetic remain unchanged. Reworded cross-page antecedents are explicitly revised in the publication templates and canonical materialization under a renewed substantive review date; the changed publication-manifest bytes have their own new content hash. Preserve all unaffected case/release bytes. An added nonnumerical synthesis must bind the actual local reconstruction premises and cannot promote reported totals into independently reproduced whole-system outputs.


Published canonical reference names are publication surfaces in their own right, even when an older positional inventory predates them. A source-bound reconstruction can establish names generated by immutable released code and actual historical occurrences, but must identify that evidence honestly rather than assert a captured or retained hosted edition. Record the corresponding source for each address generation. Independent inventory pins and actual same-claim destination checks guard against co-deleting expected history and output. An interface-only repair may preserve all scientific records unchanged; it still needs actual browser/reference qualification and exact source delivery.


Combining sources into one authored chapter must preserve the narrower meaning of their published unit and annotation-group addresses as well as individual claim references. Native scope context identifies the original title/edition and exact original note subset; a broader current note group cannot silently replace that meaning. Reviewed manuscript acceptance binds both canonical scientific records and any substantive authored navigation. Shared website/book projections do not create separately editable copies of scientific explanation.


Native retained headings, as well as chapter and note-group targets, may carry
narrower historical content scopes than their present section. Qualify each
scope against its own immutable source or actual captured edition, preserve the
original claim subset and expose its dated context at the native heading.
Inherited citations are remapped by their actual destination identity; the source
route alone cannot determine where a subsequently moved note belongs.


The particulate chapter and its calculation appendix share canonical records.
The complete original48propositions and10numerical templates remain present,
with current six explanatory additions separately accepted. Exact old chapter,
section and note scopes remain readable across the new destinations. The
specific original/matched AUS comparison qualifies the stated rows and labels,
not the mapping algorithm, a current package other than the named release, or
software execution. A final source/reader/engineering acceptance binds the
current scientific records and audit additions; real output, hosting and
delivery still require their own evidence.

## Readable-writing adoption

The user-adopted [writing and teaching standard](editorial/readable-writing-and-teaching.md) governs Chinese manuscript revision. Reader-essential conditions stay with their claims; source fidelity and comprehension remain independent checks. Its dated assessment and illustrative edits do not acquire scientific approval through adoption. A prose-only revision of a numerical case may retain its immutable input while renewing the exact publication templates, canonical materialization and affected-consumer acceptance. Original snapshots and all unrelated input/publication identities remain protected.
