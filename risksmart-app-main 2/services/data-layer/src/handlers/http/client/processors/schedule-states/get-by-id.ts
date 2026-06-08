import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createScheduleStateRepository } from '../../../../../repositories/schedule-state-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  id: z.string().min(1, 'Schedule state ID is required'),
});

/**
 * Processor for GET /schedule-states/{id}
 * Retrieves the current schedule state by ID
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getScheduleStateByIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('ScheduleState')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const scheduleStateRepository = createScheduleStateRepository(db);

      return scheduleStateRepository.getById(pathParams.id);
    })
    .forSingleItem()
    .execute(event, context);
};
