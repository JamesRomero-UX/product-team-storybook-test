import type {
  InitiateAsyncRequest,
  UpdateAsyncRequest,
} from '@risksmart-app/events/src/types/command-types';
import type {
  OrgUserEventMetadata,
  OrgUserEventTypes,
} from '@risksmart-app/events/src/types/orguser-events';
import type { RequestTypes } from '@risksmart-app/events/src/types/request-types';

export type InputEventTypes =
  | InitiateAsyncRequest<RequestTypes>
  | UpdateAsyncRequest<OrgUserEventTypes, OrgUserEventMetadata>;
