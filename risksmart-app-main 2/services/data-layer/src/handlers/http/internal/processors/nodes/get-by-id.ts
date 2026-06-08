import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createNodeRepository } from '../../../../../repositories/node-repository';
import type { GetNodeByIdResponseRow } from '../../../../../types/node.types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  objectId: z.string().min(1, 'Object ID is required'),
});

/**
 * Processor for GET /nodes/{objectId}
 * Retrieves a single node by ID with Permit.io filtering
 * Returns basic node information without relationships
 */
export const getNodeByIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    typeof pathParamsSchema,
    undefined,
    GetNodeByIdResponseRow
  >()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('Node')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (object) => object.Id,
    })
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const nodeRepository = createNodeRepository(db);

      const node = await nodeRepository.getById(pathParams.objectId);

      return node ?? null;
    })
    .forSingleItem()
    .execute(event, context);
};
