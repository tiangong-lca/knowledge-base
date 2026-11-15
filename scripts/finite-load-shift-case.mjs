import { isDeepStrictEqual } from 'node:util';
import { add, decimal, divide, exactResult, multiply, subtract } from './exact-rational.mjs';

const reviewedV1 = {
  caseId: 'CASE-FINITE-LOAD-SHIFT',
  version: '1.0.0',
  model: 'two-period-cost-minimizing-dispatch-v1',
  createdAt: '2026-11-15',
  status: 'hypothetical-teaching-model',
  numericProvenanceDefault: 'Author stipulations. No input, scenario or result is a measurement, a published emission factor or a replay of source software.',
  units: {
    service: 'work unit',
    duration: 'h',
    power: 'MW',
    energy: 'MWh',
    energyPerWorkUnit: 'MWh/work unit',
    variableCost: 'arbitrary cost unit/MWh',
    cost: 'arbitrary cost unit',
    directEmissionsRate: 'kg CO2/MWh',
    netShiftRate: 'kg CO2/MWh moved',
    directEmissions: 'kg CO2',
  },
  service: {
    requiredWorkUnits: '10',
    electricityMWhPerWorkUnit: '1',
    deliveryPoint: 'one shared lossless electricity node',
    deadline: 'end of the receiving window',
    premise: 'Divisible work can be performed in either window with identical performance, electricity per work unit and delivered service. The workload fits either window, and every unit is completed by the common deadline. Baseline work is all in the sending window.',
  },
  dispatch: {
    objective: 'Minimize total variable generation cost given the demand profile in each window.',
    premises: 'Generation is divisible with zero minimum output. Plant capacity, variable cost, direct emissions rate and all other demand remain fixed. The windows have independent dispatch with no storage, intertemporal ramping or start-up constraints. No imports, exports, network constraints or losses are modeled.',
    scope: 'Short-run direct generation CO2 only. No other greenhouse gases, life-cycle inventory, capacity response or real intervention is evaluated.',
  },
  periods: {
    sending: {
      durationHours: '1',
      unshiftableMWh: '0',
      generators: [
        { id: 'sending-1', capacityMW: '5', variableCostPerMWh: '10', directCO2KgPerMWh: '100' },
        { id: 'sending-2', capacityMW: '10', variableCostPerMWh: '20', directCO2KgPerMWh: '700' },
      ],
    },
    receiving: {
      durationHours: '1',
      unshiftableMWh: '5',
      generators: [
        { id: 'receiving-1', capacityMW: '10', variableCostPerMWh: '10', directCO2KgPerMWh: '300' },
        { id: 'receiving-2', capacityMW: '5', variableCostPerMWh: '20', directCO2KgPerMWh: '600' },
      ],
    },
  },
  equalReceivingRatesControl: {
    receivingSecondGeneratorRateKgCO2PerMWh: '300',
    premise: 'Replace only the direct emissions rate of receiving-2 with the rate of receiving-1. The receiving-window dispatch can change while its directional emissions rate remains constant.',
  },
};

function shapeOf(value) {
  if (Array.isArray(value)) return Object.freeze([shapeOf(value[0])]);
  if (value !== null && typeof value === 'object') {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)])));
  }
  return null;
}

export const finiteLoadShiftInputShape = shapeOf(reviewedV1);

export function validateFiniteLoadShiftCase(spec) {
  if (spec === null || typeof spec !== 'object' || Array.isArray(spec)) {
    return ['finite load shift: must be a case object'];
  }
  const errors = Object.entries(reviewedV1).flatMap(([key, expected]) => isDeepStrictEqual(spec[key], expected)
    ? [] : [`finite load shift.${key}: must match the fixed v1 inputs`]);
  if (Reflect.ownKeys(spec).some(key => !Object.hasOwn(reviewedV1, key))) {
    errors.push('finite load shift: unrecognized input field');
  }
  return errors;
}

// The closed model uses only author-stipulated numbers. Article evidence can
// motivate the comparison, but no numeric fact is adopted or waived by input.
export function validateFiniteLoadShiftFacts(spec) {
  return validateFiniteLoadShiftCase(spec);
}

const zero = decimal('0');
const lessThan = (left, right) => subtract(left, right)[0] < 0n;
const sum = values => values.reduce(add, zero);
const exactQuantities = quantities => Object.fromEntries(Object.entries(quantities)
  .map(([key, value]) => [key, exactResult(value)]));

