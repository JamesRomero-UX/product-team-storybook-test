import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import { Separator } from '../separator';
import { Accordion } from './index';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the accordion',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion defaultValue={['one']}>
      <Accordion.Item value={'one'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item One'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'two'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Two'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'three'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Three'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Item One should be open by default
    const triggerOne = canvas.getByText('Item One');
    await expect(triggerOne).toBeInTheDocument();
    await expect(triggerOne.closest('button')).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    // Item Two should be closed
    const triggerTwo = canvas.getByText('Item Two');
    await expect(triggerTwo.closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    // Click Item Two to open it (and close Item One in single mode)
    await userEvent.click(triggerTwo);
    await expect(triggerTwo.closest('button')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(triggerOne.closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  },
};

export const Multiple: Story = {
  render: () => (
    <Accordion multiple defaultValue={['one']}>
      <Accordion.Item value={'one'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item One'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'two'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Two'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'three'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Three'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Item One should be open by default
    const triggerOne = canvas.getByText('Item One');
    const triggerTwo = canvas.getByText('Item Two');

    await expect(triggerOne.closest('button')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(triggerTwo.closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    // Click Item Two — in multiple mode, Item One should stay open
    await userEvent.click(triggerTwo);
    await expect(triggerTwo.closest('button')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(triggerOne.closest('button')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  },
};

/**
 * Showcases all accordion variants side by side: Default, Card, and Inverse.
 */
export const Variants: Story = {
  render: function VariantsStory() {
    const variants = ['default', 'card', 'inverse'] as const;
    const [openSections, setOpenSections] = useState<Record<string, string[]>>({
      default: ['one'],
      card: ['one'],
      inverse: ['one'],
    });

    const getOpen = (variant: string) => openSections[variant] ?? [];
    const setOpen = (variant: string, values: string[]) =>
      setOpenSections((prev) => ({ ...prev, [variant]: values }));
    const toggleSection = (
      variant: string,
      value: string,
      checked: boolean
    ) => {
      setOpenSections((prev) => {
        const current = prev[variant] ?? [];

        return {
          ...prev,
          [variant]: checked
            ? [...current, value]
            : current.filter((v) => v !== value),
        };
      });
    };

    return (
      <div className={cn('flex gap-8 w-full')}>
        <div className={'flex flex-col gap-8 w-full'}>
          {variants.map((variant) => (
            <div key={variant}>
              <p
                className={'mb-2 text-lg font-semibold capitalize text-primary'}
              >
                <span className={'text-muted-foreground'}>{'Trigger - '}</span>{' '}
                {variant}
              </p>
              <Accordion defaultValue={['one']}>
                <Accordion.Item value={'one'} variant={variant}>
                  <Accordion.Header variant={variant}>
                    <Accordion.Trigger variant={variant}>
                      {'Item One'}
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value={'two'} variant={variant}>
                  <Accordion.Header variant={variant}>
                    <Accordion.Trigger variant={variant}>
                      {'Item Two'}
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </div>
          ))}
        </div>
        <Separator orientation={'vertical'} />
        <div className={'flex flex-col gap-8 w-full'}>
          {variants.map((variant) => (
            <div key={variant}>
              <p
                className={'mb-2 text-lg font-semibold capitalize text-primary'}
              >
                <span className={'text-muted-foreground'}>
                  {'Switch Trigger - '}
                </span>{' '}
                {variant}
              </p>
              <Accordion
                multiple
                value={getOpen(variant)}
                onValueChange={(values) => setOpen(variant, values)}
              >
                <Accordion.SwitchItem value={'one'} variant={variant}>
                  <Accordion.SwitchTrigger
                    variant={variant}
                    checked={getOpen(variant).includes('one')}
                    onCheckedChange={(checked) =>
                      toggleSection(variant, 'one', checked)
                    }
                  >
                    {'Item One'}
                  </Accordion.SwitchTrigger>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.SwitchItem>
                <Accordion.SwitchItem value={'two'} variant={variant}>
                  <Accordion.SwitchTrigger
                    variant={variant}
                    checked={getOpen(variant).includes('two')}
                    onCheckedChange={(checked) =>
                      toggleSection(variant, 'two', checked)
                    }
                  >
                    {'Item Two'}
                  </Accordion.SwitchTrigger>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.SwitchItem>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
