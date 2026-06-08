import type { Meta, StoryObj } from '@storybook/react-vite';

import { Container } from './index';

/** A minimal wrapper for grouping content - predominantly for layout purposes.
 * Use Box for a more versatile component that includes additional styling options and functionality. */
const meta = {
  title: 'Components/Container',
  component: Container,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the container',
    },
    children: {
      control: 'text',
      description: 'The content of the container',
    },
  },
  args: {
    children: 'Container content',
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
