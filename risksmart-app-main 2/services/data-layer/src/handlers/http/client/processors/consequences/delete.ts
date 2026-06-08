import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
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
import type { PermissionCheck } from '../../../utils/check-permissions';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

// Request body schema for batch delete
const deleteConsequencesBodySchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid consequence ID format'))
    .min(1, 'At least one ID is required')
    .max(200, 'Maximum 200 IDs allowed per request'),
});

type DeleteConsequencesBody = z.infer<typeof deleteConsequencesBodySchema>;

export interface ProcessorDependencies {
  consequenceRepository: ConsequenceRepository;
}

/**
 * Processor for batch deleting consequences
 * Handles transactional deletion and validates which IDs were actually deleted
 * Returns the list of IDs that were successfully deleted
 */
export const createProcessor =
  ({ consequenceRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: DeleteConsequencesBody;
    context: ServiceContext;
  }): Promise<string[]> => {
    const { Ids } = payload;

    logger.info('Processing batch delete consequences', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      consequenceIds: Ids,
      count: Ids.length,
    });

    const deletedIds = await consequenceRepository.deleteByIds(Ids);

    // Check if any rows were actually deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified consequences were found');
    }

    // Log warning if some IDs were not found
    const missingIds = Ids.filter((id) => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some consequences were not found', {
        requestedIds: Ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted consequences', {
      requestedIds: Ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return deletedIds;
  };

/**
 * Processor for DELETE /consequences
 * Deletes consequences with permission checks and event emission
 * Returns 200 with { deletedCount }
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const deleteConsequencesProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const consequenceRepository = createConsequenceRepository(db);

  const processor = createProcessor({
    consequenceRepository,
  });

  // Create object event strategy for emitting ObjectDeleted events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'consequence',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteConsequencesBodySchema>()
    .withSchema(deleteConsequencesBodySchema)
    .withObjectName('consequence')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'consequence',
            action: 'delete',
          },
          {
            objectName: 'rs_node',
            action: 'delete',
            objectId: id,
          },
        ]);
      }

      return result;
    })
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof deleteConsequencesBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const deletedIds = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deletedCount: deletedIds.length }),
          },
          strategyData: {
            // Only emit events for IDs that were actually deleted
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
