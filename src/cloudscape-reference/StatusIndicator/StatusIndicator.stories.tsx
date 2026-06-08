import type { Meta, StoryObj } from '@storybook/react-vite';
import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/StatusIndicator',
  component: StatusIndicator,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape StatusIndicator rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof StatusIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Operational' } };
export const Types: Story = {
  render: () => (
    <SpaceBetween size={'xs'}>
      <StatusIndicator type={'success'}>Success</StatusIndicator>
      <StatusIndicator type={'warning'}>Warning</StatusIndicator>
      <StatusIndicator type={'error'}>Error</StatusIndicator>
      <StatusIndicator type={'info'}>Info</StatusIndicator>
      <StatusIndicator type={'pending'}>Pending</StatusIndicator>
      <StatusIndicator type={'in-progress'}>In progress</StatusIndicator>
      <StatusIndicator type={'stopped'}>Stopped</StatusIndicator>
      <StatusIndicator type={'loading'}>Loading</StatusIndicator>
    </SpaceBetween>
  ),
};
