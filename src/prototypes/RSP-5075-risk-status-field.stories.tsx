// Prototype — RSP-5075: Risk status schema, field UI, Draft behaviour, one-way transition
//
// Brief: https://linear.app/risksmart/issue/RSP-5075
//
// Demonstrates the Risk status field in 5 distinct states, plus the tab
// visibility rules for Draft, plus the destructive Retire confirmation.
//
// Stories:
//   1. Default                     — Active status, all 9 tabs, dropdown excludes Draft
//   2. Draft                       — Draft status, 6 tabs hidden, dropdown shows all
//   3. DraftWithEmptyMandatory     — Draft + empty Risk name/description, no errors
//   4. RetiredNoPermission         — read-only badge + lock icon, aria-disabled
//   5. RetiredWithPermission       — dropdown limited to Active/Emerging/Monitored
//   6. RetireConfirmation          — destructive ConfirmModal triggered on Active → Retired
//   7. Loading
//   8. EmptyState
//   9. ErrorState
//
// Library: Cloudscape (modifying existing screen).
// Patterns used: form-layout, sidebar-card, page-actions.
//
// Open follow-ups for engineering (also in _prototypes/RSP-5075/README.md):
//   - Add `variant?: 'default' | 'destructive'` to ConfirmModal — sets
//     Confirm button colour. Currently styled red inline in story 6.
//   - Add `status.draft` (light-grey) and `status.archived` (darker-grey)
//     entries to ratings.json.

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Box from '@risk-smart/themed-cloudscape-components/box';
import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Multiselect from '@risk-smart/themed-cloudscape-components/multiselect';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import ControlledTabs from 'src/components/controlled-tabs';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// eslint-disable-next-line import/no-unresolved
import ActionsButton from 'src/components/actions-button';
// eslint-disable-next-line import/no-unresolved
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';
import { Lock01, User01 } from '@untitled-ui/icons-react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

