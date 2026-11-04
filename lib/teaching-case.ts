import type specification from '../knowledge/cases/wall-coating-v1.json';
import { evaluateTeachingCase } from '../scripts/teaching-case.mjs';

// This reference is erased by TypeScript. No raw case data enters client imports.
export type TeachingCaseSpec = typeof specification;

export type CaseScenario = 'smooth' | 'rough';
export type CaseAlternative = 'paintA' | 'paintB';
export interface CaseCalculation {
  demand: string[];
  activities: string[];
  balance: string[];
  inventory: string[];
  inventoryContributions: string[][];
  characterizedContributions: string[];
  processIndicatorContributions: string[];
  indicator: string;
}
export interface CaseResult {
  scenario: CaseScenario;
  scenarioVersion: string;
  theta: string;
  alternatives: Record<CaseAlternative, CaseCalculation>;
  comparison: {
    difference: string;
    range: string[];
    affine: { intercept: string; slope: string };
    marginalRanges: Record<CaseAlternative, string[]>;
    independentExtremesRange: string[];
    strictOrdering: 'A-lower' | 'B-lower' | 'unresolved';
    tolerance: string;
    robustWithinTolerance: boolean;
    allOutsideTolerance: boolean;
    crossoverTheta: string | null;
    crossoverInDomain: boolean;
  };
  sameMass: {
    massKg: string;
    alternatives: Record<CaseAlternative, CaseCalculation & { serviceArea: string; serviceFraction: string; fulfillsSpecifiedService: boolean }>;
  };
}

/** Version binding is explicit: a newer JSON must never silently change this passage. */
export function assertTeachingCaseIdentity(spec: TeachingCaseSpec, id: string, version: string): void {
  if (id !== 'CASE-WALL-CONNECT' || version !== '1.0.0' || spec.caseId !== id || spec.version !== version) {
    throw new TypeError(`Unsupported teaching case ${id}@${version}`);
  }
}

export function evaluateCase(spec: TeachingCaseSpec, scenario: CaseScenario, theta: string): CaseResult {
  assertTeachingCaseIdentity(spec, 'CASE-WALL-CONNECT', '1.0.0');
  // The JS engine validates both fixed alternative identities before calculation;
  // Object.fromEntries cannot preserve that key union in its inferred JS type.
  return evaluateTeachingCase(spec, { scenario, theta }) as unknown as CaseResult;
}

export function publishedResults(spec: TeachingCaseSpec) {
  return (['smooth', 'rough'] as const).map(scenario => ({
    scenario,
    points: [spec.uncertainty.closedRange[0], spec.uncertainty.displayPoint, spec.uncertainty.closedRange[1]].map(theta => evaluateCase(spec, scenario, theta)),
  }));
}

/** Display-only arithmetic: keep a service deficit exact, including rational output. */
export function serviceDeficitPercent(fraction: string): string {
  const [whole, denominator] = fraction.includes('/') ? fraction.split('/') : (() => {
    const [integer, decimal = ''] = fraction.split('.');
    return [integer + decimal, `1${'0'.repeat(decimal.length)}`];
  })();
  let numerator = (BigInt(denominator) - BigInt(whole)) * 100n;
  let divisor = BigInt(denominator);
  let a = numerator < 0n ? -numerator : numerator, b = divisor;
  while (b) [a, b] = [b, a % b];
  numerator /= a; divisor /= a;
  return divisor === 1n ? String(numerator) : `(${numerator}/${divisor})`;
}
