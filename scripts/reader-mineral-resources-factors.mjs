import { editionDigest } from './reader-current-edition.mjs';
import { sameScienceValue } from './reader-scientific-delta.mjs';

const carriers = {
  adp: { sourceId: 'src-mineral115-vanoers2020-esm1', readingId: 'rd-mineral115-vanoers2020-esm1',
    artifact: {
      id: "art-mineral115-vanoers2020-esm1",
      mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sha256: "a5e1bcd6e75840dc3d7bd5d78bb3f111048e8c8789cabea439c2919eac83830d",
      resolvedUrl: "https://static-content.springer.com/esm/art%3A10.1007%2Fs11367-019-01683-x/MediaObjects/11367_2019_1683_MOESM1_ESM.xlsx",
    } },
  report: { sourceId: 'src-land111-rivm2016', readingId: 'rd-land111-rivm2016',
    artifact: {
      id: "art-land111-rivm2016-pdf",
      mediaType: "application/pdf",
      sha256: "56f3124beba99cb3b2bd2d48bd9dc6a7d96a18275568e9575ea600052ec60597",
      resolvedUrl: "https://rivm.openrepository.com/server/api/core/bitstreams/2082d9d2-415a-4f90-9456-fff9bc590bb6/content",
      pageCount: 194,
    } },
  supplement: { sourceId: 'src-mineral115-vieira2016-supplement', readingId: 'rd-mineral115-vieira2016-supplement',
    artifact: {
      id: "art-mineral115-vieira2016-supplement",
      mediaType: "application/pdf",
      sha256: "80ee6f2e401369baa64dd99f574143cb911d993f1582dd9d217092e424dedc13",
      resolvedUrl: "https://mdpi-res.com/d_attachment/resources/resources-05-00002/article_deploy/resources-05-00002-s001.pdf",
      pageCount: 3,
    } },
  article: { sourceId: 'src-mineral115-vieira2016', readingId: 'rd-mineral115-vieira2016',
    artifact: {
      id: "art-mineral115-vieira2016",
      mediaType: "application/pdf",
      sha256: "18c65c9d0edf814bb87edc54e93154e96a19302b1aa46c7040a57dd4c4a28c19",
      resolvedUrl: "https://mdpi-res.com/d_attachment/resources/resources-05-00002/article_deploy/resources-05-00002-v2.pdf",
      pageCount: 12,
    } },
};

// Identity digests cover the selected row locator, printed and PDF pages,
// carrier-specific passage and the exact numeric fact with its unit and basis.
const comparisons = [
  ['adp-cu', 'adp', '0.021343167358800229',
    'd9374d62c431d72b8c739197b4db4bbee79d1405eb398f27961e24df30affe22'],
  ['adp-ni', 'adp', '0.00081471837508660216',
    '952c3488872b90d7a8e970daa663d106fd534b56132ac9ec6840cd0650e68ea6'],
  ['adp-mn', 'adp', '0.000025050438058630777',
    '6dda35c69e4267ba4aedd807ada02b0378e39ea9aedc815ecb1582534e382c39'],
  ['scp-r-cu', 'supplement', '0.521',
    '80e68f9bc3e04673b77660b98263e9ca69eda7cc3c98d2ff375dd53908415f58'],
  ['scp-r-ni', 'supplement', '2.54',
    'fe519128834f93c2644817e3411c934cc133101ad678591c483133a35820795a'],
  ['scp-r-mn', 'supplement', '1.39',
    'a57fbf1005aa6736581abd9e88e932e7e5d3710b7583b68974a0aa7ac6a0ac16'],
  ['scp-urr-cu', 'supplement', '0.744',
    '4a099873c2b734ef9a14ea427261989b18134112ebce44c5b02f7f6af17af144'],
  ['scp-urr-ni', 'supplement', '5.62',
    '29b2a657ca215ad02e447db2c4b37bd51bd00d70f60cfbce74916420cd1ab536'],
  ['scp-urr-mn', 'supplement', '4.42',
    '6ab527e3b57f21caf0e5fc5725cb4ca6459f8cba6c73ec1f518eac1c31b815d6'],
  ['sop-i-cu', 'report', '1.00',
    'ec80f87b43d00b3cb6199f42a2b273265f393688bee5c66680f61a7c851fb987'],
  ['sop-i-ni', 'report', '1.85',
    'c57e6e0b098b7a45e32f35c3fad9bab5ba869e7a6dc09757f5ed7487692154e7'],
  ['sop-i-mn', 'report', '0.0376',
    '7b6be95f6ab668aff4971669d6d5ce83b801a00430dee59a0e6aaa35d42aafc2'],
  ['sop-he-cu', 'report', '1.00',
    '272c1a37d562c0a95b3df767d3ab17696bf3191b3ef80340e12c94c39bc3006a'],
  ['sop-he-ni', 'report', '2.89',
    'a9ae3a50b59c4849deceb30c47a99111b25ffa7499213ad4bbfe9539a7db7c1c'],
  ['sop-he-mn', 'report', '0.0823',
    'eb2e6c4c430518e2bcef916b9183da2ba5e2f745b86072254d2d153fb68604b9'],
  ['conversion-i', 'report', '0.16',
    '8c5e2545bae0bc72ebe43baebdba689e46ad3b9d1d83941c0f6b99faad8dcc45'],
  ['conversion-he', 'report', '0.23',
    'a561d9c762787933aa111163da9d5721776cfef8a0ce88124b4973720f204dae'],
];

