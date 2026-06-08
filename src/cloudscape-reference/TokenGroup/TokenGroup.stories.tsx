import type { Meta, StoryObj } from '@storybook/react-vite';
import TokenGroup from '@risk-smart/themed-cloudscape-components/token-group';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/TokenGroup',
  component: TokenGroup,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape TokenGroup rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof TokenGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [items, setItems] = useState([
    { label: 'critical' }, { label: 'high' }, { label: 'data-loss' },
  ]);
  return <TokenGroup items={items} onDismiss={({ detail }) => setItems((cur) => cur.filter((_, i) => i !== detail.itemIndex))} />;
};
export const Default: Story = { render: () => <Controlled /> };
