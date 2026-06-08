// Page Templates / Dashboard Page (Risk Dashboard) — mirrors the live
// hierarchical risk dashboard at packages/web/src/pages/risk-dashboard/Page.tsx.
//
// Production layout:
//   PageLayout(title="Risk dashboard", actions=Create new risk)
//     → PageFilterContainer
//        - PropertyFilterPanel (filter)
//        - Select (attribute selector — Inherent / Residual / Appetite / etc.)
//     → Grid 4|4|4 columns
//        - Tier 1 column: Container variant="stacked" with Header + Cards
//        - Tier 2 column: filtered by selected Tier 1 risk
//        - Tier 3 column: filtered by selected Tier 2 risk
//
// Each card renders the risk's friendly ID + the selected attribute badge
// in its header row, with the risk title as a Link below.

import type { Meta, StoryObj } from '@storybook/react-vite';
import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
import { useMemo, useState } from 'react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';
// eslint-disable-next-line import/no-unresolved
import PropertyFilterPanel from 'src/components/property-filter-panel';
// eslint-disable-next-line import/no-unresolved
import Select from 'src/components/form/select';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Plus } from '@untitled-ui/icons-react';

const meta = {
  title: 'Page Templates/Dashboard Page',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Live Risk Dashboard template — mirrors packages/web/src/pages/risk-dashboard/Page.tsx. 3-tier hierarchical view: select a Tier 1 risk to filter Tier 2, select a Tier 2 risk to filter Tier 3. Each tier column is a stacked Container with Cards. The header row of each card shows the friendly ID + the selected attribute badge (Inherent / Residual / Appetite performance / Risk status); the title links to the risk detail page.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Risk attribute selector — mirrors production options ─────────────
type AttributeKey =
  | 'UncontrolledRating'
  | 'ControlledRating'
  | 'AppetitePerformance'
  | 'RiskStatus';

const ATTRIBUTE_OPTIONS = [
  { label: 'Residual rating', value: 'ControlledRating' },
  { label: 'Inherent rating', value: 'UncontrolledRating' },
  { label: 'Appetite performance', value: 'AppetitePerformance' },
  { label: 'Risk status', value: 'RiskStatus' },
];

// ─── Sample 3-tier risk hierarchy ─────────────────────────────────────
type Risk = {
  Id: string;
  SequentialId: number;
  Title: string;
  Tier: 1 | 2 | 3;
  ParentRiskId?: string;
  // Attribute values for the badge
  ratings: Record<AttributeKey, { color: string; label: string } | null>;
};

const RISKS: Risk[] = [
  // Tier 1 — top-level enterprise risks
  {
    Id: 'r-001',
    SequentialId: 1,
    Title: 'Information security',
    Tier: 1,
    ratings: {
      UncontrolledRating: { color: 'dark-red', label: 'Critical' },
      ControlledRating: { color: 'orange', label: 'Medium' },
      AppetitePerformance: { color: 'light-red', label: 'Out of appetite' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  {
    Id: 'r-002',
    SequentialId: 2,
    Title: 'Operational risk',
    Tier: 1,
    ratings: {
      UncontrolledRating: { color: 'light-red', label: 'High' },
      ControlledRating: { color: 'orange', label: 'Medium' },
      AppetitePerformance: { color: 'orange', label: 'Within tolerance' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  {
    Id: 'r-003',
    SequentialId: 3,
    Title: 'Compliance & regulatory',
    Tier: 1,
    ratings: {
      UncontrolledRating: { color: 'orange', label: 'Medium' },
      ControlledRating: { color: 'light-green', label: 'Low' },
      AppetitePerformance: { color: 'light-green', label: 'Within appetite' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  // Tier 2 — children of Information security (r-001)
  {
    Id: 'r-101',
    SequentialId: 101,
    Title: 'Data breach via legacy S3 bucket',
    Tier: 2,
    ParentRiskId: 'r-001',
    ratings: {
      UncontrolledRating: { color: 'dark-red', label: 'Critical' },
      ControlledRating: { color: 'orange', label: 'Medium' },
      AppetitePerformance: { color: 'light-red', label: 'Out of appetite' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  {
    Id: 'r-102',
    SequentialId: 102,
    Title: 'Phishing — finance team',
    Tier: 2,
    ParentRiskId: 'r-001',
    ratings: {
      UncontrolledRating: { color: 'orange', label: 'Medium' },
      ControlledRating: { color: 'light-green', label: 'Low' },
      AppetitePerformance: { color: 'light-green', label: 'Within appetite' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  // Tier 2 — children of Operational risk (r-002)
  {
    Id: 'r-201',
    SequentialId: 201,
    Title: 'Vendor concentration — payments',
    Tier: 2,
    ParentRiskId: 'r-002',
    ratings: {
      UncontrolledRating: { color: 'light-red', label: 'High' },
      ControlledRating: { color: 'orange', label: 'Medium' },
      AppetitePerformance: { color: 'orange', label: 'Within tolerance' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  // Tier 2 — children of Compliance (r-003)
  {
    Id: 'r-301',
    SequentialId: 301,
    Title: 'GDPR — third-party processors',
    Tier: 2,
    ParentRiskId: 'r-003',
    ratings: {
      UncontrolledRating: { color: 'orange', label: 'Medium' },
      ControlledRating: { color: 'light-green', label: 'Low' },
      AppetitePerformance: { color: 'light-green', label: 'Within appetite' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  // Tier 3 — children of Data breach via legacy S3 (r-101)
  {
    Id: 'r-1101',
    SequentialId: 1101,
    Title: 'Outdated dependency in checkout flow',
    Tier: 3,
    ParentRiskId: 'r-101',
    ratings: {
      UncontrolledRating: { color: 'orange', label: 'Medium' },
      ControlledRating: { color: 'light-green', label: 'Low' },
      AppetitePerformance: { color: 'light-green', label: 'Within appetite' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
  {
    Id: 'r-1102',
    SequentialId: 1102,
    Title: 'Logging retention misconfigured',
    Tier: 3,
    ParentRiskId: 'r-101',
    ratings: {
      UncontrolledRating: { color: 'light-red', label: 'High' },
      ControlledRating: { color: 'orange', label: 'Medium' },
      AppetitePerformance: { color: 'orange', label: 'Within tolerance' },
      RiskStatus: { color: 'light-grey', label: 'Open' },
    },
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────
const getFriendlyId = (sequentialId: number) =>
  `R-${String(sequentialId).padStart(3, '0')}`;

const findRisksInTier = (
  tier: 1 | 2 | 3,
  state: Map<number, string | undefined>,
  risks: Risk[]
): Risk[] => {
  if (tier === 1) return risks.filter((r) => r.Tier === 1);
  const parentId = state.get(tier - 1);
  if (!parentId) return [];
  return risks.filter((r) => r.Tier === tier && r.ParentRiskId === parentId);
};

// ─── Tier column — Container + Cards ──────────────────────────────────
const Tier = ({
  tier,
  selectedAttribute,
  state,
  setState,
}: {
  tier: 1 | 2 | 3;
  selectedAttribute: AttributeKey;
  state: Map<number, string | undefined>;
  setState: (s: Map<number, string | undefined>) => void;
}) => {
  const risksInTier = findRisksInTier(tier, state, RISKS);
  const selectedRiskId = state.get(tier);
  const selectedRisk = risksInTier.find((r) => r.Id === selectedRiskId);
  const selectedItems = selectedRisk ? [selectedRisk] : [];

  const onSelectionChange = ({
    detail,
  }: {
    detail: { selectedItems: Risk[] };
  }) => {
    const next = new Map<number, string | undefined>();
    state.forEach((value, key) => {
      if (key === tier) next.set(key, detail.selectedItems[0]?.Id);
      else if (key > tier) next.set(key, undefined);
      else next.set(key, value);
    });
    setState(next);
  };

  return (
    /* data-rs-tier-card opts this Cards instance into the production
       tier-card SCSS rules from _risk-dashboard.css — hides the radio
       control, makes the whole card clickable, applies the rounded
       border + soft shadow + 10px gap. */
    <Container fitHeight variant={'stacked'}>
      <div data-rs-tier-card={'true'}>
      <SpaceBetween direction={'vertical'} size={'m'}>
        <Header
          variant={'h2'}
          actions={
            <Button variant={'primary'} iconName={'add-plus'}>
              {'Add'}
            </Button>
          }
        >
          {`Tier ${tier}`}
        </Header>
        <Cards<Risk>
          ariaLabels={{
            itemSelectionLabel: (_e, n) => `select ${n.Title}`,
            selectionGroupLabel: 'Item selection',
          }}
          entireCardClickable
          cardDefinition={{
            sections: [
              {
                id: 'title',
                content: (item) => (
                  <div className={'inline-block'}>
                    {/* Production uses Link variant="secondary" which
                        resolves to color #5C5C79 (dark navy-grey) in
                        the themed Cloudscape link CSS — NOT the default
                        Cloudscape blue. The whole card is clickable
                        anyway (entireCardClickable), so the title is
                        a plain dark-text label. */}
                    <a
                      href={`#/risks/${item.Id}`}
                      style={{ color: '#5C5C79', textDecoration: 'none' }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: '21px' }}>
                        {item.Title}
                      </span>
                    </a>
                  </div>
                ),
              },
            ],
            header: (item) => (
              <div className={'flex'} style={{ alignItems: 'center' }}>
                <div
                  className={'text-grey text-sm flex-grow'}
                  style={{ color: '#828297', fontSize: 12 }}
                >
                  {getFriendlyId(item.SequentialId)}
                </div>
                {item.ratings[selectedAttribute] && (
                  <SimpleRatingBadge
                    rating={item.ratings[selectedAttribute]!}
                  />
                )}
              </div>
            ),
          }}
          cardsPerRow={[{ cards: 1 }]}
          items={risksInTier}
          empty={
            <span style={{ color: '#828297', fontSize: 13 }}>
              {state.get(tier - 1) || tier === 1
                ? 'No items found'
                : 'Select a risk on the left to see its children'}
            </span>
          }
          loadingText={'Loading'}
          visibleSections={['title']}
          selectionType={'single'}
          selectedItems={selectedItems}
          onSelectionChange={onSelectionChange}
          trackBy={(item) => item.Id}
        />
      </SpaceBetween>
      </div>
    </Container>
  );
};

// ─── Page content ──────────────────────────────────────────────────────
const RiskDashboardContent = () => {
  const [selectedAttribute, setSelectedAttribute] = useState(
    ATTRIBUTE_OPTIONS[0]
  );
  // Auto-select the first Tier 1 risk so the dashboard renders fully on first paint
  const initialState = useMemo(() => {
    const m = new Map<number, string | undefined>();
    m.set(1, 'r-001');
    m.set(2, 'r-101');
    m.set(3, undefined);
    return m;
  }, []);
  const [state, setState] = useState(initialState);

  return (
    <SpaceBetween size={'l'}>
      {/* Filter row — production wraps this in PageFilterContainer
          (see risk-dashboard/Page.tsx). PropertyFilter on the left, the
          attribute Select on the right. */}
      <div
        style={{
          padding: 16,
          backgroundColor: '#ffffff',
          border: '1px solid #E8E8EC',
          borderRadius: 8,
        }}
      >
        <div className={'flex w-full'} style={{ display: 'flex', gap: 8 }}>
          <div className={'grow'} style={{ flex: 1 }}>
            <PropertyFilterPanel
              query={{ tokens: [], operation: 'and' }}
              onChange={() => {}}
              filteringProperties={[
                {
                  propertyLabel: 'Tier',
                  key: 'Tier',
                  groupValuesLabel: 'Tiers',
                  operators: ['='],
                },
                {
                  propertyLabel: 'Status',
                  key: 'Status',
                  groupValuesLabel: 'Statuses',
                  operators: ['='],
                },
              ]}
              countText={''}
              filteringPlaceholder={'Filter risks'}
              virtualScroll
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <Select
              selectedOption={selectedAttribute}
              onChange={({ detail }) =>
                setSelectedAttribute(detail.selectedOption as any)
              }
              options={ATTRIBUTE_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Three-tier grid — production sets a 900px min-width so the
          columns don't squash. */}
      <div style={{ minWidth: 900 }}>
        <Grid
          gridDefinition={[
            { colspan: 4 },
            { colspan: 4 },
            { colspan: 4 },
          ]}
        >
          <Tier
            tier={1}
            selectedAttribute={selectedAttribute.value as AttributeKey}
            state={state}
            setState={setState}
          />
          <Tier
            tier={2}
            selectedAttribute={selectedAttribute.value as AttributeKey}
            state={state}
            setState={setState}
          />
          <Tier
            tier={3}
            selectedAttribute={selectedAttribute.value as AttributeKey}
            state={state}
            setState={setState}
          />
        </Grid>
      </div>
    </SpaceBetween>
  );
};

// ─── Stories ───────────────────────────────────────────────────────────
const plusIcon = <Plus width={16} height={16} />;

export const Default: Story = {
  render: () => (
    <RealProviders initialPath={'/risks/dashboard'}>
      <PageLayout
        title={'Risk dashboard'}
        actions={
          <Button
            variant={'primary'}
            iconAlign={'left'}
            iconSvg={plusIcon}
          >
            {'Create new risk'}
          </Button>
        }
      >
        <RiskDashboardContent />
      </PageLayout>
    </RealProviders>
  ),
};
