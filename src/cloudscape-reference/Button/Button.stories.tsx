import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Button',
  component: Button,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Button rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Click me' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Button variant={'primary'}>Primary</Button>
      <Button variant={'normal'}>Normal</Button>
      <Button variant={'link'}>Link</Button>
      <Button variant={'icon'} iconName={'settings'} ariaLabel={'Settings'} />
    </SpaceBetween>
  ),
};
export const States: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Button>Default</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
    </SpaceBetween>
  ),
};
