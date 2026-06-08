import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import type { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createObligationImpactRepository,
  type ObligationImpactRepository,
} from '../../../../../repositories/obligation-impact-repository';
import { createObligationImpactRequestSchema } from '../../../../../schemas/obligation-impact';
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

interface ProcessorDependencies {
  obligationImpactRepository: ObligationImpactRepository;
}

export const createProcessor =
  ({ obligationImpactRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createObligationImpactRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create obligation impact', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      ...payload,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const result = await obligationImpactRepository.insert(insertData);
    const insertedRecord = result[0];

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created obligation impact'
      );
    }

    logger.info('Successfully created obligation impact', {
      objectId: insertedRecord.Id,
      parentObligationId: payload.ParentObligationId,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /obligation-impacts
 * Creates a new obligation impact with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createObligationImpactProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const obligationImpactRepository = createObligationImpactRepository(db);

  const processor = createProcessor({
    obligationImpactRepository,
  });

  // Create object event strategy for emitting EntityCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'obligation_impact',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createObligationImpactRequestSchema>()
    .withSchema(createObligationImpactRequestSchema)
    .withObjectName('obligation_impact')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'obligation_impact',
        action: 'insert',
      },
      // Check permission to create obligation impact as child object via ParentObligationId
      {
        objectName: 'rs_node',
        action: 'insert',
        objectId: payload.ParentObligationId,
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createObligationImpactRequestSchema>,
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
            objectType: 'obligation-impact',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
