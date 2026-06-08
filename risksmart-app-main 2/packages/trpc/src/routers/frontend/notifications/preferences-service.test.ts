import { TRPCError } from '@trpc/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { KnockConfig } from './knock-client';
import {
  getTenantPreferences,
  setTenantPreferences,
} from './preferences-service';
import type { TenantPreferenceSetInput } from './types/preferences';

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

interface KnockPayload {
  settings: {
    preference_set: {
      __persistence_strategy__: string;
      channel_types: Record<string, boolean>;
      categories?: Record<
        string,
        { __strategy__?: string; channel_types: Record<string, boolean> }
      >;
      workflows?: Record<
        string,
        { __strategy__?: string; channel_types: Record<string, boolean> }
      >;
    };
  };
}

const parseBody = (callIndex: number): KnockPayload => {
  const call = mockFetch.mock.calls[callIndex] as [string, RequestInit];

  return JSON.parse(call[1].body as string) as KnockPayload;
};

// ---------------------------------------------------------------------------
// getTenantPreferences
// ---------------------------------------------------------------------------
describe('getTenantPreferences', () => {
  const knockTenantResponse = {
    id: 'tenant-1',
    settings: {
      preference_set: {
        id: 'default',
        channel_types: { email: true, in_app_feed: true },
        categories: {
          actions: {
            __strategy__: 'replace',
            channel_types: { email: true, in_app_feed: true },
          },
          risks: {
            channel_types: { email: false, in_app_feed: false },
          },
        },
        workflows: {
          'action-due': {
            __strategy__: 'replace',
            channel_types: { email: true, in_app_feed: true },
          },
          'risk-insert': {
            channel_types: { email: false, in_app_feed: false },
          },
        },
      },
    },
  };

  it('returns parsed preference set from Knock response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(knockTenantResponse),
    });

    const result = await getTenantPreferences(testConfig, 'tenant-1');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.knock.test/v1/tenants/tenant-1',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer sk_test_123' },
      })
    );

    expect(result).toEqual({
      id: 'default',
      channel_types: { email: true, in_app_feed: true },
      categories: {
        actions: {
          channel_types: { email: true, in_app_feed: true },
          enforced: true,
        },
        risks: {
          channel_types: { email: false, in_app_feed: false },
          enforced: false,
        },
      },
      workflows: {
        'action-due': {
          channel_types: { email: true, in_app_feed: true },
          enforced: true,
        },
        'risk-insert': {
          channel_types: { email: false, in_app_feed: false },
          enforced: false,
        },
      },
    });
  });

  it('retries on 429 with backoff', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(knockTenantResponse),
      });

    const promise = getTenantPreferences(testConfig, 'tenant-1');

    // Advance past first backoff (1000ms)
    await vi.advanceTimersByTimeAsync(1000);
    // Advance past second backoff (2000ms)
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.id).toBe('default');
  });

  it('throws TRPCError TOO_MANY_REQUESTS after exhausting retries on 429', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 });

    const promise = getTenantPreferences(testConfig, 'tenant-1').catch(
      (err: unknown) => err
    );

    // Advance through all retries (attempts 0,1,2 backoff: 1s, 2s, 4s)
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(4000);

    const err = await promise;
    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe('TOO_MANY_REQUESTS');
  });

  it('throws TRPCError NOT_FOUND on 404', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(
      getTenantPreferences(testConfig, 'tenant-1')
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws TRPCError INTERNAL_SERVER_ERROR on 500', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(
      getTenantPreferences(testConfig, 'tenant-1')
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});

