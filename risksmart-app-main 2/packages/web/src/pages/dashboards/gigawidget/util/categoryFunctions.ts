import type { QUnitType } from 'dayjs';
import dayjs from 'dayjs';
import { isDate, maxBy, minBy } from 'lodash';

import type {
  AggregationType,
  Category,
  CategoryGetter,
  CategoryResult,
  CategoryType,
  UnratedCategoryType,
  WidgetDataSource,
} from '../types';
import { UNRATED } from '../types';

function isDateString(input: string): boolean {
  const date = new Date(input);

  return (
    !isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === input.slice(0, 10)
  );
}

export const aggregateCategories = <T, K extends CategoryType>(
  array: readonly T[],
  categoryGetter: CategoryGetter<WidgetDataSource, K>,
  datePrecision: QUnitType,
  dateFormat?: string,
  aggregationType?: AggregationType,
  aggregationField?: keyof T
): Category<T, K>[] => {
  const categories = group(array, categoryGetter, datePrecision, dateFormat);
  aggregate(categories, aggregationType ?? 'count', aggregationField);

  return sort(categories);
};

const sum = <T>(data: T[], aggregationField: keyof T) => {
  let sum = 0;

  data.forEach((item) => {
    const value = item[aggregationField];
    if (typeof value === 'number') {
      sum += value;
    }
  });

  return sum;
};

const mean = <T>(data: T[], aggregationField: keyof T) =>
  sum(data, aggregationField) / data.length;

const max = <T>(data: T[], aggregationField: keyof T) => {
  const maxItem = maxBy(data, aggregationField);

  return maxItem ? (maxItem[aggregationField] as number) : 0;
};

const min = <T>(data: T[], aggregationField: keyof T) => {
  const minItem = minBy(data, aggregationField);

  return minItem ? (minItem[aggregationField] as number) : 0;
};

export const aggregate = <T, K extends CategoryType>(
  categories: Category<T, K>[],
  aggregationType: AggregationType,
  aggregationField?: keyof T
) => {
  categories.forEach((category) => {
    switch (aggregationType) {
      case 'sum':
        {
          if (aggregationField) {
            category.aggregatedValue = sum(category.data, aggregationField);
          }
        }
        break;
      case 'mean':
        {
          if (aggregationField) {
            category.aggregatedValue = mean(category.data, aggregationField);
          }
        }
        break;
      case 'max':
        {
          if (aggregationField) {
            category.aggregatedValue = max(category.data, aggregationField);
          }
        }
        break;
      case 'min':
        {
          if (aggregationField) {
            category.aggregatedValue = min(category.data, aggregationField);
          }
        }
        break;
      case 'count':
        category.aggregatedValue = category.data.length;
        break;
    }
  });
};

/**
 * Group items into categories
 *
 * @param items
 * @param categoryGetter
 * @param datePrecision
 * @param dateFormat
 * @returns
 */
const group = <T, K extends CategoryType>(
  items: readonly T[],
  categoryGetter: CategoryGetter<WidgetDataSource, K>,
  datePrecision: QUnitType,
  dateFormat?: string
): Category<T, K>[] => {
  const categories: Category<T, K>[] = [];

  const group = (categoryType: CategoryResult<K>, item: T) => {
    const detailedCategory =
      typeof categoryType === 'object' && !isDate(categoryType);
    if (
      categoryType === null ||
      (detailedCategory && categoryType.key === null)
    ) {
      return;
    }

    let label: null | string = null;
    let count = 1;
    let category: K | UnratedCategoryType;
    if (detailedCategory) {
      category = categoryType.key as K;
      label = categoryType.label;
      count = categoryType.count ?? 1;
    } else {
      category = categoryType;
    }

    const processedCategory = (
      isDate(category) ||
      (typeof category === 'string' && isDateString(category))
        ? dayjs(category).startOf(datePrecision).toDate()
        : category
    ) as K;

    const existingCategory = categories.find((c) =>
      isDate(c.key) && isDate(processedCategory)
        ? c.key.toISOString() === processedCategory.toISOString()
        : c.key === processedCategory
    );

    if (existingCategory) {
      existingCategory.aggregatedValue += count;
      existingCategory.data.push(item);
    } else {
      categories.push({
        aggregatedValue: count,
        sortKey:
          typeof categoryType === 'object' && !isDate(categoryType)
            ? categoryType.sortKey
            : undefined,
        key: processedCategory,
        label: isDate(processedCategory)
          ? dayjs(processedCategory).format(dateFormat)
          : (label ?? String(processedCategory)),
        data: [item],
      });
    }
  };

  items.forEach((item) => {
    const category = categoryGetter(item);

    if (Array.isArray(category)) {
      category.forEach((category) => group(category, item));
    } else {
      group(category, item);
    }
  });

  return categories;
};

/**
 * Sorts categorires
 *
 * @param categories
 * @returns
 */
const sort = <T, K extends CategoryType>(categories: Category<T, K, never>[]) =>
  categories.sort((a, b) => {
    if (a.key === UNRATED) {
      return 1;
    }
    if (b.key === UNRATED) {
      return -1;
    }

    if (isDate(a.key) && isDate(b.key)) {
      return a.key.getTime() - b.key.getTime();
    }

    return String(a.key).localeCompare(String(b.key));
  });
