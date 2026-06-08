import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { createMyItemsRepository } from 'src/repositories';
import z from 'zod';

import { getDatabaseConnection } from '../../../../repositories/db-client';
import type { getMyDueItemsAssessmentsResponseRow } from '../../../../types';
import { createHttpReadHandler } from '../../utils/create-http-read-handler';
import { ownershipFilterSchema } from './ownership-filter-schema';

export const myDueAssessmentsQueryConfig = z
  .object({
    date: z.string().datetime(),
  })
  .merge(ownershipFilterSchema);

/**
 * Processor for GET /my-items/due-assessments
 * Retrieves due assessments for the current user
 *
 * Query parameters:
 * - date: string representing the cutoff date for due assessments
 * - userId: string representing the user to filter ownership for
 * - owner, contributor, groupOwner, etc.: ownership filter flags
 *
 * Example: GET /my-items/due-assessments
 * Example: GET /my-items/due-assessments?date=2024-06-30&userId=123&owner=true
 */
export const getMyDueAssessments = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    undefined,
    typeof myDueAssessmentsQueryConfig,
    getMyDueItemsAssessmentsResponseRow
  >()
    .withQueryParamsSchema(myDueAssessmentsQueryConfig)
    .withObjectName('Due assessment')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (entity) => entity.Id,
    })
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const myItemsRepository = createMyItemsRepository(db);

      return await myItemsRepository.getDueAssessments(
        queryParams.date,
        queryParams
      );
    })
    .execute(event, context);
};
