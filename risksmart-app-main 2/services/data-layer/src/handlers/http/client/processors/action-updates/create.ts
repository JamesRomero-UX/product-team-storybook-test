import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import {
  type ActionUpdateRepository,
  createActionUpdateRepository,
} from '../../../../../repositories/action-update-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { getLogger } from '../../../../../utils/logger';
import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { ObjectCreationFailedError } from '../../../utils/error';
import { extractServiceContext } from '../../../utils/extract-context';
import { createdResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

// Request body schema
export const createActionUpdateRequestSchema = z.object({
  ParentActionId: z.string().uuid('ParentActionId must be a valid UUID format'),
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z
    .string()
    .min(1, 'Description is required and must be a non-empty string'),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

interface ProcessorDependencies {
  actionUpdateRepository: ActionUpdateRepository;
}

/**
 * Processor for creating an action update
 * Handles database insertion
 */
export const createProcessor =
  ({ actionUpdateRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createActionUpdateRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create action update', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      ParentActionId: payload.ParentActionId,
      Title: payload.Title,
      Description: payload.Description,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const result = await actionUpdateRepository.insert(insertData);
    const insertedRecord = result[0];

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created action update'
      );
    }

    logger.info('Successfully created action update', {
      objectId: insertedRecord.Id,
      parentActionId: payload.ParentActionId,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /action-updates
 * Creates a new action update with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createActionUpdateProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const actionUpdateRepository = createActionUpdateRepository(db);

  const processor = createProcessor({
    actionUpdateRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'action_update',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createActionUpdateRequestSchema>()
    .withSchema(createActionUpdateRequestSchema)
    .withObjectName('action_update')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'action_update',
        action: 'insert',
      },
      // Check permission to create action update as child object via ParentActionId
      {
        objectName: 'rs_node',
        action: 'insert',
        objectId: payload.ParentActionId,
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createActionUpdateRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const result = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: createdResponse({
            event,
            object: result,
            objectType: 'action-update',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
