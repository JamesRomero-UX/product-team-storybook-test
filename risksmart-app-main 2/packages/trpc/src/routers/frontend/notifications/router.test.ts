import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

const mockBulkCheck = vi.fn();
vi.mock('@risksmart-app/permitio/src/permit', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  bulkCheck: (...args: unknown[]) => mockBulkCheck(...args),
}));

// -- Knock client mock --
vi.mock('./knock-client', async () => {
  const actual = await vi.importActual('./knock-client');

  return {
    ...actual,
    resolveKnockConfig: () => ({
      apiBase: 'https://api.knock.test',
      secretKey: 'sk_test_123',
    }),
  };
});

// -- Preferences service mocks --
const mockGetTenantPreferences = vi.fn();
const mockSetTenantPreferences = vi.fn();
vi.mock('./preferences-service', () => ({
  get getTenantPreferences() {
    return mockGetTenantPreferences;
  },
  get setTenantPreferences() {
    return mockSetTenantPreferences;
  },
}));

// -- History service mocks --
const mockListBatchMessages = vi.fn();
const mockEnrichMessages = vi.fn((_config: unknown, msgs: unknown[]) =>
  Promise.resolve(msgs)
);
const mockFetchDigestActivities = vi.fn();
vi.mock('./history-service', () => ({
  get listBatchMessages() {
    return mockListBatchMessages;
  },
  get enrichMessages() {
    return mockEnrichMessages;
  },
  get fetchDigestActivities() {
    return mockFetchDigestActivities;
  },
}));

import { createCallerFactory } from '../../../init';
import { notificationsRouter } from './router';

const createCaller = createCallerFactory(notificationsRouter);

const createTestContext = (
  overrides?: Partial<{ user: Record<string, unknown> }>
) => ({
  req: {} as Request,
  res: {} as Response,
  user: {
    orgId: 'org-1',
    userId: 'user-1',
    tenant: 'test-tenant',
    isBackend: false,
    features: [],
    ...overrides?.user,
  },
});

const mockPreferencesOutput = {
  id: 'default',
  channel_types: { email: true, in_app_feed: true },
  categories: {},
  workflows: {
    'action-due': {
      channel_types: { email: true, in_app_feed: true },
      enforced: true,
    },
  },
};

