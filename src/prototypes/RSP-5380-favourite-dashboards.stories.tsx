// Prototype — RSP-5380: User can mark and unmark a dashboard as a favourite
//
// Brief: https://linear.app/risksmart/issue/RSP-5380
//
// AC inferred from title (Linear MCP offline at composition time):
// - User can mark a dashboard as favourite via star toggle
// - Star icon appears in:
//     a) the dashboard page header (next to Actions / Edit)
//     b) on each row of the dashboard switcher dropdown
// - Favourites are grouped at the top of the switcher (Favourites header,
//   then Dashboards header below)
// - Star is teal — `#41D9CC` (Secondary 700, design system token)
//
// Stories:
//   1. Default                       — current dashboard NOT favourited
//   2. Favourited                    — current dashboard IS favourited
//   3. SelectorOpenWithFavourites    — dropdown grouped: Favourites / Dashboards
//   4. Loading                       — chrome rendered, spinner in body
//   5. EmptyState                    — no dashboards / no favourites yet
//   6. ErrorState                    — query failed
//
// Library: Cloudscape (modifying existing screen — Risk dashboard is live).
// Patterns used: page-actions, register-page (for the dropdown grouping pattern).

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import ActionsButton from 'src/components/actions-button';
import { Star01, Star02 } from '@untitled-ui/icons-react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

