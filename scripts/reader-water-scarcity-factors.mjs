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
    sourceId: 'src-water125-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-water125-ef-method-water',
      mediaType: 'application/xml',
      sha256: 'f06fec854a386ecd9c2d6b2de3d735b341b9f5ac68990764a3e1fd84e91268d2',
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
};

const efSelectedMembers = [
  ['art-water125-ef-method-water', 'f06fec854a386ecd9c2d6b2de3d735b341b9f5ac68990764a3e1fd84e91268d2'],
  ['art-water125-ef-prop-volume', '29521d8b9842cbbff94a795a4e1d1338220f03c41d5c98e80a35b0233ac10d78'],
  ['art-water125-ef-unit-volume', 'be6f84eb2e9466905a0bb9156def6c56ceab5e1eeba7b0594d3b02e39242b6fc'],
  ['art-water125-ef-source-boulay2016', '5f841536e3ba0b6487006ccd299af05ef43339ca7de66688cc0eabb9b715c604'],
  ['art-water125-ef-flow-freshwater-in', '280f3a913660ac4399df29895fec3a57bd15e9d5610d19e023af9aa40d93f744'],
  ['art-water125-ef-flow-groundwater-in', '9b9ea0d0430ed897590fda0f094821a8d93769149db27ff6f936361019262d6a'],
  ['art-water125-ef-flow-lakewater-in', 'f737fb3dc48c3347e5b7d7d8f426148419ba0993470d2d2cbcfe3e6ff83291e9'],
  ['art-water125-ef-flow-riverwater-in', 'e8ed33c169c2aec15b433a65453fa6f0a41027816aac5b822829a8cf5cb4c0e7'],
  ['art-water125-ef-flow-cooling-in', '181a6364e65476eb8c6765fe372977ff11b71a54383ae3b15810c6b1890273bc'],
  ['art-water125-ef-flow-turbine-in', '83c55e9315d84d88b15a9089addb9aee3f7eea7cdd45bfa6729b1b2fcd30290e'],
  ['art-water125-ef-flow-water-in', '724a2bba75e5e1dc401e432d3f7d6534f9421b86feea0ac69a6c6a298885add3'],
  ['art-water125-ef-flow-water-fw-out', 'cab9f4949c5a91d8550a7939c5bbfe780d2d6cdf3346313213c6a31c0365c3fc'],
  ['art-water125-ef-flow-cooling-fw-out', '0b256cf159851c6b97a69c4ce36afc2e944c089351aeae22093160f1dcb2ea38'],
  ['art-water125-ef-flow-turbine-fw-out', 'a12be84d9d8622df7881eeca96ac448ae7e06692d1eee56ba361cc2228d0f0c5'],
  ['art-water125-ef-flow-water-unspecw-out', '1b3187eba96f7e56e2113c7d5a72c10c028b4df933e58b99771458d0f02fe89d'],
];

