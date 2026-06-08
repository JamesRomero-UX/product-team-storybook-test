import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';

import {
  type AcceptanceRepository,
  createAcceptanceRepository,
} from '../../../../../repositories/acceptance-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  type CreateAcceptanceRequest,
  createAcceptanceRequestSchema,
} from '../../../../../schemas/acceptance';
import { getLogger } from '../../../../../utils/logger';
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

const logger = getLogger();

export interface ProcessorDependencies {
  acceptanceRepository: AcceptanceRepository;
}

/**
 * Processor for creating an acceptance
 * Handles database insertion
 */
export const createProcessor =
  ({ acceptanceRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: CreateAcceptanceRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing create acceptance', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertedRecord = await acceptanceRepository.insertWithRelationships(
      {
        ...payload,
        CreatedByUser: context.userId,
        ModifiedByUser: context.userId,
        OrgKey: context.orgKey,
        CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
      },
      payload.ParentId,
      context
    );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created acceptance'
      );
    }

    logger.info('Successfully created acceptance', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /acceptances
 * Creates a new acceptance with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createAcceptanceProcessor = async (
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

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'acceptance',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createAcceptanceRequestSchema>()
    .withSchema(createAcceptanceRequestSchema)
    .withObjectName('acceptance')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'acceptance',
        action: 'insert',
      },
      {
        objectName: 'rs_node',
        objectId: payload.ParentId,
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          CreateAcceptanceRequest,
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