function parsePeriod(period) {
  const durationHours = decimal(period.durationHours);
  return {
    durationHours,
    unshiftableMWh: decimal(period.unshiftableMWh),
    generators: period.generators.map(generator => ({
      id: generator.id,
      capacityMWh: multiply(decimal(generator.capacityMW), durationHours),
      variableCostPerMWh: decimal(generator.variableCostPerMWh),
      directCO2KgPerMWh: decimal(generator.directCO2KgPerMWh),
    })),
  };
}

function parseModel(spec) {
  const errors = validateFiniteLoadShiftCase(spec);
  if (errors.length) throw new TypeError(errors.join('\n'));

  const electricityMWhPerWorkUnit = decimal(spec.service.electricityMWhPerWorkUnit);
  const maximumShiftMWh = multiply(decimal(spec.service.requiredWorkUnits), electricityMWhPerWorkUnit);
  const sending = parsePeriod(spec.periods.sending);
  const receiving = parsePeriod(spec.periods.receiving);
  const sendingBreakpoint = subtract(add(maximumShiftMWh, sending.unshiftableMWh), sending.generators[0].capacityMWh);
  const receivingBreakpoint = subtract(receiving.generators[0].capacityMWh, receiving.unshiftableMWh);
  if (subtract(sendingBreakpoint, receivingBreakpoint)[0] !== 0n) {
    throw new Error('finite load shift: fixed v1 requires simultaneous dispatch changes');
  }
  return { electricityMWhPerWorkUnit, maximumShiftMWh, boundary: sendingBreakpoint, sending, receiving };
}

function dispatch(period, flexibleMWh, electricityMWhPerWorkUnit) {
  const workUnits = divide(flexibleMWh, electricityMWhPerWorkUnit);
  const demandMWh = add(flexibleMWh, period.unshiftableMWh);
  // In the fixed v1 input generator 1 strictly undercuts generator 2. Any
  // expensive generation that can be replaced by cheap spare output raises cost.
  const [cheaper] = period.generators;
  const cheapGeneration = lessThan(demandMWh, cheaper.capacityMWh) ? demandMWh : cheaper.capacityMWh;
  const output = [cheapGeneration, subtract(demandMWh, cheapGeneration)];
  const generators = period.generators.map((generator, index) => {
    const generationMWh = output[index];
    if (lessThan(generationMWh, zero) || lessThan(generator.capacityMWh, generationMWh)) {
      throw new RangeError(`finite load shift: infeasible dispatch for ${generator.id}`);
    }
    return {
      id: generator.id,
      generationMWh,
      averagePowerMW: divide(generationMWh, period.durationHours),
      costUnits: multiply(generationMWh, generator.variableCostPerMWh),
      directCO2Kg: multiply(generationMWh, generator.directCO2KgPerMWh),
    };
  });
  return {
    workUnits,
    demandMWh,
    generationMWh: sum(generators.map(generator => generator.generationMWh)),
    costUnits: sum(generators.map(generator => generator.costUnits)),
    directCO2Kg: sum(generators.map(generator => generator.directCO2Kg)),
    generators,
  };
}

function runDispatch(model, shiftMWh) {
  return {
    sending: dispatch(model.sending, subtract(model.maximumShiftMWh, shiftMWh), model.electricityMWhPerWorkUnit),
    receiving: dispatch(model.receiving, shiftMWh, model.electricityMWhPerWorkUnit),
  };
}

function directionalRates(model, sendingIndex, receivingIndex) {
  // The endpoint rates are per positive MWh withdrawn or added. The net rate
  // signs the withdrawal negatively and counts the moved MWh once.
  const sendingWithdrawalRateKgCO2PerMWh = model.sending.generators[sendingIndex].directCO2KgPerMWh;
  const receivingAdditionRateKgCO2PerMWh = model.receiving.generators[receivingIndex].directCO2KgPerMWh;
  return {
    sendingWithdrawalRateKgCO2PerMWh,
    receivingAdditionRateKgCO2PerMWh,
    netRateKgCO2PerMWhMoved: subtract(receivingAdditionRateKgCO2PerMWh, sendingWithdrawalRateKgCO2PerMWh),
  };
}

