import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createTestResultRepository } from '../../../../../repositories/test-result-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  controlId: z.string().min(1, 'Control ID is required'),
});

/**
 * Processor for GET /test-results/latest-by-control/{controlId}
 * Retrieves the latest test result for a given control
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getLatestTestResultByControlProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('TestResult')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const testResultRepository = createTestResultRepository(db);

      return testResultRepository.getLatestByControlId(pathParams.controlId);
    })
    .forSingleItem()
    .execute(event, context);
};
