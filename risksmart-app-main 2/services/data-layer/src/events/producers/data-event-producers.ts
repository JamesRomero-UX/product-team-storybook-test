import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import {
  type EventType,
  FormEvent,
  LinkedItemEvent,
  ObjectEvent,
  UserEvent,
  UserGroupEvent,
} from '@risksmart-app/events/src/types/common';
import type {
  FailedFormConfiguredEventData,
  FailedOrgUserLinkedItemEventData,
  FailedOrgUserObjectEventData,
  FailedOrgUserUserGroupEventData,
  FormConfigurationFailed,
  FormConfigured,
  FormConfiguredEventData,
  LinkedItemCreated,
  LinkedItemCreationFailed,
  LinkedItemDeleted,
  LinkedItemDeletionFailed,
  ObjectCreated,
  ObjectCreationFailed,
  ObjectDeleted,
  ObjectDeletionFailed,
  ObjectUpdated,
  ObjectUpdateFailed,
  OrgUserEventMetadata,
  OrgUserLinkedItemEventData,
  OrgUserObjectEventData,
  OrgUserUserGroupEventData,
  UserGroupCreated,
  UserGroupCreationFailed,
} from '@risksmart-app/events/src/types/orguser-events';
import type {
  FailedUserEventData,
  TenantEventMetadata,
  UserCreated,
  UserCreationFailed,
  UserDeleted,
  UserDeletionFailed,
  UserEventData,
} from '@risksmart-app/events/src/types/tenant-events';
import { randomUUID } from 'crypto';

const DATA_LAYER_SERVICE = 'risksmart.data-layer';
const EVENT_VERSION = '1.0.0';
const EVENT_DOMAIN = 'risksmart.app';

const createOrgUserEventMetadata = (
  originalMetadata: OrgUserEventMetadata
): OrgUserEventMetadata => ({
  eventId: randomUUID(),
  version: EVENT_VERSION,
  timestamp: new Date().toISOString(),
  domain: EVENT_DOMAIN,
  service: DATA_LAYER_SERVICE,
  correlationId: originalMetadata.correlationId,
  tenant: originalMetadata.tenant,
  orgKey: originalMetadata.orgKey,
  userId: originalMetadata.userId,
});

const createTenantEventMetadata = (
  originalMetadata: TenantEventMetadata
): TenantEventMetadata => ({
  eventId: randomUUID(),
  version: EVENT_VERSION,
  timestamp: new Date().toISOString(),
  domain: EVENT_DOMAIN,
  service: DATA_LAYER_SERVICE,
  correlationId: originalMetadata.correlationId,
  tenant: originalMetadata.tenant,
  userId: originalMetadata.userId,
});

