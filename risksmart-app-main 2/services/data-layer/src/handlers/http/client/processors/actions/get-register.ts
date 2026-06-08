import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { createActionRepository } from '../../../../../repositories/action-repository';
import { getDatabaseConnection } from '../../../../../repositories/db-client';
import type { ActionRegisterResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const queryParamsSchema = z.object({
  parentId: z.string().optional(),
  departmentTypeIds: z.string().optional(),
  tagTypeIds: z.string().optional(),
});

/**
 * Processor for GET /actions/register
 * Retrieves paginated list of actions with optional filters and Permit.io filtering
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getActionsRegisterProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    undefined,
    typeof queryParamsSchema,
    ActionRegisterResponseRow
  >()
    .withQueryParamsSchema(queryParamsSchema)
    .withObjectName('Actions')
    .withPagination()
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (object) => object.Id,
    })
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const actionRepository = createActionRepository(db);

      return actionRepository.getRegister({
        parentId: queryParams.parentId,
        departmentTypeIds: queryParams.departmentTypeIds?.split(','),
        tagTypeIds: queryParams.tagTypeIds?.split(','),
      });
    })
    .execute(event, context);
};
