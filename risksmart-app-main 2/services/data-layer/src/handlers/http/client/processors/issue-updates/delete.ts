import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import { createIssueUpdateRepository } from 'src/repositories/issue-update-repository';
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

const deleteIssueUpdatesBodySchema = z.object({
  Ids: z.array(z.string().uuid()),
});

export interface ProcessorDependencies {
  deleteIssueUpdates: (ids: string[]) => Promise<number>;
}

/**
 * Processor for deleting issue updates.
 * Coordinates database deletion; event emission is handled by the async request workflow.
 */
export const createProcessor =
  ({ deleteIssueUpdates }: ProcessorDependencies) =>
  async ({
    context,
    body,
  }: {
    context: ServiceContext;
    body: z.infer<typeof deleteIssueUpdatesBodySchema>;
  }): Promise<void> => {
    logger.info('Processing delete many issue updates', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      issueUpdateIds: body.Ids,
    });

    const affectedRows = await deleteIssueUpdates(body.Ids);

    if (affectedRows === 0) {
      throw new NotFound('Issue updates not found');
    }

    if (affectedRows < body.Ids.length) {
      throw new NotFound(
        `Some issue updates not found. Requested: ${body.Ids.length}, deleted: ${affectedRows}`
      );
    }

    logger.info('Successfully deleted issue updates', {
      objectIds: body.Ids,
    });
  };

/**
 * Delete issue updates processor
 * Entry point for DELETE /issue-updates requests
 */
export const deleteIssueUpdatesProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const issueUpdateRepository = createIssueUpdateRepository(db);

  const processor = createProcessor({
    deleteIssueUpdates: issueUpdateRepository.deleteMany,
  });

  // Create object event strategy for emitting EntityDeleted events
  const eventBridge = new EventBridgeClient({});
  const eventStrategy = new ObjectEventStrategy(
    'issue_update',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteIssueUpdatesBodySchema>()
    .withSchema(deleteIssueUpdatesBodySchema)
    .withObjectName('issue_update')
    .withEventStrategy(eventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'issue_update',
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
          z.infer<typeof deleteIssueUpdatesBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        await processor({
          body: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({ event, objectType: 'issue-update' }),
          strategyData: {
            objectIds: context.payload.Ids,
          },
        };
      }
    )
    .execute(event, context);
};
