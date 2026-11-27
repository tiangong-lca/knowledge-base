---
docType: guide
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when drafting, revising, or reviewing English monograph chapters, topics, appendices, or reference apparatus
whenToUpdate:
  - when English style, terminology, alignment, or zero-context reader standards change
checkPaths:
  - "_docs/editorial/en/**"
  - "content-en/**"
  - "knowledge/editions/en/**"
  - "config/editions/en/**"
lastReviewedAt: 2026-11-23
lastReviewedCommit: 0e6e7240b1c5ad94e21afb8e4ed41eff32fe74e6
---

# English Writing, Meaning-Alignment, and Teaching Guide

This guide governs the independently authored English edition of *The Past and Present of Life Cycle Assessment* (`#246`, under Programme `#9`, US English spelling standard). It is the English counterpart to `_docs/editorial/readable-writing-and-teaching.md`.

## 1. Core mandate: meaning-level authoring, never literal translation

- **Align at the claim-paragraph level (shared claim ID), not the sentence level.** Within each paragraph, split or combine sentences, reorder clauses, and choose active subjects so the English reads as natural scholarly prose written directly for English-speaking LCA researchers, graduate students, and practitioners.
- **Return to English primary sources.** Most foundational LCA standards, handbooks, and papers (ISO 14040/14044, ILCD 2010, EU PEF (EU) 2021/2279, GHG Protocol Product Standard 2011, IPCC AR6, CML 2001, ReCiPe 2016, USEtox, ecoinvent v3) were written in English. Verify and cite their original English terms, definitions, and section/table locators directly instead of back-translating Chinese paraphrase.
- **Avoid translationese.** Do not calque Chinese four-character parallelisms, nominalized chains, or topic-comment sentence shells. Lead each paragraph with its governing analytical claim, name explicit agents ("the ILCD Handbook requires…", "the UK Environment Agency study assumes…"), and keep transitions crisp.

## 2. Non-negotiable semantic invariants

Every shared claim paragraph must preserve all eight semantic invariants from `#95` (`_docs/publication-contract.md`):

1. **Subjects and objects**: exact product system, functional unit, flow, or institutional actor.
2. **Quantities and units**: identical numerical values, units, rounding notes, and calculation formulas (formatting such as thousand separators and decimal points follows English conventions).
3. **Comparison pairs**: exact baseline vs alternative, direction of difference, and crossover thresholds.
4. **Validity conditions and boundaries**: scope, geographic/temporal domain, and assumptions stay with the claim—never hidden in footnotes or softened into vague caveats.
5. **Attribution**: distinguish source statements, calculations, syntheses, interpretations, and proposals; never attribute a secondary guideline's rule to a paywalled ISO standard whose full text was not inspected.
6. **Negation and modal strength**: preserve exact epistemic force ("may", "must", "does not establish", "cannot substitute for").
7. **Unverified status**: wherever the Chinese edition displays `待核`, the English edition must display a visible **Unverified** badge and candid explanation.
8. **Table semantics**: column headers, row subjects, units, and boundary footnotes must match the Chinese table's analytical meaning.

## 3. Terminology and Chinese-language sources

- Consult `knowledge/editions/en/termbase.json` before drafting any chapter.
- **Official terms first**: prefer published official English terminology from ISO 14040/14044, ILCD, EU PEF, IPCC, or official Chinese national-standard/ministry English titles (`basis: official`, with source citation).
- **Contextual terms**: where no official English rendering exists, establish a clear, consistent English term grounded in the monograph's context (`basis: contextual`, with rationale).
- **Acronyms**: expand every non-trivial acronym on first occurrence in each chapter (e.g., *life cycle inventory (LCI)*, *Product Environmental Footprint Category Rules (PEFCR)*, *low-density polyethylene (LDPE)*).
- **Chinese primary sources**: render official English titles where available; otherwise provide a clear contextual English title followed by the original Chinese title in parentheses (permitted on the Han-character whitelist).

## 4. Edition-specific reader notes (`en-only` and `zh-only`)

- Both editions may include labeled edition-specific context notes (`For English readers` / `中文读者说明`), registered in `knowledge/editions/alignment.json`.
- Use `en-only` notes to supply context an English reader would otherwise lack (e.g., brief institutional orientation for Chinese national standards such as GB/T 24067-2024 or domestic policy context).
- Every factual statement in an edition-specific note must carry shared `evidenceIds`. Edition-specific notes must never introduce substantive analytical conclusions absent from the other edition.

## 5. Clean public delivery and mutual refinement

- **Zero process prose**: never expose internal IDs (`cl-...`, `src-...`, `en-note-...`), issue/PR numbers, work-package labels (`P0`, `WP8`), or drafting-process narration in rendered pages.
- **No internal draft chapter numbers**: refer to other chapters by canonical English title or hyperlink, never fragile draft numbering; external literature chapter citations (e.g., *IPCC AR6 WGI Chapter 7*, *ecoinvent v3 Chapter 10*) remain allowed.
- **Feed discoveries back to Chinese**: if drafting an English paragraph reveals an ambiguous subject, missing condition, or inconsistency in the Chinese text, do not quietly patch it only in English—submit a formal Chinese revision in the same PR (Commit 1) via `scripts/revision-apply.mjs`, refresh `zhDigest`, and align both editions together.

## 6. Independent zero-context English reader checklist

Before any English chapter or batch merges, a fresh-context reader (assuming the persona of an English-speaking LCA researcher or practitioner who has not seen the Chinese draft or authoring prompts) must read the rendered static HTML continuously and check:

1. **Fluency & register**: does every section read like native scholarly LCA prose rather than translated Chinese?
2. **Argumentative arc**: does the chapter deliver on its title, open with a concrete analytical question, and hand off cleanly to the next chapter?
3. **Self-contained clarity**: are acronyms expanded on first use, tables readable without consulting the Chinese version, and numerical examples followable step by step?
4. **Epistemic discipline**: are boundaries, paywalled-standard limits, and `Unverified` notices clear and non-repetitive?
5. **Clean delivery**: zero leaked Han characters (outside whitelisted Chinese source titles), zero internal IDs, zero broken links or mismatched anchors.

Zero blocking and zero major findings are required before merge. Passing reader and parity checks does not establish scientific or human expert approval (`scientificApproval: false`).

## 7. Every change, every surface (2026-11-27, `#302`)

- **Same delivery, both languages.** Any change to public Chinese content—prose, notes, tables, captions, reading guides, home page, navigation labels, print front matter, reference pages, page titles and descriptions—needs its English counterpart revised in the same PR, and vice versa (`_docs/lca-book-goal.md` §2.17).
- **Author, don't mirror.** Rebuild the English from the meaning card and English primary sources. Interface text should use the label an English-speaking reader expects for that function ("Book Guide", "Print Edition", "Notes"), not a gloss of the Chinese label; match function and information content, not wording.
- **Keep the skeleton.** Pages, section count, claim order, tables, worked cases and reading-guide entries match the Chinese edition. If a structural difference is genuinely better for English readers, propose it for both editions or register it with rationale in `config/editions/en/parity-exceptions.json`.
- **Review meaning, not words.** The parity gate in `pnpm validate` only confirms the skeleton. Record a bilingual meaning review for every changed paragraph or UI string, and inspect both rendered locales for interface changes.
