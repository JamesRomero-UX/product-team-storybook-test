import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';

import { departmentMultiselect } from './departmentMultiselect';
import type { CustomAttributeWithJoinQueryInfoBasic } from './types';
import { userMultiselect } from './userMultiselect';

export const customAttributeQueryInfo: {
  [key in CustomAttributeFieldType]: CustomAttributeWithJoinQueryInfoBasic;
} = {
  [CustomAttributeFieldType.DepartmentMultiSelect]: departmentMultiselect,
  [CustomAttributeFieldType.UserMultiSelect]: userMultiselect,
  [CustomAttributeFieldType.Date]: { pgIdColumnDataType: 'text' },
  [CustomAttributeFieldType.Link]: { pgIdColumnDataType: 'text' },
  [CustomAttributeFieldType.MultiSelect]: { pgIdColumnDataType: 'jsonb' },
  [CustomAttributeFieldType.Select]: { pgIdColumnDataType: 'text' },
  [CustomAttributeFieldType.Text]: { pgIdColumnDataType: 'text' },
  [CustomAttributeFieldType.Textarea]: { pgIdColumnDataType: 'text' },
};
