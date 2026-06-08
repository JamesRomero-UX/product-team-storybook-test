import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { getDatabaseConnection } from 'src/repositories';
import {
  createRiskAssessmentResultConfigRepository,
  type RiskAssessmentResultConfigRepository,
} from 'src/repositories/risk-assessment-result-config-repository';
import {
  createRiskAssessmentResultRepository,
  type RiskAssessmentResultRepository,
} from 'src/repositories/risk-assessment-result-repository';
import { createRiskAssessmentResultRequestSchema } from 'src/schemas/risk-assessment-result';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';
import type z from 'zod';

import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { ObjectCreationFailedError } from '../../../utils/error';
import { extractServiceContext } from '../../../utils/extract-context';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

export interface ProcessorDependencies {
  riskAssessmentResultRepository: RiskAssessmentResultRepository;
  riskAssessmentResultConfigRepository: RiskAssessmentResultConfigRepository;
}

const logger = getLogger();

/**
 * Processor for creating risk assessment results
 * Creates one risk_assessment_result per RiskId and links via assessment_result_parent
 */
export const createProcessor =
  ({
    riskAssessmentResultRepository,
    riskAssessmentResultConfigRepository,
  }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createRiskAssessmentResultRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create risk assessment results', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      riskCount: payload.RiskIds.length,
    });

    const configId = await riskAssessmentResultConfigRepository.getLatestId();

    const results = await riskAssessmentResultRepository.insertMany(
      { ...payload, ConfigId: configId },
      context
    );

    if (!results || results.length === 0) {
      throw new ObjectCreationFailedError(
        'Failed to create risk assessment results'
      );
    }

    logger.info('Successfully created risk assessment results', {
      objectIds: results.map((r) => r.Id),
    });

    return results;
  };

/**
 * Processor for POST /risk-assessment-results
 * Creates new risk assessment results with permission check, database insert, and event emission
 * Returns the array of created result IDs
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createRiskAssessmentResultProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const riskAssessmentResultRepository =
    createRiskAssessmentResultRepository(db);
  const riskAssessmentResultConfigRepository =
    createRiskAssessmentResultConfigRepository(db);

  const processor = createProcessor({
    riskAssessmentResultRepository,
    riskAssessmentResultConfigRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'risk_assessment_result',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<
    typeof createRiskAssessmentResultRequestSchema
  >()
    .withSchema(createRiskAssessmentResultRequestSchema)
    .withObjectName('risk_assessment_result')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'risk_assessment_result',
        action: 'insert',
      },
      ...payload.RiskIds.map((riskId) => ({
        objectName: 'rs_node',
        objectId: riskId,
        action: 'insert' as const,
      })),
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createRiskAssessmentResultRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const results = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: {
            statusCode: 201,
            body: JSON.stringify({ Ids: results.map((r) => r.Id) }),
            headers: { 'Content-Type': 'application/json' },
          },
          strategyData: {
            objectIds: results.map((r) => r.Id),
          },
        };
      }
    )
    .execute(event, context);
};
