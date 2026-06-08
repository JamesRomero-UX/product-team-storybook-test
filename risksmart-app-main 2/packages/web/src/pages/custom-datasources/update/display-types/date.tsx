import dayjs from 'dayjs';
import { dateFormats } from 'src/pages/dashboards/universal-widget/util';

import { DateTimeForm } from '@/components/date-time-filter/DateTimeForm';
import { toLocalDate } from '@/utils/dateUtils';

import { nullDataChartLabel } from '../nullData';
import type { CellInfo, ReportFieldType } from './types';

const getText = ({ fieldData }: CellInfo): null | string => {
  const value = fieldData.value;
  if (!value) {
    return null;
  }

  return toLocalDate(value as string);
};

export const date: ReportFieldType = {
  cell: getText,
  exportVal: (cellData) => getText(cellData) ?? '',
  getChartLabel: ({ fieldData, fieldDef, groupByDatePrecision }) => {
    if (fieldDef.dataType !== 'date') {
      throw new Error(`Incorrect field type date`);
    }
    const value = fieldData.value as null | string;
    if (!value) {
      return nullDataChartLabel();
    }

    return dayjs(value).format(dateFormats[groupByDatePrecision ?? 'day']);
  },
  propertyConfig(field) {
    return {
      key: field.key,
      groupValuesLabel: field.groupValuesLabel,
      propertyLabel: field.propertyLabel,
      operators: ['<', '>', '<=', '>=', '=', '!='].map((operator) => ({
        operator,
        form: DateTimeForm,
        format: (value) => {
          if (!value) {
            return '';
          }

          return toLocalDate(value);
        },
      })),
      defaultOperator: '>',
    };
  },
};
