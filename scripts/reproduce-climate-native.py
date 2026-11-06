"""Opt-in replay of the frozen historical climate-metrics fixture."""

import argparse
import csv
import hashlib
import importlib
import importlib.machinery
import importlib.metadata
import json
import math
import os
import platform
import stat
import sys
import types
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_CASE = REPO / "knowledge/cases/climate-metrics-v1.json"
SUMMARY_SHA256 = "cc2ec676de328dbbb0aac4cfd50b2bdb1657de4387614be6a40929782ea9789a"
PUBLIC_SUMMARY_SHA256 = "acde0c073ea4591a2abe11bb0fc20c849649e060f46ca192939f358e49b1b70c"
LICENSE_SHA256 = "39288799750be3ec46f49f814562885feaedc0ef4adb918329651bbdcc0b184d"
RAW_ROOT = "https://raw.githubusercontent.com/IPCC-WG1/Chapter-7"
METRICS_DIR = "src/ar6/metrics"
AUTHOR_LOAD_ORDER = ("constants", "co2", "ch4", "gasser", "halogen_generic")
DEPENDENCIES = {"numpy": "2.5.4", "scipy": "1.18.1", "fair": "1.6.2"}
QUANTITIES = ("rf", "agwp", "agtp", "iagtp")
RATIOS = {"gwp": "agwp", "gtp": "agtp"}


def sha256(payload):
    return hashlib.sha256(payload).hexdigest()


def canonical_json(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False).encode()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def load_case(path):
    payload = path.read_bytes()
    case = json.loads(payload)
    require((case["caseId"], case["version"]) == ("CASE-CLIMATE-METRICS", "1.0.0"), "Expected CASE-CLIMATE-METRICS 1.0.0")
    native = case["native"]
    # The declared JS digest alone cannot authenticate a caller-provided summary.
    require(
        native["summarySha256"] == PUBLIC_SUMMARY_SHA256 and sha256(canonical_json(native["summary"])) == SUMMARY_SHA256,
        "Native summary differs from the frozen v1 input",
    )
    return native["summary"], sha256(payload)


def destination(path):
    require(not path.is_symlink(), f"Symlink destination refused: {path}")
    return path.absolute().parent.resolve(strict=True) / path.name


def checked_cache_directory(path, *, create):
    if create:
        path.mkdir(mode=0o700, exist_ok=True)
    require(path.is_dir() and path.resolve(strict=True) == path, f"Unsafe cache directory: {path}")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


def author_sources(cache, summary, offline):
    checked_cache_directory(cache, create=not offline)
    commit = summary["engine"]["sourceCommit"]
    source_root = cache / commit
    checked_cache_directory(source_root, create=not offline)
    for directory in ("src", "src/ar6", METRICS_DIR):
        checked_cache_directory(source_root / directory, create=not offline)
    files = {row["repoRelativeFile"]: row["sha256"] for row in summary["loadedAuthorFiles"]}
    files["LICENSE"] = LICENSE_SHA256
    result = {}
    for name, expected in files.items():
        target = source_root / name
        try:
            mode = target.lstat().st_mode
        except FileNotFoundError:
            require(not offline, f"Offline cache entry is missing: {name}")
            url = f"{RAW_ROOT}/{commit}/{name}"
            print(f"Fetching fixed author artifact {name}", flush=True)
            with urllib.request.build_opener(NoRedirect()).open(url, timeout=30) as response:
                require(response.status == 200, f"Expected HTTP 200 for {name}")
                downloaded = response.read(8193)
            require(len(downloaded) <= 8192 and sha256(downloaded) == expected, f"Downloaded SHA-256 mismatch: {name}")
            try:
                with target.open("xb") as stream:
                    stream.write(downloaded)
            except FileExistsError:
                # Another replay may have populated the same immutable cache entry.
                pass
            mode = target.lstat().st_mode
        require(stat.S_ISREG(mode) and target.resolve(strict=True) == target, f"Unsafe cache file: {name}")
        with target.open("rb") as stream:
            payload = stream.read(8193)
        require(len(payload) <= 8192 and sha256(payload) == expected, f"Cached SHA-256 mismatch: {name}")
        result[name] = (target, payload)
    return result


