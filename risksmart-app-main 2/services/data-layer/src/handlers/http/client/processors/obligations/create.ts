import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import { ObligationType } from '@risksmart-app/domain/src/types/consts/obligation-type';
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
  createObligationRepository,
  type ObligationRelationships,
  type ObligationRepository,
} from '../../../../../repositories/obligation-repository';
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
export const createObligationRequestSchema = z.object({
  ParentId: z
    .string()
    .uuid('ParentId must be a valid UUID format')
    .nullable()
    .optional(),
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Adherence: z.string().min(1, 'Adherence is required'),
  Type: z.nativeEnum(ObligationType),
  Description: z.string().nullable().optional(),
  Interpretation: z.string().nullable().optional(),
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
  obligationRepository: ObligationRepository;
}

/**
 * Processor for creating an obligation
 * Handles database insertion
 */
export const createProcessor =
  ({ obligationRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createObligationRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create obligation', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      ParentId: payload.ParentId ?? null,
      Title: payload.Title,
      Adherence: payload.Adherence,
      Type: payload.Type,
      Description: payload.Description ?? '',
      Interpretation: payload.Interpretation ?? null,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const relationships: ObligationRelationships = {
      ownerUserIds: payload.OwnerUserIds ?? [],
      ownerGroupIds: payload.OwnerGroupIds ?? [],
      contributorUserIds: payload.ContributorUserIds ?? [],
      contributorGroupIds: payload.ContributorGroupIds ?? [],
      tagTypeIds: payload.TagTypeIds ?? [],
      departmentTypeIds: payload.DepartmentTypeIds ?? [],
      schedule: payload.Schedule ?? null,
      scheduleState: payload.ScheduleState ?? null,
    };

    const insertedRecord = await obligationRepository.insertWithRelationships(
      insertData,
      relationships,
      context
    );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created obligation'
      );
    }

    logger.info('Successfully created obligation', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /obligations
 * Creates a new obligation with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createObligationProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const obligationRepository = createObligationRepository(db);

  const processor = createProcessor({
    obligationRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'obligation',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createObligationRequestSchema>()
    .withSchema(createObligationRequestSchema)
    .withObjectName('obligation')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) =>
      payload.ParentId
        ? [
            {
              objectName: 'obligation',
              action: 'insert',
            },
            {
              objectName: 'rs_node',
              objectId: payload.ParentId,
              action: 'insert',
            },
          ]
        : [
            {
              objectName: 'obligation',
              action: 'insert',
            },
          ]
    )
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createObligationRequestSchema>,
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
            objectType: 'obligation',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
