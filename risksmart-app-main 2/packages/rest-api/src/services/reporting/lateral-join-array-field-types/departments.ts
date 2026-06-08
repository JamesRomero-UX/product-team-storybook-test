import { createLateralJoinArrayFieldQueryInfo } from './types';

export const departmentsQueryInfo = createLateralJoinArrayFieldQueryInfo({
  objectTable: 'risksmart.department_type',
  manyToManyTable: 'risksmart.department',
  objectTableJoinCol: 'Id',
  manyToManyJoinCol: 'DepartmentTypeId',
  objectTableQueryCol: 'Name',
  manyToManyPk: 'ParentId',
});
