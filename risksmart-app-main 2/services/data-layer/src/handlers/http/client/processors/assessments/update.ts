import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';
import type { z } from 'zod';

import {
  type AssessmentRelationships,
  type AssessmentRepository,
  createAssessmentRepository,
} from '../../../../../repositories/assessment-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { updateAssessmentRequestSchema } from '../../../../../schemas/assessment';
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

interface ProcessorDependencies {
  assessmentRepository: AssessmentRepository;
}

/**
 * Processor for updating an assessment
 * Handles database update with relationships
 */
export const updateProcessor =
  ({ assessmentRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof updateAssessmentRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing update assessment', {
      assessmentId: payload.Id,
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const updateData = {
      Title: payload.Title,
      Summary: payload.Summary ?? null,
      ActualCompletionDate: payload.ActualCompletionDate ?? null,
      NextTestDate: payload.NextTestDate ?? null,
      StartDate: payload.StartDate ?? null,
      TargetCompletionDate: payload.TargetCompletionDate ?? null,
      CompletedByUser: payload.CompletedByUser ?? null,
      Status: payload.Status,
      Outcome: payload.Outcome ?? null,
      ModifiedByUser: context.userId,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const relationships: AssessmentRelationships = {
      ownerUserIds: payload.OwnerUserIds ?? [],
      ownerGroupIds: payload.OwnerGroupIds ?? [],
      contributorUserIds: payload.ContributorUserIds ?? [],
      contributorGroupIds: payload.ContributorGroupIds ?? [],
      tagTypeIds: payload.TagTypeIds ?? [],
      departmentTypeIds: payload.DepartmentTypeIds ?? [],
    };

    const updatedRecord = await assessmentRepository.updateWithRelationships(
      payload.Id,
      updateData,
      relationships,
      context
    );

    if (!updatedRecord?.Id) {
      throw new Error('Failed to retrieve updated assessment');
    }

    logger.info('Successfully updated assessment', {
      objectId: updatedRecord.Id,
    });

    return updatedRecord;
  };

/**
 * Processor for PUT /assessments/{id}
 * Updates an assessment with permission check, database update, and event emission
 * Returns the full updated object
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const updateAssessmentProcessor = async (
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
  const assessmentRepository = createAssessmentRepository(db);

  const processor = updateProcessor({
    assessmentRepository,
  });

  // Create object event strategy for emitting ObjectUpdated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'assessment',
    'update',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof updateAssessmentRequestSchema>()
    .withSchema(updateAssessmentRequestSchema)
    .withObjectName('assessment')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      if (payload.Id && payload.Id !== id) {
        throw new BadRequest('Body Id does not match path parameter id');
      }

      return [
        {
          objectName: 'assessment',
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
          z.infer<typeof updateAssessmentRequestSchema>,
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
            objectType: 'assessment',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
