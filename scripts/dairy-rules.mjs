import { createHash } from 'node:crypto';
import { add, decimal, divide, fixed, multiply, rational, result, subtract } from './exact-rational.mjs';

const sourceKeys = ['ec2021', 'dairy2025', 'dairy-rp', 'nordic2023', 'niu2018', 'ipcc2019', 'dairy-lci'];
const workbookSourceKeys = new Set(['dairy-rp', 'dairy-lci']);
const factKeys = [
  'glassesPerL', 'washWaterL', 'washSoapG', 'washEnergyKwh', 'dishwasherLife',
  'milkFuMl', 'washSharePercent', 'storageVolumeMultiplier', 'freshColdDays', 'uhtColdDays',
  'pasteurisedShare', 'uhtShare', 'reportedNonUseClimate', 'reportedUseClimate',
  'diagramWashCycles', 'diagramSoapKg', 'diagramEnergyMj', 'diagramCapital', 'diagramColdLday',
  'wholeClimate', 'washClimate', 'coldClimate', 'tableWashAmount', 'tableColdAmount',
  'milkPerDay', 'dmi', 'ndfStandard', 'ndfLow', 'grossEnergyDensity', 'ymPercent',
  'niuIntercept', 'niuDmiCoeff', 'niuNdfCoeff', 'annualDays', 'methaneEnergy',
  'lciCapitalNumerator', 'lciCapitalDenominator',
];
const numericFields = ['value', 'unit', 'quantity', 'subject', 'basis'];
const scalarFields = keys => Object.fromEntries(keys.map(key => [key, null]));
const sourceShape = scalarFields(['sourceId', 'readingId', 'workId', 'version', 'artifactId', 'mediaType', 'sha256', 'resolvedUrl']);
const factShape = scalarFields(['source', 'evidenceId', 'factId', 'passageId', 'locator', ...numericFields, 'pdfIndex']);

export const dairyRulesInputShape = {
  ...scalarFields(['caseId', 'version', 'model', 'createdAt', 'status']),
  sources: Object.fromEntries(sourceKeys.map(key => [
    key, workbookSourceKeys.has(key) ? sourceShape : { ...sourceShape, pageCount: null },
  ])),
  facts: Object.fromEntries(factKeys.map(key => [key, factShape])),
  scope: {
    ...scalarFields([
      'dairyService', 'dairyBasis', 'methaneBasis', 'nativeModelReproduced',
      'conformanceCertified', 'environmentalEffectMeasured', 'modelValidityEstablished',
    ]),
    unresolvedPublicArtifactDifferences: [null],
    ipccClassIndependentlyVerified: null,
    electricityExchangeMeaningResolved: null,
  },
  rounding: scalarFields([
    'cyclePlaces', 'energyPlaces', 'methaneYearPlaces', 'methaneDifferencePlaces',
    'climateUsePlaces', 'climateWholePlaces', 'usePercentPlaces', 'nativeErrorDiagnosis',
  ]),
};

// This digest fixes the reviewed v1 JSON values independently of the input and
// publication manifest. Ignore JSON formatting and object key order only.
const reviewedV1Digest = '9957fa5e7c71afea017bb0afb627060942145049605daa79f39d85ba37971e3e';

function sortedJsonValue(_key, value) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
  }
  return value;
}

export function validateDairyRulesCase(spec) {
  const invalid = ['dairy rules: exact reviewed dairy-rules v1 input required'];
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return invalid;
  try {
    const digest = createHash('sha256').update(JSON.stringify(spec, sortedJsonValue)).digest('hex');
    return digest === reviewedV1Digest ? [] : invalid;
  } catch {
    return invalid;
  }
}

const thousand = rational(1000n);
const hundred = rational(100n);
const percentToShare = value => divide(value, hundred);
const sameAmount = (left, right) => subtract(left, right)[0] === 0n;

