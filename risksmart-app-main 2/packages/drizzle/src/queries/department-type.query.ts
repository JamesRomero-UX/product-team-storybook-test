import type { QueryConfig } from '../db';

export const getDepartmentTypesQueryConfig = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'department_type'>;
