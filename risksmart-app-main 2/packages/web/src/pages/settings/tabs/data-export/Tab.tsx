import { useMutation } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import Link from '@risk-smart/themed-cloudscape-components/link';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  DataExportCreateScheduleDocument,
  DataExportTestScheduleDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TabHeader from 'src/components/tab-header';

import {
  useGetActiveDataExportSchedule,
  useGetDataExportScheduleExecutions,
} from '@/hooks/queries';

import { useGetCollectionTableProps } from './config';
import DataExportForm from './DataExportForm';
import type { DataExportFormDataFields } from './dataExportSchema';
import useDataExportStore from './dataExportStore';

const DataExportTab: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'dataExport' });
  const [createSchedule] = useMutation(DataExportCreateScheduleDocument);
  const [triggerTestSchedule] = useMutation(DataExportTestScheduleDocument);
  const [testTriggerProcessing, setTestTriggerProcessing] = useState(false);
  const [defunctScheduleId, setDefunctScheduleId] = useState<
    string | undefined
  >(undefined);
  const { addNotification } = useNotifications();
  const {
    data: activeExportScheduleData,
    loading: loadingActiveExportScheduleData,
    refetch: refetchActiveExportSchedule,
  } = useGetActiveDataExportSchedule({ queryArgs: {} });

  const {
    data: dataExportScheduleExecutionsData,
    loading: loadingDataExportScheduleExecutionsData,
    refetch: refetchDataExportScheduleExecutions,
  } = useGetDataExportScheduleExecutions({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(
    dataExportScheduleExecutionsData?.data_export_schedule_execution || [],
    activeExportScheduleData?.data_export_schedule?.[0]?.Id || null
  );

  const onTestScheduleTrigger = async () => {
    setTestTriggerProcessing(true);
    await triggerTestSchedule({
      variables: {
        object: {
          scheduleId:
            activeExportScheduleData?.data_export_schedule?.[0]?.Id ?? '',
        },
      },
      onError: () => {
        addNotification({
          type: 'error',
          content: t('testFailedMessage'),
        });
        refetchDataExportScheduleExecutions();
        setTestTriggerProcessing(false);
      },
      onCompleted: () => {
        // Optionally handle success message
        addNotification({
          type: 'success',
          content: t('testSuccessMessage'),
        });
        //sleep for 10 seconds to mitigate rapid export executions
        setTimeout(() => {
          setTestTriggerProcessing(false);
          refetchDataExportScheduleExecutions();
        }, 10000);
      },
    });
  };

  const onSave = async (data: DataExportFormDataFields) => {
    await createSchedule({
      variables: {
        object: {
          accessKey: data.AccessKey,
          accountName: data.AccountName,
          bucketName: data.BucketName,
          containerName: data.ContainerName,
          endDate: data.EndDate || undefined,
          entraClientId: data.EntraClientId,
          entraSecretValue: data.EntraSecretValue,
          entraTenantId: data.EntraTenantId,
          frequency: data.Frequency,
          hostname: data.Hostname,
          password: data.Password,
          port: data.Port,
          s3Folder: data.S3Folder,
          sasToken: data.SasToken,
          secretAccessKey: data.SecretAccessKey,
          sftpFolder: data.SftpFolder,
          sharePointDriveId: data.SharePointDriveId,
          sharePointSiteId: data.SharePointSiteId,
          spFolder: data.SPFolder,
          startDate: data.StartDate || undefined,
          storageType: data.StorageType,
          username: data.Username,
        },
      },
    });
    // After saving, set the current active schedule as defunct to disable test button whilst new active schedule is fetched
    setDefunctScheduleId(
      activeExportScheduleData?.data_export_schedule?.[0]?.Id
    );
    refetchActiveExportSchedule();
    refetchDataExportScheduleExecutions();
  };

  const hasScheduledExportConfigured =
    activeExportScheduleData?.data_export_schedule &&
    activeExportScheduleData.data_export_schedule.length > 0;

  const {
    dataExportLoading,
    dataExportResult,
    dataExportError,
    resetDataExport,
  } = useDataExportStore();

  // reset one off export if navigating away and back to the tab
  useEffect(() => {
    resetDataExport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading =
    loadingDataExportScheduleExecutionsData || dataExportLoading;

  return (
    <>
      <TabHeader
        actions={
          !loadingActiveExportScheduleData &&
          hasScheduledExportConfigured &&
          activeExportScheduleData?.data_export_schedule?.[0]?.Id && (
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button
                formAction={'none'}
                variant={'normal'}
                disabled={
                  testTriggerProcessing ||
                  defunctScheduleId ===
                    activeExportScheduleData?.data_export_schedule?.[0]?.Id
                }
                onClick={onTestScheduleTrigger}
              >
                {t('triggerTestExportButtonLabel')}
              </Button>
            </SpaceBetween>
          )
        }
      >
        {t('tabHeaderTitle')}
      </TabHeader>
      {isLoading ? (
        <div className={'mt-6'}>
          <Spinner size={'big'} />
        </div>
      ) : dataExportError ? (
        <div className={'mt-6 mb-6'}>
          <Alert
            statusIconAriaLabel={'Error'}
            type={'error'}
            header={t('exportFailedHeader')}
          >
            {t('exportFailedMessage')}
          </Alert>
        </div>
      ) : dataExportResult?.dataExportOneOffExport ? (
        <div className={'mt-6 mb-6'}>
          <Alert
            statusIconAriaLabel={'Info'}
            type={'success'}
            header={t('exportSuccessHeader')}
          >
            {t('exportSuccessMessage')}{' '}
            {dataExportResult.dataExportOneOffExport.expiresInSeconds / 60}{' '}
            {t('exportSuccessMessageTimeUnit')}
            {': '}
            <Link
              href={dataExportResult.dataExportOneOffExport.downloadUrl}
              external
            >
              {t('exportSuccessDownloadText')}
            </Link>
          </Alert>
        </div>
      ) : (
        <></>
      )}

      {!loadingDataExportScheduleExecutionsData &&
      !loadingActiveExportScheduleData ? (
        <>
          {(dataExportScheduleExecutionsData?.data_export_schedule_execution
            ?.length ?? 0) > 0 ? (
            <Table
              {...tableProps}
              footer={false}
              header={<SpaceBetween size={'m'}></SpaceBetween>}
              variant={'embedded'}
              loading={loadingDataExportScheduleExecutionsData}
              trackBy={(c) => c.ExecutionTimestamp + c.ParentId}
            />
          ) : undefined}
          <div className={'mt-6 mb-4'}>
            {activeExportScheduleData?.data_export_schedule &&
            activeExportScheduleData.data_export_schedule.length > 0 ? (
              <Alert type={'warning'}>{t('activeScheduleInfoText')}</Alert>
            ) : (
              <Alert statusIconAriaLabel={'Info'}>
                {t('scheduleInfoText')}
              </Alert>
            )}
          </div>
          <ExpandableSection
            defaultExpanded={!hasScheduledExportConfigured}
            headerText={t('dataExportFormHeader')}
          >
            <DataExportForm onSave={onSave} />
          </ExpandableSection>
        </>
      ) : (
        <div className={'mt-6'}>
          <Spinner size={'big'} />
        </div>
      )}
    </>
  );
};

export default DataExportTab;