const evidenceRows = [
  ['ilcd2011-water', 'ilcd', 'psg-water125-ilcd2011-water', null,
    '399a7a5fa2fbefc6f45977a855459e2305f15565fc063dbb6d5c333985fa26f8'],
  ['jrc109369-water', 'jrc109369', 'psg-water125-jrc109369-water', null,
    'cad54a18b39070b4e37068fe40f7cdea0e9e9dc8e4de96f4466bdf1ecf929494'],
  ['jrc130796-water', 'jrc130796', 'psg-water125-jrc130796-water', null,
    '65d50b84967d3f6c98e31aecc9c3126609721666d212c9f1c058a7f8f04783db'],
  ['ef31-water-xml', 'ef31', 'psg-water125-ef31-water-xml', 'art-water125-ef-method-water',
    '6e2482519be12bd55bdef7a18f62b9649465bc02e0c523e64cf7bf39e476dfa1'],
  ['rivm-ch10-framework', 'rivm', 'psg-water125-rivm-ch10-framework', null,
    '9fd5223cf6075892c96521b5835efca74ff853242418ba7d6ef4f92da591b9fe'],
  ['rivm-ch10-endpoints', 'rivm', 'psg-water125-rivm-ch10-endpoints', null,
    '7c4045e764d2d711ebce1f6625c9f200ffff8010c30677cb5873f655a016ead6'],
  ['rivm-s6-country-and-corruption', 'rivm', 'psg-water125-rivm-s6-country-and-corruption', null,
    '772207f5c9b3cf422e6d3999c43712756674aa1fa324d36d6bd20afe281a97f8'],
  ['recipe2017-water', 'recipe2017', 'psg-water125-recipe2017-water', null,
    '09e9092088e2c6c1067d63f57ea70de86a45f0d721f1f33e9bf4d0171accff90'],
  ['lcimpact2020-water', 'lcimpact2020', 'psg-water125-lcimpact2020-water', null,
    'b6c7a41b046a96dd684339593f3df20dbab7589889439fde26564cc420da62a1'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateWaterScarcityFactors(catalog, readings) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-water125-')).length !== evidenceRows.length)
    throw new Error('Water scarcity evidence count differs from its pinned row inventory');
  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...defaultSourceArtifact } = expected.artifact;
    const expectedSourceArtifact = expected.sourceArtifact ?? defaultSourceArtifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Water scarcity changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, sha] of efSelectedMembers) {
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), { id, mediaType: 'application/xml', sha256: sha, resolvedUrl: efUrl }))
      throw new Error(`Water scarcity changed a verified EF 3.1 XML member: ${id}`);
  }

  const facts = new Map();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-water125-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || record.sourceId !== expected.sourceId || record.readingId !== expected.readingId
        || record.passageId !== passageId || passage.artifactId !== expectedArtifactId)
      throw new Error(`Water scarcity changed the selected row or support passage: ${id}`);
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
      throw new Error(`Water scarcity changed the selected row or support passage: ${id}`);
    if (record.numericFact) facts.set(name, record.numericFact.value);
    for (const item of record.numericFacts ?? []) {
      if (facts.has(item.id)) throw new Error(`Water scarcity duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== 106) throw new Error(`Water scarcity expected 106 verified numeric facts, got ${facts.size}`);
  validateCalculations(facts, catalog);
  validateSupportLinks(catalog);
}

const DECIMALS = 40;
const scale = 10n ** BigInt(DECIMALS);

function exactDecimal(value) {
  const negative = value.startsWith('-');
  const clean = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = clean.split('.');
  if (fraction.length > DECIMALS) throw new Error(`Water scarcity decimal exceeds ${DECIMALS} places: ${value}`);
  const parsed = BigInt(whole + fraction.padEnd(DECIMALS, '0'));
  return negative ? -parsed : parsed;
}

function ratioScaled(numerator, denominator) {
  return (numerator * scale + denominator / 2n) / denominator;
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
  return neg ? '-' + out : out;
}

function mantissaExp(scaledValue, exp, places) {
  const adjusted = exp >= 0 ? scaledValue / (10n ** BigInt(exp)) : scaledValue * (10n ** BigInt(-exp));
  return displayedDecimal(adjusted, places);
}

function validateCalculations(facts, catalog) {
  const consumed = new Set();
  const fact = id => {
    const raw = facts.get(id);
    if (raw === undefined) throw new Error(`Water scarcity missing numeric fact: ${id}`);
    consumed.add(id);
    return exactDecimal(raw);
  };
  const raw = id => {
    fact(id);
    return facts.get(id);
  };

  // 1. Method genealogy across ILCD 2011, EF 2.0/3.0/3.1, ReCiPe 2016 and LC-IMPACT (Claim 1).
  if (fact('ilcd-water-scarcity-levels') !== 6n * scale
      || fact('ilcd-water-evaluated-endpoints') !== 0n
      || fact('rivm-wcp-consumptive-cf') !== scale
      || fact('recipe2017-water-damage-pathways') !== 3n * scale
      || fact('lcimpact-midpoint-count') !== 0n
      || fact('lcimpact-water-hh-watersheds') !== 11050n * scale
      || fact('lcimpact-water-eq-grid-deg') !== exactDecimal('0.05')
      || fact('lcimpact-taxa-plant-share') !== 50n * scale)
    throw new Error('Water scarcity lost method-genealogy structure counts');

  const genClaim = uniqueRecord(catalog.claims, 'cl-water125-method-genealogy');
  const expectedIlcdClause = '推荐以区分 ' + raw('ilcd-water-scarcity-levels')
    + ' 级区域缺水程度的瑞士生态稀缺法（Swiss Ecoscarcity）作为中点默认模型（推荐等级 Level III），同时声明未评估任何水资源终点模型（推荐终点模型数为 '
    + raw('ilcd-water-evaluated-endpoints') + '）';
  const expectedRecipeGenClause = '一律赋表征因子 ' + raw('rivm-wcp-consumptive-cf') + ' m³/m³';
  const expectedLcimpactClause = '因此设置的中点类别数为 ' + raw('lcimpact-midpoint-count')
    + '，直接在损害层发布 ' + raw('lcimpact-water-hh-watersheds') + ' 个流域的营养不良健康因子（DALY/m³）和 '
    + raw('lcimpact-water-eq-grid-deg') + '°×' + raw('lcimpact-water-eq-grid-deg')
    + '° 湿地网格的全球不可逆物种灭绝风险因子（潜在消失物种比例 PDF·yr/m³，将维管植物与动物两大类群各赋 '
    + raw('lcimpact-taxa-plant-share') + '% 权重';
  if (!genClaim?.text.includes('自然环境累积㶲提取法（CEENE')
      || !genClaim?.text.includes(expectedIlcdClause)
      || !genClaim?.text.includes('较 2008 版新增的 ' + raw('recipe2017-water-damage-pathways') + ' 条终点损害路径')
      || !genClaim?.text.includes(expectedRecipeGenClause)
      || !genClaim?.text.includes(expectedLcimpactClause))
    throw new Error('Water scarcity changed the displayed method-genealogy prose');

  // 2. Signed withdrawal/return elementary flows vs aquifer extraction ratios (Claim 2).
  const efRows = fact('ef31-water-total-rows');
  const efFlows = fact('ef31-water-elementary-flows');
  const efIn = fact('ef31-water-input-flows');
  const efOut = fact('ef31-water-output-flows');
  const efLocs = fact('ef31-water-location-entries');
  const efCountries = fact('ef31-water-country-codes');
  const wrrAgr = fact('rivm-wrr-agr-global');
  const wrrAgrSd = fact('rivm-wrr-agr-sd');
  const wrrSurf = fact('rivm-wrr-ind-dom-surface');
  const wrrGround = fact('rivm-wrr-ind-dom-ground');
  const s61Min = fact('rivm-s61-min');
  const s61Max = fact('rivm-s61-max');
  const indGroundToSurfRatio = ratioScaled(wrrGround, wrrSurf);
  if (efIn + efOut !== efFlows
      || (efFlows * efLocs) / scale !== efRows
      || efCountries + scale !== efLocs
      || !(s61Min < wrrAgr && wrrAgr < s61Max && wrrAgrSd > 0n)
      || indGroundToSurfRatio !== 10n * scale)
    throw new Error('Water scarcity lost signed-flow matrix or 10:1 groundwater/surface ratio');

  const acctClaim = uniqueRecord(catalog.claims, 'cl-water125-withdrawal-return-accounting');
  const expectedEfAcctClause = '（共 ' + raw('ef31-water-total-rows') + ' 行因子，由 '
    + raw('ef31-water-elementary-flows') + ' 条涉水基本流在 ' + raw('ef31-water-location-entries')
    + ' 个地理条目上展开）采用“正负基本流代数相抵”。其中 ' + raw('ef31-water-input-flows') + ' 条水资源输入流';
  const expectedRecipeAcctClause = '全球默认折算比均取 ' + raw('rivm-wrr-agr-global')
    + '（标准差 ' + raw('rivm-wrr-agr-sd') + '，附表 S6.1 各国农业折算比介于 ' + raw('rivm-s61-min')
    + ' 与 ' + raw('rivm-s61-max') + ' 之间）；工业与生活用水的地表水抽取按 90% 至 95% 退水回流，统一取折算比 '
    + raw('rivm-wrr-ind-dom-surface') + '；唯独工业与生活抽取地下水，报告指出其退水绝大部分排入地表河流而非原含水层，因此只要未经人工回灌重返同一含水层，即便清单同时记录了地表退水，也规定不得扣减退水，折算比直接取 '
    + raw('rivm-wrr-ind-dom-ground') + '。';
  if (!acctClaim?.text.includes(expectedEfAcctClause)
      || !acctClaim?.text.includes(raw('ef31-water-output-flows') + ' 条水体排放输出流')
      || !acctClaim?.text.includes(expectedRecipeAcctClause)
      || !acctClaim?.text.includes('呈 ' + displayedDecimal(indGroundToSurfRatio, 0) + ':1 的分歧')
      || !acctClaim?.text.includes('按流域与月份编制的表征因子表'))
    throw new Error('Water scarcity changed the displayed withdrawal-return accounting prose');

  // 3. PEF/OEF country-annual defaults, NF invariants and ReCiPe multi-era/latitude cutoffs (Claim 3).
  const nf30 = fact('jrc130796-nf-water-ef30');
  const nf31 = fact('jrc130796-nf-water-ef31');
  const nfDiff = fact('jrc130796-nf-water-diff-pct');
  const dsTotal = fact('jrc130796-official-datasets-total');
  const r1_30 = fact('jrc130796-water-rank1-ef30');
  const r1_31 = fact('jrc130796-water-rank1-ef31');
  const aw = fact('ef31-water-aw'), eg = fact('ef31-water-eg'), es = fact('ef31-water-es');
  const cn = fact('ef31-water-cn'), us = fact('ef31-water-us'), ind = fact('ef31-water-in');
  const br = fact('ef31-water-br'), de = fact('ef31-water-de'), ch = fact('ef31-water-ch'), no = fact('ef31-water-no');
  const noneIn = fact('ef31-water-none-input');
  const wsiMin = fact('rivm-wsi-min'), wsiMax = fact('rivm-wsi-max');
  const wsiGlobI = fact('rivm-wsi-global-i'), wsiGlobHe = fact('rivm-wsi-global-he');
  const hdiOne = fact('rivm-hdi-one-threshold'), hdiZero = fact('rivm-hdi-zero-threshold');
  const sdTerr = fact('rivm-sd-terrestrial'), sdAq = fact('rivm-sd-aquatic');
  const latCut = fact('rivm-aq-latitude-cutoff');
  if (fact('jrc109369-aware-resolutions-listed') !== 7n * scale
      || nf30 !== nf31 || nfDiff !== 0n || dsTotal !== 2752n * scale || r1_30 <= r1_31 || dsTotal <= r1_30
      || !(aw > eg && eg > es && es > noneIn && noneIn > cn && cn > us && us > ind && ind > br && br > de && de > ch && ch > no)
      || !(wsiMin < wsiGlobHe && wsiGlobHe < wsiGlobI && wsiGlobI < wsiMax)
      || !(hdiOne < hdiZero && sdTerr > sdAq && latCut === 42n * scale))
    throw new Error('Water scarcity lost country-factor hierarchy, NF stability or ReCiPe threshold bounds');

  const resClaim = uniqueRecord(catalog.claims, 'cl-water125-ef-country-resolution-and-climates');
  const expectedEfCountriesClause = '阿鲁巴 ' + raw('ef31-water-aw') + '、埃及 ' + raw('ef31-water-eg')
    + '、西班牙 ' + raw('ef31-water-es') + '，到中国 ' + raw('ef31-water-cn') + '、美国 ' + raw('ef31-water-us')
    + '、印度 ' + raw('ef31-water-in') + '（全球未指明位置取水为 ' + raw('ef31-water-none-input')
    + '），再到巴西 ' + raw('ef31-water-br') + '、德国 ' + raw('ef31-water-de')
    + '、瑞士 ' + raw('ef31-water-ch') + ' 与挪威 ' + raw('ef31-water-no') + ' m³ world-eq./m³';
  const expectedNfClause = '维持 ' + mantissaExp(nf31, 4, 2) + '×10⁴ m³ water eq. of deprived water/人不变（报告对 m³ world-eq./人 的异文写法，详见第 18.4 节；变动 '
    + raw('jrc130796-nf-water-diff-pct') + '%，在 ' + raw('jrc130796-official-datasets-total') + ' 个 EF 官方数据集中居单一总分首位的个数仅因其他类别重算由 '
    + raw('jrc130796-water-rank1-ef30') + ' 个微调为 ' + raw('jrc130796-water-rank1-ef31') + ' 个）';
  const expectedThresholdsClause = '个人主义为 ' + raw('rivm-wsi-global-i') + '，略高于等级主义与平等主义（同为 '
    + raw('rivm-wsi-global-he') + '）。其次，人体健康脆弱性系数 HDF 按 2001 年各国人类发展指数（HDI）分段拟合：HDI < '
    + raw('rivm-hdi-one-threshold') + ' 取 1，' + raw('rivm-hdi-one-threshold') + ' ≤ HDI ≤ '
    + raw('rivm-hdi-zero-threshold') + ' 按二次多项式递减，而 HDI > ' + raw('rivm-hdi-zero-threshold');
  if (!resClaim?.text.includes('列出 AWARE 的 ' + raw('jrc109369-aware-resolutions-listed') + ' 种时空与行业分辨率')
      || !resClaim?.text.includes(expectedEfCountriesClause)
      || !resClaim?.text.includes(expectedNfClause)
      || !resClaim?.text.includes('缩放在 ' + raw('rivm-wsi-min') + ' 至 ' + raw('rivm-wsi-max') + ' 之间')
      || !resClaim?.text.includes(expectedThresholdsClause)
      || !resClaim?.text.includes('参考文献第 115 页')
      || !resClaim?.text.includes(mantissaExp(sdTerr, -8, 2) + '×10⁻⁸ species/m²')
      || !resClaim?.text.includes(mantissaExp(sdAq, -10, 2) + '×10⁻¹⁰ species/m³')
      || !resClaim?.text.includes('剔除南北纬 ' + raw('rivm-aq-latitude-cutoff') + '° 以外的全部流域'))
    throw new Error('Water scarcity changed the displayed country-resolution or threshold prose');

  // 4. WR_malnutrition denominator paradox (I > H = E) and endpoint divergence (Claim 4).
  const wrI = fact('rivm-wr-malnutrition-i');
  const wrHe = fact('rivm-wr-malnutrition-he');
  const dfMal = fact('rivm-df-malnutrition');
  const hhGlobI = fact('rivm-hh-global-i');
  const hhGlobHe = fact('rivm-hh-global-he');
  const terrGlobI = fact('rivm-terr-global-i');
  const terrGlobHe = fact('rivm-terr-global-he');
  const aqMedian = fact('rivm-aq-watershed-median');
  const aqMean = fact('rivm-aq-country-mean');
  const denomAmp = ratioScaled(wrHe, wrI);
  const hhGlobRatio = ratioScaled(hhGlobI, hhGlobHe);
  const hhGlobGainPct = ratioScaled((hhGlobI - hhGlobHe) * 100n, hhGlobHe);
  if (wrI >= wrHe
      || displayedDecimal(denomAmp, 2) !== '1.35'
      || hhGlobI <= hhGlobHe
      || displayedDecimal(hhGlobRatio, 2) !== '1.40'
      || displayedDecimal(hhGlobGainPct, 0) !== '40'
      || terrGlobI !== 0n || terrGlobHe <= aqMean || aqMean <= aqMedian
      || fact('rivm-terr-richness-cutoff') !== 2000n * scale)
    throw new Error('Water scarcity lost WR_malnutrition denominator amplification or global endpoint ordering');

  const valClaim = uniqueRecord(catalog.claims, 'cl-water125-value-choices-and-denominator-paradox');
  const expectedHhParadoxClause = '个人主义（' + mantissaExp(hhGlobI, -6, 2)
    + '×10⁻⁶ DALY/m³）显著高于等级主义与平等主义（同为 ' + mantissaExp(hhGlobHe, -6, 2)
    + '×10⁻⁶ DALY/m³，高出约 ' + displayedDecimal(hhGlobGainPct, 0) + '%，精确比值约 '
    + displayedDecimal(hhGlobRatio, 2) + ' 倍）';
  const expectedDenomClause = '最后乘人均营养不良损害系数 ' + mantissaExp(dfMal, -2, 2)
    + '×10⁻² DALY/(年·人) 得到健康终点因子。个人主义视角假定未来农业用水管理高效，把维持一人一年基本膳食所需的最低水量 WR_malnutrition 从等级主义与平等主义的标准管理值 '
    + raw('rivm-wr-malnutrition-he') + ' m³/(年·人) 调低到 ' + raw('rivm-wr-malnutrition-i') + ' m³/(年·人)';
  if (!valClaim?.text.includes('总表 1.5 汇总的各类中点至终点损害转换系数')
      || !valClaim?.text.includes(expectedHhParadoxClause)
      || !valClaim?.text.includes(expectedDenomClause)
      || !valClaim?.text.includes('放大了 1350 ÷ 1000 = ' + displayedDecimal(denomAmp, 2) + ' 倍')
      || !valClaim?.text.includes('超过 ' + raw('rivm-terr-richness-cutoff') + ' 个物种')
      || !valClaim?.text.includes('直接把陆地生态因子置为 ' + raw('rivm-terr-global-i'))
      || !valClaim?.text.includes(mantissaExp(terrGlobHe, -8, 2) + '×10⁻⁸ species·yr/m³')
      || !valClaim?.text.includes('流域中位数为 ' + mantissaExp(aqMedian, -13, 2) + '×10⁻¹³、国家面积加权均值为 ' + mantissaExp(aqMean, -12, 2) + '×10⁻¹² species·yr/m³'))
    throw new Error('Water scarcity changed the displayed denominator-paradox or endpoint value-choice prose');

  // 5. Real country rank reversals: AU vs BD and CL vs CN (Claim 5).
  const auEf = fact('ef31-water-au'), bdEf = fact('ef31-water-bd');
  const clEf = fact('ef31-water-cl');
  const auWsi = fact('rivm-au-wsi-he'), bdWsi = fact('rivm-bd-wsi-he');
  const auHhHe = fact('rivm-au-hh-he'), auHhI = fact('rivm-au-hh-i');
  const bdHhHe = fact('rivm-bd-hh-he'), bdHhI = fact('rivm-bd-hh-i');
  const auTerr = fact('rivm-au-terr-he'), bdTerr = fact('rivm-bd-terr-he');
  const auAq = fact('rivm-au-aq'), bdAq = fact('rivm-bd-aq');
  const clWsi = fact('rivm-cl-wsi-he'), cnWsi = fact('rivm-cn-wsi-he');
  const clHhHe = fact('rivm-cl-hh-he'), clHhI = fact('rivm-cl-hh-i');
  const cnHhHe = fact('rivm-cn-hh-he'), cnHhI = fact('rivm-cn-hh-i');
  const clTerr = fact('rivm-cl-terr-he'), cnTerr = fact('rivm-cn-terr-he');
  const clAq = fact('rivm-cl-aq'), cnAq = fact('rivm-cn-aq');
  const clWrr = fact('rivm-s61-cl'), cnWrr = fact('rivm-s61-cn');

  const auBdEfRatio = ratioScaled(auEf, bdEf);
  const auBdTerrRatio = ratioScaled(auTerr, bdTerr);
  const bdAuHhHeRatio = ratioScaled(bdHhHe, auHhHe);
  const clCnEfRatio = ratioScaled(clEf, cn);
  const cnClHhHeRatio = ratioScaled(cnHhHe, clHhHe);
  if (auWsi !== exactDecimal('0.457') || bdWsi !== exactDecimal('0.263')
      || !(auEf > bdEf && auWsi > bdWsi && auTerr > bdTerr && bdHhHe > auHhHe && bdHhI > auHhI && bdAq > auAq)
      || !(clEf > cn && clWsi > cnWsi && cnHhHe > clHhHe && cnHhI > clHhI && cnTerr > clTerr && cnAq > clAq && clAq === 0n && cnWrr > clWrr))
    throw new Error('Water scarcity lost AU/BD or CL/CN multi-endpoint rank reversal inequalities');

  const revClaim = uniqueRecord(catalog.claims, 'cl-water125-country-rank-reversals');
  const expectedAuBdClause = '澳大利亚高达 ' + raw('ef31-water-au') + ' m³ world-eq./m³，是孟加拉国（'
    + raw('ef31-water-bd') + '）的约 ' + displayedDecimal(auBdEfRatio, 1)
    + ' 倍；ReCiPe 2016 陆地生态终点（等级主义与平等主义）同样判澳大利亚更高，为 '
    + mantissaExp(auTerr, -8, 2) + '×10⁻⁸ 对 ' + mantissaExp(bdTerr, -9, 2)
    + '×10⁻⁹ species·yr/m³（附表 S6.3 表头记作 species-eq·yr/m³，数值与正文 species·yr/m³ 同义；澳大利亚约为孟加拉国的 '
    + displayedDecimal(auBdTerrRatio, 1) + ' 倍，个人主义视角则同为 0）。然而一旦转入 ReCiPe 2016 人体健康终点，高 HDI 的澳大利亚按国家阈值本不发生缺水型营养不良，附表仅因流域汇总边界或浮点截断留存近乎为零的残差（等级主义与平等主义仅 '
    + mantissaExp(auHhHe, -18, 2) + '×10⁻¹⁸、个人主义为 ' + mantissaExp(auHhI, -16, 2)
    + '×10⁻¹⁶ DALY/m³），孟加拉国却达 ' + mantissaExp(bdHhHe, -6, 2) + '×10⁻⁶（等级主义与平等主义）与 '
    + mantissaExp(bdHhI, -6, 2) + '×10⁻⁶ DALY/m³（个人主义），在等级主义与平等主义下排序反向翻转约 '
    + mantissaExp(bdAuHhHeRatio, 11, 2) + '×10¹¹ 倍（逾十一个数量级），淡水鱼类终点亦翻转为孟加拉国略高（'
    + mantissaExp(bdAq, -12, 2) + '×10⁻¹² 对 ' + mantissaExp(auAq, -12, 2) + '×10⁻¹² species·yr/m³）。';
  const expectedClCnClause = '（' + raw('ef31-water-cl') + ' 对 ' + raw('ef31-water-cn') + ' m³ world-eq./m³，约 '
    + displayedDecimal(clCnEfRatio, 2) + ' 倍，ReCiPe 附表中的物理水压力指数 WSI 在等级主义下亦为智利 '
    + raw('rivm-cl-wsi-he') + ' 高于中国 ' + raw('rivm-cn-wsi-he')
    + '）；但在 ReCiPe 2016 等级主义与平等主义的全部三项终点上，排序一致反转为中国高于智利：人体健康为 '
    + mantissaExp(cnHhHe, -7, 2) + '×10⁻⁷ 对 ' + mantissaExp(clHhHe, -7, 2) + '×10⁻⁷ DALY/m³（约 '
    + displayedDecimal(cnClHhHeRatio, 2) + ' 倍，个人主义亦为 ' + mantissaExp(cnHhI, -6, 2) + '×10⁻⁶ 对 '
    + mantissaExp(clHhI, -7, 2) + '×10⁻⁷），陆地生态为 '
    + mantissaExp(cnTerr, -9, 2) + '×10⁻⁹ 对 ' + mantissaExp(clTerr, -9, 2)
    + '×10⁻⁹ species·yr/m³，淡水鱼类更从智利的 ' + raw('rivm-cl-aq') + ' 升至中国的 '
    + mantissaExp(cnAq, -12, 2) + '×10⁻¹² species·yr/m³。倘若原始清单只记录各抽取 10 m³ 农业灌溉水，按表 S6.1 农业需水折算比（智利 '
    + raw('rivm-s61-cl') + '、中国 ' + raw('rivm-s61-cn') + '），连 ReCiPe 中点耗水量也会从相等翻转为中国更高（'
    + displayedDecimal(10n * cnWrr, 1) + ' 对 ' + displayedDecimal(10n * clWrr, 1) + ' m³）。';
  if (!revClaim?.text.includes(expectedAuBdClause) || !revClaim?.text.includes(expectedClCnClause))
    throw new Error('Water scarcity changed the displayed AU/BD or CL/CN country reversal prose');

  // 6. Pure hydrological scarcity reversal: Belgium vs Canada (WSI vs AWARE) + Cyprus context (Claim 6).
  const beWsiHe = fact('rivm-be-wsi-he'), beWsiI = fact('rivm-be-wsi-i');
  const caWsiHe = fact('rivm-ca-wsi-he'), caWsiI = fact('rivm-ca-wsi-i');
  const beEf = fact('ef31-water-be'), caEf = fact('ef31-water-ca');
  const cyEf = fact('ef31-water-cy');
  const beHh = fact('rivm-be-hh'), caHh = fact('rivm-ca-hh');
  const beTerr = fact('rivm-be-terr-he'), caTerr = fact('rivm-ca-terr-he');
  const beCaWsiRatio = ratioScaled(beWsiHe, caWsiHe);
  const caBeEfRatio = ratioScaled(caEf, beEf);
  if (cyEf !== exactDecimal('74.3')
      || !(beWsiHe > caWsiHe && beWsiI > caWsiI && caEf > beEf && cyEf > caEf && beHh === 0n && caHh === 0n && beTerr > caTerr))
    throw new Error('Water scarcity lost Belgium vs Canada physical scarcity reversal');

  const becaClaim = uniqueRecord(catalog.claims, 'cl-water125-belgium-canada-mechanism-contrast');
  const expectedBeCaClause = '人口与工业高度密集的比利时在等级主义与平等主义下高达 ' + raw('rivm-be-wsi-he')
    + '（个人主义下为 ' + raw('rivm-be-wsi-i') + '），在等级主义与平等主义下约为加拿大（等级主义与平等主义 ' + raw('rivm-ca-wsi-he')
    + '、个人主义 ' + raw('rivm-ca-wsi-i') + '）的 ' + displayedDecimal(beCaWsiRatio, 2)
    + ' 倍；然而在 EF 3.1 官方机读文件的 AWARE 国别因子中，加拿大却高达 ' + raw('ef31-water-ca')
    + ' m³ world-eq./m³，反过来约为比利时（' + raw('ef31-water-be') + ' m³ world-eq./m³）的 '
    + displayedDecimal(caBeEfRatio, 2) + ' 倍。';
  if (!becaClaim?.text.includes(expectedBeCaClause)
      || !becaClaim?.text.includes('双双得 ' + raw('rivm-be-hh') + '，仅陆地生态在等级主义与平等主义下呈比利时 '
        + mantissaExp(beTerr, -9, 2) + '×10⁻⁹ 略高于加拿大 ' + mantissaExp(caTerr, -9, 2) + '×10⁻⁹ species·yr/m³'))
    throw new Error('Water scarcity changed the displayed Belgium vs Canada physical scarcity prose');

  // 7. Package & report discrepancies: None -0.005 asymmetry, GL=0.00, inventoryItems=36, WR 1530 vs 1350, Table S6.2 52/53 corruption (Claim 7).
  const xmlBytes = fact('ef31-water-xml-bytes');
  const declItems = fact('ef31-water-declared-inventory-items');
  const noneFwOut = fact('ef31-water-none-fw-output');
  const noneUnspecOut = fact('ef31-water-none-unspecw-output');
  const glEf = fact('ef31-water-gl');
  const wrPfisterText = fact('rivm-wr-pfister-text');
  const s62Valid = fact('rivm-s62-valid-countries');
  const fijiCorrupt = fact('rivm-s62-corrupt-fiji-wsi');
  const deCorrupt = fact('rivm-s62-corrupt-de-wsi');
  const senegalCorrupt = fact('rivm-s62-corrupt-senegal-wsi');
  const usCorrupt = fact('rivm-s62-corrupt-us-wsi');
  const swedenCorrupt = fact('rivm-s62-corrupt-sweden-hh');
  const usHhCorrupt = fact('rivm-s62-corrupt-us-hh');
  const noneUnspecNet = noneIn + noneUnspecOut;
  if (xmlBytes !== 1268239n * scale
      || declItems !== 36n * scale
      || noneIn + noneFwOut !== 0n
      || displayedDecimal(noneUnspecNet, 3) !== '-0.005'
      || glEf !== 0n
      || wrPfisterText <= wrHe
      || s62Valid !== 52n * scale
      || !(fijiCorrupt < wsiMin && usCorrupt < wsiMin && deCorrupt > wsiMax && senegalCorrupt > wsiMax && swedenCorrupt > usHhCorrupt && usHhCorrupt > 0n))
    throw new Error('Water scarcity lost package discrepancy or Table S6.2 corruption bounds');

  const pkgClaim = uniqueRecord(catalog.claims, 'cl-water125-package-report-discrepancies');
  const expectedNoneClause = '水使用方法 XML（' + raw('ef31-water-xml-bytes')
    + ' 字节，官方压缩包内仅存这一份水使用方法文件，版本号仍标 2016 年 12 月的 03.00.014，引文源仍写“Boulay 等 2016 投稿稿”）中，全部 '
    + raw('ef31-water-country-codes') + ' 个两字母国家或地区代码的 ' + raw('ef31-water-input-flows')
    + ' 条取水流与 ' + raw('ef31-water-output-flows')
    + ' 条退水流绝对值严格相等；唯独未带地理代码的全局默认项（无 location 标签），7 条取水流全赋 +'
    + raw('ef31-water-none-input') + '，3 条排入淡水的退水流赋 −' + raw('ef31-water-none-fw-output').slice(1)
    + '，而排入“未指明水体”的退水流却赋 −' + raw('ef31-water-none-unspecw-output').slice(1);
  const expectedS62Clause = '前 ' + raw('rivm-s62-valid-countries')
    + ' 个国家或地区（从阿富汗 Afghanistan 至埃塞俄比亚 Ethiopia，即 A–E 区段）完全符合 WSI 介于 0.01 至 1 且 HDI > 0.88 国家健康损害归零（或仅留存 10⁻¹⁸ 量级近零残差）的定义；但从第 167 页表 S6.2 第 53 行（该页第 14 行）斐济（Fiji）起直至第 169 页表末津巴布韦（Zimbabwe），整个 F–Z 区段（涵盖法国、德国、印度、伊朗、日本、塞内加尔、瑞典、英国、美国等逾百个国家或地区）发生严重的列行错位混入。具体而言，WSI 列印出斐济 '
    + mantissaExp(fijiCorrupt, -3, 2) + '×10⁻³、德国 ' + raw('rivm-s62-corrupt-de-wsi')
    + '、塞内加尔 ' + mantissaExp(senegalCorrupt, 4, 2) + '×10⁴、美国 ' + mantissaExp(usCorrupt, -7, 2) + '×10⁻⁷';
  if (!pkgClaim?.text.includes(expectedNoneClause)
      || !pkgClaim?.text.includes('产生 −' + displayedDecimal(-noneUnspecNet, 3) + ' m³ world-eq. 的净负抵扣')
      || !pkgClaim?.text.includes('格陵兰（GL）全部 11 条流赋 ' + raw('ef31-water-gl'))
      || !pkgClaim?.text.includes('声明含 ' + raw('ef31-water-declared-inventory-items') + ' 个清单项')
      || !pkgClaim?.text.includes('设为 ' + raw('rivm-wr-pfister-text') + ' m³/(年·人)')
      || !pkgClaim?.text.includes(expectedS62Clause)
      || !pkgClaim?.text.includes('瑞典（' + mantissaExp(swedenCorrupt, -6, 2) + '×10⁻⁶）和美国（' + mantissaExp(usHhCorrupt, -7, 2) + '×10⁻⁷）'))
    throw new Error('Water scarcity changed the displayed package discrepancy or Table S6.2 corruption prose');

  // 8. Five-step operational diagnostic synthesis (Claim 8).
  const synthClaim = uniqueRecord(catalog.claims, 'cl-water125-diagnostic-synthesis');
  if (!synthClaim?.text.includes('查清模型是用 ' + raw('ef31-water-input-flows') + ' 正 ' + raw('ef31-water-output-flows') + ' 负基本流做同国代数相抵')
      || !synthClaim?.text.includes('（' + displayedDecimal(indGroundToSurfRatio, 0) + ':1 分歧的来源）')
      || !synthClaim?.text.includes('HDI > ' + raw('rivm-hdi-zero-threshold') + ' 健康归零、南北纬 ' + raw('rivm-aq-latitude-cutoff') + '° 鱼类剔除')
      || !synthClaim?.text.includes('（' + raw('rivm-wr-malnutrition-i') + ' 对 ' + raw('rivm-wr-malnutrition-he') + ' m³/(年·人)）')
      || !synthClaim?.text.includes('−' + displayedDecimal(-noneUnspecNet, 3) + ' m³ world-eq. 超额负抵扣')
      || !synthClaim?.text.includes('回看第 18.3—18.4 节的 X、Y 两流域虚构算例'))
    throw new Error('Water scarcity changed the displayed five-step diagnostic synthesis prose');

  if (consumed.size !== facts.size) {
    const unused = [...facts.keys()].filter(k => !consumed.has(k));
    throw new Error(`Water scarcity left unverified numeric facts: ${unused.join(', ')}`);
  }
}

const requiredLinks = {
  'method-genealogy': [
    ['ev-water125-ilcd2011-water', 'supports'],
    ['ev-water125-jrc109369-water', 'supports'],
    ['ev-water125-jrc130796-water', 'supports'],
    ['ev-water125-rivm-ch10-framework', 'supports'],
    ['ev-water125-recipe2017-water', 'supports'],
    ['ev-water125-lcimpact2020-water', 'supports'],
  ],
  'withdrawal-return-accounting': [
    ['ev-water125-jrc109369-water', 'supports'],
    ['ev-water125-ef31-water-xml', 'supports'],
    ['ev-water125-rivm-ch10-framework', 'supports'],
    ['ev-water125-rivm-s6-country-and-corruption', 'supports'],
  ],
  'ef-country-resolution-and-climates': [
    ['ev-water125-jrc109369-water', 'supports'],
    ['ev-water125-jrc130796-water', 'supports'],
    ['ev-water125-ef31-water-xml', 'supports'],
    ['ev-water125-rivm-ch10-endpoints', 'supports'],
  ],
  'value-choices-and-denominator-paradox': [
    ['ev-water125-rivm-ch10-framework', 'supports'],
    ['ev-water125-rivm-ch10-endpoints', 'supports'],
    ['ev-water125-lcimpact2020-water', 'supports'],
  ],
  'country-rank-reversals': [
    ['ev-water125-ef31-water-xml', 'supports'],
    ['ev-water125-rivm-ch10-framework', 'supports'],
    ['ev-water125-rivm-s6-country-and-corruption', 'supports'],
  ],
  'belgium-canada-mechanism-contrast': [
    ['ev-water125-ef31-water-xml', 'supports'],
    ['ev-water125-rivm-ch10-endpoints', 'supports'],
    ['ev-water125-rivm-s6-country-and-corruption', 'supports'],
  ],
  'package-report-discrepancies': [
    ['ev-water125-jrc109369-water', 'supports'],
    ['ev-water125-jrc130796-water', 'supports'],
    ['ev-water125-ef31-water-xml', 'supports'],
    ['ev-water125-rivm-ch10-framework', 'supports'],
    ['ev-water125-rivm-ch10-endpoints', 'supports'],
    ['ev-water125-rivm-s6-country-and-corruption', 'supports'],
    ['ev-water125-lcimpact2020-water', 'supports'],
  ],
  'diagnostic-synthesis': [
    ['ev-water125-ef31-water-xml', 'supports'],
    ['ev-water125-rivm-ch10-framework', 'supports'],
    ['ev-water125-rivm-ch10-endpoints', 'supports'],
    ['ev-water125-rivm-s6-country-and-corruption', 'supports'],
    ['ev-water125-lcimpact2020-water', 'supports'],
  ],
};

function validateSupportLinks(catalog) {
  const claimEntries = Object.entries(requiredLinks);
  if (catalog.claims.filter(row => row.id.startsWith('cl-water125-')).length !== claimEntries.length)
    throw new Error('Water scarcity claim count differs from its pinned claim inventory');
  for (const [claimName, expectedLinks] of claimEntries) {
    const id = 'cl-water125-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.status !== 'reviewed' || !sameScienceValue(claim?.conceptIds, []))
      throw new Error(`Water scarcity claim lacks reviewed status or bounded conceptIds: ${id}`);
    if (claim?.evidenceIds?.length !== expectedLinks.length || claim?.evidenceLinks?.length !== expectedLinks.length)
      throw new Error(`Water scarcity changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of expectedLinks) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation
          || !scienceText(links[0].rationale))
        throw new Error(`Water scarcity lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
