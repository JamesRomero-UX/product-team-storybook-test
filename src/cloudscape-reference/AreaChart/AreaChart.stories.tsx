import type { Meta, StoryObj } from '@storybook/react-vite';
import AreaChart from '@risk-smart/themed-cloudscape-components/area-chart';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/AreaChart',
  component: AreaChart,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape AreaChart rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof AreaChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AreaChart series={[
    { title: 'Open', type: 'area', data: [
      { x: new Date(2026, 0, 1), y: 12 }, { x: new Date(2026, 1, 1), y: 19 },
      { x: new Date(2026, 2, 1), y: 15 }, { x: new Date(2026, 3, 1), y: 22 },
    ] },
  ]} xDomain={[new Date(2026, 0, 1), new Date(2026, 3, 1)]} yDomain={[0, 30]}
    xTitle={'Month'} yTitle={'Count'} ariaLabel={'Open risks'} />,
};
