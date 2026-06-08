import type { OrgUserEventTypeNames } from '@risksmart-app/events/src/types/orguser-events';
import type { TenantEventTypeNames } from '@risksmart-app/events/src/types/tenant-events';
import type { EventBridgeEvent } from 'aws-lambda';

import { getLogger } from '../logger';
import { initSentry } from '../sentry-init';
import { monoLambdaEventBridgeHandler } from './event-bridge-handler';
import { routeEvent } from './event-router';
import type { PermissionsEvent } from './types';
import { permissionsEventSchema } from './types';

initSentry();

const logger = getLogger();

const eventBridgeHandler = async (
  event: EventBridgeEvent<
    OrgUserEventTypeNames | TenantEventTypeNames,
    PermissionsEvent
  >
) => {
  logger.info('Permissions service handler invoked', {
    source: event.source,
    detailType: event['detail-type'],
  });

  try {
    const permissionEvent = permissionsEventSchema.parse(event.detail);

    await routeEvent(permissionEvent);

    logger.info('Permissions processed successfully', {
      type: permissionEvent.type,
      correlationId: permissionEvent.metadata.correlationId,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Permissions processing failed', {
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
      });
    } else {
      logger.error('Permissions processing failed', {
        error: String(error),
      });
    }
    throw error;
  }
};

export const handler = monoLambdaEventBridgeHandler<
  OrgUserEventTypeNames | TenantEventTypeNames,
  PermissionsEvent,
  void
>(eventBridgeHandler);
