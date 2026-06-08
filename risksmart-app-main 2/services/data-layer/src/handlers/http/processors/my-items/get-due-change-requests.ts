import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { createMyItemsRepository } from 'src/repositories';
import z from 'zod';

import { getDatabaseConnection } from '../../../../repositories/db-client';
import type { GetMyDueItemsChangeRequestsResponseRow } from '../../../../types';
import { createHttpReadHandler } from '../../utils/create-http-read-handler';

export const myDueChangeRequestsQueryConfig = z.object({
  date: z.string().datetime(),
  userId: z.string(),
});

/**
 * Processor for GET /my-items/due-change-requests
 * Retrieves due change requests for the current user
 *
 * Query parameters:
 * - date: string representing the cutoff date for due change requests
 *
 * Example: GET /my-items/due-change-requests
 * Example: GET /my-items/due-change-requests?date=2024-06-30
 */
export const getMyDueChangeRequests = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    undefined,
    typeof myDueChangeRequestsQueryConfig,
    GetMyDueItemsChangeRequestsResponseRow
  >()
    .withQueryParamsSchema(myDueChangeRequestsQueryConfig)
    .withObjectName('Due change request')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (entity) => entity.ParentId,
    })
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const myItemsRepository = createMyItemsRepository(db);

      return await myItemsRepository.getDueChangeRequests(
        queryParams.date,
        queryParams.userId
      );
    })
    .execute(event, context);
};
