---
title: Offline reproduction of the electricity case
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: en
whenToUse:
  - when replaying the exact published AVERT electricity case
whenToUpdate:
  - when the reviewed native driver, input acquisition or execution summary changes
checkPaths:
  - scripts/reproduce-electricity-native.mjs
  - _docs/reproduction/electricity/**
  - knowledge/cases/electricity-service-v1.json
lastReviewedAt: 2026-11-06
lastReviewedCommit: 1776bb5dc99ca36569b5ab7d3a598e2e3dce336a
---

# Replay the AVERT electricity case offline

This case uses the 2023 Texas regional data in EPA AVERT Web v4.3.0. The replay runs the published calculation core and the client functions used to prepare and aggregate the numerical inputs. The static book can use the separate author-derived summary. The book build does not invoke the replay.

Use Node **20.20.2** and three separate private directories outside the repository checkout. The [replay driver](../../../scripts/reproduce-electricity-native.mjs) is in the repository's `scripts/` directory. Use the exact byte sequences in [the acquisition manifest](electricity-native-acquisition.json). The recorded execution used macOS on arm64. Linux and Windows results remain untested. The driver permits other platforms that meet the pinned runtime, subject to the workspace exclusion of macOS x64.

1. Create a private original-artifact directory. For every entry in `originalArtifacts`, download its immutable `url` and save the bytes under its relative `path`. Keep the directory structure and original line endings. Use the commit links in the manifest even if a newer AVERT version exists.
2. Create a private dependency directory with `archives/` and `node_modules/`. Save each dependency archive at its declared `archive` path. Verify its SHA-256 before extraction. Extract the contents of its `package/` directory into the declared `extractDirectory` with a local archive tool. For example, extract `archives/stats-lite-2.2.0.tgz` into `node_modules/stats-lite/` after removing the leading `package/` from each member path. The other two entries use the same layout. The pinned Node version and three packages suffice for the driver. Package-manager installation and lifecycle scripts are unnecessary.
3. From the repository root, invoke the driver with the two input directories, a new output directory under an existing parent, and the batch name. Replace the paths below with your private directories. The output must be outside both input directories. If downloading the driver alone, use its saved path in place of `scripts/reproduce-electricity-native.mjs`.

```text
node scripts/reproduce-electricity-native.mjs /path/to/private/originals /path/to/private/pinned-deps /path/to/private/replay-primary primary
node scripts/reproduce-electricity-native.mjs /path/to/private/originals /path/to/private/pinned-deps /path/to/private/replay-secondary secondary
```

The primary batch replays the zero control and the flat hypothetical terminal reduction of 1 MWh in each of the 8,760 one-hour records. The secondary batch replays the two single-hour 100 MWh terminal reductions. Each batch can run independently. The dates and clock values come from the Texas regional data records.

The driver verifies original files, dependency archive integrity, and the SHA-256 of the actual extracted JavaScript and package manifests before evaluation. It compiles the unmodified numerical client modules with the pinned TypeScript compiler and fixed LF output. It extracts the `sortObjectByKeys` declaration as written from the verified utilities module so the unrelated CSS initializer can be left out of the calculation. The original aggregate function used in the replay never calls that helper. The driver has no network, server, app, or macro step.

Each successful batch writes `receipt.json` after the scenario inputs, raw modeled generator outputs, regional aggregation, and scenario summaries. The receipt records both the requested modeled fossil-load change and the sum of the modeled generator response. It includes the bound, threshold, output, and NEI matching diagnostics and the hashes of the actual output files. Keep the original files, dependency archives, and raw generator outputs in private replay directories.

The portable driver reproduced all eight files in each original batch byte for byte. The portable receipts reflect the portable driver’s identity, hashes of executed dependency code and license metadata. The compact `electricity-native-summary.json` records selected derived outputs and the hashes of the original and portable receipts. Its numbers come from the controlled native runs and should be cited as author-derived results. Numeric facts quoted from the EPA artifacts retain their own source provenance.

To compare a new run, match each scenario's `inputSHA`, `rawSHA` and `aggregatedSHA` in `receipt.json` to the corresponding `outputs` in [the recorded summary](electricity-native-summary.json), then compare the requested energy, monthly-path regional deltas and diagnostics in `runScenarios`. The receipt embeds each scenario summary; it does not separately hash the summary JSON file. A receipt's complete bytes include runtime/platform metadata, so cross-platform receipt identity is not a portability claim. The static book evaluates ratios from the recorded summary embedded in its case input; it does not execute AVERT during a build.

EPA’s tagged repository declares CC0-1.0. The manifest identifies the upstream licenses of the pinned dependency archives, which retain their license and notice files. Download sources and dependencies directly from their listed locations.
