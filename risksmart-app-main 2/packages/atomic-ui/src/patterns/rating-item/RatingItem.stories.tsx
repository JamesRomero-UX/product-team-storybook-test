import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Icon } from '../../components';
import { cn } from '../../lib/utils';
import {
  RatingItem,
  RatingItemAction,
  RatingItemBadge,
  RatingItemContent,
  RatingItemDescription,
  RatingItemTitle,
} from './index';

const meta = {
  title: 'Patterns/RatingItem',
  component: RatingItem,
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: 'radio',
      description: 'Size variant for the rating item',
    },
    color: {
      control: 'color',
      description:
        'Background color of the item, typically reflecting rating severity',
    },
    onClick: {
      action: 'clicked',
      description: 'Optional click handler for item interactions',
    },
  },
  args: {
    color: '#79B250',
    size: 'md',
    onClick: fn(),
  },
} satisfies Meta<typeof RatingItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ minWidth: '600px' }}>
      <RatingItem color={args.color} size={args.size} onClick={args.onClick}>
        <RatingItemBadge>{1}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Very Low'}</RatingItemTitle>
          <RatingItemDescription>{'<10%'}</RatingItemDescription>
        </RatingItemContent>
        <RatingItemAction>
          <Icon name={'pencil-01'} size={'sm'} />
        </RatingItemAction>
      </RatingItem>
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-2')} style={{ minWidth: '600px' }}>
      <RatingItem {...args} color={'#79B250'}>
        <RatingItemBadge>{1}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Very Low'}</RatingItemTitle>
          <RatingItemDescription>{'<10%'}</RatingItemDescription>
        </RatingItemContent>
        <RatingItemAction>
          <Icon name={'pencil-01'} size={'sm'} />
        </RatingItemAction>
      </RatingItem>
      <RatingItem {...args} color={'#A8D08C'}>
        <RatingItemBadge>{2}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Low'}</RatingItemTitle>
          <RatingItemDescription>{'10% - 30%'}</RatingItemDescription>
        </RatingItemContent>
        <RatingItemAction>
          <Icon name={'pencil-01'} size={'sm'} />
        </RatingItemAction>
      </RatingItem>
      <RatingItem {...args} color={'#F2A041'}>
        <RatingItemBadge>{3}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Medium'}</RatingItemTitle>
          <RatingItemDescription>{'30% - 70%'}</RatingItemDescription>
        </RatingItemContent>
        <RatingItemAction>
          <Icon name={'pencil-01'} size={'sm'} />
        </RatingItemAction>
      </RatingItem>
      <RatingItem {...args} color={'#D25F5F'}>
        <RatingItemBadge>{4}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'High'}</RatingItemTitle>
          <RatingItemDescription>{'70% - 90%'}</RatingItemDescription>
        </RatingItemContent>
        <RatingItemAction>
          <Icon name={'pencil-01'} size={'sm'} />
        </RatingItemAction>
      </RatingItem>
      <RatingItem {...args} color={'#D92B2B'}>
        <RatingItemBadge>{5}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Very High'}</RatingItemTitle>
          <RatingItemDescription>{'90% - 100%'}</RatingItemDescription>
        </RatingItemContent>
        <RatingItemAction>
          <Icon name={'pencil-01'} size={'sm'} />
        </RatingItemAction>
      </RatingItem>
    </div>
  ),
};

export const Small: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-2')} style={{ minWidth: '200px' }}>
      <RatingItem {...args} color={'#79B250'} size={'sm'}>
        <RatingItemContent>
          <RatingItemTitle>{'Very Low'}</RatingItemTitle>
          <RatingItemDescription>{'<10%'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
      <RatingItem {...args} color={'#A8D08C'} size={'sm'}>
        <RatingItemContent>
          <RatingItemTitle>{'Low'}</RatingItemTitle>
          <RatingItemDescription>{'10% - 30%'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
      <RatingItem {...args} color={'#F2A041'} size={'sm'}>
        <RatingItemContent>
          <RatingItemTitle>{'Medium'}</RatingItemTitle>
          <RatingItemDescription>{'30% - 70%'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
      <RatingItem {...args} color={'#D25F5F'} size={'sm'}>
        <RatingItemContent>
          <RatingItemTitle>{'High'}</RatingItemTitle>
          <RatingItemDescription>{'70% - 90%'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
      <RatingItem {...args} color={'#D92B2B'} size={'sm'}>
        <RatingItemContent>
          <RatingItemTitle>{'Very High'}</RatingItemTitle>
          <RatingItemDescription>{'90% - 100%'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
    </div>
  ),
};

/**
 * Demonstrates the non-interactive variant — cursor-default applies when no onClick handler is provided.
 */
export const NonInteractive: Story = {
  render: (args) => (
    <div style={{ minWidth: '600px' }}>
      <RatingItem color={args.color} size={args.size}>
        <RatingItemBadge>{1}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Very Low'}</RatingItemTitle>
          <RatingItemDescription>{'<10%'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
    </div>
  ),
};

/**
 * Renders with an invalid color to cover the getAccessibleTextColor fallback.
 */
export const InvalidColor: Story = {
  render: (args) => (
    <div style={{ minWidth: '600px' }}>
      <RatingItem color={'not-a-color'} size={args.size}>
        <RatingItemBadge>{1}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Fallback'}</RatingItemTitle>
          <RatingItemDescription>{'Invalid color input'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Fallback')).toBeInTheDocument();
  },
};

/**
 * Verifies keyboard interaction — pressing Enter and Space triggers the click handler.
 */
export const KeyboardInteraction: Story = {
  args: {
    onClick: fn(),
  },
  render: (args) => (
    <div style={{ minWidth: '600px' }}>
      <RatingItem color={args.color} size={args.size} onClick={args.onClick}>
        <RatingItemBadge>{1}</RatingItemBadge>
        <RatingItemContent>
          <RatingItemTitle>{'Very Low'}</RatingItemTitle>
          <RatingItemDescription>{'<10%'}</RatingItemDescription>
        </RatingItemContent>
      </RatingItem>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByRole('button');

    // Focus and press Enter
    await userEvent.tab();
    await expect(item).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Press Space
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
