import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import type { EventType } from '@risksmart-app/events/src/types/common';
import { PermissionsEvent } from '@risksmart-app/events/src/types/common';
import type {
  FailedOrgUserLinkedItemEventData,
  FailedOrgUserObjectEventData,
  FailedOrgUserUserGroupEventData,
  OrgUserEventMetadata,
  OrgUserLinkedItemEventData,
  OrgUserObjectEventData,
  OrgUserPermissionsUpdated,
  OrgUserPermissionsUpdateFailed,
  OrgUserUserGroupEventData,
} from '@risksmart-app/events/src/types/orguser-events';
import type {
  FailedUserEventData,
  TenantEventMetadata,
  TenantPermissionsUpdated,
  TenantPermissionsUpdateFailed,
  UserEventData,
} from '@risksmart-app/events/src/types/tenant-events';
import { randomUUID } from 'crypto';

const PERMISSIONS_SERVICE = 'risksmart.permissions';
const EVENT_VERSION = '1.0.0';
const EVENT_DOMAIN = 'risksmart.app';

// ---------------------------------------------------------------------------
// OrgUser-scoped permissions event factories
// ---------------------------------------------------------------------------

type OrgUserPermissionsEventData =
  | OrgUserObjectEventData
  | OrgUserLinkedItemEventData
  | OrgUserUserGroupEventData;

type FailedOrgUserPermissionsEventData =
  | FailedOrgUserObjectEventData
  | FailedOrgUserLinkedItemEventData
  | FailedOrgUserUserGroupEventData;

const createOrgUserPermissionsMetadata = (
  originalMetadata: OrgUserEventMetadata
): OrgUserEventMetadata => ({
  eventId: randomUUID(),
  version: EVENT_VERSION,
  timestamp: new Date().toISOString(),
  domain: EVENT_DOMAIN,
  service: PERMISSIONS_SERVICE,
  correlationId: originalMetadata.correlationId,
  tenant: originalMetadata.tenant,
  orgKey: originalMetadata.orgKey,
  userId: originalMetadata.userId,
});

export const createOrgUserPermissionsUpdatedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: OrgUserPermissionsEventData
): OrgUserPermissionsUpdated => ({
  type: PermissionsEvent.PermissionsUpdated,
  data: {
    ...changeData,
  },
  metadata: createOrgUserPermissionsMetadata(originalMetadata),
});

export const createOrgUserPermissionsUpdateFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: FailedOrgUserPermissionsEventData
): OrgUserPermissionsUpdateFailed => ({
  type: PermissionsEvent.PermissionsUpdateFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserPermissionsMetadata(originalMetadata),
});

// ---------------------------------------------------------------------------
// Tenant-scoped permissions event factories
// ---------------------------------------------------------------------------

const createTenantPermissionsMetadata = (
  originalMetadata: TenantEventMetadata
): TenantEventMetadata => ({
  eventId: randomUUID(),
  version: EVENT_VERSION,
  timestamp: new Date().toISOString(),
  domain: EVENT_DOMAIN,
  service: PERMISSIONS_SERVICE,
  correlationId: originalMetadata.correlationId,
  tenant: originalMetadata.tenant,
  userId: originalMetadata.userId,
});

export const createTenantPermissionsUpdatedEvent = (
  originalMetadata: TenantEventMetadata,
  changeData: UserEventData
): TenantPermissionsUpdated => ({
  type: PermissionsEvent.PermissionsUpdated,
  data: {
    ...changeData,
  },
  metadata: createTenantPermissionsMetadata(originalMetadata),
});

export const createTenantPermissionsUpdateFailedEvent = (
  originalMetadata: TenantEventMetadata,
  changeData: FailedUserEventData
): TenantPermissionsUpdateFailed => ({
  type: PermissionsEvent.PermissionsUpdateFailed,
  data: {
    ...changeData,
  },
  metadata: createTenantPermissionsMetadata(originalMetadata),
});

// ---------------------------------------------------------------------------
// Shared emit helper
// ---------------------------------------------------------------------------

const createEmitEvent = (eventBridge: EventBridgeClient, logger: Logger) => {
  return async <T extends { type: EventType }>(
    event: T,
    logContext: Record<string, unknown> = {}
  ) => {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: PERMISSIONS_SERVICE,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    });

    try {
      await eventBridge.send(command);
      logger.info(`Successfully emitted ${event.type} event`, logContext);
    } catch (emitError) {
      logger.error(`Failed to emit ${event.type} event`, {
        emitError,
        ...logContext,
      });
      throw emitError;
    }
  };
};

// ---------------------------------------------------------------------------
// OrgUser-scoped emitters
// ---------------------------------------------------------------------------

export const createOrgUserPermissionsEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  const emitEvent = createEmitEvent(eventBridge, logger);

  const emitPermissionsUpdatedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: OrgUserPermissionsEventData
  ) => {
    const event = createOrgUserPermissionsUpdatedEvent(originalMetadata, data);
    await emitEvent(event);
  };

  const emitPermissionsUpdateFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: FailedOrgUserPermissionsEventData
  ) => {
    const event = createOrgUserPermissionsUpdateFailedEvent(
      originalMetadata,
      data
    );
    await emitEvent(event, { error: data.error });
  };

  return {
    emitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent,
  };
};

// ---------------------------------------------------------------------------
// Tenant-scoped emitters
// ---------------------------------------------------------------------------

export const createTenantPermissionsEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  const emitEvent = createEmitEvent(eventBridge, logger);

  const emitPermissionsUpdatedEvent = async (
    originalMetadata: TenantEventMetadata,
    data: UserEventData
  ) => {
    const event = createTenantPermissionsUpdatedEvent(originalMetadata, data);
    await emitEvent(event);
  };

  const emitPermissionsUpdateFailedEvent = async (
    originalMetadata: TenantEventMetadata,
    data: FailedUserEventData
  ) => {
    const event = createTenantPermissionsUpdateFailedEvent(
      originalMetadata,
      data
    );
    await emitEvent(event, { error: data.error });
  };

  return {
    emitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent,
  };
};
