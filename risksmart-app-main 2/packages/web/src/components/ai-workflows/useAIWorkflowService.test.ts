import { renderHook } from '@testing-library/react';
import type {
  AISuggestedRiskControl,
  AISuggestedRiskControlsResult,
} from 'src/pages/controls/tab/suggested-risk-controls/useAISuggestControls';
import {
  beforeEach as bfe,
  describe,
  expect,
  test as baseTest,
  vi,
} from 'vitest';

import { JobWatchError } from '@/components/ai-workflows/jobWatchError';
import { useAIWorkflowService } from '@/components/ai-workflows/useAIWorkflowService';
import type { AIWorkflowJobResult } from '@/components/ai-workflows/useAIWorkflowService.types';
import type { AIWorkflowJobResultWithStatus } from '@/components/ai-workflows/useWorkflowRequest';

const invokeWorkflowFunction = vi.fn();
const watchJobFunction = vi.fn();

vi.mock('@/components/ai-workflows/useWorkflowRequest', () => ({
  useWorkflowRequest: vi.fn(() => ({
    invokeWorkflow: invokeWorkflowFunction,
  })),
}));

vi.mock('@/components/ai-workflows/useJobMonitor', () => ({
  useJobMonitor: vi.fn(() => ({
    watchJob: watchJobFunction,
  })),
}));

vi.mock('@/utils/errorUtils', () => ({
  handleError: vi.fn(),
}));

interface ServiceFixture {
  service: {
    current: {
      runWorkflow: (
        workflowBodyBuilder: () => unknown
      ) => Promise<AIWorkflowJobResult<AISuggestedRiskControlsResult>>;
    };
  };
}

const createJobResult = (
  // no-dd-sa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vals: any | null = null
): AIWorkflowJobResultWithStatus<AISuggestedRiskControl> => {
  return {
    jobId: vals?.jobId ?? 'j123',
    result: vals?.result ?? null,
    location: vals?.location ?? '/a/url',
    streamLocation: vals?.streamLocation ?? '/a/url/stream',
    error: vals?.error ?? null,
    runId: vals?.runId ?? 'r123',
    status: vals?.status ?? 'queued',
  };
};

const it = baseTest.extend<ServiceFixture>({
  //no-dd-sa
  /* eslint-disable-next-line */
  service: async ({}, use) => {
    const { result } = renderHook(() =>
      useAIWorkflowService<AISuggestedRiskControlsResult>('')
    );
    /* eslint-disable-next-line */
    await use(result);
  },
});

const beforeEach = bfe<ServiceFixture>;

describe('useAIWorkflowService', () => {
  let resultPromise: Promise<
    AIWorkflowJobResult<AISuggestedRiskControlsResult>
  > | null = null;
  beforeEach(() => {
    vi.resetAllMocks();
    resultPromise = null;
  });

  describe('when invoking the workflow and it fails straight away', () => {
    beforeEach(async ({ service }) => {
      invokeWorkflowFunction.mockReturnValue(
        createJobResult({ status: 'failed', error: 'Something went wrong' })
      );

      resultPromise = service.current.runWorkflow(vi.fn());
    });

    it('should reject the promise', async () => {
      return resultPromise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe(
            'Encountered an error from the workflow invocation. Error: Something went wrong'
          );
        });
    });
  });

  describe('when invoking the workflow and it completes straight away', () => {
    const workflowResult = createJobResult({ status: 'completed' });

    beforeEach(async ({ service }) => {
      invokeWorkflowFunction.mockReturnValue(workflowResult);

      resultPromise = service.current.runWorkflow(vi.fn());
    });

    it('should resolve the promise with the results', async () => {
      return resultPromise!
        .then((result) => {
          expect(result).toBe(workflowResult);
        })
        .catch(() => {
          expect.fail('Promise rejected');
        });
    });
  });

  describe('when watching a job and it completes', () => {
    const workflowInvokeResult = createJobResult({ status: 'queued' });

    const watchResult = createJobResult({ status: 'queued', result: {} });

    beforeEach(async ({ service }) => {
      invokeWorkflowFunction.mockReturnValue(workflowInvokeResult);
      watchJobFunction.mockReturnValue(Promise.resolve(watchResult));

      resultPromise = service.current.runWorkflow(vi.fn());
    });

    it('should resolve the promise with the results', async () => {
      return resultPromise!
        .then((result) => {
          expect(result).toBe(watchResult);
        })
        .catch(() => {
          expect.fail('Promise rejected');
        });
    });
  });

  describe('when watching a job and it encounters an error', () => {
    const workflowInvokeResult = createJobResult({ status: 'queued' });

    beforeEach(async ({ service }) => {
      invokeWorkflowFunction.mockReturnValue(workflowInvokeResult);
      watchJobFunction.mockImplementation(() => {
        throw new JobWatchError('error', 'Something has gone wrong');
      });

      resultPromise = service.current.runWorkflow(vi.fn());
    });

    it('should reject the promise', async () => {
      return resultPromise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe('Something has gone wrong');
        });
    });
  });

  describe('when watching a job and it times out', () => {
    const workflowInvokeResult = createJobResult({ status: 'queued' });

    beforeEach(async ({ service }) => {
      invokeWorkflowFunction.mockReturnValue(workflowInvokeResult);
      watchJobFunction.mockImplementation(() => {
        throw new JobWatchError('timed-out', 'Took too long to update');
      });

      resultPromise = service.current.runWorkflow(vi.fn());
    });

    it('should reject the promise', async () => {
      return resultPromise!
        .then(() => {
          expect.fail('Error was not thrown');
        })
        .catch((err) => {
          expect(err.message).toBe('Took too long to update');
        });
    });
  });
});
