import type { KnockActivity } from '@risksmart-app/trpc/src/routers/frontend/notifications/types/history';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { resolveNotificationUrl } from '@/utils/notificationUrlResolver';

import type { NotificationHistoryItem } from './types';
import { mapActivityToItem, useDigestActivities } from './useDigestActivities';

vi.mock('@/utils/notificationUrlResolver', () => ({
  resolveNotificationUrl: vi.fn((key: string) =>
    key ? `/mock-url/${key}` : null
  ),
}));

const mockQuery = vi.fn();

vi.mock('@/utils/trpc', () => ({
  useTRPCClient: () => ({
    frontend: {
      notifications: {
        history: {
          getDigestActivities: {
            query: mockQuery,
          },
        },
      },
    },
  }),
}));

const mockedResolveNotificationUrl = vi.mocked(resolveNotificationUrl);

describe('useDigestActivities', () => {
  describe('mapActivityToItem', () => {
    const workflowLookup: Record<string, string> = {
      'risk-insert': 'New Risk Created',
      'action-update': 'Action Updated',
    };

    const objectTypeMapper = (workflowKey: string): string => {
      if (workflowKey.startsWith('risk-')) {
        return 'Risk';
      }
      if (workflowKey.startsWith('action-')) {
        return 'Action';
      }

      return 'Unknown';
    };

    const baseActivity: KnockActivity = {
      id: 'activity-1',
      data: {
        sourceWorkflowKey: 'risk-insert',
        sourceData: { objectId: 'risk-123' },
      },
      actor: {
        id: 'actor-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      recipient: { id: 'user-1', name: 'John Doe' },
      inserted_at: '2025-01-15T10:30:00.000Z',
      updated_at: '2025-01-15T10:35:00.000Z',
    };

    it('maps basic activity fields correctly', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.id).toBe('activity-1');
      expect(item.recipient).toEqual({ id: 'user-1', name: 'John Doe' });
      expect(item.inserted_at).toBe('2025-01-15T10:30:00.000Z');
      expect(item.updated_at).toBe('2025-01-15T10:35:00.000Z');
      expect(item.insertedAt).toBe('2025-01-15T10:30:00.000Z');
    });

    it('resolves workflow label from workflowLookup', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.workflowLabel).toBe('New Risk Created');
    });

    it('falls back to raw sourceWorkflowKey when not in lookup', () => {
      const activity: KnockActivity = {
        ...baseActivity,
        data: { sourceWorkflowKey: 'custom-workflow' },
      };
      const item = mapActivityToItem(
        activity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.workflowLabel).toBe('custom-workflow');
    });

    it('resolves objectTypeLabel via objectTypeMapper', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.objectTypeLabel).toBe('Risk');
    });

    it('leaves recipientName and recipientEmail empty for digest children', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.recipientName).toBe('');
      expect(item.recipientEmail).toBe('');
    });

    it('sets isDigestActivity to true', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.isDigestActivity).toBe(true);
    });

    it('sets link from resolveNotificationUrl', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.link).toBe('/mock-url/risk-insert');
    });

    it('passes sourceData (not raw data) to resolveNotificationUrl', () => {
      mockedResolveNotificationUrl.mockClear();

      mapActivityToItem(baseActivity, workflowLookup, objectTypeMapper);

      expect(mockedResolveNotificationUrl).toHaveBeenCalledWith('risk-insert', {
        objectId: 'risk-123',
      });
    });

    it('sets source with key and empty version_id when sourceWorkflowKey exists', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.source).toEqual({ key: 'risk-insert', version_id: '' });
    });

    it('sets source to undefined when sourceWorkflowKey is empty', () => {
      const activity: KnockActivity = {
        ...baseActivity,
        data: {},
      };
      const item = mapActivityToItem(
        activity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.source).toBeUndefined();
    });

    it('handles null data', () => {
      const activity: KnockActivity = {
        ...baseActivity,
        data: null,
      };
      const item = mapActivityToItem(
        activity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.workflowLabel).toBe('');
      expect(item.objectTypeLabel).toBe('Unknown');
      expect(item.source).toBeUndefined();
    });

    it('sets default empty values for non-applicable fields', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.channel_id).toBe('');
      expect(item.status).toBe('');
      expect(item.deliveryStatus).toBe('');
      expect(item.engagementStatuses).toEqual([]);
      expect(item.tenant).toBeNull();
      expect(item.seen_at).toBeNull();
      expect(item.read_at).toBeNull();
      expect(item.interacted_at).toBeNull();
      expect(item.archived_at).toBeNull();
    });

    it('passes activity data through to the item', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.data).toEqual({
        sourceWorkflowKey: 'risk-insert',
        sourceData: { objectId: 'risk-123' },
      });
    });

    it('sets workflow field to sourceWorkflowKey', () => {
      const item = mapActivityToItem(
        baseActivity,
        workflowLookup,
        objectTypeMapper
      );

      expect(item.workflow).toBe('risk-insert');
    });
  });

  describe('useDigestActivities hook', () => {
    const workflowLookup: Record<string, string> = {
      'risk-insert': 'New Risk Created',
    };
    const objectTypeMapper = () => 'Risk';

    const makeDigestItem = (id: string): NotificationHistoryItem =>
      ({
        id,
        source: { key: 'digest', version_id: 'v1' },
        workflow: 'digest',
        recipient: { id: 'user-1' },
        channel_id: 'email',
        tenant: null,
        status: 'delivered',
        engagement_statuses: [],
        inserted_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
        seen_at: null,
        read_at: null,
        interacted_at: null,
        archived_at: null,
        data: {},
        recipientName: 'Test',
        recipientEmail: '',
        objectTypeLabel: 'Risk',
        workflowLabel: 'Digest',
        deliveryStatus: 'delivered',
        engagementStatuses: [],
        insertedAt: '2025-01-15T10:00:00Z',
      }) as NotificationHistoryItem;

    it('tracks errorDigests when tRPC call fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useDigestActivities(workflowLookup, objectTypeMapper)
      );

      const item = makeDigestItem('msg-fail');

      await act(async () => {
        await result.current
          .getExpandableRowsProps()
          .onExpandableItemToggle({ detail: { item, expanded: true } });
      });

      expect(result.current.errorDigests.has('msg-fail')).toBe(true);
      expect(result.current.loadingDigests.has('msg-fail')).toBe(false);
    });

    it('clears errorDigests on successful retry', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useDigestActivities(workflowLookup, objectTypeMapper)
      );

      const item = makeDigestItem('msg-retry');

      // First attempt: fails
      await act(async () => {
        await result.current
          .getExpandableRowsProps()
          .onExpandableItemToggle({ detail: { item, expanded: true } });
      });

      expect(result.current.errorDigests.has('msg-retry')).toBe(true);

      // Collapse to allow retry
      await act(async () => {
        result.current
          .getExpandableRowsProps()
          .onExpandableItemToggle({ detail: { item, expanded: false } });
      });

      // Second attempt: succeeds
      mockQuery.mockResolvedValueOnce({ items: [] });

      await act(async () => {
        await result.current
          .getExpandableRowsProps()
          .onExpandableItemToggle({ detail: { item, expanded: true } });
      });

      expect(result.current.errorDigests.has('msg-retry')).toBe(false);
    });

    it('does not set errorDigests on successful expand', async () => {
      mockQuery.mockResolvedValueOnce({ items: [] });

      const { result } = renderHook(() =>
        useDigestActivities(workflowLookup, objectTypeMapper)
      );

      const item = makeDigestItem('msg-ok');

      await act(async () => {
        await result.current
          .getExpandableRowsProps()
          .onExpandableItemToggle({ detail: { item, expanded: true } });
      });

      expect(result.current.errorDigests.has('msg-ok')).toBe(false);
      expect(result.current.loadingDigests.has('msg-ok')).toBe(false);
    });
  });
});
