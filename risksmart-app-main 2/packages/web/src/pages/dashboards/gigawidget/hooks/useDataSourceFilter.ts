import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { merge } from 'ts-deepmerge';

import { useDashboardWidgetSettings } from '../../../../context/useDashboardWidgetSettings';
import type { GigawidgetSettings } from '../../universal-widget/util';
import { useDashboardStore } from '../../useDashboardStore';
import type {
  DataSourceVariables,
  DateFilterOptions,
  WidgetDataSource,
} from '../types';

const applyFilter = <T, K>(filterFunc?: (value: T) => K, value?: T) => {
  if (Array.isArray(value) && value.length === 0) {
    return {};
  }
  if (value == null) {
    return {};
  }
  if (!filterFunc) {
    return {};
  }

  return filterFunc(value);
};

export const useDataSourceFilter = <T extends WidgetDataSource>(
  dataSource: T,
  dateFilterOptions?: DateFilterOptions<T>
) => {
  const { filters, myItemsFilters } = useDashboardStore();
  const [settings] = useDashboardWidgetSettings<GigawidgetSettings>();
  const { user } = useRisksmartUser();

  const departmentFilter = applyFilter(
    dataSource.dashboardFilterConfig.departmentsFilter,
    filters.departments
  );
  const tagFilter = applyFilter(
    dataSource.dashboardFilterConfig.tagsFilter,
    filters.tags
  );
  const dateFilter = applyFilter(
    (dateRange) =>
      dateFilterOptions?.dateFilter?.(
        dateRange,
        dateFilterOptions?.precision ?? 'day'
      ) ?? {},
    filters.dateRange
  );

  const ownershipFilter = applyFilter(
    (ownershipFilters) =>
      dataSource.dashboardFilterConfig.ownershipFilter?.(
        ownershipFilters,
        user?.userId
      ) ?? {},
    myItemsFilters
  );

  if (settings?.allowOwnershipFiltering) {
    return ownershipFilter as DataSourceVariables<T>;
  }

  return merge(
    departmentFilter,
    tagFilter,
    settings?.ignoreDashboardDateFilter ? {} : dateFilter
  ) as DataSourceVariables<T>;
};
