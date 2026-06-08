import type { Meta, StoryObj } from '@storybook/react-vite';
import DateInput from '@risk-smart/themed-cloudscape-components/date-input';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/DateInput',
  component: DateInput,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape DateInput rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof DateInput>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('');
  return <DateInput value={v} onChange={({ detail }) => setV(detail.value)} placeholder={'YYYY/MM/DD'} />;
};
export const Default: Story = { render: () => <Controlled /> };
