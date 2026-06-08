import type { QUnitType } from 'dayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { DashboardFilter } from '../../useDashboardStore';
import { convertDateRangeValues } from '../../widgets/filterHelpers';

dayjs.extend(utc);

export const tagsFilter = (tags: DashboardFilter['tags']) => {
  return { TagTypeId: { _in: tags } } as const;
};

export const departmentsFilter = (
  departments: DashboardFilter['departments']
) => {
  return { DepartmentTypeId: { _in: departments } } as const;
};

export const dateRangeFilter = (
  dateRange: DashboardFilter['dateRange'],
  precision: QUnitType = 'day',
  comparison: 'both' | 'gte' | 'lte' = 'both'
) => {
  if (!dateRange) {
    return {};
  }
  const { startDate, endDate } = convertDateRangeValues(dateRange);
  const gte = comparison === 'gte' || comparison === 'both';
  const lte = comparison === 'lte' || comparison === 'both';
  if (!startDate || !endDate) {
    return {};
  }

  return {
    _gte: gte
      ? dayjs.utc(startDate).startOf(precision).toISOString()
      : undefined,
    _lte: lte ? dayjs.utc(endDate).endOf(precision).toISOString() : undefined,
  } as const;
};
