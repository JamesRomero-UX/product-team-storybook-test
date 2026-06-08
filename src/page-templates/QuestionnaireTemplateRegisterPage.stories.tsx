// Page Templates / Questionnaire Template Register — list of
// questionnaire templates at /third-party/questionnaire.
//
// Composed from the SAME storybook components the validated Table Page
// (Risks Register) uses, so typography, spacing, link colours and
// button sizing all match the live app:
//
//   @risksmart-app/components/src/table       ← production Table wrapper (Sora font)
//   @risksmart-app/components/src/button      ← custom Button wrapper (consistent size)
//   src/components/property-filter-panel      ← filter chrome above the rows
//   src/components/empty-collection/EmptyEntityCollection
//   src/components/empty-collection/NoMatchesCollection
//   src/components/simple-rating-badge        ← status pill
//   @cloudscape-design/collection-hooks       ← filtering + sorting + pagination
//
// Production mirror:
//   pages/questionnaire-templates/Page.tsx   ← shell
//   pages/questionnaire-templates/config.tsx ← column config
//   components/customisable-ribbon/CustomisableRibbon
//
// Status palette comes from the real production rating colours
// (light-grey / light-green / light-red) via i18n ratings.json +
// utils/colours.ts — NOT the orange/green/grey I had on the first pass.

import { useCollection } from '@cloudscape-design/collection-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useMemo } from 'react';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import PropertyFilterPanel from 'src/components/property-filter-panel';
// eslint-disable-next-line import/no-unresolved
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
// eslint-disable-next-line import/no-unresolved
import NoMatchesCollection from 'src/components/empty-collection/NoMatchesCollection';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// Production DashboardItem — the canonical title+huge-number ribbon card.
// Lives at packages/web/src/components/register-dashboard/DashboardItem.tsx.
// Verbatim Tailwind classes, scale-on-hover, navy_mid selected / teal
// clickable colour logic — all comes for free.
// eslint-disable-next-line import/no-unresolved
import { DashboardItem } from 'src/components/register-dashboard/DashboardItem';
import { Download01, Plus } from '@untitled-ui/icons-react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

