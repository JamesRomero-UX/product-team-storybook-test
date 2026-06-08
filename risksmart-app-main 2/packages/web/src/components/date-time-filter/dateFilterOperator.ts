import type { PropertyFilterOperatorExtended } from '@cloudscape-design/collection-hooks';
import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import dayjs from 'dayjs';

import { getDateRangeFormat } from '@/utils/dateUtils';

import { convertDateRangeValues } from '../../pages/dashboards/widgets/filterHelpers';
import { RelativeDateTimeForm } from './RelativeDateTimeForm';

export const dateRangeFilterOperators: PropertyFilterOperatorExtended<
  null | string
>[] = [
  {
    operator: '=',
    form: RelativeDateTimeForm,
    format: getDateRangeFormat,
    match: (itemValue, tokenValue: null | string) => {
      const tItemValue = itemValue as string;
      const tTokenValue =
        (tokenValue as unknown as DateRangePickerProps.Value) || null;

      const token = convertDateRangeValues(tTokenValue);
      const itemDate = dayjs(tItemValue);

      const isSameDay =
        itemDate.isSame(token.startDate, 'day') ||
        itemDate.isSame(token.endDate, 'day');

      if (isSameDay) {
        return true;
      }

      const isAfterStartDate = itemDate.isAfter(token.startDate, 'day');
      const isBeforeEndDate = itemDate.isBefore(token.endDate, 'day');

      return isAfterStartDate && isBeforeEndDate;
    },
  },
];
