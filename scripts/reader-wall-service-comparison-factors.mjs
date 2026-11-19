const expectedSources = Object.freeze({
  'src-wsc157-ilcd-2010': {
    readingId: 'rd-wsc157-ilcd-2010',
    sha256: '7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f',
    pageCount: 417,
  },
  'src-wsc157-eu-2021-2279-pef': {
    readingId: 'rd-wsc157-eu-2021-2279-pef',
    sha256: '42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7',
    pageCount: 384,
  },
  'src-wsc157-ghgp-2011': {
    readingId: 'rd-wsc157-ghgp-2011',
    sha256: 'fdc21b798b9c8908f6e55e8caca22e5d8b281ede3601f6950649244d418d3c0c',
    pageCount: 148,
  },
  'src-wsc157-heijungs-2020': {
    readingId: 'rd-wsc157-heijungs-2020',
    sha256: '422cb7f6665f1fcdc689d8a65cbd58838508d849bed2d415de8b010763d4f299',
    pageCount: 9,
  },
});

const expectedFacts = Object.freeze([
  ['ev-wsc157-heijungs-mc-false-sig', 'nf-wsc157-heijungs-empirical-n', 16n, 1n, '个'],
  ['ev-wsc157-heijungs-mc-false-sig', 'nf-wsc157-heijungs-empirical-p', 67n, 100n, '无量纲'],
  ['ev-wsc157-heijungs-mc-false-sig', 'nf-wsc157-heijungs-mc-runs', 100000n, 1n, '次'],
  ['ev-wsc157-heijungs-mc-false-sig', 'nf-wsc157-heijungs-weakest-n', 9n, 1n, '次'],
  ['ev-wsc157-pef-pefcr-classes-verification', 'nf-wsc157-pef-ef-categories', 16n, 1n, '项'],
  ['ev-wsc157-pef-pefcr-classes-verification', 'nf-wsc157-pef-performance-classes', 5n, 1n, '档'],
  ['ev-wsc157-pef-pefcr-classes-verification', 'nf-wsc157-pef-class-coeff-outer', 30n, 100n, '无量纲'],
  ['ev-wsc157-pef-pefcr-classes-verification', 'nf-wsc157-pef-class-coeff-inner', 85n, 100n, '无量纲'],
  ['ev-wsc157-pef-pefcr-classes-verification', 'nf-wsc157-pef-mistake-threshold', 5n, 1n, '%'],
  ['ev-wsc157-pef-pefcr-classes-verification', 'nf-wsc157-pef-verifier-points', 6n, 1n, '分'],
  ['ev-wsc157-pef-pefcr-classes-verification', 'nf-wsc157-pef-validation-years', 3n, 1n, '年'],
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

export function validateWallServiceComparisonFactors(catalog, readings) {
  const srcById = new Map((catalog.sources ?? []).map(s => [s.id, s]));
  const rdById = new Map((readings.readings ?? []).map(r => [r.id, r]));
  const evById = new Map((catalog.evidence ?? []).map(e => [e.id, e]));

  for (const [srcId, spec] of Object.entries(expectedSources)) {
    const src = srcById.get(srcId);
    const rd = rdById.get(spec.readingId);
    if (!src || !rd) throw new Error(`Missing B29 source or reading binding: ${srcId}`);
    if (src.artifact?.sha256 !== spec.sha256 || src.artifact?.pageCount !== spec.pageCount) {
      throw new Error(`B29 source artifact mismatch: ${srcId}`);
    }
    if (!rd.artifacts?.some(a => a.sha256 === spec.sha256 && a.pageCount === spec.pageCount)) {
      throw new Error(`B29 reading artifact mismatch: ${spec.readingId}`);
    }
  }

  for (const ev of (catalog.evidence ?? []).filter(e => e.id.startsWith('ev-wsc157-'))) {
    if (/(?:\bpp?\.\s*\d|\bAnnex\b|\bTable\b|\bCh\.\s*\d|§)/i.test(ev.locator ?? '')) {
      throw new Error(`Unclean locator on B29 evidence ${ev.id}: ${ev.locator}`);
    }
  }

  for (const [evId, nfId, expNum, expDen, expUnit] of expectedFacts) {
    const ev = evById.get(evId);
    if (!ev) throw new Error(`Missing B29 evidence ${evId}`);
    const fact = (ev.numericFacts ?? []).find(f => f.id === nfId);
    if (!fact) throw new Error(`Missing B29 numericFact ${nfId}`);
    const [num, den] = parseDecimalRational(fact.value);
    if (num * expDen !== expNum * den || fact.unit !== expUnit) {
      throw new Error(`Numeric fact mismatch on ${nfId}: got ${fact.value} ${fact.unit}`);
    }
  }
}
