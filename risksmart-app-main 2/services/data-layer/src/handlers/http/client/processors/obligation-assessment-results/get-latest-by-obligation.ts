import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createObligationAssessmentResultRepository } from '../../../../../repositories/obligation-assessment-result-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  obligationId: z.string().min(1, 'Obligation ID is required'),
});

/**
 * Processor for GET /obligation-assessment-results/latest-by-obligation/{obligationId}
 * Retrieves the latest obligation assessment result for a given obligation
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getLatestObligationAssessmentResultByObligationProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('ObligationAssessmentResult')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const obligationAssessmentResultRepository =
        createObligationAssessmentResultRepository(db);

      return obligationAssessmentResultRepository.getLatestByObligationId(
        pathParams.obligationId
      );
    })
    .forSingleItem()
    .execute(event, context);
};
