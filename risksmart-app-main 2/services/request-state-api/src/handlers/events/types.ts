import type { EventBridgeEvent } from 'aws-lambda';

// Generic event processor function type
// Uses 'any' as default to allow processors with different specific event types to be compatible
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- required for compatibility between processors with different event detail types
export type EventProcessor<T = any> = (
  event: EventBridgeEvent<string, T>
) => Promise<void>;
