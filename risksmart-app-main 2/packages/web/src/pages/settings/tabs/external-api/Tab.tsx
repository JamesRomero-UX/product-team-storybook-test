import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Link from '@risk-smart/themed-cloudscape-components/link';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import type { ApiClient } from 'src/providers/ExternalApiProvider';
import { useExternalApi } from 'src/providers/ExternalApiProvider';

import { useGetCollectionTableProps } from './config';
import CreateClientModal from './modals/CreateClientModal';

const ExternalApiTab: FC = () => {
  useI18NSummaryHelpContent('externalApi.help');
  const { t } = useTranslation(['common'], { keyPrefix: 'externalApi' });
  const { addNotification } = useNotifications();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedClients, setSelectedClients] = useState<ApiClient[]>([]);

  const {
    apiClients,
    loading,
    error,
    deleteClient,
    refreshClients,
    docsUrl,
    isCreateDisabled,
  } = useExternalApi();

  const tableProps = useGetCollectionTableProps(apiClients);

  const handleCreateModalOpen = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    refreshClients();
  };

  const handleDelete = async () => {
    try {
      for (const client of selectedClients) {
        await deleteClient(client.clientId);
      }

      addNotification({
        type: 'success',
        content: t('delete_success_message'),
      });

      setSelectedClients([]);
      setIsDeleteModalVisible(false);
      refreshClients();
    } catch (err) {
      addNotification({
        type: 'error',
        content: err instanceof Error ? err.message : t('delete_error_message'),
      });
    }
  };

  useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        content: error.message,
      });
    }
  }, [error, addNotification]);

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              key={'tab-header'}
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    key={'delete-button'}
                    formAction={'none'}
                    variant={'normal'}
                    disabled={!selectedClients.length}
                    onClick={() => setIsDeleteModalVisible(true)}
                  >
                    {t('delete_button')}
                  </Button>
                  <Button
                    key={'add-button'}
                    variant={'primary'}
                    formAction={'none'}
                    onClick={handleCreateModalOpen}
                    disabled={isCreateDisabled}
                  >
                    {t('add_button')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('table_title')}
            </TabHeader>
            <SpaceBetween key={'alerts-container'} size={'xs'}>
              {!loading && apiClients.length > 0 && isCreateDisabled ? (
                <Alert key={'mc-warn'} type={'warning'}>
                  {t('max_clients_warning')}
                </Alert>
              ) : null}
              <Box key={'info-msg'} margin={{ bottom: 'xs' }}>
                <Alert type={'info'}>
                  {t('info_message')}
                  <br />
                  {docsUrl ? (
                    <Link
                      href={docsUrl}
                      external
                      target={'_blank'}
                      rel={'noopener noreferrer'}
                    >
                      {t('view_documentation')}
                    </Link>
                  ) : null}
                </Alert>
              </Box>
            </SpaceBetween>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        selectionType={'multi'}
        selectedItems={selectedClients}
        onSelectionChange={({ detail }) => {
          setSelectedClients(detail.selectedItems);
        }}
        trackBy={'clientId'}
      />
      {isCreateModalOpen && (
        <CreateClientModal onDismiss={handleCreateModalClose} />
      )}
      <DeleteModal
        loading={false}
        isVisible={isDeleteModalVisible}
        header={t('delete_modal_title')}
        onDelete={handleDelete}
        onDismiss={() => {
          setSelectedClients([]);
          setIsDeleteModalVisible(false);
        }}
        size={'medium'}
      >
        <SpaceBetween size={'m'}>
          <Alert key={'delete-warning'} type={'warning'}>
            {t('delete_warning_message')}
          </Alert>
          <span key={'confirm-message'}>{t('confirm_delete_message')}</span>
        </SpaceBetween>
      </DeleteModal>
    </>
  );
};

export default ExternalApiTab;