// Supporting passages for matching displayed reserve and starting values.
const reserveControl = [
  ['rivm-sop-method', 'report', null,
    '2bbff22422294fc64d7e89f6ae78f91ec989d4705ef2c555e12e83e839ea29bb'],
  ['scp-sample-boundary', 'supplement', null,
    'd46b248d278e67a919195db9dcee82d2fa72bdd25c72e051a5891676784647a8'],
  ['scp-start', 'article', null,
    '3f34444ac79c65ba0415fd20e6d99c337dfa9a975b20b0a0b02e4aac87e51bf1'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateMineralResourcesFactors(catalog, readings) {
  const observed = new Map();
  for (const [kind, expected] of Object.entries(carriers)) {
    const reading = uniqueRecord(readings.readings, expected.readingId);
    const source = uniqueRecord(catalog.sources, expected.sourceId);
    const { id, ...sourceArtifact } = expected.artifact;
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected.artifact)
        || source?.reading?.readingId !== expected.readingId || !sameScienceValue(source.artifact, sourceArtifact))
      throw new Error(`Mineral resources changed the independently observed carrier: ${expected.readingId}`);
    observed.set(kind, { ...expected, reading });
  }
  const values = new Map(), controlFacts = new Map();
  for (const [name, kind, value, digest] of [...comparisons, ...reserveControl]) {
    const id = 'ev-mineral115-' + name;
    const expected = observed.get(kind);
    const record = uniqueRecord(catalog.evidence, id);
    const passage = uniqueRecord(expected.reading.passages, 'psg-mineral115-' + name);
    if (!record || !passage || record.sourceId !== expected.sourceId || record.readingId !== expected.readingId
        || record.passageId !== passage.id || passage.artifactId !== expected.artifact.id
        || (record.numericFact?.value ?? null) !== value)
      throw new Error(`Mineral resources changed the selected row or support passage: ${id}`);
    const identity = { locator: record.locator, passage: {
      id: passage.id, artifactId: passage.artifactId, locator: passage.locator,
      printedPages: passage.printedPages, pdfIndices: passage.pdfIndices,
    }, fact: record.numericFact };
    if (value === null) {
      identity.controlFacts = record.numericFacts;
      identity.controlSummary = record.summary;
    }
    if (editionDigest(identity) !== digest)
      throw new Error(`Mineral resources changed the selected row or support passage: ${id}`);
    if (value !== null) values.set(name, value);
    else for (const fact of record.numericFacts) controlFacts.set(fact.id, fact.value);
  }
  validateReserveControl(controlFacts);
  validateComparisons(values, catalog);
  validateComparisonSupport(catalog);
}

function validateReserveControl(facts) {
  const displayed = [
    ['cu-r', '690000000000'],
    ['cu-cme', '592000000000'],
    ['mn-r', '570000000000'],
    ['mn-cme', '580000000000'],
  ];
  for (const [name, value] of displayed) {
    if (facts.get('nf-mineral115-rivm-' + name) !== value || facts.get('nf-mineral115-scp-' + name) !== value)
      throw new Error('Mineral resources changed a matched displayed reserve or starting quantity: ' + name);
  }
}

