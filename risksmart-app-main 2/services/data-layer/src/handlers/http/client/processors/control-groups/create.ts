import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type { InferSelectModel } from '@risksmart-app/drizzle/src/db';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type z from 'zod';

import { getDatabaseConnection } from '../../../../../repositories';
import type { ControlGroupRepository } from '../../../../../repositories/control-group-repository';
import { createControlGroupRepository } from '../../../../../repositories/control-group-repository';
import { createControlGroupRequestSchema } from '../../../../../schemas/control-group';
import type { ServiceContext } from '../../../../../types/service-context';
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

export interface ProcessorDependencies {
  controlGroupRepository: ControlGroupRepository;
}

/**
 * Processor for creating a control group
 * Handles database insertion
 */
export const createProcessor =
  ({ controlGroupRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: z.infer<typeof createControlGroupRequestSchema>;
    context: ServiceContext;
  }): Promise<InferSelectModel<'control_group'>> => {
    const { userId, orgKey, tenant } = context;

    logger.info('Processing create control group', {
      userId,
      orgKey,
      tenant,
    });

    const data = {
      ...payload,
      CreatedByUser: userId,
      ModifiedByUser: userId,
      OrgKey: orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const result = await controlGroupRepository.insert(data);
    const insertedRecord = result[0];

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created control group'
      );
    }

    logger.info('Successfully created control group', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /control-groups
 * Creates a new control group with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createControlGroupProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const controlGroupRepository = createControlGroupRepository(db);

  const processor = createProcessor({
    controlGroupRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'control_group',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createControlGroupRequestSchema>()
    .withSchema(createControlGroupRequestSchema)
    .withObjectName('control_group')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(() => [
      {
        objectName: 'control_group',
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          z.infer<typeof createControlGroupRequestSchema>,
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
            objectType: 'control-group',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
