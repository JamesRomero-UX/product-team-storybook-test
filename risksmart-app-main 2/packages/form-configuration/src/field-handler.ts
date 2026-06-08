import type { VerticalLayout } from '@jsonforms/core';

import type {
  CreateFieldInput,
  DeleteFieldInput,
  FieldOperationResult,
  FormConfigurationSchema,
  FormFieldConfigurationOutput,
  UpdateFieldInput,
} from './field-handler-types';
import {
  addFieldToCustomAttributeSchema,
  removeField,
  removeFieldFromConditions,
  type TypedFormFieldConfiguration,
} from './field-service';
import { sanitizeHtmlContent } from './html-sanitizer';

const defaultUiSchema: VerticalLayout = {
  type: 'VerticalLayout',
  elements: [],
};

/**
 * Transforms a TypedFormFieldConfiguration to FormFieldConfigurationOutput,
 * ensuring all required fields have non-null values.
 */
function toFormFieldConfiguration(
  field: TypedFormFieldConfiguration
): FormFieldConfigurationOutput {
  return {
    fieldId: field.FieldId || '',
    label: field.Label || '',
    description: field.Description ?? null,
    isRequired: field.Required || false,
    isHidden: field.Hidden || false,
    isReadOnly: field.ReadOnly || false,
    defaultValue: field.DefaultValue ?? null,
    conditions: field.Conditions ?? null,
  };
}

/**
 * Creates a new custom attribute field in the schema.
 * Pure business logic - no GraphQL or database dependencies.
 *
 * @param input - The field creation input
 * @param currentSchema - The current form configuration schema (optional)
 * @returns The updated schema and field configuration
 */
export function createCustomField(
  input: CreateFieldInput,
  currentSchema?: FormConfigurationSchema
): FieldOperationResult {
  const { fieldType, ...fieldData } = input;
  const attributeName = `${Date.now()}_${fieldType}`;
  const fieldId = `CustomAttributeData.${attributeName}`;

  const customAttributeSchema = currentSchema
    ? {
        Schema: currentSchema.schema,
        UiSchema: currentSchema.uiSchema,
      }
    : undefined;

  const sanitizedDescription = input.description
    ? sanitizeHtmlContent(input.description)
    : null;

  const { Schema, UiSchema } = addFieldToCustomAttributeSchema({
    data: {
      IsCustomField: true,
      Label: fieldData.label,
      AltLabel: fieldData.altLabel,
      Description: sanitizedDescription ?? null,
      Options: fieldData.options,
    },
    attributeName,
    type: fieldType,
    customAttributeSchema,
  });

  const fieldConfig: FormFieldConfigurationOutput = {
    fieldId,
    label: fieldData.label,
    description: sanitizedDescription,
    isRequired: fieldData.isRequired,
    isHidden: fieldData.isHidden,
    isReadOnly: fieldData.isReadOnly,
    defaultValue: fieldData.defaultValue,
    conditions: fieldData.conditions,
  };

  return {
    fieldId,
    schema: Schema,
    uiSchema: UiSchema,
    fieldConfigurations: [fieldConfig],
  };
}

/**
 * Updates an existing field configuration.
 * Pure business logic - no GraphQL or database dependencies.
 *
 * @param input - The field update input
 * @param currentSchema - The current form configuration schema
 * @returns The updated schema and field configurations
 */
export function updateCustomField(
  input: UpdateFieldInput,
  currentSchema: FormConfigurationSchema
): FieldOperationResult {
  let Schema = currentSchema.schema ?? {};
  let UiSchema = currentSchema.uiSchema ?? defaultUiSchema;

  const sanitizedDescription = input.description
    ? sanitizeHtmlContent(input.description)
    : null;

  if (input.isCustomField && input.fieldType) {
    const path = input.fieldId.replace('CustomAttributeData.', '');
    const existingField = Schema.properties?.[path];

    if (!existingField) {
      throw new Error(`Field not found: ${input.fieldId}`);
    }

    const { Schema: newSchema, UiSchema: newUiSchema } =
      addFieldToCustomAttributeSchema({
        data: {
          IsCustomField: true,
          Label: input.label,
          AltLabel: input.altLabel,
          Description: sanitizedDescription,
          Options: input.options,
        },
        attributeName: path,
        type: input.fieldType,
        customAttributeSchema: {
          Schema: currentSchema.schema,
          UiSchema: currentSchema.uiSchema,
        },
      });

    Schema = newSchema;
    UiSchema = newUiSchema;
  }

  const fieldConfig: FormFieldConfigurationOutput = {
    fieldId: input.fieldId,
    label: input.label,
    description: sanitizedDescription,
    isRequired: input.isRequired,
    isHidden: input.isHidden,
    isReadOnly: input.isReadOnly,
    defaultValue: input.defaultValue,
    conditions: input.conditions,
  };

  return {
    fieldId: input.fieldId,
    schema: Schema,
    uiSchema: UiSchema,
    fieldConfigurations: [fieldConfig],
  };
}

/**
 * Deletes a field from the schema and updates conditions in other fields.
 * Pure business logic - no GraphQL or database dependencies.
 *
 * @param input - The field deletion input
 * @param currentSchema - The current form configuration schema
 * @param allFieldConfigurations - All existing field configurations
 * @returns The updated schema and field configurations with updated conditions
 */
export function deleteCustomField(
  input: DeleteFieldInput,
  currentSchema: FormConfigurationSchema,
  allFieldConfigurations: FormFieldConfigurationOutput[]
): FieldOperationResult {
  const path = input.fieldId.replace('CustomAttributeData.', '');

  const { Schema, UiSchema } = removeField(path, {
    Schema: currentSchema.schema,
    UiSchema: currentSchema.uiSchema,
  });

  // Update conditions in other fields to remove references to the deleted field
  const typedFieldConfigs: TypedFormFieldConfiguration[] =
    allFieldConfigurations.map(
      (field): TypedFormFieldConfiguration => ({
        FieldId: field.fieldId,
        Label: field.label,
        Description: field.description ?? undefined,
        Required: field.isRequired,
        Hidden: field.isHidden,
        ReadOnly: field.isReadOnly,
        DefaultValue: field.defaultValue ?? undefined,
        Conditions: field.conditions,
      })
    );

  const fieldsWithUpdatedConditions = removeFieldFromConditions({
    formFieldConfiguration: typedFieldConfigs,
    deletedFieldId: input.fieldId,
  });

  const fieldConfigurations: FormFieldConfigurationOutput[] =
    fieldsWithUpdatedConditions.map(toFormFieldConfiguration);

  return {
    fieldId: input.fieldId,
    schema: Schema,
    uiSchema: UiSchema,
    fieldConfigurations,
    fieldsToDelete: [input.fieldId],
  };
}
