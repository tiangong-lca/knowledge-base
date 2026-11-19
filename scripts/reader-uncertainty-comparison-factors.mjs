import { decimal, divide, fixed, subtract } from './exact-rational.mjs';
import { sameScienceValue, scienceText } from './reader-scientific-delta.mjs';

export const uncCarriers = Object.freeze({
  heijungs2020: {
    sourceId: 'src-unc149-heijungs-2020',
    readingId: 'rd-unc149-heijungs-2020',
    artifact: {
      id: 'art-unc149-heijungs-2020-pdf',
      mediaType: 'application/pdf',
      sha256: '422cb7f6665f1fcdc689d8a65cbd58838508d849bed2d415de8b010763d4f299',
      resolvedUrl: 'https://link.springer.com/content/pdf/10.1007/s11367-019-01698-4.pdf',
      pageCount: 9,
    },
  },
  groen2017: {
    sourceId: 'src-unc149-groen-2017',
    readingId: 'rd-unc149-groen-2017',
    artifact: {
      id: 'art-unc149-groen-2017-pdf',
      mediaType: 'application/pdf',
      sha256: '98cef6d82e07fdfeca8d13e73a3409969b8fbb98fefa24e93c818cf72cae7d4b',
      resolvedUrl: 'https://link.springer.com/content/pdf/10.1007/s11367-016-1217-3.pdf',
      pageCount: 13,
    },
  },
  ilcd2010: {
    sourceId: 'src-book-ilcd-2010',
    readingId: 'rd-ilcd-2010',
    artifact: {
      id: 'art-ilcd-2010-pdf',
      mediaType: 'application/pdf',
      sha256: '7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f',
      pageCount: 417,
    },
  },
  ec2021: {
    sourceId: 'src-kb44-ec2021',
    readingId: 'rd-kb44-ec2021',
    artifact: {
      id: 'art-kb44-ec2021-r01-pdf',
      mediaType: 'application/pdf',
      sha256: '42445138f591d8052c0096384db30db513c11da918d0de2e9955baa33264faa7',
      pageCount: 384,
    },
  },
});

export const requiredUncPassages = Object.freeze({
  'ev-unc149-heijungs2020-sources-runtime': {
    carrier: 'heijungs2020',
    passageId: 'psg-unc149-heijungs2020-sources-runtime',
    printedPages: '395',
    pdfIndices: [1],
  },
  'ev-unc149-heijungs2020-standalone-precision-accuracy': {
    carrier: 'heijungs2020',
    passageId: 'psg-unc149-heijungs2020-standalone-precision-accuracy',
    printedPages: '397–400',
    pdfIndices: [3, 4, 5, 6],
  },
  'ev-unc149-heijungs2020-comparative-pvalue-cap': {
    carrier: 'heijungs2020',
    passageId: 'psg-unc149-heijungs2020-comparative-pvalue-cap',
    printedPages: '400–401',
    pdfIndices: [6, 7],
  },
  'ev-unc149-heijungs2020-pedigree-incompatibility': {
    carrier: 'heijungs2020',
    passageId: 'psg-unc149-heijungs2020-pedigree-incompatibility',
    printedPages: '394, 401',
    pdfIndices: [0, 7],
  },
  'ev-unc149-groen2017-variability-local-global': {
    carrier: 'groen2017',
    passageId: 'psg-unc149-groen2017-variability-local-global',
    printedPages: '1126–1129',
    pdfIndices: [1, 2, 3, 4],
  },
  'ev-unc149-groen2017-methods-cost-case-studies': {
    carrier: 'groen2017',
    passageId: 'psg-unc149-groen2017-methods-cost-case-studies',
    printedPages: '1129–1133',
    pdfIndices: [4, 5, 6, 7, 8],
  },
  'ev-unc149-groen2017-outliers-caveats': {
    carrier: 'groen2017',
    passageId: 'psg-unc149-groen2017-outliers-caveats',
    printedPages: '1132–1136',
    pdfIndices: [7, 8, 9, 10, 11],
  },
  'ev-unc149-ilcd2010-sensitivity-check': {
    carrier: 'ilcd2010',
    passageId: 'psg-unc149-ilcd2010-sensitivity-check',
    printedPages: '295–299',
    pdfIndices: [314, 315, 316, 317, 318],
  },
  'ev-unc149-ilcd2010-comparative-covariance': {
    carrier: 'ilcd2010',
    passageId: 'psg-unc149-ilcd2010-comparative-covariance',
    printedPages: '302–305',
    pdfIndices: [321, 322, 323, 324],
  },
  'ev-unc149-eu2021-robustness-hotspots': {
    carrier: 'ec2021',
    passageId: 'psg-unc149-eu2021-robustness-hotspots',
    printedPages: 'L 144/20–21, L 144/25, L 144/81, L 144/88–94',
    pdfIndices: [19, 20, 24, 80, 87, 88, 89, 90, 91, 92, 93],
  },
});

