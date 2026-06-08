import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createUserGroupRepository } from '../../../../../repositories/user-group-repository';
import type { GetUserGroupByIdResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  id: z.string().min(1, 'User group ID is required'),
});

/**
 * Processor for GET /user-groups/{id}
 * Retrieves a single user group by ID with Permit.io filtering
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getUserGroupByIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    typeof pathParamsSchema,
    undefined,
    GetUserGroupByIdResponseRow
  >()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('UserGroup')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const userGroupRepository = createUserGroupRepository(db);

      return userGroupRepository.getById(pathParams.id);
    })
    .forSingleItem()
    .execute(event, context);
};