const meta = {
  title: 'Page Templates/Questionnaire Template Register',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'List view at /third-party/questionnaire. Composed from the ' +
          'same storybook pieces as the validated Table Page (Risks ' +
          'Register) — production Table wrapper, production Button, ' +
          'PropertyFilterPanel, EmptyEntityCollection, RibbonRow, ' +
          'SimpleRatingBadge.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Production rating palette ───────────────────────────────────────
//
// Source: packages/i18n/src/locales/default/en/ratings.json +
// packages/components/src/utils/colours.ts
const STATUS_PALETTE: Record<
  'draft' | 'published' | 'archived',
  { label: string; bg: string }
> = {
  draft:     { label: 'Draft',     bg: '#E8E8EC' }, // light-grey
  published: { label: 'Published', bg: '#8CC862' }, // light-green
  archived:  { label: 'Archived',  bg: '#E37373' }, // light-red
};

// ─── Sample data ─────────────────────────────────────────────────────
type TemplateRow = {
  id: string;
  Title: string;
  Description: string;
  LatestStatus: keyof typeof STATUS_PALETTE;
  CreatedByFriendlyName: string;
  CreatedAtTimestamp: string;
  ModifiedByFriendlyName: string;
  ModifiedAtTimestamp: string;
};

const SAMPLE: TemplateRow[] = [
  { id: 'qt-001', Title: 'Vendor Security Assessment — 2026',  Description: 'ISO 27001 + SOC 2 due-diligence questionnaire for new suppliers',  LatestStatus: 'published', CreatedByFriendlyName: 'Emma Bamford',   CreatedAtTimestamp: '2025-11-04T09:12:00Z', ModifiedByFriendlyName: 'Emma Bamford',   ModifiedAtTimestamp: '2026-04-21T16:48:00Z' },
  { id: 'qt-002', Title: 'GDPR Sub-processor Review',           Description: 'Required for any vendor processing customer PII',                LatestStatus: 'published', CreatedByFriendlyName: 'Liam Chen',      CreatedAtTimestamp: '2025-08-19T11:30:00Z', ModifiedByFriendlyName: 'Liam Chen',      ModifiedAtTimestamp: '2026-02-11T10:15:00Z' },
  { id: 'qt-003', Title: 'Operational Resilience Tiering',      Description: 'PRA SS1/21 vendor classification — tier 1 / 2 / 3 / 4',         LatestStatus: 'published', CreatedByFriendlyName: 'Richard Poole',  CreatedAtTimestamp: '2024-12-02T14:00:00Z', ModifiedByFriendlyName: 'James Romero',   ModifiedAtTimestamp: '2026-05-08T09:33:00Z' },
  { id: 'qt-004', Title: 'Information Security — Light Touch',  Description: 'Reduced 12-question version for low-risk vendors',                LatestStatus: 'draft',     CreatedByFriendlyName: 'James Romero',   CreatedAtTimestamp: '2026-05-12T08:24:00Z', ModifiedByFriendlyName: 'James Romero',   ModifiedAtTimestamp: '2026-05-13T17:02:00Z' },
  { id: 'qt-005', Title: 'Annual Vendor Recertification',       Description: 'Re-assessment fired automatically 11 months after onboarding',  LatestStatus: 'published', CreatedByFriendlyName: 'Emma Bamford',   CreatedAtTimestamp: '2025-03-15T10:00:00Z', ModifiedByFriendlyName: 'Emma Bamford',   ModifiedAtTimestamp: '2026-01-20T11:11:00Z' },
  { id: 'qt-006', Title: 'Cloud Provider Tier 1 (Deprecated)',  Description: 'Superseded by Vendor Security Assessment — 2026',               LatestStatus: 'archived',  CreatedByFriendlyName: 'Liam Chen',      CreatedAtTimestamp: '2023-06-08T09:00:00Z', ModifiedByFriendlyName: 'Liam Chen',      ModifiedAtTimestamp: '2025-10-30T14:20:00Z' },
];

// ─── Filtering properties for PropertyFilterPanel ────────────────────
const FILTERING_PROPERTIES = [
  { propertyLabel: 'Title',       key: 'Title',                  groupValuesLabel: 'Title values',       operators: [':', '!:', '=', '!='] },
  { propertyLabel: 'Description', key: 'Description',            groupValuesLabel: 'Description values', operators: [':', '!:'] },
  { propertyLabel: 'Status',      key: 'LatestStatus',           groupValuesLabel: 'Status values',      operators: ['=', '!='] },
  { propertyLabel: 'Created by',  key: 'CreatedByFriendlyName',  groupValuesLabel: 'Owner values',       operators: ['=', '!='] },
  { propertyLabel: 'Updated by',  key: 'ModifiedByFriendlyName', groupValuesLabel: 'Updated values',     operators: ['=', '!='] },
];

// ─── Column definitions (production default-visible set) ─────────────
//
// Production cell renderers from
// pages/questionnaire-templates/config.tsx:
//
//   Title: <Link variant='secondary' href={detailUrl}>{item.Title}</Link>
//   LatestStatus: <SimpleRatingBadge rating={getStatus.getByValue(item.LatestStatus)} />
//
// We use a plain `<a>` styled with the production link colour
// (Cloudscape `--color-text-link-default`, which inherits via Cloudscape
// global tokens). The Link wrapper from @risksmart-app/components is
// the canonical choice, but pulling it requires router context and the
// secondary variant theming — too deep to lift here without bloat.
const COLUMNS = [
  {
    id: 'title',
    header: 'Title',
    cell: (t: TemplateRow) => (
      <a
        href={'#'}
        // Match Cloudscape's themed link colour via inherited CSS variable.
        // Falls back to the production teal3 if the var isn't set.
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
        onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        {t.Title}
      </a>
    ),
    minWidth: 240,
    isRowHeader: true,
    sortingField: 'Title',
  },
  {
    id: 'description',
    header: 'Description',
    cell: (t: TemplateRow) => t.Description,
    minWidth: 240,
  },
  {
    id: 'latestStatus',
    header: 'Status',
    cell: (t: TemplateRow) => {
      const tone = STATUS_PALETTE[t.LatestStatus];
      return (
        <SimpleRatingBadge
          rating={{
            label: tone.label,
            rgbHexColor: tone.bg,
            value: 1,
            ratingType: 'questionnaire_template_version_status',
            __typename: 'parent_rating' as any,
          } as any}
        />
      );
    },
    minWidth: 120,
    sortingField: 'LatestStatus',
  },
  {
    id: 'createdBy',
    header: 'Created by',
    cell: (t: TemplateRow) => t.CreatedByFriendlyName,
    minWidth: 140,
    sortingField: 'CreatedByFriendlyName',
  },
  {
    id: 'modifiedBy',
    header: 'Updated by',
    cell: (t: TemplateRow) => t.ModifiedByFriendlyName,
    minWidth: 140,
    sortingField: 'ModifiedByFriendlyName',
  },
];

// ─── CustomisableRibbon — wraps production DashboardItem cards.
// Container chrome and vertical dividers mirror the production layout in
// components/customisable-ribbon/CustomisableRibbon.tsx (lines 186-220).
type RibbonItem = { id: string; title: string; value: number };

const RibbonRow = ({
  items,
  activeId,
  onClick,
}: {
  items: RibbonItem[];
  activeId: string;
  onClick: (id: string) => void;
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
          onClick={() => onClick(item.id)}
        />
        {idx !== items.length - 1 ? (
          <div className={'w-1 h-full bg-grey200'} />
        ) : null}
      </div>
    ))}
  </div>
);

