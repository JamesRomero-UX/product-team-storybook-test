// Prototype — RSP-5589: Surface previous "request further information"
// comments to customers on questionnaire responses.
//
// Linear: https://linear.app/risksmart/issue/RSP-5589
//
// ⚠️ SPECULATIVE — the `third_party_response` table has a `RecallReason`
// column today but NO equivalent for the RequestMoreInformation Reason
// or RequestType. Engineering needs to add persistence (recommended:
// `third_party_response_comment` relation table) before this UI can be
// wired up. Every entry rendered is mocked.
//
// ─── A/B TEST ────────────────────────────────────────────────────────
// Both concepts surface the history on the response review page so they
// satisfy AC1 / AC2 / AC4 / AC5 ("when the customer views that response").
// Both compose the EXACT same pattern as the production
// `NotificationHistoryTable` (TabHeader + embedded Cloudscape Table +
// expandable rows). They differ only in default visibility:
//
//   Concept A — Expanded by default
//     A new section above the questionnaire body. TabHeader counter
//     shows the count. Table is always rendered. AC 3 enforced by
//     returning null when items.length === 0.
//
//   Concept B — Collapsed by default
//     The same TabHeader + Table is wrapped in an
//     ExpandableSection variant='container' that is collapsed when
//     the page loads. One click expands. Same AC 3 enforcement.
//
// Lifts:
//   pages/third-party-responses/update/Page.tsx          (page shell)
//   components/notification-history-table/                (Table pattern)
//   components/tab-header/TabHeader.tsx                   (h2 with counter)
//   page-templates/QuestionnaireResponsePage.stories.tsx  (helper components)

import { useCollection } from '@cloudscape-design/collection-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Badge from '@risk-smart/themed-cloudscape-components/badge';
import Box from '@risk-smart/themed-cloudscape-components/box';
import ButtonDropdown from '@risk-smart/themed-cloudscape-components/button-dropdown';
import Container from '@risk-smart/themed-cloudscape-components/container';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Link from '@risk-smart/themed-cloudscape-components/link';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// eslint-disable-next-line import/no-unresolved
import PropertyFilterPanel from 'src/components/property-filter-panel';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { InfoCircle, Dataflow03, Plus } from '@untitled-ui/icons-react';
import { useState } from 'react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

