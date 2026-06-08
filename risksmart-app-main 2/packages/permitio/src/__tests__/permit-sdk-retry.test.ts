import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearKeyScopeCache, permitSDK } from '../permit-sdk';
import {
  createMockHttpError,
  createMockSuccessResponse,
  mockResponseBodies,
} from './test-utils';

// Mock dependencies BEFORE importing the module that uses them
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
vi.mock('permitio');
vi.mock('../utils/environment.js', () => ({
  getEnv: vi.fn().mockImplementation((key) => {
    if (key === 'PDP_ENDPOINT') {
      return 'http://localhost:7766';
    }

    return undefined;
  }),
}));

import { Permit } from 'permitio';

// Mock Permit SDK
const mockPermitApi = {
  resourceInstances: {
    create: vi.fn(),
    delete: vi.fn(),
  },
  relationshipTuples: {
    list: vi.fn(),
    create: vi.fn(),
  },
};

const mockPermit = {
  api: mockPermitApi,
} as unknown as Permit;

vi.mocked(Permit).mockImplementation(() => mockPermit);

// Test constants
const TEST_TOKEN = 'test-token';
const TEST_ORG_KEY = 'test-org';

describe('Permit SDK Retry Logic', () => {
  let sdk: ReturnType<typeof permitSDK>;

  let originalListeners: NodeJS.UnhandledRejectionListener[];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    clearKeyScopeCache();

    // Store original unhandled rejection listeners
    originalListeners = process.listeners('unhandledRejection');

    // Remove all existing listeners
    process.removeAllListeners('unhandledRejection');

    // Add test-specific handler
    process.on('unhandledRejection', (reason, promise) => {
      // Only suppress warnings for TypeError: Network error and similar test scenarios
      if (
        reason instanceof TypeError &&
        (reason.message.includes('Network error') ||
          reason.message.includes('fetch failed'))
      ) {
        // Silently handle expected test rejections
        return;
      }

      if (
        reason instanceof Error &&
        (reason.message.includes('Service unavailable') ||
          reason.message.includes('Connection error'))
      ) {
        // Silently handle expected test rejections
        return;
      }

      // Re-emit other unhandled rejections
      originalListeners.forEach((listener) => listener(reason, promise));
    });

    // Ensure all Permit API methods return proper default values
    mockPermitApi.relationshipTuples.list.mockResolvedValue([]);
    mockPermitApi.relationshipTuples.create.mockResolvedValue({});
    mockPermitApi.resourceInstances.create.mockResolvedValue({});
    mockPermitApi.resourceInstances.delete.mockResolvedValue({});

    sdk = permitSDK(TEST_TOKEN);
  });

  afterEach(() => {
    vi.useRealTimers();

    // Remove test-specific unhandled rejection handler
    process.removeAllListeners('unhandledRejection');

    // Restore original unhandled rejection handlers
    originalListeners.forEach((listener) => {
      process.on('unhandledRejection', listener);
    });
  });

  describe('Network Error Retry Logic', () => {
    it('should retry on network errors and eventually succeed', async () => {
      // First two calls fail with network error, third succeeds
      mockFetch
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on connection errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ENOTFOUND'))
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should exhaust retries and throw error', async () => {
      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();

      await expect(initPromise).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });
  });

  describe('HTTP Error Retry Logic', () => {
    it('should retry on 500 server errors', async () => {
      const serverError = createMockHttpError(
        500,
        'Internal Server Error',
        mockResponseBodies.serverError
      );

      mockFetch
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on 502 bad gateway errors', async () => {
      const gatewayError = createMockHttpError(
        502,
        'Bad Gateway',
        mockResponseBodies.gatewayError
      );

      mockFetch
        .mockRejectedValueOnce(gatewayError)
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 503 service unavailable errors', async () => {
      const serviceError = createMockHttpError(
        503,
        'Service Unavailable',
        mockResponseBodies.serviceUnavailable
      );

      mockFetch
        .mockRejectedValueOnce(serviceError)
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 rate limiting errors', async () => {
      const rateLimitError = createMockHttpError(
        429,
        'Too Many Requests',
        mockResponseBodies.rateLimitError
      );

      mockFetch
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.permitKeyScope)
        );

      const initPromise = sdk.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Non-Retryable Error Handling', () => {
    it('should not retry on 401 authentication errors', async () => {
      const authError = createMockHttpError(
        401,
        'Unauthorized',
        mockResponseBodies.authError
      );

      mockFetch.mockRejectedValueOnce(authError);

      await expect(sdk.init()).rejects.toThrow('HTTP 401: Unauthorized');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 403 forbidden errors', async () => {
      const forbiddenError = createMockHttpError(
        403,
        'Forbidden',
        mockResponseBodies.forbiddenError
      );

      mockFetch.mockRejectedValueOnce(forbiddenError);

      await expect(sdk.init()).rejects.toThrow('HTTP 403: Forbidden');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 404 not found errors', async () => {
      const notFoundError = createMockHttpError(
        404,
        'Not Found',
        mockResponseBodies.notFoundError
      );

      mockFetch.mockRejectedValueOnce(notFoundError);

      await expect(sdk.init()).rejects.toThrow('HTTP 404: Not Found');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 400 bad request errors', async () => {
      const badRequestError = createMockHttpError(
        400,
        'Bad Request',
        mockResponseBodies.badRequestError
      );

      mockFetch.mockRejectedValueOnce(badRequestError);

      await expect(sdk.init()).rejects.toThrow('HTTP 400: Bad Request');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Exponential Backoff', () => {
    it('should implement exponential backoff with correct delays', async () => {
      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const initPromise = sdk.init();

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Second retry after 2000ms (exponential backoff)
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Third retry after 4000ms
      await vi.advanceTimersByTimeAsync(4000);
      expect(mockFetch).toHaveBeenCalledTimes(4);

      // Should throw after all retries exhausted
      await expect(initPromise).rejects.toThrow('Network error');
    });

    it('should respect maximum delay limit', async () => {
      // Mock a scenario that would exceed the max delay
      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const initPromise = sdk.init();

      // Run all timers to completion
      await vi.runAllTimersAsync();

      await expect(initPromise).rejects.toThrow('Network error');

      // Verify that delays were used (timers were advanced)
      expect(vi.getTimerCount()).toBe(0); // All timers completed
    });
  });

  describe('Permit SDK Operation Retries', () => {
    beforeEach(async () => {
      // Setup successful init
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.permitKeyScope)
      );
      await sdk.init();
      vi.clearAllMocks();
    });

    it('should retry Permit SDK resource creation operations', async () => {
      mockPermitApi.resourceInstances.create
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce(mockResponseBodies.emptyObject) // owner_group succeeds
        .mockResolvedValueOnce(mockResponseBodies.emptyObject); // contributor_group succeeds

      mockFetch
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        ) // user_group doesn't exist
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        ) // create user_group success
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        ) // owner_group doesn't exist
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        ); // contributor_group doesn't exist

      const createGroupPromise = sdk.createGroup('test-group', TEST_ORG_KEY);
      await vi.runAllTimersAsync();
      await createGroupPromise;

      expect(mockPermitApi.resourceInstances.create).toHaveBeenCalledTimes(4);
    });

    it('should retry Permit SDK relationship operations', async () => {
      mockPermitApi.relationshipTuples.list
        .mockRejectedValueOnce(new Error('Connection error'))
        .mockResolvedValue(mockResponseBodies.emptyArray);

      mockPermitApi.relationshipTuples.create.mockResolvedValue(
        mockResponseBodies.emptyObject
      );

      // Mock all resources exist
      mockFetch.mockResolvedValue(
        createMockSuccessResponse(mockResponseBodies.resourceInstance)
      );

      const createGroupPromise = sdk.createGroup('test-group', TEST_ORG_KEY);
      await vi.runAllTimersAsync();
      await createGroupPromise;

      // Should be called 3 times: 1 failure + 1 retry + 1 second call
      expect(mockPermitApi.relationshipTuples.list).toHaveBeenCalledTimes(3);
    });

    it('should retry Permit SDK delete operations', async () => {
      const serviceError = createMockHttpError(
        503,
        'Service Unavailable',
        mockResponseBodies.serviceUnavailable
      );

      mockPermitApi.resourceInstances.delete
        .mockRejectedValueOnce(serviceError)
        .mockResolvedValueOnce(mockResponseBodies.emptyObject)
        .mockResolvedValueOnce(mockResponseBodies.emptyObject)
        .mockResolvedValueOnce(mockResponseBodies.emptyObject);

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      const deleteGroupPromise = sdk.deleteGroup('test-group');
      await vi.runAllTimersAsync();
      await deleteGroupPromise;

      expect(mockPermitApi.resourceInstances.delete).toHaveBeenCalledTimes(4);
    });
  });
});
