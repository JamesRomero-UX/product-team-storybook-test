import type { JsonSchema7, VerticalLayout } from '@jsonforms/core';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';

import type {
  Conditions,
  CustomAttributeFieldType,
  Option,
} from './field-types/types';

/**
 * Input data for creating a new custom attribute field.
 * Decoupled from GraphQL types.
 */
export interface CreateFieldInput {
  parentType: ParentType;
  fieldType: CustomAttributeFieldType;
  label: string;
  altLabel?: string;
  description?: string | null;
  options: Option[];
  isRequired: boolean;
  isHidden: boolean;
  isReadOnly: boolean;
  defaultValue?: string | null;
  conditions?: Conditions | null;
}

/**
 * Input data for updating an existing field.
 * Decoupled from GraphQL types.
 */
export interface UpdateFieldInput {
  fieldId: string;
  parentType: ParentType;
  isCustomField: boolean;
  label: string;
  altLabel?: string;
  description?: string | null;
  options: Option[];
  isRequired: boolean;
  isHidden: boolean;
  isReadOnly: boolean;
  defaultValue?: string | null;
  conditions?: Conditions | null;
  fieldType?: CustomAttributeFieldType;
}

/**
 * Input data for deleting a field.
 * Decoupled from GraphQL types.
 */
export interface DeleteFieldInput {
  fieldId: string;
  parentType: ParentType;
}

/**
 * Represents the current form configuration schema.
 * Decoupled from GraphQL types.
 */
export interface FormConfigurationSchema {
  id: string;
  schema: JsonSchema7;
  uiSchema: VerticalLayout;
}

/**
 * Field configuration to be persisted.
 * Decoupled from GraphQL types.
 */
export interface FormFieldConfigurationOutput {
  fieldId: string;
  label: string;
  description?: string | null;
  isRequired: boolean;
  isHidden: boolean;
  isReadOnly: boolean;
  defaultValue?: string | null;
  conditions?: Conditions | null;
}

/**
 * Result of a field operation.
 * Decoupled from GraphQL types.
 */
export interface FieldOperationResult {
  fieldId: string;
  schema: JsonSchema7;
  uiSchema: VerticalLayout;
  fieldConfigurations: FormFieldConfigurationOutput[];
  fieldsToDelete?: string[];
}
