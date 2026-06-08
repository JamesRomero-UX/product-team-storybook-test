import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/SpaceBetween',
  component: SpaceBetween,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape SpaceBetween rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof SpaceBetween>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SpaceBetween size={'m'}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </SpaceBetween>
  ),
};
export const Horizontal: Story = {
  render: () => (
    <SpaceBetween size={'m'} direction={'horizontal'}>
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </SpaceBetween>
  ),
};
