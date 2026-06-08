import type { Meta, StoryObj } from '@storybook/react-vite';
import Drawer from '@risk-smart/themed-cloudscape-components/drawer';
import Header from '@risk-smart/themed-cloudscape-components/header';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Drawer',
  component: Drawer,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Drawer rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Drawer header={<Header variant={'h2'}>Details</Header>}>
    <p>Drawer body content. Drawers usually live inside the AppLayout drawers prop.</p>
  </Drawer>,
};
