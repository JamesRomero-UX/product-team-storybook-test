import type { PropertyFilterToken } from '@cloudscape-design/collection-hooks';
import { isVisible } from '@jsonforms/core';
import type { ErrorObject } from 'ajv';
import { DiGraph } from 'digraph-js';

import { handleError } from '../utils/errorUtils';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import type {
  CustomSchema,
  CustomSchemaProperty,
  CustomUISchema,
  CustomUISchemaElement,
  FieldConfigData,
  FieldOption,
  ResponseData,
  SchemaCondition,
  SchemaProperty,
} from './types';
import { FieldOptionType } from './types';
import { validator } from './validator';

export const infoIconStyles =
  'transition border-0 text-navy cursor-pointer h-[14px] w-[14px] ' +
  'content-baseline flex justify-center items-center';

export const isOptionsField = (fieldType: FieldOptionType): boolean => {
  return (
    fieldType === FieldOptionType.Radio ||
    fieldType === FieldOptionType.Dropdown ||
    fieldType === FieldOptionType.Multiselect
  );
};

export const supportsConditionalLogic = (
  fieldType: FieldOptionType
): boolean => {
  return (
    fieldType === FieldOptionType.Radio ||
    fieldType === FieldOptionType.Dropdown
    // || fieldType === FieldOptionType.Multiselect // TODO: Re-enable this when multiselect is supported
  );
};

export const usesItemsOneOf = (fieldType: FieldOptionType): boolean => {
  return fieldType === FieldOptionType.Multiselect;
};

export const usesOneOf = (fieldType: FieldOptionType): boolean => {
  return (
    fieldType === FieldOptionType.Radio ||
    fieldType === FieldOptionType.Dropdown
  );
};

/**
 * Determines if a field is conditionally required based on the schema's allOf conditions.
 *
 * This function checks if the provided field ID appears in the "then" properties
 * of any condition in the schema's allOf array, indicating that the field is required
 * when certain conditions are met.
 *
 * @param currentFieldId - The ID of the field to check for conditional requirement.
 * @returns `true` if the field is conditionally required, `false` otherwise.
 */
export const isFieldConditionallyRequired = (currentFieldId: string) => {
  const { schema } = useFormBuilderStore.getState();
  const safeAllOf = schema?.allOf || [];

  return safeAllOf.some((condition) => {
    const thenProperties = condition.then?.properties || {};

    return Object.keys(thenProperties).includes(currentFieldId);
  });
};

/**
 * Builds a directed graph from schema conditions.
 * The function creates a graph where each node represents a field and edges represent
 * conditional dependencies between fields.
 *
 * @param schema - CustomSchema - The schema containing all field definitions
 * @returns DiGraph - Graph of all fields and their dependencies
 */
export const buildSchemaConditionGraph = (schema: CustomSchema) => {
  // Build adjacency list representation of the dependency graph
  const graph = new DiGraph();
  const propertiesArray = Object.entries(schema?.properties || {});

  propertiesArray.forEach(([key, _]) => {
    graph.addVertices({ id: key, adjacentTo: [], body: {} });
  });

  propertiesArray.forEach(([key, value]) => {
    (value.conditionalOptions?.tokens || []).forEach((token) => {
      graph.addEdge({ from: token.propertyKey || '', to: key });
    });
  });

  return graph;
};

/**
 * Checks if any ancestor of a given field is hidden based on conditional logic.
 *
 * This function traverses up the schema tree from the specified field, checking each
 * ancestor to see if it has a visibility rule that evaluates to false based on the
 * current form data.
 *
 * @param currentFieldId - The ID of the field to check ancestors for.
 * @param formData - The current form data used to evaluate visibility rules.
 * @returns `true` if any ancestor is hidden, `false` otherwise.
 */
