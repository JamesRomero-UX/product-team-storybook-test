import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createOrganisationRepository } from '../../../../../repositories/organisation-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /organisations
 * Retrieves organisations by orgKeys with pagination
 * Uses POST to accept array of orgKeys in body
 */
export const getOrganisationsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('Organisation')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const organisationRepository = createOrganisationRepository(db);

      return organisationRepository.getAll();
    })
    .execute(event, context);
};