const meta = {
  title: 'Prototypes/RSP-5589 Request info history',
  component: PageLayout as any,
  tags: ['prototype'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A/B test surfacing prior request-further-information comments ' +
          'on the questionnaire response review page. Both variants use ' +
          'the production NotificationHistoryTable pattern (TabHeader + ' +
          'embedded Cloudscape Table + expandable rows). They differ ' +
          'only in default visibility — A expanded, B collapsed.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ════════════════════════════════════════════════════════════════════════
// Mock data shape — matches the proposed GraphQL fragment
// ════════════════════════════════════════════════════════════════════════
type RequestType = 'furtherInformationRequired' | 'informationProvidedUnclear';

type RequestHistoryItem = {
  Id: string;
  RequestType: RequestType;
  Reason: string;
  ShareWithRespondents: boolean;
  CreatedAtTimestamp: string;
  CreatedByUser: { FriendlyName: string };
};

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  furtherInformationRequired: 'Further information required',
  informationProvidedUnclear: 'Information provided unclear',
};

const REQUEST_TYPE_COLOR: Record<RequestType, 'blue' | 'grey'> = {
  furtherInformationRequired: 'blue',
  informationProvidedUnclear: 'grey',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ════════════════════════════════════════════════════════════════════════
// RequestHistoryTable — the shared composition (used by A and B)
// Mirrors NotificationHistoryTable: TabHeader + Cloudscape Table
// variant='embedded' + expandable rows for the full Reason text.
// ════════════════════════════════════════════════════════════════════════
const REQUEST_COLUMNS = [
  {
    id: 'CreatedAtTimestamp',
    header: 'Sent',
    sortingField: 'CreatedAtTimestamp',
    cell: (item: RequestHistoryItem) => formatDate(item.CreatedAtTimestamp),
    minWidth: 180,
  },
  {
    id: 'CreatedByUser',
    header: 'By',
    cell: (item: RequestHistoryItem) => item.CreatedByUser.FriendlyName,
    minWidth: 160,
  },
  {
    id: 'RequestType',
    header: 'Type',
    cell: (item: RequestHistoryItem) => (
      <Badge color={REQUEST_TYPE_COLOR[item.RequestType]}>
        {REQUEST_TYPE_LABEL[item.RequestType]}
      </Badge>
    ),
    minWidth: 220,
  },
  {
    id: 'Reason',
    header: 'Reason',
    cell: (item: RequestHistoryItem) => (
      <Box>
        {/* Truncated preview; expand row to see full content. */}
        {item.Reason.length > 140
          ? `${item.Reason.slice(0, 140)}…`
          : item.Reason}
      </Box>
    ),
    minWidth: 360,
  },
  {
    id: 'ShareWithRespondents',
    header: 'Shared',
    cell: (item: RequestHistoryItem) =>
      item.ShareWithRespondents ? 'Yes' : 'No',
    minWidth: 90,
  },
];

const RequestHistoryTable = ({
  items,
}: {
  items: RequestHistoryItem[];
}) => {
  const [expandedItems, setExpandedItems] = useState<RequestHistoryItem[]>([]);
  const collection = useCollection(items, {
    sorting: {
      defaultState: { sortingColumn: REQUEST_COLUMNS[0] as any, isDescending: true },
    },
  });
  const { items: sorted, collectionProps } = collection;

  return (
    <Table
      {...(collectionProps as any)}
      columnDefinitions={REQUEST_COLUMNS as any}
      items={sorted}
      trackBy={'Id'}
      variant={'embedded'}
      expandableRows={{
        getItemChildren: () => [],
        isItemExpandable: (item: RequestHistoryItem) => item.Reason.length > 140,
        expandedItems,
        onExpandableItemToggle: (event: any) => {
          const { item, expanded } = event.detail;
          setExpandedItems((prev) =>
            expanded
              ? [...prev, item]
              : prev.filter((p) => p.Id !== item.Id)
          );
        },
      } as any}
      submitEdit={async () => undefined}
      empty={null}
    />
  );
};

// ─── Canonical panel — ExpandableSection collapsed by default ──────────
// (Concept A "expanded by default" was tested against this and dropped —
//  collapsed-by-default keeps the questionnaire body close to the top while
//  preserving one-click access to the full history.)
const RequestHistoryPanel = ({
  items,
  loading,
  error,
}: {
  items: RequestHistoryItem[];
  loading?: boolean;
  error?: string;
}) => {
  if (!loading && !error && items.length === 0) return null; // AC 3
  return (
    <ExpandableSection
      variant={'container'}
      headerText={`Information requests`}
      headerCounter={items.length > 0 ? `(${items.length})` : undefined}
      defaultExpanded={false}
    >
      {error ? (
        <Alert type={'error'} dismissible={false} header={error} />
      ) : (
        <RequestHistoryTable items={items} />
      )}
    </ExpandableSection>
  );
};

// ════════════════════════════════════════════════════════════════════════
// Helpers lifted verbatim from QuestionnaireResponsePage template
// (real production form-builder readonly renderers)
// ════════════════════════════════════════════════════════════════════════
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

const TextControlReadonly = (p: {
  label: string;
  value: string;
  description?: string;
  required?: boolean;
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
}) => (
  <CustomisableControl {...p}>
    <RadioGroup value={p.value} onChange={() => undefined} items={p.options} />
  </CustomisableControl>
);

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

const FilledContent = () => (
  <>
    <GroupLayout label={'Company information'}>
      <TextControlReadonly
        label={'Legal company name'}
        value={'Acme Supplier Ltd'}
        required
      />
      <TextControlReadonly
        label={'Companies House number'}
        value={'12345678'}
        required
      />
      <TextControlReadonly
        label={'Country of incorporation'}
        value={'United Kingdom'}
        required
      />
      <TextControlReadonly
        label={'Primary contact for this questionnaire'}
        value={'Jordan Reeves — jordan@acmesupplier.com'}
        description={
          'The address we will send security incident notifications to.'
        }
        required
      />
    </GroupLayout>

    <GroupLayout label={'Data protection'}>
      <RadioControlReadonly
        label={'Do you hold ISO 27001 certification?'}
        value={'yes_current'}
        options={[
          { value: 'yes_current', label: 'Yes — current, audited within 12 months' },
          { value: 'yes_expired', label: 'Yes — but expired' },
          { value: 'no', label: 'No' },
        ]}
        required
      />
      <FileUploadControlReadonly
        label={'Most recent SOC 2 Type II report'}
        description={
          'Required if you indicated SOC 2 or both certifications above.'
        }
        conditional
        files={[{ name: 'SOC2_TypeII_Acme_2026.pdf', size: 2_516_582 }]}
      />
      <TextAreaControlReadonly
        label={'List the EU sub-processors involved in your service.'}
        value={
          'AWS Frankfurt (eu-central-1) — data-at-rest, AES-256.\n' +
          'Stripe (Ireland) — payments, encrypted in transit via TLS 1.3.'
        }
      />
    </GroupLayout>

    <GroupLayout label={'Information security'}>
      <TextAreaControlReadonly
        label={'Describe your data-encryption practices at rest.'}
        value={
          'AES-256 GCM with 256-bit keys, managed via AWS KMS. Keys ' +
          'rotated annually.'
        }
        required
      />
      <TextAreaControlReadonly
        label={'Describe your data-encryption practices in transit.'}
        value={
          'TLS 1.3 with HSTS enforced. Forward secrecy via ECDHE.'
        }
        required
      />
    </GroupLayout>
  </>
);

// ════════════════════════════════════════════════════════════════════════
// Page shell helpers
// ════════════════════════════════════════════════════════════════════════
type ActionItem = { text: string; id: string; disabled?: boolean };

const FooterActions = ({ disabled = false }: { disabled?: boolean }) => {
  const items: ActionItem[] = [
    { id: 'recall', text: 'Recall', disabled },
    { id: 'reject', text: 'Reject', disabled },
    { id: 'more_info', text: 'Request more information', disabled },
  ];
  return (
    <SpaceBetween direction={'horizontal'} size={'s'}>
      <SpaceBetween direction={'horizontal'} size={'s'}>
        <Button variant={'primary'} disabled={disabled}>
          {'Approve'}
        </Button>
        <ButtonDropdown
          disabled={items.every((a) => a.disabled)}
          items={items}
          variant={'normal'}
        >
          {'More actions'}
        </ButtonDropdown>
      </SpaceBetween>
      <Button variant={'normal'}>{'Cancel'}</Button>
    </SpaceBetween>
  );
};

const StatusRow = ({
  status = 'Awaiting review',
  statusColor = '#F2A041',
}: {
  status?: string;
  statusColor?: string;
}) => (
  <SpaceBetween size={'s'} direction={'horizontal'}>
    <Header variant={'h2'}>{'Status:'}</Header>
    <div className={'flex h-full items-center justify-center'}>
      <SimpleRatingBadge
        rating={
          {
            label: status,
            rgbHexColor: statusColor,
            value: 1,
            ratingType: 'third_party_response_status',
            __typename: 'parent_rating' as any,
          } as any
        }
      />
    </div>
  </SpaceBetween>
);

// ════════════════════════════════════════════════════════════════════════
// Page composition
// ════════════════════════════════════════════════════════════════════════
const ReviewPage = ({
  history,
  loading,
  error,
  status,
  statusColor,
  approveDisabled,
  banner,
  modal,
}: {
  history: RequestHistoryItem[];
  loading?: boolean;
  error?: string;
  status?: string;
  statusColor?: string;
  approveDisabled?: boolean;
  banner?: React.ReactNode;
  modal?: React.ReactNode;
}) => (
  <RealProviders
    initialPath={'/third-party/acme/questionnaire-responses/q3-2026'}
  >
    <PageLayout title={'Q3 2026 Information Security Review'}>
      <Container>
        <SpaceBetween size={'m'} direction={'vertical'}>
          <StatusRow status={status} statusColor={statusColor} />
          {banner}
          <RequestHistoryPanel
            items={history}
            loading={loading}
            error={error}
          />
          <FilledContent />
          <FooterActions disabled={approveDisabled} />
        </SpaceBetween>
      </Container>
      {modal}
    </PageLayout>
  </RealProviders>
);

// ════════════════════════════════════════════════════════════════════════
// Register page (alt surface from ticket — count column)
// ════════════════════════════════════════════════════════════════════════
type ResponseRow = {
  Id: string;
  Questionnaire: string;
  Version: string;
  Status: { label: string; color: string };
  UserEmail: string;
  StartDate: string;
  RequestCount: number;
};

const RESPONSE_ROWS: ResponseRow[] = [
  {
    Id: 'q3-2026',
    Questionnaire: 'Q3 2026 Information Security Review',
    Version: 'v3',
    Status: { label: 'Awaiting review', color: 'orange' },
    UserEmail: 'jordan@acmesupplier.com',
    StartDate: '20 Apr 2026',
    RequestCount: 3,
  },
  {
    Id: 'q2-2026-annual',
    Questionnaire: 'Q2 2026 Annual Review',
    Version: 'v2',
    Status: { label: 'Completed', color: 'light-green' },
    UserEmail: 'jordan@acmesupplier.com',
    StartDate: '15 Jan 2026',
    RequestCount: 1,
  },
  {
    Id: 'onboarding',
    Questionnaire: 'Onboarding Questionnaire',
    Version: 'v1',
    Status: { label: 'Completed', color: 'light-green' },
    UserEmail: 'jordan@acmesupplier.com',
    StartDate: '02 Sep 2025',
    RequestCount: 0,
  },
  {
    Id: 'gdpr-2025',
    Questionnaire: 'GDPR processor questionnaire',
    Version: 'v4',
    Status: { label: 'In progress', color: 'blue' },
    UserEmail: 'jordan@acmesupplier.com',
    StartDate: '08 May 2026',
    RequestCount: 2,
  },
];

const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'Questionnaire',
    key: 'Questionnaire',
    groupValuesLabel: 'Names',
    operators: [':', '!:', '=', '!='] as Array<':' | '!:' | '=' | '!='>,
  },
];

