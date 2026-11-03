import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, resolve, dirname, basename, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const [id, destination] = process.argv.slice(2);
if (!id || !/^[a-z0-9][a-z0-9.-]{0,79}$/.test(id) || !destination) throw new Error('Usage: node scripts/snapshot.mjs <edition-id> <new-output-directory>');
const target = join(realpathSync(dirname(resolve(destination))), basename(destination));
const rel = relative(realpathSync(process.cwd()), target);
if ((!rel.startsWith('..') && !isAbsolute(rel)) || existsSync(target)) throw new Error('Use a NEW output directory outside the checkout; editions cannot be overwritten.');
if (!existsSync('out/downloads/manifest.json')) throw new Error('Run pnpm build first.');
const identity = JSON.parse(readFileSync('out/downloads/manifest.json', 'utf8'));
if (identity.schemaVersion !== 1 || identity.status !== 'source-build' || !/^[a-f0-9]{64}$/.test(identity.catalogSha256 ?? '')) throw new Error('Invalid build identity manifest.');
for (const route of ['', 'docs', 'sources', 'claims', 'concepts', 'coverage', 'changes', 'print']) {
  if (!existsSync(`out/${route ? `${route}/` : ''}index.html`)) throw new Error(`Missing static route: ${route}`);
}
const catalog = JSON.parse(readFileSync('out/downloads/catalog.json','utf8'));
if (catalog.schemaVersion !== 1 || createHash('sha256').update(JSON.stringify(catalog)).digest('hex') !== identity.catalogSha256) throw new Error('Catalog identity differs from the build manifest.');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (identity.dirty || identity.sourceCommit !== head || execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) throw new Error('Build a clean committed revision before freezing an edition.');
const files = {};
function hashTree(path, prefix = '') {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) hashTree(join(path, entry.name), `${relative}/`);
    else if (entry.isFile()) files[relative] = createHash('sha256').update(readFileSync(join(path, entry.name))).digest('hex');
    else throw new Error(`Unsupported artifact entry: ${relative}`);
  }
}
hashTree('out');
const actualFiles = {...files};
delete actualFiles['downloads/manifest.json'];
if (!identity.files || JSON.stringify(Object.entries(actualFiles).sort()) !== JSON.stringify(Object.entries(identity.files).sort())) throw new Error('Static output changed since build manifest; rebuild before freezing.');
mkdirSync(target, {recursive:true});
cpSync('out', join(target,'site'), {recursive:true});
writeFileSync(join(target, 'edition.json'), JSON.stringify({ ...identity, id, status: 'frozen-source-edition', errata: 'https://github.com/tiangong-lca/knowledge-base/issues?q=Erratum', files }, null, 2)+'\n');
console.log(`Frozen ${id} from ${head} at ${target}. Publish the entire site directory and edition manifest together. PDF is produced from site/print/ with the same edition identity.`);
