import type { Meta, StoryObj } from '@storybook/react-vite';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Pagination',
  component: Pagination,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Pagination rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = (p: { pagesCount?: number; openEnd?: boolean; disabled?: boolean }) => {
  const [pg, setPg] = useState(1);
  return <Pagination currentPageIndex={pg} onChange={({ detail }) => setPg(detail.currentPageIndex)} pagesCount={p.pagesCount ?? 10} openEnd={p.openEnd} disabled={p.disabled} />;
};
export const Default: Story = { render: () => <Controlled /> };
export const ManyPages: Story = { render: () => <Controlled pagesCount={42} /> };
export const OpenEnd: Story = { render: () => <Controlled openEnd /> };
