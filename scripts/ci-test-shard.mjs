import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function discoverScriptTests(root = process.cwd()) {
  const scriptsDir = resolve(root, 'scripts');
  return readdirSync(scriptsDir)
    .filter((entry) => entry.endsWith('.test.mjs'))
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => `scripts/${entry}`);
}

export function selectTestShard(files, shardIndex, totalShards) {
  if (!Number.isInteger(totalShards) || totalShards < 1) {
    throw new Error(`--total must be a positive integer; received ${String(totalShards)}`);
  }
  if (!Number.isInteger(shardIndex) || shardIndex < 1 || shardIndex > totalShards) {
    throw new Error(
      `--shard must be an integer between 1 and ${String(totalShards)}; received ${String(shardIndex)}`,
    );
  }
  return files.filter((_, index) => (index % totalShards) + 1 === shardIndex);
}

function parseArgs(argv) {
  let shard = 1;
  let total = 1;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--shard') {
      shard = Number(argv[i + 1]);
      i += 1;
    } else if (arg === '--total') {
      total = Number(argv[i + 1]);
      i += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  return { shard, total };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { shard, total } = parseArgs(process.argv.slice(2));
  const allTests = discoverScriptTests();
  const selected = selectTestShard(allTests, shard, total);
  if (selected.length === 0) {
    throw new Error(`Shard ${shard}/${total} resolved zero test files.`);
  }
  process.stdout.write(
    `Running knowledge-base test shard ${shard}/${total} (${selected.length}/${allTests.length} files)\n`,
  );
  const result = spawnSync(process.execPath, ['--test', ...selected], {
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
