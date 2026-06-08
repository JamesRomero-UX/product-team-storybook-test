import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { createContributorRepository } from '../../../../../repositories/contributor-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /contributors
 * Retrieves all contributors for an organization with pagination
 */
export const getContributorsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('Contributor')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const contributorRepository = createContributorRepository(db);

      return contributorRepository.getAll(orgKey);
    })
    .execute(event, context);
};
