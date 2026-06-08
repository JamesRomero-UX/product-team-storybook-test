import type { JsonSchema7, VerticalLayout } from '@jsonforms/core';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';

import type { Conditions } from './field-types/types';

export class FormFieldOperationError extends Error {
  public readonly name = 'FormFieldOperationError';

  constructor(
    public readonly code:
      | 'CUSTOM_ATTRIBUTE_SCHEMA_NOT_FOUND'
      | 'FIELD_NOT_FOUND'
      | 'INVALID_FIELD_TYPE',
    message: string
  ) {
    super(message);
  }
}

export interface PersistFormFieldConfigurationInput {
  FieldId: string;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  DefaultValue?: string | null;
  Label?: string | null;
  Description?: string | null;
  Conditions?: Conditions | null;
}

export interface PersistFormFieldConfigurationArgs {
  schemaId: string;
  parentType: ParentType;
  formFieldConfigurations:
    | PersistFormFieldConfigurationInput
    | PersistFormFieldConfigurationInput[];
  schema: JsonSchema7;
  uiSchema: VerticalLayout;
  fieldsToDelete: string[];
}

export type PersistFormFieldConfiguration = (
  args: PersistFormFieldConfigurationArgs
) => Promise<void>;

export interface CustomAttributeSchemaState {
  id: string;
  schema: JsonSchema7;
  uiSchema: VerticalLayout;
}
