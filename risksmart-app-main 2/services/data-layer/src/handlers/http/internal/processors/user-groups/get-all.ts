import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createUserGroupRepository } from '../../../../../repositories/user-group-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /user-groups
 * Retrieves all user groups for an organization with pagination
 */
export const getUserGroupsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('UserGroup')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const userGroupRepository = createUserGroupRepository(db);

      return userGroupRepository.getAll(orgKey);
    })
    .execute(event, context);
};
