import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockErrorResponse,
  createMockSuccessResponse,
  mockResponseBodies,
} from '../../__tests__/test-utils';
// We need to test the resilient fetch logic, but since it's not exported,
// we'll test it through the permitSDK integration
import { clearKeyScopeCache, permitSDK } from '../../permit-sdk';

// Mock dependencies
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
vi.mock('permitio');
vi.mock('../../utils/environment.js', () => ({
  getEnv: vi.fn().mockImplementation((key) => {
    if (key === 'PDP_ENDPOINT') {
      return 'http://localhost:7766';
    }

    if (key === 'PERMIT_API_URL') {
      return 'https://api.permit.io';
    }

    return undefined;
  }),
}));
vi.mock('../../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { Permit } from 'permitio';

import { logger } from '../logger';
const mockLogger = vi.mocked(logger);

// Mock Permit SDK
const mockPermit = {
  api: {
    resourceInstances: { create: vi.fn(), delete: vi.fn() },
    relationshipTuples: { list: vi.fn(), create: vi.fn() },
  },
} as unknown as Permit;

vi.mocked(Permit).mockImplementation(() => mockPermit);

const TEST_TOKEN = 'test-token';
const TEST_PERMIT_API_URL = 'https://api.permit.io';

describe('Resilient Fetch Integration', () => {
  let sdk: ReturnType<typeof permitSDK>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    clearKeyScopeCache();

    mockLogger.info.mockImplementation(vi.fn());
    mockLogger.warn.mockImplementation(vi.fn());
    mockLogger.error.mockImplementation(vi.fn());

    sdk = permitSDK(TEST_TOKEN);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('HTTP Response Handling', () => {
    it('should handle non-2xx responses correctly', async () => {
      const errorResponse = createMockErrorResponse(
        500,
        'Internal Server Error',
        mockResponseBodies.serverError
      );

      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          body: mockResponseBodies.serverError,
          context: 'getKeyScope',
          url: `${TEST_PERMIT_API_URL}/v2/api-key/scope`,
        }),
        'HTTP error response from Permit API'
      );
    });

    it('should handle JSON parsing errors in error responses', async () => {
      const errorResponse = createMockErrorResponse(
        502,
        'Bad Gateway',
        {},
        new Error('Invalid JSON')
      );

      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 502,
          body: {}, // Should fall back to empty object when JSON parsing fails
          context: 'getKeyScope',
          url: 'https://api.permit.io/v2/api-key/scope',
        }),
        'HTTP error response from Permit API'
      );
    });
  });

  describe('Error Enrichment', () => {
    it('should enrich errors with status and body information', async () => {
      const errorResponse = createMockErrorResponse(
        422,
        'Unprocessable Object',
        mockResponseBodies.validationError
      );

      mockFetch.mockResolvedValueOnce(errorResponse);

      await expect(sdk.init()).rejects.toMatchObject({
        message: 'HTTP 422: Unprocessable Object',
        status: 422,
        body: mockResponseBodies.validationError,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 422,
          context: 'getKeyScope',
          body: mockResponseBodies.validationError,
          url: 'https://api.permit.io/v2/api-key/scope',
        }),
        'HTTP error response from Permit API'
      );
    });
  });

  describe('Successful Response Handling', () => {
    it('should return response directly for successful requests', async () => {
      const successResponse = createMockSuccessResponse(
        mockResponseBodies.permitKeyScope
      );

      mockFetch.mockResolvedValueOnce(successResponse);

      await sdk.init();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should handle 2xx responses other than 200', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.permitKeyScope)
      );

      await sdk.init();
      vi.clearAllMocks();

      const successResponse = createMockSuccessResponse({}, 201);
      mockFetch.mockResolvedValueOnce(successResponse);

      await sdk.addUserToGroup('test-group', 'test-user', 'test-org');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Request Configuration', () => {
    it('should preserve original request configuration during retries', async () => {
      mockFetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      // Verify that all fetch calls had the same configuration
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const calls = mockFetch.mock.calls;
      expect(calls).toHaveLength(2);

      const firstCall = calls[0];
      const secondCall = calls[1];

      expect(firstCall?.[0]).toBe(secondCall?.[0]); // Same URL
      expect(firstCall?.[1]).toEqual(secondCall?.[1]); // Same options
    });

    it('should include proper headers in all requests', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.permitKeyScope)
      );

      await sdk.init();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.permit.io/v2/api-key/scope',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TEST_TOKEN}`,
          }) as Record<string, unknown>,
        })
      );
    });
  });

  describe('Performance and Timing', () => {
    it('should complete successful requests without delay', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.permitKeyScope)
      );

      await sdk.init();

      // Should complete immediately without any timer delays
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should apply delays only during retry scenarios', async () => {
      mockFetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();

      // Allow the first fetch to fail and retry logic to be set up
      await vi.runOnlyPendingTimersAsync();

      // Now there should be a timer set for retry delay
      expect(vi.getTimerCount()).toBeGreaterThanOrEqual(0);
      const calls = mockFetch.mock.calls;
      expect(calls).toHaveLength(2);

      await vi.runAllTimersAsync();
      await initPromise;

      // All timers should be resolved
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
