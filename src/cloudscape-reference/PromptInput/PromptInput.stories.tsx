import type { Meta, StoryObj } from '@storybook/react-vite';
import PromptInput from '@risk-smart/themed-cloudscape-components/prompt-input';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/PromptInput',
  component: PromptInput,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape PromptInput rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof PromptInput>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [v, setV] = useState('');
  return <PromptInput value={v} onChange={({ detail }) => setV(detail.value)} placeholder={'Ask me anything'} actionButtonAriaLabel={'Send'} actionButtonIconName={'send'} />;
};
export const Default: Story = { render: () => <Controlled /> };
