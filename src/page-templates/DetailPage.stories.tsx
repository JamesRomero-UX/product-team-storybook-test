// Page Templates / Detail Page — composed template using RiskSmart custom
// wrappers. Real production PageLayout + custom Button + custom
// ControlledTabs (variant="container") wrapping container + KeyValuePairs
// content panels.
//
// Use as a starting canvas for new entity-detail pages.
import { User01 } from '@untitled-ui/icons-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Container from '@risk-smart/themed-cloudscape-components/container';
import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Multiselect from '@risk-smart/themed-cloudscape-components/multiselect';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
import { useState } from 'react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';
// eslint-disable-next-line import/no-unresolved
import ControlledTabs from 'src/components/controlled-tabs';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// eslint-disable-next-line import/no-unresolved
import ActionsButton from 'src/components/actions-button';

const meta = {
  title: 'Page Templates/Detail Page',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Real production PageLayout + custom RiskSmart Button + custom ControlledTabs wrapper (the URL-routed Tabs production uses on every detail page). Tab settings modal (the gear icon) is stubbed in Storybook — production fetches per-user tab preferences from the backend.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// Tab placeholder — simple content per tab. We're matching the live app's
// risk detail tab STRUCTURE (9 tabs, in the same order as production) with
// minimal content. The Details tab will get the full form layout in a
// follow-up step; the others stay as simple placeholders for now.
const tabPlaceholder = (label: string, hint: string) => (
  <SpaceBetween size={'l'}>
    <TabHeader description={hint}>{label}</TabHeader>
    <Container>
      <Box>
        Drop your prototype JSX for the {label.toLowerCase()} tab here.
        This placeholder will be replaced with real content as we build
        out the detail page step by step.
      </Box>
    </Container>
  </SpaceBetween>
);

// Details tab — composed form using Cloudscape FormField + Input/Textarea/
// Select/Multiselect/RadioGroup/DatePicker. Mirrors the live-app field
// list from packages/web/src/pages/risks/forms/RiskFormFields.tsx (in the
// same order). Production uses CustomisableForm + react-hook-form + Zod
// schemas — here we compose the visual layout only with simple useState.
//
// Layout: form on the left (8 cols), Risk ratings sidebar on the right (4 cols).

const tierOptions = [
  { value: '1', label: 'Tier 1' },
  { value: '2', label: 'Tier 2' },
  { value: '3', label: 'Tier 3' },
];

const parentRiskOptions = [
  { value: 'r-100', label: 'Notification Test Tier 1' },
  { value: 'r-101', label: 'Operational risk' },
  { value: 'r-102', label: 'Strategic risk' },
];

const treatmentOptions = [
  { value: 'accept', label: 'Accept' },
  { value: 'avoid', label: 'Avoid' },
  { value: 'mitigate', label: 'Mitigate' },
  { value: 'transfer', label: 'Transfer' },
];

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'retired', label: 'Retired' },
];

// People picker options — uses Cloudscape Multiselect's grouped-options
// feature + iconSvg + description (email) + tags (role) to match the
// live-app picker (sectioned dropdown with search bar, person icons,
// email lines, and role badges).
//
// Icon: User01 from @untitled-ui/icons-react with viewBox/size 28×28 —
// same as production useGroupAndUserOptions.tsx line 35:
//   iconSvg: <User01 viewBox={'0 0 28 28'} width={28} height={28} />
//
// To add more people: drop another row in either `recents` or `users`
// using the same shape.
const personIcon = <User01 viewBox={'0 0 28 28'} width={28} height={28} />;

