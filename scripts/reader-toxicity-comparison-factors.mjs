import { editionDigest } from './reader-current-edition.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

const efUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF3_1/EF-v3.1.zip';
const addendumUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF_Data_Guide_EF3.1_addendum.pdf';

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
  addendum: {
    sourceId: 'src-tox123-ef31-addendum',
    readingId: 'rd-tox123-ef31-addendum',
    artifact: {
      id: 'art-tox123-ef31-addendum-pdf',
      mediaType: 'application/pdf',
      sha256: '76a921ca994964f158a5baf4962be2cb1cdeb73583835f7c047eed2087a952b7',
      resolvedUrl: addendumUrl,
      pageCount: 5,
    },
  },
  ef31: {
    sourceId: 'src-tox123-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-tox123-ef-method-htc',
      mediaType: 'application/xml',
      sha256: 'f8f23807aa68f005c4dacae10aff931c568e8a74a4faad6717438b2d2c20dc35',
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
  ['art-flow-pilot-ef-05316e7a', '252fe760308a14b647ba2a32e8e056f9d8434235be9f1bf3b0d452afe4548cd4'],
  ['art-flow-pilot-ef-dacd48b5', '6ddbbb5a67a33caa8cbd3f6d7dc46bdce71e98830bcc73d6596a2f3b250ef26d'],
  ['art-tox123-ef-method-htc', 'f8f23807aa68f005c4dacae10aff931c568e8a74a4faad6717438b2d2c20dc35'],
  ['art-tox123-ef-method-htc-org', '84203510df0a0700e385cd1b08288859bff79d0127df02edb3b26882145d33c2'],
  ['art-tox123-ef-method-htc-inorg', '537c9e6a898c67e2d803991a3de9507f2ec4756bcbe5b60a211b75687a331a23'],
  ['art-tox123-ef-method-htnc', 'd932a60f1615945df21b823f19321d80427a6eadb1b3e816f40153726b39993f'],
  ['art-tox123-ef-method-htnc-org', '51caa1ad49ac65822714fca432c34ec032c90101afca6cdaeccfec3ab50e10e7'],
  ['art-tox123-ef-method-htnc-inorg', 'fee7f45542a256f03faa73b406da8d40e7042be4c3719f24e0f0fdb55feace98'],
  ['art-tox123-ef-method-ecotox-org', '9a5a23ee80ff03a673d5aa626db693a6a7554192495103bb553f0ef90d9b914a'],
  ['art-tox123-ef-converter-htc', '016430441dc624fa1271a0ff6efde6fb4bf1e3105e0b555a2f094b41746307d8'],
  ['art-tox123-ef-converter-htnc', '75d732803383082bc854fd7321ed72d56793b1ee81af00a6debb54ce31f82dfd'],
  ['art-tox123-ef-converter-ecotox', 'a515ef10325493c5b2619fb3a4b9890888d1bcffff5ff9bc3ec48bd665eb779a'],
  ['art-tox123-ef-prop-ctuh', '3539e39aa105433a8490845eb6de8d42870fc941623753d13939984665b89f36'],
  ['art-tox123-ef-prop-ctue', '1714272400e7d5337bcca0b806c3b0c163d73826ee57121e3d217e0846e2e563'],
  ['art-tox123-ef-unit-items', 'b4bdadaac2fdb6ee78d96319c34ee7622a76733787b74115acdba5ade9332124'],
  ['art-tox123-ef-flow-cu-fw', 'd894cd0e6b7781804f85064c5f40ed0c34cb2f51756c003947ad3ae378149aa4'],
  ['art-tox123-ef-flow-cuii-agsoil', 'e89df06a89f522edf6bb19a2b721b5a56639b9c809d09b759d2a27c6cccd6739'],
  ['art-tox123-ef-flow-al-fw', '456e383865a48e32a122d1a339882d5e989f217320e0c96fc3c1ca01ce1203db'],
  ['art-tox123-ef-flow-cd-fw', '222adc2e9563e0962015ce23a306c93669212579aa6e198aa68be869b979c373'],
  ['art-tox123-ef-flow-ag-fw', '95d6990d5364264c742bf5cbcf3f8d362984106c94302b478692244b0dcde78d'],
  ['art-tox123-ef-flow-hg-fw', '93a8ce6ed1454aadfa141ed1a27657be18b3fd0b608e03dc9182ed41023ee968'],
  ['art-tox123-ef-flow-ni-uair', '599501137e5259e33ae7418b575a55f436d97b123a922c00bd0b5fdae4393183'],
  ['art-tox123-ef-flow-ni-fw', '9c372a7cb3ce0f45040d801bb60f421a4a6a0eeb3b20e1cef42a43c11c71d177'],
  ['art-tox123-ef-flow-dcb-uair', 'f94da1b613208c04cf32bd72504049fdb1595858ac94164a4f99a5a678386b2f'],
  ['art-tox123-ef-flow-dcb-fw', '94ce0f6343f5f6a3f27a4349f9564b8f3ddfa1f23eeb27da48767b9ead9e497a'],
  ['art-tox123-ef-flow-co-indoor', '43b144c0b9b16245ab48eabe4030b1b7a56128c22c58a1fe5387627fcdb4a927'],
  ['art-tox123-ef-flow-co-uair', '760fc7d5e78c20c819fbab54895ff190645819816ffdb65a0553e090ce24cc37'],
  ['art-tox123-ef-flow-ccl4-uair', '4a0fa195244e621b34b52a353c833a8a44313d549f6a1ece73c279ec03d49165'],
  ['art-tox123-ef-flow-cfc10-uair', '8e822ca8522327e0937ca84d966e52b76cfb087e60642956fae30a03cda3f339'],
  ['art-tox123-ef-flow-insecticides-fw', 'd53d2f63382c603199013db935f6122bd8b201099a821bda44465f51e7f508c9'],
  ['art-tox123-ef-flow-insecticides-unspecw', '6baac196e6a8b7a28d6bd634b4f1ec108ffa73760f221ff13dc208fd03da25e2'],
  ['art-tox123-ef-flow-chlorpyrifos-fw', '2e3ffb9da9f7a91cadf70efbb23d8e12725adce05b96eaeda1b6496b8ecb4df4'],
  ['art-tox123-ef-flow-chlorpyrifos-unspecw', '10fcdf6e513270c89b6fef2c8c14503e96ca95cc05822334db88ade3b65bd9a1'],
  ['art-tox123-ef-flow-lactic-acid-fw', '06af4285145dfe3c8e60bf96b8b4e18cddaba671848b97fcf7f7561b4ae65766'],
];