export const areAnyAncestorsHidden = (
  currentFieldId: string,
  formData: ResponseData
): boolean => {
  const { schema, flattenedUISchemaElements } = useFormBuilderStore.getState();
  const schemaConditionGraph = buildSchemaConditionGraph(schema);

  if (schemaConditionGraph.hasCycles()) {
    handleError(
      new Error(
        'Schema condition graph has circular references, cannot determine ancestor visibility.'
      )
    );

    return false; // Cannot determine visibility if there are cycles (circular references)
  }

  const ancestors = Array.from(
    schemaConditionGraph.getDeepParents(currentFieldId)
  );

  return ancestors.some((ancestor) => {
    const parentUISchema = flattenedUISchemaElements.find(
      (element: CustomUISchemaElement) => element.id === ancestor
    );

    if (!parentUISchema) {
      return false;
    }

    return !isVisible(parentUISchema, formData, '', validator, {});
  });
};

/**
 * Checks if a form field is hidden based on its UI schema and form data.
 *
 * This function evaluates whether a field should be hidden in the UI based on:
 * 1. Whether the form is in design mode (fields are always visible in design mode)
 * 2. If any ancestor fields are hidden
 * 3. If the field's visibility rule evaluates to false based on the current form data
 *
 * @param fieldUISchema - The UI schema element representing the field to check
 * @param formData - The current form data used to evaluate visibility rules
 * @returns `true` if the field is hidden, `false` otherwise
 */
export const isElementHidden = (
  fieldUISchema: CustomUISchemaElement,
  formData: ResponseData
): boolean => {
  return (
    !fieldUISchema?.options?.isDesignMode &&
    (areAnyAncestorsHidden(fieldUISchema.id, formData) ||
      !isVisible(fieldUISchema, formData, '', validator, {}))
  );
};

/**
 * Validates conditional logic for a form field by checking:
 * 1. If referenced fields and their options still exist in the schema
 * 2. If adding new conditions would create circular dependencies
 *
 * For field options validation:
 * - Checks if each referenced field exists in the schema
 * - Verifies that selected option values still exist in the source field's options
 * - Handles both regular (oneOf) and multiselect (items.oneOf) field types
 *
 * For circular dependency validation:
 * - Combines existing schema conditions with new ones
 * - Checks if the resulting dependency graph would contain cycles
 *
 * @param fieldConfigData - Configuration data for the field being validated
 * @param schema - Current form schema containing all field definitions
 * @param fieldId - Unique identifier for the field being configured
 * @returns ErrorObject[] - Array of validation errors, empty if valid
 */
export const validateConditionalList = (
  fieldConfigData: FieldConfigData,
  schema: CustomSchema,
  fieldId: string
): ErrorObject[] => {
  const { isConditional, conditionalOptions } = fieldConfigData;

  if (!isConditional || !conditionalOptions?.tokens?.length) {
    return [];
  }

  // Check if all conditional option values still exist in schema
  const hasValidOptions = conditionalOptions.tokens.every((token) => {
    const propertyKey = token.propertyKey;
    if (!propertyKey) {
      return false;
    }

    const tokenOptions = token.value;
    if (!tokenOptions?.length) {
      return false;
    }

    const propertySchema = schema.properties?.[propertyKey];
    if (!propertySchema) {
      return false;
    }

    // Get options from either oneOf or items.oneOf
    const schemaOptions =
      'items' in propertySchema
        ? propertySchema.items?.oneOf
        : propertySchema.oneOf;

    if (!schemaOptions) {
      return false;
    }

    // Check if all token values exist in corresponding schema options
    return token.value.every((value: string) =>
      schemaOptions.some((option) => {
        return option.const === value;
      })
    );
  });

  if (!hasValidOptions) {
    return [
      {
        instancePath: '/conditionalOptions/tokens',
        message:
          'One or more conditions are invalid. Update or remove any invalid conditions and try again.',
        schemaPath: '',
        keyword: '',
        params: {},
      },
    ];
  }

  // Check if new conditions create circular dependencies
  const conditionGraph = buildSchemaConditionGraph(schema);
  conditionalOptions.tokens.forEach((token) => {
    conditionGraph.addEdge({
      from: token.propertyKey || '',
      to: fieldId || '',
    });
  });

  if (conditionGraph.hasCycles()) {
    return [
      {
        instancePath: '/conditionalOptions',
        message:
          'Circular references detected in conditional logic. Please review and remove any circular references.',
        schemaPath: '',
        keyword: '',
        params: {},
      },
    ];
  }

  return [];
};

