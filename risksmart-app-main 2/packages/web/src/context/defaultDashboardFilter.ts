import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';

interface DashboardFilter {
  departments: Array<string>;
  tags: Array<string>;
  dateRange: DateRangePickerProps.Value | null;
}

export const defaultDashboardFilter: DashboardFilter = {
  departments: [],
  tags: [],
  dateRange: null,
};
