import type {
  PropertyFilterQuery,
  PropertyFilterToken,
} from '@cloudscape-design/collection-hooks';
import type { JsonSchema7 } from '@jsonforms/core';
import { RuleEffect } from '@jsonforms/core';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand/index';

import { handleError } from '../../utils/errorUtils';
import { defaultFieldConfigData } from '../form-configs/field';
import type {
  CustomSchema,
  CustomSchemaProperties,
  CustomSchemaProperty,
  CustomUISchemaElement,
  FieldConfigData,
  FieldSelectOption,
  FormBuilderAction,
} from '../types';
import { emptyPropertyFilterQuery } from '../types';
import { FieldOptionType } from '../types';
import {
  buildConditionallyRequiredSchemaConditions,
  isOptionsField,
  pruneRemovedSelectOptionsWithConditionalLogic,
  removedSelectOptionIds,
  supportsConditionalLogic,
} from '../utils';
import { useFormBuilderStore } from './useFormBuilderStore';

interface FormBuilderFieldState {
  currentFieldId: string;
  setCurrentFieldId: (currentFieldId: string) => void;

  isEditingField: boolean;
  setIsEditingField: (isEditingField: boolean) => void;

  formFieldModalAction: FormBuilderAction | null;
  setFormFieldModalAction: (action: FormBuilderAction | null) => void;

  fieldConfigData: FieldConfigData;
  setFieldConfigData: (fieldConfigData: FieldConfigData) => void;

  parentId: string;
  setParentId: (parentId: string) => void;
}

interface FormBuilderFieldActions {
  addNewField: (fieldConfigData: FieldConfigData, parentId: string) => void;
  updateField: (
    fieldConfigData: FieldConfigData,
    currentFieldId: string,
    parentId: string
  ) => void;
  deleteField: (currentFieldId: string, parentId: string) => void;
}

const addOrUpdateSchema = ({
  fieldType,
  isPropertyRequired,
  isConditional,
  allowAttachments,
  conditionalOptions,
  selectOptions,
}: FieldConfigData) => {
  const canHaveOptions = isOptionsField(fieldType);
  const isMultiselect = fieldType === FieldOptionType.Multiselect;
  const isUnconditionallyRequired = isPropertyRequired && !isConditional;

  const options =
    canHaveOptions && selectOptions?.length
      ? (selectOptions.map((option) => ({
          const: option.generatedId,
          title: option.value,
        })) as JsonSchema7[])
      : undefined;

  const unconditionallyRequiredListSchema = isUnconditionallyRequired
    ? { minItems: 1 }
    : {};

  const multiSelectSchemaProperties = {
    uniqueItems: true,
    ...unconditionallyRequiredListSchema,
    ...(options ? { items: { oneOf: options } } : {}),
  };

  const radioAndDropdownSchemaProperties = {
    ...(options
      ? { oneOf: options, ...unconditionallyRequiredListSchema }
      : {}),
  };

  const genericSchemaProperties = {
    type: isMultiselect ? 'array' : 'string',
    ...(isUnconditionallyRequired && !canHaveOptions ? { minLength: 1 } : {}),
    isCustomisable: true,
    isConditional: isConditional,
    allowAttachments: allowAttachments,
    conditionalOptions: isConditional
      ? conditionalOptions
      : emptyPropertyFilterQuery,
  };

  return {
    ...(isMultiselect ? multiSelectSchemaProperties : {}),
    ...(supportsConditionalLogic(fieldType)
      ? radioAndDropdownSchemaProperties
      : {}),
    ...genericSchemaProperties,
  };
};

const addOrUpdateUISchema = ({
  fieldConfigData,
  schema,
}: {
  fieldConfigData: FieldConfigData;
  schema: CustomSchema;
}) => {
  const { isConditional, fieldType, fieldTitle, placeholder, description } =
    fieldConfigData;
  const conditionalOptions: PropertyFilterQuery =
    fieldConfigData?.conditionalOptions || emptyPropertyFilterQuery;

  const ruleSchema = {
    properties: {
      ...(isConditional &&
        conditionalOptions.tokens.reduce(
          (
            acc: { [p: string]: { enum: string[] } },
            token: PropertyFilterToken
          ) => {
            if (!token?.propertyKey) {
              handleError(
                new Error(
                  'useFormBuilderFieldStore: No property key found when creating rule schema'
                )
              );

              return acc;
            }

            const options = schema.properties?.[token.propertyKey]?.oneOf;

            if (!options) {
              handleError(
                new Error(
                  `useFormBuilderFieldStore: No options found for property key ${token.propertyKey}`
                )
              );

              return acc;
            }

            const tokenValuesById: string[] = token.value.map(
              (tokenValue: string) => {
                return (
                  options.find((item: FieldSelectOption) => {
                    // return item.title === tokenValue;
                    return item.const === tokenValue;
                  })?.const || ''
                );
              }
            );

            return {
              ...acc,
              [token.propertyKey]: {
                enum: tokenValuesById,
              },
            };
          },
          {}
        )),
    },
    required: [
      ...(isConditional
        ? conditionalOptions.tokens.map(
            (token) => token.propertyKey ?? 'unknown'
          )
        : []),
    ],
  };

  return {
    label: fieldTitle,
    options: {
      fieldType,
      placeholder,
      description,
    },
    ...(isConditional
      ? {
          rule: {
            effect: RuleEffect.SHOW,
            condition: {
              scope: '#',
              failWhenUndefined: true,
              schema: ruleSchema,
            },
          },
        }
      : {}),
  };
};

