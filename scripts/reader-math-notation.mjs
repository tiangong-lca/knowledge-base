import { createElement, Fragment } from 'react';

/**
 * Strict allowlisted mathematical, scientific-notation, and chemical-formula
 * tokenizer and React formatter for reader prose, notes, and caveats.
 *
 * Never mutates software identifiers, schema keys, file names, CSV columns, or
 * scenario codes (e.g., SDK_v2, FLOW_class, LowRECost_HighNGPrice, WASTE_FLOW,
 * PRODUCT_FLOW, lciamethods_CF, stats_arrays, tidas_processes.json).
 */

const EXACT_SUBSCRIPT_MAP = new Map([
  ['AGWP_{i_k}', { base: 'AGWP', nestedSub: { base: 'i', sub: 'k' } }],
  ['AGTP_{i_k}', { base: 'AGTP', nestedSub: { base: 'i', sub: 'k' } }],
  ['AGWP_CO₂', { base: 'AGWP', sub: 'CO₂' }],
  ['AGWP_CO2', { base: 'AGWP', sub: 'CO₂' }],
  ['WR_malnutrition', { base: 'WR', sub: 'malnutrition' }],
  ['L_v,annual', { base: 'L', sub: 'v,annual' }],
  ['Q_annual', { base: 'Q', sub: 'annual' }],
  ['CF_water', { base: 'CF', sub: 'water' }],
  ['CF_air', { base: 'CF', sub: 'air' }],
  ['m_water', { base: 'm', sub: 'water' }],
  ['m_air', { base: 'm', sub: 'air' }],
  ['SOP_URR', { base: 'SOP', sub: 'URR' }],
  ['AMD_world', { base: 'AMD', sub: 'world' }],
  ['AMD_世界', { base: 'AMD', sub: '世界' }],
  ['AMD_区域', { base: 'AMD', sub: '区域' }],
  ['AMD_X', { base: 'AMD', sub: 'X' }],
  ['AMD_Y', { base: 'AMD', sub: 'Y' }],
  ['AMD_i', { base: 'AMD', sub: 'i' }],
  ['g_CO2', { base: 'g', sub: 'CO₂' }],
  ['g_CH4', { base: 'g', sub: 'CH₄' }],
  ['g_soc', { base: 'g', sub: 'soc' }],
  ['B_soc', { base: 'B', sub: 'soc' }],
  ['N_run', { base: 'N', sub: 'run' }],
  ['GWP_H', { base: 'GWP', sub: 'H' }],
  ['E_out', { base: 'E', sub: 'out' }],
  ['E_in', { base: 'E', sub: 'in' }],
  ['CFE_x', { base: 'CFE', sub: 'x' }],
  ['t_reg', { base: 't', sub: 'reg' }],
  ['c_FW', { base: 'c', sub: 'FW' }],
  ['g_b', { base: 'g', sub: 'b' }],
  ['g_T', { base: 'g', sub: 'T' }],
  ['U_T', { base: 'U', sub: 'T' }],
  ['x_g', { base: 'x', sub: 'g' }],
  ['W_c', { base: 'W', sub: 'c' }],
  ['s_Y', { base: 's', sub: 'Y' }],
  ['A_p', { base: 'A', sub: 'p' }],
  ['S_j', { base: 'S', sub: 'j' }],
  ['s_j', { base: 's', sub: 'j' }],
  ['p_j', { base: 'p', sub: 'j' }],
  ['R_X', { base: 'R', sub: 'X' }],
  ['R_Y', { base: 'R', sub: 'Y' }],
  ['R_T', { base: 'R', sub: 'T' }],
  ['m_k', { base: 'm', sub: 'k' }],
  ['i_k', { base: 'i', sub: 'k' }],
  ['t_k', { base: 't', sub: 'k' }],
  ['E_W', { base: 'E', sub: 'W' }],
  ['F_t', { base: 'F', sub: 't' }],
  ['A_0', { base: 'A', sub: '0' }],
  ['A_1', { base: 'A', sub: '1' }],
  ['C_x', { base: 'C', sub: 'x' }],
  ['a_x', { base: 'a', sub: 'x' }],
  ['b_x', { base: 'b', sub: 'x' }],
  ['f_A', { base: 'f', sub: 'A' }],
  ['f_B', { base: 'f', sub: 'B' }],
  ['I_A', { base: 'I', sub: 'A' }],
  ['I_B', { base: 'I', sub: 'B' }],
  ['s_E', { base: 's', sub: 'E' }],
  ['σ_b²', { base: 'σ', sub: 'b', trailing: '²' }],
  ['σ_k²', { base: 'σ', sub: 'k', trailing: '²' }],
]);

