import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Card } from '../../components';
import { ConfirmableDeleteButton } from '.';

const meta = {
  title: 'Patterns/ConfirmableDeleteButton',
  component: ConfirmableDeleteButton,
  tags: ['new'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmableDeleteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Card
        className={
          'flex w-full min-w-[200px] items-end rounded-lg border border-solid border-neutral-border p-4'
        }
      >
        <ConfirmableDeleteButton {...args} />
      </Card>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Initially shows the trash button, no Cancel button
    const trashButton = canvas.getByRole('button', { name: /delete/i });
    await expect(trashButton).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /cancel delete/i })
    ).not.toBeInTheDocument();

    // Click trash → Cancel (X) button appears
    await userEvent.click(trashButton);
    await waitFor(() => {
      expect(
        canvas.getByRole('button', { name: /cancel delete/i })
      ).toBeVisible();
    });

    // Click Cancel (X) → trash button returns
    await userEvent.click(
      canvas.getByRole('button', { name: /cancel delete/i })
    );
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: /delete/i })).toBeVisible();
      expect(
        canvas.queryByRole('button', { name: /cancel delete/i })
      ).not.toBeInTheDocument();
    });

    // Click trash again → confirm deletion this time
    await userEvent.click(canvas.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(
        canvas.getByRole('button', { name: /cancel delete/i })
      ).toBeVisible();
    });

    // Click the red Delete confirmation button → calls onConfirm
    const confirmSpy = args.onConfirm;
    const confirmBtn = canvas.getByRole('button', { name: /^delete$/i });
    await waitFor(() => {
      expect(confirmBtn).toBeVisible();
    });
    await userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledOnce();
    });

    // After confirm, returns to initial state
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: /delete/i })).toBeVisible();
      expect(
        canvas.queryByRole('button', { name: /cancel delete/i })
      ).not.toBeInTheDocument();
    });
  },
};
