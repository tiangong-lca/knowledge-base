'use client';

import { useId, useState } from 'react';
import {
  assertTeachingCaseIdentity, evaluateCase, publishedResults, serviceDeficitPercent,
  type CaseAlternative, type CaseResult, type CaseScenario, type TeachingCaseSpec,
} from '../lib/teaching-case';

const names = { paintA: '涂料 A', paintB: '涂料 B' };
const scenarioNames = { smooth: '平整基底 smooth', rough: '粗糙基底 rough' };
const alternatives = ['paintA', 'paintB'] as const;
const operations = ['P-A · 1 kg A', 'P-B · 1 kg B', 'P-P · 1 m² 基底准备', 'P-E · 1 kWh 电力'];
const range = (values: string[]) => `[${values.join(', ')}]`;
const vector = (values: string[]) => `(${values.join(', ')})ᵀ`;
const ordering = (value: CaseResult['comparison']['strictOrdering']) => value === 'A-lower'
  ? 'A 在整个允许范围内严格较低' : value === 'B-lower' ? 'B 在整个允许范围内严格较低' : '未建立全域严格排序';

function PairedChart({ result, id, teachingCase, publishedCaseResults }: {
  result: CaseResult; id: string; teachingCase: TeachingCaseSpec; publishedCaseResults: ReturnType<typeof publishedResults>;
}) {
  // Number conversion is limited to plotting. Results and predicates use the exact engine.
  const [thetaLow, thetaHigh] = teachingCase.uncertainty.closedRange;
  const tolerance = result.comparison.tolerance;
  const negativeTolerance = Number(tolerance) === 0 ? tolerance : `-${tolerance}`;
  const domainValues = ['0', tolerance, negativeTolerance, ...publishedCaseResults.flatMap(({ points }) => points[1].comparison.range)];
  const domainLow = Math.min(...domainValues.map(Number));
  const domainHigh = Math.max(...domainValues.map(Number));
  const padding = (domainHigh - domainLow || 1) * 0.06;
  const yLow = domainLow - padding, yHigh = domainHigh + padding;
  const highest = domainValues.reduce((a, b) => Number(a) > Number(b) ? a : b);
  const ticks = [...new Set([negativeTolerance, '0', tolerance, highest])];
  const x = (value: string) => 62 + (Number(value) - Number(thetaLow)) / (Number(thetaHigh) - Number(thetaLow) || 1) * 430;
  const y = (value: string) => 235 - (Number(value) - yLow) / (yHigh - yLow) * 195;
  return <figure className="teaching-case-chart teaching-case-live" tabIndex={0} aria-label="共同参数与配对差值图，可横向滚动">
    <svg viewBox="0 0 550 295" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}>
      <title id={`${id}-chart-title`}>配对差值 Δ = I_B − I_A 与共同 θ</title>
      <desc id={`${id}-chart-desc`}>横轴 θ 从 {thetaLow} 到 {thetaHigh}，单位 {teachingCase.uncertainty.unit}；纵轴为每项规定服务的 kg CO2-eq。阴影为固定 ±{tolerance} 容差带。实线为平整基底，虚线为粗糙基底，圆点为当前场景与 θ。{publishedCaseResults.map(({ scenario, points }) => `${scenarioNames[scenario]}范围 ${range(points[1].comparison.range)}`).join('；')}。</desc>
      <rect x="62" y={y(tolerance)} width="430" height={y(negativeTolerance) - y(tolerance)} fill="currentColor" opacity=".08" />
      {ticks.map(tick => <g key={tick}>
        <line x1="62" x2="492" y1={y(tick)} y2={y(tick)} stroke="currentColor" opacity={tick === '0' ? '.6' : '.2'} strokeDasharray={tick === tolerance || tick === negativeTolerance ? '3 4' : undefined} />
        <text x="52" y={y(tick) + 4} textAnchor="end">{tick}</text>
      </g>)}
      <line x1="62" x2="62" y1="40" y2="235" stroke="currentColor" />
      {[...new Set([thetaLow, teachingCase.uncertainty.displayPoint, thetaHigh])].map(tick => <text key={tick} x={x(tick)} y="255" textAnchor="middle">{tick}</text>)}
      {publishedCaseResults.map(({ scenario, points }) => <line key={scenario} x1={x(thetaLow)} x2={x(thetaHigh)} y1={y(points[0].comparison.difference)} y2={y(points[2].comparison.difference)} stroke="currentColor" strokeWidth="2" strokeDasharray={scenario === 'rough' ? '7 5' : undefined} />)}
      <circle cx={x(result.theta)} cy={y(result.comparison.difference)} r="5" fill="var(--color-fd-background)" stroke="currentColor" strokeWidth="2" />
      <text x="62" y="22">Δ · kg CO2-eq / 规定服务</text>
      <text x="277" y="281" textAnchor="middle">共同 θ · kg CO2/kWh</text>
      <text x="74" y={y(tolerance) + 16}>固定容差带 ±{tolerance}</text>
    </svg>
    <figcaption>实线：平整；虚线：粗糙；圆点：当前值。{scenarioNames[result.scenario]}，θ={result.theta}，Δ={result.comparison.difference}。连线是此固定模型的仿射关系，范围没有概率含义。</figcaption>
  </figure>;
}

