import { add, decimal, divide, fixed, multiply, rational, subtract } from './exact-rational.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

export const dappCarriers = Object.freeze({
  ilcd2010: {
    sourceId: 'src-book-ilcd-2010',
    readingId: 'rd-ilcd-2010',
    artifact: {
      id: 'art-ilcd-2010-pdf',
      mediaType: 'application/pdf',
      sha256: '7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f',
      pageCount: 417,
    },
  },
  ilcdEl2012: {
    sourceId: 'src-dapp147-ilcd-el-2012',
    readingId: 'rd-dapp147-ilcd-el-2012',
    artifact: {
      id: 'art-dapp147-ilcd-el-2012-pdf',
      mediaType: 'application/pdf',
      sha256: '059d7bdebb6f3ac2a94e2db37dfac7d05f3e6a6cf05702ea245232de85d2c2c0',
      resolvedUrl: 'https://eplca.jrc.ec.europa.eu/uploads/ILCD-Data-Network-Compliance-Entry-level-Version1.1-Jan2012.pdf',
      pageCount: 22,
    },
  },
  ec2021: {
    sourceId: 'src-kb44-ec2021',
    readingId: 'rd-kb44-ec2021',
    artifact: {
      id: 'art-kb44-ec2021-r01-pdf',
      mediaType: 'application/pdf',
      sha256: '42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7',
      pageCount: 384,
    },
  },
  efGuide2020: {
    sourceId: 'src-loc137-ef-guide-2020',
    readingId: 'rd-loc137-ef-guide-2020',
    artifact: {
      id: 'art-loc137-ef-guide-2020-pdf',
      mediaType: 'application/pdf',
      sha256: 'c5dbc3b11c0379f59927be52aadf6eb146b6067aed8f9357d24bd800c986296a',
      pageCount: 49,
    },
  },
  ef31Addendum2022: {
    sourceId: 'src-tox123-ef31-addendum',
    readingId: 'rd-tox123-ef31-addendum',
    artifact: {
      id: 'art-tox123-ef31-addendum-pdf',
      mediaType: 'application/pdf',
      sha256: '76a921ca994964f158a5baf4962be2cb1cdeb73583835f7c047eed2087a952b7',
      pageCount: 5,
    },
  },
  ecoinvent2013: {
    sourceId: 'src-dapp147-ecoinvent-v3-2013',
    readingId: 'rd-dapp147-ecoinvent-v3-2013',
    artifact: {
      id: 'art-dapp147-ecoinvent-v3-2013-pdf',
      mediaType: 'application/pdf',
      sha256: '88fcc1512a8efe25c26af6254e0fff42b17d15e904bab36136b56e92eaf7fd9c',
      resolvedUrl: 'https://ecoinvent.org/wp-content/uploads/2020/10/201305_Data-Quality-Guideline-for-the-ecoinvent-database-version-3.pdf',
      pageCount: 169,
    },
  },
  tidasProcessesSchema: {
    sourceId: 'src-dapp147-tidas-spec-v030',
    readingId: 'rd-dapp147-tidas-spec-v030',
    artifact: {
      id: 'art-dapp147-tidas-processes-schema-json',
      mediaType: 'application/json',
      sha256: '566eecbdbed49153280b5810e0a9a37e8de2c13dd10716f278b5d6f81184f7fd',
      resolvedUrl: 'https://raw.githubusercontent.com/tiangong-lca/tidas-spec/a84ff8b3b43c87ba30f0f5feec83f9cb4a50b7b7/assets/tidas/schemas/tidas_processes.json',
    },
  },
  tidasPublicRules: {
    sourceId: 'src-dapp147-tidas-spec-v030',
    readingId: 'rd-dapp147-tidas-spec-v030',
    artifact: {
      id: 'art-dapp147-tidas-public-rules-json',
      mediaType: 'application/json',
      sha256: '462310e9e59b01484379ae2d9db8dd8c765acd03e291040249d3b856ebdea9a4',
      resolvedUrl: 'https://raw.githubusercontent.com/tiangong-lca/tidas-spec/a84ff8b3b43c87ba30f0f5feec83f9cb4a50b7b7/assets/tidas/rules/public-rules.v1.json',
    },
  },
  tidasAdjudicationDoc: {
    sourceId: 'src-dapp147-tidas-spec-v030',
    readingId: 'rd-dapp147-tidas-spec-v030',
    artifact: {
      id: 'art-dapp147-tidas-adjudication-md',
      mediaType: 'text/markdown',
      sha256: 'a81d4d2fdcd1a6b4046a583aba58c77a04e3b60abc7d8297584f2087dc2dcf04',
      resolvedUrl: 'https://raw.githubusercontent.com/tiangong-lca/tidas-spec/a84ff8b3b43c87ba30f0f5feec83f9cb4a50b7b7/docs/public-rule-adjudication.md',
    },
  },
});

