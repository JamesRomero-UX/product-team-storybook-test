import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createRiskAssessmentResultRepository } from '../../../../../repositories/risk-assessment-result-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  riskId: z.string().min(1, 'Risk ID is required'),
});

/**
 * Processor for GET /risk-assessment-results/latest-by-risk/{riskId}
 * Retrieves the latest risk assessment result for a given risk
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getLatestRiskAssessmentResultByRiskProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('RiskAssessmentResult')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const riskAssessmentResultRepository =
        createRiskAssessmentResultRepository(db);

      return riskAssessmentResultRepository.getLatestByRiskId(
        pathParams.riskId
      );
    })
    .forSingleItem()
    .execute(event, context);
};
