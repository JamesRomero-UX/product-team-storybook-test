import type { Meta, StoryObj } from '@storybook/react-vite';
import LineChart from '@risk-smart/themed-cloudscape-components/line-chart';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/LineChart',
  component: LineChart,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape LineChart rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof LineChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LineChart series={[
    { title: 'Open risks', type: 'line', data: [
      { x: new Date(2026, 0, 1), y: 12 }, { x: new Date(2026, 1, 1), y: 19 },
      { x: new Date(2026, 2, 1), y: 15 }, { x: new Date(2026, 3, 1), y: 22 },
    ] },
  ]} xDomain={[new Date(2026, 0, 1), new Date(2026, 3, 1)]} yDomain={[0, 30]}
    xTitle={'Month'} yTitle={'Count'} ariaLabel={'Open risks over time'} />,
};
