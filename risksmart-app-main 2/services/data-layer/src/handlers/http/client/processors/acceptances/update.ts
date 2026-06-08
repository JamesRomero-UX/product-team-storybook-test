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
  type AcceptanceRepository,
  createAcceptanceRepository,
} from '../../../../../repositories/acceptance-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  type UpdateAcceptanceRequest,
  updateAcceptanceRequestSchema,
} from '../../../../../schemas/acceptance';
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
  acceptanceRepository: AcceptanceRepository;
}

/**
 * Processor for updating an acceptance
 * Handles database update
 */
export const updateProcessor =
  ({ acceptanceRepository }: ProcessorDependencies) =>
  async ({
    id,
    payload,
    context,
  }: {
    id: string;
    payload: UpdateAcceptanceRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing update acceptance', {
      acceptanceId: id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const updatedRecord = await acceptanceRepository.update(
      id,
      {
        ...payload,
        ModifiedByUser: context.userId,
        CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
      },
      context
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated acceptance');
    }

    logger.info('Successfully updated acceptance', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /acceptances/{id}
 * Updates an acceptance with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateAcceptanceProcessor = async (
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
  const acceptanceRepository = createAcceptanceRepository(db);

  const processor = updateProcessor({
    acceptanceRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'acceptance',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateAcceptanceRequestSchema>()
    .withSchema(updateAcceptanceRequestSchema)
    .withObjectName('acceptance')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'acceptance',
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
          UpdateAcceptanceRequest,
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
            objectType: 'acceptance',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
