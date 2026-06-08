import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { z } from 'zod';

import {
  createOrganisationRepository,
  getDatabaseConnection,
  type OrganisationRepository,
} from '../../../../../repositories';
import { createHttpReadHandler } from '../../../utils/create-http-read-handler';

export const pathParamsSchema = z.object({
  orgKey: z.string().min(1, 'OrgKey is required'),
});

interface ProcessorDependencies {
  organisationRepository: OrganisationRepository;
}

export const createProcessor =
  ({ organisationRepository }: ProcessorDependencies) =>
  async ({ orgKey }: { orgKey: string }) => {
    return organisationRepository.getByOrgKey(orgKey);
  };

/**
 * Processor for GET /organisations/{orgKey}
 * Retrieves a single organisation by OrgKey
 */
export const getOrganisationByOrgKeyProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<typeof pathParamsSchema, undefined>()
    .withPathParamsSchema(pathParamsSchema)
    .withObjectName('Organisation')
    .withHandler(async ({ pathParams, serviceContext }) => {
      const { tenant, orgKey } = serviceContext;

      const db = await getDatabaseConnection({ tenant, orgKey });
      const organisationRepository = createOrganisationRepository(db);

      return createProcessor({ organisationRepository })({
        orgKey: pathParams.orgKey,
      });
    })
    .forSingleItem()
    .execute(event, context);
};
