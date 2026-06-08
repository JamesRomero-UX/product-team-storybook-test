import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JsonSchema7, VerticalLayout } from '@jsonforms/core';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import {
  FormFieldOperationError,
  updateFieldAndPersist,
} from '@risksmart-app/form-configuration/src/field-orchestrator';
import type { PersistFormFieldConfigurationInput } from '@risksmart-app/form-configuration/src/field-persistence';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { randomUUID } from 'crypto';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';
import type { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createFormFieldRepository,
  type FormFieldRepository,
} from '../../../../../repositories/form-field-repository';
import { updateFormFieldRequestSchema } from '../../../../../schemas/form-field';
import { getLogger } from '../../../../../utils/logger';
import type { FormStrategyData } from '../../../events/form-event-strategy';
import { FormEventStrategy } from '../../../events/form-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

interface ProcessorDependencies {
  formFieldRepository: FormFieldRepository;
}

/**
 * Pure processor function for updating a form field
 * Receives dependencies via factory pattern for testability
 */
export const createProcessor =
  ({ formFieldRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof updateFormFieldRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing update form field', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      fieldId: payload.FieldId,
      parentType: payload.ParentType,
      isCustomField: payload.IsCustomField,
    });

    // Fetch current form configuration for the parent type
    const formConfig = await formFieldRepository.findByParentType(
      payload.ParentType
    );

    const customAttributeSchema = formConfig?.customAttributeSchema;

    try {
      // Build the field object based on whether it's a custom or standard field
      let field: Parameters<typeof updateFieldAndPersist>[0]['field'];

      if (payload.IsCustomField) {
        field = {
          fieldId: payload.FieldId,
          parentType: payload.ParentType,
          isCustomField: true,
          label: payload.Label,
          altLabel: payload.AltLabel,
          description: payload.Description,
          options: payload.Options,
          isRequired: payload.Required,
          isHidden: payload.Hidden,
          isReadOnly: payload.ReadOnly,
          defaultValue: payload.DefaultValue,
          conditions: payload.Conditions,
        };
      } else {
        field = {
          fieldId: payload.FieldId,
          parentType: payload.ParentType,
          isCustomField: false,
          label: payload.Label,
          description: payload.Description,
          isRequired: payload.Required,
          isHidden: payload.Hidden,
          isReadOnly: payload.ReadOnly,
          defaultValue: payload.DefaultValue,
          conditions: payload.Conditions,
        };
      }

      const { fieldId } = await updateFieldAndPersist({
        field,
        currentCustomAttributeSchema: customAttributeSchema
          ? {
              id: customAttributeSchema.Id,
              schema: customAttributeSchema.Schema,
              uiSchema: customAttributeSchema.UiSchema,
            }
          : null,
        generateSchemaId: randomUUID,
        persist: async (args: {
          schemaId: string;
          parentType: ParentType;
          formFieldConfigurations:
            | PersistFormFieldConfigurationInput
            | PersistFormFieldConfigurationInput[];
          schema: JsonSchema7;
          uiSchema: VerticalLayout;
          fieldsToDelete: string[];
        }) => {
          await formFieldRepository.persist({
            schemaId: args.schemaId,
            parentType: args.parentType,
            formFieldConfigurations: args.formFieldConfigurations,
            schema: args.schema,
            uiSchema: args.uiSchema,
            fieldsToDelete: args.fieldsToDelete,
            userId: context.userId,
            orgKey: context.orgKey,
          });
        },
      });

      logger.info('Successfully updated form field', {
        fieldId,
        parentType: payload.ParentType,
      });

      return { Id: fieldId };
    } catch (error: unknown) {
      if (error instanceof FormFieldOperationError) {
        throw new BadRequest(error.message);
      }
      throw error;
    }
  };

/**
 * Processor for PUT /form-fields
 * Updates an existing form field (custom or standard) with permission check, database update, and event emission
 */
export const updateFormFieldProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const formFieldRepository = createFormFieldRepository(db);

  const processor = createProcessor({
    formFieldRepository,
  });

  // Create form event strategy for emitting FormConfigured events
  const eventBridge = new EventBridgeClient({});
  const formEventStrategy = new FormEventStrategy(
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateFormFieldRequestSchema>()
    .withSchema(updateFormFieldRequestSchema)
    .withObjectName('custom_attribute_schema')
    .withEventStrategy(formEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'custom_attribute_schema',
        action: 'update',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof updateFormFieldRequestSchema>,
          FormStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, FormStrategyData>> => {
        const result = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: result }),
          },
          strategyData: {
            formFieldIds: [
              {
                fieldId: result.Id,
                parentType: context.payload.ParentType,
              },
            ],
          },
        };
      }
    )
    .execute(event, context);
};
