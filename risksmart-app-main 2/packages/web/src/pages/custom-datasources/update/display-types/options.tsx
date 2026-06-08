import SelectFilter from '../filters/SelectFilter';
import { nullDataChartLabel } from '../nullData';
import type { ReportFieldType } from './types';

export const options: ReportFieldType = {
  getChartLabel: ({ fieldData, fieldDef }) => {
    const value = fieldData.value;
    if (fieldDef.displayType !== 'options') {
      throw new Error('options filed type used out of context');
    }

    return (
      fieldDef.getOptions().find((o) => o.value === String(value))?.label ??
      nullDataChartLabel()
    );
  },
  exportVal: ({ fieldData, fieldDef }) => {
    const value = fieldData.value;
    if (fieldDef.displayType !== 'options') {
      throw new Error('options filed type used out of context');
    }

    return (
      fieldDef.getOptions().find((o) => o.value === String(value))?.label ?? ''
    );
  },

  cell: ({ fieldDef, fieldData }) => {
    const value = fieldData.value;
    if (fieldDef.displayType !== 'options') {
      throw new Error('options filed type used out of context');
    }

    return fieldDef.getOptions().find((o) => o.value === String(value))?.label;
  },
  propertyConfig(fieldDef) {
    if (fieldDef.displayType !== 'options') {
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
