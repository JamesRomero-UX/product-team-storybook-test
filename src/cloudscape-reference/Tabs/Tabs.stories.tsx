import type { Meta, StoryObj } from '@storybook/react-vite';
import Tabs from '@risk-smart/themed-cloudscape-components/tabs';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Tabs',
  component: Tabs,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Tabs rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const TABS = [
  { id: 'overview', label: 'Overview', content: <p>Overview content.</p> },
  { id: 'controls', label: 'Controls', content: <p>Linked controls.</p> },
  { id: 'history', label: 'History', content: <p>Audit history.</p> },
];
export const Default: Story = { render: () => <Tabs tabs={TABS} /> };
export const Variants: Story = {
  render: () => (
    <>
      <h4>variant=&quot;default&quot;</h4><Tabs tabs={TABS} variant={'default'} />
      <br /><h4>variant=&quot;container&quot;</h4><Tabs tabs={TABS} variant={'container'} />
    </>
  ),
};
