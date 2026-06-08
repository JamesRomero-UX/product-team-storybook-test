import type { Meta, StoryObj } from '@storybook/react-vite';
import Flashbar from '@risk-smart/themed-cloudscape-components/flashbar';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Flashbar',
  component: Flashbar,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Flashbar rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Flashbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Flashbar items={[
    { type: 'success', header: 'Saved', content: 'Your changes are saved.', dismissible: true },
    { type: 'warning', header: 'Heads up', content: 'Some checks pending.', dismissible: true },
    { type: 'error', header: 'Failed', content: 'Could not save.', dismissible: true },
    { type: 'info', header: 'Info', content: 'New version available.', dismissible: true },
  ]} />,
};
