// Prototype — RSP-5043: Registers default to active-class records only
//
// Brief: https://linear.app/risksmart/issue/RSP-5043
//
// On first load (no URL hash, no saved preferences), the four registers
// (Risks, Controls, Risk Ratings, Control Tests) apply a hardcoded default
// PropertyFilterQuery on the Status field. User can clear or modify it.
//
// This prototype shows three states for the Risks register:
//   1. Default — filter is on, only active-class records visible
//   2. Cleared — user clicked "Clear filters", all records visible
//   3. With inline note — same as (1) plus a one-line explanation above
//      the table for the team to evaluate whether pills alone are clear
//      enough or if helper text is needed
//
// Design call: the brief says "no new design component". Variant 1 leans on
// the standard Cloudscape filter pills as the "indicator". Variant 3 adds
// a soft helper line to test the "is the user confused by pre-applied
// pills?" hypothesis. Pick after stakeholder review.
//
// Library: Cloudscape (modifying existing screens, see SKILL.md routing).
// Pattern: register-page (see references/patterns/register-page.md).

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
// eslint-disable-next-line import/no-unresolved
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import { Download01, Plus, InfoCircle } from '@untitled-ui/icons-react';

const meta = {
  title: 'Prototypes/RSP-5043 Default Active Filter',
  component: PageLayout as any,
  tags: ['prototype'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'RSP-5043 prototype. Risks register defaults to showing only ' +
          'Active / Emerging / Monitored records on first load. Three ' +
          'stories: Default (filter on), Cleared (user removed it), ' +
          'WithInlineNote (filter on + helper text variant).',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Risk row + status type ──────────────────────────────────────────
type RiskStatus = 'Active' | 'Emerging' | 'Monitored' | 'Retired' | 'Draft';

type RiskRow = {
  id: string;
  Title: string;
  ParentTitle: string | null;
  TierLabelled: 'Tier 1' | 'Tier 2' | 'Tier 3';
  Owners: { value: string; label: string }[];
  Status: RiskStatus;
  UncontrolledRatingLabelled: { color: string; label: string };
  ControlledRatingLabelled: { color: string; label: string };
  LinkedControlCount: number;
  tags: { value: string; label: string }[];
};

// Sample data covers all 5 statuses so the filter has something to filter.
const SAMPLE_RISKS: RiskRow[] = [
  {
    id: 'R-001',
    Title: 'Data breach via legacy S3 bucket',
    ParentTitle: 'Information security',
    TierLabelled: 'Tier 1',
    Owners: [{ value: 'eb', label: 'Emma Bamford' }, { value: 'rp', label: 'Richard Poole' }],
    Status: 'Active',
    UncontrolledRatingLabelled: { color: 'dark-red', label: 'Critical' },
    ControlledRatingLabelled: { color: 'orange', label: 'Medium' },
    LinkedControlCount: 8,
    tags: [{ value: 'cyber', label: 'Cyber' }, { value: 'data-loss', label: 'Data loss' }],
  },
  {
    id: 'R-002',
    Title: 'Vendor concentration — payment processor',
    ParentTitle: 'Operational risk',
    TierLabelled: 'Tier 1',
    Owners: [{ value: 'jr', label: 'James Romero' }],
    Status: 'Active',
    UncontrolledRatingLabelled: { color: 'light-red', label: 'High' },
    ControlledRatingLabelled: { color: 'orange', label: 'Medium' },
    LinkedControlCount: 5,
    tags: [{ value: 'vendor', label: 'Vendor' }],
  },
  {
    id: 'R-003',
    Title: 'AI model bias in credit decisions',
    ParentTitle: 'Emerging risk',
    TierLabelled: 'Tier 2',
    Owners: [{ value: 'lc', label: 'Liam Chen' }],
    Status: 'Emerging',
    UncontrolledRatingLabelled: { color: 'orange', label: 'Medium' },
    ControlledRatingLabelled: { color: 'light-green', label: 'Low' },
    LinkedControlCount: 2,
    tags: [{ value: 'ai', label: 'AI' }],
  },
  {
    id: 'R-004',
    Title: 'Phishing susceptibility — finance team',
    ParentTitle: 'Information security',
    TierLabelled: 'Tier 2',
    Owners: [{ value: 'mb', label: 'Maya Okafor' }],
    Status: 'Monitored',
    UncontrolledRatingLabelled: { color: 'orange', label: 'Medium' },
    ControlledRatingLabelled: { color: 'light-green', label: 'Low' },
    LinkedControlCount: 3,
    tags: [{ value: 'cyber', label: 'Cyber' }],
  },
  {
    id: 'R-005',
    Title: 'Outdated checkout dependency (mitigated)',
    ParentTitle: 'Technology',
    TierLabelled: 'Tier 3',
    Owners: [{ value: 'tp', label: 'Tom Patel' }],
    Status: 'Retired',
    UncontrolledRatingLabelled: { color: 'orange', label: 'Medium' },
    ControlledRatingLabelled: { color: 'light-green', label: 'Low' },
    LinkedControlCount: 2,
    tags: [{ value: 'technology', label: 'Technology' }],
  },
  {
    id: 'R-006',
    Title: 'Working draft — third-party API exposure',
    ParentTitle: 'Information security',
    TierLabelled: 'Tier 3',
    Owners: [{ value: 'ar', label: 'Ava Rodriguez' }],
    Status: 'Draft',
    UncontrolledRatingLabelled: { color: 'light-grey', label: 'Unrated' },
    ControlledRatingLabelled: { color: 'light-grey', label: 'Unrated' },
    LinkedControlCount: 0,
    tags: [],
  },
];

// ─── Property-filter properties — Status now has full enum values ────
const ACTIVE_CLASS_STATUSES: RiskStatus[] = ['Active', 'Emerging', 'Monitored'];
const ALL_STATUSES: RiskStatus[] = ['Active', 'Emerging', 'Monitored', 'Retired', 'Draft'];

const FILTERING_PROPERTIES = [
  { propertyLabel: 'Title', key: 'Title', groupValuesLabel: 'Titles', operators: [':', '!:', '=', '!='] as Array<':' | '!:' | '=' | '!='> },
  { propertyLabel: 'Tier', key: 'TierLabelled', groupValuesLabel: 'Tiers', operators: ['=', '!='] as Array<'=' | '!='> },
  { propertyLabel: 'Status', key: 'Status', groupValuesLabel: 'Statuses', operators: ['=', '!='] as Array<'=' | '!='> },
];

const FILTERING_OPTIONS = ALL_STATUSES.map((s) => ({ propertyKey: 'Status', value: s }));

// The DEFAULT filter — three OR'd Status pills (Active, Emerging, Monitored).
// In production this would come from the new "default-filter" layer in
// useFiltersFromDBAndUrlHash; here we just seed the collection with it.
const DEFAULT_ACTIVE_FILTER = {
  operation: 'or' as const,
  tokens: ACTIVE_CLASS_STATUSES.map((status) => ({
    propertyKey: 'Status',
    operator: '=',
    value: status,
  })),
};

const EMPTY_FILTER = { tokens: [], operation: 'and' as const };

// ─── Columns — Risk Register defaults from useGetFieldConfig ─────────
const COLUMNS = [
  {
    id: 'Title',
    header: 'Title',
    sortingField: 'Title',
    cell: (item: RiskRow) => (
      <a href={`#/risks/${item.id}`} style={{ color: '#0972d3', textDecoration: 'none', fontWeight: 600 }}>
        {item.Title}
      </a>
    ),
    isRowHeader: true,
    minWidth: 280,
  },
  { id: 'ParentTitle', header: 'Parent risk', cell: (item: RiskRow) => item.ParentTitle ?? 'None', minWidth: 160 },
  { id: 'TierLabelled', header: 'Tier', cell: (item: RiskRow) => item.TierLabelled, minWidth: 90 },
  {
    id: 'Status',
    header: 'Status',
    cell: (item: RiskRow) => <SimpleRatingBadge rating={statusRating(item.Status)} />,
    minWidth: 110,
  },
  { id: 'Owners', header: 'Owners', cell: (item: RiskRow) => <BadgeList badges={item.Owners.map((o) => o.label)} />, minWidth: 200 },
  {
    id: 'UncontrolledRatingLabelled',
    header: 'Inherent rating',
    cell: (item: RiskRow) => <SimpleRatingBadge rating={item.UncontrolledRatingLabelled} />,
    minWidth: 130,
  },
  {
    id: 'ControlledRatingLabelled',
    header: 'Residual rating',
    cell: (item: RiskRow) => <SimpleRatingBadge rating={item.ControlledRatingLabelled} />,
    minWidth: 130,
  },
  { id: 'LinkedControlCount', header: 'Linked controls', cell: (item: RiskRow) => item.LinkedControlCount, minWidth: 130 },
  { id: 'tags', header: 'Tags', cell: (item: RiskRow) => <BadgeList badges={item.tags.map((t) => t.label)} />, minWidth: 160 },
];

const statusRating = (s: RiskStatus) => {
  const colour: Record<RiskStatus, string> = {
    Active: 'darker-green',
    Emerging: 'orange',
    Monitored: 'blue-500',
    Retired: 'light-grey',
    Draft: 'light-grey',
  };
  return { color: colour[s], label: s };
};

// ─── Inline note variant — soft alert that explains the default ──────
//
// One-line helper above the property filter. Reuses production token
// colours (text-grey500, bg-off_white) so it visually recedes — it's
// guidance, not an alert. Dismissible? Could add a "Don't show again"
// link if user-tested.
const DefaultFilterNote = ({ onClear }: { onClear: () => void }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      backgroundColor: '#f9f9fd',
      border: '1px solid #E8E8EC',
      borderRadius: 6,
      fontSize: 13,
      color: '#5C5C79',
    }}
  >
    <InfoCircle width={16} height={16} style={{ color: '#41D9CC', flexShrink: 0 }} />
    <span>
      {'Showing only Active, Emerging, and Monitored risks by default. '}
      <a
        href={'#'}
        onClick={(e) => {
          e.preventDefault();
          onClear();
        }}
        style={{ color: '#0972d3', textDecoration: 'underline' }}
      >
        {'Show all'}
      </a>
      {' to see Draft and Retired records too.'}
    </span>
  </div>
);

