import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import ColumnLayout from '@risk-smart/themed-cloudscape-components/column-layout';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/ColumnLayout',
  component: ColumnLayout,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape ColumnLayout rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof ColumnLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ColumnLayout columns={3} variant={'text-grid'}>
      <div><Box variant={'awsui-key-label'}>Status</Box>Active</div>
      <div><Box variant={'awsui-key-label'}>Owner</Box>Sarah Chen</div>
      <div><Box variant={'awsui-key-label'}>Updated</Box>Today</div>
    </ColumnLayout>
  ),
};