export const requiredUncNumericFacts = Object.freeze({
  'nf-unc149-heij-tcal-low': { evidenceId: 'ev-unc149-heijungs2020-sources-runtime', value: '1', unit: '秒' },
  'nf-unc149-heij-tcal-high': { evidenceId: 'ev-unc149-heijungs2020-sources-runtime', value: '5', unit: '分钟' },
  'nf-unc149-heij-nrun-100k': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '100000', unit: '次' },
  'nf-unc149-heij-true-mu': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '10', unit: '无量纲' },
  'nf-unc149-heij-true-sd': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '1', unit: '无量纲' },
  'nf-unc149-heij-sample-n16': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '16', unit: '个观测' },
  'nf-unc149-heij-xbar': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '10.31', unit: '无量纲' },
  'nf-unc149-heij-sem-emp': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '0.25', unit: '无量纲' },
  'nf-unc149-heij-ci-emp-low': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '9.819', unit: '无量纲' },
  'nf-unc149-heij-ci-emp-high': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '10.799', unit: '无量纲' },
  'nf-unc149-heij-sem-mc': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '0.0031', unit: '无量纲' },
  'nf-unc149-heij-ci-mc-low': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '10.305', unit: '无量纲' },
  'nf-unc149-heij-ci-mc-high': { evidenceId: 'ev-unc149-heijungs2020-standalone-precision-accuracy', value: '10.318', unit: '无量纲' },
  'nf-unc149-heij-comp-p-emp': { evidenceId: 'ev-unc149-heijungs2020-comparative-pvalue-cap', value: '0.67', unit: '无量纲' },
  'nf-unc149-heij-weakest-n9': { evidenceId: 'ev-unc149-heijungs2020-comparative-pvalue-cap', value: '9', unit: '次' },
  'nf-unc149-groen-cv5': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '5', unit: '%' },
  'nf-unc149-groen-cv30': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '30', unit: '%' },
  'nf-unc149-groen-n4096': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '4096', unit: '次' },
  'nf-unc149-groen-c1-params': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '6', unit: '个参数' },
  'nf-unc149-groen-c2-params': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '115', unit: '个参数' },
  'nf-unc149-groen-c1-cv5-mean': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '128', unit: 'kg CO2' },
  'nf-unc149-groen-c1-cv5-var-bench': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '80.8', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c1-cv5-var-kia': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '80.0', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c1-cv30-mean-bench': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '145', unit: 'kg CO2' },
  'nf-unc149-groen-c1-cv30-var-bench': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '4300', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c1-cv30-var-kia': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '2880', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c2-cv5-mean-bench': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '1.96', unit: 'kg CO2' },
  'nf-unc149-groen-c2-cv5-var-bench': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '0.0170', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c2-cv5-var-kia': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '0.0168', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c2-cv30-mean-bench': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '2.16', unit: 'kg CO2' },
  'nf-unc149-groen-c2-cv30-mean-kia': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '1.95', unit: 'kg CO2' },
  'nf-unc149-groen-c2-cv30-var-bench': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '0.76', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c2-cv30-var-kia': { evidenceId: 'ev-unc149-groen2017-methods-cost-case-studies', value: '0.606', unit: 'kg^2 CO2' },
  'nf-unc149-groen-c1-cv30-src': { evidenceId: 'ev-unc149-groen2017-outliers-caveats', value: '81.7', unit: '%' },
  'nf-unc149-groen-c1-cv30-rbd': { evidenceId: 'ev-unc149-groen2017-outliers-caveats', value: '79.7', unit: '%' },
  'nf-unc149-groen-c1-cv30-scc': { evidenceId: 'ev-unc149-groen2017-outliers-caveats', value: '94.0', unit: '%' },
  'nf-unc149-groen-c1-cv30-sme': { evidenceId: 'ev-unc149-groen2017-outliers-caveats', value: '91.6', unit: '%' },
  'nf-unc149-groen-c1-cv30-ste': { evidenceId: 'ev-unc149-groen2017-outliers-caveats', value: '110', unit: '%' },
  'nf-unc149-groen-c2-cv30-scc': { evidenceId: 'ev-unc149-groen2017-outliers-caveats', value: '94.5', unit: '%' },
  'nf-unc149-eu-hotspot-80': { evidenceId: 'ev-unc149-eu2021-robustness-hotspots', value: '80', unit: '%' },
  'nf-unc149-eu-min-3-cats': { evidenceId: 'ev-unc149-eu2021-robustness-hotspots', value: '3', unit: '项影响类别' },
  'nf-unc149-eu-use-stage-50': { evidenceId: 'ev-unc149-eu2021-robustness-hotspots', value: '50', unit: '%' },
});