const REGISTER_COLUMNS = [
  {
    id: 'Questionnaire',
    header: 'Response',
    sortingField: 'Questionnaire',
    cell: (item: ResponseRow) => (
      <Link href={`#/third-party/acme/questionnaire-responses/${item.Id}`}>
        {item.Questionnaire}
      </Link>
    ),
    isRowHeader: true,
    minWidth: 320,
  },
  {
    id: 'Version',
    header: 'Version',
    cell: (item: ResponseRow) => item.Version,
    minWidth: 90,
  },
  {
    id: 'Status',
    header: 'Status',
    cell: (item: ResponseRow) => (
      <SimpleRatingBadge rating={item.Status as any} />
    ),
    minWidth: 140,
  },
  {
    id: 'UserEmail',
    header: 'User email',
    cell: (item: ResponseRow) => item.UserEmail,
    minWidth: 220,
  },
  {
    id: 'StartDate',
    header: 'Start date',
    cell: (item: ResponseRow) => item.StartDate,
    minWidth: 130,
  },
  {
    id: 'RequestCount',
    header: 'Information requests',
    cell: (item: ResponseRow) =>
      item.RequestCount === 0 ? (
        <Box color={'text-status-inactive'}>—</Box>
      ) : (
        <Badge color={'blue'}>
          {`${item.RequestCount} ${
            item.RequestCount === 1 ? 'request' : 'requests'
          }`}
        </Badge>
      ),
    minWidth: 170,
  },
];

