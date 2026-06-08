import { AsyncRequestEvent } from '@risksmart-app/events/src/types/common';

import type { StateUpdater } from '../db/processor';
import { Processor } from '../db/processor';
import { initiateAsyncRequestRule } from '../rules/initiate-async-request.rule';
import { updateAsyncRequestRule } from '../rules/update-async-request.rule';
import type { InputEventTypes } from './inputs';
import type { OutputEventTypes } from './outputs';
import type { RequestState } from './types';

const initialRequestState = (): RequestState => ({
  correlationId: '',
  tenant: '',
  orgKey: '',
  userId: '',
  tasks: {},
});

// Rules map for event processing
// Note: Using `any` for the fourth generic parameter is necessary here because:
// - Each rule function is typed for its specific event type (InitiateAsyncRequest | UpdateAsyncRequest)
// - The Processor requires a uniform StateUpdater type with InputEventTypes as the constraint
// - TypeScript cannot express this polymorphic relationship without wrapper functions
// - The runtime safety is ensured by the processor's event routing by type
const rules = new Map<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  StateUpdater<RequestState, InputEventTypes, OutputEventTypes, any>
>();

rules.set(AsyncRequestEvent.InitiateAsyncRequest, initiateAsyncRequestRule);
rules.set(AsyncRequestEvent.UpdateAsyncRequest, updateAsyncRequestRule);

export const processor = new Processor<
  RequestState,
  InputEventTypes,
  OutputEventTypes
>(rules, initialRequestState);
