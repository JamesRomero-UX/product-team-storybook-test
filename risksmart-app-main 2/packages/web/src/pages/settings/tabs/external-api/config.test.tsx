import Table from '@risk-smart/themed-cloudscape-components/table';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  getRowCount,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { describe, expect, it } from 'vitest';

import type { ExternalApiClientTableFields } from './config';
import { useGetCollectionTableProps } from './config';

// ============================================================================
// Common Mock Data
// ============================================================================

const createMockApiClient = (
  overrides: Partial<ExternalApiClientTableFields> = {}
): ExternalApiClientTableFields => ({
  clientId: 'client-key-123',
  name: 'Test Client',
  createdAt: '2024-01-15T10:00:00.000Z',
  createdBy: 'user-123',
  scopes: ['risks:read', 'controls:write'],
  status: 'active',
  apiVersion: 'v1',
  ...overrides,
});

// ============================================================================
// Test Helpers
// ============================================================================

const TestHarness: FC<{ records: ExternalApiClientTableFields[] }> = ({
  records,
}) => {
  const tableProps = useGetCollectionTableProps(records);

  return <Table {...tableProps} />;
};

const providers: Providers[] = [
  'permission',
  'graphql',
  'router',
  'features',
  'trpc',
];

const tableMocks = [
  ...defaultMocks,
  mockedGetUserTablePreferences('externalApiClientsRegister'),
];

// ============================================================================
// Tests
// ============================================================================

describe('External API config', () => {
  describe('useGetCollectionTableProps', () => {
    describe('Column Configuration', () => {
      it('should display 4 columns by default', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        const headers = createWrapper(container)
          .findTable()
          ?.findColumnHeaders();
        expect(headers?.length).toEqual(4);
      });

      it('should display correct column headers', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        const headersText = getHeadersText(container);
        expect(headersText).toEqual([
          'Name',
          'Client Key',
          'API Version',
          'Status',
        ]);
      });

      it('should have the option to display 5 fields', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        openPreferencesModals(container);

        const options = createWrapper(container)
          .findTable()
          ?.findCollectionPreferences()
          ?.findModal()
          ?.findContentDisplayPreference()
          ?.findOptions();
        expect(options?.length).toEqual(5);
      });

      it('should display all available field labels in preferences', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        openPreferencesModals(container);

        const displayOptionLabels = getDisplayOptionsText(container);
        expect(displayOptionLabels).toEqual([
          'Name',
          'Client Key',
          'API Version',
          'Status',
          'Created on',
        ]);
      });
    });

    describe('Data Display', () => {
      it('should display client data in correct columns', async () => {
        const mockClient = createMockApiClient({
          name: 'My API Client',
          clientId: 'key-abc-123',
          apiVersion: 'v2',
          status: 'active',
        });

        const { container } = render(<TestHarness records={[mockClient]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        expect(getCellText(container, 'Name', 1)).toBe('My API Client');
        expect(getCellText(container, 'Client Key', 1)).toBe('key-abc-123');
        expect(getCellText(container, 'API Version', 1)).toBe('v2');
        expect(getCellText(container, 'Status', 1)).toBe('active');
      });

      it('should display multiple records', async () => {
        const mockClients = [
          createMockApiClient({ clientId: 'client-1', name: 'Client A' }),
          createMockApiClient({ clientId: 'client-2', name: 'Client B' }),
          createMockApiClient({ clientId: 'client-3', name: 'Client C' }),
        ];

        const { container } = render(<TestHarness records={mockClients} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        expect(getRowCount(container)).toBe(3);
        expect(getCellText(container, 'Name', 1)).toBe('Client A');
        expect(getCellText(container, 'Name', 2)).toBe('Client B');
        expect(getCellText(container, 'Name', 3)).toBe('Client C');
      });

      it('should handle empty records array', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        expect(getRowCount(container)).toBe(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle client with empty scopes array', async () => {
        const mockClient = createMockApiClient({
          scopes: [],
        });

        const { container } = render(<TestHarness records={[mockClient]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        expect(getRowCount(container)).toBe(1);
        expect(getCellText(container, 'Name', 1)).toBe('Test Client');
      });

      it('should handle client with inactive status', async () => {
        const mockClient = createMockApiClient({
          status: 'inactive',
        });

        const { container } = render(<TestHarness records={[mockClient]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        expect(getCellText(container, 'Status', 1)).toBe('inactive');
      });

      it('should preserve all client properties when mapping', async () => {
        const mockClient = createMockApiClient({
          clientId: 'test-id',
          name: 'Test Name',
          createdAt: '2024-06-20T15:30:00.000Z',
          createdBy: 'test-user',
          scopes: ['scope1', 'scope2'],
          status: 'active',
          apiVersion: 'v3',
        });

        const { container } = render(<TestHarness records={[mockClient]} />, {
          wrapper: getWrapper(tableMocks, ...providers),
        });
        await waitForTableHeaders(container);

        expect(getCellText(container, 'Name', 1)).toBe('Test Name');
        expect(getCellText(container, 'Client Key', 1)).toBe('test-id');
        expect(getCellText(container, 'API Version', 1)).toBe('v3');
        expect(getCellText(container, 'Status', 1)).toBe('active');
      });
    });
  });
});
