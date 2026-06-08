// Page Templates / Create Page — the canonical "new entity" template.
//
// Composed against production:
//   - pages/risks/create/Page.tsx
//   - pages/risks/forms/RiskForm.tsx
//   - pages/risks/forms/RiskFormFields.tsx
//   - components/form/form/PageWrapper.tsx (the wrapping Cloudscape Form)
//   - pages/compliance/obligations/create/Page.tsx (same shape)
//
// What makes it distinct from Detail Page:
//   - Title is "Create new <entity>" — no counter (entity has no Id yet)
//   - No Actions dropdown or Edit button on the page header
//   - All non-Details tabs are DISABLED (Controls, Ratings etc. need an
//     existing entity to attach to)
//   - `disableSettings` hides the per-tab settings cog
//   - The fields live inside a Cloudscape <Form> with header (TabHeader)
//     and actions (Save / Cancel at bottom-right) — same as production
//     PageWrapper.tsx
//
// Use as the canvas for any new "Create X" page.

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import Form from '@risk-smart/themed-cloudscape-components/form';
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
import { User01 } from '@untitled-ui/icons-react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

const meta = {
  title: 'Page Templates/Create Page',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Production Create template — mirrors pages/risks/create/Page.tsx ' +
          'and PageWrapper.tsx (the Cloudscape <Form> wrap). Title only, ' +
          'no Actions/Edit on the page header, all tabs visible but ' +
          'disabled except Details, Save/Cancel rendered by the Form ' +
          "actions slot at bottom-right.",
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample options ────────────────────────────────────────────────────
const personIcon = <User01 viewBox={'0 0 28 28'} width={28} height={28} />;

const ownerOptionGroups = [
  {
    label: 'Recents',
    options: [
      { value: 'eb', label: 'Emma Bamford', description: 'emma.bamford@risksmart.com', iconSvg: personIcon },
      { value: 'rp', label: 'Richard Poole', description: 'richard.poole@risksmart.com', iconSvg: personIcon },
    ],
  },
  {
    label: 'Users',
    options: [
      { value: 'eb', label: 'Emma Bamford', description: 'emma.bamford@risksmart.com', iconSvg: personIcon },
      { value: 'rp', label: 'Richard Poole', description: 'richard.poole@risksmart.com', iconSvg: personIcon },
      { value: 'jr', label: 'James Romero', description: 'james.romero@risksmart.com', iconSvg: personIcon },
    ],
  },
];

const parentRiskOptions = [
  { value: 'r-100', label: 'Information security' },
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
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'emerging', label: 'Emerging' },
  { value: 'monitored', label: 'Monitored' },
];

const tagOptions = [
  { value: 'cyber', label: 'Cyber' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'operational', label: 'Operational' },
];

const departmentOptions = [
  { value: 'risk', label: 'Risk' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'finance', label: 'Finance' },
];