function exactDecimal(value, places) {
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole + fraction.padEnd(places, '0'));
}

function displayedDecimal(value, places) {
  const step = 10n ** BigInt(24 - places);
  const rounded = ((value + step / 2n) / step).toString().padStart(places + 1, '0');
  return rounded.slice(0, -places) + '.' + rounded.slice(-places);
}

function validateComparisons(values, catalog) {
  const fact = id => exactDecimal(values.get(id), 24);
  if (!(fact('adp-cu') > fact('adp-ni') && fact('adp-ni') > fact('adp-mn')
      && fact('sop-he-ni') > fact('sop-he-cu') && fact('sop-he-cu') > fact('sop-he-mn')
      && fact('conversion-he') > 0n && fact('conversion-i') > 0n
      && fact('scp-urr-ni') > fact('scp-urr-mn') && fact('scp-urr-mn') > fact('scp-urr-cu')
      && fact('sop-i-cu') > fact('sop-i-mn') && fact('scp-r-mn') > fact('scp-r-cu')))
    throw new Error('Mineral resources lost a verified ranking or positive common rate');
  const d = 10n ** 24n;
  const he = new Map();
  for (const [metal, expected] of [['cu', '0.23'], ['ni', '0.6647'], ['mn', '0.018929']]) {
    const cost = fact('conversion-he') * fact('sop-he-' + metal);
    if (cost !== exactDecimal(expected, 24) * d)
      throw new Error('Mineral resources changed the exact book calculation for ' + metal);
    he.set(metal, cost / d);
  }
  const proposal = uniqueRecord(catalog.claims, 'cl-mineral115-cost-proxy');
  const heDisplay = '铜、镍、锰的未来额外费用因子分别为 ' + displayedDecimal(he.get('cu'), 2)
    + '、约 ' + displayedDecimal(he.get('ni'), 3) + ' 和约 ' + displayedDecimal(he.get('mn'), 4)
    + ' USD2013/kg 开采元素；';
  if (!proposal?.text.includes(heDisplay))
    throw new Error('Mineral resources changed the displayed H/E cost comparison');

  const reserveCost = fact('conversion-i') * fact('sop-i-mn');
  if (reserveCost !== exactDecimal('0.006016', 24) * d)
    throw new Error('Mineral resources changed the exact reserve-scenario book calculation for manganese');

  const calibration = uniqueRecord(catalog.claims, 'cl-mineral115-calibration');
  const reserveDisplay = '统一换算得到的铜为 ' + displayedDecimal(fact('conversion-i'), 2)
    + '、锰约为 ' + displayedDecimal(reserveCost / d, 5) + ' USD2013/kg，逐金属模型则分别为 '
    + values.get('scp-r-cu') + ' 和 ' + values.get('scp-r-mn') + '。';
  if (!calibration?.text.includes(reserveDisplay))
    throw new Error('Mineral resources changed the displayed reserve-scenario comparison');
}

const requiredSupports = {
  rank: ['adp-cu', 'adp-ni', 'adp-mn', 'sop-he-cu', 'sop-he-ni', 'sop-he-mn'],
  'cost-proxy': ['conversion-he', 'sop-he-cu', 'sop-he-ni', 'sop-he-mn'],
  'metal-cost': ['scp-urr-cu', 'scp-urr-ni', 'scp-urr-mn', 'sop-he-cu', 'sop-he-mn', 'conversion-he'],
  calibration: ['rivm-sop-method', 'scp-sample-boundary', 'scp-start', 'sop-i-cu', 'sop-i-mn',
    'scp-r-cu', 'scp-r-mn', 'conversion-i', 'sop-he-cu', 'sop-he-mn', 'scp-urr-cu', 'scp-urr-mn', 'conversion-he'],
};

function validateComparisonSupport(catalog) {
  for (const [claimName, evidence] of Object.entries(requiredSupports)) {
    const id = 'cl-mineral115-' + claimName;
    const claim = uniqueRecord(catalog.claims, id);
    for (const factName of evidence) {
      const evidenceId = 'ev-mineral115-' + factName;
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      if (!claim?.evidenceIds.includes(evidenceId) || links.length !== 1 || links[0].relation !== 'supports')
        throw new Error(`Mineral resources lost the explicit support for ${id}: ${evidenceId}`);
    }
  }
}