export const requiredUncClaims = Object.freeze({
  'cl-unc149-variability-vs-epistemic': [
    'ev-unc149-groen2017-variability-local-global',
    'ev-unc149-heijungs2020-sources-runtime',
  ],
  'cl-unc149-framework-comparison': [
    'ev-unc149-ilcd2010-sensitivity-check',
    'ev-unc149-eu2021-robustness-hotspots',
  ],
  'cl-unc149-local-vs-global-sa': [
    'ev-unc149-groen2017-variability-local-global',
  ],
  'cl-unc149-taylor-vs-sampling': [
    'ev-unc149-groen2017-methods-cost-case-studies',
  ],
  'cl-unc149-gsa-outliers-nonlinearity': [
    'ev-unc149-groen2017-outliers-caveats',
  ],
  'cl-unc149-mc-runs-precision-vs-accuracy': [
    'ev-unc149-heijungs2020-sources-runtime',
    'ev-unc149-heijungs2020-standalone-precision-accuracy',
  ],
  'cl-unc149-comparative-paired-and-pvalue': [
    'ev-unc149-ilcd2010-comparative-covariance',
    'ev-unc149-heijungs2020-comparative-pvalue-cap',
  ],
  'cl-unc149-pedigree-mc-boundary': [
    'ev-unc149-heijungs2020-pedigree-incompatibility',
  ],
});

export function assertCleanUncertaintyProse(text, label) {
  if (!scienceText(text)) throw new Error(`Empty prose in ${label}`);
  if (/PDF零基索引|PDF\s*0-based|§/u.test(text)) {
    throw new Error(`Disallowed raw locator marker in ${label}`);
  }
}

