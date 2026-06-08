import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { createMyItemsRepository } from 'src/repositories';
import z from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import type { GetMyDueItemsAttestationRecordsResponseRow } from '../../../../../types';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

export const myDueAttestationRecordsQueryConfig = z.object({
  date: z.string().datetime(),
  userId: z.string(),
});

/**
 * Processor for GET /my-items/due-attestation-records
 * Retrieves due attestation records for the current user
 *
 * Query parameters:
 * - date: string representing the cutoff date for due attestation records
 * - userId: string representing the user ID to filter by
 *
 * Example: GET /my-items/due-attestation-records?userId=user-123&date=2024-06-30
 */
export const getMyDueAttestationRecords = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    undefined,
    typeof myDueAttestationRecordsQueryConfig,
    GetMyDueItemsAttestationRecordsResponseRow
  >()
    .withQueryParamsSchema(myDueAttestationRecordsQueryConfig)
    .withObjectName('Due attestation record')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (entity) => entity.node?.documentFile?.parent?.Id ?? '',
    })
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const myItemsRepository = createMyItemsRepository(db);

      return await myItemsRepository.getDueAttestationRecords(
        queryParams.userId,
        queryParams.date
      );
    })
    .execute(event, context);
};
