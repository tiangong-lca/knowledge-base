import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { assertNumberingToc, assertReaderNumbering, currentPrintReadingHref, getContinuationLink, getHeadingNumbering, getPresentationUnits, getUnitHeadingPlan, getUnitNumbering, printReadingEntryAnchor, readNumberedHeading, readerNumberingManifest } from './reader-numbering.mjs';
import { printUnitAnchor } from './reader-book.mjs';

const route = '/docs/book/service-and-reference';
test('authored full-unit links use current reading entries without changing scoped citations', () => {
  const key='/docs/book/data-quality-and-probability', old=printUnitAnchor(key), current=printReadingEntryAnchor(key);
  assert.notEqual(old,current);
  assert.equal(currentPrintReadingHref(`/print/#${old}`),`/print/#${current}`);
  assert.equal(currentPrintReadingHref(`#${old}`,true),`#${current}`);
  assert.equal(currentPrintReadingHref(`#${old}`),`#${old}`);
  assert.equal(currentPrintReadingHref(`/print/#${old}-claim-cl-ped-estimate-boundary`),`/print/#${old}-claim-cl-ped-estimate-boundary`);
  assert.equal(currentPrintReadingHref('/sources/#src-example'),'/sources/#src-example');
  assert.equal(currentPrintReadingHref('/print/#not-a-declared-unit'),'/print/#not-a-declared-unit');
});
const html = (number='6.1',title='服务要求') => `<h2 data-reader-heading-key="服务要求"><a href="#服务要求"><span data-reader-number="">${number}</span> <span data-reader-heading-title="">${title}</span></a><button>复制章节链接</button></h2>`;

test('current book retains 40 actual units, 32 chapters, 120 formal sections and seven real parts', () => {
  const units=getPresentationUnits('book');
  assert.equal(units.length,40);
  assert.deepEqual(['front-matter','chapter','topic','appendix'].map(kind=>units.filter(unit=>unit.kind===kind).length),[2,32,2,4]);
  assert.deepEqual([1,2,3,4,5,6,7].map(part=>units.filter(unit=>unit.part===part).length),[5,4,4,6,5,4,4]);
  assert.equal(getUnitNumbering('book',route).label,'第6章');
  assert.equal(getUnitNumbering('book','/docs/book/inventory-calculation').label,'第7章');
  assert.equal(getUnitNumbering('book','book-joint-production').label,'第10章');
  assert.equal(getUnitNumbering('book','/docs/book/emission-time-and-assessment'),null);
  assert.equal(getUnitNumbering('book','book-climate-equivalence').label,'第15章');
  assert.equal(getUnitNumbering('book','/docs/book/wall-service-to-comparison').label,'第29章');
  assert.equal(getUnitNumbering('book','book-revisable-judgment').label,'第32章');
  assert.equal(getUnitNumbering('book','/docs/history').label,'附记 T1');
  assert.equal(getUnitNumbering('book','/docs/allocation').label,'附记 T2');
  const sections = units.filter(unit=>unit.kind==='chapter')
    .map(unit=>getUnitHeadingPlan('book',unit.key).filter(row=>row.type==='mdx'&&row.depth===2).length);
  assert.equal(sections.reduce((sum,count)=>sum+count,0),120);
  assert(sections.every(count=>count>=3&&count<=5));
  for (const {key} of units) {
    const historical = printUnitAnchor(key);
    assert.equal(printReadingEntryAnchor(key),historical.replace('print-unit-','print-reading-unit-'));
  }
  assert.equal(getUnitNumbering('book','/docs/appendices/container-energy-check').label,'附录 A');
  assert.equal(getUnitNumbering('book','/docs/appendices/cml-framework-calculations').label,'附录 B');
  assert.equal(getUnitNumbering('book','/docs/appendices/climate-numerical-reconstruction').label,'附录 C');
  assert.equal(getUnitNumbering('book','/docs/appendices/particulate-factor-calculations').label,'附录 D');
  assert.equal(getUnitNumbering('book','/docs').label,null);
});

test('website numbering retains 37 fine pages and five independent topic entries',()=>{
  const web=getPresentationUnits('web');
  assert.equal(web.length,48);
  assert.equal(web.filter(unit=>unit.kind==='chapter').length,37);
  assert.equal(new Set(web.map(unit=>unit.key)).size,48);
  assert.equal(getUnitNumbering('web',route).label,'第7篇');
  assert.equal(getUnitNumbering('web','/docs/book/framework-history').label,'第4篇');
  assert.equal(getUnitNumbering('web','/docs/book/cml-computation-judgment-and-improvement').label,'第5篇');
  assert.equal(getUnitNumbering('web','/docs/allocation').label,'专题4');
  assert.equal(getHeadingNumbering('web','/docs/allocation','系统模型规定了什么').number,'T4.1');
  assert.equal(getHeadingNumbering('book','/docs/allocation','系统模型规定了什么').number,'T2.1');
});

