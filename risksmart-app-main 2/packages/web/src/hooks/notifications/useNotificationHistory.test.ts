import type { KnockMessage } from '@risksmart-app/trpc/src/routers/frontend/notifications/types/history';

import type { NotificationFilterState } from './types';
import {
  buildQueryInput,
  computeDateRange,
  getDefaultDateRange,
  mapMessageToItem,
} from './useNotificationHistory';

describe('useNotificationHistory', () => {
  describe('getDefaultDateRange', () => {
    it('returns last 24 hours range by default', () => {
      const range = getDefaultDateRange();
      expect(range.preset).toBe('last24h');
      expect(range.insertedAtGt).toBeDefined();
      expect(range.insertedAtLt).toBeDefined();
      // insertedAtGt should be ~1 day before insertedAtLt
      const gtDate = new Date(range.insertedAtGt!);
      const ltDate = new Date(range.insertedAtLt!);
      const diffHours = Math.round(
        (ltDate.getTime() - gtDate.getTime()) / (1000 * 60 * 60)
      );
      expect(diffHours).toBeGreaterThanOrEqual(23);
      expect(diffHours).toBeLessThanOrEqual(25);
    });
  });

  describe('buildQueryInput', () => {
    it('maps date range to tRPC query params', () => {
      const filters: NotificationFilterState = {
        dateRange: {
          preset: 'last30',
          insertedAtGt: '2025-01-01T00:00:00.000Z',
          insertedAtLt: '2025-01-31T00:00:00.000Z',
        },
      };

      const input = buildQueryInput(filters);
      expect(input.insertedAtGt).toBe('2025-01-01T00:00:00.000Z');
      expect(input.insertedAtLt).toBe('2025-01-31T00:00:00.000Z');
    });

    it('does not include pagination or server-side filter params', () => {
      const filters: NotificationFilterState = {
        dateRange: {
          preset: 'last30',
          insertedAtGt: '2025-01-01T00:00:00.000Z',
          insertedAtLt: '2025-01-31T00:00:00.000Z',
        },
      };

      const input = buildQueryInput(filters);
      expect(input).not.toHaveProperty('pageSize');
      expect(input).not.toHaveProperty('before');
      expect(input).not.toHaveProperty('status');
      expect(input).not.toHaveProperty('engagementStatus');
      expect(input).not.toHaveProperty('channelId');
      expect(input).not.toHaveProperty('source');
    });

    it('omits insertedAtGt when undefined', () => {
      const filters: NotificationFilterState = {
        dateRange: {
          preset: 'last30',
          insertedAtGt: undefined,
          insertedAtLt: '2025-01-31T00:00:00.000Z',
        },
      };

      const input = buildQueryInput(filters);
      expect(input.insertedAtGt).toBeUndefined();
      expect(input.insertedAtLt).toBe('2025-01-31T00:00:00.000Z');
    });

    it('omits insertedAtLt when undefined', () => {
      const filters: NotificationFilterState = {
        dateRange: {
          preset: 'last30',
          insertedAtGt: '2025-01-01T00:00:00.000Z',
          insertedAtLt: undefined,
        },
      };

      const input = buildQueryInput(filters);
      expect(input.insertedAtGt).toBe('2025-01-01T00:00:00.000Z');
      expect(input.insertedAtLt).toBeUndefined();
    });

    it('returns empty object when both dates are undefined', () => {
      const filters: NotificationFilterState = {
        dateRange: {
          preset: 'last30',
          insertedAtGt: undefined,
          insertedAtLt: undefined,
        },
      };

      const input = buildQueryInput(filters);
      expect(Object.keys(input)).toHaveLength(0);
    });

    it('includes objectId when provided', () => {
      const filters: NotificationFilterState = {
        dateRange: {
          preset: 'last30',
          insertedAtGt: '2025-01-01T00:00:00.000Z',
          insertedAtLt: '2025-01-31T00:00:00.000Z',
        },
      };

      const input = buildQueryInput(filters, 'my-object-id');
      expect(input).toHaveProperty('objectId', 'my-object-id');
    });
  });

  describe('computeDateRange', () => {
    it('returns a 1-day span for last24h', () => {
      const range = computeDateRange('last24h');
      expect(range.preset).toBe('last24h');
      const gt = new Date(range.insertedAtGt!);
      const lt = new Date(range.insertedAtLt!);
      const diffHours = (lt.getTime() - gt.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThanOrEqual(23);
      expect(diffHours).toBeLessThanOrEqual(25);
    });

    it('returns a 7-day span for last7', () => {
      const range = computeDateRange('last7');
      expect(range.preset).toBe('last7');
      const gt = new Date(range.insertedAtGt!);
      const lt = new Date(range.insertedAtLt!);
      const diffDays = (lt.getTime() - gt.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(6.9);
      expect(diffDays).toBeLessThanOrEqual(7.1);
    });

    it('returns a 30-day span for last30', () => {
      const range = computeDateRange('last30');
      expect(range.preset).toBe('last30');
      const gt = new Date(range.insertedAtGt!);
      const lt = new Date(range.insertedAtLt!);
      const diffDays = (lt.getTime() - gt.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(29.9);
      expect(diffDays).toBeLessThanOrEqual(30.1);
    });

    it('returns a 90-day span for last90', () => {
      const range = computeDateRange('last90');
      expect(range.preset).toBe('last90');
      const gt = new Date(range.insertedAtGt!);
      const lt = new Date(range.insertedAtLt!);
      const diffDays = (lt.getTime() - gt.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(89.9);
      expect(diffDays).toBeLessThanOrEqual(90.1);
    });

    it('returns valid ISO date strings', () => {
      const range = computeDateRange('last7');
      expect(new Date(range.insertedAtGt!).toISOString()).toBe(
        range.insertedAtGt
      );
      expect(new Date(range.insertedAtLt!).toISOString()).toBe(
        range.insertedAtLt
      );
    });
  });

  describe('mapMessageToItem', () => {
    const baseMessage: KnockMessage = {
      id: 'msg-1',
      channel_id: 'email',
      recipient: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      workflow: 'risk-insert',
      tenant: 'tenant-1',
      status: 'delivered',
      engagement_statuses: ['seen', 'read'],
      inserted_at: '2025-01-15T10:30:00.000Z',
      updated_at: '2025-01-15T10:30:00.000Z',
      seen_at: '2025-01-15T11:00:00.000Z',
      read_at: '2025-01-15T11:30:00.000Z',
      interacted_at: null,
      archived_at: null,
      source: { key: 'risk-insert', version_id: 'v1' },
      data: { objectId: 'risk-123' },
    };

    const workflowLookup: Record<string, string> = {
      'risk-insert': 'New Risk Created',
    };

    const objectTypeMapper = (workflowKey: string): string => {
      if (workflowKey.startsWith('risk-')) {
        return 'Risk';
      }

      return 'Other';
    };

    it('maps KnockMessage fields to display fields correctly', () => {
      const item = mapMessageToItem(
        baseMessage,
        workflowLookup,
        objectTypeMapper
      );
      expect(item.deliveryStatus).toBe('delivered');
      expect(item.engagementStatuses).toEqual(['seen', 'read']);
      expect(item.insertedAt).toBe('2025-01-15T10:30:00.000Z');
      expect(item.workflowLabel).toBe('New Risk Created');
      expect(item.objectTypeLabel).toBe('Risk');
    });

    it('handles object recipient with name and email', () => {
      const item = mapMessageToItem(
        baseMessage,
        workflowLookup,
        objectTypeMapper
      );
      expect(item.recipientName).toBe('John Doe');
      expect(item.recipientEmail).toBe('john@example.com');
    });

    it('handles object recipient with email only (no name)', () => {
      const msg: KnockMessage = {
        ...baseMessage,
        recipient: { id: 'user-2', email: 'jane@example.com' },
      };
      const item = mapMessageToItem(msg, workflowLookup, objectTypeMapper);
      expect(item.recipientName).toBe('');
      expect(item.recipientEmail).toBe('jane@example.com');
    });

    it('falls back to recipient.id when name and email are missing', () => {
      const msg: KnockMessage = {
        ...baseMessage,
        recipient: { id: 'user-3' },
      };
      const item = mapMessageToItem(msg, workflowLookup, objectTypeMapper);
      expect(item.recipientName).toBe('user-3');
      expect(item.recipientEmail).toBe('');
    });

    it('handles string recipient fallback', () => {
      const msg: KnockMessage = {
        ...baseMessage,
        recipient: 'some-user-string' as unknown as KnockMessage['recipient'],
      };
      const item = mapMessageToItem(msg, workflowLookup, objectTypeMapper);
      expect(item.recipientName).toBe('some-user-string');
      expect(item.recipientEmail).toBe('');
    });

    it('prefers recipientName/recipientEmail from message over recipient object', () => {
      const msg: KnockMessage = {
        ...baseMessage,
        recipientName: 'Override Name',
        recipientEmail: 'override@example.com',
        recipient: {
          id: 'user-1',
          name: 'Original Name',
          email: 'original@example.com',
        },
      };
      const item = mapMessageToItem(msg, workflowLookup, objectTypeMapper);
      expect(item.recipientName).toBe('Override Name');
      expect(item.recipientEmail).toBe('override@example.com');
    });

    it('maps workflow key via workflowLookup', () => {
      const item = mapMessageToItem(
        baseMessage,
        workflowLookup,
        objectTypeMapper
      );
      expect(item.workflowLabel).toBe('New Risk Created');
    });

    it('falls back to raw workflowKey when not in lookup', () => {
      const msg: KnockMessage = {
        ...baseMessage,
        source: { key: 'unknown-workflow', version_id: 'v1' },
      };
      const item = mapMessageToItem(msg, workflowLookup, objectTypeMapper);
      expect(item.workflowLabel).toBe('unknown-workflow');
    });

    it('maps objectTypeLabel via objectTypeMapper', () => {
      const item = mapMessageToItem(
        baseMessage,
        workflowLookup,
        objectTypeMapper
      );
      expect(item.objectTypeLabel).toBe('Risk');
    });

    it('uses source.key over workflow for workflowKey', () => {
      const msg: KnockMessage = {
        ...baseMessage,
        source: { key: 'risk-insert', version_id: 'v1' },
        workflow: 'fallback-workflow',
      };
      const item = mapMessageToItem(msg, workflowLookup, objectTypeMapper);
      expect(item.workflowLabel).toBe('New Risk Created');
    });

    it('falls back to workflow when source.key is missing', () => {
      const msg: KnockMessage = {
        ...baseMessage,
        source: undefined,
        workflow: 'risk-insert',
      };
      const item = mapMessageToItem(msg, workflowLookup, objectTypeMapper);
      expect(item.workflowLabel).toBe('New Risk Created');
    });
  });
});
