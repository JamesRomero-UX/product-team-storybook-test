import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import { commonIcons } from '../icon/iconMap';
import { BadgeIcon } from './index';
import { variant } from './variants';

/**
 * A small badge component that displays an icon. The icon is a configured preset based on the variant or can be given a specific icon by passing an icon name.
 */
const meta = {
  title: 'Components/BadgeIcon',
  component: BadgeIcon,
  argTypes: {
    variant: {
      control: 'select',
      options: Object.keys(variant),
      description: 'The variant of the check badge',
    },
    icon: {
      control: 'select',
      options: commonIcons,
      description:
        'A custom icon to display in the badge. This will override the preconfigured icon for the chosen variant.',
    },
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the check badge',
    },
  },
  args: {
    variant: 'success',
  },
} satisfies Meta<typeof BadgeIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className={cn('story-tile-group')}>
      {Object.keys(variant).map((key) => (
        <div key={key} className={cn('story-tile')}>
          <BadgeIcon variant={key as keyof typeof variant} />
          <span className={'text-base text-center text-muted-foreground'}>
            {key}
          </span>
        </div>
      ))}
    </div>
  ),
};
