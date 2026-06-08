import { renderHook } from '@testing-library/react';
import dayjs from 'dayjs';

import { useXDomain } from './useXDomain';

describe('useXDomain', () => {
  it('should return undefined if not a date chart', () => {
    const { result } = renderHook(() =>
      useXDomain([{ key: 'A', label: 'A', aggregatedValue: 1, data: [] }])
    );
    expect(result.current).toBeUndefined();
  });

  it('should return interpolated dates for a date chart', () => {
    const { result } = renderHook(() =>
      useXDomain(
        [
          {
            key: dayjs('2024-01-01T00:00:00').toDate(),
            label: '1st Jan',
            aggregatedValue: 1,
            data: [],
          },
          {
            key: dayjs('2024-01-03T00:00:00').toDate(),
            label: '3rd Jan',
            aggregatedValue: 1,
            data: [],
          },
        ],
        {
          precision: 'day',
        }
      )
    );

    expect(result.current).toEqual([
      dayjs('2024-01-01T00:00:00').toDate(),
      dayjs('2024-01-02T00:00:00').toDate(),
      dayjs('2024-01-03T00:00:00').toDate(),
    ]);
  });

  it('should return interpolated dates when precision is months for a date chart', () => {
    const { result } = renderHook(() =>
      useXDomain(
        [
          {
            key: dayjs('2024-01-01T00:00:00').toDate(),
            label: '1st Jan',
            aggregatedValue: 1,
            data: [],
          },
          {
            key: dayjs('2024-03-01T00:00:00').toDate(),
            label: '3rd Jan',
            aggregatedValue: 1,
            data: [],
          },
        ],
        {
          precision: 'months',
        }
      )
    );

    expect(result.current).toEqual([
      dayjs('2024-01-01T00:00:00').toDate(),
      dayjs('2024-02-01T00:00:00').toDate(),
      dayjs('2024-03-01T00:00:00').toDate(),
    ]);
  });
});
