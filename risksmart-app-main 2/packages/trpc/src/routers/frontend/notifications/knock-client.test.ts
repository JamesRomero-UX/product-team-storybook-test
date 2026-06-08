import { TRPCError } from '@trpc/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { KnockConfig } from './knock-client';
import {
  fetchWithRetry,
  mapStatusToMessage,
  mapStatusToTRPCCode,
  resolveKnockConfig,
} from './knock-client';

const mockFetch = vi.fn();

const testConfig: KnockConfig = {
  apiBase: 'https://api.knock.test',
  secretKey: 'sk_test_123',
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('resolveKnockConfig', () => {
  afterEach(() => {
    delete process.env.KNOCK_HOST;
    delete process.env.KNOCK_SECRET_KEY;
  });

  it('returns config from env vars', () => {
    process.env.KNOCK_HOST = 'https://api.knock.test';
    process.env.KNOCK_SECRET_KEY = 'sk_test_123';

    const config = resolveKnockConfig();
    expect(config).toEqual({
      apiBase: 'https://api.knock.test',
      secretKey: 'sk_test_123',
    });
  });

  it('strips trailing slashes from host', () => {
    process.env.KNOCK_HOST = 'https://api.knock.test/';
    process.env.KNOCK_SECRET_KEY = 'sk_test_123';

    expect(resolveKnockConfig().apiBase).toBe('https://api.knock.test');
  });

  it('throws if KNOCK_HOST is not set', () => {
    process.env.KNOCK_SECRET_KEY = 'sk_test_123';
    expect(() => resolveKnockConfig()).toThrow(TRPCError);
  });

  it('throws if KNOCK_SECRET_KEY is not set', () => {
    process.env.KNOCK_HOST = 'https://api.knock.test';
    expect(() => resolveKnockConfig()).toThrow(TRPCError);
  });
});

describe('mapStatusToTRPCCode', () => {
  it('maps 400 to BAD_REQUEST', () => {
    expect(mapStatusToTRPCCode(400)).toBe('BAD_REQUEST');
  });

  it('maps 401 to UNAUTHORIZED', () => {
    expect(mapStatusToTRPCCode(401)).toBe('UNAUTHORIZED');
  });

  it('maps 403 to FORBIDDEN', () => {
    expect(mapStatusToTRPCCode(403)).toBe('FORBIDDEN');
  });

  it('maps 404 to NOT_FOUND', () => {
    expect(mapStatusToTRPCCode(404)).toBe('NOT_FOUND');
  });

  it('maps 429 to TOO_MANY_REQUESTS', () => {
    expect(mapStatusToTRPCCode(429)).toBe('TOO_MANY_REQUESTS');
  });

  it('maps 500 to INTERNAL_SERVER_ERROR', () => {
    expect(mapStatusToTRPCCode(500)).toBe('INTERNAL_SERVER_ERROR');
  });
});

describe('mapStatusToMessage', () => {
  it('returns meaningful message for 404', () => {
    expect(mapStatusToMessage(404)).toContain('not found');
  });

  it('returns generic message for 500', () => {
    expect(mapStatusToMessage(500)).toBe('Notification service error');
  });
});

describe('fetchWithRetry', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const result = await fetchWithRetry<{ data: string }>(
      'https://api.knock.test/v1/test',
      testConfig
    );

    expect(result).toEqual({ data: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.knock.test/v1/test',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer sk_test_123' },
      })
    );
  });

  it('supports PUT with custom headers and body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await fetchWithRetry('https://api.knock.test/v1/test', testConfig, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.knock.test/v1/test',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          Authorization: 'Bearer sk_test_123',
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('retries on 429 with backoff', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      });

    const promise = fetchWithRetry(
      'https://api.knock.test/v1/test',
      testConfig
    );
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws TOO_MANY_REQUESTS after exhausting retries', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 });

    const promise = fetchWithRetry(
      'https://api.knock.test/v1/test',
      testConfig
    ).catch((err: unknown) => err);

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(4000);

    const err = await promise;
    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe('TOO_MANY_REQUESTS');
  });

  it('throws TRPCError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(
      fetchWithRetry('https://api.knock.test/v1/test', testConfig)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
