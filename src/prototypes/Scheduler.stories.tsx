// Prototypes / Scheduler — Schedule Register + Add Schedule modal
//
// ⚠️ SPECULATIVE — no production scheduler page exists yet.
// This prototype lifts the SAME production components used across other
// register pages (Table, PropertyFilterPanel, DashboardItem, ActionsButton,
// Tokens, SimpleRatingBadge, PageLayout, Modal, FormField, Select, etc.)
// so the visual language is 1:1 with the live app.
// The multi-step modal and recurrence panel are new compositions.
//
// Covers all 6 items from the brief:
//   1. Ownership — object owner read-only + contributors multiselect
//   2. Event type — grouped 1st / 2nd / 3rd line with full list
//   3. Filtering — PropertyFilterPanel with tags / departments / tiers
//   4. Overdue vs Missed — distinct statuses + correct action menus
//   5. Clickable links — schedule name links to object
//   6. Scheduling & recurrence — Daily / Weekly / Monthly / Yearly UI
//
// Lifted from:
//   src/page-templates/TablePage.stories.tsx (register layout)
//   src/cloudscape-reference/_setup (Cloudscape theme + fonts)

import { useCollection } from '@cloudscape-design/collection-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import Badge from '@risk-smart/themed-cloudscape-components/badge';
import Box from '@risk-smart/themed-cloudscape-components/box';
import ButtonDropdown from '@risk-smart/themed-cloudscape-components/button-dropdown';
import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Link from '@risk-smart/themed-cloudscape-components/link';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import Multiselect from '@risk-smart/themed-cloudscape-components/multiselect';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';

// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';
// eslint-disable-next-line import/no-unresolved
import ActionsButton from 'src/components/actions-button';
// eslint-disable-next-line import/no-unresolved
import { DashboardItem } from 'src/components/register-dashboard/DashboardItem';
// eslint-disable-next-line import/no-unresolved
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
// eslint-disable-next-line import/no-unresolved
import NoMatchesCollection from 'src/components/empty-collection/NoMatchesCollection';
// eslint-disable-next-line import/no-unresolved
import PropertyFilterPanel from 'src/components/property-filter-panel';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// eslint-disable-next-line import/no-unresolved
import Tokens from 'src/components/tokens';

// ─── Event type data ────────────────────────────────────────────────────────

type EventLine = '1st_line' | '2nd_line' | '3rd_line';

type EventType = {
  value: string;
  label: string;
  line: EventLine;
};

const EVENT_TYPES: EventType[] = [
  // 1st Line
  { value: 'rate_risk',         label: 'Rate a Risk',                                    line: '1st_line' },
  { value: 'test_control',      label: 'Test a Control',                                 line: '1st_line' },
  { value: 'rate_policy',       label: 'Rate a Policy',                                  line: '1st_line' },
  { value: 'review_policy_ver', label: 'Review a Policy version',                        line: '1st_line' },
  { value: 'rate_obligation',   label: 'Rate an Obligation',                             line: '1st_line' },
  { value: 'add_indicator',     label: 'Add an Indicator result',                        line: '1st_line' },
  { value: 'review_tp_contract',label: 'Review a Third Party contract',                  line: '1st_line' },
  { value: 'review_tp_ddq',     label: 'Review a Third Party DDQ',                       line: '1st_line' },
  { value: 'complete_rcsa',     label: 'Complete an RCSA',                               line: '1st_line' },
  // 2nd Line (Oversight)
  { value: 'oversight_rate_risk',    label: 'Oversight activity — rate a Risk',          line: '2nd_line' },
  { value: 'oversight_test_control', label: 'Oversight activity — test a Control',       line: '2nd_line' },
  { value: 'oversight_rate_policy',  label: 'Oversight activity — rate a Policy',        line: '2nd_line' },
  { value: 'oversight_rate_obl',     label: 'Oversight activity — rate an Obligation',   line: '2nd_line' },
  // 3rd Line (Internal Audit)
  { value: 'audit_rate_risk',    label: 'Internal Audit activity — rate a Risk',         line: '3rd_line' },
  { value: 'audit_test_control', label: 'Internal Audit activity — test a Control',      line: '3rd_line' },
  { value: 'audit_rate_policy',  label: 'Internal Audit activity — rate a Policy',       line: '3rd_line' },
  { value: 'audit_rate_obl',     label: 'Internal Audit activity — rate an Obligation',  line: '3rd_line' },
];

const EVENT_TYPE_SELECT_OPTIONS = [
  {
    label: 'First Line',
    options: EVENT_TYPES.filter((e) => e.line === '1st_line').map((e) => ({ label: e.label, value: e.value })),
  },
  {
    label: 'Second Line (Oversight)',
    options: EVENT_TYPES.filter((e) => e.line === '2nd_line').map((e) => ({ label: e.label, value: e.value })),
  },
  {
    label: 'Third Line (Internal Audit)',
    options: EVENT_TYPES.filter((e) => e.line === '3rd_line').map((e) => ({ label: e.label, value: e.value })),
  },
];

const LINE_BADGE_COLOR: Record<EventLine, 'blue' | 'green' | 'grey'> = {
  '1st_line': 'blue',
  '2nd_line': 'green',
  '3rd_line': 'grey',
};

