import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import {
  type ActionRelationships,
  type ActionRepository,
  createActionRepository,
} from '../../../../../repositories/action-repository';
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
export const createActionRequestSchema = z.object({
  ParentId: z
    .string()
    .uuid('ParentId must be a valid UUID format')
    .nullable()
    .optional(),
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  DateDue: z.string().min(1, 'DateDue is required'),
  DateRaised: z.string().min(1, 'DateRaised is required'),
  Status: z.nativeEnum(ActionStatus),
  Priority: z.number().int().nullable().optional(),
  Description: z.string().nullable().optional(),
  ClosedDate: z.string().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  OwnerUserIds: z.array(z.string()).optional().default([]),
  OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
  ContributorUserIds: z.array(z.string()).optional().default([]),
  ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateActionRequest = z.infer<typeof createActionRequestSchema>;

export interface ProcessorDependencies {
  actionRepository: ActionRepository;
}

/**
 * Processor for creating an action
 * Handles database insertion
 */
export const createProcessor =
  ({ actionRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: CreateActionRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing create action', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      Title: payload.Title,
      Description: payload.Description ?? '',
      Status: payload.Status,
      Priority: payload.Priority ?? null,
      DateDue: payload.DateDue,
      DateRaised: payload.DateRaised,
      ClosedDate: payload.ClosedDate ?? null,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const relationships: ActionRelationships = {
      parentId: payload.ParentId ?? null,
      ownerUserIds: payload.OwnerUserIds ?? [],
      ownerGroupIds: payload.OwnerGroupIds ?? [],
      contributorUserIds: payload.ContributorUserIds ?? [],
      contributorGroupIds: payload.ContributorGroupIds ?? [],
      tagTypeIds: payload.TagTypeIds ?? [],
      departmentTypeIds: payload.DepartmentTypeIds ?? [],
    };

    const insertedRecord = await actionRepository.insertWithRelationships(
      insertData,
      relationships,
      context
    );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError('Failed to retrieve created action');
    }

    logger.info('Successfully created action', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /actions
 * Creates a new action with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createActionProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const actionRepository = createActionRepository(db);

  const processor = createProcessor({
    actionRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'action',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createActionRequestSchema>()
    .withSchema(createActionRequestSchema)
    .withObjectName('action')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) =>
      payload.ParentId
        ? [
            {
              objectName: 'action',
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
              objectName: 'action',
              action: 'insert',
            },
          ]
    )
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createActionRequestSchema>,
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
            objectType: 'action',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
