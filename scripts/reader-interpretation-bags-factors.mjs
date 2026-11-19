const expectedSources = Object.freeze({
  'src-int159-danish-epa-2018': {
    readingId: 'rd-int159-danish-epa-2018',
    sha256: 'dff1f846fdfc2c5ce494ccb218b986dc0835b43d773b9d4c92dd3b7a63b41df8',
    pageCount: 144,
  },
  'src-int159-ilcd-2010': {
    readingId: 'rd-int159-ilcd-2010',
    sha256: '7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f',
    pageCount: 417,
  },
  'src-int159-eu-2021-2279-pef': {
    readingId: 'rd-int159-eu-2021-2279-pef',
    sha256: '42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7',
    pageCount: 384,
  },
});

const expectedFacts = Object.freeze([
  ['ev-int159-danish-epa-fu-eol', 'nf-int159-danish-fu-volume', 22n, 1n, '升'],
  ['ev-int159-danish-epa-fu-eol', 'nf-int159-danish-fu-weight', 12n, 1n, '千克'],
  ['ev-int159-danish-epa-fu-eol', 'nf-int159-danish-cotorg-bags', 2n, 1n, '只'],
  ['ev-int159-danish-epa-multi-indicator', 'nf-int159-danish-cot-cc', 52n, 1n, '次'],
  ['ev-int159-danish-epa-multi-indicator', 'nf-int159-danish-cot-all', 7100n, 1n, '次'],
  ['ev-int159-danish-epa-multi-indicator', 'nf-int159-danish-cotorg-cc', 149n, 1n, '次'],
  ['ev-int159-danish-epa-multi-indicator', 'nf-int159-danish-cotorg-all', 20000n, 1n, '次'],
  ['ev-int159-danish-epa-multi-indicator', 'nf-int159-danish-paper-all', 43n, 1n, '次'],
  ['ev-int159-ilcd-critical-review', 'nf-int159-ilcd-review-criteria', 5n, 1n, '项'],
  ['ev-int159-pef-interpretation-report', 'nf-int159-pef-hotspot-pct', 80n, 1n, '%'],
  ['ev-int159-pef-interpretation-report', 'nf-int159-pef-min-categories', 3n, 1n, '类'],
  ['ev-int159-pef-interpretation-report', 'nf-int159-pef-use-stage-override', 50n, 1n, '%'],
  ['ev-int159-pef-interpretation-report', 'nf-int159-pef-report-parts', 6n, 1n, '项'],
  ['ev-int159-pef-interpretation-report', 'nf-int159-pef-material-error', 5n, 1n, '%'],
]);

function parseDecimalRational(raw) {
  const text = String(raw ?? '').trim();
  const match = /^(-?\d+)(?:\.(\d+))?$/.exec(text);
  if (!match) throw new Error(`Invalid decimal rational: ${text}`);
  const neg = match[1].startsWith('-');
  const intPart = neg ? match[1].slice(1) : match[1];
  const fracPart = match[2] ?? '';
  const scale = 10n ** BigInt(fracPart.length);
  const num = BigInt(intPart + fracPart) * (neg ? -1n : 1n);
  return [num, scale];
}

export function validateInterpretationBagsFactors(catalog, readings) {
  const srcById = new Map((catalog.sources ?? []).map(s => [s.id, s]));
  const rdById = new Map((readings.readings ?? []).map(r => [r.id, r]));
  const evById = new Map((catalog.evidence ?? []).map(e => [e.id, e]));

  for (const [srcId, spec] of Object.entries(expectedSources)) {
    const src = srcById.get(srcId);
    const rd = rdById.get(spec.readingId);
    if (!src || !rd) throw new Error(`Missing B30 source or reading binding: ${srcId}`);
    if (src.artifact?.sha256 !== spec.sha256 || src.artifact?.pageCount !== spec.pageCount) {
      throw new Error(`B30 source artifact mismatch: ${srcId}`);
    }
    if (!rd.artifacts?.some(a => a.sha256 === spec.sha256 && a.pageCount === spec.pageCount)) {
      throw new Error(`B30 reading artifact mismatch: ${spec.readingId}`);
    }
  }

  for (const ev of (catalog.evidence ?? []).filter(e => e.id.startsWith('ev-int159-'))) {
    if (/(?:\bpp?\.\s*\d|\bAnnex\b|\bTable\b|\bCh\.\s*\d|§)/i.test(ev.locator ?? '')) {
      throw new Error(`Unclean locator on B30 evidence ${ev.id}: ${ev.locator}`);
    }
  }

  for (const [evId, nfId, expNum, expDen, expUnit] of expectedFacts) {
    const ev = evById.get(evId);
    if (!ev) throw new Error(`Missing B30 evidence ${evId}`);
    const fact = (ev.numericFacts ?? []).find(f => f.id === nfId);
    if (!fact) throw new Error(`Missing B30 numericFact ${nfId}`);
    const [num, den] = parseDecimalRational(fact.value);
    if (num * expDen !== expNum * den || fact.unit !== expUnit) {
      throw new Error(`Numeric fact mismatch on ${nfId}: got ${fact.value} ${fact.unit}`);
    }
  }
}
