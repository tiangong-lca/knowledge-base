'use client';

import { useMemo, useState } from 'react';
import {
  evaluateCase,
  type CaseScenario,
  type TeachingCaseSpec,
} from '@/lib/teaching-case';

const THETA_PRESETS = ['0.1', '0.1438', '0.3', '0.5'];

export function EnWallCaseClient({
  spec,
  print = false,
}: {
  spec: TeachingCaseSpec;
  print?: boolean;
}) {
  const [scenario, setScenario] = useState<CaseScenario>('smooth');
  const [theta, setTheta] = useState<string>(spec.uncertainty.displayPoint);

  const result = useMemo(() => evaluateCase(spec, scenario, theta), [spec, scenario, theta]);
  const a = result.alternatives.paintA;
  const b = result.alternatives.paintB;
  const cmp = result.comparison;

  const orderingLabel =
    cmp.strictOrdering === 'A-lower'
      ? 'Paint A is strictly lower across the full shared-θ domain'
      : cmp.strictOrdering === 'B-lower'
        ? 'Paint B is strictly lower across the full shared-θ domain'
        : 'No strict global ordering across the shared-θ domain (crossover inside [0.1, 0.5])';

  const toleranceLabel = cmp.robustWithinTolerance
    ? `Within ±${cmp.tolerance} kg CO2-eq/service across all allowed θ`
    : cmp.allOutsideTolerance
      ? `Entirely outside ±${cmp.tolerance} kg CO2-eq/service across all allowed θ`
      : `Partially exceeds ±${cmp.tolerance} kg CO2-eq/service`;

  return (
    <section
      id="wall-case-reference"
      className="teaching-case not-prose"
      aria-labelledby="en-wall-case-heading"
    >
      <h3 id="en-wall-case-heading">Calculation Tables &amp; Interactive Parameters</h3>
      <p>
        All numbers below are computed directly from the shared exact-arithmetic model (
        <code>As = f</code>, <code>g = B(θ)s</code>, <code>I = cᵀg</code>) for a 100 m²
        interior wall over [0, 10) years using IPCC AR6 WGI Table 7.15 (2025-10-07 errata
        replacement) GWP-100 central factors: CO₂ = 1, fossil CH₄ = 28.1 kg CO₂-eq/kg.
      </p>

      {!print && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            margin: '1rem 0',
            padding: '0.85rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-fd-border)',
          }}
        >
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <legend style={{ fontWeight: 600, marginRight: '0.5rem', fontSize: '0.9rem' }}>Substrate:</legend>
            <button
              type="button"
              onClick={() => setScenario('smooth')}
              aria-pressed={scenario === 'smooth'}
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--color-fd-border)',
                fontWeight: scenario === 'smooth' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Smooth substrate
            </button>
            <button
              type="button"
              onClick={() => setScenario('rough')}
              aria-pressed={scenario === 'rough'}
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--color-fd-border)',
                fontWeight: scenario === 'rough' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Rough substrate (+100 m² prep for B)
            </button>
          </fieldset>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Electricity θ (kg CO₂/kWh):</span>
            {THETA_PRESETS.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setTheta(val)}
                aria-pressed={theta === val}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-fd-border)',
                  fontWeight: theta === val ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Quantity (per 100 m², 10-year service)</th>
            <th>Paint A</th>
            <th>Paint B</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Final demand vector f (kg A, kg B, m² prep, kWh)</td>
            <td>({a.demand.join(', ')})ᵀ</td>
            <td>({b.demand.join(', ')})ᵀ</td>
          </tr>
          <tr>
            <td>Activity scaling vector s (P-A, P-B, P-P, P-E)</td>
            <td>({a.activities.join(', ')})ᵀ</td>
            <td>({b.activities.join(', ')})ᵀ</td>
          </tr>
          <tr>
            <td>Fossil CO₂ inventory (kg)</td>
            <td>{a.inventory[0]}</td>
            <td>{b.inventory[0]}</td>
          </tr>
          <tr>
            <td>Fossil CH₄ inventory (kg)</td>
            <td>{a.inventory[1]}</td>
            <td>{b.inventory[1]}</td>
          </tr>
          <tr>
            <td>GWP-100 climate indicator I (kg CO₂-eq) at θ = {result.theta}</td>
            <td><strong>{a.indicator}</strong></td>
            <td><strong>{b.indicator}</strong></td>
          </tr>
          <tr>
            <td>Marginal indicator range over θ ∈ [0.1, 0.5]</td>
            <td>[{cmp.marginalRanges.paintA.join(', ')}]</td>
            <td>[{cmp.marginalRanges.paintB.join(', ')}]</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.65 }}>
        <p>
          <strong>Paired difference Δ(θ) = I_B(θ) − I_A(θ):</strong>{' '}
          <code>{cmp.affine.intercept} + {cmp.affine.slope}θ</code> kg CO₂-eq/service.
          At θ = {result.theta}: <strong>{cmp.difference} kg CO₂-eq</strong>.
        </p>
        <p>
          <strong>Paired range across θ ∈ [0.1, 0.5]:</strong> [{cmp.range.join(', ')}] kg CO₂-eq
          {' · '}
          <strong>Unpaired independent-extremes envelope:</strong> [{cmp.independentExtremesRange.join(', ')}] kg CO₂-eq.
        </p>
        <p>
          <strong>Ordering check:</strong> {orderingLabel}
          {cmp.crossoverTheta && cmp.crossoverInDomain ? ` (crossover at θ = ${cmp.crossoverTheta})` : ''}.
          {' '}<strong>Tolerance check:</strong> {toleranceLabel}.
        </p>
      </div>
    </section>
  );
}
