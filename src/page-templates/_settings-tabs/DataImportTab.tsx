// Settings → Data import tab
//
// Mirrors pages/settings/tabs/data-import/Tab.tsx + the table config in
// pages/data-import/config.tsx.
//
// Production layout:
//   <Table {...tableProps}
//     header={<TabHeader actions={<Button variant='primary' href='add'>Create new</Button>}>Data imports</TabHeader>}
//     variant='embedded' trackBy='Id' />
//
// Production initialColumns (from config.tsx):
//   ['Id', 'StatusLabel', ...] — we use a representative column set.

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';

type ImportRow = {
  Id: string;
  Type: string;
  StatusLabel: 'Completed' | 'Failed' | 'In progress' | 'Pending';
  RecordsCount: number;
  CreatedBy: string;
  CreatedAt: string;
};

const SAMPLE: ImportRow[] = [
  { Id: 'imp-2042', Type: 'Risks',         StatusLabel: 'Completed',   RecordsCount: 482, CreatedBy: 'James Romero',  CreatedAt: '2026-05-13 11:24' },
  { Id: 'imp-2041', Type: 'Controls',      StatusLabel: 'Completed',   RecordsCount: 311, CreatedBy: 'Aisha Patel',   CreatedAt: '2026-05-12 16:08' },
  { Id: 'imp-2040', Type: 'Obligations',   StatusLabel: 'In progress', RecordsCount: 128, CreatedBy: 'Mei Ling',      CreatedAt: '2026-05-12 14:55' },
  { Id: 'imp-2039', Type: 'Third parties', StatusLabel: 'Failed',      RecordsCount: 0,   CreatedBy: 'Diego Alvarez', CreatedAt: '2026-05-12 09:11' },
  { Id: 'imp-2038', Type: 'Policies',      StatusLabel: 'Completed',   RecordsCount: 42,  CreatedBy: 'Tariq Ahmed',   CreatedAt: '2026-05-11 17:30' },
  { Id: 'imp-2037', Type: 'Users',         StatusLabel: 'Pending',     RecordsCount: 1240,CreatedBy: 'Hannah O\'Brien',CreatedAt: '2026-05-11 09:00' },
];

const statusType = (s: ImportRow['StatusLabel']) => {
  if (s === 'Completed') return 'success';
  if (s === 'In progress') return 'in-progress';
  if (s === 'Failed') return 'error';

  return 'pending';
};

const COLUMNS = [
  {
    id: 'id',
    header: 'Import',
    cell: (r: ImportRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
      >
        {r.Id}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'Id',
    minWidth: 140,
  },
  { id: 'type',    header: 'Type',     cell: (r: ImportRow) => r.Type,                                       sortingField: 'Type',         minWidth: 160 },
  {
    id: 'status',
    header: 'Status',
    cell: (r: ImportRow) => (
      <StatusIndicator type={statusType(r.StatusLabel) as any}>{r.StatusLabel}</StatusIndicator>
    ),
    sortingField: 'StatusLabel',
    minWidth: 140,
  },
  { id: 'records', header: 'Records',  cell: (r: ImportRow) => r.RecordsCount.toLocaleString(),               sortingField: 'RecordsCount', minWidth: 100 },
  { id: 'createdBy', header: 'Created by', cell: (r: ImportRow) => r.CreatedBy,                                sortingField: 'CreatedBy',    minWidth: 160 },
  { id: 'createdAt', header: 'Created at', cell: (r: ImportRow) => r.CreatedAt,                                sortingField: 'CreatedAt',    minWidth: 160 },
];

const DataImportTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {} });

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'Id'}
      variant={'embedded'}
      loadingText={'Loading imports'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button variant={'primary'}>{'Create new'}</Button>
              </SpaceBetween>
            }
          >
            {'Data imports'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default DataImportTab;
