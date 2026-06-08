// Settings → Data export tab
//
// Mirrors pages/settings/tabs/data-export/Tab.tsx.
//
// Production layout:
//   <TabHeader actions={Test schedule button when active}>Data export</TabHeader>
//   [Optional Alert — error / success]
//   <Table {...executionsTableProps} variant='embedded' />
//   <Alert>Schedule info / active</Alert>
//   <ExpandableSection headerText='Configure schedule'>
//     <DataExportForm onSave={onSave} />
//   </ExpandableSection>
//
// The DataExportForm has many branches per StorageType (S3 / Azure
// Blob / SharePoint / SFTP). We show a simplified Storage type select +
// the S3 branch fields as a representative example. Real form is
// lifted in a follow-up step if needed.

import Alert from '@risk-smart/themed-cloudscape-components/alert';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { useState } from 'react';

type ExecutionRow = {
  ParentId: string;
  ExecutionTimestamp: string;
  Status: 'Completed' | 'Failed' | 'Running';
  Type: 'Scheduled' | 'Test' | 'One-off';
  Records: number;
};

const SAMPLE_EXECUTIONS: ExecutionRow[] = [
  { ParentId: 'exec-1', ExecutionTimestamp: '2026-05-13 02:00', Status: 'Completed', Type: 'Scheduled', Records: 12_482 },
  { ParentId: 'exec-2', ExecutionTimestamp: '2026-05-12 14:38', Status: 'Completed', Type: 'Test',      Records: 12_460 },
  { ParentId: 'exec-3', ExecutionTimestamp: '2026-05-12 02:00', Status: 'Completed', Type: 'Scheduled', Records: 12_460 },
  { ParentId: 'exec-4', ExecutionTimestamp: '2026-05-11 02:00', Status: 'Failed',    Type: 'Scheduled', Records: 0 },
  { ParentId: 'exec-5', ExecutionTimestamp: '2026-05-10 02:00', Status: 'Completed', Type: 'Scheduled', Records: 12_401 },
];

const COLUMNS = [
  { id: 'time',    header: 'Executed at', cell: (e: ExecutionRow) => e.ExecutionTimestamp, isRowHeader: true, sortingField: 'ExecutionTimestamp', minWidth: 180 },
  { id: 'type',    header: 'Type',        cell: (e: ExecutionRow) => e.Type,                                    sortingField: 'Type',               minWidth: 120 },
  { id: 'status',  header: 'Status',      cell: (e: ExecutionRow) => e.Status,                                  sortingField: 'Status',             minWidth: 120 },
  { id: 'records', header: 'Records',     cell: (e: ExecutionRow) => e.Records.toLocaleString(),                sortingField: 'Records',            minWidth: 100 },
];

const STORAGE_OPTIONS = [
  { label: 'AWS S3',           value: 's3' },
  { label: 'Azure Blob',       value: 'azure_blob' },
  { label: 'SharePoint',       value: 'sharepoint' },
  { label: 'SFTP',             value: 'sftp' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Daily',     value: 'daily' },
  { label: 'Weekly',    value: 'weekly' },
  { label: 'Monthly',   value: 'monthly' },
];

const DataExportTab = () => {
  const collection = useCollection(SAMPLE_EXECUTIONS, { sorting: {} });
  const [storage, setStorage] = useState(STORAGE_OPTIONS[0]);
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[1]);

  return (
    <>
      <TabHeader
        actions={
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button>{'Trigger test export'}</Button>
          </SpaceBetween>
        }
      >
        {'Data export'}
      </TabHeader>

      <div className={'mt-4'}>
        <Table
          {...collection.collectionProps}
          items={collection.items}
          columnDefinitions={COLUMNS as any}
          variant={'embedded'}
          trackBy={(e: ExecutionRow) => e.ParentId + e.ExecutionTimestamp}
          loadingText={'Loading executions'}
          empty={'No executions yet.'}
          header={<SpaceBetween size={'m'}></SpaceBetween>}
        />
      </div>

      <div className={'mt-6 mb-4'}>
        <Alert type={'warning'}>
          {'A schedule is already configured. Saving below will replace it.'}
        </Alert>
      </div>

      <ExpandableSection
        defaultExpanded={false}
        headerText={'Configure schedule'}
      >
        <SpaceBetween size={'m'}>
          <FormField label={'Storage type'}>
            <Select
              selectedOption={storage as any}
              onChange={({ detail }) =>
                setStorage(detail.selectedOption as any)
              }
              options={STORAGE_OPTIONS as any}
            />
          </FormField>
          <FormField label={'Frequency'}>
            <Select
              selectedOption={frequency as any}
              onChange={({ detail }) =>
                setFrequency(detail.selectedOption as any)
              }
              options={FREQUENCY_OPTIONS as any}
            />
          </FormField>
          {storage.value === 's3' && (
            <>
              <FormField label={'Bucket name'}>
                <Input value={'risksmart-exports-acme'} onChange={() => undefined} />
              </FormField>
              <FormField label={'S3 folder'}>
                <Input value={'2026/'} onChange={() => undefined} />
              </FormField>
              <FormField label={'Access key'}>
                <Input value={'AKIA********'} onChange={() => undefined} />
              </FormField>
              <FormField label={'Secret access key'}>
                <Input value={'••••••••••••'} type={'password'} onChange={() => undefined} />
              </FormField>
            </>
          )}
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'primary'}>{'Save'}</Button>
            <Button>{'Cancel'}</Button>
          </SpaceBetween>
        </SpaceBetween>
      </ExpandableSection>
    </>
  );
};

export default DataExportTab;
