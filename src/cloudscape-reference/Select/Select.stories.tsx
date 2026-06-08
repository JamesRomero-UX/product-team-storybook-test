import type { Meta, StoryObj } from '@storybook/react-vite';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Select, { type SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Select',
  component: Select,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Select rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

const OPTIONS: SelectProps.Option[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];
const Controlled = () => {
  const [v, setV] = useState<SelectProps.Option | null>(null);
  return <Select selectedOption={v} onChange={({ detail }) => setV(detail.selectedOption)} options={OPTIONS} placeholder={'Select severity'} />;
};
export const Default: Story = { render: () => <Controlled /> };
export const InsideFormField: Story = { render: () => <FormField label={'Severity'}><Controlled /></FormField> };
