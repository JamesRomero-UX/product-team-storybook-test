import { useMemo } from 'react';

import type {
  AggregationType,
  Category,
  CategoryGetter,
  CategoryType,
  DataSourceItem,
  DateFilterOptions,
  UnratedCategoryType,
  WidgetDataSource,
} from '../types';
import { aggregateCategories } from '../util/categoryFunctions';

type UseAggregatedCategoriesOptions<
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
  TSubCategory extends CategoryType,
> = {
  dataSource: TDataSource;
  items: readonly DataSourceItem<TDataSource>[] | undefined;
  dateFilterOptions?: DateFilterOptions<TDataSource>;
  categoryGetter: CategoryGetter<TDataSource, TCategory>;
  subCategoryGetter?: CategoryGetter<TDataSource, TSubCategory>;

  aggregationType?: AggregationType;
  aggregationField?: keyof DataSourceItem<TDataSource>;
};

export const useAggregateCategories = <
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
  TSubCategory extends CategoryType,
>(
  options: UseAggregatedCategoriesOptions<TDataSource, TCategory, TSubCategory>
) => {
  const { items, dateFilterOptions, categoryGetter, subCategoryGetter } =
    options;

  return useMemo((): Category<
    DataSourceItem<TDataSource>,
    TCategory | UnratedCategoryType,
    never | TSubCategory | UnratedCategoryType
  >[] => {
    if (!items || !items.length) {
      return [];
    }

    const categories = aggregateCategories(
      items,
      categoryGetter,
      dateFilterOptions?.precision ?? 'day',
      dateFilterOptions?.dateFormat ?? 'DD MMM YYYY',
      options.aggregationType,
      options.aggregationField
    );

    if (!subCategoryGetter) {
      return categories;
    }

    return categories.map((category) => {
      const subCategories = aggregateCategories(
        category.data,
        subCategoryGetter,
        dateFilterOptions?.precision ?? 'day',
        dateFilterOptions?.dateFormat ?? 'DD MMM YYYY',
        options.aggregationType,
        options.aggregationField
      );

      return {
        ...category,
        subCategories,
      };
    });
  }, [
    items,
    categoryGetter,
    dateFilterOptions?.precision,
    dateFilterOptions?.dateFormat,
    options.aggregationType,
    options.aggregationField,
    subCategoryGetter,
  ]);
};
