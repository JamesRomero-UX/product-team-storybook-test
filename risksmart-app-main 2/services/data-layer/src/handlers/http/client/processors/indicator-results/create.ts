import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type { InferSelectModel } from '@risksmart-app/drizzle/src/db';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { getDatabaseConnection } from 'src/repositories';
import {
  createIndicatorResultRepository,
  type IndicatorResultRepository,
} from 'src/repositories/indicator-result-repository';
import { createIndicatorResultRequestSchema } from 'src/schemas/indicator-result';
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
import { createdResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

export interface ProcessorDependencies {
  indicatorResultRepository: IndicatorResultRepository;
}

const logger = getLogger();

/**
 * Processor for creating an indicator result
 * Handles database insertion
 */
export const createProcessor =
  ({ indicatorResultRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createIndicatorResultRequestSchema>;
    context: ServiceContext;
  }): Promise<InferSelectModel<'indicator_result'>> => {
    const { userId, orgKey, tenant } = context;

    logger.info('Processing create indicator result', {
      userId,
      orgKey,
      tenant,
    });

    const data = {
      ...payload,
      CreatedByUser: userId,
      ModifiedByUser: userId,
      OrgKey: orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const result = await indicatorResultRepository.insert(data);
    const insertedRecord = result[0];

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created indicator result'
      );
    }

    logger.info('Successfully created indicator result', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /indicator-results
 * Creates a new indicator result with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createIndicatorResultProcessor = async (
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

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'indicator_result',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createIndicatorResultRequestSchema>()
    .withSchema(createIndicatorResultRequestSchema)
    .withObjectName('indicator_result')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'indicator_result',
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createIndicatorResultRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const result = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: createdResponse({
            event,
            object: result,
            objectType: 'indicator-result',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
