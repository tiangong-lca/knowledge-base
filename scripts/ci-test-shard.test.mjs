import assert from 'node:assert/strict';
import test from 'node:test';

import { discoverScriptTests, selectTestShard } from './ci-test-shard.mjs';

test('CI test shards deterministically partition all scripts/*.test.mjs without gaps or overlap', () => {
  const all = discoverScriptTests();
  assert.ok(all.length >= 2, 'expected multiple script test files');
  assert.ok(all.includes('scripts/ci-test-shard.test.mjs'));

  const shard1 = selectTestShard(all, 1, 2);
  const shard2 = selectTestShard(all, 2, 2);
  const combined = [...shard1, ...shard2].sort((a, b) => a.localeCompare(b));

  assert.equal(new Set(combined).size, all.length);
  assert.deepEqual(combined, all);
  assert.ok(Math.abs(shard1.length - shard2.length) <= 1);
});

test('CI test shard selection rejects invalid shard bounds', () => {
  assert.throws(() => selectTestShard(['scripts/a.test.mjs'], 0, 2));
  assert.throws(() => selectTestShard(['scripts/a.test.mjs'], 3, 2));
  assert.throws(() => selectTestShard(['scripts/a.test.mjs'], 1, 0));
});
