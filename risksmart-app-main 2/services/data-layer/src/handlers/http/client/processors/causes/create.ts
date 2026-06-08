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
import { ObjectCreationFailedError } from '../../../utils/error';
import { extractServiceContext } from '../../../utils/extract-context';
import { createdResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

// Request body schema
export const createCauseRequestSchema = z.object({
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z.string(),
  Significance: z.number().int().min(1).max(5).nullish(),
  ParentIssueId: z.string().uuid('ParentIssueId must be a valid UUID format'),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

export type CreateCauseRequest = z.infer<typeof createCauseRequestSchema>;

export interface ProcessorDependencies {
  causeRepository: CauseRepository;
}

/**
 * Processor for creating a cause
 * Handles database insertion
 */
export const createProcessor =
  ({ causeRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: CreateCauseRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing create cause', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertedRecord = await causeRepository.insert({
      ...payload,
      ModifiedByUser: context.userId,
      CreatedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    });

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError('Failed to retrieve created cause');
    }

    logger.info('Successfully created cause', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /causes
 * Creates a new cause with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createCauseProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const causeRepository = createCauseRepository(db);

  const processor = createProcessor({
    causeRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'cause',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createCauseRequestSchema>()
    .withSchema(createCauseRequestSchema)
    .withObjectName('cause')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'cause',
        action: 'insert',
      },
      {
        objectName: 'rs_node',
        objectId: payload.ParentIssueId,
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createCauseRequestSchema>,
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