export function evaluateDairyRulesCase(spec) {
  const errors = validateDairyRulesCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));
  const fact = key => decimal(spec.facts[key].value);
  const rounding = spec.rounding;

  const milkLitres = divide(fact('milkFuMl'), thousand);
  const glasses = multiply(milkLitres, fact('glassesPerL'));
  const cycles = multiply(glasses, percentToShare(fact('washSharePercent')));
  const soapKg = divide(multiply(cycles, fact('washSoapG')), thousand);
  const electricityMj = multiply(multiply(cycles, fact('washEnergyKwh')), decimal('3.6'));
  const electricityNodeLabelMj = fact('diagramEnergyMj');
  const defaultDevicesPerCycle = divide(rational(1n), fact('dishwasherLife'));
  // The original LCI cell is the text 1/1500. Its two selected numbers
  // establish a per-cycle coefficient and no diagnosis of the RP model.
  const lciDevicesPerCycle = divide(fact('lciCapitalNumerator'), fact('lciCapitalDenominator'));
  const capital = multiply(cycles, defaultDevicesPerCycle);

  const weightedDays = add(
    multiply(percentToShare(fact('pasteurisedShare')), fact('freshColdDays')),
    multiply(percentToShare(fact('uhtShare')), fact('uhtColdDays')),
  );
  const coldLitreDays = multiply(multiply(milkLitres, fact('storageVolumeMultiplier')), weightedDays);

  const whole = fact('wholeClimate');
  const washing = fact('washClimate');
  const coldStorage = fact('coldClimate');
  const use = add(washing, coldStorage);
  const excludingUse = subtract(whole, use);
  const useSharePercent = multiply(divide(use, whole), hundred);
  // Table 45 prints excluding-use to two places and use to four places.
  const excludingUseRounded = fixed(excludingUse, 2);
  const useRounded = fixed(use, rounding.climateUsePlaces);

  const days = fact('annualDays');
  const dmi = fact('dmi');
  const grossEnergy = multiply(dmi, fact('grossEnergyDensity'));
  const ipccMethaneEnergy = multiply(grossEnergy, percentToShare(fact('ymPercent')));
  const ipccAnnualKg = divide(multiply(ipccMethaneEnergy, days), fact('methaneEnergy'));

  const dailyMethane = ndfPercent => add(
    add(fact('niuIntercept'), multiply(fact('niuDmiCoeff'), dmi)),
    multiply(fact('niuNdfCoeff'), ndfPercent),
  );
  const annualizeGrams = grams => divide(multiply(grams, days), thousand);
  // A percentage point is 10 grams per kilogram of dry matter.
  const ndfStandard = divide(fact('ndfStandard'), rational(10n));
  const ndfLow = divide(fact('ndfLow'), rational(10n));
  const niuStandard = dailyMethane(ndfStandard);
  const niuLow = dailyMethane(ndfLow);
  const niuAnnualDifference = annualizeGrams(subtract(niuStandard, niuLow));

  const methaneScenario = (ndfPercent, niuDailyGrams) => {
    const niuAnnualKg = annualizeGrams(niuDailyGrams);
    return {
      ndfPercent: result(ndfPercent),
      niuDailyGrams: result(niuDailyGrams),
      niuAnnualKg: result(niuAnnualKg),
      niuAnnualKgRounded: fixed(niuAnnualKg, rounding.methaneYearPlaces),
      ipccAnnualKg: result(ipccAnnualKg),
      ipccAnnualKgRounded: fixed(ipccAnnualKg, rounding.methaneYearPlaces),
    };
  };

  return {
    washing: {
      milkLitres: result(milkLitres),
      glasses: result(glasses),
      cycles: result(cycles),
      cyclesRounded: fixed(cycles, rounding.cyclePlaces),
      soapKg: result(soapKg),
      waterL: result(multiply(cycles, fact('washWaterL'))),
      electricityMj: result(electricityMj),
      electricityMjRounded: fixed(electricityMj, rounding.energyPlaces),
      electricityNodeLabelEquality: sameAmount(electricityMj, electricityNodeLabelMj),
      exchangeMeaningResolved: spec.scope.electricityExchangeMeaningResolved,
      diagram: {
        cycles: result(fact('diagramWashCycles')),
        soapKg: result(fact('diagramSoapKg')),
        electricityNodeLabelMj: result(electricityNodeLabelMj),
      },
      matchesDiagram: {
        cycles: sameAmount(cycles, fact('diagramWashCycles')),
        soapKg: sameAmount(soapKg, fact('diagramSoapKg')),
      },
      capital: {
        defaultDevicesPerCycle: result(defaultDevicesPerCycle),
        lciDevicesPerCycle: result(lciDevicesPerCycle),
        lciMatchesDefaultPerCycle: sameAmount(lciDevicesPerCycle, defaultDevicesPerCycle),
        conditionalLciDevices: result(multiply(cycles, lciDevicesPerCycle)),
        conditionalDefaultDevices: result(capital),
        conditionalDefaultDevicesRounded: fixed(capital, 8),
        diagramDevices: result(fact('diagramCapital')),
        matchesDiagram: sameAmount(capital, fact('diagramCapital')),
        basisClosed: false,
      },
    },
    storage: {
      conditionalWeightedDays: result(weightedDays),
      conditionalLitreDays: result(coldLitreDays),
      diagramLitreDays: result(fact('diagramColdLday')),
      matchesDiagram: sameAmount(coldLitreDays, fact('diagramColdLday')),
      basisClosed: false,
    },
    quantityColumn: {
      unit: spec.facts.tableWashAmount.unit,
      washAmount: result(fact('tableWashAmount')),
      coldAmount: result(fact('tableColdAmount')),
      scalingExplained: false,
    },
    reportedClimate: {
      unit: spec.facts.wholeClimate.unit,
      whole: result(whole),
      wholeRounded: fixed(whole, rounding.climateWholePlaces),
      washing: result(washing),
      coldStorage: result(coldStorage),
      use: result(use),
      washingAt9Places: fixed(washing, 9),
      coldStorageAt9Places: fixed(coldStorage, 9),
      useAt9Places: fixed(use, 9),
      useRounded,
      excludingUse: result(excludingUse),
      excludingUseRounded,
      useSharePercent: result(useSharePercent),
      useSharePercentRounded: fixed(useSharePercent, rounding.usePercentPlaces),
      pdfUse: result(fact('reportedUseClimate')),
      pdfExcludingUse: result(fact('reportedNonUseClimate')),
      roundedMatchesPdf: {
        use: useRounded === spec.facts.reportedUseClimate.value,
        excludingUse: excludingUseRounded === spec.facts.reportedNonUseClimate.value,
      },
      calculatedFromActivities: false,
    },
    methane: {
      dailyUnit: 'g CH4/cow-day',
      annualUnit: 'kg CH4/cow-year',
      grossEnergyMjPerCowDay: result(grossEnergy),
      standard: methaneScenario(ndfStandard, niuStandard),
      lowNdf: methaneScenario(ndfLow, niuLow),
      standardMinusLowNiuKg: result(niuAnnualDifference),
      standardMinusLowNiuKgRounded: fixed(niuAnnualDifference, rounding.methaneDifferencePlaces),
      digestibleEnergyProvided: false,
      ipccClassIndependentlyVerified: spec.scope.ipccClassIndependentlyVerified,
    },
    scope: {
      ...spec.scope,
      unresolvedPublicArtifactDifferences: [...spec.scope.unresolvedPublicArtifactDifferences],
      nativeErrorDiagnosis: spec.rounding.nativeErrorDiagnosis,
    },
  };
}