const ownerOptionGroups = [
  {
    label: 'Recents',
    options: [
      {
        value: 'cs',
        label: 'customersupport',
        description: 'customersupport@user.com',
        tags: ['CustomerSupport'],
        iconSvg: personIcon,
      },
      {
        value: 'nb',
        label: 'nazia.begum+1',
        description: 'nazia.begum+1@risksmart.com',
        iconSvg: personIcon,
      },
      {
        value: 'qrm',
        label: 'qariskmanager',
        description: 'qariskmanager@user.com',
        tags: ['RiskManager'],
        iconSvg: personIcon,
      },
      {
        value: 'qs',
        label: 'qastandard',
        description: 'qastandard@user.com',
        tags: ['Standard'],
        iconSvg: personIcon,
      },
    ],
  },
  {
    label: 'Users',
    options: [
      {
        value: 'eb',
        label: 'Emma Bamford',
        description: 'emma.bamford@risksmart.com',
        iconSvg: personIcon,
      },
      {
        value: 'rp',
        label: 'Richard Poole',
        description: 'richard.poole@risksmart.com',
        iconSvg: personIcon,
      },
      {
        value: 'sc',
        label: 'Sarah Chen',
        description: 'sarah.chen@risksmart.com',
        iconSvg: personIcon,
      },
      {
        value: 'jr',
        label: 'James Romero',
        description: 'james.romero@risksmart.com',
        iconSvg: personIcon,
      },
      {
        value: 'cha',
        label: 'cheryladamak',
        description: 'cheryladamak@gmail.com',
        iconSvg: personIcon,
      },
    ],
  },
];

// Flat list for the simple cases (Owner default values).
const ownerOptions = ownerOptionGroups.flatMap((g) => g.options);

const tagOptions = [
  { value: 'tag1', label: 'Tag 1' },
  { value: 'tag2', label: 'Tag 2' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'cyber', label: 'Cyber' },
];

const departmentOptions = [
  { value: 'tech', label: 'Technology' },
  { value: 'risk', label: 'Risk Management' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'finance', label: 'Finance' },
];