// ─── Schedule data ───────────────────────────────────────────────────────────

type ScheduleStatus = 'Scheduled' | 'In Progress' | 'Overdue' | 'Missed' | 'Completed';

type Contributor = { value: string; label: string };

type ScheduleRow = {
  id: string;
  name: string;
  objectUrl: string;
  eventType: EventType;
  objectOwner: string;
  objectOwnerInitials: string;
  contributors: Contributor[];
  startDate: string;
  dueDate: string;
  nextOccurrence: string | null;
  status: ScheduleStatus;
};

const SAMPLE_SCHEDULES: ScheduleRow[] = [
  {
    id: 'S-001',
    name: 'Q1 Risk Assessment — Data Breach Risk',
    objectUrl: '/risks/R-001',
    eventType: EVENT_TYPES.find((e) => e.value === 'rate_risk')!,
    objectOwner: 'Sarah Johnson',
    objectOwnerInitials: 'SJ',
    contributors: [],
    startDate: '14/06/2026',
    dueDate: '21/06/2026',
    nextOccurrence: '21/09/2026',
    status: 'Scheduled',
  },
  {
    id: 'S-002',
    name: 'Annual GDPR Policy Review',
    objectUrl: '/policy/P-007',
    eventType: EVENT_TYPES.find((e) => e.value === 'review_policy_ver')!,
    objectOwner: 'Michael Brown',
    objectOwnerInitials: 'MB',
    contributors: [{ value: 'jr', label: 'James Romero' }],
    startDate: '01/02/2026',
    dueDate: '28/02/2026',
    nextOccurrence: '01/03/2027',
    status: 'Overdue',
  },
  {
    id: 'S-003',
    name: 'Weekly KRI Data Entry',
    objectUrl: '/indicators/I-012',
    eventType: EVENT_TYPES.find((e) => e.value === 'add_indicator')!,
    objectOwner: 'James Romero',
    objectOwnerInitials: 'JR',
    contributors: [],
    startDate: '05/06/2026',
    dueDate: '05/06/2026',
    nextOccurrence: '12/06/2026',
    status: 'Completed',
  },
  {
    id: 'S-004',
    name: 'Vendor Risk Assessment — CloudCorp Ltd',
    objectUrl: '/third-party/TP-034',
    eventType: EVENT_TYPES.find((e) => e.value === 'review_tp_contract')!,
    objectOwner: 'Sarah Johnson',
    objectOwnerInitials: 'SJ',
    contributors: [{ value: 'mb', label: 'Michael Brown' }, { value: 'jr', label: 'James Romero' }],
    startDate: '01/03/2026',
    dueDate: '10/03/2026',
    nextOccurrence: '10/06/2026',
    status: 'Scheduled',
  },
  {
    id: 'S-005',
    name: 'Contract Renewal Review — SecureNet Services',
    objectUrl: '/third-party/TP-041',
    eventType: EVENT_TYPES.find((e) => e.value === 'review_tp_ddq')!,
    objectOwner: 'James Romero',
    objectOwnerInitials: 'JR',
    contributors: [],
    startDate: '25/02/2026',
    dueDate: '06/03/2026',
    nextOccurrence: null,
    status: 'Missed',
  },
  {
    id: 'S-006',
    name: 'Quarterly Board Risk Report',
    objectUrl: '/risks/R-003',
    eventType: EVENT_TYPES.find((e) => e.value === 'rate_risk')!,
    objectOwner: 'Sarah Johnson',
    objectOwnerInitials: 'SJ',
    contributors: [],
    startDate: '20/03/2026',
    dueDate: '31/03/2026',
    nextOccurrence: '01/07/2026',
    status: 'Scheduled',
  },
  {
    id: 'S-007',
    name: 'Monthly Incident Review Meeting',
    objectUrl: '/controls/C-018',
    eventType: EVENT_TYPES.find((e) => e.value === 'test_control')!,
    objectOwner: 'Sarah Johnson',
    objectOwnerInitials: 'SJ',
    contributors: [],
    startDate: '28/02/2025',
    dueDate: '28/02/2025',
    nextOccurrence: '30/03/2026',
    status: 'Completed',
  },
  {
    id: 'S-008',
    name: 'HR RCSA — Recruitment Risks',
    objectUrl: '/risks/R-022',
    eventType: EVENT_TYPES.find((e) => e.value === 'complete_rcsa')!,
    objectOwner: 'James Romero',
    objectOwnerInitials: 'JR',
    contributors: [],
    startDate: '14/03/2026',
    dueDate: '20/03/2026',
    nextOccurrence: null,
    status: 'Missed',
  },
  {
    id: 'S-009',
    name: 'Quarterly Compliance Risk Review',
    objectUrl: '/risks/R-009',
    eventType: EVENT_TYPES.find((e) => e.value === 'oversight_rate_risk')!,
    objectOwner: 'Sarah Johnson',
    objectOwnerInitials: 'SJ',
    contributors: [{ value: 'mb', label: 'Michael Brown' }],
    startDate: '09/06/2026',
    dueDate: '16/06/2026',
    nextOccurrence: '16/09/2026',
    status: 'In Progress',
  },
  {
    id: 'S-010',
    name: 'Resource Capacity Review',
    objectUrl: '/risks/R-015',
    eventType: EVENT_TYPES.find((e) => e.value === 'rate_risk')!,
    objectOwner: 'James Romero',
    objectOwnerInitials: 'JR',
    contributors: [],
    startDate: '06/06/2026',
    dueDate: '07/06/2026',
    nextOccurrence: '22/06/2026',
    status: 'Scheduled',
  },
];

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ScheduleStatus, { color: string; label: string }> = {
  Scheduled:   { color: 'light-grey',    label: 'Scheduled' },
  'In Progress': { color: 'orange',      label: 'In Progress' },
  Overdue:     { color: 'dark-red',      label: 'Overdue' },
  Missed:      { color: 'dark-red',      label: 'Missed' },
  Completed:   { color: 'darker-green',  label: 'Completed' },
};

