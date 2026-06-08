import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import type { z } from 'zod';

import {
  type AssessmentRelationships,
  type AssessmentRepository,
  createAssessmentRepository,
} from '../../../../../repositories/assessment-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createAssessmentRequestSchema } from '../../../../../schemas/assessment';
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
  assessmentRepository: AssessmentRepository;
}

/**
 * Processor for creating an assessment
 * Handles database insertion
 */
export const createProcessor =
  ({ assessmentRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createAssessmentRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create assessment', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      OriginatingItemId: payload.OriginatingItemId ?? null,
      Title: payload.Title,
      Summary: payload.Summary,
      ActualCompletionDate: payload.ActualCompletionDate ?? null,
      NextTestDate: payload.NextTestDate ?? null,
      StartDate: payload.StartDate ?? null,
      TargetCompletionDate: payload.TargetCompletionDate ?? null,
      CompletedByUser: payload.CompletedByUser ?? null,
      Status: payload.Status,
      Outcome: payload.Outcome ?? null,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
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

    const insertedRecord = await assessmentRepository.insertWithRelationships(
      insertData,
      relationships,
      context
    );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created assessment'
      );
    }

    logger.info('Successfully created assessment', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /assessments
 * Creates a new assessment with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createAssessmentProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const assessmentRepository = createAssessmentRepository(db);

  const processor = createProcessor({
    assessmentRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'assessment',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createAssessmentRequestSchema>()
    .withSchema(createAssessmentRequestSchema)
    .withObjectName('assessment')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'assessment',
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createAssessmentRequestSchema>,
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
