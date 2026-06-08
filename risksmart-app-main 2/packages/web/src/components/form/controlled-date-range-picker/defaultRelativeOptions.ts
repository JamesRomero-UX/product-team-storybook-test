import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';

export const defaultRelativeOptions: DateRangePickerProps.RelativeOption[] = [
  {
    key: '1-week-previous',
    amount: -1,
    unit: 'week',
    type: 'relative',
  },
  {
    key: '1-week-next',
    amount: 1,
    unit: 'week',
    type: 'relative',
  },
  {
    key: '1-month-previous',
    amount: -1,
    unit: 'month',
    type: 'relative',
  },
  {
    key: '1-month-next',
    amount: 1,
    unit: 'month',
    type: 'relative',
  },
  {
    key: '3-months-previous',
    amount: -3,
    unit: 'month',
    type: 'relative',
  },
  {
    key: '3-months-next',
    amount: 3,
    unit: 'month',
    type: 'relative',
  },
  {
    key: '6-months-previous',
    amount: -6,
    unit: 'month',
    type: 'relative',
  },
  {
    key: '6-months-next',
    amount: 6,
    unit: 'month',
    type: 'relative',
  },
  {
    key: '1-year-previous',
    amount: -1,
    unit: 'year',
    type: 'relative',
  },
  {
    key: '1-year-next',
    amount: 1,
    unit: 'year',
    type: 'relative',
  },
];
