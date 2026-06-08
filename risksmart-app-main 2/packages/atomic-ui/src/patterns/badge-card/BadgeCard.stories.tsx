import type { Meta, StoryObj } from '@storybook/react-vite';

import { BadgeCard } from './index';

// filepath: /Users/marcelljusztin/Code/risksmart/risksmart-app/packages/atomic-ui/src/patterns/badge-card/BadgeCard.stories.tsx

const meta = {
  title: 'Patterns/BadgeCard',
  component: BadgeCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BadgeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    title: 'Title',
    badgeLabel: 'Current',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    title: 'Title',
    badgeLabel: 'Updated',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Title',
    badgeLabel: 'Success',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Title',
    badgeLabel: 'Upcoming',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Title',
    badgeLabel: 'Alert',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};