export const expectedDappPairs = Object.freeze([
  {
    evidenceId: 'ev-dapp147-ilcd2010-dataset-types-and-review',
    passageId: 'psg-dapp147-ilcd2010-dataset-types-and-review',
    carrier: 'ilcd2010',
    pdfIndices: [37, 78, 167, 168, 329, 340, 341],
  },
  {
    evidenceId: 'ev-dapp147-ilcd2010-representativeness-vs-appropriateness',
    passageId: 'psg-dapp147-ilcd2010-representativeness-vs-appropriateness',
    carrier: 'ilcd2010',
    pdfIndices: [343, 344, 345, 346, 347],
  },
  {
    evidenceId: 'ev-dapp147-ilcd2010-dqr-formula-and-five-aspects',
    passageId: 'psg-dapp147-ilcd2010-dqr-formula-and-five-aspects',
    carrier: 'ilcd2010',
    pdfIndices: [348, 349, 350, 351, 352, 353, 354, 355],
  },
  {
    evidenceId: 'ev-dapp147-ilcd2012-twelve-compliance-uuids',
    passageId: 'psg-dapp147-ilcd2012-twelve-compliance-uuids',
    carrier: 'ilcdEl2012',
    pdfIndices: [8, 9, 10],
  },
  {
    evidenceId: 'ev-dapp147-ilcd2012-entry-level-rules',
    passageId: 'psg-dapp147-ilcd2012-entry-level-rules',
    carrier: 'ilcdEl2012',
    pdfIndices: [4, 5, 15, 16],
  },
  {
    evidenceId: 'ev-dapp147-ec2021-secondary-hierarchy-and-cutoff',
    passageId: 'psg-dapp147-ec2021-secondary-hierarchy-and-cutoff',
    carrier: 'ec2021',
    pdfIndices: [78, 79],
  },
  {
    evidenceId: 'ev-dapp147-ec2021-dqr-equations-and-dnm',
    passageId: 'psg-dapp147-ec2021-dqr-equations-and-dnm',
    carrier: 'ec2021',
    pdfIndices: [79, 80, 81, 82, 83, 84, 85],
  },
  {
    evidenceId: 'ev-dapp147-ec2021-verification-and-surveillance',
    passageId: 'psg-dapp147-ec2021-verification-and-surveillance',
    carrier: 'ec2021',
    pdfIndices: [94, 95, 96, 97, 98, 99, 100, 101],
  },
  {
    evidenceId: 'ev-dapp147-efguide2020-provider-dqr-and-ceiling',
    passageId: 'psg-dapp147-efguide2020-provider-dqr-and-ceiling',
    carrier: 'efGuide2020',
    pdfIndices: [24, 25, 26],
  },
  {
    evidenceId: 'ev-dapp147-efguide2020-supporting-subprocesses',
    passageId: 'psg-dapp147-efguide2020-supporting-subprocesses',
    carrier: 'efGuide2020',
    pdfIndices: [26, 27, 28],
  },
  {
    evidenceId: 'ev-dapp147-efguide2020-review-types-and-looklci',
    passageId: 'psg-dapp147-efguide2020-review-types-and-looklci',
    carrier: 'efGuide2020',
    pdfIndices: [37, 38, 39, 40, 41],
  },
  {
    evidenceId: 'ev-dapp147-ef31addendum-six-uuid-matrix-and-erratum',
    passageId: 'psg-dapp147-ef31addendum-six-uuid-matrix-and-erratum',
    carrier: 'ef31Addendum2022',
    pdfIndices: [1, 2, 3, 4],
  },
  {
    evidenceId: 'ev-dapp147-ecoinvent2013-glo-row-and-markets',
    passageId: 'psg-dapp147-ecoinvent2013-glo-row-and-markets',
    carrier: 'ecoinvent2013',
    pdfIndices: [10, 11, 20, 21, 22, 23, 24, 25],
  },
  {
    evidenceId: 'ev-dapp147-ecoinvent2013-pedigree-variance',
    passageId: 'psg-dapp147-ecoinvent2013-pedigree-variance',
    carrier: 'ecoinvent2013',
    pdfIndices: [77, 78, 79, 82, 83, 84, 85],
  },
  {
    evidenceId: 'ev-dapp147-ecoinvent2013-ecoeditor-and-editorial-review',
    passageId: 'psg-dapp147-ecoinvent2013-ecoeditor-and-editorial-review',
    carrier: 'ecoinvent2013',
    pdfIndices: [11, 48, 70, 110, 111, 112, 113, 114, 115, 116],
  },
  {
    evidenceId: 'ev-dapp147-tidas-process-review-schema',
    passageId: 'psg-dapp147-tidas-process-review-schema',
    carrier: 'tidasProcessesSchema',
    pdfIndices: null,
  },
  {
    evidenceId: 'ev-dapp147-tidas-public-rules',
    passageId: 'psg-dapp147-tidas-public-rules',
    carrier: 'tidasPublicRules',
    pdfIndices: null,
  },
  {
    evidenceId: 'ev-dapp147-tidas-adjudication-boundary',
    passageId: 'psg-dapp147-tidas-adjudication-boundary',
    carrier: 'tidasAdjudicationDoc',
    pdfIndices: null,
  },
]);

