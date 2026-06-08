import type { Meta, StoryObj } from '@storybook/react-vite';
import Slider from '@risk-smart/themed-cloudscape-components/slider';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Slider',
  component: Slider,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Slider rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState(50);
  return <Slider value={v} onChange={({ detail }) => setV(detail.value)} min={0} max={100} step={1} />;
};
export const Default: Story = { render: () => <div style={{ width: 400 }}><Controlled /></div> };
