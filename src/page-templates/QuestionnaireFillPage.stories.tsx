// Page Templates / Questionnaire Fill — vendor (respondent) view of
// a questionnaire they've been invited to complete.
//
// ⚠️ SPECULATIVE — no dedicated production page for this exists.
// The codebase only has pages/third-party-responses/update/Page.tsx,
// which hardcodes `readonly={true}` and is used by REVIEWERS to
// approve/reject submissions. The vendor-side fill-out flow is either
// (a) an unbuilt feature, or (b) lives in a separate public/auth0
// surface that isn't in packages/web.
//
// This story uses the SAME production sub-components as the reviewer
// page (CustomisableControl, GroupLayout, FileItem) so the look is
// consistent — but with inputs enabled and a vendor-side action bar
// (Save draft / Submit response). Use as the canvas for designing the
// respondent experience before pushing changes through.
//
// Production sub-components used verbatim:
//   packages/components/src/form-builder/renderers/controls/CustomisableControl.tsx
//   packages/components/src/form-builder/renderers/layouts/GroupLayout.tsx
//   packages/components/src/form-builder/renderers/helpers/Attachments.tsx + FileItem
//
// Things added for the respondent flow:
//   - Editable inputs (controlled useState per field)
//   - Banner explaining the deadline and contact info
//   - Progress indicator (sections complete vs total)
//   - Save draft / Submit response footer
//   - Public-style chrome (no app nav) — vendors usually land on a
//     dedicated subdomain with no left rail

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Container from '@risk-smart/themed-cloudscape-components/container';
import FileUpload from '@risk-smart/themed-cloudscape-components/file-upload';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import ProgressBar from '@risk-smart/themed-cloudscape-components/progress-bar';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// Use Cloudscape Button directly — the @risksmart-app/components/src/button
// wrapper calls useNavigate() which requires a Router context that this
// public-style page (no app shell, no RealProviders) doesn't have.
import Button from '@risk-smart/themed-cloudscape-components/button';
import { InfoCircle } from '@untitled-ui/icons-react';

import '../cloudscape-reference/_setup';

const meta = {
  title: 'Page Templates/Questionnaire Fill',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SPECULATIVE: respondent view of a questionnaire. Same sub-' +
          'components as the reviewer page (CustomisableControl / ' +
          'GroupLayout / FileItem) but inputs are enabled and the ' +
          'action bar is Save draft / Submit response. No public-' +
          'facing fill page exists in production today.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── CustomisableControl (production) ────────────────────────────────
const CustomisableControl = ({
  label,
  description,
  required,
  children,
}: {
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className={'pb-6 w-full'} data-testid={'customisable-control'}>
    <FormField
      stretch={true}
      label={
        <div className={'flex gap-3 items-center'}>
          <div>
            <div className={'flex gap-2'}>
              <div>{label}</div>
              {required && (
                <div className={'font-normal text-red'}>{'*'}</div>
              )}
            </div>
          </div>
          {description && (
            <Popover
              size={'large'}
              dismissButton={false}
              triggerType={'custom'}
              content={description}
            >
              <InfoCircle
                viewBox={'0 0 24 24'}
                width={16}
                height={16}
                className={'text-grey500 cursor-help'}
              />
            </Popover>
          )}
        </div>
      }
    >
      {children}
    </FormField>
  </div>
);

// ─── GroupLayout (production, readonly variant) ──────────────────────
const GroupLayout = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className={'w-full mb-5'}>
    <div className={'w-full justify-start'}>
      <FormField stretch={true}>
        <div
          className={'flex flex-col grow rounded-md'}
          data-testid={'group-layout-control-parent'}
        >
          <div className={'flex items-start pb-4'}>
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Header variant={'h2'}>{label}</Header>
            </SpaceBetween>
          </div>
          {children}
        </div>
      </FormField>
    </div>
  </div>
);

// ─── Editable field renderers ────────────────────────────────────────

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  description,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
}) => (
  <CustomisableControl label={label} description={description} required={required}>
    <Input
      value={value}
      onChange={({ detail }) => onChange(detail.value)}
      placeholder={placeholder}
    />
  </CustomisableControl>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  description,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
}) => (
  <CustomisableControl label={label} description={description} required={required}>
    <Textarea
      value={value}
      onChange={({ detail }) => onChange(detail.value)}
      placeholder={placeholder}
      rows={6}
    />
  </CustomisableControl>
);

const RadioField = ({
  label,
  value,
  onChange,
  options,
  description,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  description?: string;
  required?: boolean;
}) => (
  <CustomisableControl label={label} description={description} required={required}>
    <RadioGroup
      value={value}
      onChange={({ detail }) => onChange(detail.value)}
      items={options}
    />
  </CustomisableControl>
);

