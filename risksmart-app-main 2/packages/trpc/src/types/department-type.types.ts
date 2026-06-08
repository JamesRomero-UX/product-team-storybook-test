import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getDepartmentTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/department-type.query';

export type DepartmentTypeResponseRow = InferQueryModel<
  'department_type',
  typeof getDepartmentTypesQueryConfig
>;
