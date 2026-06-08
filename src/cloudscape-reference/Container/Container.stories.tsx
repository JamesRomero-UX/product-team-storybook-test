import type { Meta, StoryObj } from '@storybook/react-vite';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Container',
  component: Container,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Container rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Body of the container.' } };
export const WithHeader: Story = {
  render: () => (<Container header={<Header variant={'h2'}>Container title</Header>}>Body</Container>),
};
export const WithFooter: Story = {
  render: () => (<Container header={<Header variant={'h2'}>Title</Header>} footer={'Footer'}>Body</Container>),
};
