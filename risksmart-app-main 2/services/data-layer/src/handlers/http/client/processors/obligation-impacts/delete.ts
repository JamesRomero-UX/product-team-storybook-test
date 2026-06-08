import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { createObligationImpactRepository } from 'src/repositories/obligation-impact-repository';
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

const requestBodySchema = z.object({
  Ids: z.string().array().min(1),
});

export interface ProcessorDependencies {
  deleteMany: (ids: string[]) => Promise<void>;
}

/**
 * Processor for deleting obligation impacts
 * Handles database deletion and event emission
 */
export const createProcessor =
  ({ deleteMany }: ProcessorDependencies) =>
  async ({
    context,
    body,
  }: {
    context: ServiceContext;
    body: z.infer<typeof requestBodySchema>;
  }): Promise<void> => {
    logger.info('Processing deleting obligation impacts', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      objectIds: body.Ids,
    });

    await deleteMany(body.Ids);

    logger.info('Successfully deleted obligation impacts', {
      objectIds: body.Ids,
    });
  };

/**
 * Delete obligation impacts processor
 * Entry point for DELETE /obligation-impacts requests
 */
export const deleteObligationImpactsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const repository = createObligationImpactRepository(db);

  const processor = createProcessor({
    deleteMany: repository.deleteMany,
  });

  // Create object event strategy for emitting EntityDeleted events
  const eventBridge = new EventBridgeClient({});
  const eventStrategy = new ObjectEventStrategy(
    'obligation_impact',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof requestBodySchema>()
    .withSchema(requestBodySchema)
    .withObjectName('obligation_impact')
    .withEventStrategy(eventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];

      for (const id of payload.Ids) {
        result.push([
          {
            objectName: 'obligation_impact',
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
          z.infer<typeof requestBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        await processor({
          context: context.serviceContext,
          body: { Ids: context.payload.Ids },
        });

        return {
          response: deletedResponse({ event, objectType: 'obligation-impact' }),
          strategyData: {
            objectIds: context.payload.Ids,
          },
        };
      }
    )
    .execute(event, context);
};
