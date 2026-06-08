import type { Meta, StoryObj } from '@storybook/react-vite';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/RadioGroup',
  component: RadioGroup,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape RadioGroup rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('low');
  return <RadioGroup value={v} onChange={({ detail }) => setV(detail.value)} items={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical', disabled: true },
  ]} />;
};
export const Default: Story = { render: () => <Controlled /> };
