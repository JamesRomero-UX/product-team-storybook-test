import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';

import { date } from './date';
import { departmentMultiselect } from './departmentMultiselect';
import { link } from './link';
import { multiselect } from './multiselect';
import { select } from './select';
import { text } from './text';
import { textArea } from './textarea';
import type { FieldTypeConfig } from './types';
import { userMultiselect } from './userMultiselect';

export type FieldTypesConfig = {
  [key in CustomAttributeFieldType]: FieldTypeConfig;
};

export const fieldTypesConfig: FieldTypesConfig = {
  [CustomAttributeFieldType.Text]: text,
  [CustomAttributeFieldType.Date]: date,
  [CustomAttributeFieldType.Textarea]: textArea,
  [CustomAttributeFieldType.Select]: select,
  [CustomAttributeFieldType.MultiSelect]: multiselect,
  [CustomAttributeFieldType.Link]: link,
  [CustomAttributeFieldType.DepartmentMultiSelect]: departmentMultiselect,
  [CustomAttributeFieldType.UserMultiSelect]: userMultiselect,
};
