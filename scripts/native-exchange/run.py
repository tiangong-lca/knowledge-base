#!/usr/bin/env python3
"""Reproduce the reviewed native openLCA exchange runs in a private new directory."""

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

# The checkout is read-only to this driver, including Python's import cache.
sys.dont_write_bytecode = True
from prepare import prepare, sha256

PACKAGE = Path(__file__).resolve().parent
REPOSITORY = PACKAGE.parents[1]
MAVEN_CENTRAL = "https://repo.maven.apache.org/maven2/"
MAVEN_BUILD = "3.10.0 (c43a36b8d67be7e0805a411bc0898af1a51f5472)"
DEPENDENCY_GOAL = "org.apache.maven.plugins:maven-dependency-plugin:3.11.0:build-classpath"
NUMERICAL_GATE_SHA = "eaab71d29808d40c527f60057839177ed74f4b5f98942ea18827d15f604f8a91"
SOURCE_FILES = (
    "pom.xml", "README-probe.md", "numerical-gate.md", "prepare.py", "run.py",
    "src/main/java/evidence/Inspect.java", "src/main/java/evidence/Calculate.java",
    "src/main/java/evidence/Probe.java",
)
FLOW_REFS = {
    "fossilCarbonDioxide": "08a91e70-3ddc-11dd-923d-0050c2490048",
    "fossilCarbonMonoxide": "08a91e70-3ddc-11dd-924e-0050c2490048",
    "hydroPrimaryEnergy": "04202047-6556-11dd-ad8b-0800200c9a66",
    "openMachineProduct": "a1ff365a-b063-4993-9ddc-6c68dd45ff81",
}


def read_json(path):
    with path.open(encoding="utf-8") as source:
        return json.load(source)


def write_json(path, data):
    with path.open("x", encoding="utf-8", newline="\n") as out:
        json.dump(data, out, ensure_ascii=False, indent=2, allow_nan=False)
        out.write("\n")


def require_python_runtime():
    if sys.version_info < (3, 9):
        raise ValueError("Use Python 3.9 or later")
    # Windows ignored mkdir's 0o700 DACL request in older Python releases.
    if os.name == "nt" and (
        sys.implementation.name != "cpython" or sys.version_info < (3, 13)
    ):
        raise ValueError("Windows requires CPython 3.13 or later for private directory permissions")


def new_workdir(requested):
    require_python_runtime()
    if not requested.is_absolute() or requested.name in ("", ".", ".."):
        raise ValueError("--workdir must be an absolute path with a new final directory")
    parent = requested.parent.resolve(strict=True)
    candidate = parent / requested.name
    if REPOSITORY in (candidate, *candidate.parents) or any(
        (ancestor / ".git").exists() for ancestor in (parent, *parent.parents)
    ):
        raise ValueError("--workdir must be outside Git working trees")
    candidate.mkdir(mode=0o700)
    return candidate.resolve(strict=True)


def manifest(path, root):
    return {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size,
            "sha256": sha256(path)}


def stage_code(root, harness):
    lock = read_json(PACKAGE / "dependencies.lock.json")
    if lock.get("repository") != MAVEN_CENTRAL or set(lock.get("authoredFiles", {})) != set(SOURCE_FILES):
        raise ValueError("Unexpected reproducer manifest shape")
    for name in SOURCE_FILES:
        src = PACKAGE / name
        expected = lock["authoredFiles"][name]
        if sha256(src) != expected:
            raise ValueError(f"Authored file hash mismatch: {name}")
        if name in ("run.py", "prepare.py"):
            continue
        dest = root / name if name == "numerical-gate.md" else harness / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        if sha256(dest) != expected:
            raise ValueError(f"Staged authored file hash mismatch: {name}")
    if lock["authoredFiles"]["numerical-gate.md"] != NUMERICAL_GATE_SHA:
        raise ValueError("Unexpected frozen numerical gate")
    return lock


