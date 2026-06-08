import { renderHook } from '@testing-library/react';
import dayjs from 'dayjs';

import { useXDomain } from './useXDomain';

describe('useXDomain', () => {
  it('should return undefined if not a date chart', () => {
    const { result } = renderHook(() =>
      useXDomain({
        dataType: 'number',
        xAxisData: ['test1', 'test2'],
        datePrecision: null,
      })
    );
    expect(result.current).toBeUndefined();
  });

  it('should return interpolated dates for a date chart', () => {
    const { result } = renderHook(() =>
      useXDomain({
        xAxisData: [
          dayjs('2024-01-01T00:00:00').toDate(),
          dayjs('2024-01-03T00:00:00').toDate(),
        ],
        dataType: 'date',
        datePrecision: 'day',
      })
    );

    expect(result.current).toEqual(['01 Jan', '02 Jan', '03 Jan']);
  });

  it('should return interpolated dates when precision is months for a date chart', () => {
    const { result } = renderHook(() =>
      useXDomain({
        xAxisData: [
          dayjs('2024-01-01T00:00:00').toDate(),
          dayjs('2024-03-03T00:00:00').toDate(),
        ],
        dataType: 'date',
        datePrecision: 'month',
      })
    );

    expect(result.current).toEqual(['Jan 2024', 'Feb 2024', 'Mar 2024']);
  });
});
