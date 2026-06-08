import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import { Switch } from './index';
import { size } from './variants';

/**
 * A toggle switch component for binary options
 */
const meta = {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the switch',
    },
    size: {
      control: 'select',
      options: Object.keys(size),
      description: 'The size of the switch',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the switch is checked',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'The default checked state (uncontrolled)',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultChecked: true,
    'aria-label': 'Toggle option',
  },
  render: (args) => <Switch {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: /Toggle option/i });

    // Should start checked
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Click to uncheck
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Click to check again
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

export const Sizes: Story = {
  render: () => (
    <div className={cn('story-tile-group')}>
      {Object.keys(size).map((key) => (
        <div key={key} className={cn('story-tile')}>
          <Switch
            size={key as keyof typeof size}
            defaultChecked
            aria-label={`Toggle ${key} size`}
          />
          <span className={'text-base text-center text-foreground'}>{key}</span>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={cn('story-tile-group')}>
      <div className={cn('story-tile')}>
        <Switch
          disabled
          defaultChecked={false}
          aria-label={'Disabled unchecked'}
        />
      </div>
      <div className={cn('story-tile')}>
        <Switch disabled defaultChecked aria-label={'Disabled checked'} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unchecked = canvas.getByRole('switch', {
      name: /Disabled unchecked/i,
    });
    const checked = canvas.getByRole('switch', { name: /Disabled checked/i });

    await expect(unchecked).toHaveAttribute('aria-disabled', 'true');
    await expect(checked).toHaveAttribute('aria-disabled', 'true');
    await expect(unchecked).toHaveAttribute('aria-checked', 'false');
    await expect(checked).toHaveAttribute('aria-checked', 'true');
  },
};
