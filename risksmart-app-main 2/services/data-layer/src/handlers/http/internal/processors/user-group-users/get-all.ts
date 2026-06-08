import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createUserGroupRepository } from '../../../../../repositories/user-group-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /user-group-users
 * Retrieves all user group user assignments for an organization with pagination
 */
export const getUserGroupUsersProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('UserGroupUser')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const userGroupRepository = createUserGroupRepository(db);

      return userGroupRepository.getAllUsers(orgKey);
    })
    .execute(event, context);
};
