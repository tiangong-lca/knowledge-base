import { editionDigest } from './reader-current-edition.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const efUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF3_1/EF-v3.1.zip';
const lcReportUrl = 'https://www.lc-impact.eu/doc/LC-IMPACT_Overall_report_20201113.pdf';
const cohenUrl = 'https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5439030/fullTextXML';
const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

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
  ef31: {
    sourceId: 'src-particulate131-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozone119-ef-method-pm',
      mediaType: 'application/xml',
      sha256: 'bbde0609351a78fe774c39d3c2a90b8cc463cf3f57d62ffbd4c4f9cb6cb5b721',
      resolvedUrl: efUrl,
    },
  },
  cohen2017: {
    sourceId: 'src-particulate131-cohen2017',
    readingId: 'rd-particulate131-cohen2017',
    artifact: {
      id: 'art-particulate131-cohen2017-jats-xml',
      mediaType: 'application/xml',
      sha256: '6ddb8ecf17421c016f6234fca0e4517eddabfb65e41e0d725333fff2f6182ea6',
      resolvedUrl: cohenUrl,
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
  lcimpactCh6: {
    sourceId: 'src-kb46-lcimpact2020',
    readingId: 'rd-kb46-lcimpact2020',
    artifact: {
      id: 'art-kb46-lcimpact2020-report-pdf',
      mediaType: 'application/pdf',
      sha256: '6e3e3cb7f2e93dd9e8a770fd11a960d0273e91f82611c536a6268db6a1f04ea4',
      resolvedUrl: lcReportUrl,
      pageCount: 184,
    },
  },
};

const efSelectedMembers = [
  ['art-ozone119-ef-method-pm', 'application/xml', 'bbde0609351a78fe774c39d3c2a90b8cc463cf3f57d62ffbd4c4f9cb6cb5b721'],
  ['art-tox123-ef-unit-items', 'application/xml', 'b4bdadaac2fdb6ee78d96319c34ee7622a76733787b74115acdba5ade9332124'],
  ['art-bio127-ef-nf-wf-xlsx', xlsxMime, '8a5ceda370b2c312d085032fb9c154ce56f45e46c4d1dbba4e56cd9aedaab554'],
  ['art-particulate131-ef-source-fantke2016', 'application/xml', '075b2c4657e859d932884472c08ddef018911512e5222737e25472714f038de3'],
  ['art-particulate131-ef-flowprop-items', 'application/xml', '40d536c2f7f2468b49526509e7207ec48a2f9f3894eb2496c0c536493c963614'],
  ['art-particulate131-ef-flow-pm25-unspec', 'application/xml', '3bee91f9deabbba77ce3701703f497c63f683e4b040e30363ca46dccb130d2c3'],
  ['art-particulate131-ef-flow-pm25-urban-ground', 'application/xml', 'f141e8610fc010a72a1d7322c790d27d73e7dd35fac7f66bf66c4e8ae537cce9'],
  ['art-particulate131-ef-flow-pm25-nonurban-ground', 'application/xml', '6172d8611fa4ee2f855e391773eec4ee8d38252ee13814648244902cad128ea1'],
  ['art-particulate131-ef-flow-pm25-nonurban-high', 'application/xml', 'f0158cee867c6be47af3b45d0b04e0844d080be2bf13ab9fa3b4f9356b87e1dd'],
  ['art-particulate131-ef-flow-pm25-nonurban-veryhigh', 'application/xml', '593189a8f46adb27588847e49fd66d239ec4c850bc06d8fc26a16f0ad201cd97'],
  ['art-particulate131-ef-flow-pm10-unspec', 'application/xml', '524486a47f7e7252b35fc308a9da57d198d81b1b94eb27e7e2188404a9a71721'],
  ['art-particulate131-ef-flow-pm10-nonurban-ground', 'application/xml', 'ad5c6d966cb4d77d890373406c21a4a5c0bab8fdc587d11f01f3ed647f3282c3'],
  ['art-particulate131-ef-flow-pm02-unspec', 'application/xml', '93fac7b6d8398f6ee25ff31ef2e3e4453d1d1a004d3d57ba03082f14a38da61d'],
  ['art-particulate131-ef-flow-pm02-25-unspec', 'application/xml', 'd909eade98cce64613480c05533000a62376c19fd7353baea7a71653d9f2880b'],
  ['art-particulate131-ef-flow-pm25-10-nonurban-ground', 'application/xml', 'd963da74512bb5eaa45d995adaff81c02e49e98fe1f5cd17ebd80b3144cebd3d'],
  ['art-particulate131-ef-flow-pm25-10-nonurban-high', 'application/xml', '5701e43dea884a3de8d37436f535dce2f314d1cf0ff6862ccb18067c75455fc5'],
  ['art-particulate131-ef-flow-pm-gt10-urban-low', 'application/xml', '73c77863b6e5ef361b117ccf7f646ced2c190bcc75ae729339bc4b69fe3b616e'],
];

const evidenceRows = [
  ['ilcd2011-pm', 'ilcd', 'psg-particulate131-ilcd2011-pm', null,
    '00245a9517cfad49328eaa47b4819eb4f80c1e877164d7c1ad7741674fc9f9f1'],
  ['ec2021-pm', 'ec2021', 'psg-particulate131-ec2021-pm', null,
    '70ed0e15f5d459aa730cb8c04cba4e75ed0e4fa78a69fd56764b6558624d3f55'],
  ['jrc109369-pm', 'jrc109369', 'psg-particulate131-jrc109369-pm', null,
    '1dade526fac220feee5321e5541651f9952cd51e08a725dac14a1a88d5b27642'],
  ['jrc130796-pm', 'jrc130796', 'psg-particulate131-jrc130796-pm', null,
    '3cbd1be7b3f4dac140d4b1e284a3d88e29a9fbe4e0e0cc82895447e4a7cfbc57'],
  ['ef31-pm-xml', 'ef31', 'psg-particulate131-ef31-pm-xml', 'art-ozone119-ef-method-pm',
    '7a82753053c3622b750cd554fd625997a3e5c3dad81200da753c4b3dc1532446'],
  ['ef31-nf-pm', 'ef31', 'psg-particulate131-ef31-nf-pm', 'art-bio127-ef-nf-wf-xlsx',
    '0f42d1644057a7e3c06a3536d53f801b8053d5b79b4853da3d4d24b58aa0705a'],
  ['cohen-gbd2015-burden', 'cohen2017', 'psg-particulate131-cohen-gbd2015-burden', null,
    '9e10bb6195f6f45025d919fdb27879e9b8cfed01c75c1a868c3d5e131036306d'],
  ['cohen-limits-and-trends', 'cohen2017', 'psg-particulate131-cohen-limits-and-trends', null,
    '8db08ad2a611a76fe5fc31cf8bad4eb0184e1ec9a58842776fe03f46b2144b1f'],
  ['rivm-ch5', 'rivm', 'psg-particulate131-rivm-ch5', null,
    '1f57b00713710e11e2c8c190b30ed4bd7b521bb4a41388b008c2fb69624aabdc'],
  ['rivm-s1-regions', 'rivm', 'psg-particulate131-rivm-s1-regions', null,
    '30daa446ea2ca32a51603bff2ece6e820a4ef815e8a234092560d00efe871552'],
  ['recipe2017-pm', 'recipe2017', 'psg-particulate131-recipe2017-pm', null,
    'e536295e93b0d6b27dd00a23db3ea695cbb3a85b8448015d192a595f699db693'],
  ['lcimpact-article-pm', 'lcimpact2020', 'psg-particulate131-lcimpact-article-pm', null,
    '5ae8b9d973dc25aa7e4e0f0c0285434b55860bd1d0cbbd394f6939026d3692a4'],
  ['lcimpact-pm-global', 'lcimpactCh6', 'psg-particulate131-lcimpact-pm-global', null,
    'bc57fa6454cd9b43b7cf3ae129da8ee1f515e99b046e4ecc80b09a4ca0b18e2b'],
];

const exactFactLiterals = Object.freeze({
  'jrc130796-pm-nf-text-reduction': '0.003',
  'jrc130796-pm-nf-table10-diff': '0.0034',
  'jrc130796-table13-pm-4th': '608',
  'jrc130796-table13-pm-5th': '608',
  'ef31-pm-total-factors': '983',
  'ef31-pm-unlocated-factors': '83',
  'ef31-pm-located-factors': '900',
  'ef31-pm-unlocated-primary-flows': '48',
  'ef31-pm-unlocated-no-so3-flows': '10',
  'ef31-pm-declared-inventory-items': '50',
  'ef31-pm-coarse-pm25-10-factors': '0',
  'ef31-pm25-unspec-cf': '0.000238497',
  'ef31-pm25-nonurban-ground-cf': '0.0000113763',
  'ef31-pm25-nonurban-high-cf': '0.00000301757',
  'ef31-pm25-nonurban-veryhigh-cf': '0.00000162949',
  'ef31-pm10-unspec-cf': '0.0000548544',
  'ef31-pm10-nonurban-ground-cf': '0.00000261654',
  'ef31-nh3-unspec-and-nonurban-cf': '0.000021',
  'ef31-nh3-urban-ground-cf': '0.000014',
  'ef31-so2-unspec-and-urban-cf': '0.000008',
  'ef31-so2-nonurban-cf': '0.00000099',
  'ef31-nox-unspec-and-urban-cf': '0.0000016',
  'ef31-nox-nonurban-and-upper-cf': '0.00000021',
  'ef31-nf-pop': '6895889018',
  'ef31-pm-nf-per-person': '0.00059536682112547822',
  'ef31-pm-nf-global-total': '4105583.52348075564164',
  'ef31-pm-wf-final': '0.0896',
  'ef31-pm-nf-nh3-incidences': '950998.92288678128',
  'ef31-pm-nf-so2-incidences': '474273.465347550213',
  'ef31-pm-nf-nox-incidences': '103325.70094282519164',
  'ef31-pm-nf-nh3-total-mass': '54798797061.184399',
  'ef31-pm-nf-nh3-urban-mass': '28539402199.727299',
  'ef31-pm-nf-upper-nox-incidences': '599.68888798225464',
  'cohen2017-tmrel-min': '2.4',
  'cohen2017-tmrel-max': '5.9',
  'cohen2017-deaths-total-k': '4241.1',
  'cohen2017-global-death-share': '7.6',
  'cohen2017-dalys-total-k': '103066.2',
  'cohen2017-yll-m': '99.2',
  'cohen2017-yld-m': '3.9',
  'cohen2017-ihd-deaths-k': '1521.1',
  'cohen2017-stroke-deaths-k': '898.1',
  'cohen2017-copd-deaths-k': '863.6',
  'cohen2017-lri-deaths-k': '675.0',
  'cohen2017-lc-deaths-k': '283.3',
  'cohen2017-u5-lri-deaths-k': '202.6',
  'cohen2017-u5-lri-dalys-k': '17431.1',
  'cohen2017-pm25-1990': '39.7',
  'cohen2017-pm25-2015': '44.2',
  'cohen2017-asdr-1990': '65.6',
  'cohen2017-asdr-2015': '57.5',
  'cohen2017-china-deaths-k': '1108.1',
  'cohen2017-india-deaths-k': '1090.4',
  'cohen2017-usa-deaths-k': '88.4',
  'rivm-pm-perturbation-pct': '20',
  'rivm-pmfp-pm25': '1',
  'rivm-pmfp-so2-he': '0.29',
  'rivm-pmfp-nh3-e': '0.24',
  'rivm-pmfp-nox-e': '0.11',
  'rivm-pm-mid-to-end': '0.000629',
  'rivm-s1-ch-nh3-mid': '1.70',
  'rivm-s1-ch-so2-mid': '0.27',
  'rivm-s1-in-so2-mid': '1.26',
  'rivm-s1-in-nh3-mid': '0.26',
  'rivm-s1-nz-pm25-mid': '0.02',
  'rivm-s1-nz-so2-mid': '0.15',
  'rivm-s1-nz-so2-end': '110',
  'rivm-s1-nz-pm25-end': '9.4',
  'rivm-s1-pi-so2-end': '100',
  'rivm-s1-pi-pm25-end': '11',
  'rivm-s1-kr-pm25-mid': '2.15',
  'rivm-s1-ro-pm25-mid': '1.30',
  'rivm-s1-kr-pm25-end': '700',
  'rivm-s1-ro-pm25-end': '1700',
  'rivm-s1-world-so2-end': '183.2',
  'rivm-s1-world-nh3-end': '149.2',
  'rivm-s1-world-nox-end': '70.1',
  'lcimpact-pm-rr-cp': '1.013',
  'lcimpact-pm-rr-lc': '1.014',
  'lcimpact-pm-breathing-rate-yr': '4745',
  'lcimpact-pm-world-pm25': '0.000629',
  'lcimpact-pm-world-so2': '0.000183',
  'lcimpact-pm-world-nh3': '0.000161',
  'lcimpact-pm-world-nox': '0.0000762',
});

const DECIMALS = 40;
const scale = 10n ** BigInt(DECIMALS);
const canonicalDecimalPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

export function exactDecimal(value) {
  if (typeof value !== 'string' || !canonicalDecimalPattern.test(value) || /^-0(?:\.0+)?$/.test(value))
    throw new Error(`Particulate comparison requires canonical decimal literal: ${value}`);
  const negative = value.startsWith('-');
  const clean = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = clean.split('.');
  if (fraction.length > DECIMALS)
    throw new Error(`Particulate comparison decimal exceeds ${DECIMALS} places: ${value}`);
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
  if (denominator === 0n) throw new Error('Particulate comparison zero denominator in fixed-point division');
  if (numerator === 0n) return 0n;
  const neg = (numerator < 0n) !== (denominator < 0n);
  const absNum = numerator < 0n ? -numerator : numerator;
  const absDen = denominator < 0n ? -denominator : denominator;
  const rounded = (absNum * scale + absDen / 2n) / absDen;
  return neg ? -rounded : rounded;
}

export function displayedDecimal(scaledValue, places) {
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

export function mantissaExp(scaledValue, exponent, places) {
  const shifted = exponent >= 0
    ? ratioScaled(scaledValue, 10n ** BigInt(exponent) * scale)
    : mulScaled(scaledValue, 10n ** BigInt(-exponent) * scale);
  return displayedDecimal(shifted, places);
}

const absBig = x => (x < 0n ? -x : x);

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateParticulateComparisonFactors(catalog, readings, { skipRowDigests = false } = {}) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-particulate131-')).length !== evidenceRows.length)
    throw new Error('Particulate comparison evidence count differs from its pinned row inventory');
  const allPassages = readings.readings.flatMap(row => row.passages.filter(p => p.id.startsWith('psg-particulate131-')));
  if (allPassages.length !== evidenceRows.length)
    throw new Error('Particulate comparison 1-to-1 passage count differs from its pinned evidence inventory');

  const rawShaPattern = /(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/i;
  for (const sourceId of ['src-particulate131-ef31-selected-members', 'src-particulate131-cohen2017']) {
    const src = uniqueRecord(catalog.sources, sourceId);
    for (const field of ['title', 'version', 'rights', 'preservation']) {
      if (!scienceText(src?.[field]) || rawShaPattern.test(src[field]))
        throw new Error(`Particulate comparison source contains forbidden reader-surface token: ${sourceId}.${field}`);
    }
  }

  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...expectedSourceArtifact } = expected.artifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Particulate comparison changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, mediaType, sha] of efSelectedMembers) {
    const expectedMember = { id, mediaType, sha256: sha, resolvedUrl: efUrl };
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), expectedMember))
      throw new Error(`Particulate comparison changed a verified EF 3.1 member: ${id}`);
  }

  const facts = new Map();
  const seenPassages = new Set();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-particulate131-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || seenPassages.has(passageId) || record.sourceId !== expected.sourceId
        || record.readingId !== expected.readingId || record.passageId !== passageId
        || passage.artifactId !== expectedArtifactId)
      throw new Error(`Particulate comparison changed the selected row or support passage: ${id}`);
    if (record.numericFact != null)
      throw new Error(`Particulate comparison forbids singular numericFact injection on ${id}`);
    seenPassages.add(passageId);
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
      throw new Error(`Particulate comparison changed the selected row or support passage: ${id}`);
    for (const item of record.numericFacts ?? []) {
      if (!scienceText(item.quantity) || !scienceText(item.subject) || !scienceText(item.unit) || !scienceText(item.basis))
        throw new Error(`Particulate comparison numeric fact lacks required metadata: ${item.id}`);
      if (facts.has(item.id)) throw new Error(`Particulate comparison duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }

  const expectedFactKeys = Object.keys(exactFactLiterals);
  if (facts.size !== expectedFactKeys.length)
    throw new Error(`Particulate comparison numeric fact count differs: ${facts.size} !== ${expectedFactKeys.length}`);
  for (const [key, expectedVal] of Object.entries(exactFactLiterals)) {
    if (facts.get(key) !== expectedVal)
      throw new Error(`Particulate comparison exact numeric literal drifted: ${key}`);
  }

  validateCalculations(facts, catalog);
  validateSupportLinks(catalog);
}

function validateCalculations(facts, catalog) {
  const consumed = new Set();
  const raw = key => {
    consumed.add(key);
    return facts.get(key);
  };
  const fact = key => exactDecimal(raw(key));

  // 1. Claim 1: Indicator cut-points, TM5-FASST 20% perturbation, Krewski RRs, breathing rate, EF NF/WF
  const wfPct = mulScaled(fact('ef31-pm-wf-final'), 100n * scale);
  const nfComputed = ratioScaled(fact('ef31-pm-nf-global-total'), fact('ef31-nf-pop'));
  if (absBig(nfComputed - fact('ef31-pm-nf-per-person')) > exactDecimal('0.00000000000000001')
      || fact('rivm-pm-mid-to-end') !== fact('lcimpact-pm-world-pm25')
      || fact('lcimpact-pm-breathing-rate-yr') !== mulScaled(exactDecimal('13'), exactDecimal('365'))
      || fact('rivm-pm-perturbation-pct') !== 20n * scale)
    throw new Error('Particulate comparison Claim 1 cut-point or NF/WF invariant drifted');

  const cutClaim = uniqueRecord(catalog.claims, 'cl-particulate131-indicator-cutpoints');
  if (!cutClaim?.text.includes('施加' + raw('rivm-pm-perturbation-pct') + '%扰动')
      || !cutClaim?.text.includes('心肺相对风险' + raw('lcimpact-pm-rr-cp') + '、肺癌' + raw('lcimpact-pm-rr-lc') + '每µg/m³，年呼吸量' + raw('lcimpact-pm-breathing-rate-yr') + ' m³')
      || !cutClaim?.text.includes('恒定的' + mantissaExp(fact('rivm-pm-mid-to-end'), -4, 2) + '×10⁻⁴ DALY/kg PM₂.₅当量（总表四舍五入印' + mantissaExp(fact('rivm-pm-mid-to-end'), -4, 1) + '×10⁻⁴）')
      || !cutClaim?.text.includes('初级PM₂.₅ ' + mantissaExp(fact('lcimpact-pm-world-pm25'), -4, 2) + '×10⁻⁴ DALY/kg')
      || !cutClaim?.text.includes('全球人均归一化基准约' + mantissaExp(fact('ef31-pm-nf-per-person'), -4, 2) + '×10⁻⁴例/人，单一综合得分权重' + displayedDecimal(wfPct, 2) + '%')
      || !cutClaim?.caveats?.[0]?.includes(mantissaExp(fact('ef31-pm-nf-per-person'), -4, 16) + '×10⁻⁴例/人'))
    throw new Error('Particulate comparison changed displayed numeric bindings in cl-particulate131-indicator-cutpoints');

  // 2. Claim 2: EF 3.1 size-fraction 0.23 proxy, coarse zero, and unspecified-air 146.36x amplification
  if (fact('ef31-pm-unlocated-factors') + fact('ef31-pm-located-factors') !== fact('ef31-pm-total-factors')
      || fact('ef31-pm-coarse-pm25-10-factors') !== 0n)
    throw new Error('Particulate comparison Claim 2 factor count or coarse zero mismatch');
  const pm10RatioUnspec = ratioScaled(fact('ef31-pm10-unspec-cf'), fact('ef31-pm25-unspec-cf'));
  const pm10RatioRural = ratioScaled(fact('ef31-pm10-nonurban-ground-cf'), fact('ef31-pm25-nonurban-ground-cf'));
  const unspecOverRuralGround = ratioScaled(fact('ef31-pm25-unspec-cf'), fact('ef31-pm25-nonurban-ground-cf'));
  const unspecOverRuralHigh = ratioScaled(fact('ef31-pm25-unspec-cf'), fact('ef31-pm25-nonurban-high-cf'));
  const unspecOverRuralVeryHigh = ratioScaled(fact('ef31-pm25-unspec-cf'), fact('ef31-pm25-nonurban-veryhigh-cf'));
  if (displayedDecimal(pm10RatioUnspec, 2) !== '0.23' || displayedDecimal(pm10RatioRural, 2) !== '0.23'
      || displayedDecimal(unspecOverRuralGround, 2) !== '20.96'
      || displayedDecimal(unspecOverRuralHigh, 2) !== '79.04'
      || displayedDecimal(unspecOverRuralVeryHigh, 2) !== '146.36')
    throw new Error('Particulate comparison Claim 2 size-fraction or stack-height ratios drifted');

  const sizeClaim = uniqueRecord(catalog.claims, 'cl-particulate131-size-and-subcompartment');
  if (!sizeClaim?.text.includes('共' + raw('ef31-pm-total-factors') + '条因子')
      || !sizeClaim?.text.includes('按同子区室PM₂.₅因子的' + displayedDecimal(pm10RatioUnspec, 2) + '倍折算')
      || !sizeClaim?.text.includes(mantissaExp(fact('ef31-pm10-unspec-cf'), -5, 5) + '×10⁻⁵对' + mantissaExp(fact('ef31-pm25-unspec-cf'), -4, 5) + '×10⁻⁴')
      || !sizeClaim?.text.includes(mantissaExp(fact('ef31-pm10-nonurban-ground-cf'), -6, 5) + '×10⁻⁶对' + mantissaExp(fact('ef31-pm25-nonurban-ground-cf'), -5, 5) + '×10⁻⁵')
      || !sizeClaim?.text.includes('总PM₁₀质量的23%再多算一笔细颗粒物效应')
      || !sizeClaim?.text.includes('非城市近地面（' + mantissaExp(fact('ef31-pm25-nonurban-ground-cf'), -5, 5) + '×10⁻⁵）的' + displayedDecimal(unspecOverRuralGround, 2) + '倍')
      || !sizeClaim?.text.includes('非城市高烟囱（' + mantissaExp(fact('ef31-pm25-nonurban-high-cf'), -6, 5) + '×10⁻⁶）的' + displayedDecimal(unspecOverRuralHigh, 2) + '倍')
      || !sizeClaim?.text.includes('非城市超高烟囱（' + mantissaExp(fact('ef31-pm25-nonurban-veryhigh-cf'), -6, 5) + '×10⁻⁶）的' + displayedDecimal(unspecOverRuralVeryHigh, 2) + '倍'))
    throw new Error('Particulate comparison changed displayed numeric bindings in cl-particulate131-size-and-subcompartment');

  // 3. Claim 3 & Claim 4: Cohen et al. 2017 GBD 2015 5-cause sum, <5 yr LRI share, YLL share & ageing reversal
  const fiveCauseSum = fact('cohen2017-ihd-deaths-k') + fact('cohen2017-stroke-deaths-k')
    + fact('cohen2017-copd-deaths-k') + fact('cohen2017-lri-deaths-k') + fact('cohen2017-lc-deaths-k');
  const yllSharePct = mulScaled(ratioScaled(mulScaled(fact('cohen2017-yll-m'), 1000n * scale), fact('cohen2017-dalys-total-k')), 100n * scale);
  const u5DalySharePct = mulScaled(ratioScaled(fact('cohen2017-u5-lri-dalys-k'), fact('cohen2017-dalys-total-k')), 100n * scale);
  if (fiveCauseSum !== fact('cohen2017-deaths-total-k')
      || displayedDecimal(yllSharePct, 1) !== '96.2'
      || displayedDecimal(u5DalySharePct, 1) !== '16.9'
      || !(fact('cohen2017-pm25-2015') > fact('cohen2017-pm25-1990') && fact('cohen2017-asdr-2015') < fact('cohen2017-asdr-1990')))
    throw new Error('Particulate comparison Claim 3 Cohen 2017 sum, YLL share or <5 yr LRI share drifted');

  const toWan = kFact => displayedDecimal(ratioScaled(fact(kFact), 10n * scale), 2);
  const yllWan = displayedDecimal(mulScaled(fact('cohen2017-yll-m'), 100n * scale), 0);
  const yldWan = displayedDecimal(mulScaled(fact('cohen2017-yld-m'), 100n * scale), 0);
  const dalyYi = displayedDecimal(ratioScaled(fact('cohen2017-dalys-total-k'), 100000n * scale), 4);
  const cohenClaim = uniqueRecord(catalog.claims, 'cl-particulate131-cohen-gbd2015-scope');
  if (!cohenClaim?.text.includes('取' + raw('cohen2017-tmrel-min') + '至' + raw('cohen2017-tmrel-max') + ' µg/m³均匀分布')
      || !cohenClaim?.text.includes('归因过早死亡' + toWan('cohen2017-deaths-total-k') + '万例（占全球总死亡' + raw('cohen2017-global-death-share') + '%）')
      || !cohenClaim?.text.includes('归因约' + dalyYi + '亿DALY（原表记' + toWan('cohen2017-dalys-total-k') + '万DALY；其中早死寿命损失年即YLL为' + yllWan + '万，占' + displayedDecimal(yllSharePct, 1) + '%，伤残寿命损失年即YLD仅' + yldWan + '万）')
      || !cohenClaim?.text.includes('缺血性心脏病（' + toWan('cohen2017-ihd-deaths-k') + '万例死亡）与脑血管病（卒中，' + toWan('cohen2017-stroke-deaths-k') + '万例死亡）')
      || !cohenClaim?.text.includes('慢性阻塞性肺疾病（' + toWan('cohen2017-copd-deaths-k') + '万例死亡）与肺癌（' + toWan('cohen2017-lc-deaths-k') + '万例死亡）')
      || !cohenClaim?.text.includes('下呼吸道感染（' + toWan('cohen2017-lri-deaths-k') + '万例死亡）')
      || !cohenClaim?.text.includes('达' + toWan('cohen2017-u5-lri-deaths-k') + '万例死亡与' + toWan('cohen2017-u5-lri-dalys-k') + '万DALY，相当于全球环境PM₂.₅全部归因DALY的' + displayedDecimal(u5DalySharePct, 1) + '%')
      || !cohenClaim?.text.includes('由' + raw('cohen2017-pm25-1990') + '升至' + raw('cohen2017-pm25-2015') + ' µg/m³')
      || !cohenClaim?.text.includes('由' + raw('cohen2017-asdr-1990') + '/10万降至' + raw('cohen2017-asdr-2015') + '/10万')
      || !cohenClaim?.text.includes('中国58.4 µg/m³对应' + toWan('cohen2017-china-deaths-k') + '万例死亡、印度74.3 µg/m³对应' + toWan('cohen2017-india-deaths-k') + '万例死亡、美国8.4 µg/m³对应' + toWan('cohen2017-usa-deaths-k') + '万例死亡'))
    throw new Error('Particulate comparison changed displayed numeric bindings in cl-particulate131-cohen-gbd2015-scope');

  const limitsClaim = uniqueRecord(catalog.claims, 'cl-particulate131-cohen-empirical-limits');
  if (/[\^_{}]/.test(limitsClaim?.text ?? '') || !limitsClaim?.text.includes('2018年GEMM') || !limitsClaim?.text.includes('2型糖尿病'))
    throw new Error('Particulate comparison leaked raw formula syntax or lost clinical caveats in cl-particulate131-cohen-empirical-limits');

  // 4. Claim 5: ReCiPe I/H/E vs LC-IMPACT certain/all precursor switches
  if (fact('rivm-pmfp-pm25') !== scale
      || !(fact('rivm-pmfp-so2-he') > fact('rivm-pmfp-nh3-e') && fact('rivm-pmfp-nh3-e') > fact('rivm-pmfp-nox-e'))
      || !(fact('lcimpact-pm-world-so2') > fact('lcimpact-pm-world-nh3') && fact('lcimpact-pm-world-nh3') > fact('lcimpact-pm-world-nox')))
    throw new Error('Particulate comparison Claim 5 precursor ordering drifted');

  const perspClaim = uniqueRecord(catalog.claims, 'cl-particulate131-precursor-perspectives');
  if (!perspClaim?.text.includes('只计初级PM₂.₅（因子为' + raw('rivm-pmfp-pm25') + '）')
      || !perspClaim?.text.includes('全球中点因子' + raw('rivm-pmfp-so2-he') + ' kg PM₂.₅当量/kg')
      || !perspClaim?.text.includes('SO₂（' + raw('rivm-pmfp-so2-he') + '）高于NH₃（' + raw('rivm-pmfp-nh3-e') + '）再高于NOₓ（' + raw('rivm-pmfp-nox-e') + '）')
      || !perspClaim?.text.includes('全球加权均值' + mantissaExp(fact('lcimpact-pm-world-pm25'), -4, 2) + '×10⁻⁴ DALY/kg')
      || !perspClaim?.text.includes('SO₂（' + mantissaExp(fact('lcimpact-pm-world-so2'), -4, 2) + '×10⁻⁴）高于NH₃（' + mantissaExp(fact('lcimpact-pm-world-nh3'), -4, 2) + '×10⁻⁴）再高于NOₓ（' + mantissaExp(fact('lcimpact-pm-world-nox'), -5, 2) + '×10⁻⁵ DALY/kg）'))
    throw new Error('Particulate comparison changed displayed numeric bindings in cl-particulate131-precursor-perspectives');

  // 5. Claim 6: EF 3.1 ammonia > SO2 > NOx inversion, rural reduction shares & 10.61x reversal
  const nh3OverSo2Unspec = ratioScaled(fact('ef31-nh3-unspec-and-nonurban-cf'), fact('ef31-so2-unspec-and-urban-cf'));
  const nh3OverNoxUnspec = ratioScaled(fact('ef31-nh3-unspec-and-nonurban-cf'), fact('ef31-nox-unspec-and-urban-cf'));
  const so2DropMultiple = ratioScaled(fact('ef31-so2-unspec-and-urban-cf'), fact('ef31-so2-nonurban-cf'));
  const so2DropPct = mulScaled(scale - ratioScaled(fact('ef31-so2-nonurban-cf'), fact('ef31-so2-unspec-and-urban-cf')), 100n * scale);
  const noxDropMultiple = ratioScaled(fact('ef31-nox-unspec-and-urban-cf'), fact('ef31-nox-nonurban-and-upper-cf'));
  const noxDropPct = mulScaled(scale - ratioScaled(fact('ef31-nox-nonurban-and-upper-cf'), fact('ef31-nox-unspec-and-urban-cf')), 100n * scale);
  const nh3RiseMultiple = ratioScaled(fact('ef31-nh3-unspec-and-nonurban-cf'), fact('ef31-nh3-urban-ground-cf'));
  const ruralNh3OverSo2 = ratioScaled(fact('ef31-nh3-unspec-and-nonurban-cf'), fact('ef31-so2-nonurban-cf'));
  const ruralNh3OverNox = ratioScaled(fact('ef31-nh3-unspec-and-nonurban-cf'), fact('ef31-nox-nonurban-and-upper-cf'));
  const nh3SharePct = mulScaled(ratioScaled(fact('ef31-pm-nf-nh3-incidences'), fact('ef31-pm-nf-global-total')), 100n * scale);
  const so2SharePct = mulScaled(ratioScaled(fact('ef31-pm-nf-so2-incidences'), fact('ef31-pm-nf-global-total')), 100n * scale);
  const noxSharePct = mulScaled(ratioScaled(fact('ef31-pm-nf-nox-incidences'), fact('ef31-pm-nf-global-total')), 100n * scale);
  const optBRecipe = mulScaled(2n * scale, fact('rivm-pmfp-so2-he'));
  const optBEF = mulScaled(2n * scale, fact('ef31-so2-nonurban-cf'));
  const rural1Nh3Over2So2 = ratioScaled(fact('ef31-nh3-unspec-and-nonurban-cf'), optBEF);

  if (nh3OverSo2Unspec !== exactDecimal('2.625') || nh3OverNoxUnspec !== exactDecimal('13.125')
      || nh3RiseMultiple !== exactDecimal('1.5') || ruralNh3OverNox !== 100n * scale
      || displayedDecimal(so2DropMultiple, 2) !== '8.08' || displayedDecimal(so2DropPct, 1) !== '87.6'
      || displayedDecimal(noxDropMultiple, 2) !== '7.62' || displayedDecimal(noxDropPct, 1) !== '86.9'
      || displayedDecimal(ruralNh3OverSo2, 2) !== '21.21' || displayedDecimal(rural1Nh3Over2So2, 2) !== '10.61')
    throw new Error('Particulate comparison Claim 6 ammonia/SO2/NOx ratios drifted');

  const nh3Claim = uniqueRecord(catalog.claims, 'cl-particulate131-ef-ammonia-inversion');
  if (!nh3Claim?.text.includes('NH₃因子（' + mantissaExp(fact('ef31-nh3-unspec-and-nonurban-cf'), -5, 1) + '×10⁻⁵例/kg）是SO₂（' + mantissaExp(fact('ef31-so2-unspec-and-urban-cf'), -6, 1) + '×10⁻⁶）的' + displayedDecimal(nh3OverSo2Unspec, 3) + '倍、是NOₓ（' + mantissaExp(fact('ef31-nox-unspec-and-urban-cf'), -6, 1) + '×10⁻⁶）的' + displayedDecimal(nh3OverNoxUnspec, 3) + '倍')
      || !nh3Claim?.text.includes('降至' + mantissaExp(fact('ef31-so2-nonurban-cf'), -7, 1) + '×10⁻⁷（约为城市近地面的1/' + displayedDecimal(so2DropMultiple, 2) + '，降幅' + displayedDecimal(so2DropPct, 1) + '%）')
      || !nh3Claim?.text.includes('降至' + mantissaExp(fact('ef31-nox-nonurban-and-upper-cf'), -7, 1) + '×10⁻⁷（约为城市近地面的1/' + displayedDecimal(noxDropMultiple, 2) + '，降幅' + displayedDecimal(noxDropPct, 1) + '%）')
      || !nh3Claim?.text.includes('由城市近地面的' + mantissaExp(fact('ef31-nh3-urban-ground-cf'), -5, 1) + '×10⁻⁵升至' + displayedDecimal(nh3RiseMultiple, 1) + '倍（高出50%，达' + mantissaExp(fact('ef31-nh3-unspec-and-nonurban-cf'), -5, 1) + '×10⁻⁵），达到同子区室SO₂的' + displayedDecimal(ruralNh3OverSo2, 2) + '倍、NOₓ的' + displayedDecimal(ruralNh3OverNox, 0) + '倍')
      || !nh3Claim?.text.includes('贡献了' + displayedDecimal(fact('ef31-pm-nf-nh3-incidences'), 2) + '例（占全类别的' + displayedDecimal(nh3SharePct, 2) + '%）')
      || !nh3Claim?.text.includes('二氧化硫（' + displayedDecimal(fact('ef31-pm-nf-so2-incidences'), 2) + '例，占' + displayedDecimal(so2SharePct, 2) + '%）')
      || !nh3Claim?.text.includes('氮氧化物（' + displayedDecimal(fact('ef31-pm-nf-nox-incidences'), 2) + '例，占' + displayedDecimal(noxSharePct, 2) + '%）')
      || !nh3Claim?.text.includes('乙获益' + displayedDecimal(optBRecipe, 2) + '而甲仅' + raw('rivm-pmfp-nh3-e') + ' kg PM₂.₅当量')
      || !nh3Claim?.text.includes('甲避免' + mantissaExp(fact('ef31-nh3-unspec-and-nonurban-cf'), -5, 1) + '×10⁻⁵例而乙仅避免' + mantissaExp(optBEF, -6, 2) + '×10⁻⁶例，排序反转为甲的收益高达乙的' + displayedDecimal(rural1Nh3Over2So2, 2) + '倍'))
    throw new Error('Particulate comparison changed displayed numeric bindings in cl-particulate131-ef-ammonia-inversion');

  // 6. Claim 7: Regional spatial reversals & South Korea vs Romania midpoint-to-endpoint rank reversal
  const chRatio = ratioScaled(fact('rivm-s1-ch-nh3-mid'), fact('rivm-s1-ch-so2-mid'));
  const inRatio = ratioScaled(fact('rivm-s1-in-so2-mid'), fact('rivm-s1-in-nh3-mid'));
  const nzMidRatio = ratioScaled(fact('rivm-s1-nz-so2-mid'), fact('rivm-s1-nz-pm25-mid'));
  const nzEndRatio = ratioScaled(fact('rivm-s1-nz-so2-end'), fact('rivm-s1-nz-pm25-end'));
  const piEndRatio = ratioScaled(fact('rivm-s1-pi-so2-end'), fact('rivm-s1-pi-pm25-end'));
  const krRoMid = ratioScaled(fact('rivm-s1-kr-pm25-mid'), fact('rivm-s1-ro-pm25-mid'));
  const roKrEnd = ratioScaled(fact('rivm-s1-ro-pm25-end'), fact('rivm-s1-kr-pm25-end'));

  if (displayedDecimal(chRatio, 1) !== '6.3' || displayedDecimal(inRatio, 2) !== '4.85'
      || nzMidRatio !== exactDecimal('7.5') || displayedDecimal(nzEndRatio, 1) !== '11.7'
      || displayedDecimal(piEndRatio, 1) !== '9.1'
      || displayedDecimal(krRoMid, 2) !== '1.65' || displayedDecimal(roKrEnd, 2) !== '2.43')
    throw new Error('Particulate comparison Claim 7 regional reversal ratios drifted');

  const regClaim = uniqueRecord(catalog.claims, 'cl-particulate131-regional-endpoint-reversal');
  if (!regClaim?.text.includes('瑞士NH₃为' + raw('rivm-s1-ch-nh3-mid') + '而SO₂仅' + raw('rivm-s1-ch-so2-mid'))
      || !regClaim?.text.includes('印度则反转为SO₂（' + raw('rivm-s1-in-so2-mid') + '）高于NH₃（' + raw('rivm-s1-in-nh3-mid') + '）达' + displayedDecimal(inRatio, 2) + '倍')
      || !regClaim?.text.includes('气态SO₂的中点因子（均为' + raw('rivm-s1-nz-so2-mid') + '）达到本地排放1千克易沉降初级PM₂.₅（均为' + raw('rivm-s1-nz-pm25-mid') + '）的' + displayedDecimal(nzMidRatio, 1) + '倍')
      || !regClaim?.text.includes('新西兰SO₂（' + mantissaExp(fact('rivm-s1-nz-so2-end'), 2, 1) + '×10²）更达初级PM₂.₅（' + raw('rivm-s1-nz-pm25-end') + '）的' + displayedDecimal(nzEndRatio, 1) + '倍')
      || !regClaim?.text.includes('太平洋岛屿SO₂（' + mantissaExp(fact('rivm-s1-pi-so2-end'), 2, 1) + '×10²）亦达初级PM₂.₅（' + mantissaExp(fact('rivm-s1-pi-pm25-end'), 1, 1) + '×10¹）的' + displayedDecimal(piEndRatio, 1) + '倍')
      || !regClaim?.text.includes('韩国初级PM₂.₅中点因子（' + raw('rivm-s1-kr-pm25-mid') + '）是罗马尼亚（' + raw('rivm-s1-ro-pm25-mid') + '）的' + displayedDecimal(krRoMid, 2) + '倍')
      || !regClaim?.text.includes('罗马尼亚（' + mantissaExp(fact('rivm-s1-ro-pm25-end'), 3, 1) + '×10³ yr/kton）却反超韩国（' + mantissaExp(fact('rivm-s1-kr-pm25-end'), 2, 1) + '×10² yr/kton）达' + displayedDecimal(roKrEnd, 2) + '倍'))
    throw new Error('Particulate comparison changed displayed numeric bindings in cl-particulate131-regional-endpoint-reversal');

  // 7. Claim 8: Package & report discrepancies (83 = 25 + 48 + 10, 900 located, R1284 599.69, 52.0803% -> 52.1% urban NH3, S1.2 vs LC-IMPACT, JRC130796)
  const locatedPrecursorFlows = 25n * scale;
  const nh3UrbanMassPct = mulScaled(ratioScaled(fact('ef31-pm-nf-nh3-urban-mass'), fact('ef31-pm-nf-nh3-total-mass')), 100n * scale);
  if (locatedPrecursorFlows + fact('ef31-pm-unlocated-primary-flows') + fact('ef31-pm-unlocated-no-so3-flows') !== fact('ef31-pm-unlocated-factors')
      || fact('ef31-pm-declared-inventory-items') >= fact('ef31-pm-unlocated-factors')
      || displayedDecimal(nh3UrbanMassPct, 4) !== '52.0803'
      || displayedDecimal(nh3UrbanMassPct, 1) !== '52.1'
      || fact('jrc130796-table13-pm-4th') !== fact('jrc130796-table13-pm-5th'))
    throw new Error('Particulate comparison Claim 8 flow-count, urban-NH3 share or Table 13 duplicate invariant drifted');

  const pkgClaim = uniqueRecord(catalog.claims, 'cl-particulate131-package-discrepancies');
  if (!pkgClaim?.text.includes('在' + raw('ef31-pm-unlocated-factors') + '个无国别基本流之外')
      || !pkgClaim?.text.includes('展开了' + raw('ef31-pm-located-factors') + '条带空间位置记录')
      || !pkgClaim?.text.includes('其余' + raw('ef31-pm-unlocated-primary-flows') + '个初级颗粒物流与' + raw('ef31-pm-unlocated-no-so3-flows') + '个一氧化氮、三氧化硫流则无空间位置行')
      || !pkgClaim?.text.includes('保留' + mantissaExp(fact('ef31-nox-nonurban-and-upper-cf'), -7, 1) + '×10⁻⁷（在全球归一化清单中产生' + displayedDecimal(fact('ef31-pm-nf-upper-nox-incidences'), 2) + '例）')
      || !pkgClaim?.text.includes('全球' + displayedDecimal(nh3UrbanMassPct, 1) + '%的大气氨质量分入低因子的“城市近地面”档（' + mantissaExp(fact('ef31-nh3-urban-ground-cf'), -5, 1) + '×10⁻⁵）')
      || !pkgClaim?.text.includes('在SO₂（' + raw('rivm-s1-world-so2-end') + ' yr/kton）上与LC-IMPACT表6.2（' + mantissaExp(fact('lcimpact-pm-world-so2'), -4, 2) + '×10⁻⁴ DALY/kg）吻合')
      || !pkgClaim?.text.includes('在NH₃（' + raw('rivm-s1-world-nh3-end') + ' yr/kton）与NOₓ（' + raw('rivm-s1-world-nox-end') + ' yr/kton）上则略低于后者的' + mantissaExp(fact('lcimpact-pm-world-nh3'), -4, 2) + '×10⁻⁴与' + mantissaExp(fact('lcimpact-pm-world-nox'), -5, 2) + '×10⁻⁵ DALY/kg')
      || !pkgClaim?.text.includes('小幅下降' + raw('jrc130796-pm-nf-text-reduction') + '%”，紧邻表10却印作正值“' + raw('jrc130796-pm-nf-table10-diff') + '%”，表13还将两列基本流覆盖计数重复印作' + raw('jrc130796-table13-pm-4th'))
      || !pkgClaim?.caveats?.[0]?.includes('填为' + raw('ef31-pm-declared-inventory-items') + '（少于实际' + raw('ef31-pm-unlocated-factors') + '个基本流与' + raw('ef31-pm-total-factors') + '条因子）'))
    throw new Error('Particulate comparison changed displayed numeric bindings in cl-particulate131-package-discrepancies');

  // Consume both identical Table 13 duplicate columns explicitly
  raw('jrc130796-table13-pm-5th');

  if (consumed.size !== facts.size) {
    const unused = [...facts.keys()].filter(k => !consumed.has(k));
    throw new Error(`Particulate comparison left unverified numeric facts: ${unused.join(', ')}`);
  }
}

const requiredClaims = {
  'indicator-cutpoints': {
    concepts: ['cn-pm-intake-fraction', 'cn-pm-effect-factor', 'cn-endpoint'],
    premises: ['cl-pm-effect-definition', 'cl-pm-precursor-health'],
    links: [
      ['ev-particulate131-ilcd2011-pm', 'supports'],
      ['ev-particulate131-ec2021-pm', 'supports'],
      ['ev-particulate131-jrc109369-pm', 'supports'],
      ['ev-particulate131-ef31-nf-pm', 'supports'],
      ['ev-particulate131-rivm-ch5', 'supports'],
      ['ev-particulate131-recipe2017-pm', 'supports'],
      ['ev-particulate131-lcimpact-article-pm', 'supports'],
      ['ev-particulate131-lcimpact-pm-global', 'supports'],
    ],
  },
  'size-and-subcompartment': {
    concepts: ['cn-pm-intake-fraction'],
    premises: ['cl-pm-particle-identity', 'cl-particulate131-indicator-cutpoints'],
    links: [
      ['ev-particulate131-ef31-pm-xml', 'supports'],
    ],
  },
  'cohen-gbd2015-scope': {
    concepts: ['cn-pm-response-reference', 'cn-endpoint'],
    premises: ['cl-pm-nonlinear-response', 'cl-pm-ier-evidence'],
    links: [
      ['ev-particulate131-cohen-gbd2015-burden', 'supports'],
      ['ev-particulate131-cohen-limits-and-trends', 'supports'],
    ],
  },
  'cohen-empirical-limits': {
    concepts: ['cn-pm-response-slopes', 'cn-model-evidence-layer'],
    premises: ['cl-pm-gemm-alternative', 'cl-particulate131-cohen-gbd2015-scope'],
    links: [
      ['ev-particulate131-cohen-limits-and-trends', 'supports'],
    ],
  },
  'precursor-perspectives': {
    concepts: ['cn-pm-intake-fraction'],
    premises: ['cl-pm-precursor-denominator', 'cl-pm-uncovered-pathways'],
    links: [
      ['ev-particulate131-rivm-ch5', 'supports'],
      ['ev-particulate131-recipe2017-pm', 'supports'],
      ['ev-particulate131-lcimpact-article-pm', 'supports'],
      ['ev-particulate131-lcimpact-pm-global', 'supports'],
    ],
  },
  'ef-ammonia-inversion': {
    concepts: ['cn-pm-intake-fraction'],
    premises: ['cl-particulate131-precursor-perspectives'],
    links: [
      ['ev-particulate131-ef31-pm-xml', 'supports'],
      ['ev-particulate131-ef31-nf-pm', 'supports'],
      ['ev-particulate131-rivm-ch5', 'supports'],
    ],
  },
  'regional-endpoint-reversal': {
    concepts: ['cn-pm-effect-factor', 'cn-endpoint'],
    premises: ['cl-particulate131-indicator-cutpoints', 'cl-particulate131-precursor-perspectives'],
    links: [
      ['ev-particulate131-rivm-s1-regions', 'supports'],
    ],
  },
  'package-discrepancies': {
    concepts: ['cn-model-evidence-layer'],
    premises: ['cl-particulate131-indicator-cutpoints', 'cl-particulate131-ef-ammonia-inversion'],
    links: [
      ['ev-particulate131-ef31-pm-xml', 'supports'],
      ['ev-particulate131-ef31-nf-pm', 'supports'],
      ['ev-particulate131-rivm-ch5', 'supports'],
      ['ev-particulate131-rivm-s1-regions', 'supports'],
      ['ev-particulate131-lcimpact-pm-global', 'supports'],
      ['ev-particulate131-jrc130796-pm', 'supports'],
    ],
  },
};

function validateSupportLinks(catalog) {
  const claimEntries = Object.entries(requiredClaims);
  if (catalog.claims.filter(row => row.id.startsWith('cl-particulate131-')).length !== claimEntries.length)
    throw new Error('Particulate comparison claim count differs from its pinned claim inventory');
  for (const [claimName, spec] of claimEntries) {
    const id = 'cl-particulate131-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.status !== 'reviewed' || claim?.reviewKind !== 'agent-source-check'
        || !scienceText(claim?.scope) || !scienceText(claim?.reasoning)
        || !Array.isArray(claim?.caveats) || !claim.caveats.length || !claim.caveats.every(scienceText)
        || !sameScienceValue(claim?.conceptIds, spec.concepts)
        || !sameScienceValue(claim?.mappingIds, [])
        || !sameScienceValue(claim?.premiseIds, spec.premises))
      throw new Error(`Particulate comparison claim lacks reviewed status, caveats or bounded conceptIds/premiseIds: ${id}`);
    if (claim?.evidenceIds?.length !== spec.links.length || claim?.evidenceLinks?.length !== spec.links.length)
      throw new Error(`Particulate comparison changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of spec.links) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation
          || !scienceText(links[0].rationale))
        throw new Error(`Particulate comparison lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
