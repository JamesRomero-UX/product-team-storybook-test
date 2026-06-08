import type { KnockMessage } from '@risksmart-app/trpc/src/routers/frontend/notifications/types/history';
import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { resolveNotificationUrl } from '@/utils/notificationUrlResolver';

import NotificationsTab from './Tab';

// Mock useOrgScopedLocalStorage to avoid happy-dom localStorage issues
vi.mock('@/hooks/useOrgScopedLocalStorage', () => ({
  useOrgScopedLocalStorage: (initialValue: unknown) => useState(initialValue),
}));

// Mock the hook
const mockItems: KnockMessage[] = [];

const mockState = {
  isFetchingMore: false,
  isComplete: true,
  totalLoaded: 0,
};

vi.mock('@/hooks/notifications/useNotificationHistory', () => ({
  computeDateRange: (preset: string) => ({
    preset,
    insertedAtGt: '',
    insertedAtLt: '',
  }),
  useNotificationHistory: () => ({
    items: mockItems.map((item) => ({
      ...item,
      recipientName:
        typeof item.recipient === 'object'
          ? ((item.recipient as { name?: string }).name ??
            (item.recipient as { email?: string }).email ??
            '')
          : item.recipient,
      recipientEmail:
        typeof item.recipient === 'object'
          ? ((item.recipient as { email?: string }).email ?? '')
          : '',
      objectTypeLabel: 'Risk',
      workflowLabel: 'New Risk',
      deliveryStatus: item.status,
      engagementStatuses: item.engagement_statuses,
      insertedAt: item.inserted_at,
      link:
        resolveNotificationUrl(
          item.source?.key || item.workflow || '',
          (item.data as Record<string, unknown>) ?? {}
        ) ?? undefined,
    })),
    isLoading: false,
    isFetchingMore: mockState.isFetchingMore,
    isComplete: mockState.isComplete,
    totalLoaded: mockState.totalLoaded,
    filters: {
      dateRange: {
        preset: 'last24h' as const,
        insertedAtGt: '2025-01-14T00:00:00.000Z',
        insertedAtLt: '2025-01-21T00:00:00.000Z',
      },
    },
    updateDateRange: vi.fn(),
  }),
}));

const buildMessage = (overrides: Partial<KnockMessage> = {}): KnockMessage => ({
  id: 'msg-1',
  channel_id: 'email',
  recipient: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  workflow: 'risk-insert',
  tenant: 'tenant-1',
  status: 'delivered',
  engagement_statuses: ['seen', 'read'],
  inserted_at: '2025-01-15T10:30:00.000Z',
  updated_at: '2025-01-15T10:30:00.000Z',
  seen_at: '2025-01-15T11:00:00.000Z',
  read_at: '2025-01-15T11:30:00.000Z',
  interacted_at: null,
  archived_at: null,
  source: { key: 'risk-insert', version_id: 'v1' },
  data: { objectId: 'risk-123', objectTitle: 'Test Risk' },
  ...overrides,
});

const createRender = () => {
  return render(<NotificationsTab />, {
    wrapper: getWrapper(
      [
        mockedGetOrganisation(),
        mockedGetOrganisationModuleResponse(),
        mockedRoleAccessResponse({ role_access: [] }),
        mockedUsersResponse(),
        mockedDepartmentsResponse,
        mockedGetUserTablePreferences('notificationHistory'),
      ],
      'permission',
      'graphql',
      'router',
      'features',
      'trpc'
    ),
  });
};

