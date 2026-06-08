import type { OrgUserEventTypeNames } from '@risksmart-app/events/src/types/orguser-events';

import type { InputEventTypes } from './inputs';

export interface DomainEvent {
  eventName: string;
  event: InputEventTypes;
}

export enum RequestStateTaskStatus {
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export interface RequestStateTask {
  status: RequestStateTaskStatus;
  eventType: OrgUserEventTypeNames;
  objectType?: string; // The object type filter (e.g., 'action_update')
  objectId?: string; // The actual object ID once known
}

export interface RequestState {
  correlationId: string;
  tenant: string;
  orgKey?: string;
  userId?: string;
  tasks: Record<string, RequestStateTask>;
  response?: string;
  error?: string;
}
