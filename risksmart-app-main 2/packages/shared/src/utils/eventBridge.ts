import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

export interface Meta {
  tenant: string;
}

export interface EventDetail<M extends Meta, D> {
  meta: M;
  data: D;
}

export enum RisksmartDetailType {
  ActionDue = 'ActionDue',
  ActionOverdue = 'ActionOverdue',
  DataChanged = 'DataChanged',
  IssueDue = 'IssueDue',
  IssueOverdue = 'IssueOverdue',
  PolicyAttestationReminder = 'PolicyAttestationReminder',
  PolicyDocumentVersionReviewDue = 'PolicyDocumentVersionReviewDue',
  PolicyDocumentVersionReviewUpcoming = 'PolicyDocumentVersionReviewUpcoming',
  ScheduleDue = 'ScheduleDue',
  ScheduleOverdue = 'ScheduleOverdue',
  ThirdPartyPasswordReset = 'ThirdPartyPasswordReset',
}

export function getSizeInBytes(entry: PutEventsRequestEntry): number {
  let size = 0;
  if (entry.Time !== undefined) {
    size += 14;
  }
  if (entry.Source) {
    size += Buffer.byteLength(entry.Source);
  }
  if (entry.DetailType) {
    size += Buffer.byteLength(entry.DetailType);
  }
  if (entry.Detail) {
    size += Buffer.byteLength(entry.Detail);
  }
  if (entry.Resources) {
    for (const resource of entry.Resources) {
      if (resource) {
        size += Buffer.byteLength(resource);
      }
    }
  }

  return size;
}

/**
 * Creates a logger adapter that can be used with sendToEventBridgeInBatches
 * for packages that want to use their own logger implementation
 */
export const createLoggerAdapter = (logger: {
  info: (message: string, meta?: Record<string, unknown>) => void;
}): { info: (message: string, meta?: Record<string, unknown>) => void } => {
  return {
    info: (message: string, meta?: Record<string, unknown>) => {
      if (meta) {
        logger.info(message, meta);
      } else {
        logger.info(message);
      }
    },
  };
};

export const sendToEventBridgeInBatches = async (
  entries: PutEventsRequestEntry[],
  logger?: {
    info: (message: string, meta?: Record<string, unknown>) => void;
  } | null
) => {
  // Default logger implementation that falls back to console.warn
  const defaultLogger = {
    info: (message: string, meta?: Record<string, unknown>) => {
      if (meta) {
        // eslint-disable-next-line no-console
        console.warn(message, meta);
      } else {
        // eslint-disable-next-line no-console
        console.warn(message);
      }
    },
  };

  const loggerToUse = logger ?? defaultLogger;

  if (entries.length === 0) {
    loggerToUse.info('No events to send to event bus');

    return;
  }
  loggerToUse.info('Sending events to event bus', {
    eventCount: entries.length,
  });

  const ebClient = new EventBridgeClient({});
  const maxPayloadSizeBytes = 1024 * 256;
  const maxEntries = 10;
  let unsentEntries: PutEventsRequestEntry[] = [];
  let size = 0;

  const sendAndReset = async () => {
    await ebClient.send(new PutEventsCommand({ Entries: unsentEntries }));
    unsentEntries = [];
    size = 0;
  };

  for (const entry of entries) {
    size += getSizeInBytes(entry);
    if (size >= maxPayloadSizeBytes || unsentEntries.length === maxEntries) {
      await sendAndReset();
    }
    unsentEntries.push(entry);
  }
  if (unsentEntries.length > 0) {
    await sendAndReset();
  }
};
