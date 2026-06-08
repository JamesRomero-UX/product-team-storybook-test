import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createImpactRatingRepository } from '../../../../../repositories/impact-rating-repository';
import { extractServiceContext } from '../../../utils/extract-context';

/**
 * Processor for GET /impact-ratings/oldest-active-by-risk/{riskId}
 * Computes the oldest active impact test date for a given risk across all impacts in the org.
 * For each impact, gets the latest TestDate from impact_rating where RatedItemId = riskId,
 * then returns the oldest (minimum) of those latest dates.
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getOldestActiveImpactRatingByRiskProcessor = async (
  event: APIGatewayProxyEvent,
  _context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  const riskId = event.pathParameters?.riskId;
  if (!riskId) {
    throw new BadRequest('Missing required path parameter: riskId');
  }

  const serviceContext = extractServiceContext(event);
  const { tenant, orgKey } = serviceContext;

  const db = await getDatabaseConnection({ tenant, orgKey });
  const impactRatingRepository = createImpactRatingRepository(db);

  const oldestDate =
    await impactRatingRepository.getOldestActiveTestDateByRiskId(
      riskId,
      orgKey
    );

  return {
    statusCode: 200,
    body: JSON.stringify({
      oldestTestDate: oldestDate ?? null,
    }),
    headers: { 'Content-Type': 'application/json' },
  };
};