def tool_environment(root, java_home):
    # Remove environment hooks that can inject JVM options or alternate Maven settings.
    ignored = {
        "JAVA_HOME", "JRE_HOME", "JAVACMD", "JAVA_TOOL_OPTIONS", "_JAVA_OPTIONS",
        "JDK_JAVA_OPTIONS", "CLASSPATH", "MAVEN_OPTS", "MAVEN_ARGS", "MAVEN_HOME",
        "MAVEN_CONFIG", "MAVEN_BASEDIR", "MAVEN_EXT_CLASS_PATH", "M2_HOME",
        "JAVA_OPTS", "JDK_JAVAC_OPTIONS", "TMPDIR", "TEMP", "TMP",
    }
    env = {key: value for key, value in os.environ.items() if key.upper() not in ignored}
    home, temp = root / "java-home", root / "java-tmp"
    home.mkdir()
    temp.mkdir()
    env.update({"JAVA_HOME": str(java_home),
                "TMPDIR": str(temp), "TEMP": str(temp), "TMP": str(temp)})
    return env, [f"-Duser.home={home}", f"-Djava.io.tmpdir={temp}",
                 "-Dfile.encoding=UTF-8", "-Duser.language=en", "-Duser.country=US"]


def command(root, step, argv, cwd, env, status):
    print(f"Running {step}", file=sys.stderr)
    stdout = root / "logs" / f"{step}.stdout.log"
    stderr = root / "logs" / f"{step}.stderr.log"
    entry = {"name": step, "state": "started",
             "stdout": stdout.relative_to(root).as_posix(), "stderr": stderr.relative_to(root).as_posix()}
    status.append(entry)
    with stdout.open("xb") as out, stderr.open("xb") as err:
        result = subprocess.run([str(item) for item in argv], cwd=cwd, env=env, stdout=out, stderr=err,
                                stdin=subprocess.DEVNULL, check=False)
    entry["exitCode"] = result.returncode
    entry["state"] = "completed" if result.returncode == 0 else "failed"
    if result.returncode != 0:
        raise RuntimeError(f"{step} failed with exit {result.returncode}; see {entry['stderr']}")
    return stdout, stderr


def java_identity(log, java_home):
    values = {}
    for line in log.read_text(encoding="utf-8", errors="replace").splitlines():
        key, separator, value = line.strip().partition(" = ")
        if separator:
            values[key] = value
    os_name = values.get("os.name", "")
    architecture = values.get("os.arch", "").lower()
    supported = (
        os_name.startswith("Mac") and architecture in ("aarch64", "arm64")
        or os_name.startswith(("Linux", "Windows")) and architecture in ("amd64", "x86_64")
    )
    if (
        not supported or values.get("java.version") != "25.0.5"
        or values.get("java.vendor") != "Eclipse Adoptium"
        or values.get("java.runtime.version") not in ("25.0.5+8-LTS", "25.0.5+8")
        or "java.home" not in values or Path(values["java.home"]).resolve(strict=True) != java_home
    ):
        raise ValueError("Expected a native Temurin JDK 25.0.5+8 home on a supported platform")
    return {key: values[key] for key in ("java.version", "java.runtime.version", "java.vendor",
                                        "os.name", "os.arch")}


def maven_command(root, harness, java_prefix, maven_home):
    # Invoke Maven's distribution entry point directly. This avoids a shell or a .cmd
    # wrapper interpreting a caller path, including on Windows.
    boot = maven_home / "boot" / "plexus-classworlds-2.12.1.jar"
    config = maven_home / "bin" / "m2.conf"
    if not boot.is_file() or not config.is_file():
        raise ValueError("Expected an Apache Maven 3.10.0 distribution home")
    settings = root / "maven-settings.xml"
    settings.write_text(
        '<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"><mirrors><mirror>'
        '<id>pinned-central</id><mirrorOf>*</mirrorOf>'
        f'<url>{MAVEN_CENTRAL}</url>'
        '</mirror></mirrors></settings>\n', encoding="utf-8",
    )
    globals_file = root / "maven-global-settings.xml"
    globals_file.write_text('<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"/>\n',
                            encoding="utf-8")
    return [*java_prefix, "--enable-native-access=ALL-UNNAMED", "-classpath", boot,
            f"-Dclassworlds.conf={config}", f"-Dmaven.home={maven_home}",
            f"-Dmaven.multiModuleProjectDirectory={harness}",
            "org.codehaus.plexus.classworlds.launcher.Launcher",
            "-B", "-ntp", "-C", "-s", settings, "-gs", globals_file,
            f"-Dmaven.repo.local={root / 'maven-cache'}"]


