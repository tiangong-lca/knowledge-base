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
    sourceId: 'src-ozone119-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-ozone119-ef-method-pof',
      mediaType: 'application/xml',
      sha256: '273c43df66bfd12f7884e1c3e19d23daade5af5b96bd1d7c68802d87f7755f4a',
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
  ['art-ozone119-ef-method-pof', '273c43df66bfd12f7884e1c3e19d23daade5af5b96bd1d7c68802d87f7755f4a'],
  ['art-ozone119-ef-method-marine', 'a681b4b9b2d853697e2e044719d43cb7eaa6b8e185af8b00bb277aa92e735301'],
  ['art-ozone119-ef-method-pm', 'bbde0609351a78fe774c39d3c2a90b8cc463cf3f57d62ffbd4c4f9cb6cb5b721'],
  ['art-ozone119-ef-method-odp', 'e64477a1b282ce934a9fbeb456601589fca88c3d160289dc9680d4f1d261ead4'],
  ['art-ozone119-ef-flow-nox', 'ff51748c47eaf0d590a12abe2cfeaaba16286f124891a62ab03de62a3c8e1da1'],
  ['art-ozone119-ef-flow-no2', '70c3acfcb5d7626e9d7a1945c12021c1fab0245723f82ec91178739bd1beba0c'],
  ['art-ozone119-ef-flow-no', '723397f658a56a4a16c19e527b93f3abe394fe83af6e60d957237b53b95fde42'],
  ['art-ozone119-ef-flow-nmvoc', 'f1c6c2405d1cf6a17e00c0a2af20f3cce6ab361053812ead39567ef717c8a66b'],
  ['art-ozone119-ef-flow-voc', 'f038f025eb9a60eea89a185b7d6756a98b4394373fc486a9f60bafed9129a45d'],
  ['art-ozone119-ef-flow-ethylene', 'a9fff3598e936f7f34a6c060cd6602560b1665c9ddf0c846c33a3c621171f2be'],
  ['art-ozone119-ef-flow-ch4-fossil', 'a46a3a16e17cddc90059a95055fb87be0e3dcba184b175719cc5dc2751136491'],
  ['art-ozone119-ef-flow-chloromethane', 'b800ee52376546e5bcaf87f99c5206e022eb1b9298d379b38e00bc5ba5e1f763'],
  ['art-ozone119-ef-flow-hcfc140', 'e37b50f8b7d6a31535c66e34f3b623a96c081e1e05321e202a7f25f8ec4dc996'],
  ['art-ozone119-ef-flow-methyl-chloroform', '59c1572aa6451ffb5dede40be8bf782a49d4b99c9278c6da7999aca847d0ea9a'],
  ['art-ozone119-ef-flow-tca111', 'abb666651d81ddd5a8ea791934ee5150dc9ec0322179a22dc580fd17873eed36'],
  ['art-ozone119-ef-flow-dichloromethane', '6a7e6f62dbf5aa67c5be42d6978ab79efd359f679cdace5da7a08726a3f30216'],
  ['art-ozone119-ef-flow-methylene-chloride', '10467354a9f221682d25fa4d056a8516b75e7e434d8355f1346bf9911be85c2b'],
];

