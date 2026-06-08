import type { Meta, StoryObj } from '@storybook/react-vite';
import SegmentedControl from '@risk-smart/themed-cloudscape-components/segmented-control';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/SegmentedControl',
  component: SegmentedControl,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape SegmentedControl rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState<string | null>('day');
  return <SegmentedControl selectedId={v} onChange={({ detail }) => setV(detail.selectedId)} options={[
    { id: 'day', text: 'Day' }, { id: 'week', text: 'Week' }, { id: 'month', text: 'Month' },
  ]} />;
};
export const Default: Story = { render: () => <Controlled /> };
