import type { KnockMessage } from '@risksmart-app/trpc/src/routers/frontend/notifications/types/history';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAllWorkflows } from '@/components/notification-settings-modal/util';
import { resolveNotificationUrl } from '@/utils/notificationUrlResolver';
import { useTRPC } from '@/utils/trpc';

import type {
  DateRangePreset,
  DateRangeState,
  NotificationFilterState,
  NotificationHistoryItem,
} from './types';
import { useObjectTypeMapper } from './utils';

export const computeDateRange = (preset: DateRangePreset): DateRangeState => {
  const now = new Date();
  const PRESET_DAYS: Record<DateRangePreset, number> = {
    last24h: 1,
    last7: 7,
    last30: 30,
    last90: 90,
  };
  const days = PRESET_DAYS[preset] ?? 30;
  const past = new Date(now);
  past.setTime(past.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    preset,
    insertedAtGt: past.toISOString(),
    insertedAtLt: now.toISOString(),
  };
};

export const getDefaultDateRange = (): DateRangeState => {
  return computeDateRange('last24h');
};

export const buildQueryInput = (
  filters: NotificationFilterState,
  objectId?: string
) => {
  return {
    ...(filters.dateRange.insertedAtGt
      ? { insertedAtGt: filters.dateRange.insertedAtGt }
      : {}),
    ...(filters.dateRange.insertedAtLt
      ? { insertedAtLt: filters.dateRange.insertedAtLt }
      : {}),
    ...(objectId ? { objectId } : {}),
  };
};

export const mapMessageToItem = (
  message: KnockMessage,
  workflowLookup: Record<string, string>,
  objectTypeMapper: (workflowKey: string) => string
): NotificationHistoryItem => {
  const recipient = message.recipient;
  let recipientName = message.recipientName ?? '';
  let recipientEmail = message.recipientEmail ?? '';

  if (!recipientName && !recipientEmail) {
    if (typeof recipient === 'object' && recipient) {
      recipientName = recipient.name || '';
      recipientEmail = recipient.email || '';
      if (!recipientName && !recipientEmail) {
        recipientName = recipient.id;
      }
    } else if (typeof recipient === 'string') {
      recipientName = recipient;
    }
  }

  const workflowKey = message.source?.key || message.workflow || '';
  const objectTypeLabel = objectTypeMapper(workflowKey);
  const workflowLabel = workflowLookup[workflowKey] || workflowKey;
  const url = resolveNotificationUrl(workflowKey, message.data ?? {});

  return {
    ...message,
    recipientName,
    recipientEmail,
    objectTypeLabel,
    workflowLabel,
    deliveryStatus: message.status,
    engagementStatuses: message.engagement_statuses,
    insertedAt: message.inserted_at,
    totalActivities: message.totalActivities,
    link: url ?? undefined,
  };
};

const MAX_ITEMS = 10_000;

export interface UseNotificationHistoryOptions {
  objectId?: string;
}

export const useNotificationHistory = (
  options?: UseNotificationHistoryOptions
) => {
  const trpc = useTRPC();
  const workflows = useAllWorkflows();
  const objectTypeMapper = useObjectTypeMapper();

  const workflowLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    for (const wf of workflows) {
      lookup[wf.key] = wf.label;
    }

    return lookup;
  }, [workflows]);

  const [filters, setFilters] = useState<NotificationFilterState>({
    dateRange: getDefaultDateRange(),
  });

  const queryInput = useMemo(
    () => buildQueryInput(filters, options?.objectId),
    [filters, options?.objectId]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      trpc.frontend.notifications.history.listBatch.infiniteQueryOptions(
        queryInput,
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
          initialCursor: null,
        }
      )
    );

  const items: NotificationHistoryItem[] = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page) =>
        page.items.map((msg) =>
          mapMessageToItem(msg, workflowLookup, objectTypeMapper)
        )
      ),
    [data?.pages, workflowLookup, objectTypeMapper]
  );

  // Auto-fetch next batch while under the cap
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && items.length < MAX_ITEMS) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, items.length, fetchNextPage]);

  const isComplete = !hasNextPage || items.length >= MAX_ITEMS;

  const updateDateRange = useCallback((dateRange: DateRangeState) => {
    setFilters({ dateRange });
  }, []);

  return {
    items,
    isLoading,
    isFetchingMore: isFetchingNextPage,
    isComplete,
    totalLoaded: items.length,
    filters,
    updateDateRange,
    workflowLookup,
    objectTypeMapper,
  };
};
