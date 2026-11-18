import { add, decimal, divide, fixed, multiply, rational, subtract } from './exact-rational.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const carriers = Object.freeze({
  swarr2011: {
    sourceId: 'src-lcc143-swarr-2011-code',
    readingId: 'rd-lcc143-swarr-2011-code',
    artifact: {
      id: 'art-lcc143-swarr-2011-pdf',
      mediaType: 'application/pdf',
      sha256: '8158fab1bf1bbf8d9532115139515ec7e9d57a073ed1525c30e8df80383d33a2',
      resolvedUrl: 'https://link.springer.com/content/pdf/10.1007/s11367-011-0287-5.pdf',
    },
  },
  unep2011Lcsa: {
    sourceId: 'src-lcc143-unep-setac-2011-lcsa',
    readingId: 'rd-lcc143-unep-setac-2011-lcsa',
    artifact: {
      id: 'art-lcc143-unep-setac-2011-pdf',
      mediaType: 'application/pdf',
      sha256: '10c4d1d2c17004cc3b91c7b8a272978b10833194980f85a092623f5fbfddefd7',
      resolvedUrl: 'https://www.lifecycleinitiative.org/wp-content/uploads/2012/12/2011%20-%20Towards%20LCSA.pdf',
    },
  },
  hsg2013: {
    sourceId: 'src-hsg2013-lca-lcc',
    readingId: 'rd-service102-hsg-selected',
    artifact: {
      id: 'art-service102-hsg-bath-vor',
      mediaType: 'application/pdf',
      sha256: '7c86b8c184e44989c0be6d43b413b7da32cdbf80ed47050d3b907360f42112b3',
    },
  },
  finkbeiner2010: {
    sourceId: 'src-lcc143-finkbeiner-2010-lcst-lcsd',
    readingId: 'rd-lcc143-finkbeiner-2010-lcst-lcsd',
    artifact: {
      id: 'art-lcc143-finkbeiner-2010-pdf',
      mediaType: 'application/pdf',
      sha256: '2ee110751d79b1b9487bc34af6e833cbba95af8d1576e930259acc4915f2238d',
      resolvedUrl: 'https://publikationen.bibliothek.kit.edu/120084381/8414703',
    },
  },
  glamPhase3: {
    sourceId: 'src-acid113-glam-scoping',
    readingId: 'rd-acid113-glam-scoping',
    artifact: {
      id: 'art-acid113-glam-scoping',
      mediaType: 'application/pdf',
      sha256: '6e9d7c23357801cf650432bcd0ea3c8d18699e985674320be033d65f83cd6d45',
    },
  },
  cmlPart3: {
    sourceId: 'src-kb52-cml-2001-part3',
    readingId: 'rd-cml-2001-part3',
    artifact: {
      id: 'art-cml-2001-part3-pdf',
      mediaType: 'application/pdf',
      sha256: 'b77c333e6b199103e35da962568922f3342f0daf119b2ae20eac937adf19f206',
    },
  },
  ilcd2010: {
    sourceId: 'src-book-ilcd-2010',
    readingId: 'rd-ilcd-2010',
    artifact: {
      id: 'art-ilcd-2010-pdf',
      mediaType: 'application/pdf',
      sha256: '7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f',
    },
  },
  ec2021: {
    sourceId: 'src-kb44-ec2021',
    readingId: 'rd-kb44-ec2021',
    artifact: {
      id: 'art-kb44-ec2021-r01-pdf',
      mediaType: 'application/pdf',
      sha256: '42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7',
    },
  },
  suh2004: {
    sourceId: 'src-lcc143-suh-2004-dissertation',
    readingId: 'rd-lcc143-suh-2004-dissertation',
    artifact: {
      id: 'art-lcc143-suh-2004-pdf',
      mediaType: 'application/pdf',
      sha256: 'ddff0352d833b103fc45f6c78abad133defcafde7ddd579a465e65c6d2274670',
      resolvedUrl: 'https://scholarlypublications.universiteitleiden.nl/download/1887/8399/1?col=81522199420002711',
    },
  },
  steinmann2016: {
    sourceId: 'src-lcc143-steinmann-2016-indicators',
    readingId: 'rd-lcc143-steinmann-2016-indicators',
    artifact: {
      id: 'art-lcc143-steinmann-2016-pdf',
      mediaType: 'application/pdf',
      sha256: '2ce032ac77a045c85fb60b405c6929135ab1617d7391156614cb053760c19f8d',
      resolvedUrl: 'https://doi.org/10.1021/acs.est.5b05179',
    },
  },
  hellweg2014: {
    sourceId: 'src-lcc143-hellweg-2014-emerging',
    readingId: 'rd-lcc143-hellweg-2014-emerging',
    artifact: {
      id: 'art-lcc143-hellweg-2014-pdf',
      mediaType: 'application/pdf',
      sha256: 'f90e8b10a5dce41db44e1d6f9ba0a2a48137ddd99dda62eda6feefdbd48e5f71',
      resolvedUrl: 'https://doi.org/10.1126/science.1248361',
    },
  },
  oneill2026: {
    sourceId: 'src-lcc143-oneill-2026-strong-sustainability',
    readingId: 'rd-lcc143-oneill-2026-strong-sustainability',
    artifact: {
      id: 'art-lcc143-oneill-2026-pdf',
      mediaType: 'application/pdf',
      sha256: 'd37f21fe0808e347fd9a408045a5a8c49a6c164b58bcaad0aa1e0a4e62d88d9e',
      resolvedUrl: 'https://doi.org/10.1038/s42256-026-01240-w',
    },
  },
});