// ─── Details tab content ──────────────────────────────────────────────
//
// Matches the production form structure:
//   <Form header={<TabHeader>Details</TabHeader>} actions={Save/Cancel}>
//     <div className='flex gap-5 justify-between'>
//       <div className='flex-1'>
//         <SpaceBetween size='l'>
//           <FormField ... />  // RiskFormFields rendered here
//         </SpaceBetween>
//       </div>
//     </div>
//   </Form>
//
// (PageWrapper.tsx renders this structure; we inline it here for the
// prototype because FormProvider/react-hook-form/CustomisableForm are
// too deep to lift without GraphQL.)
const DetailsTab = ({
  name = '',
  description = '',
  showErrors = false,
  saving = false,
  errorBanner = false,
  onSubmit = () => {},
}: {
  name?: string;
  description?: string;
  showErrors?: boolean;
  saving?: boolean;
  errorBanner?: boolean;
  onSubmit?: () => void;
}) => {
  const [riskName, setRiskName] = useState(name);
  const [desc, setDesc] = useState(description);
  const [owners, setOwners] = useState<typeof ownerOptionGroups[0]['options']>([]);
  const [tier, setTier] = useState('2');
  const [parentRisk, setParentRisk] = useState<{ value: string; label: string } | null>(null);
  const [status, setStatus] = useState<{ value: string; label: string } | null>(statusOptions[0]);
  const [treatment, setTreatment] = useState<{ value: string; label: string } | null>(null);
  const [contributors, setContributors] = useState<typeof ownerOptionGroups[0]['options']>([]);
  const [tags, setTags] = useState<typeof tagOptions>([]);
  const [departments, setDepartments] = useState<typeof departmentOptions>([]);
  const [startDate, setStartDate] = useState('');

  // Validation: title and description are required in the production schema
  const nameError = showErrors && !riskName ? 'Title is required' : undefined;
  const descError = showErrors && !desc ? 'Description is required' : undefined;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form
        header={<TabHeader>{'Details'}</TabHeader>}
        actions={
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'normal'} disabled={saving}>
              {'Cancel'}
            </Button>
            <Button variant={'primary'} loading={saving} onClick={onSubmit}>
              {saving ? 'Saving' : 'Save'}
            </Button>
          </SpaceBetween>
        }
      >
        <div className={'flex gap-5 justify-between'}>
          <div className={'flex-1'}>
            <SpaceBetween size={'l'}>
              {/* Server error banner — production uses Cloudscape Alert */}
              {errorBanner && (
                <Alert type={'error'} statusIconAriaLabel={'Error'}>
                  {'A risk with this name already exists. Try a different name.'}
                </Alert>
              )}

              <FormField label={'Title'} errorText={nameError} description={'A short, distinctive name for the risk.'}>
                <Input
                  value={riskName}
                  onChange={({ detail }) => setRiskName(detail.value)}
                  placeholder={'e.g. Data breach via legacy S3 bucket'}
                  invalid={!!nameError}
                />
              </FormField>

              <FormField
                label={'Description'}
                errorText={descError}
                description={'What is the risk? What could happen?'}
              >
                <Textarea
                  value={desc}
                  onChange={({ detail }) => setDesc(detail.value)}
                  rows={4}
                  invalid={!!descError}
                />
              </FormField>

              <FormField label={'Tier'} description={'How high in the risk hierarchy this sits.'}>
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

              {tier !== '1' && (
                <FormField label={'Parent risk'} description={'Pick a parent at the tier above.'}>
                  <Select
                    selectedOption={parentRisk}
                    onChange={({ detail }) =>
                      setParentRisk(detail.selectedOption as typeof parentRiskOptions[0])
                    }
                    options={parentRiskOptions}
                    placeholder={'Select'}
                    filteringType={'auto'}
                  />
                </FormField>
              )}

              <FormField label={'Treatment'} description={'How will this risk be handled?'}>
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

              <FormField label={'Status'}>
                <Select
                  selectedOption={status}
                  onChange={({ detail }) =>
                    setStatus(detail.selectedOption as typeof statusOptions[0])
                  }
                  options={statusOptions}
                />
              </FormField>

              <FormField label={'Owner'} description={'Who owns this risk?'}>
                <Multiselect
                  selectedOptions={owners}
                  onChange={({ detail }) =>
                    setOwners(detail.selectedOptions as typeof owners)
                  }
                  options={ownerOptionGroups}
                  placeholder={'Select people'}
                  filteringType={'auto'}
                  tokenLimit={5}
                />
              </FormField>

              <FormField label={'Contributor'} description={'Anyone else who should be able to update this risk.'}>
                <Multiselect
                  selectedOptions={contributors}
                  onChange={({ detail }) =>
                    setContributors(detail.selectedOptions as typeof contributors)
                  }
                  options={ownerOptionGroups}
                  placeholder={'Select people'}
                  filteringType={'auto'}
                  tokenLimit={5}
                />
              </FormField>

              <FormField label={'Tags'}>
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

              <FormField label={'Departments'}>
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

              <FormField label={'Start date'}>
                <DatePicker
                  value={startDate}
                  onChange={({ detail }) => setStartDate(detail.value)}
                  placeholder={'YYYY/MM/DD'}
                />
              </FormField>
            </SpaceBetween>
          </div>
        </div>
      </Form>
    </form>
  );
};

