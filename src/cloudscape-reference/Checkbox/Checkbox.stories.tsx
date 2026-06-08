import type { Meta, StoryObj } from '@storybook/react-vite';
import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Checkbox',
  component: Checkbox,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Checkbox rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = (props: { children: string; disabled?: boolean }) => {
  const [v, setV] = useState(false);
  return <Checkbox checked={v} onChange={({ detail }) => setV(detail.checked)} disabled={props.disabled}>{props.children}</Checkbox>;
};
export const Default: Story = { render: () => <Controlled>I agree</Controlled> };
export const States: Story = {
  render: () => (
    <SpaceBetween size={'xs'}>
      <Controlled>Default</Controlled>
      <Checkbox checked indeterminate onChange={() => {}}>Indeterminate</Checkbox>
      <Controlled disabled>Disabled</Controlled>
    </SpaceBetween>
  ),
};
