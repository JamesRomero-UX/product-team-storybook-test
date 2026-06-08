import {
  DataExportFrequency,
  DataExportStorageType,
} from '@risksmart-app/domain/src/types/consts';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledSelect from 'src/components/form/controlled-select';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';

import type { DataExportFormDataFields } from './dataExportSchema';
import { TestIds } from './types';

const DataExportFormFields: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'dataExport' });

  const frequencyOptions: {
    value: DataExportFrequency;
    label: string;
  }[] = [
    {
      value: DataExportFrequency.Daily,
      label: t('frequencyLabelDaily'),
    },
    {
      value: DataExportFrequency.Weekly,
      label: t('frequencyLabelWeekly'),
    },
    {
      value: DataExportFrequency.Monthly,
      label: t('frequencyLabelMonthly'),
    },
  ];
  const storageTypeOptions: {
    value: DataExportStorageType;
    label: string;
  }[] = [
    {
      value: DataExportStorageType.Sftp,
      label: t('storageTypeLabelSftp'),
    },
    {
      value: DataExportStorageType.MsSharePoint,
      label: t('storageTypeLabelSharePoint'),
    },
  ];

  const { control, reset, watch, trigger } =
    useFormContext<DataExportFormDataFields>();
  const [StorageTypeFieldValue] = watch([
    'StorageType',
    'StartDate',
    'EndDate',
  ]);

  return (
    <>
      <ControlledSelect
        stretch={false}
        forceRequired={true}
        testId={TestIds.Frequency}
        key={'frequency'}
        name={'Frequency'}
        label={t('formFieldFrequency')}
        options={frequencyOptions}
        control={control}
        description={[
          {
            title: t('frequencyLabelDaily'),
            content: t('frequencyTooltipDaily'),
          },
          {
            title: t('frequencyLabelWeekly'),
            content: t('frequencyTooltipWeekly'),
          },
          {
            title: t('frequencyLabelMonthly'),
            content: t('frequencyTooltipMonthly'),
          },
        ]}
        onChange={() => {
          const startDate = watch('StartDate');
          if (startDate) {
            trigger(['StartDate', 'EndDate']); // check date interval is valid
          }
        }}
      />

      <ControlledDatePicker
        testId={TestIds.StartDate}
        key={'startDate'}
        name={'StartDate'}
        label={t('formFieldStartDate')}
        control={control}
        onChange={() => {
          trigger('EndDate'); // check date interval is still valid
        }}
      />
      <ControlledDatePicker
        key={'endDate'}
        testId={TestIds.EndDate}
        name={'EndDate'}
        label={t('formFieldEndDate')}
        control={control}
        onChange={() => {
          trigger('StartDate'); // check date interval is still valid
        }}
      />
      <ConditionalField condition={true} key={'storageTypeFields'}>
        <ControlledSelect
          stretch={false}
          forceRequired={true}
          testId={TestIds.StorageType}
          key={'storageType'}
          name={'StorageType'}
          label={t('formFieldStorageType')}
          options={storageTypeOptions}
          control={control}
          onChange={() => {
            const fieldValues: DataExportFormDataFields = watch();

            reset({
              ...fieldValues,
              SasToken: undefined,
              AccountName: undefined,
              ContainerName: undefined,
              BucketName: undefined,
              S3Folder: undefined,
              AccessKey: undefined,
              SecretAccessKey: undefined,
              Hostname: undefined,
              Port: undefined,
              Username: undefined,
              Password: undefined,
              SftpFolder: undefined,
              EntraSecretValue: undefined,
              EntraTenantId: undefined,
              EntraClientId: undefined,
              SharePointSiteId: undefined,
              SharePointDriveId: undefined,
              SPFolder: undefined,
            });
          }}
        />
      </ConditionalField>

      <ConditionalField
        condition={
          StorageTypeFieldValue === DataExportStorageType.AzureBlobStorage
        }
        key={'azureFields'}
      >
        <ControlledInput
          type={'password'}
          stretch={false}
          forceRequired={true}
          testId={TestIds.SasToken}
          key={'sasToken'}
          name={'SasToken'}
          label={t('formFieldSasToken')}
          control={control}
          placeholder={t('placeholderSasToken')}
        />
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.AccountName}
          key={'accountName'}
          name={'AccountName'}
          label={t('formFieldAccountName')}
          control={control}
          placeholder={t('placeholderAccountName')}
        />
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.ContainerName}
          key={'containerName'}
          name={'ContainerName'}
          label={t('formFieldContainerName')}
          control={control}
          placeholder={t('placeholderContainerName')}
        />
      </ConditionalField>

      <ConditionalField
        condition={StorageTypeFieldValue === DataExportStorageType.AmazonS3}
        key={'amazonFields'}
      >
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.BucketName}
          key={'bucketName'}
          name={'BucketName'}
          label={t('formFieldBucketName')}
          control={control}
          placeholder={t('placeholderBucketName')}
        />
        <ControlledInput
          stretch={false}
          testId={TestIds.S3Folder}
          key={'s3Folder'}
          name={'S3Folder'}
          label={t('formFieldS3Folder')}
          control={control}
          placeholder={t('placeholderS3Folder')}
        />
        <ControlledInput
          type={'password'}
          stretch={false}
          forceRequired={true}
          testId={TestIds.AccessKey}
          key={'accessKey'}
          name={'AccessKey'}
          label={t('formFieldAccessKey')}
          control={control}
          placeholder={t('placeholderAccessKey')}
        />
        <ControlledInput
          type={'password'}
          stretch={false}
          forceRequired={true}
          testId={TestIds.SecretAccessKey}
          key={'secretAccessKey'}
          name={'SecretAccessKey'}
          label={t('formFieldSecretAccessKey')}
          control={control}
          placeholder={t('placeholderSecretAccessKey')}
        />
      </ConditionalField>

      <ConditionalField
        condition={StorageTypeFieldValue === DataExportStorageType.Sftp}
        key={'sftpFields'}
      >
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.Hostname}
          key={'hostname'}
          name={'Hostname'}
          label={t('formFieldHostname')}
          control={control}
          placeholder={t('placeholderHostname')}
        />
        <ControlledInput
          type={'number'}
          stretch={false}
          forceRequired={true}
          testId={TestIds.Port}
          key={'port'}
          name={'Port'}
          label={t('formFieldPort')}
          control={control}
          placeholder={t('placeholderPort')}
        />
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.Username}
          key={'username'}
          name={'Username'}
          label={t('formFieldUsername')}
          control={control}
          placeholder={t('placeholderUsername')}
        />
        <ControlledInput
          type={'password'}
          stretch={false}
          forceRequired={true}
          testId={TestIds.Password}
          key={'password'}
          name={'Password'}
          label={t('formFieldPassword')}
          control={control}
          placeholder={t('placeholderPassword')}
        />
        <ControlledInput
          stretch={false}
          testId={TestIds.SftpFolder}
          key={'sftpFolder'}
          name={'SftpFolder'}
          label={t('formFieldSftpFolder')}
          control={control}
          placeholder={t('placeholderSftpFolder')}
        />
      </ConditionalField>

      <ConditionalField
        condition={StorageTypeFieldValue === DataExportStorageType.MsSharePoint}
        key={'sharePointFields'}
      >
        <ControlledInput
          type={'password'}
          stretch={false}
          forceRequired={true}
          testId={TestIds.EntraSecretValue}
          key={'entraSecretValue'}
          name={'EntraSecretValue'}
          label={t('formFieldEntraSecretValue')}
          control={control}
          placeholder={t('placeholderEntraSecretValue')}
        />
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.EntraTenantId}
          key={'entraTenantId'}
          name={'EntraTenantId'}
          label={t('formFieldEntraTenantId')}
          control={control}
          placeholder={t('placeholderEntraTenantId')}
        />
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.EntraClientId}
          key={'entraClientId'}
          name={'EntraClientId'}
          label={t('formFieldEntraClientId')}
          control={control}
          placeholder={t('placeholderEntraClientId')}
        />
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.SharePointSiteId}
          key={'sharePointSiteId'}
          name={'SharePointSiteId'}
          label={t('formFieldSharePointSiteId')}
          control={control}
          placeholder={t('placeholderSharePointSiteId')}
        />
        <ControlledInput
          stretch={false}
          forceRequired={true}
          testId={TestIds.SharePointDriveId}
          key={'sharePointDriveId'}
          name={'SharePointDriveId'}
          label={t('formFieldSharePointDriveId')}
          control={control}
          placeholder={t('placeholderSharePointDriveId')}
        />
        <ControlledInput
          stretch={false}
          testId={TestIds.SPFolder}
          key={'spFolder'}
          name={'SPFolder'}
          label={t('formFieldSPFolder')}
          control={control}
          placeholder={t('placeholderSPFolder')}
        />
      </ConditionalField>
    </>
  );
};

export default DataExportFormFields;