// ─── Row action items by status ──────────────────────────────────────────────

function getRowActions(status: ScheduleStatus) {
  const common = [
    { id: 'edit',   text: 'Edit schedule' },
    { id: 'pause',  text: status === 'Scheduled' || status === 'In Progress' ? 'Pause' : 'Resume' },
    { id: 'delete', text: 'Delete', disabled: false },
  ];

  if (status === 'Overdue') {
    return [
      { id: 'reminder',   text: 'Send reminder' },
      { id: 'reassign',   text: 'Reassign' },
      { id: 'extend',     text: 'Extend due date' },
      ...common,
    ];
  }

  if (status === 'Missed') {
    return [
      { id: 'recover',    text: 'Record recovery action' },
      { id: 'reschedule', text: 'Reschedule' },
      { id: 'escalate',   text: 'Escalate' },
      { id: 'perm_miss',  text: 'Mark as permanently missed' },
      ...common,
    ];
  }

  return common;
}

// ─── Cell helpers ────────────────────────────────────────────────────────────

const OwnerCell = ({ name, initials }: { name: string; initials: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{
      display: 'inline-flex', height: 24, width: 24, alignItems: 'center',
      justifyContent: 'center', borderRadius: 9999,
      background: '#E2E8F0', fontSize: 10, fontWeight: 600, color: '#475569',
      flexShrink: 0,
    }}>
      {initials}
    </span>
    <span style={{ fontSize: 14 }}>{name}</span>
  </div>
);

const ContributorsCell = ({ contributors }: { contributors: Contributor[] }) => {
  if (contributors.length === 0) return <Box color="text-body-secondary" variant="small">—</Box>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {contributors.map((c) => (
        <span key={c.value} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 4,
          padding: '2px 8px', fontSize: 12, color: '#334155',
        }}>
          {c.label}
        </span>
      ))}
    </div>
  );
};

// ─── Table columns ────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    id: 'name',
    header: 'Schedule name',
    sortingField: 'name',
    isRowHeader: true,
    minWidth: 280,
    cell: (row: ScheduleRow) => (
      <Link href={row.objectUrl}>{row.name}</Link>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    sortingField: 'eventType',
    minWidth: 220,
    cell: (row: ScheduleRow) => (
      <Badge color={LINE_BADGE_COLOR[row.eventType.line]}>
        {row.eventType.label}
      </Badge>
    ),
  },
  {
    id: 'owner',
    header: 'Owner',
    sortingField: 'objectOwner',
    minWidth: 160,
    cell: (row: ScheduleRow) => (
      <OwnerCell name={row.objectOwner} initials={row.objectOwnerInitials} />
    ),
  },
  {
    id: 'contributors',
    header: 'Contributors',
    minWidth: 160,
    cell: (row: ScheduleRow) => <ContributorsCell contributors={row.contributors} />,
  },
  {
    id: 'startDate',
    header: 'Start date',
    sortingField: 'startDate',
    minWidth: 120,
    cell: (row: ScheduleRow) => row.startDate,
  },
  {
    id: 'dueDate',
    header: 'Due date',
    sortingField: 'dueDate',
    minWidth: 120,
    cell: (row: ScheduleRow) => row.dueDate,
  },
  {
    id: 'nextOccurrence',
    header: 'Next occurrence',
    sortingField: 'nextOccurrence',
    minWidth: 140,
    cell: (row: ScheduleRow) =>
      row.nextOccurrence ?? <Box color="text-body-secondary" variant="small">—</Box>,
  },
  {
    id: 'status',
    header: 'Status',
    sortingField: 'status',
    minWidth: 130,
    cell: (row: ScheduleRow) => (
      <SimpleRatingBadge rating={STATUS_CONFIG[row.status]} />
    ),
  },
  {
    id: 'actions',
    header: '',
    minWidth: 48,
    cell: (row: ScheduleRow) => (
      <ButtonDropdown
        variant={'icon'}
        items={getRowActions(row.status)}
        onItemClick={() => {}}
        ariaLabel={`Actions for ${row.name}`}
      />
    ),
  },
];

// ─── Filter properties for PropertyFilterPanel ────────────────────────────────

