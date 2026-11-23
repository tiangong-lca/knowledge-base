import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyCatalogAndMdxTransform,
  assertNoInternalIds,
  validateMdxInvariants,
} from './revision-apply.mjs';
import { extractRenderedArticleText } from './reader-extract-text.mjs';

function makeFixture() {
  const origCatalog = {
    claims: [
      { id: 'cl-a', text: 'First claim.', kind: 'fact', scope: 's1', evidenceIds: ['ev-1'], evidenceLinks: [{ evidenceId: 'ev-1', relation: 'supports' }], premiseIds: [], conceptIds: [], caveats: ['c1'], status: 'reviewed', reviewKind: 'agent-source-check', reviewedAt: '2026-11-01' },
      { id: 'cl-b', text: 'Second claim.', kind: 'interpretation', scope: 's2', evidenceIds: ['ev-2'], evidenceLinks: [{ evidenceId: 'ev-2', relation: 'supports' }], premiseIds: ['cl-a'], conceptIds: [], caveats: [], status: 'reviewed', reviewKind: 'agent-source-check', reviewedAt: '2026-11-01' },
      { id: 'cl-cb', text: 'Case bound claim.', kind: 'calculation', scope: 's3', evidenceIds: [], evidenceLinks: [], premiseIds: ['cl-a'], conceptIds: [], caveats: [], caseBinding: { caseId: 'CASE-X', version: '1.0.0', inputSha256: 'a'.repeat(64), inputFile: 'x.json' }, status: 'reviewed', reviewKind: 'agent-source-check', reviewedAt: '2026-11-01' },
    ],
    concepts: [{ id: 'cn-1', definitionClaimIds: ['cl-a'] }],
  };
  const files = {
    'content/docs/book/sample.mdx': '---\ntitle: Sample\n---\n\n## 第一节 [#s1]\n\n<Prose ids="cl-a cl-b cl-cb" />\n',
    'knowledge/cases/x.publication.json': '{"caseId":"CASE-X","claims":[]}\n',
  };
  return { origCatalog, readBaselineFile: p => files[p] };
}

test('revision-apply updates prose, scope, caveats, and mdxEdits cleanly', () => {
  const { origCatalog, readBaselineFile } = makeFixture();
  const res = applyCatalogAndMdxTransform({
    spec: {
      id: 'test-rev',
      date: '2026-11-22',
      rationale: '整合改写测试说明。',
      routes: ['/docs/book/sample'],
      updates: {
        'cl-b': {
          chapter: '/docs/book/sample',
          text: 'Updated second claim.',
          scope: 'Updated scope.',
          replaceCaveats: ['New caveat.'],
          premiseIds: ['cl-a'],
          correctionScope: '压实段落并更新注释范围。',
        },
      },
      mdxEdits: {
        'content/docs/book/sample.mdx': [{ old: '## 第一节 [#s1]', new: '## 第一节 [#s1]' }],
      },
    },
    origCatalog,
    readBaselineFile,
  });

  const updated = res.newCatalog.claims.find(c => c.id === 'cl-b');
  assert.equal(updated.text, 'Updated second claim.');
  assert.equal(updated.scope, 'Updated scope.');
  assert.deepEqual(updated.caveats, ['New caveat.']);
  assert.equal(res.revisionClaims.length, 1);
  assert.equal(res.revisionFiles.length, 1);
});

