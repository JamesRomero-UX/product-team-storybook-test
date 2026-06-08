import { UserSelectFilter } from '../filters/UserSelectFilter';
import type { ReportFieldType } from './types';

export const users: ReportFieldType = {
  getChartLabel: () => {
    throw new Error('users field type used out of context');
  },
  exportVal: () => {
    throw new Error('users field type used out of context');
  },

  cell: () => {
    throw new Error('users field type used out of context');
  },
  propertyConfig(fieldDef, _helpers, filteringData) {
    if (fieldDef.displayType !== 'users') {
      throw new Error('users filed type used out of context');
    }

    const defaultOperator = fieldDef.multiple ? ':' : '=';
    const supportedOperators = fieldDef.multiple ? [':', '!:'] : ['=', '!='];

    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      defaultOperator,
      operators: supportedOperators.map((operator) => ({
        operator,
        format: (value: string) => {
          const userGroup = filteringData.userGroups.find(
            (o) => o.Id === value
          )?.Name;
          if (userGroup) {
            return userGroup;
          }

          return (
            filteringData.users.find((o) => o.Id === value)?.FriendlyName ?? ''
          );
        },
        match: (rowValues: unknown, filterValue: string) => {
          if (Array.isArray(rowValues)) {
            return rowValues.find((r) => r.value === filterValue);
          }
          if (
            typeof rowValues === 'object' &&
            rowValues &&
            'value' in rowValues
          ) {
            return rowValues.value === filterValue;
          }

          return false;
        },

        form: (props) => <UserSelectFilter {...props} />,
      })),
    };
  },
};
