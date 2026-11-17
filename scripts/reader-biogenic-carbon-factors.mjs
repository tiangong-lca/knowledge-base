import { editionDigest } from './reader-current-edition.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const efUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF3_1/EF-v3.1.zip';

const carriers = {
  ilcd: {
    sourceId: 'src-book-ilcd-2011-lcia-recommendations',
    readingId: 'rd-ilcd-2011-eutrophication-pathways',
    artifact: {
      id: 'art-ilcd-2011-lcia-recommendations-pdf',
      mediaType: 'application/pdf',
      sha256: '1adbcb9218443922f8c403a16b9d32b71df27c43c789925fc2afb606e8a0835f',
      resolvedUrl: 'https://publications.jrc.ec.europa.eu/repository/bitstream/JRC61049/jrc61049_ilcd%20handbook%20final.pdf',
      pageCount: 159,
    },
  },
  pefcr63: {
    sourceId: 'src-kb44-pef-guidance2018',
    readingId: 'rd-kb44-pef-guidance2018',
    artifact: {
      id: 'art-kb44-pef-guidance2018-pdf',
      mediaType: 'application/pdf',
      sha256: 'e73d586a4552e397de8411350baeba586a5188a3b3e8c61c5f27ac8fe0ab431e',
      resolvedUrl: 'https://eplca.jrc.ec.europa.eu/permalink/PEFCR_guidance_v6.3-2.pdf',
      pageCount: 238,
    },
  },
  ec2021: {
    sourceId: 'src-kb44-ec2021',
    readingId: 'rd-kb44-ec2021',
    artifact: {
      id: 'art-kb44-ec2021-r01-pdf',
      mediaType: 'application/pdf',
      sha256: '42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7',
      resolvedUrl: 'https://publications.europa.eu/resource/cellar/ca3eccfd-da68-11ec-a95f-01aa75ed71a1.0006.01/DOC_1',
      pageCount: 384,
    },
  },
  jrc109369: {
    sourceId: 'src-fossil117-jrc109369',
    readingId: 'rd-fossil117-jrc109369',
    artifact: {
      id: 'art-fossil117-jrc109369-pdf',
      mediaType: 'application/pdf',
      sha256: '06094aa57b49c754be6b846882f70ef1d803cf57617fc37de9341ea2d93f2421',
      resolvedUrl: 'https://publications.jrc.ec.europa.eu/repository/bitstream/JRC109369/jrc109369_final_online.pdf',
      pageCount: 42,
    },
  },
  jrc130796: {
    sourceId: 'src-flow-pilot-ef31-update',
    readingId: 'rd-flow-pilot-ef31-update',
    artifact: {
      id: 'art-flow-pilot-ef31-jrc130796',
      mediaType: 'application/pdf',
      sha256: '938d7272de6769e8d484bcfc10f8c9be3688caa4a718d298790e8df7b3a65c58',
      resolvedUrl: 'https://publications.jrc.ec.europa.eu/repository/bitstream/JRC130796/JRC130796_01.pdf',
      pageCount: 57,
    },
  },
  efAddendum: {
    sourceId: 'src-tox123-ef31-addendum',
    readingId: 'rd-tox123-ef31-addendum',
    artifact: {
      id: 'art-tox123-ef31-addendum-pdf',
      mediaType: 'application/pdf',
      sha256: '76a921ca994964f158a5baf4962be2cb1cdeb73583835f7c047eed2087a952b7',
      resolvedUrl: 'https://eplca.jrc.ec.europa.eu/permalink/EF_Data_Guide_EF3.1_addendum.pdf',
      pageCount: 5,
    },
  },
  ef31: {
    sourceId: 'src-bio127-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-flow-pilot-ef-6209b35f',
      mediaType: 'application/xml',
      sha256: 'c0fe31d3c045ae85b64bd85a3bfa41e1f246d664e8f8d463005f37dee003a5a8',
      resolvedUrl: efUrl,
    },
  },
  ar6Errata: {
    sourceId: 'src-kb54-ipcc-ar6-errata-2025-10-07-pdf',
    readingId: 'rd-kb54-ipcc-ar6-errata-2025-10-07-pdf',
    artifact: {
      id: 'art-kb54-ipcc-ar6-errata-2025-10-07-pdf',
      kind: 'retrieved',
      mediaType: 'application/pdf',
      sha256: '3894b028c7df8b4791b1052f44eb4604aa502e1d4b99e19fa504aaf3014935b9',
      resolvedUrl: 'https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Errata.pdf',
      pageCount: 33,
    },
  },
  rivm: {
    sourceId: 'src-land111-rivm2016',
    readingId: 'rd-land111-rivm2016',
    artifact: {
      id: 'art-land111-rivm2016-pdf',
      mediaType: 'application/pdf',
      sha256: '56f3124beba99cb3b2bd2d48bd9dc6a7d96a18275568e9575ea600052ec60597',
      resolvedUrl: 'https://rivm.openrepository.com/server/api/core/bitstreams/2082d9d2-415a-4f90-9456-fff9bc590bb6/content',
      pageCount: 194,
    },
  },
  recipe2017: {
    sourceId: 'src-book-recipe-2017-primary-article',
    readingId: 'rd-recipe-2017-primary-article',
    artifact: {
      id: 'art-recipe-2017-primary-article-pdf',
      mediaType: 'application/pdf',
      sha256: 'f6d1909e9b11c37c89303130037403fb5de724a099982498af5b29dd9c4ef543',
      resolvedUrl: 'https://www.vliz.be/imisdocs/publications/388157.pdf',
      pageCount: 10,
    },
  },
  lcimpact2020: {
    sourceId: 'src-land111-lcimpact2020-article',
    readingId: 'rd-land111-lcimpact2020-article',
    artifact: {
      id: 'art-land111-lcimpact2020-article-pdf',
      mediaType: 'application/pdf',
      sha256: '42fa6a40f98d884135c7d4771179b0b4dfdc1f83220ea6926ee27632b4ece92e',
      resolvedUrl: 'https://www.lc-impact.eu/doc/Verones_etal_2020_LC-IMPACT.pdf',
      pageCount: 19,
    },
  },
};

