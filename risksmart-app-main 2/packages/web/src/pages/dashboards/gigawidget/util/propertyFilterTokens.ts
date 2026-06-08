import type { TypedPropertyFilterToken } from '@risksmart-app/components/src/table/tableUtils';

import type { Category, CategoryType } from '../types';
import { UNRATED } from '../types';

export const departmentFilter = <T, K extends CategoryType>(
  item: Category<T, K>
): TypedPropertyFilterToken<{ departments: unknown }>[] => {
  return item.key !== UNRATED
    ? [
        {
          propertyKey: 'departments',
          value: item.key,
          operator: ':',
        },
      ]
    : [
        {
          propertyKey: 'departments',
          value: 1,
          operator: '<',
        },
      ];
};
