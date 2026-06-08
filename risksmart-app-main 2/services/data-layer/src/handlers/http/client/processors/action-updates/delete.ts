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
  type ActionUpdateRepository,
  createActionUpdateRepository,
} from '../../../../../repositories/action-update-repository';
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
const deleteActionUpdatesBodySchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid update ID format'))
    .min(1, 'At least one ID is required')
    .max(200, 'Maximum 200 IDs allowed per request'),
});

type DeleteActionUpdatesBody = z.infer<typeof deleteActionUpdatesBodySchema>;

export interface ProcessorDependencies {
  actionUpdateRepository: ActionUpdateRepository;
}

/**
 * Processor for batch deleting action updates
 * Handles transactional deletion and validates which IDs were actually deleted
 * Returns the list of IDs that were successfully deleted
 */
export const createProcessor =
  ({ actionUpdateRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: DeleteActionUpdatesBody;
    context: ServiceContext;
  }): Promise<string[]> => {
    const { Ids: ids } = payload;

    logger.info('Processing batch delete action updates', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      updateIds: ids,
      count: ids.length,
    });

    const deletedIds = await actionUpdateRepository.deleteMany(ids);

    // Check if any rows were actually deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified action updates were found');
    }

    // Log warning if some IDs were not found
    const missingIds = ids.filter((id) => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some action updates were not found', {
        requestedIds: ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted action updates', {
      requestedIds: ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return deletedIds;
  };

/**
 * Processor for DELETE /action-updates
 * Deletes action updates with permission checks and event emission
 * Returns 204 No Content on success
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const deleteActionUpdatesProcessor = async (
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

  // Create object event strategy for emitting ObjectDeleted events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'action_update',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteActionUpdatesBodySchema>()
    .withSchema(deleteActionUpdatesBodySchema)
    .withObjectName('action_update')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'action_update',
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
          z.infer<typeof deleteActionUpdatesBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const deletedIds = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({ event, objectType: 'action-update' }),
          strategyData: {
            // Only emit events for IDs that were actually deleted
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
