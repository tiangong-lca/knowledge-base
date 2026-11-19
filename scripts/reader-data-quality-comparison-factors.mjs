import { decimal, rational } from './exact-rational.mjs';
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];

export const dqpCarriers = Object.freeze({
  ecoinventV3: Object.freeze({
    sourceId: 'src-dqp153-ecoinvent-v3-2013',
    readingId: 'rd-dqp153-ecoinvent-v3-2013',
    artifactId: 'art-dqp153-ecoinvent-v3-2013-pdf',
    mediaType: 'application/pdf',
    resolvedUrl: 'https://ecoinvent.org/wp-content/uploads/2020/10/201305_Data-Quality-Guideline-for-the-ecoinvent-database-version-3.pdf',
    sha256: '88fcc1512a8efe25c26af6254e0fff42b17d15e904bab36136b56e92eaf7fd9c',
    pageCount: 169,
  }),
  eu20212279: Object.freeze({
    sourceId: 'src-dqp153-eu-2021-2279-pef',
    readingId: 'rd-dqp153-eu-2021-2279-pef',
    artifactId: 'art-dqp153-eu-2021-2279-pef-pdf',
    mediaType: 'application/pdf',
    resolvedUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32021H2279',
    sha256: 'af28de0896bfcfd8d627e758c97c83fd7d4bab94f2005ce5ea2079df42da39e3',
    pageCount: 396,
  }),
  ghgp2011: Object.freeze({
    sourceId: 'src-dqp153-ghgp-2011',
    readingId: 'rd-dqp153-ghgp-2011',
    artifactId: 'art-dqp153-ghgp-2011-pdf',
    mediaType: 'application/pdf',
    resolvedUrl: 'https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdf',
    sha256: 'fdc21b798b9c8908f6e55e8caca22e5d8b281ede3601f6950649244d418d3c0c',
    pageCount: 148,
  }),
});

export const requiredDqpPassages = Object.freeze({
  'ev-dqp153-ecoinvent-v3-pedigree': {
    carrier: 'ecoinventV3',
    passageId: 'psg-dqp153-ecoinvent-v3-pedigree',
    facts: {
      'nf-dqp153-ev3-indicators': '5',
      'nf-dqp153-ev3-rel-s5': '0.04',
      'nf-dqp153-ev3-comp-s5': '0.008',
      'nf-dqp153-ev3-geo-s5': '0.002',
      'nf-dqp153-ev3-tech-s5': '0.12',
      'nf-dqp153-ev3-variance-terms': '6',
    },
  },
  'ev-dqp153-ecoinvent-v3-limits': {
    carrier: 'ecoinventV3',
    passageId: 'psg-dqp153-ecoinvent-v3-limits',
    facts: {},
  },
  'ev-dqp153-pef-dqr-formula': {
    carrier: 'eu20212279',
    passageId: 'psg-dqp153-pef-dqr-formula',
    facts: {
      'nf-dqp153-pef-scored-criteria': '4',
      'nf-dqp153-pef-quality-tiers': '5',
      'nf-dqp153-pef-excellent-cap': '1.5',
      'nf-dqp153-pef-poor-floor': '4',
    },
  },
  'ev-dqp153-pef-dnm-thresholds': {
    carrier: 'eu20212279',
    passageId: 'psg-dqp153-pef-dnm-thresholds',
    facts: {
      'nf-dqp153-pef-company-dqr': '1.5',
      'nf-dqp153-pef-secondary-dqr': '3.0',
      'nf-dqp153-pef-proxy-cap': '10',
      'nf-dqp153-pef-pages': '396',
    },
  },
  'ev-dqp153-ghgp-qualitative-dqi': {
    carrier: 'ghgp2011',
    passageId: 'psg-dqp153-ghgp-qualitative-dqi',
    facts: {
      'nf-dqp153-ghgp-dqi-count': '5',
      'nf-dqp153-ghgp-qual-tiers': '4',
    },
  },
  'ev-dqp153-ghgp-uncertainty-boundary': {
    carrier: 'ghgp2011',
    passageId: 'psg-dqp153-ghgp-uncertainty-boundary',
    facts: {},
  },
});

export const requiredDqpClaims = Object.freeze({
  'cl-dqp-ecoinvent-v3-variance': ['ev-dqp153-ecoinvent-v3-pedigree', 'ev-dqp153-ecoinvent-v3-limits'],
  'cl-dqp-pef-ordinal-dqr': ['ev-dqp153-pef-dqr-formula', 'ev-dqp153-pef-dnm-thresholds'],
  'cl-dqp-ghgp-qualitative-dqi': ['ev-dqp153-ghgp-qualitative-dqi', 'ev-dqp153-ghgp-uncertainty-boundary'],
  'cl-dqp-four-framework-synthesis': [
    'ev-dqp153-ecoinvent-v3-pedigree',
    'ev-dqp153-pef-dnm-thresholds',
    'ev-dqp153-ghgp-uncertainty-boundary',
    'ev-unc-ei-alongside',
  ],
  'cl-dqp-paywalled-iso-boundary': ['ev-dqp153-pef-dqr-formula', 'ev-dqp153-ghgp-qualitative-dqi'],
  'cl-dqp-cross-chapter-bridge': ['ev-dqp153-pef-dnm-thresholds', 'ev-dqp153-ecoinvent-v3-limits'],
});

const rawShaPattern = /\b[a-f0-9]{64}\b/i;

