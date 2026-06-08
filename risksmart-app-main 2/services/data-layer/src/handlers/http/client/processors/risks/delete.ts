import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createRiskRepository } from '../../../../../repositories/risk-repository';
import { getLogger } from '../../../../../utils/logger';
import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { extractServiceContext } from '../../../utils/extract-context';
import { deletedResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

const deleteRiskBodySchema = z.object({});

const pathParamsSchema = z.object({
  id: z.string().uuid(),
});

export interface ProcessorDependencies {
  deleteRisk: (id: string) => Promise<number>;
}

/**
 * Processor for deleting a risk
 * Handles database deletion and event emission
 */
export const createProcessor =
  ({ deleteRisk }: ProcessorDependencies) =>
  async ({
    id,
    context,
  }: {
    id: string;
    context: ServiceContext;
  }): Promise<void> => {
    logger.info('Processing delete risk', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      riskId: id,
    });

    const affectedRows = await deleteRisk(id);

    if (affectedRows === 0) {
      throw new NotFound('Risk not found');
    }

    logger.info('Successfully deleted risk', {
      objectId: id,
    });
  };

/**
 * Delete risk processor
 * Entry point for DELETE /risks/{id} requests
 */
export const deleteRiskProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const riskRepository = createRiskRepository(db);

  const processor = createProcessor({
    deleteRisk: riskRepository.delete,
  });

  // Create object event strategy for emitting EntityDeleted events
  const eventBridge = new EventBridgeClient({});
  const eventStrategy = new ObjectEventStrategy(
    'risk',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteRiskBodySchema>()
    .withSchema(deleteRiskBodySchema)
    .withObjectName('risk')
    .withEventStrategy(eventStrategy)
    .withPermissions(({ pathParams }) => {
      const { id } = pathParamsSchema.parse(pathParams);

      return [
        {
          objectName: 'risk',
          action: 'delete',
        },
        {
          objectName: 'rs_node',
          action: 'delete',
          objectId: id,
        },
      ];
    })
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof deleteRiskBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const { id } = pathParamsSchema.parse(event.pathParameters);

        await processor({
          id,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({
            event,
            objectType: 'risk',
            objectId: id,
          }),
          strategyData: {
            objectIds: [id],
          },
        };
      }
    )
    .execute(event, context);
};
