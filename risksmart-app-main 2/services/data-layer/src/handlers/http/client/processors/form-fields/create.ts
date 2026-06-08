import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JsonSchema7, VerticalLayout } from '@jsonforms/core';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import {
  createFieldAndPersist,
  FormFieldOperationError,
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
import { createFormFieldRequestSchema } from '../../../../../schemas/form-field';
import { getLogger } from '../../../../../utils/logger';
import type { FormStrategyData } from '../../../events/form-event-strategy';
import { FormEventStrategy } from '../../../events/form-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import { createdResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

interface ProcessorDependencies {
  formFieldRepository: FormFieldRepository;
}

/**
 * Pure processor function for creating a form field
 * Receives dependencies via factory pattern for testability
 */
export const createProcessor =
  ({ formFieldRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createFormFieldRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create form field', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      parentType: payload.ParentType,
      fieldType: payload.Type,
    });

    // Fetch current form configuration for the parent type
    const formConfig = await formFieldRepository.findByParentType(
      payload.ParentType
    );

    const customAttributeSchema = formConfig?.customAttributeSchema;

    try {
      const { fieldId } = await createFieldAndPersist({
        field: {
          parentType: payload.ParentType,
          fieldType: payload.Type,
          label: payload.Label,
          altLabel: payload.AltLabel,
          description: payload.Description,
          options: payload.Options,
          isRequired: payload.Required,
          isHidden: payload.Hidden,
          isReadOnly: payload.ReadOnly,
          defaultValue: payload.DefaultValue,
          conditions: payload.Conditions,
        },
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

      logger.info('Successfully created form field', {
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
 * Processor for POST /form-fields
 * Creates a new custom attribute field with permission check, database insert, and event emission
 */
export const createFormFieldProcessor = async (
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
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createFormFieldRequestSchema>()
    .withSchema(createFormFieldRequestSchema)
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
          z.infer<typeof createFormFieldRequestSchema>,
          FormStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, FormStrategyData>> => {
        const result = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: createdResponse({
            event,
            object: result,
            objectType: 'form-fields',
          }),
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
