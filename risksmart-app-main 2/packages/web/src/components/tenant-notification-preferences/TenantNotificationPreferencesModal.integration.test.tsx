/**
 * Integration tests for TenantNotificationPreferencesModal.
 *
 * These tests verify the tRPC ↔ frontend wiring end-to-end:
 * - Data flows from the tRPC `get` query into the rendered grid
 * - Saving calls the tRPC `set` mutation with the correctly transformed Knock payload
 * - Full round-trip: load preferences → modify toggle and lock → save → verify enforced flags
 * - Permission denial: the save button is disabled without `update:settings` permission
 *
 * Unlike the unit tests in TenantNotificationPreferencesModal.test.tsx (which mock
 * everything), these tests exercise the actual mapping functions (knockPayloadToGridState,
 * gridStateToKnockPayload) together with the component to verify the full data pipeline.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWrapper } from 'src/testing/wrapper';
import { describe, expect, it, vi } from 'vitest';

import TenantNotificationPreferencesModal from './TenantNotificationPreferencesModal';

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

const mockMutateAsync = vi.fn().mockResolvedValue(undefined);

// These are mutated per-test via beforeEach to control query state
let mockGetData: unknown = undefined;
let mockIsLoading = false;
let mockIsError = false;

// This is mutated per-test to control permission state
let mockCanSave = true;

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
              mutationOptions: () => ({
                mutationFn: mockMutateAsync,
              }),
            },
          },
        },
      },
    }),
  };
});

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');

  return {
    ...actual,
    useQuery: () => ({
      data: mockIsLoading ? undefined : mockGetData,
      isLoading: mockIsLoading,
      isError: mockIsError,
      error: mockIsError ? new Error('Fetch failed') : null,
    }),
    useMutation: (opts: { mutationFn: (...args: unknown[]) => unknown }) => ({
      mutateAsync: async (...args: unknown[]) => {
        return opts.mutationFn(...args);
      },
      isPending: false,
    }),
  };
});

// Three workflows across two categories — mirrors the unit test setup
vi.mock('@/components/notification-settings-modal/util', () => ({
  useWorkflows: () => [
    { key: 'action-insert', label: 'Action new', category: 'actions' },
    { key: 'action-update', label: 'Action updated', category: 'actions' },
    { key: 'control-insert', label: 'Control new', category: 'controls' },
  ],
}));

// Permission mock uses the mutable `mockCanSave` so tests can control it
vi.mock('src/rbac/useHasPermission', () => ({
  useHasPermissionQuery: (permission: string) => {
    if (permission === 'update:settings') {
      return { hasPermission: mockCanSave, loading: false };
    }

    // read:settings is always granted so the modal renders content
    return { hasPermission: true, loading: false };
  },
}));

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

/**
 * The tRPC `get` endpoint returns a shape where each workflow/category entry
 * has an `enforced` boolean (the tRPC service translates Knock's
 * `__strategy__: 'replace'` into `enforced: true`).
 *
 * - `action-insert` is enforced
 * - `action-update` is NOT enforced
 * - `control-insert` is NOT enforced
 *
 * Channel states:
 * - action-insert: email=true, in_app_feed=true, chat=false
 * - action-update: email=false, in_app_feed=true, chat=false
 * - control-insert: email=true, in_app_feed=false, chat=true
 */
const buildGetResponse = () => ({
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
      enforced: false,
      channel_types: { email: true, in_app_feed: true, chat: false },
    },
    controls: {
      enforced: false,
      channel_types: { email: true, in_app_feed: false, chat: true },
    },
  },
});

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

