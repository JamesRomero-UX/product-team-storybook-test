import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createUserGroupRepository } from '../../../../../repositories/user-group-repository';
import type { GetUsersByGroupIdResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  groupId: z.string().uuid(),
});

/**
 * Processor for GET /user-groups/{groupId}/users
 * Retrieves users belonging to a user group by group ID
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getUsersByGroupIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    typeof pathParamsSchema,
    undefined,
    GetUsersByGroupIdResponseRow
  >()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('UserGroup')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const userGroupRepository = createUserGroupRepository(db);

      return userGroupRepository.getUsersByGroupId(pathParams.groupId);
    })
    .execute(event, context);
};
