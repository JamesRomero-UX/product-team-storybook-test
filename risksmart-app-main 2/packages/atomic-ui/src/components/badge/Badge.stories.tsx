import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn, toTitleCase } from '../../lib/utils';
import { Icon as IconComponent } from '../icon';
import { Badge } from './index';
import { type BorderVariant, type Variant, variant } from './variants';

const allVariants = Object.keys(variant) as Variant[];

const borderVariants: BorderVariant[] = [
  'secondary',
  'success',
  'warning',
  'destructive',
  'neutral',
];

/**
 * Displays a badge or a component that looks like a badge
 */
const meta = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the badge',
    },
    variant: {
      control: 'select',
      options: Object.keys(variant),
      description: 'The pre-configured badge style to apply',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'The size of the badge',
    },
    border: {
      control: 'boolean',
      description: 'Whether to apply a border style to the badge',
    },
    children: {
      control: 'text',
      description: 'The content of the badge',
    },
  },
  args: {
    children: 'Success',
    variant: 'success',
    size: 'md',
    border: false,
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Flat: Story = {
  render: (args) => (
    <div className={cn('grid grid-cols-7 justify-items-start gap-4')}>
      <span className={'col-span-7 font-medium'}>{'Default'}</span>
      {allVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'md'} border={false}>
          {toTitleCase(key)}
        </Badge>
      ))}
      <span className={'col-span-7 font-medium mt-8'}>
        {'Default with Icon'}
      </span>
      {allVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'md'} border={false}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>
      ))}
      <span className={'col-span-7 font-medium mt-8'}>{'Small'}</span>
      {allVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'sm'} border={false}>
          {toTitleCase(key)}
        </Badge>
      ))}
      <span className={'col-span-7 font-medium mt-8'}>{'Small with Icon'}</span>
      {allVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'sm'} border={false}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>
      ))}
    </div>
  ),
};

export const Border: Story = {
  render: (args) => (
    <div className={cn('grid grid-cols-4 justify-items-start gap-4')}>
      <span className={'col-span-4 font-medium'}>{'Default'}</span>
      {borderVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'md'} border={true}>
          {toTitleCase(key)}
        </Badge>
      ))}
      <span className={'col-span-4 font-medium mt-8'}>
        {'Default with Icon'}
      </span>
      {borderVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'md'} border={true}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>
      ))}
      <span className={'col-span-4 font-medium mt-8'}>{'Small'}</span>
      {borderVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'sm'} border={true}>
          {toTitleCase(key)}
        </Badge>
      ))}
      <span className={'col-span-4 font-medium mt-8'}>{'Small with Icon'}</span>
      {borderVariants.map((key) => (
        <Badge key={key} {...args} variant={key} size={'sm'} border={true}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>
      ))}
    </div>
  ),
};
