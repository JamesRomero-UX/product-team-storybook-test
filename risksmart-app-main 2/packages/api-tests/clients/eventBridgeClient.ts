import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

export const sendToEventBridge = async (entries: PutEventsRequestEntry[]) => {
  const ebClient = new EventBridgeClient({ region: 'eu-west-2' });
  const EventBusName = `${process.env.STAGE}-risksmart-app-SharedEventBus`;
  console.log('Sending events to ', EventBusName);
  const result = await ebClient.send(
    new PutEventsCommand({
      Entries: entries.map((e) => ({
        ...e,
        EventBusName,
        Source: 'integration-tests',
      })),
    })
  );
  if (result.FailedEntryCount && result.FailedEntryCount > 0) {
    throw new Error('Failed event bridge send');
  }
};