def package_entries(roots):
    entries = {}
    for name, version in DEPENDENCIES.items():
        distributions = [
            (root, dist) for root in roots for dist in importlib.metadata.distributions(name=name, path=[str(root)])
        ]
        require(len(distributions) == 1, f"Provide exactly one {name} {version} distribution through --package-root")
        root, dist = distributions[0]
        require(dist.version == version, f"Expected {name} {version}, found {dist.version}")
        spec = importlib.machinery.PathFinder.find_spec(name, [str(root) for root in roots])
        entry = (root / name / "__init__.py").resolve(strict=True)
        require(
            spec is not None and spec.origin and Path(spec.origin).resolve(strict=True) == entry and entry.is_relative_to(root),
            f"Package entry for {name} does not match its explicit distribution root",
        )
        entries[name] = entry
    return entries


def restrict_execution(output_files):
    forbidden = {"subprocess.Popen", "os.system", "os.posix_spawn", "os.fork", "os.forkpty", "os.exec"}
    mutations = {"os.remove", "os.rename", "os.mkdir", "os.rmdir", "os.chmod", "os.link", "os.symlink"}
    write_flags = os.O_WRONLY | os.O_RDWR | os.O_APPEND | os.O_CREAT | os.O_TRUNC

    def audit(event, arguments):
        if event.startswith("socket.") or event in forbidden or event in mutations:
            raise PermissionError(f"Replay audit denied {event}")
        if event == "open":
            path, _, flags = arguments
            if flags & write_flags and (
                not isinstance(path, (str, bytes)) or Path(os.fsdecode(path)).resolve() not in output_files
            ):
                raise PermissionError(f"Replay audit denied write outside the designated results: {path}")

    sys.addaudithook(audit)


def load_author_modules(sources):
    # Supply only verified bytes. The caller's cache is never added to the import path.
    require(not any(name == "ar6" or name.startswith("ar6.") for name in sys.modules), "Unexpected existing ar6 import")
    package = types.ModuleType("ar6")
    metrics = types.ModuleType("ar6.metrics")
    package.__path__ = []
    metrics.__path__ = []
    metrics.__package__ = "ar6.metrics"
    package.metrics = metrics
    sys.modules.update({"ar6": package, "ar6.metrics": metrics})
    for stem in (*AUTHOR_LOAD_ORDER, "__init__"):
        module = metrics if stem == "__init__" else types.ModuleType(f"ar6.metrics.{stem}")
        path, payload = sources[f"{METRICS_DIR}/{stem}.py"]
        module.__file__ = str(path)
        module.__package__ = "ar6.metrics"
        sys.modules[module.__name__] = module
        if module is not metrics:
            setattr(metrics, stem, module)
        exec(compile(payload, module.__file__, "exec"), vars(module))
    return metrics


def responses(np, metrics, parameters, axis):
    horizon = np.linspace(axis["startYr"], axis["endYr"], axis["pointCount"], dtype=np.float64)
    axis_sha = sha256(horizon.astype("<f8").tobytes())
    require(axis_sha == axis["sha256"], "Generated time-axis SHA-256 differs from the frozen float64 axis")
    base = parameters["baseline"]
    thermal = {"d": np.array(parameters["d_yr"]), "q": np.array(parameters["q_k_per_w_m2"])}
    co2_args = {"co2": base["co2_ppm"], "n2o": base["n2o_ppb"], "co2_ra": parameters["co2_rapid_adjustment"], **thermal}
    co2 = dict(zip(QUANTITIES, metrics.co2_analytical(
        horizon, **co2_args, a=np.array(parameters["co2_airborne_fractions"]),
        alpha_co2=np.array(parameters["co2_taus_yr_author_permanent_sentinel_zero"]),
    )))
    ch4 = dict(zip(QUANTITIES, metrics.ch4_analytical(
        horizon, co2=base["co2_ppm"], ch4=base["ch4_ppb"], n2o=base["n2o_ppb"], **thermal,
        ch4_ra=parameters["ch4_rapid_adjustment"], alpha_ch4=parameters["ch4_lifetime_yr"],
        ch4_o3=parameters["ch4_ozone_w_m2_ppb"], ch4_h2o=parameters["ch4_water_w_m2_ppb"],
    )))
    feedback = dict(zip(QUANTITIES[:3], metrics.gasser.carbon_cycle_adjustment(horizon, ch4["agtp"], **co2_args)))
    for series in (*co2.values(), *ch4.values(), *feedback.values()):
        require(series.dtype == np.float64 and series.shape == horizon.shape and np.isfinite(series).all(),
                "Author result must be finite float64 on the frozen axis")
    ratios = {}
    for name, quantity in RATIOS.items():
        denominator = co2[quantity][1:]
        require((denominator > 0).all(), f"{name} reference denominator is invalid after time zero")
        ratios[name] = (ch4[quantity][1:] + feedback[quantity][1:]) / denominator
        require(np.isfinite(ratios[name]).all(), f"Invalid {name} value after time zero")
    return horizon, co2, ch4, feedback, ratios