const FILTER_PROPERTIES = [
  {
    key: 'status',
    propertyLabel: 'Status',
    groupValuesLabel: 'Status values',
    operators: ['=', '!='] as const,
    group: 'filter',
  },
  {
    key: 'eventType',
    propertyLabel: 'Event type',
    groupValuesLabel: 'Event type values',
    operators: ['=', '!='] as const,
    group: 'filter',
  },
  {
    key: 'department',
    propertyLabel: 'Department',
    groupValuesLabel: 'Department values',
    operators: ['=', '!='] as const,
    group: 'filter',
  },
  {
    key: 'tags',
    propertyLabel: 'Tags',
    groupValuesLabel: 'Tag values',
    operators: ['=', '!='] as const,
    group: 'filter',
  },
  {
    key: 'tier',
    propertyLabel: 'Tier',
    groupValuesLabel: 'Tier values',
    operators: ['=', '!='] as const,
    group: 'filter',
  },
  {
    key: 'owner',
    propertyLabel: 'Owner',
    groupValuesLabel: 'Owner values',
    operators: ['=', '!='] as const,
    group: 'filter',
  },
];

const DEFAULT_I18N_STRINGS = {
  filteringAriaLabel: 'Filter schedules',
  dismissAriaLabel: 'Dismiss',
  filteringPlaceholder: 'Filter by status, event type, department, tags or tier',
  groupValuesText: 'Values',
  groupPropertiesText: 'Properties',
  operatorsText: 'Operators',
  operationAndText: 'and',
  operationOrText: 'or',
  operatorLessText: 'Less than',
  operatorLessOrEqualText: 'Less than or equal',
  operatorGreaterText: 'Greater than',
  operatorGreaterOrEqualText: 'Greater than or equal',
  operatorContainsText: 'Contains',
  operatorDoesNotContainText: 'Does not contain',
  operatorEqualsText: 'Equals',
  operatorDoesNotEqualText: 'Does not equal',
  editTokenHeader: 'Edit filter',
  propertyText: 'Property',
  operatorText: 'Operator',
  valueText: 'Value',
  cancelActionText: 'Cancel',
  applyActionText: 'Apply',
  allPropertiesLabel: 'All properties',
  tokenLimitShowMore: 'Show more',
  tokenLimitShowFewer: 'Show fewer',
  clearFiltersText: 'Clear filters',
  tokenOperatorAriaLabel: 'Boolean operator',
  removeTokenButtonAriaLabel: (token: any) => `Remove ${token.propertyLabel} filter`,
  enteredTextLabel: (text: string) => `Use "${text}"`,
};

// ─── Recurrence panel ─────────────────────────────────────────────────────────

type RepeatMode = 'daily' | 'weekly' | 'monthly' | 'yearly';
type EndMode = 'on_date' | 'after_count' | 'no_end';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ORDINALS = [
  { value: 'first', label: 'First' },
  { value: 'second', label: 'Second' },
  { value: 'third', label: 'Third' },
  { value: 'fourth', label: 'Fourth' },
  { value: 'last', label: 'Last' },
];

