import type { Meta, StoryObj } from '@storybook/react-vite';
import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/DatePicker',
  component: DatePicker,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape DatePicker rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('');
  return <DatePicker value={v} onChange={({ detail }) => setV(detail.value)} placeholder={'YYYY/MM/DD'} />;
};
export const Default: Story = { render: () => <Controlled /> };