const FileUploadField = ({
  label,
  value,
  onChange,
  description,
  required,
}: {
  label: string;
  value: File[];
  onChange: (files: File[]) => void;
  description?: string;
  required?: boolean;
}) => (
  <CustomisableControl label={label} description={description} required={required}>
    <FileUpload
      value={value}
      onChange={({ detail }) => onChange(detail.value as File[])}
      multiple
      showFileLastModified
      showFileSize
      i18nStrings={{
        uploadButtonText: (multiple) =>
          multiple ? 'Choose files' : 'Choose file',
        dropzoneText: (multiple) =>
          multiple ? 'Drop files to upload' : 'Drop file to upload',
        removeFileAriaLabel: (i) => `Remove file ${i + 1}`,
        limitShowFewer: 'Show fewer files',
        limitShowMore: 'Show more files',
        errorIconAriaLabel: 'Error',
      }}
    />
  </CustomisableControl>
);

// ─── Form state ──────────────────────────────────────────────────────

type FormState = {
  // Section 1
  companyName: string;
  registrationNumber: string;
  country: string;
  contactEmail: string;
  employeeBand: string;
  // Section 2
  certification: string;
  encryption: string;
  pentestFrequency: string;
  soc2Files: File[];
  // Section 3
  incidentNotify: string;
  incidentRunbook: string;
};

const emptyState: FormState = {
  companyName: '',
  registrationNumber: '',
  country: '',
  contactEmail: '',
  employeeBand: '',
  certification: '',
  encryption: '',
  pentestFrequency: '',
  soc2Files: [],
  incidentNotify: '',
  incidentRunbook: '',
};

const partialState: FormState = {
  ...emptyState,
  companyName: 'Northwind Cloud Services Ltd.',
  registrationNumber: '09823746',
  country: 'United Kingdom',
  contactEmail: 'compliance@northwind.example',
  employeeBand: '201-500',
  certification: 'iso27001',
};

// Count fields with required status filled — drives the ProgressBar.
const requiredFieldKeys: (keyof FormState)[] = [
  'companyName',
  'registrationNumber',
  'country',
  'contactEmail',
  'employeeBand',
  'certification',
  'encryption',
  'incidentNotify',
  'incidentRunbook',
];

const completionPct = (s: FormState): number => {
  const total = requiredFieldKeys.length;
  const done = requiredFieldKeys.filter((k) => {
    const v = s[k];
    return typeof v === 'string' ? v.trim().length > 0 : false;
  }).length;
  return Math.round((done / total) * 100);
};

