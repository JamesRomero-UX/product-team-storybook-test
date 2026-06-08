import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Header',
  component: Header,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Header rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Page title' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'l'}>
      <Header variant={'h1'}>H1 heading</Header>
      <Header variant={'h2'}>H2 heading</Header>
      <Header variant={'h3'}>H3 heading</Header>
    </SpaceBetween>
  ),
};
export const WithActions: Story = {
  render: () => (
    <Header
      variant={'h1'}
      description={'Manage all risks across the organisation.'}
      counter={'(42)'}
      actions={
        <SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button>Export</Button>
          <Button variant={'primary'}>Create</Button>
        </SpaceBetween>
      }
    >
      Risks
    </Header>
  ),
};
