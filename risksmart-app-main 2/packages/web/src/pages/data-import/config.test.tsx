import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { DataImportFields } from './types';

describe('data import config', () => {
  const TestHarness: FC<{ records: DataImportFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const defaultDataImport: DataImportFields = {
    Id: 'b29296c4-faf8-4393-830f-72074afae61b',
    Status: 'notstarted',
    CreatedAtTimestamp: '2021-02-01T00:00:00Z',
    ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
    createdByUser: {
      FriendlyName: 'Created by username',
    },
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'trpc',
    'router',
    'features',
  ];

  const testMocks = [
    ...defaultMocks,
    mockedGetUserTablePreferences('dataImportRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 4 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(4);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Guid',
        'Status',
        'Created on',
        'Created by',
      ]);
    });

    it('should render a row of data', async () => {
      const { container } = render(
        <TestHarness records={[defaultDataImport]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(4);

      expect(getCellText(container, 'Guid', 1)).toEqual(
        'b29296c4-faf8-4393-830f-72074afae61b'
      );
      expect(getCellText(container, 'Status', 1)).toEqual('Not started');
      expect(getCellText(container, 'Created on', 1)).toEqual('1 Feb 2021');
      expect(getCellText(container, 'Created by', 1)).toEqual(
        'Created by username'
      );
    });

    it('should have the option to display 7 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(7);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Guid',
        'Status',
        'Created on',
        'Updated on',
        'Updated by ID',
        'Updated by',
        'Created by',
      ]);
    });

    it('should support export in correct format', async () => {
      const { result } = renderHook(
        () => useGetCollectionTableProps([{ ...defaultDataImport }]),
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() => {
        expect(result.current.exportToCsvString).toBeDefined();
      });
      const csv = result.current.exportToCsvString();
      expect(csv).toEqual(
        '"Guid","Status","Created on","Created by"\r\n' +
          '"b29296c4-faf8-4393-830f-72074afae61b","Not started","01/02/2021 00:00","Created by username"'
      );
    });
  });
});