const meta = {
  title: 'Prototypes/RSP-5380 Favourite Dashboards',
  component: PageLayout as any,
  tags: ['prototype'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'RSP-5380 prototype. Mark / unmark dashboard as favourite. Star ' +
          'lives in (a) page header and (b) dropdown rows; favourites ' +
          'grouped at top of switcher dropdown. Teal star (#41D9CC).',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample dashboard data ────────────────────────────────────────────
type Dashboard = {
  Id: string;
  Name: string;
  Description?: string;
  Sharing: 'user_only' | 'shared';
  isFavourite: boolean;
};

const SAMPLE_DASHBOARDS: Dashboard[] = [
  { Id: 'd-1', Name: 'Risk overview', Description: 'Summary of all risks across the org', Sharing: 'shared', isFavourite: true },
  { Id: 'd-2', Name: 'My open risks', Description: 'Risks owned by me', Sharing: 'user_only', isFavourite: true },
  { Id: 'd-3', Name: 'Q4 board pack', Description: 'Quarterly board reporting', Sharing: 'shared', isFavourite: false },
  { Id: 'd-4', Name: 'Compliance heat map', Description: 'Regulatory exposure', Sharing: 'shared', isFavourite: false },
  { Id: 'd-5', Name: 'Vendor risk dashboard', Description: 'Third-party risk monitoring', Sharing: 'shared', isFavourite: false },
];

// ─── FavouriteToggle — composition: icon button with state-aware fill ──
//
// Composed from <Button variant="icon"> + the untitled-ui Star01 icon.
// When favourited, fills with teal #41D9CC. When not, outline only.
//
// Accessibility: aria-label switches between "Mark as favourite" and
// "Remove from favourites" so screen readers announce the action.
const FavouriteToggle = ({
  favourited,
  onToggle,
  size = 20,
}: {
  favourited: boolean;
  onToggle: () => void;
  size?: number;
}) => {
  const Icon = favourited ? Star02 : Star01;
  return (
    <button
      type={'button'}
      onClick={onToggle}
      aria-label={favourited ? 'Remove from favourites' : 'Mark as favourite'}
      aria-pressed={favourited}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 6,
        borderRadius: 6,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: favourited ? '#41D9CC' : '#828297',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f9f9fd';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon
        width={size}
        height={size}
        fill={favourited ? '#41D9CC' : 'none'}
      />
    </button>
  );
};

// ─── Build grouped Select options ─────────────────────────────────────
// Per AC: Favourites header at top, Dashboards header below. Each option
// shows a star icon next to the name (filled if favourited).
//
// Cloudscape Select supports `optionGroups` for grouped options.
const buildOptionGroups = (dashboards: Dashboard[]) => {
  const favs = dashboards.filter((d) => d.isFavourite);
  const others = dashboards.filter((d) => !d.isFavourite);
  return [
    ...(favs.length > 0
      ? [{
          label: 'Favourites',
          options: favs.map((d) => ({
            value: d.Id,
            label: `★ ${d.Name}`,
            description: d.Description,
          })),
        }]
      : []),
    {
      label: 'Dashboards',
      options: others.map((d) => ({
        value: d.Id,
        label: d.Name,
        description: d.Description,
      })),
    },
  ];
};

// ─── Page composition ─────────────────────────────────────────────────
const DashboardPage = ({
  dashboards: initialDashboards,
  initialSelectedId = 'd-1',
}: {
  dashboards: Dashboard[];
  initialSelectedId?: string;
}) => {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [selectedId, setSelectedId] = useState(initialSelectedId);

  const current = dashboards.find((d) => d.Id === selectedId);

  const toggleFavourite = (id: string) => {
    setDashboards((prev) =>
      prev.map((d) => (d.Id === id ? { ...d, isFavourite: !d.isFavourite } : d))
    );
  };

  const optionGroups = buildOptionGroups(dashboards);
  const selectedOption = current
    ? { value: current.Id, label: current.Name }
    : null;

  return (
    <SpaceBetween size={'l'}>
      {/* Selector + favourite toggle in a row, above the dashboard grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <Select
            selectedOption={selectedOption}
            options={optionGroups as any}
            onChange={({ detail }) => {
              if (detail.selectedOption?.value) {
                setSelectedId(detail.selectedOption.value);
              }
            }}
            placeholder={'Select a dashboard'}
            filteringType={'auto'}
          />
        </div>
        {current && (
          <FavouriteToggle
            favourited={current.isFavourite}
            onToggle={() => toggleFavourite(current.Id)}
            size={24}
          />
        )}
      </div>

      {/* Body — placeholder for the actual dashboard widgets */}
      <div
        style={{
          padding: 60,
          backgroundColor: '#ffffff',
          border: '1px solid #E8E8EC',
          borderRadius: 8,
          textAlign: 'center',
          color: '#828297',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📊</div>
        <div style={{ fontSize: 14, color: '#5C5C79' }}>
          Dashboard widgets render here.<br />
          Currently viewing: <strong style={{ color: '#14143A' }}>{current?.Name ?? '—'}</strong>
        </div>
      </div>
    </SpaceBetween>
  );
};

// ─── Page chrome wrapper ──────────────────────────────────────────────
const PageWrap = ({
  children,
  currentName,
  currentFavourited,
  onToggleFavourite,
  showActions = true,
}: {
  children: React.ReactNode;
  currentName?: string;
  currentFavourited?: boolean;
  onToggleFavourite?: () => void;
  showActions?: boolean;
}) => (
  <RealProviders initialPath={'/dashboards'}>
    <PageLayout
      title={currentName ?? 'Dashboard'}
      actions={
        showActions && currentName ? (
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            {/* Page-header star toggle — per AC, lives next to Actions */}
            {onToggleFavourite && currentFavourited !== undefined && (
              <FavouriteToggle
                favourited={currentFavourited}
                onToggle={onToggleFavourite}
                size={20}
              />
            )}
            <ActionsButton
              buttonText={'Actions'}
              items={[
                { id: 'export', text: 'Export', onItemClick: () => {} },
                { id: 'duplicate', text: 'Duplicate', onItemClick: () => {} },
                { id: 'delete', text: 'Delete', onItemClick: () => {} },
              ]}
            />
            <Button variant={'primary'}>{'Edit'}</Button>
          </SpaceBetween>
        ) : null
      }
    >
      {children}
    </PageLayout>
  </RealProviders>
);

// ─── Stories ───────────────────────────────────────────────────────────

// State-aware wrapper that connects the page-header star to the same
// favourites state as the dropdown rows.
const PageWithFavourites = ({
  initialDashboards,
  initialSelectedId = 'd-3',  // Default to non-favourited
}: {
  initialDashboards: Dashboard[];
  initialSelectedId?: string;
}) => {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const current = dashboards.find((d) => d.Id === selectedId);

  const toggleFavourite = (id: string) => {
    setDashboards((prev) =>
      prev.map((d) => (d.Id === id ? { ...d, isFavourite: !d.isFavourite } : d))
    );
  };

  return (
    <PageWrap
      currentName={current?.Name}
      currentFavourited={current?.isFavourite}
      onToggleFavourite={() => current && toggleFavourite(current.Id)}
    >
      <SpaceBetween size={'l'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <Select
              selectedOption={current ? { value: current.Id, label: current.Name } : null}
              options={buildOptionGroups(dashboards) as any}
              onChange={({ detail }) => {
                if (detail.selectedOption?.value) setSelectedId(detail.selectedOption.value);
              }}
              placeholder={'Select a dashboard'}
              filteringType={'auto'}
            />
          </div>
          {current && (
            <FavouriteToggle
              favourited={current.isFavourite}
              onToggle={() => toggleFavourite(current.Id)}
              size={24}
            />
          )}
        </div>
        <div
          style={{
            padding: 60,
            backgroundColor: '#ffffff',
            border: '1px solid #E8E8EC',
            borderRadius: 8,
            textAlign: 'center',
            color: '#828297',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📊</div>
          <div style={{ fontSize: 14, color: '#5C5C79' }}>
            Dashboard widgets render here.<br />
            Currently viewing: <strong style={{ color: '#14143A' }}>{current?.Name ?? '—'}</strong>
          </div>
        </div>
      </SpaceBetween>
    </PageWrap>
  );
};

// 1. Default — current dashboard is NOT favourited
export const Default: Story = {
  render: () => (
    <PageWithFavourites
      initialDashboards={SAMPLE_DASHBOARDS}
      initialSelectedId={'d-3'}
    />
  ),
};

// 2. Favourited — current dashboard IS favourited (filled teal star)
export const Favourited: Story = {
  render: () => (
    <PageWithFavourites
      initialDashboards={SAMPLE_DASHBOARDS}
      initialSelectedId={'d-1'}
    />
  ),
};

// 3. SelectorOpenWithFavourites — dropdown grouped: Favourites / Dashboards
//    User clicks the dropdown to see the grouping in action.
export const SelectorOpenWithFavourites: Story = {
  render: () => (
    <PageWithFavourites
      initialDashboards={SAMPLE_DASHBOARDS}
      initialSelectedId={'d-1'}
    />
  ),
};

// 4. Loading — page chrome + spinner placeholder
export const Loading: Story = {
  render: () => (
    <PageWrap currentName={'Loading…'} showActions={false}>
      <div style={{ padding: 48, textAlign: 'center', color: '#828297' }}>
        {'Loading dashboards…'}
      </div>
    </PageWrap>
  ),
};

// 5. EmptyState — no dashboards / no favourites yet
export const EmptyState: Story = {
  render: () => (
    <PageWrap currentName={'Dashboards'} showActions={false}>
      <div
        style={{
          padding: 60,
          backgroundColor: '#ffffff',
          border: '1px solid #E8E8EC',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <Star01
          width={48}
          height={48}
          style={{ color: '#828297', marginBottom: 16 }}
        />
        <div style={{ fontSize: 16, fontWeight: 600, color: '#14143A', marginBottom: 8 }}>
          {'No favourites yet'}
        </div>
        <div style={{ fontSize: 13, color: '#5C5C79', maxWidth: 320, margin: '0 auto' }}>
          {'Open any dashboard and tap the star to add it to your favourites for quick access.'}
        </div>
      </div>
    </PageWrap>
  ),
};

// 6. ErrorState — could not load dashboards
export const ErrorState: Story = {
  render: () => (
    <PageWrap currentName={'Dashboards'} showActions={false}>
      <div
        style={{
          padding: 24,
          backgroundColor: '#FDEDED',
          border: '1px solid #F2BABA',
          borderRadius: 6,
          color: '#5C0E0E',
        }}
      >
        <strong>{'Could not load dashboards. '}</strong>
        {'Check your permissions or refresh the page.'}
      </div>
    </PageWrap>
  ),
};
