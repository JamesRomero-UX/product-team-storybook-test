import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createIndicatorRepository,
  type IndicatorRepository,
} from '../../../../../repositories/indicator-repository';
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
const deleteIndicatorsBodySchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid indicator ID format'))
    .min(1, 'At least one ID is required')
    .max(200, 'Maximum 200 IDs allowed per request'),
});

type DeleteIndicatorsBody = z.infer<typeof deleteIndicatorsBodySchema>;

export interface ProcessorDependencies {
  indicatorRepository: IndicatorRepository;
}

/**
 * Processor for batch deleting indicators
 * Handles cascade deletion of indicator_results then indicators
 * Returns the list of IDs that were successfully deleted
 */
export const createProcessor =
  ({ indicatorRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: DeleteIndicatorsBody;
    context: ServiceContext;
  }): Promise<string[]> => {
    const { Ids: ids } = payload;

    logger.info('Processing batch delete indicators', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      indicatorIds: ids,
      count: ids.length,
    });

    const deletedIds = await indicatorRepository.deleteMany(ids);

    // Check if any rows were actually deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified indicators were found');
    }

    // Log warning if some IDs were not found
    const missingIds = ids.filter((id) => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some indicators were not found', {
        requestedIds: ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted indicators', {
      requestedIds: ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return deletedIds;
  };

/**
 * Processor for DELETE /indicators
 * Deletes indicators with permission checks and event emission
 * Returns 204 No Content on success
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const deleteIndicatorsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const indicatorRepository = createIndicatorRepository(db);

  const processor = createProcessor({
    indicatorRepository,
  });

  // Create object event strategy for emitting ObjectDeleted events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'indicator',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteIndicatorsBodySchema>()
    .withSchema(deleteIndicatorsBodySchema)
    .withObjectName('indicator')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'indicator',
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
          z.infer<typeof deleteIndicatorsBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const deletedIds = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({ event, objectType: 'indicator' }),
          strategyData: {
            // Only emit events for IDs that were actually deleted
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
