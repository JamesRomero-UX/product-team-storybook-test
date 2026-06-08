import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JsonSchema7, VerticalLayout } from '@jsonforms/core';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import {
  deleteFieldAndPersist,
  FormFieldOperationError,
} from '@risksmart-app/form-configuration/src/field-orchestrator';
import type { PersistFormFieldConfigurationInput } from '@risksmart-app/form-configuration/src/field-persistence';
import type { Conditions } from '@risksmart-app/form-configuration/src/field-types/types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';
import type { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createFormFieldRepository,
  type FormFieldRepository,
} from '../../../../../repositories/form-field-repository';
import { deleteFormFieldRequestSchema } from '../../../../../schemas/form-field';
import { getLogger } from '../../../../../utils/logger';
import type { FormStrategyData } from '../../../events/form-event-strategy';
import { FormEventStrategy } from '../../../events/form-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import { deletedResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

interface ProcessorDependencies {
  formFieldRepository: FormFieldRepository;
}

/**
 * Pure processor function for deleting a form field
 * Receives dependencies via factory pattern for testability
 */
export const createProcessor =
  ({ formFieldRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof deleteFormFieldRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing delete form field', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      fieldId: payload.FieldId,
      parentType: payload.ParentType,
    });

    // Fetch current form configuration for the parent type
    const formConfig = await formFieldRepository.findByParentType(
      payload.ParentType
    );

    const customAttributeSchema = formConfig?.customAttributeSchema;

    if (!customAttributeSchema) {
      throw new BadRequest('Custom attribute schema not found');
    }

    // Transform field configurations to the format expected by deleteFieldAndPersist
    const allFieldConfigurations: {
      fieldId: string;
      label: string;
      description?: string | null;
      isRequired: boolean;
      isHidden: boolean;
      isReadOnly: boolean;
      defaultValue?: string | null;
      conditions?: Conditions | null;
    }[] =
      formConfig?.fields_config?.map((field) => ({
        fieldId: field.FieldId ?? '',
        label: field.Label ?? '',
        description: field.Description ?? null,
        isRequired: field.Required ?? false,
        isHidden: field.Hidden ?? false,
        isReadOnly: field.ReadOnly ?? false,
        defaultValue: field.DefaultValue ?? null,
        conditions: field.Conditions ?? null,
      })) ?? [];

    try {
      const { fieldId } = await deleteFieldAndPersist({
        field: {
          fieldId: payload.FieldId,
          parentType: payload.ParentType,
        },
        currentCustomAttributeSchema: {
          id: customAttributeSchema.Id,
          schema: customAttributeSchema.Schema,
          uiSchema: customAttributeSchema.UiSchema,
        },
        allFieldConfigurations,
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

      logger.info('Successfully deleted form field', {
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
 * Processor for DELETE /form-fields
 * Deletes a custom attribute field with permission check, database delete, and event emission
 */
export const deleteFormFieldProcessor = async (
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
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteFormFieldRequestSchema>()
    .withSchema(deleteFormFieldRequestSchema)
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
          z.infer<typeof deleteFormFieldRequestSchema>,
          FormStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, FormStrategyData>> => {
        const result = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({
            event,
            objectType: 'form-fields',
            objectId: result.Id,
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
