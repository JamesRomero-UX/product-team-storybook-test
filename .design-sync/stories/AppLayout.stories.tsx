// Reference page templates for the RiskSmart app shell. Pure Cloudscape
// composition (no app providers/data) so they render + verify cleanly.
// These are REFERENCE layouts the design agent should start from:
//   • Page Shell — the empty frame
//   • Table Page — any list/register/table view
//   • Form Page  — any create/edit/settings form
// Added by design-sync; see conventions.md for the routing rules.
import type { Meta, StoryObj } from '@storybook/react-vite';
import AppLayout from '@risk-smart/themed-cloudscape-components/app-layout';
import SideNavigation from '@risk-smart/themed-cloudscape-components/side-navigation';
import BreadcrumbGroup from '@risk-smart/themed-cloudscape-components/breadcrumb-group';
import ContentLayout from '@risk-smart/themed-cloudscape-components/content-layout';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import KeyValuePairs from '@risk-smart/themed-cloudscape-components/key-value-pairs';
import Table from '@risk-smart/themed-cloudscape-components/table';
import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import Form from '@risk-smart/themed-cloudscape-components/form';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Select from '@risk-smart/themed-cloudscape-components/select';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';

const NAV_ITEMS = [
  { type: 'link', text: 'Home', href: '#/' },
  { type: 'divider' },
  { type: 'section', text: 'Risk management', items: [
    { type: 'link', text: 'Risk register', href: '#/risks' },
    { type: 'link', text: 'Controls', href: '#/controls' },
    { type: 'link', text: 'Assessments', href: '#/assessments' },
  ] },
  { type: 'section', text: 'Compliance', items: [
    { type: 'link', text: 'Policies', href: '#/policies' },
    { type: 'link', text: 'Obligations', href: '#/obligations' },
  ] },
  { type: 'divider' },
  { type: 'link', text: 'Settings', href: '#/settings' },
] as any;

const Nav = () => (
  <SideNavigation activeHref="#/risks" header={{ href: '#/', text: 'RiskSmart' }} items={NAV_ITEMS} />
);
const crumbs = (leaf: string) => (
  <BreadcrumbGroup items={[{ text: 'Home', href: '#/' }, { text: 'Risk register', href: '#/risks' }, { text: leaf, href: '#' }]} />
);

const meta = {
  title: 'Cloudscape Reference/AppLayout',
  component: AppLayout as any,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<any>;
export default meta;
type Story = StoryObj<typeof meta>;

// The empty app frame — start here for any full screen.
export const PageShell: Story = {
  render: () => (
    <AppLayout navigationOpen toolsHide contentType="default" breadcrumbs={crumbs('R-001')} navigation={<Nav />}
      content={
        <ContentLayout header={<Header variant="h1" description="Manage and track your organisation's risks">Risk register</Header>}>
          <Container header={<Header variant="h2">Summary</Header>}>
            <KeyValuePairs columns={4} items={[
              { label: 'Total risks', value: '128' }, { label: 'Critical', value: '6' },
              { label: 'Overdue reviews', value: '11' }, { label: 'Open actions', value: '43' },
            ]} />
          </Container>
        </ContentLayout>
      } />
  ),
};

// TABLE PAGE — use for any list / register / table view.
export const TablePage: Story = {
  render: () => (
    <AppLayout navigationOpen toolsHide contentType="table" breadcrumbs={crumbs('Risks')} navigation={<Nav />}
      content={
        <Table
          variant="full-page"
          columnDefinitions={[
            { id: 'id', header: 'ID', cell: (i: any) => i.id },
            { id: 'name', header: 'Risk', cell: (i: any) => i.name },
            { id: 'severity', header: 'Severity', cell: (i: any) => <StatusIndicator type={i.sevType}>{i.sev}</StatusIndicator> },
            { id: 'owner', header: 'Owner', cell: (i: any) => i.owner },
            { id: 'status', header: 'Status', cell: (i: any) => <StatusIndicator type={i.statusType}>{i.status}</StatusIndicator> },
          ]}
          items={[
            { id: 'R-001', name: 'Unpatched auth service', sev: 'Critical', sevType: 'error', owner: 'A. Chen', status: 'Open', statusType: 'warning' },
            { id: 'R-002', name: 'Vendor data processing gap', sev: 'High', sevType: 'warning', owner: 'M. Okafor', status: 'In review', statusType: 'in-progress' },
            { id: 'R-003', name: 'Backup retention shortfall', sev: 'Medium', sevType: 'info', owner: 'S. Patel', status: 'Mitigated', statusType: 'success' },
          ]}
          header={
            <Header counter="(128)" description="All risks across the organisation"
              actions={<SpaceBetween direction="horizontal" size="xs"><Button>Export</Button><Button variant="primary">Create risk</Button></SpaceBetween>}>
              Risks
            </Header>
          }
          pagination={<Pagination currentPageIndex={1} pagesCount={12} />}
        />
      } />
  ),
};

// FORM PAGE — use for any create / edit / settings form.
export const FormPage: Story = {
  render: () => (
    <AppLayout navigationOpen toolsHide contentType="form" breadcrumbs={crumbs('Create risk')} navigation={<Nav />}
      content={
        <ContentLayout header={<Header variant="h1" description="Log a new risk against the register">Create risk</Header>}>
          <Form actions={<SpaceBetween direction="horizontal" size="xs"><Button variant="link">Cancel</Button><Button variant="primary">Submit risk</Button></SpaceBetween>}>
            <Container header={<Header variant="h2">Risk details</Header>}>
              <SpaceBetween size="l">
                <FormField label="Risk name" description="A short, unique title">
                  <Input value="Unpatched auth service" onChange={() => {}} />
                </FormField>
                <FormField label="Severity">
                  <Select selectedOption={{ label: 'High', value: 'high' }} onChange={() => {}}
                    options={[{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' }]} />
                </FormField>
                <FormField label="Description" description="What is the risk and its impact?">
                  <Textarea value="Auth service is running an outdated dependency with a known CVE. Exploitable from the public internet." onChange={() => {}} rows={4} />
                </FormField>
              </SpaceBetween>
            </Container>
          </Form>
        </ContentLayout>
      } />
  ),
};
