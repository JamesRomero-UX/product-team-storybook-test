import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { getDatabaseConnection } from 'src/repositories';
import {
  createTestResultRepository,
  type TestResultRepository,
} from 'src/repositories/test-result-repository';
import { createControlTestResultRequestSchema } from 'src/schemas/test-result';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';
import type z from 'zod';

import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { ObjectCreationFailedError } from '../../../utils/error';
import { extractServiceContext } from '../../../utils/extract-context';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

export interface ProcessorDependencies {
  testResultRepository: TestResultRepository;
}

const logger = getLogger();

/**
 * Processor for creating control test results
 * Creates one test_result per ControlId and links via assessment_result_parent
 */
export const createProcessor =
  ({ testResultRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createControlTestResultRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create control test results', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      controlCount: payload.ControlIds.length,
    });

    const results = await testResultRepository.insertBulk(payload, context);

    if (!results || results.length === 0) {
      throw new ObjectCreationFailedError(
        'Failed to create control test results'
      );
    }

    logger.info('Successfully created control test results', {
      objectIds: results.map((r) => r.Id),
    });

    return results;
  };

/**
 * Processor for POST /test-results
 * Creates new control test results with permission check, database insert, and event emission
 * Returns the array of created result IDs
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createControlTestResultProcessor = async (
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

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'test_result',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<
    typeof createControlTestResultRequestSchema
  >()
    .withSchema(createControlTestResultRequestSchema)
    .withObjectName('test_result')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'test_result',
        action: 'insert',
      },
      ...payload.ControlIds.map((controlId) => ({
        objectName: 'rs_node',
        objectId: controlId,
        action: 'insert' as const,
      })),
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createControlTestResultRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const results = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: {
            statusCode: 201,
            body: JSON.stringify({ Ids: results.map((r) => r.Id) }),
            headers: { 'Content-Type': 'application/json' },
          },
          strategyData: {
            objectIds: results.map((r) => r.Id),
          },
        };
      }
    )
    .execute(event, context);
};
