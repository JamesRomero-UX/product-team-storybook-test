import type { Meta, StoryObj } from '@storybook/react-vite';
import KeyValuePairs from '@risk-smart/themed-cloudscape-components/key-value-pairs';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/KeyValuePairs',
  component: KeyValuePairs,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape KeyValuePairs rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof KeyValuePairs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <KeyValuePairs columns={3} items={[
      { label: 'Status', value: 'Open' },
      { label: 'Severity', value: 'High' },
      { label: 'Owner', value: 'Sarah Chen' },
      { label: 'Created', value: '2026-01-12' },
      { label: 'Updated', value: 'Today' },
      { label: 'Reviewer', value: 'Tom Patel' },
    ]} />
  ),
};