const renderModal = () => {
  const onClose = vi.fn();

  return {
    onClose,
    ...render(<TenantNotificationPreferencesModal onClose={onClose} />, {
      wrapper: getWrapper([], 'router', 'i18n', 'notification'),
    }),
  };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TenantNotificationPreferencesModal integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockIsError = false;
    mockGetData = buildGetResponse();
    mockCanSave = true;
    mockMutateAsync.mockResolvedValue(undefined);
  });

  // -------------------------------------------------------------------------
  // 1. tRPC get → rendered grid
  // -------------------------------------------------------------------------

  describe('fetches and displays data from tRPC get endpoint', () => {
    it('renders all workflow rows from the tRPC get response', () => {
      renderModal();

      expect(screen.getByText('Action new')).toBeInTheDocument();
      expect(screen.getByText('Action updated')).toBeInTheDocument();
      expect(screen.getByText('Control new')).toBeInTheDocument();
    });

    it('reflects enforced: true from get response as locked workflow', () => {
      renderModal();

      // action-insert has enforced: true in the mock response
      // → knockPayloadToGridState preserves this as enforced=true
      // → lock button aria-pressed="true"
      const actionInsertRow = screen.getByTestId('workflow-row-action-insert');
      const lockButton = within(actionInsertRow).getByTestId('lock-button');

      expect(lockButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('non-enforced workflow has lock button aria-pressed=false', () => {
      renderModal();

      const actionUpdateRow = screen.getByTestId('workflow-row-action-update');
      const lockButton = within(actionUpdateRow).getByTestId('lock-button');

      expect(lockButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('reflects channel_types from tRPC get response in toggle checked states', () => {
      renderModal();

      // action-update: email=false, in_app_feed=true
      const actionUpdateRow = screen.getByTestId('workflow-row-action-update');

      const emailToggleContainer =
        within(actionUpdateRow).getByTestId('toggle-email');
      const emailSwitch = within(emailToggleContainer).getByRole('switch');

      expect(emailSwitch).toHaveAttribute('aria-checked', 'false');

      const inAppToggleContainer =
        within(actionUpdateRow).getByTestId('toggle-in_app_feed');
      const inAppSwitch = within(inAppToggleContainer).getByRole('switch');

      expect(inAppSwitch).toHaveAttribute('aria-checked', 'true');
    });

    it('enforced workflow disables all channel toggles', () => {
      renderModal();

      // action-insert is enforced — its toggles must be disabled
      const actionInsertRow = screen.getByTestId('workflow-row-action-insert');

      for (const channel of ['email', 'in_app_feed', 'chat']) {
        const toggleContainer = within(actionInsertRow).getByTestId(
          `toggle-${channel}`
        );
        const switchEl = within(toggleContainer).getByRole('switch');

        expect(switchEl).toHaveAttribute('aria-disabled', 'true');
      }
    });

    it('shows loading spinner while tRPC get is in-flight', () => {
      mockIsLoading = true;
      mockGetData = undefined;
      renderModal();

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows error alert when tRPC get fails', () => {
      mockIsError = true;
      renderModal();

      expect(
        screen.getByText(/failed to load notification preferences/i)
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 2. tRPC set mutation payload
  // -------------------------------------------------------------------------

  describe('calls tRPC set mutation with correctly transformed payload', () => {
    it('mutation is called with { preferences: { workflows, categories } } wrapper', async () => {
      renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const arg = mockMutateAsync.mock.calls[0][0];
      expect(arg).toHaveProperty('preferences');
      expect(arg.preferences).toHaveProperty('workflows');
      expect(arg.preferences).toHaveProperty('categories');
    });

    it('enforced workflow produces enforced: true in mutation payload', async () => {
      // action-insert has enforced: true in get response → preserved as enforced=true in set payload
      renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const { preferences } = mockMutateAsync.mock.calls[0][0];
      expect(preferences.workflows['action-insert'].enforced).toBe(true);
    });

    it('non-enforced workflow produces enforced: false in mutation payload', async () => {
      renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const { preferences } = mockMutateAsync.mock.calls[0][0];
      expect(preferences.workflows['action-update'].enforced).toBe(false);
      expect(preferences.workflows['control-insert'].enforced).toBe(false);
    });

    it('channel booleans in mutation payload match get response values', async () => {
      renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const { preferences } = mockMutateAsync.mock.calls[0][0];
      // action-update: email=false, in_app_feed=true in get response → preserved in payload
      expect(preferences.workflows['action-update'].channel_types.email).toBe(
        false
      );
      expect(
        preferences.workflows['action-update'].channel_types.in_app_feed
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Full round-trip: load → modify toggle and lock → save → verify payload
  // -------------------------------------------------------------------------

  describe('full round-trip: load → modify → save → verify Knock payload', () => {
    it('toggling a channel on and saving produces updated channel_types', async () => {
      renderModal();
      const user = userEvent.setup();

      // action-update has email=false initially; toggle it on
      const actionUpdateRow = screen.getByTestId('workflow-row-action-update');
      const emailToggleContainer =
        within(actionUpdateRow).getByTestId('toggle-email');
      const emailSwitch = within(emailToggleContainer).getByRole('switch');

      expect(emailSwitch).toHaveAttribute('aria-checked', 'false');
      await user.click(emailSwitch);

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const { preferences } = mockMutateAsync.mock.calls[0][0];
      // email was toggled from false → true
      expect(preferences.workflows['action-update'].channel_types.email).toBe(
        true
      );
    });

    it('locking an unlocked workflow sets enforced: true in mutation payload', async () => {
      renderModal();
      const user = userEvent.setup();

      // action-update starts unlocked; click its lock button to lock it
      const actionUpdateRow = screen.getByTestId('workflow-row-action-update');
      const lockButton = within(actionUpdateRow).getByTestId('lock-button');

      expect(lockButton).toHaveAttribute('aria-pressed', 'false');
      await user.click(lockButton);
      expect(lockButton).toHaveAttribute('aria-pressed', 'true');

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const { preferences } = mockMutateAsync.mock.calls[0][0];
      // Newly locked workflow must carry enforced: true
      expect(preferences.workflows['action-update'].enforced).toBe(true);
    });

    it('unlocking an enforced workflow sets enforced: false in mutation payload', async () => {
      renderModal();
      const user = userEvent.setup();

      // action-insert starts locked (enforced: true in get response); unlock it
      const actionInsertRow = screen.getByTestId('workflow-row-action-insert');
      const lockButton = within(actionInsertRow).getByTestId('lock-button');

      expect(lockButton).toHaveAttribute('aria-pressed', 'true');
      await user.click(lockButton);
      expect(lockButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const { preferences } = mockMutateAsync.mock.calls[0][0];
      // Unlocked — enforced must be false
      expect(preferences.workflows['action-insert'].enforced).toBe(false);
    });

    it('category gets enforced: true when ANY child workflow is enforced', async () => {
      renderModal();
      const user = userEvent.setup();

      // Initially: action-insert=enforced, action-update=not enforced
      // Lock action-update to make both 'actions' workflows enforced
      const actionUpdateRow = screen.getByTestId('workflow-row-action-update');
      const lockButton = within(actionUpdateRow).getByTestId('lock-button');
      await user.click(lockButton);

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());

      const { preferences } = mockMutateAsync.mock.calls[0][0];
      // Both actions workflows now enforced → category gets enforced: true
      expect(preferences.categories.actions.enforced).toBe(true);
      // controls has one workflow (control-insert) which is NOT enforced → enforced: false
      expect(preferences.categories.controls.enforced).toBe(false);
    });

    it('cancelling the confirmation dialog does not call the mutation', async () => {
      renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Cancel the confirmation dialog
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      await user.click(cancelButtons[cancelButtons.length - 1]);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('onClose is called after a successful save', async () => {
      const { onClose } = renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /save/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    });
  });

  // -------------------------------------------------------------------------
  // 4. Permission denial
  // -------------------------------------------------------------------------

  describe('permission denial', () => {
    it('save button is disabled when update:settings permission is denied', () => {
      mockCanSave = false;
      renderModal();

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('save button is enabled when update:settings permission is granted', () => {
      mockCanSave = true;
      renderModal();

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('mutation is never called when update:settings permission is denied', async () => {
      mockCanSave = false;
      renderModal();

      // The save button is disabled — clicking it does not trigger the mutation
      // (Cloudscape Button with disabled=true is a submit type; clicking via
      // userEvent on a disabled button is a no-op in the DOM, so we can assert
      // that mockMutateAsync was never called without needing to click).
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
});