export type FormBuilderFieldStore = FormBuilderFieldState &
  FormBuilderFieldActions;

export const useFormBuilderFieldStore = create<FormBuilderFieldStore>(
  (set) => ({
    currentFieldId: '',
    setCurrentFieldId: (currentFieldId) => set({ currentFieldId }),

    isEditingField: false,
    setIsEditingField: (isEditingField: boolean) => set({ isEditingField }),

    formFieldModalAction: null,
    setFormFieldModalAction: (formFieldModalAction: FormBuilderAction | null) =>
      set({ formFieldModalAction }),

    fieldConfigData: defaultFieldConfigData,
    setFieldConfigData: (fieldConfigData: FieldConfigData) =>
      set({ fieldConfigData }),

    parentId: '',
    setParentId: (parentId: string) => set({ parentId }),

    addNewField: (fieldConfigData: FieldConfigData, parentId: string) => {
      const { schema, setSchema, uiSchema, setUISchema } =
        useFormBuilderStore.getState();

      const uuid = `field_${uuidv4()}`;
      const { isPropertyRequired, isConditional } = fieldConfigData;
      const isUnconditionallyRequired = isPropertyRequired && !isConditional;

      const schemaConditions = buildConditionallyRequiredSchemaConditions({
        fieldConfigData,
        fieldId: uuid,
      });

      // Add new field to the schema
      const modifiedSchema = {
        ...schema,
        properties: {
          ...schema.properties,
          [uuid]: {
            parentId,
            ...addOrUpdateSchema(fieldConfigData),
          },
        },
        required: [
          ...(schema?.required || []),
          ...(isUnconditionallyRequired ? [uuid] : []),
        ],
        // Only include allOf if there are conditions
        allOf: schemaConditions.length > 0 ? schemaConditions : undefined,
      } as CustomSchema;

      if (modifiedSchema.allOf === undefined) {
        delete modifiedSchema.allOf;
      }

      setSchema(modifiedSchema);

      // Iterate through all the sections (found in the elements array of the UI Schema)
      // and add the field to the section being edited
      const modifiedUISchemaElementsCopy = uiSchema.elements.map(
        (element: CustomUISchemaElement) => {
          if (element.id === parentId) {
            return {
              ...element,
              elements: [
                ...(element?.elements || []),
                {
                  type: 'Control',
                  id: uuid,
                  parentId,
                  scope: `#/properties/${uuid}`,
                  ...addOrUpdateUISchema({
                    fieldConfigData,
                    schema: useFormBuilderStore.getState().schema,
                  }),
                },
              ],
            };
          }

          return element;
        }
      );

      // Update the UI Schema with the list of modified sections
      setUISchema({
        ...uiSchema,
        elements: modifiedUISchemaElementsCopy,
      });
    },

    updateField: (fieldConfigData, currentFieldId, parentId) => {
      const { schema, setSchema, uiSchema, setUISchema } =
        useFormBuilderStore.getState();
      const { isPropertyRequired, isConditional, fieldType, selectOptions } =
        fieldConfigData;
      const isUnconditionallyRequired = isPropertyRequired && !isConditional;

      if (!schema?.properties) {
        handleError(
          new Error('useFormBuilderFieldStore: No properties found in schema')
        );

        return;
      }

      const removedIds = removedSelectOptionIds({
        currentFieldId,
        selectOptions: selectOptions || [],
        fieldType,
      });

      // Update the required list to exclude the updated field
      const updatedRequiredList =
        schema.required?.filter((fieldId) => fieldId !== currentFieldId) || [];

      // Add this field to the required list if it is required
      if (isUnconditionallyRequired) {
        updatedRequiredList.push(currentFieldId);
      }

      const schemaProperties = schema.properties || {};
      const schemaConditions = buildConditionallyRequiredSchemaConditions({
        fieldConfigData,
        fieldId: currentFieldId,
      });

      // Update the schema with the modified field and update required list
      const modifiedSchema = {
        ...schema,
        properties: {
          ...schemaProperties,
          [currentFieldId]: {
            parentId,
            ...addOrUpdateSchema(fieldConfigData),
          },
        } as CustomSchemaProperties,
        required: updatedRequiredList,
        // Only include allOf if there are conditions
        allOf: schemaConditions.length > 0 ? schemaConditions : undefined,
      };

      if (modifiedSchema.allOf === undefined) {
        delete modifiedSchema.allOf;
      }

      setSchema(modifiedSchema);

      // Iterate through all the sections (found in the elements array of the UI Schema)
      const modifiedUISchemaElementsCopy = uiSchema.elements.map(
        (element: CustomUISchemaElement) => {
          if (element.id === parentId) {
            const modifiedElements = element?.elements
              ? element.elements.map((childElement: CustomUISchemaElement) => {
                  // Update the field that matches the field being edited
                  if (childElement.id === currentFieldId) {
                    const { id, type, parentId, scope } = childElement;

                    return {
                      id,
                      type,
                      parentId,
                      scope,
                      ...addOrUpdateUISchema({
                        fieldConfigData,
                        schema: useFormBuilderStore.getState().schema,
                      }),
                    };
                  }

                  // Otherwise return the field as is
                  return childElement;
                })
              : [];

            return {
              ...element,
              elements: modifiedElements,
            };
          }

          return element;
        }
      );

      // Update the UI Schema with the list of modified sections
      setUISchema({
        ...uiSchema,
        elements: modifiedUISchemaElementsCopy,
      });

      // If any options were removed, prune any dependent conditional logic from the schema and uiSchema
      if (
        isOptionsField(fieldType) &&
        selectOptions?.length &&
        removedIds.length
      ) {
        pruneRemovedSelectOptionsWithConditionalLogic({
          currentFieldId,
          removedIds,
        });
      }
    },

    deleteField: (currentFieldId, parentId) => {
      const { schema, setSchema, uiSchema, setUISchema } =
        useFormBuilderStore.getState();
      const { fieldType, selectOptions } =
        useFormBuilderFieldStore.getState().fieldConfigData;

      if (!currentFieldId) {
        handleError(
          new Error('useFormBuilderFieldStore: No id found in uiSchema')
        );

        return;
      }

      if (!schema?.properties) {
        handleError(
          new Error('useFormBuilderFieldStore: No properties found in schema')
        );

        return;
      }

      const removedIds = removedSelectOptionIds({
        currentFieldId,
        selectOptions: [],
        fieldType,
      });

      // Update the schema to remove the field that matches the field being deleted
      const modifiedSchemaPropertiesCopy = Object.keys(
        schema.properties || {}
      ).reduce((acc: CustomSchemaProperties, key) => {
        if (key !== currentFieldId) {
          acc[key] = schema.properties![key] as CustomSchemaProperty;
        }

        return acc;
      }, {});

      const schemaConditions = buildConditionallyRequiredSchemaConditions({
        fieldId: currentFieldId,
      });

      const requiredPropertiesExcludingDeletedField =
        schema.required?.filter((fieldId) => {
          if (
            !Object.keys(modifiedSchemaPropertiesCopy || {}).includes(fieldId)
          ) {
            // This ensures any required fields that are no longer in the schema are excluded from the required list...
            return false;
          }

          // ...or filters out the field id that belongs to the deleted section
          return fieldId !== currentFieldId;
        }) || [];

      // Update the schema with the list of fields (excluding the deleted field)
      const modifiedSchema = {
        ...schema,
        properties: { ...modifiedSchemaPropertiesCopy },
        required: requiredPropertiesExcludingDeletedField,
        // Only include allOf if there are conditions
        allOf: schemaConditions.length > 0 ? schemaConditions : undefined,
      };

      if (modifiedSchema.allOf === undefined) {
        delete modifiedSchema.allOf;
      }

      setSchema(modifiedSchema);

      // Iterate through all the sections (found in the elements array of the UI Schema)
      const modifiedUISchemaElementsCopy = uiSchema.elements.map(
        (element: CustomUISchemaElement) => {
          if (element.id === parentId) {
            // Filter out the field that matches the field being deleted
            const filteredElements = element?.elements
              ? element.elements.filter(
                  (elementElement: CustomUISchemaElement) =>
                    elementElement.id !== currentFieldId
                )
              : [];

            return {
              ...element,
              elements: filteredElements,
            };
          }

          return element;
        }
      );

      // Update the UI Schema with the list of modified sections
      setUISchema({
        ...uiSchema,
        elements: modifiedUISchemaElementsCopy,
      });

      // If any options were removed, prune any dependent conditional logic from the schema and uiSchema
      if (
        isOptionsField(fieldType) &&
        selectOptions?.length &&
        removedIds.length
      ) {
        pruneRemovedSelectOptionsWithConditionalLogic({
          currentFieldId,
          removedIds,
        });
      }
    },
  })
);