const RecurrencePanel = () => {
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('weekly');
  const [everyN, setEveryN] = useState('1');
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set(['Mon']));
  const [monthDayMode, setMonthDayMode] = useState<'day_number' | 'ordinal'>('day_number');
  const [monthDay, setMonthDay] = useState('1');
  const [ordinal, setOrdinal] = useState('first');
  const [selectedMonth, setSelectedMonth] = useState('Jan');
  const [endMode, setEndMode] = useState<EndMode>('no_end');
  const [endDate, setEndDate] = useState('');
  const [occurrences, setOccurrences] = useState('12');

  const unitLabel = { daily: 'days', weekly: 'weeks', monthly: 'months', yearly: 'years' }[repeatMode];

  return (
    <SpaceBetween size={'m'}>
      {/* Repeat mode */}
      <FormField label={'Repeat'}>
        <RadioGroup
          value={repeatMode}
          onChange={({ detail }) => setRepeatMode(detail.value as RepeatMode)}
          items={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
        />
      </FormField>

      {/* Every N units */}
      <FormField label={`Every`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 80 }}>
            <Input
              type={'number'}
              value={everyN}
              onChange={({ detail }) => setEveryN(detail.value)}
              inputMode={'numeric'}
            />
          </div>
          <Box variant={'p'}>{unitLabel}</Box>
        </div>
      </FormField>

      {/* Weekly: day picker */}
      {repeatMode === 'weekly' && (
        <FormField label={'On'}>
          <div style={{ display: 'flex', gap: 6 }}>
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDays.has(day);
              return (
                <button
                  key={day}
                  type={'button'}
                  onClick={() => {
                    const next = new Set(selectedDays);
                    if (next.has(day) && next.size > 1) next.delete(day);
                    else next.add(day);
                    setSelectedDays(next);
                  }}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    background: isSelected ? '#079589' : '#F1F5F9',
                    color: isSelected ? '#ffffff' : '#475569',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Sora', system-ui, sans-serif",
                  }}
                  aria-pressed={isSelected}
                  aria-label={day}
                >
                  {day.charAt(0)}
                </button>
              );
            })}
          </div>
        </FormField>
      )}

      {/* Monthly: day number or ordinal */}
      {repeatMode === 'monthly' && (
        <FormField label={'On'}>
          <SpaceBetween size={'xs'}>
            <RadioGroup
              value={monthDayMode}
              onChange={({ detail }) => setMonthDayMode(detail.value as typeof monthDayMode)}
              items={[
                { value: 'day_number', label: 'Day' },
                { value: 'ordinal', label: 'Occurrence' },
              ]}
            />
            {monthDayMode === 'day_number' && (
              <div style={{ width: 80 }}>
                <Input type={'number'} value={monthDay} onChange={({ detail }) => setMonthDay(detail.value)} />
              </div>
            )}
            {monthDayMode === 'ordinal' && (
              <div style={{ width: 180 }}>
                <Select
                  selectedOption={{ value: ordinal, label: ORDINALS.find((o) => o.value === ordinal)?.label ?? ordinal }}
                  onChange={({ detail }) => setOrdinal(detail.selectedOption.value ?? ordinal)}
                  options={ORDINALS}
                />
              </div>
            )}
          </SpaceBetween>
        </FormField>
      )}

      {/* Yearly: month + ordinal */}
      {repeatMode === 'yearly' && (
        <FormField label={'On'}>
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {MONTHS.map((m) => {
                const isSel = selectedMonth === m;
                return (
                  <button
                    key={m}
                    type={'button'}
                    onClick={() => setSelectedMonth(m)}
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: isSel ? '#079589' : '#F1F5F9',
                      color: isSel ? '#ffffff' : '#475569',
                      fontSize: 11, fontWeight: 600,
                      fontFamily: "'Sora', system-ui, sans-serif",
                    }}
                    aria-pressed={isSel}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <div style={{ width: 180 }}>
              <Select
                selectedOption={{ value: ordinal, label: ORDINALS.find((o) => o.value === ordinal)?.label ?? ordinal }}
                onChange={({ detail }) => setOrdinal(detail.selectedOption.value ?? ordinal)}
                options={[...ORDINALS, { value: 'day_n', label: 'Day (specific)' }]}
              />
            </div>
          </SpaceBetween>
        </FormField>
      )}

      {/* End condition */}
      <FormField label={'End'}>
        <SpaceBetween size={'xs'}>
          <RadioGroup
            value={endMode}
            onChange={({ detail }) => setEndMode(detail.value as EndMode)}
            items={[
              { value: 'no_end', label: 'No end date' },
              { value: 'on_date', label: 'On this date' },
              { value: 'after_count', label: 'After' },
            ]}
          />
          {endMode === 'on_date' && (
            <DatePicker
              value={endDate}
              onChange={({ detail }) => setEndDate(detail.value)}
              placeholder={'DD/MM/YYYY'}
              isDateEnabled={(date) => date > new Date()}
            />
          )}
          {endMode === 'after_count' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 80 }}>
                <Input
                  type={'number'}
                  value={occurrences}
                  onChange={({ detail }) => setOccurrences(detail.value)}
                />
              </div>
              <Box variant={'p'}>occurrences</Box>
            </div>
          )}
        </SpaceBetween>
      </FormField>
    </SpaceBetween>
  );
};

// ─── Add Schedule modal ───────────────────────────────────────────────────────

type ModalStep = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<ModalStep, string> = {
  1: 'Event type',
  2: 'Objects & ownership',
  3: 'When & recurrence',
  4: 'Review',
};

const PEOPLE_OPTIONS = [
  { label: 'Sarah Johnson',  value: 'sj' },
  { label: 'Michael Brown',  value: 'mb' },
  { label: 'James Romero',   value: 'jr' },
  { label: 'Liam Nguyen',    value: 'ln' },
  { label: 'Maya Okafor',    value: 'mo' },
];

const SAMPLE_OBJECTS = [
  { id: 'R-001', title: 'Data breach via legacy S3 bucket', type: 'Risk', owner: 'Sarah Johnson', ownerInitials: 'SJ', tags: ['security', 'data'], department: 'IT', tier: 'Tier 1' },
  { id: 'R-003', title: 'Third-party vendor dependency',    type: 'Risk', owner: 'Michael Brown', ownerInitials: 'MB', tags: ['vendor'],           department: 'Procurement', tier: 'Tier 2' },
  { id: 'C-018', title: 'Quarterly access review control',  type: 'Control', owner: 'Sarah Johnson', ownerInitials: 'SJ', tags: ['access'],       department: 'IT', tier: 'Tier 1' },
  { id: 'P-007', title: 'Data Protection Policy',           type: 'Policy', owner: 'Michael Brown', ownerInitials: 'MB', tags: ['gdpr', 'data'],   department: 'Legal', tier: 'Tier 1' },
  { id: 'I-012', title: 'KRI — System uptime',              type: 'Indicator', owner: 'James Romero', ownerInitials: 'JR', tags: ['kri'],          department: 'IT', tier: 'Tier 2' },
];

