import { createHash } from 'node:crypto';

// The complete capture from the clean dd715663 edition, including its source identity and ordered claims.
// Hash the parsed JSON representation so checkout line endings do not affect the integrity check.
const frozenBaselineDigest = 'aa9539cdeca6076e14c3e73b87d8caa4e104af7b656e50c63cff8dfb5f0cd18a';

/** @param {unknown} baseline */
export function assertCitationBaseline(baseline) {
  const digest = createHash('sha256').update(JSON.stringify(baseline) ?? '').digest('hex');
  if (digest !== frozenBaselineDigest) throw new Error('Reader citation baseline differs from the frozen 2026-11-07 edition');
}

/** @param {unknown} frontMatter */
export function assertPrintFrontMatter(frontMatter) {
  if (JSON.stringify(frontMatter) !== '["/docs","/docs/book"]')
    throw new Error('Printed front matter must contain the preface and guide in their approved order');
}
