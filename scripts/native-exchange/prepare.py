#!/usr/bin/env python3
"""Verify an original and stage one read-only copy for native inspection."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
from zipfile import ZIP_DEFLATED, ZIP_STORED, ZipFile

INPUTS = {
    "inspect-backup": (
        "bottle/originals/Master_bottles_solved_20200319.zolca",
        "a0890da2c89377d3edfa6a6505fa6ab7ad7eaf1bd628404821e3df5b32a7314b",
        159820093, 1212, 453400954,
    ),
    "inspect-eilcd": (
        "jrc/original/eILCD-SDK_v2.1.1.zip",
        "590882f8bda2ec4f0fb3d0ad757001f0d9ac2ccef5a2f4e46cad2d8184c464d0",
        3364733, 357, 12070218,
    ),
}


def check_archive(archive, mode, member_count, total_size):
    seen = set()
    spellings = {}
    regular_members = set()
    total = 0
    with ZipFile(archive) as contents:
        members = contents.infolist()
        if len(members) != member_count:
            raise ValueError(f"Unexpected member count {len(members)}")
        for member in members:
            raw = member.orig_filename
            parts = raw.rstrip("/").split("/")
            if (
                raw != member.filename or len(raw) > 256
                or not all(p not in ("", ".", "..") for p in parts)
                or any(c in raw for c in ("\\", ":", "\x00"))
                or any(ord(c) < 32 for c in raw)
            ):
                raise ValueError(f"Unsafe member path {raw!r}")
            path = PurePosixPath(*parts)
            for prefix in (*path.parents, path):
                name = str(prefix)
                if spellings.setdefault(name.casefold(), name) != name:
                    raise ValueError(f"Case collision at {name!r}")
            if path in seen:
                raise ValueError(f"Duplicate member {raw!r}")
            seen.add(path)
            expected_kind = stat.S_IFDIR if member.is_dir() else stat.S_IFREG
            actual_kind = stat.S_IFMT(member.external_attr >> 16)
            if actual_kind not in (0, expected_kind):
                raise ValueError(f"Unsupported member type {raw!r}")
            if member.flag_bits & 1 or member.compress_type not in (ZIP_DEFLATED, ZIP_STORED):
                raise ValueError(f"Unsupported encoding for {raw!r}")
            if member.file_size > 128 * 1024**2:
                raise ValueError(f"Member exceeds size limit {raw!r}")
            if member.is_dir():
                if member.file_size:
                    raise ValueError(f"Directory member has content {raw!r}")
            else:
                regular_members.add(path)
            total += member.file_size
        if total != total_size or any(
            parent in regular_members for member in seen for parent in member.parents
        ):
            raise ValueError("Unexpected archive size or file/directory conflict")
        for member in members:
            if member.is_dir():
                continue
            with contents.open(member) as stream:
                if mode == "inspect-eilcd" and member.filename.lower().endswith(".xml"):
                    # All source XML is pinned. Reject DTD/entity declarations before JAXB.
                    source = stream.read()
                    if b"\0" in source or re.search(rb"<!\s*(DOCTYPE|ENTITY)\b", source, re.I):
                        raise ValueError(f"Unsupported XML declarations {member.filename!r}")
                else:
                    while stream.read(1024**2):
                        pass
    return {"members": member_count, "expandedBytes": total, "allMemberCrcsVerified": True}


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024**2), b""):
            digest.update(block)
    return digest.hexdigest()


def prepare(harness, mode, name, original):
    """Stage an exact input in the directory structure expected by Inspect."""
    if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}", name):
        raise ValueError("Invalid run name")
    rel_source, expected_sha, size, count, expanded = INPUTS[mode]
    original = original.resolve(strict=True)
    if not original.is_file() or original.stat().st_size != size:
        raise ValueError(f"Expected an ordinary {size}-byte file for {mode}")
    runs = harness / "runs"
    runs.mkdir(exist_ok=True)
    if runs.resolve(strict=True) != runs:
        raise ValueError("Run storage must be an ordinary local directory")
    run = runs / name
    run.mkdir()
    staged = run / "input.zip"
    with original.open("rb") as source, staged.open("xb") as target:
        shutil.copyfileobj(source, target, length=1024**2)
        target.flush()
        os.fsync(target.fileno())
    if staged.stat().st_size != size or sha256(staged) != expected_sha:
        raise ValueError(f"Input size or SHA-256 differs from the pinned {mode} archive")
    staged.chmod(0o400)
    receipt = check_archive(staged, mode, count, expanded)
    with (run / "preflight.json").open("x", encoding="utf-8") as out:
        json.dump({"mode": mode, "sha256": expected_sha, "bytes": size,
                   "sourceFileName": PurePosixPath(rel_source).name,
                   "staged": "input.zip", **receipt}, out, indent=2)
        out.write("\n")
    return run