def verify_classpath(classpath_file, cache, expected):
    if len(expected) != 69 or len({row["coordinate"] for row in expected}) != len(expected):
        raise ValueError("Expected 69 unique locked runtime Maven coordinates")
    raw = classpath_file.read_text(encoding="utf-8").strip().split(os.pathsep)
    if len(raw) != len(expected):
        raise ValueError(f"Resolved classpath has {len(raw)} JARs; expected {len(expected)}")
    verified = []
    for path_text, row in zip(raw, expected):
        coordinate = row["coordinate"]
        if not re.fullmatch(r"[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+", coordinate):
            raise ValueError("Invalid Maven coordinate in lock")
        group, artifact, version = coordinate.split(":")
        expected_path = cache.joinpath(*group.split("."), artifact, version, f"{artifact}-{version}.jar")
        path = Path(path_text).resolve(strict=True)
        if (
            path != expected_path or not path.is_file() or path.stat().st_size != row["bytes"]
            or sha256(path) != row["sha256"]
        ):
            raise ValueError(f"Runtime dependency bytes or classpath order differ at {coordinate}")
        verified.append(path)
    return verified


def java_stage(root, step, main_class, arguments, receipt_path, java, classpath, harness, env, summary):
    try:
        command(root, step, [*java, "-Xmx2g", "-cp", classpath, main_class, *arguments],
                harness, env, summary["steps"])
    finally:
        if receipt_path.is_file():
            summary["receipts"][step] = manifest(receipt_path, root)
    receipt = read_json(receipt_path)
    if receipt.get("completed") is not True:
        raise ValueError(f"Native receipt did not complete: {step}")
    return receipt


def require_cases(receipt, labels):
    cases = receipt.get("cases", [])
    if [case["label"] for case in cases] != labels or any(
        case.get("completed") is not True for case in cases
    ):
        raise ValueError("Unexpected or incomplete calculation cases")
    return cases


def selected_jrc_observations(case):
    by_uuid = {flow["flowUuid"]: flow for flow in case["selectedFlows"]}
    return {
        label: {
            "uuid": uuid,
            "coordinates": [
                {"signedInventory": value["signedTotalInventory"],
                 "viewInventory": value["viewTotalInventory"],
                 "flowType": value["coordinate"]["flowType"]}
                for value in by_uuid[uuid]["coordinates"]
            ],
        }
        for label, uuid in FLOW_REFS.items()
    }