const evidenceSpec = Object.freeze({
  'ev-lcc143-swarr2011-code-of-practice': {
    carrier: 'swarr2011',
    passageId: 'psg-lcc143-swarr2011-code-of-practice',
    pdfIndices: [0, 1, 2],
    facts: 5,
  },
  'ev-lcc143-unep2011-lcc-flavours-and-cases': {
    carrier: 'unep2011Lcsa',
    passageId: 'psg-lcc143-unep2011-lcc-flavours-and-cases',
    pdfIndices: [24, 25, 33, 34, 35, 36, 37, 38, 39, 40],
    facts: 16,
  },
  'ev-lcc143-unep2011-boundary-union-and-aggregation': {
    carrier: 'unep2011Lcsa',
    passageId: 'psg-lcc143-unep2011-boundary-union-and-aggregation',
    pdfIndices: [53, 54, 55, 56, 57, 58, 59, 60],
    facts: 0,
  },
  'ev-lcc143-unep2011-single-indicator-caution': {
    carrier: 'unep2011Lcsa',
    passageId: 'psg-lcc143-unep2011-single-indicator-caution',
    pdfIndices: [65, 66, 67],
    facts: 0,
  },
  'ev-lcc143-hsg2013-lcc-value-added': {
    carrier: 'hsg2013',
    passageId: 'psg-lcc143-hsg2013-lcc-value-added',
    pdfIndices: [2, 3, 4, 7, 8, 9],
    facts: 9,
  },
  'ev-lcc143-hsg2013-cutoffs': {
    carrier: 'hsg2013',
    passageId: 'psg-lcc143-hsg2013-cutoffs',
    pdfIndices: [10, 11],
    facts: 0,
  },
  'ev-lcc143-finkbeiner2010-lcst-and-lcsd': {
    carrier: 'finkbeiner2010',
    passageId: 'psg-lcc143-finkbeiner2010-lcst-and-lcsd',
    pdfIndices: [6, 7, 8, 9, 10, 11],
    facts: 10,
  },
  'ev-lcc143-glam3-iso14008-valuation': {
    carrier: 'glamPhase3',
    passageId: 'psg-lcc143-glam3-iso14008-valuation',
    pdfIndices: [109],
    facts: 0,
  },
  'ev-lcc143-glam3-resource-dissipation': {
    carrier: 'glamPhase3',
    passageId: 'psg-lcc143-glam3-resource-dissipation',
    pdfIndices: [106, 107],
    facts: 3,
  },
  'ev-lcc143-glam3-mcda-and-smm': {
    carrier: 'glamPhase3',
    passageId: 'psg-lcc143-glam3-mcda-and-smm',
    pdfIndices: [141, 142, 158, 159, 160, 161],
    facts: 4,
  },
  'ev-lcc143-glam3-planetary-boundaries-aesa': {
    carrier: 'glamPhase3',
    passageId: 'psg-lcc143-glam3-planetary-boundaries-aesa',
    pdfIndices: [137, 138, 139, 140],
    facts: 0,
  },
  'ev-lcc143-cml2001-finnveden-valuation': {
    carrier: 'cmlPart3',
    passageId: 'psg-lcc143-cml2001-finnveden-valuation',
    pdfIndices: [248, 249, 250],
    facts: 2,
  },
  'ev-lcc143-cml2001-appendix-b-toolbox': {
    carrier: 'cmlPart3',
    passageId: 'psg-lcc143-cml2001-appendix-b-toolbox',
    pdfIndices: [21, 278, 279, 280, 281, 282, 283, 284],
    facts: 1,
  },
  'ev-lcc143-ilcd2010-ecoefficiency-and-tco': {
    carrier: 'ilcd2010',
    passageId: 'psg-lcc143-ilcd2010-ecoefficiency-and-tco',
    pdfIndices: [50, 52],
    facts: 0,
  },
  'ev-lcc143-ilcd2010-technosphere-ra-boundary': {
    carrier: 'ilcd2010',
    passageId: 'psg-lcc143-ilcd2010-technosphere-ra-boundary',
    pdfIndices: [82],
    facts: 0,
  },
  'ev-lcc143-ec2021-ra-eia-boundary': {
    carrier: 'ec2021',
    passageId: 'psg-lcc143-ec2021-ra-eia-boundary',
    pdfIndices: [86, 93, 283],
    facts: 0,
  },
  'ev-lcc143-ec2021-single-issue-footprints': {
    carrier: 'ec2021',
    passageId: 'psg-lcc143-ec2021-single-issue-footprints',
    pdfIndices: [21, 104, 105],
    facts: 0,
  },
  'ev-lcc143-suh2004-ioa-mfa-lineage': {
    carrier: 'suh2004',
    passageId: 'psg-lcc143-suh2004-ioa-mfa-lineage',
    pdfIndices: [10, 11, 12, 13, 14, 15, 16, 106, 107, 120],
    facts: 6,
  },
  'ev-lcc143-steinmann2016-pca-footprints': {
    carrier: 'steinmann2016',
    passageId: 'psg-lcc143-steinmann2016-pca-footprints',
    pdfIndices: [0, 1, 2, 3, 4],
    facts: 24,
  },
  'ev-lcc143-hellweg2014-scales-and-rebound': {
    carrier: 'hellweg2014',
    passageId: 'psg-lcc143-hellweg2014-scales-and-rebound',
    pdfIndices: [0, 1, 4],
    facts: 0,
  },
  'ev-lcc143-oneill2026-strong-vs-weak-sustainability': {
    carrier: 'oneill2026',
    passageId: 'psg-lcc143-oneill2026-strong-vs-weak-sustainability',
    pdfIndices: [0, 1, 2],
    facts: 2,
  },
});

const expectedFacts = Object.freeze({
  'nf-lcc143-swarr-wg-years': '3',
  'nf-lcc143-swarr-booklet-pages': '98',
  'nf-lcc143-swarr-member-price-usd': '5',
  'nf-lcc143-swarr-nonmember-price-usd': '12',
  'nf-lcc143-swarr-chronicle-rows': '7',
  'nf-lcc143-unep11-gao-year': '1933',
  'nf-lcc143-unep11-lcc-flavours': '3',
  'nf-lcc143-unep11-privatized-horizon-yr': '2',
  'nf-lcc143-unep11-bus-years': '10',
  'nf-lcc143-unep11-bus-annual-km': '60000',
  'nf-lcc143-unep11-bus-total-km': '600000',
  'nf-lcc143-unep11-bus-inflation-pct': '2.0',
  'nf-lcc143-unep11-bus-discount-pct': '4.4',
  'nf-lcc143-unep11-bus-v1-inv-usd': '295544',
  'nf-lcc143-unep11-bus-v2-inv-usd': '328826',
  'nf-lcc143-unep11-bus-v1-npv-usd': '884657',
  'nf-lcc143-unep11-bus-v2-npv-usd': '849029',
  'nf-lcc143-unep11-washer-cycles-yr': '535',
  'nf-lcc143-unep11-washer-load-kg': '8',
  'nf-lcc143-unep11-washer-lime-v1-pct': '3.74',
  'nf-lcc143-unep11-washer-lime-v2-pct': '2.56',
  'nf-lcc143-hsg-swarr-formulas': '1',
  'nf-lcc143-hsg-hunkeler-formulas': '5',
  'nf-lcc143-hsg-car-purchase-eur': '10000',
  'nf-lcc143-hsg-car-op-eur': '40000',
  'nf-lcc143-hsg-car-lcc-eur': '50000',
  'nf-lcc143-hsg-car-parts-eur': '6000',
  'nf-lcc143-hsg-chair-base-lcc-eur': '13.5',
  'nf-lcc143-hsg-chair-spray-add-eur': '10',
  'nf-lcc143-hsg-chair-maint-lcc-eur': '23.5',
  'nf-lcc143-fink-weight-sum-pct': '100',
  'nf-lcc143-fink-ex-we': '0.4',
  'nf-lcc143-fink-ex-ws': '0.1',
  'nf-lcc143-fink-ex-wec': '0.5',
  'nf-lcc143-fink-fig4-env-switch-pct': '53',
  'nf-lcc143-fink-fig4-soc-switch-pct': '43',
  'nf-lcc143-fink-fig4-econ-switch-pct': '47',
  'nf-lcc143-fink-lcsd-worst': '0',
  'nf-lcc143-fink-lcsd-best': '1000',
  'nf-lcc143-fink-lcsd-colours': '7',
  'nf-lcc143-glam3-beylot-pubs': '45',
  'nf-lcc143-glam3-dissip-short-yr': '25',
  'nf-lcc143-glam3-dissip-long-yr': '100',
  'nf-lcc143-glam3-survey-members': '31',
  'nf-lcc143-glam3-survey-replies': '20',
  'nf-lcc143-glam3-mcda-users': '8',
  'nf-lcc143-glam3-weighting-users': '17',
  'nf-lcc143-cml-finnveden-groups': '5',
  'nf-lcc143-cml-finnveden-lca-groups': '3',
  'nf-lcc143-cml-appb-tools': '6',
  'nf-lcc143-suh-quesnay-year': '1758',
  'nf-lcc143-suh-quesnay-classes': '3',
  'nf-lcc143-suh-leontief-year': '1936',
  'nf-lcc143-suh-ayres-year': '1969',
  'nf-lcc143-suh-io-lag-min-yr': '1',
  'nf-lcc143-suh-io-lag-max-yr': '5',
  'nf-lcc143-stein-ecoinvent-indicators': '692',
  'nf-lcc143-stein-step12-indicators': '161',
  'nf-lcc143-stein-removed-collinear': '26',
  'nf-lcc143-stein-retained-indicators': '135',
  'nf-lcc143-stein-methods': '13',
  'nf-lcc143-stein-products': '976',
  'nf-lcc143-stein-product-categories': '7',
  'nf-lcc143-stein-nontrivial-pcs': '4',
  'nf-lcc143-stein-pc1to4-var-pct': '92.0',
  'nf-lcc143-stein-pc1-var-pct': '83.3',
  'nf-lcc143-stein-pc2-var-pct': '3.9',
  'nf-lcc143-stein-pc3-var-pct': '3.1',
  'nf-lcc143-stein-pc4-var-pct': '1.9',
  'nf-lcc143-stein-best1-var-pct': '78.4',
  'nf-lcc143-stein-best6-count': '6',
  'nf-lcc143-stein-best6-var-pct': '92.3',
  'nf-lcc143-stein-fp-count': '4',
  'nf-lcc143-stein-fp-energy-pct': '62.8',
  'nf-lcc143-stein-fp-land-pct': '37.9',
  'nf-lcc143-stein-fp-water-pct': '58.1',
  'nf-lcc143-stein-fp-material-pct': '54.3',
  'nf-lcc143-stein-fp-all4-pct': '84.3',
  'nf-lcc143-stein-fp-energy-land-pct': '76.5',
  'nf-lcc143-stein-fp-3-pct': '83.8',
  'nf-lcc143-oneill-doughnut-countries': '150',
  'nf-lcc143-oneill-global-data-year': '2022',
});

