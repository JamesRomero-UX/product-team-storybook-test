import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createUserGroupRepository } from '../../../../../repositories/user-group-repository';
import type { GetUserGroupsWithApproversResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /user-groups
 * Retrieves all user groups with user and approver aggregate counts
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getUserGroupsWithApproversProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    undefined,
    undefined,
    GetUserGroupsWithApproversResponseRow
  >()
    .withObjectName('UserGroup')
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const userGroupRepository = createUserGroupRepository(db);

      return userGroupRepository.getAllWithApprovers();
    })
    .execute(event, context);
};