test('revision-apply refuses caseBinding modification unless explicitly authorized with publication transition', () => {
  const { origCatalog, readBaselineFile } = makeFixture();
  const baseSpec = {
    id: 'test-cb',
    date: '2026-11-22',
    rationale: '算例维护说明。',
    routes: ['/docs/book/sample'],
    updates: {
      'cl-cb': {
        chapter: '/docs/book/sample',
        text: 'Updated case claim.',
        correctionScope: '更新算例文字。',
      },
    },
  };

  assert.throws(
    () => applyCatalogAndMdxTransform({ spec: baseSpec, origCatalog, readBaselineFile, allowCaseBinding: false }),
    /FORBIDDEN: attempted to modify caseBinding claim cl-cb/,
  );

  // Also refused if allowCaseBinding=true but no publication fileTransition is provided
  assert.throws(
    () => applyCatalogAndMdxTransform({ spec: baseSpec, origCatalog, readBaselineFile, allowCaseBinding: true }),
    /FORBIDDEN: attempted to modify caseBinding claim cl-cb/,
  );

  // Allowed when BOTH allowCaseBinding=true AND publication fileTransition are present
  const ok = applyCatalogAndMdxTransform({
    spec: {
      ...baseSpec,
      fileTransitions: [{ path: 'knowledge/cases/x.publication.json', content: '{"caseId":"CASE-X","claims":["ok"]}\n' }],
    },
    origCatalog,
    readBaselineFile,
    allowCaseBinding: true,
  });
  assert.equal(ok.newCatalog.claims.find(c => c.id === 'cl-cb').text, 'Updated case claim.');
  assert.equal(ok.revisionFiles[0].path, 'knowledge/cases/x.publication.json');
});

test('Clean-Delivery guard rejects internal cl- IDs in rationale and correctionScope', () => {
  assert.throws(() => assertNoInternalIds('rationale', 'Updated cl-foo-bar wording'), /Clean-Delivery violation/);
  const { origCatalog, readBaselineFile } = makeFixture();
  assert.throws(
    () =>
      applyCatalogAndMdxTransform({
        spec: {
          id: 'test-leak',
          date: '2026-11-22',
          rationale: '无泄露说明。',
          routes: ['/docs/book/sample'],
          updates: {
            'cl-b': {
              chapter: '/docs/book/sample',
              text: 'Clean text.',
              correctionScope: '修改 cl-b 的表述',
            },
          },
        },
        origCatalog,
        readBaselineFile,
      }),
    /Clean-Delivery violation/,
  );
});

test('validateMdxInvariants rejects H2 count/anchor changes and forward premises', () => {
  const { origCatalog } = makeFixture();
  const claimMap = new Map(origCatalog.claims.map(c => [c.id, c]));
  const orig = '## 第一节 [#s1]\n\n<Prose ids="cl-a cl-b" />\n';

  assert.throws(
    () => validateMdxInvariants('a.mdx', orig, '## 第一节 [#s1]\n## 第二节 [#s2]\n<Prose ids="cl-a cl-b" />\n', claimMap),
    /H2 count changed/,
  );
  assert.throws(
    () => validateMdxInvariants('a.mdx', orig, '## 第一节 [#changed]\n\n<Prose ids="cl-a cl-b" />\n', claimMap),
    /H2 anchor changed/,
  );
  assert.throws(
    () => validateMdxInvariants('a.mdx', orig, '## 第一节 [#s1]\n\n<Prose ids="cl-b cl-a" />\n', claimMap),
    /Forward premise/,
  );
});

test('extractRenderedArticleText extracts headings, paragraphs, tables, and ignores nav/script', () => {
  const html = `
    <html><body>
      <nav>Skip navigation</nav>
      <main id="main-content">
        <article data-reader-route="/docs/book/sample">
          <h1>示例章</h1>
          <script>window.__ignored = true;</script>
          <h2>第一节</h2>
          <p>第一段正文。</p>
          <table><tr><th>指标</th><th>数值</th></tr><tr><td>气候</td><td>1.2</td></tr></table>
        </article>
      </main>
    </body></html>
  `;
  const text = extractRenderedArticleText(html);
  assert.match(text, /# 示例章/);
  assert.match(text, /## 第一节/);
  assert.match(text, /第一段正文。/);
  assert.match(text, /\| 指标 \| 数值 \|/);
  assert.match(text, /\| 气候 \| 1\.2 \|/);
  assert.doesNotMatch(text, /Skip navigation/);
  assert.doesNotMatch(text, /__ignored/);
});
