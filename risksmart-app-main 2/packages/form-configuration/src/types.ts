import type {
  ControlElement,
  JsonSchema7,
  VerticalLayout,
} from '@jsonforms/core';

import { date } from './field-types/date';
import { departmentMultiselect } from './field-types/departmentMultiselect';
import { link } from './field-types/link';
import { multiselect } from './field-types/multiselect';
import { select } from './field-types/select';
import { text } from './field-types/text';
import { textArea } from './field-types/textarea';
import type { FieldTypeConfig } from './field-types/types';
import { CustomAttributeFieldType } from './field-types/types';
import { userMultiselect } from './field-types/userMultiselect';

export type Tagged<T extends string, U> = { _tag: T } & U;
interface Option {
  Value: string;
  GeneratedId: `${string}-${string}-${string}-${string}-${string}`;
}
export type StringOption = Tagged<'StringOption', Option>;
export type AltValueOption = Tagged<
  'AltValueOption',
  Option & { AltValue: string }
>;
export type FormFieldOption = StringOption | AltValueOption;

export interface JsonSchemaField {
  schema: JsonSchema7;
  control: ControlElement;
  attributeName: string;
}

export interface CustomAttributeData {
  Schema: JsonSchema7;
  UiSchema: VerticalLayout;
}

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
