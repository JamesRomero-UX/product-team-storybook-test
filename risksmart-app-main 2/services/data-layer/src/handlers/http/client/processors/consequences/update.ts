import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import {
  type ConsequenceRepository,
  createConsequenceRepository,
} from '../../../../../repositories/consequence-repository';
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
export const updateConsequenceRequestSchema = z.object({
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z.string(),
  Criticality: z.number().int().nullish(),
  CostType: z.nativeEnum(CostType),
  CostValue: z.number(),
  ParentIssueId: z.string().uuid('ParentIssueId must be a valid UUID format'),
  Type: z.nativeEnum(ConsequenceType).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OriginalTimestamp: z.string().min(1, 'OriginalTimestamp is required'),
});

export type UpdateConsequenceRequest = z.infer<
  typeof updateConsequenceRequestSchema
>;

export interface ProcessorDependencies {
  consequenceRepository: ConsequenceRepository;
}

/**
 * Processor for updating a consequence
 * Handles database update with optimistic locking
 */
export const updateProcessor =
  ({ consequenceRepository }: ProcessorDependencies) =>
  async ({
    id,
    payload,
    context,
  }: {
    id: string;
    payload: UpdateConsequenceRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing update consequence', {
      consequenceId: id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const { OriginalTimestamp, ...updatePayload } = payload;

    const updatedRecord = await consequenceRepository.update(
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
      throw new Error('Failed to retrieve updated consequence');
    }

    logger.info('Successfully updated consequence', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /consequences/{id}
 * Updates a consequence with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateConsequenceProcessor = async (
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
  const consequenceRepository = createConsequenceRepository(db);

  const processor = updateProcessor({
    consequenceRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'consequence',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateConsequenceRequestSchema>()
    .withSchema(updateConsequenceRequestSchema)
    .withObjectName('consequence')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'consequence',
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
          z.infer<typeof updateConsequenceRequestSchema>,
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
            objectType: 'consequence',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
