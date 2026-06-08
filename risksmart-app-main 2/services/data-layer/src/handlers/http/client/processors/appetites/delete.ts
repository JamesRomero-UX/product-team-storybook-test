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
  type AppetiteRepository,
  createAppetiteRepository,
} from '../../../../../repositories/appetite-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { getLogger } from '../../../../../utils/logger';
import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import type { PermissionCheck } from '../../../utils/check-permissions';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import { deletedResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

// Request body schema for batch delete
const deleteAppetitesBodySchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid appetite ID format'))
    .min(1, 'At least one ID is required')
    .max(200, 'Maximum 200 IDs allowed per request'),
});

type DeleteAppetitesBody = z.infer<typeof deleteAppetitesBodySchema>;

export interface ProcessorDependencies {
  appetiteRepository: AppetiteRepository;
}

/**
 * Processor for batch deleting appetites
 * Handles transactional deletion and validates which IDs were actually deleted
 * Returns the list of IDs that were successfully deleted
 */
export const createProcessor =
  ({ appetiteRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: DeleteAppetitesBody;
    context: ServiceContext;
  }): Promise<string[]> => {
    const { Ids } = payload;

    logger.info('Processing batch delete appetites', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      appetiteIds: Ids,
      count: Ids.length,
    });

    const deletedIds = await appetiteRepository.deleteMany(Ids);

    // Check if any rows were actually deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified appetites were found');
    }

    // Log warning if some IDs were not found
    const missingIds = Ids.filter((id) => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some appetites were not found', {
        requestedIds: Ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted appetites', {
      requestedIds: Ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return deletedIds;
  };

/**
 * Processor for DELETE /appetites
 * Deletes appetites with permission checks and event emission
 * Returns 204 No Content on success
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const deleteAppetitesProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const appetiteRepository = createAppetiteRepository(db);

  const processor = createProcessor({
    appetiteRepository,
  });

  // Create object event strategy for emitting ObjectDeleted events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'appetite',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteAppetitesBodySchema>()
    .withSchema(deleteAppetitesBodySchema)
    .withObjectName('appetite')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'appetite',
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
          z.infer<typeof deleteAppetitesBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const deletedIds = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({ event, objectType: 'appetite' }),
          strategyData: {
            // Only emit events for IDs that were actually deleted
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
