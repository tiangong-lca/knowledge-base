import { decimal, rational } from './exact-rational.mjs';
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];

export const pfrCarriers = Object.freeze({
  ghgp2011: Object.freeze({
    sourceId: 'src-pfr151-ghgp-2011',
    readingId: 'rd-pfr151-ghgp-2011',
    artifactId: 'art-pfr151-ghgp-2011-pdf',
    mediaType: 'application/pdf',
    resolvedUrl: 'https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdf',
    sha256: 'fdc21b798b9c8908f6e55e8caca22e5d8b281ede3601f6950649244d418d3c0c',
    pageCount: 148,
  }),
  eu20231542: Object.freeze({
    sourceId: 'src-pfr151-eu-2023-1542',
    readingId: 'rd-pfr151-eu-2023-1542',
    artifactId: 'art-pfr151-eu-2023-1542-pdf',
    mediaType: 'application/pdf',
    resolvedUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32023R1542',
    sha256: 'e9745513fabe68c8c15cc9f487c4d13da81d40394712f3e0b4c2588b3238d09a',
    pageCount: 117,
  }),
  eu20241781: Object.freeze({
    sourceId: 'src-pfr151-eu-2024-1781',
    readingId: 'rd-pfr151-eu-2024-1781',
    artifactId: 'art-pfr151-eu-2024-1781-pdf',
    mediaType: 'application/pdf',
    resolvedUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32024R1781',
    sha256: '173b9823d4cb382e764afa05323b2dc80e79951e25182fbfd119976abff9615a',
    pageCount: 89,
  }),
});

export const requiredPfrPassages = Object.freeze({
  'ev-pfr151-battery-art7-art96': {
    carrier: 'eu20231542',
    passageId: 'psg-pfr151-battery-art7-art96',
    facts: {
      'nf-pfr151-bat-pages': '117',
      'nf-pfr151-bat-ind-cap': '2',
      'nf-pfr151-bat-ev-decl-months': '12',
      'nf-pfr151-bat-other-months': '18',
      'nf-pfr151-bat-class-review-years': '3',
    },
  },
  'ev-pfr151-espr-conversion-dpp': {
    carrier: 'eu20241781',
    passageId: 'psg-pfr151-espr-conversion-dpp',
    facts: {
      'nf-pfr151-espr-pages': '89',
      'nf-pfr151-espr-transition-months': '18',
      'nf-pfr151-espr-first-da-year': '2025',
      'nf-pfr151-espr-dpp-registry-year': '2026',
    },
  },
  'ev-pfr151-ghgp-boundary-unit': {
    carrier: 'ghgp2011',
    passageId: 'psg-pfr151-ghgp-boundary-unit',
    facts: {
      'nf-pfr151-ghgp-pages': '148',
      'nf-pfr151-ghgp-declared-unit-count': '0',
      'nf-pfr151-ghgp-exclusion-conditions': '3',
    },
  },
  'ev-pfr151-ghgp-carbon-rules': {
    carrier: 'ghgp2011',
    passageId: 'psg-pfr151-ghgp-carbon-rules',
    facts: {
      'nf-pfr151-ghgp-kyoto-gases': '6',
      'nf-pfr151-ghgp-gwp-years': '100',
      'nf-pfr151-ghgp-dluc-years': '20',
    },
  },
  'ev-pfr151-battery-annex2': {
    carrier: 'eu20231542',
    passageId: 'psg-pfr151-battery-annex2',
    facts: {
      'nf-pfr151-bat-fu-kwh': '1',
      'nf-pfr151-bat-fu-kwmin': '1',
      'nf-pfr151-bat-stages': '4',
      'nf-pfr151-bat-core-parts': '5',
    },
  },
  'ev-pfr151-battery-conformity': {
    carrier: 'eu20231542',
    passageId: 'psg-pfr151-battery-conformity',
    facts: {
      'nf-pfr151-bat-conformity-modules': '2',
    },
  },
  'ev-pfr151-ghgp-assurance': {
    carrier: 'ghgp2011',
    passageId: 'psg-pfr151-ghgp-assurance',
    facts: {
      'nf-pfr151-ghgp-assurance-levels': '2',
    },
  },
  'ev-pfr151-ghgp-scope3-boundary': {
    carrier: 'ghgp2011',
    passageId: 'psg-pfr151-ghgp-scope3-boundary',
    facts: {},
  },
  'ev-pfr151-ghgp-comparative-gates': {
    carrier: 'ghgp2011',
    passageId: 'psg-pfr151-ghgp-comparative-gates',
    facts: {
      'nf-pfr151-ghgp-asis-uses': '1',
    },
  },
});

