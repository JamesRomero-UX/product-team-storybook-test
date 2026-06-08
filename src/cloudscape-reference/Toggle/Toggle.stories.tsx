import type { Meta, StoryObj } from '@storybook/react-vite';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Toggle',
  component: Toggle,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Toggle rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = (props: { children: string; disabled?: boolean }) => {
  const [v, setV] = useState(false);
  return <Toggle checked={v} onChange={({ detail }) => setV(detail.checked)} disabled={props.disabled}>{props.children}</Toggle>;
};
export const Default: Story = { render: () => <Controlled>Toggle me</Controlled> };
export const States: Story = {
  render: () => (
    <SpaceBetween size={'xs'}>
      <Controlled>Default</Controlled>
      <Controlled disabled>Disabled</Controlled>
    </SpaceBetween>
  ),
};
