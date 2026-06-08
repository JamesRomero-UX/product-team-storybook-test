import type { QUnitType } from 'dayjs';
import dayjs from 'dayjs';
import { isDate } from 'lodash';
import { useMemo } from 'react';

import type {
  Category,
  CategoryType,
  DataSourceItem,
  DateFilterOptions,
  UnratedCategoryType,
  WidgetDataSource,
} from '../types';

function interpolateDates(
  startDate: Date,
  endDate: Date,
  precision: QUnitType
): Date[] {
  const interpolatedDates = [];
  let currentDate = dayjs(startDate);
  if (dayjs(startDate).isAfter(endDate)) {
    return [];
  }

  while (!currentDate.isAfter(endDate)) {
    interpolatedDates.push(currentDate.toDate());
    currentDate = currentDate.add(1, precision);
  }

  return interpolatedDates;
}

export const useXDomain = <
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
>(
  categories: Category<
    DataSourceItem<TDataSource>,
    TCategory | UnratedCategoryType
  >[],
  dateFilterOptions?: DateFilterOptions<TDataSource>
) => {
  const datePrecision = dateFilterOptions?.precision ?? 'day';

  const categoryInfo = useMemo<{
    isDateChart: boolean;
    startDate: Date;
    endDate: Date;
  }>(() => {
    let isDateChart = true;
    let startDate = dayjs().add(100, 'year').toDate();
    let endDate = dayjs().add(-100, 'year').toDate();
    for (const category of categories) {
      if (!isDate(category.key)) {
        isDateChart = false;
        break;
      }
      if (category.key < startDate) {
        startDate = category.key;
      }
      if (category.key > endDate) {
        endDate = category.key;
      }
    }

    return {
      isDateChart,
      startDate,
      endDate,
    };
  }, [categories]);

  const xDomain = useMemo(() => {
    if (!categoryInfo.isDateChart || categories.length < 1) {
      return undefined;
    }

    return interpolateDates(
      categoryInfo.startDate,
      categoryInfo.endDate,
      datePrecision
    );
  }, [
    categoryInfo.isDateChart,
    categoryInfo.startDate,
    categoryInfo.endDate,
    categories.length,
    datePrecision,
  ]);

  if (!categoryInfo.isDateChart) {
    return undefined;
  }

  return xDomain;
};
