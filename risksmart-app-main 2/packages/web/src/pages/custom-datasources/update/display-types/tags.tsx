import SelectFilter from '../filters/SelectFilter';
import type { ReportFieldType } from './types';

export const tags: ReportFieldType = {
  getChartLabel: () => {
    throw new Error('tags field type used out of context');
  },
  exportVal: () => {
    throw new Error('tags field type used out of context');
  },

  cell: () => {
    throw new Error('tags field type used out of context');
  },
  propertyConfig(fieldDef, _helpers, filteringData) {
    if (fieldDef.displayType !== 'tags') {
      throw new Error('tags field type used out of context');
    }

    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      defaultOperator: ':',
      operators: [':', '!:'].map((operator) => ({
        operator,
        format: (value) =>
          filteringData.tagTypes.find((o) => o.TagTypeId === value)?.Name ?? '',

        match: (rowValues: unknown, filterValue: string) =>
          Array.isArray(rowValues) &&
          rowValues.find((r) => r.TagTypeId === filterValue),

        form: (props) => (
          <SelectFilter
            {...props}
            options={filteringData.tagTypes.map((tag) => ({
              value: tag.TagTypeId!,
              label: tag.Name!,
            }))}
          />
        ),
      })),
    };
  },
};
