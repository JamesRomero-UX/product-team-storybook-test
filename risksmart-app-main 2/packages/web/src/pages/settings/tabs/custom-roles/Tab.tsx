import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risk-smart/themed-cloudscape-components/table';
import Button from '@risksmart-app/components/src/button';
import Loading from '@risksmart-app/components/src/loading';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  GetCustomRolesDocument,
  GetDefaultRolesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';

import { useGetCustomRolesTableProps } from './config';
import CustomRoleDetailsModal from './CustomRoleDetailsModal';

const CustomRolesTab: FC = () => {
  useI18NSummaryHelpContent('customRoles.registerHelp');
  const { t } = useTranslation(['common']);
  const { addNotification } = useNotifications();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, loading, refetch } = useQuery(GetCustomRolesDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const { data: getRolesResponse, loading: loadingRoles } = useQuery(
    GetDefaultRolesDocument,
    {}
  );

  const tableProps = useGetCustomRolesTableProps(data?.custom_role ?? []);

  const handleModalClose = () => {
    setIsCreateOpen(false);
    refetch();
  };

  if (loadingRoles) {
    return <Loading />;
  }

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={() => {
                      setIsCreateOpen(true);
                    }}
                  >
                    {t('customRoles.add_button')}
                  </Button>
                  <Button
                    iconName={'download'}
                    onClick={tableProps.exportToCsv}
                  >
                    {t('export.export')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('customRoles.tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        trackBy={'Id'}
      />
      {isCreateOpen && (
        <CustomRoleDetailsModal
          onDismiss={handleModalClose}
          availableRoles={
            getRolesResponse?.auth_role_type
              ?.filter((c) => c.resourceTypes.length > 0)
              .map((role) => ({
                roleKey: role.RoleKey,
                name: role.Name,
                groupKey: role.resourceTypes[0].resourceType.ResourceType,
                category: role.Category === 'Manager' ? 'Manager' : 'Viewer',
              })) || []
          }
        />
      )}
    </>
  );
};

export default CustomRolesTab;
