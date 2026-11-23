'use client';

import { useEffect, useId, useState } from 'react';
import {
  assertTeachingCaseIdentity,
  evaluateCase,
  publishedResults,
  type CaseAlternative,
  type CaseResult,
  type CaseScenario,
  type TeachingCaseSpec,
} from '../lib/teaching-case';

const EN_NAMES = { paintA: 'Paint A', paintB: 'Paint B' };
const EN_SCENARIOS = {
  smooth: 'Smooth substrate',
  rough: 'Rough substrate (+100 m² prep for B)',
};
const EN_OPERATIONS = ['P-A · 1 kg A', 'P-B · 1 kg B', 'P-P · 1 m² prep', 'P-E · 1 kWh elec.'];
const EN_TECH_ROWS = ['Paint A (kg)', 'Paint B (kg)', 'Surface prep (m²)', 'Electricity (kWh)'];
const ALTERNATIVES = ['paintA', 'paintB'] as const;
const range = (values: string[]) => `[${values.join(', ')}]`;
const vector = (values: string[]) => `(${values.join(', ')})ᵀ`;

function orderingLabel(value: CaseResult['comparison']['strictOrdering']): string {
  if (value === 'A-lower') return 'Paint A strictly lower across the entire θ domain';
  if (value === 'B-lower') return 'Paint B strictly lower across the entire θ domain';
  return 'No domain-wide strict ordering established';
}

function EnPairedChart({
  result,
  id,
  teachingCase,
  publishedCaseResults,
  interactive,
}: {
  interactive: boolean;
  result: CaseResult;
  id: string;
  teachingCase: TeachingCaseSpec;
  publishedCaseResults: ReturnType<typeof publishedResults>;
}) {
  const [thetaLow, thetaHigh] = teachingCase.uncertainty.closedRange;
  const tolerance = result.comparison.tolerance;
  const negativeTolerance = Number(tolerance) === 0 ? tolerance : `-${tolerance}`;
  const domainValues = ['0', tolerance, negativeTolerance, ...publishedCaseResults.flatMap(({ points }) => points[1].comparison.range)];
  const domainLow = Math.min(...domainValues.map(Number));
  const domainHigh = Math.max(...domainValues.map(Number));
  const padding = (domainHigh - domainLow || 1) * 0.06;
  const yLow = domainLow - padding;
  const yHigh = domainHigh + padding;
  const highest = domainValues.reduce((a, b) => (Number(a) > Number(b) ? a : b));
  const ticks = [...new Set([negativeTolerance, '0', tolerance, highest])];
  const x = (value: string) => 62 + ((Number(value) - Number(thetaLow)) / (Number(thetaHigh) - Number(thetaLow) || 1)) * 430;
  const y = (value: string) => 235 - ((Number(value) - yLow) / (yHigh - yLow)) * 195;

  return (
    <figure hidden={!interactive} className="teaching-case-chart teaching-case-live" tabIndex={0} aria-label="Shared parameter θ and paired difference chart">
      <svg viewBox="0 0 550 295" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}>
        <title id={`${id}-chart-title`}>Paired difference Δ = I_B − I_A versus shared θ</title>
        <desc id={`${id}-chart-desc`}>
          Horizontal axis θ from {thetaLow} to {thetaHigh} {teachingCase.uncertainty.unit}; vertical axis kg CO₂-eq per prescribed service.
          Shaded band is the fixed ±{tolerance} tolerance band. Solid line: smooth substrate; dashed line: rough substrate; circle: current scenario and θ.
        </desc>
        <rect x="62" y={y(tolerance)} width="430" height={y(negativeTolerance) - y(tolerance)} fill="currentColor" opacity=".08" />
        {ticks.map(tick => (
          <g key={tick}>
            <line
              x1="62"
              x2="492"
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              opacity={tick === '0' ? '.6' : '.2'}
              strokeDasharray={tick === tolerance || tick === negativeTolerance ? '3 4' : undefined}
            />
            <text x="52" y={y(tick) + 4} textAnchor="end">{tick}</text>
          </g>
        ))}
        <line x1="62" x2="62" y1="40" y2="235" stroke="currentColor" />
        {[...new Set([thetaLow, teachingCase.uncertainty.displayPoint, thetaHigh])].map(tick => (
          <text key={tick} x={x(tick)} y="255" textAnchor="middle">{tick}</text>
        ))}
        {publishedCaseResults.map(({ scenario, points }) => (
          <line
            key={scenario}
            x1={x(thetaLow)}
            x2={x(thetaHigh)}
            y1={y(points[0].comparison.difference)}
            y2={y(points[2].comparison.difference)}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={scenario === 'rough' ? '7 5' : undefined}
          />
        ))}
        <circle cx={x(result.theta)} cy={y(result.comparison.difference)} r="5" fill="var(--color-fd-background)" stroke="currentColor" strokeWidth="2" />
        <text x="62" y="22">Δ · kg CO₂-eq / prescribed service</text>
        <text x="277" y="281" textAnchor="middle">Shared θ · kg CO₂/kWh</text>
        <text x="74" y={y(tolerance) + 16}>Fixed tolerance band ±{tolerance}</text>
      </svg>
      <figcaption>
        Solid: smooth; dashed: rough; circle: current point ({EN_SCENARIOS[result.scenario]}, θ = {result.theta}, Δ = {result.comparison.difference}).
        Lines express the affine relation of this fixed model; the interval carries no probability distribution.
      </figcaption>
    </figure>
  );
}