export function assertCleanDataQualityProse(text, label) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(`Data quality comparison missing nonempty text: ${label}`);
  }
  if (rawShaPattern.test(text)) {
    throw new Error(`Data quality comparison leaked raw SHA-256 in reader prose: ${label}`);
  }
}

export function validateDataQualityComparisonFactors(catalog, readings) {
  const sourceMap = new Map(catalog.sources.map(s => [s.id, s]));
  const readingMap = new Map(readings.readings.map(r => [r.id, r]));
  const evMap = new Map(catalog.evidence.map(e => [e.id, e]));
  const claimMap = new Map(catalog.claims.map(c => [c.id, c]));

  for (const [key, carrier] of Object.entries(dqpCarriers)) {
    const src = sourceMap.get(carrier.sourceId);
    const rd = readingMap.get(carrier.readingId);
    if (!src || !rd) throw new Error(`Missing data-quality carrier ${key}`);
    if (
      src.artifact?.sha256 !== carrier.sha256
      || src.artifact?.mediaType !== carrier.mediaType
      || src.artifact?.resolvedUrl !== carrier.resolvedUrl
      || src.artifact?.pageCount !== carrier.pageCount
    ) {
      throw new Error(`Source artifact mismatch on ${carrier.sourceId}`);
    }
    const art = rd.artifacts?.find(a => a.id === carrier.artifactId);
    if (
      !art
      || art.sha256 !== carrier.sha256
      || art.mediaType !== carrier.mediaType
      || art.resolvedUrl !== carrier.resolvedUrl
      || art.pageCount !== carrier.pageCount
    ) {
      throw new Error(`Reading artifact mismatch on ${carrier.readingId}`);
    }
    assertCleanDataQualityProse(src.title, `${src.id}.title`);
    assertCleanDataQualityProse(src.preservation, `${src.id}.preservation`);
    assertCleanDataQualityProse(src.rights, `${src.id}.rights`);
  }

  let totalFacts = 0;
  for (const [evId, spec] of Object.entries(requiredDqpPassages)) {
    const carrier = dqpCarriers[spec.carrier];
    const ev = evMap.get(evId);
    const rd = readingMap.get(carrier.readingId);
    const psg = rd?.passages?.find(p => p.id === spec.passageId);
    if (!ev || !psg) throw new Error(`Missing 1-to-1 evidence/passage pair ${evId} / ${spec.passageId}`);
    if (ev.sourceId !== carrier.sourceId || ev.readingId !== carrier.readingId || ev.passageId !== spec.passageId) {
      throw new Error(`Broken 1-to-1 binding on ${evId}`);
    }
    if (psg.artifactId !== carrier.artifactId) {
      throw new Error(`Passage ${spec.passageId} does not bind carrier artifact ${carrier.artifactId}`);
    }
    if (/§|PDF/i.test(ev.locator || '')) {
      throw new Error(`Unclean locator on ${evId}: ${ev.locator}`);
    }
    assertCleanDataQualityProse(ev.summary, `${evId}.summary`);
    assertCleanDataQualityProse(ev.paraphrase, `${evId}.paraphrase`);

    const actualFacts = new Map((ev.numericFacts ?? []).map(f => [f.id, f]));
    const expectedIds = Object.keys(spec.facts);
    if (actualFacts.size !== expectedIds.length) {
      throw new Error(`Numeric fact count mismatch on ${evId}: got ${actualFacts.size}, expected ${expectedIds.length}`);
    }
    for (const [nfId, expectedStr] of Object.entries(spec.facts)) {
      const nf = actualFacts.get(nfId);
      if (!nf) throw new Error(`Missing numericFact ${nfId} on ${evId}`);
      const got = decimal(nf.value);
      const want = decimal(expectedStr);
      if (!eq(got, want)) {
        throw new Error(`Numeric fact mismatch ${nfId}: got ${nf.value}, expected ${expectedStr}`);
      }
      totalFacts += 1;
    }
  }
  if (totalFacts !== 16) {
    throw new Error(`Expected exactly 16 verified data-quality numericFacts, got ${totalFacts}`);
  }
  const companyDqr = decimal(evMap.get('ev-dqp153-pef-dnm-thresholds').numericFacts.find(f => f.id === 'nf-dqp153-pef-company-dqr').value);
  const secondaryDqr = decimal(evMap.get('ev-dqp153-pef-dnm-thresholds').numericFacts.find(f => f.id === 'nf-dqp153-pef-secondary-dqr').value);
  if (!eq(companyDqr, rational(3n, 2n)) || !eq(secondaryDqr, rational(3n, 1n))) {
    throw new Error('EU PEF DQR thresholds rational check failed');
  }

  for (const [claimId, expectedEvIds] of Object.entries(requiredDqpClaims)) {
    const c = claimMap.get(claimId);
    if (!c) throw new Error(`Missing data-quality claim ${claimId}`);
    if (c.evidenceIds.length !== expectedEvIds.length || !expectedEvIds.every((id, i) => c.evidenceIds[i] === id)) {
      throw new Error(`Claim ${claimId} evidenceIds mismatch`);
    }
    assertCleanDataQualityProse(c.text, `${claimId}.text`);
    assertCleanDataQualityProse(c.scope, `${claimId}.scope`);
    assertCleanDataQualityProse(c.reasoning, `${claimId}.reasoning`);
  }
}
