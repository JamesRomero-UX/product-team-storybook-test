import BadgeList from 'src/components/badge-list';

import { nullDataChartLabel } from '../nullData';
import type { ReportFieldType } from './types';

export const badgeList: ReportFieldType = {
  asyncOptionSuggestions: true,
  cell: ({ fieldData }) => {
    const value = fieldData.value;

    return <BadgeList badges={value as string[]} />;
  },
  exportVal: ({ fieldData }) => {
    return (fieldData.value as string[]).join(',') ?? '';
  },
  getChartLabel: ({ fieldData }) => {
    const value = fieldData.value as null | string;
    if (!value) {
      return nullDataChartLabel();
    }

    return value;
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
