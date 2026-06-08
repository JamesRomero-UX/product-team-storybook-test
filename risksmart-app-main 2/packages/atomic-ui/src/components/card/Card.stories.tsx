import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import { Badge } from '../badge';
import { Button } from '../button';
import { Separator } from '../separator';
import { Text } from '../text';
import {
  // filepath: /Users/marcelljusztin/Code/risksmart/risksmart-app/packages/atomic-ui/src/components/card/Card.stories.tsx
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './index';

/**
 * A card is a container component that organizes content and actions around a single subject.
 * It provides visual separation and hierarchy for grouped information.
 */
const meta = {
  title: 'Components/Card',
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'warning', 'destructive', 'success'],
      description: 'Visual variant of the card',
    },
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Size variant of the card',
    },
  },
  args: {
    variant: 'neutral',
    size: 'default',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>{'Card title'}</CardTitle>
        <CardDescription>{'Card description'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>
          {
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          }
        </Text>
      </CardContent>
      <Separator />
      <CardFooter>
        <p>{'Footer content can include additional information or actions.'}</p>
      </CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>{'Card with action'}</CardTitle>
        <CardAction>
          <Badge variant={'neutral'}>{'New'}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Text>
          {
            'This card demonstrates the CardAction slot positioned in the top right corner.'
          }
        </Text>
      </CardContent>
      <Separator />
      <CardFooter>
        <Button>{'Action'}</Button>
      </CardFooter>
    </Card>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className={cn('grid grid-cols-2 gap-4')}>
      <Card {...args} variant={'neutral'}>
        <CardHeader>
          <CardTitle>{'Neutral'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Default neutral card variant'}</Text>
        </CardContent>
      </Card>
      <Card {...args} variant={'warning'}>
        <CardHeader variant={'warning'}>
          <CardTitle>{'Warning'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Warning variant for important information'}</Text>
        </CardContent>
      </Card>
      <Card {...args} variant={'secondary'}>
        <CardHeader variant={'secondary'}>
          <CardTitle>{'Secondary'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Secondary variant for additional context'}</Text>
        </CardContent>
      </Card>
      <Card {...args} variant={'success'}>
        <CardHeader variant={'success'}>
          <CardTitle>{'Success'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Success variant for positive outcomes'}</Text>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-4')}>
      <Card {...args} size={'default'}>
        <CardHeader>
          <CardTitle>{'Default size'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Standard card with default padding'}</Text>
        </CardContent>
      </Card>
      <Card {...args} size={'sm'}>
        <CardHeader>
          <CardTitle>{'Small size'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Compact card with reduced padding'}</Text>
        </CardContent>
      </Card>
    </div>
  ),
};

export const ContentOnly: Story = {
  render: (args) => (
    <Card {...args}>
      <CardContent>
        <Text>
          {
            'A simple card with only content, no header or footer. Useful for minimal layouts.'
          }
        </Text>
      </CardContent>
    </Card>
  ),
};
