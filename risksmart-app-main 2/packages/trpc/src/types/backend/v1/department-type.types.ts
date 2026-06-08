import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getDepartmentTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/department-type.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type DepartmentTypeListResponseRow = InferQueryModel<
  'department_type',
  typeof getDepartmentTypesQueryConfig
>;

export interface DepartmentTypeByIdResponse {
  departmentType: DepartmentTypeListResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
