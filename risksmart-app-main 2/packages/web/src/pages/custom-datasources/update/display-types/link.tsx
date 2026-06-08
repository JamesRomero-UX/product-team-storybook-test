import Link from '@risksmart-app/components/src/link';

import { nullDataChartLabel } from '../nullData';
import type { ReportFieldType } from './types';

export const link: ReportFieldType = {
  asyncOptionSuggestions: true,
  cell: ({ fieldData }) => {
    const value = fieldData.value;

    return (
      <Link href={value as string} target={'_blank'}>
        {value}
      </Link>
    );
  },
  exportVal: ({ fieldData }) => {
    return (fieldData.value as string) ?? '';
  },
  getChartLabel: ({ fieldData }) => {
    return (fieldData.value as string) ?? nullDataChartLabel();
  },
  propertyConfig(field) {
    return {
      key: field.key,
      groupValuesLabel: field.groupValuesLabel,
      propertyLabel: field.propertyLabel,
      operators: [
        {
          operator: '=',
        },
      ],
    };
  },
};