// ─── Page content ────────────────────────────────────────────────────
const RegisterContent = ({
  items: rawItems,
  loading = false,
}: {
  items: TemplateRow[];
  loading?: boolean;
}) => {
  const collection = useCollection(rawItems, {
    propertyFiltering: {
      filteringProperties: FILTERING_PROPERTIES as any,
      empty: <span>{'No matches'}</span>,
    },
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
  const { items, propertyFilterProps, paginationProps, collectionProps } = collection;

  const [activeRibbon, setActiveRibbon] = useState('all');

  const ribbonItems: RibbonItem[] = useMemo(
    () => [
      { id: 'all',       title: 'All',       value: rawItems.length },
      { id: 'published', title: 'Published', value: rawItems.filter((t) => t.LatestStatus === 'published').length },
      { id: 'drafts',    title: 'Drafts',    value: rawItems.filter((t) => t.LatestStatus === 'draft').length },
      { id: 'archived',  title: 'Archived',  value: rawItems.filter((t) => t.LatestStatus === 'archived').length },
    ],
    [rawItems],
  );

  return (
    <SpaceBetween size={'l'}>
      <RibbonRow items={ribbonItems} activeId={activeRibbon} onClick={setActiveRibbon} />
      <Table
        {...collectionProps}
        columnDefinitions={COLUMNS as any}
        items={items}
        trackBy={'id'}
        loading={loading}
        loadingText={'Loading questionnaires…'}
        filter={
          <PropertyFilterPanel
            {...propertyFilterProps}
            countText={`${items.length} matches`}
            filteringPlaceholder={'Filter questionnaires'}
            virtualScroll
          />
        }
        empty={
          rawItems.length === 0 ? (
            <EmptyEntityCollection
              entityLabel={'questionnaire'}
              action={
                <Button variant={'primary'}>{'Add Questionnaire'}</Button>
              }
            />
          ) : (
            <NoMatchesCollection
              onClearClick={() =>
                collectionProps.actions.setPropertyFiltering({
                  tokens: [],
                  operation: 'and',
                })
              }
            />
          )
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </SpaceBetween>
  );
};

// ─── Page wrapper ────────────────────────────────────────────────────
const RegisterPage = ({
  items,
  loading,
}: {
  items: TemplateRow[];
  loading?: boolean;
}) => {
  const downloadIcon = <Download01 width={16} height={16} />;
  const plusIcon = <Plus width={16} height={16} />;
  return (
    <RealProviders initialPath={'/third-party/questionnaire'}>
      <PageLayout
        title={'Questionnaire'}
        counter={`(${items.length})`}
        actions={
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button iconAlign={'left'} iconSvg={downloadIcon}>{'Export'}</Button>
            <Button variant={'primary'} iconAlign={'left'} iconSvg={plusIcon}>
              {'Add Questionnaire'}
            </Button>
          </SpaceBetween>
        }
      >
        <RegisterContent items={items} loading={loading} />
      </PageLayout>
    </RealProviders>
  );
};

// ─── Stories ─────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => <RegisterPage items={SAMPLE} />,
};

export const Empty: Story = {
  render: () => <RegisterPage items={[]} />,
};

export const LoadingState: Story = {
  render: () => <RegisterPage items={SAMPLE} loading />,
};
