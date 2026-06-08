// Prototypes / Operational Resilience — IBS register, IBS detail with
// dependency map, and scenarios/self-assessments. Composed from real
// production atomic-ui + themed Cloudscape + custom RiskSmart organisms.
//
// Composed from:
//   - Real production PageLayout + nav (app-shell/Shell)
//   - Cloudscape: Container, Header, SpaceBetween, Grid, KeyValuePairs,
//     SegmentedControl, ProgressBar, Pagination, ColumnLayout, Box
//   - Custom RiskSmart organisms: Button, Table, SimpleRatingBadge,
//     ActionsButton, PropertyFilterPanel, BadgeList
//   - Inline SVG dependency map (no production graph organism exists)
//
// Three views:
//   IBSRegister             — Table Page pattern (stat ribbon + table)
//   IBSDetail               — Detail Page pattern (meta strip + dependency map + lists)
//   ScenariosSelfAssessment — Table + ControlledTabs + cards

import { useCollection } from '@cloudscape-design/collection-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import Box from '@risk-smart/themed-cloudscape-components/box';
import ColumnLayout from '@risk-smart/themed-cloudscape-components/column-layout';
import Container from '@risk-smart/themed-cloudscape-components/container';
import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import KeyValuePairs from '@risk-smart/themed-cloudscape-components/key-value-pairs';
import Multiselect from '@risk-smart/themed-cloudscape-components/multiselect';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import ProgressBar from '@risk-smart/themed-cloudscape-components/progress-bar';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import { Download01, Plus } from '@untitled-ui/icons-react';
// atomic-ui ToggleGroup uses bg-secondary (teal) for selected — that's the
// canonical RiskSmart toggle, distinct from Cloudscape SegmentedControl
// which selects blue. Mix-and-match per spec: atomic for atoms, Cloudscape
// for forms/modals/data.
import { ToggleGroup, ToggleGroupItem } from '@risksmart-app/atomic-ui';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';
// eslint-disable-next-line import/no-unresolved
import PropertyFilterPanel from 'src/components/property-filter-panel';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// eslint-disable-next-line import/no-unresolved
import BadgeList from 'src/components/badge-list';
// eslint-disable-next-line import/no-unresolved
import ActionsButton from 'src/components/actions-button';
// eslint-disable-next-line import/no-unresolved
import ControlledTabs from 'src/components/controlled-tabs';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';

const meta = {
  title: 'Prototypes/Operational Resilience',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Operational Resilience prototype — Important Business Service (IBS) register, IBS detail with dependency map, scenarios / self-assessments. All chrome is the real production composition: PageLayout (real Nav + GlobalHeader + AppLayout) + custom RiskSmart Button/Table + themed Cloudscape primitives. Only the layered dependency-map graph is inline SVG because no production graph organism exists yet.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═══════════════════════════════════════════════════════════════════════
//  TYPES & DATA
// ═══════════════════════════════════════════════════════════════════════

type IBSRow = {
  id: string;
  Name: string;
  Owner: string;
  SMF: string;
  Criticality: { color: string; label: string };
  Tolerance: string;
  ToleranceUsed: number; // 0-100
  LastTest: string;
  LastResult: 'pass' | 'breach' | 'overdue';
  Vulns: number;
  Attestation: 'approved' | 'in-review' | 'in-progress' | 'not-started';
  Regimes: string[];
};

const IBS_DATA: IBSRow[] = [
  { id: 'pmt-card', Name: 'Card payments', Owner: 'A. Mensah', SMF: 'SMF24', Criticality: { color: 'dark-red', label: 'Critical' }, Tolerance: '2h', ToleranceUsed: 35, LastTest: '2026-03-18', LastResult: 'pass', Vulns: 1, Attestation: 'approved', Regimes: ['SS1/21', 'DORA'] },
  { id: 'pmt-wire', Name: 'Wire transfers (Faster Payments)', Owner: 'A. Mensah', SMF: 'SMF24', Criticality: { color: 'dark-red', label: 'Critical' }, Tolerance: '4h', ToleranceUsed: 88, LastTest: '2026-02-04', LastResult: 'breach', Vulns: 5, Attestation: 'in-review', Regimes: ['SS1/21'] },
  { id: 'ob', Name: 'Online banking', Owner: 'P. Hargreaves', SMF: 'SMF24', Criticality: { color: 'dark-red', label: 'Critical' }, Tolerance: '1h', ToleranceUsed: 62, LastTest: '2026-04-22', LastResult: 'pass', Vulns: 3, Attestation: 'approved', Regimes: ['SS1/21', 'DORA'] },
  { id: 'mob', Name: 'Mobile banking app', Owner: 'P. Hargreaves', SMF: 'SMF24', Criticality: { color: 'light-red', label: 'High' }, Tolerance: '2h', ToleranceUsed: 40, LastTest: '2026-04-22', LastResult: 'pass', Vulns: 2, Attestation: 'approved', Regimes: ['SS1/21'] },
  { id: 'aopen', Name: 'Account opening', Owner: 'S. Okafor', SMF: 'SMF18', Criticality: { color: 'light-red', label: 'High' }, Tolerance: '24h', ToleranceUsed: 18, LastTest: '2025-11-12', LastResult: 'pass', Vulns: 0, Attestation: 'approved', Regimes: ['SS1/21'] },
  { id: 'trade', Name: 'Trading platform', Owner: 'L. Petrov', SMF: 'SMF22', Criticality: { color: 'dark-red', label: 'Critical' }, Tolerance: '30m', ToleranceUsed: 74, LastTest: '2026-01-30', LastResult: 'breach', Vulns: 7, Attestation: 'in-progress', Regimes: ['SS1/21', 'DORA', 'CASS'] },
  { id: 'advice', Name: 'Investment advice', Owner: 'L. Petrov', SMF: 'SMF22', Criticality: { color: 'orange', label: 'Medium' }, Tolerance: '48h', ToleranceUsed: 12, LastTest: '2025-09-04', LastResult: 'overdue', Vulns: 1, Attestation: 'not-started', Regimes: ['SS1/21'] },
  { id: 'support', Name: 'Customer support contact centre', Owner: 'K. Müller', SMF: 'SMF18', Criticality: { color: 'light-red', label: 'High' }, Tolerance: '8h', ToleranceUsed: 55, LastTest: '2026-02-19', LastResult: 'pass', Vulns: 5, Attestation: 'approved', Regimes: ['SS1/21'] },
];

// Dependency map for Online banking
type GraphNode = { id: string; label: string; sub: string; w: number; h: number; type?: 'vendor' };
type GraphLayer = { label: string; nodes: GraphNode[] };

const GRAPH: { layers: GraphLayer[]; edges: [string, string][]; detail: Record<string, { title: string; sub: string; rows: [string, string][]; desc: string }> } = {
  layers: [
    { label: 'Important Business Service', nodes: [{ id: 'ibs', label: 'Online banking', sub: 'IBS · Tier 1', w: 200, h: 62 }] },
    {
      label: 'Critical Business Processes',
      nodes: [
        { id: 'p-auth', label: 'Authentication', sub: 'Process', w: 150, h: 54 },
        { id: 'p-bal', label: 'Balance & statements', sub: 'Process', w: 170, h: 54 },
        { id: 'p-pay', label: 'Payment initiation', sub: 'Process', w: 160, h: 54 },
        { id: 'p-msg', label: 'Secure messaging', sub: 'Process', w: 160, h: 54 },
      ],
    },
    {
      label: 'Applications',
      nodes: [
        { id: 'a-web', label: 'OB Web app', sub: 'Application', w: 130, h: 50 },
        { id: 'a-api', label: 'OB Gateway API', sub: 'Application', w: 150, h: 50 },
        { id: 'a-core', label: 'Core banking', sub: 'Application', w: 130, h: 50 },
        { id: 'a-iam', label: 'IAM / SSO', sub: 'Application', w: 120, h: 50 },
        { id: 'a-pay', label: 'Payment service', sub: 'Application', w: 140, h: 50 },
        { id: 'a-msg', label: 'Comms platform', sub: 'Application', w: 140, h: 50 },
      ],
    },
    {
      label: 'Infrastructure & Third Parties',
      nodes: [
        { id: 'v-aws', label: 'AWS eu-west-2', sub: 'Cloud · Tier 1', w: 170, h: 50, type: 'vendor' },
        { id: 'v-ddos', label: 'Cloudflare', sub: 'DDoS / WAF', w: 120, h: 50, type: 'vendor' },
        { id: 'v-okta', label: 'Okta', sub: 'IDP', w: 90, h: 50, type: 'vendor' },
        { id: 'v-mq', label: 'Kafka cluster', sub: 'Internal infra', w: 130, h: 50 },
        { id: 'v-db', label: 'Aurora PG', sub: 'Database', w: 120, h: 50 },
        { id: 'v-sms', label: 'Twilio', sub: 'SMS / OTP', w: 100, h: 50, type: 'vendor' },
      ],
    },
  ],
  edges: [
    ['ibs', 'p-auth'], ['ibs', 'p-bal'], ['ibs', 'p-pay'], ['ibs', 'p-msg'],
    ['p-auth', 'a-web'], ['p-auth', 'a-api'], ['p-auth', 'a-iam'],
    ['p-bal', 'a-web'], ['p-bal', 'a-api'], ['p-bal', 'a-core'],
    ['p-pay', 'a-api'], ['p-pay', 'a-pay'], ['p-pay', 'a-core'],
    ['p-msg', 'a-msg'], ['p-msg', 'a-api'],
    ['a-web', 'v-aws'], ['a-web', 'v-ddos'],
    ['a-api', 'v-aws'], ['a-api', 'v-mq'],
    ['a-core', 'v-aws'], ['a-core', 'v-db'],
    ['a-iam', 'v-okta'], ['a-iam', 'v-aws'],
    ['a-pay', 'v-aws'], ['a-pay', 'v-mq'],
    ['a-msg', 'v-aws'], ['a-msg', 'v-sms'],
  ],
  detail: {
    ibs: { title: 'Online banking', sub: 'Important Business Service', rows: [['Tolerance', '1 hour'], ['Owner', 'P. Hargreaves'], ['Accountable SMF', 'SMF24'], ['Last test', '22 Apr 2026 — Pass'], ['Open vulns', '3'], ['Regimes', 'SS1/21, DORA']], desc: 'Customer-facing online banking via web and integrated mobile API. Disruption beyond one hour is treated as intolerable harm.' },
    'p-auth': { title: 'Authentication', sub: 'Critical Business Process', rows: [['Run by', 'Identity team'], ['Hot peak', '08:00–10:00 GMT'], ['Failover', 'Active-active, 2 regions']], desc: 'Verifies customers via password + step-up MFA. Auth failure cascades to the whole IBS.' },
    'p-pay': { title: 'Payment initiation', sub: 'Critical Business Process', rows: [['Run by', 'Payments team'], ['Cut-off', 'Faster Payments 23:59 GMT'], ['Failover', 'Manual branch fallback']], desc: 'Internal and external payments. Carries a financial-loss tolerance as well as a time tolerance.' },
    'p-bal': { title: 'Balance & statements', sub: 'Critical Business Process', rows: [['Run by', 'Core banking team'], ['Read-only path', 'Yes (cached)']], desc: 'Current-account information. Cached read-path keeps balances visible during core ledger degradation.' },
    'p-msg': { title: 'Secure messaging', sub: 'Critical Business Process', rows: [['Run by', 'Comms platform'], ['SLA', '4-hour reply']], desc: 'In-app secure message thread between customer and support.' },
    'a-api': { title: 'OB Gateway API', sub: 'Application · Tier 1', rows: [['Owner', 'Platform eng'], ['SLO', '99.95%'], ['Region', 'eu-west-2 a/b']], desc: 'Single ingress for all OB clients — single point of architectural risk for the whole IBS.' },
    'a-web': { title: 'OB Web app', sub: 'Application', rows: [['Owner', 'Channel eng'], ['Last deploy', '06 May 2026']], desc: 'Customer-facing SPA. Static bundle served from CDN; degrades gracefully if the API slows.' },
    'a-core': { title: 'Core banking (Mambu)', sub: 'Application · Tier 1 vendor', rows: [['Vendor', 'Mambu'], ['Contract', 'Renewal 2027-Q2'], ['Exit plan', 'Tested 2025-11']], desc: 'Ledger of record. Largest single-vendor concentration risk we carry across IBSs.' },
    'a-iam': { title: 'IAM / SSO', sub: 'Application', rows: [['Vendor', 'Okta'], ['MFA factors', 'FIDO2, TOTP, SMS']], desc: 'Customer + employee identity. SMS factor scheduled for retirement after Feb 2026 breach.' },
    'a-pay': { title: 'Payment service', sub: 'Application', rows: [['Owner', 'Payments eng'], ['Settles via', 'FPS Direct + Visa Direct']], desc: 'Translates customer-initiated payments into scheme messages.' },
    'a-msg': { title: 'Comms platform', sub: 'Application', rows: [['Vendor', 'Twilio Flex']], desc: 'Hosts in-app chat thread and notification fan-out.' },
    'v-aws': { title: 'AWS eu-west-2', sub: 'Cloud (Tier 1 vendor)', rows: [['Concentration', 'Hosts 6 of 8 IBSs'], ['Exit plan', 'Multi-region (eu-west-1) active-passive'], ['Last DR test', '11 Feb 2026']], desc: 'Primary cloud region. Concentration risk surfaces in 6 of 8 services — mitigation in flight at board level.' },
    'v-ddos': { title: 'Cloudflare', sub: 'DDoS / WAF (Tier 2 vendor)', rows: [['SLA', '99.99%'], ['Bypass', 'Direct origin via internal only']], desc: 'Edge protection for all customer-facing applications.' },
    'v-okta': { title: 'Okta', sub: 'IDP (Tier 1 vendor)', rows: [['Cells', 'EU residency'], ['Last audit', 'SOC2 Type II — Mar 2026']], desc: 'Sole identity provider — vulnerability VLN-014 raised after Feb breach scenario.' },
    'v-mq': { title: 'Kafka cluster', sub: 'Internal infra', rows: [['Owner', 'Platform eng'], ['Replication', 'RF=3']], desc: 'Event bus between OB Gateway, payments, and comms.' },
    'v-db': { title: 'Aurora PG', sub: 'Database', rows: [['HA', 'Multi-AZ'], ['Failover', '30s RTO measured']], desc: 'Primary read/write store for the core banking caching layer.' },
    'v-sms': { title: 'Twilio', sub: 'SMS / OTP (Tier 2 vendor)', rows: [['Replacement plan', 'FIDO2 rollout 2026-Q3']], desc: 'Currently used for SMS-OTP fallback. Scheduled for retirement after Feb scenario findings.' },
  },
};

type ScenarioRow = {
  id: string;
  Name: string;
  Type: 'Cyber' | 'Third-party failure' | 'Facility' | 'People';
  IBS: string;
  Ran: string;
  Duration: string;
  Tolerance: string;
  Result: { color: string; label: string };
  BreachBy: string;
  Leader: string;
  Findings: number;
};

const SCENARIOS: ScenarioRow[] = [
  { id: 'SC-2026-02', Name: 'Identity provider regional outage', Type: 'Cyber', IBS: 'Wire transfers, Online banking', Ran: '04 Feb 2026', Duration: '4h 22m', Tolerance: '4h', Result: { color: 'dark-red', label: 'Tolerance breach' }, BreachBy: '22 min over', Leader: 'A. Mensah', Findings: 5 },
  { id: 'SC-2026-01', Name: 'Mambu (core banking) outage — eu-west-2', Type: 'Third-party failure', IBS: 'Online banking, Mobile app, Account opening', Ran: '30 Jan 2026', Duration: '27m', Tolerance: '1h', Result: { color: 'dark-red', label: 'Tolerance breach' }, BreachBy: 'recovery procedures failed', Leader: 'L. Petrov', Findings: 7 },
  { id: 'SC-2026-03', Name: 'Ransomware on internal endpoint estate', Type: 'Cyber', IBS: 'All', Ran: '18 Mar 2026', Duration: '1h 50m', Tolerance: '2h', Result: { color: 'light-green', label: 'Within tolerance' }, BreachBy: '10 min margin', Leader: 'K. Müller', Findings: 3 },
  { id: 'SC-2026-04', Name: 'Data centre power loss — Slough', Type: 'Facility', IBS: 'Trading platform', Ran: '22 Apr 2026', Duration: '48m', Tolerance: '30m', Result: { color: 'dark-red', label: 'Tolerance breach' }, BreachBy: '18 min over', Leader: 'P. Hargreaves', Findings: 4 },
  { id: 'SC-2025-12', Name: 'Key person — Head of Payments unavailable', Type: 'People', IBS: 'Wire transfers, Card payments', Ran: '15 Dec 2025', Duration: '—', Tolerance: '4h', Result: { color: 'light-green', label: 'Within tolerance' }, BreachBy: 'desktop walk-through', Leader: 'A. Mensah', Findings: 2 },
];

const ATTESTATIONS = [
  { ibs: 'Card payments', owner: 'A. Mensah', cycle: 'FY26 annual', progress: 100, status: { color: 'light-green', label: 'Approved' } },
  { ibs: 'Online banking', owner: 'P. Hargreaves', cycle: 'FY26 annual', progress: 100, status: { color: 'light-green', label: 'Approved' } },
  { ibs: 'Wire transfers', owner: 'A. Mensah', cycle: 'FY26 annual', progress: 60, status: { color: 'orange', label: 'In review' } },
  { ibs: 'Trading platform', owner: 'L. Petrov', cycle: 'FY26 annual', progress: 40, status: { color: 'orange', label: 'In progress' } },
  { ibs: 'Investment advice', owner: 'L. Petrov', cycle: 'FY26 annual', progress: 0, status: { color: 'light-red', label: 'Not started' } },
  { ibs: 'Customer support', owner: 'K. Müller', cycle: 'FY26 annual', progress: 100, status: { color: 'light-green', label: 'Approved' } },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPERS  (CustomisableRibbon pattern from TablePage.stories.tsx)
// ═══════════════════════════════════════════════════════════════════════

// Stat values follow the production convention used by every register page
// in the live app (and TablePage.stories.tsx): the count for a "total" /
// "all X" item is navy (#14143A) so it reads as a heading; every other
// count is the brand teal (#41D9CC). One accent colour per ribbon, never
// status colours — those belong in badges.
// ═══════════════════════════════════════════════════════════════════════
//  CREATE / EDIT PAGES — Add IBS, New scenario, Submit attestation
//  Mirrors the production pattern at /risks/create + /risks/update/:id:
//  creation flows are full pages with PageLayout + Form, never modals.
//  Pure visual prototype — Save buttons navigate back to the register
//  without persisting.
// ═══════════════════════════════════════════════════════════════════════

const OPTIONS_OWNERS = [
  { value: 'a.mensah', label: 'A. Mensah · SMF24' },
  { value: 'p.hargreaves', label: 'P. Hargreaves · SMF24' },
  { value: 's.okafor', label: 'S. Okafor · SMF18' },
  { value: 'l.petrov', label: 'L. Petrov · SMF22' },
  { value: 'k.muller', label: 'K. Müller · SMF18' },
];
const OPTIONS_CRITICALITY = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'low', label: 'Low' },
];
const OPTIONS_REGIMES = [
  { value: 'ss1-21', label: 'SS1/21' },
  { value: 'dora', label: 'DORA' },
  { value: 'cass', label: 'CASS' },
  { value: 'cps230', label: 'APRA CPS 230' },
];
const OPTIONS_SCENARIO_TYPES = [
  { value: 'cyber', label: 'Cyber' },
  { value: 'third-party', label: 'Third-party failure' },
  { value: 'facility', label: 'Facility' },
  { value: 'people', label: 'Key person' },
  { value: 'data', label: 'Data corruption' },
];

