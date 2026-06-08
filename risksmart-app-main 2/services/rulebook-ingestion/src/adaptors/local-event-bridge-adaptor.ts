import type { ExternalObligationsUpdatedEvent } from '@risksmart-app/events/src/types/org-events';

/**
 * Drop-in replacement for createEventBridgeAdaptor that POSTs events
 * to the local event router instead of AWS EventBridge.
 */
export const createLocalEventBridgeAdaptor = (options: {
  eventRouterUrl: string;
  source: string;
}) => {
  const emitRulesUpdatedMessage = async (
    event: ExternalObligationsUpdatedEvent
  ) => {
    const body = JSON.stringify({
      Entries: [
        {
          Source: options.source,
          DetailType: event.type,
          Detail: JSON.stringify(event),
        },
      ],
    });

    const response = await fetch(options.eventRouterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-amz-target': 'AWSEvents.PutEvents',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Local event router returned ${response.status}: ${text}`
      );
    }
  };

  return { emitRulesUpdatedMessage };
};
