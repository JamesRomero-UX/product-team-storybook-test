import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createRiskRepository,
  type RiskRelationships,
  type RiskRepository,
} from '../../../../../repositories/risk-repository';
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

// Request body schema
export const updateRiskRequestSchema = z.object({
  Id: z.string().uuid('Id must be a valid UUID format'),
  ParentRiskId: z
    .string()
    .uuid('ParentRiskId must be a valid UUID format')
    .nullable()
    .optional(),
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Tier: z.number().int('Tier must be an integer'),
  Description: z.string().nullable().optional(),
  Treatment: z.nativeEnum(RiskTreatmentType).nullable().optional(),
  Status: z.nativeEnum(RiskStatusType).nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  OwnerUserIds: z.array(z.string()).optional().default([]),
  OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
  ContributorUserIds: z.array(z.string()).optional().default([]),
  ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
  Schedule: z
    .object({
      Frequency: z.nativeEnum(TestFrequency).nullable().optional(),
      ManualDueDate: z.string().nullable().optional(),
      StartDate: z.string().nullable().optional(),
      TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullable().optional(),
      TimeToCompleteValue: z.number().int().nullable().optional(),
    })
    .nullable()
    .optional(),
});

interface ProcessorDependencies {
  riskRepository: RiskRepository;
}

/**
 * Processor for updating a risk
 * Handles database update with relationships
 */
export const updateProcessor =
  ({ riskRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof updateRiskRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing update risk', {
      riskId: payload.Id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const updateData = {
      ParentRiskId: payload.ParentRiskId ?? null,
      Title: payload.Title,
      Tier: payload.Tier,
      Description: payload.Description ?? null,
      Treatment: payload.Treatment ?? null,
      Status: payload.Status ?? null,
      ModifiedByUser: context.userId,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const relationships: RiskRelationships = {
      ownerUserIds: payload.OwnerUserIds ?? [],
      ownerGroupIds: payload.OwnerGroupIds ?? [],
      contributorUserIds: payload.ContributorUserIds ?? [],
      contributorGroupIds: payload.ContributorGroupIds ?? [],
      tagTypeIds: payload.TagTypeIds ?? [],
      departmentTypeIds: payload.DepartmentTypeIds ?? [],
      schedule: payload.Schedule ?? null,
    };

    const updatedRecord = await riskRepository.updateWithRelationships(
      payload.Id,
      updateData,
      relationships,
      context
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated risk');
    }

    logger.info('Successfully updated risk', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /risks/{id}
 * Updates a risk with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateRiskProcessor = async (
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
  const riskRepository = createRiskRepository(db);

  const processor = updateProcessor({
    riskRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'risk',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateRiskRequestSchema>()
    .withSchema(updateRiskRequestSchema)
    .withObjectName('risk')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      if (payload.Id && payload.Id !== id) {
        throw new BadRequest('Body Id does not match path parameter id');
      }

      return [
        {
          objectName: 'risk',
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
          z.infer<typeof updateRiskRequestSchema>,
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
            objectType: 'risk',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
