import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import { ParentIssueTypes } from '@risksmart-app/domain/src/types/consts/parent-issue-type';
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
  createIssueRepository,
  type IssueRelationships,
  type IssueRepository,
} from '../../../../../repositories/issue-repository';
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
export const updateIssueRequestSchema = z.object({
  Id: z.string().uuid('Id must be a valid UUID format'),
  Title: z.string().min(1, 'Title is required'),
  Details: z.string().nullable().optional(),
  ImpactsCustomer: z.boolean().nullable().optional(),
  IsExternalIssue: z.boolean().nullable().optional(),
  DateOccurred: z.string().min(1, 'DateOccurred is required'),
  DateIdentified: z.string().min(1, 'DateIdentified is required'),
  Type: z.nativeEnum(ParentIssueTypes),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  Meta: z.record(z.string(), z.unknown()).nullable().optional(),
  OwnerUserIds: z.array(z.string()).optional().default([]),
  OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
  ContributorUserIds: z.array(z.string()).optional().default([]),
  ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
  OriginalTimestamp: z.string().min(1, 'OriginalTimestamp is required'),
});

interface ProcessorDependencies {
  issueRepository: IssueRepository;
}

/**
 * Processor for updating an issue
 * Handles database update with relationships
 */
export const updateProcessor =
  ({ issueRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof updateIssueRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing update issue', {
      issueId: payload.Id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const {
      OwnerUserIds,
      OwnerGroupIds,
      ContributorUserIds,
      ContributorGroupIds,
      TagTypeIds,
      DepartmentTypeIds,
      OriginalTimestamp,
      ...entityFields
    } = payload;

    const updateData = {
      ...entityFields,
      Details: payload.Details ?? '',
      ModifiedByUser: context.userId,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
      Meta: (payload.Meta as JSONB) ?? null,
    };

    const relationships: IssueRelationships = {
      ownerUserIds: OwnerUserIds ?? [],
      ownerGroupIds: OwnerGroupIds ?? [],
      contributorUserIds: ContributorUserIds ?? [],
      contributorGroupIds: ContributorGroupIds ?? [],
      tagTypeIds: TagTypeIds ?? [],
      departmentTypeIds: DepartmentTypeIds ?? [],
    };

    const updatedRecord = await issueRepository.updateWithRelationships(
      payload.Id,
      updateData,
      relationships,
      context,
      OriginalTimestamp
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated issue');
    }

    logger.info('Successfully updated issue', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /issues/{id}
 * Updates an issue with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateIssueProcessor = async (
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
  const issueRepository = createIssueRepository(db);

  const processor = updateProcessor({
    issueRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'issue',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateIssueRequestSchema>()
    .withSchema(updateIssueRequestSchema)
    .withObjectName('issue')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      if (payload.Id && payload.Id !== id) {
        throw new BadRequest('Body Id does not match path parameter id');
      }

      return [
        {
          objectName: 'issue',
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
          z.infer<typeof updateIssueRequestSchema>,
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
            objectType: 'issue',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
