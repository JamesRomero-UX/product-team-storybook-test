// Settings → Custom roles tab
//
// Mirrors pages/settings/tabs/custom-roles/Tab.tsx + config.tsx.
//
// Production layout:
//   <Table {...tableProps}
//     header={<TabHeader actions={Add (primary) + Export}>Custom roles</TabHeader>}
//     variant='embedded' trackBy='Id'
//   />
//
// Production default-visible columns (config.tsx initialColumns):
//   ['RoleName', 'Description', 'MemberCount']

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';

type CustomRoleRow = {
  Id: string;
  RoleName: string;
  Description: string;
  MemberCount: number;
};

const SAMPLE: CustomRoleRow[] = [
  { Id: 'cr-001', RoleName: 'Risk Auditor',           Description: 'Read-only access to risks, controls and test results across all entities',                   MemberCount: 4 },
  { Id: 'cr-002', RoleName: 'Compliance Lead',        Description: 'Full edit on obligations + monitoring assessments; read on risks',                           MemberCount: 2 },
  { Id: 'cr-003', RoleName: 'Risk Manager — Tier 1',  Description: 'Edit risks, controls, acceptances at the top of the hierarchy. Approver on all assessments',  MemberCount: 3 },
  { Id: 'cr-004', RoleName: 'BU Risk Champion',       Description: 'Edit risks within their business unit. Read-only outside it.',                                MemberCount: 11 },
  { Id: 'cr-005', RoleName: 'Vendor Reviewer',        Description: 'Approve / reject third-party questionnaire responses. No risk editing.',                      MemberCount: 5 },
  { Id: 'cr-006', RoleName: 'Read-only Auditor',      Description: 'External examiner — full read across modules, zero write permissions.',                        MemberCount: 8 },
];

const COLUMNS = [
  {
    id: 'roleName',
    header: 'Role name',
    cell: (r: CustomRoleRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {r.RoleName}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'RoleName',
    minWidth: 220,
  },
  {
    id: 'description',
    header: 'Description',
    cell: (r: CustomRoleRow) => r.Description,
    minWidth: 320,
  },
  {
    id: 'memberCount',
    header: 'Members',
    cell: (r: CustomRoleRow) => r.MemberCount,
    sortingField: 'MemberCount',
    minWidth: 100,
  },
];

const CustomRolesTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {} });

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'Id'}
      variant={'embedded'}
      loadingText={'Loading custom roles'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button variant={'primary'}>{'Add'}</Button>
                <Button iconName={'download'}>{'Export'}</Button>
              </SpaceBetween>
            }
          >
            {'Custom roles'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default CustomRolesTab;
