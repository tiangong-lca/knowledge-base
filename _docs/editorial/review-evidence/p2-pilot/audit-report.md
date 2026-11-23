# P2 Bilingual Pilot Audit Report

- **Date**: 2026-11-23
- **Units Audited**: Preface (`/en/docs/`), Reading Guide (`/en/docs/book/`), Chapter 29 Wall Service Comparison (`/en/docs/book/wall-service-to-comparison/`, 28 claims + `CASE-WALL-CONNECT` + standards comparison table), and `en-note-guide-bilingual-edition`.
- **Auditor**: Independent Zero-Context English LCA Reader & Bilingual Meaning-Parity Auditor (`research` subagent `10116c72`).

## Findings & Resolution

1. **Meaning, Numerical & Citation Parity**: **100% PASS** across all 28 claims, exact-arithmetic wall-coating quantities, IPCC AR6 WGI Table 7.15 (October 7, 2025 errata), ILCD Handbook (2010), Commission Recommendation (EU) 2021/2279 (PEF), GHG Protocol Product Standard (2011), Heijungs (2020), and paywalled standard boundaries.
2. **US Spelling Consistency**: Standardized all 10 UK-spelled tokens (`colour`, `favour`, `labour`, `metre`, `behaviour`/`behavioural`) to US English across prose, metadata, and claims.
3. **First-Use Acronym Expansions**: Expanded `LCA`, `ILCD`, `GHG`, `EF 3.1`, and `100-year Global Warming Potential (GWP-100)` on first use in Preface, Reading Guide, and Chapter 29.
4. **Style & Termbase Fixes**: Standardized `kWh/operation`, updated `waste collection` → `waste treatment`, smoothed `satisfy equivalence within the tolerance`, and fixed missing spaces (`the 1974 container study`, `the 1974 REPA`) in `knowledge/editions/en/termbase.json`.
5. **Mutual Chinese Findings Logged (deferred to next Chinese revision pass)**:
   - `cl-wall-question` (`CO2` vs `化石 CO2` in `cl-wall-inventory`).
   - Chinese standards table Row 2 Col 5 can note `EN ISO/IEC 17020:2012` for full visual parity with `cl-wsc157-pef-pefcr-and-classes`.
