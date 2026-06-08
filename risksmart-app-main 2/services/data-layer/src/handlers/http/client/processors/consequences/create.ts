import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import {
  type ConsequenceRepository,
  createConsequenceRepository,
} from '../../../../../repositories/consequence-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
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

// Request body schema
export const createConsequenceRequestSchema = z.object({
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z.string(),
  Criticality: z.number().int().nullish(),
  CostType: z.nativeEnum(CostType),
  CostValue: z.number(),
  ParentIssueId: z.string().uuid('ParentIssueId must be a valid UUID format'),
  Type: z.nativeEnum(ConsequenceType).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

export type CreateConsequenceRequest = z.infer<
  typeof createConsequenceRequestSchema
>;

export interface ProcessorDependencies {
  consequenceRepository: ConsequenceRepository;
}

/**
 * Processor for creating a consequence
 * Handles database insertion
 */
export const createProcessor =
  ({ consequenceRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: CreateConsequenceRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing create consequence', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertedRecord = await consequenceRepository.insert({
      ...payload,
      ModifiedByUser: context.userId,
      CreatedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    });

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created consequence'
      );
    }

    logger.info('Successfully created consequence', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /consequences
 * Creates a new consequence with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createConsequenceProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const consequenceRepository = createConsequenceRepository(db);

  const processor = createProcessor({
    consequenceRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'consequence',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createConsequenceRequestSchema>()
    .withSchema(createConsequenceRequestSchema)
    .withObjectName('consequence')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'consequence',
        action: 'insert',
      },
      {
        objectName: 'rs_node',
        objectId: payload.ParentIssueId,
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createConsequenceRequestSchema>,
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
            objectType: 'consequence',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
