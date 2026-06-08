import { useQuery } from '@apollo/client';
import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useQuery as useTRPCQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import { useTRPC } from 'src/utils/trpc';
import { merge } from 'ts-deepmerge';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import type { StatefulTableOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import type { TablePropsWithActions } from '@/utils/table/types';

import type { GigawidgetSettings } from '../../universal-widget/util';
import propertyFilter from '../property-filter';
import type {
  DataSourceData,
  DataSourceItem,
  DataSourceVariables,
  DateFilterOptions,
  WidgetDataSource,
} from '../types';
import { useDataSourceFilter } from './useDataSourceFilter';

type GetWidgetDataResult<TDataSource extends WidgetDataSource> = {
  loading?: boolean;
  tableProps: TablePropsWithActions<DataSourceItem<TDataSource>>;
  data: DataSourceData<TDataSource> | undefined;
};

type UseGetWidgetDataOptions<TDataSource extends WidgetDataSource> = {
  dataSource: TDataSource;
  disableDashboardFilters?: boolean;
  dateFilterOptions?: DateFilterOptions<TDataSource>;
  variables?: Partial<DataSourceVariables<TDataSource>>;
  propertyFilterQuery?: PropertyFilterQuery;
  cacheOnly?: boolean;
  tableOptions?: Omit<
    StatefulTableOptions<DataSourceVariables<TDataSource>>,
    'propertyFilter'
  >;
};

export const useGetWidgetData = <TDataSource extends WidgetDataSource>(
  options: UseGetWidgetDataOptions<TDataSource>
): GetWidgetDataResult<TDataSource> => {
  const { dataSource, dateFilterOptions, variables } = options;
  const [settings] = useDashboardWidgetSettings<GigawidgetSettings>();

  const where = useDataSourceFilter(dataSource, dateFilterOptions);
  const { user } = useRisksmartUser();
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();

  const mergedVariables = merge(
    options.disableDashboardFilters ? {} : where,
    variables ?? {},
    options.dataSource.useDefaultVariables(user?.userId)
  ) as DataSourceVariables<TDataSource>;

  const { data: graphQLData, loading: graphQLLoading } = useQuery<
    DataSourceData<TDataSource>,
    DataSourceVariables<TDataSource>
  >(dataSource.documentNode, {
    variables: mergedVariables,
    fetchPolicy: options.cacheOnly ? 'cache-first' : 'no-cache',
    skip: trpcEnabled,
  });
  const { data: trpcData, isLoading: trpcLoading } = useTRPCQuery({
    ...(trpcEnabled
      ? dataSource.trpcQuery(trpc, mergedVariables)
      : {
          queryKey: [],
          queryFn: async () => {
            return;
          },
        }),

    enabled: trpcEnabled,
  });

  const filteredData = options.dataSource.useInitialDataFilter
    ? options.dataSource.useInitialDataFilter(
        trpcEnabled ? trpcData : graphQLData,
        Boolean(settings?.allowOwnershipFiltering)
      )
    : trpcEnabled
      ? trpcData
      : graphQLData;

  const tableProps = options.dataSource.useTablePropsHook(filteredData, {
    propertyFilter: options?.propertyFilterQuery,
    sortingState: options.tableOptions?.sortingState,
    setSortingState: options.tableOptions?.setSortingState ?? _.noop,
    preferences: options.tableOptions?.preferences,
    setPreferences: options.tableOptions?.setPreferences ?? _.noop,
    setPropertyFilter: _.noop,
    hideNoMatchClearButton: true,
  });

  tableProps.allItems =
    options.propertyFilterQuery && options.propertyFilterQuery.tokens.length > 0
      ? propertyFilter(tableProps.allItems, options.propertyFilterQuery, {
          filteringProperties: tableProps.filteringProperties,
        })
      : tableProps.allItems;

  return {
    data: filteredData,
    tableProps,
    loading: trpcEnabled ? trpcLoading : graphQLLoading || !graphQLData,
  };
};
