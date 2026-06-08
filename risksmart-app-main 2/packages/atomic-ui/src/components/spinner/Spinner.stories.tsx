import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import { Spinner } from './index';
import { size } from './variants';

/**
 * A spinner indicates that content is loading
 */
const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['wip'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the spinner',
    },
    size: {
      control: 'select',
      options: Object.keys(size),
      description: 'The size of the spinner',
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className={cn('story-tile-group')}>
      {Object.keys(size).map((key) => (
        <div key={key} className={cn('story-tile')}>
          <Spinner size={key as keyof typeof size} />
          <span className={'text-base text-center text-muted-foreground'}>
            {key}
          </span>
        </div>
      ))}
    </div>
  ),
};
