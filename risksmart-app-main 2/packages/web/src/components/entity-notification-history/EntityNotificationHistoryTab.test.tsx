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

import EntityNotificationHistoryTab from './EntityNotificationHistoryTab';

vi.mock('@/hooks/useOrgScopedLocalStorage', () => ({
  useOrgScopedLocalStorage: (initialValue: unknown) => useState(initialValue),
}));

const mockItems: KnockMessage[] = [];
const mockUseNotificationHistory = vi.fn();

vi.mock('@/hooks/notifications/useNotificationHistory', () => ({
  computeDateRange: (preset: string) => ({
    preset,
    insertedAtGt: '',
    insertedAtLt: '',
  }),
  useNotificationHistory: (...args: unknown[]) =>
    mockUseNotificationHistory(...args),
}));

const buildMessage = (overrides: Partial<KnockMessage> = {}): KnockMessage => ({
  id: 'msg-1',
  channel_id: 'email',
  recipient: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  workflow: 'risk-insert',
  tenant: 'tenant-1',
  status: 'delivered',
  engagement_statuses: ['seen'],
  inserted_at: '2025-01-15T10:30:00.000Z',
  updated_at: '2025-01-15T10:30:00.000Z',
  seen_at: '2025-01-15T11:00:00.000Z',
  read_at: null,
  interacted_at: null,
  archived_at: null,
  source: { key: 'risk-insert', version_id: 'v1' },
  data: { objectId: 'risk-123' },
  ...overrides,
});

const createRender = (objectId = 'test-object-id') => {
  return render(<EntityNotificationHistoryTab objectId={objectId} />, {
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

describe('EntityNotificationHistoryTab', () => {
  beforeEach(() => {
    mockItems.length = 0;
    mockUseNotificationHistory.mockImplementation(() => ({
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
      })),
      isLoading: false,
      isFetchingMore: false,
      isComplete: true,
      totalLoaded: mockItems.length,
      filters: {
        dateRange: {
          preset: 'last24h' as const,
          insertedAtGt: '2025-01-14T00:00:00.000Z',
          insertedAtLt: '2025-01-21T00:00:00.000Z',
        },
      },
      updateDateRange: vi.fn(),
    }));
  });

  it('renders the tab header', async () => {
    createRender();
    await waitFor(() => {
      expect(screen.getByText('Notification History')).toBeInTheDocument();
    });
  });

  it('passes objectId to useNotificationHistory', async () => {
    createRender('my-object-uuid');
    await waitFor(() => {
      expect(screen.getByText('Notification History')).toBeInTheDocument();
    });
    expect(mockUseNotificationHistory).toHaveBeenCalledWith({
      objectId: 'my-object-uuid',
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

  it('renders notification items', async () => {
    mockItems.push(buildMessage());
    createRender();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });

  it('renders date range selector with selected label', async () => {
    createRender();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Date range' })
      ).toBeInTheDocument();
      expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
    });
  });
});
