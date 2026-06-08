import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import type { SelectItem } from './index';
import { Select } from './index';

const fruitItems: SelectItem[] = [
  { label: 'Select a fruit', value: null },
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Grapes', value: 'grapes' },
  { label: 'Pineapple', value: 'pineapple' },
];

const questionItems: SelectItem[] = [
  { label: 'Choose a question', value: null },
  { label: 'Risk name', value: 'risk-name' },
  { label: 'Risk tier', value: 'risk-tier' },
  { label: 'Owner', value: 'owner' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  decorators: [
    (Story) => (
      <div style={{ minWidth: '360px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: fruitItems,
  },
};

export const WithGroups: Story = {
  args: {
    items: [{ label: 'Pick a food', value: null }],
  },
  render: (args) => (
    <Select {...args}>
      <Select.Group label={'Fruits'}>
        <Select.Option value={'apple'}>{'Apple'}</Select.Option>
        <Select.Option value={'banana'}>{'Banana'}</Select.Option>
      </Select.Group>
      <Select.Group label={'Vegetables'}>
        <Select.Option value={'carrot'}>{'Carrot'}</Select.Option>
        <Select.Option value={'broccoli'} disabled>
          {'Broccoli (sold out)'}
        </Select.Option>
      </Select.Group>
      <Select.Group>
        <Select.Option value={'other'}>{'Other'}</Select.Option>
      </Select.Group>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the select
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    // Options render in a portal — query from screen
    const appleOption = await screen.findByRole('option', { name: /apple/i });
    await expect(appleOption).toBeInTheDocument();

    // Select an option
    await userEvent.click(appleOption);
  },
};

export const States: Story = {
  decorators: [
    (Story) => (
      <div style={{ minWidth: '100%', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  render: () => {
    const [controlledValue, setControlledValue] = useState<string>('');

    return (
      <div className={cn('grid grid-cols-2 gap-[120px] w-full')}>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'With default value'}
          </p>
          <Select
            className={cn('flex flex-grow w-full')}
            items={fruitItems}
            defaultValue={'banana'}
          />
        </div>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'Controlled'}
          </p>
          <Select
            className={cn('flex flex-grow w-full')}
            items={questionItems}
            value={controlledValue}
            onValueChange={setControlledValue}
          />
          <p className={'text-sm text-muted-foreground'}>
            {`Selected: ${controlledValue || 'none'}`}
          </p>
        </div>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'Invalid'}
          </p>
          <Select
            className={cn('flex flex-grow w-full')}
            items={fruitItems}
            aria-invalid={true}
          />
        </div>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'Disabled'}
          </p>
          <Select
            className={cn('flex flex-grow w-full')}
            items={fruitItems}
            disabled
          />
        </div>
      </div>
    );
  },
};
