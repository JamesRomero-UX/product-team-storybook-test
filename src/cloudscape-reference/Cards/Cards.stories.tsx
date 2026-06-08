import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Link from '@risk-smart/themed-cloudscape-components/link';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Cards',
  component: Cards,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Cards rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Cards>;

export default meta;

type Story = StoryObj<typeof meta>;

type Risk = { id: string; name: string; severity: string; owner: string; description: string };
const ITEMS: Risk[] = [
  { id: 'R-001', name: 'Data breach via misconfigured S3', severity: 'Critical', owner: 'Sarah Chen', description: 'Public-read ACL on a customer-data bucket.' },
  { id: 'R-002', name: 'Vendor SLA non-compliance', severity: 'High', owner: 'Tom Patel', description: 'Two key vendors missed uptime SLAs.' },
  { id: 'R-003', name: 'Phishing susceptibility', severity: 'Medium', owner: 'Liam Nguyen', description: 'Sim shows ~14% click-through.' },
  { id: 'R-004', name: 'Office access card duplication', severity: 'Low', owner: 'Ava Rodriguez', description: 'Legacy badge tech.' },
];
const def = {
  header: (i: Risk) => <Link fontSize={'heading-m'} href={'#'}>{i.name}</Link>,
  sections: [
    { id: 'severity', header: 'Severity', content: (i: Risk) => i.severity },
    { id: 'owner', header: 'Owner', content: (i: Risk) => i.owner },
    { id: 'description', header: 'Description', content: (i: Risk) => i.description },
  ],
};
export const Default: Story = {
  render: () => <Cards cardDefinition={def} items={ITEMS} header={<Header counter={`(${ITEMS.length})`}>Risks</Header>} cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }]} />,
};
export const Empty: Story = {
  render: () => <Cards cardDefinition={def} items={[]} header={<Header>Risks</Header>}
    empty={<Box textAlign={'center'} color={'inherit'}><SpaceBetween size={'xs'}><b>No risks</b><Button>Create</Button></SpaceBetween></Box>} />,
};
