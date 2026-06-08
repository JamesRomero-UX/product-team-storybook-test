import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import { Separator } from './index';

/**
 * A visual divider used to separate content. Supports horizontal and vertical
 * orientations.
 */
const meta = {
  title: 'Components/Separator',
  component: Separator,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the separator',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
    },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-4 w-[400px]')}>
      <p className={'text-sm text-foreground'}>{'Content above'}</p>
      <Separator {...args} />
      <p className={'text-sm text-foreground'}>{'Content below'}</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator');

    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className={cn('flex items-center gap-4 h-[40px]')}>
      <span className={'text-sm text-foreground'}>{'Left'}</span>
      <Separator {...args} />
      <span className={'text-sm text-foreground'}>{'Right'}</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator');

    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('data-orientation', 'vertical');
  },
};