// ---------------------------------------------------------------------------
// setTenantPreferences
// ---------------------------------------------------------------------------
describe('setTenantPreferences', () => {
  it('sends correct PUT payload with __persistence_strategy__: replace', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const input: TenantPreferenceSetInput = {
      preferences: {
        channel_types: { email: true, in_app_feed: true },
        workflows: {
          'action-due': {
            channel_types: { email: true, in_app_feed: true },
            enforced: false,
          },
        },
      },
    };

    await setTenantPreferences(testConfig, 'tenant-1', input);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.knock.test/v1/tenants/tenant-1',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer sk_test_123',
        },
      })
    );

    const body = parseBody(0);
    expect(body.settings.preference_set.__persistence_strategy__).toBe(
      'replace'
    );
  });

  it('maps enforced: true to __strategy__: replace per workflow', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const input: TenantPreferenceSetInput = {
      preferences: {
        workflows: {
          'action-due': {
            channel_types: { email: true, in_app_feed: true },
            enforced: true,
          },
          'risk-insert': {
            channel_types: { email: false, in_app_feed: false },
            enforced: false,
          },
        },
      },
    };

    await setTenantPreferences(testConfig, 'tenant-1', input);

    const body = parseBody(0);
    const workflows = body.settings.preference_set.workflows!;
    expect(workflows['action-due']!.__strategy__).toBe('replace');
    expect(workflows['action-due']!.channel_types).toEqual({
      email: true,
      in_app_feed: true,
    });
    expect(workflows['risk-insert']!.__strategy__).toBeUndefined();
    expect(workflows['risk-insert']!.channel_types).toEqual({
      email: false,
      in_app_feed: false,
    });
  });

  it('maps enforced: true to __strategy__: replace per category', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const input: TenantPreferenceSetInput = {
      preferences: {
        categories: {
          actions: {
            channel_types: { email: true, in_app_feed: true },
            enforced: true,
          },
          risks: {
            channel_types: { email: false, in_app_feed: false },
            enforced: false,
          },
        },
      },
    };

    await setTenantPreferences(testConfig, 'tenant-1', input);

    const body = parseBody(0);
    const categories = body.settings.preference_set.categories!;
    expect(categories['actions']!.__strategy__).toBe('replace');
    expect(categories['risks']!.__strategy__).toBeUndefined();
  });

  it('computes top-level channel_types from workflow aggregate', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const input: TenantPreferenceSetInput = {
      preferences: {
        workflows: {
          'action-due': {
            channel_types: { email: true, in_app_feed: false },
            enforced: false,
          },
          'risk-insert': {
            channel_types: { email: false, in_app_feed: true },
            enforced: false,
          },
        },
      },
    };

    await setTenantPreferences(testConfig, 'tenant-1', input);

    const body = parseBody(0);
    // Top-level channel_types should be the union (OR) of all workflow channel_types
    expect(body.settings.preference_set.channel_types).toEqual({
      email: true,
      in_app_feed: true,
    });
  });

  it('computes top-level channel_types from both workflows and categories', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const input: TenantPreferenceSetInput = {
      preferences: {
        workflows: {
          'action-due': {
            channel_types: { email: true, in_app_feed: false },
            enforced: false,
          },
        },
        categories: {
          actions: {
            channel_types: { email: false, in_app_feed: true, chat: true },
            enforced: false,
          },
        },
      },
    };

    await setTenantPreferences(testConfig, 'tenant-1', input);

    const body = parseBody(0);
    // Union of workflow and category channel_types
    expect(body.settings.preference_set.channel_types).toEqual({
      email: true,
      in_app_feed: true,
      chat: true,
    });
  });

  it('uses explicit top-level channel_types when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const input: TenantPreferenceSetInput = {
      preferences: {
        channel_types: { email: false, in_app_feed: false, chat: true },
        workflows: {
          'action-due': {
            channel_types: { email: true, in_app_feed: true },
            enforced: false,
          },
        },
      },
    };

    await setTenantPreferences(testConfig, 'tenant-1', input);

    const body = parseBody(0);
    expect(body.settings.preference_set.channel_types).toEqual({
      email: false,
      in_app_feed: false,
      chat: true,
    });
  });

  it('handles Knock API errors', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    const input: TenantPreferenceSetInput = {
      preferences: {
        workflows: {},
      },
    };

    await expect(
      setTenantPreferences(testConfig, 'tenant-1', input)
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('retries on 429 for PUT requests', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

    const input: TenantPreferenceSetInput = {
      preferences: { workflows: {} },
    };

    const promise = setTenantPreferences(testConfig, 'tenant-1', input);
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
