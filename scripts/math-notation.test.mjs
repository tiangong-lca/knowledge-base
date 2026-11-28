import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeMathNotation } from './reader-math-notation.mjs';

test('tokenizeMathNotation formats allowlisted subscripts, superscripts, scientific notation, and chemical formulas', () => {
  const sample = 'Under g_b and U_T, AGWP_{i_k} scales 6.608225e-14 kg CO2 and PM2.5–10 with e^{(−t−3)·k} and 10^8.';
  const tokens = tokenizeMathNotation(sample);
  assert.equal(tokens.map(t => t.raw).join(''), sample, 'round-trip concatenation must be lossless');
  assert.ok(tokens.some(t => t.kind === 'sub' && t.raw === 'g_b' && t.base === 'g' && t.sub === 'b'));
  assert.ok(tokens.some(t => t.kind === 'sub' && t.raw === 'U_T' && t.base === 'U' && t.sub === 'T'));
  assert.ok(tokens.some(t => t.kind === 'sub' && t.raw === 'AGWP_{i_k}' && t.nestedSub?.base === 'i' && t.nestedSub?.sub === 'k'));
  assert.ok(tokens.some(t => t.kind === 'sci' && t.raw === '6.608225e-14' && t.mantissa === '6.608225' && t.exp === '−14'));
  assert.ok(tokens.some(t => t.kind === 'chem' && t.raw === 'CO2'));
  assert.ok(tokens.some(t => t.kind === 'chem' && t.raw === 'PM2.5–10'));
  assert.ok(tokens.some(t => t.kind === 'sup' && t.raw === 'e^{(−t−3)·k}'));
  assert.ok(tokens.some(t => t.kind === 'sup' && t.raw === '10^8'));
});

test('tokenizeMathNotation never mutates software, schema, CSV, or scenario identifiers', () => {
  const identifiers = [
    'SDK_v2',
    'FLOW_class',
    'LowRECost_HighNGPrice',
    'WASTE_FLOW',
    'PRODUCT_FLOW',
    'lciamethods_CF',
    'Ground_level',
    'stats_arrays',
    'tidas_processes.json',
    'NFs EF3.1_calculation',
    'conversion_factor',
    'https://example.org/CO2/g_b/PM2.5',
    '/downloads/cases/CO2-test.json',
  ];
  for (const id of identifiers) {
    const tokens = tokenizeMathNotation(id);
    assert.deepEqual(tokens, [{ kind: 'text', raw: id }], `identifier must stay plain text: ${id}`);
  }
});

test('tokenizeMathNotation handles CO2-eq, CO2eq, CO2e, math denominators, and CJK neighbors cleanly', () => {
  for (const phrase of ['10 kg CO2-eq', '20 g CO2eq/kWh', '638.4 kg CO2e/MWh', '化石CO2与CH4及PM2.5和PM10', '令g_CO2与I_B变化', 'r/AMD_X = 2', '10/U_T', 'ln(xᵢ/x_g)', '43,746/W_c']) {
    const tokens = tokenizeMathNotation(phrase);
    assert.equal(tokens.map(t => t.raw).join(''), phrase);
    assert.ok(tokens.some(t => t.kind !== 'text'), `expected math/chem token in: ${phrase}`);
  }
});