const DetailsTabContent = () => {
  // All field state. Defaults match the screenshot James shared (R-125 Technology)
  // so the rendered story looks like the actual production page.
  const [riskName, setRiskName] = useState('Technology');
  const [description, setDescription] = useState(
    'Technology risk is the potential for technology failures or shortfalls to disrupt a business or cause losses. It can involve information security incidents, cyber attacks, service outages, project failures, or uncertainty about technological development. Technology risk management is a part of enterprise risk management that aims to anticipate and mitigate potential problems.'
  );
  const [owners, setOwners] = useState([
    { value: 'eb', label: 'Emma Bamford' },
    { value: 'rp', label: 'Richard Poole' },
  ]);
  const [tier, setTier] = useState('2');
  const [parentRisk, setParentRisk] = useState<{ value: string; label: string } | null>(
    parentRiskOptions[0]
  );
  const [status, setStatus] = useState<{ value: string; label: string } | null>(
    statusOptions[2]
  );
  const [treatment, setTreatment] = useState<{ value: string; label: string } | null>(null);
  const [contributors, setContributors] = useState<typeof ownerOptions>([]);
  const [tags, setTags] = useState([{ value: 'tag1', label: 'Tag 1' }]);
  const [departments, setDepartments] = useState<typeof departmentOptions>([]);
  const [startDate, setStartDate] = useState('');

  return (
    /* Layout — lifted from packages/web/src/components/form/form/PageWrapper.tsx.
       Production uses flexbox: form column = `flex-1` (fills all remaining
       space, fields stretch to wrap container), sidebar = `max-width: 350px`
       (see formSidebar in form/form/style.module.scss). NOT a 12-col Grid —
       a Grid with 8/4 colspans makes the sidebar a third of the width,
       which is too wide. */
    <div className={'flex gap-5 justify-between'} style={{ width: '100%' }}>
      <div className={'flex-1'} style={{ minWidth: 0 }}>
      {/* Form column — production wraps in <form> + Cloudscape <Form header>
          + FormInner (SpaceBetween size='l'), NOT a Container. The "Details"
          heading is a TabHeader (h2) outside any panel chrome. See
          packages/web/src/components/form/form/PageWrapper.tsx and
          pages/risks/update/tabs/details/Tab.tsx. */}
      <SpaceBetween size={'l'}>
        <TabHeader>{'Details'}</TabHeader>
        <SpaceBetween size={'l'}>
          <FormField label={'Risk name'}>
            <Input
              value={riskName}
              onChange={({ detail }) => setRiskName(detail.value)}
              type={'search'}
            />
          </FormField>

          <FormField label={'Description'}>
            <Textarea
              value={description}
              onChange={({ detail }) => setDescription(detail.value)}
              rows={4}
            />
          </FormField>

          <FormField label={'Owner'}>
            <Multiselect
              selectedOptions={owners}
              onChange={({ detail }) =>
                setOwners(detail.selectedOptions as typeof ownerOptions)
              }
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
              items={tierOptions}
            />
          </FormField>

          <FormField label={'Parent risk'}>
            <Select
              selectedOption={parentRisk}
              onChange={({ detail }) =>
                setParentRisk(detail.selectedOption as typeof parentRiskOptions[0])
              }
              options={parentRiskOptions}
              placeholder={'Select parent risk'}
              filteringType={'auto'}
            />
          </FormField>

          <FormField label={'Risk status (optional)'}>
            <Select
              selectedOption={status}
              onChange={({ detail }) =>
                setStatus(detail.selectedOption as typeof statusOptions[0])
              }
              options={statusOptions}
              placeholder={'Select status'}
              filteringType={'auto'}
            />
          </FormField>

          <FormField label={'Risk treatment (optional)'}>
            <Select
              selectedOption={treatment}
              onChange={({ detail }) =>
                setTreatment(detail.selectedOption as typeof treatmentOptions[0])
              }
              options={treatmentOptions}
              placeholder={'Select risk treatment'}
              filteringType={'auto'}
            />
          </FormField>

          <FormField label={'Contributor (optional)'}>
            <Multiselect
              selectedOptions={contributors}
              onChange={({ detail }) =>
                setContributors(detail.selectedOptions as typeof ownerOptions)
              }
              options={ownerOptionGroups}
              placeholder={'Select people'}
              filteringType={'auto'}
              tokenLimit={5}
            />
          </FormField>

          <FormField label={'Tags (optional)'}>
            <Multiselect
              selectedOptions={tags}
              onChange={({ detail }) =>
                setTags(detail.selectedOptions as typeof tagOptions)
              }
              options={tagOptions}
              placeholder={'Select'}
              filteringType={'auto'}
            />
          </FormField>

          <FormField label={'Departments (optional)'}>
            <Multiselect
              selectedOptions={departments}
              onChange={({ detail }) =>
                setDepartments(detail.selectedOptions as typeof departmentOptions)
              }
              options={departmentOptions}
              placeholder={'Select'}
              filteringType={'auto'}
            />
          </FormField>

          {/* Test schedule section — separated by a sub-header */}
          <Header variant={'h3'}>{'Test schedule'}</Header>

          <FormField label={'Start date (optional)'}>
            <DatePicker
              value={startDate}
              onChange={({ detail }) => setStartDate(detail.value)}
              placeholder={'dd/mm/yyyy'}
            />
          </FormField>
        </SpaceBetween>

        {/* Bottom action bar — lifted from
            packages/web/src/components/form/form/FormActions.tsx.
            Production renders ONLY Save (primary teal) + Cancel (normal)
            here. Delete lives in the Actions dropdown at the top of the
            page (Actions → Delete), not in the form footer. There is no
            Edit button in the form footer either — Edit is the top-right
            page action that toggles the form into edit mode. */}
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button variant={'primary'} onClick={() => {}}>{'Save'}</Button>
          <Button variant={'normal'} onClick={() => {}}>{'Cancel'}</Button>
        </SpaceBetween>
      </SpaceBetween>

      {/* Right sidebar — Risk ratings panel.
          Lifted verbatim from
          packages/web/src/components/latest-ratings-preview/LatestRiskRatingsReview.tsx.
          Outer panel: p-5 bg-off_white rounded-md flex flex-col gap-4.
          Each rating is its own white card: p-4 bg-white border-2
          border-grey150 rounded-md flex gap-2, with title (h4
          font-semibold text-gray-300) + test-date stacked on the left
          and the rating badge pinned to the right. */}
      </div>
      {/* Sidebar — fixed max-width 350px, matching production formSidebar
          SCSS (max-width: 350px; width: 100%). */}
      <div style={{ maxWidth: 350, width: '100%' }}>
      <div
        className={
          'p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start'
        }
        style={{ backgroundColor: '#f9f9fd' }}
      >
        <span
          className={'m-0 font-semibold text-grey500'}
          style={{ color: '#5C5C79' }}
        >
          {'Risk ratings'}
        </span>

        {/* Inherent rating card */}
        <div
          className={
            'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex gap-2'
          }
          style={{ backgroundColor: '#ffffff', borderColor: '#E8E8EC' }}
        >
          <div className={'flex-auto space-y-4'}>
            <h4
              className={'m-0 font-semibold text-gray-300'}
              style={{ margin: 0, color: '#828297', fontWeight: 600 }}
            >
              {'Inherent'}
            </h4>
            <div className={'text-xs'} style={{ fontSize: 12 }}>
              <span
                className={'font-semibold text-gray-400'}
                style={{ color: '#5C5C79', fontWeight: 600 }}
              >
                {'Test date: '}
              </span>
              <span>{'-'}</span>
            </div>
          </div>
          <div className={'justify-end'} style={{ alignSelf: 'center' }}>
            <SimpleRatingBadge
              rating={{ color: 'darker-green', label: 'Low' }}
            />
          </div>
        </div>

        {/* Residual rating card */}
        <div
          className={
            'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex gap-2'
          }
          style={{ backgroundColor: '#ffffff', borderColor: '#E8E8EC' }}
        >
          <div className={'flex-auto space-y-4'}>
            <h4
              className={'m-0 font-semibold text-gray-300'}
              style={{ margin: 0, color: '#828297', fontWeight: 600 }}
            >
              {'Residual'}
            </h4>
            <div className={'text-xs'} style={{ fontSize: 12 }}>
              <span
                className={'font-semibold text-gray-400'}
                style={{ color: '#5C5C79', fontWeight: 600 }}
              >
                {'Test date: '}
              </span>
              <span>{'-'}</span>
            </div>
          </div>
          <div className={'justify-end'} style={{ alignSelf: 'center' }}>
            <SimpleRatingBadge
              rating={{ color: 'darker-green', label: 'Minimal' }}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

const detailsTab = <DetailsTabContent />;

// Tab structure — mirrors live-app risk detail page tabs in same order as
// production (see risksmart-app/packages/web/src/pages/risks/update/Page.tsx
// line 270 — uses ControlledTabs with these exact tab IDs and variant="container").
const RISK_DETAIL_TABS = [
  { label: 'Details', id: 'details', content: detailsTab },
  { label: 'Controls', id: 'controls', content: tabPlaceholder('Controls', 'Linked controls for this risk.') },
  { label: 'Ratings', id: 'ratings', content: tabPlaceholder('Ratings', 'Inherent and residual rating history.') },
  { label: 'Appetite', id: 'appetites', content: tabPlaceholder('Appetite', 'Linked risk appetite statements.') },
  { label: 'Acceptances', id: 'acceptances', content: tabPlaceholder('Acceptances', 'Risk acceptance records.') },
  { label: 'Actions', id: 'actions', content: tabPlaceholder('Actions', 'Mitigation actions linked to this risk.') },
  { label: 'Indicators', id: 'indicators', content: tabPlaceholder('Indicators', 'Linked KRIs.') },
  { label: 'Approvals', id: 'approvals', content: tabPlaceholder('Approvals', 'Approval workflow status.') },
  { label: 'Linked items', id: 'linkedItems', content: tabPlaceholder('Linked items', 'Cross-entity links.') },
];

const DetailPageContent = () => {
  const [activeTabId, setActiveTabId] = useState('details');
  return (
    <ControlledTabs
      variant={'container'}
      activeTabId={activeTabId}
      onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
      tabs={RISK_DETAIL_TABS}
    />
  );
};

export const Default: Story = {
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
              { id: 'duplicate', text: 'Duplicate', onItemClick: () => {} },
              { id: 'archive', text: 'Archive', onItemClick: () => {} },
              { id: 'delete', text: 'Delete', onItemClick: () => {} },
            ]}
          />
        }
      >
        <DetailPageContent />
      </PageLayout>
    </RealProviders>
  ),
};
