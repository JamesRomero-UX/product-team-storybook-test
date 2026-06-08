import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import {
  type CauseRepository,
  createCauseRepository,
} from '../../../../../repositories/cause-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { getLogger } from '../../../../../utils/logger';
import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import { okResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

// Request body schema
export const updateCauseRequestSchema = z.object({
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z.string(),
  Significance: z.number().int().min(1).max(5).nullish(),
  ParentIssueId: z.string().uuid('ParentIssueId must be a valid UUID format'),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OriginalTimestamp: z.string().min(1, 'OriginalTimestamp is required'),
});

export type UpdateCauseRequest = z.infer<typeof updateCauseRequestSchema>;

export interface ProcessorDependencies {
  causeRepository: CauseRepository;
}

/**
 * Processor for updating a cause
 * Handles database update with optimistic locking
 */
export const updateProcessor =
  ({ causeRepository }: ProcessorDependencies) =>
  async ({
    id,
    payload,
    context,
  }: {
    id: string;
    payload: UpdateCauseRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing update cause', {
      causeId: id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const { OriginalTimestamp, ...updatePayload } = payload;

    const updatedRecord = await causeRepository.update(
      id,
      {
        ...updatePayload,
        ModifiedByUser: context.userId,
        CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
      },
      context,
      OriginalTimestamp
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated cause');
    }

    logger.info('Successfully updated cause', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /causes/{id}
 * Updates a cause with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateCauseProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidPattern.test(id)) {
    throw new BadRequest(
      'Missing or invalid path parameter: id must be a valid UUID'
    );
  }

  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const causeRepository = createCauseRepository(db);

  const processor = updateProcessor({
    causeRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'cause',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateCauseRequestSchema>()
    .withSchema(updateCauseRequestSchema)
    .withObjectName('cause')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'cause',
        action: 'update',
      },
      {
        objectName: 'rs_node',
        objectId: id,
        action: 'update',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof updateCauseRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const result = await processor({
          id,
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: okResponse({
            event,
            object: result,
            objectType: 'cause',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
