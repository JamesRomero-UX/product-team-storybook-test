import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import { createFormConfigurationRepository } from '../../../../../repositories/form-configuration-repository';
import { formConfigurationQuerySchema } from '../../../../../schemas/form-configuration';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

/**
 * Processor for GET /form-configurations
 * Retrieves form configurations, optionally filtered by parent types
 *
 * Query parameters:
 * - parentTypes: comma-separated list of parent type enums (optional)
 *
 * Example: GET /form-configurations
 * Example: GET /form-configurations?parentTypes=risk,control,issue
 */
export const getFormConfigurationsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<undefined, typeof formConfigurationQuerySchema>()
    .withQueryParamsSchema(formConfigurationQuerySchema)
    .withObjectName('Form configuration')
    .withHandler(async ({ queryParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const formConfigurationRepository = createFormConfigurationRepository(db);

      return formConfigurationRepository.findMany({
        ...(queryParams.parentTypes?.length && {
          parentTypes: queryParams.parentTypes,
        }),
      });
    })
    .execute(event, context);
};
