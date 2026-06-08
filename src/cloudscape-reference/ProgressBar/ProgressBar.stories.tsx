import type { Meta, StoryObj } from '@storybook/react-vite';
import ProgressBar from '@risk-smart/themed-cloudscape-components/progress-bar';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/ProgressBar',
  component: ProgressBar,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape ProgressBar rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: 60, label: 'Loading' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <ProgressBar value={20} label={'20%'} />
      <ProgressBar value={50} label={'50%'} />
      <ProgressBar value={100} label={'Complete'} status={'success'} resultText={'Done'} />
      <ProgressBar value={75} label={'In progress'} additionalInfo={'7.5 of 10 GB'} />
    </SpaceBetween>
  ),
};
