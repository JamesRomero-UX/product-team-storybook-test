import type { Meta, StoryObj } from '@storybook/react-vite';
import ButtonGroup from '@risk-smart/themed-cloudscape-components/button-group';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/ButtonGroup',
  component: ButtonGroup,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape ButtonGroup rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ButtonGroup variant={'icon'} items={[
    { type: 'icon-button', id: 'thumbs-up', iconName: 'thumbs-up', text: 'Like' },
    { type: 'icon-button', id: 'thumbs-down', iconName: 'thumbs-down', text: 'Dislike' },
    { type: 'icon-button', id: 'copy', iconName: 'copy', text: 'Copy' },
  ]} />,
};
