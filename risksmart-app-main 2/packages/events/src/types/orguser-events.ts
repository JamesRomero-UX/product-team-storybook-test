import { z } from 'zod';

import type { BaseEvent } from './common';
import {
  baseEventMetadataSchema,
  eventTypeSchema,
  FormEvent,
  LinkedItemEvent,
  ObjectEvent,
  PermissionsEvent,
  RelationshipType,
  requiredUnknown,
  UserGroupEvent,
} from './common';

export const orgUserMetadataSchema = baseEventMetadataSchema.extend({
  tenant: z.string(),
  orgKey: z.string(),
  userId: z.string(),
});

export const orgUserEventSchema = z.object({
  type: eventTypeSchema,
  data: requiredUnknown,
  metadata: orgUserMetadataSchema,
});

export type OrgUserEventMetadata = z.infer<typeof orgUserMetadataSchema>;

export type OrgUserEvent<TData> = BaseEvent<TData, OrgUserEventMetadata>;

/**
 * Object Events (covers every object such as control, action, risk, etc. that has a corresponding node)
 */
export const orgUserObjectEventDataSchema = z.object({
  objectType: z.string(),
  objectId: z.string(),
});

export type OrgUserObjectEventData = z.infer<
  typeof orgUserObjectEventDataSchema
>;

export const failedOrgUserObjectEventDataSchema =
  orgUserObjectEventDataSchema.extend({
    error: z.string(),
  });

export type FailedOrgUserObjectEventData = z.infer<
  typeof failedOrgUserObjectEventDataSchema
>;

// Object Created
export const objectCreatedEventSchema = orgUserEventSchema.extend({
  type: z.literal(ObjectEvent.ObjectCreated),
  data: orgUserObjectEventDataSchema,
});

export type ObjectCreated = z.infer<typeof objectCreatedEventSchema>;

/**
 * No objectId generated if object creation failed
 */
export const objectCreationFailedEventSchema = orgUserEventSchema.extend({
  type: z.literal(ObjectEvent.ObjectCreationFailed),
  data: failedOrgUserObjectEventDataSchema.omit({ objectId: true }),
});

export type ObjectCreationFailed = z.infer<
  typeof objectCreationFailedEventSchema
>;

// Object Updated
export const objectUpdatedEventSchema = orgUserEventSchema.extend({
  type: z.literal(ObjectEvent.ObjectUpdated),
  data: orgUserObjectEventDataSchema,
});

export type ObjectUpdated = z.infer<typeof objectUpdatedEventSchema>;

export const objectUpdateFailedEventSchema = orgUserEventSchema.extend({
  type: z.literal(ObjectEvent.ObjectUpdateFailed),
  data: failedOrgUserObjectEventDataSchema,
});

export type ObjectUpdateFailed = z.infer<typeof objectUpdateFailedEventSchema>;

// Object Deleted
export const objectDeletedEventSchema = orgUserEventSchema.extend({
  type: z.literal(ObjectEvent.ObjectDeleted),
  data: orgUserObjectEventDataSchema,
});

export type ObjectDeleted = z.infer<typeof objectDeletedEventSchema>;

export const objectDeletionFailedEventSchema = orgUserEventSchema.extend({
  type: z.literal(ObjectEvent.ObjectDeletionFailed),
  data: failedOrgUserObjectEventDataSchema,
});

export type ObjectDeletionFailed = z.infer<
  typeof objectDeletionFailedEventSchema
>;

/**
 * Form configuration event data
 * Unlike object events, form events relate to form configuration changes (fields, schemas)
 * rather than object CRUD operations
 */
export const formConfiguredEventDataSchema = z.object({
  parentType: z.string(),
  fieldId: z.string(),
  operation: z.enum(['create', 'update', 'delete']),
});

export type FormConfiguredEventData = z.infer<
  typeof formConfiguredEventDataSchema
>;

export const failedFormConfiguredEventDataSchema =
  formConfiguredEventDataSchema.extend({
    error: z.string(),
  });

export type FailedFormConfiguredEventData = z.infer<
  typeof failedFormConfiguredEventDataSchema
>;

export const formConfiguredEventSchema = orgUserEventSchema.extend({
  type: z.literal(FormEvent.FormConfigured),
  data: formConfiguredEventDataSchema,
});

export type FormConfigured = z.infer<typeof formConfiguredEventSchema>;

export const formConfigurationFailedEventSchema = orgUserEventSchema.extend({
  type: z.literal(FormEvent.FormConfigurationFailed),
  data: failedFormConfiguredEventDataSchema,
});

export type FormConfigurationFailed = z.infer<
  typeof formConfigurationFailedEventSchema
>;

/**
 * Linked Item Events
 */
export const orgUserLinkedItemEventDataSchema = z.object({
  linkedItemId: z.string(),
  relationshipType: z.nativeEnum(RelationshipType),
  sourceId: z.string(),
  targetId: z.string(),
});

