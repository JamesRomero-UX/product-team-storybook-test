import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Modal',
  component: Modal,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Modal rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

const Demo = (p: { size?: 'small' | 'medium' | 'large' | 'max' }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={'primary'} onClick={() => setOpen(true)}>Open ({p.size ?? 'medium'})</Button>
      <Modal visible={open} onDismiss={() => setOpen(false)} header={'Confirm action'} size={p.size}
        footer={<Box float={'right'}>
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <Button variant={'link'} onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant={'primary'} onClick={() => setOpen(false)}>Confirm</Button>
          </SpaceBetween>
        </Box>}>Are you sure?</Modal>
    </>
  );
};
export const Default: Story = { render: () => <Demo /> };
export const Sizes: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Demo size={'small'} /><Demo size={'medium'} /><Demo size={'large'} /><Demo size={'max'} />
    </SpaceBetween>
  ),
};
