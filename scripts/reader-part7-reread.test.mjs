import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import config from '../config/reader-part7-reread.json' with { type: 'json' };
import mkt from '../config/reader-market-response-comparison.json' with { type: 'json' };
import part3 from '../config/reader-part3-reread.json' with { type: 'json' };
import fr from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import wholeBook from '../config/reader-whole-book-reread.json' with { type: 'json' };
import part1 from '../config/reader-part1-reread.json' with { type: 'json' };
import fw from '../config/reader-framework-comparison.json' with { type: 'json' };
import part2 from '../config/reader-part2-reread.json' with { type: 'json' };
import hyb from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import { restoreMarketResponseComparisonTestFiles } from './reader-market-response-comparison.mjs';
import { restorePart3RereadTestFiles } from './reader-part3-reread.mjs';
import { restoreFunctionalReferenceComparisonTestFiles } from './reader-functional-reference-comparison.mjs';
import { restoreWholeBookRereadTestFiles } from './reader-whole-book-reread.mjs';
import { restorePart1RereadTestFiles } from './reader-part1-reread.mjs';
import { restoreFrameworkComparisonTestFiles } from './reader-framework-comparison.mjs';
import { restorePart2RereadTestFiles } from './reader-part2-reread.mjs';
import { restoreHybridInventoryComparisonTestFiles } from './reader-hybrid-inventory-comparison.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  allowedPart7OrdinaryOverrideKeys,
  part7RereadCorrections,
  part7RereadLayout,
  part7RereadPredecessorPin,
  preparePart7RereadSource,
  selectPart7Reread,
  verifyPart7RereadReceipts,
} from './reader-part7-reread.mjs';

const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));

async function loadInput() {
  const [catalog, readings, literature, baseline, loadShift, service] = await Promise.all([
    readJson('knowledge/catalog.json'),
    readJson('knowledge/research/readings.json'),
    readJson('knowledge/research/literature-map.json'),
    readJson('config/readable-book-baseline.json'),
    readJson('config/reader-load-shift.json'),
    readJson('config/reader-service-constraints.json'),
  ]);
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles('.', baseline.fixedFiles),
    readLoadShiftCaseFiles('.', loadShift.unit),
    readServiceConstraintsFiles('.', service.unit),
  ]);
  for (const [p, b] of [...shiftFiles, ...serviceFiles]) files.set(p, b);
  if (mkt.unit) {
    const prev = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, wholeBook.unit), part1.unit), fw.unit), part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit);
    restoreMarketResponseComparisonTestFiles(restorePart3RereadTestFiles(restoreFunctionalReferenceComparisonTestFiles(restoreHybridInventoryComparisonTestFiles(restorePart2RereadTestFiles(restoreFrameworkComparisonTestFiles(restorePart1RereadTestFiles(restoreWholeBookRereadTestFiles(files, wholeBook.unit), part1.unit), fw.unit), part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit);
    return { catalog: prev.catalog, readings: prev.readings, literature: prev.literature, files };
  }
  return { catalog, readings, literature, files };
}

test('Unit #165 Part VII continuous reread prepares cleanly and recovers exact a55c9fb3 predecessor pin with 1099 claims', async () => {
  const preview = config.status === 'preview';
  const unit = selectPart7Reread(config, undefined, preview);
  assert(unit);
  const input = await loadInput();
  assert.equal(input.catalog.claims.length, 1099);
  assert.equal(part7RereadCorrections.length, 16);
  assert.equal(allowedPart7OrdinaryOverrideKeys.size, 10);
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = preparePart7RereadSource(unit, input, actual, structure);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), part7RereadPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1099);
});

test('Unit #165 selectPart7Reread fails closed on preview without flag, forged pin, inactive downgrade, duplicate scope, and invalid envelope keys', () => {
  if (config.status === 'preview') {
    assert.throws(() => selectPart7Reread(config, null, false), /not independently accepted/i);
    assert.throws(() => selectPart7Reread(config, '0'.repeat(64), true), /not independently accepted/i);
  }
  assert.throws(() => selectPart7Reread({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /null pin/i);
  assert.throws(() => selectPart7Reread({ ...config, status: 'reviewed' }, 'f'.repeat(64), false), /pin mismatch|malformed properties/i);
  assert.throws(() => selectPart7Reread({ ...config, status: 'reviewed' }, null, false), /pin mismatch|malformed properties/i);
  const dupScope = structuredClone(config);
  dupScope.unit.scope.push(dupScope.unit.scope[0]);
  assert.throws(
    () => selectPart7Reread(dupScope, config.status === 'reviewed' ? editionDigest(dupScope.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
  const extraKey = structuredClone(config);
  extraKey.unit.unexpectedField = true;
  assert.throws(
    () => selectPart7Reread(extraKey, config.status === 'reviewed' ? editionDigest(extraKey.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
});

test('Unit #165 rejects forward/non-ascending premiseIds, unauthorized MDX edits, projects B32 table layout, and verifies receipts once reviewed', async () => {
  const preview = config.status === 'preview';
  const unit = selectPart7Reread(config, undefined, preview);
  const input = await loadInput();

  const badPremCat = structuredClone(input.catalog);
  badPremCat.claims.find(c => c.id === 'cl-book-future-decision').premiseIds.reverse();
  const badPremInput = { ...input, catalog: badPremCat };
  assert.throws(
    () => preparePart7RereadSource(unit, badPremInput, inspectReadableBookEdition(badPremInput), copyeditSourceStructure(badPremInput)),
    /non-ascending premiseIds|candidate transition/i,
  );

  const mdxPath = 'content/docs/book/future-technology-and-context.mdx';
  const badMdxInput = { ...input, files: new Map(input.files) };
  badMdxInput.files.set(mdxPath, Buffer.from(input.files.get(mdxPath).toString() + '\nUnauthorized line.\n'));
  assert.throws(
    () => preparePart7RereadSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
    /candidate transition|outside bounded/i,
  );

  const projected = part7RereadLayout(unit, 'B32:/monograph/revisable-judgment:reader-source', {
    source: {
      tables: [{
        rows: [
          ['a', '特征化模型与影响路径', '变异与不确定度', '比较性断言资格', '敏感度结构'],
        ],
      }],
    },
  });
  assert.deepEqual(projected.source.tables[0].rows[0], ['a', '表征模型与影响路径', '变异与不确定性', '比较断言资格', '灵敏度结构']);

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyPart7RereadReceipts(unit, artifacts, downloads), true);
  }
});