// SidebarPanel — reusable off-white panel that matches the Detail Page
// template's right-rail. Used on every create / attest page to expose
// context that helps the form-filler without crowding the form column.
const SidebarPanel = ({ title, items }: { title: string; items: Array<{ label: string; sub?: string; rating?: { color: string; label: string } }> }) => (
  <div style={{ maxWidth: 350, width: '100%' }}>
    <div
      className={'p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start'}
      style={{ backgroundColor: '#f9f9fd' }}
    >
      <span className={'m-0 font-semibold text-grey500'} style={{ color: '#5C5C79' }}>{title}</span>
      {items.map((row) => (
        <div
          key={row.label}
          className={'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex gap-2'}
          style={{ backgroundColor: '#ffffff', borderColor: '#E8E8EC' }}
        >
          <div className={'flex-auto space-y-4'}>
            <h4 className={'m-0 font-semibold text-gray-300'} style={{ margin: 0, color: '#828297', fontWeight: 600 }}>
              {row.label}
            </h4>
            {row.sub && (
              <div className={'text-xs'} style={{ fontSize: 12 }}>
                <span className={'font-semibold text-gray-400'} style={{ color: '#5C5C79', fontWeight: 600 }}>{row.sub}</span>
              </div>
            )}
          </div>
          {row.rating && (
            <div className={'justify-end'} style={{ alignSelf: 'center' }}>
              <SimpleRatingBadge rating={row.rating} />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// AddIBSPage — full-page create form following the canonical Detail Page
// template: PageLayout (actions=ActionsButton only), then a flex layout
// with TabHeader + bare FormFields on the left and a context sidebar on
// the right. Save / Cancel live at the bottom of the form column.
const AddIBSPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [owner, setOwner] = useState<{ value: string; label: string } | null>(null);
  const [criticality, setCriticality] = useState<{ value: string; label: string } | null>(null);
  const [tolerance, setTolerance] = useState('');
  const [toleranceMetric, setToleranceMetric] = useState<{ value: string; label: string } | null>({ value: 'minutes', label: 'Minutes / hours' });
  const [regimes, setRegimes] = useState<Array<{ value: string; label: string }>>([]);
  const [description, setDescription] = useState('');
  const back = () => navigate('/opres/ibs');
  return (
    <PageLayout
      title={'Add Important Business Service'}
      description={'Create a new IBS. The service will be added to the FY26 attestation cycle once saved.'}
    >
      {/* Page content goes inside a <Container> — that's the live-app
          convention (white card chrome, rounded corners, padding). See
          AppShell.stories.tsx. Without it, the form floats on the grey
          page background and looks unfinished. */}
      <Container>
      <div className={'flex gap-5 justify-between'} style={{ width: '100%' }}>
        <div className={'flex-1'} style={{ minWidth: 0 }}>
          <SpaceBetween size={'l'}>
            <TabHeader description={'Service-level metadata used by every downstream view.'}>{'Details'}</TabHeader>
            <SpaceBetween size={'l'}>
              <FormField label={'Service name'} description={'How the service is described to customers.'}>
                <Input value={name} onChange={(e: any) => setName(e.detail.value)} placeholder={'e.g. Online banking'} />
              </FormField>
              <FormField label={'Service description'}>
                <Textarea value={description} onChange={(e: any) => setDescription(e.detail.value)} placeholder={'How the service is delivered, who it serves, what failure looks like…'} rows={4} />
              </FormField>
              <FormField label={'Accountable executive'} description={'The SMF holder ultimately accountable under SS1/21.'}>
                <Select selectedOption={owner as any} onChange={(e: any) => setOwner(e.detail.selectedOption)} options={OPTIONS_OWNERS} placeholder={'Select an owner'} />
              </FormField>
              <FormField label={'Criticality'} description={'Inherent severity of an outage.'}>
                <Select selectedOption={criticality as any} onChange={(e: any) => setCriticality(e.detail.selectedOption)} options={OPTIONS_CRITICALITY} placeholder={'Select'} />
              </FormField>
              <FormField label={'Maximum tolerable disruption'} description={'Time before customer harm becomes intolerable.'}>
                <Input value={tolerance} onChange={(e: any) => setTolerance(e.detail.value)} placeholder={'e.g. 2h'} />
              </FormField>
              <FormField label={'Tolerance unit'}>
                <Select
                  selectedOption={toleranceMetric as any}
                  onChange={(e: any) => setToleranceMetric(e.detail.selectedOption)}
                  options={[
                    { value: 'minutes', label: 'Minutes / hours' },
                    { value: 'days', label: 'Days' },
                    { value: 'volume', label: 'Volume of transactions' },
                    { value: 'loss', label: 'Financial loss (£)' },
                  ]}
                />
              </FormField>
              <FormField label={'Applicable regimes'} description={'Every regulatory regime that scopes this service.'}>
                <Multiselect selectedOptions={regimes as any} onChange={(e: any) => setRegimes(e.detail.selectedOptions)} options={OPTIONS_REGIMES} placeholder={'Select regimes'} />
              </FormField>
            </SpaceBetween>
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button variant={'primary'} onClick={back}>{'Save'}</Button>
              <Button variant={'normal'} onClick={back}>{'Cancel'}</Button>
            </SpaceBetween>
          </SpaceBetween>
        </div>
        <SidebarPanel
          title={'What you’re creating'}
          items={[
            { label: 'Cycle', sub: 'FY26 attestation', rating: { color: 'light-grey', label: 'Active' } },
            { label: 'Regulators', sub: 'Choose every regime that applies' },
            { label: 'Next step', sub: 'After save, set up the dependency map' },
            { label: 'Help', sub: 'See the SS1/21 scoping checklist' },
          ]}
        />
      </div>
      </Container>
    </PageLayout>
  );
};

const NewScenarioPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<{ value: string; label: string } | null>(null);
  const [affected, setAffected] = useState<Array<{ value: string; label: string }>>([]);
  const [tolerance, setTolerance] = useState('');
  const [runDate, setRunDate] = useState('');
  const [leader, setLeader] = useState<{ value: string; label: string } | null>(null);
  const [hypothesis, setHypothesis] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const back = () => navigate('/opres/scenarios');
  return (
    <PageLayout
      title={'Schedule a severe-but-plausible scenario'}
      description={'Plan a test against an Important Business Service. Findings link back to the service automatically.'}
    >
      <Container>
      <div className={'flex gap-5 justify-between'} style={{ width: '100%' }}>
        <div className={'flex-1'} style={{ minWidth: 0 }}>
          <SpaceBetween size={'l'}>
            <TabHeader description={'Fields that define the scenario and how it will be assessed.'}>{'Details'}</TabHeader>
            <SpaceBetween size={'l'}>
              <FormField label={'Scenario name'}>
                <Input value={name} onChange={(e: any) => setName(e.detail.value)} placeholder={'e.g. Identity provider regional outage'} />
              </FormField>
              <FormField label={'Type'}>
                <Select selectedOption={type as any} onChange={(e: any) => setType(e.detail.selectedOption)} options={OPTIONS_SCENARIO_TYPES} placeholder={'Select type'} />
              </FormField>
              <FormField label={'Lead'} description={'The named owner running the exercise.'}>
                <Select selectedOption={leader as any} onChange={(e: any) => setLeader(e.detail.selectedOption)} options={OPTIONS_OWNERS} placeholder={'Select a lead'} />
              </FormField>
              <FormField label={'Affected services'} description={'Every IBS the scenario will exercise.'}>
                <Multiselect
                  selectedOptions={affected as any}
                  onChange={(e: any) => setAffected(e.detail.selectedOptions)}
                  options={IBS_DATA.map((i) => ({ value: i.id, label: i.Name }))}
                  placeholder={'Select affected IBS'}
                />
              </FormField>
              <FormField label={'Test against tolerance'} description={'Worst-case tolerance the scenario is testing.'}>
                <Input value={tolerance} onChange={(e: any) => setTolerance(e.detail.value)} placeholder={'e.g. 4h'} />
              </FormField>
              <FormField label={'Scheduled run date'}>
                <DatePicker value={runDate} onChange={(e: any) => setRunDate(e.detail.value)} placeholder={'YYYY/MM/DD'} />
              </FormField>
              <FormField label={'Hypothesis'} description={'What you expect to learn — drives the success criteria.'}>
                <Textarea value={hypothesis} onChange={(e: any) => setHypothesis(e.detail.value)} placeholder={'e.g. Failover from Okta primary to secondary IDP completes within tolerance with no data loss.'} rows={3} />
              </FormField>
              <FormField label={'Success criteria'} description={'Measurable conditions that mean the test passed.'}>
                <Textarea value={successCriteria} onChange={(e: any) => setSuccessCriteria(e.detail.value)} placeholder={'e.g. All affected services restored within 80% of tolerance, with zero data loss.'} rows={3} />
              </FormField>
            </SpaceBetween>
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button variant={'primary'} onClick={back}>{'Schedule scenario'}</Button>
              <Button onClick={back}>{'Save draft'}</Button>
              <Button variant={'normal'} onClick={back}>{'Cancel'}</Button>
            </SpaceBetween>
          </SpaceBetween>
        </div>
        <SidebarPanel
          title={'Scenario summary'}
          items={[
            { label: 'Cycle', sub: 'FY26 cycle · 4 of 4 complete', rating: { color: 'light-grey', label: 'On track' } },
            { label: 'Tolerance', sub: 'Set tolerance to the tightest one across affected IBSs' },
            { label: 'Findings', sub: 'Auto-linked to chosen services after run' },
            { label: 'Help', sub: 'See the SS1/21 scenario-design playbook' },
          ]}
        />
      </div>
      </Container>
    </PageLayout>
  );
};

const SubmitAttestationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ibs = IBS_DATA.find((i) => i.id === id) ?? IBS_DATA.find((i) => i.id === 'ob')!;
  const [statement, setStatement] = useState('');
  const back = () => navigate(`/opres/ibs/${ibs.id}`);
  return (
    <PageLayout
      title={`Submit FY26 attestation`}
      description={`${ibs.Name} · ${ibs.Owner} (${ibs.SMF}). The attestation pack is auto-compiled from live tolerance, mapping, and scenario data — nothing retyped.`}
    >
      <Container>
      <div className={'flex gap-5 justify-between'} style={{ width: '100%' }}>
        <div className={'flex-1'} style={{ minWidth: 0 }}>
          <SpaceBetween size={'l'}>
            <TabHeader description={'Statement of confidence and the checklist the SMF must complete.'}>{'Attestation'}</TabHeader>
            <SpaceBetween size={'l'}>
              <FormField label={'Statement of confidence'} description={'Signed by the SMF holder. Plain English.'}>
                <Textarea
                  value={statement}
                  onChange={(e: any) => setStatement(e.detail.value)}
                  placeholder={'e.g. I confirm that the firm can remain within tolerance for severe-but-plausible scenarios as tested in FY26, with remediation for VLN-014 due to complete by 30 May.'}
                  rows={5}
                />
              </FormField>
              <Header variant={'h3'}>{'Sign-off checklist'}</Header>
              <SpaceBetween size={'xs'}>
                {[
                  'I have reviewed the impact tolerance and confirm it remains appropriate.',
                  'I have reviewed the dependency map and confirm it reflects current architecture.',
                  'I have reviewed FY26 scenario tests and remediation plans.',
                  'I confirm any breach is being remediated within the agreed window.',
                  'I authorise this attestation to be included in the board pack.',
                ].map((label, i) => (
                  <Box key={i}>
                    <SpaceBetween direction={'horizontal'} size={'xs'}>
                      <input type={'checkbox'} style={{ width: 16, height: 16 }} />
                      <Box>{label}</Box>
                    </SpaceBetween>
                  </Box>
                ))}
              </SpaceBetween>
            </SpaceBetween>
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button variant={'primary'} onClick={back}>{'Submit for SMF sign-off'}</Button>
              <Button variant={'normal'} onClick={back}>{'Cancel'}</Button>
            </SpaceBetween>
          </SpaceBetween>
        </div>
        <SidebarPanel
          title={'Evidence summary'}
          items={[
            { label: 'Tolerance', sub: 'Board-approved 18 Mar 2026', rating: { color: 'light-green', label: 'Approved' } },
            { label: 'Dependency map', sub: '17 nodes · 6 third parties', rating: { color: 'light-grey', label: 'Up to date' } },
            { label: 'Scenarios', sub: '4 / 4 complete', rating: { color: 'orange', label: '1 finding' } },
            { label: 'Open vulnerabilities', sub: '1 critical, 2 high', rating: { color: 'dark-red', label: '3' } },
            { label: 'Board pack', sub: 'Scheduled for 14 Jun' },
          ]}
        />
      </div>
      </Container>
    </PageLayout>
  );
};

// ── ToleranceBar ───────────────────────────────────────────────────────
// Multi-zone bar: green (safe) → amber (caution) → red (warning) →
// dark-red (critical). A vertical marker shows the current usage, so you
// can see at a glance where the value sits relative to each threshold.
//
// Zones:
//   0–50%   safe       green
//   50–70%  caution    amber
//   70–85%  warning    light-red
//   85–100% critical   dark-red
const TOLERANCE_ZONES: Array<{ to: number; color: string }> = [
  { to: 50, color: '#8CC862' },
  { to: 70, color: '#F2A041' },
  { to: 85, color: '#E37373' },
  { to: 100, color: '#CE1B1B' },
];

const ToleranceBar = ({ value, width = 160 }: { value: number; width?: number }) => {
  let prev = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width,
          height: 8,
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {TOLERANCE_ZONES.map((z) => {
          const w = ((z.to - prev) / 100) * width;
          prev = z.to;
          return (
            <div
              key={z.to}
              style={{
                width: w,
                height: 8,
                background: z.color,
                opacity: 0.45,
              }}
            />
          );
        })}
        {/* Position marker — pin at current value */}
        <div
          style={{
            position: 'absolute',
            top: -2,
            left: `calc(${Math.min(100, Math.max(0, value))}% - 2px)`,
            width: 4,
            height: 12,
            background: '#14143A',
            borderRadius: 2,
          }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#14143A', minWidth: 32 }}>
        {value}%
      </span>
    </div>
  );
};

type RibbonItem = { title: string; value: number | string; tone?: 'total' };

const RibbonRow = ({ items }: { items: RibbonItem[] }) => (
  <div
    style={{
      display: 'flex',
      gap: 0,
      padding: '20px 24px',
      backgroundColor: '#ffffff',
      border: '1px solid #E8E8EC',
      borderRadius: 8,
      overflowX: 'auto',
    }}
  >
    {items.map((item, idx) => {
      const valueColor = item.tone === 'total' ? '#14143A' : '#41D9CC';
      return (
        <button
          key={item.title}
          type={'button'}
          style={{
            flex: '1 1 0',
            minWidth: 150,
            padding: '10px 20px 10px 10px',
            marginRight: idx === items.length - 1 ? 0 : 20,
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            borderRight: idx === items.length - 1 ? 'none' : '1px solid #ededf2',
          }}
        >
          <span style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#14143A', lineHeight: 1.2 }}>
            {item.title}
          </span>
          <span style={{ margin: 0, fontSize: 48, fontWeight: 700, color: valueColor, lineHeight: 1 }}>
            {item.value}
          </span>
        </button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
//  STORY 1 — IBS Register
// ═══════════════════════════════════════════════════════════════════════

const IBS_FILTERING_PROPERTIES = [
  { propertyLabel: 'Service', key: 'Name', groupValuesLabel: 'Services', operators: [':', '!:', '=', '!='] as Array<':' | '!:' | '=' | '!='> },
  { propertyLabel: 'Owner', key: 'Owner', groupValuesLabel: 'Owners', operators: ['=', '!='] as Array<'=' | '!='> },
  { propertyLabel: 'Regimes', key: 'Regimes', groupValuesLabel: 'Regimes', operators: [':', '!:'] as Array<':' | '!:'> },
];

const IBSNameCell = ({ item }: { item: IBSRow }) => {
  const navigate = useNavigate();
  return (
    <a
      href={`/opres/ibs/${item.id}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(`/opres/ibs/${item.id}`);
      }}
      style={{ color: '#0972d3', textDecoration: 'none', fontWeight: 600 }}
    >
      {item.Name}
    </a>
  );
};

const IBS_COLUMNS = [
  {
    id: 'Name',
    header: 'Service',
    sortingField: 'Name',
    cell: (item: IBSRow) => <IBSNameCell item={item} />,
    isRowHeader: true,
    minWidth: 240,
  },
  {
    id: 'Owner',
    header: 'Owner / SMF',
    cell: (item: IBSRow) => (
      <BadgeList badges={[`${item.Owner} · ${item.SMF}`]} />
    ),
    minWidth: 200,
  },
  {
    id: 'Criticality',
    header: 'Criticality',
    sortingField: 'Criticality',
    cell: (item: IBSRow) => <SimpleRatingBadge rating={item.Criticality} />,
    minWidth: 110,
  },
  {
    id: 'Tolerance',
    header: 'Impact tolerance',
    sortingField: 'Tolerance',
    cell: (item: IBSRow) => <Box fontWeight={'bold'}>{item.Tolerance}</Box>,
    minWidth: 130,
  },
  {
    id: 'ToleranceUsed',
    header: 'Tolerance used',
    sortingField: 'ToleranceUsed',
    cell: (item: IBSRow) => <ToleranceBar value={item.ToleranceUsed} />,
    minWidth: 200,
  },
  {
    id: 'LastTest',
    header: 'Last scenario',
    sortingField: 'LastTest',
    cell: (item: IBSRow) => {
      const rating =
        item.LastResult === 'pass' ? { color: 'light-green', label: 'Within tolerance' }
          : item.LastResult === 'breach' ? { color: 'dark-red', label: 'Tolerance breach' }
            : { color: 'orange', label: 'Test overdue' };
      return (
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <SimpleRatingBadge rating={rating} />
          <Box color={'text-status-inactive'} fontSize={'body-s'}>
            {item.LastTest}
          </Box>
        </SpaceBetween>
      );
    },
    minWidth: 200,
  },
  {
    id: 'Vulns',
    header: 'Open vulns',
    sortingField: 'Vulns',
    cell: (item: IBSRow) =>
      item.Vulns > 0 ? (
        <Box fontWeight={'bold'} color={item.Vulns >= 5 ? 'text-status-error' : item.Vulns >= 3 ? 'text-status-warning' : 'text-body-secondary'}>
          {item.Vulns}
        </Box>
      ) : (
        <Box color={'text-status-inactive'}>—</Box>
      ),
    minWidth: 100,
  },
  {
    id: 'Attestation',
    header: 'Self-assessment',
    cell: (item: IBSRow) => {
      const map = {
        approved: { color: 'light-green', label: 'Approved' },
        'in-review': { color: 'orange', label: 'In review' },
        'in-progress': { color: 'orange', label: 'In progress' },
        'not-started': { color: 'light-red', label: 'Not started' },
      } as const;
      return <SimpleRatingBadge rating={map[item.Attestation]} />;
    },
    minWidth: 130,
  },
  {
    id: 'Regimes',
    header: 'Regimes',
    cell: (item: IBSRow) => <BadgeList badges={item.Regimes} />,
    minWidth: 140,
  },
];

const IBSRegisterContent = () => {
  const collection = useCollection(IBS_DATA, {
    propertyFiltering: { filteringProperties: IBS_FILTERING_PROPERTIES, empty: <span>{'No matches'}</span> },
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
  const { items, propertyFilterProps, paginationProps, collectionProps } = collection;

  const ribbon: RibbonItem[] = useMemo(() => {
    const breaches = IBS_DATA.filter((i) => i.LastResult === 'breach').length;
    const overdue = IBS_DATA.filter((i) => i.LastResult === 'overdue').length;
    return [
      { title: 'All IBS', value: IBS_DATA.length, tone: 'total' },
      { title: 'Within tolerance', value: IBS_DATA.length - breaches - overdue },
      { title: 'Tolerance breaches YTD', value: breaches },
      { title: 'Tests overdue', value: overdue },
      { title: 'Open vulnerabilities', value: IBS_DATA.reduce((s, i) => s + i.Vulns, 0) },
      { title: 'Attestations pending', value: IBS_DATA.filter((i) => i.Attestation !== 'approved').length },
    ];
  }, []);

  return (
    <SpaceBetween size={'l'}>
      <RibbonRow items={ribbon} />

      <Table
        {...collectionProps}
        columnDefinitions={IBS_COLUMNS as any}
        items={items}
        selectionType={'multi'}
        trackBy={'id'}
        filter={
          <PropertyFilterPanel
            {...propertyFilterProps}
            countText={`${items.length} matches`}
            filteringPlaceholder={'Filter services'}
            virtualScroll
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />

      {/* Two-column row — both Containers get fitHeight so they stretch
          to match each other regardless of how many rows the lists have. */}
      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container fitHeight header={<Header variant={'h2'} description={'Findings ranked by remediation priority'}>{'Top vulnerabilities'}</Header>}>
          <SpaceBetween size={'s'}>
            {[
              { id: 'VLN-014', title: 'SMS-OTP factor unrecoverable when Twilio EU degraded', meta: 'Wire transfers · A. Mensah · SC-2026-02', rating: { color: 'dark-red', label: 'Critical' }, due: 'due 30 May' },
              { id: 'VLN-009', title: 'Core banking RTO under-tested in eu-west-1 failover', meta: 'Online banking · P. Hargreaves · SC-2026-01', rating: { color: 'light-red', label: 'High' }, due: 'due 14 Jun' },
              { id: 'VLN-021', title: 'Trading platform power resilience procedure stale', meta: 'Trading platform · L. Petrov · SC-2026-04', rating: { color: 'light-red', label: 'High' }, due: 'due 10 Jun' },
              { id: 'VLN-018', title: 'IDP step-up MFA not exercised in tabletop', meta: 'Online banking · P. Hargreaves', rating: { color: 'orange', label: 'Medium' }, due: 'due 28 Jun' },
              { id: 'VLN-027', title: 'Tabletop coverage for ransomware playbook stale', meta: 'All services · Risk & Resilience', rating: { color: 'orange', label: 'Medium' }, due: 'due 08 Aug' },
            ].map((v) => (
              <Box key={v.id} padding={{ vertical: 'xxs' }}>
                <SpaceBetween direction={'horizontal'} size={'m'}>
                  <Box>
                    <Box fontWeight={'bold'}>{v.id} — {v.title}</Box>
                    <Box color={'text-body-secondary'} fontSize={'body-s'}>{v.meta}</Box>
                  </Box>
                  <SpaceBetween direction={'horizontal'} size={'xs'}>
                    <SimpleRatingBadge rating={v.rating} />
                    <Box color={'text-status-inactive'} fontSize={'body-s'}>{v.due}</Box>
                  </SpaceBetween>
                </SpaceBetween>
              </Box>
            ))}
          </SpaceBetween>
        </Container>

        <Container fitHeight header={<Header variant={'h2'} description={'Vendors supporting more than one IBS — the first thing regulators ask for'}>{'Vendor concentration'}</Header>}>
          <SpaceBetween size={'s'}>
            {[
              { v: 'AWS eu-west-2', sub: 'Cloud · Tier 1', rating: { color: 'dark-red', label: 'Supports 6 of 8' } },
              { v: 'Okta', sub: 'IDP · Tier 1', rating: { color: 'light-red', label: 'Supports 5 of 8' } },
              { v: 'Cloudflare', sub: 'DDoS / WAF · Tier 2', rating: { color: 'orange', label: 'Supports 4 of 8' } },
              { v: 'Mambu', sub: 'Core banking · Tier 1', rating: { color: 'orange', label: 'Supports 3 of 8' } },
              { v: 'Twilio', sub: 'SMS / OTP · Tier 2', rating: { color: 'orange', label: 'Supports 3 of 8' } },
            ].map((r) => (
              <Box key={r.v} padding={{ vertical: 'xxs' }}>
                <SpaceBetween direction={'horizontal'} size={'m'}>
                  <Box>
                    <Box fontWeight={'bold'}>{r.v}</Box>
                    <Box color={'text-body-secondary'} fontSize={'body-s'}>{r.sub}</Box>
                  </Box>
                  <SimpleRatingBadge rating={r.rating} />
                </SpaceBetween>
              </Box>
            ))}
          </SpaceBetween>
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

const downloadIcon = <Download01 width={16} height={16} />;
const plusIcon = <Plus width={16} height={16} />;

// Page actions follow the production convention used in the live register
// pages (e.g. packages/web/src/pages/risks/Page.tsx): when there are 3+
// actions, the primary CTA stays as a button and the secondary actions
// collapse into a single ActionsButton dropdown. Keeps the page header
// uncluttered and matches the rest of the app.
const IBSRegisterPage = () => {
  const navigate = useNavigate();
  return (
    <PageLayout
      title={'Important Business Services'}
      counter={`(${IBS_DATA.length})`}
      description={
        'Services delivered to customers whose disruption would cause intolerable harm. Scoped under SS1/21, DORA, and CASS.'
      }
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ActionsButton
            buttonText={'Actions'}
            items={[
              { id: 'export', text: 'Export…', onItemClick: () => {} },
              { id: 'run-scenario', text: 'Run scenario', onItemClick: () => navigate('/opres/scenarios/create') },
              { id: 'bulk-import', text: 'Bulk import services', onItemClick: () => {} },
              { id: 'archive', text: 'Archive selected', disabled: true, onItemClick: () => {} },
            ]}
          />
          <Button variant={'primary'} iconAlign={'left'} iconSvg={plusIcon} onClick={() => navigate('/opres/ibs/create')}>{'Add IBS'}</Button>
        </SpaceBetween>
      }
    >
      <IBSRegisterContent />
    </PageLayout>
  );
};

export const IBSRegister: Story = {
  name: 'IBS register',
  render: () => (
    <RealProviders initialPath={'/opres/ibs'}>
      <IBSRegisterPage />
    </RealProviders>
  ),
};

// ═══════════════════════════════════════════════════════════════════════
//  STORY 2 — IBS Detail with dependency map
// ═══════════════════════════════════════════════════════════════════════

// Detail tab — follows the canonical "Detail Page" template from
// page-templates/DetailPage.stories.tsx: TabHeader at top, flex layout
// with main column (flex-1) + sidebar (max-width 350px). No Container
// chrome around the form fields — that's the production convention.
const IBSDetailsTabContent = ({ ibs }: { ibs: IBSRow }) => {
  const lastResultRating =
    ibs.LastResult === 'pass' ? { color: 'light-green', label: 'Within tolerance' }
      : ibs.LastResult === 'breach' ? { color: 'dark-red', label: 'Tolerance breach' }
        : { color: 'orange', label: 'Test overdue' };
  const attestRating = {
    approved: { color: 'light-green', label: 'Approved' },
    'in-review': { color: 'orange', label: 'In review' },
    'in-progress': { color: 'orange', label: 'In progress' },
    'not-started': { color: 'light-red', label: 'Not started' },
  }[ibs.Attestation];

  return (
    <div className={'flex gap-5 justify-between'} style={{ width: '100%' }}>
      <div className={'flex-1'} style={{ minWidth: 0 }}>
        <SpaceBetween size={'l'}>
          <TabHeader description={'Service-level metadata that drives every other view.'}>
            {'Details'}
          </TabHeader>
          <SpaceBetween size={'l'}>
            <FormField label={'Service name'}>
              <Input value={ibs.Name} onChange={() => {}} type={'search'} />
            </FormField>
            <FormField label={'Service description'}>
              <Textarea
                value={`${ibs.Name} is a customer-facing service mapped to ${ibs.Regimes.join(', ')}. Disruption beyond ${ibs.Tolerance} is treated as intolerable harm.`}
                onChange={() => {}}
                rows={4}
              />
            </FormField>
            <FormField label={'Accountable executive'}>
              <Select
                selectedOption={{ value: 'owner', label: `${ibs.Owner} · ${ibs.SMF}` } as any}
                onChange={() => {}}
                options={OPTIONS_OWNERS}
              />
            </FormField>
            <FormField label={'Criticality'}>
              <Select
                selectedOption={{ value: ibs.Criticality.label.toLowerCase(), label: ibs.Criticality.label } as any}
                onChange={() => {}}
                options={OPTIONS_CRITICALITY}
              />
            </FormField>
            <FormField label={'Impact tolerance'} description={'Maximum tolerable disruption before customer harm.'}>
              <Input value={ibs.Tolerance} onChange={() => {}} />
            </FormField>
            <FormField label={'Applicable regimes'}>
              <Multiselect
                selectedOptions={ibs.Regimes.map((r) => ({ value: r, label: r })) as any}
                onChange={() => {}}
                options={OPTIONS_REGIMES}
              />
            </FormField>
          </SpaceBetween>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'primary'}>{'Save'}</Button>
            <Button variant={'normal'}>{'Cancel'}</Button>
          </SpaceBetween>
        </SpaceBetween>
      </div>

      {/* Sidebar — matches the production Risk ratings panel pattern from
          packages/web/src/components/latest-ratings-preview/. Off-white
          wrapper + white cards + label/value pairs + status badge pinned
          right. Holds the "at a glance" stats that frame the form. */}
      <div style={{ maxWidth: 350, width: '100%' }}>
        <div
          className={'p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start'}
          style={{ backgroundColor: '#f9f9fd' }}
        >
          <span className={'m-0 font-semibold text-grey500'} style={{ color: '#5C5C79' }}>
            {'Resilience status'}
          </span>
          {[
            { label: 'Tolerance used (12m)', sub: 'Worst observed', rating: { color: ibs.ToleranceUsed >= 70 ? 'dark-red' : 'light-green', label: ibs.ToleranceUsed >= 70 ? '52 min' : '27 min' } },
            { label: 'Last scenario', sub: ibs.LastTest, rating: lastResultRating },
            { label: 'Open vulnerabilities', sub: ibs.Vulns >= 3 ? 'Remediation in flight' : 'Low priority', rating: { color: ibs.Vulns >= 5 ? 'dark-red' : ibs.Vulns >= 3 ? 'orange' : 'light-green', label: String(ibs.Vulns) } },
            { label: 'FY26 attestation', sub: 'Board sign-off 14 Jun', rating: attestRating },
          ].map((row) => (
            <div
              key={row.label}
              className={'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex gap-2'}
              style={{ backgroundColor: '#ffffff', borderColor: '#E8E8EC' }}
            >
              <div className={'flex-auto space-y-4'}>
                <h4 className={'m-0 font-semibold text-gray-300'} style={{ margin: 0, color: '#828297', fontWeight: 600 }}>
                  {row.label}
                </h4>
                <div className={'text-xs'} style={{ fontSize: 12 }}>
                  <span className={'font-semibold text-gray-400'} style={{ color: '#5C5C79', fontWeight: 600 }}>{row.sub}</span>
                </div>
              </div>
              <div className={'justify-end'} style={{ alignSelf: 'center' }}>
                <SimpleRatingBadge rating={row.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dependency map tab — keeps the layered DAG + inspect panel from the
// previous single-page layout, but now scoped to its own tab.
const IBSMappingTabContent = ({ ibs }: { ibs: IBSRow }) => {
  const [selectedNode, setSelectedNode] = useState<string>('ibs');
  const detail = GRAPH.detail[selectedNode] ?? GRAPH.detail.ibs;
  return (
    <SpaceBetween size={'l'}>
      <TabHeader description={'Layered DAG of processes → applications → infrastructure & third parties. Click any node to inspect.'}>
        {'Dependency map'}
      </TabHeader>
      <Grid gridDefinition={[{ colspan: 9 }, { colspan: 3 }]}>
        <Container fitHeight>
          <DependencyMap selectedNode={selectedNode} onSelect={setSelectedNode} />
        </Container>
        <Container
          fitHeight
          header={
            <Header variant={'h3'} description={detail.sub}>
              {detail.title}
            </Header>
          }
        >
          <SpaceBetween size={'s'}>
            <Box color={'text-body-secondary'}>{detail.desc}</Box>
            <KeyValuePairs items={detail.rows.map(([label, value]) => ({ label, value }))} />
          </SpaceBetween>
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

// Tolerances tab — triad of summary cards, tolerance history list, and a
// board-approval audit trail. The board cares about "did we stay inside,
// and how do you know" — this tab is the evidence.
const IBSTolerancesTabContent = ({ ibs }: { ibs: IBSRow }) => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Impact tolerance the board approved, plus observed performance against it.'}>
      {'Tolerances'}
    </TabHeader>

    <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
      <Container fitHeight>
        <SpaceBetween size={'xs'}>
          <Box variant={'awsui-key-label'}>Tolerance threshold</Box>
          <Box fontSize={'display-l'} fontWeight={'bold'}>{ibs.Tolerance}</Box>
          <SimpleRatingBadge rating={{ color: 'light-grey', label: 'Board-approved' }} />
          <Box color={'text-body-secondary'} fontSize={'body-s'}>Maximum tolerable disruption. Board-approved 18 Mar 2026.</Box>
        </SpaceBetween>
      </Container>
      <Container fitHeight>
        <SpaceBetween size={'xs'}>
          <Box variant={'awsui-key-label'}>Worst observed (12m)</Box>
          <Box fontSize={'display-l'} fontWeight={'bold'}>{ibs.ToleranceUsed >= 70 ? '52 min' : '27 min'}</Box>
          {ibs.ToleranceUsed >= 70
            ? <SimpleRatingBadge rating={{ color: 'dark-red', label: 'Close to breach' }} />
            : <SimpleRatingBadge rating={{ color: 'light-green', label: 'Within tolerance' }} />}
          <Box color={'text-body-secondary'} fontSize={'body-s'}>{ibs.ToleranceUsed >= 70 ? 'Inside tolerance — but only by 8 minutes' : 'Comfortably inside tolerance'}</Box>
        </SpaceBetween>
      </Container>
      <Container fitHeight>
        <SpaceBetween size={'xs'}>
          <Box variant={'awsui-key-label'}>FY26 scenarios</Box>
          <Box fontSize={'display-l'} fontWeight={'bold'}>4 / 4</Box>
          <SimpleRatingBadge rating={{ color: 'orange', label: '1 finding open' }} />
          <Box color={'text-body-secondary'} fontSize={'body-s'}>All complete. One breach under remediation (VLN-014).</Box>
        </SpaceBetween>
      </Container>
    </Grid>

    <Container header={<Header variant={'h3'} description={'Every event in the last 12 months that consumed tolerance — scenarios, incidents, near misses.'}>{'Tolerance consumption (last 12 months)'}</Header>}>
      <SpaceBetween size={'s'}>
        {[
          { when: '04 Feb 2026', source: 'SC-2026-02 · Identity provider outage', duration: '4h 22m', remaining: '0% headroom', rating: { color: 'dark-red', label: '22 min over' } },
          { when: '30 Jan 2026', source: 'SC-2026-01 · Mambu core-banking outage', duration: '27 min', remaining: '55% headroom', rating: { color: 'orange', label: 'Recovery failed' } },
          { when: '11 Apr 2026', source: 'INC-2026-204 · DNS resolver flap', duration: '18 min', remaining: '70% headroom', rating: { color: 'light-green', label: 'Within tolerance' } },
          { when: '22 Feb 2026', source: 'INC-2026-117 · Aurora failover slower than RTO', duration: '12 min', remaining: '80% headroom', rating: { color: 'light-green', label: 'Within tolerance' } },
          { when: '14 Jan 2026', source: 'INC-2026-038 · OB Gateway 5xx spike', duration: '6 min', remaining: '90% headroom', rating: { color: 'light-green', label: 'Within tolerance' } },
        ].map((e, i) => (
          <TabRow key={i} title={e.source} meta={`${e.when} · Duration ${e.duration} · ${e.remaining}`} rating={e.rating} />
        ))}
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Board-approval trail for the tolerance threshold itself.'}>{'Tolerance change history'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={`Set to ${ibs.Tolerance}`} meta={'Approved by Board · 18 Mar 2026 · Minute reference: BR-2026-03-A4'} rating={{ color: 'light-green', label: 'Current' }} />
        <TabRow title={'Tightened from 90 min → 60 min'} meta={'Approved by Risk Committee · 11 Jan 2024'} rating={{ color: 'light-grey', label: 'Superseded' }} />
        <TabRow title={'Initial tolerance set at 90 min'} meta={'Approved by Board · 28 Sep 2022'} rating={{ color: 'light-grey', label: 'Superseded' }} />
      </SpaceBetween>
    </Container>
  </SpaceBetween>
);

// Vulnerabilities + incidents tabs (separate tabs now).
const IBSVulnsTabContent = () => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Open findings from scenarios, incidents, and self-assessments — by severity and remediation status.'}>
      {'Vulnerabilities'}
    </TabHeader>

    <Container>
      <ColumnLayout columns={5} variant={'text-grid'}>
        <KeyValuePairs items={[{ label: 'Open', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>6</Box> }]} />
        <KeyValuePairs items={[{ label: 'Critical', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-error'}>1</Box> }]} />
        <KeyValuePairs items={[{ label: 'High', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-error'}>2</Box> }]} />
        <KeyValuePairs items={[{ label: 'Medium / low', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>3</Box> }]} />
        <KeyValuePairs items={[{ label: 'Avg time-to-close', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>42 days</Box> }]} />
      </ColumnLayout>
    </Container>

    <Container header={<Header variant={'h3'} description={'Vulnerabilities with no remediation action assigned yet.'}>{'Triage'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'VLN-027 — Tabletop coverage for ransomware playbook stale'} meta={'Raised 11 May 2026 · No action assigned'} rating={{ color: 'orange', label: 'Medium' }} right={'no due date'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Vulnerabilities with active remediation in flight.'}>{'In progress'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'VLN-009 — Core banking RTO under-tested in eu-west-1 failover'} meta={'Found in SC-2026-01 · Owner P. Hargreaves · ACT-2204'} rating={{ color: 'light-red', label: 'High' }} right={'due 14 Jun'} />
        <TabRow title={'VLN-018 — IDP step-up MFA not exercised in tabletop'} meta={'Found in SC-2026-01 · Owner P. Hargreaves · ACT-2211'} rating={{ color: 'orange', label: 'Medium' }} right={'due 28 Jun'} />
        <TabRow title={'VLN-022 — Stale runbook for Mambu cell failover'} meta={'Owner P. Hargreaves'} rating={{ color: 'light-green', label: 'Low' }} right={'due 12 Jul'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Vulnerabilities resolved within the last 90 days.'}>{'Closed (recent)'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'VLN-017 — Wire-transfers BCP communication script stale'} meta={'Closed 22 Apr · ACT-2212'} rating={{ color: 'light-grey', label: 'Closed' }} />
        <TabRow title={'VLN-012 — Tabletop coverage missing for Slough datacentre'} meta={'Closed 18 Mar · ACT-2197'} rating={{ color: 'light-grey', label: 'Closed' }} />
      </SpaceBetween>
    </Container>
  </SpaceBetween>
);
const IBSIncidentsTabContent = () => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Live events that hit this service. Feeds back into tolerance calibration and informs the next set of scenarios.'}>
      {'Incidents'}
    </TabHeader>

    <Container>
      <ColumnLayout columns={5} variant={'text-grid'}>
        <KeyValuePairs items={[{ label: 'Incidents (12m)', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>11</Box> }]} />
        <KeyValuePairs items={[{ label: 'Tolerance breaches', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-error'}>0</Box> }]} />
        <KeyValuePairs items={[{ label: 'Mean time to detect', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>2.4 min</Box> }]} />
        <KeyValuePairs items={[{ label: 'Mean time to recover', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>18 min</Box> }]} />
        <KeyValuePairs items={[{ label: 'Repeat causes', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-warning'}>2</Box> }]} />
      </ColumnLayout>
    </Container>

    <Container header={<Header variant={'h3'} description={'Live or recently-active events.'}>{'Recent — last 90 days'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'INC-2026-204 · DNS resolver flap (Cloudflare)'} meta={'11 Apr · MTTD 1m · MTTR 18 min · within tolerance'} rating={{ color: 'light-green', label: 'Resolved' }} />
        <TabRow title={'INC-2026-117 · Aurora failover slower than RTO'} meta={'22 Feb · MTTD 4m · MTTR 12 min · within tolerance, but RTO exceeded'} rating={{ color: 'orange', label: 'Resolved · review' }} />
        <TabRow title={'INC-2026-038 · OB Gateway 5xx spike'} meta={'14 Jan · MTTD 1m · MTTR 6 min · within tolerance'} rating={{ color: 'light-green', label: 'Resolved' }} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Earlier incidents kept for trend analysis.'}>{'Historical — 90+ days ago'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'INC-2025-918 · Mambu rate-limit during settlement window'} meta={'14 Dec · MTTD 3m · MTTR 22 min · within tolerance'} rating={{ color: 'light-green', label: 'Resolved' }} />
        <TabRow title={'INC-2025-842 · Okta TOTP service degradation'} meta={'08 Nov · MTTD 2m · MTTR 14 min · within tolerance'} rating={{ color: 'light-green', label: 'Resolved' }} />
        <TabRow title={'INC-2025-771 · Cloudflare edge cache poisoning false-positive'} meta={'02 Oct · MTTD 5m · MTTR 9 min · within tolerance'} rating={{ color: 'light-green', label: 'Resolved' }} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Underlying causes flagged across multiple incidents — informs the next scenario.'}>{'Repeat root causes'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'Identity provider regional dependency'} meta={'Cited in 3 incidents · INC-2025-842, INC-2025-771, INC-2026-117'} rating={{ color: 'orange', label: '3 incidents' }} />
        <TabRow title={'DNS resolver caching behaviour'} meta={'Cited in 2 incidents · INC-2026-204, INC-2025-918'} rating={{ color: 'orange', label: '2 incidents' }} />
      </SpaceBetween>
    </Container>
  </SpaceBetween>
);

// ── ROW HELPER ──────────────────────────────────────────────────────────
// Repeats the title-meta-badge-due layout used across the OpRes tabs.
// Mirrors the row pattern from latest-ratings-preview without the panel
// chrome — sits inside a Container per tab.
const TabRow = ({ title, meta, rating, right }: { title: string; meta?: string; rating?: { color: string; label: string }; right?: string }) => (
  <Box padding={{ vertical: 'xxs' }}>
    <SpaceBetween direction={'horizontal'} size={'m'}>
      <Box>
        <Box fontWeight={'bold'}>{title}</Box>
        {meta && <Box color={'text-body-secondary'} fontSize={'body-s'}>{meta}</Box>}
      </Box>
      <SpaceBetween direction={'horizontal'} size={'xs'}>
        {rating && <SimpleRatingBadge rating={rating} />}
        {right && <Box color={'text-status-inactive'} fontSize={'body-s'}>{right}</Box>}
      </SpaceBetween>
    </SpaceBetween>
  </Box>
);

// ── SCENARIOS TAB ───────────────────────────────────────────────────────
// Real list of scenarios affecting this IBS — pulled from the SCENARIOS
// data so the tab feels integrated rather than a placeholder.
const IBSScenariosTabContent = ({ ibs }: { ibs: IBSRow }) => {
  const relevant = SCENARIOS.filter((s) => s.IBS === 'All' || s.IBS.toLowerCase().includes(ibs.Name.toLowerCase().split(' ')[0]));
  const breaches = relevant.filter((s) => s.Result.label === 'Tolerance breach').length;
  return (
    <SpaceBetween size={'l'}>
      <TabHeader description={'Severe-but-plausible tests that exercised this service. Links to the global scenarios register.'}>
        {'Scenarios'}
      </TabHeader>

      <Container>
        <ColumnLayout columns={4} variant={'text-grid'}>
          <KeyValuePairs items={[{ label: 'Run in FY26', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>{relevant.length}</Box> }]} />
          <KeyValuePairs items={[{ label: 'Breaches', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={breaches > 0 ? 'text-status-error' : 'text-body-secondary'}>{breaches}</Box> }]} />
          <KeyValuePairs items={[{ label: 'Avg tolerance used', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>72%</Box> }]} />
          <KeyValuePairs items={[{ label: 'Coverage', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>All scenario types tested</Box> }]} />
        </ColumnLayout>
      </Container>

      <Container header={<Header variant={'h3'} description={'Scenarios already executed against this service.'}>{`Completed (${relevant.length})`}</Header>}>
        <SpaceBetween size={'s'}>
          {relevant.length === 0 ? (
            <Box color={'text-body-secondary'}>No scenarios have tested this service yet.</Box>
          ) : (
            relevant.map((s) => (
              <TabRow
                key={s.id}
                title={`${s.id} — ${s.Name}`}
                meta={`${s.Ran} · ${s.Duration} · led by ${s.Leader}`}
                rating={s.Result}
                right={s.BreachBy}
              />
            ))
          )}
        </SpaceBetween>
      </Container>

      <Container header={<Header variant={'h3'} description={'Upcoming scenarios scheduled against this service.'}>{'Scheduled'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'SC-2026-08 — Vendor exit drill: Mambu primary failover'} meta={'Scheduled 12 Jun 2026 · Lead L. Petrov'} rating={{ color: 'light-grey', label: 'Scheduled' }} right={'in 31 days'} />
          <TabRow title={'SC-2026-11 — Quarterly tabletop: regional cyber + payments cut-off'} meta={'Scheduled 25 Jul 2026 · Lead K. Müller'} rating={{ color: 'light-grey', label: 'Scheduled' }} right={'in 74 days'} />
        </SpaceBetween>
      </Container>

      <Container header={<Header variant={'h3'} description={'Scenario types this service still needs to exercise to meet FY26 coverage.'}>{'Coverage matrix'}</Header>}>
        <ColumnLayout columns={4}>
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>Cyber</Box>
            <SimpleRatingBadge rating={{ color: 'light-green', label: '2 of 2 complete' }} />
          </SpaceBetween>
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>Third-party</Box>
            <SimpleRatingBadge rating={{ color: 'light-green', label: '1 of 1 complete' }} />
          </SpaceBetween>
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>Facility</Box>
            <SimpleRatingBadge rating={{ color: 'orange', label: '0 of 1 — overdue' }} />
          </SpaceBetween>
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>People</Box>
            <SimpleRatingBadge rating={{ color: 'light-green', label: '1 of 1 complete' }} />
          </SpaceBetween>
        </ColumnLayout>
      </Container>
    </SpaceBetween>
  );
};

// ── CONTROLS TAB ────────────────────────────────────────────────────────
// Controls that mitigate disruption risk to this IBS. Mirrors the
// Risks/Update Controls tab (links into the controls register).
const IBSControlsTabContent = () => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Controls that mitigate the risk of disruption to this service. Effectiveness drives the residual tolerance picture.'}>
      {'Controls'}
    </TabHeader>

    <Container>
      <ColumnLayout columns={4} variant={'text-grid'}>
        <KeyValuePairs items={[{ label: 'Linked controls', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>12</Box> }]} />
        <KeyValuePairs items={[{ label: 'Fully / mostly effective', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>8</Box> }]} />
        <KeyValuePairs items={[{ label: 'Moderate or partial', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-warning'}>3</Box> }]} />
        <KeyValuePairs items={[{ label: 'Not effective / untested', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-error'}>1</Box> }]} />
      </ColumnLayout>
    </Container>

    <Container header={<Header variant={'h3'} description={'Preventive controls that stop disruption from starting.'}>{'Preventive controls'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'CTL-204 — Active-active multi-region failover (eu-west-2 ↔ eu-west-1)'} meta={'Owner: Platform eng · Last test: 11 Feb 2026'} rating={{ color: 'light-green', label: 'Fully effective' }} />
        <TabRow title={'CTL-188 — IDP step-up MFA enforcement on high-risk endpoints'} meta={'Owner: Identity · Last test: 04 Feb 2026'} rating={{ color: 'orange', label: 'Moderately effective' }} />
        <TabRow title={'CTL-176 — Continuous resilience patching SLA on tier-1 vendors'} meta={'Owner: Vendor mgmt · Last test: 18 Mar 2026'} rating={{ color: 'light-green', label: 'Fully effective' }} />
        <TabRow title={'CTL-155 — Network segmentation for payment processing zone'} meta={'Owner: Platform eng · Last test: 09 Jan 2026'} rating={{ color: 'light-green', label: 'Fully effective' }} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Detective controls that surface a disruption while it is happening.'}>{'Detective controls'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'CTL-211 — Privileged-access break-glass with hardware key'} meta={'Owner: Identity · Last test: 22 Apr 2026'} rating={{ color: 'light-green', label: 'Fully effective' }} />
        <TabRow title={'CTL-263 — Synthetic transaction monitoring (1-min cadence)'} meta={'Owner: Platform eng · Last test: 12 May 2026'} rating={{ color: 'light-green', label: 'Fully effective' }} />
        <TabRow title={'CTL-291 — Customer journey heartbeat alerting'} meta={'Owner: Observability · Last test: 22 Mar 2026'} rating={{ color: 'orange', label: 'Mostly effective' }} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Recovery controls invoked once a disruption has been detected.'}>{'Recovery controls'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'CTL-219 — Vendor exit-plan rehearsal (Mambu)'} meta={'Owner: Risk & Resilience · Last test: 14 Nov 2025'} rating={{ color: 'orange', label: 'Moderately effective' }} />
        <TabRow title={'CTL-242 — Customer comms script with regulatory notification triggers'} meta={'Owner: Comms · Last test: 22 Apr 2026'} rating={{ color: 'light-green', label: 'Mostly effective' }} />
        <TabRow title={'CTL-278 — Manual branch-fallback for high-value payments'} meta={'Owner: Payments ops · Last test: 30 Jan 2026'} rating={{ color: 'orange', label: 'Moderately effective' }} />
        <TabRow title={'CTL-310 — Read-only customer view during ledger outage'} meta={'Owner: Core banking · Last test: not yet tested'} rating={{ color: 'dark-red', label: 'Not effective' }} />
      </SpaceBetween>
    </Container>
  </SpaceBetween>
);

// ── THIRD PARTIES TAB ───────────────────────────────────────────────────
// Vendors supporting this IBS. Pulled from the dependency-map vendor
// layer so the data set is consistent with the Mapping tab.
const IBSThirdPartiesTabContent = () => {
  const vendorLayer = GRAPH.layers.find((l) => l.label === 'Infrastructure & Third Parties');
  const vendors = (vendorLayer?.nodes ?? []).filter((n) => n.type === 'vendor');
  return (
    <SpaceBetween size={'l'}>
      <TabHeader description={'Vendors and infrastructure suppliers supporting this service. Concentration risk surfaces here.'}>
        {'Third parties'}
      </TabHeader>

      <Container>
        <ColumnLayout columns={4} variant={'text-grid'}>
          <KeyValuePairs items={[{ label: 'Total third parties', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>{vendors.length}</Box> }]} />
          <KeyValuePairs items={[{ label: 'Tier 1 vendors', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>3</Box> }]} />
          <KeyValuePairs items={[{ label: 'Concentration risks', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-error'}>2</Box> }]} />
          <KeyValuePairs items={[{ label: 'Exit plans tested (12m)', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>2 of 3</Box> }]} />
        </ColumnLayout>
      </Container>

      <Container header={<Header variant={'h3'} description={'Vendors whose failure would breach tolerance — exit plans are mandatory.'}>{'Tier 1 — critical'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'AWS eu-west-2 — Cloud provider'} meta={'Hosts 6 of 8 IBSs · Exit plan: Multi-region (eu-west-1) active-passive · Last DR test: 11 Feb 2026'} rating={{ color: 'dark-red', label: 'Concentration risk' }} />
          <TabRow title={'Okta — Sole identity provider'} meta={'5 of 8 IBSs · Exit plan: Cloudflare Access second path (ACT-2211 in flight) · SOC2 Type II Mar 2026'} rating={{ color: 'dark-red', label: 'Concentration risk' }} />
          <TabRow title={'Mambu — Core banking ledger'} meta={'Vendor-managed application · Contract renewal Q2 2027 · Exit plan tested Nov 2025'} rating={{ color: 'orange', label: 'Tier 1 vendor' }} />
        </SpaceBetween>
      </Container>

      <Container header={<Header variant={'h3'} description={'Supporting vendors whose failure causes degradation but not breach.'}>{'Tier 2 — supporting'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'Cloudflare — DDoS / WAF'} meta={'Edge protection · SLA 99.99% · Direct origin bypass via internal only'} rating={{ color: 'light-grey', label: 'Standard' }} />
          <TabRow title={'Twilio — SMS / OTP fallback'} meta={'Replacement plan: FIDO2 rollout 2026-Q3 (ACT-2208)'} rating={{ color: 'orange', label: 'Retiring' }} />
        </SpaceBetween>
      </Container>

      <Container header={<Header variant={'h3'} description={'Documented procedures for exiting or replacing each tier-1 vendor.'}>{'Exit plans'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'AWS eu-west-2 exit plan'} meta={'Multi-region active-passive · Last tested 11 Feb 2026 · Lead: Platform eng'} rating={{ color: 'light-green', label: 'Tested' }} />
          <TabRow title={'Okta exit plan'} meta={'Add Cloudflare Access as second IDP · ACT-2211 in flight'} rating={{ color: 'orange', label: 'In progress' }} />
          <TabRow title={'Mambu exit plan'} meta={'Manual ledger fallback + alternative core onboarding · Last tested Nov 2025'} rating={{ color: 'orange', label: 'Refresh due' }} />
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

// ── ACTIONS TAB ─────────────────────────────────────────────────────────
const IBSActionsTabContent = () => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Remediation and continuous-improvement actions linked to this service.'}>
      {'Actions'}
    </TabHeader>

    <Container>
      <ColumnLayout columns={5} variant={'text-grid'}>
        <KeyValuePairs items={[{ label: 'Open', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>8</Box> }]} />
        <KeyValuePairs items={[{ label: 'In progress', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-warning'}>3</Box> }]} />
        <KeyValuePairs items={[{ label: 'Overdue', value: <Box fontSize={'heading-l'} fontWeight={'bold'} color={'text-status-error'}>1</Box> }]} />
        <KeyValuePairs items={[{ label: 'Closed (90d)', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>4</Box> }]} />
        <KeyValuePairs items={[{ label: 'Avg lead time', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>38 days</Box> }]} />
      </ColumnLayout>
    </Container>

    <Container header={<Header variant={'h3'} description={'Actions past their target date — escalation required.'}>{'Overdue'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'ACT-2156 — Document new failover runbook'} meta={'Owner: P. Hargreaves · Source: VLN-008'} rating={{ color: 'dark-red', label: 'Overdue 12 days' }} right={'due 30 Apr'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Active remediation in flight, on track.'}>{'In progress'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'ACT-2204 — Validate Core banking RTO in eu-west-1 failover'} meta={'Owner: P. Hargreaves · Source: VLN-009 · 60% complete'} rating={{ color: 'orange', label: 'In progress' }} right={'due 14 Jun'} />
        <TabRow title={'ACT-2208 — Retire SMS-OTP as MFA fallback'} meta={'Owner: A. Mensah · Source: VLN-014 · 75% complete'} rating={{ color: 'orange', label: 'In progress' }} right={'due 30 May'} />
        <TabRow title={'ACT-2218 — Refresh BCP exercise playbook for FY27'} meta={'Owner: BCM · Source: VLN-024 · 20% complete'} rating={{ color: 'orange', label: 'In progress' }} right={'due 30 Jun'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Open actions not yet started.'}>{'Open'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'ACT-2211 — Add Cloudflare Access as second IDP path'} meta={'Owner: Identity · Source: VLN-016'} rating={{ color: 'orange', label: 'Open' }} right={'due 21 Jul'} />
        <TabRow title={'ACT-2229 — Add manual override for read-only customer view'} meta={'Owner: Core banking · Source: VLN-027'} rating={{ color: 'orange', label: 'Open' }} right={'due 12 Aug'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Recently completed remediation.'}>{'Closed (last 90 days)'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'ACT-2212 — Update wire-transfers BCP communication script'} meta={'Owner: Comms · Source: VLN-017 · Closed 22 Apr'} rating={{ color: 'light-grey', label: 'Closed' }} />
        <TabRow title={'ACT-2197 — Tabletop on Slough datacentre power loss'} meta={'Owner: Risk & Resilience · Closed 18 Mar'} rating={{ color: 'light-grey', label: 'Closed' }} />
        <TabRow title={'ACT-2189 — Annual exit-plan rehearsal with Mambu'} meta={'Owner: Risk & Resilience · Standing action · Closed 14 Nov'} rating={{ color: 'light-grey', label: 'Closed' }} />
      </SpaceBetween>
    </Container>
  </SpaceBetween>
);

// ── ATTESTATIONS TAB ────────────────────────────────────────────────────
const IBSAttestationsTabContent = ({ ibs }: { ibs: IBSRow }) => {
  const currentState =
    ibs.Attestation === 'approved' ? 'Approved'
      : ibs.Attestation === 'in-review' ? 'In review'
        : ibs.Attestation === 'in-progress' ? 'In progress'
          : 'Not started';
  const currentColor = ibs.Attestation === 'approved' ? 'light-green' : 'orange';
  return (
    <SpaceBetween size={'l'}>
      <TabHeader description={'Historical sign-offs by the accountable SMF, plus the FY26 cycle in flight.'}>
        {'Attestations'}
      </TabHeader>

      <Container header={<Header variant={'h3'} description={'The attestation in flight. Progress is auto-tracked against the evidence inputs.'}>{'FY26 cycle — in flight'}</Header>}>
        <SpaceBetween size={'m'}>
          <KeyValuePairs
            columns={3}
            items={[
              { label: 'Status', value: <SimpleRatingBadge rating={{ color: currentColor, label: currentState }} /> },
              { label: 'Accountable SMF', value: `${ibs.Owner} (${ibs.SMF})` },
              { label: 'Cycle closes', value: '30 June 2026' },
              { label: 'Board sign-off', value: 'Scheduled 14 Jun 2026' },
              { label: 'Evidence inputs', value: '4 of 5 complete' },
              { label: 'Outstanding finding', value: 'VLN-014 (remediation 30 May)' },
            ]}
          />
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>Sign-off progress</Box>
            <ProgressBar value={ibs.Attestation === 'approved' ? 100 : ibs.Attestation === 'in-review' ? 80 : ibs.Attestation === 'in-progress' ? 40 : 0} additionalInfo={currentState} />
          </SpaceBetween>
        </SpaceBetween>
      </Container>

      <Container header={<Header variant={'h3'} description={'Sign-offs from previous attestation cycles, with the SMF holder of record.'}>{'History'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'FY25 annual'} meta={`Signed by ${ibs.Owner}`} rating={{ color: 'light-green', label: 'Approved' }} right={'Board: 12 Jun 2025'} />
          <TabRow title={'FY24 annual'} meta={'Signed by R. Poole (previous SMF)'} rating={{ color: 'light-green', label: 'Approved' }} right={'Board: 06 Jun 2024'} />
          <TabRow title={'FY23 annual'} meta={'Signed by R. Poole (previous SMF)'} rating={{ color: 'light-green', label: 'Approved' }} right={'Board: 18 May 2023'} />
          <TabRow title={'FY22 annual'} meta={'Signed by R. Poole (previous SMF) · First year under SS1/21'} rating={{ color: 'light-green', label: 'Approved' }} right={'Board: 22 Jun 2022'} />
        </SpaceBetween>
      </Container>

      <Container header={<Header variant={'h3'} description={'Auto-compiled artefacts in the FY26 attestation pack.'}>{'Evidence inputs (FY26)'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'Tolerance threshold'} meta={'Board-approved 18 Mar 2026 · BR-2026-03-A4'} rating={{ color: 'light-green', label: 'Complete' }} />
          <TabRow title={'Dependency map'} meta={'17 nodes · 6 third parties · refreshed 02 May 2026'} rating={{ color: 'light-green', label: 'Complete' }} />
          <TabRow title={'Scenario tests'} meta={'4 of 4 complete · 1 finding open (VLN-014)'} rating={{ color: 'orange', label: '1 finding' }} />
          <TabRow title={'Incident log'} meta={'11 events · no breaches'} rating={{ color: 'light-green', label: 'Complete' }} />
          <TabRow title={'Control effectiveness review'} meta={'12 controls reviewed · awaiting CRO sign-off'} rating={{ color: 'orange', label: 'Pending' }} />
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

// ── APPROVALS TAB ───────────────────────────────────────────────────────
const IBSApprovalsTabContent = () => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Sign-off workflow for tolerance updates, mapping changes, and the annual attestation.'}>
      {'Approvals'}
    </TabHeader>

    <Container header={<Header variant={'h3'} description={'Approvals currently progressing through the workflow.'}>{'In flight'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'1. Service owner review'} meta={'P. Hargreaves (SMF24)'} rating={{ color: 'light-green', label: 'Completed' }} right={'02 May 2026'} />
        <TabRow title={'2. Risk committee review'} meta={'Chair: D. Ali · 6 members · 5 in favour, 1 abstain'} rating={{ color: 'light-green', label: 'Completed' }} right={'09 May 2026'} />
        <TabRow title={'3. CRO sign-off'} meta={'M. Tan · Required before board pack compilation'} rating={{ color: 'orange', label: 'Pending' }} right={'due 28 May'} />
        <TabRow title={'4. Board attestation'} meta={'Board chair · Quarterly board meeting'} rating={{ color: 'light-grey', label: 'Scheduled' }} right={'14 Jun 2026'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Workflow definition for this attestation type — every step the firm has agreed must happen before the board signs.'}>{'Workflow'}</Header>}>
      <SpaceBetween size={'s'}>
        <KeyValuePairs
          columns={2}
          items={[
            { label: 'Workflow name', value: 'OpRes annual attestation v3' },
            { label: 'Workflow owner', value: 'Risk & Resilience' },
            { label: 'Steps', value: '4 sequential approvals' },
            { label: 'SLA', value: '6 weeks from cycle open to board sign-off' },
            { label: 'Escalation', value: 'Auto-escalate after 7 days without action' },
            { label: 'Approvers per step', value: 'Service owner → Risk committee → CRO → Board' },
          ]}
        />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Recently-completed approvals for this service.'}>{'Past approvals'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'FY26 tolerance threshold change (90→60 min superseded)'} meta={'Approved by Board · BR-2026-03-A4'} rating={{ color: 'light-grey', label: 'Approved' }} right={'18 Mar 2026'} />
        <TabRow title={'Mapping refresh — added Cloudflare and retired SMS-OTP path'} meta={'Approved by Risk committee'} rating={{ color: 'light-grey', label: 'Approved' }} right={'09 May 2026'} />
        <TabRow title={'FY25 annual attestation'} meta={'Approved by Board'} rating={{ color: 'light-grey', label: 'Approved' }} right={'12 Jun 2025'} />
      </SpaceBetween>
    </Container>
  </SpaceBetween>
);

// ── LINKED ITEMS TAB ────────────────────────────────────────────────────
const IBSLinkedItemsTabContent = () => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Cross-entity links — risk register, policies, indicators, audits, and obligations that touch this service.'}>
      {'Linked items'}
    </TabHeader>

    <Container>
      <ColumnLayout columns={5} variant={'text-grid'}>
        <KeyValuePairs items={[{ label: 'Risks', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>4</Box> }]} />
        <KeyValuePairs items={[{ label: 'Policies', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>2</Box> }]} />
        <KeyValuePairs items={[{ label: 'Obligations', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>3</Box> }]} />
        <KeyValuePairs items={[{ label: 'Indicators', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>5</Box> }]} />
        <KeyValuePairs items={[{ label: 'Internal audits', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>2</Box> }]} />
      </ColumnLayout>
    </Container>

    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <Container fitHeight header={<Header variant={'h3'} description={'Risks scoped against this service.'}>{'Risks'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'R-104 — Concentration on AWS eu-west-2'} meta={'Tier 1 · Owner P. Hargreaves'} rating={{ color: 'dark-red', label: 'Critical' }} />
          <TabRow title={'R-187 — IDP single point of failure'} meta={'Tier 2 · Owner Identity'} rating={{ color: 'light-red', label: 'High' }} />
          <TabRow title={'R-221 — Mambu vendor exit risk'} meta={'Tier 1 · Owner Risk & Resilience'} rating={{ color: 'light-red', label: 'High' }} />
          <TabRow title={'R-264 — Customer comms script staleness'} meta={'Tier 3 · Owner Comms'} rating={{ color: 'orange', label: 'Medium' }} />
        </SpaceBetween>
      </Container>
      <Container fitHeight header={<Header variant={'h3'} description={'Indicators tracking residual health of this service.'}>{'Indicators (KRIs)'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'KRI-028 — Mean time to recover'} meta={'Threshold: 1h · Current: 27m'} rating={{ color: 'light-green', label: 'Within tolerance' }} />
          <TabRow title={'KRI-031 — IDP authentication success rate'} meta={'Threshold: 99.9% · Current: 99.97%'} rating={{ color: 'light-green', label: 'Within tolerance' }} />
          <TabRow title={'KRI-042 — Vendor concentration (cloud)'} meta={'Threshold: 4 of 8 · Current: 6 of 8'} rating={{ color: 'dark-red', label: 'Outside tolerance' }} />
          <TabRow title={'KRI-058 — Tabletop completion rate'} meta={'Threshold: 100% by Q1 · Current: 75%'} rating={{ color: 'orange', label: 'Below target' }} />
          <TabRow title={'KRI-061 — Payment scheme latency P95'} meta={'Threshold: 400ms · Current: 248ms'} rating={{ color: 'light-green', label: 'Within tolerance' }} />
        </SpaceBetween>
      </Container>
    </Grid>

    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <Container fitHeight header={<Header variant={'h3'} description={'Policies and regulatory obligations applicable to this service.'}>{'Policies & obligations'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'POL-014 — Operational resilience policy'} meta={'Last reviewed Mar 2026'} rating={{ color: 'light-green', label: 'Current' }} />
          <TabRow title={'POL-018 — Third-party risk policy'} meta={'Last reviewed Jan 2026'} rating={{ color: 'light-green', label: 'Current' }} />
          <TabRow title={'OBL-302 — SS1/21 self-assessment'} meta={'PRA · Annual'} rating={{ color: 'light-green', label: 'On track' }} />
          <TabRow title={'OBL-415 — DORA Register of Information'} meta={'EU · Annual'} rating={{ color: 'orange', label: 'In progress' }} />
          <TabRow title={'OBL-501 — CASS reporting'} meta={'FCA · Quarterly'} rating={{ color: 'light-green', label: 'On track' }} />
        </SpaceBetween>
      </Container>
      <Container fitHeight header={<Header variant={'h3'} description={'Internal audit engagements that have reviewed this service.'}>{'Internal audits'}</Header>}>
        <SpaceBetween size={'s'}>
          <TabRow title={'IA-2026-04 — Operational resilience programme'} meta={'Fieldwork Feb–Mar 2026 · Report issued Apr'} rating={{ color: 'orange', label: '2 findings' }} />
          <TabRow title={'IA-2025-11 — Identity & access management'} meta={'Fieldwork Sep–Oct 2025 · Report issued Nov'} rating={{ color: 'light-green', label: 'Closed' }} />
        </SpaceBetween>
      </Container>
    </Grid>
  </SpaceBetween>
);

// ── ACTIVITY TAB ────────────────────────────────────────────────────────
const IBSActivityTabContent = () => (
  <SpaceBetween size={'l'}>
    <TabHeader description={'Audit log — every change to this service, by whom, and when. Used as evidence in the attestation pack.'}>
      {'Activity'}
    </TabHeader>

    <Container>
      <ColumnLayout columns={4} variant={'text-grid'}>
        <KeyValuePairs items={[{ label: 'Events (90d)', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>27</Box> }]} />
        <KeyValuePairs items={[{ label: 'Distinct actors', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>8</Box> }]} />
        <KeyValuePairs items={[{ label: 'Approval events', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>4</Box> }]} />
        <KeyValuePairs items={[{ label: 'Last activity', value: <Box fontSize={'heading-l'} fontWeight={'bold'}>2 days ago</Box> }]} />
      </ColumnLayout>
    </Container>

    <Container header={<Header variant={'h3'} description={'Activity in the last 7 days.'}>{'This week'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'Updated tolerance description'} meta={'P. Hargreaves · 02 May 2026 · 14:22'} />
        <TabRow title={'Approved FY26 mapping refresh'} meta={'D. Ali (Risk committee chair) · 09 May 2026 · 11:30'} />
        <TabRow title={'Raised vulnerability VLN-027 (ransomware tabletop stale)'} meta={'K. Müller · 11 May 2026 · 08:51'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Activity older than 7 days but within the current cycle.'}>{'Earlier this cycle'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'Closed action ACT-2212 (BCP comms script)'} meta={'K. Müller · 22 Apr 2026 · 16:03'} />
        <TabRow title={'Linked vulnerability VLN-014 to SC-2026-02'} meta={'A. Mensah · 11 Apr 2026 · 09:48'} />
        <TabRow title={'Added third party Cloudflare to mapping'} meta={'P. Hargreaves · 11 Mar 2026 · 10:15'} />
        <TabRow title={'Re-baselined impact tolerance from 90 min → 60 min'} meta={'R. Poole · 18 Mar 2026 · 09:01'} />
      </SpaceBetween>
    </Container>

    <Container header={<Header variant={'h3'} description={'Activity from the previous attestation cycle, retained as evidence.'}>{'Historical'}</Header>}>
      <SpaceBetween size={'s'}>
        <TabRow title={'FY25 attestation approved by board'} meta={'Board chair · 12 Jun 2025 · 17:00'} />
        <TabRow title={'Added third party Okta to mapping'} meta={'P. Hargreaves · 22 Jan 2025 · 10:40'} />
        <TabRow title={'Service onboarded into OpRes programme'} meta={'R. Poole (previous SMF) · 28 Sep 2022 · 09:00'} />
      </SpaceBetween>
    </Container>
  </SpaceBetween>
);

const IBSDetailContent = ({ ibs }: { ibs: IBSRow }) => {
  const [activeTabId, setActiveTabId] = useState('details');
  // Tab structure mirrors packages/web/src/pages/risks/update/Page.tsx
  // (Details first, then domain-specific tabs, ending with Activity).
  const tabs = [
    { label: 'Details', id: 'details', content: <IBSDetailsTabContent ibs={ibs} /> },
    { label: 'Mapping', id: 'mapping', content: <IBSMappingTabContent ibs={ibs} /> },
    { label: 'Tolerances', id: 'tolerances', content: <IBSTolerancesTabContent ibs={ibs} /> },
    { label: 'Scenarios', id: 'scenarios', content: <IBSScenariosTabContent ibs={ibs} /> },
    { label: 'Controls', id: 'controls', content: <IBSControlsTabContent /> },
    { label: 'Vulnerabilities', id: 'vulnerabilities', content: <IBSVulnsTabContent /> },
    { label: 'Actions', id: 'actions', content: <IBSActionsTabContent /> },
    { label: 'Incidents', id: 'incidents', content: <IBSIncidentsTabContent /> },
    { label: 'Third parties', id: 'third-parties', content: <IBSThirdPartiesTabContent /> },
    { label: 'Attestations', id: 'attestations', content: <IBSAttestationsTabContent ibs={ibs} /> },
    { label: 'Approvals', id: 'approvals', content: <IBSApprovalsTabContent /> },
    { label: 'Linked items', id: 'linked-items', content: <IBSLinkedItemsTabContent /> },
    { label: 'Activity', id: 'activity', content: <IBSActivityTabContent /> },
  ];
  return (
    <ControlledTabs
      variant={'container'}
      activeTabId={activeTabId}
      onChange={({ detail }: any) => setActiveTabId(detail.activeTabId)}
      tabs={tabs}
    />
  );
};

// Unused — original single-page layout, replaced by the tabs above.
const _IBSDetailContentLegacy = ({ ibs }: { ibs: IBSRow }) => {
  const [selectedNode, setSelectedNode] = useState<string>('ibs');
  const lastResultRating =
    ibs.LastResult === 'pass' ? { color: 'light-green', label: 'Within tolerance' }
      : ibs.LastResult === 'breach' ? { color: 'dark-red', label: 'Tolerance breach' }
        : { color: 'orange', label: 'Test overdue' };
  const attestRating = {
    approved: { color: 'light-green', label: 'Approved' },
    'in-review': { color: 'orange', label: 'In review' },
    'in-progress': { color: 'orange', label: 'In progress' },
    'not-started': { color: 'light-red', label: 'Not started' },
  }[ibs.Attestation];

  const detail = GRAPH.detail[selectedNode] ?? GRAPH.detail.ibs;

  return (
    <SpaceBetween size={'l'}>
      {/* Meta strip */}
      <Container>
        <ColumnLayout columns={6} variant={'text-grid'}>
          <KeyValuePairs
            items={[
              { label: 'Accountable executive', value: `${ibs.Owner} · ${ibs.SMF}` },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Criticality', value: <SimpleRatingBadge rating={ibs.Criticality} /> },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Impact tolerance', value: <Box fontSize={'heading-m'} fontWeight={'bold'}>{ibs.Tolerance}</Box> },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Tolerance used (12m)', value: <ToleranceBar value={ibs.ToleranceUsed} width={180} /> },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Last scenario', value: <SpaceBetween direction={'horizontal'} size={'xs'}><SimpleRatingBadge rating={lastResultRating} /><Box color={'text-status-inactive'} fontSize={'body-s'}>{ibs.LastTest}</Box></SpaceBetween> },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Attestation', value: <SimpleRatingBadge rating={attestRating} /> },
            ]}
          />
        </ColumnLayout>
      </Container>

      {/* Tolerance triad — same internal structure on every card:
            key-label  →  display-l number  →  status badge  →  helper text
          fitHeight stretches each Container to the same row height. */}
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container fitHeight>
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>Tolerance threshold</Box>
            <Box fontSize={'display-l'} fontWeight={'bold'}>{ibs.Tolerance}</Box>
            <SimpleRatingBadge rating={{ color: 'light-grey', label: 'Board-approved' }} />
            <Box color={'text-body-secondary'} fontSize={'body-s'}>Maximum tolerable disruption. Board-approved 18 Mar 2026.</Box>
          </SpaceBetween>
        </Container>
        <Container fitHeight>
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>Worst observed (12m)</Box>
            <Box fontSize={'display-l'} fontWeight={'bold'}>{ibs.ToleranceUsed >= 70 ? '52 min' : '27 min'}</Box>
            {ibs.ToleranceUsed >= 70
              ? <SimpleRatingBadge rating={{ color: 'dark-red', label: 'Close to breach' }} />
              : <SimpleRatingBadge rating={{ color: 'light-green', label: 'Within tolerance' }} />}
            <Box color={'text-body-secondary'} fontSize={'body-s'}>{ibs.ToleranceUsed >= 70 ? 'Inside tolerance — but only by 8 minutes' : 'Comfortably inside tolerance'}</Box>
          </SpaceBetween>
        </Container>
        <Container fitHeight>
          <SpaceBetween size={'xs'}>
            <Box variant={'awsui-key-label'}>FY26 scenarios</Box>
            <Box fontSize={'display-l'} fontWeight={'bold'}>4 / 4</Box>
            <SimpleRatingBadge rating={{ color: 'orange', label: '1 finding open' }} />
            <Box color={'text-body-secondary'} fontSize={'body-s'}>All complete. One breach under remediation (VLN-014).</Box>
          </SpaceBetween>
        </Container>
      </Grid>

      {/* Dependency map — give the graph card room (9/12) so the 6-node
          application + vendor rows have horizontal space, and the inspect
          panel still fits (3/12) without being cramped. Both fitHeight so
          the inspect panel matches the map height (consistent row). */}
      <Grid gridDefinition={[{ colspan: 9 }, { colspan: 3 }]}>
        <Container
          fitHeight
          header={
            <Header
              variant={'h2'}
              description={'Click any node to inspect. Layered DAG of processes → applications → infrastructure & third parties.'}
            >
              {'Dependency map'}
            </Header>
          }
        >
          <DependencyMap selectedNode={selectedNode} onSelect={setSelectedNode} />
        </Container>

        <Container
          fitHeight
          header={
            <Header variant={'h3'} description={detail.sub}>
              {detail.title}
            </Header>
          }
        >
          <SpaceBetween size={'s'}>
            <Box color={'text-body-secondary'}>{detail.desc}</Box>
            <KeyValuePairs items={detail.rows.map(([label, value]) => ({ label, value }))} />
            <Box variant={'awsui-key-label'}>Linked artefacts</Box>
            <Box color={'text-body-secondary'} fontSize={'body-s'}>
              Runbook · Continuity plan · Risk register entries (3) · Control owners (2)
            </Box>
          </SpaceBetween>
        </Container>
      </Grid>

      {/* Vulnerabilities + incidents — fitHeight + matching row count keeps
          the two cards at the same height even though item titles differ. */}
      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container fitHeight header={<Header variant={'h2'} description={'Open findings from scenarios and incidents'}>{'Vulnerabilities on this service'}</Header>}>
          <SpaceBetween size={'s'}>
            {[
              { id: 'VLN-009', title: 'Core banking RTO under-tested in eu-west-1 failover', meta: 'Found in SC-2026-01 · Owner P. Hargreaves · ACT-2204', rating: { color: 'light-red', label: 'High' }, due: 'due 14 Jun' },
              { id: 'VLN-018', title: 'IDP step-up MFA not exercised in tabletop', meta: 'Found in SC-2026-01 · Owner P. Hargreaves', rating: { color: 'orange', label: 'Medium' }, due: 'due 28 Jun' },
              { id: 'VLN-022', title: 'Stale runbook for Mambu cell failover', meta: 'Owner P. Hargreaves', rating: { color: 'light-green', label: 'Low' }, due: 'due 12 Jul' },
            ].map((v) => (
              <Box key={v.id} padding={{ vertical: 'xxs' }}>
                <SpaceBetween direction={'horizontal'} size={'m'}>
                  <Box>
                    <Box fontWeight={'bold'}>{v.id} — {v.title}</Box>
                    <Box color={'text-body-secondary'} fontSize={'body-s'}>{v.meta}</Box>
                  </Box>
                  <SpaceBetween direction={'horizontal'} size={'xs'}>
                    <SimpleRatingBadge rating={v.rating} />
                    <Box color={'text-status-inactive'} fontSize={'body-s'}>{v.due}</Box>
                  </SpaceBetween>
                </SpaceBetween>
              </Box>
            ))}
          </SpaceBetween>
        </Container>

        <Container fitHeight header={<Header variant={'h2'} description={'Live events feed back into tolerance calibration'}>{'Recent incidents'}</Header>}>
          <SpaceBetween size={'s'}>
            {[
              { id: 'INC-2026-204', title: 'DNS resolver flap (Cloudflare)', meta: '11 Apr · 18 min · within tolerance' },
              { id: 'INC-2026-117', title: 'Aurora failover slower than RTO', meta: '22 Feb · 12 min · within tolerance, but RTO exceeded' },
              { id: 'INC-2026-038', title: 'OB Gateway 5xx spike', meta: '14 Jan · 6 min · within tolerance' },
            ].map((i) => (
              <Box key={i.id} padding={{ vertical: 'xxs' }}>
                <SpaceBetween direction={'horizontal'} size={'m'}>
                  <Box>
                    <Box fontWeight={'bold'}>{i.id} · {i.title}</Box>
                    <Box color={'text-body-secondary'} fontSize={'body-s'}>{i.meta}</Box>
                  </Box>
                  <SimpleRatingBadge rating={{ color: 'light-green', label: 'Resolved' }} />
                </SpaceBetween>
              </Box>
            ))}
          </SpaceBetween>
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

// Inline SVG dependency-map — no production graph organism exists. Same
// inline pattern Scheduler.stories.tsx uses for its month-view calendar.
// Sized with generous whitespace so the 6-node layers don't crowd. Layer
// labels get their own 32px gutter; nodes get min 20px horizontal gap.
const DependencyMap = ({ selectedNode, onSelect }: { selectedNode: string; onSelect: (id: string) => void }) => {
  const W = 1400;
  const H = 720;
  const mT = 60;
  const mB = 40;
  const mL = 160; // left margin so layer labels never overlap nodes
  const yStep = (H - mT - mB) / (GRAPH.layers.length - 1);
  const innerW = W - mL - 40;
  const pos: Record<string, { x: number; y: number }> = {};

  return (
    <div style={{ width: '100%', height: H, background: '#FFFFFF', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={'xMidYMid meet'} width={'100%'} height={'100%'}>
        {GRAPH.layers.map((layer, li) => {
          const y = mT + yStep * li;
          const spacing = innerW / (layer.nodes.length + 1);
          return (
            <g key={layer.label}>
              {/* layer label — sits in the left gutter, vertically centred to its row */}
              <text x={16} y={y + 4} fontFamily={'Sora'} fontSize={11} fontWeight={700} fill={'#5F6B7A'} letterSpacing={0.6}>
                {layer.label.toUpperCase()}
              </text>
              {/* faint guide line per layer */}
              <line x1={mL - 16} x2={W - 16} y1={y} y2={y} stroke={'#F2F2F6'} strokeWidth={1} strokeDasharray={'3 4'} />
              {layer.nodes.map((n, ni) => {
                const x = mL + spacing * (ni + 1);
                pos[n.id] = { x, y };
                return null;
              })}
            </g>
          );
        })}
        {/* edges (drawn before nodes so nodes overlap) */}
        {GRAPH.edges.map(([a, b]) => {
          // populate pos by re-running the math
          let pa: { x: number; y: number } | null = null;
          let pb: { x: number; y: number } | null = null;
          GRAPH.layers.forEach((layer, li) => {
            const y = mT + yStep * li;
            const spacing = innerW / (layer.nodes.length + 1);
            layer.nodes.forEach((n, ni) => {
              const x = mL + spacing * (ni + 1);
              if (n.id === a) pa = { x, y };
              if (n.id === b) pb = { x, y };
            });
          });
          if (!pa || !pb) return null;
          const hi = selectedNode === a || selectedNode === b;
          const path = `M ${pa.x} ${pa.y + 24} C ${pa.x} ${pa.y + 24 + yStep * 0.3} ${pb.x} ${pb.y - 24 - yStep * 0.3} ${pb.x} ${pb.y - 24}`;
          return <path key={`${a}-${b}`} d={path} fill={'none'} stroke={hi ? '#41D9CC' : '#D0D0D9'} strokeWidth={hi ? 2.4 : 1.2} />;
        })}
        {/* nodes */}
        {GRAPH.layers.flatMap((layer, li) => {
          const y = mT + yStep * li;
          const spacing = innerW / (layer.nodes.length + 1);
          return layer.nodes.map((n, ni) => {
            const x = mL + spacing * (ni + 1);
            const isIBS = n.id === 'ibs';
            const isVendor = n.type === 'vendor';
            const fill = isIBS ? '#EBFBFA' : isVendor ? '#14143A' : '#FFFFFF';
            const text = isVendor ? '#FFFFFF' : '#14143A';
            const sub = isVendor ? '#B9B9C6' : '#5F6B7A';
            const baseStroke = isIBS ? '#41D9CC' : isVendor ? '#14143A' : '#D0D0D9';
            const sw = isIBS ? 2 : 1.5;
            const selected = selectedNode === n.id;
            return (
              <g key={n.id} transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={() => onSelect(n.id)}>
                <rect x={-n.w / 2} y={-n.h / 2} width={n.w} height={n.h} rx={8} fill={fill} stroke={selected ? '#41D9CC' : baseStroke} strokeWidth={selected ? 2.5 : sw} />
                <text textAnchor={'middle'} y={-4} fontFamily={'Sora'} fontSize={12} fontWeight={700} fill={text}>{n.label}</text>
                <text textAnchor={'middle'} y={12} fontFamily={'Sora'} fontSize={10} fontWeight={500} fill={sub}>{n.sub}</text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
};

// IBSDetailPage — uses route params + navigate so it works both standalone
// (story IBSDetail below) and as a destination inside the FullPrototype router.
// Back navigation is provided by the breadcrumb in the global header — a
// "Back to register" button on the page itself would be redundant.
const IBSDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ibs = IBS_DATA.find((i) => i.id === id) ?? IBS_DATA.find((i) => i.id === 'ob')!;
  return (
    <PageLayout
      title={ibs.Name}
      description={`Customer-facing service · Mapped to ${ibs.Regimes.join(', ')}`}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ActionsButton
            buttonText={'Actions'}
            items={[
              { id: 'mapping', text: 'Open mapping editor', onItemClick: () => {} },
              { id: 'run-scenario', text: 'Run scenario', onItemClick: () => navigate('/opres/scenarios/create') },
              { id: 'export', text: 'Export evidence pack…', onItemClick: () => {} },
              { id: 'archive', text: 'Archive service', onItemClick: () => {} },
            ]}
          />
          <Button variant={'primary'} onClick={() => navigate(`/opres/ibs/${ibs.id}/attest`)}>{'Submit attestation'}</Button>
        </SpaceBetween>
      }
    >
      <IBSDetailContent ibs={ibs} />
    </PageLayout>
  );
};

export const IBSDetail: Story = {
  name: 'IBS detail (with dependency map)',
  render: () => (
    <RealProviders initialPath={`/opres/ibs/ob`}>
      <IBSDetailPage />
    </RealProviders>
  ),
};

// ═══════════════════════════════════════════════════════════════════════
//  STORY 3 — Scenarios & Self-assessments
// ═══════════════════════════════════════════════════════════════════════

const SCENARIO_FILTERING_PROPERTIES = [
  { propertyLabel: 'Name', key: 'Name', groupValuesLabel: 'Names', operators: [':', '!:', '=', '!='] as Array<':' | '!:' | '=' | '!='> },
  { propertyLabel: 'Type', key: 'Type', groupValuesLabel: 'Types', operators: ['=', '!='] as Array<'=' | '!='> },
  { propertyLabel: 'Affected IBS', key: 'IBS', groupValuesLabel: 'IBS', operators: [':', '!:'] as Array<':' | '!:'> },
];

const SCENARIO_COLUMNS = [
  {
    id: 'Name',
    header: 'Scenario',
    sortingField: 'Name',
    cell: (item: ScenarioRow) => (
      <Box>
        <a href={'#'} style={{ color: '#0972d3', textDecoration: 'none', fontWeight: 600 }}>{item.Name}</a>
        <Box color={'text-status-inactive'} fontSize={'body-s'}>{item.id}</Box>
      </Box>
    ),
    isRowHeader: true,
    minWidth: 260,
  },
  {
    id: 'Type',
    header: 'Type',
    sortingField: 'Type',
    cell: (item: ScenarioRow) => {
      const ratingMap = {
        Cyber: { color: 'light-red', label: 'Cyber' },
        'Third-party failure': { color: 'orange', label: 'Third-party failure' },
        Facility: { color: 'orange', label: 'Facility' },
        People: { color: 'light-grey', label: 'People' },
      } as const;
      return <SimpleRatingBadge rating={ratingMap[item.Type]} />;
    },
    minWidth: 130,
  },
  { id: 'IBS', header: 'Affected IBS', cell: (item: ScenarioRow) => item.IBS, minWidth: 240 },
  { id: 'Ran', header: 'Run', sortingField: 'Ran', cell: (item: ScenarioRow) => item.Ran, minWidth: 110 },
  { id: 'Duration', header: 'Duration', cell: (item: ScenarioRow) => item.Duration, minWidth: 100 },
  { id: 'Tolerance', header: 'Tolerance', cell: (item: ScenarioRow) => <Box fontWeight={'bold'}>{item.Tolerance}</Box>, minWidth: 110 },
  {
    id: 'Result',
    header: 'Result',
    cell: (item: ScenarioRow) => (
      <SpaceBetween size={'xxs'}>
        <SimpleRatingBadge rating={item.Result} />
        <Box color={'text-body-secondary'} fontSize={'body-s'}>{item.BreachBy}</Box>
      </SpaceBetween>
    ),
    minWidth: 200,
  },
  {
    id: 'Findings',
    header: 'Findings',
    sortingField: 'Findings',
    cell: (item: ScenarioRow) => (
      <Box fontWeight={'bold'} color={item.Findings >= 5 ? 'text-status-error' : item.Findings >= 3 ? 'text-status-warning' : 'text-body-secondary'}>
        {item.Findings}
      </Box>
    ),
    minWidth: 100,
  },
  { id: 'Leader', header: 'Lead', cell: (item: ScenarioRow) => <BadgeList badges={[item.Leader]} />, minWidth: 130 },
];

const ScenarioTabContent = () => {
  const collection = useCollection(SCENARIOS, {
    propertyFiltering: { filteringProperties: SCENARIO_FILTERING_PROPERTIES, empty: <span>{'No matches'}</span> },
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
  const { items, propertyFilterProps, paginationProps, collectionProps } = collection;
  const breaches = SCENARIOS.filter((s) => s.Result.label === 'Tolerance breach').length;

  return (
    <SpaceBetween size={'l'}>
      <RibbonRow items={[
        { title: 'Scenarios YTD', value: SCENARIOS.length, tone: 'total' },
        { title: 'Breaches', value: breaches },
        { title: 'Passing', value: SCENARIOS.length - breaches },
        { title: 'Findings open', value: 14 },
        { title: 'Avg time-to-close', value: '42d', tone: 'total' },
        { title: 'Coverage of IBS', value: '8/8' },
      ]} />

      <Table
        {...collectionProps}
        columnDefinitions={SCENARIO_COLUMNS as any}
        items={items}
        trackBy={'id'}
        filter={
          <PropertyFilterPanel
            {...propertyFilterProps}
            countText={`${items.length} matches`}
            filteringPlaceholder={'Filter scenarios'}
            virtualScroll
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container fitHeight header={<Header variant={'h2'} description={'Wire-transfer tolerance breached by 22 min — remediation underway'}>{'SC-2026-02 · Identity provider outage'}</Header>}>
          <SpaceBetween size={'xs'}>
            {[
              { t: 'T+00:00', msg: 'Scenario initiated. Simulated Okta eu-west outage; failover to break-glass path triggered.', r: { color: 'light-grey', label: 'Setup' } },
              { t: 'T+00:08', msg: 'Customer auth failures spike to 78%. Comms triggered to customer-ops bridge.', r: { color: 'orange', label: 'Degraded' } },
              { t: 'T+00:42', msg: 'Step-up MFA recovered for online banking and mobile.', r: { color: 'orange', label: 'Partial' } },
              { t: 'T+03:50', msg: 'Wire transfers still impacted — SMS-OTP fallback unavailable (Twilio EU concurrently degraded).', r: { color: 'dark-red', label: 'Outside' } },
              { t: 'T+04:22', msg: 'Service restored. Tolerance exceeded by 22 min on wire transfers.', r: { color: 'light-green', label: 'Resolved' } },
            ].map((row) => (
              <Grid key={row.t} gridDefinition={[{ colspan: 2 }, { colspan: 8 }, { colspan: 2 }]}>
                <Box fontWeight={'bold'} color={'text-body-secondary'} fontSize={'body-s'}>{row.t}</Box>
                <Box>{row.msg}</Box>
                <SimpleRatingBadge rating={row.r} />
              </Grid>
            ))}
          </SpaceBetween>
        </Container>

        <Container fitHeight header={<Header variant={'h2'} description={'All findings traced to vulnerabilities with named owners'}>{'Lessons & remediation'}</Header>}>
          <SpaceBetween size={'s'}>
            {[
              { title: 'Retire SMS-OTP as MFA fallback', meta: 'VLN-014 · A. Mensah · ACT-2208', r: { color: 'orange', label: 'In progress' }, due: 'due 30 May' },
              { title: 'Add Cloudflare Access as second IDP path', meta: 'VLN-016 · Identity · ACT-2211', r: { color: 'orange', label: 'Open' }, due: 'due 21 Jul' },
              { title: 'Update wire-transfers BCP communication script', meta: 'VLN-017 · Comms · ACT-2212', r: { color: 'light-green', label: 'Closed' }, due: '22 Apr' },
              { title: 'Refresh BCP exercise playbook for FY27', meta: 'VLN-024 · BCM · ACT-2218', r: { color: 'orange', label: 'Open' }, due: 'due 30 Jun' },
              { title: 'Re-baseline severe-but-plausible cyber scenarios', meta: 'VLN-019 · Risk & Resilience', r: { color: 'orange', label: 'Open' }, due: 'due 12 Aug' },
            ].map((l, idx) => (
              <Box key={idx} padding={{ vertical: 'xxs' }}>
                <SpaceBetween direction={'horizontal'} size={'m'}>
                  <Box>
                    <Box fontWeight={'bold'}>{l.title}</Box>
                    <Box color={'text-body-secondary'} fontSize={'body-s'}>{l.meta}</Box>
                  </Box>
                  <SpaceBetween direction={'horizontal'} size={'xs'}>
                    <SimpleRatingBadge rating={l.r} />
                    <Box color={'text-status-inactive'} fontSize={'body-s'}>{l.due}</Box>
                  </SpaceBetween>
                </SpaceBetween>
              </Box>
            ))}
          </SpaceBetween>
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

const AttestTabContent = () => {
  const done = ATTESTATIONS.filter((a) => a.status.label === 'Approved').length;
  return (
    <SpaceBetween size={'l'}>
      <RibbonRow items={[
        { title: 'Cycle', value: 'FY26', tone: 'total' },
        { title: 'Approved', value: done },
        { title: 'In progress', value: ATTESTATIONS.filter((a) => a.status.label === 'In progress').length },
        { title: 'In review', value: ATTESTATIONS.filter((a) => a.status.label === 'In review').length },
        { title: 'Not started', value: ATTESTATIONS.filter((a) => a.status.label === 'Not started').length },
        { title: 'Board pack', value: '14 Jun', tone: 'total' },
      ]} />

      {/* Attestation grid — three columns × two rows of identical cards.
          fitHeight stretches all cards to the same row height; uniform
          internal layout means every card has the same visual rhythm. */}
      <Grid gridDefinition={ATTESTATIONS.map(() => ({ colspan: 4 }))}>
        {ATTESTATIONS.map((a) => (
          <Container
            key={a.ibs}
            fitHeight
            header={
              <Header
                variant={'h3'}
                actions={<SimpleRatingBadge rating={a.status} />}
                description={`${a.owner} · ${a.cycle}`}
              >
                {a.ibs}
              </Header>
            }
            footer={<Button>{'Open attestation'}</Button>}
          >
            <SpaceBetween size={'s'}>
              <ProgressBar value={a.progress} additionalInfo={`${a.progress}% complete`} />
              <Box color={'text-body-secondary'} fontSize={'body-s'}>
                Auto-evidence linked from live tolerance, mapping &amp; scenarios — nothing retyped.
              </Box>
            </SpaceBetween>
          </Container>
        ))}
      </Grid>
    </SpaceBetween>
  );
};

const ScenariosContent = () => {
  const [tab, setTab] = useState<'scenarios' | 'attest'>('scenarios');
  return (
    <SpaceBetween size={'m'}>
      {/* atomic-ui ToggleGroup — teal selected (the brand toggle pattern).
          Base UI's ToggleGroup fires onValueChange with the new value, or
          empty string if the user clicks the same active toggle. */}
      <ToggleGroup
        value={[tab]}
        onValueChange={(values) => {
          const next = values[0];
          if (next === 'scenarios' || next === 'attest') setTab(next);
        }}
      >
        <ToggleGroupItem value={'scenarios'}>Scenario tests</ToggleGroupItem>
        <ToggleGroupItem value={'attest'}>Self-assessments</ToggleGroupItem>
      </ToggleGroup>
      {tab === 'scenarios' ? <ScenarioTabContent /> : <AttestTabContent />}
    </SpaceBetween>
  );
};

const ScenariosPage = () => {
  const navigate = useNavigate();
  return (
    <PageLayout
      title={'Scenarios & self-assessments'}
      description={
        'Tests that prove the firm stays inside its impact tolerances, plus the annual attestation that says so to the board.'
      }
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button iconAlign={'left'} iconSvg={plusIcon} variant={'primary'} onClick={() => navigate('/opres/scenarios/create')}>{'New scenario'}</Button>
        </SpaceBetween>
      }
    >
      <ScenariosContent />
    </PageLayout>
  );
};

export const ScenariosSelfAssessment: Story = {
  name: 'Scenarios & self-assessments',
  render: () => (
    <RealProviders initialPath={'/opres/scenarios'}>
      <ScenariosPage />
    </RealProviders>
  ),
};

// ═══════════════════════════════════════════════════════════════════════
//  STORY 4 — Full prototype (click-through, URL-driven)
//
//  Single story that switches between the three views based on the current
//  URL. Clicking the left-nav "Operational resilience > …" links navigates
//  between pages — same UX as the production app.
// ═══════════════════════════════════════════════════════════════════════

const VulnerabilitiesPage = () => (
  <PageLayout
    title={'Vulnerabilities'}
    counter={'(23)'}
    description={
      'Findings from scenario tests, incidents, and self-assessments. Each links back to a service and a remediation action.'
    }
  >
    <Container>
      <Box color={'text-body-secondary'}>Full vulnerabilities register — backlogged for the next sprint. Use the per-service list on the IBS detail page for now.</Box>
    </Container>
  </PageLayout>
);

// Router-aware switch — reads the URL and renders the matching page.
// Production navigation in the left rail navigates via react-router, so
// changes to the URL automatically flip which page is shown here.
// Order matters: more specific paths are matched first.
const OpResRouter = () => {
  const { pathname } = useLocation();
  // Create / attest sub-pages first (most specific)
  if (pathname === '/opres/ibs/create') return <AddIBSPage />;
  if (pathname === '/opres/scenarios/create') return <NewScenarioPage />;
  if (pathname.match(/^\/opres\/ibs\/[^/]+\/attest$/)) return <SubmitAttestationPage />;
  // Then list / detail pages
  if (pathname.startsWith('/opres/scenarios')) return <ScenariosPage />;
  if (pathname.startsWith('/opres/vulnerabilities')) return <VulnerabilitiesPage />;
  if (pathname.match(/^\/opres\/ibs\/[^/]+$/)) return <IBSDetailPage />;
  return <IBSRegisterPage />;
};

export const FullPrototype: Story = {
  name: 'Full prototype (click-through)',
  parameters: {
    docs: {
      description: {
        story:
          'Click-through prototype. Use the left nav under "Operational resilience" to switch between Important Business Services, Scenarios & self-assessments, and Vulnerabilities. From the IBS register, click any service name to open the detail page with the dependency map.',
      },
    },
  },
  render: () => (
    <RealProviders initialPath={'/opres/ibs'}>
      <OpResRouter />
    </RealProviders>
  ),
};
