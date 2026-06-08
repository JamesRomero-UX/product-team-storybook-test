// Settings → Tags tab
//
// Mirrors pages/settings/tabs/tags/Tab.tsx + config.tsx.
//
// Production layout: identical structure to Departments tab —
//   <Table {...tableProps}
//     header={<TabHeader actions={Delete + Add + Export}>Tags</TabHeader>}
//     variant='embedded' selectionType='multi' trackBy='TagTypeId'
//   />
//
// Production default-visible columns (config.tsx initialColumns):
//   ['Name', 'Description', 'TagGroup']

import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useState } from 'react';

type TagRow = {
  TagTypeId: string;
  Name: string;
  Description: string;
  TagGroup: string;
};

const SAMPLE: TagRow[] = [
  { TagTypeId: 't-001', Name: 'Cyber',              Description: 'Cyber-related risks, controls, obligations',           TagGroup: 'Risk theme' },
  { TagTypeId: 't-002', Name: 'Operational',        Description: 'Day-to-day operational risk',                          TagGroup: 'Risk theme' },
  { TagTypeId: 't-003', Name: 'Regulatory',         Description: 'Tied to a specific regulator or rulebook',             TagGroup: 'Risk theme' },
  { TagTypeId: 't-004', Name: 'Financial Crime',    Description: 'AML, sanctions, fraud, market abuse',                  TagGroup: 'Risk theme' },
  { TagTypeId: 't-005', Name: 'High priority',      Description: 'Board-tracked — quarterly review minimum',              TagGroup: 'Priority' },
  { TagTypeId: 't-006', Name: 'Medium priority',    Description: 'Risk committee — half-yearly review',                   TagGroup: 'Priority' },
  { TagTypeId: 't-007', Name: 'Low priority',       Description: 'Annual cycle review',                                   TagGroup: 'Priority' },
  { TagTypeId: 't-008', Name: 'PRA',                Description: 'Prudential Regulation Authority',                       TagGroup: 'Regulator' },
  { TagTypeId: 't-009', Name: 'FCA',                Description: 'Financial Conduct Authority',                           TagGroup: 'Regulator' },
  { TagTypeId: 't-010', Name: 'ICO',                Description: 'Information Commissioner\'s Office (GDPR/UK DPA)',      TagGroup: 'Regulator' },
];

const COLUMNS = [
  {
    id: 'name',
    header: 'Name',
    cell: (t: TagRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {t.Name}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'Name',
    minWidth: 200,
  },
  {
    id: 'description',
    header: 'Description',
    cell: (t: TagRow) => t.Description,
    minWidth: 320,
  },
  {
    id: 'tagGroup',
    header: 'Tag group',
    cell: (t: TagRow) => t.TagGroup,
    sortingField: 'TagGroup',
    minWidth: 160,
  },
];

const TagsTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {}, selection: {} });
  const [selected, setSelected] = useState<TagRow[]>([]);

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'TagTypeId'}
      variant={'embedded'}
      selectionType={'multi'}
      selectedItems={selected}
      onSelectionChange={({ detail }) => setSelected(detail.selectedItems as TagRow[])}
      loadingText={'Loading tags'}
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
            {'Tags'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default TagsTab;
