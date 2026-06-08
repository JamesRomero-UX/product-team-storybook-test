import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import { AlertStatus } from '../alert-status/index';
import {
  Alert,
  AlertDescription,
  AlertHeader,
  AlertInfo,
  AlertSubtitle,
  AlertTitle,
} from './index';
import { variant } from './variants';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  subcomponents: {
    AlertStatus,
    AlertHeader,
    AlertTitle,
    AlertSubtitle,
    AlertDescription,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: Object.keys(variant),
      description: 'The variant of the alert',
    },
  },
  args: {
    variant: 'active',
  },
  render: (args) => (
    <Alert variant={args.variant}>
      <AlertStatus variant={args.variant} />
      <AlertHeader>
        <AlertTitle>{'This is an alert title'}</AlertTitle>
        <AlertSubtitle>{'This is an alert subtitle'}</AlertSubtitle>
      </AlertHeader>
      <AlertDescription>{'This is an alert description'}</AlertDescription>
    </Alert>
  ),
  decorators: [
    (Story) => (
      <div style={{ minWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => {
    const variants = Object.keys(variant) as (keyof typeof variant)[];

    return (
      <div className={cn('grid gap-4')}>
        {variants.map((key) => (
          <Alert key={key} variant={key}>
            <AlertStatus variant={key} />
            <AlertHeader>
              <AlertTitle>{'This is an alert title'}</AlertTitle>
              <AlertSubtitle>{'This is an alert subtitle'}</AlertSubtitle>
            </AlertHeader>
            <AlertDescription>
              {'This is an alert description'}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  },
};

export const Small: Story = {
  render: () => {
    const variants = Object.keys(variant) as (keyof typeof variant)[];

    return (
      <div className={cn('grid gap-4')}>
        {variants.map((key) => (
          <Alert key={key} variant={key} size={'sm'}>
            <AlertInfo />
            <AlertHeader>
              <AlertTitle>{'This is an alert title'}</AlertTitle>
            </AlertHeader>
          </Alert>
        ))}
      </div>
    );
  },
};
