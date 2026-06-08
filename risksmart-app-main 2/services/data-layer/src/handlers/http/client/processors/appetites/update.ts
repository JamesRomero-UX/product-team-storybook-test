import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';

import {
  type AppetiteRepository,
  createAppetiteRepository,
} from '../../../../../repositories/appetite-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  type UpdateAppetiteRequest,
  updateAppetiteRequestSchema,
} from '../../../../../schemas/appetite';
import { getLogger } from '../../../../../utils/logger';
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
  appetiteRepository: AppetiteRepository;
}

/**
 * Processor for updating an appetite
 * Handles database update
 */
export const updateProcessor =
  ({ appetiteRepository }: ProcessorDependencies) =>
  async ({
    id,
    payload,
    context,
  }: {
    id: string;
    payload: UpdateAppetiteRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing update appetite', {
      appetiteId: id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const updateData = {
      AppetiteType: payload.AppetiteType,
      Statement: payload.Statement ?? null,
      EffectiveDate: payload.EffectiveDate ?? null,
      LowerAppetite: payload.LowerAppetite ?? null,
      UpperAppetite: payload.UpperAppetite ?? null,
      ImpactAppetite: payload.ImpactAppetite ?? null,
      LikelihoodAppetite: payload.LikelihoodAppetite ?? null,
      ImpactId: payload.ImpactId ?? null,
      ModifiedByUser: context.userId,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const updatedRecord = await appetiteRepository.update(
      id,
      updateData,
      context
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated appetite');
    }

    logger.info('Successfully updated appetite', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /appetites/{id}
 * Updates an appetite with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateAppetiteProcessor = async (
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
  const appetiteRepository = createAppetiteRepository(db);

  const processor = updateProcessor({
    appetiteRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'appetite',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateAppetiteRequestSchema>()
    .withSchema(updateAppetiteRequestSchema)
    .withObjectName('appetite')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'appetite',
        action: 'update',
      },
      {
        objectName: 'rs_node',
        objectId: id,
        action: 'update',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          UpdateAppetiteRequest,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const result = await processor({
          id,
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: okResponse({
            event,
            object: result,
            objectType: 'appetite',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
