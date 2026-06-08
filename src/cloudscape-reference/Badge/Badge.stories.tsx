import type { Meta, StoryObj } from '@storybook/react-vite';
import Badge from '@risk-smart/themed-cloudscape-components/badge';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Badge',
  component: Badge,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Badge rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'New' } };
export const Colors: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Badge>Default</Badge>
      <Badge color={'blue'}>Blue</Badge>
      <Badge color={'green'}>Green</Badge>
      <Badge color={'red'}>Red</Badge>
      <Badge color={'grey'}>Grey</Badge>
    </SpaceBetween>
  ),
};
