import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import { getDatabaseConnection } from 'src/repositories';
import {
  createTestResultRepository,
  type TestResultRepository,
} from 'src/repositories/test-result-repository';
import { deleteTestResultsRequestSchema } from 'src/schemas/test-result';
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
  testResultRepository: TestResultRepository;
}

/**
 * Processor for batch deleting test results
 * Handles transactional deletion and validates which IDs were actually deleted
 * Returns the list of IDs that were successfully deleted
 */
export const createProcessor =
  ({ testResultRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof deleteTestResultsRequestSchema>;
    context: ServiceContext;
  }): Promise<string[]> => {
    const { Ids } = payload;

    logger.info('Processing batch delete test results', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      testResultIds: Ids,
      count: Ids.length,
    });

    const deletedIds = await testResultRepository.deleteMany(Ids);

    // Check if any rows were actually deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified test results were found');
    }

    // Log warning if some IDs were not found
    const missingIds = Ids.filter((id) => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some test results were not found', {
        requestedIds: Ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted test results', {
      requestedIds: Ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return deletedIds;
  };

/**
 * Processor for DELETE /test-results
 * Deletes test results with permission checks and event emission
 * Returns 204 No Content on success
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const deleteTestResultsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const testResultRepository = createTestResultRepository(db);

  const processor = createProcessor({
    testResultRepository,
  });

  // Create object event strategy for emitting ObjectDeleted events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'test_result',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteTestResultsRequestSchema>()
    .withSchema(deleteTestResultsRequestSchema)
    .withObjectName('test_result')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'test_result',
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
          z.infer<typeof deleteTestResultsRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const deletedIds = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({ event, objectType: 'test-result' }),
          strategyData: {
            // Only emit events for IDs that were actually deleted
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
