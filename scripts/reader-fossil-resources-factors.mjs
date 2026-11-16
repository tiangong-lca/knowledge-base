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
    sourceId: 'src-fossil117-ef31-selected-members',
    readingId: 'rd-flow-pilot-ef31',
    artifact: {
      id: 'art-fossil117-ef-method-fossil',
      mediaType: 'application/xml',
      sha256: 'd9b4f8480a8e916e37b1403fc70e68241edbe71098e26cadc41e5f5caaa9fb93',
      resolvedUrl: efUrl,
    },
  },
  adpArticle: {
    sourceId: 'src-mineral115-vanoers2020',
    readingId: 'rd-mineral115-vanoers2020',
    sourceArtifact: {
      mediaType: 'text/html',
      sha256: '4a9daf1b4128b79a5d897e59e44b565027565d6f670463747bbf199416f4da37',
      resolvedUrl: 'https://link.springer.com/article/10.1007/s11367-019-01683-x',
    },
    artifact: {
      id: 'art-mineral115-vanoers2020-pdf',
      mediaType: 'application/pdf',
      sha256: 'd40bf71bd658311fbeb1d926f8aa05b1a1cb0a82d9deab11f1bd447f618eee62',
      resolvedUrl: 'https://link.springer.com/content/pdf/10.1007/s11367-019-01683-x.pdf',
      pageCount: 15,
    },
  },
  adpEsm1: {
    sourceId: 'src-mineral115-vanoers2020-esm1',
    readingId: 'rd-mineral115-vanoers2020-esm1',
    artifact: {
      id: 'art-mineral115-vanoers2020-esm1',
      mediaType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sha256: 'a5e1bcd6e75840dc3d7bd5d78bb3f111048e8c8789cabea439c2919eac83830d',
      resolvedUrl: 'https://static-content.springer.com/esm/art%3A10.1007%2Fs11367-019-01683-x/MediaObjects/11367_2019_1683_MOESM1_ESM.xlsx',
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
};

const efSelectedMembers = [
  ['art-fossil117-ef-method-fossil', 'd9b4f8480a8e916e37b1403fc70e68241edbe71098e26cadc41e5f5caaa9fb93'],
  ['art-fossil117-ef-method-mineral', '903dc1764187342f518c5fc00e6519cd0082cfe207569592f77adadb18568b06'],
  ['art-fossil117-ef-flow-uranium', '52205aa9ee75d7800d7e7de3c36c78c2ce8b22360a73cd33b39e8e57e0a1bfd2'],
  ['art-fossil117-ef-flow-crude-oil', '3e9e130991f00eb48a0c0319d94959e92449b581050a6044a640c5d4b89075ea'],
  ['art-fossil117-ef-flow-hard-coal', 'a8a145e591553a5e9c5cb50259f0fae62779710aa51f90e751bcf32aaaf8db9e'],
  ['art-fossil117-ef-flow-natural-gas', '277f462878362a582136f88718682b5011a3b3706f10f42d2b4d05c88409950a'],
  ['art-fossil117-ef-flow-brown-coal', '5fe0b744caa3205c603ea3be1efd246079a2bd027a87f9d3954b2c5e23b0fe7b'],
  ['art-fossil117-ef-flow-peat', 'cddaf3944f176bf123ace3897342815c25757070f8a45d6d87d0db43aa8e07c2'],
  ['art-fossil117-ef-prop-ncv', '663302222eecf33a78ee279fb58d74a9f6f870098d9002a740dff7b88bc64595'],
  ['art-fossil117-ef-unit-energy', 'c5da0d544c6bb9b9022dd22a2b70215362e2f18a1aee79743c54609564f83b4d'],
];

// Identity digests bind the exact source, reading, passage locator/pages/artifact
// and every numericFact / numericFacts row (value, unit, quantity, subject, basis).
const evidenceRows = [
  ['ilcd2011-exergy-and-adp', 'ilcd', 'psg-fossil117-ilcd2011-exergy-scarcity', null,
    'd04667abdcc7f843d763f71c4220dd85cb70eb7b94d6f048131d09e297145382'],
  ['ilcd2011-combined-adp', 'ilcd', 'psg-fossil117-ilcd2011-adp-combined', null,
    'f25b4e65d2da21272504c256ef93b7e7128f1bc49336a31f224099e04e338259'],
  ['jrc109369-energy-carriers', 'jrc109369', 'psg-fossil117-jrc109369-energy-carriers', null,
    '5f8455bfa08a06ab75fa8a5dd86992072b1a67031c6a19ce8c6004cb466bc722'],
  ['ef31-unchanged-resources', 'jrc130796', 'psg-fossil117-ef31-unchanged-resources', null,
    '9169083a1fbdbcf1768e37573c79e384349459d79233c31bfe5d39b5951918b1'],
  ['ef31-fossil-factors', 'ef31', 'psg-fossil117-ef31-fossil-method', 'art-fossil117-ef-method-fossil',
    'fad1d4dc1934a59b6a7613b3eb6bc0a3bf4ff71ccc7953550733e45c5a678949'],
  ['ef31-ncv-and-mineral-boundary', 'ef31', 'psg-fossil117-ef31-ncv-property', 'art-fossil117-ef-prop-ncv',
    'ef6e5c47cc1b39f35570ca825d4a10f3116945697e47ea59278beeaa0d90e2d9'],
  ['adp2020-split', 'adpArticle', 'psg-fossil117-adp2020-split', null,
    '168796b236a5e70292175753723ea561945a131614c24831fc76341664f7d032'],
  ['adp2020-uranium-element', 'adpArticle', 'psg-fossil117-adp2020-uranium-pef', null,
    'c80d50716550be09d62c5e681ec9c821b64346abd334fc878d3a23b46b8954c1'],
  ['esm1-elements-scope', 'adpEsm1', 'psg-fossil117-esm1-elements-scope', null,
    '5d0371d79f27c74fa2994a8879086c80811c9cd5429c6571d50c714d576ac775'],
  ['esm1-uranium', 'adpEsm1', 'psg-fossil117-esm1-uranium-row', null,
    '2ab48a824696bb3eb0ea05b1fb1c7355ae6a9101a3fa2d55c8ced2c93af23395'],
  ['rivm-uranium-sop', 'rivm', 'psg-fossil117-rivm-uranium-mineral', null,
    '0a0a5c269e60c052289e50908db9f02cee37b82063bcfd80f649e4c4910de5b3'],
  ['rivm-ffp-and-hhv', 'rivm', 'psg-fossil117-rivm-ffp-midpoint', null,
    '14c0aabbedfbbd41b938ebbc683eed88fbaa499741b9ff03b99e6535bcb188df'],
  ['rivm-scp-endpoint', 'rivm', 'psg-fossil117-rivm-scp-endpoint', null,
    '376c88de4dc618cb9a4f0fa15a0f05c2cec8974fe766e9e84adf907973644b3d'],
  ['rivm-scp-curve-discrepancy', 'rivm', 'psg-fossil117-rivm-scp-curve-discrepancy', null,
    'f41a1dcb5ace2b482827efb717fd24299e69db821f14e8833471027e1b5f0e6c'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateFossilResourcesFactors(catalog, readings) {
  if (catalog.evidence.filter(row => row.id.startsWith('ev-fossil117-')).length !== evidenceRows.length)
    throw new Error('Fossil resources evidence count differs from its pinned row inventory');
  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...defaultSourceArtifact } = expected.artifact;
    const expectedSourceArtifact = expected.sourceArtifact ?? defaultSourceArtifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId
        || !sameScienceValue(source.artifact, expectedSourceArtifact))
      throw new Error(`Fossil resources changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const efReading = observed.get('ef31').reading;
  for (const [id, sha] of efSelectedMembers) {
    if (!sameScienceValue(uniqueRecord(efReading.artifacts, id), {
      id, mediaType: 'application/xml', sha256: sha, resolvedUrl: efUrl,
    })) throw new Error(`Fossil resources changed a verified EF 3.1 XML member: ${id}`);
  }

  const facts = new Map();
  for (const [name, kind, passageId, overrideArtifactId, digest] of evidenceRows) {
    const id = 'ev-fossil117-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, passageId);
    const expectedArtifactId = overrideArtifactId ?? expected.artifact.id;
    if (!record || !passage || record.sourceId !== expected.sourceId || record.readingId !== expected.readingId
        || record.passageId !== passageId || passage.artifactId !== expectedArtifactId)
      throw new Error(`Fossil resources changed the selected row or support passage: ${id}`);
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
      throw new Error(`Fossil resources changed the selected row or support passage: ${id}`);
    if (record.numericFact) facts.set(name, record.numericFact.value);
    for (const item of record.numericFacts ?? []) {
      if (facts.has(item.id)) throw new Error(`Fossil resources duplicated numeric fact id: ${item.id}`);
      facts.set(item.id, item.value);
    }
  }
  if (facts.size !== 31) throw new Error(`Fossil resources expected 31 verified numeric facts, got ${facts.size}`);
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
  if (facts.get('esm1-uranium') !== '0.0078231761897435744'
      || fact('rivm-sop-u-i') <= fact('rivm-sop-u-he'))
    throw new Error('Fossil resources lost full-precision uranium ADP or SOP scenario ordering');

  if (fact('hhv-peat') !== fact('hhv-brown-coal')
      || fact('ffp-peat') !== fact('ffp-brown-coal')
      || fact('scp-peat-e-proxy') !== fact('scp-brown-coal-e-proxy')
      || fact('scp-brown-coal-e-proxy') !== fact('scp-hard-coal-ihe'))
    throw new Error('Fossil resources lost brown-coal/peat HHV, FFP or hard-coal egalitarian proxy parity');

  for (const carrier of ['brown-coal', 'crude-oil', 'hard-coal', 'natural-gas', 'peat', 'uranium']) {
    if (fact('ef31-adp-fossil-' + carrier) !== scale)
      throw new Error(`Fossil resources changed EF 3.1 equal-energy factor for ${carrier}`);
  }

  // Verify Table 13.1 2-decimal rounding from Table S9.1 HHV ratios.
  const oilHhv = fact('hhv-crude-oil');
  for (const [fuel, ffpId] of [
    ['natural-gas', 'ffp-natural-gas'],
    ['hard-coal', 'ffp-hard-coal'],
    ['brown-coal', 'ffp-brown-coal'],
    ['peat', 'ffp-peat'],
  ]) {
    if (displayedDecimal(ratioScaled(fact('hhv-' + fuel), oilHhv), 2) !== facts.get(ffpId))
      throw new Error(`Fossil resources lost HHV-to-FFP rounding consistency for ${fuel}`);
  }

  // Equal 1 kg oil-eq midpoint -> divergent endpoint SCP in USD2013.
  const gasAmount = displayedDecimal(ratioScaled(scale, fact('ffp-natural-gas')), 3);
  const coalAmount = displayedDecimal(ratioScaled(scale, fact('ffp-hard-coal')), 3);
  const oilCost = ratioScaled(fact('scp-crude-oil-ihe'), fact('ffp-crude-oil'));
  const gasCost = ratioScaled(fact('scp-natural-gas-ihe'), fact('ffp-natural-gas'));
  const coalCost = ratioScaled(fact('scp-hard-coal-ihe'), fact('ffp-hard-coal'));
  const brownProxyCost = ratioScaled(fact('scp-brown-coal-e-proxy'), fact('ffp-brown-coal'));
  const peatProxyCost = ratioScaled(fact('scp-peat-e-proxy'), fact('ffp-peat'));
  const unroundedGasCost = (ratioScaled(oilHhv, fact('hhv-natural-gas')) * fact('scp-natural-gas-ihe') + scale / 2n) / scale;
  const unroundedCoalCost = (ratioScaled(oilHhv, fact('hhv-hard-coal')) * fact('scp-hard-coal-ihe') + scale / 2n) / scale;
  const oilToCoalRatio = ratioScaled(oilCost, coalCost);
  const brownToCoalRatio = ratioScaled(brownProxyCost, coalCost);

  if (brownProxyCost !== peatProxyCost
      || !(oilCost > gasCost && gasCost > brownProxyCost && brownProxyCost > coalCost))
    throw new Error('Fossil resources lost equal-midpoint endpoint cost ordering');

  const equalMidpoint = uniqueRecord(catalog.claims, 'cl-fossil117-equal-midpoint');
  const equalSetup = '按表 13.1，开采 ' + facts.get('ffp-crude-oil') + ' kg 原油、约 '
    + gasAmount + ' Nm³ 天然气（1/' + facts.get('ffp-natural-gas') + '）或约 '
    + coalAmount + ' kg 硬煤（1/' + facts.get('ffp-hard-coal')
    + '），中点结果同样是 1 kg 油当量。再乘表 13.2 对各燃料分别拟合的终点因子——原油 '
    + facts.get('scp-crude-oil-ihe') + ' USD2013/kg、天然气 '
    + facts.get('scp-natural-gas-ihe') + ' USD2013/Nm³、硬煤 '
    + facts.get('scp-hard-coal-ihe') + ' USD2013/kg——';
  const equalDisplay = '这三笔等热值开采对应的终点额外费用分别约为 '
    + displayedDecimal(oilCost, 3) + '、' + displayedDecimal(gasCost, 3) + ' 和 '
    + displayedDecimal(coalCost, 3) + ' USD2013，原油约为硬煤的 '
    + displayedDecimal(oilToCoalRatio, 1) + ' 倍（即便改用附表未舍入的高位热值比 '
    + facts.get('hhv-crude-oil') + '/' + facts.get('hhv-natural-gas') + ' 与 '
    + facts.get('hhv-crude-oil') + '/' + facts.get('hhv-hard-coal')
    + ' 折算开采量，天然气与硬煤仍分别约为 '
    + displayedDecimal(unroundedGasCost, 3) + ' 与 ' + displayedDecimal(unroundedCoalCost, 4) + ' USD2013，悬殊依旧）。';
  if (!equalMidpoint?.text.includes(equalSetup) || !equalMidpoint?.text.includes(equalDisplay))
    throw new Error('Fossil resources changed the displayed equal-midpoint SCP divergence calculation');

  const proxyConsequence = uniqueRecord(catalog.claims, 'cl-fossil117-proxy-consequence');
  const brownAmount = displayedDecimal(ratioScaled(scale, fact('ffp-brown-coal')), 3);
  const proxyDisplay = '按表 13.1 的 ' + facts.get('ffp-brown-coal')
    + ' kg 油当量/kg 计算，要凑足同样的 1 kg 油当量中点，需要开采约 '
    + brownAmount + ' kg（1/' + facts.get('ffp-brown-coal') + '）褐煤或泥炭';
  const proxyBasis = '表 13.2 把硬煤的 ' + facts.get('scp-hard-coal-ihe')
    + ' USD2013/kg 直接按每千克质量套用到褐煤和泥炭上，并未按两者较低的热值（'
    + facts.get('hhv-brown-coal') + ' 对 ' + facts.get('hhv-hard-coal') + ' MJ-eq/kg）折减，';
  const proxyResult = '结果同一 1 kg 油当量的褐煤或泥炭在终点变为约 '
    + displayedDecimal(brownProxyCost, 3) + ' USD2013（'
    + facts.get('scp-brown-coal-e-proxy') + '/' + facts.get('ffp-brown-coal') + '），约为同热值硬煤（约 '
    + displayedDecimal(coalCost, 3) + ' USD2013）的 ' + displayedDecimal(brownToCoalRatio, 1) + ' 倍。';
  if (!proxyConsequence?.text.includes(proxyDisplay)
      || !proxyConsequence?.text.includes(proxyBasis)
      || !proxyConsequence?.text.includes(proxyResult))
    throw new Error('Fossil resources changed the displayed egalitarian brown-coal/peat proxy calculation');
}

const requiredLinks = {
  'scarcity-energy': [
    ['ev-fossil117-ilcd2011-exergy-and-adp', 'supports'],
    ['ev-fossil117-ilcd2011-combined-adp', 'supports'],
    ['ev-fossil117-jrc109369-energy-carriers', 'supports'],
    ['ev-fossil117-ef31-unchanged-resources', 'supports'],
    ['ev-fossil117-ef31-fossil-factors', 'supports'],
    ['ev-fossil117-adp2020-split', 'context'],
  ],
  'heating-basis': [
    ['ev-fossil117-ef31-fossil-factors', 'supports'],
    ['ev-fossil117-ef31-ncv-and-mineral-boundary', 'supports'],
    ['ev-fossil117-rivm-ffp-and-hhv', 'supports'],
  ],
  'uranium-boundary': [
    ['ev-fossil117-jrc109369-energy-carriers', 'supports'],
    ['ev-fossil117-ef31-fossil-factors', 'supports'],
    ['ev-fossil117-ef31-ncv-and-mineral-boundary', 'supports'],
    ['ev-fossil117-adp2020-uranium-element', 'supports'],
    ['ev-fossil117-esm1-elements-scope', 'context'],
    ['ev-fossil117-esm1-uranium', 'supports'],
    ['ev-fossil117-rivm-uranium-sop', 'supports'],
  ],
  'scenario-proxy': [
    ['ev-fossil117-rivm-scp-endpoint', 'supports'],
    ['ev-fossil117-rivm-scp-curve-discrepancy', 'supports'],
  ],
  'equal-midpoint': [
    ['ev-lcia-mid-end-conversion-limits', 'supports'],
    ['ev-fossil117-rivm-ffp-and-hhv', 'supports'],
    ['ev-fossil117-rivm-scp-endpoint', 'supports'],
  ],
  'proxy-consequence': [
    ['ev-fossil117-rivm-ffp-and-hhv', 'supports'],
    ['ev-fossil117-rivm-scp-endpoint', 'supports'],
  ],
  'printed-limits': [
    ['ev-fossil117-rivm-ffp-and-hhv', 'supports'],
    ['ev-fossil117-rivm-scp-curve-discrepancy', 'supports'],
  ],
  bridge: [
    ['ev-fossil117-jrc109369-energy-carriers', 'supports'],
    ['ev-fossil117-ef31-fossil-factors', 'supports'],
    ['ev-fossil117-rivm-ffp-and-hhv', 'supports'],
    ['ev-fossil117-rivm-scp-endpoint', 'supports'],
  ],
};

function validateSupportLinks(catalog) {
  for (const [claimName, expectedLinks] of Object.entries(requiredLinks)) {
    const id = 'cl-fossil117-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    if (claim?.evidenceIds?.length !== expectedLinks.length || claim?.evidenceLinks?.length !== expectedLinks.length)
      throw new Error(`Fossil resources changed the evidence link roster for ${id}`);
    for (const [evidenceId, relation] of expectedLinks) {
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== relation)
        throw new Error(`Fossil resources lost the explicit ${relation} link for ${id}: ${evidenceId}`);
    }
  }
}
