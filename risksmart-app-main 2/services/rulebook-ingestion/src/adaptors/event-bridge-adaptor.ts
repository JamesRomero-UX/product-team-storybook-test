import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import type { ExternalObligationsUpdatedEvent } from '@risksmart-app/events/src/types/org-events';

export const createEventBridgeAdaptor = (options: {
  eventBusName: string;
  source: string;
}) => {
  const client = new EventBridgeClient({});

  const emitRulesUpdatedMessage = async (
    event: ExternalObligationsUpdatedEvent
  ) => {
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: options.eventBusName,
          Source: options.source,
          DetailType: event.type,
          Detail: JSON.stringify(event),
        },
      ],
    });

    await client.send(command);
  };

  return { emitRulesUpdatedMessage };
};
