import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Icon } from '../icon/index';
import { ToggleGroup, ToggleGroupItem } from './index';

/**
 * A pill-shaped row of connected toggle items used to switch between mutually
 * exclusive views or modes. Supports text, icon, and text+icon combinations.
 */
const meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  subcomponents: { ToggleGroupItem },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle group is disabled',
    },
    onValueChange: {
      description:
        'Callback fired when the selected value changes. Receives `string[]` — read `value[0]` for single-select usage.',
    },
  },
  args: {
    onValueChange: fn(),
    disabled: false,
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  render: (args) => (
    <ToggleGroup defaultValue={['list']} {...args}>
      <ToggleGroupItem value={'list'}>{'List'}</ToggleGroupItem>
      <ToggleGroupItem value={'board'}>{'Board'}</ToggleGroupItem>
      <ToggleGroupItem value={'timeline'}>{'Timeline'}</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const listItem = canvas.getByText('List');
    const boardItem = canvas.getByText('Board');

    // List should be pressed by default
    await expect(listItem).toHaveAttribute('data-pressed');

    // Click Board to select it
    await userEvent.click(boardItem);
    await expect(boardItem).toHaveAttribute('data-pressed');
  },
};

export const Icon_: Story = {
  render: (args) => (
    <ToggleGroup defaultValue={['grid']} {...args}>
      <ToggleGroupItem value={'grid'} aria-label={'Grid view'}>
        <Icon name={'grid-01'} />
      </ToggleGroupItem>
      <ToggleGroupItem value={'list'} aria-label={'List view'}>
        <Icon name={'list'} />
      </ToggleGroupItem>
      <ToggleGroupItem value={'table'} aria-label={'Table view'}>
        <Icon name={'table'} />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const TextAndIcon: Story = {
  render: (args) => (
    <ToggleGroup defaultValue={['list']} {...args}>
      <ToggleGroupItem value={'list'}>
        <Icon name={'list'} /> {'List'}
      </ToggleGroupItem>
      <ToggleGroupItem value={'board'}>
        <Icon name={'grid-01'} /> {'Board'}
      </ToggleGroupItem>
      <ToggleGroupItem value={'timeline'}>
        <Icon name={'bar-chart-10'} /> {'Timeline'}
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <ToggleGroup defaultValue={['list']} {...args}>
      <ToggleGroupItem value={'list'}>
        <Icon name={'list'} /> {'List'}
      </ToggleGroupItem>
      <ToggleGroupItem value={'board'}>
        <Icon name={'grid-01'} /> {'Board'}
      </ToggleGroupItem>
      <ToggleGroupItem value={'timeline'}>
        <Icon name={'bar-chart-10'} /> {'Timeline'}
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
