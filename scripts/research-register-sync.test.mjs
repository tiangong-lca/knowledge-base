import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateResearch } from './research.mjs';
import {
  applyRevisionsInverse,
  applyRevisionsToPlan,
  applyRevisionsToPlanStatic,
  validateRevisionSchema,
} from './reader-revisions.mjs';
import { currentBookPlan, currentBookRecordMatches } from './reader-current-expectations.mjs';
import { editionDigest } from './reader-current-edition.mjs';

const catalog = JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));
const lit = JSON.parse(readFileSync(new URL('../knowledge/research/literature-map.json', import.meta.url), 'utf8'));
const readings = JSON.parse(readFileSync(new URL('../knowledge/research/readings.json', import.meta.url), 'utf8'));
const opt3Rev = JSON.parse(
  readFileSync(new URL('../config/revisions/opt3-research-register-sync-371.json', import.meta.url), 'utf8'),
);

test('research register covers 100% of catalog sources through 2026-11-28 with zero validation errors and strict epistemic bounds', () => {
  assert.ok(lit.updatedAt >= '2026-11-28', `literature-map.updatedAt expected >= 2026-11-28, got ${lit.updatedAt}`);
  assert.ok(readings.updatedAt >= '2026-11-28', `readings.updatedAt expected >= 2026-11-28, got ${readings.updatedAt}`);
  assert.deepEqual(validateResearch(lit, readings, catalog), []);

  const mapped = new Set(lit.records.flatMap((r) => r.catalogSourceIds ?? []));
  const missing = catalog.sources.filter((s) => !mapped.has(s.id)).map((s) => s.id);
  assert.deepEqual(missing, [], `unmapped catalog sources in literature-map.json: ${missing.join(', ')}`);

  // Epistemic guard: paywalled abstract and copyrighted standard metadata never claim public full text
  const frischknecht = lit.records.find((r) => r.id === 'work-opt3-db26-frischknecht-2005');
  assert.equal(frischknecht?.accessStatus, 'abstract-or-excerpt');
  const samrStd = lit.records.find((r) => r.id === 'work-opt3-pol33-china-samr-gbt24067');
  assert.equal(samrStd?.accessStatus, 'metadata-only');

  // Deduplication guard: identical EF Guide PDF and ecoinvent System Models URL share single work records
  const efGuide = lit.records.find((r) => r.id === 'work-loc137-ef-guide-2020');
  assert.ok(efGuide?.catalogSourceIds?.includes('src-rev32-jrc-ef-data-v2'));
  assert.equal(lit.records.some((r) => r.id === 'work-opt3-rev32-jrc-ef-data-v2'), false);
  const ecoSys = lit.records.find((r) => r.id === 'work-opt3-ecoinvent-system-models');
  assert.deepEqual(ecoSys?.catalogSourceIds, ['src-ecoinvent-models', 'src-db27-ecoinvent-sysmodels']);

  // OPT-3 reading bindings: strictly SHA-256 text/html or text/plain, web-sections, zero fabricated PDF indices
  const srcById = new Map(catalog.sources.map((s) => [s.id, s]));
  const opt3Readings = readings.readings.filter((r) => r.id.startsWith('rd-opt3-'));
  assert.equal(opt3Readings.length, 17);
  for (const rd of opt3Readings) {
    assert.equal(rd.readingStatus, 'web-sections');
    assert.equal(rd.artifacts.length, 1);
    const art = rd.artifacts[0];
    assert.ok(['text/html', 'text/plain'].includes(art.mediaType), `${rd.id} unexpected mediaType ${art.mediaType}`);
    assert.match(art.sha256, /^[a-f0-9]{64}$/i);
    assert.equal(art.pageCount, undefined);
    for (const psg of rd.passages) {
      assert.equal(psg.pdfIndices, undefined);
    }
    const boundSources = [...srcById.values()].filter((s) => s.reading?.readingId === rd.id);
    assert.equal(boundSources.length, 1, `${rd.id} must bind to exactly one catalog source`);
    assert.ok(['public-html-inspected', 'public-passages-inspected'].includes(boundSources[0].accessStatus));
    assert.equal(boundSources[0].reading.scope.includes('citation(s)'), false);
  }
});

test('validateRevisionSchema fails closed on malformed, cross-section, duplicate, or invalid-date research blocks', () => {
  const baseRev = {
    schemaVersion: 1,
    id: 'bad-research-rev',
    date: '2026-11-28',
    title: 'Bad',
    rationale: 'Bad',
    routes: [],
  };

  const invalidCases = [
    [{}, /at least one of literature or readings/],
    [{ unexpectedSection: {} }, /unexpected research key/],
    [{ literature: { addedReadings: ['reading-alpha'] } }, /unexpected research\.literature key/],
    [{ readings: { addedRecords: ['work-alpha'] } }, /unexpected research\.readings key/],
    [{ readings: { modifiedRecords: [] } }, /unexpected research\.readings key/],
    [{ literature: { fromUpdatedAt: '2026-02-30' } }, /valid YYYY-MM-DD date/],
    [{ readings: { fromUpdatedAt: 'not-a-date' } }, /valid YYYY-MM-DD date/],
    [{ literature: { addedRecords: [''] } }, /non-empty string array/],
    [{ literature: { addedRecords: ['work-alpha', 'work-alpha'] } }, /duplicate id/],
    [{ literature: { addedQueries: ['query-alpha', 'query-alpha'] } }, /duplicate id/],
    [{ readings: { addedReadings: ['reading-alpha', 'reading-alpha'] } }, /duplicate id/],
    [{ literature: { modifiedRecords: [{ id: 'work-alpha', from: [] }] } }, /exact previous record object/],
    [
      {
        literature: {
          modifiedRecords: [
            { id: 'work-alpha', from: { id: 'work-alpha' } },
            { id: 'work-alpha', from: { id: 'work-alpha' } },
          ],
        },
      },
      /duplicate id/,
    ],
    [
      {
        literature: {
          addedRecords: ['work-alpha'],
          modifiedRecords: [{ id: 'work-alpha', from: { id: 'work-alpha' } }],
        },
      },
      /both research\.literature\.addedRecords and modifiedRecords/,
    ],
  ];

  for (const [research, pattern] of invalidCases) {
    assert.throws(() => validateRevisionSchema({ ...baseRev, research }), pattern);
  }
});

