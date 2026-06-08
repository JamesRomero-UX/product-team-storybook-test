import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import service functions under test (NOT mocked)
import { enrichMessages, fetchDigestActivities } from './history-service';
import type { KnockConfig } from './knock-client';
import type {
  KnockActivity,
  KnockActivityListResponse,
  KnockMessage,
} from './types/history';

/** Helper: build a Knock activities API response */
const makeActivityResponse = (
  items: KnockActivity[],
  afterCursor: string | null = null,
  totalCount?: number
): KnockActivityListResponse => ({
  items,
  page_info: {
    after: afterCursor,
    before: null,
    page_size: 50,
    total_count: totalCount,
  },
});

const baseActivity: KnockActivity = {
  id: 'act_1',
  data: { sourceWorkflowKey: 'risk-insert', objectId: 'risk-1' },
  actor: { id: 'actor-1', name: 'Alice', email: 'alice@example.com' },
  recipient: { id: 'user-1' },
  inserted_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
};

const baseMessage: KnockMessage = {
  id: 'msg_1',
  channel_id: 'email',
  recipient: { id: 'user-1', name: 'John', email: 'john@example.com' },
  workflow: 'risk-insert',
  tenant: 'test-tenant',
  status: 'delivered',
  engagement_statuses: ['seen'],
  inserted_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  seen_at: '2026-01-15T10:05:00Z',
  read_at: null,
  interacted_at: null,
  archived_at: null,
  source: { key: 'risk-insert', version_id: 'v1' },
  data: { objectId: 'risk-123' },
};

/**
 * URL-based fetch mock that routes responses based on URL patterns.
 * Allows concurrent enrichment calls to be handled predictably.
 */
const createRoutingFetchMock = (
  routes: {
    pattern: string | RegExp;
    response: Response | (() => Response);
  }[]
) => {
  return vi.fn((url: string | URL | Request): Promise<Response> => {
    const urlStr =
      typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
    for (const route of routes) {
      const matches =
        typeof route.pattern === 'string'
          ? urlStr.includes(route.pattern)
          : route.pattern.test(urlStr);
      if (matches) {
        return Promise.resolve(
          typeof route.response === 'function'
            ? route.response()
            : route.response.clone()
        );
      }
    }

    // Default: return 404 for unmatched routes
    return Promise.resolve(
      new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
      })
    );
  });
};

const testConfig: KnockConfig = {
  apiBase: 'https://api.knock.test',
  secretKey: 'sk_test_service',
};

