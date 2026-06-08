import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risk-smart/themed-cloudscape-components/table';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Table',
  component: Table,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Table rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

type Risk = { id: string; name: string; severity: string; owner: string; status: string };
const ITEMS: Risk[] = [
  { id: 'R-001', name: 'Data breach via S3', severity: 'Critical', owner: 'Sarah Chen', status: 'Open' },
  { id: 'R-002', name: 'Vendor SLA miss', severity: 'High', owner: 'Tom Patel', status: 'In review' },
  { id: 'R-003', name: 'Phishing susceptibility', severity: 'Medium', owner: 'Liam Nguyen', status: 'Open' },
  { id: 'R-004', name: 'Badge duplication', severity: 'Low', owner: 'Ava Rodriguez', status: 'Mitigated' },
];
const COLS = [
  { id: 'id', header: 'ID', cell: (i: Risk) => i.id, isRowHeader: true },
  { id: 'name', header: 'Name', cell: (i: Risk) => i.name },
  { id: 'severity', header: 'Severity', cell: (i: Risk) => i.severity },
  { id: 'owner', header: 'Owner', cell: (i: Risk) => i.owner },
  { id: 'status', header: 'Status', cell: (i: Risk) => i.status },
];
export const Default: Story = {
  render: () => <Table columnDefinitions={COLS} items={ITEMS} header={<Header counter={`(${ITEMS.length})`}>Risks</Header>} />,
};
export const WithSelection: Story = {
  render: () => {
    const [sel, setSel] = useState<Risk[]>([]);
    return <Table columnDefinitions={COLS} items={ITEMS} selectedItems={sel}
      onSelectionChange={({ detail }) => setSel(detail.selectedItems)} selectionType={'multi'}
      header={<Header counter={sel.length ? `(${sel.length}/${ITEMS.length})` : `(${ITEMS.length})`}
        actions={<SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button disabled={!sel.length}>Archive</Button>
          <Button variant={'primary'}>Create</Button>
        </SpaceBetween>}>Risks</Header>} />;
  },
};
export const Empty: Story = {
  render: () => <Table columnDefinitions={COLS} items={[]} header={<Header>Risks</Header>}
    empty={<Box textAlign={'center'} color={'inherit'}><SpaceBetween size={'xs'}><b>No risks</b><Button>Create</Button></SpaceBetween></Box>} />,
};
export const Loading: Story = {
  render: () => <Table columnDefinitions={COLS} items={[]} loading loadingText={'Loading…'} header={<Header>Risks</Header>} />,
};
