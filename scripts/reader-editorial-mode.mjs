/**
 * Clean Public Delivery & Editorial History Separation (Goal §2.15, #166).
 *
 * Default production builds render ONLY the finished monograph on /docs/book/**
 * and /print/, consolidating all iteration history and named corrections on
 * /changes/. Set READER_EDITORIAL_HISTORY=1 only for local editorial-audit builds.
 */
export function showEditorialHistoryInProse(env = process.env) {
  return env?.READER_EDITORIAL_HISTORY === '1';
}

let cleanDeliveryValidationDepth = 0;

/**
 * True only while validateCitationOutput is validating a default Clean Public
 * Delivery export (where validateCleanDeliveryOutput enforces zero inline
 * [data-legacy-scope] disclosures). Standalone historical fixture tests keep
 * their original retained-scope assertions active.
 */
export function isCleanDeliveryValidation() {
  return cleanDeliveryValidationDepth > 0;
}

export function withCleanDeliveryValidation(active, fn) {
  if (!active) return fn();
  cleanDeliveryValidationDepth += 1;
  try {
    return fn();
  } finally {
    cleanDeliveryValidationDepth -= 1;
  }
}

export const FORBIDDEN_PROSE_ATTR_PATTERNS = Object.freeze([
  /^data-copyedit-history$/,
  /^data-[a-z0-9-]+-history$/,
  /^data-part\d+-reread-part$/,
  /^data-[a-z0-9-]+-correction$/,
  /^data-legacy-scope$/,
]);

export const FORBIDDEN_PROSE_TEXT_PATTERNS = Object.freeze([
  /此处在\s*20\d{2}-\d{2}-\d{2}\s*版题为/,
  /20\d{2}-\d{2}-\d{2}\s*版「[^」]+」的引用范围/,
  /20\d{2}-\d{2}-\d{2}\s*版第[一二三四五六七八九十]+部导言范围/,
  /20\d{2}-\d{2}-\d{2}\s*修订：/,
  /查看(?:前|该)版源文件/,
]);
