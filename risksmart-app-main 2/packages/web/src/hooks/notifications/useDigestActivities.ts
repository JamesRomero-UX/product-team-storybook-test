import type { KnockActivity } from '@risksmart-app/trpc/src/routers/frontend/notifications/types/history';
import { useCallback, useState } from 'react';

import { resolveNotificationUrl } from '@/utils/notificationUrlResolver';
import { useTRPCClient } from '@/utils/trpc';

import type { NotificationHistoryItem } from './types';

export const mapActivityToItem = (
  activity: KnockActivity,
  workflowLookup: Record<string, string>,
  objectTypeMapper: (key: string) => string
): NotificationHistoryItem => {
  const data = activity.data ?? {};
  const sourceWorkflowKey = (data.sourceWorkflowKey as string) || '';
  const objectTypeLabel = objectTypeMapper(sourceWorkflowKey);
  const workflowLabel = workflowLookup[sourceWorkflowKey] || sourceWorkflowKey;

  const sourceData = (data.sourceData as Record<string, unknown>) ?? {};
  const url = resolveNotificationUrl(sourceWorkflowKey, sourceData);

  return {
    id: activity.id,
    channel_id: '',
    recipient: activity.recipient,
    workflow: sourceWorkflowKey,
    tenant: null,
    status: '',
    engagement_statuses: [],
    inserted_at: activity.inserted_at,
    updated_at: activity.updated_at,
    seen_at: null,
    read_at: null,
    interacted_at: null,
    archived_at: null,
    source: sourceWorkflowKey
      ? { key: sourceWorkflowKey, version_id: '' }
      : undefined,
    data: activity.data,
    recipientName: '',
    recipientEmail: '',
    objectTypeLabel,
    workflowLabel,
    deliveryStatus: '',
    engagementStatuses: [],
    insertedAt: activity.inserted_at,
    isDigestActivity: true,
    link: url ?? undefined,
  };
};

export const useDigestActivities = (
  workflowLookup: Record<string, string>,
  objectTypeMapper: (key: string) => string
) => {
  const [expandedItems, setExpandedItems] = useState<{ id: string }[]>([]);
  const [digestChildren, setDigestChildren] = useState<
    Record<string, NotificationHistoryItem[]>
  >({});
  const [loadingDigests, setLoadingDigests] = useState<Set<string>>(new Set());
  const [errorDigests, setErrorDigests] = useState<Set<string>>(new Set());
  const trpcClient = useTRPCClient();

  const handleExpandToggle = useCallback(
    async ({
      detail,
    }: {
      detail: { item: NotificationHistoryItem; expanded: boolean };
    }) => {
      setExpandedItems((prev) => {
        const ids = new Set(prev.map((i) => i.id));
        if (detail.expanded) {
          ids.add(detail.item.id);
        } else {
          ids.delete(detail.item.id);
        }

        return Array.from(ids).map((id) => ({ id }));
      });

      if (detail.expanded && !digestChildren[detail.item.id]) {
        setLoadingDigests((prev) => new Set(prev).add(detail.item.id));
        try {
          const result =
            await trpcClient.frontend.notifications.history.getDigestActivities.query(
              {
                messageId: detail.item.id,
              }
            );
          const children = result.items.map((activity: KnockActivity) =>
            mapActivityToItem(activity, workflowLookup, objectTypeMapper)
          );
          setDigestChildren((prev) => ({
            ...prev,
            [detail.item.id]: children,
          }));
          setErrorDigests((prev) => {
            const next = new Set(prev);
            next.delete(detail.item.id);

            return next;
          });
        } catch {
          setErrorDigests((prev) => new Set(prev).add(detail.item.id));
        } finally {
          setLoadingDigests((prev) => {
            const next = new Set(prev);
            next.delete(detail.item.id);

            return next;
          });
        }
      }
    },
    [digestChildren, trpcClient, workflowLookup, objectTypeMapper]
  );

  const getExpandableRowsProps = useCallback(
    () => ({
      isItemExpandable: (item: NotificationHistoryItem) =>
        (item.source?.key === 'digest' || item.workflow === 'digest') &&
        !item.isDigestActivity,
      getItemChildren: (item: NotificationHistoryItem) =>
        digestChildren[item.id] ?? [],
      expandedItems,
      onExpandableItemToggle: handleExpandToggle,
    }),
    [expandedItems, digestChildren, handleExpandToggle]
  );

  return {
    expandedItems,
    getExpandableRowsProps,
    loadingDigests,
    errorDigests,
  };
};