def evaluate_grid(np, metrics, summary, frozen, csv_file):
    axis = frozen["timeAxis"]
    inputs = summary["frozenInputs"]
    horizon, co2, ch4, feedback, ratios = responses(np, metrics, inputs["parameters"], axis)
    tolerances = inputs["checkTolerances"]
    checks = []

    def compare(label, actual, expected, *, abs_tol=None):
        actual, expected = float(actual), float(expected)
        if abs_tol is None:
            relative = tolerances["nonzero_relative"] if expected else 0
            absolute = 0 if expected else tolerances["zero_absolute"]
        else:
            relative, absolute = 0, abs_tol
        checks.append({
            "name": label, "actual": actual, "expected": expected,
            "relativeTolerance": relative, "absoluteTolerance": absolute,
            "passed": math.isclose(actual, expected, rel_tol=relative, abs_tol=absolute),
        })

    zero = summary["zeroTimeControl"]
    compare("0:co2.rf", co2["rf"][0], zero["co2Rf"])
    compare("0:ch4.rf", ch4["rf"][0], zero["ch4Rf"])
    for gas, series in (("co2", co2), ("ch4", ch4), ("feedback", feedback)):
        for key, values in series.items():
            if gas == "feedback" or key != "rf":
                compare(f"0:{gas}.{key}", values[0], 0, abs_tol=0)

    observations = []
    for reference in frozen["observations"]:
        year = reference["horizonYr"]
        index = round(year / axis["stepYr"])
        require(horizon[index] == year, f"Frozen comparison horizon is absent: {year}")
        row = {"horizonYr": year}
        for label, series in (("co2Response", co2), ("ch4DirectResponse", ch4), ("ch4FeedbackIncrement", feedback)):
            if label in reference:
                row[label] = {key: float(series[key][index]) for key in reference[label]}
                for key, value in row[label].items():
                    compare(f"{year}:{label}.{key}", value, reference[label][key])
        for name, quantity in RATIOS.items():
            denominator = co2[quantity][index]
            row[name] = {
                "direct": float(ch4[quantity][index] / denominator),
                "carbonCycleFeedbackIncrement": float(feedback[quantity][index] / denominator),
                "total": float(ratios[name][index - 1]),
            }
            for key, value in row[name].items():
                compare(f"{year}:{name}.{key}", value, reference[name][key])
        if frozen["id"] == "source-0.1-year-grid":
            for name, criterion in summary["sourceGridHistoricalRoundedReference"].get(str(year), {}).items():
                compare(f"{year}:{name}:historical-rounding", row[name]["total"], criterion["expected"], abs_tol=criterion["abs_tol"])
        observations.append(row)

    groups = {"co2": co2, "ch4": ch4, "feedback": feedback}
    columns = {f"{gas}_{key}": values for gas, series in groups.items() for key, values in series.items()}
    with csv_file.open("x", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream, lineterminator="\n")
        writer.writerow(["horizon_yr", *columns, *ratios])
        for index, values in enumerate(zip(horizon, *columns.values())):
            writer.writerow([*(float(value) for value in values),
                             *(float(series[index - 1]) if index else None for series in ratios.values())])
    output_sha = sha256(csv_file.read_bytes())
    return {
        "id": frozen["id"], "timeAxis": axis, "outputCsv": csv_file.name, "outputCsvSha256": output_sha,
        "referenceOutputCsvSha256": frozen["outputCsvSha256"], "referenceOutputBytesMatch": output_sha == frozen["outputCsvSha256"],
        "referenceReceiptSha256": frozen["receiptSha256"], "zeroTimeRatios": {"gwp": None, "gtp": None},
        "observations": observations, "comparisons": checks, "passed": all(check["passed"] for check in checks),
    }