/**
 * Builds an array of schema conditions from field configuration data.
 * This function converts conditional options from a field's configuration into
 * a format compatible with JSON Schema's conditional validation (allOf array).
 *
 * Each condition in the returned array represents a rule where:
 * - 'if': Specifies when the condition should apply (based on another field's value)
 * - 'then': Specifies what requirements to enforce when the condition is met
 *
 * Example:
 * For a field "showExtraDetails" that should be required when "type" equals "complex":
 * ```
 * {
 *   if: {
 *     properties: { type: { enum: ["complex"] } },
 *     required: ["type"]
 *   },
 *   then: {
 *     properties: { showExtraDetails: { minItems: 1 } },
 *     required: ["showExtraDetails"]
 *   }
 * }
 * ```
 *
 * @param fieldConfigData - Configuration data for the field, including conditional options
 * @param fieldId - Unique identifier for the field being configured
 * @returns Array of SchemaCondition objects, empty array if no conditions are defined
 */
export const generateConditions = (
  fieldConfigData: FieldConfigData,
  fieldId: string
): SchemaCondition[] => {
  const { conditionalOptions } = fieldConfigData;

  if (!conditionalOptions?.tokens?.length) {
    return [];
  }

  return conditionalOptions.tokens.reduce((acc, token) => {
    if (!token.propertyKey || !token.value?.length) {
      handleError(
        new Error(
          'Invalid token in conditional options while building schema conditions: ' +
            JSON.stringify(token)
        )
      );

      return acc;
    }

    return [
      ...acc,
      {
        if: {
          properties: {
            [token.propertyKey]: { enum: token.value },
          },
          required: [token.propertyKey],
        },
        then: {
          properties: {
            [fieldId]: { minItems: 1 },
          },
          required: [fieldId],
        },
      },
    ];
  }, [] as SchemaCondition[]);
};

/**
 * Manages schema conditions by handling addition, updates, and deletion of conditions.
 *
 * This function:
 * 1. Removes any existing conditions where the field is the source
 * 2. Builds new conditions from the current field configuration
 * 3. Combines remaining existing conditions with new ones
 *
 * @param schema - The current form schema containing all field definitions
 * @param fieldId - Unique identifier for the field being configured
 * @param fieldConfigData - Configuration data for the field being validated
 * @returns Array of SchemaCondition objects, empty array if no conditions are defined
 *
 */
export const buildConditionallyRequiredSchemaConditions = ({
  fieldId,
  fieldConfigData,
}: {
  fieldId: string;
  fieldConfigData?: FieldConfigData;
}): SchemaCondition[] => {
  const { schema } = useFormBuilderStore.getState();

  // Get existing conditions excluding ones where this field is the target
  const existingConditions = (schema?.allOf || []).filter((condition) => {
    const sourceField = Object.keys(condition.then.properties)[0];

    return sourceField !== fieldId;
  });

  // Build new conditions for this field if it has conditional options AND it is required
  const newConditions =
    fieldConfigData && fieldConfigData.isPropertyRequired
      ? generateConditions(fieldConfigData, fieldId)
      : [];

  return [...existingConditions, ...newConditions];
};

/**
 * Determines which select option IDs have been removed from a field.
 *
 * This function compares the existing options defined in the schema (using either
 * items.oneOf or oneOf, depending on the field type) with the new set of selectOptions.
 * It returns an array of IDs (from the schema options) that are not present in the new selectOptions.
 *
 * @param params - The parameters for determining removed options.
 * @param params.fieldType - The type of the field (e.g., dropdown, radio, multiselect).
 * @param params.schema - The current form schema.
 * @param params.currentFieldId - The ID of the field being updated.
 * @param params.selectOptions - The new set of select options (each including a generatedId).
 * @returns An array of option IDs that were removed.
 */
