import type { Meta, StoryObj } from '@storybook/react-vite';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Alert',
  component: Alert,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Alert rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { header: 'Heads up', children: 'This is an alert.' } };
export const Types: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Alert type={'info'} header={'Info'}>Informational message.</Alert>
      <Alert type={'success'} header={'Success'}>Operation succeeded.</Alert>
      <Alert type={'warning'} header={'Warning'}>Something to watch.</Alert>
      <Alert type={'error'} header={'Error'}>Something went wrong.</Alert>
    </SpaceBetween>
  ),
};
export const Dismissible: Story = { args: { header: 'Dismissible', dismissible: true, children: 'Click X to dismiss.' } };
