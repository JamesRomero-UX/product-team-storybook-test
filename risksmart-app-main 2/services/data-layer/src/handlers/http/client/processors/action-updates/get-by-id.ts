import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { createActionUpdateRepository } from '../../../../../repositories/action-update-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import type { GetActionUpdateByIdResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  id: z.string().min(1, 'Update ID is required'),
});

/**
 * Processor for GET /action-updates/{id}
 * Retrieves a single action update by ID with permission inherited from parent action
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getActionUpdateByIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    typeof pathParamsSchema,
    undefined,
    GetActionUpdateByIdResponseRow
  >()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('Action update')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (object) => object.Id,
    })
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const actionUpdateRepository = createActionUpdateRepository(db);

      return actionUpdateRepository.getById(pathParams.id);
    })
    .forSingleItem()
    .execute(event, context);
};
