import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from './index';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className={'flex items-center gap-4'}>
      <Checkbox size={'sm'} defaultChecked />
      <Checkbox size={'md'} defaultChecked />
      <Checkbox size={'lg'} defaultChecked />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: function WithLabelStory() {
    const [checked, setChecked] = useState(false);

    return (
      <label className={'flex items-center gap-2 cursor-pointer text-sm'}>
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        {'Accept terms and conditions'}
      </label>
    );
  },
};
