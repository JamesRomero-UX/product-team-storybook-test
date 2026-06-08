import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import { getDatabaseConnection } from 'src/repositories';
import {
  createIndicatorResultRepository,
  type IndicatorResultRepository,
} from 'src/repositories/indicator-result-repository';
import { deleteIndicatorResultsRequestSchema } from 'src/schemas/indicator-result';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';
import type { z } from 'zod';

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

export interface ProcessorDependencies {
  indicatorResultRepository: IndicatorResultRepository;
}

/**
 * Processor for batch deleting indicator results
 * Handles transactional deletion and validates which IDs were actually deleted
 * Returns the list of IDs that were successfully deleted
 */
export const createProcessor =
  ({ indicatorResultRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof deleteIndicatorResultsRequestSchema>;
    context: ServiceContext;
  }): Promise<string[]> => {
    const { Ids } = payload;

    logger.info('Processing batch delete indicator results', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      indicatorResultIds: Ids,
      count: Ids.length,
    });

    const deletedIds = await indicatorResultRepository.deleteMany(Ids);

    // Check if any rows were actually deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified indicator results were found');
    }

    // Log warning if some IDs were not found
    const missingIds = Ids.filter((id) => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some indicator results were not found', {
        requestedIds: Ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted indicator results', {
      requestedIds: Ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return deletedIds;
  };

/**
 * Processor for DELETE /indicator-results
 * Deletes indicator results with permission checks and event emission
 * Returns 204 No Content on success
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const deleteIndicatorResultsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const indicatorResultRepository = createIndicatorResultRepository(db);

  const processor = createProcessor({
    indicatorResultRepository,
  });

  // Create object event strategy for emitting ObjectDeleted events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'indicator_result',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteIndicatorResultsRequestSchema>()
    .withSchema(deleteIndicatorResultsRequestSchema)
    .withObjectName('indicator_result')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'indicator_result',
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
          z.infer<typeof deleteIndicatorResultsRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const deletedIds = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({
            event,
            objectType: 'indicator-result',
          }),
          strategyData: {
            // Only emit events for IDs that were actually deleted
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