const evidenceRows = [
  ['ilcd2011-pof-methods', 'ilcd', 'psg-ozone119-ilcd2011-pof', null,
    '43297d053df2b5118874ce5a856d8b746d9f817381b17ec5af3139b5a67b4d45'],
  ['jrc109369-voc-and-label', 'jrc109369', 'psg-ozone119-jrc109369-pof-and-nox', null,
    '48ab63fff262aae0cd5e6208133a639bda6efa6ec85146e2ae45f8ed3c3ed468'],
  ['jrc130796-pof-synonyms', 'jrc130796', 'psg-ozone119-jrc130796-pof-update', null,
    '55e834d7da51c7d7f64e08975dd3b94602543bc17f46c51b2a756698ac987298'],
  ['ef31-pof-core-factors', 'ef31', 'psg-ozone119-ef31-pof-method', 'art-ozone119-ef-method-pof',
    '83e85763d4d8feaa351b3ac78fa5aae4df137505d46b5815ff9367c389812df9'],
  ['ef31-location-replication', 'ef31', 'psg-ozone119-ef31-pof-method', 'art-ozone119-ef-method-pof',
    '1e8d8f03e659d38da4826ac9938a46516b1e530a272e07ba1d2be321ff39fd61'],
  ['ef31-multipath-uuid', 'ef31', 'psg-ozone119-ef31-multipath-precursors', 'art-ozone119-ef-flow-nox',
    '3473bbc59ee965455a3649fcdf7a2c64575a21368c47083b430a709aa62f34d9'],
  ['rivm-ch6-split-and-tables', 'rivm', 'psg-ozone119-rivm-ch6-receptors', null,
    'e3a286684744d4fd69cb3ab8b59e7778f916241dda636e1b99741cc2bedef965'],
  ['rivm-s21-titration', 'rivm', 'psg-ozone119-rivm-s2-titration', null,
    'ab5cfca8a1e866059304a549f760339621d1091f09b03be5641145dd264bcb47'],
  ['recipe2017-ozone-overview', 'recipe2017', 'psg-ozone119-recipe2017-ozone-split', null,
    '8dd27f5c14f027eb7f404f58c46420ce199b57396775e421cb2586fd794fcc45'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validatePhotochemicalOzoneFactors(catalog, readings) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-ozone119-')).length !== evidenceRows.length)
    throw new Error('Photochemical ozone evidence count differs from its pinned row inventory');
  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...defaultSourceArtifact } = expected.artifact;
    const expectedSourceArtifact = expected.sourceArtifact ?? defaultSourceArtifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Photochemical ozone changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, sha] of efSelectedMembers) {
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), {
      id, mediaType: 'application/xml', sha256: sha, resolvedUrl: efUrl,
    })) throw new Error(`Photochemical ozone changed a verified EF 3.1 XML member: ${id}`);
  }

  const facts = new Map();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-ozone119-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || record.sourceId !== expected.sourceId || record.readingId !== expected.readingId
        || record.passageId !== passageId || passage.artifactId !== expectedArtifactId)
      throw new Error(`Photochemical ozone changed the selected row or support passage: ${id}`);
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
      throw new Error(`Photochemical ozone changed the selected row or support passage: ${id}`);
    if (record.numericFact) facts.set(name, record.numericFact.value);
    for (const item of record.numericFacts ?? []) {
      if (facts.has(item.id)) throw new Error(`Photochemical ozone duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== 43) throw new Error(`Photochemical ozone expected 43 verified numeric facts, got ${facts.size}`);
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
  const step = 10n ** BigInt(24 - places);
  const rounded = ((scaledValue + step / 2n) / step).toString().padStart(places + 1, '0');
  return rounded.slice(0, -places) + '.' + rounded.slice(-places);
}

function validateCalculations(facts, catalog) {
  const fact = id => exactDecimal(facts.get(id));

  // 1. EF 3.1 1:1 parity across NMVOC, NOx, NO2, NO vs weighted generic VOC quotient, plus cl-ozone119-pocp-to-lotos prose.
  for (const id of ['ef31-pof-nmvoc', 'ef31-pof-nox', 'ef31-pof-no2', 'ef31-pof-no']) {
    if (fact(id) !== scale) throw new Error(`Photochemical ozone lost EF 3.1 1.0 parity for ${id}`);
  }
  const euNmvoc = fact('jrc-eu2004-nmvoc-emissions');
  const euCh4 = fact('jrc-eu2004-ch4-emissions');
  const weightedNumerator = (euNmvoc * fact('ef31-pof-nmvoc') + euCh4 * fact('ef31-pof-ch4-fossil')) / scale;
  const weightedVoc = ratioScaled(weightedNumerator, euNmvoc + euCh4);
  if (displayedDecimal(weightedVoc, 3) !== '0.234' || facts.get('ef31-pof-voc-generic') !== '0.235')
    throw new Error('Photochemical ozone lost the exact 0.23435 -> 0.234 vs XML 0.235 VOC relationship');

  if (fact('rivm-hofp-world-nox') !== scale || fact('rivm-eofp-world-nox') !== scale
      || fact('rivm-nox-molar-no') <= scale || fact('rivm-nox-molar-no3') >= scale
      || fact('rivm-hofp-to-endpoint') !== 91n * 10n ** 16n
      || fact('rivm-eofp-to-endpoint') !== 129n * 10n ** 15n)
    throw new Error('Photochemical ozone lost ReCiPe 2016 NOx reference, molar scaling or endpoint conversion factors');

  const pocpClaim = uniqueRecord(catalog.claims, 'cl-ozone119-pocp-to-lotos');
  const expectedEfCore = '未指定空气排放的 NMVOC、氮氧化物、二氧化氮与一氧化氮均赋 '
    + facts.get('ef31-pof-nmvoc') + ' kg NMVOC 当量/kg，乙烯为 ' + facts.get('ef31-pof-ethylene')
    + '，甲烷为 ' + facts.get('ef31-pof-ch4-fossil') + '，泛指挥发性有机物（VOC）则按 2004 年欧洲 '
    + facts.get('jrc-eu2004-nmvoc-emissions') + ' Mt NMVOC 与 ' + facts.get('jrc-eu2004-ch4-emissions')
    + ' Mt 甲烷排放量加权定为 ' + facts.get('ef31-pof-voc-generic') + '。';
  const expectedMolar = '系数依次为 ' + facts.get('rivm-nox-molar-no') + '、'
    + facts.get('rivm-hofp-world-nox') + '、' + facts.get('rivm-nox-molar-no3') + '）';
  const expectedEndpoints = '乘 9.1×10⁻⁷ 伤残调整寿命年（DALY）/kg NOx 当量；以及按森林和草地生长期日间臭氧超过 40 ppb 的累积暴露量（AOT40）定义的陆地生态臭氧形成潜势（EOFP），其终点乘 1.29×10⁻⁷ species·yr/kg NOx 当量。';
  if (!pocpClaim?.text.includes(expectedEfCore)
      || !pocpClaim?.text.includes(expectedMolar)
      || !pocpClaim?.text.includes(expectedEndpoints))
    throw new Error('Photochemical ozone changed the displayed POCP/LOTOS-EUROS/TM5-FASST factor summary');

  // 2. ReCiPe 2016 NOx-to-NMVOC ratios and order reversals (EF vs ReCiPe, HOFP vs EOFP).
  const hofpRatio = ratioScaled(fact('rivm-hofp-world-nox'), fact('rivm-hofp-world-nmvoc'));
  const eofpRatio = ratioScaled(fact('rivm-eofp-world-nox'), fact('rivm-eofp-world-nmvoc'));
  const efOptA = fact('ef31-pof-nox');
  const efOptB = 2n * fact('ef31-pof-nmvoc');
  const hofpOptA = fact('rivm-hofp-world-nox');
  const hofpOptB = 2n * fact('rivm-hofp-world-nmvoc');
  const eofpOptA = fact('rivm-eofp-world-nox');
  const eofpOptB = 2n * fact('rivm-eofp-world-nmvoc');
  const quarterNox = scale / 4n;
  const hofpOptC = (quarterNox * fact('rivm-hofp-world-nox')) / scale;
  const hofpOptD = fact('rivm-hofp-world-nmvoc');
  const eofpOptC = (quarterNox * fact('rivm-eofp-world-nox')) / scale;
  const eofpOptD = fact('rivm-eofp-world-nmvoc');

  if (!(efOptA < efOptB && hofpOptA > hofpOptB && eofpOptA > eofpOptB && hofpOptC > hofpOptD && eofpOptC < eofpOptD))
    throw new Error('Photochemical ozone lost cross-system or cross-receptor order reversals');

  const reversalClaim = uniqueRecord(catalog.claims, 'cl-ozone119-order-reversal');
  const expectedWorldSetup = '在 ReCiPe 2016 世界加权平均表中，NOx 在两项中点下均为 '
    + facts.get('rivm-hofp-world-nox') + '，而 1 kg NMVOC 在人体健康 HOFP 下为 '
    + facts.get('rivm-hofp-world-nmvoc') + ' kg NOx 当量，在陆地生态 EOFP 下为 '
    + facts.get('rivm-eofp-world-nmvoc') + ' kg NOx 当量';
  const expectedRatioText = '全球平均每千克 NOx 的权重分别是每千克 NMVOC 的约 '
    + displayedDecimal(hofpRatio, 2) + ' 倍与约 ' + displayedDecimal(eofpRatio, 2)
    + ' 倍，而在 EF 3.1 中通用 NMVOC 与 NOx 却是 1∶1 等权。';
  const expectedCrossSystem = '按 EF 3.1 计算，甲为 ' + displayedDecimal(efOptA, 1) + '、乙为 '
    + displayedDecimal(efOptB, 1) + ' kg NMVOC 当量，甲只有乙的一半；改用 ReCiPe 2016 世界均值，甲在 HOFP（'
    + displayedDecimal(hofpOptA, 1) + ' 对 ' + displayedDecimal(hofpOptB, 2) + ' kg NOx 当量）和 EOFP（'
    + displayedDecimal(eofpOptA, 1) + ' 对 ' + displayedDecimal(eofpOptB, 2) + ' kg NOx 当量）下都反过来明显高于乙。';
  const expectedCrossReceptor = '再在 ReCiPe 2016 内部比较方案丙（0.25 kg NOx）与方案丁（1 kg NMVOC）：按人体健康 HOFP 计，丙高于丁（'
    + displayedDecimal(hofpOptC, 2) + ' 对 ' + displayedDecimal(hofpOptD, 2) + '）；按陆地生态 EOFP 计，丙却低于丁（'
    + displayedDecimal(eofpOptC, 2) + ' 对 ' + displayedDecimal(eofpOptD, 2) + '）。';
  if (!reversalClaim?.text.includes(expectedWorldSetup)
      || !reversalClaim?.text.includes(expectedRatioText)
      || !reversalClaim?.text.includes(expectedCrossSystem)
      || !reversalClaim?.text.includes(expectedCrossReceptor))
    throw new Error('Photochemical ozone changed the displayed order-reversal calculation');

  // 3. Regional titration sign flips (Benelux & GB/IE: HOFP_NOx < 0 < EOFP_NOx, while NMVOC > 0).
  if (!(fact('rivm-s21-benelux-hofp-nox') < 0n && fact('rivm-s21-benelux-eofp-nox') > 0n
        && fact('rivm-s21-gbie-hofp-nox') < 0n && fact('rivm-s21-gbie-eofp-nox') > 0n
        && fact('rivm-s21-benelux-hofp-nmvoc') > fact('rivm-hofp-world-nmvoc')
        && fact('rivm-s21-benelux-eofp-nmvoc') > fact('rivm-eofp-world-nmvoc')))
    throw new Error('Photochemical ozone lost regional NOx titration sign flip or NMVOC elevation');

  const titrationClaim = uniqueRecord(catalog.claims, 'cl-ozone119-titration-sign');
  const expectedTitration = 'NOx 的人体健康臭氧因子 HOFP 为 −' + facts.get('rivm-s21-benelux-hofp-nox').slice(1)
    + ' kg NOx 当量/kg（英国与爱尔兰区域为 −' + facts.get('rivm-s21-gbie-hofp-nox').slice(1)
    + '），而同一区域 NOx 的陆地生态臭氧因子 EOFP 却为 +' + facts.get('rivm-s21-benelux-eofp-nox')
    + ' kg NOx 当量/kg（英国与爱尔兰为 +' + facts.get('rivm-s21-gbie-eofp-nox')
    + '）；同一行里 NMVOC 的两项因子则分别升至 +' + facts.get('rivm-s21-benelux-hofp-nmvoc')
    + ' 与 +' + facts.get('rivm-s21-benelux-eofp-nmvoc') + '（英国与爱尔兰为 +'
    + facts.get('rivm-s21-gbie-hofp-nmvoc') + ' 与 +' + facts.get('rivm-s21-gbie-eofp-nmvoc') + '）。';
  if (!titrationClaim?.text.includes(expectedTitration))
    throw new Error('Photochemical ozone changed the displayed Table S2.1 titration numbers');

  // 4. EF 3.1 location replication vs true country variation in Acidification and Terrestrial eutrophication.
  if (fact('ef31-acid-nox-nl') <= fact('ef31-acid-nox-be')
      || fact('ef31-acid-nox-be') <= fact('ef31-acid-nox-generic')
      || fact('ef31-acid-nox-generic') <= fact('ef31-acid-nox-gb')
      || fact('ef31-teut-nox-generic') <= fact('ef31-teut-nox-be')
      || fact('ef31-teut-nox-be') <= fact('ef31-teut-nox-nl')
      || fact('ef31-teut-nox-nl') <= fact('ef31-teut-nox-gb'))
    throw new Error('Photochemical ozone lost country-level Acidification or Terrestrial eutrophication ordering');

  const locationClaim = uniqueRecord(catalog.claims, 'cl-ozone119-ef-location-copy');
  const expectedLocationContrast = '同一个未指定空气氮氧化物基本流却在通用 ' + facts.get('ef31-acid-nox-generic')
    + ' mol H⁺ 当量/kg 与 ' + facts.get('ef31-teut-nox-generic')
    + ' mol N 当量/kg 之外，对比利时、荷兰、英国分别给出 '
    + facts.get('ef31-acid-nox-be') + '、' + facts.get('ef31-acid-nox-nl') + '、' + facts.get('ef31-acid-nox-gb')
    + ' mol H⁺ 当量/kg 和 ' + facts.get('ef31-teut-nox-be') + '、' + facts.get('ef31-teut-nox-nl') + '、'
    + facts.get('ef31-teut-nox-gb') + ' mol N 当量/kg。';
  if (!locationClaim?.text.includes(expectedLocationContrast)
      || !locationClaim?.text.includes('氮氧化物和二氧化氮一律填 ' + facts.get('ef31-pof-nox') + ' kg NMVOC 当量/kg')
      || !locationClaim?.text.includes('硫氧化物和二氧化硫一律填 ' + facts.get('ef31-pof-so2-flat') + ' kg NMVOC 当量/kg'))
    throw new Error('Photochemical ozone changed the displayed EF 3.1 location-copy vs regional contrast');

  // 5. Same-UUID multi-pathway precursor factors and printed synonym/isomer limits.
  const multipathClaim = uniqueRecord(catalog.claims, 'cl-ozone119-multipath-accounting');
  const expectedNoxMultipath = '向未指定空气排放 1 kg 氮氧化物，按同一基本流 UUID 同时计入光化学臭氧 '
    + facts.get('ef31-pof-nox') + ' kg NMVOC 当量、酸化 ' + facts.get('ef31-acid-nox-generic')
    + ' mol H⁺ 当量、陆地富营养化 ' + facts.get('ef31-teut-nox-generic')
    + ' mol N 当量、海洋富营养化 ' + facts.get('ef31-meut-nox')
    + ' kg N 当量，以及颗粒物健康损害 1.6×10⁻⁶ 疾病发生率；排放 1 kg 化石甲烷同时计入第 15 章的气候变化 '
    + facts.get('ef31-cc-ch4-fossil') + ' kg CO₂ 当量（EF 3.1 沿用 AR6 勘误前值）与光化学臭氧 '
    + facts.get('ef31-pof-ch4-fossil') + ' kg NMVOC 当量；排放 1 kg 一氯甲烷则同时计入平流层臭氧耗竭 '
    + facts.get('ef31-odp-chloromethane') + ' kg CFC-11 当量、气候变化 '
    + facts.get('ef31-cc-chloromethane') + ' kg CO₂ 当量与光化学臭氧 '
    + facts.get('ef31-pof-chloromethane') + ' kg NMVOC 当量。';
  if (fact('ef31-pm-nox') !== 16n * 10n ** 17n
      || !multipathClaim?.text.includes(expectedNoxMultipath)
      || !multipathClaim?.text.includes('绝不能单凭比荷卢区域臭氧人体因子为 −' + facts.get('rivm-s21-benelux-hofp-nox').slice(1)))
    throw new Error('Photochemical ozone changed the displayed multi-pathway precursor values');

  const limitsClaim = uniqueRecord(catalog.claims, 'cl-ozone119-printed-limits');
  const expectedSynonyms = '把 HCFC-140 与二氯甲烷的 ' + facts.get('ef31-pof-hcfc140')
    + ' 和 ' + facts.get('ef31-pof-dichloromethane')
    + ' kg NMVOC 当量/kg 同步赋给同义流甲基氯仿与亚甲基氯';
  const expectedTca = '另收一条名为 1,1,1-三氯乙烷的流（因子 ' + facts.get('ef31-odp-tca111') + ' kg CFC-11 当量/kg';
  if (fact('ef31-pof-hcfc140') <= 0n || fact('ef31-pof-dichloromethane') <= fact('ef31-pof-hcfc140')
      || fact('ef31-odp-tca111') <= 0n
      || !limitsClaim?.text.includes(expectedSynonyms)
      || !limitsClaim?.text.includes(expectedTca))
    throw new Error('Photochemical ozone changed the displayed synonym or isomer factor limits');
}

const requiredLinks = {
  'precursor-entry': [
    ['ev-ozone119-ilcd2011-pof-methods', 'supports'],
    ['ev-ozone119-rivm-ch6-split-and-tables', 'supports'],
    ['ev-ozone119-recipe2017-ozone-overview', 'supports'],
  ],
  'pocp-to-lotos': [
    ['ev-ozone119-ilcd2011-pof-methods', 'supports'],
    ['ev-ozone119-jrc109369-voc-and-label', 'supports'],
    ['ev-ozone119-ef31-pof-core-factors', 'supports'],
    ['ev-ozone119-rivm-ch6-split-and-tables', 'supports'],
    ['ev-ozone119-recipe2017-ozone-overview', 'context'],
  ],
  'order-reversal': [
    ['ev-ozone119-ef31-pof-core-factors', 'supports'],
    ['ev-ozone119-rivm-ch6-split-and-tables', 'supports'],
  ],
  'titration-sign': [
    ['ev-ozone119-rivm-ch6-split-and-tables', 'context'],
    ['ev-ozone119-rivm-s21-titration', 'supports'],
  ],
  'ef-location-copy': [
    ['ev-ozone119-ef31-location-replication', 'supports'],
    ['ev-ozone119-ef31-multipath-uuid', 'supports'],
  ],
  'multipath-accounting': [
    ['ev-ozone119-ef31-pof-core-factors', 'supports'],
    ['ev-ozone119-ef31-location-replication', 'supports'],
    ['ev-ozone119-ef31-multipath-uuid', 'supports'],
    ['ev-ozone119-rivm-s21-titration', 'context'],
    ['ev-ozone119-recipe2017-ozone-overview', 'context'],
  ],
  'printed-limits': [
    ['ev-ozone119-jrc109369-voc-and-label', 'supports'],
    ['ev-ozone119-jrc130796-pof-synonyms', 'supports'],
    ['ev-ozone119-ef31-pof-core-factors', 'supports'],
    ['ev-ozone119-ef31-multipath-uuid', 'supports'],
    ['ev-ozone119-rivm-ch6-split-and-tables', 'supports'],
  ],
};

function validateSupportLinks(catalog) {
  for (const [claimName, expectedLinks] of Object.entries(requiredLinks)) {
    const id = 'cl-ozone119-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.evidenceIds?.length !== expectedLinks.length || claim?.evidenceLinks?.length !== expectedLinks.length)
      throw new Error(`Photochemical ozone changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of expectedLinks) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation)
        throw new Error(`Photochemical ozone lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
