import type {
  CommandTypeNames,
  InitiateAsyncRequest,
} from '@risksmart-app/events/src/types/command-types';
import {
  FormEvent,
  LinkedItemEvent,
  ObjectEvent,
  PermissionsEvent,
  UserGroupEvent,
} from '@risksmart-app/events/src/types/common';
import type { OrgUserEventTypeNames } from '@risksmart-app/events/src/types/orguser-events';
import type { RequestTypes } from '@risksmart-app/events/src/types/request-types';
import type { StateUpdaterInput } from 'src/event-store/db/processor';

import type { InputEventTypes } from '../aggregator/inputs';
import type { OutputEventTypes } from '../aggregator/outputs';
import {
  type RequestState,
  type RequestStateTask,
  RequestStateTaskStatus,
} from '../aggregator/types';

interface InitialRequestStateTask extends RequestStateTask {
  status: RequestStateTaskStatus.PENDING;
}

interface TaskDefinition {
  eventType: OrgUserEventTypeNames;
  objectType?: string;
}

const TASK_MAP: {
  [K in CommandTypeNames]: TaskDefinition[];
} = {
  CREATE_ACCEPTANCE: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'acceptance',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'acceptance',
    },
  ],
  CREATE_ACTION_UPDATE: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'action_update',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'action_update',
    },
  ],
  CREATE_ASSESSMENT: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'assessment',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'assessment',
    },
  ],
  DELETE_ASSESSMENT: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'assessment',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'assessment',
    },
  ],
  CREATE_CAUSE: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'cause',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'cause',
    },
  ],
  CREATE_CONSEQUENCE: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'consequence',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'consequence',
    },
  ],
  CREATE_APPETITE: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'appetite',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'appetite',
    },
  ],
  DELETE_ACCEPTANCES: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'acceptance',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'acceptance',
    },
  ],
  DELETE_APPETITES: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'appetite',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'appetite',
    },
  ],
  DELETE_CAUSES: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'cause',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'cause',
    },
  ],
  DELETE_CONSEQUENCES: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'consequence',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'consequence',
    },
  ],
  DELETE_ACTION_UPDATES: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'action_update',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'action_update',
    },
  ],
  CREATE_ACTION: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'action',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'action',
    },
  ],
  CREATE_CONTROL: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'control',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'control',
    },
  ],
  CREATE_CONTROL_GROUP: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'control_group',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'control_group',
    },
  ],
  CREATE_CONTROL_TEST_RESULT: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'test_result',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'test_result',
    },
  ],
  DELETE_CONTROL_GROUP: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'control_group',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'control_group',
    },
  ],
  DELETE_INDICATORS: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'indicator',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'indicator',
    },
  ],
  CREATE_INDICATOR_RESULT: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'indicator_result',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'indicator_result',
    },
  ],
  UPDATE_INDICATOR_RESULT: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'indicator_result',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'indicator_result',
    },
  ],
  CREATE_ISSUE: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'issue',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'issue',
    },
  ],
  CREATE_ISSUE_ASSESSMENT: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'issue_assessment',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'issue_assessment',
    },
  ],
  CREATE_ISSUE_UPDATE: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'issue_update',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'issue_update',
    },
  ],
  UPDATE_ISSUE: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'issue',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'issue',
    },
  ],
  DELETE_INDICATOR_RESULTS: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'indicator_result',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'indicator_result',
    },
  ],
  DELETE_ISSUES: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'issue',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'issue',
    },
  ],
  DELETE_ISSUE_UPDATES: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'issue_update',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'issue_update',
    },
  ],
  DELETE_TEST_RESULTS: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'test_result',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'test_result',
    },
  ],
  CREATE_OBLIGATION: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'obligation',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'obligation',
    },
  ],
  CREATE_OBLIGATION_IMPACT: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'obligation_impact',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'obligation_impact',
    },
  ],
  DELETE_OBLIGATION_IMPACTS: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'obligation_impact',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'obligation_impact',
    },
  ],
  DELETE_RISK: [
    {
      eventType: ObjectEvent.ObjectDeleted,
      objectType: 'risk',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'risk',
    },
  ],
  CREATE_RISK: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'risk',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'risk',
    },
  ],
  CREATE_RISK_ASSESSMENT_RESULT: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'risk_assessment_result',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'risk_assessment_result',
    },
  ],
  CREATE_FORM_FIELD: [
    {
      eventType: FormEvent.FormConfigured,
    },
  ],
  CREATE_LINKED_ITEM: [
    {
      eventType: LinkedItemEvent.LinkedItemCreated,
    },
  ],
  DELETE_FORM_FIELD: [
    {
      eventType: FormEvent.FormConfigured,
    },
  ],
  DELETE_LINKED_ITEM: [
    {
      eventType: LinkedItemEvent.LinkedItemDeleted,
    },
  ],
  UPDATE_FORM_FIELD: [
    {
      eventType: FormEvent.FormConfigured,
    },
  ],
  UPDATE_CAUSE: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'cause',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'cause',
    },
  ],
  UPDATE_CONSEQUENCE: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'consequence',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'consequence',
    },
  ],
  UPDATE_ACCEPTANCE: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'acceptance',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'acceptance',
    },
  ],
  UPDATE_APPETITE: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'appetite',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'appetite',
    },
  ],
  UPDATE_ASSESSMENT: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'assessment',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'assessment',
    },
  ],
  UPDATE_RISK: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'risk',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'risk',
    },
  ],
  UPDATE_INDICATOR: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'indicator',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'indicator',
    },
  ],
  UPDATE_TEST_RESULT: [
    {
      eventType: ObjectEvent.ObjectUpdated,
      objectType: 'test_result',
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'test_result',
    },
  ],
  CREATE_SSO_CONFIGURATION: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'sso_configuration',
    },
  ],
  CREATE_USER_GROUP: [
    {
      eventType: UserGroupEvent.UserGroupCreated,
    },
  ],
  DELETE_SSO_CONFIGURATION: [
    { eventType: ObjectEvent.ObjectDeleted, objectType: 'sso_configuration' },
  ],
};

