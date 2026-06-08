import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import dayjs from 'dayjs';

export const compose = <T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) =>
  fns.reduce((prevFn, nextFn) => (value) => prevFn(nextFn(value)), fn1);

export const convertDateRangeValues = (
  value: DateRangePickerProps.Value | null
) => {
  if (!value || !value?.type) {
    return {
      type: null,
      startDate: null,
      endDate: null,
    };
  }

  if (value.type === 'absolute') {
    const startDate = new Date(value.startDate);
    const endDate = new Date(value.endDate);

    return {
      startDate: isNaN(startDate.getTime()) ? null : startDate,
      endDate: isNaN(endDate.getTime()) ? null : endDate,
    };
  }

  const { amount, unit } = value;

  const startDate =
    amount < 0
      ? new Date(dayjs().subtract(-amount, unit).format('YYYY-MM-DD'))
      : new Date(dayjs().format('YYYY-MM-DD'));
  const endDate =
    amount < 0
      ? new Date(dayjs().format('YYYY-MM-DD'))
      : new Date(dayjs().subtract(-amount, unit).format('YYYY-MM-DD'));

  return {
    startDate,
    endDate,
  };
};

export const applyOpenInDateRangeFilter =
  (dateRange: DateRangePickerProps.Value | null) =>
  <T>(filters: T) => {
    if (!dateRange) {
      return {
        ...filters,
      };
    }
    const { startDate, endDate } = convertDateRangeValues(dateRange);
    if (!startDate || !endDate) {
      return {
        ...filters,
      };
    }

    return {
      ...filters,
      _or: [
        {
          ActualCloseDate: {
            _gte: startDate,
          },
        },
        {
          CreatedAtTimestamp: {
            _lte: endDate,
          },
        },
      ],
    };
  };