export const expectedNumericFacts = Object.freeze({
  // ILCD 2010
  'nf-dapp147-ilcd-dataset-types': '3',
  'nf-dapp147-ilcd-goal-situations': '4',
  'nf-dapp147-ilcd-transport-load-pct': '80',
  'nf-dapp147-ilcd-dqr-indicators': '6',
  'nf-dapp147-ilcd-score-best': '1',
  'nf-dapp147-ilcd-score-worst': '5',
  'nf-dapp147-ilcd-not-evaluated-score': '5',
  'nf-dapp147-ilcd-not-applicable-score': '0',
  'nf-dapp147-ilcd-weakest-extra-weight': '4',
  'nf-dapp147-ilcd-weakest-total-weight': '5',
  'nf-dapp147-ilcd-high-threshold': '1.6',
  'nf-dapp147-ilcd-basic-threshold': '3',
  'nf-dapp147-ilcd-estimate-threshold': '4',
  'nf-dapp147-ilcd-table8-num': '23',
  'nf-dapp147-ilcd-table8-den': '9',
  'nf-dapp147-ilcd-table8-printed': '2.56',
  'nf-dapp147-ilcd-compliance-aspects': '5',
  // ILCD-EL 2012
  'nf-dapp147-ilcd2012-full-uuids': '12',
  'nf-dapp147-ilcd2012-establishment-years': '3',
  'nf-dapp147-ilcd2012-el-external-reviewers': '1',
  'nf-dapp147-ilcd2012-el-internal-reviewers': '1',
  // EU 2021/2279
  'nf-dapp147-ec2021-ilcd-el-cap-pct': '10',
  'nf-dapp147-ec2021-cutoff-pct': '3.0',
  'nf-dapp147-ec2021-dqr-criteria': '4',
  'nf-dapp147-ec2021-excellent-cap': '1.5',
  'nf-dapp147-ec2021-verygood-cap': '2.0',
  'nf-dapp147-ec2021-good-cap': '3.0',
  'nf-dapp147-ec2021-fair-cap': '4.0',
  'nf-dapp147-ec2021-company-contrib-pct': '80',
  'nf-dapp147-ec2021-company-p-cap': '3',
  'nf-dapp147-ec2021-company-repr-cap': '2',
  'nf-dapp147-ec2021-sit2-ger-discount-pct': '30',
  'nf-dapp147-ec2021-verifier-min-points': '6',
  'nf-dapp147-ec2021-verifier-min-per-criterion': '1',
  'nf-dapp147-ec2021-verifier-mandatory-criteria': '3',
  'nf-dapp147-ec2021-looklci-dev-pct': '1',
  'nf-dapp147-ec2021-validity-years': '3',
  'nf-dapp147-ec2021-surveillance-cat-pct': '10.0',
  'nf-dapp147-ec2021-surveillance-total-pct': '5.0',
  // EF Guide 2020 & EF 3.1 Addendum 2022
  'nf-dapp147-efguide-contrib-pct': '80',
  'nf-dapp147-efguide-example-part1-pct': '30',
  'nf-dapp147-efguide-example-part2-pct': '50',
  'nf-dapp147-efguide-single-criterion-cap': '3.0',
  'nf-dapp147-efguide-allowed-review-types': '2',
  'nf-dapp147-efguide-total-review-types': '5',
  'nf-dapp147-efguide-type1-min-reviewers': '3',
  'nf-dapp147-efguide-type2-min-reviewers': '2',
  'nf-dapp147-efguide-min-external-reviewers': '1',
  'nf-dapp147-efguide-looklci-limit-pct': '1',
  'nf-dapp147-ef31add-compliance-systems-max': '6',
  'nf-dapp147-ef31add-compliance-systems-nopefcr': '5',
  // ecoinvent v3 2013
  'nf-dapp147-eco3-pedigree-indicators': '5',
  'nf-dapp147-eco3-total-variance-terms': '6',
  'nf-dapp147-eco3-var5-reliability': '0.04',
  'nf-dapp147-eco3-var5-completeness': '0.008',
  'nf-dapp147-eco3-var5-temporal': '0.04',
  'nf-dapp147-eco3-var5-geographical': '0.002',
  'nf-dapp147-eco3-var5-technological': '0.12',
  'nf-dapp147-eco3-min-review-experts': '3',
  'nf-dapp147-eco3-crosscutting-subtypes': '4',
  'nf-dapp147-eco3-validation-field': '3340',
  // TIDAS v0.3.0
  'nf-dapp147-tidas-review-enum-count': '6',
  'nf-dapp147-tidas-baseline-files': '20',
});

const gt = (a, b) => a[0] * b[1] > b[0] * a[1];
const lt = (a, b) => a[0] * b[1] < b[0] * a[1];
const eq = (a, b) => a[0] * b[1] === b[0] * a[1];

const forbiddenReaderPattern = /(?:[<>]|pdfIndices?|PDF\s*indices|PDF\s*index|PDF\s*第|印刷\s*pp?|印\s*pp|§|web\s+extracted\s+lines|零基索引|本仓库|公开仓库|本轮|本次核读|工作树|尚未核闭|未直接重录|硬编码|與|(?<![A-Za-z-])(?:cl|ev|src|rd|psg|nf|art|work|lit|gap|rev|q)-[a-z0-9-]+|\bCASE-[A-Z0-9-]+\b|\bB(?:0[1-9]|[12][0-9]|3[0-2])\b|[0-9a-f]{64}|[0-9a-f]{7,}\.{3}|[0-9a-f]{8}-[0-9a-f]{4})/;
const tailwindRiskWord = new RegExp(`\\b(?:${['\\x73hadow', '\\x72ing', '\\x74runcate', '\\x63ollapse', '\\x67row', '\\x73hrink', '\\x62lur', '\\x69talic', '\\x75nderline', '\\x68idden', '\\x69nvisible', 'sr-\\x6fnly', '\\x63ontainer'].join('|')})\\b`);

