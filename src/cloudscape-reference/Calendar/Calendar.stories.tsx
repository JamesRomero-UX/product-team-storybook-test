import type { Meta, StoryObj } from '@storybook/react-vite';
import Calendar from '@risk-smart/themed-cloudscape-components/calendar';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Calendar',
  component: Calendar,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Calendar rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('');
  return <Calendar value={v} onChange={({ detail }) => setV(detail.value)} />;
};
export const Default: Story = { render: () => <Controlled /> };
