import 'server-only';

import rawSpecification from '../knowledge/cases/joint-batch-v1.json';
import { publicTeachingCase, caseInputSha256 } from '../scripts/case-publication.mjs';
import { evaluateJointProductionCase } from '../scripts/joint-production.mjs';

const operationNames = ['joint', 'standaloneX', 'standaloneY', 'wasteY'] as const;
const labels = { joint: 'J，共产品批次', standaloneX: 'S-X，独立 X 供给', standaloneY: 'S-Y，独立 Y 供给', wasteY: 'W-Y，未利用 Y 处理' };
const vector = (values: string[]) => `(${values[0]} kg CO2，${values[1]} g SO2)`;

/** Static server output only: neither the raw record nor a client data prop is serialized. */
export function JointProductionCase() {
  const spec = publicTeachingCase(rawSpecification) as unknown as typeof rawSpecification;
  const result = evaluateJointProductionCase(spec);
  const full = result.scenarios.full, half = result.scenarios.half;
  const bases = { joint: `一批供应 ${spec.outputKgPerJointBatch.X} kg X 和 ${spec.outputKgPerJointBatch.Y} kg Y`, standaloneX: '供应 1 kg 功能等同的 X', standaloneY: '供应 1 kg 功能等同的 Y', wasteY: '处理 1 kg 未使用的 Y，没有回收' };
  const scenarios = [result.scenarios.full, result.scenarios.half, result.scenarios.none];
  const trap = result.doNotCombineSeparateResiduals;
  return <section className="teaching-case" aria-labelledby="joint-batch-case-heading" data-case-id={spec.caseId} data-case-version={spec.version}>
    <h3 id="joint-batch-case-heading">同一批共产品：份额、路线与比较残余</h3>
    <p className="teaching-case-meta">{spec.caseId} · v{spec.version} · 作者虚构、仅作清单核算的教学模型</p>
    <p>一批 J 固定产出 {spec.outputKgPerJointBatch.X} kg X 和 {spec.outputKgPerJointBatch.Y} kg Y。两者分别满足明确规定的不同材料服务；同为 kg 不表示能够互相替代。数量、价格、排放、替代技术和供应响应全部为作者设定。</p>
    <p className="teaching-case-note">每个向量依次保留 kg 化石 CO2 和 g SO2，均为排放到空气。两种流不相加，不使用 LCIA 因子，也不据此给出整体环境优劣。所有表格为固定精确分数，可在无脚本与打印时阅读。</p>
    <div className="teaching-case-table" role="region" aria-label="操作基准与两种排放的虚构输入" tabIndex={0}>
      <table><caption>所列操作的已纳入负担互不重叠；W-Y 每次处理 1 kg 未利用 Y，且不回收。</caption>
        <thead><tr><th scope="col">操作</th><th scope="col">每次操作的基准</th><th scope="col">化石 CO2 / kg</th><th scope="col">SO2 / g</th></tr></thead>
        <tbody>{operationNames.map(name => <tr key={name}><th scope="row">{labels[name]}</th><td>{bases[name]}</td><td>{spec.inventoryPerOperation[name][0]}</td><td>{spec.inventoryPerOperation[name][1]}</td></tr>)}</tbody>
      </table>
    </div>

    <h4>问题一：怎样把既有一批的清单分派给产品标签？</h4>
    <p>此处固定为全部利用，不估计生产响应。质量约定的 X 份额为 {result.partitions.mass.shareX}；销售额约定使用 X 每 kg {spec.pricePerKgCU.X} CU、Y 每 kg {spec.pricePerKgCU.Y} CU，收入分别为 {result.batchRevenueCU.X} 和 {result.batchRevenueCU.Y} CU，因此 X 份额为 {result.partitions.grossSales.shareX}。CU 是虚构货币单位。</p>
    <div className="teaching-case-table" role="region" aria-label="质量与销售额分派的完整批次及每 kg 标签" tabIndex={0}>
      <table><caption>每列向量均为（kg CO2，g SO2）；先逐流守恒，再讨论约定理由。</caption>
        <thead><tr><th scope="col">约定</th><th scope="col">X / Y 份额</th><th scope="col">X 批次标签</th><th scope="col">Y 批次标签</th><th scope="col">每 kg X</th><th scope="col">每 kg Y</th><th scope="col">逐流相加</th></tr></thead>
        <tbody>{([['质量 mass', result.partitions.mass], ['销售额 gross sales', result.partitions.grossSales]] as const).map(([name, p]) => <tr key={name}><th scope="row">{name}</th><td>{p.shareX} / {p.shareY}</td><td>{vector(p.Xbatch)}</td><td>{vector(p.Ybatch)}</td><td>{vector(p.XperKg)}</td><td>{vector(p.YperKg)}</td><td>{vector(p.sum)}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="teaching-case-note">两种分派都守恒，仍没有替彼此证明选择理由；份额也不推导出固定比例过程单独增加 X 的后果。改变假定价格可以改变销售额标签，并不自动改变任何操作或排放。</p>

    <h4>问题二：保持两项服务，改变供给路线会怎样？</h4>
    <p>固定服务篮子为 {spec.functionalDemandKg.X} kg X 和 {spec.functionalDemandKg.Y} kg Y，并假定质量、地点、时间与使用条件相等，独立供应可按所列数量减少。参照路线为 {result.referenceActivities.standaloneX} 次 S-X ＋ {result.referenceActivities.standaloneY} 次 S-Y，正的物理清单为 {vector(result.referenceBasket)}。全部利用时，联合路线为 {full.activities.joint} 次 J，正的清单为 {vector(full.jointRoute)}。</p>
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
    <div className="teaching-case-trace">
      <h4>半数 Y 利用：从正的活动重建结果</h4>
      <p className="teaching-case-equation">联合路线＝J ＋ {half.activities.standaloneY} S-Y ＋ {half.activities.wasteY} W-Y＝{vector(half.contributions.joint)} ＋ {vector(half.contributions.topUp)} ＋ {vector(half.contributions.waste)}＝{vector(half.jointRoute)}。</p>
      <p>两项不同的 Y 平衡都要保留：{half.jointYusedKg} kg 联合 Y ＋ {half.standaloneYtopUpKg} kg 独立补供＝{half.balances.requiredYKg} kg 服务；{half.jointYusedKg} kg 联合 Y 已用 ＋ {half.jointYwastedKg} kg 联合 Y 处理＝{half.balances.jointYProducedKg} kg 联合产出。</p>
      <p>完整篮子变化为 {vector(half.jointRoute)} − {vector(result.referenceBasket)}＝{vector(half.changeJointMinusReference)}，CO2 减少而 SO2 增加，不能合并成一个净环境优势。</p>
      <p className="teaching-case-equation">定义 R-X(q)＝J ＋ {spec.outputKgPerJointBatch.Y}(1−q) W-Y − {spec.outputKgPerJointBatch.Y}q S-Y。q＝{half.q} 时，R-X＝{vector(half.Xresidual)}；再减去 {spec.functionalDemandKg.X} S-X，就恢复完整篮子变化 {vector(half.XresidualReconstructedChange)}。</p>
      <p className="teaching-case-note">物理联合路线始终包含补供；只在推导这个残余时，补供与参照路线中的对应 Y 供给相消。R-X 不是物理联合清单，也不是可脱离参照技术与响应条件的产品属性。</p>
    </div>

    <h4>不能把两次改变比较对象所得的残余相加</h4>
    <p>全部利用时，R-X＝J − {spec.outputKgPerJointBatch.Y} S-Y＝{vector(trap.XresidualAtFullUse)}。若另一次比较改以 Y 为比较对象，R-Y＝J − {spec.outputKgPerJointBatch.X} S-X＝{vector(trap.YresidualFromDifferentAnchoring)}。</p>
    <p><strong>故意演示的错误相加：</strong>R-X ＋ R-Y＝{vector(trap.wrongSum)}，并不等于 J 的物理清单 {vector(trap.physicalJointInventory)}。两次比较各自使用同一完整篮子的节省 {vector(trap.doubleClaimedJointSaving)}，不能再把它们当作一对可加总的共产品标签。这项诊断不构成对所有替代比较的一般否定，也没有决定谁应获得联合收益。</p>
    <details><summary>已固定的虚构前提与未覆盖内容</summary><ul>{spec.premises.map(premise => <li key={premise}>{premise}</li>)}</ul></details>
    <p className="teaching-case-note">算术重建不证明真实替代响应、规范上最优的分派、科学或人类专家认可。这个 q 续例是作者自己的路线构造，不声称实现任何来源中未读或已修正的程序。</p>
    <p className="teaching-case-download"><a href="/downloads/cases/joint-batch-v1.json" download>下载此版本公开输入 JSON</a> · <a href="/downloads/cases/joint-batch-v1.evaluated.json" download>下载只读精确计算结果</a><br/>输入 SHA-256：<code className="artifact-hash">{caseInputSha256(spec)}</code></p>
  </section>;
}
