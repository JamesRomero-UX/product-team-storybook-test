import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
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
  createIndicatorRepository,
  type IndicatorRelationships,
  type IndicatorRepository,
} from '../../../../../repositories/indicator-repository';
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
export const updateIndicatorRequestSchema = z.object({
  Id: z.string().uuid('Id must be a valid UUID format'),
  Title: z.string().min(1, 'Title is required'),
  Type: z.nativeEnum(IndicatorType),
  Description: z.string().nullable().optional(),
  Unit: z.string().nullable().optional(),
  UpperToleranceNum: z.number().nullable().optional(),
  LowerToleranceNum: z.number().nullable().optional(),
  TargetValueTxt: z.string().nullable().optional(),
  UpperAppetiteNum: z.number().nullable().optional(),
  LowerAppetiteNum: z.number().nullable().optional(),
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
  indicatorRepository: IndicatorRepository;
}

/**
 * Processor for updating an indicator
 * Handles database update with relationships
 */
export const updateProcessor =
  ({ indicatorRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof updateIndicatorRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing update indicator', {
      indicatorId: payload.Id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const {
      Id: _id,
      OwnerUserIds,
      OwnerGroupIds,
      ContributorUserIds,
      ContributorGroupIds,
      TagTypeIds,
      DepartmentTypeIds,
      Schedule,
      ...entityFields
    } = payload;

    const updateData = {
      ...entityFields,
      ModifiedByUser: context.userId,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const relationships: IndicatorRelationships = {
      ownerUserIds: OwnerUserIds ?? [],
      ownerGroupIds: OwnerGroupIds ?? [],
      contributorUserIds: ContributorUserIds ?? [],
      contributorGroupIds: ContributorGroupIds ?? [],
      tagTypeIds: TagTypeIds ?? [],
      departmentTypeIds: DepartmentTypeIds ?? [],
      schedule: Schedule ?? null,
    };

    const updatedRecord = await indicatorRepository.updateWithRelationships(
      payload.Id,
      updateData,
      relationships,
      context
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated indicator');
    }

    logger.info('Successfully updated indicator', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /indicators/{id}
 * Updates an indicator with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateIndicatorProcessor = async (
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
  const indicatorRepository = createIndicatorRepository(db);

  const processor = updateProcessor({
    indicatorRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'indicator',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateIndicatorRequestSchema>()
    .withSchema(updateIndicatorRequestSchema)
    .withObjectName('indicator')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      if (payload.Id && payload.Id !== id) {
        throw new BadRequest('Body Id does not match path parameter id');
      }

      return [
        {
          objectName: 'indicator',
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
          z.infer<typeof updateIndicatorRequestSchema>,
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
            objectType: 'indicator',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
