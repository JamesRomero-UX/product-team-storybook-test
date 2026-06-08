import {
  type LinkedItemCreated,
  linkedItemCreatedEventSchema,
  type LinkedItemDeleted,
  linkedItemDeletedEventSchema,
  type ObjectCreated,
  objectCreatedEventSchema,
  type ObjectDeleted,
  objectDeletedEventSchema,
  type ObjectUpdated,
  objectUpdatedEventSchema,
  type UserGroupCreated,
  userGroupCreatedEventSchema,
} from '@risksmart-app/events/src/types/orguser-events';
import {
  type UserCreated,
  userCreatedEventSchema,
  type UserDeleted,
  userDeletedEventSchema,
} from '@risksmart-app/events/src/types/tenant-events';
import { z } from 'zod';

export const permissionsEventSchema = z.discriminatedUnion('type', [
  objectCreatedEventSchema,
  objectUpdatedEventSchema,
  objectDeletedEventSchema,
  linkedItemCreatedEventSchema,
  linkedItemDeletedEventSchema,
  userCreatedEventSchema,
  userDeletedEventSchema,
  userGroupCreatedEventSchema,
]);

export type PermissionsEvent =
  | ObjectCreated
  | ObjectDeleted
  | ObjectUpdated
  | LinkedItemCreated
  | LinkedItemDeleted
  | UserCreated
  | UserDeleted
  | UserGroupCreated;
