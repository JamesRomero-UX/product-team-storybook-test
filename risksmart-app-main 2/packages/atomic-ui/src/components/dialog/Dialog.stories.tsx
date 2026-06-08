import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  expect,
  screen,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import { Button, Icon, Text } from '../../components';
import { cn } from '../../lib/utils';
import {
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '.';
import type { size } from './variants';

/**
 * Dialog components for building modal windows.
 *
 * ## Quick start — `Dialog` compound component
 *
 * Use the `Dialog` compound component for the most common use case. It wraps
 * the low-level parts into a simple props-based API:
 *
 * ```tsx
 * <Dialog trigger={<Button>Open</Button>} size="lg">
 *   <Dialog.Header title="Title" description="Description" />
 *   <Dialog.Body>Content</Dialog.Body>
 *   <Dialog.Footer>
 *     <Button>Save</Button>
 *     <Dialog.Close render={<Button variant="neutral" style="outline">Cancel</Button>} />
 *   </Dialog.Footer>
 * </Dialog>
 * ```
 *
 * ## Low-level parts
 *
 * For full control over the dialog structure, compose the primitives directly:
 * `DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogBackdrop`,
 * `DialogPopup`, `DialogTitle`, `DialogDescription`, `DialogClose`,
 * `DialogHeader`, `DialogBody`, `DialogFooter`.
 *
 * See the **`Primitives`** story at the **bottom of this page** for an example of this approach.
 */
const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  subcomponents: {
    DialogRoot,
    DialogTrigger,
    DialogPortal,
    DialogBackdrop,
    DialogPopup,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogHeader,
    DialogBody,
    DialogFooter,
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ================================================================
 * Compound Dialog stories
 * ================================================================ */

/**
 * The simplest usage: provide a `trigger` and compose the dialog content
 * using `Dialog.Header`, `Dialog.Body`, and `Dialog.Footer` sub-components.
 */
export const Default: Story = {
  args: {
    trigger: <Button>{'Open dialog'}</Button>,
    size: 'lg',
  },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Header
        title={'Dialog title'}
        description={'Dialog description goes here.'}
      />
      <Dialog.Body>
        <Text>
          {
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          }
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={() => alert('Submitted!')}>{'Save'}</Button>
        <Dialog.Close
          render={
            <Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>
          }
        />
      </Dialog.Footer>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open dialog/i });

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByText('Dialog title')).toBeVisible();
    });

    await expect(
      within(dialog).getByText('Dialog description goes here.')
    ).toBeVisible();

    await expect(
      within(dialog).getByRole('button', { name: /save/i })
    ).toBeVisible();
    await expect(
      within(dialog).getByRole('button', { name: /cancel/i })
    ).toBeVisible();

    await expect(
      within(dialog).getByRole('button', { name: /close/i })
    ).toBeVisible();

    await userEvent.click(
      within(dialog).getByRole('button', { name: /close/i })
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await userEvent.click(trigger);
    const dialog2 = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog2).getByText('Dialog title')).toBeVisible();
    });

    const alertSpy = spyOn(window, 'alert');
    await userEvent.click(
      within(dialog2).getByRole('button', { name: /save/i })
    );
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Submitted!');
    });

    await userEvent.click(
      within(dialog2).getByRole('button', { name: /cancel/i })
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

/**
 * `Dialog` accepts a `size` prop that controls the max-width of the
 * dialog panel. Available sizes: `sm`, `md` (default), `lg`, `xl`.
 */
export const Sizes: Story = {
  render: () => (
    <div className={cn('flex gap-4 flex-wrap')}>
      {(['sm', 'md', 'lg', 'xl'] as (keyof typeof size)[]).map((sizeName) => (
        <Dialog
          key={sizeName}
          trigger={<Button>{`Size: ${sizeName}`}</Button>}
          size={sizeName}
        >
          <Dialog.Header
            title={`${sizeName.toUpperCase()} dialog`}
            description={`This dialog uses the "${sizeName}" size variant.`}
          />
          <Dialog.Body>
            <Text>
              {
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
              }
            </Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button>{'Confirm'}</Button>
            <Dialog.Close
              render={
                <Button variant={'neutral'} style={'outline'}>
                  {'Cancel'}
                </Button>
              }
            />
          </Dialog.Footer>
        </Dialog>
      ))}
    </div>
  ),
};

/**
 * Use `Dialog.Header` with only a `title` prop for a compact header.
 */
export const TitleOnly: Story = {
  args: {
    trigger: <Button>{'Open dialog'}</Button>,
    size: 'lg',
  },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Header title={'Notifications'} />
      <Dialog.Body>
        <Text>{'Configure your notification preferences.'}</Text>
        <Text>
          {
            "You'll notice this dialog only has a title and no description. How neat is that?"
          }
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close
          render={
            <Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>
          }
        />
      </Dialog.Footer>
    </Dialog>
  ),
};