const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const efSelectedMembers = [
  // 4 reused EF-v3.1.zip members already registered on rd-flow-pilot-ef31
  ['art-flow-pilot-ef-6209b35f', 'application/xml', 'c0fe31d3c045ae85b64bd85a3bfa41e1f246d664e8f8d463005f37dee003a5a8', null],
  ['art-flow99-ef-mass', 'application/xml', '8fed3fee7b905fe5eb1099880810842f32226966bad658cf25c4be49581e5eb4', null],
  ['art-ozone119-ef-flow-ch4-fossil', 'application/xml', 'a46a3a16e17cddc90059a95055fb87be0e3dcba184b175719cc5dc2751136491', null],
  ['art-ozrad121-ef-flow-n2o', 'application/xml', 'e9c30654226dd36c5fb86226e7091b492c70bb375aebc20a057124e8e83607bb', null],
  // 19 newly inspected EF-v3.1.zip members (CRC32 + SHA-256 verified)
  ['art-bio127-ef-method-cc-fossil', 'application/xml', '7925c8ad33f804723fee7a808d8bf98c8ecdca9b47a5d6f732e415137ac58991', null],
  ['art-bio127-ef-method-cc-biogenic', 'application/xml', 'a3d8a39e8e0bacfe7f2877b2bf1886cb733b4124cddaf362a0a5e285311878e1', null],
  ['art-bio127-ef-method-cc-luluc', 'application/xml', 'f184b2f418e69aa51df17f4741674c82ff98c486d78450097140fb6e863ffe4a', null],
  ['art-bio127-ef-converter-cc-total', 'application/xml', '0108d6579e783b92d26234e1365486866daad76991974e71cac2ca159de32274', null],
  ['art-bio127-ef-source-ipcc2013', 'application/xml', 'ecc44e30005cf46079e362727c446ec1af938b0898ee4b673f9b1200dea1b964', null],
  ['art-bio127-ef-method-config', 'application/xml', '14237568217d30236cb8bec43171c746162fde9aa4751f3b30d5fd49e4a3dce9', null],
  ['art-bio127-ef-nf-wf-xlsx', xlsxMime, '8a5ceda370b2c312d085032fb9c154ce56f45e46c4d1dbba4e56cd9aedaab554', null],
  ['art-bio127-ef-pef-method-pdf', 'application/pdf', '6f2a27bf7fc1d1104ecaf9e77b208cc4e65b20e567b200975a67671133e1fab9', 248],
  ['art-bio127-ef-flow-co2-fossil-air', 'application/xml', '01272f18a0e7b844d6e4d5f582b1866a0b19b8419dd78460f4f47bb750811353', null],
  ['art-bio127-ef-flow-co-fossil-air', 'application/xml', 'a3b4f507e439f4e4bc5120019064f4b7e1b87847c82d3e949844fb458366209b', null],
  ['art-bio127-ef-flow-co2-bio-air', 'application/xml', 'd12aaac2468153e1454ae2816601860cbc38e9583bd4eb26244faed444eaf3c2', null],
  ['art-bio127-ef-flow-co2-fossil-in-cap', 'application/xml', 'dceec7c1977cff4045f8945773d26ef224e611f9e2975bfe66a50a576f1ff0cf', null],
  ['art-bio127-ef-flow-co-bio-air', 'application/xml', '82739af3c8d3ff7ccda471d3766bb1dfc4b86fd9cf6555bf4f10ecb22d7ba5a1', null],
  ['art-bio127-ef-flow-co2-luluc-air', 'application/xml', 'f93ba398a40ab2029ed3cfd8239b82932e9821ddfdc8a62dd945f92beff276c2', null],
  ['art-bio127-ef-flow-co2-luluc-in', 'application/xml', 'bc7e316f7d7cd0e6e4f18bcf6407407e8a0ed5160ea14843d2f741fe93937567', null],
  ['art-bio127-ef-flow-ch4-luluc-air', 'application/xml', '46cdca726292357a86e3318f86d0180c283bb734be3ca6f22b701502774c89fc', null],
  ['art-bio127-ef-flow-co2-bio-in', 'application/xml', '8098585bb2a2db5d6f2f4bca1ba41ead7a1f80c8a4333976657c7e46c38ca428', null],
  ['art-bio127-ef-flow-co2-fossil-in-low', 'application/xml', '8a0d17314df25883fc54c81fd94d093b7749bcad3e5c0d82f17905a7553037b0', null],
  ['art-bio127-ef-flow-ch4-bio-air', 'application/xml', '2e1563b2b41886351ac8c5815ff61bdad02ea748548f0392edbeea054c5bd76c', null],
];

