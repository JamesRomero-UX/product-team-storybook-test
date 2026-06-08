import type { UpdateAsyncRequest } from '@risksmart-app/events/src/types/command-types';
import {
  FormEvent,
  LinkedItemEvent,
  ObjectEvent,
  PermissionsEvent,
  UserGroupEvent,
} from '@risksmart-app/events/src/types/common';
import type {
  OrgUserEventMetadata,
  OrgUserEventTypeNames,
  OrgUserEventTypes,
} from '@risksmart-app/events/src/types/orguser-events';
import type { StateUpdaterInput } from 'src/event-store/db/processor';
import { getLogger } from 'src/utils/logger';

import type { InputEventTypes } from '../aggregator/inputs';
import type { OutputEventTypes } from '../aggregator/outputs';
import {
  type RequestState,
  type RequestStateTask,
  RequestStateTaskStatus,
} from '../aggregator/types';

const logger = getLogger();

/**
 * Extracts objectType from event payload data
 */
const getEventObjectType = (payload: OrgUserEventTypes): string | undefined =>
  'objectType' in payload.data ? payload.data.objectType : undefined;

/**
 * Extracts objectId from event payload data
 */
const getEventObjectId = (payload: OrgUserEventTypes): string | undefined =>
  'objectId' in payload.data ? payload.data.objectId : undefined;

/**
 * Checks if a task matches the given event
 * Supports both exact match (with objectId) and loose match (without objectId) for backward compatibility
 */
const isTaskMatchForEvent = (
  task: RequestStateTask,
  eventType: OrgUserEventTypeNames,
  eventObjectType?: string,
  eventObjectId?: string
): boolean => {
  // Event type must match
  if (task.eventType !== eventType) {
    return false;
  }

  // If task has objectType filter, event must match
  if (task.objectType && task.objectType !== eventObjectType) {
    return false;
  }

  // If task has objectId filter, event must match (for batch operations)
  // If task doesn't have objectId, match any event with matching eventType/objectType (backward compatible)
  if (task.objectId && task.objectId !== eventObjectId) {
    return false;
  }

  return true;
};

/**
 * Finds all tasks that match the given event
 * First tries to find exact matches (including objectId), then falls back to loose matches
 */
const findMatchingTasks = (
  state: RequestState,
  eventType: OrgUserEventTypeNames,
  eventObjectType?: string,
  eventObjectId?: string
): Array<[string, RequestStateTask]> => {
  const allMatches = Object.entries(state.tasks || {}).filter(([, task]) =>
    isTaskMatchForEvent(task, eventType, eventObjectType, eventObjectId)
  );

  // If we have objectId in the event, prefer exact matches (tasks with that objectId)
  if (eventObjectId) {
    const exactMatches = allMatches.filter(
      ([, task]) => task.objectId === eventObjectId
    );
    if (exactMatches.length > 0) {
      return exactMatches;
    }
  }

  // Fall back to loose matches (tasks without objectId) for backward compatibility
  return allMatches.filter(([, task]) => !task.objectId);
};

/**
 * Finds tasks that should be marked as failed based on failure event type
 */
const findTasksForFailureEvent = (
  state: RequestState,
  failureEventType: OrgUserEventTypeNames,
  eventObjectType?: string,
  eventObjectId?: string
): Array<[string, RequestStateTask]> => {
  // Map failure events to their corresponding success event types
  const FAILURE_TO_SUCCESS_MAP: Record<string, OrgUserEventTypeNames> = {
    [ObjectEvent.ObjectCreationFailed]: ObjectEvent.ObjectCreated,
    [ObjectEvent.ObjectDeletionFailed]: ObjectEvent.ObjectDeleted,
    [ObjectEvent.ObjectUpdateFailed]: ObjectEvent.ObjectUpdated,
    [LinkedItemEvent.LinkedItemCreationFailed]:
      LinkedItemEvent.LinkedItemCreated,
    [LinkedItemEvent.LinkedItemDeletionFailed]:
      LinkedItemEvent.LinkedItemDeleted,
    [PermissionsEvent.PermissionsUpdateFailed]:
      PermissionsEvent.PermissionsUpdated,
    [FormEvent.FormConfigurationFailed]: FormEvent.FormConfigured,
    [UserGroupEvent.UserGroupCreationFailed]: UserGroupEvent.UserGroupCreated,
  };

  const successEventType = FAILURE_TO_SUCCESS_MAP[failureEventType];
  if (!successEventType) {
    return [];
  }

  return findMatchingTasks(
    state,
    successEventType,
    eventObjectType,
    eventObjectId
  );
};

