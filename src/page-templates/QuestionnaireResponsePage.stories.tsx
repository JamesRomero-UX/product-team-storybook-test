// Page Templates / Questionnaire Response — reviewer view of a
// filled third-party questionnaire.
//
// EVERY visible sub-component is a near-verbatim recreation of
// production. Files referenced:
//
//   pages/third-party-responses/update/Page.tsx                            ← shell
//   packages/components/src/form-builder/renderers/layouts/GroupLayout.tsx ← section wrapper
//   packages/components/src/form-builder/renderers/controls/CustomisableControl.tsx
//   packages/components/src/form-builder/renderers/helpers/Attachments.tsx ← file attachments
//   packages/components/src/file/FileItem.tsx                              ← attachment item (Alert)
//   packages/web/src/components/actions-button/ActionsButton.tsx           ← More actions dropdown
//
// Things still composed statically:
//   - The JsonForms render path itself (would pull jsonforms core +
//     12 renderer files + zustand store)
//   - useSubscription to fetch the response (mocked sample answers)
//   - Permission gating

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Container from '@risk-smart/themed-cloudscape-components/container';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// Production ActionsButton + ButtonDropdown wrappers from the dev repo.
// The custom ButtonDropdown wrapper at src/components/button-dropdown
// adds `padding: 8px 20px !important` + border-width 1.5px + font-size 15px,
// which is what makes the trigger height match a regular Button. Using
// the raw Cloudscape ButtonDropdown directly skipped that and produced
// the short-button bug we hit earlier.
// eslint-disable-next-line import/no-unresolved
import ActionsButton from 'src/components/actions-button/ActionsButton';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { InfoCircle, Dataflow03 } from '@untitled-ui/icons-react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

