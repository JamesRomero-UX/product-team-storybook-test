import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createScheduleStateRepository } from '../../../../../repositories/schedule-state-repository';
import { upsertScheduleStateRequestSchema } from '../../../../../schemas/schedule-state';
import { extractServiceContext } from '../../../utils/extract-context';

/**
 * Processor for PUT /schedule-states/{id}
 * Upserts a schedule state record (insert or update on conflict)
 * System-level mutation — no permission filter or EventBridge events needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const upsertScheduleStateProcessor = async (
  event: APIGatewayProxyEvent,
  _context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidPattern.test(id)) {
    throw new BadRequest(
      'Missing or invalid path parameter: id must be a valid UUID'
    );
  }

  const serviceContext = extractServiceContext(event);
  const { tenant, orgKey } = serviceContext;

  // Parse and validate request body
  const body = event.body ? JSON.parse(event.body) : {};
  const payload = upsertScheduleStateRequestSchema.parse(body);

  const db = await getDatabaseConnection({ tenant, orgKey });
  const scheduleStateRepository = createScheduleStateRepository(db);

  const result = await scheduleStateRepository.upsert(
    id,
    payload,
    serviceContext
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ Id: result.Id }),
    headers: { 'Content-Type': 'application/json' },
  };
};
