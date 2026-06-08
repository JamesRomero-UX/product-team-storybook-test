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
import { ObjectCreationFailedError } from '../../../utils/error';
import { extractServiceContext } from '../../../utils/extract-context';
import { createdResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

// Request body schema
export const createRiskRequestSchema = z.object({
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
  ScheduleState: z
    .object({
      DueDate: z.string().nullable().optional(),
      OverdueDate: z.string().nullable().optional(),
      LatestDate: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

interface ProcessorDependencies {
  riskRepository: RiskRepository;
}

/**
 * Processor for creating a risk
 * Handles database insertion
 */
export const createProcessor =
  ({ riskRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createRiskRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create risk', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      ParentRiskId: payload.ParentRiskId ?? null,
      Title: payload.Title,
      Tier: payload.Tier,
      Description: payload.Description ?? null,
      Treatment: payload.Treatment ?? null,
      Status: payload.Status ?? null,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
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
      scheduleState: payload.ScheduleState ?? null,
    };

    const insertedRecord = await riskRepository.insertWithRelationships(
      insertData,
      relationships,
      context
    );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError('Failed to retrieve created risk');
    }

    logger.info('Successfully created risk', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /risks
 * Creates a new risk with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createRiskProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const riskRepository = createRiskRepository(db);

  const processor = createProcessor({
    riskRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'risk',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createRiskRequestSchema>()
    .withSchema(createRiskRequestSchema)
    .withObjectName('risk')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) =>
      payload.ParentRiskId
        ? [
            {
              objectName: 'risk',
              action: 'insert',
            },

            {
              objectName: 'rs_node',
              objectId: payload.ParentRiskId,
              action: 'insert',
            },
          ]
        : [
            {
              objectName: 'risk',
              action: 'insert',
            },
          ]
    )
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createRiskRequestSchema>,
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