const evidenceRows = [
  ['ilcd2011-ht', 'ilcd', 'psg-tox123-ilcd2011-ht', null,
    '33a31de49651b7c7333a0f076d91d5df028df6f1515dd202b797e0a104f76bc3'],
  ['ilcd2011-ecotox', 'ilcd', 'psg-tox123-ilcd2011-ecotox', null,
    'cc0619e1a4fbd4d270168741eb422f1c939d873f04daa678cc0d36144e6853bb'],
  ['jrc109369-tox', 'jrc109369', 'psg-tox123-jrc109369-tox', null,
    '88f885c550f13cdb556ebf1fbb1c233c44e15c3915b64e0142f0053dc430f0f5'],
  ['jrc130796-hc20-proxies', 'jrc130796', 'psg-tox123-jrc130796-hc20-proxies', null,
    '608eb4bf39008e0a93a27d4b62d4efbaa6923c0d3d8f3fbab82bd43c30842c93'],
  ['jrc130796-nf-impacts', 'jrc130796', 'psg-tox123-jrc130796-nf-impacts', null,
    '04b40d02285fe4812f0ba6419757117312f4c9d28b7b114c809cf32e74429de7'],
  ['ef31-addendum', 'addendum', 'psg-tox123-ef31-addendum', null,
    'aea32ae7b888972a3656efbf9c2db39ecf885fca04b240e5864c93a2d1d21978'],
  ['ef31-htc-xml', 'ef31', 'psg-tox123-ef31-htc-xml', 'art-tox123-ef-method-htc',
    '39bd93c71420784d6b6dfbbea09a6a4a4d60f47163184cfdb60f3dfd79e8143f'],
  ['ef31-htnc-xml', 'ef31', 'psg-tox123-ef31-htnc-xml', 'art-tox123-ef-method-htnc',
    '0281abd37f3b5d74a1c5e31e129d2cf74a8c6268f291b1de712a4f43e013c567'],
  ['ef31-ecotox-xml', 'ef31', 'psg-tox123-ef31-ecotox-xml', 'art-flow-pilot-ef-05316e7a',
    '29f5202ac73e98b6240fc0f8fb113cc4e21d0199c44c02ef37c308c6dc668a56'],
  ['rivm-ch9-framework', 'rivm', 'psg-tox123-rivm-ch9-framework', null,
    'f2a815094940492ca16132060726d7fe7fe0e5fbe037eaf5a2a94e72b457937d'],
  ['rivm-ch9-table93', 'rivm', 'psg-tox123-rivm-ch9-table93', null,
    'd32e2b5533fa3b31103e0a97769d49181cd42b61c6c5e03ad1375ffe8062c0ad'],
  ['recipe2017-tox', 'recipe2017', 'psg-tox123-recipe2017-tox', null,
    '8c0f58a866bf574fa1915cbf7fb93d3f235b8ae0e7346f3d0792ab1a9ea24723'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateToxicityComparisonFactors(catalog, readings) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-tox123-')).length !== evidenceRows.length)
    throw new Error('Toxicity comparison evidence count differs from its pinned row inventory');
  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...defaultSourceArtifact } = expected.artifact;
    const expectedSourceArtifact = expected.sourceArtifact ?? defaultSourceArtifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Toxicity comparison changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, sha] of efSelectedMembers) {
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), { id, mediaType: 'application/xml', sha256: sha, resolvedUrl: efUrl }))
      throw new Error(`Toxicity comparison changed a verified EF 3.1 XML member: ${id}`);
  }

  const facts = new Map();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-tox123-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || record.sourceId !== expected.sourceId || record.readingId !== expected.readingId
        || record.passageId !== passageId || passage.artifactId !== expectedArtifactId)
      throw new Error(`Toxicity comparison changed the selected row or support passage: ${id}`);
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
      throw new Error(`Toxicity comparison changed the selected row or support passage: ${id}`);
    if (record.numericFact) facts.set(name, record.numericFact.value);
    for (const item of record.numericFacts ?? []) {
      if (facts.has(item.id)) throw new Error(`Toxicity comparison duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== 132) throw new Error(`Toxicity comparison expected 132 verified numeric facts, got ${facts.size}`);
  validateCalculations(facts, catalog);
  validateSupportLinks(catalog);
}

const DECIMALS = 40;
const scale = 10n ** BigInt(DECIMALS);

function exactDecimal(value) {
  const negative = value.startsWith('-');
  const clean = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = clean.split('.');
  if (fraction.length > DECIMALS) throw new Error(`Toxicity comparison decimal exceeds ${DECIMALS} places: ${value}`);
  const parsed = BigInt(whole + fraction.padEnd(DECIMALS, '0'));
  return negative ? -parsed : parsed;
}

function ratioScaled(numerator, denominator) {
  return (numerator * scale + denominator / 2n) / denominator;
}

function displayedDecimal(scaledValue, places) {
  if (places === 0) return ((scaledValue + scale / 2n) / scale).toString();
  const step = 10n ** BigInt(DECIMALS - places);
  const rounded = ((scaledValue + step / 2n) / step).toString().padStart(places + 1, '0');
  return rounded.slice(0, -places) + '.' + rounded.slice(-places);
}

function mantissaExp(scaledValue, exp, places) {
  const adjusted = exp >= 0 ? scaledValue / (10n ** BigInt(exp)) : scaledValue * (10n ** BigInt(-exp));
  return displayedDecimal(adjusted, places);
}

function validateCalculations(facts, catalog) {
  const consumed = new Set();
  const fact = id => {
    const raw = facts.get(id);
    if (raw === undefined) throw new Error(`Toxicity comparison missing numeric fact: ${id}`);
    consumed.add(id);
    return exactDecimal(raw);
  };
  const raw = id => {
    fact(id);
    return facts.get(id);
  };

  // 1. Midpoint family scope & endpoint conversion constants (ILCD 3 vs ReCiPe 5).
  const m2eHtpc = fact('rivm-m2e-htpc');
  const m2eHtpnc = fact('rivm-m2e-htpnc');
  const m2eFetp = fact('rivm-m2e-fetp');
  const m2eMetp = fact('rivm-m2e-metp');
  const m2eTetp = fact('rivm-m2e-tetp');
  const m2eTetpT15 = fact('rivm-table15-m2e-tetp');
  const ecotoxDamageFactor = fact('recipe2017-ecotox-damage-factor');
  if (fact('ilcd-tox-recommended-midpoints') !== 3n * scale
      || fact('ilcd-ecotox-recommended-endpoints') !== 0n
      || fact('rivm-tox-midpoints-count') !== 5n * scale
      || ecotoxDamageFactor !== scale
      || fact('rivm-daly-per-cancer-case') <= fact('rivm-daly-per-noncancer-case')
      || m2eHtpc <= m2eHtpnc
      || m2eTetp <= m2eFetp
      || m2eFetp <= m2eMetp
      || mantissaExp(m2eTetp, -8, 1) !== mantissaExp(m2eTetpT15, -8, 1))
    throw new Error('Toxicity comparison lost midpoint family counts or endpoint conversion hierarchy');

  const famClaim = uniqueRecord(catalog.claims, 'cl-tox123-midpoint-families');
  const expectedMidpointClause = '只设立 ' + raw('ilcd-tox-recommended-midpoints') + ' 项化学毒性中点';
  const expectedRecipeClause = '一次设立 ' + raw('rivm-tox-midpoints-count') + ' 项中点';
  const expectedEndpointClause = '致癌与非致癌分别按每发病例 ' + raw('rivm-daly-per-cancer-case')
    + ' 与 ' + raw('rivm-daly-per-noncancer-case')
    + ' DALY 折算为 ' + mantissaExp(m2eHtpc, -6, 2) + '×10⁻⁶ 与 ' + mantissaExp(m2eHtpnc, -9, 2)
    + '×10⁻⁹ DALY/kg 1,4-DCB 当量；淡水、海洋与陆地生态毒性假定急性效应近似野外消失比例（附加伤害因子取 '
    + raw('recipe2017-ecotox-damage-factor') + '）并乘上各自物种密度后，在表 9.4 中分别为 '
    + mantissaExp(m2eFetp, -10, 2) + '×10⁻¹⁰、' + mantissaExp(m2eMetp, -10, 2) + '×10⁻¹⁰ 与 '
    + mantissaExp(m2eTetp, -8, 2) + '×10⁻⁸ species·yr/kg 1,4-DCB 当量（同报告第 22 页总览表 1.5 将陆地系数四舍五入印作 '
    + mantissaExp(m2eTetpT15, -8, 1) + '×10⁻⁸）。';
  if (!famClaim?.text.includes(expectedMidpointClause)
      || !famClaim?.text.includes(expectedRecipeClause)
      || !famClaim?.text.includes(expectedEndpointClause))
    throw new Error('Toxicity comparison changed the displayed midpoint-family or endpoint-factor prose');

  // 2. HC50 vs HC20 benchmark, 20/17 fallback ratio, 3-sig-fig table rounding, and Cu/Hg/Al/Ag/Cd rank reversals.
  const fallbackRatio = ratioScaled(
    fact('jrc130796-hc20-numerator'),
    (fact('jrc130796-hc50-numerator') * fact('jrc130796-hc20-hc50-factor')) / scale,
  );
  const al30 = fact('jrc130796-al-ef30'), al31Tab = fact('jrc130796-al-ef31'), alXml = fact('ef31-ecotox-al-fw');
  const cu30 = fact('jrc130796-cu-ef30'), cu31Tab = fact('jrc130796-cu-ef31'), cuXml = fact('ef31-ecotox-cu-fw');
  const cd30 = fact('jrc130796-cd-ef30'), cd31Tab = fact('jrc130796-cd-ef31'), cdXml = fact('ef31-ecotox-cd-fw');
  const ag30 = fact('jrc130796-ag-ef30'), ag31Tab = fact('jrc130796-ag-ef31'), agXml = fact('ef31-ecotox-ag-fw');
  const hg30 = fact('jrc130796-hg-ef30'), hg31Tab = fact('jrc130796-hg-ef31'), hgXml = fact('ef31-ecotox-hg-fw');
  const sb3_30 = fact('jrc130796-sb3-ef30'), sb3_31Tab = fact('jrc130796-sb3-ef31'), sb3Xml = fact('ef31-ecotox-sb3-fw');

  const cuHgEf30 = ratioScaled(cu30, hg30);
  const hgCuEf31 = ratioScaled(hgXml, cuXml);
  const cuHgSwing = (cuHgEf30 * hgCuEf31) / scale;
  const alDropPct = displayedDecimal(ratioScaled((al30 - alXml) * 100n, al30), 0);
  const cuDropPct = displayedDecimal(ratioScaled((cu30 - cuXml) * 100n, cu30), 0);
  const cdGainPct = displayedDecimal(ratioScaled((cdXml - cd30) * 100n, cd30), 0);
  const agGainPct = displayedDecimal(ratioScaled((agXml - ag30) * 100n, ag30), 0);
  const hgGainPct = displayedDecimal(ratioScaled((hgXml - hg30) * 100n, hg30), 0);

  if (displayedDecimal(fallbackRatio, 3) !== raw('jrc130796-hc20-fallback-ratio')
      || fact('ef31-tox-subcategories-count') !== 2n * scale
      || sb3_30 >= sb3_31Tab
      || displayedDecimal(sb3Xml, 0) !== raw('jrc130796-sb3-ef31')
      || displayedDecimal(alXml / 10n, 0) + '0' !== raw('jrc130796-al-ef31')
      || displayedDecimal(cuXml, 1) !== raw('jrc130796-cu-ef31')
      || displayedDecimal(cdXml / 1000n, 0) + '000' !== raw('jrc130796-cd-ef31')
      || displayedDecimal(agXml / 1000n, 0) + '000' !== raw('jrc130796-ag-ef31')
      || displayedDecimal(hgXml / 100n, 0) + '00' !== raw('jrc130796-hg-ef31')
      || !(al30 > cd30 && cd30 > cu30 && cu30 > ag30 && ag30 > hg30)
      || !(cd31Tab > ag31Tab && ag31Tab > hg31Tab && hg31Tab > al31Tab && al31Tab > cu31Tab)
      || !(cdXml > agXml && agXml > hgXml && hgXml > alXml && alXml > cuXml)
      || displayedDecimal(cuHgEf30, 0) !== '45'
      || displayedDecimal(hgCuEf31, 0) !== '714'
      || !(cuHgSwing > 31500n * scale && cuHgSwing < 32500n * scale))
    throw new Error('Toxicity comparison lost HC20 20/17 fallback ratio, 3-sig-fig table rounding or EF 3.0 -> 3.1 metal rank reversal');

  const hc20Claim = uniqueRecord(catalog.claims, 'cl-tox123-hc20-and-metals');
  const fallbackPct = displayedDecimal((fallbackRatio - scale) * 100n, 0);
  const expectedHc20Fallback = '新旧因子之比不过是 (' + raw('jrc130796-hc20-numerator') + '/' + raw('jrc130796-hc20-hc50-factor')
    + ')÷' + raw('jrc130796-hc50-numerator') + ' = 20/17 ≈ ' + raw('jrc130796-hc20-fallback-ratio')
    + '，即上浮约 ' + fallbackPct + '%（例如排入淡水的三价锑由 EF 3.0 的 ' + mantissaExp(sb3_30, 2, 2)
    + '×10² 升至 EF 3.1 表值的 ' + mantissaExp(sb3_31Tab, 2, 2) + '×10²，官方 XML 精确值为 '
    + raw('ef31-ecotox-sb3-fw') + ' CTUe/kg）';
  const expectedMetalsClause = '淡水铝（' + mantissaExp(al30, 5, 2) + '×10⁵ 降至表值 ' + mantissaExp(al31Tab, 3, 2)
    + '×10³，XML 实值 ' + raw('ef31-ecotox-al-fw') + '，降幅 ' + alDropPct + '%）与淡水铜（'
    + mantissaExp(cu30, 4, 2) + '×10⁴ 降至表值 ' + mantissaExp(cu31Tab, 1, 2) + '×10¹，XML 实值 '
    + raw('ef31-ecotox-cu-fw') + '，原表四舍五入印作 -' + cuDropPct + '%）分别骤降两个与三个以上数量级；相反，镉（'
    + mantissaExp(cd30, 5, 2) + '×10⁵ 升至表值 ' + mantissaExp(cd31Tab, 5, 2) + '×10⁵，XML 实值 '
    + raw('ef31-ecotox-cd-fw') + '，+' + cdGainPct + '%）、银（' + mantissaExp(ag30, 4, 2) + '×10⁴ 升至表值 '
    + mantissaExp(ag31Tab, 5, 2) + '×10⁵，XML 实值 ' + raw('ef31-ecotox-ag-fw') + '，+' + agGainPct
    + '%）与汞（' + mantissaExp(hg30, 3, 2) + '×10³ 升至表值 ' + mantissaExp(hg31Tab, 4, 2) + '×10⁴，XML 实值 '
    + raw('ef31-ecotox-hg-fw') + '，+' + hgGainPct + '%）跃居前三。比较排入淡水的 1 kg 铜与 1 kg 汞，EF 3.0 判铜的生态毒性约为汞的 '
    + displayedDecimal(cuHgEf30, 0) + ' 倍，EF 3.1 却在同一 CTUe 单位下反转为汞约为铜的 ' + displayedDecimal(hgCuEf31, 0)
    + ' 倍，相对权重翻转逾四个数量级（约三万二千倍）。';
  if (!hc20Claim?.text.includes('共 ' + raw('ef31-tox-subcategories-count') + ' 项子指标')
      || !hc20Claim?.text.includes(expectedHc20Fallback)
      || !hc20Claim?.text.includes(expectedMetalsClause))
    throw new Error('Toxicity comparison changed the displayed HC20 metal reversal calculations');

  // 3. ReCiPe 2016 five perspective switches & Nickel vs 1,4-DCB two-way controlled rank reversals.
  const foodRoutesExcludedI = fact('rivm-metal-human-routes-he') - fact('rivm-metal-human-routes-i');
  if (!(fact('rivm-horizon-i') === 20n * scale
        && fact('rivm-horizon-h') === 100n * scale
        && fact('rivm-metal-human-routes-i') === 2n * scale
        && fact('rivm-metal-human-routes-he') === 9n * scale
        && foodRoutesExcludedI === 7n * scale
        && fact('rivm-essential-metals-count') === 5n * scale
        && fact('rivm-iarc-evaluated-he') === 844n * scale
        && fact('rivm-min-species-i') === 4n * scale
        && fact('rivm-min-species-he') === scale))
    throw new Error('Toxicity comparison lost ReCiPe 2016 Table 9.1 five perspective switch parameters');

  const perspClaim = uniqueRecord(catalog.claims, 'cl-tox123-perspective-switches');
  const expectedSwitchClause = '归趋驻留积分时间窗依次取 ' + raw('rivm-horizon-i') + ' 年、' + raw('rivm-horizon-h')
    + ' 年与无限期；第二，针对金属的人体暴露路径，个人主义鉴于生物体对金属呈次线性富集、农牧水产模型的富集因子不确定性大，只保留空气吸入与饮用水共 '
    + raw('rivm-metal-human-routes-i') + ' 条暴露途径（排除叶茎菜、根茎菜、肉、奶、鱼等 '
    + displayedDecimal(foodRoutesExcludedI, 0) + ' 条食物途径），而等级主义与平等主义纳入全部 '
    + raw('rivm-metal-human-routes-he') + ' 条吸入与经口途径；第三，针对钴、铜、锰、钼、锌共 '
    + raw('rivm-essential-metals-count') + ' 种必需金属的海洋生态毒性，个人主义仅统计大陆架近海区室，等级主义与平等主义并计远洋水体。第四，人体致癌物质范围在个人主义下仅限国际癌症研究机构（IARC）第 1、2A、2B 类证据较强的致癌物，在等级主义与平等主义下则扩展至经 IARC（2004）评估的全部 '
    + raw('rivm-iarc-evaluated-he') + ' 种物质（含第 3 类及未分类项，表 9.1 概括为全部有半数致瘤剂量 TD50 报道的化学物）；第五，生态毒性效应因子的最低受试物种数在个人主义下要求至少 '
    + raw('rivm-min-species-i') + ' 个受试物种，在后两个视角下放宽至 ' + raw('rivm-min-species-he') + ' 个受试物种。';
  if (!perspClaim?.text.includes(expectedSwitchClause))
    throw new Error('Toxicity comparison changed the displayed ReCiPe 2016 five-switch prose');

  const dcbUairEf = fact('ef31-htnc-dcb-uair');
  const niUairEf = fact('ef31-htnc-ni-uair');
  const dcbSwEf = fact('ef31-htnc-dcb-sw');
  const niSwEf = fact('ef31-htnc-ni-sw');
  const efNiDcbAirRatio = ratioScaled(niUairEf, dcbUairEf);
  const efNiDcbSwRatio = ratioScaled(niSwEf, dcbSwEf);
  const recipeINiSwRatio = ratioScaled(fact('rivm-ni-sw-htpnc-i'), fact('rivm-dcb-sw-htpnc-i'));
  const recipeHNiSwRatio = ratioScaled(fact('rivm-ni-sw-htpnc-h'), fact('rivm-dcb-sw-htpnc-he'));
  const recipeENiSwRatio = ratioScaled(fact('rivm-ni-sw-htpnc-e'), fact('rivm-dcb-sw-htpnc-he'));
  const optA_recipeI = 100n * fact('rivm-dcb-uair-ref');
  const optA_ef = 100n * dcbUairEf;
  if (!(fact('rivm-dcb-uair-ref') === scale
        && fact('rivm-dcb-sw-htpnc-i') > fact('rivm-dcb-sw-htpnc-he')
        && optA_recipeI > fact('rivm-ni-uair-htpnc-i')
        && optA_recipeI < fact('rivm-ni-uair-htpnc-h')
        && fact('rivm-ni-uair-htpnc-h') < fact('rivm-ni-uair-htpnc-e')
        && fact('rivm-ni-uair-htpc-i') < fact('rivm-ni-uair-htpc-h')
        && fact('rivm-ni-uair-htpc-h') < fact('rivm-ni-uair-htpc-e')
        && fact('rivm-ni-uair-metp-i') < fact('rivm-ni-uair-metp-h')
        && fact('rivm-ni-uair-metp-h') < fact('rivm-ni-uair-metp-e')
        && displayedDecimal(efNiDcbAirRatio, 2) === '75.95'
        && optA_ef > niUairEf
        && fact('rivm-dcb-sw-htpnc-i') > fact('rivm-ni-sw-htpnc-i')
        && fact('rivm-ni-sw-htpnc-i') === 0n
        && fact('rivm-dcb-sw-htpnc-he') < fact('rivm-ni-sw-htpnc-h')
        && fact('rivm-ni-sw-htpnc-h') < fact('rivm-ni-sw-htpnc-e')
        && fact('rivm-ni-sw-htpc-i') === 0n
        && fact('rivm-ni-sw-htpc-h') < fact('rivm-ni-sw-htpc-e')
        && dcbSwEf < niSwEf
        && displayedDecimal(recipeINiSwRatio, 0) === '0'
        && displayedDecimal(efNiDcbSwRatio, 2) === '7.22'
        && displayedDecimal(recipeHNiSwRatio, 0) === '28'
        && displayedDecimal(recipeENiSwRatio, 0) === '9634'))
    throw new Error('Toxicity comparison lost Nickel vs 1,4-DCB urban-air or seawater rank reversals');

  const niClaim = uniqueRecord(catalog.claims, 'cl-tox123-nickel-dcb-reversal');
  const expectedNiAirClause = '排入城市空气的 1 kg 镍在个人主义（' + raw('rivm-horizon-i') + ' 年、仅空气与饮水）下非致癌因子仅为 '
    + raw('rivm-ni-uair-htpnc-i') + ' kg 1,4-DCB 当量，一旦在等级主义（' + raw('rivm-horizon-h')
    + ' 年）与平等主义（无限期）下打开农牧水产 ' + displayedDecimal(foodRoutesExcludedI, 0)
    + ' 条食物链途径并拉长驻留积分，立刻跃升至 ' + raw('rivm-ni-uair-htpnc-h') + ' 与 ' + raw('rivm-ni-uair-htpnc-e')
    + '（同一 1 kg 城市空气镍排放在致癌毒性上依次为 ' + raw('rivm-ni-uair-htpc-i') + '、' + raw('rivm-ni-uair-htpc-h')
    + '、' + raw('rivm-ni-uair-htpc-e') + '，经大气向海洋跨介质沉降并随驻留积分拉长后，海洋生态毒性也从 '
    + raw('rivm-ni-uair-metp-i') + '、' + raw('rivm-ni-uair-metp-h') + ' 跳至 ' + raw('rivm-ni-uair-metp-e')
    + '）；若把 1 kg 镍直接排入海水，个人主义因剔除海产品摄入且海水不作饮用水源而精确给出 ' + raw('rivm-ni-sw-htpnc-i')
    + '，等级主义与平等主义则升至 ' + raw('rivm-ni-sw-htpnc-h') + ' 与 ' + raw('rivm-ni-sw-htpnc-e')
    + '（致癌由 ' + raw('rivm-ni-sw-htpc-i') + ' 升至 ' + raw('rivm-ni-sw-htpc-h') + ' 与 '
    + raw('rivm-ni-sw-htpc-e') + '）。';
  const expectedNiEfClause = '城市近地空气 1,4-二氯苯为 ' + mantissaExp(dcbUairEf, -8, 4) + '×10⁻⁸、镍为 '
    + mantissaExp(niUairEf, -6, 4) + '×10⁻⁶ CTUh/kg（单千克镍约为 1,4-二氯苯的 ' + displayedDecimal(efNiDcbAirRatio, 2)
    + ' 倍，落在 ReCiPe 个人主义 ' + raw('rivm-ni-uair-htpnc-i') + ' 倍与等级主义 ' + raw('rivm-ni-uair-htpnc-h')
    + ' 倍之间），100 kg 1,4-二氯苯得 ' + mantissaExp(optA_ef, -6, 4) + '×10⁻⁶ CTUh、重新高于 1 kg 镍的 '
    + mantissaExp(niUairEf, -6, 4) + '×10⁻⁶ CTUh！反过来，若甲、乙改为向海水各排 1 kg，ReCiPe 个人主义仍判 1,4-二氯苯更大（'
    + raw('rivm-dcb-sw-htpnc-i') + ' 对 ' + raw('rivm-ni-sw-htpnc-i') + '），而 ReCiPe 等级主义（'
    + raw('rivm-dcb-sw-htpnc-he') + ' 对 ' + raw('rivm-ni-sw-htpnc-h') + '）、平等主义（'
    + raw('rivm-dcb-sw-htpnc-he') + ' 对 ' + raw('rivm-ni-sw-htpnc-e') + '）与 EF 3.1（'
    + mantissaExp(dcbSwEf, -9, 4) + '×10⁻⁹ 对 ' + mantissaExp(niSwEf, -8, 4) + '×10⁻⁸ CTUh）又一致判镍更高。';
  const expectedNiCaveatRatios = '城市空气' + raw('rivm-ni-uair-htpnc-i') + '、' + displayedDecimal(efNiDcbAirRatio, 2)
    + '、' + raw('rivm-ni-uair-htpnc-h') + '、' + raw('rivm-ni-uair-htpnc-e') + '及海水'
    + displayedDecimal(recipeINiSwRatio, 0) + '、' + displayedDecimal(efNiDcbSwRatio, 2) + '、'
    + displayedDecimal(recipeHNiSwRatio, 0) + '、' + displayedDecimal(recipeENiSwRatio, 0);
  if (!niClaim?.text.includes(expectedNiAirClause)
      || !niClaim?.text.includes(expectedNiEfClause)
      || !niClaim?.caveats?.[0]?.includes(expectedNiCaveatRatios))
    throw new Error('Toxicity comparison changed the displayed Nickel vs 1,4-DCB reversal prose');

  // 4. Speciation averages / Cr(VI) equivalence, 2019 pesticide proxy, and unspecified-water asymmetry.
  const sbAvg = (fact('ef31-ecotox-sb3-fw') + fact('ef31-ecotox-sb5-fw')) / 2n;
  const asAvg = (fact('ef31-ecotox-as3-fw') + fact('ef31-ecotox-as5-fw')) / 2n;
  const htcCrFw = fact('ef31-htc-cr-fw'), htcCr6Fw = fact('ef31-htc-cr6-fw'), htcCr3Fw = fact('ef31-htc-cr3-fw');
  const ecotoxInsFw = fact('ef31-ecotox-insecticides-fw'), ecotoxChlFw = fact('ef31-ecotox-chlorpyrifos-fw');
  const htncInsFw = fact('ef31-htnc-insecticides-fw'), htncChlFw = fact('ef31-htnc-chlorpyrifos-fw');
  const cuSwEco = fact('ef31-ecotox-cu-sw');
  const dcbHtcFw = fact('ef31-htc-dcb-fw'), dcbHtcSw = fact('ef31-htc-dcb-sw'), dcbHtcUnspec = fact('ef31-htc-dcb-unspecw');
  const dcbHtcWaterAvg = (dcbHtcFw + dcbHtcSw) / 2n;
  const nfEco30 = fact('jrc130796-nf-ecotox-ef30'), nfEco31 = fact('jrc130796-nf-ecotox-ef31');
  const nfEcotoxGain = ratioScaled((nfEco31 - nfEco30) * 100n, nfEco30);
  if (displayedDecimal(sbAvg, 10) !== displayedDecimal(fact('ef31-ecotox-sb-fw'), 10)
      || displayedDecimal(asAvg, 11) !== displayedDecimal(fact('ef31-ecotox-as-fw'), 11)
      || fact('ef31-ecotox-cr-fw') <= fact('ef31-ecotox-cr3-fw')
      || htcCrFw !== htcCr6Fw
      || htcCr3Fw !== 0n
      || fact('jrc130796-pesticide-sales-year') !== 2019n * scale
      || !(ecotoxInsFw > 50000000n * scale && ecotoxChlFw > ecotoxInsFw)
      || !(htncInsFw > 0n && htncChlFw > htncInsFw)
      || !(cuSwEco > 0n && cuSwEco < 10n ** 20n)
      || fact('ef31-ecotox-dcb-fw') !== 55416n * 10n ** 39n
      || dcbHtcWaterAvg !== dcbHtcUnspec
      || displayedDecimal(nfEcotoxGain, 0) !== '33')
    throw new Error('Toxicity comparison lost speciation averages, pesticide proxy magnitude or unspecified-water math');

  const proxyClaim = uniqueRecord(catalog.claims, 'cl-tox123-speciation-and-proxies');
  const expectedValenceClause = '淡水铜直接取二价铜的 ' + raw('ef31-ecotox-cu-fw') + ' CTUe/kg；元素锑（'
    + raw('ef31-ecotox-sb-fw') + '）与元素砷（' + raw('ef31-ecotox-as-fw')
    + '）分别取各自三价（锑 ' + raw('ef31-ecotox-sb3-fw') + '、砷 ' + raw('ef31-ecotox-as3-fw')
    + '）与五价（锑 ' + raw('ef31-ecotox-sb5-fw') + '、砷 ' + raw('ef31-ecotox-as5-fw')
    + '）的算术平均；唯独元素铬没有沿用 2018 年方法报告（JRC109369）第 4.3 节曾提到的三价／六价对半均值，而是直接等同高毒六价铬——淡水生态毒性同取 '
    + raw('ef31-ecotox-cr-fw') + ' CTUe/kg（三价铬仅 ' + raw('ef31-ecotox-cr3-fw')
    + '），淡水人体致癌毒性也同取 ' + mantissaExp(htcCrFw, -5, 4) + '×10⁻⁵ CTUh/kg（三价铬为 '
    + raw('ef31-htc-cr3-fw') + '）。';
  const expectedPesticideClause = '改按 ' + raw('jrc130796-pesticide-sales-year')
    + ' 年欧盟农药销量加权平均，使三类泛指农药全部跃升至第三四分位数之上——例如排入淡水的“未指明杀虫剂”在生态毒性中达 '
    + mantissaExp(ecotoxInsFw, 7, 14) + '×10⁷ CTUe/kg（毒死蜱为 ' + mantissaExp(ecotoxChlFw, 8, 4)
    + '×10⁸ CTUe/kg），在人体非致癌毒性中达 ' + mantissaExp(htncInsFw, -4, 14) + '×10⁻⁴ CTUh/kg（毒死蜱为 '
    + raw('ef31-htnc-chlorpyrifos-fw') + ' CTUh/kg）';
  const expectedWaterClause = '海水铜在淡水生态毒性中仅 ' + mantissaExp(cuSwEco, -21, 2)
    + '×10⁻²¹ CTUe/kg），EF 3.0 取淡水与海水算术平均的做法等于把所有未指明水体排放的淡水生态毒性一律腰斩；EF 3.1 在淡水生态毒性中改为直接赋全额淡水因子（如 1,4-二氯苯同为 '
    + raw('ef31-ecotox-dcb-fw') + '、毒死蜱同为 ' + mantissaExp(ecotoxChlFw, 8, 4)
    + '×10⁸ CTUe/kg，推动全球人均归一化基准从 ' + mantissaExp(nfEco30, 4, 2) + '×10⁴ 升至 '
    + mantissaExp(nfEco31, 4, 2) + '×10⁴ CTUe/人，增幅 ' + displayedDecimal(nfEcotoxGain, 0)
    + '%），但在人体致癌与非致癌毒性中，“未指明水体”仍保留淡水与海水的算术平均（如 1,4-二氯苯致癌毒性为淡水 '
    + mantissaExp(dcbHtcFw, -7, 3) + '×10⁻⁷ 与海水 ' + mantissaExp(dcbHtcSw, -8, 3) + '×10⁻⁸ 的均值 '
    + mantissaExp(dcbHtcUnspec, -7, 4) + '×10⁻⁷ CTUh/kg）。';
  if (!proxyClaim?.text.includes(expectedValenceClause)
      || !proxyClaim?.text.includes(expectedPesticideClause)
      || !proxyClaim?.text.includes(expectedWaterClause))
    throw new Error('Toxicity comparison changed the displayed speciation, pesticide or unspecified-water prose');

  // 5. Normative zeros (long-term, outdoor CO vs indoor CO, chlorine, -44% NF drop, +4438% avoided-credit jump).
  const coIndoor = fact('ef31-htnc-co-indoor');
  const nfHtnc30 = fact('jrc130796-nf-htnc-ef30'), nfHtnc31 = fact('jrc130796-nf-htnc-ef31');
  const nfHtncDrop = ratioScaled((nfHtnc30 - nfHtnc31) * 100n, nfHtnc30);
  if (fact('jrc109369-longterm-cf') !== 0n
      || fact('ef31-htc-org-rows') + fact('ef31-htc-inorg-rows') !== fact('ef31-htc-total-rows')
      || fact('ef31-htnc-org-rows') + fact('ef31-htnc-inorg-rows') !== fact('ef31-htnc-total-rows')
      || fact('ef31-ecotox-org-rows') + fact('ef31-ecotox-inorg-rows') !== fact('ef31-ecotox-total-rows')
      || !(fact('ef31-htc-longterm-zeros') > 2000n * scale
        && fact('ef31-htnc-longterm-zeros') > 6000n * scale
        && fact('ef31-ecotox-longterm-zeros') > 12000n * scale)
      || fact('ef31-htnc-cl2-zeros') !== 13n * scale
      || fact('ef31-ecotox-cl2-fw') !== 11918n * scale
      || fact('ef31-htnc-co-outdoor-zeros') !== 15n * scale
      || coIndoor <= 0n
      || displayedDecimal(nfHtncDrop, 0) !== '44'
      || fact('jrc130796-analysed-datasets') !== 2752n * scale
      || fact('jrc130796-htnc-lower-share-pct') !== 94n * scale
      || fact('jrc130796-htnc-max-increase-pct') !== 4438n * scale)
    throw new Error('Toxicity comparison lost normative zero counts, CO indoor/outdoor split or -44% / +4438% NF impacts');

  const zeroClaim = uniqueRecord(catalog.claims, 'cl-tox123-normative-zeros');
  const coIndoorMantissa = mantissaExp(coIndoor, -6, 3);
  const expectedLongtermClause = '在人体致癌（' + raw('ef31-htc-total-rows') + ' 条因子中的 ' + raw('ef31-htc-longterm-zeros')
    + ' 条）、人体非致癌（' + raw('ef31-htnc-total-rows') + ' 条中的 ' + raw('ef31-htnc-longterm-zeros')
    + ' 条）与淡水生态毒性（' + raw('ef31-ecotox-total-rows') + ' 条中的 ' + raw('ef31-ecotox-longterm-zeros') + ' 条）中无一例外赋 0.0';
  const expectedCoClause = '遂将氯气在非致癌毒性的全部 ' + raw('ef31-htnc-cl2-zeros')
    + ' 个子区室置 0.0（但氯气排入淡水的生态毒性仍保留 ' + raw('ef31-ecotox-cl2-fw')
    + ' CTUe/kg），并把化石源、生物源与土地利用变化三类一氧化碳在非致癌毒性的全部 '
    + raw('ef31-htnc-co-outdoor-zeros') + ' 条室外空气流及 7 条水土流置 0.0，唯独在 3 条“排入室内空气”流中保留 '
    + coIndoorMantissa + '×10⁻⁶ CTUh/kg。据 JRC130796 表 10，主要因室外一氧化碳归零，全球人均非致癌归一化基准从 '
    + mantissaExp(nfHtnc30, -4, 2) + '×10⁻⁴ 骤降至 ' + mantissaExp(nfHtnc31, -4, 2) + '×10⁻⁴ CTUh/人（降幅 '
    + displayedDecimal(nfHtncDrop, 0) + '%），令受测的 ' + raw('jrc130796-analysed-datasets') + ' 个 EF 官方数据集中有 '
    + raw('jrc130796-htnc-lower-share-pct') + '% 的非致癌得分下降；与此同时，带有“替代传统能源从而避免一氧化碳与氯排放”负向抵扣的过程（典型如西班牙废加工木材焚烧数据集，以及部分沼气发电供热数据集），却因原本扣减总分的负贡献突然归零而反向暴涨最高 '
    + raw('jrc130796-htnc-max-increase-pct') + '%！';
  if (!zeroClaim?.text.includes(expectedLongtermClause)
      || !zeroClaim?.text.includes(expectedCoClause)
      || !zeroClaim?.caveats?.[0]?.includes(coIndoorMantissa + '×10⁻⁶ CTUh/kg'))
    throw new Error('Toxicity comparison changed the displayed normative-zero or avoided-credit prose');

  // 6. Archive-internal converter split, ammonia 37-location duplicates, CCl4 vs CFC-10 rounding, and report errata.
  const htcByteDiff = fact('ef31-htc-lciamethods-bytes') - fact('ef31-htc-converter-bytes');
  const htncByteDiff = fact('ef31-htnc-lciamethods-bytes') - fact('ef31-htnc-converter-bytes');
  const ecotoxByteDiff = fact('ef31-ecotox-lciamethods-bytes') - fact('ef31-ecotox-converter-bytes');
  const htncDupRows = fact('ef31-htnc-total-rows') - fact('ef31-htnc-unique-uuids');
  const ecotoxDupRows = fact('ef31-ecotox-total-rows') - fact('ef31-ecotox-unique-uuids');
  const nfHtc30 = fact('jrc130796-nf-htc-ef30'), nfHtc31 = fact('jrc130796-nf-htc-ef31');
  const nfHtcGain = ratioScaled((nfHtc31 - nfHtc30) * 100n, nfHtc30);
  const htcCcl4 = fact('ef31-htc-ccl4-uair'), htcCfc10 = fact('ef31-htc-cfc10-uair'), htcCfc10Ind = fact('ef31-htc-cfc10-indoor');
  const htncCcl4 = fact('ef31-htnc-ccl4-uair'), htncCfc10 = fact('ef31-htnc-cfc10-uair'), htncCfc10Ind = fact('ef31-htnc-cfc10-indoor');
  const rivmS5Sum = fact('rivm-s5-organics-count') + fact('rivm-s5-metals-count');
  if (htcByteDiff !== 12n * scale
      || htncByteDiff !== 12n * scale
      || ecotoxByteDiff !== 2301282n * scale
      || fact('ef31-ecotox-lactic-lciamethods') !== 10338n * 10n ** 39n
      || fact('ef31-ecotox-lactic-converter') !== 0n
      || htncDupRows !== 180n * scale || ecotoxDupRows !== 180n * scale
      || displayedDecimal(nfHtcGain, 1) !== '2.4'
      || fact('ef31-ecotox-ccl4-uair') !== 92003n * 10n ** 37n
      || htcCcl4 === htcCfc10 || mantissaExp(htcCfc10, -5, 2) !== mantissaExp(htcCcl4, -5, 2)
      || htncCcl4 === htncCfc10 || mantissaExp(htncCfc10, -6, 2) !== mantissaExp(htncCcl4, -6, 2)
      || htcCfc10Ind <= htcCfc10
      || htncCfc10Ind <= htncCfc10
      || fact('ef31-ecotox-cuii-agsoil') >= cuXml
      || rivmS5Sum !== 3093n * scale
      || fact('rivm-p65-substances-total') - rivmS5Sum !== scale)
    throw new Error('Toxicity comparison lost archive converter byte/Lactic-acid split, CCl4 rounding or RIVM 3094 vs 3093 checks');

  const pkgClaim = uniqueRecord(catalog.claims, 'cl-tox123-package-discrepancies');
  const expectedConverterClause = '致癌总表（' + raw('ef31-htc-lciamethods-bytes') + ' 对 ' + raw('ef31-htc-converter-bytes')
    + ' 字节）与非致癌总表（' + raw('ef31-htnc-lciamethods-bytes') + ' 对 ' + raw('ef31-htnc-converter-bytes')
    + ' 字节）虽因子数值全同，却因项目署名（“EC JRC”对“EC’s JRC-IES”）与数据录入者字段（“JRC, Environmental Footprint Team”对“Simone  Fazio”）及枚举标签大小写差异而相差 '
    + displayedDecimal(htcByteDiff, 0) + ' 字节；淡水生态毒性总表两处更相差 ' + displayedDecimal(ecotoxByteDiff, 0)
    + ' 字节（' + raw('ef31-ecotox-lciamethods-bytes') + ' 对 ' + raw('ef31-ecotox-converter-bytes')
    + ' 字节），且对其中一条淡水排放“乳酸（Lactic acid）”基本流，标准目录总表与有机子表（' + raw('ef31-ecotox-org-rows')
    + ' 条）均赋 ' + raw('ef31-ecotox-lactic-lciamethods') + ' CTUe/kg，转换目录同 UUID 副本却赋 0.0。此外，非致癌总表（'
    + raw('ef31-htnc-total-rows') + ' 条对应 ' + raw('ef31-htnc-unique-uuids') + ' 个唯一流 UUID）与淡水生态总表（'
    + raw('ef31-ecotox-total-rows') + ' 条对应 ' + raw('ef31-ecotox-unique-uuids')
    + ' 个唯一流 UUID）都因无机子表中 5 条氨空气流各自重复展开 37 行国别／缺省位置（数值完全相同）而多出 5×(37−1) = '
    + displayedDecimal(htncDupRows, 0) + ' 行。';
  const expectedCcl4Clause = '致癌人均归一化基准由 ' + mantissaExp(nfHtc30, -5, 2) + '×10⁻⁵ 微升至 '
    + mantissaExp(nfHtc31, -5, 2) + '×10⁻⁵ CTUh/人，原表印 2.1%），且机读包中致癌总表与有机子表版本号标为 01.01.000，而致癌无机子表 '
    + raw('ef31-htc-inorg-rows') + ' 条及非致癌、生态毒性全套 XML 仍标 01.00.000；但实测淡水生态毒性中四氯化碳与 CFC-10 城市近地空气同为五位有效数字 '
    + raw('ef31-ecotox-ccl4-uair') + ' CTUe/kg，致癌与非致癌总表中新增的四氯化碳却只保留三位有效数字（'
    + mantissaExp(htcCcl4, -5, 2) + '×10⁻⁵ 与 ' + mantissaExp(htncCcl4, -6, 2) + '×10⁻⁶ CTUh/kg，而原 CFC-10 为 '
    + mantissaExp(htcCfc10, -5, 4) + '×10⁻⁵ 与 ' + mantissaExp(htncCfc10, -6, 4)
    + '×10⁻⁶），且四氯化碳仅建了 5 条室外空气流，缺室内空气（原包小写流名“cfc-10”为 ' + mantissaExp(htcCfc10Ind, -4, 3)
    + '×10⁻⁴ 与 ' + mantissaExp(htncCfc10Ind, -5, 4) + '×10⁻⁵）及全部水土流。';
  const expectedErrataClause = 'JRC130796 第 13 页式（3）把比值分式误倒印成“HC20/(HC20×' + raw('jrc130796-hc20-hc50-factor')
    + ')”（实算结果仍写 ' + raw('jrc130796-hc20-fallback-ratio') + '），第 28 页把农田土壤二价铜因子的更新误印成未变的“'
    + mantissaExp(cu30, 4, 2) + 'E+04 至 ' + mantissaExp(cu30, 4, 2) + 'E+04”（XML 实为 '
    + raw('ef31-ecotox-cuii-agsoil') + ' CTUe/kg），JRC109369 第 14 页印出化学上不存在的六价锑“Sb(+6)”，RIVM 2016-0104 第 65 页写共 '
    + raw('rivm-p65-substances-total') + ' 种物质而第 159 页分列 ' + raw('rivm-s5-organics-count') + ' 种有机物与 '
    + raw('rivm-s5-metals-count') + ' 种统称“必需金属”的金属（相加 ' + displayedDecimal(rivmS5Sum, 0) + ' 种，且第 66 页正文明确仅 '
    + raw('rivm-essential-metals-count') + ' 种为必需金属）。';
  if (!pkgClaim?.text.includes(expectedConverterClause)
      || !pkgClaim?.text.includes(expectedCcl4Clause)
      || !pkgClaim?.text.includes(expectedErrataClause))
    throw new Error('Toxicity comparison changed the displayed package discrepancy or report errata values');

  // 7. Five-step cross-system diagnostic synthesis (Claim 8).
  const synthClaim = uniqueRecord(catalog.claims, 'cl-tox123-cross-system-synthesis');
  const expectedStep1 = 'ILCD 与 EF 只计 ' + raw('ilcd-tox-recommended-midpoints') + ' 项中点，而 ReCiPe 2016 计 '
    + raw('rivm-tox-midpoints-count') + ' 项中点却把农业土壤生态效应让位给土地利用。';
  const expectedStep2 = '查效应基准是 ' + raw('jrc130796-hc50-numerator') + '/HC50 还是欧盟 '
    + raw('jrc130796-hc20-numerator') + '/HC20';
  const expectedStep3 = '查驻留时间窗（' + raw('rivm-horizon-i') + ' 年、' + raw('rivm-horizon-h')
    + ' 年或无限期）以及农牧水产 ' + displayedDecimal(foodRoutesExcludedI, 0) + ' 条食物链暴露途径是否随个人主义视角被成批关闭。';
  const expectedStep5 = '确认有机物与含金属无机物共 ' + raw('ef31-tox-subcategories-count') + ' 套子表在需要时已分开解读。';
  if (!synthClaim?.text.includes(expectedStep1)
      || !synthClaim?.text.includes(expectedStep2)
      || !synthClaim?.text.includes(expectedStep3)
      || !synthClaim?.text.includes(expectedStep5))
    throw new Error('Toxicity comparison changed the displayed five-step diagnostic synthesis prose');

  if (consumed.size !== facts.size) {
    const unused = [...facts.keys()].filter(k => !consumed.has(k));
    throw new Error(`Toxicity comparison left unverified numeric facts: ${unused.join(', ')}`);
  }
}

const requiredLinks = {
  'midpoint-families': [
    ['ev-tox123-ilcd2011-ht', 'supports'],
    ['ev-tox123-ilcd2011-ecotox', 'supports'],
    ['ev-tox123-rivm-ch9-framework', 'supports'],
    ['ev-tox123-recipe2017-tox', 'context'],
  ],
  'hc20-and-metals': [
    ['ev-tox123-ilcd2011-ecotox', 'context'],
    ['ev-tox123-jrc130796-hc20-proxies', 'supports'],
    ['ev-tox123-ef31-addendum', 'supports'],
    ['ev-tox123-ef31-ecotox-xml', 'supports'],
  ],
  'perspective-switches': [
    ['ev-tox123-rivm-ch9-framework', 'supports'],
    ['ev-tox123-recipe2017-tox', 'context'],
  ],
  'nickel-dcb-reversal': [
    ['ev-tox123-rivm-ch9-table93', 'supports'],
    ['ev-tox123-ef31-htnc-xml', 'supports'],
  ],
  'speciation-and-proxies': [
    ['ev-tox123-jrc109369-tox', 'context'],
    ['ev-tox123-jrc130796-hc20-proxies', 'supports'],
    ['ev-tox123-jrc130796-nf-impacts', 'supports'],
    ['ev-tox123-ef31-htc-xml', 'supports'],
    ['ev-tox123-ef31-htnc-xml', 'supports'],
    ['ev-tox123-ef31-ecotox-xml', 'supports'],
  ],
  'normative-zeros': [
    ['ev-tox123-jrc109369-tox', 'supports'],
    ['ev-tox123-jrc130796-hc20-proxies', 'supports'],
    ['ev-tox123-jrc130796-nf-impacts', 'supports'],
    ['ev-tox123-ef31-htc-xml', 'supports'],
    ['ev-tox123-ef31-htnc-xml', 'supports'],
    ['ev-tox123-ef31-ecotox-xml', 'supports'],
  ],
  'package-discrepancies': [
    ['ev-tox123-jrc109369-tox', 'supports'],
    ['ev-tox123-jrc130796-hc20-proxies', 'supports'],
    ['ev-tox123-jrc130796-nf-impacts', 'supports'],
    ['ev-tox123-ef31-addendum', 'supports'],
    ['ev-tox123-ef31-htc-xml', 'supports'],
    ['ev-tox123-ef31-htnc-xml', 'supports'],
    ['ev-tox123-ef31-ecotox-xml', 'supports'],
    ['ev-tox123-rivm-ch9-framework', 'supports'],
  ],
  'cross-system-synthesis': [
    ['ev-tox123-ilcd2011-ecotox', 'supports'],
    ['ev-tox123-jrc130796-hc20-proxies', 'supports'],
    ['ev-tox123-ef31-ecotox-xml', 'supports'],
    ['ev-tox123-rivm-ch9-framework', 'supports'],
    ['ev-tox123-rivm-ch9-table93', 'supports'],
  ],
};

function validateSupportLinks(catalog) {
  const claimEntries = Object.entries(requiredLinks);
  if (catalog.claims.filter(row => row.id.startsWith('cl-tox123-')).length !== claimEntries.length)
    throw new Error('Toxicity comparison claim count differs from its pinned claim inventory');
  for (const [claimName, expectedLinks] of claimEntries) {
    const id = 'cl-tox123-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.evidenceIds?.length !== expectedLinks.length || claim?.evidenceLinks?.length !== expectedLinks.length)
      throw new Error(`Toxicity comparison changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of expectedLinks) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation
          || !scienceText(links[0].rationale))
        throw new Error(`Toxicity comparison lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