export const createObjectCreatedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: OrgUserObjectEventData
): ObjectCreated => ({
  type: ObjectEvent.ObjectCreated,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createObjectCreationFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: Omit<FailedOrgUserObjectEventData, 'objectId'>
): ObjectCreationFailed => ({
  type: ObjectEvent.ObjectCreationFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createObjectUpdatedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: OrgUserObjectEventData
): ObjectUpdated => ({
  type: ObjectEvent.ObjectUpdated,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createObjectUpdateFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: FailedOrgUserObjectEventData
): ObjectUpdateFailed => ({
  type: ObjectEvent.ObjectUpdateFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createObjectDeletedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: OrgUserObjectEventData
): ObjectDeleted => ({
  type: ObjectEvent.ObjectDeleted,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createObjectDeletionFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: FailedOrgUserObjectEventData
): ObjectDeletionFailed => ({
  type: ObjectEvent.ObjectDeletionFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createLinkedItemCreatedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: OrgUserLinkedItemEventData
): LinkedItemCreated => ({
  type: LinkedItemEvent.LinkedItemCreated,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createLinkedItemCreationFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: Omit<FailedOrgUserLinkedItemEventData, 'linkedItemId'>
): LinkedItemCreationFailed => ({
  type: LinkedItemEvent.LinkedItemCreationFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createLinkedItemDeletedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: OrgUserLinkedItemEventData
): LinkedItemDeleted => ({
  type: LinkedItemEvent.LinkedItemDeleted,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createLinkedItemDeletionFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: FailedOrgUserLinkedItemEventData
): LinkedItemDeletionFailed => ({
  type: LinkedItemEvent.LinkedItemDeletionFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createObjectEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  /**
   * Generic helper to emit events to EventBridge with consistent error handling and logging.
   */
  const emitEvent = async <T extends { type: EventType }>(
    event: T,
    logContext: Record<string, unknown>
  ) => {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: DATA_LAYER_SERVICE,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    });

    try {
      await eventBridge.send(command);
      logger.info(`Successfully emitted ${event.type} event`, logContext);
    } catch (error) {
      logger.error(`Failed to emit ${event.type} event`, {
        error,
        ...logContext,
      });
      throw error;
    }
  };

  const emitObjectCreatedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: OrgUserObjectEventData
  ) => {
    const event = createObjectCreatedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitObjectCreationFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: Omit<FailedOrgUserObjectEventData, 'objectId'>
  ) => {
    const event = createObjectCreationFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitObjectUpdatedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: OrgUserObjectEventData
  ) => {
    const event = createObjectUpdatedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitObjectUpdateFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: FailedOrgUserObjectEventData
  ) => {
    const event = createObjectUpdateFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitObjectDeletedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: OrgUserObjectEventData
  ) => {
    const event = createObjectDeletedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitObjectDeletionFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: FailedOrgUserObjectEventData
  ) => {
    const event = createObjectDeletionFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  return {
    emitObjectCreatedEvent,
    emitObjectCreationFailedEvent,
    emitObjectUpdatedEvent,
    emitObjectUpdateFailedEvent,
    emitObjectDeletedEvent,
    emitObjectDeletionFailedEvent,
  };
};

export const createLinkedItemEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  /**
   * Generic helper to emit events to EventBridge with consistent error handling and logging.
   */
  const emitEvent = async <T extends { type: EventType }>(
    event: T,
    logContext: Record<string, unknown>
  ) => {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: DATA_LAYER_SERVICE,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    });

    try {
      await eventBridge.send(command);
      logger.info(`Successfully emitted ${event.type} event`, logContext);
    } catch (error) {
      logger.error(`Failed to emit ${event.type} event`, {
        error,
        ...logContext,
      });
      throw error;
    }
  };

  const emitLinkedItemCreatedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: OrgUserLinkedItemEventData
  ) => {
    const event = createLinkedItemCreatedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitLinkedItemCreationFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: Omit<FailedOrgUserLinkedItemEventData, 'linkedItemId'>
  ) => {
    const event = createLinkedItemCreationFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitLinkedItemDeletedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: OrgUserLinkedItemEventData
  ) => {
    const event = createLinkedItemDeletedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitLinkedItemDeletionFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: FailedOrgUserLinkedItemEventData
  ) => {
    const event = createLinkedItemDeletionFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  return {
    emitLinkedItemCreatedEvent,
    emitLinkedItemCreationFailedEvent,
    emitLinkedItemDeletedEvent,
    emitLinkedItemDeletionFailedEvent,
  };
};

/**
 * Creates form configuration event objects
 */
export const createFormConfiguredEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: FormConfiguredEventData
): FormConfigured => ({
  type: FormEvent.FormConfigured,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createFormConfigurationFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: FailedFormConfiguredEventData
): FormConfigurationFailed => ({
  type: FormEvent.FormConfigurationFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

/**
 * Creates form event emitters for form configuration changes
 */
export const createFormEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  /**
   * Generic helper to emit events to EventBridge with consistent error handling and logging.
   */
  const emitEvent = async <T extends { type: EventType }>(
    event: T,
    logContext: Record<string, unknown>
  ) => {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: DATA_LAYER_SERVICE,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    });

    try {
      await eventBridge.send(command);
      logger.info(`Successfully emitted ${event.type} event`, logContext);
    } catch (error) {
      logger.error(`Failed to emit ${event.type} event`, {
        error,
        ...logContext,
      });
      throw error;
    }
  };

  const emitFormConfiguredEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: FormConfiguredEventData
  ) => {
    const event = createFormConfiguredEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitFormConfigurationFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: FailedFormConfiguredEventData
  ) => {
    const event = createFormConfigurationFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  return {
    emitFormConfiguredEvent,
    emitFormConfigurationFailedEvent,
  };
};

/**
 * Creates user group event objects
 */
export const createUserGroupCreatedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: OrgUserUserGroupEventData
): UserGroupCreated => ({
  type: UserGroupEvent.UserGroupCreated,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

export const createUserGroupCreationFailedEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: Omit<FailedOrgUserUserGroupEventData, 'groupId'>
): UserGroupCreationFailed => ({
  type: UserGroupEvent.UserGroupCreationFailed,
  data: {
    ...changeData,
  },
  metadata: createOrgUserEventMetadata(originalMetadata),
});

/**
 * Creates user group event emitters
 */
export const createUserGroupEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  const emitEvent = async <T extends { type: EventType }>(
    event: T,
    logContext: Record<string, unknown>
  ) => {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: DATA_LAYER_SERVICE,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    });

    try {
      await eventBridge.send(command);
      logger.info(`Successfully emitted ${event.type} event`, logContext);
    } catch (error) {
      logger.error(`Failed to emit ${event.type} event`, {
        error,
        ...logContext,
      });
      throw error;
    }
  };

  const emitUserGroupCreatedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: OrgUserUserGroupEventData
  ) => {
    const event = createUserGroupCreatedEvent(originalMetadata, data);
    await emitEvent(event, { ...data });
  };

  const emitUserGroupCreationFailedEvent = async (
    originalMetadata: OrgUserEventMetadata,
    data: Omit<FailedOrgUserUserGroupEventData, 'groupId'>
  ) => {
    const event = createUserGroupCreationFailedEvent(originalMetadata, data);
    await emitEvent(event, { ...data });
  };

  return {
    emitUserGroupCreatedEvent,
    emitUserGroupCreationFailedEvent,
  };
};

