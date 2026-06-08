import { useMutation, useQuery, useSubscription } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import {
  Data_Import_Status_Enum,
  DataImportStartImportDocument,
  GetDataImportErrorsDocument,
  GetDataImportStatusDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import TabHeader from 'src/components/tab-header';

import { useGetCollectionTableProps } from './config';

const Tab: FC = () => {
  const dataImportId = useGetGuidParam('dataImportId');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'dataImportResult',
  });

  const { addNotification } = useNotifications();
  const { data: dataImportData, loading: dataImportLoading } = useSubscription(
    GetDataImportStatusDocument,
    {
      variables: { id: dataImportId },
    }
  );

  const dataImportStatus = dataImportData?.data_import[0].Status;
  const [startImport, startImportResult] = useMutation(
    DataImportStartImportDocument,
    {
      variables: { Id: dataImportId },
    }
  );

  const { data, loading, refetch } = useQuery(GetDataImportErrorsDocument, {
    variables: {
      dataImportId,
    },
    fetchPolicy: 'no-cache',
    skip: dataImportStatus !== Data_Import_Status_Enum.Failed,
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  useEffect(() => {
    if (dataImportStatus === Data_Import_Status_Enum.Failed) {
      refetch();
    }
  }, [dataImportStatus, refetch]);

  const { getByValue } = useRating('data_import_status');
  const tableProps = useGetCollectionTableProps(data?.data_import_error);

  return (
    <Table
      header={
        <SpaceBetween size={'m'}>
          <SimpleRatingBadge
            data-testid={'dataImportStatus'}
            rating={getByValue(dataImportStatus)}
          />
          <TabHeader
            actions={
              dataImportStatus === Data_Import_Status_Enum.Valid && (
                <Button
                  disabled={startImportResult.loading || dataImportLoading}
                  onClick={() => startImport()}
                >
                  {st('startImport')}
                </Button>
              )
            }
          >
            {st('tabTitle')}
          </TabHeader>
        </SpaceBetween>
      }
      variant={'embedded'}
      {...tableProps}
      loading={loading}
    />
  );
};

export default Tab;
