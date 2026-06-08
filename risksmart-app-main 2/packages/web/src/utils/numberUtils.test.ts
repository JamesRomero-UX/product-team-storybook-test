import { isNumInRangeIncl, roundToTwoDecimals } from './numberUtils';

describe('numberUtils', () => {
  describe('isNumberInRange', () => {
    it('returns correct result for zero values', () => {
      const result = isNumInRangeIncl(0, [0, 0]);
      expect(result).toBe(true);
    });

    it.each([
      [8, [1, 10]],
      [134.0045, [134.004, 134.005]],
      [567, [567, 580]],
      [100, [1, 100]],
    ])(
      'correctly checks if number %s is inclusive in range %s',
      (checkNum, range) => {
        const result = isNumInRangeIncl(checkNum, range as [number, number]);
        expect(result).toBe(true);
      }
    );

    it.each([
      [8, [9, 10]],
      [134.0045, [134.004, 134.0041]],
      [500, [501, 600]],
      [100, [1, 99]],
      [300, [300, 200]],
    ])(
      'correctly checks if number %s is outside range %s',
      (checkNum, range) => {
        const result = isNumInRangeIncl(checkNum, range as [number, number]);
        expect(result).toBe(false);
      }
    );
  });

  describe('roundToTwoDecimals', () => {
    it('handles floating point precision issues', () => {
      expect(roundToTwoDecimals(0.1 + 0.2)).toBe(0.3);
      expect(roundToTwoDecimals(0.1 + 0.2 + 0.3)).toBe(0.6);
    });

    it('rounds to 2 decimal places correctly', () => {
      expect(roundToTwoDecimals(1.234567)).toBe(1.23);
      expect(roundToTwoDecimals(1.235)).toBe(1.24);
      expect(roundToTwoDecimals(1.234)).toBe(1.23);
    });

    it('handles whole numbers correctly', () => {
      expect(roundToTwoDecimals(5)).toBe(5);
      expect(roundToTwoDecimals(0)).toBe(0);
    });

    it('handles negative numbers correctly', () => {
      expect(roundToTwoDecimals(-1.234567)).toBe(-1.23);
      expect(roundToTwoDecimals(-1.235)).toBe(-1.24);
    });

    it('handles numbers that already have 2 decimal places', () => {
      // prettier-ignore
      expect(roundToTwoDecimals(0.50)).toBe(0.5);
      expect(roundToTwoDecimals(1.25)).toBe(1.25);
    });

    it('handles edge cases with large numbers', () => {
      expect(roundToTwoDecimals(999999.999)).toBe(1000000);
      expect(roundToTwoDecimals(123456.789)).toBe(123456.79);
    });
  });
});
