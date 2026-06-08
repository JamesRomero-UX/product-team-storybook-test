import BadgeList from 'src/components/badge-list';

import { isStringArray } from '@/utils/utils';

import SelectFilter from '../filters/SelectFilter';
import { nullDataChartLabel } from '../nullData';
import type { ReportFieldType } from './types';

export const multiOptions: ReportFieldType = {
  getChartLabel: ({ fieldData, fieldDef }) => {
    const value = fieldData.value;
    if (fieldDef.displayType !== 'multiOptions') {
      throw new Error('multiOptions filed type used out of context');
    }

    return (
      fieldDef.getOptions().find((o) => o.value === String(value))?.label ??
      nullDataChartLabel()
    );
  },
  exportVal: ({ fieldData, fieldDef }) => {
    const value = fieldData.value;
    if (fieldDef.displayType !== 'multiOptions') {
      throw new Error('options filed type used out of context');
    }

    return (
      fieldDef.getOptions().find((o) => o.value === String(value))?.label ?? ''
    );
  },

  cell: ({ fieldDef, fieldData }) => {
    const value = fieldData.value;
    if (fieldDef.displayType !== 'multiOptions') {
      throw new Error('options filed type used out of context');
    }

    if (isStringArray(value)) {
      const values = (value as string[]).map((v) => {
        const label =
          fieldDef.getOptions().find((o) => o.value === String(v))?.label ?? '';

        return label;
      });

      return <BadgeList badges={values ?? []} />;
    } else {
      return <BadgeList badges={[]} />;
    }
  },
  propertyConfig(fieldDef) {
    if (fieldDef.displayType !== 'multiOptions') {
      throw new Error('options filed type used out of context');
    }

    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      operators: ['=', '!='].map((operator) => ({
        operator,
        format: (value) => {
          return (
            fieldDef.getOptions().find((o) => o.value === value)?.label ?? ''
          );
        },
        form: (props) => {
          return <SelectFilter {...props} options={fieldDef.getOptions()} />;
        },
      })),
    };
  },
};