test('actual case detail keeps its source sibling hierarchy and stays outside formal sections',()=>{
  const joint=getUnitHeadingPlan('book','book-joint-production');
  assert.deepEqual(joint.filter(row=>row.type==='case').map(row=>[row.key,row.depth,row.number]),[
    ['@case:joint:title',3,'10.3.1'],['@case:joint:partition',4,'10.3.1.1'],['@case:joint:routes',4,'10.3.1.2'],
  ]);
  assert.equal(joint.filter(row=>row.type==='mdx').length,4);
  const wall=getUnitHeadingPlan('book','/docs/book/wall-service-to-comparison');
  assert.deepEqual(wall.filter(row=>row.type==='case').map(row=>[row.depth,row.number]),[[3,'29.4.1'],[4,'29.4.1.1'],[4,'29.4.1.2'],[4,'29.4.1.3'],[4,'29.4.1.4']]);
  assert.equal(wall.find(row=>row.key==='@case:wall:current').title,'计算示例：平整基底 smooth · θ=0.3');
  assert.equal(wall.filter(row=>row.type==='mdx')[2].number,'29.3');
  assert.deepEqual(wall.filter(row=>row.type==='mdx').map(row=>[row.title,row.number]),[['功能实现','29.1'],['清单形成','29.2'],['指标含义','29.3'],['配对判断','29.4']]);
  assert.equal(getUnitNumbering('web','/docs/book/wall-service-to-comparison').title,'墙面服务比较');
  assert.equal(getHeadingNumbering('book','/docs/appendices/container-energy-check','工序输入').number,'A.1');
});

test('presentation inventory is independently pinned and source TOC titles and IDs are mandatory',()=>{
  assert.doesNotThrow(()=>assertReaderNumbering());
  for(const mutate of [value=>value.book.reverse(),value=>value.book[2].title='伪造标题',value=>value.headings[route][0].id='wrong']){
    const copy=structuredClone(readerNumberingManifest);mutate(copy);assert.throws(()=>assertReaderNumbering(copy),/independently pinned/);
  }
  const toc=getUnitHeadingPlan('web',route).filter(row=>row.type==='mdx').map(row=>({url:`#${row.id}`,title:row.title,depth:row.depth}));
  assert.doesNotThrow(()=>assertNumberingToc('web',route,toc));
  assert.throws(()=>assertNumberingToc('web',route,[...toc].reverse()),/Actual source TOC differs/);
  assert.throws(()=>assertNumberingToc('web',route,toc.map((row,index)=>index?row:{...row,title:'替换标题'})),/Actual source TOC differs/);
});

test('compiled Fumadocs Fragment TOC preserves exact title, ID, depth and order',()=>{
  const source='/docs/book/ecological-scarcity-and-targets';
  const toc=getUnitHeadingPlan('web',source).filter(row=>row.type==='mdx').map(row=>({url:`#${encodeURIComponent(row.id)}`,title:jsx(Fragment,{children:row.title}),depth:row.depth}));
  assert.doesNotThrow(()=>assertNumberingToc('web',source,toc));
  const title=getUnitHeadingPlan('web',source).find(row=>row.type==='mdx').title;
  const replaceFirst=change=>toc.map((row,index)=>index?row:{...row,...change});
  assert.doesNotThrow(()=>assertNumberingToc('web',source,replaceFirst({title:jsxs(Fragment,{children:[title.slice(0,2),jsx(Fragment,{children:title.slice(2)})]})})));
  for(const change of [
    {title:jsx(Fragment,{children:title+'改'})},
    {title:jsx(Fragment,{children:'1.1 '+title})},
    {title:jsx(Fragment,{children:title+' '})},
    {url:'#wrong'},
    {depth:3},
  ]) assert.throws(()=>assertNumberingToc('web',source,replaceFirst(change)),/Actual source TOC differs/);
  assert.throws(()=>assertNumberingToc('web',source,[...toc].reverse()),/Actual source TOC differs/);
});