const EXACT_SUPERSCRIPT_MAP = new Map([
  ['e^{(−t−3)·k}', { base: 'e', sup: '(−t−3)·k' }],
  ['e^{(-t-3)·k}', { base: 'e', sup: '(−t−3)·k' }],
  ['10^-16', { base: '10', sup: '−16' }],
  ['10^8', { base: '10', sup: '8' }],
]);

const CHEMICAL_MAP = new Map([
  ['PM2.5–10', [{ text: 'PM' }, { sub: '2.5–10' }]],
  ['PM2.5-10', [{ text: 'PM' }, { sub: '2.5–10' }]],
  ['PM2.5', [{ text: 'PM' }, { sub: '2.5' }]],
  ['PM10', [{ text: 'PM' }, { sub: '10' }]],
  ['CO2', [{ text: 'CO' }, { sub: '2' }]],
  ['CH4', [{ text: 'CH' }, { sub: '4' }]],
  ['SO2', [{ text: 'SO' }, { sub: '2' }]],
  ['NOx', [{ text: 'NO' }, { sub: 'x' }]],
  ['SOx', [{ text: 'SO' }, { sub: 'x' }]],
  ['N2O', [{ text: 'N' }, { sub: '2' }, { text: 'O' }]],
  ['NH3', [{ text: 'NH' }, { sub: '3' }]],
]);

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SUB_KEYS = [...EXACT_SUBSCRIPT_MAP.keys()].sort((a, b) => b.length - a.length);
const SUP_KEYS = [...EXACT_SUPERSCRIPT_MAP.keys()].sort((a, b) => b.length - a.length);
const CHEM_KEYS = [...CHEMICAL_MAP.keys()].sort((a, b) => b.length - a.length);

const TOKEN_RE = new RegExp(
  [
    `(?<![A-Za-z0-9_])(?:${SUP_KEYS.map(escapeRe).join('|')})(?![A-Za-z0-9_])`,
    `(?<![A-Za-z0-9_])(?:${SUB_KEYS.map(escapeRe).join('|')})(?![A-Za-z0-9_])`,
    `(?<![A-Za-z0-9_])(\\d+\\.\\d+)e([+-]?\\d+)(?![A-Za-z0-9_])`,
    `(?<![A-Za-z0-9_])(?:${CHEM_KEYS.map(escapeRe).join('|')})(?=(?:-?eq|e)?(?![A-Za-z0-9_]))`,
  ].join('|'),
  'g',
);

/**
 * Tokenizes a reader prose string into plain text segments and structured math/chemical tokens.
 * Every formatted token retains its exact `raw` substring for lossless canonical-text auditing.
 *
 * @param {string} text
 * @returns {Array<
 *   | { kind: 'text', raw: string }
 *   | { kind: 'sub', raw: string, base: string, sub?: string, nestedSub?: { base: string, sub: string }, trailing?: string }
 *   | { kind: 'sup', raw: string, base: string, sup: string }
 *   | { kind: 'sci', raw: string, mantissa: string, exp: string }
 *   | { kind: 'chem', raw: string, parts: Array<{ text?: string, sub?: string }> }
 * >}
 */