function evaluateAmount(model, shiftMWh, baseline, baselineRate) {
  const dispatches = runDispatch(model, shiftMWh);
  const periods = Object.fromEntries(Object.entries(dispatches).map(([name, { generators, ...quantities }]) => {
    return [name, {
      ...exactQuantities(quantities),
      ...exactQuantities({
        demandChangeMWh: subtract(quantities.demandMWh, baseline[name].demandMWh),
        directCO2ChangeKg: subtract(quantities.directCO2Kg, baseline[name].directCO2Kg),
      }),
      generators: generators.map(({ id, ...values }) => ({ id, ...exactQuantities(values) })),
    }];
  }));
  const totals = Object.fromEntries(['workUnits', 'demandMWh', 'generationMWh', 'costUnits', 'directCO2Kg']
    .map(key => [key, add(dispatches.sending[key], dispatches.receiving[key])]));
  const directCO2ChangeKg = subtract(totals.directCO2Kg, add(baseline.sending.directCO2Kg, baseline.receiving.directCO2Kg));
  const baselineRateEstimateKgCO2 = multiply(shiftMWh, baselineRate);
  return {
    ...exactQuantities({
      shiftMWh,
      directCO2ChangeKg,
      baselineRateEstimateKgCO2,
      differenceFromBaselineEstimateKgCO2: subtract(directCO2ChangeKg, baselineRateEstimateKgCO2),
    }),
    withinBaselineBasisRange: !lessThan(model.boundary, shiftMWh),
    periods,
    total: exactQuantities(totals),
  };
}

export function evaluateFiniteLoadShiftAmount(spec, shiftMWh) {
  const model = parseModel(spec);
  if (typeof shiftMWh !== 'string' || shiftMWh.length > 200 || !/^-?\d+(?:\.\d+)?$/.test(shiftMWh)) {
    throw new TypeError('finite load shift: shiftMWh must be a decimal string of at most 200 characters');
  }
  const amount = decimal(shiftMWh);
  if (lessThan(amount, zero) || lessThan(model.maximumShiftMWh, amount)) {
    throw new RangeError('finite load shift: shiftMWh is outside the feasible service interval');
  }
  const baseline = runDispatch(model, zero);
  return evaluateAmount(model, amount, baseline, directionalRates(model, 1, 0).netRateKgCO2PerMWhMoved);
}

function evaluateProfile(model, sampleAmounts) {
  const initialRates = directionalRates(model, 1, 0);
  const laterRates = directionalRates(model, 0, 1);
  const baseline = runDispatch(model, zero);
  return {
    segments: [
      exactQuantities({ fromShiftMWh: zero, toShiftMWh: model.boundary, ...initialRates }),
      exactQuantities({ fromShiftMWh: model.boundary, toShiftMWh: model.maximumShiftMWh, ...laterRates }),
    ],
    samples: Object.fromEntries(Object.entries(sampleAmounts).map(([name, amount]) =>
      [name, evaluateAmount(model, amount, baseline, initialRates.netRateKgCO2PerMWhMoved)])),
  };
}

export function evaluateFiniteLoadShiftCase(spec) {
  const model = parseModel(spec);
  const initialRates = directionalRates(model, 1, 0);
  const laterRate = directionalRates(model, 0, 1).netRateKgCO2PerMWhMoved;
  const changeAtBoundary = multiply(model.boundary, initialRates.netRateKgCO2PerMWhMoved);
  const neutral = subtract(model.boundary, divide(changeAtBoundary, laterRate));
  const sampleAmounts = { baseline: zero, boundary: model.boundary, neutral, maximum: model.maximumShiftMWh };

  const [receivingFirst, receivingSecond] = model.receiving.generators;
  const controlRate = decimal(spec.equalReceivingRatesControl.receivingSecondGeneratorRateKgCO2PerMWh);
  const control = {
    ...model,
    receiving: {
      ...model.receiving,
      generators: [receivingFirst, { ...receivingSecond, directCO2KgPerMWh: controlRate }],
    },
  };
  const { segments, samples: samplesAtPrimaryShiftAmounts } = evaluateProfile(control, {
    baseline: zero, boundary: model.boundary, primaryNeutral: neutral, maximum: model.maximumShiftMWh,
  });
  return {
    units: { ...spec.units },
    interpretation: 'Author-stipulated dispatch. Deltas are paired dispatch minus baseline. Segment rates describe increments inside each segment. The baseline estimate extends the initial net rate over the full shift.',
    domain: exactQuantities({ minimumShiftMWh: zero, maximumShiftMWh: model.maximumShiftMWh }),
    baselineShiftDirection: exactQuantities({ certifiedThroughShiftMWh: model.boundary, ...initialRates }),
    ...evaluateProfile(model, sampleAmounts),
    equalReceivingRatesControl: {
      receivingSecondGeneratorRateKgCO2PerMWh: exactResult(controlRate),
      interpretation: 'Only the receiving window keeps the same rate across its dispatch change. The sending rate and the paired net rate still change. Control samples use the same shift amounts as the main case.',
      segments,
      samplesAtPrimaryShiftAmounts,
    },
  };
}