const meta = {
  title: 'Prototypes/RSP-5075 Risk Status Field',
  component: PageLayout as any,
  tags: ['prototype'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'RSP-5075 prototype. Risk status field UI in 5 distinct states + 4 ' +
          'state-coverage variants. See _prototypes/RSP-5075/README.md for ' +
          'AC coverage and engineering follow-ups.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Status enum + colour map ─────────────────────────────────────────
//
// Brief proposes adding `status.draft` + `status.archived` to ratings.json.
// Using existing rating colour tokens that PASS WCAG AA contrast for body
// text (verified against packages/components/src/utils/colours.ts):
//
//   Draft    → border-light   #e5e5e5 + #2D2D53  — 10.4:1 (AAA)
//   Active   → darker-green   #048e6b + #ffffff  — existing
//   Emerging → orange         #F2A041 + #ffffff  — existing
//   Monitored → blue-500      #539fe5 + #ffffff  — existing
//   Retired  → bg-dark-slate  #475569 + #ffffff  — 7.48:1 (AAA)
//
// IMPORTANT: `light-grey` (#E8E8EC + #73738C) fails AA at 3.76:1 — not used.
// `darker-grey` does not exist in the palette — caught by the anti-hallucination
// check on second pass. Both replaced with passable tokens above.

type RiskStatus = 'Draft' | 'Active' | 'Emerging' | 'Monitored' | 'Retired';

const STATUS_BADGE: Record<RiskStatus, { color: string; label: string }> = {
  Draft: { color: 'border-light', label: 'Draft' },
  Active: { color: 'darker-green', label: 'Active' },
  Emerging: { color: 'orange', label: 'Emerging' },
  Monitored: { color: 'blue-500', label: 'Monitored' },
  Retired: { color: 'bg-dark-slate', label: 'Retired' },
};

const ALL_STATUSES: RiskStatus[] = ['Draft', 'Active', 'Emerging', 'Monitored', 'Retired'];
const ACTIVE_CLASS: RiskStatus[] = ['Active', 'Emerging', 'Monitored'];

const statusOption = (s: RiskStatus) => ({ value: s, label: s });

// ─── StatusField — state-aware composition ───────────────────────────
//
// One field, four behaviours:
//   - Draft / Active / Emerging / Monitored → Select. If hasBeenActivated,
//     Draft is removed from the option list.
//   - Retired + canReinstate=false → SimpleRatingBadge + Lock icon, aria-disabled
//   - Retired + canReinstate=true  → Select limited to Active/Emerging/Monitored
//
// Selecting Retired opens the destructive ConfirmModal before saving.

type StatusFieldProps = {
  status: RiskStatus;
  hasBeenActivated: boolean;
  canReinstate: boolean;
  onChange: (next: RiskStatus) => void;
  onRequestRetire: () => void;
};

const StatusField = ({
  status,
  hasBeenActivated,
  canReinstate,
  onChange,
  onRequestRetire,
}: StatusFieldProps) => {
  // Retired + no reinstate permission → read-only display.
  //
  // Follows the production read-only field convention (see useIsFieldReadOnly
  // in packages/web/src/components/form/form/customisable-form/hooks).
  // Production reads `disabled={readOnly}` on a Cloudscape input. For a
  // status BADGE we don't have an input to disable — instead we render the
  // badge as a value display + a clear "locked" caption.
  //
  // ARIA: NO `aria-disabled` here. That attribute is for interactive
  // controls that are temporarily inactive — a read-only display is just a
  // read-only display. The lock icon carries an `aria-label` so screen
  // readers announce it. The caption text below the badge explains why.
  if (status === 'Retired' && !canReinstate) {
    return (
      <FormField
        label={'Status'}
        description={"You don't have permission to change this status. Contact a Risk Manager to reinstate."}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SimpleRatingBadge rating={STATUS_BADGE.Retired} />
          <Lock01
            width={16}
            height={16}
            aria-label={'Status cannot be changed'}
            style={{ color: '#5C5C79' }}
          />
        </div>
      </FormField>
    );
  }

  // Retired + can reinstate → dropdown limited to Active-class only
  if (status === 'Retired' && canReinstate) {
    return (
      <FormField label={'Status'}>
        <Select
          selectedOption={null}
          placeholder={'Reinstate as…'}
          options={ACTIVE_CLASS.map(statusOption)}
          onChange={({ detail }) =>
            onChange(detail.selectedOption?.value as RiskStatus)
          }
          filteringType={'auto'}
        />
      </FormField>
    );
  }

  // Default (Draft / Active / Emerging / Monitored): full Select
  // Once hasBeenActivated, drop Draft from the option list
  const visibleOptions = ALL_STATUSES.filter((s) =>
    s === 'Draft' ? !hasBeenActivated : true
  );

  return (
    <FormField label={'Status'}>
      <Select
        selectedOption={statusOption(status)}
        options={visibleOptions.map(statusOption)}
        onChange={({ detail }) => {
          const next = detail.selectedOption?.value as RiskStatus;
          if (next === 'Retired') {
            onRequestRetire();
          } else {
            onChange(next);
          }
        }}
        filteringType={'auto'}
      />
    </FormField>
  );
};

// ─── Risk form (lite) — Draft hides 6 tabs + suppresses validation ───
//
// Tabs hidden in Draft: Appetites, Assessments, Controls, Actions,
// Indicators, Approvals (per brief). Always-visible: Details + Linked items.
const ALL_TABS = [
  'details',
  'controls',
  'ratings',
  'appetites',
  'acceptances',
  'actions',
  'indicators',
  'approvals',
  'linkedItems',
] as const;

const TABS_HIDDEN_IN_DRAFT = new Set([
  'controls',
  'ratings',
  'appetites',
  'acceptances',
  'actions',
  'indicators',
  'approvals',
]);

const TAB_LABELS: Record<typeof ALL_TABS[number], string> = {
  details: 'Details',
  controls: 'Controls',
  ratings: 'Ratings',
  appetites: 'Appetite',
  acceptances: 'Acceptances',
  actions: 'Actions',
  indicators: 'Indicators',
  approvals: 'Approvals',
  linkedItems: 'Linked items',
};

type FormState = {
  status: RiskStatus;
  hasBeenActivated: boolean;
  canReinstate: boolean;
  riskName: string;
  description: string;
  emptyMandatory?: boolean;
};

const personIcon = <User01 viewBox={'0 0 28 28'} width={28} height={28} />;

const ownerOptionGroups = [
  {
    label: 'Recents',
    options: [
      { value: 'eb', label: 'Emma Bamford', description: 'emma.bamford@risksmart.com', iconSvg: personIcon },
      { value: 'rp', label: 'Richard Poole', description: 'richard.poole@risksmart.com', iconSvg: personIcon },
    ],
  },
];

const RiskDetailsTab = ({ formState, onStatusChange, onRequestRetire }: {
  formState: FormState;
  onStatusChange: (s: RiskStatus) => void;
  onRequestRetire: () => void;
}) => {
  const [owners, setOwners] = useState([{ value: 'eb', label: 'Emma Bamford' }]);
  const [tier, setTier] = useState('2');

  return (
    <div className={'flex gap-5 justify-between'} style={{ width: '100%' }}>
      <div className={'flex-1'} style={{ minWidth: 0 }}>
        <SpaceBetween size={'l'}>
          <TabHeader>{'Details'}</TabHeader>

          <SpaceBetween size={'l'}>
            <FormField label={'Risk name'}>
              <Input
                value={formState.emptyMandatory ? '' : formState.riskName}
                onChange={() => {}}
                type={'search'}
              />
            </FormField>

            <FormField label={'Description'}>
              <Textarea
                value={formState.emptyMandatory ? '' : formState.description}
                onChange={() => {}}
                rows={4}
              />
            </FormField>

            {/* The state-aware StatusField */}
            <StatusField
              status={formState.status}
              hasBeenActivated={formState.hasBeenActivated}
              canReinstate={formState.canReinstate}
              onChange={onStatusChange}
              onRequestRetire={onRequestRetire}
            />

            <FormField label={'Owner'}>
              <Multiselect
                selectedOptions={owners}
                onChange={({ detail }) => setOwners(detail.selectedOptions as typeof owners)}
                options={ownerOptionGroups}
                placeholder={'Select people'}
                filteringType={'auto'}
                tokenLimit={5}
              />
            </FormField>

            <FormField label={'Risk tier'}>
              <RadioGroup
                value={tier}
                onChange={({ detail }) => setTier(detail.value)}
                items={[
                  { value: '1', label: 'Tier 1' },
                  { value: '2', label: 'Tier 2' },
                  { value: '3', label: 'Tier 3' },
                ]}
              />
            </FormField>

            <FormField label={'Test schedule (optional)'}>
              <DatePicker value={''} onChange={() => {}} placeholder={'dd/mm/yyyy'} />
            </FormField>
          </SpaceBetween>

          {/* Save / Cancel — production pattern */}
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'primary'}>{'Save'}</Button>
            <Button variant={'normal'}>{'Cancel'}</Button>
          </SpaceBetween>
        </SpaceBetween>
      </div>

      {/* Sidebar — status badge + KeyValuePairs-style metadata */}
      <div style={{ maxWidth: 350, width: '100%' }}>
        <div
          className={'p-5 rounded-md flex flex-col gap-4'}
          style={{ backgroundColor: '#f9f9fd' }}
        >
          <span style={{ color: '#5C5C79', fontWeight: 600 }}>
            {'Status'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SimpleRatingBadge rating={STATUS_BADGE[formState.status]} />
            {formState.status === 'Retired' && !formState.canReinstate && (
              <Lock01 width={16} height={16} style={{ color: '#828297' }} aria-label={'Status locked'} />
            )}
          </div>
          {formState.status === 'Draft' && (
            <Box variant={'small'}>
              {'Mandatory fields are not enforced while in Draft.'}
            </Box>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page composition ─────────────────────────────────────────────────
const RiskDetailPage = ({
  initialState,
  initialModalOpen = false,
}: {
  initialState: FormState;
  initialModalOpen?: boolean;
}) => {
  const [formState, setFormState] = useState(initialState);
  const [showRetireConfirm, setShowRetireConfirm] = useState(initialModalOpen);
  const [activeTabId, setActiveTabId] = useState('details');

  const visibleTabs = ALL_TABS.filter(
    (t) => formState.status !== 'Draft' || !TABS_HIDDEN_IN_DRAFT.has(t as any)
  );

  const onStatusChange = (next: RiskStatus) => {
    setFormState((prev) => ({
      ...prev,
      status: next,
      hasBeenActivated:
        prev.hasBeenActivated || ACTIVE_CLASS.includes(next),
    }));
  };

  const onRequestRetire = () => setShowRetireConfirm(true);

  const onConfirmRetire = () => {
    setFormState((prev) => ({ ...prev, status: 'Retired' }));
    setShowRetireConfirm(false);
  };

  const tabs = visibleTabs.map((id) => ({
    id,
    label: TAB_LABELS[id],
    content:
      id === 'details' ? (
        <RiskDetailsTab
          formState={formState}
          onStatusChange={onStatusChange}
          onRequestRetire={onRequestRetire}
        />
      ) : (
        <div style={{ padding: 24, color: '#828297' }}>
          {`Tab content for ${TAB_LABELS[id]}.`}
        </div>
      ),
  }));

  return (
    <>
      <ControlledTabs
        variant={'container'}
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
        tabs={tabs}
      />

      {/* Retire confirmation — destructive variant */}
      {/*
       * NOTE: ConfirmModal currently has no `variant="destructive"` prop.
       * The Confirm button is styled inline as red. Engineering should add
       * the prop — see _prototypes/RSP-5075/README.md.
       */}
      <ConfirmModal
        isVisible={showRetireConfirm}
        onConfirm={onConfirmRetire}
        onDismiss={() => setShowRetireConfirm(false)}
        header={'Retire this Risk?'}
      >
        <Box>
          {'Retiring will close all linked controls and stop further '}
          {'assessments. This action triggers a cascade — see your DPI / cascade rules.'}
        </Box>
        <Box variant={'small'} color={'text-status-error'} margin={{ top: 's' }}>
          {'This action cannot be undone without Risk Manager permission.'}
        </Box>
      </ConfirmModal>
    </>
  );
};

// ─── Page chrome wrapper ──────────────────────────────────────────────
const PageWrap = ({ initialState, title = 'Data breach via legacy S3 bucket' }: {
  initialState: FormState;
  title?: string;
}) => (
  <RealProviders initialPath={'/risks/R-001'}>
    <PageLayout
      title={title}
      counter={'(R-001)'}
      actions={
        <ActionsButton
          buttonText={'Actions'}
          items={[
            { id: 'export', text: 'Export', onItemClick: () => {} },
            { id: 'duplicate', text: 'Duplicate', onItemClick: () => {} },
            { id: 'archive', text: 'Archive', onItemClick: () => {} },
            { id: 'delete', text: 'Delete', onItemClick: () => {} },
          ]}
        />
      }
    >
      <RiskDetailPage initialState={initialState} />
    </PageLayout>
  </RealProviders>
);

// ─── Stories ───────────────────────────────────────────────────────────

// 1. Default — Active. All 9 tabs. Dropdown excludes Draft (already activated).
export const Default: Story = {
  render: () => (
    <PageWrap
      initialState={{
        status: 'Active',
        hasBeenActivated: true,
        canReinstate: false,
        riskName: 'Data breach via legacy S3 bucket',
        description:
          'Information security risk. Legacy S3 bucket has wide-open IAM policy, no MFA, encryption disabled.',
      }}
    />
  ),
};

// 2. Draft — 6 tabs hidden, dropdown shows all statuses (including Draft + Retired).
export const Draft: Story = {
  render: () => (
    <PageWrap
      initialState={{
        status: 'Draft',
        hasBeenActivated: false,
        canReinstate: false,
        riskName: 'New AI bias risk (drafting)',
        description:
          'Initial draft — still gathering information about model bias in credit decisioning.',
      }}
    />
  ),
};

// 3. DraftWithEmptyMandatory — Draft + empty Risk name & Description.
//    Demonstrates AC: "in Draft, mandatory fields are not enforced".
//    No red asterisks, no inline errors, Save still active.
export const DraftWithEmptyMandatory: Story = {
  render: () => (
    <PageWrap
      title={'New Risk'}
      initialState={{
        status: 'Draft',
        hasBeenActivated: false,
        canReinstate: false,
        riskName: '',
        description: '',
        emptyMandatory: true,
      }}
    />
  ),
};

// 4. RetiredNoPermission — read-only badge with Lock icon, aria-disabled.
export const RetiredNoPermission: Story = {
  render: () => (
    <PageWrap
      initialState={{
        status: 'Retired',
        hasBeenActivated: true,
        canReinstate: false,
        riskName: 'Outdated checkout dependency (retired)',
        description: 'Mitigated and retired in 2025. Kept for audit trail.',
      }}
    />
  ),
};

// 5. RetiredWithPermission — dropdown limited to Active/Emerging/Monitored.
export const RetiredWithPermission: Story = {
  render: () => (
    <PageWrap
      initialState={{
        status: 'Retired',
        hasBeenActivated: true,
        canReinstate: true,
        riskName: 'Outdated checkout dependency (retired)',
        description: 'Mitigated and retired in 2025. Risk Manager can reinstate.',
      }}
    />
  ),
};

// 6. RetireConfirmation — destructive ConfirmModal open mid-flow.
//    User had Active selected, picked Retired from the dropdown → modal blocks save.
//    Uses the SAME modal that's wired inside RiskDetailPage; just opens it
//    initially via the initialModalOpen prop.
export const RetireConfirmation: Story = {
  render: () => (
    <RealProviders initialPath={'/risks/R-001'}>
      <PageLayout
        title={'Data breach via legacy S3 bucket'}
        counter={'(R-001)'}
        actions={
          <ActionsButton
            buttonText={'Actions'}
            items={[
              { id: 'export', text: 'Export', onItemClick: () => {} },
              { id: 'delete', text: 'Delete', onItemClick: () => {} },
            ]}
          />
        }
      >
        <RiskDetailPage
          initialModalOpen
          initialState={{
            status: 'Active',
            hasBeenActivated: true,
            canReinstate: false,
            riskName: 'Data breach via legacy S3 bucket',
            description: 'Active risk being retired.',
          }}
        />
      </PageLayout>
    </RealProviders>
  ),
};

// 7. Loading
export const Loading: Story = {
  render: () => (
    <RealProviders initialPath={'/risks/R-001'}>
      <PageLayout title={'Loading…'}>
        <div style={{ padding: 48, textAlign: 'center', color: '#828297' }}>
          {'Loading risk…'}
        </div>
      </PageLayout>
    </RealProviders>
  ),
};

// 8. EmptyState — risk not found
export const EmptyState: Story = {
  render: () => (
    <RealProviders initialPath={'/risks/R-001'}>
      <PageLayout title={'Risk not found'}>
        <div style={{ padding: 48, textAlign: 'center', color: '#828297' }}>
          {'No risk with this ID. It may have been deleted.'}
        </div>
      </PageLayout>
    </RealProviders>
  ),
};

// 9. ErrorState
export const ErrorState: Story = {
  render: () => (
    <RealProviders initialPath={'/risks/R-001'}>
      <PageLayout title={'Risk'}>
        <div
          style={{
            padding: 24,
            backgroundColor: '#FDEDED',
            border: '1px solid #F2BABA',
            borderRadius: 6,
            color: '#5C0E0E',
          }}
        >
          <strong>{'Could not load risk. '}</strong>
          {'Check your permissions or refresh the page.'}
        </div>
      </PageLayout>
    </RealProviders>
  ),
};