const evidenceRows = [
  ['ilcd2011-climate', 'ilcd', 'psg-bio127-ilcd2011-climate', null,
    'a0653d3e66293686ef685f4ee56e47548ee4d8ea09614e3a6781a15f3463d745'],
  ['pefcr-v63-climate', 'pefcr63', 'psg-bio127-pefcr-v63-climate', null,
    '374ee5a15f910c357b702f82d2866e084238f894a43b4d25a67fb31f88d98060'],
  ['ec2021-climate-rules', 'ec2021', 'psg-bio127-ec2021-climate-rules', null,
    'f2b4b18dcd887db7c6daecac48fde93a55c7579c9fa9a543f02b5503c2f37226'],
  ['jrc109369-climate', 'jrc109369', 'psg-bio127-jrc109369-climate', null,
    '9cb3ef8b90247fe2c6970188f4570eb44a1e3159b178e972bad29240dba5c3bb'],
  ['jrc130796-climate', 'jrc130796', 'psg-bio127-jrc130796-climate', null,
    'd87aff3cb6c62960bca32dcdcf83a305d995eba7d8dac25731cccf6bad1820c7'],
  ['ef31-addendum-climate', 'efAddendum', 'psg-bio127-ef31-addendum-climate', null,
    '32f4d58bec8125daa200e9edecc9593abba7857bf9763c8408a6569ce11d0be5'],
  ['ef31-climate-xmls', 'ef31', 'psg-bio127-ef31-climate-xmls', 'art-flow-pilot-ef-6209b35f',
    'ff792f081640974e8a739df9aec058f7471ba2ac76066feb9d73751192a259ad'],
  ['ef31-nf-workbook', 'ef31', 'psg-bio127-ef31-nf-workbook', 'art-bio127-ef-nf-wf-xlsx',
    'ea86e17bcee7a532f7c473483327dd1f1b9aa415670ef56ac776b8f4d991625e'],
  ['ar6-errata-fgd-p25', 'ar6Errata', 'psg-bio127-ar6-errata-fgd-p25', null,
    '58fc423a5b0556783fea50c08cade77aeef2b91346826d005e3c5dbcb7194522'],
  ['rivm-ch2-midpoints', 'rivm', 'psg-bio127-rivm-ch2-midpoints', null,
    '7eaee2e469b0d4a976db2aea3e87c411823c8ff73c1338adab29ad45c6ad5ff0'],
  ['rivm-ch2-endpoints', 'rivm', 'psg-bio127-rivm-ch2-endpoints', null,
    '43ac2e6d47aaf9ae048d2d68cf8ce2a37f46199ca405d555760c06358b162b71'],
  ['recipe2017-climate', 'recipe2017', 'psg-bio127-recipe2017-climate', null,
    '9c72e77afc3f74717a3fff11a063b7ae1322f9917bb2103cf309d5f20613241b'],
  ['lcimpact2020-climate', 'lcimpact2020', 'psg-bio127-lcimpact2020-climate', null,
    'e45c6d604ae038db9f0531bd81c3ae3b0e6789d20a0fe7918f6893d672c27868'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateBiogenicCarbonFactors(catalog, readings, { skipRowDigests = false } = {}) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-bio127-')).length !== evidenceRows.length)
    throw new Error('Biogenic carbon evidence count differs from its pinned row inventory');
  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...defaultSourceArtifact } = expected.artifact;
    const expectedSourceArtifact = expected.sourceArtifact ?? defaultSourceArtifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Biogenic carbon changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, mediaType, sha, pageCount] of efSelectedMembers) {
    const expectedMember = { id, mediaType, sha256: sha, resolvedUrl: efUrl, ...(pageCount ? { pageCount } : {}) };
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), expectedMember))
      throw new Error(`Biogenic carbon changed a verified EF 3.1 member: ${id}`);
  }

  const facts = new Map();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-bio127-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || record.sourceId !== expected.sourceId || record.readingId !== expected.readingId
        || record.passageId !== passageId || passage.artifactId !== expectedArtifactId)
      throw new Error(`Biogenic carbon changed the selected row or support passage: ${id}`);
    const identity = {
      sourceId: record.sourceId,
      readingId: record.readingId,
      locator: record.locator,
      passage: {
        id: passage.id,
        artifactId: passage.artifactId,
        locator: passage.locator,
        printedPages: passage.printedPages ?? null,
        pdfIndices: passage.pdfIndices ?? null,
      },
      fact: record.numericFact ?? null,
      facts: record.numericFacts ?? null,
    };
    if (!skipRowDigests && editionDigest(identity) !== digest)
      throw new Error(`Biogenic carbon changed the selected row or support passage: ${id}`);
    if (record.numericFact) facts.set(name, record.numericFact.value);
    for (const item of record.numericFacts ?? []) {
      if (facts.has(item.id)) throw new Error(`Biogenic carbon duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== 128) throw new Error(`Biogenic carbon expected 128 verified numeric facts, got ${facts.size}`);
  validateCalculations(facts, catalog);
  validateSupportLinks(catalog);
}

const DECIMALS = 40;
const scale = 10n ** BigInt(DECIMALS);
const canonicalDecimalPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

export function exactDecimal(value) {
  if (typeof value !== 'string' || !canonicalDecimalPattern.test(value))
    throw new Error(`Biogenic carbon requires canonical decimal literal: ${value}`);
  const negative = value.startsWith('-');
  const clean = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = clean.split('.');
  if (fraction.length > DECIMALS) throw new Error(`Biogenic carbon decimal exceeds ${DECIMALS} places: ${value}`);
  const parsed = BigInt(whole + fraction.padEnd(DECIMALS, '0'));
  return negative ? -parsed : parsed;
}

export function mulScaled(a, b) {
  const product = a * b;
  if (product === 0n) return 0n;
  const neg = product < 0n;
  const abs = neg ? -product : product;
  const rounded = (abs + scale / 2n) / scale;
  return neg ? -rounded : rounded;
}

export function ratioScaled(numerator, denominator) {
  if (denominator === 0n) throw new Error('Biogenic carbon zero denominator in fixed-point division');
  if (numerator === 0n) return 0n;
  const neg = (numerator < 0n) !== (denominator < 0n);
  const absNum = numerator < 0n ? -numerator : numerator;
  const absDen = denominator < 0n ? -denominator : denominator;
  const rounded = (absNum * scale + absDen / 2n) / absDen;
  return neg ? -rounded : rounded;
}

function bigintSqrt(n) {
  if (n <= 0n) return 0n;
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + n / x) / 2n;
  }
  return x;
}

function displayedDecimal(scaledValue, places) {
  const neg = scaledValue < 0n;
  const abs = neg ? -scaledValue : scaledValue;
  let out;
  if (places === 0) out = ((abs + scale / 2n) / scale).toString();
  else {
    const step = 10n ** BigInt(DECIMALS - places);
    const rounded = ((abs + step / 2n) / step).toString().padStart(places + 1, '0');
    out = rounded.slice(0, -places) + '.' + rounded.slice(-places);
  }
  return neg && out !== '0' && !/^0\.0+$/.test(out) ? '-' + out : out;
}

function mantissaExp(scaledValue, exp, places) {
  const adjusted = exp >= 0 ? scaledValue / (10n ** BigInt(exp)) : scaledValue * (10n ** BigInt(-exp));
  return displayedDecimal(adjusted, places);
}

// Exact literal & value pins for all 128 verified numericFacts so zero single-fact or coupled-fact mutations survive even with row digests bypassed
const exactFactLiterals = Object.freeze({
  'ilcd-climate-midpoint-horizon': '100',
  'ilcd-climate-sens-short': '20',
  'ilcd-climate-sens-long': '500',
  'ilcd-climate-recommended-endpoints': '0',
  'ilcd-n2o-500yr-claimed-factor': '2',
  'pefcr63-subindicator-threshold-pct': '5',
  'pefcr63-biogenic-100yr-cf': '-1',
  'pefcr63-storage-horizon': '100',
  'pefcr63-ch4-base-ar5': '34',
  'pefcr63-ch4-boucher-add': '2',
  'pefcr63-ch4-stoich-add': '2.75',
  'pefcr63-ch4-fossil-luluc-cf': '36.75',
  'pefcr63-co-fossil-luluc-cf': '1.57',
  'pefcr63-co-biogenic-cf': '0',
  'ec2021-subindicator-count': '3',
  'ec2021-subindicator-threshold-pct': '5',
  'ec2021-storage-credit-allowed': '0',
  'ec2021-dluc-amortization-years': '20',
  'ec2021-dluc-import-cutoff-pct': '90',
  'jrc109369-ch4-fossil-cf': '36.75',
  'jrc109369-co-fossil-cf': '1.57',
  'jrc109369-biogenic-100yr-cf': '-1',
  'jrc130796-ef30-ch4-printed': '36.8',
  'jrc130796-ef31-ch4-fossil': '29.8',
  'jrc130796-ef31-ch4-biogenic': '27',
  'jrc130796-removed-ar5-substances': '32',
  'jrc130796-added-ar6-substances': '43',
  'jrc130796-unmapped-ar6-substances': '23',
  'jrc130796-nf-ef30': '8100',
  'jrc130796-nf-ef31': '7550',
  'jrc130796-nf-rel-diff-pct': '-6.7',
  'jrc130796-ef-datasets-tested': '2752',
  'jrc130796-cc-mean-diff-pct': '-2.9',
  'jrc130796-cc-increasing-share-pct': '6',
  'jrc130796-wood-incin-es-pct': '-58',
  'jrc130796-pur-incin-dk-pct': '302',
  'addendum-updated-categories': '6',
  'addendum-compliance-systems': '6',
  'ef31-cc-total-bytes': '593046',
  'ef31-cc-converter-bytes': '593066',
  'ef31-cc-fossil-bytes': '579621',
  'ef31-cc-biogenic-bytes': '13362',
  'ef31-cc-luluc-bytes': '12917',
  'ef31-cc-total-factors': '1099',
  'ef31-cc-fossil-factors': '1074',
  'ef31-cc-biogenic-factors': '13',
  'ef31-cc-luluc-factors': '12',
  'ef31-cc-subindicator-overlap': '0',
  'ef31-cc-co-factors': '0',
  'ef31-cc-biogenic-100yr-factors': '0',
  'ef31-cc-declared-inventory-items': '217',
  'ef31-bio-co2-in-cf': '0.0',
  'ef31-bio-co2-out-count': '6',
  'ef31-bio-co2-out-cf': '0.0',
  'ef31-bio-ch4-out-count': '6',
  'ef31-bio-ch4-cf': '27.0',
  'ef31-luluc-co2-in-cf': '-1.0',
  'ef31-luluc-co2-out-count': '5',
  'ef31-luluc-co2-out-cf': '1.0',
  'ef31-luluc-ch4-out-count': '6',
  'ef31-luluc-ch4-cf': '29.8',
  'ef31-fossil-co2-out-count': '6',
  'ef31-fossil-co2-in-dup-count': '2',
  'ef31-fossil-co2-in-cf': '0.0',
  'ef31-fossil-ch4-cf': '29.8',
  'ef31-fossil-n2o-out-count': '6',
  'ef31-fossil-n2o-cf': '273.0',
  'ef31-xml-cfc11-cf': '6230.0',
  'ef31-xml-hfc134a-cf': '1530.0',
  'ef31-xml-halon1301-cf': '7200.0',
  'ef31-xml-halon2402-cf': '2170.0',
  'ef31-config-subindicator-nf-wf-count': '0',
  'ef31-nf-xlsx-bytes': '462081',
  'ef31-nf-global-pop': '6895889018',
  'ef31-nf-cc-per-person': '7553.0831628511733',
  'ef31-wf-cc-fraction': '0.2106',
  'ef31-nf-co-fossil-mass': '621616632921.25598',
  'ef31-nf-ch4-bio-mass': '130621437649.45',
  'ef31-nf-ch4-bio-cf-fgd': '27.2',
  'ef31-nf-ch4-bio-total': '3552903104065.04',
  'ef31-nf-cfc11-cf': '6226',
  'ef31-nf-hfc134a-cf': '1526',
  'ef31-nf-halons-geomean-cf': '3952.720582080145',
  'ar6-fgd-ch4-nonfossil-gwp20': '80.8',
  'ar6-fgd-ch4-nonfossil-gwp100': '27.2',
  'ar6-pub-ch4-nonfossil-gwp100': '27.0',
  'rivm-ghg-count': '207',
  'rivm-horizon-i': '20',
  'rivm-horizon-h': '100',
  'rivm-horizon-e': '1000',
  'rivm-agwp1000-co2': '0.000000000000548',
  'rivm-ch4-nonfossil-i': '84',
  'rivm-ch4-nonfossil-h': '34',
  'rivm-ch4-nonfossil-e': '4.8',
  'rivm-ch4-fossil-i': '85',
  'rivm-ch4-fossil-h': '36',
  'rivm-ch4-fossil-e': '4.9',
  'rivm-n2o-i': '264',
  'rivm-n2o-h': '298',
  'rivm-n2o-e': '78.8',
  'rivm-iagtp-co2-i': '0.00000000000000903',
  'rivm-iagtp-co2-h': '0.0000000000000476',
  'rivm-iagtp-co2-e': '0.000000000000423',
  'rivm-urban-ext-low-pct': '2.8',
  'rivm-urban-ext-high-pct': '15.7',
  'rivm-urban-temp-span': '3.5',
  'rivm-urban-ef-terr': '0.037',
  'rivm-terr-area': '108000000000000',
  'rivm-sd-terr': '0.0000000148',
  'rivm-sd-fw': '0.000000000789',
  'rivm-m2e-hh-i': '0.0000000812',
  'rivm-m2e-hh-h': '0.000000928',
  'rivm-m2e-hh-e': '0.0000125',
  'rivm-m2e-terr-i': '0.000000000532',
  'rivm-m2e-terr-h': '0.0000000028',
  'rivm-m2e-terr-e': '0.000000025',
  'rivm-m2e-aq-i': '0.0000000000000145',
  'rivm-m2e-aq-h': '0.0000000000000765',
  'rivm-m2e-aq-e': '0.000000000000682',
  'recipe2017-climate-aops': '3',
  'lcimpact-climate-midpoints': '0',
  'lcimpact-th-short': '100',
  'lcimpact-th-long': '1000',
  'lcimpact-hh-certain-outcomes': '3',
  'lcimpact-hh-all-outcomes': '6',
  'lcimpact-aq-certain-cfs': '0',
  'lcimpact-case-fuel-options': '3',
  'lcimpact-case-fuel-hh-max-ratio': '4',
});

function validateCalculations(facts, catalog) {
  const consumed = new Set();
  const fact = id => {
    const rawVal = facts.get(id);
    if (rawVal === undefined) throw new Error(`Biogenic carbon missing numeric fact: ${id}`);
    const parsed = exactDecimal(rawVal);
    if (!Object.hasOwn(exactFactLiterals, id) || rawVal !== exactFactLiterals[id] || parsed !== exactDecimal(exactFactLiterals[id]))
      throw new Error(`Biogenic carbon numeric fact drifted from verified primary literal: ${id}`);
    consumed.add(id);
    return parsed;
  };
  const raw = id => {
    fact(id);
    return facts.get(id);
  };

  // 1. Midpoint-to-endpoint genealogy across ILCD 2011, EF 2.0-3.1, ReCiPe 2016 and LC-IMPACT (Claim 1).
  const wfPct = mulScaled(fact('ef31-wf-cc-fraction'), 100n * scale);
  const popBillion = ratioScaled(fact('ef31-nf-global-pop'), 1000000000n * scale);
  const nfPerPerson = fact('ef31-nf-cc-per-person');
  const urbanDiff = fact('rivm-urban-ext-high-pct') - fact('rivm-urban-ext-low-pct');
  const urbanSlope = ratioScaled(urbanDiff / 100n, fact('rivm-urban-temp-span'));
  const terrSlopeUnrounded = mulScaled(mulScaled(urbanSlope, fact('rivm-terr-area')), fact('rivm-sd-terr'));
  const terrSlopeRounded = mulScaled(mulScaled(fact('rivm-urban-ef-terr'), fact('rivm-terr-area')), fact('rivm-sd-terr'));
  const calcTerrI = mulScaled(terrSlopeUnrounded, fact('rivm-iagtp-co2-i'));
  const calcTerrH = mulScaled(terrSlopeUnrounded, fact('rivm-iagtp-co2-h'));
  const calcTerrE = mulScaled(terrSlopeRounded, fact('rivm-iagtp-co2-e'));
  if (fact('ilcd-climate-midpoint-horizon') !== 100n * scale
      || fact('ilcd-climate-sens-short') !== 20n * scale
      || fact('ilcd-climate-sens-long') !== 500n * scale
      || fact('ilcd-climate-recommended-endpoints') !== 0n
      || displayedDecimal(wfPct, 2) !== '21.06'
      || displayedDecimal(popBillion, 2) !== '6.90'
      || displayedDecimal(nfPerPerson, 2) !== '7553.08'
      || fact('recipe2017-climate-aops') !== 3n * scale
      || displayedDecimal(urbanDiff, 1) !== '12.9'
      || displayedDecimal(urbanSlope, 3) !== raw('rivm-urban-ef-terr')
      || fact('rivm-terr-area') !== 108000000000000n * scale
      || fact('rivm-sd-terr') !== exactDecimal('0.0000000148')
      || fact('rivm-sd-fw') !== exactDecimal('0.000000000789')
      || mantissaExp(calcTerrI, -10, 2) !== mantissaExp(fact('rivm-m2e-terr-i'), -10, 2)
      || mantissaExp(calcTerrH, -9, 2) !== mantissaExp(fact('rivm-m2e-terr-h'), -9, 2)
      || mantissaExp(calcTerrE, -8, 2) !== mantissaExp(fact('rivm-m2e-terr-e'), -8, 2)
      || !(fact('rivm-iagtp-co2-i') < fact('rivm-iagtp-co2-h') && fact('rivm-iagtp-co2-h') < fact('rivm-iagtp-co2-e'))
      || !(fact('rivm-m2e-hh-i') < fact('rivm-m2e-hh-h') && fact('rivm-m2e-hh-h') < fact('rivm-m2e-hh-e'))
      || !(fact('rivm-m2e-terr-i') < fact('rivm-m2e-terr-h') && fact('rivm-m2e-terr-h') < fact('rivm-m2e-terr-e'))
      || !(fact('rivm-m2e-aq-i') < fact('rivm-m2e-aq-h') && fact('rivm-m2e-aq-h') < fact('rivm-m2e-aq-e'))
      || fact('lcimpact-climate-midpoints') !== 0n
      || fact('lcimpact-th-short') !== 100n * scale
      || fact('lcimpact-th-long') !== 1000n * scale
      || fact('lcimpact-hh-certain-outcomes') !== 3n * scale
      || fact('lcimpact-hh-all-outcomes') !== 6n * scale
      || fact('lcimpact-aq-certain-cfs') !== 0n
      || fact('lcimpact-case-fuel-options') !== 3n * scale
      || fact('lcimpact-case-fuel-hh-max-ratio') !== 4n * scale)
    throw new Error('Biogenic carbon lost midpoint-endpoint genealogy structure or conversion constants');

  const genClaim = uniqueRecord(catalog.claims, 'cl-bio127-midpoint-endpoint-genealogy');
  if (!genClaim?.text.includes('建议以 ' + raw('ilcd-climate-sens-short') + ' 年和 ' + raw('ilcd-climate-sens-long') + ' 年作时间敏感性检验')
      || !genClaim?.text.includes('正式推荐的模型数为 ' + raw('ilcd-climate-recommended-endpoints'))
      || !genClaim?.text.includes('占最高权重 ' + displayedDecimal(wfPct, 2) + '%')
      || !genClaim?.text.includes('人均归一化基准为 ' + displayedDecimal(nfPerPerson, 2) + ' kg CO₂ 当量/人')
      || !genClaim?.text.includes(mantissaExp(fact('rivm-iagtp-co2-i'), -15, 2) + '×10⁻¹⁵、'
        + mantissaExp(fact('rivm-iagtp-co2-h'), -14, 2) + '×10⁻¹⁴ 和 '
        + mantissaExp(fact('rivm-iagtp-co2-e'), -13, 2) + '×10⁻¹³ °C·年/kg CO₂')
      || !genClaim?.text.includes(mantissaExp(fact('rivm-m2e-hh-i'), -8, 2) + '×10⁻⁸、'
        + mantissaExp(fact('rivm-m2e-hh-h'), -7, 2) + '×10⁻⁷ 和 '
        + mantissaExp(fact('rivm-m2e-hh-e'), -5, 2) + '×10⁻⁵ 伤残调整生命年 DALY/kg CO₂ 当量')
      || !genClaim?.text.includes('灭绝 ' + raw('rivm-urban-ext-low-pct') + '% 与升温 4.3 °C 灭绝 ' + raw('rivm-urban-ext-high-pct')
        + '% 之间取差值斜率 ' + displayedDecimal(urbanDiff, 1) + '% / ' + raw('rivm-urban-temp-span')
        + ' °C ≈ ' + raw('rivm-urban-ef-terr') + ' 潜在消失物种比例（PDF）/°C')
      || !genClaim?.text.includes(mantissaExp(fact('rivm-m2e-terr-i'), -10, 2) + '×10⁻¹⁰、'
        + mantissaExp(fact('rivm-m2e-terr-h'), -9, 2) + '×10⁻⁹ 和 '
        + mantissaExp(fact('rivm-m2e-terr-e'), -8, 2) + '×10⁻⁸ species·年/kg CO₂ 当量')
      || !genClaim?.text.includes(mantissaExp(fact('rivm-m2e-aq-i'), -14, 2) + '×10⁻¹⁴、'
        + mantissaExp(fact('rivm-m2e-aq-h'), -14, 2) + '×10⁻¹⁴ 和 '
        + mantissaExp(fact('rivm-m2e-aq-e'), -13, 2) + '×10⁻¹³ species·年/kg CO₂ 当量')
      || !genClaim?.text.includes('中点指标数为 ' + raw('lcimpact-climate-midpoints'))
      || !genClaim?.text.includes('按 ' + raw('lcimpact-th-short') + ' 年和 ' + raw('lcimpact-th-long') + ' 年')
      || !genClaim?.text.includes('只保留腹泻、疟疾与沿海洪灾 ' + raw('lcimpact-hh-certain-outcomes') + ' 类效应')
      || !genClaim?.text.includes('淡水生态气候损害因子置空（' + raw('lcimpact-aq-certain-cfs') + ' 项）')
      || !genClaim?.text.includes('共 ' + raw('lcimpact-hh-all-outcomes') + ' 类效应')
      || !genClaim?.text.includes(raw('lcimpact-case-fuel-options') + ' 种车用燃料案例中气候变化主导了人体健康总损害（燃料间总健康损害相差最高达 '
        + raw('lcimpact-case-fuel-hh-max-ratio') + ' 倍）'))
    throw new Error('Biogenic carbon changed the displayed midpoint-endpoint genealogy prose');

  // 2. ReCiPe 2016 non-CO2 carbon-feedback asymmetry across I/H/E perspectives (Claim 2).
  const ch4Mass = exactDecimal('3.5');
  const ch4ScoreI = mulScaled(ch4Mass, fact('rivm-ch4-nonfossil-i'));
  const ch4ScoreH = mulScaled(ch4Mass, fact('rivm-ch4-nonfossil-h'));
  const ch4ScoreE = mulScaled(ch4Mass, fact('rivm-ch4-nonfossil-e'));
  const n2oI = fact('rivm-n2o-i');
  const n2oH = fact('rivm-n2o-h');
  const n2oE = fact('rivm-n2o-e');
  if (fact('rivm-ghg-count') !== 207n * scale
      || fact('rivm-horizon-i') !== 20n * scale
      || fact('rivm-horizon-h') !== 100n * scale
      || fact('rivm-horizon-e') !== 1000n * scale
      || fact('rivm-agwp1000-co2') !== exactDecimal('0.000000000000548')
      || fact('rivm-ch4-fossil-i') - fact('rivm-ch4-nonfossil-i') !== scale
      || fact('rivm-ch4-fossil-h') - fact('rivm-ch4-nonfossil-h') !== 2n * scale
      || fact('rivm-ch4-fossil-e') - fact('rivm-ch4-nonfossil-e') !== exactDecimal('0.1')
      || !(n2oI < n2oH && n2oH > n2oE)
      || !(ch4ScoreI > n2oI && ch4ScoreH < n2oH && ch4ScoreE < n2oE)
      || ch4ScoreI !== 294n * scale
      || ch4ScoreH !== 119n * scale
      || ch4ScoreE !== exactDecimal('16.8'))
    throw new Error('Biogenic carbon lost ReCiPe 2016 feedback asymmetry or CH4/N2O rank reversal');

  const fbClaim = uniqueRecord(catalog.claims, 'cl-bio127-feedback-perspective-asymmetry');
  if (!fbClaim?.text.includes('共收录 ' + raw('rivm-ghg-count') + ' 种温室气体')
      || !fbClaim?.text.includes('非化石甲烷 ' + raw('rivm-ch4-nonfossil-h') + '、化石甲烷 ' + raw('rivm-ch4-fossil-h')
        + '、氧化亚氮 N₂O 为 ' + raw('rivm-n2o-h') + ' kg CO₂ 当量/kg')
      || !fbClaim?.text.includes('非化石甲烷 ' + raw('rivm-ch4-nonfossil-i') + '、化石甲烷 ' + raw('rivm-ch4-fossil-i')
        + '、N₂O 为 ' + raw('rivm-n2o-i'))
      || !fbClaim?.text.includes(mantissaExp(fact('rivm-agwp1000-co2'), -13, 2) + '×10⁻¹³ W m⁻² yr kg⁻¹')
      || !fbClaim?.text.includes('非化石甲烷 ' + raw('rivm-ch4-nonfossil-e') + '、化石甲烷 ' + raw('rivm-ch4-fossil-e')
        + '、N₂O 为 ' + raw('rivm-n2o-e'))
      || !fbClaim?.text.includes(raw('rivm-n2o-i') + '（' + raw('rivm-horizon-i') + ' 年）→ '
        + raw('rivm-n2o-h') + '（' + raw('rivm-horizon-h') + ' 年）→ '
        + raw('rivm-n2o-e') + '（' + raw('rivm-horizon-e') + ' 年）')
      || !fbClaim?.text.includes('3.5×' + raw('rivm-ch4-nonfossil-i') + '＝' + displayedDecimal(ch4ScoreI, 0)
        + ' 对 ' + raw('rivm-n2o-i') + ' kg CO₂ 当量')
      || !fbClaim?.text.includes(displayedDecimal(ch4ScoreH, 0) + ' 对 ' + raw('rivm-n2o-h')
        + '，以及 ' + displayedDecimal(ch4ScoreE, 1) + ' 对 ' + raw('rivm-n2o-e') + ' kg CO₂ 当量'))
    throw new Error('Biogenic carbon changed the displayed ReCiPe 2016 feedback-asymmetry prose');

  // 3. EF 3.1 exact disjoint sub-indicator partition (1099 = 1074 + 13 + 12) and routing (Claim 3).
  const totalFactors = fact('ef31-cc-total-factors');
  const fossilFactors = fact('ef31-cc-fossil-factors');
  const bioFactors = fact('ef31-cc-biogenic-factors');
  const lulucFactors = fact('ef31-cc-luluc-factors');
  if (fact('ec2021-subindicator-count') !== 3n * scale
      || fact('ec2021-subindicator-threshold-pct') !== 5n * scale
      || fact('pefcr63-subindicator-threshold-pct') !== 5n * scale
      || fossilFactors + bioFactors + lulucFactors !== totalFactors
      || totalFactors !== 1099n * scale
      || fossilFactors !== 1074n * scale
      || fact('ef31-bio-co2-out-count') !== 6n * scale
      || fact('ef31-bio-ch4-out-count') !== 6n * scale
      || bioFactors !== (scale + fact('ef31-bio-co2-out-count') + fact('ef31-bio-ch4-out-count'))
      || lulucFactors !== (scale + fact('ef31-luluc-co2-out-count') + fact('ef31-luluc-ch4-out-count'))
      || fact('ef31-cc-subindicator-overlap') !== 0n
      || fact('ef31-config-subindicator-nf-wf-count') !== 0n
      || fact('ef31-bio-co2-in-cf') !== 0n
      || fact('ef31-bio-co2-out-cf') !== 0n
      || fact('ef31-bio-ch4-cf') !== 27n * scale
      || fact('ef31-luluc-co2-in-cf') !== -scale
      || fact('ef31-luluc-co2-out-cf') !== scale
      || fact('ef31-luluc-co2-out-count') !== 5n * scale
      || fact('ef31-luluc-ch4-out-count') !== 6n * scale
      || fact('ef31-luluc-ch4-cf') !== exactDecimal('29.8')
      || fact('ef31-luluc-ch4-cf') !== fact('ef31-fossil-ch4-cf')
      || fact('ef31-fossil-co2-out-count') !== 6n * scale
      || fact('ef31-fossil-co2-in-dup-count') !== 2n * scale
      || fact('ef31-fossil-co2-in-cf') !== 0n
      || fact('ef31-fossil-n2o-out-count') !== 6n * scale
      || fact('ef31-fossil-n2o-cf') !== 273n * scale)
    throw new Error('Biogenic carbon lost EF 3.1 sub-indicator partition or routing invariants');

  const partClaim = uniqueRecord(catalog.claims, 'cl-bio127-ef31-subindicator-partition');
  if (!partClaim?.text.includes('（' + raw('ef31-cc-fossil-factors') + '＋' + raw('ef31-cc-biogenic-factors')
        + '＋' + raw('ef31-cc-luluc-factors') + '＝' + raw('ef31-cc-total-factors')
        + '，重叠基本流数为 ' + raw('ef31-cc-subindicator-overlap') + '，对应因子完全一致）')
      || !partClaim?.text.includes('超过 ' + raw('ec2021-subindicator-threshold-pct') + '% 时必须单独分列报告')
      || !partClaim?.text.includes(raw('ec2021-subindicator-count') + ' 项子指标的独立归一化与加权配置条数均为 '
        + raw('ef31-config-subindicator-nf-wf-count'))
      || !partClaim?.text.includes('赋 ' + raw('ef31-bio-ch4-cf') + ' kg CO₂ 当量/kg')
      || !partClaim?.text.includes('对土地利用变化 CO₂ 的 1 条大气吸收资源流赋 −1.0、对 '
        + raw('ef31-luluc-co2-out-count') + ' 条大气排放流赋 +' + raw('ef31-luluc-co2-out-cf'))
      || !partClaim?.text.includes('土地利用变化甲烷赋 ' + raw('ef31-luluc-ch4-cf'))
      || !partClaim?.text.includes(raw('ef31-fossil-co2-in-dup-count') + ' 条化石 CO₂ 空气捕获资源流均置 ' + raw('ef31-fossil-co2-in-cf'))
      || !partClaim?.text.includes('全部 ' + raw('ef31-fossil-n2o-out-count') + ' 个大气子区室的 nitrous oxide（因子 '
        + raw('ef31-fossil-n2o-cf') + '）悉数落在化石子指标内'))
    throw new Error('Biogenic carbon changed the displayed EF 3.1 sub-indicator partition prose');

  // 4. 0/0 vs -1/+1 conditional equivalence and cradle-to-gate mismatch (Claim 4).
  const co2PerC = ratioScaled(44n * scale, 12n * scale);
  const fossilUpstream = exactDecimal('0.5');
  const zeroZeroGate = fossilUpstream + mulScaled(co2PerC, fact('ef31-bio-co2-in-cf'));
  const minusPlusGate = fossilUpstream + mulScaled(co2PerC, fact('ef31-luluc-co2-in-cf'));
  const minusPlusGrave = minusPlusGate + mulScaled(co2PerC, fact('ef31-luluc-co2-out-cf'));
  const mixedZeroToPlus = zeroZeroGate + mulScaled(co2PerC, fact('ef31-luluc-co2-out-cf'));
  if (zeroZeroGate !== fossilUpstream
      || minusPlusGrave !== fossilUpstream
      || displayedDecimal(co2PerC, 2) !== '3.67'
      || displayedDecimal(minusPlusGate, 2) !== '-3.17'
      || displayedDecimal(mixedZeroToPlus, 2) !== '4.17')
    throw new Error('Biogenic carbon lost 0/0 vs -1/+1 stoichiometric balance');

  const zeroClaim = uniqueRecord(catalog.claims, 'cl-bio127-zero-zero-vs-minus-plus-one');
  if (!zeroClaim?.text.includes('折合 11/3 ≈ ' + displayedDecimal(co2PerC, 2) + ' kg 生物源 CO₂')
      || !zeroClaim?.text.includes('−1/+1 下却报 −' + displayedDecimal(-minusPlusGate, 2) + ' kg CO₂ 当量')
      || !zeroClaim?.text.includes('重复计出 +' + displayedDecimal(mixedZeroToPlus, 2) + ' kg CO₂ 当量'))
    throw new Error('Biogenic carbon changed the displayed 0/0 vs -1/+1 accounting prose');

  // 5. EF 3.0 -> EF 3.1 methane oxidation update and CO CF deletion (Claim 5).
  const stoichCh4Ox = ratioScaled(44n * scale, 16n * scale);
  const stoichCoOx = ratioScaled(44n * scale, 28n * scale);
  const globalCoEf30 = mulScaled(fact('ef31-nf-co-fossil-mass'), fact('jrc109369-co-fossil-cf'));
  const globalCoPerCapEf30 = ratioScaled(globalCoEf30, fact('ef31-nf-global-pop'));
  const coBoilerEf30 = mulScaled(20n * scale, fact('jrc109369-co-fossil-cf'));
  const coBoilerEf31 = mulScaled(20n * scale, fact('ef31-cc-co-factors'));
  if (stoichCh4Ox !== fact('pefcr63-ch4-stoich-add')
      || fact('pefcr63-ch4-base-ar5') + fact('pefcr63-ch4-boucher-add') !== fact('rivm-ch4-fossil-h')
      || fact('pefcr63-ch4-base-ar5') + stoichCh4Ox !== fact('pefcr63-ch4-fossil-luluc-cf')
      || fact('pefcr63-ch4-fossil-luluc-cf') !== fact('jrc109369-ch4-fossil-cf')
      || displayedDecimal(fact('jrc109369-ch4-fossil-cf'), 1) !== raw('jrc130796-ef30-ch4-printed')
      || displayedDecimal(stoichCoOx, 2) !== raw('pefcr63-co-fossil-luluc-cf')
      || fact('pefcr63-co-fossil-luluc-cf') !== fact('jrc109369-co-fossil-cf')
      || fact('pefcr63-co-biogenic-cf') !== 0n
      || fact('jrc130796-ef31-ch4-fossil') !== fact('ef31-fossil-ch4-cf')
      || fact('jrc130796-ef31-ch4-biogenic') !== fact('ef31-bio-ch4-cf')
      || fact('ef31-cc-co-factors') !== 0n
      || fact('jrc130796-removed-ar5-substances') !== 32n * scale
      || fact('jrc130796-added-ar6-substances') !== 43n * scale
      || fact('jrc130796-unmapped-ar6-substances') !== 23n * scale
      || fact('jrc130796-nf-ef30') !== 8100n * scale
      || fact('jrc130796-nf-ef31') !== 7550n * scale
      || fact('jrc130796-nf-rel-diff-pct') !== exactDecimal('-6.7')
      || fact('jrc130796-ef-datasets-tested') !== 2752n * scale
      || fact('jrc130796-cc-mean-diff-pct') !== exactDecimal('-2.9')
      || fact('jrc130796-cc-increasing-share-pct') !== 6n * scale
      || fact('jrc130796-wood-incin-es-pct') !== -58n * scale
      || fact('jrc130796-pur-incin-dk-pct') !== 302n * scale
      || displayedDecimal(globalCoPerCapEf30, 1) !== '141.5'
      || !(coBoilerEf30 > 25n * scale && coBoilerEf31 < 25n * scale))
    throw new Error('Biogenic carbon lost EF 3.0 -> EF 3.1 CO removal or methane shift invariants');

  const coClaim = uniqueRecord(catalog.claims, 'cl-bio127-co-removal-and-methane-shift');
  if (!coClaim?.text.includes('44/16＝' + raw('pefcr63-ch4-stoich-add') + ' 设为 ' + raw('pefcr63-ch4-fossil-luluc-cf')
        + '（JRC130796 表 3 四舍五入印作 ' + raw('jrc130796-ef30-ch4-printed') + '）')
      || !coClaim?.text.includes('44/28≈' + raw('pefcr63-co-fossil-luluc-cf') + ' kg CO₂ 当量/kg')
      || !coClaim?.text.includes(raw('jrc130796-ef31-ch4-fossil') + '、' + raw('jrc130796-ef31-ch4-biogenic')
        + '（XML 记作 ' + raw('ef31-bio-ch4-cf') + '）与 ' + raw('ef31-fossil-n2o-cf'))
      || !coClaim?.text.includes('删除 ' + raw('jrc130796-removed-ar5-substances') + ' 种旧 AR5 物质并新增约 '
        + raw('jrc130796-added-ar6-substances') + ' 种 AR6 物质（其中 '
        + raw('jrc130796-unmapped-ar6-substances') + ' 种因缺少对应基本流尚未映射）')
      || !coClaim?.text.includes(mantissaExp(fact('ef31-nf-co-fossil-mass'), 11, 3) + '×10¹¹ kg，在 EF 3.0 下折合 '
        + mantissaExp(globalCoEf30, 11, 2) + '×10¹¹ kg CO₂ 当量')
      || !coClaim?.text.includes('人均约 ' + displayedDecimal(globalCoPerCapEf30, 1) + ' kg CO₂ 当量')
      || !coClaim?.text.includes('（下降 ' + displayedDecimal(-fact('jrc130796-nf-rel-diff-pct'), 1) + '%）')
      || !coClaim?.text.includes('全部 ' + raw('jrc130796-ef-datasets-tested') + ' 个官方 EF 数据集中，气候得分平均下降 '
        + displayedDecimal(-fact('jrc130796-cc-mean-diff-pct'), 1) + '%（仅 '
        + raw('jrc130796-cc-increasing-share-pct') + '% 的数据集上升')
      || !coClaim?.text.includes('西班牙加工废木焚烧下降 ' + displayedDecimal(-fact('jrc130796-wood-incin-es-pct'), 0)
        + '% 到丹麦聚氨酯废料焚烧上升 ' + raw('jrc130796-pur-incin-dk-pct') + '%')
      || !coClaim?.text.includes('由 ' + displayedDecimal(coBoilerEf30, 1) + ' 降至 ' + raw('ef31-cc-co-factors') + ' kg CO₂ 当量'))
    throw new Error('Biogenic carbon changed the displayed CO removal and methane shift prose');

  // 6. Forensic package & report discrepancies (Claim 6).
  const bioCh4Mass = fact('ef31-nf-ch4-bio-mass');
  const fgdCh4Bio = fact('ef31-nf-ch4-bio-cf-fgd');
  const pubCh4Bio = fact('ar6-pub-ch4-nonfossil-gwp100');
  const bioCh4Total = mulScaled(bioCh4Mass, fgdCh4Bio);
  const bioCh4Excess = mulScaled(bioCh4Mass, fgdCh4Bio - pubCh4Bio);
  const bioCh4ExcessPerCap = ratioScaled(bioCh4Excess, fact('ef31-nf-global-pop'));
  const halon1301 = fact('ef31-xml-halon1301-cf');
  const halon2402 = fact('ef31-xml-halon2402-cf');
  const halonGeoScaled = bigintSqrt(mulScaled(halon1301, halon2402) * scale);
  const converterByteDiff = fact('ef31-cc-converter-bytes') - fact('ef31-cc-total-bytes');
  if (fact('ar6-fgd-ch4-nonfossil-gwp20') !== exactDecimal('80.8')
      || fgdCh4Bio !== fact('ar6-fgd-ch4-nonfossil-gwp100')
      || pubCh4Bio !== fact('ef31-bio-ch4-cf')
      || displayedDecimal(bioCh4Total, 2) !== raw('ef31-nf-ch4-bio-total')
      || mantissaExp(bioCh4Excess, 10, 2) !== '2.61'
      || displayedDecimal(bioCh4ExcessPerCap, 2) !== '3.79'
      || fact('ef31-xml-cfc11-cf') - fact('ef31-nf-cfc11-cf') !== 4n * scale
      || fact('ef31-xml-hfc134a-cf') - fact('ef31-nf-hfc134a-cf') !== 4n * scale
      || halon1301 !== 7200n * scale
      || halon2402 !== 2170n * scale
      || displayedDecimal(halonGeoScaled, 12) !== displayedDecimal(fact('ef31-nf-halons-geomean-cf'), 12)
      || fact('addendum-updated-categories') !== 6n * scale
      || fact('addendum-compliance-systems') !== 6n * scale
      || fact('ef31-nf-xlsx-bytes') !== 462081n * scale
      || fact('ef31-cc-fossil-bytes') !== 579621n * scale
      || fact('ef31-cc-biogenic-bytes') !== 13362n * scale
      || fact('ef31-cc-luluc-bytes') !== 12917n * scale
      || converterByteDiff !== 20n * scale
      || fact('ef31-cc-declared-inventory-items') !== 217n * scale
      || fact('ilcd-n2o-500yr-claimed-factor') !== 2n * scale)
    throw new Error('Biogenic carbon lost EF 3.1 workbook FGD discrepancy, converter byte diff or report errata invariants');

  const pkgClaim = uniqueRecord(catalog.claims, 'cl-bio127-package-and-report-discrepancies');
  if (!pkgClaim?.text.includes('填作 ' + raw('ef31-nf-ch4-bio-cf-fgd'))
      || !pkgClaim?.text.includes('“' + raw('ar6-fgd-ch4-nonfossil-gwp20') + ', ' + raw('ar6-fgd-ch4-nonfossil-gwp100') + ', 7.3”替换为“79.7, '
        + raw('ar6-pub-ch4-nonfossil-gwp100') + ', 7.2”')
      || !pkgClaim?.text.includes('乘全球排放量 ' + mantissaExp(bioCh4Mass, 11, 3) + '×10¹¹ kg 后比按 '
        + raw('ar6-pub-ch4-nonfossil-gwp100') + ' 计算多计入 ' + mantissaExp(bioCh4Excess, 10, 2)
        + '×10¹⁰ kg CO₂ 当量（折合人均 +' + displayedDecimal(bioCh4ExcessPerCap, 2) + ' kg CO₂ 当量/人）')
      || !pkgClaim?.text.includes('CFC-11 填作 ' + raw('ef31-nf-cfc11-cf') + '（方法 XML 为 ' + raw('ef31-xml-cfc11-cf')
        + '）、HFC-134a 填作 ' + raw('ef31-nf-hfc134a-cf') + '（XML 为 ' + raw('ef31-xml-hfc134a-cf') + '）')
      || !pkgClaim?.text.includes('几何平均合并项 ' + displayedDecimal(fact('ef31-nf-halons-geomean-cf'), 2))
      || !pkgClaim?.text.includes('气候变化等 ' + raw('addendum-updated-categories') + ' 类指标改按 IPCC 2021 更新，并将 '
        + raw('addendum-compliance-systems') + ' 项数据集方法合规源切换至 EU 2021/2279')
      || !pkgClaim?.text.includes('高约 ' + raw('ilcd-n2o-500yr-claimed-factor') + ' 倍（factor 2）')
      || !pkgClaim?.text.includes('印成“1,2684.1”'))
    throw new Error('Biogenic carbon changed the displayed package and report discrepancies prose');

  // 7. Carbon storage credit abolition & PAS 2050 20-year dLUC window vs dynamic convolution (Claim 7).
  if (fact('pefcr63-biogenic-100yr-cf') !== -scale
      || fact('jrc109369-biogenic-100yr-cf') !== -scale
      || fact('pefcr63-storage-horizon') !== 100n * scale
      || fact('ef31-cc-biogenic-100yr-factors') !== 0n
      || fact('ec2021-storage-credit-allowed') !== 0n
      || fact('ec2021-dluc-amortization-years') !== 20n * scale
      || fact('ec2021-dluc-import-cutoff-pct') !== 90n * scale)
    throw new Error('Biogenic carbon lost storage credit abolition or 20-year dLUC window invariants');

  const storClaim = uniqueRecord(catalog.claims, 'cl-bio127-storage-abolition-and-dluc-window');
  if (!storClaim?.text.includes('合计封存时间超过 ' + raw('pefcr63-storage-horizon') + ' 年')
      || !storClaim?.text.includes('相关条目数为 ' + raw('ef31-cc-biogenic-100yr-factors') + '）')
      || !storClaim?.text.includes('抵扣上限为 ' + raw('ec2021-storage-credit-allowed'))
      || !storClaim?.text.includes('评估前 ' + raw('ec2021-dluc-amortization-years') + ' 年')
      || !storClaim?.text.includes('不低于 ' + raw('ec2021-dluc-import-cutoff-pct') + '% 的来源国加权'))
    throw new Error('Biogenic carbon changed the displayed storage abolition and dLUC window prose');

  // 8. Five-step operational climate diagnostic synthesis (Claim 8).
  const synthClaim = uniqueRecord(catalog.claims, 'cl-bio127-climate-diagnostic-synthesis');
  if (!synthClaim?.text.includes('占综合加权 ' + displayedDecimal(wfPct, 2) + '%')
      || !synthClaim?.text.includes(raw('ef31-cc-fossil-factors') + '（化石）＋'
        + raw('ef31-cc-biogenic-factors') + '（生物源）＋' + raw('ef31-cc-luluc-factors')
        + '（土地利用）＝' + raw('ef31-cc-total-factors') + ' 条互不重叠流表中')
      || !synthClaim?.text.includes('−44/12（约 −' + displayedDecimal(co2PerC, 2) + '）kg CO₂ 当量的虚假负碳')
      || !synthClaim?.text.includes('PAS 2050 的 ' + raw('ec2021-dluc-amortization-years') + ' 年历史直接土地转换均摊窗口')
      || !synthClaim?.text.includes('终审草稿生物源甲烷值 ' + raw('ef31-nf-ch4-bio-cf-fgd')))
    throw new Error('Biogenic carbon changed the displayed five-step diagnostic synthesis prose');

  if (consumed.size !== facts.size) {
    const unused = [...facts.keys()].filter(k => !consumed.has(k));
    throw new Error(`Biogenic carbon left unverified numeric facts: ${unused.join(', ')}`);
  }
}

const requiredLinks = {
  'midpoint-endpoint-genealogy': [
    ['ev-bio127-ilcd2011-climate', 'supports'],
    ['ev-bio127-ec2021-climate-rules', 'supports'],
    ['ev-bio127-ef31-nf-workbook', 'supports'],
    ['ev-bio127-rivm-ch2-endpoints', 'supports'],
    ['ev-bio127-recipe2017-climate', 'supports'],
    ['ev-bio127-lcimpact2020-climate', 'supports'],
  ],
  'feedback-perspective-asymmetry': [
    ['ev-bio127-rivm-ch2-midpoints', 'supports'],
    ['ev-bio127-rivm-ch2-endpoints', 'supports'],
  ],
  'ef31-subindicator-partition': [
    ['ev-bio127-ec2021-climate-rules', 'supports'],
    ['ev-bio127-ef31-climate-xmls', 'supports'],
    ['ev-bio127-ef31-nf-workbook', 'supports'],
  ],
  'zero-zero-vs-minus-plus-one': [
    ['ev-bio127-ec2021-climate-rules', 'supports'],
    ['ev-bio127-ef31-climate-xmls', 'supports'],
  ],
  'co-removal-and-methane-shift': [
    ['ev-bio127-pefcr-v63-climate', 'supports'],
    ['ev-bio127-jrc109369-climate', 'supports'],
    ['ev-bio127-jrc130796-climate', 'supports'],
    ['ev-bio127-ef31-climate-xmls', 'supports'],
    ['ev-bio127-ef31-nf-workbook', 'supports'],
  ],
  'package-and-report-discrepancies': [
    ['ev-bio127-ef31-climate-xmls', 'supports'],
    ['ev-bio127-ef31-addendum-climate', 'supports'],
    ['ev-bio127-ef31-nf-workbook', 'supports'],
    ['ev-bio127-ar6-errata-fgd-p25', 'supports'],
    ['ev-bio127-ec2021-climate-rules', 'supports'],
    ['ev-bio127-ilcd2011-climate', 'supports'],
    ['ev-bio127-rivm-ch2-midpoints', 'supports'],
    ['ev-bio127-rivm-ch2-endpoints', 'supports'],
  ],
  'storage-abolition-and-dluc-window': [
    ['ev-bio127-pefcr-v63-climate', 'supports'],
    ['ev-bio127-jrc109369-climate', 'supports'],
    ['ev-bio127-ec2021-climate-rules', 'supports'],
    ['ev-bio127-ef31-climate-xmls', 'supports'],
  ],
  'climate-diagnostic-synthesis': [
    ['ev-bio127-ec2021-climate-rules', 'supports'],
    ['ev-bio127-ef31-climate-xmls', 'supports'],
    ['ev-bio127-ef31-nf-workbook', 'supports'],
    ['ev-bio127-jrc130796-climate', 'supports'],
    ['ev-bio127-rivm-ch2-midpoints', 'supports'],
    ['ev-bio127-lcimpact2020-climate', 'supports'],
  ],
};

function validateSupportLinks(catalog) {
  const claimEntries = Object.entries(requiredLinks);
  if (catalog.claims.filter(row => row.id.startsWith('cl-bio127-')).length !== claimEntries.length)
    throw new Error('Biogenic carbon claim count differs from its pinned claim inventory');
  for (const [claimName, expectedLinks] of claimEntries) {
    const id = 'cl-bio127-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.status !== 'reviewed' || !sameScienceValue(claim?.conceptIds, []) || !sameScienceValue(claim?.mappingIds, []))
      throw new Error(`Biogenic carbon claim lacks reviewed status or bounded conceptIds/mappingIds: ${id}`);
    if (claim?.evidenceIds?.length !== expectedLinks.length || claim?.evidenceLinks?.length !== expectedLinks.length)
      throw new Error(`Biogenic carbon changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of expectedLinks) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation
          || !scienceText(links[0].rationale))
        throw new Error(`Biogenic carbon lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
