const expectedSources = Object.freeze({
  'src-fut161-arvidsson-2024': {
    readingId: 'rd-fut161-arvidsson-2024',
    sha256: 'b6dfe18c521a76c97de8ebb6bb5df4895ad0abe4c82acf4bf515708e60f77381',
    pageCount: 7,
  },
  'src-fut161-tsoy-2020': {
    readingId: 'rd-fut161-tsoy-2020',
    sha256: '4ad67ba2ac3d3501b6d64bbb4951803666457dc943942663fe8d79ea8ad8abf2',
    pageCount: 13,
  },
  'src-fut161-steubing-2021': {
    readingId: 'rd-fut161-steubing-2021',
    sha256: '29ab442124e0fc703056a1797b5c65e34d4dbb9a3d556acfc0fd44aa9ce5eef8',
    pageCount: 15,
  },
  'src-fut161-lueddeckens-2020': {
    readingId: 'rd-fut161-lueddeckens-2020',
    sha256: '9964ef65db15b2a67ad18c2c8906e444377059a16861474ac69e44b58bb1050f',
    pageCount: 17,
  },
});

const expectedFacts = Object.freeze([
  ['ev-fut161-arvidsson-terminology', 'nf-fut161-arvidsson-exemplars', 7n, 1n, '条'],
  ['ev-fut161-arvidsson-terminology', 'nf-fut161-arvidsson-terms', 5n, 1n, '类'],
  ['ev-fut161-tsoy-upscaling', 'nf-fut161-tsoy-initial-hits', 184n, 1n, '篇'],
  ['ev-fut161-tsoy-upscaling', 'nf-fut161-tsoy-reviewed-studies', 18n, 1n, '篇'],
  ['ev-fut161-tsoy-upscaling', 'nf-fut161-tsoy-manual-calc', 10n, 1n, '篇'],
  ['ev-fut161-tsoy-upscaling', 'nf-fut161-tsoy-process-sim', 6n, 1n, '篇'],
  ['ev-fut161-tsoy-upscaling', 'nf-fut161-tsoy-trl-reported', 0n, 1n, '篇'],
  ['ev-fut161-steubing-superstructure', 'nf-fut161-steubing-scenario-dbs', 8n, 1n, '套'],
  ['ev-fut161-steubing-superstructure', 'nf-fut161-steubing-overwrites', 135000n, 1n, '条'],
  ['ev-fut161-steubing-superstructure', 'nf-fut161-steubing-ev-gain', 40n, 1n, '%'],
  ['ev-fut161-lueddeckens-temporal', 'nf-fut161-lueddeckens-studies', 60n, 1n, '篇'],
  ['ev-fut161-lueddeckens-temporal', 'nf-fut161-lueddeckens-direct-issues', 6n, 1n, '项'],
  ['ev-fut161-lueddeckens-temporal', 'nf-fut161-lueddeckens-implied-th', 199n, 1n, '年'],
  ['ev-fut161-lueddeckens-barriers', 'nf-fut161-lueddeckens-discount-rate', 1n, 1n, '%'],
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

export function validateFutureScenariosFactors(catalog, readings) {
  const srcById = new Map((catalog.sources ?? []).map(s => [s.id, s]));
  const rdById = new Map((readings.readings ?? []).map(r => [r.id, r]));
  const evById = new Map((catalog.evidence ?? []).map(e => [e.id, e]));

  for (const [srcId, spec] of Object.entries(expectedSources)) {
    const src = srcById.get(srcId);
    const rd = rdById.get(spec.readingId);
    if (!src || !rd) throw new Error(`Missing B31 source or reading binding: ${srcId}`);
    if (src.artifact?.sha256 !== spec.sha256 || src.artifact?.pageCount !== spec.pageCount) {
      throw new Error(`B31 source artifact mismatch: ${srcId}`);
    }
    if (!rd.artifacts?.some(a => a.sha256 === spec.sha256 && a.pageCount === spec.pageCount)) {
      throw new Error(`B31 reading artifact mismatch: ${spec.readingId}`);
    }
  }

  for (const ev of (catalog.evidence ?? []).filter(e => e.id.startsWith('ev-fut161-'))) {
    if (/(?:\bpp?\.\s*\d|\bAnnex\b|\bTable\b|\bFig\.\s*\d|\bSect\.\s*\d|\bCh\.\s*\d|§)/i.test(ev.locator ?? '')) {
      throw new Error(`Unclean locator on B31 evidence ${ev.id}: ${ev.locator}`);
    }
  }

  for (const [evId, nfId, expNum, expDen, expUnit] of expectedFacts) {
    const ev = evById.get(evId);
    if (!ev) throw new Error(`Missing B31 evidence ${evId}`);
    const fact = (ev.numericFacts ?? []).find(f => f.id === nfId);
    if (!fact) throw new Error(`Missing B31 numericFact ${nfId}`);
    const [num, den] = parseDecimalRational(fact.value);
    if (num * expDen !== expNum * den || fact.unit !== expUnit) {
      throw new Error(`Numeric fact mismatch on ${nfId}: got ${fact.value} ${fact.unit}`);
    }
  }
}
