---
title: Native openLCA exchange reproduction
docType: reference
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: en
whenToUse:
  - when replaying the bottle and JRC native exchange case
whenToUpdate:
  - when the native driver, pinned inputs, runtime, or checked cases change
checkPaths:
  - "scripts/native-exchange/**"
  - "_docs/reproduction/native-exchange/**"
---

# Replay the native openLCA exchange case

Use Python 3.9 or later on macOS or Linux, **CPython 3.13 or later on Windows**, Eclipse Temurin JDK **25.0.5+8**, Apache Maven **3.10.0**, and a private directory with several gigabytes free. The original execution used macOS arm64. The launcher also admits Linux x64 and Windows x64 with the pinned runtimes. Their results require separate qualification. On Windows choose a private parent on an ACL-capable filesystem; CPython 3.13 implements the owner/administrator access control requested by directory mode 0700. [Python 3.13 directory permissions](https://docs.python.org/3.13/library/os.html#os.mkdir)

Obtain the two exact original archives under their applicable terms. Supply them as files with any local names. The driver checks their SHA-256, sizes, ZIP member paths and CRCs.

| Original | SHA-256 |
| --- | --- |
| [GreenDelta March 2020 solved bottle backup](https://www.openlca.org/wp-content/uploads/2025/02/Master_bottles_solved_20200319.zolca) | `a0890da2c89377d3edfa6a6505fa6ab7ad7eaf1bd628404821e3df5b32a7314b` |
| [JRC eILCD SDK 2.1.1](https://eplca.jrc.ec.europa.eu/LCDN/downloads/eILCD-SDK_v2.1.1.zip) | `590882f8bda2ec4f0fb3d0ad757001f0d9ac2ccef5a2f4e46cad2d8184c464d0` |

From the checkout root, give the [launcher](../../../scripts/native-exchange/run.py) an absolute work path whose parent already exists. Use the extracted JDK directory containing `bin/java` and `bin/javac` (normally `Contents/Home` on macOS) and the extracted Maven distribution directory. Replace the example paths. On Windows, use the equivalent absolute paths and `python` or `py -3`.

```sh
python3 scripts/native-exchange/run.py \
  --bottle "/path/to/private/Master_bottles_solved_20200319.zolca" \
  --jrc "/path/to/private/eILCD-SDK_v2.1.1.zip" \
  --workdir "/path/to/private/new-native-exchange-run" \
  --java-home "/path/to/temurin-jdk-home" \
  --maven-home "/path/to/apache-maven-3.10.0"
```

The driver resolves Maven dependencies only through Maven Central into the new work directory. It verifies the 69 resolved runtime JARs before compilation and again before Java execution. The driver accepts original archives from the caller. The static book build uses separately reviewed observations.

The Java adapters call the official openLCA core and I/O 2.7.0 modules with JavaSolver. The bottle database is copied and migrated from schema 8 to 15. The 2020 tutorial identifies openLCA 1.10 without specifying a patch. The vendor’s 1.10.2 and 1.10.3 packages contain different module bytes, even though they share the 1.9.0 module version label. This procedure establishes behavior for the migrated copy in 2.7.0. [Module source](https://github.com/GreenDelta/olca-modules/tree/0cee8c739a6f98642761fb72e25bbcfb11f90be2) · [Vendor releases](https://www.openlca.org/download/)

Check `run-summary.json` for the status of each stage and the hashes and paths of the fresh native receipts. Inspect the raw receipts and logs in the private work directory. Use the [baseline comparisons](../../../scripts/native-exchange/numerical-gate.md) and [probe comparisons](../../../scripts/native-exchange/README-probe.md) to assess the observations. Database tree digests, receipt bytes and generated UUIDs are specific to the run. Compare portable source identities, coordinates, settings, and selected values.

The JRC case retains the fossil CO₂ and CO discrepancies associated with the uncalculated end-of-life treatment process. The stored link resolves, while the native inventory leaves the machine product flow open. The JSON-LD round trip includes the original CML method. The eILCD self-round trip exports only the system and its references, uses openLCA extensions as emitted, and has inventory scope. The separate diagnostic factor is an information-presence control. For each result retain its source and format scope.

A complete portable replay was qualified on macOS arm64 in a fresh work path
containing spaces. Inputs, all 69 runtime JARs and the three Java adapters matched
the original execution. Signed numerical comparisons retained the JRC gas
discrepancy and eILCD target reset. A municipal-waste aggregate row's input flag
also varied across JSON-LD replays despite unchanged exchange fields and signed
values. The nonregional index retains the first encountered side for that flow;
the actual first exchange was not traced. Compare this result metadata separately
from signed matrices and inventory, without attributing it to the target change
or exclusively to one format. Selected observations and receipt identities are
in the [versioned case](../../../knowledge/cases/native-exchange-v1.json).

Keep the original archives, copied Derby databases, logs, complete exports, and raw receipts private. The repository’s authored code license covers the adapters. openLCA code and source data keep their own licenses. GreenDelta’s public download does not establish rights to redistribute the embedded datasets or factor tables. The JRC example carries a noncommercial import/export testing condition. The caller owns the work directory and may remove it once the required private evidence is retained.

## 中文复现说明

macOS 和 Linux 使用 Python 3.9 或更高版本；Windows 要求 CPython 3.13 或更高版本，并使用支持访问控制的私有父目录。另需 Temurin JDK 25.0.5+8 和 Maven 3.10.0。从有权取得的原始载体保存上表两个文件，按上述命令给出它们的路径和工具目录。工作目录须在 Git 工作树之外，父目录已存在，末级目录尚不存在。启动器从 Maven Central 在工作目录内取得依赖，核验 69 个运行时 JAR 的字节身份，并在此目录内完成原件检查、数据库复制、导入、求解及对照。已有实测环境为 macOS arm64。

查看 `run-summary.json` 和其中指向的私有回执。数据库、自动生成的 UUID 和回执哈希随运行记录而异；比较原件、固定设置、坐标和选定数值。该程序使用 openLCA 2.7.0 求解迁移后的瓶子数据库；2020 年教程仅注明 1.10，未注明补丁版本。JRC 案例保留化石 CO₂、CO 与原件计算之间的差额及未进入求解的机器报废处理。JSON-LD 路径携带原 CML 方法；eILCD 路径使用 openLCA 原生扩展，导出系统及依赖并检查清单。原件、数据库、日志和完整重导出由运行者私下保管并按源许可处理。站点构建不运行此程序。
