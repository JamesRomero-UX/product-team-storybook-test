import type { UseRatingResponse } from '@risksmart-app/components/src/hooks/useRating';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Colour } from '@risksmart-app/components/src/utils/colours';
import { colours } from '@risksmart-app/components/src/utils/colours';
import type { KeyPrefix, ParseKeys } from 'i18next';
import i18n from 'i18next';
import { isDate } from 'lodash';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useColourPalette } from 'src/hooks/useColourPalette';

import type { UseRiskScoreFormattersResponse } from '@/hooks/useRiskScore';
import { useRiskScoreFormatters } from '@/hooks/useRiskScore';

import type { Category, CategoryType, UnratedCategoryType } from '../types';
import { UNRATED } from '../types';

export type RatingKeyOptions<
  T,
  K extends CategoryType,
  S extends CategoryType,
> = {
  entityNamePlural: ParseKeys<'common'>;
  category?: KeyPrefix<'ratings'>;
  subCategory?: KeyPrefix<'ratings'>;
  subCategoryOverrideFunction?: (
    category: Category<T, S | UnratedCategoryType>,
    ratingFns: UseRatingResponse,
    riskFormatters: UseRiskScoreFormattersResponse
  ) => Partial<{
    color: string;
    title: string;
    category: Category<T, S | UnratedCategoryType>;
    value: number;
  }>;
  categoryOverrideFunction?: (
    category: Category<T, K>,
    ratingFns: UseRatingResponse,
    riskFormatters: UseRiskScoreFormattersResponse
  ) => Partial<{
    color: string;
    title: string;
    category: Category<T, K>;
    value: number;
  }>;
};

type DataSeriesOptions = {
  chartType: 'bar' | 'column' | 'line';
  /**
   * Whether to set colours on individual data points.
   * When true, adds colour property to each data point for radar charts.
   * When false, colours are only set at the series level for bar charts.
   */
  enablePointColors?: boolean;
};

type DataPoint<T> = {
  x: T;
  y: number;
  color?: string;
};

export type DataSeries<T> = {
  readonly data: readonly DataPoint<T>[];
  type: 'bar' | 'column' | 'line';
  title: string;
  color?: string;
};

export const useDataSeries = <
  T,
  K extends CategoryType,
  S extends CategoryType,
>(
  categories: Category<T, K, never | S>[],
  translationOptions: RatingKeyOptions<T, K, never | S>,
  options: DataSeriesOptions
): DataSeries<K>[] => {
  const { t } = useTranslation();
  const riskFormatters = useRiskScoreFormatters();
  const categoryRatingFns = useRating(translationOptions.category);
  const subCategoryRatingFns = useRating(translationOptions.subCategory);
  const { genericCategoricalPalette } = useColourPalette();
  const { getByValue } = categoryRatingFns;
  const {
    getByValue: getSubcategoryByValue,
    getColorClass: getSubcategoryColor,
  } = subCategoryRatingFns;

  if (categories.length < 1) {
    return [];
  }

  const data = categories
    .sort((a, b) => (a.sortKey ?? a.label).localeCompare(b.sortKey ?? b.label))
    .map((category, index) => {
      // Determine the display value for x-axis
      let xValue: K;
      const overrideTitle = translationOptions.categoryOverrideFunction?.(
        category,
        categoryRatingFns,
        riskFormatters
      )?.title;

      if (overrideTitle) {
        // Use override title but cast to K since we know it should match the category type
        xValue = overrideTitle as K;
      } else if (isDate(category.key)) {
        // For dates, use the key directly
        xValue = category.key;
      } else {
        // Use rating label or fallback to category label, cast to K
        xValue = (getByValue(category.key)?.label ?? category.label) as K;
      }

      return {
        x: xValue,
        y: category.aggregatedValue,
        subCategories: category.subCategories,
        ...(options.enablePointColors &&
          !category.subCategories && {
            color: genericCategoricalPalette(index),
          }),
      };
    });

  if (!data.length) {
    return [];
  }

  if (!data.some((d) => d.subCategories)) {
    return [
      {
        // Transform the data to match DataPoint<K> interface
        data: data.map((d) => {
          const point: DataPoint<K> = {
            x: d.x,
            y: d.y,
          };

          // Add color to individual points if enablePointColors is true
          if (options.enablePointColors && d.color) {
            point.color = d.color;
          }

          return point;
        }),
        type: options.chartType,
        title: i18n.format(
          t(translationOptions.entityNamePlural),
          'capitalizeAll'
        ),
        color: genericCategoricalPalette(0),
      },
    ];
  }

  const subCategories = data.flatMap((d) => d.subCategories ?? []);
  const uniqueSubCategories = _.uniqBy(subCategories, (c) => c.key);

  const sortedSubCategoryKeys = uniqueSubCategories.sort((a, b) => {
    if (a.key === UNRATED) {
      return 1;
    }
    if (b.key === UNRATED) {
      return -1;
    }

    if (isDate(a.key) && isDate(b.key)) {
      return a.key.getTime() - b.key.getTime();
    }

    return String(a.sortKey ?? a.key).localeCompare(String(b.sortKey ?? b.key));
  });

  // @ts-ignore
  return sortedSubCategoryKeys.map((subCategory, index) => {
    let subCategoryKey: number | string;
    const key = subCategory.key;
    if (isDate(key)) {
      subCategoryKey = String(key);
    } else {
      subCategoryKey = key;
    }

    const color =
      subCategoryKey === UNRATED
        ? colours['light-grey'].backgroundColor
        : (colours[getSubcategoryColor(subCategoryKey) as Colour]
            ?.backgroundColor ??
          getSubcategoryColor(subCategoryKey) ??
          genericCategoricalPalette(index));

    return {
      color,
      data: data.map((d) => {
        const point: DataPoint<K> = {
          x: d.x,
          y:
            d.subCategories?.find((subCategory) => subCategory.key === key)
              ?.aggregatedValue ?? 0,
        };

        // Add color to individual points if enablePointColors is true
        if (options.enablePointColors && d.color) {
          point.color = d.color;
        }

        return point;
      }),
      type: options.chartType,
      title:
        getSubcategoryByValue(subCategoryKey)?.label ??
        subCategory?.label ??
        String(key),
      ...(subCategory
        ? translationOptions.subCategoryOverrideFunction?.(
            subCategory,
            categoryRatingFns,
            riskFormatters
          )
        : {}),
    };
  });
};
