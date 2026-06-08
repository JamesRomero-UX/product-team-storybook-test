import { useKnockFeed } from '@knocklabs/react';
import HelpPanel from '@risk-smart/themed-cloudscape-components/help-panel';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import { Inbox01, Settings03 } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import NotificationSettingsModal from '@/components/notification-settings-modal/NotificationSettingsModal';

import EmptyNotifications from './EmptyNotifications';
import { NotificationCell } from './NotificationCell';
import styles from './style.module.scss';
import type { NotificationItem } from './useNotificationItems';
import { useNotificationItems } from './useNotificationItems';

type Props = {
  loading: boolean;
  items: NotificationItem[];
  onClearAll: () => void;
  onRead: (item: NotificationItem) => void;
  onRemove: (item: NotificationItem) => void;
  onShowSettings: () => void;
};

export const NotificationsList: FC<Props> = ({
  loading,
  items,
  onClearAll,
  onRead,
  onRemove,
  onShowSettings,
}) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'notifications' });
  if (loading) {
    return (
      <div className={'flex items-center justify-center h-full'}>
        <Spinner size={'large'} />
      </div>
    );
  }

  return (
    <div className={styles.notificationList}>
      <HelpPanel
        header={
          <div className={'flex items-center justify-between -mt-2'}>
            <h2>{t('header')}</h2>
            <div className={'flex flex-row'}>
              <button
                onClick={onShowSettings}
                className={
                  'bg-transparent border-0 hover:bg-grey150 text-grey500 flex items-center justify-center text-center p-1 rounded-md cursor-pointer w-[40px] h-[40px]'
                }
              >
                <Settings03 />
              </button>
              <button
                onClick={onClearAll}
                className={
                  'bg-transparent border-0 hover:bg-grey150 text-grey500 flex items-center justify-center text-center p-1 rounded-md cursor-pointer w-[40px] h-[40px]'
                }
              >
                <Inbox01 />
              </button>
            </div>
          </div>
        }
      >
        {items.length === 0 && <EmptyNotifications />}
        <SpaceBetween size={'s'}>
          {items.map((item) => (
            <NotificationCell
              key={item.feedItem.id}
              item={item}
              onArchive={() => onRemove(item)}
              onRead={() => onRead(item)}
            />
          ))}
        </SpaceBetween>
      </HelpPanel>
    </div>
  );
};

const WrappedNotificationList: FC = () => {
  const { items, loading } = useNotificationItems();
  const { feedClient } = useKnockFeed();
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {showSettings && (
        <NotificationSettingsModal onClose={() => setShowSettings(false)} />
      )}
      <NotificationsList
        items={items}
        onRemove={(item) => feedClient.markAsArchived(item.feedItem)}
        onRead={(item) => {
          if (item.url) {
            navigate(item.url);
          }
          feedClient.markAsRead(item.feedItem);
        }}
        loading={loading}
        onClearAll={async () => {
          await feedClient.markAllAsArchived();
        }}
        onShowSettings={() => setShowSettings(true)}
      />
    </>
  );
};

export default WrappedNotificationList;