const meta = {
  title: 'Page Templates/Questionnaire Response',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Reviewer view of a filled third-party questionnaire. Mirrors ' +
          'pages/third-party-responses/update/Page.tsx with verbatim ' +
          'lifts of GroupLayout, CustomisableControl, Attachments/FileItem, ' +
          'and ActionsButton.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── CustomisableControl ─────────────────────────────────────────────
//
// Lifted from form-builder/renderers/controls/CustomisableControl.tsx
// (same wrapper used by every field in the questionnaire). pb-6 + w-full
// outer, FormField with stretch=true, label = flex of (label + red `*`
// for required) + InfoCircle popover for description + Dataflow03
// popover for conditional indicator.
const CustomisableControl = ({
  label,
  description,
  required,
  conditional,
  children,
}: {
  label: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
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
          <div className={'flex gap-3'}>
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
            {conditional && (
              <Popover
                size={'large'}
                dismissButton={false}
                triggerType={'custom'}
                content={'This field has conditional logic applied'}
              >
                <Dataflow03
                  viewBox={'0 0 24 24'}
                  width={16}
                  height={16}
                  className={'text-grey500 cursor-help'}
                />
              </Popover>
            )}
          </div>
        </div>
      }
    >
      {children}
    </FormField>
  </div>
);

// ─── Readonly field renderers ────────────────────────────────────────
//
// Each mirrors the corresponding production control (TextControl,
// TextAreaControl, BooleanControl, DropdownSelectControl), wrapped in
// CustomisableControl and with readonly={true} disabling the input.
// Production uses JsonForms with a single `data` object — each
// renderer pulls its piece via `path`. We pre-pick the answer here.

const TextControlReadonly = (p: {
  label: string;
  value: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <Input value={p.value} onChange={() => undefined} disabled />
  </CustomisableControl>
);

const TextAreaControlReadonly = (p: {
  label: string;
  value: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <Textarea value={p.value} onChange={() => undefined} rows={6} disabled />
  </CustomisableControl>
);

const RadioControlReadonly = (p: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <RadioGroup value={p.value} onChange={() => undefined} items={p.options} />
  </CustomisableControl>
);

// ─── FileItem (production) ───────────────────────────────────────────
//
// Lifted from packages/components/src/file/FileItem.tsx:
//   <Box margin={{ vertical: 'xs' }}>
//     <Alert type='success' dismissible={false}>
//       <div>filename<br/><Box variant='small'>humanFileSize(size)</Box></div>
//     </Alert>
//   </Box>
//
// Production reads-only mode passes dismissible=false (we hardcode true).
const humanFileSize = (bytes: number) => {
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const FileItem = ({
  fileName,
  fileSize,
}: {
  fileName: string;
  fileSize: number;
}) => (
  <Box margin={{ vertical: 'xs' }}>
    <Alert type={'success'} dismissible={false}>
      <div>
        {fileName}
        <br />
        <Box variant={'small'}>{humanFileSize(fileSize)}</Box>
      </div>
    </Alert>
  </Box>
);

// FileUpload field (readonly): just renders the attached FileItems.
// Production Attachments component would also render an upload widget
// when not disabled — we skip that since reviewers see readonly.
const FileUploadControlReadonly = (p: {
  label: string;
  files: { name: string; size: number }[];
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <div className={'flex flex-col'}>
      {p.files.length === 0 ? (
        <Box variant={'p'} color={'text-status-inactive'}>
          {'No files attached'}
        </Box>
      ) : (
        p.files.map((f) => (
          <FileItem key={f.name} fileName={f.name} fileSize={f.size} />
        ))
      )}
    </div>
  </CustomisableControl>
);

// ─── GroupLayout (one section) ───────────────────────────────────────
//
// Lifted from form-builder/renderers/layouts/GroupLayout.tsx — in
// readonly / preview mode (isFormCustomisable=false) the section
// renders as:
//   <div className='w-full mb-5'>
//     <div className='w-full justify-start'>
//       <FormField stretch={true}>
//         <div className='flex flex-col grow rounded-md'>   ← no border in readonly
//           <div className='flex items-start pb-4'>
//             <SpaceBetween direction='horizontal' size='xs'>
//               <Header variant='h2'>{label}</Header>
//             </SpaceBetween>
//           </div>
//           {children}                                       ← RenderChildren
//         </div>
//       </FormField>
//     </div>
//   </div>
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

// ─── Filled questionnaire content ────────────────────────────────────
const FilledContent = () => (
  <>
    <GroupLayout label={'Company information'}>
      <TextControlReadonly
        label={'Legal company name'}
        value={'Northwind Cloud Services Ltd.'}
        required
      />
      <TextControlReadonly
        label={'Registration number'}
        value={'09823746'}
        required
      />
      <TextControlReadonly
        label={'Country of incorporation'}
        value={'United Kingdom'}
        required
      />
      <TextControlReadonly
        label={'Primary contact email'}
        value={'compliance@northwind.example'}
        description={'The address we will send security incident notifications to.'}
        required
      />
      <RadioControlReadonly
        label={'Approximately how many employees do you have?'}
        value={'201-500'}
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
      <RadioControlReadonly
        label={'Do you hold a recognised information-security certification?'}
        value={'iso27001'}
        options={[
          { value: 'iso27001', label: 'ISO/IEC 27001' },
          { value: 'soc2', label: 'SOC 2 Type II' },
          { value: 'both', label: 'Both' },
          { value: 'none', label: 'None of the above' },
        ]}
        required
      />
      <TextAreaControlReadonly
        label={'Describe your data-encryption practices at rest and in transit'}
        value={
          'All customer data at rest is encrypted with AES-256 in our managed PostgreSQL ' +
          'and object-storage tiers. In transit, all API and web traffic uses TLS 1.2+ ' +
          'with HSTS preload. Internal service-to-service traffic is mTLS-only. Encryption ' +
          'keys are rotated quarterly and stored in AWS KMS with audit logging enabled.'
        }
        required
      />
      <RadioControlReadonly
        label={'How frequently are penetration tests performed?'}
        value={'annual_plus_quarterly_internal'}
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
      <FileUploadControlReadonly
        label={'Attach your most recent SOC 2 report or equivalent'}
        description={'Only required if you indicated SOC 2 above.'}
        conditional
        files={[
          { name: 'Northwind_SOC2_TypeII_FY2025.pdf', size: 2_516_582 },
          { name: 'ISO27001_Statement_of_Applicability.pdf', size: 700_416 },
        ]}
      />
    </GroupLayout>

    <GroupLayout label={'Incident response'}>
      <RadioControlReadonly
        label={
          'Will you notify RiskSmart of any security incident affecting our data within 24 hours?'
        }
        value={'yes'}
        options={[
          { value: 'yes', label: 'Yes — committed in writing' },
          { value: 'conditional', label: 'Yes, subject to internal review' },
          { value: 'no', label: 'No' },
        ]}
        required
      />
      <TextAreaControlReadonly
        label={'Describe your incident-response runbook for confirmed data breaches'}
        value={
          'Within 1 hour: incident commander assigned, war room opened in PagerDuty. ' +
          'Within 4 hours: scope of affected data identified, initial customer notification ' +
          'drafted. Within 24 hours: notification sent to all impacted customers including ' +
          'RiskSmart. Within 72 hours: regulator notification if PII involved. Full post-' +
          'mortem within 14 days.'
        }
        required
      />
    </GroupLayout>
  </>
);

// ─── Footer actions ──────────────────────────────────────────────────
//
// Lifted from pages/third-party-responses/update/Page.tsx lines 190–219.
//
// Uses the production ActionsButton component (which internally wraps
// the production ButtonDropdown wrapper — that's the piece that adds
// `padding: 8px 20px !important` + border-width 1.5px + font-size 15px
// to the trigger, matching the height of a regular Button. No CSS hacks
// needed.
type ActionItem = {
  text: string;
  id: string;
  disabled?: boolean;
  onItemClick: () => Promise<void> | void;
};

const FooterActions = ({
  approveDisabled = false,
}: {
  approveDisabled?: boolean;
}) => {
  const moreActionItems: ActionItem[] = [
    { id: 'recall',    text: 'Recall',                    disabled: approveDisabled, onItemClick: () => undefined },
    { id: 'reject',    text: 'Reject',                    disabled: approveDisabled, onItemClick: () => undefined },
    { id: 'more_info', text: 'Request more information',  disabled: approveDisabled, onItemClick: () => undefined },
  ];
  return (
    <SpaceBetween direction={'horizontal'} size={'s'}>
      <SpaceBetween direction={'horizontal'} size={'s'}>
        <Button variant={'primary'} disabled={approveDisabled}>
          {'Approve'}
        </Button>
        <ActionsButton
          buttonText={'More actions'}
          items={moreActionItems}
          disabled={moreActionItems.every((a) => a.disabled)}
        />
      </SpaceBetween>
      <Button variant={'normal'}>{'Cancel'}</Button>
    </SpaceBetween>
  );
};

// ─── Production rating palette (third_party_response_status) ─────────
//
// Verbatim from packages/i18n/src/locales/default/en/ratings.json
// + packages/components/src/utils/colours.ts. This is what
// `useRating('third_party_response_status').getByValue(status)` would
// return in production. We mirror the shape so SimpleRatingBadge gets
// the same data without pulling the i18n ratings namespace.
type StatusValue =
  | 'completed'
  | 'in_progress'
  | 'expired'
  | 'awaiting_review'
  | 'rejected'
  | 'not_started'
  | 'recalled';

const STATUS_OPTIONS: Record<
  StatusValue,
  { label: string; color: string; rgbHexColor: string }
> = {
  completed:        { label: 'Completed',       color: 'dark-green', rgbHexColor: '#6DAC3F' },
  in_progress:      { label: 'In progress',     color: 'orange',     rgbHexColor: '#F2A041' },
  expired:          { label: 'Expired',         color: 'light-red',  rgbHexColor: '#E37373' },
  awaiting_review:  { label: 'Awaiting review', color: 'light-green',rgbHexColor: '#8CC862' },
  rejected:         { label: 'Rejected',        color: 'dark-red',   rgbHexColor: '#CE1B1B' },
  not_started:      { label: 'Not started',     color: 'light-grey', rgbHexColor: '#E8E8EC' },
  recalled:         { label: 'Recalled',        color: 'light-red',  rgbHexColor: '#E37373' },
};

// ─── Page composition ────────────────────────────────────────────────
//
// Mirrors pages/third-party-responses/update/Page.tsx lines 170–221.
const QuestionnaireResponsePage = ({
  status = 'awaiting_review' as StatusValue,
  approveDisabled = false,
}: {
  status?: StatusValue;
  approveDisabled?: boolean;
}) => {
  const rating = STATUS_OPTIONS[status];
  return (
    <RealProviders initialPath={'/third-party/123/questionnaire-responses/456'}>
      <PageLayout title={'Vendor Security Assessment — 2026 Q2'}>
        <Container>
          <SpaceBetween size={'m'} direction={'vertical'}>
            <SpaceBetween size={'s'} direction={'horizontal'}>
              <Header variant={'h2'}>{'Status:'}</Header>
              <div className={'flex h-full items-center justify-center'}>
                <SimpleRatingBadge
                  rating={{
                    label: rating.label,
                    rgbHexColor: rating.rgbHexColor,
                    color: rating.color,
                    value: 1,
                    ratingType: 'third_party_response_status',
                    __typename: 'parent_rating' as any,
                  } as any}
                />
              </div>
            </SpaceBetween>

            <FilledContent />

            <FooterActions approveDisabled={approveDisabled} />
          </SpaceBetween>
        </Container>
      </PageLayout>
    </RealProviders>
  );
};

// ─── Stories ──────────────────────────────────────────────────────────
// Status names align with production third_party_response_status palette
// (ratings.json). "Approved" / "More info requested" aren't real states
// in production — closest equivalents are Completed / In progress.

export const Default: Story = {
  name: 'Awaiting review',
  render: () => <QuestionnaireResponsePage status={'awaiting_review'} />,
};

export const Completed: Story = {
  render: () => <QuestionnaireResponsePage status={'completed'} approveDisabled />,
};

export const Rejected: Story = {
  render: () => <QuestionnaireResponsePage status={'rejected'} approveDisabled />,
};

export const InProgress: Story = {
  name: 'In progress',
  render: () => <QuestionnaireResponsePage status={'in_progress'} approveDisabled />,
};
