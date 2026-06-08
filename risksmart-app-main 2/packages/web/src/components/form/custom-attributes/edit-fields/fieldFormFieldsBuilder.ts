import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';

import type { FieldFormFields } from './fieldSchema';

const defaultFieldFormFields: FieldFormFields = {
  IsCustomField: false,
  Label: 'Field 1',
  Description: '',
  Required: false,
  Hidden: false,
  ReadOnly: false,
  DefaultValue: '',
  EnableCustomLabel: false,
};

const defaultCustomFieldFormFields: FieldFormFields = {
  IsCustomField: true,
  CustomFieldLabel: 'Custom Field 1',
  CustomFieldType: CustomAttributeFieldType.Text,
  CustomFieldOptions: [],
  CustomFieldShowAltValues: false,
  Description: '',
  Required: false,
  Hidden: false,
  ReadOnly: false,
  DefaultValue: '',
  EnableCustomLabel: false,
};

export const buildFieldFormFields = (
  overrides: Partial<FieldFormFields>
): FieldFormFields =>
  ({
    ...(overrides.IsCustomField
      ? defaultCustomFieldFormFields
      : defaultFieldFormFields),
    ...overrides,
  }) as FieldFormFields;
