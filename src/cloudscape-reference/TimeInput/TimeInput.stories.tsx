import type { Meta, StoryObj } from '@storybook/react-vite';
import TimeInput from '@risk-smart/themed-cloudscape-components/time-input';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/TimeInput',
  component: TimeInput,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape TimeInput rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof TimeInput>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('');
  return <TimeInput value={v} onChange={({ detail }) => setV(detail.value)} format={'hh:mm'} placeholder={'hh:mm'} />;
};
export const Default: Story = { render: () => <Controlled /> };
