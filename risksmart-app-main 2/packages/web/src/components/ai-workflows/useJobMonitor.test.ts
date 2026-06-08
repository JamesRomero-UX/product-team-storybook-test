import { renderHook } from '@testing-library/react';
import type { AISuggestedRiskControlsResult } from 'src/pages/controls/tab/suggested-risk-controls/useAISuggestControls';
import {
  beforeEach as bfe,
  describe,
  expect,
  test as baseTest,
  vi,
} from 'vitest';

import { useJobMonitor } from '@/components/ai-workflows/useJobMonitor';
import type { AIWorkflowJobResultWithStatus } from '@/components/ai-workflows/useWorkflowRequest';

interface FakeMessageEvent {
  origin: string;
  data: string;
}

const eventListeners: [string, (ev: FakeMessageEvent) => void][] = [];
const closeEventSourceFunction = vi.fn();
const onErrorHandler = vi.fn();

const origin = 'http://localhost:3000';

const getEventHandlers = (): [
  updateHandler: (ev: FakeMessageEvent) => void,
  endHandler: (ev: FakeMessageEvent) => void,
] => {
  const updateHandler = eventListeners.find(
    (listener) => listener[0] === 'update'
  );
  const endHandler = eventListeners.find((listener) => listener[0] === 'end');

  return [updateHandler![1], endHandler![1]];
};

const createMessageEvent = (
  // no-dd-sa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vals: any | null = null
): FakeMessageEvent => {
  let data: string = JSON.stringify(null);

  if (vals) {
    data = JSON.stringify({
      jobId: vals?.jobId ?? 'j123',
      result: vals?.result ?? null,
      location: vals?.location ?? '/a/url',
      streamLocation: vals?.streamLocation ?? '/a/url/stream',
      error: vals?.error ?? null,
      runId: vals?.runId ?? 'r123',
      status: vals?.status ?? 'queued',
    });
  }

  return {
    origin,
    data,
  };
};

vi.mock('eventsource', () => ({
  EventSource: vi.fn(() => ({
    addEventListener: (
      type: string,
      handler: (ev: FakeMessageEvent) => void
    ) => {
      eventListeners.push([type, handler]);
    },
    close: closeEventSourceFunction,
    readyState: 0,
    onError: onErrorHandler,
  })),
}));

vi.mock('@/utils/useAIWorkflowFetch', () => ({
  useAIWorkflowFetch: vi.fn(() => ({
    authedAIWorkflowFetch: vi.fn(),
  })),
}));

interface MonitorFixture {
  monitor: {
    current: {
      watchJob: (
        jobStreamUrl: string
      ) => Promise<
        AIWorkflowJobResultWithStatus<AISuggestedRiskControlsResult>
      >;
    };
  };
}

const it = baseTest.extend<MonitorFixture>({
  //no-dd-sa
  /* eslint-disable-next-line */
  monitor: async ({}, use) => {
    const { result } = renderHook(() =>
      useJobMonitor<AISuggestedRiskControlsResult>(20)
    );

    /* eslint-disable-next-line */
    await use(result);
  },
});

const beforeEach = bfe<MonitorFixture>;

describe('useJobMonitor', () => {
  let promise: Promise<
    AIWorkflowJobResultWithStatus<AISuggestedRiskControlsResult>
  > | null = null;

  beforeEach(() => {
    vi.resetAllMocks();
    eventListeners.length = 0;
    promise = null;
  });

  describe('when an UPDATE and END are received for a completed job', () => {
    let result: AIWorkflowJobResultWithStatus<AISuggestedRiskControlsResult> | null =
      null;
    beforeEach(async ({ monitor }) => {
      promise = monitor.current.watchJob('/a/url');

      const [updateHandler, endHandler] = getEventHandlers();

      updateHandler(createMessageEvent({ status: 'completed' }));
      endHandler(createMessageEvent());

      result = await promise;
    });

    it('should return the result', () => {
      expect(result).not.toBeNull();
    });
  });

  describe('when an UPDATE is received but the data cannot be parsed', () => {
    beforeEach(async ({ monitor }) => {
      promise = monitor.current.watchJob('/a/url');

      const [updateHandler] = getEventHandlers();

      updateHandler({
        origin,
        data: 'cannot parse this',
      });
    });

    it('should throw an error indicating it was an error', async () => {
      return promise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe('Job monitoring has encountered an error');
          expect(err.failureType).toBe('error');
        });
    });

    it('should close the event source', async () => {
      return promise!.catch(() => {
        expect(closeEventSourceFunction).toHaveBeenCalled();
      });
    });
  });

  describe('when an UPDATE and END are received for a failed job', () => {
    beforeEach(async ({ monitor }) => {
      promise = monitor.current.watchJob('/a/url');

      const [updateHandler, endHandler] = getEventHandlers();

      updateHandler(createMessageEvent({ status: 'failed' }));
      endHandler(createMessageEvent());
    });

    it('should throw an error indicating it was an error', async () => {
      return promise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe('Received a failure message');
          expect(err.failureType).toBe('error');
        });
    });

    it('should close the event source', async () => {
      return promise!.catch(() => {
        expect(closeEventSourceFunction).toHaveBeenCalled();
      });
    });
  });

  describe.each([
    {
      status: 'processing',
    },
    {
      status: 'queued',
    },
  ])('when an END is received but the job is $status', ({ status }) => {
    beforeEach(async ({ monitor }) => {
      promise = monitor.current.watchJob('/a/url');

      const [updateHandler, endHandler] = getEventHandlers();

      updateHandler(createMessageEvent({ status }));
      endHandler(createMessageEvent());
    });

    it('should throw an error indicating it was an error', async () => {
      return promise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe(
            'Received end event but not received failure or completed update'
          );
          expect(err.failureType).toBe('error');
        });
    });

    it('should close the event source', async () => {
      return promise!.catch(() => {
        expect(closeEventSourceFunction).toHaveBeenCalled();
      });
    });
  });

  describe('when an END is received but no UPDATE was received', () => {
    beforeEach(async ({ monitor }) => {
      promise = monitor.current.watchJob('/a/url');

      const [_, endHandler] = getEventHandlers();

      endHandler(createMessageEvent());
    });

    it('should throw an error indicating it was an error', async () => {
      return promise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe(
            'End received but no data has been provided'
          );
          expect(err.failureType).toBe('error');
        });
    });

    it('should close the event source', async () => {
      return promise!.catch(() => {
        expect(closeEventSourceFunction).toHaveBeenCalled();
      });
    });
  });

  describe('when the job times out', () => {
    beforeEach(async ({ monitor }) => {
      promise = monitor.current.watchJob('/a/url');
    });

    it('should throw an error indicating it was a timeout', async () => {
      return promise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe('Job monitoring has timed out');
          expect(err.failureType).toBe('timed-out');
        });
    });

    it('should close the event source', async () => {
      return promise!.catch(() => {
        expect(closeEventSourceFunction).toHaveBeenCalled();
      });
    });
  });

  // Unable to test the onerror handler
});
