import {
  AsyncRequestEvent,
  type EventType,
  FormEvent,
  LinkedItemEvent,
  ObjectEvent,
  PermissionsEvent,
  UserGroupEvent,
} from '@risksmart-app/events/src/types/common';
import * as Sentry from '@sentry/aws-serverless';
import { monoLambdaEventBridgeHandler } from 'src/utils/event-bridge-handler';
import { getLogger } from 'src/utils/logger';

import { processInitiateAsyncRequestEvent } from './initiate-async-request.processor';
import type { EventProcessor } from './types';
import { processUpdateAsyncRequestEvent } from './update-async-request.processor';
const logger = getLogger();

type RoutedEventTypeNames =
  | AsyncRequestEvent.InitiateAsyncRequest
  | FormEvent.FormConfigured
  | FormEvent.FormConfigurationFailed
  | LinkedItemEvent.LinkedItemCreated
  | LinkedItemEvent.LinkedItemCreationFailed
  | LinkedItemEvent.LinkedItemDeleted
  | LinkedItemEvent.LinkedItemDeletionFailed
  | ObjectEvent.ObjectCreated
  | ObjectEvent.ObjectCreationFailed
  | ObjectEvent.ObjectDeleted
  | ObjectEvent.ObjectDeletionFailed
  | ObjectEvent.ObjectUpdated
  | ObjectEvent.ObjectUpdateFailed
  | PermissionsEvent.PermissionsUpdated
  | PermissionsEvent.PermissionsUpdateFailed
  | UserGroupEvent.UserGroupCreated
  | UserGroupEvent.UserGroupCreationFailed;

const createEventProcessorMappings = (
  eventTypes: EventType[],
  processor: EventProcessor
) =>
  Object.fromEntries(
    eventTypes.map((eventType) => [eventType, { name: eventType, processor }])
  );

const EVENT_ROUTING = {
  ...createEventProcessorMappings(
    [AsyncRequestEvent.InitiateAsyncRequest],
    processInitiateAsyncRequestEvent
  ),

  ...createEventProcessorMappings(
    [
      FormEvent.FormConfigured,
      FormEvent.FormConfigurationFailed,
      LinkedItemEvent.LinkedItemCreated,
      LinkedItemEvent.LinkedItemCreationFailed,
      LinkedItemEvent.LinkedItemDeleted,
      LinkedItemEvent.LinkedItemDeletionFailed,
      ObjectEvent.ObjectCreated,
      ObjectEvent.ObjectCreationFailed,
      ObjectEvent.ObjectDeleted,
      ObjectEvent.ObjectDeletionFailed,
      ObjectEvent.ObjectUpdated,
      ObjectEvent.ObjectUpdateFailed,
      PermissionsEvent.PermissionsUpdated,
      PermissionsEvent.PermissionsUpdateFailed,
      UserGroupEvent.UserGroupCreated,
      UserGroupEvent.UserGroupCreationFailed,
    ],
    processUpdateAsyncRequestEvent
  ),
};

export const handler = monoLambdaEventBridgeHandler<
  RoutedEventTypeNames,
  unknown,
  void
>(async (event) => {
  logger.info('Event processor triggered', {
    detailType: event['detail-type'],
    source: event.source,
  });

  const detailType = event['detail-type'];
  const eventProcessor = EVENT_ROUTING[detailType];

  if (!eventProcessor) {
    logger.info('No processor found for event type', { detailType });

    return;
  }

  const errors: Error[] = [];

  await Sentry.withScope(async (scope) => {
    await Sentry.startSpan({ name: eventProcessor.name }, async () => {
      scope.setTag('eventProcessor', eventProcessor.name);
      scope.setTag('detailType', detailType);
      scope.setTransactionName(eventProcessor.name);

      try {
        logger.appendKeys({
          eventProcessor: eventProcessor.name,
          detailType,
        });
        logger.info('Processing event');

        await eventProcessor.processor(event);

        logger.info('Event processed successfully');
      } catch (error) {
        logger.error('Error processing event', error as Error);
        scope.captureException(error);
        errors.push(error as Error);
      } finally {
        logger.resetKeys();
      }
    });
  });

  if (errors.length > 0) {
    logger.error('Event processing completed with errors', { errors });
    throw new AggregateError(errors);
  } else {
    logger.info('Event processing completed successfully');
  }
});