describe('NotificationsTab', () => {
  beforeEach(() => {
    mockItems.length = 0;
    mockState.isFetchingMore = false;
    mockState.isComplete = true;
    mockState.totalLoaded = 0;
  });

  it('renders the tab header', async () => {
    createRender();
    await waitFor(() => {
      expect(screen.getByText('Notification History')).toBeInTheDocument();
    });
  });

  it('renders empty state when no items', async () => {
    createRender();
    await waitFor(() => {
      expect(
        screen.getByText('No notifications found for the selected filters.')
      ).toBeInTheDocument();
    });
  });

  it('renders notification items with columns', async () => {
    mockItems.push(buildMessage());
    mockState.totalLoaded = 1;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Risk')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });

  it('does not render Previous/Next pagination buttons', async () => {
    createRender();
    await waitFor(() => {
      expect(screen.getByText('Notification History')).toBeInTheDocument();
    });
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('renders counter from items.length', async () => {
    mockItems.push(buildMessage());
    mockState.totalLoaded = 1;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('(1)')).toBeInTheDocument();
    });
  });

  it('renders counter with multiple items', async () => {
    mockItems.push(
      buildMessage({ id: 'msg-1' }),
      buildMessage({ id: 'msg-2' }),
      buildMessage({ id: 'msg-3' })
    );
    mockState.totalLoaded = 3;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('(3)')).toBeInTheDocument();
    });
  });

  it('renders date range selector', async () => {
    createRender();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Date range' })
      ).toBeInTheDocument();
    });
  });

  it('renders recipient fallback to email when name is missing', async () => {
    mockItems.push(
      buildMessage({
        recipient: { id: 'user-2', email: 'fallback@example.com' },
      })
    );
    mockState.totalLoaded = 1;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('fallback@example.com')).toBeInTheDocument();
    });
  });

  it('renders View link when deep link URL resolves', async () => {
    mockItems.push(
      buildMessage({
        source: { key: 'risk-insert', version_id: 'v1' },
        data: { objectId: 'risk-abc' },
      })
    );
    mockState.totalLoaded = 1;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('View')).toBeInTheDocument();
    });
  });

  it('does not render View link when deep link URL returns null', async () => {
    mockItems.push(
      buildMessage({
        source: { key: 'digest', version_id: 'v1' },
        data: {},
      })
    );
    mockState.totalLoaded = 1;
    createRender();
    await waitFor(() => {
      expect(screen.queryByText('View')).not.toBeInTheDocument();
    });
  });

  it('renders export button', async () => {
    createRender();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Export' })
      ).toBeInTheDocument();
    });
  });

  it('renders engagement statuses as comma-separated list', async () => {
    mockItems.push(
      buildMessage({
        engagement_statuses: ['seen', 'read'],
      })
    );
    mockState.totalLoaded = 1;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('Seen, Read')).toBeInTheDocument();
    });
  });

  it('renders counter with ellipsis while fetching more', async () => {
    mockItems.push(buildMessage({ id: 'msg-1' }));
    mockState.isFetchingMore = true;
    mockState.isComplete = false;
    mockState.totalLoaded = 500;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('(500...)')).toBeInTheDocument();
    });
  });

  it('shows loading state on date range button while fetching more', async () => {
    mockItems.push(buildMessage({ id: 'msg-1' }));
    mockState.isFetchingMore = true;
    mockState.isComplete = false;
    mockState.totalLoaded = 500;
    createRender();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Date range' })
      ).toBeInTheDocument();
    });
  });

  it('renders counter without ellipsis when complete', async () => {
    mockItems.push(buildMessage({ id: 'msg-1' }));
    mockState.isFetchingMore = false;
    mockState.isComplete = true;
    mockState.totalLoaded = 1;
    createRender();
    await waitFor(() => {
      expect(screen.getByText('(1)')).toBeInTheDocument();
    });
  });

  it('renders limit reached text when cap hit', async () => {
    mockState.isFetchingMore = false;
    mockState.isComplete = true;
    mockState.totalLoaded = 10000;
    mockItems.push(buildMessage({ id: 'msg-1' }));
    createRender();
    await waitFor(() => {
      expect(screen.getByText('(10,000 - limit reached)')).toBeInTheDocument();
    });
  });

  it('renders selected date range label', async () => {
    createRender();
    await waitFor(() => {
      expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
    });
  });
});
