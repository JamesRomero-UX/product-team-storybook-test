import type { DataType } from '@risksmart-app/shared/reporting/datasets/types';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { dateFormats } from '../universal-widget/util';

type Precision = 'day' | 'month' | 'year';

function interpolateDates(
  startDate: Date,
  endDate: Date,
  precision: 'day' | 'month' | 'year'
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

/**
 * Returns a suitable x domain value for the bar chart.
 * Only used for date based axis, to interpolate date values missing in the data set
 * @param param0
 * @returns
 */
export const useXDomain = ({
  datePrecision,
  dataType,
  xAxisData,
}: {
  datePrecision?: null | Precision;
  dataType: DataType;
  xAxisData: (Date | number | string)[];
}): string[] | undefined => {
  const axisInfo = useMemo<{
    startDate: Date;
    endDate: Date;
  }>(() => {
    let startDate = dayjs().add(100, 'year').toDate();
    let endDate = dayjs().add(-100, 'year').toDate();
    if (dataType === 'date') {
      for (const dataItem of xAxisData) {
        if (!dataItem) {
          continue;
        }
        const date = new Date(dataItem);
        if (date < startDate) {
          startDate = date;
        }
        if (date > endDate) {
          endDate = date;
        }
      }
    }

    return {
      startDate,
      endDate,
    };
  }, [dataType, xAxisData]);

  const xDomain = useMemo(() => {
    if (dataType !== 'date' || xAxisData.length === 0) {
      return undefined;
    }

    return interpolateDates(
      axisInfo.startDate,
      axisInfo.endDate,
      datePrecision ?? 'day'
    ).map((value) => dayjs(value).format(dateFormats[datePrecision ?? 'day']));
  }, [
    dataType,
    xAxisData.length,
    axisInfo.startDate,
    axisInfo.endDate,
    datePrecision,
  ]);

  return xDomain;
};
