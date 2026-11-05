// Reduced rational arithmetic; all public results contain exact strings.
function greatestCommonDivisor(left, right) {
  left = left < 0n ? -left : left;
  while (right) {
    [left, right] = [right, left % right];
  }
  return left;
}

export function rational(numerator, denominator = 1n) {
  if (!denominator) throw new TypeError('zero denominator');
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = greatestCommonDivisor(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
}

export function decimal(value) {
  const [whole, fraction = ''] = value.split('.');
  return rational(BigInt(whole + fraction), 10n ** BigInt(fraction.length));
}

export function add(left, right) {
  return rational(left[0] * right[1] + right[0] * left[1], left[1] * right[1]);
}

export function subtract(left, right) {
  return rational(left[0] * right[1] - right[0] * left[1], left[1] * right[1]);
}

export function multiply(left, right) {
  return rational(left[0] * right[0], left[1] * right[1]);
}

export function divide(left, right) {
  return rational(left[0] * right[1], left[1] * right[0]);
}

export function fixed(value, places) {
  const [numerator, denominator] = value;
  const scale = 10n ** BigInt(places);
  const magnitude = numerator < 0n ? -numerator : numerator;
  let rounded = magnitude * scale / denominator;
  if (magnitude * scale % denominator * 2n >= denominator) {
    rounded++;
  }

  const sign = numerator < 0n && rounded !== 0n ? '-' : '';
  const digits = String(rounded).padStart(places + 1, '0');
  if (!places) return `${sign}${digits}`;
  return `${sign}${digits.slice(0, -places)}.${digits.slice(-places)}`;
}

export function exactResult(value) {
  const [numerator, denominator] = value;
  let remainder = denominator;
  let twos = 0;
  let fives = 0;
  while (remainder % 2n === 0n) {
    remainder /= 2n;
    twos++;
  }
  while (remainder % 5n === 0n) {
    remainder /= 5n;
    fives++;
  }

  let exact;
  if (denominator === 1n) {
    exact = String(numerator);
  } else if (remainder === 1n) {
    exact = fixed(value, Math.max(twos, fives));
  } else {
    exact = `${numerator}/${denominator}`;
  }
  return { exact, numerator: String(numerator), denominator: String(denominator) };
}

export function result(value) {
  return { ...exactResult(value), fixed6: fixed(value, 6) };
}
