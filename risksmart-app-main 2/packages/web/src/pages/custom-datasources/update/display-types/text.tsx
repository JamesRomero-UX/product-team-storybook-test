import { nullDataChartLabel } from '../nullData';
import type { ReportFieldType } from './types';

export const text: ReportFieldType = {
  asyncOptionSuggestions: true,
  exportVal: ({ fieldData }) => {
    const value = fieldData.value;

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  },
  cell: ({ fieldData }) => {
    const value = fieldData.value;

    return value;
  },
  getChartLabel: ({ fieldData }) => {
    return (fieldData.value as string) ?? nullDataChartLabel();
  },
  propertyConfig(field) {
    return {
      key: field.key,
      groupValuesLabel: field.groupValuesLabel,
      propertyLabel: field.propertyLabel,
      operators: ['=', '!=', ':', '!:'],
    };
  },
};