export const removedSelectOptionIds = ({
  fieldType,
  currentFieldId,
  selectOptions,
}: {
  fieldType: FieldOptionType;
  currentFieldId: string;
  selectOptions: FieldOption[];
}) => {
  const { schema } = useFormBuilderStore.getState();
  const existingFieldOptions = isOptionsField(fieldType)
    ? schema?.properties?.[currentFieldId]?.items?.oneOf ||
      schema?.properties?.[currentFieldId]?.oneOf ||
      []
    : [];

  const newOptionIds = new Set(
    selectOptions?.map((opt) => opt.generatedId) || []
  );

  return (existingFieldOptions ?? [])
    .filter((opt) => !newOptionIds.has(opt.const))
    .map((opt) => opt.const);
};

/**
 * Cleans up conditional logic in the schema and UI schema when select options are removed from a field.
 *
 * When options are removed from a field (`currentFieldId`) that other fields might depend on for their
 * conditional logic, this function ensures that:
 *
 * 1.  **Schema Properties (`schema.properties`):**
 *     -   It iterates through all properties in the schema.
 *     -   For any property that has `conditionalOptions.tokens` referencing the `currentFieldId`:
 *         -   It removes any specific option values from these tokens if those option values are present in the `removedIds` list.
 *         -   If a token becomes empty (all its dependent option values are removed), the entire token is removed.
 *         -   If a field loses all its conditional tokens as a result of this pruning and was previously conditional,
 *             its `isConditional` flag is set to `false`, and its `conditionalOptions` are reset to an empty state.
 *
 * 2.  **Schema AllOf (`schema.allOf`):**
 *     -   It iterates through all conditions in the `allOf` array.
 *     -   For any condition that depends on the `currentFieldId`:
 *         -   It removes any `removedIds` from the `enum` array in the condition.
 *         -   If the `enum` array becomes empty after removing the `removedIds`, the entire condition is removed.
 *
 * 3.  **UI Schema Rules (`uiSchema.elements`):**
 *     -   It iterates through all elements in each section of the UI schema.
 *     -   For any UI schema element (representing a field) that has a conditional `rule` whose condition
 *         depends on an option from `currentFieldId`:
 *         -   It attempts to remove any `removedIds` from the `enum` array in the rule's condition.
 *         -   If the `enum` array becomes empty after removing the `removedIds`, the entire `rule` is removed from the UI schema element.
 *
 * If any changes are made to the schema or UI schema, the respective store update functions (`setSchema`, `setUISchema`)
 * are called to persist these changes. The `allOf` array in the schema, which holds the compiled conditional logic,
 * is expected to be rebuilt by the calling function (e.g., `updateField` in the store) after this pruning operation.
 *
 * @param {object} params - The parameters for the function.
 * @param {string} params.currentFieldId - The ID of the field from which select options were removed. This is the field that other conditional logic might depend on.
 * @param {string[]} params.removedIds - An array of `generatedId`s for the select options that were removed from the `currentFieldId`.
 */
