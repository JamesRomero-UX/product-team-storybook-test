import { handleError } from '../utils/errorUtils';
import { useFormBuilderFieldStore } from './store/useFormBuilderFieldStore';
import type {
  CustomDropDownSchema,
  CustomMultiselectSchema,
  CustomSchema,
  CustomUISchema,
  CustomUISchemaElement,
  FieldConfigData,
} from './types';
import { emptyPropertyFilterQuery, FieldOptionType } from './types';

/**
 * Migrates stale schema configurations to the current schema format.
 * Specifically handles the migration of:
 * 1. Multiselect fields that don't use the items.oneOf structure
 * 2. ConditionalOptions tokens that use option titles instead of generated IDs
 *
 * The function examines each field in the UI schema and:
 * - Identifies fields that were saved with incorrect schema and/or uischema structure
 * - Rebuilds each field configuration with the correct schema structure
 * - Updates each field using the provided updateField callback
 *
 * @param schema - The current form schema containing all field definitions
 * @param uiSchema - The UI schema containing field layout and display properties
 *
 * @throws Error if schema is missing for a field or if parentId is missing
 * @returns void
 */
export const migrateStaleSchema = (
  schema: CustomSchema,
  uiSchema: CustomUISchema
) => {
  const { updateField } = useFormBuilderFieldStore.getState();

  uiSchema?.elements.map((section: CustomUISchemaElement) => {
    return section?.elements?.map((fieldUISchema) => {
      const fieldSchema = schema?.properties?.[fieldUISchema.id];

      // Handle Errors
      let errorMessage: string = '';

      if (!fieldSchema) {
        errorMessage = `No schema found during migrateStaleSchema for field ${fieldUISchema.id}`;
      }

      if (!fieldUISchema?.parentId) {
        errorMessage = `No parentId found during migrateStaleSchema for field ${fieldUISchema.id}`;
      }

      if (errorMessage) {
        handleError(new Error(errorMessage));

        return;
      }

      // 1. Update stale selectOptions for Multiselect fields
      if (fieldUISchema?.options?.fieldType === FieldOptionType.Multiselect) {
        if ((fieldSchema as CustomDropDownSchema)?.oneOf) {
          const hasValidItems =
            (fieldSchema as CustomMultiselectSchema)?.items !== undefined;

          const newItems = (
            hasValidItems
              ? (fieldSchema as CustomMultiselectSchema)?.items
              : (fieldSchema as CustomDropDownSchema)
          )?.oneOf?.map((item) => ({
            generatedId: item?.const,
            value: item?.title,
          }));

          const updatedFieldConfig: FieldConfigData = {
            fieldTitle: fieldUISchema.label || '',
            placeholder: fieldUISchema?.options?.placeholder || '',
            description: fieldUISchema?.options?.description || '',
            fieldType: FieldOptionType.Multiselect,
            selectOptions: newItems,
            isPropertyRequired:
              schema?.required?.includes(fieldUISchema.id) || false,
            allowAttachments: fieldSchema?.allowAttachments || false,
            isConditional: fieldSchema?.isConditional || false,
            conditionalOptions:
              fieldSchema?.conditionalOptions || emptyPropertyFilterQuery,
          };

          updateField(
            updatedFieldConfig,
            fieldUISchema.id,
            fieldUISchema?.parentId || ''
          );

          return;
        }
      }

      // 2. Migrate conditionalOptions tokens that use option titles instead of generated IDs
      if (
        fieldSchema?.conditionalOptions?.tokens &&
        fieldSchema.conditionalOptions.tokens.length > 0
      ) {
        let tokensHaveChanged = false;

        // Determine the options for each token's propertyKey
        const migratedTokens = fieldSchema.conditionalOptions.tokens.map(
          (token) => {
            if (!token.propertyKey || !Array.isArray(token.value)) {
              return token;
            }
            // Find the referenced property in the schema
            const refProperty = schema.properties?.[token.propertyKey];
            if (!refProperty) {
              return token;
            }

            // Get the options array (oneOf or items.oneOf)
            const options =
              refProperty?.items?.oneOf || refProperty?.oneOf || [];

            // If any token.value entry matches an option title, replace it with the corresponding const (generatedId)
            const migratedValues = token.value.map((tokenValue: string) => {
              // If tokenValue matches a const, keep it
              if (options.some((opt) => opt.const === tokenValue)) {
                return tokenValue;
              }

              // If val matches a title, replace with const
              const match = options.find((opt) => opt.title === tokenValue);

              if (match) {
                tokensHaveChanged = true;
              }

              return match ? match.const : tokenValue;
            });

            return tokensHaveChanged
              ? { ...token, value: migratedValues }
              : token;
          }
        );

        // If any tokens were migrated, update the field
        if (tokensHaveChanged) {
          const updatedFieldConfig: FieldConfigData = {
            fieldTitle: fieldUISchema.label || '',
            placeholder: fieldUISchema?.options?.placeholder || '',
            description: fieldUISchema?.options?.description || '',
            fieldType: fieldUISchema?.options?.fieldType,
            selectOptions: (
              fieldSchema?.items?.oneOf ||
              fieldSchema?.oneOf ||
              []
            ).map((item) => ({
              generatedId: item?.const,
              value: item?.title,
            })),
            isPropertyRequired:
              schema?.required?.includes(fieldUISchema.id) || false,
            allowAttachments: fieldSchema?.allowAttachments || false,
            isConditional: fieldSchema?.isConditional || false,
            conditionalOptions: {
              ...fieldSchema.conditionalOptions,
              tokens: migratedTokens,
            },
          };

          updateField(
            updatedFieldConfig,
            fieldUISchema.id,
            fieldUISchema?.parentId || ''
          );
        }
      }
    });
  });

  return;
};
