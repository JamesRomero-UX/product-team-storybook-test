// Settings → Audit tab
//
// Mirrors pages/settings/tabs/audit/Tab.tsx + config.tsx.
//
// Production layout:
//   <Table {...tableProps}
//     header={<SpaceBetween size='m'><TabHeader>{auditTableTitle}</TabHeader></SpaceBetween>}
//     variant='embedded'
//   />
//   <Modal>{AuditEntityRetriever for clicked row}</Modal>
//
// No actions in TabHeader. Default sort: insertedAt desc. Clicking
// a row link opens the entity-history modal (production behaviour).
// Here we render the rows + sort, and stub the modal as a no-op.

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';

type AuditRow = {
  Id: string;
  ActionedAt: string;
  ActionedBy: string;
  Action: 'create' | 'update' | 'delete' | 'login' | 'export';
  Entity: string;
  EntityId: string;
  Source: 'web' | 'api' | 'system';
};

const SAMPLE: AuditRow[] = [
  { Id: 'a-9001', ActionedAt: '2026-05-13 11:42', ActionedBy: 'james.romero@acme.com',   Action: 'update', Entity: 'Risk',         EntityId: 'r-481',  Source: 'web' },
  { Id: 'a-9000', ActionedAt: '2026-05-13 11:38', ActionedBy: 'aisha.patel@acme.com',    Action: 'create', Entity: 'Control',      EntityId: 'c-902',  Source: 'web' },
  { Id: 'a-8999', ActionedAt: '2026-05-13 11:24', ActionedBy: 'system',                  Action: 'export', Entity: 'Risk',         EntityId: '-',      Source: 'system' },
  { Id: 'a-8998', ActionedAt: '2026-05-13 10:58', ActionedBy: 'mei.ling@acme.com',       Action: 'login',  Entity: 'User',         EntityId: 'u-22',   Source: 'web' },
  { Id: 'a-8997', ActionedAt: '2026-05-13 10:32', ActionedBy: 'diego.alvarez@acme.com',  Action: 'update', Entity: 'Obligation',   EntityId: 'o-127',  Source: 'web' },
  { Id: 'a-8996', ActionedAt: '2026-05-13 10:11', ActionedBy: 'workato-svc',             Action: 'create', Entity: 'Issue',        EntityId: 'i-303',  Source: 'api' },
  { Id: 'a-8995', ActionedAt: '2026-05-13 09:48', ActionedBy: 'tariq.ahmed@acme.com',    Action: 'delete', Entity: 'Tag',          EntityId: 't-004',  Source: 'web' },
  { Id: 'a-8994', ActionedAt: '2026-05-13 09:30', ActionedBy: 'hannah.obrien@acme.com',  Action: 'update', Entity: 'Policy',       EntityId: 'p-15',   Source: 'web' },
  { Id: 'a-8993', ActionedAt: '2026-05-13 09:02', ActionedBy: 'james.romero@acme.com',   Action: 'create', Entity: 'Risk',         EntityId: 'r-482',  Source: 'web' },
  { Id: 'a-8992', ActionedAt: '2026-05-13 08:47', ActionedBy: 'sara.holm@acme.com',      Action: 'update', Entity: 'Audit',        EntityId: 'au-12',  Source: 'web' },
  { Id: 'a-8991', ActionedAt: '2026-05-13 08:15', ActionedBy: 'yuki.tanaka@acme.com',    Action: 'login',  Entity: 'User',         EntityId: 'u-44',   Source: 'web' },
  { Id: 'a-8990', ActionedAt: '2026-05-13 07:58', ActionedBy: 'system',                  Action: 'create', Entity: 'Notification', EntityId: 'n-001',  Source: 'system' },
];

const COLUMNS = [
  {
    id: 'time',
    header: 'When',
    cell: (r: AuditRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
      >
        {r.ActionedAt}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'ActionedAt',
    minWidth: 170,
  },
  { id: 'who',      header: 'Actioned by', cell: (r: AuditRow) => r.ActionedBy, sortingField: 'ActionedBy', minWidth: 220 },
  { id: 'action',   header: 'Action',      cell: (r: AuditRow) => r.Action,     sortingField: 'Action',     minWidth: 100 },
  { id: 'entity',   header: 'Entity',      cell: (r: AuditRow) => r.Entity,     sortingField: 'Entity',     minWidth: 140 },
  { id: 'entityId', header: 'Entity ID',   cell: (r: AuditRow) => (
      <span className={'font-mono text-sm'}>{r.EntityId}</span>
    ), sortingField: 'EntityId', minWidth: 120 },
  { id: 'source',   header: 'Source',      cell: (r: AuditRow) => r.Source,     sortingField: 'Source',     minWidth: 100 },
];

const AuditTab = () => {
  const collection = useCollection(SAMPLE, {
    sorting: {
      defaultState: {
        sortingColumn: { sortingField: 'ActionedAt' } as any,
        isDescending: true,
      },
    },
  });

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'Id'}
      variant={'embedded'}
      loadingText={'Loading audit log'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader>{'Audit log'}</TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default AuditTab;