export const pruneRemovedSelectOptionsWithConditionalLogic = ({
  currentFieldId,
  removedIds,
}: {
  currentFieldId: string;
  removedIds: string[];
}) => {
  const { schema, uiSchema, setSchema, setUISchema } =
    useFormBuilderStore.getState();

  if (!removedIds.length) {
    return;
  }

  let schemaChanged = false;
  let uiSchemaChanged = false;

  // 1. Prune conditionalOptions tokens from schema properties
  const newSchemaProperties = Object.entries(schema?.properties ?? {}).reduce(
    (
      acc,
      [propertyKey, propertyValue]: [
        string,
        CustomSchemaProperty | SchemaProperty,
      ]
    ) => {
      const conditionalOptionsTokens =
        propertyValue?.conditionalOptions?.tokens || [];

      const conditionalOptionsTokensAreInvalid =
        !conditionalOptionsTokens || !Array.isArray(conditionalOptionsTokens);

      if (conditionalOptionsTokensAreInvalid) {
        return { ...acc, [propertyKey]: propertyValue };
      }

      const updatedTokens: PropertyFilterToken[] = (
        conditionalOptionsTokens || []
      ).reduce((acc: PropertyFilterToken[], token) => {
        if (token.propertyKey === currentFieldId) {
          const filteredValues = token.value.filter(
            (val: string) => !removedIds.includes(val)
          );

          if (filteredValues.length === 0) {
            return acc; // Omit to remove empty tokens
          }

          if (filteredValues.length !== token.value.length) {
            return [...acc, { ...token, value: filteredValues }];
          }
        }

        return [...acc, token];
      }, []);

      const isUpdatedTokensEmpty = updatedTokens.length === 0;
      const updatedProperty = {
        ...propertyValue,
        isConditional: isUpdatedTokensEmpty
          ? false
          : propertyValue.isConditional,
        conditionalOptions: {
          ...propertyValue.conditionalOptions,
          tokens: updatedTokens,
        },
      };

      const propertyHasChanged =
        updatedTokens.length !== conditionalOptionsTokens.length ||
        updatedTokens.some((token, index) => {
          const originalToken = conditionalOptionsTokens?.[index];

          return (
            !originalToken ||
            token.propertyKey !== originalToken.propertyKey ||
            token.value.length !== originalToken.value.length ||
            token.value.some((value: string, valueIndex: string) => {
              return value !== originalToken.value[valueIndex];
            })
          );
        });

      if (propertyHasChanged) {
        schemaChanged = true;

        return { ...acc, [propertyKey]: updatedProperty };
      }

      return { ...acc, [propertyKey]: propertyValue };
    },
    { ...schema.properties }
  );

  // 2. Prune schema.allOf conditions
  const newAllOf = (schema?.allOf ?? []).reduce((acc, condition) => {
    const sourceField = Object.keys(condition.if.properties)[0];
    const enumValues = condition?.if?.properties?.[sourceField]?.enum;

    if (sourceField !== currentFieldId || !enumValues) {
      return [...acc, condition];
    }

    const filteredEnumValues = enumValues.filter(
      (enumValue: string) => !removedIds.includes(enumValue)
    );

    if (filteredEnumValues.length === 0) {
      // If all enum values are removed, remove the condition
      schemaChanged = true;

      return acc;
    }

    const conditionChanged = filteredEnumValues.length !== enumValues.length;

    if (conditionChanged) {
      schemaChanged = true;

      const newCondition: SchemaCondition = {
        ...condition,
        if: {
          ...condition.if,
          properties: {
            ...condition.if.properties,
            [sourceField]: {
              ...condition.if.properties[sourceField],
              enum: filteredEnumValues,
            },
          },
        },
      };

      return [...acc, newCondition];
    }

    return [...acc, condition];
  }, [] as SchemaCondition[]);

  // 3. Prune uiSchema rules
  const newUISchemaElements = uiSchema.elements.map(
    (section: CustomUISchemaElement) => {
      if (!section.elements || section.elements.length === 0) {
        return section;
      }

      const updatedSectionElements = section.elements.map(
        (uiElement: CustomUISchemaElement) => {
          const ruleProperties =
            uiElement.rule?.condition?.schema?.properties?.[currentFieldId];

          if (!ruleProperties?.enum) {
            return uiElement;
          }

          const originalEnum = ruleProperties.enum;
          const filteredEnum = originalEnum.filter(
            (enumValue: string) => !removedIds.includes(enumValue)
          );

          if (filteredEnum.length === 0) {
            // Enum is empty, remove the whole rule
            uiSchemaChanged = true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { rule, ...restOfElement } = uiElement;

            return restOfElement;
          } else if (filteredEnum.length !== originalEnum.length) {
            // Enum was modified, update the rule
            uiSchemaChanged = true;

            return {
              ...uiElement,
              rule: {
                ...uiElement.rule!,
                condition: {
                  ...uiElement.rule!.condition,
                  schema: {
                    ...uiElement.rule!.condition.schema,
                    properties: {
                      ...uiElement.rule!.condition.schema.properties,
                      [currentFieldId]: {
                        ...ruleProperties,
                        enum: filteredEnum,
                      },
                    },
                  },
                },
              },
            };
          }

          return uiElement;
        }
      );

      const sectionElementsChanged =
        updatedSectionElements.length !== section.elements.length ||
        updatedSectionElements.some(
          (el, idx) => el !== (section.elements ?? [])[idx]
        );

      if (sectionElementsChanged) {
        uiSchemaChanged = true;

        return { ...section, elements: updatedSectionElements };
      }

      return section;
    }
  );

  if (schemaChanged) {
    const updatedSchema: CustomSchema = {
      ...schema,
      properties: newSchemaProperties,
      allOf: newAllOf.length > 0 ? newAllOf : undefined,
    };

    if (newAllOf.length === 0) {
      delete updatedSchema.allOf;
    }

    setSchema(updatedSchema);
  }

  if (uiSchemaChanged) {
    setUISchema({
      ...uiSchema,
      elements: newUISchemaElements,
    });
  }
};

