import { TestFrequency } from '@risksmart-app/domain/src/types/consts';
import dayjs from 'dayjs';

import { addIntervalToDate, getDueDate } from './scheduleUtils';

describe('scheduleUtils', () => {
  describe('addIntervalToDate', () => {
    it('can add a day to a date', () => {
      const newDate = addIntervalToDate(
        dayjs.utc('2021-01-01T00:00:00.000Z'),
        TestFrequency.Daily
      )
        ?.utc()
        .toISOString();
      expect(newDate).toEqual('2021-01-02T00:00:00.000Z');
    });
  });

  describe('getNextTestDateDue', () => {
    it.each([
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: null,
        latestDate: null,
        expectedDueDate: null,
      },
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: null,
        latestDate: '2021-04-03T13:00:00.000Z',
        expectedDueDate: null,
      },
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: TestFrequency.Adhoc,
        latestDate: null,
        expectedDueDate: null,
      },
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: TestFrequency.Adhoc,
        latestDate: '2021-03-04T18:00:00.000Z',
        expectedDueDate: null,
      },
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: TestFrequency.FourWeekly,
        latestDate: '2021-03-04T18:00:00.000Z',
        expectedDueDate: '2021-03-31T13:00:00.000Z',
      },
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: TestFrequency.Fortnightly,
        latestDate: '2021-03-12T18:00:00.000Z',
        expectedDueDate: '2021-03-17T13:00:00.000Z',
      },
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: TestFrequency.Fortnightly,
        latestDate: '2021-03-12T18:00:00.000Z',
        expectedDueDate: '2021-03-17T13:00:00.000Z',
      },
      {
        startDate: '2021-03-03T13:00:00.000Z',
        frequency: TestFrequency.Fortnightly,
        latestDate: '2021-03-04T18:00:00.000Z',
        expectedDueDate: '2021-03-17T13:00:00.000Z',
      },
      {
        startDate: '2010-01-31T06:00:00.000Z',
        frequency: TestFrequency.Weekly,
        latestDate: '2021-03-03T13:00:00.000Z',
        expectedDueDate: '2021-03-07T06:00:00.000Z',
      },
      {
        startDate: '2010-01-31T06:00:00.000Z',
        frequency: TestFrequency.Monthly,
        latestDate: '2021-03-03T13:00:00.000Z',
        expectedDueDate: '2021-03-31T06:00:00.000Z',
      },
      {
        startDate: '2022-01-01T06:00:00.000Z',
        frequency: TestFrequency.Quarterly,
        latestDate: '2022-08-02T13:00:00.000Z',
        expectedDueDate: '2022-10-01T06:00:00.000Z',
      },
      {
        startDate: '2010-01-01T06:00:00.000Z',
        frequency: TestFrequency.Quarterly,
        latestDate: '2022-01-02T13:00:00.000Z',
        expectedDueDate: '2022-04-01T06:00:00.000Z',
      },
      {
        startDate: '2025-06-30T06:00:00.000Z',
        frequency: TestFrequency.Quarterly,
        latestDate: '2025-07-04T13:00:00.000Z',
        expectedDueDate: '2025-09-30T06:00:00.000Z',
      },
      {
        startDate: '2025-06-30T06:00:00.000Z',
        frequency: TestFrequency.Biannually,
        latestDate: '2025-07-04T13:00:00.000Z',
        expectedDueDate: '2025-12-30T06:00:00.000Z',
      },
      {
        startDate: '2010-07-01T06:00:00.000Z',
        frequency: TestFrequency.Biannually,
        latestDate: '2023-09-03T13:00:00.000Z',
        expectedDueDate: '2024-01-01T06:00:00.000Z',
      },
      {
        startDate: '2010-01-01T06:00:00.000Z',
        frequency: TestFrequency.Biannually,
        latestDate: '2022-01-03T13:00:00.000Z',
        expectedDueDate: '2022-07-01T06:00:00.000Z',
      },
      {
        startDate: '2025-06-30T06:00:00.000Z',
        frequency: TestFrequency.Annually,
        latestDate: '2025-07-04T13:00:00.000Z',
        expectedDueDate: '2026-06-30T06:00:00.000Z',
      },
      {
        startDate: '2010-01-01T06:00:00.000Z',
        frequency: TestFrequency.Annually,
        latestDate: '2021-01-03T13:00:00.000Z',
        expectedDueDate: '2022-01-01T06:00:00.000Z',
      },
      {
        startDate: '2010-01-01T06:00:00.000Z',
        frequency: TestFrequency.Daily,
        latestDate: '2021-01-03T13:00:00.000Z',
        expectedDueDate: '2021-01-04T06:00:00.000Z',
      },
      {
        startDate: '2021-01-01T00:00:00.000Z',
        frequency: TestFrequency.Daily,
        latestDate: '2021-01-03T00:00:00.000Z',
        expectedDueDate: '2021-01-04T00:00:00.000Z',
      },
      {
        startDate: '2021-01-01T00:00:00.000Z',
        frequency: TestFrequency.Daily,
        latestDate: '2020-06-01T00:00:00.000Z',
        expectedDueDate: '2021-01-01T00:00:00.000Z',
      },
      {
        startDate: '2021-01-01T00:00:00.000Z',
        frequency: TestFrequency.Daily,
        latestDate: null,
        expectedDueDate: '2021-01-01T00:00:00.000Z',
      },
    ])(
      'returns $expectedDueDate for $frequency intervals with startDate $startDate and latestDate $latestDate',
      ({ startDate, frequency, latestDate, expectedDueDate }) => {
        const nextTestDateDue = getDueDate({
          startDate,
          frequency,
          latestDate,
        });
        expect(nextTestDateDue).toEqual(expectedDueDate);
      }
    );
  });
});
