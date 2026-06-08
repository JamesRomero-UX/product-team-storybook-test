import type { Meta, StoryObj } from '@storybook/react-vite';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/FormField',
  component: FormField,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape FormField rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;


const Controlled = () => {
  const [v, setV] = useState('');
  return <Input value={v} onChange={({ detail }) => setV(detail.value)} />;
};

export const Default: Story = {
  render: () => (<FormField label={'Risk name'} description={'Short title'}><Controlled /></FormField>),
};
export const States: Story = {
  render: () => (
    <SpaceBetween size={'l'}>
      <FormField label={'Default'}><Controlled /></FormField>
      <FormField label={'With constraint'} constraintText={'Max 32 chars'}><Controlled /></FormField>
      <FormField label={'With error'} errorText={'Required'}><Controlled /></FormField>
    </SpaceBetween>
  ),
};
