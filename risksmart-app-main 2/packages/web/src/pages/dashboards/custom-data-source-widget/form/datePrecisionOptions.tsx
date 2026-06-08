import type { GroupByDatePrecision } from '@risksmart-app/shared/reporting/api/schema';

export const datePrecisionLabels: Record<GroupByDatePrecision, string> = {
  day: 'Day',
  month: 'Month',
  year: 'Year',
};

export const datePrecisionOptions = Object.keys(datePrecisionLabels).map(
  (precision) => ({
    value: precision,
    label: datePrecisionLabels[precision as GroupByDatePrecision],
  })
);
