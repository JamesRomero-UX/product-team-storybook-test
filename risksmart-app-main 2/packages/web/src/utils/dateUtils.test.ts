import { vi } from 'vitest';

import { EMPTY_VALUE } from './collectionUtils';
import {
  getCurrentDayDate,
  isDateBetween,
  isPastDate,
  toLocalDate,
} from './dateUtils';

describe('dateUtils', () => {
  describe('toLocalDateTime', () => {
    it('should display the month in 3 char format', () => {
      const result = toLocalDate('2023-08-25T12:40:52.824831+00:00');
      expect(result).toEqual('25 Aug 2023');
    });

    it('should return "" if supplied with -', () => {
      const result = toLocalDate('-');
      expect(result).toEqual(EMPTY_VALUE);
    });

    it('should return "" if supplied with null', () => {
      const result = toLocalDate(null);
      expect(result).toEqual(EMPTY_VALUE);
    });

    it('should return "" if supplied with undefined', () => {
      const result = toLocalDate(undefined);
      expect(result).toEqual(EMPTY_VALUE);
    });
  });

  describe('isDateBetween', () => {
    it('returns true for a valid date thats within range', () => {
      const testDate = new Date('2023/04/02');
      const testRange: [Date, Date] = [
        new Date('2023/03/26'),
        new Date('2023/04/07'),
      ];
      const result = isDateBetween(testDate.toDateString(), testRange);
      expect(result).toBe(true);
    });

    it.each([
      [
        new Date('04/02/2023'),
        [new Date('04/03/2023'), new Date('10/02/2023')],
        false,
      ],
      [
        new Date('04/02/2023'),
        [new Date('01/03/2023'), new Date('10/09/2023')],
        true,
      ],
      [
        new Date('2023/02/16'),
        [new Date('2023/01/01'), new Date('2023/03/28')],
        true,
      ],
      [
        new Date('2023/02/16'),
        [new Date('2024/01/01'), new Date('2022/03/28')],
        false,
      ],
      [
        new Date('2023/02/16'),
        [new Date('2022/01/01'), new Date('2024/03/28')],
        true,
      ],
      [
        new Date('2023/02/16'),
        [new Date('2023/02/16'), new Date('2023/03/28')],
        false,
      ],
    ])(
      'return expected result for date %s and range %s',
      (date, range, expectedResult) => {
        const result = isDateBetween(
          date.toDateString(),
          range as [Date, Date]
        );
        expect(result).toBe(expectedResult);
      }
    );
  });

  describe('isPastDate', () => {
    beforeEach(() => {
      // mock time date.
      vi.useFakeTimers();
    });

    afterEach(() => {
      //restore timers
      vi.useRealTimers();
    });

    it.each([
      [new Date('2023/02/09'), new Date('2023/04/16'), true],
      [new Date('2021/03/13'), new Date('2023/01/01'), true],
      [new Date('2023/02/02'), new Date('2023/02/02'), false],
      [new Date('2023/07/24'), new Date('2023/07/23'), false],
    ])(
      'check the date string %s is a past date %s',
      (testDate: Date, currentTime: Date, expectResult: boolean) => {
        vi.setSystemTime(currentTime);
        const result = isPastDate(testDate.toISOString());
        expect(result).toBe(expectResult);
      }
    );
  });

  describe('getCurrentDayDate', () => {
    const mockDate = new Date('2023/04/04');
    beforeEach(() => {
      // mock time date.
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      //restore timers
      vi.useRealTimers();
    });

    it('returns the current date', () => {
      expect(getCurrentDayDate().getTime()).toBe(mockDate.getTime());
    });

    it.each([[4], [12], [-34], [2345]])(
      'returns the current date with extra %s days',
      (days: number) => {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() + days);
        expect(getCurrentDayDate(days).getTime()).toBe(expectedDate.getTime());
      }
    );
  });
});
