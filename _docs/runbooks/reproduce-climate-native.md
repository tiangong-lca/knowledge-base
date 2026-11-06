---
title: Replay the historical climate-metrics fixture
docType: runbook
scope: repo
status: active
authoritative: true
owner: knowledge-base
language: en
whenToUse:
  - when replaying the selected historical IPCC AR6 Chapter 7 native responses
whenToUpdate:
  - when the replay launcher, frozen inputs or qualified runtime change
checkPaths:
  - scripts/reproduce-climate-native.py
  - knowledge/cases/climate-metrics-v1.json
---

# Replay the historical climate-metrics fixture

The optional launcher replays the selected standalone CH₄ row in
`CASE-CLIMATE-METRICS 1.0.0`. It calls the unchanged CO₂ and CH₄ pulse
functions and the warming-driven carbon feedback function from the
[fixed Chapter 7 GitHub snapshot](https://github.com/IPCC-WG1/Chapter-7/tree/2f948c862dbc158182ba47b863395ec1a4aa7998).
This commit is later than the August 2021 Zenodo v.1.0 archive. The replay is
separate from the static website and its validation commands.

## Prepare the runtime

Use CPython 3.12 and supply directories that already contain NumPy 2.5.4,
SciPy 1.18.1 and FaIR 1.6.2 for that interpreter and platform. Use a single
`--package-root` for a shared site-packages directory or repeat the flag for
separate unpacked distributions. Each directory must contain the actual
package and its distribution metadata. For an activated environment, the
following command shows its site-packages directory.

```sh
python3.12 -c 'import sysconfig; print(sysconfig.get_path("purelib"))'
```

FaIR must be available as files in a directory because its initialization
reads bundled data through filesystem paths. The launcher checks the exact
versions and package origins before loading them. Supply dependency directories
you trust. The launcher performs no package installation and site builds need
none of these Python packages.

The demonstrated runtime is macOS arm64 with CPython 3.12.16. Linux x64 and
Windows x64 have not been replayed. On every platform, use caller-owned private
directories outside the checkout and keep the cache, results and package roots
separate.

## Run the replay

From the repository root, substitute your private paths. The parents of both
destination directories must already exist. The result directory must be new.

```sh
python3.12 -I -S -B scripts/reproduce-climate-native.py \
  --package-root /path/to/python3.12/site-packages \
  --cache /path/to/private/author-cache \
  --output /path/to/private/first-result
```

The launcher uses the repository case by default. Set `--case` to the saved
public `climate-metrics-v1.json` to replay from that input instead. It checks
the declared case identity and a separate pinned digest of the actual native
summary before any source fetch or author import. This accepts harmless JSON
key ordering and indentation changes. It also records the supplied case file's
actual byte hash.

On a cache miss, the launcher retrieves six exact Python modules and the MIT
license from the fixed raw GitHub paths and verifies their SHA-256 digests
before executing any author code. The cache layout is
`<cache>/<commit>/<repository-relative-file>`. A hash mismatch stops execution
and leaves the existing file in place. Use `--offline` after the cache is
populated to require an entirely local replay. The author source cache is
excluded from the Python import path. Once acquisition ends, the launcher
uses a Python audit hook to reject selected socket, process and filesystem
mutation events, and ordinary file writes outside the designated results.
This is a scoped runtime guard, not an operating-system filesystem sandbox or
complete containment of native dependencies. Only the pinned reviewed author
code and explicitly trusted dependencies are in scope. Cached code and raw
outputs stay outside Git and public export.

The default run uses 1,001 float64 samples from 0 to 100 years at 0.1-year
spacing. Add `--finer-grid` to also replay the separate 0.05-year sensitivity
run in the same new result directory. The launcher checks the exact time-axis
digest and the selected response and ratio values against the case tolerances.
It checks the exact zero controls and leaves the undefined time-zero ratios
empty in the CSV and null in the receipt.

## Inspect the results

The output directory contains `source-0.1-year-grid.csv`, optionally
`sensitivity-0.05-year-grid.csv`, and `receipt.json`. The receipt identifies
the author bytes, launcher, package versions, axes, original and replay CSV
hashes, and individual comparisons. A failed comparison produces a failed
receipt and a nonzero exit. If acquisition or setup stops earlier, fix the
reported cause and choose a new output directory if the previous attempt
created one. Compare replay CSV hashes with the reference as additional
evidence. The acceptance check is the declared numerical comparison, which
allows differences in last-bit output representation.

The historical standalone CH₄ run includes the warming-driven carbon feedback.
The authors' fossil oxidation and biogenic uptake series have separate
provenance and are outside this executable calculation. Its scope ends at 100
years, without the complete 500-year notebook, the 2025 errata generator or
any empirical validation. The optional finer grid measures step-size
sensitivity and does not establish continuum convergence.
