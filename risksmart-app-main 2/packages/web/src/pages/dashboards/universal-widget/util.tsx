import type {
  PropertyFilterOperation,
  PropertyFilterToken,
} from '@cloudscape-design/collection-hooks';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import type {
  SortingState,
  TypedPropertyFilterQuery,
  TypedPropertyFilterToken,
} from '@risksmart-app/components/src/table/tableUtils';
import {
  BarChart01,
  BarChart10,
  Grid01,
  GridDotsOuter,
  LineChartUp01,
  LineChartUp05,
  PieChart02,
  PieChart03,
  Star01,
} from '@untitled-ui/icons-react';
import type { QUnitType } from 'dayjs';

import type { TablePreferences } from '@/utils/table/types';

import type {
  AggregationType,
  DataSourceItem,
  WidgetDataSource,
} from '../gigawidget/types';
import { UNRATED } from '../gigawidget/types';
import type { DashboardFilter } from '../useDashboardStore';
import type { dataSources } from './data-sources';
import { defaultClickthroughFilterWithUnrated } from './dataSourceHelpers';
import type { SettingsSchema } from './settingsSchema';

export type GigawidgetDataSources = typeof dataSources;
type ChartType =
  | 'bar'
  | 'donut'
  | 'kpi'
  | 'line'
  | 'pie'
  | 'placemat'
  | 'radar'
  | 'stacked-bar'
  | 'table';

export type FilterSettings<
  T extends keyof GigawidgetDataSources = keyof GigawidgetDataSources,
> = {
  filtering?: TypedPropertyFilterQuery<
    DataSourceItem<GigawidgetDataSources[T]>
  >;
};

export type GigawidgetSettings<
  T extends keyof GigawidgetDataSources = keyof GigawidgetDataSources,
  K extends ChartType = ChartType,
> = FilterSettings<T> & {
  title: string;
  dataSource: T;
  chartType: K;
  precision?: 'day' | 'month' | 'year';
  categoryGetter:
    | `custom:${string}`
    | GigawidgetDataSources[T]['categoryGetters'][number]['id'];
  subCategoryGetter?:
    | `custom:${string}`
    | GigawidgetDataSources[T]['categoryGetters'][number]['id'];
  sorting?: SortingState<DataSourceItem<GigawidgetDataSources[T]>>;
  customTitle?: boolean;
  showFilters: boolean;
  ignoreDashboardDateFilter: boolean;
  aggregationType?: AggregationType;
  aggregationField?: keyof DataSourceItem<GigawidgetDataSources[T]>;
  preferences?: TablePreferences<DataSourceItem<GigawidgetDataSources[T]>>;
  customUnit?: boolean;
  unit: string;
  invertBarChartAxis?: boolean;
  allowOwnershipFiltering?: boolean;
  noClickthroughMessageContent?: string;
  showAsPercentage?: boolean;
};

export const dateFormats: Record<
  NonNullable<SettingsSchema['precision']>,
  string
> = {
  day: 'DD MMM',
  month: 'MMM YYYY',
  year: 'YYYY',
};

export const chartTypeLabels: Record<
  NonNullable<SettingsSchema['chartType']>,
  Pick<SelectProps.Option, 'iconSvg' | 'label'>
> = {
  bar: {
    label: 'Bar Chart',
    iconSvg: <BarChart01 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  'stacked-bar': {
    label: 'Stacked Bar Chart',
    iconSvg: <BarChart10 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  pie: {
    label: 'Pie Chart',
    iconSvg: <PieChart03 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  donut: {
    label: 'Donut Chart',
    iconSvg: <PieChart02 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  radar: {
    label: 'Radar Chart',
    iconSvg: <LineChartUp05 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  line: {
    label: 'Line Chart',
    iconSvg: <LineChartUp01 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  table: {
    label: 'Table',
    iconSvg: <Grid01 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  kpi: {
    label: 'Tile',
    iconSvg: <Star01 viewBox={'0 0 24 24'} width={24} height={24} />,
  },
  placemat: {
    label: 'Placemat',
    iconSvg: <GridDotsOuter viewBox={'0 0 24 24'} width={24} height={24} />,
  },
};

export const datePrecisionLabels: Record<
  NonNullable<SettingsSchema['precision']>,
  string
> = {
  day: 'Day',
  month: 'Month',
  year: 'Year',
};

export const getString = (value: (() => string) | string) =>
  typeof value === 'string' ? value : value();

export const convertToTokenGroups = <T extends object>(
  filtering: TypedPropertyFilterQuery<T>
): TypedPropertyFilterQuery<T> => {
  return {
    operation: 'and',
    tokenGroups: [{ ...filtering }],
    tokens: [],
  };
};

export const dashboardFilterToQuery = (
  filter: DashboardFilter,
  precision: QUnitType,
  dateFilter?: (
    dateRange: DashboardFilter['dateRange'],
    precision: QUnitType
  ) => PropertyFilterToken[],
  includeGlobalFilters: {
    departments?: boolean;
    tags?: boolean;
  } = {}
): TypedPropertyFilterQuery<{
  departments: unknown;
  tags: unknown;
  CreatedAtTimestamp: unknown;
}> => ({
  operation: 'and',
  tokens: [],
  tokenGroups: [
    ...(includeGlobalFilters.tags && filter.tags.length > 0
      ? [
          {
            operation: 'or' as PropertyFilterOperation,
            tokens: filter.tags.map(
              (tag) =>
                ({
                  operator: '=',
                  propertyKey: 'tags',
                  value: tag,
                }) as TypedPropertyFilterToken<{ tags: unknown }>
            ),
          },
        ]
      : []),
    ...(includeGlobalFilters.departments && filter.departments.length > 0
      ? [
          {
            operation: 'or' as PropertyFilterOperation,
            tokens: filter.departments.map(
              (department) =>
                ({
                  operator: '=',
                  propertyKey: 'departments',
                  value: department,
                }) as TypedPropertyFilterToken<{ departments: unknown }>
            ),
          },
        ]
      : []),
    ...((dateFilter
      ? dateFilter(filter.dateRange, precision)
      : []) as unknown as TypedPropertyFilterToken<Record<string, unknown>>[]),
  ],
});

export const getCategoryGetter = <TDataSource extends WidgetDataSource>(
  id:
    | GigawidgetSettings['categoryGetter']
    | GigawidgetSettings['subCategoryGetter'],
  categoryGetters: TDataSource['categoryGetters']
): null | TDataSource['categoryGetters'][number] | undefined => {
  if (!id) {
    return null;
  }
  if (id.startsWith('custom:')) {
    const fieldId = id.split(':')[1];

    return {
      id: 'customAttributeGetter',
      name: () => 'Custom Attribute',
      categoryGetter: (item) =>
        item.CustomAttributeData?.[fieldId] ?? {
          key: UNRATED,
          label: UNRATED,
        },
      clickthroughFilter: defaultClickthroughFilterWithUnrated(fieldId),
    };
  }

  return categoryGetters.find((cg) => cg.id === id);
};