export function validateUncertaintyComparisonFactors(catalog, readings) {
  const readingById = new Map(readings.readings.map(r => [r.id, r]));
  const evidenceById = new Map(catalog.evidence.map(e => [e.id, e]));
  const claimById = new Map(catalog.claims.map(c => [c.id, c]));

  for (const [key, spec] of Object.entries(uncCarriers)) {
    const rd = readingById.get(spec.readingId);
    if (!rd) throw new Error(`Missing reading for ${key}: ${spec.readingId}`);
    const art = rd.artifacts.find(a => a.id === spec.artifact.id);
    if (!art || art.mediaType !== spec.artifact.mediaType
        || art.sha256 !== spec.artifact.sha256 || art.pageCount !== spec.artifact.pageCount
        || (spec.artifact.resolvedUrl && art.resolvedUrl !== spec.artifact.resolvedUrl)) {
      throw new Error(`Carrier artifact mismatch for ${key}`);
    }
  }

  for (const [evId, spec] of Object.entries(requiredUncPassages)) {
    const carrier = uncCarriers[spec.carrier];
    const ev = evidenceById.get(evId);
    if (!ev || ev.sourceId !== carrier.sourceId || ev.readingId !== carrier.readingId || ev.passageId !== spec.passageId) {
      throw new Error(`Evidence binding mismatch: ${evId}`);
    }
    assertCleanUncertaintyProse(ev.locator, `${evId}.locator`);
    const rd = readingById.get(carrier.readingId);
    const psg = rd.passages.find(p => p.id === spec.passageId);
    if (!psg || psg.artifactId !== carrier.artifact.id || psg.printedPages !== spec.printedPages
        || !sameScienceValue(psg.pdfIndices, spec.pdfIndices)) {
      throw new Error(`Passage binding mismatch: ${spec.passageId}`);
    }
  }

  const factMap = new Map();
  for (const evId of Object.keys(requiredUncPassages)) {
    const ev = evidenceById.get(evId);
    for (const nf of ev.numericFacts ?? []) {
      if (factMap.has(nf.id)) throw new Error(`Duplicate numericFact id: ${nf.id}`);
      factMap.set(nf.id, { ...nf, evidenceId: evId });
    }
  }
  const expectedIds = Object.keys(requiredUncNumericFacts);
  if (factMap.size !== expectedIds.length) {
    throw new Error(`Expected ${expectedIds.length} uncertainty numericFacts, observed ${factMap.size}`);
  }
  const vals = {};
  for (const [nfId, spec] of Object.entries(requiredUncNumericFacts)) {
    const actual = factMap.get(nfId);
    if (!actual || actual.evidenceId !== spec.evidenceId || actual.value !== spec.value || actual.unit !== spec.unit) {
      throw new Error(`NumericFact mismatch: ${nfId}`);
    }
    vals[nfId] = decimal(actual.value);
  }

  // Exact BigInt rational checks on key published comparisons
  const c1KiaDropPct = divide(
    subtract(vals['nf-unc149-groen-c1-cv30-var-bench'], vals['nf-unc149-groen-c1-cv30-var-kia']),
    vals['nf-unc149-groen-c1-cv30-var-bench'],
  );
  if (fixed(c1KiaDropPct, 2) !== '0.33') {
    throw new Error(`Expected Case 1 KIA variance drop ~0.33, got ${fixed(c1KiaDropPct, 4)}`);
  }
  const c2KiaDropPct = divide(
    subtract(vals['nf-unc149-groen-c2-cv30-var-bench'], vals['nf-unc149-groen-c2-cv30-var-kia']),
    vals['nf-unc149-groen-c2-cv30-var-bench'],
  );
  if (fixed(c2KiaDropPct, 2) !== '0.20') {
    throw new Error(`Expected Case 2 KIA variance drop ~0.20, got ${fixed(c2KiaDropPct, 4)}`);
  }
  const steMinusSme = subtract(vals['nf-unc149-groen-c1-cv30-ste'], vals['nf-unc149-groen-c1-cv30-sme']);
  if (fixed(steMinusSme, 1) !== '18.4') {
    throw new Error(`Expected Case 1 STE - SME = 18.4, got ${fixed(steMinusSme, 4)}`);
  }

  for (const [claimId, evIds] of Object.entries(requiredUncClaims)) {
    const claim = claimById.get(claimId);
    if (!claim || !sameScienceValue(claim.evidenceIds, evIds)) {
      throw new Error(`Claim evidence binding mismatch: ${claimId}`);
    }
    assertCleanUncertaintyProse(claim.text, `${claimId}.text`);
    assertCleanUncertaintyProse(claim.scope, `${claimId}.scope`);
  }
}
