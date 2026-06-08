import { z } from 'zod';

export enum AsyncRequestEvent {
  InitiateAsyncRequest = 'INITIATE_ASYNC_REQUEST',
  UpdateAsyncRequest = 'UPDATE_ASYNC_REQUEST',
}

export enum FormEvent {
  FormConfigurationFailed = 'FORM_CONFIGURATION_FAILED',
  FormConfigured = 'FORM_CONFIGURED',
}

export enum LinkedItemEvent {
  LinkedItemCreated = 'LINKED_ITEM_CREATED',
  LinkedItemCreationFailed = 'LINKED_ITEM_CREATION_FAILED',
  LinkedItemDeleted = 'LINKED_ITEM_DELETED',
  LinkedItemDeletionFailed = 'LINKED_ITEM_DELETION_FAILED',
}

export enum ObjectEvent {
  ObjectCreated = 'OBJECT_CREATED',
  ObjectCreationFailed = 'OBJECT_CREATION_FAILED',
  ObjectDeleted = 'OBJECT_DELETED',
  ObjectDeletionFailed = 'OBJECT_DELETION_FAILED',
  ObjectUpdated = 'OBJECT_UPDATED',
  ObjectUpdateFailed = 'OBJECT_UPDATE_FAILED',
}

export enum PermissionsEvent {
  PermissionsUpdated = 'PERMISSIONS_UPDATED',
  PermissionsUpdateFailed = 'PERMISSIONS_UPDATE_FAILED',
}

export enum RelationshipType {
  ChildParent = 'child_parent',
  ParentChild = 'parent_child',
  Sibling = 'sibling',
}

export enum RulebookEvent {
  ExternalObligationsUpdated = 'EXTERNAL_OBLIGATIONS_UPDATED',
}

export enum UserEvent {
  UserCreated = 'USER_CREATED',
  UserCreationFailed = 'USER_CREATION_FAILED',
  UserDeleted = 'USER_DELETED',
  UserDeletionFailed = 'USER_DELETION_FAILED',
}

export enum UserGroupEvent {
  UserGroupCreated = 'USER_GROUP_CREATED',
  UserGroupCreationFailed = 'USER_GROUP_CREATION_FAILED',
}

export type EventType =
  | AsyncRequestEvent
  | FormEvent
  | LinkedItemEvent
  | ObjectEvent
  | PermissionsEvent
  | RulebookEvent
  | UserEvent
  | UserGroupEvent;

export const eventTypeSchema = z.union([
  z.nativeEnum(AsyncRequestEvent),
  z.nativeEnum(FormEvent),
  z.nativeEnum(LinkedItemEvent),
  z.nativeEnum(ObjectEvent),
  z.nativeEnum(PermissionsEvent),
  z.nativeEnum(RulebookEvent),
  z.nativeEnum(UserEvent),
  z.nativeEnum(UserGroupEvent),
]);

export const baseEventMetadataSchema = z.object({
  eventId: z.string(),
  version: z.string(),
  timestamp: z.string(),
  domain: z.string(),
  service: z.string(),
  correlationId: z.string(),
  causationId: z.string().optional(),
});

export interface BaseEvent<TData, TMetadata> {
  type: EventType;
  data: TData;
  metadata: TMetadata;
}

export const requiredUnknown = z.custom<Required<unknown>>(
  (x) => x !== undefined
);
