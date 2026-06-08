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
  createIndicatorResultRepository,
  type IndicatorResultRepository,
} from 'src/repositories/indicator-result-repository';
import {
  type UpdateIndicatorResultRequest,
  updateIndicatorResultRequestSchema,
} from 'src/schemas/indicator-result';
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
  indicatorResultRepository: IndicatorResultRepository;
}

export const updateProcessor =
  ({ indicatorResultRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: UpdateIndicatorResultRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing update indicator result', {
      indicatorResultId: payload.Id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const { Id: _id, ...payloadWithoutId } = payload;
    const updateData = {
      ...payloadWithoutId,
      ModifiedByUser: context.userId,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const updatedRecord = await indicatorResultRepository.update(
      payload.Id,
      updateData,
      context
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated indicator result');
    }

    logger.info('Successfully updated indicator result', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

export const updateIndicatorResultProcessor = async (
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
  const indicatorResultRepository = createIndicatorResultRepository(db);

  const processor = updateProcessor({
    indicatorResultRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'indicator_result',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateIndicatorResultRequestSchema>()
    .withSchema(updateIndicatorResultRequestSchema)
    .withObjectName('indicator_result')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      if (payload.Id && payload.Id !== id) {
        throw new BadRequest('Body Id does not match path parameter id');
      }

      return [
        {
          objectName: 'indicator_result',
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
          z.infer<typeof updateIndicatorResultRequestSchema>,
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
