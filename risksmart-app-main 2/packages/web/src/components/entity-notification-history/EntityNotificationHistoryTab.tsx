import Alert from '@risk-smart/themed-cloudscape-components/alert';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { NotificationHistoryItem } from '@/hooks/notifications/types';
import { useNotificationHistory } from '@/hooks/notifications/useNotificationHistory';
import type { TablePreferences } from '@/utils/table/types';

import NotificationHistoryTable from '../notification-history-table/NotificationHistoryTable';

const defaultPreferences: TablePreferences<NotificationHistoryItem> = {
  pageSize: 50,
  visibleContent: [
    'recipientName',
    'workflowLabel',
    'channelName',
    'deliveryStatus',
    'insertedAt',
    'link',
  ],
  stickyColumns: { first: 1, last: 0 },
};

interface EntityNotificationHistoryTabProps {
  objectId: string;
}

const EntityNotificationHistoryTab: FC<EntityNotificationHistoryTabProps> = ({
  objectId,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'notificationHistory',
  });

  const {
    items,
    isLoading,
    isFetchingMore,
    totalLoaded,
    filters,
    updateDateRange,
  } = useNotificationHistory({ objectId });

  return (
    <SpaceBetween direction={'vertical'} size={'m'}>
      <Alert type={'info'}>{t('digest_entity_info')}</Alert>
      <NotificationHistoryTable
        items={items}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        totalLoaded={totalLoaded}
        currentPreset={filters.dateRange.preset}
        onDateRangeChange={updateDateRange}
        defaultPreferences={defaultPreferences}
        localStorageKey={'EntityNotificationHistoryTable-Preferences'}
      />
    </SpaceBetween>
  );
};

export default EntityNotificationHistoryTab;
