import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Box',
  component: Box,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Box rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Box>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'A flexible Box layout primitive.' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Box variant={'h1'}>H1 heading</Box>
      <Box variant={'h2'}>H2 heading</Box>
      <Box variant={'p'}>Paragraph text</Box>
      <Box variant={'small'}>Small text</Box>
      <Box variant={'code'}>{'code({})'}</Box>
    </SpaceBetween>
  ),
};
