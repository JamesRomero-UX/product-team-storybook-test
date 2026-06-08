import type { Meta, StoryObj } from '@storybook/react-vite';
import Steps from '@risk-smart/themed-cloudscape-components/steps';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Steps',
  component: Steps,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Steps rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Steps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Steps steps={[
    { status: 'success', header: 'Validated input', details: 'All checks passed.' },
    { status: 'success', header: 'Created resource', details: 'Resource ARN: …' },
    { status: 'in-progress', header: 'Configuring permissions' },
    { status: 'loading', header: 'Pending', details: 'Waiting on dependency.' },
  ]} />,
};
