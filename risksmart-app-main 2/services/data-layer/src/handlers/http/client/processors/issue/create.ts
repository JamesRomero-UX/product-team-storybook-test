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
  createIssueRepository,
  type IssueRelationships,
  type IssueRepository,
} from '../../../../../repositories/issue-repository';
import { createIssueRequestSchema } from '../../../../../schemas/issue';
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
  issueRepository: IssueRepository;
}

/**
 * Processor for creating an issue
 * Handles database insertion
 */
export const createProcessor =
  ({ issueRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createIssueRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create issue', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      Title: payload.Title,
      Details: payload.Details ?? '',
      ImpactsCustomer: payload.ImpactsCustomer ?? null,
      IsExternalIssue: payload.IsExternalIssue ?? null,
      DateOccurred: payload.DateOccurred,
      DateIdentified: payload.DateIdentified,
      Type: payload.Type,
      RaisedAtTimestamp: new Date().toISOString(),
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
      Meta: (payload.Meta as JSONB) ?? null,
    };

    const relationships: IssueRelationships = {
      parentId: payload.ParentId ?? null,
      ownerUserIds: payload.OwnerUserIds ?? [],
      ownerGroupIds: payload.OwnerGroupIds ?? [],
      contributorUserIds: payload.ContributorUserIds ?? [],
      contributorGroupIds: payload.ContributorGroupIds ?? [],
      tagTypeIds: payload.TagTypeIds ?? [],
      departmentTypeIds: payload.DepartmentTypeIds ?? [],
    };

    const insertedRecord = await issueRepository.insertWithRelationships(
      insertData,
      relationships,
      context
    );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError('Failed to retrieve created issue');
    }

    logger.info('Successfully created issue', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /issues
 * Creates a new issue with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createIssueProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const issueRepository = createIssueRepository(db);

  const processor = createProcessor({
    issueRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'issue',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createIssueRequestSchema>()
    .withSchema(createIssueRequestSchema)
    .withObjectName('issue')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) =>
      payload.ParentId
        ? [
            {
              objectName: 'issue',
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
              objectName: 'issue',
              action: 'insert',
            },
          ]
    )
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createIssueRequestSchema>,
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
