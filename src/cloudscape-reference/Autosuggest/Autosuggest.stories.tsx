import type { Meta, StoryObj } from '@storybook/react-vite';
import Autosuggest from '@risk-smart/themed-cloudscape-components/autosuggest';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Autosuggest',
  component: Autosuggest,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Autosuggest rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Autosuggest>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('');
  return <Autosuggest value={v} onChange={({ detail }) => setV(detail.value)} options={[
    { value: 'Apple' }, { value: 'Banana' }, { value: 'Cherry' },
  ]} placeholder={'Type to search'} />;
};
export const Default: Story = { render: () => <Controlled /> };
