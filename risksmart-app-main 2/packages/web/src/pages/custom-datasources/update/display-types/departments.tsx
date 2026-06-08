import SelectFilter from '../filters/SelectFilter';
import type { ReportFieldType } from './types';

export const departments: ReportFieldType = {
  getChartLabel: () => {
    throw new Error('departments field type used out of context');
  },
  exportVal: () => {
    throw new Error('departments field type used out of context');
  },

  cell: () => {
    throw new Error('departments field type used out of context');
  },
  propertyConfig(fieldDef, _helpers, filteringData) {
    if (fieldDef.displayType !== 'departments') {
      throw new Error('departments field type used out of context');
    }

    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      defaultOperator: ':',
      operators: [':', '!:'].map((operator) => ({
        operator,
        format: (value) => {
          return (
            filteringData.departmentTypes.find(
              (o) => o.DepartmentTypeId === value
            )?.Name ?? ''
          );
        },
        match: (rowValues: unknown, filterValue: string) =>
          Array.isArray(rowValues) &&
          rowValues.find((r) => r.DepartmentTypeId === filterValue),

        form: (props) => (
          <SelectFilter
            {...props}
            options={filteringData.departmentTypes.map((department) => ({
              value: department.DepartmentTypeId!,
              label: department.Name!,
            }))}
          />
        ),
      })),
    };
  },
};
