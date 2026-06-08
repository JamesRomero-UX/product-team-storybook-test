import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { createActionRepository } from '../../../../../repositories/action-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import type { GetActionByIdResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  id: z.string().min(1, 'Action ID is required'),
});

/**
 * Processor for GET /actions/{id}
 * Retrieves a single action by ID with Permit.io filtering
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getActionByIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    typeof pathParamsSchema,
    undefined,
    GetActionByIdResponseRow
  >()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('Action')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (object) => object.Id,
    })
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const actionRepository = createActionRepository(db);

      return actionRepository.getById(pathParams.id);
    })
    .forSingleItem()
    .execute(event, context);
};
