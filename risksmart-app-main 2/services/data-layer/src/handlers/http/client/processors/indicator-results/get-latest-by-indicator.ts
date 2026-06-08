import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createIndicatorResultRepository } from '../../../../../repositories/indicator-result-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  indicatorId: z.string().min(1, 'Indicator ID is required'),
});

/**
 * Processor for GET /indicator-results/latest-by-indicator/{indicatorId}
 * Retrieves the latest indicator result for a given indicator
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getLatestIndicatorResultByIndicatorProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('IndicatorResult')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const indicatorResultRepository = createIndicatorResultRepository(db);

      return indicatorResultRepository.getLatestByIndicatorId(
        pathParams.indicatorId
      );
    })
    .forSingleItem()
    .execute(event, context);
};
