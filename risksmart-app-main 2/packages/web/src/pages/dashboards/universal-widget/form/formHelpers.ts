import type { WidgetDataSource } from '../../gigawidget/types';

type FilterOptions = {
  /** When true, categories marked with isHiddenWhenAggregationsEnabled are excluded */
  isAggregationsEnabled?: boolean;
};

export const getStandardFieldOptions = <TDataSource extends WidgetDataSource>(
  categoryGetters: TDataSource['categoryGetters'],
  filterOptions?: FilterOptions
) => {
  return [
    {
      label: 'Standard Fields',
      options:
        categoryGetters
          .filter((cg) => !cg.date)
          .filter(
            (cg) =>
              !filterOptions?.isAggregationsEnabled ||
              !cg.isHiddenWhenAggregationsEnabled
          )
          .map((categoryGetter) => ({
            label: categoryGetter.name(),
            value: categoryGetter.id,
          })) ?? [],
    },
  ];
};

export const getDateFieldOptions = <TDataSource extends WidgetDataSource>(
  categoryGetters: TDataSource['categoryGetters'],
  showDateFields?: boolean,
  filterOptions?: FilterOptions
) => {
  return !showDateFields
    ? []
    : [
        {
          label: 'Date Fields',
          options:
            categoryGetters
              .filter((cg) => cg.date)
              .filter(
                (cg) =>
                  !filterOptions?.isAggregationsEnabled ||
                  !cg.isHiddenWhenAggregationsEnabled
              )
              .map((categoryGetter) => ({
                label: categoryGetter.name(),
                value: categoryGetter.id,
              })) ?? [],
        },
      ];
};

export const getCustomAttributeOptions = (
  customAttributeOptions?: { label: string; value: string }[]
) => {
  if (!customAttributeOptions || customAttributeOptions.length < 1) {
    return [];
  }

  return [
    {
      label: 'Custom Fields',
      options: customAttributeOptions,
    },
  ];
};
