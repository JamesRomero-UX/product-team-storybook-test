import type { Meta, StoryObj } from '@storybook/react-vite';
import ToggleButton from '@risk-smart/themed-cloudscape-components/toggle-button';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/ToggleButton',
  component: ToggleButton,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape ToggleButton rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState(false);
  return <ToggleButton pressed={v} onChange={({ detail }) => setV(detail.pressed)} iconName={'star'} pressedIconName={'star-filled'}>Favorite</ToggleButton>;
};
export const Default: Story = { render: () => <Controlled /> };
