import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createScheduleRepository } from '../../../../../repositories/schedule-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

const pathParamsSchema = z.object({
  id: z.string().min(1, 'Schedule ID is required'),
});

/**
 * Processor for GET /schedules/{id}
 * Retrieves a single schedule config by ID
 * System-level read — no permission filter needed
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const getScheduleByIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('Schedule')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const scheduleRepository = createScheduleRepository(db);

      return scheduleRepository.getById(pathParams.id);
    })
    .forSingleItem()
    .execute(event, context);
};
