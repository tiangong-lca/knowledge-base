import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRedirectHtml } from './export.mjs';

test('renderRedirectHtml distinguishes neutral route relocation from chapter merge', () => {
  const relocated = renderRedirectHtml({
    from: '/docs',
    to: '/zh/docs',
    title: '全书正文',
    kind: 'relocate',
  });
  assert.match(relocated, /页面已迁至新地址/);
  assert.doesNotMatch(relocated, /本章已合并/);
  assert.match(relocated, /href="\/zh\/docs\/"/);

  const merged = renderRedirectHtml({
    from: '/docs/book/framework-history',
    to: '/zh/docs/book/framework-responsibilities',
    title: '评价框架与分析步骤',
  });
  assert.match(merged, /本章已合并至《评价框架与分析步骤》/);
  assert.doesNotMatch(merged, /页面已迁至新地址/);
  assert.match(merged, /href="\/zh\/docs\/book\/framework-responsibilities\/"/);
});
