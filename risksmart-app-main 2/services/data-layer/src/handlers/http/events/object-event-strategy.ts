import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { createObjectEventEmitters } from 'src/events/producers/data-event-producers';

import type {
  OperationType,
  ValidatedLambdaContext,
} from '../utils/mutation-middleware';
import type { EventData, EventStrategy } from './event-strategies';

/**
 * Strategy data type for ObjectEventStrategy
 */
export interface ObjectStrategyData {
  objectIds: string[];
}

/**
 * Strategy for object CRUD events (EntityCreated, ObjectUpdated, EntityDeleted)
 */
export class ObjectEventStrategy implements EventStrategy<ObjectStrategyData> {
  private emitters: ReturnType<typeof createObjectEventEmitters>;

  constructor(
    private objectType: string,
    private operationType: OperationType,
    eventBridge: EventBridgeClient,
    logger: Logger
  ) {
    this.emitters = createObjectEventEmitters(eventBridge, logger);
  }

  validateContext(
    context: ValidatedLambdaContext<unknown, ObjectStrategyData>
  ): void {
    if (
      !context.strategyData?.objectIds ||
      context.strategyData.objectIds.length === 0
    ) {
      throw new Error('Missing object IDs in context for object event');
    }
  }

  extractEventData(
    context: ValidatedLambdaContext<unknown, ObjectStrategyData>
  ): EventData[] {
    const objectIds = context.strategyData?.objectIds || [];

    return objectIds.map((objectId) => ({
      objectType: this.objectType,
      objectId: objectId,
    }));
  }

  async emitSuccessEvent(
    metadata: OrgUserEventMetadata,
    data: EventData
  ): Promise<void> {
    const { objectType, objectId } = data;
    if (!objectType || !objectId) {
      throw new Error('Missing objectType or objectId in event data');
    }

    switch (this.operationType) {
      case 'create':
        return this.emitters.emitObjectCreatedEvent(metadata, {
          objectType: objectType,
          objectId: objectId,
        });
      case 'update':
        return this.emitters.emitObjectUpdatedEvent(metadata, {
          objectType: objectType,
          objectId: objectId,
        });
      case 'delete':
        return this.emitters.emitObjectDeletedEvent(metadata, {
          objectType: objectType,
          objectId: objectId,
        });
    }
  }

  async emitFailureEvent(
    metadata: OrgUserEventMetadata,
    data: EventData,
    error: string
  ): Promise<void> {
    const { objectType, objectId } = data;
    if (!objectType) {
      throw new Error('Missing objectType in event data');
    }

    switch (this.operationType) {
      case 'create':
        // Creation failures don't include objectId
        return this.emitters.emitObjectCreationFailedEvent(metadata, {
          objectType: objectType,
          error,
        });
      case 'update':
        if (!objectId) {
          throw new Error('Missing objectId for update failure event');
        }

        return this.emitters.emitObjectUpdateFailedEvent(metadata, {
          objectType: objectType,
          objectId: objectId,
          error,
        });
      case 'delete':
        if (!objectId) {
          throw new Error('Missing objectId for delete failure event');
        }

        return this.emitters.emitObjectDeletionFailedEvent(metadata, {
          objectType: objectType,
          objectId: objectId,
          error,
        });
    }
  }
}
