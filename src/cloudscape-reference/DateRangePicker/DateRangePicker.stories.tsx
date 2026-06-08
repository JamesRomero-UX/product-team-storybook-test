import type { Meta, StoryObj } from '@storybook/react-vite';
import DateRangePicker from '@risk-smart/themed-cloudscape-components/date-range-picker';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/DateRangePicker',
  component: DateRangePicker,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape DateRangePicker rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DateRangePicker value={v as any} onChange={({ detail }) => setV(detail.value)} relativeOptions={[
    { key: 'previous-7-days', amount: 7, unit: 'day', type: 'relative' },
    { key: 'previous-30-days', amount: 30, unit: 'day', type: 'relative' },
  ]} isValidRange={() => ({ valid: true })} />;
};
export const Default: Story = { render: () => <Controlled /> };
