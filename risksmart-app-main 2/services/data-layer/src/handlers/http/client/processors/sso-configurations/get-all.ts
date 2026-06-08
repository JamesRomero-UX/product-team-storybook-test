import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createSsoConfigurationRepository,
  type SsoConfigurationRepository,
} from '../../../../../repositories/sso-configuration-repository';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

interface ProcessorDependencies {
  ssoConfigurationRepository: SsoConfigurationRepository;
}

export const createProcessor =
  ({ ssoConfigurationRepository }: ProcessorDependencies) =>
  async () => {
    return ssoConfigurationRepository.getAll();
  };

/**
 * Processor for GET /sso-configurations
 * Retrieves all SSO configurations for the current organisation
 */
export const getSsoConfigurationsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler()
    .withObjectName('SSO configuration')
    .withHandler(async ({ serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const ssoConfigurationRepository = createSsoConfigurationRepository(db);

      return createProcessor({ ssoConfigurationRepository })();
    })
    .execute(event, context);
};
