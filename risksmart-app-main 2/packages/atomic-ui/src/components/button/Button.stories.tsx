import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { cn, toTitleCase } from '../../lib/utils';
import { Icon } from '../icon/index';
import { Button } from './index';
import { radius, size, style, variant } from './variants';

/**
 * A button is a clickable element used to perform an action or trigger an event
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the button',
    },
    variant: {
      control: 'select',
      options: Object.keys(variant),
      description: 'The pre-configured button style to apply',
    },
    style: {
      control: 'select',
      options: Object.keys(style),
      description: 'The visual style of the button',
    },
    radius: {
      control: 'select',
      options: Object.keys(radius),
      description: 'The border radius of the button',
    },
    size: {
      control: 'select',
      options: Object.keys(size),
      description: 'The size of the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback fired when the button is clicked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    elevated: {
      control: 'boolean',
      description: 'Whether the button scales up and shows a shadow on hover',
    },
    children: {
      options: ['Text', 'Leading icon', 'Trailing icon', 'Icon only'],
      mapping: {
        Text: 'Button',
        'Leading icon': (
          <>
            <Icon name={'plus'} /> {'Button'}
          </>
        ),
        'Trailing icon': (
          <>
            {'Button '}
            <Icon name={'chevron-down'} />
          </>
        ),
        'Icon only': <Icon name={'plus'} />,
      },
      control: 'select',
      description: 'The content of the button',
    },
  },
  args: {
    variant: 'default',
    style: 'default',
    radius: 'full',
    size: 'md',
    children: 'Text',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className={cn('story-tile-group')}>
      {Object.keys(variant).map((variantName) => (
        <div key={variantName} className={cn('story-tile')}>
          <Button {...args} variant={variantName as keyof typeof variant}>
            {toTitleCase(variantName)}
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const Styles: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-6')}>
      {Object.keys(style).map((styleName) => (
        <div key={styleName}>
          <div className={cn('story-tile-group')}>
            {Object.keys(variant).map((variantName) => (
              <div key={variantName} className={cn('story-tile')}>
                <Button
                  {...args}
                  variant={variantName as keyof typeof variant}
                  style={styleName as keyof typeof style}
                >
                  {toTitleCase(variantName)}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className={cn('story-tile-group items-center')}>
      <Button {...args} size={'sm'}>
        {'Small'}
      </Button>
      <Button {...args} size={'md'}>
        {'Medium'}
      </Button>
    </div>
  ),
};

export const Radius: Story = {
  render: (args) => (
    <div className={cn('story-tile-group')}>
      <Button {...args} radius={'full'}>
        {'Full'}
      </Button>
      <Button {...args} radius={'xl'}>
        {'XL'}
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className={cn('story-tile-group')}>
      {Object.keys(variant).map((variantName) => (
        <div key={variantName} className={cn('story-tile')}>
          <Button
            {...args}
            variant={variantName as keyof typeof variant}
            disabled
          >
            {toTitleCase(variantName)}
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Default/i });

    await expect(button).toBeDisabled();
  },
};

export const Icons: Story = {
  render: (args) => (
    <div className={cn('story-tile-group')}>
      <Button {...args}>
        <Icon name={'plus'} /> {'Leading icon'}
      </Button>
      <Button {...args}>
        {'Trailing icon'}
        <Icon name={'chevron-down'} />
      </Button>
      <Button {...args}>
        <Icon name={'plus'} /> {'Both icons'}
        <Icon name={'chevron-down'} />
      </Button>
    </div>
  ),
};

/**
 * Icon-only buttons — provide an `aria-label` for accessibility
 */
export const IconOnly: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-6')}>
      {Object.keys(style).map((styleName) => (
        <div key={styleName}>
          <div className={cn('story-tile-group')}>
            {Object.keys(variant).map((variantName) => (
              <div key={variantName} className={cn('story-tile')}>
                <Button
                  {...args}
                  variant={variantName as keyof typeof variant}
                  style={styleName as keyof typeof style}
                  size={'icon'}
                  aria-label={`${variantName} ${styleName}`}
                >
                  <Icon name={'plus'} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Custom: Story = {
  render: (args) => (
    <div className={cn('flex gap-4')}>
      <div className={'w-[300px]'}>
        <Button
          {...args}
          style={'dashed'}
          radius={'xl'}
          elevated
          className={'border-secondary bg-secondary-minimal h-[60px] w-full'}
        >
          <Icon name={'plus'} />
          {'Add likelihood'}
        </Button>
      </div>
      <Button
        {...args}
        variant={'destructive'}
        style={'outline'}
        radius={'xl'}
        className={'h-[60px]'}
      >
        <Icon name={'trash-01'} />
      </Button>
    </div>
  ),
};
