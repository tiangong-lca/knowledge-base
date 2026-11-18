import { add, decimal, divide, fixed, multiply, rational } from './exact-rational.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const efUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF3_1/EF-v3.1.zip';
const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const carriers = Object.freeze({
  efWorkbook: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-bio127-ef-nf-wf-xlsx',
      mediaType: xlsxMime,
      sha256: '8a5ceda370b2c312d085032fb9c154ce56f45e46c4d1dbba4e56cd9aedaab554',
      resolvedUrl: efUrl,
    },
  },
  efPof: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozone119-ef-method-pof',
      mediaType: 'application/xml',
      sha256: '273c43df66bfd12f7884e1c3e19d23daade5af5b96bd1d7c68802d87f7755f4a',
      resolvedUrl: efUrl,
    },
  },
  efAcid: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-acid113-ef-method-acid',
      mediaType: 'application/xml',
      sha256: '1a09e9e8533cc6f1027f260c2672ca6f8dd231618fe81939ed1fc22d5e066f8f',
      resolvedUrl: efUrl,
    },
  },
  efTerr: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-acid113-ef-method-nutrient',
      mediaType: 'application/xml',
      sha256: '72f1187a0682e186bdedf74f60fe99a1e1dafa7469141af74dfe4ea21c296992',
      resolvedUrl: efUrl,
    },
  },
  efMarine: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozone119-ef-method-marine',
      mediaType: 'application/xml',
      sha256: 'a681b4b9b2d853697e2e044719d43cb7eaa6b8e185af8b00bb277aa92e735301',
      resolvedUrl: efUrl,
    },
  },
  efPm: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozone119-ef-method-pm',
      mediaType: 'application/xml',
      sha256: 'bbde0609351a78fe774c39d3c2a90b8cc463cf3f57d62ffbd4c4f9cb6cb5b721',
      resolvedUrl: efUrl,
    },
  },
  efEcotox: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-flow-pilot-ef-05316e7a',
      mediaType: 'application/xml',
      sha256: '252fe760308a14b647ba2a32e8e056f9d8434235be9f1bf3b0d452afe4548cd4',
      resolvedUrl: efUrl,
    },
  },
  efHtnc: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-tox123-ef-method-htnc',
      mediaType: 'application/xml',
      sha256: 'd932a60f1615945df21b823f19321d80427a6eadb1b3e816f40153726b39993f',
      resolvedUrl: efUrl,
    },
  },
  efHtc: {
    sourceId: 'src-weight135-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-tox123-ef-method-htc',
      mediaType: 'application/xml',
      sha256: 'f8f23807aa68f005c4dacae10aff931c568e8a74a4faad6717438b2d2c20dc35',
      resolvedUrl: efUrl,
    },
  },
  pefGuidance: {
    sourceId: 'src-kb44-pef-guidance2018',
    readingId: 'rd-kb44-pef-guidance2018',
    artifact: {
      id: 'art-kb44-pef-guidance2018-pdf',
      mediaType: 'application/pdf',
      sha256: 'e73d586a4552e397de8411350baeba586a5188a3b3e8c61c5f27ac8fe0ab431e',
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
  jrc130796: {
    sourceId: 'src-flow-pilot-ef31-update',
    readingId: 'rd-flow-pilot-ef31-update',
    artifact: {
      id: 'art-flow-pilot-ef31-jrc130796',
      mediaType: 'application/pdf',
      sha256: '938d7272de6769e8d484bcfc10f8c9be3688caa4a718d298790e8df7b3a65c58',
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
  cmlPart2a: {
    sourceId: 'src-book-cml-2001-part2a',
    readingId: 'rd-cml-2001-part2a',
    artifact: {
      id: 'art-cml-2001-part2a-pdf',
      mediaType: 'application/pdf',
      sha256: 'caf3c98f7e94e4608284b859041240b665f443f0f72f2795a6c058caf588788f',
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
  rivm: {
    sourceId: 'src-land111-rivm2016',
    readingId: 'rd-land111-rivm2016',
    artifact: {
      id: 'art-land111-rivm2016-pdf',
      mediaType: 'application/pdf',
      sha256: '56f3124beba99cb3b2bd2d48bd9dc6a7d96a18275568e9575ea600052ec60597',
    },
  },
  recipe2017: {
    sourceId: 'src-book-recipe-2017-primary-article',
    readingId: 'rd-recipe-2017-primary-article',
    artifact: {
      id: 'art-recipe-2017-primary-article-pdf',
      mediaType: 'application/pdf',
      sha256: 'f6d1909e9b11c37c89303130037403fb5de724a099982498af5b29dd9c4ef543',
    },
  },
  glam3: {
    sourceId: 'src-acid113-glam-scoping',
    readingId: 'rd-acid113-glam-scoping',
    artifact: {
      id: 'art-acid113-glam-scoping',
      mediaType: 'application/pdf',
      sha256: '6e9d7c23357801cf650432bcd0ea3c8d18699e985674320be033d65f83cd6d45',
    },
  },
});

const evidenceSpec = Object.freeze({
  'ev-weight135-ef31-nf-wf-workbook': { carrier: 'efWorkbook', passageId: 'psg-weight135-ef31-nf-wf-workbook', facts: 19 },
  'ev-weight135-ef31-pof-equal-cf': { carrier: 'efPof', passageId: 'psg-weight135-ef31-nmvoc-nox-pof', facts: 4 },
  'ev-weight135-ef31-nox-acid': { carrier: 'efAcid', passageId: 'psg-weight135-ef31-nox-acid', facts: 1 },
  'ev-weight135-ef31-nox-terr': { carrier: 'efTerr', passageId: 'psg-weight135-ef31-nox-terr', facts: 1 },
  'ev-weight135-ef31-nox-marine': { carrier: 'efMarine', passageId: 'psg-weight135-ef31-nox-marine', facts: 1 },
  'ev-weight135-ef31-nox-and-pm25-pm': { carrier: 'efPm', passageId: 'psg-weight135-ef31-nox-and-pm25-pm', facts: 5 },
  'ev-weight135-ef31-nmvoc-ecotox-subcompartments': { carrier: 'efEcotox', passageId: 'psg-weight135-ef31-nmvoc-ecotox', facts: 6 },
  'ev-weight135-ef31-nmvoc-htnc-subcompartments': { carrier: 'efHtnc', passageId: 'psg-weight135-ef31-nmvoc-htnc', facts: 6 },
  'ev-weight135-ef31-styrene-htc-subcompartments': { carrier: 'efHtc', passageId: 'psg-weight135-ef31-styrene-htc', facts: 2 },
  'ev-weight135-pef-guidance-robustness-table': { carrier: 'pefGuidance', passageId: 'psg-weight135-pef-guidance-annex-a-wf', pdfIndices: [162, 163, 208], facts: 12 },
  'ev-weight135-ec2021-mandatory-weighting-and-pefcr': { carrier: 'ec2021', passageId: 'psg-weight135-ec2021-norm-weight-assertions', pdfIndices: [22, 23, 87, 88, 89, 277, 278, 279], facts: 2 },
  'ev-weight135-jrc130796-nf-drift-and-rankings': { carrier: 'jrc130796', passageId: 'psg-weight135-jrc130796-nf-and-single-score', pdfIndices: [24, 25, 26, 27, 31, 32, 33, 34, 35, 36, 37, 38], facts: 15 },
  'ev-weight135-ilcd2010-no-public-weighting': { carrier: 'ilcd2010', passageId: 'psg-weight135-ilcd2010-norm-weight-prohibition', pdfIndices: [127, 128, 134, 298, 300, 301, 302, 303], facts: 0 },
  'ev-weight135-cml2001-part2a-optional-and-ban': { carrier: 'cmlPart2a', passageId: 'psg-weight135-cml2001-part2a-norm-weight', pdfIndices: [73, 74, 75, 76, 77, 78], facts: 0 },
  'ev-weight135-cml2001-part3-finnveden-monetary': { carrier: 'cmlPart3', passageId: 'psg-weight135-cml2001-part3-finnveden-monetary', pdfIndices: [243, 244, 245, 246, 247, 248, 249, 250, 251], facts: 0 },
  'ev-weight135-rivm2016-aop-and-perspectives': { carrier: 'rivm', passageId: 'psg-weight135-rivm2016-aop-and-table15', pdfIndices: [17, 18, 22, 23], facts: 7 },
  'ev-weight135-recipe2017-three-aop-halt': { carrier: 'recipe2017', passageId: 'psg-weight135-recipe2017-aop-halt', pdfIndices: [1, 2, 7], facts: 2 },
  'ev-weight135-glam3-scoping-agenda': { carrier: 'glam3', passageId: 'psg-weight135-glam3-weighting-agenda', pdfIndices: [133, 134, 140, 141, 142, 143, 155, 157, 158, 159, 160, 161, 162], facts: 0 },
});

const expectedFacts = Object.freeze({
  'nf-weight135-ef31-pop': '6895889018',
  'nf-weight135-ef31-nf-acid': '55.569541230601935',
  'nf-weight135-ef31-nf-cc': '7553.0831628511733',
  'nf-weight135-ef31-nf-ecotox': '56716.586337059562',
  'nf-weight135-ef31-nf-pm': '0.00059536682112547822',
  'nf-weight135-ef31-nf-marine': '19.545181551919121',
  'nf-weight135-ef31-nf-terr': '176.75499978894175',
  'nf-weight135-ef31-nf-htc': '0.00001725289765387052',
  'nf-weight135-ef31-nf-htnc': '0.00012873573500807206',
  'nf-weight135-ef31-nf-pof': '40.859197734777169',
  'nf-weight135-ef31-wf-acid': '0.062',
  'nf-weight135-ef31-wf-cc': '0.2106',
  'nf-weight135-ef31-wf-ecotox': '0.0192',
  'nf-weight135-ef31-wf-pm': '0.0896',
  'nf-weight135-ef31-wf-marine': '0.0296',
  'nf-weight135-ef31-wf-terr': '0.0371',
  'nf-weight135-ef31-wf-htc': '0.0213',
  'nf-weight135-ef31-wf-htnc': '0.0184',
  'nf-weight135-ef31-wf-pof': '0.0478',
  'nf-weight135-ef31-pof-nmvoc-outdoor': '1.0',
  'nf-weight135-ef31-pof-nox': '1.0',
  'nf-weight135-ef31-pof-styrene-outdoor': '0.24',
  'nf-weight135-ef31-pof-voc-indoor': '0',
  'nf-weight135-ef31-nox-acid': '0.74',
  'nf-weight135-ef31-nox-terr': '4.26',
  'nf-weight135-ef31-nox-marine': '0.389',
  'nf-weight135-ef31-nox-pm-urban-unspec': '0.0000016',
  'nf-weight135-ef31-nox-pm-nonurban': '0.00000021',
  'nf-weight135-ef31-pm25-urban-ground': '0.000238497',
  'nf-weight135-ef31-pm25-urban-highstack': '0.0000632619',
  'nf-weight135-ef31-pm25-nonurban-ground': '0.0000113763',
  'nf-weight135-ef31-nmvoc-ecotox-unspec': '8.6069',
  'nf-weight135-ef31-nmvoc-ecotox-urban': '9.4933',
  'nf-weight135-ef31-nmvoc-ecotox-nonurban': '7.7204',
  'nf-weight135-ef31-nmvoc-ecotox-indoor': '8.8728',
  'nf-weight135-ef31-styrene-ecotox-unspec': '0.22706',
  'nf-weight135-ef31-styrene-ecotox-indoor': '0.2382',
  'nf-weight135-ef31-nmvoc-htnc-unspec': '0.000000062186',
  'nf-weight135-ef31-nmvoc-htnc-urban': '0.00000011026',
  'nf-weight135-ef31-nmvoc-htnc-nonurban': '0.000000014112',
  'nf-weight135-ef31-nmvoc-htnc-indoor': '0.000008957',
  'nf-weight135-ef31-styrene-htnc-unspec': '0.000000019325',
  'nf-weight135-ef31-styrene-htnc-indoor': '0.000004075',
  'nf-weight135-ef31-styrene-htc-unspec': '0.00000051149',
  'nf-weight135-ef31-styrene-htc-indoor': '0.00010787',
  'nf-weight135-pef-a-cc': '12.9',
  'nf-weight135-pef-a-htc': '6.8',
  'nf-weight135-pef-a-htnc': '5.88',
  'nf-weight135-pef-a-ecotox': '6.12',
  'nf-weight135-pef-a-pm': '5.49',
  'nf-weight135-pef-a-sum16': '100.03',
  'nf-weight135-pef-b-high': '0.87',
  'nf-weight135-pef-b-tox': '0.17',
  'nf-weight135-pef-c-cc': '11.18',
  'nf-weight135-pef-c-htc': '1.13',
  'nf-weight135-pef-notox-cc': '22.19',
  'nf-weight135-pef-notox-pm': '9.54',
  'nf-weight135-ec2021-mric-share': '80',
  'nf-weight135-ec2021-mric-min-count': '3',
  'nf-weight135-jrc130796-htnc-ef30': '0.000230',
  'nf-weight135-jrc130796-htnc-ef31': '0.000129',
  'nf-weight135-jrc130796-htnc-diff': '-44',
  'nf-weight135-jrc130796-ecotox-ef30': '42700',
  'nf-weight135-jrc130796-ecotox-ef31': '56700',
  'nf-weight135-jrc130796-ecotox-diff': '33',
  'nf-weight135-jrc130796-cc-diff': '-6.7',
  'nf-weight135-jrc130796-datasets-total': '2752',
  'nf-weight135-jrc130796-top-ecotox': '1535',
  'nf-weight135-jrc130796-top-cc': '1043',
  'nf-weight135-jrc130796-top-htnc': '172',
  'nf-weight135-jrc130796-top-htc': '1',
  'nf-weight135-jrc130796-rank1-changed': '171',
  'nf-weight135-jrc130796-rank2-changed': '280',
  'nf-weight135-jrc130796-rank3-changed': '358',
  'nf-weight135-rivm-co2-hh-i': '0.000000081',
  'nf-weight135-rivm-co2-hh-h': '0.00000093',
  'nf-weight135-rivm-co2-hh-e': '0.000013',
  'nf-weight135-rivm-pm25-hh': '0.00063',
  'nf-weight135-rivm-cu-ra-i': '0.16',
  'nf-weight135-rivm-cu-ra-he': '0.23',
  'nf-weight135-rivm-oil-ra': '0.46',
  'nf-weight135-recipe2017-midpoints': '17',
  'nf-weight135-recipe2017-aops': '3',
});

const gt = (a, b) => a[0] * b[1] > b[0] * a[1];
const lt = (a, b) => a[0] * b[1] < b[0] * a[1];
const eq = (a, b) => a[0] * b[1] === b[0] * a[1];

const forbiddenReaderPattern = /(?:[<>]|pdfIndices?|本仓库|未直接重录|硬编码|與|\b(?:cl|ev|src|rd|psg|nf|art)-[a-z0-9-]+|\bB(?:0[1-9]|[12][0-9]|3[0-2])\b|[0-9a-f]{8}-[0-9a-f]{4}|3fcaafc9|7f857e81|b5c6[0-9a-f]{4}|05316e7a|7cfdcfcf|2299222a)/;

function assertCleanReaderProse(str, label, allowReasoningArrow = false) {
  let cleaned = str.replace(/(?:B6:C21、B24|及B24引Sala等)/g, 'B6:C21');
  if (allowReasoningArrow) cleaned = cleaned.replace(/→/g, '');
  if (!scienceText(str) || forbiddenReaderPattern.test(cleaned)) {
    throw new Error(`Weighting and valuation reader/public hygiene check failed on ${label}: ${str}`);
  }
}

const requiredClaims = Object.freeze({
  'cl-weight135-ef-coating-outdoor': {
    premises: ['cl-es-selection', 'cl-es-service', 'cl-es-score', 'cl-es-threshold'],
    evidence: [
      'ev-es-nmvoc',
      'ev-es-nox',
      'ev-es-new-nmvoc',
      'ev-es-new-nox',
      'ev-weight135-ef31-pof-equal-cf',
      'ev-weight135-ef31-nox-acid',
      'ev-weight135-ef31-nox-terr',
      'ev-weight135-ef31-nox-marine',
      'ev-weight135-ef31-nox-and-pm25-pm',
      'ev-weight135-ef31-nmvoc-ecotox-subcompartments',
      'ev-weight135-ef31-nmvoc-htnc-subcompartments',
      'ev-weight135-ef31-nf-wf-workbook',
    ],
  },
  'cl-weight135-ef-coating-indoor': {
    premises: ['cl-es-nmvoc', 'cl-weight135-ef-coating-outdoor'],
    evidence: [
      'ev-es-nmvoc',
      'ev-weight135-ef31-pof-equal-cf',
      'ev-weight135-ef31-nox-and-pm25-pm',
      'ev-weight135-ef31-nmvoc-ecotox-subcompartments',
      'ev-weight135-ef31-nmvoc-htnc-subcompartments',
      'ev-weight135-ef31-styrene-htc-subcompartments',
      'ev-weight135-ef31-nf-wf-workbook',
    ],
  },
  'cl-weight135-ef-robustness-weights': {
    premises: ['cl-es-authority', 'cl-weight135-ef-coating-indoor'],
    evidence: [
      'ev-weight135-pef-guidance-robustness-table',
      'ev-weight135-ef31-nf-wf-workbook',
    ],
  },
  'cl-weight135-denominator-coupling-and-drift': {
    premises: ['cl-es-equation', 'cl-es-why-square', 'cl-es-metals', 'cl-es-judgment', 'cl-weight135-ef-robustness-weights'],
    evidence: [
      'ev-es-equation',
      'ev-es-muhl-2021-perspective-scope',
      'ev-weight135-ef31-nf-wf-workbook',
      'ev-weight135-jrc130796-nf-drift-and-rankings',
    ],
  },
  'cl-weight135-comparative-assertion-regimes': {
    premises: ['cl-es-authority', 'cl-weight135-denominator-coupling-and-drift'],
    evidence: [
      'ev-weight135-cml2001-part2a-optional-and-ban',
      'ev-weight135-cml2001-part3-finnveden-monetary',
      'ev-weight135-ilcd2010-no-public-weighting',
      'ev-weight135-ec2021-mandatory-weighting-and-pefcr',
    ],
  },
  'cl-weight135-target-vs-hybrid-boundary': {
    premises: [
      'cl-es-selection',
      'cl-es-place',
      'cl-es-judgment',
      'cl-weight135-ef-coating-outdoor',
      'cl-weight135-ef-coating-indoor',
      'cl-weight135-comparative-assertion-regimes',
    ],
    evidence: [
      'ev-es-multiple',
      'ev-es-place',
      'ev-weight135-pef-guidance-robustness-table',
      'ev-weight135-ec2021-mandatory-weighting-and-pefcr',
    ],
  },
  'cl-weight135-lime-three-table-rereversal': {
    premises: ['cl-lime-japan-route', 'cl-lime-break-even', 'cl-lime-english-route', 'cl-lime-national', 'cl-lime-edition'],
    evidence: [
      'ev-lime-jp-weights',
      'ev-lime-2004-conjoint-weights',
      'ev-lime-2012-conjoint-weights',
    ],
  },
  'cl-weight135-recipe-endpoint-stop': {
    premises: ['cl-lime-purpose', 'cl-lime-units', 'cl-weight135-lime-three-table-rereversal'],
    evidence: [
      'ev-weight135-rivm2016-aop-and-perspectives',
      'ev-weight135-recipe2017-three-aop-halt',
      'ev-lime-jp-damage',
      'ev-lime-2004-conjoint-weights',
    ],
  },
  'cl-weight135-health-perspective-reversal': {
    premises: ['cl-weight135-recipe-endpoint-stop', 'cl-weight135-ef-robustness-weights'],
    evidence: [
      'ev-weight135-rivm2016-aop-and-perspectives',
      'ev-weight135-ef31-nf-wf-workbook',
      'ev-weight135-ef31-nox-and-pm25-pm',
    ],
  },
  'cl-weight135-four-paradigm-synthesis': {
    premises: [
      'cl-lime-policy-contrast',
      'cl-lime-two-forms',
      'cl-lime-transfer',
      'cl-weight135-target-vs-hybrid-boundary',
      'cl-weight135-recipe-endpoint-stop',
      'cl-weight135-health-perspective-reversal',
      'cl-weight135-lime-three-table-rereversal',
    ],
    evidence: [
      'ev-es-equation',
      'ev-weight135-pef-guidance-robustness-table',
      'ev-weight135-rivm2016-aop-and-perspectives',
      'ev-lime-2012-conjoint-weights',
    ],
  },
  'cl-weight135-monetary-incommensurability': {
    premises: ['cl-lime-units', 'cl-lime-numeraire', 'cl-weight135-recipe-endpoint-stop', 'cl-weight135-four-paradigm-synthesis'],
    evidence: [
      'ev-weight135-cml2001-part3-finnveden-monetary',
      'ev-weight135-rivm2016-aop-and-perspectives',
      'ev-lime-2012-conjoint-weights',
    ],
  },
  'cl-weight135-glam3-reporting-discipline': {
    premises: [
      'cl-weight135-comparative-assertion-regimes',
      'cl-weight135-four-paradigm-synthesis',
      'cl-weight135-monetary-incommensurability',
    ],
    evidence: [
      'ev-weight135-glam3-scoping-agenda',
      'ev-weight135-ilcd2010-no-public-weighting',
      'ev-weight135-ec2021-mandatory-weighting-and-pefcr',
    ],
  },
});

export function validateWeightingValuationFactors(catalog, readings) {
  const sourceById = new Map(catalog.sources.map(row => [row.id, row]));
  const readingById = new Map(readings.readings.map(row => [row.id, row]));
  const evidenceById = new Map(catalog.evidence.map(row => [row.id, row]));
  const claimById = new Map(catalog.claims.map(row => [row.id, row]));

  const unitEvidence = catalog.evidence.filter(row => row.id.startsWith('ev-weight135-'));
  if (unitEvidence.length !== Object.keys(evidenceSpec).length) {
    throw new Error('Weighting and valuation has unexpected or missing ev-weight135-* records');
  }

  const facts = new Map();
  for (const [eid, spec] of Object.entries(evidenceSpec)) {
    const ev = evidenceById.get(eid);
    const carrier = carriers[spec.carrier];
    const src = sourceById.get(carrier.sourceId);
    const rd = readingById.get(carrier.readingId);
    const psg = rd?.passages.find(p => p.id === spec.passageId);
    const art = rd?.artifacts.find(a => a.id === carrier.artifact.id);
    if (!ev || ev.sourceId !== carrier.sourceId || ev.readingId !== carrier.readingId || ev.passageId !== spec.passageId
        || ev.reviewStatus !== 'reviewed' || ev.reviewKind !== 'agent-source-check'
        || !scienceText(ev.locator) || !scienceText(ev.summary) || !scienceText(ev.paraphrase)
        || !src || !rd || !psg || psg.artifactId !== carrier.artifact.id
        || !art || art.mediaType !== carrier.artifact.mediaType || art.sha256 !== carrier.artifact.sha256) {
      throw new Error(`Weighting and valuation evidence/carrier binding failed: ${eid}`);
    }
    assertCleanReaderProse(ev.locator, `${eid}.locator`);
    if (spec.pdfIndices && !sameScienceValue(psg.pdfIndices, spec.pdfIndices)) {
      throw new Error(`Weighting and valuation passage pdfIndices mismatch: ${spec.passageId}`);
    }
    const list = ev.numericFacts ?? [];
    if (list.length !== spec.facts) {
      throw new Error(`Weighting and valuation numericFacts count mismatch on ${eid}: got ${list.length}, expected ${spec.facts}`);
    }
    for (const item of list) {
      if (!item?.id?.startsWith('nf-weight135-') || facts.has(item.id)
          || expectedFacts[item.id] !== item.value
          || !scienceText(item.unit) || !scienceText(item.quantity) || !scienceText(item.subject) || !scienceText(item.basis)) {
        throw new Error(`Weighting and valuation malformed or unexpected numericFact: ${item?.id}`);
      }
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== Object.keys(expectedFacts).length) {
    throw new Error('Weighting and valuation numericFacts inventory differs from expectedFacts');
  }

  const newSrc = sourceById.get('src-weight135-ef31-selected-members');
  assertCleanReaderProse(newSrc?.version ?? '', 'src-weight135-ef31-selected-members.version');
  assertCleanReaderProse(newSrc?.preservation ?? '', 'src-weight135-ef31-selected-members.preservation');
  assertCleanReaderProse(newSrc?.reading?.scope ?? '', 'src-weight135-ef31-selected-members.reading.scope');

  const consumed = new Set();
  const raw = id => {
    if (!facts.has(id)) throw new Error(`Unknown numericFact ${id}`);
    consumed.add(id);
    return facts.get(id);
  };
  const q = id => decimal(raw(id));

  const unitClaims = catalog.claims.filter(row => row.id.startsWith('cl-weight135-'));
  if (unitClaims.length !== Object.keys(requiredClaims).length) {
    throw new Error('Weighting and valuation has unexpected or missing cl-weight135-* claims');
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
      throw new Error(`Weighting and valuation claim structure invalid: ${cid}`);
    }
    assertCleanReaderProse(cl.scope, `${cid}.scope`);
    assertCleanReaderProse(cl.text, `${cid}.text`);
    assertCleanReaderProse(cl.reasoning, `${cid}.reasoning`, true);
    cl.caveats.forEach((cv, i) => assertCleanReaderProse(cv, `${cid}.caveats[${i}]`));
    for (const eid of spec.evidence) {
      const matches = cl.evidenceLinks.filter(l => l.evidenceId === eid);
      if (matches.length !== 1 || matches[0].relation !== 'supports') {
        throw new Error(`Weighting and valuation claim ${cid} missing exact supports link for ${eid}`);
      }
      assertCleanReaderProse(matches[0].rationale, `${cid}.evidenceLinks(${eid})`);
    }
  }
  // Ensure 4-item enumeration on cl-weight135-target-vs-hybrid-boundary
  const cTargetBoundary = claimById.get('cl-weight135-target-vs-hybrid-boundary');
  for (const ord of ['第一，', '第二，', '第三，', '第四，', '四项结构前提']) {
    if (!cTargetBoundary.text.includes(ord)) {
      throw new Error(`Weighting and valuation target-vs-hybrid-boundary missing ${ord}`);
    }
  }

  // 1. Coating trade-off: 甲 (4 g solvent + 1 g NOx) vs 乙 (2 g solvent + 2 g NOx), break-even = 2
  const breakEvenCoating = rational(2n, 1n);
  const esNmvoc2013 = evidenceById.get('ev-es-nmvoc')?.numericFacts?.find(f => f.id === 'nf-es-nmvoc-factor')?.value;
  const esNox2013 = evidenceById.get('ev-es-nox')?.numericFacts?.find(f => f.id === 'nf-es-nox-factor')?.value;
  if (esNmvoc2013 !== '14' || esNox2013 !== '39'
      || fixed(divide(decimal(esNox2013), decimal(esNmvoc2013)), 3) !== '2.786'
      || !gt(divide(decimal('33'), decimal('12')), breakEvenCoating)
      || fixed(divide(decimal('33'), decimal('12')), 3) !== '2.750') {
    throw new Error('Weighting and valuation Swiss UBP baseline ratio check failed');
  }
  if (raw('nf-weight135-ef31-pop') !== '6895889018') {
    throw new Error('Weighting and valuation EF 3.1 population mismatch');
  }
  const pofNmvocOut = q('nf-weight135-ef31-pof-nmvoc-outdoor');
  const pofNox = q('nf-weight135-ef31-pof-nox');
  const pofStyOut = q('nf-weight135-ef31-pof-styrene-outdoor');
  const pofVocIn = q('nf-weight135-ef31-pof-voc-indoor');
  const pofRatio = divide(pofNox, pofNmvocOut);
  if (!eq(pofRatio, rational(1n, 1n)) || !lt(pofRatio, breakEvenCoating) || !eq(pofVocIn, rational(0n, 1n))) {
    throw new Error('Weighting and valuation POF factor check failed');
  }

  const nfPof = q('nf-weight135-ef31-nf-pof'), wfPof = q('nf-weight135-ef31-wf-pof');
  const nfAcid = q('nf-weight135-ef31-nf-acid'), wfAcid = q('nf-weight135-ef31-wf-acid');
  const nfTerr = q('nf-weight135-ef31-nf-terr'), wfTerr = q('nf-weight135-ef31-wf-terr');
  const nfMar = q('nf-weight135-ef31-nf-marine'), wfMar = q('nf-weight135-ef31-wf-marine');
  const nfPm = q('nf-weight135-ef31-nf-pm'), wfPm = q('nf-weight135-ef31-wf-pm');
  const nfEco = q('nf-weight135-ef31-nf-ecotox'), wfEco = q('nf-weight135-ef31-wf-ecotox');
  const nfHtnc = q('nf-weight135-ef31-nf-htnc'), wfHtnc = q('nf-weight135-ef31-wf-htnc');
  const nfHtc = q('nf-weight135-ef31-nf-htc'), wfHtc = q('nf-weight135-ef31-wf-htc');
  const nfCc = q('nf-weight135-ef31-nf-cc'), wfCc = q('nf-weight135-ef31-wf-cc');
  const gPerKg = rational(1000n, 1n);

  const noxAcidCf = q('nf-weight135-ef31-nox-acid');
  const noxTerrCf = q('nf-weight135-ef31-nox-terr');
  const noxMarCf = q('nf-weight135-ef31-nox-marine');
  const noxPtPerG = pmCf => divide(
    [
      multiply(divide(pofNox, nfPof), wfPof),
      multiply(divide(noxAcidCf, nfAcid), wfAcid),
      multiply(divide(noxTerrCf, nfTerr), wfTerr),
      multiply(divide(noxMarCf, nfMar), wfMar),
      multiply(divide(pmCf, nfPm), wfPm),
    ].reduce(add),
    gPerKg,
  );
  const vocPtPerG = (pofCf, ecoCf, htncCf, htcCf = rational(0n, 1n)) => divide(
    [
      multiply(divide(pofCf, nfPof), wfPof),
      multiply(divide(ecoCf, nfEco), wfEco),
      multiply(divide(htncCf, nfHtnc), wfHtnc),
      multiply(divide(htcCf, nfHtc), wfHtc),
    ].reduce(add),
    gPerKg,
  );

  const noxUrbanUnspec = noxPtPerG(q('nf-weight135-ef31-nox-pm-urban-unspec'));
  const noxNonurban = noxPtPerG(q('nf-weight135-ef31-nox-pm-nonurban'));
  const nmvocUnspec = vocPtPerG(pofNmvocOut, q('nf-weight135-ef31-nmvoc-ecotox-unspec'), q('nf-weight135-ef31-nmvoc-htnc-unspec'));
  const nmvocUrban = vocPtPerG(pofNmvocOut, q('nf-weight135-ef31-nmvoc-ecotox-urban'), q('nf-weight135-ef31-nmvoc-htnc-urban'));
  const nmvocNonurban = vocPtPerG(pofNmvocOut, q('nf-weight135-ef31-nmvoc-ecotox-nonurban'), q('nf-weight135-ef31-nmvoc-htnc-nonurban'));

  const nmvocInEcoCf = q('nf-weight135-ef31-nmvoc-ecotox-indoor');
  const nmvocInHtncCf = q('nf-weight135-ef31-nmvoc-htnc-indoor');
  const nmvocInHtncOnly = divide(multiply(divide(nmvocInHtncCf, nfHtnc), wfHtnc), gPerKg);
  const pof1Only = divide(multiply(divide(pofNmvocOut, nfPof), wfPof), gPerKg);
  const nmvocIndoor = vocPtPerG(pofVocIn, nmvocInEcoCf, nmvocInHtncCf);

  const styOut = vocPtPerG(
    pofStyOut,
    q('nf-weight135-ef31-styrene-ecotox-unspec'),
    q('nf-weight135-ef31-styrene-htnc-unspec'),
    q('nf-weight135-ef31-styrene-htc-unspec'),
  );
  const styIn = vocPtPerG(
    pofVocIn,
    q('nf-weight135-ef31-styrene-ecotox-indoor'),
    q('nf-weight135-ef31-styrene-htnc-indoor'),
    q('nf-weight135-ef31-styrene-htc-indoor'),
  );

  const scale1e7 = rational(10000000n, 1n);
  const scale1e6 = rational(1000000n, 1n);
  const scale1e4 = rational(10000n, 1n);
  if (fixed(multiply(noxUrbanUnspec, scale1e6), 4) !== '3.7196'
      || fixed(multiply(noxNonurban, scale1e6), 4) !== '3.5104'
      || fixed(multiply(nmvocUnspec, scale1e6), 4) !== '1.1817'
      || fixed(multiply(nmvocUrban, scale1e6), 4) !== '1.1888'
      || fixed(multiply(nmvocNonurban, scale1e6), 4) !== '1.1745'
      || fixed(multiply(pof1Only, scale1e6), 4) !== '1.1699'
      || fixed(multiply(nmvocInHtncOnly, scale1e6), 4) !== '1.2802'
      || fixed(multiply(nmvocIndoor, scale1e6), 4) !== '1.2832'
      || fixed(multiply(styOut, scale1e7), 4) !== '9.1508'
      || fixed(multiply(styIn, scale1e4), 4) !== '1.3376'
      || fixed(divide(styIn, styOut), 0) !== '146') {
    throw new Error('Weighting and valuation EF 3.1 per-gram weighted score mismatch');
  }

  const rUnspec = divide(noxUrbanUnspec, nmvocUnspec);
  const rUrban = divide(noxUrbanUnspec, nmvocUrban);
  const rNonurban = divide(noxNonurban, nmvocNonurban);
  const rNmvocInNon = divide(noxNonurban, nmvocIndoor);
  const rNmvocInUrb = divide(noxUrbanUnspec, nmvocIndoor);
  const rStyOutUrb = divide(noxUrbanUnspec, styOut);
  const rStyOutNon = divide(noxNonurban, styOut);
  const rStyInUrb = divide(noxUrbanUnspec, styIn);
  const rStyInNon = divide(noxNonurban, styIn);
  if (!gt(rUnspec, breakEvenCoating) || fixed(rUnspec, 3) !== '3.148'
      || !gt(rUrban, breakEvenCoating) || fixed(rUrban, 3) !== '3.129'
      || !gt(rNonurban, breakEvenCoating) || fixed(rNonurban, 3) !== '2.989'
      || !gt(rNmvocInNon, breakEvenCoating) || fixed(rNmvocInNon, 3) !== '2.736'
      || !gt(rNmvocInUrb, breakEvenCoating) || fixed(rNmvocInUrb, 3) !== '2.899'
      || !gt(rStyOutUrb, breakEvenCoating) || fixed(rStyOutUrb, 3) !== '4.065'
      || !gt(rStyOutNon, breakEvenCoating) || fixed(rStyOutNon, 3) !== '3.836'
      || !lt(rStyInUrb, breakEvenCoating) || fixed(rStyInUrb, 4) !== '0.0278'
      || !lt(rStyInNon, breakEvenCoating) || fixed(rStyInNon, 4) !== '0.0262') {
    throw new Error('Weighting and valuation outdoor vs indoor coating ratios failed');
  }

  const jia = (voc, nox) => add(multiply(rational(4n, 1n), voc), nox);
  const yi = (voc, nox) => add(multiply(rational(2n, 1n), voc), multiply(rational(2n, 1n), nox));
  if (!lt(jia(nmvocUnspec, noxUrbanUnspec), yi(nmvocUnspec, noxUrbanUnspec))
      || fixed(multiply(jia(nmvocUnspec, noxUrbanUnspec), scale1e6), 3) !== '8.446'
      || fixed(multiply(yi(nmvocUnspec, noxUrbanUnspec), scale1e6), 3) !== '9.802'
      || fixed(multiply(jia(nmvocUrban, noxUrbanUnspec), scale1e6), 4) !== '8.4749'
      || fixed(multiply(yi(nmvocUrban, noxUrbanUnspec), scale1e6), 4) !== '9.8168'
      || fixed(multiply(jia(nmvocNonurban, noxNonurban), scale1e6), 4) !== '8.2084'
      || fixed(multiply(yi(nmvocNonurban, noxNonurban), scale1e6), 4) !== '9.3698'
      || !lt(jia(nmvocIndoor, noxNonurban), yi(nmvocIndoor, noxNonurban))
      || fixed(multiply(jia(nmvocIndoor, noxNonurban), scale1e6), 4) !== '8.6432'
      || fixed(multiply(yi(nmvocIndoor, noxNonurban), scale1e6), 4) !== '9.5872'
      || !lt(jia(styOut, noxUrbanUnspec), yi(styOut, noxUrbanUnspec))
      || fixed(multiply(jia(styOut, noxUrbanUnspec), scale1e6), 3) !== '7.380'
      || fixed(multiply(yi(styOut, noxUrbanUnspec), scale1e6), 3) !== '9.269'
      || !lt(yi(styIn, noxUrbanUnspec), jia(styIn, noxUrbanUnspec))
      || fixed(multiply(yi(styIn, noxUrbanUnspec), scale1e4), 3) !== '2.750'
      || fixed(multiply(jia(styIn, noxUrbanUnspec), scale1e4), 3) !== '5.387') {
    throw new Error('Weighting and valuation coating total score assertions failed');
  }

  const cOutdoor = claimById.get('cl-weight135-ef-coating-outdoor');
  const cIndoor = claimById.get('cl-weight135-ef-coating-indoor');
  for (const tok of ['3.148', '3.129', '2.989', '8.446×10⁻⁶', '9.802×10⁻⁶']) {
    if (!cOutdoor.text.includes(tok)) throw new Error(`Missing ${tok} in cl-weight135-ef-coating-outdoor.text`);
  }
  for (const tok of ['8.4749×10⁻⁶', '9.8168×10⁻⁶', '8.2084×10⁻⁶', '9.3698×10⁻⁶']) {
    if (!cOutdoor.caveats[0].includes(tok)) throw new Error(`Missing ${tok} in cl-weight135-ef-coating-outdoor.caveats[0]`);
  }
  for (const tok of [
    '1.2802×10⁻⁶', '1.1699×10⁻⁶', '1.2832×10⁻⁶', '2.736', '2.899', '8.6432×10⁻⁶', '9.5872×10⁻⁶',
    '9.1508×10⁻⁷', '4.065', '3.836', '7.380×10⁻⁶', '9.269×10⁻⁶',
    '1.3376×10⁻⁴', '0.0278', '0.0262', '2.750×10⁻⁴', '5.387×10⁻⁴',
  ]) {
    if (!cIndoor.text.includes(tok)) throw new Error(`Missing ${tok} in cl-weight135-ef-coating-indoor.text`);
  }

  // 2. Robustness multiplier trade-off: 丙 (0.10 CC + 0.60 Ecotox) vs 丁 (0.25 CC + 0.05 Ecotox), break-even = 11/3
  const aCc = q('nf-weight135-pef-a-cc');
  const aHtc = q('nf-weight135-pef-a-htc');
  const aHtnc = q('nf-weight135-pef-a-htnc');
  const aEco = q('nf-weight135-pef-a-ecotox');
  const aPm = q('nf-weight135-pef-a-pm');
  const aSum16 = q('nf-weight135-pef-a-sum16');
  const bHigh = q('nf-weight135-pef-b-high');
  const bTox = q('nf-weight135-pef-b-tox');
  const cCcPrinted = q('nf-weight135-pef-c-cc');
  const cHtcPrinted = q('nf-weight135-pef-c-htc');
  const notoxCc = q('nf-weight135-pef-notox-cc');
  const notoxPm = q('nf-weight135-pef-notox-pm');

  const rawToxSum = [aHtc, aHtnc, aEco].reduce(add);
  const finalToxSum = [wfHtc, wfHtnc, wfEco].reduce(add);
  const breakEvenRob = rational(11n, 3n);
  const ratioRawA = divide(aCc, aEco);
  const ratioFinalWf = divide(wfCc, wfEco);
  if (fixed(aSum16, 2) !== '100.03'
      || fixed(rawToxSum, 2) !== '18.80'
      || fixed(multiply(finalToxSum, rational(100n, 1n)), 2) !== '5.89'
      || fixed(aPm, 2) !== '5.49'
      || fixed(bHigh, 2) !== '0.87' || fixed(bTox, 2) !== '0.17'
      || fixed(cCcPrinted, 2) !== '11.18' || fixed(cHtcPrinted, 2) !== '1.13'
      || fixed(notoxCc, 2) !== '22.19' || fixed(notoxPm, 2) !== '9.54'
      || !lt(ratioRawA, breakEvenRob) || fixed(ratioRawA, 3) !== '2.108'
      || !gt(ratioFinalWf, breakEvenRob) || fixed(ratioFinalWf, 5) !== '10.96875') {
    throw new Error('Weighting and valuation Sala et al. 2018 A*B robustness math failed');
  }
  const bingRawSum = add(multiply(decimal('0.10'), aCc), multiply(decimal('0.60'), aEco));
  const dingRawSum = add(multiply(decimal('0.25'), aCc), multiply(decimal('0.05'), aEco));
  const bingRaw = divide(bingRawSum, aSum16);
  const dingRaw = divide(dingRawSum, aSum16);
  const bingWf = add(multiply(decimal('0.10'), wfCc), multiply(decimal('0.60'), wfEco));
  const dingWf = add(multiply(decimal('0.25'), wfCc), multiply(decimal('0.05'), wfEco));
  if (!lt(dingRaw, bingRaw) || fixed(dingRawSum, 3) !== '3.531' || fixed(bingRawSum, 3) !== '4.962'
      || fixed(dingRaw, 5) !== '0.03530' || fixed(bingRaw, 5) !== '0.04961'
      || !lt(bingWf, dingWf) || fixed(bingWf, 5) !== '0.03258' || fixed(dingWf, 5) !== '0.05361') {
    throw new Error('Weighting and valuation 丙/丁 robustness reversal scores failed');
  }
  const cRob = claimById.get('cl-weight135-ef-robustness-weights');
  for (const tok of ['1.2802×10⁻⁶', '100.03', '0.03530', '0.04961', '0.03258', '0.05361']) {
    if (!cRob.text.includes(tok)) throw new Error(`Missing ${tok} in cl-weight135-ef-robustness-weights.text`);
  }

  // 3. JRC130796 NF drift & EU 2021/2279 thresholds
  const htnc30 = q('nf-weight135-jrc130796-htnc-ef30');
  const htnc31 = q('nf-weight135-jrc130796-htnc-ef31');
  const htncDiff = q('nf-weight135-jrc130796-htnc-diff');
  const eco30 = q('nf-weight135-jrc130796-ecotox-ef30');
  const eco31 = q('nf-weight135-jrc130796-ecotox-ef31');
  const ecoDiff = q('nf-weight135-jrc130796-ecotox-diff');
  const ccDiff = q('nf-weight135-jrc130796-cc-diff');
  const dsTotal = q('nf-weight135-jrc130796-datasets-total');
  const topEco = q('nf-weight135-jrc130796-top-ecotox');
  const topCc = q('nf-weight135-jrc130796-top-cc');
  const topHtnc = q('nf-weight135-jrc130796-top-htnc');
  const topHtc = q('nf-weight135-jrc130796-top-htc');
  const r1Changed = q('nf-weight135-jrc130796-rank1-changed');
  const r2Changed = q('nf-weight135-jrc130796-rank2-changed');
  const r3Changed = q('nf-weight135-jrc130796-rank3-changed');
  const mricShare = q('nf-weight135-ec2021-mric-share');
  const mricMin = q('nf-weight135-ec2021-mric-min-count');

  const topSum = [topEco, topCc, topHtnc, topHtc].reduce(add);
  if (fixed(divide(htnc30, nfHtnc), 2) !== '1.79'
      || fixed(htnc31, 6) !== '0.000129' || fixed(htncDiff, 0) !== '-44'
      || fixed(eco30, 0) !== '42700' || fixed(eco31, 0) !== '56700' || fixed(ecoDiff, 0) !== '33'
      || fixed(ccDiff, 1) !== '-6.7'
      || fixed(topSum, 0) !== '2751'
      || fixed(multiply(divide(topEco, dsTotal), rational(100n, 1n)), 1) !== '55.8'
      || fixed(multiply(divide(topCc, dsTotal), rational(100n, 1n)), 1) !== '37.9'
      || fixed(multiply(divide(r1Changed, dsTotal), rational(100n, 1n)), 0) !== '6'
      || fixed(multiply(divide(r2Changed, dsTotal), rational(100n, 1n)), 0) !== '10'
      || fixed(multiply(divide(r3Changed, dsTotal), rational(100n, 1n)), 0) !== '13'
      || fixed(mricShare, 0) !== '80' || fixed(mricMin, 0) !== '3') {
    throw new Error('Weighting and valuation JRC130796 / EU 2021/2279 numeric checks failed');
  }

  // 4. ReCiPe 2016 endpoint halt & CO2 vs PM2.5 reversal (戊: 1000 kg CO2 + 0.10 kg PM2.5 vs 己: 500 kg CO2 + 0.60 kg PM2.5, break-even = 1000)
  if (fixed(q('nf-weight135-recipe2017-midpoints'), 0) !== '17'
      || fixed(q('nf-weight135-recipe2017-aops'), 0) !== '3'
      || fixed(q('nf-weight135-rivm-cu-ra-i'), 2) !== '0.16'
      || fixed(q('nf-weight135-rivm-cu-ra-he'), 2) !== '0.23'
      || fixed(q('nf-weight135-rivm-oil-ra'), 2) !== '0.46') {
    throw new Error('Weighting and valuation ReCiPe 2016 structure/resource facts failed');
  }
  const co2I = q('nf-weight135-rivm-co2-hh-i');
  const co2H = q('nf-weight135-rivm-co2-hh-h');
  const co2E = q('nf-weight135-rivm-co2-hh-e');
  const pmHh = q('nf-weight135-rivm-pm25-hh');
  const breakEvenHealth = rational(1000n, 1n);

  if (fixed(divide(co2E, co2I), 1) !== '160.5'
      || fixed(divide(pmHh, co2I), 0) !== '7778'
      || fixed(divide(pmHh, co2H), 0) !== '677'
      || fixed(divide(pmHh, co2E), 1) !== '48.5') {
    throw new Error('Weighting and valuation ReCiPe I/H/E CO2 equivalence checks failed');
  }
  const ccRate = divide(wfCc, nfCc);
  const pmIncRate = divide(wfPm, nfPm);
  const incToCo2 = divide(pmIncRate, ccRate);
  const pmCfUrbGround = q('nf-weight135-ef31-pm25-urban-ground');
  const pmCfUrbHigh = q('nf-weight135-ef31-pm25-urban-highstack');
  const pmCfNonurbGround = q('nf-weight135-ef31-pm25-nonurban-ground');
  const pmEfUrbGround = multiply(pmCfUrbGround, incToCo2);
  const pmEfUrbHigh = multiply(pmCfUrbHigh, incToCo2);
  const pmEfNonurbGround = multiply(pmCfNonurbGround, incToCo2);
  if (fixed(incToCo2, 0) !== '5397458'
      || !gt(pmEfUrbGround, breakEvenHealth) || fixed(pmEfUrbGround, 0) !== '1287'
      || !lt(pmEfUrbHigh, breakEvenHealth) || fixed(pmEfUrbHigh, 0) !== '341'
      || !lt(pmEfNonurbGround, breakEvenHealth) || fixed(pmEfNonurbGround, 1) !== '61.4') {
    throw new Error('Weighting and valuation EF 3.1 PM2.5-to-CO2 equivalence checks failed');
  }

  const wuDaly = co2F => add(multiply(rational(1000n, 1n), co2F), multiply(decimal('0.10'), pmHh));
  const jiDaly = co2F => add(multiply(rational(500n, 1n), co2F), multiply(decimal('0.60'), pmHh));
  const wuEf = pmCf => add(multiply(rational(1000n, 1n), ccRate), multiply(multiply(decimal('0.10'), pmCf), pmIncRate));
  const jiEf = pmCf => add(multiply(rational(500n, 1n), ccRate), multiply(multiply(decimal('0.60'), pmCf), pmIncRate));
  const s1e4 = rational(10000n, 1n), s1e3 = rational(1000n, 1n), s1e2 = rational(100n, 1n);
  if (!lt(wuDaly(co2I), jiDaly(co2I))
      || fixed(multiply(wuDaly(co2I), s1e4), 3) !== '1.440'
      || fixed(multiply(jiDaly(co2I), s1e4), 3) !== '4.185'
      || !gt(wuDaly(co2H), jiDaly(co2H))
      || fixed(multiply(wuDaly(co2H), s1e4), 3) !== '9.930'
      || fixed(multiply(jiDaly(co2H), s1e4), 3) !== '8.430'
      || !gt(wuDaly(co2E), jiDaly(co2E))
      || fixed(multiply(wuDaly(co2E), s1e2), 3) !== '1.306'
      || fixed(multiply(jiDaly(co2E), s1e3), 3) !== '6.878'
      || !lt(wuEf(pmCfUrbGround), jiEf(pmCfUrbGround))
      || fixed(wuEf(pmCfUrbGround), 5) !== '0.03147'
      || fixed(jiEf(pmCfUrbGround), 5) !== '0.03548'
      || !gt(wuEf(pmCfUrbHigh), jiEf(pmCfUrbHigh))
      || fixed(wuEf(pmCfUrbHigh), 5) !== '0.02883'
      || fixed(jiEf(pmCfUrbHigh), 5) !== '0.01965'
      || !gt(wuEf(pmCfNonurbGround), jiEf(pmCfNonurbGround))
      || fixed(wuEf(pmCfNonurbGround), 5) !== '0.02805'
      || fixed(jiEf(pmCfNonurbGround), 5) !== '0.01497') {
    throw new Error('Weighting and valuation 戊/己 ReCiPe or EF 3.1 exact score assertions failed');
  }
  const cHealth = claimById.get('cl-weight135-health-perspective-reversal');
  for (const tok of [
    '1.440×10⁻⁴', '4.185×10⁻⁴', '9.930×10⁻⁴', '8.430×10⁻⁴', '1.306×10⁻²', '6.878×10⁻³',
    '0.03147', '0.03548', '0.02883', '0.01965', '0.02805', '0.01497',
  ]) {
    if (!cHealth.text.includes(tok)) throw new Error(`Missing ${tok} in cl-weight135-health-perspective-reversal.text`);
  }

  // 5. LIME 3-table non-monotonic reversal-and-rereversal: 庚 (0.010 DALY + 1e-8 species) vs 辛 (0.002 DALY + 2e-8 species), break-even = 800,000 DALY/species
  const jpWeights = evidenceById.get('ev-lime-jp-weights');
  const enWeights = evidenceById.get('ev-lime-2004-conjoint-weights');
  const lime2Weights = evidenceById.get('ev-lime-2012-conjoint-weights');
  const h2003 = decimal(jpWeights?.numericFacts?.find(f => f.id === 'wtp-health')?.value ?? '0');
  const b2003 = decimal(jpWeights?.numericFacts?.find(f => f.id === 'wtp-biodiversity')?.value ?? '0');
  if (fixed(h2003, 0) !== '572000' || fixed(b2003, 0) !== '768000000000'
      || !enWeights?.summary.includes('9.70E6JPY/DALY') || !enWeights?.summary.includes('4.80E12JPY/species')
      || !lime2Weights?.summary.includes('1.47E7JPY/DALY') || !lime2Weights?.summary.includes('4.63E4JPY/t')
      || !lime2Weights?.summary.includes('1.42E13JPY/species')) {
    throw new Error('Weighting and valuation prior LIME 2003/2004/2012 evidence binding failed');
  }
  const h2004 = decimal('9700000'), b2004 = decimal('4800000000000');
  const h2012 = decimal('14700000'), b2012 = decimal('14200000000000');
  const breakEvenLime = rational(800000n, 1n);
  const r2003 = divide(b2003, h2003), r2004 = divide(b2004, h2004), r2012 = divide(b2012, h2012);
  const geng = (h, b) => add(multiply(decimal('0.010'), h), multiply(decimal('0.00000001'), b));
  const xin = (h, b) => add(multiply(decimal('0.002'), h), multiply(decimal('0.00000002'), b));
  if (!gt(r2003, breakEvenLime) || fixed(r2003, 0) !== '1342657'
      || !lt(r2004, breakEvenLime) || fixed(r2004, 0) !== '494845'
      || !gt(r2012, breakEvenLime) || fixed(r2012, 0) !== '965986'
      || fixed(geng(h2003, b2003), 0) !== '13400' || fixed(xin(h2003, b2003), 0) !== '16504'
      || fixed(geng(h2004, b2004), 0) !== '145000' || fixed(xin(h2004, b2004), 0) !== '115400'
      || fixed(geng(h2012, b2012), 0) !== '289000' || fixed(xin(h2012, b2012), 0) !== '313400'
      || !lt(geng(h2003, b2003), xin(h2003, b2003))
      || !lt(xin(h2004, b2004), geng(h2004, b2004))
      || !lt(geng(h2012, b2012), xin(h2012, b2012))) {
    throw new Error('Weighting and valuation LIME 3-table non-monotonic reversal-and-rereversal failed');
  }

  if (consumed.size !== facts.size) {
    const unconsumed = [...facts.keys()].filter(k => !consumed.has(k));
    throw new Error(`Weighting and valuation left unconsumed numericFacts: ${unconsumed.join(', ')}`);
  }
}
