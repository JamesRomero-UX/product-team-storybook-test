import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pollForResourceInstance } from './utils';

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  appendKeys: vi.fn(),
} as unknown as Logger;

const mockPermitSDK = {
  resourceInstanceExists: vi.fn(),
} as unknown as PermitSDK;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('pollForResourceInstance', () => {
  it('should return true if resource exists on first attempt', async () => {
    vi.mocked(mockPermitSDK.resourceInstanceExists).mockResolvedValue(true);

    const result = await pollForResourceInstance(
      mockLogger,
      mockPermitSDK,
      'rs_node',
      'test-key',
      'test-org',
      3
    );

    expect(result).toBe(true);
    expect(mockPermitSDK.resourceInstanceExists).toHaveBeenCalledWith(
      'test-key',
      'rs_node',
      'test-org'
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Found existing resources. Ending search',
      {
        key: 'test-key',
        resourceType: 'rs_node',
        orgKey: 'test-org',
      }
    );
  });

  it('should return true if resource exists after multiple attempts', async () => {
    vi.mocked(mockPermitSDK.resourceInstanceExists)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const pollPromise = pollForResourceInstance(
      mockLogger,
      mockPermitSDK,
      'rs_node',
      'test-key',
      'test-org',
      3
    );

    // Fast-forward through the delays
    await vi.advanceTimersByTimeAsync(600); // 2 * 300ms should be enough

    const result = await pollPromise;

    expect(result).toBe(true);
    expect(mockPermitSDK.resourceInstanceExists).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Found existing resources. Ending search',
      {
        key: 'test-key',
        resourceType: 'rs_node',
        orgKey: 'test-org',
      }
    );
  });

  it('should return false if resource does not exist after max attempts', async () => {
    vi.mocked(mockPermitSDK.resourceInstanceExists).mockResolvedValue(false);

    const pollPromise = pollForResourceInstance(
      mockLogger,
      mockPermitSDK,
      'rs_node',
      'test-key',
      'test-org',
      3
    );

    // Fast-forward through all delays
    await vi.advanceTimersByTimeAsync(900); // 3 * 300ms

    const result = await pollPromise;

    expect(result).toBe(false);
    expect(mockPermitSDK.resourceInstanceExists).toHaveBeenCalledTimes(3);
  });

  it('should use default attempts of 45 if not specified', async () => {
    vi.mocked(mockPermitSDK.resourceInstanceExists).mockResolvedValue(false);

    const pollPromise = pollForResourceInstance(
      mockLogger,
      mockPermitSDK,
      'rs_node',
      'test-key',
      'test-org'
    );

    // Fast-forward through many delays to reach the default max attempts
    await vi.advanceTimersByTimeAsync(45 * 300); // 45 * 300ms

    const result = await pollPromise;

    expect(result).toBe(false);
    expect(mockPermitSDK.resourceInstanceExists).toHaveBeenCalledTimes(45);
  });

  it('should log checking message on each attempt', async () => {
    vi.mocked(mockPermitSDK.resourceInstanceExists)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const pollPromise = pollForResourceInstance(
      mockLogger,
      mockPermitSDK,
      'rs_node',
      'test-key',
      'test-org',
      2
    );

    await vi.advanceTimersByTimeAsync(300);
    await pollPromise;

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Checking if resource instance exists',
      {
        key: 'test-key',
        resourceType: 'rs_node',
        orgKey: 'test-org',
      }
    );
    expect(mockLogger.info).toHaveBeenCalledTimes(4); // 2 checking + 1 found + init log
  });

  it('should handle different resource types and keys', async () => {
    vi.mocked(mockPermitSDK.resourceInstanceExists).mockResolvedValue(true);

    const result = await pollForResourceInstance(
      mockLogger,
      mockPermitSDK,
      'custom_resource',
      'custom-key',
      'custom-org',
      1
    );

    expect(result).toBe(true);
    expect(mockPermitSDK.resourceInstanceExists).toHaveBeenCalledWith(
      'custom-key',
      'custom_resource',
      'custom-org'
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Checking if resource instance exists',
      {
        key: 'custom-key',
        resourceType: 'custom_resource',
        orgKey: 'custom-org',
      }
    );
  });
});
