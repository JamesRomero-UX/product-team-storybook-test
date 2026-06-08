import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';

import type {
  OperationType,
  ValidatedLambdaContext,
} from '../utils/mutation-middleware';

/**
 * Event data that can be extracted from the handler context
 */
export interface EventData {
  // For object events
  objectType?: string;
  objectId?: string;
  // For form events
  parentType?: string;
  fieldId?: string;
  operation?: OperationType;
  // Generic key-value pairs for custom events
  [key: string]: unknown;
}

/**
 * Strategy interface for emitting events
 * Each event type (object, form, custom) implements this strategy
 * @template TStrategyData - The type of data this strategy expects in context.strategyData
 */
export interface EventStrategy<TStrategyData = unknown> {
  /**
   * Validates that the context has the required data for this event type
   * @throws Error if required data is missing
   */
  validateContext(
    context: ValidatedLambdaContext<unknown, TStrategyData>
  ): void;

  /**
   * Extracts event data from the handler context
   * Returns array since handlers can operate on multiple items (batch operations)
   */
  extractEventData(
    context: ValidatedLambdaContext<unknown, TStrategyData>
  ): EventData[];

  /**
   * Emits success event(s) for the operation
   */
  emitSuccessEvent(
    metadata: OrgUserEventMetadata,
    data: EventData
  ): Promise<void>;

  /**
   * Emits failure event(s) for the operation
   */
  emitFailureEvent(
    metadata: OrgUserEventMetadata,
    data: EventData,
    error: string
  ): Promise<void>;
}
