import type { Meta, StoryObj } from '@storybook/react-vite';
import BarChart from '@risk-smart/themed-cloudscape-components/bar-chart';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/BarChart',
  component: BarChart,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape BarChart rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof BarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <BarChart series={[
    { title: 'Critical', type: 'bar', data: [{ x: 'Q1', y: 4 }, { x: 'Q2', y: 6 }, { x: 'Q3', y: 3 }, { x: 'Q4', y: 7 }] },
    { title: 'High', type: 'bar', data: [{ x: 'Q1', y: 8 }, { x: 'Q2', y: 12 }, { x: 'Q3', y: 9 }, { x: 'Q4', y: 14 }] },
  ]} xDomain={['Q1', 'Q2', 'Q3', 'Q4']} yDomain={[0, 20]} xTitle={'Quarter'} yTitle={'Count'}
    ariaLabel={'Risks by quarter'} stackedBars />,
};
