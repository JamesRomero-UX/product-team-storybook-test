// Settings → Users tab
//
// Composed from the same production pieces our validated TablePage
// uses, mirroring pages/settings/tabs/users/Tab.tsx + config.tsx.
//
// Lifts:
//   @risksmart-app/components/src/table         ← production Table wrapper (Sora font)
//   @risksmart-app/components/src/button        ← production Button
//   src/components/tab-header                   ← TabHeader with actions slot
//   src/components/badge-list                   ← UserGroups column
//
// Production column defaults (from config.tsx initialColumns):
//   ['Name', 'Email', 'Status', 'RoleKey', 'LastSeen', 'UserGroups']
//
// Header actions live INSIDE the table header (via TabHeader actions
// slot), NOT in the page-level PageLayout actions slot. Production
// only puts a page-level action on Data Export.

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import BadgeList from 'src/components/badge-list';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';

type UserRow = {
  Id: string;
  Name: string;
  Email: string;
  Status: 'Active' | 'Invited' | 'Disabled';
  RoleKey: string;
  LastSeen: string;
  UserGroups: string[];
};

// Sample data shaped like auth_user GraphQL response (real field names).
const SAMPLE: UserRow[] = [
  { Id: 'u1', Name: 'Emma Bamford',   Email: 'emma.bamford@risksmart.com',   Status: 'Active',   RoleKey: 'RiskManager', LastSeen: '2026-05-12T09:23:00Z', UserGroups: ['Risk team', 'Approvers'] },
  { Id: 'u2', Name: 'Richard Poole',  Email: 'richard.poole@risksmart.com',  Status: 'Active',   RoleKey: 'Standard',    LastSeen: '2026-05-12T08:11:00Z', UserGroups: ['Exec', 'Approvers'] },
  { Id: 'u3', Name: 'James Romero',   Email: 'james.romero@risksmart.com',   Status: 'Active',   RoleKey: 'Standard',    LastSeen: '2026-05-12T07:48:00Z', UserGroups: ['Product'] },
  { Id: 'u4', Name: 'Liam Chen',      Email: 'liam.chen@risksmart.com',      Status: 'Active',   RoleKey: 'Standard',    LastSeen: '2026-05-11T17:02:00Z', UserGroups: ['Compliance'] },
  { Id: 'u5', Name: 'Maya Okafor',    Email: 'maya.okafor@risksmart.com',    Status: 'Invited',  RoleKey: 'Standard',    LastSeen: '',                       UserGroups: [] },
  { Id: 'u6', Name: 'Aiko Tanaka',    Email: 'aiko.tanaka@risksmart.com',    Status: 'Active',   RoleKey: 'InternalAudit', LastSeen: '2026-05-10T22:14:00Z', UserGroups: ['Audit'] },
  { Id: 'u7', Name: 'Oliver Hayes',   Email: 'oliver.hayes@risksmart.com',   Status: 'Disabled', RoleKey: 'ReadOnly',    LastSeen: '2025-12-04T11:30:00Z', UserGroups: ['Read-only'] },
];

// Column definitions match the production default-visible set
// (config.tsx initialColumns: ['Name', 'Email', 'Status', 'RoleKey',
// 'LastSeen', 'UserGroups']). Name is the row header link.
const COLUMNS = [
  {
    id: 'name',
    header: 'Display name',
    cell: (u: UserRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {u.Name}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'Name',
    minWidth: 180,
  },
  {
    id: 'email',
    header: 'Email',
    cell: (u: UserRow) => u.Email,
    sortingField: 'Email',
    minWidth: 200,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (u: UserRow) => u.Status,
    sortingField: 'Status',
    minWidth: 100,
  },
  {
    id: 'role',
    header: 'Role',
    cell: (u: UserRow) => u.RoleKey,
    sortingField: 'RoleKey',
    minWidth: 140,
  },
  {
    id: 'lastSeen',
    header: 'Last seen',
    cell: (u: UserRow) => (u.LastSeen ? new Date(u.LastSeen).toLocaleString() : '—'),
    sortingField: 'LastSeen',
    minWidth: 180,
  },
  {
    id: 'userGroups',
    header: 'User groups',
    cell: (u: UserRow) =>
      u.UserGroups.length > 0 ? <BadgeList badges={u.UserGroups} /> : '—',
    minWidth: 180,
  },
];

// ─── Users tab body ──────────────────────────────────────────────────
//
// Production: pages/settings/tabs/users/Tab.tsx lines 58–89.
//   <Table
//     {...tableProps}
//     header={<SpaceBetween size='m'>
//       <TabHeader actions={<SpaceBetween direction='horizontal' size='xs'>
//         <Permission permission='read:settings'>
//           <Button onClick={openPrefs}>Notification settings</Button>
//         </Permission>
//         <Button iconName='download' onClick={exportToCsv}>Export</Button>
//       </SpaceBetween>}>
//         Users
//       </TabHeader>
//     </SpaceBetween>}
//     variant='embedded'
//     loading
//     trackBy='Id'
//   />
const UsersTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {}, selection: {} });

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'Id'}
      variant={'embedded'}
      loadingText={'Loading users'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button>{'Notification settings'}</Button>
                <Button iconName={'download'}>{'Export'}</Button>
              </SpaceBetween>
            }
          >
            {'Users'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default UsersTab;