export const requiredPfrClaims = Object.freeze({
  'cl-pfr151-binding-batteries': ['ev-pfr151-battery-art7-art96'],
  'cl-pfr151-espr-dpp-conversion': ['ev-pfr151-espr-conversion-dpp'],
  'cl-pfr151-ghgp-boundary-unit': ['ev-pfr151-ghgp-boundary-unit'],
  'cl-pfr151-ghgp-vs-battery-accounting': ['ev-pfr151-ghgp-carbon-rules', 'ev-pfr151-battery-annex2'],
  'cl-pfr151-assurance-vs-notified-body': ['ev-pfr151-ghgp-assurance', 'ev-pfr151-battery-conformity'],
  'cl-pfr151-product-vs-corporate-scope3': ['ev-pfr151-ghgp-scope3-boundary'],
  'cl-pfr151-comparative-assertion-gates': ['ev-pfr151-ghgp-comparative-gates', 'ev-pfr151-battery-art7-art96'],
  'cl-pfr151-paywalled-standard-boundaries': ['ev-pfr151-ghgp-comparative-gates', 'ev-pfr151-espr-conversion-dpp'],
});

const rawShaPattern = /\b[a-f0-9]{64}\b/i;

export function assertCleanProductFootprintProse(text, label) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(`Product footprint comparison missing nonempty text: ${label}`);
  }
  if (rawShaPattern.test(text)) {
    throw new Error(`Product footprint comparison leaked raw SHA-256 in reader prose: ${label}`);
  }
}

export function validateProductFootprintComparisonFactors(catalog, readings) {
  const sourceMap = new Map(catalog.sources.map(s => [s.id, s]));
  const readingMap = new Map(readings.readings.map(r => [r.id, r]));
  const evMap = new Map(catalog.evidence.map(e => [e.id, e]));
  const claimMap = new Map(catalog.claims.map(c => [c.id, c]));

  for (const [key, carrier] of Object.entries(pfrCarriers)) {
    const src = sourceMap.get(carrier.sourceId);
    const rd = readingMap.get(carrier.readingId);
    if (!src || !rd) throw new Error(`Missing product-footprint carrier ${key}`);
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
    assertCleanProductFootprintProse(src.title, `${src.id}.title`);
    assertCleanProductFootprintProse(src.preservation, `${src.id}.preservation`);
    assertCleanProductFootprintProse(src.rights, `${src.id}.rights`);
  }

  let totalFacts = 0;
  for (const [evId, spec] of Object.entries(requiredPfrPassages)) {
    const carrier = pfrCarriers[spec.carrier];
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
    assertCleanProductFootprintProse(ev.summary, `${evId}.summary`);
    assertCleanProductFootprintProse(ev.paraphrase, `${evId}.paraphrase`);

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
  if (totalFacts !== 22) {
    throw new Error(`Expected exactly 22 verified product-footprint numericFacts, got ${totalFacts}`);
  }
  const evMonths = decimal(evMap.get('ev-pfr151-battery-art7-art96').numericFacts.find(f => f.id === 'nf-pfr151-bat-ev-decl-months').value);
  const otherMonths = decimal(evMap.get('ev-pfr151-battery-art7-art96').numericFacts.find(f => f.id === 'nf-pfr151-bat-other-months').value);
  if (!eq(evMonths, rational(12n, 1n)) || !eq(otherMonths, rational(18n, 1n))) {
    throw new Error('Battery Regulation transition months rational check failed');
  }

  for (const [claimId, expectedEvIds] of Object.entries(requiredPfrClaims)) {
    const c = claimMap.get(claimId);
    if (!c) throw new Error(`Missing product-footprint claim ${claimId}`);
    if (c.evidenceIds.length !== expectedEvIds.length || !expectedEvIds.every((id, i) => c.evidenceIds[i] === id)) {
      throw new Error(`Claim ${claimId} evidenceIds mismatch`);
    }
    assertCleanProductFootprintProse(c.text, `${claimId}.text`);
    assertCleanProductFootprintProse(c.scope, `${claimId}.scope`);
    assertCleanProductFootprintProse(c.reasoning, `${claimId}.reasoning`);
  }
}
