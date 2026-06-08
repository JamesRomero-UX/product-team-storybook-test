// Settings → Departments tab
//
// Mirrors pages/settings/tabs/departments/Tab.tsx + config.tsx.
//
// Production layout:
//   <Table {...tableProps}
//     header={<TabHeader actions={Delete (selection-gated) + Add (primary) + Export}>Departments</TabHeader>}
//     variant='embedded' selectionType='multi' trackBy='DepartmentTypeId'
//   />
//
// Production default-visible columns (config.tsx initialColumns):
//   ['Name', 'Description', 'DepartmentGroup']

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useState } from 'react';

type DepartmentRow = {
  DepartmentTypeId: string;
  Name: string;
  Description: string;
  DepartmentGroup: string;
};

const SAMPLE: DepartmentRow[] = [
  { DepartmentTypeId: 'd-001', Name: 'Risk',              Description: 'First-line risk management',                    DepartmentGroup: 'First line' },
  { DepartmentTypeId: 'd-002', Name: 'Compliance',        Description: 'Regulatory compliance + monitoring',            DepartmentGroup: 'Second line' },
  { DepartmentTypeId: 'd-003', Name: 'Internal Audit',    Description: 'Independent assurance, board-reporting',        DepartmentGroup: 'Third line' },
  { DepartmentTypeId: 'd-004', Name: 'Finance',           Description: 'Treasury, controlling, financial reporting',    DepartmentGroup: 'First line' },
  { DepartmentTypeId: 'd-005', Name: 'Operations',        Description: 'Customer ops, service delivery',                DepartmentGroup: 'First line' },
  { DepartmentTypeId: 'd-006', Name: 'Technology',        Description: 'Engineering, infrastructure, security ops',     DepartmentGroup: 'First line' },
  { DepartmentTypeId: 'd-007', Name: 'Information Security', Description: 'CISO function, security policy + governance',  DepartmentGroup: 'Second line' },
  { DepartmentTypeId: 'd-008', Name: 'Legal',             Description: 'Contracts, regulatory advice, dispute resolution', DepartmentGroup: 'Second line' },
  { DepartmentTypeId: 'd-009', Name: 'People',            Description: 'HR, talent, internal training programmes',      DepartmentGroup: 'First line' },
];

const COLUMNS = [
  {
    id: 'name',
    header: 'Name',
    cell: (d: DepartmentRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {d.Name}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'Name',
    minWidth: 200,
  },
  {
    id: 'description',
    header: 'Description',
    cell: (d: DepartmentRow) => d.Description,
    minWidth: 300,
  },
  {
    id: 'departmentGroup',
    header: 'Department group',
    cell: (d: DepartmentRow) => d.DepartmentGroup,
    sortingField: 'DepartmentGroup',
    minWidth: 160,
  },
];

const DepartmentsTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {}, selection: {} });
  const [selected, setSelected] = useState<DepartmentRow[]>([]);

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'DepartmentTypeId'}
      variant={'embedded'}
      selectionType={'multi'}
      selectedItems={selected}
      onSelectionChange={({ detail }) => setSelected(detail.selectedItems as DepartmentRow[])}
      loadingText={'Loading departments'}
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
            {'Departments'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default DepartmentsTab;