const gt = (a, b) => a[0] * b[1] > b[0] * a[1];
const lt = (a, b) => a[0] * b[1] < b[0] * a[1];
const eq = (a, b) => a[0] * b[1] === b[0] * a[1];

const powRat = (r, n) => {
  let acc = rational(1n, 1n);
  for (let i = 0; i < n; i++) acc = multiply(acc, r);
  return acc;
};

const forbiddenReaderPattern = /(?:[<>]|pdfIndices?|PDF\s*indices|web\s+extracted\s+lines|零基索引|本仓库|公开仓库|本轮|本次核读|工作树|尚未核闭|未直接重录|硬编码|與|\b(?:cl|ev|src|rd|psg|nf|art|work|lit|gap|rev|q)-[a-z0-9-]+|\bCASE-[A-Z0-9-]+\b|\bB(?:0[1-9]|[12][0-9]|3[0-2])\b|[0-9a-f]{64}|[0-9a-f]{7,}\.{3}|\b[0-9a-f]{8}\b|[0-9a-f]{8}-[0-9a-f]{4})/;

export function assertCleanCostSustainabilityProse(str, label, allowMathComparators = false) {
  if (!scienceText(str)) {
    throw new Error(`Cost and sustainability reader/public hygiene check failed on ${label}: ${str}`);
  }
  let cleaned = str;
  if (allowMathComparators) cleaned = cleaned.replace(/[<>→]/g, '');
  if (forbiddenReaderPattern.test(cleaned)) {
    throw new Error(`Cost and sustainability reader/public hygiene check failed on ${label}: ${str}`);
  }
}

function assertProseContainsAll(text, tokens, label) {
  for (const token of tokens) {
    if (!text.includes(token)) {
      throw new Error(`Cost and sustainability prose binding missing "${token}" on ${label}`);
    }
  }
}

const requiredClaims = Object.freeze({
  'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation': {
    premises: [
      'cl-sustainability-lcc-actor-perspective',
      'cl-sustainability-lcc-internalization-boundary',
      'cl-book-cost-ledgers',
    ],
    evidence: [
      'ev-lcc143-swarr2011-code-of-practice',
      'ev-lcc143-unep2011-lcc-flavours-and-cases',
      'ev-lcc143-hsg2013-lcc-value-added',
      'ev-lcc143-ilcd2010-ecoefficiency-and-tco',
    ],
  },
  'cl-lcc143-actor-split-incentive-and-discount-rate-reversal': {
    premises: [
      'cl-sustainability-lcc-actor-perspective',
      'cl-book-cost-ledgers',
      'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
    ],
    evidence: [
      'ev-lcc143-swarr2011-code-of-practice',
      'ev-lcc143-unep2011-lcc-flavours-and-cases',
      'ev-lcc143-hsg2013-lcc-value-added',
    ],
  },
  'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting': {
    premises: [
      'cl-lime-units',
      'cl-soc139-wage-price-and-automation-paradoxes',
      'cl-sustainability-lcc-internalization-boundary',
      'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
    ],
    evidence: [
      'ev-lcc143-hsg2013-lcc-value-added',
      'ev-lcc143-cml2001-finnveden-valuation',
      'ev-lcc143-glam3-iso14008-valuation',
      'ev-lcc143-unep2011-lcc-flavours-and-cases',
      'ev-lime-2012-conjoint-weights',
      'ev-fossil117-rivm-scp-endpoint',
    ],
  },
  'cl-lcc143-cut-off-asymmetry-and-cost-rebound-boundary': {
    premises: [
      'cl-soc139-macro-screening-cutoffs-and-certification-limits',
      'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
      'cl-sustainability-conceptual-combination-not-sum',
    ],
    evidence: [
      'ev-lcc143-unep2011-boundary-union-and-aggregation',
      'ev-lcc143-swarr2011-code-of-practice',
      'ev-lcc143-hsg2013-cutoffs',
      'ev-lcc143-hellweg2014-scales-and-rebound',
    ],
  },
  'cl-lcc143-demarcating-ra-eia-and-mfa-ioa': {
    premises: [
      'cl-sustainability-conceptual-combination-not-sum',
      'cl-book-cost-health-overlap',
    ],
    evidence: [
      'ev-lcc143-cml2001-appendix-b-toolbox',
      'ev-lcc143-ilcd2010-technosphere-ra-boundary',
      'ev-lcc143-ec2021-ra-eia-boundary',
      'ev-lcc143-glam3-resource-dissipation',
      'ev-lcc143-suh2004-ioa-mfa-lineage',
    ],
  },
  'cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles': {
    premises: [
      'cl-sustainability-conceptual-combination-not-sum',
      'cl-lcc143-demarcating-ra-eia-and-mfa-ioa',
    ],
    evidence: [
      'ev-lcc143-ec2021-single-issue-footprints',
      'ev-lcc143-steinmann2016-pca-footprints',
      'ev-lcc143-unep2011-single-indicator-caution',
    ],
  },
  'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals': {
    premises: [
      'cl-soc139-three-social-zeros-and-compensation-limits',
      'cl-sustainability-dashboard-zero-is-relative',
      'cl-sustainability-explicit-aggregation-conditions',
    ],
    evidence: [
      'ev-lcc143-finkbeiner2010-lcst-and-lcsd',
      'ev-lcc143-unep2011-boundary-union-and-aggregation',
      'ev-lcc143-glam3-mcda-and-smm',
      'ev-lcc143-hsg2013-lcc-value-added',
    ],
  },
  'cl-lcc143-planetary-boundaries-and-sharing-principle-reversal': {
    premises: [
      'cl-sustainability-dashboard-zero-is-relative',
      'cl-sustainability-explicit-aggregation-conditions',
      'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals',
    ],
    evidence: [
      'ev-lcc143-glam3-planetary-boundaries-aesa',
      'ev-lcc143-oneill2026-strong-vs-weak-sustainability',
    ],
  },
});