// Ledger passage locators are broader than the exact cell, node or PDF row
// carried in each input tuple. Bind both without assigning pages to either workbook.
const passageLocators = {
  'psg-kb44-ec2021-defaults': 'Annex I §4.4.7.2；Annex II Part D 说明及 Milk、Chilled storage (in a fridge, at home)、Dishwashing (at home) 行',
  'psg-kb44-dairy2025-service': '§§3.2–3.4及Table 8，第41–46页',
  'psg-kb44-dairy2025-use': '§6.5与Table43，第132–133页',
  'psg-kb44-dairy2025-market': 'Annex4，TableIV-1及说明，第170–171页',
  'psg-kb44-dairy2025-results': '§7.1及Table45，第137–139页',
  'psg-kb44-dairy-rp-diagram': 'FlowLiquid Milk嵌入图；sheet9/drawing5/image5.emf的家庭使用与洗涤分支',
  'psg-kb44-dairy-rp-results': 'Info!H27；ResultsTableVersion!A123:Y149，特别V141:V142；LCS1!AL42:BM67，特别AL61:AN62',
  'psg-kb44-dairy-rp-quantity-limits': 'ResultsTableVersion!A141:F142；FlowLiquid Milk家庭使用分支；Parameters!A1',
  'psg-kb44-dairy-lci-dishwasher': 'Aggregated!A29:J32、E66:G69，特别B29:G29的单周期与资本文本系数',
  'psg-kb44-nordic2023-scenarios': 'Table 5 情景输入与 Fig. 2、正文结果',
  'psg-kb44-niu2018-equation': 'Table 2，跨洲模型 DMI + NDF_C，Eq. (3) 及表注 a–c',
  'psg-kb44-ipcc2019-equation': '§10.3.2，Emission factor development，Eqs. 10.21 与 10.21A',
};