/**
 * Returns an array of field IDs for all fields that are visible in the form.
 *
 * This function iterates through all elements in the provided UI schema and checks
 * each field's visibility using the `isVisible` utility and the `areAnyAncestorsHidden` check.
 * Only fields that are visible and whose ancestors are also visible are included in the result.
 *
 * @param uiSchema - The UI schema describing the form layout and fields.
 * @param formData - The current form data used to evaluate visibility rules.
 * @returns An array of field IDs that are currently visible in the form.
 */
export const getAllVisibleFieldIds = (
  uiSchema: CustomUISchema,
  formData: ResponseData
): string[] => {
  return uiSchema.elements.flatMap((section: CustomUISchemaElement) =>
    (section?.elements || []).reduce((acc, element) => {
      const isElementVisible =
        isVisible(element, formData, '', validator, {}) &&
        !areAnyAncestorsHidden(element.id, formData);

      return isElementVisible ? [...acc, element.id] : acc;
    }, [] as string[])
  );
};

/**
 * Returns a filtered version of the form data, excluding any fields that are currently hidden.
 *
 * This function uses the UI schema and the current form data to determine which fields are visible
 * (using `getAllVisibleFieldIds`). It then returns a new object containing only the key-value pairs
 * from the form data whose keys correspond to visible fields.
 *
 * @param uiSchema - The UI schema describing the form layout and fields.
 * @param formData - The current form data.
 * @returns An object containing only the data for visible fields.
 */
export const getResponseDataExcludingDataForHiddenFields = (
  uiSchema: CustomUISchema,
  formData: ResponseData
) => {
  const visibleFields = getAllVisibleFieldIds(uiSchema, formData);
  const fileHandlingKeys = ['files', 'newFiles', 'updatedFiles'];

  // Return filtered form data containing only data from visible fields
  return Object.entries(formData).reduce((acc, [key, value]) => {
    if (visibleFields.includes(key) || fileHandlingKeys.includes(key)) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {} as ResponseData);
};

/**
 * Returns validation errors for only the visible fields in the form.
 *
 * This function filters the form data to include only visible fields (using `getResponseDataExcludingDataForHiddenFields`)
 * and then validates this filtered data against the provided JSON schema validator (`ajv`).
 *
 * @param uiSchema - The UI schema describing the form layout and fields.
 * @param formData - The current form data.
 * @returns An array of validation error objects, or an empty array if the data is valid.
 */
export const getErrorsForVisibleFields = (
  uiSchema: CustomUISchema,
  formData: ResponseData
): ErrorObject[] => {
  const { validateSchema } = useFormBuilderStore.getState();

  const cleanedData = getResponseDataExcludingDataForHiddenFields(
    uiSchema,
    formData
  );

  const isValid = validateSchema(cleanedData);

  return isValid ? [] : validateSchema.errors || [];
};

/**
 * Design mode UI schema transformer.
 * @param uiSchema - The original UI schema to be transformed.
 */
export const designModeUISchema = (
  uiSchema: CustomUISchema
): CustomUISchema => {
  return {
    ...uiSchema,
    elements: uiSchema.elements.map((element: CustomUISchemaElement) => ({
      ...element,
      elements: element?.elements?.map((field) => ({
        ...field,
        options: {
          ...field.options,
          isDesignMode: true,
        },
      })),
    })),
  };
};