function Trace({ result, alternative, teachingCase }: { result: CaseResult; alternative: CaseAlternative; teachingCase: TeachingCaseSpec }) {
  const value = result.alternatives[alternative];
  const energy = teachingCase.technosphere.matrix[3].slice(0, 3).map(coefficient => coefficient.replace(/^-/, ''));
  return <section className="teaching-case-trace">
    <h4>{names[alternative]}：f → s → g → I</h4>
    <p><strong>f</strong> = {vector(value.demand)}；依次为 kg A、kg B、m² 准备、kWh 电力的最终需求。</p>
    <p><strong>A s = f</strong> 得 <strong>s</strong> = {vector(value.activities)}，依次为 P-A、P-B、P-P、P-E 的操作次数，各自操作基准见矩阵列标题。</p>
    <p className="teaching-case-equation">s_E = {energy[0]} × {value.activities[0]} + {energy[1]} × {value.activities[1]} + {energy[2]} × {value.activities[2]} + {value.demand[3]} = {value.activities[3]}。</p>
    <p><strong>g = B(θ) s</strong>：CO2 = {value.inventoryContributions[0].join(' + ')} = <strong>{value.inventory[0]} kg</strong>；化石 CH4 = {value.inventoryContributions[1].join(' + ')} = <strong>{value.inventory[1]} kg</strong>。</p>
    <p><strong>I = cᵀg</strong> = {teachingCase.characterization.factorVector[0]} × {value.inventory[0]} + {teachingCase.characterization.factorVector[1]} × {value.inventory[1]} = {value.characterizedContributions.join(' + ')} = <strong>{value.indicator} kg CO2-eq / 规定服务</strong>。</p>
  </section>;
}

