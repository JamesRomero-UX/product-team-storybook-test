import dayjs from 'dayjs';

import { dateRangeFilterOperators } from '@/components/date-time-filter/dateFilterOperator';
import Link from '@/components/link';

import { EMPTY_CELL, toLocalDate, toLocalDateTime } from '../..';
import type { FieldConfig, Header, TableRecord } from '../types';

interface Props<T> {
  header: Header;
  dateField: Extract<keyof T, string>;
  onClick?: (record: T) => void;
  includeTime?: boolean;
  isDateRangeFilter?: boolean;
}

/** Returns a date column configuration for a table.
 * @param header - Header object containing header information.
 * @param dateField - The field in the record that contains the date.
 * @param onClick - Optional click handler for when the date is clicked.
 * @param includeTime - Whether to include time in the display (default is false).
 * @param isDateRangeFilter - Whether to use a date range filter (default is false).
 * @returns A FieldConfig object for the date column.
 **/
export function dateColumnFromConfig<T extends TableRecord>({
  header,
  dateField,
  onClick,
  includeTime = false,
}: Props<T>): FieldConfig<T> {
  return {
    fieldType: 'date',
    ...header,
    cell: (item) => {
      const fieldVal = item[dateField] as string;
      const dateTime =
        (includeTime ? toLocalDateTime(fieldVal) : toLocalDate(fieldVal)) ||
        EMPTY_CELL;

      if (!onClick) {
        return dateTime;
      }

      return <Link onFollow={() => onClick(item)}>{dateTime}</Link>;
    },
    filterOptions: {
      filteringProperties: {
        operators: dateRangeFilterOperators,
      },
    },
    exportVal: (item) =>
      item[dateField]
        ? dayjs(String(item[dateField])).format('DD/MM/YYYY HH:mm')
        : '',
  };
}
