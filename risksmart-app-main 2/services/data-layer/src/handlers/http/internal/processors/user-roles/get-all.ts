import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createUserRoleRepository } from '../../../../../repositories/user-role-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /user-roles
 * Retrieves all user roles for an organization with pagination
 */
export const getUserRolesProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('UserRole')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const userRoleRepository = createUserRoleRepository(db);

      return userRoleRepository.getAll(orgKey);
    })
    .execute(event, context);
};