function EnTrace({
  result,
  alternative,
  teachingCase,
}: {
  result: CaseResult;
  alternative: CaseAlternative;
  teachingCase: TeachingCaseSpec;
}) {
  const value = result.alternatives[alternative];
  const energy = teachingCase.technosphere.matrix[3].slice(0, 3).map(c => c.replace(/^-/, ''));
  return (
    <section className="teaching-case-trace">
      <h4>{EN_NAMES[alternative]}: f → s → g → I</h4>
      <div className="teaching-case-table" role="region" aria-label={`${EN_NAMES[alternative]} full calculation trace`} tabIndex={0}>
        <table>
          <caption>
            {EN_NAMES[alternative]} · {EN_SCENARIOS[result.scenario]} · θ = {result.theta}; all quantities refer to the same 100 m², 10-year service.
          </caption>
          <thead>
            <tr>
              <th scope="col">Quantity &amp; coordinates</th>
              <th scope="col">Exact value &amp; arithmetic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Final demand f<br />(kg A, kg B, m² prep, kWh)</th>
              <td>{vector(value.demand)}</td>
            </tr>
            <tr>
              <th scope="row">Activity vector s (A s = f)<br />(P-A, P-B, P-P, P-E runs)</th>
              <td>{vector(value.activities)}</td>
            </tr>
            <tr>
              <th scope="row">Electricity runs s<sub>E</sub><br />(1 kWh per run)</th>
              <td>{energy[0]} × {value.activities[0]} + {energy[1]} × {value.activities[1]} + {energy[2]} × {value.activities[2]} + {value.demand[3]} = {value.activities[3]}</td>
            </tr>
            <tr>
              <th scope="row">g = B(θ) s: Fossil CO₂<br />(to air, kg)</th>
              <td>{value.inventoryContributions[0].join(' + ')} = <strong>{value.inventory[0]} kg</strong></td>
            </tr>
            <tr>
              <th scope="row">g = B(θ) s: Fossil CH₄<br />(to air, kg)</th>
              <td>{value.inventoryContributions[1].join(' + ')} = <strong>{value.inventory[1]} kg</strong></td>
            </tr>
            <tr>
              <th scope="row">I = cᵀg<br />(kg CO₂-eq / service)</th>
              <td>{teachingCase.characterization.factorVector[0]} × {value.inventory[0]} + {teachingCase.characterization.factorVector[1]} × {value.inventory[1]} = {value.characterizedContributions.join(' + ')} = <strong>{value.indicator} kg CO₂-eq / service</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EnWallCaseClient({ spec: teachingCase, print = false }: { spec: TeachingCaseSpec; print?: boolean }) {
  const { caseId: id, version } = teachingCase;
  assertTeachingCaseIdentity(teachingCase, id, version);
  const instance = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const interactive = mounted && !print;
  const [scenario, setScenario] = useState<CaseScenario>('smooth');
  const [theta, setTheta] = useState(teachingCase.uncertainty.displayPoint);
  const result = evaluateCase(teachingCase, scenario, theta);
  const publishedCaseResults = publishedResults(teachingCase);
  const comparison = result.comparison;

  return (
    <section
      className="teaching-case"
      id="wall-case-reference"
      aria-labelledby="wall-case-reference-title"
      data-case-id={id}
      data-case-version={version}
    >
      <h3 id="wall-case-reference-title">Calculation Tables &amp; Interactive Parameters</h3>
      <p className="teaching-case-meta">
        Wall Coating Teaching Case · Data version {version} · Illustrative stipulated numbers
      </p>
      <p>
        Prescribed service: 100 m² of dry interior wall surface continuously maintaining the specified uniform color
        and an assumed hiding ratio of at least 0.98 over [0, 10) years, excluding recoating at year 10. Performance,
        material inputs, emissions, substrate preparation, the θ interval, and the tolerance band are stipulated for
        instruction; characterization factors come from cited primary literature.
      </p>

      <div className="teaching-case-table" role="region" aria-label="Stipulated performance and recoating schedule" tabIndex={0}>
        <table>
          <caption>The service is fixed first; required paint mass is then derived from stipulated performance and schedule.</caption>
          <thead>
            <tr>
              <th scope="col">Alternative</th>
              <th scope="col">Coverage per coat</th>
              <th scope="col">Stipulated life</th>
              <th scope="col">Application years</th>
              <th scope="col">Total for 100 m²</th>
            </tr>
          </thead>
          <tbody>
            {ALTERNATIVES.map(alt => (
              <tr key={alt}>
                <th scope="row">{EN_NAMES[alt]}</th>
                <td>{teachingCase.service[alt].kgPerM2PerTreatment} kg/m²</td>
                <td>{teachingCase.service[alt].stipulatedLifeYearsPerTreatment} yr/coat</td>
                <td>{teachingCase.service[alt].treatmentTimesYears.join(', ')}</td>
                <td>100 × {teachingCase.service[alt].kgPerM2PerTreatment} × {teachingCase.service[alt].treatmentTimesYears.length} = {teachingCase.service[alt].requiredKg} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        Shared parameter θ ∈ {range(teachingCase.uncertainty.closedRange)} {teachingCase.uncertainty.unit}: the exact same
        value enters both Paint A and Paint B simultaneously (paired parameter, not independent sampling).
      </p>

      <div hidden={!interactive} className="teaching-case-controls teaching-case-live">
        <label htmlFor={`${instance}-scenario`}>
          Initial substrate scenario
          <select id={`${instance}-scenario`} value={scenario} onChange={e => setScenario(e.target.value as CaseScenario)}>
            <option value="smooth">{EN_SCENARIOS.smooth}</option>
            <option value="rough">{EN_SCENARIOS.rough}</option>
          </select>
        </label>
        <label htmlFor={`${instance}-theta`}>
          Shared θ: {theta} kg CO₂/kWh
          <input
            id={`${instance}-theta`}
            type="range"
            min={teachingCase.uncertainty.closedRange[0]}
            max={teachingCase.uncertainty.closedRange[1]}
            step="0.01"
            value={theta}
            onChange={e => setTheta(e.target.value)}
            aria-describedby={`${instance}-theta-note`}
          />
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Presets:</span>
          {['0.1', '0.1438', '0.3', '0.5'].map(val => {
            const active = theta === val;
            return (
              <button
                key={val}
                type="button"
                aria-pressed={active}
                onClick={() => setTheta(val)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '0.35rem',
                  border: active ? '1.5px solid var(--color-fd-primary)' : '1px solid var(--color-fd-border)',
                  background: active ? 'var(--color-fd-primary)' : 'transparent',
                  color: active ? 'var(--color-fd-primary-foreground)' : 'inherit',
                  fontSize: '0.82rem',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                θ = {val}
              </button>
            );
          })}
        </div>
        <p id={`${instance}-theta-note`}>
          Slider step is 0.01; exact crossover points follow the closed-form arithmetic. Controls update the worked example below while fixed baseline tables remain below for reference.
        </p>
      </div>

      <div className="teaching-case-current">
        <h4>Worked Example: {EN_SCENARIOS[scenario]} · θ = {result.theta}</h4>
        <p hidden={!interactive} className="teaching-case-announcement teaching-case-live" role="status" aria-live="polite" aria-atomic="true">
          Paint A: {result.alternatives.paintA.indicator}; Paint B: {result.alternatives.paintB.indicator}; Paired Δ: {comparison.difference} kg CO₂-eq / service.
        </p>

        <EnPairedChart
          interactive={interactive}
          result={result}
          id={instance}
          teachingCase={teachingCase}
          publishedCaseResults={publishedCaseResults}
        />

        <div className="teaching-case-table" role="region" aria-label="Technology matrix A and intervention matrix B" tabIndex={0}>
          <table>
            <caption>Technology matrix A: positive values are outputs, negative values are intermediate inputs; each column is one unit operation.</caption>
            <thead>
              <tr>
                <th scope="col">Row of A (unit)</th>
                {EN_OPERATIONS.map(op => <th scope="col" key={op}>{op}</th>)}
              </tr>
            </thead>
            <tbody>
              {teachingCase.technosphere.matrix.map((row, idx) => (
                <tr key={idx}>
                  <th scope="row">{EN_TECH_ROWS[idx] ?? teachingCase.technosphere.rows[idx]}</th>
                  {row.map((val, col) => <td key={col}>{val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>

          <table>
            <caption>Intervention matrix B(θ): emissions to air per unit operation; all values and explicit zeros are stipulated for instruction.</caption>
            <thead>
              <tr>
                <th scope="col">Emission to air (kg)</th>
                {EN_OPERATIONS.map(op => <th scope="col" key={op}>{op}</th>)}
              </tr>
            </thead>
            <tbody>
              {teachingCase.environment.matrix.map((row, idx) => (
                <tr key={idx}>
                  <th scope="row">{idx === 0 ? 'Fossil CO₂' : 'Fossil CH₄'}</th>
                  {row.map((val, col) => <td key={col}>{val === 'theta' ? `θ = ${result.theta}` : val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="teaching-case-traces">
          {ALTERNATIVES.map(alt => (
            <EnTrace key={alt} result={result} alternative={alt} teachingCase={teachingCase} />
          ))}
        </div>

        <p>
          <strong>Paired Δ = I<sub>B</sub>(θ) − I<sub>A</sub>(θ)</strong> = {result.alternatives.paintB.indicator} − {result.alternatives.paintA.indicator} ={' '}
          <strong>{comparison.difference} kg CO₂-eq / service</strong>. Positive values mean Paint A is lower; negative values mean Paint B is lower.
        </p>
        <ul className="teaching-case-predicates">
          <li>Strict ordering (across all θ): <strong>{orderingLabel(comparison.strictOrdering)}</strong>.</li>
          <li>Robust within tolerance (|Δ| ≤ {comparison.tolerance} for all θ): <strong>{comparison.robustWithinTolerance ? 'Holds' : 'Does not hold'}</strong>.</li>
          <li>Wholly outside tolerance (|Δ| &gt; {comparison.tolerance} for all θ): <strong>{comparison.allOutsideTolerance ? 'Holds' : 'Does not hold'}</strong>.</li>
        </ul>
        <p>
          Exact paired interval under shared θ: <strong>{range(comparison.range)}</strong>; independent marginal extremes envelope:{' '}
          {range(comparison.independentExtremesRange)} (which discards the shared-parameter coupling).{' '}
          {comparison.crossoverInDomain ? `Crossover Δ = 0 occurs at θ = ${comparison.crossoverTheta}.` : 'No crossover (Δ = 0) occurs within the allowed θ domain.'}
        </p>
      </div>

      <h4>Fixed Baseline Results &amp; Domain-Wide Judgments</h4>
      <div className="teaching-case-table" role="region" aria-label="Fixed baseline results for both scenarios" tabIndex={0}>
        <table>
          <caption>Exact values for version {version}. Intervals are closed endpoints over shared θ, not confidence intervals.</caption>
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col">Shared θ</th>
              <th scope="col">I<sub>A</sub></th>
              <th scope="col">I<sub>B</sub></th>
              <th scope="col">Δ = I<sub>B</sub> − I<sub>A</sub></th>
            </tr>
          </thead>
          <tbody>
            {publishedCaseResults.flatMap(({ scenario: key, points }) =>
              points.map(point => (
                <tr key={`${key}-${point.theta}`}>
                  <th scope="row">{EN_SCENARIOS[key]}</th>
                  <td>{point.theta}</td>
                  <td>{point.alternatives.paintA.indicator}</td>
                  <td>{point.alternatives.paintB.indicator}</td>
                  <td>{point.comparison.difference}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
        <table>
          <caption>Domain-wide intervals and three independent predicates (stipulated tolerance ±{comparison.tolerance}).</caption>
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col">Paired Δ range</th>
              <th scope="col">Strict ordering</th>
              <th scope="col">Within tolerance</th>
              <th scope="col">Outside tolerance</th>
            </tr>
          </thead>
          <tbody>
            {publishedCaseResults.map(({ scenario: key, points }) => (
              <tr key={key}>
                <th scope="row">{EN_SCENARIOS[key]}</th>
                <td>{range(points[1].comparison.range)}</td>
                <td>{orderingLabel(points[1].comparison.strictOrdering)}</td>
                <td>{points[1].comparison.robustWithinTolerance ? 'Holds' : 'No'}</td>
                <td>{points[1].comparison.allOutsideTolerance ? 'Holds' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="teaching-case-download">
        <a href="/downloads/cases/wall-coating-v1.json" download>Download version {version} input JSON</a> · Fixed service, matrices, characterization factors, scenarios, shared θ domain, and tolerance for full arithmetic reconstruction.
      </p>
    </section>
  );
}
