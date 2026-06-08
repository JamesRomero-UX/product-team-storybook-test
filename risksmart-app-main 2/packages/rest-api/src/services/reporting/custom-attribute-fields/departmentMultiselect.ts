import type { CustomAttributeWithJoinQueryInfo } from './types';

export const departmentMultiselect: CustomAttributeWithJoinQueryInfo<'risksmart.department_type'> =
  {
    pgIdColumn: 'Id',
    pgIdColumnDataType: 'uuid',
    pgLabelColumn: 'Name',
    pgTable: 'risksmart.department_type',
    isArray: true,
  };
