import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { createActionUpdateRepository } from '../../../../../repositories/action-update-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import type { GetActionUpdatesByParentActionIdResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  parentActionId: z.string().min(1, 'Parent action ID is required'),
});

/**
 * Processor for GET /action-updates/by-parent/{parentActionId}
 * Retrieves all action updates for a specific parent action with inherited permissions
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getActionUpdatesByParentProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    typeof pathParamsSchema,
    undefined,
    GetActionUpdatesByParentActionIdResponseRow
  >()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('Action update')
    .withPagination()
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (object) => object.Id,
    })
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const actionUpdateRepository = createActionUpdateRepository(db);

      return actionUpdateRepository.getByParentId(pathParams.parentActionId);
    })
    .execute(event, context);
};
