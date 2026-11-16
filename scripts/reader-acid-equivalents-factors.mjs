import { sameScienceValue } from './reader-scientific-delta.mjs';

const efReading = 'rd-flow-pilot-ef31';
const efSource = 'src-acid113-ef31-selected-members';
const packageUrl = 'https://eplca.jrc.ec.europa.eu/permalink/EF3_1/EF-v3.1.zip';
const flowVersion = '03.00.004';
const methods = {
  acid: ['b5c611c6-def3-11e6-bf01-fe55135034f3', '01.04.000', 'H⁺', '酸化中点表征因子',
    '1a09e9e8533cc6f1027f260c2672ca6f8dd231618fe81939ed1fc22d5e066f8f'],
  nutrient: ['b5c614d2-def3-11e6-bf01-fe55135034f3', '01.02.009', 'N', '陆地富营养化中点表征因子',
    '72f1187a0682e186bdedf74f60fe99a1e1dafa7469141af74dfe4ea21c296992'],
};
const flows = {
  so2: ['fe0acd60-3ddc-11dd-ac4b-0050c2490048', 'SO₂', 'cc46ef66f1c70d3e78ae767b7a4aea2f1230c5d08a8e92d9da274b70e4bba0d6'],
  nh3: ['08a91e70-3ddc-11dd-96af-0050c2490048', 'NH₃', '7ecf0df726c9e79abb486da9d8f98e8a24978900ed664ee3d58185edc848f34c'],
};
const pairs = [
  ['so2', 'acid', 'so2', '2.12', '0.032'],
  ['nh3-acid', 'acid', 'nh3', '3.655', '0.021'],
  ['nh3-nutrient', 'nutrient', 'nh3', '10.328', '7.192'],
];

function uniqueRecord(rows, id) {
  const matches = rows?.filter(row => row.id === id) ?? [];
  return matches.length === 1 ? matches[0] : null;
}

export function validateAcidEquivalentsFactors(catalog, readings) {
  const reading = uniqueRecord(readings.readings, efReading);
  const expectedMembers = [
    ...Object.entries(methods).map(([name, row]) => [`method-${name}`, row[4]]),
    ...Object.entries(flows).map(([name, row]) => [`flow-${name}`, row[2]]),
    ['moles-property','6973482cd527bef3a8aa35b1c19e9bad26330114689a64d1b5881b4ed1326f93'],
    ['mole-group','906e1936428e5bf365d02e0601d9c4eb73b5c6aaaeb235f9053e474be34a657c'],
  ];
  for (const [name, sha256] of expectedMembers) {
    const id = `art-acid113-ef-${name}`;
    const expected = { id, sha256, mediaType: 'application/xml', resolvedUrl: packageUrl };
    if (!sameScienceValue(uniqueRecord(reading?.artifacts, id), expected))
      throw new Error(`Acid equivalents lacks the independently observed EF XML member: ${id}`);
  }

  const denominator = [
    ['mass', 'art-flow99-ef-mass', '8fed3fee7b905fe5eb1099880810842f32226966bad658cf25c4be49581e5eb4',
      'EF-v3.1 (4)/ILCD/flowproperties/93a60a56-a3c8-11da-a746-0800200b9a66.xml；quantitativeReference/referenceToReferenceUnitGroup；版本03.00.003'],
    ['kg', 'art-flow99-ef-mass-units', '588d32266c1de508bf38129d5de8aac10bfe96f19c90e129ab76d6e3f5a8a8d3',
      'EF-v3.1 (4)/ILCD/unitgroups/93a60a57-a4c8-11da-a746-0800200c9a66.xml；quantitativeReference/referenceToReferenceUnit 0；units/unit[@dataSetInternalID=0]/name；版本03.00.003'],
  ];
  for (const [name, artifactId, sha256, locator] of denominator) {
    const evidenceId = `ev-acid113-ef-${name}`, passageId = `psg-acid113-ef-${name}`;
    const evidence = uniqueRecord(catalog.evidence, evidenceId);
    const passage = uniqueRecord(reading?.passages, passageId);
    if (evidence?.sourceId !== efSource || evidence.readingId !== efReading
        || evidence.passageId !== passageId || evidence.locator !== locator
        || passage?.artifactId !== artifactId || passage.locator !== locator
        || !sameScienceValue(uniqueRecord(reading?.artifacts, artifactId),
          { id: artifactId, mediaType: 'application/xml', sha256, resolvedUrl: packageUrl }))
      throw new Error(`Acid equivalents changed the verified kilogram evidence carrier: ${evidenceId}`);
  }

  const facts = new Map();
  for (const [name, method, flow, cz, al] of pairs) {
    const [methodId, version, unit, quantity] = methods[method], [flowId, substance] = flows[flow];
    for (const [country, value] of [['CZ', cz], ['AL', al]]) {
      const key = `${name}-${country.toLowerCase()}`, id = `ev-acid113-ef-${key}`, passageId = `psg-acid113-ef-${key}`;
      const record = uniqueRecord(catalog.evidence, id);
      const passage = uniqueRecord(reading?.passages, passageId);
      const locator = `EF-v3.1 (4)/ILCD/lciamethods/${methodId}.xml；characterisationFactors/factor；referenceToFlowDataSet/@refObjectId=${flowId}，@version=${flowVersion}；exchangeDirection=Output；location=${country}；meanValue`;
      const fact = {
        value, unit: `mol ${unit} eq/kg ${substance}`, quantity,
        subject: `${country}向非城市空气或从高烟囱排放的${substance}`,
        basis: `EF3.1方法成员${version}；${flowId} v${flowVersion}，Output、${country}排放，非城市空气或高烟囱，实际参考质量单位kg；分子取该方法声明的当量。`,
      };
      if (record?.sourceId !== efSource || record.readingId !== efReading || record.passageId !== passageId
          || record.locator !== locator || passage?.locator !== locator || passage.artifactId !== `art-acid113-ef-method-${method}`
          || !sameScienceValue(record.numericFact, fact))
        throw new Error(`Acid equivalents changed the verified EF factor or its release, flow, location or unit identity: ${id}`);
      facts.set(key, value);
    }
  }

  const claimPairs = [
    ['cl-acid113-so2-rows', 'so2'],
    ['cl-acid113-chemistry-control', 'so2'],
    ['cl-acid113-nh3-control', 'nh3-acid', 'nh3-nutrient'],
  ];
  for (const [id, ...comparisons] of claimPairs) {
    const claim = uniqueRecord(catalog.claims, id);
    if (!comparisons.every(name => ['cz', 'al'].every(country => {
      const evidenceId = `ev-acid113-ef-${name}-${country}`;
      const links = claim?.evidenceLinks?.filter(link => link.evidenceId === evidenceId) ?? [];
      return claim?.evidenceIds.includes(evidenceId) && links.length === 1 && links[0].relation === 'supports';
    })))
      throw new Error(`Acid equivalents lost the evidence for the actual comparison: ${id}`);
  }
  const thousandths = key => {
    const [whole, fraction = ''] = facts.get(key).split('.');
    return BigInt(whole + fraction.padEnd(3, '0'));
  };
  if (thousandths('so2-cz') === thousandths('so2-al')
      || thousandths('nh3-nutrient-cz') * thousandths('nh3-acid-al')
        === thousandths('nh3-nutrient-al') * thousandths('nh3-acid-cz'))
    throw new Error('Acid equivalents changed the verified same-flow counterchecks');
}
