import type { Meta, StoryObj } from '@storybook/react-vite';
import Multiselect, { type MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Multiselect',
  component: Multiselect,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Multiselect rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Multiselect>;

export default meta;

type Story = StoryObj<typeof meta>;

const OPTIONS: MultiselectProps.Option[] = [
  { label: 'Apples', value: 'apples' }, { label: 'Bananas', value: 'bananas' }, { label: 'Cherries', value: 'cherries' },
];
const Controlled = () => {
  const [v, setV] = useState<readonly MultiselectProps.Option[]>([]);
  return <Multiselect selectedOptions={v} onChange={({ detail }) => setV(detail.selectedOptions)} options={OPTIONS} placeholder={'Pick fruit'} />;
};
export const Default: Story = { render: () => <Controlled /> };
