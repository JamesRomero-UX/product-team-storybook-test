import type {
  ControlElement,
  JsonSchema7,
  VerticalLayout,
} from '@jsonforms/core';
import _ from 'lodash';

import type {
  Conditions,
  CustomAttributeFieldType,
  FormFieldConfigurationInsertInput,
  PutCustomFieldData,
  Token,
} from './field-types/types';
import { fieldTypesConfig } from './types';

export type TypedFormFieldConfiguration = Omit<
  FormFieldConfigurationInsertInput & {
    __typename?: 'form_field_configuration' | undefined;
  },
  'Conditions'
> & {
  Conditions?: Conditions | null;
};

/**
 * Removes a field from the conditions of other fields in the form.
 * Note: does not save changes to the database.
 * @returns FormFieldConfiguration objects that have been modified.
 */
export const removeFieldFromConditions = ({
  deletedFieldId,
  formFieldConfiguration,
}: {
  deletedFieldId: string;
  formFieldConfiguration: TypedFormFieldConfiguration[];
}): (FormFieldConfigurationInsertInput & {
  __typename?: 'form_field_configuration' | undefined;
})[] => {
  const modifiedFieldConfigurations: TypedFormFieldConfiguration[] = [];

  formFieldConfiguration.forEach((field) => {
    if (field.FieldId === deletedFieldId) {
      return;
    }
    const clonedField = _.cloneDeep(field);
    if (clonedField.Conditions) {
      let fieldModified = false;

      const filterToken = (token: Token): boolean => {
        const isDeletedField = token.propertyKey === deletedFieldId;
        if (isDeletedField) {
          fieldModified = true;
        }

        return !isDeletedField;
      };

      clonedField.Conditions.tokenGroups =
        clonedField.Conditions.tokenGroups.filter((tokenGroup) => {
          if ('tokens' in tokenGroup) {
            tokenGroup.tokens = tokenGroup.tokens.filter(filterToken);

            // Remove token groups with no tokens
            return tokenGroup.tokens.length > 0;
          } else {
            return filterToken(tokenGroup);
          }
        });
      if (fieldModified) {
        // No need to have conditions if there are no token groups
        if (clonedField.Conditions.tokenGroups.length === 0) {
          clonedField.Conditions = null;
        }
        modifiedFieldConfigurations.push(clonedField);
      }
    }
  });

  return modifiedFieldConfigurations;
};

export interface JsonSchemaField {
  schema: JsonSchema7;
  control: ControlElement;
  attributeName: string;
}

const toSentenceCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const fieldToJsonSchema = (
  data: PutCustomFieldData,
  attributeName: string,
  type: CustomAttributeFieldType
): JsonSchemaField => {
  if (!data.IsCustomField) {
    throw new Error('Data must be a custom field');
  }
  const schema = fieldTypesConfig[type].toJsonSchema(data);
  schema.description = data.Description ?? '';

  const control: ControlElement = {
    type: 'Control',
    scope: `#/properties/${attributeName}`,
    label: toSentenceCase((data.Label ?? '').trim()),
    options: data.AltLabel
      ? {
          altLabel: data.AltLabel,
        }
      : undefined,
  };

  return {
    attributeName,
    schema,
    control,
  };
};

interface CustomAttributeData {
  Schema: JsonSchema7;
  UiSchema: VerticalLayout;
}

const defaultUiSchema: VerticalLayout = {
  type: 'VerticalLayout',
  elements: [],
};

const addFieldToSchemaData = (
  field: JsonSchemaField,
  data?: CustomAttributeData
): CustomAttributeData => {
  const { schema: controlSchema, control, attributeName } = field;
  const { Schema = {}, UiSchema = defaultUiSchema } = data || {};

  return {
    Schema: {
      ...Schema,
      properties: {
        ...(Schema.properties || {}),
        [attributeName]: controlSchema,
      },
    },
    UiSchema: {
      ...UiSchema,
      elements: addUpdateUiControl(control, UiSchema),
    },
  };
};

const addUpdateUiControl = (
  control: ControlElement,
  uiSchema: VerticalLayout
) => {
  const elements = [...uiSchema.elements];
  const index = uiSchema.elements.findIndex((item) => {
    // uiSchema.elements is UISchemaElement[]; ControlElement is a subtype with .scope — no discriminant for automatic narrowing.
    return ((item as ControlElement).scope || '').indexOf(control.scope) !== -1;
  });
  if (index === -1) {
    elements.push(control);
  } else {
    elements.splice(index, 1, ...[control]);
  }

  return elements;
};

const removeUiControl = (fieldId: string, uiSchema: VerticalLayout) => {
  const elements = [...uiSchema.elements];
  const index = uiSchema.elements.findIndex((item) => {
    return (
      // uiSchema.elements is UISchemaElement[]; ControlElement is a subtype with .scope — no discriminant for automatic narrowing.
      ((item as ControlElement).scope || '').indexOf(
        `#/properties/${fieldId}`
      ) !== -1
    );
  });

  elements.splice(index, 1);

  return elements;
};

export const addFieldToCustomAttributeSchema = (input: {
  data: PutCustomFieldData;
  attributeName: string;
  type: CustomAttributeFieldType;
  customAttributeSchema?: CustomAttributeData;
}) => {
  const { data, attributeName, type, customAttributeSchema } = input;
  const fieldData = fieldToJsonSchema(data, attributeName, type);

  return addFieldToSchemaData(fieldData, customAttributeSchema ?? undefined);
};

const removeFieldFromSchemaData = (
  fieldId: string,
  data?: CustomAttributeData
): CustomAttributeData => {
  const { Schema = {}, UiSchema = defaultUiSchema } = data || {};
  const updatedSchemaProps = { ...(Schema.properties || {}) };
  delete updatedSchemaProps[fieldId];

  return {
    Schema: {
      ...Schema,
      properties: updatedSchemaProps,
      // allows for properties to be flagged as required.
      required: [],
    },
    UiSchema: {
      ...UiSchema,
      elements: removeUiControl(fieldId, UiSchema),
    },
  };
};

export const removeField = (
  fieldId: string,
  customAttributeSchema: CustomAttributeData
): CustomAttributeData => {
  return removeFieldFromSchemaData(fieldId, {
    UiSchema: customAttributeSchema.UiSchema,
    Schema: customAttributeSchema.Schema,
  });
};
