import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getDepartmentGroupTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/department-group-type.query';

export type DepartmentGroupTypeListResponseRow = InferQueryModel<
  'department_type_group',
  typeof getDepartmentGroupTypesQueryConfig
>;

export interface DepartmentGroupTypeByIdResponse {
  departmentGroupType: DepartmentGroupTypeListResponseRow;
}
