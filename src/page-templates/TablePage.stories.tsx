// Page Templates / Table Page (Register) — composed template that mirrors
// the live RiskSmart Risk Register at packages/web/src/pages/risks/Page.tsx.
//
// Production layout:
//   PageLayout(title="Risks register", counter, actions=Export+Create new)
//     → CustomisableRibbon (saved-filter dashboard items with counts)
//     → Table
//        - columns: Title | Parent risk | Tier | Owners | Inherent | Residual | Linked controls | Tags
//        - property filter slot in table header
//        - pagination at the bottom
//
// Save/Export/Create-new live in PageLayout actions (top-right of the page),
// NOT inside the Table header — the Table here has only a property-filter
// slot and counter. This matches how every register page in the app works.

import { useCollection } from '@cloudscape-design/collection-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';
// eslint-disable-next-line import/no-unresolved
import PropertyFilterPanel from 'src/components/property-filter-panel';
// eslint-disable-next-line import/no-unresolved
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
// eslint-disable-next-line import/no-unresolved
import NoMatchesCollection from 'src/components/empty-collection/NoMatchesCollection';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// eslint-disable-next-line import/no-unresolved
import BadgeList from 'src/components/badge-list';
// Production DashboardItem — the canonical ribbon card. Replaces the
// hand-rolled inline-style block this file used to ship.
// eslint-disable-next-line import/no-unresolved
import { DashboardItem } from 'src/components/register-dashboard/DashboardItem';
import { Download01, Plus } from '@untitled-ui/icons-react';