export function tokenizeMathNotation(text) {
  if (typeof text !== 'string' || !text) return text ? [{ kind: 'text', raw: text }] : [];
  const tokens = [];
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    const raw = match[0];
    const before = text.slice(Math.max(0, match.index - 120), match.index);
    if (/https?:\/\/\S*$/.test(before) || /(?:^|[\s("'\[])\/[A-Za-z0-9._\/-]*$/.test(before)) continue;

    if (match.index > lastIndex) {
      tokens.push({ kind: 'text', raw: text.slice(lastIndex, match.index) });
    }
    if (EXACT_SUPERSCRIPT_MAP.has(raw)) {
      tokens.push({ kind: 'sup', raw, ...EXACT_SUPERSCRIPT_MAP.get(raw) });
    } else if (EXACT_SUBSCRIPT_MAP.has(raw)) {
      tokens.push({ kind: 'sub', raw, ...EXACT_SUBSCRIPT_MAP.get(raw) });
    } else if (match[1] !== undefined && match[2] !== undefined) {
      const exp = match[2].replace(/^\+/, '').replace(/^-/, '−');
      tokens.push({ kind: 'sci', raw, mantissa: match[1], exp });
    } else if (CHEMICAL_MAP.has(raw)) {
      tokens.push({ kind: 'chem', raw, parts: CHEMICAL_MAP.get(raw) });
    } else {
      tokens.push({ kind: 'text', raw });
    }
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) {
    tokens.push({ kind: 'text', raw: text.slice(lastIndex) });
  }
  return tokens;
}

function renderMathToken(token, key) {
  if (token.kind === 'text') return token.raw;
  if (token.kind === 'sup') {
    return createElement(
      'span',
      { key, 'data-math-raw': token.raw },
      token.base,
      createElement('sup', null, token.sup),
    );
  }
  if (token.kind === 'sub') {
    if (token.nestedSub) {
      return createElement(
        'span',
        { key, 'data-math-raw': token.raw },
        token.base,
        createElement('sub', null, token.nestedSub.base, createElement('sub', null, token.nestedSub.sub)),
      );
    }
    return createElement(
      'span',
      { key, 'data-math-raw': token.raw },
      token.base,
      createElement('sub', null, token.sub),
      token.trailing ?? null,
    );
  }
  if (token.kind === 'sci') {
    return createElement(
      'span',
      { key, 'data-math-raw': token.raw },
      `${token.mantissa} × 10`,
      createElement('sup', null, token.exp),
    );
  }
  return createElement(
    'span',
    { key, 'data-math-raw': token.raw },
    token.parts.map((part, idx) =>
      part.sub ? createElement('sub', { key: idx }, part.sub) : createElement(Fragment, { key: idx }, part.text),
    ),
  );
}

/**
 * Formats allowlisted math subscripts/superscripts, scientific notation, and
 * chemical formulas into semantic HTML `<sub>`/`<sup>` while retaining exact
 * canonical raw text on `data-math-raw` for verification guards.
 *
 * @param {string} text
 * @returns {import('react').ReactNode}
 */
export function formatMathNotation(text) {
  const tokens = tokenizeMathNotation(text);
  if (tokens.length === 0) return '';
  if (tokens.length === 1 && tokens[0].kind === 'text') return text;
  return tokens.map((token, idx) => renderMathToken(token, idx));
}

/**
 * Formats full prose text and binds the trailing grapheme (or trailing math
 * token) together with the footnote superscript inside `.prose-reference-tail`
 * without ever splitting a math token across element boundaries.
 *
 * @param {string} text
 * @param {(value: string) => { body: string, tail: string }} splitTail
 * @param {import('react').ReactNode} referenceSup
 * @returns {import('react').ReactNode}
 */
export function formatMathWithReferenceTail(text, splitTail, referenceSup) {
  const tokens = tokenizeMathNotation(text);
  if (tokens.length === 0) {
    return createElement('span', { className: 'prose-reference-tail' }, referenceSup);
  }
  const last = tokens[tokens.length - 1];
  const head = tokens.slice(0, -1).map((token, idx) => renderMathToken(token, idx));
  if (last.kind === 'text') {
    const { body, tail } = splitTail(last.raw);
    return createElement(
      Fragment,
      null,
      head,
      body,
      createElement('span', { className: 'prose-reference-tail' }, tail, referenceSup),
    );
  }
  return createElement(
    Fragment,
    null,
    head,
    createElement(
      'span',
      { className: 'prose-reference-tail' },
      renderMathToken(last, tokens.length - 1),
      referenceSup,
    ),
  );
}
