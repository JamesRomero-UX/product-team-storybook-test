import type { Meta, StoryObj } from '@storybook/react-vite';
import ButtonDropdown from '@risk-smart/themed-cloudscape-components/button-dropdown';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/ButtonDropdown',
  component: ButtonDropdown,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape ButtonDropdown rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof ButtonDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ButtonDropdown items={[
    { id: 'edit', text: 'Edit' },
    { id: 'duplicate', text: 'Duplicate' },
    { id: 'delete', text: 'Delete', disabled: false },
  ]}>Actions</ButtonDropdown>,
};
export const WithIcons: Story = {
  render: () => <ButtonDropdown items={[
    { id: 'export', text: 'Export', iconName: 'download' },
    { id: 'archive', text: 'Archive', iconName: 'remove' },
  ]} variant={'primary'}>More</ButtonDropdown>,
};
