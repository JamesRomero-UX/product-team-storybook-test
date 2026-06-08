import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import { GetDataImportsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TabHeader from 'src/components/tab-header';
import { useGetCollectionTableProps } from 'src/pages/data-import/config';

const DataImportTab: FC = () => {
  const { addNotification } = useNotifications();
  const { data, loading } = useQuery(GetDataImportsDocument, {
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });
  const { t } = useTranslation(['common'], { keyPrefix: 'dataImport' });
  const tableProps = useGetCollectionTableProps(data?.data_import ?? []);

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button variant={'primary'} href={'add'}>
                    {t('create_new_button')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('tabTitle')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        trackBy={'Id'}
      />
    </>
  );
};

export default DataImportTab;