// ─── Disabled-tab placeholder ─────────────────────────────────────────
//
// In production these tabs are disabled in the tab strip — clicking
// them is impossible, so no content ever renders. We render a faint
// placeholder for the prototype since ControlledTabs in our app shell
// allows visual selection.
const disabledTab = (name: string) => (
  <Box padding={'l'} color={'text-status-inactive'} textAlign={'center'}>
    {`${name} will be available after you save the risk.`}
  </Box>
);

const buildTabs = (detailsContent: React.ReactNode) => [
  { label: 'Details', id: 'details', content: detailsContent },
  { label: 'Controls', id: 'controls', content: disabledTab('Controls'), disabled: true },
  { label: 'Ratings', id: 'ratings', content: disabledTab('Ratings'), disabled: true },
  { label: 'Appetite', id: 'appetites', content: disabledTab('Appetite'), disabled: true },
  { label: 'Acceptances', id: 'acceptances', content: disabledTab('Acceptances'), disabled: true },
  { label: 'Actions', id: 'actions', content: disabledTab('Actions'), disabled: true },
  { label: 'Indicators', id: 'indicators', content: disabledTab('Indicators'), disabled: true },
  { label: 'Approvals', id: 'approvals', content: disabledTab('Approvals'), disabled: true },
  { label: 'Linked items', id: 'linkedItems', content: disabledTab('Linked items'), disabled: true },
];

// ─── Stories ───────────────────────────────────────────────────────────

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <RealProviders initialPath={'/risks/create'}>
    <PageLayout title={'Add Risk'}>{children}</PageLayout>
  </RealProviders>
);

// 1. Default — empty form, ready to fill in
export const Default: Story = {
  render: () => {
    const [activeTabId, setActiveTabId] = useState('details');
    return (
      <Wrap>
        <ControlledTabs
          variant={'container'}
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={buildTabs(<DetailsTab />)}
          disableSettings
        />
      </Wrap>
    );
  },
};

// 2. PartiallyFilled — user has filled in some fields
export const PartiallyFilled: Story = {
  render: () => {
    const [activeTabId, setActiveTabId] = useState('details');
    return (
      <Wrap>
        <ControlledTabs
          variant={'container'}
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={buildTabs(
            <DetailsTab
              name={'Data breach via legacy S3 bucket'}
              description={'Legacy S3 bucket has open IAM policy. No MFA enforced.'}
            />
          )}
          disableSettings
        />
      </Wrap>
    );
  },
};

// 3. WithValidationErrors — user clicked Save with required fields empty
export const WithValidationErrors: Story = {
  render: () => {
    const [activeTabId, setActiveTabId] = useState('details');
    return (
      <Wrap>
        <ControlledTabs
          variant={'container'}
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={buildTabs(<DetailsTab showErrors />)}
          disableSettings
        />
      </Wrap>
    );
  },
};

// 4. Saving — Save button in loading state, form locked
export const Saving: Story = {
  render: () => {
    const [activeTabId, setActiveTabId] = useState('details');
    return (
      <Wrap>
        <ControlledTabs
          variant={'container'}
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={buildTabs(
            <DetailsTab
              name={'Data breach via legacy S3 bucket'}
              description={'Legacy S3 bucket has open IAM policy.'}
              saving
            />
          )}
          disableSettings
        />
      </Wrap>
    );
  },
};

// 5. ErrorState — server returned an error (e.g. duplicate name).
//    Uses Cloudscape Alert — matches the production error rendering.
export const ErrorState: Story = {
  render: () => {
    const [activeTabId, setActiveTabId] = useState('details');
    return (
      <Wrap>
        <ControlledTabs
          variant={'container'}
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={buildTabs(
            <DetailsTab
              name={'Data breach via legacy S3 bucket'}
              description={'Legacy S3 bucket has open IAM policy.'}
              errorBanner
            />
          )}
          disableSettings
        />
      </Wrap>
    );
  },
};
