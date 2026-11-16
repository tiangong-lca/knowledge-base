import { editionDigest } from './reader-current-edition.mjs';
import { sameScienceValue } from './reader-scientific-delta.mjs';

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
    sourceId: 'src-ozrad121-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozrad121-ef-method-ir',
      mediaType: 'application/xml',
      sha256: '69f7a44f3e0682e11c882d77936b5f8f79951795ac775e3e99ea975e14e7c59e',
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
};

const efSelectedMembers = [
  ['art-ozone119-ef-method-odp', 'e64477a1b282ce934a9fbeb456601589fca88c3d160289dc9680d4f1d261ead4'],
  ['art-flow-pilot-ef-6209b35f', 'c0fe31d3c045ae85b64bd85a3bfa41e1f246d664e8f8d463005f37dee003a5a8'],
  ['art-flow99-ef-mass', '8fed3fee7b905fe5eb1099880810842f32226966bad658cf25c4be49581e5eb4'],
  ['art-ozrad121-ef-method-ir', '69f7a44f3e0682e11c882d77936b5f8f79951795ac775e3e99ea975e14e7c59e'],
  ['art-ozrad121-ef-prop-radioactivity', 'd2decea42f26631a5a46fe20a5626fc9c44933ef689a0306e28f9782183b5d9f'],
  ['art-ozrad121-ef-flow-cfc11', '60efeaa739a466010f3b3dbf86d94448ca400ad15a209e68782a51a16bb02133'],
  ['art-ozrad121-ef-flow-cfc12', 'ce8a71e2c0c92cf8edbc492e347453a46f1bcc01738418c0bfa6f8ebee95c43e'],
  ['art-ozrad121-ef-flow-halon1301', '2023b411952606d7ca57f14e2aceac05382142e5d4d573cadbc8ca971db46c5b'],
  ['art-ozrad121-ef-flow-halon1211', '70cfe291ee2f7543815c443a1f5245a59f11a852d2d268322d6e13d19637574e'],
  ['art-ozrad121-ef-flow-halon2402', '99ab8b2d68cbd5e61420c2f653e3ceddb81dbc4d633e2a2af5c8de18f1cd2d40'],
  ['art-ozrad121-ef-flow-hcfc22', 'ad25d5bfb9560e5dd4e300a10e05f66e7d698357e95317cd2f111d46f89ca991'],
  ['art-ozrad121-ef-flow-cfc10', '4c865fd6762a15aa2e957b66fbe4433393b5fa9b1be5c30aab7a02400a20b420'],
  ['art-ozrad121-ef-flow-ccl4', 'c013543a2309636f17a1000ec60f00e0856b6986f23a0454bca57f06bb4c5dad'],
  ['art-ozrad121-ef-flow-halon1001', 'd873ee12f2bb408f1a30f6998fec2ff6e92221dc5307ede0ab4d4fe9971c816a'],
  ['art-ozrad121-ef-flow-methyl-bromide', 'aa2942f194f15a7175207367675f5ad7fa404b72317bf8a28df9b28ff0317ac3'],
  ['art-ozrad121-ef-flow-n2o', 'e9c30654226dd36c5fb86226e7091b492c70bb375aebc20a057124e8e83607bb'],
  ['art-ozrad121-ef-flow-u235-air', '4b4ab232e7a8a84e72d6da59f38706aefe43849992dcb6f275901d7adbc18841'],
  ['art-ozrad121-ef-flow-co60-air', 'c31c79082cf60212fbcbe22b412f1e22f30668012495451395dfd11213354914'],
  ['art-ozrad121-ef-flow-co60-fw', '96f77acc80b49a22488f4a1c8ee02989d38c5cdf62e9196bf57b13a218e744bf'],
  ['art-ozrad121-ef-flow-co60-sw', 'c2b2af039cded75b354d75f3a3cffeb11712cffc033a7b8bdb499f62e6c3f52f'],
  ['art-ozrad121-ef-flow-c14-air', '0d9891cb775fe690c70bc5ec35c73b8e887c96a4a271312c10a222ecb4af178c'],
  ['art-ozrad121-ef-flow-cs137-air', '58d3a96b8c154fa7604937e0065c09c5efa29177bf32e25e353d5a4a11096264'],
  ['art-ozrad121-ef-flow-cs137-fw', 'b5557ba8744093778a650b4e442eaeee5199419914f7ba2bda003f6625ac84d2'],
  ['art-ozrad121-ef-flow-cs137-sw', '004fc8842b8c5d5bc0318909dca703b13162916fa881479ba127644ee4be4e99'],
  ['art-ozrad121-ef-flow-i129-air', '02970039106024179ef3d6dff0c9c8b08be5c2bae87d5356fc62039aff989c27'],
  ['art-ozrad121-ef-flow-rn222-air', 'eced45e4d016a7a265f24bb9cd60d030501af049ffc9d85adb5ac9527f11eaea'],
];

