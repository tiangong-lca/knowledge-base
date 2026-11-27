import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  formatZhReaderLocator,
  getEnEvidenceLocator,
  getEnSourceTitle,
  validateEnBibliography,
} from './reader-citation-display.mjs';

const catalog = JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));
const readings = JSON.parse(readFileSync(new URL('../knowledge/research/readings.json', import.meta.url), 'utf8'));
const enBib = JSON.parse(readFileSync(new URL('../knowledge/editions/en/bibliography.json', import.meta.url), 'utf8'));

test('production EN bibliography covers all sources, evidence, and passages with zero CJK or 0-based leaks', () => {
  assert.deepEqual(validateEnBibliography(catalog, readings, enBib), []);
  assert.doesNotMatch(getEnSourceTitle(catalog.sources.find(s => s.id === 'src-cn-gbt24040-1999-registry'), enBib), /\p{Script=Han}/u);
});

test('validateEnBibliography and resolvers fail closed on missing English entries, CJK leaks, or 0-based indices', () => {
  const miniCatalog = {
    sources: [{ id: 'src-1', title: '中文标题', publisher: 'Pub', version: '2024' }],
    evidence: [{ id: 'ev-1', sourceId: 'src-1', locator: '§1，PDF 零基索引 5' }],
  };
  const miniReadings = {
    readings: [{ id: 'rd-1', passages: [{ id: 'psg-1', locator: 'Section 1, PDF index 3' }] }],
  };
  const emptyBib = { schemaVersion: 1, sources: {}, evidence: {}, passages: {} };
  const errs = validateEnBibliography(miniCatalog, miniReadings, emptyBib);
  assert.ok(errs.some(e => e.includes('source.src-1.title')));
  assert.ok(errs.some(e => e.includes('evidence.ev-1.locator')));
  assert.ok(errs.some(e => e.includes('passage.psg-1.locator')));

  assert.throws(() => getEnSourceTitle(miniCatalog.sources[0], emptyBib), /Missing or invalid English bibliographic entry/);
  assert.throws(() => getEnEvidenceLocator(miniCatalog.evidence[0], emptyBib), /Missing or invalid English bibliographic entry/);

  const orphanBib = { schemaVersion: 1, sources: { 'src-ghost': { title: 'Ghost' } }, evidence: {}, passages: {} };
  assert.ok(validateEnBibliography({ sources: [], evidence: [] }, { readings: [] }, orphanBib).some(e => e.includes('Orphan source ID')));
});

test('formatZhReaderLocator converts all 0-based PDF/NEPIS/notebook index forms to 1-based pagination', () => {
  assert.equal(formatZhReaderLocator('§6.4，印刷 pp60–64；PDF 零基索引79–83'), '§6.4，印刷 pp60–64；PDF 第 80–84 页');
  assert.equal(formatZhReaderLocator('印刷 p5-55；NEPIS 零基分页块181；封面块0'), '印刷 p5-55；NEPIS 第 182 页；封面第 1 块');
  assert.equal(formatZhReaderLocator('印p82图11.2；PDF物理p84（零基索引83）'), '印p82图11.2；PDF物理p84');
  assert.equal(formatZhReaderLocator('notebooks/320.ipynb，零基单元 3–5、7。'), 'notebooks/320.ipynb，第 4–6、8 单元。');
  assert.equal(formatZhReaderLocator('印刷 pp155–156；PDF zero indexes0–1；§§1–2'), '印刷 pp155–156；PDF 第 1–2 页；§§1–2');
  assert.equal(formatZhReaderLocator('指定45个扫描页，见pdfIndices'), '指定 45 个扫描页');
  for (const ev of catalog.evidence) {
    assert.doesNotMatch(formatZhReaderLocator(ev.locator), /零基|pdfIndices|pdfIndex|PDF\s*(?:zero\s*)?(?:indices|indexes|index)/i);
  }
  for (const r of readings.readings) {
    for (const p of r.passages ?? []) {
      assert.doesNotMatch(formatZhReaderLocator(p.locator), /零基|pdfIndices|pdfIndex|PDF\s*(?:zero\s*)?(?:indices|indexes|index)/i);
      if (p.printedPages) {
        assert.doesNotMatch(formatZhReaderLocator(p.printedPages), /零基|pdfIndices|pdfIndex/i);
      }
    }
  }
});