// ─── Page composition ────────────────────────────────────────────────
//
// Public-style chrome (no app nav). Top: simple header bar with
// "RiskSmart" wordmark, recipient email, and deadline. Middle: a
// Container with the GroupLayout sections. Bottom: action bar.
const QuestionnaireFillPage = ({
  initial = emptyState,
}: {
  initial?: FormState;
}) => {
  const [state, setState] = useState<FormState>(initial);
  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const pct = useMemo(() => completionPct(state), [state]);

  return (
    <div className={'fixed inset-0 bg-off_white overflow-auto'}>
      {/* Public header bar */}
      <div
        className={'bg-navy text-white flex items-center justify-between px-8 py-5'}
      >
        <div className={'flex items-center gap-2'}>
          <span className={'font-bold text-lg tracking-tight'}>{'RiskSmart'}</span>
          <span
            className={'w-[5px] h-[5px] rounded-full bg-teal -mt-1.5'}
          />
        </div>
        <div className={'flex items-center gap-6 text-sm'}>
          <span className={'opacity-80'}>{'Logged in as compliance@northwind.example'}</span>
          <a href={'#'} className={'text-teal hover:underline'}>{'Sign out'}</a>
        </div>
      </div>

      {/* Page body — narrower max-width than reviewer view; respondents read one question at a time */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Intro banner */}
        <Alert
          type={'info'}
          header={'Vendor Security Assessment — 2026 Q2'}
        >
          <div className={'mt-1'}>
            <div className={'mb-1'}>{'Requested by Emma Bamford at Risksmart Inc. on behalf of their procurement team.'}</div>
            <div>
              {'Please complete and submit by '}
              <strong>{'30 May 2026'}</strong>
              {'. Your answers are saved automatically as you type — you can return at any time using the link in your invitation email.'}
            </div>
          </div>
        </Alert>

        {/* Progress */}
        <div className={'mt-6 mb-2'}>
          <ProgressBar
            value={pct}
            additionalInfo={`${requiredFieldKeys.filter((k) => (state[k] as string)?.toString().trim().length > 0).length} of ${requiredFieldKeys.length} required questions answered`}
            label={'Completion'}
          />
        </div>

        <Container>
          <SpaceBetween size={'m'} direction={'vertical'}>
            <GroupLayout label={'Company information'}>
              <TextField
                label={'Legal company name'}
                value={state.companyName}
                onChange={(v) => update('companyName', v)}
                placeholder={'Acme Ltd.'}
                required
              />
              <TextField
                label={'Registration number'}
                value={state.registrationNumber}
                onChange={(v) => update('registrationNumber', v)}
                placeholder={'0000000'}
                required
              />
              <TextField
                label={'Country of incorporation'}
                value={state.country}
                onChange={(v) => update('country', v)}
                required
              />
              <TextField
                label={'Primary contact email'}
                value={state.contactEmail}
                onChange={(v) => update('contactEmail', v)}
                description={'The address we will send security incident notifications to.'}
                placeholder={'compliance@example.com'}
                required
              />
              <RadioField
                label={'Approximately how many employees do you have?'}
                value={state.employeeBand}
                onChange={(v) => update('employeeBand', v)}
                options={[
                  { value: '1-50', label: '1–50' },
                  { value: '51-200', label: '51–200' },
                  { value: '201-500', label: '201–500' },
                  { value: '500+', label: '500+' },
                ]}
                required
              />
            </GroupLayout>

            <GroupLayout label={'Information security'}>
              <RadioField
                label={'Do you hold a recognised information-security certification?'}
                value={state.certification}
                onChange={(v) => update('certification', v)}
                options={[
                  { value: 'iso27001', label: 'ISO/IEC 27001' },
                  { value: 'soc2', label: 'SOC 2 Type II' },
                  { value: 'both', label: 'Both' },
                  { value: 'none', label: 'None of the above' },
                ]}
                required
              />
              <TextAreaField
                label={'Describe your data-encryption practices at rest and in transit'}
                value={state.encryption}
                onChange={(v) => update('encryption', v)}
                placeholder={'TLS, AES-256, key rotation, KMS, etc.'}
                required
              />
              <RadioField
                label={'How frequently are penetration tests performed?'}
                value={state.pentestFrequency}
                onChange={(v) => update('pentestFrequency', v)}
                options={[
                  { value: 'never', label: 'Never' },
                  { value: 'annual', label: 'Annually by an external firm' },
                  {
                    value: 'annual_plus_quarterly_internal',
                    label: 'Annually external + quarterly internal',
                  },
                  { value: 'continuous', label: 'Continuously via bug bounty' },
                ]}
              />
              <FileUploadField
                label={'Attach your most recent SOC 2 report or equivalent'}
                value={state.soc2Files}
                onChange={(v) => update('soc2Files', v)}
                description={'Only required if you indicated SOC 2 above.'}
              />
            </GroupLayout>

            <GroupLayout label={'Incident response'}>
              <RadioField
                label={
                  'Will you notify Risksmart Inc. of any security incident affecting our data within 24 hours?'
                }
                value={state.incidentNotify}
                onChange={(v) => update('incidentNotify', v)}
                options={[
                  { value: 'yes', label: 'Yes — committed in writing' },
                  { value: 'conditional', label: 'Yes, subject to internal review' },
                  { value: 'no', label: 'No' },
                ]}
                required
              />
              <TextAreaField
                label={'Describe your incident-response runbook for confirmed data breaches'}
                value={state.incidentRunbook}
                onChange={(v) => update('incidentRunbook', v)}
                placeholder={'Roles, escalation paths, timelines, notification procedure'}
                required
              />
            </GroupLayout>
          </SpaceBetween>
        </Container>

        {/* Sticky-feeling action bar */}
        <div
          className={
            'mt-6 pt-4 border-0 border-grey150 border-solid border-t-[0.5px] flex justify-between items-center'
          }
        >
          <Box variant={'small'} color={'text-status-inactive'}>
            {'Last saved a few seconds ago'}
          </Box>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'normal'}>{'Save draft'}</Button>
            <Button variant={'primary'} disabled={pct < 100}>
              {pct < 100 ? `Submit response (${requiredFieldKeys.length - requiredFieldKeys.filter((k) => (state[k] as string)?.toString().trim().length > 0).length} left)` : 'Submit response'}
            </Button>
          </SpaceBetween>
        </div>
      </div>
    </div>
  );
};

// ─── Stories ─────────────────────────────────────────────────────────

// 1. Empty — vendor just opened the link.
export const Default: Story = {
  render: () => <QuestionnaireFillPage />,
};

// 2. InProgress — vendor has answered some of the first section.
export const InProgress: Story = {
  render: () => <QuestionnaireFillPage initial={partialState} />,
};

// 3. ReadyToSubmit — every required question filled.
export const ReadyToSubmit: Story = {
  render: () => (
    <QuestionnaireFillPage
      initial={{
        ...partialState,
        encryption:
          'All customer data at rest is encrypted with AES-256 in our managed PostgreSQL and object-storage tiers. In transit, all API and web traffic uses TLS 1.2+ with HSTS preload. Internal service-to-service traffic is mTLS-only. Encryption keys are rotated quarterly and stored in AWS KMS with audit logging enabled.',
        pentestFrequency: 'annual_plus_quarterly_internal',
        incidentNotify: 'yes',
        incidentRunbook:
          'Within 1 hour: incident commander assigned. Within 4 hours: scope of affected data identified. Within 24 hours: notification sent to all impacted customers. Within 72 hours: regulator notification if PII involved. Full post-mortem within 14 days.',
      }}
    />
  ),
};