const meta = {
  title: 'Page Templates/Table Page',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Production "register" template — mirrors packages/web/src/pages/risks/Page.tsx. Top-right page actions (Export + Create new) live in PageLayout, NOT inside the Table header. The CustomisableRibbon row above the table shows saved filters / quick-stat buttons, each with a teal count value (DashboardItem pattern). The Table only renders the property filter slot + the data + pagination.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample data — mirrors the field shape of RiskRegisterFields ──────
type RiskRow = {
  id: string;
  Title: string;
  ParentTitle: string | null;
  TierLabelled: 'Tier 1' | 'Tier 2' | 'Tier 3';
  Owners: { value: string; label: string }[];
  UncontrolledRatingLabelled: { color: string; label: string };
  ControlledRatingLabelled: { color: string; label: string };
  LinkedControlCount: number;
  tags: { value: string; label: string }[];
};

const SAMPLE_RISKS: RiskRow[] = [
  {
    id: 'R-001',
    Title: 'Data breach via legacy S3 bucket',
    ParentTitle: 'Information security',
    TierLabelled: 'Tier 1',
    Owners: [
      { value: 'eb', label: 'Emma Bamford' },
      { value: 'rp', label: 'Richard Poole' },
    ],
    UncontrolledRatingLabelled: { color: 'dark-red', label: 'Critical' },
    ControlledRatingLabelled: { color: 'orange', label: 'Medium' },
    LinkedControlCount: 8,
    tags: [
      { value: 'cyber', label: 'Cyber' },
      { value: 'data-loss', label: 'Data loss' },
    ],
  },
  {
    id: 'R-002',
    Title: 'Vendor concentration — payment processor',
    ParentTitle: 'Operational risk',
    TierLabelled: 'Tier 1',
    Owners: [{ value: 'jr', label: 'James Romero' }],
    UncontrolledRatingLabelled: { color: 'light-red', label: 'High' },
    ControlledRatingLabelled: { color: 'orange', label: 'Medium' },
    LinkedControlCount: 5,
    tags: [{ value: 'vendor', label: 'Vendor' }],
  },
  {
    id: 'R-003',
    Title: 'GDPR — third-party processors out of scope',
    ParentTitle: 'Compliance',
    TierLabelled: 'Tier 2',
    Owners: [{ value: 'lc', label: 'Liam Chen' }],
    UncontrolledRatingLabelled: { color: 'light-red', label: 'High' },
    ControlledRatingLabelled: { color: 'light-green', label: 'Low' },
    LinkedControlCount: 12,
    tags: [
      { value: 'gdpr', label: 'GDPR' },
      { value: 'regulatory', label: 'Regulatory' },
    ],
  },
  {
    id: 'R-004',
    Title: 'Phishing susceptibility — finance team',
    ParentTitle: 'Information security',
    TierLabelled: 'Tier 2',
    Owners: [{ value: 'mb', label: 'Maya Okafor' }],
    UncontrolledRatingLabelled: { color: 'orange', label: 'Medium' },
    ControlledRatingLabelled: { color: 'light-green', label: 'Low' },
    LinkedControlCount: 3,
    tags: [{ value: 'cyber', label: 'Cyber' }],
  },
  {
    id: 'R-005',
    Title: 'Outdated dependency in checkout flow',
    ParentTitle: 'Technology',
    TierLabelled: 'Tier 3',
    Owners: [{ value: 'tp', label: 'Tom Patel' }],
    UncontrolledRatingLabelled: { color: 'orange', label: 'Medium' },
    ControlledRatingLabelled: { color: 'light-green', label: 'Low' },
    LinkedControlCount: 2,
    tags: [{ value: 'technology', label: 'Technology' }],
  },
  {
    id: 'R-006',
    Title: 'Badge duplication in HQ',
    ParentTitle: 'Physical security',
    TierLabelled: 'Tier 3',
    Owners: [{ value: 'ar', label: 'Ava Rodriguez' }],
    UncontrolledRatingLabelled: { color: 'light-green', label: 'Low' },
    ControlledRatingLabelled: { color: 'darker-green', label: 'Very low' },
    LinkedControlCount: 1,
    tags: [{ value: 'physical', label: 'Physical' }],
  },
];

// ─── Property-filter properties ───────────────────────────────────────
const FILTERING_PROPERTIES = [
  { propertyLabel: 'Title', key: 'Title', groupValuesLabel: 'Titles', operators: [':', '!:', '=', '!='] as Array<':' | '!:' | '=' | '!='> },
  { propertyLabel: 'Parent risk', key: 'ParentTitle', groupValuesLabel: 'Parents', operators: ['=', '!='] as Array<'=' | '!='> },
  { propertyLabel: 'Tier', key: 'TierLabelled', groupValuesLabel: 'Tiers', operators: ['=', '!='] as Array<'=' | '!='> },
];

// ─── Columns — match production register field set ────────────────────
const COLUMNS = [
  {
    id: 'Title',
    header: 'Title',
    sortingField: 'Title',
    cell: (item: RiskRow) => (
      <a
        href={`#/risks/${item.id}`}
        style={{ color: '#0972d3', textDecoration: 'none', fontWeight: 600 }}
      >
        {item.Title}
      </a>
    ),
    isRowHeader: true,
    minWidth: 280,
  },
  {
    id: 'ParentTitle',
    header: 'Parent risk',
    sortingField: 'ParentTitle',
    cell: (item: RiskRow) => item.ParentTitle ?? 'None',
    minWidth: 160,
  },
  {
    id: 'TierLabelled',
    header: 'Tier',
    sortingField: 'TierLabelled',
    cell: (item: RiskRow) => item.TierLabelled,
    minWidth: 90,
  },
  {
    id: 'Owners',
    header: 'Owners',
    cell: (item: RiskRow) => (
      // Production renders Owners + Tags as BadgeList (compact inline
      // sorted badges via SimpleRatingBadge). NOT chip pills — those
      // would make table rows tall and break the constant row height.
      // See packages/web/src/utils/table/hooks/useGetOwnersFieldConfig.tsx.
      <BadgeList badges={item.Owners.map((o) => o.label)} />
    ),
    minWidth: 200,
  },
  {
    id: 'UncontrolledRatingLabelled',
    header: 'Inherent rating',
    sortingField: 'UncontrolledRatingLabelled',
    cell: (item: RiskRow) => <SimpleRatingBadge rating={item.UncontrolledRatingLabelled} />,
    minWidth: 130,
  },
  {
    id: 'ControlledRatingLabelled',
    header: 'Residual rating',
    sortingField: 'ControlledRatingLabelled',
    cell: (item: RiskRow) => <SimpleRatingBadge rating={item.ControlledRatingLabelled} />,
    minWidth: 130,
  },
  {
    id: 'LinkedControlCount',
    header: 'Linked controls',
    sortingField: 'LinkedControlCount',
    cell: (item: RiskRow) => item.LinkedControlCount,
    minWidth: 130,
  },
  {
    id: 'tags',
    header: 'Tags',
    // Same as Owners — production uses BadgeList for tags too.
    // See packages/web/src/utils/table/hooks/useGetTagFieldConfig.tsx.
    cell: (item: RiskRow) => (
      <BadgeList badges={item.tags.map((t) => t.label)} />
    ),
    minWidth: 160,
  },
];

// ─── CustomisableRibbon — wraps production DashboardItem cards.
// Container chrome + vertical divider mirrors the production layout in
// components/customisable-ribbon/CustomisableRibbon.tsx (lines 186-220).
type RibbonItem = { id: string; title: string; value: number };

const RibbonRow = ({
  items,
  activeId = 'all',
  onClick,
}: {
  items: RibbonItem[];
  activeId?: string;
  onClick?: (id: string) => void;
}) => (
  <div
    className={
      'flex gap-6 flex-grow overflow-x-auto rounded-md border border-solid border-grey200 bg-white px-6 py-5'
    }
  >
    {items.map((item, idx) => (
      <div key={item.id} className={'flex flex-1 justify-between'}>
        <DashboardItem
          title={item.title}
          value={item.value}
          selected={item.id === activeId}
          onClick={() => onClick?.(item.id)}
        />
        {idx !== items.length - 1 ? (
          <div className={'w-1 h-full bg-grey200'} />
        ) : null}
      </div>
    ))}
  </div>
);

// ─── Table page content ────────────────────────────────────────────────
const TablePageContent = ({
  items: rawItems,
  loading: tableLoading = false,
}: {
  items: RiskRow[];
  loading?: boolean;
}) => {
  const collection = useCollection(rawItems, {
    propertyFiltering: { filteringProperties: FILTERING_PROPERTIES, empty: <span>{'No matches'}</span> },
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
  const { items, propertyFilterProps, paginationProps, collectionProps } = collection;

  const ribbonItems: RibbonItem[] = [
    { id: 'all',       title: 'All risks',     value: rawItems.length },
    { id: 'tier1',     title: 'Tier 1',        value: rawItems.filter((r) => r.TierLabelled === 'Tier 1').length },
    { id: 'tier2',     title: 'Tier 2',        value: rawItems.filter((r) => r.TierLabelled === 'Tier 2').length },
    { id: 'high',      title: 'High inherent', value: rawItems.filter((r) => r.UncontrolledRatingLabelled.label === 'High' || r.UncontrolledRatingLabelled.label === 'Critical').length },
    { id: 'mine',      title: 'My risks',      value: 2 },
  ];

  return (
    <SpaceBetween size={'l'}>
      {/* CustomisableRibbon — saved filter / quick-stat dashboard items */}
      <RibbonRow items={ribbonItems} />

      {/* Table — header is just the property filter, no counter / actions
          (those are in PageLayout). */}
      <Table
        {...collectionProps}
        columnDefinitions={COLUMNS as any}
        items={items}
        selectionType={'multi'}
        trackBy={'id'}
        loading={tableLoading}
        loadingText={'Loading risks…'}
        filter={
          // Production wires propertyFilterProps directly into the
          // Cloudscape Table `filter` slot — no PageFilterContainer
          // chrome around it. See pages/risks/Page.tsx + Table.tsx
          // (packages/components/src/table/Table.tsx).
          <PropertyFilterPanel
            {...propertyFilterProps}
            countText={`${items.length} matches`}
            filteringPlaceholder={'Filter risks'}
            virtualScroll
          />
        }
        empty={
          rawItems.length === 0 ? (
            <EmptyEntityCollection
              entityLabel={'risk'}
              action={<Button variant={'primary'}>{'Create new risk'}</Button>}
            />
          ) : (
            <NoMatchesCollection
              onClearClick={() =>
                collectionProps.actions.setPropertyFiltering({ tokens: [], operation: 'and' })
              }
            />
          )
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </SpaceBetween>
  );
};

// ─── Stories ───────────────────────────────────────────────────────────
const downloadIcon = <Download01 width={16} height={16} />;
const plusIcon = <Plus width={16} height={16} />;

const RegisterPage = ({
  items,
  loading,
}: {
  items: RiskRow[];
  loading?: boolean;
}) => (
  <RealProviders initialPath={'/risks'}>
    <PageLayout
      title={'Risks register'}
      counter={`(${items.length})`}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button iconAlign={'left'} iconSvg={downloadIcon}>{'Export'}</Button>
          <Button variant={'primary'} iconAlign={'left'} iconSvg={plusIcon}>
            {'Create new risk'}
          </Button>
        </SpaceBetween>
      }
    >
      <TablePageContent items={items} loading={loading} />
    </PageLayout>
  </RealProviders>
);

export const Default: Story = {
  render: () => <RegisterPage items={SAMPLE_RISKS} />,
};

export const Empty: Story = {
  render: () => <RegisterPage items={[]} />,
};

export const LoadingState: Story = {
  render: () => <RegisterPage items={SAMPLE_RISKS} loading />,
};
