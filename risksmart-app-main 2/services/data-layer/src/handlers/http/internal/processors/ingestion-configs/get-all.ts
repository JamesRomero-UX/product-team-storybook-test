import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createIngestionConfigRepository } from '../../../../../repositories/ingestion-config-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /ingestion-configs
 * Retrieves all ingestion configs with pagination
 */
export const getIngestionConfigsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('Ingestion config')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const ingestionConfigRepository = createIngestionConfigRepository(db);

      return ingestionConfigRepository.getAll();
    })
    .execute(event, context);
};
