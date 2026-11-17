import { editionDigest } from './reader-current-edition.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const efUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF3_1/EF-v3.1.zip';
const lcReportUrl = 'https://www.lc-impact.eu/doc/LC-IMPACT_Overall_report_20201113.pdf';
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
  glam2019: {
    sourceId: 'src-book-unep-glam-2019-volume2',
    readingId: 'rd-unep-glam-2019-pathways',
    artifact: {
      id: 'art-unep-glam-2019-volume2-olw-pdf',
      mediaType: 'application/pdf',
      sha256: '25a581923bca994a7258c7e5748ea91f36d0f735d8ad2eaefdfb465b71702ca1',
      resolvedUrl: 'https://ourlandandwater.nz/wp-content/uploads/2019/12/EPF_GLAMVolume2.pdf',
      pageCount: 202,
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
    sourceId: 'src-eutro129-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-eutro129-ef-method-fw',
      mediaType: 'application/xml',
      sha256: '15eff61b234c7564bbd41b6dd40ed0dc6dfc0d5c1704f89d143f3dc90e82d523',
      resolvedUrl: efUrl,
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
  lcimpactCh8Ch9: {
    sourceId: 'src-eutro129-lcimpact-ch8-ch9',
    readingId: 'rd-eutro129-lcimpact-ch8-ch9',
    artifact: {
      id: 'art-eutro129-lcimpact-report-pdf',
      mediaType: 'application/pdf',
      sha256: '6e3e3cb7f2e93dd9e8a770fd11a960d0273e91f82611c536a6268db6a1f04ea4',
      resolvedUrl: lcReportUrl,
      pageCount: 184,
    },
  },
};

const efSelectedMembers = [
  // 6 reused EF-v3.1.zip members already registered on rd-flow-pilot-ef31
  ['art-ozone119-ef-method-marine', 'application/xml', 'a681b4b9b2d853697e2e044719d43cb7eaa6b8e185af8b00bb277aa92e735301'],
  ['art-acid113-ef-method-nutrient', 'application/xml', '72f1187a0682e186bdedf74f60fe99a1e1dafa7469141af74dfe4ea21c296992'],
  ['art-flow99-ef-mass', 'application/xml', '8fed3fee7b905fe5eb1099880810842f32226966bad658cf25c4be49581e5eb4'],
  ['art-acid113-ef-moles-property', 'application/xml', '6973482cd527bef3a8aa35b1c19e9bad26330114689a64d1b5881b4ed1326f93'],
  ['art-bio127-ef-method-config', 'application/xml', '14237568217d30236cb8bec43171c746162fde9aa4751f3b30d5fd49e4a3dce9'],
  ['art-bio127-ef-nf-wf-xlsx', xlsxMime, '8a5ceda370b2c312d085032fb9c154ce56f45e46c4d1dbba4e56cd9aedaab554'],
  // 20 newly inspected EF-v3.1.zip XML members (CRC32 + SHA-256 verified)
  ['art-eutro129-ef-method-fw', 'application/xml', '15eff61b234c7564bbd41b6dd40ed0dc6dfc0d5c1704f89d143f3dc90e82d523'],
  ['art-eutro129-ef-source-struijs2008', 'application/xml', '7fc4aec206944eed4c462cfac4588b1fefd340d5925a1bfa25fe23d4e97f381c'],
  ['art-eutro129-ef-source-seppala2006', 'application/xml', '472bdc351ffa6554cb76ff9b2918cf63bcbc44d27190b27be0550953c51468f2'],
  ['art-eutro129-ef-flow-p-fw-ec', 'application/xml', '1b3ff4bb8e26a1e467096cb58ab88d0d17b5ff9024dd550324815a610bb5f502'],
  ['art-eutro129-ef-flow-p-fw-noec', 'application/xml', '7a819ae6a6c292198112929c613fd4c57a93b54e191e7a34f9849944ef3889b9'],
  ['art-eutro129-ef-flow-ptotal-fw', 'application/xml', 'c03a5c0b020b93b96ee05188fbdf6614d86896823ed22857ffa53a3ac04d9ec7'],
  ['art-eutro129-ef-flow-p-agsoil', 'application/xml', '1f5f5f15241b3cf4dfe404e442782ed4cf34e72310428852e793cca8f005a087'],
  ['art-eutro129-ef-flow-ptotal-agsoil', 'application/xml', '14fcf88083de6e49931ab44f5f50d0bb7d2092f408e23f2c172081df2c86398d'],
  ['art-eutro129-ef-flow-p-soil-unspec', 'application/xml', '2c75575e3e79ef2649abb48095b52df326fd1872a631c0a3915e81cc9fe1f670'],
  ['art-eutro129-ef-flow-po4-fw', 'application/xml', '4075d15435ef6e2656de6633c1b0c78cc555faae0351fa761ddfbe91ef94fa3d'],
  ['art-eutro129-ef-flow-po4-agsoil', 'application/xml', 'a52c7ae96115da1a59bc2311991b10516bfb12371ea5d5dfc677ccc0d3e31f74'],
  ['art-eutro129-ef-flow-p-sea', 'application/xml', '080f8d7ab749586cf62a77ea743249433984a94b70ebf0d0bb0537a252ed227d'],
  ['art-eutro129-ef-flow-ntotal-fw', 'application/xml', '84c011c5dba8f7de7216f7835aaec5d8593094ea7676cc6b1d49d7919be10dd7'],
  ['art-eutro129-ef-flow-no3-unspecw-lt', 'application/xml', '89fc9ce20283d731da2e12e2b7df66c4e2ff4af18c78d2820bc4c90ddc991c94'],
  ['art-eutro129-ef-flow-no3-unspecw', 'application/xml', '39c02b15701a272526787176d1b4b32af6fce10ab33b9911bae4b0d88d236d12'],
  ['art-eutro129-ef-flow-nh3-fw', 'application/xml', '1facd2a97b77af2b68c21e8807855f81b644e706445f93fa9c5045a326391a0c'],
  ['art-eutro129-ef-flow-no3-fw', 'application/xml', '15f9f95af9f2ec8a95fada52a403516532fd213505d4279d5250f27975c90811'],
  ['art-eutro129-ef-flow-no3-sea', 'application/xml', 'c162fa13f3d0f190fb71da756ef536a47aee467095614f39f0729ec13eb4db15'],
  ['art-eutro129-ef-flow-nh3-sea', 'application/xml', '49ab324641d849cad3c2515a2757957f7d3ed107d4b7d8dba85284155b95b4d6'],
  ['art-eutro129-ef-flow-ntotal-sea', 'application/xml', 'b85c5dba57e7860aa5a717725ea12aa4b18caf6f806af984a2436c977db1ce1a'],
];

const evidenceRows = [
  ['ilcd2011-eutro', 'ilcd', 'psg-eutro129-ilcd2011-eutro', null,
    '57c5d718c39024c62dc65f600e1e4f957b2b9916909c2d29d23b69ef45b791ca'],
  ['glam2019-eutro', 'glam2019', 'psg-eutro129-glam2019-eutro', null,
    '32b9d0d7a3a8f720a0a7749c2ae6ab0d1011bd2a985c3c600f1a58e03b02013a'],
  ['ec2021-field-rules', 'ec2021', 'psg-eutro129-ec2021-field-rules', null,
    'fe8b73e399a57751fa11c9f4205ebe53465acf34378eaa0979cc6cdadd7c40d1'],
  ['jrc109369-eutro', 'jrc109369', 'psg-eutro129-jrc109369-eutro', null,
    '2d11e1d4bc9903ea9bdf2c7028e302814203b8229a30780c8ef901c8da05560c'],
  ['jrc130796-eutro', 'jrc130796', 'psg-eutro129-jrc130796-eutro', null,
    '4f30250b507b5734b7be8a74729880e8c59936871bd5ebb7464a5c04983bef81'],
  ['ef31-eutro-xmls', 'ef31', 'psg-eutro129-ef31-eutro-xmls', 'art-eutro129-ef-method-fw',
    '6baf215321ec0367369d478d11d13b52448a5558db04124a37d42a9feb169194'],
  ['ef31-nf-eutro', 'ef31', 'psg-eutro129-ef31-nf-eutro', 'art-bio127-ef-nf-wf-xlsx',
    'c897458bef14c11ef5fb1f854233040142c1039bc7d39af5835a0ad1d25fab0b'],
  ['rivm-ch8-s4', 'rivm', 'psg-eutro129-rivm-ch8-s4', null,
    '302e45429cf579973a5a21955e02d314b0bbc0512a4bd3dbcf56e2afae61660b'],
  ['recipe2017-eutro', 'recipe2017', 'psg-eutro129-recipe2017-eutro', null,
    '3a2f7d02d253e527764c537ab18800b9d484efb9dedd1c4c106494f73f78fd96'],
  ['lcimpact2020-eutro', 'lcimpact2020', 'psg-eutro129-lcimpact2020-eutro', null,
    '787a048a1cd8eee36593f66f8a56c2d88a642a6bf2450ae77ec64981fe7d0ce8'],
  ['lcimpact-ch8-fw', 'lcimpactCh8Ch9', 'psg-eutro129-lcimpact-ch8-fw', null,
    '325681d1e78e19399116bf585735dbc7b9d37702a125172790941b638010f2a8'],
  ['lcimpact-ch9-marine', 'lcimpactCh8Ch9', 'psg-eutro129-lcimpact-ch9-marine', null,
    '7ed3cef867e96852e4a198854a5d3d06bf83b70afec301e7c4e9b1a42b9f62b6'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateEutrophicationPathwaysFactors(catalog, readings, { skipRowDigests = false } = {}) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-eutro129-')).length !== evidenceRows.length)
    throw new Error('Eutrophication pathways evidence count differs from its pinned row inventory');
  const allPassages = readings.readings.flatMap(row => row.passages.filter(p => p.id.startsWith('psg-eutro129-')));
  if (allPassages.length !== evidenceRows.length)
    throw new Error('Eutrophication pathways 1-to-1 passage count differs from its pinned evidence inventory');

  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...expectedSourceArtifact } = expected.artifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Eutrophication pathways changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, mediaType, sha] of efSelectedMembers) {
    const expectedMember = { id, mediaType, sha256: sha, resolvedUrl: efUrl };
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), expectedMember))
      throw new Error(`Eutrophication pathways changed a verified EF 3.1 member: ${id}`);
  }

  const facts = new Map();
  const seenPassages = new Set();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-eutro129-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || seenPassages.has(passageId) || record.sourceId !== expected.sourceId
        || record.readingId !== expected.readingId || record.passageId !== passageId
        || passage.artifactId !== expectedArtifactId)
      throw new Error(`Eutrophication pathways changed the selected row or support passage: ${id}`);
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
      throw new Error(`Eutrophication pathways changed the selected row or support passage: ${id}`);
    if (record.numericFact) facts.set(name, record.numericFact.value);
    for (const item of record.numericFacts ?? []) {
      if (facts.has(item.id)) throw new Error(`Eutrophication pathways duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== 126) throw new Error(`Eutrophication pathways expected 126 verified numeric facts, got ${facts.size}`);
  validateCalculations(facts, catalog);
  validateSupportLinks(catalog);
}

const DECIMALS = 40;
const scale = 10n ** BigInt(DECIMALS);
const canonicalDecimalPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

export function exactDecimal(value) {
  if (typeof value !== 'string' || !canonicalDecimalPattern.test(value))
    throw new Error(`Eutrophication pathways requires canonical decimal literal: ${value}`);
  const negative = value.startsWith('-');
  const clean = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = clean.split('.');
  if (fraction.length > DECIMALS) throw new Error(`Eutrophication pathways decimal exceeds ${DECIMALS} places: ${value}`);
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
  if (denominator === 0n) throw new Error('Eutrophication pathways zero denominator in fixed-point division');
  if (numerator === 0n) return 0n;
  const neg = (numerator < 0n) !== (denominator < 0n);
  const absNum = numerator < 0n ? -numerator : numerator;
  const absDen = denominator < 0n ? -denominator : denominator;
  const rounded = (absNum * scale + absDen / 2n) / absDen;
  return neg ? -rounded : rounded;
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

function mantissaExp(scaledValue, exponent, places) {
  const shifted = exponent >= 0
    ? ratioScaled(scaledValue, 10n ** BigInt(exponent) * scale)
    : mulScaled(scaledValue, 10n ** BigInt(-exponent) * scale);
  return displayedDecimal(shifted, places);
}

const exactFactLiterals = Object.freeze({
  'ilcd-eutro-recommended-midpoints': '3',
  'ilcd-eutro-recommended-endpoints': '0',
  'glam2019-eutro-categories': '2',
  'glam2019-tier1-p-loss-fraction': '0.10',
  'ec2021-eutro-midpoints': '3',
  'ec2021-n-to-soil-allowed': '0',
  'ec2021-tier1-n2o-per-n': '0.022',
  'ec2021-tier1-nh3-synth-per-n': '0.12',
  'ec2021-tier1-nh3-manure-per-n': '0.24',
  'ec2021-tier1-no3-per-n': '1.33',
  'ec2021-alt-no3-base-per-n': '0.44',
  'ec2021-alt-nh3-urea-per-n': '0.18',
  'ec2021-alt-nh3-other-per-n': '0.024',
  'ec2021-alt-n2-per-n': '0.09',
  'jrc109369-table7-fw-substance-groups': '3',
  'jrc109369-table7-mar-substance-groups': '7',
  'jrc130796-nf-ter-printed': '177',
  'jrc130796-nf-fw-printed': '1.61',
  'jrc130796-nf-mar-printed': '19.5',
  'jrc130796-nf-eutro-rel-diff-pct': '0',
  'jrc130796-t13-ter-4th': '152',
  'jrc130796-t13-ter-5th-dup': '152',
  'jrc130796-t13-fw-4th': '8',
  'jrc130796-t13-fw-5th-dup': '8',
  'jrc130796-t13-mar-4th': '201',
  'jrc130796-t13-mar-5th-dup': '201',
  'ef31-fw-xml-bytes': '26005',
  'ef31-mar-xml-bytes': '330296',
  'ef31-ter-xml-bytes': '328944',
  'ef31-eutro-converter-copies': '0',
  'ef31-fw-total-factors': '29',
  'ef31-fw-location-factors': '0',
  'ef31-fw-declared-inventory-items': '3',
  'ef31-fw-dup-phosphorus-flows': '2',
  'ef31-fw-p-water-cf': '1.0',
  'ef31-fw-po4-water-cf': '0.33',
  'ef31-fw-h3po4-water-cf': '0.32',
  'ef31-fw-p-soil-cf': '0.05',
  'ef31-fw-po4-soil-cf': '0.016',
  'ef31-fw-p-sea-cf': '0.0',
  'ef31-mar-total-factors': '590',
  'ef31-mar-unlocated-factors': '50',
  'ef31-mar-location-factors': '540',
  'ef31-mar-declared-inventory-items': '7',
  'ef31-mar-soil-factors': '0',
  'ef31-mar-cod-bod-factors': '0',
  'ef31-mar-ntotal-water-cf': '1.0',
  'ef31-mar-nh3-water-cf': '0.824',
  'ef31-mar-nh4-water-cf': '0.778',
  'ef31-mar-no2ion-water-cf': '0.304',
  'ef31-mar-no3-water-cf': '0.226',
  'ef31-mar-nox-air-cf': '0.389',
  'ef31-mar-nh3-air-cf': '0.092',
  'ef31-mar-no-air-cf': '0.596',
  'ef31-mar-nh4-air-cf': '0.087',
  'ef31-mar-no3-air-cf': '0.028',
  'ef31-ter-total-factors': '575',
  'ef31-ter-unlocated-factors': '35',
  'ef31-ter-empty-loc-tags': '27',
  'ef31-ter-omitted-loc-tags': '8',
  'ef31-ter-location-factors': '540',
  'ef31-ter-country-codes': '36',
  'ef31-ter-declared-inventory-items': '6',
  'ef31-ter-soil-factors': '0',
  'ef31-ter-nox-unloc-cf': '4.26',
  'ef31-ter-nox-min-gr': '0.3',
  'ef31-ter-nox-max-lu': '3.547',
  'ef31-ter-no2-uair-max-lu': '3.55',
  'ef31-ter-no-unloc-cf': '6.532',
  'ef31-ter-nh3-unloc-cf': '13.47',
  'ef31-ter-nh3-min-ie': '1.085',
  'ef31-ter-nh3-max-ch': '21.2',
  'ef31-ter-nh4-unrounded': '12.72166667',
  'ef31-ter-nh4-rounded': '12.7217',
  'ef31-ter-no3-unrounded': '3.160645161',
  'ef31-ter-no3-rounded': '3.16065',
  'ef31-struijs-source-year': '2008',
  'ef31-nf-pop': '6895889018',
  'ef31-nf-fw-exact': '1.6068521282881294',
  'ef31-nf-mar-exact': '19.545181551919121',
  'ef31-nf-ter-exact': '176.75499978894175',
  'ef31-wf-fw': '0.028',
  'ef31-wf-mar': '0.0296',
  'ef31-wf-ter': '0.0371',
  'ef31-nf-r1406-fert-p-soil-mass': '15800000000',
  'ef31-nf-r1407-manure-p-soil-mass': '18800000000',
  'ef31-nf-r1408-ag-p-water-mass': '5821222362.4139004',
  'ef31-nf-r1409-wwtp-p-water-mass': '3529451582.5981398',
  'ef31-nf-r1283-no3-water-mass': '75000000000',
  'ef31-nf-r1288-ag-n-water-mass': '59200000000',
  'ef31-nf-r1289-wwtp-n-water-mass': '9691074878.2156696',
  'rivm-eutro-categories': '1',
  'rivm-marine-eutro-categories': '0',
  'rivm-ff-p-fw-days': '85',
  'rivm-ff-p-fw-years': '0.23',
  'rivm-fep-p-fw': '1.00',
  'rivm-fep-p-agsoil': '0.10',
  'rivm-fep-p-sea': '0',
  'rivm-fep-po4-fw': '0.33',
  'rivm-fep-po4-agsoil': '0.033',
  'rivm-fep-h3po4-fw': '0.32',
  'rivm-fep-p2o5-fw-printed': '0.22',
  'rivm-sd-fw-eutro': '0.000000000789',
  'rivm-m2e-fw-eutro': '0.00000061',
  'rivm-s4-alpha-trop-lake-het': '-1.430',
  'rivm-s4-ef-trop-lake-het': '13458',
  'recipe2017-eutro-midpoints': '1',
  'lcimpact-eutro-midpoints': '0',
  'lcimpact-eutro-endpoints': '2',
  'lcimpact-fw-ecoregions': '449',
  'lcimpact-fw-taxa-groups': '1',
  'lcimpact-mar-basin-lme-pairs': '5772',
  'lcimpact-mar-taxa-groups': '6',
  'lcimpact-ch8-global-fish-species': '15000',
  'lcimpact-ch8-soil-grid-arcmin': '5',
  'lcimpact-ch8-usle-crop-factor': '0.3',
  'lcimpact-ch8-cf-pathway-types': '3',
  'lcimpact-ch9-airborne-cfs': '0',
  'lcimpact-ch9-lme-count': '66',
  'lcimpact-ch9-hypoxia-species': '57',
  'lcimpact-ch9-global-cf-soil': '0.000000000000000207',
  'lcimpact-ch9-global-cf-river': '0.000000000000000916',
  'lcimpact-ch9-global-cf-marine': '0.00000000000000195',
  'lcimpact-ch9-europe-cf-soil': '0.0000000000000003751',
  'lcimpact-ch9-europe-cf-river': '0.000000000000001962',
  'lcimpact-ch9-europe-cf-marine': '0.000000000000003869',
});

function validateCalculations(facts, catalog) {
  const consumed = new Set();
  const fact = id => {
    const rawVal = facts.get(id);
    if (rawVal === undefined) throw new Error(`Eutrophication pathways missing numeric fact: ${id}`);
    const parsed = exactDecimal(rawVal);
    if (!Object.hasOwn(exactFactLiterals, id) || rawVal !== exactFactLiterals[id]
        || parsed !== exactDecimal(exactFactLiterals[id]))
      throw new Error(`Eutrophication pathways numeric fact drifted from verified primary literal: ${id}`);
    consumed.add(id);
    return parsed;
  };
  const raw = id => {
    fact(id);
    return facts.get(id);
  };

  // 1. Category genealogy across ILCD 2011, EF 2.0-3.1, UNEP GLAM 2019, ReCiPe 2016 and LC-IMPACT (Claim 1).
  const wfTerPct = mulScaled(fact('ef31-wf-ter'), 100n * scale);
  const wfFwPct = mulScaled(fact('ef31-wf-fw'), 100n * scale);
  const wfMarPct = mulScaled(fact('ef31-wf-mar'), 100n * scale);
  const wfSumPct = wfTerPct + wfFwPct + wfMarPct;
  const ffYearsFromDays = ratioScaled(fact('rivm-ff-p-fw-days'), 365n * scale);
  if (fact('ilcd-eutro-recommended-midpoints') !== 3n * scale
      || fact('ilcd-eutro-recommended-endpoints') !== 0n
      || fact('ec2021-eutro-midpoints') !== 3n * scale
      || fact('glam2019-eutro-categories') !== 2n * scale
      || fact('rivm-eutro-categories') !== scale
      || fact('recipe2017-eutro-midpoints') !== scale
      || fact('rivm-marine-eutro-categories') !== 0n
      || displayedDecimal(ffYearsFromDays, 2) !== raw('rivm-ff-p-fw-years')
      || fact('rivm-sd-fw-eutro') !== exactDecimal('0.000000000789')
      || fact('rivm-m2e-fw-eutro') !== exactDecimal('0.00000061')
      || displayedDecimal(wfTerPct, 2) !== '3.71'
      || displayedDecimal(wfFwPct, 2) !== '2.80'
      || displayedDecimal(wfMarPct, 2) !== '2.96'
      || displayedDecimal(wfSumPct, 2) !== '9.47'
      || displayedDecimal(fact('ef31-nf-ter-exact'), 0) !== raw('jrc130796-nf-ter-printed')
      || displayedDecimal(fact('ef31-nf-fw-exact'), 2) !== raw('jrc130796-nf-fw-printed')
      || displayedDecimal(fact('ef31-nf-mar-exact'), 1) !== raw('jrc130796-nf-mar-printed')
      || fact('lcimpact-eutro-midpoints') !== 0n
      || fact('lcimpact-eutro-endpoints') !== 2n * scale
      || fact('lcimpact-fw-ecoregions') !== 449n * scale
      || fact('lcimpact-fw-taxa-groups') !== scale
      || fact('lcimpact-ch8-global-fish-species') !== 15000n * scale
      || fact('lcimpact-mar-basin-lme-pairs') !== 5772n * scale
      || fact('lcimpact-ch9-lme-count') !== 66n * scale
      || fact('lcimpact-ch9-hypoxia-species') !== 57n * scale
      || fact('lcimpact-mar-taxa-groups') !== 6n * scale)
    throw new Error('Eutrophication pathways lost category genealogy or conversion constants');

  const genClaim = uniqueRecord(catalog.claims, 'cl-eutro129-category-genealogy');
  if (!genClaim?.text.includes('设立 ' + raw('ilcd-eutro-recommended-midpoints') + ' 项中点而正式推荐 '
        + raw('ilcd-eutro-recommended-endpoints') + ' 项终点模型')
      || !genClaim?.text.includes('归一化基准 ' + displayedDecimal(fact('ef31-nf-ter-exact'), 2) + '、综合权重 '
        + displayedDecimal(wfTerPct, 2) + '%')
      || !genClaim?.text.includes('归一化基准 ' + displayedDecimal(fact('ef31-nf-fw-exact'), 2) + ' kg P 当量/人与 '
        + displayedDecimal(fact('ef31-nf-mar-exact'), 2) + ' kg N 当量/人，权重 '
        + displayedDecimal(wfFwPct, 2) + '% 与 ' + displayedDecimal(wfMarPct, 2) + '%，三项合计占 EF 3.1 单一得分权重的 '
        + displayedDecimal(wfSumPct, 2) + '%')
      || !genClaim?.text.includes('只设淡水与近岸海洋 ' + raw('glam2019-eutro-categories') + ' 项水体类别')
      || !genClaim?.text.includes('全套仅保留 ' + raw('rivm-eutro-categories') + ' 项富营养化类别')
      || !genClaim?.text.includes('未纳入海洋富营养化（' + raw('rivm-marine-eutro-categories') + ' 项海洋类别')
      || !genClaim?.text.includes('全球平均磷停留时间 ' + raw('rivm-ff-p-fw-days') + ' 天（' + raw('rivm-ff-p-fw-years') + ' 年）')
      || !genClaim?.text.includes(mantissaExp(fact('rivm-sd-fw-eutro'), -10, 2) + '×10⁻¹⁰ species/m³')
      || !genClaim?.text.includes(mantissaExp(fact('rivm-m2e-fw-eutro'), -7, 1) + '×10⁻⁷ species·年/kg P 当量')
      || !genClaim?.text.includes('设 ' + raw('lcimpact-eutro-midpoints') + ' 项富营养化中点')
      || !genClaim?.text.includes('构建 ' + raw('lcimpact-eutro-endpoints') + ' 项全球不可逆灭绝终点')
      || !genClaim?.text.includes('跨 ' + raw('lcimpact-fw-ecoregions') + ' 个淡水生态区、以全球 '
        + raw('lcimpact-ch8-global-fish-species') + ' 种淡水鱼类为唯一效应类群（仅含 ' + raw('lcimpact-fw-taxa-groups') + ' 个类群')
      || !genClaim?.text.includes('跨 ' + raw('lcimpact-mar-basin-lme-pairs') + ' 个流域—大型海洋生态系统（LME）配对与 '
        + raw('lcimpact-ch9-lme-count') + ' 个近海 LME，依据 ' + raw('lcimpact-ch9-hypoxia-species') + ' 个物种的低氧敏感性评估鱼类、甲壳类、软体动物等 '
        + raw('lcimpact-mar-taxa-groups') + ' 类海洋动物损害'))
    throw new Error('Eutrophication pathways changed the displayed category genealogy prose');

  // 2. 2 kg P soil-vs-water interface & 2x / 10x-20x counting traps (Claim 2).
  const pApplied = 2n * scale;
  const glamNetWaterP = mulScaled(pApplied, fact('glam2019-tier1-p-loss-fraction'));
  const glamScore = mulScaled(glamNetWaterP, fact('ef31-fw-p-water-cf'));
  const recipeSoilScore = mulScaled(pApplied, fact('rivm-fep-p-agsoil'));
  const efSoilScore = mulScaled(pApplied, fact('ef31-fw-p-soil-cf'));
  const doubleAttenEf = mulScaled(glamNetWaterP, fact('ef31-fw-p-soil-cf'));
  const doubleAttenRecipe = mulScaled(glamNetWaterP, fact('rivm-fep-p-agsoil'));
  const directWaterOvercount = mulScaled(pApplied, fact('ef31-fw-p-water-cf'));
  const soilModelRatio = ratioScaled(recipeSoilScore, efSoilScore);
  if (fact('ef31-fw-total-factors') !== 29n * scale
      || fact('ef31-fw-location-factors') !== 0n
      || fact('ef31-fw-p-water-cf') !== fact('rivm-fep-p-fw')
      || fact('ef31-fw-p-sea-cf') !== 0n
      || fact('rivm-fep-p-sea') !== 0n
      || fact('ef31-fw-po4-soil-cf') !== exactDecimal('0.016')
      || fact('rivm-fep-po4-agsoil') !== exactDecimal('0.033')
      || glamScore !== recipeSoilScore
      || displayedDecimal(glamScore, 2) !== '0.20'
      || displayedDecimal(efSoilScore, 2) !== '0.10'
      || soilModelRatio !== 2n * scale
      || displayedDecimal(doubleAttenEf, 3) !== '0.010'
      || displayedDecimal(doubleAttenRecipe, 3) !== '0.020'
      || ratioScaled(efSoilScore, doubleAttenEf) !== 10n * scale
      || ratioScaled(recipeSoilScore, doubleAttenEf) !== 20n * scale
      || displayedDecimal(directWaterOvercount, 1) !== '2.0'
      || ratioScaled(directWaterOvercount, glamScore) !== 10n * scale
      || ratioScaled(directWaterOvercount, efSoilScore) !== 20n * scale
      || fact('lcimpact-ch8-soil-grid-arcmin') !== 5n * scale
      || fact('lcimpact-ch8-usle-crop-factor') !== exactDecimal('0.3')
      || fact('lcimpact-ch8-cf-pathway-types') !== 3n * scale)
    throw new Error('Eutrophication pathways lost 2 kg P soil-water interface or 2x/10x-20x mismatch invariants');

  const pIfClaim = uniqueRecord(catalog.claims, 'cl-eutro129-phosphorus-soil-water-interface');
  if (!pIfClaim?.text.includes('方法 XML 的 ' + raw('ef31-fw-total-factors') + ' 条无位置因子中水体总磷系数 '
        + raw('ef31-fw-p-water-cf') + ' kg P 当量/kg；海水磷系数为 ' + raw('ef31-fw-p-sea-cf'))
      || !pIfClaim?.text.includes('设为 ' + raw('ef31-fw-p-soil-cf') + ' kg P 当量/kg（隐含 5% 入水迁移率，土壤磷酸根与磷酸均为 '
        + raw('ef31-fw-po4-soil-cf') + '）')
      || !pIfClaim?.text.includes('设为 ' + raw('rivm-fep-p-agsoil') + ' kg P 当量/kg（隐含 10% 入水迁移率，土壤磷酸根为 '
        + raw('rivm-fep-po4-agsoil') + '，海水为 ' + raw('rivm-fep-p-sea') + '）')
      || !pIfClaim?.text.includes('第一层（Tier 1）' + raw('glam2019-tier1-p-loss-fraction') + '（10%）清单缺省损失比例')
      || !pIfClaim?.text.includes('结果同为 ' + displayedDecimal(glamScore, 2) + ' kg P 当量')
      || !pIfClaim?.text.includes('得 ' + displayedDecimal(efSoilScore, 2) + ' kg P 当量')
      || !pIfClaim?.text.includes('相差 ' + displayedDecimal(soilModelRatio, 0) + ' 倍')
      || !pIfClaim?.text.includes('跌至 ' + displayedDecimal(doubleAttenEf, 3) + ' 或 ' + displayedDecimal(doubleAttenRecipe, 3) + ' kg P 当量')
      || !pIfClaim?.text.includes('升至 ' + displayedDecimal(directWaterOvercount, 1) + ' kg P 当量')
      || !pIfClaim?.text.includes('在 ' + raw('lcimpact-ch8-soil-grid-arcmin') + ' 角分网格上拆出直接排入淡水、农田施磷径流淋溶与按通用作物系数 '
        + raw('lcimpact-ch8-usle-crop-factor') + ' 计算的土地侵蚀面积共 ' + raw('lcimpact-ch8-cf-pathway-types') + ' 套因子'))
    throw new Error('Eutrophication pathways changed the displayed 2 kg P soil-water interface prose');

  // 3. Phosphorus stoichiometry & RIVM P2O5 0.22 error + Table S4.2 unit conflict (Claim 3).
  const pAtom = exactDecimal('30.974');
  const po4Mass = exactDecimal('94.971');
  const h3po4Mass = exactDecimal('97.995');
  const p2o5Mass = exactDecimal('141.943');
  const po4Stoich = ratioScaled(pAtom, po4Mass);
  const h3po4Stoich = ratioScaled(pAtom, h3po4Mass);
  const p2o5OneAtom = ratioScaled(pAtom, p2o5Mass);
  const p2o5TwoAtoms = ratioScaled(2n * pAtom, p2o5Mass);
  if (fact('ef31-fw-po4-water-cf') !== fact('rivm-fep-po4-fw')
      || fact('ef31-fw-h3po4-water-cf') !== fact('rivm-fep-h3po4-fw')
      || displayedDecimal(po4Stoich, 2) !== raw('ef31-fw-po4-water-cf')
      || displayedDecimal(h3po4Stoich, 2) !== raw('ef31-fw-h3po4-water-cf')
      || displayedDecimal(p2o5OneAtom, 2) !== raw('rivm-fep-p2o5-fw-printed')
      || displayedDecimal(p2o5TwoAtoms, 3) !== '0.436'
      || displayedDecimal(p2o5TwoAtoms, 2) !== '0.44'
      || fact('jrc109369-table7-fw-substance-groups') !== 3n * scale
      || fact('rivm-s4-alpha-trop-lake-het') !== exactDecimal('-1.430')
      || fact('rivm-s4-ef-trop-lake-het') !== 13458n * scale)
    throw new Error('Eutrophication pathways lost PO4/H3PO4/P2O5 stoichiometry or Table S4.2 invariants');

  const p2o5Claim = uniqueRecord(catalog.claims, 'cl-eutro129-phosphorus-stoichiometry-and-p2o5');
  if (!p2o5Claim?.text.includes('同为 ' + raw('ef31-fw-po4-water-cf') + ' 与 ' + raw('ef31-fw-h3po4-water-cf') + ' kg P 当量/kg')
      || !p2o5Claim?.text.includes('五氧化二磷印作 ' + raw('rivm-fep-p2o5-fw-printed') + ' kg P 当量/kg')
      || !p2o5Claim?.text.includes('2×30.974/141.943≈' + displayedDecimal(p2o5TwoAtoms, 3) + '（两位有效数字为 '
        + displayedDecimal(p2o5TwoAtoms, 2) + '）')
      || !p2o5Claim?.text.includes('30.974/141.943≈' + displayedDecimal(p2o5OneAtom, 3))
      || !p2o5Claim?.text.includes('仅列磷酸根、磷酸与总磷 ' + raw('jrc109369-table7-fw-substance-groups') + ' 组淡水物质')
      || !p2o5Claim?.text.includes('异养生物为 ' + raw('rivm-s4-alpha-trop-lake-het') + '）')
      || !p2o5Claim?.text.includes('所印线性效应因子 ' + raw('rivm-s4-ef-trop-lake-het') + ' PDF·m³/kg'))
    throw new Error('Eutrophication pathways changed the displayed P2O5 stoichiometry or Table S4.2 prose');

  // 4. Nitrogen soil prohibition & 10 kg synthetic N fertilizer ledger (Claim 4).
  const nApplied = 10n * scale;
  const no3From10N = mulScaled(nApplied, fact('ec2021-tier1-no3-per-n'));
  const nh3From10N = mulScaled(nApplied, fact('ec2021-tier1-nh3-synth-per-n'));
  const marFrom10N = mulScaled(no3From10N, fact('ef31-mar-no3-water-cf'))
    + mulScaled(nh3From10N, fact('ef31-mar-nh3-air-cf'));
  const terFrom10N = mulScaled(nh3From10N, fact('ef31-ter-nh3-unloc-cf'));
  if (fact('ec2021-n-to-soil-allowed') !== 0n
      || fact('ef31-mar-soil-factors') !== 0n
      || fact('ef31-ter-soil-factors') !== 0n
      || fact('ec2021-tier1-n2o-per-n') !== exactDecimal('0.022')
      || fact('ec2021-tier1-nh3-manure-per-n') !== 2n * fact('ec2021-tier1-nh3-synth-per-n')
      || displayedDecimal(ratioScaled(3n * 62n * scale, 10n * 14n * scale), 2) !== raw('ec2021-tier1-no3-per-n')
      || displayedDecimal(ratioScaled(62n * scale, 10n * 14n * scale), 2) !== raw('ec2021-alt-no3-base-per-n')
      || fact('ec2021-alt-nh3-urea-per-n') !== exactDecimal('0.18')
      || fact('ec2021-alt-nh3-other-per-n') !== exactDecimal('0.024')
      || fact('ec2021-alt-n2-per-n') !== exactDecimal('0.09')
      || displayedDecimal(no3From10N, 1) !== '13.3'
      || displayedDecimal(nh3From10N, 1) !== '1.2'
      || displayedDecimal(marFrom10N, 2) !== '3.12'
      || displayedDecimal(terFrom10N, 2) !== '16.16'
      || !(fact('lcimpact-ch9-global-cf-soil') < fact('lcimpact-ch9-europe-cf-soil')))
    throw new Error('Eutrophication pathways lost N-to-soil prohibition or Tier 1 10 kg N ledger invariants');

  const nSoilClaim = uniqueRecord(catalog.claims, 'cl-eutro129-nitrogen-soil-prohibition');
  if (!nSoilClaim?.text.includes('允许建入土壤的氮流为 ' + raw('ec2021-n-to-soil-allowed') + ' 条')
      || !nSoilClaim?.text.includes('氧化亚氮 ' + raw('ec2021-tier1-n2o-per-n') + ' kg N₂O/kg N')
      || !nSoilClaim?.text.includes('氨挥发 ' + raw('ec2021-tier1-nh3-synth-per-n') + ' kg NH₃/kg N（合成氮肥）或 '
        + raw('ec2021-tier1-nh3-manure-per-n') + ' kg NH₃/kg N（粪肥），以及水体硝酸根淋溶 '
        + raw('ec2021-tier1-no3-per-n') + ' kg NO₃⁻/kg N')
      || !nSoilClaim?.text.includes('基础硝酸根损失 ' + raw('ec2021-alt-no3-base-per-n')
        + ' kg NO₃⁻/kg N，尿素、硝酸铵与其他合成肥氨挥发分别为 ' + raw('ec2021-alt-nh3-urea-per-n') + '、'
        + raw('ec2021-tier1-nh3-synth-per-n') + ' 与 ' + raw('ec2021-alt-nh3-other-per-n')
        + ' kg NH₃/kg N，氮气反硝化 ' + raw('ec2021-alt-n2-per-n') + ' kg N₂/kg N')
      || !nSoilClaim?.text.includes('含 ' + raw('ef31-mar-total-factors') + ' 条因子的海洋富营养化 XML，还是含 '
        + raw('ef31-ter-total-factors') + ' 条因子的陆地富营养化 XML，土壤排放区室均为 '
        + raw('ef31-mar-soil-factors') + ' 条因子')
      || !nSoilClaim?.text.includes(displayedDecimal(no3From10N, 1) + ' kg NO₃⁻（乘 ' + raw('ef31-mar-no3-water-cf')
        + '）与排入空气的 ' + displayedDecimal(nh3From10N, 1) + ' kg NH₃（乘通用 ' + raw('ef31-mar-nh3-air-cf')
        + ' 与 ' + raw('ef31-ter-nh3-unloc-cf') + '）就会产生约 ' + displayedDecimal(marFrom10N, 2)
        + ' kg N 当量的海洋富营养化和 ' + displayedDecimal(terFrom10N, 2) + ' mol N 当量的无国别陆地富营养化')
      || !nSoilClaim?.text.includes('全球平均 ' + mantissaExp(fact('lcimpact-ch9-global-cf-soil'), -16, 2)
        + '×10⁻¹⁶ PDF·年/kg N（欧洲平均 ' + mantissaExp(fact('lcimpact-ch9-europe-cf-soil'), -16, 3) + '×10⁻¹⁶ PDF·年/kg N）'))
    throw new Error('Eutrophication pathways changed the displayed nitrogen soil prohibition prose');

  // 5. Aquatic river-vs-sea 1:1 stoichiometry & airborne NOx rank reversals (Claim 5).
  const riverToSeaGlobalPct = mulScaled(
    ratioScaled(fact('lcimpact-ch9-global-cf-river'), fact('lcimpact-ch9-global-cf-marine')),
    100n * scale,
  );
  const riverToSeaEuropePct = mulScaled(
    ratioScaled(fact('lcimpact-ch9-europe-cf-river'), fact('lcimpact-ch9-europe-cf-marine')),
    100n * scale,
  );
  const optARiverMass = exactDecimal('1.5');
  const optBSeaMass = scale;
  const optAEf = mulScaled(optARiverMass, fact('ef31-mar-ntotal-water-cf'));
  const optBEf = mulScaled(optBSeaMass, fact('ef31-mar-ntotal-water-cf'));
  const optALc = mulScaled(optARiverMass, fact('lcimpact-ch9-global-cf-river'));
  const optBLc = mulScaled(optBSeaMass, fact('lcimpact-ch9-global-cf-marine'));
  const optCEf = mulScaled(3n * scale, fact('ef31-mar-nox-air-cf'));
  const optDEf = mulScaled(scale, fact('ef31-mar-no3-water-cf'));
  const optDLc = mulScaled(fact('ef31-mar-no3-water-cf'), fact('lcimpact-ch9-global-cf-river'));
  if (fact('ef31-mar-unlocated-factors') !== 50n * scale
      || fact('jrc109369-table7-mar-substance-groups') !== 7n * scale
      || fact('ef31-mar-cod-bod-factors') !== 0n
      || displayedDecimal(ratioScaled(14n * scale, 17n * scale), 3) !== raw('ef31-mar-nh3-water-cf')
      || displayedDecimal(ratioScaled(14n * scale, 18n * scale), 3) !== raw('ef31-mar-nh4-water-cf')
      || displayedDecimal(ratioScaled(14n * scale, 46n * scale), 3) !== raw('ef31-mar-no2ion-water-cf')
      || displayedDecimal(ratioScaled(14n * scale, 62n * scale), 3) !== raw('ef31-mar-no3-water-cf')
      || displayedDecimal(riverToSeaGlobalPct, 1) !== '47.0'
      || displayedDecimal(riverToSeaEuropePct, 1) !== '50.7'
      || !(optAEf > optBEf && optALc < optBLc)
      || fact('lcimpact-ch9-airborne-cfs') !== 0n
      || !(optCEf > 5n * optDEf && optDLc > 0n))
    throw new Error('Eutrophication pathways lost river-vs-sea or airborne-vs-aquatic N rank reversals');

  const nRevClaim = uniqueRecord(catalog.claims, 'cl-eutro129-aquatic-and-airborne-n-reversals');
  if (!nRevClaim?.text.includes('XML 的 ' + raw('ef31-mar-unlocated-factors') + ' 条无位置通用因子（覆盖 JRC109369 表 7 所列 '
        + raw('jrc109369-table7-mar-substance-groups') + ' 组含氮物质，未收化学需氧量与生化需氧量，对应 '
        + raw('ef31-mar-cod-bod-factors') + ' 条因子）')
      || !nRevClaim?.text.includes('总氮（不含 N₂）为 ' + raw('ef31-mar-ntotal-water-cf') + '、氨为 '
        + raw('ef31-mar-nh3-water-cf') + '、铵离子为 ' + raw('ef31-mar-nh4-water-cf') + '、亚硝酸根为 '
        + raw('ef31-mar-no2ion-water-cf') + '、硝酸根为 ' + raw('ef31-mar-no3-water-cf') + ' kg N 当量/kg')
      || !nRevClaim?.text.includes('（' + mantissaExp(fact('lcimpact-ch9-global-cf-river'), -16, 2)
        + '×10⁻¹⁶ PDF·年/kg N）仅为近海直排（' + mantissaExp(fact('lcimpact-ch9-global-cf-marine'), -15, 2)
        + '×10⁻¹⁵ PDF·年/kg N）的约 ' + displayedDecimal(riverToSeaGlobalPct, 1) + '%（欧洲平均亦为 '
        + mantissaExp(fact('lcimpact-ch9-europe-cf-river'), -15, 3) + '×10⁻¹⁵ 对 '
        + mantissaExp(fact('lcimpact-ch9-europe-cf-marine'), -15, 3) + '×10⁻¹⁵，约 '
        + displayedDecimal(riverToSeaEuropePct, 1) + '%）')
      || !nRevClaim?.text.includes('甲为 ' + displayedDecimal(optALc * 10n ** 15n, 3) + '×10⁻¹⁵、乙为 '
        + mantissaExp(optBLc, -15, 2) + '×10⁻¹⁵ PDF·年')
      || !nRevClaim?.text.includes('赋 ' + raw('ef31-mar-nox-air-cf') + ' kg N 当量/kg，判丙（'
        + displayedDecimal(optCEf, 3) + ' kg N 当量）高于丁（' + raw('ef31-mar-no3-water-cf') + ' kg N 当量）')
      || !nRevClaim?.text.includes('设 ' + raw('lcimpact-ch9-airborne-cfs') + ' 项大气因子），判丙为 0，丁按硝酸根含氮比 '
        + raw('ef31-mar-no3-water-cf') + ' 乘全球河流因子 ' + mantissaExp(fact('lcimpact-ch9-global-cf-river'), -16, 2)
        + '×10⁻¹⁶ 约为 ' + mantissaExp(optDLc, -16, 2) + '×10⁻¹⁶ PDF·年'))
    throw new Error('Eutrophication pathways changed the displayed aquatic/airborne N rank reversal prose');

  // 6. 540 constant <location> copies vs terrestrial NOx 4.26 > max_country 3.547 inversion (Claim 6).
  const nh3Spread = ratioScaled(fact('ef31-ter-nh3-max-ch'), fact('ef31-ter-nh3-min-ie'));
  const noxExcessPct = mulScaled(
    ratioScaled(fact('ef31-ter-nox-unloc-cf') - fact('ef31-ter-nox-max-lu'), fact('ef31-ter-nox-max-lu')),
    100n * scale,
  );
  if (fact('ef31-mar-unlocated-factors') + fact('ef31-mar-location-factors') !== fact('ef31-mar-total-factors')
      || fact('ef31-ter-unlocated-factors') + fact('ef31-ter-location-factors') !== fact('ef31-ter-total-factors')
      || fact('ef31-mar-location-factors') !== 15n * fact('ef31-ter-country-codes')
      || fact('ef31-ter-location-factors') !== 15n * fact('ef31-ter-country-codes')
      || fact('ef31-mar-no-air-cf') !== exactDecimal('0.596')
      || fact('ef31-mar-nh4-air-cf') !== exactDecimal('0.087')
      || fact('ef31-mar-no3-air-cf') !== exactDecimal('0.028')
      || fact('ef31-ter-no-unloc-cf') !== exactDecimal('6.532')
      || !(fact('ef31-ter-nox-min-gr') < fact('ef31-ter-nox-max-lu')
        && fact('ef31-ter-nox-max-lu') < fact('ef31-ter-no2-uair-max-lu')
        && fact('ef31-ter-no2-uair-max-lu') < fact('ef31-ter-nox-unloc-cf'))
      || !(fact('ef31-ter-nh3-min-ie') < fact('ef31-ter-nh3-unloc-cf')
        && fact('ef31-ter-nh3-unloc-cf') < fact('ef31-ter-nh3-max-ch'))
      || displayedDecimal(nh3Spread, 1) !== '19.5'
      || displayedDecimal(noxExcessPct, 1) !== '20.1')
    throw new Error('Eutrophication pathways lost 540 location copy or terrestrial NOx > max_country invariants');

  const locClaim = uniqueRecord(catalog.claims, 'cl-eutro129-location-copies-and-nox-inversion');
  if (!locClaim?.text.includes('含空气一氧化氮 ' + raw('ef31-mar-no-air-cf') + '、空气铵 ' + raw('ef31-mar-nh4-air-cf')
        + '、空气硝酸根 ' + raw('ef31-mar-no3-air-cf') + ' kg N 当量/kg')
      || !locClaim?.text.includes('覆盖 ' + raw('ef31-ter-country-codes') + ' 个欧洲国家或地区代码的 '
        + raw('ef31-mar-location-factors') + ' 条位置代码（location）记录')
      || !locClaim?.text.includes('（' + raw('ef31-ter-unlocated-factors') + ' 条通用行加同样 '
        + raw('ef31-ter-country-codes') + ' 个欧洲代码的 ' + raw('ef31-ter-location-factors') + ' 条分国行）')
      || !locClaim?.text.includes('最低爱尔兰 ' + raw('ef31-ter-nh3-min-ie') + ' 到最高瑞士 ' + raw('ef31-ter-nh3-max-ch')
        + ' mol N 当量/kg 横跨约 ' + displayedDecimal(nh3Spread, 1) + ' 倍')
      || !locClaim?.text.includes('（' + raw('ef31-ter-nox-unloc-cf') + ' mol N 当量/kg；无位置一氧化氮为 '
        + raw('ef31-ter-no-unloc-cf') + '）')
      || !locClaim?.text.includes('最低希腊 ' + raw('ef31-ter-nox-min-gr') + '，最高卢森堡在氮氧化物与四个常规二氧化氮子区室为 '
        + raw('ef31-ter-nox-max-lu') + '、仅高空二氧化氮四舍五入为 ' + raw('ef31-ter-no2-uair-max-lu') + '），比全欧最高国别值还高出约 '
        + displayedDecimal(noxExcessPct, 1) + '%'))
    throw new Error('Eutrophication pathways changed the displayed location copy and NOx inversion prose');

  // 7. Normalization double-counting & XML/report anomalies (Claim 7).
  const pop = fact('ef31-nf-pop');
  const soilFertPEq = mulScaled(fact('ef31-nf-r1406-fert-p-soil-mass'), fact('ef31-fw-p-soil-cf'));
  const soilManurePEq = mulScaled(fact('ef31-nf-r1407-manure-p-soil-mass'), fact('ef31-fw-p-soil-cf'));
  const soilPSubtotal = soilFertPEq + soilManurePEq;
  const agWaterPEq = mulScaled(fact('ef31-nf-r1408-ag-p-water-mass'), fact('ef31-fw-p-water-cf'));
  const wwtpWaterPEq = mulScaled(fact('ef31-nf-r1409-wwtp-p-water-mass'), fact('ef31-fw-p-water-cf'));
  const totalFwPEq = soilPSubtotal + agWaterPEq + wwtpWaterPEq;
  const calcNfFw = ratioScaled(totalFwPEq, pop);
  const soilPPerCap = ratioScaled(soilPSubtotal, pop);
  const soilPSharePct = mulScaled(ratioScaled(soilPSubtotal, totalFwPEq), 100n * scale);
  const oitaNo3NEq = mulScaled(fact('ef31-nf-r1283-no3-water-mass'), fact('ef31-mar-no3-water-cf'));
  const agWaterNEq = mulScaled(fact('ef31-nf-r1288-ag-n-water-mass'), fact('ef31-mar-ntotal-water-cf'));
  const wwtpWaterNEq = mulScaled(fact('ef31-nf-r1289-wwtp-n-water-mass'), fact('ef31-mar-ntotal-water-cf'));
  if (displayedDecimal(calcNfFw, 12) !== displayedDecimal(fact('ef31-nf-fw-exact'), 12)
      || mantissaExp(soilPSubtotal, 9, 2) !== '1.73'
      || displayedDecimal(soilPPerCap, 4) !== '0.2509'
      || displayedDecimal(soilPSharePct, 1) !== '15.6'
      || mantissaExp(oitaNo3NEq, 10, 3) !== '1.695'
      || mantissaExp(agWaterNEq, 10, 2) !== '5.92'
      || mantissaExp(wwtpWaterNEq, 9, 3) !== '9.691'
      || fact('jrc130796-nf-eutro-rel-diff-pct') !== 0n
      || fact('ef31-fw-xml-bytes') !== 26005n * scale
      || fact('ef31-mar-xml-bytes') !== 330296n * scale
      || fact('ef31-ter-xml-bytes') !== 328944n * scale
      || fact('ef31-eutro-converter-copies') !== 0n
      || fact('ef31-fw-dup-phosphorus-flows') !== 2n * scale
      || fact('ef31-fw-declared-inventory-items') !== 3n * scale
      || fact('ef31-mar-declared-inventory-items') !== 7n * scale
      || fact('ef31-ter-declared-inventory-items') !== 6n * scale
      || fact('ef31-struijs-source-year') !== 2008n * scale
      || fact('ef31-ter-empty-loc-tags') + fact('ef31-ter-omitted-loc-tags') !== fact('ef31-ter-unlocated-factors')
      || fact('ef31-ter-empty-loc-tags') !== 27n * scale
      || fact('ef31-ter-omitted-loc-tags') !== 8n * scale
      || displayedDecimal(fact('ef31-ter-nh4-unrounded'), 4) !== raw('ef31-ter-nh4-rounded')
      || fact('ef31-ter-nh4-unrounded') === fact('ef31-ter-nh4-rounded')
      || displayedDecimal(fact('ef31-ter-no3-unrounded'), 5) !== raw('ef31-ter-no3-rounded')
      || fact('ef31-ter-no3-unrounded') === fact('ef31-ter-no3-rounded')
      || fact('jrc130796-t13-ter-4th') !== fact('jrc130796-t13-ter-5th-dup')
      || fact('jrc130796-t13-fw-4th') !== fact('jrc130796-t13-fw-5th-dup')
      || fact('jrc130796-t13-mar-4th') !== fact('jrc130796-t13-mar-5th-dup')
      || fact('jrc130796-t13-ter-4th') !== 152n * scale
      || fact('jrc130796-t13-fw-4th') !== 8n * scale
      || fact('jrc130796-t13-mar-4th') !== 201n * scale)
    throw new Error('Eutrophication pathways lost NF workbook double-counting or XML/Table 13 anomaly invariants');

  const nfClaim = uniqueRecord(catalog.claims, 'cl-eutro129-normalization-double-counting-and-xml-anomalies');
  if (!nfClaim?.text.includes('2010 年全球基准人口 ' + raw('ef31-nf-pop') + ' 人')
      || !nfClaim?.text.includes('精确值 ' + displayedDecimal(fact('ef31-nf-fw-exact'), 4) + ' kg P 当量/人，较 EF 3.0 变动 '
        + raw('jrc130796-nf-eutro-rel-diff-pct') + '%）')
      || !nfClaim?.text.includes(mantissaExp(fact('ef31-nf-r1406-fert-p-soil-mass'), 10, 2) + '×10¹⁰ kg 与粪肥施磷 '
        + mantissaExp(fact('ef31-nf-r1407-manure-p-soil-mass'), 10, 2) + '×10¹⁰ kg 并乘土壤因子 ' + raw('ef31-fw-p-soil-cf')
        + '（合 ' + mantissaExp(soilPSubtotal, 9, 2) + '×10⁹ kg P 当量）')
      || !nfClaim?.text.includes(mantissaExp(fact('ef31-nf-r1408-ag-p-water-mass'), 9, 3) + '×10⁹ kg 并乘水体因子 '
        + raw('ef31-fw-p-water-cf') + '（另加第 1409 行污水处理厂 '
        + mantissaExp(fact('ef31-nf-r1409-wwtp-p-water-mass'), 9, 3) + '×10⁹ kg）')
      || !nfClaim?.text.includes('+' + displayedDecimal(soilPPerCap, 4) + ' kg P 当量/人（占官方基准的 '
        + displayedDecimal(soilPSharePct, 1) + '%）')
      || !nfClaim?.text.includes(mantissaExp(fact('ef31-nf-r1283-no3-water-mass'), 10, 2) + '×10¹⁰ kg（乘 '
        + raw('ef31-mar-no3-water-cf') + ' 得 ' + mantissaExp(oitaNo3NEq, 10, 3) + '×10¹⁰ kg N 当量）')
      || !nfClaim?.text.includes(mantissaExp(fact('ef31-nf-r1288-ag-n-water-mass'), 10, 2) + '×10¹⁰ kg（乘 '
        + raw('ef31-mar-ntotal-water-cf') + '，另加第 1289 行污水处理厂 '
        + mantissaExp(fact('ef31-nf-r1289-wwtp-n-water-mass'), 9, 3) + '×10⁹ kg）')
      || !nfClaim?.text.includes('收录 ' + raw('ef31-fw-dup-phosphorus-flows') + ' 条同名同 CAS 号的淡水单质磷流 UUID')
      || !nfClaim?.text.includes('分别填作 ' + raw('ef31-fw-declared-inventory-items') + '、'
        + raw('ef31-mar-declared-inventory-items') + '、' + raw('ef31-ter-declared-inventory-items'))
      || !nfClaim?.text.includes('Struijs 等 ' + raw('ef31-struijs-source-year') + ' 年')
      || !nfClaim?.text.includes('拆成 ' + raw('ef31-ter-empty-loc-tags') + ' 条空位置标签与 '
        + raw('ef31-ter-omitted-loc-tags') + ' 条省略位置标签')
      || !nfClaim?.text.includes('空气铵（' + raw('ef31-ter-nh4-unrounded') + ' 对 ' + raw('ef31-ter-nh4-rounded')
        + '）与硝酸根（' + raw('ef31-ter-no3-unrounded') + ' 对 ' + raw('ef31-ter-no3-rounded') + '）')
      || !nfClaim?.text.includes('（三项富营养化均为 ' + raw('jrc130796-t13-ter-4th') + ' 与 '
        + raw('jrc130796-t13-ter-5th-dup') + '、' + raw('jrc130796-t13-fw-4th') + ' 与 '
        + raw('jrc130796-t13-fw-5th-dup') + '、' + raw('jrc130796-t13-mar-4th') + ' 与 '
        + raw('jrc130796-t13-mar-5th-dup') + '）'))
    throw new Error('Eutrophication pathways changed the displayed NF double-counting and XML anomaly prose');

  // 8. Five-step operational synthesis & smooth handoff to multi-pathway air precursors (Claim 8).
  const synthClaim = uniqueRecord(catalog.claims, 'cl-eutro129-operational-synthesis');
  if (!synthClaim?.text.includes('合计占 EF 3.1 综合权重 ' + displayedDecimal(wfSumPct, 2) + '%')
      || !synthClaim?.text.includes('排除大气氮（' + raw('lcimpact-ch9-airborne-cfs') + ' 项因子）')
      || !synthClaim?.text.includes('EF 土壤因子（' + raw('ef31-fw-p-soil-cf') + '）与 ReCiPe 土壤因子或 UNEP 清单损失率（'
        + raw('rivm-fep-p-agsoil') + '）的 ' + displayedDecimal(soilModelRatio, 0) + ' 倍模型差')
      || !synthClaim?.text.includes('误折为 ' + raw('rivm-fep-p2o5-fw-printed') + ' 的印本笔误')
      || !synthClaim?.text.includes('N₂O（' + raw('ec2021-tier1-n2o-per-n') + '）、NH₃（'
        + raw('ec2021-tier1-nh3-synth-per-n') + ' 或 ' + raw('ec2021-tier1-nh3-manure-per-n')
        + '）与水体 NO₃⁻（' + raw('ec2021-tier1-no3-per-n') + '）')
      || !synthClaim?.text.includes('内陆河流约 ' + displayedDecimal(riverToSeaGlobalPct, 1) + '% 输海折减')
      || !synthClaim?.text.includes('无国别 NOx（' + raw('ef31-ter-nox-unloc-cf') + '）反超 36 国最高值（'
        + raw('ef31-ter-nox-max-lu') + '）')
      || !synthClaim?.text.includes('含约 ' + displayedDecimal(soilPSharePct, 1) + '% 农田双重计入'))
    throw new Error('Eutrophication pathways changed the displayed five-step operational synthesis prose');

  if (consumed.size !== facts.size) {
    const unused = [...facts.keys()].filter(k => !consumed.has(k));
    throw new Error(`Eutrophication pathways left unverified numeric facts: ${unused.join(', ')}`);
  }
}

const requiredLinks = {
  'category-genealogy': [
    ['ev-eutro129-ilcd2011-eutro', 'supports'],
    ['ev-eutro129-glam2019-eutro', 'supports'],
    ['ev-eutro129-ec2021-field-rules', 'supports'],
    ['ev-eutro129-ef31-nf-eutro', 'supports'],
    ['ev-eutro129-rivm-ch8-s4', 'supports'],
    ['ev-eutro129-recipe2017-eutro', 'supports'],
    ['ev-eutro129-lcimpact2020-eutro', 'supports'],
    ['ev-eutro129-lcimpact-ch8-fw', 'supports'],
    ['ev-eutro129-lcimpact-ch9-marine', 'supports'],
  ],
  'phosphorus-soil-water-interface': [
    ['ev-eutro129-glam2019-eutro', 'supports'],
    ['ev-eutro129-ec2021-field-rules', 'supports'],
    ['ev-eutro129-ef31-eutro-xmls', 'supports'],
    ['ev-eutro129-rivm-ch8-s4', 'supports'],
    ['ev-eutro129-lcimpact-ch8-fw', 'supports'],
  ],
  'phosphorus-stoichiometry-and-p2o5': [
    ['ev-eutro129-jrc109369-eutro', 'supports'],
    ['ev-eutro129-ef31-eutro-xmls', 'supports'],
    ['ev-eutro129-rivm-ch8-s4', 'supports'],
  ],
  'nitrogen-soil-prohibition': [
    ['ev-eutro129-ec2021-field-rules', 'supports'],
    ['ev-eutro129-ef31-eutro-xmls', 'supports'],
    ['ev-eutro129-lcimpact-ch9-marine', 'supports'],
  ],
  'aquatic-and-airborne-n-reversals': [
    ['ev-eutro129-jrc109369-eutro', 'supports'],
    ['ev-eutro129-ef31-eutro-xmls', 'supports'],
    ['ev-eutro129-rivm-ch8-s4', 'supports'],
    ['ev-eutro129-lcimpact-ch9-marine', 'supports'],
  ],
  'location-copies-and-nox-inversion': [
    ['ev-eutro129-ef31-eutro-xmls', 'supports'],
    ['ev-eutro129-ef31-nf-eutro', 'supports'],
  ],
  'normalization-double-counting-and-xml-anomalies': [
    ['ev-eutro129-ec2021-field-rules', 'supports'],
    ['ev-eutro129-jrc130796-eutro', 'supports'],
    ['ev-eutro129-ef31-eutro-xmls', 'supports'],
    ['ev-eutro129-ef31-nf-eutro', 'supports'],
  ],
  'operational-synthesis': [
    ['ev-eutro129-ec2021-field-rules', 'supports'],
    ['ev-eutro129-ef31-eutro-xmls', 'supports'],
    ['ev-eutro129-ef31-nf-eutro', 'supports'],
    ['ev-eutro129-rivm-ch8-s4', 'supports'],
    ['ev-eutro129-lcimpact-ch9-marine', 'supports'],
  ],
};

function validateSupportLinks(catalog) {
  const claimEntries = Object.entries(requiredLinks);
  if (catalog.claims.filter(row => row.id.startsWith('cl-eutro129-')).length !== claimEntries.length)
    throw new Error('Eutrophication pathways claim count differs from its pinned claim inventory');
  for (const [claimName, expectedLinks] of claimEntries) {
    const id = 'cl-eutro129-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.status !== 'reviewed' || claim?.reviewKind !== 'agent-source-check'
        || !scienceText(claim?.scope) || !scienceText(claim?.reasoning)
        || !Array.isArray(claim?.caveats) || !claim.caveats.length || !claim.caveats.every(scienceText)
        || !sameScienceValue(claim?.conceptIds, []) || !sameScienceValue(claim?.mappingIds, []))
      throw new Error(`Eutrophication pathways claim lacks reviewed status, caveats or bounded conceptIds/mappingIds: ${id}`);
    if (claim?.evidenceIds?.length !== expectedLinks.length || claim?.evidenceLinks?.length !== expectedLinks.length)
      throw new Error(`Eutrophication pathways changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of expectedLinks) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation
          || !scienceText(links[0].rationale))
        throw new Error(`Eutrophication pathways lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