/** Receives only the server's public projection, never an imported source record. */
export function TeachingCaseClient({ spec: teachingCase }: { spec: TeachingCaseSpec }) {
  const { caseId: id, version } = teachingCase;
  assertTeachingCaseIdentity(teachingCase, id, version);
  const instance = useId();
  const [scenario, setScenario] = useState<CaseScenario>('smooth');
  const [theta, setTheta] = useState(teachingCase.uncertainty.displayPoint);
  const result = evaluateCase(teachingCase, scenario, theta);
  const publishedCaseResults = publishedResults(teachingCase);
  const comparison = result.comparison;
  const lowTheta = teachingCase.uncertainty.closedRange[0];
  const lowMass = evaluateCase(teachingCase, 'smooth', lowTheta).sameMass;
  return <section className="teaching-case" aria-labelledby={`${instance}-heading`} data-case-id={id} data-case-version={version}>
    <h3 id={`${instance}-heading`}>把同一项墙面服务接到计算上</h3>
    <p className="teaching-case-meta">墙面涂装算例 · 数据版本 {version} · 数值为教学假定</p>
    <p>规定服务：100 m² 干燥室内墙面，在 [0,10) 年内连续保持指定均匀颜色与至少 0.98 的假定遮盖率。第 10 年这一时点不计入，因此不增加当年的重涂。下列性能、投入、排放量、基底适配、θ 范围和容差均为作者虚构；只有明确注明的表征因子取自外部来源。</p>
    <div className="teaching-case-table" role="region" aria-label="虚构性能与涂装计划" tabIndex={0}>
      <table><caption>服务先固定，再由虚构性能和计划重建用量；用量并不等于服务本身。</caption>
        <thead><tr><th scope="col">替代方案</th><th scope="col">每次用量</th><th scope="col">假定维持时间</th><th scope="col">涂装年份</th><th scope="col">100 m² 总量</th></tr></thead>
        <tbody>{alternatives.map(alt => <tr key={alt}><th scope="row">{names[alt]}</th><td>{teachingCase.service[alt].kgPerM2PerTreatment} kg/m²</td><td>{teachingCase.service[alt].stipulatedLifeYearsPerTreatment} 年/次</td><td>{teachingCase.service[alt].treatmentTimesYears.join('、')}</td><td>100 × {teachingCase.service[alt].kgPerM2PerTreatment} × {teachingCase.service[alt].treatmentTimesYears.length} = {teachingCase.service[alt].requiredKg} kg</td></tr>)}</tbody>
      </table>
    </div>
    <p className="teaching-case-note">假定无损耗、瞬时重涂且无停用、性能与技术十年不变、A 重涂无需先去除旧涂层。施工设备、劳动、处置与回收等被刻意省略；只追踪两种排放和一个气候指标。未覆盖的活动、流和影响类别不能视为零，也不能由此推断实际涂料性能或完整生命周期结论。</p>

    <div className="teaching-case-controls teaching-case-live">
      <label htmlFor={`${instance}-scenario`}>基底初始情景
        <select id={`${instance}-scenario`} value={scenario} onChange={event => setScenario(event.target.value as CaseScenario)}>
          <option value="smooth">平整基底 smooth</option><option value="rough">粗糙基底 rough</option>
        </select>
      </label>
      <label htmlFor={`${instance}-theta`}>共同 θ：{theta} kg CO2/kWh
        <input id={`${instance}-theta`} type="range" min={teachingCase.uncertainty.closedRange[0]} max={teachingCase.uncertainty.closedRange[1]} step="0.01" value={theta} onChange={event => setTheta(event.target.value)} aria-describedby={`${instance}-theta-note`} />
      </label>
      <p id={`${instance}-theta-note`}>θ ∈ {range(teachingCase.uncertainty.closedRange)}；同一个值同时用于 A、B。它是不确定但固定的电力排放强度参数，不是两次独立抽样。容差与表征因子由本版本固定。</p>
    </div>
    <div className="teaching-case-current">
      <h4>当前计算：{scenarioNames[scenario]} · θ={result.theta}</h4>
      <p>{scenario === 'smooth' ? '两种涂料都直接用于已有平整基底，均无准备需求。' : '粗糙基底上假定 A 可直接使用；B 必须先准备全部 100 m²。最终墙面服务相同，B 的准备与电力需求随之增加。'} 情景版本 {result.scenarioVersion}。</p>
      <p className="teaching-case-announcement teaching-case-live" role="status" aria-live="polite" aria-atomic="true">A：{result.alternatives.paintA.indicator}；B：{result.alternatives.paintB.indicator}；配对 Δ：{comparison.difference} kg CO2-eq / 规定服务。</p>
      <PairedChart result={result} id={instance} teachingCase={teachingCase} publishedCaseResults={publishedCaseResults} />
      <div className="teaching-case-table" role="region" aria-label="技术矩阵 A 和排放矩阵 B" tabIndex={0}>
        <table><caption>A：正数为产出，负数为中间投入；每列为一次指定操作，行单位保留。s 为这些操作的次数。</caption>
          <thead><tr><th scope="col">A 的行（单位）</th>{operations.map(name => <th scope="col" key={name}>{name} / 次操作</th>)}</tr></thead>
          <tbody>{teachingCase.technosphere.matrix.map((row, index) => <tr key={index}><th scope="row">{teachingCase.technosphere.rows[index]}</th>{row.map((value, column) => <td key={column}>{value}</td>)}</tr>)}</tbody>
        </table>
        <table><caption>B(θ)：每次指定操作的排放；所有数量及显式零值均为教学假定。</caption>
          <thead><tr><th scope="col">排放到空气（kg）</th>{operations.map(name => <th scope="col" key={name}>{name} / 次操作</th>)}</tr></thead>
          <tbody>{teachingCase.environment.matrix.map((row, index) => <tr key={index}><th scope="row">{index === 0 ? '化石 CO2' : '化石 CH4'}</th>{row.map((value, column) => <td key={column}>{value === 'theta' ? `θ = ${result.theta}` : value}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="teaching-case-note">涂料和基底准备的非电力负担排除 P-E 的负担；电力供应统一在 P-E 中计入。化石 CH4 的氧化 CO2 不再单独加一次。</p>
      <div className="teaching-case-traces">{alternatives.map(alt => <Trace key={alt} result={result} alternative={alt} teachingCase={teachingCase} />)}</div>
      <p><strong>paired Δ = I_B − I_A</strong> = {result.alternatives.paintB.indicator} − {result.alternatives.paintA.indicator} = <strong>{comparison.difference}</strong> kg CO2-eq / 规定服务。Δ &gt; 0 表示 A 的这个指标较低；Δ &lt; 0 表示 B 较低。</p>
      <ul className="teaching-case-predicates">
        <li>严格排序（整个 θ 域）：<strong>{ordering(comparison.strictOrdering)}</strong>。</li>
        <li>全域容差内：<strong>{comparison.robustWithinTolerance ? '成立' : '不成立'}</strong>，检验所有允许 θ 下 |Δ| ≤ {comparison.tolerance}。</li>
        <li>全域容差外：<strong>{comparison.allOutsideTolerance ? '成立' : '不成立'}</strong>，检验所有允许 θ 下 |Δ| &gt; {comparison.tolerance}。仅仅“未能证明全域容差内”不能证明全域容差外。</li>
      </ul>
      <p>共同 θ 下 Δ 的精确范围是 <strong>{range(comparison.range)}</strong>。分别取两方案边际极端相减得到 {range(comparison.independentExtremesRange)}，是丢失共同参数关系后的保守外包络；它可能包含共同 θ 无法同时产生的组合，因此不等于本模型的精确配对范围。{comparison.crossoverInDomain ? `此情景在 θ=${comparison.crossoverTheta} 时 Δ=0；滑块步长不必刚好落在交点。` : '此情景在允许 θ 域内没有 Δ=0 交点。'}</p>
    </div>

    <h4>固定出版基线与全域判断</h4>
    <p>以下两种情景的固定值始终保留，不随上方控件变化；打印和无脚本阅读也可复核。数值单位均为 kg CO2-eq / 同一 100 m²、十年规定服务。</p>
    <div className="teaching-case-table" role="region" aria-label="两个情景的固定基线数值" tabIndex={0}>
      <table><caption>版本 1.0.0 的精确计算值。范围为共同 θ 的闭区间端点极值，非置信区间。</caption>
        <thead><tr><th scope="col">情景</th><th scope="col">共同 θ</th><th scope="col">I_A</th><th scope="col">I_B</th><th scope="col">Δ = I_B − I_A</th></tr></thead>
        <tbody>{publishedCaseResults.flatMap(({ scenario: key, points }) => points.map(point => <tr key={`${key}-${point.theta}`}><th scope="row">{scenarioNames[key]}</th><td>{point.theta}</td><td>{point.alternatives.paintA.indicator}</td><td>{point.alternatives.paintB.indicator}</td><td>{point.comparison.difference}</td></tr>))}</tbody>
      </table>
      <table><caption>范围与三个独立判断：固定容差为作者预设的 ±{comparison.tolerance}，未获经验或利益相关方认可。</caption>
        <thead><tr><th scope="col">情景</th><th scope="col">配对 Δ 范围</th><th scope="col">严格排序</th><th scope="col">全域容差内</th><th scope="col">全域容差外</th></tr></thead>
        <tbody>{publishedCaseResults.map(({ scenario: key, points }) => <tr key={key}><th scope="row">{scenarioNames[key]}</th><td>{range(points[1].comparison.range)}</td><td>{ordering(points[1].comparison.strictOrdering)}</td><td>{points[1].comparison.robustWithinTolerance ? '成立' : '不成立'}</td><td>{points[1].comparison.allOutsideTolerance ? '成立' : '不成立'}</td></tr>)}</tbody>
      </table>
    </div>
    <p>同为 {teachingCase.countercase.massKg} kg 并不提供同一服务：在平整基底、θ={lowTheta} 时，A 只覆盖 {lowMass.alternatives.paintA.serviceArea} m² 的十年服务，指标 {lowMass.alternatives.paintA.indicator}；B 覆盖 {lowMass.alternatives.paintB.serviceArea} m²，指标 {lowMass.alternatives.paintB.indicator}。A 的服务比例为 {lowMass.alternatives.paintA.serviceFraction}，缺口为 {serviceDeficitPercent(lowMass.alternatives.paintA.serviceFraction)}%；其指标看似更低，伴随提供的服务更少。恢复同一服务后的结果见固定表格。</p>
    <p className="teaching-case-note">因子 c = {vector(teachingCase.characterization.factorVector)}，单位依次为 {teachingCase.characterization.factorUnits.join('、')}。采用<a href={`/sources/#${teachingCase.characterization.sourceId}`}>IPCC AR6 WGI 表7.15（2025年10月7日勘误）</a>的中心值；化石 CH4 的所列数值为 {teachingCase.characterization.reportedCH4Uncertainty.split(';')[0]}。本例没有传播该因子的不确定性，也不赋予 θ 概率。GWP100 是相对积分辐射强迫的脉冲指标，不等于观测损害、温度变化或完整产品等效性。引文版本与文字载体限制见章末注释。</p>
    <p className="teaching-case-download"><a href="/downloads/cases/wall-coating-v1.json" download>下载此版本输入 JSON</a> · 固定服务、模型、因子、情景、共同参数与容差，可逐项重建。</p>
  </section>;
}
