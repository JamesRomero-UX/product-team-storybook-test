import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createOwnerRepository } from '../../../../../repositories/owner-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /owners
 * Retrieves all owners for an organization with pagination
 */
export const getOwnersProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('Owner')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const ownerRepository = createOwnerRepository(db);

      return ownerRepository.getAll(orgKey);
    })
    .execute(event, context);
};
