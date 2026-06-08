import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import type { z } from 'zod';

import {
  type AppetiteRepository,
  createAppetiteRepository,
} from '../../../../../repositories/appetite-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  type CreateAppetiteRequest,
  createAppetiteRequestSchema,
} from '../../../../../schemas/appetite';
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
  appetiteRepository: AppetiteRepository;
}

/**
 * Processor for creating an appetite
 * Handles database insertion
 */
export const createProcessor =
  ({ appetiteRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: CreateAppetiteRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing create appetite', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      Statement: payload.Statement ?? null,
      EffectiveDate: payload.EffectiveDate ?? null,
      AppetiteType: payload.AppetiteType,
      LowerAppetite:
        payload.AppetiteType === 'risk'
          ? (payload.LowerAppetite ?? null)
          : null,
      UpperAppetite:
        payload.AppetiteType === 'risk'
          ? (payload.UpperAppetite ?? null)
          : null,
      ImpactAppetite:
        payload.AppetiteType === 'impact' ? payload.ImpactAppetite : null,
      LikelihoodAppetite:
        payload.AppetiteType === 'likelihood'
          ? (payload.LikelihoodAppetite ?? null)
          : null,
      ImpactId: payload.AppetiteType === 'impact' ? payload.ImpactId : null,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const insertedRecord = await appetiteRepository.insertWithParents(
      insertData,
      payload.ParentIds,
      context
    );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created appetite'
      );
    }

    logger.info('Successfully created appetite', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /appetites
 * Creates a new appetite with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createAppetiteProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const appetiteRepository = createAppetiteRepository(db);

  const processor = createProcessor({
    appetiteRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'appetite',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createAppetiteRequestSchema>()
    .withSchema(createAppetiteRequestSchema)
    .withObjectName('appetite')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'appetite',
        action: 'insert',
      },
      ...payload.ParentIds.map((id: string) => ({
        objectName: 'rs_node' as const,
        objectId: id,
        action: 'insert' as const,
      })),
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createAppetiteRequestSchema>,
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
