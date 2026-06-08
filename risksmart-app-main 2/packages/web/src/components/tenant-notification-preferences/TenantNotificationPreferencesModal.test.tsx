import { ENABLED_CHANNELS } from '@risksmart-app/shared/knock/schemas';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWrapper } from 'src/testing/wrapper';
import { describe, expect, it, vi } from 'vitest';

import TenantNotificationPreferencesModal from './TenantNotificationPreferencesModal';

// Mock the tRPC hooks
const mockMutateAsync = vi.fn();
let mockIsLoading = false;
let mockIsError = false;

vi.mock('src/utils/trpc', async () => {
  const actual = await vi.importActual('src/utils/trpc');

  return {
    ...actual,
    useTRPC: () => ({
      frontend: {
        notifications: {
          preferences: {
            get: {
              queryOptions: () => ({
                queryKey: ['notifications', 'preferences', 'get'],
                queryFn: vi.fn(),
              }),
            },
            set: {
              mutationOptions: (opts?: { onSuccess?: () => void }) => ({
                mutationFn: mockMutateAsync,
                onSuccess: opts?.onSuccess,
              }),
            },
          },
        },
      },
    }),
  };
});

// Mock @tanstack/react-query to control loading/error/data states
let mockQueryData: unknown = undefined;
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');

  return {
    ...actual,
    useQuery: () => ({
      data: mockIsLoading ? undefined : mockQueryData,
      isLoading: mockIsLoading,
      isError: mockIsError,
      error: mockIsError ? new Error('Fetch failed') : null,
    }),
    useMutation: (opts: { mutationFn: unknown; onSuccess?: () => void }) => ({
      mutateAsync: async (...args: unknown[]) => {
        const result = await (opts.mutationFn as (...a: unknown[]) => unknown)(
          ...args
        );
        opts.onSuccess?.();

        return result;
      },
      isPending: false,
    }),
  };
});

// Mock useWorkflows
vi.mock('@/components/notification-settings-modal/util', () => ({
  useWorkflows: () => [
    { key: 'action-insert', label: 'Action new', category: 'actions' },
    { key: 'action-update', label: 'Action updated', category: 'actions' },
    { key: 'control-insert', label: 'Control new', category: 'controls' },
  ],
}));

// Mock permission check — default to allowing save
vi.mock('src/rbac/useHasPermission', () => ({
  useHasPermissionQuery: () => ({ hasPermission: true, loading: false }),
}));

const samplePreferenceSet = {
  channel_types: { email: true, in_app_feed: true, chat: true },
  workflows: {
    'action-insert': {
      enforced: true,
      channel_types: { email: true, in_app_feed: true, chat: false },
    },
    'action-update': {
      enforced: false,
      channel_types: { email: false, in_app_feed: true, chat: false },
    },
    'control-insert': {
      enforced: false,
      channel_types: { email: true, in_app_feed: false, chat: true },
    },
  },
  categories: {
    actions: {
      enforced: true,
      channel_types: { email: true, in_app_feed: true },
    },
    controls: {
      enforced: false,
      channel_types: { email: true, in_app_feed: false },
    },
  },
};

const renderModal = () => {
  const onClose = vi.fn();

  return {
    onClose,
    ...render(<TenantNotificationPreferencesModal onClose={onClose} />, {
      wrapper: getWrapper([], 'router', 'i18n', 'notification'),
    }),
  };
};

describe('TenantNotificationPreferencesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockIsError = false;
    mockQueryData = samplePreferenceSet;
  });

  it('renders loading spinner while fetching', () => {
    mockIsLoading = true;
    mockQueryData = undefined;
    renderModal();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders error alert on fetch failure', () => {
    mockIsError = true;
    renderModal();

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('renders workflow rows grouped by category', () => {
    renderModal();

    expect(screen.getByText('Action new')).toBeInTheDocument();
    expect(screen.getByText('Action updated')).toBeInTheDocument();
    expect(screen.getByText('Control new')).toBeInTheDocument();
  });

  it('toggle click updates enabled state', async () => {
    renderModal();
    const user = userEvent.setup();

    // Find the "Action updated" row — its email is currently disabled
    const actionUpdateRow = screen.getByTestId('workflow-row-action-update');
    const emailToggleContainer =
      within(actionUpdateRow).getByTestId('toggle-email');

    const switchEl = within(emailToggleContainer).getByRole('switch');

    expect(switchEl).toHaveAttribute('data-unchecked', '');

    await user.click(switchEl);

    // Re-query after state update
    const updatedRow = screen.getByTestId('workflow-row-action-update');
    const updatedToggle = within(updatedRow).getByTestId('toggle-email');
    const updatedSwitch = within(updatedToggle).getByRole('switch');

    expect(updatedSwitch).toHaveAttribute('data-checked', '');
  });

  it('lock click updates enforced state at workflow level', async () => {
    renderModal();
    const user = userEvent.setup();

    // Find the "Action updated" row — not enforced
    const actionUpdateRow = screen.getByTestId('workflow-row-action-update');
    const lockButton = within(actionUpdateRow).getByTestId('lock-button');

    expect(lockButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(lockButton);

    // After clicking, should be locked
    expect(lockButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('enforced workflow disables all channel toggles', () => {
    renderModal();

    // "action-insert" is enforced (enforced: true in sample data)
    const enforcedRow = screen.getByTestId('workflow-row-action-insert');

    // All channel toggles in this row should be disabled
    for (const channel of ENABLED_CHANNELS) {
      const toggleContainer = within(enforcedRow).getByTestId(
        `toggle-${channel}`
      );
      const switchEl = within(toggleContainer).getByRole('switch');
      expect(switchEl).toHaveAttribute('data-disabled', '');
    }
  });

  it('category rows are read-only (clicks ignored)', async () => {
    renderModal();
    const user = userEvent.setup();

    const actionsHeader = screen.getByTestId('category-row-actions');
    const categoryToggle = within(actionsHeader).queryByTestId('toggle-email');

    // Category rows should not have interactive toggles
    if (categoryToggle) {
      const switchBefore = within(categoryToggle).getByRole('switch');
      const wasChecked = switchBefore.hasAttribute('data-checked');
      await user.click(categoryToggle);
      const switchAfter = within(categoryToggle).getByRole('switch');
      expect(switchAfter.hasAttribute('data-checked')).toBe(wasChecked);
    }
  });

  it('save button triggers confirmation dialog', async () => {
    renderModal();
    const user = userEvent.setup();

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Confirmation dialog should be visible
    expect(
      screen.getByText(/these changes will affect notification defaults/i)
    ).toBeInTheDocument();
  });

  it('confirming save calls tRPC mutation with correct payload', async () => {
    renderModal();
    const user = userEvent.setup();

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Click confirm in the dialog
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockMutateAsync).toHaveBeenCalled();
    const calledPayload = mockMutateAsync.mock.calls[0][0];
    expect(calledPayload).toHaveProperty('preferences');
    expect(calledPayload.preferences).toHaveProperty('workflows');
    expect(calledPayload.preferences).toHaveProperty('categories');
  });

  it('cancelling confirmation does not save', async () => {
    renderModal();
    const user = userEvent.setup();

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // The confirm modal has both Confirm and Cancel buttons.
    // Get all cancel buttons and pick the one inside the confirm dialog.
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    // The last Cancel button is in the confirm dialog
    await user.click(cancelButtons[cancelButtons.length - 1]);

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('modal closes on dismiss', async () => {
    const { onClose } = renderModal();
    const user = userEvent.setup();

    // The atomic-ui Dialog has a close button with aria-label="Close"
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
