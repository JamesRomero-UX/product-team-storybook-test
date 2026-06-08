import type { Meta, StoryObj } from '@storybook/react-vite';
import Tiles from '@risk-smart/themed-cloudscape-components/tiles';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Tiles',
  component: Tiles,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Tiles rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Tiles>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('a');
  return <Tiles value={v} onChange={({ detail }) => setV(detail.value)} items={[
    { value: 'a', label: 'Option A', description: 'Best for most users' },
    { value: 'b', label: 'Option B', description: 'Power user mode' },
    { value: 'c', label: 'Option C', description: 'Read-only access' },
  ]} />;
};
export const Default: Story = { render: () => <Controlled /> };
