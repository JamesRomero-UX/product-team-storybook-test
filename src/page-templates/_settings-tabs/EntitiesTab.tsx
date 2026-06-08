// Settings → Entities tab
//
// Mirrors pages/settings/tabs/entities/Tab.tsx + config.tsx.
//
// Production layout:
//   <Table {...tableProps}
//     expandableRows={...}                 // hierarchy: parent → children
//     header={<TabHeader actions={Add (primary)}>Entities</TabHeader>}
//     variant='embedded' trackBy='Id'
//   />
//
// Production default-visible columns (config.tsx initialColumns):
//   ['Name', 'ParentTitle', 'Description', 'Weight', 'allOwners']
//
// Distinctive feature: entities form a tree (parent / child). Cloudscape
// Table's expandableRows prop is used to render the hierarchy with
// disclosure arrows.

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
import { useMemo, useState } from 'react';

type EntityRow = {
  Id: string;
  Name: string;
  ParentId: string | null;
  ParentTitle: string | null;
  Description: string;
  Weight: number;
  Owners: string[];
  children?: EntityRow[];
};

// Flat list — buildHierarchy nests by ParentId.
const FLAT: Omit<EntityRow, 'children'>[] = [
  { Id: 'e-001', Name: 'Risksmart Inc. (Group)',  ParentId: null,      ParentTitle: null,                  Description: 'Top-level parent entity for the entire group',     Weight: 1.00, Owners: ['Richard Poole'] },
  { Id: 'e-002', Name: 'Risksmart UK Ltd.',       ParentId: 'e-001',   ParentTitle: 'Risksmart Inc. (Group)', Description: 'UK regulated entity — FCA authorised',             Weight: 0.55, Owners: ['Emma Bamford'] },
  { Id: 'e-003', Name: 'Risksmart US Inc.',       ParentId: 'e-001',   ParentTitle: 'Risksmart Inc. (Group)', Description: 'US operating entity',                              Weight: 0.30, Owners: ['Liam Chen', 'James Romero'] },
  { Id: 'e-004', Name: 'Risksmart Ireland DAC',   ParentId: 'e-001',   ParentTitle: 'Risksmart Inc. (Group)', Description: 'EU operating entity post-Brexit',                  Weight: 0.15, Owners: ['Maya Okafor'] },
  { Id: 'e-005', Name: 'Risksmart UK — Retail',   ParentId: 'e-002',   ParentTitle: 'Risksmart UK Ltd.',     Description: 'Consumer-facing business unit',                    Weight: 0.60, Owners: ['Emma Bamford'] },
  { Id: 'e-006', Name: 'Risksmart UK — Corporate', ParentId: 'e-002',  ParentTitle: 'Risksmart UK Ltd.',     Description: 'B2B + enterprise sales',                           Weight: 0.40, Owners: ['Aiko Tanaka'] },
];

const buildHierarchy = (flat: typeof FLAT): EntityRow[] => {
  const byId = new Map<string, EntityRow>(
    flat.map((r) => [r.Id, { ...r, children: [] }]),
  );
  const roots: EntityRow[] = [];
  byId.forEach((row) => {
    if (row.ParentId && byId.has(row.ParentId)) {
      byId.get(row.ParentId)!.children!.push(row);
    } else {
      roots.push(row);
    }
  });
  return roots;
};

const COLUMNS = [
  {
    id: 'name',
    header: 'Name',
    cell: (e: EntityRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(ev) => { (ev.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(ev) => { (ev.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {e.Name}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'Name',
    minWidth: 240,
  },
  {
    id: 'parentTitle',
    header: 'Parent entity',
    cell: (e: EntityRow) => e.ParentTitle ?? '—',
    sortingField: 'ParentTitle',
    minWidth: 200,
  },
  {
    id: 'description',
    header: 'Description',
    cell: (e: EntityRow) => e.Description,
    minWidth: 240,
  },
  {
    id: 'weight',
    header: 'Weight',
    cell: (e: EntityRow) => e.Weight.toFixed(2),
    sortingField: 'Weight',
    minWidth: 80,
  },
  {
    id: 'owners',
    header: 'Owners',
    cell: (e: EntityRow) =>
      e.Owners.length > 0 ? <BadgeList badges={e.Owners} /> : '—',
    minWidth: 200,
  },
];

const EntitiesTab = () => {
  const items = useMemo(() => buildHierarchy(FLAT), []);
  const collection = useCollection(items, { sorting: {} });
  const [expandedItems, setExpandedItems] = useState<EntityRow[]>(items);

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'Id'}
      variant={'embedded'}
      expandableRows={
        {
          isItemExpandable: (item: EntityRow) => Boolean(item.children && item.children.length > 0),
          getItemChildren: (item: EntityRow) => item.children ?? [],
          expandedItems: expandedItems,
          onExpandableItemToggle: ({ detail }: any) => {
            setExpandedItems((prev) => {
              const next = new Set(prev.map((i) => i.Id));
              if (detail.expanded) next.add(detail.item.Id);
              else next.delete(detail.item.Id);
              return Array.from(next).map((Id) => ({ Id } as any));
            });
          },
        } as any
      }
      loadingText={'Loading entities'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button variant={'primary'}>{'Add'}</Button>
              </SpaceBetween>
            }
          >
            {'Entities'}
          </TabHeader>
        </SpaceBetween>
      }
    />
  );
};

export default EntitiesTab;