/**
 * When `Dialog.Body` contains a large amount of content, the body area
 * automatically becomes scrollable (capped at 60vh) while the header
 * and footer remain fixed.
 */
export const ScrollableBody: Story = {
  args: {
    trigger: <Button>{'Open scrollable dialog'}</Button>,
    size: 'lg',
  },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Header
        title={'Terms and conditions'}
        description={'Please review the following terms.'}
      />
      <Dialog.Body>
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i} className={cn('mb-4 text-base')}>
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
            }
          </p>
        ))}
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close
          render={
            <Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>
          }
        />
      </Dialog.Footer>
    </Dialog>
  ),
};

/**
 * No header content, just a simple message in the body and a standard footer.
 */
export const NoHeader: Story = {
  args: {
    trigger: <Button>{'Open simple dialog'}</Button>,
    size: 'lg',
  },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Body>
        <Text>
          {
            'This dialog has no header, just this message, a standard footer and a close button in the top right corner.'
          }
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close
          render={
            <Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>
          }
        />
      </Dialog.Footer>
    </Dialog>
  ),
};

/**
 * Controlled mode without a `trigger` element. The dialog is opened via
 * `open` / `onOpenChange` props, so no trigger is rendered in the DOM.
 */
export const ControlledNoTrigger: Story = {
  args: {
    open: false,
    size: 'lg',
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant={'neutral'} onClick={() => setOpen((prev) => !prev)}>
          {'This is not a Dialog Trigger'}
        </Button>
        <Dialog {...args} open={open} onOpenChange={setOpen}>
          <Dialog.Header
            title={'Controlled dialog'}
            description={'Opened without a trigger element.'}
          />
          <Dialog.Body>
            <Text>
              {
                'This dialog is controlled externally. There is no trigger button rendered in the DOM.'
              }
            </Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button>{'Save'}</Button>
            <Dialog.Close
              render={
                <Button variant={'neutral'} style={'outline'}>
                  {'Cancel'}
                </Button>
              }
            />
            <Button onClick={() => setOpen((prev) => !prev)}>
              {'This is not a Dialog Close button'}
            </Button>
          </Dialog.Footer>
        </Dialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const externalButton = canvas.getByRole('button', {
      name: /this is not a dialog trigger/i,
    });

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(externalButton);

    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByText('Controlled dialog')).toBeVisible();
    });

    const externalCloseButton = within(dialog).getByRole('button', {
      name: /this is not a dialog close button/i,
    });
    await userEvent.click(externalCloseButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

/**
 * A header with arbitrary content instead of a title or description.
 * This shows how the `Dialog.Header` `children` prop can be used to render
 * custom content alongside the close button.
 */
export const CustomHeaderContent: Story = {
  args: {
    trigger: <Button>{'Open custom header dialog'}</Button>,
    size: 'lg',
  },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Header>
        <Text className={cn('text-sm font-medium text-primary')}>
          {'Step 2 of 4'}
        </Text>
      </Dialog.Header>
      <Dialog.Body>
        <Text>
          {
            'The header renders arbitrary children alongside the close button. No title or description is used here.'
          }
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close
          render={
            <Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>
          }
        />
      </Dialog.Footer>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /open custom header dialog/i,
    });

    await userEvent.click(trigger);

    await waitFor(() => expect(screen.getByText('Step 2 of 4')).toBeVisible());
  },
};

/* ================================================================
 * Low-level primitives example
 * ================================================================ */

/**
 * For full control over the dialog structure, compose the low-level
 * primitives directly: `DialogRoot`, `DialogTrigger`, `DialogPortal`,
 * `DialogBackdrop`, `DialogPopup`, `DialogTitle`, `DialogDescription`,
 * `DialogClose`, `DialogHeader`, `DialogBody`, `DialogFooter`.
 */
export const Primitives: Story = {
  render: () => (
    <DialogRoot>
      <DialogTrigger render={<Button />}>
        {'Open primitives dialog'}
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup size={'lg'}>
          <DialogHeader>
            <div>
              <DialogTitle>{'Primitives example'}</DialogTitle>
              <DialogDescription>
                {'This dialog is composed from individual primitives.'}
              </DialogDescription>
            </div>
            <DialogClose
              render={
                <Button
                  className={cn('p-0 size-auto')}
                  variant={'neutral'}
                  style={'ghost'}
                  size={'icon'}
                >
                  <Icon name={'x'} size={'sm'} />
                </Button>
              }
              aria-label={'Close'}
            />
          </DialogHeader>
          <DialogBody>
            <Text>
              {
                'Use this approach when the compound Dialog component does not cover your use case. You have full control over layout, sizing, and behaviour.'
              }
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button>{'Confirm'}</Button>
            <DialogClose
              render={
                <Button variant={'neutral'} style={'outline'}>
                  {'Cancel'}
                </Button>
              }
            />
          </DialogFooter>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  ),
};
