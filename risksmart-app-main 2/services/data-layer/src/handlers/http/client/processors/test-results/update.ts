import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import { getDatabaseConnection } from 'src/repositories';
import {
  createTestResultRepository,
  type TestResultRepository,
} from 'src/repositories/test-result-repository';
import {
  type UpdateTestResultRequest,
  updateTestResultRequestSchema,
} from 'src/schemas/test-result';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';
import type { z } from 'zod';

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

export interface ProcessorDependencies {
  testResultRepository: TestResultRepository;
}

/**
 * Processor for updating a test result
 * Handles database update with optimistic concurrency check
 */
export const updateProcessor =
  ({ testResultRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: UpdateTestResultRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing update test result', {
      testResultId: payload.Id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const updateData = {
      ParentControlId: payload.ParentControlId,
      Description: payload.Description ?? '',
      DesignEffectiveness: payload.DesignEffectiveness ?? null,
      OverallEffectiveness: payload.OverallEffectiveness ?? null,
      PerformanceEffectiveness: payload.PerformanceEffectiveness ?? null,
      Submitter: payload.Submitter,
      TestDate: payload.TestDate ?? new Date().toISOString(),
      TestType: payload.TestType ?? null,
      Title: payload.Title ?? null,
      ModifiedByUser: context.userId,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const updatedRecord = await testResultRepository.update(
      payload.Id,
      updateData,
      payload.OriginalTimestamp,
      context
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated test result');
    }

    logger.info('Successfully updated test result', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /test-results/{id}
 * Updates a test result with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateTestResultProcessor = async (
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
  const testResultRepository = createTestResultRepository(db);

  const processor = updateProcessor({
    testResultRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'test_result',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateTestResultRequestSchema>()
    .withSchema(updateTestResultRequestSchema)
    .withObjectName('test_result')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      if (payload.Id && payload.Id !== id) {
        throw new BadRequest('Body Id does not match path parameter id');
      }

      return [
        {
          objectName: 'test_result',
          action: 'update',
        },
        {
          objectName: 'rs_node',
          objectId: id,
          action: 'update',
        },
      ];
    })
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof updateTestResultRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const payload = { ...context.payload, Id: id };
        const result = await processor({
          payload,
          context: context.serviceContext,
        });

        return {
          response: okResponse({
            event,
            object: result,
            objectType: 'test-result',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