test('TOC normalization rejects hidden, dynamic and unsupported nodes without executing components',()=>{
  const toc=getUnitHeadingPlan('web',route).filter(row=>row.type==='mdx').map(row=>({url:`#${row.id}`,title:jsx(Fragment,{children:row.title}),depth:row.depth}));
  const title=getUnitHeadingPlan('web',route).find(row=>row.type==='mdx').title;
  let calls=0;
  function DynamicTitle(){calls++;return title;}
  for(const unsupported of [
    jsx('span',{hidden:true,children:title}),
    jsx('span',{'aria-hidden':true,children:title}),
    jsx('span',{style:{display:'none'},children:title}),
    jsx('code',{children:title}),
    jsx(DynamicTitle,{}),
    jsx(Fragment,{children:title,hidden:true}),
    {toString:()=>title},
    Promise.resolve(title),
    null,undefined,false,true,1,
    [title,null],
    [title,...Array(1)],
  ]) assert.throws(()=>assertNumberingToc('web',route,toc.map((row,index)=>index?row:{...row,title:jsx(Fragment,{children:unsupported})})),/Unsupported source TOC title.*web.*service-and-reference/);
  assert.equal(calls,0);
});

test('exact visible number/title spans reject wrong numbers, malformed wrappers and extra text',()=>{
  const expected={key:'服务要求',number:'6.1',title:'服务要求'};
  assert.equal(readNumberedHeading(htmlParser.parse(html()).querySelector('h2'),expected),'服务要求');
  for(const source of [html('7.1'),html('6.1','假标题'),html().replace('服务要求"><a','wrong"><a'),html().replace('data-reader-number=""','data-reader-number="6.1"'),html().replace('</a>','<span data-reader-heading-title="">服务要求</span></a>'),html().replace('<a href','多余正文<a href'),html().replace('</a>','</a>多余正文'),html().replace('6.1</span> <span','6.1</span><span')]){
    assert.throws(()=>readNumberedHeading(htmlParser.parse(source).querySelector('h2'),expected));
  }
  assert.throws(()=>readNumberedHeading(htmlParser.parse('<h2>6.1 服务要求</h2>').querySelector('h2'),expected));
});

test('manifest contains every actual source and does not silently hide authored MDX headings',async()=>{
  const files=(await readdir(new URL('../content/docs/',import.meta.url),{recursive:true})).filter(file=>file.endsWith('.mdx'));
  const expectedRoutes=files.map(file=>'/docs/'+file.replace(/\\/g,'/').replace(/\.mdx$/,'').replace(/(^|\/)index$/,'')).map(route=>route.replace(/\/$/,''));
  assert.deepEqual(getPresentationUnits('web').map(unit=>unit.source).sort(),expectedRoutes.sort());
  for(const [source,rows] of Object.entries(readerNumberingManifest.headings)){
    const path=`../content${source}${['/docs','/docs/book'].includes(source)?'/index':''}.mdx`;
    const raw=await readFile(new URL(path,import.meta.url),'utf8');
    const actual=[...raw.matchAll(/^(#{2,6}) (.+)$/gm)].map(match=>({depth:match[1].length,title:match[2].replace(/\s*\[#.+?\]\s*$/,'')}));
    assert.deepEqual(rows.filter(row=>row.type==='mdx').map(({depth,title})=>({depth,title})),actual,source);
    const expectedCaseHeadings = raw.includes('id="CASE-JOINT-BATCH"') ? 3 : raw.includes('id="CASE-WALL-CONNECT"') ? 5 : 0;
    assert.equal(rows.filter(row=>row.type==='case').length,expectedCaseHeadings,source);
  }
});


test('the three exact source-qualified continuations keep their own website and current book targets',()=>{
  const cases = [
    ['policy-to-framework','/docs/book/early-container-policy-and-systems','/docs/book/early-container-policy-and-systems',
      '/docs/book/framework-history/','评价框架的形成','book-framework-responsibilities'],
    ['emission-time-to-future','/docs/book/emission-time-and-assessment','book-climate-equivalence',
      '/docs/book/future-technology-and-context/','未来技术与情景','/docs/book/future-technology-and-context'],
    ['data-to-uncertainty','/docs/book/review-support-and-version-boundaries','book-data-applicability',
      '/docs/book/uncertainty-and-variability','变异与不确定性','/docs/book/uncertainty-and-variability'],
  ];
  for (const [key, webSource, bookSource, href, webLabel, destination] of cases) {
    assert.deepEqual(getContinuationLink('web',webSource,href,webLabel),{key,href,label:webLabel});
    const bookLabel = getUnitNumbering('book', destination).title;
    const current = printReadingEntryAnchor(destination);
    assert.notEqual(current, printUnitAnchor(destination));
    assert.deepEqual(getContinuationLink('book',bookSource,href,webLabel),{key,href:'#'+current,label:bookLabel});
    for (const [route, target, label] of [[bookSource,href+'#history',webLabel],[bookSource,href,'不同标题'],['/docs/history',href,webLabel]])
      assert.equal(getContinuationLink('book',route,target,label),null);
    if (webSource!==bookSource) assert.equal(getContinuationLink('book',webSource,href,webLabel),null);
  }
});
