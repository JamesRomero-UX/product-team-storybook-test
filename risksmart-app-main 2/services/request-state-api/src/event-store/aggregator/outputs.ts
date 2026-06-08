import type { EventType } from '@risksmart-app/events/src/types/common';
import type { OrgUserEvent } from '@risksmart-app/events/src/types/orguser-events';
import type { RequestTypes } from '@risksmart-app/events/src/types/request-types';

export type OutputEventTypes = OrgUserEvent<RequestTypes> & { type: EventType };