def main(args):
    require(sys.version_info[:2] == (3, 12), "Replay requires CPython 3.12")
    require(platform.python_implementation() == "CPython", "Replay requires CPython")
    require(sys.flags.isolated and sys.flags.no_site and sys.dont_write_bytecode, "Launch Python with -I -S -B")
    runtime = {"python": platform.python_version(), "platform": sys.platform, "architecture": platform.machine()}
    require(not (runtime["platform"] == "darwin" and runtime["architecture"] == "x86_64"), "macOS Intel is outside workspace support")
    summary, case_sha = load_case(args.case)
    roots = list(dict.fromkeys(path.resolve(strict=True) for path in args.package_root))
    entries = package_entries(roots)
    output, cache = destination(args.output), destination(args.cache)
    require(not os.path.lexists(output), f"Output directory already exists: {output}")
    for path in (output, cache):
        require(path != REPO and not path.is_relative_to(REPO), f"Use a private path outside the repository: {path}")
    for first, second in ((output, cache), *((path, root) for path in (output, cache) for root in roots)):
        require(not first.is_relative_to(second) and not second.is_relative_to(first), "Cache, output and dependency roots must not overlap")
    if args.offline:
        require(cache.is_dir(), f"Offline cache does not exist: {cache}")

    os.umask(0o077)
    sources = author_sources(cache, summary, args.offline)
    output.mkdir(mode=0o700)
    runs = summary["observations"] if args.finer_grid else summary["observations"][:1]
    output_files = {run["id"]: output / f'{run["id"]}.csv' for run in runs}
    receipt_file = output / "receipt.json"
    restrict_execution({*output_files.values(), receipt_file})
    sys.path.extend(str(root) for root in roots)
    started = timestamp()
    dependencies = {}
    for name, entry in entries.items():
        module = importlib.import_module(name)
        require(
            module.__version__ == DEPENDENCIES[name] and Path(module.__file__).resolve(strict=True) == entry,
            f"Imported {name} does not match the preflight version and entry",
        )
        dependencies[name] = {"version": module.__version__, "moduleSha256": sha256(entry.read_bytes())}
    np = sys.modules["numpy"]
    metrics = load_author_modules(sources)
    results = [evaluate_grid(np, metrics, summary, run, output_files[run["id"]]) for run in runs]
    receipt = {
        "case": "CASE-CLIMATE-METRICS 1.0.0", "caseFileSha256": case_sha,
        "publicNativeSummarySha256": PUBLIC_SUMMARY_SHA256, "pythonCanonicalNativeSummarySha256": SUMMARY_SHA256,
        "originalFrozenSpecificationSha256": summary["frozenInputs"]["specificationSha256"],
        "originalCanonicalParametersSha256": summary["frozenInputs"]["canonicalParametersSha256"],
        "launcherSha256": sha256(Path(__file__).read_bytes()), "sourceCommit": summary["engine"]["sourceCommit"],
        "authorFiles": {name: sha256(payload) for name, (_, payload) in sources.items()},
        "runtime": runtime, "dependencies": dependencies, "startedAtUtc": started, "finishedAtUtc": timestamp(),
        "units": summary["units"], "scope": summary["boundaries"], "runs": results,
        "passed": all(run["passed"] for run in results),
    }
    encoded = (json.dumps(receipt, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode()
    with receipt_file.open("xb") as stream:
        stream.write(encoded)
    for run in results:
        passed = sum(check["passed"] for check in run["comparisons"])
        print(f'{run["id"]}  {passed}/{len(run["comparisons"])} checks  {run["outputCsvSha256"]}')
    print(f"Receipt SHA-256  {sha256(encoded)}")
    return 0 if receipt["passed"] else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--case", type=Path, default=DEFAULT_CASE, help="repository or public v1 case JSON")
    parser.add_argument("--cache", required=True, type=Path, help="caller-owned author-source cache outside the checkout")
    parser.add_argument("--output", required=True, type=Path, help="new caller-owned result directory outside the checkout")
    parser.add_argument("--package-root", required=True, action="append", type=Path, help="installed package directory, repeat if needed")
    parser.add_argument("--offline", action="store_true", help="require all source files in cache without downloading")
    parser.add_argument("--finer-grid", action="store_true", help="also replay the separate 0.05-year sensitivity grid")
    try:
        sys.exit(main(parser.parse_args()))
    except (OSError, ImportError, ValueError, KeyError) as error:
        parser.exit(1, f"Replay stopped: {error}\n")
