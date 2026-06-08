import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import type { DB } from '@risksmart-app/drizzle/src/db';
import { getFormConfigurationQueryConfig } from '@risksmart-app/drizzle/src/queries/form-configuration.query';
import {
  custom_attribute_schema,
  form_configuration,
  form_field_configuration,
} from '@risksmart-app/drizzle/src/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';

import type { FormConfigurationRow } from '../types/form-configuration.types';
import type { FormFieldPersistInput } from '../types/form-field.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for form field data access operations
 */
export function createFormFieldRepository(db: DB['transaction']) {
  return {
    /**
     * Find form configuration by parent type, including custom attribute schema and field configurations
     */
    findByParentType: async (
      parentType: ParentType
    ): Promise<FormConfigurationRow | undefined> => {
      try {
        return await db((tx) =>
          tx.query.form_configuration.findFirst({
            ...getFormConfigurationQueryConfig,
            where: { ParentType: parentType },
          })
        );
      } catch (error) {
        logger.error('Failed to query form configuration', {
          error,
          parentType,
        });
        throw error;
      }
    },

    /**
     * Persist form field configuration with atomic upsert
     * Handles:
     * - Upsert custom_attribute_schema
     * - Upsert form_configuration
     * - Upsert form_field_configuration (one or many)
     * - Delete specified fields
     */
    persist: async (input: FormFieldPersistInput): Promise<void> => {
      const {
        schemaId,
        parentType,
        formFieldConfigurations,
        schema,
        uiSchema,
        fieldsToDelete,
        userId,
        orgKey,
      } = input;

      try {
        await db(async (tx) => {
          // 1. Upsert custom_attribute_schema
          await tx
            .insert(custom_attribute_schema)
            .values({
              Id: schemaId,
              Schema: schema,
              UiSchema: uiSchema,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            })
            .onConflictDoUpdate({
              target: custom_attribute_schema.Id,
              set: {
                Schema: schema,
                UiSchema: uiSchema,
                ModifiedByUser: userId,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
              },
            });

          // 2. Upsert form_configuration
          await tx
            .insert(form_configuration)
            .values({
              CustomAttributeSchemaId: schemaId,
              ParentType: parentType,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            })
            .onConflictDoUpdate({
              target: [
                form_configuration.ParentType,
                form_configuration.OrgKey,
              ],
              set: {
                CustomAttributeSchemaId: schemaId,
                ModifiedByUser: userId,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
              },
            });

          // 3. Upsert form_field_configuration(s)
          const fieldConfigs = Array.isArray(formFieldConfigurations)
            ? formFieldConfigurations
            : [formFieldConfigurations];

          for (const fieldConfig of fieldConfigs) {
            await tx
              .insert(form_field_configuration)
              .values({
                FormConfigurationParentType: parentType,
                FieldId: fieldConfig.FieldId,
                Hidden: fieldConfig.Hidden,
                Required: fieldConfig.Required,
                ReadOnly: fieldConfig.ReadOnly,
                DefaultValue: fieldConfig.DefaultValue ?? null,
                Label: fieldConfig.Label ?? null,
                Description: fieldConfig.Description ?? null,
                Conditions: fieldConfig.Conditions ?? null,
                OrgKey: orgKey,
                CreatedByUser: userId,
                ModifiedByUser: userId,
              })
              .onConflictDoUpdate({
                target: [
                  form_field_configuration.FormConfigurationParentType,
                  form_field_configuration.FieldId,
                  form_field_configuration.OrgKey,
                ],
                set: {
                  Hidden: fieldConfig.Hidden,
                  Required: fieldConfig.Required,
                  ReadOnly: fieldConfig.ReadOnly,
                  DefaultValue: fieldConfig.DefaultValue ?? null,
                  Label: fieldConfig.Label ?? null,
                  Description: fieldConfig.Description ?? null,
                  Conditions: fieldConfig.Conditions ?? null,
                  ModifiedByUser: userId,
                  ModifiedAtTimestamp: sql`statement_timestamp()`,
                },
              });
          }

          // 4. Delete specified fields
          if (fieldsToDelete.length > 0) {
            await tx
              .delete(form_field_configuration)
              .where(
                and(
                  eq(
                    form_field_configuration.FormConfigurationParentType,
                    parentType
                  ),
                  inArray(form_field_configuration.FieldId, fieldsToDelete)
                )
              );
          }

          logger.info('Form field configuration persisted', {
            schemaId,
            parentType,
            fieldCount: fieldConfigs.length,
            deletedFieldCount: fieldsToDelete.length,
          });
        });
      } catch (error) {
        logger.error('Failed to persist form field configuration', {
          error,
          schemaId,
          parentType,
        });
        throw error;
      }
    },
  };
}

export type FormFieldRepository = ReturnType<typeof createFormFieldRepository>;
