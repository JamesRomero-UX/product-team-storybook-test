import { z } from 'zod';

import type { BaseEvent } from './common';
import {
  baseEventMetadataSchema,
  eventTypeSchema,
  PermissionsEvent,
  requiredUnknown,
  UserEvent,
} from './common';

export const tenantEventMetadataSchema = baseEventMetadataSchema.extend({
  tenant: z.string(),
  userId: z.union([z.literal('SYSTEM'), z.literal('SCIM'), z.literal('AUTH0')]), // The actor that triggered this event
});

export const tenantEventSchema = z.object({
  type: eventTypeSchema,
  data: requiredUnknown,
  metadata: tenantEventMetadataSchema,
});

export type TenantEventMetadata = z.infer<typeof tenantEventMetadataSchema>;

export type TenantEvent<TData> = BaseEvent<TData, TenantEventMetadata>;

// To add a new event, follow the pattern below: create a schema for the specific
// event type and add it to the TenantEventTypes union at the bottom of this file.

// ---------------------------------------------------------------------------
// User Events
// ---------------------------------------------------------------------------

export const userEventDataSchema = z.object({
  userId: z.string(), // The subject of the event (the user being created/deleted)
});

export type UserEventData = z.infer<typeof userEventDataSchema>;

export const failedUserEventDataSchema = userEventDataSchema.extend({
  error: z.string(),
});

export type FailedUserEventData = z.infer<typeof failedUserEventDataSchema>;

export const userCreatedEventSchema = tenantEventSchema.extend({
  type: z.literal(UserEvent.UserCreated),
  data: userEventDataSchema,
});

export type UserCreated = z.infer<typeof userCreatedEventSchema>;

/**
 * No userId generated if user creation failed.
 */
export const userCreationFailedEventSchema = tenantEventSchema.extend({
  type: z.literal(UserEvent.UserCreationFailed),
  data: failedUserEventDataSchema.omit({ userId: true }),
});

export type UserCreationFailed = z.infer<typeof userCreationFailedEventSchema>;

export const userDeletedEventSchema = tenantEventSchema.extend({
  type: z.literal(UserEvent.UserDeleted),
  data: userEventDataSchema,
});

export type UserDeleted = z.infer<typeof userDeletedEventSchema>;

export const userDeletionFailedEventSchema = tenantEventSchema.extend({
  type: z.literal(UserEvent.UserDeletionFailed),
  data: failedUserEventDataSchema,
});

export type UserDeletionFailed = z.infer<typeof userDeletionFailedEventSchema>;

// ---------------------------------------------------------------------------
// Permissions Events (tenant-scoped)
// ---------------------------------------------------------------------------

export const tenantPermissionsUpdatedEventSchema = tenantEventSchema.extend({
  type: z.literal(PermissionsEvent.PermissionsUpdated),
  data: userEventDataSchema,
});

export type TenantPermissionsUpdated = z.infer<
  typeof tenantPermissionsUpdatedEventSchema
>;

export const tenantPermissionsUpdateFailedEventSchema =
  tenantEventSchema.extend({
    type: z.literal(PermissionsEvent.PermissionsUpdateFailed),
    data: failedUserEventDataSchema,
  });

export type TenantPermissionsUpdateFailed = z.infer<
  typeof tenantPermissionsUpdateFailedEventSchema
>;

// ---------------------------------------------------------------------------

export type TenantEventTypes =
  | UserCreated
  | UserCreationFailed
  | UserDeleted
  | UserDeletionFailed
  | TenantPermissionsUpdated
  | TenantPermissionsUpdateFailed;

export type TenantEventTypeNames = TenantEventTypes['type'];