const StepIndicator = ({ current, total }: { current: ModalStep; total: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
    {Array.from({ length: total }, (_, i) => {
      const step = (i + 1) as ModalStep;
      const done = step < current;
      const active = step === current;
      return (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: '50%',
            background: active ? '#079589' : done ? '#079589' : '#E2E8F0',
            color: active || done ? '#ffffff' : '#94A3B8',
            fontSize: 11, fontWeight: 700,
            fontFamily: "'Sora', system-ui, sans-serif",
          }}>
            {done ? '✓' : step}
          </div>
          <Box
            variant={'small'}
            color={active ? 'text-label' : 'text-body-secondary'}
            fontWeight={active ? 'bold' : 'normal'}
          >
            {STEP_LABELS[step]}
          </Box>
          {step < total && (
            <div style={{ width: 24, height: 1, background: '#E2E8F0' }} />
          )}
        </div>
      );
    })}
  </div>
);

const AddScheduleModal = ({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) => {
  const [step, setStep] = useState<ModalStep>(1);
  const [selectedEventType, setSelectedEventType] = useState<{ value: string; label: string } | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [contributors, setContributors] = useState<{ value: string; label: string }[]>([]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [useRecurrence, setUseRecurrence] = useState(false);

  // Object filter state
  const [filterDept, setFilterDept] = useState<{ value: string; label: string }[]>([]);
  const [filterTags, setFilterTags] = useState<{ value: string; label: string }[]>([]);
  const [filterTier, setFilterTier] = useState<{ value: string; label: string }[]>([]);

  const filteredObjects = SAMPLE_OBJECTS.filter((obj) => {
    if (filterDept.length > 0 && !filterDept.some((d) => d.value === obj.department)) return false;
    if (filterTags.length > 0 && !filterTags.some((t) => obj.tags.includes(t.value))) return false;
    if (filterTier.length > 0 && !filterTier.some((t) => t.value === obj.tier)) return false;
    return true;
  });

  const selectedObjectsData = SAMPLE_OBJECTS.filter((o) => selectedObjects.has(o.id));
  const primaryOwner = selectedObjectsData.length === 1 ? selectedObjectsData[0] : null;

  const canAdvance =
    (step === 1 && selectedEventType !== null) ||
    (step === 2 && selectedObjects.size > 0) ||
    (step === 3 && startDate !== '' && dueDate !== '') ||
    step === 4;

  const footerActions = (
    <SpaceBetween direction={'horizontal'} size={'xs'}>
      <Button variant={'link'} onClick={onDismiss}>Cancel</Button>
      {step > 1 && (
        <Button variant={'normal'} onClick={() => setStep((s) => Math.max(1, s - 1) as ModalStep)}>
          Back
        </Button>
      )}
      {step < 4 ? (
        <Button
          variant={'primary'}
          disabled={!canAdvance}
          onClick={() => setStep((s) => Math.min(4, s + 1) as ModalStep)}
        >
          Continue
        </Button>
      ) : (
        <Button variant={'primary'} onClick={onDismiss}>
          Create schedule
        </Button>
      )}
    </SpaceBetween>
  );

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size={'large'}
      header={
        <SpaceBetween size={'xxs'}>
          <Box variant={'h2'}>Add schedule</Box>
          <StepIndicator current={step} total={4} />
        </SpaceBetween>
      }
      footer={footerActions}
    >
      <SpaceBetween size={'l'}>

        {/* Step 1: Event type */}
        {step === 1 && (
          <FormField
            label={'Event type'}
            description={'Select what type of activity this schedule will create.'}
          >
            <Select
              selectedOption={selectedEventType}
              onChange={({ detail }) => setSelectedEventType(detail.selectedOption)}
              options={EVENT_TYPE_SELECT_OPTIONS}
              filteringType={'auto'}
              placeholder={'Choose event type…'}
            />
          </FormField>
        )}

        {/* Step 2: Objects + ownership */}
        {step === 2 && (
          <SpaceBetween size={'m'}>
            {/* Filters */}
            <SpaceBetween size={'xs'} direction={'horizontal'}>
              <FormField label={'Department'} constraintText={undefined}>
                <Multiselect
                  selectedOptions={filterDept}
                  onChange={({ detail }) => setFilterDept([...detail.selectedOptions])}
                  options={[
                    { value: 'IT', label: 'IT' },
                    { value: 'Legal', label: 'Legal' },
                    { value: 'Procurement', label: 'Procurement' },
                    { value: 'Finance', label: 'Finance' },
                  ]}
                  placeholder={'All departments'}
                  tokenLimit={2}
                />
              </FormField>
              <FormField label={'Tags'}>
                <Multiselect
                  selectedOptions={filterTags}
                  onChange={({ detail }) => setFilterTags([...detail.selectedOptions])}
                  options={[
                    { value: 'security', label: 'security' },
                    { value: 'data', label: 'data' },
                    { value: 'gdpr', label: 'gdpr' },
                    { value: 'vendor', label: 'vendor' },
                    { value: 'kri', label: 'kri' },
                    { value: 'access', label: 'access' },
                  ]}
                  placeholder={'All tags'}
                  tokenLimit={2}
                />
              </FormField>
              <FormField label={'Tier'}>
                <Multiselect
                  selectedOptions={filterTier}
                  onChange={({ detail }) => setFilterTier([...detail.selectedOptions])}
                  options={[
                    { value: 'Tier 1', label: 'Tier 1' },
                    { value: 'Tier 2', label: 'Tier 2' },
                    { value: 'Tier 3', label: 'Tier 3' },
                  ]}
                  placeholder={'All tiers'}
                  tokenLimit={2}
                />
              </FormField>
            </SpaceBetween>

            {/* Object picker table */}
            <Table
              selectionType={'multi'}
              trackBy={'id'}
              selectedItems={filteredObjects.filter((o) => selectedObjects.has(o.id))}
              onSelectionChange={({ detail }) => {
                setSelectedObjects(new Set(detail.selectedItems.map((o) => o.id)));
                setContributors([]);
              }}
              columnDefinitions={[
                { id: 'id',    header: 'ID',    cell: (o: typeof SAMPLE_OBJECTS[0]) => o.id,    minWidth: 80 },
                { id: 'title', header: 'Name',  cell: (o) => o.title,  minWidth: 240, isRowHeader: true },
                { id: 'type',  header: 'Type',  cell: (o) => <Badge color={'grey'}>{o.type}</Badge>,  minWidth: 100 },
                { id: 'owner', header: 'Owner', cell: (o) => (
                  <OwnerCell name={o.owner} initials={o.ownerInitials} />
                ), minWidth: 150 },
              ] as any}
              items={filteredObjects}
              header={
                <Header counter={`(${filteredObjects.length})`}>
                  Select objects to schedule
                </Header>
              }
              empty={<EmptyEntityCollection entityType={'object'} />}
            />

            {/* Ownership section */}
            {selectedObjects.size > 0 && (
              <SpaceBetween size={'s'}>
                {/* Object owner — read only */}
                <FormField
                  label={'Owner'}
                  description={
                    selectedObjects.size === 1
                      ? 'This is the current owner of the selected object. Ownership is managed on the object itself.'
                      : 'Multiple objects are selected — ownership is managed individually on each object.'
                  }
                >
                  <div style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                    {primaryOwner ? (
                      <OwnerCell name={primaryOwner.owner} initials={primaryOwner.ownerInitials} />
                    ) : (
                      <Box color={'text-body-secondary'} variant={'small'}>
                        {selectedObjects.size} objects — {selectedObjects.size} owners
                      </Box>
                    )}
                  </div>
                </FormField>

                {/* Contributors — editable */}
                <FormField
                  label={'Contributors (optional)'}
                  description={'Additional people who will be notified and can complete this scheduled activity.'}
                >
                  <Multiselect
                    selectedOptions={contributors}
                    onChange={({ detail }) => setContributors([...detail.selectedOptions])}
                    options={PEOPLE_OPTIONS}
                    placeholder={'Add contributors…'}
                    filteringType={'auto'}
                    tokenLimit={4}
                  />
                </FormField>
              </SpaceBetween>
            )}
          </SpaceBetween>
        )}

        {/* Step 3: When & recurrence */}
        {step === 3 && (
          <SpaceBetween size={'m'}>
            <SpaceBetween size={'s'} direction={'horizontal'}>
              <FormField label={'Start date'}>
                <DatePicker
                  value={startDate}
                  onChange={({ detail }) => setStartDate(detail.value)}
                  placeholder={'DD/MM/YYYY'}
                />
              </FormField>
              <FormField label={'Due date'}>
                <DatePicker
                  value={dueDate}
                  onChange={({ detail }) => setDueDate(detail.value)}
                  placeholder={'DD/MM/YYYY'}
                  isDateEnabled={(date) => startDate ? date > new Date(startDate) : true}
                />
              </FormField>
            </SpaceBetween>

            <Checkbox
              checked={useRecurrence}
              onChange={({ detail }) => setUseRecurrence(detail.checked)}
            >
              Repeat on a schedule
            </Checkbox>

            {useRecurrence && (
              <ExpandableSection headerText={'Recurrence settings'} defaultExpanded>
                <RecurrencePanel />
              </ExpandableSection>
            )}
          </SpaceBetween>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <SpaceBetween size={'m'}>
            <Box variant={'h3'}>Review and confirm</Box>
            <SpaceBetween size={'xxs'}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Box variant={'small'} color={'text-body-secondary'} fontWeight={'bold'}>Event type</Box>
                <Box variant={'small'}>{selectedEventType?.label ?? '—'}</Box>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Box variant={'small'} color={'text-body-secondary'} fontWeight={'bold'}>Objects</Box>
                <Box variant={'small'}>{selectedObjects.size} selected</Box>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Box variant={'small'} color={'text-body-secondary'} fontWeight={'bold'}>Start date</Box>
                <Box variant={'small'}>{startDate || '—'}</Box>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Box variant={'small'} color={'text-body-secondary'} fontWeight={'bold'}>Due date</Box>
                <Box variant={'small'}>{dueDate || '—'}</Box>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Box variant={'small'} color={'text-body-secondary'} fontWeight={'bold'}>Recurrence</Box>
                <Box variant={'small'}>{useRecurrence ? 'Yes' : 'No — one-off'}</Box>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Box variant={'small'} color={'text-body-secondary'} fontWeight={'bold'}>Contributors</Box>
                <Box variant={'small'}>{contributors.length > 0 ? contributors.map((c) => c.label).join(', ') : '—'}</Box>
              </div>
            </SpaceBetween>
          </SpaceBetween>
        )}

      </SpaceBetween>
    </Modal>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const ScheduleRegisterPage = ({ defaultModalOpen = false }: { defaultModalOpen?: boolean }) => {
  const [modalOpen, setModalOpen] = useState(defaultModalOpen);
  const [query, setQuery] = useState({ tokens: [], operation: 'and' as const });

  const collection = useCollection(SAMPLE_SCHEDULES, {
    propertyFiltering: {
      filteringProperties: FILTER_PROPERTIES,
      empty: <EmptyEntityCollection entityType={'schedule'} />,
      noMatch: <NoMatchesCollection />,
    },
    sorting: { defaultState: { sortingColumn: { sortingField: 'dueDate' } as any } },
    selection: {},
    pagination: { pageSize: 10 },
  });

  const { items, collectionProps, paginationProps } = collection;

  // Stats
  const due       = SAMPLE_SCHEDULES.filter((s) => s.status === 'Scheduled' || s.status === 'In Progress').length;
  const overdue   = SAMPLE_SCHEDULES.filter((s) => s.status === 'Overdue').length;
  const missed    = SAMPLE_SCHEDULES.filter((s) => s.status === 'Missed').length;
  const completed = SAMPLE_SCHEDULES.filter((s) => s.status === 'Completed').length;
  const upcoming  = SAMPLE_SCHEDULES.filter((s) => s.nextOccurrence !== null).length;

  return (
    <>
      <AddScheduleModal visible={modalOpen} onDismiss={() => setModalOpen(false)} />

      <PageLayout
        title={'Schedule'}
        counter={`(${SAMPLE_SCHEDULES.length})`}
        actions={
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <Button variant={'normal'} iconSvg={undefined}>Export</Button>
            <Button variant={'primary'} onClick={() => setModalOpen(true)}>
              Add schedule
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size={'l'}>

          {/* Stats ribbon */}
          <div style={{ display: 'flex', gap: 12 }}>
            <DashboardItem title={'Due'} value={due} />
            <DashboardItem title={'Overdue'} value={overdue} />
            <DashboardItem title={'Missed'} value={missed} />
            <DashboardItem title={'Completed'} value={completed} />
            <DashboardItem title={'Next occurrence'} value={upcoming} />
          </div>

          {/* Register table */}
          <Table
            {...collectionProps}
            columnDefinitions={COLUMNS as any}
            items={items}
            selectionType={'multi'}
            trackBy={'id'}
            stickyHeader
            filter={
              <PropertyFilterPanel
                query={query}
                onChange={({ detail }) => setQuery(detail.query as any)}
                filteringProperties={FILTER_PROPERTIES}
                i18nStrings={DEFAULT_I18N_STRINGS}
              />
            }
            pagination={<Pagination {...paginationProps} />}
            header={
              <Header
                counter={`(${items.length})`}
                actions={
                  <SpaceBetween size={'xs'} direction={'horizontal'}>
                    <ActionsButton
                      buttonText={'Bulk actions'}
                      items={[
                        { id: 'reassign',   text: 'Reassign owner',    onItemClick: () => {} },
                        { id: 'reschedule', text: 'Reschedule…',       onItemClick: () => {} },
                        { id: 'pause',      text: 'Pause selected',    onItemClick: () => {} },
                        { id: 'export',     text: 'Export to CSV',     onItemClick: () => {} },
                      ]}
                    />
                  </SpaceBetween>
                }
              >
                Schedule register
              </Header>
            }
            empty={<EmptyEntityCollection entityType={'schedule'} />}
          />
        </SpaceBetween>
      </PageLayout>
    </>
  );
};

// ─── Storybook meta ───────────────────────────────────────────────────────────

const meta = {
  title: 'Prototypes/Scheduler',
  component: PageLayout as any,
  tags: ['prototype'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '⚠️ SPECULATIVE — Scheduler prototype. No production scheduler page exists yet. ' +
          'All components are lifted from the real app. ' +
          'Covers: schedule register with overdue/missed distinction, Add Schedule modal ' +
          '(4-step: event type → objects + ownership → when/recurrence → review), ' +
          'PropertyFilter with department/tags/tier, and clickable object links.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Schedule register — default state */
export const Default: Story = {
  render: () => (
    <RealProviders initialPath={'/schedule'}>
      <ScheduleRegisterPage />
    </RealProviders>
  ),
};

/** Add Schedule modal open — Step 1 (Event type) */
export const AddScheduleModalOpen: Story = {
  render: () => (
    <RealProviders initialPath={'/schedule'}>
      <ScheduleRegisterPage defaultModalOpen />
    </RealProviders>
  ),
};

/** Overdue vs Missed — table highlighting both statuses with distinct row actions */
export const OverdueBehaviour: Story = {
  render: () => (
    <RealProviders initialPath={'/schedule'}>
      <ScheduleRegisterPage />
    </RealProviders>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows both Overdue (deadline passed, still recoverable) and Missed (never completed) ' +
          'rows. Click the ⋯ menu on each row to see the distinct action sets: ' +
          'Overdue → Send reminder / Reassign / Extend due date. ' +
          'Missed → Record recovery action / Reschedule / Escalate / Mark as permanently missed.',
      },
    },
  },
};
