// Settings → User groups tab
//
// Mirrors pages/settings/tabs/groups/Tab.tsx + config.tsx.
//
// Production layout:
//   <Table
//     {...tableProps}             // multi-select, columns from config.tsx
//     header={<TabHeader actions={Delete + Add + Export}>Groups</TabHeader>}
//     variant='embedded'
//     selectionType='multi'
//     trackBy='Id'
//   />
//
// Production default-visible columns (config.tsx initialColumns):
//   ['Name', 'Description', 'UserCount', 'Email']
//
// "Delete" is disabled until at least one row is selected (production
// behaviour — we wire the same here through controlled selection).

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useState } from 'react';

type GroupRow = {
  Id: string;
  Name: string;
  Description: string;
  UserCount: number;
  Email: string;
};

// Sample data mirrors GetUserGroupsWithApproversQuery['user_group'] shape
// flattened by config.tsx's labelledFields step.
const SAMPLE: GroupRow[] = [
  { Id: 'g1', Name: 'Risk team',     Description: 'Owns the operational and enterprise risk registers',                 UserCount: 8,  Email: 'risk-team@risksmart.com' },
  { Id: 'g2', Name: 'Approvers',     Description: 'Tier-1 approval chain for risks, controls and acceptances',          UserCount: 5,  Email: 'approvers@risksmart.com' },
  { Id: 'g3', Name: 'Compliance',    Description: 'Regulatory monitoring + obligation owners',                          UserCount: 6,  Email: 'compliance@risksmart.com' },
  { Id: 'g4', Name: 'Audit',         Description: 'Internal audit team — read access to controls + test results',       UserCount: 4,  Email: 'audit@risksmart.com' },
  { Id: 'g5', Name: 'Exec',          Description: 'Board-level executive oversight (CEO, CRO, CTO)',                    UserCount: 3,  Email: 'exec@risksmart.com' },
  { Id: 'g6', Name: 'Product',       Description: 'Product and design — read access for usage analytics',                UserCount: 4,  Email: 'product@risksmart.com' },
  { Id: 'g7', Name: 'Read-only',     Description: 'Auditor / examiner accounts — no edit rights',                       UserCount: 12, Email: 'read-only@risksmart.com' },
  { Id: 'g8', Name: 'Third-party',   Description: 'Vendor respondents — limited to assigned questionnaires',            UserCount: 24, Email: '' },
];

const COLUMNS = [
  {
    id: 'name',
    header: 'Name',
    cell: (g: GroupRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {g.Name}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'Name',
    minWidth: 160,
  },
  {
    id: 'description',
    header: 'Description',
    cell: (g: GroupRow) => g.Description,
    minWidth: 280,
  },
  {
    id: 'userCount',
    header: 'Members',
    cell: (g: GroupRow) => g.UserCount,
    sortingField: 'UserCount',
    minWidth: 100,
  },
  {
    id: 'email',
    header: 'Email',
    cell: (g: GroupRow) => g.Email || '—',
    sortingField: 'Email',
    minWidth: 200,
  },
];

const GroupsTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {}, selection: {} });
  const [selected, setSelected] = useState<GroupRow[]>([]);

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'Id'}
      variant={'embedded'}
      selectionType={'multi'}
      selectedItems={selected}
      onSelectionChange={({ detail }) => setSelected(detail.selectedItems as GroupRow[])}
      loadingText={'Loading groups'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button disabled={selected.length === 0}>{'Delete'}</Button>
                <Button variant={'primary'}>{'Add'}</Button>
                <Button iconName={'download'}>{'Export'}</Button>
              </SpaceBetween>
            }
          >
            {'Groups'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default GroupsTab;
