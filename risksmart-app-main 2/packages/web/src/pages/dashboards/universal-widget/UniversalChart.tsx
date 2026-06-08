import type { TypedPropertyFilterQuery } from '@risksmart-app/components/src/table/tableUtils';
import { isEqual, uniqWith } from 'lodash';
import { merge } from 'ts-deepmerge';

import { emptyFilterQuery } from '@/utils/table/types';

import { Gigawidget } from '../gigawidget';
import type {
  Category,
  CategoryType,
  DataSourceItem,
  DateFilterOptions,
  GigawidgetCommonProps,
  WidgetDataSource,
} from '../gigawidget/types';
import { default as useOwnershipClickthroughEnabled } from '../my-items/hooks/useGetClickthroughEnabled';
import { useGetMyItemsFilteringTokens } from '../my-items/hooks/useGetMyItemsFilteringTokens';
import { useDashboardStore } from '../useDashboardStore';
import type { GigawidgetSettings } from './util';
import {
  convertToTokenGroups,
  dashboardFilterToQuery,
  dateFormats,
  getCategoryGetter,
} from './util';

type Props<TDataSource extends WidgetDataSource> = {
  dataSource: TDataSource;
  settings: GigawidgetSettings;
};

export const UniversalChart = <TDataSource extends WidgetDataSource>({
  dataSource,
  settings,
}: Props<TDataSource>) => {
  const { filters } = useDashboardStore();
  const { getMyItemsFilteringTokens } = useGetMyItemsFilteringTokens();
  const ownershipClickthroughEnabled = useOwnershipClickthroughEnabled();
  const datePrecision = settings.precision ?? 'month';

  const categoryConfig = getCategoryGetter(
    settings.categoryGetter,
    dataSource.categoryGetters
  );

  const subCategoryConfig = getCategoryGetter(
    settings.subCategoryGetter,
    dataSource.categoryGetters
  );

  const dateFilterOptions: DateFilterOptions<TDataSource> = {
    dateFilter: categoryConfig?.date
      ? categoryConfig.dashboardDateFilterOverride
      : dataSource.dashboardFilterConfig.dateFilter,
    precision: categoryConfig?.date ? datePrecision : 'day',
    dateFormat: dateFormats[datePrecision],
  };

  const clickThroughUrl =
    settings.allowOwnershipFiltering && !ownershipClickthroughEnabled
      ? undefined
      : (item: Category<DataSourceItem<TDataSource>, CategoryType>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const propertyFilter: TypedPropertyFilterQuery<any> = merge(
            settings.filtering
              ? convertToTokenGroups(settings.filtering)
              : emptyFilterQuery,

            settings.allowOwnershipFiltering
              ? { tokenGroups: getMyItemsFilteringTokens(item.data) }
              : emptyFilterQuery,

            !settings.allowOwnershipFiltering
              ? dashboardFilterToQuery(
                  filters,
                  datePrecision,
                  !categoryConfig?.date
                    ? dataSource.dashboardFilterConfig.dateClickthroughFilter
                    : undefined,
                  {
                    departments:
                      !!dataSource.dashboardFilterConfig.departmentsFilter,
                    tags: !!dataSource.dashboardFilterConfig.tagsFilter,
                  }
                )
              : emptyFilterQuery,
            {
              tokenGroups:
                categoryConfig?.clickthroughFilter?.(item, datePrecision) ?? [],
            }
          );

          return (
            dataSource.clickThroughUrl?.({
              ...propertyFilter,
              // Remove empty token groups
              tokenGroups: uniqWith(
                propertyFilter.tokenGroups ?? [],
                isEqual
              ).filter((tg) => !('tokens' in tg) || tg.tokens.length > 0),
            }) ?? ''
          );
        };

  const onClickNumberHandler =
    settings.allowOwnershipFiltering && !ownershipClickthroughEnabled
      ? undefined
      : (data: readonly DataSourceItem<TDataSource>[] | undefined) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const propertyFilter: TypedPropertyFilterQuery<any> = merge(
            settings.filtering
              ? convertToTokenGroups(settings.filtering)
              : emptyFilterQuery,
            settings.allowOwnershipFiltering
              ? { tokenGroups: getMyItemsFilteringTokens(data) }
              : emptyFilterQuery,
            !settings.allowOwnershipFiltering
              ? dashboardFilterToQuery(
                  filters,
                  'day',
                  settings.ignoreDashboardDateFilter
                    ? undefined
                    : dataSource.dashboardFilterConfig.dateClickthroughFilter,
                  {
                    departments:
                      !!dataSource.dashboardFilterConfig.departmentsFilter,
                    tags: !!dataSource.dashboardFilterConfig.tagsFilter,
                  }
                )
              : emptyFilterQuery
          );

          return (
            dataSource.clickThroughUrl?.(
              {
                ...propertyFilter,
                // Remove empty token groups
                tokenGroups: uniqWith(
                  propertyFilter.tokenGroups ?? [],
                  isEqual
                ).filter((tg) => !('tokens' in tg) || tg.tokens.length > 0),
              },
              settings.sorting ?? undefined
            ) ?? ''
          );
        };

  const commonProps: GigawidgetCommonProps<TDataSource> = {
    dataSource,
    dateFilterOptions,
    propertyFilterQuery: settings.filtering ?? emptyFilterQuery,
    allowOwnershipFiltering: settings.allowOwnershipFiltering,
    noClickthroughMessageContent: settings.noClickthroughMessageContent,
  };

  //categorical charts
  if (categoryConfig) {
    switch (settings.chartType) {
      case 'pie':
      case 'donut':
        return (
          <Gigawidget
            {...commonProps}
            type={settings.chartType}
            aggregationType={settings.aggregationType}
            aggregationField={settings.aggregationField}
            categoryGetter={categoryConfig.categoryGetter}
            categoryRatingTranslationKey={categoryConfig.ratingColourKey}
            categoryOverrideFunction={categoryConfig.categoryOverrideFunction}
            onClickUrl={clickThroughUrl}
            showAsPercentage={settings.showAsPercentage}
          />
        );
      case 'bar':
      case 'stacked-bar':
        return (
          <Gigawidget
            {...commonProps}
            aggregationType={settings.aggregationType}
            aggregationField={settings.aggregationField}
            type={settings.chartType}
            categoryGetter={categoryConfig.categoryGetter}
            categoryRatingTranslationKey={categoryConfig.ratingColourKey}
            categoryOverrideFunction={categoryConfig.categoryOverrideFunction}
            subCategoryGetter={subCategoryConfig?.categoryGetter}
            subCategoryRatingTranslationKey={subCategoryConfig?.ratingColourKey}
            subCategoryOverrideFunction={
              subCategoryConfig?.categoryOverrideFunction
            }
            orientation={
              settings.invertBarChartAxis ? 'horizontal' : 'vertical'
            }
            onClickUrl={clickThroughUrl}
          />
        );
      case 'radar':
        return (
          <Gigawidget
            {...commonProps}
            aggregationType={settings.aggregationType}
            aggregationField={settings.aggregationField}
            type={settings.chartType}
            categoryGetter={categoryConfig.categoryGetter}
            categoryRatingTranslationKey={categoryConfig.ratingColourKey}
            categoryOverrideFunction={categoryConfig.categoryOverrideFunction}
            subCategoryGetter={subCategoryConfig?.categoryGetter}
            subCategoryRatingTranslationKey={subCategoryConfig?.ratingColourKey}
            subCategoryOverrideFunction={
              subCategoryConfig?.categoryOverrideFunction
            }
            onClickUrl={clickThroughUrl}
          />
        );
      case 'line':
        return (
          <Gigawidget
            {...commonProps}
            aggregationType={settings.aggregationType}
            aggregationField={settings.aggregationField}
            type={settings.chartType}
            categoryGetter={categoryConfig.categoryGetter}
            categoryRatingTranslationKey={categoryConfig.ratingColourKey}
            categoryOverrideFunction={categoryConfig.categoryOverrideFunction}
            subCategoryGetter={subCategoryConfig?.categoryGetter}
            subCategoryRatingTranslationKey={subCategoryConfig?.ratingColourKey}
            subCategoryOverrideFunction={
              subCategoryConfig?.categoryOverrideFunction
            }
            onClickUrl={clickThroughUrl}
          />
        );
    }
  }

  // non-categorical charts
  switch (settings.chartType) {
    case 'table':
      return (
        <Gigawidget
          {...commonProps}
          type={'table'}
          aggregationField={settings.aggregationField}
          aggregationType={settings.aggregationType}
        />
      );
    case 'kpi':
      if (!settings.aggregationType) {
        return null;
      }

      return (
        <Gigawidget
          {...commonProps}
          type={'kpi'}
          onClickUrl={onClickNumberHandler}
          aggregationField={settings.aggregationField}
          aggregationType={settings.aggregationType}
          unit={settings.customUnit ? settings.unit : undefined}
        />
      );
    case 'placemat':
      return <Gigawidget {...commonProps} type={'placemat'} />;
  }
};
