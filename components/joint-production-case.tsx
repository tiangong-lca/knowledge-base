import 'server-only';
import { NumberedHeading, type CaseHeadingNumber } from './numbered-heading';

import rawSpecification from '../knowledge/cases/joint-batch-v1.json';
import { publicTeachingCase } from '../scripts/case-publication.mjs';
import { evaluateJointProductionCase } from '../scripts/joint-production.mjs';
import { printUnitAnchor } from '../scripts/reader-book.mjs';

const operationNames = ['joint', 'standaloneX', 'standaloneY', 'wasteY'] as const;
const labels = { joint: 'J，共产品批次', standaloneX: 'S-X，独立 X 供给', standaloneY: 'S-Y，独立 Y 供给', wasteY: 'W-Y，未利用 Y 处理' };
const vector = (values: string[]) => `(${values[0]} kg CO2，${values[1]} g SO2)`;

/** Static server output only: neither the raw record nor a client data prop is serialized. */
export function JointProductionCase({ print = false, numbering = [] }: { print?: boolean; numbering?: CaseHeadingNumber[] } = {}) {
  function Heading({slot, children, id}: {slot: string; children: React.ReactNode; id?: string}) {
    const key = `@case:joint:${slot}`, heading = numbering.find(row=>row.key===key);
    if (!heading) throw new Error(`Missing actual joint-case heading number: ${key}`);
    return <NumberedHeading level={heading.depth+(print?2:0)} number={heading.number} id={id} data-reader-heading-key={key}>{children}</NumberedHeading>;
  }
  const spec = publicTeachingCase(rawSpecification) as unknown as typeof rawSpecification;
  const result = evaluateJointProductionCase(spec);
  const bases = { joint: `一批供应 ${spec.outputKgPerJointBatch.X} kg X 和 ${spec.outputKgPerJointBatch.Y} kg Y`, standaloneX: '供应 1 kg 功能等同的 X', standaloneY: '供应 1 kg 功能等同的 Y', wasteY: '处理 1 kg 未使用的 Y，没有回收' };
  const scenarios = [result.scenarios.full, result.scenarios.half, result.scenarios.none];
  const bookPrefix = printUnitAnchor('book-joint-production');
  const inferenceLinks = print ? [
    { href: `#${bookPrefix}-负担份额`, title: '负担份额' },
    { href: `#${bookPrefix}-参照供给`, title: '参照供给' },
  ] : [
    { href: '#同一批产品先问份额归给谁', title: '批次份额' },
    { href: '#先保留两项服务再看替代减项', title: '同一组服务' },
    { href: '#部分利用时重新交代活动与去向', title: '部分利用' },
  ];
  return <section className="teaching-case" aria-labelledby="joint-batch-case-heading" data-case-id={spec.caseId} data-case-version={spec.version}>
    <Heading slot="title" id="joint-batch-case-heading">同一批共产品：份额、路线与比较残余</Heading>
    <p className="teaching-case-meta">虚构教学案例 · 清单核算</p>
    <p className="teaching-case-note">以下表格供查阅输入与计算结果；逐步推理见{inferenceLinks.map((link, index) => <span key={link.href}>{index > 0 ? '、' : ''}<a href={link.href}>{link.title}</a></span>)}。</p>
    <p>一批 J 固定产出 {spec.outputKgPerJointBatch.X} kg X 和 {spec.outputKgPerJointBatch.Y} kg Y。两者分别满足明确规定的不同材料服务；同为 kg 不表示能够互相替代。数量、价格、排放、替代技术和供应响应全部为作者设定。</p>
    <p className="teaching-case-note">每个向量依次保留 kg 化石 CO2 和 g SO2，均为排放到空气。两种流不相加，不使用 LCIA 因子，也不据此给出整体环境优劣。分数表示这些设定值的精确计算结果，不表示现实数据具有同样的精度。</p>
    <div className="teaching-case-table" role="region" aria-label="操作基准与两种排放的虚构输入" tabIndex={0}>
      <table><caption>所列操作的已纳入负担互不重叠；W-Y 每次处理 1 kg 未利用 Y，且不回收。</caption>
        <thead><tr><th scope="col">操作</th><th scope="col">每次操作的基准</th><th scope="col">化石 CO2（kg）</th><th scope="col">SO2（g）</th></tr></thead>
        <tbody>{operationNames.map(name => <tr key={name}><th scope="row">{labels[name]}</th><td>{bases[name]}</td><td>{spec.inventoryPerOperation[name][0]}</td><td>{spec.inventoryPerOperation[name][1]}</td></tr>)}</tbody>
      </table>
    </div>

    <Heading slot="partition">问题一：怎样把既有一批的清单分派给产品标签？</Heading>
    <p>份额表固定为全部利用，不估计生产响应。价格设定为 X 每 kg {spec.pricePerKgCU.X} CU、Y 每 kg {spec.pricePerKgCU.Y} CU；CU 是虚构货币单位。</p>
    <div className="teaching-case-table" role="region" aria-label="质量与销售额分派的完整批次及每 kg 标签" tabIndex={0}>
      <table><caption>批次列保留（kg CO2，g SO2）；每 kg 产品列分别以 1 kg X 或 Y 为基准。先逐流核对加总，再讨论约定理由。</caption>
        <thead><tr><th scope="col">约定</th><th scope="col">X / Y 份额</th><th scope="col">X 批次标签</th><th scope="col">Y 批次标签</th><th scope="col">每 kg X</th><th scope="col">每 kg Y</th><th scope="col">逐流相加</th></tr></thead>
        <tbody>{([['质量 mass', result.partitions.mass], ['销售额 gross sales', result.partitions.grossSales]] as const).map(([name, p]) => <tr key={name}><th scope="row">{name}</th><td>{p.shareX} / {p.shareY}</td><td>{vector(p.Xbatch)}</td><td>{vector(p.Ybatch)}</td><td>{vector(p.XperKg)}</td><td>{vector(p.YperKg)}</td><td>{vector(p.sum)}</td></tr>)}</tbody>
      </table>
    </div>

    <Heading slot="routes">问题二：保持两项服务，改变供给路线会怎样？</Heading>
    <p>共同服务为 {spec.functionalDemandKg.X} kg X 和 {spec.functionalDemandKg.Y} kg Y。独立参照路线为 {result.referenceActivities.standaloneX} 次 S-X ＋ {result.referenceActivities.standaloneY} 次 S-Y，清单为 {vector(result.referenceBasket)}。</p>
    <p>q 表示 J 产出 Y 中实际送达这项既有 Y 服务的比例；未利用部分要处理，服务缺口另由 S-Y 补足。这里列出三个独立设定的交付情景，不给它们分配概率。</p>
    <div className="teaching-case-table" role="region" aria-label="固定篮子下的实际活动和两项 Y 平衡" tabIndex={0}>
      <table><caption>所有联合路线均保持一次 J；q 改变补供和处理活动，不是自由折扣。</caption>
        <thead><tr><th scope="col">q</th><th scope="col">J / S-X / S-Y / W-Y 操作次数</th><th scope="col">联合 Y 已用 / kg</th><th scope="col">联合 Y 处理 / kg</th><th scope="col">独立 Y 补供 / kg</th><th scope="col">X / Y 服务供给 / kg</th></tr></thead>
        <tbody>{scenarios.map(s => <tr key={s.q}><th scope="row">{s.q}</th><td>{operationNames.map(name => s.activities[name]).join(' / ')}</td><td>{s.jointYusedKg}</td><td>{s.jointYwastedKg}</td><td>{s.standaloneYtopUpKg}</td><td>{s.balances.XserviceSuppliedKg} / {s.balances.YserviceSuppliedKg}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="teaching-case-table" role="region" aria-label="物理路线、完整篮子变化与以 X 为比较对象的残余" tabIndex={0}>
      <table><caption>向量为（kg CO2，g SO2）。变化和残余是相减结果，负值不表示物理移除。</caption>
        <thead><tr><th scope="col">q</th><th scope="col">联合路线的物理清单</th><th scope="col">联合 − 参照：完整篮子变化</th><th scope="col">以 X 为比较对象的残余 / {spec.outputKgPerJointBatch.X} kg X</th><th scope="col">残余 / kg X</th></tr></thead>
        <tbody>{scenarios.map(s => <tr key={s.q}><th scope="row">{s.q}</th><td>{vector(s.jointRoute)}</td><td>{vector(s.changeJointMinusReference)}</td><td>{vector(s.Xresidual)}</td><td>{vector(s.XresidualPerKg)}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="teaching-case-note">正文中的双残余相加诊断不构成对所有替代比较的一般否定，也没有决定谁应获得联合收益。</p>
    <div className="teaching-case-conditions"><strong>计算前提与适用范围</strong><ul>
      <li>X 与 Y 满足不同的材料服务；质量单位相同，不意味着两者可互相替代。</li>
      <li>联合过程的两种产出比例固定，不能独立改变其中一种；独立供给是设定的替代技术。</li>
      <li>每项操作的清单包含本例为该操作纳入的全部负担，各操作之间没有重复计入。其他活动和基本流被省略，不表示其实际排放为零。</li>
      <li>比较限于列出的运行活动变化，不变的资本负担在此边界之外，不能据此判断建厂或投资的后果。</li>
      <li>X 与 Y 的接收需求固定。可用的联合 Y 在质量、地点、时间和后续使用条件上与独立 Y 相同，按一比一替代；本例未设定额外加工或后续使用差异。</li>
      <li>独立供应能按所列数量减少，联合活动能取代所列 X 供应；模型未纳入产能约束、价格反馈、反弹、响应延迟或其他诱发活动。</li>
      <li>将结果用于实际问题，需要另有证据支持供应者响应与利用比例 q；观察到售价或发生销售，并不能单独证明替代。</li>
      <li>虚构货币 CU 的价格只决定全部利用时的销售额分派，不决定供给路线，也不说明哪种产品决定联合产量。</li>
      <li>各物理路线的排放都是正值。负残余来自减去参照供给，不是大气移除、负的物理生产量或产品固有属性。</li>
      <li>CO2 与 SO2 保留各自单位，不经过影响表征或跨流加总，不能据此判定整体环境优劣。</li>
      <li>部分利用情景改变的是明确设定的服务交付条件，不是 Weidema 规则或其修正例题的应用。</li>
    </ul></div>
    <p className="teaching-case-download"><a href="/downloads/cases/joint-batch-v1.json" download>下载案例输入</a> · <a href="/downloads/cases/joint-batch-v1.evaluated.json" download>下载计算结果</a></p>
  </section>;
}
