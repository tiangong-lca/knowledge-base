import { add, decimal, divide, fixed, multiply, rational, subtract } from './exact-rational.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const efUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF3_1/EF-v3.1.zip';
const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const carriers = Object.freeze({
  efGuide2020: {
    sourceId: 'src-loc137-ef-guide-2020',
    readingId: 'rd-loc137-ef-guide-2020',
    artifact: {
      id: 'art-loc137-ef-guide-2020-pdf',
      mediaType: 'application/pdf',
      sha256: 'c5dbc3b11c0379f59927be52aadf6eb146b6067aed8f9357d24bd800c986296a',
      resolvedUrl: 'https://publications.jrc.ec.europa.eu/repository/bitstream/JRC120340/jrc120340_guide_ef_data_2.0_final.pdf',
    },
  },
  efWater: {
    sourceId: 'src-loc137-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-water125-ef-method-water',
      mediaType: 'application/xml',
      sha256: 'f06fec854a386ecd9c2d6b2de3d735b341b9f5ac68990764a3e1fd84e91268d2',
      resolvedUrl: efUrl,
    },
  },
  efAcid: {
    sourceId: 'src-loc137-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-acid113-ef-method-acid',
      mediaType: 'application/xml',
      sha256: '1a09e9e8533cc6f1027f260c2672ca6f8dd231618fe81939ed1fc22d5e066f8f',
      resolvedUrl: efUrl,
    },
  },
  efPof: {
    sourceId: 'src-loc137-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozone119-ef-method-pof',
      mediaType: 'application/xml',
      sha256: '273c43df66bfd12f7884e1c3e19d23daade5af5b96bd1d7c68802d87f7755f4a',
      resolvedUrl: efUrl,
    },
  },
  efPm: {
    sourceId: 'src-loc137-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozone119-ef-method-pm',
      mediaType: 'application/xml',
      sha256: 'bbde0609351a78fe774c39d3c2a90b8cc463cf3f57d62ffbd4c4f9cb6cb5b721',
      resolvedUrl: efUrl,
    },
  },
  efWorkbook: {
    sourceId: 'src-loc137-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-bio127-ef-nf-wf-xlsx',
      mediaType: xlsxMime,
      sha256: '8a5ceda370b2c312d085032fb9c154ce56f45e46c4d1dbba4e56cd9aedaab554',
      resolvedUrl: efUrl,
    },
  },
  pefMethod: {
    sourceId: 'src-loc137-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-bio127-ef-pef-method-pdf',
      mediaType: 'application/pdf',
      sha256: '6f2a27bf7fc1d1104ecaf9e77b208cc4e65b20e567b200975a67671133e1fab9',
      resolvedUrl: efUrl,
    },
  },
  efAddendum: {
    sourceId: 'src-tox123-ef31-addendum',
    readingId: 'rd-tox123-ef31-addendum',
    artifact: {
      id: 'art-tox123-ef31-addendum-pdf',
      mediaType: 'application/pdf',
      sha256: '76a921ca994964f158a5baf4962be2cb1cdeb73583835f7c047eed2087a952b7',
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
  ilcd2011: {
    sourceId: 'src-book-ilcd-2011-lcia-recommendations',
    readingId: 'rd-ilcd-2011-eutrophication-pathways',
    artifact: {
      id: 'art-ilcd-2011-lcia-recommendations-pdf',
      mediaType: 'application/pdf',
      sha256: '1adbcb9218443922f8c403a16b9d32b71df27c43c789925fc2afb606e8a0835f',
    },
  },
  rivm2016: {
    sourceId: 'src-land111-rivm2016',
    readingId: 'rd-land111-rivm2016',
    artifact: {
      id: 'art-land111-rivm2016-pdf',
      mediaType: 'application/pdf',
      sha256: '56f3124beba99cb3b2bd2d48bd9dc6a7d96a18275568e9575ea600052ec60597',
    },
  },
  lcImpactArticle: {
    sourceId: 'src-land111-lcimpact2020-article',
    readingId: 'rd-land111-lcimpact2020-article',
    artifact: {
      id: 'art-land111-lcimpact2020-article-pdf',
      mediaType: 'application/pdf',
      sha256: '42fa6a40f98d884135c7d4771179b0b4dfdc1f83220ea6926ee27632b4ece92e',
    },
  },
  lcImpactReport: {
    sourceId: 'src-loc137-lcimpact-ch1',
    readingId: 'rd-loc137-lcimpact-ch1',
    artifact: {
      id: 'art-loc137-lcimpact-report-pdf',
      mediaType: 'application/pdf',
      sha256: '6e3e3cb7f2e93dd9e8a770fd11a960d0273e91f82611c536a6268db6a1f04ea4',
      resolvedUrl: 'https://www.lc-impact.eu/doc/LC-IMPACT_Overall_report_20201113.pdf',
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
  glamPhase3: {
    sourceId: 'src-acid113-glam-scoping',
    readingId: 'rd-acid113-glam-scoping',
    artifact: {
      id: 'art-acid113-glam-scoping',
      mediaType: 'application/pdf',
      sha256: '6e9d7c23357801cf650432bcd0ea3c8d18699e985674320be033d65f83cd6d45',
    },
  },
  glamPm2024: {
    sourceId: 'src-kb46-glam-pm2024',
    readingId: 'rd-kb46-glam-pm2024',
    artifact: {
      id: 'art-kb46-glam-pm2024-xlsx',
      mediaType: xlsxMime,
      sha256: '86ff3e060ac78b0c6ed57f0d1d07328dae937fd8362789079a41b62fdfc3c99b',
    },
  },
});

const evidenceSpec = Object.freeze({
  'ev-loc137-ef-guide-regionalized-allowlist': { carrier: 'efGuide2020', passageId: 'psg-loc137-ef-guide-regionalized-allowlist', pdfIndices: [20, 23, 24, 27, 28, 30, 46], facts: 3 },
  'ev-loc137-ef31-water-global-locations': { carrier: 'efWater', passageId: 'psg-loc137-ef31-water-global-locations', facts: 9 },
  'ev-loc137-ef31-acid-eu36-locations': { carrier: 'efAcid', passageId: 'psg-loc137-ef31-acid-eu36-locations', facts: 9 },
  'ev-loc137-ef31-pof-flat-locations': { carrier: 'efPof', passageId: 'psg-loc137-ef31-pof-flat-locations', facts: 3 },
  'ev-loc137-ef31-pm-flat-locations': { carrier: 'efPm', passageId: 'psg-loc137-ef31-pm-flat-locations', facts: 4 },
  'ev-loc137-ef31-nf-calculation-upscaling': { carrier: 'efWorkbook', passageId: 'psg-loc137-ef31-nf-calculation-upscaling', facts: 26 },
  'ev-loc137-pef-method-global-nf': { carrier: 'pefMethod', passageId: 'psg-loc137-pef-method-global-nf', pdfIndices: [106, 230], facts: 0 },
  'ev-loc137-ef31-addendum-compliance-table': { carrier: 'efAddendum', passageId: 'psg-loc137-ef31-addendum-compliance-table', pdfIndices: [1, 3, 4], facts: 0 },
  'ev-loc137-cml2001-part3-regional-nf-bias': { carrier: 'cmlPart3', passageId: 'psg-loc137-cml2001-part3-regional-nf-bias', pdfIndices: [243, 244, 245], facts: 0 },
  'ev-loc137-ilcd2010-supply-chain-nf-boundary': { carrier: 'ilcd2010', passageId: 'psg-loc137-ilcd2010-supply-chain-nf-boundary', pdfIndices: [132, 133, 134, 139], facts: 0 },
  'ev-loc137-ilcd2011-european-scope': { carrier: 'ilcd2011', passageId: 'psg-loc137-ilcd2011-european-scope', pdfIndices: [25], facts: 0 },
  'ev-loc137-rivm2016-spatial-boxes-basins-reversals': { carrier: 'rivm2016', passageId: 'psg-loc137-rivm2016-spatial-boxes-basins-reversals', pdfIndices: [122, 123, 124, 125, 126, 127, 140, 141, 144, 171, 172, 178], facts: 25 },
  'ev-loc137-lcimpact-article-scales-vs-nf': { carrier: 'lcImpactArticle', passageId: 'psg-loc137-lcimpact-article-scales-vs-nf', pdfIndices: [2, 3, 4, 5, 14], facts: 2 },
  'ev-loc137-lcimpact-report-pdf-reg-glo-units': { carrier: 'lcImpactReport', passageId: 'psg-loc137-lcimpact-report-pdf-reg-glo-units', pdfIndices: [6, 7, 14, 15, 16, 17], facts: 2 },
  'ev-loc137-glam2019-spatial-and-rice-cases': { carrier: 'glamVol2', passageId: 'psg-loc137-glam2019-spatial-and-rice-cases', pdfIndices: [46, 52, 53, 54, 70, 72, 73, 94, 95, 96, 97, 130, 131, 132, 154, 155, 181], facts: 0 },
  'ev-loc137-glam3-territorial-vs-footprint-nf': { carrier: 'glamPhase3', passageId: 'psg-loc137-glam3-territorial-vs-footprint-nf', pdfIndices: [136, 137, 138, 139, 140], facts: 0 },
  'ev-loc137-glam-pm2024-marginal-vs-average': { carrier: 'glamPm2024', passageId: 'psg-loc137-glam-pm2024-marginal-vs-average', facts: 10 },
});

const expectedFacts = Object.freeze({
  'nf-loc137-ef-guide-categories': '16',
  'nf-loc137-ef-guide-compliance-max': '6',
  'nf-loc137-ef-guide-compliance-nopefcr': '5',
  'nf-loc137-ef31-water-country-count': '209',
  'nf-loc137-ef31-water-unspec': '42.95',
  'nf-loc137-ef31-water-es': '77.7',
  'nf-loc137-ef31-water-cn': '42.4',
  'nf-loc137-ef31-water-us': '33.8',
  'nf-loc137-ef31-water-in': '29.4',
  'nf-loc137-ef31-water-de': '1.36',
  'nf-loc137-ef31-water-ch': '1.34',
  'nf-loc137-ef31-water-jp': '0.897',
  'nf-loc137-ef31-acid-eu-count': '36',
  'nf-loc137-ef31-acid-so2-unspec': '1.31',
  'nf-loc137-ef31-acid-so2-de': '2.281',
  'nf-loc137-ef31-acid-so2-ch': '0.494',
  'nf-loc137-ef31-acid-so2-es': '0.108',
  'nf-loc137-ef31-acid-nox-unspec': '0.74',
  'nf-loc137-ef31-acid-nox-de': '0.849',
  'nf-loc137-ef31-acid-nox-ch': '0.252',
  'nf-loc137-ef31-acid-nox-es': '0.052',
  'nf-loc137-ef31-pof-eu-count': '36',
  'nf-loc137-ef31-pof-nox-flat': '1.0',
  'nf-loc137-ef31-pof-so2-flat': '0.0811',
  'nf-loc137-ef31-pm-so2-flat': '0.000008',
  'nf-loc137-ef31-pm-nox-flat': '0.0000016',
  'nf-loc137-ef31-pm-pm25-country-count': '0',
  'nf-loc137-ef31-pm-pm25-unspec': '0.000238497',
  'nf-loc137-ef31-pop': '6895889018',
  'nf-loc137-ef31-calc-rows': '1803',
  'nf-loc137-ef31-rows-eu-agri': '1287',
  'nf-loc137-ef31-eu-agri-share': '0.0384',
  'nf-loc137-ef31-rows-eu-gdp': '232',
  'nf-loc137-ef31-eu-gdp-factor': '14.12',
  'nf-loc137-ef31-rows-cn-upscale': '11',
  'nf-loc137-ef31-nf-cc': '7553.0831628511733',
  'nf-loc137-ef31-nf-acid': '55.569541230601935',
  'nf-loc137-ef31-nf-pm': '0.00059536682112547822',
  'nf-loc137-ef31-nf-terr': '176.75499978894175',
  'nf-loc137-ef31-nf-ecotox': '56716.586337059562',
  'nf-loc137-ef31-nf-htnc': '0.00012873573500807206',
  'nf-loc137-ef31-nf-htc': '0.00001725289765387052',
  'nf-loc137-ef31-cc-tot': '52085223234746.117653877693',
  'nf-loc137-ef31-cc-eu-gdp': '15724681671.196444003',
  'nf-loc137-ef31-ecotox-tot': '391111284860177.54195438016975',
  'nf-loc137-ef31-ecotox-eu-agri': '270830785673510.051517664819',
  'nf-loc137-ef31-ecotox-eu-gdp': '107796264357777.40659419981083',
  'nf-loc137-ef31-ecotox-cn': '1349271770258.4864554285',
  'nf-loc137-ef31-htnc-tot': '887747.341266321912414490989',
  'nf-loc137-ef31-htnc-eu': '173699.828381845183865525584',
  'nf-loc137-ef31-htnc-cn': '103171.1178525629329048525',
  'nf-loc137-ef31-htc-tot': '118974.067460003750102840599',
  'nf-loc137-ef31-htc-eu': '11673.196668174835404420799',
  'nf-loc137-ef31-htc-cn': '5044.665683300136834912',
  'nf-loc137-rivm-pm25-mid-world': '1',
  'nf-loc137-rivm-pm25-mid-cn-hk-mo': '2.90',
  'nf-loc137-rivm-pm25-mid-tw': '0.75',
  'nf-loc137-rivm-pm25-mid-kr': '2.15',
  'nf-loc137-rivm-pm25-mid-ch-li': '1.92',
  'nf-loc137-rivm-pm25-mid-de': '1.74',
  'nf-loc137-rivm-pm25-end-world': '0.0006292',
  'nf-loc137-rivm-pm25-end-cn-hk-mo': '0.0017',
  'nf-loc137-rivm-pm25-end-tw': '0.00035',
  'nf-loc137-rivm-pm25-end-kr': '0.0007',
  'nf-loc137-rivm-pm25-end-ch-li': '0.0015',
  'nf-loc137-rivm-pm25-end-de': '0.0013',
  'nf-loc137-rivm-o3-hofp-cn': '2.07',
  'nf-loc137-rivm-o3-eofp-cn': '0.07',
  'nf-loc137-rivm-o3-hofp-es-pt': '1.18',
  'nf-loc137-rivm-o3-eofp-es-pt': '3.41',
  'nf-loc137-rivm-acid-mid-world': '1',
  'nf-loc137-rivm-acid-mid-cn': '1.55',
  'nf-loc137-rivm-acid-mid-de': '2.43',
  'nf-loc137-rivm-acid-mid-ch': '2.21',
  'nf-loc137-rivm-water-aq-cn': '0.00000000000391',
  'nf-loc137-rivm-water-aq-xijiang': '0.00000000000167',
  'nf-loc137-rivm-water-aq-tarim': '0.00000000000199',
  'nf-loc137-rivm-water-aq-yellow': '0.00000000000484',
  'nf-loc137-rivm-water-aq-yangzi': '0.00000000000552',
  'nf-loc137-lcimpact-terr-ecoregions': '804',
  'nf-loc137-lcimpact-fw-ecoregions': '449',
  'nf-loc137-lcimpact-air-regions': '56',
  'nf-loc137-lcimpact-watersheds': '11000',
  'nf-loc137-glam-pm-marg-unspec-che': '0.00064458192336576002',
  'nf-loc137-glam-pm-marg-unspec-deu': '0.00063059019663047101',
  'nf-loc137-glam-pm-marg-unspec-chn': '0.000214601059276539',
  'nf-loc137-glam-pm-marg-urban-chn': '0.00055694249194469597',
  'nf-loc137-glam-pm-marg-rural-chn': '0.00020979090796183',
  'nf-loc137-glam-pm-avg-urban-chn': '0.00120453073487146',
  'nf-loc137-glam-pm-avg-urban-deu': '0.00085422538521359801',
  'nf-loc137-glam-pm-avg-urban-che': '0.00069890234590275202',
  'nf-loc137-glam-pm-avg-unspec-chn': '0.00042217074966757002',
  'nf-loc137-glam-pm-avg-unspec-glo': '0.00066594257332211861',
});

const gt = (a, b) => a[0] * b[1] > b[0] * a[1];
const lt = (a, b) => a[0] * b[1] < b[0] * a[1];
const eq = (a, b) => a[0] * b[1] === b[0] * a[1];

const forbiddenReaderPattern = /(?:[<>]|pdfIndices?|PDF\s*indices|web\s+extracted\s+lines|零基索引|本仓库|公开仓库|本轮|本次核读|工作树|尚未核闭|未直接重录|硬编码|與|\b(?:cl|ev|src|rd|psg|nf|art|work|lit|gap|rev|q)-[a-z0-9-]+|\bCASE-[A-Z0-9-]+\b|\bB(?:0[1-9]|[12][0-9]|3[0-2])\b|[0-9a-f]{64}|[0-9a-f]{7,}\.{3}|\b[0-9a-f]{8}\b|[0-9a-f]{8}-[0-9a-f]{4}|Xie2022|Xie等)/;

export function assertCleanLocalizationProse(str, label, allowMathComparators = false) {
  if (!scienceText(str)) {
    throw new Error(`Localization comparison reader/public hygiene check failed on ${label}: ${str}`);
  }
  let cleaned = str.replace(/B6:D21/g, 'CELL_RANGE').replace(/附录B1/g, '附录_B_1');
  if (allowMathComparators) cleaned = cleaned.replace(/[<>→]/g, '');
  if (forbiddenReaderPattern.test(cleaned)) {
    throw new Error(`Localization comparison reader/public hygiene check failed on ${label}: ${str}`);
  }
}

function assertProseContainsAll(text, tokens, label) {
  for (const token of tokens) {
    if (!text.includes(token)) {
      throw new Error(`Localization comparison prose binding missing "${token}" on ${label}`);
    }
  }
}

const requiredClaims = Object.freeze({
  'cl-loc137-ef31-location-regimes': {
    premises: ['cl-cn-characterization', 'cl-cn-reference'],
    evidence: [
      'ev-loc137-ilcd2011-european-scope',
      'ev-loc137-ef-guide-regionalized-allowlist',
      'ev-loc137-ef31-water-global-locations',
      'ev-loc137-ef31-acid-eu36-locations',
      'ev-loc137-ef31-pof-flat-locations',
      'ev-loc137-ef31-pm-flat-locations',
    ],
  },
  'cl-loc137-ef31-global-nf-extrapolation': {
    premises: ['cl-cn-reference', 'cl-loc137-ef31-location-regimes'],
    evidence: [
      'ev-loc137-pef-method-global-nf',
      'ev-loc137-ef31-nf-calculation-upscaling',
      'ev-loc137-lcimpact-article-scales-vs-nf',
    ],
  },
  'cl-loc137-dirty-denominator-paradox': {
    premises: ['cl-cn-weight-meaning', 'cl-cn-cancellation'],
    evidence: [
      'ev-loc137-cml2001-part3-regional-nf-bias',
      'ev-cn-yang-wang-liu-2001-weighting',
      'ev-cn-yang-wang-liu-2001-eil',
      'ev-kb40-tenth-plan-targets',
    ],
  },
  'cl-loc137-open-economy-boundary-reversal': {
    premises: ['cl-cn-hk-local', 'cl-cn-hk-weights', 'cl-loc137-dirty-denominator-paradox'],
    evidence: [
      'ev-hkha-2005-hk-glass-numeric',
      'ev-hkha-2005-hk-local-and-workshop',
      'ev-loc137-ilcd2010-supply-chain-nf-boundary',
      'ev-loc137-glam3-territorial-vs-footprint-nf',
      'ev-loc137-ef31-nf-calculation-upscaling',
      'ev-loc137-ef31-acid-eu36-locations',
    ],
  },
  'cl-loc137-biophysical-vs-political-units': {
    premises: ['cl-cn-hk-borrowing', 'cl-cn-hk-local', 'cl-loc137-ef31-location-regimes'],
    evidence: [
      'ev-loc137-lcimpact-article-scales-vs-nf',
      'ev-loc137-lcimpact-report-pdf-reg-glo-units',
      'ev-loc137-glam2019-spatial-and-rice-cases',
      'ev-loc137-rivm2016-spatial-boxes-basins-reversals',
    ],
  },
  'cl-loc137-pm-nonlinear-and-endpoint-reversals': {
    premises: ['cl-loc137-biophysical-vs-political-units'],
    evidence: [
      'ev-loc137-rivm2016-spatial-boxes-basins-reversals',
      'ev-loc137-glam-pm2024-marginal-vs-average',
      'ev-loc137-lcimpact-article-scales-vs-nf',
      'ev-loc137-lcimpact-report-pdf-reg-glo-units',
    ],
  },
  'cl-loc137-institutional-adoption-vs-compliance': {
    premises: ['cl-cn-standard-events', 'cl-cn-standard-authority', 'cl-loc137-ef31-location-regimes'],
    evidence: [
      'ev-cn-gbt24040-1999-official-history',
      'ev-cn-gbt24042-2002-official-history',
      'ev-loc137-ef31-addendum-compliance-table',
      'ev-loc137-pef-method-global-nf',
      'ev-weight135-ec2021-mandatory-weighting-and-pefcr',
      'ev-loc137-ilcd2011-european-scope',
    ],
  },
  'cl-loc137-four-layer-localization-audit': {
    premises: [
      'cl-regional-localization-not-translation',
      'cl-regional-method-origin-not-validity',
      'cl-loc137-ef31-global-nf-extrapolation',
      'cl-loc137-open-economy-boundary-reversal',
      'cl-loc137-pm-nonlinear-and-endpoint-reversals',
      'cl-loc137-institutional-adoption-vs-compliance',
    ],
    evidence: [
      'ev-regional-xie-localization-layers',
      'ev-regional-xie-screening-denominator',
      'ev-loc137-glam2019-spatial-and-rice-cases',
      'ev-loc137-ef31-nf-calculation-upscaling',
      'ev-loc137-rivm2016-spatial-boxes-basins-reversals',
      'ev-loc137-glam-pm2024-marginal-vs-average',
    ],
  },
});

export function validateLocalizationComparisonFactors(catalog, readings) {
  const sourceById = new Map(catalog.sources.map(row => [row.id, row]));
  const readingById = new Map(readings.readings.map(row => [row.id, row]));
  const evidenceById = new Map(catalog.evidence.map(row => [row.id, row]));
  const claimById = new Map(catalog.claims.map(row => [row.id, row]));

  const unitEvidence = catalog.evidence.filter(row => row.id.startsWith('ev-loc137-'));
  if (unitEvidence.length !== Object.keys(evidenceSpec).length) {
    throw new Error('Localization comparison has unexpected or missing ev-loc137-* records');
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
      throw new Error(`Localization comparison evidence/carrier binding failed: ${eid}`);
    }
    assertCleanLocalizationProse(ev.locator, `${eid}.locator`);
    assertCleanLocalizationProse(ev.summary, `${eid}.summary`);
    assertCleanLocalizationProse(ev.paraphrase, `${eid}.paraphrase`);
    assertCleanLocalizationProse(psg.locator, `${spec.passageId}.locator`);
    if (psg.printedPages !== undefined) {
      assertCleanLocalizationProse(psg.printedPages, `${spec.passageId}.printedPages`);
    }
    (psg.topics ?? []).forEach((tp, idx) => assertCleanLocalizationProse(tp, `${spec.passageId}.topics[${idx}]`));
    (psg.limits ?? []).forEach((lm, idx) => assertCleanLocalizationProse(lm, `${spec.passageId}.limits[${idx}]`));
    if (spec.pdfIndices ? !sameScienceValue(psg.pdfIndices, spec.pdfIndices) : psg.pdfIndices !== undefined) {
      throw new Error(`Localization comparison passage pdfIndices mismatch: ${spec.passageId}`);
    }
    const list = ev.numericFacts ?? [];
    if (list.length !== spec.facts) {
      throw new Error(`Localization comparison numericFacts count mismatch on ${eid}: got ${list.length}, expected ${spec.facts}`);
    }
    for (const item of list) {
      if (!item?.id?.startsWith('nf-loc137-') || facts.has(item.id)
          || expectedFacts[item.id] !== item.value
          || !scienceText(item.unit) || !scienceText(item.quantity) || !scienceText(item.subject) || !scienceText(item.basis)) {
        throw new Error(`Localization comparison malformed or unexpected numericFact: ${item?.id}`);
      }
      assertCleanLocalizationProse(item.unit, `${item.id}.unit`);
      assertCleanLocalizationProse(item.quantity, `${item.id}.quantity`);
      assertCleanLocalizationProse(item.subject, `${item.id}.subject`);
      assertCleanLocalizationProse(item.basis, `${item.id}.basis`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== Object.keys(expectedFacts).length) {
    throw new Error('Localization comparison numericFacts inventory differs from expectedFacts');
  }

  for (const [sid, expectedCarrier] of [
    ['src-loc137-ef-guide-2020', carriers.efGuide2020],
    ['src-loc137-ef31-selected-members', carriers.efWorkbook],
    ['src-loc137-lcimpact-ch1', carriers.lcImpactReport],
  ]) {
    const newSrc = sourceById.get(sid);
    if (!newSrc || newSrc.artifact?.sha256 !== expectedCarrier.artifact.sha256
        || newSrc.artifact?.resolvedUrl !== expectedCarrier.artifact.resolvedUrl
        || newSrc.reading?.readingId !== expectedCarrier.readingId) {
      throw new Error(`Localization comparison new source carrier/reading mismatch: ${sid}`);
    }
    assertCleanLocalizationProse(newSrc.title, `${sid}.title`);
    assertCleanLocalizationProse(newSrc.version, `${sid}.version`);
    assertCleanLocalizationProse(newSrc.publisher, `${sid}.publisher`);
    assertCleanLocalizationProse(newSrc.rights, `${sid}.rights`);
    assertCleanLocalizationProse(newSrc.preservation, `${sid}.preservation`);
    assertCleanLocalizationProse(newSrc.reading.scope, `${sid}.reading.scope`);
  }

  for (const rid of ['rd-loc137-ef-guide-2020', 'rd-loc137-lcimpact-ch1']) {
    const rd = readingById.get(rid);
    if (!rd) throw new Error(`Missing reading ${rid}`);
    assertCleanLocalizationProse(rd.title, `${rid}.title`);
    assertCleanLocalizationProse(rd.version, `${rid}.version`);
    assertCleanLocalizationProse(rd.question, `${rid}.question`);
    assertCleanLocalizationProse(rd.argumentSummary, `${rid}.argumentSummary`);
    assertCleanLocalizationProse(rd.rights, `${rid}.rights`);
    assertCleanLocalizationProse(rd.appraisal.basis, `${rid}.appraisal.basis`);
    assertCleanLocalizationProse(rd.appraisal.methodologicalScope, `${rid}.appraisal.methodologicalScope`);
    assertCleanLocalizationProse(rd.appraisal.independence, `${rid}.appraisal.independence`);
    rd.appraisal.limitations.forEach((lm, idx) => assertCleanLocalizationProse(lm, `${rid}.appraisal.limitations[${idx}]`));
    rd.unread.forEach((ur, idx) => assertCleanLocalizationProse(ur, `${rid}.unread[${idx}]`));
  }

  const consumed = new Set();
  const raw = id => {
    if (!facts.has(id)) throw new Error(`Unknown numericFact ${id}`);
    consumed.add(id);
    return facts.get(id);
  };
  const q = id => decimal(raw(id));
  const pct = (part, whole, digits = 2) => fixed(multiply(divide(part, whole), rational(100n, 1n)), digits);

  const unitClaims = catalog.claims.filter(row => row.id.startsWith('cl-loc137-'));
  if (unitClaims.length !== Object.keys(requiredClaims).length) {
    throw new Error('Localization comparison has unexpected or missing cl-loc137-* claims');
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
      throw new Error(`Localization comparison claim structure invalid: ${cid}`);
    }
    assertCleanLocalizationProse(cl.scope, `${cid}.scope`);
    assertCleanLocalizationProse(cl.text, `${cid}.text`);
    assertCleanLocalizationProse(cl.reasoning, `${cid}.reasoning`, true);
    cl.caveats.forEach((cv, i) => assertCleanLocalizationProse(cv, `${cid}.caveats[${i}]`));
    for (const eid of spec.evidence) {
      const matches = cl.evidenceLinks.filter(l => l.evidenceId === eid);
      if (matches.length !== 1 || matches[0].relation !== 'supports') {
        throw new Error(`Localization comparison claim ${cid} missing exact supports link for ${eid}`);
      }
      assertCleanLocalizationProse(matches[0].rationale, `${cid}.evidenceLinks(${eid})`);
    }
  }

  // 1. EF Guide v2.0 & EF 3.1 three location regimes + 10 kg SO2 / 10 m3 water plant -> bound to cl-loc137-ef31-location-regimes
  const cLocRegimes = claimById.get('cl-loc137-ef31-location-regimes');
  const sCategories = fixed(q('nf-loc137-ef-guide-categories'), 0);
  const sMaxDecl = fixed(q('nf-loc137-ef-guide-compliance-max'), 0);
  const sNoPefcrDecl = fixed(q('nf-loc137-ef-guide-compliance-nopefcr'), 0);
  const sWaterCodes = fixed(q('nf-loc137-ef31-water-country-count'), 0);
  const sWaterUnspec = fixed(q('nf-loc137-ef31-water-unspec'), 2);
  const wEs = q('nf-loc137-ef31-water-es');
  const wCn = q('nf-loc137-ef31-water-cn');
  const wUs = q('nf-loc137-ef31-water-us');
  const wIn = q('nf-loc137-ef31-water-in');
  const wDe = q('nf-loc137-ef31-water-de');
  const wCh = q('nf-loc137-ef31-water-ch');
  const wJp = q('nf-loc137-ef31-water-jp');
  const sAcidCodes = fixed(q('nf-loc137-ef31-acid-eu-count'), 0);
  const so2Unspec = q('nf-loc137-ef31-acid-so2-unspec');
  const so2De = q('nf-loc137-ef31-acid-so2-de');
  const so2Ch = q('nf-loc137-ef31-acid-so2-ch');
  const so2Es = q('nf-loc137-ef31-acid-so2-es');
  const noxUnspec = q('nf-loc137-ef31-acid-nox-unspec');
  const noxDe = q('nf-loc137-ef31-acid-nox-de');
  const noxCh = q('nf-loc137-ef31-acid-nox-ch');
  const noxEs = q('nf-loc137-ef31-acid-nox-es');
  const sPofCodes = fixed(q('nf-loc137-ef31-pof-eu-count'), 0);
  const sPofNox = fixed(q('nf-loc137-ef31-pof-nox-flat'), 1);
  const sPofSo2 = fixed(q('nf-loc137-ef31-pof-so2-flat'), 4);
  const pmSo2 = q('nf-loc137-ef31-pm-so2-flat');
  const pmNox = q('nf-loc137-ef31-pm-nox-flat');
  const sPmCountryCount = fixed(q('nf-loc137-ef31-pm-pm25-country-count'), 0);
  const sPmUnspec = fixed(q('nf-loc137-ef31-pm-pm25-unspec'), 9);
  const ten = rational(10n, 1n);

  const sRatioEsJp = fixed(divide(wEs, wJp), 2);
  const sRatioEsDe = fixed(divide(wEs, wDe), 2);
  const sRatioCnDe = fixed(divide(wCn, wDe), 2);
  const sRatioSo2DeEs = fixed(divide(so2De, so2Es), 2);
  const sRatioNoxDeEs = fixed(divide(noxDe, noxEs), 2);
  const sPlantAcidDe = fixed(multiply(ten, so2De), 2);
  const sPlantAcidEs = fixed(multiply(ten, so2Es), 2);
  const sPlantAcidCn = fixed(multiply(ten, so2Unspec), 2);
  const sPlantWatDe = fixed(multiply(ten, wDe), 1);
  const sPlantWatEs = fixed(multiply(ten, wEs), 1);
  const sPlantWatCn = fixed(multiply(ten, wCn), 1);

  if (sRatioEsJp !== '86.62' || sRatioEsDe !== '57.13' || sRatioCnDe !== '31.18'
      || sRatioSo2DeEs !== '21.12' || sRatioNoxDeEs !== '16.33'
      || fixed(pmSo2, 6) !== '0.000008' || fixed(pmNox, 7) !== '0.0000016'
      || sPmCountryCount !== '0') {
    throw new Error('Localization comparison EF 3.1 water/acidification/PM factor check failed');
  }
  assertProseContainsAll(
    cLocRegimes.text,
    [
      `${sCategories}类影响`, `${sMaxDecl}项`, `${sNoPefcrDecl}项`,
      `${sWaterCodes}个国家或地区位置码`, sWaterUnspec,
      fixed(wEs, 1), fixed(wJp, 3), `${sRatioEsJp}倍`,
      fixed(wCn, 1), fixed(wDe, 2), `${sRatioCnDe}倍`,
      fixed(wCh, 2), fixed(wUs, 1), fixed(wIn, 1),
      `${sAcidCodes}个欧洲`, fixed(so2De, 3), fixed(so2Es, 3), `${sRatioSo2DeEs}倍`,
      fixed(so2Ch, 3), fixed(noxDe, 3), fixed(noxEs, 3), `${sRatioNoxDeEs}倍`, fixed(noxCh, 3),
      fixed(so2Unspec, 2), fixed(noxUnspec, 2),
      `${sPofCodes}个欧洲位置行`, sPofNox, sPofSo2, '8.0×10⁻⁶', '1.6×10⁻⁶', sPmUnspec,
      sPlantAcidDe, sPlantWatDe, sPlantAcidEs, sPlantWatEs, `${sRatioEsDe}倍`,
      sPlantWatCn, sPlantAcidCn,
    ],
    'cl-loc137-ef31-location-regimes.text',
  );
  assertProseContainsAll(cLocRegimes.caveats.join(' '), [sWaterCodes], 'cl-loc137-ef31-location-regimes.caveats');

  // 2. EF 3.1 global NF calculation workbook extrapolation shares -> bound to cl-loc137-ef31-global-nf-extrapolation
  const cGlobalNf = claimById.get('cl-loc137-ef31-global-nf-extrapolation');
  const pop = q('nf-loc137-ef31-pop');
  const calcRows = q('nf-loc137-ef31-calc-rows');
  const rowsEuAgri = q('nf-loc137-ef31-rows-eu-agri');
  const euAgriShare = q('nf-loc137-ef31-eu-agri-share');
  const rowsEuGdp = q('nf-loc137-ef31-rows-eu-gdp');
  const euGdpFac = q('nf-loc137-ef31-eu-gdp-factor');
  const rowsCnUp = q('nf-loc137-ef31-rows-cn-upscale');
  const nfCc = q('nf-loc137-ef31-nf-cc');
  const nfAcid = q('nf-loc137-ef31-nf-acid');
  const nfPm = q('nf-loc137-ef31-nf-pm');
  const nfTerr = q('nf-loc137-ef31-nf-terr');
  const nfEco = q('nf-loc137-ef31-nf-ecotox');
  const nfHtnc = q('nf-loc137-ef31-nf-htnc');
  const nfHtc = q('nf-loc137-ef31-nf-htc');
  const ccTot = q('nf-loc137-ef31-cc-tot');
  const ccEuGdp = q('nf-loc137-ef31-cc-eu-gdp');
  const ecoTot = q('nf-loc137-ef31-ecotox-tot');
  const ecoEuAgri = q('nf-loc137-ef31-ecotox-eu-agri');
  const ecoEuGdp = q('nf-loc137-ef31-ecotox-eu-gdp');
  const ecoCn = q('nf-loc137-ef31-ecotox-cn');
  const htncTot = q('nf-loc137-ef31-htnc-tot');
  const htncEu = q('nf-loc137-ef31-htnc-eu');
  const htncCn = q('nf-loc137-ef31-htnc-cn');
  const htcTot = q('nf-loc137-ef31-htc-tot');
  const htcEu = q('nf-loc137-ef31-htc-eu');
  const htcCn = q('nf-loc137-ef31-htc-cn');

  const sRowPctAgri = pct(rowsEuAgri, calcRows, 2);
  const sAgriMult = fixed(divide(rational(1n, 1n), euAgriShare), 2);
  const sRowPctGdp = pct(rowsEuGdp, calcRows, 2);
  const sCcEuPct = pct(ccEuGdp, ccTot, 2);
  const sEcoAgriPct = pct(ecoEuAgri, ecoTot, 2);
  const sEcoGdpPct = pct(ecoEuGdp, ecoTot, 2);
  const sEcoEuTotPct = pct(add(ecoEuAgri, ecoEuGdp), ecoTot, 2);
  const sEcoCnPct = pct(ecoCn, ecoTot, 2);
  const sHtncEuPct = pct(htncEu, htncTot, 2);
  const sHtncCnPct = pct(htncCn, htncTot, 2);
  const sHtcEuPct = pct(htcEu, htcTot, 2);
  const sHtcCnPct = pct(htcCn, htcTot, 2);

  if (fixed(pop, 0) !== '6895889018' || sEcoEuTotPct !== '96.81'
      || fixed(divide(ccTot, pop), 2) !== fixed(nfCc, 2)
      || fixed(divide(ecoTot, pop), 2) !== fixed(nfEco, 2)
      || fixed(multiply(divide(htncTot, pop), rational(10000n, 1n)), 4) !== fixed(multiply(nfHtnc, rational(10000n, 1n)), 4)
      || fixed(multiply(divide(htcTot, pop), rational(100000n, 1n)), 4) !== fixed(multiply(nfHtc, rational(100000n, 1n)), 4)) {
    throw new Error('Localization comparison EF 3.1 global NF extrapolation math failed');
  }
  assertProseContainsAll(
    cGlobalNf.text,
    [
      '6,895,889,018', '1,803条', '1,287条', `${sRowPctAgri}%`, fixed(euAgriShare, 4), `${sAgriMult}倍`,
      `${fixed(rowsEuGdp, 0)}条`, `${sRowPctGdp}%`, fixed(euGdpFac, 2), `${fixed(rowsCnUp, 0)}条`,
      fixed(nfAcid, 2), `${fixed(multiply(nfPm, rational(10000n, 1n)), 4)}×10⁻⁴`, fixed(nfTerr, 2),
      '7,553.08', `${sCcEuPct}%`, '56,716.59', `${sEcoAgriPct}%`, `${sEcoGdpPct}%`, `${sEcoEuTotPct}%`, `${sEcoCnPct}%`,
      `${fixed(multiply(nfHtnc, rational(10000n, 1n)), 4)}×10⁻⁴`, `${fixed(multiply(nfHtc, rational(100000n, 1n)), 4)}×10⁻⁵`,
      `${sHtncEuPct}%`, `${sHtcEuPct}%`, `${sHtncCnPct}%`, `${sHtcCnPct}%`,
    ],
    'cl-loc137-ef31-global-nf-extrapolation.text',
  );
  assertProseContainsAll(cGlobalNf.caveats.join(' '), ['58.59%'], 'cl-loc137-ef31-global-nf-extrapolation.caveats');

  // 3. Tenth Five-Year Plan targets -> bound to cl-loc137-dirty-denominator-paradox
  const cDirty = claimById.get('cl-loc137-dirty-denominator-paradox');
  const tenthFacts = new Map((evidenceById.get('ev-kb40-tenth-plan-targets')?.numericFacts ?? []).map(f => [f.id, decimal(f.value)]));
  const natBase = tenthFacts.get('national-2000-baseline');
  const natCap = tenthFacts.get('national-2005-cap');
  const natRed = tenthFacts.get('national-2005-reduction');
  const zoneRed = tenthFacts.get('two-zone-2005-reduction');
  const zoneCap = tenthFacts.get('two-zone-2005-cap');
  const sNatWfRatio = fixed(divide(natBase, natCap), 3);
  const sNatWfPct = fixed(divide(rational(100n, 1n), subtract(rational(100n, 1n), natRed)), 3);
  const sZoneWf = fixed(divide(rational(100n, 1n), subtract(rational(100n, 1n), zoneRed)), 3);
  if (!natBase || !natCap || !natRed || !zoneRed || !zoneCap
      || sNatWfRatio !== '1.108' || sNatWfPct !== '1.111' || sZoneWf !== '1.250'
      || fixed(zoneCap, 0) !== '1053') {
    throw new Error('Localization comparison Tenth Plan target weight check failed');
  }
  assertProseContainsAll(
    cDirty.text,
    ['1,995万吨', '1,800万吨', `${fixed(natRed, 0)}%`, sNatWfRatio, sNatWfPct, '1,053万吨', `${fixed(zoneRed, 0)}%`, sZoneWf],
    'cl-loc137-dirty-denominator-paradox.text',
  );
  assertProseContainsAll(
    cDirty.caveats.join(' '),
    [fixed(divide(natBase, natCap), 4), fixed(divide(rational(100n, 1n), subtract(rational(100n, 1n), natRed)), 4), sZoneWf],
    'cl-loc137-dirty-denominator-paradox.caveats',
  );

  // 4. HKHA 2005 open-economy rank reversal -> bound to cl-loc137-open-economy-boundary-reversal
  const cOpen = claimById.get('cl-loc137-open-economy-boundary-reversal');
  const hkFacts = new Map((evidenceById.get('ev-hkha-2005-hk-glass-numeric')?.numericFacts ?? []).map(f => [f.id, decimal(f.value)]));
  const hkCcNorm = hkFacts.get('hk-2000-climate-norm');
  const glassCc = hkFacts.get('glass-climate-impact');
  const glassPrinted = hkFacts.get('glass-climate-normalized');
  const bSo2 = divide(nfAcid, so2Unspec);
  const breakEvenOpen = rational(150n, 1n);
  const ratioGlobal = divide(nfCc, bSo2);
  const ratioHk = divide(hkCcNorm, bSo2);
  const jiaScore = ccNorm => add(divide(rational(80n, 1n), ccNorm), divide(decimal('0.40'), bSo2));
  const yiScore = ccNorm => add(divide(rational(50n, 1n), ccNorm), divide(decimal('0.60'), bSo2));

  const sHkLowerPct = pct(subtract(nfCc, hkCcNorm), nfCc, 2);
  const sGlassGlo = fixed(multiply(divide(glassCc, nfCc), rational(10000n, 1n)), 4);
  const sGlassHk = fixed(multiply(divide(glassCc, hkCcNorm), rational(10000n, 1n)), 4);
  const sGlassUpPct = pct(subtract(divide(glassCc, hkCcNorm), divide(glassCc, nfCc)), divide(glassCc, nfCc), 2);
  const sBSo2 = fixed(bSo2, 4);
  const sRatioGlobal = fixed(ratioGlobal, 2);
  const sRatioHk = fixed(ratioHk, 2);
  const sJiaGlo = fixed(jiaScore(nfCc), 5);
  const sYiGlo = fixed(yiScore(nfCc), 5);
  const sYiHk = fixed(yiScore(hkCcNorm), 5);
  const sJiaHk = fixed(jiaScore(hkCcNorm), 5);

  if (!hkCcNorm || !glassCc || !glassPrinted
      || !gt(ratioGlobal, breakEvenOpen) || !lt(jiaScore(nfCc), yiScore(nfCc))
      || !lt(ratioHk, breakEvenOpen) || !lt(yiScore(hkCcNorm), jiaScore(hkCcNorm))) {
    throw new Error('Localization comparison HKHA 2005 open-economy reversal math failed');
  }
  assertProseContainsAll(
    cOpen.text,
    [
      '5,922.49', '7,553.08', `${sHkLowerPct}%`,
      fixed(glassCc, 4), `${sGlassGlo}×10⁻⁴`, `${sGlassHk}×10⁻⁴`, fixed(glassPrinted, 5), `${sGlassUpPct}%`,
      fixed(nfAcid, 4), fixed(so2Unspec, 2), sBSo2, '150',
      sRatioGlobal, `甲的总归一化得分（${sJiaGlo}人·年）优于乙（${sYiGlo}人·年）`,
      sRatioHk, `反转为乙（${sYiHk}人·年）优于甲（${sJiaHk}人·年）`,
    ],
    'cl-loc137-open-economy-boundary-reversal.text',
  );
  assertProseContainsAll(cOpen.caveats.join(' '), ['5,922.49', '7,553.08', sBSo2], 'cl-loc137-open-economy-boundary-reversal.caveats');

  // 5. LC-IMPACT native scales, ReCiPe 2016 boxes/basins/reversals & GLAM 2024 PM double reversal
  const cBio = claimById.get('cl-loc137-biophysical-vs-political-units');
  const cPmRev = claimById.get('cl-loc137-pm-nonlinear-and-endpoint-reversals');
  const cInst = claimById.get('cl-loc137-institutional-adoption-vs-compliance');
  const cAudit = claimById.get('cl-loc137-four-layer-localization-audit');

  const sAirReg = fixed(q('nf-loc137-lcimpact-air-regions'), 0);
  const sWatersheds = fixed(q('nf-loc137-lcimpact-watersheds'), 0);
  const sTerrEco = fixed(q('nf-loc137-lcimpact-terr-ecoregions'), 0);
  const sFwEco = fixed(q('nf-loc137-lcimpact-fw-ecoregions'), 0);
  if (sAirReg !== '56' || sWatersheds !== '11000' || sTerrEco !== '804' || sFwEco !== '449') {
    throw new Error('Localization comparison LC-IMPACT native unit counts failed');
  }

  const rMidWorld = q('nf-loc137-rivm-pm25-mid-world');
  const rMidCn = q('nf-loc137-rivm-pm25-mid-cn-hk-mo');
  const rMidTw = q('nf-loc137-rivm-pm25-mid-tw');
  const rMidKr = q('nf-loc137-rivm-pm25-mid-kr');
  const rMidCh = q('nf-loc137-rivm-pm25-mid-ch-li');
  const rMidDe = q('nf-loc137-rivm-pm25-mid-de');
  const rEndWorld = q('nf-loc137-rivm-pm25-end-world');
  const rEndCn = q('nf-loc137-rivm-pm25-end-cn-hk-mo');
  const rEndTw = q('nf-loc137-rivm-pm25-end-tw');
  const rEndKr = q('nf-loc137-rivm-pm25-end-kr');
  const rEndCh = q('nf-loc137-rivm-pm25-end-ch-li');
  const rEndDe = q('nf-loc137-rivm-pm25-end-de');

  const hofpCn = q('nf-loc137-rivm-o3-hofp-cn');
  const eofpCn = q('nf-loc137-rivm-o3-eofp-cn');
  const hofpEs = q('nf-loc137-rivm-o3-hofp-es-pt');
  const eofpEs = q('nf-loc137-rivm-o3-eofp-es-pt');

  const acMidW = q('nf-loc137-rivm-acid-mid-world');
  const acMidCn = q('nf-loc137-rivm-acid-mid-cn');
  const acMidDe = q('nf-loc137-rivm-acid-mid-de');
  const acMidCh = q('nf-loc137-rivm-acid-mid-ch');

  const watCn = q('nf-loc137-rivm-water-aq-cn');
  const watXi = q('nf-loc137-rivm-water-aq-xijiang');
  const watTar = q('nf-loc137-rivm-water-aq-tarim');
  const watYel = q('nf-loc137-rivm-water-aq-yellow');
  const watYang = q('nf-loc137-rivm-water-aq-yangzi');

  const sCnTwMid = fixed(divide(rMidCn, rMidTw), 2);
  const sCnTwEnd = fixed(divide(rEndCn, rEndTw), 2);
  const sKrDeMid = fixed(divide(rMidKr, rMidDe), 2);
  const sDeKrEnd = fixed(divide(rEndDe, rEndKr), 2);
  const sHofpRatio = fixed(divide(hofpCn, hofpEs), 2);
  const sEofpRatio = fixed(divide(eofpEs, eofpCn), 2);
  const sAcidCnUp = pct(subtract(acMidCn, acMidW), acMidW, 1);
  const sWatXiLow = pct(subtract(watCn, watXi), watCn, 2);
  const sWatYangHigh = pct(subtract(watYang, watCn), watCn, 2);
  const sWatYelXi = fixed(divide(watYel, watXi), 2);
  const sWatYangXi = fixed(divide(watYang, watXi), 2);
  const sWatCnXi = fixed(divide(watCn, watXi), 2);
  const sWatCnXiOverPct = pct(subtract(watCn, watXi), watXi, 1);

  if (!eq(rMidWorld, rational(1n, 1n))
      || !gt(rMidKr, rMidCh) || !gt(rMidCh, rMidDe)
      || !lt(rEndKr, rEndDe) || !lt(rEndKr, rEndCh)
      || !gt(rEndCn, rEndCh) || !gt(rEndCh, rEndDe) || !gt(rEndDe, rEndWorld)
      || !gt(hofpCn, hofpEs) || !gt(eofpEs, eofpCn)
      || sEofpRatio !== '48.71' || sWatYangXi !== '3.31' || sWatCnXi !== '2.34') {
    throw new Error('Localization comparison ReCiPe 2016 regional boxes/basins/reversals math failed');
  }
  assertProseContainsAll(
    cBio.text,
    [
      `${sAirReg}个世界源区`, '11,000个水文流域', `${sTerrEco}个陆地生态区`, `${sFwEco}个淡水生态区`,
      fixed(rMidCn, 2), '1.7×10⁻³', fixed(rMidTw, 2), '3.5×10⁻⁴', `${sCnTwEnd}倍`, `${sCnTwMid}倍`,
      '3.91×10⁻¹²', '1.67×10⁻¹²', `${sWatXiLow}%`,
      `${fixed(multiply(watTar, rational(1000000000000n, 1n)), 2)}×10⁻¹²`,
      '4.84×10⁻¹²', '5.52×10⁻¹²', `${sWatYangHigh}%`,
      `${sWatYelXi}倍`, `${sWatYangXi}倍`, `${sWatCnXi}倍`, `${sWatCnXiOverPct}%`,
    ],
    'cl-loc137-biophysical-vs-political-units.text',
  );

  const gMargChe = q('nf-loc137-glam-pm-marg-unspec-che');
  const gMargDeu = q('nf-loc137-glam-pm-marg-unspec-deu');
  const gMargChn = q('nf-loc137-glam-pm-marg-unspec-chn');
  const gMargUrbChn = q('nf-loc137-glam-pm-marg-urban-chn');
  const gMargRurChn = q('nf-loc137-glam-pm-marg-rural-chn');
  const gAvgUrbChn = q('nf-loc137-glam-pm-avg-urban-chn');
  const gAvgUrbDeu = q('nf-loc137-glam-pm-avg-urban-deu');
  const gAvgUrbChe = q('nf-loc137-glam-pm-avg-urban-che');
  const gAvgUnspecChn = q('nf-loc137-glam-pm-avg-unspec-chn');
  const gAvgUnspecGlo = q('nf-loc137-glam-pm-avg-unspec-glo');

  const sGMargCheChn = fixed(divide(gMargChe, gMargChn), 2);
  const sGMargDeuChn = fixed(divide(gMargDeu, gMargChn), 2);
  const sGMargUrbRur = fixed(divide(gMargUrbChn, gMargRurChn), 2);
  const sGAvgChnChe = fixed(divide(gAvgUrbChn, gAvgUrbChe), 2);

  if (!gt(gMargChe, gMargDeu) || !gt(gMargDeu, gMargChn)
      || sGMargCheChn !== '3.00' || sGMargDeuChn !== '2.94' || sGMargUrbRur !== '2.65'
      || !gt(gAvgUrbChn, gAvgUrbDeu) || !gt(gAvgUrbDeu, gAvgUrbChe) || sGAvgChnChe !== '1.72'
      || !lt(gAvgUnspecChn, gAvgUnspecGlo)) {
    throw new Error('Localization comparison GLAM 2024 PM double-reversal math failed');
  }
  assertProseContainsAll(
    cPmRev.text,
    [
      '1.7×10⁻³', '1.5×10⁻³', '1.3×10⁻³', '6.292×10⁻⁴',
      `${fixed(multiply(gMargUrbChn, rational(10000n, 1n)), 4)}×10⁻⁴`,
      `${fixed(multiply(gMargRurChn, rational(10000n, 1n)), 4)}×10⁻⁴`, `${sGMargUrbRur}倍`,
      `${fixed(multiply(gMargChe, rational(10000n, 1n)), 4)}×10⁻⁴`,
      `${fixed(multiply(gMargDeu, rational(10000n, 1n)), 4)}×10⁻⁴`,
      `${fixed(multiply(gMargChn, rational(10000n, 1n)), 4)}×10⁻⁴`,
      `${sGMargCheChn}倍`, `${sGMargDeuChn}倍`,
      `${fixed(multiply(gAvgUnspecGlo, rational(10000n, 1n)), 4)}×10⁻⁴`,
      `${fixed(multiply(gAvgUnspecChn, rational(10000n, 1n)), 4)}×10⁻⁴`,
      `${fixed(multiply(gAvgUrbChn, rational(1000n, 1n)), 4)}×10⁻³`,
      `${fixed(multiply(gAvgUrbDeu, rational(10000n, 1n)), 4)}×10⁻⁴`,
      `${fixed(multiply(gAvgUrbChe, rational(10000n, 1n)), 4)}×10⁻⁴`, `${sGAvgChnChe}倍`,
      fixed(rMidKr, 2), fixed(rMidCh, 2), fixed(rMidDe, 2), `${sKrDeMid}倍`, '7.0×10⁻⁴', `${sDeKrEnd}倍`,
      fixed(acMidCn, 2), `${sAcidCnUp}%`, fixed(acMidDe, 2), fixed(acMidCh, 2),
      fixed(hofpCn, 2), fixed(hofpEs, 2), `${sHofpRatio}倍`,
      fixed(eofpEs, 2), fixed(eofpCn, 2), `${sEofpRatio}倍`,
    ],
    'cl-loc137-pm-nonlinear-and-endpoint-reversals.text',
  );
  assertProseContainsAll(
    cPmRev.caveats.join(' '),
    ['附表S3.2', '1.40×10⁻⁷', '4.77×10⁻⁷'],
    'cl-loc137-pm-nonlinear-and-endpoint-reversals.caveats',
  );

  assertProseContainsAll(
    cInst.text,
    ['GB/T 24040', '24042', '24044—2008', 'Not defined', 'PEF', 'OEF', 'PEFCR'],
    'cl-loc137-institutional-adoption-vs-compliance.text',
  );
  assertProseContainsAll(
    cAudit.text,
    ['四道互不替代的核查门槛', '第一，', '第二，', '第三，', '第四，', '36国白名单', '5,922.49', '0.0384', '14.12', '77%（186/243）'],
    'cl-loc137-four-layer-localization-audit.text',
  );

  if (consumed.size !== Object.keys(expectedFacts).length) {
    const missing = Object.keys(expectedFacts).filter(k => !consumed.has(k));
    throw new Error(`Localization comparison unconsumed numericFacts: ${missing.join(', ')}`);
  }
}
