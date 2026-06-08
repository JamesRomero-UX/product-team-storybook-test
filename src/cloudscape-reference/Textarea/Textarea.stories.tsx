import type { Meta, StoryObj } from '@storybook/react-vite';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Textarea',
  component: Textarea,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Textarea rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = (p: { disabled?: boolean; invalid?: boolean }) => {
  const [v, setV] = useState('');
  return <Textarea value={v} onChange={({ detail }) => setV(detail.value)} disabled={p.disabled} invalid={p.invalid} placeholder={'Type here…'} />;
};
export const Default: Story = { render: () => <Controlled /> };
export const States: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Controlled />
      <Controlled disabled />
      <Controlled invalid />
    </SpaceBetween>
  ),
};