describe('notification-history service', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // fetchDigestActivities
  // ──────────────────────────────────────────────────────────────────────────

  describe('fetchDigestActivities', () => {
    it('returns activities from a single page', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify(makeActivityResponse([baseActivity], null, 1)),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await fetchDigestActivities(
        testConfig,
        'msg_digest_1',
        'tenant-1'
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.id).toBe('act_1');
      expect(result.page_info.after).toBeNull();
    });

    it('constructs correct Knock API URL', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(makeActivityResponse([], null)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await fetchDigestActivities(testConfig, 'msg_123', 'tenant-1');

      const [url] = vi.mocked(global.fetch).mock.calls[0]!;
      const urlStr = url as string;
      expect(urlStr).toBe(
        'https://api.knock.test/v1/messages/msg_123/activities?page_size=50'
      );
    });

    it('encodes special characters in messageId', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(makeActivityResponse([], null)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await fetchDigestActivities(testConfig, 'msg/with spaces', 'tenant-1');

      const [url] = vi.mocked(global.fetch).mock.calls[0]!;
      const urlStr = url as string;
      expect(urlStr).toContain('msg%2Fwith%20spaces');
    });

    it('paginates and accumulates items across pages', async () => {
      const act1: KnockActivity = { ...baseActivity, id: 'act_p1' };
      const act2: KnockActivity = { ...baseActivity, id: 'act_p2' };
      const act3: KnockActivity = { ...baseActivity, id: 'act_p3' };

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(makeActivityResponse([act1], 'cursor_2')),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(makeActivityResponse([act2], 'cursor_3')),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(makeActivityResponse([act3], null)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const result = await fetchDigestActivities(
        testConfig,
        'msg_1',
        'tenant-1'
      );

      expect(result.items).toHaveLength(3);
      expect(result.items.map((a) => a.id)).toEqual([
        'act_p1',
        'act_p2',
        'act_p3',
      ]);
    });

    it('passes after cursor to subsequent page requests', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(makeActivityResponse([baseActivity], 'next_cursor')),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(makeActivityResponse([], null)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      await fetchDigestActivities(testConfig, 'msg_1', 'tenant-1');

      const [url2] = vi.mocked(global.fetch).mock.calls[1]!;
      expect(url2 as string).toContain('after=next_cursor');
    });

    it('stops at MAX_ACTIVITY_PAGES (10) and returns partial result', async () => {
      for (let i = 0; i < 10; i++) {
        vi.mocked(global.fetch).mockResolvedValueOnce(
          new Response(
            JSON.stringify(
              makeActivityResponse(
                [{ ...baseActivity, id: `act_${i}` }],
                `cursor_${i + 1}`
              )
            ),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }

      const result = await fetchDigestActivities(
        testConfig,
        'msg_1',
        'tenant-1'
      );

      expect(result.items).toHaveLength(10);
      expect(global.fetch).toHaveBeenCalledTimes(10);
      expect(result.page_info.after).toBe('cursor_10');
      expect(result.page_info.page_size).toBe(50);
    });

    it('throws TRPCError on non-ok response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 500 })
      );

      await expect(
        fetchDigestActivities(testConfig, 'msg_1', 'tenant-1')
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('throws NOT_FOUND on 404', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 404 })
      );

      await expect(
        fetchDigestActivities(testConfig, 'msg_1', 'tenant-1')
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('retries on 429 with exponential backoff', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          new Response(JSON.stringify({}), { status: 429 })
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(makeActivityResponse([baseActivity], null)),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );

      const resultPromise = fetchDigestActivities(
        testConfig,
        'msg_1',
        'tenant-1'
      );
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.items).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('sends Authorization header with secret key', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(makeActivityResponse([], null)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await fetchDigestActivities(testConfig, 'msg_1', 'tenant-1');

      const [, opts] = vi.mocked(global.fetch).mock.calls[0]!;
      expect((opts as RequestInit).headers).toMatchObject({
        Authorization: 'Bearer sk_test_service',
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // enrichMessages — totalActivities for digest messages
  // ──────────────────────────────────────────────────────────────────────────

  describe('enrichMessages — totalActivities', () => {
    it('adds totalActivities for digest messages (source.key === "digest")', async () => {
      const digestMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_digest_1',
        source: { key: 'digest', version_id: 'v1' },
        workflow: 'digest',
      };

      global.fetch = createRoutingFetchMock([
        {
          pattern: '/v1/messages/msg_digest_1/activities',
          response: () =>
            new Response(
              JSON.stringify(makeActivityResponse([baseActivity], null, 5)),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            ),
        },
      ]);

      const result = await enrichMessages(testConfig, [digestMsg]);

      expect(result).toHaveLength(1);
      expect(result[0]!.totalActivities).toBe(5);
    });

    it('adds totalActivities for digest messages (workflow === "digest", no source)', async () => {
      const digestMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_digest_2',
        source: undefined,
        workflow: 'digest',
      };

      global.fetch = createRoutingFetchMock([
        {
          pattern: '/v1/messages/msg_digest_2/activities',
          response: () =>
            new Response(
              JSON.stringify(makeActivityResponse([baseActivity], null, 3)),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            ),
        },
      ]);

      const result = await enrichMessages(testConfig, [digestMsg]);

      expect(result[0]!.totalActivities).toBe(3);
    });

    it('does not add totalActivities for non-digest messages', async () => {
      global.fetch = createRoutingFetchMock([]);

      const result = await enrichMessages(testConfig, [baseMessage]);

      expect(result[0]!.totalActivities).toBeUndefined();
    });

    it('uses total_count from page_info when available', async () => {
      const digestMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_digest_tc',
        source: { key: 'digest', version_id: 'v1' },
      };

      global.fetch = createRoutingFetchMock([
        {
          pattern: '/v1/messages/msg_digest_tc/activities',
          response: () =>
            new Response(
              JSON.stringify(makeActivityResponse([baseActivity], null, 42)),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            ),
        },
      ]);

      const result = await enrichMessages(testConfig, [digestMsg]);

      expect(result[0]!.totalActivities).toBe(42);
    });

    it('falls back to items.length when total_count is not present', async () => {
      const digestMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_digest_no_tc',
        source: { key: 'digest', version_id: 'v1' },
      };

      global.fetch = createRoutingFetchMock([
        {
          pattern: '/v1/messages/msg_digest_no_tc/activities',
          response: () =>
            new Response(
              JSON.stringify(
                makeActivityResponse([baseActivity], null, undefined)
              ),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            ),
        },
      ]);

      const result = await enrichMessages(testConfig, [digestMsg]);

      // Falls back to items.length (1 item in the response)
      expect(result[0]!.totalActivities).toBe(1);
    });

    it('handles activity count fetch error gracefully (no totalActivities set)', async () => {
      const digestMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_digest_err',
        source: { key: 'digest', version_id: 'v1' },
      };

      global.fetch = createRoutingFetchMock([
        {
          pattern: '/v1/messages/msg_digest_err/activities',
          response: () => new Response(JSON.stringify({}), { status: 500 }),
        },
      ]);

      const result = await enrichMessages(testConfig, [digestMsg]);

      // Should not crash; totalActivities just won't be set
      expect(result).toHaveLength(1);
      expect(result[0]!.totalActivities).toBeUndefined();
    });

    it('enriches mixed digest and non-digest messages correctly', async () => {
      const digestMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_digest_mix',
        source: { key: 'digest', version_id: 'v1' },
        workflow: 'digest',
      };
      const regularMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_regular_mix',
        source: { key: 'risk-insert', version_id: 'v1' },
        workflow: 'risk-insert',
      };

      global.fetch = createRoutingFetchMock([
        {
          pattern: '/v1/messages/msg_digest_mix/activities',
          response: () =>
            new Response(JSON.stringify(makeActivityResponse([], null, 7)), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
        },
      ]);

      const result = await enrichMessages(testConfig, [digestMsg, regularMsg]);

      expect(result).toHaveLength(2);
      expect(result[0]!.totalActivities).toBe(7);
      expect(result[1]!.totalActivities).toBeUndefined();
    });

    it('resolves recipientEmail and recipientName alongside totalActivities', async () => {
      const digestMsg: KnockMessage = {
        ...baseMessage,
        id: 'msg_digest_recip',
        source: { key: 'digest', version_id: 'v1' },
        recipient: { id: 'user-1', name: 'Jane', email: 'jane@example.com' },
      };

      global.fetch = createRoutingFetchMock([
        {
          pattern: '/v1/messages/msg_digest_recip/activities',
          response: () =>
            new Response(JSON.stringify(makeActivityResponse([], null, 2)), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
        },
      ]);

      const result = await enrichMessages(testConfig, [digestMsg]);

      expect(result[0]!.recipientEmail).toBe('jane@example.com');
      expect(result[0]!.recipientName).toBe('Jane');
      expect(result[0]!.totalActivities).toBe(2);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // enrichMessages — recipient resolution retries on rate limit
  // ──────────────────────────────────────────────────────────────────────────

  describe('enrichMessages — recipient resolution retries on 429', () => {
    it('retries fetchKnockUser on 429 and resolves on success', async () => {
      const msg: KnockMessage = {
        ...baseMessage,
        id: 'msg_user_retry',
        recipient: { id: 'user-retry-1' },
      };

      let callCount = 0;
      global.fetch = vi.fn((): Promise<Response> => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(
            new Response(JSON.stringify({}), { status: 429 })
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              name: 'Retried User',
              email: 'retry@example.com',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      });

      const resultPromise = enrichMessages(testConfig, [msg]);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result[0]!.recipientName).toBe('Retried User');
      expect(result[0]!.recipientEmail).toBe('retry@example.com');
      expect(callCount).toBeGreaterThanOrEqual(2);
    });

    it('retries fetchKnockObject on 429 and resolves on success', async () => {
      const msg: KnockMessage = {
        ...baseMessage,
        id: 'msg_obj_retry',
        recipient: { id: 'obj-1', collection: 'tenants' },
      };

      let callCount = 0;
      global.fetch = vi.fn((): Promise<Response> => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(
            new Response(JSON.stringify({}), { status: 429 })
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              properties: { name: 'Retried Object', email: 'obj@example.com' },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      });

      const resultPromise = enrichMessages(testConfig, [msg]);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result[0]!.recipientName).toBe('Retried Object');
      expect(callCount).toBeGreaterThanOrEqual(2);
    });
  });
});