export function validateCostSustainabilityFactors(catalog, readings) {
  const sourceById = new Map(catalog.sources.map(row => [row.id, row]));
  const readingById = new Map(readings.readings.map(row => [row.id, row]));
  const evidenceById = new Map(catalog.evidence.map(row => [row.id, row]));
  const claimById = new Map(catalog.claims.map(row => [row.id, row]));

  const unitEvidence = catalog.evidence.filter(row => row.id.startsWith('ev-lcc143-'));
  if (unitEvidence.length !== Object.keys(evidenceSpec).length) {
    throw new Error('Cost and sustainability has unexpected or missing ev-lcc143-* records');
  }

  const facts = new Map();
  for (const [eid, spec] of Object.entries(evidenceSpec)) {
    const ev = evidenceById.get(eid);
    const carrier = carriers[spec.carrier];
    const src = sourceById.get(carrier.sourceId);
    const rd = readingById.get(carrier.readingId);
    const psg = rd?.passages.find(p => p.id === spec.passageId);
    const art = rd?.artifacts.find(a => a.id === carrier.artifact.id);
    if (!ev || Object.hasOwn(ev, 'numericFact')
        || ev.sourceId !== carrier.sourceId || ev.readingId !== carrier.readingId || ev.passageId !== spec.passageId
        || ev.reviewStatus !== 'reviewed' || ev.reviewKind !== 'agent-source-check'
        || !scienceText(ev.locator) || !scienceText(ev.summary) || !scienceText(ev.paraphrase)
        || !src || !rd || !psg || psg.artifactId !== carrier.artifact.id
        || !art || art.mediaType !== carrier.artifact.mediaType || art.sha256 !== carrier.artifact.sha256
        || (carrier.artifact.resolvedUrl && art.resolvedUrl !== carrier.artifact.resolvedUrl)) {
      throw new Error(`Cost and sustainability evidence/carrier binding failed: ${eid}`);
    }
    assertCleanCostSustainabilityProse(ev.locator, `${eid}.locator`);
    assertCleanCostSustainabilityProse(ev.summary, `${eid}.summary`);
    assertCleanCostSustainabilityProse(ev.paraphrase, `${eid}.paraphrase`);
    assertCleanCostSustainabilityProse(psg.locator, `${spec.passageId}.locator`);
    if (psg.printedPages !== undefined) {
      assertCleanCostSustainabilityProse(psg.printedPages, `${spec.passageId}.printedPages`);
    }
    (psg.topics ?? []).forEach((tp, idx) => assertCleanCostSustainabilityProse(tp, `${spec.passageId}.topics[${idx}]`));
    (psg.limits ?? []).forEach((lm, idx) => assertCleanCostSustainabilityProse(lm, `${spec.passageId}.limits[${idx}]`));
    if (spec.pdfIndices ? !sameScienceValue(psg.pdfIndices, spec.pdfIndices) : psg.pdfIndices !== undefined) {
      throw new Error(`Cost and sustainability passage pdfIndices mismatch: ${spec.passageId}`);
    }
    const list = ev.numericFacts ?? [];
    if (list.length !== spec.facts) {
      throw new Error(`Cost and sustainability numericFacts count mismatch on ${eid}: got ${list.length}, expected ${spec.facts}`);
    }
    for (const item of list) {
      if (!item?.id?.startsWith('nf-lcc143-') || facts.has(item.id)
          || expectedFacts[item.id] !== item.value
          || !scienceText(item.unit) || !scienceText(item.quantity) || !scienceText(item.subject) || !scienceText(item.basis)) {
        throw new Error(`Cost and sustainability malformed or unexpected numericFact: ${item?.id}`);
      }
      assertCleanCostSustainabilityProse(item.unit, `${item.id}.unit`);
      assertCleanCostSustainabilityProse(item.quantity, `${item.id}.quantity`);
      assertCleanCostSustainabilityProse(item.subject, `${item.id}.subject`);
      assertCleanCostSustainabilityProse(item.basis, `${item.id}.basis`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== Object.keys(expectedFacts).length) {
    throw new Error('Cost and sustainability numericFacts inventory differs from expectedFacts');
  }

  for (const [sid, expectedCarrier] of [
    ['src-lcc143-swarr-2011-code', carriers.swarr2011],
    ['src-lcc143-unep-setac-2011-lcsa', carriers.unep2011Lcsa],
    ['src-lcc143-finkbeiner-2010-lcst-lcsd', carriers.finkbeiner2010],
    ['src-lcc143-suh-2004-dissertation', carriers.suh2004],
    ['src-lcc143-steinmann-2016-indicators', carriers.steinmann2016],
    ['src-lcc143-hellweg-2014-emerging', carriers.hellweg2014],
    ['src-lcc143-oneill-2026-strong-sustainability', carriers.oneill2026],
  ]) {
    const newSrc = sourceById.get(sid);
    if (!newSrc || newSrc.artifact?.sha256 !== expectedCarrier.artifact.sha256
        || (expectedCarrier.artifact.resolvedUrl && newSrc.artifact?.resolvedUrl !== expectedCarrier.artifact.resolvedUrl)
        || newSrc.reading?.readingId !== expectedCarrier.readingId) {
      throw new Error(`Cost and sustainability new source carrier/reading mismatch: ${sid}`);
    }
    assertCleanCostSustainabilityProse(newSrc.title, `${sid}.title`);
    assertCleanCostSustainabilityProse(newSrc.version, `${sid}.version`);
    assertCleanCostSustainabilityProse(newSrc.publisher, `${sid}.publisher`);
    assertCleanCostSustainabilityProse(newSrc.rights, `${sid}.rights`);
    assertCleanCostSustainabilityProse(newSrc.preservation, `${sid}.preservation`);
    assertCleanCostSustainabilityProse(newSrc.reading.scope, `${sid}.reading.scope`);
  }

  for (const rid of [
    'rd-lcc143-swarr-2011-code',
    'rd-lcc143-unep-setac-2011-lcsa',
    'rd-lcc143-finkbeiner-2010-lcst-lcsd',
    'rd-lcc143-suh-2004-dissertation',
    'rd-lcc143-steinmann-2016-indicators',
    'rd-lcc143-hellweg-2014-emerging',
    'rd-lcc143-oneill-2026-strong-sustainability',
  ]) {
    const rd = readingById.get(rid);
    if (!rd) throw new Error(`Missing reading ${rid}`);
    assertCleanCostSustainabilityProse(rd.title, `${rid}.title`);
    assertCleanCostSustainabilityProse(rd.version, `${rid}.version`);
    assertCleanCostSustainabilityProse(rd.question, `${rid}.question`);
    assertCleanCostSustainabilityProse(rd.argumentSummary, `${rid}.argumentSummary`);
    assertCleanCostSustainabilityProse(rd.rights, `${rid}.rights`);
    assertCleanCostSustainabilityProse(rd.appraisal.basis, `${rid}.appraisal.basis`);
    assertCleanCostSustainabilityProse(rd.appraisal.methodologicalScope, `${rid}.appraisal.methodologicalScope`);
    assertCleanCostSustainabilityProse(rd.appraisal.independence, `${rid}.appraisal.independence`);
    rd.appraisal.limitations.forEach((lm, idx) => assertCleanCostSustainabilityProse(lm, `${rid}.appraisal.limitations[${idx}]`));
    rd.unread.forEach((ur, idx) => assertCleanCostSustainabilityProse(ur, `${rid}.unread[${idx}]`));
  }

  const consumed = new Set();
  const raw = id => {
    if (!facts.has(id)) throw new Error(`Unknown numericFact ${id}`);
    consumed.add(id);
    return facts.get(id);
  };
  const q = id => decimal(raw(id));
  const pct = (part, whole, digits = 2) => fixed(multiply(divide(part, whole), rational(100n, 1n)), digits);

  const unitClaims = catalog.claims.filter(row => row.id.startsWith('cl-lcc143-'));
  if (unitClaims.length !== Object.keys(requiredClaims).length) {
    throw new Error('Cost and sustainability has unexpected or missing cl-lcc143-* claims');
  }
  for (const [cid, spec] of Object.entries(requiredClaims)) {
    const cl = claimById.get(cid);
    if (!cl || cl.status !== 'reviewed' || cl.kind !== 'synthesis'
        || cl.reviewKind !== 'agent-source-check' || cl.reviewedAt !== '2026-11-18'
        || !sameScienceValue(cl.conceptIds, []) || !sameScienceValue(cl.mappingIds, [])
        || !sameScienceValue(cl.premiseIds, spec.premises)
        || !sameScienceValue(cl.evidenceIds, spec.evidence)
        || cl.evidenceLinks?.length !== spec.evidence.length
        || !Array.isArray(cl.caveats) || !cl.caveats.length) {
      throw new Error(`Cost and sustainability claim structure invalid: ${cid}`);
    }
    assertCleanCostSustainabilityProse(cl.scope, `${cid}.scope`);
    assertCleanCostSustainabilityProse(cl.text, `${cid}.text`);
    assertCleanCostSustainabilityProse(cl.reasoning, `${cid}.reasoning`, true);
    cl.caveats.forEach((cv, i) => assertCleanCostSustainabilityProse(cv, `${cid}.caveats[${i}]`));
    for (const eid of spec.evidence) {
      const matches = cl.evidenceLinks.filter(l => l.evidenceId === eid);
      if (matches.length !== 1 || matches[0].relation !== 'supports') {
        throw new Error(`Cost and sustainability claim ${cid} missing exact supports link for ${eid}`);
      }
      assertCleanCostSustainabilityProse(matches[0].rationale, `${cid}.evidenceLinks(${eid})`);
    }
  }

  // 1. Three LCC archetypes & value-added consolidation -> cl-lcc143-three-lcc-archetypes-and-value-added-consolidation
  const cArch = claimById.get('cl-lcc143-three-lcc-archetypes-and-value-added-consolidation');
  const gaoYr = q('nf-lcc143-unep11-gao-year');
  const lccFlavs = q('nf-lcc143-unep11-lcc-flavours');
  const privHor = q('nf-lcc143-unep11-privatized-horizon-yr');
  const swWgYrs = q('nf-lcc143-swarr-wg-years');
  const swPages = q('nf-lcc143-swarr-booklet-pages');
  const swMemUsd = q('nf-lcc143-swarr-member-price-usd');
  const swNonMemUsd = q('nf-lcc143-swarr-nonmember-price-usd');
  const swChron = q('nf-lcc143-swarr-chronicle-rows');
  const hsgSwForm = q('nf-lcc143-hsg-swarr-formulas');
  const hsgHuForm = q('nf-lcc143-hsg-hunkeler-formulas');
  const carBuy = q('nf-lcc143-hsg-car-purchase-eur');
  const carOp = q('nf-lcc143-hsg-car-op-eur');
  const carLcc = q('nf-lcc143-hsg-car-lcc-eur');
  const carParts = q('nf-lcc143-hsg-car-parts-eur');
  const chairBase = q('nf-lcc143-hsg-chair-base-lcc-eur');
  const chairAdd = q('nf-lcc143-hsg-chair-spray-add-eur');
  const chairMaint = q('nf-lcc143-hsg-chair-maint-lcc-eur');

  const carOvercount = add(carLcc, carParts);
  if (!eq(add(carBuy, carOp), carLcc)
      || fixed(carOvercount, 0) !== '56000'
      || !eq(add(chairBase, chairAdd), chairMaint)
      || fixed(gaoYr, 0) !== '1933'
      || fixed(lccFlavs, 0) !== '3') {
    throw new Error('Cost and sustainability LCC archetypes / HSG car & chair math failed');
  }
  assertProseContainsAll(
    cArch.text,
    [
      `${fixed(gaoYr, 0)} 年`, '三类生命周期成本', `${fixed(privHor, 0)} 年内`,
      '10,000 €', '40,000 €', '50,000 €', '6,000 €', '56,000 €',
      `${fixed(chairBase, 1)} €`, `${fixed(chairAdd, 0)} €`, `${fixed(chairMaint, 1)} €`,
    ],
    'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation.text',
  );
  assertProseContainsAll(
    cArch.caveats.join(' '),
    [
      `${fixed(swWgYrs, 0)} 年`, `${fixed(swPages, 0)} 页`,
      `${fixed(swMemUsd, 0)} USD`, `${fixed(swNonMemUsd, 0)} USD`,
      `${fixed(swChron, 0)} 次`, `${fixed(hsgSwForm, 0)} 个公式`, `${fixed(hsgHuForm, 0)} 个公式`, 'Table 3-1a',
    ],
    'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation.caveats',
  );

  // 2. Actor split incentive, transfer cancellation & discount-rate reversal -> cl-lcc143-actor-split-incentive-and-discount-rate-reversal
  const cSplit = claimById.get('cl-lcc143-actor-split-incentive-and-discount-rate-reversal');
  const busYrs = q('nf-lcc143-unep11-bus-years');
  const busAnnKm = q('nf-lcc143-unep11-bus-annual-km');
  const busTotKm = q('nf-lcc143-unep11-bus-total-km');
  const busInf = q('nf-lcc143-unep11-bus-inflation-pct');
  const busDisc = q('nf-lcc143-unep11-bus-discount-pct');
  const busV1Inv = q('nf-lcc143-unep11-bus-v1-inv-usd');
  const busV2Inv = q('nf-lcc143-unep11-bus-v2-inv-usd');
  const busV1Npv = q('nf-lcc143-unep11-bus-v1-npv-usd');
  const busV2Npv = q('nf-lcc143-unep11-bus-v2-npv-usd');

  const busInvDiffPct = pct(subtract(busV2Inv, busV1Inv), busV1Inv, 2);
  const busNpvDiffPct = pct(subtract(busV1Npv, busV2Npv), busV1Npv, 2);

  const npvAt = ratePct => {
    const r = add(rational(1n, 1n), divide(decimal(ratePct), rational(100n, 1n)));
    let pvWash1 = rational(0n, 1n);
    for (let t = 1; t <= 4; t++) pvWash1 = add(pvWash1, divide(rational(1n, 1n), powRat(r, t)));
    const jia = add(rational(116n, 1n), multiply(rational(4n, 1n), pvWash1));
    const pv58t2 = divide(rational(58n, 1n), powRat(r, 2));
    const yi = add(add(rational(58n, 1n), pv58t2), multiply(rational(6n, 1n), pvWash1));
    return { jia, yi, pv58t2 };
  };
  const n0 = npvAt('0');
  const n3 = npvAt('3');
  const n648 = npvAt('6.48');
  const n649 = npvAt('6.49');
  const n10 = npvAt('10');

  if (!eq(multiply(busYrs, busAnnKm), busTotKm)
      || busInvDiffPct !== '11.26' || busNpvDiffPct !== '4.03'
      || !lt(n0.jia, n0.yi) || !lt(n3.jia, n3.yi)
      || !lt(n648.jia, n648.yi) || !gt(n649.jia, n649.yi)
      || !gt(n10.jia, n10.yi)
      || fixed(n0.jia, 2) !== '132.00' || fixed(n0.yi, 2) !== '140.00'
      || fixed(n3.jia, 2) !== '130.87' || fixed(n3.yi, 2) !== '134.97'
      || fixed(n10.jia, 2) !== '128.68' || fixed(n10.yi, 2) !== '124.95'
      || fixed(n10.pv58t2, 2) !== '47.93') {
    throw new Error('Cost and sustainability split-incentive / discount-rate NPV math failed');
  }
  assertProseContainsAll(
    cSplit.text,
    [
      '116 €', '80 €', '36 €', '72 €', '44 €', '212 €', '96 €',
      `${fixed(n0.jia, 2)} €`, `${fixed(n0.yi, 2)} €`,
      `${fixed(n3.jia, 2)} €`, `${fixed(n3.yi, 2)} €`,
      `${fixed(n10.pv58t2, 2)} €`, `${fixed(n10.yi, 2)} €`, `${fixed(n10.jia, 2)} €`, '6.49%',
      `${fixed(busYrs, 0)} 年`, '600,000 km', `${fixed(busInf, 1)}%`, `${fixed(busDisc, 1)}%`,
      '328,826 USD', '295,544 USD', `${busInvDiffPct}%`, '849,029 USD', '884,657 USD', `${busNpvDiffPct}%`,
    ],
    'cl-lcc143-actor-split-incentive-and-discount-rate-reversal.text',
  );

  // 3. Five non-commensurable monetary quantities & double counting -> cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting
  const cFive = claimById.get('cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting');
  const finGroups = q('nf-lcc143-cml-finnveden-groups');
  const finLcaGroups = q('nf-lcc143-cml-finnveden-lca-groups');
  const washCyc = q('nf-lcc143-unep11-washer-cycles-yr');
  const washKg = q('nf-lcc143-unep11-washer-load-kg');
  const washLimeV1 = q('nf-lcc143-unep11-washer-lime-v1-pct');
  const washLimeV2 = q('nf-lcc143-unep11-washer-lime-v2-pct');

  const co2Tons = decimal('0.04');
  const taxEur = multiply(co2Tons, rational(50n, 1n));
  const shadowEur = multiply(co2Tons, rational(150n, 1n));
  const doubleSumEur = add(taxEur, shadowEur);
  const residualExtEur = subtract(shadowEur, taxEur);
  if (fixed(taxEur, 2) !== '2.00' || fixed(shadowEur, 2) !== '6.00'
      || fixed(doubleSumEur, 2) !== '8.00' || fixed(residualExtEur, 2) !== '4.00'
      || fixed(finGroups, 0) !== '5' || fixed(finLcaGroups, 0) !== '3') {
    throw new Error('Cost and sustainability 5 monetary quantities / carbon tax double-count math failed');
  }
  assertProseContainsAll(
    cFive.text,
    [
      '五类截然不同的货币量', `${fixed(finGroups, 0)} 组`, `${fixed(finLcaGroups, 0)} 组`,
      '0.457 USD2013/kg', '1.47×10⁷ JPY/DALY',
      `${fixed(washCyc, 0)} 次`, `${fixed(washKg, 0)} kg`, `${fixed(washLimeV1, 2)}%`, `${fixed(washLimeV2, 2)}%`,
      '40 kg', '50 €/t', `${fixed(taxEur, 2)} €`, '150 €/t', `${fixed(shadowEur, 2)} €`,
      `${fixed(doubleSumEur, 2)} €`, `${fixed(residualExtEur, 2)} €`,
    ],
    'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting.text',
  );

  // 4. Cut-off asymmetry, allocation mismatch & rebound -> cl-lcc143-cut-off-asymmetry-and-cost-rebound-boundary
  const cCut = claimById.get('cl-lcc143-cut-off-asymmetry-and-cost-rebound-boundary');
  const savingsEur = subtract(n0.yi, n0.jia);
  if (fixed(savingsEur, 0) !== '8') {
    throw new Error('Cost and sustainability cost-saving rebound check failed');
  }
  assertProseContainsAll(
    cCut.text,
    ['并集', '润滑油', '研发', `${fixed(savingsEur, 0)} €`, '反弹效应'],
    'cl-lcc143-cut-off-asymmetry-and-cost-rebound-boundary.text',
  );

  // 5. Demarcating RA, EIA, MFA/SFA & IOA -> cl-lcc143-demarcating-ra-eia-and-mfa-ioa
  const cAdj = claimById.get('cl-lcc143-demarcating-ra-eia-and-mfa-ioa');
  const appbTools = q('nf-lcc143-cml-appb-tools');
  const beylotPubs = q('nf-lcc143-glam3-beylot-pubs');
  const dissShort = q('nf-lcc143-glam3-dissip-short-yr');
  const dissLong = q('nf-lcc143-glam3-dissip-long-yr');
  const qYear = q('nf-lcc143-suh-quesnay-year');
  const qClasses = q('nf-lcc143-suh-quesnay-classes');
  const lYear = q('nf-lcc143-suh-leontief-year');
  const aYear = q('nf-lcc143-suh-ayres-year');
  const lagMin = q('nf-lcc143-suh-io-lag-min-yr');
  const lagMax = q('nf-lcc143-suh-io-lag-max-yr');

  if (fixed(appbTools, 0) !== '6' || fixed(qYear, 0) !== '1758'
      || fixed(lYear, 0) !== '1936' || fixed(aYear, 0) !== '1969') {
    throw new Error('Cost and sustainability adjacent toolbox / IOA-MFA lineage check failed');
  }
  assertProseContainsAll(
    cAdj.text,
    [
      `${fixed(appbTools, 0)} 种环境分析工具`,
      `${fixed(qYear, 0)} 年`,
      `${fixed(lYear, 0)} 年`, `${fixed(aYear, 0)} 年`,
      `${fixed(lagMin, 0)} 至 ${fixed(lagMax, 0)} 年`,
      `${fixed(dissShort, 0)} 年`, `${fixed(dissLong, 0)} 年`,
      '10 g', '20 g', '2.00 倍',
    ],
    'cl-lcc143-demarcating-ra-eia-and-mfa-ioa.text',
  );
  assertProseContainsAll(
    cAdj.caveats.join(' '),
    [`${fixed(qClasses, 0)} 个公民阶层`, `${fixed(beylotPubs, 0)} 篇`],
    'cl-lcc143-demarcating-ra-eia-and-mfa-ioa.caveats',
  );

  // 6. Single-issue footprints vs multi-indicator profiles -> cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles
  const cFp = claimById.get('cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles');
  const stTot = q('nf-lcc143-stein-ecoinvent-indicators');
  const st161 = q('nf-lcc143-stein-step12-indicators');
  const stRem = q('nf-lcc143-stein-removed-collinear');
  const stRet = q('nf-lcc143-stein-retained-indicators');
  const stMeth = q('nf-lcc143-stein-methods');
  const stProd = q('nf-lcc143-stein-products');
  const stCats = q('nf-lcc143-stein-product-categories');
  const stPcs = q('nf-lcc143-stein-nontrivial-pcs');
  const stPcTot = q('nf-lcc143-stein-pc1to4-var-pct');
  const stPc1 = q('nf-lcc143-stein-pc1-var-pct');
  const stPc2 = q('nf-lcc143-stein-pc2-var-pct');
  const stPc3 = q('nf-lcc143-stein-pc3-var-pct');
  const stPc4 = q('nf-lcc143-stein-pc4-var-pct');
  const stB1 = q('nf-lcc143-stein-best1-var-pct');
  const stB6Cnt = q('nf-lcc143-stein-best6-count');
  const stB6Var = q('nf-lcc143-stein-best6-var-pct');
  const stFpCnt = q('nf-lcc143-stein-fp-count');
  const stFpEn = q('nf-lcc143-stein-fp-energy-pct');
  const stFpLa = q('nf-lcc143-stein-fp-land-pct');
  const stFpWa = q('nf-lcc143-stein-fp-water-pct');
  const stFpMa = q('nf-lcc143-stein-fp-material-pct');
  const stFp4 = q('nf-lcc143-stein-fp-all4-pct');
  const stFpEnLa = q('nf-lcc143-stein-fp-energy-land-pct');
  const stFp3 = q('nf-lcc143-stein-fp-3-pct');

  const fpWaterAdd = subtract(stFp4, stFp3);
  const fpUnexplained = subtract(rational(100n, 1n), stFp4);
  const pcComponentRoundedSum = add(add(stPc1, stPc2), add(stPc3, stPc4));
  if (!eq(subtract(st161, stRem), stRet)
      || fixed(fpWaterAdd, 1) !== '0.5'
      || fixed(fpUnexplained, 1) !== '15.7'
      || fixed(pcComponentRoundedSum, 1) !== '92.2') {
    throw new Error('Cost and sustainability Steinmann 2016 PCA math failed');
  }
  assertProseContainsAll(
    cFp.text,
    [
      'ISO 14067', 'ISO 14046',
      `${fixed(stTot, 0)} 项`, `${fixed(st161, 0)} 项`, `${fixed(stRem, 0)} 项`, `${fixed(stRet, 0)} 项`,
      `${fixed(stMeth, 0)} 套`, `${fixed(stCats, 0)} 大类`, `${fixed(stProd, 0)} 种产品`,
      `${fixed(stPcs, 0)} 个非平凡主成分`, `${fixed(stPcTot, 1)}%`, `${fixed(stPc1, 1)}%`,
      `${fixed(stPc2, 1)}%`, `${fixed(stPc3, 1)}%`, `${fixed(stPc4, 1)}%`,
      `${fixed(stB1, 1)}%`, `${fixed(stB6Cnt, 0)} 项机制指标`, `${fixed(stB6Var, 1)}%`,
      `${fixed(stFpCnt, 0)} 项常用资源足迹`,
      `${fixed(stFpEn, 1)}%`, `${fixed(stFpLa, 1)}%`, `${fixed(stFpMa, 1)}%`, `${fixed(stFpWa, 1)}%`,
      `${fixed(stFpEnLa, 1)}%`, `${fixed(stFp3, 1)}%`, `${fixed(fpWaterAdd, 1)}%`,
      `${fixed(stFp4, 1)}%`, `${fixed(fpUnexplained, 1)}%`,
    ],
    'cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles.text',
  );
  assertProseContainsAll(
    cFp.caveats.join(' '),
    [`${fixed(pcComponentRoundedSum, 1)}%`, `${fixed(stPcTot, 1)}%`],
    'cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles.caveats',
  );

  // 7. Dashboard IIA failure, compensatory vs ELECTRE non-compensatory outranking & eco-efficiency -> cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals
  const cMcda = claimById.get('cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals');
  const wSum = q('nf-lcc143-fink-weight-sum-pct');
  const exWe = q('nf-lcc143-fink-ex-we');
  const exWs = q('nf-lcc143-fink-ex-ws');
  const exWec = q('nf-lcc143-fink-ex-wec');
  const swEnv = q('nf-lcc143-fink-fig4-env-switch-pct');
  const swSoc = q('nf-lcc143-fink-fig4-soc-switch-pct');
  const swEcon = q('nf-lcc143-fink-fig4-econ-switch-pct');
  const lcsdWorst = q('nf-lcc143-fink-lcsd-worst');
  const lcsdBest = q('nf-lcc143-fink-lcsd-best');
  const lcsdCols = q('nf-lcc143-fink-lcsd-colours');
  const glMembers = q('nf-lcc143-glam3-survey-members');
  const glReplies = q('nf-lcc143-glam3-survey-replies');
  const glMcda = q('nf-lcc143-glam3-mcda-users');
  const glWeight = q('nf-lcc143-glam3-weighting-users');

  const lcsdScore = (x, min, max) => add(lcsdWorst, multiply(subtract(lcsdBest, lcsdWorst), divide(subtract(max, x), subtract(max, min))));
  const mean3 = (a, b, c) => divide(add(add(a, b), c), rational(3n, 1n));

  // Set 1: Jia(22,120,20), Yi(30,100,24), Bing(18,140,36)
  const s1Jia = mean3(
    lcsdScore(rational(22n, 1n), rational(18n, 1n), rational(30n, 1n)),
    lcsdScore(rational(120n, 1n), rational(100n, 1n), rational(140n, 1n)),
    lcsdScore(rational(20n, 1n), rational(20n, 1n), rational(36n, 1n)),
  );
  const s1Yi = mean3(
    lcsdScore(rational(30n, 1n), rational(18n, 1n), rational(30n, 1n)),
    lcsdScore(rational(100n, 1n), rational(100n, 1n), rational(140n, 1n)),
    lcsdScore(rational(24n, 1n), rational(20n, 1n), rational(36n, 1n)),
  );
  const s1Bing = mean3(
    lcsdScore(rational(18n, 1n), rational(18n, 1n), rational(30n, 1n)),
    lcsdScore(rational(140n, 1n), rational(100n, 1n), rational(140n, 1n)),
    lcsdScore(rational(36n, 1n), rational(20n, 1n), rational(36n, 1n)),
  );
  // Set 2 (+ strictly dominated Ding(58,140,28))
  const s2Jia = mean3(
    lcsdScore(rational(22n, 1n), rational(18n, 1n), rational(58n, 1n)),
    lcsdScore(rational(120n, 1n), rational(100n, 1n), rational(140n, 1n)),
    lcsdScore(rational(20n, 1n), rational(20n, 1n), rational(36n, 1n)),
  );
  const s2Yi = mean3(
    lcsdScore(rational(30n, 1n), rational(18n, 1n), rational(58n, 1n)),
    lcsdScore(rational(100n, 1n), rational(100n, 1n), rational(140n, 1n)),
    lcsdScore(rational(24n, 1n), rational(20n, 1n), rational(36n, 1n)),
  );
  // Set 3 {Jia(22,120,20), Yi(30,100,24), Wu(16,95,80)}
  const s3Jia = mean3(
    lcsdScore(rational(22n, 1n), rational(16n, 1n), rational(30n, 1n)),
    lcsdScore(rational(120n, 1n), rational(95n, 1n), rational(120n, 1n)),
    lcsdScore(rational(20n, 1n), rational(20n, 1n), rational(80n, 1n)),
  );
  const s3Yi = mean3(
    lcsdScore(rational(30n, 1n), rational(16n, 1n), rational(30n, 1n)),
    lcsdScore(rational(100n, 1n), rational(95n, 1n), rational(120n, 1n)),
    lcsdScore(rational(24n, 1n), rational(20n, 1n), rational(80n, 1n)),
  );
  const s3Wu = mean3(
    lcsdScore(rational(16n, 1n), rational(16n, 1n), rational(30n, 1n)),
    lcsdScore(rational(95n, 1n), rational(95n, 1n), rational(120n, 1n)),
    lcsdScore(rational(80n, 1n), rational(20n, 1n), rational(80n, 1n)),
  );

  if (!eq(multiply(add(add(exWe, exWs), exWec), rational(100n, 1n)), wSum)
      || !gt(s1Jia, s1Yi) || !gt(s1Yi, s1Bing)
      || !gt(s2Yi, s2Jia)
      || !gt(s3Wu, s3Yi) || !gt(s3Yi, s3Jia)
      || fixed(s1Jia, 2) !== '722.22' || fixed(s1Yi, 2) !== '583.33' || fixed(s1Bing, 2) !== '333.33'
      || fixed(s2Jia, 2) !== '800.00' || fixed(s2Yi, 2) !== '816.67'
      || fixed(s3Wu, 2) !== '666.67' || fixed(s3Yi, 2) !== '577.78' || fixed(s3Jia, 2) !== '523.81') {
    throw new Error('Cost and sustainability LCSD IIA & ELECTRE outranking math failed');
  }
  assertProseContainsAll(
    cMcda.text,
    [
      `${fixed(wSum, 0)}%`, `${fixed(exWe, 1)}`, `${fixed(exWs, 1)}`, `${fixed(exWec, 1)}`,
      `${fixed(swEnv, 0)}%`, `${fixed(swSoc, 0)}%`, `${fixed(swEcon, 0)}%`,
      '1,000 分', `${fixed(lcsdWorst, 0)} 分`, `${fixed(lcsdCols, 0)} 色`,
      fixed(s1Jia, 2), fixed(s1Yi, 2), fixed(s1Bing, 2),
      fixed(s2Jia, 2), fixed(s2Yi, 2),
      fixed(s3Wu, 2), fixed(s3Yi, 2), fixed(s3Jia, 2), '50 h', '60 h',
    ],
    'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals.text',
  );
  assertProseContainsAll(
    cMcda.caveats.join(' '),
    [
      `${fixed(glReplies, 0)}/${fixed(glMembers, 0)}`,
      `${fixed(glMcda, 0)}/${fixed(glReplies, 0)}`,
      `${fixed(glWeight, 0)}/${fixed(glReplies, 0)}`,
    ],
    'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals.caveats',
  );

  // 8. Planetary boundaries / carrying-capacity AESA & sharing-principle reversal -> cl-lcc143-planetary-boundaries-and-sharing-principle-reversal
  const cAesa = claimById.get('cl-lcc143-planetary-boundaries-and-sharing-principle-reversal');
  const dnCountries = q('nf-lcc143-oneill-doughnut-countries');
  const dnYear = q('nf-lcc143-oneill-global-data-year');

  const budget4Yr = rational(4000n, 1n);
  const spend4Yr = rational(40000n, 1n);
  const eJiaStar = rational(20n, 1n);
  const pJiaStar = rational(240n, 1n);
  const eYiStar = rational(16n, 1n);
  const pYiStar = rational(120n, 1n);
  const eqServiceBudget = rational(18n, 1n);

  const bExpJia = multiply(budget4Yr, divide(pJiaStar, spend4Yr));
  const bExpYi = multiply(budget4Yr, divide(pYiStar, spend4Yr));
  const rExpJia = divide(eJiaStar, bExpJia);
  const rExpYi = divide(eYiStar, bExpYi);
  const rEqJia = divide(eJiaStar, eqServiceBudget);
  const rEqYi = divide(eYiStar, eqServiceBudget);
  const one = rational(1n, 1n);

  if (!lt(rExpJia, one) || !gt(rExpYi, one)
      || !gt(rEqJia, one) || !lt(rEqYi, one)
      || fixed(bExpJia, 1) !== '24.0' || fixed(bExpYi, 1) !== '12.0'
      || fixed(rExpJia, 3) !== '0.833' || fixed(rExpYi, 3) !== '1.333'
      || fixed(rEqJia, 3) !== '1.111' || fixed(rEqYi, 3) !== '0.889'
      || fixed(dnCountries, 0) !== '150' || fixed(dnYear, 0) !== '2022') {
    throw new Error('Cost and sustainability Planetary Boundaries AESA sharing-principle math failed');
  }
  assertProseContainsAll(
    cAesa.text,
    [
      `${fixed(dnCountries, 0)} 个以上国家`, `${fixed(dnYear, 0)} 年`,
      '4,000 kg', '40,000 €', '20 kg', '240 €', '16 kg', '120 €',
      `${fixed(bExpJia, 1)} kg`, fixed(rExpJia, 3),
      `${fixed(bExpYi, 1)} kg`, fixed(rExpYi, 3),
      '18.0 kg', fixed(rEqJia, 3), fixed(rEqYi, 3),
    ],
    'cl-lcc143-planetary-boundaries-and-sharing-principle-reversal.text',
  );
  assertProseContainsAll(
    cAesa.caveats.join(' '),
    ['4,000 kg', '40,000 €', '18.0 kg', 'Bjørn'],
    'cl-lcc143-planetary-boundaries-and-sharing-principle-reversal.caveats',
  );

  if (consumed.size !== Object.keys(expectedFacts).length) {
    const missing = Object.keys(expectedFacts).filter(k => !consumed.has(k));
    throw new Error(`Cost and sustainability unconsumed numericFacts: ${missing.join(', ')}`);
  }
}
