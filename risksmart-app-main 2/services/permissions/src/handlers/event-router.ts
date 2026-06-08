import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import {
  LinkedItemEvent,
  ObjectEvent,
  UserEvent,
  UserGroupEvent,
} from '@risksmart-app/events/src/types/common';

import { createPermitDependencies } from '../adaptors/permit/create-permit-dependencies';
import { getLogger } from '../logger';
import type { PermitDependencies } from '../types';
import { createLinkedItemCreatedPermissions } from './linked-item-created-permissions';
import { createLinkedItemDeletedPermissions } from './linked-item-deleted-permissions';
import { createObjectCreatedPermissions } from './object-created-permissions';
import { createObjectDeletedPermissions } from './object-deleted-permissions';
import { createObjectUpdatedPermissions } from './object-updated-permissions';
import type { PermissionsEvent } from './types';
import { createUserCreatedPermissions } from './user-created-permissions';
import { createUserDeletedPermissions } from './user-deleted-permissions';
import { createUserGroupCreatedPermissions } from './user-group-created-permissions';

const logger = getLogger();
const eventBridge = new EventBridgeClient({});

export const routeEvent = async (event: PermissionsEvent): Promise<void> => {
  const { type, metadata } = event;

  logger.info('Routing event', {
    type,
    tenant: metadata?.tenant,
    correlationId: metadata?.correlationId,
  });

  const permitDeps: PermitDependencies = await createPermitDependencies(logger);

  // there might be some optimisation opportunities here by reusing handlers and dependencies
  const commonDependencies = { eventBridge, logger, permitDeps };

  switch (type) {
    case ObjectEvent.ObjectCreated: {
      const handler = createObjectCreatedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    case ObjectEvent.ObjectUpdated: {
      const handler = createObjectUpdatedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    case ObjectEvent.ObjectDeleted: {
      const handler = createObjectDeletedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    case LinkedItemEvent.LinkedItemCreated: {
      const handler = createLinkedItemCreatedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    case LinkedItemEvent.LinkedItemDeleted: {
      const handler = createLinkedItemDeletedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    case UserEvent.UserCreated: {
      const handler = createUserCreatedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    case UserEvent.UserDeleted: {
      const handler = createUserDeletedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    case UserGroupEvent.UserGroupCreated: {
      const handler = createUserGroupCreatedPermissions(commonDependencies);
      await handler(event);
      break;
    }
    default: {
      // this case should never happen due to type checking.
      // But in the event that someone extends the EventType enum without updating this switch,
      // we want to fail loudly.
      const _exhaustive: never = type;
      // _exhaustive is `never` for compile-time exhaustiveness; cast to string for the error message.
      throw new Error(`Unknown event type: ${_exhaustive as string}`);
    }
  }
};
