import type { Meta, StoryObj } from '@storybook/react-vite';
import Icon from '@risk-smart/themed-cloudscape-components/icon';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Icon',
  component: Icon,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Icon rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { name: 'settings' } };
export const Common: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Icon name={'settings'} />
      <Icon name={'add-plus'} />
      <Icon name={'close'} />
      <Icon name={'edit'} />
      <Icon name={'check'} />
      <Icon name={'external'} />
      <Icon name={'search'} />
      <Icon name={'status-warning'} />
    </SpaceBetween>
  ),
};
