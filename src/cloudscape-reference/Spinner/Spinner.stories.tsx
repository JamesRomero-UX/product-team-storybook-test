import type { Meta, StoryObj } from '@storybook/react-vite';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Spinner',
  component: Spinner,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Spinner rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Sizes: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Spinner size={'normal'} />
      <Spinner size={'big'} />
      <Spinner size={'large'} />
    </SpaceBetween>
  ),
};
