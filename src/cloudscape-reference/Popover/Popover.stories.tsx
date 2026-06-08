import type { Meta, StoryObj } from '@storybook/react-vite';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Popover',
  component: Popover,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Popover rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Popover header={'Tooltip'} content={<StatusIndicator type={'info'}>Hover content</StatusIndicator>}>Hover or click me</Popover>,
};
