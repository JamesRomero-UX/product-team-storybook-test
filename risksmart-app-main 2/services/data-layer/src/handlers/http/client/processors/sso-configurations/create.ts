import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import { z } from 'zod';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createSsoConfigurationRepository,
  type SsoConfigurationRepository,
} from '../../../../../repositories/sso-configuration-repository';
import { getLogger } from '../../../../../utils/logger';
import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { ObjectCreationFailedError } from '../../../utils/error';
import { extractServiceContext } from '../../../utils/extract-context';
import { createdResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

export const createSsoConfigurationRequestSchema = z.object({
  Name: z.string().min(1, 'Name is required'),
  Strategy: z.string().min(1, 'Strategy is required'),
  ClientId: z.string().min(1, 'ClientId is required'),
  ConnectionId: z.string().min(1, 'ConnectionId is required'),
  Domain: z.string().min(1, 'Domain is required'),
  DomainAliases: z.array(z.string()),
  IsActive: z.boolean(),
  IsRestApiEnabled: z.boolean(),
  IsOrganizationConnected: z.boolean(),
});

interface ProcessorDependencies {
  ssoConfigurationRepository: SsoConfigurationRepository;
}

export const createProcessor =
  ({ ssoConfigurationRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createSsoConfigurationRequestSchema>;
    context: ServiceContext;
  }) => {
    logger.info('Processing create SSO configuration', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      Name: payload.Name,
      Strategy: payload.Strategy,
      ClientId: payload.ClientId,
      ConnectionId: payload.ConnectionId,
      Domain: payload.Domain,
      DomainAliases: payload.DomainAliases,
      IsActive: payload.IsActive,
      IsRestApiEnabled: payload.IsRestApiEnabled,
      IsOrganizationConnected: payload.IsOrganizationConnected,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
    };

    const result = await ssoConfigurationRepository.insert(insertData);
    const insertedRecord = result[0];

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created SSO configuration'
      );
    }

    logger.info('Successfully created SSO configuration', {
      objectId: insertedRecord.Id,
      connectionId: payload.ConnectionId,
    });

    return insertedRecord;
  };

export const createSsoConfigurationProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const ssoConfigurationRepository = createSsoConfigurationRepository(db);

  const processor = createProcessor({
    ssoConfigurationRepository,
  });

  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'sso_configuration',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createSsoConfigurationRequestSchema>()
    .withSchema(createSsoConfigurationRequestSchema)
    .withObjectName('sso_configuration')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'sso_configuration',
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createSsoConfigurationRequestSchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const result = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: createdResponse({
            event,
            object: result,
            objectType: 'sso-configuration',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
