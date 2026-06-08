import type { QueryConfig } from '../db';

export const getDepartmentGroupTypesQueryConfig = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'department_type_group'>;