def run(root, args, summary):
    if os.pathsep in str(root):
        raise ValueError("The work path contains the platform's Java classpath separator")
    harness = root / "modules" / "harness"
    lock = stage_code(root, harness)
    summary["authoredFiles"] = lock["authoredFiles"]
    summary["dependencyLockSha256"] = sha256(PACKAGE / "dependencies.lock.json")
    summary["dependencyRepository"] = MAVEN_CENTRAL

    java_home = args.java_home.resolve(strict=True)
    maven_home = args.maven_home.resolve(strict=True)
    extension = ".exe" if os.name == "nt" else ""
    java_binary = java_home / "bin" / ("java" + extension)
    if not java_binary.is_file() or not (java_home / "bin" / ("javac" + extension)).is_file():
        raise ValueError("--java-home must name an extracted JDK home containing java and javac")
    env, java_options = tool_environment(root, java_home)
    java = [java_binary, *java_options]
    _, java_log = command(root, "java-version", [*java, "-XshowSettings:properties", "-version"],
                          harness, env, summary["steps"])
    summary["java"] = {**java_identity(java_log, java_home), "launcherSha256": sha256(java_binary)}
    maven = maven_command(root, harness, java, maven_home)
    maven_log, _ = command(root, "maven-version", [*maven, "-v"], harness, env, summary["steps"])
    if f"Apache Maven {MAVEN_BUILD}" not in maven_log.read_text(encoding="utf-8", errors="replace"):
        raise ValueError("Expected the Apache Maven 3.10.0 release")
    summary["maven"] = MAVEN_BUILD

    bottle = prepare(harness, "inspect-backup", "bottle-inspect-04", args.bottle)
    jrc = prepare(harness, "inspect-eilcd", "jrc-inspect-03", args.jrc)
    summary["inputs"] = {
        mode: read_json(path / "preflight.json")
        for mode, path in (("bottle", bottle), ("jrc", jrc))
    }
    target = harness / "target"
    target.mkdir()
    classpath_file = target / "classpath.txt"
    command(root, "resolve-classpath", [*maven, DEPENDENCY_GOAL, f"-Dmdep.outputFile={classpath_file}"],
            harness, env, summary["steps"])
    cache = root / "maven-cache"
    verify_classpath(classpath_file, cache, lock["classpath"])
    command(root, "compile", [*maven, "compile"], harness, env, summary["steps"])
    classpath = os.pathsep.join(str(path) for path in [
        target / "classes", *verify_classpath(classpath_file, cache, lock["classpath"])
    ])
    summary["verifiedRuntimeJars"] = lock["classpath"]

    for mode, path in (("inspect-backup", bottle), ("inspect-eilcd", jrc)):
        receipt = java_stage(root, mode, "evidence.Inspect", [mode, path],
                             path / "native" / "inspection.json", java, classpath, harness, env, summary)
        if receipt.get("stagedInputPreserved") is not True or not re.fullmatch(
            r"[0-9a-f]{64}", receipt.get("closedDatabaseTreeSha256", "")
        ):
            raise ValueError(f"Missing native input preservation receipt: {mode}")
    bottle_receipt = java_stage(
        root, "calculate-bottle", "evidence.Calculate", ["calculate-bottle", bottle, "bottle-calc-02"],
        harness / "runs/bottle-calc-02/calculation.json", java, classpath, harness, env, summary,
    )
    bottle_cases = require_cases(bottle_receipt, ["material-none", "opposite-none", "material-economic"])
    jrc_receipt = java_stage(
        root, "calculate-eilcd", "evidence.Calculate", ["calculate-eilcd", jrc, "jrc-calc-02"],
        harness / "runs/jrc-calc-02/calculation.json", java, classpath, harness, env, summary,
    )
    jrc_cases = require_cases(jrc_receipt, ["imported-baseline", "omit-all-overrides", "weight-one-control"])
    if any(receipt.get("inspectionDbPreserved") is not True for receipt in (bottle_receipt, jrc_receipt)):
        raise ValueError("Missing inspected database preservation receipt")
    probe_receipt = java_stage(
        root, "probe-bottle", "evidence.Probe",
        [bottle, "bottle-probes-01", lock["authoredFiles"]["README-probe.md"]],
        harness / "runs/bottle-probes-01/probe.json", java, classpath, harness, env, summary,
    )
    probe_cases = require_cases(probe_receipt, [
        "source-0.065", "removed-saved-waste-link", "diagnostic-factor-positive",
        "diagnostic-factor-explicit-zero", "diagnostic-factor-absent", "jsonld-original-target",
        "eilcd-original-target", "source-0.13", "jsonld-doubled-target", "eilcd-doubled-target",
    ])
    if probe_receipt.get("inspectionDatabasePreserved") is not True:
        raise ValueError("Missing probe source database preservation receipt")
    trips = probe_receipt["roundTrips"]
    if [trip["label"] for trip in trips] != [
        "jsonld-original-target", "eilcd-original-target", "jsonld-doubled-target", "eilcd-doubled-target",
    ] or any(trip.get("completed") is not True for trip in trips):
        raise ValueError("Unexpected or incomplete native round trips")
    summary["cases"] = {
        "bottle": [case["label"] for case in bottle_cases],
        "jrc": [case["label"] for case in jrc_cases],
        "probe": [case["label"] for case in probe_cases],
    }
    summary["observations"] = {
        "jrcImportedBaseline": selected_jrc_observations(jrc_cases[0]),
        "roundTrips": [
            {"label": trip["label"], "format": trip["format"], "scope": trip["exportScope"],
             "storedTarget": trip["imported"]["targetAmount"],
             "targetUnit": trip["imported"]["targetUnit"],
             "impactMethodCount": trip["finalImpactMethodCount"]}
            for trip in trips
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bottle", required=True, type=Path, help="caller-supplied original GreenDelta .zolca")
    parser.add_argument("--jrc", required=True, type=Path, help="caller-supplied original JRC eILCD SDK ZIP")
    parser.add_argument("--workdir", required=True, type=Path, help="absolute, nonexistent private directory")
    parser.add_argument("--java-home", required=True, type=Path, help="extracted Temurin JDK 25.0.5+8 home")
    parser.add_argument("--maven-home", required=True, type=Path, help="extracted Apache Maven 3.10.0 home")
    args = parser.parse_args()
    os.umask(0o077)
    try:
        root = new_workdir(args.workdir)
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\n")
    (root / "logs").mkdir()
    summary = {"schema": "native-exchange-reproduction-v1", "completed": False, "steps": [], "receipts": {}}
    try:
        run(root, args, summary)
        summary["completed"] = True
    except (OSError, ValueError, RuntimeError, KeyError, TypeError, KeyboardInterrupt) as error:
        summary["error"] = f"{type(error).__name__}: {error}"
    write_json(root / "run-summary.json", summary)
    print(json.dumps({"completed": summary["completed"], "summary": str(root / "run-summary.json")},
                     ensure_ascii=False))
    return 0 if summary["completed"] else 1


if __name__ == "__main__":
    sys.exit(main())
