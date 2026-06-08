import type { Meta, StoryObj } from '@storybook/react-vite';
import MixedLineBarChart from '@risk-smart/themed-cloudscape-components/mixed-line-bar-chart';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/MixedLineBarChart',
  component: MixedLineBarChart,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape MixedLineBarChart rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof MixedLineBarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <MixedLineBarChart series={[
    { title: 'Open', type: 'bar', data: [{ x: 'Jan', y: 12 }, { x: 'Feb', y: 19 }, { x: 'Mar', y: 15 }, { x: 'Apr', y: 22 }] },
    { title: 'Trend', type: 'line', data: [{ x: 'Jan', y: 13 }, { x: 'Feb', y: 16 }, { x: 'Mar', y: 17 }, { x: 'Apr', y: 18 }] },
  ]} xDomain={['Jan', 'Feb', 'Mar', 'Apr']} yDomain={[0, 30]} xTitle={'Month'} yTitle={'Count'} ariaLabel={'Risks'} />,
};
