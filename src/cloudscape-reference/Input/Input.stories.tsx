import type { Meta, StoryObj } from '@storybook/react-vite';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Input',
  component: Input,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Input rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = (props: { placeholder?: string; type?: 'text' | 'search' | 'password' | 'email' | 'number'; disabled?: boolean; invalid?: boolean }) => {
  const [v, setV] = useState('');
  return <Input value={v} onChange={({ detail }) => setV(detail.value)} placeholder={props.placeholder} type={props.type} disabled={props.disabled} invalid={props.invalid} />;
};
export const Default: Story = { render: () => <Controlled placeholder={'Type here'} /> };
export const Types: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Controlled placeholder={'Text'} type={'text'} />
      <Controlled placeholder={'Search'} type={'search'} />
      <Controlled placeholder={'Email'} type={'email'} />
      <Controlled placeholder={'Number'} type={'number'} />
      <Controlled placeholder={'Password'} type={'password'} />
    </SpaceBetween>
  ),
};
export const States: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Controlled placeholder={'Default'} />
      <Controlled placeholder={'Disabled'} disabled />
      <Controlled placeholder={'Invalid'} invalid />
    </SpaceBetween>
  ),
};
