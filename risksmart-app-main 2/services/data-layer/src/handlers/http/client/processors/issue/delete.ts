import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import { createIssueRepository } from 'src/repositories/issue-repository';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { getLogger } from '../../../../../utils/logger';
import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import type { PermissionCheck } from '../../../utils/check-permissions';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import { deletedResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

const deleteIssuesBodySchema = z.object({
  Ids: z.array(z.string().uuid()).min(1).max(200),
});

export interface ProcessorDependencies {
  deleteIssues: (ids: string[]) => Promise<number>;
}

/**
 * Processor for deleting issues.
 * Coordinates database deletion; event emission is handled by the async request workflow.
 */
export const createProcessor =
  ({ deleteIssues }: ProcessorDependencies) =>
  async ({
    context,
    body,
  }: {
    context: ServiceContext;
    body: z.infer<typeof deleteIssuesBodySchema>;
  }): Promise<void> => {
    logger.info('Processing delete many issues', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      issueIds: body.Ids,
    });

    const affectedRows = await deleteIssues(body.Ids);

    if (affectedRows === 0) {
      throw new NotFound('Issues not found');
    }

    if (affectedRows < body.Ids.length) {
      throw new NotFound(
        `Some issues not found. Requested: ${body.Ids.length}, deleted: ${affectedRows}`
      );
    }

    logger.info('Successfully deleted issues', {
      objectIds: body.Ids,
    });
  };

/**
 * Delete issues processor
 * Entry point for DELETE /issues requests
 */
export const deleteIssuesProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const issueRepository = createIssueRepository(db);

  const processor = createProcessor({
    deleteIssues: issueRepository.deleteMany,
  });

  // Create object event strategy for emitting EntityDeleted events
  const eventBridge = new EventBridgeClient({});
  const eventStrategy = new ObjectEventStrategy(
    'issue',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteIssuesBodySchema>()
    .withSchema(deleteIssuesBodySchema)
    .withObjectName('issue')
    .withEventStrategy(eventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'issue',
            action: 'delete',
          },
          {
            objectName: 'rs_node',
            action: 'delete',
            objectId: id,
          },
        ]);
      }

      return result;
    })
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof deleteIssuesBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        await processor({
          body: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({ event, objectType: 'issue' }),
          strategyData: {
            objectIds: context.payload.Ids,
          },
        };
      }
    )
    .execute(event, context);
};