/**
 * Generates a task ID from event type, optional object type, and optional object ID
 * Format: {eventType}:{objectType}:{objectId} or {eventType}:{objectType} or {eventType}
 */
const generateTaskId = (
  eventType: string,
  objectType?: string,
  objectId?: string
): string => {
  if (objectType && objectId) {
    return `${eventType}:${objectType}:${objectId}`;
  }

  return objectType ? `${eventType}:${objectType}` : eventType;
};

/**
 * Converts task definitions to initial task state
 * If objectIds are provided, creates a task for each objectId
 * Otherwise, creates a single task per definition (backward compatible)
 */
const createInitialTasks = (
  definitions: TaskDefinition[],
  objectIds?: string[]
): Record<string, InitialRequestStateTask> => {
  const tasks: Record<string, InitialRequestStateTask> = {};

  for (const def of definitions) {
    if (objectIds && objectIds.length > 0) {
      // Create a task for each objectId
      for (const objectId of objectIds) {
        const taskId = generateTaskId(def.eventType, def.objectType, objectId);
        tasks[taskId] = {
          status: RequestStateTaskStatus.PENDING,
          eventType: def.eventType,
          objectType: def.objectType,
          objectId,
        };
      }
    } else {
      // Backward compatible: single task without objectId
      const taskId = generateTaskId(def.eventType, def.objectType);
      tasks[taskId] = {
        status: RequestStateTaskStatus.PENDING,
        eventType: def.eventType,
        objectType: def.objectType,
      };
    }
  }

  return tasks;
};

export const initiateAsyncRequestRule = (
  input: StateUpdaterInput<
    RequestState,
    InputEventTypes,
    OutputEventTypes,
    InitiateAsyncRequest<RequestTypes>
  >
): RequestState => {
  const { state, current } = input;
  const { correlationId, tenant, orgKey, userId } = current.metadata;
  const { subType, request } = current.data;

  // Type guard to ensure subType is a valid InputType
  if (!(subType in TASK_MAP)) {
    throw new Error(
      `No task configuration exists for event with type ${subType}`
    );
  }

  // Extract objectIds from request if present (for batch operations)
  // Supports both 'Ids' array (batch) and 'Id' string (single, for backward compat)
  const objectIds = extractObjectIds(request);

  const taskDefinitions = TASK_MAP[subType];
  const tasks = createInitialTasks(taskDefinitions, objectIds);

  state.correlationId = correlationId;
  state.tenant = tenant;
  state.orgKey = orgKey;
  state.userId = userId;
  state.tasks = tasks;

  return state;
};

/**
 * Extracts object IDs from a request object
 * Supports both batch (Ids array) and single (Id string) formats
 */
function extractObjectIds(request: RequestTypes): string[] | undefined {
  if ('Ids' in request && Array.isArray(request.Ids)) {
    return request.Ids;
  }

  return undefined;
}