/**
 * Creates user event objects
 */
export const createUserCreatedEvent = (
  originalMetadata: TenantEventMetadata,
  changeData: UserEventData
): UserCreated => ({
  type: UserEvent.UserCreated,
  data: {
    ...changeData,
  },
  metadata: createTenantEventMetadata(originalMetadata),
});

export const createUserCreationFailedEvent = (
  originalMetadata: TenantEventMetadata,
  changeData: Omit<FailedUserEventData, 'userId'>
): UserCreationFailed => ({
  type: UserEvent.UserCreationFailed,
  data: {
    ...changeData,
  },
  metadata: createTenantEventMetadata(originalMetadata),
});

export const createUserDeletedEvent = (
  originalMetadata: TenantEventMetadata,
  changeData: UserEventData
): UserDeleted => ({
  type: UserEvent.UserDeleted,
  data: {
    ...changeData,
  },
  metadata: createTenantEventMetadata(originalMetadata),
});

export const createUserDeletionFailedEvent = (
  originalMetadata: TenantEventMetadata,
  changeData: FailedUserEventData
): UserDeletionFailed => ({
  type: UserEvent.UserDeletionFailed,
  data: {
    ...changeData,
  },
  metadata: createTenantEventMetadata(originalMetadata),
});

/**
 * Creates user event emitters
 */
export const createUserEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  /**
   * Generic helper to emit events to EventBridge with consistent error handling and logging.
   */
  const emitEvent = async <T extends { type: EventType }>(
    event: T,
    logContext: Record<string, unknown>
  ) => {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: DATA_LAYER_SERVICE,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    });

    try {
      await eventBridge.send(command);
      logger.info(`Successfully emitted ${event.type} event`, logContext);
    } catch (error) {
      logger.error(`Failed to emit ${event.type} event`, {
        error,
        ...logContext,
      });
      throw error;
    }
  };

  const emitUserCreatedEvent = async (
    originalMetadata: TenantEventMetadata,
    data: UserEventData
  ) => {
    const event = createUserCreatedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitUserCreationFailedEvent = async (
    originalMetadata: TenantEventMetadata,
    data: Omit<FailedUserEventData, 'userId'>
  ) => {
    const event = createUserCreationFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitUserDeletedEvent = async (
    originalMetadata: TenantEventMetadata,
    data: UserEventData
  ) => {
    const event = createUserDeletedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  const emitUserDeletionFailedEvent = async (
    originalMetadata: TenantEventMetadata,
    data: FailedUserEventData
  ) => {
    const event = createUserDeletionFailedEvent(originalMetadata, data);
    await emitEvent(event, {
      ...data,
    });
  };

  return {
    emitUserCreatedEvent,
    emitUserCreationFailedEvent,
    emitUserDeletedEvent,
    emitUserDeletionFailedEvent,
  };
};
