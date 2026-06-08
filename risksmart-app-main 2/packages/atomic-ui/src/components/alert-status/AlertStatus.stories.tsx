import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import { AlertStatus } from './index';
import { variant } from './variants';

const meta = {
  title: 'Components/AlertStatus',
  component: AlertStatus,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the alert status',
    },
    variant: {
      control: 'select',
      options: Object.keys(variant),
      description: 'The variant of the alert status',
    },
  },
  args: {
    variant: 'active',
  },
} satisfies Meta<typeof AlertStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className={cn('story-tile-group')}>
      {Object.keys(variant).map((key) => (
        <div key={key} className={cn('story-tile')}>
          <AlertStatus variant={key as keyof typeof variant} />
          <span className={'text-base text-center text-muted-foreground'}>
            {key}
          </span>
        </div>
      ))}
    </div>
  ),
};
