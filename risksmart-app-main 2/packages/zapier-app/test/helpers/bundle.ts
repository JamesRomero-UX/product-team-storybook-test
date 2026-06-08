import type { Bundle, ZObject } from 'zapier-platform-core';
import { vi } from 'vitest';

export const TEST_BASE_URL = 'https://api.test.risksmart.com';
export const TEST_SESSION_KEY = 'test-session-key-abc123';

export function createBundle(
  inputData: Record<string, unknown> = {}
): Bundle {
  return {
    authData: {
      api_base_url: TEST_BASE_URL,
      sessionKey: TEST_SESSION_KEY,
      client_key: 'test-client-key',
      client_secret: 'test-client-secret',
    },
    inputData,
  } as Bundle;
}

interface MockResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
  throwForStatus: () => void;
}

export function mockResponse(
  status: number,
  data: unknown
): MockResponse {
  return {
    status,
    data,
    headers: {},
    throwForStatus() {
      if (status >= 400) {
        const error = new Error(`Got ${status} response`);
        (error as Record<string, unknown>).status = status;
        throw error;
      }
    },
  };
}

class MockRefreshAuthError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'RefreshAuthError';
  }
}

export function createMockZ(): ZObject & {
  request: ReturnType<typeof vi.fn>;
} {
  return {
    request: vi.fn(),
    console: { log: vi.fn() },
    errors: {
      RefreshAuthError: MockRefreshAuthError,
    },
    JSON,
  } as unknown as ZObject & { request: ReturnType<typeof vi.fn> };
}
