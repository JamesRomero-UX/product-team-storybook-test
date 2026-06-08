import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import { createControlGroupRepository } from '../../../../../repositories/control-group-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
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

const deleteControlGroupBodySchema = z.object({
  OriginalTimestamp: z.string(),
});

const pathParamsSchema = z.object({
  id: z.string().uuid(),
});

export interface ProcessorDependencies {
  deleteControlGroup: ({
    id,
    modifiedAtTimestamp,
  }: {
    id: string;
    modifiedAtTimestamp: string;
  }) => Promise<number>;
}

/**
 * Processor for deleting a control group
 * Handles database deletion and event emission
 */
export const createProcessor =
  ({ deleteControlGroup }: ProcessorDependencies) =>
  async ({
    id,
    context,
    body,
  }: {
    id: string;
    context: ServiceContext;
    body: z.infer<typeof deleteControlGroupBodySchema>;
  }): Promise<void> => {
    logger.info('Processing delete control group', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      controlGroupId: id,
    });

    const affectedRows = await deleteControlGroup({
      id,
      modifiedAtTimestamp: body.OriginalTimestamp,
    });

    if (affectedRows === 0) {
      throw new NotFound('Control group not found');
    }

    logger.info('Successfully deleted control group', {
      objectId: id,
    });
  };

/**
 * Delete control group processor
 * Entry point for DELETE /control-groups/{id} requests
 */
export const deleteControlGroupProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const controlGroupRepository = createControlGroupRepository(db);

  const processor = createProcessor({
    deleteControlGroup: controlGroupRepository.delete,
  });

  // Create object event strategy for emitting EntityDeleted events
  const eventBridge = new EventBridgeClient({});
  const eventStrategy = new ObjectEventStrategy(
    'control_group',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteControlGroupBodySchema>()
    .withSchema(deleteControlGroupBodySchema)
    .withObjectName('control_group')
    .withEventStrategy(eventStrategy)
    .withPermissions(({ pathParams }) => {
      const { id } = pathParamsSchema.parse(pathParams);

      return [
        {
          objectName: 'control_group',
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
          z.infer<typeof deleteControlGroupBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const { id } = pathParamsSchema.parse(event.pathParameters);

        await processor({
          id,
          body: context.payload,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({
            event,
            objectType: 'control-group',
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
