import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risk-smart/themed-cloudscape-components/table';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { GetAuthUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { Permission } from 'src/rbac/Permission';

import TenantNotificationPreferencesModal from '@/components/tenant-notification-preferences/TenantNotificationPreferencesModal';

import { useGetUsersTableProps } from './config';
import UserDetailsModal from './UserDetailsModal';

const UsersTab: FC = () => {
  useI18NSummaryHelpContent('userSettings.help');
  const { t } = useTranslation(['common']);
  const { addNotification } = useNotifications();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    undefined
  );
  // Temporary: notification defaults button to be replaced with proper settings tab
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const { data, loading, refetch } = useQuery(GetAuthUsersDocument, {
    variables: {
      where: {
        _or: [
          { RoleKey: { _neq: 'ThirdPartyRespondent' } },
          { RoleKey: { _is_null: true } },
        ],
      },
    },
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });
  const tableProps = useGetUsersTableProps(data?.auth_user ?? [], (user) => {
    setSelectedUserId(user.Id);
    setIsEditOpen(true);
  });

  const handleUserModalClose = () => {
    setSelectedUserId(undefined);
    setIsEditOpen(false);
    refetch();
  };

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  {/* Temporary: to be replaced with proper settings tab */}
                  <Permission permission={'read:settings'}>
                    <Button onClick={() => setIsPrefsOpen(true)}>
                      {t('notification_settings.tenant_button')}
                    </Button>
                  </Permission>
                  <Button
                    iconName={'download'}
                    onClick={tableProps.exportToCsv}
                  >
                    {t('export.export')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('userSettings.usersTableTitle')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        trackBy={'Id'}
      />
      {isEditOpen && selectedUserId && (
        <UserDetailsModal
          id={selectedUserId}
          onDismiss={handleUserModalClose}
        />
      )}
      {isPrefsOpen && (
        <TenantNotificationPreferencesModal
          onClose={() => setIsPrefsOpen(false)}
        />
      )}
    </>
  );
};

export default UsersTab;
