# Publication editions and corrections

A build is a preview until its source is committed and its identity is checked. To freeze a source edition, build from a clean checkout, then run:

```sh
node scripts/snapshot.mjs 2026-11-03 /absolute/new/edition-directory
```

The command refuses an existing destination, a dirty checkout or a build from another commit. It preserves the complete static website (including framework assets), a manifest and SHA-256 identities for all files. Serve the `site/` directory at its own root or archive it as one unit. A host must retain prior editions at distinct immutable origins/paths and preserve asset routing; replacing a current deployment alone does not archive prior editions.

Print the edition's `/print/` page to PDF. Browser PDF output requires visual verification of pagination, source references, Chinese fonts and tables. Bind the PDF hash to the edition manifest before distributing it. The first source release provides this workflow; hosting/domain publication and an archival DOI are separate operations.

Corrections are recorded as GitHub Issues titled `Erratum <edition-id>: <summary>` referencing exact claim IDs and source identity. Retain old edition bytes, link the correction from the current changes page, and publish a corrected edition. Withdrawal retains a visible notice; a correction never silently rewrites a prior edition. No human expert approval is implied by source checks or CI.
