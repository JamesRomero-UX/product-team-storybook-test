import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { UseRatingResponse } from '@risksmart-app/components/src/hooks/useRating';
import type {
  TypedPropertyFilterQuery,
  TypedPropertyFilterToken,
} from '@risksmart-app/components/src/table/tableUtils';
import type { FeatureFlag, ModuleKey } from '@risksmart-app/modules/src/index';
import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { createTRPCContext } from '@trpc/tanstack-react-query';
import type { QUnitType } from 'dayjs';
import type { KeyPrefix, ParseKeys } from 'i18next';
import type { HasPermission } from 'src/rbac/Permission';

import type { UseRiskScoreFormattersResponse } from '@/hooks/useRiskScore';
import type { StatefulTableOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import type { TablePropsWithActions, TableRecord } from '@/utils/table/types';

import type { DashboardFilter, MyItemsFilter } from '../useDashboardStore';
// Type for the tRPC client returned by useTRPC hook
type TRPCClientContext = ReturnType<typeof createTRPCContext<AppRouter>>;
type TRPCClient = ReturnType<TRPCClientContext['useTRPC']>;

export type AggregationType = 'count' | 'max' | 'mean' | 'min' | 'sum';

export const UNRATED = 'Unrated';

/** Category type along with the records within this category */
export type Category<
  T,
  K extends CategoryType,
  S extends CategoryType | never = never,
> = {
  key: K | UnratedCategoryType;
  label: string;
  sortKey?: string;
  aggregatedValue: number;
  data: T[];
  subCategories?: Category<T, S | UnratedCategoryType>[];
};

export type CategoryGetter<
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
> = (
  data: DataSourceItem<TDataSource>
) => CategoryResult<TCategory> | CategoryResult<TCategory>[];

export type DataSourceItem<T> = T extends WidgetDataSource<infer K> ? K : never;

export type DataSourceVariables<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends WidgetDataSource<any, infer K> ? K : never;

export type DataSourceData<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends WidgetDataSource<any, any, infer K> ? K : never;

type CategoryGetterDefinition<
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
> = {
  id: string;
  name: () => string;
  categoryGetter: CategoryGetter<TDataSource, TCategory>;
  clickthroughFilter?: (
    category: Category<
      DataSourceItem<TDataSource>,
      TCategory | UnratedCategoryType
    >,
    datePrecision: QUnitType
  ) => TypedPropertyFilterToken<DataSourceItem<TDataSource>>[];
  categoryOverrideFunction?: (
    category: Category<
      DataSourceItem<TDataSource>,
      TCategory | UnratedCategoryType
    >,
    ratingFns: UseRatingResponse,
    riskFormatters: UseRiskScoreFormattersResponse
  ) => Partial<{
    color: string;
    title: string;
    category: Category<
      DataSourceItem<TDataSource>,
      TCategory | UnratedCategoryType
    >;
    value: number;
  }>;
  ratingColourKey?: KeyPrefix<'ratings'>;
  /** When true, this category is hidden when aggregations (non-default risk model) is enabled */
  isHiddenWhenAggregationsEnabled?: boolean;
} & (
  | {
      date: true;
      /** Choose how the global date filtering will work */
      dashboardDateFilterOverride: DateFilterOptions<TDataSource>['dateFilter'];
    }
  | {
      date?: false;
    }
);

type SortingColumn<T extends TableRecord> = {
  sortingField?: string;
  sortingComparator?: (a: T, b: T) => number;
};

type SortingState<T extends TableRecord> = {
  isDescending?: boolean;
  sortingColumn: SortingColumn<T>;
};

export type WidgetDataSource<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TItem extends TableRecord = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TVariables = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData = any,
> = {
  /**
   * Required to determine which custom attributes to display in the category selector
   */
  parentTypes: Parent_Type_Enum[];
  /**
   * Whether or not the user has access to view the data source
   *
   * @param hasPermission Function to retrieve user permissions
   * @param isModuleEnabled Function to check if a module is enabled
   * @param isFeatureFlagEnabled Function to check if a feature flag is enabled
   * @returns
   */
  hasAccess: (
    hasPermission: HasPermission,
    isModuleEnabled: (id: ModuleKey) => boolean,
    isFeatureFlagEnabled: (flag: FeatureFlag) => boolean
  ) => boolean;
  documentNode: TypedDocumentNode<TData, TVariables>;
  trpcQuery: (
    trpc: TRPCClient,
    variables: TVariables
  ) => UseQueryOptions<unknown, Error>;
  useDefaultVariables: (userId?: string) => TVariables;
  useTablePropsHook: (
    data: TData | undefined,
    options: StatefulTableOptions<TItem>
  ) => TablePropsWithActions<TItem>;
  fields: ParseKeys<'common'>;
  entityNamePlural: ParseKeys<'common'>;
  entityNameSingular: ParseKeys<'common'>;
  /**
   * When any of these filters are set up,
   * the data in this widget will be filtered by the matching global dashboard filters.
   */
  dashboardFilterConfig: {
    tagsFilter?: (filters: DashboardFilter['tags']) => Partial<TVariables>;
    departmentsFilter?: (
      filters: DashboardFilter['departments']
    ) => Partial<TVariables>;
    dateFilter?: DateFilterOptions<
      WidgetDataSource<TItem, TVariables, TData>
    >['dateFilter'];
    dateClickthroughFilter?: (
      filter: DashboardFilter['dateRange'],
      datePrecision: QUnitType
    ) => TypedPropertyFilterToken<TItem>[];
    ownershipFilter?: (
      filters: MyItemsFilter,
      userId?: string
    ) => Partial<TVariables>;
  };
  /**
   * Widget category settings.
   * For date categories, optional filters may be provided,
   * otherwise dashboard filter config will be used.
   */
  categoryGetters: CategoryGetterDefinition<
    WidgetDataSource<TItem, TVariables, TData>,
    CategoryType
  >[];
  clickThroughUrl?: (
    propertyFilter: TypedPropertyFilterQuery<TItem>,
    sortingState?: SortingState<TItem>
  ) => string;
  /**
   * Use for client-side filtering of the data immediately after the query
   * and before the data is passed to any other filtering functions.
   */
  useInitialDataFilter?: (
    data: TData | undefined,
    allowOwnershipFiltering: boolean
  ) => TData | undefined;
};

export type UnratedCategoryType = typeof UNRATED;
export type CategoryType = Date | number | string | UnratedCategoryType;
type DetailedCategoryType<T extends CategoryType> = {
  key: null | T | undefined | UnratedCategoryType;
  label: string;
  sortKey?: string;
  count?: number;
};
export type DateFilterOptions<TDataSource> = {
  dateFilter?: (
    filters: DashboardFilter['dateRange'],
    precision: QUnitType
  ) => Partial<DataSourceVariables<TDataSource>>;
  precision?: QUnitType;
  dateFormat?: string;
};

export type CategoryResult<TCategory extends CategoryType> =
  | DetailedCategoryType<TCategory>
  | null
  | TCategory
  | UnratedCategoryType;

export type GigawidgetCommonProps<TDataSource extends WidgetDataSource> = {
  dataSource: TDataSource;
  variables?: Partial<DataSourceVariables<TDataSource>>;
  dateFilterOptions?: DateFilterOptions<TDataSource>;
  propertyFilterQuery?: PropertyFilterQuery;
  aggregationType?: AggregationType;
  aggregationField?: keyof DataSourceItem<TDataSource>;
  allowOwnershipFiltering?: boolean;
  noClickthroughMessageContent?: string;
};

export type CategoricalGigawidgetCommonProps<
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
> = {
  categoryGetter: CategoryGetter<TDataSource, TCategory>;
  categoryRatingTranslationKey?: KeyPrefix<'ratings'>;
  categoryOverrideFunction?: (
    catgory: Category<
      DataSourceItem<TDataSource>,
      TCategory | UnratedCategoryType
    >,
    ratingFns: UseRatingResponse,
    riskFormatters: UseRiskScoreFormattersResponse
  ) => Partial<{
    color: string;
    title: string;
    category: Category<
      DataSourceItem<TDataSource>,
      TCategory | UnratedCategoryType
    >;
    value: number;
  }>;
  onClickUrl?: (
    item: Category<
      DataSourceItem<TDataSource>,
      TCategory | UnratedCategoryType
    >,
    filters: DashboardFilter
  ) => string | undefined;
};
