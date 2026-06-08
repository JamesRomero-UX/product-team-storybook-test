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
  type AcceptanceRepository,
  createAcceptanceRepository,
} from '../../../../../repositories/acceptance-repository';
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
const deleteAcceptancesBodySchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid acceptance ID format'))
    .min(1, 'At least one ID is required')
    .max(200, 'Maximum 200 IDs allowed per request'),
});

type DeleteAcceptancesBody = z.infer<typeof deleteAcceptancesBodySchema>;

export interface ProcessorDependencies {
  acceptanceRepository: AcceptanceRepository;
}

/**
 * Processor for batch deleting acceptances
 * Handles transactional deletion and validates which IDs were actually deleted
 * Returns the list of IDs that were successfully deleted
 */
export const createProcessor =
  ({ acceptanceRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: DeleteAcceptancesBody;
    context: ServiceContext;
  }): Promise<string[]> => {
    const { Ids } = payload;

    logger.info('Processing batch delete acceptances', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      acceptanceIds: Ids,
      count: Ids.length,
    });

    const deletedIds = await acceptanceRepository.deleteMany(Ids);

    // Check if any rows were actually deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified acceptances were found');
    }

    // Log warning if some IDs were not found
    const missingIds = Ids.filter((id) => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some acceptances were not found', {
        requestedIds: Ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted acceptances', {
      requestedIds: Ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return deletedIds;
  };

/**
 * Processor for DELETE /acceptances
 * Deletes acceptances with permission checks and event emission
 * Returns 204 No Content on success
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const deleteAcceptancesProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const acceptanceRepository = createAcceptanceRepository(db);

  const processor = createProcessor({
    acceptanceRepository,
  });

  // Create object event strategy for emitting ObjectDeleted events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'acceptance',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteAcceptancesBodySchema>()
    .withSchema(deleteAcceptancesBodySchema)
    .withObjectName('acceptance')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'acceptance',
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
          z.infer<typeof deleteAcceptancesBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const deletedIds = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({ event, objectType: 'acceptance' }),
          strategyData: {
            // Only emit events for IDs that were actually deleted
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
