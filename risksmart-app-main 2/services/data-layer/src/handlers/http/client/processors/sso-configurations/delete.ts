import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
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
import { extractServiceContext } from '../../../utils/extract-context';
import { deletedResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

const deleteSsoConfigurationBodySchema = z.object({});

const pathParamsSchema = z.object({
  connectionId: z.string().min(1, 'ConnectionId is required'),
});

interface ProcessorDependencies {
  ssoConfigurationRepository: SsoConfigurationRepository;
}

export const createProcessor =
  ({ ssoConfigurationRepository }: ProcessorDependencies) =>
  async ({
    connectionId,
    context,
  }: {
    connectionId: string;
    context: ServiceContext;
  }): Promise<string[]> => {
    logger.info('Processing delete SSO configuration', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
      connectionId,
    });

    const deletedIds =
      await ssoConfigurationRepository.deleteByConnectionId(connectionId);

    if (deletedIds.length === 0) {
      throw new NotFound('SSO configuration not found');
    }

    logger.info('Successfully deleted SSO configuration', {
      connectionId,
      deletedIds,
    });

    return deletedIds;
  };

export const deleteSsoConfigurationProcessor = async (
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
  const eventStrategy = new ObjectEventStrategy(
    'sso_configuration',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteSsoConfigurationBodySchema>()
    .withSchema(deleteSsoConfigurationBodySchema)
    .withObjectName('sso_configuration')
    .withEventStrategy(eventStrategy)
    .withPermissions(() => [
      {
        objectName: 'sso_configuration',
        action: 'delete',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof deleteSsoConfigurationBodySchema>,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const { connectionId } = pathParamsSchema.parse(event.pathParameters);

        const deletedIds = await processor({
          connectionId,
          context: context.serviceContext,
        });

        return {
          response: deletedResponse({
            event,
            objectType: 'sso-configuration',
          }),
          strategyData: {
            objectIds: deletedIds,
          },
        };
      }
    )
    .execute(event, context);
};