test('applyRevisionsInverse, applyRevisionsToPlan, and applyRevisionsToPlanStatic handle research transitions in parity', async () => {
  const synthetic = {
    catalog: { ...structuredClone(catalog), claims: [], concepts: [], evidence: [], sources: [], mappings: [], coverage: [] },
    literature: {
      updatedAt: '2026-11-28',
      protocol: { queries: [{ id: 'query-alpha' }, { id: 'query-beta' }] },
      records: [{ id: 'work-alpha', title: 'New' }, { id: 'work-beta', title: 'Added' }],
      gaps: [],
    },
    readings: {
      updatedAt: '2026-11-28',
      readings: [{ id: 'reading-alpha' }, { id: 'reading-beta' }],
      gaps: [],
      revisions: [],
    },
    files: new Map(),
  };

  const rev = {
    schemaVersion: 1,
    id: 'test-research-rev',
    date: '2026-11-28',
    title: 'Test research',
    rationale: 'Test reversible research transition.',
    routes: [],
    research: {
      literature: {
        fromUpdatedAt: '2026-11-19',
        addedQueries: ['query-beta'],
        addedRecords: ['work-beta'],
        modifiedRecords: [{ id: 'work-alpha', from: { id: 'work-alpha', title: 'Old' } }],
      },
      readings: {
        fromUpdatedAt: '2026-11-19',
        addedReadings: ['reading-beta'],
      },
    },
  };

  validateRevisionSchema(rev);
  const { previousInput } = await applyRevisionsInverse(synthetic, [rev]);
  assert.equal(previousInput.literature.updatedAt, '2026-11-19');
  assert.deepEqual(previousInput.literature.protocol.queries.map((q) => q.id), ['query-alpha']);
  assert.deepEqual(previousInput.literature.records, [{ id: 'work-alpha', title: 'Old' }]);
  assert.equal(previousInput.readings.updatedAt, '2026-11-19');
  assert.deepEqual(previousInput.readings.readings.map((r) => r.id), ['reading-alpha']);

  const emptyPlan = {
    changes: { record: new Map(), file: new Map() },
    layouts: new Map(),
    migrations: [],
    readingEntries: new Set(),
    outputs: new Map(),
    publicArtifacts: new Map(),
  };
  const dynamicPlan = applyRevisionsToPlan(emptyPlan, [rev], synthetic, previousInput);
  const staticPlan = applyRevisionsToPlanStatic(emptyPlan, [rev], synthetic.catalog, {
    literature: synthetic.literature,
    readings: synthetic.readings,
  });

  for (const key of [
    'queries:query-beta',
    'literature:work-beta',
    'literature:work-alpha',
    'readings:reading-beta',
    'researchMetadata:literature-map',
    'researchMetadata:reading-ledger',
    'researchMetadata:order:literature',
  ]) {
    assert.ok(dynamicPlan.changes.record.has(key), `dynamicPlan missing ${key}`);
    assert.ok(staticPlan.changes.record.has(key), `staticPlan missing ${key}`);
    assert.deepEqual(staticPlan.changes.record.get(key).from, dynamicPlan.changes.record.get(key).from, `${key}.from mismatch`);
    assert.deepEqual(staticPlan.changes.record.get(key).to, dynamicPlan.changes.record.get(key).to, `${key}.to mismatch`);
  }

  // Real runtime expectation parity on modified literature records in currentBookPlan
  for (const mod of opt3Rev.research.literature.modifiedRecords) {
    const curr = lit.records.find((r) => r.id === mod.id);
    assert.ok(currentBookPlan.changes.record.has(`literature:${mod.id}`), `currentBookPlan missing literature:${mod.id}`);
    assert.equal(currentBookRecordMatches('literature', mod.from, curr, 'raw'), true);
    assert.equal(
      currentBookRecordMatches('literature', mod.from, { ...curr, title: 'Tampered Title' }, 'raw'),
      false,
    );
    assert.equal(currentBookPlan.changes.record.get(`literature:${mod.id}`).to.raw, editionDigest(curr));
  }

  await assert.rejects(
    () =>
      applyRevisionsInverse(synthetic, [
        { ...rev, research: { literature: { addedRecords: ['missing-work'] } } },
      ]),
    /not found/,
  );
  await assert.rejects(
    () =>
      applyRevisionsInverse(
        { ...synthetic, literature: { updatedAt: '2026-11-28', protocol: {} } },
        [{ ...rev, research: { literature: { addedQueries: ['query-beta'] } } }],
      ),
    /literature\.protocol\.queries is missing/,
  );
});
