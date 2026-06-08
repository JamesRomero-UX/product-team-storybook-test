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
  createIssueUpdateRepository,
  type IssueUpdateRepository,
} from '../../../../../repositories/issue-update-repository';
import { createIssueUpdateRequestSchema } from '../../../../../schemas/issue-update';
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
  issueUpdateRepository: IssueUpdateRepository;
}

export const createProcessor =
  ({ issueUpdateRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createIssueUpdateRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create issue update', {
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

    const result = await issueUpdateRepository.insert(insertData);
    const insertedRecord = result[0];

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created issue update'
      );
    }

    logger.info('Successfully created issue update', {
      objectId: insertedRecord.Id,
      parentIssueId: payload.ParentIssueId,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /issue-updates
 * Creates a new issue update with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createIssueUpdateProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const issueUpdateRepository = createIssueUpdateRepository(db);

  const processor = createProcessor({
    issueUpdateRepository,
  });

  // Create object event strategy for emitting EntityCreated events
  const eventBridge = new EventBridgeClient({});
  const eventStrategy = new ObjectEventStrategy(
    'issue_update',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createIssueUpdateRequestSchema>()
    .withSchema(createIssueUpdateRequestSchema)
    .withObjectName('issue_update')
    .withEventStrategy(eventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'issue_update',
        action: 'insert',
      },
      // Check permission to create issue update as child object via ParentIssueId
      {
        objectName: 'rs_node',
        action: 'insert',
        objectId: payload.ParentIssueId,
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createIssueUpdateRequestSchema>,
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
            objectType: 'issue-update',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