// Apply a PropertyFilterQuery to a row set. Supports the simple subset we
// use here: top-level operation = 'or' or 'and', tokens with operator '='
// or '!=' on the Status field. Production uses Cloudscape's full
// processItems — for the prototype this manual pass is plenty.
const applyFilter = (rows: RiskRow[], query: typeof DEFAULT_ACTIVE_FILTER | typeof EMPTY_FILTER) => {
  if (!query.tokens || query.tokens.length === 0) return rows;
  const op = query.operation;
  return rows.filter((row) => {
    const matches = query.tokens.map((t) => {
      const fieldValue = (row as any)[t.propertyKey];
      return t.operator === '=' ? fieldValue === t.value : fieldValue !== t.value;
    });
    return op === 'or' ? matches.some(Boolean) : matches.every(Boolean);
  });
};

// ─── Page content — toggleable initial filter via prop ───────────────
const RegisterContent = ({
  items: rawItems,
  initialFilter,
  showInlineNote = false,
}: {
  items: RiskRow[];
  initialFilter: typeof DEFAULT_ACTIVE_FILTER | typeof EMPTY_FILTER;
  showInlineNote?: boolean;
}) => {
  const [filterQuery, setFilterQuery] = useState(initialFilter);

  // Manually compute filtered items so the seeded query actually filters
  // the table (not just renders pills). useCollection still handles
  // pagination + sorting on the filtered set.
  const filteredItems = applyFilter(rawItems, filterQuery);

  const collection = useCollection(filteredItems, {
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
  const { items, paginationProps, collectionProps } = collection;

  // Whether the default filter is currently active (matches the seed).
  const defaultActive =
    filterQuery.operation === 'or' &&
    filterQuery.tokens.length === 3 &&
    filterQuery.tokens.every((t) => ACTIVE_CLASS_STATUSES.includes(t.value as RiskStatus));

  const clearStatusFilter = () => setFilterQuery(EMPTY_FILTER);

  return (
    <SpaceBetween size={'l'}>
      {showInlineNote && defaultActive && (
        <DefaultFilterNote onClear={clearStatusFilter} />
      )}

      <Table
        {...collectionProps}
        columnDefinitions={COLUMNS as any}
        items={items}
        selectionType={'multi'}
        trackBy={'id'}
        loadingText={'Loading risks…'}
        filter={
          <PropertyFilterPanel
            query={filterQuery as any}
            onChange={({ detail }) => setFilterQuery(detail as any)}
            filteringProperties={FILTERING_PROPERTIES as any}
            filteringOptions={FILTERING_OPTIONS as any}
            countText={`${filteredItems.length} matches`}
            filteringPlaceholder={'Filter risks'}
            i18nStrings={defaultPropertyFilterI18nStrings}
            virtualScroll
          />
        }
        empty={
          rawItems.length === 0 ? (
            <EmptyEntityCollection entityLabel={'risk'} action={<Button variant={'primary'}>{'Create new risk'}</Button>} />
          ) : (
            <NoMatchesCollection onClearClick={clearStatusFilter} />
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

const PageWrap = ({ children, count }: { children: React.ReactNode; count: number }) => (
  <RealProviders initialPath={'/risks'}>
    <PageLayout
      title={'Risks register'}
      counter={`(${count})`}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button iconAlign={'left'} iconSvg={downloadIcon}>{'Export'}</Button>
          <Button variant={'primary'} iconAlign={'left'} iconSvg={plusIcon}>{'Create new risk'}</Button>
        </SpaceBetween>
      }
    >
      {children}
    </PageLayout>
  </RealProviders>
);

// 1. Default — first load. URL empty, prefs empty, default filter applied.
//    The Cloudscape PropertyFilter renders 3 Status pills as the "indicator".
export const Default: Story = {
  render: () => {
    // Filter applied so only active-class rows show in the table.
    // 4 rows visible (R-001 Active, R-002 Active, R-003 Emerging, R-004 Monitored)
    const visibleCount = SAMPLE_RISKS.filter((r) => ACTIVE_CLASS_STATUSES.includes(r.Status)).length;
    return (
      <PageWrap count={visibleCount}>
        <RegisterContent items={SAMPLE_RISKS} initialFilter={DEFAULT_ACTIVE_FILTER} />
      </PageWrap>
    );
  },
};

// 2. Cleared — user removed the default. All 6 rows visible (incl. Draft + Retired).
export const Cleared: Story = {
  render: () => (
    <PageWrap count={SAMPLE_RISKS.length}>
      <RegisterContent items={SAMPLE_RISKS} initialFilter={EMPTY_FILTER} />
    </PageWrap>
  ),
};

// 3. With inline note — same as (1) but with a soft helper line above the
//    property filter explaining the default.
export const WithInlineNote: Story = {
  render: () => {
    const visibleCount = SAMPLE_RISKS.filter((r) => ACTIVE_CLASS_STATUSES.includes(r.Status)).length;
    return (
      <PageWrap count={visibleCount}>
        <RegisterContent items={SAMPLE_RISKS} initialFilter={DEFAULT_ACTIVE_FILTER} showInlineNote />
      </PageWrap>
    );
  },
};

// 4. Loading — required by State Coverage in the skill self-check.
export const Loading: Story = {
  render: () => (
    <PageWrap count={0}>
      <div style={{ padding: 48, textAlign: 'center', color: '#828297' }}>
        {'Loading risks…'}
      </div>
    </PageWrap>
  ),
};

// 5. Empty — no records at all (not just filtered to zero).
export const EmptyState: Story = {
  render: () => (
    <PageWrap count={0}>
      <RegisterContent items={[]} initialFilter={DEFAULT_ACTIVE_FILTER} />
    </PageWrap>
  ),
};

// 6. Error — query failed (permission denied, network, etc.). The
//    register would render the title/actions/page chrome but swap the
//    table for a flashbar-style error block.
export const ErrorState: Story = {
  render: () => (
    <PageWrap count={0}>
      <div
        style={{
          padding: 24,
          backgroundColor: '#FDEDED',
          border: '1px solid #F2BABA',
          borderRadius: 6,
          color: '#5C0E0E',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <strong>{'Could not load risks. '}</strong>
        <span>{'Check your permissions or try refreshing the page.'}</span>
      </div>
    </PageWrap>
  ),
};
