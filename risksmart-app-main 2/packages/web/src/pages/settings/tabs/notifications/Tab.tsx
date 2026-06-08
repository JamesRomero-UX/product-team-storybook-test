import type { FC } from 'react';

import type { NotificationHistoryItem } from '@/hooks/notifications/types';
import { useDigestActivities } from '@/hooks/notifications/useDigestActivities';
import { useNotificationHistory } from '@/hooks/notifications/useNotificationHistory';
import type { TablePreferences } from '@/utils/table/types';

import NotificationHistoryTable from '../../../../components/notification-history-table/NotificationHistoryTable';

const defaultPreferences: TablePreferences<NotificationHistoryItem> = {
  pageSize: 50,
  visibleContent: [
    'recipientName',
    'objectTypeLabel',
    'workflowLabel',
    'channelName',
    'deliveryStatus',
    'insertedAt',
    'link',
  ],
  stickyColumns: { first: 1, last: 0 },
};

const NotificationsTab: FC = () => {
  const {
    items,
    isLoading,
    isFetchingMore,
    totalLoaded,
    filters,
    updateDateRange,
    workflowLookup,
    objectTypeMapper,
  } = useNotificationHistory();

  const { getExpandableRowsProps } = useDigestActivities(
    workflowLookup,
    objectTypeMapper
  );

  return (
    <NotificationHistoryTable
      items={items}
      isLoading={isLoading}
      isFetchingMore={isFetchingMore}
      totalLoaded={totalLoaded}
      currentPreset={filters.dateRange.preset}
      onDateRangeChange={updateDateRange}
      defaultPreferences={defaultPreferences}
      localStorageKey={'NotificationHistoryTable-Preferences'}
      expandableRows={getExpandableRowsProps()}
    />
  );
};

export default NotificationsTab;
