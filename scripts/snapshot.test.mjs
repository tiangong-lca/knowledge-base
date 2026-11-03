import { test } from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const script = resolve('scripts/snapshot.mjs');
test('edition freezing rejects dirty/stale identity and never overwrites output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'kb-snapshot-'));
  const repo = join(dir,'repo'); mkdirSync(repo);
  const git = (...args) => execFileSync('git', args, {cwd:repo,stdio:['ignore','pipe','pipe']}).toString().trim();
  try {
    git('init','-b','main'); git('config','user.name','Snapshot test'); git('config','user.email','test@example.invalid');
    writeFileSync(join(repo,'.gitignore'),'out/\n'); git('add','.gitignore'); git('commit','-m','fixture');
    mkdirSync(join(repo,'out/downloads'),{recursive:true});
    const manifest = join(repo,'out/downloads/manifest.json');
    const files={}; const hash=s=>createHash('sha256').update(s).digest('hex');
    const cat=JSON.stringify({schemaVersion:1,claims:[]});
    writeFileSync(join(repo,'out/downloads/catalog.json'),cat); files['downloads/catalog.json']=hash(cat);
    for(const route of ['', 'docs','sources','claims','concepts','coverage','changes','print']) {
      const path=route ? `${route}/index.html`:'index.html';
      if(route) mkdirSync(join(repo,'out',route),{recursive:true});
      writeFileSync(join(repo,'out',path),'<html>Test</html>'); files[path]=hash('<html>Test</html>');
    }
    const identity={schemaVersion:1,status:'source-build',catalogSha256:hash(cat),files};
    const run = dest => spawnSync(process.execPath,[script,'edition-1',dest],{cwd:repo,encoding:'utf8'});
    writeFileSync(manifest,JSON.stringify({...identity,sourceCommit:git('rev-parse','HEAD'),dirty:true}));
    assert.notEqual(run(join(dir,'dirty')).status,0); assert.equal(existsSync(join(dir,'dirty')),false);
    writeFileSync(manifest,JSON.stringify({...identity,sourceCommit:'0'.repeat(40),dirty:false}));
    assert.notEqual(run(join(dir,'stale')).status,0);
    writeFileSync(manifest,JSON.stringify({...identity,sourceCommit:git('rev-parse','HEAD'),dirty:false}));
    rmSync(join(repo,'out/print/index.html'));
    assert.notEqual(run(join(dir,'incomplete')).status,0);
    writeFileSync(join(repo,'out/print/index.html'),'<html>Test</html>');
    const target=join(dir,'edition'); assert.equal(run(target).status,0); assert.ok(existsSync(join(target,'edition.json')));
    assert.notEqual(run(target).status,0);
    writeFileSync(join(repo,'out/tampered.html'),'unreviewed');
    assert.notEqual(run(join(dir,'tampered')).status,0);
    rmSync(join(repo,'out/tampered.html'));
    assert.notEqual(run(join(repo,'nested')).status,0);
    writeFileSync(join(repo,'uncommitted'),'content'); assert.notEqual(run(join(dir,'dirty-tree')).status,0);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
