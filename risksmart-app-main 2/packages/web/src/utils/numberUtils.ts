export const isNumInRangeIncl = (num: number, [min, max]: [number, number]) => {
  return num >= min && num <= max;
};

/**
 * Rounds a number to 2 decimal places to handle floating point precision issues.
 * This is commonly needed for financial calculations where JavaScript's floating
 * point arithmetic can cause precision errors (e.g., 0.1 + 0.2 = 0.30000000000000004).
 *
 * @param value - The number to round
 * @returns The number rounded to 2 decimal places
 *
 * @example
 * roundToTwoDecimals(0.1 + 0.2) // returns 0.3
 * roundToTwoDecimals(1.234567) // returns 1.23
 */
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};
