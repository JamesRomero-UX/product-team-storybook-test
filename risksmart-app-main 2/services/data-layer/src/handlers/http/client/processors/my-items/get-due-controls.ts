import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { createMyItemsRepository } from 'src/repositories';
import z from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import type { GetMyDueItemsControlsResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';
import { ownershipFilterSchema } from './ownership-filter-schema';

export const myDueControlsQueryConfig = z
  .object({
    date: z.string().datetime(),
  })
  .merge(ownershipFilterSchema);

/**
 * Processor for GET /my-items/due-controls
 * Retrieves due controls for the current user
 *
 * Query parameters:
 * - date: string representing the cutoff date for due controls
 * - userId: string representing the user to filter ownership for
 * - owner, contributor, groupOwner, etc.: ownership filter flags
 *
 * Example: GET /my-items/due-controls
 * Example: GET /my-items/due-controls?date=2024-06-30&userId=123&owner=true
 */
export const getMyDueControls = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    undefined,
    typeof myDueControlsQueryConfig,
    GetMyDueItemsControlsResponseRow
  >()
    .withQueryParamsSchema(myDueControlsQueryConfig)
    .withObjectName('Due control')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (entity) => entity.Id,
    })
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const myItemsRepository = createMyItemsRepository(db);

      return await myItemsRepository.getDueControls(
        queryParams.date,
        queryParams
      );
    })
    .execute(event, context);
};
