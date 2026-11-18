import { add, decimal, divide, fixed, multiply, rational, subtract } from './exact-rational.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const carriers = Object.freeze({
  ec2021: {
    sourceId: 'src-kb44-ec2021',
    readingId: 'rd-kb44-ec2021',
    artifact: {
      id: 'art-kb44-ec2021-r01-pdf',
      mediaType: 'application/pdf',
      sha256: '42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7',
    },
  },
  oefsrV63: {
    sourceId: 'src-soc139-oefsr-guidance-v63',
    readingId: 'rd-soc139-oefsr-guidance-v63',
    artifact: {
      id: 'art-soc139-oefsr-guidance-v63-pdf',
      mediaType: 'application/pdf',
      sha256: 'b9dd724598814b901dd1eeb02bb6067cce22c669b3e656bdf074369e41ce73b1',
      resolvedUrl: 'https://eplca.jrc.ec.europa.eu/permalink/OEFSR_guidance_v6.3.pdf',
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
  unepSheets2021: {
    sourceId: 'src-soc139-unep-sheets-2021',
    readingId: 'rd-soc139-unep-sheets-2021',
    artifact: {
      id: 'art-soc139-unep-sheets-2021-pdf',
      mediaType: 'application/pdf',
      sha256: 'c616200b47742187a632555f9b5ba63c47e6fc91b759ebaa3e05e31a456a4324',
      resolvedUrl: 'https://www.lifecycleinitiative.org/wp-content/uploads/2021/12/Methodological-Sheets_2021_final.pdf',
    },
  },
  psilcaV3: {
    sourceId: 'src-soc139-psilca-v3-doc',
    readingId: 'rd-soc139-psilca-v3-doc',
    artifact: {
      id: 'art-soc139-psilca-v3-doc-pdf',
      mediaType: 'application/pdf',
      sha256: 'da2e35f1930139d15eabf2ad4e61bffb94581dbd6181fcf5e2a8056d0ce162c6',
      resolvedUrl: 'https://psilca.net/wp-content/uploads/2020/06/PSILCA_documentation_v3.pdf',
    },
  },
  shdb2012: {
    sourceId: 'src-soc139-shdb-2012',
    readingId: 'rd-soc139-shdb-2012',
    artifact: {
      id: 'art-soc139-shdb-2012-pdf',
      mediaType: 'application/pdf',
      sha256: '5189ccfe1f79ed25b398c796af80b1ae50732e2f7cd78d032915282c212974fb',
      resolvedUrl: 'https://mdpi-res.com/d_attachment/sustainability/sustainability-04-01946/article_deploy/sustainability-04-01946.pdf',
    },
  },
  glam2026: {
    sourceId: 'src-kb46-glam2026',
    readingId: 'rd-kb46-glam2026',
    artifact: {
      id: 'art-kb46-glam2026-pdf',
      mediaType: 'application/pdf',
      sha256: '19c031ca4a2357d92b07afebef83510317b1865ba5af74117f3f6f9011b28c83',
    },
  },
  glam2026Si: {
    sourceId: 'src-kb46-glam2026',
    readingId: 'rd-kb46-glam2026',
    artifact: {
      id: 'art-kb46-glam2026-si-pdf',
      mediaType: 'application/pdf',
      sha256: 'f56ed44afbefedb1d2946a2c60f2fe7802be04aec873c8290fb5913f41310688',
    },
  },
  glamWorkXlsx: {
    sourceId: 'src-soc139-glam-work-env-2024',
    readingId: 'rd-soc139-glam-work-env-2024',
    artifact: {
      id: 'art-soc139-glam-work-env-2024-xlsx',
      mediaType: xlsxMime,
      sha256: '64df73d7c596bdb843955d270ec8de4633f4a57368da2ede8bf1ce49f96a5688',
      resolvedUrl: 'https://www.lifecycleinitiative.org/wp-content/uploads/2024/10/V1.0.2024.10.zip',
    },
  },
  meemken2021: {
    sourceId: 'src-soc139-meemken-2021',
    readingId: 'rd-soc139-meemken-2021',
    artifact: {
      id: 'art-soc139-meemken-2021-pdf',
      mediaType: 'application/pdf',
      sha256: '98c80acab69d547dad57d778fdda1759fdb32247989f02e256d3ce2ff8ac4c41',
      resolvedUrl: 'https://www.nature.com/articles/s43016-021-00360-3.pdf',
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
  glamVol2: {
    sourceId: 'src-book-unep-glam-2019-volume2',
    readingId: 'rd-unep-glam-2019-pathways',
    artifact: {
      id: 'art-unep-glam-2019-volume2-olw-pdf',
      mediaType: 'application/pdf',
      sha256: '25a581923bca994a7258c7e5748ea91f36d0f735d8ad2eaefdfb465b71702ca1',
    },
  },
});

const evidenceSpec = Object.freeze({
  'ev-soc139-ec2021-oef-garment-and-assertions': { carrier: 'ec2021', passageId: 'psg-soc139-ec2021-oef-garment-and-assertions', pdfIndices: [3, 213, 214, 217, 218], facts: 10 },
  'ev-soc139-oefsr-v63-portfolio-and-comparability': { carrier: 'oefsrV63', passageId: 'psg-soc139-oefsr-v63-portfolio-and-comparability', pdfIndices: [17, 18, 19, 28, 42], facts: 0 },
  'ev-soc139-hsg2013-social-satellite-matrix': { carrier: 'hsg2013', passageId: 'psg-soc139-hsg2013-social-satellite-matrix', pdfIndices: [8, 11, 12], facts: 0 },
  'ev-soc139-unep-sheets-2021-worker-subcategories': { carrier: 'unepSheets2021', passageId: 'psg-soc139-unep-sheets-2021-worker-subcategories', pdfIndices: [10, 14, 16, 22, 23, 24, 26, 27, 38, 39, 40], facts: 0 },
  'ev-soc139-psilca-v3-architecture-and-scales': { carrier: 'psilcaV3', passageId: 'psg-soc139-psilca-v3-architecture-and-scales', pdfIndices: [16, 18, 19, 20, 21, 22, 41, 55, 84, 85, 98, 99, 102, 103], facts: 23 },
  'ev-soc139-shdb-2012-worker-hours-and-shi': { carrier: 'shdb2012', passageId: 'psg-soc139-shdb-2012-worker-hours-and-shi', pdfIndices: [3, 7, 8, 9, 10], facts: 16 },
  'ev-soc139-glam2026-work-environment-and-activity': { carrier: 'glam2026', passageId: 'psg-soc139-glam2026-work-environment-and-activity', pdfIndices: [2, 3, 12, 13, 14, 20], facts: 9 },
  'ev-soc139-glam2026-si-work-environment-io': { carrier: 'glam2026Si', passageId: 'psg-soc139-glam2026-si-work-environment-io', pdfIndices: [21, 22, 23, 24], facts: 6 },
  'ev-soc139-glam-work-env-2024-workbook': { carrier: 'glamWorkXlsx', passageId: 'psg-soc139-glam-work-env-2024-workbook', facts: 19 },
  'ev-soc139-meemken2021-certification-bias-and-audits': { carrier: 'meemken2021', passageId: 'psg-soc139-meemken2021-certification-bias-and-audits', pdfIndices: [1, 2, 3, 4, 5], facts: 6 },
  'ev-soc139-glam3-worker-exposure-and-slca-scoring': { carrier: 'glamPhase3', passageId: 'psg-soc139-glam3-worker-exposure-and-slca-scoring', pdfIndices: [19, 20, 21, 24, 25, 26, 27, 47, 158, 162], facts: 0 },
  'ev-soc139-cml2001-part3-casualties-history': { carrier: 'cmlPart3', passageId: 'psg-soc139-cml2001-part3-casualties-history', pdfIndices: [238, 239], facts: 1 },
  'ev-soc139-ilcd2010-workplace-boundary-separation': { carrier: 'ilcd2010', passageId: 'psg-soc139-ilcd2010-workplace-boundary-separation', pdfIndices: [114, 137, 179], facts: 0 },
  'ev-soc139-glam2019-nearfield-worker-user-split': { carrier: 'glamVol2', passageId: 'psg-soc139-glam2019-nearfield-worker-user-split', pdfIndices: [86], facts: 0 },
});

const expectedFacts = Object.freeze({
  'nf-soc139-oef-nace': '14',
  'nf-soc139-oef-tshirts-qty': '40000',
  'nf-soc139-oef-tshirt-mass-kg': '0.16',
  'nf-soc139-oef-trousers-qty': '20000',
  'nf-soc139-oef-trousers-mass-kg': '0.53',
  'nf-soc139-oef-use-years': '5',
  'nf-soc139-oef-wash-energy-mj-per-kg': '0.72',
  'nf-soc139-oef-wash-water-l-per-kg': '10',
  'nf-soc139-oef-printed-weekly-energy-mj': '0.4968',
  'nf-soc139-oef-printed-weekly-water-l': '6.9',
  'nf-soc139-psilca-eora-sectors': '15000',
  'nf-soc139-psilca-wh-low': '0.001',
  'nf-soc139-psilca-wh-high': '1',
  'nf-soc139-psilca-wage-growth-pct': '3',
  'nf-soc139-psilca-cf-norisk': '0',
  'nf-soc139-psilca-cf-verylow': '0.01',
  'nf-soc139-psilca-cf-low': '0.1',
  'nf-soc139-psilca-cf-medium': '1',
  'nf-soc139-psilca-cf-high': '10',
  'nf-soc139-psilca-cf-veryhigh': '100',
  'nf-soc139-psilca-cf-opp-low': '0.1',
  'nf-soc139-psilca-cf-opp-medium': '1',
  'nf-soc139-psilca-cf-opp-high': '10',
  'nf-soc139-psilca-cf-nodata': '0.1',
  'nf-soc139-psilca-osha-denom': '100000',
  'nf-soc139-psilca-osha-typo-bound': '0.06',
  'nf-soc139-psilca-ems-typo-bound': '0.005',
  'nf-soc139-psilca-textile-nocutoff': '0.0868',
  'nf-soc139-psilca-textile-cut1e11': '0.08662',
  'nf-soc139-psilca-textile-cut1e9': '0.0842',
  'nf-soc139-psilca-textile-cut1e7': '0.07056',
  'nf-soc139-psilca-textile-cut1e5': '0.04864',
  'nf-soc139-psilca-textile-cut1e3': '0.02',
  'nf-soc139-shdb-cutoff-pct': '0.1',
  'nf-soc139-shdb-themes': '20',
  'nf-soc139-shdb-theme-countries': '191',
  'nf-soc139-shdb-sectors': '57',
  'nf-soc139-shdb-gtap-countries': '113',
  'nf-soc139-shdb-gtap-css': '6441',
  'nf-soc139-shdb-w-low': '0',
  'nf-soc139-shdb-w-med': '1',
  'nf-soc139-shdb-w-high': '2',
  'nf-soc139-shdb-w-vhigh': '3',
  'nf-soc139-shdb-share-t1-pct': '0.1',
  'nf-soc139-shdb-boost-t1-pct': '10',
  'nf-soc139-shdb-share-t2-pct': '0.2',
  'nf-soc139-shdb-boost-t2-pct': '20',
  'nf-soc139-shdb-share-t3-pct': '1',
  'nf-soc139-shdb-boost-t3-pct': '30',
  'nf-soc139-glam26-nonfatal-daly': '0.72',
  'nf-soc139-glam26-work-fatal-yll': '33.3',
  'nf-soc139-glam26-pm25-fatal-daly': '23.6',
  'nf-soc139-glam26-work-subcats': '5',
  'nf-soc139-glam26-org-chems': '235',
  'nf-soc139-glam26-fig7-sectors': '362',
  'nf-soc139-glam26-pa-benefit-high': '-0.00048',
  'nf-soc139-glam26-pa-benefit-low': '-0.0001',
  'nf-soc139-glam26-pa-min-age': '25',
  'nf-soc139-glam-si-global-dalys': '70000000',
  'nf-soc139-glam-si-injury-natures': '13',
  'nf-soc139-glam-si-age-strata': '3',
  'nf-soc139-glam-si-age-min': '15',
  'nf-soc139-glam-si-age-max': '80',
  'nf-soc139-glam-si-bea-industries': '397',
  'nf-soc139-glam-xlsx-us-sectors': '420',
  'nf-soc139-glam-xlsx-nonzero-sectors': '411',
  'nf-soc139-glam-xlsx-zero-sectors': '9',
  'nf-soc139-glam-xlsx-countries': '52',
  'nf-soc139-glam-xlsx-total-rows': '21840',
  'nf-soc139-glam-xlsx-us-wage-ref': '43746',
  'nf-soc139-glam-xlsx-de-wage-ref': '41000',
  'nf-soc139-glam-xlsx-apparel-us-orig': '0.000000066625502042457524',
  'nf-soc139-glam-xlsx-fabric-us-orig': '0.000000042086441219679446',
  'nf-soc139-glam-xlsx-yarn-us-orig': '0.000000016645387285719273',
  'nf-soc139-glam-xlsx-finishing-us-orig': '0.000000045018855311741997',
  'nf-soc139-glam-xlsx-apparel-us-matched': '0.000000066626000000000004',
  'nf-soc139-glam-xlsx-apparel-che': '0.000000043606677294398094',
  'nf-soc139-glam-xlsx-apparel-deu': '0.000000071088316975609759',
  'nf-soc139-glam-xlsx-apparel-jpn': '0.00000012352361857025475',
  'nf-soc139-glam-xlsx-apparel-chn': '0.00000021727425199133555',
  'nf-soc139-glam-xlsx-apparel-mex': '0.00000048000815856697814',
  'nf-soc139-glam-xlsx-apparel-bra': '0.00000054755002905569004',
  'nf-soc139-glam-xlsx-apparel-tur': '0.0000012540691188148148',
  'nf-soc139-meemken-land-pct': '2',
  'nf-soc139-meemken-farmers-millions': '10',
  'nf-soc139-meemken-uninspected-int-pct': '50',
  'nf-soc139-meemken-uninspected-ext-pct': '79',
  'nf-soc139-meemken-oversupply-low-pct': '30',
  'nf-soc139-meemken-oversupply-high-pct': '70',
  'nf-soc139-cml2001-casualty-cf': '1',
});

const gt = (a, b) => a[0] * b[1] > b[0] * a[1];
const lt = (a, b) => a[0] * b[1] < b[0] * a[1];
const eq = (a, b) => a[0] * b[1] === b[0] * a[1];

const forbiddenReaderPattern = /(?:[<>]|pdfIndices?|PDF\s*indices|web\s+extracted\s+lines|零基索引|本仓库|公开仓库|本轮|本次核读|工作树|尚未核闭|未直接重录|硬编码|與|\b(?:cl|ev|src|rd|psg|nf|art|work|lit|gap|rev|q)-[a-z0-9-]+|\bCASE-[A-Z0-9-]+\b|\bB(?:0[1-9]|[12][0-9]|3[0-2])\b|[0-9a-f]{64}|[0-9a-f]{7,}\.{3}|\b[0-9a-f]{8}\b|[0-9a-f]{8}-[0-9a-f]{4})/;

export function assertCleanSocialProse(str, label, allowMathComparators = false) {
  if (!scienceText(str)) {
    throw new Error(`Social comparison reader/public hygiene check failed on ${label}: ${str}`);
  }
  let cleaned = str
    .replace(/A1:P2|A1:E53|A1:F2|A1:R421|A1:V21841/g, 'CELL_RANGE');
  if (allowMathComparators) cleaned = cleaned.replace(/[<>→]/g, '');
  if (forbiddenReaderPattern.test(cleaned)) {
    throw new Error(`Social comparison reader/public hygiene check failed on ${label}: ${str}`);
  }
}

function assertProseContainsAll(text, tokens, label) {
  for (const token of tokens) {
    if (!text.includes(token)) {
      throw new Error(`Social comparison prose binding missing "${token}" on ${label}`);
    }
  }
}

const requiredClaims = Object.freeze({
  'cl-soc139-portfolio-reference-and-comparative-assertions': {
    premises: [
      'cl-sustainability-product-functional-reference',
      'cl-sustainability-organization-reporting-reference',
    ],
    evidence: [
      'ev-sustainability-slca-organizational-reference',
      'ev-soc139-ec2021-oef-garment-and-assertions',
      'ev-soc139-oefsr-v63-portfolio-and-comparability',
    ],
  },
  'cl-soc139-matrix-satellite-linearity-and-software-encoding': {
    premises: [
      'cl-sustainability-product-functional-reference',
    ],
    evidence: [
      'ev-soc139-hsg2013-social-satellite-matrix',
      'ev-soc139-unep-sheets-2021-worker-subcategories',
      'ev-soc139-psilca-v3-architecture-and-scales',
    ],
  },
  'cl-soc139-wage-price-and-automation-paradoxes': {
    premises: [
      'cl-soc139-matrix-satellite-linearity-and-software-encoding',
      'cl-sustainability-worker-hours-not-impact',
    ],
    evidence: [
      'ev-soc139-psilca-v3-architecture-and-scales',
      'ev-soc139-shdb-2012-worker-hours-and-shi',
      'ev-soc139-glam2026-work-environment-and-activity',
      'ev-soc139-glam2026-si-work-environment-io',
      'ev-soc139-glam-work-env-2024-workbook',
    ],
  },
  'cl-soc139-macro-screening-cutoffs-and-certification-limits': {
    premises: [
      'cl-sustainability-risk-not-facility-performance',
      'cl-sustainability-reference-scale-performance',
      'cl-soc139-wage-price-and-automation-paradoxes',
    ],
    evidence: [
      'ev-sustainability-slca-scale-meaning',
      'ev-soc139-shdb-2012-worker-hours-and-shi',
      'ev-soc139-psilca-v3-architecture-and-scales',
      'ev-soc139-meemken2021-certification-bias-and-audits',
    ],
  },
  'cl-soc139-occupational-health-pathways-and-rights-boundary': {
    premises: [
      'cl-sustainability-reference-scale-performance',
      'cl-sustainability-social-impact-pathways',
    ],
    evidence: [
      'ev-soc139-cml2001-part3-casualties-history',
      'ev-soc139-ilcd2010-workplace-boundary-separation',
      'ev-soc139-glam2026-work-environment-and-activity',
      'ev-soc139-glam2026-si-work-environment-io',
      'ev-soc139-glam3-worker-exposure-and-slca-scoring',
      'ev-sustainability-slca-assessment-families',
    ],
  },
  'cl-soc139-ordinal-vs-exponential-scale-reversal': {
    premises: [
      'cl-sustainability-reference-scale-performance',
      'cl-sustainability-ordinal-zero-and-net-zero',
    ],
    evidence: [
      'ev-sustainability-slca-scale-meaning',
      'ev-sustainability-slca-weighting',
      'ev-soc139-shdb-2012-worker-hours-and-shi',
      'ev-soc139-psilca-v3-architecture-and-scales',
      'ev-soc139-glam3-worker-exposure-and-slca-scoring',
    ],
  },
  'cl-soc139-three-social-zeros-and-compensation-limits': {
    premises: [
      'cl-sustainability-ordinal-zero-and-net-zero',
      'cl-soc139-ordinal-vs-exponential-scale-reversal',
    ],
    evidence: [
      'ev-sustainability-slca-scale-meaning',
      'ev-soc139-shdb-2012-worker-hours-and-shi',
      'ev-soc139-psilca-v3-architecture-and-scales',
    ],
  },
  'cl-soc139-cross-pillar-overlap-audit': {
    premises: [
      'cl-sustainability-social-object-and-stakeholders',
      'cl-sustainability-social-impact-pathways',
      'cl-soc139-occupational-health-pathways-and-rights-boundary',
      'cl-soc139-three-social-zeros-and-compensation-limits',
    ],
    evidence: [
      'ev-sustainability-slca-objects',
      'ev-soc139-glam2019-nearfield-worker-user-split',
      'ev-soc139-ilcd2010-workplace-boundary-separation',
      'ev-soc139-glam2026-work-environment-and-activity',
      'ev-soc139-hsg2013-social-satellite-matrix',
      'ev-weight135-ef31-nmvoc-htnc-subcompartments',
      'ev-weight135-ef31-styrene-htc-subcompartments',
    ],
  },
});

export function validateSocialComparisonFactors(catalog, readings) {
  const sourceById = new Map(catalog.sources.map(row => [row.id, row]));
  const readingById = new Map(readings.readings.map(row => [row.id, row]));
  const evidenceById = new Map(catalog.evidence.map(row => [row.id, row]));
  const claimById = new Map(catalog.claims.map(row => [row.id, row]));

  const unitEvidence = catalog.evidence.filter(row => row.id.startsWith('ev-soc139-'));
  if (unitEvidence.length !== Object.keys(evidenceSpec).length) {
    throw new Error('Social comparison has unexpected or missing ev-soc139-* records');
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
      throw new Error(`Social comparison evidence/carrier binding failed: ${eid}`);
    }
    assertCleanSocialProse(ev.locator, `${eid}.locator`);
    assertCleanSocialProse(ev.summary, `${eid}.summary`);
    assertCleanSocialProse(ev.paraphrase, `${eid}.paraphrase`);
    assertCleanSocialProse(psg.locator, `${spec.passageId}.locator`);
    if (psg.printedPages !== undefined) {
      assertCleanSocialProse(psg.printedPages, `${spec.passageId}.printedPages`);
    }
    (psg.topics ?? []).forEach((tp, idx) => assertCleanSocialProse(tp, `${spec.passageId}.topics[${idx}]`));
    (psg.limits ?? []).forEach((lm, idx) => assertCleanSocialProse(lm, `${spec.passageId}.limits[${idx}]`));
    if (spec.pdfIndices ? !sameScienceValue(psg.pdfIndices, spec.pdfIndices) : psg.pdfIndices !== undefined) {
      throw new Error(`Social comparison passage pdfIndices mismatch: ${spec.passageId}`);
    }
    const list = ev.numericFacts ?? [];
    if (list.length !== spec.facts) {
      throw new Error(`Social comparison numericFacts count mismatch on ${eid}: got ${list.length}, expected ${spec.facts}`);
    }
    for (const item of list) {
      if (!item?.id?.startsWith('nf-soc139-') || facts.has(item.id)
          || expectedFacts[item.id] !== item.value
          || !scienceText(item.unit) || !scienceText(item.quantity) || !scienceText(item.subject) || !scienceText(item.basis)) {
        throw new Error(`Social comparison malformed or unexpected numericFact: ${item?.id}`);
      }
      assertCleanSocialProse(item.unit, `${item.id}.unit`);
      assertCleanSocialProse(item.quantity, `${item.id}.quantity`);
      assertCleanSocialProse(item.subject, `${item.id}.subject`);
      assertCleanSocialProse(item.basis, `${item.id}.basis`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== Object.keys(expectedFacts).length) {
    throw new Error('Social comparison numericFacts inventory differs from expectedFacts');
  }

  for (const [sid, expectedCarrier] of [
    ['src-soc139-oefsr-guidance-v63', carriers.oefsrV63],
    ['src-soc139-unep-sheets-2021', carriers.unepSheets2021],
    ['src-soc139-psilca-v3-doc', carriers.psilcaV3],
    ['src-soc139-shdb-2012', carriers.shdb2012],
    ['src-soc139-glam-work-env-2024', carriers.glamWorkXlsx],
    ['src-soc139-meemken-2021', carriers.meemken2021],
  ]) {
    const newSrc = sourceById.get(sid);
    if (!newSrc || newSrc.artifact?.sha256 !== expectedCarrier.artifact.sha256
        || (expectedCarrier.artifact.resolvedUrl && newSrc.artifact?.resolvedUrl !== expectedCarrier.artifact.resolvedUrl)
        || newSrc.reading?.readingId !== expectedCarrier.readingId) {
      throw new Error(`Social comparison new source carrier/reading mismatch: ${sid}`);
    }
    assertCleanSocialProse(newSrc.title, `${sid}.title`);
    assertCleanSocialProse(newSrc.version, `${sid}.version`);
    assertCleanSocialProse(newSrc.publisher, `${sid}.publisher`);
    assertCleanSocialProse(newSrc.rights, `${sid}.rights`);
    assertCleanSocialProse(newSrc.preservation, `${sid}.preservation`);
    assertCleanSocialProse(newSrc.reading.scope, `${sid}.reading.scope`);
  }

  for (const rid of [
    'rd-soc139-oefsr-guidance-v63',
    'rd-soc139-unep-sheets-2021',
    'rd-soc139-psilca-v3-doc',
    'rd-soc139-shdb-2012',
    'rd-soc139-glam-work-env-2024',
    'rd-soc139-meemken-2021',
  ]) {
    const rd = readingById.get(rid);
    if (!rd) throw new Error(`Missing reading ${rid}`);
    assertCleanSocialProse(rd.title, `${rid}.title`);
    assertCleanSocialProse(rd.version, `${rid}.version`);
    assertCleanSocialProse(rd.question, `${rid}.question`);
    assertCleanSocialProse(rd.argumentSummary, `${rid}.argumentSummary`);
    assertCleanSocialProse(rd.rights, `${rid}.rights`);
    assertCleanSocialProse(rd.appraisal.basis, `${rid}.appraisal.basis`);
    assertCleanSocialProse(rd.appraisal.methodologicalScope, `${rid}.appraisal.methodologicalScope`);
    assertCleanSocialProse(rd.appraisal.independence, `${rid}.appraisal.independence`);
    rd.appraisal.limitations.forEach((lm, idx) => assertCleanSocialProse(lm, `${rid}.appraisal.limitations[${idx}]`));
    rd.unread.forEach((ur, idx) => assertCleanSocialProse(ur, `${rid}.unread[${idx}]`));
  }

  const consumed = new Set();
  const raw = id => {
    if (!facts.has(id)) throw new Error(`Unknown numericFact ${id}`);
    consumed.add(id);
    return facts.get(id);
  };
  const q = id => decimal(raw(id));
  const pct = (part, whole, digits = 2) => fixed(multiply(divide(part, whole), rational(100n, 1n)), digits);

  const unitClaims = catalog.claims.filter(row => row.id.startsWith('cl-soc139-'));
  if (unitClaims.length !== Object.keys(requiredClaims).length) {
    throw new Error('Social comparison has unexpected or missing cl-soc139-* claims');
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
      throw new Error(`Social comparison claim structure invalid: ${cid}`);
    }
    assertCleanSocialProse(cl.scope, `${cid}.scope`);
    assertCleanSocialProse(cl.text, `${cid}.text`);
    assertCleanSocialProse(cl.reasoning, `${cid}.reasoning`, true);
    cl.caveats.forEach((cv, i) => assertCleanSocialProse(cv, `${cid}.caveats[${i}]`));
    for (const eid of spec.evidence) {
      const matches = cl.evidenceLinks.filter(l => l.evidenceId === eid);
      if (matches.length !== 1 || matches[0].relation !== 'supports') {
        throw new Error(`Social comparison claim ${cid} missing exact supports link for ${eid}`);
      }
      assertCleanSocialProse(matches[0].rationale, `${cid}.evidenceLinks(${eid})`);
    }
  }

  // 1. OEF Y Company Ltd. garment portfolio & comparative assertions -> cl-soc139-portfolio-reference-and-comparative-assertions
  const cPortfolio = claimById.get('cl-soc139-portfolio-reference-and-comparative-assertions');
  const oefNace = q('nf-soc139-oef-nace');
  const tQty = q('nf-soc139-oef-tshirts-qty');
  const tMass = q('nf-soc139-oef-tshirt-mass-kg');
  const pQty = q('nf-soc139-oef-trousers-qty');
  const pMass = q('nf-soc139-oef-trousers-mass-kg');
  const useYrs = q('nf-soc139-oef-use-years');
  const wEn = q('nf-soc139-oef-wash-energy-mj-per-kg');
  const wWat = q('nf-soc139-oef-wash-water-l-per-kg');
  const prEn = q('nf-soc139-oef-printed-weekly-energy-mj');
  const prWat = q('nf-soc139-oef-printed-weekly-water-l');

  const totPieces = add(tQty, pQty);
  const totMass = add(multiply(tQty, tMass), multiply(pQty, pMass));
  const singleSetMass = add(tMass, pMass);
  const perPieceDiluted = fixed(divide(rational(1n, 1n), totPieces), 7);

  if (fixed(oefNace, 0) !== '14' || fixed(totPieces, 0) !== '60000'
      || fixed(totMass, 0) !== '17000' || fixed(singleSetMass, 2) !== '0.69'
      || !eq(multiply(singleSetMass, wEn), prEn) || !eq(multiply(singleSetMass, wWat), prWat)
      || perPieceDiluted !== '0.0000167') {
    throw new Error('Social comparison OEF garment portfolio math failed');
  }
  assertProseContainsAll(
    cPortfolio.text,
    ['NACE 14', '40,000 件', '0.16 kg', '20,000 条', '0.53 kg', '60,000 件', '17,000 kg', `${fixed(useYrs, 0)} 年`, perPieceDiluted],
    'cl-soc139-portfolio-reference-and-comparative-assertions.text',
  );
  assertProseContainsAll(
    cPortfolio.caveats.join(' '),
    [fixed(prEn, 4), fixed(prWat, 1), fixed(singleSetMass, 2), fixed(wEn, 2), fixed(wWat, 0), 'fro', 'environemtnal'],
    'cl-soc139-portfolio-reference-and-comparative-assertions.caveats',
  );

  // 2. Wage/price & automation paradoxes + GLAM V1.0.2024.10 uniform country wage divisor -> cl-soc139-wage-price-and-automation-paradoxes
  const cParadox = claimById.get('cl-soc139-wage-price-and-automation-paradoxes');
  const psEora = q('nf-soc139-psilca-eora-sectors');
  const psWhLow = q('nf-soc139-psilca-wh-low');
  const psWhHigh = q('nf-soc139-psilca-wh-high');
  const psWageGr = q('nf-soc139-psilca-wage-growth-pct');
  const psOshaDenom = q('nf-soc139-psilca-osha-denom');
  const shdbGtapCountries = q('nf-soc139-shdb-gtap-countries');
  const shdbSectors = q('nf-soc139-shdb-sectors');
  const shdbCss = q('nf-soc139-shdb-gtap-css');
  const fig7Sec = q('nf-soc139-glam26-fig7-sectors');
  const siSec = q('nf-soc139-glam-si-bea-industries');
  const xUsSec = q('nf-soc139-glam-xlsx-us-sectors');
  const xNonZero = q('nf-soc139-glam-xlsx-nonzero-sectors');
  const xZero = q('nf-soc139-glam-xlsx-zero-sectors');
  const xCountries = q('nf-soc139-glam-xlsx-countries');
  const xTotRows = q('nf-soc139-glam-xlsx-total-rows');
  const usWageRef = q('nf-soc139-glam-xlsx-us-wage-ref');
  const deWageRef = q('nf-soc139-glam-xlsx-de-wage-ref');
  const appUsOrig = q('nf-soc139-glam-xlsx-apparel-us-orig');
  const fabUsOrig = q('nf-soc139-glam-xlsx-fabric-us-orig');
  const yarnUsOrig = q('nf-soc139-glam-xlsx-yarn-us-orig');
  const finUsOrig = q('nf-soc139-glam-xlsx-finishing-us-orig');
  const appUsMat = q('nf-soc139-glam-xlsx-apparel-us-matched');
  const appChe = q('nf-soc139-glam-xlsx-apparel-che');
  const appDeu = q('nf-soc139-glam-xlsx-apparel-deu');
  const appJpn = q('nf-soc139-glam-xlsx-apparel-jpn');
  const appChn = q('nf-soc139-glam-xlsx-apparel-chn');
  const appMex = q('nf-soc139-glam-xlsx-apparel-mex');
  const appBra = q('nf-soc139-glam-xlsx-apparel-bra');
  const appTur = q('nf-soc139-glam-xlsx-apparel-tur');

  const rChe = fixed(divide(appChe, appUsMat), 5);
  const rDeu = fixed(divide(appDeu, appUsMat), 5);
  const rDeuWage = fixed(divide(usWageRef, deWageRef), 5);
  const rJpn = fixed(divide(appJpn, appUsMat), 5);
  const rChn = fixed(divide(appChn, appUsMat), 5);
  const rMex = fixed(divide(appMex, appUsMat), 5);
  const rBra = fixed(divide(appBra, appUsMat), 5);
  const rTur = fixed(divide(appTur, appUsMat), 5);
  const rTurChe = fixed(divide(appTur, appChe), 2);

  if (!eq(multiply(shdbGtapCountries, shdbSectors), shdbCss)
      || !eq(add(xNonZero, xZero), xUsSec)
      || !eq(multiply(xUsSec, xCountries), xTotRows)
      || rDeu !== '1.06698' || rDeu !== rDeuWage || rChe !== '0.65450'
      || rJpn !== '1.85399' || rChn !== '3.26110' || rMex !== '7.20452'
      || rBra !== '8.21826' || rTur !== '18.82252' || rTurChe !== '28.76') {
    throw new Error('Social comparison GLAM work environment wage-scaling math failed');
  }
  const e8 = v => fixed(multiply(v, rational(100000000n, 1n)), 6);
  const e7 = v => fixed(multiply(v, rational(10000000n, 1n)), 4);
  const e6 = v => fixed(multiply(v, rational(1000000n, 1n)), 4);
  assertProseContainsAll(
    cParadox.text,
    [
      '15,000 个', fixed(psWhLow, 3), `${fixed(psWhHigh, 0)} h/USD`, `${fixed(psWageGr, 0)}%`,
      `${fixed(shdbGtapCountries, 0)} 个国家或地区`, `${fixed(shdbSectors, 0)} 个部门`, '6,441 个',
      `${fixed(xUsSec, 0)} 个美国部门`, `${fixed(xNonZero, 0)} 个非零`, `${fixed(xZero, 0)} 个非生产部门`,
      `${e8(appUsOrig)}×10⁻⁸`, `${e8(fabUsOrig)}×10⁻⁸`, `${e8(yarnUsOrig)}×10⁻⁸`, `${e8(finUsOrig)}×10⁻⁸`,
      `${fixed(xCountries, 0)} 国`, '21,840 行', '6.6626×10⁻⁸', '43,746/W_c', '43,746/41,000',
      rChe, '4.3607×10⁻⁸', rDeu, '7.1088×10⁻⁸', rJpn, `${e7(appJpn)}×10⁻⁷`,
      rChn, `${e7(appChn)}×10⁻⁷`, rMex, `${e7(appMex)}×10⁻⁷`, rBra, `${e7(appBra)}×10⁻⁷`,
      rTur, `${e6(appTur)}×10⁻⁶`, `${rTurChe} 倍`, '100,000 名雇员',
    ],
    'cl-soc139-wage-price-and-automation-paradoxes.text',
  );
  assertProseContainsAll(
    cParadox.caveats.join(' '),
    [`${fixed(fig7Sec, 0)} 个部门`, `${fixed(siSec, 0)} 个工业商品部门`, `${fixed(xUsSec, 0)} 个部门`, 'Fig. 72', 'Classfied'],
    'cl-soc139-wage-price-and-automation-paradoxes.caveats',
  );
  if (fixed(psEora, 0) !== '15000' || fixed(psOshaDenom, 0) !== '100000') {
    throw new Error('Social comparison PSILCA Eora/OSHA denominator check failed');
  }

  // 3. Macro hotspot cutoffs & certification bias -> cl-soc139-macro-screening-cutoffs-and-certification-limits
  const cMacro = claimById.get('cl-soc139-macro-screening-cutoffs-and-certification-limits');
  const shdbCut = q('nf-soc139-shdb-cutoff-pct');
  const shdbThm = q('nf-soc139-shdb-themes');
  const shdbCnt = q('nf-soc139-shdb-theme-countries');
  const tNo = q('nf-soc139-psilca-textile-nocutoff');
  const t11 = q('nf-soc139-psilca-textile-cut1e11');
  const t9 = q('nf-soc139-psilca-textile-cut1e9');
  const t7 = q('nf-soc139-psilca-textile-cut1e7');
  const t5 = q('nf-soc139-psilca-textile-cut1e5');
  const t3 = q('nf-soc139-psilca-textile-cut1e3');
  const mLand = q('nf-soc139-meemken-land-pct');
  const mFarm = q('nf-soc139-meemken-farmers-millions');
  const mInt = q('nf-soc139-meemken-uninspected-int-pct');
  const mExt = q('nf-soc139-meemken-uninspected-ext-pct');
  const mOvL = q('nf-soc139-meemken-oversupply-low-pct');
  const mOvH = q('nf-soc139-meemken-oversupply-high-pct');

  const drop1e5 = pct(subtract(tNo, t5), tNo, 2);
  const drop1e3 = pct(subtract(tNo, t3), tNo, 2);
  if (!gt(tNo, t11) || !gt(t11, t9) || !gt(t9, t7) || !gt(t7, t5) || !gt(t5, t3)
      || drop1e5 !== '43.96' || drop1e3 !== '76.96') {
    throw new Error('Social comparison PSILCA German textile cutoff progression failed');
  }
  assertProseContainsAll(
    cMacro.text,
    [
      `${fixed(shdbThm, 0)} 张社会主题表`, `${fixed(shdbCnt, 0)} 个国家`, `${fixed(shdbCut, 1)}%`,
      fixed(tNo, 4), fixed(t11, 5), fixed(t9, 4), fixed(t7, 5), fixed(t5, 5), `${drop1e5}%`, fixed(t3, 2), `${drop1e3}%`,
      `不足 ${fixed(mLand, 0)}%`, '1,000 万农户', `${fixed(mInt, 0)}%`, `${fixed(mExt, 0)}%`,
      `${fixed(mOvL, 0)}% 至 ${fixed(mOvH, 0)}%`,
    ],
    'cl-soc139-macro-screening-cutoffs-and-certification-limits.text',
  );
  if (fixed(mFarm, 0) !== '10') throw new Error('Social comparison Meemken farmer count check failed');

  // 4. Occupational health trajectory -> cl-soc139-occupational-health-pathways-and-rights-boundary
  const cHealth = claimById.get('cl-soc139-occupational-health-pathways-and-rights-boundary');
  const cmlCf = q('nf-soc139-cml2001-casualty-cf');
  const gDalys = q('nf-soc139-glam-si-global-dalys');
  const gNatures = q('nf-soc139-glam-si-injury-natures');
  const gStrata = q('nf-soc139-glam-si-age-strata');
  const gAgeMin = q('nf-soc139-glam-si-age-min');
  const gAgeMax = q('nf-soc139-glam-si-age-max');
  const gNonFatal = q('nf-soc139-glam26-nonfatal-daly');
  const gFatal = q('nf-soc139-glam26-work-fatal-yll');
  const gPmFatal = q('nf-soc139-glam26-pm25-fatal-daly');
  const gSubcats = q('nf-soc139-glam26-work-subcats');
  const gChems = q('nf-soc139-glam26-org-chems');
  const gPaHigh = q('nf-soc139-glam26-pa-benefit-high');
  const gPaLow = q('nf-soc139-glam26-pa-benefit-low');
  const gPaAge = q('nf-soc139-glam26-pa-min-age');

  const rFatalPm = fixed(divide(gFatal, gPmFatal), 2);
  if (fixed(cmlCf, 0) !== '1' || fixed(gDalys, 0) !== '70000000'
      || rFatalPm !== '1.41' || !lt(gPaHigh, gPaLow) || !lt(gPaLow, rational(0n, 1n))) {
    throw new Error('Social comparison occupational health pathway math failed');
  }
  assertProseContainsAll(
    cHealth.text,
    [
      `表征因子 ${fixed(cmlCf, 0)}`, '70,000,000 DALY',
      `${fixed(gNatures, 0)} 类伤害性质`, `${fixed(gAgeMin, 0)} 至 ${fixed(gAgeMax, 0)} 岁`,
      '三组年龄层', fixed(gNonFatal, 2), fixed(gFatal, 1), fixed(gPmFatal, 1), `${rFatalPm} 倍`,
      `${fixed(gChems, 0)} 种`, `${fixed(gSubcats, 0)} 套子指标`, `${fixed(gPaAge, 0)} 岁`,
      '−1×10⁻⁴', '−4.8×10⁻⁴',
    ],
    'cl-soc139-occupational-health-pathways-and-rights-boundary.text',
  );
  if (fixed(gStrata, 0) !== '3') throw new Error('Social comparison GLAM age strata count failed');

  // 5. SHDB linear vs PSILCA exponential scale 15.77x rank reversal -> cl-soc139-ordinal-vs-exponential-scale-reversal & three zeros
  const cRev = claimById.get('cl-soc139-ordinal-vs-exponential-scale-reversal');
  const cZeros = claimById.get('cl-soc139-three-social-zeros-and-compensation-limits');
  const cOverlap = claimById.get('cl-soc139-cross-pillar-overlap-audit');

  const swLow = q('nf-soc139-shdb-w-low');
  const swMed = q('nf-soc139-shdb-w-med');
  const swHigh = q('nf-soc139-shdb-w-high');
  const swVHigh = q('nf-soc139-shdb-w-vhigh');
  const shT1 = q('nf-soc139-shdb-share-t1-pct');
  const shB1 = q('nf-soc139-shdb-boost-t1-pct');
  const shT2 = q('nf-soc139-shdb-share-t2-pct');
  const shB2 = q('nf-soc139-shdb-boost-t2-pct');
  const shT3 = q('nf-soc139-shdb-share-t3-pct');
  const shB3 = q('nf-soc139-shdb-boost-t3-pct');

  const pNo = q('nf-soc139-psilca-cf-norisk');
  const pVL = q('nf-soc139-psilca-cf-verylow');
  const pL = q('nf-soc139-psilca-cf-low');
  const pM = q('nf-soc139-psilca-cf-medium');
  const pH = q('nf-soc139-psilca-cf-high');
  const pVH = q('nf-soc139-psilca-cf-veryhigh');
  const pOpL = q('nf-soc139-psilca-cf-opp-low');
  const pOpM = q('nf-soc139-psilca-cf-opp-medium');
  const pOpH = q('nf-soc139-psilca-cf-opp-high');
  const pNoData = q('nf-soc139-psilca-cf-nodata');
  const pOshaTypo = q('nf-soc139-psilca-osha-typo-bound');
  const pEmsTypo = q('nf-soc139-psilca-ems-typo-bound');

  const h10 = rational(10n, 1n);
  const h90 = rational(90n, 1n);
  const h60 = rational(60n, 1n);
  const h40 = rational(40n, 1n);
  const linJia = add(multiply(h10, swVHigh), multiply(h90, swLow));
  const linYi = add(multiply(h60, swMed), multiply(h40, swLow));
  const expJia = add(multiply(h10, pVH), multiply(h90, pL));
  const expYi = add(multiply(h60, pM), multiply(h40, pL));
  const linRatio = fixed(divide(linYi, linJia), 2);
  const expRatio = fixed(divide(expJia, expYi), 2);
  const noData90 = fixed(multiply(h90, pNoData), 1);

  if (!lt(linJia, linYi) || !gt(expJia, expYi)
      || fixed(linJia, 0) !== '30' || fixed(linYi, 0) !== '60' || linRatio !== '2.00'
      || fixed(expJia, 0) !== '1009' || fixed(expYi, 0) !== '64' || expRatio !== '15.77'
      || noData90 !== '9.0') {
    throw new Error('Social comparison SHDB linear vs PSILCA exponential reversal math failed');
  }
  assertProseContainsAll(
    cRev.text,
    [
      `${fixed(swLow, 0)}、${fixed(swMed, 0)}、${fixed(swHigh, 0)}、${fixed(swVHigh, 0)} 分`,
      `${fixed(shT1, 1)}%`, `${fixed(shT2, 1)}%`, `${fixed(shT3, 0)}%`,
      `${fixed(shB1, 0)}%`, `${fixed(shB2, 0)}%`, `${fixed(shB3, 0)}%`,
      fixed(pNo, 0), fixed(pVL, 2), fixed(pL, 1), fixed(pM, 0), fixed(pH, 0), fixed(pVH, 0),
      `${fixed(pOpL, 1)}、${fixed(pOpM, 0)}、${fixed(pOpH, 0)}`,
      `= ${fixed(linJia, 0)} 分`, `= ${fixed(linYi, 0)} 分`, `${linRatio} 倍`, '封顶为 100',
      '1,009 中风险工时', `${fixed(expYi, 0)} 中风险工时`, `${expRatio} 倍`,
    ],
    'cl-soc139-ordinal-vs-exponential-scale-reversal.text',
  );
  assertProseContainsAll(
    cRev.caveats.join(' '),
    ['DALYs', `y ≤ ${fixed(pOshaTypo, 2)}`, fixed(pEmsTypo, 3)],
    'cl-soc139-ordinal-vs-exponential-scale-reversal.caveats',
  );
  assertProseContainsAll(
    cZeros.text,
    ['三种“零”', fixed(pNoData, 1), `${noData90} 中风险工时`],
    'cl-soc139-three-social-zeros-and-compensation-limits.text',
  );
  assertProseContainsAll(
    cOverlap.text,
    ['第一格', '第二格', '第三格', '第四格', '约 211 倍'],
    'cl-soc139-cross-pillar-overlap-audit.text',
  );

  if (consumed.size !== Object.keys(expectedFacts).length) {
    const missing = Object.keys(expectedFacts).filter(k => !consumed.has(k));
    throw new Error(`Social comparison unconsumed numericFacts: ${missing.join(', ')}`);
  }
}
