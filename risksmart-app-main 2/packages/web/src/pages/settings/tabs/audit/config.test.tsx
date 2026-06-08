import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAuditLogsResponse } from 'src/testing/mock-data/mockedGetAuditLogsResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import {
  getDisplayOptionsText,
  getEmptyCollectionSlotText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';

import { defaultMocks } from '../../../../testing/mock-data';
import type { Providers } from '../../../../testing/wrapper';
import { getWrapper } from '../../../../testing/wrapper';
import type { AuditLogRegisterFields } from './config';
import { useGetAuditTableProps } from './config';
import type { AuditEntityRetrieverInput } from './types';
describe('audit config', () => {
  const TestHarness: FC<{ records: AuditLogRegisterFields[] }> = () => {
    const mockClick = (_: AuditEntityRetrieverInput) => {
      return;
    };
    const tableProps = useGetAuditTableProps(mockClick);

    return <Table {...tableProps} />;
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const testMocks = [
    ...defaultMocks,
    mockedGetAuditLogsResponse(),
    mockedGetOrganisation(),
  ];

  describe('useGetAuditTableProps', () => {
    it('should display 6 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(6);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Type',
        'Action',
        'Item',
        'ID',
        'Performed by',
        'Date / time',
      ]);
    });

    it('should have the option to display 6 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(
          testMocks,
          'graphql',
          'router',
          'permission',
          'features',
          'trpc',
          'notification'
        ),
      });
      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findCollectionPreferences()
      );
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(6);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Type',
        'Action',
        'Item',
        'ID',
        'Performed by',
        'Date / time',
      ]);
    });

    it('should display correct empty collection text', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitFor(
        () => {
          expect(getEmptyCollectionSlotText(container, 0)).toEqual(
            'No Audit Logs'
          );
          expect(getEmptyCollectionSlotText(container, 1)).toEqual(
            'No audit logs to display.'
          );
        },
        { timeout: 5000 }
      );
    });
  });
});
