import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createEnrichedNodeRepository } from '../../../../../repositories/enriched-node-repository';
import type { GetEnrichedNodeByIdResponseRow } from '../../../../../types/node.types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const queryParamsSchema = z.object({
  nodeIds: z.string().optional(),
});

/**
 * Processor for GET /nodes/enriched
 * Retrieves enriched nodes with ownership, contributor, and relationship data.
 * Accepts an optional `nodeIds` query parameter (comma-separated) to filter results.
 * If no `nodeIds` are provided, all enriched nodes are returned.
 * Errors are handled by the restApiLambdaErrorHandler middleware.
 */
export const getEnrichedNodeProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    undefined,
    typeof queryParamsSchema,
    GetEnrichedNodeByIdResponseRow
  >()
    .withQueryParamsSchema(queryParamsSchema)
    .withObjectName('Nodes')
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const enrichedNodeRepository = createEnrichedNodeRepository(db);

      return enrichedNodeRepository.getMany({
        nodeIds: queryParams.nodeIds?.split(','),
      });
    })
    .execute(event, context);
};