export function assertCleanDataApplicabilityProse(str, label, allowTablePipes = false) {
  if (!scienceText(str)) {
    throw new Error(`Data applicability comparison hygiene check failed on ${label}: ${str}`);
  }
  const cleaned = allowTablePipes ? str.replace(/\|/g, ' ') : str;
  if (forbiddenReaderPattern.test(cleaned) || tailwindRiskWord.test(cleaned)) {
    throw new Error(`Data applicability comparison hygiene check failed on ${label}: ${str}`);
  }
}

function assertProseContainsAll(text, tokens, label) {
  for (const token of tokens) {
    if (!text.includes(token)) {
      throw new Error(`Data applicability comparison prose binding missing "${token}" on ${label}`);
    }
  }
}

export const requiredDappClaims = Object.freeze({
  'cl-dapp147-dataset-roles-and-system-linking': {
    premises: [
      'cl-db2011-user-and-manager',
      'cl-db2011-represented-object',
      'cl-db2011-scope-examples',
    ],
    evidence: [
      'ev-dapp147-ilcd2010-dataset-types-and-review',
      'ev-dapp147-ecoinvent2013-glo-row-and-markets',
      'ev-dapp147-efguide2020-supporting-subprocesses',
      'ev-dapp147-tidas-public-rules',
    ],
    tokens: ['转换活动', '市场活动', '全球父过程', '部分终止系统', '消费组合'],
  },
  'cl-dapp147-intrinsic-vs-context-representativeness': {
    premises: [
      'cl-db2011-represented-object',
      'cl-db2011-scope-examples',
      'cl-dapp147-dataset-roles-and-system-linking',
    ],
    evidence: [
      'ev-dapp147-ilcd2010-representativeness-vs-appropriateness',
      'ev-dapp147-ec2021-dqr-equations-and-dnm',
      'ev-dapp147-efguide2020-provider-dqr-and-ceiling',
    ],
    tokens: ['1.0', '3.75', '1.5', '3.0', '30%', '2.90'],
  },
  'cl-dapp147-quality-architectures-and-prerequisite-split': {
    premises: [
      'cl-dapp147-intrinsic-vs-context-representativeness',
      'cl-db2011-representativeness-and-precision',
      'cl-db2011-documenting-number',
    ],
    evidence: [
      'ev-db2011-quality-dimensions',
      'ev-dapp147-ilcd2010-dqr-formula-and-five-aspects',
      'ev-dapp147-ec2021-dqr-equations-and-dnm',
      'ev-dapp147-efguide2020-provider-dqr-and-ceiling',
      'ev-dapp147-ecoinvent2013-pedigree-variance',
    ],
    tokens: ['六项', '四项', '对数正态', '0.21'],
  },
  'cl-dapp147-weakest-link-vs-mean-and-80pct-masking': {
    premises: [
      'cl-dapp147-quality-architectures-and-prerequisite-split',
      'cl-db2011-aggregation-information',
      'cl-db2011-missing-and-zero',
    ],
    evidence: [
      'ev-dapp147-ilcd2010-dqr-formula-and-five-aspects',
      'ev-dapp147-ec2021-dqr-equations-and-dnm',
      'ev-dapp147-ec2021-secondary-hierarchy-and-cutoff',
      'ev-dapp147-efguide2020-provider-dqr-and-ceiling',
      'ev-dapp147-ilcd2012-entry-level-rules',
    ],
    tokens: ['2.60', '3.30', '2.50', '2.25', '1.75', '80%', '10%'],
  },
  'cl-dapp147-validation-vs-review-and-team-thresholds': {
    premises: [
      'cl-db2011-review-relative-to-criteria',
      'cl-db2011-review-questions',
      'cl-db2011-validation-context',
    ],
    evidence: [
      'ev-dapp147-ecoinvent2013-ecoeditor-and-editorial-review',
      'ev-dapp147-ilcd2010-dataset-types-and-review',
      'ev-dapp147-ilcd2012-entry-level-rules',
      'ev-dapp147-efguide2020-review-types-and-looklci',
      'ev-dapp147-ec2021-verification-and-surveillance',
      'ev-dapp147-tidas-process-review-schema',
      'ev-dapp147-tidas-adjudication-boundary',
    ],
    tokens: ['3340', '1%', '6 分', '现场核查', 'Not reviewed'],
  },
  'cl-dapp147-five-aspect-compliance-and-uuid-semantics': {
    premises: [
      'cl-dapp147-validation-vs-review-and-team-thresholds',
      'cl-db2011-recommendation-strength',
      'cl-db2011-review-of-guidance',
    ],
    evidence: [
      'ev-dapp147-ilcd2010-dqr-formula-and-five-aspects',
      'ev-dapp147-ilcd2012-twelve-compliance-uuids',
      'ev-dapp147-ilcd2012-entry-level-rules',
      'ev-dapp147-efguide2020-supporting-subprocesses',
      'ev-dapp147-ef31addendum-six-uuid-matrix-and-erratum',
    ],
    tokens: ['12 套', '6 组', 'Not defined', 'Fully compliant', '5.4.1', '5.4.2'],
  },
  'cl-dapp147-package-migration-inheritance-and-surveillance': {
    premises: [
      'cl-dapp147-dataset-roles-and-system-linking',
      'cl-dapp147-five-aspect-compliance-and-uuid-semantics',
      'cl-db2011-versioned-confidence',
    ],
    evidence: [
      'ev-dapp147-ecoinvent2013-glo-row-and-markets',
      'ev-dapp147-ef31addendum-six-uuid-matrix-and-erratum',
      'ev-weight135-jrc130796-nf-drift-and-rankings',
      'ev-dapp147-ec2021-secondary-hierarchy-and-cutoff',
      'ev-dapp147-ec2021-verification-and-surveillance',
      'ev-dapp147-tidas-public-rules',
    ],
    tokens: ['2,752', '6%', '10%', '13%', '3 年', '10.0%', '5.0%'],
  },
  'cl-dapp147-proxy-hierarchy-cutoff-and-part6-bridge': {
    premises: [
      'cl-dapp147-weakest-link-vs-mean-and-80pct-masking',
      'cl-dapp147-package-migration-inheritance-and-surveillance',
    ],
    evidence: [
      'ev-db2011-conditional-consistency',
      'ev-dapp147-ec2021-secondary-hierarchy-and-cutoff',
      'ev-kb44-ec-transition2026-scope',
      'ev-kb44-ec-transition2026-hierarchy',
    ],
    tokens: ['10%', '3.0%', '2028'],
  },
});

