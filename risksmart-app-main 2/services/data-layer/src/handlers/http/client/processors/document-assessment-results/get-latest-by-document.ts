import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createDocumentAssessmentResultRepository } from '../../../../../repositories/document-assessment-result-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
});

/**
 * Processor for GET /document-assessment-results/latest-by-document/{documentId}
 * Retrieves the latest document assessment result for a given document
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getLatestDocumentAssessmentResultByDocumentProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('DocumentAssessmentResult')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const documentAssessmentResultRepository =
        createDocumentAssessmentResultRepository(db);

      return documentAssessmentResultRepository.getLatestByDocumentId(
        pathParams.documentId
      );
    })
    .forSingleItem()
    .execute(event, context);
};