export type OrgUserLinkedItemEventData = z.infer<
  typeof orgUserLinkedItemEventDataSchema
>;

export const failedOrgUserLinkedItemEventDataSchema =
  orgUserLinkedItemEventDataSchema.extend({
    error: z.string(),
  });

export type FailedOrgUserLinkedItemEventData = z.infer<
  typeof failedOrgUserLinkedItemEventDataSchema
>;

// LinkedItem Created
export const linkedItemCreatedEventSchema = orgUserEventSchema.extend({
  type: z.literal(LinkedItemEvent.LinkedItemCreated),
  data: orgUserLinkedItemEventDataSchema,
});

export type LinkedItemCreated = z.infer<typeof linkedItemCreatedEventSchema>;

/**
 * No linkedItemId generated if linkedItem creation failed
 */
export const linkedItemCreationFailedEventSchema = orgUserEventSchema.extend({
  type: z.literal(LinkedItemEvent.LinkedItemCreationFailed),
  data: failedOrgUserLinkedItemEventDataSchema.omit({ linkedItemId: true }),
});

export type LinkedItemCreationFailed = z.infer<
  typeof linkedItemCreationFailedEventSchema
>;

// LinkedItem Deleted
export const linkedItemDeletedEventSchema = orgUserEventSchema.extend({
  type: z.literal(LinkedItemEvent.LinkedItemDeleted),
  data: orgUserLinkedItemEventDataSchema,
});

export type LinkedItemDeleted = z.infer<typeof linkedItemDeletedEventSchema>;

export const linkedItemDeletionFailedEventSchema = orgUserEventSchema.extend({
  type: z.literal(LinkedItemEvent.LinkedItemDeletionFailed),
  data: failedOrgUserLinkedItemEventDataSchema,
});

export type LinkedItemDeletionFailed = z.infer<
  typeof linkedItemDeletionFailedEventSchema
>;

// ---------------------------------------------------------------------------
// User Group Events
// ---------------------------------------------------------------------------

export const orgUserUserGroupEventDataSchema = z.object({
  groupId: z.string(),
});

export type OrgUserUserGroupEventData = z.infer<
  typeof orgUserUserGroupEventDataSchema
>;

export const failedOrgUserUserGroupEventDataSchema =
  orgUserUserGroupEventDataSchema.extend({
    error: z.string(),
  });

export type FailedOrgUserUserGroupEventData = z.infer<
  typeof failedOrgUserUserGroupEventDataSchema
>;

// User Group Created
export const userGroupCreatedEventSchema = orgUserEventSchema.extend({
  type: z.literal(UserGroupEvent.UserGroupCreated),
  data: orgUserUserGroupEventDataSchema,
});

export type UserGroupCreated = z.infer<typeof userGroupCreatedEventSchema>;

/**
 * No groupId generated if user group creation failed
 */
export const userGroupCreationFailedEventSchema = orgUserEventSchema.extend({
  type: z.literal(UserGroupEvent.UserGroupCreationFailed),
  data: failedOrgUserUserGroupEventDataSchema.omit({ groupId: true }),
});

export type UserGroupCreationFailed = z.infer<
  typeof userGroupCreationFailedEventSchema
>;

// ---------------------------------------------------------------------------
// Permissions Events (org-user-scoped)
// ---------------------------------------------------------------------------

export const orgUserPermissionsUpdatedEventSchema = orgUserEventSchema.extend({
  type: z.literal(PermissionsEvent.PermissionsUpdated),
  data: z.union([
    orgUserObjectEventDataSchema,
    orgUserLinkedItemEventDataSchema,
    orgUserUserGroupEventDataSchema,
  ]),
});

export type OrgUserPermissionsUpdated = z.infer<
  typeof orgUserPermissionsUpdatedEventSchema
>;

export const orgUserPermissionsUpdateFailedEventSchema =
  orgUserEventSchema.extend({
    type: z.literal(PermissionsEvent.PermissionsUpdateFailed),
    data: z.union([
      failedOrgUserObjectEventDataSchema,
      failedOrgUserLinkedItemEventDataSchema,
      failedOrgUserUserGroupEventDataSchema,
    ]),
  });

export type OrgUserPermissionsUpdateFailed = z.infer<
  typeof orgUserPermissionsUpdateFailedEventSchema
>;

// ---------------------------------------------------------------------------

export type OrgUserEventTypes =
  | ObjectCreated
  | ObjectCreationFailed
  | ObjectDeleted
  | ObjectDeletionFailed
  | ObjectUpdated
  | ObjectUpdateFailed
  | LinkedItemCreated
  | LinkedItemCreationFailed
  | LinkedItemDeleted
  | LinkedItemDeletionFailed
  | FormConfigured
  | FormConfigurationFailed
  | OrgUserPermissionsUpdated
  | OrgUserPermissionsUpdateFailed
  | UserGroupCreated
  | UserGroupCreationFailed;

export type OrgUserEventTypeNames = OrgUserEventTypes['type'];