const RegisterPageContent = ({ items: rawItems }: { items: ResponseRow[] }) => {
  const collection = useCollection(rawItems, {
    propertyFiltering: {
      filteringProperties: FILTERING_PROPERTIES,
      empty: <span>{'No matches'}</span>,
    },
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
  const { items, propertyFilterProps, paginationProps, collectionProps } =
    collection;

  return (
    <Table
      {...collectionProps}
      columnDefinitions={REGISTER_COLUMNS as any}
      items={items}
      selectionType={'multi'}
      trackBy={'Id'}
      loadingText={'Loading questionnaire responses…'}
      filter={
        <PropertyFilterPanel
          {...propertyFilterProps}
          countText={`${items.length} matches`}
          filteringPlaceholder={'Filter questionnaire responses'}
          virtualScroll
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
};

const RegisterPage = ({ items }: { items: ResponseRow[] }) => {
  const plusIcon = <Plus width={16} height={16} />;
  return (
    <RealProviders initialPath={'/third-party/acme/questionnaires'}>
      <PageLayout
        title={'Acme Supplier Ltd — Questionnaires'}
        counter={`(${items.length})`}
        actions={
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <ButtonDropdown
              items={[
                { id: 'recall', text: 'Recall' },
                { id: 'reject', text: 'Reject' },
                { id: 'more_info', text: 'Request more information' },
              ]}
            >
              {'More actions'}
            </ButtonDropdown>
            <Button
              variant={'primary'}
              iconAlign={'left'}
              iconSvg={plusIcon}
            >
              {'Plan questionnaire'}
            </Button>
          </SpaceBetween>
        }
      >
        <RegisterPageContent items={items} />
      </PageLayout>
    </RealProviders>
  );
};

// ════════════════════════════════════════════════════════════════════════
// Request history fixtures
// ════════════════════════════════════════════════════════════════════════
const oneRequest: RequestHistoryItem[] = [
  {
    Id: 'r-001',
    RequestType: 'furtherInformationRequired',
    Reason:
      'Section 4 (Data Protection) — please attach your most recent SOC 2 ' +
      'Type II report and clarify whether the EU sub-processors listed ' +
      'cover both data-at-rest and data-in-transit encryption.',
    ShareWithRespondents: true,
    CreatedAtTimestamp: '2026-05-08T14:32:00Z',
    CreatedByUser: { FriendlyName: 'Emma Bamford' },
  },
];

const threeRequests: RequestHistoryItem[] = [
  {
    Id: 'r-003',
    RequestType: 'informationProvidedUnclear',
    Reason:
      'Section 6 — the cipher suite answer is still vague. We need the ' +
      'specific TLS version (e.g. TLS 1.3) and confirmation that forward ' +
      'secrecy is enforced.',
    ShareWithRespondents: true,
    CreatedAtTimestamp: '2026-05-09T14:32:00Z',
    CreatedByUser: { FriendlyName: 'Emma Bamford' },
  },
  {
    Id: 'r-002',
    RequestType: 'furtherInformationRequired',
    Reason:
      'Section 4 — the SOC 2 attachment is from 2023. Please provide the ' +
      'most recent (within the last 12 months) report.',
    ShareWithRespondents: true,
    CreatedAtTimestamp: '2026-04-23T11:08:00Z',
    CreatedByUser: { FriendlyName: 'Emma Bamford' },
  },
  {
    Id: 'r-001',
    RequestType: 'furtherInformationRequired',
    Reason:
      'Section 1 — primary contact email is missing. Please add and resubmit.',
    ShareWithRespondents: true,
    CreatedAtTimestamp: '2026-04-05T09:14:00Z',
    CreatedByUser: { FriendlyName: 'James Romero' },
  },
];

// ════════════════════════════════════════════════════════════════════════
// Stories
// ════════════════════════════════════════════════════════════════════════

// ─── Register (alt surface from the ticket — new "Information requests"
//     column with the count pill) ─────────────────────────────────────
export const Register: Story = {
  render: () => <RegisterPage items={RESPONSE_ROWS} />,
};

// ─── Response review (canonical: ExpandableSection collapsed by default) ─
export const Default: Story = {
  render: () => <ReviewPage history={oneRequest} />,
};

export const MultiRound: Story = {
  render: () => <ReviewPage history={threeRequests} />,
};

export const JustSent: Story = {
  render: () => (
    <ReviewPage
      history={[
        {
          ...oneRequest[0],
          Id: 'r-just-sent',
          CreatedAtTimestamp: new Date().toISOString(),
          Reason:
            'Please attach your latest penetration-test report (within ' +
            'the last 6 months) and confirm whether sub-processor X is ' +
            'still in use.',
        },
      ]}
      status={'In progress'}
      statusColor={'#41d9cc'}
      approveDisabled
      banner={
        <Alert
          type={'success'}
          dismissible={false}
          header={'Information request sent to supplier.'}
        >
          The supplier will be notified by email and the response status is
          now <em>In Progress</em>. Your comment is shown below — it will
          stay visible to you on every future review.
        </Alert>
      }
    />
  ),
};

export const EmptyState: Story = {
  name: 'Empty (panel hidden)',
  render: () => (
    <ReviewPage
      history={[]}
      banner={
        <Alert type={'info'} dismissible={false}>
          <strong>Design note (not part of the UI):</strong> per AC 3, the
          ExpandableSection is <em>not rendered</em> when no requests exist.
        </Alert>
      }
    />
  ),
};

// ════════════════════════════════════════════════════════════════════════
// FLOW STORIES — the rest of the customer journey
//
// ⚠️ The modals below approximate production. The real
// UpdateStatusModal uses ModalForm (react-hook-form + zod) which would
// drag in too many transitive dependencies for Storybook. The visual
// composition is verbatim — Modal + FormField + Select + Textarea +
// Toggle + Alert — but the form-state plumbing is local useState
// instead of react-hook-form.
// ════════════════════════════════════════════════════════════════════════

// ─── RequestInfoModal — "Request further information" ──────────────────
const RequestInfoModal = ({
  initialType,
  initialReason,
}: {
  initialType?: RequestType | '';
  initialReason?: string;
}) => {
  const [type, setType] = useState<RequestType | ''>(initialType ?? '');
  const [reason, setReason] = useState(initialReason ?? '');
  const [share, setShare] = useState(true);

  const typeOptions = [
    { label: '-', value: '' },
    {
      label: REQUEST_TYPE_LABEL.furtherInformationRequired,
      value: 'furtherInformationRequired',
    },
    {
      label: REQUEST_TYPE_LABEL.informationProvidedUnclear,
      value: 'informationProvidedUnclear',
    },
  ];
  const selectedOption =
    typeOptions.find((o) => o.value === type) ?? typeOptions[0];

  return (
    <Modal
      visible
      onDismiss={() => undefined}
      header={'Request further information'}
      size={'large'}
      footer={
        <Box float={'right'}>
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <Button variant={'normal'}>{'Cancel'}</Button>
            <Button variant={'primary'} disabled={!type}>
              {'Request'}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size={'m'} direction={'vertical'}>
        <Alert type={'warning'}>
          This will move the response back to <em>In progress</em>. The
          supplier will be notified and can resubmit.
        </Alert>
        <FormField label={'Request type *'} stretch>
          <Select
            selectedOption={selectedOption as any}
            onChange={({ detail }: any) =>
              setType(detail.selectedOption.value as RequestType | '')
            }
            options={typeOptions as any}
            placeholder={'-'}
          />
        </FormField>
        <FormField label={'Reason'} stretch>
          <Textarea
            value={reason}
            onChange={({ detail }: any) => setReason(detail.value)}
            rows={4}
            placeholder={'Tell the supplier what you need…'}
          />
        </FormField>
        <Toggle checked={share} onChange={({ detail }: any) => setShare(detail.checked)}>
          {'Share with respondents'}
        </Toggle>
        <Alert type={'info'}>
          {share
            ? 'The respondent will be notified by email and given the chance to update their submission.'
            : 'The respondent will not be notified — they will only see the change next time they revisit this response.'}
        </Alert>
      </SpaceBetween>
    </Modal>
  );
};

// ─── ApproveModal — confirmation ───────────────────────────────────────
const ApproveModal = () => (
  <Modal
    visible
    onDismiss={() => undefined}
    header={'Approve response'}
    size={'medium'}
    footer={
      <Box float={'right'}>
        <SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button variant={'normal'}>{'Cancel'}</Button>
          <Button variant={'primary'}>{'Approve'}</Button>
        </SpaceBetween>
      </Box>
    }
  >
    Are you sure you want to approve this questionnaire response? This is a
    terminal status — no further edits or requests can be made after.
  </Modal>
);

// ─── RejectModal — confirmation with reason ────────────────────────────
const RejectModal = () => {
  const [reason, setReason] = useState('');
  const [share, setShare] = useState(true);
  return (
    <Modal
      visible
      onDismiss={() => undefined}
      header={'Reject response'}
      size={'large'}
      footer={
        <Box float={'right'}>
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <Button variant={'normal'}>{'Cancel'}</Button>
            <Button variant={'primary'}>{'Reject'}</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size={'m'} direction={'vertical'}>
        <Alert type={'warning'}>
          Rejecting is terminal — the supplier cannot resubmit. They will
          need a new questionnaire invitation.
        </Alert>
        <FormField label={'Reason'} stretch>
          <Textarea
            value={reason}
            onChange={({ detail }: any) => setReason(detail.value)}
            rows={4}
            placeholder={'Why are you rejecting this submission?'}
          />
        </FormField>
        <Toggle checked={share} onChange={({ detail }: any) => setShare(detail.checked)}>
          {'Share with respondents'}
        </Toggle>
      </SpaceBetween>
    </Modal>
  );
};

// ─── Flow stories ──────────────────────────────────────────────────────
//
// Read top-down for the canonical journey:
//   Register → Default → Expanded → RequestModalOpen → JustSent → MultiRound
//   → ApproveModalOpen → Approved   (happy path: approval)
//                       → RejectModalOpen → Rejected  (alt: rejection)

// 1. Expanded — user clicked the ExpandableSection on the Default page.
//    Renders identical content; only `defaultExpanded` differs.
const ExpandedReviewPage = ({
  history,
}: {
  history: RequestHistoryItem[];
}) => (
  <RealProviders
    initialPath={'/third-party/acme/questionnaire-responses/q3-2026'}
  >
    <PageLayout title={'Q3 2026 Information Security Review'}>
      <Container>
        <SpaceBetween size={'m'} direction={'vertical'}>
          <StatusRow />
          {history.length > 0 && (
            <ExpandableSection
              variant={'container'}
              headerText={'Information requests'}
              headerCounter={`(${history.length})`}
              defaultExpanded={true}
            >
              <RequestHistoryTable items={history} />
            </ExpandableSection>
          )}
          <FilledContent />
          <FooterActions />
        </SpaceBetween>
      </Container>
    </PageLayout>
  </RealProviders>
);

export const Expanded: Story = {
  name: 'Expanded (after user clicks)',
  render: () => <ExpandedReviewPage history={threeRequests} />,
};

// 2. Modal: Request further information — open over the Default review.
export const RequestModalOpen: Story = {
  name: 'Modal — Request further information',
  render: () => <ReviewPage history={oneRequest} modal={<RequestInfoModal />} />,
};

// 3. Modal: Approve confirmation
export const ApproveModalOpen: Story = {
  name: 'Modal — Approve confirmation',
  render: () => (
    <ReviewPage history={threeRequests} modal={<ApproveModal />} />
  ),
};

// 4. Approved (terminal) — status pill green, all actions disabled.
export const Approved: Story = {
  name: 'Terminal — Approved',
  render: () => (
    <ReviewPage
      history={threeRequests}
      status={'Approved'}
      statusColor={'#048e6b'}
      approveDisabled
      banner={
        <Alert
          type={'success'}
          dismissible={false}
          header={'Response approved.'}
        >
          The questionnaire has been approved. The information request
          history is preserved as the permanent audit trail for this
          submission.
        </Alert>
      }
    />
  ),
};

// 5. Modal: Reject confirmation
export const RejectModalOpen: Story = {
  name: 'Modal — Reject confirmation',
  render: () => (
    <ReviewPage history={threeRequests} modal={<RejectModal />} />
  ),
};

// 6. Rejected (terminal)
export const Rejected: Story = {
  name: 'Terminal — Rejected',
  render: () => (
    <ReviewPage
      history={threeRequests}
      status={'Rejected'}
      statusColor={'#d91515'}
      approveDisabled
      banner={
        <Alert
          type={'error'}
          dismissible={false}
          header={'Response rejected.'}
        >
          The questionnaire has been rejected. The supplier must be
          invited to a new questionnaire if you want them to resubmit.
        </Alert>
      }
    />
  ),
};

// ════════════════════════════════════════════════════════════════════════
// CLICK-THROUGH — the full flow as one interactive story.
//
// One Storybook entry that holds the whole demo state. Use it to walk a
// stakeholder through the journey end-to-end in one click path:
//
//   Register (4 rows)
//     → click "Q3 2026 Information Security Review" row
//   Review page (Awaiting review · 1 prior request, panel collapsed)
//     → click ExpandableSection to expand
//     → click "More actions → Request further information"
//   Request-info modal (composing)
//     → fill in Type + Reason, click "Request"
//   Banner: "Information request sent" · status → In progress
//     → click "▶ Simulate supplier resubmit" (demo-only button)
//   Status → Awaiting review · history now contains the new round
//     → click "Approve" → confirm in modal
//   Terminal: Approved · success banner · history preserved
//
// Reset returns to the Register entry-point.
//
// A small grey "Demo controls" strip is rendered at the very top of the
// canvas so a coworker can reset / simulate. NOT part of the production UI.
// ════════════════════════════════════════════════════════════════════════
type DemoPage = 'register' | 'review';
type DemoStatus = 'awaiting_review' | 'in_progress' | 'approved' | 'rejected';
type DemoModal = null | 'request' | 'approve' | 'reject';

const STATUS_LABEL: Record<DemoStatus, string> = {
  awaiting_review: 'Awaiting review',
  in_progress: 'In progress',
  approved: 'Approved',
  rejected: 'Rejected',
};
const STATUS_COLOUR: Record<DemoStatus, string> = {
  awaiting_review: '#F2A041',
  in_progress: '#41d9cc',
  approved: '#048e6b',
  rejected: '#d91515',
};

// Click-through modal — inline form state, controlled buttons that
// drive the parent demo state.
const ClickthroughRequestModal = ({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (data: { type: RequestType; reason: string; share: boolean }) => void;
}) => {
  const [type, setType] = useState<RequestType | ''>('');
  const [reason, setReason] = useState('');
  const [share, setShare] = useState(true);
  const typeOptions = [
    { label: '-', value: '' },
    {
      label: REQUEST_TYPE_LABEL.furtherInformationRequired,
      value: 'furtherInformationRequired',
    },
    {
      label: REQUEST_TYPE_LABEL.informationProvidedUnclear,
      value: 'informationProvidedUnclear',
    },
  ];
  const selectedOption =
    typeOptions.find((o) => o.value === type) ?? typeOptions[0];
  return (
    <Modal
      visible
      onDismiss={onCancel}
      header={'Request further information'}
      size={'large'}
      footer={
        <Box float={'right'}>
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <Button variant={'normal'} onClick={onCancel}>
              {'Cancel'}
            </Button>
            <Button
              variant={'primary'}
              disabled={!type}
              onClick={() =>
                type && onSubmit({ type, reason, share })
              }
            >
              {'Request'}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size={'m'} direction={'vertical'}>
        <Alert type={'warning'}>
          This will move the response back to <em>In progress</em>. The
          supplier will be notified and can resubmit.
        </Alert>
        <FormField label={'Request type *'} stretch>
          <Select
            selectedOption={selectedOption as any}
            onChange={({ detail }: any) =>
              setType(detail.selectedOption.value as RequestType | '')
            }
            options={typeOptions as any}
            placeholder={'-'}
          />
        </FormField>
        <FormField label={'Reason'} stretch>
          <Textarea
            value={reason}
            onChange={({ detail }: any) => setReason(detail.value)}
            rows={4}
            placeholder={'Tell the supplier what you need…'}
          />
        </FormField>
        <Toggle
          checked={share}
          onChange={({ detail }: any) => setShare(detail.checked)}
        >
          {'Share with respondents'}
        </Toggle>
      </SpaceBetween>
    </Modal>
  );
};

const ClickthroughApproveModal = ({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Modal
    visible
    onDismiss={onCancel}
    header={'Approve response'}
    size={'medium'}
    footer={
      <Box float={'right'}>
        <SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button variant={'normal'} onClick={onCancel}>
            {'Cancel'}
          </Button>
          <Button variant={'primary'} onClick={onConfirm}>
            {'Approve'}
          </Button>
        </SpaceBetween>
      </Box>
    }
  >
    Are you sure you want to approve this questionnaire response? This is a
    terminal status — no further edits or requests can be made after.
  </Modal>
);

const ClickthroughRejectModal = ({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const [reason, setReason] = useState('');
  const [share, setShare] = useState(true);
  return (
    <Modal
      visible
      onDismiss={onCancel}
      header={'Reject response'}
      size={'large'}
      footer={
        <Box float={'right'}>
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <Button variant={'normal'} onClick={onCancel}>
              {'Cancel'}
            </Button>
            <Button variant={'primary'} onClick={onConfirm}>
              {'Reject'}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size={'m'} direction={'vertical'}>
        <Alert type={'warning'}>
          Rejecting is terminal — the supplier cannot resubmit. They will
          need a new questionnaire invitation.
        </Alert>
        <FormField label={'Reason'} stretch>
          <Textarea
            value={reason}
            onChange={({ detail }: any) => setReason(detail.value)}
            rows={4}
            placeholder={'Why are you rejecting this submission?'}
          />
        </FormField>
        <Toggle
          checked={share}
          onChange={({ detail }: any) => setShare(detail.checked)}
        >
          {'Share with respondents'}
        </Toggle>
      </SpaceBetween>
    </Modal>
  );
};

// ─── Click-through register (real-table version, wired to navigate) ────
const ClickthroughRegister = ({
  rows,
  onOpen,
}: {
  rows: ResponseRow[];
  onOpen: (id: string) => void;
}) => {
  const plusIcon = <Plus width={16} height={16} />;
  const collection = useCollection(rows, {
    propertyFiltering: {
      filteringProperties: FILTERING_PROPERTIES,
      empty: <span>{'No matches'}</span>,
    },
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
  const { items, propertyFilterProps, paginationProps, collectionProps } =
    collection;
  const columns = REGISTER_COLUMNS.map((c) =>
    c.id === 'Questionnaire'
      ? {
          ...c,
          cell: (item: ResponseRow) => (
            <Link
              onFollow={(e: any) => {
                e.preventDefault?.();
                onOpen(item.Id);
              }}
              href={'#'}
            >
              {item.Questionnaire}
            </Link>
          ),
        }
      : c
  );
  return (
    <PageLayout
      title={'Acme Supplier Ltd — Questionnaires'}
      counter={`(${rows.length})`}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ButtonDropdown
            items={[
              { id: 'recall', text: 'Recall' },
              { id: 'reject', text: 'Reject' },
              { id: 'more_info', text: 'Request more information' },
            ]}
          >
            {'More actions'}
          </ButtonDropdown>
          <Button variant={'primary'} iconAlign={'left'} iconSvg={plusIcon}>
            {'Plan questionnaire'}
          </Button>
        </SpaceBetween>
      }
    >
      <Table
        {...collectionProps}
        columnDefinitions={columns as any}
        items={items}
        selectionType={'multi'}
        trackBy={'Id'}
        loadingText={'Loading questionnaire responses…'}
        filter={
          <PropertyFilterPanel
            {...propertyFilterProps}
            countText={`${items.length} matches`}
            filteringPlaceholder={'Filter questionnaire responses'}
            virtualScroll
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </PageLayout>
  );
};

// ─── Click-through review page — wired to the demo state ───────────────
const ClickthroughReview = ({
  history,
  status,
  banner,
  onAction,
  onBack,
}: {
  history: RequestHistoryItem[];
  status: DemoStatus;
  banner: React.ReactNode;
  onAction: (a: 'approve' | 'reject' | 'requestInfo') => void;
  onBack: () => void;
}) => {
  const terminal = status === 'approved' || status === 'rejected';
  const inProgress = status === 'in_progress';
  // While the response is In progress, the customer can't act until the
  // supplier resubmits. Match the production isDisabled rule.
  const actionsDisabled = terminal || inProgress;

  const moreActionItems: ActionItem[] = [
    { id: 'recall', text: 'Recall', disabled: actionsDisabled },
    { id: 'reject', text: 'Reject', disabled: actionsDisabled },
    { id: 'more_info', text: 'Request more information', disabled: actionsDisabled },
  ];

  return (
    <PageLayout title={'Q3 2026 Information Security Review'}>
      <Container>
        <SpaceBetween size={'m'} direction={'vertical'}>
          <SpaceBetween size={'s'} direction={'horizontal'}>
            <Header variant={'h2'}>{'Status:'}</Header>
            <div className={'flex h-full items-center justify-center'}>
              <SimpleRatingBadge
                rating={
                  {
                    label: STATUS_LABEL[status],
                    rgbHexColor: STATUS_COLOUR[status],
                    value: 1,
                    ratingType: 'third_party_response_status',
                    __typename: 'parent_rating' as any,
                  } as any
                }
              />
            </div>
          </SpaceBetween>
          {banner}
          {history.length > 0 && (
            <ExpandableSection
              variant={'container'}
              headerText={'Information requests'}
              headerCounter={`(${history.length})`}
              defaultExpanded={false}
            >
              <RequestHistoryTable items={history} />
            </ExpandableSection>
          )}
          <FilledContent />
          <SpaceBetween direction={'horizontal'} size={'s'}>
            <SpaceBetween direction={'horizontal'} size={'s'}>
              <Button
                variant={'primary'}
                disabled={actionsDisabled}
                onClick={() => onAction('approve')}
              >
                {'Approve'}
              </Button>
              <ButtonDropdown
                disabled={moreActionItems.every((a) => a.disabled)}
                items={moreActionItems}
                variant={'normal'}
                onItemClick={({ detail }: any) => {
                  if (detail.id === 'reject') onAction('reject');
                  if (detail.id === 'more_info') onAction('requestInfo');
                }}
              >
                {'More actions'}
              </ButtonDropdown>
            </SpaceBetween>
            <Button variant={'normal'} onClick={onBack}>
              {'Cancel'}
            </Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    </PageLayout>
  );
};

// ─── DemoControls — non-production strip for resetting / simulating ────
const DemoControls = ({
  page,
  status,
  onReset,
  onSimulateResubmit,
}: {
  page: DemoPage;
  status: DemoStatus;
  onReset: () => void;
  onSimulateResubmit: () => void;
}) => (
  <Alert type={'info'} dismissible={false} header={'Demo controls (not part of the UI)'}>
    <SpaceBetween size={'xs'} direction={'horizontal'}>
      <Box variant={'small'}>
        {`Page: ${page} · Status: ${STATUS_LABEL[status]}`}
      </Box>
      <Button
        variant={'normal'}
        disabled={page !== 'review' || status !== 'in_progress'}
        onClick={onSimulateResubmit}
      >
        {'▶ Simulate supplier resubmit'}
      </Button>
      <Button variant={'normal'} onClick={onReset}>
        {'⟲ Reset demo'}
      </Button>
    </SpaceBetween>
  </Alert>
);

// ─── The click-through story ───────────────────────────────────────────
const ClickthroughPrototype = () => {
  const initialHistory: RequestHistoryItem[] = [oneRequest[0]];
  const [page, setPage] = useState<DemoPage>('register');
  const [status, setStatus] = useState<DemoStatus>('awaiting_review');
  const [history, setHistory] = useState<RequestHistoryItem[]>(initialHistory);
  const [modal, setModal] = useState<DemoModal>(null);
  const [banner, setBanner] = useState<React.ReactNode>(null);

  const reset = () => {
    setPage('register');
    setStatus('awaiting_review');
    setHistory(initialHistory);
    setModal(null);
    setBanner(null);
  };

  const openResponse = (id: string) => {
    setPage('review');
    setBanner(null);
    // For non-target rows in the click-through, jump to the same demo
    // review page — the prototype only models one response.
    if (id !== 'q3-2026') {
      setBanner(
        <Alert type={'info'} dismissible={true} onDismiss={() => setBanner(null)}>
          Demo: click-through only models the Q3 2026 response — showing
          that one here. Other rows would behave identically.
        </Alert>
      );
    }
  };

  const handleAction = (a: 'approve' | 'reject' | 'requestInfo') => {
    if (a === 'requestInfo') setModal('request');
    if (a === 'approve') setModal('approve');
    if (a === 'reject') setModal('reject');
  };

  const submitRequest = (data: {
    type: RequestType;
    reason: string;
    share: boolean;
  }) => {
    const newItem: RequestHistoryItem = {
      Id: `r-${Date.now()}`,
      RequestType: data.type,
      Reason: data.reason || '(no reason provided)',
      ShareWithRespondents: data.share,
      CreatedAtTimestamp: new Date().toISOString(),
      CreatedByUser: { FriendlyName: 'James Romero' },
    };
    setHistory((prev) => [newItem, ...prev]);
    setStatus('in_progress');
    setModal(null);
    setBanner(
      <Alert
        type={'success'}
        dismissible={true}
        onDismiss={() => setBanner(null)}
        header={'Information request sent to supplier.'}
      >
        The supplier will be notified by email and the response status is
        now <em>In progress</em>. Your comment is shown in the history above
        — it will stay visible to you on every future review.
      </Alert>
    );
  };

  const confirmApprove = () => {
    setStatus('approved');
    setModal(null);
    setBanner(
      <Alert
        type={'success'}
        dismissible={false}
        header={'Response approved.'}
      >
        The questionnaire has been approved. The information request
        history is preserved as the permanent audit trail for this
        submission.
      </Alert>
    );
  };

  const confirmReject = () => {
    setStatus('rejected');
    setModal(null);
    setBanner(
      <Alert
        type={'error'}
        dismissible={false}
        header={'Response rejected.'}
      >
        The questionnaire has been rejected. The supplier must be
        invited to a new questionnaire if you want them to resubmit.
      </Alert>
    );
  };

  const simulateResubmit = () => {
    setStatus('awaiting_review');
    setBanner(
      <Alert
        type={'info'}
        dismissible={true}
        onDismiss={() => setBanner(null)}
        header={'Supplier resubmitted.'}
      >
        Demo: the supplier has resubmitted the questionnaire. You can now
        take another action — the request history above is preserved.
      </Alert>
    );
  };

  return (
    <RealProviders initialPath={'/third-party/acme/questionnaires'}>
      <SpaceBetween size={'s'} direction={'vertical'}>
        <DemoControls
          page={page}
          status={status}
          onReset={reset}
          onSimulateResubmit={simulateResubmit}
        />
        {page === 'register' ? (
          <ClickthroughRegister
            rows={RESPONSE_ROWS}
            onOpen={openResponse}
          />
        ) : (
          <ClickthroughReview
            history={history}
            status={status}
            banner={banner}
            onAction={handleAction}
            onBack={() => {
              setPage('register');
              setBanner(null);
            }}
          />
        )}
        {modal === 'request' && (
          <ClickthroughRequestModal
            onCancel={() => setModal(null)}
            onSubmit={submitRequest}
          />
        )}
        {modal === 'approve' && (
          <ClickthroughApproveModal
            onCancel={() => setModal(null)}
            onConfirm={confirmApprove}
          />
        )}
        {modal === 'reject' && (
          <ClickthroughRejectModal
            onCancel={() => setModal(null)}
            onConfirm={confirmReject}
          />
        )}
      </SpaceBetween>
    </RealProviders>
  );
};

export const Clickthrough: Story = {
  name: '⏵ Click-through (full flow)',
  render: () => <ClickthroughPrototype />,
};
