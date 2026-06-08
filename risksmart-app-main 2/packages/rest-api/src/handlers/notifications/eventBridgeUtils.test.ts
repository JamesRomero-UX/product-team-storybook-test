import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import { vi } from 'vitest';

import { sendToEventBridgeInBatches } from './eventBridgeUtils';

const eventBridgeInstance = {
  send: vi.fn(),
};

vi.mock('@aws-sdk/client-eventbridge', () => {
  return {
    EventBridgeClient: vi.fn(() => eventBridgeInstance),
    PutEventsCommand: vi.fn(),
  };
});

describe('eventBridgeUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends entries to event bridge', async () => {
    const entries: PutEventsRequestEntry[] = [];
    for (let i = 0; i < 10; i++) {
      entries.push({
        Detail: 'Test',
      });
    }
    await sendToEventBridgeInBatches(entries);
    expect(eventBridgeInstance.send).toBeCalledTimes(1);
  });

  it('sends a maximum of 10 entries in a batch', async () => {
    const entries: PutEventsRequestEntry[] = [];
    for (let i = 0; i < 11; i++) {
      entries.push({
        Detail: 'Test',
      });
    }
    await sendToEventBridgeInBatches(entries);
    expect(eventBridgeInstance.send).toBeCalledTimes(2);
  });
});