/**
 * Updates a task status and optionally sets error state and objectId
 */
const updateTaskStatus = (
  state: RequestState,
  taskId: string,
  task: RequestStateTask,
  status: RequestStateTaskStatus.COMPLETE | RequestStateTaskStatus.FAILED,
  objectId?: string,
  errorData?: unknown
): RequestState => {
  state.tasks = {
    ...state.tasks,
    [taskId]: {
      ...task,
      status,
      ...(objectId && { objectId }),
    },
  };

  if (errorData) {
    state.error = JSON.stringify(errorData);
  }

  return state;
};

/**
 * Handles failure events generically
 */
const handleFailureEvent = (
  state: RequestState,
  failureEventType: OrgUserEventTypeNames,
  payload: OrgUserEventTypes
): RequestState => {
  const eventObjectType = getEventObjectType(payload);
  const eventObjectId = getEventObjectId(payload);
  const matchingTasks = findTasksForFailureEvent(
    state,
    failureEventType,
    eventObjectType,
    eventObjectId
  );

  if (matchingTasks.length === 0) {
    logger.info(`No matching tasks found for ${failureEventType}`, {
      eventObjectType,
      eventObjectId,
    });

    return state;
  }

  logger.info(
    `Marking ${matchingTasks.length} task(s) as FAILED due to ${failureEventType}`,
    { eventObjectType, eventObjectId, taskIds: matchingTasks.map(([id]) => id) }
  );

  matchingTasks.forEach(([taskId, task]) => {
    updateTaskStatus(
      state,
      taskId,
      task,
      RequestStateTaskStatus.FAILED,
      undefined,
      JSON.stringify(payload.data)
    );
  });

  return state;
};

/**
 * Handles success events (OBJECT_CREATED, PERMISSIONS_UPDATED, etc.)
 */
const handleSuccessEvent = (
  state: RequestState,
  eventType: OrgUserEventTypeNames,
  payload: OrgUserEventTypes
): RequestState => {
  const eventObjectType = getEventObjectType(payload);
  const eventObjectId = getEventObjectId(payload);
  const matchingTasks = findMatchingTasks(
    state,
    eventType,
    eventObjectType,
    eventObjectId
  );

  if (matchingTasks.length === 0) {
    logger.info(`No matching tasks found for ${eventType}`, {
      eventObjectType,
      eventObjectId,
    });

    return state;
  }

  logger.info(
    `Marking ${matchingTasks.length} task(s) as COMPLETE for ${eventType}`,
    { eventObjectType, eventObjectId, taskIds: matchingTasks.map(([id]) => id) }
  );

  matchingTasks.forEach(([taskId, task]) => {
    updateTaskStatus(
      state,
      taskId,
      task,
      RequestStateTaskStatus.COMPLETE,
      eventObjectId
    );
  });

  return state;
};

/**
 * Failure event types that need special handling
 */
const FAILURE_EVENT_TYPES = new Set([
  FormEvent.FormConfigurationFailed,
  LinkedItemEvent.LinkedItemCreationFailed,
  LinkedItemEvent.LinkedItemDeletionFailed,
  ObjectEvent.ObjectCreationFailed,
  ObjectEvent.ObjectDeletionFailed,
  ObjectEvent.ObjectUpdateFailed,
  PermissionsEvent.PermissionsUpdateFailed,
  UserGroupEvent.UserGroupCreationFailed,
]);

export const updateAsyncRequestRule = (
  input: StateUpdaterInput<
    RequestState,
    InputEventTypes,
    OutputEventTypes,
    UpdateAsyncRequest<OrgUserEventTypes, OrgUserEventMetadata>
  >
): RequestState => {
  const { state, current } = input;
  const { request: payload } = current.data;
  const eventType = payload.type;

  logger.info('UpdateAsyncRequestRule invoked with event type:', eventType);

  let updatedState: RequestState;

  // Check if this is a failure event
  if (FAILURE_EVENT_TYPES.has(eventType)) {
    updatedState = handleFailureEvent(state, eventType, payload);
  } else {
    // Handle success events
    updatedState = handleSuccessEvent(state, eventType, payload);
  }

  logger.info(
    'State after processing UpdateAsyncRequest:',
    JSON.stringify(updatedState, null, 2)
  );

  return updatedState;
};
