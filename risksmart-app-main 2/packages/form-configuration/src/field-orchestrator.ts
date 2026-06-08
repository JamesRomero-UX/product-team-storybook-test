import type { VerticalLayout } from '@jsonforms/core';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';

import {
  createCustomField,
  deleteCustomField,
  updateCustomField,
} from './field-handler';
import type {
  CreateFieldInput,
  DeleteFieldInput,
  FormFieldConfigurationOutput,
} from './field-handler-types';
import type {
  CustomAttributeSchemaState,
  PersistFormFieldConfiguration,
  PersistFormFieldConfigurationInput,
} from './field-persistence';
import { FormFieldOperationError } from './field-persistence';
import type {
  Conditions,
  CustomAttributeFieldType,
  Option,
} from './field-types/types';
import { isCustomAttributeFieldType } from './field-types/types';
import { sanitizeNullableHtmlContent } from './html-sanitizer';

const defaultUiSchema: VerticalLayout = {
  type: 'VerticalLayout',
  elements: [],
};

const toPersistInput = (
  input: FormFieldConfigurationOutput
): PersistFormFieldConfigurationInput => {
  return {
    FieldId: input.fieldId,
    ReadOnly: input.isReadOnly,
    Required: input.isRequired,
    Hidden: input.isHidden,
    DefaultValue: input.defaultValue ?? null,
    Label: input.label,
    Description: input.description ?? null,
    Conditions: input.conditions ?? null,
  };
};

const oneOrMany = <T>(items: T[]): T | T[] => {
  if (items.length === 1) {
    return items[0]!;
  }

  return items;
};

const parseCustomAttributeFieldTypeFromFieldId = (
  fieldId: string
): CustomAttributeFieldType => {
  const path = fieldId.replace('CustomAttributeData.', '');
  const type = path.split('_')[1];

  if (!type || !isCustomAttributeFieldType(type)) {
    throw new FormFieldOperationError(
      'INVALID_FIELD_TYPE',
      `Field type is invalid ${type}`
    );
  }

  return type;
};

export const createFieldAndPersist = async (input: {
  field: CreateFieldInput;
  currentCustomAttributeSchema: CustomAttributeSchemaState | null;
  generateSchemaId: () => string;
  persist: PersistFormFieldConfiguration;
}): Promise<{ fieldId: string }> => {
  const result = createCustomField(
    input.field,
    input.currentCustomAttributeSchema ?? undefined
  );

  const schemaId =
    input.currentCustomAttributeSchema?.id ?? input.generateSchemaId();

  const persistInput = result.fieldConfigurations.map(toPersistInput);

  await input.persist({
    schemaId,
    parentType: input.field.parentType,
    formFieldConfigurations: oneOrMany(persistInput),
    schema: result.schema,
    uiSchema: result.uiSchema,
    fieldsToDelete: [],
  });

  return { fieldId: result.fieldId };
};

export const updateFieldAndPersist = async (input: {
  field:
    | {
        fieldId: string;
        parentType: ParentType;
        isCustomField: true;
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
    | {
        fieldId: string;
        parentType: ParentType;
        isCustomField: false;
        label?: string | null;
        description?: string | null;
        isRequired: boolean;
        isHidden: boolean;
        isReadOnly: boolean;
        defaultValue?: string | null;
        conditions?: Conditions | null;
      };
  currentCustomAttributeSchema: CustomAttributeSchemaState | null;
  generateSchemaId: () => string;
  persist: PersistFormFieldConfiguration;
}): Promise<{ fieldId: string }> => {
  const schemaId =
    input.currentCustomAttributeSchema?.id ?? input.generateSchemaId();

  // If there is no schema, we still need to persist something (legacy behaviour)
  // so keep empty defaults unless we're updating a custom field (which requires a schema).
  let schema = input.currentCustomAttributeSchema?.schema ?? {};
  let uiSchema =
    input.currentCustomAttributeSchema?.uiSchema ?? defaultUiSchema;

  let formFieldConfigurations:
    | PersistFormFieldConfigurationInput
    | PersistFormFieldConfigurationInput[];

  if (input.field.isCustomField) {
    if (!input.currentCustomAttributeSchema) {
      throw new FormFieldOperationError(
        'CUSTOM_ATTRIBUTE_SCHEMA_NOT_FOUND',
        'Custom attribute schema not found'
      );
    }

    const path = input.field.fieldId.replace('CustomAttributeData.', '');
    const existingField = schema.properties?.[path];
    if (!existingField) {
      throw new FormFieldOperationError(
        'FIELD_NOT_FOUND',
        `Field not found: ${input.field.fieldId}`
      );
    }

    const fieldType = parseCustomAttributeFieldTypeFromFieldId(
      input.field.fieldId
    );

    const result = updateCustomField(
      {
        fieldId: input.field.fieldId,
        parentType: input.field.parentType,
        isCustomField: input.field.isCustomField,
        label: input.field.label,
        altLabel: input.field.altLabel,
        description: input.field.description,
        options: input.field.options,
        isRequired: input.field.isRequired,
        isHidden: input.field.isHidden,
        isReadOnly: input.field.isReadOnly,
        defaultValue: input.field.defaultValue,
        conditions: input.field.conditions,
        fieldType,
      },
      input.currentCustomAttributeSchema
    );

    schema = result.schema;
    uiSchema = result.uiSchema;
    formFieldConfigurations = oneOrMany(
      result.fieldConfigurations.map(toPersistInput)
    );
  } else {
    const sanitizedDescription = sanitizeNullableHtmlContent(
      input.field.description
    );

    formFieldConfigurations = {
      FieldId: input.field.fieldId,
      ReadOnly: input.field.isReadOnly,
      Required: input.field.isRequired,
      Hidden: input.field.isHidden,
      DefaultValue: input.field.defaultValue ?? null,
      Label: input.field.label ?? null,
      Description: sanitizedDescription,
      Conditions: input.field.conditions ?? null,
    };
  }

  await input.persist({
    schemaId,
    parentType: input.field.parentType,
    formFieldConfigurations,
    schema,
    uiSchema,
    fieldsToDelete: [],
  });

  return { fieldId: input.field.fieldId };
};

export const deleteFieldAndPersist = async (input: {
  field: DeleteFieldInput;
  currentCustomAttributeSchema: CustomAttributeSchemaState | null;
  allFieldConfigurations: FormFieldConfigurationOutput[];
  persist: PersistFormFieldConfiguration;
}): Promise<{ fieldId: string }> => {
  if (!input.currentCustomAttributeSchema) {
    throw new FormFieldOperationError(
      'CUSTOM_ATTRIBUTE_SCHEMA_NOT_FOUND',
      'Custom attribute schema not found'
    );
  }

  const result = deleteCustomField(
    input.field,
    input.currentCustomAttributeSchema,
    input.allFieldConfigurations
  );

  await input.persist({
    schemaId: input.currentCustomAttributeSchema.id,
    parentType: input.field.parentType,
    formFieldConfigurations: result.fieldConfigurations.map(toPersistInput),
    schema: result.schema,
    uiSchema: result.uiSchema,
    fieldsToDelete: result.fieldsToDelete ?? [input.field.fieldId],
  });

  return { fieldId: input.field.fieldId };
};

export { FormFieldOperationError };
