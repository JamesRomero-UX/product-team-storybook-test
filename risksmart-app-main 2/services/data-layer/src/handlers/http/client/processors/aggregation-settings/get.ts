import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { createAggregationSettingsRepository } from '../../../../../repositories/aggregation-settings-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /aggregation-settings
 * Retrieves org-level aggregation settings (risk scoring model, appetite, config)
 * The orgKey comes from the service context (request headers)
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getAggregationSettingsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('AggregationSettings')
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const aggregationSettingsRepository =
        createAggregationSettingsRepository(db);

      return aggregationSettingsRepository.getForOrg(orgKey);
    })
    .forSingleItem()
    .execute(event, context);
};
