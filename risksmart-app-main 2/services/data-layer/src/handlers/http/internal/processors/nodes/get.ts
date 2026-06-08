import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createNodeRepository } from '../../../../../repositories/node-repository';
import type { NodeRow } from '../../../../../types/node.types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const queryParamsSchema = z.object({
  nodeIds: z.string().optional(),
});

/**
 * Processor for GET /nodes
 * Retrieves nodes with basic info and pagination.
 * Accepts an optional `nodeIds` query parameter (comma-separated) to filter results.
 * If no `nodeIds` are provided, all nodes are returned.
 * Errors are handled by the restApiLambdaErrorHandler middleware.
 */
export const getNodesProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<undefined, typeof queryParamsSchema, NodeRow>()
    .withQueryParamsSchema(queryParamsSchema)
    .withObjectName('Nodes')
    .withPagination()
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const nodeRepository = createNodeRepository(db);

      return nodeRepository.getMany({
        nodeIds: queryParams.nodeIds?.split(','),
      });
    })
    .execute(event, context);
};