const evidenceRows = [
  ['ilcd2011-odp', 'ilcd', 'psg-ozrad121-ilcd2011-odp', null,
    'c675bba388bf8a74bfdbad60d8543e47da1dfde1d2d4aa4ba0eeab2edfde2d45'],
  ['ilcd2011-ir', 'ilcd', 'psg-ozrad121-ilcd2011-ir', null,
    'ab918d8c8bddaaed46442965d32884cbf44cbd50fa115111656430e91b0e3b3a'],
  ['jrc109369-odp', 'jrc109369', 'psg-ozrad121-jrc109369-odp', null,
    'a03aa91feda9ea86a84060989ea03d7fb51afbff0e59758bc02bae56b63cd4f5'],
  ['jrc109369-ir', 'jrc109369', 'psg-ozrad121-jrc109369-ir', null,
    '1dfadf44212663cd39aded10741f2677192bc76804e4b86cba32ec402921fb8a'],
  ['jrc130796-odp-ir', 'jrc130796', 'psg-ozrad121-jrc130796-odp-ir', null,
    '4d023d743cf768cfcd5c113e2a619cc8bba4c0611e8a1333b4379d7c1b5a0d21'],
  ['ef31-odp-xml', 'ef31', 'psg-ozrad121-ef31-odp-method', 'art-ozone119-ef-method-odp',
    '560f2c3a6250861c2f181d66e836441094b1f2af067815bc9c047f660b4c7b71'],
  ['ef31-ir-xml', 'ef31', 'psg-ozrad121-ef31-ir-method', 'art-ozrad121-ef-method-ir',
    '3a90878155d2aeb5822ec4ed1079647a912c7f603c3a45aa96c87f75ea622e8a'],
  ['rivm-ch3-odp-tables', 'rivm', 'psg-ozrad121-rivm-ch3-odp', null,
    '9f1b195b2b91198d844fe219e151e5c1a2965f7581160f8cd1c4b476b606991e'],
  ['rivm-ch4-ir-tables', 'rivm', 'psg-ozrad121-rivm-ch4-ir', null,
    '50aae9f74c0aeaa56d3148b9f0ddd83975b75a761c6e37a782c980ccdeaeaa63'],
  ['recipe2017-summary', 'recipe2017', 'psg-ozrad121-recipe2017-odp-ir', null,
    'd90149dd8b1ed8ca0461fbe80d9c985c531f7086476443aa00bdf7dbe8dc2d0b'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateOzoneRadiationFactors(catalog, readings) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-ozrad121-')).length !== evidenceRows.length)
    throw new Error('Ozone and radiation evidence count differs from its pinned row inventory');
  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...defaultSourceArtifact } = expected.artifact;
    const expectedSourceArtifact = expected.sourceArtifact ?? defaultSourceArtifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Ozone and radiation changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, sha] of efSelectedMembers) {
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), { id, mediaType: 'application/xml', sha256: sha, resolvedUrl: efUrl }))
      throw new Error(`Ozone and radiation changed a verified EF 3.1 XML member: ${id}`);
  }

  const facts = new Map();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-ozrad121-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || record.sourceId !== expected.sourceId || record.readingId !== expected.readingId
        || record.passageId !== passageId || passage.artifactId !== expectedArtifactId)
      throw new Error(`Ozone and radiation changed the selected row or support passage: ${id}`);
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
    if (editionDigest(identity) !== digest)
      throw new Error(`Ozone and radiation changed the selected row or support passage: ${id}`);
    if (record.numericFact) facts.set(name, record.numericFact.value);
    for (const item of record.numericFacts ?? []) {
      if (facts.has(item.id)) throw new Error(`Ozone and radiation duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== 91) throw new Error(`Ozone and radiation expected 91 verified numeric facts, got ${facts.size}`);
  validateCalculations(facts, catalog);
  validateSupportLinks(catalog);
}

const scale = 10n ** 24n;

function exactDecimal(value) {
  const negative = value.startsWith('-');
  const clean = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = clean.split('.');
  const parsed = BigInt(whole + fraction.padEnd(24, '0'));
  return negative ? -parsed : parsed;
}

function ratioScaled(numerator, denominator) {
  return (numerator * scale + denominator / 2n) / denominator;
}

function displayedDecimal(scaledValue, places) {
  if (places === 0) return ((scaledValue + scale / 2n) / scale).toString();
  const step = 10n ** BigInt(24 - places);
  const rounded = ((scaledValue + step / 2n) / step).toString().padStart(places + 1, '0');
  return rounded.slice(0, -places) + '.' + rounded.slice(-places);
}

function validateCalculations(facts, catalog) {
  const fact = id => {
    const raw = facts.get(id);
    if (raw === undefined) throw new Error(`Ozone and radiation missing numeric fact: ${id}`);
    return exactDecimal(raw);
  };

  // 1. Reference scopes: N2O inclusion vs EF 3.1 omission, Frischknecht 2000 14:11 collective-dose ratio, and air/water medium contrasts.
  if (fact('ef31-odp-cfc11') !== scale || fact('ef31-cc-n2o') !== 273n * scale)
    throw new Error('Ozone and radiation lost CFC-11 unit reference or EF 3.1 N2O GWP100 = 273.0');
  if (!(fact('rivm-odp-n2o-20') > 0n
        && fact('rivm-odp-n2o-20') < fact('rivm-odp-n2o-100')
        && fact('rivm-odp-n2o-100') < fact('rivm-odp-n2o-inf')))
    throw new Error('Ozone and radiation lost ReCiPe 2016 preliminary N2O horizon progression');

  const scale14Over11 = val => (val * 14n + 5n) / 11n;
  if (fact('ef31-ir-u235-air') !== scale
      || fact('rivm-ir-co60-air') !== scale
      || displayedDecimal(ratioScaled(11n * scale, 14n * scale), 3) !== facts.get('ef31-ir-co60-air')
      || displayedDecimal(scale14Over11(fact('ef31-ir-u235-air')), 2) !== facts.get('rivm-ir-u235-air-e')
      || displayedDecimal(scale14Over11(fact('ef31-ir-cs134-air')), 3) !== facts.get('rivm-ir-cs134-air')
      || displayedDecimal(scale14Over11(fact('ef31-ir-rn222-air')), 5) !== facts.get('rivm-ir-rn222-air')
      || displayedDecimal(scale14Over11(fact('ef31-ir-u238-air')), 3) !== facts.get('rivm-ir-u238-air-e')
      || displayedDecimal(scale14Over11(fact('ef31-ir-u234-air')), 2) !== facts.get('rivm-ir-u234-air-e')
      || !(fact('ef31-ir-u235-fw') > 0n && fact('ef31-ir-u235-fw') < fact('ef31-ir-u235-air'))
      || !(fact('ef31-ir-co60-fw') > fact('ef31-ir-co60-air') && fact('ef31-ir-co60-air') > fact('ef31-ir-co60-sw'))
      || !(fact('rivm-ir-co60-fw') > fact('rivm-ir-co60-air') && fact('rivm-ir-co60-air') > fact('rivm-ir-co60-marine')))
    throw new Error('Ozone and radiation lost Frischknecht 2000 14:11 reference scaling or Co-60/U-235 medium hierarchy');

  const efCsRatio = ratioScaled(fact('ef31-ir-cs137-fw'), fact('ef31-ir-cs137-sw'));
  const rivmCsRatio = ratioScaled(fact('rivm-ir-cs137-fw-100'), fact('rivm-ir-cs137-marine'));
  if (!(efCsRatio > 2000n * scale && rivmCsRatio > 1700n * scale && rivmCsRatio < 2000n * scale
        && fact('ef31-ir-c14-air') > 100n * fact('ef31-ir-c14-water')))
    throw new Error('Ozone and radiation lost Cs-137 or C-14 freshwater/air/seawater medium contrasts');

  const refClaim = uniqueRecord(catalog.claims, 'cl-ozrad121-reference-scope');
  const expectedN2oClause = '氧化亚氮（N₂O，原表标星号列为初步估计，三列依次为 '
    + facts.get('rivm-odp-n2o-20') + '、' + facts.get('rivm-odp-n2o-100') + '、' + facts.get('rivm-odp-n2o-inf')
    + ' kg CFC-11 当量/kg）；而 EF 3.1 官方臭氧耗竭方法数据集完全未收氧化亚氮——同一个氧化亚氮空气流在同包气候变化方法中赋 '
    + facts.get('ef31-cc-n2o') + ' kg CO₂ 当量/kg';
  const expected14Over11Clause = '故 EF 3.1 中铀-235 排入空气为 ' + facts.get('ef31-ir-u235-air')
    + '、钴-60 排入空气为 ' + facts.get('ef31-ir-co60-air')
    + '，乘 14/11（约 ' + displayedDecimal(ratioScaled(14n * scale, 11n * scale), 3)
    + '）恰好对应 ReCiPe 2016 平等主义（10 万年）列的铀-235 空气因子 ' + facts.get('rivm-ir-u235-air-e')
    + '，以及钴-60 淡水（' + facts.get('ef31-ir-co60-fw') + ' 对 ' + facts.get('rivm-ir-co60-fw')
    + '）、铯-134 空气（' + facts.get('ef31-ir-cs134-air') + ' 对 ' + facts.get('rivm-ir-cs134-air')
    + '）、氡-222 空气（' + facts.get('ef31-ir-rn222-air') + ' 对 ' + facts.get('rivm-ir-rn222-air') + '）';
  const expectedCsClause = 'EF 3.1 中 1 kBq 铯-137 排入淡水为 ' + facts.get('ef31-ir-cs137-fw')
    + '、排入空气为 ' + facts.get('ef31-ir-cs137-air')
    + '、排入海水仅 ' + facts.get('ef31-ir-cs137-sw')
    + ' kBq U-235 当量（ReCiPe 2016 等级主义与平等主义列依次为 ' + facts.get('rivm-ir-cs137-fw-100')
    + '、' + facts.get('rivm-ir-cs137-air-100') + '、' + facts.get('rivm-ir-cs137-marine')
    + '），在 EF 3.1 中淡水与海水相差逾两千倍（ReCiPe 2016 中亦逾 1700 倍）；反过来，以气态二氧化碳形式参与全球光合作用的碳-14 排入空气高达 '
    + facts.get('ef31-ir-c14-air') + ' kBq U-235 当量/kBq，排入淡水或海水却只有 ' + facts.get('ef31-ir-c14-water') + '。';
  if (!refClaim?.text.includes(expectedN2oClause)
      || !refClaim?.text.includes(expected14Over11Clause)
      || !refClaim?.text.includes(expectedCsClause))
    throw new Error('Ozone and radiation changed the displayed reference-scope comparison');

  // 2. ODP horizons, EF 3.1 WMO 2014 halocarbon hierarchy, and controlled rank reversals.
  if (!(fact('ef31-odp-cfc11') > fact('ef31-odp-cfc113')
        && fact('ef31-odp-cfc113') > fact('ef31-odp-cfc12')
        && fact('ef31-odp-cfc12') > fact('ef31-odp-ccl4')
        && fact('ef31-odp-ccl4') > fact('ef31-odp-ch3br')
        && fact('ef31-odp-ch3br') > fact('ef31-odp-cfc114')
        && fact('ef31-odp-cfc114') > fact('ef31-odp-cfc115')
        && fact('ef31-odp-cfc115') > fact('ef31-odp-hcfc22')
        && fact('ef31-odp-halon2402') > fact('ef31-odp-halon1301')
        && fact('ef31-odp-halon1301') > fact('ef31-odp-halon1211')))
    throw new Error('Ozone and radiation lost EF 3.1 WMO 2014 halocarbon ordering');

  const halonLead20 = ratioScaled(
    (fact('rivm-odp-halon1211-20') - fact('rivm-odp-halon1301-20')) * 100n,
    fact('rivm-odp-halon1301-20'),
  );
  const optB_ef = fact('ef31-odp-hcfc22') / 5n;
  const optB_20 = fact('rivm-odp-hcfc22-20') / 5n;
  const optB_100 = fact('rivm-odp-hcfc22-100') / 5n;
  const optB_inf = fact('rivm-odp-hcfc22-inf') / 5n;
  if (!(fact('rivm-odp-halon1211-20') > fact('rivm-odp-halon1301-20')
        && displayedDecimal(halonLead20, 0) === '27'
        && fact('rivm-odp-halon1211-100') < fact('rivm-odp-halon1301-100')
        && fact('rivm-odp-halon1211-inf') < fact('rivm-odp-halon1301-inf')
        && fact('rivm-odp-ch3br-20') > scale && fact('rivm-odp-ch3br-20') > fact('rivm-odp-ch3br-100')
        && fact('rivm-odp-ch3br-100') > fact('rivm-odp-ch3br-inf')
        && fact('rivm-odp-cfc115-20') < fact('rivm-odp-cfc115-100')
        && fact('rivm-odp-cfc115-100') < fact('rivm-odp-cfc115-inf')
        && fact('rivm-odp-cfc12-20') < fact('rivm-odp-cfc12-100')
        && fact('rivm-odp-cfc12-100') < fact('rivm-odp-cfc12-inf')
        && 0n < optB_ef
        && fact('rivm-odp-n2o-20') < optB_20
        && fact('rivm-odp-n2o-100') > optB_100
        && fact('rivm-odp-n2o-inf') > optB_inf
        && fact('rivm-odp-halon1301-inf') > fact('rivm-odp-halon2402-inf')
        && fact('ef31-odp-halon1301') < fact('ef31-odp-halon2402')))
    throw new Error('Ozone and radiation lost ODP horizon or WMO edition order reversals');

  const odpClaim = uniqueRecord(catalog.claims, 'cl-ozrad121-odp-horizons');
  const expectedHalonClause = '在 ReCiPe 2016 的 20 年窗口下为 ' + facts.get('rivm-odp-halon1211-20')
    + ' 对 ' + facts.get('rivm-odp-halon1301-20') + ' kg CFC-11 当量（前者高约 '
    + displayedDecimal(halonLead20, 0) + '%），拉长到 100 年（' + facts.get('rivm-odp-halon1211-100')
    + ' 对 ' + facts.get('rivm-odp-halon1301-100') + '）与无限期（' + facts.get('rivm-odp-halon1211-inf')
    + ' 对 ' + facts.get('rivm-odp-halon1301-inf') + '）后却彻底反转为后者更高。';
  const expectedN2oVsHcfc22 = 'EF 3.1 因未收氧化亚氮给出 0 对 ' + displayedDecimal(optB_ef, 4)
    + ' kg CFC-11 当量（0.2×' + facts.get('ef31-odp-hcfc22') + '），ReCiPe 2016 的 20 年视角也判甲小于乙（'
    + facts.get('rivm-odp-n2o-20') + ' 对 0.2×' + facts.get('rivm-odp-hcfc22-20') + ' = '
    + displayedDecimal(optB_20, 3) + '），但 100 年视角（' + facts.get('rivm-odp-n2o-100')
    + ' 对 0.2×' + facts.get('rivm-odp-hcfc22-100') + ' = ' + displayedDecimal(optB_100, 3)
    + '）与无限期视角（' + facts.get('rivm-odp-n2o-inf') + ' 对 0.2×' + facts.get('rivm-odp-hcfc22-inf')
    + ' = ' + displayedDecimal(optB_inf, 3) + '）双双反转为氧化亚氮方案更高。';
  const expectedWmoReversal = '在采用 WMO 2011 的 ReCiPe 2016 平等主义列中为 ' + facts.get('rivm-odp-halon1301-inf')
    + ' 大于 ' + facts.get('rivm-odp-halon2402-inf') + '，在采用 WMO 2014 的 EF 3.1 中却变成 '
    + facts.get('ef31-odp-halon1301') + ' 小于 ' + facts.get('ef31-odp-halon2402') + '。';
  if (!odpClaim?.text.includes(expectedHalonClause)
      || !odpClaim?.text.includes(expectedN2oVsHcfc22)
      || !odpClaim?.text.includes(expectedWmoReversal))
    throw new Error('Ozone and radiation changed the displayed ODP rank-reversal calculations');

  // 3. IR collective-dose horizons, C-14 vs Cs-137 reversal, I-129 540x jump, and Table 4.2 uranium-series gaps.
  const efC14CsRatio = ratioScaled(fact('ef31-ir-c14-air'), fact('ef31-ir-cs137-air'));
  const rivmC14CsRatio = ratioScaled(fact('rivm-ir-c14-air-100k'), fact('rivm-ir-cs137-air-100'));
  const i129FwJump = ratioScaled(fact('rivm-ir-i129-fw-100k'), fact('rivm-ir-i129-fw-100'));
  const efI129AirScaled = displayedDecimal(scale14Over11(fact('ef31-ir-i129-air')), 1);
  const efI129FwScaled = displayedDecimal(scale14Over11(fact('ef31-ir-i129-fw')), 2);
  if (!(fact('ef31-ir-c14-air') > fact('ef31-ir-cs137-air')
        && fact('rivm-ir-c14-air-100k') > fact('rivm-ir-cs137-air-100')
        && fact('rivm-ir-c14-air-100') < fact('rivm-ir-cs137-air-100')
        && fact('rivm-ir-c14-air-20') < fact('rivm-ir-cs137-air-20')
        && fact('rivm-ir-i129-air-100') < fact('rivm-ir-i129-air-100k')
        && fact('rivm-ir-i129-fw-100') < fact('rivm-ir-i129-fw-100k')
        && displayedDecimal(i129FwJump, 0) === '540'
        && fact('ef31-ir-sr90-water') === 193n * 10n ** 18n
        && fact('rivm-ir-th230-air-e') > fact('ef31-ir-th230-air')
        && fact('rivm-ir-ra226-air-e') > fact('ef31-ir-ra226-air')))
    throw new Error('Ozone and radiation lost IR collective-dose horizon reversals or nuclide coverage checks');

  const irClaim = uniqueRecord(catalog.claims, 'cl-ozrad121-ir-horizons');
  const expectedC14Reversal = '在 EF 3.1（' + facts.get('ef31-ir-c14-air') + ' 对 ' + facts.get('ef31-ir-cs137-air')
    + ' kBq U-235 当量）和 ReCiPe 2016 的 100,000 年视角（' + facts.get('rivm-ir-c14-air-100k')
    + ' 对 ' + facts.get('rivm-ir-cs137-air-100') + ' kBq Co-60 排入空气当量）下，碳-14 分别是铯-137 的约 '
    + displayedDecimal(efC14CsRatio, 1) + ' 倍与约 ' + displayedDecimal(rivmC14CsRatio, 2)
    + ' 倍；一旦把积分上限截断到 100 年（' + facts.get('rivm-ir-c14-air-100') + ' 对 '
    + facts.get('rivm-ir-cs137-air-100') + '）或 20 年（' + facts.get('rivm-ir-c14-air-20')
    + ' 对 ' + facts.get('rivm-ir-cs137-air-20') + '），碳-14 绝大部分后续剂量落在窗口之外，排序立刻倒转为铯-137 更高。';
  const expectedI129Clause = '100 年与 100,000 年之间的空气因子从 ' + facts.get('rivm-ir-i129-air-100')
    + ' 升至 ' + facts.get('rivm-ir-i129-air-100k') + '，淡水因子更从 ' + facts.get('rivm-ir-i129-fw-100')
    + ' 跃升至 ' + facts.get('rivm-ir-i129-fw-100k') + '（约 ' + displayedDecimal(i129FwJump, 0)
    + ' 倍），且与 EF 3.1 按 14/11 折算的空气 ' + efI129AirScaled + '、淡水 ' + efI129FwScaled + ' 显著不同';
  const expectedUraniumGap = '在 ReCiPe 2016 中只填入平等主义（100,000 年）一列（空气铀-235 为 '
    + facts.get('rivm-ir-u235-air-e') + '、铀-238 为 ' + facts.get('rivm-ir-u238-air-e')
    + '、铀-234 为 ' + facts.get('rivm-ir-u234-air-e') + '、钍-230 为 ' + facts.get('rivm-ir-th230-air-e')
    + '、镭-226 为 ' + facts.get('rivm-ir-ra226-air-e') + '），个人主义与默认等级主义两列全部留空。连 EF 3.1 的参照核素铀-235 在 ReCiPe 默认 100 年表中都没有因子，而 EF 3.1 对上述五种空气排放均赋非零值（'
    + facts.get('ef31-ir-u235-air') + '、' + facts.get('ef31-ir-u238-air') + '、' + facts.get('ef31-ir-u234-air')
    + '、' + facts.get('ef31-ir-th230-air') + '、' + facts.get('ef31-ir-ra226-air') + '）';
  if (!irClaim?.text.includes(expectedC14Reversal)
      || !irClaim?.text.includes(expectedI129Clause)
      || !irClaim?.text.includes(expectedUraniumGap)
      || !irClaim?.text.includes('水体锶-90 因子 1.93×10⁻⁴'))
    throw new Error('Ozone and radiation changed the displayed IR horizon or uranium-series gap values');

  // 4. Endpoint DALY conversion constants, DDREF (10/6/2), and hereditary DALY (57 vs 61).
  if (!(fact('rivm-odp-m2e-i') === 237n * 10n ** 18n
        && fact('rivm-odp-m2e-h') === 531n * 10n ** 18n
        && fact('rivm-odp-m2e-e') === 134n * 10n ** 19n
        && fact('rivm-ir-m2e-i') === 68n * 10n ** 14n
        && fact('rivm-ir-m2e-h') === 85n * 10n ** 14n
        && fact('rivm-ir-m2e-e') === 14n * 10n ** 15n
        && fact('rivm-ir-ddref-i') > fact('rivm-ir-ddref-h')
        && fact('rivm-ir-ddref-h') > fact('rivm-ir-ddref-e')
        && fact('ilcd-ir-fatal-cancer-rate') === 5n * 10n ** 22n
        && fact('ilcd-ir-nonfatal-cancer-rate') === 12n * 10n ** 22n
        && fact('ilcd-ir-hereditary-rate') === 1n * 10n ** 22n
        && fact('ilcd-ir-hereditary-daly') > fact('rivm-ir-hereditary-daly')))
    throw new Error('Ozone and radiation lost endpoint DALY, DDREF or hereditary-disease parameters');

  const endClaim = uniqueRecord(catalog.claims, 'cl-ozrad121-endpoint-choices');
  const expectedEndRates = '把广岛、长崎及职业中高剂量研究得出的每 man·Sv '
    + facts.get('ilcd-ir-fatal-cancer-rate') + ' 例致死癌与 ' + facts.get('ilcd-ir-nonfatal-cancer-rate')
    + ' 例非致死癌分别除以剂量与剂量率效能因子（DDREF）' + facts.get('rivm-ir-ddref-i') + '、'
    + facts.get('rivm-ir-ddref-h') + ' 与 ' + facts.get('rivm-ir-ddref-e')
    + '，按视角把计入癌症部位从 4 类（甲状腺、骨髓、肺、乳腺）扩至 11 类再到包含骨表面癌与其余癌症的 13 项，并加上每 man·Sv '
    + facts.get('ilcd-ir-hereditary-rate') + ' 例严重遗传疾病（原报告按半数即刻死亡、半数伤残权重 0.4 计每例 '
    + facts.get('rivm-ir-hereditary-daly') + ' DALY，而 ILCD 2011 引述无年龄加权为每例 '
    + facts.get('ilcd-ir-hereditary-daly') + ' DALY）。';
  if (!endClaim?.text.includes('依次乘 2.37×10⁻⁴、5.31×10⁻⁴ 与 1.34×10⁻³ DALY/kg CFC-11 当量')
      || !endClaim?.text.includes('依次乘 6.8×10⁻⁹、8.5×10⁻⁹ 与 1.4×10⁻⁸ DALY/kBq Co-60 排入空气当量')
      || !endClaim?.text.includes(expectedEndRates))
    throw new Error('Ozone and radiation changed the displayed endpoint DALY conversion parameters');

  // 5. RIVM p. 36 (-t-3)*k vs -(t-3)*k spreadsheet verification and JRC130796/EF 3.1 package discrepancies.
  const ftPrinted = (t, tau) => 1 - Math.exp((-t - 3) / tau);
  const ftLag = (t, tau) => 1 - Math.exp(-(t - 3) / tau);
  const calcOdp = (odpInf, fn, t, tau) => (odpInf * fn(t, tau) / fn(t, 45)).toFixed(3);
  if (calcOdp(0.820, ftPrinted, 20, 100) !== facts.get('rivm-odp-cfc12-20')
      || calcOdp(0.820, ftPrinted, 100, 100) !== facts.get('rivm-odp-cfc12-100')
      || calcOdp(15.900, ftPrinted, 20, 65) !== facts.get('rivm-odp-halon1301-20')
      || calcOdp(15.900, ftPrinted, 100, 65) !== facts.get('rivm-odp-halon1301-100')
      || calcOdp(7.900, ftPrinted, 20, 16) !== facts.get('rivm-odp-halon1211-20')
      || calcOdp(7.900, ftPrinted, 100, 16) !== facts.get('rivm-odp-halon1211-100')
      || calcOdp(0.660, ftPrinted, 20, 0.8) !== facts.get('rivm-odp-ch3br-20')
      || calcOdp(0.660, ftPrinted, 100, 0.8) !== facts.get('rivm-odp-ch3br-100')
      || calcOdp(0.660, ftLag, 20, 0.8) !== '2.098'
      || calcOdp(7.900, ftLag, 20, 16) !== '16.432'
      || calcOdp(0.820, ftLag, 20, 100) !== '0.407')
    throw new Error('Ozone and radiation lost the exact (-t-3)*k vs -(t-3)*k Table 3.2 verification');

  const formulaClaim = uniqueRecord(catalog.claims, 'cl-ozrad121-formula-table');
  const expectedFormulaClause = '如 CFC-12 的 ' + facts.get('rivm-odp-cfc12-20') + ' 与 '
    + facts.get('rivm-odp-cfc12-100') + '、Halon-1301 的 ' + facts.get('rivm-odp-halon1301-20')
    + ' 与 ' + facts.get('rivm-odp-halon1301-100') + '、Halon-1211 的 ' + facts.get('rivm-odp-halon1211-20')
    + ' 与 ' + facts.get('rivm-odp-halon1211-100') + '、溴甲烷的 ' + facts.get('rivm-odp-ch3br-20')
    + ' 与 ' + facts.get('rivm-odp-ch3br-100') + '）都与印式 (−t−3)·k 精确吻合到小数点后三位；若按物理滞后 −(t−3)·k 计算，20 年溴甲烷应为 2.098、Halon-1211 应为 16.432、CFC-12 应为 0.407。';
  if (!formulaClaim?.text.includes(expectedFormulaClause))
    throw new Error('Ozone and radiation changed the displayed Table 3.2 formula-audit values');

  const nfDropPct = ratioScaled(
    (fact('jrc130796-nf-odp-ef30') - fact('jrc130796-nf-odp-ef31')) * 100n,
    fact('jrc130796-nf-odp-ef30'),
  );
  if (displayedDecimal(nfDropPct, 1) !== '2.4' || fact('jrc130796-nf-ir-ef31') !== 4220n * scale)
    throw new Error('Ozone and radiation lost JRC130796 normalization adjustment relationship');

  const pkgClaim = uniqueRecord(catalog.claims, 'cl-ozrad121-package-discrepancies');
  const expectedSynonymClause = 'EF 3.1 按同义流规则新增的四氯化碳（与 CFC-10 同为 ' + facts.get('ef31-odp-ccl4')
    + '，含 5 个空气子区室）和甲基溴（英文流名 Methyl bromide，与 Halon-1001 同为 ' + facts.get('ef31-odp-ch3br')
    + '，却只建了 4 个子区室、漏掉平流层下部与对流层上部）';
  if (!pkgClaim?.text.includes('列出 23 种物质共 113 行')
      || !pkgClaim?.text.includes(expectedSynonymClause)
      || !pkgClaim?.text.includes('使人均归一化基准从 5.36×10⁻² 微调至 5.23×10⁻² kg CFC-11 当量/人，而电离辐射维持 4.22×10³ kBq U-235 当量/人不变。'))
    throw new Error('Ozone and radiation changed the displayed EF report/XML package discrepancy values');
}

const requiredLinks = {
  'emission-midpoint': [
    ['ev-ozrad121-ilcd2011-odp', 'supports'],
    ['ev-ozrad121-ilcd2011-ir', 'supports'],
    ['ev-ozrad121-rivm-ch3-odp-tables', 'supports'],
    ['ev-ozrad121-rivm-ch4-ir-tables', 'supports'],
    ['ev-ozrad121-recipe2017-summary', 'context'],
  ],
  'reference-scope': [
    ['ev-ozrad121-ef31-odp-xml', 'supports'],
    ['ev-ozrad121-ef31-ir-xml', 'supports'],
    ['ev-ozrad121-rivm-ch3-odp-tables', 'supports'],
    ['ev-ozrad121-rivm-ch4-ir-tables', 'supports'],
  ],
  'odp-horizons': [
    ['ev-ozrad121-ef31-odp-xml', 'supports'],
    ['ev-ozrad121-rivm-ch3-odp-tables', 'supports'],
  ],
  'ir-horizons': [
    ['ev-ozrad121-ilcd2011-ir', 'context'],
    ['ev-ozrad121-ef31-ir-xml', 'supports'],
    ['ev-ozrad121-rivm-ch4-ir-tables', 'supports'],
  ],
  'endpoint-choices': [
    ['ev-ozrad121-ilcd2011-odp', 'supports'],
    ['ev-ozrad121-ilcd2011-ir', 'supports'],
    ['ev-ozrad121-rivm-ch3-odp-tables', 'supports'],
    ['ev-ozrad121-rivm-ch4-ir-tables', 'supports'],
  ],
  'formula-table': [
    ['ev-ozrad121-rivm-ch3-odp-tables', 'supports'],
    ['ev-ozrad121-rivm-ch4-ir-tables', 'supports'],
    ['ev-ozrad121-recipe2017-summary', 'supports'],
  ],
  'package-discrepancies': [
    ['ev-ozrad121-jrc109369-odp', 'supports'],
    ['ev-ozrad121-jrc109369-ir', 'supports'],
    ['ev-ozrad121-jrc130796-odp-ir', 'supports'],
    ['ev-ozrad121-ef31-odp-xml', 'supports'],
    ['ev-ozrad121-ef31-ir-xml', 'supports'],
  ],
  'emission-bridge': [
    ['ev-ozrad121-ilcd2011-odp', 'supports'],
    ['ev-ozrad121-ilcd2011-ir', 'supports'],
    ['ev-ozrad121-jrc130796-odp-ir', 'context'],
    ['ev-ozrad121-ef31-odp-xml', 'supports'],
    ['ev-ozrad121-ef31-ir-xml', 'supports'],
    ['ev-ozrad121-rivm-ch3-odp-tables', 'supports'],
    ['ev-ozrad121-rivm-ch4-ir-tables', 'supports'],
  ],
};

function validateSupportLinks(catalog) {
  for (const [claimName, expectedLinks] of Object.entries(requiredLinks)) {
    const id = 'cl-ozrad121-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.evidenceIds?.length !== expectedLinks.length || claim?.evidenceLinks?.length !== expectedLinks.length)
      throw new Error(`Ozone and radiation changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of expectedLinks) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation)
        throw new Error(`Ozone and radiation lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