// ---------------------------------------------------------------------------
// Preferences sub-router
// ---------------------------------------------------------------------------
describe('notifications.preferences', () => {
  beforeEach(() => {
    delete process.env.KNOCK_TENANT_OVERRIDE;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.KNOCK_TENANT_OVERRIDE;
  });

  describe('get', () => {
    it('rejects without read:settings permission', async () => {
      mockBulkCheck.mockResolvedValueOnce([]);
      const caller = createCaller(createTestContext());

      await expect(caller.preferences.get()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('returns preferences for authenticated user tenant', async () => {
      mockBulkCheck.mockResolvedValueOnce([
        { resourceName: 'settings', action: 'read' },
      ]);
      mockGetTenantPreferences.mockResolvedValueOnce(mockPreferencesOutput);

      const caller = createCaller(createTestContext());
      const result = await caller.preferences.get();

      expect(mockGetTenantPreferences).toHaveBeenCalledWith(
        expect.objectContaining({ apiBase: 'https://api.knock.test' }),
        'test-tenant'
      );
      expect(result).toEqual(mockPreferencesOutput);
    });

    it('uses KNOCK_TENANT_OVERRIDE when set', async () => {
      process.env.KNOCK_TENANT_OVERRIDE = 'override-tenant';
      mockBulkCheck.mockResolvedValueOnce([
        { resourceName: 'settings', action: 'read' },
      ]);
      mockGetTenantPreferences.mockResolvedValueOnce(mockPreferencesOutput);

      const caller = createCaller(createTestContext());
      await caller.preferences.get();

      expect(mockGetTenantPreferences).toHaveBeenCalledWith(
        expect.objectContaining({ apiBase: 'https://api.knock.test' }),
        'override-tenant'
      );
    });

    it('rejects unauthenticated requests', async () => {
      const caller = createCaller({
        req: {} as Request,
        res: {} as Response,
        user: undefined as never,
      });

      await expect(caller.preferences.get()).rejects.toThrow();
    });
  });

  describe('set', () => {
    const validInput = {
      preferences: {
        workflows: {
          'action-due': {
            channel_types: { email: true, in_app_feed: true },
            enforced: true,
          },
        },
      },
    };

    it('rejects without update:settings permission', async () => {
      mockBulkCheck.mockResolvedValueOnce([]);
      const caller = createCaller(createTestContext());

      await expect(caller.preferences.set(validInput)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('calls service with correct tenant', async () => {
      mockBulkCheck.mockResolvedValueOnce([
        { resourceName: 'settings', action: 'update' },
      ]);
      mockSetTenantPreferences.mockResolvedValueOnce(undefined);

      const caller = createCaller(createTestContext());
      await caller.preferences.set(validInput);

      expect(mockSetTenantPreferences).toHaveBeenCalledWith(
        expect.objectContaining({ apiBase: 'https://api.knock.test' }),
        'test-tenant',
        validInput
      );
    });

    it('uses KNOCK_TENANT_OVERRIDE when set', async () => {
      process.env.KNOCK_TENANT_OVERRIDE = 'override-tenant';
      mockBulkCheck.mockResolvedValueOnce([
        { resourceName: 'settings', action: 'update' },
      ]);
      mockSetTenantPreferences.mockResolvedValueOnce(undefined);

      const caller = createCaller(createTestContext());
      await caller.preferences.set(validInput);

      expect(mockSetTenantPreferences).toHaveBeenCalledWith(
        expect.objectContaining({ apiBase: 'https://api.knock.test' }),
        'override-tenant',
        validInput
      );
    });

    it('rejects unauthenticated requests', async () => {
      const caller = createCaller({
        req: {} as Request,
        res: {} as Response,
        user: undefined as never,
      });

      await expect(caller.preferences.set(validInput)).rejects.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// History sub-router
// ---------------------------------------------------------------------------
describe('notifications.history', () => {
  beforeEach(() => {
    delete process.env.KNOCK_TENANT_OVERRIDE;
    mockBulkCheck.mockImplementation((checks: { action: string }[]) =>
      Promise.resolve(checks.map((c) => ({ ...c })))
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.KNOCK_TENANT_OVERRIDE;
  });

  describe('listBatch', () => {
    it('checks settings read permission when no objectId', async () => {
      mockListBatchMessages.mockResolvedValueOnce({
        items: [],
        nextCursor: null,
      });

      const caller = createCaller(createTestContext());
      await caller.history.listBatch({});

      expect(mockBulkCheck).toHaveBeenCalledWith(
        [{ resourceName: 'settings', action: 'read' }],
        'user-1',
        'org-1'
      );
    });

    it('checks rs_node read permission when objectId is provided', async () => {
      const objectId = '550e8400-e29b-41d4-a716-446655440000';
      mockListBatchMessages.mockResolvedValueOnce({
        items: [],
        nextCursor: null,
      });

      const caller = createCaller(createTestContext());
      await caller.history.listBatch({ objectId });

      expect(mockBulkCheck).toHaveBeenCalledWith(
        [{ resourceName: 'rs_node', action: 'read', resourceId: objectId }],
        'user-1',
        'org-1'
      );
    });

    it('throws FORBIDDEN when permission denied', async () => {
      mockBulkCheck.mockResolvedValueOnce([]);

      const caller = createCaller(createTestContext());
      await expect(caller.history.listBatch({})).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('calls enrichMessages with the items', async () => {
      mockListBatchMessages.mockResolvedValueOnce({
        items: [{ id: 'msg_1' }],
        nextCursor: null,
      });

      const caller = createCaller(createTestContext());
      await caller.history.listBatch({});

      expect(mockEnrichMessages).toHaveBeenCalledWith(
        expect.objectContaining({ apiBase: 'https://api.knock.test' }),
        [{ id: 'msg_1' }]
      );
    });

    it('filters digest messages when objectId is provided', async () => {
      const objectId = '550e8400-e29b-41d4-a716-446655440000';
      mockListBatchMessages.mockResolvedValueOnce({
        items: [
          {
            id: 'msg_1',
            source: { key: 'risk-insert' },
            workflow: 'risk-insert',
          },
          { id: 'msg_2', source: { key: 'digest' }, workflow: 'digest' },
          { id: 'msg_3', source: { key: 'action-due' }, workflow: 'digest' },
        ],
        nextCursor: null,
      });

      const caller = createCaller(createTestContext());
      const result = await caller.history.listBatch({ objectId });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.id).toBe('msg_1');
    });

    it('does not filter digest messages when no objectId', async () => {
      mockListBatchMessages.mockResolvedValueOnce({
        items: [{ id: 'msg_1', source: { key: 'digest' }, workflow: 'digest' }],
        nextCursor: null,
      });

      const caller = createCaller(createTestContext());
      const result = await caller.history.listBatch({});

      expect(result.items).toHaveLength(1);
    });
  });

  describe('getDigestActivities', () => {
    it('calls fetchDigestActivities with correct args', async () => {
      mockFetchDigestActivities.mockResolvedValueOnce({
        items: [],
        page_info: { after: null, before: null, page_size: 50 },
      });

      const caller = createCaller(createTestContext());
      await caller.history.getDigestActivities({ messageId: 'msg_123' });

      expect(mockFetchDigestActivities).toHaveBeenCalledWith(
        expect.objectContaining({ apiBase: 'https://api.knock.test' }),
        'msg_123',
        'test-tenant'
      );
    });

    it('checks settings:read permission (not rs_node:read)', async () => {
      mockFetchDigestActivities.mockResolvedValueOnce({
        items: [],
        page_info: { after: null, before: null, page_size: 50 },
      });

      const caller = createCaller(createTestContext());
      await caller.history.getDigestActivities({ messageId: 'msg_123' });

      expect(mockBulkCheck).toHaveBeenCalledWith(
        [{ resourceName: 'settings', action: 'read' }],
        'user-1',
        'org-1'
      );
    });

    it('throws FORBIDDEN when permission denied', async () => {
      mockBulkCheck.mockResolvedValueOnce([]);

      const caller = createCaller(createTestContext());
      await expect(
        caller.history.getDigestActivities({ messageId: 'msg_123' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('uses KNOCK_TENANT_OVERRIDE when set', async () => {
      process.env.KNOCK_TENANT_OVERRIDE = 'override-tenant';
      mockFetchDigestActivities.mockResolvedValueOnce({
        items: [],
        page_info: { after: null, before: null, page_size: 50 },
      });

      const caller = createCaller(createTestContext());
      await caller.history.getDigestActivities({ messageId: 'msg_123' });

      expect(mockFetchDigestActivities).toHaveBeenCalledWith(
        expect.objectContaining({ apiBase: 'https://api.knock.test' }),
        'msg_123',
        'override-tenant'
      );
    });
  });
});
