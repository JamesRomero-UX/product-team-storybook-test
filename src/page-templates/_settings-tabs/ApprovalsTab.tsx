// Settings → Approvals tab
//
// Mirrors pages/settings/tabs/approvals/Tab.tsx + config.tsx.
//
// Production layout:
//   <Table {...tableProps}
//     header={<TabHeader actions={Add approval (primary)}>Approvals</TabHeader>}
//     variant='embedded'
//   />
//
// Production default-visible columns (config.tsx initialColumns):
//   ['ParentType', 'Workflow', 'Levels', 'CreatedByUser', 'CreatedAtTimestamp']

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';

type ApprovalRow = {
  Id: string;
  ParentType: string;
  Workflow: string;
  Levels: number;
  CreatedByUser: string;
  CreatedAtTimestamp: string;
};

// Sample rows match production approval workflows
// (packages/shared/src/approvals/workflows.ts): one global approval per
// workflow type, with realistic level counts.
const SAMPLE: ApprovalRow[] = [
  { Id: 'a-001', ParentType: 'Risk',            Workflow: 'Risk acceptance — Tier 1',         Levels: 3, CreatedByUser: 'Richard Poole',  CreatedAtTimestamp: '2025-09-12T10:24:00Z' },
  { Id: 'a-002', ParentType: 'Risk',            Workflow: 'Risk treatment — change request',  Levels: 2, CreatedByUser: 'Richard Poole',  CreatedAtTimestamp: '2025-09-12T10:32:00Z' },
  { Id: 'a-003', ParentType: 'Control',         Workflow: 'Control change request',           Levels: 2, CreatedByUser: 'Emma Bamford',   CreatedAtTimestamp: '2025-10-04T14:05:00Z' },
  { Id: 'a-004', ParentType: 'Obligation',      Workflow: 'New regulatory obligation',        Levels: 1, CreatedByUser: 'Liam Chen',      CreatedAtTimestamp: '2025-11-22T09:48:00Z' },
  { Id: 'a-005', ParentType: 'Policy document', Workflow: 'Policy publication',               Levels: 4, CreatedByUser: 'Emma Bamford',   CreatedAtTimestamp: '2026-01-14T16:22:00Z' },
  { Id: 'a-006', ParentType: 'Third party',     Workflow: 'Vendor onboarding',                Levels: 3, CreatedByUser: 'James Romero',   CreatedAtTimestamp: '2026-02-03T11:11:00Z' },
];

const COLUMNS = [
  {
    id: 'parentType',
    header: 'Parent type',
    cell: (a: ApprovalRow) => a.ParentType,
    sortingField: 'ParentType',
    minWidth: 160,
  },
  {
    id: 'workflow',
    header: 'Workflow',
    cell: (a: ApprovalRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {a.Workflow}
      </a>
    ),
    sortingField: 'Workflow',
    minWidth: 260,
  },
  {
    id: 'levels',
    header: 'Levels',
    cell: (a: ApprovalRow) => a.Levels,
    sortingField: 'Levels',
    minWidth: 80,
  },
  {
    id: 'createdBy',
    header: 'Created by',
    cell: (a: ApprovalRow) => a.CreatedByUser,
    sortingField: 'CreatedByUser',
    minWidth: 160,
  },
  {
    id: 'createdAt',
    header: 'Created on',
    cell: (a: ApprovalRow) => new Date(a.CreatedAtTimestamp).toLocaleString(),
    sortingField: 'CreatedAtTimestamp',
    minWidth: 180,
  },
];

const ApprovalsTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {} });

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'Id'}
      variant={'embedded'}
      loadingText={'Loading approvals'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button variant={'primary'}>{'Add approval'}</Button>
              </SpaceBetween>
            }
          >
            {'Approvals'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default ApprovalsTab;
