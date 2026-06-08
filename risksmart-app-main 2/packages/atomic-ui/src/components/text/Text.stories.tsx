import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import { Text } from './index';
import { elementPreset, preset } from './variants';

const allPresets = Object.keys(preset) as (keyof typeof preset)[];

/**
 * A generic text component for rendering text with consistent sizing and weight
 */
const meta = {
  title: 'Components/Text',
  component: Text,
  argTypes: {
    preset: {
      control: 'select',
      options: allPresets,
      description: 'The preset style to apply to the text',
    },
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the text',
    },
    children: {
      control: 'text',
      description: 'The content of the text',
    },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    preset: 'body',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Presets: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-4')}>
      {allPresets.map((elementKey) => (
        <Text key={elementKey} {...args} preset={elementKey}>
          {`Preset - '${elementKey}' renders a <${elementPreset[elementKey]}> tag`}
        </Text>
      ))}
    </div>
  ),
};
