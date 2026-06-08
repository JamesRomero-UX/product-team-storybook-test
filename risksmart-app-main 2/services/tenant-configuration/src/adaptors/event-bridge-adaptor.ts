import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import type { TenantEvent } from '@risksmart-app/events/src/types/tenant-events';

import { getLogger } from '../logger';
const logger = getLogger();

export const createAdaptor = (options: {
  eventBusName: string;
  source: string;
  detailType: string;
}) => {
  const client = new EventBridgeClient({});

  const sendBatch = async (batch: PutEventsRequestEntry[]) => {
    const command = new PutEventsCommand({
      Entries: batch,
    });

    const result = await client.send(command);

    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
      logger.error('Some events failed to send to EventBridge', { result });
      throw new Error('Failed to send some events to EventBridge');
    }
  };

  const batchMessages = (
    entries: PutEventsRequestEntry[]
  ): PutEventsRequestEntry[][] => {
    const batchSize = 10;
    const batches: PutEventsRequestEntry[][] = [];
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize));
    }

    return batches;
  };

  const dispatchEvents = async (events: TenantEvent<unknown>[]) => {
    const entries: PutEventsRequestEntry[] = events.map((event) => ({
      EventBusName: options.eventBusName,
      Source: options.source,
      DetailType: options.detailType,
      Detail: JSON.stringify(event),
    }));

    const batches = batchMessages(entries);

    for (const batch of batches) {
      await sendBatch(batch);
    }
  };

  return { dispatchEvents };
};
