import type { Meta, StoryObj } from '@storybook/react-vite';
import PieChart from '@risk-smart/themed-cloudscape-components/pie-chart';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/PieChart',
  component: PieChart,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape PieChart rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof PieChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PieChart data={[
    { title: 'Critical', value: 4 }, { title: 'High', value: 12 }, { title: 'Medium', value: 18 }, { title: 'Low', value: 22 },
  ]} ariaLabel={'Risks by severity'} hideFilter />,
};