const nonemptyText = value => typeof value === 'string' && value.trim().length > 0;
const records = value => Array.isArray(value) ? value : [];
function uniqueRecord(list, id) {
  const matches = records(list).filter(record => record?.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

function originalCarrier(artifact, expected) {
  return [undefined, 'retrieved'].includes(artifact?.kind)
    && artifact?.mediaType === expected.mediaType
    && artifact.sha256 === expected.sha256
    && artifact.resolvedUrl === expected.resolvedUrl
    && artifact.pageCount === expected.pageCount;
}

function correctBounds(passage, source, input) {
  if (source.mediaType === 'application/pdf') {
    return nonemptyText(passage?.printedPages)
      && Array.isArray(passage.pdfIndices)
      && passage.pdfIndices.includes(input.pdfIndex)
      && passage.pdfIndices.every(index => Number.isSafeInteger(index) && index >= 0 && index < source.pageCount);
  }
  return passage?.pdfIndices == null && passage?.printedPages == null;
}

/** Bind all reviewed tuples to the public evidence closure and inspected original carriers. */
export function validateDairyRulesFacts(spec, published, context = {}) {
  const errors = validateDairyRulesCase(spec);
  if (errors.length) return errors;
  if (!Array.isArray(published?.sources) || !Array.isArray(published?.evidence))
    return ['dairy rules: public source and evidence closure required'];
  const register = context?.readingRegister;
  if (register?.schemaVersion !== 1 || !Array.isArray(register.readings))
    return ['dairy rules: actual reading register required'];

  const artifacts = register.readings.flatMap(reading => records(reading?.artifacts));
  const passages = register.readings.flatMap(reading => records(reading?.passages));
  const actualReadings = new Map();
  for (const [key, expected] of Object.entries(spec.sources)) {
    const source = uniqueRecord(published.sources, expected.sourceId);
    const reading = uniqueRecord(register.readings, expected.readingId);
    const artifact = uniqueRecord(reading?.artifacts, expected.artifactId);
    if (source?.version !== expected.version || reading?.version !== expected.version
        || reading.workId !== expected.workId || reading.readingStatus !== 'selected-passages'
        || source.accessStatus !== 'public-passages-inspected'
        || source.reading?.readingId !== expected.readingId || source.reading.status !== 'selected-passages'
        || !nonemptyText(source.reading.scope)
        || !originalCarrier(source.artifact, expected) || !originalCarrier(artifact, expected)
        || uniqueRecord(artifacts, expected.artifactId) !== artifact) {
      errors.push(`dairy rules.sources.${key}: exact inspected work, edition, reading and original carrier required`);
      continue;
    }
    actualReadings.set(key, reading);
  }

  for (const [key, input] of Object.entries(spec.facts)) {
    const source = spec.sources[input.source];
    const evidence = uniqueRecord(published.evidence, input.evidenceId);
    const fact = uniqueRecord(evidence?.numericFacts, input.factId);
    if (evidence?.sourceId !== source.sourceId || evidence?.numericFact !== undefined
        || !numericFields.every(field => fact?.[field] === input[field]))
      errors.push(`dairy rules.facts.${key}: exact public fact identity and value/unit/quantity/subject/basis required`);

    const reading = actualReadings.get(input.source);
    const passage = uniqueRecord(reading?.passages, input.passageId);
    const locator = passageLocators[input.passageId];
    if (evidence?.readingId !== source.readingId || evidence?.passageId !== input.passageId
        || evidence?.locator !== locator || passage?.locator !== locator
        || passage.artifactId !== source.artifactId || uniqueRecord(passages, input.passageId) !== passage
        || !correctBounds(passage, source, input))
      errors.push(`dairy rules.facts.${key}: exact inspected passage, original carrier and locator required`);
  }
  return errors;
}
