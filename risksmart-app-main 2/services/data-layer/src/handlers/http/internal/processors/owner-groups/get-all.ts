import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createOwnerRepository } from '../../../../../repositories/owner-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /owner-groups
 * Retrieves all owner groups for an organization with pagination
 */
export const getOwnerGroupsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('OwnerGroup')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const ownerRepository = createOwnerRepository(db);

      return ownerRepository.getAllGroups(orgKey);
    })
    .execute(event, context);
};
