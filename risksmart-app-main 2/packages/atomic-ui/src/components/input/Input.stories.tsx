import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import { Input } from './index';

/**
 * A basic text input primitive. Supports all native `<input>` attributes.
 */
const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['wip'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text'],
      description: 'The HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the input is empty',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
  args: {
    type: 'text',
    placeholder: 'Placeholder text',
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '300px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Placeholder text');

    await expect(input).toBeInTheDocument();
    await expect(input).toHaveValue('');

    // Type into the input
    await userEvent.click(input);
    await userEvent.type(input, 'Hello world');
    await expect(input).toHaveValue('Hello world');
  },
};

export const Standard: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-4')}>
      <Input {...args} />
      <Input {...args} defaultValue={'Input value'} />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-4')}>
      <Input {...args} disabled aria-label={'Disabled empty'} />
      <Input
        {...args}
        disabled
        defaultValue={'Input value'}
        aria-label={'Disabled with value'}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emptyInput = canvas.getByRole('textbox', { name: /Disabled empty/i });
    const filledInput = canvas.getByRole('textbox', {
      name: /Disabled with value/i,
    });

    await expect(emptyInput).toBeDisabled();
    await expect(filledInput).toBeDisabled();
    await expect(filledInput).toHaveValue('Input value');
  },
};

export const Invalid: Story = {
  render: (args) => (
    <div className={cn('flex flex-col gap-4')}>
      <Input {...args} aria-invalid={true} aria-label={'Invalid empty'} />
      <Input
        {...args}
        aria-invalid={true}
        defaultValue={'Input value'}
        aria-label={'Invalid with value'}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emptyInput = canvas.getByRole('textbox', { name: /Invalid empty/i });
    const filledInput = canvas.getByRole('textbox', {
      name: /Invalid with value/i,
    });

    await expect(emptyInput).toHaveAttribute('aria-invalid', 'true');
    await expect(filledInput).toHaveAttribute('aria-invalid', 'true');
  },
};
