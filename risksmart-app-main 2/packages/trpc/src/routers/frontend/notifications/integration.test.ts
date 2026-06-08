/**
 * Integration and adversarial tests for the notifications history router.
 *
 * These tests focus on gaps NOT covered by router.test.ts:
 *  - Missing KNOCK_SECRET_KEY env var
 *  - Malformed / unexpected Knock API response shapes (null data, string recipient, etc.)
 *  - Empty engagement_statuses array in response
 *  - Tenant isolation (uses context tenant, not user input)
 *  - listBatch auto-pagination adversarial scenarios
 *  - Authorization call correctness
 */

import { bulkCheck } from '@risksmart-app/permitio/src/permit';
import { TRPCError } from '@trpc/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCallerFactory } from '../../../init';
import { createMockContext } from '../../../test-utils/mock-context';
import { notificationsRouter } from './router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
  bulkCheck: vi.fn(),
}));

const mockContext = createMockContext({
  orgId: 'org-123',
  userId: 'user-456',
  tenant: 'acme-corp',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(notificationsRouter);

const mockFetchOk = (body: unknown) => {
  vi.mocked(global.fetch).mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
};

/** Minimal Knock page response factory for listBatch mocking */
const makePageResponse = (
  items: Record<string, unknown>[] = [],
  afterCursor: string | null = null
) => {
  return {
    items,
    page_info: { after: afterCursor, before: null, page_size: 50 },
  };
};

describe('notification-history integration tests', () => {
  beforeEach(() => {
    vi.stubEnv('KNOCK_SECRET_KEY', 'sk_test_integration');
    vi.stubEnv('KNOCK_HOST', 'https://api.knock.test');
    vi.mocked(global.fetch).mockReset();
    vi.mocked(bulkCheck).mockResolvedValue([
      { resourceName: 'settings', action: 'read' },
    ]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Missing KNOCK_SECRET_KEY
  // ──────────────────────────────────────────────────────────────────────────

  describe('missing KNOCK_SECRET_KEY', () => {
    it('throws INTERNAL_SERVER_ERROR when KNOCK_SECRET_KEY is not set', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('KNOCK_SECRET_KEY', '');
      vi.stubEnv('KNOCK_HOST', 'https://api.knock.test');

      const caller = createCaller(mockContext);
      try {
        await caller.history.listBatch({});
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(TRPCError);
        expect((err as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
      }
    });
  });

  describe('missing KNOCK_HOST', () => {
    it('throws INTERNAL_SERVER_ERROR when KNOCK_HOST is not set', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('KNOCK_SECRET_KEY', 'sk_test_integration');
      vi.stubEnv('KNOCK_HOST', '');

      const caller = createCaller(mockContext);
      try {
        await caller.history.listBatch({});
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(TRPCError);
        expect((err as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Malformed / adversarial Knock API responses
  // ──────────────────────────────────────────────────────────────────────────

  describe('malformed Knock API responses', () => {
    it('returns items with string recipient as-is (does not crash)', async () => {
      mockFetchOk(
        makePageResponse([
          {
            id: 'msg_str_recipient',
            channel_id: 'email',
            recipient: 'user-plain-id-string',
            workflow: 'risk-insert',
            tenant: 'acme-corp',
            status: 'delivered',
            engagement_statuses: [],
            inserted_at: '2026-01-15T10:00:00Z',
            updated_at: '2026-01-15T10:00:00Z',
            seen_at: null,
            read_at: null,
            interacted_at: null,
            archived_at: null,
            source: { key: 'risk-insert', version_id: 'v1' },
            data: null,
          },
        ])
      );
      const caller = createCaller(mockContext);

      const result = await caller.history.listBatch({});
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.recipient).toBe('user-plain-id-string');
    });

    it('returns item with null data payload without crashing', async () => {
      mockFetchOk(
        makePageResponse([
          {
            id: 'msg_null_data',
            channel_id: 'email',
            recipient: { id: 'user-1', name: 'Alice' },
            workflow: 'action-insert',
            tenant: 'acme-corp',
            status: 'sent',
            engagement_statuses: [],
            inserted_at: '2026-01-15T10:00:00Z',
            updated_at: '2026-01-15T10:00:00Z',
            seen_at: null,
            read_at: null,
            interacted_at: null,
            archived_at: null,
            source: { key: 'action-insert', version_id: 'v1' },
            data: null,
          },
        ])
      );
      const caller = createCaller(mockContext);

      const result = await caller.history.listBatch({});
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.data).toBeNull();
    });

    it('returns item with empty engagement_statuses array', async () => {
      mockFetchOk(
        makePageResponse([
          {
            id: 'msg_empty_engagement',
            channel_id: 'email',
            recipient: { id: 'user-1', name: 'Bob', email: 'bob@example.com' },
            workflow: 'control-insert',
            tenant: 'acme-corp',
            status: 'delivered',
            engagement_statuses: [],
            inserted_at: '2026-01-15T10:00:00Z',
            updated_at: '2026-01-15T10:00:00Z',
            seen_at: null,
            read_at: null,
            interacted_at: null,
            archived_at: null,
            source: { key: 'control-insert', version_id: 'v1' },
            data: { objectId: 'ctrl-1' },
          },
        ])
      );
      const caller = createCaller(mockContext);

      const result = await caller.history.listBatch({});
      expect(result.items[0]!.engagement_statuses).toEqual([]);
    });

    it('passes through unexpected workflow keys in the response without error', async () => {
      mockFetchOk(
        makePageResponse([
          {
            id: 'msg_unknown',
            channel_id: 'email',
            recipient: { id: 'user-1', name: 'Charlie' },
            workflow: 'new-experimental-workflow-v42',
            tenant: 'acme-corp',
            status: 'delivered',
            engagement_statuses: [],
            inserted_at: '2026-01-15T10:00:00Z',
            updated_at: '2026-01-15T10:00:00Z',
            seen_at: null,
            read_at: null,
            interacted_at: null,
            archived_at: null,
            source: { key: 'new-experimental-workflow-v42', version_id: 'v1' },
            data: null,
          },
        ])
      );
      const caller = createCaller(mockContext);

      const result = await caller.history.listBatch({});
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.workflow).toBe('new-experimental-workflow-v42');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Tenant isolation: uses context tenant, not user input
  // ──────────────────────────────────────────────────────────────────────────

  describe('tenant isolation', () => {
    it('always uses the context tenant for listBatch', async () => {
      mockFetchOk(makePageResponse());
      const caller = createCaller(mockContext);

      await caller.history.listBatch({});

      const [url] = vi.mocked(global.fetch).mock.calls[0]!;
      expect(url as string).toContain('tenant=acme-corp');
    });

    it('uses a different context tenant correctly', async () => {
      const altContext = createMockContext({
        orgId: 'org-alt',
        userId: 'user-alt',
        tenant: 'other-tenant',
        isBackend: false,
        features: [],
      });
      vi.mocked(bulkCheck).mockResolvedValue([
        { resourceName: 'settings', action: 'read' },
      ]);
      mockFetchOk(makePageResponse());

      const caller = createCaller(altContext);
      await caller.history.listBatch({});

      const [url] = vi.mocked(global.fetch).mock.calls[0]!;
      expect(url as string).toContain('tenant=other-tenant');
      expect(url as string).not.toContain('tenant=acme-corp');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Authorization: bulkCheck verifies correct args
  // ──────────────────────────────────────────────────────────────────────────

  describe('authorization call correctness', () => {
    it('calls bulkCheck with correct resource and user info for listBatch', async () => {
      mockFetchOk(makePageResponse());
      const caller = createCaller(mockContext);

      await caller.history.listBatch({});

      expect(bulkCheck).toHaveBeenCalledWith(
        [{ resourceName: 'settings', action: 'read' }],
        'user-456',
        'org-123'
      );
    });

    it('FORBIDDEN error does not reveal permission internals in message', async () => {
      vi.mocked(bulkCheck).mockResolvedValue([]);
      const caller = createCaller(mockContext);

      try {
        await caller.history.listBatch({});
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(TRPCError);
        const trpcErr = err as TRPCError;
        expect(trpcErr.code).toBe('FORBIDDEN');
        expect(trpcErr.message).not.toContain('settings');
        expect(trpcErr.message).not.toContain('bulkCheck');
      }
    });
  });
});
