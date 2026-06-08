import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import { createAssessmentRepository } from '../../../../../repositories/assessment-repository';
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

const deleteAssessmentBodySchema = z.object({});

const pathParamsSchema = z.object({
  id: z.string().uuid(),
});

export interface ProcessorDependencies {
  deleteAssessment: (id: string) => Promise<number>;
}

/**
 * Processor for deleting an assessment
 * Handles database deletion and event emission
 */
export const createProcessor =
  ({ deleteAssessment }: ProcessorDependencies) =>
  async ({
    id,
    context,
  }: {
    id: string;
    context: ServiceContext;
  }): Promise<void> => {
    logger.info('Processing delete assessment', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      assessmentId: id,
    });

    const affectedRows = await deleteAssessment(id);

    if (affectedRows === 0) {
      throw new NotFound('Assessment not found');
    }

    logger.info('Successfully deleted assessment', {
      objectId: id,
    });
  };

/**
 * Delete assessment processor
 * Entry point for DELETE /assessments/{id} requests
 */
export const deleteAssessmentProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const assessmentRepository = createAssessmentRepository(db);

  const processor = createProcessor({
    deleteAssessment: assessmentRepository.delete,
  });

  // Create object event strategy for emitting EntityDeleted events
  const eventBridge = new EventBridgeClient({});
  const eventStrategy = new ObjectEventStrategy(
    'assessment',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteAssessmentBodySchema>()
    .withSchema(deleteAssessmentBodySchema)
    .withObjectName('assessment')
    .withEventStrategy(eventStrategy)
    .withPermissions(({ pathParams }) => {
      const { id } = pathParamsSchema.parse(pathParams);

      return [
        {
          objectName: 'assessment',
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
          z.infer<typeof deleteAssessmentBodySchema>,
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
            objectType: 'assessment',
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
