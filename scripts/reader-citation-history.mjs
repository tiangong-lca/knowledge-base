import { createHash } from 'node:crypto';

// Complete note-family reconstruction at published Main a36597d, not a historical
// HTML capture. This independent pin includes source/code hashes and all 44 pages.
// Do not regenerate from current prose when another book unit moves.
const frozenHistoryDigest = 'ada2f259e872c51187391784f799fbdcea85a31f8bee70cc29cb787df0b29642';

/** @param {unknown} history */
export function assertCitationHistory(history) {
  const digest = createHash('sha256').update(JSON.stringify(history) ?? '').digest('hex');
  if (digest !== frozenHistoryDigest) throw new Error('Reader canonical citation history differs from the published a36597d reconstruction');
}