export function validateDataApplicabilityComparisonFactors(catalog, readings) {
  const sourceById = new Map((catalog?.sources ?? []).map(row => [row.id, row]));
  const evidenceById = new Map((catalog?.evidence ?? []).map(row => [row.id, row]));
  const claimById = new Map((catalog?.claims ?? []).map(row => [row.id, row]));
  const readingById = new Map((readings?.readings ?? []).map(row => [row.id, row]));

  const addedEv = (catalog?.evidence ?? []).filter(row => row.id.startsWith('ev-dapp147-'));
  const addedPsg = (readings?.readings ?? []).flatMap(r => (r.passages ?? []).filter(p => p.id.startsWith('psg-dapp147-')));
  if (addedEv.length !== expectedDappPairs.length || addedPsg.length !== expectedDappPairs.length) {
    throw new Error(`Data applicability comparison expected ${expectedDappPairs.length} 1-to-1 ev/psg pairs, got ${addedEv.length}/${addedPsg.length}`);
  }

  const factMap = new Map();
  for (const pair of expectedDappPairs) {
    const carrier = dappCarriers[pair.carrier];
    const src = sourceById.get(carrier.sourceId);
    const rd = readingById.get(carrier.readingId);
    const ev = evidenceById.get(pair.evidenceId);
    const psg = rd?.passages?.find(row => row.id === pair.passageId);
    const art = rd?.artifacts?.find(row => row.id === carrier.artifact.id);
    if (!src || !rd || !ev || !psg || !art) {
      throw new Error(`Data applicability comparison missing bound source/reading/artifact/passage/evidence for ${pair.evidenceId}`);
    }
    if (ev.sourceId !== carrier.sourceId || ev.readingId !== carrier.readingId || ev.passageId !== pair.passageId
        || psg.artifactId !== carrier.artifact.id || art.sha256 !== carrier.artifact.sha256
        || art.mediaType !== carrier.artifact.mediaType) {
      throw new Error(`Data applicability comparison broken 1-to-1 single-artifact provenance on ${pair.evidenceId}`);
    }
    if (pair.pdfIndices === null) {
      if (psg.pdfIndices !== undefined || art.pageCount !== undefined) {
        throw new Error(`Data applicability comparison non-PDF passage must omit pdfIndices/pageCount: ${pair.passageId}`);
      }
    } else if (!sameScienceValue(psg.pdfIndices, pair.pdfIndices) || art.pageCount !== carrier.artifact.pageCount) {
      throw new Error(`Data applicability comparison pdfIndices/pageCount mismatch on ${pair.passageId}`);
    }
    assertCleanDataApplicabilityProse(ev.locator, `evidence(${ev.id}).locator`);
    for (const fact of ev.numericFacts ?? []) {
      if (factMap.has(fact.id)) throw new Error(`Duplicate numericFact id ${fact.id}`);
      factMap.set(fact.id, fact.value);
    }
  }

  const expectedFactKeys = Object.keys(expectedNumericFacts);
  if (factMap.size !== expectedFactKeys.length) {
    throw new Error(`Data applicability comparison numericFacts count mismatch: got ${factMap.size}, expected ${expectedFactKeys.length}`);
  }
  const consumed = new Set();
  const readFact = id => {
    if (!Object.hasOwn(expectedNumericFacts, id) || factMap.get(id) !== expectedNumericFacts[id]) {
      throw new Error(`Data applicability comparison missing or mismatched numericFact ${id}: ${factMap.get(id)}`);
    }
    consumed.add(id);
    return decimal(factMap.get(id));
  };

  // 1. ILCD 2010 structure, Table 7 boundary, and Table 8 worked example
  const ilcdTypes = readFact('nf-dapp147-ilcd-dataset-types');
  const ilcdSits = readFact('nf-dapp147-ilcd-goal-situations');
  const ilcdLoadPct = readFact('nf-dapp147-ilcd-transport-load-pct');
  const ilcdInds = readFact('nf-dapp147-ilcd-dqr-indicators');
  const ilcdBest = readFact('nf-dapp147-ilcd-score-best');
  const ilcdWorst = readFact('nf-dapp147-ilcd-score-worst');
  const ilcdNotEval = readFact('nf-dapp147-ilcd-not-evaluated-score');
  const ilcdNotApp = readFact('nf-dapp147-ilcd-not-applicable-score');
  const ilcdWeakExtra = readFact('nf-dapp147-ilcd-weakest-extra-weight');
  const ilcdWeakTotal = readFact('nf-dapp147-ilcd-weakest-total-weight');
  const ilcdHighCap = readFact('nf-dapp147-ilcd-high-threshold');
  const ilcdBasicCap = readFact('nf-dapp147-ilcd-basic-threshold');
  const ilcdEstCap = readFact('nf-dapp147-ilcd-estimate-threshold');
  const ilcdT8Num = readFact('nf-dapp147-ilcd-table8-num');
  const ilcdT8Den = readFact('nf-dapp147-ilcd-table8-den');
  const ilcdT8Printed = readFact('nf-dapp147-ilcd-table8-printed');
  const ilcdAspects = readFact('nf-dapp147-ilcd-compliance-aspects');

  if (!eq(add(ilcdBest, ilcdWeakExtra), ilcdWeakTotal)
      || !eq(ilcdWorst, ilcdNotEval)
      || !eq(ilcdNotApp, rational(0n, 1n))
      || !gt(ilcdLoadPct, rational(50n, 1n))
      || !eq(ilcdAspects, rational(5n, 1n))) {
    throw new Error('ILCD 2010 fundamental constants failed verification');
  }
  const ilcdDenFull = add(ilcdInds, ilcdWeakExtra); // 6 + 4 = 10
  // fn. 218: four 1s and two 2s -> (4*1 + 2 + 2 + 4*2) / 10 = 16/10 = 1.6
  const fn218Dqr = divide(add(rational(8n, 1n), multiply(ilcdWeakExtra, rational(2n, 1n))), ilcdDenFull);
  if (!eq(fn218Dqr, ilcdHighCap) || fixed(ilcdHighCap, 1) !== '1.6') {
    throw new Error('ILCD Table 7 fn. 218 High-quality threshold failed exact rational check');
  }
  // Table 8 worked example: 23 / 9 = 2.555... -> printed 2.56
  const table8Exact = divide(ilcdT8Num, ilcdT8Den);
  if (fixed(table8Exact, 2) !== fixed(ilcdT8Printed, 2) || !gt(table8Exact, ilcdHighCap) || !lt(table8Exact, ilcdBasicCap)) {
    throw new Error('ILCD Table 8 worked example failed exact rational check');
  }

  // 2. ILCD-EL 2012
  const ilcdFullUuids = readFact('nf-dapp147-ilcd2012-full-uuids');
  const ilcdEstabYears = readFact('nf-dapp147-ilcd2012-establishment-years');
  const ilcdElExtRev = readFact('nf-dapp147-ilcd2012-el-external-reviewers');
  const ilcdElIntRev = readFact('nf-dapp147-ilcd2012-el-internal-reviewers');
  // 4 goal situations * 3 quality tiers (High, Basic, Estimate) = 12 full ILCD compliance UUIDs
  if (!eq(multiply(ilcdSits, ilcdTypes), ilcdFullUuids)
      || !eq(ilcdEstabYears, rational(3n, 1n))
      || !eq(ilcdElExtRev, ilcdElIntRev)) {
    throw new Error('ILCD-EL 2012 compliance UUID matrix count failed verification');
  }

  // 3. EU 2021/2279 & EF Guide 2020 — Reversal 1, Reversal 2, Reversal 3
  const ecElCapPct = readFact('nf-dapp147-ec2021-ilcd-el-cap-pct');
  const ecCutoffPct = readFact('nf-dapp147-ec2021-cutoff-pct');
  const ecDqrCriteria = readFact('nf-dapp147-ec2021-dqr-criteria');
  const ecExcCap = readFact('nf-dapp147-ec2021-excellent-cap');
  const ecVgCap = readFact('nf-dapp147-ec2021-verygood-cap');
  const ecGoodCap = readFact('nf-dapp147-ec2021-good-cap');
  const ecFairCap = readFact('nf-dapp147-ec2021-fair-cap');
  const ecCompContrib = readFact('nf-dapp147-ec2021-company-contrib-pct');
  const ecCompPCap = readFact('nf-dapp147-ec2021-company-p-cap');
  const ecCompReprCap = readFact('nf-dapp147-ec2021-company-repr-cap');
  const ecGerDiscPct = readFact('nf-dapp147-ec2021-sit2-ger-discount-pct');
  const ecVerMinPts = readFact('nf-dapp147-ec2021-verifier-min-points');
  const ecVerMinPer = readFact('nf-dapp147-ec2021-verifier-min-per-criterion');
  const ecVerCrit = readFact('nf-dapp147-ec2021-verifier-mandatory-criteria');
  const ecLookLci = readFact('nf-dapp147-ec2021-looklci-dev-pct');
  const ecValidYears = readFact('nf-dapp147-ec2021-validity-years');
  const ecSurvCatPct = readFact('nf-dapp147-ec2021-surveillance-cat-pct');
  const ecSurvTotPct = readFact('nf-dapp147-ec2021-surveillance-total-pct');

  const efgContrib = readFact('nf-dapp147-efguide-contrib-pct');
  const efgPart1 = readFact('nf-dapp147-efguide-example-part1-pct');
  const efgPart2 = readFact('nf-dapp147-efguide-example-part2-pct');
  const efgSingleCap = readFact('nf-dapp147-efguide-single-criterion-cap');
  const efgAllowedTypes = readFact('nf-dapp147-efguide-allowed-review-types');
  const efgTotalTypes = readFact('nf-dapp147-efguide-total-review-types');
  const efgType1Min = readFact('nf-dapp147-efguide-type1-min-reviewers');
  const efgType2Min = readFact('nf-dapp147-efguide-type2-min-reviewers');
  const efgMinExt = readFact('nf-dapp147-efguide-min-external-reviewers');
  const efgLookLci = readFact('nf-dapp147-efguide-looklci-limit-pct');
  const ef31MaxSys = readFact('nf-dapp147-ef31add-compliance-systems-max');
  const ef31NoPefcrSys = readFact('nf-dapp147-ef31add-compliance-systems-nopefcr');

  // Reversal 1: Dataset A (2,3,3,2 + C=2,M=2 -> sum=14; Xw=3) vs Dataset B (1,5,2,1 + C=2,M=2 -> sum=13; Xw=5)
  const ilcdA = divide(add(rational(14n, 1n), multiply(ilcdWeakExtra, rational(3n, 1n))), ilcdDenFull); // 26/10 = 2.60
  const ilcdB = divide(add(rational(13n, 1n), multiply(ilcdWeakExtra, rational(5n, 1n))), ilcdDenFull); // 33/10 = 3.30
  const pefA = divide(rational(10n, 1n), ecDqrCriteria); // 10/4 = 2.50
  const pefB = divide(rational(9n, 1n), ecDqrCriteria);  // 9/4 = 2.25
  if (fixed(ilcdA, 2) !== '2.60' || fixed(ilcdB, 2) !== '3.30'
      || !lt(ilcdA, ilcdBasicCap) || !gt(ilcdB, ilcdBasicCap) || !lt(ilcdB, ilcdEstCap)
      || fixed(pefA, 2) !== '2.50' || fixed(pefB, 2) !== '2.25'
      || !lt(ilcdA, ilcdB) || !lt(pefB, pefA) || !lt(pefB, ecGoodCap)) {
    throw new Error('Reversal 1 (ILCD weakest-link 5x penalty vs PEF Eq. 19 arithmetic mean) failed exact check');
  }
  // Provider single-criterion ceiling on C = (1,4,1,1) with C=1, M=1
  const pefC = divide(rational(7n, 1n), ecDqrCriteria); // 1.75
  const ilcdC = divide(add(rational(9n, 1n), multiply(ilcdWeakExtra, rational(4n, 1n))), ilcdDenFull); // 2.50
  if (fixed(pefC, 2) !== '1.75' || fixed(ilcdC, 2) !== '2.50'
      || !lt(pefC, ecVgCap) || !gt(rational(4n, 1n), efgSingleCap)) {
    throw new Error('Provider single-criterion ceiling twist failed exact check');
  }

  // Reversal 2: Provider DQR = 1.0 ("Excellent") -> Study context (4,5,5,1) = 3.75 > 3.0; Sit 2 Opt 2 GeR = 3.0 -> 2.1
  const providerExc = divide(rational(4n, 1n), ecDqrCriteria); // 1.0
  const contextFail = divide(rational(15n, 1n), ecDqrCriteria); // 3.75
  const gerMult = subtract(rational(1n, 1n), divide(ecGerDiscPct, rational(100n, 1n))); // 0.7
  const sit2NoDisc = divide(add(add(rational(4n, 1n), efgSingleCap), add(rational(3n, 1n), rational(5n, 2n))), ecDqrCriteria); // 12.5/4 = 3.125
  const sit2Opt2Dqr = divide(add(add(rational(4n, 1n), multiply(efgSingleCap, gerMult)), add(rational(3n, 1n), rational(5n, 2n))), ecDqrCriteria); // (4 + 2.1 + 3 + 2.5)/4 = 2.90
  if (fixed(providerExc, 1) !== '1.0' || !lt(providerExc, ecExcCap)
      || fixed(contextFail, 2) !== '3.75' || !gt(contextFail, ecGoodCap) || !lt(contextFail, ecFairCap)
      || fixed(sit2NoDisc, 3) !== '3.125' || !gt(sit2NoDisc, ecGoodCap)
      || fixed(sit2Opt2Dqr, 2) !== '2.90' || !lt(sit2Opt2Dqr, ecGoodCap)
      || !gt(ecVgCap, ecExcCap) || !lt(ecCompReprCap, ecCompPCap)) {
    throw new Error('Reversal 2 (intrinsic vs study-context DQR & Situation 2 -30% GeR) failed exact check');
  }

  // Reversal 3: 80% rescaling (30% + 50% = 80% -> 37.5% + 62.5%, leaving 20% un-weighted) + 10% ILCD-EL & 3.0% cut-off
  const rescaled1 = multiply(divide(efgPart1, efgContrib), rational(100n, 1n)); // 37.5
  const rescaled2 = multiply(divide(efgPart2, efgContrib), rational(100n, 1n)); // 62.5
  if (!eq(ecCompContrib, efgContrib) || !eq(add(efgPart1, efgPart2), efgContrib)
      || fixed(rescaled1, 1) !== '37.5' || fixed(rescaled2, 1) !== '62.5'
      || !gt(ecElCapPct, ecCutoffPct) || !eq(ecLookLci, efgLookLci)
      || !gt(efgType1Min, efgType2Min) || !gt(efgType2Min, efgMinExt)
      || !lt(efgAllowedTypes, efgTotalTypes)
      || !gt(ecVerMinPts, multiply(ecVerMinPer, ecVerCrit))
      || !eq(ecValidYears, rational(3n, 1n))
      || !gt(ecSurvCatPct, ecSurvTotPct)
      || !eq(subtract(ef31MaxSys, ef31NoPefcrSys), rational(1n, 1n))) {
    throw new Error('EF 80% rescaling, review types, verifier score, surveillance triggers or 6-UUID count failed check');
  }

  // 4. ecoinvent v3 & TIDAS v0.3.0
  const ecoPedInds = readFact('nf-dapp147-eco3-pedigree-indicators');
  const ecoTotTerms = readFact('nf-dapp147-eco3-total-variance-terms');
  const vRel = readFact('nf-dapp147-eco3-var5-reliability');
  const vComp = readFact('nf-dapp147-eco3-var5-completeness');
  const vTemp = readFact('nf-dapp147-eco3-var5-temporal');
  const vGeo = readFact('nf-dapp147-eco3-var5-geographical');
  const vTech = readFact('nf-dapp147-eco3-var5-technological');
  const ecoMinExp = readFact('nf-dapp147-eco3-min-review-experts');
  const ecoCrossSub = readFact('nf-dapp147-eco3-crosscutting-subtypes');
  const ecoValField = readFact('nf-dapp147-eco3-validation-field');
  const tidasEnums = readFact('nf-dapp147-tidas-review-enum-count');
  const tidasFiles = readFact('nf-dapp147-tidas-baseline-files');

  const maxPedigreeVarSum = add(add(add(add(vRel, vComp), vTemp), vGeo), vTech); // 0.21
  if (!eq(add(ecoPedInds, rational(1n, 1n)), ecoTotTerms)
      || fixed(maxPedigreeVarSum, 2) !== '0.21'
      || !lt(ecoMinExp, ecoCrossSub)
      || !eq(ecoValField, rational(3340n, 1n))
      || !eq(tidasEnums, rational(6n, 1n))
      || !eq(tidasFiles, rational(20n, 1n))) {
    throw new Error('ecoinvent v3 pedigree variance or TIDAS v0.3.0 metadata failed check');
  }

  if (consumed.size !== expectedFactKeys.length) {
    const unconsumed = expectedFactKeys.filter(k => !consumed.has(k));
    throw new Error(`Unconsumed numericFacts in Data applicability comparison: ${unconsumed.join(', ')}`);
  }

  // 5. Verify all 8 added claims and all 14 existing cl-db2011-* claims + 16 normalized evidence locators
  for (const [id, spec] of Object.entries(requiredDappClaims)) {
    const claim = claimById.get(id);
    if (!claim || claim.status !== 'reviewed'
        || !sameScienceValue(claim.premiseIds, spec.premises)
        || !sameScienceValue(claim.evidenceIds, spec.evidence)) {
      throw new Error(`Data applicability comparison claim missing or mismatched premises/evidence: ${id}`);
    }
    assertCleanDataApplicabilityProse(claim.text, `claims(${id}).text`);
    assertCleanDataApplicabilityProse(claim.scope, `claims(${id}).scope`);
    for (const [idx, cav] of (claim.caveats ?? []).entries()) {
      assertCleanDataApplicabilityProse(cav, `claims(${id}).caveats[${idx}]`);
    }
    assertProseContainsAll(claim.text, spec.tokens, id);
  }

  for (const claim of (catalog?.claims ?? []).filter(row => row.id.startsWith('cl-db2011-'))) {
    assertCleanDataApplicabilityProse(claim.text, `claims(${claim.id}).text`);
    assertCleanDataApplicabilityProse(claim.scope, `claims(${claim.id}).scope`);
    for (const [idx, cav] of (claim.caveats ?? []).entries()) {
      assertCleanDataApplicabilityProse(cav, `claims(${claim.id}).caveats[${idx}]`);
    }
  }

  for (const ev of (catalog?.evidence ?? []).filter(row => row.id.startsWith('ev-db2011-') || row.id === 'ev-kb44-ec-transition2026-scope' || row.id === 'ev-kb44-ec-transition2026-hierarchy')) {
    assertCleanDataApplicabilityProse(ev.locator, `evidence(${ev.id}).locator`);
  }
}
