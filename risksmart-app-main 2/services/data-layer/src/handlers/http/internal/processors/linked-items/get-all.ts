import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createLinkedItemRepository } from '../../../../../repositories/linked-item-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /linked-items
 * Retrieves all parent-child linked items for an organization with pagination
 */
export const getLinkedItemsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('LinkedItem')
    .withPagination()
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const linkedItemRepository = createLinkedItemRepository(db);

      return linkedItemRepository.getAll(orgKey);
    })
    .execute(event, context);
};
