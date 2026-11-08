import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { assertNumberingToc, assertReaderNumbering, getContinuationLink, getHeadingNumbering, getPresentationUnits, getUnitHeadingPlan, getUnitNumbering, readNumberedHeading, readerNumberingManifest } from './reader-numbering.mjs';

const route = '/docs/book/service-and-reference';
const html = (number='6.1',title='服务要求') => `<h2 data-reader-heading-key="服务要求"><a href="#服务要求"><span data-reader-number="">${number}</span> <span data-reader-heading-title="">${title}</span></a><button>复制章节链接</button></h2>`;

test('current book retains 41 actual units, 35 chapters and all seven real part groups', () => {
  const units=getPresentationUnits('book');
  assert.equal(units.length,41);
  assert.deepEqual(['front-matter','chapter','topic','appendix'].map(kind=>units.filter(unit=>unit.kind===kind).length),[2,35,2,2]);
  assert.deepEqual([1,2,3,4,5,6,7].map(part=>units.filter(unit=>unit.part===part).length),[5,4,4,7,5,5,5]);
  assert.equal(getUnitNumbering('book',route).label,'第6章');
  assert.equal(getUnitNumbering('book','/docs/book/inventory-calculation').label,'第7章');
  assert.equal(getUnitNumbering('book','book-joint-production').label,'第10章');
  assert.equal(getUnitNumbering('book','/docs/book/emission-time-and-assessment').label,'第16章');
  assert.equal(getUnitNumbering('book','/docs/book/wall-service-to-comparison').label,'第31章');
  assert.equal(getUnitNumbering('book','/docs/book/from-connected-results-to-conditional-judgment').label,'第35章');
  assert.equal(getUnitNumbering('book','/docs/allocation').label,'专题2');
  assert.equal(getUnitNumbering('book','/docs/appendices/container-energy-check').label,'附录 A');
  assert.equal(getUnitNumbering('book','/docs/appendices/cml-framework-calculations').label,'附录 B');
  assert.equal(getUnitNumbering('book','/docs').label,null);
});

test('website numbering retains 37 fine pages and five independent topic entries',()=>{
  const web=getPresentationUnits('web');
  assert.equal(web.length,46);
  assert.equal(web.filter(unit=>unit.kind==='chapter').length,37);
  assert.equal(new Set(web.map(unit=>unit.key)).size,46);
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
  assert.deepEqual(wall.filter(row=>row.type==='case').map(row=>[row.depth,row.number]),[[3,'31.4.1'],[4,'31.4.1.1'],[4,'31.4.1.2'],[4,'31.4.1.3'],[4,'31.4.1.4']]);
  assert.equal(wall.find(row=>row.key==='@case:wall:current').title,'当前计算：平整基底 smooth · θ=0.3');
  assert.equal(wall.filter(row=>row.type==='mdx')[2].number,'31.3');
  assert.deepEqual(wall.filter(row=>row.type==='mdx').map(row=>[row.title,row.number]),[['功能实现','31.1'],['清单形成','31.2'],['指标含义','31.3'],['配对判断','31.4']]);
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


test('only two exact source-qualified continuations change in the book view',()=>{
  const policy='/docs/book/early-container-policy-and-systems',framework='/docs/book/framework-history/';
  const web=getContinuationLink('web',policy,framework,'评价框架的形成');
  const book=getContinuationLink('book',policy,framework,'评价框架的形成');
  assert.deepEqual(web,{key:'policy-to-framework',href:framework,label:'评价框架的形成'});
  assert.equal(book.label,'框架职责');
  assert.equal(book.href,'#print-unit-626f6f6b2d6672616d65776f726b2d726573706f6e736962696c6974696573');
  const time='/docs/book/emission-time-and-assessment',future='/docs/book/future-technology-and-context/';
  assert.deepEqual(getContinuationLink('web',time,future,'未来技术置于怎样的世界'),{key:'emission-time-to-future',href:future,label:'未来技术置于怎样的世界'});
  assert.equal(getContinuationLink('book',time,future,'未来技术置于怎样的世界').href,'#print-unit-2f646f63732f626f6f6b2f6675747572652d746563686e6f6c6f67792d616e642d636f6e74657874');
  for(const [route,href,label] of [[policy,framework+'#history','评价框架的形成'],[policy,framework,'不同标题'],[time,framework,'评价框架的形成'],['/docs/history',future,'未来技术置于怎样的世界']])assert.equal(getContinuationLink('book',route,href,label),null);
});
